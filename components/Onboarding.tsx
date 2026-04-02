import React, { useState } from 'react';
import { Language, UserProfile, SubscriptionTier, ThemeMode } from '../types';
import { getTheme } from '../theme';

// ─── Props ────────────────────────────────────────────────────────────────────

interface OnboardingProps {
    language: Language;
    initialData: UserProfile | null;
    onComplete: (profile: UserProfile) => void;
    onClose: () => void;
    themeMode?: ThemeMode;
}

// ─── Local data ───────────────────────────────────────────────────────────────

type OBLang = Record<Language, string>;

const T: Record<string, Record<Language, string>> = {
    title:       { en: 'DreamApp', de: 'DreamApp', tr: 'DreamApp', ar: 'DreamApp', es: 'DreamApp', fr: 'DreamApp', pt: 'DreamApp', ru: 'DreamApp' },
    subtitle:    { en: 'Dreamy AI — Your personal dream guide', de: 'Dreamy AI — Dein persönlicher Traumführer', tr: 'Dreamy AI — Kişisel rüya rehberin', ar: 'Dreamy AI — مرشدك الشخصي للأحلام', es: 'Dreamy AI — Tu guía personal de sueños', fr: 'Dreamy AI — Ton guide personnel des rêves', pt: 'Dreamy AI — Seu guia pessoal de sonhos', ru: 'Dreamy AI — Твой личный гид по снам' },
    step_of:     { en: 'Step {n} of 5', de: 'Schritt {n} von 5', tr: 'Adım {n} / 5', ar: 'الخطوة {n} من 5', es: 'Paso {n} de 5', fr: 'Étape {n} sur 5', pt: 'Passo {n} de 5', ru: 'Шаг {n} из 5' },
    btn_next:    { en: 'Continue', de: 'Weiter', tr: 'Devam', ar: 'متابعة', es: 'Continuar', fr: 'Continuer', pt: 'Continuar', ru: 'Продолжить' },
    btn_back:    { en: 'Back', de: 'Zurück', tr: 'Geri', ar: 'رجوع', es: 'Atrás', fr: 'Retour', pt: 'Voltar', ru: 'Назад' },
    btn_finish:  { en: 'Get started', de: 'Loslegen', tr: 'Başla', ar: 'ابدأ', es: 'Empezar', fr: 'Commencer', pt: 'Começar', ru: 'Начать' },
    btn_skip:    { en: 'Skip', de: 'Überspringen', tr: 'Atla', ar: 'تخطى', es: 'Omitir', fr: 'Passer', pt: 'Pular', ru: 'Пропустить' },
    close:       { en: 'Close', de: 'Schließen', tr: 'Kapat', ar: 'إغلاق', es: 'Cerrar', fr: 'Fermer', pt: 'Fechar', ru: 'Закрыть' },
    select_hint: { en: 'Select all that apply', de: 'Alle zutreffenden auswählen', tr: 'Uygun olanları seçin', ar: 'اختر كل ما ينطبق', es: 'Selecciona todo lo que aplique', fr: 'Sélectionne tout ce qui s\'applique', pt: 'Selecione tudo que se aplica', ru: 'Выберите все подходящее' },

    // Step 1
    s1_title:    { en: 'Your life context', de: 'Dein Lebenskontext', tr: 'Yaşam bağlamın', ar: 'سياق حياتك', es: 'Tu contexto de vida', fr: 'Ton contexte de vie', pt: 'Seu contexto de vida', ru: 'Контекст твоей жизни' },
    s1_desc:     { en: 'Select any challenges you\'re currently facing. This helps Dreamy AI understand your dreams better.', de: 'Wähle aktuelle Herausforderungen. Das hilft Dreamy AI, deine Träume besser zu verstehen.', tr: 'Şu anda yaşadığın zorlukları seçin. Bu, Dreamy AI\'nın rüyalarını daha iyi anlamasına yardımcı olur.', ar: 'اختر التحديات التي تواجهها حالياً. يساعد هذا Dreamy AI على فهم أحلامك بشكل أفضل.', es: 'Selecciona los desafíos actuales. Esto ayuda a Dreamy AI a entender mejor tus sueños.', fr: 'Sélectionne tes défis actuels. Cela aide Dreamy AI à mieux comprendre tes rêves.', pt: 'Selecione os desafios atuais. Isso ajuda o Dreamy AI a entender melhor seus sonhos.', ru: 'Выбери текущие трудности. Это поможет Dreamy AI лучше понять твои сны.' },
    c_substance: { en: 'Substance abuse', de: 'Substanzmissbrauch', tr: 'Madde bağımlılığı', ar: 'إساءة استخدام المواد', es: 'Abuso de sustancias', fr: 'Abus de substances', pt: 'Abuso de substâncias', ru: 'Злоупотребление веществами' },
    c_trauma:    { en: 'Trauma / PTSD', de: 'Trauma / PTBS', tr: 'Travma / TSSB', ar: 'صدمة / اضطراب ما بعد الصدمة', es: 'Trauma / TEPT', fr: 'Trauma / SSPT', pt: 'Trauma / PTSD', ru: 'Травма / ПТСР' },
    c_health:    { en: 'Health issues', de: 'Gesundheitsprobleme', tr: 'Sağlık sorunları', ar: 'مشاكل صحية', es: 'Problemas de salud', fr: 'Problèmes de santé', pt: 'Problemas de saúde', ru: 'Проблемы со здоровьем' },
    c_relation:  { en: 'Relationship issues', de: 'Beziehungsprobleme', tr: 'İlişki sorunları', ar: 'مشاكل في العلاقات', es: 'Problemas de relaciones', fr: 'Problèmes relationnels', pt: 'Problemas de relacionamento', ru: 'Проблемы в отношениях' },
    c_grief:     { en: 'Loss / Grief', de: 'Verlust / Trauer', tr: 'Kayıp / Yas', ar: 'خسارة / حزن', es: 'Pérdida / Duelo', fr: 'Perte / Deuil', pt: 'Perda / Luto', ru: 'Потеря / Горе' },
    c_work:      { en: 'Professional stress', de: 'Beruflicher Stress', tr: 'İş stresi', ar: 'ضغط مهني', es: 'Estrés laboral', fr: 'Stress professionnel', pt: 'Estresse profissional', ru: 'Профессиональный стресс' },
    c_finance:   { en: 'Financial worries', de: 'Finanzielle Sorgen', tr: 'Finansal endişeler', ar: 'قلق مالي', es: 'Preocupaciones financieras', fr: 'Soucis financiers', pt: 'Preocupações financeiras', ru: 'Финансовые заботы' },
    c_change:    { en: 'Relocation / Change', de: 'Umsiedlung / Veränderung', tr: 'Göç / Değişim', ar: 'انتقال / تغيير', es: 'Reubicación / Cambio', fr: 'Déménagement / Changement', pt: 'Realocação / Mudança', ru: 'Переезд / Изменения' },
    c_other:     { en: 'Other', de: 'Andere', tr: 'Diğer', ar: 'أخرى', es: 'Otro', fr: 'Autre', pt: 'Outro', ru: 'Другое' },
    c_none:      { en: 'None', de: 'Keiner', tr: 'Hiçbiri', ar: 'لا شيء', es: 'Ninguno', fr: 'Aucun', pt: 'Nenhum', ru: 'Ничего' },

    // Step 2
    s2_title:    { en: 'Negative feelings on waking', de: 'Negative Gefühle nach dem Aufwachen', tr: 'Uyanışta olumsuz duygular', ar: 'مشاعر سلبية عند الاستيقاظ', es: 'Sentimientos negativos al despertar', fr: 'Sentiments négatifs au réveil', pt: 'Sentimentos negativos ao acordar', ru: 'Негативные ощущения при пробуждении' },
    s2_desc:     { en: 'How often do you experience negative feelings after waking up?', de: 'Wie oft erlebst du negative Gefühle nach dem Aufwachen?', tr: 'Uyanmanın ardından ne sıklıkla olumsuz duygular yaşıyorsun?', ar: 'كم مرة تشعر بمشاعر سلبية بعد الاستيقاظ؟', es: '¿Con qué frecuencia experimentas sentimientos negativos después de despertar?', fr: 'À quelle fréquence ressens-tu des émotions négatives après le réveil ?', pt: 'Com que frequência você tem sentimentos negativos ao acordar?', ru: 'Как часто ты испытываешь негативные ощущения после пробуждения?' },
    f_never:     { en: 'Never', de: 'Nie', tr: 'Hiçbir zaman', ar: 'أبداً', es: 'Nunca', fr: 'Jamais', pt: 'Nunca', ru: 'Никогда' },
    f_rarely:    { en: 'Rarely', de: 'Selten', tr: 'Nadiren', ar: 'نادراً', es: 'Raramente', fr: 'Rarement', pt: 'Raramente', ru: 'Редко' },
    f_sometimes: { en: 'Sometimes', de: 'Manchmal', tr: 'Bazen', ar: 'أحياناً', es: 'A veces', fr: 'Parfois', pt: 'Às vezes', ru: 'Иногда' },
    f_often:     { en: 'Often', de: 'Oft', tr: 'Sık sık', ar: 'كثيراً', es: 'A menudo', fr: 'Souvent', pt: 'Frequentemente', ru: 'Часто' },
    f_always:    { en: 'Always', de: 'Immer', tr: 'Her zaman', ar: 'دائماً', es: 'Siempre', fr: 'Toujours', pt: 'Sempre', ru: 'Всегда' },

    // Step 3
    s3_title:    { en: 'Your motivation', de: 'Deine Motivation', tr: 'Motivasyonun', ar: 'دوافعك', es: 'Tu motivación', fr: 'Ta motivation', pt: 'Sua motivação', ru: 'Твоя мотивация' },
    s3_desc:     { en: 'Why do you want to use DreamApp?', de: 'Warum möchtest du die DreamApp nutzen?', tr: 'DreamApp\'i neden kullanmak istiyorsun?', ar: 'لماذا تريد استخدام DreamApp؟', es: '¿Por qué quieres usar DreamApp?', fr: 'Pourquoi veux-tu utiliser DreamApp ?', pt: 'Por que você quer usar o DreamApp?', ru: 'Зачем тебе DreamApp?' },
    m_subcon:    { en: 'Understand my subconscious', de: 'Unterbewusstsein verstehen', tr: 'Bilinçaltımı anlamak', ar: 'فهم اللاوعي', es: 'Entender mi subconsciente', fr: 'Comprendre mon subconscient', pt: 'Entender meu subconsciente', ru: 'Понять своё подсознание' },
    m_memory:    { en: 'Improve dream recall', de: 'Traumerinnerung verbessern', tr: 'Rüya hatırlama geliştirme', ar: 'تحسين استرجاع الأحلام', es: 'Mejorar el recuerdo de sueños', fr: 'Améliorer le souvenir des rêves', pt: 'Melhorar a lembrança dos sonhos', ru: 'Улучшить память на сны' },
    m_mental:    { en: 'Mental health & wellbeing', de: 'Psychische Gesundheit', tr: 'Ruh sağlığı', ar: 'الصحة النفسية', es: 'Salud mental y bienestar', fr: 'Santé mentale et bien-être', pt: 'Saúde mental e bem-estar', ru: 'Психическое здоровье' },
    m_nightmare: { en: 'Cope with nightmares', de: 'Alpträume bewältigen', tr: 'Kabuslarla başa çıkmak', ar: 'التعامل مع الكوابيس', es: 'Hacer frente a las pesadillas', fr: 'Gérer les cauchemars', pt: 'Lidar com pesadelos', ru: 'Справляться с кошмарами' },

    // Step 4
    s4_title:    { en: 'Dream symbols', de: 'Traumsymbole', tr: 'Rüya sembolleri', ar: 'رموز الأحلام', es: 'Símbolos de sueños', fr: 'Symboles de rêves', pt: 'Símbolos de sonhos', ru: 'Символы снов' },
    s4_desc:     { en: 'Choose up to 5 symbols that appear in your dreams', de: 'Wähle bis zu 5 Symbole, die in deinen Träumen vorkommen', tr: 'Rüyalarında görünen en fazla 5 sembol seç', ar: 'اختر حتى 5 رموز تظهر في أحلامك', es: 'Elige hasta 5 símbolos que aparecen en tus sueños', fr: 'Choisis jusqu\'à 5 symboles qui apparaissent dans tes rêves', pt: 'Escolha até 5 símbolos que aparecem em seus sonhos', ru: 'Выбери до 5 символов, которые встречаются в твоих снах' },
    s4_hint:     { en: 'Selected: {n}/5', de: 'Ausgewählt: {n}/5', tr: 'Seçilen: {n}/5', ar: 'المحدد: {n}/5', es: 'Seleccionados: {n}/5', fr: 'Sélectionnés : {n}/5', pt: 'Selecionados: {n}/5', ru: 'Выбрано: {n}/5' },

    // Step 5
    s5_title:    { en: 'Dream interpretation', de: 'Traumdeutung', tr: 'Rüya yorumu', ar: 'تفسير الأحلام', es: 'Interpretación de sueños', fr: 'Interprétation des rêves', pt: 'Interpretação de sonhos', ru: 'Толкование снов' },
    s5_statement:{ en: 'I often have trouble interpreting my dreams', de: 'Ich habe oft Probleme mit der Interpretation meiner Träume', tr: 'Rüyalarımı yorumlamakta sıkça zorlanıyorum', ar: 'كثيراً ما أجد صعوبة في تفسير أحلامي', es: 'A menudo tengo dificultades para interpretar mis sueños', fr: 'J\'ai souvent du mal à interpréter mes rêves', pt: 'Muitas vezes tenho dificuldades para interpretar meus sonhos', ru: 'Мне часто сложно интерпретировать свои сны' },
    s5_yes:      { en: 'Yes, I need help', de: 'Ja, ich brauche Hilfe', tr: 'Evet, yardıma ihtiyacım var', ar: 'نعم، أحتاج مساعدة', es: 'Sí, necesito ayuda', fr: 'Oui, j\'ai besoin d\'aide', pt: 'Sim, preciso de ajuda', ru: 'Да, мне нужна помощь' },
    s5_no:       { en: 'No, I manage fine', de: 'Nein, ich komme klar', tr: 'Hayır, başarıyorum', ar: 'لا، أتعامل معها بشكل جيد', es: 'No, me arreglo bien', fr: 'Non, je me débrouille', pt: 'Não, me viro bem', ru: 'Нет, я справляюсь' },
};

