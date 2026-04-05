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

  // ─────────────────────────────────────────────────────────────────────────────
  // KULTURELLE TRAUMSYMBOLE (466 Symbole aus Dream Database)
  // 12 Sprachen, 18 Traditionen: Freud, Jung, Ibn Sirin, Bibel, Buddhismus...
  // Generiert: 2026-04-04
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'katze',
    name: 'Katze',
    category: 'tier',
    keywords: ['Cat'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weiblichkeit, Intuition, Unabhaengigkeit. Islam: List, Diebstahl. Japan: Glueck (Maneki-neko). Aegypten: Heiliges Tier (Bastet).' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Weiblichkeit, Intuition, Unabhaengigkeit. Islam: List, Diebstahl. Japan: Glueck (Maneki-neko). Aegypten: Heiliges Tier (Bastet).' },
    ],
  },
  {
    id: 'pferd',
    name: 'Pferd',
    category: 'tier',
    keywords: ['Horse'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Kraft, Freiheit, Triebhaftigkeit. Islam: Ehre und Status. Freud: sexuelle Energie.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Kraft, Freiheit, Triebhaftigkeit. Islam: Ehre und Status. Freud: sexuelle Energie.' },
    ],
  },
  {
    id: 'fisch',
    name: 'Fisch',
    category: 'tier',
    keywords: ['Fish'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Unbewusstes, Fruchtbarkeit. Islam: Rizq (Lebensunterhalt). Christlich: Christus-Symbol.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Unbewusstes, Fruchtbarkeit. Islam: Rizq (Lebensunterhalt). Christlich: Christus-Symbol.' },
    ],
  },
  {
    id: 'loewe',
    name: 'Loewe',
    category: 'tier',
    keywords: ['Lion'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Macht, Mut, Autoritaet. Islam: starker Feind oder Herrscher. Bibel: Stamm Juda.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Macht, Mut, Autoritaet. Islam: starker Feind oder Herrscher. Bibel: Stamm Juda.' },
    ],
  },
  {
    id: 'baer',
    name: 'Baer',
    category: 'tier',
    keywords: ['Bear'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Innere Kraft, Muetterlichkeit, Winterschlaf als Rueckzug. Schamanisch: Krafttier.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Innere Kraft, Muetterlichkeit, Winterschlaf als Rueckzug. Schamanisch: Krafttier.' },
    ],
  },
  {
    id: 'wolf',
    name: 'Wolf',
    category: 'tier',
    keywords: ['Wolf'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wildheit, Instinkt, Bedrohung. Islam: Tyrann. Tuerkisch: Stammessymbol (Bozkurt).' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Wildheit, Instinkt, Bedrohung. Islam: Tyrann. Tuerkisch: Stammessymbol (Bozkurt).' },
    ],
  },
  {
    id: 'adler',
    name: 'Adler',
    category: 'tier',
    keywords: ['Eagle'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ueberblick, Macht, Spiritualitaet. Islam: Herrschaft. Schamanisch: Himmelsreise.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ueberblick, Macht, Spiritualitaet. Islam: Herrschaft. Schamanisch: Himmelsreise.' },
    ],
  },
  {
    id: 'kuh',
    name: 'Kuh',
    category: 'tier',
    keywords: ['Cow'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Nahrung, Muetterlichkeit. Islam: Traumdeutung Josephs (7 fette/magere Kuehe). Hindu: Heilig.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Nahrung, Muetterlichkeit. Islam: Traumdeutung Josephs (7 fette/magere Kuehe). Hindu: Heilig.' },
    ],
  },
  {
    id: 'ziege',
    name: 'Ziege',
    category: 'tier',
    keywords: ['Goat'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Fruchtbarkeit, Sturheit. Islam: Opfertier. Christlich: Suendenbock.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Fruchtbarkeit, Sturheit. Islam: Opfertier. Christlich: Suendenbock.' },
    ],
  },
  {
    id: 'esel',
    name: 'Esel',
    category: 'tier',
    keywords: ['Donkey'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Geduld, Bescheidenheit. Islam: Diener. Bibel: Einzug in Jerusalem.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Geduld, Bescheidenheit. Islam: Diener. Bibel: Einzug in Jerusalem.' },
    ],
  },
  {
    id: 'kamel',
    name: 'Kamel',
    category: 'tier',
    keywords: ['Camel'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ausdauer, Reise. Islam: Segen, hoher Status, lange Reise.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ausdauer, Reise. Islam: Segen, hoher Status, lange Reise.' },
    ],
  },
  {
    id: 'schmetterling',
    name: 'Schmetterling',
    category: 'tier',
    keywords: ['Butterfly'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Transformation, Seele, Vergaenglichkeit. China: Zhuangzi-Paradoxon.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.ZEN, text: 'Transformation, Seele, Vergaenglichkeit. China: Zhuangzi-Paradoxon.' },
    ],
  },
  {
    id: 'frosch',
    name: 'Frosch',
    category: 'tier',
    keywords: ['Frog'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wandlung, Reinigung. Islam: Abscheu. Maerchen: Verwandlung.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Wandlung, Reinigung. Islam: Abscheu. Maerchen: Verwandlung.' },
    ],
  },
  {
    id: 'ameise',
    name: 'Ameise',
    category: 'tier',
    keywords: ['Ant'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Fleiss, Gemeinschaft, Geduld. Islam: Sure An-Naml (Die Ameisen).' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Fleiss, Gemeinschaft, Geduld. Islam: Sure An-Naml (Die Ameisen).' },
    ],
  },
  {
    id: 'skorpion',
    name: 'Skorpion',
    category: 'tier',
    keywords: ['Scorpion'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verrat, Gift, verborgene Gefahr. Islam: hinterhaeltiger Feind.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verrat, Gift, verborgene Gefahr. Islam: hinterhaeltiger Feind.' },
    ],
  },
  {
    id: 'ratte',
    name: 'Ratte',
    category: 'tier',
    keywords: ['Rat'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Angst, Krankheit, Verlust. Islam: unehrliche Person. China: Cleverness (Zodiak).' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Angst, Krankheit, Verlust. Islam: unehrliche Person. China: Cleverness (Zodiak).' },
    ],
  },
  {
    id: 'elefant',
    name: 'Elefant',
    category: 'tier',
    keywords: ['Elephant'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Weisheit, Gedaechtnis, Macht. Islam: Sure Al-Fil, Krieg. Hindu: Ganesha.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Weisheit, Gedaechtnis, Macht. Islam: Sure Al-Fil, Krieg. Hindu: Ganesha.' },
    ],
  },
  {
    id: 'tiger',
    name: 'Tiger',
    category: 'tier',
    keywords: ['Tiger'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Kraft, Wildheit, unterdrueckte Aggression. China: Schutzgeist.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.CHINESE_ZODIAC, text: 'Kraft, Wildheit, unterdrueckte Aggression. China: Schutzgeist.' },
    ],
  },
  {
    id: 'delphin',
    name: 'Delphin',
    category: 'tier',
    keywords: ['Dolphin'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Intelligenz, Freude, spiritueller Fuehrer. Griechisch: Apollon.' },
    ],
  },
  {
    id: 'eule',
    name: 'Eule',
    category: 'tier',
    keywords: ['Owl'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weisheit, Tod, Nacht. Islam: schlechtes Omen. Griechisch: Athene.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Weisheit, Tod, Nacht. Islam: schlechtes Omen. Griechisch: Athene.' },
    ],
  },
  {
    id: 'kraehe',
    name: 'Kraehe',
    category: 'tier',
    keywords: ['Crow'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Tod, Transformation, Botschaft. Islam: Kabil und Habil. Schamanisch: Trickster.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Tod, Transformation, Botschaft. Islam: Kabil und Habil. Schamanisch: Trickster.' },
    ],
  },
  {
    id: 'biene',
    name: 'Biene',
    category: 'tier',
    keywords: ['Bee'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Fleiss, Gemeinschaft, suesse Belohnung. Islam: Sure An-Nahl.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Fleiss, Gemeinschaft, suesse Belohnung. Islam: Sure An-Nahl.' },
    ],
  },
  {
    id: 'taube',
    name: 'Taube',
    category: 'tier',
    keywords: ['Dove'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Frieden, Liebe, Heiliger Geist. Islam: Schutz in der Hoehle.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Frieden, Liebe, Heiliger Geist. Islam: Schutz in der Hoehle.' },
    ],
  },
  {
    id: 'affe',
    name: 'Affe',
    category: 'tier',
    keywords: ['Monkey'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Nachahmung, Kindlichkeit, Schelmerei. Islam: Verwandlung als Strafe.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.CHINESE_ZODIAC, text: 'Nachahmung, Kindlichkeit, Schelmerei. Islam: Verwandlung als Strafe.' },
    ],
  },
  {
    id: 'schaf',
    name: 'Schaf',
    category: 'tier',
    keywords: ['Sheep'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Sanftmut, Herde, Opfer. Islam: Opferfest. Christlich: Lamm Gottes.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Sanftmut, Herde, Opfer. Islam: Opferfest. Christlich: Lamm Gottes.' },
    ],
  },
  {
    id: 'schildkroete',
    name: 'Schildkroete',
    category: 'tier',
    keywords: ['Turtle'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.CHINESE_ZODIAC, text: 'Langsamkeit, Schutz, Langlebigkeit. China: Welttier. Hindu: Vishnu-Avatar.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Langsamkeit, Schutz, Langlebigkeit. China: Welttier. Hindu: Vishnu-Avatar.' },
    ],
  },
  {
    id: 'stern',
    name: 'Stern',
    category: 'natur',
    keywords: ['Star'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Hoffnung, Fuehrung, Schicksal. Islam: Rechtleitung. Bibel: Stern von Bethlehem.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Hoffnung, Fuehrung, Schicksal. Islam: Rechtleitung. Bibel: Stern von Bethlehem.' },
    ],
  },
  {
    id: 'blume',
    name: 'Blume',
    category: 'natur',
    keywords: ['Flower'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Schoenheit, Vergaenglichkeit, Liebe. Islam: Paradies. Lotus: Erleuchtung.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Schoenheit, Vergaenglichkeit, Liebe. Islam: Paradies. Lotus: Erleuchtung.' },
    ],
  },
  {
    id: 'baum',
    name: 'Baum',
    category: 'natur',
    keywords: ['Tree'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Lebensbaum, Wachstum, Verwurzelung. Kabbala: Sefirot. Islam: guter Mensch.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Lebensbaum, Wachstum, Verwurzelung. Kabbala: Sefirot. Islam: guter Mensch.' },
    ],
  },
  {
    id: 'erde',
    name: 'Erde',
    category: 'natur',
    keywords: ['Earth'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Muetterlichkeit, Stabilitaet, Tod und Wiedergeburt. Islam: Grab, Diesseits.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Muetterlichkeit, Stabilitaet, Tod und Wiedergeburt. Islam: Grab, Diesseits.' },
    ],
  },
  {
    id: 'wind',
    name: 'Wind',
    category: 'natur',
    keywords: ['Wind'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Veraenderung, Geist, Unruhe. Islam: Goettliche Macht. Bibel: Heiliger Geist (Ruach).' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Veraenderung, Geist, Unruhe. Islam: Goettliche Macht. Bibel: Heiliger Geist (Ruach).' },
    ],
  },
  {
    id: 'schnee',
    name: 'Schnee',
    category: 'natur',
    keywords: ['Snow'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Reinheit, Kaelte, Einsamkeit. Islam: Heilung. Russisch: Stille.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Reinheit, Kaelte, Einsamkeit. Islam: Heilung. Russisch: Stille.' },
    ],
  },
  {
    id: 'blitz',
    name: 'Blitz',
    category: 'natur',
    keywords: ['Lightning'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ploetzliche Erkenntnis, goettliche Strafe. Islam: Warnung. Zeus.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Ploetzliche Erkenntnis, goettliche Strafe. Islam: Warnung. Zeus.' },
    ],
  },
  {
    id: 'erdbeben',
    name: 'Erdbeben',
    category: 'natur',
    keywords: ['Earthquake'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Erschuetterung, Umbruch. Islam: Sure Az-Zalzala, Jenseits.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Erschuetterung, Umbruch. Islam: Sure Az-Zalzala, Jenseits.' },
    ],
  },
  {
    id: 'fluss',
    name: 'Fluss',
    category: 'natur',
    keywords: ['River'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Lebensfluss, Zeit, Uebergang. Islam: Paradiesfluss. Griechisch: Styx.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Lebensfluss, Zeit, Uebergang. Islam: Paradiesfluss. Griechisch: Styx.' },
    ],
  },
  {
    id: 'wueste',
    name: 'Wueste',
    category: 'natur',
    keywords: ['Desert'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Einsamkeit, Pruefung, spirituelle Suche. Islam: Hijra. Bibel: 40 Tage.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Einsamkeit, Pruefung, spirituelle Suche. Islam: Hijra. Bibel: 40 Tage.' },
    ],
  },
  {
    id: 'garten',
    name: 'Garten',
    category: 'natur',
    keywords: ['Garden'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Paradies, innerer Frieden, Wachstum. Islam: Janna. Eden.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Paradies, innerer Frieden, Wachstum. Islam: Janna. Eden.' },
    ],
  },
  {
    id: 'regenbogen',
    name: 'Regenbogen',
    category: 'natur',
    keywords: ['Rainbow'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Hoffnung, Versprechen, Verbindung. Bibel: Bund Noahs. Vielfalt.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Hoffnung, Versprechen, Verbindung. Bibel: Bund Noahs. Vielfalt.' },
    ],
  },
  {
    id: 'vulkan',
    name: 'Vulkan',
    category: 'natur',
    keywords: ['Volcano'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Unterdrueckte Wut, Eruption von Emotionen, Transformation.' },
    ],
  },
  {
    id: 'nebel',
    name: 'Nebel',
    category: 'natur',
    keywords: ['Fog'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verwirrung, Unsicherheit, verborgene Wahrheit.' },
    ],
  },
  {
    id: 'eis',
    name: 'Eis',
    category: 'natur',
    keywords: ['Ice'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Emotionale Kaelte, Erstarrung, unterdrueckte Gefuehle.' },
    ],
  },
  {
    id: 'sonnenaufgang',
    name: 'Sonnenaufgang',
    category: 'natur',
    keywords: ['Sunrise'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Neubeginn, Hoffnung, Erleuchtung. Islam: Fajr-Gebet.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Neubeginn, Hoffnung, Erleuchtung. Islam: Fajr-Gebet.' },
    ],
  },
  {
    id: 'sonnenuntergang',
    name: 'Sonnenuntergang',
    category: 'natur',
    keywords: ['Sunset'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ende, Abschied, Lebensabend. Melancholie.' },
    ],
  },
  {
    id: 'rennen',
    name: 'Rennen',
    category: 'aktion',
    keywords: ['Running'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Flucht, Verfolgung, Dringlichkeit. Flucht vor Problemen.' },
    ],
  },
  {
    id: 'schwimmen',
    name: 'Schwimmen',
    category: 'aktion',
    keywords: ['Swimming'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Emotionale Navigation, Unbewusstes durchqueren.' },
    ],
  },
  {
    id: 'kaempfen',
    name: 'Kaempfen',
    category: 'aktion',
    keywords: ['Fighting'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Innerer Konflikt, Selbstbehauptung. Islam: Dschihad an-Nafs.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Innerer Konflikt, Selbstbehauptung. Islam: Dschihad an-Nafs.' },
    ],
  },
  {
    id: 'weinen',
    name: 'Weinen',
    category: 'aktion',
    keywords: ['Crying'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Emotionale Befreiung, Trauer. Islam: kann Freude bedeuten.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Emotionale Befreiung, Trauer. Islam: kann Freude bedeuten.' },
    ],
  },
  {
    id: 'lachen',
    name: 'Lachen',
    category: 'aktion',
    keywords: ['Laughing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Freude, Verleugnung, Maskierung. Islam: kann Kummer anzeigen.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Freude, Verleugnung, Maskierung. Islam: kann Kummer anzeigen.' },
    ],
  },
  {
    id: 'essen',
    name: 'Essen',
    category: 'aktion',
    keywords: ['Eating'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Beduerfnisbefriedigung, Wissensaufnahme. Islam: Halal=gut, Haram=schlecht.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Beduerfnisbefriedigung, Wissensaufnahme. Islam: Halal=gut, Haram=schlecht.' },
    ],
  },
  {
    id: 'sterben',
    name: 'Sterben',
    category: 'aktion',
    keywords: ['Dying'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Transformation, Ende einer Phase. NICHT woertlicher Tod. Islam: Reue.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Transformation, Ende einer Phase. NICHT woertlicher Tod. Islam: Reue.' },
    ],
  },
  {
    id: 'heiraten',
    name: 'Heiraten',
    category: 'aktion',
    keywords: ['Marriage'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Vereinigung, Integration von Gegensaetzen. Islam: Vertrag, Segen.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Vereinigung, Integration von Gegensaetzen. Islam: Vertrag, Segen.' },
    ],
  },
  {
    id: 'geburt',
    name: 'Geburt',
    category: 'aktion',
    keywords: ['Birth'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Neubeginn, Kreativitaet, neues Projekt. Islam: Segen.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Neubeginn, Kreativitaet, neues Projekt. Islam: Segen.' },
    ],
  },
  {
    id: 'pruefung',
    name: 'Pruefung',
    category: 'aktion',
    keywords: ['Exam'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Leistungsdruck, Selbstzweifel, Bewertungsangst.' },
    ],
  },
  {
    id: 'tanzen',
    name: 'Tanzen',
    category: 'aktion',
    keywords: ['Dancing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Lebensfreude, Ausdruck, Harmonie. Islam: kann Vergnuegen bedeuten.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Lebensfreude, Ausdruck, Harmonie. Islam: kann Vergnuegen bedeuten.' },
    ],
  },
  {
    id: 'singen',
    name: 'Singen',
    category: 'aktion',
    keywords: ['Singing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Selbstausdruck, Freude. Islam: Warnung vor Ablenkung.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Selbstausdruck, Freude. Islam: Warnung vor Ablenkung.' },
    ],
  },
  {
    id: 'beten',
    name: 'Beten',
    category: 'aktion',
    keywords: ['Praying'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Spirituelle Suche, Hingabe. Islam: Verbindung zu Allah. Innerer Frieden.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Spirituelle Suche, Hingabe. Islam: Verbindung zu Allah. Innerer Frieden.' },
    ],
  },
  {
    id: 'klettern',
    name: 'Klettern',
    category: 'aktion',
    keywords: ['Climbing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Aufstieg, Ambition, Fortschritt. Islam: spiritueller Aufstieg.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Aufstieg, Ambition, Fortschritt. Islam: spiritueller Aufstieg.' },
    ],
  },
  {
    id: 'graben',
    name: 'Graben',
    category: 'aktion',
    keywords: ['Digging'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Suche nach Wahrheit, Vergangenheit aufdecken. Islam: Grab, Schatz.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Suche nach Wahrheit, Vergangenheit aufdecken. Islam: Grab, Schatz.' },
    ],
  },
  {
    id: 'waschen',
    name: 'Waschen',
    category: 'aktion',
    keywords: ['Washing'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Reinigung, Schuld abwaschen. Islam: Wudu, Reinheit.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Reinigung, Schuld abwaschen. Islam: Wudu, Reinheit.' },
    ],
  },
  {
    id: 'verlieren',
    name: 'Verlieren',
    category: 'aktion',
    keywords: ['Losing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Kontrollverlust, Identitaetskrise. Etwas Wertvolles aufgeben.' },
    ],
  },
  {
    id: 'suchen',
    name: 'Suchen',
    category: 'aktion',
    keywords: ['Searching'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Sinnsuche, verlorener Aspekt des Selbst. Spirituelle Suche.' },
    ],
  },
  {
    id: 'fliehen',
    name: 'Fliehen',
    category: 'aktion',
    keywords: ['Fleeing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Vermeidung, Angst konfrontieren. Islam: Flucht vor Suende.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Vermeidung, Angst konfrontieren. Islam: Flucht vor Suende.' },
    ],
  },
  {
    id: 'stehlen',
    name: 'Stehlen',
    category: 'aktion',
    keywords: ['Stealing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Neid, Mangel, Grenzueberschreitung. Islam: Haram.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Neid, Mangel, Grenzueberschreitung. Islam: Haram.' },
    ],
  },
  {
    id: 'toeten',
    name: 'Toeten',
    category: 'aktion',
    keywords: ['Killing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Aggression, Verdraengung, Ende einer Beziehung. NICHT woertlich.' },
    ],
  },
  {
    id: 'schreien',
    name: 'Schreien',
    category: 'aktion',
    keywords: ['Screaming'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Hilferuf, unterdrueckte Wut, Machtlosigkeit.' },
    ],
  },
  {
    id: 'verstecken',
    name: 'Verstecken',
    category: 'aktion',
    keywords: ['Hiding'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Vermeidung, Scham, Geheimnisse. Islam: Suende verbergen.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Vermeidung, Scham, Geheimnisse. Islam: Suende verbergen.' },
    ],
  },
  {
    id: 'reisen',
    name: 'Reisen',
    category: 'aktion',
    keywords: ['Traveling'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Lebensreise, Veraenderung, Suche. Islam: Hijra, Pilgerfahrt.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Lebensreise, Veraenderung, Suche. Islam: Hijra, Pilgerfahrt.' },
    ],
  },
  {
    id: 'sprechen',
    name: 'Sprechen',
    category: 'aktion',
    keywords: ['Speaking'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Kommunikation, Selbstausdruck. Unfaehigkeit zu sprechen = Machtlosigkeit.' },
    ],
  },
  {
    id: 'mutter',
    name: 'Mutter',
    category: 'person',
    keywords: ['Mother'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Urquelle, Nahrung, Unbewusstes. Freud: Oedipus. Jung: Grosser Mutterarchetyp.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Urquelle, Nahrung, Unbewusstes. Freud: Oedipus. Jung: Grosser Mutterarchetyp.' },
    ],
  },
  {
    id: 'vater',
    name: 'Vater',
    category: 'person',
    keywords: ['Father'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Autoritaet, Gesetz, Schutz. Freud: Ueber-Ich. Islam: Respekt.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Autoritaet, Gesetz, Schutz. Freud: Ueber-Ich. Islam: Respekt.' },
    ],
  },
  {
    id: 'fremder',
    name: 'Fremder',
    category: 'person',
    keywords: ['Stranger'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Unbekannter Aspekt des Selbst, Schatten. Islam: Engel oder Dschinn.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Unbekannter Aspekt des Selbst, Schatten. Islam: Engel oder Dschinn.' },
    ],
  },
  {
    id: 'toter',
    name: 'Toter',
    category: 'person',
    keywords: ['Dead person'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verdraengtes, Abschied, Botschaft. Islam: Warnung oder Bitte um Dua.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verdraengtes, Abschied, Botschaft. Islam: Warnung oder Bitte um Dua.' },
    ],
  },
  {
    id: 'arzt',
    name: 'Arzt',
    category: 'person',
    keywords: ['Doctor'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Heilung, Autoritaet, Selbstheilung. Islam: Allah als Heiler (Ash-Shafi).' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Heilung, Autoritaet, Selbstheilung. Islam: Allah als Heiler (Ash-Shafi).' },
    ],
  },
  {
    id: 'lehrer',
    name: 'Lehrer',
    category: 'person',
    keywords: ['Teacher'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weisheit, Fuehrung, innerer Mentor. Islam: Gelehrter.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Weisheit, Fuehrung, innerer Mentor. Islam: Gelehrter.' },
    ],
  },
  {
    id: 'koenig',
    name: 'Koenig',
    category: 'person',
    keywords: ['King'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Macht, Selbst, hoehere Autoritaet. Islam: Herrscher, Allah.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Macht, Selbst, hoehere Autoritaet. Islam: Herrscher, Allah.' },
    ],
  },
  {
    id: 'koenigin',
    name: 'Koenigin',
    category: 'person',
    keywords: ['Queen'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weibliche Macht, Anima, Muetterlichkeit.' },
    ],
  },
  {
    id: 'polizist',
    name: 'Polizist',
    category: 'person',
    keywords: ['Police'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Gewissen, Ueber-Ich, Autoritaet, Regel.' },
    ],
  },
  {
    id: 'prophet',
    name: 'Prophet',
    category: 'person',
    keywords: ['Prophet'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Goettliche Botschaft, hoechste Fuehrung. Islam: Segen, gutes Zeichen.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Goettliche Botschaft, hoechste Fuehrung. Islam: Segen, gutes Zeichen.' },
    ],
  },
  {
    id: 'teufel',
    name: 'Teufel',
    category: 'person',
    keywords: ['Devil'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Versuchung, Schatten, verdraengtes Boeses. Islam: Iblis, Waswas.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Versuchung, Schatten, verdraengtes Boeses. Islam: Iblis, Waswas.' },
    ],
  },
  {
    id: 'grossvater',
    name: 'Grossvater',
    category: 'person',
    keywords: ['Grandfather'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ahne, Weisheit, Tradition, Senex-Archetyp.' },
    ],
  },
  {
    id: 'grossmutter',
    name: 'Grossmutter',
    category: 'person',
    keywords: ['Grandmother'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weisheit, Schutz, alte Frau-Archetyp.' },
    ],
  },
  {
    id: 'bruder',
    name: 'Bruder',
    category: 'person',
    keywords: ['Brother'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Rivalitaet, Verbundenheit. Islam: Glaubensbruder. Bibel: Kain/Abel.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Rivalitaet, Verbundenheit. Islam: Glaubensbruder. Bibel: Kain/Abel.' },
    ],
  },
  {
    id: 'schwester',
    name: 'Schwester',
    category: 'person',
    keywords: ['Sister'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weiblicher Aspekt, Verbundenheit, Anima.' },
    ],
  },
  {
    id: 'ehepartner',
    name: 'Ehepartner',
    category: 'person',
    keywords: ['Spouse'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Partnerschaft, Integration, Anima/Animus. Islam: Sakina.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Partnerschaft, Integration, Anima/Animus. Islam: Sakina.' },
    ],
  },
  {
    id: 'geliebter',
    name: 'Geliebter',
    category: 'person',
    keywords: ['Lover'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Sehnsucht, Eros, Projektion. Sufi: goettliche Liebe.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.NABULSI, text: 'Sehnsucht, Eros, Projektion. Sufi: goettliche Liebe.' },
    ],
  },
  {
    id: 'bett',
    name: 'Bett',
    category: 'objekt',
    keywords: ['Bed'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Ruhe, Sexualitaet, Krankheit. Islam: Ehefrau. Freud: sexuelles Symbol.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ruhe, Sexualitaet, Krankheit. Islam: Ehefrau. Freud: sexuelles Symbol.' },
    ],
  },
  {
    id: 'schwert',
    name: 'Schwert',
    category: 'objekt',
    keywords: ['Sword'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Macht, Gerechtigkeit, Trennung. Islam: Autoritaet. Bibel: Wort Gottes.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Macht, Gerechtigkeit, Trennung. Islam: Autoritaet. Bibel: Wort Gottes.' },
    ],
  },
  {
    id: 'ring',
    name: 'Ring',
    category: 'objekt',
    keywords: ['Ring'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Bindung, Ehe, Ewigkeit. Islam: Autoritaet, Siegel. Tolkien: Macht.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Bindung, Ehe, Ewigkeit. Islam: Autoritaet, Siegel. Tolkien: Macht.' },
    ],
  },
  {
    id: 'buch',
    name: 'Buch',
    category: 'objekt',
    keywords: ['Book'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Wissen, Lebensweg. Islam: Buch der Taten. Bibel: Buch des Lebens.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Wissen, Lebensweg. Islam: Buch der Taten. Bibel: Buch des Lebens.' },
    ],
  },
  {
    id: 'uhr',
    name: 'Uhr',
    category: 'objekt',
    keywords: ['Clock'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Zeit, Vergaenglichkeit, Dringlichkeit, Deadline.' },
    ],
  },
  {
    id: 'telefon',
    name: 'Telefon',
    category: 'objekt',
    keywords: ['Phone'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Kommunikation, Botschaft, Verbindung. Klingeln=Ruf des Unbewussten.' },
    ],
  },
  {
    id: 'flugzeug',
    name: 'Flugzeug',
    category: 'objekt',
    keywords: ['Airplane'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Grosse Ambitionen, Reise, Perspektivwechsel. Absturz=Versagensangst.' },
    ],
  },
  {
    id: 'zug',
    name: 'Zug',
    category: 'objekt',
    keywords: ['Train'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Lebensreise, Bestimmung. Verpasster Zug=verpasste Chance.' },
    ],
  },
  {
    id: 'schiff',
    name: 'Schiff',
    category: 'objekt',
    keywords: ['Ship'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Lebensreise, Emotionen. Islam: Arche Noah. Schiffbruch=Krise.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Lebensreise, Emotionen. Islam: Arche Noah. Schiffbruch=Krise.' },
    ],
  },
  {
    id: 'messer',
    name: 'Messer',
    category: 'objekt',
    keywords: ['Knife'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Aggression, Trennung, Entscheidung. Freud: phallisch. Islam: Gefahr.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Aggression, Trennung, Entscheidung. Freud: phallisch. Islam: Gefahr.' },
    ],
  },
  {
    id: 'kreuz',
    name: 'Kreuz',
    category: 'objekt',
    keywords: ['Cross'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Leiden, Opfer, Erlosung. Christlich: Christus. Universell: Kreuzweg.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Leiden, Opfer, Erlosung. Christlich: Christus. Universell: Kreuzweg.' },
    ],
  },
  {
    id: 'krone',
    name: 'Krone',
    category: 'objekt',
    keywords: ['Crown'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Macht, Erfolg, Selbstverwirklichung. Islam: Ehre. Bibel: Krone des Lebens.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Macht, Erfolg, Selbstverwirklichung. Islam: Ehre. Bibel: Krone des Lebens.' },
    ],
  },
  {
    id: 'kerze',
    name: 'Kerze',
    category: 'objekt',
    keywords: ['Candle'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Hoffnung, Erkenntnis, Spiritualitaet. Islam: Wissen. Vergaenglichkeit.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Hoffnung, Erkenntnis, Spiritualitaet. Islam: Wissen. Vergaenglichkeit.' },
    ],
  },
  {
    id: 'kette',
    name: 'Kette',
    category: 'objekt',
    keywords: ['Chain'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Bindung, Gefangenschaft, Verbindung. Islam: Fesseln der Suende.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Bindung, Gefangenschaft, Verbindung. Islam: Fesseln der Suende.' },
    ],
  },
  {
    id: 'maske',
    name: 'Maske',
    category: 'objekt',
    keywords: ['Mask'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Persona, Verstellung, verborgenes Selbst. Jung: soziale Rolle.' },
    ],
  },
  {
    id: 'geschenk',
    name: 'Geschenk',
    category: 'objekt',
    keywords: ['Gift'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Anerkennung, Liebe, unerwartetes Glueck. Islam: Segen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Anerkennung, Liebe, unerwartetes Glueck. Islam: Segen.' },
    ],
  },
  {
    id: 'waffe',
    name: 'Waffe',
    category: 'objekt',
    keywords: ['Weapon'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Aggression, Macht, Schutz. Freud: phallisch. Islam: Autorität.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Aggression, Macht, Schutz. Freud: phallisch. Islam: Autorität.' },
    ],
  },
  {
    id: 'kleidung',
    name: 'Kleidung',
    category: 'objekt',
    keywords: ['Clothing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Persona, Rolle, Status. Islam: Froemmigkeit. Nackt=Verletzlichkeit.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Persona, Rolle, Status. Islam: Froemmigkeit. Nackt=Verletzlichkeit.' },
    ],
  },
  {
    id: 'brille',
    name: 'Brille',
    category: 'objekt',
    keywords: ['Glasses'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Klarheit, Einsicht, neue Perspektive.' },
    ],
  },
  {
    id: 'fahrstuhl',
    name: 'Fahrstuhl',
    category: 'objekt',
    keywords: ['Elevator'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Auf-/Abstieg, schneller Wechsel, Karriere.' },
    ],
  },
  {
    id: 'bruecke',
    name: 'Bruecke',
    category: 'objekt',
    keywords: ['Bridge'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Uebergang, Verbindung, Entscheidung. Islam: Sirat-Bruecke.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Uebergang, Verbindung, Entscheidung. Islam: Sirat-Bruecke.' },
    ],
  },
  {
    id: 'tor',
    name: 'Tor',
    category: 'objekt',
    keywords: ['Gate'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Uebergang, Schwelle, neues Kapitel. Islam: Paradiestor.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Uebergang, Schwelle, neues Kapitel. Islam: Paradiestor.' },
    ],
  },
  {
    id: 'koffer',
    name: 'Koffer',
    category: 'objekt',
    keywords: ['Suitcase'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Erinnerungen, Ballast, Reisebereitschaft, Identitaet.' },
    ],
  },
  {
    id: 'zaehne',
    name: 'Zaehne',
    category: 'koerper',
    keywords: ['Teeth'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Verlust, Angst, Selbstbild. Islam: obere=maennl. Familie, untere=weibl. Freud: Kastration.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verlust, Angst, Selbstbild. Islam: obere=maennl. Familie, untere=weibl. Freud: Kastration.' },
    ],
  },
  {
    id: 'haare',
    name: 'Haare',
    category: 'koerper',
    keywords: ['Hair'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Kraft, Identitaet, Sexualitaet. Islam: Ehre. Samson. Haarausfall=Machtverlust.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Kraft, Identitaet, Sexualitaet. Islam: Ehre. Samson. Haarausfall=Machtverlust.' },
    ],
  },
  {
    id: 'augen',
    name: 'Augen',
    category: 'koerper',
    keywords: ['Eyes'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Erkenntnis, Wahrheit, Seele. Islam: Basira (innere Sicht). Drittes Auge.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Erkenntnis, Wahrheit, Seele. Islam: Basira (innere Sicht). Drittes Auge.' },
    ],
  },
  {
    id: 'haende',
    name: 'Haende',
    category: 'koerper',
    keywords: ['Hands'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Handlungsfaehigkeit, Geben/Nehmen. Islam: rechte=gut, linke=schlecht.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Handlungsfaehigkeit, Geben/Nehmen. Islam: rechte=gut, linke=schlecht.' },
    ],
  },
  {
    id: 'herz',
    name: 'Herz',
    category: 'koerper',
    keywords: ['Heart'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Gefuehle, Liebe, Zentrum. Islam: Qalb, Sitz des Glaubens.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Gefuehle, Liebe, Zentrum. Islam: Qalb, Sitz des Glaubens.' },
    ],
  },
  {
    id: 'kopf',
    name: 'Kopf',
    category: 'koerper',
    keywords: ['Head'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Intellekt, Fuehrung, Identitaet. Islam: Oberhaupt.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Intellekt, Fuehrung, Identitaet. Islam: Oberhaupt.' },
    ],
  },
  {
    id: 'fuesse',
    name: 'Fuesse',
    category: 'koerper',
    keywords: ['Feet'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Fundament, Standfestigkeit, Richtung. Islam: Stabilität.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Fundament, Standfestigkeit, Richtung. Islam: Stabilität.' },
    ],
  },
  {
    id: 'ruecken',
    name: 'Ruecken',
    category: 'koerper',
    keywords: ['Back'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Unterstuetzung, Vergangenheit, Last. Rueckenschmerzen=Ueberlastung.' },
    ],
  },
  {
    id: 'brust',
    name: 'Brust',
    category: 'koerper',
    keywords: ['Chest'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Emotionen, Schutz, Nahrung. Islam: Sitz des Wissens (Sadr).' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Emotionen, Schutz, Nahrung. Islam: Sitz des Wissens (Sadr).' },
    ],
  },
  {
    id: 'bauch',
    name: 'Bauch',
    category: 'koerper',
    keywords: ['Belly'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Instinkt, Verdauung, Schwangerschaft. Bauchgefuehl.' },
    ],
  },
  {
    id: 'nase',
    name: 'Nase',
    category: 'koerper',
    keywords: ['Nose'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Intuition, Stolz, Neugier. Freud: phallisch. Islam: Ehre.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Intuition, Stolz, Neugier. Freud: phallisch. Islam: Ehre.' },
    ],
  },
  {
    id: 'ohr',
    name: 'Ohr',
    category: 'koerper',
    keywords: ['Ear'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Zuhoeren, Gehorsamkeit, Botschaft. Islam: Ehefrau, Tochter.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Zuhoeren, Gehorsamkeit, Botschaft. Islam: Ehefrau, Tochter.' },
    ],
  },
  {
    id: 'mund',
    name: 'Mund',
    category: 'koerper',
    keywords: ['Mouth'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Kommunikation, Nahrung, Ausdruck. Islam: Worte.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Kommunikation, Nahrung, Ausdruck. Islam: Worte.' },
    ],
  },
  {
    id: 'haut',
    name: 'Haut',
    category: 'koerper',
    keywords: ['Skin'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Grenze, Schutz, Identitaet. Hautkrankheit=innere Konflikte.' },
    ],
  },
  {
    id: 'nacktheit',
    name: 'Nacktheit',
    category: 'koerper',
    keywords: ['Nudity'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Verletzlichkeit, Scham, Authentizitaet. Islam: Bloßstellung.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verletzlichkeit, Scham, Authentizitaet. Islam: Bloßstellung.' },
    ],
  },
  {
    id: 'traenen',
    name: 'Traenen',
    category: 'koerper',
    keywords: ['Tears'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Emotionale Befreiung, Trauer, Reinigung.' },
    ],
  },
  {
    id: 'finger',
    name: 'Finger',
    category: 'koerper',
    keywords: ['Fingers'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Feinmotorik, Details, Familienbeziehungen. Islam: Gebetsperlen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Feinmotorik, Details, Familienbeziehungen. Islam: Gebetsperlen.' },
    ],
  },
  {
    id: 'bart',
    name: 'Bart',
    category: 'koerper',
    keywords: ['Beard'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Maennlichkeit, Weisheit, Autoritaet. Islam: Sunna, Ehre.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Maennlichkeit, Weisheit, Autoritaet. Islam: Sunna, Ehre.' },
    ],
  },
  {
    id: 'schule',
    name: 'Schule',
    category: 'ort',
    keywords: ['School'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Lernen, Leistungsdruck, Kindheit. Zurueck in der Schule=Lektion.' },
    ],
  },
  {
    id: 'friedhof',
    name: 'Friedhof',
    category: 'ort',
    keywords: ['Cemetery'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Vergaenglichkeit, Trauer, Ende. Islam: Erinnerung an Tod (Tathkira).' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Vergaenglichkeit, Trauer, Ende. Islam: Erinnerung an Tod (Tathkira).' },
    ],
  },
  {
    id: 'kirche',
    name: 'Kirche',
    category: 'ort',
    keywords: ['Church'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Spiritualitaet, Gemeinschaft, Heiligkeit. Bibel: Leib Christi.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Spiritualitaet, Gemeinschaft, Heiligkeit. Bibel: Leib Christi.' },
    ],
  },
  {
    id: 'moschee',
    name: 'Moschee',
    category: 'ort',
    keywords: ['Mosque'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Gebet, Gemeinschaft, spirituelle Reinheit. Islam: Bayt Allah.' },
    ],
  },
  {
    id: 'krankenhaus',
    name: 'Krankenhaus',
    category: 'ort',
    keywords: ['Hospital'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Heilung, Verletzlichkeit, Krise. Selbstheilung.' },
    ],
  },
  {
    id: 'gefaengnis',
    name: 'Gefaengnis',
    category: 'ort',
    keywords: ['Prison'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Gefangenschaft, Einschraenkung, Schuld. Islam: Pruefung. Selbstgemachte Kaefige.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Gefangenschaft, Einschraenkung, Schuld. Islam: Pruefung. Selbstgemachte Kaefige.' },
    ],
  },
  {
    id: 'hoehle',
    name: 'Hoehle',
    category: 'ort',
    keywords: ['Cave'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Unbewusstes, Schutz, Rueckzug. Islam: Sure Al-Kahf. Platon: Hoehlengleichnis.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Unbewusstes, Schutz, Rueckzug. Islam: Sure Al-Kahf. Platon: Hoehlengleichnis.' },
    ],
  },
  {
    id: 'markt',
    name: 'Markt',
    category: 'ort',
    keywords: ['Market'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Austausch, Wert, soziale Interaktion. Islam: Diesseits.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Austausch, Wert, soziale Interaktion. Islam: Diesseits.' },
    ],
  },
  {
    id: 'strand',
    name: 'Strand',
    category: 'ort',
    keywords: ['Beach'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Grenze Bewusstes/Unbewusstes, Entspannung, Uebergang.' },
    ],
  },
  {
    id: 'insel',
    name: 'Insel',
    category: 'ort',
    keywords: ['Island'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Isolation, Individualitaet, Rueckzug, Sehnsucht.' },
    ],
  },
  {
    id: 'turm',
    name: 'Turm',
    category: 'ort',
    keywords: ['Tower'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Ehrgeiz, Isolation, Ueberblick. Bibel: Turm zu Babel. Islam: Hochmut.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ehrgeiz, Isolation, Ueberblick. Bibel: Turm zu Babel. Islam: Hochmut.' },
    ],
  },
  {
    id: 'keller',
    name: 'Keller',
    category: 'ort',
    keywords: ['Basement'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Tiefes Unbewusstes, verdraengte Erinnerungen, Angst.' },
    ],
  },
  {
    id: 'dachboden',
    name: 'Dachboden',
    category: 'ort',
    keywords: ['Attic'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Hoehere Gedanken, vergessene Erinnerungen, Geist.' },
    ],
  },
  {
    id: 'labyrinth',
    name: 'Labyrinth',
    category: 'ort',
    keywords: ['Labyrinth'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verwirrung, Suche, Initiationsreise. Kreta: Minotaurus.' },
    ],
  },
  {
    id: 'palast',
    name: 'Palast',
    category: 'ort',
    keywords: ['Palace'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Reichtum, Macht, hoeheres Selbst. Islam: Paradies.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Reichtum, Macht, hoeheres Selbst. Islam: Paradies.' },
    ],
  },
  {
    id: 'ruine',
    name: 'Ruine',
    category: 'ort',
    keywords: ['Ruin'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verfall, Vergangenheit, Verlust. Wiederaufbau moeglich.' },
    ],
  },
  {
    id: 'flughafen',
    name: 'Flughafen',
    category: 'ort',
    keywords: ['Airport'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Uebergang, neue Phase, Fernweh, Abschied.' },
    ],
  },
  {
    id: 'weg',
    name: 'Weg',
    category: 'ort',
    keywords: ['Path'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Lebensweg, Entscheidung, Richtung. Islam: Sirat al-Mustaqim.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Lebensweg, Entscheidung, Richtung. Islam: Sirat al-Mustaqim.' },
    ],
  },
  {
    id: 'schlachtfeld',
    name: 'Schlachtfeld',
    category: 'ort',
    keywords: ['Battlefield'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Innerer Konflikt, Kampf, Entscheidung.' },
    ],
  },
  {
    id: 'krieg',
    name: 'Krieg',
    category: 'emotion',
    keywords: ['War'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Innerer Konflikt, Kampf der Werte. Islam: Dschihad an-Nafs.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Innerer Konflikt, Kampf der Werte. Islam: Dschihad an-Nafs.' },
    ],
  },
  {
    id: 'dunkelheit',
    name: 'Dunkelheit',
    category: 'emotion',
    keywords: ['Darkness'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Unbewusstes, Angst, Unwissenheit. Islam: Kufr. Bibel: Finsternis.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Unbewusstes, Angst, Unwissenheit. Islam: Kufr. Bibel: Finsternis.' },
    ],
  },
  {
    id: 'angst',
    name: 'Angst',
    category: 'emotion',
    keywords: ['Fear'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Unterdrueckte Gefuehle, Warnung, Wachstum. Islam: Taqwa (Gottesfurcht).' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Unterdrueckte Gefuehle, Warnung, Wachstum. Islam: Taqwa (Gottesfurcht).' },
    ],
  },
  {
    id: 'liebe',
    name: 'Liebe',
    category: 'emotion',
    keywords: ['Love'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verbundenheit, Sehnsucht, Ganzheit. Sufi: goettliche Liebe (Ishq).' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.NABULSI, text: 'Verbundenheit, Sehnsucht, Ganzheit. Sufi: goettliche Liebe (Ishq).' },
    ],
  },
  {
    id: 'einsamkeit',
    name: 'Einsamkeit',
    category: 'emotion',
    keywords: ['Loneliness'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Isolation, Selbstreflexion, Individuation.' },
    ],
  },
  {
    id: 'fliegen_koennen',
    name: 'Fliegen koennen',
    category: 'emotion',
    keywords: ['Ability to fly'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Freiheit, Transzendenz. Klartraum-Indikator.' },
    ],
  },
  {
    id: 'nacktsein_in_oeffentlichkeit',
    name: 'Nacktsein in Oeffentlichkeit',
    category: 'emotion',
    keywords: ['Public nudity'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Verletzlichkeit, Scham, Authentizitaet. Haeufigster Traum.' },
    ],
  },
  {
    id: 'verfolgt_werden',
    name: 'Verfolgt werden',
    category: 'emotion',
    keywords: ['Being pursued'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Verdraengung, ungeloestes Problem, Angst.' },
    ],
  },
  {
    id: 'zaehne_verlieren',
    name: 'Zaehne verlieren',
    category: 'emotion',
    keywords: ['Losing teeth'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Kontrollverlust, Alterung, Selbstbild. Islam: Familienverlust.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Kontrollverlust, Alterung, Selbstbild. Islam: Familienverlust.' },
    ],
  },
  {
    id: 'zu_spaet_kommen',
    name: 'Zu spaet kommen',
    category: 'emotion',
    keywords: ['Being late'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Versagensangst, verpasste Chance, Perfektionismus.' },
    ],
  },
  {
    id: 'nicht_schreien_koennen',
    name: 'Nicht schreien koennen',
    category: 'emotion',
    keywords: ['Unable to scream'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Machtlosigkeit, unterdrueckte Stimme.' },
    ],
  },
  {
    id: 'paradies',
    name: 'Paradies',
    category: 'emotion',
    keywords: ['Paradise'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Vollkommenheit, Sehnsucht, Belohnung. Islam: Janna. Bibel: Eden.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Vollkommenheit, Sehnsucht, Belohnung. Islam: Janna. Bibel: Eden.' },
    ],
  },
  {
    id: 'hoelle',
    name: 'Hoelle',
    category: 'emotion',
    keywords: ['Hell'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Strafe, Leid, innere Qual. Islam: Jahannam. Bibel: Gehenna.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Strafe, Leid, innere Qual. Islam: Jahannam. Bibel: Gehenna.' },
    ],
  },
  {
    id: 'farbe_gold',
    name: 'Farbe Gold',
    category: 'emotion',
    keywords: ['Color Gold'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weisheit, Wert, Goettlichkeit. Islam: Paradies. Alchemie: Opus Magnum.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Weisheit, Wert, Goettlichkeit. Islam: Paradies. Alchemie: Opus Magnum.' },
    ],
  },
  {
    id: 'farbe_weiss',
    name: 'Farbe Weiss',
    category: 'emotion',
    keywords: ['Color White'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Reinheit, Unschuld, Tod. Islam: Ihram. Tibetisch: Mitgefuehl.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Reinheit, Unschuld, Tod. Islam: Ihram. Tibetisch: Mitgefuehl.' },
    ],
  },
  {
    id: 'farbe_schwarz',
    name: 'Farbe Schwarz',
    category: 'emotion',
    keywords: ['Color Black'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Unbewusstes, Trauer, Macht. Islam: Kaaba. Alchemie: Nigredo.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Unbewusstes, Trauer, Macht. Islam: Kaaba. Alchemie: Nigredo.' },
    ],
  },
  {
    id: 'farbe_rot',
    name: 'Farbe Rot',
    category: 'emotion',
    keywords: ['Color Red'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Leidenschaft, Blut, Energie. Islam: Gefahr. China: Glueck.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Leidenschaft, Blut, Energie. Islam: Gefahr. China: Glueck.' },
    ],
  },
  {
    id: 'farbe_gruen',
    name: 'Farbe Gruen',
    category: 'emotion',
    keywords: ['Color Green'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Wachstum, Islam, Natur. Islam: Paradies, Prophet. Hoffnung.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wachstum, Islam, Natur. Islam: Paradies, Prophet. Hoffnung.' },
    ],
  },
  {
    id: 'farbe_blau',
    name: 'Farbe Blau',
    category: 'emotion',
    keywords: ['Color Blue'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Spiritualitaet, Himmel, Ruhe. Islam: Himmel. Tibetisch: Akasha.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Spiritualitaet, Himmel, Ruhe. Islam: Himmel. Tibetisch: Akasha.' },
    ],
  },
  {
    id: 'zahl_3',
    name: 'Zahl 3',
    category: 'emotion',
    keywords: ['Number 3'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Dreieinigkeit, Synthese, Kreativitaet. Islam: Wiederholung. Pythagoras.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Dreieinigkeit, Synthese, Kreativitaet. Islam: Wiederholung. Pythagoras.' },
    ],
  },
  {
    id: 'zahl_7',
    name: 'Zahl 7',
    category: 'emotion',
    keywords: ['Number 7'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Vollstaendigkeit, Spiritualitaet. Islam: 7 Himmel. Bibel: Schoepfung.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Vollstaendigkeit, Spiritualitaet. Islam: 7 Himmel. Bibel: Schoepfung.' },
    ],
  },
  {
    id: 'zahl_40',
    name: 'Zahl 40',
    category: 'emotion',
    keywords: ['Number 40'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Pruefung, Transformation. Islam: 40 Tage. Bibel: 40 Tage Wueste.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Pruefung, Transformation. Islam: 40 Tage. Bibel: 40 Tage Wueste.' },
    ],
  },
  {
    id: 'hai',
    name: 'Hai',
    category: 'tier',
    keywords: ['Shark'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Bedrohung, Aggression, unterbewusste Angst.' },
    ],
  },
  {
    id: 'papagei',
    name: 'Papagei',
    category: 'tier',
    keywords: ['Parrot'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Nachahmung, Klatsch, bunte Kommunikation.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Nachahmung, Klatsch, bunte Kommunikation.' },
    ],
  },
  {
    id: 'fuchs',
    name: 'Fuchs',
    category: 'tier',
    keywords: ['Fox'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'List, Cleverness, Taeuschung. Islam: listiger Mensch.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'List, Cleverness, Taeuschung. Islam: listiger Mensch.' },
    ],
  },
  {
    id: 'hirsch',
    name: 'Hirsch',
    category: 'tier',
    keywords: ['Deer'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Sanftmut, Grazie, spirituelle Suche. Schamanisch: Fuehrer.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Sanftmut, Grazie, spirituelle Suche. Schamanisch: Fuehrer.' },
    ],
  },
  {
    id: 'krokodil',
    name: 'Krokodil',
    category: 'tier',
    keywords: ['Crocodile'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verborgene Gefahr, Betrug, Urinstinkte. Islam: Polizist/Richter.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verborgene Gefahr, Betrug, Urinstinkte. Islam: Polizist/Richter.' },
    ],
  },
  {
    id: 'maus',
    name: 'Maus',
    category: 'tier',
    keywords: ['Mouse'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Kleines Problem, Scheu, Verlust. Islam: unmoralische Frau.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Kleines Problem, Scheu, Verlust. Islam: unmoralische Frau.' },
    ],
  },
  {
    id: 'stier',
    name: 'Stier',
    category: 'tier',
    keywords: ['Bull'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Kraft, Sturheit, Fertilitaet. Islam: starker Mann.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Kraft, Sturheit, Fertilitaet. Islam: starker Mann.' },
    ],
  },
  {
    id: 'wal',
    name: 'Wal',
    category: 'tier',
    keywords: ['Whale'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Tiefes Unbewusstes, Yunus/Jona, spirituelle Reise.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Tiefes Unbewusstes, Yunus/Jona, spirituelle Reise.' },
    ],
  },
  {
    id: 'schwan',
    name: 'Schwan',
    category: 'tier',
    keywords: ['Swan'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Schoenheit, Transformation, Reinheit. Sterben des Schwans.' },
    ],
  },
  {
    id: 'drache',
    name: 'Drache',
    category: 'tier',
    keywords: ['Dragon'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Urkraft, Hüter, Transformation. China: Glück. West: Gefahr.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.CHINESE_ZODIAC, text: 'Urkraft, Hüter, Transformation. China: Glück. West: Gefahr.' },
    ],
  },
  {
    id: 'wespe',
    name: 'Wespe',
    category: 'tier',
    keywords: ['Wasp'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Aggression, Gefahr, Feindseligkeit.' },
    ],
  },
  {
    id: 'igel',
    name: 'Igel',
    category: 'tier',
    keywords: ['Hedgehog'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Selbstschutz, Stacheln, Isolation.' },
    ],
  },
  {
    id: 'gans',
    name: 'Gans',
    category: 'tier',
    keywords: ['Goose'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wachsamkeit, Gemeinschaft, Treue.' },
    ],
  },
  {
    id: 'flamingo',
    name: 'Flamingo',
    category: 'tier',
    keywords: ['Flamingo'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Eleganz, Balance, Einzigartigkeit.' },
    ],
  },
  {
    id: 'hase',
    name: 'Hase',
    category: 'tier',
    keywords: ['Rabbit'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.CHINESE_ZODIAC, text: 'Fruchtbarkeit, Angst, Schnelligkeit. Mondtier.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Fruchtbarkeit, Angst, Schnelligkeit. Mondtier.' },
    ],
  },
  {
    id: 'fledermaus',
    name: 'Fledermaus',
    category: 'tier',
    keywords: ['Bat'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.CHINESE_ZODIAC, text: 'Transformation, Nacht, Wiedergeburt. China: Glueck.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Transformation, Nacht, Wiedergeburt. China: Glueck.' },
    ],
  },
  {
    id: 'pfau',
    name: 'Pfau',
    category: 'tier',
    keywords: ['Peacock'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Stolz, Schoenheit, Eitelkeit. Islam: Paradiesvogel.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Stolz, Schoenheit, Eitelkeit. Islam: Paradiesvogel.' },
    ],
  },
  {
    id: 'wurm',
    name: 'Wurm',
    category: 'tier',
    keywords: ['Worm'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Zerfall, Niedrige Triebe, Erneuerung. Bodenfruchtbarkeit.' },
    ],
  },
  {
    id: 'libelle',
    name: 'Libelle',
    category: 'tier',
    keywords: ['Dragonfly'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Veraenderung, Leichtigkeit, Illusion. Japan: Mut.' },
    ],
  },
  {
    id: 'flut',
    name: 'Flut',
    category: 'natur',
    keywords: ['Flood'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Ueberwältigung, emotionale Ueberflutung. Bibel: Sintflut.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ueberwältigung, emotionale Ueberflutung. Bibel: Sintflut.' },
    ],
  },
  {
    id: 'tsunami',
    name: 'Tsunami',
    category: 'natur',
    keywords: ['Tsunami'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Unterdrueckte Emotionen brechen durch, Katastrophe.' },
    ],
  },
  {
    id: 'fruehling',
    name: 'Fruehling',
    category: 'natur',
    keywords: ['Spring'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Neubeginn, Erwachen, Hoffnung, Jugend.' },
    ],
  },
  {
    id: 'herbst',
    name: 'Herbst',
    category: 'natur',
    keywords: ['Autumn'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Vergaenglichkeit, Ernte, Loslassen, Reife.' },
    ],
  },
  {
    id: 'winter',
    name: 'Winter',
    category: 'natur',
    keywords: ['Winter'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Rueckzug, Tod, Stille, innere Arbeit.' },
    ],
  },
  {
    id: 'sommer',
    name: 'Sommer',
    category: 'natur',
    keywords: ['Summer'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Fuelle, Lebensfreude, Reife, Hoehepunkt.' },
    ],
  },
  {
    id: 'kristall',
    name: 'Kristall',
    category: 'natur',
    keywords: ['Crystal'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Klarheit, Reinheit, innere Ordnung.' },
    ],
  },
  {
    id: 'perle',
    name: 'Perle',
    category: 'natur',
    keywords: ['Pearl'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Weisheit, Wert, Traenen. Islam: Paradiesjuwel.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weisheit, Wert, Traenen. Islam: Paradiesjuwel.' },
    ],
  },
  {
    id: 'wasserfall',
    name: 'Wasserfall',
    category: 'natur',
    keywords: ['Waterfall'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Emotionale Befreiung, Reinigung, Kraft.' },
    ],
  },
  {
    id: 'pilz',
    name: 'Pilz',
    category: 'natur',
    keywords: ['Mushroom'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wachstum im Dunkeln, Unbewusstes, Transformation.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Wachstum im Dunkeln, Unbewusstes, Transformation.' },
    ],
  },
  {
    id: 'rose',
    name: 'Rose',
    category: 'natur',
    keywords: ['Rose'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.NABULSI, text: 'Liebe, Schoenheit, Schmerz (Dornen). Sufi: goettliche Liebe.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Liebe, Schoenheit, Schmerz (Dornen). Sufi: goettliche Liebe.' },
    ],
  },
  {
    id: 'lotus',
    name: 'Lotus',
    category: 'natur',
    keywords: ['Lotus'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Erleuchtung, Reinheit aus Schmutz. Buddhismus: Erwachen.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Erleuchtung, Reinheit aus Schmutz. Buddhismus: Erwachen.' },
    ],
  },
  {
    id: 'sturm',
    name: 'Sturm',
    category: 'natur',
    keywords: ['Storm'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Innerer Aufruhr, Veraenderung, Reinigung.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Innerer Aufruhr, Veraenderung, Reinigung.' },
    ],
  },
  {
    id: 'sumpf',
    name: 'Sumpf',
    category: 'natur',
    keywords: ['Swamp'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Stagnation, emotionaler Morast, Gefahr.' },
    ],
  },
  {
    id: 'diamant',
    name: 'Diamant',
    category: 'natur',
    keywords: ['Diamond'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Staerke, Unvergaenglichkeit, Klarheit, hoher Wert.' },
    ],
  },
  {
    id: 'autofahren',
    name: 'Autofahren',
    category: 'aktion',
    keywords: ['Driving'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Lebenssteuerung, Kontrolle, Richtung.' },
    ],
  },
  {
    id: 'kochen',
    name: 'Kochen',
    category: 'aktion',
    keywords: ['Cooking'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Transformation, Nahrung, Kreativitaet.' },
    ],
  },
  {
    id: 'umziehen',
    name: 'Umziehen',
    category: 'aktion',
    keywords: ['Moving house'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Veraenderung, neuer Lebensabschnitt.' },
    ],
  },
  {
    id: 'tauchen',
    name: 'Tauchen',
    category: 'aktion',
    keywords: ['Diving'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Tiefes Eintauchen ins Unbewusste, Mut.' },
    ],
  },
  {
    id: 'fangen',
    name: 'Fangen',
    category: 'aktion',
    keywords: ['Catching'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Kontrolle, Erfolg, Besitz ergreifen.' },
    ],
  },
  {
    id: 'verlaufen',
    name: 'Verlaufen',
    category: 'aktion',
    keywords: ['Getting lost'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Orientierungslosigkeit, Identitaetskrise.' },
    ],
  },
  {
    id: 'aufwachen',
    name: 'Aufwachen',
    category: 'aktion',
    keywords: ['Waking up'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Falsches Erwachen, Bewusstwerden, Erkenntnis.' },
    ],
  },
  {
    id: 'fangen_spielen',
    name: 'Fangen spielen',
    category: 'aktion',
    keywords: ['Playing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Inneres Kind, Leichtigkeit, Kreativitaet.' },
    ],
  },
  {
    id: 'putzen',
    name: 'Putzen',
    category: 'aktion',
    keywords: ['Cleaning'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Reinigung, Ordnung schaffen, Schuld bereinigen.' },
    ],
  },
  {
    id: 'pflanzen',
    name: 'Pflanzen',
    category: 'aktion',
    keywords: ['Planting'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Samen legen, Zukunft gestalten, Hoffnung.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Samen legen, Zukunft gestalten, Hoffnung.' },
    ],
  },
  {
    id: 'schneiden',
    name: 'Schneiden',
    category: 'aktion',
    keywords: ['Cutting'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Trennung, Entscheidung, Befreiung.' },
    ],
  },
  {
    id: 'umarmung',
    name: 'Umarmung',
    category: 'aktion',
    keywords: ['Embrace'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Akzeptanz, Liebe, Integration.' },
    ],
  },
  {
    id: 'kuss',
    name: 'Kuss',
    category: 'aktion',
    keywords: ['Kiss'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Liebe, Vereinigung, Versoehnung. Freud: erotisch.' },
    ],
  },
  {
    id: 'schlafen',
    name: 'Schlafen',
    category: 'aktion',
    keywords: ['Sleeping'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Traum im Traum, Bewusstlosigkeit, Verweigerung.' },
    ],
  },
  {
    id: 'aufraeumen',
    name: 'Aufräumen',
    category: 'aktion',
    keywords: ['Tidying'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Innere Ordnung, Vergangenheit sortieren.' },
    ],
  },
  {
    id: 'heilen',
    name: 'Heilen',
    category: 'aktion',
    keywords: ['Healing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Selbstheilung, Vergebung, Ganzwerdung.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Selbstheilung, Vergebung, Ganzwerdung.' },
    ],
  },
  {
    id: 'ertrinken',
    name: 'Ertrinken',
    category: 'aktion',
    keywords: ['Drowning'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Ueberwältigung durch Emotionen, Hilflosigkeit.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ueberwältigung durch Emotionen, Hilflosigkeit.' },
    ],
  },
  {
    id: 'schreiben',
    name: 'Schreiben',
    category: 'aktion',
    keywords: ['Writing'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Selbstausdruck, Festhalten, Botschaft. Islam: Aufzeichnung der Taten.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Selbstausdruck, Festhalten, Botschaft. Islam: Aufzeichnung der Taten.' },
    ],
  },
  {
    id: 'lesen',
    name: 'Lesen',
    category: 'aktion',
    keywords: ['Reading'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Wissenssuche, Botschaft empfangen. Islam: Iqra (Lies!).' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wissenssuche, Botschaft empfangen. Islam: Iqra (Lies!).' },
    ],
  },
  {
    id: 'fasten',
    name: 'Fasten',
    category: 'aktion',
    keywords: ['Fasting'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Reinigung, Disziplin, Spiritualitaet. Islam: Ramadan.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Reinigung, Disziplin, Spiritualitaet. Islam: Ramadan.' },
    ],
  },
  {
    id: 'bauen',
    name: 'Bauen',
    category: 'aktion',
    keywords: ['Building'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Aufbau, Kreativitaet, Lebenswerk.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Aufbau, Kreativitaet, Lebenswerk.' },
    ],
  },
  {
    id: 'zerstoeren',
    name: 'Zerstoeren',
    category: 'aktion',
    keywords: ['Destroying'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wut, Befreiung, Ende. Shiva-Aspekt.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Wut, Befreiung, Ende. Shiva-Aspekt.' },
    ],
  },
  {
    id: 'fotografieren',
    name: 'Fotografieren',
    category: 'aktion',
    keywords: ['Photographing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Festhalten, Erinnerung, Perspektive.' },
    ],
  },
  {
    id: 'telefonieren',
    name: 'Telefonieren',
    category: 'aktion',
    keywords: ['Calling'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Kommunikationswunsch, wichtige Nachricht.' },
    ],
  },
  {
    id: 'warten',
    name: 'Warten',
    category: 'aktion',
    keywords: ['Waiting'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Geduld, Unsicherheit, Erwartung.' },
    ],
  },
  {
    id: 'operiert_werden',
    name: 'Operiert werden',
    category: 'aktion',
    keywords: ['Having surgery'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Tiefe Veraenderung, Eingriff, Heilung.' },
    ],
  },
  {
    id: 'tragen',
    name: 'Tragen',
    category: 'aktion',
    keywords: ['Carrying'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Last, Verantwortung, Bürde. Atlas-Motiv.' },
    ],
  },
  {
    id: 'schlafen_gehen',
    name: 'Schlafen gehen',
    category: 'aktion',
    keywords: ['Going to sleep'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Uebergang, Loslassen, Rueckzug ins Unbewusste.' },
    ],
  },
  {
    id: 'springen',
    name: 'Springen',
    category: 'aktion',
    keywords: ['Jumping'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Risikobereitschaft, Ueberwindung, Sprung ins Unbekannte.' },
    ],
  },
  {
    id: 'verloren_gehen',
    name: 'Verloren gehen',
    category: 'aktion',
    keywords: ['Getting lost'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Desorientierung, Suche nach Identitaet.' },
    ],
  },
  {
    id: 'chef',
    name: 'Chef',
    category: 'person',
    keywords: ['Boss'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Autoritaet, Ueber-Ich, Kontrolle.' },
    ],
  },
  {
    id: 'ex_partner',
    name: 'Ex-Partner',
    category: 'person',
    keywords: ['Ex-partner'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Unverarbeitetes, alte Muster, Sehnsucht.' },
    ],
  },
  {
    id: 'promi',
    name: 'Promi',
    category: 'person',
    keywords: ['Celebrity'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wuensche, Idealisierung, Projektion.' },
    ],
  },
  {
    id: 'zwilling',
    name: 'Zwilling',
    category: 'person',
    keywords: ['Twin'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Doppelgaenger, Schatten, zweite Seite des Selbst.' },
    ],
  },
  {
    id: 'soldat',
    name: 'Soldat',
    category: 'person',
    keywords: ['Soldier'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Disziplin, Kampf, innerer Krieger.' },
    ],
  },
  {
    id: 'dieb',
    name: 'Dieb',
    category: 'person',
    keywords: ['Thief'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verlustangst, Eindringling, Schatten. Islam: Warnung.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verlustangst, Eindringling, Schatten. Islam: Warnung.' },
    ],
  },
  {
    id: 'richter',
    name: 'Richter',
    category: 'person',
    keywords: ['Judge'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Gewissen, Urteil, Gerechtigkeit. Islam: Qadi.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Gewissen, Urteil, Gerechtigkeit. Islam: Qadi.' },
    ],
  },
  {
    id: 'heiler',
    name: 'Heiler',
    category: 'person',
    keywords: ['Healer'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Selbstheilung, Weisheit, schamanische Kraft.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Selbstheilung, Weisheit, schamanische Kraft.' },
    ],
  },
  {
    id: 'hexe',
    name: 'Hexe',
    category: 'person',
    keywords: ['Witch'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verdraengte weibliche Macht, Angst, Transformation.' },
    ],
  },
  {
    id: 'riese',
    name: 'Riese',
    category: 'person',
    keywords: ['Giant'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Uebermacht, Einschuechterung, archaische Kraft.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Uebermacht, Einschuechterung, archaische Kraft.' },
    ],
  },
  {
    id: 'zwerg',
    name: 'Zwerg',
    category: 'person',
    keywords: ['Dwarf'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verborgene Kraefte, Erdverbundenheit. Alchemie: innere Arbeit.' },
    ],
  },
  {
    id: 'braut',
    name: 'Braut',
    category: 'person',
    keywords: ['Bride'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Anima, Vereinigung, neuer Beginn. Islam: Freude.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Anima, Vereinigung, neuer Beginn. Islam: Freude.' },
    ],
  },
  {
    id: 'braeutigam',
    name: 'Braeutigam',
    category: 'person',
    keywords: ['Groom'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Animus, Verantwortung, Reife.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Animus, Verantwortung, Reife.' },
    ],
  },
  {
    id: 'nachbar',
    name: 'Nachbar',
    category: 'person',
    keywords: ['Neighbor'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Naehe, soziale Beziehungen, Projektion.' },
    ],
  },
  {
    id: 'reiter',
    name: 'Reiter',
    category: 'person',
    keywords: ['Rider'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Kontrolle ueber Instinkte, Held. Bibel: Apokalypse-Reiter.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Kontrolle ueber Instinkte, Held. Bibel: Apokalypse-Reiter.' },
    ],
  },
  {
    id: 'wanderer',
    name: 'Wanderer',
    category: 'person',
    keywords: ['Wanderer'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Sucher, Lebensreise, Pilger. Sufi: Salik.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.NABULSI, text: 'Sucher, Lebensreise, Pilger. Sufi: Salik.' },
    ],
  },
  {
    id: 'schatten',
    name: 'Schatten',
    category: 'person',
    keywords: ['Shadow figure'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verdraengtes, dunkle Seite, Jung: Schatten-Archetyp.' },
    ],
  },
  {
    id: 'alte_frau',
    name: 'Alte Frau',
    category: 'person',
    keywords: ['Old woman'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weisheit, Tod, Mutter-Archetyp. Baba Yaga.' },
    ],
  },
  {
    id: 'alter_mann',
    name: 'Alter Mann',
    category: 'person',
    keywords: ['Old man'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weiser, Senex, Mentor. Islam: Sheikh.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Weiser, Senex, Mentor. Islam: Sheikh.' },
    ],
  },
  {
    id: 'clown',
    name: 'Clown',
    category: 'person',
    keywords: ['Clown'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Trickster, Maskierung, verborgene Trauer.' },
    ],
  },
  {
    id: 'brunnen',
    name: 'Brunnen',
    category: 'objekt',
    keywords: ['Well'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Tiefes Wissen, Quelle, Unbewusstes. Islam: Zamzam.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Tiefes Wissen, Quelle, Unbewusstes. Islam: Zamzam.' },
    ],
  },
  {
    id: 'grab',
    name: 'Grab',
    category: 'objekt',
    keywords: ['Grave'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Vergaenglichkeit, Ende, Transformation. Islam: Barzakh.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Vergaenglichkeit, Ende, Transformation. Islam: Barzakh.' },
    ],
  },
  {
    id: 'altar',
    name: 'Altar',
    category: 'objekt',
    keywords: ['Altar'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Opfer, Hingabe, Heiligkeit.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Opfer, Hingabe, Heiligkeit.' },
    ],
  },
  {
    id: 'fenster',
    name: 'Fenster',
    category: 'objekt',
    keywords: ['Window'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Perspektive, Einsicht, Oeffnung zur Welt.' },
    ],
  },
  {
    id: 'karte',
    name: 'Karte',
    category: 'objekt',
    keywords: ['Map'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Orientierung, Lebensplan, Richtung.' },
    ],
  },
  {
    id: 'computer',
    name: 'Computer',
    category: 'objekt',
    keywords: ['Computer'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Logik, Information, moderne Kommunikation.' },
    ],
  },
  {
    id: 'schatz',
    name: 'Schatz',
    category: 'objekt',
    keywords: ['Treasure'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Innerer Wert, verborgenes Potenzial. Islam: Wissen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Innerer Wert, verborgenes Potenzial. Islam: Wissen.' },
    ],
  },
  {
    id: 'rad',
    name: 'Rad',
    category: 'objekt',
    keywords: ['Wheel'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Zyklus, Schicksal, Karma. Buddhismus: Dharma-Rad.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Zyklus, Schicksal, Karma. Buddhismus: Dharma-Rad.' },
    ],
  },
  {
    id: 'anker',
    name: 'Anker',
    category: 'objekt',
    keywords: ['Anchor'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Stabilitaet, Hoffnung, Verwurzelung.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Stabilitaet, Hoffnung, Verwurzelung.' },
    ],
  },
  {
    id: 'flagge',
    name: 'Flagge',
    category: 'objekt',
    keywords: ['Flag'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Identitaet, Zugehoerigkeit, Ideale.' },
    ],
  },
  {
    id: 'puppe',
    name: 'Puppe',
    category: 'objekt',
    keywords: ['Doll'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Kindheit, Manipulation, inneres Kind.' },
    ],
  },
  {
    id: 'teppich',
    name: 'Teppich',
    category: 'objekt',
    keywords: ['Carpet'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Komfort, Tradition, Gebet. Islam: Gebetsteppich.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Komfort, Tradition, Gebet. Islam: Gebetsteppich.' },
    ],
  },
  {
    id: 'nadel',
    name: 'Nadel',
    category: 'objekt',
    keywords: ['Needle'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Praezision, Schmerz, Reparatur.' },
    ],
  },
  {
    id: 'schere',
    name: 'Schere',
    category: 'objekt',
    keywords: ['Scissors'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Trennung, Entscheidung, Schnitt.' },
    ],
  },
  {
    id: 'regenschirm',
    name: 'Regenschirm',
    category: 'objekt',
    keywords: ['Umbrella'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Schutz, Vorbereitung, emotionale Abschirmung.' },
    ],
  },
  {
    id: 'geige',
    name: 'Geige',
    category: 'objekt',
    keywords: ['Violin'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Harmonie, Emotionen, Seele. Romantik.' },
    ],
  },
  {
    id: 'trommel',
    name: 'Trommel',
    category: 'objekt',
    keywords: ['Drum'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Herzschlag, Rhythmus, schamanische Reise.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Herzschlag, Rhythmus, schamanische Reise.' },
    ],
  },
  {
    id: 'seil',
    name: 'Seil',
    category: 'objekt',
    keywords: ['Rope'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verbindung, Rettung, Einschraenkung. Islam: Seil Allahs.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verbindung, Rettung, Einschraenkung. Islam: Seil Allahs.' },
    ],
  },
  {
    id: 'muenze',
    name: 'Muenze',
    category: 'objekt',
    keywords: ['Coin'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wert, Entscheidung (Kopf/Zahl), Glueck.' },
    ],
  },
  {
    id: 'spielzeug',
    name: 'Spielzeug',
    category: 'objekt',
    keywords: ['Toy'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Kindheit, Nostalgie, inneres Kind.' },
    ],
  },
  {
    id: 'krug',
    name: 'Krug',
    category: 'objekt',
    keywords: ['Jug'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Fuelle, Nahrung, Weiblichkeit. Islam: Wudu-Krug.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Fuelle, Nahrung, Weiblichkeit. Islam: Wudu-Krug.' },
    ],
  },
  {
    id: 'laterne',
    name: 'Laterne',
    category: 'objekt',
    keywords: ['Lantern'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Fuehrung im Dunkeln, Suche, Diogenes.' },
    ],
  },
  {
    id: 'zaun',
    name: 'Zaun',
    category: 'objekt',
    keywords: ['Fence'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Grenze, Schutz, Einschraenkung.' },
    ],
  },
  {
    id: 'kissen',
    name: 'Kissen',
    category: 'objekt',
    keywords: ['Pillow'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ruhe, Komfort, Rueckzug. Japan: Traumkissen.' },
    ],
  },
  {
    id: 'dose',
    name: 'Dose',
    category: 'objekt',
    keywords: ['Can/Box'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Geheimnis, verborgener Inhalt, Pandora.' },
    ],
  },
  {
    id: 'tempel',
    name: 'Tempel',
    category: 'ort',
    keywords: ['Temple'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Heiliger Raum, inneres Selbst, Goettlichkeit.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Heiliger Raum, inneres Selbst, Goettlichkeit.' },
    ],
  },
  {
    id: 'oase',
    name: 'Oase',
    category: 'ort',
    keywords: ['Oasis'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Erholung, Hoffnung in der Wueste, Schutz.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Erholung, Hoffnung in der Wueste, Schutz.' },
    ],
  },
  {
    id: 'paradiesgarten',
    name: 'Paradiesgarten',
    category: 'ort',
    keywords: ['Garden of Eden'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Urspruengliche Unschuld, Sehnsucht, Vollkommenheit.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Urspruengliche Unschuld, Sehnsucht, Vollkommenheit.' },
    ],
  },
  {
    id: 'bibliothek',
    name: 'Bibliothek',
    category: 'ort',
    keywords: ['Library'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wissen, Erinnerung, Akasha-Chronik.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Wissen, Erinnerung, Akasha-Chronik.' },
    ],
  },
  {
    id: 'bushaltestelle',
    name: 'Bushaltestelle',
    category: 'ort',
    keywords: ['Bus stop'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Warten, Uebergang, Geduld.' },
    ],
  },
  {
    id: 'spielplatz',
    name: 'Spielplatz',
    category: 'ort',
    keywords: ['Playground'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Kindheit, Unbeschwertheit, inneres Kind.' },
    ],
  },
  {
    id: 'burg',
    name: 'Burg',
    category: 'ort',
    keywords: ['Castle'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Schutz, Isolation, Macht. Maerchen: verwunschen.' },
    ],
  },
  {
    id: 'dschungel',
    name: 'Dschungel',
    category: 'ort',
    keywords: ['Jungle'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wildnis, Chaos, Urtriebe, Exploration.' },
    ],
  },
  {
    id: 'hafen',
    name: 'Hafen',
    category: 'ort',
    keywords: ['Harbor'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Sicherheit, Ankunft, Ruhe nach der Reise.' },
    ],
  },
  {
    id: 'wolken',
    name: 'Wolken',
    category: 'ort',
    keywords: ['Clouds'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Traeumerei, Unsicherheit, Goettlichkeit. Islam: Regen/Segen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Traeumerei, Unsicherheit, Goettlichkeit. Islam: Regen/Segen.' },
    ],
  },
  {
    id: 'untergrund',
    name: 'Untergrund',
    category: 'ort',
    keywords: ['Underground'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Unbewusstes, verborgene Kraefte, Unterwelt.' },
    ],
  },
  {
    id: 'arena',
    name: 'Arena',
    category: 'ort',
    keywords: ['Arena'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Konfrontation, Pruefung, oeffentlicher Kampf.' },
    ],
  },
  {
    id: 'marktplatz',
    name: 'Marktplatz',
    category: 'ort',
    keywords: ['Marketplace'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Austausch, Wert, soziale Dynamik.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Austausch, Wert, soziale Dynamik.' },
    ],
  },
  {
    id: 'hotelzimmer',
    name: 'Hotelzimmer',
    category: 'ort',
    keywords: ['Hotel room'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Voruebergehend, Identitaetssuche, Reise.' },
    ],
  },
  {
    id: 'badezimmer',
    name: 'Badezimmer',
    category: 'ort',
    keywords: ['Bathroom'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Reinigung, Privatheit, Loslassen. Islam: Hammam.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Reinigung, Privatheit, Loslassen. Islam: Hammam.' },
    ],
  },
  {
    id: 'kueche',
    name: 'Kueche',
    category: 'ort',
    keywords: ['Kitchen'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Nahrung, Transformation, Kreativitaet.' },
    ],
  },
  {
    id: 'klassenzimmer',
    name: 'Klassenzimmer',
    category: 'ort',
    keywords: ['Classroom'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Lernen, Pruefung, Kindheitserinnerung.' },
    ],
  },
  {
    id: 'tunnel',
    name: 'Tunnel',
    category: 'ort',
    keywords: ['Tunnel'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Uebergang, Geburt, Nahtod. Licht am Ende.' },
    ],
  },
  {
    id: 'parkplatz',
    name: 'Parkplatz',
    category: 'ort',
    keywords: ['Parking lot'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Stillstand, Pause, wartende Entscheidung.' },
    ],
  },
  {
    id: 'dach',
    name: 'Dach',
    category: 'ort',
    keywords: ['Roof'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Geist, Ueberblick, Schutz, Bewusstsein.' },
    ],
  },
  {
    id: 'wunde',
    name: 'Wunde',
    category: 'koerper',
    keywords: ['Wound'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Emotionaler Schmerz, Verletzung, Heilungsbedarf.' },
    ],
  },
  {
    id: 'narbe',
    name: 'Narbe',
    category: 'koerper',
    keywords: ['Scar'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Vergangene Verletzung, Erinnerung, Staerke.' },
    ],
  },
  {
    id: 'knochen',
    name: 'Knochen',
    category: 'koerper',
    keywords: ['Bones'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Grundstruktur, Essenz, Tod. Islam: Auferstehung.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Grundstruktur, Essenz, Tod. Islam: Auferstehung.' },
    ],
  },
  {
    id: 'stimme',
    name: 'Stimme',
    category: 'koerper',
    keywords: ['Voice'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Intuition, innere Fuehrung, Selbstausdruck.' },
    ],
  },
  {
    id: 'atem',
    name: 'Atem',
    category: 'koerper',
    keywords: ['Breath'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Leben, Geist, Pranayama. Islam: Ruh (Seele).' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Leben, Geist, Pranayama. Islam: Ruh (Seele).' },
    ],
  },
  {
    id: 'zunge',
    name: 'Zunge',
    category: 'koerper',
    keywords: ['Tongue'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Sprache, Geschmack, Kommunikation. Islam: Kontrolle der Worte.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Sprache, Geschmack, Kommunikation. Islam: Kontrolle der Worte.' },
    ],
  },
  {
    id: 'schulter',
    name: 'Schulter',
    category: 'koerper',
    keywords: ['Shoulder'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Last, Verantwortung, Staerke.' },
    ],
  },
  {
    id: 'knie',
    name: 'Knie',
    category: 'koerper',
    keywords: ['Knee'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Demut, Flexibilitaet, Unterwerfung. Islam: Sujud.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Demut, Flexibilitaet, Unterwerfung. Islam: Sujud.' },
    ],
  },
  {
    id: 'nabel',
    name: 'Nabel',
    category: 'koerper',
    keywords: ['Navel'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Zentrum, Verbindung zur Mutter, Ursprung.' },
    ],
  },
  {
    id: 'fluegel',
    name: 'Fluegel',
    category: 'koerper',
    keywords: ['Wings'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Freiheit, Spiritualitaet, Engel. Islam: Dschibril.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Freiheit, Spiritualitaet, Engel. Islam: Dschibril.' },
    ],
  },
  {
    id: 'drittes_auge',
    name: 'Drittes Auge',
    category: 'koerper',
    keywords: ['Third eye'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Intuition, hoeheres Bewusstsein, Ajna-Chakra.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Intuition, hoeheres Bewusstsein, Ajna-Chakra.' },
    ],
  },
  {
    id: 'skelett',
    name: 'Skelett',
    category: 'koerper',
    keywords: ['Skeleton'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Tod, Essenz, Vergaenglichkeit. Memento mori.' },
    ],
  },
  {
    id: 'lunge',
    name: 'Lunge',
    category: 'koerper',
    keywords: ['Lungs'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Lebensatem, Freiheit, Beengung.' },
    ],
  },
  {
    id: 'traene',
    name: 'Traene',
    category: 'koerper',
    keywords: ['Tear'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Emotionale Reinigung, Trauer, Erleichterung.' },
    ],
  },
  {
    id: 'niere',
    name: 'Niere',
    category: 'koerper',
    keywords: ['Kidney'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.CHINESE_ZODIAC, text: 'Reinigung, Partnerschaft, Lebensenergie.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Reinigung, Partnerschaft, Lebensenergie.' },
    ],
  },
  {
    id: 'freiheit',
    name: 'Freiheit',
    category: 'emotion',
    keywords: ['Freedom'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Befreiung, Autonomie, Transzendenz.' },
    ],
  },
  {
    id: 'schuld',
    name: 'Schuld',
    category: 'emotion',
    keywords: ['Guilt'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Gewissensbisse, Ueber-Ich, Suende. Islam: Tawba.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Gewissensbisse, Ueber-Ich, Suende. Islam: Tawba.' },
    ],
  },
  {
    id: 'scham',
    name: 'Scham',
    category: 'emotion',
    keywords: ['Shame'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Selbstbild, soziale Angst, Verletzlichkeit.' },
    ],
  },
  {
    id: 'wut',
    name: 'Wut',
    category: 'emotion',
    keywords: ['Anger'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Unterdrueckte Energie, Grenze, Kraft. Islam: Sabar.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Unterdrueckte Energie, Grenze, Kraft. Islam: Sabar.' },
    ],
  },
  {
    id: 'trauer',
    name: 'Trauer',
    category: 'emotion',
    keywords: ['Grief'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verlust, Verarbeitung, Loslassen.' },
    ],
  },
  {
    id: 'freude',
    name: 'Freude',
    category: 'emotion',
    keywords: ['Joy'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Erfuellung, Ganzheit, innerer Frieden.' },
    ],
  },
  {
    id: 'eifersucht',
    name: 'Eifersucht',
    category: 'emotion',
    keywords: ['Jealousy'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Unsicherheit, Vergleich, Mangel.' },
    ],
  },
  {
    id: 'hoffnung',
    name: 'Hoffnung',
    category: 'emotion',
    keywords: ['Hope'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Zukunft, Glaube, Licht. Islam: Rajaa.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Zukunft, Glaube, Licht. Islam: Rajaa.' },
    ],
  },
  {
    id: 'verwandlung',
    name: 'Verwandlung',
    category: 'emotion',
    keywords: ['Transformation'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Metamorphose, Wachstum, Alchemie.' },
    ],
  },
  {
    id: 'unendlichkeit',
    name: 'Unendlichkeit',
    category: 'emotion',
    keywords: ['Infinity'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ewigkeit, Goettlichkeit, grenzenlose Moeglichkeiten.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Ewigkeit, Goettlichkeit, grenzenlose Moeglichkeiten.' },
    ],
  },
  {
    id: 'verlassenwerden',
    name: 'Verlassenwerden',
    category: 'emotion',
    keywords: ['Abandonment'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Verlustangst, Einsamkeit, Bindungstrauma.' },
    ],
  },
  {
    id: 'betrug',
    name: 'Betrug',
    category: 'emotion',
    keywords: ['Betrayal'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Vertrauensbruch, Verletzung, Schatten.' },
    ],
  },
  {
    id: 'heilung',
    name: 'Heilung',
    category: 'emotion',
    keywords: ['Healing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ganzwerdung, Vergebung, Integration.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ganzwerdung, Vergebung, Integration.' },
    ],
  },
  {
    id: 'pruefung_bestehen',
    name: 'Prüfung bestehen',
    category: 'emotion',
    keywords: ['Passing exam'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Bestaetigung, Kompetenz, Erleichterung.' },
    ],
  },
  {
    id: 'apokalypse',
    name: 'Apokalypse',
    category: 'emotion',
    keywords: ['Apocalypse'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Weltende, totaler Wandel. Islam: Yawm al-Qiyama.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Weltende, totaler Wandel. Islam: Yawm al-Qiyama.' },
    ],
  },
  {
    id: 'wiedergeburt',
    name: 'Wiedergeburt',
    category: 'emotion',
    keywords: ['Rebirth'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Erneuerung, Karma, Phoenix. Buddhismus: Samsara.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Erneuerung, Karma, Phoenix. Buddhismus: Samsara.' },
    ],
  },
  {
    id: 'vergebung',
    name: 'Vergebung',
    category: 'emotion',
    keywords: ['Forgiveness'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Befreiung, Loslassen, innerer Frieden. Islam: Maghfira.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Befreiung, Loslassen, innerer Frieden. Islam: Maghfira.' },
    ],
  },
  {
    id: 'sehnsucht',
    name: 'Sehnsucht',
    category: 'emotion',
    keywords: ['Longing'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Unerfuelltes Verlangen, Fernweh, Heimweh.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.NABULSI, text: 'Unerfuelltes Verlangen, Fernweh, Heimweh.' },
    ],
  },
  {
    id: 'erwachen',
    name: 'Erwachen',
    category: 'emotion',
    keywords: ['Awakening'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Erleuchtung, Bewusstwerden. Buddhismus: Bodhi.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Erleuchtung, Bewusstwerden. Buddhismus: Bodhi.' },
    ],
  },
  {
    id: 'gefangen_sein',
    name: 'Gefangen sein',
    category: 'emotion',
    keywords: ['Being trapped'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Einschraenkung, Hilflosigkeit, innere Kaefige.' },
    ],
  },
  {
    id: 'unsichtbar_sein',
    name: 'Unsichtbar sein',
    category: 'emotion',
    keywords: ['Being invisible'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ignoriert, Bedeutungslosigkeit, Freiheit.' },
    ],
  },
  {
    id: 'zeitreise',
    name: 'Zeitreise',
    category: 'emotion',
    keywords: ['Time travel'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Nostalgie, Zukunftsangst, ungeloeste Vergangenheit.' },
    ],
  },
  {
    id: 'auferstehung',
    name: 'Auferstehung',
    category: 'emotion',
    keywords: ['Resurrection'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Neubeginn, Hoffnung, spirituelle Erneuerung. Ostern, Islam: Yawm.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Neubeginn, Hoffnung, spirituelle Erneuerung. Ostern, Islam: Yawm.' },
    ],
  },
  {
    id: 'taufe',
    name: 'Taufe',
    category: 'emotion',
    keywords: ['Baptism'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Reinigung, Neubeginn, Initiation.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Reinigung, Neubeginn, Initiation.' },
    ],
  },
  {
    id: 'pilgerfahrt',
    name: 'Pilgerfahrt',
    category: 'emotion',
    keywords: ['Pilgrimage'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Spirituelle Reise, Reinigung. Islam: Hajj, Umra.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Spirituelle Reise, Reinigung. Islam: Hajj, Umra.' },
    ],
  },
  {
    id: 'meditation',
    name: 'Meditation',
    category: 'emotion',
    keywords: ['Meditation'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Innere Ruhe, Achtsamkeit, Erleuchtung.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Innere Ruhe, Achtsamkeit, Erleuchtung.' },
    ],
  },
  {
    id: 'gebet',
    name: 'Gebet',
    category: 'emotion',
    keywords: ['Prayer'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verbindung zum Goettlichen, Bitte, Dankbarkeit.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Verbindung zum Goettlichen, Bitte, Dankbarkeit.' },
    ],
  },
  {
    id: 'opfer',
    name: 'Opfer',
    category: 'emotion',
    keywords: ['Sacrifice'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Hingabe, Loslassen, spirituelles Opfer. Islam: Udhiya.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Hingabe, Loslassen, spirituelles Opfer. Islam: Udhiya.' },
    ],
  },
  {
    id: 'mandala',
    name: 'Mandala',
    category: 'emotion',
    keywords: ['Mandala'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ganzheit, Zentrierung, Individuation. Jung: Selbst-Symbol.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Ganzheit, Zentrierung, Individuation. Jung: Selbst-Symbol.' },
    ],
  },
  {
    id: 'karma',
    name: 'Karma',
    category: 'emotion',
    keywords: ['Karma'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Ursache-Wirkung, vergangene Taten, Gerechtigkeit.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Ursache-Wirkung, vergangene Taten, Gerechtigkeit.' },
    ],
  },
  {
    id: 'samsara',
    name: 'Samsara',
    category: 'emotion',
    keywords: ['Samsara'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Kreislauf von Geburt/Tod, Wiederholung, Befreiung.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Kreislauf von Geburt/Tod, Wiederholung, Befreiung.' },
    ],
  },
  {
    id: 'nirvana',
    name: 'Nirvana',
    category: 'emotion',
    keywords: ['Nirvana'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Befreiung, Ende des Leidens, Erleuchtung.' },
    ],
  },
  {
    id: 'yin_yang',
    name: 'Yin Yang',
    category: 'emotion',
    keywords: ['Yin Yang'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.CHINESE_ZODIAC, text: 'Balance, Dualitaet, Harmonie der Gegensaetze.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.ZEN, text: 'Balance, Dualitaet, Harmonie der Gegensaetze.' },
    ],
  },
  {
    id: 'suende',
    name: 'Suende',
    category: 'emotion',
    keywords: ['Sin'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Schuld, Verfehlung, moralischer Konflikt. Islam: Dhanb.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Schuld, Verfehlung, moralischer Konflikt. Islam: Dhanb.' },
    ],
  },
  {
    id: 'paradox',
    name: 'Paradox',
    category: 'emotion',
    keywords: ['Paradox'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.ZEN, text: 'Widerspruch, Zhuangzi-Traum, Maya.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Widerspruch, Zhuangzi-Traum, Maya.' },
    ],
  },
  {
    id: 'deja_vu',
    name: 'Deja-vu',
    category: 'emotion',
    keywords: ['Deja vu'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Wiederholung, Erinnerung, Zeitschleife.' },
    ],
  },
  {
    id: 'flucht',
    name: 'Flucht',
    category: 'emotion',
    keywords: ['Escape'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Befreiung oder Vermeidung, Angst konfrontieren.' },
    ],
  },
  {
    id: 'klartraum',
    name: 'Klartraum',
    category: 'emotion',
    keywords: ['Lucid dream'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Bewusstsein im Traum, Kontrolle. Tibetisch: Dream Yoga.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Bewusstsein im Traum, Kontrolle. Tibetisch: Dream Yoga.' },
    ],
  },
  {
    id: 'alptraum',
    name: 'Alptraum',
    category: 'emotion',
    keywords: ['Nightmare'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Verdraengtes, Warnung, Verarbeitung. Islam: von Shaitan.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verdraengtes, Warnung, Verarbeitung. Islam: von Shaitan.' },
    ],
  },
  {
    id: 'wahrsagung',
    name: 'Wahrsagung',
    category: 'emotion',
    keywords: ['Prophecy'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Zukunftsvision, Intuition. Islam: Ru\'ya Sadiqa.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Zukunftsvision, Intuition. Islam: Ru\'ya Sadiqa.' },
    ],
  },
  {
    id: 'synchronizitaet',
    name: 'Synchronizitaet',
    category: 'emotion',
    keywords: ['Synchronicity'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Bedeutsamer Zufall, Verbindung. Jung: acausale Ordnung.' },
    ],
  },
  {
    id: 'individuation',
    name: 'Individuation',
    category: 'emotion',
    keywords: ['Individuation'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ganzwerdung, Integration aller Aspekte. Jung: Lebenswerk.' },
    ],
  },
  {
    id: 'archetyp',
    name: 'Archetyp',
    category: 'emotion',
    keywords: ['Archetype'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Urmuster, kollektives Unbewusstes. Jung: universelle Bilder.' },
    ],
  },
  {
    id: 'schatten_integration',
    name: 'Schatten-Integration',
    category: 'emotion',
    keywords: ['Shadow integration'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verdraengtes akzeptieren, Ganzheit. Jung + Charlie Morley.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Verdraengtes akzeptieren, Ganzheit. Jung + Charlie Morley.' },
    ],
  },
  {
    id: 'falke',
    name: 'Falke',
    category: 'tier',
    keywords: ['Falcon'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ueberblick, Jagd, Adel. Islam: Herrscher. Aegypten: Horus.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ueberblick, Jagd, Adel. Islam: Herrscher. Aegypten: Horus.' },
    ],
  },
  {
    id: 'lama',
    name: 'Lama',
    category: 'tier',
    keywords: ['Llama'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Geduld, Bescheidenheit, Ausdauer.' },
    ],
  },
  {
    id: 'chamaeleon',
    name: 'Chamäleon',
    category: 'tier',
    keywords: ['Chameleon'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Anpassung, Wandelbarkeit, Taeuschung.' },
    ],
  },
  {
    id: 'gorilla',
    name: 'Gorilla',
    category: 'tier',
    keywords: ['Gorilla'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Urkraft, Schutz, dominante Instinkte.' },
    ],
  },
  {
    id: 'storch',
    name: 'Storch',
    category: 'tier',
    keywords: ['Stork'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Geburt, Fruehling, Glueck. Tuerkisch: Gluecksbringer.' },
    ],
  },
  {
    id: 'lachs',
    name: 'Lachs',
    category: 'tier',
    keywords: ['Salmon'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Rueckkehr zum Ursprung, Ausdauer, Heimat.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Rueckkehr zum Ursprung, Ausdauer, Heimat.' },
    ],
  },
  {
    id: 'gazelle',
    name: 'Gazelle',
    category: 'tier',
    keywords: ['Gazelle'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.NABULSI, text: 'Grazie, Schoenheit, Flucht. Sufi: Geliebte.' },
    ],
  },
  {
    id: 'krabbe',
    name: 'Krabbe',
    category: 'tier',
    keywords: ['Crab'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.WESTERN_ZODIAC, text: 'Seitwärtsbewegung, Schutz, Emotionen.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Seitwärtsbewegung, Schutz, Emotionen.' },
    ],
  },
  {
    id: 'kolibri',
    name: 'Kolibri',
    category: 'tier',
    keywords: ['Hummingbird'],
    interpretations: [
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Freude, Leichtigkeit, Genuss des Augenblicks.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Freude, Leichtigkeit, Genuss des Augenblicks.' },
    ],
  },
  {
    id: 'morgenroete',
    name: 'Morgenroete',
    category: 'natur',
    keywords: ['Dawn'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Neuer Anfang, Hoffnung, Fajr. Islam: beste Gebetszeit.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Neuer Anfang, Hoffnung, Fajr. Islam: beste Gebetszeit.' },
    ],
  },
  {
    id: 'sternschnuppe',
    name: 'Sternschnuppe',
    category: 'natur',
    keywords: ['Shooting star'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wunsch, fluechtiges Glueck, Zeichen.' },
    ],
  },
  {
    id: 'tau',
    name: 'Tau',
    category: 'natur',
    keywords: ['Dew'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Reinheit, Erneuerung, Vergaenglichkeit.' },
    ],
  },
  {
    id: 'lava',
    name: 'Lava',
    category: 'natur',
    keywords: ['Lava'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Unterdrueckte Wut, zerstoererische Energie.' },
    ],
  },
  {
    id: 'koralle',
    name: 'Koralle',
    category: 'natur',
    keywords: ['Coral'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verborgene Schoenheit, Tiefsee, Schutz.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verborgene Schoenheit, Tiefsee, Schutz.' },
    ],
  },
  {
    id: 'moos',
    name: 'Moos',
    category: 'natur',
    keywords: ['Moss'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Geduld, langsames Wachstum, Bescheidenheit.' },
    ],
  },
  {
    id: 'kompass',
    name: 'Kompass',
    category: 'natur',
    keywords: ['Compass'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Orientierung, Richtung, innere Fuehrung.' },
    ],
  },
  {
    id: 'horizont',
    name: 'Horizont',
    category: 'natur',
    keywords: ['Horizon'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Zukunft, Moeglichkeiten, Grenze des Bekannten.' },
    ],
  },
  {
    id: 'quelle',
    name: 'Quelle',
    category: 'natur',
    keywords: ['Spring/Source'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ursprung, Lebenskraft, Inspiration. Islam: Zamzam.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ursprung, Lebenskraft, Inspiration. Islam: Zamzam.' },
    ],
  },
  {
    id: 'bernstein',
    name: 'Bernstein',
    category: 'natur',
    keywords: ['Amber'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Konservierung, Erinnerung, alte Weisheit.' },
    ],
  },
  {
    id: 'krieger',
    name: 'Krieger',
    category: 'person',
    keywords: ['Warrior'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Innerer Kampf, Mut, Mars-Archetyp.' },
    ],
  },
  {
    id: 'priesterin',
    name: 'Priesterin',
    category: 'person',
    keywords: ['Priestess'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weibliche Spiritualitaet, Intuition, Mysterien.' },
    ],
  },
  {
    id: 'narr',
    name: 'Narr',
    category: 'person',
    keywords: ['Fool'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Anfang, Freiheit, Trickster. Tarot: 0.' },
    ],
  },
  {
    id: 'schattenfigur',
    name: 'Schattenfigur',
    category: 'person',
    keywords: ['Shadow figure'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verdraengtes, Unbewusstes, Angst.' },
    ],
  },
  {
    id: 'meerjungfrau',
    name: 'Meerjungfrau',
    category: 'person',
    keywords: ['Mermaid'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Anima, Verfuehrung, Emotionen. Slawisch: Rusalka.' },
    ],
  },
  {
    id: 'schmied',
    name: 'Schmied',
    category: 'person',
    keywords: ['Blacksmith'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Transformation, Schoepfung, Hephaistos.' },
    ],
  },
  {
    id: 'pilot',
    name: 'Pilot',
    category: 'person',
    keywords: ['Pilot'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Kontrolle, Ueberblick, Fuehrung.' },
    ],
  },
  {
    id: 'gefangener',
    name: 'Gefangener',
    category: 'person',
    keywords: ['Prisoner'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Einschraenkung, Schuld, verdraengte Freiheit.' },
    ],
  },
  {
    id: 'musikerin',
    name: 'Musikerin',
    category: 'person',
    keywords: ['Musician'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Harmonie, Selbstausdruck, Kreativitaet.' },
    ],
  },
  {
    id: 'gaukler',
    name: 'Gaukler',
    category: 'person',
    keywords: ['Juggler'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Balance, Vielseitigkeit, Tarot: Magier.' },
    ],
  },
  {
    id: 'leiter',
    name: 'Leiter',
    category: 'objekt',
    keywords: ['Ladder'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Aufstieg, Fortschritt. Bibel: Jakobsleiter. Islam: Mi\'raj.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Aufstieg, Fortschritt. Bibel: Jakobsleiter. Islam: Mi\'raj.' },
    ],
  },
  {
    id: 'fackel',
    name: 'Fackel',
    category: 'objekt',
    keywords: ['Torch'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Erleuchtung, Fuehrung im Dunkeln.' },
    ],
  },
  {
    id: 'stift',
    name: 'Stift',
    category: 'objekt',
    keywords: ['Pen'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Ausdruck, Schicksal, Islam: Al-Qalam (der Stift).' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ausdruck, Schicksal, Islam: Al-Qalam (der Stift).' },
    ],
  },
  {
    id: 'tagebuch',
    name: 'Tagebuch',
    category: 'objekt',
    keywords: ['Diary'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Selbstreflexion, Erinnerung, innere Stimme.' },
    ],
  },
  {
    id: 'sarg',
    name: 'Sarg',
    category: 'objekt',
    keywords: ['Coffin'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Tod, Ende, Transformation. Islam: Akhira.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Tod, Ende, Transformation. Islam: Akhira.' },
    ],
  },
  {
    id: 'wiege',
    name: 'Wiege',
    category: 'objekt',
    keywords: ['Cradle'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Neubeginn, Schutz, Kindheit.' },
    ],
  },
  {
    id: 'waage',
    name: 'Waage',
    category: 'objekt',
    keywords: ['Scale'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Gerechtigkeit, Balance. Islam: Mizan am Jüngsten Tag.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Gerechtigkeit, Balance. Islam: Mizan am Jüngsten Tag.' },
    ],
  },
  {
    id: 'glocke',
    name: 'Glocke',
    category: 'objekt',
    keywords: ['Bell'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Warnung, Ruf, Bewusstwerden. Islam: Wahi.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Warnung, Ruf, Bewusstwerden. Islam: Wahi.' },
    ],
  },
  {
    id: 'sanduhr',
    name: 'Sanduhr',
    category: 'objekt',
    keywords: ['Hourglass'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Vergaenglichkeit, Zeit, Geduld.' },
    ],
  },
  {
    id: 'amulett',
    name: 'Amulett',
    category: 'objekt',
    keywords: ['Amulet'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Schutz, Glaube, Aberglauben. Islam: Ruqya.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Schutz, Glaube, Aberglauben. Islam: Ruqya.' },
    ],
  },
  {
    id: 'schild',
    name: 'Schild',
    category: 'objekt',
    keywords: ['Shield'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Schutz, Verteidigung, Abgrenzung.' },
    ],
  },
  {
    id: 'krug_zerbrochen',
    name: 'Krug zerbrochen',
    category: 'objekt',
    keywords: ['Broken jug'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verlust, Vergaenglichkeit, zerbrochene Hoffnung.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verlust, Vergaenglichkeit, zerbrochene Hoffnung.' },
    ],
  },
  {
    id: 'netz',
    name: 'Netz',
    category: 'objekt',
    keywords: ['Net'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Falle, Verbindung, Verstrickung.' },
    ],
  },
  {
    id: 'lampe',
    name: 'Lampe',
    category: 'objekt',
    keywords: ['Lamp'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Erkenntnis, Fuehrung. Islam: Mischkat (Lichtnische).' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Erkenntnis, Fuehrung. Islam: Mischkat (Lichtnische).' },
    ],
  },
  {
    id: 'brief',
    name: 'Brief',
    category: 'objekt',
    keywords: ['Letter'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Nachricht, Kommunikation, Neuigkeit.' },
    ],
  },
  {
    id: 'foto',
    name: 'Foto',
    category: 'objekt',
    keywords: ['Photo'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Erinnerung, Festhalten, Vergangenheit.' },
    ],
  },
  {
    id: 'saat_samen',
    name: 'Saat/Samen',
    category: 'objekt',
    keywords: ['Seed'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Potenzial, Zukunft, Wachstum. Islam: Sadaqa.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Potenzial, Zukunft, Wachstum. Islam: Sadaqa.' },
    ],
  },
  {
    id: 'wein',
    name: 'Wein',
    category: 'objekt',
    keywords: ['Wine'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Rausch, Transformation. Islam: Haram, aber Paradieswein. Sufi: goettliche Trunkenheit.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Rausch, Transformation. Islam: Haram, aber Paradieswein. Sufi: goettliche Trunkenheit.' },
    ],
  },
  {
    id: 'brot',
    name: 'Brot',
    category: 'objekt',
    keywords: ['Bread'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Nahrung, Grundbeduerfnis, Gemeinschaft. Bibel: Abendmahl.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Nahrung, Grundbeduerfnis, Gemeinschaft. Bibel: Abendmahl.' },
    ],
  },
  {
    id: 'milch',
    name: 'Milch',
    category: 'objekt',
    keywords: ['Milk'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Nahrung, Reinheit, Mutterliebe. Islam: Fitra (natuerliche Veranlagung).' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Nahrung, Reinheit, Mutterliebe. Islam: Fitra (natuerliche Veranlagung).' },
    ],
  },
  {
    id: 'honig',
    name: 'Honig',
    category: 'objekt',
    keywords: ['Honey'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Suesse, Heilung, Belohnung. Islam: Quran-Heilmittel.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Suesse, Heilung, Belohnung. Islam: Quran-Heilmittel.' },
    ],
  },
  {
    id: 'oel',
    name: 'Oel',
    category: 'objekt',
    keywords: ['Oil'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Salbung, Heilung, Licht. Bibel: Salboel. Islam: Olivenoel.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Salbung, Heilung, Licht. Bibel: Salboel. Islam: Olivenoel.' },
    ],
  },
  {
    id: 'salz',
    name: 'Salz',
    category: 'objekt',
    keywords: ['Salt'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Weisheit, Bewahrung, Reinigung. Bibel: Salz der Erde.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Weisheit, Bewahrung, Reinigung. Bibel: Salz der Erde.' },
    ],
  },
  {
    id: 'staub',
    name: 'Staub',
    category: 'objekt',
    keywords: ['Dust'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Vergaenglichkeit, Demut. Bibel: Staub zu Staub. Islam: Erschaffung.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Vergaenglichkeit, Demut. Bibel: Staub zu Staub. Islam: Erschaffung.' },
    ],
  },
  {
    id: 'wirbelsaeule',
    name: 'Wirbelsaeule',
    category: 'koerper',
    keywords: ['Spine'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Rueckgrat, Stabilitaet, Kundalini. Yoga: Sushumna.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Rueckgrat, Stabilitaet, Kundalini. Yoga: Sushumna.' },
    ],
  },
  {
    id: 'gehirn',
    name: 'Gehirn',
    category: 'koerper',
    keywords: ['Brain'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Intellekt, Kontrolle, Bewusstsein.' },
    ],
  },
  {
    id: 'leib',
    name: 'Leib',
    category: 'koerper',
    keywords: ['Body'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ganzheit, Inkarnation, physische Existenz.' },
    ],
  },
  {
    id: 'leber',
    name: 'Leber',
    category: 'koerper',
    keywords: ['Liver'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.CHINESE_ZODIAC, text: 'Entgiftung, Wut. TCM: Holz-Element, Zorn.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Entgiftung, Wut. TCM: Holz-Element, Zorn.' },
    ],
  },
  {
    id: 'darm',
    name: 'Darm',
    category: 'koerper',
    keywords: ['Intestines'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Verarbeitung, Loslassen, Intuition (Bauchgefuehl).' },
    ],
  },
  {
    id: 'hals',
    name: 'Hals',
    category: 'koerper',
    keywords: ['Throat'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Kommunikation, Ausdruck, Chakra: Vishuddha.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Kommunikation, Ausdruck, Chakra: Vishuddha.' },
    ],
  },
  {
    id: 'handflaeche',
    name: 'Handflaeche',
    category: 'koerper',
    keywords: ['Palm'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Schicksal, Geben, Chiromantie.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Schicksal, Geben, Chiromantie.' },
    ],
  },
  {
    id: 'lippen',
    name: 'Lippen',
    category: 'koerper',
    keywords: ['Lips'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Kommunikation, Sinnlichkeit, Kuss.' },
    ],
  },
  {
    id: 'brustkorb',
    name: 'Brustkorb',
    category: 'koerper',
    keywords: ['Ribcage'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Schutz des Herzens, Emotionale Mauern.' },
    ],
  },
  {
    id: 'gebiss',
    name: 'Gebiss',
    category: 'koerper',
    keywords: ['Dentures'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Verlust, kuenstliche Fassade, Alterung.' },
    ],
  },
  {
    id: 'muttermal',
    name: 'Muttermal',
    category: 'koerper',
    keywords: ['Birthmark'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Identitaet, Schicksal, Markierung.' },
    ],
  },
  {
    id: 'adamsapfel',
    name: 'Adamsapfel',
    category: 'koerper',
    keywords: ["Adam's apple"],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Maennlichkeit, Verletzlichkeit, Stimme.' },
    ],
  },
  {
    id: 'chakra',
    name: 'Chakra',
    category: 'koerper',
    keywords: ['Chakra'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Energiezentrum, Balance, spirituelle Entwicklung.' },
      { tradition: ReligiousCategory.BUDDHIST, source: ReligiousSource.TIBETAN, text: 'Energiezentrum, Balance, spirituelle Entwicklung.' },
    ],
  },
  {
    id: 'aura',
    name: 'Aura',
    category: 'koerper',
    keywords: ['Aura'],
    interpretations: [
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.VEDIC_ASTROLOGY, text: 'Energiefeld, Ausstrahlung, spiritueller Zustand.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Energiefeld, Ausstrahlung, spiritueller Zustand.' },
    ],
  },
  {
    id: 'zwillingsflamme',
    name: 'Zwillingsflamme',
    category: 'koerper',
    keywords: ['Twin flame'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Seelenverbindung, Spiegelung, spirituelle Partnerschaft.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.NABULSI, text: 'Seelenverbindung, Spiegelung, spirituelle Partnerschaft.' },
    ],
  },
  {
    id: 'pyramide',
    name: 'Pyramide',
    category: 'ort',
    keywords: ['Pyramid'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ewigkeit, Mysterium, spirituelle Kraft. Aegypten.' },
    ],
  },
  {
    id: 'kloster',
    name: 'Kloster',
    category: 'ort',
    keywords: ['Monastery'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Rueckzug, Kontemplation, spirituelle Suche.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Rueckzug, Kontemplation, spirituelle Suche.' },
    ],
  },
  {
    id: 'markt_basar',
    name: 'Markt/Basar',
    category: 'ort',
    keywords: ['Bazaar'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Austausch, Vielfalt, Lebendigkeit. Islam: Dunya.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Austausch, Vielfalt, Lebendigkeit. Islam: Dunya.' },
    ],
  },
  {
    id: 'vulkaninsel',
    name: 'Vulkaninsel',
    category: 'ort',
    keywords: ['Volcanic island'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Isolation mit unterdrückter Energie.' },
    ],
  },
  {
    id: 'leuchtturm',
    name: 'Leuchtturm',
    category: 'ort',
    keywords: ['Lighthouse'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Fuehrung, Warnung, Hoffnung. Islam: Minaret.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Fuehrung, Warnung, Hoffnung. Islam: Minaret.' },
    ],
  },
  {
    id: 'wueste_oase',
    name: 'Wueste-Oase',
    category: 'ort',
    keywords: ['Desert oasis'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Rettung, Hoffnung inmitten von Pruefung.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Rettung, Hoffnung inmitten von Pruefung.' },
    ],
  },
  {
    id: 'spiraltreppe',
    name: 'Spiraltreppe',
    category: 'ort',
    keywords: ['Spiral staircase'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Innere Reise, Aufstieg, DNA-Helix.' },
    ],
  },
  {
    id: 'schatzkammer',
    name: 'Schatzkammer',
    category: 'ort',
    keywords: ['Treasure chamber'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Innerer Reichtum, verborgenes Potenzial.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Innerer Reichtum, verborgenes Potenzial.' },
    ],
  },
  {
    id: 'wolkenkratzer',
    name: 'Wolkenkratzer',
    category: 'ort',
    keywords: ['Skyscraper'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Ehrgeiz, Status, Entfernung vom Boden.' },
    ],
  },
  {
    id: 'sphinx',
    name: 'Sphinx',
    category: 'emotion',
    keywords: ['Sphinx'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Raetsel, Weisheit, Mysterium. Aegypten + Griechenland.' },
    ],
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    category: 'emotion',
    keywords: ['Phoenix'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Wiedergeburt aus Asche, Transformation, Unsterblichkeit.' },
    ],
  },
  {
    id: 'engelsfluegel',
    name: 'Engelsflügel',
    category: 'emotion',
    keywords: ['Angel wings'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Goettlicher Schutz, Aufstieg, Reinheit.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Goettlicher Schutz, Aufstieg, Reinheit.' },
    ],
  },
  {
    id: 'vollmond',
    name: 'Vollmond',
    category: 'emotion',
    keywords: ['Full moon'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Hoehepunkt, Erfuellung, weibliche Kraft.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Hoehepunkt, Erfuellung, weibliche Kraft.' },
    ],
  },
  {
    id: 'neumond',
    name: 'Neumond',
    category: 'emotion',
    keywords: ['New moon'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Neubeginn, Hilal, Islam: Ramadan-Beginn.' },
      { tradition: ReligiousCategory.ASTROLOGY, source: ReligiousSource.WESTERN_ZODIAC, text: 'Neubeginn, Hilal, Islam: Ramadan-Beginn.' },
    ],
  },
  {
    id: 'feuervogel',
    name: 'Feuervogel',
    category: 'emotion',
    keywords: ['Firebird'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Russisch: Glueck, Abenteuer. Transformation.' },
    ],
  },
  {
    id: 'paradiesvogel',
    name: 'Paradiesvogel',
    category: 'emotion',
    keywords: ['Bird of paradise'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Goettliche Schoenheit, Paradies, Sehnsucht.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Goettliche Schoenheit, Paradies, Sehnsucht.' },
    ],
  },
  {
    id: 'dornenkrone',
    name: 'Dornenkrone',
    category: 'emotion',
    keywords: ['Crown of thorns'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Leiden, Opfer, Erlosung. Christlich: Passion.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Leiden, Opfer, Erlosung. Christlich: Passion.' },
    ],
  },
  {
    id: 'siegel',
    name: 'Siegel',
    category: 'objekt',
    keywords: ['Seal'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Autoritaet, Abschluss, Geheimnis. Islam: Siegel der Propheten.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Autoritaet, Abschluss, Geheimnis. Islam: Siegel der Propheten.' },
    ],
  },
  {
    id: 'schwelle',
    name: 'Schwelle',
    category: 'ort',
    keywords: ['Threshold'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Uebergang, Initiation, Grenze zwischen Welten.' },
    ],
  },
  {
    id: 'feuerwerk',
    name: 'Feuerwerk',
    category: 'emotion',
    keywords: ['Fireworks'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.GESTALT, text: 'Feier, kurzlebige Freude, Spektakel.' },
    ],
  },
  {
    id: 'pendel',
    name: 'Pendel',
    category: 'objekt',
    keywords: ['Pendulum'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Schwankung, Unentschlossenheit, Hypnose.' },
    ],
  },
  {
    id: 'dolch',
    name: 'Dolch',
    category: 'objekt',
    keywords: ['Dagger'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verrat, Geheimnis, schnelle Entscheidung.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.FREUDIAN, text: 'Verrat, Geheimnis, schnelle Entscheidung.' },
    ],
  },
  {
    id: 'thron',
    name: 'Thron',
    category: 'objekt',
    keywords: ['Throne'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Hoechste Macht, Goettlichkeit. Islam: Arsh.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Hoechste Macht, Goettlichkeit. Islam: Arsh.' },
    ],
  },
  {
    id: 'pfeil',
    name: 'Pfeil',
    category: 'objekt',
    keywords: ['Arrow'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Richtung, Ziel, Amor. Islam: Dschihad.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Richtung, Ziel, Amor. Islam: Dschihad.' },
    ],
  },
  {
    id: 'amphore',
    name: 'Amphore',
    category: 'objekt',
    keywords: ['Amphora'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Alte Weisheit, Bewahrung, Tradition.' },
    ],
  },
  {
    id: 'weihrauch',
    name: 'Weihrauch',
    category: 'objekt',
    keywords: ['Incense'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Gebet, Reinigung, Spiritualitaet. Islam: Bakhoor.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Gebet, Reinigung, Spiritualitaet. Islam: Bakhoor.' },
    ],
  },
  {
    id: 'helm',
    name: 'Helm',
    category: 'objekt',
    keywords: ['Helmet'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Schutz des Geistes, Krieger, Ruestung.' },
    ],
  },
  {
    id: 'laub',
    name: 'Laub',
    category: 'natur',
    keywords: ['Leaves'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Vergaenglichkeit, Jahreszeiten, Loslassen.' },
    ],
  },
  {
    id: 'glut',
    name: 'Glut',
    category: 'natur',
    keywords: ['Embers'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Verborgene Leidenschaft, Restenergie, Hoffnung.' },
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Verborgene Leidenschaft, Restenergie, Hoffnung.' },
    ],
  },
  {
    id: 'zypresse',
    name: 'Zypresse',
    category: 'natur',
    keywords: ['Cypress'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Trauer, Ewigkeit, Friedhof. Islam: Paradiesbaum.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Trauer, Ewigkeit, Friedhof. Islam: Paradiesbaum.' },
    ],
  },
  {
    id: 'dattelpalme',
    name: 'Dattelpalme',
    category: 'natur',
    keywords: ['Date palm'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Segen, Fruchtbarkeit, Islam: Maryam-Sure.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Segen, Fruchtbarkeit, Islam: Maryam-Sure.' },
    ],
  },
  {
    id: 'olive',
    name: 'Olive',
    category: 'natur',
    keywords: ['Olive'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Frieden, Segen, Licht. Islam: Gesegneter Baum.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Frieden, Segen, Licht. Islam: Gesegneter Baum.' },
    ],
  },
  {
    id: 'glockenturm',
    name: 'Glockenturm',
    category: 'ort',
    keywords: ['Bell tower'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Ruf, Warnung, spirituelles Signal.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ruf, Warnung, spirituelles Signal.' },
    ],
  },
  {
    id: 'thronsaal',
    name: 'Thronsaal',
    category: 'ort',
    keywords: ['Throne room'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Macht, Gericht, Goettliche Gegenwart.' },
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Macht, Gericht, Goettliche Gegenwart.' },
    ],
  },
  {
    id: 'minaret',
    name: 'Minaret',
    category: 'ort',
    keywords: ['Minaret'],
    interpretations: [
      { tradition: ReligiousCategory.ISLAMIC, source: ReligiousSource.IBN_SIRIN, text: 'Gebetsruf, Glaube, Islam. Adhan.' },
    ],
  },
  {
    id: 'asche',
    name: 'Asche',
    category: 'natur',
    keywords: ['Ash'],
    interpretations: [
      { tradition: ReligiousCategory.CHRISTIAN, source: ReligiousSource.MEDIEVAL, text: 'Ende, Reinigung, Phoenix. Aschermittwoch.' },
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ende, Reinigung, Phoenix. Aschermittwoch.' },
    ],
  },
  {
    id: 'nebelmeer',
    name: 'Nebelmeer',
    category: 'natur',
    keywords: ['Sea of fog'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Ungewissheit, Uebergang, Romantik.' },
    ],
  },
  {
    id: 'totenkopf',
    name: 'Totenkopf',
    category: 'koerper',
    keywords: ['Skull'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Memento mori, Vergaenglichkeit, Alchemie: Caput mortuum.' },
    ],
  },
  {
    id: 'doppelgaenger',
    name: 'Doppelgaenger',
    category: 'person',
    keywords: ['Doppelganger'],
    interpretations: [
      { tradition: ReligiousCategory.PSYCHOLOGICAL, source: ReligiousSource.JUNGIAN, text: 'Schatten, andere Seite des Selbst, Spaltung.' },
    ],
  }
