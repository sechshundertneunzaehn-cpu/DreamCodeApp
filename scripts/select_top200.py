#!/usr/bin/env python3
"""
Top-200-Auswahl aus traumsymbole.v3.json — Phase 2B Schritt 1 (v2 name-match).

Scoring (gewichtet):
  40% tradition_count / 5   (freud + ibn_sirin + |additional_sources|)
  40% has_ibn_sirin         (0/1)
  20% universal_score       (tiered match 0.0 / 0.5 / 0.7 / 0.8 / 1.0)

Universal-Match (4 Stufen):
  1.0  exact: normalisierter Name ODER Synonym == Keyword
  0.8  prefix: Keyword steht am Wortanfang des Namens mit Word-Boundary
  0.7  word:   Keyword als eigenes Wort (Wortgrenze) im Namen
  0.5  sub-syn: Keyword als Substring in irgendeinem Synonym (weicher Fallback)

Reads:  data/traumsymbole.v3.json  (READ-ONLY)
Writes: data/top200_symbols.json
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SRC = DATA / "traumsymbole.v3.json"
OUT = DATA / "top200_symbols.json"

MAX_TRADITIONS = 5  # normalisierungs-basis (beobachtetes corpus-Maximum)

# ── Universal-Symbols ─────────────────────────────────────────────────────────
# Hardcoded Liste archetypischer / kulturübergreifender Symbole.
# IDs in v3 sind ASCII-lowercase mit ae/oe/ue-Umschrift.
# Missing-IDs werden im Output dokumentiert (nicht fatal).
UNIVERSAL_SYMBOLS: set[str] = {
    # aus User-Request (50)
    "wasser", "feuer", "tod", "liebe", "fliegen", "fallen", "zahn", "schlange",
    "hochzeit", "mutter", "kind", "haus", "auto", "weg", "fluss", "berg",
    "baum", "vogel", "hund", "katze", "spiegel", "licht", "dunkel", "dunkelheit",
    "blut", "gold", "buch", "tuer", "schluessel", "bruecke", "meer", "ozean",
    "sturm", "regen", "geld", "koenig", "koenigin", "engel", "teufel", "himmel",
    "hoelle", "gefaengnis", "krankenhaus", "schule", "arbeit", "essen", "trinken",
    "kuessen", "nackt", "verfolgung", "kampf", "sieg", "sterne",
    # klassische Erweiterung (~35)
    "sonne", "mond", "wolke", "wald", "hoehle", "insel", "stein", "eisen",
    "messer", "schwert", "waffe", "kleidung", "schuh", "hut", "krone", "ring",
    "brille", "uhr", "schrei", "stimme", "traum", "geburt", "schwangerschaft",
    "baby", "vater", "bruder", "schwester", "freund", "feind", "fremder",
    "reise", "flucht", "verirren", "verstecken", "suchen", "finden",
}


_UMLAUT_REPL = {
    "ä": "ae", "ö": "oe", "ü": "ue",
    "Ä": "ae", "Ö": "oe", "Ü": "ue", "ß": "ss",
}


def _normalize(s: str) -> str:
    if not s:
        return ""
    for k, v in _UMLAUT_REPL.items():
        s = s.replace(k, v)
    return s.lower().strip()


def _symbol_forms(sym: dict) -> tuple[str, list[str]]:
    """Normalized (name, [synonyms])."""
    name = _normalize(sym.get("name", ""))
    syns = [_normalize(x) for x in (sym.get("synonyme") or []) if x]
    syns = [s for s in syns if s]
    return name, syns


def universal_match(sym: dict, universal: set[str]) -> tuple[float, dict | None, set[str]]:
    """Tiered universal match. Returns (best_score, best_info, all_matched_keywords).
    best_* = höchstes Tier über alle Keywords; all_matched = alle Keywords die auf
    irgendeinem Tier matchen (für Coverage-Tracking corpus-weit)."""
    name, syns = _symbol_forms(sym)
    best_score = 0.0
    best_info: dict | None = None
    all_matched: set[str] = set()

    for kw in universal:
        kw_esc = re.escape(kw)
        prefix_re = re.compile(r"^" + kw_esc + r"\b")
        word_re = re.compile(r"\b" + kw_esc + r"\b")
        tier_score = 0.0
        info: dict | None = None

        # Tier 1: exact match (name or any synonym)
        if name == kw:
            tier_score, info = 1.0, {
                "keyword": kw, "tier": "exact_name", "field": "name", "matched_text": name,
            }
        else:
            exact_syn = next((s for s in syns if s == kw), None)
            if exact_syn is not None:
                tier_score, info = 1.0, {
                    "keyword": kw, "tier": "exact_synonym", "field": "synonyme", "matched_text": exact_syn,
                }
            # Tier 2: prefix of name (not exact — that's Tier 1)
            elif prefix_re.match(name):
                tier_score, info = 0.8, {
                    "keyword": kw, "tier": "prefix_name", "field": "name", "matched_text": name,
                }
            # Tier 3: word-boundary in name
            elif word_re.search(name):
                tier_score, info = 0.7, {
                    "keyword": kw, "tier": "word_name", "field": "name", "matched_text": name,
                }
            else:
                # Tier 4: substring in synonym (softer)
                sub_syn = next((s for s in syns if kw in s), None)
                if sub_syn is not None:
                    tier_score, info = 0.5, {
                        "keyword": kw, "tier": "sub_synonym", "field": "synonyme", "matched_text": sub_syn,
                    }

        if tier_score > 0:
            all_matched.add(kw)

        if tier_score > best_score:
            best_score = tier_score
            best_info = info

    return best_score, best_info, all_matched


def tradition_count(sym: dict) -> int:
    count = 0
    if sym.get("freud", {}).get("vorhanden"):
        count += 1
    if sym.get("ibn_sirin", {}).get("vorhanden"):
        count += 1
    add = sym.get("additional_sources") or {}
    if isinstance(add, dict):
        count += len(add)
    return count


def score(sym: dict, universal: set[str]) -> tuple[float, int, bool, float, dict | None, set[str]]:
    tc = tradition_count(sym)
    has_ibn = bool(sym.get("ibn_sirin", {}).get("vorhanden"))
    uni_score, uni_info, all_matched = universal_match(sym, universal)
    total = (
        0.40 * min(tc, MAX_TRADITIONS) / MAX_TRADITIONS
        + 0.40 * (1.0 if has_ibn else 0.0)
        + 0.20 * uni_score
    )
    return round(total, 6), tc, has_ibn, uni_score, uni_info, all_matched


def main() -> int:
    if not SRC.exists():
        print(f"[select_top200] FATAL: {SRC} not found", file=sys.stderr)
        return 1

    with SRC.open() as f:
        doc = json.load(f)
    symbole = doc["symbole"]

    # Scoring
    scored: list[dict] = []
    matched_keywords_corpus: set[str] = set()
    for sym in symbole:
        sid = sym.get("id")
        if not sid:
            continue
        s, tc, has_ibn, uni_score, uni_info, all_matched = score(sym, UNIVERSAL_SYMBOLS)
        matched_keywords_corpus.update(all_matched)
        scored.append({
            "id": sid,
            "name": sym.get("name", ""),
            "score": s,
            "tradition_count": tc,
            "has_ibn_sirin": has_ibn,
            "universal_score": uni_score,
            "universal_match": uni_info,  # None if no match
        })

    # Sort desc score, then asc id as tiebreak
    scored.sort(key=lambda x: (-x["score"], x["id"]))
    top200 = scored[:200]
    for i, entry in enumerate(top200, start=1):
        # rank zuerst im Dict
        rank_val = i
        reordered = {"rank": rank_val}
        reordered.update(entry)
        top200[i - 1] = reordered

    # Keywords, die im gesamten v3-Corpus keinen einzigen Match haben
    unmatched_keywords = sorted(UNIVERSAL_SYMBOLS - matched_keywords_corpus)

    out = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "data/traumsymbole.v3.json",
        "total_in_v3": len(symbole),
        "weights": {"traditions": 0.4, "ibn_sirin": 0.4, "universal": 0.2},
        "universal_tier_scores": {
            "exact": 1.0, "prefix": 0.8, "word": 0.7, "sub_synonym": 0.5,
        },
        "universal_symbols_count": len(UNIVERSAL_SYMBOLS),
        "universal_keywords_matched_in_corpus": sorted(matched_keywords_corpus),
        "unmatched_universal_keywords": unmatched_keywords,
        "symbols": top200,
    }

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2))
    print(f"[select_top200] wrote {OUT} ({len(top200)} symbols)", file=sys.stderr)

    # Console summary
    top3 = top200[:3]
    uni_matched = sum(1 for s in top200 if s.get("universal_score", 0) > 0)
    avg_score = sum(s["score"] for s in top200) / max(1, len(top200))
    tier_hist = {"exact": 0, "prefix": 0, "word": 0, "sub_synonym": 0}
    for s in top200:
        info = s.get("universal_match")
        if info:
            tier = info["tier"]
            if tier.startswith("exact"):
                tier_hist["exact"] += 1
            elif tier == "prefix_name":
                tier_hist["prefix"] += 1
            elif tier == "word_name":
                tier_hist["word"] += 1
            elif tier == "sub_synonym":
                tier_hist["sub_synonym"] += 1
    print("---")
    print(f"Total in v3: {len(symbole)}")
    print(f"Universal-Keywords: {len(UNIVERSAL_SYMBOLS)} gesamt, {len(matched_keywords_corpus)} haben corpus-Match, {len(unmatched_keywords)} unmatched")
    print(f"Top-200 avg score: {avg_score:.4f}")
    print(f"Top-200 universal-matches: {uni_matched}")
    print(f"  tier-Verteilung: exact={tier_hist['exact']} prefix={tier_hist['prefix']} word={tier_hist['word']} sub_synonym={tier_hist['sub_synonym']}")
    print(f"Top-3: {[t['id'] for t in top3]}  scores: {[t['score'] for t in top3]}")
    if unmatched_keywords:
        print(f"Unmatched universal keywords: {unmatched_keywords}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
