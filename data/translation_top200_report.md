# Top-200 Translation Report (Phase 2B Full-Run)

**Datum:** 2026-04-18T20:03:30.642511+00:00
**Modell:** gemini-2.5-flash
**Laufzeit (nur neue Calls):** 1056.4s

## Zusammenfassung

- Ziel-Symbole: 200
- Abgearbeitet: **200**  (cached_from_pilot: **50**, new_api_calls: **150**)
- Interpretationen (DE-Felder über alle Symbole): **547**
- Prompt-Tokens: 57003, Output-Tokens: 28606, Sum: 85609 (Cap 800000)
- Kosten neu (USD): **$0.0886** _(Pilot-Cache-Kosten zuvor: ~$0.054)_
- Fehler: **0**, Oversize-Skips: 0
- Length-Anomalien (AR/DE <0.5 oder >1.7): **1** (0.5%)

## Length-Anomalien (AR/DE auffällig)

| Rank | Symbol | AR/DE ratio |
|---|---|---|
| 171 | `ertrinken` | 0.457 |

## Sample-Diffs (10 Symbole über Rang-Bereiche)

### Rank 5: Feuer (`natur_001`)  — source: `cached_pilot`

**DE:**
```json
{
  "freud": "Freud verbindet Feuer mit Leidenschaft, sexueller Erregung und den Gegensatz zwischen heißer Leidenschaft und emotionaler Kälte. Feuer im Traum symbolisiert oft verborgene oder heimliche Liebesgefühle.",
  "freud_alt": "Feuer steht für Destruktionswünsche und unkontrollierte Sexualenergie. Das Löschen von Feuer kann dem Wunsch nach Triebkontrolle entsprechen.",
  "ibn_sirin": [
    "**Unkontrolliertes Feuer:** Steht für **Krieg, Aufruhr, Streit** oder die **Strafe** von Autoritätspersonen.",
    "**Kontrolliertes Feuer (zum Kochen):** **Segen, Unterhalt** und **Gewinn**.",
    "**Feuer, das nur Rauch produziert:** **Angst** und **Drohungen** ohne tatsächlichen Schaden.",
    "**Sich im Feuer verbrennen:** Man wird **Geld durch Sünden** verdienen.",
    "**Feuer anbeten:** Man wird **korrupte oder atheistische** Menschen folgen."
  ],
  "ibn_sirin_alt": [
    "Feuer ohne Rauch und Schaden bedeutet Erleuchtung, Segen oder Nähe zu Gott. Feuer das verbrennt oder zerstört ist eine ernste Warnung vor Prüfungen, Konflikten oder Strafe."
  ],
  "jung": "Feuer ist das Symbol der Libido, Leidenschaft und Transformation. Es ist das alchemistische Element der Reinigung und der Wandlung des Unbewussten.",
  "church_fathers": "Feuer symbolisiert den Heiligen Geist (Pfingsten), göttliche Gegenwart (Brennender Dornbusch) und das Fegefeuer als Reinigungsort.",
  "tibetan": "Feuer ist eines der fünf Elemente und symbolisiert Weisheit, die Unwissenheit verbrennt. Unkontrolliertes Feuer steht für Gier und Begierde."
}
```

**EN:**
```json
{
  "freud": "Freud connects fire with passion, sexual arousal, and the contrast between hot passion and emotional coldness. Fire in a dream often symbolizes hidden or secret feelings of love.",
  "freud_alt": "Fire represents destructive desires and uncontrolled sexual energy. Extinguishing fire can correspond to the desire for impulse control.",
  "ibn_sirin": [
    "**Uncontrolled Fire:** Stands for **war, unrest, conflict** or the **punishment** from authorities.",
    "**Controlled Fire (for cooking):** **Blessing, sustenance** and **profit**.",
    "**Fire that only produces smoke:** **Fear** and **threats** without actual harm.",
    "**Burning oneself in fire:** One will earn **money through sins**.",
    "**Worshipping fire:** One will follow **corrupt or atheistic** people."
  ],
  "ibn_sirin_alt": [
    "Fire without smoke and harm means enlightenment, blessing, or closeness to God. Fire that burns or destroys is a serious warning of trials, conflicts, or punishment."
  ],
  "jung": "Fire is the symbol of libido, passion, and transformation. It is the alchemical element of purification and the transformation of the unconscious.",
  "church_fathers": "Fire symbolizes the Holy Spirit (Pentecost), divine presence (Burning Bush), and Purgatory as a place of purification.",
  "tibetan": "Fire is one of the five elements and symbolizes wisdom that burns ignorance. Uncontrolled fire stands for greed and desire."
}
```

