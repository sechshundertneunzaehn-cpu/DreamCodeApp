#!/usr/bin/env python3
"""
Merge DreamCode knowledge sources (Option C: field-wise merge).

Source B (data/traumsymbole.json, 877 symbols) = target schema (skeleton).
Source A (data/knowledgeBase.ts, 801 symbols) = enrichment (additional traditions).

Rules:
- B's structure is kept.
- A's traditions that don't exist in B are added to `additional_sources`.
- B's existing fields (freud, ibn_sirin, additional_sources.X) are never overwritten.
- If A + B disagree on ibn_sirin: B wins, A-version archived as `A_alternative_interpretation`.
- Categories normalized to singular lowercase ASCII (tier/objekt/...).
- Empty `ost_west_vergleich` fields are dropped.
- A is deduplicated by id first (11 duplicates merged).

Reads:   data/traumsymbole.json, data/knowledgeBase.ts  (READ-ONLY)
Writes:  data/traumsymbole.v3.json
         data/traumsymbole.v3.merge-report.md
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
import unicodedata
from collections import Counter, OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SRC_B = DATA / "traumsymbole.json"
SRC_A_TS = DATA / "knowledgeBase.ts"
OUT_JSON = DATA / "traumsymbole.v3.json"
OUT_REPORT = DATA / "traumsymbole.v3.merge-report.md"


# ─── A) Label-Mapping (Single Source of Truth) ────────────────────────────────
# Mapping from A's ReligiousSource enum name → B's additional_sources key.
SOURCE_MAP: dict[str, tuple[str, str]] = {
    # (b_key, display_label)
    "IBN_SIRIN": ("ibn_sirin", "Ibn Sirin"),
    "NABULSI": ("nabulsi", "Al-Nabulsi"),
    "FREUDIAN": ("freud", "Sigmund Freud"),
    "JUNGIAN": ("jung", "C.G. Jung"),
    "GESTALT": ("gestalt", "Gestalt (Perls)"),
    "MEDIEVAL": ("medieval", "Mittelalterliche Tradition"),
    "CHURCH_FATHERS": ("church_fathers", "Kirchenväter"),
    "MODERN_THEOLOGY": ("modern_theology", "Moderne Theologie"),
    "TIBETAN": ("tibetan", "Tibet. Buddhismus"),
    "ZEN": ("zen", "Zen-Buddhismus"),
    "THERAVADA": ("theravada", "Theravada"),
    "WESTERN_ZODIAC": ("western_zodiac", "Westl. Astrologie"),
    # Extended traditions (not in B's original enum, passthrough with distinct keys)
    "AL_ISKHAFI": ("al_iskhafi", "Al-Iskhafi"),
    "IMAM_SADIQ": ("imam_sadiq", "Imam Sadiq"),
    "ISLAMSKI_SONNIK": ("islamski_sonnik", "Islamski Sonnik"),
    "ZHOU_GONG": ("zhou_gong", "Zhou Gong"),
    "HATSUYUME": ("hatsuyume", "Hatsuyume"),
    "SWAPNA_SHASTRA": ("swapna_shastra", "Swapna Shastra"),
    "EDGAR_CAYCE": ("edgar_cayce", "Edgar Cayce"),
    "RUDOLF_STEINER": ("rudolf_steiner", "Rudolf Steiner"),
    "VEDIC_ASTROLOGY": ("vedic_astrology", "Vedische Astrologie"),
    "CHINESE_ZODIAC": ("chinese_zodiac", "Chinesisches Tierkreis"),
}

# ─── B) Kategorie-Normalisierung ──────────────────────────────────────────────
CATEGORY_MAP: dict[str, str] = {
    # Singular lowercase ASCII target enum (~10 values)
    "tier": "tier", "tiere": "tier",
    "objekt": "objekt", "objekte": "objekt",
    "aktion": "aktion", "aktionen": "aktion",
    "aktivitaet": "aktion", "aktivitaten": "aktion", "aktivitäten": "aktion",
    "aktivitaeten": "aktion",
    "ort": "ort", "orte": "ort",
    "koerper": "koerper", "körper": "koerper", "korper": "koerper",
    "natur": "natur",
    "person": "person", "personen": "person", "mensch": "person", "menschen": "person",
    "spirituell": "spirituell", "spirituelles": "spirituell", "spiritualitaet": "spirituell",
    "emotion": "emotion", "emotionen": "emotion",
    "symbol": "symbol", "symbole": "symbol",
    "zahl": "zahl", "zahlen": "zahl",
    "farbe": "farbe", "farben": "farbe",
    "nahrung": "nahrung", "essen": "nahrung", "lebensmittel": "nahrung",
}


def strip_accents(s: str) -> str:
    # Keep German umlauts transliterated, drop combining marks otherwise.
    repl = {"ä": "ae", "ö": "oe", "ü": "ue", "Ä": "ae", "Ö": "oe", "Ü": "ue", "ß": "ss"}
    for k, v in repl.items():
        s = s.replace(k, v)
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def norm_name(name: str) -> str:
    s = strip_accents(name).lower().strip()
    s = re.sub(r"[\s/]+", " ", s)
    s = re.sub(r"[^\w ]+", "", s, flags=re.UNICODE)
    return s.strip()


def norm_category(raw: str | None) -> str:
    if not raw:
        return "unknown"
    key = strip_accents(raw).lower().strip()
    return CATEGORY_MAP.get(key, key or "unknown")


# ─── C) Extract symbols array from knowledgeBase.ts via Node ──────────────────
EXTRACT_JS = r"""
const fs = require('fs');
const path = process.argv[1];
let src = fs.readFileSync(path, 'utf8');

