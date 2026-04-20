# Translation Pilot Report (Phase 2B)

**Datum:** 2026-04-18T18:55:28.110219+00:00
**Modell:** `gemini-2.5-flash`
**Laufzeit:** 436.4s

## Zusammenfassung

- Symbole abgearbeitet: **50** von 50 geplant
- Interpretationen übersetzt (über alle Symbole): **217**
- API-Calls: **50** (cap 60)
- Prompt-Tokens: 23773, Output-Tokens: 18887, Summe: 42660 (cap 200000)
- Geschätzte Kosten: **$0.0543 USD**
- Fehler: 0
- Skipped (oversize): 0
- Length-Anomalien (AR/DE < 0.5 oder > 1.7): **0**

## Sample-Diffs (diverse Symbole)

### Meer / Ozean (`meer`)

**DE:**
```json
{
  "freud": "Das Meer steht für die ozeanische Empfindung – das Gefühl von Einheit mit dem Universum oder für pränatale Geborgenheit.",
  "ibn_sirin": [
    "Das Meer symbolisiert einen mächtigen Herrscher oder König. Im Meer schwimmen und sicher ankommen verheißt Triumph. Ertrinken bedeutet Überwältigung durch Probleme.",
    "Das Meer: Steht für einen **mächtigen König**, einen **weisen Gelehrten** oder das **Leben** selbst.",
    "Im Meer schwimmen: **Wissen** erlangen oder **Dienst** für eine Autoritätsperson.",
    "Trübes Meer: **Kummer, Sorgen** oder **ungerechter Herrscher**."
  ],
  "jung": "Das Meer ist das tiefste Symbol des kollektiven Unbewussten. Die Tiefe birgt Schätze (Selbstverwirklichung) und Gefahren (psychische Überwältigung).",
  "church_fathers": "Das Meer symbolisiert die Zeit, das Chaos vor der Schöpfung und die unberechenbare Welt. Christus über das Wasser gehend zeigt Beherrschung des Chaos.",
  "zen": "Der Ozean ist ein Bild für den Buddha-Geist: unendlich tief, an der Oberfläche bewegt, im Kern absolut ruhig."
}
```

**EN:**
```json
{
  "freud": "The sea represents the oceanic feeling – the sense of unity with the universe or prenatal security.",
  "ibn_sirin": [
    "The sea symbolizes a powerful ruler or king. Swimming in the sea and arriving safely promises triumph. Drowning means being overwhelmed by problems.",
    "The sea: Stands for a **powerful king**, a **wise scholar**, or **life** itself.",
    "Swimming in the sea: Gaining **knowledge** or **service** for an authority figure.",
    "Turbid sea: **Grief, worries** or an **unjust ruler**."
  ],
  "jung": "The sea is the deepest symbol of the collective unconscious. Its depth holds treasures (self-realization) and dangers (psychological overwhelm).",
  "church_fathers": "The sea symbolizes time, the chaos before creation, and the unpredictable world. Christ walking on water shows mastery over chaos.",
  "zen": "The ocean is an image for the Buddha-mind: infinitely deep, agitated on the surface, absolutely calm at its core."
}
```

**AR:**
```json
{
  "freud": "البحر يمثل الإحساس المحيطي – شعور الوحدة مع الكون أو الأمان قبل الولادة.",
  "ibn_sirin": [
    "البحر يرمز إلى حاكم قوي أو ملك. السباحة في البحر والوصول بأمان تبشر بالنصر. الغرق يعني الغلبة بالمشاكل.",
    "البحر: يرمز إلى **ملك قوي**، أو **عالم حكيم**، أو **الحياة** نفسها.",
    "السباحة في البحر: اكتساب **العلم** أو **الخدمة** لشخص ذي سلطة.",
    "البحر العكر: **هموم، أحزان** أو **حاكم ظالم**."
  ],
  "jung": "البحر هو أعمق رمز لللاوعي الجمعي. عمقه يحمل كنوزًا (تحقيق الذات) ومخاطر (إرهاق نفسي).",
  "church_fathers": "البحر يرمز إلى الزمن، الفوضى قبل الخلق، والعالم الذي لا يمكن التنبؤ به. مشي المسيح على الماء يظهر السيطرة على الفوضى.",
  "zen": "المحيط صورة لروح البوذا: عميق بلا نهاية، متحرك على السطح، وهادئ تمامًا في جوهره."
}
```

_Length AR/DE = 0.676_  ✓

### Engel (`engel`)