**AR:**
```json
{
  "freud": "يربط فرويد النار بالشغف والإثارة الجنسية والتناقض بين الشغف الحار والبرود العاطفي. غالبًا ما ترمز النار في الحلم إلى مشاعر الحب الخفية أو السرية.",
  "freud_alt": "تمثل النار رغبات التدمير والطاقة الجنسية غير المنضبطة. قد يتوافق إطفاء النار مع الرغبة في التحكم بالدوافع.",
  "ibn_sirin": [
    "**النار غير المنضبطة:** تدل على **الحرب، الفتنة، النزاع** أو **العقوبة** من أصحاب السلطة.",
    "**النار المتحكَّم بها (للطبخ):** **بركة، رزق** و**ربح**.",
    "**النار التي تنتج دخانًا فقط:** **خوف** و**تهديدات** بدون ضرر فعلي.",
    "**الاحتراق بالنار:** سيكسب المرء **المال من خلال الذنوب**.",
    "**عبادة النار:** سيتبع المرء أناسًا **فاسدين أو ملحدين**."
  ],
  "ibn_sirin_alt": [
    "النار بدون دخان وضرر تعني التنوير، البركة أو القرب من الله. النار التي تحرق أو تدمر هي تحذير جاد من المحن، الصراعات أو العقوبة."
  ],
  "jung": "النار هي رمز الليبيدو، الشغف والتحول. إنها العنصر الخيميائي للتطهير وتحويل اللاوعي.",
  "church_fathers": "ترمز النار إلى الروح القدس (عيد العنصرة)، الحضور الإلهي (العليقة المشتعلة) والمطهر كمكان للتطهير.",
  "tibetan": "النار هي أحد العناصر الخمسة وترمز إلى الحكمة التي تحرق الجهل. النار غير المنضبطة تدل على الجشع والرغبة."
}
```

_Length AR/DE = 0.731_ ✓

### Rank 6: Wasser (`natur_006`)  — source: `cached_pilot`

**DE:**
```json
{
  "freud": "Wasser in Träumen steht für das Unbewusste, Geburt und das weibliche Prinzip. Es repräsentiert oft Emotionen und das Amnion (Fruchtwasser).",
  "freud_alt": "Wasser gilt als Geburt- und Muttersymbol. Eintauchen in Wasser kann den Wunsch nach Regression oder Geborgenheit ausdrücken.",
  "ibn_sirin": [
    "Klares Wasser bedeutet Segen, Reinheit des Herzens und Wohlstand. Trübes Wasser deutet auf Kummer, Fitna oder Krankheit hin. Fließendes Wasser symbolisiert Lebensunterhalt und Rizq."
  ],
  "jung": "Wasser repräsentiert das kollektive Unbewusste. Ruhiges Wasser steht für inneren Frieden; stürmisches Wasser für emotionale Aufruhr und unverarbeitete Gefühle.",
  "medieval": "Wasser steht für Taufe, Reinigung der Seele und göttliche Gnade. Sintflutartige Wasser mahnen zur Buße.",
  "tibetan": "Wasser symbolisiert Mitgefühl und Formlosigkeit. Das Spiegelbild im Wasser zeigt die Illusion des Selbst (Maya)."
}
```

**EN:**
```json
{
  "freud": "Water in dreams stands for the unconscious, birth, and the feminine principle. It often represents emotions and the amnion (amniotic fluid).",
  "freud_alt": "Water is considered a symbol of birth and motherhood. Immersion in water can express the desire for regression or security.",
  "ibn_sirin": [
    "Clear water signifies blessing, purity of heart, and prosperity. Turbid water indicates sorrow, Fitna, or illness. Flowing water symbolizes livelihood and Rizq."
  ],
  "jung": "Water represents the collective unconscious. Calm water stands for inner peace; stormy water for emotional turmoil and unprocessed feelings.",
  "medieval": "Water stands for baptism, purification of the soul, and divine grace. Flood-like waters admonish repentance.",
  "tibetan": "Water symbolizes compassion and formlessness. The reflection in water shows the illusion of the self (Maya)."
}
```

