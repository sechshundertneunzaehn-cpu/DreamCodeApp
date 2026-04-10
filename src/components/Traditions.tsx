import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Brain, BookOpen, Sun, Sparkles, MessageSquare, Fingerprint, X, Info, ChevronRight, Star, ScrollText, Landmark, Lock } from 'lucide-react';
import { useLang } from '../i18n/useLang';

// ========== GELEHRTE MIT BIO ==========
interface Scholar {
  name: string;
  years: string;
  location: string;
  bio: string;
  contribution: string;
  bioKey: string;
  contributionKey: string;
  yearsKey?: string;
  locationKey?: string;
}

const SCHOLARS: Record<string, Scholar[]> = {
  islamic: [
    {
      name: 'Ibn Sirin',
      years: '653–729 AD',
      location: 'Basra, Iraq',
      bio: 'Muhammad ibn Sirin war einer der bedeutendsten islamischen Gelehrten und gilt als Begründer der islamischen Traumdeutung. Er lebte in Basra während der Umayyaden-Zeit und war bekannt für seine Frömmigkeit und sein enzyklopädisches Wissen.',
      contribution: 'Sein Werk "Muntakhab al-Kalam fi Tafsir al-Ahlam" ist das älteste systematische Traumdeutungsbuch der islamischen Welt und wird bis heute als Referenzwerk genutzt.',
      bioKey: 'scholars.islamic.0.bio',
      contributionKey: 'scholars.islamic.0.contribution',
    },
    {
      name: 'Al-Nabulsi',
      years: '1641–1731 AD',
      location: 'Damascus, Syria',
      bio: 'Abd al-Ghani al-Nabulsi war ein syrischer Sufi-Gelehrter, Dichter und Mystiker. Er bereiste die gesamte islamische Welt und verfasste über 500 Werke zu Theologie, Philosophie und Traumdeutung.',
      contribution: 'Sein Traumdeutungsbuch "Ta\'tir al-Anam fi Ta\'bir al-Manam" ist eines der umfassendsten Werke der islamischen Traumdeutung mit über 10.000 Traumsymbolen.',
      bioKey: 'scholars.islamic.1.bio',
      contributionKey: 'scholars.islamic.1.contribution',
    },
    {
      name: 'Al-Iskhafi',
      years: '9th century AD',
      location: 'Baghdad, Iraq',
      bio: 'Al-Iskhafi war ein Gelehrter am Hof der Abbasiden in Bagdad während des goldenen Zeitalters des Islam. Er war Experte für Traumdeutung und Linguistik.',
      contribution: 'Er verband linguistische Analyse mit Traumdeutung -- seine Methode, Traumsymbole über ihre sprachlichen Wurzeln zu deuten, war revolutionär und beeinflusst DreamCode\'s KI-Analyse bis heute.',
      bioKey: 'scholars.islamic.2.bio',
      contributionKey: 'scholars.islamic.2.contribution',
    },
  ],
  christian: [
    {
      name: 'Kirchenväter',
      years: '2nd–5th century',
      location: 'Rome & Byzantium',
      bio: 'Die Kirchenväter (Patres) waren frühchristliche Theologen wie Origenes, Augustinus und Gregor von Nyssa, die die christliche Lehre systematisierten.',
      contribution: 'Sie unterschieden drei Arten von Träumen: göttliche Offenbarungen (wie Josefs Traum), dämonische Versuchungen und natürliche Träume. Diese Klassifikation prägt die christliche Traumdeutung bis heute.',
      bioKey: 'scholars.christian.0.bio',
      contributionKey: 'scholars.christian.0.contribution',
    },
    {
      name: 'Hildegard von Bingen',
      years: '1098–1179',
      location: 'Rhineland, Germany',
      locationKey: 'scholar.loc.rhineland',
      bio: 'Hildegard von Bingen war eine deutsche Benediktinerin, Äbtissin, Mystikerin, Heilkundige und Universalgelehrte. Sie ist eine der bedeutendsten Frauen des Mittelalters.',
      contribution: 'Ihre visionären Schriften verbinden Traumbilder mit kosmischer Ordnung und Heilkunst. Sie sah Träume als göttliche Kommunikation und Spiegel der Seele.',
      bioKey: 'scholars.christian.1.bio',
      contributionKey: 'scholars.christian.1.contribution',
    },
    {
      name: 'Moderne Theologie',
      years: '20th–21st century',
      location: 'Worldwide',
      locationKey: 'scholar.loc.worldwide',
      bio: 'Die moderne christliche Theologie integriert psychologische Erkenntnisse mit biblischer Symbolik. Theologen wie Paul Tillich und Eugen Drewermann haben die Traumdeutung in den zeitgenössischen christlichen Diskurs zurückgebracht.',
      contribution: 'Sie verbindet tiefenpsychologische Methoden mit spiritueller Tradition und bietet eine zeitgemäße Deutung, die sowohl Glauben als auch Wissenschaft respektiert.',
      bioKey: 'scholars.christian.2.bio',
      contributionKey: 'scholars.christian.2.contribution',
    },
  ],
  buddhist: [
    {
      name: 'Zen-Tradition',
      years: 'Since the 6th century',
      yearsKey: 'scholar.since6c',
      location: 'China & Japan',
      bio: 'Die Zen-Tradition betont direkte Erfahrung und Meditation. Meister wie Bodhidharma und Dōgen lehrten, dass Träume die Natur des Geistes offenbaren -- weder festzuhalten noch abzulehnen.',
      contribution: 'Im Zen wird der Traum als Spiegel des wachen Bewusstseins betrachtet. Die Klarheit des Augenblicks -- ob im Traum oder im Wachen -- ist der Schlüssel zur Erkenntnis.',
      bioKey: 'scholars.buddhist.0.bio',
      contributionKey: 'scholars.buddhist.0.contribution',
    },
    {
      name: 'Milarepa',
      years: '1052–1135',
      location: 'Tibet, Himalaya',
      bio: 'Milarepa ist einer der berühmtesten tibetischen Yogis und Dichter. Nach einem früheren Leben voller Vergehen erreichte er durch Meditation die Erleuchtung in einem einzigen Leben.',
      contribution: 'Die tibetische Tradition des "Traumyoga" geht auf seine Lehren zurück. Träume werden als Übungsfeld für luzides Bewusstsein und als Vorstufe zur Erleuchtung betrachtet.',
      bioKey: 'scholars.buddhist.1.bio',
      contributionKey: 'scholars.buddhist.1.contribution',
    },
    {
      name: 'Theravada & Vedisch',
      years: 'Since the 3rd century BCE',
      yearsKey: 'scholar.since3cBce',
      location: 'India & Southeast Asia',
      bio: 'Die Theravada-Tradition ist die älteste erhaltene buddhistische Schule. Zusammen mit den vedischen Lehren bildet sie ein tiefes Verständnis von Karma, Wiedergeburt und der Natur des Selbst.',
      contribution: 'Träume werden als Ausdruck von Karma und vergangenen Leben gedeutet. Sie offenbaren das wahre Selbst jenseits der Illusion und weisen den Weg zur Befreiung.',
      bioKey: 'scholars.buddhist.2.bio',
      contributionKey: 'scholars.buddhist.2.contribution',
    },
  ],
  astrology: [
    {
      name: 'Claudius Ptolemäus',
      years: 'ca. 100–170 AD',
      location: 'Alexandria, Egypt',
      bio: 'Ptolemäus war ein griechisch-römischer Mathematiker, Astronom und Astrologe. Sein "Tetrabiblos" ist das einflussreichste Werk der westlichen Astrologie.',
      contribution: 'Er systematisierte die Verbindung zwischen Himmelskörpern und menschlichem Schicksal. Die 12 Tierkreiszeichen, Häuser und Aspekte gehen auf sein System zurück.',
      bioKey: 'scholars.astrology.0.bio',
      contributionKey: 'scholars.astrology.0.contribution',
    },
    {
      name: 'Abu Ma\'shar',
      years: '787–886 AD',
      location: 'Baghdad, Iraq',
      bio: 'Abu Ma\'shar al-Balkhi war der bedeutendste Astrologe der islamischen Welt. Er verband griechische, persische und indische Astrologie zu einem Gesamtsystem.',
      contribution: 'Er verknüpfte als erster Traumdeutung systematisch mit Astrologie -- die Konstellation zum Zeitpunkt des Traums beeinflusst dessen Bedeutung. DreamCode nutzt dieses Prinzip.',
      bioKey: 'scholars.astrology.1.bio',
      contributionKey: 'scholars.astrology.1.contribution',
    },
    {
      name: 'Häuser & Transite',
      years: 'Antiquity to Present',
      yearsKey: 'scholar.antiquityPresent',
      location: 'Worldwide',
      locationKey: 'scholar.loc.worldwide',
      bio: 'Das System der astrologischen Häuser, Transite und Mondknoten bildet das Gerüst der horoskopartigen Traumanalyse. Jedes der 12 Häuser repräsentiert einen Lebensbereich, Transite zeigen aktuelle kosmische Einflüsse.',
      contribution: 'DreamCode berechnet den kosmischen Kontext deines Traums: Welche Planeten standen in welchen Häusern? Welche Transite waren aktiv? Die Mondknoten offenbaren karmische Lektionen.',
      bioKey: 'scholars.astrology.2.bio',
      contributionKey: 'scholars.astrology.2.contribution',
    },
  ],
  psychology: [
    {
      name: 'Sigmund Freud',
      years: '1856–1939',
      location: 'Vienna, Austria',
      bio: 'Sigmund Freud war ein österreichischer Neurologe und der Begründer der Psychoanalyse. Er revolutionierte das Verständnis des menschlichen Geistes und gilt als einer der einflussreichsten Denker des 20. Jahrhunderts.',
      contribution: 'Sein Hauptwerk "Die Traumdeutung" (1900) legte den Grundstein für die moderne Traumanalyse. Freud sah Träume als "Königsweg zum Unbewussten" -- als verschlüsselte Wunscherfüllungen, die verborgene Triebe und Konflikte offenbaren.',
      bioKey: 'scholars.psychology.0.bio',
      contributionKey: 'scholars.psychology.0.contribution',
    },
    {
      name: 'C.G. Jung',
      years: '1875–1961',
      location: 'Zurich, Switzerland',
      bio: 'Carl Gustav Jung war ein Schweizer Psychiater und der Begründer der Analytischen Psychologie. Zunächst Schüler Freuds, entwickelte er eigenständige Theorien über das Unbewusste.',
      contribution: 'Jung entdeckte das "kollektive Unbewusste" und die Archetypen -- universelle Ursymbole, die in den Träumen aller Menschen weltweit auftauchen. Seine Methode der Amplifikation erweitert Traumsymbole über Mythen, Märchen und Kulturgeschichte.',
      bioKey: 'scholars.psychology.1.bio',
      contributionKey: 'scholars.psychology.1.contribution',
    },
    {
      name: 'Fritz Perls',
      years: '1893–1970',
      location: 'Berlin / California',
      bio: 'Friedrich "Fritz" Perls war ein deutsch-amerikanischer Psychiater und Psychotherapeut, der zusammen mit seiner Frau Laura die Gestalttherapie begründete.',
      contribution: 'In der Gestalttherapie wird jeder Teil des Traums als Aspekt des Träumers selbst betrachtet. Der Träumer "spielt" verschiedene Traumelemente, um verdrängte Persönlichkeitsanteile zu integrieren. DreamCode nutzt diesen Ansatz für ganzheitliche Analysen.',
      bioKey: 'scholars.psychology.2.bio',
      contributionKey: 'scholars.psychology.2.contribution',
    },
  ],
  jewish: [
    {
      name: 'Talmud Berakhot',
      years: 'ca. 200–500 AD',
      location: 'Babylon / Israel',
      bio: 'Der Traktat Berakhot im Babylonischen Talmud enthaelt die aeltesten juedischen Traumdeutungen. Traeume gelten als 1/60 der Prophetie. Rabbi Hisda lehrte: Ein ungedeuteter Traum ist wie ein ungelesener Brief.',
      contribution: 'Die talmudische Traumdeutung unterscheidet wahre (goettliche) und falsche Traeume. Die 24 Traumdeuter von Jerusalem konnten den gleichen Traum 24 verschiedene Weisen deuten -- alle gueltig.',
      bioKey: 'scholars.jewish.0.bio',
      contributionKey: 'scholars.jewish.0.contribution',
    },
    {
      name: 'Kabbalah / Zohar',
      years: '13th century',
      location: 'Southern France / Spain',
      locationKey: 'scholar.loc.southFranceSpain',
      bio: 'Der Zohar deutet Traeume als Botschaften der Seele (Neschama). Die Seele verlaesst im Schlaf den Koerper und empfaengt himmlische Botschaften. Kabbalistische Traumdeutung verbindet Symbole mit den 10 Sefirot.',
      contribution: 'Die kabbalistischen Sefirot (Lebensbaum) bilden eine Landkarte der Seele. Traumsymbole werden den einzelnen Sefirot zugeordnet -- von Keter (Krone, goettlicher Wille) bis Malkhut (irdische Manifestation).',
      bioKey: 'scholars.jewish.1.bio',
      contributionKey: 'scholars.jewish.1.contribution',
    },
    {
      name: 'Joseph-Deutung',
      years: 'ca. 1700 BCE (tradition)',
      location: 'Canaan / Egypt',
      bio: 'Die biblische Traumdeutung Josephs (Genesis 37-41) ist Grundlage aller abrahamitischen Traumtradition. Josephs Faehigkeit Traeume zu deuten rettete Aegypten vor der Hungersnot -- 7 fette, 7 magere Jahre.',
      contribution: 'Joseph zeigte, dass Traumdeutung eine goettliche Gabe ist. Seine Methode: Symbole haben eine direkte, praktische Bedeutung fuer die Zukunft. Diese Tradition beeinflusste Islam, Christentum und Judentum gleichermassen.',
      bioKey: 'scholars.jewish.2.bio',
      contributionKey: 'scholars.jewish.2.contribution',
    },
    {
      name: 'Philo von Alexandria',
      years: '20 BCE–50 AD',
      location: 'Alexandria, Egypt',
      bio: 'Juedisch-hellenistischer Philosoph. Unterschied 3 Traumtypen: goettlich gesandte, von der Seele erzeugte, und gemischte Traeume. Verband griechische Philosophie mit juedischer Traumdeutung.',
      contribution: 'Philo war der erste, der systematisch griechische Philosophie mit juedischer Traumtradition verband. Seine Drei-Typen-Lehre beeinflusste sowohl christliche als auch islamische Traumgelehrte.',
      bioKey: 'scholars.jewish.3.bio',
      contributionKey: 'scholars.jewish.3.contribution',
    },
    {
      name: 'Sefer Hasidim',
      years: '12th–13th century',
      location: 'Rhineland, Germany',
      locationKey: 'scholar.loc.rhineland',
      bio: 'Das "Buch der Frommen" der deutschen Chassidim. Enthaelt detaillierte Traumregeln: Traeume kurz nach Mitternacht gelten als wahrer. Warnung vor Traumdeutung durch Nichtjuden.',
      contribution: 'Praktische Traumregeln fuer den Alltag: Wann man traeumen soll, wie man schlechte Traeume abwenden kann (Hatavat Chalom), und welche Traeume man ernst nehmen muss.',
      bioKey: 'scholars.jewish.4.bio',
      contributionKey: 'scholars.jewish.4.contribution',
    },
  ],
  sonniks: [
    {
      name: 'Russisches Sonnik',
      years: 'Since the 18th century',
      yearsKey: 'scholar.since18c',
      location: 'Russia',
      bio: 'Traditionelle russische Traumdeutungsbuecher (Sonniki) existieren seit dem 18. Jahrhundert. Basieren auf slawischer Volksueberlieferung, byzantinisch-orthodoxen Elementen und westeuropaeischen Einfluessen.',
      contribution: 'Das Sonnik ist das meistgelesene Nachschlagewerk in russischen Haushalten. Alphabetisch geordnete Traumsymbole mit kurzen, praegnanten Deutungen -- von Adler bis Zwilling.',
      bioKey: 'scholars.sonniks.0.bio',
      contributionKey: 'scholars.sonniks.0.contribution',
    },
    {
      name: 'Vanga (Wanga)',
      years: '1911–1996',
      location: 'Bulgaria',
      bio: 'Baba Vanga, bulgarische Seherin. Ihre Traumdeutungen basieren auf slawischer Mystik und eigener prophetischer Erfahrung. Ueber 1 Million Menschen suchten sie auf.',
      contribution: 'Ihre Trauminterpretationen verbinden Symbole mit Zukunftsvoraussagen. Besonders populaer: Wassertraeume (Veraenderung), Verstorbene im Traum (Warnung), und Tiertraeume.',
      bioKey: 'scholars.sonniks.1.bio',
      contributionKey: 'scholars.sonniks.1.contribution',
    },
    {
      name: 'Miller Sonnik',
      years: '1857–1919',
      location: 'USA / Eastern Europe',
      bio: 'Gustavus Hindman Miller, "10.000 Dreams Interpreted". Das meistgelesene Traumdeutungsbuch der Welt in slawischen Laendern.',
      contribution: 'Sachliche, symbolbasierte Deutungen ohne religioesen Hintergrund. Millers Lexikon ist die Basis vieler moderner Sonniki und Online-Traumdeutungsseiten in Russland.',
      bioKey: 'scholars.sonniks.2.bio',
      contributionKey: 'scholars.sonniks.2.contribution',
    },
    {
      name: 'Nostradamus Adaptation',
      years: '1503–1566 (adaptations)',
      location: 'France / Eastern Europe',
      bio: 'Adaptationen der prophetischen Werke von Michel de Nostredame fuer die Traumdeutung. In slawischen Sonniki werden seine Quatrains als Traumsymbol-Lexikon genutzt.',
      contribution: 'Besonders fuer apokalyptische oder politische Traumbilder: Krieg, Naturkatastrophen, Herrscherwechsel. Nostradamus-Sonniks sind die dramatischsten aller russischen Traumbuecher.',
      bioKey: 'scholars.sonniks.3.bio',
      contributionKey: 'scholars.sonniks.3.contribution',
    },
    {
      name: 'Freudianisches Sonnik',
      years: 'Since ca. 1920',
      yearsKey: 'scholar.since1920',
      location: 'Eastern Europe',
      bio: 'Osteuropaeische Adaptationen von Freuds "Traumdeutung" (1899) fuer das Volksformat. Vereinfachte psychoanalytische Deutungen.',
      contribution: 'Bringt Freuds Symbolik (Wasser=Geburt, Fliegen=Freiheitswunsch) in zugaengliche Sonnik-Form. Populaer bei juengeren Lesern, die psychologische Erklaerungen bevorzugen.',
      bioKey: 'scholars.sonniks.4.bio',
      contributionKey: 'scholars.sonniks.4.contribution',
    },
  ],
  ancient: [
    {
      name: 'Artemidoros (Oneirocritica)',
      years: '2nd century AD',
      location: 'Daldis / Ephesus, Asia Minor',
      bio: 'Artemidoros von Daldis schrieb das bedeutendste Traumdeutungsbuch der Antike: die Oneirocritica (5 Baende). Unterschied theorematische (prophetische) von enypnion (alltaegliche) Traeume.',
      contribution: 'Seine Methodik beeinflusste Ibn Sirin direkt. Artemidoros befragte ueber 1000 Menschen zu ihren Traeumen -- die erste empirische Traumforschung der Geschichte.',
      bioKey: 'scholars.ancient.0.bio',
      contributionKey: 'scholars.ancient.0.contribution',
    },
    {
      name: 'Aegyptische Papyri',
      years: 'ca. 1275 BCE',
      location: 'Thebes, Egypt',
      bio: 'Der Chester Beatty Papyrus III ist das aelteste erhaltene Traumdeutungsbuch der Welt. Enthaelt 108 Traumdeutungen. Tempel-Inkubation: Im Tempel schlafen um prophetische Traeume zu empfangen.',
      contribution: 'Die aegyptische Traumdeutung unterschied "gute" und "boese" Traeume. Priester des Serapis waren professionelle Traumdeuter. Ihr System beeinflusste Griechenland und Rom direkt.',
      bioKey: 'scholars.ancient.1.bio',
      contributionKey: 'scholars.ancient.1.contribution',
    },
    {
      name: 'Somniale Danielis',
      years: 'Since the 5th century AD',
      yearsKey: 'scholar.since5cAd',
      location: 'Europe',
      bio: 'Mittelalterliches Traumdeutungsbuch, faelschlicherweise dem Propheten Daniel zugeschrieben. Ueber 100 lateinische Manuskripte erhalten.',
      contribution: 'Alphabetisches Lexikon von Traumsymbolen. Basis der europaeischen Volksueberlieferung. Das am weitesten verbreitete Traumbuch des Mittelalters -- von Moenchen bis Bauern.',
      bioKey: 'scholars.ancient.2.bio',
      contributionKey: 'scholars.ancient.2.contribution',
    },
    {
      name: 'Assyrische Traumtexte',
      years: '7th century BCE',
      location: 'Nineveh, Assyria',
      bio: 'Keilschrifttafeln aus der Bibliothek Assurbanipals. Systematische Sammlung von Traumdeutungen: "Wenn ein Mann im Traum fliegt -- Zeichen fuer..."',
      contribution: 'Traeume waren Botschaften der Goetter. Professionelle Traumdeuter (sha\'ilu) deuteten sie am Koenigshof. Die aelteste bekannte systematische Traumdeutung der Menschheit.',
      bioKey: 'scholars.ancient.3.bio',
      contributionKey: 'scholars.ancient.3.contribution',
    },
    {
      name: 'Macrobius Kommentar',
      years: 'ca. 400 AD',
      location: 'Rome / North Africa',
      bio: 'Ambrosius Macrobius kommentierte Ciceros Somnium Scipionis. Entwickelte das einflussreichste antike Traumklassifikationssystem: 5 Typen.',
      contribution: 'Somnium, visio, oraculum, insomnium, visum -- diese 5 Traumtypen praegte das gesamte mittelalterliche Europa und beeinflusst die Traumforschung bis heute.',
      bioKey: 'scholars.ancient.4.bio',
      contributionKey: 'scholars.ancient.4.contribution',
    },
  ],
  numerology: [
    {
      name: 'Pythagoras',
      years: 'ca. 570–495 BCE',
      location: 'Samos / Croton, Greece',
      bio: 'Pythagoras von Samos war ein antiker griechischer Philosoph und Mathematiker. Er gründete die pythagoreische Schule, die Mathematik, Philosophie und Mystik verband.',
      contribution: 'Er lehrte, dass Zahlen das Wesen aller Dinge sind. Die Lebenspfadzahl-Berechnung und die mystische Bedeutung der Zahlen 1-9 gehen auf seine Lehren zurück.',
      bioKey: 'scholars.numerology.0.bio',
      contributionKey: 'scholars.numerology.0.contribution',
    },
    {
      name: 'Ebjed / Abjad-System',
      years: 'Since the 7th century',
      yearsKey: 'scholar.since7c',
      location: 'Arab-Islamic World',
      locationKey: 'scholar.loc.arabicWorld',
      bio: 'Das Ebjed-System (Abjad-Zahlensystem) ist eine der ältesten Methoden der Zahlenmystik im Islam. Jeder arabische Buchstabe hat einen numerischen Wert. Es wird seit Jahrhunderten in der islamischen Traumdeutung, Koranexegese und Mystik verwendet.',
      contribution: 'Im Ebjed-System wird der Name des Träumers und die Schlüsselwörter des Traums in Zahlenwerte umgerechnet. Diese Werte offenbaren verborgene Bedeutungsschichten, die nur durch numerische Analyse sichtbar werden. DreamCode beherrscht sowohl das westliche als auch das Ebjed-System.',
      bioKey: 'scholars.numerology.1.bio',
      contributionKey: 'scholars.numerology.1.contribution',
    },
    {
      name: 'Kabbalah',
      years: 'Since the 12th century',
      yearsKey: 'scholar.since12c',
      location: 'Southern France / Spain',
      locationKey: 'scholar.loc.southFranceSpain',
      bio: 'Die Kabbalah ist die mystische Tradition des Judentums. Die Gematria -- die Zuordnung von Zahlenwerten zu hebräischen Buchstaben -- ist ein Kernstück der kabbalistischen Praxis.',
      contribution: 'Die Gematria enthüllt verborgene Verbindungen zwischen Wörtern gleichen Zahlenwerts. In der Traumdeutung verbindet sie Traumsymbole über ihre numerischen Werte mit tieferen kosmischen Bedeutungen.',
      bioKey: 'scholars.numerology.2.bio',
      contributionKey: 'scholars.numerology.2.contribution',
    },
    {
      name: 'Chinesische Numerologie',
      years: 'Since the Zhou Dynasty (ca. 1000 BCE)',
      yearsKey: 'scholar.zhouDynasty',
      location: 'China',
      bio: 'Die chinesische Zahlenmystik ist tief in der Kultur verwurzelt. Zahlen wie 8 (Glück) und 4 (Unglück) prägen den Alltag. Das System verbindet sich mit dem I Ging, den fünf Elementen und der Yin-Yang-Philosophie.',
      contribution: 'In der Traumdeutung werden Zahlen nach ihrer phonetischen Ähnlichkeit und kosmischen Bedeutung analysiert. DreamCode integriert dieses System, um Glücks- und Schicksalszahlen im Traumkontext zu entschlüsseln.',
      bioKey: 'scholars.numerology.3.bio',
      contributionKey: 'scholars.numerology.3.contribution',
    },
    {
      name: 'Traumzahlen-Analyse',
      years: 'Interdisciplinary',
      yearsKey: 'scholar.interdisciplinary',
      location: 'All Traditions',
      locationKey: 'scholar.loc.allTraditions',
      bio: 'Die Traumzahlen-Analyse ist ein moderner, traditionsübergreifender Ansatz. Sie kombiniert pythagoreische, kabbalistische, Ebjed- und chinesische Zahlensymbolik mit psychologischen Erkenntnissen.',
      contribution: 'Was bedeuten Zahlen in deinem Traum? DreamCode analysiert jede Zahl über alle Traditionen hinweg und liefert eine vielschichtige Deutung -- von der Lebenspfadzahl bis zur karmischen Botschaft.',
      bioKey: 'scholars.numerology.4.bio',
      contributionKey: 'scholars.numerology.4.contribution',
    },
  ],
};

