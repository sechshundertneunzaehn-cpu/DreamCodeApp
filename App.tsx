// !!! WICHTIG / IMPORTANT !!!
// DIESE DATEI (INSBESONDERE DIE PROCESS-LOGIC) IST FINALISIERT (FROZEN).
// KEINE ÄNDERUNGEN AN DER ABFOLGE (CONTEXT/CUSTOMER) VORNEHMEN, ES SEI DENN, ES WIRD EXPLIZIT GEFORDERT.
// STATUS: COMPLETED & LOCKED.

import React, { useState, useEffect, useRef } from 'react';
import StarryBackground from './components/StarryBackground';
import ErrorBoundary from './components/ErrorBoundary';

// Direkt-Import statt lazy: verhindert Chunk-Fehler nach Deploys
import LiveSession from './components/LiveSession';
import DreamHub from './components/DreamHub';
import Profile from './components/Profile';
import Onboarding from './components/Onboarding';
import DreamCalendar from './components/DreamCalendar';
import DreamMap from './components/DreamMap';
import VoiceSelector, { VoiceCharacter, VOICE_CHARACTERS } from './components/VoiceSelector';
import { View, ReligiousSource, Dream, Language, ReligiousCategory, UserProfile, FontSize, SubscriptionTier, ThemeMode, DesignTheme, AudioVisibility } from './types';
import { analyzeDreamText, generateDreamImage, generateImagePrompt, generateSpeechPreview, generateStoryVideo, generateDreamVideo, generateDreamNarrationVideo, generateDreamUserVoiceVideo } from './services/geminiService';
import StoryVideoPlayer from './components/StoryVideoPlayer';
import { loadDreamsSecurely, loadProfileSecurely, saveDreamsSecurely, saveProfileSecurely, exportDataToFile, importDataFromFile } from './services/storage';
// Knowledge Base wird direkt importiert (wird für Analyse benötigt)
import { KNOWLEDGE_BASE } from './data/knowledgeBase';
import { FEATURE_PRICES, SUBSCRIPTION_TIERS, COIN_PACKAGES, REWARDS, coinToEur } from './config/pricing';