**AR:**
```json
{
  "freud": "الماء في الأحلام يرمز إلى اللاوعي، الولادة، والمبدأ الأنثوي. غالبًا ما يمثل العواطف والسائل الأمنيوسي (ماء الجنين).",
  "freud_alt": "يُعتبر الماء رمزًا للولادة والأمومة. الغوص في الماء قد يعبر عن الرغبة في التراجع (الارتداد) أو الأمان.",
  "ibn_sirin": [
    "الماء الصافي يعني البركة، نقاء القلب، والرخاء. الماء العكر يدل على الهم، الفتنة، أو المرض. الماء الجاري يرمز إلى الرزق والمعيشة."
  ],
  "jung": "الماء يمثل اللاوعي الجمعي. الماء الهادئ يرمز إلى السلام الداخلي؛ الماء العاصف إلى الاضطراب العاطفي والمشاعر غير المعالجة.",
  "medieval": "الماء يرمز إلى المعمودية، تطهير الروح، والنعمة الإلهية. المياه الطوفانية تحث على التوبة.",
  "tibetan": "الماء يرمز إلى التعاطف واللا شكلية. الانعكاس في الماء يظهر وهم الذات (مايا)."
}
```

_Length AR/DE = 0.77_ ✓

### Rank 17: Schlange (`tier_020`)  — source: `cached_pilot`

**DE:**
```json
{
  "freud": "Freud sah die Schlange als klassisches phallisches Symbol für unterdrückte Sexualität oder verbotene Triebe.",
  "ibn_sirin": [
    "Eine Schlange: Repräsentiert einen **Feind, eine Frau** oder **weltlichen Reichtum**.",
    "Eine Schlange töten: **Sieg** über einen Feind.",
    "Von einer Schlange gebissen werden: **Schaden** durch einen Feind."
  ],
  "ibn_sirin_alt": [
    "Eine Schlange symbolisiert einen Feind – je größer, desto mächtiger der Gegner. Eine Schlange töten bedeutet Sieg über den Feind. Weiße Schlangen können weise Berater bedeuten."
  ],
  "jung": "Die Schlange verkörpert die chthonische Energie des Unbewussten, Transformation und die Kraft der Heilung (Äskulapstab). Sie ist Archetyp des Schatten.",
  "church_fathers": "Die Schlange ist Symbol des Satans und der Versuchung seit dem Sündenfall. Sie mahnt zur Wachsamkeit vor Verführung.",
  "tibetan": "Im tibetischen Buddhismus steht die Schlange für Nāgas – Schutzgeister des Wassers. Gier ist einer der drei Gifte, symbolisiert durch die Schlange."
}
```

**EN:**
```json
{
  "freud": "Freud saw the snake as a classic phallic symbol for repressed sexuality or forbidden urges.",
  "ibn_sirin": [
    "A snake: Represents an **enemy, a woman**, or **worldly wealth**.",
    "Killing a snake: **Victory** over an enemy.",
    "Being bitten by a snake: **Harm** from an enemy."
  ],
  "ibn_sirin_alt": [
    "A snake symbolizes an enemy – the larger, the more powerful the adversary. Killing a snake means victory over the enemy. White snakes can signify wise advisors."
  ],
  "jung": "The snake embodies the chthonic energy of the unconscious, transformation, and the power of healing (Rod of Asclepius). It is an archetype of the shadow.",
  "church_fathers": "The snake is a symbol of Satan and temptation since the Fall. It warns against seduction.",
  "tibetan": "In Tibetan Buddhism, the snake stands for Nāgas – protective spirits of water. Greed is one of the three poisons, symbolized by the snake."
}
```

