# Bot System Design — DreamCodeApp
*Stand: 2026-04-02 | Status: Design, kein Code*

---

## 1. Ziel

1000 optische Bot-Nutzer auf der DreamMap. Keine Interaktion (kein Messaging, kein Antworten). Löschbar per `isBot`-Flag sobald echte Nutzer kommen.

---

## 2. Wo leben die Bots?

### Entscheidung: Separates Daten-File

**Datei:** `/home/dejavu/DreamCodeApp-current/data/botUsers.ts`

Nicht in `DreamMap.tsx` inline — die Datei ist bereits sehr groß. Die 150 existierenden `BASE_USERS` bleiben wo sie sind, werden aber auf `BotSimUser` geupgradet. Das neue File exportiert:

```
export const BOT_USERS: BotSimUser[]   // alle 1000 Einträge inkl. der 150
```

`DreamMap.tsx` importiert `BOT_USERS` anstatt `BASE_USERS` zu definieren:

```ts
import { BOT_USERS } from '../data/botUsers';
```

`generateUsers()` bleibt in `DreamMap.tsx`, iteriert aber über `BOT_USERS`.

**Warum nicht IndexedDB?** Bots sind statische Dekorationsdaten, kein User-Content. Ein TS-File reicht, kein async-Loading nötig.

---

## 3. Interface-Erweiterungen

### 3a. `SimUser` → `BotSimUser`

Aktuelle `SimUser`-Felder (bereits in DreamMap.tsx):
```ts
id, name, avatar, city, country, lat, lng, dreamSummary,
category, mood, matchPct, religCategory?,
privacy, age?, memberSince, bio?, dreamCount, matchCount, favCategory
```

**Neue Felder in `BotSimUser`:**

```ts
interface BotSimUser extends Omit<SimUser, 'matchPct'> {
  // Pflicht-Flag — niemals entfernen, bis Deletion
  isBot: true;

  // Identität
  gender?: 'female' | 'male' | 'diverse';
  pronouns?: string;          // 'she/her' | 'he/him' | 'they/them'
  zodiacSign?: string;        // 'Scorpio' etc.
  nationality?: string;       // für Profil-Anzeige (z.B. 'German')

  // Kommunikationsstil — sichtbar auf Profil, keine echte Funktion
  communicationStyle: 'open' | 'selective' | 'private';
  // open      = "Ich freue mich über Nachrichten"  → trotzdem KEIN Messaging
  // selective = "Ich antworte manchmal"            → trotzdem KEIN Messaging
  // private   = "Ich halte mich lieber bedeckt"   → trotzdem KEIN Messaging

  // Anonymitätsmodus
  isAnonymous: boolean;
  // true  → Name wird als "Anonymer Träumer" angezeigt,
  //         Avatar wird zu einem generischen Icon
  //         Kein Bio, keine Stats sichtbar

  // Beitraege-Sektion (Contributions)
  contributions?: BotContribution[];

  // Erweitertes Profil
  lastActive?: string;        // ISO-Datum, z.B. '2026-03-28'
  dreamStyle?: string;        // 'surreal' | 'lucid' | 'prophetic' | 'symbolic' | 'recurring'
  languages?: string[];       // ['de', 'en'] — welche Sprachen der Bot "spricht"
}
```

### 3b. `BotContribution`

```ts
interface BotContribution {
  id: string;
  type: 'dream_shared' | 'interpretation_given' | 'symbol_added' | 'insight_posted';
  title: string;
  date: string;              // ISO-Datum
  preview: string;           // 1-2 Sätze, sichtbar NUR für Freunde
  // Non-friends sehen nur: "X Beitraege — nur für Freunde sichtbar"
}
```

**Anzahl pro Bot:** 0–8 Beiträge, zufällig per seededRandom aus dem Index.

---

## 4. Privacy & Visibility-System für Bots

### 4a. Bestehende `privacy`-Level (bleiben)

```
'public'  → alles sichtbar
'partial' → Bio und Stats verborgen
'private' → nur Name + Avatar + Stadt
```

