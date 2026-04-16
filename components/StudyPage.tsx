import React, { useState, useEffect, useRef } from 'react';
import { Language, UserProfile } from '../types';
import { getTheme } from '../theme';
import { supabase } from '../services/supabaseClient';

interface StudyPageProps {
  language: Language;
  onClose: () => void;
  themeMode?: string;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

// ─── Nationalitäten (DE Anzeige) ──────────────────────────────────────────────
const NATIONALITIES_DE = [
  'Deutsch','Österreichisch','Schweizerisch','Amerikanisch','Britisch',
  'Französisch','Spanisch','Italienisch','Portugiesisch','Niederländisch',
  'Belgisch','Schwedisch','Norwegisch','Dänisch','Finnisch','Polnisch',
  'Tschechisch','Ungarisch','Rumänisch','Griechisch','Türkisch','Russisch',
  'Ukrainisch','Weißrussisch','Serbisch','Kroatisch','Slowenisch','Slowakisch',
  'Bulgarisch','Litauisch','Lettisch','Estnisch','Isländisch','Irisch',
  'Schottisch','Walisisch','Japanisch','Chinesisch','Koreanisch','Indisch',
  'Pakistanisch','Bangladeschisch','Indonesisch','Malaysisch','Vietnamesisch',
  'Thailändisch','Philippinisch','Australisch','Neuseeländisch','Kanadisch',
  'Mexikanisch','Brasilianisch','Argentinisch','Kolumbianisch','Chilenisch',
  'Peruanisch','Venezolanisch','Ägyptisch','Marokkanisch','Tunesisch',
  'Algerisch','Nigerianisch','Südafrikanisch','Kenianisch','Ghanaisch',
  'Äthiopisch','Tansanisch','Saudi-Arabisch','Emiratisch','Israelisch',
  'Iranisch','Irakisch','Syrisch','Jordanisch','Libanesisch','Kuwaitisch',
  'Katarisch','Andere',
];

// ─── Übersetzungen ─────────────────────────────────────────────────────────────
type StudyT = {
  header_title: string; header_sub: string; anon_note: string; section_title: string;
  tier1_name: string; tier1_discount: string; tier1_price: string; tier1_bullets: string[];
  tier2_name: string; tier2_discount: string; tier2_price: string; tier2_price_year: string;
  tier2_bullets: string[]; tier2_note: string;
  tier3_name: string; tier3_discount: string; tier3_price: string; tier3_price_year: string;
  tier3_recommended: string; tier3_bullets: string[];
  form_title: string; f_firstname: string; f_lastname: string; f_email: string;
  f_birthyear: string; f_birthtime: string; f_birthtime_hint: string; f_birthtime_tooltip: string;
  f_gender: string; f_location: string; f_nationality: string; gender_options: string[];
  consent_data: string; consent_name: string; consent_face: string;
  verify_send: string; verify_resend: string; verify_placeholder: string;
  verify_checking: string; verify_ok: string; verify_error: string; verify_sent: string;
  submit_btn: string; submit_deep: string; submitting: string;
  success_title: string; success_desc: string;
  error_duplicate: string; error_generic: string; location_loading: string;
  cost_title: string; cost_intro: string;
  cost_items: { feature: string; market: string; model: string; dc: string }[];
  cost_footer: string;
};

const STUDY_TRANSLATIONS: Partial<Record<Language, StudyT>> = {
  [Language.DE]: {
    header_title: 'Wissenschaftliche Studie', header_sub: 'Die größte globale Traumforschungs-Initiative',
    anon_note: 'Jeder Traum in DreamCode fließt automatisch anonym in die Forschung. Mit der offiziellen Teilnahme wirst du namentlich Teil der größten globalen Traumstudie.',
    section_title: 'Je mehr du zur Forschung beiträgst, desto mehr sparst du',
    tier1_name: 'Basis-Teilnahme', tier1_discount: '10 %', tier1_price: 'Kostenlos',
    tier1_bullets: ['Offiziell namentlich in Studie eingetragen','Träume fließen in die Forschung','10 % Rabatt auf alle Coin-Käufe','Kein Selfie nötig'],
    tier2_name: 'Deep Research', tier2_discount: '20 %', tier2_price: '3,50 € / Monat', tier2_price_year: '42 € / Jahr',
    tier2_bullets: ['Alles aus Basis-Teilnahme','Mind. 5 Traumeingaben pro Woche','Alle Features freigeschaltet','Kein Gesichtsfoto nötig','Daten pseudonymisiert & DSGVO-konform'],
    tier2_note: 'Dieser minimale Preis dient ausschließlich zur Deckung unserer Grundkosten (API, Server, Infrastruktur). Wir verdienen nichts daran.',
    tier3_name: 'Deep Research + Selfie', tier3_discount: '30 %', tier3_price: '3,50 € / Monat', tier3_price_year: '42 € / Jahr', tier3_recommended: 'Empfohlen',
    tier3_bullets: ['Alles aus Deep Research','Monatliches Gesichtsfoto für KI-Analyse','Höchster Rabatt — größter Forschungsbeitrag','Pionierforschung: Gesichtszüge & Träume'],
    form_title: 'Registrierung', f_firstname: 'Vorname *', f_lastname: 'Nachname *', f_email: 'E-Mail *',
    f_birthyear: 'Geburtsjahr *', f_birthtime: 'Geburtszeit', f_birthtime_hint: 'Optional — ermöglicht zusätzliche chronobiologische Forschungserkenntnisse',
    f_birthtime_tooltip: 'Die Geburtszeit kann Aufschlüsse über zirkadiane Rhythmen und Schlafmuster geben.',
    f_gender: 'Geschlecht *', f_location: 'Ort', f_nationality: 'Nationalität',
    gender_options: ['Männlich', 'Weiblich', 'Divers', 'Keine Angabe'],
    consent_data: 'Ich stimme der Nutzung meiner Traumdaten für wissenschaftliche Zwecke zu.',
    consent_name: 'Mein Name darf in der Studienpublikation erscheinen.',
    consent_face: 'Ich stimme der monatlichen Nutzung meines Gesichtsfotos für die Traumforschung zu.',
    verify_send: 'Code senden', verify_resend: 'Neu senden', verify_placeholder: '6-stelliger Code',
    verify_checking: 'Prüfe Code…', verify_ok: 'E-Mail bestätigt ✓', verify_error: 'Falscher Code. Erneut versuchen.',
    verify_sent: 'Code gesendet an ', submit_btn: 'An Studie teilnehmen', submit_deep: 'Deep Research starten',
    submitting: 'Wird gespeichert…', success_title: '🎉 Willkommen in der Studie!',
    success_desc: 'Du bist jetzt offiziell eingetragen. Dein Rabatt ist sofort aktiv.',
    error_duplicate: 'Diese E-Mail ist bereits registriert.', error_generic: 'Fehler beim Speichern. Bitte erneut versuchen.',
    location_loading: 'Standort wird ermittelt…', cost_title: 'Was kostet was — und warum?',
    cost_intro: 'Die KI-Modelle kosten echtes Geld. Dein Beitrag finanziert Forschung + Entwicklung.',
    cost_items: [{ feature: 'Text-Deutung', market: '~0,25 €', model: 'GPT-5.4', dc: '2 Coins ≈ 0,04 €' },{ feature: 'Bild HD', market: '~0,08 €', model: 'GPT Image', dc: '8 Coins ≈ 0,16 €' },{ feature: 'Video 30s', market: '~5,00 €', model: 'Runway Gen-4.5', dc: '180 Coins ≈ 3,60 €' },{ feature: 'Live Voice 30min', market: '~1,00 €', model: 'ElevenLabs', dc: '20 Coins ≈ 0,40 €' }],
    cost_footer: '1 Coin = 0,02 € · Bis zu 93% günstiger',
  },
  [Language.EN]: {
    header_title: 'Scientific Study', header_sub: 'The Largest Global Dream Research Initiative',
    anon_note: 'Every dream in DreamCode automatically flows anonymously into research. With official participation, you become a named part of the largest global dream study.',
    section_title: 'The more you contribute to research, the more you save',
    tier1_name: 'Basic Participation', tier1_discount: '10%', tier1_price: 'Free',
    tier1_bullets: ['Officially registered by name in study','Dreams contribute to research','10% discount on all coin purchases','No selfie required'],
    tier2_name: 'Deep Research', tier2_discount: '20%', tier2_price: '€3.50 / month', tier2_price_year: '€42 / year',
    tier2_bullets: ['Everything from Basic','Min. 5 dream entries per week','All features unlocked','No face photo required','Data pseudonymized & GDPR-compliant'],
    tier2_note: 'This minimal price solely covers our basic costs (API, server, infrastructure). We earn nothing from it.',
    tier3_name: 'Deep Research + Selfie', tier3_discount: '30%', tier3_price: '€3.50 / month', tier3_price_year: '€42 / year', tier3_recommended: 'Recommended',
    tier3_bullets: ['Everything from Deep Research','Monthly face photo for AI analysis','Highest discount — greatest research contribution','Pioneer research: facial features & dreams'],
    form_title: 'Registration', f_firstname: 'First Name *', f_lastname: 'Last Name *', f_email: 'Email *',
    f_birthyear: 'Birth Year *', f_birthtime: 'Birth Time', f_birthtime_hint: 'Optional — enables additional chronobiological research insights',
    f_birthtime_tooltip: 'Birth time can provide insights into circadian rhythms and sleep patterns.',
    f_gender: 'Gender *', f_location: 'Location', f_nationality: 'Nationality',
    gender_options: ['Male', 'Female', 'Diverse', 'Prefer not to say'],
    consent_data: 'I agree to the use of my dream data for scientific purposes.',
    consent_name: 'My name may appear in the study publication.',
    consent_face: 'I agree to the monthly use of my face photo for dream research.',
    verify_send: 'Send Code', verify_resend: 'Resend', verify_placeholder: '6-digit code',
    verify_checking: 'Checking code…', verify_ok: 'Email verified ✓', verify_error: 'Wrong code. Try again.',
    verify_sent: 'Code sent to ', submit_btn: 'Join Study', submit_deep: 'Start Deep Research',
    submitting: 'Saving…', success_title: '🎉 Welcome to the study!',
    success_desc: 'You are now officially registered. Your discount is immediately active.',
    error_duplicate: 'This email is already registered.', error_generic: 'Error saving. Please try again.',
    location_loading: 'Detecting location…', cost_title: 'What costs what — and why?',
    cost_intro: 'AI models cost real money. Your contribution funds research + development.',
    cost_items: [{ feature: 'Text Interpretation', market: '~€0.25', model: 'GPT-5.4', dc: '2 Coins ≈ €0.04' },{ feature: 'HD Image', market: '~€0.08', model: 'GPT Image', dc: '8 Coins ≈ €0.16' },{ feature: '30s Video', market: '~€5.00', model: 'Runway Gen-4.5', dc: '180 Coins ≈ €3.60' },{ feature: 'Live Voice 30min', market: '~€1.00', model: 'ElevenLabs', dc: '20 Coins ≈ €0.40' }],
    cost_footer: '1 Coin = €0.02 · Up to 93% cheaper',
  },
  [Language.TR]: {
    header_title: 'Bilimsel Çalışma', header_sub: 'En Büyük Küresel Rüya Araştırma Girişimi',
    anon_note: "DreamCode'daki her rüya otomatik olarak anonim şekilde araştırmaya katkıda bulunur. Resmi katılımla, en büyük küresel rüya çalışmasının adlandırılmış bir parçası olursunuz.",
    section_title: 'Araştırmaya ne kadar katkıda bulunursanız, o kadar tasarruf edersiniz',
    tier1_name: 'Temel Katılım', tier1_discount: '%10', tier1_price: 'Ücretsiz',
    tier1_bullets: ['Resmi olarak çalışmaya kayıtlı','Rüyalar araştırmaya katkıda bulunur','Tüm coin alımlarında %10 indirim','Selfie gerekmez'],
    tier2_name: 'Derin Araştırma', tier2_discount: '%20', tier2_price: '3,50 € / ay', tier2_price_year: '42 € / yıl',
    tier2_bullets: ['Temel katılımdan her şey','Haftada min. 5 rüya girişi','Tüm özellikler açık','Yüz fotoğrafı gerekmez','Veriler anonimleştirilmiş & GDPR uyumlu'],
    tier2_note: 'Bu minimum fiyat, yalnızca temel maliyetlerimizi (API, sunucu, altyapı) karşılamak için kullanılır.',
    tier3_name: 'Derin Araştırma + Selfie', tier3_discount: '%30', tier3_price: '3,50 € / ay', tier3_price_year: '42 € / yıl', tier3_recommended: 'Önerilen',
    tier3_bullets: ['Derin araştırmadan her şey','AI analizi için aylık yüz fotoğrafı','En yüksek indirim','Öncü araştırma: yüz özellikleri & rüyalar'],
    form_title: 'Kayıt', f_firstname: 'Ad *', f_lastname: 'Soyad *', f_email: 'E-posta *',
    f_birthyear: 'Doğum Yılı *', f_birthtime: 'Doğum Saati', f_birthtime_hint: 'İsteğe bağlı — ek kronobiyolojik araştırma içgörüleri sağlar',
    f_birthtime_tooltip: 'Doğum saati sirkadiyen ritimler ve uyku düzeni hakkında bilgi verebilir.',
    f_gender: 'Cinsiyet *', f_location: 'Konum', f_nationality: 'Milliyet',
    gender_options: ['Erkek', 'Kadın', 'Diğer', 'Belirtmek istemiyorum'],
    consent_data: 'Rüya verilerimin bilimsel amaçlarla kullanılmasını kabul ediyorum.',
    consent_name: 'Adım çalışma yayınında görünebilir.',
    consent_face: 'Yüz fotoğrafımın rüya araştırması için aylık kullanımını kabul ediyorum.',
    verify_send: 'Kod Gönder', verify_resend: 'Yeniden Gönder', verify_placeholder: '6 haneli kod',
    verify_checking: 'Kod kontrol ediliyor…', verify_ok: 'E-posta doğrulandı ✓', verify_error: 'Yanlış kod. Tekrar dene.',
    verify_sent: 'Kod gönderildi: ', submit_btn: 'Çalışmaya Katıl', submit_deep: 'Derin Araştırmayı Başlat',
    submitting: 'Kaydediliyor…', success_title: '🎉 Çalışmaya hoş geldiniz!',
    success_desc: 'Artık resmi olarak kayıtlısınız. İndiriminiz hemen aktif.',
    error_duplicate: 'Bu e-posta zaten kayıtlı.', error_generic: 'Kayıt hatası. Lütfen tekrar deneyin.',
    location_loading: 'Konum tespit ediliyor…', cost_title: 'Ne ne kadar — ve neden?',
    cost_intro: 'Yapay zeka modelleri gerçek para gerektirir. Katkınız araştırmayı finanse eder.',
    cost_items: [{ feature: 'Metin Yorumu', market: '~0,25 €', model: 'GPT-5.4', dc: '2 Coin ≈ 0,04 €' },{ feature: 'HD Görsel', market: '~0,08 €', model: 'GPT Image', dc: '8 Coin ≈ 0,16 €' },{ feature: '30sn Video', market: '~5,00 €', model: 'Runway Gen-4.5', dc: '180 Coin ≈ 3,60 €' },{ feature: 'Canlı Ses 30dk', market: '~1,00 €', model: 'ElevenLabs', dc: '20 Coin ≈ 0,40 €' }],
    cost_footer: '1 Coin = 0,02 € · %93\'e kadar daha ucuz',
  },
  [Language.AR]: {
    header_title: 'دراسة علمية', header_sub: 'أكبر مبادرة بحثية عالمية لدراسة الأحلام',
    anon_note: 'كل حلم في DreamCode يُضاف تلقائياً وبصورة مجهولة إلى البحث. بالمشاركة الرسمية، تصبح جزءاً مُسمَّى من أكبر دراسة أحلام عالمية.',
    section_title: 'كلما أسهمت أكثر في البحث، كلما وفّرت أكثر',
    tier1_name: 'المشاركة الأساسية', tier1_discount: '10%', tier1_price: 'مجاناً',
    tier1_bullets: ['تسجيل رسمي باسمك في الدراسة','الأحلام تُساهم في البحث','خصم 10% على شراء العملات','لا حاجة لصورة سيلفي'],
    tier2_name: 'بحث معمّق', tier2_discount: '20%', tier2_price: '3.50 € / شهر', tier2_price_year: '42 € / سنة',
    tier2_bullets: ['كل مزايا المشاركة الأساسية','5 إدخالات أحلام أسبوعياً على الأقل','جميع الميزات مفعّلة','لا حاجة لصورة وجه','البيانات مجهّلة وملتزمة بـ GDPR'],
    tier2_note: 'هذا السعر البسيط يُغطّي فقط تكاليفنا الأساسية. لا نجني أي ربح منه.',
    tier3_name: 'بحث معمّق + سيلفي', tier3_discount: '30%', tier3_price: '3.50 € / شهر', tier3_price_year: '42 € / سنة', tier3_recommended: 'موصى به',
    tier3_bullets: ['كل مزايا البحث المعمّق','صورة وجه شهرية لتحليل الذكاء الاصطناعي','أعلى خصم — أكبر مساهمة بحثية','بحث رائد: ملامح الوجه والأحلام'],
    form_title: 'التسجيل', f_firstname: 'الاسم الأول *', f_lastname: 'اسم العائلة *', f_email: 'البريد الإلكتروني *',
    f_birthyear: 'سنة الميلاد *', f_birthtime: 'وقت الميلاد', f_birthtime_hint: 'اختياري — يُتيح رؤى بحثية إضافية في علم البيولوجيا الزمنية',
    f_birthtime_tooltip: 'يمكن أن يوفر وقت الولادة معلومات عن الإيقاعات اليومية وأنماط النوم.',
    f_gender: 'الجنس *', f_location: 'الموقع', f_nationality: 'الجنسية',
    gender_options: ['ذكر', 'أنثى', 'متنوع', 'أفضل عدم الذكر'],
    consent_data: 'أوافق على استخدام بيانات أحلامي لأغراض علمية.',
    consent_name: 'يمكن أن يظهر اسمي في نشر الدراسة.',
    consent_face: 'أوافق على الاستخدام الشهري لصورة وجهي لأبحاث الأحلام.',
    verify_send: 'إرسال الرمز', verify_resend: 'إعادة الإرسال', verify_placeholder: 'رمز مكون من 6 أرقام',
    verify_checking: 'التحقق من الرمز…', verify_ok: 'تم التحقق من البريد ✓', verify_error: 'رمز خاطئ. حاول مجدداً.',
    verify_sent: 'تم إرسال الرمز إلى ', submit_btn: 'الانضمام للدراسة', submit_deep: 'بدء البحث المعمّق',
    submitting: 'يتم الحفظ…', success_title: '🎉 مرحباً بك في الدراسة!',
    success_desc: 'لقد سُجِّلت رسمياً. خصمك نشط فوراً.',
    error_duplicate: 'هذا البريد مسجّل بالفعل.', error_generic: 'خطأ في الحفظ. يرجى المحاولة مجدداً.',
    location_loading: 'جاري تحديد الموقع…', cost_title: 'ما التكاليف — ولماذا؟',
    cost_intro: 'نماذج الذكاء الاصطناعي تكلّف أموالاً حقيقية. مساهمتك تموّل البحث والتطوير.',
    cost_items: [{ feature: 'تفسير النص', market: '~0.25 €', model: 'GPT-5.4', dc: '2 عملات ≈ 0.04 €' },{ feature: 'صورة HD', market: '~0.08 €', model: 'GPT Image', dc: '8 عملات ≈ 0.16 €' },{ feature: 'فيديو 30ث', market: '~5.00 €', model: 'Runway Gen-4.5', dc: '180 عملة ≈ 3.60 €' },{ feature: 'صوت مباشر 30د', market: '~1.00 €', model: 'ElevenLabs', dc: '20 عملة ≈ 0.40 €' }],
    cost_footer: '1 عملة = 0.02 € · أرخص بنسبة تصل إلى 93%',
  },
  [Language.ES]: {
    header_title: 'Estudio Científico', header_sub: 'La Mayor Iniciativa de Investigación de Sueños del Mundo',
    anon_note: 'Cada sueño en DreamCode contribuye automáticamente de forma anónima a la investigación. Con participación oficial, te conviertes en parte nominada del mayor estudio global de sueños.',
    section_title: 'Cuanto más contribuyes a la investigación, más ahorras',
    tier1_name: 'Participación Básica', tier1_discount: '10%', tier1_price: 'Gratis',
    tier1_bullets: ['Registrado oficialmente por nombre','Sueños contribuyen a investigación','10% descuento en compras de monedas','Sin selfie requerido'],
    tier2_name: 'Investigación Profunda', tier2_discount: '20%', tier2_price: '3,50 € / mes', tier2_price_year: '42 € / año',
    tier2_bullets: ['Todo de Básica','Mín. 5 entradas de sueños/semana','Todas las funciones desbloqueadas','Sin foto facial requerida','Datos seudonimizados y conformes al RGPD'],
    tier2_note: 'Este precio mínimo cubre únicamente nuestros costos básicos. No obtenemos ningún beneficio.',
    tier3_name: 'Investigación Profunda + Selfie', tier3_discount: '30%', tier3_price: '3,50 € / mes', tier3_price_year: '42 € / año', tier3_recommended: 'Recomendado',
    tier3_bullets: ['Todo de Investigación Profunda','Foto facial mensual para análisis de IA','Mayor descuento — mayor contribución','Investigación pionera: rasgos faciales y sueños'],
    form_title: 'Registro', f_firstname: 'Nombre *', f_lastname: 'Apellido *', f_email: 'Correo Electrónico *',
    f_birthyear: 'Año de Nacimiento *', f_birthtime: 'Hora de Nacimiento', f_birthtime_hint: 'Opcional — permite información adicional cronobiológica',
    f_birthtime_tooltip: 'La hora de nacimiento puede revelar información sobre ritmos circadianos y patrones de sueño.',
    f_gender: 'Género *', f_location: 'Ubicación', f_nationality: 'Nacionalidad',
    gender_options: ['Masculino', 'Femenino', 'Diverso', 'Prefiero no decir'],
    consent_data: 'Acepto el uso de mis datos de sueño para fines científicos.',
    consent_name: 'Mi nombre puede aparecer en la publicación del estudio.',
    consent_face: 'Acepto el uso mensual de mi foto facial para investigación de sueños.',
    verify_send: 'Enviar Código', verify_resend: 'Reenviar', verify_placeholder: 'Código de 6 dígitos',
    verify_checking: 'Verificando código…', verify_ok: 'Correo verificado ✓', verify_error: 'Código incorrecto. Intenta de nuevo.',
    verify_sent: 'Código enviado a ', submit_btn: 'Unirse al Estudio', submit_deep: 'Iniciar Investigación Profunda',
    submitting: 'Guardando…', success_title: '🎉 ¡Bienvenido al estudio!',
    success_desc: 'Ya estás registrado oficialmente. Tu descuento está activo inmediatamente.',
    error_duplicate: 'Este correo ya está registrado.', error_generic: 'Error al guardar. Por favor intenta de nuevo.',
    location_loading: 'Detectando ubicación…', cost_title: '¿Qué cuesta qué — y por qué?',
    cost_intro: 'Los modelos de IA cuestan dinero real. Tu contribución financia investigación + desarrollo.',
    cost_items: [{ feature: 'Interpretación de Texto', market: '~0,25 €', model: 'GPT-5.4', dc: '2 Monedas ≈ 0,04 €' },{ feature: 'Imagen HD', market: '~0,08 €', model: 'GPT Image', dc: '8 Monedas ≈ 0,16 €' },{ feature: 'Video 30s', market: '~5,00 €', model: 'Runway Gen-4.5', dc: '180 Monedas ≈ 3,60 €' },{ feature: 'Voz en Vivo 30min', market: '~1,00 €', model: 'ElevenLabs', dc: '20 Monedas ≈ 0,40 €' }],
    cost_footer: '1 Moneda = 0,02 € · Hasta 93% más barato',
  },
  [Language.FR]: {
    header_title: 'Étude Scientifique', header_sub: 'La Plus Grande Initiative Mondiale de Recherche sur les Rêves',
    anon_note: 'Chaque rêve dans DreamCode contribue automatiquement de façon anonyme à la recherche. Avec une participation officielle, vous devenez une partie nominée de la plus grande étude de rêves mondiale.',
    section_title: 'Plus vous contribuez à la recherche, plus vous économisez',
    tier1_name: 'Participation de Base', tier1_discount: '10%', tier1_price: 'Gratuit',
    tier1_bullets: ['Enregistré officiellement par nom','Rêves contribuent à la recherche','10% de réduction sur les achats de pièces','Pas de selfie requis'],
    tier2_name: 'Recherche Approfondie', tier2_discount: '20%', tier2_price: '3,50 € / mois', tier2_price_year: '42 € / an',
    tier2_bullets: ['Tout de Base','Min. 5 entrées de rêves/semaine','Toutes les fonctionnalités débloquées','Pas de photo du visage requise','Données pseudonymisées & conformes au RGPD'],
    tier2_note: 'Ce prix minimal couvre uniquement nos coûts de base. Nous n\'en tirons aucun bénéfice.',
    tier3_name: 'Recherche Approfondie + Selfie', tier3_discount: '30%', tier3_price: '3,50 € / mois', tier3_price_year: '42 € / an', tier3_recommended: 'Recommandé',
    tier3_bullets: ['Tout de Recherche Approfondie','Photo du visage mensuelle pour analyse IA','Réduction maximale — contribution maximale','Recherche pionnière: traits du visage & rêves'],
    form_title: 'Inscription', f_firstname: 'Prénom *', f_lastname: 'Nom de famille *', f_email: 'E-mail *',
    f_birthyear: 'Année de naissance *', f_birthtime: 'Heure de naissance', f_birthtime_hint: 'Facultatif — permet des informations chronobiologiques supplémentaires',
    f_birthtime_tooltip: "L'heure de naissance peut fournir des informations sur les rythmes circadiens et les habitudes de sommeil.",
    f_gender: 'Genre *', f_location: 'Lieu', f_nationality: 'Nationalité',
    gender_options: ['Masculin', 'Féminin', 'Diversifié', 'Préfère ne pas dire'],
    consent_data: "J'accepte l'utilisation de mes données de rêve à des fins scientifiques.",
    consent_name: 'Mon nom peut apparaître dans la publication de l\'étude.',
    consent_face: "J'accepte l'utilisation mensuelle de ma photo du visage pour la recherche sur les rêves.",
    verify_send: 'Envoyer le code', verify_resend: 'Renvoyer', verify_placeholder: 'Code à 6 chiffres',
    verify_checking: 'Vérification du code…', verify_ok: 'E-mail vérifié ✓', verify_error: 'Code incorrect. Réessayez.',
    verify_sent: 'Code envoyé à ', submit_btn: "Rejoindre l'Étude", submit_deep: 'Démarrer la Recherche Approfondie',
    submitting: 'Sauvegarde…', success_title: "🎉 Bienvenue dans l'étude!",
    success_desc: 'Vous êtes maintenant officiellement enregistré. Votre réduction est immédiatement active.',
    error_duplicate: 'Cet e-mail est déjà enregistré.', error_generic: 'Erreur lors de la sauvegarde. Veuillez réessayer.',
    location_loading: 'Détection de la localisation…', cost_title: 'Quoi coûte quoi — et pourquoi?',
    cost_intro: 'Les modèles d\'IA coûtent de l\'argent réel. Votre contribution finance la recherche + le développement.',
    cost_items: [{ feature: 'Interprétation de texte', market: '~0,25 €', model: 'GPT-5.4', dc: '2 Pièces ≈ 0,04 €' },{ feature: 'Image HD', market: '~0,08 €', model: 'GPT Image', dc: '8 Pièces ≈ 0,16 €' },{ feature: 'Vidéo 30s', market: '~5,00 €', model: 'Runway Gen-4.5', dc: '180 Pièces ≈ 3,60 €' },{ feature: 'Voix en direct 30min', market: '~1,00 €', model: 'ElevenLabs', dc: '20 Pièces ≈ 0,40 €' }],
    cost_footer: '1 Pièce = 0,02 € · Jusqu\'à 93% moins cher',
  },
  [Language.RU]: {
    header_title: 'Научное Исследование', header_sub: 'Крупнейшая Глобальная Инициатива по Изучению Снов',
    anon_note: 'Каждый сон в DreamCode автоматически анонимно входит в исследование. При официальном участии вы становитесь именованной частью крупнейшего глобального исследования снов.',
    section_title: 'Чем больше вы вносите в исследование, тем больше экономите',
    tier1_name: 'Базовое Участие', tier1_discount: '10%', tier1_price: 'Бесплатно',
    tier1_bullets: ['Официально зарегистрированы по имени','Сны вносят вклад в исследование','Скидка 10% на покупку монет','Селфи не требуется'],
    tier2_name: 'Глубокое Исследование', tier2_discount: '20%', tier2_price: '3,50 € / месяц', tier2_price_year: '42 € / год',
    tier2_bullets: ['Всё из Базового','Мин. 5 записей снов в неделю','Все функции разблокированы','Фото лица не требуется','Данные псевдонимизированы и соответствуют GDPR'],
    tier2_note: 'Эта минимальная цена покрывает только наши базовые расходы. Мы ничего не зарабатываем на этом.',
    tier3_name: 'Глубокое Исследование + Селфи', tier3_discount: '30%', tier3_price: '3,50 € / месяц', tier3_price_year: '42 € / год', tier3_recommended: 'Рекомендуется',
    tier3_bullets: ['Всё из Глубокого Исследования','Ежемесячное фото лица для ИИ-анализа','Максимальная скидка — максимальный вклад','Пионерское исследование: черты лица и сны'],
    form_title: 'Регистрация', f_firstname: 'Имя *', f_lastname: 'Фамилия *', f_email: 'Электронная почта *',
    f_birthyear: 'Год рождения *', f_birthtime: 'Время рождения', f_birthtime_hint: 'Необязательно — предоставляет дополнительные хронобиологические данные',
    f_birthtime_tooltip: 'Время рождения может дать информацию о циркадных ритмах и паттернах сна.',
    f_gender: 'Пол *', f_location: 'Местоположение', f_nationality: 'Национальность',
    gender_options: ['Мужской', 'Женский', 'Другой', 'Предпочитаю не указывать'],
    consent_data: 'Я согласен(на) на использование моих данных снов в научных целях.',
    consent_name: 'Моё имя может появиться в публикации исследования.',
    consent_face: 'Я согласен(на) на ежемесячное использование моего фото лица для исследования снов.',
    verify_send: 'Отправить код', verify_resend: 'Отправить снова', verify_placeholder: '6-значный код',
    verify_checking: 'Проверка кода…', verify_ok: 'Email подтверждён ✓', verify_error: 'Неверный код. Попробуйте снова.',
    verify_sent: 'Код отправлен на ', submit_btn: 'Присоединиться к исследованию', submit_deep: 'Начать глубокое исследование',
    submitting: 'Сохранение…', success_title: '🎉 Добро пожаловать в исследование!',
    success_desc: 'Вы теперь официально зарегистрированы. Ваша скидка активна немедленно.',
    error_duplicate: 'Этот email уже зарегистрирован.', error_generic: 'Ошибка сохранения. Пожалуйста, попробуйте снова.',
    location_loading: 'Определение местоположения…', cost_title: 'Что стоит что — и почему?',
    cost_intro: 'Модели ИИ стоят реальных денег. Ваш вклад финансирует исследования + разработку.',
    cost_items: [{ feature: 'Интерпретация текста', market: '~0,25 €', model: 'GPT-5.4', dc: '2 монеты ≈ 0,04 €' },{ feature: 'HD изображение', market: '~0,08 €', model: 'GPT Image', dc: '8 монет ≈ 0,16 €' },{ feature: 'Видео 30с', market: '~5,00 €', model: 'Runway Gen-4.5', dc: '180 монет ≈ 3,60 €' },{ feature: 'Живой голос 30мин', market: '~1,00 €', model: 'ElevenLabs', dc: '20 монет ≈ 0,40 €' }],
    cost_footer: '1 монета = 0,02 € · До 93% дешевле',
  },
  [Language.HI]: {
    header_title: 'वैज्ञानिक अध्ययन', header_sub: 'विश्व की सबसे बड़ी स्वप्न अनुसंधान पहल',
    anon_note: 'DreamCode में प्रत्येक सपना स्वचालित रूप से अनामिक रूप से अनुसंधान में जाता है। आधिकारिक भागीदारी से आप सबसे बड़े वैश्विक स्वप्न अध्ययन का नामित हिस्सा बनते हैं।',
    section_title: 'आप जितना अधिक अनुसंधान में योगदान करते हैं, उतनी अधिक बचत करते हैं',
    tier1_name: 'बुनियादी भागीदारी', tier1_discount: '10%', tier1_price: 'निःशुल्क',
    tier1_bullets: ['अध्ययन में नाम से आधिकारिक रूप से पंजीकृत','सपने अनुसंधान में योगदान करते हैं','सभी कॉइन खरीद पर 10% छूट','सेल्फी की आवश्यकता नहीं'],
    tier2_name: 'गहन अनुसंधान', tier2_discount: '20%', tier2_price: '3.50 € / माह', tier2_price_year: '42 € / वर्ष',
    tier2_bullets: ['बुनियादी का सब कुछ','प्रति सप्ताह न्यूनतम 5 सपने दर्ज','सभी सुविधाएं अनलॉक','चेहरे की फोटो की आवश्यकता नहीं','डेटा अनामीकृत और GDPR-अनुपालन'],
    tier2_note: 'यह न्यूनतम मूल्य केवल हमारी बुनियादी लागतों को कवर करने के लिए है। हम इससे कुछ नहीं कमाते।',
    tier3_name: 'गहन अनुसंधान + सेल्फी', tier3_discount: '30%', tier3_price: '3.50 € / माह', tier3_price_year: '42 € / वर्ष', tier3_recommended: 'अनुशंसित',
    tier3_bullets: ['गहन अनुसंधान का सब कुछ','AI विश्लेषण के लिए मासिक चेहरे की फोटो','सबसे अधिक छूट','अग्रणी अनुसंधान: चेहरे की विशेषताएं और सपने'],
    form_title: 'पंजीकरण', f_firstname: 'पहला नाम *', f_lastname: 'अंतिम नाम *', f_email: 'ईमेल *',
    f_birthyear: 'जन्म वर्ष *', f_birthtime: 'जन्म समय', f_birthtime_hint: 'वैकल्पिक — अतिरिक्त कालक्रमजीवविज्ञान अनुसंधान अंतर्दृष्टि सक्षम करता है',
    f_birthtime_tooltip: 'जन्म समय सर्कडियन लय और नींद के पैटर्न के बारे में जानकारी दे सकता है।',
    f_gender: 'लिंग *', f_location: 'स्थान', f_nationality: 'राष्ट्रीयता',
    gender_options: ['पुरुष', 'महिला', 'अन्य', 'बताना नहीं चाहता'],
    consent_data: 'मैं वैज्ञानिक उद्देश्यों के लिए अपने सपने के डेटा के उपयोग से सहमत हूं।',
    consent_name: 'मेरा नाम अध्ययन प्रकाशन में दिख सकता है।',
    consent_face: 'मैं स्वप्न अनुसंधान के लिए अपनी चेहरे की फोटो के मासिक उपयोग से सहमत हूं।',
    verify_send: 'कोड भेजें', verify_resend: 'पुनः भेजें', verify_placeholder: '6-अंकीय कोड',
    verify_checking: 'कोड जांचा जा रहा है…', verify_ok: 'ईमेल सत्यापित ✓', verify_error: 'गलत कोड। पुनः प्रयास करें।',
    verify_sent: 'कोड भेजा गया ', submit_btn: 'अध्ययन में शामिल हों', submit_deep: 'गहन अनुसंधान शुरू करें',
    submitting: 'सहेजा जा रहा है…', success_title: '🎉 अध्ययन में स्वागत है!',
    success_desc: 'आप अब आधिकारिक रूप से पंजीकृत हैं। आपकी छूट तुरंत सक्रिय है।',
    error_duplicate: 'यह ईमेल पहले से पंजीकृत है।', error_generic: 'सहेजने में त्रुटि। कृपया पुनः प्रयास करें।',
    location_loading: 'स्थान पता किया जा रहा है…', cost_title: 'क्या क्या लागत — और क्यों?',
    cost_intro: 'AI मॉडल वास्तविक पैसे खर्च करते हैं। आपका योगदान अनुसंधान + विकास को वित्त पोषित करता है।',
    cost_items: [{ feature: 'टेक्स्ट व्याख्या', market: '~0.25 €', model: 'GPT-5.4', dc: '2 Coins ≈ 0.04 €' },{ feature: 'HD छवि', market: '~0.08 €', model: 'GPT Image', dc: '8 Coins ≈ 0.16 €' },{ feature: '30s वीडियो', market: '~5.00 €', model: 'Runway Gen-4.5', dc: '180 Coins ≈ 3.60 €' },{ feature: 'लाइव वॉइस 30मिन', market: '~1.00 €', model: 'ElevenLabs', dc: '20 Coins ≈ 0.40 €' }],
    cost_footer: '1 Coin = 0.02 € · 93% तक सस्ता',
  },
  [Language.ZH]: {
    header_title: '科学研究', header_sub: '最大的全球梦境研究倡议',
    anon_note: 'DreamCode中的每个梦境都会自动匿名地纳入研究。通过官方参与，您将成为最大全球梦境研究中的命名成员。',
    section_title: '您对研究的贡献越多，节省越多',
    tier1_name: '基础参与', tier1_discount: '10%', tier1_price: '免费',
    tier1_bullets: ['正式以姓名注册参与研究','梦境贡献于研究','所有金币购买享10%折扣','无需自拍'],
    tier2_name: '深度研究', tier2_discount: '20%', tier2_price: '3.50 € / 月', tier2_price_year: '42 € / 年',
    tier2_bullets: ['基础的所有功能','每周至少5条梦境记录','所有功能解锁','无需面部照片','数据伪匿名化且符合GDPR'],
    tier2_note: '这个最低价格仅用于覆盖我们的基本成本。我们不从中获利。',
    tier3_name: '深度研究 + 自拍', tier3_discount: '30%', tier3_price: '3.50 € / 月', tier3_price_year: '42 € / 年', tier3_recommended: '推荐',
    tier3_bullets: ['深度研究的所有功能','每月面部照片用于AI分析','最高折扣 — 最大研究贡献','先驱研究：面部特征与梦境'],
    form_title: '注册', f_firstname: '名字 *', f_lastname: '姓氏 *', f_email: '电子邮件 *',
    f_birthyear: '出生年份 *', f_birthtime: '出生时间', f_birthtime_hint: '可选 — 提供额外的时间生物学研究见解',
    f_birthtime_tooltip: '出生时间可以提供有关昼夜节律和睡眠模式的信息。',
    f_gender: '性别 *', f_location: '位置', f_nationality: '国籍',
    gender_options: ['男', '女', '多元', '不愿透露'],
    consent_data: '我同意将我的梦境数据用于科学目的。',
    consent_name: '我的名字可能出现在研究出版物中。',
    consent_face: '我同意每月使用我的面部照片进行梦境研究。',
    verify_send: '发送验证码', verify_resend: '重新发送', verify_placeholder: '6位验证码',
    verify_checking: '正在验证…', verify_ok: '邮箱已验证 ✓', verify_error: '验证码错误，请重试。',
    verify_sent: '验证码已发送至 ', submit_btn: '参与研究', submit_deep: '开始深度研究',
    submitting: '保存中…', success_title: '🎉 欢迎加入研究！',
    success_desc: '您现在已正式注册。您的折扣立即生效。',
    error_duplicate: '此邮箱已注册。', error_generic: '保存错误，请重试。',
    location_loading: '正在检测位置…', cost_title: '什么费用什么 — 为什么？',
    cost_intro: 'AI模型需要真实的钱。您的贡献资助研究+开发。',
    cost_items: [{ feature: '文字解读', market: '~0.25 €', model: 'GPT-5.4', dc: '2金币 ≈ 0.04 €' },{ feature: 'HD图像', market: '~0.08 €', model: 'GPT Image', dc: '8金币 ≈ 0.16 €' },{ feature: '30秒视频', market: '~5.00 €', model: 'Runway Gen-4.5', dc: '180金币 ≈ 3.60 €' },{ feature: '实时语音30分钟', market: '~1.00 €', model: 'ElevenLabs', dc: '20金币 ≈ 0.40 €' }],
    cost_footer: '1金币 = 0.02 € · 最多便宜93%',
  },
};

// Fallback chain for languages without dedicated translation
function getStudyT(language: Language): StudyT {
  const t = STUDY_TRANSLATIONS[language];
  if (t) return t;
  // Arabic dialects → use AR
  if ((language as string).startsWith('ar')) return STUDY_TRANSLATIONS[Language.AR]!;
  // RTL languages (fa, ur, prs) → use AR as closest fallback
  if ([Language.FA, Language.UR, Language.PRS].includes(language)) return STUDY_TRANSLATIONS[Language.AR]!;
  // Asian languages
  if ([Language.JA, Language.KO].includes(language)) return STUDY_TRANSLATIONS[Language.ZH]!;
  // Indian languages → use HI
  if ([Language.TA, Language.TE, Language.ML, Language.MR, Language.KN, Language.GU, Language.BN, Language.NE].includes(language)) return STUDY_TRANSLATIONS[Language.HI]!;
  // Filipino → English
  if (language === Language.TL) return STUDY_TRANSLATIONS[Language.EN]!;
  // Hebrew → English (own RTL handled by isRtl)
  if (language === Language.HE) return STUDY_TRANSLATIONS[Language.EN]!;
  // Default: English
  return STUDY_TRANSLATIONS[Language.EN]!;
}

// ─── Reverse Geocoding ────────────────────────────────────────────────────────
async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; nationality: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=de`,
      { headers: { 'Accept-Language': 'de' } }
    );
    const data = await res.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      '';
    const country = data.address?.country || '';
    // Map country → Nationalität
    const countryNatMap: Record<string, string> = {
      'Deutschland': 'Deutsch', 'Österreich': 'Österreichisch', 'Schweiz': 'Schweizerisch',
      'Vereinigte Staaten von Amerika': 'Amerikanisch', 'Vereinigtes Königreich': 'Britisch',
      'Frankreich': 'Französisch', 'Spanien': 'Spanisch', 'Italien': 'Italienisch',
      'Portugal': 'Portugiesisch', 'Niederlande': 'Niederländisch', 'Türkei': 'Türkisch',
      'Russland': 'Russisch', 'Japan': 'Japanisch', 'China': 'Chinesisch',
      'Indien': 'Indisch', 'Australien': 'Australisch', 'Kanada': 'Kanadisch',
      'Brasilien': 'Brasilianisch', 'Ägypten': 'Ägyptisch', 'Marokko': 'Marokkanisch',
      'Saudi-Arabien': 'Saudi-Arabisch', 'Polen': 'Polnisch', 'Schweden': 'Schwedisch',
      'Norwegen': 'Norwegisch', 'Dänemark': 'Dänisch', 'Belgien': 'Belgisch',
      'Griechenland': 'Griechisch', 'Ukraine': 'Ukrainisch', 'Rumänien': 'Rumänisch',
    };
    return { city, nationality: countryNatMap[country] || '' };
  } catch {
    return { city: '', nationality: '' };
  }
}

// ─── E-Mail Verifizierung via Supabase Edge Function / eigener Flow ───────────
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────
const StudyPage: React.FC<StudyPageProps> = ({
  language,
  onClose,
  themeMode,
  userProfile,
  onUpdateProfile,
}) => {
  const th = getTheme(themeMode);
  const isLight = th.isLight;
  const isRtl = ((language as string).startsWith('ar') || [Language.FA, Language.UR, Language.HE, Language.PRS].includes(language));
  const T = getStudyT(language);

  // Already joined?
  const alreadyJoined = (['basic', 'active', 'deep', 'deep_selfie'] as const).includes(
    userProfile.study_participation_level as string as any
  );
  const currentDiscount = alreadyJoined ? (userProfile.study_discount ?? 0) * 100 : 0;

  // ── Tier selection ──
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | null>(null);

  // ── Form state ──
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [nationality, setNationality] = useState('');
  const [consentData, setConsentData] = useState(false);
  const [consentName, setConsentName] = useState(false);
  const [consentFace, setConsentFace] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // ── Email verification ──
  const [verifyCode, setVerifyCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // ── Submit state ──
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  // ── Geolocation auto-fill ──
  const [locationLoading, setLocationLoading] = useState(false);
  const geoFetched = useRef(false);

  useEffect(() => {
    // Prefill from userProfile if logged in
    if (userProfile?.name) {
      const parts = userProfile.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    if ((userProfile as any)?.email) {
      setEmail((userProfile as any).email);
    }
  }, []);

  useEffect(() => {
    if (selectedTier && !geoFetched.current && !location) {
      geoFetched.current = true;
      setLocationLoading(true);
      navigator.geolocation?.getCurrentPosition(
        async (pos) => {
          const { city, nationality: nat } = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (city) setLocation(city);
          if (nat && !nationality) setNationality(nat);
          setLocationLoading(false);
        },
        () => setLocationLoading(false),
        { timeout: 8000 }
      );
    }
  }, [selectedTier]);

  // ── Send verification code ──
  async function handleSendCode() {
    if (!email || !email.includes('@')) return;
    setVerifyLoading(true);
    setVerifyError('');
    const code = generateCode();
    setSentCode(code);
    try {
      // Use Supabase to send OTP / or custom email via edge function
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { email, code },
      });
      if (error) throw error;
      setCodeSent(true);
    } catch {
      // Fallback: store code locally for demo (in production, always use server-side)
      setCodeSent(true);
    } finally {
      setVerifyLoading(false);
    }
  }

  function handleVerifyCode() {
    setVerifyLoading(true);
    setVerifyError('');
    setTimeout(() => {
      if (verifyInput.trim() === sentCode) {
        setEmailVerified(true);
        setVerifyError('');
      } else {
        setVerifyError(T.verify_error);
      }
      setVerifyLoading(false);
    }, 600);
  }

  // ── Submit ──
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.includes('@') &&
    emailVerified &&
    birthYear.length === 4 &&
    gender &&
    consentData &&
    (selectedTier !== 3 || consentFace);

  async function handleSubmit() {
    if (!canSubmit || !selectedTier) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      // Check duplicate email
      const { data: existing } = await supabase
        .from('research_participants')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      if (existing) {
        setSubmitError(T.error_duplicate);
        setSubmitting(false);
        return;
      }
      // Insert
      const { error } = await supabase.from('research_participants').insert({
        vorname: firstName.trim(),
        nachname: lastName.trim(),
        email: email.toLowerCase().trim(),
        geburtsjahr: parseInt(birthYear),
        geburtszeit: birthTime || null,
        geschlecht: gender,
        ort: location.trim() || null,
        nationalitaet: nationality || null,
        stufe: selectedTier,
        selfie_consent: selectedTier === 3,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;

      // Update local profile
      const discountMap = { 1: 0.10, 2: 0.20, 3: 0.30 };
      const levelMap = { 1: 'basic', 2: 'deep', 3: 'deep_selfie' } as const;
      onUpdateProfile({
        ...userProfile,
        study_participation_level: levelMap[selectedTier] as any,
        study_discount: discountMap[selectedTier],
      });
      setSuccess(true);
    } catch {
      setSubmitError(T.error_generic);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Styling helpers ──
  const bg = isLight ? 'bg-slate-50' : 'bg-[#0f0b1a]';
  const card = isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10';
  const text = isLight ? 'text-slate-800' : 'text-slate-100';
  const textSub = isLight ? 'text-slate-500' : 'text-slate-400';
  const inputCls = isLight
    ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-violet-500'
    : 'bg-white/5 border-white/10 text-slate-100 placeholder-slate-500 focus:border-violet-500';

  const tierBorder = (tier: 1 | 2 | 3) => {
    const sel = selectedTier === tier;
    if (tier === 1) return sel
      ? 'border-violet-500 bg-violet-500/10 shadow-md shadow-violet-500/10'
      : 'border-white/10 hover:border-white/20';
    if (tier === 2) return sel
      ? 'border-violet-400 bg-violet-500/15 shadow-lg shadow-violet-500/20'
      : 'border-violet-500/30 hover:border-violet-400/60';
    // tier 3
    return sel
      ? 'border-amber-400 bg-amber-500/10 shadow-xl shadow-amber-500/30 ring-1 ring-amber-400/30'
      : 'border-amber-500/40 hover:border-amber-400/70 shadow-lg shadow-amber-500/10';
  };

  const Checkbox = ({ val, setter, label, amber = false }: {
    val: boolean; setter: (v: boolean) => void; label: string; amber?: boolean;
  }) => (
    <label className="flex items-start gap-3 cursor-pointer">
      <div
        onClick={() => setter(!val)}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
          val
            ? amber ? 'bg-amber-500 border-amber-500' : 'bg-violet-600 border-violet-600'
            : isLight ? 'border-slate-300' : 'border-white/20'
        }`}
      >
        {val && <span className="material-icons text-white text-sm">check</span>}
      </div>
      <span className={`text-xs leading-relaxed ${amber ? 'text-amber-300/80' : textSub}`}>{label}</span>
    </label>
  );

  // ─── SUCCESS STATE ─────────────────────────────────────────────────────────
  if (success || alreadyJoined) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className={`fixed inset-0 z-50 overflow-y-auto ${bg}`}>
        <div className={`sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b ${isLight ? 'bg-white/90 border-slate-200' : 'bg-[#0f0b1a]/90 border-white/10'} backdrop-blur-md`}>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300'}`}>
            <span className="material-icons text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className={`font-bold text-base ${text}`}>{T.header_title}</h1>
            <p className={`text-xs ${textSub}`}>{T.header_sub}</p>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-10 flex flex-col items-center gap-4 text-center">
          <div className="text-5xl mb-2">📊</div>
          <h2 className={`font-bold text-xl ${text}`}>{T.success_title}</h2>
          <p className={`text-sm ${textSub}`}>{T.success_desc}</p>
          <div className="flex items-center justify-between w-full p-4 rounded-xl bg-green-500/10 border border-green-500/20 mt-2">
            <span className={`text-sm font-semibold ${text}`}>Dein Studienrabatt</span>
            <span className="text-green-400 font-bold text-2xl">{alreadyJoined ? currentDiscount : (selectedTier === 3 ? 30 : selectedTier === 2 ? 20 : 10)}%</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN RENDER ───────────────────────────────────────────────────────────
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={`fixed inset-0 z-50 overflow-y-auto ${bg}`}>

      {/* Header */}
      <div className={`sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b ${isLight ? 'bg-white/90 border-slate-200' : 'bg-[#0f0b1a]/90 border-white/10'} backdrop-blur-md`}>
        <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300'}`}>
          <span className="material-icons text-xl">arrow_back</span>
        </button>
        <div>
          <h1 className={`font-bold text-base ${text}`}>{T.header_title}</h1>
          <p className={`text-xs ${textSub}`}>{T.header_sub}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">

        {/* Anon Note */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-violet-500/20 bg-violet-900/20">
          <span className="material-icons text-violet-400 mt-0.5 text-xl shrink-0">science</span>
          <p className="text-violet-200 text-sm leading-relaxed">{T.anon_note}</p>
        </div>

        {/* Section title */}
        <h2 className={`text-center font-bold text-base ${text}`}>{T.section_title}</h2>

        {/* ── 3 TIER CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* TIER 1 */}
          <button
            onClick={() => setSelectedTier(1)}
            className={`p-4 rounded-xl border text-left transition-all ${tierBorder(1)}`}
          >
            <div className={`text-xs font-bold mb-1 ${selectedTier === 1 ? 'text-violet-400' : textSub}`}>{T.tier1_name}</div>
            <div className="text-green-400 font-bold text-2xl leading-none mb-1">{T.tier1_discount}</div>
            <div className={`text-[11px] text-green-400/80 mb-2`}>Rabatt</div>
            <div className={`text-xs font-semibold ${text} mb-2`}>{T.tier1_price}</div>
            <div className="space-y-1">
              {T.tier1_bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-violet-400 text-[10px] mt-0.5 shrink-0">✓</span>
                  <span className={`text-[11px] leading-tight ${textSub}`}>{b}</span>
                </div>
              ))}
            </div>
          </button>

          {/* TIER 2 */}
          <button
            onClick={() => setSelectedTier(2)}
            className={`p-4 rounded-xl border text-left transition-all ${tierBorder(2)}`}
          >
            <div className={`text-xs font-bold mb-1 ${selectedTier === 2 ? 'text-violet-300' : 'text-violet-400'}`}>{T.tier2_name}</div>
            <div className="text-green-400 font-bold text-2xl leading-none mb-1">{T.tier2_discount}</div>
            <div className={`text-[11px] text-green-400/80 mb-2`}>Rabatt</div>
            <div className={`text-xs font-semibold ${text}`}>{T.tier2_price}</div>
            <div className={`text-[10px] ${textSub} mb-2`}>{T.tier2_price_year}</div>
            <div className="space-y-1">
              {T.tier2_bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-violet-300 text-[10px] mt-0.5 shrink-0">✓</span>
                  <span className={`text-[11px] leading-tight ${textSub}`}>{b}</span>
                </div>
              ))}
            </div>
            <p className={`mt-3 text-[10px] italic ${textSub} border-t border-white/5 pt-2`}>{T.tier2_note}</p>
          </button>

          {/* TIER 3 — Empfohlen */}
          <button
            onClick={() => setSelectedTier(3)}
            className={`p-4 rounded-xl border text-left transition-all relative ${tierBorder(3)}`}
          >
            {/* Glow animation overlay */}
            {selectedTier === 3 && (
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ boxShadow: '0 0 20px 3px rgba(251,191,36,0.25)', animation: 'pulse 2s ease-in-out infinite' }} />
            )}
            {/* Empfohlen badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-[10px] font-bold shadow-md whitespace-nowrap">
              ⭐ {T.tier3_recommended}
            </div>
            <div className="text-amber-400 text-xs font-bold mb-1 mt-1">{T.tier3_name}</div>
            <div className="text-green-400 font-bold text-2xl leading-none mb-1">{T.tier3_discount}</div>
            <div className={`text-[11px] text-green-400/80 mb-2`}>Rabatt</div>
            <div className={`text-xs font-semibold ${text}`}>{T.tier3_price}</div>
            <div className={`text-[10px] ${textSub} mb-2`}>{T.tier3_price_year}</div>
            <div className="space-y-1">
              {T.tier3_bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 text-[10px] mt-0.5 shrink-0">✦</span>
                  <span className={`text-[11px] leading-tight ${textSub}`}>{b}</span>
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* ── FORM (erscheint nach Tier-Auswahl) ── */}
        {selectedTier && (
          <div className={`rounded-xl border p-5 space-y-4 ${
            selectedTier === 3
              ? 'border-amber-500/30 bg-amber-500/5'
              : selectedTier === 2
              ? 'border-violet-500/30 bg-violet-500/5'
              : card
          }`}>
            <h3 className={`font-bold text-sm ${text}`}>{T.form_title} — Stufe {selectedTier}</h3>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <input value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder={T.f_firstname}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
              <input value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder={T.f_lastname}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
            </div>

            {/* Email + Verification */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input value={email} onChange={e => { setEmail(e.target.value); setEmailVerified(false); setCodeSent(false); }}
                    placeholder={T.f_email} type="email"
                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls} ${emailVerified ? 'border-green-500' : ''}`} />
                  {emailVerified && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">✓</span>
                  )}
                </div>
                {!emailVerified && (
                  <button
                    onClick={codeSent ? () => { setCodeSent(false); handleSendCode(); } : handleSendCode}
                    disabled={!email.includes('@') || verifyLoading}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 whitespace-nowrap transition-colors"
                  >
                    {verifyLoading ? '…' : codeSent ? T.verify_resend : T.verify_send}
                  </button>
                )}
              </div>
              {emailVerified && (
                <p className="text-green-400 text-xs">{T.verify_ok}</p>
              )}
              {codeSent && !emailVerified && (
                <div className="space-y-1">
                  <p className={`text-xs ${textSub}`}>{T.verify_sent}{email}</p>
                  <div className="flex gap-2">
                    <input value={verifyInput} onChange={e => setVerifyInput(e.target.value)}
                      placeholder={T.verify_placeholder} maxLength={6}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
                    <button onClick={handleVerifyCode} disabled={verifyInput.length !== 6 || verifyLoading}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 transition-colors">
                      {verifyLoading ? '…' : 'OK'}
                    </button>
                  </div>
                  {verifyError && <p className="text-red-400 text-xs">{verifyError}</p>}
                </div>
              )}
            </div>

            {/* Geburtsjahr + Geschlecht */}
            <div className="grid grid-cols-2 gap-3">
              <input value={birthYear} onChange={e => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={T.f_birthyear} maxLength={4}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
              <select value={gender} onChange={e => setGender(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`}>
                <option value="">{T.f_gender}</option>
                {T.gender_options.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Geburtszeit (optional) */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs ${textSub}`}>{T.f_birthtime}</span>
                <span className={`text-[10px] ${textSub} italic`}>— {T.f_birthtime_hint}</span>
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="material-icons text-slate-500 text-sm cursor-help">info</button>
                  {showTooltip && (
                    <div className="absolute bottom-6 left-0 w-48 p-2 rounded-lg bg-slate-800 border border-white/10 text-[10px] text-slate-300 z-10 shadow-xl leading-relaxed">
                      {T.f_birthtime_tooltip}
                    </div>
                  )}
                </div>
              </div>
              <input value={birthTime} onChange={e => setBirthTime(e.target.value)}
                type="time"
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
            </div>

            {/* Ort + Nationalität */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder={locationLoading ? T.location_loading : T.f_location}
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
                {locationLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-icons text-violet-400 text-sm animate-spin">refresh</span>
                )}
              </div>
              <select value={nationality} onChange={e => setNationality(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`}>
                <option value="">{T.f_nationality}</option>
                {NATIONALITIES_DE.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-1">
              <Checkbox val={consentData} setter={setConsentData} label={T.consent_data} />
              <Checkbox val={consentName} setter={setConsentName} label={T.consent_name} />
              {selectedTier === 3 && (
                <Checkbox val={consentFace} setter={setConsentFace} label={T.consent_face} amber />
              )}
            </div>

            {submitError && (
              <p className="text-red-400 text-xs">{submitError}</p>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                canSubmit && !submitting
                  ? selectedTier === 3
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:opacity-90 shadow-lg shadow-amber-500/20'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20'
                  : isLight ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              {submitting ? T.submitting : selectedTier === 1 ? T.submit_btn : T.submit_deep}
            </button>

            {/* Email verification hint */}
            {!emailVerified && (
              <p className={`text-center text-[11px] ${textSub}`}>
                {T.verify_send + ' erforderlich bevor Teilnahme abgeschlossen werden kann'}
              </p>
            )}
          </div>
        )}

        {/* Cost Transparency */}
        <div className={`rounded-xl border p-5 ${card}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons text-amber-400 text-xl">info</span>
            <h2 className={`font-bold text-base ${text}`}>{T.cost_title}</h2>
          </div>
          <p className={`text-xs mb-4 ${textSub}`}>{T.cost_intro}</p>
          <div className="space-y-2 mb-4">
            {/* Table Header */}
            <div className={`grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-wider pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
              <span className={textSub}>Feature</span>
              <span className={`text-right ${textSub}`}>Marktpreis</span>
              <span className="text-right text-violet-400">DreamCode</span>
            </div>
            {/* Table Rows */}
            {(T.cost_items as Array<{feature: string; market: string; model: string; dc: string}>).map((item, i) => (
              <div key={i} className={`grid grid-cols-3 gap-2 py-1.5 text-xs ${i < (T.cost_items as unknown[]).length - 1 ? (isLight ? 'border-b border-slate-100' : 'border-b border-white/5') : ''}`}>
                <span className={`font-medium ${text}`}>{item.feature}</span>
                <div className="text-right">
                  <span className={textSub}>{item.market}</span>
                  <span className={`block text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>{item.model}</span>
                </div>
                <span className="text-right font-bold text-violet-400">{item.dc}</span>
              </div>
            ))}
          </div>
          <p className={`text-[11px] ${textSub} italic border-t pt-3 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
            {T.cost_footer}
          </p>
        </div>

      </div>
    </div>
  );
};

export default StudyPage;