// ========== SUBKATEGORIEN PRO TRADITION ==========
interface Subcategory {
  scholarKey: string;
  title: string;
  subtitle: string;
  titleKey?: string;
  subtitleKey?: string;
}

interface Tradition {
  id: string;
  titleKey: string;
  subtitleKey: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  hoverBorder: string;
  accentBg: string;
  descKey: string;
  subcategories: Subcategory[];
  tier?: 'free' | 'pro';
}

const TRADITIONS: Tradition[] = [
  // ===== TOP ROW =====
  {
    id: 'islamic',
    titleKey: 'trad.islamic.title',
    subtitleKey: 'trad.islamic.subtitle',
    icon: Moon,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40',
    accentBg: 'bg-emerald-400',
    descKey: 'trad.islamic.desc',
    subcategories: [
      { scholarKey: '0', title: 'Ibn Sirin', subtitle: 'Klassische Traumdeutung (Basra, 7. Jh.)', titleKey: 'trad.islamic.sub0.title', subtitleKey: 'trad.islamic.sub0.subtitle' },
      { scholarKey: '1', title: 'Al-Nabulsi', subtitle: 'Mystische Symbolik (Damaskus, 17. Jh.)', titleKey: 'trad.islamic.sub1.title', subtitleKey: 'trad.islamic.sub1.subtitle' },
      { scholarKey: '2', title: 'Al-Iskhafi', subtitle: 'Linguistische Analyse (Bagdad, 9. Jh.)', titleKey: 'trad.islamic.sub2.title', subtitleKey: 'trad.islamic.sub2.subtitle' },
    ],
  },
  {
    id: 'christian',
    titleKey: 'trad.christian.title',
    subtitleKey: 'trad.christian.subtitle',
    icon: BookOpen,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    hoverBorder: 'hover:border-sky-500/40',
    accentBg: 'bg-sky-400',
    descKey: 'trad.christian.desc',
    subcategories: [
      { scholarKey: '0', title: 'Kirchenväter', subtitle: 'Göttliche Botschaften (Rom & Byzanz)', titleKey: 'trad.christian.sub0.title', subtitleKey: 'trad.christian.sub0.subtitle' },
      { scholarKey: '1', title: 'Hildegard von Bingen', subtitle: 'Visionäre Mystik (12. Jh.)', titleKey: 'trad.christian.sub1.title', subtitleKey: 'trad.christian.sub1.subtitle' },
      { scholarKey: '2', title: 'Moderne Theologie', subtitle: 'Zeitgemäße spirituelle Deutung', titleKey: 'trad.christian.sub2.title', subtitleKey: 'trad.christian.sub2.subtitle' },
    ],
  },
  {
    id: 'buddhist',
    titleKey: 'trad.buddhist.title',
    subtitleKey: 'trad.buddhist.subtitle',
    icon: Sun,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    hoverBorder: 'hover:border-orange-500/40',
    accentBg: 'bg-orange-400',
    descKey: 'trad.buddhist.desc',
    subcategories: [
      { scholarKey: '0', title: 'Zen', subtitle: 'Die Klarheit des Augenblicks (China & Japan)', titleKey: 'trad.buddhist.sub0.title', subtitleKey: 'trad.buddhist.sub0.subtitle' },
      { scholarKey: '1', title: 'Tibetisches Traumyoga', subtitle: 'Milarepa, Weg zur Erleuchtung', titleKey: 'trad.buddhist.sub1.title', subtitleKey: 'trad.buddhist.sub1.subtitle' },
      { scholarKey: '2', title: 'Theravada & Vedisch', subtitle: 'Karma und das wahre Selbst (Indien)', titleKey: 'trad.buddhist.sub2.title', subtitleKey: 'trad.buddhist.sub2.subtitle' },
    ],
  },
  // ===== BOTTOM ROW =====
  {
    id: 'astrology',
    titleKey: 'trad.astrology.title',
    subtitleKey: 'trad.astrology.subtitle',
    icon: Sparkles,
    color: 'text-dream-secondary',
    bg: 'bg-dream-secondary/10',
    border: 'border-dream-secondary/20',
    hoverBorder: 'hover:border-dream-secondary/40',
    accentBg: 'bg-dream-secondary',
    descKey: 'trad.astrology.desc',
    subcategories: [
      { scholarKey: '0', title: 'Zodiak & Tierkreiszeichen', subtitle: 'Ptolemäus, 12 Zeichen', titleKey: 'trad.astrology.sub0.title', subtitleKey: 'trad.astrology.sub0.subtitle' },
      { scholarKey: '1', title: 'Abu Ma\'shar', subtitle: 'Islamische Astrologie & Traumdeutung (Bagdad)' },
      { scholarKey: '2', title: 'Häuser, Transite & Mondknoten', subtitle: 'Kosmischer Kontext', titleKey: 'trad.astrology.sub2.title', subtitleKey: 'trad.astrology.sub2.subtitle' },
    ],
  },
  {
    id: 'psychology',
    titleKey: 'trad.psychology.title',
    subtitleKey: 'trad.psychology.subtitle',
    icon: Brain,
    color: 'text-dream-primary',
    bg: 'bg-dream-primary/10',
    border: 'border-dream-primary/20',
    hoverBorder: 'hover:border-dream-primary/40',
    accentBg: 'bg-dream-primary',
    descKey: 'trad.psychology.desc',
    subcategories: [
      { scholarKey: '0', title: 'Sigmund Freud', subtitle: 'Verborgene Wünsche und Triebkräfte (Wien)', titleKey: 'trad.psychology.sub0.title', subtitleKey: 'trad.psychology.sub0.subtitle' },
      { scholarKey: '1', title: 'C.G. Jung', subtitle: 'Archetypen und kollektives Unbewusstes (Zürich)', titleKey: 'trad.psychology.sub1.title', subtitleKey: 'trad.psychology.sub1.subtitle' },
      { scholarKey: '2', title: 'Fritz Perls', subtitle: 'Gestalttherapie, ganzheitliches Erlebnis', titleKey: 'trad.psychology.sub2.title', subtitleKey: 'trad.psychology.sub2.subtitle' },
    ],
  },
  {
    id: 'numerology',
    titleKey: 'trad.numerology.title',
    subtitleKey: 'trad.numerology.subtitle',
    icon: Fingerprint,
    color: 'text-dream-cyan',
    bg: 'bg-dream-cyan/10',
    border: 'border-dream-cyan/20',
    hoverBorder: 'hover:border-dream-cyan/40',
    accentBg: 'bg-dream-cyan',
    descKey: 'trad.numerology.desc',
    subcategories: [
      { scholarKey: '0', title: 'Pythagoras', subtitle: 'Lebenspfadzahl und kosmische Ordnung', titleKey: 'trad.numerology.sub0.title', subtitleKey: 'trad.numerology.sub0.subtitle' },
      { scholarKey: '1', title: 'Ebjed (Abjad)', subtitle: 'Arabische Buchstaben-Zahlenmystik', titleKey: 'trad.numerology.sub1.title', subtitleKey: 'trad.numerology.sub1.subtitle' },
      { scholarKey: '2', title: 'Kabbalah & Gematria', subtitle: 'Hebräische Zahlencodes', titleKey: 'trad.numerology.sub2.title', subtitleKey: 'trad.numerology.sub2.subtitle' },
      { scholarKey: '3', title: 'Chinesische Numerologie', subtitle: 'Glücks- und Schicksalszahlen', titleKey: 'trad.numerology.sub3.title', subtitleKey: 'trad.numerology.sub3.subtitle' },
      { scholarKey: '4', title: 'Traumzahlen-Analyse', subtitle: 'Was bedeuten Zahlen in deinem Traum?', titleKey: 'trad.numerology.sub4.title', subtitleKey: 'trad.numerology.sub4.subtitle' },
    ],
  },
  // ===== NEW ROW =====
  {
    id: 'jewish',
    titleKey: 'trad.jewish.title',
    subtitleKey: 'trad.jewish.subtitle',
    icon: Star,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40',
    accentBg: 'bg-amber-400',
    descKey: 'trad.jewish.desc',
    tier: 'free' as const,
    subcategories: [
      { scholarKey: '0', title: 'Talmud Berakhot', subtitle: 'Traeume als 1/60 der Prophetie', titleKey: 'trad.jewish.sub0.title', subtitleKey: 'trad.jewish.sub0.subtitle' },
      { scholarKey: '1', title: 'Kabbalah / Zohar', subtitle: 'Sefirot und Seelenreise im Schlaf', titleKey: 'trad.jewish.sub1.title', subtitleKey: 'trad.jewish.sub1.subtitle' },
      { scholarKey: '2', title: 'Joseph-Deutung', subtitle: 'Biblische Traumdeutung (Genesis)', titleKey: 'trad.jewish.sub2.title', subtitleKey: 'trad.jewish.sub2.subtitle' },
      { scholarKey: '3', title: 'Philo von Alexandria', subtitle: 'Griechisch-juedische Synthese', titleKey: 'trad.jewish.sub3.title', subtitleKey: 'trad.jewish.sub3.subtitle' },
      { scholarKey: '4', title: 'Sefer Hasidim', subtitle: 'Praktische Traumregeln (Rheinland)', titleKey: 'trad.jewish.sub4.title', subtitleKey: 'trad.jewish.sub4.subtitle' },
    ],
  },
  {
    id: 'sonniks',
    titleKey: 'trad.sonniks.title',
    subtitleKey: 'trad.sonniks.subtitle',
    icon: ScrollText,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    hoverBorder: 'hover:border-rose-500/40',
    accentBg: 'bg-rose-400',
    descKey: 'trad.sonniks.desc',
    tier: 'pro' as const,
    subcategories: [
      { scholarKey: '0', title: 'Russisches Sonnik', subtitle: 'Traditionelle Volksueberlieferung', titleKey: 'trad.sonniks.sub0.title', subtitleKey: 'trad.sonniks.sub0.subtitle' },
      { scholarKey: '1', title: 'Vanga (Wanga)', subtitle: 'Bulgarische Seherin (1911-1996)', titleKey: 'trad.sonniks.sub1.title', subtitleKey: 'trad.sonniks.sub1.subtitle' },
      { scholarKey: '2', title: 'Miller Sonnik', subtitle: '10.000 Dreams Interpreted', titleKey: 'trad.sonniks.sub2.title', subtitleKey: 'trad.sonniks.sub2.subtitle' },
      { scholarKey: '3', title: 'Nostradamus Adaptation', subtitle: 'Prophetische Traumsymbolik', titleKey: 'trad.sonniks.sub3.title', subtitleKey: 'trad.sonniks.sub3.subtitle' },
      { scholarKey: '4', title: 'Freudianisches Sonnik', subtitle: 'Psychoanalyse im Volksformat', titleKey: 'trad.sonniks.sub4.title', subtitleKey: 'trad.sonniks.sub4.subtitle' },
    ],
  },
  {
    id: 'ancient',
    titleKey: 'trad.ancient.title',
    subtitleKey: 'trad.ancient.subtitle',
    icon: Landmark,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    hoverBorder: 'hover:border-yellow-500/40',
    accentBg: 'bg-yellow-400',
    descKey: 'trad.ancient.desc',
    tier: 'pro' as const,
    subcategories: [
      { scholarKey: '0', title: 'Artemidoros (Oneirocritica)', subtitle: 'Das Hauptwerk der Antike (2. Jh.)', titleKey: 'trad.ancient.sub0.title', subtitleKey: 'trad.ancient.sub0.subtitle' },
      { scholarKey: '1', title: 'Aegyptische Papyri', subtitle: 'Aeltestes Traumbuch der Welt (1275 v.Chr.)', titleKey: 'trad.ancient.sub1.title', subtitleKey: 'trad.ancient.sub1.subtitle' },
      { scholarKey: '2', title: 'Somniale Danielis', subtitle: 'Europaeisches Mittelalter-Lexikon', titleKey: 'trad.ancient.sub2.title', subtitleKey: 'trad.ancient.sub2.subtitle' },
      { scholarKey: '3', title: 'Assyrische Traumtexte', subtitle: 'Keilschrift aus Ninive (7. Jh. v.Chr.)', titleKey: 'trad.ancient.sub3.title', subtitleKey: 'trad.ancient.sub3.subtitle' },
      { scholarKey: '4', title: 'Macrobius Kommentar', subtitle: '5 Traumtypen (Rom, 400 n.Chr.)', titleKey: 'trad.ancient.sub4.title', subtitleKey: 'trad.ancient.sub4.subtitle' },
    ],
  },
];