**AR:**
```json
{
  "freud": "رأى فرويد الثعبان رمزًا قضيبًا كلاسيكيًا للرغبة الجنسية المكبوتة أو الدوافع المحرمة.",
  "ibn_sirin": [
    "ثعبان: يمثل **عدوًا، امرأة** أو **ثروة دنيوية**.",
    "قتل ثعبان: **نصر** على عدو.",
    "التعرض للدغة ثعبان: **ضرر** من عدو."
  ],
  "ibn_sirin_alt": [
    "يرمز الثعبان إلى عدو – كلما كان أكبر، كان الخصم أقوى. قتل الثعبان يعني النصر على العدو. الثعابين البيضاء قد تعني مستشارين حكماء."
  ],
  "jung": "يمثل الثعبان الطاقة الخثونية (chthonic) لللاوعي، والتحول، وقوة الشفاء (عصا أسكليبيوس). إنه نموذج أصلي للظل.",
  "church_fathers": "الثعبان هو رمز للشيطان (Schaytan) والإغراء منذ السقوط (Sündenfall). إنه يحذر من الإغواء.",
  "tibetan": "في البوذية التبتية، يرمز الثعبان إلى الناغا (Nāgas) – أرواح الماء الحامية. الجشع هو أحد السموم الثلاثة، ويرمز إليه بالثعبان."
}
```

_Length AR/DE = 0.715_ ✓

### Rank 59: Mutter (`person_001`)  — source: `new_api_call`

**DE:**
```json
{
  "freud": "Die Mutter erscheint in Träumen oft in symbolischen Rollen. Freud beschreibt die Mutter als 'Störerin' der Liebesbestrebungen des Kindes, als Autorität und als Objekt früher sexueller Regungen.",
  "freud_alt": "Urquelle, Nahrung, Unbewusstes. Freud: Oedipus. Jung: Grosser Mutterarchetyp.",
  "ibn_sirin": [
    "Die Mutter sehen: **Trost, Gnade** und **Segen**.",
    "Mit der Mutter sprechen: **Sicherheit** und **Erleichterung**.",
    "Die Mutter verlieren: **Verlust des Trostes** und **große Sorgen**."
  ],
  "ibn_sirin_alt": [
    "Urquelle, Nahrung, Unbewusstes. Freud: Oedipus. Jung: Grosser Mutterarchetyp."
  ]
}
```

**EN:**
```json
{
  "freud": "The mother often appears in dreams in symbolic roles. Freud describes the mother as a 'disturber' of the child's love aspirations, as an authority, and as an object of early sexual impulses.",
  "freud_alt": "Primal source, nourishment, unconscious. Freud: Oedipus. Jung: Great Mother Archetype.",
  "ibn_sirin": [
    "Seeing the mother: **Comfort, grace** and **blessing**.",
    "Speaking with the mother: **Security** and **relief**.",
    "Losing the mother: **Loss of comfort** and **great worries**."
  ],
  "ibn_sirin_alt": [
    "Primal source, nourishment, unconscious. Freud: Oedipus. Jung: Great Mother Archetype."
  ]
}
```

**AR:**
```json
{
  "freud": "تظهر الأم في الأحلام غالبًا في أدوار رمزية. يصف فرويد الأم بأنها 'مُعَطِّلة' لطموحات الطفل العاطفية، كسلطة، وككائن للرغبات الجنسية المبكرة.",
  "freud_alt": "المصدر الأصلي، الغذاء، اللاوعي. فرويد: أوديب. يونغ: نموذج الأم الكبرى الأصلي.",
  "ibn_sirin": [
    "رؤية الأم: **راحة، رحمة** و**بركة**.",
    "التحدث مع الأم: **أمان** و**تخفيف**.",
    "فقدان الأم: **فقدان الراحة** و**هموم كبيرة**."
  ],
  "ibn_sirin_alt": [
    "المصدر الأصلي، الغذاء، اللاوعي. فرويد: أوديب. يونغ: نموذج الأم الكبرى الأصلي."
  ]
}
```

_Length AR/DE = 0.781_ ✓

### Rank 7: Mond (`natur_021`)  — source: `cached_pilot`

**DE:**
```json
{
  "ibn_sirin": [
    "Der Mond: Steht für einen **König, einen großen Gelehrten** oder die **Ehefrau**.",
    "Den Mond anbeten: **Umgang mit einem König** oder **großen Gelehrten**.",
    "Ein klarer, heller Mond: **Gutes Leben** und **Führung**."
  ],
  "ibn_sirin_alt": [
    "Der Mond symbolisiert einen Herrscher, König oder einen bedeutenden Gelehrten. Den Mond glänzend zu sehen verheißt Erfolg; den Mond verdunkeln zu sehen deutet auf Leid hin."
  ],
  "jung": "Der Mond ist das Anima-Symbol (die weibliche Seele im Mann) und steht für Intuition, das Unbewusste, Zyklen und die dunkle, unbekannte Seite der Psyche.",
  "medieval": "Der Mond steht für die Kirche, die das Licht Christi (Sonne) widerspiegelt. Mondphasen symbolisieren die Unbeständigkeit irdischer Dinge.",
  "western_zodiac": "Der Mond regiert das Gefühlsleben, Intuition, Mutter und Heimat. Mondträume spiegeln emotionale Zustände und unbewusste Bedürfnisse wider.",
  "zen": "Der Finger zeigt auf den Mond, doch der Finger ist nicht der Mond. Der Vollmond steht für vollständige Erleuchtung."
}
```