### 4b. Neues `contributionsVisibility`-Konzept

Da es kein echtes Freundesystem gibt, wird "Freund" über einen lokalen State simuliert:

**`localStorage` Key:** `dreamcode_bot_friends` → `string[]` (Array von Bot-IDs)

User kann auf einem Bot-Profil "Verbinden" klicken → ID landet in localStorage.

Danach: `isFriend(botId)` liest localStorage → gibt `true` zurück.

```ts
// Pseudo-Logik im Profil-Overlay
const isFriend = (botId: string): boolean => {
  const friends: string[] = JSON.parse(
    localStorage.getItem('dreamcode_bot_friends') ?? '[]'
  );
  return friends.includes(botId);
};
```

**Contributions-Sichtbarkeit:**
- `isFriend(bot.id) === false` → Zeige nur: *"Luisa hat 5 Beiträge — nur für Freunde sichtbar"*
- `isFriend(bot.id) === true`  → Zeige alle `BotContribution[]` vollständig

### 4c. Messaging ist permanent gesperrt

Bots haben **kein** Message-Button. Stattdessen:
- `communicationStyle === 'open'` → Button "Verbinden" (= in localStorage-Friends-Liste aufnehmen)
- `communicationStyle === 'selective'` → Button "Verbinden" + Hinweis "Antwortet selten"
- `communicationStyle === 'private'` → Kein Connect-Button, nur "Profil ist geschlossen"

Niemals ein Nachrichten-Input, niemals ein Chat-Link.

---

## 5. Profil-Click-Flow

### Bestehende Infrastruktur (bereits vorhanden)

DreamMap.tsx hat bereits:
- `openProfile(user: SimUser)` → `setProfileUser` + `setProfileVisible(true)`
- Profil-Overlay als Slide-in Panel
- `handleMarkerClick`, `handleResultClick` → rufen `openProfile` auf

### Erweiterung des Profil-Overlays

Das bestehende Overlay wird um folgende Sektionen erweitert:

```
┌─────────────────────────────────┐
│ [Avatar]  Name / Anonym         │
│ City · Country · memberSince    │
│ Kommunikationsstil-Badge        │
├─────────────────────────────────┤
│ Bio (wenn public & nicht anon)  │
├─────────────────────────────────┤
│ Stats: Träume · Matches · Fav   │  ← nur wenn privacy='public'
├─────────────────────────────────┤
│ Traumstil · Zodiac · Sprachen   │
├─────────────────────────────────┤
│ BEITRAEGE                       │
│ [Friend] → liste anzeigen       │
│ [kein Friend] → gesperrt Badge  │
├─────────────────────────────────┤
│ [Verbinden] oder [Geschlossen]  │
└─────────────────────────────────┘
```

**Keine neuen Routen, kein View-State-Wechsel.** Das Overlay läuft als Modal in DreamMap, wie heute.

---

## 6. `isBot`-Flag für spätere Massenentfernung

```ts
isBot: true  // Literal-Typ, nicht optional
```

Wenn echte User kommen:

```ts
// data/botUsers.ts einfach löschen
// DreamMap.tsx: BOT_USERS-Import entfernen, generateUsers() auf [] zeigen
```

Alternativ: Ein einzelner Feature-Flag in `config/`:

```ts
// config/featureFlags.ts
export const SHOW_BOT_USERS = true;  // → false = alle Bots weg
```

`generateUsers()` gibt dann `[]` zurück wenn `SHOW_BOT_USERS === false`.

**Kein DB-Migration, kein API-Call, eine Zeile.**

---

## 7. User-facing Privacy-Optionen (für echte Nutzer)

Aktuell existiert nur `AudioVisibility` (PRIVATE/FRIENDS/PUBLIC) in `types.ts`.

### Neue `ProfileVisibility`-Einstellung

Zu `types.ts` hinzufügen:

