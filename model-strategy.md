# DreamCode — Model Strategy Guide
# Letzte Aktualisierung: 2026-04-08
# Zweck: Einheitliche Modellwahl für alle Agenten/Sessions

## Grundregel
> Immer das gleiche Modell für die gleiche Aufgabe. Keine Experimente in Produktion.
> Free-Modelle NUR für Tests, NIEMALS für Batch-Jobs (rate-limited, instabil).

---

## Code-Generierung & Refactoring

| Aufgabe | Modell | Warum |
|---|---|---|
| TypeScript/React Code schreiben | **Claude Sonnet 4** (lokal via CLI) | Bester Code-Output, versteht Projektkontext |
| Code-Review & Bugfix | **Claude Sonnet 4** | Zuverlässigste Fehlererkennung |
| Große Refactorings | **Claude Opus 4** | Für komplexe Architektur-Entscheidungen |

## Übersetzungen (i18n)

| Aufgabe | Modell | Warum |
|---|---|---|
| Strukturierte Key-Value Übersetzung | **google/gemini-2.0-flash-001** (OpenRouter) | Schnell, günstig (~$0.005/Sprache), exzellent bei strukturiertem JSON/TS-Output |
| Fallback bei 429/Fehler | **deepseek/deepseek-chat-v3** (OpenRouter) | Zweitbestes Preis-Leistung für Übersetzungen |
| Kulturelle Lokalisierung (Marketing-Texte) | **google/gemini-2.5-pro** | Besseres kulturelles Verständnis für Werbe-/CTA-Texte |

**NICHT verwenden für Übersetzungen:**
- Free-Modelle (rate-limited, brechen Batch-Jobs ab)
- GPT-4o (zu teuer für Batch)
- Kleine Modelle <30B (Qualitätsprobleme bei AR/FA/UR/BN)

## Traum-Interpretation (App-Backend)

| Aufgabe | Modell | Warum |
|---|---|---|
| Standard 1-Tradition Deutung | **GROQ/Llama** | Schnellste Inference, kosteneffizient |
| Premium 6-Perspektiven | **Claude Sonnet 4** (API) | Tiefste Analyse, beste Qualität |
| Fallback-Kette | Gemini → DeepSeek → GROQ → Mistral | In dieser Reihenfolge |

## Bild-Generierung

| Aufgabe | Modell | Warum |
|---|---|---|
| Traum-Visualisierung | **Runware** | €0.002/Bild, schnell, gute Qualität |
| Fallback | **Pollinations** | Kostenlos, geringere Qualität |

## Audio / Voice

| Aufgabe | Modell | Warum |
|---|---|---|
| Live Voice Chat | **Gemini Live** (4 Keys, Round-Robin) | Einziges Modell mit Live-Voice-Support |
| Premium TTS | **ElevenLabs** | Beste Sprachqualität |
| Standard TTS | **Deepgram** | Günstig, €0.012/1000 chars |
| Fallback TTS | **Google Cloud TTS** | Stabil, viele Sprachen |
| STT | **Deepgram** | €0.004/min, WebSocket |

## Video

| Aufgabe | Modell | Warum |
|---|---|---|
| Video-Generierung | **Luma Ray** (Replicate) | Beste Qualität |
| Fallback | **WAN2.2** → **Slideshow** | Billiger, stabiler |

---

## Batch-Job Regeln

1. **IMMER synchron** — eine Aufgabe fertig → in Datei schreiben → nächste
2. **NIEMALS Hintergrund-Prozesse** für API-Calls (gehen verloren bei Session-Ende)
3. **Checkpoint-System** — fertige Dateien prüfen, überspringen wenn existiert
4. **Retry mit Backoff** — 3 Versuche, 2s/5s/10s Pause
5. **Fallback-Modell** — nach 3 Fehlern automatisch nächstes Modell
6. **Sofort speichern** — Ergebnis sofort in Datei, nicht im RAM sammeln

## Kosten-Limits

- Übersetzung komplett (21 Sprachen × ~300 Keys): ~$0.10-0.20
- Traum-Interpretation (1x Standard): ~$0.002
- Traum-Interpretation (1x Premium 6-Perspektiven): ~$0.03
- Bild (1x): €0.002
- **Vor kostenpflichtigen Batch-Jobs IMMER Genehmigung einholen**

---

## Datei-Ablageort
Diese Datei liegt unter: `/home/dejavu/dreamcode-landing/model-strategy.md`
Wird von allen CLI-Agenten als Referenz gelesen.
