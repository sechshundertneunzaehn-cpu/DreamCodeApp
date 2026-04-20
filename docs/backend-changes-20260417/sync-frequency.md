# Konzept: Synchronisation `dream_symbols.frequency` ↔ `dream_symbol_links` COUNT

## Problem
- `dream_symbols.frequency` ist NLP-Erkennung im Freitext (z. B. "Wasser" 2499×).
- `dream_symbol_links` ist die echte, abrufbare Verlinkung Symbol↔Dream (z. B. 56).
- Frontend zeigt aktuell beide Zahlen → Diskrepanz wirkt unwissenschaftlich.

## Sofort-Loesung (umgesetzt)
- Backend liefert beides:
  - `X-Total-Count` = `dream_symbol_links` COUNT (primaere "abrufbare" Zahl)
  - `X-Frequency-Hint` = `dream_symbols.frequency` (NLP-Sekundaer)
- Frontend zeigt primaer die abrufbare Zahl, NLP nur als Sekundaer-Hint.
- Konsistenz-Warning im Backend-Log wenn `frequency > 3 × COUNT`.

## Hintergrund-Job-Skizze (nicht implementiert)

### Idee
Ein periodischer Job (z. B. taeglich) liest die echten COUNTs aus
`dream_symbol_links` und schreibt sie zurueck nach `dream_symbols.frequency`.
Damit waeren Graph-Node-Groesse und Panel-Counter immer konsistent.

### SQL-Skizze
```sql
-- pg_cron Job (taeglich 03:00 UTC)
WITH counts AS (
  SELECT symbol_id, COUNT(*) AS link_count
  FROM dream_symbol_links
  GROUP BY symbol_id
)
UPDATE dream_symbols ds
SET    frequency_linked = c.link_count,        -- neue Spalte
       frequency_synced_at = NOW()
FROM   counts c
WHERE  ds.id = c.symbol_id;
```

### Schema-Aenderung
- Neue Spalte `dream_symbols.frequency_linked INT` (default 0).
- Bestehende Spalte `dream_symbols.frequency` bleibt = NLP-Erkennung
  (umbenennen waere migrationsaufwendig, neue Spalte sauberer).
- Index: `CREATE INDEX dream_symbols_freq_linked_idx ON dream_symbols (frequency_linked DESC);`

### Auswirkung auf RPC `get_graph_data_filtered`
- Liefert ZWEI Frequency-Werte: `nlp_frequency`, `linked_frequency`.
- Frontend nutzt `linked_frequency` fuer Node-Groesse + Tooltips.
- `nlp_frequency` bleibt als optionale Sekundaer-Info abrufbar.

### Trigger-Variante (alternativ zu pg_cron)
```sql
CREATE OR REPLACE FUNCTION sync_link_count() RETURNS TRIGGER AS $$
BEGIN
  UPDATE dream_symbols
  SET frequency_linked = (
    SELECT COUNT(*) FROM dream_symbol_links
    WHERE symbol_id = COALESCE(NEW.symbol_id, OLD.symbol_id)
  )
  WHERE id = COALESCE(NEW.symbol_id, OLD.symbol_id);
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER dream_symbol_links_sync
AFTER INSERT OR DELETE ON dream_symbol_links
FOR EACH ROW EXECUTE FUNCTION sync_link_count();
```
Trade-off: Trigger ist immer-konsistent, kostet aber bei Bulk-Imports.
pg_cron-Job ist effizienter, aber bis zu 24h verzoegert.

## Empfehlung
- Kurzfristig: aktueller Stand (X-Frequency-Hint) reicht.
- Mittelfristig: pg_cron-Job + neue Spalte `frequency_linked`.
- Langfristig: Trigger nur fuer Live-Korrektur, Cron fuer Vollabgleich.