```ts
export enum ProfileVisibility {
  PUBLIC   = 'PUBLIC',    // Alles sichtbar
  FRIENDS  = 'FRIENDS',   // Beiträge + Details nur für Freunde
  MINIMAL  = 'MINIMAL',   // Nur Name + Stadt + Avatar
  ANONYMOUS = 'ANONYMOUS' // Kein Name, kein Avatar, generisch
}

export enum CommunicationPreference {
  OPEN       = 'OPEN',       // "Ich freue mich über Kontakt"
  SELECTIVE  = 'SELECTIVE',  // "Ich melde mich gelegentlich"
  CLOSED     = 'CLOSED',     // "Kein Kontakt gewünscht"
}
```

In `UserProfile` ergänzen:

```ts
profileVisibility?: ProfileVisibility;       // default: PUBLIC
communicationPreference?: CommunicationPreference;  // default: OPEN
contributionsVisibility?: AudioVisibility;   // PRIVATE | FRIENDS | PUBLIC, reuse existing enum
```

### Wo einstellbar?

`/home/dejavu/DreamCodeApp-current/components/Profile.tsx` — neuer Abschnitt "Sichtbarkeit & Datenschutz" in den Einstellungen. Werte landen per `localStorage` (wie alle anderen UserProfile-Daten).

---

## 8. 850 neue Bots — Generierungsstrategie

Die 150 existierenden Einträge sind manuell geschrieben. 850 neue **nicht** manuell schreiben.

### Strategie: Generierte Kombinationen per Script

Ein einmaliges Node.js-Script (nicht Teil der App):

```
scripts/generateBots.ts  → Output: data/botUsers.ts
```

Das Script kombiniert:
- **Namen-Pool:** ~200 weibliche + ~50 männliche Namen aus realen Kulturen (DACH, TR, FR, ES, IT, RU, AR, JP, KR, IN, BR, US)
- **Städte-Pool:** ~120 Städte mit echten lat/lng
- **Traum-Summaries:** Template-Strings pro Kategorie × Sprache, randomisiert
- **Bio-Pool:** 40–60 kurze Texte (bereits ein `BIO_POOL` in DreamMap.tsx)
- **Contributions:** 3–5 Templates pro `type`

**90% weibliche Avatars** wie bisher beibehalten.

IDs: `u151` bis `u1000` (fortlaufend, keine UUID → einfaches Debugging).

Das generierte File wird **einmalig committet** und danach nicht mehr angerührt.

---

## 9. Zusammenfassung: Dateien & Änderungen

| Datei | Aktion | Was |
|---|---|---|
| `data/botUsers.ts` | **NEU erstellen** | `BOT_USERS: BotSimUser[]` mit 1000 Einträgen |
| `data/botUsers.ts` | **NEU** | `BotSimUser`-Interface + `BotContribution`-Interface |
| `components/DreamMap.tsx` | **Editieren** | `BASE_USERS` → import `BOT_USERS`; `SimUser` → `BotSimUser` |
| `components/DreamMap.tsx` | **Editieren** | Profil-Overlay um Contributions-Sektion + isFriend-Logik erweitern |
| `components/DreamMap.tsx` | **Editieren** | Connect-Button-Logik: kein Messaging, nur localStorage-Friend |
| `types.ts` | **Editieren** | `ProfileVisibility` + `CommunicationPreference` enums; `UserProfile` Felder |
| `components/Profile.tsx` | **Editieren** | Neuer Einstellungs-Abschnitt für Sichtbarkeit & Kommunikation |
| `config/featureFlags.ts` | **NEU erstellen** | `SHOW_BOT_USERS = true` |
| `scripts/generateBots.ts` | **NEU erstellen** | Einmalig, kein App-Code |

---

## 10. Nicht-Ziele (explizit ausgeschlossen)

- Bots senden keine Nachrichten
- Bots empfangen keine Nachrichten
- Bots antworten nicht (kein Webhook, kein Timer, kein Polling)
- Kein Backend, keine Datenbank
- Keine echten Bilder/Avatars (nur Emoji wie heute)
- Kein Freundschafts-System mit gegenseitiger Bestätigung