// ========== SCHOLAR MODAL COMPONENT ==========
const ScholarModal: React.FC<{ scholar: Scholar; onClose: () => void; color: string }> = ({ scholar, onClose, color }) => {
  const { t } = useLang();
  return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="relative max-w-lg w-full bg-dream-card border border-white/10 rounded-2xl p-8 shadow-2xl z-10"
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-10 rounded-sm ${color === 'text-emerald-400' ? 'bg-emerald-400' : color === 'text-dream-primary' ? 'bg-dream-primary' : color === 'text-sky-400' ? 'bg-sky-400' : color === 'text-orange-400' ? 'bg-orange-400' : color === 'text-dream-secondary' ? 'bg-dream-secondary' : 'bg-dream-cyan'}`} />
        <div>
          <h3 className="text-white font-display text-xl font-bold">{scholar.name}</h3>
          <p className="text-gray-400 text-sm">{scholar.yearsKey ? t(scholar.yearsKey) : scholar.years} — {scholar.locationKey ? t(scholar.locationKey) : scholar.location}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2">{t('trad.scholar.who')}</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{t(scholar.bioKey) || scholar.bio}</p>
        </div>
        <div className="pt-4 border-t border-white/5">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-2">{t('trad.scholar.contribution')}</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{t(scholar.contributionKey) || scholar.contribution}</p>
        </div>
      </div>
    </motion.div>
  </motion.div>
  );
};

// ========== TRADITION CARD COMPONENT ==========
const TierBadge: React.FC<{ tier?: 'free' | 'pro' }> = ({ tier }) => {
  if (!tier) return null;
  if (tier === 'free') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(94,234,212,0.15)', color: '#5eead4', border: '1px solid rgba(94,234,212,0.3)' }}>
        FREE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }}>
      <Lock className="w-2.5 h-2.5" /> PRO
    </span>
  );
};

const TraditionCard: React.FC<{
  tradition: Tradition;
  index: number;
  onScholarClick: (scholar: Scholar, color: string) => void;
  tFn: (key: string) => string;
}> = ({ tradition, index, onScholarClick, tFn }) => {
  const trad = tradition;
  const scholars = SCHOLARS[trad.id] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={`glass rounded-2xl p-6 transition-all duration-300 group border ${trad.border} ${trad.hoverBorder} flex flex-col ${trad.tier === 'pro' ? 'opacity-90' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${trad.bg} flex items-center justify-center ${trad.color} group-hover:scale-110 transition-transform`}>
          <trad.icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold text-white">{tFn(trad.titleKey)}</h3>
            <TierBadge tier={trad.tier} />
          </div>
          <span className={`text-xs ${trad.color} uppercase tracking-wider`}>{tFn(trad.subtitleKey)}</span>
        </div>
      </div>

      {/* Beschreibung */}
      <p className="text-gray-400 text-sm mb-4 italic border-l-2 border-white/10 pl-3">
        {tFn(trad.descKey)}
      </p>

      {/* Subkategorien als Liste */}
      <div className="space-y-2.5 flex-1">
        {trad.subcategories.map((sub, sIdx) => {
          const scholarIdx = parseInt(sub.scholarKey, 10);
          const scholar = scholars[scholarIdx];

          return (
            <div key={sIdx} className="flex items-start gap-2">
              <span className={`text-xs font-bold ${trad.color} mt-0.5 shrink-0 w-4 text-right`}>{sIdx + 1}.</span>
              <div className="min-w-0">
                {scholar ? (
                  <button
                    onClick={() => onScholarClick(scholar, trad.color)}
                    className={`inline-flex items-center gap-1 text-sm font-semibold ${trad.color} hover:underline cursor-pointer transition-all hover:brightness-125 active:scale-95`}
                  >
                    <Info className="w-3 h-3 shrink-0 opacity-60" />
                    {tFn(sub.titleKey ?? sub.title)}
                    <ChevronRight className="w-3 h-3 opacity-40" />
                  </button>
                ) : (
                  <span className={`text-sm font-semibold ${trad.color}`}>{sub.title}</span>
                )}
                <p className="text-gray-400 text-xs leading-snug mt-0.5">{tFn(sub.subtitleKey ?? sub.subtitle)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ========== MAIN COMPONENT ==========
const Traditions: React.FC = () => {
  const { t } = useLang();
  const [activeScholar, setActiveScholar] = useState<{ scholar: Scholar; color: string } | null>(null);

  const handleScholarClick = (scholar: Scholar, color: string) => {
    setActiveScholar({ scholar, color });
  };

  const AI_STEPS = [
    {
      step: 1,
      icon: MessageSquare,
      title: t('trad.aiStep1.title'),
      text: t('trad.aiStep1.desc'),
    },
    {
      step: 2,
      icon: Brain,
      title: t('trad.aiStep2.title'),
      text: t('trad.aiStep2.desc'),
    },
    {
      step: 3,
      icon: Fingerprint,
      title: t('trad.aiStep3.title'),
      text: t('trad.aiStep3.desc'),
    },
  ];

  // Top row: Islamisch, Christlich, Buddhistisch (Index 0-2)
  const topRow = TRADITIONS.slice(0, 3);
  // Middle row: Astrologie, Psychologisch, Numerologie (Index 3-5)
  const middleRow = TRADITIONS.slice(3, 6);
  // New row: Juedisch, Sonniks, Antik (Index 6-8)
  const newRow = TRADITIONS.slice(6, 9);

  return (
    <section id="traditions" className="py-28 relative scroll-mt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-dream-bg via-dream-card/50 to-dream-bg"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-dream-primary font-medium text-sm tracking-[0.2em] uppercase">{t('trad.badge')}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              {t('trad.title')} <span className="text-gradient-dream">{t('trad.titleHighlight')}</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('trad.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Top Row: Islamisch, Christlich, Buddhistisch */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {topRow.map((trad, idx) => (
            <TraditionCard
              key={trad.id}
              tradition={trad}
              index={idx}
              onScholarClick={handleScholarClick}
              tFn={t}
            />
          ))}
        </div>

        {/* Middle Row: Astrologie, Psychologisch, Numerologie */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {middleRow.map((trad, idx) => (
            <TraditionCard
              key={trad.id}
              tradition={trad}
              index={idx + 3}
              onScholarClick={handleScholarClick}
              tFn={t}
            />
          ))}
        </div>

        {/* New Row: Juedisch, Sonniks, Antik */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {newRow.map((trad, idx) => (
            <TraditionCard
              key={trad.id}
              tradition={trad}
              index={idx + 6}
              onScholarClick={handleScholarClick}
              tFn={t}
            />
          ))}
        </div>

        {/* KI-Prozess */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-dream-primary/10 via-dream-card to-dream-accent/10 border border-dream-primary/20 p-8 md:p-14">
          <div className="absolute top-0 right-0 w-96 h-96 bg-dream-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-dream-secondary text-sm font-bold tracking-[0.15em] uppercase">{t('trad.how.badge')}</span>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
                {t('trad.how.title')}
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {t('trad.how.desc')}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dream-primary/10 border border-dream-primary/30 text-dream-primary font-bold">
                <Sparkles className="w-4 h-4" />
                {t('trad.how.tag')}
              </div>
            </div>

            <div className="space-y-5">
              {AI_STEPS.map((step, idx) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.15 }}
                  className="flex items-start gap-4 bg-black/30 p-5 rounded-2xl border border-white/5 hover:border-dream-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dream-primary to-dream-accent flex items-center justify-center shrink-0 font-display font-bold text-lg text-white shadow-lg shadow-dream-primary/20">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{step.title}</h4>
                    <p className="text-gray-400 text-sm">{step.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scholar Modal */}
      <AnimatePresence>
        {activeScholar && (
          <ScholarModal
            scholar={activeScholar.scholar}
            color={activeScholar.color}
            onClose={() => setActiveScholar(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Traditions;
