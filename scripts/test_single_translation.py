#!/usr/bin/env python3
"""1-Symbol-Gemini-Smoketest. Genau 1 API-Call. Output: Fingerprint + Tokens +
3 Zeilen EN/AR-Sample ODER HTTP-Code bei Fehler. KEIN Stack-Trace.
Nutzt die Funktionen aus translate_pilot.py wieder.
"""
from __future__ import annotations
import json, sys, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from translate_pilot import load_env_key, call_gemini, extract_de_texts  # noqa: E402

TOP = json.loads((ROOT / "data/top200_symbols.json").read_text())
V3  = json.loads((ROOT / "data/traumsymbole.v3.json").read_text())
V3_BY_ID = {s["id"]: s for s in V3["symbole"]}

test_id = TOP["symbols"][0]["id"]
sym = V3_BY_ID[test_id]
de = extract_de_texts(sym)


class NullLog:
    def write(self, _): pass
    def flush(self): pass


key = load_env_key()
print(f"[test] Fingerprint key in use: AIzaSy\u2026{key[-4:]}  len={len(key)}", file=sys.stderr)
print(f"[test] Symbol: {test_id} ({sym.get('name','')})  de_fields={list(de.keys())}", file=sys.stderr)

try:
    out, usage = call_gemini(key, de, NullLog())
except Exception as e:
    msg = str(e)
    m = re.search(r"HTTP (\d+)", msg)
    code = m.group(1) if m else "?"
    # Redact any possible key echoing from error body
    msg_redacted = re.sub(r"AIza[A-Za-z0-9_\-]{30,60}", "AIza<REDACTED>", msg)[:300]
    print(f"[test] FAILED http={code}: {msg_redacted}")
    sys.exit(1)

pt = usage.get("promptTokenCount", "?")
ct = usage.get("candidatesTokenCount", "?")
print(f"[test] HTTP 200 OK  tokens: prompt={pt} output={ct}")

en = out.get("en", {}) or {}
ar = out.get("ar", {}) or {}

def first3(x):
    s = x if isinstance(x, str) else (x[0] if isinstance(x, list) and x else "")
    return "\n".join(s.splitlines()[:3])[:400]

en_key = next(iter(en), None)
ar_key = next(iter(ar), None)

print(f"--- EN sample (field='{en_key}') ---")
print(first3(en.get(en_key, "")) if en_key else "(no en field)")
print(f"--- AR sample (field='{ar_key}') ---")
print(first3(ar.get(ar_key, "")) if ar_key else "(no ar field)")
sys.exit(0)
