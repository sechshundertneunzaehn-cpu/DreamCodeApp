import { Language, ReligiousSource, ReligiousCategory } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPEN
// ─────────────────────────────────────────────────────────────────────────────

export interface SourceInfo {
  title: string;
  desc: string;
  origin: string;
  bio: string;
}

export interface SymbolInterpretation {
  tradition: ReligiousCategory;
  source: ReligiousSource;
  text: string;
}

export interface DreamSymbol {
  id: string;
  name: string;
  category: ReligiousCategory | string;
  keywords: string[];
  interpretations: SymbolInterpretation[];
}

export interface KnowledgeBaseCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAUMSYMBOLE (30+)
// ─────────────────────────────────────────────────────────────────────────────

export const symbols: DreamSymbol[] = [
  {
    id: 'wasser',
    name: 'Wasser',
    category: 'natur',
    keywords: ['Fluss', 'See', 'Ozean', 'Regen', 'Flut', 'trinken'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Klares Wasser bedeutet Segen, Reinheit des Herzens und Wohlstand. Trübes Wasser deutet auf Kummer, Fitna oder Krankheit hin. Fließendes Wasser symbolisiert Lebensunterhalt und Rizq.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wasser repräsentiert das kollektive Unbewusste. Ruhiges Wasser steht für inneren Frieden; stürmisches Wasser für emotionale Aufruhr und unverarbeitete Gefühle.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Wasser gilt als Geburt- und Muttersymbol. Eintauchen in Wasser kann den Wunsch nach Regression oder Geborgenheit ausdrücken.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Wasser steht für Taufe, Reinigung der Seele und göttliche Gnade. Sintflutartige Wasser mahnen zur Buße.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Wasser symbolisiert Mitgefühl und Formlosigkeit. Das Spiegelbild im Wasser zeigt die Illusion des Selbst (Maya).' },
    ],
  },
  {
    id: 'fliegen',
    name: 'Fliegen',
    category: 'aktionen',
    keywords: ['schweben', 'abheben', 'Freiheit', 'Vogelperspektive'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Fliegen ohne Flügel deutet auf Hochmut oder überhöhte Ambitionen hin. Mit Flügeln fliegen kann auf eine bevorstehende Reise oder Erhöhung des Status hinweisen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Freud verband Flugträume mit sexueller Erregung und dem Wunsch nach Freiheit von Hemmungen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Fliegen symbolisiert den Wunsch, über persönliche Einschränkungen hinauszuwachsen und die höhere Ebene des Selbst zu erreichen.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Flugträume wurden als Zeichen göttlicher Erhöhung oder als Versuchung der Hybris durch Engel und Dämonen gedeutet.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.ZEN, text: 'Fliegen verkörpert die Loslösung vom Ego und das Durchbrechen karmischer Bindungen.' },
    ],
  },
  {
    id: 'fallen',
    name: 'Fallen',
    category: 'aktionen',
    keywords: ['stürzen', 'Tiefe', 'Absturz', 'Kontrollverlust'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Fallen aus der Höhe warnt vor Machtverlust, Demütigung oder dem Fall aus einer privilegierten Stellung. Es mahnt zur Demut.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Freud deutete Fallträume als Ausdruck moralischer Schwäche oder als Erinnerung an den Geburtsakt und frühe Stürze.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Fallen symbolisiert das Absinken ins Unbewusste – oft ein Aufruf zur Selbstreflexion und Integration von Schattenseiten.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Der Fall im Traum erinnert an den Sündenfall Adams. Er kann eine Warnung vor moralischem Versagen sein.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.THERAVADA, text: 'Fallen weist auf Anhaftung und das Festhalten an vergänglichen Dingen hin, das Leiden verursacht.' },
    ],
  },
  {
    id: 'schlange',
    name: 'Schlange',
    category: 'tiere',
    keywords: ['Reptil', 'Gift', 'Häutung', 'Feind', 'Weisheit'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Eine Schlange symbolisiert einen Feind – je größer, desto mächtiger der Gegner. Eine Schlange töten bedeutet Sieg über den Feind. Weiße Schlangen können weise Berater bedeuten.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Freud sah die Schlange als klassisches phallisches Symbol für unterdrückte Sexualität oder verbotene Triebe.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Die Schlange verkörpert die chthonische Energie des Unbewussten, Transformation und die Kraft der Heilung (Äskulapstab). Sie ist Archetyp des Schatten.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Die Schlange ist Symbol des Satans und der Versuchung seit dem Sündenfall. Sie mahnt zur Wachsamkeit vor Verführung.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Im tibetischen Buddhismus steht die Schlange für Nāgas – Schutzgeister des Wassers. Gier ist einer der drei Gifte, symbolisiert durch die Schlange.' },
    ],
  },
  {
    id: 'haus',
    name: 'Haus',
    category: 'objekte',
    keywords: ['Zuhause', 'Gebäude', 'Zimmer', 'Keller', 'Dach'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Das Haus repräsentiert den Träumer selbst oder seine Familie. Ein neues Haus verheißt Wohlstand. Ein einstürzendes Haus warnt vor Krankheit oder Tod in der Familie.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Das Haus ist das Selbst des Träumers. Verschiedene Etagen symbolisieren Bewusstseinsbereiche: Keller = Unbewusstes, Dachboden = höheres Bewusstsein, Schlafzimmer = Intimsphäre.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Das Haus steht für den menschlichen Körper. Fenster und Türen sind oft Körperöffnungen. Das Eindringen ins Haus kann sexuelle Konnotationen haben.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Das Haus symbolisiert die Seele als Tempel Gottes. Ein gepflegtes Haus zeigt ein tugendhaftes Leben; ein verlassenes verweist auf spirituellen Verfall.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.ZEN, text: 'Das Haus steht für das Ego-Konstrukt. Das Verlassen des Hauses symbolisiert Loslösung und den Weg zur Erleuchtung.' },
    ],
  },
  {
    id: 'tod',
    name: 'Tod',
    category: 'spirituelles',
    keywords: ['sterben', 'Begräbnis', 'Verstorbener', 'Leiche', 'Jenseits'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Den eigenen Tod zu träumen verheißt oft ein langes Leben oder Taubah (Reue). Den Tod eines anderen zu träumen bedeutet nicht zwingend den physischen Tod, kann jedoch eine Veränderung in deren Leben ankündigen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Tod symbolisiert Transformation und das Ende eines Lebensabschnitts. Es ist ein Einweihungssymbol für inneres Wachstum und die Geburt eines neuen Selbst.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Todesträume spiegeln den Todestrieb (Thanatos) wider oder unterdrückte aggressive Impulse gegen geliebte Personen.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Träume vom Tod mahnen zur Besinnung auf das ewige Leben. Sie können ein Aufruf zur Buße oder ein göttlicher Hinweis auf die Vergänglichkeit alles Irdischen sein.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Im Tibetischen Buch der Toten (Bardo Thodol) ist der Tod ein Übergang. Traumtod bedeutet Auflösung alter Konditionierungen und karma-reinigendes Erleben.' },
    ],
  },
  {
    id: 'zahn',
    name: 'Zahn / Zähne',
    category: 'koerper',
    keywords: ['Zähne verlieren', 'Gebiss', 'Mund', 'Karies'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Zähne repräsentieren Familienmitglieder. Einen Zahn verlieren bedeutet den Verlust eines Angehörigen oder den Weggang aus der Familie. Schöne Zähne verheißen Stärke der Familie.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Zahnausfall ist nach Freud mit Kastrationsangst und dem Verlust männlicher Potenz verbunden. Auch Geburtsträume können dahinterstecken.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Zähne symbolisieren Durchsetzungskraft und Vitalität. Ihr Verlust zeigt Ohnmacht, Angst vor Kontrollverlust oder sozialer Entblößung.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Zähne wurden als Symbol der Stärke des Glaubens gesehen. Ihr Verlust deutete auf Schwächung der spirituellen Widerstandskraft hin.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.THERAVADA, text: 'Zahnverlust weist auf das Vergänglichkeitsprinzip (Anicca) hin – eine Erinnerung, dass körperliche Attribute nicht das wahre Selbst sind.' },
    ],
  },
  {
    id: 'hund',
    name: 'Hund',
    category: 'tiere',
    keywords: ['Tier', 'Begleiter', 'treuer Freund', 'Wächter', 'Biss'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ein Hund im Traum symbolisiert oft einen niedrigen Feind oder einen schlechten Freund. Ein zahmer Hund kann jedoch einen treuen Begleiter bedeuten. Ein Hundebiss warnt vor Verrat.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Der Hund verkörpert Instinkt, Loyalität und das domestizierte Tier im Menschen. Ein aggressiver Hund steht für unterdrückte Wut oder unkontrollierte Triebe.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Hunde können die eigenen Triebkräfte (Es) darstellen, die kontrolliert werden müssen. Ein bedrohender Hund zeigt Konflikt zwischen Über-Ich und Es.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'In mittelalterlicher Symbolik war der Hund Wächter und treuer Begleiter. Schwarze Hunde wurden jedoch mit Dämonen assoziiert.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.ZEN, text: 'Ein ruhiger Hund symbolisiert die gezähmten Sinne. Ein wild bellender Hund steht für den unruhigen Geist (Monkey Mind), der Meditation stört.' },
    ],
  },
  {
    id: 'baby',
    name: 'Baby / Kleinkind',
    category: 'menschen',
    keywords: ['Neugeborenes', 'Kind', 'Schwangerschaft', 'Säugling'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ein Baby im Traum verheißt oft Freude, neues Rizq oder einen neuen Beginn. Ein weinendes Baby kann Kummer ankündigen. Jungen wurden traditionell als Zeichen von mehr Rizq gedeutet.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Das Baby ist der Archetyp des Göttlichen Kindes – Symbol der Erneuerung, unbegrenzter Möglichkeiten und spirituellen Wachstums.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Ein Baby repräsentiert den Wunsch nach einem Kind, narzisstische Selbstbezogenheit oder die Rückkehr zu infantilen Bedürfnissen.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Das Jesuskind als Archetyp: Ein Baby symbolisiert göttlichen Segen, neue geistliche Geburt (Johannes 3:3) und Unschuld.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Ein Baby steht für Wiedergeburt und das Fortführen des karmischen Weges. Es kann auch ein neues Leben nach dem Tod des Egos anzeigen.' },
    ],
  },
  {
    id: 'feuer',
    name: 'Feuer',
    category: 'natur',
    keywords: ['Flamme', 'Brand', 'Wärme', 'Zerstörung', 'Licht'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Feuer ohne Rauch und Schaden bedeutet Erleuchtung, Segen oder Nähe zu Gott. Feuer das verbrennt oder zerstört ist eine ernste Warnung vor Prüfungen, Konflikten oder Strafe.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Feuer ist das Symbol der Libido, Leidenschaft und Transformation. Es ist das alchemistische Element der Reinigung und der Wandlung des Unbewussten.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Feuer steht für Destruktionswünsche und unkontrollierte Sexualenergie. Das Löschen von Feuer kann dem Wunsch nach Triebkontrolle entsprechen.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Feuer symbolisiert den Heiligen Geist (Pfingsten), göttliche Gegenwart (Brennender Dornbusch) und das Fegefeuer als Reinigungsort.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Feuer ist eines der fünf Elemente und symbolisiert Weisheit, die Unwissenheit verbrennt. Unkontrolliertes Feuer steht für Gier und Begierde.' },
    ],
  },
  {
    id: 'auto',
    name: 'Auto / Fahrzeug',
    category: 'objekte',
    keywords: ['fahren', 'Unfall', 'Kontrolle', 'Reise', 'Steuer'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ein Fahrzeug kann den Lebenspfad oder Status des Träumers symbolisieren. Ein Unfall warnt vor Rückschlägen. Selbst fahren zeigt Eigenverantwortung auf dem Lebensweg.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Das Auto repräsentiert das Ego und die Art, wie man das eigene Leben lenkt. Bremsenversagen = Kontrollverlust; falscher Weg = falsche Lebensentscheidungen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Im Gestalt-Ansatz ist jedes Element des Autos ein Aspekt des Selbst. Das Steuer ist die Kontrolle; der Motor die innere Energie und Motivation.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MODERN_THEOLOGY, text: 'Moderne christliche Traumdeutung sieht das Auto als Symbol für Berufung und Lebensrichtung. Wer fährt, zeigt, wer das Leben kontrolliert – Gott oder das Ego.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.WESTERN_ZODIAC, text: 'Astrolog. zeigt das Auto den Merkur-Einfluss (Reisen, Kommunikation). Mars-Transit kann Unfallträume begünstigen und Handlungsdruck signalisieren.' },
    ],
  },
  {
    id: 'wald',
    name: 'Wald',
    category: 'natur',
    keywords: ['Bäume', 'dunkel', 'verloren', 'Natur', 'Urwald'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.NABULSI, text: 'Ein dichter Wald symbolisiert Verwirrung oder eine schwierige Lebenssituation. Ein lichter Wald mit Früchten verheißt Segen und Wohlstand.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Der Wald ist das kollektive Unbewusste – unkartiert, archaisch und voller Archetypen. Sich im Wald verirren bedeutet Verlust der Orientierung im Leben.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Der dunkle Wald war in Dantes Inferno der Beginn der spirituellen Irrfahrt. Er steht für moralische Orientierungslosigkeit und die Notwendigkeit göttlicher Führung.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.THERAVADA, text: 'Wald steht für Dschungel des Geistes – der Ort, an dem der Buddha Erleuchtung suchte. Gleichzeitig symbolisiert er die Wildheit unbezähmter Gedanken.' },
    ],
  },
  {
    id: 'meer',
    name: 'Meer / Ozean',
    category: 'natur',
    keywords: ['Wellen', 'Tiefe', 'Horizont', 'Sturm', 'tauchen'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Das Meer symbolisiert einen mächtigen Herrscher oder König. Im Meer schwimmen und sicher ankommen verheißt Triumph. Ertrinken bedeutet Überwältigung durch Probleme.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Das Meer ist das tiefste Symbol des kollektiven Unbewussten. Die Tiefe birgt Schätze (Selbstverwirklichung) und Gefahren (psychische Überwältigung).' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Das Meer steht für die ozeanische Empfindung – das Gefühl von Einheit mit dem Universum oder für pränatale Geborgenheit.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Das Meer symbolisiert die Zeit, das Chaos vor der Schöpfung und die unberechenbare Welt. Christus über das Wasser gehend zeigt Beherrschung des Chaos.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.ZEN, text: 'Der Ozean ist ein Bild für den Buddha-Geist: unendlich tief, an der Oberfläche bewegt, im Kern absolut ruhig.' },
    ],
  },
  {
    id: 'berg',
    name: 'Berg',
    category: 'natur',
    keywords: ['Gipfel', 'klettern', 'Höhe', 'Hindernis', 'Aussicht'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Einen Berg besteigen verheißt Erfolg, Rang und hohe Ziele. Auf einem Berggipfel stehen bedeutet Ehre und Ansehen. Vom Berg fallen warnt vor dem Verlust dieser Stellung.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Der Berg ist das höchste Selbst-Symbol. Der Aufstieg steht für den Individuationsprozess; der Gipfel für Erleuchtung und Integration.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Berge sind Orte der Gottesnähe (Sinai, Golgatha, Tabor). Im Traum ist der Berg-Aufstieg die Suche nach spiritueller Höhe und Gottesbegegnung.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Der heilige Berg (Kailash) ist Achse der Welt (Axis Mundi). Aufstieg symbolisiert Dharma-Praxis; der Gipfel ist Nirwana.' },
    ],
  },
  {
    id: 'regen',
    name: 'Regen',
    category: 'natur',
    keywords: ['Wetter', 'Wolken', 'Sturm', 'nass', 'Tropfen'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Regen im Traum ist ein deutliches Zeichen von Barmherzigkeit Allahs, Segen, Rizq und Fruchtbarkeit. Starker, schadhafter Regen kann Prüfungen andeuten.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Regen reinigt und befruchtet. Er symbolisiert das Durcharbeiten von Emotionen, Tränen der Seele oder eine emotionale Befreiung.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Regen steht für göttlichen Segen (Regen zur rechten Zeit) oder göttliches Gericht (Sintflut). Er nährt das Samenkorn des Glaubens.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.THERAVADA, text: 'Regen symbolisiert den Dharma, der auf alle ohne Unterschied fällt. Er reinigt Karma und fördert geistiges Wachstum.' },
    ],
  },
  {
    id: 'mond',
    name: 'Mond',
    category: 'natur',
    keywords: ['Nacht', 'Vollmond', 'Halbmond', 'Mondlicht', 'Zyklus'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Der Mond symbolisiert einen Herrscher, König oder einen bedeutenden Gelehrten. Den Mond glänzend zu sehen verheißt Erfolg; den Mond verdunkeln zu sehen deutet auf Leid hin.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Der Mond ist das Anima-Symbol (die weibliche Seele im Mann) und steht für Intuition, das Unbewusste, Zyklen und die dunkle, unbekannte Seite der Psyche.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Der Mond steht für die Kirche, die das Licht Christi (Sonne) widerspiegelt. Mondphasen symbolisieren die Unbeständigkeit irdischer Dinge.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.WESTERN_ZODIAC, text: 'Der Mond regiert das Gefühlsleben, Intuition, Mutter und Heimat. Mondträume spiegeln emotionale Zustände und unbewusste Bedürfnisse wider.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.ZEN, text: 'Der Finger zeigt auf den Mond, doch der Finger ist nicht der Mond. Der Vollmond steht für vollständige Erleuchtung.' },
    ],
  },
  {
    id: 'sonne',
    name: 'Sonne',
    category: 'natur',
    keywords: ['Licht', 'Wärme', 'Tag', 'strahlen', 'Sonnenaufgang'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Die Sonne symbolisiert den Herrscher oder Vater. Sie strahlend zu sehen verheißt Stärke und Gunst. Sonnenuntergang kann auf den Tod einer wichtigen Person hinweisen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Die Sonne ist das Bewusstsein und das Selbst. Sie repräsentiert das Animus-Symbol (männliche Kraft) und das Licht des Verstehens, das das Unbewusste erhellt.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Christus als Sol Invictus – die unbesiegbare Sonne. Sonne steht für Gerechtigkeit, Göttlichkeit, Auferstehung und Erleuchtung.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.WESTERN_ZODIAC, text: 'Die Sonne regiert das Ego, die Identität und den Lebensauftrag. Sonnenträume zeigen Vitalität, Führungsstärke oder Zentrum des Lebens.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Die Sonne symbolisiert den Dharmakaya – den reinen, erleuchteten Geist. Sonnenstrahlen sind Mitgefühl (Karuna), das alle Wesen erreicht.' },
    ],
  },
  {
    id: 'blut',
    name: 'Blut',
    category: 'koerper',
    keywords: ['Verletzung', 'Wunde', 'Bluten', 'Opfer', 'Leben'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Blut im Traum kann auf Sünde, Verbrechen oder unerlaubte Gewinne hinweisen. Fremdes Blut sehen kann bedeuten, dass man jemandem Unrecht getan hat. Eigenes Blut sehen mahnt zur Reue.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Blut steht für Lebensenergie, Vitalität und kann mit Kastrations- oder Geburtsängsten verknüpft sein. Menstruationsblut erscheint in Träumen als weibliche Zyklusverarbeitung.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Blut symbolisiert die Quintessenz des Lebens und der Seele. Blutopfer zeigt Transformation; der Wandel verlangt Hingabe.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Blut ist das Zeichen des Bundes (Moses) und der Erlösung durch Christi Kreuzesopfer. Traumblut kann Aufruf zur Buße oder Zeichen des Märtyrertums sein.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Blut ist das rote Element der Lebensenergie (Rlung). Blut trinken in Träumen gilt als Zeichen erhöhter tantristischer Energie oder als Warnung vor Aggression.' },
    ],
  },
  {
    id: 'spinne',
    name: 'Spinne',
    category: 'tiere',
    keywords: ['Netz', 'Insekt', 'Weben', 'Falle', 'Gift'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Die Spinne kann eine intrigante Frau oder einen heimtückischen Feind symbolisieren. Das Spinnennetz steht für Fallen und Listen. Die Sure Al-Ankabut ("Die Spinne") mahnt zur Standhaftigkeit.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Die Spinne ist ein Archetyp der Großen Mutter in ihrer bedrohlichen Form (Spinne als Weltenweber). Sie symbolisiert schicksalhafte Verstrickungen und das Weben des Lebens.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Spinnen stehen oft für die bedrohliche Mutter oder weibliche Sexualität. Das Eingesponnen-Werden spiegelt Festhaltung durch Mutterabhängigkeit wider.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Die Spinne kann Symbol des Teufels sein, der Seelen in sein Netz lockt. Ihr Netz steht für weltliche Verlockungen, die vom Glauben abhalten.' },
    ],
  },
  {
    id: 'vogel',
    name: 'Vogel',
    category: 'tiere',
    keywords: ['fliegen', 'Gesang', 'Feder', 'Nest', 'Freiheit'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Vögel symbolisieren Engel oder spirituelle Wesen. Einen Vogel fangen bedeutet Glück. Schöne Vögel verheißen gute Nachrichten; schwarze Vögel können Trauer ankündigen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Vögel sind Symbole der befreiten Seele, des Geistes und höherer Bewusstseinszustände. Der Phönix ist das Archetyp der Transformation durch Tod und Wiedergeburt.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Die Taube ist Symbol des Heiligen Geistes. Adler symbolisiert den Evangelisten Johannes und göttliche Perspektive. Allgemein stehen Vögel für Seelen.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Vögel repräsentieren in Träumen Aspekte des Bewusstseins. Der Garuda ist ein mächtiger Traumvogel, der Nagas besiegt und spirituelle Freiheit symbolisiert.' },
    ],
  },
  {
    id: 'treppe',
    name: 'Treppe',
    category: 'objekte',
    keywords: ['Stufen', 'aufsteigen', 'absteigen', 'Leiter', 'Stockwerk'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Eine Treppe aufsteigen bedeutet Aufstieg in Rang, Wissen oder Frömmigkeit. Abstieg bedeutet das Gegenteil. Die Himmelsleiter (Miradsch) ist das höchste Bild spirituellen Aufstiegs.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Treppen verbinden Bewusstsein (oben) und Unbewusstes (unten). Aufsteigen zeigt bewusste Entwicklung; Abstieg zeigt den Weg in tiefere Seelenschichten.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Freud interpretierte das Treppensteigen als sexuelle Symbolik – der rhythmische Aufstieg als Anspielung auf sexuellen Akt.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Jakobs Himmelsleiter ist das Ur-Bild. Treppen verbinden Erde und Himmel und symbolisieren den spirituellen Aufstieg zur Gottesnähe.' },
    ],
  },
  {
    id: 'tuer',
    name: 'Tür',
    category: 'objekte',
    keywords: ['Eingang', 'Schwelle', 'öffnen', 'schließen', 'Tor'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Eine Tür öffnen bedeutet eine neue Möglichkeit oder Tor zum Wissen. Eine verschlossene Tür symbolisiert Hindernisse auf dem Lebensweg. Eine schöne Tür verheißt eine gute Ehefrau oder Heimat.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Türen sind Schwellensymbole – Übergänge zwischen Bewusstsein und Unbewusstem, zwischen vertrautem und fremdem Terrain des Selbst.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Im Gestalt-Ansatz repräsentiert die Tür eine Entscheidungsmöglichkeit. Was liegt hinter der Tür? Was wagt man zu öffnen oder hält man lieber geschlossen?' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Christus als die Tür (Johannes 10:9): "Ich bin die Tür." Eine offene Tür symbolisiert göttliche Einladung; eine verschlossene mahnt zur Bereitschaft.' },
    ],
  },
  {
    id: 'schluessel',
    name: 'Schlüssel',
    category: 'objekte',
    keywords: ['aufschließen', 'Geheimnis', 'Lösung', 'Zugang', 'Schloss'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ein Schlüssel bedeutet Wissen, Lösung von Problemen und Zugang zu Schätzen. Die Schlüssel des Paradieses sind das höchste Bild. Einen Schlüssel finden verheißt Erfolg.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Der Schlüssel ist das Symbol für die Lösung eines psychologischen Komplexes. Er öffnet die Tür zum Unbewussten und ermöglicht Integration verborgener Inhalte.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Die Schlüssel Petri (Matthäus 16:19) symbolisieren geistliche Autorität und das Öffnen des Himmelreichs. Ein goldener Schlüssel steht für göttliche Gnade.' },
      { tradition: ReligiousCategory.NUMEROLOGY, source: ReligiousSource.PYTHAGOREAN, text: 'Numerologisch entspricht der Schlüssel der Zahl 3 (Dreieck, Dreifaltigkeit). Er steht für Kreativität, Synthese und die Kraft der Entfaltung.' },
    ],
  },
  {
    id: 'geld',
    name: 'Geld',
    category: 'objekte',
    keywords: ['Münzen', 'Reichtum', 'Scheine', 'verlieren', 'finden'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Gold und Silber finden kann positiv (Rizq) oder negativ (Anhäufung von Haram) gedeutet werden. Geld erhalten symbolisiert Segen; Geld verlieren warnt vor Ausgaben oder Verlusten.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Geld ist nach Freud ein Anal-Symbol (Fäkalien als erstes Besitztum des Kindes). Es steht für Kontrolle, Sparsamkeit oder Geiz.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Geld symbolisiert psychische Energie (Libido) und Wert. Reichtum im Traum zeigt innere Ressourcen; Armut zeigt mangelnden Zugang zur eigenen psychischen Kraft.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Die Liebe zum Geld ist die Wurzel allen Übels (1. Tim. 6:10). Geld im Traum kann auf Habgier hinweisen oder auf die Notwendigkeit, Schätze im Himmel anzusammeln.' },
    ],
  },
  {
    id: 'hochzeit',
    name: 'Hochzeit',
    category: 'aktionen',
    keywords: ['heiraten', 'Braut', 'Bräutigam', 'Zeremonie', 'Fest'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Eine Hochzeit träumen verheißt Freude, Segen und neue Verbindungen. Für Unverheiratete kann es eine bevorstehende Ehe andeuten. Für Kranke soll es jedoch Vorsicht geboten sein.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Die "hieros gamos" (heilige Hochzeit) ist das Symbol der Vereinigung von Animus und Anima – der Integration von männlichen und weiblichen Aspekten des Selbst.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Die Hochzeit Christi mit der Kirche (Apokalypse) ist das Urbild. Hochzeitsträume deuten auf Berufung, mystische Union mit Gott oder neue geistliche Verpflichtungen.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.WESTERN_ZODIAC, text: 'Venus-Jupiter-Konjunktionen begleiten oft Hochzeitsträume. Sie zeigen das Bedürfnis nach harmonischen Beziehungen und Vereinigung gegensätzlicher Kräfte.' },
    ],
  },
  {
    id: 'schwangerschaft',
    name: 'Schwangerschaft',
    category: 'koerper',
    keywords: ['schwanger', 'Geburt', 'Bauch', 'Kind erwarten', 'neues Leben'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Schwangerschaft träumen verheißt Freude, ein neues Projekt, wachsenden Wohlstand oder eine neue Verantwortung. Für Männer kann es auf finanzielles Wachstum hinweisen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Schwangerschaft symbolisiert die Reifung eines neuen Aspekts des Selbst oder eines kreativen Projekts, das geboren werden will.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Schwangerschaftsträume bei Frauen können Wunsch nach Mutterschaft oder Angst vor Schwangerschaft ausdrücken. Bei Männern zeigen sie Schöpfungswunsch.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Schwangerschaft steht für das Neue Leben in Christus und geistliche Fruchtbarkeit. Maria als Archetyp der empfangenden Seele.' },
    ],
  },
  {
    id: 'verfolgung',
    name: 'Verfolgung',
    category: 'aktionen',
    keywords: ['Flucht', 'verfolgt werden', 'Angst', 'laufen', 'Feind'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Von einem Feind verfolgt werden warnt vor realen Bedrohungen. Erfolgreich zu fliehen verheißt Sieg. Von einem Tier verfolgt werden kann auf die eigenen Leidenschaften hinweisen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Der Verfolger ist der Schatten – verdrängte, unintegrierte Persönlichkeitsanteile. Das Weglaufen zeigt die Verweigerung der Konfrontation mit dem eigenen Unbewussten.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Im Gestalt-Ansatz: Was verfolgt dich, und was könnte passieren, wenn du stehen bleibst und dich umwendest? Der Verfolger ist ein Teil von dir selbst.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Verfolgungsträume spiegeln die spirituelle Realität des Glaubenskampfes wider. Der Teufel als brüllender Löwe (1 Petrus 5:8) sucht Seelen zu verschlingen.' },
    ],
  },
  {
    id: 'nacht',
    name: 'Nacht / Dunkelheit',
    category: 'natur',
    keywords: ['dunkel', 'Sterne', 'schwarz', 'blind', 'Angst'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Nacht symbolisiert Unwissenheit, Prüfungen oder schwierige Zeiten. Sterne in der Nacht sehen gibt jedoch Hoffnung und spirituelle Führung. Morgenröte nach der Nacht verheißt Befreiung.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Nacht ist das Reich des Unbewussten. In der Dunkelheit des Traums begegnet man dem Schatten. Die Dunkelheit ist kein Feind, sondern Einladung zur Selbsterkenntnis.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Die dunkle Nacht der Seele (Johannes vom Kreuz) ist eine mystische Phase spiritueller Trockenheit und Reinigung, die zur innigen Gottesverbindung führt.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.ZEN, text: 'Dunkelheit ist kein Mangel, sondern die Quelle. Im Zen-Bild des "Großen Nicht-Wissens" ist die Nacht Raum für echtes Erwachen jenseits von Konzepten.' },
    ],
  },
  {
    id: 'licht',
    name: 'Licht',
    category: 'spirituelles',
    keywords: ['Helligkeit', 'Glanz', 'Strahlen', 'Erleuchtung', 'Lampe'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Licht im Traum ist ein Zeichen von Iman (Glaube), Wissen und göttlicher Führung. Allahs Licht ("Allahu Nurus-Samawati") zu erleben ist ein seltenes Zeichen spiritueller Erhebung.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Licht ist das Bewusstsein selbst. Traumlicht zeigt Erleuchtungsmomente, das Durchdringen des Unbewussten durch das Bewusstsein und spirituelle Intuition.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Christus als Licht der Welt (Johannes 8:12). Ein Lichtraum im Traum symbolisiert göttliche Gegenwart, Offenbarung und spirituelle Erkenntnis.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Das "klare Licht" (Ösel) ist in der tibetischen Tradition das Zeichen vollständiger Erleuchtung. Es erscheint im Traum als Hinweis auf Rigpa (naturhafter Geisteszustand).' },
    ],
  },
  {
    id: 'spiegel',
    name: 'Spiegel',
    category: 'objekte',
    keywords: ['Reflexion', 'Selbstbild', 'Abbild', 'schauen', 'Spiegelbild'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ein klarer Spiegel zeigt Selbsterkenntnis und Reinheit des Herzens. Ein trüber Spiegel deutet auf Verblendung. Im Spiegel das Gesicht eines anderen sehen kann auf Identitätswechsel hinweisen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Der Spiegel zeigt das Selbst-Bild versus das wahre Selbst. Was man im Traumspiegel sieht, zeigt, wie man sich wirklich wahrnimmt – oft anders als das Alltagsbild.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Der Spiegel steht für Narzissmus und die Selbstbezogenheit des Träumers. Ein gebrochener Spiegel symbolisiert das zerbrochene Selbstbild.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.ZEN, text: 'Der polierte Spiegel (Bilder des Huineng und Shenxiu) symbolisiert den reinen Geist. Der Spiegel zeigt nur Bilder – keine Substanz: Alles ist leer (Sunyata).' },
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    category: 'objekte',
    keywords: ['Reichtum', 'Schmuck', 'Schatz', 'wertvoll', 'glänzen'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Gold für Frauen träumen ist positiv (Schmuck, Wohlstand). Für Männer gilt Gold oft als negatives Zeichen, da das Tragen von Gold Männern im Islam verboten ist – es warnt vor Haram.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Gold ist das Symbol des Selbst – das Ziel des alchemistischen Prozesses der Individuation. Der "Goldene Schatz" im Traum zeigt die Nähe zum wahren Selbst.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Gold symbolisiert göttliche Weisheit, Reinheit und himmlischen Wert. Die goldene Stadt Jerusalem steht für das Reich Gottes.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.WESTERN_ZODIAC, text: 'Gold ist dem Sol (Sonne) und Löwen zugeordnet. Goldträume unter Sonnen-Transiten zeigen wachsendes Selbstbewusstsein und Lebensenergie.' },
    ],
  },
  {
    id: 'schloss',
    name: 'Schloss / Gebäude',
    category: 'objekte',
    keywords: ['Palast', 'Burg', 'Turm', 'Festung', 'Zimmer'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.NABULSI, text: 'Ein prächtiges Schloss symbolisiert Ansehen, Macht und Reichtum. Tritt man ins Schloss ein, verheißt es Eintritt in ein gutes Leben. Verlassene Schlösser warnen vor Hybris.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Das Schloss ist ein erweitertes Haus-Symbol für die Persönlichkeitsstruktur. Verborgene Zimmer zeigen unentdeckte Aspekte des Selbst.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Die innere Burg (Teresa von Ávila) ist die Seele selbst. Durch Gebet gelangt man in die innersten Gemächer – die Vereinigung mit Gott.' },
    ],
  },
  {
    id: 'engel',
    name: 'Engel',
    category: 'spirituelles',
    keywords: ['Himmelsbote', 'Flügel', 'Licht', 'Botschaft', 'Schutz'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Engel im Traum sind Träger göttlicher Botschaften. Sie zeigen an, dass der Träumer ein gläubiges Herz hat. Jibril (Gabriel) zu sehen gilt als höchste spirituelle Gabe.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Engel sind Botschafter des Selbst – Archetypen des Heiligen Geistes und höherer Bewusstseinszustände. Sie vermitteln Weisheit aus dem kollektiven Unbewussten.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: 'Engel sind Gottes Boten (Angeloi). Bibelträume mit Engeln (Jakobs Traum, Josephs Träume) galten als direkte göttliche Kommunikation.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Dakinis und Dharmapälas sind tibetische Entsprechungen – Schutzgottheiten und Weisheitswesen, die in Träumen erscheinen und spirituelle Praktiken fördern.' },
    ],
  },
  {
    id: 'kind',
    name: 'Kind',
    category: 'menschen',
    keywords: ['spielen', 'unschuldig', 'jung', 'heranwachsen', 'inner child'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ein Kind im Traum symbolisiert Freude, neues Rizq oder einen neuen Anfang. Ein krankes Kind warnt vor Sorgen in der Familie oder einem Projekt.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Das "Innere Kind" ist der Archetyp der ursprünglichen Ganzheit und Unschuld. Kindheitsszenen zeigen ungelöste Prägungen, die im Erwachsenenleben nachwirken.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.CHURCH_FATHERS, text: '"Wenn ihr nicht werdet wie die Kinder..." (Mt. 18:3). Das Kind symbolisiert spirituelle Offenheit, Vertrauen und die Bereitschaft zum Umkehren.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.WESTERN_ZODIAC, text: 'Kinder in Träumen stehen astrologisch für den Mond (Kindheit, Mutter) und Saturn (Karma und vergangene Leben). Sie zeigen emotionale Grundbedürfnisse.' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// KATEGORIEN
// ─────────────────────────────────────────────────────────────────────────────

export const categories: KnowledgeBaseCategory[] = [
  { id: 'natur', label: 'Natur', icon: '🌿', description: 'Naturphänomene und Landschaften: Wasser, Feuer, Wald, Meer, Berge, Wetter' },
  { id: 'tiere', label: 'Tiere', icon: '🐍', description: 'Traumtiere und ihre symbolische Bedeutung: Schlange, Hund, Vogel, Spinne' },
  { id: 'menschen', label: 'Menschen', icon: '👤', description: 'Personen im Traum: Bekannte, Fremde, Kinder, verstorbene Menschen' },
  { id: 'objekte', label: 'Objekte', icon: '🗝️', description: 'Gegenstände mit symbolischer Kraft: Schlüssel, Spiegel, Haus, Auto, Gold' },
  { id: 'aktionen', label: 'Aktionen', icon: '⚡', description: 'Traumhandlungen: Fliegen, Fallen, Laufen, Hochzeit, Verfolgung' },
  { id: 'emotionen', label: 'Emotionen', icon: '💫', description: 'Gefühlszustände im Traum: Angst, Freude, Trauer, Liebe, Wut' },
  { id: 'koerper', label: 'Körper', icon: '🫀', description: 'Körperbezogene Symbole: Zähne, Blut, Schwangerschaft, Verletzungen' },
  { id: 'spirituelles', label: 'Spirituelles', icon: '✨', description: 'Spirituelle und religiöse Symbole: Engel, Licht, Tod, Götter, heilige Orte' },
];

// ─────────────────────────────────────────────────────────────────────────────
// TRADITIONEN (Beschreibungen pro Tradition + Quelle)
// ─────────────────────────────────────────────────────────────────────────────

export const traditions: Partial<Record<ReligiousCategory, { label: string; desc: string; sources: Partial<Record<ReligiousSource, { label: string; shortDesc: string }>> }>> = {
  [ReligiousCategory.ISLAMIC]: {
    label: 'Islamische Traumdeutung',
    desc: 'Die islamische Traumdeutung (Ta\'bir al-Ru\'ya) gilt als eine der ältesten und systematischsten Traumwissenschaften. Prophet Muhammad (s.a.w.) betonte die Wichtigkeit wahrer Träume (Ru\'ya Sadiqa) als göttliche Botschaften. Gute Träume kommen von Allah, schlechte vom Shaitan.',
    sources: {
      [ReligiousSource.IBN_SIRIN]: { label: 'Ibn Sirin', shortDesc: 'Bedeutendster islamischer Traumdeuter (654–728 n.Chr.), Autor des Mukhtar al-Kalam fi Tabir al-Ahlam' },
      [ReligiousSource.NABULSI]: { label: 'Al-Nabulsi', shortDesc: 'Osmanischer Gelehrter (1641–1731), Autor von Ta\'tir al-Anam – eine der umfangreichsten Traumdeutungswerke' },
      [ReligiousSource.AL_ISKHAFI]: { label: 'Al-Iskhafi', shortDesc: 'Mittelalterlicher Traumdeuter, bekannt für systematische Klassifikation der Traumsymbole nach Kategorien' },
    },
  },
  [ReligiousCategory.PSYCHOLOGICAL]: {
    label: 'Psychologische Traumdeutung',
    desc: 'Die moderne Psychologie betrachtet Träume als Spiegel des Unbewussten. Freud sah sie als "Königsweg zum Unbewussten" – voller verdrängter Wünsche. Jung erweiterte dies um das kollektive Unbewusste mit universellen Archetypen.',
    sources: {
      [ReligiousSource.FREUDIAN]: { label: 'Sigmund Freud', shortDesc: 'Begründer der Psychoanalyse (1856–1939), "Die Traumdeutung" (1900) – Träume als erfüllte Wünsche des Es' },
      [ReligiousSource.JUNGIAN]: { label: 'C.G. Jung', shortDesc: 'Analytische Psychologie (1875–1961), kollektives Unbewusstes, Archetypen, Individuation' },
      [ReligiousSource.GESTALT]: { label: 'Gestalt-Therapie', shortDesc: 'Fritz Perls (1893–1970): Jedes Traumelement ist ein Teil des Träumers – Integration durch Identifikation' },
    },
  },
  [ReligiousCategory.CHRISTIAN]: {
    label: 'Christliche Traumdeutung',
    desc: 'In der Bibel waren Träume ein zentrales Mittel göttlicher Offenbarung (Josephs Träume, Daniel, Petrus). Die Kirchenväter diskutierten intensiv den Ursprung von Träumen: göttlich, dämonisch oder natürlich.',
    sources: {
      [ReligiousSource.MEDIEVAL]: { label: 'Mittelalterliche Tradition', shortDesc: 'Macrobius, Hildegard von Bingen – Klassifikation in fünf Traumtypen: Somnium, Visio, Oraculum, Insomnium, Visum' },
      [ReligiousSource.CHURCH_FATHERS]: { label: 'Kirchenväter', shortDesc: 'Origenes, Augustinus, Tertullian – Debatte über Traumursprung und göttliche Offenbarung durch Träume' },
      [ReligiousSource.MODERN_THEOLOGY]: { label: 'Moderne Theologie', shortDesc: 'Morton Kelsey, John Sanford – Integration von Jung und Christentum; Träume als Gottes Sprache' },
    },
  },
  [ReligiousCategory.BUDDHIST]: {
    label: 'Östliche / Buddhistische Traumdeutung',
    desc: 'In buddhistischen und hinduistischen Traditionen sind Träume Fenster in karmische Realitäten. Das Tibetische Buch der Toten enthält Anweisungen zur Traumpraxis (Traumyoga). Träume zeigen den Geisteszustand und karmische Prägungen.',
    sources: {
      [ReligiousSource.TIBETAN]: { label: 'Tibetischer Buddhismus', shortDesc: 'Traumyoga als Teil der Sechs Yogas des Naropa; Träume als Bardo-Erfahrungen und karmische Spiegel' },
      [ReligiousSource.ZEN]: { label: 'Zen-Buddhismus', shortDesc: 'Träume als Ausdruck des Koan-Geistes; Traum und Wirklichkeit sind letztlich nicht verschieden (Zhuangzi)' },
      [ReligiousSource.THERAVADA]: { label: 'Theravada', shortDesc: 'Pali-Kanon: Träume als mentale Konstrukte; Buddha träumte fünf prophetische Träume vor seiner Erleuchtung' },
    },
  },
  [ReligiousCategory.ASTROLOGY]: {
    label: 'Astrologische Traumdeutung',
    desc: 'Die Astrologie verbindet Planetenkonstellationen mit Traumthemen. Bestimmte Transite aktivieren spezifische Archetypen im Unbewussten und manifestieren sich als Traumsymbole. Mondphasen beeinflussen besonders die Traumintensität.',
    sources: {
      [ReligiousSource.WESTERN_ZODIAC]: { label: 'Westliche Astrologie', shortDesc: 'Griechisch-hellenistische Tradition; Planeten als Traumarchitekten – Mars trägt Aggression, Venus Liebe, Neptun Mythos' },
      [ReligiousSource.VEDIC_ASTROLOGY]: { label: 'Vedische Astrologie (Jyotish)', shortDesc: 'Hinduistische Astrologie; Nakshatras (Mondstationen) und Graha-Träume; Träume zur Horoskop-Deutung genutzt' },
      [ReligiousSource.CHINESE_ZODIAC]: { label: 'Chinesische Astrologie', shortDesc: '12 Tierzeichen und 5 Elemente; Traumsymbole im Kontext von Yin/Yang-Balance und jahreszeitlichen Qi-Flüssen' },
    },
  },
  [ReligiousCategory.NUMEROLOGY]: {
    label: 'Numerologische Traumdeutung',
    desc: 'Zahlen, die im Traum erscheinen, tragen tiefe symbolische Bedeutungen. Jede Zahl hat eine Schwingung und Qualität. Wiederkehrende Traumzahlen können Lebensweg-Zahlen, Engelszahlen oder karmische Zeichen sein.',
    sources: {
      [ReligiousSource.PYTHAGOREAN]: { label: 'Pythagoreische Numerologie', shortDesc: 'Westliche Numerologie (Pythagoras 570 v.Chr.); Zahlen 1–9 als Grundschwingungen aller Lebensphänomene' },
      [ReligiousSource.CHALDEAN]: { label: 'Chaldäische Numerologie', shortDesc: 'Altbabylonische Tradition; gilt als ältestes Zahlensystem; Zahlen 1–8 (9 ist heilig/getrennt)' },
      [ReligiousSource.KABBALAH_NUMEROLOGY]: { label: 'Kabbala-Numerologie', shortDesc: 'Jüdisch-mystische Gematria; Buchstaben des Alphabets tragen Zahlenwerte; Sefirot als kosmisches Zahlensystem' },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SPRACHBASIERTE SOURCE-INFO (für InfoModal: KNOWLEDGE_BASE[language][sourceKey])
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_INFO_DE: Record<string, SourceInfo> = {
  [ReligiousSource.IBN_SIRIN]: {
    title: 'Ibn Sirin',
    desc: 'Der bedeutendste islamische Traumdeuter der Geschichte. Sein Werk ist bis heute Standardreferenz für islamische Traumdeutung (Ta\'bir).',
    origin: 'Basra, Irak (654–728 n.Chr.)',
    bio: 'Muhammad ibn Sirin war ein Tabi\'i (Nachfolger der Gefährten des Propheten), Gelehrter und Traumdeuter. Er soll gesagt haben: "Das Wissen über Träume stammt von den Propheten." Sein Werk "Mukhtar al-Kalam fi Tabir al-Ahlam" systematisiert Tausende von Traumsymbolen nach islamischen Prinzipien.',
  },
  [ReligiousSource.NABULSI]: {
    title: 'Abd al-Ghani al-Nabulsi',
    desc: 'Osmanischer Sufi-Gelehrter, Dichter und einer der produktivsten Traumdeuter der islamischen Welt mit über 500 Werken.',
    origin: 'Damaskus, Syrien (1641–1731 n.Chr.)',
    bio: 'Al-Nabulsi war ein universell gebildeter Gelehrter, der Mystik (Sufismus), Jurisprudenz und Traumdeutung verband. Sein Werk "Ta\'tir al-Anam fi Tabir al-Manam" ist eines der umfangreichsten Traumdeutungswerke der islamischen Literatur und enthält über 40.000 Traumsymbole.',
  },
  [ReligiousSource.AL_ISKHAFI]: {
    title: 'Al-Iskhafi',
    desc: 'Mittelalterlicher islamischer Traumdeuter, bekannt für seine systematische Kategorisierung von Traumsymbolen.',
    origin: 'Persisch-arabische Welt, 10.–11. Jahrhundert',
    bio: 'Al-Iskhafi entwickelte eine Methode zur Klassifikation von Traumsymbolen nach Herkunft, Kontext und religiöser Bedeutung. Sein Ansatz beeinflusste die islamische Traumdeutungsliteratur nachhaltig.',
  },
  [ReligiousSource.FREUDIAN]: {
    title: 'Sigmund Freud',
    desc: 'Begründer der Psychoanalyse und Autor der epochalen "Traumdeutung" (1900) – dem ersten wissenschaftlichen Werk über Traumpsychologie.',
    origin: 'Freiberg (Mähren), Habsburg (1856–1939)',
    bio: 'Freud revolutionierte das Verständnis von Träumen: Sie sind der "Königsweg zum Unbewussten". Im Traum zeigen sich verdrängte Wünsche, Ängste und Triebe in verschlüsselter Form. Freud unterschied zwischen dem manifesten (erlebten) und latenten (verborgenen) Trauminhalt. Sexualität und Aggression spielten in seiner Theorie eine zentrale Rolle.',
  },
  [ReligiousSource.JUNGIAN]: {
    title: 'C.G. Jung',
    desc: 'Begründer der Analytischen Psychologie. Erweiterte Freuds Ansatz um das kollektive Unbewusste und Archetypen als universelle Bedeutungsträger.',
    origin: 'Kesswil, Schweiz (1875–1961)',
    bio: 'Carl Gustav Jung sah Träume als Selbstregulierung der Psyche. Er entdeckte universelle Symbole (Archetypen) wie Schatten, Anima, Selbst und Held. Träume zeigen den Individuation-Prozess – die Reise zur psychischen Ganzheit. Jung betonte: "Der Traum ist das kleine verborgene Tor in das innerste und geheimste Gemach der Seele."',
  },
  [ReligiousSource.GESTALT]: {
    title: 'Gestalt-Therapie',
    desc: 'Therapeutischer Ansatz nach Fritz Perls: Jedes Element eines Traums ist ein Teil des Träumers und will integriert werden.',
    origin: 'Frankfurt, Deutschland / New York / Esalen (1940er–1960er)',
    bio: 'Fritz Perls entwickelte die Gestalt-Traumarbeit: Man schlüpft in jede Traumfigur und jeden Traumgegenstand und spricht aus deren Perspektive. So werden abgespaltene Persönlichkeitsanteile bewusst und integriert. Träume sind "Botschaften von sich selbst an sich selbst."',
  },
  [ReligiousSource.MEDIEVAL]: {
    title: 'Mittelalterliche christliche Traumdeutung',
    desc: 'Systematische Klassifikation von Träumen in fünf Typen durch mittelalterliche Gelehrte wie Macrobius und Hildegard von Bingen.',
    origin: 'Europa, 5.–15. Jahrhundert',
    bio: 'Macrobius (ca. 400 n.Chr.) klassifizierte: Somnium (symbolischer Traum), Visio (prophetisches Bild), Oraculum (göttliche Botschaft), Insomnium (bedeutungsloser Traum), Visum (Halluzination). Hildegard von Bingen (1098–1179) sah ihre mystischen Träume als "Lebendiges Licht" und göttliche Offenbarungen.',
  },
  [ReligiousSource.CHURCH_FATHERS]: {
    title: 'Kirchenväter',
    desc: 'Frühchristliche Theologen, die den Ursprung von Träumen debattierten: göttlich, dämonisch oder natürlich.',
    origin: 'Nordafrika, Ägypten, Syrien (2.–5. Jahrhundert)',
    bio: 'Augustinus (354–430) unterschied zwischen Träumen natürlichen Ursprungs und göttlichen Visionen. Origenes sah Träume als Kommunikationsweg zwischen Mensch und Geistwelt. Tertullian warnte vor dämonischen Träumen, erkannte aber echte prophetische Träume an. Ihre Werke prägten das christliche Traumverständnis für Jahrhunderte.',
  },
  [ReligiousSource.MODERN_THEOLOGY]: {
    title: 'Moderne christliche Theologie',
    desc: 'Zeitgenössische Theologen, die Psychologie und Glauben verbinden und Träume als Teil spiritueller Entwicklung verstehen.',
    origin: 'USA/Europa, 20.–21. Jahrhundert',
    bio: 'Morton Kelsey und John Sanford, beeinflusst von Jung, sahen Träume als Gottes Sprache in der modernen Welt. Hermann Riffel (1916–2009) entwickelte eine christliche Traumdeutungspraxis. Heute integrieren spirituelle Begleiter und christliche Therapeuten Traumarbeit in Seelsorge und Gebet.',
  },
  [ReligiousSource.TIBETAN]: {
    title: 'Tibetischer Buddhismus (Traumyoga)',
    desc: 'Traumyoga ist eine der Sechs Yogas des Naropa – eine Meditationspraxis, die im Traum Erleuchtung anstrebt.',
    origin: 'Tibet, Himalaya-Region (8. Jahrhundert bis heute)',
    bio: 'Im tibetischen Buddhismus gilt: Wer im Traum "klar" ist (luzid träumt), kann im Bardo (Zwischenzustand) die Natur des Geistes erkennen. Milarepa und andere Meister praktizierten Traumyoga intensiv. Das Bardo Thodol (Tibetisches Buch der Toten) enthält Anweisungen, wie Träume zur Befreiung genutzt werden.',
  },
  [ReligiousSource.ZEN]: {
    title: 'Zen-Buddhismus',
    desc: 'Im Zen wird die Grenze zwischen Traum und Wirklichkeit aufgelöst. Der erleuchtete Geist unterscheidet nicht.',
    origin: 'China / Japan (7. Jahrhundert bis heute)',
    bio: 'Dogen Zenji (1200–1253): "Zu lernen, was Erleuchtung bedeutet, heißt, sich selbst kennen zu lernen." Zhuangzi träumte, ein Schmetterling zu sein – und fragte sich nach dem Erwachen: Bin ich ein Mensch, der träumt, ein Schmetterling zu sein, oder ein Schmetterling, der träumt, ein Mensch zu sein? Im Zen zeigt der Traum die relative Natur aller Erscheinungen.',
  },
  [ReligiousSource.THERAVADA]: {
    title: 'Theravada-Buddhismus',
    desc: 'Die älteste erhaltene buddhistische Schule betrachtet Träume als mentale Konstrukte, die Karma und Geisteszustand widerspiegeln.',
    origin: 'Sri Lanka, Südostasien (3. Jahrhundert v.Chr. bis heute)',
    bio: 'Der Pali-Kanon erwähnt fünf Arten von Träumen: durch Körperzustände, Erinnerungen, Geistwesen, eigene Wünsche und prophetische Träume. Der Buddha soll vor seiner Erleuchtung fünf große Träume gehabt haben. Träume sind Mano-Dhamma – Geistobjekte, die geistige Reaktionen (Citta) auslösen.',
  },
  [ReligiousSource.WESTERN_ZODIAC]: {
    title: 'Westliche Astrologie',
    desc: 'Die griechisch-hellenistische Astrologie verbindet Planetenbewegungen mit psychischen Zuständen und Traumthemen.',
    origin: 'Mesopotamien / Griechenland / Rom (3000 v.Chr. bis heute)',
    bio: 'Planeten als Traumarchitekten: Mars aktiviert Aggressions- und Energieträume; Venus Liebes- und Beziehungsträume; Neptun mystische und verwirrende Träume; Mond emotionale und Vergangenheitsträume. Transits über den Aszendenten oder den Mond verstärken Traumaktivität. Ptolemäus (100–170 n.Chr.) verband Astrologie und Oneirokritik.',
  },
  [ReligiousSource.VEDIC_ASTROLOGY]: {
    title: 'Vedische Astrologie (Jyotish)',
    desc: 'Das "Licht der Veden" – altindische Sternenweisheit, die Träume in Bezug auf Karma und Dharma deutet.',
    origin: 'Indien, Vedische Periode (1500 v.Chr. bis heute)',
    bio: 'Im Jyotish werden Nakshatras (27 Mondstationen) zur Traumanalyse genutzt. Träume in der Brahma-Muhurta (90 Min. vor Sonnenaufgang) gelten als besonders prophetisch. Das 12. Haus (Vyaya Bhava) regiert Träume, Isolation und Moksha. Graha (Planeten) erscheinen als Göttergestalten in bedeutenden Träumen.',
  },
  [ReligiousSource.CHINESE_ZODIAC]: {
    title: 'Chinesische Astrologie',
    desc: 'Die chinesische Tradition verbindet Träume mit Qi-Flüssen, Yin-Yang-Balance und den fünf Wandlungsphasen.',
    origin: 'China, Shang-Dynastie bis heute (1600 v.Chr.)',
    bio: 'Im chinesischen System haben Träume fünf Qualitäten entsprechend den fünf Elementen: Holz (Wachstum, Kreativität), Feuer (Passion, Klarheit), Erde (Stabilität), Metall (Trauer, Reinheit), Wasser (Weisheit, Angst). Das Buch der Wandlungen (I-Ging) wird zur Traumanalyse genutzt. Zhuangzi gilt als bedeutendster Traumphilosoph Chinas.',
  },
  [ReligiousSource.PYTHAGOREAN]: {
    title: 'Pythagoreische Numerologie',
    desc: 'Westliches Zahlensystem nach Pythagoras: Zahlen 1–9 als Grundschwingungen aller Erscheinungen.',
    origin: 'Samos, Griechenland (570–495 v.Chr.)',
    bio: 'Pythagoras lehrte: "Alles ist Zahl." Jede Zahl hat eine einzigartige Schwingung: 1=Einheit/Führung, 2=Dualität/Partnerschaft, 3=Kreativität/Ausdruck, 4=Stabilität/Arbeit, 5=Freiheit/Wandel, 6=Harmonie/Familie, 7=Weisheit/Spiritualität, 8=Macht/Materialismus, 9=Vollendung/Universalität. Traumzahlen zeigen aktive Lebensthemen.',
  },
  [ReligiousSource.CHALDEAN]: {
    title: 'Chaldäische Numerologie',
    desc: 'Das älteste Zahlensystem aus Babylonien, das auf Klangschwingungen basiert – gilt als präzisester Traumzahlen-Ansatz.',
    origin: 'Babylon, Mesopotamien (2000 v.Chr.)',
    bio: 'Die Chaldäer – die Sternenpriester Babylons – entwickelten ein Zahlensystem, das auf der Schwingungsenergie von Namen und Geburtsdaten basiert. Die Zahl 9 ist heilig und wird nicht direkt zugewiesen. Traumzahlen im chaldäischen System zeigen tiefe karmische Muster und Seelenmissionen.',
  },
  [ReligiousSource.KABBALAH_NUMEROLOGY]: {
    title: 'Kabbala-Numerologie (Gematria)',
    desc: 'Jüdisch-mystisches Zahlensystem, das hebräische Buchstaben mit Zahlen verbindet und tiefe spirituelle Bedeutungen entschlüsselt.',
    origin: 'Spanien / Babylon, jüdische Mystik (1.–13. Jahrhundert)',
    bio: 'In der Kabbala hat jeder hebräische Buchstabe einen Zahlenwert (Aleph=1 bis Tav=400). Die zehn Sefirot des Lebensbaums repräsentieren kosmische Kräfte, die in Träumen als Archetypen erscheinen. Traumzahlen können auf Sefirot verweisen: 1=Keter (Krone), 2=Chokmah (Weisheit), 3=Binah (Verständnis) usw.',
  },
  [ReligiousSource.ISLAMIC_NUMEROLOGY]: {
    title: 'Islamische Numerologie (\'Ilm al-Huruf)',
    desc: 'Das Wissen der Buchstaben – mystische Zahlenbedeutung im Islam, verbunden mit den 99 Namen Allahs und dem Abjad-System.',
    origin: 'Arabische Welt, Islamische Periode (7.–15. Jahrhundert)',
    bio: '\'Ilm al-Huruf (die Wissenschaft der Buchstaben) ordnet arabischen Buchstaben Zahlenwerte zu (Abjad). Koranische Buchstaben wie Alif-Lam-Mim am Beginn von Suren tragen verborgene numerische Botschaften. Im Sufismus nutzte Ibn Arabi numerische Analysen für spirituelle Traumdeutung.',
  },
  [ReligiousSource.VEDIC_NUMEROLOGY]: {
    title: 'Vedische Numerologie',
    desc: 'Hinduistisches Zahlensystem aus den Veden, verbunden mit kosmischen Kräften und den neun Planeten (Navagraha).',
    origin: 'Indien, Vedische Periode (1500 v.Chr. bis heute)',
    bio: 'In der vedischen Numerologie entsprechen die Zahlen 1–9 den neun Planeten: 1=Sonne, 2=Mond, 3=Jupiter, 4=Rahu, 5=Merkur, 6=Venus, 7=Ketu, 8=Saturn, 9=Mars. Träume mit bestimmten Zahlen zeigen, welche planetarische Energie aktiv ist. Die Lebenszahl (Mulank) und Schicksalszahl (Bhagyank) sind Schlüssel.',
  },
};

const SOURCE_INFO_RU: Record<string, SourceInfo> = {
  [ReligiousSource.IBN_SIRIN]: {
    title: 'Ибн Сирин',
    desc: 'Величайший исламский толкователь снов в истории. Его труд по сей день остаётся стандартным источником по исламскому толкованию снов (та\'бир).',
    origin: 'Басра, Ирак (654–728 н.э.)',
    bio: 'Мухаммад ибн Сирин был таби\'и (последователем сподвижников Пророка), учёным и толкователем снов. Ему приписывают слова: «Знание о снах пришло от пророков». Его труд «Мухтар аль-Калам фи Табир аль-Ахлям» систематизирует тысячи символов сновидений в соответствии с исламскими принципами.',
  },
  [ReligiousSource.NABULSI]: {
    title: 'Абд аль-Гани ан-Наблуси',
    desc: 'Османский суфийский учёный, поэт и один из самых плодовитых толкователей снов в исламском мире, автор более 500 трудов.',
    origin: 'Дамаск, Сирия (1641–1731 н.э.)',
    bio: 'Ан-Наблуси был универсально образованным учёным, соединявшим мистику (суфизм), юриспруденцию и толкование снов. Его труд «Та\'тир аль-Анам фи Табир аль-Манам» — одно из наиболее обширных произведений по толкованию снов в исламской литературе, содержащее более 40 000 символов.',
  },
  [ReligiousSource.AL_ISKHAFI]: {
    title: 'Аль-Исхафи',
    desc: 'Средневековый исламский толкователь снов, известный своей систематической классификацией символов сновидений.',
    origin: 'Персо-арабский мир, X–XI вв.',
    bio: 'Аль-Исхафи разработал метод классификации символов сновидений по происхождению, контексту и религиозному значению. Его подход оказал устойчивое влияние на литературу исламского толкования снов.',
  },
  [ReligiousSource.FREUDIAN]: {
    title: 'Зигмунд Фрейд',
    desc: 'Основатель психоанализа и автор эпохального труда «Толкование сновидений» (1900) — первого научного исследования психологии снов.',
    origin: 'Фрайберг (Моравия), Австро-Венгрия (1856–1939)',
    bio: 'Фрейд произвёл революцию в понимании снов: они являются «королевским путём к бессознательному». Во сне в зашифрованном виде проявляются вытесненные желания, страхи и влечения. Фрейд различал явное (переживаемое) и скрытое (латентное) содержание сна. Сексуальность и агрессия играли в его теории центральную роль.',
  },
  [ReligiousSource.JUNGIAN]: {
    title: 'К.Г. Юнг',
    desc: 'Основатель аналитической психологии. Расширил подход Фрейда, включив коллективное бессознательное и архетипы как универсальные носители смысла.',
    origin: 'Кесвиль, Швейцария (1875–1961)',
    bio: 'Карл Густав Юнг рассматривал сны как саморегуляцию психики. Он открыл универсальные символы (архетипы): Тень, Анима, Самость, Герой. Сны отражают процесс индивидуации — путь к психической целостности. Юнг писал: «Сон — это маленькие скрытые врата в самый сокровенный и тайный покой души».',
  },
  [ReligiousSource.GESTALT]: {
    title: 'Гештальт-терапия',
    desc: 'Терапевтический подход Фрица Перлза: каждый элемент сна является частью сновидца и стремится к интеграции.',
    origin: 'Франкфурт, Германия / Нью-Йорк / Эзален (1940-е–1960-е)',
    bio: 'Фриц Перлз разработал гештальт-работу со снами: человек «вживается» в каждого персонажа и каждый предмет сна и говорит с их точки зрения. Так отщеплённые части личности осознаются и интегрируются. Сны — это «послания самому себе от самого себя».',
  },
  [ReligiousSource.MEDIEVAL]: {
    title: 'Средневековое христианское толкование снов',
    desc: 'Систематическая классификация снов на пять типов средневековыми учёными — Макробием и Хильдегардой Бингенской.',
    origin: 'Европа, V–XV вв.',
    bio: 'Макробий (ок. 400 н.э.) выделял: Somnium (символический сон), Visio (пророческий образ), Oraculum (божественное послание), Insomnium (незначимый сон), Visum (галлюцинация). Хильдегарда Бингенская (1098–1179) воспринимала свои мистические сны как «Живой свет» и божественные откровения.',
  },
  [ReligiousSource.CHURCH_FATHERS]: {
    title: 'Отцы Церкви',
    desc: 'Раннехристианские богословы, дискутировавшие о происхождении снов: божественном, демоническом или естественном.',
    origin: 'Северная Африка, Египет, Сирия (II–V вв.)',
    bio: 'Августин (354–430) разграничивал сны естественного происхождения и божественные видения. Ориген считал сны путём общения между человеком и духовным миром. Тертуллиан предостерегал от демонических снов, но признавал подлинные пророческие сновидения. Их труды определили христианское понимание снов на многие века.',
  },
  [ReligiousSource.MODERN_THEOLOGY]: {
    title: 'Современная христианская теология',
    desc: 'Современные богословы, объединяющие психологию и веру и воспринимающие сны как часть духовного развития.',
    origin: 'США / Европа, XX–XXI вв.',
    bio: 'Мортон Келси и Джон Сэнфорд, испытавшие влияние Юнга, рассматривали сны как язык Бога в современном мире. Герман Риффель (1916–2009) разработал христианскую практику толкования снов. Сегодня духовные наставники и христианские терапевты интегрируют работу со снами в пастырское служение и молитву.',
  },
  [ReligiousSource.TIBETAN]: {
    title: 'Тибетский буддизм (йога сновидений)',
    desc: 'Йога сновидений — одна из Шести йог Наропы: медитативная практика, направленная на достижение просветления во сне.',
    origin: 'Тибет, Гималайский регион (VIII в. — наст. время)',
    bio: 'В тибетском буддизме считается: тот, кто во сне пребывает в «ясности» (осознанное сновидение), способен в бардо (промежуточном состоянии) постичь природу ума. Миларепа и другие мастера интенсивно практиковали йогу сновидений. «Бардо Тхёдол» (Тибетская книга мёртвых) содержит наставления по использованию снов для освобождения.',
  },
  [ReligiousSource.ZEN]: {
    title: 'Дзен-буддизм',
    desc: 'В дзен граница между сном и реальностью растворяется. Просветлённый ум не проводит различий.',
    origin: 'Китай / Япония (VII в. — наст. время)',
    bio: 'Догэн Дзэндзи (1200–1253): «Познать, что такое просветление, — значит познать самого себя». Чжуанцзы приснилось, что он бабочка, — и, пробудившись, он задался вопросом: я ли человек, которому снится, что он бабочка, или бабочка, которой снится, что она человек? В дзен сон обнажает относительную природу всех явлений.',
  },
  [ReligiousSource.THERAVADA]: {
    title: 'Тхеравада-буддизм',
    desc: 'Древнейшая сохранившаяся буддийская школа рассматривает сны как ментальные конструкты, отражающие карму и состояние ума.',
    origin: 'Шри-Ланка, Юго-Восточная Азия (III в. до н.э. — наст. время)',
    bio: 'Палийский канон выделяет пять видов снов: обусловленные состоянием тела, воспоминаниями, духовными существами, собственными желаниями и пророческие. Перед просветлением Будде явились пять великих снов. Сны — это манодхамма (объекты ума), вызывающие ментальные реакции (читта).',
  },
  [ReligiousSource.WESTERN_ZODIAC]: {
    title: 'Западная астрология',
    desc: 'Греко-эллинистическая астрология связывает движение планет с психическими состояниями и темами сновидений.',
    origin: 'Месопотамия / Греция / Рим (3000 до н.э. — наст. время)',
    bio: 'Планеты как архитекторы снов: Марс активирует сны агрессии и энергии; Венера — сны о любви и отношениях; Нептун — мистические и запутанные сны; Луна — эмоциональные сны и сны о прошлом. Транзиты через асцендент или Луну усиливают активность сновидений. Птолемей (100–170 н.э.) связывал астрологию и онейрокритику.',
  },
  [ReligiousSource.VEDIC_ASTROLOGY]: {
    title: 'Ведическая астрология (Джйотиш)',
    desc: '«Свет Вед» — древнеиндийская звёздная мудрость, толкующая сны в связи с кармой и дхармой.',
    origin: 'Индия, ведический период (1500 до н.э. — наст. время)',
    bio: 'В Джйотише для анализа снов используются накшатры (27 лунных стоянок). Сны в период Брахма-мухурты (за 90 минут до восхода солнца) считаются особенно пророческими. 12-й дом (Вьяя-бхава) управляет снами, уединением и мокшей. Грахи (планеты) являются в значимых снах в образах богов.',
  },
  [ReligiousSource.CHINESE_ZODIAC]: {
    title: 'Китайская астрология',
    desc: 'Китайская традиция связывает сны с потоками ци, балансом инь-ян и пятью фазами превращений.',
    origin: 'Китай, от династии Шан до наст. времени (1600 до н.э.)',
    bio: 'В китайской системе сны обладают пятью качествами, соответствующими пяти элементам: Дерево (рост, творчество), Огонь (страсть, ясность), Земля (стабильность), Металл (печаль, чистота), Вода (мудрость, страх). «Книга перемен» (И-цзин) используется для анализа снов. Чжуанцзы считается величайшим философом сновидений Китая.',
  },
  [ReligiousSource.PYTHAGOREAN]: {
    title: 'Пифагорейская нумерология',
    desc: 'Западная числовая система по Пифагору: числа 1–9 как основные вибрации всех явлений.',
    origin: 'Самос, Греция (570–495 до н.э.)',
    bio: 'Пифагор учил: «Всё есть число». Каждое число обладает уникальной вибрацией: 1=единство/руководство, 2=двойственность/партнёрство, 3=творчество/выражение, 4=стабильность/труд, 5=свобода/перемены, 6=гармония/семья, 7=мудрость/духовность, 8=власть/материализм, 9=завершённость/универсальность. Числа в снах указывают на актуальные жизненные темы.',
  },
  [ReligiousSource.CHALDEAN]: {
    title: 'Халдейская нумерология',
    desc: 'Древнейшая числовая система из Вавилонии, основанная на звуковых вибрациях — считается наиболее точным подходом к числам в снах.',
    origin: 'Вавилон, Месопотамия (2000 до н.э.)',
    bio: 'Халдеи — звёздные жрецы Вавилона — разработали числовую систему, основанную на вибрационной энергии имён и дат рождения. Число 9 священно и не присваивается напрямую. Числа в снах в халдейской системе раскрывают глубинные кармические паттерны и миссию души.',
  },
  [ReligiousSource.KABBALAH_NUMEROLOGY]: {
    title: 'Каббалистическая нумерология (Гематрия)',
    desc: 'Еврейско-мистическая числовая система, связывающая буквы иврита с числами и раскрывающая глубокие духовные смыслы.',
    origin: 'Испания / Вавилон, еврейская мистика (I–XIII вв.)',
    bio: 'В Каббале каждая буква иврита имеет числовое значение (Алеф=1 — Тав=400). Десять сефирот Древа Жизни олицетворяют космические силы, являющиеся в снах в виде архетипов. Числа в снах могут указывать на сефирот: 1=Кетер (Корона), 2=Хохма (Мудрость), 3=Бина (Понимание) и т.д.',
  },
  [ReligiousSource.ISLAMIC_NUMEROLOGY]: {
    title: 'Исламская нумерология (\'Ильм аль-Хуруф)',
    desc: 'Наука о буквах — мистическое числовое значение в исламе, связанное с 99 именами Аллаха и системой абджад.',
    origin: 'Арабский мир, исламский период (VII–XV вв.)',
    bio: '\'Ильм аль-Хуруф (наука о буквах) присваивает арабским буквам числовые значения (абджад). Коранические буквы, такие как Алиф-Лям-Мим в начале сур, несут скрытые числовые послания. В суфизме Ибн Араби использовал числовой анализ для духовного толкования снов.',
  },
  [ReligiousSource.VEDIC_NUMEROLOGY]: {
    title: 'Ведическая нумерология',
    desc: 'Индуистская числовая система из Вед, связанная с космическими силами и девятью планетами (Навагракха).',
    origin: 'Индия, ведический период (1500 до н.э. — наст. время)',
    bio: 'В ведической нумерологии числа 1–9 соответствуют девяти планетам: 1=Солнце, 2=Луна, 3=Юпитер, 4=Раху, 5=Меркурий, 6=Венера, 7=Кету, 8=Сатурн, 9=Марс. Числа в снах указывают на активную планетарную энергию. Число жизни (Муланк) и число судьбы (Бхагьянк) являются ключами к пониманию.',
  },
};

const SOURCE_INFO_EN: Record<string, SourceInfo> = {
  [ReligiousSource.IBN_SIRIN]: {
    title: 'Ibn Sirin',
    desc: 'The most significant Islamic dream interpreter in history. His work remains the standard reference for Islamic dream interpretation (Ta\'bir) to this day.',
    origin: 'Basra, Iraq (654–728 CE)',
    bio: 'Muhammad ibn Sirin was a Tabi\'i (successor of the Prophet\'s Companions), scholar, and dream interpreter. He is said to have stated: "The knowledge of dreams comes from the prophets." His work "Mukhtar al-Kalam fi Tabir al-Ahlam" systematizes thousands of dream symbols according to Islamic principles.',
  },
  [ReligiousSource.NABULSI]: {
    title: 'Abd al-Ghani al-Nabulsi',
    desc: 'Ottoman Sufi scholar, poet, and one of the most prolific dream interpreters of the Islamic world, with over 500 works to his name.',
    origin: 'Damascus, Syria (1641–1731 CE)',
    bio: 'Al-Nabulsi was a universally educated scholar who combined mysticism (Sufism), jurisprudence, and dream interpretation. His work "Ta\'tir al-Anam fi Tabir al-Manam" is one of the most extensive dream interpretation works in Islamic literature, containing over 40,000 dream symbols.',
  },
  [ReligiousSource.AL_ISKHAFI]: {
    title: 'Al-Iskhafi',
    desc: 'Medieval Islamic dream interpreter, known for his systematic categorization of dream symbols.',
    origin: 'Persian-Arab world, 10th–11th century',
    bio: 'Al-Iskhafi developed a method for classifying dream symbols by origin, context, and religious significance. His approach had a lasting influence on Islamic dream interpretation literature.',
  },
  [ReligiousSource.FREUDIAN]: {
    title: 'Sigmund Freud',
    desc: 'Founder of psychoanalysis and author of the epochal "The Interpretation of Dreams" (1900) — the first scientific work on dream psychology.',
    origin: 'Freiberg (Moravia), Habsburg Empire (1856–1939)',
    bio: 'Freud revolutionized the understanding of dreams: they are the "royal road to the unconscious." Dreams reveal repressed wishes, fears, and drives in coded form. Freud distinguished between the manifest (experienced) and latent (hidden) dream content. Sexuality and aggression played a central role in his theory.',
  },
  [ReligiousSource.JUNGIAN]: {
    title: 'C.G. Jung',
    desc: 'Founder of Analytical Psychology. Expanded Freud\'s approach with the collective unconscious and archetypes as universal carriers of meaning.',
    origin: 'Kesswil, Switzerland (1875–1961)',
    bio: 'Carl Gustav Jung saw dreams as self-regulation of the psyche. He discovered universal symbols (archetypes) such as the Shadow, Anima, Self, and Hero. Dreams reveal the individuation process — the journey toward psychic wholeness. Jung emphasized: "The dream is the small hidden door in the deepest and most intimate sanctum of the soul."',
  },
  [ReligiousSource.GESTALT]: {
    title: 'Gestalt Therapy',
    desc: 'Therapeutic approach by Fritz Perls: every element of a dream is a part of the dreamer that wants to be integrated.',
    origin: 'Frankfurt, Germany / New York / Esalen (1940s–1960s)',
    bio: 'Fritz Perls developed Gestalt dreamwork: one steps into each dream figure and dream object and speaks from their perspective. This brings split-off aspects of personality into awareness and integrates them. Dreams are "messages from yourself to yourself."',
  },
  [ReligiousSource.MEDIEVAL]: {
    title: 'Medieval Christian Dream Interpretation',
    desc: 'Systematic classification of dreams into five types by medieval scholars such as Macrobius and Hildegard von Bingen.',
    origin: 'Europe, 5th–15th century',
    bio: 'Macrobius (ca. 400 CE) classified: Somnium (symbolic dream), Visio (prophetic image), Oraculum (divine message), Insomnium (meaningless dream), Visum (hallucination). Hildegard von Bingen (1098–1179) saw her mystical dreams as the "Living Light" and divine revelations.',
  },
  [ReligiousSource.CHURCH_FATHERS]: {
    title: 'Church Fathers',
    desc: 'Early Christian theologians who debated the origin of dreams: divine, demonic, or natural.',
    origin: 'North Africa, Egypt, Syria (2nd–5th century)',
    bio: 'Augustine (354–430) distinguished between dreams of natural origin and divine visions. Origen saw dreams as a channel of communication between humans and the spirit world. Tertullian warned against demonic dreams but acknowledged genuine prophetic dreams. Their works shaped Christian understanding of dreams for centuries.',
  },
  [ReligiousSource.MODERN_THEOLOGY]: {
    title: 'Modern Christian Theology',
    desc: 'Contemporary theologians who bridge psychology and faith, understanding dreams as part of spiritual development.',
    origin: 'USA/Europe, 20th–21st century',
    bio: 'Morton Kelsey and John Sanford, influenced by Jung, saw dreams as God\'s language in the modern world. Hermann Riffel (1916–2009) developed a Christian dream interpretation practice. Today, spiritual directors and Christian therapists integrate dreamwork into pastoral care and prayer.',
  },
  [ReligiousSource.TIBETAN]: {
    title: 'Tibetan Buddhism (Dream Yoga)',
    desc: 'Dream Yoga is one of the Six Yogas of Naropa — a meditation practice that seeks enlightenment within the dream state.',
    origin: 'Tibet, Himalayan region (8th century to present)',
    bio: 'In Tibetan Buddhism, one who is "clear" in a dream (lucid dreaming) can recognize the nature of the mind in the Bardo (intermediate state). Milarepa and other masters practiced Dream Yoga intensively. The Bardo Thodol (Tibetan Book of the Dead) contains instructions on how dreams can be used for liberation.',
  },
  [ReligiousSource.ZEN]: {
    title: 'Zen Buddhism',
    desc: 'In Zen, the boundary between dream and reality dissolves. The enlightened mind makes no distinction.',
    origin: 'China / Japan (7th century to present)',
    bio: 'Dogen Zenji (1200–1253): "To study the self is to forget the self." Zhuangzi dreamed he was a butterfly — and upon waking asked himself: Am I a man dreaming of being a butterfly, or a butterfly dreaming of being a man? In Zen, the dream reveals the relative nature of all appearances.',
  },
  [ReligiousSource.THERAVADA]: {
    title: 'Theravada Buddhism',
    desc: 'The oldest surviving Buddhist school views dreams as mental constructs that reflect karma and states of mind.',
    origin: 'Sri Lanka, Southeast Asia (3rd century BCE to present)',
    bio: 'The Pali Canon mentions five types of dreams: from bodily conditions, memories, spirit beings, one\'s own wishes, and prophetic dreams. The Buddha is said to have had five great dreams before his enlightenment. Dreams are Mano-Dhamma — mind objects that trigger mental responses (Citta).',
  },
  [ReligiousSource.WESTERN_ZODIAC]: {
    title: 'Western Astrology',
    desc: 'The Greco-Hellenistic tradition connects planetary movements with psychological states and dream themes.',
    origin: 'Mesopotamia / Greece / Rome (3000 BCE to present)',
    bio: 'Planets as dream architects: Mars activates aggression and energy dreams; Venus love and relationship dreams; Neptune mystical and confusing dreams; the Moon emotional and past-memory dreams. Transits over the Ascendant or Moon intensify dream activity. Ptolemy (100–170 CE) connected astrology and oneirocriticism.',
  },
  [ReligiousSource.VEDIC_ASTROLOGY]: {
    title: 'Vedic Astrology (Jyotish)',
    desc: 'The "Light of the Vedas" — ancient Indian stellar wisdom that interprets dreams in relation to karma and dharma.',
    origin: 'India, Vedic period (1500 BCE to present)',
    bio: 'In Jyotish, Nakshatras (27 lunar mansions) are used for dream analysis. Dreams during Brahma-Muhurta (90 minutes before sunrise) are considered especially prophetic. The 12th house (Vyaya Bhava) governs dreams, isolation, and Moksha. Grahas (planets) appear as divine figures in significant dreams.',
  },
  [ReligiousSource.CHINESE_ZODIAC]: {
    title: 'Chinese Astrology',
    desc: 'The Chinese tradition connects dreams with Qi flows, Yin-Yang balance, and the five phases of transformation.',
    origin: 'China, Shang Dynasty to present (1600 BCE)',
    bio: 'In the Chinese system, dreams carry five qualities corresponding to the five elements: Wood (growth, creativity), Fire (passion, clarity), Earth (stability), Metal (grief, purity), Water (wisdom, fear). The Book of Changes (I-Ching) is used for dream analysis. Zhuangzi is regarded as China\'s most significant dream philosopher.',
  },
  [ReligiousSource.PYTHAGOREAN]: {
    title: 'Pythagorean Numerology',
    desc: 'Western number system based on Pythagoras: numbers 1–9 as the fundamental vibrations of all phenomena.',
    origin: 'Samos, Greece (570–495 BCE)',
    bio: 'Pythagoras taught: "All is number." Each number carries a unique vibration: 1=Unity/Leadership, 2=Duality/Partnership, 3=Creativity/Expression, 4=Stability/Work, 5=Freedom/Change, 6=Harmony/Family, 7=Wisdom/Spirituality, 8=Power/Materialism, 9=Completion/Universality. Dream numbers reveal active life themes.',
  },
  [ReligiousSource.CHALDEAN]: {
    title: 'Chaldean Numerology',
    desc: 'The oldest number system from Babylonia, based on sound vibrations — considered the most precise approach to dream numbers.',
    origin: 'Babylon, Mesopotamia (2000 BCE)',
    bio: 'The Chaldeans — the star-priests of Babylon — developed a number system based on the vibrational energy of names and birth dates. The number 9 is sacred and is not directly assigned. Dream numbers in the Chaldean system reveal deep karmic patterns and soul missions.',
  },
  [ReligiousSource.KABBALAH_NUMEROLOGY]: {
    title: 'Kabbalistic Numerology (Gematria)',
    desc: 'Jewish mystical number system that connects Hebrew letters with numbers, decoding deep spiritual meanings.',
    origin: 'Spain / Babylon, Jewish mysticism (1st–13th century)',
    bio: 'In Kabbalah, each Hebrew letter has a numerical value (Aleph=1 to Tav=400). The ten Sefirot of the Tree of Life represent cosmic forces that appear as archetypes in dreams. Dream numbers may point to Sefirot: 1=Keter (Crown), 2=Chokmah (Wisdom), 3=Binah (Understanding), etc.',
  },
  [ReligiousSource.ISLAMIC_NUMEROLOGY]: {
    title: 'Islamic Numerology (\'Ilm al-Huruf)',
    desc: 'The knowledge of letters — mystical numerical meaning in Islam, connected to the 99 Names of Allah and the Abjad system.',
    origin: 'Arab world, Islamic period (7th–15th century)',
    bio: '\'Ilm al-Huruf (the science of letters) assigns numerical values to Arabic letters (Abjad). Quranic letters such as Alif-Lam-Mim at the beginning of Surahs carry hidden numerical messages. In Sufism, Ibn Arabi used numerical analyses for spiritual dream interpretation.',
  },
  [ReligiousSource.VEDIC_NUMEROLOGY]: {
    title: 'Vedic Numerology',
    desc: 'Hindu number system from the Vedas, connected to cosmic forces and the nine planets (Navagraha).',
    origin: 'India, Vedic period (1500 BCE to present)',
    bio: 'In Vedic numerology, the numbers 1–9 correspond to the nine planets: 1=Sun, 2=Moon, 3=Jupiter, 4=Rahu, 5=Mercury, 6=Venus, 7=Ketu, 8=Saturn, 9=Mars. Dreams containing specific numbers indicate which planetary energy is active. The life number (Mulank) and destiny number (Bhagyank) are key tools.',
  },
};

const SOURCE_INFO_TR: Record<string, SourceInfo> = {
  [ReligiousSource.IBN_SIRIN]: {
    title: 'İbn-i Sirin',
    desc: 'Tarihin en önemli İslam rüya yorumcusu. Eseri, İslami rüya yorumu (tabir) için bugün hâlâ temel referans kaynağı olarak kullanılmaktadır.',
    origin: 'Basra, Irak (MS 654–728)',
    bio: 'Muhammed ibn Sirin, bir tabiin (Peygamber\'in sahabelerinin takipçisi), âlim ve rüya yorumcusuydu. "Rüyaların bilgisi peygamberlerden gelir" dediği rivayet edilir. "Muhtaru\'l-Kelam fi Tabiri\'l-Ehlam" adlı eseri, binlerce rüya sembolünü İslami ilkelere göre sistematik biçimde ele almaktadır.',
  },
  [ReligiousSource.NABULSI]: {
    title: 'Abdülganî en-Nâblusî',
    desc: 'Osmanlı Sufi âlimi, şair ve 500\'den fazla eseriyle İslam dünyasının en üretken rüya yorumcularından biri.',
    origin: 'Şam, Suriye (MS 1641–1731)',
    bio: 'Nâblusî; mistisizmi (Tasavvuf), fıkhı ve rüya yorumunu bir araya getiren evrensel bir âlimdi. "Ta\'tîru\'l-Enâm fî Tabîri\'l-Menâm" adlı eseri, 40.000\'den fazla rüya sembolü içeren İslam literatürünün en kapsamlı rüya yorumu kitaplarından biridir.',
  },
  [ReligiousSource.AL_ISKHAFI]: {
    title: 'el-İshakî',
    desc: 'Rüya sembollerini sistematik biçimde sınıflandırmasıyla tanınan ortaçağ İslam rüya yorumcusu.',
    origin: 'Fars-Arap dünyası, 10.–11. yüzyıl',
    bio: 'el-İshakî, rüya sembollerini köken, bağlam ve dini anlam açısından sınıflandırmak için bir yöntem geliştirdi. Bu yaklaşımı İslami rüya yorumu literatürünü kalıcı biçimde etkiledi.',
  },
  [ReligiousSource.FREUDIAN]: {
    title: 'Sigmund Freud',
    desc: 'Psikanalizin kurucusu ve rüya psikolojisi üzerine ilk bilimsel eser olan "Rüyaların Yorumu"nun (1900) yazarı.',
    origin: 'Freiberg (Moravya), Habsburg İmparatorluğu (1856–1939)',
    bio: 'Freud, rüyaların anlaşılmasında devrim yarattı: Rüyalar "bilinçdışına giden kraliyet yolu"dur. Rüyalarda bastırılmış istekler, korkular ve dürtüler şifreli biçimde ortaya çıkar. Freud, rüyanın açık (yaşanan) ve gizil (saklı) içeriğini birbirinden ayırt etti. Cinsellik ve saldırganlık onun kuramında merkezi bir rol oynadı.',
  },
  [ReligiousSource.JUNGIAN]: {
    title: 'C.G. Jung',
    desc: 'Analitik Psikoloji\'nin kurucusu. Freud\'un yaklaşımını kolektif bilinçdışı ve evrensel anlam taşıyıcıları olan arketiplerle genişletti.',
    origin: 'Kesswil, İsviçre (1875–1961)',
    bio: 'Carl Gustav Jung, rüyaları psikenin öz-düzenlemesi olarak gördü. Gölge, Anima, Benlik ve Kahraman gibi evrensel semboller (arketipler) keşfetti. Rüyalar, bireyleşme sürecini — ruhsal bütünlüğe doğru yolculuğu — ortaya koyar. Jung şöyle dedi: "Rüya, ruhun en içten ve en gizli köşesine açılan küçük gizli kapıdır."',
  },
  [ReligiousSource.GESTALT]: {
    title: 'Gestalt Terapisi',
    desc: 'Fritz Perls\'in terapötik yaklaşımı: Rüyadaki her öğe, bütünleşmek isteyen rüya görenin bir parçasıdır.',
    origin: 'Frankfurt, Almanya / New York / Esalen (1940\'lar–1960\'lar)',
    bio: 'Fritz Perls, Gestalt rüya çalışmasını geliştirdi: Kişi her rüya figürünün ve nesnesinin yerine geçip onların bakış açısından konuşur. Bu sayede ayrışmış kişilik parçaları bilince taşınır ve bütünleştirilir. Rüyalar "kendinizden kendinize gelen mesajlardır."',
  },
  [ReligiousSource.MEDIEVAL]: {
    title: 'Ortaçağ Hristiyan Rüya Yorumu',
    desc: 'Macrobius ve Hildegard von Bingen gibi ortaçağ âlimlerinin rüyaları beş türe sistematik olarak sınıflandırması.',
    origin: 'Avrupa, 5.–15. yüzyıl',
    bio: 'Macrobius (MS yaklaşık 400) şu sınıflamayı yaptı: Somnium (sembolik rüya), Visio (kehanet imgesi), Oraculum (ilahi mesaj), Insomnium (anlamsız rüya), Visum (halüsinasyon). Hildegard von Bingen (1098–1179) mistik rüyalarını "Diri Işık" ve ilahi vahiyler olarak gördü.',
  },
  [ReligiousSource.CHURCH_FATHERS]: {
    title: 'Kilise Babaları',
    desc: 'Rüyaların kökenini tartışan erken Hristiyan teologlar: ilahi, şeytani ya da doğal.',
    origin: 'Kuzey Afrika, Mısır, Suriye (2.–5. yüzyıl)',
    bio: 'Augustinus (354–430), doğal kökenli rüyalar ile ilahi vizyonları birbirinden ayırt etti. Origenes, rüyaları insan ile ruh dünyası arasındaki bir iletişim kanalı olarak gördü. Tertullianus şeytani rüyalar konusunda uyarıda bulunurken gerçek kehanet rüyalarını da kabul etti. Bu âlimlerin eserleri, yüzyıllarca Hristiyan rüya anlayışını biçimlendirdi.',
  },
  [ReligiousSource.MODERN_THEOLOGY]: {
    title: 'Modern Hristiyan Teolojisi',
    desc: 'Psikoloji ile imanı bir araya getiren ve rüyaları manevi gelişimin bir parçası olarak ele alan çağdaş teologlar.',
    origin: 'ABD/Avrupa, 20.–21. yüzyıl',
    bio: 'Jung\'dan etkilenen Morton Kelsey ve John Sanford, rüyaları modern dünyada Tanrı\'nın dili olarak gördü. Hermann Riffel (1916–2009), Hristiyan rüya yorumu pratiğini geliştirdi. Bugün manevi rehberler ve Hristiyan terapistler, rüya çalışmasını pastoral bakım ve duayla bütünleştirmektedir.',
  },
  [ReligiousSource.TIBETAN]: {
    title: 'Tibet Budizmi (Rüya Yogası)',
    desc: 'Rüya Yogası, Naropa\'nın Altı Yogası\'ndan biridir — rüya halinde aydınlanmayı hedefleyen bir meditasyon pratiği.',
    origin: 'Tibet, Himalaya bölgesi (8. yüzyıldan günümüze)',
    bio: 'Tibet Budizmi\'nde, rüyada "açık" olan (lüsid rüya gören) kişi, Bardo\'da (ara hal) zihnin gerçek doğasını kavrayabilir. Milarepa ve diğer ustalar Rüya Yogası\'nı yoğun biçimde pratik ettiler. Bardo Thodol (Tibet Ölüler Kitabı), rüyaların kurtuluş için nasıl kullanılacağına dair talimatlar içerir.',
  },
  [ReligiousSource.ZEN]: {
    title: 'Zen Budizmi',
    desc: 'Zen\'de rüya ile gerçeklik arasındaki sınır ortadan kalkar. Aydınlanmış zihin ayrım yapmaz.',
    origin: 'Çin / Japonya (7. yüzyıldan günümüze)',
    bio: 'Dogen Zenji (1200–1253): "Kendini öğrenmek, kendini unutmaktır." Zhuangzi, kelebek olduğunu rüyasında gördü ve uyanınca şunu sordu: Ben kelebek olduğunu rüyasında gören bir insan mıyım, yoksa insan olduğunu rüyasında gören bir kelebek miyim? Zen\'de rüya, tüm görüngülerin göreliğini ortaya koyar.',
  },
  [ReligiousSource.THERAVADA]: {
    title: 'Theravada Budizmi',
    desc: 'Hayatta kalan en eski Budist okul, rüyaları karma ve zihin halini yansıtan zihinsel yapılar olarak görür.',
    origin: 'Sri Lanka, Güneydoğu Asya (MÖ 3. yüzyıldan günümüze)',
    bio: 'Pali Kanonu beş rüya türünden söz eder: bedensel durumlar, anılar, ruh varlıkları, kişinin kendi istekleri ve kehanet rüyaları. Buda\'nın aydınlanmadan önce beş büyük rüya gördüğü rivayet edilir. Rüyalar, Mano-Dhamma\'dır — zihinsel tepkiler (Citta) uyandıran zihin nesneleri.',
  },
  [ReligiousSource.WESTERN_ZODIAC]: {
    title: 'Batı Astrolojisi',
    desc: 'Yunan-Helenistik astroloji geleneği, gezegen hareketlerini psikolojik durumlar ve rüya temaları ile ilişkilendirir.',
    origin: 'Mezopotamya / Yunanistan / Roma (MÖ 3000\'den günümüze)',
    bio: 'Gezegenler rüya mimarı olarak: Mars, saldırganlık ve enerji rüyalarını aktive eder; Venüs, aşk ve ilişki rüyalarını; Neptün, mistik ve karmaşık rüyaları; Ay, duygusal ve geçmiş anı rüyalarını. Yükselen ya da Ay üzerindeki transitler rüya aktivitesini yoğunlaştırır. Ptolemaios (MS 100–170) astrolojiyi oneirokritik ile birleştirdi.',
  },
  [ReligiousSource.VEDIC_ASTROLOGY]: {
    title: 'Vedik Astroloji (Jyotish)',
    desc: '"Vedaların Işığı" — rüyaları karma ve dharma bağlamında yorumlayan antik Hint yıldız bilgeliği.',
    origin: 'Hindistan, Vedik dönem (MÖ 1500\'den günümüze)',
    bio: 'Jyotish\'te Nakşatralar (27 ay konağı) rüya analizi için kullanılır. Brahma-Muhurta\'da (güneş doğumundan 90 dakika önce) görülen rüyalar özellikle kehanet niteliği taşır. 12. ev (Vyaya Bhava) rüyaları, yalnızlığı ve Moksha\'yı yönetir. Graha\'lar (gezegenler), önemli rüyalarda tanrısal figürler olarak belirir.',
  },
  [ReligiousSource.CHINESE_ZODIAC]: {
    title: 'Çin Astrolojisi',
    desc: 'Çin geleneği, rüyaları Qi akışları, Yin-Yang dengesi ve beş dönüşüm evresiyle ilişkilendirir.',
    origin: 'Çin, Shang Hanedanlığı\'ndan günümüze (MÖ 1600)',
    bio: 'Çin sisteminde rüyaların beş unsura karşılık gelen beş niteliği vardır: Tahta (büyüme, yaratıcılık), Ateş (tutku, netlik), Toprak (istikrar), Metal (keder, saflık), Su (bilgelik, korku). Değişimler Kitabı (I-Ching) rüya analizi için kullanılır. Zhuangzi, Çin\'in en önemli rüya filozofu olarak kabul edilir.',
  },
  [ReligiousSource.PYTHAGOREAN]: {
    title: 'Pisagorcu Numeroloji',
    desc: 'Pisagor\'a dayanan Batı sayı sistemi: 1\'den 9\'a kadar olan sayılar, tüm olguların temel titreşimleri olarak.',
    origin: 'Sisam, Yunanistan (MÖ 570–495)',
    bio: 'Pisagor şöyle öğretti: "Her şey sayıdır." Her sayının kendine özgü bir titreşimi vardır: 1=Birlik/Liderlik, 2=İkililik/Ortaklık, 3=Yaratıcılık/İfade, 4=İstikrar/Çalışma, 5=Özgürlük/Değişim, 6=Uyum/Aile, 7=Bilgelik/Maneviyat, 8=Güç/Materyalizm, 9=Tamamlanma/Evrensellik. Rüyada görülen sayılar aktif yaşam temalarını gösterir.',
  },
  [ReligiousSource.CHALDEAN]: {
    title: 'Keldani Numeroloji',
    desc: 'Ses titreşimlerine dayanan Babil kökenli en eski sayı sistemi — rüya sayıları için en hassas yaklaşım olarak kabul edilir.',
    origin: 'Babil, Mezopotamya (MÖ 2000)',
    bio: 'Keldaniler — Babil\'in yıldız rahipleri — isim ve doğum tarihlerinin titreşim enerjisine dayalı bir sayı sistemi geliştirdi. 9 sayısı kutsal kabul edilir ve doğrudan atanmaz. Keldani sistemde rüya sayıları, derin karmik kalıpları ve ruh misyonlarını ortaya koyar.',
  },
  [ReligiousSource.KABBALAH_NUMEROLOGY]: {
    title: 'Kabala Numerolojisi (Gematria)',
    desc: 'İbrani harflerini sayılarla ilişkilendirerek derin manevi anlamları çözümleyen Yahudi mistik sayı sistemi.',
    origin: 'İspanya / Babil, Yahudi mistisizmi (1.–13. yüzyıl)',
    bio: 'Kabala\'da her İbrani harfinin sayısal bir değeri vardır (Alef=1\'den Tav=400\'e). Hayat Ağacı\'nın on Sefirot\'u, rüyalarda arketipler olarak beliren kozmik güçleri temsil eder. Rüya sayıları Sefirot\'a işaret edebilir: 1=Keter (Taç), 2=Hochma (Bilgelik), 3=Bina (Anlayış) vb.',
  },
  [ReligiousSource.ISLAMIC_NUMEROLOGY]: {
    title: 'İslam Numerolojisi (İlm el-Huruf)',
    desc: 'Harf ilmi — İslam\'da mistik sayı anlamı; Allah\'ın 99 ismi ve Ebced sistemiyle bağlantılı.',
    origin: 'Arap dünyası, İslam dönemi (7.–15. yüzyıl)',
    bio: 'İlm el-Huruf (harfler bilimi), Arapça harflere sayısal değerler atar (Ebced). Surelerin başındaki Elif-Lam-Mim gibi Kurani harfler, gizli sayısal mesajlar taşır. Tasavvufta İbn Arabi, manevi rüya yorumu için sayısal analizlerden yararlandı.',
  },
  [ReligiousSource.VEDIC_NUMEROLOGY]: {
    title: 'Vedik Numeroloji',
    desc: 'Vedalar\'dan gelen Hindu sayı sistemi; kozmik güçler ve dokuz gezegen (Navagraha) ile bağlantılı.',
    origin: 'Hindistan, Vedik dönem (MÖ 1500\'den günümüze)',
    bio: 'Vedik numerolojide 1\'den 9\'a kadar olan sayılar dokuz gezegene karşılık gelir: 1=Güneş, 2=Ay, 3=Jüpiter, 4=Rahu, 5=Merkür, 6=Venüs, 7=Ketu, 8=Satürn, 9=Mars. Belirli sayılar içeren rüyalar, hangi gezegen enerjisinin aktif olduğunu gösterir. Yaşam sayısı (Mulank) ve kader sayısı (Bhagyank) temel anahtarlardır.',
  },
};

const SOURCE_INFO_ES: Record<string, SourceInfo> = {
  [ReligiousSource.IBN_SIRIN]: {
    title: 'Ibn Sirin',
    desc: 'El intérprete de sueños islámico más importante de la historia. Su obra sigue siendo la referencia estándar para la interpretación islámica de sueños (Ta\'bir) hasta hoy.',
    origin: 'Basra, Irak (654–728 d.C.)',
    bio: 'Muhammad ibn Sirin fue un tabi\'i (sucesor de los compañeros del Profeta), erudito e intérprete de sueños. Se dice que afirmó: "El conocimiento de los sueños proviene de los profetas." Su obra "Mukhtar al-Kalam fi Tabir al-Ahlam" sistematiza miles de símbolos oníricos según principios islámicos.',
  },
  [ReligiousSource.NABULSI]: {
    title: 'Abd al-Ghani al-Nabulsi',
    desc: 'Erudito sufí otomano, poeta y uno de los intérpretes de sueños más prolíficos del mundo islámico, con más de 500 obras.',
    origin: 'Damasco, Siria (1641–1731 d.C.)',
    bio: 'Al-Nabulsi fue un erudito de formación universal que combinó el misticismo (sufismo), la jurisprudencia y la interpretación de sueños. Su obra "Ta\'tir al-Anam fi Tabir al-Manam" es uno de los trabajos más extensos de interpretación onírica en la literatura islámica, con más de 40.000 símbolos de sueños.',
  },
  [ReligiousSource.AL_ISKHAFI]: {
    title: 'Al-Iskhafi',
    desc: 'Intérprete islámico medieval de sueños, conocido por su categorización sistemática de símbolos oníricos.',
    origin: 'Mundo persa-árabe, siglos X–XI',
    bio: 'Al-Iskhafi desarrolló un método para clasificar los símbolos oníricos según origen, contexto y significado religioso. Su enfoque influyó de manera duradera en la literatura islámica de interpretación de sueños.',
  },
  [ReligiousSource.FREUDIAN]: {
    title: 'Sigmund Freud',
    desc: 'Fundador del psicoanálisis y autor de la obra épocal "La interpretación de los sueños" (1900), el primer trabajo científico sobre psicología onírica.',
    origin: 'Freiberg (Moravia), Imperio Habsburgo (1856–1939)',
    bio: 'Freud revolucionó la comprensión de los sueños: son el "camino real al inconsciente". En el sueño se manifiestan deseos reprimidos, miedos y pulsiones en forma codificada. Freud distinguió entre el contenido manifiesto (vivido) y el latente (oculto) del sueño. La sexualidad y la agresión desempeñaron un papel central en su teoría.',
  },
  [ReligiousSource.JUNGIAN]: {
    title: 'C.G. Jung',
    desc: 'Fundador de la Psicología Analítica. Amplió el enfoque de Freud con el inconsciente colectivo y los arquetipos como portadores universales de significado.',
    origin: 'Kesswil, Suiza (1875–1961)',
    bio: 'Carl Gustav Jung veía los sueños como autorregulación de la psique. Descubrió símbolos universales (arquetipos) como la Sombra, el Ánima, el Sí-mismo y el Héroe. Los sueños revelan el proceso de individuación — el viaje hacia la totalidad psíquica. Jung enfatizó: "El sueño es la pequeña puerta oculta al santuario más íntimo y secreto del alma."',
  },
  [ReligiousSource.GESTALT]: {
    title: 'Terapia Gestalt',
    desc: 'Enfoque terapéutico de Fritz Perls: cada elemento de un sueño es una parte del soñador que desea ser integrada.',
    origin: 'Fráncfort, Alemania / Nueva York / Esalen (décadas de 1940–1960)',
    bio: 'Fritz Perls desarrolló el trabajo con sueños en Gestalt: uno se mete en cada figura y objeto del sueño y habla desde su perspectiva. Así se hacen conscientes e integran las partes de la personalidad escindidas. Los sueños son "mensajes de uno mismo a uno mismo."',
  },
  [ReligiousSource.MEDIEVAL]: {
    title: 'Interpretación cristiana medieval de sueños',
    desc: 'Clasificación sistemática de los sueños en cinco tipos por eruditos medievales como Macrobio e Hildegarda de Bingen.',
    origin: 'Europa, siglos V–XV',
    bio: 'Macrobio (aprox. 400 d.C.) clasificó: Somnium (sueño simbólico), Visio (imagen profética), Oraculum (mensaje divino), Insomnium (sueño sin significado), Visum (alucinación). Hildegarda de Bingen (1098–1179) veía sus sueños místicos como "Luz Viviente" y revelaciones divinas.',
  },
  [ReligiousSource.CHURCH_FATHERS]: {
    title: 'Padres de la Iglesia',
    desc: 'Teólogos paleocristianos que debatieron el origen de los sueños: divino, demoníaco o natural.',
    origin: 'Norte de África, Egipto, Siria (siglos II–V)',
    bio: 'Agustín (354–430) distinguió entre sueños de origen natural y visiones divinas. Orígenes veía los sueños como vía de comunicación entre el ser humano y el mundo espiritual. Tertuliano advirtió sobre los sueños demoníacos, pero reconoció los sueños proféticos genuinos. Sus obras moldearon la comprensión cristiana de los sueños durante siglos.',
  },
  [ReligiousSource.MODERN_THEOLOGY]: {
    title: 'Teología cristiana moderna',
    desc: 'Teólogos contemporáneos que vinculan psicología y fe, y entienden los sueños como parte del desarrollo espiritual.',
    origin: 'EE.UU./Europa, siglos XX–XXI',
    bio: 'Morton Kelsey y John Sanford, influenciados por Jung, vieron los sueños como el lenguaje de Dios en el mundo moderno. Hermann Riffel (1916–2009) desarrolló una práctica cristiana de interpretación de sueños. Hoy, los directores espirituales y terapeutas cristianos integran el trabajo con sueños en la pastoral y la oración.',
  },
  [ReligiousSource.TIBETAN]: {
    title: 'Budismo tibetano (Yoga de los sueños)',
    desc: 'El Yoga de los sueños es uno de los Seis Yogas de Naropa — una práctica de meditación que busca la iluminación dentro del estado onírico.',
    origin: 'Tíbet, región del Himalaya (siglo VIII hasta hoy)',
    bio: 'En el budismo tibetano, quien está "despierto" en el sueño (sueño lúcido) puede reconocer la naturaleza de la mente en el Bardo (estado intermedio). Milarepa y otros maestros practicaron el Yoga de los sueños con intensidad. El Bardo Thodol (Libro tibetano de los muertos) contiene instrucciones sobre cómo usar los sueños para la liberación.',
  },
  [ReligiousSource.ZEN]: {
    title: 'Budismo Zen',
    desc: 'En el Zen, el límite entre sueño y realidad se disuelve. La mente iluminada no hace distinciones.',
    origin: 'China / Japón (siglo VII hasta hoy)',
    bio: 'Dogen Zenji (1200–1253): "Estudiar el yo es olvidar el yo." Zhuangzi soñó que era una mariposa y, al despertar, se preguntó: ¿Soy un hombre que sueña ser una mariposa, o una mariposa que sueña ser un hombre? En el Zen, el sueño revela la naturaleza relativa de todas las apariencias.',
  },
  [ReligiousSource.THERAVADA]: {
    title: 'Budismo Theravada',
    desc: 'La escuela budista más antigua conservada considera los sueños como constructos mentales que reflejan el karma y el estado de la mente.',
    origin: 'Sri Lanka, Sudeste Asiático (siglo III a.C. hasta hoy)',
    bio: 'El Canon Pali menciona cinco tipos de sueños: por estados corporales, recuerdos, seres espirituales, deseos propios y sueños proféticos. Se dice que el Buda tuvo cinco grandes sueños antes de su iluminación. Los sueños son Mano-Dhamma — objetos mentales que desencadenan respuestas mentales (Citta).',
  },
  [ReligiousSource.WESTERN_ZODIAC]: {
    title: 'Astrología occidental',
    desc: 'La tradición greco-helenística vincula los movimientos planetarios con estados psíquicos y temas oníricos.',
    origin: 'Mesopotamia / Grecia / Roma (3000 a.C. hasta hoy)',
    bio: 'Los planetas como arquitectos oníricos: Marte activa sueños de agresión y energía; Venus sueños de amor y relaciones; Neptuno sueños místicos y confusos; la Luna sueños emocionales y del pasado. Los tránsitos sobre el Ascendente o la Luna intensifican la actividad onírica. Ptolomeo (100–170 d.C.) unió astrología y oneirocrítica.',
  },
  [ReligiousSource.VEDIC_ASTROLOGY]: {
    title: 'Astrología védica (Jyotish)',
    desc: '"La luz de los Vedas" — antigua sabiduría estelar india que interpreta los sueños en relación con el karma y el dharma.',
    origin: 'India, período védico (1500 a.C. hasta hoy)',
    bio: 'En el Jyotish se utilizan los Nakshatras (27 mansiones lunares) para el análisis onírico. Los sueños durante la Brahma-Muhurta (90 minutos antes del amanecer) se consideran especialmente proféticos. La casa 12 (Vyaya Bhava) rige los sueños, el aislamiento y el Moksha. Los Grahas (planetas) aparecen como figuras divinas en sueños significativos.',
  },
  [ReligiousSource.CHINESE_ZODIAC]: {
    title: 'Astrología china',
    desc: 'La tradición china vincula los sueños con los flujos de Qi, el equilibrio Yin-Yang y las cinco fases de transformación.',
    origin: 'China, desde la dinastía Shang hasta hoy (1600 a.C.)',
    bio: 'En el sistema chino, los sueños tienen cinco cualidades correspondientes a los cinco elementos: Madera (crecimiento, creatividad), Fuego (pasión, claridad), Tierra (estabilidad), Metal (tristeza, pureza), Agua (sabiduría, miedo). El Libro de los cambios (I-Ching) se utiliza para el análisis onírico. Zhuangzi es considerado el filósofo de los sueños más importante de China.',
  },
  [ReligiousSource.PYTHAGOREAN]: {
    title: 'Numerología pitagórica',
    desc: 'Sistema numérico occidental basado en Pitágoras: los números del 1 al 9 como vibraciones fundamentales de todos los fenómenos.',
    origin: 'Samos, Grecia (570–495 a.C.)',
    bio: 'Pitágoras enseñó: "Todo es número." Cada número tiene una vibración única: 1=Unidad/Liderazgo, 2=Dualidad/Asociación, 3=Creatividad/Expresión, 4=Estabilidad/Trabajo, 5=Libertad/Cambio, 6=Armonía/Familia, 7=Sabiduría/Espiritualidad, 8=Poder/Materialismo, 9=Plenitud/Universalidad. Los números en los sueños revelan los temas vitales activos.',
  },
  [ReligiousSource.CHALDEAN]: {
    title: 'Numerología caldea',
    desc: 'El sistema numérico más antiguo, procedente de Babilonia, basado en vibraciones sonoras — considerado el enfoque más preciso para los números oníricos.',
    origin: 'Babilonia, Mesopotamia (2000 a.C.)',
    bio: 'Los caldeos — los sacerdotes estelares de Babilonia — desarrollaron un sistema numérico basado en la energía vibratoria de los nombres y fechas de nacimiento. El número 9 es sagrado y no se asigna directamente. Los números oníricos en el sistema caldeo revelan patrones kármicos profundos y misiones del alma.',
  },
  [ReligiousSource.KABBALAH_NUMEROLOGY]: {
    title: 'Numerología cabalística (Gematria)',
    desc: 'Sistema numérico místico judío que conecta las letras hebreas con los números y descifra profundos significados espirituales.',
    origin: 'España / Babilonia, misticismo judío (siglos I–XIII)',
    bio: 'En la Cábala, cada letra hebrea tiene un valor numérico (Álef=1 hasta Tav=400). Las diez Sefirot del Árbol de la Vida representan fuerzas cósmicas que aparecen como arquetipos en los sueños. Los números oníricos pueden remitir a las Sefirot: 1=Keter (Corona), 2=Jojmá (Sabiduría), 3=Biná (Entendimiento), etc.',
  },
  [ReligiousSource.ISLAMIC_NUMEROLOGY]: {
    title: 'Numerología islámica (\'Ilm al-Huruf)',
    desc: 'El conocimiento de las letras — significado numérico místico en el Islam, vinculado a los 99 nombres de Alá y al sistema Abyad.',
    origin: 'Mundo árabe, período islámico (siglos VII–XV)',
    bio: '\'Ilm al-Huruf (la ciencia de las letras) asigna valores numéricos a las letras árabes (Abyad). Las letras coránicas como Alif-Lam-Mim al comienzo de las suras contienen mensajes numéricos ocultos. En el sufismo, Ibn Arabi utilizó análisis numéricos para la interpretación espiritual de los sueños.',
  },
  [ReligiousSource.VEDIC_NUMEROLOGY]: {
    title: 'Numerología védica',
    desc: 'Sistema numérico hinduista procedente de los Vedas, vinculado a las fuerzas cósmicas y los nueve planetas (Navagraha).',
    origin: 'India, período védico (1500 a.C. hasta hoy)',
    bio: 'En la numerología védica, los números del 1 al 9 corresponden a los nueve planetas: 1=Sol, 2=Luna, 3=Júpiter, 4=Rahu, 5=Mercurio, 6=Venus, 7=Ketu, 8=Saturno, 9=Marte. Los sueños con números específicos indican qué energía planetaria está activa. El número de vida (Mulank) y el número del destino (Bhagyank) son las claves principales.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FRANZÖSISCH
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_INFO_FR: Record<string, SourceInfo> = {
  [ReligiousSource.IBN_SIRIN]: {
    title: 'Ibn Sirin',
    desc: 'Le plus grand interprète de rêves de l\'islam. Son œuvre reste la référence standard pour l\'interprétation islamique des rêves (Ta\'bir) jusqu\'à nos jours.',
    origin: 'Bassora, Irak (654–728 apr. J.-C.)',
    bio: 'Muhammad ibn Sirin était un Tabi\'i (successeur des Compagnons du Prophète), érudit et interprète de rêves. Il aurait dit : « La science des rêves vient des prophètes. » Son ouvrage « Mukhtar al-Kalam fi Tabir al-Ahlam » systématise des milliers de symboles oniriques selon les principes islamiques.',
  },
  [ReligiousSource.NABULSI]: {
    title: 'Abd al-Ghani al-Nabulsi',
    desc: 'Érudit soufi ottoman, poète et l\'un des interprètes de rêves les plus prolifiques du monde islamique avec plus de 500 ouvrages.',
    origin: 'Damas, Syrie (1641–1731 apr. J.-C.)',
    bio: 'Al-Nabulsi était un savant universel qui combinait mystique (soufisme), jurisprudence et interprétation des rêves. Son œuvre « Ta\'tir al-Anam fi Tabir al-Manam » est l\'un des traités d\'interprétation des rêves les plus exhaustifs de la littérature islamique, contenant plus de 40 000 symboles oniriques.',
  },
  [ReligiousSource.AL_ISKHAFI]: {
    title: 'Al-Iskhafi',
    desc: 'Interprète médiéval islamique des rêves, connu pour sa catégorisation systématique des symboles oniriques.',
    origin: 'Monde perso-arabe, Xe–XIe siècle',
    bio: 'Al-Iskhafi a développé une méthode de classification des symboles oniriques selon leur origine, leur contexte et leur signification religieuse. Son approche a durablement influencé la littérature islamique d\'interprétation des rêves.',
  },
  [ReligiousSource.FREUDIAN]: {
    title: 'Sigmund Freud',
    desc: 'Fondateur de la psychanalyse et auteur de l\'époque « L\'Interprétation des rêves » (1900) – le premier ouvrage scientifique sur la psychologie du rêve.',
    origin: 'Freiberg (Moravie), Empire des Habsbourg (1856–1939)',
    bio: 'Freud révolutionna la compréhension des rêves : ils sont la « voie royale vers l\'inconscient ». Dans le rêve se manifestent des désirs refoulés, des angoisses et des pulsions sous forme codée. Freud distingua le contenu manifeste (vécu) du contenu latent (caché). La sexualité et l\'agression jouaient un rôle central dans sa théorie.',
  },
  [ReligiousSource.JUNGIAN]: {
    title: 'C.G. Jung',
    desc: 'Fondateur de la psychologie analytique. Il étendit l\'approche de Freud en y ajoutant l\'inconscient collectif et les archétypes comme porteurs universels de sens.',
    origin: 'Kesswil, Suisse (1875–1961)',
    bio: 'Carl Gustav Jung considérait les rêves comme une auto-régulation de la psyché. Il découvrit des symboles universels (archétypes) tels que l\'Ombre, l\'Anima, le Soi et le Héros. Les rêves illustrent le processus d\'individuation – le voyage vers l\'intégralité psychique. Jung soulignait : « Le rêve est la petite porte cachée vers la chambre la plus intime et secrète de l\'âme. »',
  },
  [ReligiousSource.GESTALT]: {
    title: 'Thérapie Gestalt',
    desc: 'Approche thérapeutique selon Fritz Perls : chaque élément d\'un rêve est une partie du rêveur qui demande à être intégrée.',
    origin: 'Francfort, Allemagne / New York / Esalen (années 1940–1960)',
    bio: 'Fritz Perls développa le travail gestaltiste sur les rêves : on s\'incarne dans chaque personnage et chaque objet du rêve et on parle depuis leur perspective. Ainsi, des parties de personnalité dissociées deviennent conscientes et s\'intègrent. Les rêves sont des « messages de soi à soi-même ».',
  },
  [ReligiousSource.MEDIEVAL]: {
    title: 'Interprétation chrétienne médiévale des rêves',
    desc: 'Classification systématique des rêves en cinq types par des érudits médiévaux comme Macrobe et Hildegard von Bingen.',
    origin: 'Europe, Ve–XVe siècle',
    bio: 'Macrobe (vers 400 apr. J.-C.) classifia : Somnium (rêve symbolique), Visio (image prophétique), Oraculum (message divin), Insomnium (rêve sans signification), Visum (hallucination). Hildegard von Bingen (1098–1179) voyait ses rêves mystiques comme une « Lumière vivante » et des révélations divines.',
  },
  [ReligiousSource.CHURCH_FATHERS]: {
    title: 'Pères de l\'Église',
    desc: 'Théologiens paléochrétiens qui débattirent de l\'origine des rêves : divine, démoniaque ou naturelle.',
    origin: 'Afrique du Nord, Égypte, Syrie (IIe–Ve siècle)',
    bio: 'Augustin (354–430) distinguait les rêves d\'origine naturelle des visions divines. Origène voyait les rêves comme un canal de communication entre l\'homme et le monde des esprits. Tertullien mettait en garde contre les rêves démoniaques, tout en reconnaissant les vrais rêves prophétiques. Leurs écrits ont façonné la compréhension chrétienne des rêves pendant des siècles.',
  },
  [ReligiousSource.MODERN_THEOLOGY]: {
    title: 'Théologie chrétienne moderne',
    desc: 'Théologiens contemporains unissant psychologie et foi, comprenant les rêves comme faisant partie du développement spirituel.',
    origin: 'États-Unis/Europe, XXe–XXIe siècle',
    bio: 'Morton Kelsey et John Sanford, influencés par Jung, voyaient les rêves comme la langue de Dieu dans le monde moderne. Hermann Riffel (1916–2009) développa une pratique chrétienne d\'interprétation des rêves. Aujourd\'hui, des accompagnateurs spirituels et des thérapeutes chrétiens intègrent le travail sur les rêves dans la direction spirituelle et la prière.',
  },
  [ReligiousSource.TIBETAN]: {
    title: 'Bouddhisme tibétain (Yoga du rêve)',
    desc: 'Le yoga du rêve est l\'un des Six Yogas de Naropa – une pratique méditative visant l\'Éveil dans le rêve.',
    origin: 'Tibet, région himalayenne (VIIIe siècle à nos jours)',
    bio: 'Dans le bouddhisme tibétain, celui qui est « éveillé » dans le rêve (rêve lucide) peut reconnaître la nature de l\'esprit dans le Bardo (état intermédiaire). Milarepa et d\'autres maîtres pratiquèrent intensément le yoga du rêve. Le Bardo Thödol (Livre tibétain des morts) contient des instructions pour utiliser les rêves à des fins de libération.',
  },
  [ReligiousSource.ZEN]: {
    title: 'Bouddhisme Zen',
    desc: 'Dans le Zen, la frontière entre rêve et réalité se dissout. L\'esprit éveillé ne fait pas de distinction.',
    origin: 'Chine / Japon (VIIe siècle à nos jours)',
    bio: 'Dogen Zenji (1200–1253) : « Apprendre ce que signifie l\'Éveil, c\'est apprendre à se connaître soi-même. » Zhuangzi rêva qu\'il était un papillon – et au réveil se demanda : suis-je un homme qui rêve d\'être un papillon, ou un papillon qui rêve d\'être un homme ? Dans le Zen, le rêve illustre la nature relative de toutes les apparences.',
  },
  [ReligiousSource.THERAVADA]: {
    title: 'Bouddhisme Theravada',
    desc: 'La plus ancienne école bouddhiste existante considère les rêves comme des constructions mentales reflétant le karma et l\'état d\'esprit.',
    origin: 'Sri Lanka, Asie du Sud-Est (IIIe siècle av. J.-C. à nos jours)',
    bio: 'Le Canon pali mentionne cinq types de rêves : par états corporels, souvenirs, êtres spirituels, désirs propres et rêves prophétiques. Le Bouddha aurait fait cinq grands rêves avant son Éveil. Les rêves sont Mano-Dhamma – objets mentaux déclenchant des réactions mentales (Citta).',
  },
  [ReligiousSource.WESTERN_ZODIAC]: {
    title: 'Astrologie occidentale',
    desc: 'L\'astrologie gréco-hellénistique relie les mouvements planétaires aux états psychiques et aux thèmes oniriques.',
    origin: 'Mésopotamie / Grèce / Rome (3000 av. J.-C. à nos jours)',
    bio: 'Les planètes comme architectes des rêves : Mars active les rêves d\'agression et d\'énergie ; Vénus les rêves d\'amour et de relations ; Neptune les rêves mystiques et confus ; la Lune les rêves émotionnels et du passé. Les transits sur l\'Ascendant ou la Lune intensifient l\'activité onirique. Ptolémée (100–170 apr. J.-C.) relia astrologie et onirocritique.',
  },
  [ReligiousSource.VEDIC_ASTROLOGY]: {
    title: 'Astrologie védique (Jyotish)',
    desc: 'La « Lumière des Védas » – sagesse stellaire de l\'Inde antique qui interprète les rêves en lien avec le karma et le dharma.',
    origin: 'Inde, période védique (1500 av. J.-C. à nos jours)',
    bio: 'En Jyotish, les Nakshatras (27 stations lunaires) sont utilisés pour l\'analyse des rêves. Les rêves au Brahma-Muhurta (90 min avant le lever du soleil) sont considérés comme particulièrement prophétiques. La 12e maison (Vyaya Bhava) régit les rêves, l\'isolement et le Moksha. Les Graha (planètes) apparaissent sous forme de déités dans les rêves importants.',
  },
  [ReligiousSource.CHINESE_ZODIAC]: {
    title: 'Astrologie chinoise',
    desc: 'La tradition chinoise relie les rêves aux flux de Qi, à l\'équilibre Yin-Yang et aux cinq phases de transformation.',
    origin: 'Chine, de la dynastie Shang à nos jours (1600 av. J.-C.)',
    bio: 'Dans le système chinois, les rêves ont cinq qualités correspondant aux cinq éléments : Bois (croissance, créativité), Feu (passion, clarté), Terre (stabilité), Métal (deuil, pureté), Eau (sagesse, peur). Le Livre des Mutations (Yi-Jing) est utilisé pour l\'analyse des rêves. Zhuangzi est considéré comme le plus grand philosophe onirique de Chine.',
  },
  [ReligiousSource.PYTHAGOREAN]: {
    title: 'Numérologie pythagoricienne',
    desc: 'Système numérique occidental selon Pythagore : les nombres 1 à 9 comme vibrations fondamentales de tous les phénomènes.',
    origin: 'Samos, Grèce (570–495 av. J.-C.)',
    bio: 'Pythagore enseignait : « Tout est nombre. » Chaque nombre possède une vibration unique : 1=Unité/Leadership, 2=Dualité/Partenariat, 3=Créativité/Expression, 4=Stabilité/Travail, 5=Liberté/Changement, 6=Harmonie/Famille, 7=Sagesse/Spiritualité, 8=Pouvoir/Matérialisme, 9=Achèvement/Universalité. Les nombres oniriques révèlent les thèmes de vie actifs.',
  },
  [ReligiousSource.CHALDEAN]: {
    title: 'Numérologie chaldéenne',
    desc: 'Le plus ancien système numérique de Babylonie, basé sur les vibrations sonores – considéré comme l\'approche la plus précise pour les nombres oniriques.',
    origin: 'Babylone, Mésopotamie (2000 av. J.-C.)',
    bio: 'Les Chaldéens – les prêtres-astrologues de Babylone – développèrent un système numérique basé sur l\'énergie vibratoire des noms et des dates de naissance. Le nombre 9 est sacré et n\'est pas attribué directement. Les nombres oniriques dans le système chaldéen révèlent des schémas karmiques profonds et des missions de l\'âme.',
  },
  [ReligiousSource.KABBALAH_NUMEROLOGY]: {
    title: 'Numérologie kabbalistique (Gématria)',
    desc: 'Système numérique judéo-mystique reliant les lettres hébraïques aux nombres et déchiffrant de profondes significations spirituelles.',
    origin: 'Espagne / Babylone, mystique juive (Ier–XIIIe siècle)',
    bio: 'Dans la Kabbale, chaque lettre hébraïque possède une valeur numérique (Aleph=1 jusqu\'à Tav=400). Les dix Séphiroth de l\'Arbre de Vie représentent des forces cosmiques qui apparaissent dans les rêves comme archétypes. Les nombres oniriques peuvent renvoyer aux Séphiroth : 1=Keter (Couronne), 2=Chokmah (Sagesse), 3=Binah (Compréhension), etc.',
  },
  [ReligiousSource.ISLAMIC_NUMEROLOGY]: {
    title: 'Numérologie islamique (\'Ilm al-Huruf)',
    desc: 'La science des lettres – signification numérique mystique dans l\'islam, liée aux 99 noms d\'Allah et au système Abjad.',
    origin: 'Monde arabe, période islamique (VIIe–XVe siècle)',
    bio: '\'Ilm al-Huruf (la science des lettres) attribue des valeurs numériques aux lettres arabes (Abjad). Les lettres coraniques telles qu\'Alif-Lam-Mim au début des sourates portent des messages numériques cachés. Dans le soufisme, Ibn Arabi utilisait des analyses numériques pour l\'interprétation spirituelle des rêves.',
  },
  [ReligiousSource.VEDIC_NUMEROLOGY]: {
    title: 'Numérologie védique',
    desc: 'Système numérique hindou issu des Védas, lié aux forces cosmiques et aux neuf planètes (Navagraha).',
    origin: 'Inde, période védique (1500 av. J.-C. à nos jours)',
    bio: 'Dans la numérologie védique, les nombres 1 à 9 correspondent aux neuf planètes : 1=Soleil, 2=Lune, 3=Jupiter, 4=Rahu, 5=Mercure, 6=Vénus, 7=Ketu, 8=Saturne, 9=Mars. Les rêves avec certains nombres indiquent quelle énergie planétaire est active. Le nombre de vie (Mulank) et le nombre du destin (Bhagyank) sont des clés essentielles.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ARABISCH
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_INFO_AR: Record<string, SourceInfo> = {
  [ReligiousSource.IBN_SIRIN]: {
    title: 'ابن سيرين',
    desc: 'أعظم مُعبِّري الأحلام في تاريخ الإسلام. لا يزال كتابه المرجعَ الأساسي لتعبير الرؤى حتى يومنا هذا.',
    origin: 'البصرة، العراق (54–110 هـ / 654–728 م)',
    bio: 'محمد بن سيرين تابعيٌّ جليل، عالم وإمام في تعبير الرؤى. يُروى عنه قوله: "علم الرؤيا من النبوة". وكتابه "مختار الكلام في تعبير الأحلام" يُصنِّف آلاف الرموز وفق المنهج الإسلامي.',
  },
  [ReligiousSource.NABULSI]: {
    title: 'عبد الغني النابلسي',
    desc: 'عالم صوفي عثماني وشاعر، وأحد أكثر مُعبِّري الأحلام إنتاجًا في العالم الإسلامي، مع أكثر من 500 مؤلَّف.',
    origin: 'دمشق، سوريا (1050–1143 هـ / 1641–1731 م)',
    bio: 'كان النابلسي عالمًا موسوعيًا جمع بين التصوف والفقه وتعبير الرؤى. كتابه "تعطير الأنام في تعبير المنام" من أشمل كتب التعبير في الأدب الإسلامي، إذ يحتوي على أكثر من أربعين ألف رمز.',
  },
  [ReligiousSource.AL_ISKHAFI]: {
    title: 'الإسكافي',
    desc: 'مُعبِّر أحلام إسلامي في العصر الوسيط، اشتُهر بتصنيفه المنهجي لرموز الأحلام.',
    origin: 'العالم العربي-الفارسي، القرنان العاشر والحادي عشر الميلاديان',
    bio: 'طوَّر الإسكافي منهجًا لتصنيف رموز الرؤى وفق مصادرها وسياقاتها ودلالاتها الدينية، وأثَّر تأثيرًا عميقًا في مؤلفات التعبير الإسلامي.',
  },
  [ReligiousSource.FREUDIAN]: {
    title: 'سيغموند فرويد',
    desc: 'مؤسس التحليل النفسي، مؤلف كتاب "تفسير الأحلام" (1900) الذي يُعدُّ أول عمل علمي في علم نفس الأحلام.',
    origin: 'فرايبرغ، مورافيا، الإمبراطورية النمساوية (1856–1939)',
    bio: 'أحدث فرويد ثورة في فهم الأحلام؛ إذ اعتبرها "الطريق الملكي إلى اللاوعي". تظهر في الحلم الرغبات المكبوتة والمخاوف والدوافع في صورة مُرمَّزة. وقد ميَّز بين المحتوى الظاهر (المُعاش) والمحتوى الكامن (المُضمَر)، وأولى للجنس والعدوان دورًا محوريًا في نظريته.',
  },
  [ReligiousSource.JUNGIAN]: {
    title: 'كارل غوستاف يونغ',
    desc: 'مؤسس علم النفس التحليلي. وسَّع مفهوم فرويد بإضافة اللاوعي الجمعي والنماذج الأصلية (الأركيتيبات) بوصفها حاملات معنى كونية.',
    origin: 'كيسويل، سويسرا (1875–1961)',
    bio: 'رأى كارل غوستاف يونغ في الأحلام تنظيمًا ذاتيًا للنفس. اكتشف رموزًا كونية (أركيتيبات) كالظل والأنيما والذات والبطل. تُصوِّر الأحلام مسار التفرُّد، أي الرحلة نحو الاكتمال النفسي. قال يونغ: "الحلم هو الباب الصغير الخفي إلى أعمق غرفة في الروح وأسرّها."',
  },
  [ReligiousSource.GESTALT]: {
    title: 'العلاج بالجشطلت',
    desc: 'المنهج العلاجي لفريتز بيرلز: كل عنصر في الحلم هو جزء من الحالم يطلب الاندماج.',
    origin: 'فرانكفورت، ألمانيا / نيويورك / إيزالين (الأربعينيات–الستينيات)',
    bio: 'طوَّر فريتز بيرلز أسلوب العمل الجشطلتي مع الأحلام: يتقمَّص المريضُ كلَّ شخصية وكل شيء في الحلم ويتكلم من منظورها. وهكذا تتبيَّن أجزاء الشخصية المنفصلة وتتكامل. الأحلام "رسائل من الذات إلى الذات".',
  },
  [ReligiousSource.MEDIEVAL]: {
    title: 'تعبير الأحلام المسيحي في العصر الوسيط',
    desc: 'تصنيف منهجي للأحلام في خمسة أنواع على يد علماء العصر الوسيط كماكروبيوس وهيلدغارد فون بينغن.',
    origin: 'أوروبا، القرنان الخامس–الخامس عشر الميلاديان',
    bio: 'صنَّف ماكروبيوس (نحو 400م): سومنيوم (حلم رمزي)، فيزيو (رؤية نبوئية)، أوراكولوم (رسالة إلهية)، إينسومنيوم (حلم بلا معنى)، فيزوم (هلوسة). أما هيلدغارد فون بينغن (1098–1179) فقد رأت في أحلامها الصوفية "نورًا حيًّا" ووحيًا ربانيًا.',
  },
  [ReligiousSource.CHURCH_FATHERS]: {
    title: 'آباء الكنيسة',
    desc: 'لاهوتيون مسيحيون في الفترة المبكرة ناقشوا مصادر الأحلام: الإلهي والشيطاني والطبيعي.',
    origin: 'شمال أفريقيا، مصر، سوريا (القرنان الثاني–الخامس)',
    bio: 'ميَّز أوغسطينوس (354–430) بين الأحلام ذات الأصل الطبيعي والرؤى الإلهية. ورأى أوريغانوس في الأحلام قناةً للتواصل بين الإنسان وعالم الأرواح. وقد حذَّر ترتليانوس من الأحلام الشيطانية، مع إقراره بوجود أحلام نبوية حقيقية. شكَّلت مؤلفاتهم الفهمَ المسيحي للأحلام لقرون.',
  },
  [ReligiousSource.MODERN_THEOLOGY]: {
    title: 'اللاهوت المسيحي الحديث',
    desc: 'لاهوتيون معاصرون يجمعون بين علم النفس والإيمان، ويفهمون الأحلام بوصفها جزءًا من التطور الروحي.',
    origin: 'الولايات المتحدة/أوروبا، القرنان العشرون والحادي والعشرون',
    bio: 'رأى مورتون كيلسي وجون سانفورد، بتأثير من يونغ، في الأحلام لغةَ الله في العالم المعاصر. وطوَّر هيرمان ريفل (1916–2009) ممارسةً مسيحية لتعبير الأحلام. يدمج المرشدون الروحيون والمعالجون المسيحيون اليوم عمل الأحلام في الرعاية الرعوية والصلاة.',
  },
  [ReligiousSource.TIBETAN]: {
    title: 'البوذية التبتية (يوغا الحلم)',
    desc: 'يوغا الحلم هو إحدى يوغات ناروبا الست – ممارسة تأملية تسعى إلى التنوير في الحلم.',
    origin: 'التبت، منطقة جبال الهيمالايا (القرن الثامن الميلادي حتى اليوم)',
    bio: 'في البوذية التبتية، من يكون "صاحيًا" في حلمه (الحلم الواضح) يستطيع إدراك طبيعة العقل في البرزخ (الحالة البينية). مارس ميلاريبا وغيره من الأساتذة يوغا الحلم باجتهاد. ويتضمن الكتاب التبتي للموتى (بردو ثودول) تعليماتٍ للاستفادة من الأحلام في طريق التحرر.',
  },
  [ReligiousSource.ZEN]: {
    title: 'بوذية الزن',
    desc: 'في الزن، تنمحي الحدود بين الحلم والواقع. العقل المُنوَّر لا يُفرِّق بينهما.',
    origin: 'الصين / اليابان (القرن السابع الميلادي حتى اليوم)',
    bio: 'قال دوغن زنجي (1200–1253): "تعلُّم معنى التنوير هو تعلُّم معرفة النفس." حلم ذوانغزي أنه فراشة، وتساءل حين استيقظ: هل أنا إنسان يحلم أنه فراشة، أم فراشة تحلم أنها إنسان؟ يُجسِّد الحلم في الزن الطبيعةَ النسبية لكل المظاهر.',
  },
  [ReligiousSource.THERAVADA]: {
    title: 'بوذية ثيرافادا',
    desc: 'أقدم المدارس البوذية القائمة؛ تعتبر الأحلام بناءات ذهنية تعكس الكارما وحالة العقل.',
    origin: 'سريلانكا، جنوب شرق آسيا (القرن الثالث ق.م. حتى اليوم)',
    bio: 'تذكر الكتب البالية خمسة أنواع من الأحلام: بسبب أحوال الجسم، أو الذكريات، أو الكائنات الروحية، أو الأماني، أو الأحلام النبوية. يُروى أن البوذا رأى خمسة أحلام عظيمة قبيل تنويره. الأحلام هي مانو-ذهمَّا، أي موضوعات عقلية تُحدث ردود أفعال ذهنية (جيتَّا).',
  },
  [ReligiousSource.WESTERN_ZODIAC]: {
    title: 'علم التنجيم الغربي',
    desc: 'علم الفلك الإغريقي-الهلنستي يربط حركات الكواكب بالأحوال النفسية وموضوعات الأحلام.',
    origin: 'بلاد ما بين النهرين / اليونان / روما (3000 ق.م. حتى اليوم)',
    bio: 'الكواكب مُهندسو الأحلام: يُنشِّط المريخُ أحلامَ العدوان والطاقة؛ والزهرةُ أحلامَ الحب والعلاقات؛ ونبتون الأحلامَ الصوفية والمُبهمة؛ والقمرُ الأحلامَ العاطفية وأحلام الماضي. العبورات على الطالع أو القمر تُكثِّف نشاط الأحلام. ربط بطليموس (100–170م) علم الفلك بالتعبير الحلمي.',
  },
  [ReligiousSource.VEDIC_ASTROLOGY]: {
    title: 'علم التنجيم الفيدي (جيوتيش)',
    desc: '"نور الفيدا" – حكمة النجوم الهندية القديمة التي تُعبِّر الأحلام في ضوء الكارما والدارما.',
    origin: 'الهند، العصر الفيدي (1500 ق.م. حتى اليوم)',
    bio: 'في جيوتيش تُستخدم النكشاترات (27 محطة قمرية) لتحليل الأحلام. تُعدُّ الأحلام في وقت براهما-موهورتا (90 دقيقة قبل الشروق) ذات طابع نبوي خاص. البيت الثاني عشر (فياية بهاوا) يحكم الأحلام والعزلة والموكشا. تظهر الغراها (الكواكب) بهيئات إلهية في الأحلام الكبرى.',
  },
  [ReligiousSource.CHINESE_ZODIAC]: {
    title: 'علم التنجيم الصيني',
    desc: 'يربط التقليد الصيني الأحلامَ بتدفقات الكيّ وتوازن اليين-يانغ والمراحل الخمس للتحول.',
    origin: 'الصين، من أسرة شانغ حتى اليوم (1600 ق.م.)',
    bio: 'في النظام الصيني للأحلام خمس صفات مرتبطة بالعناصر الخمسة: الخشب (النمو والإبداع)، النار (الشغف والوضوح)، التراب (الاستقرار)، المعدن (الحزن والنقاء)، الماء (الحكمة والخوف). يُستخدم كتاب التحولات (إي جينغ) لتحليل الأحلام. يُعدُّ ذوانغزي أعظم فيلسوف حلمي في الصين.',
  },
  [ReligiousSource.PYTHAGOREAN]: {
    title: 'علم الأعداد الفيثاغوري',
    desc: 'نظام الأعداد الغربي وفق فيثاغورس: الأرقام 1–9 بوصفها اهتزازات أساسية لكل الظواهر.',
    origin: 'ساموس، اليونان (570–495 ق.م.)',
    bio: 'علَّم فيثاغورس: "كل شيء عدد." لكل رقم اهتزاز فريد: 1=الوحدة/القيادة، 2=الثنائية/الشراكة، 3=الإبداع/التعبير، 4=الاستقرار/العمل، 5=الحرية/التغيير، 6=الانسجام/الأسرة، 7=الحكمة/الروحانية، 8=القوة/المادية، 9=الاكتمال/العالمية. أعداد الأحلام تكشف موضوعات الحياة النشطة.',
  },
  [ReligiousSource.CHALDEAN]: {
    title: 'علم الأعداد الكلداني',
    desc: 'أقدم نظام أعداد في بابل، يقوم على الاهتزازات الصوتية – ويُعدُّ أدق المناهج لتعبير أعداد الأحلام.',
    origin: 'بابل، بلاد ما بين النهرين (2000 ق.م.)',
    bio: 'طوَّر الكلدانيون – كهنة النجوم في بابل – نظام أعداد مبنيًّا على طاقة اهتزاز الأسماء وتواريخ الميلاد. الرقم 9 مقدَّس ولا يُسنَد مباشرة. تكشف أعداد الأحلام في النظام الكلداني أنماطًا كارمية عميقة ومهمات الروح.',
  },
  [ReligiousSource.KABBALAH_NUMEROLOGY]: {
    title: 'علم الأعداد الكابالي (الغيماتريا)',
    desc: 'نظام أعداد يهودي صوفي يربط الحروف العبرية بالأرقام ويفكُّ معانيَ روحية عميقة.',
    origin: 'إسبانيا / بابل، التصوف اليهودي (القرنان الأول–الثالث عشر)',
    bio: 'في الكابالا لكل حرف عبري قيمة عددية (ألف=1 حتى تاو=400). تُمثِّل السفيروت العشر لشجرة الحياة قوى كونية تظهر في الأحلام كنماذج أصلية. قد تُحيل أعداد الأحلام إلى السفيروت: 1=كيتر (التاج)، 2=حوكما (الحكمة)، 3=بينا (الفهم)، إلخ.',
  },
  [ReligiousSource.ISLAMIC_NUMEROLOGY]: {
    title: 'علم الحروف الإسلامي (علم الحروف)',
    desc: 'علم الحروف – الدلالة العددية الصوفية في الإسلام، المرتبطة بالأسماء الحسنى ونظام الأبجد.',
    origin: 'العالم العربي، العصر الإسلامي (القرنان السابع–الخامس عشر)',
    bio: 'يُسنِد علم الحروف قيمًا عددية للحروف العربية (الأبجد). تحمل الحروف القرآنية كألف-لام-ميم في مطالع السور رسائل عددية خفية. استخدم ابن عربي في التصوف التحليلاتِ العددية لتعبير الأحلام روحيًّا.',
  },
  [ReligiousSource.VEDIC_NUMEROLOGY]: {
    title: 'علم الأعداد الفيدي',
    desc: 'نظام أعداد هندوسي مستمَدٌّ من الفيدا، مرتبط بالقوى الكونية والكواكب التسعة (نافاغراها).',
    origin: 'الهند، العصر الفيدي (1500 ق.م. حتى اليوم)',
    bio: 'في علم الأعداد الفيدي تقابل الأرقام 1–9 الكواكبَ التسعة: 1=الشمس، 2=القمر، 3=المشتري، 4=راهو، 5=عطارد، 6=الزهرة، 7=كيتو، 8=زحل، 9=المريخ. تُشير أحلام أعداد بعينها إلى الطاقة الكوكبية الفاعلة. رقم الحياة (مولانك) ورقم القدر (بهاغيانك) هما المفتاحان الأساسيان.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PORTUGIESISCH
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_INFO_PT: Record<string, SourceInfo> = {
  [ReligiousSource.IBN_SIRIN]: {
    title: 'Ibn Sirin',
    desc: 'O maior intérprete de sonhos da história do Islã. A sua obra continua sendo a referência padrão para a interpretação islâmica de sonhos (Ta\'bir) até os dias de hoje.',
    origin: 'Basra, Iraque (654–728 d.C.)',
    bio: 'Muhammad ibn Sirin era um Tabi\'i (sucessor dos Companheiros do Profeta), erudito e intérprete de sonhos. Diz-se que afirmou: "O conhecimento dos sonhos provém dos profetas." A sua obra "Mukhtar al-Kalam fi Tabir al-Ahlam" sistematiza milhares de símbolos oníricos segundo os princípios islâmicos.',
  },
  [ReligiousSource.NABULSI]: {
    title: 'Abd al-Ghani al-Nabulsi',
    desc: 'Erudito sufi otomano, poeta e um dos intérpretes de sonhos mais prolíficos do mundo islâmico, com mais de 500 obras.',
    origin: 'Damasco, Síria (1641–1731 d.C.)',
    bio: 'Al-Nabulsi era um erudito de vasto saber que unia mística (sufismo), jurisprudência e interpretação de sonhos. A sua obra "Ta\'tir al-Anam fi Tabir al-Manam" é um dos mais abrangentes tratados de interpretação de sonhos da literatura islâmica, contendo mais de 40.000 símbolos oníricos.',
  },
  [ReligiousSource.AL_ISKHAFI]: {
    title: 'Al-Iskhafi',
    desc: 'Intérprete medieval islâmico de sonhos, conhecido pela sua categorização sistemática dos símbolos oníricos.',
    origin: 'Mundo perso-árabe, séculos X–XI',
    bio: 'Al-Iskhafi desenvolveu um método de classificação dos símbolos oníricos segundo a sua origem, contexto e significado religioso. A sua abordagem influenciou de forma duradoura a literatura islâmica de interpretação de sonhos.',
  },
  [ReligiousSource.FREUDIAN]: {
    title: 'Sigmund Freud',
    desc: 'Fundador da psicanálise e autor da épica "A Interpretação dos Sonhos" (1900) – a primeira obra científica sobre psicologia dos sonhos.',
    origin: 'Freiberg (Morávia), Habsburgo (1856–1939)',
    bio: 'Freud revolucionou a compreensão dos sonhos: eles são o "caminho real para o inconsciente". No sonho manifestam-se desejos reprimidos, medos e pulsões de forma codificada. Freud distinguiu entre o conteúdo manifesto (vivenciado) e o conteúdo latente (oculto). A sexualidade e a agressão desempenhavam um papel central na sua teoria.',
  },
  [ReligiousSource.JUNGIAN]: {
    title: 'C.G. Jung',
    desc: 'Fundador da Psicologia Analítica. Ampliou a abordagem de Freud com o inconsciente coletivo e os arquétipos como portadores universais de significado.',
    origin: 'Kesswil, Suíça (1875–1961)',
    bio: 'Carl Gustav Jung via os sonhos como autorregulação da psique. Descobriu símbolos universais (arquétipos) como Sombra, Anima, Self e Herói. Os sonhos ilustram o processo de individuação – a jornada em direção à totalidade psíquica. Jung salientava: "O sonho é a pequena porta oculta para a câmara mais íntima e secreta da alma."',
  },
  [ReligiousSource.GESTALT]: {
    title: 'Terapia Gestalt',
    desc: 'Abordagem terapêutica segundo Fritz Perls: cada elemento de um sonho é uma parte do sonhador que precisa ser integrada.',
    origin: 'Frankfurt, Alemanha / Nova Iorque / Esalen (anos 1940–1960)',
    bio: 'Fritz Perls desenvolveu o trabalho gestáltico com sonhos: o paciente incorpora cada personagem e cada objeto do sonho e fala a partir da sua perspetiva. Assim, partes dissociadas da personalidade tornam-se conscientes e integradas. Os sonhos são "mensagens de si mesmo para si mesmo".',
  },
  [ReligiousSource.MEDIEVAL]: {
    title: 'Interpretação cristã medieval dos sonhos',
    desc: 'Classificação sistemática dos sonhos em cinco tipos por eruditos medievais como Macróbio e Hildegard von Bingen.',
    origin: 'Europa, séculos V–XV',
    bio: 'Macróbio (c. 400 d.C.) classificou: Somnium (sonho simbólico), Visio (imagem profética), Oraculum (mensagem divina), Insomnium (sonho sem significado), Visum (alucinação). Hildegard von Bingen (1098–1179) via os seus sonhos místicos como "Luz Viva" e revelações divinas.',
  },
  [ReligiousSource.CHURCH_FATHERS]: {
    title: 'Padres da Igreja',
    desc: 'Teólogos paleocristãos que debateram a origem dos sonhos: divina, demoníaca ou natural.',
    origin: 'Norte de África, Egito, Síria (séculos II–V)',
    bio: 'Agostinho (354–430) distinguia sonhos de origem natural de visões divinas. Orígenes via os sonhos como um canal de comunicação entre o homem e o mundo dos espíritos. Tertuliano advertia contra sonhos demoníacos, mas reconhecia sonhos proféticos genuínos. As suas obras moldaram a compreensão cristã dos sonhos por séculos.',
  },
  [ReligiousSource.MODERN_THEOLOGY]: {
    title: 'Teologia cristã moderna',
    desc: 'Teólogos contemporâneos que unem psicologia e fé, compreendendo os sonhos como parte do desenvolvimento espiritual.',
    origin: 'EUA/Europa, séculos XX–XXI',
    bio: 'Morton Kelsey e John Sanford, influenciados por Jung, viam os sonhos como a linguagem de Deus no mundo moderno. Hermann Riffel (1916–2009) desenvolveu uma prática cristã de interpretação de sonhos. Hoje, acompanhantes espirituais e terapeutas cristãos integram o trabalho com sonhos na direção espiritual e na oração.',
  },
  [ReligiousSource.TIBETAN]: {
    title: 'Budismo Tibetano (Yoga do Sonho)',
    desc: 'O Yoga do Sonho é um dos Seis Yogas de Naropa – uma prática meditativa que almeja o Despertar no sonho.',
    origin: 'Tibete, região do Himalaia (século VIII até hoje)',
    bio: 'No budismo tibetano, quem está "desperto" no sonho (sonho lúcido) pode reconhecer a natureza da mente no Bardo (estado intermédio). Milarepa e outros mestres praticaram intensamente o Yoga do Sonho. O Bardo Thödol (Livro Tibetano dos Mortos) contém instruções sobre como utilizar os sonhos para a libertação.',
  },
  [ReligiousSource.ZEN]: {
    title: 'Budismo Zen',
    desc: 'No Zen, a fronteira entre sonho e realidade dissolve-se. A mente desperta não distingue entre ambos.',
    origin: 'China / Japão (século VII até hoje)',
    bio: 'Dogen Zenji (1200–1253): "Aprender o que significa o Despertar é aprender a conhecer-se a si mesmo." Zhuangzi sonhou que era uma borboleta – e ao despertar perguntou-se: sou um homem que sonha ser uma borboleta, ou uma borboleta que sonha ser um homem? No Zen, o sonho ilustra a natureza relativa de todas as aparências.',
  },
  [ReligiousSource.THERAVADA]: {
    title: 'Budismo Theravada',
    desc: 'A mais antiga escola budista existente considera os sonhos como construções mentais que refletem o karma e o estado de espírito.',
    origin: 'Sri Lanka, Sudeste Asiático (século III a.C. até hoje)',
    bio: 'O Cânone Pali menciona cinco tipos de sonhos: por estados corporais, memórias, seres espirituais, desejos próprios e sonhos proféticos. Diz-se que o Buda teve cinco grandes sonhos antes do seu Despertar. Os sonhos são Mano-Dhamma – objetos mentais que desencadeiam reações mentais (Citta).',
  },
  [ReligiousSource.WESTERN_ZODIAC]: {
    title: 'Astrologia ocidental',
    desc: 'A astrologia greco-helenística conecta os movimentos planetários com estados psíquicos e temas oníricos.',
    origin: 'Mesopotâmia / Grécia / Roma (3000 a.C. até hoje)',
    bio: 'Os planetas como arquitetos dos sonhos: Marte ativa sonhos de agressão e energia; Vénus sonhos de amor e relacionamentos; Neptuno sonhos místicos e confusos; a Lua sonhos emocionais e do passado. Trânsitos sobre o Ascendente ou a Lua intensificam a atividade onírica. Ptolomeu (100–170 d.C.) relacionou astrologia e onirocrítica.',
  },
  [ReligiousSource.VEDIC_ASTROLOGY]: {
    title: 'Astrologia védica (Jyotish)',
    desc: 'A "Luz dos Vedas" – sabedoria estelar da Índia antiga que interpreta os sonhos em relação ao karma e ao dharma.',
    origin: 'Índia, período védico (1500 a.C. até hoje)',
    bio: 'No Jyotish, os Nakshatras (27 estações lunares) são utilizados para a análise dos sonhos. Os sonhos no Brahma-Muhurta (90 min antes do nascer do sol) são considerados especialmente proféticos. A 12.ª casa (Vyaya Bhava) rege os sonhos, o isolamento e o Moksha. Os Graha (planetas) aparecem como figuras divinas nos sonhos importantes.',
  },
  [ReligiousSource.CHINESE_ZODIAC]: {
    title: 'Astrologia chinesa',
    desc: 'A tradição chinesa conecta os sonhos aos fluxos de Qi, ao equilíbrio Yin-Yang e às cinco fases de transformação.',
    origin: 'China, da dinastia Shang até hoje (1600 a.C.)',
    bio: 'No sistema chinês, os sonhos têm cinco qualidades correspondentes aos cinco elementos: Madeira (crescimento, criatividade), Fogo (paixão, clareza), Terra (estabilidade), Metal (luto, pureza), Água (sabedoria, medo). O Livro das Mutações (I Ching) é utilizado para análise de sonhos. Zhuangzi é considerado o maior filósofo onírico da China.',
  },
  [ReligiousSource.PYTHAGOREAN]: {
    title: 'Numerologia pitagórica',
    desc: 'Sistema numérico ocidental segundo Pitágoras: os números 1–9 como vibrações fundamentais de todos os fenômenos.',
    origin: 'Samos, Grécia (570–495 a.C.)',
    bio: 'Pitágoras ensinava: "Tudo é número." Cada número tem uma vibração única: 1=Unidade/Liderança, 2=Dualidade/Parceria, 3=Criatividade/Expressão, 4=Estabilidade/Trabalho, 5=Liberdade/Mudança, 6=Harmonia/Família, 7=Sabedoria/Espiritualidade, 8=Poder/Materialismo, 9=Completude/Universalidade. Os números oníricos revelam os temas de vida ativos.',
  },
  [ReligiousSource.CHALDEAN]: {
    title: 'Numerologia caldeia',
    desc: 'O sistema numérico mais antigo da Babilónia, baseado em vibrações sonoras – considerado a abordagem mais precisa para números oníricos.',
    origin: 'Babilónia, Mesopotâmia (2000 a.C.)',
    bio: 'Os caldeus – os sacerdotes-astrólogos da Babilónia – desenvolveram um sistema numérico baseado na energia vibratória de nomes e datas de nascimento. O número 9 é sagrado e não é atribuído diretamente. Os números oníricos no sistema caldeu revelam padrões cármicos profundos e missões da alma.',
  },
  [ReligiousSource.KABBALAH_NUMEROLOGY]: {
    title: 'Numerologia cabalística (Gematria)',
    desc: 'Sistema numérico judeu-místico que relaciona letras hebraicas com números e decifra profundos significados espirituais.',
    origin: 'Espanha / Babilónia, mística judaica (séculos I–XIII)',
    bio: 'Na Cabala, cada letra hebraica possui um valor numérico (Aleph=1 até Tav=400). As dez Sefirot da Árvore da Vida representam forças cósmicas que aparecem nos sonhos como arquétipos. Os números oníricos podem remeter às Sefirot: 1=Keter (Coroa), 2=Chokmah (Sabedoria), 3=Binah (Compreensão), etc.',
  },
  [ReligiousSource.ISLAMIC_NUMEROLOGY]: {
    title: 'Numerologia islâmica (\'Ilm al-Huruf)',
    desc: 'A ciência das letras – significado numérico místico no Islã, ligada aos 99 nomes de Alá e ao sistema Abjad.',
    origin: 'Mundo árabe, período islâmico (séculos VII–XV)',
    bio: '\'Ilm al-Huruf (a ciência das letras) atribui valores numéricos às letras árabes (Abjad). As letras corânicas como Alif-Lam-Mim no início das suras carregam mensagens numéricas ocultas. No sufismo, Ibn Arabi utilizava análises numéricas para a interpretação espiritual dos sonhos.',
  },
  [ReligiousSource.VEDIC_NUMEROLOGY]: {
    title: 'Numerologia védica',
    desc: 'Sistema numérico hindu proveniente dos Vedas, ligado às forças cósmicas e aos nove planetas (Navagraha).',
    origin: 'Índia, período védico (1500 a.C. até hoje)',
    bio: 'Na numerologia védica, os números 1–9 correspondem aos nove planetas: 1=Sol, 2=Lua, 3=Júpiter, 4=Rahu, 5=Mercúrio, 6=Vénus, 7=Ketu, 8=Saturno, 9=Marte. Sonhos com determinados números indicam qual energia planetária está ativa. O número de vida (Mulank) e o número do destino (Bhagyank) são as chaves essenciais.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE_BASE – Hauptexport (sprachbasiert für InfoModal)
// ─────────────────────────────────────────────────────────────────────────────

export const KNOWLEDGE_BASE: Record<string, any> = {
  // Sprachbasierte Source-Info (für InfoModal in App.tsx)
  [Language.DE]: SOURCE_INFO_DE,
  [Language.EN]: SOURCE_INFO_EN,
  [Language.TR]: SOURCE_INFO_TR,
  [Language.ES]: SOURCE_INFO_ES,
  [Language.FR]: SOURCE_INFO_FR,
  [Language.AR]: SOURCE_INFO_AR,
  [Language.PT]: SOURCE_INFO_PT,
  [Language.RU]: SOURCE_INFO_RU,

  // Statische Inhalte (Symbol-Lexikon, Kategorien, Traditionen)
  symbols,
  categories,
  traditions,
};

export default KNOWLEDGE_BASE;