**EN:**
```json
{
  "ibn_sirin": [
    "The Moon: Represents a **king, a great scholar** or the **wife**.",
    "Worshipping the Moon: **Dealing with a king** or **great scholar**.",
    "A clear, bright Moon: **Good life** and **guidance**."
  ],
  "ibn_sirin_alt": [
    "The Moon symbolizes a ruler, king, or a significant scholar. Seeing the moon shining brightly portends success; seeing the moon darken indicates suffering."
  ],
  "jung": "The Moon is the Anima symbol (the feminine soul in man) and stands for intuition, the unconscious, cycles, and the dark, unknown side of the psyche.",
  "medieval": "The Moon represents the Church, which reflects the light of Christ (Sun). Moon phases symbolize the inconstancy of earthly things.",
  "western_zodiac": "The Moon governs emotional life, intuition, mother, and home. Moon dreams reflect emotional states and unconscious needs.",
  "zen": "The finger points to the moon, but the finger is not the moon. The full moon stands for complete enlightenment."
}
```

**AR:**
```json
{
  "ibn_sirin": [
    "القمر: يرمز إلى **ملك، عالم كبير** أو **الزوجة**.",
    "عبادة القمر: **التعامل مع ملك** أو **عالم كبير**.",
    "قمر صافٍ ومشرق: **حياة طيبة** و**هداية**."
  ],
  "ibn_sirin_alt": [
    "يرمز القمر إلى حاكم، ملك أو عالم جليل. رؤية القمر ساطعًا تبشر بالنجاح؛ ورؤية القمر مظلمًا تدل على المعاناة."
  ],
  "jung": "القمر هو رمز الأنيما (الروح الأنثوية في الرجل) ويمثل الحدس، اللاوعي، الدورات، والجانب المظلم والمجهول من النفس.",
  "medieval": "القمر يمثل الكنيسة التي تعكس نور المسيح (الشمس). أطوار القمر ترمز إلى عدم استقرار الأمور الدنيوية.",
  "western_zodiac": "القمر يحكم الحياة العاطفية، الحدس، الأم والوطن. أحلام القمر تعكس الحالات العاطفية والاحتياجات اللاواعية.",
  "zen": "الإصبع يشير إلى القمر، لكن الإصبع ليس القمر. البدر يرمز إلى التنوير الكامل."
}
```

_Length AR/DE = 0.687_ ✓

### Rank 1: Auto / Fahrzeug (`kb_auto___fahrzeug`)  — source: `cached_pilot`

**DE:**
```json
{
  "ibn_sirin": [
    "Ein Fahrzeug kann den Lebenspfad oder Status des Träumers symbolisieren. Ein Unfall warnt vor Rückschlägen. Selbst fahren zeigt Eigenverantwortung auf dem Lebensweg."
  ],
  "jung": "Das Auto repräsentiert das Ego und die Art, wie man das eigene Leben lenkt. Bremsenversagen = Kontrollverlust; falscher Weg = falsche Lebensentscheidungen.",
  "gestalt": "Im Gestalt-Ansatz ist jedes Element des Autos ein Aspekt des Selbst. Das Steuer ist die Kontrolle; der Motor die innere Energie und Motivation.",
  "modern_theology": "Moderne christliche Traumdeutung sieht das Auto als Symbol für Berufung und Lebensrichtung. Wer fährt, zeigt, wer das Leben kontrolliert – Gott oder das Ego.",
  "western_zodiac": "Astrolog. zeigt das Auto den Merkur-Einfluss (Reisen, Kommunikation). Mars-Transit kann Unfallträume begünstigen und Handlungsdruck signalisieren."
}
```

