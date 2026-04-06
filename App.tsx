// !!! WICHTIG / IMPORTANT !!!
// DIESE DATEI (INSBESONDERE DIE PROCESS-LOGIC) IST FINALISIERT (FROZEN).
// KEINE ÄNDERUNGEN AN DER ABFOLGE (CONTEXT/CUSTOMER) VORNEHMEN, ES SEI DENN, ES WIRD EXPLIZIT GEFORDERT.
// STATUS: COMPLETED & LOCKED.

import React, { useState, useEffect, useRef } from 'react';
import StarryBackground from './components/StarryBackground';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy Loading: schwere Komponenten werden erst bei Bedarf geladen.
// ChunkLoadError nach Deploys wird durch den LazyFallback abgefangen (auto-reload).
import TrustBanner from './components/TrustBanner';
import VoiceSelector, { VoiceCharacter, VOICE_CHARACTERS } from './components/VoiceSelector';

const LiveSession = React.lazy(() => import('./components/LiveSession'));
const DreamHub = React.lazy(() => import('./components/DreamHub'));
const Profile = React.lazy(() => import('./components/Profile'));
const Onboarding = React.lazy(() => import('./components/Onboarding'));
const DreamCalendar = React.lazy(() => import('./components/DreamCalendar'));
const DreamMap = React.lazy(() => import('./components/DreamMap'));
const VideoStudio = React.lazy(() => import('./components/VideoStudio'));
const SpeechToVideoModal = React.lazy(() => import('./components/SpeechToVideoModal'));
const DreamNetwork = React.lazy(() => import('./components/DreamNetwork'));
const SciencePage = React.lazy(() => import('./components/SciencePage'));
const AGBPage = React.lazy(() => import('./components/AGBPage'));
const DatenschutzPage = React.lazy(() => import('./components/DatenschutzPage'));
const ImpressumPage = React.lazy(() => import('./components/ImpressumPage'));
const ForschungPage = React.lazy(() => import('./components/ForschungPage'));
const CensusPage = React.lazy(() => import('./components/CensusPage'));
const ScientificDreamMap = React.lazy(() => import('./components/ScientificDreamMap'));
const ResearchStudies = React.lazy(() => import('./components/ResearchStudies'));
const ParticipantProfile = React.lazy(() => import('./components/ParticipantProfile'));
const DreamSymbolsPage = React.lazy(() => import('./components/DreamSymbolsPage'));
import { View, ReligiousSource, Dream, Language, ReligiousCategory, UserProfile, FontSize, SubscriptionTier, ThemeMode, DesignTheme, AudioVisibility } from './types';
import { analyzeDreamText, generateDreamImage, generateImagePrompt, generateSpeechPreview, generateStoryVideo, generateDreamVideo, generateDreamNarrationVideo, generateDreamUserVoiceVideo } from './services/geminiService';
import { generateDreamVideo as generateReplicateVideo, isReplicateConfigured } from './services/videoGenerationService';
import StoryVideoPlayer from './components/StoryVideoPlayer';
import { loadDreamsSecurely, loadProfileSecurely, saveDreamsSecurely, saveProfileSecurely, exportDataToFile, importDataFromFile, syncStorageOnStartup } from './services/storage';
// Knowledge Base wird direkt importiert (wird für Analyse benötigt)
import { KNOWLEDGE_BASE } from './data/knowledgeBase';
import { FEATURE_PRICES, SUBSCRIPTION_TIERS, COIN_PACKAGES, REWARDS, coinToEur } from './config/pricing';
import { CATEGORY_ICONS, CATEGORY_ORDER, CATEGORY_SOURCE_MAP, CATEGORY_COLOR_SCHEME, CATEGORY_TIER_REQUIREMENT, getSourcesForCategories } from './config/traditions';

// --- SUBTITLES FOR SOURCES (Origins) - NOW MOVED TO TRANSLATIONS ---

// --- Data & Translations ---
const TRANSLATIONS: Record<Language, { app_title: string, app_subtitle: string, categories: Record<ReligiousCategory, string>, sources: Record<ReligiousSource, string>, source_subtitles: Record<ReligiousSource, string>, ui: any, processing: any, sub: any, earn: any, shop: any, smart_guide: any }> = {
    [Language.DE]: {
        app_title: "Traumcode | Dream Code",
        app_subtitle: "Das gesamte Wissen der Menschheit & ein Supercomputer – direkt in Ihrer Tasche",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Basra, Irak (7. Jh.)",
            [ReligiousSource.NABULSI]: "Damaskus, Syrien (17. Jh.)",
            [ReligiousSource.AL_ISKHAFI]: "Bagdad (Abbasiden)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Arabische Tradition (Ebced)",
            [ReligiousSource.MEDIEVAL]: "Europa (Mittelalter)",
            [ReligiousSource.MODERN_THEOLOGY]: "Westliche Theologie",
            [ReligiousSource.CHURCH_FATHERS]: "Rom & Byzanz (Patristik)",
            [ReligiousSource.ZEN]: "China & Japan",
            [ReligiousSource.TIBETAN]: "Tibet (Himalaya)",
            [ReligiousSource.THERAVADA]: "Südostasien (Pali-Kanon)",
            [ReligiousSource.FREUDIAN]: "Wien (Psychoanalyse)",
            [ReligiousSource.JUNGIAN]: "Zürich (Analytische Psych.)",
            [ReligiousSource.GESTALT]: "Berlin / New York",
            [ReligiousSource.WESTERN_ZODIAC]: "Hellenistische Tradition",
            [ReligiousSource.VEDIC_ASTROLOGY]: "Indien (Jyotish)",
            [ReligiousSource.CHINESE_ZODIAC]: "China (Mondkalender)",
            [ReligiousSource.PYTHAGOREAN]: "Antikes Griechenland",
            [ReligiousSource.CHALDEAN]: "Babylon (Mesopotamien)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Jüdische Mystik (Spanien)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Indien (Veden)",
            [ReligiousSource.IMAM_SADIQ]: "Schiitische Tradition, Persien",
            [ReligiousSource.ISLAMSKI_SONNIK]: "Russisch-Islamisch",
            [ReligiousSource.ZHOU_GONG]: "China, Traumdeutung",
            [ReligiousSource.HATSUYUME]: "Japan, Neujahrs-Traum",
            [ReligiousSource.SWAPNA_SHASTRA]: "Indien, Vedisch/Hindu",
            [ReligiousSource.EDGAR_CAYCE]: "USA, Schlafprophet",
            [ReligiousSource.RUDOLF_STEINER]: "Anthroposophie, Österreich",
            [ReligiousSource.TALMUD_BERAKHOT]: "Babylonien, 55a-57b",
            [ReligiousSource.ZOHAR]: "Kabbalistisch, 13. Jh.",
            [ReligiousSource.VANGA]: "Bulgarien, 20. Jh.",
            [ReligiousSource.MILLER_RU]: "Russische Traumdeutung",
            [ReligiousSource.FREUD_RU]: "Russische Freud-Adaption",
            [ReligiousSource.LOFF]: "Russischer Sonnik",
            [ReligiousSource.NOSTRADAMUS_RU]: "Russische Adaption",
            [ReligiousSource.ARTEMIDOROS]: "Griechenland, 2. Jh. n.Chr.",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "Ägypten, ca. 1275 v.Chr.",
            [ReligiousSource.SOMNIALE_DANIELIS]: "Byzantinisch-mittelalterlich"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islamisch', [ReligiousCategory.CHRISTIAN]: 'Christlich', [ReligiousCategory.BUDDHIST]: 'Buddhistisch', [ReligiousCategory.PSYCHOLOGICAL]: 'Psychologisch', [ReligiousCategory.ASTROLOGY]: 'Astrologie', [ReligiousCategory.NUMEROLOGY]: 'Numerologie', [ReligiousCategory.JEWISH]: 'Jüdisch', [ReligiousCategory.SONNIKS]: 'Sonniks', [ReligiousCategory.ANCIENT]: 'Antik',
        },
        sources: {
             [ReligiousSource.TIBETAN]: 'Tibetisch', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Mittelalterlich', [ReligiousSource.MODERN_THEOLOGY]: 'Moderne Theologie', [ReligiousSource.CHURCH_FATHERS]: 'Kirchenväter', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'C.G. Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Westlicher Zodiak', [ReligiousSource.VEDIC_ASTROLOGY]: 'Vedisch', [ReligiousSource.CHINESE_ZODIAC]: 'Chinesisch', [ReligiousSource.PYTHAGOREAN]: 'Pythagoras', [ReligiousSource.CHALDEAN]: 'Chaldäisch', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabbalah', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Ebced', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Vedische Zahlen', [ReligiousSource.IMAM_SADIQ]: 'Imam Sadiq', [ReligiousSource.ISLAMSKI_SONNIK]: 'Islamski Sonnik', [ReligiousSource.ZHOU_GONG]: 'Zhou Gong', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berakhot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artemidoros', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Ägypt. Papyrus', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Beschreibe deinen Traum...", interpret: "Traum Deuten", choose_tradition: "Tradition Wählen", refine_sources: "Quellen verfeinern", oracle_speaks: "Das Orakel spricht", close: "Schließen", listening: "Höre zu...", voices: "Stimme",
            settings: "Einstellungen", text_size: "Größe", dictation_error: "Fehler: Mikrofon nicht verfügbar.", dictation_perm: "Zugriff verweigert.",
            calendar_btn: "Kalender & Analyse", coming_soon: "Mehr...", calendar_desc: "Dein Traum-Journal",
            profile_btn: "Dein Profil", profile_desc: "Statistik & Ich",
            hub_btn: "Traum Hub", hub_desc: "Community Träume",
            gen_image: "Bild generieren", saved_msg: "Traum gespeichert! Siehe Kalender.",
            watch_ad: "Münzen verdienen", generate_video: "Video generieren (Gold)", create_dream_video: "Traumvideo",
            video_btn_short: "📹 Video generieren", video_duration_short: "30s, 180 Münzen",
            slideshow_btn: "📽️ Slideshow erstellen", slideshow_duration: "30s, 180 Münzen",
            premium_btn: "Premium / Abo", premium_desc: "Upgrade & Features",
            customer_file_btn: "Kundenkartei & Kontext",
            theme: "Erscheinungsbild", mode: "Modus", dark: "Dunkel", light: "Hell",
            style: "Design-Stil", style_def: "Standard (Mystic)", style_fem: "Feminin (Rose)", style_masc: "Maskulin (Blue)", style_nature: "Natur (Grün)",
            voice_char: "Stimm-Charakter", fem_char: "Weibliche Charaktere", male_char: "Männliche Charaktere", preview: "Vorschau",
            info_title: "Wissenskartei", info_bio: "Biografie & Konzept", info_origin: "Ursprung & Hintergrund",
            video_ready: "Dein Traumvideo ist bereit!", video_gen: "Generiere Video...", video_error: "Fehler bei der Generierung.",
            map_btn: "Wer hatte denselben Traum?",
            api_manager: "API Key Manager (Smart Tier)", api_desc: "Füge deine Gemini API Keys hinzu. Das System wechselt automatisch bei Limitüberschreitung.", add_key: "Key Hinzufügen", no_keys: "Keine Keys hinterlegt.",
            quality_normal: "Normal", quality_high: "High Quality",
            style_cartoon: "Cartoon", style_anime: "Anime", style_real: "Real", style_fantasy: "Fantasy",
            choose_quality: "Qualität wählen", choose_style: "Stil wählen",
            choose_image_style: "Bildstil wählen",
            choose_style_desc: "Wähle Qualität und Stil für dein Traumbild",
            continue_without_image: "Fortsetzen ohne Bildgenerierung",
            step_quality: "1. Qualität wählen",
            step_style: "2. Stil wählen",
            continue: "Weiter",
            social_proof_stats: "Bereits 47.832 Träume analysiert · 12.543 Traum-Matches gefunden",
            social_proof_testimonial1: "\"Endlich verstehe ich meine wiederkehrenden Träume!\" - Anna, 28",
            social_proof_testimonial2: "\"Die Multi-Perspektiven-Deutung ist einzigartig.\" - Michael, 34",
            social_proof_testimonial3: "\"Hab durch die App jemanden mit identischem Traum gefunden!\" - Sarah, 31",
            processing_context: "Berücksichtigt:",
            backup_title: "Daten-Tresor (Backup)",
            backup_desc: "Sichere deine Daten als Datei oder lade ein Backup hoch.",
            export_btn: "Backup herunterladen",
            import_btn: "Backup wiederherstellen",
            home_label: "Home",
            map_label: "Map",
            live_chat_label: "Live Chat",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5 Münzen Bonus: Video mit deiner Stimme!",
            audio_coin_desc: "Deine Aufnahme wird gespeichert. Im Profil kannst du ein Traum-Video mit deiner eigenen Stimme erstellen und 5 Münzen verdienen!",
            upload_audio: "Hochladen",
            upload_confirm_title: "Audio erfolgreich gespeichert!",
            upload_confirm_desc: "Deine Audioaufnahme wurde mit dem Traum gespeichert. Schau im Profil unter 'Audio' vorbei!",
            got_it: "Alles klar!",
            backup_restored: "Backup erfolgreich wiederhergestellt!",
            backup_error: "Fehler beim Wiederherstellen. Ungültige Datei.",
            storage_init: "Speicher wird initialisiert. Bitte warten.",
            mic_denied_alert: "Mikrofon-Zugriff verweigert",
            min_dreams_required: "Du benötigst mindestens 7 gedeutete Träume, um die Analysefunktion nutzen zu können.",
            base_version: "Basis Version",
            until_date: "Bis:",
            audio_recorded: "Audio aufgenommen",
            audio_saved_with_dream: "Wird mit Traum gespeichert",
            remove: "Entfernen",
            oracle_voice: "Orakel-Stimme",
            image_ready: "Bild bereit!",
            style_desc_cartoon: "Pixar-Stil",
            style_desc_anime: "Ghibli-Stil",
            style_desc_real: "Fotorealistisch",
            style_desc_fantasy: "Magisch",
            cosmic_dna: "Kosmische DNA",
            moon_sync: "Mond-Sync",
            cosmic_dna_body: "Deine Kosmische DNA ist dein einzigartiger Traum-Fingerabdruck — basierend auf Geburtsdatum, Sternzeichen und deinen Traummustern. Sie verbindet Astrologie, Numerologie und Psychologie zu einem persönlichen Traumschlüssel.",
            cosmic_dna_coming: "Demnächst",
            cosmic_dna_enter: "Gib dein Geburtsdatum in deinem Profil ein, um deine Kosmische DNA zu berechnen.",
            moon_phase_label: "Mondphase",
            dream_meaning_today: "Traumbedeutung heute",
            save_btn: "Speichern",
            age_restricted_cat: "Diese Kategorie ist nur für Personen ab 18 Jahren verfügbar.",
            ok: "OK",
            video_studio: "Video Studio",
            dream_network: "Traum-Netzwerk",
            privacy_link: "Datenschutz", terms_link: "AGB", imprint_link: "Impressum", research_link: "Forschung", studies_link: "Studien", worldmap_link: "Weltkarte", showing_sources_only: "Zeigt nur {0} Quellen", science_label: "Wissen",
        },
        processing: {
            title: "Orakel arbeitet...",
            step_analyze: "Traumdeutung wird analysiert",
            step_customer: "Kundenkontext wird berücksichtigt",
            step_no_customer: "Keine Kundendaten verfügbar",
            step_context: "Kategorien und Tradition werden mit berechnet",
            step_no_context: "Keine spezifischen Traditionen gewählt",
            step_image: "Das Bild wird erstellt",
            step_save: "Fertig im Kalender und im Profil gespeichert"
        },
        sub: {
            title: "Wähle deine Ebene",
            billing_monthly: "Monatlich", billing_yearly: "Jährlich",
            yearly_discount: "1 Monat geschenkt!",
            smart_discount: "Für Entwickler",
            free_title: "Free",
            free_price: "0 €",
            free_features: ["Basis-Traumdeutung (Werbefinanziert)", "Zugang zur Offerwall für Gratis-Münzen", "Premium-Funktionen per Münzen", "Nur Link-Teilung der Deutung"],
            silver_title: "Pro",
            silver_price: "4,99 € / Monat",
            silver_features: ["Komplett Werbefrei", "Unbegrenzte PDF-Konvertierung & Download", "Unbegrenzte Text-Deutungen", "25 HD-Bilder pro Monat", "1x wöchentlich Live-Chat mit KI", "Sprachsteuerung"],
            gold_title: "Gold (VIP)",
            gold_price: "12,99 € / Monat",
            gold_trial_text: "7 Tage gratis, dann 12,99 €/Mt",
            gold_features: ["Alles aus Pro inklusive", "Unbegrenzter Live-Chat mit dem Orakel", "5 Traum-Videos pro Monat", "Exklusiver Rabatt auf Münzkäufe", "Priority Support"],
            smart_title: "Smart (Entwickler)",
            smart_price: "49,99 € / Jahr",
            smart_features: ["Bring Your Own Key (BYOK)", "Alle Premium Features freigeschaltet", "Automatische Provider-Rotation", "Günstiger Jahrespreis (Fix 29,99€)"],
            smart_info_title: "Was ist der Smart Developer Tarif?",
            smart_info_text: "Für Entwickler & Tech-Enthusiasten: Erstelle Accounts bei KI-Providern (z.B. Google AI Studio), generiere dort deine eigenen API Keys und füge sie hier in der App ein. So zahlst du nur die günstigen API-Kosten direkt beim Provider + 3€ für die App-Nutzung. Perfekt für Power-User!",
            upgrade: "Upgrade", current: "Aktuell", unlock: "Freischalten", try_free: "7 TAGE GRATIS TESTEN",
            ad_loading: "Werbung wird geladen...", ad_reward: "Münzen erhalten!",
            bronze_title: "Free", bronze_features: ["3 Deutungen/Tag", "Groq-KI", "6 Traditionen", "Werbung"], bronze_price: "0 €",
            silver2_title: "Pro", silver2_features: ["Unbegrenzte Deutungen", "Gemini-KI", "Alle 9 Traditionen", "Keine Werbung", "100 Coins/Monat", "10% Coin-Rabatt"], silver2_price_monthly: "4,99 € / Monat", silver2_price_yearly: "49,99 € / Jahr",
            gold2_title: "Premium", gold2_features: ["Claude 6-Perspektiven", "500 Coins/Monat", "20% Coin-Rabatt", "HD-Bilder", "5 Videos/Monat", "Live Voice", "KI-Chat Premium"], gold2_price_monthly: "14,99 € / Monat", gold2_price_yearly: "149,99 € / Jahr",
            
            pro_badge: "MEISTGEWÄHLT", vip_badge: "EXKLUSIV 👑",
        },
        earn: {
            title: "Münzen verdienen",
            desc: "Wähle eine Aufgabe, um dein Guthaben aufzuladen.",
            short_title: "Kurzer Clip", short_desc: "10 Sekunden", short_reward: "1",
            long_title: "Premium Video", long_desc: "2 Minuten", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Umfragen & Aufgaben", offer_reward: "5-10",
            offer_info: "Erledige Aufgaben wie Umfragen, App-Tests oder Anmeldungen für hohe Belohnungen.",
            survey_task: "Marken-Umfrage", app_task: "Spiel Level 5 erreichen",
            watch_btn: "Ansehen", start_btn: "Starten"
        },
        shop: {
            title: "Münz-Shop",
            desc: "Fülle deinen Vorrat auf.",
            starter_label: "Starter", starter_price: "1,99 €", starter_amount: "100 Münzen",
            best_label: "Bestseller", best_price: "5,99 €", best_amount: "550 Münzen", best_badge: "Beliebt",
            value_label: "Vorrat", value_price: "12,99 €", value_amount: "1500 Münzen", value_badge: "Bester Wert",
            free_link: "Möchtest du Münzen gratis verdienen? Hier klicken.",
            buy_btn: "Kaufen",
            wow_badge: "💎 Unter 1 Cent/Münze!",
            coins_label: "Münzen",
            per_coin: "pro Münze",
            pkg_starter: "Zum Testen", pkg_popular: "Beliebt", pkg_value: "Mehr Wert", pkg_premium: "Mehr sparen", pkg_mega: "Power User",
        },
        smart_guide: {
            step1_title: "Account erstellen", step1_desc: "Erstelle gratis Account bei Google AI Studio.",
            step2_title: "Key generieren", step2_desc: "Kopiere deinen persönlichen API Key dort.",
            step3_title: "In App einfügen", step3_desc: "Füge den Key hier ein für Premium-Features."
        }
    },
    [Language.EN]: {
        app_title: "Dream Code",
        app_subtitle: "All of humanity's knowledge & a supercomputer – right in your pocket",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Basra, Iraq (7th C.)",
            [ReligiousSource.NABULSI]: "Damascus, Syria (17th C.)",
            [ReligiousSource.AL_ISKHAFI]: "Baghdad (Abbasid)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Arabic Tradition (Abjad)",
            [ReligiousSource.MEDIEVAL]: "Europe (Medieval)",
            [ReligiousSource.MODERN_THEOLOGY]: "Western Theology",
            [ReligiousSource.CHURCH_FATHERS]: "Rome & Byzantium (Patristics)",
            [ReligiousSource.ZEN]: "China & Japan",
            [ReligiousSource.TIBETAN]: "Tibet (Himalaya)",
            [ReligiousSource.THERAVADA]: "Southeast Asia (Pali Canon)",
            [ReligiousSource.FREUDIAN]: "Vienna (Psychoanalysis)",
            [ReligiousSource.JUNGIAN]: "Zurich (Analytical Psych.)",
            [ReligiousSource.GESTALT]: "Berlin / New York",
            [ReligiousSource.WESTERN_ZODIAC]: "Hellenistic Tradition",
            [ReligiousSource.VEDIC_ASTROLOGY]: "India (Jyotish)",
            [ReligiousSource.CHINESE_ZODIAC]: "China (Lunar Calendar)",
            [ReligiousSource.PYTHAGOREAN]: "Ancient Greece",
            [ReligiousSource.CHALDEAN]: "Babylon (Mesopotamia)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Jewish Mysticism (Spain)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "India (Vedas)",
            [ReligiousSource.IMAM_SADIQ]: "Shia Tradition, Persia",
            [ReligiousSource.ISLAMSKI_SONNIK]: "Russian-Islamic",
            [ReligiousSource.ZHOU_GONG]: "China, Dream Interpretation",
            [ReligiousSource.HATSUYUME]: "Japan, New Year Dream",
            [ReligiousSource.SWAPNA_SHASTRA]: "India, Vedic/Hindu",
            [ReligiousSource.EDGAR_CAYCE]: "USA, Sleeping Prophet",
            [ReligiousSource.RUDOLF_STEINER]: "Anthroposophy, Austria",
            [ReligiousSource.TALMUD_BERAKHOT]: "Babylonia, 55a-57b",
            [ReligiousSource.ZOHAR]: "Kabbalistic, 13th C.",
            [ReligiousSource.VANGA]: "Bulgaria, 20th C.",
            [ReligiousSource.MILLER_RU]: "Russian Dream Interpretation",
            [ReligiousSource.FREUD_RU]: "Russian Freud Adaptation",
            [ReligiousSource.LOFF]: "Russian Dream Book",
            [ReligiousSource.NOSTRADAMUS_RU]: "Russian Adaptation",
            [ReligiousSource.ARTEMIDOROS]: "Greece, 2nd C. AD",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "Egypt, ca. 1275 BC",
            [ReligiousSource.SOMNIALE_DANIELIS]: "Byzantine-Medieval"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islamic', [ReligiousCategory.CHRISTIAN]: 'Christian', [ReligiousCategory.BUDDHIST]: 'Buddhist', [ReligiousCategory.PSYCHOLOGICAL]: 'Psychological', [ReligiousCategory.ASTROLOGY]: 'Astrology', [ReligiousCategory.NUMEROLOGY]: 'Numerology', [ReligiousCategory.JEWISH]: 'Jewish', [ReligiousCategory.SONNIKS]: 'Dream Books', [ReligiousCategory.ANCIENT]: 'Ancient',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibetan', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Medieval', [ReligiousSource.MODERN_THEOLOGY]: 'Modern Theology', [ReligiousSource.CHURCH_FATHERS]: 'Church Fathers', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jungian', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Western Zodiac', [ReligiousSource.VEDIC_ASTROLOGY]: 'Vedic', [ReligiousSource.CHINESE_ZODIAC]: 'Chinese Zodiac', [ReligiousSource.PYTHAGOREAN]: 'Pythagorean', [ReligiousSource.CHALDEAN]: 'Chaldean', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabbalah', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Vedic Numbers', [ReligiousSource.IMAM_SADIQ]: 'Imam Sadiq', [ReligiousSource.ISLAMSKI_SONNIK]: 'Islamic Sonnik', [ReligiousSource.ZHOU_GONG]: 'Zhou Gong', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berakhot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artemidorus', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Egyptian Papyrus', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Describe your dream...", interpret: "Interpret Dream", choose_tradition: "Choose Tradition", refine_sources: "Refine Sources", oracle_speaks: "The Oracle Speaks", close: "Close", listening: "Listening...", voices: "Voice",
            settings: "Settings", text_size: "Size", dictation_error: "Error: Mic not available.", dictation_perm: "Permission denied.",
            calendar_btn: "Calendar & Analysis", coming_soon: "More...", calendar_desc: "Your Dream Journal",
            profile_btn: "Your Profile", profile_desc: "Stats & Me",
            hub_btn: "Dream Hub", hub_desc: "Community Dreams",
            gen_image: "Generate Image", saved_msg: "Dream saved to calendar!",
            watch_ad: "Earn Coins", generate_video: "Generate Video (Gold)", create_dream_video: "Dream Video",
            video_btn_short: "📹 Generate Video", video_duration_short: "30s, 180 Coins",
            slideshow_btn: "📽️ Create Slideshow", slideshow_duration: "30s, 180 Coins",
            premium_btn: "Premium / Plan", premium_desc: "Upgrade & Features",
            customer_file_btn: "Personal Context File",
            theme: "Appearance", mode: "Mode", dark: "Dark", light: "Light",
            style: "Design Style", style_def: "Default (Mystic)", style_fem: "Feminine (Rose)", style_masc: "Masculine (Blue)", style_nature: "Nature (Green)",
            voice_char: "Voice Character", fem_char: "Female Characters", male_char: "Male Characters", preview: "Preview",
            info_title: "Knowledge Base", info_bio: "Biography", info_origin: "Origin & Background",
            video_ready: "Your dream video is ready!", video_gen: "Generating Video...", video_error: "Generation failed.",
            map_btn: "Who had the same dream?",
            api_manager: "API Key Manager (Smart Tier)", api_desc: "Add your Gemini API Keys. System auto-switches if limit reached.", add_key: "Add Key", no_keys: "No keys found.",
            quality_normal: "Normal", quality_high: "High Quality",
            style_cartoon: "Cartoon", style_anime: "Anime", style_real: "Real", style_fantasy: "Fantasy",
            choose_quality: "Choose Quality", choose_style: "Choose Style",
            choose_image_style: "Choose Image Style",
            choose_style_desc: "Select quality and style for your dream image",
            continue_without_image: "Continue without image generation",
            step_quality: "1. Choose Quality",
            step_style: "2. Choose Style",
            continue: "Continue",
            social_proof_stats: "47,832 dreams analyzed · 12,543 dream matches found",
            social_proof_testimonial1: "\"Finally understand my recurring dreams!\" - Anna, 28",
            social_proof_testimonial2: "\"The multi-perspective interpretation is unique.\" - Michael, 34",
            social_proof_testimonial3: "\"Found someone with identical dream through the app!\" - Sarah, 31",
            processing_context: "Considering:",
            backup_title: "Data Vault (Backup)",
            backup_desc: "Secure your data as a file or restore a backup.",
            export_btn: "Download Backup",
            import_btn: "Restore Backup",
            home_label: "Home",
            map_label: "Map",
            live_chat_label: "Live Chat",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5 Coins Bonus: Video with Your Voice!",
            audio_coin_desc: "Your recording is saved. Create a dream video with your own voice in your Profile and earn 5 coins!",
            upload_audio: "Upload",
            upload_confirm_title: "Audio Successfully Saved!",
            upload_confirm_desc: "Your audio recording has been saved with the dream. Check it out in your Profile under 'Audio'!",
            got_it: "Got it!",
            backup_restored: "Backup restored successfully!",
            backup_error: "Error restoring backup. Invalid file.",
            storage_init: "Storage is initializing. Please wait.",
            mic_denied_alert: "Microphone access denied",
            min_dreams_required: "You need at least 7 interpreted dreams to use the analysis feature.",
            base_version: "Basic Version",
            until_date: "Until:",
            audio_recorded: "Audio recorded",
            audio_saved_with_dream: "Will be saved with dream",
            remove: "Remove",
            oracle_voice: "Oracle Voice",
            image_ready: "Image Ready!",
            style_desc_cartoon: "Pixar-Style",
            style_desc_anime: "Ghibli-Style",
            style_desc_real: "Photorealistic",
            style_desc_fantasy: "Magical",
            cosmic_dna: "Cosmic DNA",
            moon_sync: "Moon Sync",
            cosmic_dna_body: "Your Cosmic DNA is your unique dream fingerprint — based on your birth date, zodiac sign, and the patterns of your dreams. It connects astrology, numerology, and psychology into a personal dream key.",
            cosmic_dna_coming: "Coming Soon",
            cosmic_dna_enter: "Enter your birth date in your profile to calculate your Cosmic DNA.",
            moon_phase_label: "Moon phase",
            dream_meaning_today: "Dream meaning today",
            save_btn: "Save",
            age_restricted_cat: "This category is only available for persons 18 years and older.",
            ok: "OK",
            video_studio: "Video Studio",
            dream_network: "Dream Network",
            privacy_link: "Privacy", terms_link: "Terms", imprint_link: "Imprint", research_link: "Research", studies_link: "Studies", worldmap_link: "World Map", showing_sources_only: "Showing only {0} sources", science_label: "Knowledge",
        },
        processing: {
            title: "The Oracle works...",
            step_analyze: "Analyzing dream interpretation",
            step_customer: "Considering customer context",
            step_no_customer: "No customer context available",
            step_context: "Categories & Traditions are being calculated",
            step_no_context: "No specific traditions selected",
            step_image: "Generating vision",
            step_save: "Saved to calendar and profile"
        },
        sub: {
            title: "Choose Your Tier",
            billing_monthly: "Monthly", billing_yearly: "Yearly",
            yearly_discount: "1 Month Free!",
            smart_discount: "For Developers",
            free_title: "Free",
            free_price: "0 €",
            free_features: ["Basic Interpretation (Ad-supported)", "Access to Offerwall for free coins", "Premium via coins", "Link Sharing only"],
            silver_title: "Pro",
            silver_price: "4.99 € / month",
            silver_features: ["Ad-Free Experience", "Unlimited PDF Conversion & Download", "Unlimited Interpretations", "25 HD Images/mo", "1x Weekly Live Chat", "Audio I/O"],
            gold_title: "Gold (VIP)", 
            gold_price: "12.99 € / month",
            gold_trial_text: "7 days free, then 12.99 €/mo",
            gold_features: ["All Silver Features Included", "Unlimited Live Oracle Chat", "5 Dream Videos/mo", "Exclusive Coin Discount", "Priority Support"],
            smart_title: "Smart (Developer)",
            smart_price: "49.99 € / year",
            smart_features: ["Bring Your Own Key (BYOK)", "All Premium Features Unlocked", "Auto-Provider Rotation", "Fixed Annual Price (29.99€)"],
            smart_info_title: "What is the Smart Developer Tier?",
            smart_info_text: "For developers & tech enthusiasts: Create accounts with AI providers (e.g., Google AI Studio), generate your own API keys there, and add them to the app. This way, you only pay the low API costs directly to the provider + €3 for app usage. Perfect for power users!",
            upgrade: "Upgrade", current: "Current", unlock: "Unlock", try_free: "TRY FREE FOR 7 DAYS",
            ad_loading: "Loading Ad...", ad_reward: "Coins earned!",
            bronze_title: "Free", bronze_features: ["3 Interpretations/Day", "Groq AI", "6 Traditions", "Ads"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["Unlimited Interpretations", "Gemini AI", "All 9 Traditions", "Ad-Free", "100 Coins/Month", "10% Coin Discount"], silver2_price_monthly: "€4.99 / Month", silver2_price_yearly: "€49.99 / Year",
            gold2_title: "Premium", gold2_features: ["Claude 6-Perspectives", "500 Coins/Month", "20% Coin Discount", "HD Images", "5 Videos/Month", "Live Voice", "Premium AI Chat"], gold2_price_monthly: "€14.99 / Month", gold2_price_yearly: "€149.99 / Year",
            
            pro_badge: "MOST POPULAR", vip_badge: "EXCLUSIVE 👑",
        },
        earn: {
            title: "Earn Coins",
            desc: "Complete tasks to top up your balance.",
            short_title: "Short Clip", short_desc: "10 Seconds", short_reward: "1",
            long_title: "Premium Video", long_desc: "2 Minutes", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Surveys & Tasks", offer_reward: "5-10",
            offer_info: "Complete tasks like surveys, app tests, or sign-ups for high rewards.",
            survey_task: "Brand Survey", app_task: "Reach Level 5 in Game",
            watch_btn: "Watch", start_btn: "Start"
        },
        shop: {
            title: "Coin Shop",
            desc: "Top up your supply.",
            starter_label: "Starter", starter_price: "1.99 €", starter_amount: "100 Coins",
            best_label: "Bestseller", best_price: "5.99 €", best_amount: "550 Coins", best_badge: "Popular",
            value_label: "Best Value", value_price: "12.99 €", value_amount: "1500 Coins", value_badge: "Best Value",
            free_link: "Want to earn free coins? Click here.",
            buy_btn: "Buy",
            wow_badge: "💎 Under 1 Cent/Coin!",
            coins_label: "Coins",
            per_coin: "per coin",
            pkg_starter: "Try It", pkg_popular: "Popular", pkg_value: "More Value", pkg_premium: "Save More", pkg_mega: "Power User",
        },
        smart_guide: {
            step1_title: "Create Account", step1_desc: "Create free account at Google AI Studio.",
            step2_title: "Generate Key", step2_desc: "Copy your personal API Key there.",
            step3_title: "Paste in App", step3_desc: "Paste key here to unlock Premium."
        }
    },
    [Language.TR]: {
        app_title: "Rüya Kodu | Dream Code",
        app_subtitle: "Tüm insanlık bilgisi & bir süper bilgisayar – cebinizde",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Basra, Irak (7. Yy.)",
            [ReligiousSource.NABULSI]: "Şam, Suriye (17. Yy.)",
            [ReligiousSource.AL_ISKHAFI]: "Bağdat (Abbasiler)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Arap Geleneği (Ebced)",
            [ReligiousSource.MEDIEVAL]: "Avrupa (Ortaçağ)",
            [ReligiousSource.MODERN_THEOLOGY]: "Batı Teolojisi",
            [ReligiousSource.CHURCH_FATHERS]: "Roma ve Bizans (Patristik)",
            [ReligiousSource.ZEN]: "Çin ve Japonya",
            [ReligiousSource.TIBETAN]: "Tibet (Himalaya)",
            [ReligiousSource.THERAVADA]: "Güneydoğu Asya (Pali Kanonu)",
            [ReligiousSource.FREUDIAN]: "Viyana (Psikanaliz)",
            [ReligiousSource.JUNGIAN]: "Zürih (Analitik Psikoloji)",
            [ReligiousSource.GESTALT]: "Berlin / New York",
            [ReligiousSource.WESTERN_ZODIAC]: "Helenistik Gelenek",
            [ReligiousSource.VEDIC_ASTROLOGY]: "Hindistan (Jyotish)",
            [ReligiousSource.CHINESE_ZODIAC]: "Çin (Ay Takvimi)",
            [ReligiousSource.PYTHAGOREAN]: "Antik Yunan",
            [ReligiousSource.CHALDEAN]: "Babil (Mezopotamya)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Yahudi Mistisizmi (İspanya)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Hindistan (Vedalar)",
            [ReligiousSource.IMAM_SADIQ]: "Şii Geleneği, İran",
            [ReligiousSource.ISLAMSKI_SONNIK]: "Rus-İslam",
            [ReligiousSource.ZHOU_GONG]: "Çin, Rüya Yorumu",
            [ReligiousSource.HATSUYUME]: "Japonya, Yılbaşı Rüyası",
            [ReligiousSource.SWAPNA_SHASTRA]: "Hindistan, Vedik/Hindu",
            [ReligiousSource.EDGAR_CAYCE]: "ABD, Uyuyan Peygamber",
            [ReligiousSource.RUDOLF_STEINER]: "Antropozofi, Avusturya",
            [ReligiousSource.TALMUD_BERAKHOT]: "Babil, 55a-57b",
            [ReligiousSource.ZOHAR]: "Kabalist, 13. Yy.",
            [ReligiousSource.VANGA]: "Bulgaristan, 20. Yy.",
            [ReligiousSource.MILLER_RU]: "Rus Rüya Yorumu",
            [ReligiousSource.FREUD_RU]: "Rus Freud Uyarlaması",
            [ReligiousSource.LOFF]: "Rus Rüya Kitabı",
            [ReligiousSource.NOSTRADAMUS_RU]: "Rus Uyarlaması",
            [ReligiousSource.ARTEMIDOROS]: "Yunanistan, M.S. 2. Yy.",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "Mısır, MÖ yaklaşık 1275",
            [ReligiousSource.SOMNIALE_DANIELIS]: "Bizans-Ortaçağ"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'İslami', [ReligiousCategory.CHRISTIAN]: 'Hristiyan', [ReligiousCategory.BUDDHIST]: 'Budist', [ReligiousCategory.PSYCHOLOGICAL]: 'Psikoloji', [ReligiousCategory.ASTROLOGY]: 'Astroloji', [ReligiousCategory.NUMEROLOGY]: 'Nümeroloji', [ReligiousCategory.JEWISH]: 'Yahudi', [ReligiousCategory.SONNIKS]: 'Rüya Kitapları', [ReligiousCategory.ANCIENT]: 'Antik',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibet', [ReligiousSource.IBN_SIRIN]: 'İbn-i Sirin', [ReligiousSource.NABULSI]: 'Nablusi', [ReligiousSource.AL_ISKHAFI]: 'El-İskafi', [ReligiousSource.MEDIEVAL]: 'Ortaçağ', [ReligiousSource.MODERN_THEOLOGY]: 'Modern Teoloji', [ReligiousSource.CHURCH_FATHERS]: 'Kilise Babaları', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Batı Burçları', [ReligiousSource.VEDIC_ASTROLOGY]: 'Vedik', [ReligiousSource.CHINESE_ZODIAC]: 'Çin Burçları', [ReligiousSource.PYTHAGOREAN]: 'Pisagor', [ReligiousSource.CHALDEAN]: 'Keldani', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabala', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Ebced', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Vedik Sayılar', [ReligiousSource.IMAM_SADIQ]: 'İmam Sadık', [ReligiousSource.ISLAMSKI_SONNIK]: 'İslami Rüya', [ReligiousSource.ZHOU_GONG]: 'Zhou Gong', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berakhot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artemidoros', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Mısır Papirüsü', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Rüyanı anlat...", interpret: "Rüyayı Yorumla", choose_tradition: "Gelenek Seç", refine_sources: "Kaynakları Seç", oracle_speaks: "Kahin Konuşuyor", close: "Kapat", listening: "Dinleniyor...", voices: "Ses",
            settings: "Ayarlar", text_size: "Boyut", dictation_error: "Hata: Mikrofon yok.", dictation_perm: "Erişim reddedildi.",
            calendar_btn: "Takvim & Analiz", coming_soon: "Daha...", calendar_desc: "Rüya Günlüğün",
            profile_btn: "Profilin", profile_desc: "İstatistikler",
            hub_btn: "Rüya Merkezi", hub_desc: "Topluluk Rüyaları",
            gen_image: "Resim Oluştur", saved_msg: "Rüya takvime kaydedildi!",
            watch_ad: "Jeton Kazan", generate_video: "Video Oluştur (Gold)", create_dream_video: "Rüya Videosu",
            video_btn_short: "📹 Video Oluştur", video_duration_short: "30sn, 180 Jeton",
            slideshow_btn: "📽️ Slayt Gösterisi", slideshow_duration: "30sn, 180 Jeton",
            premium_btn: "Premium / Plan", premium_desc: "Yükselt & Özellikler",
            customer_file_btn: "Kişisel Dosya & Bağlam",
            theme: "Görünüm", mode: "Mod", dark: "Karanlık", light: "Aydınlık",
            style: "Tasarım Stili", style_def: "Varsayılan (Mistik)", style_fem: "Feminen (Gül)", style_masc: "Maskülen (Mavi)", style_nature: "Doğa (Yeşil)",
            voice_char: "Ses Karakteri", fem_char: "Kadın Karakterler", male_char: "Erkek Karakterler", preview: "Önizle",
            info_title: "Bilgi Merkezi", info_bio: "Biyografi", info_origin: "Köken & Arkaplan",
            video_ready: "Rüya videon hazır!", video_gen: "Video oluşturuluyor...", video_error: "Oluşturma başarısız.",
            map_btn: "Aynı rüyayı kim gördü?",
            api_manager: "API Anahtar Yönetimi (Akıllı)", api_desc: "Gemini API Anahtarlarını ekle. Limit dolarsa sistem otomatik geçer.", add_key: "Anahtar Ekle", no_keys: "Kayıtlı anahtar yok.",
            quality_normal: "Normal", quality_high: "Yüksek Kalite",
            style_cartoon: "Çizgi Film", style_anime: "Anime", style_real: "Gerçekçi", style_fantasy: "Fantezi",
            choose_quality: "Kalite Seçin", choose_style: "Stil Seçin",
            choose_image_style: "Resim Stili Seçin",
            choose_style_desc: "Rüya resminiz için kalite ve stil seçin",
            continue_without_image: "Resim oluşturmadan devam et",
            step_quality: "1. Kalite Seçin",
            step_style: "2. Stil Seçin",
            continue: "Devam Et",
            social_proof_stats: "47.832 rüya analiz edildi · 12.543 rüya eşleşmesi bulundu",
            social_proof_testimonial1: "\"Sonunda tekrarlayan rüyalarımı anlıyorum!\" - Ayşe, 28",
            social_proof_testimonial2: "\"Çok perspektifli yorum benzersiz.\" - Mehmet, 34",
            social_proof_testimonial3: "\"Uygulama sayesinde aynı rüyayı gören birini buldum!\" - Zeynep, 31",
            processing_context: "Dikkate Alınıyor:",
            backup_title: "Veri Kasası (Yedek)",
            backup_desc: "Verilerini dosya olarak sakla veya yedekten geri yükle.",
            export_btn: "Yedeği İndir",
            import_btn: "Yedeği Geri Yükle",
            home_label: "Ana Sayfa",
            map_label: "Harita",
            live_chat_label: "Canlı Sohbet",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Akıllı",
            audio_coin_prompt: "💰 +5 Jeton Bonus: Sesinle Video!",
            audio_coin_desc: "Kaydın saklandı. Profilinde kendi sesinle rüya videosu oluştur ve 5 jeton kazan!",
            upload_audio: "Yükle",
            upload_confirm_title: "Ses Başarıyla Kaydedildi!",
            upload_confirm_desc: "Ses kaydınız rüya ile birlikte kaydedildi. Profilinizde 'Ses' bölümünden kontrol edin!",
            got_it: "Anladım!",
            backup_restored: "Yedek başarıyla geri yüklendi!",
            backup_error: "Yedek geri yüklenirken hata. Geçersiz dosya.",
            storage_init: "Depolama başlatılıyor. Lütfen bekleyin.",
            mic_denied_alert: "Mikrofon erişimi reddedildi",
            min_dreams_required: "Analiz özelliğini kullanabilmek için en az 7 yorumlanmış rüyaya ihtiyacınız var.",
            base_version: "Temel Sürüm",
            until_date: "Bitiş:",
            audio_recorded: "Ses kaydedildi",
            audio_saved_with_dream: "Rüya ile kaydedilecek",
            remove: "Kaldır",
            oracle_voice: "Kahin Sesi",
            image_ready: "Resim Hazır!",
            style_desc_cartoon: "Pixar Tarzı",
            style_desc_anime: "Ghibli Tarzı",
            style_desc_real: "Fotogerçekçi",
            style_desc_fantasy: "Büyülü",
            cosmic_dna: "Kozmik DNA",
            moon_sync: "Ay Senkronu",
            cosmic_dna_body: "Kozmik DNA'nız benzersiz rüya parmak izinizdir — doğum tarihinize, burcunuza ve rüya kalıplarınıza dayanır. Astroloji, numeroloji ve psikolojiyi kişisel bir rüya anahtarında birleştirir.",
            cosmic_dna_coming: "Yakında",
            cosmic_dna_enter: "Kozmik DNA'nızı hesaplamak için profilinize doğum tarihinizi girin.",
            moon_phase_label: "Ay evresi",
            dream_meaning_today: "Bugünün rüya anlamı",
            save_btn: "Kaydet",
            age_restricted_cat: "Bu kategori yalnızca 18 yaş ve üzeri kişiler için mevcuttur.",
            ok: "Tamam",
            video_studio: "Video Stüdyosu",
            dream_network: "Rüya Ağı",
            privacy_link: "Gizlilik", terms_link: "Şartlar", imprint_link: "Künye", research_link: "Araştırma", studies_link: "Çalışmalar", worldmap_link: "Dünya Haritası", showing_sources_only: "Sadece {0} kaynakları", science_label: "Bilgi",
        },
        processing: {
            title: "Kahin çalışıyor...",
            step_analyze: "Rüya tabiri analiz ediliyor",
            step_customer: "Müşteri bağlamı değerlendiriliyor",
            step_no_customer: "Müşteri verisi yok",
            step_context: "Kategoriler ve Gelenekler hesaplanıyor",
            step_no_context: "Seçili gelenek yok",
            step_image: "Görsel vizyon oluşturuluyor",
            step_save: "Tamamlandı, takvim ve profile kaydedildi"
        },
        sub: {
            title: "Seviyeni Seç",
            billing_monthly: "Aylık", billing_yearly: "Yıllık",
            yearly_discount: "1 Ay Hediye!",
            smart_discount: "Geliştiriciler İçin",
            free_title: "Free",
            free_price: "0 €",
            free_features: ["Temel Rüya Tabiri (Reklamlı)", "Offerwall Erişimi", "Premium içeriği jetonla açma", "Sadece Link Paylaşımı"],
            silver_title: "Pro",
            silver_price: "4.99 € / Ay",
            silver_features: ["Tamamen Reklamsız", "Sınırsız PDF Dönüştürme & İndirme", "Sınırsız Yorumlama", "25 HD Resim/Ay", "Haftada 1x Canlı Sohbet", "Sesli Giriş & Çıkış"],
            gold_title: "Altın (VIP)", 
            gold_price: "12.99 € / Ay",
            gold_trial_text: "7 gün ücretsiz, sonra 12.99 €/Ay",
            gold_features: ["Tüm Gümüş özellikleri dahil", "Sınırsız Canlı Kahin Sohbeti", "5 Rüya Videosu/Ay", "Jeton Alımlarında VIP İndirim", "Öncelikli Destek"],
            smart_title: "Akıllı (Geliştirici)",
            smart_price: "49.99 € / Yıl",
            smart_features: ["Kendi Anahtarını Getir (BYOK)", "Tüm Premium Özellikler Açık", "Otomatik Sağlayıcı Geçişi", "Sabit Yıllık Ücret (29.99€)"],
            smart_info_title: "Smart Developer Tier Nedir?",
            smart_info_text: "Geliştiriciler ve teknoloji meraklıları için: Yapay zeka sağlayıcılarında hesap oluşturun (ör. Google AI Studio), orada kendi API anahtarlarınızı oluşturun ve buraya ekleyin. Böylece sadece düşük API maliyetlerini doğrudan sağlayıcıya ödeyip + uygulama kullanımı için 3€ ödersiniz. Power kullanıcılar için mükemmel!",
            upgrade: "Yükselt", current: "Mevcut", unlock: "Kilidi Aç", try_free: "7 GÜN ÜCRETSİZ DENE",
            ad_loading: "Reklam yükleniyor...", ad_reward: "Kredi kazanıldı!",
            bronze_title: "Free", bronze_features: ["3 Yorum/Gün", "Groq YZ", "6 Gelenek", "Reklamlar"], bronze_price: "0 ₺",
            silver2_title: "Pro", silver2_features: ["Sınırsız Yorum", "Gemini YZ", "Tüm 9 Gelenek", "Reklamsız", "100 Jeton/Ay", "%10 Jeton İndirimi"], silver2_price_monthly: "79,99 ₺ / Ay", silver2_price_yearly: "799 ₺ / Yıl",
            gold2_title: "Premium", gold2_features: ["Claude 6 Perspektif", "500 Jeton/Ay", "%20 Jeton İndirimi", "HD Görseller", "5 Video/Ay", "Canlı Ses", "Premium YZ Sohbet"], gold2_price_monthly: "229,99 ₺ / Ay", gold2_price_yearly: "2.299 ₺ / Yıl",
            
            pro_badge: "EN POPÜLER", vip_badge: "ÖZEL 👑",
        },
        earn: {
            title: "Jeton Kazan",
            desc: "Bakiyeni doldurmak için görev seç.",
            short_title: "Kısa Klip", short_desc: "10 Saniye", short_reward: "1",
            long_title: "Premium Video", long_desc: "2 Dakika", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Anket & Görevler", offer_reward: "5-10",
            offer_info: "Yüksek ödüller için anket, uygulama testi veya üyelik gibi görevleri tamamla.",
            survey_task: "Marka Anketi", app_task: "Oyunda 5. Seviye",
            watch_btn: "İzle", start_btn: "Başla"
        },
        shop: {
            title: "Jeton Mağazası",
            desc: "Stokunu yenile.",
            starter_label: "Başlangıç", starter_price: "1,99 €", starter_amount: "100 Jeton",
            best_label: "Çok Satan", best_price: "5,99 €", best_amount: "550 Jeton", best_badge: "Popüler",
            value_label: "En İyi Fiyat", value_price: "12,99 €", value_amount: "1500 Jeton", value_badge: "Fırsat",
            free_link: "Ücretsiz jeton kazanmak ister misin? Tıkla.",
            buy_btn: "Satın Al",
            wow_badge: "💎 1 Sent Altında/Jeton!",
            coins_label: "Jeton",
            per_coin: "jeton başına",
            pkg_starter: "Deneyin", pkg_popular: "Popüler", pkg_value: "Daha Fazla", pkg_premium: "Daha Tasarruf", pkg_mega: "Güçlü Kullanıcı",
        },
        smart_guide: {
            step1_title: "Hesap Oluştur", step1_desc: "Google AI Studio'da ücretsiz hesap aç.",
            step2_title: "Anahtar Üret", step2_desc: "Kişisel API Anahtarını kopyala.",
            step3_title: "Uygulamaya Ekle", step3_desc: "Premium özellikler için anahtarı buraya yapıştır."
        }
    },
    [Language.ES]: {
        app_title: "Código de Sueños | Dream Code",
        app_subtitle: "Todo el conocimiento de la humanidad & una supercomputadora – en tu bolsillo",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Basora, Irak (S. VII)",
            [ReligiousSource.NABULSI]: "Damasco, Siria (S. XVII)",
            [ReligiousSource.AL_ISKHAFI]: "Bagdad (Abasí)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Tradición Árabe (Abyad)",
            [ReligiousSource.MEDIEVAL]: "Europa (Medieval)",
            [ReligiousSource.MODERN_THEOLOGY]: "Teología Occidental",
            [ReligiousSource.CHURCH_FATHERS]: "Roma y Bizancio (Patrística)",
            [ReligiousSource.ZEN]: "China y Japón",
            [ReligiousSource.TIBETAN]: "Tíbet (Himalaya)",
            [ReligiousSource.THERAVADA]: "Sudeste Asiático (Canon Pali)",
            [ReligiousSource.FREUDIAN]: "Viena (Psicoanálisis)",
            [ReligiousSource.JUNGIAN]: "Zúrich (Psicología Analítica)",
            [ReligiousSource.GESTALT]: "Berlín / Nueva York",
            [ReligiousSource.WESTERN_ZODIAC]: "Tradición Helenística",
            [ReligiousSource.VEDIC_ASTROLOGY]: "India (Jyotish)",
            [ReligiousSource.CHINESE_ZODIAC]: "China (Calendario Lunar)",
            [ReligiousSource.PYTHAGOREAN]: "Antigua Grecia",
            [ReligiousSource.CHALDEAN]: "Babilonia (Mesopotamia)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Misticismo Judío (España)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "India (Vedas)",
            [ReligiousSource.IMAM_SADIQ]: "Tradición Chií, Persia", [ReligiousSource.ISLAMSKI_SONNIK]: "Ruso-Islámico", [ReligiousSource.ZHOU_GONG]: "China, Interpretación de Sueños", [ReligiousSource.HATSUYUME]: "Japón, Sueño de Año Nuevo", [ReligiousSource.SWAPNA_SHASTRA]: "India, Védico/Hindú", [ReligiousSource.EDGAR_CAYCE]: "EE.UU., Profeta Durmiente", [ReligiousSource.RUDOLF_STEINER]: "Antroposofía, Austria", [ReligiousSource.TALMUD_BERAKHOT]: "Babilonia, 55a-57b", [ReligiousSource.ZOHAR]: "Cabalístico, S. XIII", [ReligiousSource.VANGA]: "Bulgaria, S. XX", [ReligiousSource.MILLER_RU]: "Interpretación Rusa", [ReligiousSource.FREUD_RU]: "Adaptación Rusa de Freud", [ReligiousSource.LOFF]: "Libro de Sueños Ruso", [ReligiousSource.NOSTRADAMUS_RU]: "Adaptación Rusa", [ReligiousSource.ARTEMIDOROS]: "Grecia, S. II d.C.", [ReligiousSource.EGYPTIAN_PAPYRUS]: "Egipto, ca. 1275 a.C.", [ReligiousSource.SOMNIALE_DANIELIS]: "Bizantino-Medieval"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islámica', [ReligiousCategory.CHRISTIAN]: 'Cristiana', [ReligiousCategory.BUDDHIST]: 'Budista', [ReligiousCategory.PSYCHOLOGICAL]: 'Psicológica', [ReligiousCategory.ASTROLOGY]: 'Astrología', [ReligiousCategory.NUMEROLOGY]: 'Numerología', [ReligiousCategory.JEWISH]: 'Judío', [ReligiousCategory.SONNIKS]: 'Libros de Sueños', [ReligiousCategory.ANCIENT]: 'Antiguo',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibetano', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Medieval', [ReligiousSource.MODERN_THEOLOGY]: 'Teología Moderna', [ReligiousSource.CHURCH_FATHERS]: 'Padres de la Iglesia', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Zodíaco Occidental', [ReligiousSource.VEDIC_ASTROLOGY]: 'Védica', [ReligiousSource.CHINESE_ZODIAC]: 'Zodíaco Chino', [ReligiousSource.PYTHAGOREAN]: 'Pitagórico', [ReligiousSource.CHALDEAN]: 'Caldeo', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Cábala', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Números Védicos', [ReligiousSource.IMAM_SADIQ]: 'Imam Sadiq', [ReligiousSource.ISLAMSKI_SONNIK]: 'Sonnik Islámico', [ReligiousSource.ZHOU_GONG]: 'Zhou Gong', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berajot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artemidoro', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Papiro Egipcio', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Describe tu sueño...", interpret: "Interpretar Sueño", choose_tradition: "Elegir Tradición", refine_sources: "Refinar Fuentes", oracle_speaks: "El Oráculo Habla", close: "Cerrar", listening: "Escuchando...", voices: "Voz",
            settings: "Ajustes", text_size: "Tamaño", dictation_error: "Error: Micrófono no disponible.", dictation_perm: "Permiso denegado.",
            calendar_btn: "Calendario y Análisis", coming_soon: "Más...", calendar_desc: "Tu Diario de Sueños",
            profile_btn: "Tu Perfil", profile_desc: "Estadísticas y Yo",
            hub_btn: "Centro de Sueños", hub_desc: "Sueños de la Comunidad",
            gen_image: "Generar Imagen", saved_msg: "¡Sueño guardado en calendario!",
            watch_ad: "Ganar Monedas", generate_video: "Generar Video (Oro)", create_dream_video: "Video del Sueño",
            video_btn_short: "📹 Generar Video", video_duration_short: "30s, 180 Monedas",
            slideshow_btn: "📽️ Crear Presentación", slideshow_duration: "30s, 180 Monedas",
            premium_btn: "Premium / Plan", premium_desc: "Mejoras y Funciones",
            customer_file_btn: "Archivo de Contexto Personal",
            theme: "Apariencia", mode: "Modo", dark: "Oscuro", light: "Claro",
            style: "Estilo de Diseño", style_def: "Predeterminado (Místico)", style_fem: "Femenino (Rosa)", style_masc: "Masculino (Azul)", style_nature: "Naturaleza (Verde)",
            voice_char: "Carácter de Voz", fem_char: "Voces Femeninas", male_char: "Voces Masculinas", preview: "Vista Previa",
            info_title: "Base de Conocimiento", info_bio: "Biografía", info_origin: "Origen y Fondo",
            video_ready: "¡Tu video de sueño está listo!", video_gen: "Generando Video...", video_error: "Error en la generación.",
            map_btn: "¿Quién tuvo el mismo sueño?",
            api_manager: "Gestor de API (Smart)", api_desc: "Añade tus claves API de Gemini. El sistema cambia automáticamente si se alcanza el límite.", add_key: "Añadir Clave", no_keys: "No hay claves guardadas.",
            quality_normal: "Normal", quality_high: "Alta Calidad",
            style_cartoon: "Dibujos Animados", style_anime: "Anime", style_real: "Realista", style_fantasy: "Fantasía",
            choose_quality: "Elegir Calidad", choose_style: "Elegir Estilo",
            choose_image_style: "Elegir Estilo de Imagen",
            choose_style_desc: "Selecciona la calidad y el estilo para tu imagen de sueño",
            continue_without_image: "Continuar sin generar imagen",
            step_quality: "1. Elegir Calidad",
            step_style: "2. Elegir Estilo",
            continue: "Continuar",
            social_proof_stats: "47.832 sueños analizados · 12.543 coincidencias encontradas",
            social_proof_testimonial1: "\"¡Por fin entiendo mis sueños recurrentes!\" - Ana, 28",
            social_proof_testimonial2: "\"La interpretación multiperspectiva es única.\" - Miguel, 34",
            social_proof_testimonial3: "\"¡Encontré a alguien con el mismo sueño!\" - Sara, 31",
            processing_context: "Considerando:",
            backup_title: "Bóveda de Datos (Copia)",
            backup_desc: "Guarda tus datos como archivo o restaura una copia.",
            export_btn: "Descargar Copia",
            import_btn: "Restaurar Copia",
            home_label: "Inicio",
            map_label: "Mapa",
            live_chat_label: "Chat en Vivo",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Inteligente",
            audio_coin_prompt: "💰 +5 Monedas Bonus: ¡Video con Tu Voz!",
            audio_coin_desc: "Tu grabación se guardó. Crea un video del sueño con tu propia voz en tu Perfil y gana 5 monedas!",
            upload_audio: "Subir",
            upload_confirm_title: "¡Audio Guardado con Éxito!",
            upload_confirm_desc: "Tu grabación de audio se ha guardado con el sueño. ¡Compruébalo en tu Perfil en 'Audio'!",
            got_it: "¡Entendido!",
            backup_restored: "¡Copia de seguridad restaurada con éxito!",
            backup_error: "Error al restaurar la copia. Archivo inválido.",
            storage_init: "El almacenamiento se está inicializando. Por favor espera.",
            mic_denied_alert: "Acceso al micrófono denegado",
            min_dreams_required: "Necesitas al menos 7 sueños interpretados para usar la función de análisis.",
            base_version: "Versión Básica",
            until_date: "Hasta:",
            audio_recorded: "Audio grabado",
            audio_saved_with_dream: "Se guardará con el sueño",
            remove: "Eliminar",
            oracle_voice: "Voz del Oráculo",
            image_ready: "¡Imagen Lista!",
            style_desc_cartoon: "Estilo Pixar",
            style_desc_anime: "Estilo Ghibli",
            style_desc_real: "Fotorrealista",
            style_desc_fantasy: "Mágico",
            cosmic_dna: "ADN Cósmico",
            moon_sync: "Sincronía Lunar",
            cosmic_dna_body: "Tu ADN Cósmico es tu huella de sueño única — basada en tu fecha de nacimiento, signo zodiacal y los patrones de tus sueños.",
            cosmic_dna_coming: "Próximamente",
            cosmic_dna_enter: "Ingresa tu fecha de nacimiento en tu perfil para calcular tu ADN Cósmico.",
            moon_phase_label: "Fase lunar",
            dream_meaning_today: "Significado del sueño hoy",
            save_btn: "Guardar",
            age_restricted_cat: "Esta categoría solo está disponible para personas de 18 años o más.",
            ok: "Aceptar",
            video_studio: "Estudio de Video",
            dream_network: "Red de Sueños",
            privacy_link: "Privacidad", terms_link: "Términos", imprint_link: "Aviso Legal", research_link: "Investigación", studies_link: "Estudios", worldmap_link: "Mapa Mundial", showing_sources_only: "Mostrando solo fuentes de {0}", science_label: "Conocimiento",
        },
        processing: {
            title: "El Oráculo trabaja...",
            step_analyze: "Analizando la interpretación del sueño",
            step_customer: "Considerando el contexto del cliente",
            step_no_customer: "No hay datos del cliente disponibles",
            step_context: "Calculando categorías y tradiciones",
            step_no_context: "No se seleccionaron tradiciones específicas",
            step_image: "Generando visión",
            step_save: "Guardado en calendario y perfil"
        },
        sub: {
            title: "Elige tu Nivel",
            billing_monthly: "Mensual", billing_yearly: "Anual",
            yearly_discount: "¡1 Mes Gratis!",
            smart_discount: "Para Desarrolladores",
            free_title: "Free",
            free_price: "0 €",
            free_features: ["Interpretación Básica (Con anuncios)", "Acceso a Offerwall para monedas gratis", "Premium vía monedas", "Solo compartir enlace"],
            silver_title: "Pro",
            silver_price: "4.99 € / mes",
            silver_features: ["Experiencia sin anuncios", "Conversión y descarga ilimitada de PDF", "Interpretaciones ilimitadas", "25 Imágenes HD/mes", "1x Chat en vivo semanal", "Entrada/Salida de Audio"],
            gold_title: "Oro (VIP)", 
            gold_price: "12.99 € / mes",
            gold_trial_text: "7 días gratis, luego 12.99 €/mes",
            gold_features: ["Todas las características de Plata", "Chat ilimitado con el Oráculo", "5 Videos de Sueños/mes", "Descuento exclusivo en monedas", "Soporte Prioritario"],
            smart_title: "Inteligente (Desarrollador)",
            smart_price: "49.99 € / año",
            smart_features: ["Trae Tu Propia Clave (BYOK)", "Todas las funciones Premium desbloqueadas", "Rotación automática de proveedor", "Precio anual fijo (29.99€)"],
            smart_info_title: "¿Qué es el plan Smart Developer?",
            smart_info_text: "Para desarrolladores y entusiastas de la tecnología: crea cuentas con proveedores de IA (por ejemplo, Google AI Studio), genera tus propias claves API allí y agrégalas a la aplicación. De esta manera, solo pagas los bajos costos de API directamente al proveedor + 3 € por el uso de la aplicación. ¡Perfecto para usuarios avanzados!",
            upgrade: "Mejorar", current: "Actual", unlock: "Desbloquear", try_free: "PRUEBA GRATIS 7 DÍAS",
            ad_loading: "Cargando anuncio...", ad_reward: "¡Monedas ganadas!",
            bronze_title: "Free", bronze_features: ["3 Interpretaciones/Día", "Groq IA", "6 Tradiciones", "Anuncios"], bronze_price: "0 €",
            silver2_title: "Pro", silver2_features: ["Interpretaciones Ilimitadas", "Gemini IA", "Las 9 Tradiciones", "Sin Anuncios", "100 Monedas/Mes", "10% Descuento"], silver2_price_monthly: "4,99 € / Mes", silver2_price_yearly: "49,99 € / Año",
            gold2_title: "Premium", gold2_features: ["Claude 6 Perspectivas", "500 Monedas/Mes", "20% Descuento", "Imágenes HD", "5 Videos/Mes", "Voz en Vivo", "Chat IA Premium"], gold2_price_monthly: "14,99 € / Mes", gold2_price_yearly: "149,99 € / Año",
            
            pro_badge: "MÁS POPULAR", vip_badge: "EXCLUSIVO 👑",
        },
        earn: {
            title: "Ganar Monedas",
            desc: "Completa tareas para recargar tu saldo.",
            short_title: "Clip Corto", short_desc: "10 Segundos", short_reward: "1",
            long_title: "Video Premium", long_desc: "2 Minutos", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Encuestas y Tareas", offer_reward: "5-10",
            offer_info: "Completa tareas como encuestas, pruebas de aplicaciones o registros para obtener altas recompensas.",
            survey_task: "Encuesta de Marca", app_task: "Alcanzar Nivel 5 en Juego",
            watch_btn: "Ver", start_btn: "Comenzar"
        },
        shop: {
            title: "Tienda de Monedas",
            desc: "Recarga tu suministro.",
            starter_label: "Inicial", starter_price: "1.99 €", starter_amount: "100 Monedas",
            best_label: "Más Vendido", best_price: "5.99 €", best_amount: "550 Monedas", best_badge: "Popular",
            value_label: "Mejor Valor", value_price: "12.99 €", value_amount: "1500 Monedas", value_badge: "Mejor Valor",
            free_link: "¿Quieres ganar monedas gratis? Haz clic aquí.",
            buy_btn: "Comprar",
            wow_badge: "💎 ¡Menos de 1 Céntimo/Moneda!",
            coins_label: "Monedas",
            per_coin: "por moneda",
            pkg_starter: "Pruébalo", pkg_popular: "Popular", pkg_value: "Más Valor", pkg_premium: "Ahorra Más", pkg_mega: "Poder Total",
        },
        smart_guide: {
            step1_title: "Crear Cuenta", step1_desc: "Crea una cuenta gratuita en Google AI Studio.",
            step2_title: "Generar Clave", step2_desc: "Copia tu Clave API personal allí.",
            step3_title: "Pegar en App", step3_desc: "Pega la clave aquí para desbloquear Premium."
        }
    },
    [Language.FR]: {
        app_title: "Code de Rêve | Dream Code",
        app_subtitle: "Toute la connaissance de l'humanité & un superordinateur – dans votre poche",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Bassorah, Irak (VIIe s.)",
            [ReligiousSource.NABULSI]: "Damas, Syrie (XVIIe s.)",
            [ReligiousSource.AL_ISKHAFI]: "Bagdad (Abbassides)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Tradition Arabe (Abjad)",
            [ReligiousSource.MEDIEVAL]: "Europe (Médiéval)",
            [ReligiousSource.MODERN_THEOLOGY]: "Théologie Occidentale",
            [ReligiousSource.CHURCH_FATHERS]: "Rome et Byzance (Patristique)",
            [ReligiousSource.ZEN]: "Chine et Japon",
            [ReligiousSource.TIBETAN]: "Tibet (Himalaya)",
            [ReligiousSource.THERAVADA]: "Asie du Sud-Est (Canon Pali)",
            [ReligiousSource.FREUDIAN]: "Vienne (Psychanalyse)",
            [ReligiousSource.JUNGIAN]: "Zurich (Psychologie Analytique)",
            [ReligiousSource.GESTALT]: "Berlin / New York",
            [ReligiousSource.WESTERN_ZODIAC]: "Tradition Hellénistique",
            [ReligiousSource.VEDIC_ASTROLOGY]: "Inde (Jyotish)",
            [ReligiousSource.CHINESE_ZODIAC]: "Chine (Calendrier Lunaire)",
            [ReligiousSource.PYTHAGOREAN]: "Grèce Antique",
            [ReligiousSource.CHALDEAN]: "Babylone (Mésopotamie)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Mysticisme Juif (Espagne)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Inde (Védas)",
            [ReligiousSource.IMAM_SADIQ]: "Tradition Chiite, Perse", [ReligiousSource.ISLAMSKI_SONNIK]: "Russo-Islamique", [ReligiousSource.ZHOU_GONG]: "Chine, Interprétation des Rêves", [ReligiousSource.HATSUYUME]: "Japon, Rêve du Nouvel An", [ReligiousSource.SWAPNA_SHASTRA]: "Inde, Védique/Hindou", [ReligiousSource.EDGAR_CAYCE]: "USA, Prophète Endormi", [ReligiousSource.RUDOLF_STEINER]: "Anthroposophie, Autriche", [ReligiousSource.TALMUD_BERAKHOT]: "Babylonie, 55a-57b", [ReligiousSource.ZOHAR]: "Kabbaliste, XIIIe s.", [ReligiousSource.VANGA]: "Bulgarie, XXe s.", [ReligiousSource.MILLER_RU]: "Interprétation Russe", [ReligiousSource.FREUD_RU]: "Adaptation Russe de Freud", [ReligiousSource.LOFF]: "Livre de Rêves Russe", [ReligiousSource.NOSTRADAMUS_RU]: "Adaptation Russe", [ReligiousSource.ARTEMIDOROS]: "Grèce, IIe s. apr. J.-C.", [ReligiousSource.EGYPTIAN_PAPYRUS]: "Égypte, env. 1275 av. J.-C.", [ReligiousSource.SOMNIALE_DANIELIS]: "Byzantin-Médiéval"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islamique', [ReligiousCategory.CHRISTIAN]: 'Chrétien', [ReligiousCategory.BUDDHIST]: 'Bouddhiste', [ReligiousCategory.PSYCHOLOGICAL]: 'Psychologique', [ReligiousCategory.ASTROLOGY]: 'Astrologie', [ReligiousCategory.NUMEROLOGY]: 'Numérologie', [ReligiousCategory.JEWISH]: 'Juif', [ReligiousCategory.SONNIKS]: 'Livres de Rêves', [ReligiousCategory.ANCIENT]: 'Antique',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibétain', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Médiéval', [ReligiousSource.MODERN_THEOLOGY]: 'Théologie Moderne', [ReligiousSource.CHURCH_FATHERS]: 'Pères de l\'Église', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Zodiaque Occidental', [ReligiousSource.VEDIC_ASTROLOGY]: 'Védique', [ReligiousSource.CHINESE_ZODIAC]: 'Zodiaque Chinois', [ReligiousSource.PYTHAGOREAN]: 'Pythagoricien', [ReligiousSource.CHALDEAN]: 'Chaldéen', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabbale', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Nombres Védiques', [ReligiousSource.IMAM_SADIQ]: 'Imam Sadiq', [ReligiousSource.ISLAMSKI_SONNIK]: 'Sonnik Islamique', [ReligiousSource.ZHOU_GONG]: 'Zhou Gong', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berakhot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artémidore', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Papyrus Égyptien', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Décrivez votre rêve...", interpret: "Interpréter le Rêve", choose_tradition: "Choisir la Tradition", refine_sources: "Affiner les Sources", oracle_speaks: "L'Oracle Parle", close: "Fermer", listening: "Écoute...", voices: "Voix",
            settings: "Paramètres", text_size: "Taille", dictation_error: "Erreur : Micro indisponible.", dictation_perm: "Permission refusée.",
            calendar_btn: "Calendrier et Analyse", coming_soon: "Plus...", calendar_desc: "Votre Journal de Rêves",
            profile_btn: "Votre Profil", profile_desc: "Stats et Moi",
            hub_btn: "Centre des Rêves", hub_desc: "Rêves de la Communauté",
            gen_image: "Générer Image", saved_msg: "Rêve sauvegardé dans le calendrier !",
            watch_ad: "Gagner des Pièces", generate_video: "Générer Vidéo (Or)", create_dream_video: "Vidéo du Rêve",
            video_btn_short: "📹 Générer Vidéo", video_duration_short: "30s, 180 Pièces",
            slideshow_btn: "📽️ Créer Diaporama", slideshow_duration: "30s, 180 Pièces",
            premium_btn: "Premium / Plan", premium_desc: "Mise à niveau et Fonctionnalités",
            customer_file_btn: "Dossier Contextuel Personnel",
            theme: "Apparence", mode: "Mode", dark: "Sombre", light: "Clair",
            style: "Style de Design", style_def: "Défaut (Mystique)", style_fem: "Féminin (Rose)", style_masc: "Masculin (Bleu)", style_nature: "Nature (Vert)",
            voice_char: "Caractère de Voix", fem_char: "Voix Féminines", male_char: "Voix Masculines", preview: "Aperçu",
            info_title: "Base de Connaissances", info_bio: "Biographie", info_origin: "Origine et Contexte",
            video_ready: "Votre vidéo de rêve est prête !", video_gen: "Génération de la vidéo...", video_error: "Échec de la génération.",
            map_btn: "Qui a fait le même rêve ?",
            api_manager: "Gestionnaire API (Smart)", api_desc: "Ajoutez vos clés API Gemini. Le système change automatiquement si la limite est atteinte.", add_key: "Ajouter Clé", no_keys: "Aucune clé trouvée.",
            quality_normal: "Normal", quality_high: "Haute Qualité",
            style_cartoon: "Dessin Animé", style_anime: "Anime", style_real: "Réaliste", style_fantasy: "Fantaisie",
            choose_quality: "Choisir la Qualité", choose_style: "Choisir le Style",
            choose_image_style: "Choisir le Style d'Image",
            choose_style_desc: "Sélectionnez la qualité et le style pour votre image de rêve",
            continue_without_image: "Continuer sans générer d'image",
            step_quality: "1. Choisir la Qualité",
            step_style: "2. Choisir le Style",
            continue: "Continuer",
            social_proof_stats: "47 832 rêves analysés · 12 543 correspondances trouvées",
            social_proof_testimonial1: "\"Je comprends enfin mes rêves récurrents !\" - Anne, 28",
            social_proof_testimonial2: "\"L'interprétation multi-perspective est unique.\" - Michel, 34",
            social_proof_testimonial3: "\"J'ai trouvé quelqu'un avec le même rêve !\" - Sarah, 31",
            processing_context: "Prise en compte :",
            backup_title: "Coffre de Données (Backup)",
            backup_desc: "Sécurisez vos données sous forme de fichier ou restaurez une sauvegarde.",
            export_btn: "Télécharger Sauvegarde",
            import_btn: "Restaurer Sauvegarde",
            home_label: "Accueil",
            map_label: "Carte",
            live_chat_label: "Chat en Direct",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Intelligent",
            audio_coin_prompt: "💰 +5 Pièces Bonus: Vidéo avec Votre Voix!",
            audio_coin_desc: "Votre enregistrement est sauvegardé. Créez une vidéo de rêve avec votre voix dans votre Profil et gagnez 5 pièces!",
            upload_audio: "Télécharger",
            upload_confirm_title: "Audio Enregistré avec Succès!",
            upload_confirm_desc: "Votre enregistrement audio a été sauvegardé avec le rêve. Consultez-le dans votre Profil sous 'Audio'!",
            got_it: "Compris!",
            backup_restored: "Sauvegarde restaurée avec succès !",
            backup_error: "Erreur lors de la restauration. Fichier invalide.",
            storage_init: "Le stockage s'initialise. Veuillez patienter.",
            mic_denied_alert: "Accès au microphone refusé",
            min_dreams_required: "Vous avez besoin d'au moins 7 rêves interprétés pour utiliser la fonction d'analyse.",
            base_version: "Version de Base",
            until_date: "Jusqu'au :",
            audio_recorded: "Audio enregistré",
            audio_saved_with_dream: "Sera sauvegardé avec le rêve",
            remove: "Supprimer",
            oracle_voice: "Voix de l'Oracle",
            image_ready: "Image Prête !",
            style_desc_cartoon: "Style Pixar",
            style_desc_anime: "Style Ghibli",
            style_desc_real: "Photoréaliste",
            style_desc_fantasy: "Magique",
            cosmic_dna: "ADN Cosmique",
            moon_sync: "Synchronisation Lunaire",
            cosmic_dna_body: "Votre ADN Cosmique est votre empreinte de rêve unique — basée sur votre date de naissance, signe zodiacal et vos modèles de rêves.",
            cosmic_dna_coming: "Bientôt",
            cosmic_dna_enter: "Entrez votre date de naissance dans votre profil pour calculer votre ADN Cosmique.",
            moon_phase_label: "Phase lunaire",
            dream_meaning_today: "Signification du rêve aujourd'hui",
            save_btn: "Sauvegarder",
            age_restricted_cat: "Cette catégorie n'est disponible que pour les personnes de 18 ans et plus.",
            ok: "OK",
            video_studio: "Studio Vidéo",
            dream_network: "Réseau de Rêves",
            privacy_link: "Confidentialité", terms_link: "Conditions", imprint_link: "Mentions Légales", research_link: "Recherche", studies_link: "Études", worldmap_link: "Carte du Monde", showing_sources_only: "Affichage des sources {0} uniquement", science_label: "Savoir",
        },
        processing: {
            title: "L'Oracle travaille...",
            step_analyze: "Analyse de l'interprétation du rêve",
            step_customer: "Prise en compte du contexte client",
            step_no_customer: "Aucune donnée client disponible",
            step_context: "Calcul des catégories et traditions",
            step_no_context: "Aucune tradition spécifique sélectionnée",
            step_image: "Génération de la vision",
            step_save: "Sauvegardé dans le calendrier et le profil"
        },
        sub: {
            title: "Choisissez votre Niveau",
            billing_monthly: "Mensuel", billing_yearly: "Annuel",
            yearly_discount: "1 Mois Gratuit !",
            smart_discount: "Pour Développeurs",
            free_title: "Free",
            free_price: "0 €",
            free_features: ["Interprétation de base (Avec pubs)", "Accès à l'Offerwall pour pièces gratuites", "Premium via pièces", "Partage de lien uniquement"],
            silver_title: "Pro",
            silver_price: "4.99 € / mois",
            silver_features: ["Expérience sans publicité", "Conversion et téléchargement PDF illimités", "Interprétations illimitées", "25 Images HD/mois", "1x Chat en direct par semaine", "Entrée/Sortie Audio"],
            gold_title: "Or (VIP)", 
            gold_price: "12.99 € / mois",
            gold_trial_text: "7 jours gratuits, puis 12.99 €/mois",
            gold_features: ["Toutes les fonctionnalités Argent", "Chat Oracle illimité", "5 Vidéos de Rêves/mois", "Remise exclusive sur les pièces", "Support Prioritaire"],
            smart_title: "Intelligent (Développeur)",
            smart_price: "49.99 € / an",
            smart_features: ["Apportez votre propre clé (BYOK)", "Toutes les fonctions Premium débloquées", "Rotation automatique du fournisseur", "Prix annuel fixe (29.99€)"],
            smart_info_title: "Qu'est-ce que le forfait Smart Developer ?",
            smart_info_text: "Pour les développeurs et passionnés de technologie : créez des comptes auprès de fournisseurs d'IA (par ex. Google AI Studio), générez vos propres clés API là-bas et ajoutez-les à l'application. Ainsi, vous ne payez que les faibles coûts d'API directement au fournisseur + 3 € pour l'utilisation de l'application. Parfait pour les power users !",
            upgrade: "Mettre à niveau", current: "Actuel", unlock: "Débloquer", try_free: "ESSAI GRATUIT 7 JOURS",
            ad_loading: "Chargement pub...", ad_reward: "Pièces gagnées !",
            bronze_title: "Free", bronze_features: ["3 Interprétations/Jour", "Groq IA", "6 Traditions", "Publicités"], bronze_price: "0 €",
            silver2_title: "Pro", silver2_features: ["Interprétations Illimitées", "Gemini IA", "Les 9 Traditions", "Sans Pub", "100 Pièces/Mois", "10% Réduction"], silver2_price_monthly: "4,99 € / Mois", silver2_price_yearly: "49,99 € / An",
            gold2_title: "Premium", gold2_features: ["Claude 6 Perspectives", "500 Pièces/Mois", "20% Réduction", "Images HD", "5 Vidéos/Mois", "Voix en Direct", "Chat IA Premium"], gold2_price_monthly: "14,99 € / Mois", gold2_price_yearly: "149,99 € / An",
            
            pro_badge: "PLUS POPULAIRE", vip_badge: "EXCLUSIF 👑",
        },
        earn: {
            title: "Gagner des Pièces",
            desc: "Complétez des tâches pour recharger votre solde.",
            short_title: "Court Clip", short_desc: "10 Secondes", short_reward: "1",
            long_title: "Vidéo Premium", long_desc: "2 Minutes", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Sondages et Tâches", offer_reward: "5-10",
            offer_info: "Complétez des tâches comme des sondages, des tests d'applications ou des inscriptions pour de grosses récompenses.",
            survey_task: "Sondage de Marque", app_task: "Atteindre le Niveau 5 dans le Jeu",
            watch_btn: "Regarder", start_btn: "Commencer"
        },
        shop: {
            title: "Boutique de Pièces",
            desc: "Rechargez votre réserve.",
            starter_label: "Débutant", starter_price: "1.99 €", starter_amount: "100 Pièces",
            best_label: "Meilleure Vente", best_price: "5.99 €", best_amount: "550 Pièces", best_badge: "Populaire",
            value_label: "Meilleure Valeur", value_price: "12.99 €", value_amount: "1500 Pièces", value_badge: "Meilleure Valeur",
            free_link: "Vous voulez gagner des pièces gratuites ? Cliquez ici.",
            buy_btn: "Acheter",
            wow_badge: "💎 Moins d'1 Centime/Pièce !",
            coins_label: "Pièces",
            per_coin: "par pièce",
            pkg_starter: "Essayez", pkg_popular: "Populaire", pkg_value: "Plus de Valeur", pkg_premium: "Économisez", pkg_mega: "Utilisateur Pro",
        },
        smart_guide: {
            step1_title: "Créer un Compte", step1_desc: "Créez un compte gratuit sur Google AI Studio.",
            step2_title: "Générer Clé", step2_desc: "Copiez votre clé API personnelle là-bas.",
            step3_title: "Coller dans l'App", step3_desc: "Collez la clé ici pour débloquer Premium."
        }
    },
    [Language.AR]: {
        app_title: "رمز الأحلام | Dream Code",
        app_subtitle: "كل معرفة البشرية وحاسوب خارق – في جيبك",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "البصرة، العراق (القرن 7)",
            [ReligiousSource.NABULSI]: "دمشق، سوريا (القرن 17)",
            [ReligiousSource.AL_ISKHAFI]: "بغداد (العباسيون)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "التقليد العربي (أبجد)",
            [ReligiousSource.MEDIEVAL]: "أوروبا (العصور الوسطى)",
            [ReligiousSource.MODERN_THEOLOGY]: "اللاهوت الغربي",
            [ReligiousSource.CHURCH_FATHERS]: "روما وبيزنطة (الآبائيات)",
            [ReligiousSource.ZEN]: "الصين واليابان",
            [ReligiousSource.TIBETAN]: "التبت (الهيمالايا)",
            [ReligiousSource.THERAVADA]: "جنوب شرق آسيا (قانون بالي)",
            [ReligiousSource.FREUDIAN]: "فيينا (التحليل النفسي)",
            [ReligiousSource.JUNGIAN]: "زيورخ (علم النفس التحليلي)",
            [ReligiousSource.GESTALT]: "برلين / نيويورك",
            [ReligiousSource.WESTERN_ZODIAC]: "التقليد الهلنستي",
            [ReligiousSource.VEDIC_ASTROLOGY]: "الهند (جيوتيش)",
            [ReligiousSource.CHINESE_ZODIAC]: "الصين (التقويم القمري)",
            [ReligiousSource.PYTHAGOREAN]: "اليونان القديمة",
            [ReligiousSource.CHALDEAN]: "بابل (بلاد ما بين النهرين)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "الصوفية اليهودية (إسبانيا)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "الهند (الفيدا)",
            [ReligiousSource.IMAM_SADIQ]: "التقليد الشيعي، فارس",
            [ReligiousSource.ISLAMSKI_SONNIK]: "روسي-إسلامي",
            [ReligiousSource.ZHOU_GONG]: "الصين، تفسير الأحلام",
            [ReligiousSource.HATSUYUME]: "اليابان، حلم السنة الجديدة",
            [ReligiousSource.SWAPNA_SHASTRA]: "الهند، فيدي/هندوسي",
            [ReligiousSource.EDGAR_CAYCE]: "أمريكا، نبي النوم",
            [ReligiousSource.RUDOLF_STEINER]: "أنثروبوصوفيا، النمسا",
            [ReligiousSource.TALMUD_BERAKHOT]: "بابل، 55أ-57ب",
            [ReligiousSource.ZOHAR]: "قبّالي، القرن 13",
            [ReligiousSource.VANGA]: "بلغاريا، القرن 20",
            [ReligiousSource.MILLER_RU]: "تفسير الأحلام الروسي",
            [ReligiousSource.FREUD_RU]: "تكييف فرويد الروسي",
            [ReligiousSource.LOFF]: "كتاب أحلام روسي",
            [ReligiousSource.NOSTRADAMUS_RU]: "التكييف الروسي",
            [ReligiousSource.ARTEMIDOROS]: "اليونان، القرن الثاني",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "مصر، حوالي 1275 ق.م",
            [ReligiousSource.SOMNIALE_DANIELIS]: "بيزنطي-قروسطي"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'إسلامي', [ReligiousCategory.CHRISTIAN]: 'مسيحي', [ReligiousCategory.BUDDHIST]: 'بوذي', [ReligiousCategory.PSYCHOLOGICAL]: 'نفسي', [ReligiousCategory.ASTROLOGY]: 'تنجيم', [ReligiousCategory.NUMEROLOGY]: 'علم الأرقام', [ReligiousCategory.JEWISH]: 'يهودي', [ReligiousCategory.SONNIKS]: 'كتب الأحلام', [ReligiousCategory.ANCIENT]: 'قديم',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'تبتي', [ReligiousSource.IBN_SIRIN]: 'ابن سيرين', [ReligiousSource.NABULSI]: 'النابلسي', [ReligiousSource.AL_ISKHAFI]: 'الإسخافي', [ReligiousSource.MEDIEVAL]: 'قروسطي', [ReligiousSource.MODERN_THEOLOGY]: 'لاهوت حديث', [ReligiousSource.CHURCH_FATHERS]: 'آباء الكنيسة', [ReligiousSource.ZEN]: 'زن', [ReligiousSource.THERAVADA]: 'ثيرافادا', [ReligiousSource.FREUDIAN]: 'فرويد', [ReligiousSource.JUNGIAN]: 'يونغ', [ReligiousSource.GESTALT]: 'جشطالت', [ReligiousSource.WESTERN_ZODIAC]: 'أبراج غربية', [ReligiousSource.VEDIC_ASTROLOGY]: 'فيدي', [ReligiousSource.CHINESE_ZODIAC]: 'أبراج صينية', [ReligiousSource.PYTHAGOREAN]: 'فيثاغوري', [ReligiousSource.CHALDEAN]: 'كلداني', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'كابالا', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'حساب الجمل', [ReligiousSource.VEDIC_NUMEROLOGY]: 'أرقام فيدي', [ReligiousSource.IMAM_SADIQ]: 'الإمام الصادق', [ReligiousSource.ISLAMSKI_SONNIK]: 'سونيك إسلامي', [ReligiousSource.ZHOU_GONG]: 'تشو قونغ', [ReligiousSource.HATSUYUME]: 'هاتسويومي', [ReligiousSource.SWAPNA_SHASTRA]: 'سوابنا شاسترا', [ReligiousSource.EDGAR_CAYCE]: 'إدغار كايس', [ReligiousSource.RUDOLF_STEINER]: 'رودولف شتاينر', [ReligiousSource.TALMUD_BERAKHOT]: 'تلمود بركات', [ReligiousSource.ZOHAR]: 'الزوهار', [ReligiousSource.VANGA]: 'فانغا', [ReligiousSource.MILLER_RU]: 'ميلر', [ReligiousSource.FREUD_RU]: 'فرويد (روسي)', [ReligiousSource.LOFF]: 'لوف', [ReligiousSource.NOSTRADAMUS_RU]: 'نوستراداموس', [ReligiousSource.ARTEMIDOROS]: 'أرتيميدوروس', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'البردية المصرية', [ReligiousSource.SOMNIALE_DANIELIS]: 'سومنيالي دانيليس'
        },
        ui: {
            placeholder: "صف حلمك...", interpret: "تفسير الحلم", choose_tradition: "اختر التقليد", refine_sources: "تحديد المصادر", oracle_speaks: "العراف يتحدث", close: "إغلاق", listening: "جاري الاستماع...", voices: "الصوت",
            settings: "الإعدادات", text_size: "الحجم", dictation_error: "خطأ: الميكروفون غير متوفر.", dictation_perm: "تم رفض الإذن.",
            calendar_btn: "التقويم والتحليل", coming_soon: "المزيد...", calendar_desc: "مذكرات أحلامك",
            profile_btn: "ملفك الشخصي", profile_desc: "الإحصائيات وأنا",
            hub_btn: "مركز الأحلام", hub_desc: "أحلام المجتمع",
            gen_image: "إنشاء صورة", saved_msg: "تم حفظ الحلم في التقويم!",
            watch_ad: "كسب عملات", generate_video: "إنشاء فيديو (ذهبي)", create_dream_video: "فيديو الحلم",
            video_btn_short: "📹 إنشاء فيديو", video_duration_short: "30 ثانية، 180 عملة",
            slideshow_btn: "📽️ إنشاء عرض شرائح", slideshow_duration: "30 ثانية، 180 عملة",
            premium_btn: "بريميوم / خطة", premium_desc: "تحديث وميزات",
            customer_file_btn: "ملف السياق الشخصي",
            theme: "المظهر", mode: "الوضع", dark: "داكن", light: "فاتح",
            style: "نمط التصميم", style_def: "افتراضي (غامض)", style_fem: "أنثوي (وردي)", style_masc: "ذكوري (أزرق)", style_nature: "طبيعة (أخضر)",
            voice_char: "طابع الصوت", fem_char: "أصوات نسائية", male_char: "أصوات رجالية", preview: "معاينة",
            info_title: "قاعدة المعرفة", info_bio: "سيرة شخصية", info_origin: "الأصل والخلفية",
            video_ready: "فيديو حلمك جاهز!", video_gen: "جاري إنشاء الفيديو...", video_error: "فشل الإنشاء.",
            map_btn: "من حلم نفس الحلم؟",
            api_manager: "مدير API (ذكي)", api_desc: "أضف مفاتيح Gemini API الخاصة بك. سيقوم النظام بالتبديل تلقائيًا إذا تم الوصول للحد.", add_key: "إضافة مفتاح", no_keys: "لا توجد مفاتيح محفوظة.",
            quality_normal: "عادي", quality_high: "جودة عالية",
            style_cartoon: "كرتون", style_anime: "أنمي", style_real: "واقعي", style_fantasy: "خيالي",
            choose_quality: "اختر الجودة", choose_style: "اختر الأسلوب",
            choose_image_style: "اختر أسلوب الصورة",
            choose_style_desc: "اختر الجودة والأسلوب لصورة حلمك",
            continue_without_image: "متابعة بدون إنشاء صورة",
            step_quality: "1. اختر الجودة",
            step_style: "2. اختر الأسلوب",
            continue: "متابعة",
            social_proof_stats: "47.832 حلم تم تحليله · 12.543 تطابق تم العثور عليه",
            social_proof_testimonial1: "\"أخيرًا أفهم أحلامي المتكررة!\" - آية, 28",
            social_proof_testimonial2: "\"التفسير متعدد المنظور فريد من نوعه.\" - محمد, 34",
            social_proof_testimonial3: "\"وجدت شخصًا بنفس الحلم!\" - سارة, 31",
            processing_context: "يأخذ في الاعتبار:",
            backup_title: "خزنة البيانات (نسخ احتياطي)",
            backup_desc: "قم بتأمين بياناتك كملف أو استعد نسخة احتياطية.",
            export_btn: "تنزيل نسخة",
            import_btn: "استعادة نسخة",
            home_label: "الرئيسية",
            map_label: "الخريطة",
            live_chat_label: "دردشة مباشرة",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "ذكي",
            audio_coin_prompt: "💰 +5 عملات مكافأة: فيديو بصوتك!",
            audio_coin_desc: "تم حفظ تسجيلك. أنشئ فيديو حلم بصوتك في ملفك الشخصي واكسب 5 عملات!",
            upload_audio: "رفع",
            upload_confirm_title: "تم حفظ الصوت بنجاح!",
            upload_confirm_desc: "تم حفظ تسجيلك الصوتي مع الحلم. تحقق منه في ملفك الشخصي تحت 'الصوت'!",
            got_it: "فهمت!",
            backup_restored: "تمت استعادة النسخة الاحتياطية بنجاح!",
            backup_error: "خطأ في استعادة النسخة الاحتياطية. ملف غير صالح.",
            storage_init: "جارٍ تهيئة التخزين. يرجى الانتظار.",
            mic_denied_alert: "تم رفض الوصول إلى الميكروفون",
            min_dreams_required: "تحتاج إلى 7 أحلام مفسرة على الأقل لاستخدام ميزة التحليل.",
            base_version: "النسخة الأساسية",
            until_date: "حتى:",
            audio_recorded: "تم تسجيل الصوت",
            audio_saved_with_dream: "سيتم حفظه مع الحلم",
            remove: "إزالة",
            oracle_voice: "صوت العراف",
            image_ready: "الصورة جاهزة!",
            style_desc_cartoon: "أسلوب بيكسار",
            style_desc_anime: "أسلوب جيبلي",
            style_desc_real: "فوتوواقعي",
            style_desc_fantasy: "سحري",
            cosmic_dna: "الحمض النووي الكوني",
            moon_sync: "تزامن القمر",
            cosmic_dna_body: "حمضك النووي الكوني هو بصمة أحلامك الفريدة — بناءً على تاريخ ميلادك وبرجك وأنماط أحلامك.",
            cosmic_dna_coming: "قريباً",
            cosmic_dna_enter: "أدخل تاريخ ميلادك في ملفك الشخصي لحساب حمضك النووي الكوني.",
            moon_phase_label: "مرحلة القمر",
            dream_meaning_today: "معنى الحلم اليوم",
            save_btn: "حفظ",
            age_restricted_cat: "هذه الفئة متاحة فقط للأشخاص الذين تبلغ أعمارهم 18 عامًا فما فوق.",
            ok: "حسنًا",
            video_studio: "استوديو الفيديو",
            dream_network: "شبكة الأحلام",
            privacy_link: "الخصوصية", terms_link: "الشروط", imprint_link: "البصمة", research_link: "البحث", studies_link: "الدراسات", worldmap_link: "خريطة العالم", showing_sources_only: "عرض مصادر {0} فقط", science_label: "المعرفة",
        },
        processing: {
            title: "العراف يعمل...",
            step_analyze: "تحليل تفسير الحلم",
            step_customer: "مراعاة سياق العميل",
            step_no_customer: "لا توجد بيانات للعميل",
            step_context: "جاري حساب الفئات والتقاليد",
            step_no_context: "لم يتم تحديد تقاليد محددة",
            step_image: "إنشاء الرؤية",
            step_save: "تم الحفظ في التقويم والملف الشخصي"
        },
        sub: {
            title: "اختر مستواك",
            billing_monthly: "شهري", billing_yearly: "سنوي",
            yearly_discount: "شهر مجاني!",
            smart_discount: "للمطورين",
            free_title: "Free",
            free_price: "0 €",
            free_features: ["تفسير أساسي (مدعوم بالإعلانات)", "الوصول إلى جدار العروض لعملات مجانية", "بريميوم عبر العملات", "مشاركة الرابط فقط"],
            silver_title: "Pro",
            silver_price: "4.99 € / شهر",
            silver_features: ["تجربة خالية من الإعلانات", "تحويل وتنزيل PDF غير محدود", "تفسيرات غير محدودة", "25 صورة HD/شهر", "دردشة مباشرة أسبوعية", "إدخال/إخراج صوتي"],
            gold_title: "ذهبي (VIP)",
            gold_price: "12.99 € / شهر",
            gold_trial_text: "7 أيام مجانًا، ثم 12.99 €/شهر",
            gold_features: ["جميع ميزات الفضي", "دردشة غير محدودة مع العراف", "5 فيديوهات أحلام/شهر", "خصم حصري على العملات", "دعم ذو أولوية"],
            smart_title: "ذكي (للمطورين)",
            smart_price: "49.99 € / سنة",
            smart_features: ["استخدم مفتاحك الخاص (BYOK)", "فتح جميع ميزات البريميوم", "تدوير تلقائي للمزود", "سعر سنوي ثابت (29.99€)"],
            smart_info_title: "ما هو تعريفة Smart Developer؟",
            smart_info_text: "للمطورين وعشاق التكنولوجيا: أنشئ حسابات مع موفري الذكاء الاصطناعي (مثل Google AI Studio)، وقم بإنشاء مفاتيح API الخاصة بك هناك وأضفها إلى التطبيق. بهذه الطريقة، تدفع فقط تكاليف API المنخفضة مباشرة للمزود + 3 يورو لاستخدام التطبيق. مثالي للمستخدمين المتقدمين!",
            upgrade: "ترقية", current: "حالياً", unlock: "فتح", try_free: "جرب مجانًا لمدة 7 أيام",
            ad_loading: "جاري تحميل الإعلان...", ad_reward: "تم كسب العملات!",
            bronze_title: "مجاني", bronze_features: ["3 تفسيرات/يوم", "Groq ذكاء", "6 تقاليد", "إعلانات"], bronze_price: "0 €",
            silver2_title: "برو", silver2_features: ["تفسيرات غير محدودة", "Gemini ذكاء", "جميع 9 تقاليد", "بدون إعلانات", "100 عملة/شهر", "خصم 10%"], silver2_price_monthly: "49,99 ر.س / شهر", silver2_price_yearly: "499,99 ر.س / سنة",
            gold2_title: "بريميوم", gold2_features: ["Claude 6 وجهات نظر", "500 عملة/شهر", "خصم 20%", "صور HD", "5 فيديو/شهر", "صوت مباشر", "دردشة ذكاء متقدمة"], gold2_price_monthly: "149,99 ر.س / شهر", gold2_price_yearly: "1.499,99 ر.س / سنة",
            
            pro_badge: "الأكثر شعبية", vip_badge: "حصري 👑",
        },
        earn: {
            title: "كسب العملات",
            desc: "أكمل المهام لزيادة رصيدك.",
            short_title: "مقطع قصير", short_desc: "10 ثوانٍ", short_reward: "1",
            long_title: "فيديو بريميوم", long_desc: "دقيقتين", long_reward: "3",
            offer_title: "جدار العروض", offer_desc: "استطلاعات ومهام", offer_reward: "5-10",
            offer_info: "أكمل مهام مثل الاستطلاعات أو اختبار التطبيقات أو التسجيل للحصول على مكافآت عالية.",
            survey_task: "استطلاع علامة تجارية", app_task: "الوصول للمستوى 5 في اللعبة",
            watch_btn: "مشاهدة", start_btn: "بدء"
        },
        shop: {
            title: "متجر العملات",
            desc: "جدد مخزونك.",
            starter_label: "مبتدئ", starter_price: "1.99 €", starter_amount: "100 عملة",
            best_label: "الأكثر مبيعاً", best_price: "5.99 €", best_amount: "550 عملة", best_badge: "شائع",
            value_label: "أفضل قيمة", value_price: "12.99 €", value_amount: "1500 عملة", value_badge: "أفضل قيمة",
            free_link: "هل تريد كسب عملات مجانية؟ اضغط هنا.",
            buy_btn: "شراء",
            wow_badge: "💎 أقل من سنت/عملة!",
            coins_label: "عملات",
            per_coin: "لكل عملة",
            pkg_starter: "جرّب", pkg_popular: "شائع", pkg_value: "قيمة أكبر", pkg_premium: "وفّر أكثر", pkg_mega: "مستخدم متقدم",
        },
        smart_guide: {
            step1_title: "إنشاء حساب", step1_desc: "أنشئ حسابًا مجانيًا في Google AI Studio.",
            step2_title: "توليد مفتاح", step2_desc: "انسخ مفتاح API الشخصي الخاص بك هناك.",
            step3_title: "لصق في التطبيق", step3_desc: "الصق المفتاح هنا لفتح البريميوم."
        }
    },
    [Language.PT]: {
        app_title: "Código de Sonhos | Dream Code",
        app_subtitle: "Todo o conhecimento da humanidade & um supercomputador – no seu bolso",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Basra, Iraque (Séc. VII)",
            [ReligiousSource.NABULSI]: "Damasco, Síria (Séc. XVII)",
            [ReligiousSource.AL_ISKHAFI]: "Bagdá (Abássidas)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Tradição Árabe (Abjad)",
            [ReligiousSource.MEDIEVAL]: "Europa (Medieval)",
            [ReligiousSource.MODERN_THEOLOGY]: "Teologia Ocidental",
            [ReligiousSource.CHURCH_FATHERS]: "Roma e Bizâncio (Patrística)",
            [ReligiousSource.ZEN]: "China e Japão",
            [ReligiousSource.TIBETAN]: "Tibete (Himalaia)",
            [ReligiousSource.THERAVADA]: "Sudeste Asiático (Cânone Pali)",
            [ReligiousSource.FREUDIAN]: "Viena (Psicanálise)",
            [ReligiousSource.JUNGIAN]: "Zurique (Psicologia Analítica)",
            [ReligiousSource.GESTALT]: "Berlim / Nova York",
            [ReligiousSource.WESTERN_ZODIAC]: "Tradição Helenística",
            [ReligiousSource.VEDIC_ASTROLOGY]: "Índia (Jyotish)",
            [ReligiousSource.CHINESE_ZODIAC]: "China (Calendário Lunar)",
            [ReligiousSource.PYTHAGOREAN]: "Grécia Antiga",
            [ReligiousSource.CHALDEAN]: "Babilônia (Mesopotâmia)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Misticismo Judaico (Espanha)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Índia (Vedas)",
            [ReligiousSource.IMAM_SADIQ]: "Tradição Xiita, Pérsia", [ReligiousSource.ISLAMSKI_SONNIK]: "Russo-Islâmico", [ReligiousSource.ZHOU_GONG]: "China, Interpretação de Sonhos", [ReligiousSource.HATSUYUME]: "Japão, Sonho de Ano Novo", [ReligiousSource.SWAPNA_SHASTRA]: "Índia, Védico/Hindu", [ReligiousSource.EDGAR_CAYCE]: "EUA, Profeta Adormecido", [ReligiousSource.RUDOLF_STEINER]: "Antroposofia, Áustria", [ReligiousSource.TALMUD_BERAKHOT]: "Babilônia, 55a-57b", [ReligiousSource.ZOHAR]: "Cabalístico, Séc. XIII", [ReligiousSource.VANGA]: "Bulgária, Séc. XX", [ReligiousSource.MILLER_RU]: "Interpretação Russa", [ReligiousSource.FREUD_RU]: "Adaptação Russa de Freud", [ReligiousSource.LOFF]: "Livro de Sonhos Russo", [ReligiousSource.NOSTRADAMUS_RU]: "Adaptação Russa", [ReligiousSource.ARTEMIDOROS]: "Grécia, Séc. II d.C.", [ReligiousSource.EGYPTIAN_PAPYRUS]: "Egito, ca. 1275 a.C.", [ReligiousSource.SOMNIALE_DANIELIS]: "Bizantino-Medieval"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islâmico', [ReligiousCategory.CHRISTIAN]: 'Cristão', [ReligiousCategory.BUDDHIST]: 'Budista', [ReligiousCategory.PSYCHOLOGICAL]: 'Psicológico', [ReligiousCategory.ASTROLOGY]: 'Astrologia', [ReligiousCategory.NUMEROLOGY]: 'Numerologia', [ReligiousCategory.JEWISH]: 'Judaico', [ReligiousCategory.SONNIKS]: 'Livros de Sonhos', [ReligiousCategory.ANCIENT]: 'Antigo',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibetano', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Medieval', [ReligiousSource.MODERN_THEOLOGY]: 'Teologia Moderna', [ReligiousSource.CHURCH_FATHERS]: 'Pais da Igreja', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Zodíaco Ocidental', [ReligiousSource.VEDIC_ASTROLOGY]: 'Védica', [ReligiousSource.CHINESE_ZODIAC]: 'Zodíaco Chinês', [ReligiousSource.PYTHAGOREAN]: 'Pitagórico', [ReligiousSource.CHALDEAN]: 'Caldeu', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Cabala', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Números Védicos', [ReligiousSource.IMAM_SADIQ]: 'Imam Sadiq', [ReligiousSource.ISLAMSKI_SONNIK]: 'Sonnik Islâmico', [ReligiousSource.ZHOU_GONG]: 'Zhou Gong', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berakhot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artemidoro', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Papiro Egípcio', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Descreva seu sonho...", interpret: "Interpretar Sonho", choose_tradition: "Escolher Tradição", refine_sources: "Refinar Fontes", oracle_speaks: "O Oráculo Fala", close: "Fechar", listening: "Ouvindo...", voices: "Voz",
            settings: "Configurações", text_size: "Tamanho", dictation_error: "Erro: Microfone indisponível.", dictation_perm: "Permissão negada.",
            calendar_btn: "Calendário e Análise", coming_soon: "Mais...", calendar_desc: "Seu Diário de Sonhos",
            profile_btn: "Seu Perfil", profile_desc: "Estatísticas e Eu",
            hub_btn: "Central de Sonhos", hub_desc: "Sonhos da Comunidade",
            gen_image: "Gerar Imagem", saved_msg: "Sonho salvo no calendário!",
            watch_ad: "Ganhar Moedas", generate_video: "Gerar Vídeo (Ouro)", create_dream_video: "Vídeo do Sonho",
            video_btn_short: "📹 Gerar Vídeo", video_duration_short: "30s, 180 Moedas",
            slideshow_btn: "📽️ Criar Apresentação", slideshow_duration: "30s, 180 Moedas",
            premium_btn: "Premium / Plano", premium_desc: "Upgrade e Recursos",
            customer_file_btn: "Arquivo de Contexto Pessoal",
            theme: "Aparência", mode: "Modo", dark: "Escuro", light: "Claro",
            style: "Estilo de Design", style_def: "Padrão (Místico)", style_fem: "Feminino (Rosa)", style_masc: "Masculino (Azul)", style_nature: "Natureza (Verde)",
            voice_char: "Personagem de Voz", fem_char: "Vozes Femininas", male_char: "Vozes Masculinas", preview: "Prévia",
            info_title: "Base de Conhecimento", info_bio: "Biografia", info_origin: "Origem e Contexto",
            video_ready: "Seu vídeo de sonho está pronto!", video_gen: "Gerando Vídeo...", video_error: "Falha na geração.",
            map_btn: "Quem teve o mesmo sonho?",
            api_manager: "Gerenciador de API (Smart)", api_desc: "Adicione suas chaves API Gemini. O sistema troca automaticamente se o limite for atingido.", add_key: "Adicionar Chave", no_keys: "Nenhuma chave encontrada.",
            quality_normal: "Normal", quality_high: "Alta Qualidade",
            style_cartoon: "Desenho Animado", style_anime: "Anime", style_real: "Realista", style_fantasy: "Fantasia",
            choose_quality: "Escolher Qualidade", choose_style: "Escolher Estilo",
            choose_image_style: "Escolher Estilo de Imagem",
            choose_style_desc: "Selecione a qualidade e o estilo para sua imagem de sonho",
            continue_without_image: "Continuar sem gerar imagem",
            step_quality: "1. Escolher Qualidade",
            step_style: "2. Escolher Estilo",
            continue: "Continuar",
            social_proof_stats: "47.832 sonhos analisados · 12.543 correspondências encontradas",
            social_proof_testimonial1: "\"Finalmente entendo meus sonhos recorrentes!\" - Ana, 28",
            social_proof_testimonial2: "\"A interpretação multiperspectiva é única.\" - Miguel, 34",
            social_proof_testimonial3: "\"Encontrei alguém com o mesmo sonho!\" - Sara, 31",
            processing_context: "Considerando:",
            backup_title: "Cofre de Dados (Backup)",
            backup_desc: "Proteja seus dados como arquivo ou restaure um backup.",
            export_btn: "Baixar Backup",
            import_btn: "Restaurar Backup",
            home_label: "Início",
            map_label: "Mapa",
            live_chat_label: "Chat ao Vivo",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Inteligente",
            audio_coin_prompt: "💰 +5 Moedas Bônus: Vídeo com Sua Voz!",
            audio_coin_desc: "Sua gravação foi salva. Crie um vídeo do sonho com sua própria voz no seu Perfil e ganhe 5 moedas!",
            upload_audio: "Enviar",
            upload_confirm_title: "Áudio Salvo com Sucesso!",
            upload_confirm_desc: "Sua gravação de áudio foi salva com o sonho. Confira no seu Perfil em 'Áudio'!",
            got_it: "Entendi!",
            backup_restored: "Backup restaurado com sucesso!",
            backup_error: "Erro ao restaurar backup. Arquivo inválido.",
            storage_init: "O armazenamento está inicializando. Por favor aguarde.",
            mic_denied_alert: "Acesso ao microfone negado",
            min_dreams_required: "Você precisa de pelo menos 7 sonhos interpretados para usar a função de análise.",
            base_version: "Versão Básica",
            until_date: "Até:",
            audio_recorded: "Áudio gravado",
            audio_saved_with_dream: "Será salvo com o sonho",
            remove: "Remover",
            oracle_voice: "Voz do Oráculo",
            image_ready: "Imagem Pronta!",
            style_desc_cartoon: "Estilo Pixar",
            style_desc_anime: "Estilo Ghibli",
            style_desc_real: "Fotorrealista",
            style_desc_fantasy: "Mágico",
            cosmic_dna: "DNA Cósmico",
            moon_sync: "Sincronização Lunar",
            cosmic_dna_body: "Seu DNA Cósmico é sua impressão digital de sonho única — baseada na data de nascimento, signo e padrões de sonhos.",
            cosmic_dna_coming: "Em breve",
            cosmic_dna_enter: "Insira sua data de nascimento no perfil para calcular seu DNA Cósmico.",
            moon_phase_label: "Fase da lua",
            dream_meaning_today: "Significado do sonho hoje",
            save_btn: "Salvar",
            age_restricted_cat: "Esta categoria está disponível apenas para pessoas com 18 anos ou mais.",
            ok: "OK",
            video_studio: "Estúdio de Vídeo",
            dream_network: "Rede de Sonhos",
            privacy_link: "Privacidade", terms_link: "Termos", imprint_link: "Marca Legal", research_link: "Pesquisa", studies_link: "Estudos", worldmap_link: "Mapa Mundial", showing_sources_only: "Mostrando apenas fontes de {0}", science_label: "Conhecimento",
        },
        processing: {
            title: "O Oráculo trabalha...",
            step_analyze: "Analisando a interpretação do sonho",
            step_customer: "Considerando o contexto do cliente",
            step_no_customer: "Nenhum dado do cliente disponível",
            step_context: "Calculando categorias e tradições",
            step_no_context: "Nenhuma tradição específica selecionada",
            step_image: "Gerando visão",
            step_save: "Salvo no calendário e perfil"
        },
        sub: {
            title: "Escolha seu Nível",
            billing_monthly: "Mensal", billing_yearly: "Anual",
            yearly_discount: "1 Mês Grátis!",
            smart_discount: "Para Desenvolvedores",
            free_title: "Free",
            free_price: "0 €",
            free_features: ["Interpretação Básica (Com anúncios)", "Acesso ao Offerwall para moedas grátis", "Premium via moedas", "Apenas compartilhamento de link"],
            silver_title: "Pro",
            silver_price: "4.99 € / mês",
            silver_features: ["Experiência sem anúncios", "Conversão e download ilimitado de PDF", "Interpretações ilimitadas", "25 Imagens HD/mês", "1x Chat ao vivo semanal", "Entrada/Saída de Áudio"],
            gold_title: "Ouro (VIP)", 
            gold_price: "12.99 € / mês",
            gold_trial_text: "7 dias grátis, depois 12.99 €/mês",
            gold_features: ["Todos os recursos Prata", "Chat Ilimitado com o Oráculo", "5 Vídeos de Sonhos/mês", "Desconto exclusivo em moedas", "Suporte Prioritário"],
            smart_title: "Inteligente (Desenvolvedor)",
            smart_price: "49.99 € / ano",
            smart_features: ["Traga Sua Própria Chave (BYOK)", "Todos os recursos Premium desbloqueados", "Rotação automática de provedor", "Preço anual fixo (29.99€)"],
            smart_info_title: "O que é o plano Smart Developer?",
            smart_info_text: "Para desenvolvedores e entusiastas de tecnologia: crie contas com provedores de IA (por exemplo, Google AI Studio), gere suas próprias chaves de API lá e adicione-as ao aplicativo. Dessa forma, você paga apenas os baixos custos de API diretamente ao provedor + 3€ pelo uso do aplicativo. Perfeito para power users!",
            upgrade: "Atualizar", current: "Atual", unlock: "Desbloquear", try_free: "TESTE GRÁTIS POR 7 DIAS",
            ad_loading: "Carregando anúncio...", ad_reward: "Moedas ganhas!",
            bronze_title: "Free", bronze_features: ["3 Interpretações/Dia", "Groq IA", "6 Tradições", "Anúncios"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["Interpretações Ilimitadas", "Gemini IA", "Todas 9 Tradições", "Sem Anúncios", "100 Moedas/Mês", "10% Desconto"], silver2_price_monthly: "€4,99 / Mês", silver2_price_yearly: "€49,99 / Ano",
            gold2_title: "Premium", gold2_features: ["Claude 6 Perspectivas", "500 Moedas/Mês", "20% Desconto", "Imagens HD", "5 Vídeos/Mês", "Voz ao Vivo", "Chat IA Premium"], gold2_price_monthly: "€14,99 / Mês", gold2_price_yearly: "€149,99 / Ano",
            
            pro_badge: "MAIS POPULAR", vip_badge: "EXCLUSIVO 👑",
        },
        earn: {
            title: "Ganhar Moedas",
            desc: "Complete tarefas para recarregar seu saldo.",
            short_title: "Clipe Curto", short_desc: "10 Segundos", short_reward: "1",
            long_title: "Vídeo Premium", long_desc: "2 Minutos", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Pesquisas e Tarefas", offer_reward: "5-10",
            offer_info: "Complete tarefas como pesquisas, testes de aplicativos ou inscrições para altas recompensas.",
            survey_task: "Pesquisa de Marca", app_task: "Chegar ao Nível 5 no Jogo",
            watch_btn: "Assistir", start_btn: "Começar"
        },
        shop: {
            title: "Loja de Moedas",
            desc: "Recarregue seu suprimento.",
            starter_label: "Iniciante", starter_price: "1.99 €", starter_amount: "100 Moedas",
            best_label: "Mais Vendido", best_price: "5.99 €", best_amount: "550 Moedas", best_badge: "Popular",
            value_label: "Melhor Valor", value_price: "12.99 €", value_amount: "1500 Moedas", value_badge: "Melhor Valor",
            free_link: "Quer ganhar moedas grátis? Clique aqui.",
            buy_btn: "Comprar",
            wow_badge: "💎 Menos de 1 Cêntimo/Moeda!",
            coins_label: "Moedas",
            per_coin: "por moeda",
            pkg_starter: "Experimente", pkg_popular: "Popular", pkg_value: "Mais Valor", pkg_premium: "Economize", pkg_mega: "Usuário Pro",
        },
        smart_guide: {
            step1_title: "Criar Conta", step1_desc: "Crie uma conta gratuita no Google AI Studio.",
            step2_title: "Gerar Chave", step2_desc: "Copie sua Chave API pessoal lá.",
            step3_title: "Colar no App", step3_desc: "Cole a chave aqui para desbloquear Premium."
        }
    },
    [Language.RU]: {
        app_title: "Код Снов | Dream Code",
        app_subtitle: "Все знания человечества и суперкомпьютер – в вашем кармане",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Басра, Ирак (VII в.)",
            [ReligiousSource.NABULSI]: "Дамаск, Сирия (XVII в.)",
            [ReligiousSource.AL_ISKHAFI]: "Багдад (Аббасиды)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Арабская традиция (Абджад)",
            [ReligiousSource.MEDIEVAL]: "Европа (Средневековье)",
            [ReligiousSource.MODERN_THEOLOGY]: "Западное богословие",
            [ReligiousSource.CHURCH_FATHERS]: "Рим и Византия (Патристика)",
            [ReligiousSource.ZEN]: "Китай и Япония",
            [ReligiousSource.TIBETAN]: "Тибет (Гималаи)",
            [ReligiousSource.THERAVADA]: "Юго-Восточная Азия (Палийский канон)",
            [ReligiousSource.FREUDIAN]: "Вена (Психоанализ)",
            [ReligiousSource.JUNGIAN]: "Цюрих (Аналитическая психология)",
            [ReligiousSource.GESTALT]: "Берлин / Нью-Йорк",
            [ReligiousSource.WESTERN_ZODIAC]: "Эллинистическая традиция",
            [ReligiousSource.VEDIC_ASTROLOGY]: "Индия (Джйотиш)",
            [ReligiousSource.CHINESE_ZODIAC]: "Китай (Лунный календарь)",
            [ReligiousSource.PYTHAGOREAN]: "Древняя Греция",
            [ReligiousSource.CHALDEAN]: "Вавилон (Месопотамия)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Еврейский мистицизм (Испания)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Индия (Веды)",
            [ReligiousSource.IMAM_SADIQ]: "Шиитская традиция, Персия",
            [ReligiousSource.ISLAMSKI_SONNIK]: "Русско-исламский",
            [ReligiousSource.ZHOU_GONG]: "Китай, Толкование снов",
            [ReligiousSource.HATSUYUME]: "Япония, Новогодний сон",
            [ReligiousSource.SWAPNA_SHASTRA]: "Индия, Ведический/Индуизм",
            [ReligiousSource.EDGAR_CAYCE]: "США, Спящий пророк",
            [ReligiousSource.RUDOLF_STEINER]: "Антропософия, Австрия",
            [ReligiousSource.TALMUD_BERAKHOT]: "Вавилония, 55а-57б",
            [ReligiousSource.ZOHAR]: "Каббалистический, XIII в.",
            [ReligiousSource.VANGA]: "Болгария, XX в.",
            [ReligiousSource.MILLER_RU]: "Русское толкование снов",
            [ReligiousSource.FREUD_RU]: "Русская адаптация Фрейда",
            [ReligiousSource.LOFF]: "Русский сонник",
            [ReligiousSource.NOSTRADAMUS_RU]: "Русская адаптация",
            [ReligiousSource.ARTEMIDOROS]: "Греция, II в. н.э.",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "Египет, ок. 1275 до н.э.",
            [ReligiousSource.SOMNIALE_DANIELIS]: "Византийско-средневековый"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Исламский', [ReligiousCategory.CHRISTIAN]: 'Христианский', [ReligiousCategory.BUDDHIST]: 'Буддийский', [ReligiousCategory.PSYCHOLOGICAL]: 'Психологический', [ReligiousCategory.ASTROLOGY]: 'Астрология', [ReligiousCategory.NUMEROLOGY]: 'Нумерология', [ReligiousCategory.JEWISH]: 'Иудейский', [ReligiousCategory.SONNIKS]: 'Сонники', [ReligiousCategory.ANCIENT]: 'Античный',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Тибетский', [ReligiousSource.IBN_SIRIN]: 'Ибн Сирин', [ReligiousSource.NABULSI]: 'Ан-Набулси', [ReligiousSource.AL_ISKHAFI]: 'Аль-Исхафи', [ReligiousSource.MEDIEVAL]: 'Средневековый', [ReligiousSource.MODERN_THEOLOGY]: 'Современное богословие', [ReligiousSource.CHURCH_FATHERS]: 'Отцы Церкви', [ReligiousSource.ZEN]: 'Дзен', [ReligiousSource.THERAVADA]: 'Тхеравада', [ReligiousSource.FREUDIAN]: 'Фрейд', [ReligiousSource.JUNGIAN]: 'Юнг', [ReligiousSource.GESTALT]: 'Гештальт', [ReligiousSource.WESTERN_ZODIAC]: 'Западный зодиак', [ReligiousSource.VEDIC_ASTROLOGY]: 'Ведическая', [ReligiousSource.CHINESE_ZODIAC]: 'Китайский зодиак', [ReligiousSource.PYTHAGOREAN]: 'Пифагорейская', [ReligiousSource.CHALDEAN]: 'Халдейская', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Каббала', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Абджад', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Ведические числа', [ReligiousSource.IMAM_SADIQ]: 'Имам Садик', [ReligiousSource.ISLAMSKI_SONNIK]: 'Исламский сонник', [ReligiousSource.ZHOU_GONG]: 'Чжоу Гун', [ReligiousSource.HATSUYUME]: 'Хацуюмэ', [ReligiousSource.SWAPNA_SHASTRA]: 'Свапна Шастра', [ReligiousSource.EDGAR_CAYCE]: 'Эдгар Кейси', [ReligiousSource.RUDOLF_STEINER]: 'Рудольф Штайнер', [ReligiousSource.TALMUD_BERAKHOT]: 'Талмуд Берахот', [ReligiousSource.ZOHAR]: 'Зоар', [ReligiousSource.VANGA]: 'Ванга', [ReligiousSource.MILLER_RU]: 'Миллер', [ReligiousSource.FREUD_RU]: 'Фрейд (рус.)', [ReligiousSource.LOFF]: 'Лофф', [ReligiousSource.NOSTRADAMUS_RU]: 'Нострадамус', [ReligiousSource.ARTEMIDOROS]: 'Артемидор', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Египетский папирус', [ReligiousSource.SOMNIALE_DANIELIS]: 'Сомниале Даниелис'
        },
        ui: {
            placeholder: "Опишите ваш сон...", interpret: "Толковать сон", choose_tradition: "Выбрать традицию", refine_sources: "Уточнить источники", oracle_speaks: "Оракул говорит", close: "Закрыть", listening: "Слушаю...", voices: "Голос",
            settings: "Настройки", text_size: "Размер", dictation_error: "Ошибка: микрофон недоступен.", dictation_perm: "Доступ запрещен.",
            calendar_btn: "Календарь и анализ", coming_soon: "Ещё...", calendar_desc: "Ваш дневник снов",
            profile_btn: "Ваш профиль", profile_desc: "Статистика и я",
            hub_btn: "Центр снов", hub_desc: "Сны сообщества",
            gen_image: "Создать изображение", saved_msg: "Сон сохранен в календаре!",
            watch_ad: "Заработать монеты", generate_video: "Создать видео (Золото)", create_dream_video: "Видео Сна",
            video_btn_short: "📹 Создать видео", video_duration_short: "30с, 180 монет",
            slideshow_btn: "📽️ Создать слайдшоу", slideshow_duration: "30с, 180 монет",
            premium_btn: "Премиум / План", premium_desc: "Обновление и функции",
            customer_file_btn: "Файл личного контекста",
            theme: "Внешний вид", mode: "Режим", dark: "Темный", light: "Светлый",
            style: "Стиль дизайна", style_def: "По умолчанию (Мистический)", style_fem: "Женский (Розовый)", style_masc: "Мужской (Синий)", style_nature: "Природа (Зеленый)",
            voice_char: "Характер голоса", fem_char: "Женские голоса", male_char: "Мужские голоса", preview: "Предпросмотр",
            info_title: "База знаний", info_bio: "Биография", info_origin: "Происхождение и предыстория",
            video_ready: "Ваше видео сна готово!", video_gen: "Создание видео...", video_error: "Ошибка создания.",
            map_btn: "Кто видел такой же сон?",
            api_manager: "Менеджер API (Smart)", api_desc: "Добавьте свои ключи API Gemini. Система автоматически переключится при достижении лимита.", add_key: "Добавить ключ", no_keys: "Ключи не найдены.",
            quality_normal: "Обычное", quality_high: "Высокое качество",
            style_cartoon: "Мультфильм", style_anime: "Аниме", style_real: "Реалистичное", style_fantasy: "Фэнтези",
            choose_quality: "Выбрать качество", choose_style: "Выбрать стиль",
            choose_image_style: "Выбрать стиль изображения",
            choose_style_desc: "Выберите качество и стиль для вашего изображения сна",
            continue_without_image: "Продолжить без создания изображения",
            step_quality: "1. Выбрать качество",
            step_style: "2. Выбрать стиль",
            continue: "Продолжить",
            social_proof_stats: "47 832 сна проанализировано · 12 543 совпадения найдено",
            social_proof_testimonial1: "\"Наконец-то понимаю свои повторяющиеся сны!\" - Анна, 28",
            social_proof_testimonial2: "\"Мультиперспективное толкование уникально.\" - Михаил, 34",
            social_proof_testimonial3: "\"Нашла кого-то с таким же сном!\" - Сара, 31",
            processing_context: "Учитывается:",
            backup_title: "Хранилище данных (Резервное копирование)",
            backup_desc: "Защитите свои данные как файл или восстановите резервную копию.",
            export_btn: "Скачать резервную копию",
            import_btn: "Восстановить резервную копию",
            home_label: "Главная",
            map_label: "Карта",
            live_chat_label: "Живой чат",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Умный",
            audio_coin_prompt: "💰 +5 Монет Бонус: Видео с Вашим Голосом!",
            audio_coin_desc: "Ваша запись сохранена. Создайте видео сна с вашим голосом в Профиле и заработайте 5 монет!",
            upload_audio: "Загрузить",
            upload_confirm_title: "Аудио Успешно Сохранено!",
            upload_confirm_desc: "Ваша аудиозапись была сохранена со сном. Проверьте в Профиле в разделе 'Аудио'!",
            got_it: "Понятно!",
            backup_restored: "Резервная копия успешно восстановлена!",
            backup_error: "Ошибка восстановления. Недопустимый файл.",
            storage_init: "Хранилище инициализируется. Пожалуйста, подождите.",
            mic_denied_alert: "Доступ к микрофону отклонён",
            min_dreams_required: "Для использования функции анализа необходимо минимум 7 истолкованных снов.",
            base_version: "Базовая версия",
            until_date: "До:",
            audio_recorded: "Аудио записано",
            audio_saved_with_dream: "Будет сохранено со сном",
            remove: "Удалить",
            oracle_voice: "Голос Оракула",
            image_ready: "Изображение Готово!",
            style_desc_cartoon: "Стиль Pixar",
            style_desc_anime: "Стиль Ghibli",
            style_desc_real: "Фотореалистичный",
            style_desc_fantasy: "Волшебный",
            cosmic_dna: "Космическая ДНК",
            moon_sync: "Лунная Синхронизация",
            cosmic_dna_body: "Ваша Космическая ДНК — уникальный отпечаток ваших снов, основанный на дате рождения, знаке зодиака и паттернах ваших снов.",
            cosmic_dna_coming: "Скоро",
            cosmic_dna_enter: "Введите дату рождения в профиле для расчёта вашей Космической ДНК.",
            moon_phase_label: "Фаза луны",
            dream_meaning_today: "Значение сна сегодня",
            save_btn: "Сохранить",
            age_restricted_cat: "Эта категория доступна только для лиц от 18 лет и старше.",
            ok: "ОК",
            video_studio: "Видео Студия",
            dream_network: "Сеть Снов",
            privacy_link: "Конфиденциальность", terms_link: "Условия", imprint_link: "Выходные данные", research_link: "Исследования", studies_link: "Исследования", worldmap_link: "Карта мира", showing_sources_only: "Только {0} источники", science_label: "Знания",
        },
        processing: {
            title: "Оракул работает...",
            step_analyze: "Анализ толкования сна",
            step_customer: "Учет контекста клиента",
            step_no_customer: "Нет данных клиента",
            step_context: "Расчет категорий и традиций",
            step_no_context: "Конкретные традиции не выбраны",
            step_image: "Создание видения",
            step_save: "Сохранено в календаре и профиле"
        },
        sub: {
            title: "Выберите свой уровень",
            billing_monthly: "Ежемесячно", billing_yearly: "Ежегодно",
            yearly_discount: "1 месяц бесплатно!",
            smart_discount: "Для разработчиков",
            free_title: "Free",
            free_price: "0 €",
            free_features: ["Базовое толкование (С рекламой)", "Доступ к Offerwall для бесплатных монет", "Премиум через монеты", "Только ссылка для обмена"],
            silver_title: "Pro",
            silver_price: "4.99 € / мес",
            silver_features: ["Без рекламы", "Неограниченная конвертация и загрузка PDF", "Неограниченные толкования", "25 HD изображений/мес", "1x еженедельный живой чат", "Аудио ввод/вывод"],
            gold_title: "Золото (VIP)",
            gold_price: "12.99 € / мес",
            gold_trial_text: "7 дней бесплатно, затем 12.99 €/мес",
            gold_features: ["Все функции Серебра", "Неограниченный чат с Оракулом", "5 видео снов/мес", "Эксклюзивная скидка на монеты", "Приоритетная поддержка"],
            smart_title: "Умный (Разработчик)",
            smart_price: "49.99 € / год",
            smart_features: ["Используйте свой ключ (BYOK)", "Все премиум-функции разблокированы", "Автоматическая ротация провайдера", "Фиксированная годовая цена (29.99€)"],
            smart_info_title: "Что такое тариф Smart Developer?",
            smart_info_text: "Для разработчиков и энтузиастов: создайте аккаунты у поставщиков ИИ (например, Google AI Studio), сгенерируйте там свои API-ключи и добавьте их в приложение. Так вы платите только низкую стоимость API напрямую поставщику + 3€ за использование приложения. Идеально для продвинутых пользователей!",
            upgrade: "Обновить", current: "Текущий", unlock: "Разблокировать", try_free: "ПОПРОБОВАТЬ БЕСПЛАТНО 7 ДНЕЙ",
            ad_loading: "Загрузка рекламы...", ad_reward: "Монеты получены!",
            bronze_title: "Free", bronze_features: ["3 Толкования/День", "Groq ИИ", "6 Традиций", "Реклама"], bronze_price: "0 ₽",
            silver2_title: "Про", silver2_features: ["Безлимитные Толкования", "Gemini ИИ", "Все 9 Традиций", "Без Рекламы", "100 Монет/Месяц", "Скидка 10%"], silver2_price_monthly: "249 ₽ / Месяц", silver2_price_yearly: "2.499 ₽ / Год",
            gold2_title: "Премиум", gold2_features: ["Claude 6 Перспектив", "500 Монет/Месяц", "Скидка 20%", "HD Изображения", "5 Видео/Месяц", "Живой Голос", "Премиум ИИ Чат"], gold2_price_monthly: "749 ₽ / Месяц", gold2_price_yearly: "7.499 ₽ / Год",
            
            pro_badge: "САМЫЙ ПОПУЛЯРНЫЙ", vip_badge: "ЭКСКЛЮЗИВ 👑",
        },
        earn: {
            title: "Заработать монеты",
            desc: "Выполняйте задания для пополнения баланса.",
            short_title: "Короткий клип", short_desc: "10 секунд", short_reward: "1",
            long_title: "Премиум видео", long_desc: "2 минуты", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Опросы и задания", offer_reward: "5-10",
            offer_info: "Выполняйте задания, такие как опросы, тестирование приложений или регистрация для высоких наград.",
            survey_task: "Опрос бренда", app_task: "Достичь уровня 5 в игре",
            watch_btn: "Смотреть", start_btn: "Начать"
        },
        shop: {
            title: "Магазин монет",
            desc: "Пополните свой запас.",
            starter_label: "Начальный", starter_price: "1.99 €", starter_amount: "100 монет",
            best_label: "Самый популярный", best_price: "5.99 €", best_amount: "550 монет", best_badge: "Популярный",
            value_label: "Лучшее предложение", value_price: "12.99 €", value_amount: "1500 монет", value_badge: "Лучшее предложение",
            free_link: "Хотите заработать бесплатные монеты? Нажмите здесь.",
            buy_btn: "Купить",
            wow_badge: "💎 Меньше 1 Цента/Монета!",
            coins_label: "монет",
            per_coin: "за монету",
            pkg_starter: "Попробуй", pkg_popular: "Популярный", pkg_value: "Больше ценности", pkg_premium: "Экономьте", pkg_mega: "Продвинутый",
        },
        smart_guide: {
            step1_title: "Создать аккаунт", step1_desc: "Создайте бесплатный аккаунт в Google AI Studio.",
            step2_title: "Сгенерировать ключ", step2_desc: "Скопируйте свой персональный ключ API оттуда.",
            step3_title: "Вставить в приложение", step3_desc: "Вставьте ключ сюда, чтобы разблокировать Премиум."
        }
    },
    [Language.ZH]: {
        app_title: "梦境密码",
        app_subtitle: "全人类的智慧与超级计算机——尽在你的口袋",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "巴士拉，伊拉克（7世纪）",
            [ReligiousSource.NABULSI]: "大马士革，叙利亚（17世纪）",
            [ReligiousSource.AL_ISKHAFI]: "巴格达（阿拔斯王朝）",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "阿拉伯传统（阿布贾德）",
            [ReligiousSource.MEDIEVAL]: "欧洲（中世纪）",
            [ReligiousSource.MODERN_THEOLOGY]: "西方神学",
            [ReligiousSource.CHURCH_FATHERS]: "罗马与拜占庭（教父学）",
            [ReligiousSource.ZEN]: "中国与日本",
            [ReligiousSource.TIBETAN]: "西藏（喜马拉雅）",
            [ReligiousSource.THERAVADA]: "东南亚（巴利三藏）",
            [ReligiousSource.FREUDIAN]: "维也纳（精神分析）",
            [ReligiousSource.JUNGIAN]: "苏黎世（分析心理学）",
            [ReligiousSource.GESTALT]: "柏林 / 纽约",
            [ReligiousSource.WESTERN_ZODIAC]: "希腊化传统",
            [ReligiousSource.VEDIC_ASTROLOGY]: "印度（吠陀占星）",
            [ReligiousSource.CHINESE_ZODIAC]: "中国（农历）",
            [ReligiousSource.PYTHAGOREAN]: "古希腊",
            [ReligiousSource.CHALDEAN]: "巴比伦（美索不达米亚）",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "犹太神秘主义（西班牙）",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "印度（吠陀）",
            [ReligiousSource.IMAM_SADIQ]: "什叶派传统，波斯",
            [ReligiousSource.ISLAMSKI_SONNIK]: "俄罗斯-伊斯兰",
            [ReligiousSource.ZHOU_GONG]: "中国，解梦",
            [ReligiousSource.HATSUYUME]: "日本，新年之梦",
            [ReligiousSource.SWAPNA_SHASTRA]: "印度，吠陀/印度教",
            [ReligiousSource.EDGAR_CAYCE]: "美国，睡眠先知",
            [ReligiousSource.RUDOLF_STEINER]: "人智学，奥地利",
            [ReligiousSource.TALMUD_BERAKHOT]: "巴比伦尼亚，55a-57b",
            [ReligiousSource.ZOHAR]: "卡巴拉，13世纪",
            [ReligiousSource.VANGA]: "保加利亚，20世纪",
            [ReligiousSource.MILLER_RU]: "俄罗斯解梦",
            [ReligiousSource.FREUD_RU]: "俄罗斯弗洛伊德改编",
            [ReligiousSource.LOFF]: "俄罗斯梦书",
            [ReligiousSource.NOSTRADAMUS_RU]: "俄罗斯改编",
            [ReligiousSource.ARTEMIDOROS]: "希腊，公元2世纪",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "埃及，约公元前1275年",
            [ReligiousSource.SOMNIALE_DANIELIS]: "拜占庭-中世纪"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: '伊斯兰', [ReligiousCategory.CHRISTIAN]: '基督教', [ReligiousCategory.BUDDHIST]: '佛教', [ReligiousCategory.PSYCHOLOGICAL]: '心理学', [ReligiousCategory.ASTROLOGY]: '占星术', [ReligiousCategory.NUMEROLOGY]: '数秘术', [ReligiousCategory.JEWISH]: '犹太教', [ReligiousCategory.SONNIKS]: '梦书', [ReligiousCategory.ANCIENT]: '古代',
        },
        sources: {
            [ReligiousSource.TIBETAN]: '藏传', [ReligiousSource.IBN_SIRIN]: '伊本·西林', [ReligiousSource.NABULSI]: '纳布卢西', [ReligiousSource.AL_ISKHAFI]: '伊斯哈菲', [ReligiousSource.MEDIEVAL]: '中世纪', [ReligiousSource.MODERN_THEOLOGY]: '现代神学', [ReligiousSource.CHURCH_FATHERS]: '教父', [ReligiousSource.ZEN]: '禅宗', [ReligiousSource.THERAVADA]: '上座部', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: '西方星座', [ReligiousSource.VEDIC_ASTROLOGY]: '吠陀', [ReligiousSource.CHINESE_ZODIAC]: '中国生肖', [ReligiousSource.PYTHAGOREAN]: '毕达哥拉斯', [ReligiousSource.CHALDEAN]: '迦勒底', [ReligiousSource.KABBALAH_NUMEROLOGY]: '卡巴拉', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: '吠陀数字', [ReligiousSource.IMAM_SADIQ]: '伊玛目·萨迪克', [ReligiousSource.ISLAMSKI_SONNIK]: '伊斯兰梦书', [ReligiousSource.ZHOU_GONG]: '周公', [ReligiousSource.HATSUYUME]: '初梦', [ReligiousSource.SWAPNA_SHASTRA]: '斯瓦普纳经', [ReligiousSource.EDGAR_CAYCE]: '埃德加·凯西', [ReligiousSource.RUDOLF_STEINER]: '鲁道夫·施泰纳', [ReligiousSource.TALMUD_BERAKHOT]: '塔木德·贝拉霍特', [ReligiousSource.ZOHAR]: '佐哈尔', [ReligiousSource.VANGA]: '旺加', [ReligiousSource.MILLER_RU]: '米勒', [ReligiousSource.FREUD_RU]: '弗洛伊德 (RU)', [ReligiousSource.LOFF]: '洛夫', [ReligiousSource.NOSTRADAMUS_RU]: '诺查丹玛斯', [ReligiousSource.ARTEMIDOROS]: '阿尔忒弥多罗斯', [ReligiousSource.EGYPTIAN_PAPYRUS]: '埃及纸莎草', [ReligiousSource.SOMNIALE_DANIELIS]: '但以理梦书'
        },
        ui: {
            placeholder: "描述你的梦境...", interpret: "解梦", choose_tradition: "选择传统", refine_sources: "精选来源", oracle_speaks: "神谕启示", close: "关闭", listening: "正在聆听...", voices: "语音",
            settings: "设置", text_size: "字体大小", dictation_error: "错误：麦克风不可用。", dictation_perm: "权限被拒绝。",
            calendar_btn: "日历与分析", coming_soon: "更多...", calendar_desc: "你的梦境日记",
            profile_btn: "个人资料", profile_desc: "统计与我",
            hub_btn: "梦境中心", hub_desc: "社区梦境",
            gen_image: "生成图片", saved_msg: "梦境已保存到日历！",
            watch_ad: "赚取金币", generate_video: "生成视频（黄金）", create_dream_video: "梦境视频",
            video_btn_short: "📹 生成视频", video_duration_short: "30秒，180金币",
            slideshow_btn: "📽️ 创建幻灯片", slideshow_duration: "30秒，180金币",
            premium_btn: "高级 / 计划", premium_desc: "升级与功能",
            customer_file_btn: "个人上下文文件",
            theme: "外观", mode: "模式", dark: "深色", light: "浅色",
            style: "设计风格", style_def: "默认（神秘）", style_fem: "女性（玫瑰）", style_masc: "男性（蓝色）", style_nature: "自然（绿色）",
            voice_char: "语音角色", fem_char: "女性角色", male_char: "男性角色", preview: "预览",
            info_title: "知识库", info_bio: "传记", info_origin: "起源与背景",
            video_ready: "你的梦境视频已就绪！", video_gen: "正在生成视频...", video_error: "生成失败。",
            map_btn: "谁做了同样的梦？",
            api_manager: "API密钥管理器（Smart层级）", api_desc: "添加你的Gemini API密钥。达到限额时系统自动切换。", add_key: "添加密钥", no_keys: "未找到密钥。",
            quality_normal: "普通", quality_high: "高质量",
            style_cartoon: "卡通", style_anime: "动漫", style_real: "写实", style_fantasy: "奇幻",
            choose_quality: "选择质量", choose_style: "选择风格",
            choose_image_style: "选择图片风格",
            choose_style_desc: "为你的梦境图片选择质量和风格",
            continue_without_image: "不生成图片继续",
            step_quality: "1. 选择质量",
            step_style: "2. 选择风格",
            continue: "继续",
            social_proof_stats: "已分析47,832个梦境 · 找到12,543个梦境匹配",
            social_proof_testimonial1: "\"终于理解了我反复出现的梦！\" - 小红，28岁",
            social_proof_testimonial2: "\"多角度的解读独一无二。\" - 小明，34岁",
            social_proof_testimonial3: "\"通过这个应用找到了做同样梦的人！\" - 小丽，31岁",
            processing_context: "正在考虑：",
            backup_title: "数据保险库（备份）",
            backup_desc: "将你的数据安全保存为文件或恢复备份。",
            export_btn: "下载备份",
            import_btn: "恢复备份",
            home_label: "首页",
            map_label: "地图",
            live_chat_label: "实时聊天",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5金币奖励：用你的声音制作视频！",
            audio_coin_desc: "你的录音已保存。在个人资料中用你自己的声音创建梦境视频，赚取5金币！",
            upload_audio: "上传",
            upload_confirm_title: "音频保存成功！",
            upload_confirm_desc: "你的音频录音已随梦境保存。在个人资料的「音频」中查看！",
            got_it: "知道了！",
            backup_restored: "备份恢复成功！",
            backup_error: "恢复备份出错。文件无效。",
            storage_init: "存储正在初始化，请稍候。",
            mic_denied_alert: "麦克风访问被拒绝",
            min_dreams_required: "你需要至少7个已解读的梦境才能使用分析功能。",
            base_version: "基础版本",
            until_date: "截止：",
            audio_recorded: "音频已录制",
            audio_saved_with_dream: "将随梦境保存",
            remove: "移除",
            oracle_voice: "神谕之声",
            image_ready: "图片已就绪！",
            style_desc_cartoon: "皮克斯风格",
            style_desc_anime: "吉卜力风格",
            style_desc_real: "写实风格",
            style_desc_fantasy: "魔幻风格",
            cosmic_dna: "宇宙DNA",
            moon_sync: "月亮同步",
            cosmic_dna_body: "你的宇宙DNA是你独特的梦境指纹——基于你的出生日期、星座和梦境模式。",
            cosmic_dna_coming: "即将推出",
            cosmic_dna_enter: "在个人资料中输入出生日期以计算你的宇宙DNA。",
            moon_phase_label: "月相",
            dream_meaning_today: "今日梦境含义",
            save_btn: "保存",
            age_restricted_cat: "此类别仅适用于18岁及以上的用户。",
            ok: "确定",
            video_studio: "视频工作室",
            dream_network: "梦境网络",
            privacy_link: "隐私", terms_link: "条款", imprint_link: "版权", research_link: "研究", studies_link: "研究", worldmap_link: "世界地图", showing_sources_only: "仅显示{0}来源", science_label: "知识",
        },
        processing: {
            title: "神谕运作中...",
            step_analyze: "正在分析梦境解读",
            step_customer: "正在考虑客户上下文",
            step_no_customer: "无可用客户上下文",
            step_context: "正在计算类别与传统",
            step_no_context: "未选择特定传统",
            step_image: "正在生成愿景",
            step_save: "已保存到日历和个人资料"
        },
        sub: {
            title: "选择你的层级",
            billing_monthly: "月付", billing_yearly: "年付",
            yearly_discount: "免费1个月！",
            smart_discount: "为开发者",
            free_title: "免费",
            free_price: "0 €",
            free_features: ["基础解读（含广告）", "通过任务墙赚取免费金币", "用金币解锁高级功能", "仅限链接分享"],
            silver_title: "Pro",
            silver_price: "4.99 € / 月",
            silver_features: ["无广告体验", "无限PDF转换和下载", "无限解读", "每月25张高清图片", "每周1次实时聊天", "音频输入/输出"],
            gold_title: "Gold (VIP)",
            gold_price: "12.99 € / 月",
            gold_trial_text: "7天免费，之后12.99 €/月",
            gold_features: ["包含所有Silver功能", "无限实时神谕聊天", "每月5个梦境视频", "专属金币折扣", "优先支持"],
            smart_title: "Smart（开发者）",
            smart_price: "49.99 € / 年",
            smart_features: ["自带密钥（BYOK）", "解锁所有高级功能", "自动供应商轮换", "固定年费（29.99€）"],
            smart_info_title: "什么是Smart开发者层级？",
            smart_info_text: "适合开发者和技术爱好者：在AI提供商（如Google AI Studio）注册账户，生成自己的API密钥并添加到应用中。这样你只需直接向提供商支付低廉的API费用 + €3的应用使用费。非常适合高级用户！",
            upgrade: "升级", current: "当前", unlock: "解锁", try_free: "免费试用7天",
            ad_loading: "广告加载中...", ad_reward: "金币已到账！",
            bronze_title: "免费", bronze_features: ["每天3次解读", "Groq AI", "6种传统", "含广告"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["无限解读", "Gemini AI", "全部9种传统", "无广告", "每月100金币", "金币9折"], silver2_price_monthly: "€4.99 / 月", silver2_price_yearly: "€49.99 / 年",
            gold2_title: "Premium", gold2_features: ["Claude 6视角", "每月500金币", "金币8折", "高清图片", "每月5个视频", "实时语音", "高级AI聊天"], gold2_price_monthly: "€14.99 / 月", gold2_price_yearly: "€149.99 / 年",
            
            pro_badge: "最受欢迎", vip_badge: "独家 👑",
        },
        earn: {
            title: "赚取金币",
            desc: "完成任务充值你的余额。",
            short_title: "短视频", short_desc: "10秒", short_reward: "1",
            long_title: "高级视频", long_desc: "2分钟", long_reward: "3",
            offer_title: "任务墙", offer_desc: "调查与任务", offer_reward: "5-10",
            offer_info: "完成调查、应用测试或注册等任务获取丰厚奖励。",
            survey_task: "品牌调查", app_task: "在游戏中达到5级",
            watch_btn: "观看", start_btn: "开始"
        },
        shop: {
            title: "金币商店",
            desc: "充值你的金币。",
            starter_label: "入门", starter_price: "1.99 €", starter_amount: "100金币",
            best_label: "畅销", best_price: "5.99 €", best_amount: "550金币", best_badge: "热门",
            value_label: "超值", value_price: "12.99 €", value_amount: "1500金币", value_badge: "超值",
            free_link: "想免费赚金币？点击这里。",
            buy_btn: "购买",
            wow_badge: "💎 不到1分钱/金币！",
            coins_label: "金币",
            per_coin: "每金币",
            pkg_starter: "试用", pkg_popular: "热门", pkg_value: "超值", pkg_premium: "更省", pkg_mega: "高级用户",
        },
        smart_guide: {
            step1_title: "创建账户", step1_desc: "在Google AI Studio创建免费账户。",
            step2_title: "生成密钥", step2_desc: "在那里复制你的个人API密钥。",
            step3_title: "粘贴到应用", step3_desc: "将密钥粘贴到这里以解锁高级功能。"
        }
    },
    [Language.HI]: {
        app_title: "ड्रीम कोड",
        app_subtitle: "पूरी मानवता का ज्ञान और एक सुपरकंप्यूटर – आपकी जेब में",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "बसरा, इराक (7वीं सदी)",
            [ReligiousSource.NABULSI]: "दमिश्क, सीरिया (17वीं सदी)",
            [ReligiousSource.AL_ISKHAFI]: "बगदाद (अब्बासी)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "अरबी परंपरा (अबजद)",
            [ReligiousSource.MEDIEVAL]: "यूरोप (मध्यकालीन)",
            [ReligiousSource.MODERN_THEOLOGY]: "पश्चिमी धर्मशास्त्र",
            [ReligiousSource.CHURCH_FATHERS]: "रोम और बीजान्टियम (पैट्रिस्टिक्स)",
            [ReligiousSource.ZEN]: "चीन और जापान",
            [ReligiousSource.TIBETAN]: "तिब्बत (हिमालय)",
            [ReligiousSource.THERAVADA]: "दक्षिण-पूर्व एशिया (पालि कैनन)",
            [ReligiousSource.FREUDIAN]: "वियना (मनोविश्लेषण)",
            [ReligiousSource.JUNGIAN]: "ज़्यूरिख (विश्लेषणात्मक मनो.)",
            [ReligiousSource.GESTALT]: "बर्लिन / न्यूयॉर्क",
            [ReligiousSource.WESTERN_ZODIAC]: "हेलेनिस्टिक परंपरा",
            [ReligiousSource.VEDIC_ASTROLOGY]: "भारत (ज्योतिष)",
            [ReligiousSource.CHINESE_ZODIAC]: "चीन (चंद्र कैलेंडर)",
            [ReligiousSource.PYTHAGOREAN]: "प्राचीन ग्रीस",
            [ReligiousSource.CHALDEAN]: "बेबीलोन (मेसोपोटामिया)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "यहूदी रहस्यवाद (स्पेन)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "भारत (वेद)",
            [ReligiousSource.IMAM_SADIQ]: "शिया परंपरा, फारस",
            [ReligiousSource.ISLAMSKI_SONNIK]: "रूसी-इस्लामी",
            [ReligiousSource.ZHOU_GONG]: "चीन, स्वप्न व्याख्या",
            [ReligiousSource.HATSUYUME]: "जापान, नव वर्ष का स्वप्न",
            [ReligiousSource.SWAPNA_SHASTRA]: "भारत, वैदिक/हिंदू",
            [ReligiousSource.EDGAR_CAYCE]: "अमेरिका, सोते हुए भविष्यवक्ता",
            [ReligiousSource.RUDOLF_STEINER]: "एंथ्रोपोसोफी, ऑस्ट्रिया",
            [ReligiousSource.TALMUD_BERAKHOT]: "बेबीलोनिया, 55a-57b",
            [ReligiousSource.ZOHAR]: "कब्बालवादी, 13वीं सदी",
            [ReligiousSource.VANGA]: "बुल्गारिया, 20वीं सदी",
            [ReligiousSource.MILLER_RU]: "रूसी स्वप्न व्याख्या",
            [ReligiousSource.FREUD_RU]: "रूसी फ्रायड रूपांतरण",
            [ReligiousSource.LOFF]: "रूसी स्वप्न पुस्तक",
            [ReligiousSource.NOSTRADAMUS_RU]: "रूसी रूपांतरण",
            [ReligiousSource.ARTEMIDOROS]: "ग्रीस, दूसरी सदी ईस्वी",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "मिस्र, लगभग 1275 ईसा पूर्व",
            [ReligiousSource.SOMNIALE_DANIELIS]: "बीजान्टिन-मध्यकालीन"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'इस्लामी', [ReligiousCategory.CHRISTIAN]: 'ईसाई', [ReligiousCategory.BUDDHIST]: 'बौद्ध', [ReligiousCategory.PSYCHOLOGICAL]: 'मनोवैज्ञानिक', [ReligiousCategory.ASTROLOGY]: 'ज्योतिष', [ReligiousCategory.NUMEROLOGY]: 'अंकशास्त्र', [ReligiousCategory.JEWISH]: 'यहूदी', [ReligiousCategory.SONNIKS]: 'स्वप्न पुस्तकें', [ReligiousCategory.ANCIENT]: 'प्राचीन',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'तिब्बती', [ReligiousSource.IBN_SIRIN]: 'इब्न सिरीन', [ReligiousSource.NABULSI]: 'अन-नाबुलसी', [ReligiousSource.AL_ISKHAFI]: 'अल-इसखाफी', [ReligiousSource.MEDIEVAL]: 'मध्यकालीन', [ReligiousSource.MODERN_THEOLOGY]: 'आधुनिक धर्मशास्त्र', [ReligiousSource.CHURCH_FATHERS]: 'चर्च फादर्स', [ReligiousSource.ZEN]: 'ज़ेन', [ReligiousSource.THERAVADA]: 'थेरवाद', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'पश्चिमी राशि', [ReligiousSource.VEDIC_ASTROLOGY]: 'वैदिक', [ReligiousSource.CHINESE_ZODIAC]: 'चीनी राशि', [ReligiousSource.PYTHAGOREAN]: 'पाइथागोरियन', [ReligiousSource.CHALDEAN]: 'कैल्डियन', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'कब्बाला', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'अबजद', [ReligiousSource.VEDIC_NUMEROLOGY]: 'वैदिक अंक', [ReligiousSource.IMAM_SADIQ]: 'इमाम सादिक़', [ReligiousSource.ISLAMSKI_SONNIK]: 'इस्लामी सोन्निक', [ReligiousSource.ZHOU_GONG]: 'झोउ गोंग', [ReligiousSource.HATSUYUME]: 'हत्सुयुमे', [ReligiousSource.SWAPNA_SHASTRA]: 'स्वप्न शास्त्र', [ReligiousSource.EDGAR_CAYCE]: 'एडगर केसी', [ReligiousSource.RUDOLF_STEINER]: 'रुडोल्फ़ स्टाइनर', [ReligiousSource.TALMUD_BERAKHOT]: 'तालमूद बराख़ोत', [ReligiousSource.ZOHAR]: 'ज़ोहार', [ReligiousSource.VANGA]: 'वांगा', [ReligiousSource.MILLER_RU]: 'मिलर', [ReligiousSource.FREUD_RU]: 'फ़्रायड (RU)', [ReligiousSource.LOFF]: 'लोफ़', [ReligiousSource.NOSTRADAMUS_RU]: 'नोस्त्रादामुस', [ReligiousSource.ARTEMIDOROS]: 'आर्टेमिडोरस', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'मिस्र का पपाइरस', [ReligiousSource.SOMNIALE_DANIELIS]: 'सोम्नियाले दानिएलिस'
        },
        ui: {
            placeholder: "अपने सपने का वर्णन करें...", interpret: "सपने की व्याख्या", choose_tradition: "परंपरा चुनें", refine_sources: "स्रोत चुनें", oracle_speaks: "ओरेकल बोलता है", close: "बंद करें", listening: "सुन रहा है...", voices: "आवाज़",
            settings: "सेटिंग्स", text_size: "आकार", dictation_error: "त्रुटि: माइक उपलब्ध नहीं।", dictation_perm: "अनुमति अस्वीकृत।",
            calendar_btn: "कैलेंडर और विश्लेषण", coming_soon: "और अधिक...", calendar_desc: "आपकी स्वप्न डायरी",
            profile_btn: "आपकी प्रोफ़ाइल", profile_desc: "आंकड़े और मैं",
            hub_btn: "ड्रीम हब", hub_desc: "सामुदायिक सपने",
            gen_image: "छवि बनाएं", saved_msg: "सपना कैलेंडर में सहेजा गया!",
            watch_ad: "सिक्के कमाएं", generate_video: "वीडियो बनाएं (गोल्ड)", create_dream_video: "स्वप्न वीडियो",
            video_btn_short: "📹 वीडियो बनाएं", video_duration_short: "30सेकंड, 180 सिक्के",
            slideshow_btn: "📽️ स्लाइडशो बनाएं", slideshow_duration: "30सेकंड, 180 सिक्के",
            premium_btn: "प्रीमियम / प्लान", premium_desc: "अपग्रेड और फीचर्स",
            customer_file_btn: "व्यक्तिगत संदर्भ फ़ाइल",
            theme: "दिखावट", mode: "मोड", dark: "डार्क", light: "लाइट",
            style: "डिज़ाइन शैली", style_def: "डिफ़ॉल्ट (रहस्यमय)", style_fem: "स्त्रीलिंग (गुलाबी)", style_masc: "पुल्लिंग (नीला)", style_nature: "प्रकृति (हरा)",
            voice_char: "आवाज़ चरित्र", fem_char: "महिला पात्र", male_char: "पुरुष पात्र", preview: "पूर्वावलोकन",
            info_title: "ज्ञान आधार", info_bio: "जीवनी", info_origin: "उत्पत्ति और पृष्ठभूमि",
            video_ready: "आपका स्वप्न वीडियो तैयार है!", video_gen: "वीडियो बना रहा है...", video_error: "बनाना विफल रहा।",
            map_btn: "किसने वही सपना देखा?",
            api_manager: "API कुंजी प्रबंधक (Smart टियर)", api_desc: "अपनी Gemini API कुंजियां जोड़ें। सीमा पहुंचने पर सिस्टम स्वतः बदलता है।", add_key: "कुंजी जोड़ें", no_keys: "कोई कुंजी नहीं मिली।",
            quality_normal: "सामान्य", quality_high: "उच्च गुणवत्ता",
            style_cartoon: "कार्टून", style_anime: "एनीमे", style_real: "रियल", style_fantasy: "फैंटेसी",
            choose_quality: "गुणवत्ता चुनें", choose_style: "शैली चुनें",
            choose_image_style: "छवि शैली चुनें",
            choose_style_desc: "अपनी स्वप्न छवि के लिए गुणवत्ता और शैली चुनें",
            continue_without_image: "छवि बनाए बिना जारी रखें",
            step_quality: "1. गुणवत्ता चुनें",
            step_style: "2. शैली चुनें",
            continue: "जारी रखें",
            social_proof_stats: "47,832 सपनों का विश्लेषण · 12,543 स्वप्न मिलान पाए गए",
            social_proof_testimonial1: "\"आखिरकार मेरे बार-बार आने वाले सपने समझ आए!\" - अनीता, 28",
            social_proof_testimonial2: "\"बहु-दृष्टिकोण व्याख्या अद्वितीय है।\" - राहुल, 34",
            social_proof_testimonial3: "\"ऐप के ज़रिए वही सपना देखने वाला मिला!\" - प्रिया, 31",
            processing_context: "विचार कर रहा है:",
            backup_title: "डेटा वॉल्ट (बैकअप)",
            backup_desc: "अपने डेटा को फ़ाइल के रूप में सुरक्षित करें या बैकअप पुनर्स्थापित करें।",
            export_btn: "बैकअप डाउनलोड करें",
            import_btn: "बैकअप पुनर्स्थापित करें",
            home_label: "होम",
            map_label: "मैप",
            live_chat_label: "लाइव चैट",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5 सिक्के बोनस: अपनी आवाज़ से वीडियो!",
            audio_coin_desc: "आपकी रिकॉर्डिंग सहेजी गई है। प्रोफ़ाइल में अपनी आवाज़ से स्वप्न वीडियो बनाएं और 5 सिक्के कमाएं!",
            upload_audio: "अपलोड",
            upload_confirm_title: "ऑडियो सफलतापूर्वक सहेजा गया!",
            upload_confirm_desc: "आपकी ऑडियो रिकॉर्डिंग सपने के साथ सहेजी गई है। प्रोफ़ाइल में 'ऑडियो' के अंतर्गत देखें!",
            got_it: "समझ गया!",
            backup_restored: "बैकअप सफलतापूर्वक पुनर्स्थापित!",
            backup_error: "बैकअप पुनर्स्थापित करने में त्रुटि। अमान्य फ़ाइल।",
            storage_init: "स्टोरेज प्रारंभ हो रहा है। कृपया प्रतीक्षा करें।",
            mic_denied_alert: "माइक्रोफोन एक्सेस अस्वीकृत",
            min_dreams_required: "विश्लेषण सुविधा का उपयोग करने के लिए आपको कम से कम 7 व्याख्यायित सपनों की आवश्यकता है।",
            base_version: "बेसिक संस्करण",
            until_date: "तक:",
            audio_recorded: "ऑडियो रिकॉर्ड किया गया",
            audio_saved_with_dream: "सपने के साथ सहेजा जाएगा",
            remove: "हटाएं",
            oracle_voice: "ओरेकल आवाज़",
            image_ready: "छवि तैयार!",
            style_desc_cartoon: "पिक्सर-शैली",
            style_desc_anime: "जिबली-शैली",
            style_desc_real: "फोटोरियलिस्टिक",
            style_desc_fantasy: "जादुई",
            cosmic_dna: "कॉस्मिक DNA",
            moon_sync: "मून सिंक",
            cosmic_dna_body: "आपका कॉस्मिक DNA आपके सपनों का अनूठा फिंगरप्रिंट है — जन्मतिथि, राशि और सपनों के पैटर्न पर आधारित।",
            cosmic_dna_coming: "जल्द आ रहा है",
            cosmic_dna_enter: "अपना कॉस्मिक DNA गणना करने के लिए प्रोफ़ाइल में जन्मतिथि दर्ज करें।",
            moon_phase_label: "चंद्र चरण",
            dream_meaning_today: "आज का सपना अर्थ",
            save_btn: "सहेजें",
            age_restricted_cat: "यह श्रेणी केवल 18 वर्ष और उससे अधिक आयु के लोगों के लिए उपलब्ध है।",
            ok: "ठीक है",
            video_studio: "वीडियो स्टूडियो",
            dream_network: "ड्रीम नेटवर्क",
            privacy_link: "गोपनीयता", terms_link: "शर्तें", imprint_link: "कानूनी", research_link: "अनुसंधान", studies_link: "अध्ययन", worldmap_link: "विश्व मानचित्र", showing_sources_only: "केवल {0} स्रोत दिखा रहे हैं", science_label: "ज्ञान",
        },
        processing: {
            title: "ओरेकल काम कर रहा है...",
            step_analyze: "स्वप्न व्याख्या का विश्लेषण",
            step_customer: "ग्राहक संदर्भ पर विचार",
            step_no_customer: "कोई ग्राहक संदर्भ उपलब्ध नहीं",
            step_context: "श्रेणियां और परंपराओं की गणना",
            step_no_context: "कोई विशिष्ट परंपरा चयनित नहीं",
            step_image: "दृष्टि उत्पन्न कर रहा है",
            step_save: "कैलेंडर और प्रोफ़ाइल में सहेजा गया"
        },
        sub: {
            title: "अपना टियर चुनें",
            billing_monthly: "मासिक", billing_yearly: "वार्षिक",
            yearly_discount: "1 महीना मुफ़्त!",
            smart_discount: "डेवलपर्स के लिए",
            free_title: "मुफ़्त",
            free_price: "0 €",
            free_features: ["बेसिक व्याख्या (विज्ञापन सहित)", "मुफ़्त सिक्कों के लिए ऑफ़रवॉल", "सिक्कों से प्रीमियम", "केवल लिंक शेयरिंग"],
            silver_title: "Pro",
            silver_price: "4.99 € / महीना",
            silver_features: ["विज्ञापन-मुक्त अनुभव", "असीमित PDF रूपांतरण और डाउनलोड", "असीमित व्याख्याएं", "25 HD छवियां/माह", "सप्ताह में 1 लाइव चैट", "ऑडियो I/O"],
            gold_title: "Gold (VIP)",
            gold_price: "12.99 € / महीना",
            gold_trial_text: "7 दिन मुफ़्त, फिर 12.99 €/माह",
            gold_features: ["सभी Silver सुविधाएं शामिल", "असीमित लाइव ओरेकल चैट", "5 स्वप्न वीडियो/माह", "विशेष सिक्का छूट", "प्राथमिकता सहायता"],
            smart_title: "Smart (डेवलपर)",
            smart_price: "49.99 € / वर्ष",
            smart_features: ["अपनी कुंजी लाएं (BYOK)", "सभी प्रीमियम सुविधाएं अनलॉक", "स्वतः प्रदाता रोटेशन", "निश्चित वार्षिक मूल्य (29.99€)"],
            smart_info_title: "Smart डेवलपर टियर क्या है?",
            smart_info_text: "डेवलपर्स और तकनीकी उत्साही लोगों के लिए: AI प्रदाताओं (जैसे Google AI Studio) पर खाता बनाएं, वहां अपनी API कुंजी बनाएं, और ऐप में जोड़ें। इस तरह, आप केवल प्रदाता को कम API लागत + ऐप उपयोग के लिए €3 का भुगतान करते हैं। पावर यूज़र्स के लिए बिल्कुल सही!",
            upgrade: "अपग्रेड", current: "वर्तमान", unlock: "अनलॉक", try_free: "7 दिन मुफ़्त आज़माएं",
            ad_loading: "विज्ञापन लोड हो रहा है...", ad_reward: "सिक्के मिले!",
            bronze_title: "मुफ़्त", bronze_features: ["3 व्याख्याएं/दिन", "Groq AI", "6 परंपराएं", "विज्ञापन"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["असीमित व्याख्याएं", "Gemini AI", "सभी 9 परंपराएं", "विज्ञापन-मुक्त", "100 सिक्के/माह", "10% सिक्का छूट"], silver2_price_monthly: "€4.99 / माह", silver2_price_yearly: "€49.99 / वर्ष",
            gold2_title: "Premium", gold2_features: ["Claude 6-दृष्टिकोण", "500 सिक्के/माह", "20% सिक्का छूट", "HD छवियां", "5 वीडियो/माह", "लाइव वॉइस", "प्रीमियम AI चैट"], gold2_price_monthly: "€14.99 / माह", gold2_price_yearly: "€149.99 / वर्ष",
            
            pro_badge: "सबसे लोकप्रिय", vip_badge: "विशेष 👑",
        },
        earn: {
            title: "सिक्के कमाएं",
            desc: "अपना बैलेंस बढ़ाने के लिए कार्य पूरे करें।",
            short_title: "शॉर्ट क्लिप", short_desc: "10 सेकंड", short_reward: "1",
            long_title: "प्रीमियम वीडियो", long_desc: "2 मिनट", long_reward: "3",
            offer_title: "ऑफ़रवॉल", offer_desc: "सर्वेक्षण और कार्य", offer_reward: "5-10",
            offer_info: "सर्वेक्षण, ऐप परीक्षण या साइन-अप जैसे कार्य पूरे करके उच्च पुरस्कार पाएं।",
            survey_task: "ब्रांड सर्वेक्षण", app_task: "गेम में लेवल 5 तक पहुंचें",
            watch_btn: "देखें", start_btn: "शुरू करें"
        },
        shop: {
            title: "सिक्का दुकान",
            desc: "अपनी आपूर्ति बढ़ाएं।",
            starter_label: "स्टार्टर", starter_price: "1.99 €", starter_amount: "100 सिक्के",
            best_label: "बेस्टसेलर", best_price: "5.99 €", best_amount: "550 सिक्के", best_badge: "लोकप्रिय",
            value_label: "सर्वोत्तम मूल्य", value_price: "12.99 €", value_amount: "1500 सिक्के", value_badge: "सर्वोत्तम मूल्य",
            free_link: "मुफ़्त सिक्के कमाना चाहते हैं? यहां क्लिक करें।",
            buy_btn: "खरीदें",
            wow_badge: "💎 1 पैसे/सिक्के से कम!",
            coins_label: "सिक्के",
            per_coin: "प्रति सिक्का",
            pkg_starter: "आज़माएं", pkg_popular: "लोकप्रिय", pkg_value: "ज़्यादा मूल्य", pkg_premium: "ज़्यादा बचत", pkg_mega: "पावर यूज़र",
        },
        smart_guide: {
            step1_title: "खाता बनाएं", step1_desc: "Google AI Studio पर मुफ़्त खाता बनाएं।",
            step2_title: "कुंजी बनाएं", step2_desc: "वहां अपनी व्यक्तिगत API कुंजी कॉपी करें।",
            step3_title: "ऐप में पेस्ट करें", step3_desc: "प्रीमियम अनलॉक करने के लिए कुंजी यहां पेस्ट करें।"
        }
    },
    [Language.JA]: {
        app_title: "ドリームコード",
        app_subtitle: "人類の全知識とスーパーコンピュータ — あなたのポケットに",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "バスラ、イラク（7世紀）",
            [ReligiousSource.NABULSI]: "ダマスカス、シリア（17世紀）",
            [ReligiousSource.AL_ISKHAFI]: "バグダッド（アッバース朝）",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "アラブの伝統（アブジャド）",
            [ReligiousSource.MEDIEVAL]: "ヨーロッパ（中世）",
            [ReligiousSource.MODERN_THEOLOGY]: "西洋神学",
            [ReligiousSource.CHURCH_FATHERS]: "ローマとビザンツ（教父学）",
            [ReligiousSource.ZEN]: "中国と日本",
            [ReligiousSource.TIBETAN]: "チベット（ヒマラヤ）",
            [ReligiousSource.THERAVADA]: "東南アジア（パーリ聖典）",
            [ReligiousSource.FREUDIAN]: "ウィーン（精神分析）",
            [ReligiousSource.JUNGIAN]: "チューリッヒ（分析心理学）",
            [ReligiousSource.GESTALT]: "ベルリン / ニューヨーク",
            [ReligiousSource.WESTERN_ZODIAC]: "ヘレニズムの伝統",
            [ReligiousSource.VEDIC_ASTROLOGY]: "インド（ジョーティシュ）",
            [ReligiousSource.CHINESE_ZODIAC]: "中国（旧暦）",
            [ReligiousSource.PYTHAGOREAN]: "古代ギリシャ",
            [ReligiousSource.CHALDEAN]: "バビロン（メソポタミア）",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "ユダヤ神秘主義（スペイン）",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "インド（ヴェーダ）",
            [ReligiousSource.IMAM_SADIQ]: "シーア派の伝統、ペルシャ",
            [ReligiousSource.ISLAMSKI_SONNIK]: "ロシア-イスラム",
            [ReligiousSource.ZHOU_GONG]: "中国、夢判断",
            [ReligiousSource.HATSUYUME]: "日本、初夢",
            [ReligiousSource.SWAPNA_SHASTRA]: "インド、ヴェーダ/ヒンドゥー",
            [ReligiousSource.EDGAR_CAYCE]: "アメリカ、眠れる預言者",
            [ReligiousSource.RUDOLF_STEINER]: "人智学、オーストリア",
            [ReligiousSource.TALMUD_BERAKHOT]: "バビロニア、55a-57b",
            [ReligiousSource.ZOHAR]: "カバラ、13世紀",
            [ReligiousSource.VANGA]: "ブルガリア、20世紀",
            [ReligiousSource.MILLER_RU]: "ロシア夢判断",
            [ReligiousSource.FREUD_RU]: "ロシア版フロイト",
            [ReligiousSource.LOFF]: "ロシアの夢の本",
            [ReligiousSource.NOSTRADAMUS_RU]: "ロシア版",
            [ReligiousSource.ARTEMIDOROS]: "ギリシャ、紀元2世紀",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "エジプト、紀元前約1275年",
            [ReligiousSource.SOMNIALE_DANIELIS]: "ビザンツ-中世"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'イスラム', [ReligiousCategory.CHRISTIAN]: 'キリスト教', [ReligiousCategory.BUDDHIST]: '仏教', [ReligiousCategory.PSYCHOLOGICAL]: '心理学', [ReligiousCategory.ASTROLOGY]: '占星術', [ReligiousCategory.NUMEROLOGY]: '数秘術', [ReligiousCategory.JEWISH]: 'ユダヤ教', [ReligiousCategory.SONNIKS]: '夢の本', [ReligiousCategory.ANCIENT]: '古代',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'チベット', [ReligiousSource.IBN_SIRIN]: 'イブン・シーリーン', [ReligiousSource.NABULSI]: 'ナーブルスィー', [ReligiousSource.AL_ISKHAFI]: 'イスハーフィー', [ReligiousSource.MEDIEVAL]: '中世', [ReligiousSource.MODERN_THEOLOGY]: '現代神学', [ReligiousSource.CHURCH_FATHERS]: '教父', [ReligiousSource.ZEN]: '禅', [ReligiousSource.THERAVADA]: '上座部', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: '西洋星座', [ReligiousSource.VEDIC_ASTROLOGY]: 'ヴェーダ', [ReligiousSource.CHINESE_ZODIAC]: '中国十二支', [ReligiousSource.PYTHAGOREAN]: 'ピタゴラス', [ReligiousSource.CHALDEAN]: 'カルデア', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'カバラ', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'アブジャド', [ReligiousSource.VEDIC_NUMEROLOGY]: 'ヴェーダ数秘', [ReligiousSource.IMAM_SADIQ]: 'イマーム・サーディク', [ReligiousSource.ISLAMSKI_SONNIK]: 'イスラム夢の本', [ReligiousSource.ZHOU_GONG]: '周公', [ReligiousSource.HATSUYUME]: '初夢', [ReligiousSource.SWAPNA_SHASTRA]: 'スワプナ・シャストラ', [ReligiousSource.EDGAR_CAYCE]: 'エドガー・ケイシー', [ReligiousSource.RUDOLF_STEINER]: 'ルドルフ・シュタイナー', [ReligiousSource.TALMUD_BERAKHOT]: 'タルムード・ベラホート', [ReligiousSource.ZOHAR]: 'ゾハール', [ReligiousSource.VANGA]: 'ヴァンガ', [ReligiousSource.MILLER_RU]: 'ミラー', [ReligiousSource.FREUD_RU]: 'フロイト (RU)', [ReligiousSource.LOFF]: 'ロフ', [ReligiousSource.NOSTRADAMUS_RU]: 'ノストラダムス', [ReligiousSource.ARTEMIDOROS]: 'アルテミドロス', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'エジプトパピルス', [ReligiousSource.SOMNIALE_DANIELIS]: 'ソムニアレ・ダニエリス'
        },
        ui: {
            placeholder: "夢を描写してください...", interpret: "夢を解釈", choose_tradition: "伝統を選択", refine_sources: "ソースを選択", oracle_speaks: "オラクルが語る", close: "閉じる", listening: "聞いています...", voices: "声",
            settings: "設定", text_size: "サイズ", dictation_error: "エラー：マイクが利用できません。", dictation_perm: "許可が拒否されました。",
            calendar_btn: "カレンダーと分析", coming_soon: "もっと見る...", calendar_desc: "あなたの夢日記",
            profile_btn: "プロフィール", profile_desc: "統計と自分",
            hub_btn: "ドリームハブ", hub_desc: "コミュニティの夢",
            gen_image: "画像を生成", saved_msg: "夢がカレンダーに保存されました！",
            watch_ad: "コインを獲得", generate_video: "動画を生成（ゴールド）", create_dream_video: "夢動画",
            video_btn_short: "📹 動画を生成", video_duration_short: "30秒、180コイン",
            slideshow_btn: "📽️ スライドショー作成", slideshow_duration: "30秒、180コイン",
            premium_btn: "プレミアム / プラン", premium_desc: "アップグレードと機能",
            customer_file_btn: "パーソナルコンテキストファイル",
            theme: "外観", mode: "モード", dark: "ダーク", light: "ライト",
            style: "デザインスタイル", style_def: "デフォルト（ミスティック）", style_fem: "フェミニン（ローズ）", style_masc: "マスキュリン（ブルー）", style_nature: "ネイチャー（グリーン）",
            voice_char: "ボイスキャラクター", fem_char: "女性キャラクター", male_char: "男性キャラクター", preview: "プレビュー",
            info_title: "ナレッジベース", info_bio: "伝記", info_origin: "起源と背景",
            video_ready: "夢の動画が完成しました！", video_gen: "動画を生成中...", video_error: "生成に失敗しました。",
            map_btn: "同じ夢を見た人は？",
            api_manager: "APIキー管理（Smartティア）", api_desc: "Gemini APIキーを追加。制限に達するとシステムが自動切替。", add_key: "キーを追加", no_keys: "キーが見つかりません。",
            quality_normal: "通常", quality_high: "高画質",
            style_cartoon: "カートゥーン", style_anime: "アニメ", style_real: "リアル", style_fantasy: "ファンタジー",
            choose_quality: "画質を選択", choose_style: "スタイルを選択",
            choose_image_style: "画像スタイルを選択",
            choose_style_desc: "夢の画像の画質とスタイルを選択してください",
            continue_without_image: "画像生成なしで続行",
            step_quality: "1. 画質を選択",
            step_style: "2. スタイルを選択",
            continue: "続行",
            social_proof_stats: "47,832件の夢を分析 · 12,543件の夢の一致を発見",
            social_proof_testimonial1: "\"繰り返し見る夢がやっと理解できた！\" - あかり、28歳",
            social_proof_testimonial2: "\"多角的な解釈がユニーク。\" - 健太、34歳",
            social_proof_testimonial3: "\"アプリで同じ夢を見た人を見つけた！\" - さくら、31歳",
            processing_context: "考慮中：",
            backup_title: "データ保管庫（バックアップ）",
            backup_desc: "データをファイルとして保護するか、バックアップを復元します。",
            export_btn: "バックアップをダウンロード",
            import_btn: "バックアップを復元",
            home_label: "ホーム",
            map_label: "マップ",
            live_chat_label: "ライブチャット",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5コインボーナス：あなたの声で動画を！",
            audio_coin_desc: "録音が保存されました。プロフィールで自分の声の夢動画を作成して5コイン獲得！",
            upload_audio: "アップロード",
            upload_confirm_title: "音声が正常に保存されました！",
            upload_confirm_desc: "音声録音が夢と一緒に保存されました。プロフィールの「オーディオ」で確認できます！",
            got_it: "了解！",
            backup_restored: "バックアップが正常に復元されました！",
            backup_error: "バックアップの復元エラー。無効なファイルです。",
            storage_init: "ストレージを初期化中。お待ちください。",
            mic_denied_alert: "マイクへのアクセスが拒否されました",
            min_dreams_required: "分析機能を使用するには、少なくとも7つの解釈済みの夢が必要です。",
            base_version: "ベーシック版",
            until_date: "まで：",
            audio_recorded: "音声録音済み",
            audio_saved_with_dream: "夢と一緒に保存されます",
            remove: "削除",
            oracle_voice: "オラクルボイス",
            image_ready: "画像完成！",
            style_desc_cartoon: "ピクサー風",
            style_desc_anime: "ジブリ風",
            style_desc_real: "フォトリアル",
            style_desc_fantasy: "マジカル",
            cosmic_dna: "コズミックDNA",
            moon_sync: "ムーンシンク",
            cosmic_dna_body: "あなたのコスミックDNAはあなた独自の夢の指紋です — 生年月日、星座、夢のパターンに基づいています。",
            cosmic_dna_coming: "近日公開",
            cosmic_dna_enter: "コスミックDNAを計算するには、プロフィールに生年月日を入力してください。",
            moon_phase_label: "月の満ち欠け",
            dream_meaning_today: "今日の夢の意味",
            save_btn: "保存",
            age_restricted_cat: "このカテゴリは18歳以上の方のみご利用いただけます。",
            ok: "OK",
            video_studio: "ビデオスタジオ",
            dream_network: "ドリームネットワーク",
            privacy_link: "プライバシー", terms_link: "利用規約", imprint_link: "特定商取引法", research_link: "研究", studies_link: "研究", worldmap_link: "世界地図", showing_sources_only: "{0}のソースのみ表示", science_label: "知識",
        },
        processing: {
            title: "オラクルが稼働中...",
            step_analyze: "夢の解釈を分析中",
            step_customer: "顧客コンテキストを考慮中",
            step_no_customer: "顧客コンテキストなし",
            step_context: "カテゴリと伝統を計算中",
            step_no_context: "特定の伝統は選択されていません",
            step_image: "ビジョンを生成中",
            step_save: "カレンダーとプロフィールに保存済み"
        },
        sub: {
            title: "ティアを選択",
            billing_monthly: "月額", billing_yearly: "年額",
            yearly_discount: "1ヶ月無料！",
            smart_discount: "開発者向け",
            free_title: "無料",
            free_price: "0 €",
            free_features: ["基本解釈（広告付き）", "オファーウォールで無料コイン", "コインでプレミアム", "リンク共有のみ"],
            silver_title: "Pro",
            silver_price: "4.99 € / 月",
            silver_features: ["広告なし体験", "無制限PDF変換・ダウンロード", "無制限解釈", "月25枚のHD画像", "週1回ライブチャット", "オーディオI/O"],
            gold_title: "Gold (VIP)",
            gold_price: "12.99 € / 月",
            gold_trial_text: "7日間無料、その後12.99 €/月",
            gold_features: ["Silver全機能含む", "無制限ライブオラクルチャット", "月5本の夢動画", "限定コイン割引", "優先サポート"],
            smart_title: "Smart（開発者）",
            smart_price: "49.99 € / 年",
            smart_features: ["自分のキーを使用（BYOK）", "全プレミアム機能解放", "自動プロバイダー切替", "固定年額（29.99€）"],
            smart_info_title: "Smart開発者ティアとは？",
            smart_info_text: "開発者・テック愛好家向け：AIプロバイダー（例：Google AI Studio）でアカウントを作成し、独自のAPIキーを生成してアプリに追加。これにより、低いAPI費用をプロバイダーに直接支払い + アプリ使用料€3のみ。パワーユーザーに最適！",
            upgrade: "アップグレード", current: "現在", unlock: "アンロック", try_free: "7日間無料で試す",
            ad_loading: "広告読み込み中...", ad_reward: "コイン獲得！",
            bronze_title: "無料", bronze_features: ["1日3回の解釈", "Groq AI", "6つの伝統", "広告あり"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["無制限解釈", "Gemini AI", "全9つの伝統", "広告なし", "月100コイン", "コイン10%割引"], silver2_price_monthly: "€4.99 / 月", silver2_price_yearly: "€49.99 / 年",
            gold2_title: "Premium", gold2_features: ["Claude 6視点", "月500コイン", "コイン20%割引", "HD画像", "月5本の動画", "ライブボイス", "プレミアムAIチャット"], gold2_price_monthly: "€14.99 / 月", gold2_price_yearly: "€149.99 / 年",
            
            pro_badge: "一番人気", vip_badge: "限定 👑",
        },
        earn: {
            title: "コインを獲得",
            desc: "タスクを完了して残高を増やしましょう。",
            short_title: "ショートクリップ", short_desc: "10秒", short_reward: "1",
            long_title: "プレミアム動画", long_desc: "2分", long_reward: "3",
            offer_title: "オファーウォール", offer_desc: "アンケートとタスク", offer_reward: "5-10",
            offer_info: "アンケート、アプリテスト、サインアップなどのタスクを完了して高報酬を獲得。",
            survey_task: "ブランドアンケート", app_task: "ゲームでレベル5に到達",
            watch_btn: "視聴", start_btn: "開始"
        },
        shop: {
            title: "コインショップ",
            desc: "コインを補充しましょう。",
            starter_label: "スターター", starter_price: "1.99 €", starter_amount: "100コイン",
            best_label: "ベストセラー", best_price: "5.99 €", best_amount: "550コイン", best_badge: "人気",
            value_label: "ベストバリュー", value_price: "12.99 €", value_amount: "1500コイン", value_badge: "ベストバリュー",
            free_link: "無料でコインを獲得したいですか？ここをクリック。",
            buy_btn: "購入",
            wow_badge: "💎 1コインあたり1セント未満！",
            coins_label: "コイン",
            per_coin: "1コインあたり",
            pkg_starter: "お試し", pkg_popular: "人気", pkg_value: "お得", pkg_premium: "もっと節約", pkg_mega: "パワーユーザー",
        },
        smart_guide: {
            step1_title: "アカウント作成", step1_desc: "Google AI Studioで無料アカウントを作成。",
            step2_title: "キーを生成", step2_desc: "そこで個人のAPIキーをコピー。",
            step3_title: "アプリに貼り付け", step3_desc: "ここにキーを貼り付けてプレミアムを解放。"
        }
    },
    [Language.KO]: {
        app_title: "드림 코드",
        app_subtitle: "인류의 모든 지식과 슈퍼컴퓨터 — 당신의 주머니 속에",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "바스라, 이라크 (7세기)",
            [ReligiousSource.NABULSI]: "다마스쿠스, 시리아 (17세기)",
            [ReligiousSource.AL_ISKHAFI]: "바그다드 (압바스 왕조)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "아랍 전통 (아브자드)",
            [ReligiousSource.MEDIEVAL]: "유럽 (중세)",
            [ReligiousSource.MODERN_THEOLOGY]: "서양 신학",
            [ReligiousSource.CHURCH_FATHERS]: "로마와 비잔틴 (교부학)",
            [ReligiousSource.ZEN]: "중국과 일본",
            [ReligiousSource.TIBETAN]: "티베트 (히말라야)",
            [ReligiousSource.THERAVADA]: "동남아시아 (빨리 경전)",
            [ReligiousSource.FREUDIAN]: "빈 (정신분석)",
            [ReligiousSource.JUNGIAN]: "취리히 (분석 심리학)",
            [ReligiousSource.GESTALT]: "베를린 / 뉴욕",
            [ReligiousSource.WESTERN_ZODIAC]: "헬레니즘 전통",
            [ReligiousSource.VEDIC_ASTROLOGY]: "인도 (조티시)",
            [ReligiousSource.CHINESE_ZODIAC]: "중국 (음력)",
            [ReligiousSource.PYTHAGOREAN]: "고대 그리스",
            [ReligiousSource.CHALDEAN]: "바빌론 (메소포타미아)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "유대 신비주의 (스페인)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "인도 (베다)",
            [ReligiousSource.IMAM_SADIQ]: "시아파 전통, 페르시아",
            [ReligiousSource.ISLAMSKI_SONNIK]: "러시아-이슬람",
            [ReligiousSource.ZHOU_GONG]: "중국, 해몽",
            [ReligiousSource.HATSUYUME]: "일본, 새해 꿈",
            [ReligiousSource.SWAPNA_SHASTRA]: "인도, 베다/힌두",
            [ReligiousSource.EDGAR_CAYCE]: "미국, 잠자는 예언자",
            [ReligiousSource.RUDOLF_STEINER]: "인지학, 오스트리아",
            [ReligiousSource.TALMUD_BERAKHOT]: "바빌로니아, 55a-57b",
            [ReligiousSource.ZOHAR]: "카발라, 13세기",
            [ReligiousSource.VANGA]: "불가리아, 20세기",
            [ReligiousSource.MILLER_RU]: "러시아 해몽",
            [ReligiousSource.FREUD_RU]: "러시아 프로이트 각색",
            [ReligiousSource.LOFF]: "러시아 꿈의 책",
            [ReligiousSource.NOSTRADAMUS_RU]: "러시아 각색",
            [ReligiousSource.ARTEMIDOROS]: "그리스, 2세기 AD",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "이집트, 약 기원전 1275년",
            [ReligiousSource.SOMNIALE_DANIELIS]: "비잔틴-중세"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: '이슬람', [ReligiousCategory.CHRISTIAN]: '기독교', [ReligiousCategory.BUDDHIST]: '불교', [ReligiousCategory.PSYCHOLOGICAL]: '심리학', [ReligiousCategory.ASTROLOGY]: '점성술', [ReligiousCategory.NUMEROLOGY]: '수비학', [ReligiousCategory.JEWISH]: '유대교', [ReligiousCategory.SONNIKS]: '꿈의 책', [ReligiousCategory.ANCIENT]: '고대',
        },
        sources: {
            [ReligiousSource.TIBETAN]: '티베트', [ReligiousSource.IBN_SIRIN]: '이븐 시린', [ReligiousSource.NABULSI]: '나불시', [ReligiousSource.AL_ISKHAFI]: '이스하피', [ReligiousSource.MEDIEVAL]: '중세', [ReligiousSource.MODERN_THEOLOGY]: '현대 신학', [ReligiousSource.CHURCH_FATHERS]: '교부', [ReligiousSource.ZEN]: '선', [ReligiousSource.THERAVADA]: '상좌부', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: '서양 별자리', [ReligiousSource.VEDIC_ASTROLOGY]: '베다', [ReligiousSource.CHINESE_ZODIAC]: '중국 띠', [ReligiousSource.PYTHAGOREAN]: '피타고라스', [ReligiousSource.CHALDEAN]: '칼데아', [ReligiousSource.KABBALAH_NUMEROLOGY]: '카발라', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: '베다 수비', [ReligiousSource.IMAM_SADIQ]: '이맘 사디크', [ReligiousSource.ISLAMSKI_SONNIK]: '이슬람 꿈의 책', [ReligiousSource.ZHOU_GONG]: '주공', [ReligiousSource.HATSUYUME]: '하츠유메', [ReligiousSource.SWAPNA_SHASTRA]: '스와프나 샤스트라', [ReligiousSource.EDGAR_CAYCE]: '에드거 케이시', [ReligiousSource.RUDOLF_STEINER]: '루돌프 슈타이너', [ReligiousSource.TALMUD_BERAKHOT]: '탈무드 베라호트', [ReligiousSource.ZOHAR]: '조하르', [ReligiousSource.VANGA]: '반가', [ReligiousSource.MILLER_RU]: '밀러', [ReligiousSource.FREUD_RU]: '프로이트 (RU)', [ReligiousSource.LOFF]: '로프', [ReligiousSource.NOSTRADAMUS_RU]: '노스트라다무스', [ReligiousSource.ARTEMIDOROS]: '아르테미도로스', [ReligiousSource.EGYPTIAN_PAPYRUS]: '이집트 파피루스', [ReligiousSource.SOMNIALE_DANIELIS]: '솜니알레 다니엘리스'
        },
        ui: {
            placeholder: "꿈을 설명해 주세요...", interpret: "꿈 해석", choose_tradition: "전통 선택", refine_sources: "출처 선택", oracle_speaks: "오라클이 말합니다", close: "닫기", listening: "듣는 중...", voices: "음성",
            settings: "설정", text_size: "크기", dictation_error: "오류: 마이크를 사용할 수 없습니다.", dictation_perm: "권한이 거부되었습니다.",
            calendar_btn: "캘린더 및 분석", coming_soon: "더 보기...", calendar_desc: "당신의 꿈 일기",
            profile_btn: "프로필", profile_desc: "통계 및 나",
            hub_btn: "드림 허브", hub_desc: "커뮤니티 꿈",
            gen_image: "이미지 생성", saved_msg: "꿈이 캘린더에 저장되었습니다!",
            watch_ad: "코인 획득", generate_video: "동영상 생성 (골드)", create_dream_video: "꿈 동영상",
            video_btn_short: "📹 동영상 생성", video_duration_short: "30초, 180 코인",
            slideshow_btn: "📽️ 슬라이드쇼 만들기", slideshow_duration: "30초, 180 코인",
            premium_btn: "프리미엄 / 플랜", premium_desc: "업그레이드 및 기능",
            customer_file_btn: "개인 컨텍스트 파일",
            theme: "외관", mode: "모드", dark: "다크", light: "라이트",
            style: "디자인 스타일", style_def: "기본 (미스틱)", style_fem: "여성 (로즈)", style_masc: "남성 (블루)", style_nature: "자연 (그린)",
            voice_char: "음성 캐릭터", fem_char: "여성 캐릭터", male_char: "남성 캐릭터", preview: "미리보기",
            info_title: "지식 베이스", info_bio: "전기", info_origin: "기원 및 배경",
            video_ready: "꿈 동영상이 준비되었습니다!", video_gen: "동영상 생성 중...", video_error: "생성에 실패했습니다.",
            map_btn: "누가 같은 꿈을 꿨을까?",
            api_manager: "API 키 관리자 (Smart 티어)", api_desc: "Gemini API 키를 추가하세요. 한도에 도달하면 시스템이 자동 전환합니다.", add_key: "키 추가", no_keys: "키를 찾을 수 없습니다.",
            quality_normal: "일반", quality_high: "고화질",
            style_cartoon: "카툰", style_anime: "애니메", style_real: "리얼", style_fantasy: "판타지",
            choose_quality: "화질 선택", choose_style: "스타일 선택",
            choose_image_style: "이미지 스타일 선택",
            choose_style_desc: "꿈 이미지의 화질과 스타일을 선택하세요",
            continue_without_image: "이미지 생성 없이 계속",
            step_quality: "1. 화질 선택",
            step_style: "2. 스타일 선택",
            continue: "계속",
            social_proof_stats: "47,832개의 꿈 분석 · 12,543개의 꿈 매칭 발견",
            social_proof_testimonial1: "\"반복되는 꿈을 드디어 이해했어요!\" - 지은, 28세",
            social_proof_testimonial2: "\"다양한 관점의 해석이 독특합니다.\" - 민수, 34세",
            social_proof_testimonial3: "\"앱으로 같은 꿈을 꾼 사람을 찾았어요!\" - 서연, 31세",
            processing_context: "고려 중:",
            backup_title: "데이터 보관소 (백업)",
            backup_desc: "데이터를 파일로 안전하게 보관하거나 백업을 복원하세요.",
            export_btn: "백업 다운로드",
            import_btn: "백업 복원",
            home_label: "홈",
            map_label: "지도",
            live_chat_label: "라이브 채팅",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5 코인 보너스: 당신의 목소리로 동영상!",
            audio_coin_desc: "녹음이 저장되었습니다. 프로필에서 자신의 목소리로 꿈 동영상을 만들고 5코인을 획득하세요!",
            upload_audio: "업로드",
            upload_confirm_title: "오디오가 성공적으로 저장되었습니다!",
            upload_confirm_desc: "오디오 녹음이 꿈과 함께 저장되었습니다. 프로필의 '오디오'에서 확인하세요!",
            got_it: "알겠습니다!",
            backup_restored: "백업이 성공적으로 복원되었습니다!",
            backup_error: "백업 복원 오류. 잘못된 파일입니다.",
            storage_init: "스토리지를 초기화 중입니다. 잠시 기다려 주세요.",
            mic_denied_alert: "마이크 액세스가 거부되었습니다",
            min_dreams_required: "분석 기능을 사용하려면 최소 7개의 해석된 꿈이 필요합니다.",
            base_version: "기본 버전",
            until_date: "까지:",
            audio_recorded: "오디오 녹음됨",
            audio_saved_with_dream: "꿈과 함께 저장됩니다",
            remove: "삭제",
            oracle_voice: "오라클 음성",
            image_ready: "이미지 완성!",
            style_desc_cartoon: "픽사 스타일",
            style_desc_anime: "지브리 스타일",
            style_desc_real: "포토리얼리스틱",
            style_desc_fantasy: "마법",
            cosmic_dna: "코스믹 DNA",
            moon_sync: "문 싱크",
            cosmic_dna_body: "당신의 코스믹 DNA는 생년월일, 별자리, 꿈의 패턴을 바탕으로 한 고유한 꿈 지문입니다.",
            cosmic_dna_coming: "곧 출시",
            cosmic_dna_enter: "코스믹 DNA를 계산하려면 프로필에 생년월일을 입력하세요.",
            moon_phase_label: "달의 위상",
            dream_meaning_today: "오늘의 꿈 의미",
            save_btn: "저장",
            age_restricted_cat: "이 카테고리는 18세 이상만 이용할 수 있습니다.",
            ok: "확인",
            video_studio: "비디오 스튜디오",
            dream_network: "드림 네트워크",
            privacy_link: "개인정보", terms_link: "이용약관", imprint_link: "법적 고지", research_link: "연구", studies_link: "연구", worldmap_link: "세계 지도", showing_sources_only: "{0} 소스만 표시", science_label: "지식",
        },
        processing: {
            title: "오라클이 작동 중...",
            step_analyze: "꿈 해석 분석 중",
            step_customer: "고객 컨텍스트 고려 중",
            step_no_customer: "고객 컨텍스트 없음",
            step_context: "카테고리 및 전통 계산 중",
            step_no_context: "특정 전통이 선택되지 않음",
            step_image: "비전 생성 중",
            step_save: "캘린더와 프로필에 저장됨"
        },
        sub: {
            title: "티어 선택",
            billing_monthly: "월간", billing_yearly: "연간",
            yearly_discount: "1개월 무료!",
            smart_discount: "개발자용",
            free_title: "무료",
            free_price: "0 €",
            free_features: ["기본 해석 (광고 포함)", "오퍼월로 무료 코인", "코인으로 프리미엄", "링크 공유만"],
            silver_title: "Pro",
            silver_price: "4.99 € / 월",
            silver_features: ["광고 없는 경험", "무제한 PDF 변환 및 다운로드", "무제한 해석", "월 25장 HD 이미지", "주 1회 라이브 채팅", "오디오 I/O"],
            gold_title: "Gold (VIP)",
            gold_price: "12.99 € / 월",
            gold_trial_text: "7일 무료, 이후 12.99 €/월",
            gold_features: ["Silver 모든 기능 포함", "무제한 라이브 오라클 채팅", "월 5개 꿈 동영상", "독점 코인 할인", "우선 지원"],
            smart_title: "Smart (개발자)",
            smart_price: "49.99 € / 년",
            smart_features: ["자체 키 사용 (BYOK)", "모든 프리미엄 기능 해제", "자동 공급자 전환", "고정 연간 가격 (29.99€)"],
            smart_info_title: "Smart 개발자 티어란?",
            smart_info_text: "개발자 및 기술 애호가용: AI 공급자(예: Google AI Studio)에서 계정을 만들고 자체 API 키를 생성하여 앱에 추가합니다. 이렇게 하면 낮은 API 비용만 공급자에게 직접 지불 + 앱 사용료 €3. 파워 유저에게 완벽합니다!",
            upgrade: "업그레이드", current: "현재", unlock: "잠금 해제", try_free: "7일 무료 체험",
            ad_loading: "광고 로딩 중...", ad_reward: "코인 획득!",
            bronze_title: "무료", bronze_features: ["하루 3회 해석", "Groq AI", "6가지 전통", "광고"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["무제한 해석", "Gemini AI", "전체 9가지 전통", "광고 없음", "월 100코인", "코인 10% 할인"], silver2_price_monthly: "€4.99 / 월", silver2_price_yearly: "€49.99 / 년",
            gold2_title: "Premium", gold2_features: ["Claude 6관점", "월 500코인", "코인 20% 할인", "HD 이미지", "월 5개 동영상", "라이브 음성", "프리미엄 AI 채팅"], gold2_price_monthly: "€14.99 / 월", gold2_price_yearly: "€149.99 / 년",
            
            pro_badge: "가장 인기", vip_badge: "독점 👑",
        },
        earn: {
            title: "코인 획득",
            desc: "작업을 완료하여 잔액을 충전하세요.",
            short_title: "짧은 클립", short_desc: "10초", short_reward: "1",
            long_title: "프리미엄 동영상", long_desc: "2분", long_reward: "3",
            offer_title: "오퍼월", offer_desc: "설문조사 및 작업", offer_reward: "5-10",
            offer_info: "설문조사, 앱 테스트 또는 가입과 같은 작업을 완료하여 높은 보상을 받으세요.",
            survey_task: "브랜드 설문조사", app_task: "게임에서 레벨 5 달성",
            watch_btn: "시청", start_btn: "시작"
        },
        shop: {
            title: "코인 상점",
            desc: "코인을 충전하세요.",
            starter_label: "스타터", starter_price: "1.99 €", starter_amount: "100 코인",
            best_label: "베스트셀러", best_price: "5.99 €", best_amount: "550 코인", best_badge: "인기",
            value_label: "최고 가치", value_price: "12.99 €", value_amount: "1500 코인", value_badge: "최고 가치",
            free_link: "무료 코인을 얻고 싶으세요? 여기를 클릭하세요.",
            buy_btn: "구매",
            wow_badge: "💎 코인당 1센트 미만!",
            coins_label: "코인",
            per_coin: "코인당",
            pkg_starter: "체험", pkg_popular: "인기", pkg_value: "더 큰 가치", pkg_premium: "더 절약", pkg_mega: "파워 유저",
        },
        smart_guide: {
            step1_title: "계정 만들기", step1_desc: "Google AI Studio에서 무료 계정을 만드세요.",
            step2_title: "키 생성", step2_desc: "거기서 개인 API 키를 복사하세요.",
            step3_title: "앱에 붙여넣기", step3_desc: "여기에 키를 붙여넣어 프리미엄을 잠금 해제하세요."
        }
    },
    [Language.ID]: {
        app_title: "Dream Code",
        app_subtitle: "Seluruh pengetahuan umat manusia & superkomputer – di saku Anda",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Basra, Irak (Abad ke-7)",
            [ReligiousSource.NABULSI]: "Damaskus, Suriah (Abad ke-17)",
            [ReligiousSource.AL_ISKHAFI]: "Baghdad (Abbasiyah)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Tradisi Arab (Abjad)",
            [ReligiousSource.MEDIEVAL]: "Eropa (Abad Pertengahan)",
            [ReligiousSource.MODERN_THEOLOGY]: "Teologi Barat",
            [ReligiousSource.CHURCH_FATHERS]: "Roma & Bizantium (Patristik)",
            [ReligiousSource.ZEN]: "Tiongkok & Jepang",
            [ReligiousSource.TIBETAN]: "Tibet (Himalaya)",
            [ReligiousSource.THERAVADA]: "Asia Tenggara (Kanon Pali)",
            [ReligiousSource.FREUDIAN]: "Wina (Psikoanalisis)",
            [ReligiousSource.JUNGIAN]: "Zurich (Psikologi Analitis)",
            [ReligiousSource.GESTALT]: "Berlin / New York",
            [ReligiousSource.WESTERN_ZODIAC]: "Tradisi Helenistik",
            [ReligiousSource.VEDIC_ASTROLOGY]: "India (Jyotish)",
            [ReligiousSource.CHINESE_ZODIAC]: "Tiongkok (Kalender Lunar)",
            [ReligiousSource.PYTHAGOREAN]: "Yunani Kuno",
            [ReligiousSource.CHALDEAN]: "Babel (Mesopotamia)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Mistisisme Yahudi (Spanyol)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "India (Weda)",
            [ReligiousSource.IMAM_SADIQ]: "Tradisi Syiah, Persia",
            [ReligiousSource.ISLAMSKI_SONNIK]: "Rusia-Islam",
            [ReligiousSource.ZHOU_GONG]: "Tiongkok, Tafsir Mimpi",
            [ReligiousSource.HATSUYUME]: "Jepang, Mimpi Tahun Baru",
            [ReligiousSource.SWAPNA_SHASTRA]: "India, Weda/Hindu",
            [ReligiousSource.EDGAR_CAYCE]: "AS, Nabi Tidur",
            [ReligiousSource.RUDOLF_STEINER]: "Antroposofi, Austria",
            [ReligiousSource.TALMUD_BERAKHOT]: "Babilonia, 55a-57b",
            [ReligiousSource.ZOHAR]: "Kabalistik, Abad ke-13",
            [ReligiousSource.VANGA]: "Bulgaria, Abad ke-20",
            [ReligiousSource.MILLER_RU]: "Tafsir Mimpi Rusia",
            [ReligiousSource.FREUD_RU]: "Adaptasi Freud Rusia",
            [ReligiousSource.LOFF]: "Buku Mimpi Rusia",
            [ReligiousSource.NOSTRADAMUS_RU]: "Adaptasi Rusia",
            [ReligiousSource.ARTEMIDOROS]: "Yunani, Abad ke-2 M",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "Mesir, sekitar 1275 SM",
            [ReligiousSource.SOMNIALE_DANIELIS]: "Bizantium-Abad Pertengahan"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islam', [ReligiousCategory.CHRISTIAN]: 'Kristen', [ReligiousCategory.BUDDHIST]: 'Buddha', [ReligiousCategory.PSYCHOLOGICAL]: 'Psikologi', [ReligiousCategory.ASTROLOGY]: 'Astrologi', [ReligiousCategory.NUMEROLOGY]: 'Numerologi', [ReligiousCategory.JEWISH]: 'Yahudi', [ReligiousCategory.SONNIKS]: 'Buku Mimpi', [ReligiousCategory.ANCIENT]: 'Kuno',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibet', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Abad Pertengahan', [ReligiousSource.MODERN_THEOLOGY]: 'Teologi Modern', [ReligiousSource.CHURCH_FATHERS]: 'Bapa Gereja', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Zodiak Barat', [ReligiousSource.VEDIC_ASTROLOGY]: 'Weda', [ReligiousSource.CHINESE_ZODIAC]: 'Zodiak Tiongkok', [ReligiousSource.PYTHAGOREAN]: 'Pythagoras', [ReligiousSource.CHALDEAN]: 'Kaldea', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabbalah', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Angka Weda', [ReligiousSource.IMAM_SADIQ]: 'Imam Sadiq', [ReligiousSource.ISLAMSKI_SONNIK]: 'Sonnik Islam', [ReligiousSource.ZHOU_GONG]: 'Zhou Gong', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berakhot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artemidorus', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Papirus Mesir', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Ceritakan mimpi Anda...", interpret: "Tafsirkan Mimpi", choose_tradition: "Pilih Tradisi", refine_sources: "Pilih Sumber", oracle_speaks: "Sang Oracle Berbicara", close: "Tutup", listening: "Mendengarkan...", voices: "Suara",
            settings: "Pengaturan", text_size: "Ukuran", dictation_error: "Error: Mikrofon tidak tersedia.", dictation_perm: "Izin ditolak.",
            calendar_btn: "Kalender & Analisis", coming_soon: "Selengkapnya...", calendar_desc: "Jurnal Mimpi Anda",
            profile_btn: "Profil Anda", profile_desc: "Statistik & Saya",
            hub_btn: "Dream Hub", hub_desc: "Mimpi Komunitas",
            gen_image: "Buat Gambar", saved_msg: "Mimpi disimpan ke kalender!",
            watch_ad: "Dapatkan Koin", generate_video: "Buat Video (Gold)", create_dream_video: "Video Mimpi",
            video_btn_short: "📹 Buat Video", video_duration_short: "30d, 180 Koin",
            slideshow_btn: "📽️ Buat Slideshow", slideshow_duration: "30d, 180 Koin",
            premium_btn: "Premium / Paket", premium_desc: "Upgrade & Fitur",
            customer_file_btn: "File Konteks Pribadi",
            theme: "Tampilan", mode: "Mode", dark: "Gelap", light: "Terang",
            style: "Gaya Desain", style_def: "Default (Mistis)", style_fem: "Feminin (Mawar)", style_masc: "Maskulin (Biru)", style_nature: "Alam (Hijau)",
            voice_char: "Karakter Suara", fem_char: "Karakter Wanita", male_char: "Karakter Pria", preview: "Pratinjau",
            info_title: "Basis Pengetahuan", info_bio: "Biografi", info_origin: "Asal-usul & Latar Belakang",
            video_ready: "Video mimpi Anda siap!", video_gen: "Membuat Video...", video_error: "Pembuatan gagal.",
            map_btn: "Siapa yang bermimpi sama?",
            api_manager: "Pengelola Kunci API (Smart Tier)", api_desc: "Tambahkan kunci API Gemini Anda. Sistem otomatis beralih jika batas tercapai.", add_key: "Tambah Kunci", no_keys: "Tidak ada kunci ditemukan.",
            quality_normal: "Normal", quality_high: "Kualitas Tinggi",
            style_cartoon: "Kartun", style_anime: "Anime", style_real: "Nyata", style_fantasy: "Fantasi",
            choose_quality: "Pilih Kualitas", choose_style: "Pilih Gaya",
            choose_image_style: "Pilih Gaya Gambar",
            choose_style_desc: "Pilih kualitas dan gaya untuk gambar mimpi Anda",
            continue_without_image: "Lanjutkan tanpa membuat gambar",
            step_quality: "1. Pilih Kualitas",
            step_style: "2. Pilih Gaya",
            continue: "Lanjutkan",
            social_proof_stats: "47.832 mimpi dianalisis · 12.543 kecocokan mimpi ditemukan",
            social_proof_testimonial1: "\"Akhirnya mengerti mimpi berulang saya!\" - Sari, 28",
            social_proof_testimonial2: "\"Interpretasi multi-perspektif sangat unik.\" - Budi, 34",
            social_proof_testimonial3: "\"Menemukan orang dengan mimpi identik lewat aplikasi!\" - Dewi, 31",
            processing_context: "Mempertimbangkan:",
            backup_title: "Brankas Data (Cadangan)",
            backup_desc: "Amankan data Anda sebagai file atau pulihkan cadangan.",
            export_btn: "Unduh Cadangan",
            import_btn: "Pulihkan Cadangan",
            home_label: "Beranda",
            map_label: "Peta",
            live_chat_label: "Obrolan Langsung",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5 Koin Bonus: Video dengan Suara Anda!",
            audio_coin_desc: "Rekaman Anda disimpan. Buat video mimpi dengan suara sendiri di Profil dan dapatkan 5 koin!",
            upload_audio: "Unggah",
            upload_confirm_title: "Audio Berhasil Disimpan!",
            upload_confirm_desc: "Rekaman audio Anda telah disimpan bersama mimpi. Lihat di Profil di bawah 'Audio'!",
            got_it: "Mengerti!",
            backup_restored: "Cadangan berhasil dipulihkan!",
            backup_error: "Error memulihkan cadangan. File tidak valid.",
            storage_init: "Penyimpanan sedang diinisialisasi. Harap tunggu.",
            mic_denied_alert: "Akses mikrofon ditolak",
            min_dreams_required: "Anda membutuhkan minimal 7 mimpi yang ditafsirkan untuk menggunakan fitur analisis.",
            base_version: "Versi Dasar",
            until_date: "Sampai:",
            audio_recorded: "Audio direkam",
            audio_saved_with_dream: "Akan disimpan bersama mimpi",
            remove: "Hapus",
            oracle_voice: "Suara Oracle",
            image_ready: "Gambar Siap!",
            style_desc_cartoon: "Gaya Pixar",
            style_desc_anime: "Gaya Ghibli",
            style_desc_real: "Fotorealistis",
            style_desc_fantasy: "Magis",
            cosmic_dna: "DNA Kosmik",
            moon_sync: "Sinkronisasi Bulan",
            cosmic_dna_body: "DNA Kosmis Anda adalah sidik jari mimpi unik Anda — berdasarkan tanggal lahir, zodiak, dan pola mimpi Anda.",
            cosmic_dna_coming: "Segera Hadir",
            cosmic_dna_enter: "Masukkan tanggal lahir di profil Anda untuk menghitung DNA Kosmis Anda.",
            moon_phase_label: "Fase bulan",
            dream_meaning_today: "Arti mimpi hari ini",
            save_btn: "Simpan",
            age_restricted_cat: "Kategori ini hanya tersedia untuk orang berusia 18 tahun ke atas.",
            ok: "OK",
            video_studio: "Studio Video",
            dream_network: "Jaringan Mimpi",
            privacy_link: "Privasi", terms_link: "Ketentuan", imprint_link: "Imprint", research_link: "Penelitian", studies_link: "Studi", worldmap_link: "Peta Dunia", showing_sources_only: "Menampilkan sumber {0} saja", science_label: "Pengetahuan",
        },
        processing: {
            title: "Oracle sedang bekerja...",
            step_analyze: "Menganalisis tafsir mimpi",
            step_customer: "Mempertimbangkan konteks pelanggan",
            step_no_customer: "Tidak ada konteks pelanggan tersedia",
            step_context: "Kategori & Tradisi sedang dihitung",
            step_no_context: "Tidak ada tradisi spesifik dipilih",
            step_image: "Menghasilkan visi",
            step_save: "Disimpan ke kalender dan profil"
        },
        sub: {
            title: "Pilih Tier Anda",
            billing_monthly: "Bulanan", billing_yearly: "Tahunan",
            yearly_discount: "1 Bulan Gratis!",
            smart_discount: "Untuk Developer",
            free_title: "Gratis",
            free_price: "0 €",
            free_features: ["Tafsir Dasar (dengan iklan)", "Akses Offerwall untuk koin gratis", "Premium via koin", "Berbagi tautan saja"],
            silver_title: "Pro",
            silver_price: "4.99 € / bulan",
            silver_features: ["Tanpa Iklan", "Konversi & Unduh PDF Tanpa Batas", "Tafsir Tanpa Batas", "25 Gambar HD/bln", "1x Obrolan Langsung/minggu", "Audio I/O"],
            gold_title: "Gold (VIP)",
            gold_price: "12.99 € / bulan",
            gold_trial_text: "7 hari gratis, lalu 12.99 €/bln",
            gold_features: ["Semua Fitur Silver", "Obrolan Oracle Langsung Tanpa Batas", "5 Video Mimpi/bln", "Diskon Koin Eksklusif", "Dukungan Prioritas"],
            smart_title: "Smart (Developer)",
            smart_price: "49.99 € / tahun",
            smart_features: ["Bawa Kunci Sendiri (BYOK)", "Semua Fitur Premium Terbuka", "Rotasi Penyedia Otomatis", "Harga Tahunan Tetap (29.99€)"],
            smart_info_title: "Apa itu Smart Developer Tier?",
            smart_info_text: "Untuk developer & pecinta teknologi: Buat akun di penyedia AI (mis. Google AI Studio), buat kunci API Anda sendiri di sana, dan tambahkan ke aplikasi. Dengan cara ini, Anda hanya membayar biaya API rendah langsung ke penyedia + €3 untuk penggunaan aplikasi. Sempurna untuk power user!",
            upgrade: "Upgrade", current: "Saat ini", unlock: "Buka", try_free: "COBA GRATIS 7 HARI",
            ad_loading: "Memuat Iklan...", ad_reward: "Koin diterima!",
            bronze_title: "Gratis", bronze_features: ["3 Tafsir/Hari", "Groq AI", "6 Tradisi", "Iklan"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["Tafsir Tanpa Batas", "Gemini AI", "Semua 9 Tradisi", "Tanpa Iklan", "100 Koin/Bulan", "Diskon Koin 10%"], silver2_price_monthly: "€4.99 / Bulan", silver2_price_yearly: "€49.99 / Tahun",
            gold2_title: "Premium", gold2_features: ["Claude 6-Perspektif", "500 Koin/Bulan", "Diskon Koin 20%", "Gambar HD", "5 Video/Bulan", "Suara Langsung", "Chat AI Premium"], gold2_price_monthly: "€14.99 / Bulan", gold2_price_yearly: "€149.99 / Tahun",
            
            pro_badge: "TERPOPULER", vip_badge: "EKSKLUSIF 👑",
        },
        earn: {
            title: "Dapatkan Koin",
            desc: "Selesaikan tugas untuk mengisi saldo Anda.",
            short_title: "Klip Pendek", short_desc: "10 Detik", short_reward: "1",
            long_title: "Video Premium", long_desc: "2 Menit", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Survei & Tugas", offer_reward: "5-10",
            offer_info: "Selesaikan tugas seperti survei, uji coba aplikasi, atau pendaftaran untuk hadiah besar.",
            survey_task: "Survei Merek", app_task: "Capai Level 5 di Game",
            watch_btn: "Tonton", start_btn: "Mulai"
        },
        shop: {
            title: "Toko Koin",
            desc: "Isi ulang persediaan Anda.",
            starter_label: "Pemula", starter_price: "1.99 €", starter_amount: "100 Koin",
            best_label: "Terlaris", best_price: "5.99 €", best_amount: "550 Koin", best_badge: "Populer",
            value_label: "Nilai Terbaik", value_price: "12.99 €", value_amount: "1500 Koin", value_badge: "Nilai Terbaik",
            free_link: "Ingin mendapatkan koin gratis? Klik di sini.",
            buy_btn: "Beli",
            wow_badge: "💎 Di Bawah 1 Sen/Koin!",
            coins_label: "Koin",
            per_coin: "per koin",
            pkg_starter: "Coba", pkg_popular: "Populer", pkg_value: "Lebih Hemat", pkg_premium: "Hemat Lebih", pkg_mega: "Pengguna Pro",
        },
        smart_guide: {
            step1_title: "Buat Akun", step1_desc: "Buat akun gratis di Google AI Studio.",
            step2_title: "Buat Kunci", step2_desc: "Salin kunci API pribadi Anda di sana.",
            step3_title: "Tempel di Aplikasi", step3_desc: "Tempel kunci di sini untuk membuka Premium."
        }
    },
    [Language.FA]: {
        app_title: "رمز رویا | Dream Code",
        app_subtitle: "تمام دانش بشریت و یک ابرکامپیوتر – در جیب شما",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "بصره، عراق (قرن ۷)",
            [ReligiousSource.NABULSI]: "دمشق، سوریه (قرن ۱۷)",
            [ReligiousSource.AL_ISKHAFI]: "بغداد (عباسیان)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "سنت عربی (ابجد)",
            [ReligiousSource.MEDIEVAL]: "اروپا (قرون وسطی)",
            [ReligiousSource.MODERN_THEOLOGY]: "الهیات غربی",
            [ReligiousSource.CHURCH_FATHERS]: "رم و بیزانس (آبای کلیسا)",
            [ReligiousSource.ZEN]: "چین و ژاپن",
            [ReligiousSource.TIBETAN]: "تبت (هیمالیا)",
            [ReligiousSource.THERAVADA]: "جنوب شرق آسیا (پالی کانن)",
            [ReligiousSource.FREUDIAN]: "وین (روانکاوی)",
            [ReligiousSource.JUNGIAN]: "زوریخ (روانشناسی تحلیلی)",
            [ReligiousSource.GESTALT]: "برلین / نیویورک",
            [ReligiousSource.WESTERN_ZODIAC]: "سنت هلنیستی",
            [ReligiousSource.VEDIC_ASTROLOGY]: "هند (جیوتیش)",
            [ReligiousSource.CHINESE_ZODIAC]: "چین (تقویم قمری)",
            [ReligiousSource.PYTHAGOREAN]: "یونان باستان",
            [ReligiousSource.CHALDEAN]: "بابل (بین‌النهرین)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "عرفان یهودی (اسپانیا)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "هند (وداها)",
            [ReligiousSource.IMAM_SADIQ]: "سنت شیعه، ایران",
            [ReligiousSource.ISLAMSKI_SONNIK]: "اسلامی-روسی",
            [ReligiousSource.ZHOU_GONG]: "چین، تعبیر خواب",
            [ReligiousSource.HATSUYUME]: "ژاپن، رویای سال نو",
            [ReligiousSource.SWAPNA_SHASTRA]: "هند، ودایی/هندو",
            [ReligiousSource.EDGAR_CAYCE]: "آمریکا، پیامبر خواب",
            [ReligiousSource.RUDOLF_STEINER]: "آنتروپوسوفی، اتریش",
            [ReligiousSource.TALMUD_BERAKHOT]: "بابل، ۵۵الف-۵۷ب",
            [ReligiousSource.ZOHAR]: "کابالایی، قرن ۱۳",
            [ReligiousSource.VANGA]: "بلغارستان، قرن ۲۰",
            [ReligiousSource.MILLER_RU]: "تعبیر خواب روسی",
            [ReligiousSource.FREUD_RU]: "اقتباس روسی فروید",
            [ReligiousSource.LOFF]: "کتاب خواب روسی",
            [ReligiousSource.NOSTRADAMUS_RU]: "اقتباس روسی",
            [ReligiousSource.ARTEMIDOROS]: "یونان، قرن ۲ میلادی",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "مصر، حدود ۱۲۷۵ ق.م",
            [ReligiousSource.SOMNIALE_DANIELIS]: "بیزانسی-قرون وسطایی"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'اسلامی', [ReligiousCategory.CHRISTIAN]: 'مسیحی', [ReligiousCategory.BUDDHIST]: 'بودایی', [ReligiousCategory.PSYCHOLOGICAL]: 'روانشناسی', [ReligiousCategory.ASTROLOGY]: 'طالع‌بینی', [ReligiousCategory.NUMEROLOGY]: 'علم اعداد', [ReligiousCategory.JEWISH]: 'یهودی', [ReligiousCategory.SONNIKS]: 'کتب خواب', [ReligiousCategory.ANCIENT]: 'باستانی',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'تبتی', [ReligiousSource.IBN_SIRIN]: 'ابن سیرین', [ReligiousSource.NABULSI]: 'النابلسی', [ReligiousSource.AL_ISKHAFI]: 'الاسخافی', [ReligiousSource.MEDIEVAL]: 'قرون وسطی', [ReligiousSource.MODERN_THEOLOGY]: 'الهیات مدرن', [ReligiousSource.CHURCH_FATHERS]: 'آبای کلیسا', [ReligiousSource.ZEN]: 'ذن', [ReligiousSource.THERAVADA]: 'تراوادا', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'زودیاک غربی', [ReligiousSource.VEDIC_ASTROLOGY]: 'ودایی', [ReligiousSource.CHINESE_ZODIAC]: 'زودیاک چینی', [ReligiousSource.PYTHAGOREAN]: 'فیثاغورثی', [ReligiousSource.CHALDEAN]: 'کلدانی', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'کابالا', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'ابجد', [ReligiousSource.VEDIC_NUMEROLOGY]: 'اعداد ودایی', [ReligiousSource.IMAM_SADIQ]: 'امام صادق', [ReligiousSource.ISLAMSKI_SONNIK]: 'سنّیک اسلامی', [ReligiousSource.ZHOU_GONG]: 'ژوئو گونگ', [ReligiousSource.HATSUYUME]: 'هاتسویومه', [ReligiousSource.SWAPNA_SHASTRA]: 'سواپنا شاسترا', [ReligiousSource.EDGAR_CAYCE]: 'ادگار کیسی', [ReligiousSource.RUDOLF_STEINER]: 'رودولف اشتاینر', [ReligiousSource.TALMUD_BERAKHOT]: 'تلمود براخوت', [ReligiousSource.ZOHAR]: 'زوهار', [ReligiousSource.VANGA]: 'وانگا', [ReligiousSource.MILLER_RU]: 'میلر', [ReligiousSource.FREUD_RU]: 'فروید (RU)', [ReligiousSource.LOFF]: 'لوف', [ReligiousSource.NOSTRADAMUS_RU]: 'نوستراداموس', [ReligiousSource.ARTEMIDOROS]: 'آرتمیدوروس', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'پاپیروس مصری', [ReligiousSource.SOMNIALE_DANIELIS]: 'سومنیاله دانیلیس'
        },
        ui: {
            placeholder: "رویای خود را توصیف کنید...", interpret: "تعبیر خواب", choose_tradition: "انتخاب سنت", refine_sources: "اصلاح منابع", oracle_speaks: "پیشگو سخن می‌گوید", close: "بستن", listening: "در حال شنیدن...", voices: "صدا",
            settings: "تنظیمات", text_size: "اندازه", dictation_error: "خطا: میکروفون در دسترس نیست.", dictation_perm: "دسترسی رد شد.",
            calendar_btn: "تقویم و تحلیل", coming_soon: "بیشتر...", calendar_desc: "دفتر خواب شما",
            profile_btn: "پروفایل شما", profile_desc: "آمار و من",
            hub_btn: "مرکز رویا", hub_desc: "رویاهای جامعه",
            gen_image: "ساخت تصویر", saved_msg: "رویا در تقویم ذخیره شد!",
            watch_ad: "کسب سکه", generate_video: "ساخت ویدیو (طلایی)", create_dream_video: "ویدیو رویا",
            video_btn_short: "📹 ساخت ویدیو", video_duration_short: "۳۰ ثانیه، ۱۸۰ سکه",
            slideshow_btn: "📽️ ساخت اسلایدشو", slideshow_duration: "۳۰ ثانیه، ۱۸۰ سکه",
            premium_btn: "پرمیوم / طرح", premium_desc: "ارتقا و امکانات",
            customer_file_btn: "فایل زمینه شخصی",
            theme: "ظاهر", mode: "حالت", dark: "تاریک", light: "روشن",
            style: "سبک طراحی", style_def: "پیش‌فرض (عرفانی)", style_fem: "زنانه (رز)", style_masc: "مردانه (آبی)", style_nature: "طبیعت (سبز)",
            voice_char: "شخصیت صوتی", fem_char: "شخصیت‌های زنانه", male_char: "شخصیت‌های مردانه", preview: "پیش‌نمایش",
            info_title: "پایگاه دانش", info_bio: "بیوگرافی", info_origin: "خاستگاه و پیشینه",
            video_ready: "ویدیوی رویای شما آماده است!", video_gen: "در حال ساخت ویدیو...", video_error: "ساخت ناموفق بود.",
            map_btn: "چه کسی همان خواب را دیده؟",
            api_manager: "مدیر کلید API (سطح هوشمند)", api_desc: "کلیدهای Gemini API خود را اضافه کنید. سیستم در صورت رسیدن به محدودیت خودکار تغییر می‌کند.", add_key: "افزودن کلید", no_keys: "کلیدی یافت نشد.",
            quality_normal: "عادی", quality_high: "کیفیت بالا",
            style_cartoon: "کارتونی", style_anime: "انیمه", style_real: "واقعی", style_fantasy: "فانتزی",
            choose_quality: "انتخاب کیفیت", choose_style: "انتخاب سبک",
            choose_image_style: "انتخاب سبک تصویر",
            choose_style_desc: "کیفیت و سبک تصویر رویای خود را انتخاب کنید",
            continue_without_image: "ادامه بدون ساخت تصویر",
            step_quality: "۱. انتخاب کیفیت",
            step_style: "۲. انتخاب سبک",
            continue: "ادامه",
            social_proof_stats: "۴۷,۸۳۲ رویا تحلیل شده · ۱۲,۵۴۳ تطابق رویا یافت شده",
            social_proof_testimonial1: "\"بالاخره خواب‌های تکراری‌ام را درک کردم!\" - آنا، ۲۸",
            social_proof_testimonial2: "\"تعبیر چند منظوره بی‌نظیر است.\" - مایکل، ۳۴",
            social_proof_testimonial3: "\"کسی را با خواب مشابه از طریق اپلیکیشن پیدا کردم!\" - سارا، ۳۱",
            processing_context: "در نظر گرفتن:",
            backup_title: "صندوق داده (پشتیبان)",
            backup_desc: "داده‌های خود را به صورت فایل ذخیره کنید یا پشتیبان بازیابی کنید.",
            export_btn: "دانلود پشتیبان",
            import_btn: "بازیابی پشتیبان",
            home_label: "خانه",
            map_label: "نقشه",
            live_chat_label: "چت زنده",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +۵ سکه جایزه: ویدیو با صدای شما!",
            audio_coin_desc: "ضبط شما ذخیره شد. یک ویدیوی رویایی با صدای خودتان در پروفایل بسازید و ۵ سکه بگیرید!",
            upload_audio: "آپلود",
            upload_confirm_title: "صدا با موفقیت ذخیره شد!",
            upload_confirm_desc: "ضبط صوتی شما با رویا ذخیره شد. در پروفایل قسمت 'صوتی' بررسی کنید!",
            got_it: "متوجه شدم!",
            backup_restored: "پشتیبان با موفقیت بازیابی شد!",
            backup_error: "خطا در بازیابی پشتیبان. فایل نامعتبر است.",
            storage_init: "فضای ذخیره‌سازی در حال آماده‌سازی است. لطفاً صبر کنید.",
            mic_denied_alert: "دسترسی میکروفون رد شد",
            min_dreams_required: "برای استفاده از قابلیت تحلیل به حداقل ۷ رویای تعبیر شده نیاز دارید.",
            base_version: "نسخه پایه",
            until_date: "تا:",
            audio_recorded: "صدا ضبط شد",
            audio_saved_with_dream: "با رویا ذخیره خواهد شد",
            remove: "حذف",
            oracle_voice: "صدای پیشگو",
            image_ready: "تصویر آماده است!",
            style_desc_cartoon: "سبک Pixar",
            style_desc_anime: "سبک Ghibli",
            style_desc_real: "فوتورئالیستی",
            style_desc_fantasy: "جادویی",
            cosmic_dna: "DNA کیهانی",
            moon_sync: "هماهنگی ماه",
            cosmic_dna_body: "DNA کیهانی شما اثر انگشت منحصر به فرد رویاهای شماست — بر اساس تاریخ تولد، نشان زودیاک و الگوهای رویاهایتان.",
            cosmic_dna_coming: "به زودی",
            cosmic_dna_enter: "برای محاسبه DNA کیهانی خود، تاریخ تولدتان را در پروفایل وارد کنید.",
            moon_phase_label: "مرحله ماه",
            dream_meaning_today: "معنای رویای امروز",
            save_btn: "ذخیره",
            age_restricted_cat: "این دسته‌بندی فقط برای افراد ۱۸ سال و بالاتر در دسترس است.",
            ok: "باشه",
            video_studio: "استودیوی ویدیو",
            dream_network: "شبکه رویا",
            privacy_link: "حریم خصوصی", terms_link: "شرایط", imprint_link: "مشخصات", research_link: "تحقیقات", studies_link: "مطالعات", worldmap_link: "نقشه جهان", showing_sources_only: "فقط منابع {0}", science_label: "دانش",
        },
        processing: {
            title: "پیشگو در حال کار است...",
            step_analyze: "تحلیل تعبیر خواب",
            step_customer: "در نظر گرفتن زمینه مشتری",
            step_no_customer: "زمینه مشتری در دسترس نیست",
            step_context: "دسته‌بندی‌ها و سنت‌ها در حال محاسبه",
            step_no_context: "سنت خاصی انتخاب نشده",
            step_image: "در حال ساخت تصویر",
            step_save: "در تقویم و پروفایل ذخیره شد"
        },
        sub: {
            title: "سطح خود را انتخاب کنید",
            billing_monthly: "ماهانه", billing_yearly: "سالانه",
            yearly_discount: "۱ ماه رایگان!",
            smart_discount: "برای توسعه‌دهندگان",
            free_title: "رایگان",
            free_price: "0 €",
            free_features: ["تعبیر پایه (با تبلیغ)", "دسترسی به آفروال برای سکه رایگان", "پرمیوم با سکه", "فقط اشتراک‌گذاری لینک"],
            silver_title: "حرفه‌ای",
            silver_price: "4.99 € / month",
            silver_features: ["بدون تبلیغ", "تبدیل و دانلود نامحدود PDF", "تعبیر نامحدود", "۲۵ تصویر HD/ماه", "۱ بار چت زنده هفتگی", "ورودی/خروجی صوتی"],
            gold_title: "طلایی (VIP)",
            gold_price: "12.99 € / month",
            gold_trial_text: "۷ روز رایگان، سپس 12.99 €/ماه",
            gold_features: ["شامل تمام امکانات نقره‌ای", "چت زنده نامحدود با پیشگو", "۵ ویدیوی رویا/ماه", "تخفیف ویژه سکه", "پشتیبانی اولویت‌دار"],
            smart_title: "هوشمند (توسعه‌دهنده)",
            smart_price: "49.99 € / year",
            smart_features: ["کلید خودتان را بیاورید (BYOK)", "تمام امکانات پرمیوم فعال", "چرخش خودکار ارائه‌دهنده", "قیمت ثابت سالانه (29.99€)"],
            smart_info_title: "سطح هوشمند توسعه‌دهنده چیست؟",
            smart_info_text: "برای توسعه‌دهندگان و علاقه‌مندان فناوری: حساب‌هایی در ارائه‌دهندگان AI بسازید (مثلاً Google AI Studio)، کلید API خود را تولید کنید و به اپلیکیشن اضافه کنید. به این ترتیب فقط هزینه کم API را مستقیماً به ارائه‌دهنده می‌پردازید + ۳€ برای استفاده از اپلیکیشن.",
            upgrade: "ارتقا", current: "فعلی", unlock: "باز کردن", try_free: "۷ روز رایگان امتحان کنید",
            ad_loading: "در حال بارگذاری تبلیغ...", ad_reward: "سکه‌ها اضافه شد!",
            bronze_title: "رایگان", bronze_features: ["۳ تعبیر/روز", "Groq AI", "۶ سنت", "تبلیغات"], bronze_price: "€0",
            silver2_title: "حرفه‌ای", silver2_features: ["تعبیر نامحدود", "Gemini AI", "تمام ۹ سنت", "بدون تبلیغ", "۱۰۰ سکه/ماه", "۱۰٪ تخفیف سکه"], silver2_price_monthly: "€4.99 / ماه", silver2_price_yearly: "€49.99 / سال",
            gold2_title: "پرمیوم", gold2_features: ["Claude ۶ دیدگاه", "۵۰۰ سکه/ماه", "۲۰٪ تخفیف سکه", "تصاویر HD", "۵ ویدیو/ماه", "صدای زنده", "چت AI پرمیوم"], gold2_price_monthly: "€14.99 / ماه", gold2_price_yearly: "€149.99 / سال",
            
            pro_badge: "محبوب‌ترین", vip_badge: "انحصاری 👑",
        },
        earn: {
            title: "کسب سکه",
            desc: "وظایف را انجام دهید تا موجودی خود را شارژ کنید.",
            short_title: "کلیپ کوتاه", short_desc: "۱۰ ثانیه", short_reward: "1",
            long_title: "ویدیوی ویژه", long_desc: "۲ دقیقه", long_reward: "3",
            offer_title: "آفروال", offer_desc: "نظرسنجی و وظایف", offer_reward: "5-10",
            offer_info: "وظایفی مانند نظرسنجی، تست اپلیکیشن یا ثبت‌نام را برای پاداش بالا انجام دهید.",
            survey_task: "نظرسنجی برند", app_task: "رسیدن به سطح ۵ در بازی",
            watch_btn: "تماشا", start_btn: "شروع"
        },
        shop: {
            title: "فروشگاه سکه",
            desc: "موجودی خود را شارژ کنید.",
            starter_label: "شروع", starter_price: "1.99 €", starter_amount: "۱۰۰ سکه",
            best_label: "پرفروش", best_price: "5.99 €", best_amount: "۵۵۰ سکه", best_badge: "محبوب",
            value_label: "بهترین ارزش", value_price: "12.99 €", value_amount: "۱۵۰۰ سکه", value_badge: "بهترین ارزش",
            free_link: "می‌خواهید سکه رایگان بگیرید؟ اینجا کلیک کنید.",
            buy_btn: "خرید",
            wow_badge: "💎 زیر ۱ سنت/سکه!",
            coins_label: "سکه",
            per_coin: "هر سکه",
            pkg_starter: "امتحان کن", pkg_popular: "محبوب", pkg_value: "ارزش بیشتر", pkg_premium: "صرفه‌جویی", pkg_mega: "کاربر حرفه‌ای",
        },
        smart_guide: {
            step1_title: "ساخت حساب", step1_desc: "حساب رایگان در Google AI Studio بسازید.",
            step2_title: "ساخت کلید", step2_desc: "کلید API شخصی خود را کپی کنید.",
            step3_title: "وارد کردن در اپلیکیشن", step3_desc: "کلید را اینجا وارد کنید تا پرمیوم فعال شود."
        }
    },
    [Language.IT]: {
        app_title: "Codice dei Sogni | Dream Code",
        app_subtitle: "Tutta la conoscenza dell'umanità e un supercomputer – nella tua tasca",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Bassora, Iraq (VII sec.)",
            [ReligiousSource.NABULSI]: "Damasco, Siria (XVII sec.)",
            [ReligiousSource.AL_ISKHAFI]: "Baghdad (Abbasidi)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Tradizione araba (Abjad)",
            [ReligiousSource.MEDIEVAL]: "Europa (Medioevo)",
            [ReligiousSource.MODERN_THEOLOGY]: "Teologia occidentale",
            [ReligiousSource.CHURCH_FATHERS]: "Roma e Bisanzio (Patristica)",
            [ReligiousSource.ZEN]: "Cina e Giappone",
            [ReligiousSource.TIBETAN]: "Tibet (Himalaya)",
            [ReligiousSource.THERAVADA]: "Sud-est asiatico (Canone Pali)",
            [ReligiousSource.FREUDIAN]: "Vienna (Psicoanalisi)",
            [ReligiousSource.JUNGIAN]: "Zurigo (Psicologia analitica)",
            [ReligiousSource.GESTALT]: "Berlino / New York",
            [ReligiousSource.WESTERN_ZODIAC]: "Tradizione ellenistica",
            [ReligiousSource.VEDIC_ASTROLOGY]: "India (Jyotish)",
            [ReligiousSource.CHINESE_ZODIAC]: "Cina (Calendario lunare)",
            [ReligiousSource.PYTHAGOREAN]: "Grecia antica",
            [ReligiousSource.CHALDEAN]: "Babilonia (Mesopotamia)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Misticismo ebraico (Spagna)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "India (Veda)",
            [ReligiousSource.IMAM_SADIQ]: "Tradizione sciita, Persia",
            [ReligiousSource.ISLAMSKI_SONNIK]: "Russo-islamico",
            [ReligiousSource.ZHOU_GONG]: "Cina, Interpretazione dei sogni",
            [ReligiousSource.HATSUYUME]: "Giappone, Sogno di Capodanno",
            [ReligiousSource.SWAPNA_SHASTRA]: "India, Vedico/Induista",
            [ReligiousSource.EDGAR_CAYCE]: "USA, Profeta dormiente",
            [ReligiousSource.RUDOLF_STEINER]: "Antroposofia, Austria",
            [ReligiousSource.TALMUD_BERAKHOT]: "Babilonia, 55a-57b",
            [ReligiousSource.ZOHAR]: "Cabalistico, XIII sec.",
            [ReligiousSource.VANGA]: "Bulgaria, XX sec.",
            [ReligiousSource.MILLER_RU]: "Interpretazione dei sogni russa",
            [ReligiousSource.FREUD_RU]: "Adattamento russo di Freud",
            [ReligiousSource.LOFF]: "Libro dei sogni russo",
            [ReligiousSource.NOSTRADAMUS_RU]: "Adattamento russo",
            [ReligiousSource.ARTEMIDOROS]: "Grecia, II sec. d.C.",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "Egitto, ca. 1275 a.C.",
            [ReligiousSource.SOMNIALE_DANIELIS]: "Bizantino-medievale"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islamico', [ReligiousCategory.CHRISTIAN]: 'Cristiano', [ReligiousCategory.BUDDHIST]: 'Buddista', [ReligiousCategory.PSYCHOLOGICAL]: 'Psicologico', [ReligiousCategory.ASTROLOGY]: 'Astrologia', [ReligiousCategory.NUMEROLOGY]: 'Numerologia', [ReligiousCategory.JEWISH]: 'Ebraico', [ReligiousCategory.SONNIKS]: 'Libri dei sogni', [ReligiousCategory.ANCIENT]: 'Antico',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibetano', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Medievale', [ReligiousSource.MODERN_THEOLOGY]: 'Teologia moderna', [ReligiousSource.CHURCH_FATHERS]: 'Padri della Chiesa', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Zodiaco occidentale', [ReligiousSource.VEDIC_ASTROLOGY]: 'Vedico', [ReligiousSource.CHINESE_ZODIAC]: 'Zodiaco cinese', [ReligiousSource.PYTHAGOREAN]: 'Pitagorico', [ReligiousSource.CHALDEAN]: 'Caldeo', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Cabala', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Numeri vedici', [ReligiousSource.IMAM_SADIQ]: 'Imam Sadiq', [ReligiousSource.ISLAMSKI_SONNIK]: 'Sonnik islamico', [ReligiousSource.ZHOU_GONG]: 'Zhou Gong', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berakhot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artemidoro', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Papiro egizio', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Descrivi il tuo sogno...", interpret: "Interpreta il sogno", choose_tradition: "Scegli tradizione", refine_sources: "Affina fonti", oracle_speaks: "L'Oracolo parla", close: "Chiudi", listening: "Ascolto...", voices: "Voce",
            settings: "Impostazioni", text_size: "Dimensione", dictation_error: "Errore: Microfono non disponibile.", dictation_perm: "Permesso negato.",
            calendar_btn: "Calendario e analisi", coming_soon: "Altro...", calendar_desc: "Il tuo diario dei sogni",
            profile_btn: "Il tuo profilo", profile_desc: "Statistiche e Io",
            hub_btn: "Hub dei sogni", hub_desc: "Sogni della community",
            gen_image: "Genera immagine", saved_msg: "Sogno salvato nel calendario!",
            watch_ad: "Guadagna monete", generate_video: "Genera video (Gold)", create_dream_video: "Video del Sogno",
            video_btn_short: "📹 Genera video", video_duration_short: "30s, 180 monete",
            slideshow_btn: "📽️ Crea presentazione", slideshow_duration: "30s, 180 monete",
            premium_btn: "Premium / Piano", premium_desc: "Upgrade e funzionalità",
            customer_file_btn: "File contesto personale",
            theme: "Aspetto", mode: "Modalità", dark: "Scuro", light: "Chiaro",
            style: "Stile di design", style_def: "Predefinito (Mistico)", style_fem: "Femminile (Rosa)", style_masc: "Maschile (Blu)", style_nature: "Natura (Verde)",
            voice_char: "Carattere vocale", fem_char: "Personaggi femminili", male_char: "Personaggi maschili", preview: "Anteprima",
            info_title: "Base di conoscenza", info_bio: "Biografia", info_origin: "Origine e contesto",
            video_ready: "Il tuo video del sogno è pronto!", video_gen: "Generazione video...", video_error: "Generazione fallita.",
            map_btn: "Chi ha fatto lo stesso sogno?",
            api_manager: "Gestore chiavi API (Livello Smart)", api_desc: "Aggiungi le tue chiavi Gemini API. Il sistema passa automaticamente se raggiunto il limite.", add_key: "Aggiungi chiave", no_keys: "Nessuna chiave trovata.",
            quality_normal: "Normale", quality_high: "Alta qualità",
            style_cartoon: "Cartone", style_anime: "Anime", style_real: "Reale", style_fantasy: "Fantasy",
            choose_quality: "Scegli qualità", choose_style: "Scegli stile",
            choose_image_style: "Scegli stile immagine",
            choose_style_desc: "Seleziona qualità e stile per la tua immagine del sogno",
            continue_without_image: "Continua senza generazione immagine",
            step_quality: "1. Scegli qualità",
            step_style: "2. Scegli stile",
            continue: "Continua",
            social_proof_stats: "47.832 sogni analizzati · 12.543 corrispondenze trovate",
            social_proof_testimonial1: "\"Finalmente capisco i miei sogni ricorrenti!\" - Anna, 28",
            social_proof_testimonial2: "\"L'interpretazione multi-prospettiva è unica.\" - Marco, 34",
            social_proof_testimonial3: "\"Ho trovato qualcuno con un sogno identico tramite l'app!\" - Sara, 31",
            processing_context: "Considerando:",
            backup_title: "Cassaforte dati (Backup)",
            backup_desc: "Proteggi i tuoi dati come file o ripristina un backup.",
            export_btn: "Scarica backup",
            import_btn: "Ripristina backup",
            home_label: "Home",
            map_label: "Mappa",
            live_chat_label: "Chat dal vivo",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5 monete bonus: Video con la tua voce!",
            audio_coin_desc: "La tua registrazione è stata salvata. Crea un video del sogno con la tua voce nel Profilo e guadagna 5 monete!",
            upload_audio: "Carica",
            upload_confirm_title: "Audio salvato con successo!",
            upload_confirm_desc: "La tua registrazione audio è stata salvata con il sogno. Controllala nel tuo Profilo sotto 'Audio'!",
            got_it: "Capito!",
            backup_restored: "Backup ripristinato con successo!",
            backup_error: "Errore nel ripristino del backup. File non valido.",
            storage_init: "Lo storage si sta inizializzando. Attendere prego.",
            mic_denied_alert: "Accesso al microfono negato",
            min_dreams_required: "Hai bisogno di almeno 7 sogni interpretati per usare la funzione di analisi.",
            base_version: "Versione base",
            until_date: "Fino a:",
            audio_recorded: "Audio registrato",
            audio_saved_with_dream: "Verrà salvato con il sogno",
            remove: "Rimuovi",
            oracle_voice: "Voce dell'Oracolo",
            image_ready: "Immagine pronta!",
            style_desc_cartoon: "Stile Pixar",
            style_desc_anime: "Stile Ghibli",
            style_desc_real: "Fotorealistico",
            style_desc_fantasy: "Magico",
            cosmic_dna: "DNA Cosmico",
            moon_sync: "Sincro Lunare",
            cosmic_dna_body: "Il tuo DNA Cosmico è la tua impronta onirica unica — basata sulla data di nascita, segno zodiacale e i modelli dei tuoi sogni.",
            cosmic_dna_coming: "Prossimamente",
            cosmic_dna_enter: "Inserisci la data di nascita nel tuo profilo per calcolare il tuo DNA Cosmico.",
            moon_phase_label: "Fase lunare",
            dream_meaning_today: "Significato del sogno oggi",
            save_btn: "Salva",
            age_restricted_cat: "Questa categoria è disponibile solo per persone di 18 anni e oltre.",
            ok: "OK",
            video_studio: "Studio Video",
            dream_network: "Rete dei Sogni",
            privacy_link: "Privacy", terms_link: "Termini", imprint_link: "Note Legali", research_link: "Ricerca", studies_link: "Studi", worldmap_link: "Mappa Mondiale", showing_sources_only: "Mostrando solo fonti {0}", science_label: "Conoscenza",
        },
        processing: {
            title: "L'Oracolo lavora...",
            step_analyze: "Analisi dell'interpretazione del sogno",
            step_customer: "Considerazione del contesto cliente",
            step_no_customer: "Nessun contesto cliente disponibile",
            step_context: "Categorie e tradizioni in calcolo",
            step_no_context: "Nessuna tradizione specifica selezionata",
            step_image: "Generazione della visione",
            step_save: "Salvato nel calendario e nel profilo"
        },
        sub: {
            title: "Scegli il tuo livello",
            billing_monthly: "Mensile", billing_yearly: "Annuale",
            yearly_discount: "1 mese gratis!",
            smart_discount: "Per sviluppatori",
            free_title: "Gratuito",
            free_price: "0 €",
            free_features: ["Interpretazione base (con pubblicità)", "Accesso all'Offerwall per monete gratis", "Premium con monete", "Solo condivisione link"],
            silver_title: "Pro",
            silver_price: "4.99 € / month",
            silver_features: ["Senza pubblicità", "Conversione e download PDF illimitati", "Interpretazioni illimitate", "25 immagini HD/mese", "1x chat dal vivo settimanale", "Audio I/O"],
            gold_title: "Gold (VIP)",
            gold_price: "12.99 € / month",
            gold_trial_text: "7 giorni gratis, poi 12.99 €/mese",
            gold_features: ["Tutte le funzionalità Silver incluse", "Chat dal vivo illimitata con l'Oracolo", "5 video dei sogni/mese", "Sconto esclusivo sulle monete", "Supporto prioritario"],
            smart_title: "Smart (Sviluppatore)",
            smart_price: "49.99 € / year",
            smart_features: ["Porta la tua chiave (BYOK)", "Tutte le funzionalità Premium sbloccate", "Rotazione automatica provider", "Prezzo annuale fisso (29.99€)"],
            smart_info_title: "Cos'è il livello Smart Sviluppatore?",
            smart_info_text: "Per sviluppatori e appassionati di tecnologia: Crea account presso provider AI (es. Google AI Studio), genera le tue chiavi API lì e aggiungile all'app. In questo modo paghi solo i bassi costi API direttamente al provider + 3€ per l'uso dell'app.",
            upgrade: "Upgrade", current: "Attuale", unlock: "Sblocca", try_free: "PROVA GRATIS PER 7 GIORNI",
            ad_loading: "Caricamento annuncio...", ad_reward: "Monete guadagnate!",
            bronze_title: "Gratuito", bronze_features: ["3 interpretazioni/giorno", "Groq AI", "6 tradizioni", "Pubblicità"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["Interpretazioni illimitate", "Gemini AI", "Tutte le 9 tradizioni", "Senza pubblicità", "100 monete/mese", "10% sconto monete"], silver2_price_monthly: "€4.99 / mese", silver2_price_yearly: "€49.99 / anno",
            gold2_title: "Premium", gold2_features: ["Claude 6 prospettive", "500 monete/mese", "20% sconto monete", "Immagini HD", "5 video/mese", "Voce dal vivo", "Chat AI Premium"], gold2_price_monthly: "€14.99 / mese", gold2_price_yearly: "€149.99 / anno",
            
            pro_badge: "PIÙ POPOLARE", vip_badge: "ESCLUSIVO 👑",
        },
        earn: {
            title: "Guadagna monete",
            desc: "Completa attività per ricaricare il tuo saldo.",
            short_title: "Clip breve", short_desc: "10 secondi", short_reward: "1",
            long_title: "Video premium", long_desc: "2 minuti", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Sondaggi e attività", offer_reward: "5-10",
            offer_info: "Completa attività come sondaggi, test di app o registrazioni per premi elevati.",
            survey_task: "Sondaggio del brand", app_task: "Raggiungi il livello 5 nel gioco",
            watch_btn: "Guarda", start_btn: "Inizia"
        },
        shop: {
            title: "Negozio monete",
            desc: "Ricarica le tue scorte.",
            starter_label: "Starter", starter_price: "1.99 €", starter_amount: "100 monete",
            best_label: "Bestseller", best_price: "5.99 €", best_amount: "550 monete", best_badge: "Popolare",
            value_label: "Miglior valore", value_price: "12.99 €", value_amount: "1500 monete", value_badge: "Miglior valore",
            free_link: "Vuoi guadagnare monete gratis? Clicca qui.",
            buy_btn: "Acquista",
            wow_badge: "💎 Meno di 1 centesimo/moneta!",
            coins_label: "Monete",
            per_coin: "per moneta",
            pkg_starter: "Provalo", pkg_popular: "Popolare", pkg_value: "Più Valore", pkg_premium: "Risparmia", pkg_mega: "Utente Pro",
        },
        smart_guide: {
            step1_title: "Crea account", step1_desc: "Crea un account gratuito su Google AI Studio.",
            step2_title: "Genera chiave", step2_desc: "Copia la tua chiave API personale da lì.",
            step3_title: "Incolla nell'app", step3_desc: "Incolla la chiave qui per sbloccare Premium."
        }
    },
    [Language.PL]: {
        app_title: "Kod Snów | Dream Code",
        app_subtitle: "Cała wiedza ludzkości i superkomputer – w Twojej kieszeni",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Basra, Irak (VII w.)",
            [ReligiousSource.NABULSI]: "Damaszek, Syria (XVII w.)",
            [ReligiousSource.AL_ISKHAFI]: "Bagdad (Abbasydzi)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Tradycja arabska (Abjad)",
            [ReligiousSource.MEDIEVAL]: "Europa (Średniowiecze)",
            [ReligiousSource.MODERN_THEOLOGY]: "Teologia zachodnia",
            [ReligiousSource.CHURCH_FATHERS]: "Rzym i Bizancjum (Patrystyka)",
            [ReligiousSource.ZEN]: "Chiny i Japonia",
            [ReligiousSource.TIBETAN]: "Tybet (Himalaje)",
            [ReligiousSource.THERAVADA]: "Azja Południowo-Wschodnia (Kanon Palijski)",
            [ReligiousSource.FREUDIAN]: "Wiedeń (Psychoanaliza)",
            [ReligiousSource.JUNGIAN]: "Zurych (Psychologia analityczna)",
            [ReligiousSource.GESTALT]: "Berlin / Nowy Jork",
            [ReligiousSource.WESTERN_ZODIAC]: "Tradycja hellenistyczna",
            [ReligiousSource.VEDIC_ASTROLOGY]: "Indie (Dźjotisz)",
            [ReligiousSource.CHINESE_ZODIAC]: "Chiny (Kalendarz księżycowy)",
            [ReligiousSource.PYTHAGOREAN]: "Starożytna Grecja",
            [ReligiousSource.CHALDEAN]: "Babilon (Mezopotamia)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Mistycyzm żydowski (Hiszpania)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Indie (Wedy)",
            [ReligiousSource.IMAM_SADIQ]: "Tradycja szyicka, Persja",
            [ReligiousSource.ISLAMSKI_SONNIK]: "Rosyjsko-islamski",
            [ReligiousSource.ZHOU_GONG]: "Chiny, Interpretacja snów",
            [ReligiousSource.HATSUYUME]: "Japonia, Sen noworoczny",
            [ReligiousSource.SWAPNA_SHASTRA]: "Indie, Wedyjski/Hinduski",
            [ReligiousSource.EDGAR_CAYCE]: "USA, Śpiący prorok",
            [ReligiousSource.RUDOLF_STEINER]: "Antropozofia, Austria",
            [ReligiousSource.TALMUD_BERAKHOT]: "Babilonia, 55a-57b",
            [ReligiousSource.ZOHAR]: "Kabalistyczny, XIII w.",
            [ReligiousSource.VANGA]: "Bułgaria, XX w.",
            [ReligiousSource.MILLER_RU]: "Rosyjska interpretacja snów",
            [ReligiousSource.FREUD_RU]: "Rosyjska adaptacja Freuda",
            [ReligiousSource.LOFF]: "Rosyjski sennik",
            [ReligiousSource.NOSTRADAMUS_RU]: "Adaptacja rosyjska",
            [ReligiousSource.ARTEMIDOROS]: "Grecja, II w. n.e.",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "Egipt, ok. 1275 p.n.e.",
            [ReligiousSource.SOMNIALE_DANIELIS]: "Bizantyjsko-średniowieczny"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islamski', [ReligiousCategory.CHRISTIAN]: 'Chrześcijański', [ReligiousCategory.BUDDHIST]: 'Buddyjski', [ReligiousCategory.PSYCHOLOGICAL]: 'Psychologiczny', [ReligiousCategory.ASTROLOGY]: 'Astrologia', [ReligiousCategory.NUMEROLOGY]: 'Numerologia', [ReligiousCategory.JEWISH]: 'Żydowski', [ReligiousCategory.SONNIKS]: 'Senniki', [ReligiousCategory.ANCIENT]: 'Starożytny',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tybetański', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Średniowieczny', [ReligiousSource.MODERN_THEOLOGY]: 'Teologia nowożytna', [ReligiousSource.CHURCH_FATHERS]: 'Ojcowie Kościoła', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Zodiak zachodni', [ReligiousSource.VEDIC_ASTROLOGY]: 'Wedyjski', [ReligiousSource.CHINESE_ZODIAC]: 'Zodiak chiński', [ReligiousSource.PYTHAGOREAN]: 'Pitagorejski', [ReligiousSource.CHALDEAN]: 'Chaldejski', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabała', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Liczby wedyjskie', [ReligiousSource.IMAM_SADIQ]: 'Imam Sadiq', [ReligiousSource.ISLAMSKI_SONNIK]: 'Sennik islamski', [ReligiousSource.ZHOU_GONG]: 'Zhou Gong', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berakhot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artemidorus', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Papirus egipski', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Opisz swój sen...", interpret: "Interpretuj sen", choose_tradition: "Wybierz tradycję", refine_sources: "Doprecyzuj źródła", oracle_speaks: "Wyrocznia przemawia", close: "Zamknij", listening: "Słucham...", voices: "Głos",
            settings: "Ustawienia", text_size: "Rozmiar", dictation_error: "Błąd: Mikrofon niedostępny.", dictation_perm: "Odmowa dostępu.",
            calendar_btn: "Kalendarz i analiza", coming_soon: "Więcej...", calendar_desc: "Twój dziennik snów",
            profile_btn: "Twój profil", profile_desc: "Statystyki i Ja",
            hub_btn: "Centrum snów", hub_desc: "Sny społeczności",
            gen_image: "Generuj obraz", saved_msg: "Sen zapisany w kalendarzu!",
            watch_ad: "Zdobądź monety", generate_video: "Generuj wideo (Gold)", create_dream_video: "Film ze snu",
            video_btn_short: "📹 Generuj wideo", video_duration_short: "30s, 180 monet",
            slideshow_btn: "📽️ Utwórz pokaz", slideshow_duration: "30s, 180 monet",
            premium_btn: "Premium / Plan", premium_desc: "Ulepszenie i funkcje",
            customer_file_btn: "Plik kontekstu osobistego",
            theme: "Wygląd", mode: "Tryb", dark: "Ciemny", light: "Jasny",
            style: "Styl designu", style_def: "Domyślny (Mistyczny)", style_fem: "Kobiecy (Różowy)", style_masc: "Męski (Niebieski)", style_nature: "Natura (Zielony)",
            voice_char: "Charakter głosu", fem_char: "Postacie kobiece", male_char: "Postacie męskie", preview: "Podgląd",
            info_title: "Baza wiedzy", info_bio: "Biografia", info_origin: "Pochodzenie i tło",
            video_ready: "Twoje wideo ze snu jest gotowe!", video_gen: "Generowanie wideo...", video_error: "Generowanie nie powiodło się.",
            map_btn: "Kto miał ten sam sen?",
            api_manager: "Menedżer kluczy API (Poziom Smart)", api_desc: "Dodaj swoje klucze Gemini API. System automatycznie przełącza po osiągnięciu limitu.", add_key: "Dodaj klucz", no_keys: "Nie znaleziono kluczy.",
            quality_normal: "Normalny", quality_high: "Wysoka jakość",
            style_cartoon: "Kreskówka", style_anime: "Anime", style_real: "Realistyczny", style_fantasy: "Fantasy",
            choose_quality: "Wybierz jakość", choose_style: "Wybierz styl",
            choose_image_style: "Wybierz styl obrazu",
            choose_style_desc: "Wybierz jakość i styl dla obrazu ze snu",
            continue_without_image: "Kontynuuj bez generowania obrazu",
            step_quality: "1. Wybierz jakość",
            step_style: "2. Wybierz styl",
            continue: "Kontynuuj",
            social_proof_stats: "47 832 snów przeanalizowanych · 12 543 dopasowań snów znalezionych",
            social_proof_testimonial1: "\"W końcu rozumiem moje powtarzające się sny!\" - Anna, 28",
            social_proof_testimonial2: "\"Interpretacja z wielu perspektyw jest unikalna.\" - Michał, 34",
            social_proof_testimonial3: "\"Znalazłam kogoś z identycznym snem dzięki aplikacji!\" - Sara, 31",
            processing_context: "Uwzględnianie:",
            backup_title: "Sejf danych (Kopia zapasowa)",
            backup_desc: "Zabezpiecz swoje dane jako plik lub przywróć kopię zapasową.",
            export_btn: "Pobierz kopię zapasową",
            import_btn: "Przywróć kopię zapasową",
            home_label: "Strona główna",
            map_label: "Mapa",
            live_chat_label: "Czat na żywo",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5 monet bonus: Wideo z Twoim głosem!",
            audio_coin_desc: "Twoje nagranie zostało zapisane. Stwórz wideo ze snu z własnym głosem w Profilu i zdobądź 5 monet!",
            upload_audio: "Prześlij",
            upload_confirm_title: "Audio zapisane pomyślnie!",
            upload_confirm_desc: "Twoje nagranie audio zostało zapisane ze snem. Sprawdź w Profilu w sekcji 'Audio'!",
            got_it: "Rozumiem!",
            backup_restored: "Kopia zapasowa przywrócona pomyślnie!",
            backup_error: "Błąd przywracania kopii zapasowej. Nieprawidłowy plik.",
            storage_init: "Magazyn się inicjalizuje. Proszę czekać.",
            mic_denied_alert: "Odmowa dostępu do mikrofonu",
            min_dreams_required: "Potrzebujesz co najmniej 7 zinterpretowanych snów, aby korzystać z funkcji analizy.",
            base_version: "Wersja podstawowa",
            until_date: "Do:",
            audio_recorded: "Audio nagrane",
            audio_saved_with_dream: "Zostanie zapisane ze snem",
            remove: "Usuń",
            oracle_voice: "Głos Wyroczni",
            image_ready: "Obraz gotowy!",
            style_desc_cartoon: "Styl Pixar",
            style_desc_anime: "Styl Ghibli",
            style_desc_real: "Fotorealistyczny",
            style_desc_fantasy: "Magiczny",
            cosmic_dna: "Kosmiczne DNA",
            moon_sync: "Synchronizacja Księżyca",
            cosmic_dna_body: "Twoje Kosmiczne DNA to Twój unikalny odcisk palca snów — oparty na dacie urodzenia, znaku zodiaku i wzorcach snów.",
            cosmic_dna_coming: "Wkrótce",
            cosmic_dna_enter: "Wpisz datę urodzenia w profilu, aby obliczyć swoje Kosmiczne DNA.",
            moon_phase_label: "Faza księżyca",
            dream_meaning_today: "Znaczenie snu dziś",
            save_btn: "Zapisz",
            age_restricted_cat: "Ta kategoria jest dostępna tylko dla osób w wieku 18 lat i starszych.",
            ok: "OK",
            video_studio: "Studio Wideo",
            dream_network: "Sieć Snów",
            privacy_link: "Prywatność", terms_link: "Regulamin", imprint_link: "Impressum", research_link: "Badania", studies_link: "Studia", worldmap_link: "Mapa Świata", showing_sources_only: "Wyświetlanie tylko źródeł {0}", science_label: "Wiedza",
        },
        processing: {
            title: "Wyrocznia pracuje...",
            step_analyze: "Analiza interpretacji snu",
            step_customer: "Uwzględnianie kontekstu klienta",
            step_no_customer: "Brak kontekstu klienta",
            step_context: "Kategorie i tradycje są obliczane",
            step_no_context: "Nie wybrano konkretnych tradycji",
            step_image: "Generowanie wizji",
            step_save: "Zapisano w kalendarzu i profilu"
        },
        sub: {
            title: "Wybierz swój poziom",
            billing_monthly: "Miesięcznie", billing_yearly: "Rocznie",
            yearly_discount: "1 miesiąc gratis!",
            smart_discount: "Dla programistów",
            free_title: "Darmowy",
            free_price: "0 €",
            free_features: ["Podstawowa interpretacja (z reklamami)", "Dostęp do Offerwall po darmowe monety", "Premium za monety", "Tylko udostępnianie linków"],
            silver_title: "Pro",
            silver_price: "4.99 € / month",
            silver_features: ["Bez reklam", "Nieograniczona konwersja i pobieranie PDF", "Nieograniczone interpretacje", "25 obrazów HD/mies.", "1x czat na żywo tygodniowo", "Audio I/O"],
            gold_title: "Gold (VIP)",
            gold_price: "12.99 € / month",
            gold_trial_text: "7 dni za darmo, potem 12.99 €/mies.",
            gold_features: ["Wszystkie funkcje Silver w zestawie", "Nieograniczony czat z Wyrocznią", "5 filmów ze snów/mies.", "Ekskluzywny rabat na monety", "Priorytetowe wsparcie"],
            smart_title: "Smart (Programista)",
            smart_price: "49.99 € / year",
            smart_features: ["Przynieś swój klucz (BYOK)", "Wszystkie funkcje Premium odblokowane", "Automatyczna rotacja dostawcy", "Stała cena roczna (29.99€)"],
            smart_info_title: "Czym jest poziom Smart Programista?",
            smart_info_text: "Dla programistów i entuzjastów technologii: Załóż konta u dostawców AI (np. Google AI Studio), wygeneruj tam swoje klucze API i dodaj je do aplikacji. W ten sposób płacisz tylko niskie koszty API bezpośrednio dostawcy + 3€ za korzystanie z aplikacji.",
            upgrade: "Ulepsz", current: "Bieżący", unlock: "Odblokuj", try_free: "WYPRÓBUJ ZA DARMO PRZEZ 7 DNI",
            ad_loading: "Ładowanie reklamy...", ad_reward: "Monety zdobyte!",
            bronze_title: "Darmowy", bronze_features: ["3 interpretacje/dzień", "Groq AI", "6 tradycji", "Reklamy"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["Nieograniczone interpretacje", "Gemini AI", "Wszystkie 9 tradycji", "Bez reklam", "100 monet/mies.", "10% rabat na monety"], silver2_price_monthly: "€4.99 / mies.", silver2_price_yearly: "€49.99 / rok",
            gold2_title: "Premium", gold2_features: ["Claude 6 perspektyw", "500 monet/mies.", "20% rabat na monety", "Obrazy HD", "5 filmów/mies.", "Głos na żywo", "Czat AI Premium"], gold2_price_monthly: "€14.99 / mies.", gold2_price_yearly: "€149.99 / rok",
            
            pro_badge: "NAJPOPULARNIEJSZY", vip_badge: "EKSKLUZYWNY 👑",
        },
        earn: {
            title: "Zdobądź monety",
            desc: "Wykonuj zadania, aby doładować saldo.",
            short_title: "Krótki klip", short_desc: "10 sekund", short_reward: "1",
            long_title: "Film premium", long_desc: "2 minuty", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Ankiety i zadania", offer_reward: "5-10",
            offer_info: "Wykonuj zadania jak ankiety, testy aplikacji lub rejestracje za wysokie nagrody.",
            survey_task: "Ankieta marki", app_task: "Osiągnij poziom 5 w grze",
            watch_btn: "Oglądaj", start_btn: "Rozpocznij"
        },
        shop: {
            title: "Sklep z monetami",
            desc: "Uzupełnij swoje zapasy.",
            starter_label: "Starter", starter_price: "1.99 €", starter_amount: "100 monet",
            best_label: "Bestseller", best_price: "5.99 €", best_amount: "550 monet", best_badge: "Popularne",
            value_label: "Najlepsza wartość", value_price: "12.99 €", value_amount: "1500 monet", value_badge: "Najlepsza wartość",
            free_link: "Chcesz zdobyć darmowe monety? Kliknij tutaj.",
            buy_btn: "Kup",
            wow_badge: "💎 Poniżej 1 grosza/monetę!",
            coins_label: "Monety",
            per_coin: "za monetę",
            pkg_starter: "Wypróbuj", pkg_popular: "Popularny", pkg_value: "Więcej Wartości", pkg_premium: "Oszczędzaj", pkg_mega: "Zaawansowany",
        },
        smart_guide: {
            step1_title: "Utwórz konto", step1_desc: "Utwórz darmowe konto w Google AI Studio.",
            step2_title: "Wygeneruj klucz", step2_desc: "Skopiuj swój osobisty klucz API stamtąd.",
            step3_title: "Wklej w aplikacji", step3_desc: "Wklej klucz tutaj, aby odblokować Premium."
        }
    },
    [Language.BN]: {
        app_title: "স্বপ্ন কোড | Dream Code",
        app_subtitle: "মানবজাতির সমস্ত জ্ঞান এবং একটি সুপারকম্পিউটার – আপনার পকেটে",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "বসরা, ইরাক (৭ম শতক)",
            [ReligiousSource.NABULSI]: "দামেস্ক, সিরিয়া (১৭শ শতক)",
            [ReligiousSource.AL_ISKHAFI]: "বাগদাদ (আব্বাসীয়)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "আরব ঐতিহ্য (আবজাদ)",
            [ReligiousSource.MEDIEVAL]: "ইউরোপ (মধ্যযুগ)",
            [ReligiousSource.MODERN_THEOLOGY]: "পশ্চিমা ধর্মতত্ত্ব",
            [ReligiousSource.CHURCH_FATHERS]: "রোম ও বাইজান্টিয়াম (পিতৃতত্ত্ব)",
            [ReligiousSource.ZEN]: "চীন ও জাপান",
            [ReligiousSource.TIBETAN]: "তিব্বত (হিমালয়)",
            [ReligiousSource.THERAVADA]: "দক্ষিণ-পূর্ব এশিয়া (পালি গ্রন্থ)",
            [ReligiousSource.FREUDIAN]: "ভিয়েনা (মনোবিশ্লেষণ)",
            [ReligiousSource.JUNGIAN]: "জুরিখ (বিশ্লেষণাত্মক মনোবিদ্যা)",
            [ReligiousSource.GESTALT]: "বার্লিন / নিউ ইয়র্ক",
            [ReligiousSource.WESTERN_ZODIAC]: "হেলেনিস্টিক ঐতিহ্য",
            [ReligiousSource.VEDIC_ASTROLOGY]: "ভারত (জ্যোতিষ)",
            [ReligiousSource.CHINESE_ZODIAC]: "চীন (চান্দ্র পঞ্জিকা)",
            [ReligiousSource.PYTHAGOREAN]: "প্রাচীন গ্রিস",
            [ReligiousSource.CHALDEAN]: "ব্যাবিলন (মেসোপটেমিয়া)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "ইহুদি রহস্যবাদ (স্পেন)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "ভারত (বেদ)",
            [ReligiousSource.IMAM_SADIQ]: "শিয়া ঐতিহ্য, পারস্য",
            [ReligiousSource.ISLAMSKI_SONNIK]: "রুশ-ইসলামি",
            [ReligiousSource.ZHOU_GONG]: "চীন, স্বপ্নের ব্যাখ্যা",
            [ReligiousSource.HATSUYUME]: "জাপান, নববর্ষের স্বপ্ন",
            [ReligiousSource.SWAPNA_SHASTRA]: "ভারত, বৈদিক/হিন্দু",
            [ReligiousSource.EDGAR_CAYCE]: "মার্কিন যুক্তরাষ্ট্র, ঘুমন্ত নবী",
            [ReligiousSource.RUDOLF_STEINER]: "অ্যান্থ্রোপোসফি, অস্ট্রিয়া",
            [ReligiousSource.TALMUD_BERAKHOT]: "ব্যাবিলনিয়া, ৫৫ক-৫৭খ",
            [ReligiousSource.ZOHAR]: "কাবালাবাদী, ১৩শ শতক",
            [ReligiousSource.VANGA]: "বুলগেরিয়া, ২০শ শতক",
            [ReligiousSource.MILLER_RU]: "রুশ স্বপ্ন ব্যাখ্যা",
            [ReligiousSource.FREUD_RU]: "ফ্রয়েডের রুশ অভিযোজন",
            [ReligiousSource.LOFF]: "রুশ স্বপ্নের বই",
            [ReligiousSource.NOSTRADAMUS_RU]: "রুশ অভিযোজন",
            [ReligiousSource.ARTEMIDOROS]: "গ্রিস, ২য় শতক খ্রি.",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "মিশর, আনু. ১২৭৫ খ্রি.পূ.",
            [ReligiousSource.SOMNIALE_DANIELIS]: "বাইজান্টাইন-মধ্যযুগীয়"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'ইসলামি', [ReligiousCategory.CHRISTIAN]: 'খ্রিস্টান', [ReligiousCategory.BUDDHIST]: 'বৌদ্ধ', [ReligiousCategory.PSYCHOLOGICAL]: 'মনোবৈজ্ঞানিক', [ReligiousCategory.ASTROLOGY]: 'জ্যোতিষশাস্ত্র', [ReligiousCategory.NUMEROLOGY]: 'সংখ্যাতত্ত্ব', [ReligiousCategory.JEWISH]: 'ইহুদি', [ReligiousCategory.SONNIKS]: 'স্বপ্নের বই', [ReligiousCategory.ANCIENT]: 'প্রাচীন',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'তিব্বতীয়', [ReligiousSource.IBN_SIRIN]: 'ইবনে সিরিন', [ReligiousSource.NABULSI]: 'আন-নাবুলসি', [ReligiousSource.AL_ISKHAFI]: 'আল-ইসখাফি', [ReligiousSource.MEDIEVAL]: 'মধ্যযুগীয়', [ReligiousSource.MODERN_THEOLOGY]: 'আধুনিক ধর্মতত্ত্ব', [ReligiousSource.CHURCH_FATHERS]: 'চার্চ পিতৃগণ', [ReligiousSource.ZEN]: 'জেন', [ReligiousSource.THERAVADA]: 'থেরবাদ', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'পশ্চিমা রাশিচক্র', [ReligiousSource.VEDIC_ASTROLOGY]: 'বৈদিক', [ReligiousSource.CHINESE_ZODIAC]: 'চীনা রাশিচক্র', [ReligiousSource.PYTHAGOREAN]: 'পিথাগোরীয়', [ReligiousSource.CHALDEAN]: 'ক্যালডীয়', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'কাবালা', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'আবজাদ', [ReligiousSource.VEDIC_NUMEROLOGY]: 'বৈদিক সংখ্যা', [ReligiousSource.IMAM_SADIQ]: 'ইমাম সাদিক', [ReligiousSource.ISLAMSKI_SONNIK]: 'ইসলামি সন্নিক', [ReligiousSource.ZHOU_GONG]: 'ঝোউ গং', [ReligiousSource.HATSUYUME]: 'হাৎসুইউমে', [ReligiousSource.SWAPNA_SHASTRA]: 'স্বপ্ন শাস্ত্র', [ReligiousSource.EDGAR_CAYCE]: 'এডগার কেইসি', [ReligiousSource.RUDOLF_STEINER]: 'রুডলফ স্টাইনার', [ReligiousSource.TALMUD_BERAKHOT]: 'তালমুদ বেরাখোত', [ReligiousSource.ZOHAR]: 'জোহার', [ReligiousSource.VANGA]: 'ভাঙ্গা', [ReligiousSource.MILLER_RU]: 'মিলার', [ReligiousSource.FREUD_RU]: 'ফ্রয়েড (RU)', [ReligiousSource.LOFF]: 'লফ', [ReligiousSource.NOSTRADAMUS_RU]: 'নস্ত্রাদামুস', [ReligiousSource.ARTEMIDOROS]: 'আর্টেমিডোরাস', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'মিশরীয় প্যাপিরাস', [ReligiousSource.SOMNIALE_DANIELIS]: 'সোমনিয়ালে দানিয়েলিস'
        },
        ui: {
            placeholder: "আপনার স্বপ্ন বর্ণনা করুন...", interpret: "স্বপ্নের ব্যাখ্যা", choose_tradition: "ঐতিহ্য নির্বাচন", refine_sources: "উৎস পরিমার্জন", oracle_speaks: "ওরাকল বলছে", close: "বন্ধ", listening: "শুনছি...", voices: "কণ্ঠ",
            settings: "সেটিংস", text_size: "আকার", dictation_error: "ত্রুটি: মাইক্রোফোন অনুপলব্ধ।", dictation_perm: "অনুমতি প্রত্যাখ্যাত।",
            calendar_btn: "ক্যালেন্ডার ও বিশ্লেষণ", coming_soon: "আরো...", calendar_desc: "আপনার স্বপ্নের ডায়েরি",
            profile_btn: "আপনার প্রোফাইল", profile_desc: "পরিসংখ্যান ও আমি",
            hub_btn: "স্বপ্ন হাব", hub_desc: "সম্প্রদায়ের স্বপ্ন",
            gen_image: "ছবি তৈরি", saved_msg: "স্বপ্ন ক্যালেন্ডারে সংরক্ষিত!",
            watch_ad: "কয়েন উপার্জন", generate_video: "ভিডিও তৈরি (গোল্ড)", create_dream_video: "স্বপ্ন ভিডিও",
            video_btn_short: "📹 ভিডিও তৈরি", video_duration_short: "৩০সে, ১৮০ কয়েন",
            slideshow_btn: "📽️ স্লাইডশো তৈরি", slideshow_duration: "৩০সে, ১৮০ কয়েন",
            premium_btn: "প্রিমিয়াম / প্ল্যান", premium_desc: "আপগ্রেড ও বৈশিষ্ট্য",
            customer_file_btn: "ব্যক্তিগত প্রসঙ্গ ফাইল",
            theme: "থিম", mode: "মোড", dark: "গাঢ়", light: "হালকা",
            style: "ডিজাইন স্টাইল", style_def: "ডিফল্ট (রহস্যময়)", style_fem: "মেয়েলি (গোলাপ)", style_masc: "পুরুষালি (নীল)", style_nature: "প্রকৃতি (সবুজ)",
            voice_char: "কণ্ঠ চরিত্র", fem_char: "মহিলা চরিত্র", male_char: "পুরুষ চরিত্র", preview: "প্রিভিউ",
            info_title: "জ্ঞানভান্ডার", info_bio: "জীবনী", info_origin: "উৎপত্তি ও পটভূমি",
            video_ready: "আপনার স্বপ্নের ভিডিও প্রস্তুত!", video_gen: "ভিডিও তৈরি হচ্ছে...", video_error: "তৈরি ব্যর্থ হয়েছে।",
            map_btn: "কে একই স্বপ্ন দেখেছে?",
            api_manager: "API কী ম্যানেজার (স্মার্ট টিয়ার)", api_desc: "আপনার Gemini API কী যোগ করুন। সীমা পৌঁছালে সিস্টেম স্বয়ংক্রিয়ভাবে পরিবর্তন করে।", add_key: "কী যোগ করুন", no_keys: "কোনো কী পাওয়া যায়নি।",
            quality_normal: "সাধারণ", quality_high: "উচ্চ মানের",
            style_cartoon: "কার্টুন", style_anime: "অ্যানিমে", style_real: "বাস্তব", style_fantasy: "ফ্যান্টাসি",
            choose_quality: "মান নির্বাচন", choose_style: "স্টাইল নির্বাচন",
            choose_image_style: "ছবির স্টাইল নির্বাচন",
            choose_style_desc: "আপনার স্বপ্নের ছবির জন্য মান ও স্টাইল নির্বাচন করুন",
            continue_without_image: "ছবি তৈরি ছাড়া চালিয়ে যান",
            step_quality: "১. মান নির্বাচন",
            step_style: "২. স্টাইল নির্বাচন",
            continue: "চালিয়ে যান",
            social_proof_stats: "৪৭,৮৩২টি স্বপ্ন বিশ্লেষিত · ১২,৫৪৩টি স্বপ্নের মিল পাওয়া গেছে",
            social_proof_testimonial1: "\"অবশেষে আমার বারবার আসা স্বপ্নগুলো বুঝতে পেরেছি!\" - আনা, ২৮",
            social_proof_testimonial2: "\"বহু-দৃষ্টিকোণ ব্যাখ্যা অনন্য।\" - মাইকেল, ৩৪",
            social_proof_testimonial3: "\"অ্যাপের মাধ্যমে একই স্বপ্নের কাউকে খুঁজে পেয়েছি!\" - সারা, ৩১",
            processing_context: "বিবেচনায়:",
            backup_title: "ডেটা ভল্ট (ব্যাকআপ)",
            backup_desc: "আপনার ডেটা ফাইল হিসেবে সুরক্ষিত করুন বা ব্যাকআপ পুনরুদ্ধার করুন।",
            export_btn: "ব্যাকআপ ডাউনলোড",
            import_btn: "ব্যাকআপ পুনরুদ্ধার",
            home_label: "হোম",
            map_label: "মানচিত্র",
            live_chat_label: "লাইভ চ্যাট",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +৫ কয়েন বোনাস: আপনার কণ্ঠে ভিডিও!",
            audio_coin_desc: "আপনার রেকর্ডিং সংরক্ষিত হয়েছে। প্রোফাইলে নিজের কণ্ঠে স্বপ্নের ভিডিও তৈরি করুন এবং ৫ কয়েন পান!",
            upload_audio: "আপলোড",
            upload_confirm_title: "অডিও সফলভাবে সংরক্ষিত!",
            upload_confirm_desc: "আপনার অডিও রেকর্ডিং স্বপ্নের সাথে সংরক্ষিত হয়েছে। প্রোফাইলে 'অডিও' অংশে দেখুন!",
            got_it: "বুঝেছি!",
            backup_restored: "ব্যাকআপ সফলভাবে পুনরুদ্ধার হয়েছে!",
            backup_error: "ব্যাকআপ পুনরুদ্ধারে ত্রুটি। অবৈধ ফাইল।",
            storage_init: "স্টোরেজ আরম্ভ হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।",
            mic_denied_alert: "মাইক্রোফোন অ্যাক্সেস প্রত্যাখ্যাত",
            min_dreams_required: "বিশ্লেষণ বৈশিষ্ট্য ব্যবহার করতে কমপক্ষে ৭টি ব্যাখ্যাকৃত স্বপ্ন প্রয়োজন।",
            base_version: "বেসিক সংস্করণ",
            until_date: "পর্যন্ত:",
            audio_recorded: "অডিও রেকর্ড হয়েছে",
            audio_saved_with_dream: "স্বপ্নের সাথে সংরক্ষিত হবে",
            remove: "সরান",
            oracle_voice: "ওরাকলের কণ্ঠ",
            image_ready: "ছবি প্রস্তুত!",
            style_desc_cartoon: "Pixar স্টাইল",
            style_desc_anime: "Ghibli স্টাইল",
            style_desc_real: "ফটোরিয়ালিস্টিক",
            style_desc_fantasy: "জাদুকরী",
            cosmic_dna: "কসমিক DNA",
            moon_sync: "চাঁদ সিঙ্ক",
            cosmic_dna_body: "আপনার কসমিক DNA আপনার অনন্য স্বপ্ন আঙুলের ছাপ — জন্ম তারিখ, রাশিচক্র এবং স্বপ্নের ধরণের উপর ভিত্তি করে।",
            cosmic_dna_coming: "শীঘ্রই আসছে",
            cosmic_dna_enter: "আপনার কসমিক DNA গণনা করতে প্রোফাইলে জন্ম তারিখ লিখুন।",
            moon_phase_label: "চাঁদের পর্যায়",
            dream_meaning_today: "আজকের স্বপ্নের অর্থ",
            save_btn: "সংরক্ষণ",
            age_restricted_cat: "এই বিভাগটি শুধুমাত্র ১৮ বছর বা তার বেশি বয়সের ব্যক্তিদের জন্য উপলব্ধ।",
            ok: "ঠিক আছে",
            video_studio: "ভিডিও স্টুডিও",
            dream_network: "স্বপ্ন নেটওয়ার্ক",
            privacy_link: "গোপনীয়তা", terms_link: "শর্তাবলী", imprint_link: "ইমপ্রিন্ট", research_link: "গবেষণা", studies_link: "গবেষণা", worldmap_link: "বিশ্ব মানচিত্র", showing_sources_only: "শুধুমাত্র {0} উৎস দেখানো হচ্ছে", science_label: "জ্ঞান",
        },
        processing: {
            title: "ওরাকল কাজ করছে...",
            step_analyze: "স্বপ্নের ব্যাখ্যা বিশ্লেষণ",
            step_customer: "গ্রাহক প্রসঙ্গ বিবেচনা",
            step_no_customer: "কোনো গ্রাহক প্রসঙ্গ নেই",
            step_context: "বিভাগ ও ঐতিহ্য গণনা হচ্ছে",
            step_no_context: "কোনো নির্দিষ্ট ঐতিহ্য নির্বাচিত নয়",
            step_image: "দর্শন তৈরি হচ্ছে",
            step_save: "ক্যালেন্ডার ও প্রোফাইলে সংরক্ষিত"
        },
        sub: {
            title: "আপনার টিয়ার নির্বাচন করুন",
            billing_monthly: "মাসিক", billing_yearly: "বার্ষিক",
            yearly_discount: "১ মাস বিনামূল্যে!",
            smart_discount: "ডেভেলপারদের জন্য",
            free_title: "বিনামূল্যে",
            free_price: "0 €",
            free_features: ["বেসিক ব্যাখ্যা (বিজ্ঞাপন সহ)", "বিনামূল্যে কয়েনের জন্য অফারওয়াল", "কয়েন দিয়ে প্রিমিয়াম", "শুধু লিংক শেয়ারিং"],
            silver_title: "প্রো",
            silver_price: "4.99 € / month",
            silver_features: ["বিজ্ঞাপন মুক্ত", "সীমাহীন PDF রূপান্তর ও ডাউনলোড", "সীমাহীন ব্যাখ্যা", "২৫টি HD ছবি/মাস", "সাপ্তাহিক ১x লাইভ চ্যাট", "অডিও I/O"],
            gold_title: "গোল্ড (VIP)",
            gold_price: "12.99 € / month",
            gold_trial_text: "৭ দিন বিনামূল্যে, তারপর 12.99 €/মাস",
            gold_features: ["সকল সিলভার বৈশিষ্ট্য অন্তর্ভুক্ত", "সীমাহীন লাইভ ওরাকল চ্যাট", "৫টি স্বপ্নের ভিডিও/মাস", "একচেটিয়া কয়েন ছাড়", "অগ্রাধিকার সাপোর্ট"],
            smart_title: "স্মার্ট (ডেভেলপার)",
            smart_price: "49.99 € / year",
            smart_features: ["নিজের কী আনুন (BYOK)", "সকল প্রিমিয়াম বৈশিষ্ট্য আনলক", "স্বয়ংক্রিয় প্রোভাইডার রোটেশন", "নির্দিষ্ট বার্ষিক মূল্য (29.99€)"],
            smart_info_title: "স্মার্ট ডেভেলপার টিয়ার কী?",
            smart_info_text: "ডেভেলপার ও প্রযুক্তি উৎসাহীদের জন্য: AI প্রোভাইডারে অ্যাকাউন্ট তৈরি করুন (যেমন Google AI Studio), সেখানে আপনার API কী তৈরি করুন এবং অ্যাপে যোগ করুন। এভাবে আপনি শুধু কম API খরচ সরাসরি প্রোভাইডারকে দেন + অ্যাপ ব্যবহারের জন্য ৩€।",
            upgrade: "আপগ্রেড", current: "বর্তমান", unlock: "আনলক", try_free: "৭ দিন বিনামূল্যে ট্রায়াল",
            ad_loading: "বিজ্ঞাপন লোড হচ্ছে...", ad_reward: "কয়েন অর্জিত!",
            bronze_title: "বিনামূল্যে", bronze_features: ["৩ ব্যাখ্যা/দিন", "Groq AI", "৬ ঐতিহ্য", "বিজ্ঞাপন"], bronze_price: "€0",
            silver2_title: "প্রো", silver2_features: ["সীমাহীন ব্যাখ্যা", "Gemini AI", "সকল ৯ ঐতিহ্য", "বিজ্ঞাপন মুক্ত", "১০০ কয়েন/মাস", "১০% কয়েন ছাড়"], silver2_price_monthly: "€4.99 / মাস", silver2_price_yearly: "€49.99 / বছর",
            gold2_title: "প্রিমিয়াম", gold2_features: ["Claude ৬ দৃষ্টিকোণ", "৫০০ কয়েন/মাস", "২০% কয়েন ছাড়", "HD ছবি", "৫ ভিডিও/মাস", "লাইভ ভয়েস", "প্রিমিয়াম AI চ্যাট"], gold2_price_monthly: "€14.99 / মাস", gold2_price_yearly: "€149.99 / বছর",
            
            pro_badge: "সবচেয়ে জনপ্রিয়", vip_badge: "এক্সক্লুসিভ 👑",
        },
        earn: {
            title: "কয়েন উপার্জন করুন",
            desc: "ব্যালেন্স বাড়াতে কাজ সম্পন্ন করুন।",
            short_title: "ছোট ক্লিপ", short_desc: "১০ সেকেন্ড", short_reward: "1",
            long_title: "প্রিমিয়াম ভিডিও", long_desc: "২ মিনিট", long_reward: "3",
            offer_title: "অফারওয়াল", offer_desc: "সার্ভে ও কাজ", offer_reward: "5-10",
            offer_info: "সার্ভে, অ্যাপ টেস্ট বা সাইন-আপের মতো কাজ সম্পন্ন করে উচ্চ পুরস্কার পান।",
            survey_task: "ব্র্যান্ড সার্ভে", app_task: "গেমে লেভেল ৫ অর্জন করুন",
            watch_btn: "দেখুন", start_btn: "শুরু"
        },
        shop: {
            title: "কয়েন শপ",
            desc: "আপনার সরবরাহ পূরণ করুন।",
            starter_label: "স্টার্টার", starter_price: "1.99 €", starter_amount: "১০০ কয়েন",
            best_label: "বেস্টসেলার", best_price: "5.99 €", best_amount: "৫৫০ কয়েন", best_badge: "জনপ্রিয়",
            value_label: "সেরা মূল্য", value_price: "12.99 €", value_amount: "১৫০০ কয়েন", value_badge: "সেরা মূল্য",
            free_link: "বিনামূল্যে কয়েন পেতে চান? এখানে ক্লিক করুন।",
            buy_btn: "কিনুন",
            wow_badge: "💎 প্রতি কয়েনে ১ সেন্টের কম!",
            coins_label: "কয়েন",
            per_coin: "প্রতি কয়েন",
            pkg_starter: "চেষ্টা করুন", pkg_popular: "জনপ্রিয়", pkg_value: "বেশি মূল্য", pkg_premium: "বেশি সঞ্চয়", pkg_mega: "পাওয়ার ইউজার",
        },
        smart_guide: {
            step1_title: "অ্যাকাউন্ট তৈরি", step1_desc: "Google AI Studio-তে বিনামূল্যে অ্যাকাউন্ট তৈরি করুন।",
            step2_title: "কী তৈরি", step2_desc: "সেখানে আপনার ব্যক্তিগত API কী কপি করুন।",
            step3_title: "অ্যাপে পেস্ট", step3_desc: "প্রিমিয়াম আনলক করতে এখানে কী পেস্ট করুন।"
        }
    },
    [Language.UR]: {
        app_title: "خواب کا کوڈ | Dream Code",
        app_subtitle: "انسانیت کا تمام علم اور ایک سپر کمپیوٹر – آپ کی جیب میں",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "بصرہ، عراق (ساتویں صدی)",
            [ReligiousSource.NABULSI]: "دمشق، شام (سترھویں صدی)",
            [ReligiousSource.AL_ISKHAFI]: "بغداد (عباسی)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "عربی روایت (ابجد)",
            [ReligiousSource.MEDIEVAL]: "یورپ (قرون وسطیٰ)",
            [ReligiousSource.MODERN_THEOLOGY]: "مغربی الٰہیات",
            [ReligiousSource.CHURCH_FATHERS]: "روم اور بازنطین (آباءِ کلیسا)",
            [ReligiousSource.ZEN]: "چین اور جاپان",
            [ReligiousSource.TIBETAN]: "تبت (ہمالیہ)",
            [ReligiousSource.THERAVADA]: "جنوب مشرقی ایشیا (پالی کینن)",
            [ReligiousSource.FREUDIAN]: "ویانا (نفسیاتی تجزیہ)",
            [ReligiousSource.JUNGIAN]: "زیورخ (تجزیاتی نفسیات)",
            [ReligiousSource.GESTALT]: "برلن / نیویارک",
            [ReligiousSource.WESTERN_ZODIAC]: "ہیلینسٹک روایت",
            [ReligiousSource.VEDIC_ASTROLOGY]: "ہندوستان (جیوتش)",
            [ReligiousSource.CHINESE_ZODIAC]: "چین (قمری تقویم)",
            [ReligiousSource.PYTHAGOREAN]: "قدیم یونان",
            [ReligiousSource.CHALDEAN]: "بابل (میسوپوٹیمیا)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "یہودی تصوف (اسپین)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "ہندوستان (وید)",
            [ReligiousSource.IMAM_SADIQ]: "شیعہ روایت، فارس",
            [ReligiousSource.ISLAMSKI_SONNIK]: "روسی-اسلامی",
            [ReligiousSource.ZHOU_GONG]: "چین، خوابوں کی تعبیر",
            [ReligiousSource.HATSUYUME]: "جاپان، نئے سال کا خواب",
            [ReligiousSource.SWAPNA_SHASTRA]: "ہندوستان، ویدک/ہندو",
            [ReligiousSource.EDGAR_CAYCE]: "امریکہ، سوتا ہوا نبی",
            [ReligiousSource.RUDOLF_STEINER]: "اینتھروپوسوفی، آسٹریا",
            [ReligiousSource.TALMUD_BERAKHOT]: "بابل، ۵۵الف-۵۷ب",
            [ReligiousSource.ZOHAR]: "قبالائی، ۱۳ویں صدی",
            [ReligiousSource.VANGA]: "بلغاریہ، ۲۰ویں صدی",
            [ReligiousSource.MILLER_RU]: "روسی خوابوں کی تعبیر",
            [ReligiousSource.FREUD_RU]: "فرائڈ کا روسی اقتباس",
            [ReligiousSource.LOFF]: "روسی خوابوں کی کتاب",
            [ReligiousSource.NOSTRADAMUS_RU]: "روسی اقتباس",
            [ReligiousSource.ARTEMIDOROS]: "یونان، دوسری صدی عیسوی",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "مصر، تقریباً ۱۲۷۵ ق م",
            [ReligiousSource.SOMNIALE_DANIELIS]: "بازنطینی-قرون وسطائی"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'اسلامی', [ReligiousCategory.CHRISTIAN]: 'عیسائی', [ReligiousCategory.BUDDHIST]: 'بدھ مت', [ReligiousCategory.PSYCHOLOGICAL]: 'نفسیاتی', [ReligiousCategory.ASTROLOGY]: 'علم نجوم', [ReligiousCategory.NUMEROLOGY]: 'علم الاعداد', [ReligiousCategory.JEWISH]: 'یہودی', [ReligiousCategory.SONNIKS]: 'خوابوں کی کتابیں', [ReligiousCategory.ANCIENT]: 'قدیم',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'تبتی', [ReligiousSource.IBN_SIRIN]: 'ابن سیرین', [ReligiousSource.NABULSI]: 'النابلسی', [ReligiousSource.AL_ISKHAFI]: 'الاسخافی', [ReligiousSource.MEDIEVAL]: 'قرون وسطائی', [ReligiousSource.MODERN_THEOLOGY]: 'جدید الٰہیات', [ReligiousSource.CHURCH_FATHERS]: 'آباءِ کلیسا', [ReligiousSource.ZEN]: 'زین', [ReligiousSource.THERAVADA]: 'تھیراوادا', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'مغربی زائچہ', [ReligiousSource.VEDIC_ASTROLOGY]: 'ویدک', [ReligiousSource.CHINESE_ZODIAC]: 'چینی زائچہ', [ReligiousSource.PYTHAGOREAN]: 'فیثاغورثی', [ReligiousSource.CHALDEAN]: 'کلدانی', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'قبالہ', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'ابجد', [ReligiousSource.VEDIC_NUMEROLOGY]: 'ویدک اعداد', [ReligiousSource.IMAM_SADIQ]: 'امام صادق', [ReligiousSource.ISLAMSKI_SONNIK]: 'اسلامی سنّک', [ReligiousSource.ZHOU_GONG]: 'ژو گونگ', [ReligiousSource.HATSUYUME]: 'ہاتسویومے', [ReligiousSource.SWAPNA_SHASTRA]: 'سواپنا شاسترا', [ReligiousSource.EDGAR_CAYCE]: 'ایڈگر کیسی', [ReligiousSource.RUDOLF_STEINER]: 'روڈولف اشٹائنر', [ReligiousSource.TALMUD_BERAKHOT]: 'تلمود براخوت', [ReligiousSource.ZOHAR]: 'زوہار', [ReligiousSource.VANGA]: 'وانگا', [ReligiousSource.MILLER_RU]: 'ملر', [ReligiousSource.FREUD_RU]: 'فرائیڈ (RU)', [ReligiousSource.LOFF]: 'لوف', [ReligiousSource.NOSTRADAMUS_RU]: 'نوسٹراداموس', [ReligiousSource.ARTEMIDOROS]: 'آرٹیمیڈورس', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'مصری پیپرس', [ReligiousSource.SOMNIALE_DANIELIS]: 'سومنیالے دانیئلس'
        },
        ui: {
            placeholder: "اپنا خواب بیان کریں...", interpret: "خواب کی تعبیر", choose_tradition: "روایت منتخب کریں", refine_sources: "ذرائع کو بہتر کریں", oracle_speaks: "اوریکل بولتا ہے", close: "بند کریں", listening: "سن رہا ہے...", voices: "آواز",
            settings: "ترتیبات", text_size: "سائز", dictation_error: "خرابی: مائیکروفون دستیاب نہیں۔", dictation_perm: "اجازت سے انکار۔",
            calendar_btn: "کیلنڈر اور تجزیہ", coming_soon: "مزید...", calendar_desc: "آپ کی خوابوں کی ڈائری",
            profile_btn: "آپ کا پروفائل", profile_desc: "اعدادوشمار اور میں",
            hub_btn: "خوابوں کا مرکز", hub_desc: "کمیونٹی کے خواب",
            gen_image: "تصویر بنائیں", saved_msg: "خواب کیلنڈر میں محفوظ ہو گیا!",
            watch_ad: "سکے کمائیں", generate_video: "ویڈیو بنائیں (گولڈ)", create_dream_video: "خواب ویڈیو",
            video_btn_short: "📹 ویڈیو بنائیں", video_duration_short: "۳۰ سیکنڈ، ۱۸۰ سکے",
            slideshow_btn: "📽️ سلائیڈشو بنائیں", slideshow_duration: "۳۰ سیکنڈ، ۱۸۰ سکے",
            premium_btn: "پریمیم / پلان", premium_desc: "اپ گریڈ اور فیچرز",
            customer_file_btn: "ذاتی سیاق و سباق فائل",
            theme: "ظاہری شکل", mode: "موڈ", dark: "ڈارک", light: "لائٹ",
            style: "ڈیزائن اسٹائل", style_def: "ڈیفالٹ (صوفیانہ)", style_fem: "نسوانی (گلابی)", style_masc: "مردانہ (نیلا)", style_nature: "فطرت (سبز)",
            voice_char: "آواز کا کردار", fem_char: "خاتون کردار", male_char: "مرد کردار", preview: "پیش نظارہ",
            info_title: "علمی ذخیرہ", info_bio: "سوانح حیات", info_origin: "اصل اور پس منظر",
            video_ready: "آپ کی خوابوں کی ویڈیو تیار ہے!", video_gen: "ویڈیو بنائی جا رہی ہے...", video_error: "بنانا ناکام ہو گیا۔",
            map_btn: "کس نے یہی خواب دیکھا؟",
            api_manager: "API کلید مینیجر (سمارٹ ٹیئر)", api_desc: "اپنی Gemini API کلیدیں شامل کریں۔ حد پوری ہونے پر سسٹم خودکار تبدیل ہو جاتا ہے۔", add_key: "کلید شامل کریں", no_keys: "کوئی کلید نہیں ملی۔",
            quality_normal: "عام", quality_high: "اعلیٰ معیار",
            style_cartoon: "کارٹون", style_anime: "اینیمے", style_real: "حقیقی", style_fantasy: "فینٹسی",
            choose_quality: "معیار منتخب کریں", choose_style: "اسٹائل منتخب کریں",
            choose_image_style: "تصویر کا اسٹائل منتخب کریں",
            choose_style_desc: "اپنی خوابوں کی تصویر کے لیے معیار اور اسٹائل منتخب کریں",
            continue_without_image: "تصویر بنائے بغیر جاری رکھیں",
            step_quality: "۱. معیار منتخب کریں",
            step_style: "۲. اسٹائل منتخب کریں",
            continue: "جاری رکھیں",
            social_proof_stats: "۴۷,۸۳۲ خوابوں کا تجزیہ · ۱۲,۵۴۳ خوابوں کے مماثل پائے گئے",
            social_proof_testimonial1: "\"آخرکار میرے بار بار آنے والے خواب سمجھ آئے!\" - عائشہ، ۲۸",
            social_proof_testimonial2: "\"کئی نقطہ نظر سے تعبیر منفرد ہے۔\" - احمد، ۳۴",
            social_proof_testimonial3: "\"ایپ سے ایسا شخص ملا جس نے بالکل وہی خواب دیکھا!\" - سارہ، ۳۱",
            processing_context: "غور میں:",
            backup_title: "ڈیٹا والٹ (بیک اپ)",
            backup_desc: "اپنا ڈیٹا فائل کے طور پر محفوظ کریں یا بیک اپ بحال کریں۔",
            export_btn: "بیک اپ ڈاؤنلوڈ",
            import_btn: "بیک اپ بحال کریں",
            home_label: "ہوم",
            map_label: "نقشہ",
            live_chat_label: "لائیو چیٹ",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +۵ سکے بونس: آپ کی آواز میں ویڈیو!",
            audio_coin_desc: "آپ کی ریکارڈنگ محفوظ ہو گئی۔ پروفائل میں اپنی آواز سے خواب کی ویڈیو بنائیں اور ۵ سکے کمائیں!",
            upload_audio: "اپلوڈ",
            upload_confirm_title: "آڈیو کامیابی سے محفوظ!",
            upload_confirm_desc: "آپ کی آڈیو ریکارڈنگ خواب کے ساتھ محفوظ ہو گئی۔ پروفائل میں 'آڈیو' سیکشن میں دیکھیں!",
            got_it: "سمجھ آ گئی!",
            backup_restored: "بیک اپ کامیابی سے بحال ہو گیا!",
            backup_error: "بیک اپ بحال کرنے میں خرابی۔ غلط فائل۔",
            storage_init: "اسٹوریج شروع ہو رہا ہے۔ براہ کرم انتظار کریں۔",
            mic_denied_alert: "مائیکروفون تک رسائی سے انکار",
            min_dreams_required: "تجزیہ کی خصوصیت استعمال کرنے کے لیے کم از کم ۷ تعبیر شدہ خواب درکار ہیں۔",
            base_version: "بنیادی ورژن",
            until_date: "تک:",
            audio_recorded: "آڈیو ریکارڈ ہو گیا",
            audio_saved_with_dream: "خواب کے ساتھ محفوظ ہو گا",
            remove: "ہٹائیں",
            oracle_voice: "اوریکل کی آواز",
            image_ready: "تصویر تیار ہے!",
            style_desc_cartoon: "Pixar اسٹائل",
            style_desc_anime: "Ghibli اسٹائل",
            style_desc_real: "فوٹو ریئلسٹک",
            style_desc_fantasy: "جادوئی",
            cosmic_dna: "کائناتی DNA",
            moon_sync: "چاند کی ہم آہنگی",
            cosmic_dna_body: "آپ کا کائناتی DNA آپ کے خوابوں کا منفرد فنگر پرنٹ ہے — تاریخ پیدائش، برج اور خوابوں کے نمونوں پر مبنی۔",
            cosmic_dna_coming: "جلد آرہا ہے",
            cosmic_dna_enter: "اپنا کائناتی DNA حساب کرنے کے لیے پروفائل میں تاریخ پیدائش درج کریں۔",
            moon_phase_label: "چاند کا مرحلہ",
            dream_meaning_today: "آج کے خواب کا مطلب",
            save_btn: "محفوظ کریں",
            age_restricted_cat: "یہ زمرہ صرف ۱۸ سال یا اس سے زیادہ عمر کے افراد کے لیے دستیاب ہے۔",
            ok: "ٹھیک ہے",
            video_studio: "ویڈیو اسٹوڈیو",
            dream_network: "خوابوں کا نیٹ ورک",
            privacy_link: "رازداری", terms_link: "شرائط", imprint_link: "نقوش", research_link: "تحقیق", studies_link: "مطالعات", worldmap_link: "عالمی نقشہ", showing_sources_only: "صرف {0} ذرائع دکھا رہے ہیں", science_label: "علم",
        },
        processing: {
            title: "اوریکل کام کر رہا ہے...",
            step_analyze: "خواب کی تعبیر کا تجزیہ",
            step_customer: "صارف کے سیاق و سباق پر غور",
            step_no_customer: "صارف کا سیاق و سباق دستیاب نہیں",
            step_context: "زمرے اور روایات کا حساب ہو رہا ہے",
            step_no_context: "کوئی مخصوص روایات منتخب نہیں",
            step_image: "تصور تخلیق ہو رہا ہے",
            step_save: "کیلنڈر اور پروفائل میں محفوظ"
        },
        sub: {
            title: "اپنا ٹیئر منتخب کریں",
            billing_monthly: "ماہانہ", billing_yearly: "سالانہ",
            yearly_discount: "۱ مہینہ مفت!",
            smart_discount: "ڈویلپرز کے لیے",
            free_title: "مفت",
            free_price: "0 €",
            free_features: ["بنیادی تعبیر (اشتہارات کے ساتھ)", "مفت سکوں کے لیے آفر وال", "سکوں سے پریمیم", "صرف لنک شیئرنگ"],
            silver_title: "پرو",
            silver_price: "4.99 € / month",
            silver_features: ["اشتہارات سے پاک", "لامحدود PDF تبدیلی اور ڈاؤنلوڈ", "لامحدود تعبیرات", "۲۵ HD تصاویر/ماہ", "ہفتہ وار ۱x لائیو چیٹ", "آڈیو I/O"],
            gold_title: "گولڈ (VIP)",
            gold_price: "12.99 € / month",
            gold_trial_text: "۷ دن مفت، پھر 12.99 €/ماہ",
            gold_features: ["تمام سلور فیچرز شامل", "لامحدود لائیو اوریکل چیٹ", "۵ خوابوں کی ویڈیوز/ماہ", "خصوصی سکہ رعایت", "ترجیحی سپورٹ"],
            smart_title: "سمارٹ (ڈویلپر)",
            smart_price: "49.99 € / year",
            smart_features: ["اپنی کلید لائیں (BYOK)", "تمام پریمیم فیچرز غیر مقفل", "خودکار فراہم کنندہ گردش", "مقررہ سالانہ قیمت (29.99€)"],
            smart_info_title: "سمارٹ ڈویلپر ٹیئر کیا ہے؟",
            smart_info_text: "ڈویلپرز اور ٹیکنالوجی کے شائقین کے لیے: AI فراہم کنندگان پر اکاؤنٹ بنائیں (مثلاً Google AI Studio)، وہاں اپنی API کلید بنائیں اور ایپ میں شامل کریں۔ اس طرح آپ صرف کم API لاگت براہ راست فراہم کنندہ کو ادا کرتے ہیں + ایپ استعمال کے لیے ۳€۔",
            upgrade: "اپ گریڈ", current: "موجودہ", unlock: "کھولیں", try_free: "۷ دن مفت آزمائیں",
            ad_loading: "اشتہار لوڈ ہو رہا ہے...", ad_reward: "سکے حاصل ہو گئے!",
            bronze_title: "مفت", bronze_features: ["۳ تعبیرات/دن", "Groq AI", "۶ روایات", "اشتہارات"], bronze_price: "€0",
            silver2_title: "پرو", silver2_features: ["لامحدود تعبیرات", "Gemini AI", "تمام ۹ روایات", "اشتہارات سے پاک", "۱۰۰ سکے/ماہ", "۱۰٪ سکہ رعایت"], silver2_price_monthly: "€4.99 / ماہ", silver2_price_yearly: "€49.99 / سال",
            gold2_title: "پریمیم", gold2_features: ["Claude ۶ نقطہ نظر", "۵۰۰ سکے/ماہ", "۲۰٪ سکہ رعایت", "HD تصاویر", "۵ ویڈیوز/ماہ", "لائیو آواز", "پریمیم AI چیٹ"], gold2_price_monthly: "€14.99 / ماہ", gold2_price_yearly: "€149.99 / سال",
            
            pro_badge: "سب سے مقبول", vip_badge: "خصوصی 👑",
        },
        earn: {
            title: "سکے کمائیں",
            desc: "اپنا بیلنس بڑھانے کے لیے کام مکمل کریں۔",
            short_title: "مختصر کلپ", short_desc: "۱۰ سیکنڈ", short_reward: "1",
            long_title: "پریمیم ویڈیو", long_desc: "۲ منٹ", long_reward: "3",
            offer_title: "آفر وال", offer_desc: "سروے اور کام", offer_reward: "5-10",
            offer_info: "سروے، ایپ ٹیسٹ یا سائن اپ جیسے کام مکمل کریں اور زیادہ انعام حاصل کریں۔",
            survey_task: "برانڈ سروے", app_task: "گیم میں لیول ۵ حاصل کریں",
            watch_btn: "دیکھیں", start_btn: "شروع کریں"
        },
        shop: {
            title: "سکوں کی دکان",
            desc: "اپنا ذخیرہ بھریں۔",
            starter_label: "ابتدائی", starter_price: "1.99 €", starter_amount: "۱۰۰ سکے",
            best_label: "سب سے زیادہ فروخت", best_price: "5.99 €", best_amount: "۵۵۰ سکے", best_badge: "مقبول",
            value_label: "بہترین قیمت", value_price: "12.99 €", value_amount: "۱۵۰۰ سکے", value_badge: "بہترین قیمت",
            free_link: "مفت سکے حاصل کرنا چاہتے ہیں؟ یہاں کلک کریں۔",
            buy_btn: "خریدیں",
            wow_badge: "💎 فی سکہ ۱ سینٹ سے کم!",
            coins_label: "سکے",
            per_coin: "فی سکہ",
            pkg_starter: "آزمائیں", pkg_popular: "مقبول", pkg_value: "زیادہ قیمت", pkg_premium: "زیادہ بچت", pkg_mega: "پاور یوزر",
        },
        smart_guide: {
            step1_title: "اکاؤنٹ بنائیں", step1_desc: "Google AI Studio پر مفت اکاؤنٹ بنائیں۔",
            step2_title: "کلید بنائیں", step2_desc: "وہاں سے اپنی ذاتی API کلید کاپی کریں۔",
            step3_title: "ایپ میں پیسٹ کریں", step3_desc: "پریمیم کھولنے کے لیے کلید یہاں پیسٹ کریں۔"
        }
    },
    [Language.VI]: {
        app_title: "Dream Code | Mã Giấc Mơ",
        app_subtitle: "Toàn bộ tri thức nhân loại & siêu máy tính – ngay trong túi bạn",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Basra, Iraq (thế kỷ 7)",
            [ReligiousSource.NABULSI]: "Damascus, Syria (thế kỷ 17)",
            [ReligiousSource.AL_ISKHAFI]: "Baghdad (Abbasid)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Truyền thống Ả Rập (Abjad)",
            [ReligiousSource.MEDIEVAL]: "Châu Âu (Trung cổ)",
            [ReligiousSource.MODERN_THEOLOGY]: "Thần học phương Tây",
            [ReligiousSource.CHURCH_FATHERS]: "Roma & Byzantium (Giáo phụ)",
            [ReligiousSource.ZEN]: "Trung Quốc & Nhật Bản",
            [ReligiousSource.TIBETAN]: "Tây Tạng (Himalaya)",
            [ReligiousSource.THERAVADA]: "Đông Nam Á (Kinh Pali)",
            [ReligiousSource.FREUDIAN]: "Vienna (Phân tâm học)",
            [ReligiousSource.JUNGIAN]: "Zurich (Tâm lý phân tích)",
            [ReligiousSource.GESTALT]: "Berlin / New York",
            [ReligiousSource.WESTERN_ZODIAC]: "Truyền thống Hy Lạp hóa",
            [ReligiousSource.VEDIC_ASTROLOGY]: "Ấn Độ (Jyotish)",
            [ReligiousSource.CHINESE_ZODIAC]: "Trung Quốc (Âm lịch)",
            [ReligiousSource.PYTHAGOREAN]: "Hy Lạp cổ đại",
            [ReligiousSource.CHALDEAN]: "Babylon (Lưỡng Hà)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Thần bí Do Thái (Tây Ban Nha)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Ấn Độ (Vệ Đà)",
            [ReligiousSource.IMAM_SADIQ]: "Truyền thống Shia, Ba Tư",
            [ReligiousSource.ISLAMSKI_SONNIK]: "Nga-Hồi giáo",
            [ReligiousSource.ZHOU_GONG]: "Trung Quốc, Giải mộng",
            [ReligiousSource.HATSUYUME]: "Nhật Bản, Giấc mơ đầu năm",
            [ReligiousSource.SWAPNA_SHASTRA]: "Ấn Độ, Vệ Đà/Hindu",
            [ReligiousSource.EDGAR_CAYCE]: "Mỹ, Nhà tiên tri ngủ",
            [ReligiousSource.RUDOLF_STEINER]: "Nhân trí học, Áo",
            [ReligiousSource.TALMUD_BERAKHOT]: "Babylonia, 55a-57b",
            [ReligiousSource.ZOHAR]: "Kabbalah, thế kỷ 13",
            [ReligiousSource.VANGA]: "Bulgaria, thế kỷ 20",
            [ReligiousSource.MILLER_RU]: "Giải mộng Nga",
            [ReligiousSource.FREUD_RU]: "Phiên bản Freud Nga",
            [ReligiousSource.LOFF]: "Sách giấc mơ Nga",
            [ReligiousSource.NOSTRADAMUS_RU]: "Phiên bản Nga",
            [ReligiousSource.ARTEMIDOROS]: "Hy Lạp, thế kỷ 2 SCN",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "Ai Cập, kh. 1275 TCN",
            [ReligiousSource.SOMNIALE_DANIELIS]: "Byzantine-Trung cổ"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Hồi giáo', [ReligiousCategory.CHRISTIAN]: 'Kitô giáo', [ReligiousCategory.BUDDHIST]: 'Phật giáo', [ReligiousCategory.PSYCHOLOGICAL]: 'Tâm lý học', [ReligiousCategory.ASTROLOGY]: 'Chiêm tinh', [ReligiousCategory.NUMEROLOGY]: 'Số học', [ReligiousCategory.JEWISH]: 'Do Thái giáo', [ReligiousCategory.SONNIKS]: 'Sách giấc mơ', [ReligiousCategory.ANCIENT]: 'Cổ đại',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tây Tạng', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Trung cổ', [ReligiousSource.MODERN_THEOLOGY]: 'Thần học hiện đại', [ReligiousSource.CHURCH_FATHERS]: 'Giáo phụ', [ReligiousSource.ZEN]: 'Thiền', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Cung hoàng đạo', [ReligiousSource.VEDIC_ASTROLOGY]: 'Vệ Đà', [ReligiousSource.CHINESE_ZODIAC]: 'Tử vi Trung Hoa', [ReligiousSource.PYTHAGOREAN]: 'Pythagoras', [ReligiousSource.CHALDEAN]: 'Chaldean', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabbalah', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Số Vệ Đà', [ReligiousSource.IMAM_SADIQ]: 'Imam Sadiq', [ReligiousSource.ISLAMSKI_SONNIK]: 'Giải mộng Hồi giáo', [ReligiousSource.ZHOU_GONG]: 'Chu Công', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berakhot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artemidorus', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Giấy cói Ai Cập', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Mô tả giấc mơ của bạn...", interpret: "Giải mộng", choose_tradition: "Chọn truyền thống", refine_sources: "Chọn nguồn", oracle_speaks: "Lời sấm truyền", close: "Đóng", listening: "Đang nghe...", voices: "Giọng nói",
            settings: "Cài đặt", text_size: "Cỡ chữ", dictation_error: "Lỗi: Không có micro.", dictation_perm: "Quyền bị từ chối.",
            calendar_btn: "Lịch & Phân tích", coming_soon: "Thêm...", calendar_desc: "Nhật ký giấc mơ",
            profile_btn: "Hồ sơ", profile_desc: "Thống kê & Tôi",
            hub_btn: "Trung tâm giấc mơ", hub_desc: "Giấc mơ cộng đồng",
            gen_image: "Tạo hình ảnh", saved_msg: "Giấc mơ đã lưu vào lịch!",
            watch_ad: "Kiếm xu", generate_video: "Tạo video (Gold)", create_dream_video: "Video giấc mơ",
            video_btn_short: "📹 Tạo video", video_duration_short: "30s, 180 xu",
            slideshow_btn: "📽️ Tạo trình chiếu", slideshow_duration: "30s, 180 xu",
            premium_btn: "Premium / Gói", premium_desc: "Nâng cấp & Tính năng",
            customer_file_btn: "Hồ sơ cá nhân",
            theme: "Giao diện", mode: "Chế độ", dark: "Tối", light: "Sáng",
            style: "Phong cách", style_def: "Mặc định (Huyền bí)", style_fem: "Nữ tính (Hồng)", style_masc: "Nam tính (Xanh)", style_nature: "Thiên nhiên (Xanh lá)",
            voice_char: "Tính cách giọng", fem_char: "Nhân vật nữ", male_char: "Nhân vật nam", preview: "Xem trước",
            info_title: "Kho kiến thức", info_bio: "Tiểu sử", info_origin: "Nguồn gốc & Bối cảnh",
            video_ready: "Video giấc mơ đã sẵn sàng!", video_gen: "Đang tạo video...", video_error: "Tạo thất bại.",
            map_btn: "Ai đã mơ giống bạn?",
            api_manager: "Quản lý API Key (Smart)", api_desc: "Thêm Gemini API Key. Hệ thống tự chuyển khi hết hạn mức.", add_key: "Thêm key", no_keys: "Chưa có key nào.",
            quality_normal: "Bình thường", quality_high: "Chất lượng cao",
            style_cartoon: "Hoạt hình", style_anime: "Anime", style_real: "Thực tế", style_fantasy: "Kỳ ảo",
            choose_quality: "Chọn chất lượng", choose_style: "Chọn phong cách",
            choose_image_style: "Chọn phong cách hình ảnh",
            choose_style_desc: "Chọn chất lượng và phong cách cho hình ảnh giấc mơ",
            continue_without_image: "Tiếp tục không tạo hình",
            step_quality: "1. Chọn chất lượng",
            step_style: "2. Chọn phong cách",
            continue: "Tiếp tục",
            social_proof_stats: "47.832 giấc mơ đã phân tích · 12.543 giấc mơ trùng khớp",
            social_proof_testimonial1: "\"Cuối cùng hiểu được giấc mơ lặp lại!\" - Linh, 28",
            social_proof_testimonial2: "\"Giải mộng đa góc nhìn thật độc đáo.\" - Minh, 34",
            social_proof_testimonial3: "\"Tìm được người mơ giống mình qua ứng dụng!\" - Hương, 31",
            processing_context: "Đang xem xét:",
            backup_title: "Kho dữ liệu (Sao lưu)",
            backup_desc: "Lưu dữ liệu thành tệp hoặc khôi phục bản sao lưu.",
            export_btn: "Tải bản sao lưu",
            import_btn: "Khôi phục bản sao lưu",
            home_label: "Trang chủ",
            map_label: "Bản đồ",
            live_chat_label: "Trò chuyện trực tiếp",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5 xu thưởng: Video bằng giọng bạn!",
            audio_coin_desc: "Bản ghi đã lưu. Tạo video giấc mơ bằng giọng bạn trong Hồ sơ và nhận 5 xu!",
            upload_audio: "Tải lên",
            upload_confirm_title: "Đã lưu âm thanh!",
            upload_confirm_desc: "Bản ghi âm đã được lưu cùng giấc mơ. Kiểm tra trong Hồ sơ mục 'Âm thanh'!",
            got_it: "Đã hiểu!",
            backup_restored: "Khôi phục bản sao lưu thành công!",
            backup_error: "Lỗi khôi phục. Tệp không hợp lệ.",
            storage_init: "Bộ nhớ đang khởi tạo. Vui lòng đợi.",
            mic_denied_alert: "Quyền truy cập micro bị từ chối",
            min_dreams_required: "Bạn cần ít nhất 7 giấc mơ đã giải để sử dụng tính năng phân tích.",
            base_version: "Phiên bản cơ bản",
            until_date: "Đến:",
            audio_recorded: "Đã ghi âm",
            audio_saved_with_dream: "Sẽ lưu cùng giấc mơ",
            remove: "Xóa",
            oracle_voice: "Giọng sấm truyền",
            image_ready: "Hình ảnh sẵn sàng!",
            style_desc_cartoon: "Phong cách Pixar",
            style_desc_anime: "Phong cách Ghibli",
            style_desc_real: "Siêu thực",
            style_desc_fantasy: "Phép thuật",
            cosmic_dna: "ADN Vũ trụ",
            moon_sync: "Đồng bộ Mặt Trăng",
            cosmic_dna_body: "DNA Vũ trụ của bạn là dấu vân tay giấc mơ độc đáo — dựa trên ngày sinh, cung hoàng đạo và mô hình giấc mơ.",
            cosmic_dna_coming: "Sắp ra mắt",
            cosmic_dna_enter: "Nhập ngày sinh trong hồ sơ để tính DNA Vũ trụ của bạn.",
            moon_phase_label: "Pha trăng",
            dream_meaning_today: "Ý nghĩa giấc mơ hôm nay",
            save_btn: "Lưu",
            age_restricted_cat: "Danh mục này chỉ dành cho người từ 18 tuổi trở lên.",
            ok: "OK",
            video_studio: "Studio Video",
            dream_network: "Mạng giấc mơ",
            privacy_link: "Quyền riêng tư", terms_link: "Điều khoản", imprint_link: "Thông tin pháp lý", research_link: "Nghiên cứu", studies_link: "Nghiên cứu", worldmap_link: "Bản đồ thế giới", showing_sources_only: "Chỉ hiển thị nguồn {0}", science_label: "Kiến thức",
        },
        processing: {
            title: "Sấm truyền đang hoạt động...",
            step_analyze: "Đang phân tích giấc mơ",
            step_customer: "Đang xem xét bối cảnh cá nhân",
            step_no_customer: "Không có bối cảnh cá nhân",
            step_context: "Đang tính toán danh mục & truyền thống",
            step_no_context: "Chưa chọn truyền thống cụ thể",
            step_image: "Đang tạo hình ảnh",
            step_save: "Đã lưu vào lịch và hồ sơ"
        },
        sub: {
            title: "Chọn gói của bạn",
            billing_monthly: "Hàng tháng", billing_yearly: "Hàng năm",
            yearly_discount: "Miễn phí 1 tháng!",
            smart_discount: "Dành cho lập trình viên",
            free_title: "Miễn phí",
            free_price: "0 €",
            free_features: ["Giải mộng cơ bản (Có quảng cáo)", "Truy cập Offerwall kiếm xu", "Premium bằng xu", "Chỉ chia sẻ liên kết"],
            silver_title: "Pro",
            silver_price: "4.99 € / tháng",
            silver_features: ["Không quảng cáo", "Chuyển PDF & Tải không giới hạn", "Giải mộng không giới hạn", "25 ảnh HD/tháng", "1 lần chat trực tiếp/tuần", "Âm thanh I/O"],
            gold_title: "Gold (VIP)",
            gold_price: "12.99 € / tháng",
            gold_trial_text: "7 ngày miễn phí, sau đó 12.99 €/tháng",
            gold_features: ["Bao gồm tất cả tính năng Silver", "Chat Oracle trực tiếp không giới hạn", "5 video giấc mơ/tháng", "Giảm giá xu độc quyền", "Hỗ trợ ưu tiên"],
            smart_title: "Smart (Lập trình viên)",
            smart_price: "49.99 € / năm",
            smart_features: ["Dùng key riêng (BYOK)", "Mở khóa tất cả tính năng Premium", "Tự động xoay nhà cung cấp", "Giá cố định hàng năm (29.99€)"],
            smart_info_title: "Gói Smart Developer là gì?",
            smart_info_text: "Dành cho lập trình viên & người đam mê công nghệ: Tạo tài khoản với nhà cung cấp AI (VD: Google AI Studio), tạo API key riêng, và thêm vào ứng dụng. Bạn chỉ trả chi phí API thấp cho nhà cung cấp + €3 phí ứng dụng. Hoàn hảo cho người dùng nâng cao!",
            upgrade: "Nâng cấp", current: "Hiện tại", unlock: "Mở khóa", try_free: "DÙNG THỬ 7 NGÀY MIỄN PHÍ",
            ad_loading: "Đang tải quảng cáo...", ad_reward: "Đã nhận xu!",
            bronze_title: "Miễn phí", bronze_features: ["3 lần giải mộng/ngày", "Groq AI", "6 truyền thống", "Quảng cáo"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["Giải mộng không giới hạn", "Gemini AI", "Tất cả 9 truyền thống", "Không quảng cáo", "100 xu/tháng", "Giảm 10% xu"], silver2_price_monthly: "€4.99 / Tháng", silver2_price_yearly: "€49.99 / Năm",
            gold2_title: "Premium", gold2_features: ["Claude 6 góc nhìn", "500 xu/tháng", "Giảm 20% xu", "Ảnh HD", "5 video/tháng", "Giọng nói trực tiếp", "AI Chat Premium"], gold2_price_monthly: "€14.99 / Tháng", gold2_price_yearly: "€149.99 / Năm",
            
            pro_badge: "PHỔ BIẾN NHẤT", vip_badge: "ĐỘC QUYỀN 👑",
        },
        earn: {
            title: "Kiếm xu",
            desc: "Hoàn thành nhiệm vụ để nạp số dư.",
            short_title: "Clip ngắn", short_desc: "10 giây", short_reward: "1",
            long_title: "Video Premium", long_desc: "2 phút", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Khảo sát & Nhiệm vụ", offer_reward: "5-10",
            offer_info: "Hoàn thành khảo sát, thử ứng dụng hoặc đăng ký để nhận thưởng cao.",
            survey_task: "Khảo sát thương hiệu", app_task: "Đạt cấp 5 trong game",
            watch_btn: "Xem", start_btn: "Bắt đầu"
        },
        shop: {
            title: "Cửa hàng xu",
            desc: "Nạp thêm xu.",
            starter_label: "Khởi đầu", starter_price: "1.99 €", starter_amount: "100 xu",
            best_label: "Bán chạy", best_price: "5.99 €", best_amount: "550 xu", best_badge: "Phổ biến",
            value_label: "Giá trị nhất", value_price: "12.99 €", value_amount: "1500 xu", value_badge: "Giá trị nhất",
            free_link: "Muốn kiếm xu miễn phí? Nhấn đây.",
            buy_btn: "Mua",
            wow_badge: "💎 Dưới 1 cent/xu!",
            coins_label: "Xu",
            per_coin: "mỗi xu",
            pkg_starter: "Dùng thử", pkg_popular: "Phổ biến", pkg_value: "Giá trị hơn", pkg_premium: "Tiết kiệm hơn", pkg_mega: "Chuyên gia",
        },
        smart_guide: {
            step1_title: "Tạo tài khoản", step1_desc: "Tạo tài khoản miễn phí tại Google AI Studio.",
            step2_title: "Tạo key", step2_desc: "Sao chép API Key cá nhân của bạn.",
            step3_title: "Dán vào ứng dụng", step3_desc: "Dán key vào đây để mở khóa Premium."
        }
    },
    [Language.TH]: {
        app_title: "Dream Code | รหัสความฝัน",
        app_subtitle: "ความรู้ทั้งหมดของมนุษยชาติ & ซูเปอร์คอมพิวเตอร์ – อยู่ในกระเป๋าคุณ",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "บัสรา อิรัก (ศตวรรษที่ 7)",
            [ReligiousSource.NABULSI]: "ดามัสกัส ซีเรีย (ศตวรรษที่ 17)",
            [ReligiousSource.AL_ISKHAFI]: "แบกแดด (อับบาซียะฮ์)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "ประเพณีอาหรับ (อับญัด)",
            [ReligiousSource.MEDIEVAL]: "ยุโรป (ยุคกลาง)",
            [ReligiousSource.MODERN_THEOLOGY]: "เทววิทยาตะวันตก",
            [ReligiousSource.CHURCH_FATHERS]: "โรม & ไบแซนไทน์ (ปิตาจารย์)",
            [ReligiousSource.ZEN]: "จีน & ญี่ปุ่น",
            [ReligiousSource.TIBETAN]: "ทิเบต (หิมาลัย)",
            [ReligiousSource.THERAVADA]: "เอเชียตะวันออกเฉียงใต้ (พระไตรปิฎก)",
            [ReligiousSource.FREUDIAN]: "เวียนนา (จิตวิเคราะห์)",
            [ReligiousSource.JUNGIAN]: "ซูริค (จิตวิทยาวิเคราะห์)",
            [ReligiousSource.GESTALT]: "เบอร์ลิน / นิวยอร์ก",
            [ReligiousSource.WESTERN_ZODIAC]: "ประเพณีเฮลเลนิสติก",
            [ReligiousSource.VEDIC_ASTROLOGY]: "อินเดีย (โชยติศ)",
            [ReligiousSource.CHINESE_ZODIAC]: "จีน (ปฏิทินจันทรคติ)",
            [ReligiousSource.PYTHAGOREAN]: "กรีกโบราณ",
            [ReligiousSource.CHALDEAN]: "บาบิโลน (เมโสโปเตเมีย)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "ลัทธิลึกลับยิว (สเปน)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "อินเดีย (พระเวท)",
            [ReligiousSource.IMAM_SADIQ]: "ประเพณีชีอะห์ เปอร์เซีย",
            [ReligiousSource.ISLAMSKI_SONNIK]: "รัสเซีย-อิสลาม",
            [ReligiousSource.ZHOU_GONG]: "จีน ทำนายฝัน",
            [ReligiousSource.HATSUYUME]: "ญี่ปุ่น ฝันปีใหม่",
            [ReligiousSource.SWAPNA_SHASTRA]: "อินเดีย เวท/ฮินดู",
            [ReligiousSource.EDGAR_CAYCE]: "สหรัฐ ศาสดาผู้หลับ",
            [ReligiousSource.RUDOLF_STEINER]: "มนุษยปรัชญา ออสเตรีย",
            [ReligiousSource.TALMUD_BERAKHOT]: "บาบิโลเนีย 55a-57b",
            [ReligiousSource.ZOHAR]: "คับบาลาห์ ศตวรรษที่ 13",
            [ReligiousSource.VANGA]: "บัลแกเรีย ศตวรรษที่ 20",
            [ReligiousSource.MILLER_RU]: "ทำนายฝันรัสเซีย",
            [ReligiousSource.FREUD_RU]: "ฟรอยด์ฉบับรัสเซีย",
            [ReligiousSource.LOFF]: "หนังสือฝันรัสเซีย",
            [ReligiousSource.NOSTRADAMUS_RU]: "ฉบับรัสเซีย",
            [ReligiousSource.ARTEMIDOROS]: "กรีก ค.ศ. ศตวรรษที่ 2",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "อียิปต์ ประมาณ 1275 ก่อน ค.ศ.",
            [ReligiousSource.SOMNIALE_DANIELIS]: "ไบแซนไทน์-ยุคกลาง"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'อิสลาม', [ReligiousCategory.CHRISTIAN]: 'คริสต์', [ReligiousCategory.BUDDHIST]: 'พุทธ', [ReligiousCategory.PSYCHOLOGICAL]: 'จิตวิทยา', [ReligiousCategory.ASTROLOGY]: 'โหราศาสตร์', [ReligiousCategory.NUMEROLOGY]: 'ตัวเลขศาสตร์', [ReligiousCategory.JEWISH]: 'ยิว', [ReligiousCategory.SONNIKS]: 'หนังสือฝัน', [ReligiousCategory.ANCIENT]: 'โบราณ',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'ทิเบต', [ReligiousSource.IBN_SIRIN]: 'อิบนุซีรีน', [ReligiousSource.NABULSI]: 'อัน-นาบูลซี', [ReligiousSource.AL_ISKHAFI]: 'อัล-อิสคาฟี', [ReligiousSource.MEDIEVAL]: 'ยุคกลาง', [ReligiousSource.MODERN_THEOLOGY]: 'เทววิทยาสมัยใหม่', [ReligiousSource.CHURCH_FATHERS]: 'ปิตาจารย์', [ReligiousSource.ZEN]: 'เซน', [ReligiousSource.THERAVADA]: 'เถรวาท', [ReligiousSource.FREUDIAN]: 'ฟรอยด์', [ReligiousSource.JUNGIAN]: 'ยุง', [ReligiousSource.GESTALT]: 'เกสตัลท์', [ReligiousSource.WESTERN_ZODIAC]: 'จักรราศีตะวันตก', [ReligiousSource.VEDIC_ASTROLOGY]: 'เวท', [ReligiousSource.CHINESE_ZODIAC]: 'จักรราศีจีน', [ReligiousSource.PYTHAGOREAN]: 'พีทาโกรัส', [ReligiousSource.CHALDEAN]: 'แคลเดียน', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'คับบาลาห์', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'อับญัด', [ReligiousSource.VEDIC_NUMEROLOGY]: 'ตัวเลขเวท', [ReligiousSource.IMAM_SADIQ]: 'อิหม่ามซอดิก', [ReligiousSource.ISLAMSKI_SONNIK]: 'ทำนายฝันอิสลาม', [ReligiousSource.ZHOU_GONG]: 'โจวกง', [ReligiousSource.HATSUYUME]: 'ฮัตสึยุเมะ', [ReligiousSource.SWAPNA_SHASTRA]: 'สวัปนะศาสตร์', [ReligiousSource.EDGAR_CAYCE]: 'เอ็ดการ์ เคย์ซี', [ReligiousSource.RUDOLF_STEINER]: 'รูดอล์ฟ สไตเนอร์', [ReligiousSource.TALMUD_BERAKHOT]: 'ทัลมุด เบราโคท', [ReligiousSource.ZOHAR]: 'โซฮาร์', [ReligiousSource.VANGA]: 'วังกา', [ReligiousSource.MILLER_RU]: 'มิลเลอร์', [ReligiousSource.FREUD_RU]: 'ฟรอยด์ (RU)', [ReligiousSource.LOFF]: 'ลอฟฟ์', [ReligiousSource.NOSTRADAMUS_RU]: 'นอสตราดามุส', [ReligiousSource.ARTEMIDOROS]: 'อาร์เทมิโดรัส', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'กระดาษปาปิรุสอียิปต์', [ReligiousSource.SOMNIALE_DANIELIS]: 'ซอมเนียเล ดาเนียลิส'
        },
        ui: {
            placeholder: "บรรยายความฝันของคุณ...", interpret: "ทำนายฝัน", choose_tradition: "เลือกประเพณี", refine_sources: "เลือกแหล่งข้อมูล", oracle_speaks: "คำทำนาย", close: "ปิด", listening: "กำลังฟัง...", voices: "เสียง",
            settings: "ตั้งค่า", text_size: "ขนาด", dictation_error: "ข้อผิดพลาด: ไม่มีไมโครโฟน", dictation_perm: "สิทธิ์ถูกปฏิเสธ",
            calendar_btn: "ปฏิทิน & วิเคราะห์", coming_soon: "เพิ่มเติม...", calendar_desc: "สมุดบันทึกความฝัน",
            profile_btn: "โปรไฟล์", profile_desc: "สถิติ & ฉัน",
            hub_btn: "ศูนย์รวมความฝัน", hub_desc: "ความฝันชุมชน",
            gen_image: "สร้างภาพ", saved_msg: "บันทึกฝันลงปฏิทินแล้ว!",
            watch_ad: "รับเหรียญ", generate_video: "สร้างวิดีโอ (Gold)", create_dream_video: "วิดีโอความฝัน",
            video_btn_short: "📹 สร้างวิดีโอ", video_duration_short: "30วิ 180 เหรียญ",
            slideshow_btn: "📽️ สร้างสไลด์โชว์", slideshow_duration: "30วิ 180 เหรียญ",
            premium_btn: "Premium / แพ็กเกจ", premium_desc: "อัปเกรด & ฟีเจอร์",
            customer_file_btn: "ไฟล์บริบทส่วนตัว",
            theme: "ธีม", mode: "โหมด", dark: "มืด", light: "สว่าง",
            style: "สไตล์", style_def: "ค่าเริ่มต้น (ลึกลับ)", style_fem: "สตรี (กุหลาบ)", style_masc: "บุรุษ (น้ำเงิน)", style_nature: "ธรรมชาติ (เขียว)",
            voice_char: "ลักษณะเสียง", fem_char: "ตัวละครหญิง", male_char: "ตัวละครชาย", preview: "ดูตัวอย่าง",
            info_title: "ฐานความรู้", info_bio: "ประวัติ", info_origin: "ที่มา & ภูมิหลัง",
            video_ready: "วิดีโอความฝันพร้อมแล้ว!", video_gen: "กำลังสร้างวิดีโอ...", video_error: "สร้างล้มเหลว",
            map_btn: "ใครฝันเหมือนกัน?",
            api_manager: "จัดการ API Key (Smart)", api_desc: "เพิ่ม Gemini API Key ระบบสลับอัตโนมัติเมื่อถึงขีดจำกัด", add_key: "เพิ่ม Key", no_keys: "ไม่พบ Key",
            quality_normal: "ปกติ", quality_high: "คุณภาพสูง",
            style_cartoon: "การ์ตูน", style_anime: "อนิเมะ", style_real: "สมจริง", style_fantasy: "แฟนตาซี",
            choose_quality: "เลือกคุณภาพ", choose_style: "เลือกสไตล์",
            choose_image_style: "เลือกสไตล์ภาพ",
            choose_style_desc: "เลือกคุณภาพและสไตล์สำหรับภาพความฝัน",
            continue_without_image: "ดำเนินต่อโดยไม่สร้างภาพ",
            step_quality: "1. เลือกคุณภาพ",
            step_style: "2. เลือกสไตล์",
            continue: "ดำเนินต่อ",
            social_proof_stats: "47,832 ความฝันวิเคราะห์แล้ว · 12,543 ฝันตรงกัน",
            social_proof_testimonial1: "\"ในที่สุดก็เข้าใจฝันซ้ำ ๆ!\" - นิดา, 28",
            social_proof_testimonial2: "\"การตีความหลายมุมมองไม่เหมือนใคร\" - สมชาย, 34",
            social_proof_testimonial3: "\"เจอคนฝันเหมือนกันผ่านแอป!\" - ปริม, 31",
            processing_context: "กำลังพิจารณา:",
            backup_title: "ห้องนิรภัยข้อมูล (สำรอง)",
            backup_desc: "สำรองข้อมูลเป็นไฟล์หรือกู้คืนจากข้อมูลสำรอง",
            export_btn: "ดาวน์โหลดข้อมูลสำรอง",
            import_btn: "กู้คืนข้อมูลสำรอง",
            home_label: "หน้าแรก",
            map_label: "แผนที่",
            live_chat_label: "แชทสด",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5 เหรียญโบนัส: วิดีโอด้วยเสียงคุณ!",
            audio_coin_desc: "บันทึกเสียงแล้ว สร้างวิดีโอฝันด้วยเสียงตัวเองในโปรไฟล์และรับ 5 เหรียญ!",
            upload_audio: "อัปโหลด",
            upload_confirm_title: "บันทึกเสียงสำเร็จ!",
            upload_confirm_desc: "เสียงบันทึกถูกเก็บพร้อมความฝัน ตรวจสอบในโปรไฟล์ที่ 'เสียง'!",
            got_it: "เข้าใจแล้ว!",
            backup_restored: "กู้คืนข้อมูลสำรองสำเร็จ!",
            backup_error: "กู้คืนผิดพลาด ไฟล์ไม่ถูกต้อง",
            storage_init: "กำลังเริ่มต้นที่เก็บข้อมูล กรุณารอ",
            mic_denied_alert: "การเข้าถึงไมโครโฟนถูกปฏิเสธ",
            min_dreams_required: "คุณต้องมีอย่างน้อย 7 ฝันที่ตีความแล้วเพื่อใช้ฟีเจอร์วิเคราะห์",
            base_version: "เวอร์ชันพื้นฐาน",
            until_date: "ถึง:",
            audio_recorded: "บันทึกเสียงแล้ว",
            audio_saved_with_dream: "จะบันทึกพร้อมความฝัน",
            remove: "ลบ",
            oracle_voice: "เสียงทำนาย",
            image_ready: "ภาพพร้อม!",
            style_desc_cartoon: "สไตล์ Pixar",
            style_desc_anime: "สไตล์ Ghibli",
            style_desc_real: "เสมือนจริง",
            style_desc_fantasy: "มหัศจรรย์",
            cosmic_dna: "DNA จักรวาล",
            moon_sync: "ซิงค์ดวงจันทร์",
            cosmic_dna_body: "DNA จักรวาลของคุณคือลายนิ้วมือแห่งความฝันที่เป็นเอกลักษณ์ — ตามวันเกิด ราศี และรูปแบบความฝัน",
            cosmic_dna_coming: "เร็วๆ นี้",
            cosmic_dna_enter: "กรอกวันเกิดในโปรไฟล์เพื่อคำนวณ DNA จักรวาลของคุณ",
            moon_phase_label: "ข้างขึ้นข้างแรม",
            dream_meaning_today: "ความหมายความฝันวันนี้",
            save_btn: "บันทึก",
            age_restricted_cat: "หมวดหมู่นี้สำหรับผู้มีอายุ 18 ปีขึ้นไปเท่านั้น",
            ok: "ตกลง",
            video_studio: "สตูดิโอวิดีโอ",
            dream_network: "เครือข่ายความฝัน",
            privacy_link: "ความเป็นส่วนตัว", terms_link: "ข้อกำหนด", imprint_link: "ข้อมูลทางกฎหมาย", research_link: "การวิจัย", studies_link: "การศึกษา", worldmap_link: "แผนที่โลก", showing_sources_only: "แสดงเฉพาะแหล่ง {0}", science_label: "ความรู้",
        },
        processing: {
            title: "คำทำนายกำลังทำงาน...",
            step_analyze: "กำลังวิเคราะห์ความฝัน",
            step_customer: "กำลังพิจารณาบริบทส่วนตัว",
            step_no_customer: "ไม่มีบริบทส่วนตัว",
            step_context: "กำลังคำนวณหมวดหมู่ & ประเพณี",
            step_no_context: "ไม่ได้เลือกประเพณีเฉพาะ",
            step_image: "กำลังสร้างภาพ",
            step_save: "บันทึกลงปฏิทินและโปรไฟล์แล้ว"
        },
        sub: {
            title: "เลือกแพ็กเกจ",
            billing_monthly: "รายเดือน", billing_yearly: "รายปี",
            yearly_discount: "ฟรี 1 เดือน!",
            smart_discount: "สำหรับนักพัฒนา",
            free_title: "ฟรี",
            free_price: "0 €",
            free_features: ["ตีความพื้นฐาน (มีโฆษณา)", "เข้าถึง Offerwall รับเหรียญฟรี", "Premium ด้วยเหรียญ", "แชร์ลิงก์เท่านั้น"],
            silver_title: "Pro",
            silver_price: "4.99 € / เดือน",
            silver_features: ["ไม่มีโฆษณา", "แปลง PDF & ดาวน์โหลดไม่จำกัด", "ตีความไม่จำกัด", "25 ภาพ HD/เดือน", "แชทสด 1 ครั้ง/สัปดาห์", "เสียง I/O"],
            gold_title: "Gold (VIP)",
            gold_price: "12.99 € / เดือน",
            gold_trial_text: "ฟรี 7 วัน จากนั้น 12.99 €/เดือน",
            gold_features: ["รวมฟีเจอร์ Silver ทั้งหมด", "แชท Oracle สดไม่จำกัด", "5 วิดีโอฝัน/เดือน", "ส่วนลดเหรียญพิเศษ", "บริการลำดับความสำคัญ"],
            smart_title: "Smart (นักพัฒนา)",
            smart_price: "49.99 € / ปี",
            smart_features: ["ใช้ Key ของตัวเอง (BYOK)", "ปลดล็อกฟีเจอร์ Premium ทั้งหมด", "สลับผู้ให้บริการอัตโนมัติ", "ราคาคงที่รายปี (29.99€)"],
            smart_info_title: "Smart Developer คืออะไร?",
            smart_info_text: "สำหรับนักพัฒนา & ผู้หลงใหลเทคโนโลยี: สร้างบัญชีกับผู้ให้บริการ AI (เช่น Google AI Studio) สร้าง API Key และเพิ่มในแอป คุณจ่ายเฉพาะค่า API ต่ำโดยตรง + €3 ค่าใช้แอป เหมาะสำหรับผู้ใช้ขั้นสูง!",
            upgrade: "อัปเกรด", current: "ปัจจุบัน", unlock: "ปลดล็อก", try_free: "ทดลองฟรี 7 วัน",
            ad_loading: "กำลังโหลดโฆษณา...", ad_reward: "ได้รับเหรียญแล้ว!",
            bronze_title: "ฟรี", bronze_features: ["ตีความ 3 ครั้ง/วัน", "Groq AI", "6 ประเพณี", "โฆษณา"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["ตีความไม่จำกัด", "Gemini AI", "ทั้ง 9 ประเพณี", "ไม่มีโฆษณา", "100 เหรียญ/เดือน", "ส่วนลด 10%"], silver2_price_monthly: "€4.99 / เดือน", silver2_price_yearly: "€49.99 / ปี",
            gold2_title: "Premium", gold2_features: ["Claude 6 มุมมอง", "500 เหรียญ/เดือน", "ส่วนลด 20%", "ภาพ HD", "5 วิดีโอ/เดือน", "เสียงสด", "AI แชท Premium"], gold2_price_monthly: "€14.99 / เดือน", gold2_price_yearly: "€149.99 / ปี",
            
            pro_badge: "ยอดนิยม", vip_badge: "พิเศษ 👑",
        },
        earn: {
            title: "รับเหรียญ",
            desc: "ทำภารกิจเพื่อเติมยอด",
            short_title: "คลิปสั้น", short_desc: "10 วินาที", short_reward: "1",
            long_title: "วิดีโอ Premium", long_desc: "2 นาที", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "แบบสำรวจ & ภารกิจ", offer_reward: "5-10",
            offer_info: "ทำแบบสำรวจ ทดสอบแอป หรือสมัครเพื่อรับรางวัลสูง",
            survey_task: "แบบสำรวจแบรนด์", app_task: "ถึงเลเวล 5 ในเกม",
            watch_btn: "ดู", start_btn: "เริ่ม"
        },
        shop: {
            title: "ร้านเหรียญ",
            desc: "เติมเหรียญ",
            starter_label: "เริ่มต้น", starter_price: "1.99 €", starter_amount: "100 เหรียญ",
            best_label: "ขายดี", best_price: "5.99 €", best_amount: "550 เหรียญ", best_badge: "ยอดนิยม",
            value_label: "คุ้มที่สุด", value_price: "12.99 €", value_amount: "1500 เหรียญ", value_badge: "คุ้มที่สุด",
            free_link: "อยากได้เหรียญฟรี? กดที่นี่",
            buy_btn: "ซื้อ",
            wow_badge: "💎 ต่ำกว่า 1 เซ็นต์/เหรียญ!",
            coins_label: "เหรียญ",
            per_coin: "ต่อเหรียญ",
            pkg_starter: "ทดลอง", pkg_popular: "ยอดนิยม", pkg_value: "คุ้มค่า", pkg_premium: "ประหยัดกว่า", pkg_mega: "ผู้ใช้ระดับสูง",
        },
        smart_guide: {
            step1_title: "สร้างบัญชี", step1_desc: "สร้างบัญชีฟรีที่ Google AI Studio",
            step2_title: "สร้าง Key", step2_desc: "คัดลอก API Key ส่วนตัวของคุณ",
            step3_title: "วางในแอป", step3_desc: "วาง Key ที่นี่เพื่อปลดล็อก Premium"
        }
    },
    [Language.SW]: {
        app_title: "Dream Code | Msimbo wa Ndoto",
        app_subtitle: "Maarifa yote ya binadamu & kompyuta kuu – mfukoni mwako",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Basra, Iraq (Karne ya 7)",
            [ReligiousSource.NABULSI]: "Damascus, Syria (Karne ya 17)",
            [ReligiousSource.AL_ISKHAFI]: "Baghdad (Abbasid)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Mila ya Kiarabu (Abjad)",
            [ReligiousSource.MEDIEVAL]: "Ulaya (Karne za Kati)",
            [ReligiousSource.MODERN_THEOLOGY]: "Teolojia ya Magharibi",
            [ReligiousSource.CHURCH_FATHERS]: "Roma & Byzantium (Mababa wa Kanisa)",
            [ReligiousSource.ZEN]: "China & Japan",
            [ReligiousSource.TIBETAN]: "Tibet (Himalaya)",
            [ReligiousSource.THERAVADA]: "Asia ya Kusini-mashariki (Pali Canon)",
            [ReligiousSource.FREUDIAN]: "Vienna (Uchambuzi wa Nafsi)",
            [ReligiousSource.JUNGIAN]: "Zurich (Saikolojia ya Uchambuzi)",
            [ReligiousSource.GESTALT]: "Berlin / New York",
            [ReligiousSource.WESTERN_ZODIAC]: "Mila ya Kiheleni",
            [ReligiousSource.VEDIC_ASTROLOGY]: "India (Jyotish)",
            [ReligiousSource.CHINESE_ZODIAC]: "China (Kalenda ya Mwezi)",
            [ReligiousSource.PYTHAGOREAN]: "Ugiriki wa Kale",
            [ReligiousSource.CHALDEAN]: "Babiloni (Mesopotamia)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Fumbo la Kiyahudi (Hispania)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "India (Veda)",
            [ReligiousSource.IMAM_SADIQ]: "Mila ya Kishia, Uajemi",
            [ReligiousSource.ISLAMSKI_SONNIK]: "Kirusi-Kiislamu",
            [ReligiousSource.ZHOU_GONG]: "China, Tafsiri ya Ndoto",
            [ReligiousSource.HATSUYUME]: "Japan, Ndoto ya Mwaka Mpya",
            [ReligiousSource.SWAPNA_SHASTRA]: "India, Veda/Hindu",
            [ReligiousSource.EDGAR_CAYCE]: "Marekani, Nabii Aliyelala",
            [ReligiousSource.RUDOLF_STEINER]: "Anthroposophy, Austria",
            [ReligiousSource.TALMUD_BERAKHOT]: "Babilonia, 55a-57b",
            [ReligiousSource.ZOHAR]: "Kabbalah, Karne ya 13",
            [ReligiousSource.VANGA]: "Bulgaria, Karne ya 20",
            [ReligiousSource.MILLER_RU]: "Tafsiri ya Ndoto ya Kirusi",
            [ReligiousSource.FREUD_RU]: "Freud toleo la Kirusi",
            [ReligiousSource.LOFF]: "Kitabu cha Ndoto cha Kirusi",
            [ReligiousSource.NOSTRADAMUS_RU]: "Toleo la Kirusi",
            [ReligiousSource.ARTEMIDOROS]: "Ugiriki, Karne ya 2 BK",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "Misri, takriban 1275 KK",
            [ReligiousSource.SOMNIALE_DANIELIS]: "Byzantine-Karne za Kati"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Kiislamu', [ReligiousCategory.CHRISTIAN]: 'Kikristo', [ReligiousCategory.BUDDHIST]: 'Kibudha', [ReligiousCategory.PSYCHOLOGICAL]: 'Saikolojia', [ReligiousCategory.ASTROLOGY]: 'Unajimu', [ReligiousCategory.NUMEROLOGY]: 'Nambari', [ReligiousCategory.JEWISH]: 'Kiyahudi', [ReligiousCategory.SONNIKS]: 'Vitabu vya Ndoto', [ReligiousCategory.ANCIENT]: 'Ya Kale',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibet', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Karne za Kati', [ReligiousSource.MODERN_THEOLOGY]: 'Teolojia ya Kisasa', [ReligiousSource.CHURCH_FATHERS]: 'Mababa wa Kanisa', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Zodiaki ya Magharibi', [ReligiousSource.VEDIC_ASTROLOGY]: 'Veda', [ReligiousSource.CHINESE_ZODIAC]: 'Zodiaki ya Kichina', [ReligiousSource.PYTHAGOREAN]: 'Pythagoras', [ReligiousSource.CHALDEAN]: 'Chaldean', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabbalah', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Nambari za Veda', [ReligiousSource.IMAM_SADIQ]: 'Imam Sadiq', [ReligiousSource.ISLAMSKI_SONNIK]: 'Sonnik ya Kiislamu', [ReligiousSource.ZHOU_GONG]: 'Zhou Gong', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berakhot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artemidorus', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Papyrus ya Misri', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Eleza ndoto yako...", interpret: "Tafsiri Ndoto", choose_tradition: "Chagua Mila", refine_sources: "Boresha Vyanzo", oracle_speaks: "Oracle Anasema", close: "Funga", listening: "Inasikiliza...", voices: "Sauti",
            settings: "Mipangilio", text_size: "Ukubwa", dictation_error: "Hitilafu: Hakuna maikrofoni.", dictation_perm: "Ruhusa imekataliwa.",
            calendar_btn: "Kalenda & Uchambuzi", coming_soon: "Zaidi...", calendar_desc: "Jarida la Ndoto",
            profile_btn: "Wasifu Wako", profile_desc: "Takwimu & Mimi",
            hub_btn: "Kituo cha Ndoto", hub_desc: "Ndoto za Jamii",
            gen_image: "Tengeneza Picha", saved_msg: "Ndoto imehifadhiwa kwenye kalenda!",
            watch_ad: "Pata Sarafu", generate_video: "Tengeneza Video (Gold)", create_dream_video: "Video ya Ndoto",
            video_btn_short: "📹 Tengeneza Video", video_duration_short: "30s, Sarafu 180",
            slideshow_btn: "📽️ Unda Slideshow", slideshow_duration: "30s, Sarafu 180",
            premium_btn: "Premium / Mpango", premium_desc: "Boresha & Vipengele",
            customer_file_btn: "Faili ya Muktadha Binafsi",
            theme: "Muonekano", mode: "Hali", dark: "Giza", light: "Mwanga",
            style: "Mtindo", style_def: "Chaguo-msingi (Fumbo)", style_fem: "Kike (Waridi)", style_masc: "Kiume (Bluu)", style_nature: "Asili (Kijani)",
            voice_char: "Tabia ya Sauti", fem_char: "Wahusika wa Kike", male_char: "Wahusika wa Kiume", preview: "Hakiki",
            info_title: "Msingi wa Maarifa", info_bio: "Wasifu", info_origin: "Asili & Historia",
            video_ready: "Video ya ndoto iko tayari!", video_gen: "Inatengeneza Video...", video_error: "Utengenezaji umeshindwa.",
            map_btn: "Nani aliota ndoto kama hii?",
            api_manager: "Meneja wa API Key (Smart)", api_desc: "Ongeza Gemini API Keys. Mfumo hubadilisha moja kwa moja ukomo ukifikiwa.", add_key: "Ongeza Key", no_keys: "Hakuna Keys zilizopatikana.",
            quality_normal: "Kawaida", quality_high: "Ubora wa Juu",
            style_cartoon: "Katuni", style_anime: "Anime", style_real: "Halisi", style_fantasy: "Ndoto",
            choose_quality: "Chagua Ubora", choose_style: "Chagua Mtindo",
            choose_image_style: "Chagua Mtindo wa Picha",
            choose_style_desc: "Chagua ubora na mtindo kwa picha ya ndoto yako",
            continue_without_image: "Endelea bila kutengeneza picha",
            step_quality: "1. Chagua Ubora",
            step_style: "2. Chagua Mtindo",
            continue: "Endelea",
            social_proof_stats: "Ndoto 47,832 zimechambuliwa · Mechi 12,543 za ndoto zimepatikana",
            social_proof_testimonial1: "\"Hatimaye naelewa ndoto zangu zinazorudia!\" - Amina, 28",
            social_proof_testimonial2: "\"Tafsiri ya mitazamo mingi ni ya kipekee.\" - Juma, 34",
            social_proof_testimonial3: "\"Nilipata mtu aliyeota sawa kupitia programu!\" - Rehema, 31",
            processing_context: "Inazingatia:",
            backup_title: "Hifadhi ya Data (Nakala)",
            backup_desc: "Hifadhi data yako kama faili au rejesha nakala.",
            export_btn: "Pakua Nakala",
            import_btn: "Rejesha Nakala",
            home_label: "Nyumbani",
            map_label: "Ramani",
            live_chat_label: "Mazungumzo ya Moja kwa Moja",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5 Sarafu Bonasi: Video kwa Sauti Yako!",
            audio_coin_desc: "Rekodi yako imehifadhiwa. Unda video ya ndoto kwa sauti yako katika Wasifu na upate sarafu 5!",
            upload_audio: "Pakia",
            upload_confirm_title: "Sauti Imehifadhiwa!",
            upload_confirm_desc: "Rekodi yako ya sauti imehifadhiwa na ndoto. Angalia katika Wasifu chini ya 'Sauti'!",
            got_it: "Sawa!",
            backup_restored: "Nakala imerejeshwa kwa mafanikio!",
            backup_error: "Hitilafu ya kurejesha. Faili batili.",
            storage_init: "Hifadhi inaanzishwa. Tafadhali subiri.",
            mic_denied_alert: "Ufikiaji wa maikrofoni umekataliwa",
            min_dreams_required: "Unahitaji angalau ndoto 7 zilizotafsiriwa kutumia kipengele cha uchambuzi.",
            base_version: "Toleo la Msingi",
            until_date: "Hadi:",
            audio_recorded: "Sauti imerekodiwa",
            audio_saved_with_dream: "Itahifadhiwa na ndoto",
            remove: "Ondoa",
            oracle_voice: "Sauti ya Oracle",
            image_ready: "Picha Iko Tayari!",
            style_desc_cartoon: "Mtindo wa Pixar",
            style_desc_anime: "Mtindo wa Ghibli",
            style_desc_real: "Picha Halisi",
            style_desc_fantasy: "Uchawi",
            cosmic_dna: "DNA ya Ulimwengu",
            moon_sync: "Usawazishaji wa Mwezi",
            cosmic_dna_body: "DNA yako ya Ulimwengu ni alama ya vidole ya ndoto yako ya kipekee — kulingana na tarehe ya kuzaliwa, ishara ya zodiac, na mifumo ya ndoto zako.",
            cosmic_dna_coming: "Inakuja Hivi Karibuni",
            cosmic_dna_enter: "Ingiza tarehe yako ya kuzaliwa kwenye wasifu wako ili kuhesabu DNA yako ya Ulimwengu.",
            moon_phase_label: "Awamu ya mwezi",
            dream_meaning_today: "Maana ya ndoto leo",
            save_btn: "Hifadhi",
            age_restricted_cat: "Kategoria hii inapatikana kwa watu wenye umri wa miaka 18 na zaidi pekee.",
            ok: "Sawa",
            video_studio: "Studio ya Video",
            dream_network: "Mtandao wa Ndoto",
            privacy_link: "Faragha", terms_link: "Masharti", imprint_link: "Alama", research_link: "Utafiti", studies_link: "Tafiti", worldmap_link: "Ramani ya Dunia", showing_sources_only: "Inaonyesha vyanzo vya {0} pekee", science_label: "Maarifa",
        },
        processing: {
            title: "Oracle inafanya kazi...",
            step_analyze: "Inachambua tafsiri ya ndoto",
            step_customer: "Inazingatia muktadha wa mteja",
            step_no_customer: "Hakuna muktadha wa mteja",
            step_context: "Kategoria & Mila zinakokotolewa",
            step_no_context: "Hakuna mila maalum zilizochaguliwa",
            step_image: "Inatengeneza maono",
            step_save: "Imehifadhiwa kwenye kalenda na wasifu"
        },
        sub: {
            title: "Chagua Mpango Wako",
            billing_monthly: "Kila Mwezi", billing_yearly: "Kila Mwaka",
            yearly_discount: "Mwezi 1 Bure!",
            smart_discount: "Kwa Waendelezaji",
            free_title: "Bure",
            free_price: "0 €",
            free_features: ["Tafsiri ya Msingi (Yenye matangazo)", "Ufikiaji wa Offerwall kwa sarafu bure", "Premium kwa sarafu", "Kushiriki viungo pekee"],
            silver_title: "Pro",
            silver_price: "4.99 € / mwezi",
            silver_features: ["Bila Matangazo", "Ubadilishaji PDF & Upakuaji Usio na Kikomo", "Tafsiri Zisizo na Kikomo", "Picha 25 HD/mwezi", "Mazungumzo ya Moja kwa Moja 1/wiki", "Sauti I/O"],
            gold_title: "Gold (VIP)",
            gold_price: "12.99 € / mwezi",
            gold_trial_text: "Siku 7 bure, kisha 12.99 €/mwezi",
            gold_features: ["Vipengele vyote vya Silver", "Mazungumzo ya Oracle Bila Kikomo", "Video 5 za Ndoto/mwezi", "Punguzo Maalum la Sarafu", "Msaada wa Kipaumbele"],
            smart_title: "Smart (Mtengenezaji)",
            smart_price: "49.99 € / mwaka",
            smart_features: ["Tumia Key Yako (BYOK)", "Vipengele vyote vya Premium", "Mzunguko wa Moja kwa Moja wa Mtoa Huduma", "Bei ya Kudumu ya Mwaka (29.99€)"],
            smart_info_title: "Smart Developer ni nini?",
            smart_info_text: "Kwa waendelezaji & wapenda teknolojia: Fungua akaunti na watoa huduma za AI (mfano Google AI Studio), tengeneza API keys zako, na uziongeze kwenye programu. Utalipa gharama ndogo za API moja kwa moja + €3 kwa matumizi ya programu. Bora kwa watumiaji wa hali ya juu!",
            upgrade: "Boresha", current: "Sasa Hivi", unlock: "Fungua", try_free: "JARIBU BURE KWA SIKU 7",
            ad_loading: "Inapakia Tangazo...", ad_reward: "Sarafu zimepatikana!",
            bronze_title: "Bure", bronze_features: ["Tafsiri 3/Siku", "Groq AI", "Mila 6", "Matangazo"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["Tafsiri Zisizo na Kikomo", "Gemini AI", "Mila zote 9", "Bila Matangazo", "Sarafu 100/Mwezi", "Punguzo 10% la Sarafu"], silver2_price_monthly: "€4.99 / Mwezi", silver2_price_yearly: "€49.99 / Mwaka",
            gold2_title: "Premium", gold2_features: ["Claude Mitazamo 6", "Sarafu 500/Mwezi", "Punguzo 20% la Sarafu", "Picha HD", "Video 5/Mwezi", "Sauti ya Moja kwa Moja", "AI Chat Premium"], gold2_price_monthly: "€14.99 / Mwezi", gold2_price_yearly: "€149.99 / Mwaka",
            
            pro_badge: "MAARUFU ZAIDI", vip_badge: "KIPEKEE 👑",
        },
        earn: {
            title: "Pata Sarafu",
            desc: "Kamilisha kazi ili kuongeza salio lako.",
            short_title: "Klipu Fupi", short_desc: "Sekunde 10", short_reward: "1",
            long_title: "Video ya Premium", long_desc: "Dakika 2", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Tafiti & Kazi", offer_reward: "5-10",
            offer_info: "Kamilisha tafiti, majaribio ya programu, au usajili kwa zawadi kubwa.",
            survey_task: "Utafiti wa Chapa", app_task: "Fikia Kiwango cha 5 katika Mchezo",
            watch_btn: "Tazama", start_btn: "Anza"
        },
        shop: {
            title: "Duka la Sarafu",
            desc: "Jaza akiba yako.",
            starter_label: "Mwanzo", starter_price: "1.99 €", starter_amount: "Sarafu 100",
            best_label: "Maarufu", best_price: "5.99 €", best_amount: "Sarafu 550", best_badge: "Maarufu",
            value_label: "Thamani Bora", value_price: "12.99 €", value_amount: "Sarafu 1500", value_badge: "Thamani Bora",
            free_link: "Unataka kupata sarafu bure? Bonyeza hapa.",
            buy_btn: "Nunua",
            wow_badge: "💎 Chini ya senti 1/Sarafu!",
            coins_label: "Sarafu",
            per_coin: "kwa sarafu",
            pkg_starter: "Jaribu", pkg_popular: "Maarufu", pkg_value: "Thamani Zaidi", pkg_premium: "Okoa Zaidi", pkg_mega: "Mtaalamu",
        },
        smart_guide: {
            step1_title: "Unda Akaunti", step1_desc: "Unda akaunti bure katika Google AI Studio.",
            step2_title: "Tengeneza Key", step2_desc: "Nakili API Key yako ya kibinafsi.",
            step3_title: "Bandika katika Programu", step3_desc: "Bandika key hapa ili kufungua Premium."
        }
    },
    [Language.HU]: {
        app_title: "Dream Code | Álomkód",
        app_subtitle: "Az emberiség összes tudása és egy szuperszámítógép – a zsebedben",
        source_subtitles: {
            [ReligiousSource.IBN_SIRIN]: "Baszra, Irak (7. sz.)",
            [ReligiousSource.NABULSI]: "Damaszkusz, Szíria (17. sz.)",
            [ReligiousSource.AL_ISKHAFI]: "Bagdad (Abbászida)",
            [ReligiousSource.ISLAMIC_NUMEROLOGY]: "Arab hagyomány (Abdzsad)",
            [ReligiousSource.MEDIEVAL]: "Európa (középkor)",
            [ReligiousSource.MODERN_THEOLOGY]: "Nyugati teológia",
            [ReligiousSource.CHURCH_FATHERS]: "Róma és Bizánc (patrisztika)",
            [ReligiousSource.ZEN]: "Kína és Japán",
            [ReligiousSource.TIBETAN]: "Tibet (Himalája)",
            [ReligiousSource.THERAVADA]: "Délkelet-Ázsia (Páli kánon)",
            [ReligiousSource.FREUDIAN]: "Bécs (pszichoanalízis)",
            [ReligiousSource.JUNGIAN]: "Zürich (analitikus pszichológia)",
            [ReligiousSource.GESTALT]: "Berlin / New York",
            [ReligiousSource.WESTERN_ZODIAC]: "Hellenisztikus hagyomány",
            [ReligiousSource.VEDIC_ASTROLOGY]: "India (Dzsótis)",
            [ReligiousSource.CHINESE_ZODIAC]: "Kína (holdnaptár)",
            [ReligiousSource.PYTHAGOREAN]: "Ókori Görögország",
            [ReligiousSource.CHALDEAN]: "Babilon (Mezopotámia)",
            [ReligiousSource.KABBALAH_NUMEROLOGY]: "Zsidó misztika (Spanyolország)",
            [ReligiousSource.VEDIC_NUMEROLOGY]: "India (Védák)",
            [ReligiousSource.IMAM_SADIQ]: "Síita hagyomány, Perzsia",
            [ReligiousSource.ISLAMSKI_SONNIK]: "Orosz-iszlám",
            [ReligiousSource.ZHOU_GONG]: "Kína, álomfejtés",
            [ReligiousSource.HATSUYUME]: "Japán, újévi álom",
            [ReligiousSource.SWAPNA_SHASTRA]: "India, védikus/hindu",
            [ReligiousSource.EDGAR_CAYCE]: "USA, alvó próféta",
            [ReligiousSource.RUDOLF_STEINER]: "Antropozófia, Ausztria",
            [ReligiousSource.TALMUD_BERAKHOT]: "Babilónia, 55a-57b",
            [ReligiousSource.ZOHAR]: "Kabbalisztikus, 13. sz.",
            [ReligiousSource.VANGA]: "Bulgária, 20. sz.",
            [ReligiousSource.MILLER_RU]: "Orosz álomfejtés",
            [ReligiousSource.FREUD_RU]: "Orosz Freud-adaptáció",
            [ReligiousSource.LOFF]: "Orosz álomkönyv",
            [ReligiousSource.NOSTRADAMUS_RU]: "Orosz adaptáció",
            [ReligiousSource.ARTEMIDOROS]: "Görögország, i.sz. 2. sz.",
            [ReligiousSource.EGYPTIAN_PAPYRUS]: "Egyiptom, kb. i.e. 1275",
            [ReligiousSource.SOMNIALE_DANIELIS]: "Bizánci-középkori"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Iszlám', [ReligiousCategory.CHRISTIAN]: 'Keresztény', [ReligiousCategory.BUDDHIST]: 'Buddhista', [ReligiousCategory.PSYCHOLOGICAL]: 'Pszichológia', [ReligiousCategory.ASTROLOGY]: 'Asztrológia', [ReligiousCategory.NUMEROLOGY]: 'Numerológia', [ReligiousCategory.JEWISH]: 'Zsidó', [ReligiousCategory.SONNIKS]: 'Álomkönyvek', [ReligiousCategory.ANCIENT]: 'Ókori',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibeti', [ReligiousSource.IBN_SIRIN]: 'Ibn Szirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Középkori', [ReligiousSource.MODERN_THEOLOGY]: 'Modern teológia', [ReligiousSource.CHURCH_FATHERS]: 'Egyházatyák', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Nyugati horoszkóp', [ReligiousSource.VEDIC_ASTROLOGY]: 'Védikus', [ReligiousSource.CHINESE_ZODIAC]: 'Kínai horoszkóp', [ReligiousSource.PYTHAGOREAN]: 'Pitagoraszi', [ReligiousSource.CHALDEAN]: 'Káldeus', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabbala', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abdzsad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Védikus számok', [ReligiousSource.IMAM_SADIQ]: 'Imam Szadik', [ReligiousSource.ISLAMSKI_SONNIK]: 'Iszlám álomfejtő', [ReligiousSource.ZHOU_GONG]: 'Zhou Gong', [ReligiousSource.HATSUYUME]: 'Hatsuyume', [ReligiousSource.SWAPNA_SHASTRA]: 'Swapna Shastra', [ReligiousSource.EDGAR_CAYCE]: 'Edgar Cayce', [ReligiousSource.RUDOLF_STEINER]: 'Rudolf Steiner', [ReligiousSource.TALMUD_BERAKHOT]: 'Talmud Berakhot', [ReligiousSource.ZOHAR]: 'Zohar', [ReligiousSource.VANGA]: 'Vanga', [ReligiousSource.MILLER_RU]: 'Miller', [ReligiousSource.FREUD_RU]: 'Freud (RU)', [ReligiousSource.LOFF]: 'Loff', [ReligiousSource.NOSTRADAMUS_RU]: 'Nostradamus', [ReligiousSource.ARTEMIDOROS]: 'Artemidórosz', [ReligiousSource.EGYPTIAN_PAPYRUS]: 'Egyiptomi papirusz', [ReligiousSource.SOMNIALE_DANIELIS]: 'Somniale Danielis'
        },
        ui: {
            placeholder: "Írd le az álmod...", interpret: "Álomfejtés", choose_tradition: "Hagyomány választása", refine_sources: "Források szűkítése", oracle_speaks: "Az Orákulum szól", close: "Bezárás", listening: "Hallgatás...", voices: "Hang",
            settings: "Beállítások", text_size: "Méret", dictation_error: "Hiba: Nincs mikrofon.", dictation_perm: "Engedély megtagadva.",
            calendar_btn: "Naptár & Elemzés", coming_soon: "Továbbiak...", calendar_desc: "Álomnapló",
            profile_btn: "Profilod", profile_desc: "Statisztikák & Én",
            hub_btn: "Álomközpont", hub_desc: "Közösségi álmok",
            gen_image: "Kép generálása", saved_msg: "Álom mentve a naptárba!",
            watch_ad: "Érmék szerzése", generate_video: "Videó generálása (Gold)", create_dream_video: "Álomvideó",
            video_btn_short: "📹 Videó generálása", video_duration_short: "30mp, 180 érme",
            slideshow_btn: "📽️ Diavetítés készítése", slideshow_duration: "30mp, 180 érme",
            premium_btn: "Premium / Csomag", premium_desc: "Frissítés & Funkciók",
            customer_file_btn: "Személyes háttérfájl",
            theme: "Megjelenés", mode: "Mód", dark: "Sötét", light: "Világos",
            style: "Stílus", style_def: "Alapértelmezett (Misztikus)", style_fem: "Feminin (Rózsa)", style_masc: "Maszkulin (Kék)", style_nature: "Természet (Zöld)",
            voice_char: "Hangkarakter", fem_char: "Női karakterek", male_char: "Férfi karakterek", preview: "Előnézet",
            info_title: "Tudásbázis", info_bio: "Életrajz", info_origin: "Eredet & Háttér",
            video_ready: "Az álomvideód kész!", video_gen: "Videó generálása...", video_error: "Generálás sikertelen.",
            map_btn: "Ki álmodott ugyanezt?",
            api_manager: "API kulcs kezelő (Smart)", api_desc: "Add hozzá Gemini API kulcsaidat. A rendszer automatikusan vált, ha elérted a limitet.", add_key: "Kulcs hozzáadása", no_keys: "Nem található kulcs.",
            quality_normal: "Normál", quality_high: "Magas minőség",
            style_cartoon: "Rajzfilm", style_anime: "Anime", style_real: "Valósághű", style_fantasy: "Fantasy",
            choose_quality: "Minőség választása", choose_style: "Stílus választása",
            choose_image_style: "Képstílus választása",
            choose_style_desc: "Válassz minőséget és stílust az álomképedhez",
            continue_without_image: "Folytatás kép nélkül",
            step_quality: "1. Minőség választása",
            step_style: "2. Stílus választása",
            continue: "Tovább",
            social_proof_stats: "47 832 álom elemezve · 12 543 álomegyezés találva",
            social_proof_testimonial1: "\"Végre megértem az ismétlődő álmaimat!\" - Anna, 28",
            social_proof_testimonial2: "\"A többszempontú értelmezés egyedülálló.\" - Gábor, 34",
            social_proof_testimonial3: "\"Az appon keresztül találtam valakit, aki ugyanazt álmodta!\" - Eszter, 31",
            processing_context: "Figyelembe véve:",
            backup_title: "Adattrezor (Biztonsági mentés)",
            backup_desc: "Mentsd el adataidat fájlként, vagy állítsd vissza egy mentést.",
            export_btn: "Mentés letöltése",
            import_btn: "Mentés visszaállítása",
            home_label: "Kezdőlap",
            map_label: "Térkép",
            live_chat_label: "Élő chat",
            tier_bronze: "FREE",
            tier_silver: "PRO",
            tier_gold: "PREMIUM",
            tier_smart: "Smart",
            audio_coin_prompt: "💰 +5 érme bónusz: Videó a te hangoddal!",
            audio_coin_desc: "A felvételed mentve. Készíts álomvideót a saját hangoddal a Profilban és szerezz 5 érmét!",
            upload_audio: "Feltöltés",
            upload_confirm_title: "Hang sikeresen mentve!",
            upload_confirm_desc: "A hangfelvételed az álommal együtt mentve. Nézd meg a Profilodban az 'Audió' alatt!",
            got_it: "Értem!",
            backup_restored: "Biztonsági mentés sikeresen visszaállítva!",
            backup_error: "Hiba a visszaállítás során. Érvénytelen fájl.",
            storage_init: "A tároló inicializálódik. Kérlek várj.",
            mic_denied_alert: "Mikrofon hozzáférés megtagadva",
            min_dreams_required: "Legalább 7 értelmezett álom szükséges az elemzés funkció használatához.",
            base_version: "Alap verzió",
            until_date: "Eddig:",
            audio_recorded: "Hang rögzítve",
            audio_saved_with_dream: "Az álommal együtt lesz mentve",
            remove: "Eltávolítás",
            oracle_voice: "Orákulum hang",
            image_ready: "Kép kész!",
            style_desc_cartoon: "Pixar stílus",
            style_desc_anime: "Ghibli stílus",
            style_desc_real: "Fotórealisztikus",
            style_desc_fantasy: "Varázslatos",
            cosmic_dna: "Kozmikus DNS",
            moon_sync: "Hold szinkron",
            cosmic_dna_body: "A Kozmikus DNS-ed az álmaid egyedi ujjlenyomata — a születési dátumod, csillagjegyed és álommintáid alapján.",
            cosmic_dna_coming: "Hamarosan",
            cosmic_dna_enter: "Add meg a születési dátumodat a profilodban a Kozmikus DNS-ed kiszámításához.",
            moon_phase_label: "Holdfázis",
            dream_meaning_today: "Mai álomjelentés",
            save_btn: "Mentés",
            age_restricted_cat: "Ez a kategória csak 18 éven felülieknek érhető el.",
            ok: "OK",
            video_studio: "Videó Stúdió",
            dream_network: "Álomhálózat",
            privacy_link: "Adatvédelem", terms_link: "Feltételek", imprint_link: "Impresszum", research_link: "Kutatás", studies_link: "Tanulmányok", worldmap_link: "Világtérkép", showing_sources_only: "Csak {0} források megjelenítése", science_label: "Tudás",
        },
        processing: {
            title: "Az Orákulum dolgozik...",
            step_analyze: "Álomértelmezés elemzése",
            step_customer: "Személyes kontextus figyelembevétele",
            step_no_customer: "Nincs személyes kontextus",
            step_context: "Kategóriák & Hagyományok kiszámítása",
            step_no_context: "Nincs konkrét hagyomány kiválasztva",
            step_image: "Látomás generálása",
            step_save: "Mentve a naptárba és profilba"
        },
        sub: {
            title: "Válaszd ki a csomagod",
            billing_monthly: "Havi", billing_yearly: "Éves",
            yearly_discount: "1 hónap ingyen!",
            smart_discount: "Fejlesztőknek",
            free_title: "Ingyenes",
            free_price: "0 €",
            free_features: ["Alap értelmezés (hirdetésekkel)", "Offerwall hozzáférés ingyenes érmékért", "Premium érmékkel", "Csak link megosztás"],
            silver_title: "Pro",
            silver_price: "4.99 € / hónap",
            silver_features: ["Hirdetésmentes", "Korlátlan PDF konverzió & letöltés", "Korlátlan értelmezés", "25 HD kép/hó", "Heti 1x élő chat", "Audió I/O"],
            gold_title: "Gold (VIP)",
            gold_price: "12.99 € / hónap",
            gold_trial_text: "7 nap ingyen, utána 12.99 €/hó",
            gold_features: ["Minden Silver funkció", "Korlátlan élő Orákulum chat", "5 álomvideó/hó", "Exkluzív érme kedvezmény", "Kiemelt támogatás"],
            smart_title: "Smart (Fejlesztő)",
            smart_price: "49.99 € / év",
            smart_features: ["Saját kulcs (BYOK)", "Minden Premium funkció feloldva", "Automatikus szolgáltató váltás", "Fix éves ár (29.99€)"],
            smart_info_title: "Mi a Smart Developer csomag?",
            smart_info_text: "Fejlesztőknek & tech rajongóknak: Hozz létre fiókot AI szolgáltatóknál (pl. Google AI Studio), generáld a saját API kulcsodat, és add hozzá az apphoz. Így csak az alacsony API költségeket fizeted közvetlenül + €3 app használat. Tökéletes haladó felhasználóknak!",
            upgrade: "Frissítés", current: "Jelenlegi", unlock: "Feloldás", try_free: "PRÓBÁLD KI 7 NAPIG INGYEN",
            ad_loading: "Hirdetés betöltése...", ad_reward: "Érmék jóváírva!",
            bronze_title: "Ingyenes", bronze_features: ["3 értelmezés/nap", "Groq AI", "6 hagyomány", "Hirdetések"], bronze_price: "€0",
            silver2_title: "Pro", silver2_features: ["Korlátlan értelmezés", "Gemini AI", "Mind a 9 hagyomány", "Hirdetésmentes", "100 érme/hó", "10% érme kedvezmény"], silver2_price_monthly: "€4.99 / Hó", silver2_price_yearly: "€49.99 / Év",
            gold2_title: "Premium", gold2_features: ["Claude 6 nézőpont", "500 érme/hó", "20% érme kedvezmény", "HD képek", "5 videó/hó", "Élő hang", "Prémium AI Chat"], gold2_price_monthly: "€14.99 / Hó", gold2_price_yearly: "€149.99 / Év",
            
            pro_badge: "LEGNÉPSZERŰBB", vip_badge: "EXKLUZÍV 👑",
        },
        earn: {
            title: "Érmék szerzése",
            desc: "Teljesíts feladatokat az egyenleged feltöltéséhez.",
            short_title: "Rövid klip", short_desc: "10 másodperc", short_reward: "1",
            long_title: "Prémium videó", long_desc: "2 perc", long_reward: "3",
            offer_title: "Offerwall", offer_desc: "Kérdőívek & Feladatok", offer_reward: "5-10",
            offer_info: "Teljesíts kérdőíveket, appteszteket vagy regisztrációkat magas jutalmakért.",
            survey_task: "Márka kérdőív", app_task: "Érj el az 5. szintet a játékban",
            watch_btn: "Nézés", start_btn: "Indítás"
        },
        shop: {
            title: "Érmebolt",
            desc: "Töltsd fel a készleted.",
            starter_label: "Kezdő", starter_price: "1.99 €", starter_amount: "100 érme",
            best_label: "Népszerű", best_price: "5.99 €", best_amount: "550 érme", best_badge: "Népszerű",
            value_label: "Legjobb érték", value_price: "12.99 €", value_amount: "1500 érme", value_badge: "Legjobb érték",
            free_link: "Ingyenes érméket szeretnél? Kattints ide.",
            buy_btn: "Vásárlás",
            wow_badge: "💎 1 cent/érme alatt!",
            coins_label: "Érmék",
            per_coin: "érménként",
            pkg_starter: "Próbáld ki", pkg_popular: "Népszerű", pkg_value: "Több érték", pkg_premium: "Spórolj többet", pkg_mega: "Profi felhasználó",
        },
        smart_guide: {
            step1_title: "Fiók létrehozása", step1_desc: "Hozz létre ingyenes fiókot a Google AI Studióban.",
            step2_title: "Kulcs generálása", step2_desc: "Másold ki a személyes API kulcsodat.",
            step3_title: "Beillesztés az appba", step3_desc: "Illeszd be a kulcsot ide a Premium feloldásához."
        }
    }
};

interface ProcessingStep {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed' | 'skipped';
    isError?: boolean;
}

// Interfaces for Extracted Components
interface SettingsModalProps {
    onClose: () => void;
    t: any;
    isLight: boolean;
    apiKeyInput: string;
    setApiKeyInput: (val: string) => void;
    handleAddApiKey: () => void;
    handleRemoveApiKey: (key: string) => void;
    userProfile: UserProfile | null;
    themeMode: ThemeMode;
    handleThemeUpdate: (mode: ThemeMode | null, theme: DesignTheme | null) => void;
    designTheme: DesignTheme;
    handleExport: () => void;
    handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    language: string;
    onVoiceChange: (character: VoiceCharacter) => void;
    currentVoiceId?: string;
}

interface SubscriptionModalProps {
    onClose: () => void;
    t: any;
    isLight: boolean;
    userProfile: UserProfile | null;
    onUpdateSubscription: (tier: SubscriptionTier) => void;
    language?: string;
}

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.HOME);
    const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
    const [selectedStudyCode, setSelectedStudyCode] = useState<string>('');
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('dreamcode_language');
        if (saved && Object.values(Language).includes(saved as Language)) return saved as Language;
        const dl = navigator.language?.toLowerCase() || '';
        if (dl.startsWith('tr')) return Language.TR;
        if (dl.startsWith('es')) return Language.ES;
        if (dl.startsWith('fr')) return Language.FR;
        if (dl.startsWith('ar')) return Language.AR;
        if (dl.startsWith('pt')) return Language.PT;
        if (dl.startsWith('ru')) return Language.RU;
        if (dl.startsWith('zh')) return Language.ZH;
        if (dl.startsWith('hi')) return Language.HI;
        if (dl.startsWith('ja')) return Language.JA;
        if (dl.startsWith('ko')) return Language.KO;
        if (dl.startsWith('id')) return Language.ID;
        if (dl.startsWith('fa')) return Language.FA;
        if (dl.startsWith('it')) return Language.IT;
        if (dl.startsWith('pl')) return Language.PL;
        if (dl.startsWith('bn')) return Language.BN;
        if (dl.startsWith('ur')) return Language.UR;
        if (dl.startsWith('vi')) return Language.VI;
        if (dl.startsWith('th')) return Language.TH;
        if (dl.startsWith('sw')) return Language.SW;
        if (dl.startsWith('hu')) return Language.HU;
        if (dl.startsWith('en')) return Language.EN;
        return Language.DE;
    });
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('dreamcode_language', lang);
    };
    const [dreamInput, setDreamInput] = useState('');
    const [videoStudioDreamId, setVideoStudioDreamId] = useState<string | null>(null);
    const [videoStudioInterpretation, setVideoStudioInterpretation] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<ReligiousCategory[]>([]);
    const [selectedSources, setSelectedSources] = useState<ReligiousSource[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [dreams, setDreams] = useState<Dream[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const [lastInterpretation, setLastInterpretation] = useState('');
    const [lastSavedDreamId, setLastSavedDreamId] = useState('');
    const [isStorageReady, setIsStorageReady] = useState(false);
    const [currentAudioData, setCurrentAudioData] = useState<string | null>(null);
    const [audioIsFromLiveChat, setAudioIsFromLiveChat] = useState(false);
    const [showAudioUploadConfirm, setShowAudioUploadConfirm] = useState(false);

    // Info Modal State
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoModalData, setInfoModalData] = useState<any>(null);

    // Processing Steps State
    const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
    
    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeMode.DARK);
    const [designTheme, setDesignTheme] = useState<DesignTheme>(DesignTheme.DEFAULT);
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    
    // Settings: API Key Input State
    const [apiKeyInput, setApiKeyInput] = useState('');

    // Speech-to-Video Modal
    const [showSpeechModal, setShowSpeechModal] = useState(false);

    // Video State
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    // Image State
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);

    // Quality/Style Selection State (for analysis flow)
    const [showStyleSelection, setShowStyleSelection] = useState(false);
    const [pendingDreamData, setPendingDreamData] = useState<any>(null);

    // Subscription, Ads & SHOP State
    const [showSubModal, setShowSubModal] = useState(false);
    const [showEarnModal, setShowEarnModal] = useState(false);
    const [showCoinShop, setShowCoinShop] = useState(false);
    const [showCosmicDna, setShowCosmicDna] = useState(false);
    const [showMoonSync, setShowMoonSync] = useState(false);
    const [isAdPlaying, setIsAdPlaying] = useState(false);
    const [adDuration, setAdDuration] = useState(0);
    const adTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Cleanup ad timer on unmount
    useEffect(() => {
        return () => {
            if (adTimerRef.current) {
                clearTimeout(adTimerRef.current);
            }
        };
    }, []);

    // Sync body background + dark class with theme
    useEffect(() => {
        document.body.style.backgroundColor = themeMode === ThemeMode.LIGHT ? '#f0eefc' : '#0f0b1a';
        // Toggle .dark/.light on <html> for CSS variables + Tailwind dark: prefix
        if (themeMode === ThemeMode.LIGHT) {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
        }
    }, [themeMode]);

    // RTL support
    useEffect(() => {
        document.documentElement.dir = [Language.AR, Language.FA, Language.UR].includes(language) ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    // --- Persistence Initialization ---
    // !!! CRITICAL FIX: ASYNC LOADING TO PREVENT DATA OVERWRITE !!!
    useEffect(() => {
        const init = async () => {
            console.log("Initializing Data Vault...");
            try {
                // Sync-Check: Vergleicht localStorage und IndexedDB — nimmt neueren Stand
                const { dreams: syncedDreams, profile: syncedProfile } = await syncStorageOnStartup();
                const loadedDreams = syncedDreams;
                setDreams(loadedDreams);

                let loadedProfile = syncedProfile;

                if (!loadedProfile || !loadedProfile.name) {
                     console.log("No profile found in vault. Creating fresh default.");
                     loadedProfile = {
                         name: 'Dreamer',
                         interests: [],
                         credits: 9999,
                         subscriptionTier: SubscriptionTier.SMART,
                         isComplete: false,
                         customApiKeys: []
                     } as UserProfile;
                     await saveProfileSecurely(loadedProfile);
                } else {
                    console.log("Profile restored from vault:", loadedProfile.name);
                }
                
                // Restore Theme Prefs
                if (loadedProfile.themeMode) setThemeMode(loadedProfile.themeMode);
                if (loadedProfile.designTheme) setDesignTheme(loadedProfile.designTheme);

                // Language is now persisted in localStorage and auto-detected on first visit
                // via the useState initializer — no need to override here

                // DEV: Immer hoechste Stufe setzen damit nichts blockiert wird
                if (loadedProfile.subscriptionTier !== SubscriptionTier.SMART) {
                    loadedProfile = { ...loadedProfile, subscriptionTier: SubscriptionTier.SMART, credits: Math.max(loadedProfile.credits ?? 0, 9999) };
                    await saveProfileSecurely(loadedProfile);
                }
                // Ensure Credits
                if ((loadedProfile.credits ?? 0) < 100) {
                     loadedProfile = { ...loadedProfile, credits: 9999 };
                     await saveProfileSecurely(loadedProfile);
                }

                // Load saved categories from localStorage
                try {
                    const savedCategories = localStorage.getItem('dreamcode_saved_categories');
                    const savedSources = localStorage.getItem('dreamcode_saved_sources');
                    if (savedCategories) {
                        setSelectedCategories(JSON.parse(savedCategories));
                    }
                    if (savedSources) {
                        setSelectedSources(JSON.parse(savedSources));
                    }
                } catch (e) {
                    console.log('Could not load saved categories', e);
                }

                setUserProfile(loadedProfile);
            } catch (e) {
                console.error("Initialization Failed:", e);
            } finally {
                setIsStorageReady(true);
            }
        };
        init();
    }, []);

    // --- Payment-Success Handler (Stripe Redirect) ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        if (!sessionId) return;

        fetch('/api/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        })
            .then(res => res.json())
            .then(async (data) => {
                if (data.paymentStatus === 'paid') {
                    if (data.type === 'coins' && data.coins) {
                        const currentProfile = await loadProfileSecurely();
                        const base = currentProfile || userProfile;
                        if (base) {
                            const newCredits = (base.credits || 0) + data.coins;
                            const updated = { ...base, credits: newCredits };
                            setUserProfile(updated);
                            await saveProfileSecurely(updated);
                        }
                    } else if (data.type === 'subscription' && data.tier) {
                        const tierKey = data.tier.toUpperCase() as keyof typeof SubscriptionTier;
                        const newTier = SubscriptionTier[tierKey] || SubscriptionTier.FREE;
                        const currentProfile = await loadProfileSecurely();
                        const base = currentProfile || userProfile;
                        if (base) {
                            const updated = { ...base, subscriptionTier: newTier };
                            setUserProfile(updated);
                            await saveProfileSecurely(updated);
                        }
                    }
                }
                // URL bereinigen
                window.history.replaceState({}, '', '/');
            })
            .catch(console.error);
    // Einmalig beim Mount ausführen
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaveProfile = async (profile: UserProfile) => {
        if (!isStorageReady) return;
        const updatedProfile = {
            ...(userProfile || {}),
            ...profile,
            subscriptionTier: profile.subscriptionTier || userProfile?.subscriptionTier || SubscriptionTier.FREE,
            credits: profile.credits !== undefined ? profile.credits : (userProfile?.credits !== undefined ? userProfile.credits : 100)
        } as UserProfile;

        setUserProfile(updatedProfile);
        await saveProfileSecurely(updatedProfile); 
        setShowOnboarding(false);
    };
    
    // Update theme and save to profile
    const handleThemeUpdate = async (mode: ThemeMode | null, theme: DesignTheme | null) => {
        if (!isStorageReady) return;
        if (mode) setThemeMode(mode);
        if (theme) setDesignTheme(theme);
        
        if (userProfile) {
            const updated = { 
                ...userProfile, 
                themeMode: mode || themeMode, 
                designTheme: theme || designTheme 
            };
            setUserProfile(updated);
            await saveProfileSecurely(updated);
        }
    };

    // --- API Key Management ---
    const handleAddApiKey = async () => {
        if (apiKeyInput.trim().length > 0 && userProfile) {
            const currentKeys = userProfile.customApiKeys || [];
            // Prevent duplicates
            if (!currentKeys.includes(apiKeyInput.trim())) {
                const updated = { 
                    ...userProfile, 
                    customApiKeys: [...currentKeys, apiKeyInput.trim()] 
                };
                setUserProfile(updated);
                await saveProfileSecurely(updated);
            }
            setApiKeyInput('');
        }
    };

    const handleRemoveApiKey = async (keyToRemove: string) => {
        if (userProfile) {
            const currentKeys = userProfile.customApiKeys || [];
            const updated = {
                ...userProfile,
                customApiKeys: currentKeys.filter(k => k !== keyToRemove)
            };
            setUserProfile(updated);
            await saveProfileSecurely(updated);
        }
    };

    // Save categories to localStorage for persistence
    const handleSaveCategories = () => {
        try {
            localStorage.setItem('dreamcode_saved_categories', JSON.stringify(selectedCategories));
            localStorage.setItem('dreamcode_saved_sources', JSON.stringify(selectedSources));
            setShowSavedMessage(true);
            setTimeout(() => setShowSavedMessage(false), 2000);
        } catch (e) {
            console.error('Could not save categories', e);
        }
    };

    const handleUpdateSubscription = async (tier: SubscriptionTier) => {
        const baseProfile = userProfile || {
            name: "Dreamer",
            interests: [],
            credits: 100,
            subscriptionTier: SubscriptionTier.FREE,
            customApiKeys: []
        } as UserProfile;

        const updated = { ...baseProfile, subscriptionTier: tier };
        setUserProfile(updated); 
        await saveProfileSecurely(updated); 
        setShowSubModal(false); 
        
        // If Smart Tier is selected, hint the user to settings
        if (tier === SubscriptionTier.SMART) {
            setShowSettings(true);
        }
    };

    const triggerAd = (duration: number, reward: number) => {
        setShowEarnModal(false);
        setIsAdPlaying(true);
        setAdDuration(duration);

        // Cleanup vorherigen Timer falls noch aktiv
        if (adTimerRef.current) {
            clearTimeout(adTimerRef.current);
        }

        adTimerRef.current = setTimeout(async () => {
            adTimerRef.current = null;
            setIsAdPlaying(false);
            // Re-load to ensure we have latest before writing
            const currentProfile = await loadProfileSecurely();
            if (currentProfile) {
                const newCredits = (currentProfile.credits || 0) + reward;
                const updated = { ...currentProfile, credits: newCredits };
                setUserProfile(updated);
                await saveProfileSecurely(updated);
            } else if (userProfile) {
                 const updated = { ...userProfile, credits: (userProfile.credits || 0) + reward };
                 setUserProfile(updated);
                 await saveProfileSecurely(updated);
            }
        }, duration);
    };

    const handleCoinPurchase = async (amount: number) => {
        // Mock Purchase
        const currentProfile = await loadProfileSecurely();
        if (currentProfile) {
            const newCredits = (currentProfile.credits || 0) + amount;
            const updated = { ...currentProfile, credits: newCredits };
            setUserProfile(updated);
            await saveProfileSecurely(updated);
        }
        // Close shop after purchase
        setShowCoinShop(false);
    };

    const handleSaveDream = async (newDream: Dream) => {
        if (!isStorageReady) return;
        const updated = [newDream, ...dreams];
        setDreams(updated);
        await saveDreamsSecurely(updated);
    };

    const handleUpdateDream = async (updatedDream: Dream) => {
        if (!isStorageReady) return;
        const updated = dreams.map(d => d.id === updatedDream.id ? updatedDream : d);
        setDreams(updated);
        await saveDreamsSecurely(updated);
    };

    // --- BACKUP HANDLERS ---
    const handleExportData = () => {
        if (userProfile && dreams) {
            exportDataToFile(userProfile, dreams);
        }
    };

    const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const { profile, dreams: importedDreams } = await importDataFromFile(e.target.files[0]);
                setUserProfile(profile);
                setDreams(importedDreams);
                await saveProfileSecurely(profile);
                await saveDreamsSecurely(importedDreams);
                alert(TRANSLATIONS[language].ui.backup_restored);
            } catch (err) {
                alert(TRANSLATIONS[language].ui.backup_error);
            }
        }
    };

    const t = TRANSLATIONS[language];

    const toggleCategory = (category: ReligiousCategory) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(prev => prev.filter(c => c !== category));
        } else {
            setSelectedCategories(prev => [...prev, category]);
        }
    };

    const toggleSource = (source: ReligiousSource) => {
        if (selectedSources.includes(source)) {
            setSelectedSources(prev => prev.filter(s => s !== source));
        } else {
            setSelectedSources(prev => [...prev, source]);
        }
    };

    // INFO HANDLER
    const handleInfoClick = (itemKey: string) => {
        // Find data in current language or fallback to DE/EN
        const langData = KNOWLEDGE_BASE[language] || KNOWLEDGE_BASE[Language.DE];
        const data = (langData as any)[itemKey];
        
        if (data) {
            setInfoModalData(data);
            setShowInfoModal(true);
        }
    };

    // --- LIVE CHAT: Convert raw transcript to narrative story ---
    const convertTranscriptToStory = async (transcript: string, lang: Language): Promise<string> => {
        const userLines = transcript
            .split('\n')
            .filter(line => line.startsWith('[User]:'))
            .map(line => line.replace(/^\[User\]:\s*/, '').trim())
            .filter(Boolean);

        if (userLines.length === 0) return transcript;

        const userContent = userLines.join(' ');

        const LANG_NAMES: Record<string, string> = {
            de: 'Deutsch', tr: 'Türkisch', en: 'English', es: 'Spanisch',
            fr: 'Französisch', ar: 'Arabisch', pt: 'Portugiesisch', ru: 'Russisch',
        };
        const langName = LANG_NAMES[lang] || 'Deutsch';

        const systemPrompt = `You are a dream scribe. Convert the following dream fragments (spoken by the dreamer) into a single coherent dream narrative in ${langName}.
Rules:
- Use ONLY what the dreamer said. Do not add, invent or embellish anything.
- Write in first person ("Ich...").
- Use flowing prose with natural paragraph breaks.
- Do not include any meta-text, introductions or explanations – only the dream narrative itself.
- Respond in ${langName} only.`;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: userContent }],
                    language: lang,
                    systemPrompt,
                }),
            });
            if (!res.ok) return userContent;
            const data = await res.json();
            return data.reply || userContent;
        } catch {
            return userContent;
        }
    };

    // --- ENHANCED ANALYSIS HANDLER (FROZEN LOGIC) ---
    const handleAnalyze = async (directInput?: string) => {
        if (!isStorageReady) {
            alert(t.ui.storage_init);
            return;
        }
        const inputText = directInput || dreamInput;
        if (!inputText.trim()) return;

        let currentProfile = userProfile;
        // Ensure we have the absolute latest
        const freshProfile = await loadProfileSecurely();
        if (freshProfile) currentProfile = freshProfile;

        if (!currentProfile) {
            currentProfile = { name: 'Dreamer', interests: [], credits: 100, subscriptionTier: SubscriptionTier.FREE } as UserProfile;
        }

        const credits = currentProfile.credits ?? 0;
        const tier = currentProfile.subscriptionTier || SubscriptionTier.FREE;

        // Check Credits ONLY if not Smart Tier
        if (tier !== SubscriptionTier.SMART && credits < 1) {
             setShowCoinShop(true); // OPEN SHOP INSTEAD OF EARN
             return;
        }
        
        // Start Processing
        setLoading(true);
        setShowSavedMessage(false);
        
        // Deduct Credit (Only if not Smart)
        if (tier !== SubscriptionTier.SMART) {
            const updatedProfile = { ...currentProfile, credits: credits - 1 };
            setUserProfile(updatedProfile);
            await saveProfileSecurely(updatedProfile);
            currentProfile = updatedProfile; // Update local ref
        }

        // --- INITIALIZE STEPS (FROZEN ORDER) ---
        // 1. Analyze -> 2. Context (Tradition) -> 3. Customer -> 4. Image -> 5. Save
        const initialSteps: ProcessingStep[] = [
            { id: 'analyze', label: t.processing.step_analyze, status: 'active' },
            { id: 'context', label: t.processing.step_context, status: 'pending' }, 
            { id: 'customer', label: t.processing.step_customer, status: 'pending' }, 
            { id: 'image', label: t.processing.step_image, status: 'pending' },
            { id: 'save', label: t.processing.step_save, status: 'pending' }
        ];
        setProcessingSteps(initialSteps);

        const updateStep = (id: string, status: ProcessingStep['status'], label?: string, isError?: boolean) => {
            setProcessingSteps(prev => prev.map(s => s.id === id ? { ...s, status, label: label || s.label, isError } : s));
        };

        try {
            // STEP 1: ANALYSIS
            const result = await analyzeDreamText(inputText, language, currentProfile);
            updateStep('analyze', 'completed');

            // STEP 2: CATEGORIES & TRADITIONS
            if (selectedCategories.length > 0 || selectedSources.length > 0) {
                updateStep('context', 'active');
                await new Promise(r => setTimeout(r, 150));
                updateStep('context', 'completed');
            } else {
                updateStep('context', 'skipped', t.processing.step_no_context);
                await new Promise(r => setTimeout(r, 100));
            }

            // STEP 3: CUSTOMER CONTEXT
            const hasCustomerData = currentProfile && (
                (currentProfile.age && currentProfile.age.toString().trim() !== '') || 
                (currentProfile.gender && currentProfile.gender !== '') ||
                (currentProfile.lifeStressors && currentProfile.lifeStressors.length > 0) ||
                (currentProfile.psychSymptoms && currentProfile.psychSymptoms.length > 0) ||
                (currentProfile.remarks && currentProfile.remarks.trim().length > 0)
            );

            if (hasCustomerData) {
                updateStep('customer', 'active');
                await new Promise(r => setTimeout(r, 150));
                updateStep('customer', 'completed');
            } else {
                updateStep('customer', 'skipped', t.processing.step_no_customer);
                await new Promise(r => setTimeout(r, 100));
            }

            // PAUSE HERE: Show quality/style selection
            // Save all data needed to continue later
            setPendingDreamData({
                inputText,
                result,
                currentProfile,
                selectedCategories
            });
            setLoading(false);
            setShowStyleSelection(true);

        } catch (e) {
            console.error("Analysis failed", e);
            setLoading(false);
        }
    };

    const handleGenerateVideo = async (dreamDescription?: string, dreamId?: string) => {
        const prompt = dreamDescription || dreamInput;
        if (!prompt.trim()) return;

        setIsVideoLoading(true);
        try {
            // If user has recorded audio (dictation), use their voice instead of AI TTS
            const dreamObj = dreamId ? dreams.find(d => d.id === dreamId) : null;
            const userAudio = dreamObj ? dreamObj.audioUrl : currentAudioData;
            const isFromLiveChat = dreamObj ? dreamObj.audioSource === 'livechat' : audioIsFromLiveChat;
            const isUserVoice = !!userAudio && !isFromLiveChat;

            let result;
            if (isUserVoice && userAudio) {
                // User voice video: user's own recording as soundtrack
                result = await generateDreamUserVoiceVideo(
                    prompt,
                    userAudio,
                    'fantasy',
                    language,
                    (message, percent) => {
                        console.log(`[VIDEO-USER-VOICE] ${message} - ${percent}%`);
                    }
                );
                // Coin reward for using own voice
                const currentProfile = await loadProfileSecurely();
                if (currentProfile) {
                    const newCredits = (currentProfile.credits || 0) + 5;
                    const updated = { ...currentProfile, credits: newCredits };
                    setUserProfile(updated);
                    await saveProfileSecurely(updated);
                    console.log('[COINS] +5 Münzen für User-Voice Video');
                }
            } else {
                // AI voice video: analyze dream first, then TTS
                const analysis = await analyzeDreamText(prompt, language, userProfile);
                if (!analysis?.interpretation) {
                    throw new Error('Dream analysis failed');
                }
                result = await generateStoryVideo(
                    prompt,
                    analysis.interpretation,
                    'fantasy',
                    language,
                    (message, percent) => {
                        console.log(`[VIDEO] ${message} - ${percent}%`);
                    }
                );
            }

            if (result) {
                setVideoUrl(result.videoDataUrl);
                setShowVideoModal(true);
                // Persist video in dream
                if (dreamId) {
                    const dream = dreams.find(d => d.id === dreamId);
                    if (dream) {
                        await handleUpdateDream({ ...dream, videoUrl: result.videoDataUrl });
                    }
                }
            }
        } catch (e) {
            console.error('[VIDEO] Generation failed:', e);
            alert(t.ui.video_error);
        } finally {
            setIsVideoLoading(false);
        }
    };

    // Traum-Video: Roher Traum-Text + KI-Stimme (keine Deutung)
    const handleGenerateNarrationVideo = async (dreamDescription: string, dreamId?: string) => {
        if (!dreamDescription.trim()) return;
        setIsVideoLoading(true);
        try {
            const result = await generateDreamNarrationVideo(
                dreamDescription,
                'fantasy',
                language,
                (message, percent) => {
                    console.log(`[VIDEO-NARRATION] ${message} - ${percent}%`);
                }
            );
            if (result) {
                setVideoUrl(result.videoDataUrl);
                setShowVideoModal(true);
                // Persist video in dream
                if (dreamId) {
                    const dream = dreams.find(d => d.id === dreamId);
                    if (dream) {
                        await handleUpdateDream({ ...dream, videoUrl: result.videoDataUrl });
                    }
                }
            }
        } catch (e) {
            console.error('[VIDEO-NARRATION] Generation failed:', e);
            alert(t.ui.video_error);
        } finally {
            setIsVideoLoading(false);
        }
    };

    // Traum-Video: Roher Traum-Text + User-eigene Stimme + Coin-Belohnung
    const handleGenerateUserVoiceVideo = async (dreamDescription: string, userAudioBase64: string, dreamId?: string) => {
        if (!dreamDescription.trim() || !userAudioBase64) return;
        setIsVideoLoading(true);
        try {
            const result = await generateDreamUserVoiceVideo(
                dreamDescription,
                userAudioBase64,
                'fantasy',
                language,
                (message, percent) => {
                    console.log(`[VIDEO-USER-VOICE] ${message} - ${percent}%`);
                }
            );
            if (result) {
                setVideoUrl(result.videoDataUrl);
                setShowVideoModal(true);
                // Persist video in dream
                if (dreamId) {
                    const dream = dreams.find(d => d.id === dreamId);
                    if (dream) {
                        await handleUpdateDream({ ...dream, videoUrl: result.videoDataUrl });
                    }
                }

                // Coin-Belohnung fuer User-Voice Video
                const VOICE_VIDEO_REWARD = 5;
                const currentProfile = await loadProfileSecurely();
                if (currentProfile) {
                    const newCredits = (currentProfile.credits || 0) + VOICE_VIDEO_REWARD;
                    const updated = { ...currentProfile, credits: newCredits };
                    setUserProfile(updated);
                    await saveProfileSecurely(updated);
                    console.log(`[COINS] +${VOICE_VIDEO_REWARD} Münzen für User-Voice Video`);
                }
            }
        } catch (e) {
            console.error('[VIDEO-USER-VOICE] Generation failed:', e);
            alert(t.ui.video_error);
        } finally {
            setIsVideoLoading(false);
        }
    };

    const handleOpenVideoStudio = (dreamText: string, interpretation: string, dreamId: string, audioUrl?: string) => {
        setDreamInput(dreamText);
        setVideoStudioDreamId(dreamId);
        setVideoStudioInterpretation(interpretation);
        setLastInterpretation('');
        setLastSavedDreamId('');
        setView(View.VIDEO_STUDIO);
    };

    const handleGenerateImageWithStyle = async (
        quality: 'normal' | 'high',
        style: 'cartoon' | 'anime' | 'real' | 'fantasy',
        dreamDescription: string
    ) => {
        if (!dreamDescription.trim()) return;

        // Check subscription tier
        const tier = userProfile?.subscriptionTier || SubscriptionTier.FREE;
        const isPremium = quality === 'high' && (tier === SubscriptionTier.PRO || tier === SubscriptionTier.SMART);

        if (quality === 'high' && tier !== SubscriptionTier.PRO && tier !== SubscriptionTier.SMART) {
            setShowSubModal(true);
            return;
        }

        setIsImageLoading(true);
        try {
            const imageUrl = await generateDreamImage(dreamDescription, selectedCategories, userProfile, isPremium, style);
            if (imageUrl) {
                setImageUrl(imageUrl);
                setShowImageModal(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsImageLoading(false);
        }
    };

    const handleGenerateVideoWithStyle = async (
        quality: 'normal' | 'high',
        style: 'cartoon' | 'anime' | 'real' | 'fantasy',
        dreamDescription: string
    ) => {
        if (!dreamDescription.trim()) return;

        setIsVideoLoading(true);
        try {
            const url = await generateDreamVideo(dreamDescription, userProfile, quality, style);
            if (url) {
                setVideoUrl(url);
                setShowVideoModal(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsVideoLoading(false);
        }
    };

    const continueWithImageGeneration = async (quality: 'normal' | 'high', style: 'cartoon' | 'anime' | 'real' | 'fantasy' | null) => {
        if (!pendingDreamData) return;

        const { inputText, result, currentProfile, selectedCategories } = pendingDreamData;

        setShowStyleSelection(false);
        setLoading(true);

        try {
            // IMAGE GENERATION
            let imageUrl = undefined;

            // Skip image generation if style is null
            if (style !== null) {
                const generatedUrl = await generateDreamImage(inputText, currentProfile, quality, style, undefined, result.interpretation);
                if (generatedUrl) {
                    imageUrl = generatedUrl;
                }
            }

            // SAVE
            const now = new Date();
            const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

            const newDream: Dream = {
                id: Date.now().toString(),
                title: inputText.split(' ').slice(0, 5).join(' ') + "...",
                description: inputText,
                interpretation: result.interpretation,
                date: dateStr,
                tags: selectedCategories,
                matchPercentage: Math.floor(Math.random() * 30) + 70,
                likes: 0,
                comments: 0,
                userAvatar: currentProfile?.avatarUrl || '',
                imageUrl: imageUrl,
                ...(currentAudioData && {
                    audioUrl: currentAudioData,
                    audioTranscript: inputText,
                    audioSource: audioIsFromLiveChat ? 'livechat' as const : 'dictation' as const,
                    audioVisibility: AudioVisibility.PRIVATE // Default: nicht sichtbar
                })
            };

            console.log('💾 Saving dream with audio:', {
                hasAudio: !!currentAudioData,
                audioLength: currentAudioData?.length || 0,
                transcriptLength: inputText.length,
                dreamObject: {
                    hasAudioUrl: !!newDream.audioUrl,
                    hasAudioTranscript: !!newDream.audioTranscript
                }
            });

            await handleSaveDream(newDream);
            setLastInterpretation(result.interpretation || '');
            setLastSavedDreamId(newDream.id);
            await new Promise(r => setTimeout(r, 200));

            // Finish
            await new Promise(r => setTimeout(r, 300));
            setLoading(false);
            setDreamInput('');

            // Show upload confirmation if audio was recorded
            if (currentAudioData) {
                setShowAudioUploadConfirm(true);
            } else {
                setCurrentAudioData(null);
                setShowSavedMessage(true);
                setTimeout(() => setShowSavedMessage(false), 4000);
            }

            setPendingDreamData(null);

        } catch (e) {
            console.error("Image generation/save failed", e);
            setLoading(false);
        }
    };

    const handleLiveClick = () => {
        // Live Chat für alle Nutzer geöffnet
        setView(View.LIVE_SESSION);
    };




    // State for dictation recording
    const [dictationRecorder, setDictationRecorder] = useState<MediaRecorder | null>(null);
    const [dictationChunks, setDictationChunks] = useState<Blob[]>([]);

    const startDictation = async () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert(t.ui.dictation_error);
            return;
        }

        try {
            // Start audio recording
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = async () => {
                // Convert recorded audio to base64
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setCurrentAudioData(base64String);
                    setAudioIsFromLiveChat(false);
                    console.log('🎤 Diktat-Audio gespeichert:', base64String.length, 'chars');
                };
                reader.readAsDataURL(audioBlob);

                // Cleanup
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setDictationRecorder(recorder);
            setDictationChunks(chunks);

            // Start speech recognition
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.lang = language === Language.DE ? 'de-DE' :
                              language === Language.TR ? 'tr-TR' :
                              language === Language.ES ? 'es-ES' :
                              language === Language.FR ? 'fr-FR' :
                              language === Language.AR ? 'ar-SA' :
                              language === Language.PT ? 'pt-PT' :
                              language === Language.RU ? 'ru-RU' : 'en-US';
            recognition.continuous = true;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);

            recognition.onend = () => {
                setIsListening(false);
                // Stop audio recording when speech recognition ends
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
            };

            recognition.onerror = () => {
                setIsListening(false);
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
                alert(t.ui.dictation_perm);
            };

            recognition.onresult = (event: any) => {
                // Get ONLY the latest result to avoid repetition
                const lastResultIndex = event.results.length - 1;
                const transcript = event.results[lastResultIndex][0].transcript;
                setDreamInput(prev => {
                    const newText = prev.trim() + ' ' + transcript.trim();
                    return newText.trim();
                });
            };

            recognition.start();

            // Auto-stop after 60 seconds
            setTimeout(() => {
                if (recognition) {
                    recognition.stop();
                }
            }, 60000);

        } catch (error) {
            console.error('Diktat error:', error);
            alert(t.ui.mic_denied_alert);
        }
    };

    const stopDictation = () => {
        if (dictationRecorder && dictationRecorder.state === 'recording') {
            dictationRecorder.stop();
        }
        setIsListening(false);
    };
    
    const getAvailableSources = () => getSourcesForCategories(selectedCategories);

    const isLight = themeMode === ThemeMode.LIGHT;
    
    const appBgInput = isLight
        ? 'bg-white/80 backdrop-blur-md border-mystic-border shadow-md shadow-accent-primary/10 focus-within:border-accent-primary/50 focus-within:shadow-mystic'
        : 'bg-dream-surface/80 border-white/10 focus-within:border-accent-primary/40';

    // Render a simple loader if not ready
    if (!isStorageReady) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="font-mystic text-xl">Opening Oracle Vault...</h2>
            </div>
        );
    }

    // --- Render Content ---
    const renderHome = () => {
        const tier = userProfile?.subscriptionTier || SubscriptionTier.FREE;
        const credits = userProfile?.credits || 0;
        const noCredits = tier === SubscriptionTier.FREE && credits < 1;

        // HELPER FOR TIER DISPLAY
        const getTierDisplay = () => {
            const currentTier = userProfile?.subscriptionTier || SubscriptionTier.FREE;
            const nextMonth = new Date();
            nextMonth.setDate(nextMonth.getDate() + 30);
            const localeMap: Record<Language, string> = {
                [Language.DE]: 'de-DE', [Language.EN]: 'en-US', [Language.TR]: 'tr-TR',
                [Language.ES]: 'es-ES', [Language.FR]: 'fr-FR', [Language.AR]: 'ar-SA',
                [Language.PT]: 'pt-BR', [Language.RU]: 'ru-RU',
                [Language.ZH]: 'zh-CN', [Language.HI]: 'hi-IN', [Language.JA]: 'ja-JP',
                [Language.KO]: 'ko-KR', [Language.ID]: 'id-ID', [Language.FA]: 'fa-IR',
                [Language.IT]: 'it-IT', [Language.PL]: 'pl-PL', [Language.BN]: 'bn-BD',
                [Language.UR]: 'ur-PK', [Language.VI]: 'vi-VN', [Language.TH]: 'th-TH',
                [Language.SW]: 'sw-KE', [Language.HU]: 'hu-HU'
            };
            const dateStr = nextMonth.toLocaleDateString(localeMap[language] || 'de-DE', { day: '2-digit', month: '2-digit' });

            let label = t.ui.tier_bronze;
            let style = isLight ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-amber-900/20 text-amber-600 border-amber-700/30";
            let dateText = t.ui.base_version;

            if (currentTier === SubscriptionTier.PRO) {
                label = t.ui.tier_silver;
                style = isLight ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-slate-800 text-slate-300 border-slate-500";
                dateText = `${t.ui.until_date} ${dateStr}`;
            } else if (currentTier === SubscriptionTier.PREMIUM) {
                label = t.ui.tier_gold;
                style = isLight ? "bg-yellow-100 text-yellow-800 border-yellow-300" : "bg-yellow-900/20 text-yellow-400 border-yellow-500";
                dateText = `${t.ui.until_date} ${dateStr}`;
            } else if (currentTier === SubscriptionTier.SMART) {
                label = t.ui.tier_smart;
                style = isLight ? "bg-cyan-100 text-cyan-800 border-cyan-300" : "bg-cyan-900/20 text-cyan-400 border-cyan-500";
                dateText = `${t.ui.until_date} ${dateStr}`;
            }

            return { label, style, dateText };
        };

        const tierInfo = getTierDisplay();

        return (
        <div className="max-w-4xl mx-auto px-4 duration-500 pb-20">
             {/* HEADER */}
             <div className="flex items-start justify-between mb-6 gap-3">
                 <div className="flex-1 min-w-0">
                     <h1 className={`text-3xl sm:text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r ${isLight ? 'from-[#1e1035] via-[#4c1d95] to-[#7c3aed]' : 'from-violet-200 via-fuchsia-200 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]'}`} style={{ lineHeight: '1.15' }}>
                         {(() => {
                             const parts = t.app_title.split(' | ');
                             if (parts.length === 2) {
                                 return (
                                     <>
                                         <span className="block">{parts[0]}</span>
                                         <span className={`text-sm font-body font-normal mt-0.5 block ${isLight ? 'text-accent-primary' : 'text-fuchsia-300/60'}`}>| {parts[1]}</span>
                                     </>
                                 );
                             }
                             return t.app_title;
                         })()}
                     </h1>
                     <p className={`text-[11px] tracking-[0.15em] uppercase mt-1.5 leading-relaxed ${isLight ? 'text-[#4c1d95]' : 'bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-300'}`} style={isLight ? {} : { backgroundSize: '200% auto', animation: 'gradient-shift 4s ease infinite' }}>
                         {t.app_subtitle}
                     </p>
                 </div>

                 <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as Language)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${isLight ? 'bg-white/80 border-indigo-200 text-indigo-900' : 'bg-slate-800/80 border-fuchsia-500/30 text-white'}`}
                      >
                          <option value={Language.EN}>🇬🇧 EN</option>
                          <option value={Language.DE}>🇩🇪 DE</option>
                          <option value={Language.TR}>🇹🇷 TR</option>
                          <option value={Language.ES}>🇪🇸 ES</option>
                          <option value={Language.FR}>🇫🇷 FR</option>
                          <option value={Language.AR}>🇸🇦 AR</option>
                          <option value={Language.PT}>🇵🇹 PT</option>
                          <option value={Language.RU}>🇷🇺 RU</option>
                          <option value={Language.ZH}>🇨🇳 ZH</option>
                          <option value={Language.HI}>🇮🇳 HI</option>
                          <option value={Language.JA}>🇯🇵 JA</option>
                          <option value={Language.KO}>🇰🇷 KO</option>
                          <option value={Language.ID}>🇮🇩 ID</option>
                          <option value={Language.FA}>🇮🇷 FA</option>
                          <option value={Language.IT}>🇮🇹 IT</option>
                          <option value={Language.PL}>🇵🇱 PL</option>
                          <option value={Language.BN}>🇧🇩 BN</option>
                          <option value={Language.UR}>🇵🇰 UR</option>
                          <option value={Language.VI}>🇻🇳 VI</option>
                          <option value={Language.TH}>🇹🇭 TH</option>
                          <option value={Language.SW}>🇰🇪 SW</option>
                          <option value={Language.HU}>🇭🇺 HU</option>
                      </select>

                      {/* COINS & TIER */}
                      <div className="flex items-center gap-2">
                           {tier === SubscriptionTier.FREE && (
                               <div className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 ${isLight ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 shadow-sm shadow-amber-200/50' : 'bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border-amber-500/40 shadow-sm shadow-amber-500/20'}`}>
                                    <span className="text-base" style={{ filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.5))' }}>🪙</span>
                                    <span className={`text-base font-extrabold tabular-nums ${isLight ? 'text-amber-700' : 'text-amber-300'}`} style={{ textShadow: isLight ? 'none' : '0 0 8px rgba(245,158,11,0.4)' }}>{credits}</span>
                                    <button onClick={() => setShowCoinShop(true)} aria-label="Buy coins" className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white transition-transform hover:scale-110 ${isLight ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-amber-500 to-amber-700'}`}>+</button>
                               </div>
                           )}
                      </div>
                      <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider text-center ${tierInfo.style}`}>
                          {tierInfo.label}
                      </div>
                 </div>
             </div>

             <TrustBanner language={language} onNavigateToScience={() => setView(View.SCIENCE)} />

             {/* Dream Symbol Library Button */}
             <button onClick={() => setView(View.DREAM_SYMBOLS)}
                 className={`w-full mb-5 p-4 rounded-2xl border flex items-center gap-4 transition-all ${isLight ? 'bg-gradient-to-r from-indigo-50 to-fuchsia-50 border-indigo-200 hover:shadow-md hover:border-indigo-300' : 'bg-gradient-to-r from-indigo-900/20 to-fuchsia-900/15 border-white/10 hover:border-indigo-500/40 hover:bg-indigo-900/30'}`}>
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isLight ? 'bg-indigo-100' : 'bg-indigo-900/40'}`}>📚</div>
                 <div className="text-left flex-1">
                     <div className={`text-sm font-bold ${isLight ? 'text-indigo-900' : 'text-white'}`}>{t.ui.symbols_link || 'Traumsymbol-Bibliothek'}</div>
                     <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>258 {t.ui.symbols_link ? '' : 'Symbole'} · Freud · Ibn Sirin</div>
                 </div>
                 <span className={`material-icons text-lg ${isLight ? 'text-indigo-400' : 'text-indigo-500'}`}>chevron_right</span>
             </button>

             <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-[#4c1d95]' : 'text-slate-500'}`}>
                 <span className={`w-6 h-[1px] ${isLight ? 'bg-[#7c3aed]' : 'bg-slate-700'}`}></span> {t.ui.choose_tradition}
             </h3>

             <div className="grid grid-cols-3 gap-2.5 mb-5">
                 {CATEGORY_ORDER.map(cat => {
                     const isSelected = selectedCategories.includes(cat);
                     const colorScheme = CATEGORY_COLOR_SCHEME[cat];
                     const tierReq = CATEGORY_TIER_REQUIREMENT[cat];
                     const isLocked = tierReq !== SubscriptionTier.FREE && (userProfile?.subscriptionTier === SubscriptionTier.FREE);
                     let buttonClass = "relative overflow-hidden p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 group ";
                     if (colorScheme === 'emerald') {
                         if (isSelected) { buttonClass += "bg-emerald-900/80 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-100 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md" : "bg-emerald-900/20 border-emerald-500/40 hover:bg-emerald-900/40 hover:border-emerald-400/60"; }
                     } else if (colorScheme === 'indigo') {
                         if (isSelected) { buttonClass += "bg-indigo-900/80 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-indigo-50 border-indigo-200 shadow-sm shadow-indigo-100 hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-md" : "bg-indigo-900/20 border-indigo-500/40 hover:bg-indigo-900/40 hover:border-indigo-400/60"; }
                     } else if (colorScheme === 'amber') {
                         if (isSelected) { buttonClass += "bg-amber-900/80 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-amber-50 border-amber-200 shadow-sm shadow-amber-100 hover:bg-amber-100 hover:border-amber-300 hover:shadow-md" : "bg-amber-900/20 border-amber-500/40 hover:bg-amber-900/40 hover:border-amber-400/60"; }
                     } else if (colorScheme === 'rose') {
                         if (isSelected) { buttonClass += "bg-rose-900/80 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-rose-50 border-rose-200 shadow-sm shadow-rose-100 hover:bg-rose-100 hover:border-rose-300 hover:shadow-md" : "bg-rose-900/20 border-rose-500/40 hover:bg-rose-900/40 hover:border-rose-400/60"; }
                     } else if (colorScheme === 'stone') {
                         if (isSelected) { buttonClass += "bg-stone-800/80 border-stone-400 shadow-[0_0_25px_rgba(168,162,158,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-stone-50 border-stone-200 shadow-sm shadow-stone-100 hover:bg-stone-100 hover:border-stone-300 hover:shadow-md" : "bg-stone-900/20 border-stone-500/40 hover:bg-stone-900/40 hover:border-stone-400/60"; }
                     } else {
                         if (isSelected) { buttonClass += "bg-fuchsia-900/60 border-fuchsia-400 shadow-[0_0_25px_rgba(192,38,211,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-fuchsia-50 border-fuchsia-200 shadow-sm shadow-fuchsia-100 hover:border-fuchsia-300 hover:bg-fuchsia-100 hover:shadow-md" : "bg-slate-800/40 border-white/5 hover:bg-slate-800 hover:border-white/20"; }
                     }
                     let textClass = "";
                     if (colorScheme === 'emerald') { textClass = isSelected ? 'text-emerald-100' : (isLight ? 'text-emerald-700' : 'text-emerald-400'); }
                     else if (colorScheme === 'indigo') { textClass = isSelected ? 'text-indigo-100' : (isLight ? 'text-indigo-700' : 'text-indigo-400'); }
                     else if (colorScheme === 'amber') { textClass = isSelected ? 'text-amber-100' : (isLight ? 'text-amber-700' : 'text-amber-400'); }
                     else if (colorScheme === 'rose') { textClass = isSelected ? 'text-rose-100' : (isLight ? 'text-rose-700' : 'text-rose-400'); }
                     else if (colorScheme === 'stone') { textClass = isSelected ? 'text-stone-100' : (isLight ? 'text-stone-700' : 'text-stone-400'); }
                     else { textClass = isSelected ? 'text-white' : (isLight ? 'text-fuchsia-900' : 'text-slate-500'); }
                     return (
                         <button key={cat} onClick={() => isLocked ? undefined : toggleCategory(cat)} className={buttonClass + (isLocked ? ' opacity-60' : '')}>
                             {isSelected && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>}
                             {isLocked && <span className="absolute top-1 right-1 text-[9px] font-bold bg-black/40 text-white px-1.5 py-0.5 rounded-full">PRO</span>}
                             <span className={`text-3xl filter drop-shadow-lg transition-transform group-hover:scale-110 grayscale-0`}>
                                {CATEGORY_ICONS[cat]}
                             </span>
                             <span className={`text-[10px] font-bold uppercase tracking-wider leading-tight text-center ${textClass}`}>{t.categories[cat]}</span>
                         </button>
                     );
                 })}
             </div>

             {/* FEATURE PILLS */}
             <div className="flex justify-center gap-2 mb-5">
                 <button onClick={() => setShowCosmicDna(true)} className={`flex-1 max-w-[140px] py-2.5 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${isLight ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
                     <span className={`material-icons text-lg ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`}>fingerprint</span>
                     <span className={`text-[10px] font-bold uppercase leading-tight ${isLight ? 'text-indigo-700' : 'text-slate-300'}`}>{t.ui.cosmic_dna}</span>
                 </button>
                 <button onClick={() => setShowMoonSync(true)} className={`flex-1 max-w-[140px] py-2.5 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${isLight ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
                     <span className={`material-icons text-lg ${isLight ? 'text-purple-500' : 'text-purple-400'}`}>nightlight</span>
                     <span className={`text-[10px] font-bold uppercase leading-tight ${isLight ? 'text-purple-700' : 'text-slate-300'}`}>{t.ui.moon_sync}</span>
                 </button>
                 <button onClick={handleSaveCategories} className={`flex-1 max-w-[140px] py-2.5 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${isLight ? 'bg-pink-50 border-pink-200 hover:bg-pink-100' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
                     <span className={`material-icons text-lg ${isLight ? 'text-pink-500' : 'text-pink-400'}`}>bookmark</span>
                     <span className={`text-[10px] font-bold uppercase leading-tight ${isLight ? 'text-pink-700' : 'text-slate-300'}`}>{t.ui.save_btn}</span>
                 </button>
             </div>

             {selectedCategories.length > 0 && (
                 <div className="mb-8">
                     <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${isLight ? 'text-[#4c1d95]' : 'text-slate-400'}`}>
                        <span className={`w-8 h-[1px] ${isLight ? 'bg-[#7c3aed]' : 'bg-slate-600'}`}></span> {t.ui.refine_sources}
                     </h3>
                     {selectedCategories.length === 1 && (
                         <p className={`text-center text-[11px] mb-2 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                             {t.ui.showing_sources_only?.replace('{0}', t.categories[selectedCategories[0]]) || `${t.categories[selectedCategories[0]]} — filtered`}
                         </p>
                     )}
                     <div className="grid grid-cols-2 gap-2">
                         {getAvailableSources().map(src => {
                             const active = selectedSources.includes(src);
                             return (
                                 <button key={src} onClick={() => toggleSource(src)} className={`h-12 px-3 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${active ? 'bg-indigo-600/90 backdrop-blur-md border-indigo-400/60 text-white shadow-lg shadow-indigo-500/30' : (isLight ? 'bg-white/70 backdrop-blur-md border-slate-200/60 text-slate-600 hover:bg-indigo-50/80 hover:border-indigo-200/60' : 'bg-white/5 backdrop-blur-md border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20')}`}>
                                     <div className="flex flex-col min-w-0">
                                         <span className="text-[11px] font-bold leading-tight block truncate">{t.sources[src]}</span>
                                         <span className={`text-[9px] uppercase font-bold tracking-wide block leading-tight mt-0.5 truncate ${active ? 'text-indigo-200' : 'text-slate-500'}`}>{t.source_subtitles[src]}</span>
                                     </div>
                                     <div onClick={(e) => { e.stopPropagation(); handleInfoClick(src); }} className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ms-1 z-20 active:scale-95 transition-all ${active ? 'bg-white/20 hover:bg-white/40 text-white' : 'bg-black/10 hover:bg-black/20 text-slate-400'}`}>
                                         <span className="text-[10px] font-serif italic font-bold">i</span>
                                     </div>
                                 </button>
                             );
                         })}
                     </div>
                 </div>
             )}
             
             <div className={`${appBgInput} rounded-2xl p-1 mb-4 relative group border transition-all`}>
                  <textarea
                      value={dreamInput}
                      onChange={(e) => setDreamInput(e.target.value)}
                      placeholder={t.ui.placeholder}
                      className={`w-full bg-transparent p-4 text-base resize-none outline-none font-serif leading-relaxed transition-all ${isLight ? 'text-[#2a1a3a] placeholder-[#8b7aa0]' : 'text-white placeholder-slate-600'}`}
                      style={{ minHeight: '112px', maxHeight: '168px', overflowY: dreamInput.length > 200 ? 'auto' : 'hidden' }}
                      onInput={(e) => {
                          const el = e.currentTarget;
                          el.style.height = '112px';
                          el.style.height = Math.min(el.scrollHeight, 168) + 'px';
                      }}
                  />
                  <div className="flex justify-between items-center px-3 pb-3">
                      <button onClick={() => setShowSpeechModal(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${isLight ? 'text-violet-600 hover:bg-violet-100 border border-violet-200' : 'text-violet-400 hover:bg-violet-900/30 border border-violet-500/20'}`}>
                          <span className="material-icons text-sm">movie_creation</span>
                          {t.ui.create_dream_video}
                      </button>
                      <div className={`text-[10px] font-mono ${isLight ? 'text-[#6b5a80]' : 'text-slate-600'}`}>{dreamInput.length}</div>
                  </div>
             </div>

             {/* PRIMARY CTA */}
             <button onClick={() => handleAnalyze()} disabled={loading || !dreamInput} className={`relative w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all mb-4 ${loading || !dreamInput ? (isLight ? 'bg-[#c4bce6]/50 text-[#6b5a80] cursor-not-allowed' : 'bg-slate-800/40 text-slate-600 cursor-not-allowed') : noCredits ? 'bg-slate-800/60 backdrop-blur-md border border-slate-600/40 text-slate-400' : (isLight ? 'bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] text-white shadow-lg shadow-violet-500/40 hover:shadow-xl hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-xl hover:shadow-fuchsia-500/50 hover:scale-[1.02] active:scale-[0.98]')}`}>
                 {loading ? (<span className="flex items-center justify-center gap-3">{t.processing.title}</span>) : noCredits ? (<span className="flex items-center justify-center gap-2"><span className="material-icons">lock</span> {t.ui.interpret} (0 {t.ui.coins || 'Credits'})</span>) : (<span className="flex items-center justify-center gap-2"><span className="material-icons">auto_awesome</span> {t.ui.interpret}</span>)}
             </button>

             {lastInterpretation && lastSavedDreamId && (
                  <button onClick={() => handleOpenVideoStudio(dreams.find(d => d.id === lastSavedDreamId)?.description || '', lastInterpretation, lastSavedDreamId)} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border mb-4 ${isLight ? 'bg-gradient-to-r from-violet-100 to-fuchsia-100 border-violet-300 text-violet-700 hover:from-violet-200 hover:to-fuchsia-200' : 'bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border-violet-500/30 text-violet-200 hover:bg-violet-800/40'}`}>
                     <span className="material-icons">movie_filter</span> {t.ui.generate_video}
                  </button>
             )}

             {/* SECONDARY ACTIONS */}
             <div className="grid grid-cols-2 gap-2.5 mb-4">
                 <button
                    onClick={() => setView(View.DREAM_MAP)}
                    className={`relative py-3 rounded-xl overflow-hidden border group transition-all ${isLight ? 'bg-gradient-to-r from-indigo-50 to-white border-indigo-200' : 'border-indigo-500/20 bg-indigo-950/30 hover:border-indigo-400/40'}`}
                 >
                     <span className={`relative z-10 flex items-center justify-center gap-2 font-bold text-xs tracking-wider uppercase ${isLight ? 'text-indigo-600' : 'text-cyan-200'}`}>
                         <span className="material-icons text-base text-yellow-400">hub</span> {t.ui.map_btn}
                     </span>
                 </button>

                 <button onClick={() => setShowCalendar(true)} className={`py-3 border rounded-xl transition-all flex items-center justify-center gap-2 group ${isLight ? 'bg-white/70 border-indigo-200/40 hover:border-fuchsia-300/60' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                     <span className={`material-icons text-base ${isLight ? 'text-fuchsia-600' : 'text-fuchsia-400'}`}>calendar_month</span>
                     <span className={`text-xs font-bold ${isLight ? 'text-indigo-900' : 'text-slate-300'}`}>{t.ui.calendar_btn}</span>
                 </button>
             </div>

             {showSavedMessage && (
                 <div className="bg-green-900/80 border border-green-500/50 text-green-200 p-4 rounded-xl text-center mb-6  slide-in-from-top-2 shadow-lg">
                     <span className="material-icons text-xl align-middle me-2">verified</span>
                     <span className="text-lg font-bold font-mystic">{t.ui.saved_msg}</span>
                 </div>
             )}

             <div className="grid grid-cols-2 gap-2.5 mb-3">
                 <button onClick={() => setShowCoinShop(true)} className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${isLight ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-amber-900/30 hover:bg-amber-800/40 text-amber-200 border-amber-500/20'}`}>
                     <span className={`material-icons text-base ${isLight ? 'text-amber-500' : 'text-amber-400'}`}>storefront</span> {t.shop.title}
                 </button>

                 <button onClick={() => setShowSubModal(true)} className={`py-3 border rounded-xl transition-all flex items-center justify-center gap-2 group ${isLight ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-yellow-200 hover:border-yellow-300' : 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border-amber-500/20 hover:border-amber-500/40'}`}>
                     <span className={`material-icons text-base ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>diamond</span>
                     <span className={`text-xs font-bold ${isLight ? 'text-amber-800' : 'text-amber-200'}`}>{t.ui.premium_btn}</span>
                 </button>
             </div>

             <button onClick={() => setShowOnboarding(true)} className={`w-full py-2.5 border rounded-xl flex items-center justify-center gap-2 group transition-all ${isLight ? 'bg-white/70 border-indigo-200/40 hover:border-violet-300/60' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-500/30'}`}>
                 <span className={`material-icons text-base transition-colors ${isLight ? 'text-violet-500' : 'text-violet-400'}`}>assignment_ind</span>
                 <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-indigo-900' : 'text-slate-400'}`}>{t.ui.customer_file_btn}</span>
             </button>
        </div>
        );
    };

    return (
        <ErrorBoundary>
        <React.Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0b1a', color: '#7c3aed', fontFamily: 'Cinzel, serif', fontSize: '1.2rem' }}>DreamCode...</div>}>
        <div dir={[Language.AR, Language.FA, Language.UR].includes(language) ? 'rtl' : 'ltr'} style={{ backgroundColor: isLight ? '#f0eefc' : '#0f0b1a' }} className={`min-h-screen font-sans relative overflow-x-hidden transition-colors duration-700 ${isLight ? 'text-mystic-text selection:bg-accent-primary/30' : 'text-slate-200 selection:bg-accent-primary/30'}`}>
            <StarryBackground themeMode={themeMode} designTheme={designTheme} />
            
            {loading && <ProcessingOverlay isLight={isLight} steps={processingSteps} categories={selectedCategories} sources={selectedSources} t={t} />}
            {isVideoLoading && <VideoLoadingOverlay t={t} />}
            {isAdPlaying && <AdOverlay t={t} duration={adDuration} />}
            {showSubModal && <SubscriptionModal onClose={() => setShowSubModal(false)} t={t} isLight={isLight} userProfile={userProfile} onUpdateSubscription={handleUpdateSubscription} language={language} />}
            {showEarnModal && <EarnCoinsModal onClose={() => setShowEarnModal(false)} t={t} isLight={isLight} onWatch={triggerAd} />}
            {showCoinShop && <CoinShopModal onClose={() => setShowCoinShop(false)} t={t} isLight={isLight} onPurchase={handleCoinPurchase} onEarnFree={() => { setShowCoinShop(false); setShowEarnModal(true); }} />}
            {showSettings && (
                <SettingsModal 
                    onClose={() => setShowSettings(false)}
                    t={t}
                    isLight={isLight}
                    apiKeyInput={apiKeyInput}
                    setApiKeyInput={setApiKeyInput}
                    handleAddApiKey={handleAddApiKey}
                    handleRemoveApiKey={handleRemoveApiKey}
                    userProfile={userProfile}
                    themeMode={themeMode}
                    handleThemeUpdate={handleThemeUpdate}
                    designTheme={designTheme}
                    handleExport={handleExportData}
                    handleImport={handleImportData}
                    language={language}
                    onVoiceChange={(character: VoiceCharacter) => {
                        localStorage.setItem('dreamcode_selected_voice', JSON.stringify({ id: character.id }));
                    }}
                    currentVoiceId={(() => { try { const s = localStorage.getItem('dreamcode_selected_voice'); return s ? JSON.parse(s).id : undefined; } catch { return undefined; } })()}
                />
            )}
            {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} data={infoModalData} t={t} isLight={isLight} />}

            {/* COSMIC DNA MODAL */}
            {showCosmicDna && (
                <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCosmicDna(false)}>
                    <div className={`w-[95%] max-w-md ${isLight ? 'bg-white/95 border-indigo-100/60' : 'bg-dream-surface/95 border-fuchsia-500/20'} backdrop-blur-md border rounded-2xl shadow-2xl overflow-hidden`} onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-fuchsia-900 p-6 text-center">
                            <span className="text-4xl">🧬</span>
                            <h2 className="text-xl font-bold text-white mt-2">{t.ui.cosmic_dna}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                                {t.ui.cosmic_dna_body}
                            </p>
                            <div className={`p-4 rounded-xl border ${isLight ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-900/20 border-indigo-500/30'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                                    {t.ui.cosmic_dna_coming}
                                </p>
                                <p className={`text-xs ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
                                    {t.ui.cosmic_dna_enter}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 pt-0">
                            <button onClick={() => setShowCosmicDna(false)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-sm shadow-lg">{t.ui.close}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MOON SYNC MODAL */}
            {showMoonSync && (() => {
                const now = new Date();
                const synodicMonth = 29.53059;
                const knownNewMoon = new Date('2000-01-06T18:14:00Z');
                const daysSinceNew = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
                const moonAge = ((daysSinceNew % synodicMonth) + synodicMonth) % synodicMonth;
                const moonPhaseIdx = Math.floor((moonAge / synodicMonth) * 8) % 8;
                const moonEmojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
                const moonPhaseNames: Record<string, string[]> = {
                    [Language.DE]: ['Neumond', 'Zunehmender Sichelmond', 'Erstes Viertel', 'Zunehmender Mond', 'Vollmond', 'Abnehmender Mond', 'Letztes Viertel', 'Abnehmender Sichelmond'],
                    [Language.EN]: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'],
                    [Language.TR]: ['Yeni Ay', 'Hilal', 'İlk Dördün', 'Şişkin Ay', 'Dolunay', 'Küçülen Ay', 'Son Dördün', 'Küçülen Hilal'],
                    [Language.ES]: ['Luna Nueva', 'Creciente', 'Cuarto Creciente', 'Gibosa Creciente', 'Luna Llena', 'Gibosa Menguante', 'Cuarto Menguante', 'Menguante'],
                    [Language.FR]: ['Nouvelle Lune', 'Croissant', 'Premier Quartier', 'Gibbeuse Croissante', 'Pleine Lune', 'Gibbeuse Décroissante', 'Dernier Quartier', 'Décroissant'],
                    [Language.AR]: ['محاق', 'هلال متزايد', 'تربيع أول', 'أحدب متزايد', 'بدر', 'أحدب متناقص', 'تربيع أخير', 'هلال متناقص'],
                    [Language.PT]: ['Lua Nova', 'Crescente', 'Quarto Crescente', 'Gibosa Crescente', 'Lua Cheia', 'Gibosa Minguante', 'Quarto Minguante', 'Minguante'],
                    [Language.RU]: ['Новолуние', 'Растущий серп', 'Первая четверть', 'Растущая луна', 'Полнолуние', 'Убывающая луна', 'Последняя четверть', 'Убывающий серп'],
                    [Language.ZH]: ['新月', '峨眉月', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '残月'],
                    [Language.HI]: ['अमावस्या', 'बढ़ता चाँद', 'प्रथम तिमाही', 'पूर्ण बढ़ता', 'पूर्णिमा', 'घटता पूर्ण', 'अंतिम तिमाही', 'घटता चाँद'],
                    [Language.JA]: ['新月', '三日月', '上弦の月', '十三夜月', '満月', '寝待月', '下弦の月', '二十六夜月'],
                    [Language.KO]: ['삭', '초승달', '상현달', '상현망간', '보름달', '하현망간', '하현달', '그믐달'],
                    [Language.ID]: ['Bulan Baru', 'Bulan Sabit Muda', 'Kuartal Pertama', 'Cembung Muda', 'Bulan Purnama', 'Cembung Tua', 'Kuartal Terakhir', 'Bulan Sabit Tua'],
                    [Language.FA]: ['ماه نو', 'هلال در حال رشد', 'ربع اول', 'محدب در حال رشد', 'ماه کامل', 'محدب در حال کاهش', 'ربع آخر', 'هلال در حال کاهش'],
                    [Language.IT]: ['Luna Nuova', 'Crescente', 'Primo Quarto', 'Gibbosa Crescente', 'Luna Piena', 'Gibbosa Calante', 'Ultimo Quarto', 'Calante'],
                    [Language.PL]: ['Nów', 'Przybywający Sierp', 'Pierwsza Kwadra', 'Przybywający Garb', 'Pełnia', 'Ubywający Garb', 'Ostatnia Kwadra', 'Ubywający Sierp'],
                    [Language.BN]: ['অমাবস্যা', 'বাড়ন্ত চাঁদ', 'প্রথম ত্রৈমাসিক', 'পূর্ণ বাড়ন্ত', 'পূর্ণিমা', 'কমন্ত পূর্ণ', 'শেষ ত্রৈমাসিক', 'কমন্ত চাঁদ'],
                    [Language.UR]: ['نیا چاند', 'بڑھتا ہلال', 'پہلی سہ ماہی', 'بڑھتا پورا', 'پورا چاند', 'گھٹتا پورا', 'آخری سہ ماہی', 'گھٹتا ہلال'],
                    [Language.VI]: ['Trăng Mới', 'Trăng Lưỡi Liềm Tăng', 'Trăng Bán Nguyệt Đầu', 'Trăng Khuyết Tăng', 'Trăng Tròn', 'Trăng Khuyết Giảm', 'Trăng Bán Nguyệt Cuối', 'Trăng Lưỡi Liềm Giảm'],
                    [Language.TH]: ['ดับ', 'ขึ้น 3 ค่ำ', 'ขึ้น 8 ค่ำ', 'ขึ้น 13 ค่ำ', 'เพ็ญ', 'แรม 3 ค่ำ', 'แรม 8 ค่ำ', 'แรม 13 ค่ำ'],
                    [Language.SW]: ['Mwezi Mpya', 'Mwandamo', 'Robo ya Kwanza', 'Mwezi Mkubwa Unaokua', 'Mwezi Mzima', 'Mwezi Mkubwa Unaopungua', 'Robo ya Mwisho', 'Mwandamo Unaopungua'],
                    [Language.HU]: ['Újhold', 'Növekvő Sarló', 'Első Negyed', 'Növekvő Púpos', 'Telihold', 'Fogyó Púpos', 'Utolsó Negyed', 'Fogyó Sarló'],
                };
                const phaseName = (moonPhaseNames[language] || moonPhaseNames[Language.EN])[moonPhaseIdx];
                const dreamMeaningMap: Record<string, string[]> = {
                    [Language.DE]: ['Neuanfänge. Ideale Nacht für Intention-Setting.', 'Wachstum. Träume zeigen aufkeimende Ideen.', 'Entscheidungen. Träume konfrontieren mit Wahlmöglichkeiten.', 'Klarheit. Träume werden lebhafter und detailreicher.', 'Höhepunkt. Intensivste Traumphase — starke Symbole und Emotionen.', 'Loslassen. Träume verarbeiten Vergangenes.', 'Reflexion. Träume zeigen innere Konflikte.', 'Stille. Träume werden leiser — Zeit für Integration.'],
                    [Language.EN]: ['New beginnings. Ideal night for intention-setting.', 'Growth. Dreams reveal emerging ideas.', 'Decisions. Dreams confront you with choices.', 'Clarity. Dreams become more vivid and detailed.', 'Peak. Most intense dream phase — strong symbols and emotions.', 'Release. Dreams process the past.', 'Reflection. Dreams reveal inner conflicts.', 'Stillness. Dreams grow quieter — time for integration.'],
                    [Language.TR]: ['Yeni başlangıçlar. Niyet belirleme için ideal gece.', 'Büyüme. Rüyalar filizlenen fikirleri ortaya çıkarır.', 'Kararlar. Rüyalar sizi seçimlerle yüzleştirir.', 'Netlik. Rüyalar daha canlı ve ayrıntılı hale gelir.', 'Zirve. En yoğun rüya evresi — güçlü semboller ve duygular.', 'Bırakma. Rüyalar geçmişi işler.', 'Yansıma. Rüyalar iç çatışmaları ortaya çıkarır.', 'Sessizlik. Rüyalar sakinleşir — entegrasyon zamanı.'],
                    [Language.ES]: ['Nuevos comienzos. Noche ideal para establecer intenciones.', 'Crecimiento. Los sueños revelan ideas emergentes.', 'Decisiones. Los sueños te confrontan con elecciones.', 'Claridad. Los sueños se vuelven más vívidos y detallados.', 'Apogeo. Fase de sueños más intensa — fuertes símbolos y emociones.', 'Liberación. Los sueños procesan el pasado.', 'Reflexión. Los sueños revelan conflictos internos.', 'Quietud. Los sueños se calman — tiempo de integración.'],
                    [Language.FR]: ['Nouveaux départs. Nuit idéale pour définir des intentions.', 'Croissance. Les rêves révèlent des idées émergentes.', 'Décisions. Les rêves vous confrontent à des choix.', 'Clarté. Les rêves deviennent plus vifs et détaillés.', 'Sommet. Phase de rêves la plus intense — forts symboles et émotions.', 'Libération. Les rêves traitent le passé.', 'Réflexion. Les rêves révèlent des conflits intérieurs.', 'Silence. Les rêves s\'apaisent — temps d\'intégration.'],
                    [Language.AR]: ['بدايات جديدة. ليلة مثالية لتحديد النوايا.', 'النمو. تكشف الأحلام عن أفكار ناشئة.', 'القرارات. تواجهك الأحلام بالخيارات.', 'الوضوح. تصبح الأحلام أكثر حيوية وتفصيلاً.', 'الذروة. أكثر مراحل الأحلام كثافة — رموز وعواطف قوية.', 'التحرر. تعالج الأحلام الماضي.', 'التأمل. تكشف الأحلام عن الصراعات الداخلية.', 'الهدوء. تهدأ الأحلام — وقت للتكامل.'],
                    [Language.PT]: ['Novos começos. Noite ideal para definir intenções.', 'Crescimento. Os sonhos revelam ideias emergentes.', 'Decisões. Os sonhos confrontam você com escolhas.', 'Clareza. Os sonhos ficam mais vívidos e detalhados.', 'Auge. Fase de sonhos mais intensa — símbolos e emoções fortes.', 'Liberação. Os sonhos processam o passado.', 'Reflexão. Os sonhos revelam conflitos internos.', 'Quietude. Os sonhos ficam mais silenciosos — tempo de integração.'],
                    [Language.RU]: ['Новые начала. Идеальная ночь для постановки намерений.', 'Рост. Сны раскрывают зарождающиеся идеи.', 'Решения. Сны сталкивают вас с выборами.', 'Ясность. Сны становятся более яркими и детальными.', 'Пик. Самая интенсивная фаза снов — сильные символы и эмоции.', 'Отпускание. Сны обрабатывают прошлое.', 'Рефлексия. Сны раскрывают внутренние конфликты.', 'Тишина. Сны становятся тише — время для интеграции.'],
                    [Language.ZH]: ['新的开始。设定意图的理想之夜。', '成长。梦境揭示新兴想法。', '决策。梦境让你面对选择。', '清晰。梦境变得更加生动详细。', '高峰。最强烈的梦境阶段——强烈的象征和情感。', '释放。梦境处理过去。', '反思。梦境揭示内心冲突。', '宁静。梦境变得平静——整合时间。'],
                    [Language.HI]: ['नई शुरुआत। इरादे तय करने की आदर्श रात।', 'विकास। सपने उभरते विचारों को प्रकट करते हैं।', 'निर्णय। सपने आपको विकल्पों का सामना कराते हैं।', 'स्पष्टता। सपने अधिक जीवंत और विस्तृत होते हैं।', 'शिखर। सबसे तीव्र स्वप्न चरण — मजबूत प्रतीक और भावनाएं।', 'मुक्ति। सपने अतीत को संसाधित करते हैं।', 'प्रतिबिंब। सपने आंतरिक संघर्षों को प्रकट करते हैं।', 'शांति। सपने शांत होते हैं — एकीकरण का समय।'],
                    [Language.JA]: ['新しい始まり。意図を設定するのに理想的な夜。', '成長。夢は芽生えるアイデアを明らかにします。', '決断。夢はあなたを選択と向き合わせます。', '明晰さ。夢はより鮮明で詳細になります。', 'ピーク。最も強烈な夢のフェーズ — 強い象徴と感情。', '解放。夢は過去を処理します。', '内省。夢は内なる葛藤を明らかにします。', '静寂。夢は静かになります — 統合の時間。'],
                    [Language.KO]: ['새로운 시작. 의도 설정에 이상적인 밤.', '성장. 꿈은 새로운 아이디어를 드러냅니다.', '결정. 꿈은 선택과 대면하게 합니다.', '명료함. 꿈이 더 생생하고 상세해집니다.', '절정. 가장 강렬한 꿈의 단계 — 강한 상징과 감정.', '해방. 꿈은 과거를 처리합니다.', '성찰. 꿈은 내면의 갈등을 드러냅니다.', '고요. 꿈이 조용해집니다 — 통합의 시간.'],
                    [Language.ID]: ['Awal baru. Malam ideal untuk menetapkan niat.', 'Pertumbuhan. Mimpi mengungkapkan ide-ide baru.', 'Keputusan. Mimpi menghadapkan Anda dengan pilihan.', 'Kejelasan. Mimpi menjadi lebih jelas dan terperinci.', 'Puncak. Fase mimpi paling intens — simbol dan emosi yang kuat.', 'Pelepasan. Mimpi memproses masa lalu.', 'Refleksi. Mimpi mengungkapkan konflik internal.', 'Ketenangan. Mimpi menjadi lebih tenang — waktu integrasi.'],
                    [Language.FA]: ['آغازهای جدید. شب ایده‌آل برای تعیین نیت.', 'رشد. رویاها ایده‌های نوپدید را آشکار می‌کنند.', 'تصمیم‌ها. رویاها شما را با انتخاب‌ها مواجه می‌کنند.', 'وضوح. رویاها زنده‌تر و مفصل‌تر می‌شوند.', 'اوج. شدیدترین مرحله رویا — نمادها و احساسات قوی.', 'رهایی. رویاها گذشته را پردازش می‌کنند.', 'بازتاب. رویاها تعارضات درونی را آشکار می‌کنند.', 'آرامش. رویاها آرام‌تر می‌شوند — زمان یکپارچه‌سازی.'],
                    [Language.IT]: ['Nuovi inizi. Notte ideale per fissare intenzioni.', 'Crescita. I sogni rivelano idee emergenti.', 'Decisioni. I sogni ti confrontano con le scelte.', 'Chiarezza. I sogni diventano più vividi e dettagliati.', 'Apice. La fase onirica più intensa — forti simboli ed emozioni.', 'Liberazione. I sogni elaborano il passato.', 'Riflessione. I sogni rivelano conflitti interiori.', 'Quiete. I sogni si calmano — tempo di integrazione.'],
                    [Language.PL]: ['Nowe początki. Idealna noc do ustalania intencji.', 'Wzrost. Sny ujawniają kiełkujące pomysły.', 'Decyzje. Sny konfrontują cię z wyborami.', 'Jasność. Sny stają się bardziej żywe i szczegółowe.', 'Szczyt. Najbardziej intensywna faza snów — silne symbole i emocje.', 'Uwolnienie. Sny przetwarzają przeszłość.', 'Refleksja. Sny ujawniają wewnętrzne konflikty.', 'Cisza. Sny stają się cichsze — czas integracji.'],
                    [Language.BN]: ['নতুন শুরু। উদ্দেশ্য নির্ধারণের আদর্শ রাত।', 'বিকাশ। স্বপ্ন উদীয়মান ধারণা প্রকাশ করে।', 'সিদ্ধান্ত। স্বপ্ন আপনাকে পছন্দের মুখোমুখি করে।', 'স্পষ্টতা। স্বপ্ন আরও জীবন্ত ও বিস্তারিত হয়।', 'শীর্ষ। সবচেয়ে তীব্র স্বপ্ন পর্যায় — শক্তিশালী প্রতীক ও আবেগ।', 'মুক্তি। স্বপ্ন অতীত প্রক্রিয়া করে।', 'প্রতিফলন। স্বপ্ন অভ্যন্তরীণ দ্বন্দ্ব প্রকাশ করে।', 'নিস্তব্ধতা। স্বপ্ন শান্ত হয় — একীভূতকরণের সময়।'],
                    [Language.UR]: ['نئی شروعات۔ نیت طے کرنے کی مثالی رات۔', 'ترقی۔ خواب ابھرتے خیالات ظاہر کرتے ہیں۔', 'فیصلے۔ خواب آپ کو انتخاب کا سامنا کراتے ہیں۔', 'وضاحت۔ خواب زیادہ واضح اور تفصیلی ہو جاتے ہیں۔', 'عروج۔ سب سے شدید خواب کا مرحلہ — مضبوط علامات اور جذبات۔', 'آزادی۔ خواب ماضی کو پروسیس کرتے ہیں۔', 'عکاسی۔ خواب اندرونی تنازعات ظاہر کرتے ہیں۔', 'خاموشی۔ خواب پرسکون ہو جاتے ہیں — انضمام کا وقت۔'],
                    [Language.VI]: ['Khởi đầu mới. Đêm lý tưởng để đặt ý định.', 'Tăng trưởng. Giấc mơ tiết lộ ý tưởng mới nảy sinh.', 'Quyết định. Giấc mơ đối mặt bạn với những lựa chọn.', 'Rõ ràng. Giấc mơ trở nên sống động và chi tiết hơn.', 'Đỉnh cao. Giai đoạn giấc mơ mãnh liệt nhất — biểu tượng và cảm xúc mạnh mẽ.', 'Giải phóng. Giấc mơ xử lý quá khứ.', 'Phản ánh. Giấc mơ tiết lộ xung đột nội tâm.', 'Tĩnh lặng. Giấc mơ trở nên yên tĩnh hơn — thời gian tích hợp.'],
                    [Language.TH]: ['การเริ่มต้นใหม่ คืนที่เหมาะสำหรับการตั้งเจตนา', 'การเติบโต ความฝันเผยให้เห็นแนวคิดใหม่', 'การตัดสินใจ ความฝันเผชิญหน้าคุณกับทางเลือก', 'ความชัดเจน ความฝันกลายเป็นสิ่งที่ชัดเจนและละเอียดมากขึ้น', 'จุดสูงสุด ช่วงความฝันที่เข้มข้นที่สุด — สัญลักษณ์และอารมณ์ที่แข็งแกร่ง', 'การปลดปล่อย ความฝันประมวลผลอดีต', 'การสะท้อน ความฝันเผยให้เห็นความขัดแย้งภายใน', 'ความสงบ ความฝันเงียบลง — เวลาแห่งการบูรณาการ'],
                    [Language.SW]: ['Mwanzo mpya. Usiku mzuri wa kuweka nia.', 'Ukuaji. Ndoto zinafunua mawazo yanayoibuka.', 'Maamuzi. Ndoto zinakukabili na chaguo.', 'Uwazi. Ndoto zinakuwa za kina na za kina zaidi.', 'Kilele. Awamu ya ndoto yenye nguvu zaidi — ishara na hisia kali.', 'Kutolewa. Ndoto zinashughulikia yaliyopita.', 'Kutafakari. Ndoto zinafunua migogoro ya ndani.', 'Utulivu. Ndoto zinatulia — wakati wa muunganiko.'],
                    [Language.HU]: ['Új kezdetek. Ideális éjszaka szándékok kitűzéséhez.', 'Növekedés. Az álmok felszínre hozzák az újonnan születő ötleteket.', 'Döntések. Az álmok szembesítenek a választásokkal.', 'Tisztánlátás. Az álmok élénkebbek és részletesebbek lesznek.', 'Csúcspont. A legalapvetőbb álomfázis — erős szimbólumok és érzelmek.', 'Elengedés. Az álmok feldolgozzák a múltat.', 'Reflexió. Az álmok belső konfliktusokat tárnak fel.', 'Csend. Az álmok elcsendesednek — az integráció ideje.'],
                };
                const dreamMeaning = (dreamMeaningMap[language] || dreamMeaningMap[Language.EN])[moonPhaseIdx];
                return (
                    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowMoonSync(false)}>
                        <div className={`w-[95%] max-w-md ${isLight ? 'bg-white/95 border-purple-100/60' : 'bg-dream-surface/95 border-fuchsia-500/20'} backdrop-blur-md border rounded-2xl shadow-2xl overflow-hidden`} onClick={e => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 p-6 text-center">
                                <span className="text-5xl">{moonEmojis[moonPhaseIdx]}</span>
                                <h2 className="text-xl font-bold text-white mt-2">{t.ui.moon_sync}</h2>
                                <p className="text-purple-200 text-sm mt-1">{phaseName}</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className={`p-4 rounded-xl border ${isLight ? 'bg-purple-50 border-purple-200' : 'bg-purple-900/20 border-purple-500/30'}`}>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
                                        {t.ui.dream_meaning_today}
                                    </p>
                                    <p className={`text-sm leading-relaxed ${isLight ? 'text-purple-800' : 'text-purple-200'}`}>{dreamMeaning}</p>
                                </div>
                                <p className={`text-xs text-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {t.ui.moon_phase_label}: {Math.floor(moonAge)} / {Math.floor(synodicMonth)}
                                </p>
                            </div>
                            <div className="p-4 pt-0">
                                <button onClick={() => setShowMoonSync(false)} className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold text-sm shadow-lg">{t.ui.close}</button>
                            </div>
                        </div>
                    </div>
                );
            })()}
            <SpeechToVideoModal
                open={showSpeechModal}
                initialText={dreamInput}
                language={language}
                themeMode={themeMode}
                onClose={() => setShowSpeechModal(false)}
                onContinue={(finalText) => {
                    setDreamInput(finalText);
                    setShowSpeechModal(false);
                    setView(View.VIDEO_STUDIO);
                }}
            />
            {showVideoModal && <VideoResultModal onClose={() => setShowVideoModal(false)} url={videoUrl} t={t} isLight={isLight} />}
            {showImageModal && <ImageResultModal onClose={() => setShowImageModal(false)} url={imageUrl} t={t} isLight={isLight} />}
            {showStyleSelection && <StyleSelectionModal onSelect={continueWithImageGeneration} t={t} isLight={isLight} />}

                {view === View.VIDEO_STUDIO && (
                    <VideoStudio
                        language={language}
                        themeMode={themeMode}
                        dreamText={dreamInput}
                        interpretationText={videoStudioInterpretation}
                        dreamId={videoStudioDreamId}
                        initialMode={videoStudioInterpretation ? 'choose' : undefined}
                        onClose={() => { setVideoStudioDreamId(null); setVideoStudioInterpretation(''); setView(View.HOME); }}
                        onGenerate={async (text, options) => {
                            const log = (msg: string, pct: number) => console.log(`[VIDEO-STUDIO] ${msg} - ${pct}%`);
                            try {
                                let result;
                                let audioBase64ForSave: string | undefined;

                                // ── Helper: Blob → Base64 ──
                                const blobToB64 = (blob: Blob): Promise<string> =>
                                    new Promise((resolve, reject) => {
                                        const r = new FileReader();
                                        r.onloadend = () => resolve(r.result as string);
                                        r.onerror = reject;
                                        r.readAsDataURL(blob);
                                    });

                                const cm = options.contentMode;
                                const isUserVoice = options.voiceMode === 'user_voice' && !!options.voiceBlob;
                                const videoStyle = options.style || 'dreamlike';

                                // Analyse einmal ausfuehren und cachen (Skip wenn bereits vorhanden)
                                let interpretationText = '';
                                if (cm !== 'dream_only') {
                                    if (videoStudioInterpretation) {
                                        interpretationText = videoStudioInterpretation;
                                    } else {
                                        const analysis = await analyzeDreamText(text, language, userProfile);
                                        if (!analysis?.interpretation) { console.error('[VideoStudio] Analyse fehlgeschlagen'); return null; }
                                        interpretationText = analysis.interpretation;
                                    }
                                }

                                // ── KI-Video Tab: Echtes Video via Replicate ──
                                if (options.tab === 'ai' && isReplicateConfigured()) {
                                    log('Starte echtes KI-Video via Replicate...', 10);
                                    const promptText = cm === 'dream_only' ? text
                                        : cm === 'interpretation' ? interpretationText
                                        : `${text}. ${interpretationText}`;
                                    try {
                                        const replicateResult = await generateReplicateVideo(
                                            { prompt: promptText, style: videoStyle, aspectRatio: '16:9' },
                                            userProfile?.subscriptionTier || SubscriptionTier.FREE
                                        );
                                        log('KI-Video fertig!', 100);
                                        const videoUrl = replicateResult.videoUrl;

                                        // Persist
                                        if (videoUrl) {
                                            const dreamId = videoStudioDreamId || `dream-${Date.now()}`;
                                            const existing = (videoStudioDreamId && dreams.find(d => d.id === videoStudioDreamId)) || dreams.find(d => d.description === text);
                                            if (existing) {
                                                await handleUpdateDream({ ...existing, videoUrl });
                                            } else {
                                                await handleSaveDream({
                                                    id: dreamId, title: text.slice(0, 60).trim() + (text.length > 60 ? '...' : ''),
                                                    description: text, interpretation: interpretationText,
                                                    date: new Date().toISOString().split('T')[0], userAvatar: '',
                                                    videoUrl, tags: [], likes: 0, comments: 0, matchPercentage: 0,
                                                });
                                            }
                                        }
                                        return videoUrl;
                                    } catch (replicateErr) {
                                        console.warn('[VIDEO-STUDIO] Replicate fehlgeschlagen, Fallback auf Slideshow...', replicateErr);
                                    }
                                }

                                // ── Slideshow-Fallback (oder Slideshow-Tab) ──
                                if (cm === 'dream_only') {
                                    if (isUserVoice) {
                                        audioBase64ForSave = await blobToB64(options.voiceBlob!);
                                        result = await generateDreamUserVoiceVideo(text, audioBase64ForSave, videoStyle, language, log);
                                    } else {
                                        result = await generateDreamNarrationVideo(text, videoStyle, language, log);
                                    }
                                } else if (cm === 'interpretation') {
                                    result = await generateStoryVideo(text, interpretationText, videoStyle, language, log);
                                } else {
                                    const combinedText = `${text}\n\n---\n\n${interpretationText}`;
                                    if (isUserVoice) {
                                        audioBase64ForSave = await blobToB64(options.voiceBlob!);
                                        result = await generateDreamUserVoiceVideo(combinedText, audioBase64ForSave, videoStyle, language, log);
                                    } else {
                                        result = await generateStoryVideo(text, combinedText, videoStyle, language, log);
                                    }
                                }

                                const videoUrl = result?.videoDataUrl || null;

                                // ── Persist: Video + Audio im Dream-Objekt speichern ──
                                if (videoUrl) {
                                    const dreamId = videoStudioDreamId || `dream-${Date.now()}`;
                                    const newDream: Dream = {
                                        id: dreamId,
                                        title: text.slice(0, 60).trim() + (text.length > 60 ? '...' : ''),
                                        description: text,
                                        interpretation: interpretationText,
                                        date: new Date().toISOString().split('T')[0],
                                        userAvatar: '',
                                        videoUrl,
                                        audioUrl: audioBase64ForSave || result?.audioBase64 || undefined,
                                        audioSource: isUserVoice ? 'dictation' as const : undefined,
                                        tags: [],
                                        likes: 0,
                                        comments: 0,
                                        matchPercentage: 0,
                                    };
                                    // Check if dream already exists (by ID or text)
                                    const existing = (videoStudioDreamId && dreams.find(d => d.id === videoStudioDreamId)) || dreams.find(d => d.description === text);
                                    if (existing) {
                                        await handleUpdateDream({
                                            ...existing,
                                            videoUrl,
                                            audioUrl: audioBase64ForSave || existing.audioUrl,
                                        });
                                    } else {
                                        await handleSaveDream(newDream);
                                    }
                                }

                                return videoUrl;
                            } catch (e) {
                                console.error('[VideoStudio] Generation error', e);
                                return null;
                            }
                        }}
                        onSave={(result) => {
                            if (result.videoUrl) {
                                setVideoUrl(result.videoUrl);
                                setShowVideoModal(true);
                            }
                            setVideoStudioDreamId(null);
                            setVideoStudioInterpretation('');
                            setView(View.HOME);
                        }}
                        userCredits={userProfile?.credits || 0}
                    />
                )}
                {view === View.DREAM_NETWORK && (
                    <DreamNetwork
                        language={language}
                        themeMode={themeMode}
                        dreams={dreams}
                        onClose={() => setView(View.HOME)}
                    />
                )}
                {showOnboarding && <Onboarding language={language} initialData={userProfile} onComplete={handleSaveProfile} onClose={() => setShowOnboarding(false)} themeMode={themeMode} />}
                {showCalendar && <DreamCalendar dreams={dreams} language={language} onClose={() => setShowCalendar(false)} onGenerateVideo={handleGenerateVideoWithStyle} onGenerateImage={handleGenerateImageWithStyle} themeMode={themeMode} />}

            {view === View.DREAM_MAP && <DreamMap dreams={dreams} language={language} isLight={isLight} onClose={() => setView(View.HOME)} onSelectParticipant={(id) => { setSelectedParticipantId(id); setView(View.RESEARCH_PARTICIPANT); }} onNavigateToResearch={() => setView(View.RESEARCH_MAP)} />}

            {view === View.SCIENCE && (
                <SciencePage
                    language={language}
                    onClose={() => setView(View.HOME)}
                    onNavigateHome={() => setView(View.HOME)}
                    themeMode={themeMode}
                />
            )}

            {view === View.AGB && <AGBPage language={language} onClose={() => setView(View.HOME)} themeMode={themeMode} />}
            {view === View.DATENSCHUTZ && <DatenschutzPage language={language} onClose={() => setView(View.HOME)} themeMode={themeMode} />}
            {view === View.IMPRESSUM && <ImpressumPage language={language} onClose={() => setView(View.HOME)} themeMode={themeMode} />}
            {view === View.FORSCHUNG && <ForschungPage language={language} onClose={() => setView(View.HOME)} themeMode={themeMode} />}
            {view === View.CENSUS && <CensusPage language={language} onClose={() => setView(View.HOME)} themeMode={themeMode} />}
            {view === View.DREAM_SYMBOLS && <DreamSymbolsPage language={language} onClose={() => setView(View.HOME)} onNavigateHome={() => setView(View.HOME)} themeMode={themeMode} />}

            {view === View.RESEARCH_MAP && (
                <ScientificDreamMap
                    language={language}
                    isLight={isLight}
                    onClose={() => setView(View.HOME)}
                    onSelectParticipant={(id) => { setSelectedParticipantId(id); setView(View.RESEARCH_PARTICIPANT); }}
                    onSelectStudy={(code) => { setSelectedStudyCode(code); setView(View.RESEARCH_STUDIES); }}
                />
            )}

            {view === View.RESEARCH_STUDIES && (
                <ResearchStudies
                    language={language}
                    isLight={isLight}
                    onClose={() => setView(View.HOME)}
                    onSelectStudy={(code) => setSelectedStudyCode(code)}
                    onShowOnMap={(code) => { setSelectedStudyCode(code); setView(View.RESEARCH_MAP); }}
                    onSelectParticipant={(id) => { setSelectedParticipantId(id); setView(View.RESEARCH_PARTICIPANT); }}
                />
            )}

            {view === View.RESEARCH_PARTICIPANT && selectedParticipantId && (
                <ParticipantProfile
                    participantId={selectedParticipantId}
                    language={language}
                    isLight={isLight}
                    onClose={() => setView(View.RESEARCH_STUDIES)}
                    onShowOnMap={(code) => { setSelectedStudyCode(code); setView(View.RESEARCH_MAP); }}
                />
            )}

            <main className="relative z-10 p-4 pt-6 pb-24">
                {view === View.HOME && renderHome()}
                    {view === View.DREAM_HUB && <DreamHub dreams={dreams} language={language} themeMode={themeMode} onClose={() => setView(View.HOME)} />}
                    {view === View.PROFILE && <Profile language={language} dreams={dreams} userProfile={userProfile} onUpdateProfile={handleSaveProfile} onUpdateDream={handleUpdateDream} onOpenVideoStudio={handleOpenVideoStudio} onPlayVideo={(url) => { setVideoUrl(url); setShowVideoModal(true); }} fontSize={FontSize.MEDIUM} themeMode={themeMode} />}
            </main>

            {/* Legal Footer Links */}
            {view === View.HOME && (
              <div className="text-center py-4 pb-20 text-xs opacity-50 relative z-10">
                <a href="/impressum" className="hover:underline">Impressum</a>
                {' · '}
                <a href="/datenschutz" className="hover:underline">Datenschutz</a>
                {' · '}
                <a href="/agb" className="hover:underline">AGB</a>
                {' · '}
                <a href="/samedream" className="hover:underline">SameDream</a>
                {' · '}
                <a href="/dreamatlas" className="hover:underline">DreamAtlas</a>
              </div>
            )}

            {view === View.LIVE_SESSION ? (
                    <LiveSession
                        key="live-session"
                        onClose={() => setView(View.HOME)}
                        onSaveSession={async (text, audioData) => { if (audioData) { setCurrentAudioData(audioData); setAudioIsFromLiveChat(true); } setView(View.HOME); const story = await convertTranscriptToStory(text, language); setDreamInput(story); setTimeout(() => handleAnalyze(story), 200); }}
                        language={language}
                        voiceName={userProfile?.preferredVoice || 'Puck'}
                        selectedCategories={selectedCategories}
                        selectedSources={selectedSources}
                        themeMode={themeMode}
                    />
            ) : null}

            {view === View.HOME && (
              <footer className={`relative z-10 px-4 pb-28 pt-4 text-center text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                  <button onClick={() => setView(View.DATENSCHUTZ)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.privacy_link}
                  </button>
                  <button onClick={() => setView(View.AGB)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.terms_link}
                  </button>
                  <button onClick={() => setView(View.IMPRESSUM)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.imprint_link}
                  </button>
                  <button onClick={() => setView(View.FORSCHUNG)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.research_link}
                  </button>
                  <button onClick={() => setView(View.CENSUS)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    Census
                  </button>
                  <button onClick={() => setView(View.RESEARCH_STUDIES)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.studies_link}
                  </button>
                  <button onClick={() => setView(View.DREAM_SYMBOLS)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.symbols_link || 'Symbole'}
                  </button>
                  <button onClick={() => setView(View.RESEARCH_MAP)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.worldmap_link}
                  </button>
                </div>
                <p className={`mt-2 ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>
                  Thalamus Innovation Technology
                </p>
              </footer>
            )}

            <nav className={`fixed bottom-0 left-0 right-0 border-t pb-safe z-40 transition-colors duration-500 ${isLight ? 'bg-white/80 backdrop-blur-xl border-mystic-border shadow-glass' : 'bg-dream-bg/80 backdrop-blur-lg border-white/10'}`}>
                <div className="flex justify-around items-center p-2">
                    <NavBtn icon="home" label={t.ui.home_label} active={view === View.HOME} onClick={() => setView(View.HOME)} isLight={isLight} />
                    <button aria-label="Settings" onClick={() => setShowSettings(true)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${showSettings ? (isLight ? 'text-fuchsia-600' : 'text-fuchsia-500') : (isLight ? 'text-slate-400 hover:text-indigo-900' : 'text-slate-500 hover:text-slate-300')}`}>
                        <span className={`material-icons text-2xl`}>settings</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide max-w-[60px] truncate text-center">{t.ui.settings}</span>
                    </button>
                    <div className="relative -top-8">
                        <button onClick={handleLiveClick} className="w-20 h-20 rounded-full bg-gradient-to-tr from-fuchsia-600 to-violet-600 shadow-[0_0_30px_rgba(192,38,211,0.6)] flex flex-col items-center justify-center border-4 transition-transform hover:scale-110 relative gap-0" style={{ borderColor: isLight ? 'rgba(255,255,255,0.8)' : '#05020a' }}>
                            <span className="material-icons text-3xl text-white mb-1">graphic_eq</span>
                            <span className="text-[9px] font-bold text-white uppercase leading-none">{t.ui.live_chat_label}</span>
            {/* Live Chat icon - kein Lock mehr */}
                        </button>
                    </div>
                    {/* WISSENSCHAFT */}
                    <NavBtn icon="biotech" label={t.ui.science_label} active={view === View.SCIENCE} onClick={() => setView(View.SCIENCE)} isLight={isLight} />
                    {/* DREAM MAP */}
                    <NavBtn icon="public" label={t.ui.dream_network} active={view === View.DREAM_MAP} onClick={() => setView(View.DREAM_MAP)} isLight={isLight} />
                    <NavBtn icon="person" label={t.ui.profile_btn} active={view === View.PROFILE} onClick={() => setView(View.PROFILE)} isLight={isLight} />
                </div>
            </nav>

            {/* Audio Upload Confirmation Modal */}
            {showAudioUploadConfirm && (
                <AudioUploadConfirmModal
                    onClose={() => {
                        setShowAudioUploadConfirm(false);
                        setCurrentAudioData(null);
                        setShowSavedMessage(true);
                        setTimeout(() => setShowSavedMessage(false), 4000);
                    }}
                    t={t}
                    isLight={isLight}
                />
            )}
        </div>
        </React.Suspense>
        </ErrorBoundary>
    );
};

// --- Extracted Components ---

const CoinShopModal = ({ onClose, t, isLight, onPurchase, onEarnFree }: { onClose: () => void, t: any, isLight: boolean, onPurchase: (amt: number) => void, onEarnFree: () => void }) => (
    <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 zoom-in-95">
        <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card/95 backdrop-blur-md' : 'bg-dream-surface/95 backdrop-blur-md'} border ${isLight ? 'border-amber-500/40' : 'border-amber-500/30'} rounded-2xl overflow-hidden shadow-2xl flex flex-col relative max-h-[85vh]`}>
            <button aria-label={t.ui.close} onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <span className="material-icons text-base">close</span>
            </button>

            <div className="h-20 bg-gradient-to-r from-amber-600 to-orange-500 flex items-center justify-center shrink-0 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                 <div className="text-center relative z-10">
                     <h2 className="text-xl font-mystic font-bold text-white drop-shadow-md flex items-center justify-center gap-2">
                        <span className="material-icons text-lg">storefront</span> {t.shop.title}
                     </h2>
                     <p className="text-amber-100 text-xs font-bold uppercase tracking-wider opacity-90">{t.shop.desc}</p>
                 </div>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto custom-scrollbar">
                {/* DYNAMISCHE COIN PAKETE */}
                {Object.values(COIN_PACKAGES).map((pkg, index) => {
                    const isBestseller = 'highlight' in pkg && (pkg as any).highlight === true;
                    const isBestValue = pkg.id === 'mega_2500';
                    const isMegaPlus = false; // MEGA_PLUS entfernt
                    const pricePerCoin = (pkg.price / pkg.coins).toFixed(4);
                    const emojis = ['🪙', '💰', '💎', '🌟', '⭐', '🏆'];
                    const colors = [
                        { bg: 'bg-slate-500', border: 'border-slate-300', text: 'text-slate-800' },
                        { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-900' },
                        { bg: 'bg-emerald-600', border: 'border-emerald-500', text: 'text-emerald-900' },
                        { bg: 'bg-purple-600', border: 'border-purple-500', text: 'text-purple-900' },
                        { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-900' },
                        { bg: 'bg-pink-600', border: 'border-pink-500', text: 'text-pink-900' },
                    ];

                    return (
                        <div
                            key={pkg.id}
                            onClick={() => onPurchase(pkg.coins)}
                            className={`rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] relative ${
                                isMegaPlus
                                    ? 'p-5 border-2 border-pink-500 bg-gradient-to-r from-pink-900/20 to-purple-900/20 shadow-xl shadow-pink-500/30'
                                    : isBestseller
                                        ? 'p-5 border-2 border-amber-500 bg-amber-900/10 shadow-xl shadow-amber-500/25'
                                        : isBestValue
                                            ? `p-4 ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-900/20 border-emerald-500/30'}`
                                            : `p-4 ${isLight ? 'bg-white/60 border-slate-200 hover:bg-white/80 shadow-sm' : 'bg-white/5 border-white/10 hover:bg-white/10'}`
                            }`}
                        >
                            {isMegaPlus && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold uppercase px-4 py-1 rounded-full shadow-lg shadow-pink-500/50 animate-pulse whitespace-nowrap">
                                    {t.shop.wow_badge}
                                </div>
                            )}
                            {isBestseller && !isMegaPlus && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                                    ⭐ {t.shop.best_badge}
                                </div>
                            )}
                            {isBestValue && !isMegaPlus && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl">
                                    {t.shop.value_badge}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-full ${colors[index % colors.length].bg} flex items-center justify-center text-white shadow-lg ${isBestseller ? 'shadow-amber-500/40' : ''} shrink-0`}>
                                    <span className={`${isBestseller ? 'text-xl' : 'text-base'}`}>{emojis[index % emojis.length]}</span>
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm ${isBestseller || isMegaPlus ? 'text-base' : ''} ${
                                        isLight
                                            ? (isMegaPlus ? 'text-pink-900' : isBestseller ? colors[index % colors.length].text : isBestValue ? 'text-emerald-900' : 'text-slate-800')
                                            : (isMegaPlus ? 'text-pink-100' : isBestValue ? 'text-emerald-100' : 'text-white')
                                    }`}>
                                        {pkg.coins} {t.shop.coins_label}
                                    </h3>
                                    <p className={`text-xs font-bold ${
                                        isMegaPlus ? 'text-pink-500 uppercase' : isBestseller ? 'text-amber-500 uppercase' : isBestValue ? 'text-emerald-500' : 'text-slate-400'
                                    }`}>
                                        {({starter_50: t.shop.pkg_starter, popular_150: t.shop.pkg_popular, value_400: t.shop.pkg_value, premium_900: t.shop.pkg_premium, mega_2500: t.shop.pkg_mega} as Record<string, string>)[pkg.id] || pkg.id}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-500'}`}>
                                        {pricePerCoin}€ {t.shop.per_coin}
                                    </p>
                                </div>
                            </div>
                            <button className={`px-4 py-3 rounded-xl font-bold text-sm shadow-md transition-all shrink-0 ${
                                isMegaPlus
                                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-pink-500/30'
                                    : isBestseller
                                        ? 'bg-amber-500 hover:bg-amber-400 text-white'
                                        : isBestValue
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                            : isLight
                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}>
                                €{pkg.price.toFixed(2)}
                            </button>
                        </div>
                    );
                })}

                <div className={`pt-4 mt-2 border-t border-dashed ${isLight ? 'border-mystic-border' : 'border-white/10'} text-center`}>
                    <button onClick={onEarnFree} className={`flex items-center justify-center gap-2 mx-auto px-5 py-2.5 rounded-full border font-bold text-sm transition-all hover:scale-105 active:scale-95 ${isLight ? 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'border-white/20 text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white'}`}>
                        <span className="material-icons text-base">card_giftcard</span>
                        {t.shop.free_link}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, t, isLight, apiKeyInput, setApiKeyInput, handleAddApiKey, handleRemoveApiKey, userProfile, themeMode, handleThemeUpdate, designTheme, handleExport, handleImport, language, onVoiceChange, currentVoiceId }) => (
    <div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card/95 backdrop-blur-md' : 'bg-dream-surface/95 backdrop-blur-md'} border ${isLight ? 'border-mystic-border' : 'border-white/10'} rounded-2xl overflow-hidden flex flex-col shadow-2xl max-h-[85vh]`}>
            <div className={`px-5 py-4 border-b ${isLight ? 'border-mystic-border' : 'border-white/10'} flex justify-between items-center shrink-0`}>
                <h2 className={`text-lg font-mystic font-bold ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.ui.settings}</h2>
                <button aria-label={t.ui.close} onClick={onClose} className="w-8 h-8 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors">
                    <span className={`material-icons text-base ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>close</span>
                </button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">

                {/* BACKUP & DATA VAULT */}
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-green-50 border-green-200' : 'bg-green-900/10 border-green-500/30'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${isLight ? 'text-green-800' : 'text-green-400'}`}>
                        <span className="material-icons text-sm">cloud_sync</span> {t.ui.backup_title}
                    </h3>
                    <p className={`text-xs mb-3 leading-relaxed ${isLight ? 'text-green-700' : 'text-green-200/70'}`}>{t.ui.backup_desc}</p>
                    <div className="flex gap-2">
                        <button onClick={handleExport} className={`flex-1 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${isLight ? 'bg-white border-green-200 text-green-700 hover:bg-green-50' : 'bg-white/5 border-green-500/30 text-green-300 hover:bg-green-900/20'}`}>
                            <span className="material-icons text-sm">download</span> {t.ui.export_btn}
                        </button>
                        <label className="flex-1 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer bg-green-600 border-green-500 text-white hover:bg-green-700">
                            <span className="material-icons text-sm">upload_file</span> {t.ui.import_btn}
                            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* API KEY MANAGER FOR SMART TIER */}
                {userProfile?.subscriptionTier === SubscriptionTier.SMART && (
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-900/10 border-cyan-500/30'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>
                        <span className="material-icons text-sm">vpn_key</span> {t.ui.api_manager}
                    </h3>
                    <p className={`text-xs mb-3 leading-relaxed ${isLight ? 'text-cyan-700' : 'text-cyan-200/70'}`}>{t.ui.api_desc}</p>
                    
                    <div className="flex gap-2 mb-3">
                        <input 
                            type="text" 
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="sk-..."
                            className={`flex-1 rounded-xl px-3 py-2.5 text-xs border outline-none ${isLight ? 'bg-white border-cyan-200 text-slate-800' : 'bg-black/30 border-cyan-500/30 text-white'}`}
                        />
                        <button 
                            onClick={handleAddApiKey}
                            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl whitespace-nowrap transition-colors"
                        >
                            {t.ui.add_key}
                        </button>
                    </div>
                    
                    <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                        {(userProfile?.customApiKeys || []).length === 0 ? (
                            <p className="text-xs text-center italic opacity-50 py-2">{t.ui.no_keys}</p>
                        ) : (
                            (userProfile?.customApiKeys || []).map((key, i) => (
                                <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-lg ${isLight ? 'bg-white/60' : 'bg-white/5'}`}>
                                    <span className="text-xs font-mono opacity-70">...{key.slice(-5)}</span>
                                    <button onClick={() => handleRemoveApiKey(key)} className="text-red-400 hover:text-red-300 transition-colors">
                                        <span className="material-icons text-sm">delete</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                )}

                {/* Mode Toggle */}
                <div className={`pt-5 border-t ${isLight ? 'border-mystic-border' : 'border-white/10'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>
                        <span className="material-icons text-sm">contrast</span> {t.ui.mode}
                    </h3>
                    <div className={`relative flex rounded-full p-1 border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                        <div className={`absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full shadow transition-all duration-300 ${themeMode === ThemeMode.DARK ? 'left-1 bg-slate-800' : 'left-[calc(50%+3px)] bg-white'}`}></div>
                        <button
                            onClick={() => handleThemeUpdate(ThemeMode.DARK, null)}
                            className={`relative z-10 flex-1 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${themeMode === ThemeMode.DARK ? 'text-white' : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')}`}
                        >
                            <span className="material-icons text-sm">dark_mode</span> {t.ui.dark}
                        </button>
                        <button
                            onClick={() => handleThemeUpdate(ThemeMode.LIGHT, null)}
                            className={`relative z-10 flex-1 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${themeMode === ThemeMode.LIGHT ? 'text-indigo-900' : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')}`}
                        >
                            <span className="material-icons text-sm">light_mode</span> {t.ui.light}
                        </button>
                    </div>
                </div>

                {/* Oracle Voice */}
                <div className={`pt-5 border-t ${isLight ? 'border-mystic-border' : 'border-white/10'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>
                        <span className="material-icons text-sm">record_voice_over</span>
                        {t.ui.oracle_voice}
                    </h3>
                    <VoiceSelector
                        mode="settings"
                        language={language}
                        currentVoiceId={currentVoiceId}
                        onSelect={onVoiceChange}
                        isLight={isLight}
                    />
                </div>

                {/* Color Theme */}
                <div className={`pt-5 border-t ${isLight ? 'border-mystic-border' : 'border-white/10'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>
                        <span className="material-icons text-sm">palette</span> {t.ui.style}
                    </h3>
                    <div className="flex flex-col gap-2">
                        {[DesignTheme.DEFAULT, DesignTheme.FEMININE, DesignTheme.MASCULINE, DesignTheme.NATURE].map(dt => {
                            let label = t.ui.style_def;
                            let colorClass = "bg-indigo-500";
                            if(dt === DesignTheme.FEMININE) { label = t.ui.style_fem; colorClass = "bg-pink-500"; }
                            if(dt === DesignTheme.MASCULINE) { label = t.ui.style_masc; colorClass = "bg-sky-500"; }
                            if(dt === DesignTheme.NATURE) { label = t.ui.style_nature; colorClass = "bg-emerald-500"; }
                            
                            const isActive = designTheme === dt;
                            const activeClass = isActive 
                                ? (isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-white/10 border-white/30 text-white') 
                                : (isLight ? 'bg-slate-50 border-transparent hover:bg-slate-100' : 'bg-white/5 border-transparent text-slate-400');
                            
                            return (
                                <button key={dt} onClick={() => handleThemeUpdate(null, dt)} className={`w-full py-3 px-4 rounded-xl border text-sm text-left flex items-center justify-between transition-all ${activeClass}`}>
                                    <span className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${colorClass}`}></div> {label}</span>
                                    {isActive && <span className={`material-icons ${isLight ? 'text-indigo-500' : 'text-white'}`}>check_circle</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, t, isLight, userProfile, onUpdateSubscription, language: lang }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [showSmartInfo, setShowSmartInfo] = useState(false);

    return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card/95 backdrop-blur-md' : 'bg-dream-surface/95 backdrop-blur-md'} border ${isLight ? 'border-mystic-border' : 'border-white/10'} rounded-2xl overflow-hidden shadow-2xl flex flex-col relative max-h-[85vh]`}>
            <button aria-label={t.ui.close} onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 text-white transition-colors">
                <span className="material-icons text-base">close</span>
            </button>
            <div className="h-20 bg-gradient-to-br from-amber-600 to-yellow-500 relative flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                <h2 className="text-2xl font-mystic font-bold text-white shadow-black drop-shadow-md">{t.sub.title}</h2>
            </div>
            
            {/* Billing Toggle */}
            <div className={`flex justify-center px-4 py-3 ${isLight ? 'bg-white/60 backdrop-blur-md border-b border-slate-100' : 'bg-white/5 backdrop-blur-md border-b border-white/5'}`}>
                <div className={`relative flex p-1 rounded-full border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/10'}`}>
                    <div className={`absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full shadow-md transition-all duration-300 ${billingCycle === 'monthly' ? 'left-1' : 'left-[calc(50%+3px)]'} ${isLight ? 'bg-white shadow-indigo-100' : 'bg-slate-700'}`}></div>
                    <button onClick={() => setBillingCycle('monthly')} className={`relative z-10 px-5 py-1.5 rounded-full text-xs font-bold transition-colors duration-300 ${billingCycle === 'monthly' ? (isLight ? 'text-mystic-text' : 'text-white') : (isLight ? 'text-slate-400' : 'text-slate-400')}`}>
                        {t.sub.billing_monthly}
                    </button>
                    <button onClick={() => setBillingCycle('yearly')} className={`relative z-10 px-5 py-1.5 rounded-full text-xs font-bold transition-colors duration-300 flex items-center gap-1.5 ${billingCycle === 'yearly' ? (isLight ? 'text-mystic-text' : 'text-white') : (isLight ? 'text-slate-400' : 'text-slate-400')}`}>
                        {t.sub.billing_yearly}
                        <span className="bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase">-20%</span>
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar relative">
                {/* SMART INFO OVERLAY - REDESIGNED */}
                {showSmartInfo && (
                    <div className="absolute inset-0 z-20 bg-cyan-900/95 backdrop-blur-md p-6 flex flex-col justify-center ">
                        <div className="bg-white/10 p-6 rounded-2xl border border-cyan-400/30">
                            <h3 className="text-cyan-300 font-bold mb-6 flex items-center gap-2 text-lg">
                                <span className="material-icons">info</span> {t.sub.smart_info_title}
                            </h3>
                            
                            <div className="space-y-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                                        <span className="material-icons">account_circle</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">{t.smart_guide.step1_title}</h4>
                                        <p className="text-cyan-100/70 text-xs">{t.smart_guide.step1_desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                                        <span className="material-icons">vpn_key</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">{t.smart_guide.step2_title}</h4>
                                        <p className="text-cyan-100/70 text-xs">{t.smart_guide.step2_desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                                        <span className="material-icons">input</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">{t.smart_guide.step3_title}</h4>
                                        <p className="text-cyan-100/70 text-xs">{t.smart_guide.step3_desc}</p>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setShowSmartInfo(false)} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold text-sm shadow-lg">{t.ui.ok}</button>
                        </div>
                    </div>
                )}

                {[SubscriptionTier.FREE, SubscriptionTier.PRO, SubscriptionTier.PREMIUM].map(tier => {
                    const isCurrent = userProfile?.subscriptionTier === tier;
                    let title = "", features: string[] = [], price = "";
                    let borderColor = "";
                    let buttonText = isCurrent ? t.sub.current : t.sub.upgrade;

                    if (tier === SubscriptionTier.FREE) {
                        title = t.sub.bronze_title;
                        features = t.sub.bronze_features;
                        price = t.sub.bronze_price;
                        borderColor = "border-slate-500/20";
                    }
                    if (tier === SubscriptionTier.PRO) {
                        title = t.sub.silver2_title;
                        features = t.sub.silver2_features;
                        price = billingCycle === 'yearly' ? t.sub.silver2_price_yearly : t.sub.silver2_price_monthly;
                        borderColor = "border-blue-400";
                    }
                    if (tier === SubscriptionTier.PREMIUM) {
                        title = t.sub.gold2_title;
                        features = t.sub.gold2_features;
                        price = billingCycle === 'yearly' ? t.sub.gold2_price_yearly : t.sub.gold2_price_monthly;
                        borderColor = "border-amber-400";
                    }
                    if (tier === SubscriptionTier.VIP) {
                        borderColor = "border-2 border-yellow-500";
                    }
                    if (tier === SubscriptionTier.VIP) {
                        title = t.sub.vip_title;
                        features = t.sub.vip_features;
                        price = billingCycle === 'yearly' ? t.sub.vip_price_yearly : t.sub.vip_price_monthly;
                        borderColor = "border-pink-500";
                    }

                    // Calculate if badge is present
                    const hasBadge = (billingCycle === 'yearly' && (tier === SubscriptionTier.PRO || tier === SubscriptionTier.PREMIUM)) || tier === SubscriptionTier.SMART;

                    return (
                        <div key={tier} onClick={() => onUpdateSubscription(tier)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 relative group ${isCurrent ? (isLight ? 'bg-gradient-to-br from-indigo-50 to-fuchsia-50 border-indigo-400 shadow-md shadow-indigo-100' : 'bg-gradient-to-br from-indigo-900/30 to-fuchsia-900/20 border-indigo-500/60 shadow-lg shadow-indigo-500/10') : (isLight ? `bg-white/80 backdrop-blur-md hover:bg-white shadow-sm hover:shadow-md ${borderColor}` : `bg-white/5 backdrop-blur-md hover:bg-white/10 ${borderColor}`)}`}>
                            {tier === SubscriptionTier.PRO && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-md whitespace-nowrap z-10">
                                    {t.sub.pro_badge}
                                </div>
                            )}
                            {billingCycle === 'yearly' && (tier === SubscriptionTier.PRO || tier === SubscriptionTier.PREMIUM) && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-xl rounded-tr-xl font-bold shadow-sm">
                                    {t.sub.yearly_discount}
                                </div>
                            )}
                            {tier === SubscriptionTier.VIP && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-md whitespace-nowrap z-10">
                                    {t.sub.vip_badge}
                                </div>
                            )}
                            {tier === SubscriptionTier.SMART && (
                                <div className="absolute top-0 right-0 bg-fuchsia-600 text-white text-xs px-2 py-1 rounded-bl-xl rounded-tr-xl font-bold shadow-sm animate-pulse z-10">
                                    {t.sub.smart_discount}
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-bold text-base ${isLight ? 'text-mystic-text' : 'text-white'}`}>{title}</h3>
                                    {isCurrent && <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full uppercase">{t.sub.current}</span>}
                                    {tier === SubscriptionTier.SMART && <span className="px-2 py-0.5 bg-cyan-500 text-white text-[9px] font-bold rounded-full uppercase">BYOK</span>}
                                </div>
                                <div className={`text-right ${hasBadge ? 'mt-5' : ''}`}>
                                    {tier === SubscriptionTier.PREMIUM && billingCycle === 'monthly' && (
                                        <span className={`block text-xs line-through ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{SUBSCRIPTION_TIERS.PREMIUM.strikethrough_monthly.toFixed(2).replace('.', ',')} €</span>
                                    )}
                                    <span className={`block font-extrabold text-xl ${isLight ? 'text-mystic-text' : 'text-white'}`}>{price}</span>
                                </div>
                            </div>

                            <ul className="space-y-1.5">
                                {features.map((feat, i) => (
                                    <li key={i} className={`text-xs flex items-start gap-2 leading-tight ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>
                                        <span className={`material-icons text-xs mt-0.5 shrink-0 ${isCurrent ? (isLight ? 'text-indigo-500' : 'text-indigo-400') : tier === SubscriptionTier.SMART ? 'text-cyan-400' : (isLight ? 'text-fuchsia-500' : 'text-fuchsia-400')}`}>check_circle</span>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex items-center justify-between mt-1 gap-2">
                                {!isCurrent ? (
                                    <span className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-center transition-all ${tier === SubscriptionTier.PRO ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30' : tier === SubscriptionTier.VIP || tier === SubscriptionTier.PREMIUM ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-500/30' : tier === SubscriptionTier.SMART ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20' : (isLight ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-white/10 text-slate-300')}`}>{buttonText}</span>
                                ) : (
                                    <span className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-center ${isLight ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-400'}`}>{t.sub.current}</span>
                                )}
                                {tier === SubscriptionTier.SMART && (
                                    <button
                                        aria-label="Info"
                                        onClick={(e) => { e.stopPropagation(); setShowSmartInfo(true); }}
                                        className="w-9 h-9 shrink-0 rounded-full border border-cyan-400 text-cyan-400 flex items-center justify-center hover:bg-cyan-400 hover:text-white transition-colors"
                                    >
                                        <span className="text-xs font-serif font-bold italic">i</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
    );
};

const EarnCoinsModal = ({ onClose, t, isLight, onWatch }: { onClose: () => void, t: any, isLight: boolean, onWatch: (d: number, r: number) => void }) => (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card' : 'bg-dream-elevated'} border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative max-h-[85vh]`}>
                <button aria-label={t.ui.close} onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors">
                <span className="material-icons text-base">close</span>
            </button>
            <div className="h-20 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                <h2 className="text-2xl font-mystic font-bold text-white shadow-black drop-shadow-md flex items-center gap-2">
                    <span className="material-icons">monetization_on</span> {t.earn.title}
                </h2>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
                <p className={`text-sm text-center mb-2 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-300'}`}>{t.earn.desc}</p>
                
                {/* Short Clip */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-amber-50 border-amber-100' : 'bg-amber-900/10 border-amber-500/20'}`}>
                    <div>
                        <h4 className={`font-bold text-sm ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.earn.short_title}</h4>
                        <p className="text-xs text-amber-500">{t.earn.short_desc}</p>
                    </div>
                    <button onClick={() => onWatch(10000, parseInt(t.earn.short_reward))} className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-lg transition-colors">
                        +{t.earn.short_reward} 🪙 {t.earn.watch_btn}
                    </button>
                </div>

                {/* Long Clip */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-amber-50 border-amber-100' : 'bg-amber-900/10 border-amber-500/20'}`}>
                    <div>
                        <h4 className={`font-bold text-sm ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.earn.long_title}</h4>
                        <p className="text-xs text-amber-500">{t.earn.long_desc}</p>
                    </div>
                    <button onClick={() => onWatch(3000, parseInt(t.earn.long_reward))} className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:to-orange-600 text-white rounded-xl font-bold text-xs shadow-lg">
                        +{t.earn.long_reward} 🪙 {t.earn.watch_btn}
                    </button>
                </div>

                {/* Offerwall (Mock) */}
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/10 border-blue-500/20'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h4 className={`font-bold text-sm ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.earn.offer_title}</h4>
                            <p className="text-xs text-blue-400">{t.earn.offer_desc}</p>
                        </div>
                            <span className="text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded">+{t.earn.offer_reward} 🪙</span>
                    </div>
                    <p className={`text-xs mb-3 leading-relaxed ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>{t.earn.offer_info}</p>
                    <div className="space-y-2">
                        <div className={`flex justify-between items-center p-2 rounded border ${isLight ? 'bg-white border-blue-100' : 'bg-black/20 border-white/5'}`}>
                            <span className={`text-xs ${isLight ? 'text-mystic-text' : 'text-slate-300'}`}>{t.earn.survey_task}</span>
                            <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase py-1 px-2">{t.earn.start_btn}</button>
                        </div>
                            <div className={`flex justify-between items-center p-2 rounded border ${isLight ? 'bg-white border-blue-100' : 'bg-black/20 border-white/5'}`}>
                            <span className={`text-xs ${isLight ? 'text-mystic-text' : 'text-slate-300'}`}>{t.earn.app_task}</span>
                            <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase py-1 px-2">{t.earn.start_btn}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ProcessingOverlay = ({ isLight, steps, categories, sources, t }: { isLight: boolean, steps: ProcessingStep[], categories: ReligiousCategory[], sources: ReligiousSource[], t: any }) => (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 duration-500">
        <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card/95 backdrop-blur-md border-mystic-border' : 'bg-dream-surface/95 backdrop-blur-md border-white/10'} border rounded-2xl p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden max-h-[85vh] overflow-y-auto`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-violet-500 animate-pulse"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
            <div className="text-center mb-2">
                <h2 className={`text-2xl font-mystic font-bold ${isLight ? 'text-mystic-text' : 'text-white'} animate-pulse`}>{steps[0]?.label || t.processing.title}</h2>
            </div>

            <div className="space-y-4">
                {steps.map((step, idx) => (
                    <div key={step.id} className={`flex items-start gap-4 transition-all duration-500 ${step.status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 mt-0.5
                            ${step.status === 'completed' ? 'bg-green-500 text-white' : 
                                step.status === 'active' ? 'border-2 border-fuchsia-500 border-t-transparent animate-spin' : 
                                step.status === 'skipped' ? 'bg-slate-600 text-slate-300' : 'bg-slate-800 text-slate-500'}`}>
                            {step.status === 'completed' && <span className="material-icons text-sm">check</span>}
                            {step.status === 'skipped' && <span className="material-icons text-sm">close</span>}
                            {step.status === 'pending' && <div className="w-2 h-2 rounded-full bg-current"></div>}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-bold ${step.status === 'active' ? (isLight ? 'text-indigo-600' : 'text-white') : step.status === 'skipped' ? 'text-slate-500' : (isLight ? 'text-mystic-text' : 'text-slate-300')}`}>
                                {step.label}
                            </p>
                            
                            {/* DISPLAY CATEGORIES IN CONTEXT STEP */}
                            {step.id === 'context' && step.status === 'completed' && (
                                <div className="mt-1  slide-in-from-left-2">
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {categories.map(c => (
                                            <span key={c} className={`text-xs px-2 py-0.5 rounded border ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                                                {t.categories[c]}
                                            </span>
                                        ))}
                                        {sources.map(s => (
                                            <span key={s} className={`text-xs px-2 py-0.5 rounded border ${isLight ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                                                {t.sources[s]}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const VideoLoadingOverlay = ({ t }: { t: any }) => (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 ">
        <div className="w-24 h-24 rounded-full border-4 border-fuchsia-500 border-t-transparent animate-spin mb-6"></div>
        <h2 className="text-xl font-mystic font-bold text-white animate-pulse">{t.ui.video_gen}</h2>
        <p className="text-slate-400 text-sm mt-2">Veo AI (Beta)</p>
    </div>
);

const VideoResultModal = ({ onClose, url, t, isLight }: { onClose: () => void, url: string | null, t: any, isLight: boolean }) => {
    const [storyData, setStoryData] = useState<any>(null);
    const [currentSegment, setCurrentSegment] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (url?.startsWith('data:application/json')) {
            try {
                const base64 = url.split(',')[1];
                // Unicode-safe base64 decoding
                const binaryStr = atob(base64);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                const jsonStr = new TextDecoder().decode(bytes);
                const data = JSON.parse(jsonStr);
                if (data.type === 'story-video' || data.type === 'dream-narration' || data.type === 'dream-user-voice') {
                    setStoryData(data);
                }
            } catch (e) {
                console.error('Failed to parse story video data:', e);
            }
        }
    }, [url]);

    useEffect(() => {
        if (storyData && audioRef.current) {
            const audio = audioRef.current;

            const updateSegment = () => {
                const currentTime = audio.currentTime;
                const segment = storyData.segments.findIndex((s: any) =>
                    currentTime >= s.startTime && currentTime < s.endTime
                );
                if (segment !== -1) setCurrentSegment(segment);
            };

            audio.addEventListener('timeupdate', updateSegment);
            return () => audio.removeEventListener('timeupdate', updateSegment);
        }
    }, [storyData]);

    return (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-[95%] max-w-2xl ${isLight ? 'bg-mystic-card' : 'bg-dream-card'} border border-fuchsia-500/30 rounded-2xl overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col`}>
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
                    <h2 className={`text-xl font-mystic font-bold ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.ui.video_ready}</h2>
                    <button aria-label={t.ui.close} onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center">
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <div className="aspect-video bg-black relative">
                    {storyData ? (
                        <>
                            {storyData.segments[currentSegment]?.imageUrl && (
                                <img
                                    src={storyData.segments[currentSegment].imageUrl}
                                    alt={`Segment ${currentSegment + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white text-sm">{storyData.segments[currentSegment]?.text}</p>
                            </div>
                            <audio ref={audioRef} controls autoPlay className="absolute bottom-4 left-4 right-4">
                                <source src={storyData.audioBase64.startsWith('data:') ? storyData.audioBase64 : `data:audio/mp3;base64,${storyData.audioBase64}`} type={storyData.type === 'dream-user-voice' ? 'audio/webm' : 'audio/mp3'} />
                            </audio>
                        </>
                    ) : url ? (
                        <video src={url} controls autoPlay className="w-full h-full" />
                    ) : null}
                </div>
                <div className="p-4 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl bg-fuchsia-600 text-white font-bold">OK</button>
                </div>
            </div>
        </div>
    );
};

const StyleSelectionModal = ({ onSelect, t, isLight }: { onSelect: (quality: 'normal' | 'high', style: 'cartoon' | 'anime' | 'real' | 'fantasy' | null) => void, t: any, isLight: boolean }) => {
    const [selectedStyle, setSelectedStyle] = useState<'cartoon' | 'anime' | 'real' | 'fantasy' | null>(null);

    const handleConfirm = () => {
        if (selectedStyle) {
            // Always use 'normal' quality since we removed quality selection
            onSelect('normal', selectedStyle);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card' : 'bg-dream-card'} border border-fuchsia-500/30 rounded-2xl overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col`}>
                <div className="px-5 py-4 border-b border-white/10 shrink-0">
                    <h2 className={`text-2xl font-mystic font-bold ${isLight ? 'text-mystic-text' : 'text-white'} text-center`}>
                        {t.ui.choose_image_style}
                    </h2>
                    <p className={`text-sm ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'} text-center mt-2`}>
                        {t.ui.choose_style_desc || 'Wähle einen Stil für dein Traumbild'}
                    </p>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                    {/* Style Selection */}
                    <div>
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-3 text-center`}>
                            {t.ui.choose_style}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'cartoon', label: t.ui.style_cartoon || 'Cartoon', icon: '🎨', desc: t.ui.style_desc_cartoon },
                                { key: 'anime', label: t.ui.style_anime || 'Anime', icon: '⚡', desc: t.ui.style_desc_anime },
                                { key: 'real', label: t.ui.style_real || 'Real', icon: '📸', desc: t.ui.style_desc_real },
                                { key: 'fantasy', label: t.ui.style_fantasy || 'Fantasy', icon: '✨', desc: t.ui.style_desc_fantasy }
                            ].map((style) => (
                                <button
                                    key={style.key}
                                    onClick={() => setSelectedStyle(style.key as any)}
                                    className={`p-5 rounded-xl border-2 transition-all ${
                                        selectedStyle === style.key
                                            ? 'border-fuchsia-500 bg-fuchsia-500/20 scale-105'
                                            : `border-white/10 ${isLight ? 'bg-gray-100' : 'bg-white/5'} hover:border-fuchsia-500/50 hover:scale-102`
                                    }`}
                                >
                                    <div className="text-3xl mb-2">{style.icon}</div>
                                    <div className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                        {style.label}
                                    </div>
                                    <div className={`text-xs ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'} mt-1`}>
                                        {style.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-white/10 flex justify-between items-center gap-3 shrink-0">
                    <button
                        onClick={() => onSelect('normal', null)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                            isLight
                                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                    >
                        {t.ui.continue_without_image}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedStyle}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${
                            selectedStyle
                                ? 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {t.ui.continue}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ImageResultModal = ({ onClose, url, t, isLight }: { onClose: () => void, url: string | null, t: any, isLight: boolean }) => (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-[95%] max-w-lg ${isLight ? 'bg-mystic-card' : 'bg-dream-card'} border border-fuchsia-500/30 rounded-2xl overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col`}>
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
                    <h2 className={`text-xl font-mystic font-bold ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.ui.image_ready}</h2>
                    <button aria-label={t.ui.close} onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center">
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <div className="bg-black overflow-y-auto flex-1">
                    {url && (
                        <img src={url} alt="Generated dream" className="w-full h-auto" />
                    )}
                </div>
                <div className="p-4 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl bg-fuchsia-600 text-white font-bold">OK</button>
                </div>
            </div>
    </div>
);

const AdOverlay = ({ t, duration }: { t: any, duration: number }) => (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center">
        <div className="w-full h-full absolute bg-gradient-to-br from-yellow-600 to-orange-600 animate-pulse opacity-20"></div>
        <span className="material-icons text-6xl text-white mb-4 animate-bounce">play_circle_filled</span>
        <h2 className="text-2xl font-bold text-white relative z-10">{t.sub.ad_loading}</h2>
        <div className="w-64 h-2 bg-gray-700 rounded mt-4 overflow-hidden relative z-10">
            <div className="h-full bg-white rounded-full transition-all" style={{animation: `width ${duration}ms linear forwards`, width: '0%'}}></div>
        </div>
    </div>
);

const AudioUploadConfirmModal = ({ onClose, t, isLight }: { onClose: () => void, t: any, isLight: boolean }) => {
    const handleConfirm = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card' : 'bg-dream-deep'} border ${isLight ? 'border-purple-200' : 'border-purple-500/30'} rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto`}>
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4 animate-bounce">🎤✨</div>
                    <h2 className={`text-2xl font-bold mb-3 ${isLight ? 'text-purple-900' : 'text-white'}`}>{t.ui.upload_confirm_title}</h2>
                    <p className={`text-sm leading-relaxed ${isLight ? 'text-purple-700' : 'text-purple-200'}`}>
                        {t.ui.upload_confirm_desc}
                    </p>
                </div>

                <button
                    onClick={handleConfirm}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                >
                    {t.ui.got_it}
                </button>
            </div>
        </div>
    );
};

const NavBtn = ({ icon, label, active, onClick, isLight }: { icon: string, label: string, active: boolean, onClick: () => void, isLight: boolean }) => (
    <button onClick={onClick} aria-current={active ? 'page' : undefined} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${active ? (isLight ? 'text-fuchsia-600' : 'text-white') : (isLight ? 'text-slate-400 hover:text-indigo-900' : 'text-slate-500 hover:text-slate-300')}`}>
        <span className={`material-icons transition-all duration-300 ${active ? 'text-[28px] text-fuchsia-500 drop-shadow-[0_0_8px_rgba(192,38,211,0.6)]' : 'text-2xl'}`}>{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide max-w-[60px] truncate text-center">{label}</span>
        {active && <span className={`absolute -bottom-1 w-5 h-[3px] rounded-full ${isLight ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500' : 'bg-gradient-to-r from-fuchsia-500 to-violet-400'}`}></span>}
    </button>
);

const InfoModal = ({ onClose, data, t, isLight }: { onClose: () => void, data: any, t: any, isLight: boolean }) => {
    if (!data) return null;
    const modalBg = isLight ? 'bg-white/95 backdrop-blur-md border-indigo-100/60' : 'bg-dream-surface/95 backdrop-blur-md border-fuchsia-500/20';
    const textHead = isLight ? 'text-mystic-text' : 'text-white';
    const textBody = isLight ? 'text-mystic-text' : 'text-slate-300';
    const accentBg = isLight ? 'bg-indigo-50' : 'bg-white/5';
    const accentBorder = isLight ? 'border-indigo-200' : 'border-white/10';
    
    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 duration-300" onClick={onClose}>
            <div className={`w-[95%] max-w-md ${modalBg} border rounded-2xl p-0 shadow-2xl flex flex-col max-h-[85vh]`} onClick={e => e.stopPropagation()}>
                <div className="min-h-[6rem] bg-gradient-to-r from-indigo-900 via-fuchsia-900 to-purple-900 relative flex items-end p-5 pb-4 shrink-0 rounded-t-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                    <h2 className="text-2xl font-mystic font-bold text-white relative z-10 shadow-black drop-shadow-md pr-10 leading-tight">{data.title}</h2>
                    <button aria-label={t.ui.close} onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-black/30 rounded-full text-white flex items-center justify-center hover:bg-black/50 transition-colors z-20">
                        <span className="material-icons text-base">close</span>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div><p className={`text-sm leading-relaxed ${textBody}`}>{data.desc}</p></div>
                    {(data.origin || data.bio) && (
                            <div className={`p-4 rounded-xl border ${accentBg} ${accentBorder}`}>
                                {data.origin && (
                                    <div className="mb-3">
                                        <h4 className={`text-xs uppercase font-bold tracking-widest mb-1 opacity-70 ${textHead}`}>{t.ui.info_origin}</h4>
                                        <p className={`text-sm ${textBody}`}>{data.origin}</p>
                                    </div>
                                )}
                                {data.bio && (
                                    <div>
                                        <h4 className={`text-xs uppercase font-bold tracking-widest mb-1 opacity-70 ${textHead}`}>{t.ui.info_bio}</h4>
                                        <p className={`text-sm leading-relaxed ${textBody}`}>{data.bio}</p>
                                    </div>
                                )}
                            </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;

