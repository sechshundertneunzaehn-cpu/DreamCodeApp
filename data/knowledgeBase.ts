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

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE_BASE – Hauptexport (sprachbasiert für InfoModal)
// ─────────────────────────────────────────────────────────────────────────────

export const KNOWLEDGE_BASE: Record<string, any> = {
  // Sprachbasierte Source-Info (für InfoModal in App.tsx)
  [Language.DE]: SOURCE_INFO_DE,

  // Englisch: identische Struktur, wird von App als Fallback genutzt
  [Language.EN]: SOURCE_INFO_DE, // KI übersetzt bei Bedarf on-the-fly

  // Alle weiteren Sprachen fallen auf DE zurück (App-Logik: KNOWLEDGE_BASE[language] || KNOWLEDGE_BASE[Language.DE])

  // Statische Inhalte (Symbol-Lexikon, Kategorien, Traditionen)
  symbols,
  categories,
  traditions,
};

export default KNOWLEDGE_BASE;