function t(key: string, lang: Language, vars?: Record<string, string | number>): string {
    let val = T[key]?.[lang] ?? T[key]?.['en'] ?? key;
    if (vars) {
        Object.entries(vars).forEach(([k, v]) => { val = val.replace(`{${k}}`, String(v)); });
    }
    return val;
}

// Symbol list (language-agnostic keys with translations)
const SYMBOL_KEYS = [
    'airplane','attack','baby','beach','blood','boat','boy','friend','brother','car',
    'chased','cheating','child','church','clothes','death','dog','falling','fire',
    'flying','forest','house','key','moon','mountain','ocean','snake','spider','star','water',
];
const SYMBOL_LABELS: Record<string, OBLang> = {
    airplane:  { en: 'Airplane', de: 'Flugzeug', tr: 'Uçak', ar: 'طائرة', es: 'Avión', fr: 'Avion', pt: 'Avião', ru: 'Самолёт' },
    attack:    { en: 'Attack', de: 'Angriff', tr: 'Saldırı', ar: 'هجوم', es: 'Ataque', fr: 'Attaque', pt: 'Ataque', ru: 'Нападение' },
    baby:      { en: 'Baby', de: 'Baby', tr: 'Bebek', ar: 'طفل رضيع', es: 'Bebé', fr: 'Bébé', pt: 'Bebê', ru: 'Младенец' },
    beach:     { en: 'Beach', de: 'Strand', tr: 'Sahil', ar: 'شاطئ', es: 'Playa', fr: 'Plage', pt: 'Praia', ru: 'Пляж' },
    blood:     { en: 'Blood', de: 'Blut', tr: 'Kan', ar: 'دم', es: 'Sangre', fr: 'Sang', pt: 'Sangue', ru: 'Кровь' },
    boat:      { en: 'Boat', de: 'Boot', tr: 'Tekne', ar: 'قارب', es: 'Barco', fr: 'Bateau', pt: 'Barco', ru: 'Лодка' },
    boy:       { en: 'Boy', de: 'Junge', tr: 'Erkek çocuk', ar: 'ولد', es: 'Chico', fr: 'Garçon', pt: 'Menino', ru: 'Мальчик' },
    friend:    { en: 'Friend', de: 'Freund', tr: 'Arkadaş', ar: 'صديق', es: 'Amigo', fr: 'Ami', pt: 'Amigo', ru: 'Друг' },
    brother:   { en: 'Brother', de: 'Bruder', tr: 'Erkek kardeş', ar: 'أخ', es: 'Hermano', fr: 'Frère', pt: 'Irmão', ru: 'Брат' },
    car:       { en: 'Car', de: 'Auto', tr: 'Araba', ar: 'سيارة', es: 'Coche', fr: 'Voiture', pt: 'Carro', ru: 'Машина' },
    chased:    { en: 'Being chased', de: 'Verfolgt werden', tr: 'Kovalanmak', ar: 'الملاحقة', es: 'Ser perseguido', fr: 'Être poursuivi', pt: 'Ser perseguido', ru: 'Погоня' },
    cheating:  { en: 'Cheating', de: 'Schummeln', tr: 'Aldatma', ar: 'الغش', es: 'Engañar', fr: 'Tricher', pt: 'Traição', ru: 'Измена' },
    child:     { en: 'Child', de: 'Kind', tr: 'Çocuk', ar: 'طفل', es: 'Niño', fr: 'Enfant', pt: 'Criança', ru: 'Ребёнок' },
    church:    { en: 'Church', de: 'Kirche', tr: 'Kilise', ar: 'كنيسة', es: 'Iglesia', fr: 'Église', pt: 'Igreja', ru: 'Церковь' },
    clothes:   { en: 'Clothes', de: 'Kleidung', tr: 'Kıyafet', ar: 'ملابس', es: 'Ropa', fr: 'Vêtements', pt: 'Roupas', ru: 'Одежда' },
    death:     { en: 'Death', de: 'Tod', tr: 'Ölüm', ar: 'موت', es: 'Muerte', fr: 'Mort', pt: 'Morte', ru: 'Смерть' },
    dog:       { en: 'Dog', de: 'Hund', tr: 'Köpek', ar: 'كلب', es: 'Perro', fr: 'Chien', pt: 'Cachorro', ru: 'Собака' },
    falling:   { en: 'Falling', de: 'Fallen', tr: 'Düşmek', ar: 'السقوط', es: 'Caída', fr: 'Tomber', pt: 'Cair', ru: 'Падение' },
    fire:      { en: 'Fire', de: 'Feuer', tr: 'Ateş', ar: 'نار', es: 'Fuego', fr: 'Feu', pt: 'Fogo', ru: 'Огонь' },
    flying:    { en: 'Flying', de: 'Fliegen', tr: 'Uçmak', ar: 'الطيران', es: 'Volar', fr: 'Voler', pt: 'Voar', ru: 'Полёт' },
    forest:    { en: 'Forest', de: 'Wald', tr: 'Orman', ar: 'غابة', es: 'Bosque', fr: 'Forêt', pt: 'Floresta', ru: 'Лес' },
    house:     { en: 'House', de: 'Haus', tr: 'Ev', ar: 'منزل', es: 'Casa', fr: 'Maison', pt: 'Casa', ru: 'Дом' },
    key:       { en: 'Key', de: 'Schlüssel', tr: 'Anahtar', ar: 'مفتاح', es: 'Llave', fr: 'Clé', pt: 'Chave', ru: 'Ключ' },
    moon:      { en: 'Moon', de: 'Mond', tr: 'Ay', ar: 'قمر', es: 'Luna', fr: 'Lune', pt: 'Lua', ru: 'Луна' },
    mountain:  { en: 'Mountain', de: 'Berg', tr: 'Dağ', ar: 'جبل', es: 'Montaña', fr: 'Montagne', pt: 'Montanha', ru: 'Гора' },
    ocean:     { en: 'Ocean', de: 'Ozean', tr: 'Okyanus', ar: 'محيط', es: 'Océano', fr: 'Océan', pt: 'Oceano', ru: 'Океан' },
    snake:     { en: 'Snake', de: 'Schlange', tr: 'Yılan', ar: 'أفعى', es: 'Serpiente', fr: 'Serpent', pt: 'Cobra', ru: 'Змея' },
    spider:    { en: 'Spider', de: 'Spinne', tr: 'Örümcek', ar: 'عنكبوت', es: 'Araña', fr: 'Araignée', pt: 'Aranha', ru: 'Паук' },
    star:      { en: 'Star', de: 'Stern', tr: 'Yıldız', ar: 'نجمة', es: 'Estrella', fr: 'Étoile', pt: 'Estrela', ru: 'Звезда' },
    water:     { en: 'Water', de: 'Wasser', tr: 'Su', ar: 'ماء', es: 'Agua', fr: 'Eau', pt: 'Água', ru: 'Вода' },
};
const SYMBOL_EMOJIS: Record<string, string> = {
    airplane: '✈️', attack: '⚔️', baby: '👶', beach: '🏖️', blood: '🩸',
    boat: '⛵', boy: '👦', friend: '🤝', brother: '👨‍👦', car: '🚗',
    chased: '🏃', cheating: '🎭', child: '🧒', church: '⛪', clothes: '👗',
    death: '💀', dog: '🐕', falling: '🌊', fire: '🔥', flying: '🕊️',
    forest: '🌲', house: '🏠', key: '🗝️', moon: '🌙', mountain: '⛰️',
    ocean: '🌊', snake: '🐍', spider: '🕷️', star: '⭐', water: '💧',
};

