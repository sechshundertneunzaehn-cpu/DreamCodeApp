#!/usr/bin/env python3
"""
Pilot: Übersetzt die ersten 50 Symbole aus top200_symbols.json nach EN + AR
via Gemini 2.5 Flash. Danach STOPP — Quality-Gate für User.

Reads:
  data/top200_symbols.json       (Ranking)
  data/traumsymbole.v3.json      (Interpretationstexte)
  .env                            (GEMINI_API_KEY)

Writes:
  data/translations_pilot.json   (Cache {id: {de, en, ar}})
  data/translation_pilot.log     (Call-Log, Tokens, Kosten)
  data/translation_pilot_report.md (Abschlussbericht)

Hard Cost Caps:
  MAX_API_CALLS_PILOT = 60
  MAX_TOTAL_TOKENS_PILOT = 200_000
  per-call cap: 10000 tokens → skip statt abbrechen

Length-Anomaly Flag:
  AR-Länge > 1.7×DE oder < 0.5×DE → Flag im Log
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
ENV_FILE = ROOT / ".env"

SRC_V3 = DATA / "traumsymbole.v3.json"
SRC_TOP = DATA / "top200_symbols.json"
OUT_CACHE = DATA / "translations_pilot.json"
OUT_LOG = DATA / "translation_pilot.log"
OUT_REPORT = DATA / "translation_pilot_report.md"

PILOT_SIZE = 50
MAX_API_CALLS_PILOT = 60
MAX_TOTAL_TOKENS_PILOT = 200_000
PER_CALL_TOKEN_CAP = 10_000  # >this → skip, don't abort

MODEL = "gemini-2.5-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

# Pricing (USD / 1M tokens) — gemini-2.5-flash pay-as-you-go (Stand 2026)
PRICE_INPUT_PER_1M = 0.30
PRICE_OUTPUT_PER_1M = 2.50

MIN_INTER_CALL_S = 0.10  # 10 calls/s
RETRY_BACKOFF_S = [2, 5, 10]

LENGTH_UPPER = 1.7
LENGTH_LOWER = 0.5

SAMPLE_IDS_PREFERRED = ["meer", "engel", "hochzeit", "schwangerschaft", "koenig"]


SYSTEM_PROMPT = (
    "Du bist ein professioneller Übersetzer für religiös-traditionelle "
    "Traumdeutungs-Texte. Übersetze den gegebenen deutschen Text wortgetreu nach "
    "Englisch und nach modernem Hocharabisch (MSA, kein Dialekt).\n\n"
    "STRIKTE REGELN:\n"
    "1. Keine Erklärungen, keine Zusammenfassungen, keine eigenen Ergänzungen.\n"
    "2. Religiöse Fachbegriffe im Arabischen im Original belassen: "
    "Allah (الله), Dschinn (جن), Schaytan (شيطان), Quran-Verse wörtlich.\n"
    "3. Klassische Traumdeutungs-Figuren wie Ibn Sirin bleiben namentlich "
    "erhalten (auf Arabisch: ابن سيرين).\n"
    "4. Die Übersetzung muss ungefähr gleich lang sein wie das Original "
    "(±30% Tokens).\n"
    "5. Wenn der Text einen Fachbegriff enthält, den du nicht sicher "
    "übersetzen kannst: Original in Klammern dahinter setzen.\n\n"
    "OUTPUT-FORMAT: Strict JSON {\"en\": \"...\", \"ar\": \"...\"}. "
    "Kein Markdown, kein Fließtext drum herum."
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_env_key() -> str:
    """Read GEMINI_API_KEY from .env without python-dotenv dependency."""
    if not ENV_FILE.exists():
        raise RuntimeError(f".env not found at {ENV_FILE}")
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if line.startswith("GEMINI_API_KEY="):
            v = line.split("=", 1)[1].strip().strip('"').strip("'")
            if v:
                return v
    raise RuntimeError("GEMINI_API_KEY not set in .env")


def extract_de_texts(sym: dict) -> dict:
    """Extract all translatable DE fields from a v3 symbol.
    Returns a flat structured dict matching the translation response format."""
    out: dict = {}
    freud = sym.get("freud") or {}
    if freud.get("vorhanden") and freud.get("interpretation"):
        out["freud"] = freud["interpretation"]
        alt = freud.get("A_alternative_interpretation")
        if alt:
            out["freud_alt"] = alt
    ibn = sym.get("ibn_sirin") or {}
    if ibn.get("vorhanden"):
        deut = ibn.get("deutungen") or []
        if deut:
            out["ibn_sirin"] = list(deut)  # list of strings
        alt = ibn.get("A_alternative_interpretation")
        if alt:
            out["ibn_sirin_alt"] = list(alt) if isinstance(alt, list) else [alt]
    for key, val in (sym.get("additional_sources") or {}).items():
        if isinstance(val, dict) and val.get("text"):
            out[key] = val["text"]
            alt_texts = val.get("A_alternative_texts") or []
            if alt_texts:
                out[f"{key}_alt"] = list(alt_texts)
    return out


def token_count_rough(s) -> int:
    """Rough token count: tokens ≈ chars / 4 für Latein; für Arabisch ≈ chars / 3.
    Nur heuristisch — echte Zählung kommt von Gemini usageMetadata."""
    if isinstance(s, str):
        return max(1, len(s) // 4)
    if isinstance(s, list):
        return sum(token_count_rough(x) for x in s)
    if isinstance(s, dict):
        return sum(token_count_rough(v) + token_count_rough(k) for k, v in s.items())
    return 0


def call_gemini(api_key: str, de_payload: dict, log_handle) -> tuple[dict, dict]:
    """Ein Gemini-Call. Retry bei 429/503. Bei 4xx sofort STOPP.
    Returns (parsed_response_dict, usage_meta)."""
    user_content = (
        "Übersetze die folgenden deutschen Interpretationen nach Englisch und "
        "Arabisch. Erhalte die JSON-Key-Struktur 1:1.\n\n"
        f"Input (DE): {json.dumps(de_payload, ensure_ascii=False)}\n\n"
        "Gib ein JSON-Objekt zurück mit GENAU diesen Top-Level Keys: "
        "\"en\" und \"ar\". Jeder davon enthält die gleiche Struktur wie "
        "Input. Listen bleiben Listen, Strings bleiben Strings."
    )

    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": user_content}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }

    url = f"{GEMINI_URL}?key={api_key}"
    data = json.dumps(body).encode("utf-8")

    last_err = None
    for attempt, backoff in enumerate([0] + RETRY_BACKOFF_S):
        if backoff:
            time.sleep(backoff)
        req = urllib.request.Request(url, data=data, method="POST",
                                     headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                raw = resp.read().decode("utf-8")
                parsed = json.loads(raw)
                break
        except urllib.error.HTTPError as e:
            code = e.code
            body_txt = ""
            try:
                body_txt = e.read().decode("utf-8", errors="replace")[:500]
            except Exception:
                pass
            last_err = f"HTTP {code}: {body_txt}"
            log_handle.write(f"  HTTP {code}: {body_txt[:200]}\n")
            if code in (429, 503):
                log_handle.write(f"  retry attempt {attempt+1}/{len(RETRY_BACKOFF_S)+1}\n")
                continue
            # 4xx auth/validation: stop
            raise RuntimeError(f"Gemini HTTP {code} (no retry): {body_txt[:200]}")
        except urllib.error.URLError as e:
            last_err = f"URLError: {e}"
            log_handle.write(f"  URLError: {e}\n")
            continue
    else:
        raise RuntimeError(f"Gemini failed after retries: {last_err}")

    # Extract text content
    try:
        txt = parsed["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        raise RuntimeError(f"Unexpected Gemini response shape: {json.dumps(parsed)[:300]}") from e

    # Parse JSON in the response text (responseMimeType=application/json)
    try:
        translated = json.loads(txt)
    except json.JSONDecodeError:
        # fallback: strip markdown code fences if any
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", txt.strip(), flags=re.MULTILINE)
        translated = json.loads(cleaned)

    usage = parsed.get("usageMetadata", {}) or {}
    return translated, usage


def text_len(val) -> int:
    """Character length for anomaly detection."""
    if isinstance(val, str):
        return len(val)
    if isinstance(val, list):
        return sum(text_len(x) for x in val)
    if isinstance(val, dict):
        return sum(text_len(v) for v in val.values())
    return 0


def length_anomaly_check(de: dict, ar: dict) -> dict:
    """Compare AR/DE length ratio globally per symbol.
    Returns {"flagged": bool, "ratio": float}."""
    de_len = text_len(de)
    ar_len = text_len(ar)
    if de_len == 0:
        return {"flagged": False, "ratio": 0.0}
    ratio = ar_len / de_len
    flagged = ratio > LENGTH_UPPER or ratio < LENGTH_LOWER
    return {"flagged": flagged, "ratio": round(ratio, 3)}


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    api_key = load_env_key()

    with SRC_TOP.open() as f:
        top_doc = json.load(f)
    top_ids = [s["id"] for s in top_doc["symbols"][:PILOT_SIZE]]

    with SRC_V3.open() as f:
        v3_doc = json.load(f)
    v3_by_id = {s["id"]: s for s in v3_doc["symbole"]}

    # Prep log
    log_f = OUT_LOG.open("w", encoding="utf-8")
    log_f.write(f"# translate_pilot log {datetime.now(timezone.utc).isoformat()}\n")
    log_f.write(f"# model={MODEL}  pilot_size={PILOT_SIZE}\n")
    log_f.write(f"# caps: calls<={MAX_API_CALLS_PILOT} total_tokens<={MAX_TOTAL_TOKENS_PILOT} per_call<={PER_CALL_TOKEN_CAP}\n")
    log_f.write("---\n")
    log_f.write("symbol_id\tprompt_tokens\tcandidates_tokens\ttotal_tokens\tcost_usd\tlen_ratio_ar_de\tstatus\n")

    entries: dict = {}
    total_prompt_tok = 0
    total_output_tok = 0
    total_cost_usd = 0.0
    api_calls = 0
    errors: list[dict] = []
    skipped_oversize: list[str] = []
    anomalies: list[dict] = []
    start_ts = time.time()
    abort_reason = None

    try:
        for i, sid in enumerate(top_ids, start=1):
            sym = v3_by_id.get(sid)
            if not sym:
                msg = f"id {sid} not in v3 — skip"
                log_f.write(f"{sid}\t-\t-\t-\t-\t-\tmissing_in_v3\n")
                errors.append({"id": sid, "reason": "missing_in_v3"})
                continue

            de = extract_de_texts(sym)
            if not de:
                log_f.write(f"{sid}\t0\t0\t0\t0\t-\tno_translatable_content\n")
                errors.append({"id": sid, "reason": "no_translatable_content"})
                continue

            rough_in = token_count_rough(de) + len(SYSTEM_PROMPT) // 4
            if rough_in > PER_CALL_TOKEN_CAP:
                log_f.write(f"{sid}\t{rough_in}\t-\t-\t-\t-\tskipped_oversize\n")
                skipped_oversize.append(sid)
                continue

            # Hard caps BEFORE call
            if api_calls + 1 > MAX_API_CALLS_PILOT:
                abort_reason = f"MAX_API_CALLS_PILOT={MAX_API_CALLS_PILOT} reached"
                break
            if total_prompt_tok + total_output_tok + rough_in > MAX_TOTAL_TOKENS_PILOT:
                abort_reason = f"MAX_TOTAL_TOKENS_PILOT={MAX_TOTAL_TOKENS_PILOT} reached"
                break

            log_f.write(f"[{i}/{PILOT_SIZE}] {sid}  ({sym.get('name', '')})\n")
            t0 = time.time()
            try:
                translated, usage = call_gemini(api_key, de, log_f)
                api_calls += 1
            except Exception as e:
                log_f.write(f"  ERROR: {e}\n")
                errors.append({"id": sid, "reason": str(e)[:300]})
                # Fail fast on auth/400 class
                if "HTTP 4" in str(e):
                    abort_reason = f"Auth/Validation error on {sid}: {e}"
                    break
                continue

            # Per-call token cap (real tokens from usage)
            pt = int(usage.get("promptTokenCount", 0) or 0)
            ct = int(usage.get("candidatesTokenCount", 0) or 0)
            tt = int(usage.get("totalTokenCount", 0) or (pt + ct))
            if tt > PER_CALL_TOKEN_CAP:
                log_f.write(f"  OVER CAP: {tt} > {PER_CALL_TOKEN_CAP} — skip (don't abort)\n")
                skipped_oversize.append(sid)
                # We did pay for this call though — track cost
                total_prompt_tok += pt
                total_output_tok += ct
                cost = (pt * PRICE_INPUT_PER_1M + ct * PRICE_OUTPUT_PER_1M) / 1_000_000
                total_cost_usd += cost
                log_f.write(f"{sid}\t{pt}\t{ct}\t{tt}\t{cost:.5f}\t-\tover_cap_skipped\n")
                continue

            en = translated.get("en", {})
            ar = translated.get("ar", {})
            anomaly = length_anomaly_check(de, ar)
            if anomaly["flagged"]:
                anomalies.append({"id": sid, "ratio": anomaly["ratio"]})

            entries[sid] = {
                "name": sym.get("name", ""),
                "de": de,
                "en": en,
                "ar": ar,
                "length_ratio_ar_de": anomaly["ratio"],
                "length_anomaly": anomaly["flagged"],
                "usage": {"prompt": pt, "output": ct, "total": tt},
            }

            cost = (pt * PRICE_INPUT_PER_1M + ct * PRICE_OUTPUT_PER_1M) / 1_000_000
            total_prompt_tok += pt
            total_output_tok += ct
            total_cost_usd += cost
            log_f.write(f"{sid}\t{pt}\t{ct}\t{tt}\t{cost:.5f}\t{anomaly['ratio']}\t{'ANOMALY' if anomaly['flagged'] else 'ok'}\n")
            log_f.flush()

            elapsed = time.time() - t0
            if elapsed < MIN_INTER_CALL_S:
                time.sleep(MIN_INTER_CALL_S - elapsed)

    finally:
        log_f.write("---\n")
        log_f.write(f"api_calls={api_calls} prompt_tok={total_prompt_tok} output_tok={total_output_tok}\n")
        log_f.write(f"estimated_cost_usd={total_cost_usd:.4f}\n")
        if abort_reason:
            log_f.write(f"ABORT: {abort_reason}\n")
        log_f.close()

    # Write cache
    cache_doc = {
        "version": "pilot-v1",
        "model": MODEL,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "pilot_size": PILOT_SIZE,
        "completed_count": len(entries),
        "abort_reason": abort_reason,
        "entries": entries,
    }
    OUT_CACHE.write_text(json.dumps(cache_doc, ensure_ascii=False, indent=2))

    # Write report
    duration_s = time.time() - start_ts
    sample_ids = [sid for sid in SAMPLE_IDS_PREFERRED if sid in entries]
    # Fill up to 5 with first-available if some missing
    for sid in list(entries.keys()):
        if len(sample_ids) >= 5:
            break
        if sid not in sample_ids:
            sample_ids.append(sid)

    total_interpretations = sum(
        len([k for k in e["de"].keys() if k])
        for e in entries.values()
    )

    report = []
    p = report.append
    p("# Translation Pilot Report (Phase 2B)")
    p("")
    p(f"**Datum:** {datetime.now(timezone.utc).isoformat()}")
    p(f"**Modell:** `{MODEL}`")
    p(f"**Laufzeit:** {duration_s:.1f}s")
    p("")
    p("## Zusammenfassung")
    p("")
    p(f"- Symbole abgearbeitet: **{len(entries)}** von {PILOT_SIZE} geplant")
    p(f"- Interpretationen übersetzt (über alle Symbole): **{total_interpretations}**")
    p(f"- API-Calls: **{api_calls}** (cap {MAX_API_CALLS_PILOT})")
    p(f"- Prompt-Tokens: {total_prompt_tok}, Output-Tokens: {total_output_tok}, Summe: {total_prompt_tok + total_output_tok} (cap {MAX_TOTAL_TOKENS_PILOT})")
    p(f"- Geschätzte Kosten: **${total_cost_usd:.4f} USD**")
    p(f"- Fehler: {len(errors)}")
    p(f"- Skipped (oversize): {len(skipped_oversize)}")
    p(f"- Length-Anomalien (AR/DE < 0.5 oder > 1.7): **{len(anomalies)}**")
    if abort_reason:
        p(f"- **ABORT:** {abort_reason}")
    p("")
    if errors:
        p("## Fehler")
        p("")
        for e in errors[:20]:
            p(f"- `{e['id']}`: {e['reason']}")
        if len(errors) > 20:
            p(f"- … (+{len(errors) - 20} weitere)")
        p("")
    if anomalies:
        p("## Length-Anomalien (AR auffällig länger/kürzer als DE)")
        p("")
        p("| Symbol | AR/DE ratio |")
        p("|---|---|")
        for a in anomalies:
            p(f"| `{a['id']}` | {a['ratio']} |")
        p("")
    if skipped_oversize:
        p("## Oversize Skips")
        p("")
        for sid in skipped_oversize:
            p(f"- `{sid}`")
        p("")
    p("## Sample-Diffs (diverse Symbole)")
    p("")
    for sid in sample_ids[:5]:
        e = entries.get(sid)
        if not e:
            continue
        p(f"### {e['name']} (`{sid}`)")
        p("")
        p("**DE:**")
        p("```json")
        p(json.dumps(e["de"], ensure_ascii=False, indent=2))
        p("```")
        p("")
        p("**EN:**")
        p("```json")
        p(json.dumps(e["en"], ensure_ascii=False, indent=2))
        p("```")
        p("")
        p("**AR:**")
        p("```json")
        p(json.dumps(e["ar"], ensure_ascii=False, indent=2))
        p("```")
        p("")
        p(f"_Length AR/DE = {e['length_ratio_ar_de']}_  {'⚠' if e['length_anomaly'] else '✓'}")
        p("")

    OUT_REPORT.write_text("\n".join(report))

    print("---")
    print(f"Completed: {len(entries)} symbols, {api_calls} calls, ${total_cost_usd:.4f}")
    print(f"Tokens: prompt={total_prompt_tok} output={total_output_tok}")
    print(f"Errors: {len(errors)}  Oversize: {len(skipped_oversize)}  Anomalies: {len(anomalies)}")
    if abort_reason:
        print(f"ABORT: {abort_reason}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
