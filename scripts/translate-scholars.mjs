#!/usr/bin/env node
/**
 * Übersetzt alle Scholar-Bios, Contributions und Subcategory-Titles/Subtitles
 * in alle 21 nicht-deutschen Sprachen via OpenRouter.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = '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';
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');

// ── Deutsche Quelltexte ────────────────────────────────────────────────────
const DE_SCHOLARS = {
  // ISLAMIC
  'scholars.islamic.0.bio': 'Muhammad ibn Sirin war einer der bedeutendsten islamischen Gelehrten und gilt als Begründer der islamischen Traumdeutung. Er lebte in Basra während der Umayyaden-Zeit und war bekannt für seine Frömmigkeit und sein enzyklopädisches Wissen.',
  'scholars.islamic.0.contribution': 'Sein Werk "Muntakhab al-Kalam fi Tafsir al-Ahlam" ist das älteste systematische Traumdeutungsbuch der islamischen Welt und wird bis heute als Referenzwerk genutzt.',
  'scholars.islamic.1.bio': 'Abd al-Ghani al-Nabulsi war ein syrischer Sufi-Gelehrter, Dichter und Mystiker. Er bereiste die gesamte islamische Welt und verfasste über 500 Werke zu Theologie, Philosophie und Traumdeutung.',
  'scholars.islamic.1.contribution': 'Sein Traumdeutungsbuch "Ta\'tir al-Anam fi Ta\'bir al-Manam" ist eines der umfassendsten Werke der islamischen Traumdeutung mit über 10.000 Traumsymbolen.',
  'scholars.islamic.2.bio': 'Al-Iskhafi war ein Gelehrter am Hof der Abbasiden in Bagdad während des goldenen Zeitalters des Islam. Er war Experte für Traumdeutung und Linguistik.',
  'scholars.islamic.2.contribution': 'Er verband linguistische Analyse mit Traumdeutung -- seine Methode, Traumsymbole über ihre sprachlichen Wurzeln zu deuten, war revolutionär und beeinflusst DreamCode\'s KI-Analyse bis heute.',

  // CHRISTIAN
  'scholars.christian.0.bio': 'Die Kirchenväter (Patres) waren frühchristliche Theologen wie Origenes, Augustinus und Gregor von Nyssa, die die christliche Lehre systematisierten.',
  'scholars.christian.0.contribution': 'Sie unterschieden drei Arten von Träumen: göttliche Offenbarungen (wie Josefs Traum), dämonische Versuchungen und natürliche Träume. Diese Klassifikation prägt die christliche Traumdeutung bis heute.',
  'scholars.christian.1.bio': 'Hildegard von Bingen war eine deutsche Benediktinerin, Äbtissin, Mystikerin, Heilkundige und Universalgelehrte. Sie ist eine der bedeutendsten Frauen des Mittelalters.',
  'scholars.christian.1.contribution': 'Ihre visionären Schriften verbinden Traumbilder mit kosmischer Ordnung und Heilkunst. Sie sah Träume als göttliche Kommunikation und Spiegel der Seele.',
  'scholars.christian.2.bio': 'Die moderne christliche Theologie integriert psychologische Erkenntnisse mit biblischer Symbolik. Theologen wie Paul Tillich und Eugen Drewermann haben die Traumdeutung in den zeitgenössischen christlichen Diskurs zurückgebracht.',
  'scholars.christian.2.contribution': 'Sie verbindet tiefenpsychologische Methoden mit spiritueller Tradition und bietet eine zeitgemäße Deutung, die sowohl Glauben als auch Wissenschaft respektiert.',

  // BUDDHIST
  'scholars.buddhist.0.bio': 'Die Zen-Tradition betont direkte Erfahrung und Meditation. Meister wie Bodhidharma und Dōgen lehrten, dass Träume die Natur des Geistes offenbaren -- weder festzuhalten noch abzulehnen.',
  'scholars.buddhist.0.contribution': 'Im Zen wird der Traum als Spiegel des wachen Bewusstseins betrachtet. Die Klarheit des Augenblicks -- ob im Traum oder im Wachen -- ist der Schlüssel zur Erkenntnis.',
  'scholars.buddhist.1.bio': 'Milarepa ist einer der berühmtesten tibetischen Yogis und Dichter. Nach einem früheren Leben voller Vergehen erreichte er durch Meditation die Erleuchtung in einem einzigen Leben.',
  'scholars.buddhist.1.contribution': 'Die tibetische Tradition des "Traumyoga" geht auf seine Lehren zurück. Träume werden als Übungsfeld für luzides Bewusstsein und als Vorstufe zur Erleuchtung betrachtet.',
  'scholars.buddhist.2.bio': 'Die Theravada-Tradition ist die älteste erhaltene buddhistische Schule. Zusammen mit den vedischen Lehren bildet sie ein tiefes Verständnis von Karma, Wiedergeburt und der Natur des Selbst.',
  'scholars.buddhist.2.contribution': 'Träume werden als Ausdruck von Karma und vergangenen Leben gedeutet. Sie offenbaren das wahre Selbst jenseits der Illusion und weisen den Weg zur Befreiung.',

  // ASTROLOGY
  'scholars.astrology.0.bio': 'Ptolemäus war ein griechisch-römischer Mathematiker, Astronom und Astrologe. Sein "Tetrabiblos" ist das einflussreichste Werk der westlichen Astrologie.',
  'scholars.astrology.0.contribution': 'Er systematisierte die Verbindung zwischen Himmelskörpern und menschlichem Schicksal. Die 12 Tierkreiszeichen, Häuser und Aspekte gehen auf sein System zurück.',
  'scholars.astrology.1.bio': 'Abu Ma\'shar al-Balkhi war der bedeutendste Astrologe der islamischen Welt. Er verband griechische, persische und indische Astrologie zu einem Gesamtsystem.',
  'scholars.astrology.1.contribution': 'Er verknüpfte als erster Traumdeutung systematisch mit Astrologie -- die Konstellation zum Zeitpunkt des Traums beeinflusst dessen Bedeutung. DreamCode nutzt dieses Prinzip.',
  'scholars.astrology.2.bio': 'Das System der astrologischen Häuser, Transite und Mondknoten bildet das Gerüst der horoskopartigen Traumanalyse. Jedes der 12 Häuser repräsentiert einen Lebensbereich.',
  'scholars.astrology.2.contribution': 'DreamCode berechnet den kosmischen Kontext deines Traums: Welche Planeten standen in welchen Häusern? Die Mondknoten offenbaren karmische Lektionen.',

  // PSYCHOLOGY
  'scholars.psychology.0.bio': 'Sigmund Freud war ein österreichischer Neurologe und der Begründer der Psychoanalyse. Er revolutionierte das Verständnis des menschlichen Geistes.',
  'scholars.psychology.0.contribution': 'Sein Hauptwerk "Die Traumdeutung" (1900) legte den Grundstein für die moderne Traumanalyse. Freud sah Träume als "Königsweg zum Unbewussten" -- als verschlüsselte Wunscherfüllungen.',
  'scholars.psychology.1.bio': 'Carl Gustav Jung war ein Schweizer Psychiater und der Begründer der Analytischen Psychologie. Zunächst Schüler Freuds, entwickelte er eigenständige Theorien über das Unbewusste.',
  'scholars.psychology.1.contribution': 'Jung entdeckte das "kollektive Unbewusste" und die Archetypen -- universelle Ursymbole, die in den Träumen aller Menschen weltweit auftauchen.',
  'scholars.psychology.2.bio': 'Friedrich "Fritz" Perls war ein deutsch-amerikanischer Psychiater und Psychotherapeut, der zusammen mit seiner Frau Laura die Gestalttherapie begründete.',
  'scholars.psychology.2.contribution': 'In der Gestalttherapie wird jeder Teil des Traums als Aspekt des Träumers selbst betrachtet. Der Träumer "spielt" verschiedene Traumelemente, um verdrängte Persönlichkeitsanteile zu integrieren.',

  // NUMEROLOGY
  'scholars.numerology.0.bio': 'Pythagoras von Samos war ein antiker griechischer Philosoph und Mathematiker. Er gründete die pythagoreische Schule, die Mathematik, Philosophie und Mystik verband.',
  'scholars.numerology.0.contribution': 'Er lehrte, dass Zahlen das Wesen aller Dinge sind. Die Lebenspfadzahl-Berechnung und die mystische Bedeutung der Zahlen 1-9 gehen auf seine Lehren zurück.',
  'scholars.numerology.1.bio': 'Das Ebjed-System (Abjad-Zahlensystem) ist eine der ältesten Methoden der Zahlenmystik im Islam. Jeder arabische Buchstabe hat einen numerischen Wert.',
  'scholars.numerology.1.contribution': 'Im Ebjed-System wird der Name des Träumers und die Schlüsselwörter des Traums in Zahlenwerte umgerechnet. DreamCode beherrscht sowohl das westliche als auch das Ebjed-System.',
  'scholars.numerology.2.bio': 'Die Kabbalah ist die mystische Tradition des Judentums. Die Gematria -- die Zuordnung von Zahlenwerten zu hebräischen Buchstaben -- ist ein Kernstück der kabbalistischen Praxis.',
  'scholars.numerology.2.contribution': 'Die Gematria enthüllt verborgene Verbindungen zwischen Wörtern gleichen Zahlenwerts. In der Traumdeutung verbindet sie Traumsymbole mit tieferen kosmischen Bedeutungen.',
  'scholars.numerology.3.bio': 'Die chinesische Zahlenmystik ist tief in der Kultur verwurzelt. Das System verbindet sich mit dem I Ging, den fünf Elementen und der Yin-Yang-Philosophie.',
  'scholars.numerology.3.contribution': 'In der Traumdeutung werden Zahlen nach ihrer phonetischen Ähnlichkeit und kosmischen Bedeutung analysiert. DreamCode integriert dieses System für Glücks- und Schicksalszahlen.',
  'scholars.numerology.4.bio': 'Die Traumzahlen-Analyse ist ein moderner, traditionsübergreifender Ansatz. Sie kombiniert pythagoreische, kabbalistische, Ebjed- und chinesische Zahlensymbolik.',
  'scholars.numerology.4.contribution': 'Was bedeuten Zahlen in deinem Traum? DreamCode analysiert jede Zahl über alle Traditionen hinweg und liefert eine vielschichtige Deutung -- von der Lebenspfadzahl bis zur karmischen Botschaft.',

  // JEWISH
  'scholars.jewish.0.bio': 'Der Traktat Berakhot im Babylonischen Talmud enthält die ältesten jüdischen Traumdeutungen. Träume gelten als 1/60 der Prophetie.',
  'scholars.jewish.0.contribution': 'Die talmudische Traumdeutung unterscheidet wahre (göttliche) und falsche Träume. Die 24 Traumdeuter von Jerusalem konnten den gleichen Traum 24 verschiedene Weisen deuten.',
  'scholars.jewish.1.bio': 'Der Zohar deutet Träume als Botschaften der Seele (Neschama). Die Seele verlässt im Schlaf den Körper und empfängt himmlische Botschaften.',
  'scholars.jewish.1.contribution': 'Die kabbalistischen Sefirot (Lebensbaum) bilden eine Landkarte der Seele. Traumsymbole werden den einzelnen Sefirot zugeordnet -- von Keter bis Malkhut.',
  'scholars.jewish.2.bio': 'Die biblische Traumdeutung Josephs (Genesis 37-41) ist Grundlage aller abrahamitischen Traumtradition. Seine Fähigkeit Träume zu deuten rettete Ägypten vor der Hungersnot.',
  'scholars.jewish.2.contribution': 'Joseph zeigte, dass Traumdeutung eine göttliche Gabe ist. Seine Methode: Symbole haben eine direkte, praktische Bedeutung für die Zukunft.',
  'scholars.jewish.3.bio': 'Philo von Alexandria war ein jüdisch-hellenistischer Philosoph. Er unterschied 3 Traumtypen: göttlich gesandte, von der Seele erzeugte, und gemischte Träume.',
  'scholars.jewish.3.contribution': 'Philo war der erste, der systematisch griechische Philosophie mit jüdischer Traumtradition verband. Seine Drei-Typen-Lehre beeinflusste christliche und islamische Traumgelehrte.',
  'scholars.jewish.4.bio': 'Das "Buch der Frommen" der deutschen Chassidim enthält detaillierte Traumregeln: Träume kurz nach Mitternacht gelten als wahrer.',
  'scholars.jewish.4.contribution': 'Praktische Traumregeln für den Alltag: Wann man träumen soll, wie man schlechte Träume abwenden kann (Hatavat Chalom), und welche Träume man ernst nehmen muss.',

  // SONNIKS
  'scholars.sonniks.0.bio': 'Traditionelle russische Traumdeutungsbücher (Sonniki) existieren seit dem 18. Jahrhundert. Sie basieren auf slawischer Volksüberlieferung und byzantinisch-orthodoxen Elementen.',
  'scholars.sonniks.0.contribution': 'Das Sonnik ist das meistgelesene Nachschlagewerk in russischen Haushalten. Alphabetisch geordnete Traumsymbole mit prägnanten Deutungen -- von Adler bis Zwilling.',
  'scholars.sonniks.1.bio': 'Baba Vanga war eine bulgarische Seherin. Ihre Traumdeutungen basieren auf slawischer Mystik und eigener prophetischer Erfahrung. Über 1 Million Menschen suchten sie auf.',
  'scholars.sonniks.1.contribution': 'Ihre Trauminterpretationen verbinden Symbole mit Zukunftsvoraussagen. Besonders populär: Wasserträume (Veränderung), Verstorbene im Traum (Warnung).',
  'scholars.sonniks.2.bio': 'Gustavus Hindman Miller schrieb "10.000 Dreams Interpreted" -- das meistgelesene Traumdeutungsbuch der Welt in slawischen Ländern.',
  'scholars.sonniks.2.contribution': 'Sachliche, symbolbasierte Deutungen ohne religiösen Hintergrund. Millers Lexikon ist die Basis vieler moderner Sonniki und Online-Traumdeutungsseiten in Russland.',
  'scholars.sonniks.3.bio': 'Adaptationen der prophetischen Werke von Michel de Nostredame für die Traumdeutung. In slawischen Sonniki werden seine Quatrains als Traumsymbol-Lexikon genutzt.',
  'scholars.sonniks.3.contribution': 'Besonders für apokalyptische oder politische Traumbilder: Krieg, Naturkatastrophen, Herrscherwechsel. Nostradamus-Sonniks sind die dramatischsten aller russischen Traumbücher.',
  'scholars.sonniks.4.bio': 'Osteuropäische Adaptationen von Freuds "Traumdeutung" (1899) für das Volksformat. Vereinfachte psychoanalytische Deutungen.',
  'scholars.sonniks.4.contribution': 'Bringt Freuds Symbolik (Wasser=Geburt, Fliegen=Freiheitswunsch) in zugängliche Sonnik-Form. Populär bei jüngeren Lesern, die psychologische Erklärungen bevorzugen.',

  // ANCIENT
  'scholars.ancient.0.bio': 'Artemidoros von Daldis schrieb das bedeutendste Traumdeutungsbuch der Antike: die Oneirocritica (5 Bände). Er unterschied prophetische von alltäglichen Träumen.',
  'scholars.ancient.0.contribution': 'Seine Methodik beeinflusste Ibn Sirin direkt. Artemidoros befragte über 1000 Menschen zu ihren Träumen -- die erste empirische Traumforschung der Geschichte.',
  'scholars.ancient.1.bio': 'Der Chester Beatty Papyrus III ist das älteste erhaltene Traumdeutungsbuch der Welt. Er enthält 108 Traumdeutungen. Tempel-Inkubation: Im Tempel schlafen um prophetische Träume zu empfangen.',
  'scholars.ancient.1.contribution': 'Die ägyptische Traumdeutung unterschied "gute" und "böse" Träume. Priester des Serapis waren professionelle Traumdeuter. Ihr System beeinflusste Griechenland und Rom direkt.',
  'scholars.ancient.2.bio': 'Mittelalterliches Traumdeutungsbuch, fälschlicherweise dem Propheten Daniel zugeschrieben. Über 100 lateinische Manuskripte erhalten.',
  'scholars.ancient.2.contribution': 'Alphabetisches Lexikon von Traumsymbolen. Basis der europäischen Volksüberlieferung. Das am weitesten verbreitete Traumbuch des Mittelalters -- von Mönchen bis Bauern.',
  'scholars.ancient.3.bio': 'Keilschrifttafeln aus der Bibliothek Assurbanipals. Systematische Sammlung von Traumdeutungen: "Wenn ein Mann im Traum fliegt -- Zeichen für..."',
  'scholars.ancient.3.contribution': 'Träume waren Botschaften der Götter. Professionelle Traumdeuter (sha\'ilu) deuteten sie am Königshof. Die älteste bekannte systematische Traumdeutung der Menschheit.',
  'scholars.ancient.4.bio': 'Ambrosius Macrobius kommentierte Ciceros Somnium Scipionis. Er entwickelte das einflussreichste antike Traumklassifikationssystem mit 5 Typen.',
  'scholars.ancient.4.contribution': 'Somnium, visio, oraculum, insomnium, visum -- diese 5 Traumtypen prägten das gesamte mittelalterliche Europa und beeinflussen die Traumforschung bis heute.',

  // SUBCATEGORY TITLES (German phrases that need translation)
  'trad.islamic.sub0.title': 'Ibn Sirin',
  'trad.islamic.sub0.subtitle': 'Klassische Traumdeutung (Basra, 7. Jh.)',
  'trad.islamic.sub1.title': 'Al-Nabulsi',
  'trad.islamic.sub1.subtitle': 'Mystische Symbolik (Damaskus, 17. Jh.)',
  'trad.islamic.sub2.title': 'Al-Iskhafi',
  'trad.islamic.sub2.subtitle': 'Linguistische Analyse (Bagdad, 9. Jh.)',

  'trad.christian.sub0.title': 'Kirchenväter',
  'trad.christian.sub0.subtitle': 'Göttliche Botschaften (Rom & Byzanz)',
  'trad.christian.sub1.title': 'Hildegard von Bingen',
  'trad.christian.sub1.subtitle': 'Visionäre Mystik (12. Jh.)',
  'trad.christian.sub2.title': 'Moderne Theologie',
  'trad.christian.sub2.subtitle': 'Zeitgemäße spirituelle Deutung',

  'trad.buddhist.sub0.title': 'Zen',
  'trad.buddhist.sub0.subtitle': 'Die Klarheit des Augenblicks (China & Japan)',
  'trad.buddhist.sub1.title': 'Tibetisches Traumyoga',
  'trad.buddhist.sub1.subtitle': 'Milarepa, Weg zur Erleuchtung',
  'trad.buddhist.sub2.title': 'Theravada & Vedisch',
  'trad.buddhist.sub2.subtitle': 'Karma und das wahre Selbst (Indien)',

  'trad.astrology.sub0.title': 'Zodiak & Tierkreiszeichen',
  'trad.astrology.sub0.subtitle': 'Ptolemäus, 12 Zeichen',
  'trad.astrology.sub1.title': 'Abu Ma\'shar',
  'trad.astrology.sub1.subtitle': 'Islamische Astrologie & Traumdeutung (Bagdad)',
  'trad.astrology.sub2.title': 'Häuser, Transite & Mondknoten',
  'trad.astrology.sub2.subtitle': 'Kosmischer Kontext',

  'trad.psychology.sub0.title': 'Sigmund Freud',
  'trad.psychology.sub0.subtitle': 'Verborgene Wünsche und Triebkräfte (Wien)',
  'trad.psychology.sub1.title': 'C.G. Jung',
  'trad.psychology.sub1.subtitle': 'Archetypen und kollektives Unbewusstes (Zürich)',
  'trad.psychology.sub2.title': 'Fritz Perls',
  'trad.psychology.sub2.subtitle': 'Gestalttherapie, ganzheitliches Erlebnis',

  'trad.numerology.sub0.title': 'Pythagoras',
  'trad.numerology.sub0.subtitle': 'Lebenspfadzahl und kosmische Ordnung',
  'trad.numerology.sub1.title': 'Ebjed (Abjad)',
  'trad.numerology.sub1.subtitle': 'Arabische Buchstaben-Zahlenmystik',
  'trad.numerology.sub2.title': 'Kabbalah & Gematria',
  'trad.numerology.sub2.subtitle': 'Hebräische Zahlencodes',
  'trad.numerology.sub3.title': 'Chinesische Numerologie',
  'trad.numerology.sub3.subtitle': 'Glücks- und Schicksalszahlen',
  'trad.numerology.sub4.title': 'Traumzahlen-Analyse',
  'trad.numerology.sub4.subtitle': 'Was bedeuten Zahlen in deinem Traum?',

  'trad.jewish.sub0.title': 'Talmud Berakhot',
  'trad.jewish.sub0.subtitle': 'Träume als 1/60 der Prophetie',
  'trad.jewish.sub1.title': 'Kabbalah / Zohar',
  'trad.jewish.sub1.subtitle': 'Sefirot und Seelenreise im Schlaf',
  'trad.jewish.sub2.title': 'Joseph-Deutung',
  'trad.jewish.sub2.subtitle': 'Biblische Traumdeutung (Genesis)',
  'trad.jewish.sub3.title': 'Philo von Alexandria',
  'trad.jewish.sub3.subtitle': 'Griechisch-jüdische Synthese',
  'trad.jewish.sub4.title': 'Sefer Hasidim',
  'trad.jewish.sub4.subtitle': 'Praktische Traumregeln (Rheinland)',

  'trad.sonniks.sub0.title': 'Russisches Sonnik',
  'trad.sonniks.sub0.subtitle': 'Traditionelle Volksüberlieferung',
  'trad.sonniks.sub1.title': 'Vanga (Wanga)',
  'trad.sonniks.sub1.subtitle': 'Bulgarische Seherin (1911-1996)',
  'trad.sonniks.sub2.title': 'Miller Sonnik',
  'trad.sonniks.sub2.subtitle': '10.000 Dreams Interpreted',
  'trad.sonniks.sub3.title': 'Nostradamus Adaptation',
  'trad.sonniks.sub3.subtitle': 'Prophetische Traumsymbolik',
  'trad.sonniks.sub4.title': 'Freudianisches Sonnik',
  'trad.sonniks.sub4.subtitle': 'Psychoanalyse im Volksformat',

  'trad.ancient.sub0.title': 'Artemidoros (Oneirocritica)',
  'trad.ancient.sub0.subtitle': 'Das Hauptwerk der Antike (2. Jh.)',
  'trad.ancient.sub1.title': 'Ägyptische Papyri',
  'trad.ancient.sub1.subtitle': 'Ältestes Traumbuch der Welt (1275 v.Chr.)',
  'trad.ancient.sub2.title': 'Somniale Danielis',
  'trad.ancient.sub2.subtitle': 'Europäisches Mittelalter-Lexikon',
  'trad.ancient.sub3.title': 'Assyrische Traumtexte',
  'trad.ancient.sub3.subtitle': 'Keilschrift aus Ninive (7. Jh. v.Chr.)',
  'trad.ancient.sub4.title': 'Macrobius Kommentar',
  'trad.ancient.sub4.subtitle': '5 Traumtypen (Rom, 400 n.Chr.)',
};

const LANGS = [
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Turkish' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'id', name: 'Indonesian' },
  { code: 'fa', name: 'Persian' },
  { code: 'it', name: 'Italian' },
  { code: 'pl', name: 'Polish' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ur', name: 'Urdu' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'sw', name: 'Swahili' },
  { code: 'hu', name: 'Hungarian' },
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Batch-Übersetzung: keys in Gruppen à 15 aufteilen
function chunkObj(obj, size) {
  const entries = Object.entries(obj);
  const chunks = [];
  for (let i = 0; i < entries.length; i += size) {
    chunks.push(Object.fromEntries(entries.slice(i, i + size)));
  }
  return chunks;
}

async function translateBatch(batch, langName, retries = 3) {
  const prompt = `Translate these UI strings from German to ${langName}.
Context: DreamCode dream interpretation app. Scholar names (Ibn Sirin, Freud, Jung, etc.) stay as-is. Dates/years stay as-is. "n. Chr." = "AD", "v. Chr." = "BC".
Return ONLY a valid JSON object with the exact same keys, no markdown, no extra text.

${JSON.stringify(batch, null, 2)}`;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const text = data.choices[0].message.content.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Kein JSON');
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error(`    Versuch ${i+1} fehler: ${err.message}`);
      if (i < retries - 1) await sleep([2000, 5000, 10000][i]);
    }
  }
  throw new Error('Alle Versuche fehlgeschlagen');
}

function appendKeysToFile(filePath, translations) {
  let content = fs.readFileSync(filePath, 'utf8');
  const newEntries = Object.entries(translations)
    .filter(([k]) => !content.includes(`"${k}"`))
    .map(([k, v]) => `  "${k}": ${JSON.stringify(v)}`)
    .join(',\n');
  if (!newEntries) return 0;
  content = content.replace(/\n\};(\s*)$/, `,\n${newEntries}\n};$1`);
  fs.writeFileSync(filePath, content, 'utf8');
  return Object.keys(translations).length;
}

async function main() {
  // 1. de.ts zuerst aktualisieren
  console.log('Aktualisiere de.ts...');
  appendKeysToFile(path.join(LOCALES_DIR, 'de.ts'), DE_SCHOLARS);
  console.log(`  ${Object.keys(DE_SCHOLARS).length} Keys in de.ts\n`);

  const chunks = chunkObj(DE_SCHOLARS, 15);
  console.log(`${Object.keys(DE_SCHOLARS).length} Keys in ${chunks.length} Batches à max 15\n`);

  for (const lang of LANGS) {
    const filePath = path.join(LOCALES_DIR, `${lang.code}.ts`);
    if (!fs.existsSync(filePath)) { console.log(`[SKIP] ${lang.code}.ts fehlt`); continue; }

    const existing = fs.readFileSync(filePath, 'utf8');
    if (existing.includes('"scholars.islamic.0.bio"')) {
      console.log(`[OK]   ${lang.code} — bereits vorhanden`);
      continue;
    }

    process.stdout.write(`[...] ${lang.code} (${lang.name}): `);
    const allTranslated = {};
    for (let i = 0; i < chunks.length; i++) {
      process.stdout.write(`${i+1}/${chunks.length} `);
      try {
        const result = await translateBatch(chunks[i], lang.name);
        Object.assign(allTranslated, result);
      } catch (err) {
        console.log(`\n  BATCH ${i+1} FEHLER: ${err.message}`);
        // Fallback: deutsche Texte verwenden
        Object.assign(allTranslated, chunks[i]);
      }
      await sleep(500);
    }
    appendKeysToFile(filePath, allTranslated);
    console.log('DONE');
    await sleep(300);
  }

  console.log('\nFertig!');
}

main().catch(console.error);