**DE:**
```json
{
  "ibn_sirin": [
    "Engel im Traum sind Träger göttlicher Botschaften. Sie zeigen an, dass der Träumer ein gläubiges Herz hat. Jibril (Gabriel) zu sehen gilt als höchste spirituelle Gabe."
  ],
  "jung": "Engel sind Botschafter des Selbst – Archetypen des Heiligen Geistes und höherer Bewusstseinszustände. Sie vermitteln Weisheit aus dem kollektiven Unbewussten.",
  "church_fathers": "Engel sind Gottes Boten (Angeloi). Bibelträume mit Engeln (Jakobs Traum, Josephs Träume) galten als direkte göttliche Kommunikation.",
  "tibetan": "Dakinis und Dharmapälas sind tibetische Entsprechungen – Schutzgottheiten und Weisheitswesen, die in Träumen erscheinen und spirituelle Praktiken fördern."
}
```

**EN:**
```json
{
  "ibn_sirin": [
    "Angels in a dream are bearers of divine messages. They indicate that the dreamer has a believing heart. Seeing Jibril (Gabriel) is considered the highest spiritual gift."
  ],
  "jung": "Angels are messengers of the Self – archetypes of the Holy Spirit and higher states of consciousness. They convey wisdom from the collective unconscious.",
  "church_fathers": "Angels are God's messengers (Angeloi). Biblical dreams with angels (Jacob's dream, Joseph's dreams) were considered direct divine communication.",
  "tibetan": "Dakinis and Dharmapalas are Tibetan equivalents – protective deities and wisdom beings that appear in dreams and promote spiritual practices."
}
```

**AR:**
```json
{
  "ibn_sirin": [
    "الملائكة في المنام هم حملة الرسائل الإلهية. إنهم يشيرون إلى أن الرائي يمتلك قلباً مؤمناً. رؤية جبريل (Gabriel) تُعتبر أسمى هبة روحية."
  ],
  "jung": "الملائكة هم رسل الذات – نماذج أصلية للروح القدس وحالات الوعي الأعلى. إنهم ينقلون الحكمة من اللاوعي الجمعي.",
  "church_fathers": "الملائكة هم رسل الله (Angeloi). أحلام الكتاب المقدس التي تتضمن الملائكة (حلم يعقوب، أحلام يوسف) كانت تُعتبر تواصلاً إلهياً مباشراً.",
  "tibetan": "الداكينيون والدارمابالاس هم نظراء تبتيون – آلهة حامية وكائنات حكيمة تظهر في الأحلام وتعزز الممارسات الروحية."
}
```

_Length AR/DE = 0.782_  ✓

### Hochzeit (`hochzeit`)

**DE:**
```json
{
  "ibn_sirin": [
    "Eine Hochzeit träumen verheißt Freude, Segen und neue Verbindungen. Für Unverheiratete kann es eine bevorstehende Ehe andeuten. Für Kranke soll es jedoch Vorsicht geboten sein."
  ],
  "jung": "Die \"hieros gamos\" (heilige Hochzeit) ist das Symbol der Vereinigung von Animus und Anima – der Integration von männlichen und weiblichen Aspekten des Selbst.",
  "medieval": "Die Hochzeit Christi mit der Kirche (Apokalypse) ist das Urbild. Hochzeitsträume deuten auf Berufung, mystische Union mit Gott oder neue geistliche Verpflichtungen.",
  "western_zodiac": "Venus-Jupiter-Konjunktionen begleiten oft Hochzeitsträume. Sie zeigen das Bedürfnis nach harmonischen Beziehungen und Vereinigung gegensätzlicher Kräfte."
}
```

**EN:**
```json
{
  "ibn_sirin": [
    "Dreaming of a wedding portends joy, blessings, and new connections. For unmarried individuals, it can indicate an impending marriage. For the sick, however, caution should be exercised."
  ],
  "jung": "The \"hieros gamos\" (sacred marriage) is the symbol of the union of Animus and Anima – the integration of masculine and feminine aspects of the self.",
  "medieval": "The marriage of Christ with the Church (Apocalypse) is the archetype. Wedding dreams indicate calling, mystical union with God, or new spiritual obligations.",
  "western_zodiac": "Venus-Jupiter conjunctions often accompany wedding dreams. They show the need for harmonious relationships and the unification of opposing forces."
}
```

**AR:**
```json
{
  "ibn_sirin": [
    "رؤية الزواج في المنام تبشر بالفرح والبركات وعلاقات جديدة. بالنسبة لغير المتزوجين، قد يشير إلى زواج وشيك. أما بالنسبة للمرضى، فيجب توخي الحذر."
  ],
  "jung": "الـ \"هيروس غاموس\" (الزواج المقدس) هو رمز اتحاد الأنيماس والأنيما – دمج الجوانب الذكورية والأنثوية للذات.",
  "medieval": "زواج المسيح بالكنيسة (الرؤيا) هو النموذج الأصلي. أحلام الزواج تشير إلى دعوة، اتحاد صوفي مع الله، أو التزامات روحية جديدة.",
  "western_zodiac": "اقترانات الزهرة والمشتري غالبًا ما تصاحب أحلام الزواج. إنها تظهر الحاجة إلى علاقات متناغمة وتوحيد القوى المتعارضة."
}
```