// --- Icons ---
const CATEGORY_ICONS: Record<ReligiousCategory, string> = {
  [ReligiousCategory.ISLAMIC]: '☪️',
  [ReligiousCategory.CHRISTIAN]: '✝️',
  [ReligiousCategory.BUDDHIST]: '☸️',
  [ReligiousCategory.PSYCHOLOGICAL]: '🧠',
  [ReligiousCategory.ASTROLOGY]: '🪐',
  [ReligiousCategory.NUMEROLOGY]: '🔢',
};

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
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Indien (Veden)"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islamisch', [ReligiousCategory.CHRISTIAN]: 'Christlich', [ReligiousCategory.BUDDHIST]: 'Buddhistisch', [ReligiousCategory.PSYCHOLOGICAL]: 'Psychologisch', [ReligiousCategory.ASTROLOGY]: 'Astrologie', [ReligiousCategory.NUMEROLOGY]: 'Numerologie',
        },
        sources: {
             [ReligiousSource.TIBETAN]: 'Tibetisch', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Mittelalterlich', [ReligiousSource.MODERN_THEOLOGY]: 'Moderne Theologie', [ReligiousSource.CHURCH_FATHERS]: 'Kirchenväter', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'C.G. Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Westlicher Zodiak', [ReligiousSource.VEDIC_ASTROLOGY]: 'Vedisch', [ReligiousSource.CHINESE_ZODIAC]: 'Chinesisch', [ReligiousSource.PYTHAGOREAN]: 'Pythagoras', [ReligiousSource.CHALDEAN]: 'Chaldäisch', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabbalah', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Ebced', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Vedische Zahlen'
        },
        ui: {
            placeholder: "Beschreibe deinen Traum...", interpret: "Traum Deuten", choose_tradition: "Tradition Wählen", refine_sources: "Quellen verfeinern", oracle_speaks: "Das Orakel spricht", close: "Schließen", listening: "Höre zu...", voices: "Stimme",
            settings: "Einstellungen", text_size: "Größe", dictation_error: "Fehler: Mikrofon nicht verfügbar.", dictation_perm: "Zugriff verweigert.",
            calendar_btn: "Kalender & Analyse", coming_soon: "Mehr...", calendar_desc: "Dein Traum-Journal",
            profile_btn: "Dein Profil", profile_desc: "Statistik & Ich",
            hub_btn: "Traum Hub", hub_desc: "Community Träume",
            gen_image: "Bild generieren", saved_msg: "Traum gespeichert! Siehe Kalender.",
            watch_ad: "Münzen verdienen", generate_video: "Video generieren (Gold)",
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
            tier_bronze: "Bronze",
            tier_silver: "Silber",
            tier_gold: "Gold",
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
            until_date: "Bis:"
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
            free_title: "Bronze (FREE)", 
            free_price: "0 €",
            free_features: ["Basis-Traumdeutung (Werbefinanziert)", "Zugang zur Offerwall für Gratis-Münzen", "Premium-Funktionen per Münzen", "Nur Link-Teilung der Deutung"],
            silver_title: "Silber (Premium)",
            silver_price: "4,99 € / Monat",
            silver_features: ["Komplett Werbefrei", "Unbegrenzte PDF-Konvertierung & Download", "Unbegrenzte Text-Deutungen", "25 HD-Bilder pro Monat", "1x wöchentlich Live-Chat mit KI", "Sprachsteuerung"],
            gold_title: "Gold (VIP)",
            gold_price: "10,00 € / Monat",
            gold_trial_text: "7 Tage gratis, dann 10,00 €/Mt",
            gold_features: ["Alles aus Silber inklusive", "Unbegrenzter Live-Chat mit dem Orakel", "5 Traum-Videos pro Monat", "Exklusiver Rabatt auf Münzkäufe", "Priority Support"],
            smart_title: "Smart (Entwickler)",
            smart_price: "3,00 € / Monat",
            smart_features: ["Bring Your Own Key (BYOK)", "Alle Premium Features freigeschaltet", "Automatische Provider-Rotation", "Günstiger Jahrespreis (Fix 30€)"],
            smart_info_title: "Was ist der Smart Developer Tarif?",
            smart_info_text: "Für Entwickler & Tech-Enthusiasten: Erstelle Accounts bei KI-Providern (z.B. Google AI Studio), generiere dort deine eigenen API Keys und füge sie hier in der App ein. So zahlst du nur die günstigen API-Kosten direkt beim Provider + 3€ für die App-Nutzung. Perfekt für Power-User!",
            upgrade: "Upgrade", current: "Aktuell", unlock: "Freischalten", try_free: "7 TAGE GRATIS TESTEN",
            ad_loading: "Werbung wird geladen...", ad_reward: "Münzen erhalten!"
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
            best_label: "Bestseller", best_price: "6,99 €", best_amount: "500 Münzen", best_badge: "Beliebt",
            value_label: "Vorrat", value_price: "14,99 €", value_amount: "1200 Münzen", value_badge: "Bester Wert",
            free_link: "Möchtest du Münzen gratis verdienen? Hier klicken.",
            buy_btn: "Kaufen",
            wow_badge: "💎 Unter 1 Cent/Münze!",
            coins_label: "Münzen",
            per_coin: "pro Münze"
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
            [ReligiousSource.VEDIC_NUMEROLOGY]: "India (Vedas)"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islamic', [ReligiousCategory.CHRISTIAN]: 'Christian', [ReligiousCategory.BUDDHIST]: 'Buddhist', [ReligiousCategory.PSYCHOLOGICAL]: 'Psychological', [ReligiousCategory.ASTROLOGY]: 'Astrology', [ReligiousCategory.NUMEROLOGY]: 'Numerology',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibetan', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Medieval', [ReligiousSource.MODERN_THEOLOGY]: 'Modern Theology', [ReligiousSource.CHURCH_FATHERS]: 'Church Fathers', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jungian', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Western Zodiac', [ReligiousSource.VEDIC_ASTROLOGY]: 'Vedic', [ReligiousSource.CHINESE_ZODIAC]: 'Chinese Zodiac', [ReligiousSource.PYTHAGOREAN]: 'Pythagorean', [ReligiousSource.CHALDEAN]: 'Chaldean', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabbalah', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Vedic Numbers'
        },
        ui: {
            placeholder: "Describe your dream...", interpret: "Interpret Dream", choose_tradition: "Choose Tradition", refine_sources: "Refine Sources", oracle_speaks: "The Oracle Speaks", close: "Close", listening: "Listening...", voices: "Voice",
            settings: "Settings", text_size: "Size", dictation_error: "Error: Mic not available.", dictation_perm: "Permission denied.",
            calendar_btn: "Calendar & Analysis", coming_soon: "More...", calendar_desc: "Your Dream Journal",
            profile_btn: "Your Profile", profile_desc: "Stats & Me",
            hub_btn: "Dream Hub", hub_desc: "Community Dreams",
            gen_image: "Generate Image", saved_msg: "Dream saved to calendar!",
            watch_ad: "Earn Coins", generate_video: "Generate Video (Gold)",
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
            tier_bronze: "Bronze",
            tier_silver: "Silver",
            tier_gold: "Gold",
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
            until_date: "Until:"
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
            free_title: "Bronze (FREE)", 
            free_price: "0 €",
            free_features: ["Basic Interpretation (Ad-supported)", "Access to Offerwall for free coins", "Premium via coins", "Link Sharing only"],
            silver_title: "Silver (Premium)",
            silver_price: "4.99 € / month",
            silver_features: ["Ad-Free Experience", "Unlimited PDF Conversion & Download", "Unlimited Interpretations", "25 HD Images/mo", "1x Weekly Live Chat", "Audio I/O"],
            gold_title: "Gold (VIP)", 
            gold_price: "10.00 € / month",
            gold_trial_text: "7 days free, then 10.00 €/mo",
            gold_features: ["All Silver Features Included", "Unlimited Live Oracle Chat", "5 Dream Videos/mo", "Exclusive Coin Discount", "Priority Support"],
            smart_title: "Smart (Developer)",
            smart_price: "3.00 € / month",
            smart_features: ["Bring Your Own Key (BYOK)", "All Premium Features Unlocked", "Auto-Provider Rotation", "Fixed Annual Price (30€)"],
            smart_info_title: "What is the Smart Developer Tier?",
            smart_info_text: "For developers & tech enthusiasts: Create accounts with AI providers (e.g., Google AI Studio), generate your own API keys there, and add them to the app. This way, you only pay the low API costs directly to the provider + €3 for app usage. Perfect for power users!",
            upgrade: "Upgrade", current: "Current", unlock: "Unlock", try_free: "TRY FREE FOR 7 DAYS",
            ad_loading: "Loading Ad...", ad_reward: "Coins earned!"
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
            best_label: "Bestseller", best_price: "6.99 €", best_amount: "500 Coins", best_badge: "Popular",
            value_label: "Best Value", value_price: "14.99 €", value_amount: "1200 Coins", value_badge: "Best Value",
            free_link: "Want to earn free coins? Click here.",
            buy_btn: "Buy",
            wow_badge: "💎 Under 1 Cent/Coin!",
            coins_label: "Coins",
            per_coin: "per coin"
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
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Hindistan (Vedalar)"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'İslami', [ReligiousCategory.CHRISTIAN]: 'Hristiyan', [ReligiousCategory.BUDDHIST]: 'Budist', [ReligiousCategory.PSYCHOLOGICAL]: 'Psikoloji', [ReligiousCategory.ASTROLOGY]: 'Astroloji', [ReligiousCategory.NUMEROLOGY]: 'Nümeroloji',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibet', [ReligiousSource.IBN_SIRIN]: 'İbn-i Sirin', [ReligiousSource.NABULSI]: 'Nablusi', [ReligiousSource.AL_ISKHAFI]: 'El-İskafi', [ReligiousSource.MEDIEVAL]: 'Ortaçağ', [ReligiousSource.MODERN_THEOLOGY]: 'Modern Teoloji', [ReligiousSource.CHURCH_FATHERS]: 'Kilise Babaları', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Batı Burçları', [ReligiousSource.VEDIC_ASTROLOGY]: 'Vedik', [ReligiousSource.CHINESE_ZODIAC]: 'Çin Burçları', [ReligiousSource.PYTHAGOREAN]: 'Pisagor', [ReligiousSource.CHALDEAN]: 'Keldani', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabala', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Ebced', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Vedik Sayılar'
        },
        ui: {
            placeholder: "Rüyanı anlat...", interpret: "Rüyayı Yorumla", choose_tradition: "Gelenek Seç", refine_sources: "Kaynakları Seç", oracle_speaks: "Kahin Konuşuyor", close: "Kapat", listening: "Dinleniyor...", voices: "Ses",
            settings: "Ayarlar", text_size: "Boyut", dictation_error: "Hata: Mikrofon yok.", dictation_perm: "Erişim reddedildi.",
            calendar_btn: "Takvim & Analiz", coming_soon: "Daha...", calendar_desc: "Rüya Günlüğün",
            profile_btn: "Profilin", profile_desc: "İstatistikler",
            hub_btn: "Rüya Merkezi", hub_desc: "Topluluk Rüyaları",
            gen_image: "Resim Oluştur", saved_msg: "Rüya takvime kaydedildi!",
            watch_ad: "Jeton Kazan", generate_video: "Video Oluştur (Gold)",
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
            tier_bronze: "Bronz",
            tier_silver: "Gümüş",
            tier_gold: "Altın",
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
            until_date: "Bitiş:"
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
            free_title: "Bronz (FREE)", 
            free_price: "0 €",
            free_features: ["Temel Rüya Tabiri (Reklamlı)", "Offerwall Erişimi", "Premium içeriği jetonla açma", "Sadece Link Paylaşımı"],
            silver_title: "Gümüş (Premium)",
            silver_price: "4.99 € / Ay",
            silver_features: ["Tamamen Reklamsız", "Sınırsız PDF Dönüştürme & İndirme", "Sınırsız Yorumlama", "25 HD Resim/Ay", "Haftada 1x Canlı Sohbet", "Sesli Giriş & Çıkış"],
            gold_title: "Altın (VIP)", 
            gold_price: "10.00 € / Ay",
            gold_trial_text: "7 gün ücretsiz, sonra 10.00 €/Ay",
            gold_features: ["Tüm Gümüş özellikleri dahil", "Sınırsız Canlı Kahin Sohbeti", "5 Rüya Videosu/Ay", "Jeton Alımlarında VIP İndirim", "Öncelikli Destek"],
            smart_title: "Akıllı (Geliştirici)",
            smart_price: "3.00 € / Ay",
            smart_features: ["Kendi Anahtarını Getir (BYOK)", "Tüm Premium Özellikler Açık", "Otomatik Sağlayıcı Geçişi", "Sabit Yıllık Ücret (30€)"],
            smart_info_title: "Smart Developer Tier Nedir?",
            smart_info_text: "Geliştiriciler ve teknoloji meraklıları için: Yapay zeka sağlayıcılarında hesap oluşturun (ör. Google AI Studio), orada kendi API anahtarlarınızı oluşturun ve buraya ekleyin. Böylece sadece düşük API maliyetlerini doğrudan sağlayıcıya ödeyip + uygulama kullanımı için 3€ ödersiniz. Power kullanıcılar için mükemmel!",
            upgrade: "Yükselt", current: "Mevcut", unlock: "Kilidi Aç", try_free: "7 GÜN ÜCRETSİZ DENE",
            ad_loading: "Reklam yükleniyor...", ad_reward: "Kredi kazanıldı!"
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
            best_label: "Çok Satan", best_price: "6,99 €", best_amount: "500 Jeton", best_badge: "Popüler",
            value_label: "En İyi Fiyat", value_price: "14,99 €", value_amount: "1200 Jeton", value_badge: "Fırsat",
            free_link: "Ücretsiz jeton kazanmak ister misin? Tıkla.",
            buy_btn: "Satın Al",
            wow_badge: "💎 1 Sent Altında/Jeton!",
            coins_label: "Jeton",
            per_coin: "jeton başına"
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
            [ReligiousSource.VEDIC_NUMEROLOGY]: "India (Vedas)"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islámica', [ReligiousCategory.CHRISTIAN]: 'Cristiana', [ReligiousCategory.BUDDHIST]: 'Budista', [ReligiousCategory.PSYCHOLOGICAL]: 'Psicológica', [ReligiousCategory.ASTROLOGY]: 'Astrología', [ReligiousCategory.NUMEROLOGY]: 'Numerología',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibetano', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Medieval', [ReligiousSource.MODERN_THEOLOGY]: 'Teología Moderna', [ReligiousSource.CHURCH_FATHERS]: 'Padres de la Iglesia', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Zodíaco Occidental', [ReligiousSource.VEDIC_ASTROLOGY]: 'Védica', [ReligiousSource.CHINESE_ZODIAC]: 'Zodíaco Chino', [ReligiousSource.PYTHAGOREAN]: 'Pitagórico', [ReligiousSource.CHALDEAN]: 'Caldeo', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Cábala', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Números Védicos'
        },
        ui: {
            placeholder: "Describe tu sueño...", interpret: "Interpretar Sueño", choose_tradition: "Elegir Tradición", refine_sources: "Refinar Fuentes", oracle_speaks: "El Oráculo Habla", close: "Cerrar", listening: "Escuchando...", voices: "Voz",
            settings: "Ajustes", text_size: "Tamaño", dictation_error: "Error: Micrófono no disponible.", dictation_perm: "Permiso denegado.",
            calendar_btn: "Calendario y Análisis", coming_soon: "Más...", calendar_desc: "Tu Diario de Sueños",
            profile_btn: "Tu Perfil", profile_desc: "Estadísticas y Yo",
            hub_btn: "Centro de Sueños", hub_desc: "Sueños de la Comunidad",
            gen_image: "Generar Imagen", saved_msg: "¡Sueño guardado en calendario!",
            watch_ad: "Ganar Monedas", generate_video: "Generar Video (Oro)",
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
            tier_bronze: "Bronce",
            tier_silver: "Plata",
            tier_gold: "Oro",
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
            until_date: "Hasta:"
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
            free_title: "Bronce (GRATIS)", 
            free_price: "0 €",
            free_features: ["Interpretación Básica (Con anuncios)", "Acceso a Offerwall para monedas gratis", "Premium vía monedas", "Solo compartir enlace"],
            silver_title: "Plata (Premium)",
            silver_price: "4.99 € / mes",
            silver_features: ["Experiencia sin anuncios", "Conversión y descarga ilimitada de PDF", "Interpretaciones ilimitadas", "25 Imágenes HD/mes", "1x Chat en vivo semanal", "Entrada/Salida de Audio"],
            gold_title: "Oro (VIP)", 
            gold_price: "10.00 € / mes",
            gold_trial_text: "7 días gratis, luego 10.00 €/mes",
            gold_features: ["Todas las características de Plata", "Chat ilimitado con el Oráculo", "5 Videos de Sueños/mes", "Descuento exclusivo en monedas", "Soporte Prioritario"],
            smart_title: "Inteligente (Desarrollador)",
            smart_price: "3.00 € / mes",
            smart_features: ["Trae Tu Propia Clave (BYOK)", "Todas las funciones Premium desbloqueadas", "Rotación automática de proveedor", "Precio anual fijo (30€)"],
            smart_info_title: "¿Qué es el plan Smart Developer?",
            smart_info_text: "Para desarrolladores y entusiastas de la tecnología: crea cuentas con proveedores de IA (por ejemplo, Google AI Studio), genera tus propias claves API allí y agrégalas a la aplicación. De esta manera, solo pagas los bajos costos de API directamente al proveedor + 3 € por el uso de la aplicación. ¡Perfecto para usuarios avanzados!",
            upgrade: "Mejorar", current: "Actual", unlock: "Desbloquear", try_free: "PRUEBA GRATIS 7 DÍAS",
            ad_loading: "Cargando anuncio...", ad_reward: "¡Monedas ganadas!"
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
            best_label: "Más Vendido", best_price: "6.99 €", best_amount: "500 Monedas", best_badge: "Popular",
            value_label: "Mejor Valor", value_price: "14.99 €", value_amount: "1200 Monedas", value_badge: "Mejor Valor",
            free_link: "¿Quieres ganar monedas gratis? Haz clic aquí.",
            buy_btn: "Comprar",
            wow_badge: "💎 ¡Menos de 1 Céntimo/Moneda!",
            coins_label: "Monedas",
            per_coin: "por moneda"
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
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Inde (Védas)"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islamique', [ReligiousCategory.CHRISTIAN]: 'Chrétien', [ReligiousCategory.BUDDHIST]: 'Bouddhiste', [ReligiousCategory.PSYCHOLOGICAL]: 'Psychologique', [ReligiousCategory.ASTROLOGY]: 'Astrologie', [ReligiousCategory.NUMEROLOGY]: 'Numérologie',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibétain', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Médiéval', [ReligiousSource.MODERN_THEOLOGY]: 'Théologie Moderne', [ReligiousSource.CHURCH_FATHERS]: 'Pères de l\'Église', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Zodiaque Occidental', [ReligiousSource.VEDIC_ASTROLOGY]: 'Védique', [ReligiousSource.CHINESE_ZODIAC]: 'Zodiaque Chinois', [ReligiousSource.PYTHAGOREAN]: 'Pythagoricien', [ReligiousSource.CHALDEAN]: 'Chaldéen', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Kabbale', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Nombres Védiques'
        },
        ui: {
            placeholder: "Décrivez votre rêve...", interpret: "Interpréter le Rêve", choose_tradition: "Choisir la Tradition", refine_sources: "Affiner les Sources", oracle_speaks: "L'Oracle Parle", close: "Fermer", listening: "Écoute...", voices: "Voix",
            settings: "Paramètres", text_size: "Taille", dictation_error: "Erreur : Micro indisponible.", dictation_perm: "Permission refusée.",
            calendar_btn: "Calendrier et Analyse", coming_soon: "Plus...", calendar_desc: "Votre Journal de Rêves",
            profile_btn: "Votre Profil", profile_desc: "Stats et Moi",
            hub_btn: "Centre des Rêves", hub_desc: "Rêves de la Communauté",
            gen_image: "Générer Image", saved_msg: "Rêve sauvegardé dans le calendrier !",
            watch_ad: "Gagner des Pièces", generate_video: "Générer Vidéo (Or)",
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
            tier_bronze: "Bronze",
            tier_silver: "Argent",
            tier_gold: "Or",
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
            until_date: "Jusqu'au :"
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
            free_title: "Bronze (GRATUIT)", 
            free_price: "0 €",
            free_features: ["Interprétation de base (Avec pubs)", "Accès à l'Offerwall pour pièces gratuites", "Premium via pièces", "Partage de lien uniquement"],
            silver_title: "Argent (Premium)",
            silver_price: "4.99 € / mois",
            silver_features: ["Expérience sans publicité", "Conversion et téléchargement PDF illimités", "Interprétations illimitées", "25 Images HD/mois", "1x Chat en direct par semaine", "Entrée/Sortie Audio"],
            gold_title: "Or (VIP)", 
            gold_price: "10.00 € / mois",
            gold_trial_text: "7 jours gratuits, puis 10.00 €/mois",
            gold_features: ["Toutes les fonctionnalités Argent", "Chat Oracle illimité", "5 Vidéos de Rêves/mois", "Remise exclusive sur les pièces", "Support Prioritaire"],
            smart_title: "Intelligent (Développeur)",
            smart_price: "3.00 € / mois",
            smart_features: ["Apportez votre propre clé (BYOK)", "Toutes les fonctions Premium débloquées", "Rotation automatique du fournisseur", "Prix annuel fixe (30€)"],
            smart_info_title: "Qu'est-ce que le forfait Smart Developer ?",
            smart_info_text: "Pour les développeurs et passionnés de technologie : créez des comptes auprès de fournisseurs d'IA (par ex. Google AI Studio), générez vos propres clés API là-bas et ajoutez-les à l'application. Ainsi, vous ne payez que les faibles coûts d'API directement au fournisseur + 3 € pour l'utilisation de l'application. Parfait pour les power users !",
            upgrade: "Mettre à niveau", current: "Actuel", unlock: "Débloquer", try_free: "ESSAI GRATUIT 7 JOURS",
            ad_loading: "Chargement pub...", ad_reward: "Pièces gagnées !"
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
            best_label: "Meilleure Vente", best_price: "6.99 €", best_amount: "500 Pièces", best_badge: "Populaire",
            value_label: "Meilleure Valeur", value_price: "14.99 €", value_amount: "1200 Pièces", value_badge: "Meilleure Valeur",
            free_link: "Vous voulez gagner des pièces gratuites ? Cliquez ici.",
            buy_btn: "Acheter",
            wow_badge: "💎 Moins d'1 Centime/Pièce !",
            coins_label: "Pièces",
            per_coin: "par pièce"
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
            [ReligiousSource.VEDIC_NUMEROLOGY]: "الهند (الفيدا)"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'إسلامي', [ReligiousCategory.CHRISTIAN]: 'مسيحي', [ReligiousCategory.BUDDHIST]: 'بوذي', [ReligiousCategory.PSYCHOLOGICAL]: 'نفسي', [ReligiousCategory.ASTROLOGY]: 'تنجيم', [ReligiousCategory.NUMEROLOGY]: 'علم الأرقام',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'تبتي', [ReligiousSource.IBN_SIRIN]: 'ابن سيرين', [ReligiousSource.NABULSI]: 'النابلسي', [ReligiousSource.AL_ISKHAFI]: 'الإسخافي', [ReligiousSource.MEDIEVAL]: 'قروسطي', [ReligiousSource.MODERN_THEOLOGY]: 'لاهوت حديث', [ReligiousSource.CHURCH_FATHERS]: 'آباء الكنيسة', [ReligiousSource.ZEN]: 'زن', [ReligiousSource.THERAVADA]: 'ثيرافادا', [ReligiousSource.FREUDIAN]: 'فرويد', [ReligiousSource.JUNGIAN]: 'يونغ', [ReligiousSource.GESTALT]: 'جشطالت', [ReligiousSource.WESTERN_ZODIAC]: 'أبراج غربية', [ReligiousSource.VEDIC_ASTROLOGY]: 'فيدي', [ReligiousSource.CHINESE_ZODIAC]: 'أبراج صينية', [ReligiousSource.PYTHAGOREAN]: 'فيثاغوري', [ReligiousSource.CHALDEAN]: 'كلداني', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'كابالا', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'حساب الجمل', [ReligiousSource.VEDIC_NUMEROLOGY]: 'أرقام فيدي'
        },
        ui: {
            placeholder: "صف حلمك...", interpret: "تفسير الحلم", choose_tradition: "اختر التقليد", refine_sources: "تحديد المصادر", oracle_speaks: "العراف يتحدث", close: "إغلاق", listening: "جاري الاستماع...", voices: "الصوت",
            settings: "الإعدادات", text_size: "الحجم", dictation_error: "خطأ: الميكروفون غير متوفر.", dictation_perm: "تم رفض الإذن.",
            calendar_btn: "التقويم والتحليل", coming_soon: "المزيد...", calendar_desc: "مذكرات أحلامك",
            profile_btn: "ملفك الشخصي", profile_desc: "الإحصائيات وأنا",
            hub_btn: "مركز الأحلام", hub_desc: "أحلام المجتمع",
            gen_image: "إنشاء صورة", saved_msg: "تم حفظ الحلم في التقويم!",
            watch_ad: "كسب عملات", generate_video: "إنشاء فيديو (ذهبي)",
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
            tier_bronze: "برونزي",
            tier_silver: "فضي",
            tier_gold: "ذهبي",
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
            until_date: "حتى:"
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
            free_title: "برونزي (مجاني)", 
            free_price: "0 €",
            free_features: ["تفسير أساسي (مدعوم بالإعلانات)", "الوصول إلى جدار العروض لعملات مجانية", "بريميوم عبر العملات", "مشاركة الرابط فقط"],
            silver_title: "فضي (بريميوم)",
            silver_price: "4.99 € / شهر",
            silver_features: ["تجربة خالية من الإعلانات", "تحويل وتنزيل PDF غير محدود", "تفسيرات غير محدودة", "25 صورة HD/شهر", "دردشة مباشرة أسبوعية", "إدخال/إخراج صوتي"],
            gold_title: "ذهبي (VIP)",
            gold_price: "14.99 € / شهر",
            gold_trial_text: "7 أيام مجانًا، ثم 14.99 €/شهر",
            gold_features: ["جميع ميزات الفضي", "دردشة غير محدودة مع العراف", "5 فيديوهات أحلام/شهر", "خصم حصري على العملات", "دعم ذو أولوية"],
            smart_title: "ذكي (للمطورين)",
            smart_price: "3.00 € / شهر",
            smart_features: ["استخدم مفتاحك الخاص (BYOK)", "فتح جميع ميزات البريميوم", "تدوير تلقائي للمزود", "سعر سنوي ثابت (30€)"],
            smart_info_title: "ما هو تعريفة Smart Developer؟",
            smart_info_text: "للمطورين وعشاق التكنولوجيا: أنشئ حسابات مع موفري الذكاء الاصطناعي (مثل Google AI Studio)، وقم بإنشاء مفاتيح API الخاصة بك هناك وأضفها إلى التطبيق. بهذه الطريقة، تدفع فقط تكاليف API المنخفضة مباشرة للمزود + 3 يورو لاستخدام التطبيق. مثالي للمستخدمين المتقدمين!",
            upgrade: "ترقية", current: "حالياً", unlock: "فتح", try_free: "جرب مجانًا لمدة 7 أيام",
            ad_loading: "جاري تحميل الإعلان...", ad_reward: "تم كسب العملات!"
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
            best_label: "الأكثر مبيعاً", best_price: "6.99 €", best_amount: "500 عملة", best_badge: "شائع",
            value_label: "أفضل قيمة", value_price: "14.99 €", value_amount: "1200 عملة", value_badge: "أفضل قيمة",
            free_link: "هل تريد كسب عملات مجانية؟ اضغط هنا.",
            buy_btn: "شراء",
            wow_badge: "💎 أقل من سنت/عملة!",
            coins_label: "عملات",
            per_coin: "لكل عملة"
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
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Índia (Vedas)"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Islâmico', [ReligiousCategory.CHRISTIAN]: 'Cristão', [ReligiousCategory.BUDDHIST]: 'Budista', [ReligiousCategory.PSYCHOLOGICAL]: 'Psicológico', [ReligiousCategory.ASTROLOGY]: 'Astrologia', [ReligiousCategory.NUMEROLOGY]: 'Numerologia',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Tibetano', [ReligiousSource.IBN_SIRIN]: 'Ibn Sirin', [ReligiousSource.NABULSI]: 'Al-Nabulsi', [ReligiousSource.AL_ISKHAFI]: 'Al-Iskhafi', [ReligiousSource.MEDIEVAL]: 'Medieval', [ReligiousSource.MODERN_THEOLOGY]: 'Teologia Moderna', [ReligiousSource.CHURCH_FATHERS]: 'Pais da Igreja', [ReligiousSource.ZEN]: 'Zen', [ReligiousSource.THERAVADA]: 'Theravada', [ReligiousSource.FREUDIAN]: 'Freud', [ReligiousSource.JUNGIAN]: 'Jung', [ReligiousSource.GESTALT]: 'Gestalt', [ReligiousSource.WESTERN_ZODIAC]: 'Zodíaco Ocidental', [ReligiousSource.VEDIC_ASTROLOGY]: 'Védica', [ReligiousSource.CHINESE_ZODIAC]: 'Zodíaco Chinês', [ReligiousSource.PYTHAGOREAN]: 'Pitagórico', [ReligiousSource.CHALDEAN]: 'Caldeu', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Cabala', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Abjad', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Números Védicos'
        },
        ui: {
            placeholder: "Descreva seu sonho...", interpret: "Interpretar Sonho", choose_tradition: "Escolher Tradição", refine_sources: "Refinar Fontes", oracle_speaks: "O Oráculo Fala", close: "Fechar", listening: "Ouvindo...", voices: "Voz",
            settings: "Configurações", text_size: "Tamanho", dictation_error: "Erro: Microfone indisponível.", dictation_perm: "Permissão negada.",
            calendar_btn: "Calendário e Análise", coming_soon: "Mais...", calendar_desc: "Seu Diário de Sonhos",
            profile_btn: "Seu Perfil", profile_desc: "Estatísticas e Eu",
            hub_btn: "Central de Sonhos", hub_desc: "Sonhos da Comunidade",
            gen_image: "Gerar Imagem", saved_msg: "Sonho salvo no calendário!",
            watch_ad: "Ganhar Moedas", generate_video: "Gerar Vídeo (Ouro)",
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
            tier_bronze: "Bronze",
            tier_silver: "Prata",
            tier_gold: "Ouro",
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
            until_date: "Até:"
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
            free_title: "Bronze (GRÁTIS)", 
            free_price: "0 €",
            free_features: ["Interpretação Básica (Com anúncios)", "Acesso ao Offerwall para moedas grátis", "Premium via moedas", "Apenas compartilhamento de link"],
            silver_title: "Prata (Premium)",
            silver_price: "4.99 € / mês",
            silver_features: ["Experiência sem anúncios", "Conversão e download ilimitado de PDF", "Interpretações ilimitadas", "25 Imagens HD/mês", "1x Chat ao vivo semanal", "Entrada/Saída de Áudio"],
            gold_title: "Ouro (VIP)", 
            gold_price: "14.99 € / mês",
            gold_trial_text: "7 dias grátis, depois 14.99 €/mês",
            gold_features: ["Todos os recursos Prata", "Chat Ilimitado com o Oráculo", "5 Vídeos de Sonhos/mês", "Desconto exclusivo em moedas", "Suporte Prioritário"],
            smart_title: "Inteligente (Desenvolvedor)",
            smart_price: "3.00 € / mês",
            smart_features: ["Traga Sua Própria Chave (BYOK)", "Todos os recursos Premium desbloqueados", "Rotação automática de provedor", "Preço anual fixo (30€)"],
            smart_info_title: "O que é o plano Smart Developer?",
            smart_info_text: "Para desenvolvedores e entusiastas de tecnologia: crie contas com provedores de IA (por exemplo, Google AI Studio), gere suas próprias chaves de API lá e adicione-as ao aplicativo. Dessa forma, você paga apenas os baixos custos de API diretamente ao provedor + 3€ pelo uso do aplicativo. Perfeito para power users!",
            upgrade: "Atualizar", current: "Atual", unlock: "Desbloquear", try_free: "TESTE GRÁTIS POR 7 DIAS",
            ad_loading: "Carregando anúncio...", ad_reward: "Moedas ganhas!"
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
            best_label: "Mais Vendido", best_price: "6.99 €", best_amount: "500 Moedas", best_badge: "Popular",
            value_label: "Melhor Valor", value_price: "14.99 €", value_amount: "1200 Moedas", value_badge: "Melhor Valor",
            free_link: "Quer ganhar moedas grátis? Clique aqui.",
            buy_btn: "Comprar",
            wow_badge: "💎 Menos de 1 Cêntimo/Moeda!",
            coins_label: "Moedas",
            per_coin: "por moeda"
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
            [ReligiousSource.VEDIC_NUMEROLOGY]: "Индия (Веды)"
        },
        categories: {
            [ReligiousCategory.ISLAMIC]: 'Исламский', [ReligiousCategory.CHRISTIAN]: 'Христианский', [ReligiousCategory.BUDDHIST]: 'Буддийский', [ReligiousCategory.PSYCHOLOGICAL]: 'Психологический', [ReligiousCategory.ASTROLOGY]: 'Астрология', [ReligiousCategory.NUMEROLOGY]: 'Нумерология',
        },
        sources: {
            [ReligiousSource.TIBETAN]: 'Тибетский', [ReligiousSource.IBN_SIRIN]: 'Ибн Сирин', [ReligiousSource.NABULSI]: 'Ан-Набулси', [ReligiousSource.AL_ISKHAFI]: 'Аль-Исхафи', [ReligiousSource.MEDIEVAL]: 'Средневековый', [ReligiousSource.MODERN_THEOLOGY]: 'Современное богословие', [ReligiousSource.CHURCH_FATHERS]: 'Отцы Церкви', [ReligiousSource.ZEN]: 'Дзен', [ReligiousSource.THERAVADA]: 'Тхеравада', [ReligiousSource.FREUDIAN]: 'Фрейд', [ReligiousSource.JUNGIAN]: 'Юнг', [ReligiousSource.GESTALT]: 'Гештальт', [ReligiousSource.WESTERN_ZODIAC]: 'Западный зодиак', [ReligiousSource.VEDIC_ASTROLOGY]: 'Ведическая', [ReligiousSource.CHINESE_ZODIAC]: 'Китайский зодиак', [ReligiousSource.PYTHAGOREAN]: 'Пифагорейская', [ReligiousSource.CHALDEAN]: 'Халдейская', [ReligiousSource.KABBALAH_NUMEROLOGY]: 'Каббала', [ReligiousSource.ISLAMIC_NUMEROLOGY]: 'Абджад', [ReligiousSource.VEDIC_NUMEROLOGY]: 'Ведические числа'
        },
        ui: {
            placeholder: "Опишите ваш сон...", interpret: "Толковать сон", choose_tradition: "Выбрать традицию", refine_sources: "Уточнить источники", oracle_speaks: "Оракул говорит", close: "Закрыть", listening: "Слушаю...", voices: "Голос",
            settings: "Настройки", text_size: "Размер", dictation_error: "Ошибка: микрофон недоступен.", dictation_perm: "Доступ запрещен.",
            calendar_btn: "Календарь и анализ", coming_soon: "Ещё...", calendar_desc: "Ваш дневник снов",
            profile_btn: "Ваш профиль", profile_desc: "Статистика и я",
            hub_btn: "Центр снов", hub_desc: "Сны сообщества",
            gen_image: "Создать изображение", saved_msg: "Сон сохранен в календаре!",
            watch_ad: "Заработать монеты", generate_video: "Создать видео (Золото)",
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
            tier_bronze: "Бронза",
            tier_silver: "Серебро",
            tier_gold: "Золото",
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
            until_date: "До:"
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
            free_title: "Бронза (БЕСПЛАТНО)",
            free_price: "0 €",
            free_features: ["Базовое толкование (С рекламой)", "Доступ к Offerwall для бесплатных монет", "Премиум через монеты", "Только ссылка для обмена"],
            silver_title: "Серебро (Премиум)",
            silver_price: "4.99 € / мес",
            silver_features: ["Без рекламы", "Неограниченная конвертация и загрузка PDF", "Неограниченные толкования", "25 HD изображений/мес", "1x еженедельный живой чат", "Аудио ввод/вывод"],
            gold_title: "Золото (VIP)",
            gold_price: "14.99 € / мес",
            gold_trial_text: "7 дней бесплатно, затем 14.99 €/мес",
            gold_features: ["Все функции Серебра", "Неограниченный чат с Оракулом", "5 видео снов/мес", "Эксклюзивная скидка на монеты", "Приоритетная поддержка"],
            smart_title: "Умный (Разработчик)",
            smart_price: "3.00 € / мес",
            smart_features: ["Используйте свой ключ (BYOK)", "Все премиум-функции разблокированы", "Автоматическая ротация провайдера", "Фиксированная годовая цена (30€)"],
            smart_info_title: "Что такое тариф Smart Developer?",
            smart_info_text: "Для разработчиков и энтузиастов: создайте аккаунты у поставщиков ИИ (например, Google AI Studio), сгенерируйте там свои API-ключи и добавьте их в приложение. Так вы платите только низкую стоимость API напрямую поставщику + 3€ за использование приложения. Идеально для продвинутых пользователей!",
            upgrade: "Обновить", current: "Текущий", unlock: "Разблокировать", try_free: "ПОПРОБОВАТЬ БЕСПЛАТНО 7 ДНЕЙ",
            ad_loading: "Загрузка рекламы...", ad_reward: "Монеты получены!"
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
            best_label: "Самый популярный", best_price: "6.99 €", best_amount: "500 монет", best_badge: "Популярный",
            value_label: "Лучшее предложение", value_price: "14.99 €", value_amount: "1200 монет", value_badge: "Лучшее предложение",
            free_link: "Хотите заработать бесплатные монеты? Нажмите здесь.",
            buy_btn: "Купить",
            wow_badge: "💎 Меньше 1 Цента/Монета!",
            coins_label: "монет",
            per_coin: "за монету"
        },
        smart_guide: {
            step1_title: "Создать аккаунт", step1_desc: "Создайте бесплатный аккаунт в Google AI Studio.",
            step2_title: "Сгенерировать ключ", step2_desc: "Скопируйте свой персональный ключ API оттуда.",
            step3_title: "Вставить в приложение", step3_desc: "Вставьте ключ сюда, чтобы разблокировать Премиум."
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
}

