#!/usr/bin/env python3
"""
Top-200-Translation — Phase 2B Schritt 2 (Full-Run).

Verarbeitet alle 200 Symbole aus data/top200_symbols.json.
Die 50 Pilot-Symbole werden aus data/translations_pilot.json als Cache geladen
(wenn sie strukturell komplett sind); für die restlichen ~150 wird Gemini gerufen.

Caps:
  MAX_API_CALLS       = 240
  MAX_TOTAL_TOKENS    = 800000
  per-call            = 10000   (skip, kein abort)

Reads:  data/top200_symbols.json    (Auswahl)
        data/traumsymbole.v3.json   (Quelltexte)
        data/translations_pilot.json (Cache)
        .env                         (GEMINI_API_KEY)

Writes: data/translations_top200.json
        data/translation_top200.log
        data/translation_top200_report.md
"""
from __future__ import annotations
import json, sys, time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

# Re-use proven functions from pilot script
from translate_pilot import (  # noqa: E402
    load_env_key, call_gemini, extract_de_texts, length_anomaly_check,
    PRICE_INPUT_PER_1M, PRICE_OUTPUT_PER_1M, MIN_INTER_CALL_S,
    token_count_rough, PER_CALL_TOKEN_CAP, text_len,
    LENGTH_LOWER, LENGTH_UPPER,
)

DATA = ROOT / "data"
SRC_TOP   = DATA / "top200_symbols.json"
SRC_V3    = DATA / "traumsymbole.v3.json"
SRC_CACHE = DATA / "translations_pilot.json"
OUT_CACHE = DATA / "translations_top200.json"
OUT_LOG    = DATA / "translation_top200.log"
OUT_REPORT = DATA / "translation_top200_report.md"

MAX_API_CALLS = 240
MAX_TOTAL_TOKENS = 800_000