**EN:**
```json
{
  "ibn_sirin": [
    "A vehicle can symbolize the dreamer's life path or status. An accident warns of setbacks. Driving oneself shows personal responsibility on the path of life."
  ],
  "jung": "The car represents the ego and the way one steers one's own life. Brake failure = loss of control; wrong path = wrong life decisions.",
  "gestalt": "In the Gestalt approach, every element of the car is an aspect of the self. The steering wheel is control; the engine is inner energy and motivation.",
  "modern_theology": "Modern Christian dream interpretation sees the car as a symbol for calling and life direction. Who drives shows who controls life – God or the ego.",
  "western_zodiac": "Astrologically, the car shows the Mercury influence (travel, communication). Mars transit can favor accident dreams and signal pressure to act."
}
```

**AR:**
```json
{
  "ibn_sirin": [
    "يمكن للمركبة أن ترمز إلى مسار حياة الرائي أو مكانته. الحادث يحذر من النكسات. القيادة الذاتية تظهر المسؤولية الشخصية في مسار الحياة."
  ],
  "jung": "تمثل السيارة الأنا والطريقة التي يقود بها المرء حياته. عطل الفرامل = فقدان السيطرة؛ الطريق الخاطئ = قرارات حياة خاطئة.",
  "gestalt": "في منهج الجشطالت، كل عنصر من عناصر السيارة هو جانب من جوانب الذات. عجلة القيادة هي التحكم؛ المحرك هو الطاقة الداخلية والدافع.",
  "modern_theology": "تفسير الأحلام المسيحي الحديث يرى السيارة رمزًا للدعوة واتجاه الحياة. من يقود يظهر من يتحكم في الحياة – الله أو الأنا.",
  "western_zodiac": "فلكيًا، تظهر السيارة تأثير عطارد (السفر، التواصل). عبور المريخ يمكن أن يفضل أحلام الحوادث ويشير إلى ضغط لاتخاذ إجراء."
}
```

_Length AR/DE = 0.794_ ✓

### Rank 21: Hochzeit (`hochzeit`)  — source: `cached_pilot`

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

_Length AR/DE = 0.737_ ✓

### Rank 22: Berg (`kb_berg`)  — source: `cached_pilot`

**DE:**
```json
{
  "ibn_sirin": [
    "Einen Berg besteigen verheißt Erfolg, Rang und hohe Ziele. Auf einem Berggipfel stehen bedeutet Ehre und Ansehen. Vom Berg fallen warnt vor dem Verlust dieser Stellung."
  ],
  "jung": "Der Berg ist das höchste Selbst-Symbol. Der Aufstieg steht für den Individuationsprozess; der Gipfel für Erleuchtung und Integration.",
  "church_fathers": "Berge sind Orte der Gottesnähe (Sinai, Golgatha, Tabor). Im Traum ist der Berg-Aufstieg die Suche nach spiritueller Höhe und Gottesbegegnung.",
  "tibetan": "Der heilige Berg (Kailash) ist Achse der Welt (Axis Mundi). Aufstieg symbolisiert Dharma-Praxis; der Gipfel ist Nirwana."
}
```

**EN:**
```json
{
  "ibn_sirin": [
    "Climbing a mountain promises success, rank, and high goals. Standing on a mountaintop signifies honor and prestige. Falling from the mountain warns against the loss of this position."
  ],
  "jung": "The mountain is the highest symbol of the Self. The ascent represents the individuation process; the summit for enlightenment and integration.",
  "church_fathers": "Mountains are places of closeness to God (Sinai, Golgotha, Tabor). In a dream, climbing a mountain is the search for spiritual height and an encounter with God.",
  "tibetan": "The holy mountain (Kailash) is the Axis Mundi. Ascent symbolizes Dharma practice; the summit is Nirvana."
}
```

**AR:**
```json
{
  "ibn_sirin": [
    "صعود الجبل يبشر بالنجاح والمكانة والأهداف السامية. الوقوف على قمة الجبل يعني الشرف والهيبة. السقوط من الجبل يحذر من فقدان هذا المنصب."
  ],
  "jung": "الجبل هو أسمى رمز للذات. الصعود يمثل عملية التفرد؛ والقمة للوصول إلى التنوير والتكامل.",
  "church_fathers": "الجبال هي أماكن القرب من الله (سيناء، الجلجثة، طابور). في الحلم، صعود الجبل هو البحث عن السمو الروحي ولقاء الله.",
  "tibetan": "الجبل المقدس (كايلاش) هو محور العالم (Axis Mundi). الصعود يرمز لممارسة الدارما؛ والقمة هي النيرفانا."
}
```