// Life context options
const LIFE_CONTEXT_KEYS = [
    { key: 'c_substance', id: 'substance', emoji: '💊' },
    { key: 'c_trauma',    id: 'trauma',    emoji: '🧠' },
    { key: 'c_health',    id: 'health',    emoji: '🏥' },
    { key: 'c_relation',  id: 'relation',  emoji: '💔' },
    { key: 'c_grief',     id: 'grief',     emoji: '🕯️' },
    { key: 'c_work',      id: 'work',      emoji: '💼' },
    { key: 'c_finance',   id: 'finance',   emoji: '💸' },
    { key: 'c_change',    id: 'change',    emoji: '🌍' },
    { key: 'c_other',     id: 'other',     emoji: '📌' },
    { key: 'c_none',      id: 'none',      emoji: '✨' },
];

const FREQ_OPTIONS = [
    { key: 'f_never',    id: 'never',    icon: '😌' },
    { key: 'f_rarely',   id: 'rarely',   icon: '🙂' },
    { key: 'f_sometimes',id: 'sometimes',icon: '😐' },
    { key: 'f_often',    id: 'often',    icon: '😔' },
    { key: 'f_always',   id: 'always',   icon: '😰' },
];

const MOTIVATION_OPTIONS = [
    { key: 'm_subcon',    id: 'subcon',    emoji: '🔮' },
    { key: 'm_memory',    id: 'memory',    emoji: '📖' },
    { key: 'm_mental',    id: 'mental',    emoji: '🌿' },
    { key: 'm_nightmare', id: 'nightmare', emoji: '🌑' },
];