def main() -> int:
    api_key = load_env_key()

    top_doc = json.loads(SRC_TOP.read_text())
    top_syms_meta = top_doc["symbols"]  # has rank + score
    top_ids = [s["id"] for s in top_syms_meta]
    meta_by_id = {s["id"]: s for s in top_syms_meta}

    v3_doc = json.loads(SRC_V3.read_text())
    v3_by_id = {s["id"]: s for s in v3_doc["symbole"]}

    cached = {}
    if SRC_CACHE.exists():
        pilot_doc = json.loads(SRC_CACHE.read_text())
        cached = pilot_doc.get("entries", {})

    log_f = OUT_LOG.open("w", encoding="utf-8")
    log_f.write(f"# translate_top200 log {datetime.now(timezone.utc).isoformat()}\n")
    log_f.write(f"# total_targets={len(top_ids)}  cache_entries={len(cached)}\n")
    log_f.write(f"# caps: calls<={MAX_API_CALLS}  total_tokens<={MAX_TOTAL_TOKENS}  per_call<={PER_CALL_TOKEN_CAP}\n")
    log_f.write("---\n")
    log_f.write("symbol_id\tsource\tprompt\tcandidates\ttotal\tcost_usd\tlen_ratio\tstatus\n")

    entries: dict = {}
    cached_count = 0
    new_calls = 0
    total_prompt_tok = 0
    total_output_tok = 0
    total_cost = 0.0
    errors: list[dict] = []
    skipped_oversize: list[str] = []
    anomalies: list[dict] = []
    abort_reason = None
    start_ts = time.time()

    try:
        for i, sid in enumerate(top_ids, start=1):
            sym = v3_by_id.get(sid)
            if not sym:
                errors.append({"id": sid, "reason": "missing_in_v3"})
                log_f.write(f"{sid}\t-\t-\t-\t-\t-\t-\tmissing_in_v3\n")
                continue

            # Cache hit?
            c = cached.get(sid)
            if c and "en" in c and "ar" in c and "de" in c:
                entries[sid] = {
                    **c,
                    "source": "cached_pilot",
                    "rank": meta_by_id[sid]["rank"],
                    "score": meta_by_id[sid]["score"],
                }
                cached_count += 1
                log_f.write(f"{sid}\tcache\t-\t-\t-\t-\t{c.get('length_ratio_ar_de','-')}\tcached\n")
                continue

            de = extract_de_texts(sym)
            if not de:
                errors.append({"id": sid, "reason": "no_translatable_content"})
                log_f.write(f"{sid}\t-\t0\t0\t0\t0\t-\tno_translatable_content\n")
                continue

            # Rough pre-check
            rough_in = token_count_rough(de)
            if rough_in > PER_CALL_TOKEN_CAP:
                skipped_oversize.append(sid)
                log_f.write(f"{sid}\tnew\t{rough_in}\t-\t-\t-\t-\tskipped_oversize\n")
                continue

            # Hard caps BEFORE API call
            if new_calls + 1 > MAX_API_CALLS:
                abort_reason = f"MAX_API_CALLS={MAX_API_CALLS} reached"
                break
            if total_prompt_tok + total_output_tok >= MAX_TOTAL_TOKENS:
                abort_reason = f"MAX_TOTAL_TOKENS={MAX_TOTAL_TOKENS} reached"
                break

            log_f.write(f"[{i}/{len(top_ids)}] {sid}  ({sym.get('name','')})\n")
            t0 = time.time()
            try:
                translated, usage = call_gemini(api_key, de, log_f)
                new_calls += 1
            except Exception as e:
                msg = str(e)[:300]
                errors.append({"id": sid, "reason": msg})
                log_f.write(f"{sid}\tnew\t-\t-\t-\t-\t-\terror: {msg[:120]}\n")
                if "HTTP 4" in msg:
                    abort_reason = f"Auth/Validation error on {sid}: {msg}"
                    break
                continue

            pt = int(usage.get("promptTokenCount", 0) or 0)
            ct = int(usage.get("candidatesTokenCount", 0) or 0)
            tt = int(usage.get("totalTokenCount", 0) or (pt + ct))
            cost = (pt * PRICE_INPUT_PER_1M + ct * PRICE_OUTPUT_PER_1M) / 1_000_000

            if tt > PER_CALL_TOKEN_CAP:
                skipped_oversize.append(sid)
                total_prompt_tok += pt
                total_output_tok += ct
                total_cost += cost
                log_f.write(f"{sid}\tnew\t{pt}\t{ct}\t{tt}\t{cost:.5f}\t-\tover_cap_skipped\n")
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
                "source": "new_api_call",
                "rank": meta_by_id[sid]["rank"],
                "score": meta_by_id[sid]["score"],
            }

            total_prompt_tok += pt
            total_output_tok += ct
            total_cost += cost
            log_f.write(f"{sid}\tnew\t{pt}\t{ct}\t{tt}\t{cost:.5f}\t{anomaly['ratio']}\t{'ANOMALY' if anomaly['flagged'] else 'ok'}\n")
            log_f.flush()

            elapsed = time.time() - t0
            if elapsed < MIN_INTER_CALL_S:
                time.sleep(MIN_INTER_CALL_S - elapsed)

    finally:
        log_f.write("---\n")
        log_f.write(f"new_calls={new_calls} cached={cached_count} errors={len(errors)} oversize={len(skipped_oversize)} anomalies={len(anomalies)}\n")
        log_f.write(f"prompt_tok={total_prompt_tok} output_tok={total_output_tok} cost_usd={total_cost:.4f}\n")
        if abort_reason:
            log_f.write(f"ABORT: {abort_reason}\n")
        log_f.close()

    # Write cache
    out_doc = {
        "version": "top200-v1",
        "model": "gemini-2.5-flash",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "targets": len(top_ids),
        "completed": len(entries),
        "cached_from_pilot": cached_count,
        "new_api_calls": new_calls,
        "abort_reason": abort_reason,
        "tokens": {"prompt": total_prompt_tok, "output": total_output_tok},
        "cost_usd": round(total_cost, 4),
        "entries": entries,
    }
    OUT_CACHE.write_text(json.dumps(out_doc, ensure_ascii=False, indent=2))

    # ── Sample-Auswahl: 10 Diffs über Rang-Bereiche ──
    # Prioritäten: die 5 User-Ziele wenn in entries, dann weitere je Bereich
    priority_ids = ["natur_001", "natur_006", "tier_020", "person_001", "natur_021"]
    samples: list[str] = []
    for pid in priority_ids:
        if pid in entries and pid not in samples:
            samples.append(pid)

    def pick_from_range(lo: int, hi: int, want: int):
        picked = 0
        for sid, e in entries.items():
            r = e.get("rank", 0)
            if lo <= r <= hi and sid not in samples:
                samples.append(sid)
                picked += 1
                if picked >= want:
                    break

    # Fülle bis 10 auf: je Bereich
    pick_from_range(1, 20, max(0, 3 - sum(1 for s in samples if entries[s].get("rank",0) <= 20)))
    pick_from_range(21, 50, max(0, 3 - sum(1 for s in samples if 21 <= entries[s].get("rank",0) <= 50)))
    pick_from_range(51, 100, max(0, 2 - sum(1 for s in samples if 51 <= entries[s].get("rank",0) <= 100)))
    pick_from_range(101, 200, max(0, 2 - sum(1 for s in samples if 101 <= entries[s].get("rank",0) <= 200)))
    samples = samples[:10]

    # ── Report ──
    duration_s = time.time() - start_ts
    total_interpretations = sum(len([k for k in (e.get("de") or {}).keys() if k]) for e in entries.values())
    anomaly_rate = len(anomalies) / max(1, len(entries))

    report = []
    p = report.append
    p("# Top-200 Translation Report (Phase 2B Full-Run)")
    p("")
    p(f"**Datum:** {datetime.now(timezone.utc).isoformat()}")
    p(f"**Modell:** gemini-2.5-flash")
    p(f"**Laufzeit (nur neue Calls):** {duration_s:.1f}s")
    p("")
    p("## Zusammenfassung")
    p("")
    p(f"- Ziel-Symbole: {len(top_ids)}")
    p(f"- Abgearbeitet: **{len(entries)}**  (cached_from_pilot: **{cached_count}**, new_api_calls: **{new_calls}**)")
    p(f"- Interpretationen (DE-Felder über alle Symbole): **{total_interpretations}**")
    p(f"- Prompt-Tokens: {total_prompt_tok}, Output-Tokens: {total_output_tok}, Sum: {total_prompt_tok + total_output_tok} (Cap {MAX_TOTAL_TOKENS})")
    p(f"- Kosten neu (USD): **${total_cost:.4f}** _(Pilot-Cache-Kosten zuvor: ~$0.054)_")
    p(f"- Fehler: **{len(errors)}**, Oversize-Skips: {len(skipped_oversize)}")
    p(f"- Length-Anomalien (AR/DE <{LENGTH_LOWER} oder >{LENGTH_UPPER}): **{len(anomalies)}** ({anomaly_rate*100:.1f}%)")
    if abort_reason:
        p(f"- **ABORT:** {abort_reason}")
    p("")

    if errors:
        p("## Fehler")
        p("")
        err_types = {}
        for e in errors:
            key = e["reason"][:80]
            err_types[key] = err_types.get(key, 0) + 1
        p("| Typ | Count |")
        p("|---|---|")
        for k, v in sorted(err_types.items(), key=lambda x: -x[1]):
            p(f"| `{k}` | {v} |")
        p("")
        for e in errors[:30]:
            p(f"- `{e['id']}`: {e['reason'][:150]}")
        if len(errors) > 30:
            p(f"- … (+{len(errors) - 30} weitere)")
        p("")

    if anomalies:
        p("## Length-Anomalien (AR/DE auffällig)")
        p("")
        p("| Rank | Symbol | AR/DE ratio |")
        p("|---|---|---|")
        sorted_ano = sorted(anomalies, key=lambda a: abs(a["ratio"] - 1.0), reverse=True)
        for a in sorted_ano:
            rank = entries.get(a["id"], {}).get("rank", "?")
            p(f"| {rank} | `{a['id']}` | {a['ratio']} |")
        p("")

    if skipped_oversize:
        p("## Oversize-Skips")
        p("")
        for sid in skipped_oversize:
            p(f"- `{sid}`")
        p("")

    p("## Sample-Diffs (10 Symbole über Rang-Bereiche)")
    p("")
    for sid in samples:
        e = entries.get(sid)
        if not e:
            continue
        rank = e.get("rank", "?")
        src = e.get("source", "?")
        p(f"### Rank {rank}: {e.get('name','')} (`{sid}`)  — source: `{src}`")
        p("")
        p("**DE:**")
        p("```json")
        p(json.dumps(e.get("de", {}), ensure_ascii=False, indent=2))
        p("```")
        p("")
        p("**EN:**")
        p("```json")
        p(json.dumps(e.get("en", {}), ensure_ascii=False, indent=2))
        p("```")
        p("")
        p("**AR:**")
        p("```json")
        p(json.dumps(e.get("ar", {}), ensure_ascii=False, indent=2))
        p("```")
        p("")
        lr = e.get("length_ratio_ar_de", "?")
        la = e.get("length_anomaly", False)
        p(f"_Length AR/DE = {lr}_ {'⚠' if la else '✓'}")
        p("")

    OUT_REPORT.write_text("\n".join(report))

    # Console summary
    print("---")
    print(f"Targets: {len(top_ids)}  Completed: {len(entries)}  Cached: {cached_count}  New calls: {new_calls}")
    print(f"Tokens: prompt={total_prompt_tok} output={total_output_tok}")
    print(f"Cost (new only): ${total_cost:.4f}")
    print(f"Errors: {len(errors)}  Oversize: {len(skipped_oversize)}  Anomalies: {len(anomalies)}")
    if abort_reason:
        print(f"ABORT: {abort_reason}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