_Length AR/DE = 0.767_ ✓

### Rank 23: Licht (`licht`)  — source: `cached_pilot`

**DE:**
```json
{
  "ibn_sirin": [
    "Licht im Traum ist ein Zeichen von Iman (Glaube), Wissen und göttlicher Führung. Allahs Licht (\"Allahu Nurus-Samawati\") zu erleben ist ein seltenes Zeichen spiritueller Erhebung."
  ],
  "jung": "Licht ist das Bewusstsein selbst. Traumlicht zeigt Erleuchtungsmomente, das Durchdringen des Unbewussten durch das Bewusstsein und spirituelle Intuition.",
  "church_fathers": "Christus als Licht der Welt (Johannes 8:12). Ein Lichtraum im Traum symbolisiert göttliche Gegenwart, Offenbarung und spirituelle Erkenntnis.",
  "tibetan": "Das \"klare Licht\" (Ösel) ist in der tibetischen Tradition das Zeichen vollständiger Erleuchtung. Es erscheint im Traum als Hinweis auf Rigpa (naturhafter Geisteszustand)."
}
```

**EN:**
```json
{
  "ibn_sirin": [
    "Light in a dream is a sign of Iman (faith), knowledge, and divine guidance. Experiencing Allah's light (\"Allahu Nurus-Samawati\") is a rare sign of spiritual elevation."
  ],
  "jung": "Light is consciousness itself. Dream light shows moments of enlightenment, the penetration of the unconscious by consciousness, and spiritual intuition.",
  "church_fathers": "Christ as the Light of the World (John 8:12). A space of light in a dream symbolizes divine presence, revelation, and spiritual insight.",
  "tibetan": "The \"clear light\" (Ösel) in the Tibetan tradition is the sign of complete enlightenment. It appears in a dream as an indication of Rigpa (natural state of mind)."
}
```

**AR:**
```json
{
  "ibn_sirin": [
    "النور في المنام علامة على الإيمان (إيمان)، والعلم، والهداية الإلهية. تجربة نور الله (\"الله نور السماوات\") هي علامة نادرة على السمو الروحي."
  ],
  "jung": "النور هو الوعي بحد ذاته. نور الحلم يظهر لحظات التنوير، واختراق اللاوعي بواسطة الوعي، والحدس الروحي.",
  "church_fathers": "المسيح كنور العالم (يوحنا 8:12). غرفة النور في المنام ترمز إلى الحضور الإلهي، والوحي، والمعرفة الروحية.",
  "tibetan": "الـ \"نور الواضح\" (Ösel) في التقاليد التبتية هو علامة التنوير الكامل. يظهر في المنام كإشارة إلى Rigpa (الحالة الذهنية الطبيعية)."
}
```

_Length AR/DE = 0.727_ ✓

### Rank 51: Fackel (`objekt_024`)  — source: `new_api_call`

**DE:**
```json
{
  "ibn_sirin": [
    "**Licht ohne Flamme:** Wissen, Führung und die Abkehr von Unwissenheit.",
    "**Brennende Fackel:** Reichtum, Ehre, langes Leben und Nachwuchs.",
    "**Fackel erlischt:** Der Tod eines Gelehrten oder ein Verlust an Wissen."
  ],
  "jung": "Erleuchtung, Fuehrung im Dunkeln."
}
```

**EN:**
```json
{
  "ibn_sirin": [
    "**Light without flame:** Knowledge, guidance, and turning away from ignorance.",
    "**Burning torch:** Wealth, honor, long life, and offspring.",
    "**Torch extinguishes:** The death of a scholar or a loss of knowledge."
  ],
  "jung": "Enlightenment, guidance in the dark."
}
```

**AR:**
```json
{
  "ibn_sirin": [
    "**نور بلا لهب:** علم، هداية، والابتعاد عن الجهل.",
    "**شعلة مشتعلة:** ثروة، شرف، طول عمر، وذرية.",
    "**انطفاء الشعلة:** موت عالم أو فقدان علم."
  ],
  "jung": "استنارة، هداية في الظلام."
}
```

_Length AR/DE = 0.651_ ✓