,
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

export const traditions: Record<ReligiousCategory, { label: string; desc: string; sources: Partial<Record<ReligiousSource, { label: string; shortDesc: string }>> }> = {
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
  [ReligiousCategory.JEWISH]: {
    label: 'Jüdische Traumdeutung',
    desc: 'Die jüdische Traumdeutung hat tiefe Wurzeln im Talmud und der Kabbala. Der Talmud (Berakhot 55a-57b) enthält systematische Traumdeutungsregeln. Der Zohar verbindet Träume mit den Sefirot und der göttlichen Offenbarung.',
    sources: {
      [ReligiousSource.TALMUD_BERAKHOT]: { label: 'Talmud Berakhot', shortDesc: 'Babylonischer Talmud, Traktat Berakhot 55a-57b; systematische Traumdeutungsregeln der Rabbinen' },
      [ReligiousSource.ZOHAR]: { label: 'Zohar/Sohar', shortDesc: 'Hauptwerk der Kabbala (13. Jh.); Traumdeutung durch die Sefirot und göttliche Emanationen' },
      [ReligiousSource.KABBALAH_NUMEROLOGY]: { label: 'Kabbala', shortDesc: 'Jüdisch-mystische Tradition; Gematria und symbolische Traumdeutung' },
    },
  },
  [ReligiousCategory.SONNIKS]: {
    label: 'Russische Sonniks (Traumbucher)',
    desc: 'Sonniks sind traditionelle russische Traumbucher mit langer Tradition. Von Vangas prophetischen Deutungen uber Millers psychologischen Ansatz bis zu volkstumlichen Adaptionen westlicher Quellen bilden sie ein eigenes Genre der Traumdeutung.',
    sources: {
      [ReligiousSource.VANGA]: { label: 'Vanga', shortDesc: 'Bulgarische Seherin (1911-1996); prophetische Traumdeutung mit slawisch-mystischem Hintergrund' },
      [ReligiousSource.MILLER_RU]: { label: 'Miller (Russisch)', shortDesc: 'Klassischer russischer Traumdeuter; einer der bekanntesten Sonniks mit tausenden Symbolen' },
      [ReligiousSource.FREUD_RU]: { label: 'Freud (Russisch)', shortDesc: 'Russische Adaption der Freudschen Traumdeutung; populare Interpretation der Psychoanalyse' },
      [ReligiousSource.LOFF]: { label: 'Loff', shortDesc: 'Russischer Sonnik-Autor; volkstumliche Traumdeutung mit praktischem Fokus' },
      [ReligiousSource.NOSTRADAMUS_RU]: { label: 'Nostradamus (Russisch)', shortDesc: 'Russische Adaption; prophetische Traumsymbolik basierend auf Nostradamus-Interpretationen' },
    },
  },
  [ReligiousCategory.ANCIENT]: {
    label: 'Antike Traumdeutung',
    desc: 'Die altesten dokumentierten Traumdeutungen der Menschheit. Von Artemidoros\' systematischem Werk (2. Jh.) uber agyptische Traumpapyri (1275 v.Chr.) bis zum byzantinischen Somniale Danielis — die Wurzeln aller westlichen Traumdeutung.',
    sources: {
      [ReligiousSource.ARTEMIDOROS]: { label: 'Artemidoros', shortDesc: 'Griechischer Traumdeuter (2. Jh. n.Chr.); "Oneirokritika" — das einflussreichste Traumdeutungswerk der Antike' },
      [ReligiousSource.EGYPTIAN_PAPYRUS]: { label: 'Agyptischer Papyrus', shortDesc: 'Chester Beatty Papyrus III (ca. 1275 v.Chr.); altestes erhaltenes Traumdeutungsbuch der Welt' },
      [ReligiousSource.SOMNIALE_DANIELIS]: { label: 'Somniale Danielis', shortDesc: 'Byzantinisch-mittelalterliches Traumlexikon; dem Propheten Daniel zugeschrieben; verbreitet in ganz Europa' },
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
  [ReligiousSource.IMAM_SADIQ]: {
    title: 'Imam Jafar as-Sadiq',
    desc: 'Der sechste Imam der Zwölfer-Schia und bedeutender Gelehrter, dessen Traumdeutungslehre in der schiitischen Tradition bis heute grundlegend ist.',
    origin: 'Medina, Arabien (702–765 n.Chr.)',
    bio: 'Imam Jafar as-Sadiq war Nachkomme des Propheten Muhammad und gilt als einer der gelehrtesten Imame. Seine Traumdeutung verbindet koranische Symbolik mit der spirituellen Hierarchie der Ahl al-Bayt. Er lehrte, dass wahre Träume göttliche Botschaften seien und systematisierte deren Deutung nach schiitischen Grundsätzen.',
  },
  [ReligiousSource.ISLAMSKI_SONNIK]: {
    title: 'Islamisches Traumbuch (Russisch)',
    desc: 'Russisch-islamisches Traumbuch, das islamische Traumdeutungstraditionen mit Elementen der slawischen Volkskultur verbindet.',
    origin: 'Russland / Zentralasien (19.–20. Jahrhundert)',
    bio: 'Der Islamski Sonnik entstand in den muslimischen Gemeinschaften Russlands und Zentralasiens. Er vereint klassische islamische Traumdeutung nach Ibn Sirin und an-Nabulsi mit regionalen Volksglauben. Das Werk spiegelt die kulturelle Synthese wider, die der Islam in der russisch-turkestanischen Welt erfuhr.',
  },
  [ReligiousSource.EDGAR_CAYCE]: {
    title: 'Edgar Cayce',
    desc: 'Amerikanischer Seher und "Schlafprophet", der im Trancezustand Tausende von Traumdeutungen und Lebenslesungen gab.',
    origin: 'Hopkinsville, Kentucky, USA (1877–1945)',
    bio: 'Edgar Cayce gab über 14.000 dokumentierte "Readings" im Schlafzustand. Er sah Träume als Kommunikation zwischen dem bewussten und dem überbewussten Geist. Seine Deutungen verbinden christliche Mystik, Reinkarnation und ganzheitliche Gesundheit. Die Association for Research and Enlightenment bewahrt sein Erbe.',
  },
  [ReligiousSource.RUDOLF_STEINER]: {
    title: 'Rudolf Steiner',
    desc: 'Begründer der Anthroposophie, der den Schlaf als Reise der Seele in geistige Welten verstand und Träume als Schwellenphänomene deutete.',
    origin: 'Kraljevec (heute Kroatien) / Dornach, Schweiz (1861–1925)',
    bio: 'Rudolf Steiner beschrieb den Schlaf als Zustand, in dem Ich und Astralleib den physischen Körper verlassen und in höhere Welten eintreten. Träume entstehen beim Übergang zwischen Wachen und Schlafen. Seine Traumdeutung basiert auf der Erkenntnis übersinnlicher Welten und der geistigen Entwicklung des Menschen.',
  },
  [ReligiousSource.ZHOU_GONG]: {
    title: 'Zhou Gong (Duke of Zhou)',
    desc: 'Das älteste und einflussreichste chinesische Traumdeutungsbuch, traditionell dem Herzog von Zhou zugeschrieben.',
    origin: 'China (ca. 1000 v.Chr.)',
    bio: 'Zhou Gong Jie Meng (Zhougongs Traumdeutung) ist seit über 3.000 Jahren das Standardwerk chinesischer Traumdeutung. Der Herzog von Zhou war Regent der frühen Zhou-Dynastie und gilt als Weiser. Das Werk kategorisiert Träume nach Themen wie Himmel, Erde, Tiere und Gegenstände und verbindet sie mit Glück oder Unglück.',
  },
  [ReligiousSource.HATSUYUME]: {
    title: 'Hatsuyume (Erster Traum)',
    desc: 'Japanische Tradition, den ersten Traum des neuen Jahres als Omen für das kommende Jahr zu deuten.',
    origin: 'Japan (seit der Edo-Zeit, 17.–19. Jahrhundert)',
    bio: 'Hatsuyume bezeichnet den ersten Traum in der Nacht vom 1. auf den 2. Januar. Die berühmteste Deutungsregel lautet: "Ichi-Fuji, Ni-Taka, San-Nasubi" — der Fuji-Berg als bester, ein Falke als zweitbester und eine Aubergine als drittbester Traum. Diese Tradition spiegelt den shintoistischen Glauben an glückverheißende Zeichen wider.',
  },
  [ReligiousSource.SWAPNA_SHASTRA]: {
    title: 'Swapna Shastra',
    desc: 'Vedische und hinduistische Traumlehre, die Träume als Botschaften der Götter und Spiegelungen des Karma deutet.',
    origin: 'Indien (ca. 1500 v.Chr.–500 n.Chr.)',
    bio: 'Swapna Shastra umfasst Traumdeutungstexte aus den Veden, Upanishaden und Puranas. Träume werden in prophetische, karmische und bedeutungslose Kategorien eingeteilt. Die Mandukya Upanishad beschreibt vier Bewusstseinszustände, wobei der Traumzustand (Svapna) als eigenständige Realitätsebene gilt. Ayurveda verbindet Traumtypen mit den drei Doshas.',
  },
  [ReligiousSource.TALMUD_BERAKHOT]: {
    title: 'Talmud Berakhot',
    desc: 'Der Babylonische Talmud enthält in Traktat Berakhot (55a–57b) die umfangreichste rabbinische Diskussion über Traumdeutung.',
    origin: 'Babylonien (3.–5. Jahrhundert n.Chr.)',
    bio: 'Die Rabbinen diskutieren im Talmud systematisch die Bedeutung von Träumen. Rabbi Chisda lehrt: "Ein ungedeuteter Traum ist wie ein ungelesener Brief." Der Text enthält Regeln für gute und schlechte Traumzeichen, das Ritual des "Hatavat Chalom" (Traumverbesserung) und die Lehre, dass Träume ein Sechzigstel der Prophetie seien.',
  },
  [ReligiousSource.ZOHAR]: {
    title: 'Zohar (Sefer ha-Sohar)',
    desc: 'Das Hauptwerk der jüdischen Kabbala enthält tiefgründige mystische Traumdeutung durch die Lehre der Sefirot und göttlichen Emanationen.',
    origin: 'Spanien / Provence (13. Jahrhundert)',
    bio: 'Der Zohar, traditionell Rabbi Schimon bar Jochai zugeschrieben, wurde im 13. Jahrhundert von Mosche de Leon verfasst. Er lehrt, dass die Seele im Schlaf aufsteigt und göttliche Visionen empfängt. Träume sind Botschaften aus den höheren Welten, die durch die zehn Sefirot des Lebensbaums gefiltert werden. Jedes Traumsymbol hat eine mystische Entsprechung.',
  },
  [ReligiousSource.VANGA]: {
    title: 'Baba Vanga',
    desc: 'Bulgarische blinde Seherin, deren prophetische Traumdeutungen in Osteuropa und Russland große Verbreitung fanden.',
    origin: 'Petritsch, Bulgarien (1911–1996)',
    bio: 'Vangeliya Pandeva Gushterova, bekannt als Baba Vanga, verlor mit 12 Jahren ihr Augenlicht und entwickelte angeblich seherische Fähigkeiten. Sie deutete Träume als prophetische Botschaften und verband slawische Volksglauben mit christlicher Mystik. Millionen Menschen konsultierten sie zu Lebzeiten, und ihre Traumdeutungen wurden in populären Sonniks gesammelt.',
  },
  [ReligiousSource.MILLER_RU]: {
    title: 'Gustavus H. Miller (Russische Ausgabe)',
    desc: 'Russische Adaption des amerikanischen Traumdeutungsklassikers von G.H. Miller, eines der meistgelesenen Sonniks in Russland.',
    origin: 'Russland (19.–20. Jahrhundert)',
    bio: 'Gustavus Hindman Millers "10.000 Dreams Interpreted" wurde in Russland zum Bestseller und vielfach angepasst. Die russische Version erweitert das Original um slawische Volkssymbolik und praktische Lebensweisheiten. Mit Tausenden alphabetisch geordneten Symbolen ist er einer der umfangreichsten Sonniks und verbindet westliche Psychologie mit russischer Traumtradition.',
  },
  [ReligiousSource.FREUD_RU]: {
    title: 'Freud (Russische Volksadaption)',
    desc: 'Vereinfachte russische Volksversion der Freudschen Traumdeutung, die psychoanalytische Konzepte alltagstauglich aufbereitet.',
    origin: 'Russland (20. Jahrhundert)',
    bio: 'Diese populäre Adaption übersetzt Freuds komplexe Psychoanalyse in ein praktisches Nachschlagewerk. Unbewusste Wünsche, verdrängte Triebe und sexuelle Symbolik werden in einfacher Sprache erklärt. Im Gegensatz zu Freuds Originalwerk bietet der russische Sonnik direkte Symbol-zu-Bedeutung-Zuordnungen, die der russischen Leserschaft zugänglich sind.',
  },
  [ReligiousSource.LOFF]: {
    title: 'David Loff',
    desc: 'Russischer Sonnik-Autor, bekannt für seinen volkstümlichen und praktisch orientierten Ansatz zur Traumdeutung.',
    origin: 'Russland (20. Jahrhundert)',
    bio: 'David Loffs Traumdeutungsbuch ist in der russischsprachigen Welt weit verbreitet. Er verbindet Elemente der modernen Psychologie mit alltäglicher Lebenserfahrung. Sein Ansatz ist weniger theoretisch als Freud oder Jung und konzentriert sich auf die praktische Bedeutung von Traumsymbolen im Kontext des täglichen Lebens.',
  },
  [ReligiousSource.NOSTRADAMUS_RU]: {
    title: 'Nostradamus (Russische Adaption)',
    desc: 'Russische Adaption prophetischer Traumsymbolik, die auf Nostradamus-Interpretationen und apokalyptischen Visionen basiert.',
    origin: 'Russland (20. Jahrhundert)',
    bio: 'Dieser Sonnik verbindet die prophetischen Vierzeiler des Michel de Nostredame mit russischer Traumdeutungstradition. Traumsymbole werden als Vorzeichen für persönliche und weltgeschichtliche Ereignisse gedeutet. Das Werk betont die prophetische Dimension von Träumen und ihre Verbindung zu Schicksalsfragen.',
  },
  [ReligiousSource.ARTEMIDOROS]: {
    title: 'Artemidoros von Daldis',
    desc: 'Griechischer Traumdeuter des 2. Jahrhunderts, Verfasser der "Oneirokritika" — des einflussreichsten Traumdeutungswerks der Antike.',
    origin: 'Ephesus / Daldis, Kleinasien (2. Jahrhundert n.Chr.)',
    bio: 'Artemidoros bereiste die antike Welt und sammelte Tausende von Traumdeutungen. Sein fünfbändiges Werk "Oneirokritika" unterscheidet zwischen prophetischen Träumen (oneiroi) und bedeutungslosen Schlafbildern (enhypnia). Er betonte den Kontext des Träumers — Beruf, Geschlecht und soziale Stellung beeinflussten die Deutung. Sein Werk beeinflusste die europäische Traumdeutung bis in die Neuzeit.',
  },
  [ReligiousSource.EGYPTIAN_PAPYRUS]: {
    title: 'Ägyptischer Traumpapyrus',
    desc: 'Der Chester Beatty Papyrus III ist das älteste erhaltene Traumdeutungsbuch der Welt und stammt aus dem Alten Ägypten.',
    origin: 'Ägypten (ca. 1275 v.Chr., Neues Reich)',
    bio: 'Dieser Papyrus aus der Regierungszeit Ramses II. enthält über 200 Traumdeutungen, geordnet nach guten und schlechten Omen. Die Ägypter glaubten, dass Götter durch Träume kommunizieren. Priester des Serapis betrieben Tempelschlaf (Inkubation), um heilende Traumvisionen zu empfangen. Das Werk zeigt die systematische Traumdeutung einer der ältesten Zivilisationen.',
  },
  [ReligiousSource.SOMNIALE_DANIELIS]: {
    title: 'Somniale Danielis',
    desc: 'Byzantinisch-mittelalterliches Traumlexikon, dem Propheten Daniel zugeschrieben und über Jahrhunderte in ganz Europa verbreitet.',
    origin: 'Byzanz / Europa (7.–15. Jahrhundert)',
    bio: 'Das Somniale Danielis ist eines der am weitesten verbreiteten Traumdeutungsbücher des Mittelalters. Es ordnet Traumsymbole alphabetisch und gibt knappe Deutungen. Die Zuschreibung an den biblischen Daniel verlieh dem Werk Autorität. Es wurde in Griechisch, Latein und zahlreichen Volkssprachen überliefert und beeinflusste die europäische Traumkultur über ein Jahrtausend.',
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
  [ReligiousSource.IMAM_SADIQ]: {
    title: 'Имам Джафар ас-Садик',
    desc: 'Шестой имам шиитов-двунадесятников, выдающийся учёный, чьё учение о толковании снов является основополагающим в шиитской традиции.',
    origin: 'Медина, Аравия (702–765 н.э.)',
    bio: 'Имам Джафар ас-Садик — потомок Пророка Мухаммада и один из самых учёных имамов. Его толкование снов соединяет коранический символизм с духовной иерархией Ахль аль-Бейт. Он учил, что истинные сны — это божественные послания, и систематизировал их толкование по шиитским принципам.',
  },
  [ReligiousSource.ISLAMSKI_SONNIK]: {
    title: 'Исламский сонник',
    desc: 'Русско-исламский сонник, объединяющий исламскую традицию толкования снов с элементами славянской народной культуры.',
    origin: 'Россия / Центральная Азия (XIX–XX вв.)',
    bio: 'Исламский сонник возник в мусульманских общинах России и Центральной Азии. Он соединяет классическое исламское толкование по Ибн Сирину и ан-Набулуси с региональными народными верованиями. Произведение отражает культурный синтез ислама в русско-туркестанском мире.',
  },
  [ReligiousSource.EDGAR_CAYCE]: {
    title: 'Эдгар Кейси',
    desc: 'Американский ясновидящий и «спящий пророк», давший тысячи толкований снов и жизненных чтений в состоянии транса.',
    origin: 'Хопкинсвилл, Кентукки, США (1877–1945)',
    bio: 'Эдгар Кейси провёл более 14 000 задокументированных «чтений» в состоянии сна. Он рассматривал сны как общение между сознательным и сверхсознательным разумом. Его толкования соединяют христианскую мистику, реинкарнацию и целостное здоровье. Ассоциация по исследованию и просвещению хранит его наследие.',
  },
  [ReligiousSource.RUDOLF_STEINER]: {
    title: 'Рудольф Штайнер',
    desc: 'Основатель антропософии, рассматривавший сон как путешествие души в духовные миры, а сновидения — как пороговые явления.',
    origin: 'Кралевец (ныне Хорватия) / Дорнах, Швейцария (1861–1925)',
    bio: 'Рудольф Штайнер описывал сон как состояние, при котором Я и астральное тело покидают физическое тело и входят в высшие миры. Сновидения возникают при переходе между бодрствованием и сном. Его толкование снов основано на познании сверхчувственных миров и духовном развитии человека.',
  },
  [ReligiousSource.ZHOU_GONG]: {
    title: 'Чжоу Гун (Князь Чжоу)',
    desc: 'Древнейший и наиболее влиятельный китайский сонник, традиционно приписываемый Князю Чжоу.',
    origin: 'Китай (ок. 1000 до н.э.)',
    bio: 'Чжоу Гун Цзе Мэн (Толкование снов Чжоу Гуна) — стандартное произведение китайского толкования снов на протяжении более 3000 лет. Князь Чжоу был регентом ранней династии Чжоу и почитается как мудрец. Произведение классифицирует сны по темам — небо, земля, животные и предметы — и связывает их с удачей или несчастьем.',
  },
  [ReligiousSource.HATSUYUME]: {
    title: 'Хацуюмэ (Первый сон)',
    desc: 'Японская традиция толкования первого сна в новом году как предзнаменования на грядущий год.',
    origin: 'Япония (с периода Эдо, XVII–XIX вв.)',
    bio: 'Хацуюмэ — первый сон в ночь с 1 на 2 января. Самое известное правило толкования: «Ити-Фудзи, Ни-Така, Сан-Насуби» — гора Фудзи как лучший, сокол как второй и баклажан как третий по значимости сон. Эта традиция отражает синтоистскую веру в благоприятные знаки.',
  },
  [ReligiousSource.SWAPNA_SHASTRA]: {
    title: 'Свапна Шастра',
    desc: 'Ведическое и индуистское учение о снах, толкующее сновидения как послания богов и отражения кармы.',
    origin: 'Индия (ок. 1500 до н.э.–500 н.э.)',
    bio: 'Свапна Шастра включает тексты о толковании снов из Вед, Упанишад и Пуран. Сны подразделяются на пророческие, кармические и незначимые. Мандукья Упанишада описывает четыре состояния сознания, где сон (Свапна) считается самостоятельным уровнем реальности. Аюрведа связывает типы снов с тремя дошами.',
  },
  [ReligiousSource.TALMUD_BERAKHOT]: {
    title: 'Талмуд Берахот',
    desc: 'Вавилонский Талмуд содержит в трактате Берахот (55a–57b) наиболее обширное раввинистическое обсуждение толкования снов.',
    origin: 'Вавилония (III–V вв. н.э.)',
    bio: 'Раввины систематически обсуждают значение снов в Талмуде. Рабби Хисда учит: «Нетолкованный сон подобен непрочитанному письму». Текст содержит правила благих и дурных знаков, ритуал «Хатават Халом» (улучшение сна) и учение о том, что сны составляют одну шестидесятую часть пророчества.',
  },
  [ReligiousSource.ZOHAR]: {
    title: 'Зоар (Сефер ха-Зоар)',
    desc: 'Главный труд еврейской Каббалы, содержащий глубокое мистическое толкование снов через учение о сефирот и божественных эманациях.',
    origin: 'Испания / Прованс (XIII век)',
    bio: 'Зоар, традиционно приписываемый рабби Шимону бар Йохаю, был составлен Моше де Леоном в XIII веке. Он учит, что душа во сне поднимается ввысь и получает божественные видения. Сны — послания из высших миров, проходящие через десять сефирот Древа Жизни. Каждый символ сна имеет мистическое соответствие.',
  },
  [ReligiousSource.VANGA]: {
    title: 'Баба Ванга',
    desc: 'Болгарская слепая провидица, чьи пророческие толкования снов получили широкое распространение в Восточной Европе и России.',
    origin: 'Петрич, Болгария (1911–1996)',
    bio: 'Вангелия Пандева Гуштерова, известная как Баба Ванга, потеряла зрение в 12 лет и, как утверждается, обрела ясновидение. Она толковала сны как пророческие послания, соединяя славянские народные верования с христианской мистикой. Миллионы людей обращались к ней при жизни, а её толкования вошли в популярные сонники.',
  },
  [ReligiousSource.MILLER_RU]: {
    title: 'Густавус Х. Миллер (Русское издание)',
    desc: 'Русская адаптация американского классика толкования снов Г.Х. Миллера — один из самых читаемых сонников в России.',
    origin: 'Россия (XIX–XX вв.)',
    bio: 'Книга Густавуса Хиндмана Миллера «10 000 толкований снов» стала бестселлером в России и многократно адаптировалась. Русская версия дополняет оригинал славянской народной символикой и практическими жизненными советами. С тысячами алфавитно упорядоченных символов это один из самых обширных сонников, соединяющий западную психологию с русской традицией.',
  },
  [ReligiousSource.FREUD_RU]: {
    title: 'Фрейд (Русская народная адаптация)',
    desc: 'Упрощённая русская народная версия фрейдовского толкования снов, делающая психоаналитические концепции доступными для широкого читателя.',
    origin: 'Россия (XX век)',
    bio: 'Эта популярная адаптация переводит сложный психоанализ Фрейда в практический справочник. Бессознательные желания, вытесненные влечения и сексуальная символика объясняются простым языком. В отличие от оригинала Фрейда, русский сонник предлагает прямые соответствия «символ — значение», доступные русскому читателю.',
  },
  [ReligiousSource.LOFF]: {
    title: 'Давид Лофф',
    desc: 'Русский автор сонника, известный своим народным и практически ориентированным подходом к толкованию снов.',
    origin: 'Россия (XX век)',
    bio: 'Сонник Давида Лоффа широко распространён в русскоязычном мире. Он сочетает элементы современной психологии с повседневным жизненным опытом. Его подход менее теоретичен, чем у Фрейда или Юнга, и сосредоточен на практическом значении символов снов в контексте повседневной жизни.',
  },
  [ReligiousSource.NOSTRADAMUS_RU]: {
    title: 'Нострадамус (Русская адаптация)',
    desc: 'Русская адаптация пророческой символики снов, основанная на интерпретациях Нострадамуса и апокалиптических видениях.',
    origin: 'Россия (XX век)',
    bio: 'Этот сонник соединяет пророческие катрены Мишеля де Нострдама с русской традицией толкования снов. Символы снов трактуются как предзнаменования личных и мировых событий. Произведение подчёркивает пророческую составляющую снов и их связь с вопросами судьбы.',
  },
  [ReligiousSource.ARTEMIDOROS]: {
    title: 'Артемидор Далдианский',
    desc: 'Греческий толкователь снов II века, автор «Онейрокритики» — самого влиятельного произведения о толковании снов в античности.',
    origin: 'Эфес / Далдис, Малая Азия (II век н.э.)',
    bio: 'Артемидор путешествовал по античному миру, собирая тысячи толкований снов. Его пятитомная «Онейрокритика» различает пророческие сны (онейрои) и незначимые сновидения (энхипнии). Он подчёркивал контекст сновидца — профессия, пол и социальное положение влияли на толкование. Его труд оказывал влияние на европейское толкование снов вплоть до Нового времени.',
  },
  [ReligiousSource.EGYPTIAN_PAPYRUS]: {
    title: 'Египетский папирус сновидений',
    desc: 'Папирус Честера Битти III — древнейший сохранившийся сонник в мире, происходящий из Древнего Египта.',
    origin: 'Египет (ок. 1275 до н.э., Новое царство)',
    bio: 'Этот папирус времён правления Рамсеса II содержит более 200 толкований снов, разделённых на благоприятные и неблагоприятные знамения. Египтяне верили, что боги общаются через сны. Жрецы Сераписа практиковали храмовый сон (инкубацию) для получения исцеляющих видений. Произведение демонстрирует систематическое толкование снов одной из древнейших цивилизаций.',
  },
  [ReligiousSource.SOMNIALE_DANIELIS]: {
    title: 'Сомниале Даниелис',
    desc: 'Византийско-средневековый сонник, приписываемый пророку Даниилу и широко распространённый по всей Европе на протяжении веков.',
    origin: 'Византия / Европа (VII–XV вв.)',
    bio: 'Сомниале Даниелис — один из самых распространённых сонников Средневековья. Он упорядочивает символы снов по алфавиту и даёт краткие толкования. Атрибуция библейскому Даниилу придавала произведению авторитет. Оно передавалось на греческом, латыни и многочисленных народных языках и влияло на европейскую культуру сновидений более тысячелетия.',
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
  [ReligiousSource.IMAM_SADIQ]: {
    title: 'Imam Jafar al-Sadiq',
    desc: 'The sixth Imam of Twelver Shia Islam and a distinguished scholar whose dream interpretation teachings remain foundational in Shia tradition.',
    origin: 'Medina, Arabia (702–765 CE)',
    bio: 'Imam Jafar al-Sadiq was a descendant of Prophet Muhammad and is regarded as one of the most learned Imams. His dream interpretation connects Quranic symbolism with the spiritual hierarchy of the Ahl al-Bayt. He taught that true dreams are divine messages and systematized their interpretation according to Shia principles.',
  },
  [ReligiousSource.ISLAMSKI_SONNIK]: {
    title: 'Islamic Dream Book (Russian)',
    desc: 'A Russian-Islamic dream book that synthesizes Islamic dream interpretation traditions with elements of Slavic folk culture.',
    origin: 'Russia / Central Asia (19th–20th century)',
    bio: 'The Islamski Sonnik emerged from Muslim communities in Russia and Central Asia. It combines classical Islamic dream interpretation from Ibn Sirin and al-Nabulsi with regional folk beliefs. The work reflects the cultural synthesis that Islam underwent in the Russian-Turkestani world.',
  },
  [ReligiousSource.EDGAR_CAYCE]: {
    title: 'Edgar Cayce',
    desc: 'American psychic and "Sleeping Prophet" who gave thousands of dream interpretations and life readings while in a trance state.',
    origin: 'Hopkinsville, Kentucky, USA (1877–1945)',
    bio: 'Edgar Cayce gave over 14,000 documented "readings" while in a sleep state. He viewed dreams as communication between the conscious and superconscious mind. His interpretations blend Christian mysticism, reincarnation, and holistic health. The Association for Research and Enlightenment preserves his legacy.',
  },
  [ReligiousSource.RUDOLF_STEINER]: {
    title: 'Rudolf Steiner',
    desc: 'Founder of Anthroposophy who understood sleep as the soul\'s journey into spiritual worlds and interpreted dreams as threshold phenomena.',
    origin: 'Kraljevec (now Croatia) / Dornach, Switzerland (1861–1925)',
    bio: 'Rudolf Steiner described sleep as a state in which the ego and astral body leave the physical body and enter higher worlds. Dreams arise during the transition between waking and sleeping. His dream interpretation is based on knowledge of supersensible worlds and the spiritual development of humanity.',
  },
  [ReligiousSource.ZHOU_GONG]: {
    title: 'Zhou Gong (Duke of Zhou)',
    desc: 'The oldest and most influential Chinese dream interpretation book, traditionally attributed to the Duke of Zhou.',
    origin: 'China (ca. 1000 BCE)',
    bio: 'Zhou Gong Jie Meng (Duke of Zhou\'s Dream Interpretation) has been the standard work of Chinese dream interpretation for over 3,000 years. The Duke of Zhou was regent of the early Zhou Dynasty and is revered as a sage. The work categorizes dreams by themes such as heaven, earth, animals, and objects, linking them to fortune or misfortune.',
  },
  [ReligiousSource.HATSUYUME]: {
    title: 'Hatsuyume (First Dream)',
    desc: 'Japanese tradition of interpreting the first dream of the new year as an omen for the coming year.',
    origin: 'Japan (since the Edo period, 17th–19th century)',
    bio: 'Hatsuyume refers to the first dream in the night of January 1st to 2nd. The most famous interpretation rule is "Ichi-Fuji, Ni-Taka, San-Nasubi" — Mount Fuji as the best dream, a hawk as second best, and an eggplant as third best. This tradition reflects the Shinto belief in auspicious signs.',
  },
  [ReligiousSource.SWAPNA_SHASTRA]: {
    title: 'Swapna Shastra',
    desc: 'Vedic and Hindu dream science that interprets dreams as messages from the gods and reflections of karma.',
    origin: 'India (ca. 1500 BCE–500 CE)',
    bio: 'Swapna Shastra encompasses dream interpretation texts from the Vedas, Upanishads, and Puranas. Dreams are classified into prophetic, karmic, and meaningless categories. The Mandukya Upanishad describes four states of consciousness, with the dream state (Svapna) considered an independent level of reality. Ayurveda links dream types to the three Doshas.',
  },
  [ReligiousSource.TALMUD_BERAKHOT]: {
    title: 'Talmud Berakhot',
    desc: 'The Babylonian Talmud contains the most extensive rabbinic discussion of dream interpretation in Tractate Berakhot (55a–57b).',
    origin: 'Babylonia (3rd–5th century CE)',
    bio: 'The rabbis systematically discuss the meaning of dreams in the Talmud. Rabbi Chisda teaches: "An uninterpreted dream is like an unread letter." The text contains rules for good and bad dream signs, the ritual of "Hatavat Chalom" (dream improvement), and the teaching that dreams constitute one-sixtieth of prophecy.',
  },
  [ReligiousSource.ZOHAR]: {
    title: 'Zohar (Sefer ha-Zohar)',
    desc: 'The principal work of Jewish Kabbalah containing profound mystical dream interpretation through the doctrine of the Sefirot and divine emanations.',
    origin: 'Spain / Provence (13th century)',
    bio: 'The Zohar, traditionally attributed to Rabbi Shimon bar Yochai, was composed by Moses de Leon in the 13th century. It teaches that the soul ascends during sleep and receives divine visions. Dreams are messages from higher worlds filtered through the ten Sefirot of the Tree of Life. Every dream symbol has a mystical correspondence.',
  },
  [ReligiousSource.VANGA]: {
    title: 'Baba Vanga',
    desc: 'Bulgarian blind seer whose prophetic dream interpretations gained wide popularity in Eastern Europe and Russia.',
    origin: 'Petrich, Bulgaria (1911–1996)',
    bio: 'Vangeliya Pandeva Gushterova, known as Baba Vanga, lost her sight at age 12 and reportedly developed clairvoyant abilities. She interpreted dreams as prophetic messages, combining Slavic folk beliefs with Christian mysticism. Millions consulted her during her lifetime, and her dream interpretations were collected in popular sonniks.',
  },
  [ReligiousSource.MILLER_RU]: {
    title: 'Gustavus H. Miller (Russian Edition)',
    desc: 'Russian adaptation of the American dream interpretation classic by G.H. Miller, one of the most widely read sonniks in Russia.',
    origin: 'Russia (19th–20th century)',
    bio: 'Gustavus Hindman Miller\'s "10,000 Dreams Interpreted" became a bestseller in Russia and was adapted numerous times. The Russian version supplements the original with Slavic folk symbolism and practical life wisdom. With thousands of alphabetically ordered symbols, it is one of the most comprehensive sonniks, bridging Western psychology with Russian dream tradition.',
  },
  [ReligiousSource.FREUD_RU]: {
    title: 'Freud (Russian Folk Adaptation)',
    desc: 'Simplified Russian folk version of Freudian dream interpretation, making psychoanalytic concepts accessible to everyday readers.',
    origin: 'Russia (20th century)',
    bio: 'This popular adaptation translates Freud\'s complex psychoanalysis into a practical reference work. Unconscious desires, repressed drives, and sexual symbolism are explained in simple language. Unlike Freud\'s original work, the Russian sonnik offers direct symbol-to-meaning mappings accessible to Russian readers.',
  },
  [ReligiousSource.LOFF]: {
    title: 'David Loff',
    desc: 'Russian sonnik author known for his folk-oriented and practical approach to dream interpretation.',
    origin: 'Russia (20th century)',
    bio: 'David Loff\'s dream interpretation book is widely distributed in the Russian-speaking world. He combines elements of modern psychology with everyday life experience. His approach is less theoretical than Freud or Jung and focuses on the practical meaning of dream symbols in the context of daily life.',
  },
  [ReligiousSource.NOSTRADAMUS_RU]: {
    title: 'Nostradamus (Russian Adaptation)',
    desc: 'Russian adaptation of prophetic dream symbolism based on Nostradamus interpretations and apocalyptic visions.',
    origin: 'Russia (20th century)',
    bio: 'This sonnik combines the prophetic quatrains of Michel de Nostredame with Russian dream interpretation tradition. Dream symbols are interpreted as omens for personal and world-historical events. The work emphasizes the prophetic dimension of dreams and their connection to questions of destiny.',
  },
  [ReligiousSource.ARTEMIDOROS]: {
    title: 'Artemidorus of Daldis',
    desc: 'Greek dream interpreter of the 2nd century, author of the "Oneirocritica" — the most influential dream interpretation work of antiquity.',
    origin: 'Ephesus / Daldis, Asia Minor (2nd century CE)',
    bio: 'Artemidorus traveled the ancient world collecting thousands of dream interpretations. His five-volume "Oneirocritica" distinguishes between prophetic dreams (oneiroi) and meaningless sleep images (enhypnia). He emphasized the dreamer\'s context — profession, gender, and social status influenced interpretation. His work shaped European dream interpretation well into the modern era.',
  },
  [ReligiousSource.EGYPTIAN_PAPYRUS]: {
    title: 'Egyptian Dream Papyrus',
    desc: 'The Chester Beatty Papyrus III is the oldest surviving dream interpretation book in the world, originating from Ancient Egypt.',
    origin: 'Egypt (ca. 1275 BCE, New Kingdom)',
    bio: 'This papyrus from the reign of Ramesses II contains over 200 dream interpretations, organized by good and bad omens. The Egyptians believed that gods communicate through dreams. Priests of Serapis practiced temple sleep (incubation) to receive healing dream visions. The work demonstrates the systematic dream interpretation of one of the oldest civilizations.',
  },
  [ReligiousSource.SOMNIALE_DANIELIS]: {
    title: 'Somniale Danielis',
    desc: 'Byzantine-medieval dream lexicon attributed to the Prophet Daniel and widely distributed across Europe over centuries.',
    origin: 'Byzantium / Europe (7th–15th century)',
    bio: 'The Somniale Danielis is one of the most widely distributed dream interpretation books of the Middle Ages. It arranges dream symbols alphabetically and provides concise interpretations. Attribution to the biblical Daniel lent the work authority. It was transmitted in Greek, Latin, and numerous vernacular languages, influencing European dream culture for over a millennium.',
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
  [ReligiousSource.IMAM_SADIQ]: {
    title: 'Imam Jafar al-Sadiq',
    desc: 'The sixth Imam of Twelver Shia Islam and a distinguished scholar whose dream interpretation teachings remain foundational in Shia tradition.',
    origin: 'Medina, Arabia (702–765 CE)',
    bio: 'Imam Jafar al-Sadiq was a descendant of Prophet Muhammad and is regarded as one of the most learned Imams. His dream interpretation connects Quranic symbolism with the spiritual hierarchy of the Ahl al-Bayt. He taught that true dreams are divine messages and systematized their interpretation according to Shia principles.',
  },
  [ReligiousSource.ISLAMSKI_SONNIK]: {
    title: 'Islamic Dream Book (Russian)',
    desc: 'A Russian-Islamic dream book that synthesizes Islamic dream interpretation traditions with elements of Slavic folk culture.',
    origin: 'Russia / Central Asia (19th–20th century)',
    bio: 'The Islamski Sonnik emerged from Muslim communities in Russia and Central Asia. It combines classical Islamic dream interpretation from Ibn Sirin and al-Nabulsi with regional folk beliefs. The work reflects the cultural synthesis that Islam underwent in the Russian-Turkestani world.',
  },
  [ReligiousSource.EDGAR_CAYCE]: {
    title: 'Edgar Cayce',
    desc: 'American psychic and "Sleeping Prophet" who gave thousands of dream interpretations and life readings while in a trance state.',
    origin: 'Hopkinsville, Kentucky, USA (1877–1945)',
    bio: 'Edgar Cayce gave over 14,000 documented "readings" while in a sleep state. He viewed dreams as communication between the conscious and superconscious mind. His interpretations blend Christian mysticism, reincarnation, and holistic health. The Association for Research and Enlightenment preserves his legacy.',
  },
  [ReligiousSource.RUDOLF_STEINER]: {
    title: 'Rudolf Steiner',
    desc: 'Founder of Anthroposophy who understood sleep as the soul\'s journey into spiritual worlds and interpreted dreams as threshold phenomena.',
    origin: 'Kraljevec (now Croatia) / Dornach, Switzerland (1861–1925)',
    bio: 'Rudolf Steiner described sleep as a state in which the ego and astral body leave the physical body and enter higher worlds. Dreams arise during the transition between waking and sleeping. His dream interpretation is based on knowledge of supersensible worlds and the spiritual development of humanity.',
  },
  [ReligiousSource.ZHOU_GONG]: {
    title: 'Zhou Gong (Duke of Zhou)',
    desc: 'The oldest and most influential Chinese dream interpretation book, traditionally attributed to the Duke of Zhou.',
    origin: 'China (ca. 1000 BCE)',
    bio: 'Zhou Gong Jie Meng (Duke of Zhou\'s Dream Interpretation) has been the standard work of Chinese dream interpretation for over 3,000 years. The Duke of Zhou was regent of the early Zhou Dynasty and is revered as a sage. The work categorizes dreams by themes such as heaven, earth, animals, and objects, linking them to fortune or misfortune.',
  },
  [ReligiousSource.HATSUYUME]: {
    title: 'Hatsuyume (First Dream)',
    desc: 'Japanese tradition of interpreting the first dream of the new year as an omen for the coming year.',
    origin: 'Japan (since the Edo period, 17th–19th century)',
    bio: 'Hatsuyume refers to the first dream in the night of January 1st to 2nd. The most famous interpretation rule is "Ichi-Fuji, Ni-Taka, San-Nasubi" — Mount Fuji as the best dream, a hawk as second best, and an eggplant as third best. This tradition reflects the Shinto belief in auspicious signs.',
  },
  [ReligiousSource.SWAPNA_SHASTRA]: {
    title: 'Swapna Shastra',
    desc: 'Vedic and Hindu dream science that interprets dreams as messages from the gods and reflections of karma.',
    origin: 'India (ca. 1500 BCE–500 CE)',
    bio: 'Swapna Shastra encompasses dream interpretation texts from the Vedas, Upanishads, and Puranas. Dreams are classified into prophetic, karmic, and meaningless categories. The Mandukya Upanishad describes four states of consciousness, with the dream state (Svapna) considered an independent level of reality. Ayurveda links dream types to the three Doshas.',
  },
  [ReligiousSource.TALMUD_BERAKHOT]: {
    title: 'Talmud Berakhot',
    desc: 'The Babylonian Talmud contains the most extensive rabbinic discussion of dream interpretation in Tractate Berakhot (55a–57b).',
    origin: 'Babylonia (3rd–5th century CE)',
    bio: 'The rabbis systematically discuss the meaning of dreams in the Talmud. Rabbi Chisda teaches: "An uninterpreted dream is like an unread letter." The text contains rules for good and bad dream signs, the ritual of "Hatavat Chalom" (dream improvement), and the teaching that dreams constitute one-sixtieth of prophecy.',
  },
  [ReligiousSource.ZOHAR]: {
    title: 'Zohar (Sefer ha-Zohar)',
    desc: 'The principal work of Jewish Kabbalah containing profound mystical dream interpretation through the doctrine of the Sefirot and divine emanations.',
    origin: 'Spain / Provence (13th century)',
    bio: 'The Zohar, traditionally attributed to Rabbi Shimon bar Yochai, was composed by Moses de Leon in the 13th century. It teaches that the soul ascends during sleep and receives divine visions. Dreams are messages from higher worlds filtered through the ten Sefirot of the Tree of Life. Every dream symbol has a mystical correspondence.',
  },
  [ReligiousSource.VANGA]: {
    title: 'Baba Vanga',
    desc: 'Bulgarian blind seer whose prophetic dream interpretations gained wide popularity in Eastern Europe and Russia.',
    origin: 'Petrich, Bulgaria (1911–1996)',
    bio: 'Vangeliya Pandeva Gushterova, known as Baba Vanga, lost her sight at age 12 and reportedly developed clairvoyant abilities. She interpreted dreams as prophetic messages, combining Slavic folk beliefs with Christian mysticism. Millions consulted her during her lifetime, and her dream interpretations were collected in popular sonniks.',
  },
  [ReligiousSource.MILLER_RU]: {
    title: 'Gustavus H. Miller (Russian Edition)',
    desc: 'Russian adaptation of the American dream interpretation classic by G.H. Miller, one of the most widely read sonniks in Russia.',
    origin: 'Russia (19th–20th century)',
    bio: 'Gustavus Hindman Miller\'s "10,000 Dreams Interpreted" became a bestseller in Russia and was adapted numerous times. The Russian version supplements the original with Slavic folk symbolism and practical life wisdom. With thousands of alphabetically ordered symbols, it is one of the most comprehensive sonniks, bridging Western psychology with Russian dream tradition.',
  },
  [ReligiousSource.FREUD_RU]: {
    title: 'Freud (Russian Folk Adaptation)',
    desc: 'Simplified Russian folk version of Freudian dream interpretation, making psychoanalytic concepts accessible to everyday readers.',
    origin: 'Russia (20th century)',
    bio: 'This popular adaptation translates Freud\'s complex psychoanalysis into a practical reference work. Unconscious desires, repressed drives, and sexual symbolism are explained in simple language. Unlike Freud\'s original work, the Russian sonnik offers direct symbol-to-meaning mappings accessible to Russian readers.',
  },
  [ReligiousSource.LOFF]: {
    title: 'David Loff',
    desc: 'Russian sonnik author known for his folk-oriented and practical approach to dream interpretation.',
    origin: 'Russia (20th century)',
    bio: 'David Loff\'s dream interpretation book is widely distributed in the Russian-speaking world. He combines elements of modern psychology with everyday life experience. His approach is less theoretical than Freud or Jung and focuses on the practical meaning of dream symbols in the context of daily life.',
  },
  [ReligiousSource.NOSTRADAMUS_RU]: {
    title: 'Nostradamus (Russian Adaptation)',
    desc: 'Russian adaptation of prophetic dream symbolism based on Nostradamus interpretations and apocalyptic visions.',
    origin: 'Russia (20th century)',
    bio: 'This sonnik combines the prophetic quatrains of Michel de Nostredame with Russian dream interpretation tradition. Dream symbols are interpreted as omens for personal and world-historical events. The work emphasizes the prophetic dimension of dreams and their connection to questions of destiny.',
  },
  [ReligiousSource.ARTEMIDOROS]: {
    title: 'Artemidorus of Daldis',
    desc: 'Greek dream interpreter of the 2nd century, author of the "Oneirocritica" — the most influential dream interpretation work of antiquity.',
    origin: 'Ephesus / Daldis, Asia Minor (2nd century CE)',
    bio: 'Artemidorus traveled the ancient world collecting thousands of dream interpretations. His five-volume "Oneirocritica" distinguishes between prophetic dreams (oneiroi) and meaningless sleep images (enhypnia). He emphasized the dreamer\'s context — profession, gender, and social status influenced interpretation. His work shaped European dream interpretation well into the modern era.',
  },
  [ReligiousSource.EGYPTIAN_PAPYRUS]: {
    title: 'Egyptian Dream Papyrus',
    desc: 'The Chester Beatty Papyrus III is the oldest surviving dream interpretation book in the world, originating from Ancient Egypt.',
    origin: 'Egypt (ca. 1275 BCE, New Kingdom)',
    bio: 'This papyrus from the reign of Ramesses II contains over 200 dream interpretations, organized by good and bad omens. The Egyptians believed that gods communicate through dreams. Priests of Serapis practiced temple sleep (incubation) to receive healing dream visions. The work demonstrates the systematic dream interpretation of one of the oldest civilizations.',
  },
  [ReligiousSource.SOMNIALE_DANIELIS]: {
    title: 'Somniale Danielis',
    desc: 'Byzantine-medieval dream lexicon attributed to the Prophet Daniel and widely distributed across Europe over centuries.',
    origin: 'Byzantium / Europe (7th–15th century)',
    bio: 'The Somniale Danielis is one of the most widely distributed dream interpretation books of the Middle Ages. It arranges dream symbols alphabetically and provides concise interpretations. Attribution to the biblical Daniel lent the work authority. It was transmitted in Greek, Latin, and numerous vernacular languages, influencing European dream culture for over a millennium.',
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
  [ReligiousSource.IMAM_SADIQ]: {
    title: 'Imam Jafar al-Sadiq',
    desc: 'The sixth Imam of Twelver Shia Islam and a distinguished scholar whose dream interpretation teachings remain foundational in Shia tradition.',
    origin: 'Medina, Arabia (702–765 CE)',
    bio: 'Imam Jafar al-Sadiq was a descendant of Prophet Muhammad and is regarded as one of the most learned Imams. His dream interpretation connects Quranic symbolism with the spiritual hierarchy of the Ahl al-Bayt. He taught that true dreams are divine messages and systematized their interpretation according to Shia principles.',
  },
  [ReligiousSource.ISLAMSKI_SONNIK]: {
    title: 'Islamic Dream Book (Russian)',
    desc: 'A Russian-Islamic dream book that synthesizes Islamic dream interpretation traditions with elements of Slavic folk culture.',
    origin: 'Russia / Central Asia (19th–20th century)',
    bio: 'The Islamski Sonnik emerged from Muslim communities in Russia and Central Asia. It combines classical Islamic dream interpretation from Ibn Sirin and al-Nabulsi with regional folk beliefs. The work reflects the cultural synthesis that Islam underwent in the Russian-Turkestani world.',
  },
  [ReligiousSource.EDGAR_CAYCE]: {
    title: 'Edgar Cayce',
    desc: 'American psychic and "Sleeping Prophet" who gave thousands of dream interpretations and life readings while in a trance state.',
    origin: 'Hopkinsville, Kentucky, USA (1877–1945)',
    bio: 'Edgar Cayce gave over 14,000 documented "readings" while in a sleep state. He viewed dreams as communication between the conscious and superconscious mind. His interpretations blend Christian mysticism, reincarnation, and holistic health. The Association for Research and Enlightenment preserves his legacy.',
  },
  [ReligiousSource.RUDOLF_STEINER]: {
    title: 'Rudolf Steiner',
    desc: 'Founder of Anthroposophy who understood sleep as the soul\'s journey into spiritual worlds and interpreted dreams as threshold phenomena.',
    origin: 'Kraljevec (now Croatia) / Dornach, Switzerland (1861–1925)',
    bio: 'Rudolf Steiner described sleep as a state in which the ego and astral body leave the physical body and enter higher worlds. Dreams arise during the transition between waking and sleeping. His dream interpretation is based on knowledge of supersensible worlds and the spiritual development of humanity.',
  },
  [ReligiousSource.ZHOU_GONG]: {
    title: 'Zhou Gong (Duke of Zhou)',
    desc: 'The oldest and most influential Chinese dream interpretation book, traditionally attributed to the Duke of Zhou.',
    origin: 'China (ca. 1000 BCE)',
    bio: 'Zhou Gong Jie Meng (Duke of Zhou\'s Dream Interpretation) has been the standard work of Chinese dream interpretation for over 3,000 years. The Duke of Zhou was regent of the early Zhou Dynasty and is revered as a sage. The work categorizes dreams by themes such as heaven, earth, animals, and objects, linking them to fortune or misfortune.',
  },
  [ReligiousSource.HATSUYUME]: {
    title: 'Hatsuyume (First Dream)',
    desc: 'Japanese tradition of interpreting the first dream of the new year as an omen for the coming year.',
    origin: 'Japan (since the Edo period, 17th–19th century)',
    bio: 'Hatsuyume refers to the first dream in the night of January 1st to 2nd. The most famous interpretation rule is "Ichi-Fuji, Ni-Taka, San-Nasubi" — Mount Fuji as the best dream, a hawk as second best, and an eggplant as third best. This tradition reflects the Shinto belief in auspicious signs.',
  },
  [ReligiousSource.SWAPNA_SHASTRA]: {
    title: 'Swapna Shastra',
    desc: 'Vedic and Hindu dream science that interprets dreams as messages from the gods and reflections of karma.',
    origin: 'India (ca. 1500 BCE–500 CE)',
    bio: 'Swapna Shastra encompasses dream interpretation texts from the Vedas, Upanishads, and Puranas. Dreams are classified into prophetic, karmic, and meaningless categories. The Mandukya Upanishad describes four states of consciousness, with the dream state (Svapna) considered an independent level of reality. Ayurveda links dream types to the three Doshas.',
  },
  [ReligiousSource.TALMUD_BERAKHOT]: {
    title: 'Talmud Berakhot',
    desc: 'The Babylonian Talmud contains the most extensive rabbinic discussion of dream interpretation in Tractate Berakhot (55a–57b).',
    origin: 'Babylonia (3rd–5th century CE)',
    bio: 'The rabbis systematically discuss the meaning of dreams in the Talmud. Rabbi Chisda teaches: "An uninterpreted dream is like an unread letter." The text contains rules for good and bad dream signs, the ritual of "Hatavat Chalom" (dream improvement), and the teaching that dreams constitute one-sixtieth of prophecy.',
  },
  [ReligiousSource.ZOHAR]: {
    title: 'Zohar (Sefer ha-Zohar)',
    desc: 'The principal work of Jewish Kabbalah containing profound mystical dream interpretation through the doctrine of the Sefirot and divine emanations.',
    origin: 'Spain / Provence (13th century)',
    bio: 'The Zohar, traditionally attributed to Rabbi Shimon bar Yochai, was composed by Moses de Leon in the 13th century. It teaches that the soul ascends during sleep and receives divine visions. Dreams are messages from higher worlds filtered through the ten Sefirot of the Tree of Life. Every dream symbol has a mystical correspondence.',
  },
  [ReligiousSource.VANGA]: {
    title: 'Baba Vanga',
    desc: 'Bulgarian blind seer whose prophetic dream interpretations gained wide popularity in Eastern Europe and Russia.',
    origin: 'Petrich, Bulgaria (1911–1996)',
    bio: 'Vangeliya Pandeva Gushterova, known as Baba Vanga, lost her sight at age 12 and reportedly developed clairvoyant abilities. She interpreted dreams as prophetic messages, combining Slavic folk beliefs with Christian mysticism. Millions consulted her during her lifetime, and her dream interpretations were collected in popular sonniks.',
  },
  [ReligiousSource.MILLER_RU]: {
    title: 'Gustavus H. Miller (Russian Edition)',
    desc: 'Russian adaptation of the American dream interpretation classic by G.H. Miller, one of the most widely read sonniks in Russia.',
    origin: 'Russia (19th–20th century)',
    bio: 'Gustavus Hindman Miller\'s "10,000 Dreams Interpreted" became a bestseller in Russia and was adapted numerous times. The Russian version supplements the original with Slavic folk symbolism and practical life wisdom. With thousands of alphabetically ordered symbols, it is one of the most comprehensive sonniks, bridging Western psychology with Russian dream tradition.',
  },
  [ReligiousSource.FREUD_RU]: {
    title: 'Freud (Russian Folk Adaptation)',
    desc: 'Simplified Russian folk version of Freudian dream interpretation, making psychoanalytic concepts accessible to everyday readers.',
    origin: 'Russia (20th century)',
    bio: 'This popular adaptation translates Freud\'s complex psychoanalysis into a practical reference work. Unconscious desires, repressed drives, and sexual symbolism are explained in simple language. Unlike Freud\'s original work, the Russian sonnik offers direct symbol-to-meaning mappings accessible to Russian readers.',
  },
  [ReligiousSource.LOFF]: {
    title: 'David Loff',
    desc: 'Russian sonnik author known for his folk-oriented and practical approach to dream interpretation.',
    origin: 'Russia (20th century)',
    bio: 'David Loff\'s dream interpretation book is widely distributed in the Russian-speaking world. He combines elements of modern psychology with everyday life experience. His approach is less theoretical than Freud or Jung and focuses on the practical meaning of dream symbols in the context of daily life.',
  },
  [ReligiousSource.NOSTRADAMUS_RU]: {
    title: 'Nostradamus (Russian Adaptation)',
    desc: 'Russian adaptation of prophetic dream symbolism based on Nostradamus interpretations and apocalyptic visions.',
    origin: 'Russia (20th century)',
    bio: 'This sonnik combines the prophetic quatrains of Michel de Nostredame with Russian dream interpretation tradition. Dream symbols are interpreted as omens for personal and world-historical events. The work emphasizes the prophetic dimension of dreams and their connection to questions of destiny.',
  },
  [ReligiousSource.ARTEMIDOROS]: {
    title: 'Artemidorus of Daldis',
    desc: 'Greek dream interpreter of the 2nd century, author of the "Oneirocritica" — the most influential dream interpretation work of antiquity.',
    origin: 'Ephesus / Daldis, Asia Minor (2nd century CE)',
    bio: 'Artemidorus traveled the ancient world collecting thousands of dream interpretations. His five-volume "Oneirocritica" distinguishes between prophetic dreams (oneiroi) and meaningless sleep images (enhypnia). He emphasized the dreamer\'s context — profession, gender, and social status influenced interpretation. His work shaped European dream interpretation well into the modern era.',
  },
  [ReligiousSource.EGYPTIAN_PAPYRUS]: {
    title: 'Egyptian Dream Papyrus',
    desc: 'The Chester Beatty Papyrus III is the oldest surviving dream interpretation book in the world, originating from Ancient Egypt.',
    origin: 'Egypt (ca. 1275 BCE, New Kingdom)',
    bio: 'This papyrus from the reign of Ramesses II contains over 200 dream interpretations, organized by good and bad omens. The Egyptians believed that gods communicate through dreams. Priests of Serapis practiced temple sleep (incubation) to receive healing dream visions. The work demonstrates the systematic dream interpretation of one of the oldest civilizations.',
  },
  [ReligiousSource.SOMNIALE_DANIELIS]: {
    title: 'Somniale Danielis',
    desc: 'Byzantine-medieval dream lexicon attributed to the Prophet Daniel and widely distributed across Europe over centuries.',
    origin: 'Byzantium / Europe (7th–15th century)',
    bio: 'The Somniale Danielis is one of the most widely distributed dream interpretation books of the Middle Ages. It arranges dream symbols alphabetically and provides concise interpretations. Attribution to the biblical Daniel lent the work authority. It was transmitted in Greek, Latin, and numerous vernacular languages, influencing European dream culture for over a millennium.',
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
  [ReligiousSource.IMAM_SADIQ]: {
    title: 'Imam Jafar al-Sadiq',
    desc: 'The sixth Imam of Twelver Shia Islam and a distinguished scholar whose dream interpretation teachings remain foundational in Shia tradition.',
    origin: 'Medina, Arabia (702–765 CE)',
    bio: 'Imam Jafar al-Sadiq was a descendant of Prophet Muhammad and is regarded as one of the most learned Imams. His dream interpretation connects Quranic symbolism with the spiritual hierarchy of the Ahl al-Bayt. He taught that true dreams are divine messages and systematized their interpretation according to Shia principles.',
  },
  [ReligiousSource.ISLAMSKI_SONNIK]: {
    title: 'Islamic Dream Book (Russian)',
    desc: 'A Russian-Islamic dream book that synthesizes Islamic dream interpretation traditions with elements of Slavic folk culture.',
    origin: 'Russia / Central Asia (19th–20th century)',
    bio: 'The Islamski Sonnik emerged from Muslim communities in Russia and Central Asia. It combines classical Islamic dream interpretation from Ibn Sirin and al-Nabulsi with regional folk beliefs. The work reflects the cultural synthesis that Islam underwent in the Russian-Turkestani world.',
  },
  [ReligiousSource.EDGAR_CAYCE]: {
    title: 'Edgar Cayce',
    desc: 'American psychic and "Sleeping Prophet" who gave thousands of dream interpretations and life readings while in a trance state.',
    origin: 'Hopkinsville, Kentucky, USA (1877–1945)',
    bio: 'Edgar Cayce gave over 14,000 documented "readings" while in a sleep state. He viewed dreams as communication between the conscious and superconscious mind. His interpretations blend Christian mysticism, reincarnation, and holistic health. The Association for Research and Enlightenment preserves his legacy.',
  },
  [ReligiousSource.RUDOLF_STEINER]: {
    title: 'Rudolf Steiner',
    desc: 'Founder of Anthroposophy who understood sleep as the soul\'s journey into spiritual worlds and interpreted dreams as threshold phenomena.',
    origin: 'Kraljevec (now Croatia) / Dornach, Switzerland (1861–1925)',
    bio: 'Rudolf Steiner described sleep as a state in which the ego and astral body leave the physical body and enter higher worlds. Dreams arise during the transition between waking and sleeping. His dream interpretation is based on knowledge of supersensible worlds and the spiritual development of humanity.',
  },
  [ReligiousSource.ZHOU_GONG]: {
    title: 'Zhou Gong (Duke of Zhou)',
    desc: 'The oldest and most influential Chinese dream interpretation book, traditionally attributed to the Duke of Zhou.',
    origin: 'China (ca. 1000 BCE)',
    bio: 'Zhou Gong Jie Meng (Duke of Zhou\'s Dream Interpretation) has been the standard work of Chinese dream interpretation for over 3,000 years. The Duke of Zhou was regent of the early Zhou Dynasty and is revered as a sage. The work categorizes dreams by themes such as heaven, earth, animals, and objects, linking them to fortune or misfortune.',
  },
  [ReligiousSource.HATSUYUME]: {
    title: 'Hatsuyume (First Dream)',
    desc: 'Japanese tradition of interpreting the first dream of the new year as an omen for the coming year.',
    origin: 'Japan (since the Edo period, 17th–19th century)',
    bio: 'Hatsuyume refers to the first dream in the night of January 1st to 2nd. The most famous interpretation rule is "Ichi-Fuji, Ni-Taka, San-Nasubi" — Mount Fuji as the best dream, a hawk as second best, and an eggplant as third best. This tradition reflects the Shinto belief in auspicious signs.',
  },
  [ReligiousSource.SWAPNA_SHASTRA]: {
    title: 'Swapna Shastra',
    desc: 'Vedic and Hindu dream science that interprets dreams as messages from the gods and reflections of karma.',
    origin: 'India (ca. 1500 BCE–500 CE)',
    bio: 'Swapna Shastra encompasses dream interpretation texts from the Vedas, Upanishads, and Puranas. Dreams are classified into prophetic, karmic, and meaningless categories. The Mandukya Upanishad describes four states of consciousness, with the dream state (Svapna) considered an independent level of reality. Ayurveda links dream types to the three Doshas.',
  },
  [ReligiousSource.TALMUD_BERAKHOT]: {
    title: 'Talmud Berakhot',
    desc: 'The Babylonian Talmud contains the most extensive rabbinic discussion of dream interpretation in Tractate Berakhot (55a–57b).',
    origin: 'Babylonia (3rd–5th century CE)',
    bio: 'The rabbis systematically discuss the meaning of dreams in the Talmud. Rabbi Chisda teaches: "An uninterpreted dream is like an unread letter." The text contains rules for good and bad dream signs, the ritual of "Hatavat Chalom" (dream improvement), and the teaching that dreams constitute one-sixtieth of prophecy.',
  },
  [ReligiousSource.ZOHAR]: {
    title: 'Zohar (Sefer ha-Zohar)',
    desc: 'The principal work of Jewish Kabbalah containing profound mystical dream interpretation through the doctrine of the Sefirot and divine emanations.',
    origin: 'Spain / Provence (13th century)',
    bio: 'The Zohar, traditionally attributed to Rabbi Shimon bar Yochai, was composed by Moses de Leon in the 13th century. It teaches that the soul ascends during sleep and receives divine visions. Dreams are messages from higher worlds filtered through the ten Sefirot of the Tree of Life. Every dream symbol has a mystical correspondence.',
  },
  [ReligiousSource.VANGA]: {
    title: 'Baba Vanga',
    desc: 'Bulgarian blind seer whose prophetic dream interpretations gained wide popularity in Eastern Europe and Russia.',
    origin: 'Petrich, Bulgaria (1911–1996)',
    bio: 'Vangeliya Pandeva Gushterova, known as Baba Vanga, lost her sight at age 12 and reportedly developed clairvoyant abilities. She interpreted dreams as prophetic messages, combining Slavic folk beliefs with Christian mysticism. Millions consulted her during her lifetime, and her dream interpretations were collected in popular sonniks.',
  },
  [ReligiousSource.MILLER_RU]: {
    title: 'Gustavus H. Miller (Russian Edition)',
    desc: 'Russian adaptation of the American dream interpretation classic by G.H. Miller, one of the most widely read sonniks in Russia.',
    origin: 'Russia (19th–20th century)',
    bio: 'Gustavus Hindman Miller\'s "10,000 Dreams Interpreted" became a bestseller in Russia and was adapted numerous times. The Russian version supplements the original with Slavic folk symbolism and practical life wisdom. With thousands of alphabetically ordered symbols, it is one of the most comprehensive sonniks, bridging Western psychology with Russian dream tradition.',
  },
  [ReligiousSource.FREUD_RU]: {
    title: 'Freud (Russian Folk Adaptation)',
    desc: 'Simplified Russian folk version of Freudian dream interpretation, making psychoanalytic concepts accessible to everyday readers.',
    origin: 'Russia (20th century)',
    bio: 'This popular adaptation translates Freud\'s complex psychoanalysis into a practical reference work. Unconscious desires, repressed drives, and sexual symbolism are explained in simple language. Unlike Freud\'s original work, the Russian sonnik offers direct symbol-to-meaning mappings accessible to Russian readers.',
  },
  [ReligiousSource.LOFF]: {
    title: 'David Loff',
    desc: 'Russian sonnik author known for his folk-oriented and practical approach to dream interpretation.',
    origin: 'Russia (20th century)',
    bio: 'David Loff\'s dream interpretation book is widely distributed in the Russian-speaking world. He combines elements of modern psychology with everyday life experience. His approach is less theoretical than Freud or Jung and focuses on the practical meaning of dream symbols in the context of daily life.',
  },
  [ReligiousSource.NOSTRADAMUS_RU]: {
    title: 'Nostradamus (Russian Adaptation)',
    desc: 'Russian adaptation of prophetic dream symbolism based on Nostradamus interpretations and apocalyptic visions.',
    origin: 'Russia (20th century)',
    bio: 'This sonnik combines the prophetic quatrains of Michel de Nostredame with Russian dream interpretation tradition. Dream symbols are interpreted as omens for personal and world-historical events. The work emphasizes the prophetic dimension of dreams and their connection to questions of destiny.',
  },
  [ReligiousSource.ARTEMIDOROS]: {
    title: 'Artemidorus of Daldis',
    desc: 'Greek dream interpreter of the 2nd century, author of the "Oneirocritica" — the most influential dream interpretation work of antiquity.',
    origin: 'Ephesus / Daldis, Asia Minor (2nd century CE)',
    bio: 'Artemidorus traveled the ancient world collecting thousands of dream interpretations. His five-volume "Oneirocritica" distinguishes between prophetic dreams (oneiroi) and meaningless sleep images (enhypnia). He emphasized the dreamer\'s context — profession, gender, and social status influenced interpretation. His work shaped European dream interpretation well into the modern era.',
  },
  [ReligiousSource.EGYPTIAN_PAPYRUS]: {
    title: 'Egyptian Dream Papyrus',
    desc: 'The Chester Beatty Papyrus III is the oldest surviving dream interpretation book in the world, originating from Ancient Egypt.',
    origin: 'Egypt (ca. 1275 BCE, New Kingdom)',
    bio: 'This papyrus from the reign of Ramesses II contains over 200 dream interpretations, organized by good and bad omens. The Egyptians believed that gods communicate through dreams. Priests of Serapis practiced temple sleep (incubation) to receive healing dream visions. The work demonstrates the systematic dream interpretation of one of the oldest civilizations.',
  },
  [ReligiousSource.SOMNIALE_DANIELIS]: {
    title: 'Somniale Danielis',
    desc: 'Byzantine-medieval dream lexicon attributed to the Prophet Daniel and widely distributed across Europe over centuries.',
    origin: 'Byzantium / Europe (7th–15th century)',
    bio: 'The Somniale Danielis is one of the most widely distributed dream interpretation books of the Middle Ages. It arranges dream symbols alphabetically and provides concise interpretations. Attribution to the biblical Daniel lent the work authority. It was transmitted in Greek, Latin, and numerous vernacular languages, influencing European dream culture for over a millennium.',
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
  [ReligiousSource.IMAM_SADIQ]: {
    title: 'Imam Jafar al-Sadiq',
    desc: 'The sixth Imam of Twelver Shia Islam and a distinguished scholar whose dream interpretation teachings remain foundational in Shia tradition.',
    origin: 'Medina, Arabia (702–765 CE)',
    bio: 'Imam Jafar al-Sadiq was a descendant of Prophet Muhammad and is regarded as one of the most learned Imams. His dream interpretation connects Quranic symbolism with the spiritual hierarchy of the Ahl al-Bayt. He taught that true dreams are divine messages and systematized their interpretation according to Shia principles.',
  },
  [ReligiousSource.ISLAMSKI_SONNIK]: {
    title: 'Islamic Dream Book (Russian)',
    desc: 'A Russian-Islamic dream book that synthesizes Islamic dream interpretation traditions with elements of Slavic folk culture.',
    origin: 'Russia / Central Asia (19th–20th century)',
    bio: 'The Islamski Sonnik emerged from Muslim communities in Russia and Central Asia. It combines classical Islamic dream interpretation from Ibn Sirin and al-Nabulsi with regional folk beliefs. The work reflects the cultural synthesis that Islam underwent in the Russian-Turkestani world.',
  },
  [ReligiousSource.EDGAR_CAYCE]: {
    title: 'Edgar Cayce',
    desc: 'American psychic and "Sleeping Prophet" who gave thousands of dream interpretations and life readings while in a trance state.',
    origin: 'Hopkinsville, Kentucky, USA (1877–1945)',
    bio: 'Edgar Cayce gave over 14,000 documented "readings" while in a sleep state. He viewed dreams as communication between the conscious and superconscious mind. His interpretations blend Christian mysticism, reincarnation, and holistic health. The Association for Research and Enlightenment preserves his legacy.',
  },
  [ReligiousSource.RUDOLF_STEINER]: {
    title: 'Rudolf Steiner',
    desc: 'Founder of Anthroposophy who understood sleep as the soul\'s journey into spiritual worlds and interpreted dreams as threshold phenomena.',
    origin: 'Kraljevec (now Croatia) / Dornach, Switzerland (1861–1925)',
    bio: 'Rudolf Steiner described sleep as a state in which the ego and astral body leave the physical body and enter higher worlds. Dreams arise during the transition between waking and sleeping. His dream interpretation is based on knowledge of supersensible worlds and the spiritual development of humanity.',
  },
  [ReligiousSource.ZHOU_GONG]: {
    title: 'Zhou Gong (Duke of Zhou)',
    desc: 'The oldest and most influential Chinese dream interpretation book, traditionally attributed to the Duke of Zhou.',
    origin: 'China (ca. 1000 BCE)',
    bio: 'Zhou Gong Jie Meng (Duke of Zhou\'s Dream Interpretation) has been the standard work of Chinese dream interpretation for over 3,000 years. The Duke of Zhou was regent of the early Zhou Dynasty and is revered as a sage. The work categorizes dreams by themes such as heaven, earth, animals, and objects, linking them to fortune or misfortune.',
  },
  [ReligiousSource.HATSUYUME]: {
    title: 'Hatsuyume (First Dream)',
    desc: 'Japanese tradition of interpreting the first dream of the new year as an omen for the coming year.',
    origin: 'Japan (since the Edo period, 17th–19th century)',
    bio: 'Hatsuyume refers to the first dream in the night of January 1st to 2nd. The most famous interpretation rule is "Ichi-Fuji, Ni-Taka, San-Nasubi" — Mount Fuji as the best dream, a hawk as second best, and an eggplant as third best. This tradition reflects the Shinto belief in auspicious signs.',
  },
  [ReligiousSource.SWAPNA_SHASTRA]: {
    title: 'Swapna Shastra',
    desc: 'Vedic and Hindu dream science that interprets dreams as messages from the gods and reflections of karma.',
    origin: 'India (ca. 1500 BCE–500 CE)',
    bio: 'Swapna Shastra encompasses dream interpretation texts from the Vedas, Upanishads, and Puranas. Dreams are classified into prophetic, karmic, and meaningless categories. The Mandukya Upanishad describes four states of consciousness, with the dream state (Svapna) considered an independent level of reality. Ayurveda links dream types to the three Doshas.',
  },
  [ReligiousSource.TALMUD_BERAKHOT]: {
    title: 'Talmud Berakhot',
    desc: 'The Babylonian Talmud contains the most extensive rabbinic discussion of dream interpretation in Tractate Berakhot (55a–57b).',
    origin: 'Babylonia (3rd–5th century CE)',
    bio: 'The rabbis systematically discuss the meaning of dreams in the Talmud. Rabbi Chisda teaches: "An uninterpreted dream is like an unread letter." The text contains rules for good and bad dream signs, the ritual of "Hatavat Chalom" (dream improvement), and the teaching that dreams constitute one-sixtieth of prophecy.',
  },
  [ReligiousSource.ZOHAR]: {
    title: 'Zohar (Sefer ha-Zohar)',
    desc: 'The principal work of Jewish Kabbalah containing profound mystical dream interpretation through the doctrine of the Sefirot and divine emanations.',
    origin: 'Spain / Provence (13th century)',
    bio: 'The Zohar, traditionally attributed to Rabbi Shimon bar Yochai, was composed by Moses de Leon in the 13th century. It teaches that the soul ascends during sleep and receives divine visions. Dreams are messages from higher worlds filtered through the ten Sefirot of the Tree of Life. Every dream symbol has a mystical correspondence.',
  },
  [ReligiousSource.VANGA]: {
    title: 'Baba Vanga',
    desc: 'Bulgarian blind seer whose prophetic dream interpretations gained wide popularity in Eastern Europe and Russia.',
    origin: 'Petrich, Bulgaria (1911–1996)',
    bio: 'Vangeliya Pandeva Gushterova, known as Baba Vanga, lost her sight at age 12 and reportedly developed clairvoyant abilities. She interpreted dreams as prophetic messages, combining Slavic folk beliefs with Christian mysticism. Millions consulted her during her lifetime, and her dream interpretations were collected in popular sonniks.',
  },
  [ReligiousSource.MILLER_RU]: {
    title: 'Gustavus H. Miller (Russian Edition)',
    desc: 'Russian adaptation of the American dream interpretation classic by G.H. Miller, one of the most widely read sonniks in Russia.',
    origin: 'Russia (19th–20th century)',
    bio: 'Gustavus Hindman Miller\'s "10,000 Dreams Interpreted" became a bestseller in Russia and was adapted numerous times. The Russian version supplements the original with Slavic folk symbolism and practical life wisdom. With thousands of alphabetically ordered symbols, it is one of the most comprehensive sonniks, bridging Western psychology with Russian dream tradition.',
  },
  [ReligiousSource.FREUD_RU]: {
    title: 'Freud (Russian Folk Adaptation)',
    desc: 'Simplified Russian folk version of Freudian dream interpretation, making psychoanalytic concepts accessible to everyday readers.',
    origin: 'Russia (20th century)',
    bio: 'This popular adaptation translates Freud\'s complex psychoanalysis into a practical reference work. Unconscious desires, repressed drives, and sexual symbolism are explained in simple language. Unlike Freud\'s original work, the Russian sonnik offers direct symbol-to-meaning mappings accessible to Russian readers.',
  },
  [ReligiousSource.LOFF]: {
    title: 'David Loff',
    desc: 'Russian sonnik author known for his folk-oriented and practical approach to dream interpretation.',
    origin: 'Russia (20th century)',
    bio: 'David Loff\'s dream interpretation book is widely distributed in the Russian-speaking world. He combines elements of modern psychology with everyday life experience. His approach is less theoretical than Freud or Jung and focuses on the practical meaning of dream symbols in the context of daily life.',
  },
  [ReligiousSource.NOSTRADAMUS_RU]: {
    title: 'Nostradamus (Russian Adaptation)',
    desc: 'Russian adaptation of prophetic dream symbolism based on Nostradamus interpretations and apocalyptic visions.',
    origin: 'Russia (20th century)',
    bio: 'This sonnik combines the prophetic quatrains of Michel de Nostredame with Russian dream interpretation tradition. Dream symbols are interpreted as omens for personal and world-historical events. The work emphasizes the prophetic dimension of dreams and their connection to questions of destiny.',
  },
  [ReligiousSource.ARTEMIDOROS]: {
    title: 'Artemidorus of Daldis',
    desc: 'Greek dream interpreter of the 2nd century, author of the "Oneirocritica" — the most influential dream interpretation work of antiquity.',
    origin: 'Ephesus / Daldis, Asia Minor (2nd century CE)',
    bio: 'Artemidorus traveled the ancient world collecting thousands of dream interpretations. His five-volume "Oneirocritica" distinguishes between prophetic dreams (oneiroi) and meaningless sleep images (enhypnia). He emphasized the dreamer\'s context — profession, gender, and social status influenced interpretation. His work shaped European dream interpretation well into the modern era.',
  },
  [ReligiousSource.EGYPTIAN_PAPYRUS]: {
    title: 'Egyptian Dream Papyrus',
    desc: 'The Chester Beatty Papyrus III is the oldest surviving dream interpretation book in the world, originating from Ancient Egypt.',
    origin: 'Egypt (ca. 1275 BCE, New Kingdom)',
    bio: 'This papyrus from the reign of Ramesses II contains over 200 dream interpretations, organized by good and bad omens. The Egyptians believed that gods communicate through dreams. Priests of Serapis practiced temple sleep (incubation) to receive healing dream visions. The work demonstrates the systematic dream interpretation of one of the oldest civilizations.',
  },
  [ReligiousSource.SOMNIALE_DANIELIS]: {
    title: 'Somniale Danielis',
    desc: 'Byzantine-medieval dream lexicon attributed to the Prophet Daniel and widely distributed across Europe over centuries.',
    origin: 'Byzantium / Europe (7th–15th century)',
    bio: 'The Somniale Danielis is one of the most widely distributed dream interpretation books of the Middle Ages. It arranges dream symbols alphabetically and provides concise interpretations. Attribution to the biblical Daniel lent the work authority. It was transmitted in Greek, Latin, and numerous vernacular languages, influencing European dream culture for over a millennium.',
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
  [ReligiousSource.IMAM_SADIQ]: {
    title: 'Imam Jafar al-Sadiq',
    desc: 'The sixth Imam of Twelver Shia Islam and a distinguished scholar whose dream interpretation teachings remain foundational in Shia tradition.',
    origin: 'Medina, Arabia (702–765 CE)',
    bio: 'Imam Jafar al-Sadiq was a descendant of Prophet Muhammad and is regarded as one of the most learned Imams. His dream interpretation connects Quranic symbolism with the spiritual hierarchy of the Ahl al-Bayt. He taught that true dreams are divine messages and systematized their interpretation according to Shia principles.',
  },
  [ReligiousSource.ISLAMSKI_SONNIK]: {
    title: 'Islamic Dream Book (Russian)',
    desc: 'A Russian-Islamic dream book that synthesizes Islamic dream interpretation traditions with elements of Slavic folk culture.',
    origin: 'Russia / Central Asia (19th–20th century)',
    bio: 'The Islamski Sonnik emerged from Muslim communities in Russia and Central Asia. It combines classical Islamic dream interpretation from Ibn Sirin and al-Nabulsi with regional folk beliefs. The work reflects the cultural synthesis that Islam underwent in the Russian-Turkestani world.',
  },
  [ReligiousSource.EDGAR_CAYCE]: {
    title: 'Edgar Cayce',
    desc: 'American psychic and "Sleeping Prophet" who gave thousands of dream interpretations and life readings while in a trance state.',
    origin: 'Hopkinsville, Kentucky, USA (1877–1945)',
    bio: 'Edgar Cayce gave over 14,000 documented "readings" while in a sleep state. He viewed dreams as communication between the conscious and superconscious mind. His interpretations blend Christian mysticism, reincarnation, and holistic health. The Association for Research and Enlightenment preserves his legacy.',
  },
  [ReligiousSource.RUDOLF_STEINER]: {
    title: 'Rudolf Steiner',
    desc: 'Founder of Anthroposophy who understood sleep as the soul\'s journey into spiritual worlds and interpreted dreams as threshold phenomena.',
    origin: 'Kraljevec (now Croatia) / Dornach, Switzerland (1861–1925)',
    bio: 'Rudolf Steiner described sleep as a state in which the ego and astral body leave the physical body and enter higher worlds. Dreams arise during the transition between waking and sleeping. His dream interpretation is based on knowledge of supersensible worlds and the spiritual development of humanity.',
  },
  [ReligiousSource.ZHOU_GONG]: {
    title: 'Zhou Gong (Duke of Zhou)',
    desc: 'The oldest and most influential Chinese dream interpretation book, traditionally attributed to the Duke of Zhou.',
    origin: 'China (ca. 1000 BCE)',
    bio: 'Zhou Gong Jie Meng (Duke of Zhou\'s Dream Interpretation) has been the standard work of Chinese dream interpretation for over 3,000 years. The Duke of Zhou was regent of the early Zhou Dynasty and is revered as a sage. The work categorizes dreams by themes such as heaven, earth, animals, and objects, linking them to fortune or misfortune.',
  },
  [ReligiousSource.HATSUYUME]: {
    title: 'Hatsuyume (First Dream)',
    desc: 'Japanese tradition of interpreting the first dream of the new year as an omen for the coming year.',
    origin: 'Japan (since the Edo period, 17th–19th century)',
    bio: 'Hatsuyume refers to the first dream in the night of January 1st to 2nd. The most famous interpretation rule is "Ichi-Fuji, Ni-Taka, San-Nasubi" — Mount Fuji as the best dream, a hawk as second best, and an eggplant as third best. This tradition reflects the Shinto belief in auspicious signs.',
  },
  [ReligiousSource.SWAPNA_SHASTRA]: {
    title: 'Swapna Shastra',
    desc: 'Vedic and Hindu dream science that interprets dreams as messages from the gods and reflections of karma.',
    origin: 'India (ca. 1500 BCE–500 CE)',
    bio: 'Swapna Shastra encompasses dream interpretation texts from the Vedas, Upanishads, and Puranas. Dreams are classified into prophetic, karmic, and meaningless categories. The Mandukya Upanishad describes four states of consciousness, with the dream state (Svapna) considered an independent level of reality. Ayurveda links dream types to the three Doshas.',
  },
  [ReligiousSource.TALMUD_BERAKHOT]: {
    title: 'Talmud Berakhot',
    desc: 'The Babylonian Talmud contains the most extensive rabbinic discussion of dream interpretation in Tractate Berakhot (55a–57b).',
    origin: 'Babylonia (3rd–5th century CE)',
    bio: 'The rabbis systematically discuss the meaning of dreams in the Talmud. Rabbi Chisda teaches: "An uninterpreted dream is like an unread letter." The text contains rules for good and bad dream signs, the ritual of "Hatavat Chalom" (dream improvement), and the teaching that dreams constitute one-sixtieth of prophecy.',
  },
  [ReligiousSource.ZOHAR]: {
    title: 'Zohar (Sefer ha-Zohar)',
    desc: 'The principal work of Jewish Kabbalah containing profound mystical dream interpretation through the doctrine of the Sefirot and divine emanations.',
    origin: 'Spain / Provence (13th century)',
    bio: 'The Zohar, traditionally attributed to Rabbi Shimon bar Yochai, was composed by Moses de Leon in the 13th century. It teaches that the soul ascends during sleep and receives divine visions. Dreams are messages from higher worlds filtered through the ten Sefirot of the Tree of Life. Every dream symbol has a mystical correspondence.',
  },
  [ReligiousSource.VANGA]: {
    title: 'Baba Vanga',
    desc: 'Bulgarian blind seer whose prophetic dream interpretations gained wide popularity in Eastern Europe and Russia.',
    origin: 'Petrich, Bulgaria (1911–1996)',
    bio: 'Vangeliya Pandeva Gushterova, known as Baba Vanga, lost her sight at age 12 and reportedly developed clairvoyant abilities. She interpreted dreams as prophetic messages, combining Slavic folk beliefs with Christian mysticism. Millions consulted her during her lifetime, and her dream interpretations were collected in popular sonniks.',
  },
  [ReligiousSource.MILLER_RU]: {
    title: 'Gustavus H. Miller (Russian Edition)',
    desc: 'Russian adaptation of the American dream interpretation classic by G.H. Miller, one of the most widely read sonniks in Russia.',
    origin: 'Russia (19th–20th century)',
    bio: 'Gustavus Hindman Miller\'s "10,000 Dreams Interpreted" became a bestseller in Russia and was adapted numerous times. The Russian version supplements the original with Slavic folk symbolism and practical life wisdom. With thousands of alphabetically ordered symbols, it is one of the most comprehensive sonniks, bridging Western psychology with Russian dream tradition.',
  },
  [ReligiousSource.FREUD_RU]: {
    title: 'Freud (Russian Folk Adaptation)',
    desc: 'Simplified Russian folk version of Freudian dream interpretation, making psychoanalytic concepts accessible to everyday readers.',
    origin: 'Russia (20th century)',
    bio: 'This popular adaptation translates Freud\'s complex psychoanalysis into a practical reference work. Unconscious desires, repressed drives, and sexual symbolism are explained in simple language. Unlike Freud\'s original work, the Russian sonnik offers direct symbol-to-meaning mappings accessible to Russian readers.',
  },
  [ReligiousSource.LOFF]: {
    title: 'David Loff',
    desc: 'Russian sonnik author known for his folk-oriented and practical approach to dream interpretation.',
    origin: 'Russia (20th century)',
    bio: 'David Loff\'s dream interpretation book is widely distributed in the Russian-speaking world. He combines elements of modern psychology with everyday life experience. His approach is less theoretical than Freud or Jung and focuses on the practical meaning of dream symbols in the context of daily life.',
  },
  [ReligiousSource.NOSTRADAMUS_RU]: {
    title: 'Nostradamus (Russian Adaptation)',
    desc: 'Russian adaptation of prophetic dream symbolism based on Nostradamus interpretations and apocalyptic visions.',
    origin: 'Russia (20th century)',
    bio: 'This sonnik combines the prophetic quatrains of Michel de Nostredame with Russian dream interpretation tradition. Dream symbols are interpreted as omens for personal and world-historical events. The work emphasizes the prophetic dimension of dreams and their connection to questions of destiny.',
  },
  [ReligiousSource.ARTEMIDOROS]: {
    title: 'Artemidorus of Daldis',
    desc: 'Greek dream interpreter of the 2nd century, author of the "Oneirocritica" — the most influential dream interpretation work of antiquity.',
    origin: 'Ephesus / Daldis, Asia Minor (2nd century CE)',
    bio: 'Artemidorus traveled the ancient world collecting thousands of dream interpretations. His five-volume "Oneirocritica" distinguishes between prophetic dreams (oneiroi) and meaningless sleep images (enhypnia). He emphasized the dreamer\'s context — profession, gender, and social status influenced interpretation. His work shaped European dream interpretation well into the modern era.',
  },
  [ReligiousSource.EGYPTIAN_PAPYRUS]: {
    title: 'Egyptian Dream Papyrus',
    desc: 'The Chester Beatty Papyrus III is the oldest surviving dream interpretation book in the world, originating from Ancient Egypt.',
    origin: 'Egypt (ca. 1275 BCE, New Kingdom)',
    bio: 'This papyrus from the reign of Ramesses II contains over 200 dream interpretations, organized by good and bad omens. The Egyptians believed that gods communicate through dreams. Priests of Serapis practiced temple sleep (incubation) to receive healing dream visions. The work demonstrates the systematic dream interpretation of one of the oldest civilizations.',
  },
  [ReligiousSource.SOMNIALE_DANIELIS]: {
    title: 'Somniale Danielis',
    desc: 'Byzantine-medieval dream lexicon attributed to the Prophet Daniel and widely distributed across Europe over centuries.',
    origin: 'Byzantium / Europe (7th–15th century)',
    bio: 'The Somniale Danielis is one of the most widely distributed dream interpretation books of the Middle Ages. It arranges dream symbols alphabetically and provides concise interpretations. Attribution to the biblical Daniel lent the work authority. It was transmitted in Greek, Latin, and numerous vernacular languages, influencing European dream culture for over a millennium.',
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