_Length AR/DE = 0.737_  ✓

### Schwangerschaft (`schwangerschaft`)

**DE:**
```json
{
  "freud": "Schwangerschaftsträume bei Frauen können Wunsch nach Mutterschaft oder Angst vor Schwangerschaft ausdrücken. Bei Männern zeigen sie Schöpfungswunsch.",
  "ibn_sirin": [
    "Schwangerschaft träumen verheißt Freude, ein neues Projekt, wachsenden Wohlstand oder eine neue Verantwortung. Für Männer kann es auf finanzielles Wachstum hinweisen."
  ],
  "jung": "Schwangerschaft symbolisiert die Reifung eines neuen Aspekts des Selbst oder eines kreativen Projekts, das geboren werden will.",
  "church_fathers": "Schwangerschaft steht für das Neue Leben in Christus und geistliche Fruchtbarkeit. Maria als Archetyp der empfangenden Seele."
}
```

**EN:**
```json
{
  "freud": "Pregnancy dreams in women can express a desire for motherhood or fear of pregnancy. In men, they show a desire for creation.",
  "ibn_sirin": [
    "Dreaming of pregnancy portends joy, a new project, growing prosperity, or a new responsibility. For men, it can indicate financial growth."
  ],
  "jung": "Pregnancy symbolizes the maturation of a new aspect of the self or a creative project that wants to be born.",
  "church_fathers": "Pregnancy stands for the New Life in Christ and spiritual fertility. Mary as an archetype of the receptive soul."
}
```

**AR:**
```json
{
  "freud": "أحلام الحمل لدى النساء قد تعبر عن رغبة في الأمومة أو خوف من الحمل. أما لدى الرجال، فتشير إلى رغبة في الإبداع.",
  "ibn_sirin": [
    "الحلم بالحمل يبشر بالفرح، مشروع جديد، ازدهار متزايد، أو مسؤولية جديدة. بالنسبة للرجال، قد يشير إلى نمو مالي."
  ],
  "jung": "الحمل يرمز إلى نضوج جانب جديد من الذات أو مشروع إبداعي يرغب في أن يولد.",
  "church_fathers": "الحمل يمثل الحياة الجديدة في المسيح والخصوبة الروحية. مريم كنموذج أصلي للنفس المتلقية."
}
```

_Length AR/DE = 0.66_  ✓

### König (`koenig`)

**DE:**
```json
{
  "freud": "Der Träumer selbst nimmt in solchen Träumen oft die Rolle des Prinzen oder der Prinzessin ein.",
  "freud_alt": "Repräsentiert in der Regel den Vater oder eine väterliche Autoritätsfigur.",
  "ibn_sirin": [
    "Macht, Selbst, hoehere Autorität. Islam: Herrscher, Allah."
  ],
  "ibn_sirin_alt": [
    "Macht, Selbst, hoehere Autoritaet. Islam: Herrscher, Allah."
  ],
  "jung": "Macht, Selbst, hoehere Autoritaet. Islam: Herrscher, Allah."
}
```

**EN:**
```json
{
  "freud": "The dreamer himself often takes on the role of the prince or princess in such dreams.",
  "freud_alt": "Usually represents the father or a paternal authority figure.",
  "ibn_sirin": [
    "Power, Self, higher authority. Islam: Ruler, Allah."
  ],
  "ibn_sirin_alt": [
    "Power, Self, higher authority. Islam: Ruler, Allah."
  ],
  "jung": "Power, Self, higher authority. Islam: Ruler, Allah."
}
```

**AR:**
```json
{
  "freud": "الحالم نفسه غالبًا ما يتخذ دور الأمير أو الأميرة في مثل هذه الأحلام.",
  "freud_alt": "يمثل عادة الأب أو شخصية سلطوية أبوية.",
  "ibn_sirin": [
    "القوة، الذات، السلطة العليا. الإسلام: الحاكم، الله."
  ],
  "ibn_sirin_alt": [
    "القوة، الذات، السلطة العليا. الإسلام: الحاكم، الله."
  ],
  "jung": "القوة، الذات، السلطة العليا. الإسلام: الحاكم، الله."
}
```

_Length AR/DE = 0.75_  ✓