// ─── Collected data shape ─────────────────────────────────────────────────────

interface OnboardingData {
    lifeStressors: string[];
    negativeFeelingFreq: string;
    motivations: string[];
    dreamSymbols: string[];
    interpretationHelp: boolean | null;
}

// ─── RTL languages ────────────────────────────────────────────────────────────

const RTL_LANGS = new Set<Language>([Language.AR]);
function isRtl(lang: Language) { return RTL_LANGS.has(lang); }

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressDots({ step, total }: { step: number; total: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mt-2 mb-1">
            {Array.from({ length: total }).map((_, i) => (
                <span
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                        i < step
                            ? 'w-6 h-2 bg-fuchsia-500'
                            : i === step
                            ? 'w-6 h-2 bg-fuchsia-400 shadow-[0_0_8px_2px_rgba(217,70,239,0.5)]'
                            : 'w-2 h-2 bg-white/20'
                    }`}
                />
            ))}
        </div>
    );
}

function ChoiceChip({
    label,
    emoji,
    selected,
    onClick,
    disabled,
}: {
    label: string;
    emoji?: string;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled && !selected}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400
                ${selected
                    ? 'bg-fuchsia-600/80 border-fuchsia-400 text-white shadow-[0_0_10px_2px_rgba(217,70,239,0.35)]'
                    : disabled
                    ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:border-fuchsia-500/40 active:scale-95'
                }`}
        >
            {emoji && <span>{emoji}</span>}
            <span>{label}</span>
            {selected && (
                <span className="ms-auto text-fuchsia-200 text-xs">✓</span>
            )}
        </button>
    );
}

function SingleChoiceCard({
    label,
    icon,
    selected,
    onClick,
}: {
    label: string;
    icon: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 active:scale-[0.98]
                ${selected
                    ? 'bg-fuchsia-600/70 border-fuchsia-400 text-white shadow-[0_0_12px_2px_rgba(217,70,239,0.3)]'
                    : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:border-fuchsia-500/40'
                }`}
        >
            <span className="text-xl w-7 flex-shrink-0 text-center">{icon}</span>
            <span className="text-start">{label}</span>
            {selected && <span className="ms-auto text-fuchsia-200">●</span>}
        </button>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Onboarding: React.FC<OnboardingProps> = ({ language, initialData, onComplete, onClose, themeMode }) => {
    const th = getTheme(themeMode || ThemeMode.DARK);
    const lang = language ?? Language.EN;
    const rtl = isRtl(lang);
    const dir = rtl ? 'rtl' : 'ltr';

    const TOTAL_STEPS = 5;
    const [step, setStep] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');

    const [data, setData] = useState<OnboardingData>({
        lifeStressors: initialData?.lifeStressors ?? [],
        negativeFeelingFreq: initialData?.negativeFeelingFreq ?? '',
        motivations: [],
        dreamSymbols: [],
        interpretationHelp: null,
    });

    // ── navigation ──────────────────────────────────────────────────────────

    function navigate(nextStep: number, dir: 'forward' | 'back') {
        if (animating) return;
        setDirection(dir);
        setAnimating(true);
        setTimeout(() => {
            setStep(nextStep);
            setAnimating(false);
        }, 220);
    }

    function goNext() {
        if (step < TOTAL_STEPS - 1) navigate(step + 1, 'forward');
        else finish();
    }
    function goBack() {
        if (step > 0) navigate(step - 1, 'back');
    }

    function finish() {
        const base: UserProfile = {
            name: initialData?.name ?? '',
            interests: initialData?.interests ?? [],
            subscriptionTier: initialData?.subscriptionTier ?? SubscriptionTier.FREE,
            credits: initialData?.credits ?? 100,
            ...(initialData ?? {}),
            lifeStressors: data.lifeStressors,
            negativeFeelingFreq: data.negativeFeelingFreq,
            isComplete: true,
        };
        onComplete(base);
    }

    // ── step validation (loose — user may skip) ──────────────────────────────
    function canProceed(): boolean {
        return true; // all steps optional
    }

    // ── toggle helpers ───────────────────────────────────────────────────────

    function toggleStressor(id: string) {
        setData(prev => {
            if (id === 'none') return { ...prev, lifeStressors: prev.lifeStressors.includes('none') ? [] : ['none'] };
            const without_none = prev.lifeStressors.filter(x => x !== 'none');
            return {
                ...prev,
                lifeStressors: without_none.includes(id)
                    ? without_none.filter(x => x !== id)
                    : [...without_none, id],
            };
        });
    }

    function toggleMotivation(id: string) {
        setData(prev => ({
            ...prev,
            motivations: prev.motivations.includes(id)
                ? prev.motivations.filter(x => x !== id)
                : [...prev.motivations, id],
        }));
    }

    function toggleSymbol(key: string) {
        setData(prev => {
            if (prev.dreamSymbols.includes(key)) return { ...prev, dreamSymbols: prev.dreamSymbols.filter(x => x !== key) };
            if (prev.dreamSymbols.length >= 5) return prev;
            return { ...prev, dreamSymbols: [...prev.dreamSymbols, key] };
        });
    }

    // ── slide animation classes ──────────────────────────────────────────────

    const slideClass = animating
        ? direction === 'forward'
            ? 'opacity-0 translate-x-4'
            : 'opacity-0 -translate-x-4'
        : 'opacity-100 translate-x-0';

    // ── render step content ──────────────────────────────────────────────────

    function renderStep() {
        switch (step) {
            case 0: return (
                <div>
                    <p className={`${th.isLight ? "text-[#4a3a5d]" : "text-white/60"} text-sm mb-4`}>{t('select_hint', lang)}</p>
                    <div className="flex flex-wrap gap-2">
                        {LIFE_CONTEXT_KEYS.map(({ key, id, emoji }) => (
                            <ChoiceChip
                                key={id}
                                label={t(key, lang)}
                                emoji={emoji}
                                selected={data.lifeStressors.includes(id)}
                                onClick={() => toggleStressor(id)}
                            />
                        ))}
                    </div>
                </div>
            );

            case 1: return (
                <div className="flex flex-col gap-3">
                    {FREQ_OPTIONS.map(({ key, id, icon }) => (
                        <SingleChoiceCard
                            key={id}
                            label={t(key, lang)}
                            icon={icon}
                            selected={data.negativeFeelingFreq === id}
                            onClick={() => setData(prev => ({ ...prev, negativeFeelingFreq: id }))}
                        />
                    ))}
                </div>
            );

            case 2: return (
                <div>
                    <p className={`${th.isLight ? "text-[#4a3a5d]" : "text-white/60"} text-sm mb-4`}>{t('select_hint', lang)}</p>
                    <div className="flex flex-col gap-3">
                        {MOTIVATION_OPTIONS.map(({ key, id, emoji }) => (
                            <ChoiceChip
                                key={id}
                                label={t(key, lang)}
                                emoji={emoji}
                                selected={data.motivations.includes(id)}
                                onClick={() => toggleMotivation(id)}
                            />
                        ))}
                    </div>
                </div>
            );

            case 3: return (
                <div>
                    <p className={`${th.isLight ? "text-[#4a3a5d]" : "text-white/60"} text-sm mb-3`}>
                        {t('s4_hint', lang, { n: data.dreamSymbols.length })}
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1
                        [&::-webkit-scrollbar]:w-1
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-fuchsia-700/50">
                        {SYMBOL_KEYS.map(key => (
                            <ChoiceChip
                                key={key}
                                label={SYMBOL_LABELS[key]?.[lang] ?? SYMBOL_LABELS[key]?.['en'] ?? key}
                                emoji={SYMBOL_EMOJIS[key]}
                                selected={data.dreamSymbols.includes(key)}
                                disabled={data.dreamSymbols.length >= 5}
                                onClick={() => toggleSymbol(key)}
                            />
                        ))}
                    </div>
                </div>
            );

            case 4: return (
                <div>
                    <div className="mb-6 p-4 rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/30">
                        <p className={`${th.textPrimary} text-base font-medium leading-relaxed text-center`}>
                            "{t('s5_statement', lang)}"
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => setData(prev => ({ ...prev, interpretationHelp: true }))}
                            className={`w-full py-4 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-[0.98]
                                ${data.interpretationHelp === true
                                    ? 'bg-fuchsia-600/70 border-fuchsia-400 text-white shadow-[0_0_12px_2px_rgba(217,70,239,0.3)]'
                                    : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:border-fuchsia-500/40'
                                }`}
                        >
                            {t('s5_yes', lang)}
                        </button>
                        <button
                            type="button"
                            onClick={() => setData(prev => ({ ...prev, interpretationHelp: false }))}
                            className={`w-full py-4 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-[0.98]
                                ${data.interpretationHelp === false
                                    ? 'bg-violet-600/70 border-violet-400 text-white shadow-[0_0_12px_2px_rgba(139,92,246,0.3)]'
                                    : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:border-violet-500/40'
                                }`}
                        >
                            {t('s5_no', lang)}
                        </button>
                    </div>
                </div>
            );

            default: return null;
        }
    }

    const stepTitles = ['s1_title', 's2_title', 's3_title', 's4_title', 's5_title'];
    const stepDescs  = ['s1_desc',  's2_desc',  's3_desc',  's4_desc',  's5_title'];

    // ── render ───────────────────────────────────────────────────────────────

    return (
        <div
            dir={dir}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: th.isLight ? 'rgba(240,238,252,0.95)' : 'rgba(10,8,26,0.92)', backdropFilter: 'blur(12px)' }}
        >
            {/* Stars decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
                {[...Array(30)].map((_, i) => (
                    <span
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            width:  Math.random() * 2 + 1 + 'px',
                            height: Math.random() * 2 + 1 + 'px',
                            top:    Math.random() * 100 + '%',
                            left:   Math.random() * 100 + '%',
                            opacity: Math.random() * 0.5 + 0.1,
                        }}
                    />
                ))}
            </div>

            {/* Modal card */}
            <div
                className={`relative w-full max-w-md rounded-2xl border ${th.isLight ? 'border-[#c4bce6]' : 'border-white/10'} shadow-2xl flex flex-col`}
                style={{
                    background: th.isLight ? 'linear-gradient(160deg, #fdfbff 0%, #f0eefc 60%, #e8e4f8 100%)' : 'linear-gradient(160deg, #130b2b 0%, #0f0b1a 60%, #1a0a2e 100%)',
                    maxHeight: 'min(90dvh, 700px)',
                }}
            >
                {/* Header */}
                <div className={`px-5 pt-5 pb-3 border-b ${th.border} flex-shrink-0`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🌙</span>
                            <span className={`${th.textPrimary} font-bold tracking-wide text-base`}>
                                {t('title', lang)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={t('close', lang)}
                            className={`${th.isLight ? "text-[#4a3a5d] hover:text-[#2a1a3a] hover:bg-[#e0dcf5]" : "text-white/40 hover:text-white/80 hover:bg-white/10"} transition-colors p-1 rounded-lg`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <ProgressDots step={step} total={TOTAL_STEPS} />
                    <p className={`${th.isLight ? "text-[#6b5a80]" : "text-white/40"} text-xs text-center mt-1`}>
                        {t('step_of', lang, { n: step + 1 })}
                    </p>
                </div>

                {/* Step content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                    <div
                        className={`transition-all duration-200 ease-out ${slideClass}`}
                    >
                        <h2 className={`${th.textPrimary} text-lg font-bold mb-1`}>
                            {t(stepTitles[step], lang)}
                        </h2>
                        <p className={`${th.isLight ? "text-[#4a3a5d]" : "text-white/55"} text-sm mb-4 leading-relaxed`}>
                            {step < 4 ? t(stepDescs[step], lang) : ''}
                        </p>
                        {renderStep()}
                    </div>
                </div>

                {/* Footer navigation */}
                <div className={`px-5 pb-5 pt-3 border-t ${th.border} flex-shrink-0`}>
                    <div className="flex gap-3">
                        {step > 0 ? (
                            <button
                                type="button"
                                onClick={goBack}
                                className={`flex-1 py-3 rounded-xl border ${th.isLight ? "border-[#c4bce6] text-[#4a3a5d] hover:bg-[#e0dcf5]" : "border-white/20 text-white/70 hover:bg-white/10"} text-sm font-semibold transition-all active:scale-[0.98]`}
                            >
                                {t('btn_back', lang)}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl border border-white/20 text-white/40 text-sm font-semibold hover:bg-white/5 transition-all active:scale-[0.98]"
                            >
                                {t('btn_skip', lang)}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={goNext}
                            className="flex-[2] py-3 rounded-xl text-white text-sm font-bold transition-all active:scale-[0.98]
                                bg-gradient-to-r from-fuchsia-600 to-violet-600
                                hover:from-fuchsia-500 hover:to-violet-500
                                shadow-[0_0_16px_2px_rgba(217,70,239,0.3)]"
                        >
                            {step === TOTAL_STEPS - 1 ? t('btn_finish', lang) : t('btn_next', lang)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