const App: React.FC = () => {
    console.log('[APP] Component rendering...');
    const [view, setView] = useState<View>(View.HOME);
    const [language, setLanguage] = useState<Language>(Language.DE);
    const [dreamInput, setDreamInput] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<ReligiousCategory[]>([]);
    const [selectedSources, setSelectedSources] = useState<ReligiousSource[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [dreams, setDreams] = useState<Dream[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
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
    const [isAdPlaying, setIsAdPlaying] = useState(false);
    const [adDuration, setAdDuration] = useState(0);
    
    // Sync body background with theme
    useEffect(() => {
        document.body.style.backgroundColor = themeMode === ThemeMode.LIGHT ? '#ffffff' : '#0f0b1a';
    }, [themeMode]);

    // --- Persistence Initialization ---
    // !!! CRITICAL FIX: ASYNC LOADING TO PREVENT DATA OVERWRITE !!!
    useEffect(() => {
        const init = async () => {
            console.log("Initializing Data Vault...");
            try {
                const loadedDreams = await loadDreamsSecurely();
                setDreams(loadedDreams);
                
                let loadedProfile = await loadProfileSecurely();
                
                if (!loadedProfile) {
                     console.log("No profile found in vault. Creating fresh default.");
                     loadedProfile = {
                         name: 'Dreamer',
                         interests: [],
                         credits: 100,
                         subscriptionTier: SubscriptionTier.FREE,
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

                // Auto-detect device language on first launch
                try {
                    const deviceLang = navigator.language.toLowerCase();
                    if (deviceLang.startsWith('de')) setLanguage(Language.DE);
                    else if (deviceLang.startsWith('tr')) setLanguage(Language.TR);
                    else if (deviceLang.startsWith('es')) setLanguage(Language.ES);
                    else if (deviceLang.startsWith('fr')) setLanguage(Language.FR);
                    else if (deviceLang.startsWith('ar')) setLanguage(Language.AR);
                    else if (deviceLang.startsWith('pt')) setLanguage(Language.PT);
                    else if (deviceLang.startsWith('ru')) setLanguage(Language.RU);
                    else setLanguage(Language.EN);
                } catch (e) {
                    console.log('Could not detect device language', e);
                }

                // Ensure Credits for FREE users
                if ((loadedProfile.credits ?? 0) < 100) {
                     loadedProfile = { ...loadedProfile, credits: 100 };
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
        
        setTimeout(async () => {
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
                await new Promise(r => setTimeout(r, 800)); // Artificial delay
                updateStep('context', 'completed');
            } else {
                updateStep('context', 'skipped', t.processing.step_no_context);
                await new Promise(r => setTimeout(r, 500));
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
                await new Promise(r => setTimeout(r, 600)); // Artificial delay
                updateStep('customer', 'completed');
            } else {
                updateStep('customer', 'skipped', t.processing.step_no_customer || "Keine Kundendaten");
                await new Promise(r => setTimeout(r, 500));
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
                const generatedUrl = await generateDreamImage(inputText, currentProfile, quality, style);
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
            await new Promise(r => setTimeout(r, 600));

            // Finish
            await new Promise(r => setTimeout(r, 1000));
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
    
    const getAvailableSources = () => {
        let sources: ReligiousSource[] = [];
        if (selectedCategories.includes(ReligiousCategory.ISLAMIC)) sources.push(ReligiousSource.IBN_SIRIN, ReligiousSource.NABULSI, ReligiousSource.AL_ISKHAFI);
        if (selectedCategories.includes(ReligiousCategory.CHRISTIAN)) sources.push(ReligiousSource.MEDIEVAL, ReligiousSource.MODERN_THEOLOGY, ReligiousSource.CHURCH_FATHERS);
        if (selectedCategories.includes(ReligiousCategory.BUDDHIST)) sources.push(ReligiousSource.ZEN, ReligiousSource.TIBETAN, ReligiousSource.THERAVADA);
        if (selectedCategories.includes(ReligiousCategory.PSYCHOLOGICAL)) sources.push(ReligiousSource.FREUDIAN, ReligiousSource.JUNGIAN, ReligiousSource.GESTALT);
        if (selectedCategories.includes(ReligiousCategory.ASTROLOGY)) sources.push(ReligiousSource.WESTERN_ZODIAC, ReligiousSource.VEDIC_ASTROLOGY, ReligiousSource.CHINESE_ZODIAC);
        if (selectedCategories.includes(ReligiousCategory.NUMEROLOGY)) sources.push(ReligiousSource.PYTHAGOREAN, ReligiousSource.CHALDEAN, ReligiousSource.KABBALAH_NUMEROLOGY, ReligiousSource.VEDIC_NUMEROLOGY, ReligiousSource.ISLAMIC_NUMEROLOGY);
        return [...new Set(sources)];
    };

    const isLight = themeMode === ThemeMode.LIGHT;
    
    const appBgInput = isLight 
        ? 'bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl shadow-indigo-100/50' 
        : 'bg-[#0f0b1a]/80 border-white/10';

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
                [Language.PT]: 'pt-BR', [Language.RU]: 'ru-RU'
            };
            const dateStr = nextMonth.toLocaleDateString(localeMap[language] || 'de-DE', { day: '2-digit', month: '2-digit' });

            let label = t.ui.tier_bronze;
            let style = isLight ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-amber-900/20 text-amber-600 border-amber-700/30";
            let dateText = t.ui.base_version;

            if (currentTier === SubscriptionTier.PLUS) {
                label = t.ui.tier_silver;
                style = isLight ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-slate-800 text-slate-300 border-slate-500";
                dateText = `${t.ui.until_date} ${dateStr}`;
            } else if (currentTier === SubscriptionTier.PRO) {
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
        <div className="max-w-4xl mx-auto  duration-500 pb-20">
             <div className="flex items-center justify-between mb-8 gap-4">
                 <div className="text-left">
                     <h1 className={`text-5xl font-mystic text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-fuchsia-200 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] ${isLight ? 'from-indigo-600 via-fuchsia-600 to-violet-600 drop-shadow-none' : ''}`} style={{ lineHeight: '1.1' }}>
                         {(() => {
                             const parts = t.app_title.split(' | ');
                             if (parts.length === 2) {
                                 return (
                                     <>
                                         <span className="block">{parts[0]}</span>
                                         <span className={`text-lg font-normal ml-0 mt-1 block ${isLight ? 'text-fuchsia-400' : 'text-fuchsia-300/50'}`}>| {parts[1]}</span>
                                     </>
                                 );
                             }
                             return t.app_title;
                         })()}
                     </h1>
                     <p className={`text-[10px] tracking-[0.2em] uppercase mt-2 bg-clip-text text-transparent bg-gradient-to-r ${isLight ? 'from-indigo-500 via-fuchsia-500 to-violet-500' : 'from-fuchsia-300 via-violet-300 to-cyan-300'}`} style={{ backgroundSize: '200% auto', animation: 'gradient-shift 4s ease infinite' }}>
                         {t.app_subtitle}
                     </p>
                 </div>
                 
                 <div className="flex flex-col items-end gap-1">
                      <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as Language)}
                          className={`px-2 py-0.5 rounded-md border text-[10px] font-bold transition-all cursor-pointer ${isLight ? 'bg-white/80 border-indigo-200 text-indigo-900' : 'bg-slate-800/80 border-fuchsia-500/30 text-white'}`}
                      >
                          <option value={Language.EN}>🇬🇧 EN</option>
                          <option value={Language.DE}>🇩🇪 DE</option>
                          <option value={Language.TR}>🇹🇷 TR</option>
                          <option value={Language.ES}>🇪🇸 ES</option>
                          <option value={Language.FR}>🇫🇷 FR</option>
                          <option value={Language.AR}>🇸🇦 AR</option>
                          <option value={Language.PT}>🇵🇹 PT</option>
                          <option value={Language.RU}>🇷🇺 RU</option>
                      </select>

                      {/* COINS & TIER DISPLAY - UPDATED LAYOUT */}
                      <div className="flex items-center justify-end gap-2 mt-1">
                           {tier === SubscriptionTier.FREE && (
                               <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shadow-sm ${isLight ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 text-amber-800 shadow-amber-200/50' : 'bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border-amber-500/40 text-amber-400 shadow-amber-500/20'}`}>
                                    <span className="text-sm" style={{ filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.5))' }}>🪙</span>
                                    <span className={`text-sm font-extrabold tracking-wide ${isLight ? 'text-amber-700' : 'text-amber-300'}`} style={{ textShadow: isLight ? 'none' : '0 0 8px rgba(245,158,11,0.4)' }}>{credits}</span>
                                    <button onClick={() => setShowCoinShop(true)} className={`ml-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white transition-transform hover:scale-110 ${isLight ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm shadow-amber-300' : 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-sm shadow-amber-500/50'}`}>+</button>
                               </div>
                           )}
                           <div className={`px-1.5 py-0.5 rounded border flex flex-col items-end ${tierInfo.style}`}>
                               <span className="text-[8px] font-bold uppercase tracking-wider">{tierInfo.label}</span>
                           </div>
                      </div>
                      <span className={`text-[9px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                          {tierInfo.dateText}
                      </span>
                 </div>
             </div>
             
             <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                 <span className={`w-8 h-[1px] ${isLight ? 'bg-indigo-200' : 'bg-slate-600'}`}></span> {t.ui.choose_tradition}
             </h3>
             
             <div className="grid grid-cols-3 gap-3 mb-6">
                 {[
                     ReligiousCategory.ISLAMIC, ReligiousCategory.CHRISTIAN, ReligiousCategory.BUDDHIST,
                     ReligiousCategory.PSYCHOLOGICAL, ReligiousCategory.ASTROLOGY, ReligiousCategory.NUMEROLOGY
                 ].map(cat => {
                     const isSelected = selectedCategories.includes(cat);
                     const isReligious = [ReligiousCategory.ISLAMIC, ReligiousCategory.CHRISTIAN, ReligiousCategory.BUDDHIST].includes(cat);
                     const isBlue = [ReligiousCategory.PSYCHOLOGICAL, ReligiousCategory.NUMEROLOGY, ReligiousCategory.ASTROLOGY].includes(cat);
                     let buttonClass = "relative overflow-hidden p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 group ";
                     if (isReligious) {
                         if (isSelected) { buttonClass += "bg-emerald-900/80 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-emerald-50 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200" : "bg-emerald-900/20 border-emerald-500/40 hover:bg-emerald-900/40 hover:border-emerald-400/60"; }
                     } else if (isBlue) {
                         if (isSelected) { buttonClass += "bg-blue-900/80 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-sky-50 border-sky-100 hover:bg-sky-100 hover:border-sky-200" : "bg-blue-900/20 border-blue-500/40 hover:bg-blue-900/40 hover:border-blue-400/60"; }
                     } else {
                         if (isSelected) { buttonClass += "bg-fuchsia-900/60 border-fuchsia-400 shadow-[0_0_25px_rgba(192,38,211,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-fuchsia-50 border-fuchsia-100 shadow hover:border-fuchsia-200 hover:bg-fuchsia-100" : "bg-slate-800/40 border-white/5 hover:bg-slate-800 hover:border-white/20"; }
                     }
                     let textClass = "";
                     if (isReligious) { textClass = isSelected ? 'text-emerald-100' : (isLight ? 'text-emerald-700' : 'text-emerald-400'); } else if (isBlue) { textClass = isSelected ? 'text-blue-100' : (isLight ? 'text-sky-700' : 'text-blue-400'); } else { textClass = isSelected ? 'text-white' : (isLight ? 'text-fuchsia-900' : 'text-slate-500'); }
                     return (
                         <button key={cat} onClick={() => toggleCategory(cat)} className={buttonClass}>
                             {isSelected && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>}
                             <span 
                                 className={`text-3xl filter drop-shadow-lg transition-transform group-hover:scale-110 ${isReligious || isBlue ? 'grayscale-0' : (isSelected ? 'grayscale-0' : 'grayscale opacity-70')}`}
                                 style={{ filter: isReligious ? 'hue-rotate(240deg) saturate(1.5)' : 'none' }} 
                             >
                                {CATEGORY_ICONS[cat]}
                             </span>
                             <span className={`${cat === ReligiousCategory.PSYCHOLOGICAL ? 'text-[10px]' : 'text-xs'} font-bold uppercase tracking-wider ${textClass}`}>{t.categories[cat]}</span>
                         </button>
                     );
                 })}
             </div>

             {/* 3 NEUE BUTTONS - Kosmische DNA, Mond-Sync, Speichern */}
             <div className="flex justify-center gap-2 mb-6">
                 <div className="relative group">
                     <button className={`h-10 px-3 rounded-lg border text-center transition-all flex items-center gap-1.5 ${isLight ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                         <span className="material-icons text-base">fingerprint</span>
                         <span className={`text-[8px] font-bold uppercase leading-tight ${isLight ? 'text-indigo-700' : 'text-slate-400'}`}>Kosmische<br/>DNA</span>
                     </button>
                     <button className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${isLight ? 'bg-indigo-200 text-indigo-700' : 'bg-white/20 text-white'}`}>i</button>
                 </div>
                 <div className="relative group">
                     <button className={`h-10 px-3 rounded-lg border text-center transition-all flex items-center gap-1.5 ${isLight ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                         <span className="material-icons text-base">nightlight</span>
                         <span className={`text-[8px] font-bold uppercase leading-tight ${isLight ? 'text-purple-700' : 'text-slate-400'}`}>Mond-<br/>Sync</span>
                     </button>
                     <button className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${isLight ? 'bg-purple-200 text-purple-700' : 'bg-white/20 text-white'}`}>i</button>
                 </div>
                 <div className="relative group">
                     <button onClick={handleSaveCategories} className={`h-10 px-3 rounded-lg border text-center transition-all flex items-center gap-1.5 ${isLight ? 'bg-pink-50 border-pink-200 hover:bg-pink-100' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                         <span className="material-icons text-base">bookmark</span>
                         <span className={`text-[8px] font-bold uppercase leading-tight ${isLight ? 'text-pink-700' : 'text-slate-400'}`}>Speichern</span>
                     </button>
                 </div>
             </div>

             {selectedCategories.length > 0 && (
                 <div className="mb-8">
                     <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span className={`w-8 h-[1px] ${isLight ? 'bg-indigo-200' : 'bg-slate-600'}`}></span> {t.ui.refine_sources}
                     </h3>
                     <div className="grid grid-cols-2 gap-2">
                         {getAvailableSources().map(src => {
                             const active = selectedSources.includes(src);
                             return (
                                 <button key={src} onClick={() => toggleSource(src)} className={`h-12 px-3 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${active ? 'bg-indigo-600/90 backdrop-blur-md border-indigo-400/60 text-white shadow-lg shadow-indigo-500/30' : (isLight ? 'bg-white/70 backdrop-blur-md border-slate-200/60 text-slate-600 hover:bg-indigo-50/80 hover:border-indigo-200/60' : 'bg-white/5 backdrop-blur-md border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20')}`}>
                                     <div className="flex flex-col min-w-0">
                                         <span className="text-[11px] font-bold leading-tight block truncate">{t.sources[src]}</span>
                                         <span className={`text-[9px] uppercase font-bold tracking-wide block leading-tight mt-0.5 truncate ${active ? 'text-indigo-200' : 'text-slate-500'}`}>{t.source_subtitles[src]}</span>
                                     </div>
                                     <div onClick={(e) => { e.stopPropagation(); handleInfoClick(src); }} className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center ml-1 z-20 active:scale-95 transition-all ${active ? 'bg-white/20 hover:bg-white/40 text-white' : 'bg-black/10 hover:bg-black/20 text-slate-400'}`}>
                                         <span className="text-[10px] font-serif italic font-bold">i</span>
                                     </div>
                                 </button>
                             );
                         })}
                     </div>
                 </div>
             )}
             
             <div className={`${appBgInput} rounded-3xl p-1 mb-4 relative group border transition-all`}>
                  <textarea value={dreamInput} onChange={(e) => setDreamInput(e.target.value)} placeholder={t.ui.placeholder} className={`w-full h-40 bg-transparent p-6 text-lg resize-none outline-none font-serif leading-relaxed ${isLight ? 'text-indigo-950 placeholder-indigo-300' : 'text-white placeholder-slate-600'}`} />
                  <div className="flex justify-between items-center px-4 pb-4">
                      <div className="flex gap-2">
                          <button onClick={isListening ? stopDictation : startDictation} className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : (isLight ? 'bg-indigo-50 text-indigo-400 hover:bg-indigo-100' : 'bg-white/5 text-slate-400 hover:text-white')}`}>
                              <span className="material-icons">{isListening ? 'stop' : 'mic_none'}</span>
                          </button>
                          {!isListening && !currentAudioData && (
                              <span className={`text-[10px] font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>+5 {language === 'de' ? 'Münzen' : language === 'tr' ? 'Jeton' : language === 'ar' ? 'عملات' : language === 'es' ? 'Monedas' : language === 'fr' ? 'Pièces' : language === 'pt' ? 'Moedas' : language === 'ru' ? 'Монет' : 'Coins'}</span>
                          )}
                      </div>
                      <div className={`text-xs font-mono ${isLight ? 'text-indigo-300' : 'text-slate-600'}`}>{dreamInput.length} chars {currentAudioData && '🎤'}</div>
                  </div>
             </div>

             {currentAudioData && (
                 <div className={`mb-4 space-y-2`}>
                     {/* Audio Recorded Indicator */}
                     <div className={`p-3 rounded-xl border ${isLight ? 'bg-purple-50 border-purple-300' : 'bg-purple-900/20 border-purple-500/30'}`}>
                         <div className="flex items-center gap-2">
                             <span className="text-2xl">🎤</span>
                             <div className="flex-1">
                                 <div className={`text-sm font-bold ${isLight ? 'text-purple-900' : 'text-purple-300'}`}>Audio aufgenommen</div>
                                 <div className={`text-xs ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
                                     {(currentAudioData.length / 1024).toFixed(1)} KB • Wird mit Traum gespeichert
                                 </div>
                             </div>
                             <button onClick={() => setCurrentAudioData(null)} className={`px-3 py-1 rounded-lg text-xs ${isLight ? 'bg-purple-200 text-purple-900 hover:bg-purple-300' : 'bg-purple-800/50 text-purple-300 hover:bg-purple-800'}`}>
                                 Entfernen
                             </button>
                         </div>
                     </div>

                     {/* Coin Earning Prompt */}
                     <div className={`p-4 rounded-xl border bg-gradient-to-r ${isLight ? 'from-amber-50 to-yellow-50 border-amber-300' : 'from-amber-900/20 to-yellow-900/20 border-amber-500/30'}`}>
                         <div className="flex items-center gap-3">
                             <span className="text-3xl animate-bounce">💰</span>
                             <div className="flex-1">
                                 <div className={`text-sm font-bold ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>{t.ui.audio_coin_prompt}</div>
                                 <div className={`text-xs ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                                     {t.ui.audio_coin_desc}
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             <div className="flex flex-col gap-3 mb-6">
                 <button onClick={() => handleAnalyze()} disabled={loading || !dreamInput} className={`relative w-3/5 mx-auto py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all block mb-2 ${loading || !dreamInput ? (isLight ? 'bg-slate-200/60 text-slate-400' : 'bg-slate-800/60 text-slate-600 cursor-not-allowed') : noCredits ? 'bg-slate-800/60 backdrop-blur-md border border-slate-600/40 text-slate-400' : (isLight ? 'bg-gradient-to-r from-indigo-600/90 to-fuchsia-600/90 backdrop-blur-md text-white shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-fuchsia-500/60 hover:scale-[1.03]' : 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-violet-500 backdrop-blur-md text-white shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-fuchsia-500/60 hover:scale-[1.03]')}`}>
                     {loading ? (<span className="flex items-center justify-center gap-3">{t.processing.title}</span>) : noCredits ? (<span className="flex items-center justify-center gap-2"><span className="material-icons">lock</span> {t.ui.interpret} (0 Credits)</span>) : (<span className="flex items-center justify-center gap-2"><span className="material-icons">auto_awesome</span> {t.ui.interpret}</span>)}
                 </button>

                 <button 
                    onClick={() => setView(View.DREAM_MAP)} 
                    className={`relative w-full py-3 rounded-xl overflow-hidden border shadow-lg group transition-all ${isLight ? 'bg-gradient-to-r from-indigo-50 to-white border-indigo-200 shadow-indigo-100' : 'border-indigo-400/30 shadow-[0_0_20px_rgba(79,70,229,0.3)]'}`}
                 >
                     {!isLight && <div className="absolute inset-0 bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e]"></div>}
                     <div className="absolute inset-0 overflow-hidden">
                         <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>
                         <div className="absolute top-3/4 left-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
                         <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-cyan-300 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                         <div className="absolute bottom-1/4 right-10 w-1.5 h-1.5 bg-fuchsia-300 rounded-full animate-pulse" style={{ animationDuration: '1.5s' }}></div>
                         <div className="absolute top-10 right-20 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
                         <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] ${isLight ? 'opacity-20' : 'opacity-40'} animate-pulse`}></div>
                     </div>
                     <span className={`relative z-10 flex items-center justify-center gap-2 font-bold text-xs tracking-wider uppercase group-hover:text-fuchsia-500 ${isLight ? 'text-indigo-600' : 'text-cyan-200 group-hover:text-white'}`}>
                         <span className="material-icons text-lg text-yellow-300">public</span> {t.ui.map_btn}
                     </span>
                 </button>
                 
                 <button onClick={() => {
                    setShowCalendar(true);
                 }} className={`w-3/5 mx-auto py-3 border rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg ${isLight ? 'bg-white/70 backdrop-blur-md border-indigo-200/40 hover:border-fuchsia-300/60 shadow-indigo-100/50' : 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-fuchsia-500/30'}`}>
                     <span className={`material-icons group-hover:scale-110 transition-transform text-2xl ${isLight ? 'text-fuchsia-600' : 'text-fuchsia-400'}`}>calendar_month</span>
                     <span className={`text-sm font-bold ${isLight ? 'text-indigo-900 group-hover:text-fuchsia-700' : 'text-slate-300 group-hover:text-white'}`}>{t.ui.calendar_btn}</span>
                 </button>
                 
                 {showSavedMessage && (tier === SubscriptionTier.PRO || tier === SubscriptionTier.SMART) && (
                      <button onClick={() => handleGenerateVideo(dreamInput)} className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-amber-500/30 ">
                         <span className="material-icons">movie_filter</span> {t.ui.generate_video}
                      </button>
                 )}
             </div>

             {showSavedMessage && (
                 <div className="bg-green-900/80 border border-green-500/50 text-green-200 p-4 rounded-xl text-center mb-6  slide-in-from-top-2 shadow-lg">
                     <span className="material-icons text-xl align-middle mr-2">verified</span>
                     <span className="text-lg font-bold font-mystic">{t.ui.saved_msg}</span>
                 </div>
             )}

             <div className="flex gap-3 mb-3 h-16">
                 <button onClick={() => setShowCoinShop(true)} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${isLight ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'}`}>
                     <span className="material-icons text-amber-500">storefront</span> {t.shop.title}
                 </button>
                 
                 <button onClick={() => setShowSubModal(true)} className={`flex-1 border rounded-xl transition-all flex items-center justify-center gap-2 group ${isLight ? 'bg-gradient-to-r from-amber-100 to-yellow-50 border-yellow-200 hover:border-yellow-300' : 'bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border-amber-500/20 hover:from-amber-900/60 hover:to-yellow-900/60 hover:border-amber-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]'}`}>
                     <span className={`material-icons group-hover:scale-110 transition-transform text-2xl ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>diamond</span>
                     <div className="flex flex-col items-start">
                         <span className={`text-sm font-bold ${isLight ? 'text-amber-800' : 'text-amber-200 group-hover:text-white'}`}>{t.ui.premium_btn}</span>
                         <span className={`text-sm font-bold uppercase tracking-wide ${isLight ? 'text-amber-600/60' : 'text-amber-400/60'}`}>{t.ui.premium_desc}</span>
                     </div>
                 </button>
             </div>
             
             <button onClick={() => setShowOnboarding(true)} className={`w-full py-3 border rounded-xl flex items-center justify-center gap-2 group transition-all ${isLight ? 'bg-white/70 backdrop-blur-md border-indigo-200/40 hover:border-violet-300/60 hover:shadow-lg hover:shadow-indigo-100/50' : 'bg-white/5 backdrop-blur-md hover:bg-white/10 border-white/10 hover:border-violet-500/30'}`}>
                 <span className={`material-icons transition-colors ${isLight ? 'text-violet-500' : 'text-violet-400 group-hover:text-violet-300'}`}>assignment_ind</span>
                 <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-indigo-900 group-hover:text-violet-700' : 'text-slate-400 group-hover:text-violet-200'}`}>{t.ui.customer_file_btn}</span>
             </button>
        </div>
        );
    };

    return (
        <ErrorBoundary>
        <div dir={language === Language.AR ? 'rtl' : 'ltr'} style={{ backgroundColor: isLight ? '#ffffff' : '#0f0b1a' }} className={`min-h-screen font-sans relative overflow-x-hidden transition-colors duration-700 ${isLight ? 'text-slate-800 selection:bg-fuchsia-500/30' : 'text-slate-200 selection:bg-fuchsia-500/30'}`}>
            <StarryBackground themeMode={themeMode} designTheme={designTheme} />
            
            {loading && <ProcessingOverlay isLight={isLight} steps={processingSteps} categories={selectedCategories} sources={selectedSources} t={t} />}
            {isVideoLoading && <VideoLoadingOverlay t={t} />}
            {isAdPlaying && <AdOverlay t={t} duration={adDuration} />}
            {showSubModal && <SubscriptionModal onClose={() => setShowSubModal(false)} t={t} isLight={isLight} userProfile={userProfile} onUpdateSubscription={handleUpdateSubscription} />}
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
            {showVideoModal && <VideoResultModal onClose={() => setShowVideoModal(false)} url={videoUrl} t={t} isLight={isLight} />}
            {showImageModal && <ImageResultModal onClose={() => setShowImageModal(false)} url={imageUrl} t={t} isLight={isLight} />}
            {showStyleSelection && <StyleSelectionModal onSelect={continueWithImageGeneration} t={t} isLight={isLight} />}

                {view === View.DREAM_MAP && <DreamMap language={language} themeMode={themeMode} onClose={() => setView(View.HOME)} />}
                {showOnboarding && <Onboarding language={language} initialData={userProfile} onComplete={handleSaveProfile} onClose={() => setShowOnboarding(false)} themeMode={themeMode} />}
                {showCalendar && <DreamCalendar dreams={dreams} language={language} onClose={() => setShowCalendar(false)} onGenerateVideo={handleGenerateVideoWithStyle} onGenerateImage={handleGenerateImageWithStyle} />}

            <main className="relative z-10 p-4 pt-6 pb-24">
                {view === View.HOME && renderHome()}
                    {view === View.DREAM_HUB && <DreamHub dreams={dreams} language={language} themeMode={themeMode} />}
                    {view === View.PROFILE && <Profile language={language} dreams={dreams} userProfile={userProfile} onUpdateProfile={handleSaveProfile} onUpdateDream={handleUpdateDream} onGenerateVideo={handleGenerateVideo} onGenerateNarrationVideo={handleGenerateNarrationVideo} onGenerateUserVoiceVideo={handleGenerateUserVoiceVideo} onPlayVideo={(url) => { setVideoUrl(url); setShowVideoModal(true); }} fontSize={FontSize.MEDIUM} themeMode={themeMode} />}
            </main>

            {view === View.LIVE_SESSION ? (
                    <LiveSession
                        key="live-session"
                        onClose={() => setView(View.HOME)}
                        onSaveSession={(text, audioData) => { setDreamInput(text); if (audioData) { setCurrentAudioData(audioData); setAudioIsFromLiveChat(true); } setView(View.HOME); setTimeout(() => handleAnalyze(text), 200); }}
                        language={language}
                        voiceName={userProfile?.preferredVoice || 'Puck'}
                        selectedCategories={selectedCategories}
                        selectedSources={selectedSources}
                    />
            ) : null}

            <nav className={`fixed bottom-0 left-0 right-0 border-t pb-safe z-40 transition-colors duration-500 ${isLight ? 'bg-white/80 border-white backdrop-blur-xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]' : 'bg-[#05020a]/80 border-white/10 backdrop-blur-lg'}`}>
                <div className="flex justify-around items-center p-2">
                    <NavBtn icon="home" label={t.ui.home_label} active={view === View.HOME} onClick={() => setView(View.HOME)} isLight={isLight} />
                    <button onClick={() => setShowSettings(true)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${showSettings ? (isLight ? 'text-fuchsia-600' : 'text-fuchsia-500') : (isLight ? 'text-slate-400 hover:text-indigo-900' : 'text-slate-500 hover:text-slate-300')}`}>
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
                    {/* SWAPPED DREAM HUB WITH DREAM MAP (WHO HAD SAME DREAM) */}
                    <NavBtn icon="public" label={t.ui.map_label} active={view === View.DREAM_MAP} onClick={() => setView(View.DREAM_MAP)} isLight={isLight} />
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
        </ErrorBoundary>
    );
};

// --- Extracted Components ---

const CoinShopModal = ({ onClose, t, isLight, onPurchase, onEarnFree }: { onClose: () => void, t: any, isLight: boolean, onPurchase: (amt: number) => void, onEarnFree: () => void }) => (
    <div className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4  zoom-in-95">
        <div className={`w-full max-w-md ${isLight ? 'bg-white/95 backdrop-blur-md' : 'bg-[#0f0b1a]/95 backdrop-blur-md'} border ${isLight ? 'border-amber-500/40' : 'border-amber-500/30'} rounded-3xl overflow-hidden shadow-2xl flex flex-col relative max-h-[90vh]`}>
            <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-slate-400 hover:text-white">
                <span className="material-icons text-base">close</span>
            </button>
            
            <div className="h-24 bg-gradient-to-r from-amber-600 to-orange-500 flex items-center justify-center shrink-0 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                 <div className="text-center relative z-10">
                     <h2 className="text-2xl font-mystic font-bold text-white shadow-black drop-shadow-md flex items-center justify-center gap-2">
                        <span className="material-icons">storefront</span> {t.shop.title}
                     </h2>
                     <p className="text-amber-100 text-xs font-bold uppercase tracking-wider opacity-90">{t.shop.desc}</p>
                 </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                {/* DYNAMISCHE COIN PAKETE */}
                {Object.values(COIN_PACKAGES).map((pkg, index) => {
                    const isBestseller = pkg.badge === 'Beliebt';
                    const isBestValue = pkg.badge === 'Bester Wert';
                    const isMegaPlus = pkg.coins === 7000; // WOW-Effekt für 7000er Paket
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
                            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] relative ${
                                isMegaPlus
                                    ? 'border-2 border-pink-500 bg-gradient-to-r from-pink-900/20 to-purple-900/20 shadow-xl shadow-pink-500/20'
                                    : isBestseller
                                        ? 'border-2 border-amber-500 bg-amber-900/10 shadow-lg shadow-amber-500/10'
                                        : isBestValue
                                            ? `${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-900/20 border-emerald-500/30'}`
                                            : `${isLight ? 'bg-white/60 backdrop-blur-md border-slate-200/60 hover:bg-white/80' : 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10'}`
                            }`}
                        >
                            {isMegaPlus && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-[10px] font-bold uppercase px-4 py-1 rounded-full shadow-lg shadow-pink-500/50 animate-pulse">
                                    {t.shop.wow_badge}
                                </div>
                            )}
                            {isBestseller && !isMegaPlus && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-md">
                                    {pkg.badge}
                                </div>
                            )}
                            {isBestValue && !isMegaPlus && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg">
                                    {pkg.badge}
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full ${colors[index].bg} flex items-center justify-center text-white shadow-lg ${isBestseller ? 'shadow-amber-500/40' : ''}`}>
                                    <span className={`${isBestseller ? 'text-2xl' : 'text-lg'}`}>{emojis[index]}</span>
                                </div>
                                <div>
                                    <h3 className={`font-bold ${isBestseller || isMegaPlus ? 'text-lg' : ''} ${
                                        isLight
                                            ? (isMegaPlus ? 'text-pink-900' : isBestseller ? colors[index].text : isBestValue ? 'text-emerald-900' : 'text-slate-800')
                                            : (isMegaPlus ? 'text-pink-100' : isBestValue ? 'text-emerald-100' : 'text-white')
                                    }`}>
                                        {pkg.coins} {t.shop.coins_label}
                                    </h3>
                                    <p className={`text-xs font-bold ${
                                        isMegaPlus ? 'text-pink-500 uppercase' : isBestseller ? 'text-amber-500 uppercase' : isBestValue ? 'text-emerald-500' : 'text-slate-400'
                                    }`}>
                                        {pkg.id.split('_')[0].charAt(0).toUpperCase() + pkg.id.split('_')[0].slice(1)}
                                    </p>
                                    {isMegaPlus && (
                                        <p className="text-[10px] font-bold text-pink-400 mt-1">
                                            ✨ {pricePerCoin}€ {t.shop.per_coin}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button className={`px-4 py-2 rounded-lg font-bold text-sm shadow-lg ${
                                isMegaPlus
                                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-5 py-2.5 shadow-pink-500/50'
                                    : isBestseller
                                        ? 'bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5'
                                        : isBestValue
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                            : isLight
                                                ? 'bg-slate-200 text-slate-700'
                                                : 'bg-slate-700 text-white'
                            }`}>
                                €{pkg.price.toFixed(2)}
                            </button>
                        </div>
                    );
                })}

                <div className="pt-4 mt-2 border-t border-dashed border-white/10 text-center">
                    <button onClick={onEarnFree} className="text-xs text-slate-400 underline hover:text-white transition-colors">
                        {t.shop.free_link}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, t, isLight, apiKeyInput, setApiKeyInput, handleAddApiKey, handleRemoveApiKey, userProfile, themeMode, handleThemeUpdate, designTheme, handleExport, handleImport, language, onVoiceChange, currentVoiceId }) => (
    <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
            <div className={`w-full md:max-w-lg ${isLight ? 'bg-white/95 backdrop-blur-md' : 'bg-[#0f0b1a]/95 backdrop-blur-md'} border-t md:border ${isLight ? 'border-slate-200/40' : 'border-white/10'} rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl max-h-[85vh]`}>
            <div className={`p-6 border-b ${isLight ? 'border-slate-100' : 'border-white/10'} flex justify-between items-center shrink-0`}>
                <h2 className={`text-xl font-mystic font-bold ${isLight ? 'text-indigo-950' : 'text-white'}`}>{t.ui.settings}</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-transparent hover:bg-black/5 flex items-center justify-center">
                    <span className={`material-icons ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>close</span>
                </button>
            </div>
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
                
                {/* BACKUP & DATA VAULT */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-green-50 border-green-200' : 'bg-green-900/10 border-green-500/30'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${isLight ? 'text-green-800' : 'text-green-400'}`}>
                        <span className="material-icons text-sm">cloud_sync</span> {t.ui.backup_title}
                    </h3>
                    <p className={`text-[10px] mb-4 ${isLight ? 'text-green-700' : 'text-green-200/60'}`}>{t.ui.backup_desc}</p>
                    
                    <div className="flex gap-2">
                        <button onClick={handleExport} className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${isLight ? 'bg-white border-green-200 text-green-700 hover:bg-green-50' : 'bg-white/5 border-green-500/30 text-green-300 hover:bg-green-900/20'}`}>
                            <span className="material-icons text-sm">download</span> {t.ui.export_btn}
                        </button>
                        <label className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${isLight ? 'bg-green-600 border-green-500 text-white hover:bg-green-700' : 'bg-green-600 border-green-500 text-white hover:bg-green-700'}`}>
                            <span className="material-icons text-sm">upload_file</span> {t.ui.import_btn}
                            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* API KEY MANAGER FOR SMART TIER */}
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-900/10 border-cyan-500/30'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>
                        <span className="material-icons text-sm">vpn_key</span> {t.ui.api_manager}
                    </h3>
                    <p className={`text-[10px] mb-4 ${isLight ? 'text-cyan-700' : 'text-cyan-200/60'}`}>{t.ui.api_desc}</p>
                    
                    <div className="flex gap-2 mb-3">
                        <input 
                            type="text" 
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="sk-..."
                            className={`flex-1 rounded-lg px-3 py-2 text-xs border outline-none ${isLight ? 'bg-white border-cyan-200 text-slate-800' : 'bg-black/30 border-cyan-500/30 text-white'}`}
                        />
                        <button 
                            onClick={handleAddApiKey}
                            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg whitespace-nowrap"
                        >
                            {t.ui.add_key}
                        </button>
                    </div>
                    
                    <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                        {(userProfile?.customApiKeys || []).length === 0 ? (
                            <p className="text-[10px] text-center italic opacity-50">{t.ui.no_keys}</p>
                        ) : (
                            (userProfile?.customApiKeys || []).map((key, i) => (
                                <div key={i} className={`flex justify-between items-center px-2 py-1.5 rounded ${isLight ? 'bg-white/50' : 'bg-white/5'}`}>
                                    <span className="text-[10px] font-mono opacity-70">...{key.slice(-5)}</span>
                                    <button onClick={() => handleRemoveApiKey(key)} className="text-red-400 hover:text-red-300">
                                        <span className="material-icons text-sm">delete</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Mode Toggle */}
                <div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.ui.mode}</h3>
                    <div className={`flex rounded-xl p-1 border ${isLight ? 'bg-white/60 backdrop-blur-md border-slate-200/60' : 'bg-white/5 backdrop-blur-md border-white/10'}`}>
                            <button 
                            onClick={() => handleThemeUpdate(ThemeMode.DARK, null)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${themeMode === ThemeMode.DARK ? 'bg-slate-800 text-white shadow' : (isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white')}`}
                            >
                                <span className="material-icons text-sm">dark_mode</span> {t.ui.dark}
                            </button>
                            <button 
                            onClick={() => handleThemeUpdate(ThemeMode.LIGHT, null)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${themeMode === ThemeMode.LIGHT ? 'bg-white text-indigo-900 shadow' : (isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white')}`}
                            >
                                <span className="material-icons text-sm">light_mode</span> {t.ui.light}
                            </button>
                    </div>
                </div>

                {/* Oracle Voice */}
                <div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span className="material-icons text-sm">record_voice_over</span>
                        {language === 'de' ? 'Orakel-Stimme' : language === 'tr' ? 'Kahin Sesi' : language === 'ar' ? 'Sawt Al-Kahin' : 'Oracle Voice'}
                    </h3>
                    <VoiceSelector
                        mode="settings"
                        language={language}
                        currentVoiceId={currentVoiceId}
                        onSelect={onVoiceChange}
                    />
                </div>

                {/* Color Theme */}
                <div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.ui.style}</h3>
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
                                <button key={dt} onClick={() => handleThemeUpdate(null, dt)} className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${activeClass}`}>
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

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, t, isLight, userProfile, onUpdateSubscription }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [showSmartInfo, setShowSmartInfo] = useState(false);

    return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4  duration-300">
        <div className={`w-full max-w-md ${isLight ? 'bg-white/95 backdrop-blur-md' : 'bg-[#0f0b1a]/95 backdrop-blur-md'} border ${isLight ? 'border-slate-200/40' : 'border-white/10'} rounded-3xl overflow-hidden shadow-2xl flex flex-col relative max-h-[90vh]`}>
            <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 text-white">
                <span className="material-icons text-base">close</span>
            </button>
            <div className="h-24 bg-gradient-to-br from-amber-600 to-yellow-500 relative flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                <h2 className="text-2xl font-mystic font-bold text-white shadow-black drop-shadow-md">{t.sub.title}</h2>
            </div>
            
            {/* Billing Toggle */}
            <div className={`flex justify-center p-4 ${isLight ? 'bg-white/40 backdrop-blur-md' : 'bg-white/5 backdrop-blur-md'}`}>
                <div className={`p-1 rounded-full flex ${isLight ? 'bg-white/70 backdrop-blur-md border border-slate-200/40' : 'bg-black/40 backdrop-blur-md border border-white/10'}`}>
                    <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${billingCycle === 'monthly' ? (isLight ? 'bg-white text-indigo-900 shadow' : 'bg-slate-700 text-white shadow') : (isLight ? 'text-slate-500' : 'text-slate-400')}`}>
                        {t.sub.billing_monthly}
                    </button>
                    <button onClick={() => setBillingCycle('yearly')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${billingCycle === 'yearly' ? (isLight ? 'bg-white text-indigo-900 shadow' : 'bg-slate-700 text-white shadow') : (isLight ? 'text-slate-500' : 'text-slate-400')}`}>
                        {t.sub.billing_yearly}
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

                            <button onClick={() => setShowSmartInfo(false)} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold text-sm shadow-lg">Ok</button>
                        </div>
                    </div>
                )}

                {[SubscriptionTier.FREE, SubscriptionTier.PLUS, SubscriptionTier.PRO, SubscriptionTier.DELUXE, SubscriptionTier.VIP].map(tier => {
                    const isCurrent = userProfile?.subscriptionTier === tier;
                    let title = "", features: string[] = [], price = "";
                    let borderColor = "";
                    let buttonText = isCurrent ? t.sub.current : t.sub.upgrade;

                    if (tier === SubscriptionTier.FREE) {
                        title = "Bronze (FREE)";
                        features = ["2 Bilder/Tag", "Werbung", "Community Support"];
                        price = "0 €";
                        borderColor = "border-slate-500/20";
                    }
                    if (tier === SubscriptionTier.PLUS) {
                        title = "Silber";
                        features = ["25 Bilder/Monat", "Keine Werbung", "5% Rabatt", "1x Live-Chat/Woche"];
                        price = billingCycle === 'yearly' ? '54,89 € / Jahr' : '4,99 € / Monat';
                        borderColor = "border-slate-300";
                    }
                    if (tier === SubscriptionTier.PRO) {
                        title = "Gold";
                        features = ["Unbegrenzte Bilder", "400 Münzen/Monat", "10% Rabatt", "5 Videos/Monat", "Unbegrenzt Live-Chat"];
                        price = billingCycle === 'yearly' ? '107,89 € / Jahr' : '9,99 € / Monat';
                        borderColor = "border-amber-400";
                    }
                    if (tier === SubscriptionTier.DELUXE) {
                        title = "Deluxe";
                        features = ["Alles in Gold", "1.200 Münzen/Monat", "15% Rabatt", "20 Videos/Monat", "Prioritäts-Support"];
                        price = billingCycle === 'yearly' ? '215,89 € / Jahr' : '19,99 € / Monat';
                        borderColor = "border-purple-400";
                    }
                    if (tier === SubscriptionTier.VIP) {
                        title = "VIP";
                        features = ["Alles in Deluxe", "5.000 Münzen/Monat", "15% Rabatt", "Unbegrenzte Videos", "Persönlicher Support", "Beta-Zugang"];
                        price = billingCycle === 'yearly' ? '539,89 € / Jahr' : '49,99 € / Monat';
                        borderColor = "border-pink-500";
                    }

                    // Calculate if badge is present
                    const hasBadge = (billingCycle === 'yearly' && (tier === SubscriptionTier.PLUS || tier === SubscriptionTier.PRO)) || tier === SubscriptionTier.SMART;

                    return (
                        <div key={tier} onClick={() => onUpdateSubscription(tier)} className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative group ${isCurrent ? 'bg-green-900/20 border-green-500/50' : (isLight ? `bg-white/60 backdrop-blur-md hover:bg-white/80 ${borderColor}` : `bg-white/5 backdrop-blur-md hover:bg-white/10 ${borderColor}`)}`}>
                            {billingCycle === 'yearly' && (tier === SubscriptionTier.PLUS || tier === SubscriptionTier.PRO) && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold shadow-sm">
                                    {t.sub.yearly_discount}
                                </div>
                            )}
                            {tier === SubscriptionTier.SMART && (
                                <div className="absolute top-0 right-0 bg-fuchsia-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold shadow-sm animate-pulse z-10">
                                    {t.sub.smart_discount}
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>{title}</h3>
                                        {isCurrent && <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded uppercase">{t.sub.current}</span>}
                                        {tier === SubscriptionTier.SMART && <span className="px-2 py-0.5 bg-cyan-500 text-white text-[9px] font-bold rounded uppercase">BYOK</span>}
                                    </div>
                                </div>
                                <div className={`text-right ${hasBadge ? 'mt-6' : ''}`}>
                                    <span className={`block font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{price}</span>
                                    {!isCurrent && <span className={`text-[10px] uppercase font-bold ${tier === SubscriptionTier.PRO && billingCycle === 'monthly' ? 'text-green-400 animate-pulse' : 'text-amber-500'}`}>{buttonText}</span>}
                                </div>
                            </div>
                            
                            {tier === SubscriptionTier.SMART && (
                                <div 
                                    onClick={(e) => { e.stopPropagation(); setShowSmartInfo(true); }}
                                    className="absolute bottom-4 right-4 w-5 h-5 rounded-full border border-cyan-400 text-cyan-400 flex items-center justify-center hover:bg-cyan-400 hover:text-white transition-colors z-10"
                                >
                                    <span className="text-xs font-serif font-bold italic">i</span>
                                </div>
                            )}

                            <ul className="mt-1 space-y-1.5">
                                {features.map((feat, i) => (
                                    <li key={i} className={`text-xs flex items-start gap-2 leading-tight ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                        <span className={`material-icons text-[10px] mt-0.5 ${tier === SubscriptionTier.SMART ? 'text-cyan-400' : (isLight ? 'text-indigo-500' : 'text-fuchsia-400')}`}>check</span>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
    );
};

const EarnCoinsModal = ({ onClose, t, isLight, onWatch }: { onClose: () => void, t: any, isLight: boolean, onWatch: (d: number, r: number) => void }) => (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4  zoom-in-95">
        <div className={`w-full max-w-md ${isLight ? 'bg-white' : 'bg-[#150b25]'} border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative`}>
                <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center">
                <span className="material-icons text-base">close</span>
            </button>
            <div className="h-24 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                <h2 className="text-2xl font-mystic font-bold text-white shadow-black drop-shadow-md flex items-center gap-2">
                    <span className="material-icons">monetization_on</span> {t.earn.title}
                </h2>
            </div>
            <div className="p-6 space-y-4">
                <p className={`text-sm text-center mb-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{t.earn.desc}</p>
                
                {/* Short Clip */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-amber-50 border-amber-100' : 'bg-amber-900/10 border-amber-500/20'}`}>
                    <div>
                        <h4 className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>{t.earn.short_title}</h4>
                        <p className="text-xs text-amber-500">{t.earn.short_desc}</p>
                    </div>
                    <button onClick={() => onWatch(10000, parseInt(t.earn.short_reward))} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs shadow-lg">
                        +{t.earn.short_reward} 🪙 {t.earn.watch_btn}
                    </button>
                </div>

                {/* Long Clip */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-amber-50 border-amber-100' : 'bg-amber-900/10 border-amber-500/20'}`}>
                    <div>
                        <h4 className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>{t.earn.long_title}</h4>
                        <p className="text-xs text-amber-500">{t.earn.long_desc}</p>
                    </div>
                    <button onClick={() => onWatch(3000, parseInt(t.earn.long_reward))} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:to-orange-600 text-white rounded-lg font-bold text-xs shadow-lg">
                        +{t.earn.long_reward} 🪙 {t.earn.watch_btn}
                    </button>
                </div>

                {/* Offerwall (Mock) */}
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/10 border-blue-500/20'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h4 className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>{t.earn.offer_title}</h4>
                            <p className="text-xs text-blue-400">{t.earn.offer_desc}</p>
                        </div>
                            <span className="text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded">+{t.earn.offer_reward} 🪙</span>
                    </div>
                    <p className={`text-[10px] mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.earn.offer_info}</p>
                    <div className="space-y-2">
                        <div className={`flex justify-between items-center p-2 rounded border ${isLight ? 'bg-white border-blue-100' : 'bg-black/20 border-white/5'}`}>
                            <span className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{t.earn.survey_task}</span>
                            <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase">{t.earn.start_btn}</button>
                        </div>
                            <div className={`flex justify-between items-center p-2 rounded border ${isLight ? 'bg-white border-blue-100' : 'bg-black/20 border-white/5'}`}>
                            <span className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{t.earn.app_task}</span>
                            <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase">{t.earn.start_btn}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ProcessingOverlay = ({ isLight, steps, categories, sources, t }: { isLight: boolean, steps: ProcessingStep[], categories: ReligiousCategory[], sources: ReligiousSource[], t: any }) => (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg flex items-center justify-center p-6  duration-500">
        <div className={`w-full max-w-md ${isLight ? 'bg-white/90 border-indigo-100' : 'bg-[#150b25]/90 border-white/10'} border rounded-3xl p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-violet-500 animate-pulse"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
            <div className="text-center mb-2">
                <h2 className={`text-2xl font-mystic font-bold ${isLight ? 'text-indigo-900' : 'text-white'} animate-pulse`}>{steps[0]?.label || "Processing..."}</h2>
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
                            <p className={`text-sm font-bold ${step.status === 'active' ? (isLight ? 'text-indigo-600' : 'text-white') : step.status === 'skipped' ? 'text-slate-500' : (isLight ? 'text-slate-700' : 'text-slate-300')}`}>
                                {step.label}
                            </p>
                            
                            {/* DISPLAY CATEGORIES IN CONTEXT STEP */}
                            {step.id === 'context' && step.status === 'completed' && (
                                <div className="mt-1  slide-in-from-left-2">
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {categories.map(c => (
                                            <span key={c} className={`text-[9px] px-1.5 py-0.5 rounded border ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                                                {t.categories[c]}
                                            </span>
                                        ))}
                                        {sources.map(s => (
                                            <span key={s} className={`text-[9px] px-1.5 py-0.5 rounded border ${isLight ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700' : 'bg-white/5 border-white/10 text-slate-300'}`}>
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
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 ">
            <div className={`w-full max-w-3xl ${isLight ? 'bg-white' : 'bg-[#0f0518]'} border border-fuchsia-500/30 rounded-3xl overflow-hidden shadow-2xl relative`}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className={`text-xl font-mystic font-bold ${isLight ? 'text-indigo-900' : 'text-white'}`}>{t.ui.video_ready}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center">
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
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 ">
            <div className={`w-full max-w-2xl ${isLight ? 'bg-white' : 'bg-[#0f0518]'} border border-fuchsia-500/30 rounded-3xl overflow-hidden shadow-2xl relative`}>
                <div className="p-6 border-b border-white/10">
                    <h2 className={`text-2xl font-mystic font-bold ${isLight ? 'text-indigo-900' : 'text-white'} text-center`}>
                        {t.ui.choose_image_style || 'Bildstil wählen'}
                    </h2>
                    <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-slate-400'} text-center mt-2`}>
                        {t.ui.choose_style_desc || 'Wähle einen Stil für dein Traumbild'}
                    </p>
                </div>

                <div className="p-6">
                    {/* Style Selection */}
                    <div>
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-3 text-center`}>
                            {t.ui.choose_style || 'Stil wählen'}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'cartoon', label: t.ui.style_cartoon || 'Cartoon', icon: '🎨', desc: 'Pixar-Style' },
                                { key: 'anime', label: t.ui.style_anime || 'Anime', icon: '⚡', desc: 'Ghibli-Style' },
                                { key: 'real', label: t.ui.style_real || 'Real', icon: '📸', desc: 'Fotorealistisch' },
                                { key: 'fantasy', label: t.ui.style_fantasy || 'Fantasy', icon: '✨', desc: 'Magisch' }
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
                                    <div className={`text-xs ${isLight ? 'text-gray-600' : 'text-slate-400'} mt-1`}>
                                        {style.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-between items-center gap-3">
                    <button
                        onClick={() => onSelect('normal', null)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                            isLight
                                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                    >
                        {t.ui.continue_without_image || 'Fortsetzen ohne Bildgenerierung'}
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
                        {t.ui.continue || 'Weiter'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ImageResultModal = ({ onClose, url, t, isLight }: { onClose: () => void, url: string | null, t: any, isLight: boolean }) => (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 ">
            <div className={`w-full max-w-3xl ${isLight ? 'bg-white' : 'bg-[#0f0518]'} border border-fuchsia-500/30 rounded-3xl overflow-hidden shadow-2xl relative`}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className={`text-xl font-mystic font-bold ${isLight ? 'text-indigo-900' : 'text-white'}`}>{t.ui.image_ready || 'Image Ready'}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center">
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <div className="bg-black">
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
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
        <div className="w-full h-full absolute bg-gradient-to-br from-yellow-600 to-orange-600 animate-pulse opacity-20"></div>
        <span className="material-icons text-6xl text-white mb-4 animate-bounce">play_circle_filled</span>
        <h2 className="text-2xl font-bold text-white relative z-10">{t.sub.ad_loading}</h2>
        <div className="w-64 h-2 bg-gray-700 rounded mt-4 overflow-hidden relative z-10">
            <div className="h-full bg-white" style={{animation: `width ${duration}ms linear forwards`, width: '0%'}}></div>
        </div>
    </div>
);

const AudioUploadConfirmModal = ({ onClose, t, isLight }: { onClose: () => void, t: any, isLight: boolean }) => {
    const handleConfirm = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4  zoom-in-95">
            <div className={`w-full max-w-md ${isLight ? 'bg-white' : 'bg-[#1a0b2e]'} border ${isLight ? 'border-purple-200' : 'border-purple-500/30'} rounded-3xl p-8 shadow-2xl`}>
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
    <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${active ? (isLight ? 'text-fuchsia-600' : 'text-white') : (isLight ? 'text-slate-400 hover:text-indigo-900' : 'text-slate-500 hover:text-slate-300')}`}>
        <span className={`material-icons transition-all duration-300 ${active ? 'text-[28px] text-fuchsia-500 drop-shadow-[0_0_8px_rgba(192,38,211,0.6)]' : 'text-2xl'}`}>{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide max-w-[60px] truncate text-center">{label}</span>
        {active && <span className={`absolute -bottom-1 w-5 h-[3px] rounded-full ${isLight ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500' : 'bg-gradient-to-r from-fuchsia-500 to-violet-400'}`}></span>}
    </button>
);

const InfoModal = ({ onClose, data, t, isLight }: { onClose: () => void, data: any, t: any, isLight: boolean }) => {
    if (!data) return null;
    const modalBg = isLight ? 'bg-white/95 backdrop-blur-md border-indigo-100/60' : 'bg-[#0f0b1a]/95 backdrop-blur-md border-fuchsia-500/20';
    const textHead = isLight ? 'text-indigo-900' : 'text-white';
    const textBody = isLight ? 'text-slate-700' : 'text-slate-300';
    const accentBg = isLight ? 'bg-indigo-50' : 'bg-white/5';
    const accentBorder = isLight ? 'border-indigo-200' : 'border-white/10';
    
    return (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-4  zoom-in-95 duration-300" onClick={onClose}>
            <div className={`w-full max-w-lg ${modalBg} border rounded-[2rem] p-0 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`} onClick={e => e.stopPropagation()}>
                <div className="h-32 bg-gradient-to-r from-indigo-900 via-fuchsia-900 to-purple-900 relative flex items-end p-6">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                    <h2 className="text-2xl font-mystic font-bold text-white relative z-10 shadow-black drop-shadow-md">{data.title}</h2>
                    <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-black/30 rounded-full text-white flex items-center justify-center hover:bg-black/50 transition-colors">
                        <span className="material-icons text-base">close</span>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div><p className={`text-lg font-medium leading-relaxed ${textBody}`}>{data.desc}</p></div>
                    {(data.origin || data.bio) && (
                            <div className={`p-4 rounded-2xl border ${accentBg} ${accentBorder}`}>
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

