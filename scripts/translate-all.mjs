#!/usr/bin/env node
/**
 * Übersetzt alle Landing-Page-Strings in 22 Sprachen via OpenRouter API.
 * Generiert: src/i18n/locales/<lang>.ts pro Sprache
 *
 * Usage: node scripts/translate-all.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = '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';
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');

// ═══════════════════════════════════════════════════════════════════
// ALLE 22 SPRACHEN
// ═══════════════════════════════════════════════════════════════════
const ALL_LANGS = [
  'de','en','tr','es','fr','ar','pt','ru',
  'zh','hi','ja','ko','id','fa','it','pl','bn','ur','vi','th','sw','hu'
];

const LANG_NAMES = {
  de:'German',en:'English',tr:'Turkish',es:'Spanish',fr:'French',ar:'Arabic',
  pt:'Portuguese',ru:'Russian',zh:'Chinese (Simplified)',hi:'Hindi',ja:'Japanese',
  ko:'Korean',id:'Indonesian',fa:'Persian',it:'Italian',pl:'Polish',bn:'Bengali',
  ur:'Urdu',vi:'Vietnamese',th:'Thai',sw:'Swahili',hu:'Hungarian'
};

// ═══════════════════════════════════════════════════════════════════
// DEUTSCHE BASIS-ÜBERSETZUNGEN (VOLLSTÄNDIG)
// ═══════════════════════════════════════════════════════════════════
const DE = {
  // ─── NAVBAR ───
  'nav.features': 'Features',
  'nav.samedream': 'SameDream',
  'nav.traditions': 'Traumdeutung',
  'nav.cosmic': 'Kosmische DNA',
  'nav.moon': 'MondSync',
  'nav.reviews': 'Bewertungen',
  'nav.download': 'Download',
  'nav.cta': 'Jetzt starten',

  // ─── HERO ───
  'hero.badge': 'KI-gestützte Traumdeutung -- 20+ Sprachen',
  'hero.title1': 'Entschlüssle die',
  'hero.title2': 'Sprache',
  'hero.title3': 'deiner Seele',
  'hero.subtitle': 'Wo Jahrtausende alter Weisheit auf revolutionäre Künstliche Intelligenz trifft. Traumdeutung, Kosmische DNA und MondSync -- alles in einer App, die dein Unterbewusstsein entschlüsselt.',
  'hero.cta1': 'Entdecke DreamCode',
  'hero.cta2': 'Bewertungen lesen',
  'hero.trust.mobile': 'iOS & Android',
  'hero.trust.lang': '20+ Sprachen',
  'hero.trust.stars': '4.9 / 5 Sterne',

  // ─── CTA ───
  'cta.badge': 'Kostenlos starten -- kein Abo nötig',
  'cta.title1': 'Bereit, deine Träume',
  'cta.title2': 'zu entschlüsseln?',
  'cta.subtitle': 'Tausende Menschen weltweit nutzen DreamCode bereits, um sich selbst besser zu verstehen. Starte jetzt -- dein erstes Traumerlebnis ist kostenlos.',
  'cta.button': 'DreamCode starten',
  'cta.available': 'Verfügbar für iOS & Android -- www.dream-code.app',

  // ─── THEME ───
  'theme.light': 'Hellmodus',
  'theme.dark': 'Dunkelmodus',

  // ─── FEATURES ───
  'features.badge': 'Drei Säulen',
  'features.title': 'Eine App.',
  'features.titleHighlight': 'Drei Dimensionen.',
  'features.subtitle': 'DreamCode verbindet drei machtvolle Module zu einem ganzheitlichen Erlebnis, das weit über einfache Traumdeutung hinausgeht.',
  'features.pillar1.title': 'KI-Traumdeutung',
  'features.pillar1.desc': '6 Deutungstraditionen -- von islamischer Mystik über Freud & Jung bis hin zu fernöstlicher Weisheit. Dein persönlicher KI-Therapeut führt ein Gespräch, so natürlich wie mit einem Mentor.',
  'features.pillar1.tag1': '6 Traditionen',
  'features.pillar1.tag2': 'Live-Dialog',
  'features.pillar1.tag3': 'Personalisiert',
  'features.pillar2.title': 'Kosmische DNA',
  'features.pillar2.desc': 'Dein kosmischer Fingerabdruck: Sternzeichen, Aszendent, Mondknoten und Lebenspfadzahl verschmelzen zu deinem einzigartigen Seelenprofil. Verstehe, wer du wirklich bist.',
  'features.pillar2.tag1': 'Sternzeichen',
  'features.pillar2.tag2': 'Lebenspfadzahl',
  'features.pillar2.tag3': 'Seelenprofil',
  'features.pillar3.title': 'MondSync',
  'features.pillar3.desc': 'Die Mondphasen beeinflussen deine Träume und Emotionen. MondSync synchronisiert deine Traumanalyse mit dem aktuellen Mondzyklus -- für tiefere Einsichten, die im Einklang mit dem Kosmos stehen.',
  'features.pillar3.tag1': 'Mondphasen',
  'features.pillar3.tag2': 'Zyklusanalyse',
  'features.pillar3.tag3': 'Kosmisch',
  'features.sub1.label': 'Traum-Visualisierung',
  'features.sub1.desc': '4 KI-Stile: Cartoon, Anime, Real, Fantasy',
  'features.sub2.label': 'Spracheingabe',
  'features.sub2.desc': 'Erzähle deinen Traum -- die KI hört zu',
  'features.sub3.label': '20+ Sprachen',
  'features.sub3.desc': 'DE, EN, TR, ES, FR, AR, PT, RU + Dialekte & KI',
  'features.sub4.label': 'PDF-Export',
  'features.sub4.desc': 'Deine Deutung als professionelles Dokument',

  // ─── SAMEDREAM ───
  'same.badge': 'Das Herzstück von DreamCode',
  'same.live': 'Live-Daten aus der App',
  'same.openTab': 'In neuem Tab öffnen',
  'same.title1': 'Wer hat das',
  'same.title2': 'Gleiche',
  'same.title3': 'geträumt?',
  'same.subtitle': 'Du wachst auf und denkst: "War das nur ich?" -- Die Antwort ist fast immer: Nein. Tausende Menschen weltweit träumen jede Nacht dasselbe. DreamCode verbindet euch -- über Kontinente, Kulturen und Sprachen hinweg.',
  'same.stat.dreams': 'Träume analysiert',
  'same.stat.countries': 'Länder vernetzt',
  'same.stat.dreamers': 'aktive Träumer',
  'same.dreamsNow': 'Gerade eben -- weltweit geträumt',
  'same.dream1': '"Ich bin gefallen -- endlos, ohne Boden..."',
  'same.dream2': '"Meine Zähne sind ausgefallen..."',
  'same.dream3': '"Ich konnte fliegen -- über eine Stadt..."',
  'same.sameDream': 'Gleicher Traum:',
  'same.inCountries': 'In Ländern:',
  'same.howTitle': 'So findet DreamCode deinen',
  'same.howTitleHighlight': 'Traum-Zwilling',
  'same.howSubtitle': 'Unsere KI vergleicht nicht nur Wörter -- sie versteht Symbole, Emotionen und narrative Muster.',
  'same.step1.title': 'Du traumst',
  'same.step1.desc': 'Erzähle deinen Traum per Text oder Spracheingabe. Die KI analysiert Symbole, Emotionen und Muster.',
  'same.step2.title': 'Globaler Abgleich',
  'same.step2.desc': 'DreamCode durchsucht seine Datenbank mit über 850.000 Träumen weltweit nach ähnlichen Erlebnissen.',
  'same.step3.title': 'Verbindung',
  'same.step3.desc': 'Sieh, wer den gleichen Traum hatte -- egal ob in Tokyo, Istanbul oder Buenos Aires. Du bist nicht allein.',
  'same.step4.title': 'Kollektive Einsicht',
  'same.step4.desc': 'Entdecke globale Traum-Trends, regionale Muster und die universelle Sprache des Unterbewusstseins.',
  'same.moreTitle': 'Mehr als nur',
  'same.moreTitleHighlight': 'Matching',
  'same.moreSubtitle': 'SameDream ist ein ganzes Ökosystem -- eine Brücke zwischen Fremden, die auf einer tieferen Ebene verbunden sind.',
  'same.feat1.title': 'Dream Map',
  'same.feat1.desc': 'Eine interaktive Weltkarte zeigt dir in Echtzeit, wo auf der Welt jemand gerade den gleichen Traum hatte wie du.',
  'same.feat2.title': 'Traum-Trends',
  'same.feat2.desc': 'Welche Träume sind gerade weltweit am häufigsten? Entdecke kollektive Muster und saisonale Wellen.',
  'same.feat3.title': 'Dream Hub',
  'same.feat3.desc': 'Tausche dich anonym mit Menschen aus, die dasselbe geträumt haben. Gemeinsam entschlüsselt ihr die Bedeutung.',
  'same.feat4.title': 'Seelen-Verbindungen',
  'same.feat4.desc': 'Manche Träume verbinden Fremde. DreamCode zeigt dir, mit wem du auf einer tieferen Ebene verknüpft bist.',
  'same.mapBadge': 'Dream Map -- Live-Weltkarte',
  'same.mapTitle1': 'Sieh in Echtzeit, wo auf der Welt',
  'same.mapTitle2': 'jemand',
  'same.mapTitle3': 'deinen Traum',
  'same.mapTitle4': 'teilt',
  'same.mapDesc': 'Die interaktive Dream Map zeigt live, welche Träume gerade weltweit geteilt werden. Pulsierende Punkte markieren aktive Träumer -- vielleicht teilt jemand auf der anderen Seite der Welt gerade deinen Traum.',
  'same.mapActive': 'gerade aktiv',
  'same.mapMatches': 'neue Matches',
  'same.mapButton': 'Dream Map öffnen',
  'same.closerTitle': 'Du bist nie allein mit deinen Träumen',
  'same.closerDesc': 'Jede Nacht teilen Millionen von Menschen dieselben Visionen, Ängste und Hoffnungen. DreamCode macht diese unsichtbaren Verbindungen sichtbar -- und zeigt dir, dass die Sprache der Seele universal ist.',
  'same.closerButton': 'Finde deinen Traum-Zwilling',

  // ─── COSMIC DNA ───
  'cosmic.badge': 'Modul 2',
  'cosmic.title': 'Deine',
  'cosmic.titleHighlight': 'Kosmische DNA',
  'cosmic.subtitle': 'Jeder Mensch trägt einen einzigartigen kosmischen Fingerabdruck. DreamCode entschlüsselt deinen -- und nutzt ihn, um deine Träume auf einer völlig neuen Ebene zu verstehen.',
  'cosmic.el1.title': 'Sternzeichen-Profil',
  'cosmic.el1.desc': 'Dein Sonnenzeichen, Mondzeichen und Aszendent bilden die Grundlage deines kosmischen Fingerabdrucks. DreamCode berechnet alle drei aus deinen Geburtsdaten und entschlüsselt ihre Wechselwirkung.',
  'cosmic.el1.highlight': 'Sonne + Mond + Aszendent = deine kosmische Trinität',
  'cosmic.el2.title': 'Lebenspfadzahl',
  'cosmic.el2.desc': 'Nach den Lehren des Pythagoras und der Kabbalah berechnet DreamCode deine Lebenspfadzahl aus deinem Geburtsdatum. Diese Zahl offenbart deine Lebensaufgabe, verborgene Talente und karmische Lektionen.',
  'cosmic.el2.highlight': 'Deine numerologische Bestimmung auf einen Blick',
  'cosmic.el3.title': 'Mondknoten-Analyse',
  'cosmic.el3.desc': 'Die Mondknoten zeigen, woher deine Seele kommt und wohin sie strebt. Der aufsteigende Knoten weist deinen Weg -- der absteigende offenbart vergangene Leben und Muster, die es zu überwinden gilt.',
  'cosmic.el3.highlight': 'Vergangenheit, Gegenwart, Zukunft -- in einem Profil',
  'cosmic.whyTitle': 'Warum deine Kosmische DNA alles verändert',
  'cosmic.benefit1': 'Personalisierte Traumdeutungen basierend auf deinem kosmischen Profil',
  'cosmic.benefit2': 'Automatische Berechnung bei der Erstregistrierung',
  'cosmic.benefit3': 'Einzigartig wie dein DNA -- kein Profil gleicht dem anderen',

  // ─── MOONSYNC ───
  'moon.badge': 'Modul 3',
  'moon.title': 'MondSync',
  'moon.titleSuffix': '-- Träume im Einklang',
  'moon.subtitle': 'Seit Jahrtausenden wissen die Menschen: Der Mond beeinflusst unsere Träume. MondSync macht dieses uralte Wissen messbar und nutzt es für präzisere Deutungen.',
  'moon.phase1.name': 'Neumond',
  'moon.phase1.meaning': 'Neue Anfänge & Intentionen',
  'moon.phase1.effect': 'Deine Träume tragen Samen zukünftiger Entwicklungen. Die KI erkennt Neuanfänge und verborgene Wünsche in deinen nächtlichen Visionen.',
  'moon.phase2.name': 'Zunehmender Mond',
  'moon.phase2.meaning': 'Wachstum & Manifestation',
  'moon.phase2.effect': 'Phase der Stärke und des Aufbaus. Träume werden intensiver, Symbole deutlicher. Ideal für Zielvisualisierungen und Wachstumsdeutungen.',
  'moon.phase3.name': 'Vollmond',
  'moon.phase3.meaning': 'Höchste Intensität & Klarheit',
  'moon.phase3.effect': 'Die kraftvollste Nacht des Zyklus. Luzide Träume häufen sich, emotionale Tiefe erreicht ihren Höhepunkt. Die KI analysiert besonders tiefgreifend.',
  'moon.phase4.name': 'Abnehmender Mond',
  'moon.phase4.meaning': 'Loslassen & Reflexion',
  'moon.phase4.effect': 'Zeit des Loslassens. Die KI identifiziert wiederkehrende Muster, die bereit sind, losgelassen zu werden. Reinigung und Transformation.',
  'moon.whatTitle': 'Was MondSync für dich tut',
  'moon.whatSubtitle': 'Kein esoterisches Spielzeug -- ein präzises Werkzeug, das den Mondzyklus in jede Analyse einbezieht.',
  'moon.feat1.title': 'Mondkalender',
  'moon.feat1.desc': 'Live-Tracking der aktuellen Mondphase mit täglich angepasster Traumanalyse.',
  'moon.feat2.title': 'Emotionale Resonanz',
  'moon.feat2.desc': 'Verstehe, wie der Mondzyklus deine emotionale Traumlandschaft beeinflusst.',
  'moon.feat3.title': 'Zyklusbasierte KI',
  'moon.feat3.desc': 'Die Deutungs-KI passt ihre Interpretation automatisch an die aktuelle Mondphase an.',
  'moon.feat4.title': 'Mond-Insights',
  'moon.feat4.desc': 'Wöchentliche und monatliche Mond-Berichte über deine Traummuster.',

  // ─── TRADITIONS ───
  'trad.badge': '9 Deutungstraditionen',
  'trad.title': 'Wähle deine',
  'trad.titleHighlight': 'Tradition',
  'trad.subtitle': 'DreamCode ist die einzige App weltweit, die 9 verschiedene Deutungstraditionen in einer KI vereint -- von der islamischen Mystik über Jungsche Archetypen bis hin zu antiken Quellen.',
  'trad.islamic.title': 'Islamische Tradition',
  'trad.islamic.subtitle': 'Die Weisheit des Orients',
  'trad.islamic.desc': 'Tauche ein in die mystische Tiefe der arabischen Traumdeutung mit Originalquellen:',
  'trad.christian.title': 'Christliche Mystik',
  'trad.christian.subtitle': '& Theologie',
  'trad.christian.desc': 'Von der Antike bis zur Moderne -- biblische Symbolik verstehen:',
  'trad.buddhist.title': 'Buddhistische Weisheit',
  'trad.buddhist.subtitle': 'Zen, Tibet & Theravada',
  'trad.buddhist.desc': 'Erforsche das Bewusstsein jenseits des Egos:',
  'trad.astrology.title': 'Astrologie',
  'trad.astrology.subtitle': 'Sterne, Planeten & Häuser',
  'trad.astrology.desc': 'Die kosmische Dimension deiner Träume:',
  'trad.psychology.title': 'Psychologische Analyse',
  'trad.psychology.subtitle': 'Der Blick in die Psyche',
  'trad.psychology.desc': 'Lass deinen Traum von den Pionieren der Psychoanalyse zerlegen:',
  'trad.numerology.title': 'Numerologie',
  'trad.numerology.subtitle': 'Zahlen, Ebjed & Kabbalah',
  'trad.numerology.desc': 'Die mystische Sprache der Zahlen in deinen Träumen:',
  'trad.jewish.title': 'Jüdische Tradition',
  'trad.jewish.subtitle': 'Talmud, Kabbalah & Zohar',
  'trad.jewish.desc': 'Von der biblischen Prophetie bis zur kabbalistischen Mystik:',
  'trad.sonniks.title': 'Sonniks',
  'trad.sonniks.subtitle': 'Russische Traumbücher',
  'trad.sonniks.desc': 'Die slawische Volksweisheit der Traumdeutung:',
  'trad.ancient.title': 'Antike Quellen',
  'trad.ancient.subtitle': 'Ägypten, Griechenland & Rom',
  'trad.ancient.desc': 'Die ältesten Traumdeutungstraditionen der Menschheit:',
  'trad.aiStep1.title': 'Du erzählst',
  'trad.aiStep1.desc': 'Beschreibe deinen Traum ganz natürlich -- per Text oder Spracheingabe.',
  'trad.aiStep2.title': 'Die KI versteht',
  'trad.aiStep2.desc': 'Intelligente Rückfragen: "War der Raum dunkel? Wie hast du dich gefühlt?"',
  'trad.aiStep3.title': 'Deine Analyse',
  'trad.aiStep3.desc': 'Eine maßgeschneiderte Deutung, abgestimmt auf deine Tradition und Lebenssituation.',

  // ─── SCIENCE ───
  'science.badge': 'Forschung & Daten',
  'science.title': 'Basiert auf',
  'science.titleHighlight': 'echter Wissenschaft',
  'science.subtitle': '15.776 Forschungsteilnehmer · 3 internationale Datenbanken · 99 peer-reviewte Studien.',
  'science.stat1.num': '39.075',
  'science.stat1.label': 'Wissenschaftliche Traumberichte',
  'science.stat2.num': '15.776',
  'science.stat2.label': 'Forschungsteilnehmer weltweit',
  'science.stat3.num': '99',
  'science.stat3.label': 'Peer-reviewte Studien importiert',
  'science.stat4.num': '258',
  'science.stat4.label': 'Traumsymbole ausführlich erklärt',
  'science.clickDetails': 'Klicke für Details →',

  // ─── BENEFITS ───
  'benefits.badge': 'Vorteile',
  'benefits.title': 'Warum',
  'benefits.titleHighlight': 'DreamCode',
  'benefits.subtitle': 'Nicht noch eine Traumdeutungs-App. DreamCode ist die erste App, die Jahrtausende altes Wissen mit modernster KI zu einem ganzheitlichen Erlebnis verbindet.',
  'benefits.b1.title': 'Datenschutz first',
  'benefits.b1.desc': 'Deine Träume sind intim. Alle Daten werden verschlüsselt gespeichert -- lokal auf deinem Gerät. Keine Cloud, kein Tracking.',
  'benefits.b2.title': 'Blitzschnelle KI',
  'benefits.b2.desc': 'Antworten in Sekunden, nicht Minuten. Unsere KI-Pipeline ist optimiert für sofortige, tiefgründige Deutungen.',
  'benefits.b3.title': '20+ Sprachen',
  'benefits.b3.desc': 'Deutsch, Englisch, Türkisch, Spanisch, Französisch, Arabisch, Portugiesisch, Russisch + arabische Dialekte und KI-Sprachen.',
  'benefits.b4.title': '4 Design-Themes',
  'benefits.b4.desc': 'Default, Feminin, Maskulin oder Natur -- wähle das Erscheinungsbild, das zu dir passt. Plus Dark/Light Mode.',
  'benefits.b5.title': 'Offline-für-immer',
  'benefits.b5.desc': 'Deine gespeicherten Träume, Analysen und PDFs sind immer verfügbar -- auch ohne Internet.',
  'benefits.b6.title': 'Private & Sozial',
  'benefits.b6.desc': 'Teile nur, was du willst. Privat, Freunde oder Öffentlich -- du kontrollierst die Sichtbarkeit jeder Deutung.',
  'benefits.b7.title': 'Professionelle PDFs',
  'benefits.b7.desc': 'Exportiere deine Traumdeutung als elegantes PDF-Dokument -- perfekt zum Archivieren oder Teilen mit deinem Therapeuten.',
  'benefits.b8.title': 'Kostenloser Einstieg',
  'benefits.b8.desc': 'Starte gratis mit dem Free-Plan. Keine Kreditkarte nötig. Upgrade auf Silver, Gold oder Smart, wenn du bereit bist.',
  'benefits.rating': '4.9 von 5 Sternen',
  'benefits.recommended': 'Von über 12.000 Nutzern empfohlen',

  // ─── TESTIMONIALS ───
  'test.badge': 'Bewertungen',
  'test.title': 'Was unsere',
  'test.titleHighlight': 'Nutzer',
  'test.titleSuffix': 'sagen',
  'test.subtitle': 'Über 12.000 Menschen weltweit vertrauen DreamCode. Hier sind echte Stimmen aus unserer Community.',
  'test.trust1': 'Von Experten empfohlen',
  'test.trust2': 'Getestet & verifiziert',
  'test.trust3': 'Datenschutzkonform',
  'test.trust4': '12.000+ aktive Nutzer',
  'test.stat1.label': 'Aktive Nutzer',
  'test.stat2.label': 'Weiterempfehlung',
  'test.stat3.label': 'Durchschnittsbewertung',
  'test.stat4.label': 'Träume analysiert',

  // ─── DOWNLOADS ───
  'dl.badge': 'Download',
  'dl.title': 'Jetzt DreamCode',
  'dl.titleHighlight': 'herunterladen',
  'dl.subtitle': 'Verfügbar im App Store und bei Google Play -- starte jetzt mit deiner persönlichen Traumdeutung.',
  'dl.appStore': 'Laden im App Store',
  'dl.appStoreBtn': 'Im App Store laden',
  'dl.appStoreSub': 'Verfügbar für iPhone & iPad',
  'dl.playStore': 'Jetzt bei Google Play',
  'dl.playStoreBtn': 'Bei Google Play laden',
  'dl.playStoreSub': 'Verfügbar für Android',
  'dl.allPremium': 'Alle Premium-Features verfügbar',
  'dl.exclusive': 'EXKLUSIV',
  'dl.directBadge': 'Direktdownload · Exklusive Vorteile',
  'dl.directTitle': 'Direkt laden.',
  'dl.directTitleHighlight': 'Mehr bekommen.',
  'dl.directSubtitle': 'Lade DreamCode direkt von dream-code.app — spare Store-Gebühren und erhalte Features die im App Store nicht verfügbar sind.',
  'dl.storeColumn': 'App Store / Play Store',
  'dl.store1': 'DreamGuard nicht verfügbar',
  'dl.store2': 'Sonniks + Antik gesperrt',
  'dl.store3': 'DreamAtlas Recherche kostenpflichtig',
  'dl.store4': 'Keine Coin-Boni',
  'dl.store5': 'Store-Gebühren (30%) enthalten',
  'dl.directColumn': 'APK Direkt — dream-code.app',
  'dl.direct1': 'DreamGuard / NightWatch inklusive',
  'dl.direct2': 'Sonniks + Antik freigeschaltet',
  'dl.direct3': '5€ DreamAtlas Guthaben/Monat',
  'dl.direct4': '+15% Coins bei jedem Kauf',
  'dl.direct5': 'Keine Store-Gebühren',
  'dl.apkButton': 'APK Direkt herunterladen',
  'dl.apkNote': 'Nur für Android · iOS via TestFlight bald verfügbar',
  'dl.freeIncluded': 'Kostenlos enthalten',
  'dl.free1': 'Traumdeutung (3x täglich)',
  'dl.free2': 'Kosmische DNA Profil',
  'dl.free3': 'MondSync Basis',
  'dl.free4': 'Dream Journal',
  'dl.free5': '20+ Sprachen',
  'dl.free6': 'Weltkarte & SameDream',
  'dl.premiumUpgrade': 'Premium-Upgrade jederzeit möglich',
  'dl.tiersTitle': 'Abo-Übersicht',
  'dl.tiersSubtitle': 'Finde den Plan, der zu dir passt',
  'dl.tierPopular': 'Beliebteste',

  // ─── FOOTER ───
  'footer.desc': 'Die erste App, die Jahrtausende alter Traumdeutungs-Weisheit mit modernster KI-Technologie verbindet. Entschlüssle die Sprache deiner Seele.',
  'footer.product': 'Produkt',
  'footer.research': 'Forschung',
  'footer.contact': 'Kontakt',
  'footer.copyright': 'Alle Rechte vorbehalten.',
  'footer.impressum': 'Impressum',
  'footer.datenschutz': 'Datenschutz',
  'footer.agb': 'AGB',

  // ─── DREAMGUARD ───
  'dg.badge': 'NightWatch · KI-Schlafanalyse',
  'dg.title1': 'Andere Apps fragen was du geträumt hast.',
  'dg.title2': 'DreamGuard weiß es bereits.',
  'dg.subtitle': 'Während du schläfst ist DreamGuard aktiv. Das Mikrofon empfängt Schwingungen und Töne — still, sicher, lokal.',
  'dg.feat1.title': 'Schlaf-Sprache erkennen',
  'dg.feat1.desc': 'Du redest im Schlaf? DreamGuard transkribiert es automatisch. Morgens siehst du was du gesagt hast — verknüpft mit deinem Traum.',
  'dg.feat2.title': 'Emotion Detection',
  'dg.feat2.desc': 'KI analysiert Tonlage: Angst, Freude, Trauer, Stress. Dein nächtlicher Emotion-Score: "73% ruhig · 27% Stress-Signale"',
  'dg.feat3.title': 'Optimaler Weckzeitpunkt',
  'dg.feat3.desc': 'Atemrhythmus-Analyse erkennt Schlafphasen. Sanfter Wecker in der Leichtschlafphase — kein brutales Aufwachen mitten im Tiefschlaf.',
  'dg.feat4.title': 'Dream Trigger',
  'dg.feat4.desc': 'Sanfte Binaural Beats und Frequenzen während des REM-Schlafs — wissenschaftlich bestätigt als Methode um Trauminhalte zu beeinflussen.',
  'dg.privacy': 'Alles 100% lokal auf deinem Gerät — keine Audiodaten verlassen dein Telefon. DSGVO-konform.',
  'dg.apkExclusive': 'APK EXKLUSIV',
  'dg.apkNote': 'DreamGuard ist nur für direkte APK-Downloads verfügbar — nicht im Store.',

  // ─── DREAM ALERTS ───
  'da.badge': 'Dream Alert System · Pro & VIP',
  'da.title1': 'Werde benachrichtigt wenn',
  'da.title2': 'jemand',
  'da.title3': 'deinen Traum',
  'da.title4': 'träumt',
  'da.subtitle': 'Erstelle Alerts für Traumthemen — und erhalte eine Meldung mit Link wenn jemand weltweit das Gleiche träumt.',
  'da.myAlerts': 'Meine aktiven Dream Alerts',
  'da.alert1': 'Fliegen über Wasser',
  'da.alert2': 'Schlangen im Traum',
  'da.matches': 'Matches',
  'da.active': 'aktiv',
  'da.proVip': 'Dream Alerts sind für Pro und VIP verfügbar',
  'da.viralTitle': 'Jemand hat von dir geträumt',
  'da.viralDesc': 'Wenn du jemanden in deinem Traum erwähnst, kannst du ihm einen anonymen Hinweis schicken. Geteilte Träume verbinden Menschen.',
  'da.shareButton': 'Traum teilen',

  // ─── LANGUAGES / ARABIC DIALECTS ───
  'lang.badge': 'Sprachen & KI-Sprachmodell',
  'lang.title': '20+ Sprachen --',
  'lang.titleHighlight': 'dein Traum, deine Sprache.',
  'lang.subtitle': 'DreamCode versteht dich in über 20 Sprachen und Dialekten -- von Hocharabisch über regionale Dialekte bis hin zu KI-gestützten Sprachen. Alle 6 Deutungstraditionen: Islam, Christlich, Buddhistisch, Astrologie, Psychologie und Numerologie.',
  'lang.mainTitle': 'Hauptsprachen (8)',
  'lang.dialectTitle': 'Arabische Dialekte (6)',
  'lang.aiTitle': 'Weitere Sprachen via KI (6+)',
  'lang.modelBadge': 'Sprachmodell',
  'lang.modelTitle': 'Was unser Sprachmodell kann',
  'lang.modelSubtitle': 'Alle 6 Traditionen -- Islam, Christlich, Buddhistisch, Astrologie, Psychologie, Numerologie -- in jeder unterstützten Sprache.',
  'lang.mf1.title': 'Alle 6 Deutungstraditionen',
  'lang.mf1.desc': 'Versteht kulturelle Nuancen jeder Tradition.',
  'lang.mf2.title': 'Dialekt-Erkennung',
  'lang.mf2.desc': 'Erkennt automatisch deinen Dialekt.',
  'lang.mf3.title': 'Code-Switching',
  'lang.mf3.desc': 'Versteht Sprachwechsel innerhalb eines Gesprächs.',
  'lang.mf4.title': 'Spracheingabe',
  'lang.mf4.desc': 'Erzähle deinen Traum mündlich in deiner Muttersprache.',
  'lang.mf5.title': 'Ebjed & Gematria',
  'lang.mf5.desc': 'Zahlenmystik in Arabisch und Hebräisch.',
  'lang.mf6.title': 'Kontextverständnis',
  'lang.mf6.desc': 'Regionale Traumsymbolik und kulturelle Nuancen.',
  'lang.closerTitle': 'Dein Traum,',
  'lang.closerTitleHighlight': 'deine Sprache.',
  'lang.closerDesc': 'Zum ersten Mal kannst du deinen Traum so erzählen, wie du ihn erlebt hast -- in deiner Muttersprache, in deinem Dialekt. Keine Übersetzung, kein Informationsverlust.',

  // ─── DIALECT NAMES ───
  'dialect.saudi': 'Saudi-Arabisch',
  'dialect.egyptian': 'Ägyptisch',
  'dialect.qatari': 'Katarisch / Golf',
  'dialect.moroccan': 'Marokkanisch (Darija)',
  'dialect.levantine': 'Levantinisch',
  'dialect.sudanese': 'Sudanesisch',

  // ─── VISION IDEAS ───
  'vision.badge': 'Vision 2026–2028',
  'vision.title': '5 Ideen die',
  'vision.titleHighlight': 'niemand',
  'vision.titleSuffix': 'sonst gesehen hat',
  'vision.subtitle': 'DreamCode ist nicht nur eine App — es ist ein Ökosystem das die Traumforschung weltweit verändert.',
  'vision.idea1.title': 'Psychisches Frühwarnsystem',
  'vision.idea1.desc': 'Wissenschaftliche Korrelationen zwischen Traummustern und Depression, PTSD, Angststörungen — peer-reviewed bestätigt. Der "Dream Health Score" wird die Zukunft der Prävention.',
  'vision.idea2.title': 'Sleep Device Integration',
  'vision.idea2.desc': 'Wenn dein Ring weiß dass du gerade geträumt hast. REM-Ende → automatischer stiller Prompt. Die Habit Loop die kein Competitor hat.',
  'vision.idea3.title': 'DreamLLM — Eigenes AI-Modell',
  'vision.idea3.desc': '54K+ Träume = Trainingsdatensatz den niemand sonst hat. Fine-tune Llama 3. In 18 Monaten: DreamLLM v1 — lizenzierbar an andere Apps. -90% API-Kosten intern.',
  'vision.idea4.title': '"Jemand hat von dir geträumt"',
  'vision.idea4.desc': 'Der mächtigste Satz der Welt — jeder Mensch würde diese Nachricht öffnen. K-Faktor 0,4. Besonders stark in islamischen und östlichen Kulturen.',
  'vision.idea5.title': 'Nicht eine KI — Ibn Sirin selbst spricht',
  'vision.idea5.desc': 'Ibn Sirin AI (AR) · C.G. Jung AI (DE) · Şeyh AI (TR) · Nostradamus AI (FR/ES). Eigene Stimme, eigenes Avatar, eigene Stilistik.',

  // ─── COST TRANSPARENCY ───
  'cost.title': 'Warum kosten manche Features mehr?',
  'cost.subtitle': 'Die App ist günstig — KI-Modelle von Google, Anthropic & Co. berechnen uns direkt. Tippe für Details.',
  'cost.apiLabel': 'API',
  'cost.youPay': 'Du zahlst:',
  'cost.feature': 'Feature',
  'cost.margin': 'Marge',
  'cost.explanation': 'Wenn du eine Premium-Deutung anfragst, schicken wir deine Anfrage an spezialisierte KI-Modelle — Google Gemini, Anthropic Claude, Replicate. Diese berechnen uns direkt pro Nutzung. DreamCode verdient sehr wenig pro Feature — der Großteil geht an die KI-Anbieter.',
};

// ═══════════════════════════════════════════════════════════════════
// TRANSLATION ENGINE
// ═══════════════════════════════════════════════════════════════════

const BACKOFF = [2000, 5000, 10000]; // model-strategy: 2s/5s/10s
const PRIMARY_MODEL = 'google/gemini-2.0-flash-001';
const FALLBACK_MODEL = 'deepseek/deepseek-chat-v3';

async function callOpenRouter(messages, model = PRIMARY_MODEL) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://dreamdata.world',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          max_tokens: 16000,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`  [RETRY ${attempt+1}/${model.split('/')[1]}] HTTP ${res.status}: ${err.slice(0,150)}`);
        await new Promise(r => setTimeout(r, BACKOFF[attempt]));
        continue;
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (e) {
      console.error(`  [RETRY ${attempt+1}] ${e.message}`);
      await new Promise(r => setTimeout(r, BACKOFF[attempt]));
    }
  }
  throw new Error(`3 retries failed on ${model}`);
}

function chunkObject(obj, chunkSize = 60) {
  const entries = Object.entries(obj);
  const chunks = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(Object.fromEntries(entries.slice(i, i + chunkSize)));
  }
  return chunks;
}

async function translateChunk(chunk, langCode, langName, model) {
  const systemPrompt = `You are a professional translator. Translate the JSON values from German to ${langName} (${langCode}).

RULES:
1. Keep all JSON keys UNCHANGED
2. Keep brand names unchanged: DreamCode, SameDream, MondSync, DreamGuard, NightWatch, DreamAtlas, Dream Map, Dream Hub, Dream Journal, Dream Trigger, DreamLLM
3. Keep technical terms: PDF, API, iOS, Android, App Store, Google Play, APK, DSGVO/GDPR, REM, KI/AI
4. Adapt "MondSync" to local moon-word if natural (e.g. MoonSync in English, AySync in Turkish)
5. Keep numbers, URLs, and emoji unchanged
6. Return ONLY valid JSON - no markdown, no explanation
7. Translate naturally and fluently, not word-by-word
8. For RTL languages (ar, fa, ur): translate the text, the app handles direction`;

  const result = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify(chunk, null, 2) },
  ], model);

  // Extract JSON from response
  let jsonStr = result.trim();
  // Remove markdown code blocks if present
  jsonStr = jsonStr.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '');

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // Try to find JSON in response
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    console.error(`  Failed to parse JSON for ${langCode}, chunk. Retrying...`);
    // Retry once
    const retry = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Translate this JSON from German to ${langName}. Return ONLY the JSON object, nothing else:\n${JSON.stringify(chunk)}` },
    ], model);
    const retryStr = retry.trim().replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '');
    return JSON.parse(retryStr);
  }
}

async function translateLanguage(langCode, langName, model) {
  console.log(`\n🌍 Translating to ${langName} (${langCode})...`);
  const chunks = chunkObject(DE, 60);
  const results = {};

  for (let i = 0; i < chunks.length; i++) {
    console.log(`  Chunk ${i+1}/${chunks.length}...`);
    try {
      const translated = await translateChunk(chunks[i], langCode, langName, model);
      Object.assign(results, translated);
    } catch (e) {
      console.error(`  ❌ Failed chunk ${i+1} for ${langCode}: ${e.message}`);
      // Use German as fallback
      Object.assign(results, chunks[i]);
    }
    // Rate limit pause
    if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 1500));
  }

  return results;
}

function writeLocaleFile(langCode, translations) {
  const content = `// Auto-generated — ${LANG_NAMES[langCode]} translations
// Generated: ${new Date().toISOString().split('T')[0]}

export const ${langCode}: Record<string, string> = ${JSON.stringify(translations, null, 2)};
`;

  const filePath = path.join(LOCALES_DIR, `${langCode}.ts`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✅ Written: ${filePath} (${Object.keys(translations).length} keys)`);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════');
  console.log(' DreamCode Landing Page — 22 Languages');
  console.log(`═══════════════════════════════════════`);
  console.log(`Total keys: ${Object.keys(DE).length}`);
  console.log(`Target languages: ${ALL_LANGS.length}`);

  // Ensure locales dir exists
  fs.mkdirSync(LOCALES_DIR, { recursive: true });

  // Write German base
  writeLocaleFile('de', DE);

  // Cheap paid models (rotate for throughput)
  const models = [
    'google/gemini-2.0-flash-001',
    'google/gemini-2.0-flash-001',
    'google/gemini-2.0-flash-001',
  ];

  // Translate all non-German languages
  const targetLangs = ALL_LANGS.filter(l => l !== 'de');

  // Process in parallel batches of 3
  for (let i = 0; i < targetLangs.length; i += 3) {
    const batch = targetLangs.slice(i, i + 3);
    console.log(`\n━━━ Batch ${Math.floor(i/3)+1}/${Math.ceil(targetLangs.length/3)} ━━━`);

    const promises = batch.map((lang, idx) => {
      const model = models[idx % models.length];
      console.log(`  → ${lang} via ${model.split('/')[1].split(':')[0]}`);
      return translateLanguage(lang, LANG_NAMES[lang], model)
        .then(result => {
          writeLocaleFile(lang, result);
          return { lang, success: true, keys: Object.keys(result).length };
        })
        .catch(err => {
          console.error(`  ❌ ${lang} FAILED: ${err.message}`);
          // Write German as fallback
          writeLocaleFile(lang, DE);
          return { lang, success: false };
        });
    });

    const results = await Promise.all(promises);
    results.forEach(r => {
      if (r.success) console.log(`  ✅ ${r.lang}: ${r.keys} keys`);
      else console.log(`  ❌ ${r.lang}: FALLBACK to German`);
    });

    // Pause between batches
    if (i + 3 < targetLangs.length) {
      console.log('  ⏳ Waiting 3s...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log(' DONE — All locale files generated');
  console.log('═══════════════════════════════════════');
}

main().catch(console.error);
