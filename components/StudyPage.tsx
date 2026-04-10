import React, { useState } from 'react';
import { Language, UserProfile } from '../types';
import { getTheme } from '../theme';

interface StudyPageProps {
  language: Language;
  onClose: () => void;
  themeMode?: string;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

type StudyT = {
  back: string;
  title: string;
  subtitle: string;
  anon_note: string;
  join_title: string;
  join_desc: string;
  basic_label: string;
  basic_discount: string;
  basic_desc: string;
  active_label: string;
  active_discount: string;
  active_desc: string;
  form_firstname: string;
  form_lastname: string;
  form_age: string;
  form_gender: string;
  form_country: string;
  consent_data: string;
  consent_name: string;
  join_btn: string;
  joined_title: string;
  joined_desc: string;
  badge_label: string;
  your_discount: string;
  cost_title: string;
  cost_intro: string;
  cost_analysis: string;
  cost_image: string;
  cost_video: string;
  cost_live: string;
  cost_footer: string;
  upgrade_btn: string;
};

const STUDY_TRANSLATIONS: Partial<Record<Language, StudyT>> = {
  [Language.DE]: {
    back: 'Zurück',
    title: 'Wissenschaftliche Studie',
    subtitle: 'Die größte globale Traumforschungs-Initiative',
    anon_note: 'Jeder deiner Träume trägt zur Wissenschaft bei — anonym, immer.',
    join_title: 'Offiziell teilnehmen & Rabatt erhalten',
    join_desc: 'Wer sich offiziell einträgt, wird in der Studie gelistet und erhält dauerhaften Rabatt auf alle Coin-Käufe.',
    basic_label: 'Basis-Teilnahme',
    basic_discount: '10 % Rabatt',
    basic_desc: 'Name + Einverständniserklärung',
    active_label: 'Aktive Teilnahme',
    active_discount: '20 % Rabatt',
    active_desc: 'Regelmäßige Beiträge (mind. 3 Träume/Woche)',
    form_firstname: 'Vorname',
    form_lastname: 'Nachname',
    form_age: 'Alter',
    form_gender: 'Geschlecht',
    form_country: 'Land / Ort',
    consent_data: 'Ich stimme der anonymisierten Nutzung meiner Traumdaten für wissenschaftliche Zwecke zu.',
    consent_name: 'Mein Name darf in der Studienpublikation erscheinen.',
    join_btn: 'An Studie teilnehmen',
    joined_title: '📊 Studienteilnehmer',
    joined_desc: 'Du bist offiziell eingetragen. Dein Rabatt gilt bei jedem Coin-Kauf.',
    badge_label: '📊 Studienteilnehmer',
    your_discount: 'Dein Studienrabatt',
    cost_title: 'Was kostet was — und warum?',
    cost_intro: 'Die KI-Modelle kosten echtes Geld. Dein Beitrag finanziert Forschung + Entwicklung.',
    cost_analysis: 'Text-Deutung: 2 Coins ≈ 0,04 €',
    cost_image: 'Bild HD: 8 Coins ≈ 0,16 €',
    cost_video: 'Video 30s: 180 Coins ≈ 3,60 €',
    cost_live: 'Live Voice 30 min: 20 Coins ≈ 0,40 €',
    cost_footer: '1 Coin = 0,02 € · Coins finanzieren KI-Rechenzeit und Traumforschung.',
    upgrade_btn: 'Auf aktive Teilnahme upgraden (20 %)',
  },
  [Language.EN]: {
    back: 'Back',
    title: 'Scientific Study',
    subtitle: 'The largest global dream research initiative',
    anon_note: 'Every dream you submit contributes to science — anonymously, always.',
    join_title: 'Join officially & get a discount',
    join_desc: 'Official participants are listed in the study and receive a permanent discount on all coin purchases.',
    basic_label: 'Basic participation',
    basic_discount: '10% discount',
    basic_desc: 'Name + consent declaration',
    active_label: 'Active participation',
    active_discount: '20% discount',
    active_desc: 'Regular contributions (min. 3 dreams/week)',
    form_firstname: 'First name',
    form_lastname: 'Last name',
    form_age: 'Age',
    form_gender: 'Gender',
    form_country: 'Country / Location',
    consent_data: 'I consent to the anonymized use of my dream data for scientific purposes.',
    consent_name: 'My name may appear in the study publication.',
    join_btn: 'Join the study',
    joined_title: '📊 Study participant',
    joined_desc: 'You are officially registered. Your discount applies to every coin purchase.',
    badge_label: '📊 Study Participant',
    your_discount: 'Your study discount',
    cost_title: 'What costs what — and why?',
    cost_intro: 'AI models cost real money. Your contribution funds research + development.',
    cost_analysis: 'Dream analysis: 2 coins ≈ €0.04',
    cost_image: 'HD image: 8 coins ≈ €0.16',
    cost_video: 'Video 30s: 180 coins ≈ €3.60',
    cost_live: 'Live voice 30 min: 20 coins ≈ €0.40',
    cost_footer: '1 coin = €0.02 · Coins fund AI compute time and dream research.',
    upgrade_btn: 'Upgrade to active participation (20%)',
  },
  [Language.TR]: {
    back: 'Geri',
    title: 'Bilimsel Çalışma',
    subtitle: 'En büyük küresel rüya araştırma girişimi',
    anon_note: 'Her rüyanız bilime katkıda bulunur — her zaman anonim.',
    join_title: 'Resmi katılın ve indirim alın',
    join_desc: 'Resmi katılımcılar çalışmada listelenir ve tüm jeton alımlarında kalıcı indirim alır.',
    basic_label: 'Temel katılım',
    basic_discount: '%10 indirim',
    basic_desc: 'İsim + onay beyanı',
    active_label: 'Aktif katılım',
    active_discount: '%20 indirim',
    active_desc: 'Düzenli katkılar (haftada en az 3 rüya)',
    form_firstname: 'Ad',
    form_lastname: 'Soyad',
    form_age: 'Yaş',
    form_gender: 'Cinsiyet',
    form_country: 'Ülke / Konum',
    consent_data: 'Rüya verilerimin bilimsel amaçlarla anonim kullanımına onay veriyorum.',
    consent_name: 'İsmim çalışma yayınında yer alabilir.',
    join_btn: 'Çalışmaya katıl',
    joined_title: '📊 Çalışma katılımcısı',
    joined_desc: 'Resmi olarak kayıtlısınız. İndiriminiz her jeton alımında geçerlidir.',
    badge_label: '📊 Çalışma Katılımcısı',
    your_discount: 'Çalışma indiriminiz',
    cost_title: 'Ne kadar tutar — ve neden?',
    cost_intro: 'Yapay zeka modelleri gerçek para maliyeti içerir. Katkınız araştırmayı finanse eder.',
    cost_analysis: 'Rüya analizi: 2 jeton ≈ 0,04 €',
    cost_image: 'HD görsel: 8 jeton ≈ 0,16 €',
    cost_video: '30s video: 180 jeton ≈ 3,60 €',
    cost_live: '30 dk canlı ses: 20 jeton ≈ 0,40 €',
    cost_footer: '1 jeton = 0,02 € · Jetonlar yapay zeka işlem süresini ve araştırmayı finanse eder.',
    upgrade_btn: 'Aktif katılıma yükselt (%20)',
  },
  [Language.AR]: {
    back: 'رجوع',
    title: 'الدراسة العلمية',
    subtitle: 'أكبر مبادرة بحثية عالمية للأحلام',
    anon_note: 'كل حلم تشاركه يساهم في العلم — بشكل مجهول دائماً.',
    join_title: 'انضم رسمياً واحصل على خصم',
    join_desc: 'يتم إدراج المشاركين الرسميين في الدراسة ويحصلون على خصم دائم على جميع مشتريات العملات.',
    basic_label: 'المشاركة الأساسية',
    basic_discount: 'خصم 10٪',
    basic_desc: 'الاسم + إقرار الموافقة',
    active_label: 'المشاركة الفعّالة',
    active_discount: 'خصم 20٪',
    active_desc: 'مساهمات منتظمة (3 أحلام على الأقل أسبوعياً)',
    form_firstname: 'الاسم الأول',
    form_lastname: 'اسم العائلة',
    form_age: 'العمر',
    form_gender: 'الجنس',
    form_country: 'البلد / الموقع',
    consent_data: 'أوافق على الاستخدام المجهول لبيانات أحلامي لأغراض علمية.',
    consent_name: 'يجوز ذكر اسمي في منشور الدراسة.',
    join_btn: 'انضم إلى الدراسة',
    joined_title: '📊 مشارك في الدراسة',
    joined_desc: 'أنت مسجل رسمياً. خصمك ينطبق على كل عملية شراء للعملات.',
    badge_label: '📊 مشارك في الدراسة',
    your_discount: 'خصم الدراسة الخاص بك',
    cost_title: 'ما التكلفة — ولماذا؟',
    cost_intro: 'نماذج الذكاء الاصطناعي تكلف أموالاً حقيقية. مساهمتك تموّل البحث والتطوير.',
    cost_analysis: 'تفسير الحلم: 2 عملة ≈ 0.04 €',
    cost_image: 'صورة HD: 8 عملات ≈ 0.16 €',
    cost_video: 'فيديو 30 ثانية: 180 عملة ≈ 3.60 €',
    cost_live: 'صوت مباشر 30 دقيقة: 20 عملة ≈ 0.40 €',
    cost_footer: '1 عملة = 0.02 € · تموّل العملات وقت حوسبة الذكاء الاصطناعي وأبحاث الأحلام.',
    upgrade_btn: 'ترقية إلى المشاركة الفعّالة (20٪)',
  },
  [Language.ES]: {
    back: 'Volver',
    title: 'Estudio científico',
    subtitle: 'La iniciativa de investigación de sueños más grande del mundo',
    anon_note: 'Cada sueño que envías contribuye a la ciencia — siempre de forma anónima.',
    join_title: 'Únete oficialmente y obtén descuento',
    join_desc: 'Los participantes oficiales aparecen en el estudio y reciben descuento permanente en todas las compras de monedas.',
    basic_label: 'Participación básica',
    basic_discount: '10% de descuento',
    basic_desc: 'Nombre + declaración de consentimiento',
    active_label: 'Participación activa',
    active_discount: '20% de descuento',
    active_desc: 'Contribuciones regulares (mín. 3 sueños/semana)',
    form_firstname: 'Nombre',
    form_lastname: 'Apellido',
    form_age: 'Edad',
    form_gender: 'Género',
    form_country: 'País / Ubicación',
    consent_data: 'Consiento el uso anonimizado de mis datos de sueños con fines científicos.',
    consent_name: 'Mi nombre puede aparecer en la publicación del estudio.',
    join_btn: 'Unirse al estudio',
    joined_title: '📊 Participante del estudio',
    joined_desc: 'Estás registrado oficialmente. Tu descuento se aplica en cada compra de monedas.',
    badge_label: '📊 Participante del Estudio',
    your_discount: 'Tu descuento de estudio',
    cost_title: '¿Qué cuesta qué — y por qué?',
    cost_intro: 'Los modelos de IA cuestan dinero real. Tu contribución financia investigación + desarrollo.',
    cost_analysis: 'Análisis de sueño: 2 monedas ≈ 0,04 €',
    cost_image: 'Imagen HD: 8 monedas ≈ 0,16 €',
    cost_video: 'Vídeo 30s: 180 monedas ≈ 3,60 €',
    cost_live: 'Voz en vivo 30 min: 20 monedas ≈ 0,40 €',
    cost_footer: '1 moneda = 0,02 € · Las monedas financian el tiempo de cómputo de IA e investigación de sueños.',
    upgrade_btn: 'Actualizar a participación activa (20%)',
  },
  [Language.FR]: {
    back: 'Retour',
    title: 'Étude scientifique',
    subtitle: 'La plus grande initiative mondiale de recherche sur les rêves',
    anon_note: 'Chaque rêve que vous partagez contribue à la science — toujours de manière anonyme.',
    join_title: 'Participez officiellement et obtenez une réduction',
    join_desc: 'Les participants officiels sont répertoriés dans l\'étude et bénéficient d\'une réduction permanente sur tous les achats de pièces.',
    basic_label: 'Participation de base',
    basic_discount: '10% de réduction',
    basic_desc: 'Nom + déclaration de consentement',
    active_label: 'Participation active',
    active_discount: '20% de réduction',
    active_desc: 'Contributions régulières (min. 3 rêves/semaine)',
    form_firstname: 'Prénom',
    form_lastname: 'Nom de famille',
    form_age: 'Âge',
    form_gender: 'Sexe',
    form_country: 'Pays / Lieu',
    consent_data: 'Je consens à l\'utilisation anonymisée de mes données de rêves à des fins scientifiques.',
    consent_name: 'Mon nom peut apparaître dans la publication de l\'étude.',
    join_btn: 'Rejoindre l\'étude',
    joined_title: '📊 Participant à l\'étude',
    joined_desc: 'Vous êtes officiellement inscrit. Votre réduction s\'applique à chaque achat de pièces.',
    badge_label: '📊 Participant à l\'Étude',
    your_discount: 'Votre réduction d\'étude',
    cost_title: 'Qu\'est-ce qui coûte quoi — et pourquoi ?',
    cost_intro: 'Les modèles d\'IA coûtent de l\'argent réel. Votre contribution finance la recherche + le développement.',
    cost_analysis: 'Analyse de rêve : 2 pièces ≈ 0,04 €',
    cost_image: 'Image HD : 8 pièces ≈ 0,16 €',
    cost_video: 'Vidéo 30s : 180 pièces ≈ 3,60 €',
    cost_live: 'Voix en direct 30 min : 20 pièces ≈ 0,40 €',
    cost_footer: '1 pièce = 0,02 € · Les pièces financent le temps de calcul IA et la recherche sur les rêves.',
    upgrade_btn: 'Passer à la participation active (20%)',
  },
  [Language.PT]: {
    back: 'Voltar',
    title: 'Estudo científico',
    subtitle: 'A maior iniciativa global de pesquisa sobre sonhos',
    anon_note: 'Cada sonho que você envia contribui para a ciência — sempre de forma anônima.',
    join_title: 'Participe oficialmente e obtenha desconto',
    join_desc: 'Participantes oficiais são listados no estudo e recebem desconto permanente em todas as compras de moedas.',
    basic_label: 'Participação básica',
    basic_discount: '10% de desconto',
    basic_desc: 'Nome + declaração de consentimento',
    active_label: 'Participação ativa',
    active_discount: '20% de desconto',
    active_desc: 'Contribuições regulares (mín. 3 sonhos/semana)',
    form_firstname: 'Nome',
    form_lastname: 'Sobrenome',
    form_age: 'Idade',
    form_gender: 'Gênero',
    form_country: 'País / Localização',
    consent_data: 'Consinto o uso anonimizado dos meus dados de sonhos para fins científicos.',
    consent_name: 'Meu nome pode aparecer na publicação do estudo.',
    join_btn: 'Participar do estudo',
    joined_title: '📊 Participante do estudo',
    joined_desc: 'Você está oficialmente registrado. Seu desconto se aplica a cada compra de moedas.',
    badge_label: '📊 Participante do Estudo',
    your_discount: 'Seu desconto de estudo',
    cost_title: 'O que custa o quê — e por quê?',
    cost_intro: 'Os modelos de IA custam dinheiro real. Sua contribuição financia pesquisa + desenvolvimento.',
    cost_analysis: 'Análise de sonho: 2 moedas ≈ 0,04 €',
    cost_image: 'Imagem HD: 8 moedas ≈ 0,16 €',
    cost_video: 'Vídeo 30s: 180 moedas ≈ 3,60 €',
    cost_live: 'Voz ao vivo 30 min: 20 moedas ≈ 0,40 €',
    cost_footer: '1 moeda = 0,02 € · Moedas financiam tempo de computação de IA e pesquisa de sonhos.',
    upgrade_btn: 'Atualizar para participação ativa (20%)',
  },
  [Language.RU]: {
    back: 'Назад',
    title: 'Научное исследование',
    subtitle: 'Крупнейшая мировая инициатива по изучению снов',
    anon_note: 'Каждый ваш сон вносит вклад в науку — всегда анонимно.',
    join_title: 'Официально участвуйте и получите скидку',
    join_desc: 'Официальные участники включены в исследование и получают постоянную скидку на все покупки монет.',
    basic_label: 'Базовое участие',
    basic_discount: 'Скидка 10%',
    basic_desc: 'Имя + согласие',
    active_label: 'Активное участие',
    active_discount: 'Скидка 20%',
    active_desc: 'Регулярные вклады (мин. 3 сна/неделю)',
    form_firstname: 'Имя',
    form_lastname: 'Фамилия',
    form_age: 'Возраст',
    form_gender: 'Пол',
    form_country: 'Страна / Место',
    consent_data: 'Я согласен(а) на анонимное использование данных моих снов в научных целях.',
    consent_name: 'Моё имя может быть указано в публикации исследования.',
    join_btn: 'Присоединиться к исследованию',
    joined_title: '📊 Участник исследования',
    joined_desc: 'Вы официально зарегистрированы. Ваша скидка применяется при каждой покупке монет.',
    badge_label: '📊 Участник Исследования',
    your_discount: 'Ваша скидка за участие',
    cost_title: 'Что сколько стоит — и почему?',
    cost_intro: 'Модели ИИ стоят реальных денег. Ваш вклад финансирует исследования + разработку.',
    cost_analysis: 'Анализ сна: 2 монеты ≈ 0,04 €',
    cost_image: 'HD-изображение: 8 монет ≈ 0,16 €',
    cost_video: 'Видео 30с: 180 монет ≈ 3,60 €',
    cost_live: 'Живой голос 30 мин: 20 монет ≈ 0,40 €',
    cost_footer: '1 монета = 0,02 € · Монеты финансируют вычислительное время ИИ и исследования снов.',
    upgrade_btn: 'Обновить до активного участия (20%)',
  },
};

function getT(language: Language): StudyT {
  return STUDY_TRANSLATIONS[language] ?? STUDY_TRANSLATIONS[Language.EN]!;
}

const StudyPage: React.FC<StudyPageProps> = ({
  language,
  onClose,
  themeMode,
  userProfile,
  onUpdateProfile,
}) => {
  const th = getTheme(themeMode);
  const isLight = th.isLight;
  const isRtl = [Language.AR, Language.FA, Language.UR].includes(language);
  const t = getT(language);

  const alreadyJoined = (userProfile.study_participation_level === 'basic' || userProfile.study_participation_level === 'active');
  const isActive = userProfile.study_participation_level === 'active';
  const discountPct = alreadyJoined ? (isActive ? 20 : 10) : 0;

  const [level, setLevel] = useState<'basic' | 'active'>('basic');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [consentData, setConsentData] = useState(false);
  const [consentName, setConsentName] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = firstName.trim() && lastName.trim() && consentData;

  function handleJoin() {
    if (!canSubmit) return;
    const discount = level === 'active' ? 0.20 : 0.10;
    onUpdateProfile({
      ...userProfile,
      study_participation_level: level,
      study_discount: discount,
    });
    setSubmitted(true);
  }

  function handleUpgrade() {
    onUpdateProfile({
      ...userProfile,
      study_participation_level: 'active',
      study_discount: 0.20,
    });
  }

  const bg = isLight ? 'bg-slate-50' : 'bg-[#0f0b1a]';
  const card = isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10';
  const text = isLight ? 'text-slate-800' : 'text-slate-100';
  const textSub = isLight ? 'text-slate-500' : 'text-slate-400';
  const inputCls = isLight
    ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-violet-500'
    : 'bg-white/5 border-white/10 text-slate-100 placeholder-slate-500 focus:border-violet-500';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`fixed inset-0 z-50 overflow-y-auto ${bg}`}
    >
      {/* Header */}
      <div className={`sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b ${isLight ? 'bg-white/90 border-slate-200' : 'bg-[#0f0b1a]/90 border-white/10'} backdrop-blur-md`}>
        <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300'}`}>
          <span className="material-icons text-xl">arrow_back</span>
        </button>
        <div>
          <h1 className={`font-bold text-base ${text}`}>{t.title}</h1>
          <p className={`text-xs ${textSub}`}>{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-24">

        {/* Anon Note */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-violet-500/20 bg-violet-900/20">
          <span className="material-icons text-violet-400 mt-0.5 text-xl shrink-0">science</span>
          <p className="text-violet-200 text-sm leading-relaxed">{t.anon_note}</p>
        </div>

        {/* Already Joined State */}
        {(alreadyJoined || submitted) ? (
          <div className={`rounded-xl border p-5 ${card}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📊</span>
              <div>
                <h2 className={`font-bold text-base ${text}`}>{t.joined_title}</h2>
                <p className={`text-xs ${textSub}`}>{t.joined_desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <span className={`text-sm font-semibold ${text}`}>{t.your_discount}</span>
              <span className="text-green-400 font-bold text-lg">{discountPct || (level === 'active' ? 20 : 10)}%</span>
            </div>
            {!isActive && (
              <button
                onClick={handleUpgrade}
                className="mt-3 w-full py-2 px-4 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 transition-opacity"
              >
                {t.upgrade_btn}
              </button>
            )}
          </div>
        ) : (
          /* Registration Form */
          <div className={`rounded-xl border p-5 ${card}`}>
            <h2 className={`font-bold text-base mb-1 ${text}`}>{t.join_title}</h2>
            <p className={`text-sm mb-4 ${textSub}`}>{t.join_desc}</p>

            {/* Level selector */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {(['basic', 'active'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    level === lvl
                      ? 'border-violet-500 bg-violet-500/10'
                      : isLight ? 'border-slate-200 hover:border-slate-300' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`text-xs font-bold mb-1 ${level === lvl ? 'text-violet-400' : textSub}`}>
                    {lvl === 'basic' ? t.basic_label : t.active_label}
                  </div>
                  <div className="text-green-400 font-bold text-sm">
                    {lvl === 'basic' ? t.basic_discount : t.active_discount}
                  </div>
                  <div className={`text-[11px] mt-1 ${textSub}`}>
                    {lvl === 'basic' ? t.basic_desc : t.active_desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder={t.form_firstname}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`}
              />
              <input
                value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder={t.form_lastname}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <input
                value={age} onChange={e => setAge(e.target.value)}
                placeholder={t.form_age}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`}
              />
              <input
                value={gender} onChange={e => setGender(e.target.value)}
                placeholder={t.form_gender}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`}
              />
              <input
                value={country} onChange={e => setCountry(e.target.value)}
                placeholder={t.form_country}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 mb-5">
              {[
                { val: consentData, setter: setConsentData, label: t.consent_data },
                { val: consentName, setter: setConsentName, label: t.consent_name },
              ].map(({ val, setter, label }, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setter(!val)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      val ? 'bg-violet-600 border-violet-600' : isLight ? 'border-slate-300' : 'border-white/20'
                    }`}
                  >
                    {val && <span className="material-icons text-white text-sm">check</span>}
                  </div>
                  <span className={`text-xs leading-relaxed ${textSub}`}>{label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleJoin}
              disabled={!canSubmit}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                canSubmit
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20'
                  : isLight ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              {t.join_btn}
            </button>
          </div>
        )}

        {/* Cost Transparency */}
        <div className={`rounded-xl border p-5 ${card}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons text-amber-400 text-xl">info</span>
            <h2 className={`font-bold text-base ${text}`}>{t.cost_title}</h2>
          </div>
          <p className={`text-xs mb-4 ${textSub}`}>{t.cost_intro}</p>
          <div className="space-y-2 mb-4">
            {[t.cost_analysis, t.cost_image, t.cost_video, t.cost_live].map((line, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${textSub}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                {line}
              </div>
            ))}
          </div>
          <p className={`text-[11px] ${textSub} italic border-t pt-3 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
            {t.cost_footer}
          </p>
        </div>

      </div>
    </div>
  );
};

export default StudyPage;