// Locate the symbols array literal
const marker = 'export const symbols: DreamSymbol[] = ';
const start = src.indexOf(marker);
if (start === -1) { console.error('marker not found'); process.exit(2); }
let i = src.indexOf('[', start + marker.length);
// Walk balanced brackets respecting string literals
let depth = 0, inStr = false, strCh = '', esc = false, end = -1;
for (let k = i; k < src.length; k++) {
  const c = src[k];
  if (inStr) {
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === strCh) { inStr = false; }
    continue;
  }
  if (c === '\'' || c === '"' || c === '`') { inStr = true; strCh = c; continue; }
  if (c === '[') depth++;
  else if (c === ']') { depth--; if (depth === 0) { end = k; break; } }
}
if (end === -1) { console.error('unterminated array'); process.exit(3); }

let arr = src.slice(i, end + 1);
// Replace enum refs with string literals
arr = arr.replace(/ReligiousCategory\.([A-Z_]+)/g, (_, n) => JSON.stringify(n));
arr = arr.replace(/ReligiousSource\.([A-Z_]+)/g, (_, n) => JSON.stringify(n));

// Evaluate JS literal in a sandbox (safe: the file is local source)
const vm = require('vm');
const result = vm.runInNewContext('(' + arr + ')', {}, { timeout: 5000 });
process.stdout.write(JSON.stringify(result));
"""


def extract_knowledge_base_ts(path: Path) -> list[dict]:
    res = subprocess.run(
        ["node", "-e", EXTRACT_JS, str(path)],
        capture_output=True,
        text=True,
        timeout=30,
    )
    if res.returncode != 0:
        raise RuntimeError(f"Node extract failed: {res.stderr}")
    return json.loads(res.stdout)


# ─── D) Merge logic ───────────────────────────────────────────────────────────

def dedup_source_a(a_symbols: list[dict]) -> tuple[list[dict], list[str]]:
    """Merge duplicate IDs in A by unioning interpretations."""
    by_id: "OrderedDict[str, dict]" = OrderedDict()
    dup_ids: list[str] = []
    for s in a_symbols:
        sid = s["id"]
        if sid in by_id:
            dup_ids.append(sid)
            existing = by_id[sid]
            seen = {(i["tradition"], i["source"]): i for i in existing["interpretations"]}
            for interp in s["interpretations"]:
                key = (interp["tradition"], interp["source"])
                if key not in seen:
                    existing["interpretations"].append(interp)
                    seen[key] = interp
            # Union keywords
            kw = list(dict.fromkeys((existing.get("keywords") or []) + (s.get("keywords") or [])))
            existing["keywords"] = kw
        else:
            by_id[sid] = {
                "id": sid,
                "name": s.get("name"),
                "category": s.get("category"),
                "keywords": list(s.get("keywords") or []),
                "interpretations": list(s.get("interpretations") or []),
            }
    return list(by_id.values()), dup_ids


def merge(b: list[dict], a: list[dict]) -> tuple[list[dict], dict]:
    # Index A by normalized name.
    # Compound names like "Zahn / Zähne" are also indexed under each part so
    # B-entries with a single-word name still match after ID-dedup.
    a_by_norm: dict[str, dict] = {}
    a_collisions: list[str] = []
    for s in a:
        raw = s["name"] or ""
        variants = [raw] + [p.strip() for p in re.split(r"[/,]", raw) if p.strip() and p.strip() != raw]
        for v in variants:
            n = norm_name(v)
            if not n:
                continue
            if n in a_by_norm:
                if a_by_norm[n]["id"] != s["id"]:
                    a_collisions.append(f"{a_by_norm[n]['id']} <-> {s['id']} ({n!r})")
                    if len(s["interpretations"]) > len(a_by_norm[n]["interpretations"]):
                        a_by_norm[n] = s
            else:
                a_by_norm[n] = s

    out: list[dict] = []
    matched_norms: set[str] = set()
    new_traditions_per_symbol: Counter[str] = Counter()
    conflicts: list[str] = []
    dropped_empty_ow: list[str] = []
    categories_before: Counter[str] = Counter()
    categories_after: Counter[str] = Counter()
    alternative_added: list[str] = []

    for sym in b:
        categories_before[str(sym.get("kategorie", ""))] += 1
        merged = dict(sym)  # shallow copy

        # Normalize category
        merged["kategorie"] = norm_category(sym.get("kategorie"))
        categories_after[merged["kategorie"]] += 1

        # Drop ost_west_vergleich wenn fehlend, null, leer-dict, leer-string oder leer-list
        ow_key = "ost_west_vergleich"
        ow = merged.get(ow_key)
        is_empty = (
            ow_key not in merged
            or ow is None
            or ow == ""
            or (isinstance(ow, dict) and not ow)
            or (isinstance(ow, list) and not ow)
        )
        if is_empty:
            merged.pop(ow_key, None)
            dropped_empty_ow.append(sym["id"])

        # Drop empty traumtyp_kategorien
        tk = merged.get("traumtyp_kategorien")
        if isinstance(tk, list) and not tk:
            merged.pop("traumtyp_kategorien", None)

        # Find A-match by normalized name
        nname = norm_name(sym["name"])
        a_match = a_by_norm.get(nname)
        if a_match:
            matched_norms.add(nname)

            # Prepare additional_sources if missing
            add_srcs = dict(merged.get("additional_sources") or {})

            # Walk through A's interpretations
            for interp in a_match["interpretations"]:
                src_enum = interp["source"]  # e.g. FREUDIAN
                mapping = SOURCE_MAP.get(src_enum)
                if not mapping:
                    conflicts.append(f"{sym['id']}: unknown A-source {src_enum} (skipped)")
                    continue
                b_key, label = mapping
                text = interp["text"]

                if b_key == "freud":
                    if merged.get("freud", {}).get("vorhanden"):
                        # Conflict: B already has freud. Keep B.
                        if text and text != merged["freud"].get("interpretation"):
                            merged["freud"]["A_alternative_interpretation"] = text
                            alternative_added.append(f"{sym['id']}:freud")
                    else:
                        merged["freud"] = {
                            "vorhanden": True,
                            "interpretation": text,
                        }
                        new_traditions_per_symbol[sym["id"]] += 1
                elif b_key == "ibn_sirin":
                    if merged.get("ibn_sirin", {}).get("vorhanden"):
                        existing_deutungen = merged["ibn_sirin"].get("deutungen") or []
                        if text and text not in existing_deutungen:
                            # B wins structurally; archive A version
                            merged["ibn_sirin"].setdefault("A_alternative_interpretation", []).append(text)
                            alternative_added.append(f"{sym['id']}:ibn_sirin")
                    else:
                        merged["ibn_sirin"] = {
                            "vorhanden": True,
                            "deutungen": [text],
                        }
                        new_traditions_per_symbol[sym["id"]] += 1
                else:
                    # additional_sources bucket
                    if b_key in add_srcs:
                        existing_text = add_srcs[b_key].get("text", "")
                        if text and text not in existing_text:
                            add_srcs[b_key].setdefault("A_alternative_texts", []).append(text)
                            alternative_added.append(f"{sym['id']}:{b_key}")
                    else:
                        add_srcs[b_key] = {"label": label, "text": text}
                        new_traditions_per_symbol[sym["id"]] += 1

            if add_srcs:
                merged["additional_sources"] = add_srcs

            # Union keywords into synonyme
            a_kw = a_match.get("keywords") or []
            if a_kw:
                syns = list(merged.get("synonyme") or [])
                seen_low = {s.lower() for s in syns}
                for k in a_kw:
                    if k.lower() not in seen_low:
                        syns.append(k)
                        seen_low.add(k.lower())
                merged["synonyme"] = syns

        out.append(merged)

    # A-exclusives: symbols in A with no match in B — append as new entries.
    # Because a_by_norm may index the same A-sym under multiple name variants,
    # skip A-syms whose ID already appears as matched under ANY variant, and
    # only emit each A-sym id once.
    matched_a_ids: set[str] = {a_by_norm[n]["id"] for n in matched_norms}
    emitted_a_ids: set[str] = set()
    a_exclusive: list[dict] = []
    for nname, a_sym in a_by_norm.items():
        if nname in matched_norms:
            continue
        if a_sym["id"] in matched_a_ids or a_sym["id"] in emitted_a_ids:
            continue
        emitted_a_ids.add(a_sym["id"])
        # Build a B-shaped record
        freud_interp = next(
            (i for i in a_sym["interpretations"] if i["source"] == "FREUDIAN"), None
        )
        ibn_interp = next(
            (i for i in a_sym["interpretations"] if i["source"] == "IBN_SIRIN"), None
        )
        add_srcs: dict[str, dict] = {}
        for interp in a_sym["interpretations"]:
            if interp["source"] in ("FREUDIAN", "IBN_SIRIN"):
                continue
            mapping = SOURCE_MAP.get(interp["source"])
            if not mapping:
                continue
            b_key, label = mapping
            if b_key not in add_srcs:
                add_srcs[b_key] = {"label": label, "text": interp["text"]}

        rec: dict = {
            "id": f"a_{a_sym['id']}",
            "name": a_sym["name"],
            "kategorie": norm_category(a_sym.get("category")),
            "synonyme": list(a_sym.get("keywords") or []),
            "freud": (
                {"vorhanden": True, "interpretation": freud_interp["text"]}
                if freud_interp else {"vorhanden": False, "interpretation": ""}
            ),
            "ibn_sirin": (
                {"vorhanden": True, "deutungen": [ibn_interp["text"]]}
                if ibn_interp else {"vorhanden": False, "deutungen": []}
            ),
            "verwandte_symbole": [],
            "source_origin": "A_exclusive",
        }
        if add_srcs:
            rec["additional_sources"] = add_srcs
        categories_after[rec["kategorie"]] += 1
        a_exclusive.append(rec)

    out.extend(a_exclusive)

    stats = {
        "matched": len(matched_norms),
        "a_exclusive_count": len(a_exclusive),
        "a_collisions": a_collisions,
        "conflicts": conflicts,
        "dropped_empty_ow": dropped_empty_ow,
        "categories_before": dict(categories_before),
        "categories_after": dict(categories_after),
        "new_traditions_per_symbol": dict(new_traditions_per_symbol),
        "alternative_added": alternative_added,
    }
    return out, stats


# ─── E) Report builder ────────────────────────────────────────────────────────

def build_report(
    a_total_raw: int,
    a_total_dedup: int,
    b_total: int,
    merged_total: int,
    dup_ids: list[str],
    stats: dict,
    samples: dict,
) -> str:
    lines = []
    p = lines.append
    p("# Merge-Report: traumsymbole.v3.json")
    p("")
    p("Merge-Strategie: **Option C** — feldweiser Merge. B (Skelett) + A (Anreicherung).")
    p("")
    p("## Mengen")
    p("")
    p("| Quelle | Symbole |")
    p("|---|---|")
    p(f"| A (knowledgeBase.ts) roh | {a_total_raw} |")
    p(f"| A dedupliziert | {a_total_dedup} |")
    p(f"| B (traumsymbole.json) | {b_total} |")
    p(f"| **Output v3** | **{merged_total}** |")
    p(f"| — davon B-matched | {stats['matched']} |")
    p(f"| — davon A-exclusive | {stats['a_exclusive_count']} |")
    p("")
    p("## Duplikate in A (gemergt)")
    if dup_ids:
        p("")
        for d in dup_ids:
            p(f"- `{d}`")
    else:
        p("")
        p("_Keine_")
    p("")
    p("## Name-Kollisionen in A (zwei verschiedene IDs, gleicher normierter Name)")
    if stats["a_collisions"]:
        p("")
        for c in stats["a_collisions"]:
            p(f"- {c}")
    else:
        p("")
        p("_Keine_")
    p("")
    p("## Konflikte / Unbekannte Quellen")
    if stats["conflicts"]:
        p("")
        for c in stats["conflicts"]:
            p(f"- {c}")
    else:
        p("")
        p("_Keine_")
    p("")
    p("## Alternative Ibn-Sirin/Freud-Versionen (B gewinnt, A archiviert)")
    if stats["alternative_added"]:
        p("")
        p(f"Gesamt: {len(stats['alternative_added'])} Felder mit `A_alternative_interpretation`.")
        p("")
        for a in stats["alternative_added"][:30]:
            p(f"- {a}")
        if len(stats["alternative_added"]) > 30:
            p(f"- … (+{len(stats['alternative_added']) - 30} weitere)")
    else:
        p("")
        p("_Keine_")
    p("")
    p("## Leere ost_west_vergleich (entfernt)")
    p("")
    p(f"Gesamt entfernt: **{len(stats['dropped_empty_ow'])}** Symbole.")
    p("")
    p("## Kategorien-Normierung")
    p("")
    p("### Vor Merge (B roh)")
    p("")
    p("| Kategorie | Anzahl |")
    p("|---|---|")
    for k, v in sorted(stats["categories_before"].items(), key=lambda x: -x[1]):
        p(f"| `{k}` | {v} |")
    p("")
    p("### Nach Merge (normiert)")
    p("")
    p("| Kategorie | Anzahl |")
    p("|---|---|")
    for k, v in sorted(stats["categories_after"].items(), key=lambda x: -x[1]):
        p(f"| `{k}` | {v} |")
    p("")
    p("## Neue Traditionen pro Symbol (Top 25)")
    p("")
    top = sorted(stats["new_traditions_per_symbol"].items(), key=lambda x: -x[1])[:25]
    if top:
        p("| Symbol-ID | Neue Traditionen |")
        p("|---|---|")
        for sid, n in top:
            p(f"| `{sid}` | {n} |")
    else:
        p("_Keine_")
    p("")
    p("## Sample-Diffs (3 Symbole)")
    for name, diff in samples.items():
        p("")
        p(f"### {name}")
        p("")
        p("**Vorher (B):**")
        p("```json")
        p(json.dumps(diff["before"], ensure_ascii=False, indent=2))
        p("```")
        p("")
        p("**Nachher (v3):**")
        p("```json")
        p(json.dumps(diff["after"], ensure_ascii=False, indent=2))
        p("```")
    p("")
    return "\n".join(lines)


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> int:
    print(f"[merge_kb] reading B: {SRC_B}", file=sys.stderr)
    with SRC_B.open() as f:
        b_doc = json.load(f)
    b_symbols = b_doc["symbole"]
    b_total = len(b_symbols)

    print(f"[merge_kb] extracting A: {SRC_A_TS}", file=sys.stderr)
    a_raw = extract_knowledge_base_ts(SRC_A_TS)
    a_total_raw = len(a_raw)

    a_symbols, dup_ids = dedup_source_a(a_raw)
    a_total_dedup = len(a_symbols)

    print(f"[merge_kb] merging: A={a_total_dedup} (from {a_total_raw}), B={b_total}", file=sys.stderr)

    # Deep-copy aller B-Symbole für Before-State (damit Sample-Auswahl nachträglich möglich)
    b_before_by_id = {s["id"]: json.loads(json.dumps(s)) for s in b_symbols}

    merged, stats = merge(b_symbols, a_symbols)

    # Sample-Diffs dynamisch: die ersten 3 B-Symbole bei denen A neue Traditionen beigesteuert hat.
    # So ist garantiert, dass die Diffs nicht-trivial sind.
    merged_by_id = {s["id"]: s for s in merged}
    sample_ids: list[str] = []
    for sid, _cnt in sorted(
        stats["new_traditions_per_symbol"].items(), key=lambda x: -x[1]
    ):
        if sid in b_before_by_id and sid in merged_by_id and sid not in sample_ids:
            sample_ids.append(sid)
        if len(sample_ids) >= 3:
            break

    samples: dict = {}
    for sid in sample_ids:
        after = merged_by_id[sid]
        samples[after["name"]] = {
            "before": b_before_by_id[sid],
            "after": after,
        }

    # Build output doc
    out_doc = {
        "metadata": {
            "version": "3.0-merged",
            "source_b": b_doc.get("metadata", {}),
            "merge_info": {
                "strategy": "Option C (B skeleton + A enrichment)",
                "a_source": "data/knowledgeBase.ts",
                "b_source": "data/traumsymbole.json",
                "a_total_raw": a_total_raw,
                "a_total_dedup": a_total_dedup,
                "b_total": b_total,
                "v3_total": len(merged),
                "a_matched_to_b": stats["matched"],
                "a_exclusive": stats["a_exclusive_count"],
                "generated_by": "scripts/merge_kb.py",
            },
        },
        "symbole": merged,
    }

    OUT_JSON.write_text(json.dumps(out_doc, ensure_ascii=False, indent=2))
    print(f"[merge_kb] wrote {OUT_JSON} ({len(merged)} symbols)", file=sys.stderr)

    report = build_report(
        a_total_raw=a_total_raw,
        a_total_dedup=a_total_dedup,
        b_total=b_total,
        merged_total=len(merged),
        dup_ids=dup_ids,
        stats=stats,
        samples=samples,
    )
    OUT_REPORT.write_text(report)
    print(f"[merge_kb] wrote {OUT_REPORT}", file=sys.stderr)

    # Console summary
    print("---")
    print(f"A raw: {a_total_raw}, A dedup: {a_total_dedup}, B: {b_total}, v3: {len(merged)}")
    print(f"Matched (B<-A): {stats['matched']}  A-exclusive: {stats['a_exclusive_count']}")
    print(f"Dropped empty ost_west_vergleich: {len(stats['dropped_empty_ow'])}")
    print(f"Name-collisions in A: {len(stats['a_collisions'])}")
    print(f"Archived alternatives: {len(stats['alternative_added'])}")
    print(f"Category enum (nach Merge): {sorted(stats['categories_after'].keys())}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
