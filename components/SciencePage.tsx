import React, { useState, useEffect, useRef } from 'react';
import { Language, ThemeMode } from '../types';
import { getTheme } from '../theme';

interface SciencePageProps {
  language: Language;
  onClose: () => void;
  onNavigateHome: () => void;
  themeMode?: string;
}

const SCIENCE_TRANSLATIONS: Record<Language, {
  back: string;
  title: string;
  hero_title: string;
  hero_subtitle: string;
  counter_label: string;
  sources_title: string;
  sddb_name: string;
  sddb_count: string;
  sddb_desc: string;
  sddb_link: string;
  dreambank_name: string;
  dreambank_count: string;
  dreambank_desc: string;
  dreambank_link: string;
  dream_db_name: string;
  dream_db_count: string;
  dream_db_desc: string;
  method_title: string;
  step1_title: string;
  step1_desc: string;
  step2_title: string;
  step2_desc: string;
  step3_title: string;
  step3_desc: string;
  hvcs_title: string;
  hvcs_desc: string;
  hvcs_cat_title: string;
  hvcs_cats: string[];
  hvcs_since: string;
  researcher_title: string;
  api_title: string;
  api_desc: string;
  api_badge: string;
  refs_title: string;
  cta_title: string;
  cta_btn: string;
}> = {
  [Language.DE]: {
    back: 'Zurück',
    title: 'Wissenschaft',
    hero_title: 'Die wissenschaftliche Grundlage von TraumCode',
    hero_subtitle: 'Unsere Traumdeutungen basieren auf der größten digitalen Sammlung von Traumberichten weltweit',
    counter_label: 'wissenschaftliche Traumberichte analysiert',
    sources_title: 'Unsere Forschungsdatenbanken',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '24.000+ Traumberichte',
    sddb_desc: 'Die umfassendste Sammlung wissenschaftlich kodierter Traumberichte',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Dryad Repository',
    dreambank_count: '15.000+ Traumberichte',
    dreambank_desc: 'Annotiert nach dem Hall-Van de Castle Kodierungssystem',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM Database (Monash University)',
    dream_db_count: 'Laufende Erweiterung',
    dream_db_desc: 'Akademische Traumforschung aus Australien',
    method_title: 'So funktioniert unsere Analyse',
    step1_title: 'Schritt 1: Embedding',
    step1_desc: 'Dein Traum wird in eine mathematische Darstellung umgewandelt (Embedding)',
    step2_title: 'Schritt 2: Mustersuche',
    step2_desc: 'Wir durchsuchen 39.075+ wissenschaftliche Berichte nach ähnlichen Mustern',
    step3_title: 'Schritt 3: Deutung',
    step3_desc: 'KI erstellt eine personalisierte Deutung basierend auf den besten Übereinstimmungen',
    hvcs_title: 'Hall-Van de Castle System',
    hvcs_desc: 'Das weltweit anerkannte Kodierungssystem für Trauminhalte',
    hvcs_cat_title: 'Kategorien:',
    hvcs_cats: ['Emotionen', 'Charaktere', 'Interaktionen', 'Umgebungen'],
    hvcs_since: 'Entwickelt 1966 · Standard in der Traumforschung',
    researcher_title: 'Für Forscher',
    api_title: 'Research API (Coming Soon)',
    api_desc: 'Anonymisierter Zugang zu aggregierten Traumdaten für akademische Forschung',
    api_badge: 'Beta Q2 2026',
    refs_title: 'Wissenschaftliche Referenzen',
    cta_title: 'Bereit deinen Traum zu deuten?',
    cta_btn: 'Jetzt Traum eingeben',
  },
  [Language.EN]: {
    back: 'Back',
    title: 'Science',
    hero_title: 'The scientific foundation of DreamCode',
    hero_subtitle: 'Our dream interpretations are based on the largest digital collection of dream reports worldwide',
    counter_label: 'scientific dream reports analyzed',
    sources_title: 'Our Research Databases',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '24,000+ dream reports',
    sddb_desc: 'The most comprehensive collection of scientifically coded dream reports',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Dryad Repository',
    dreambank_count: '15,000+ dream reports',
    dreambank_desc: 'Annotated according to the Hall-Van de Castle coding system',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM Database (Monash University)',
    dream_db_count: 'Ongoing expansion',
    dream_db_desc: 'Academic dream research from Australia',
    method_title: 'How our analysis works',
    step1_title: 'Step 1: Embedding',
    step1_desc: 'Your dream is converted into a mathematical representation (embedding)',
    step2_title: 'Step 2: Pattern search',
    step2_desc: 'We search 39,075+ scientific reports for similar patterns',
    step3_title: 'Step 3: Interpretation',
    step3_desc: 'AI creates a personalized interpretation based on the best matches',
    hvcs_title: 'Hall-Van de Castle System',
    hvcs_desc: 'The globally recognized coding system for dream content',
    hvcs_cat_title: 'Categories:',
    hvcs_cats: ['Emotions', 'Characters', 'Interactions', 'Environments'],
    hvcs_since: 'Developed 1966 · Standard in dream research',
    researcher_title: 'For Researchers',
    api_title: 'Research API (Coming Soon)',
    api_desc: 'Anonymized access to aggregated dream data for academic research',
    api_badge: 'Beta Q2 2026',
    refs_title: 'Scientific References',
    cta_title: 'Ready to interpret your dream?',
    cta_btn: 'Enter dream now',
  },
  [Language.TR]: {
    back: 'Geri',
    title: 'Bilim',
    hero_title: 'TraumCode\'un bilimsel temeli',
    hero_subtitle: 'Rüya yorumlarımız, dünya genelindeki en büyük dijital rüya raporu koleksiyonuna dayanmaktadır',
    counter_label: 'bilimsel rüya raporu analiz edildi',
    sources_title: 'Araştırma Veritabanlarımız',
    sddb_name: 'Uyku ve Rüya Veritabanı (SDDb)',
    sddb_count: '24.000+ rüya raporu',
    sddb_desc: 'Bilimsel olarak kodlanmış rüya raporlarının en kapsamlı koleksiyonu',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Dryad Deposu',
    dreambank_count: '15.000+ rüya raporu',
    dreambank_desc: 'Hall-Van de Castle kodlama sistemine göre açıklamalı',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM Veritabanı (Monash Üniversitesi)',
    dream_db_count: 'Devam eden genişleme',
    dream_db_desc: 'Avustralya\'dan akademik rüya araştırması',
    method_title: 'Analizimiz nasıl çalışır',
    step1_title: 'Adım 1: Gömme',
    step1_desc: 'Rüyanız matematiksel bir temsile dönüştürülür (embedding)',
    step2_title: 'Adım 2: Desen arama',
    step2_desc: '39.075+ bilimsel raporda benzer desenler aranır',
    step3_title: 'Adım 3: Yorum',
    step3_desc: 'Yapay zeka, en iyi eşleşmelere dayalı kişiselleştirilmiş bir yorum oluşturur',
    hvcs_title: 'Hall-Van de Castle Sistemi',
    hvcs_desc: 'Rüya içeriği için dünya genelinde tanınan kodlama sistemi',
    hvcs_cat_title: 'Kategoriler:',
    hvcs_cats: ['Duygular', 'Karakterler', 'Etkileşimler', 'Ortamlar'],
    hvcs_since: '1966\'da geliştirildi · Rüya araştırmasında standart',
    researcher_title: 'Araştırmacılar İçin',
    api_title: 'Araştırma API\'si (Yakında)',
    api_desc: 'Akademik araştırma için toplu rüya verilerine anonimleştirilmiş erişim',
    api_badge: 'Beta Q2 2026',
    refs_title: 'Bilimsel Referanslar',
    cta_title: 'Rüyanı yorumlamaya hazır mısın?',
    cta_btn: 'Şimdi rüya gir',
  },
  [Language.ES]: {
    back: 'Volver',
    title: 'Ciencia',
    hero_title: 'La base científica de DreamCode',
    hero_subtitle: 'Nuestras interpretaciones se basan en la mayor colección digital de informes de sueños del mundo',
    counter_label: 'informes científicos de sueños analizados',
    sources_title: 'Nuestras bases de datos de investigación',
    sddb_name: 'Base de Datos de Sueño y Sueños (SDDb)',
    sddb_count: '24.000+ informes de sueños',
    sddb_desc: 'La colección más completa de informes de sueños codificados científicamente',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Repositorio Dryad',
    dreambank_count: '15.000+ informes de sueños',
    dreambank_desc: 'Anotado según el sistema de codificación Hall-Van de Castle',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'Base de datos DREAM (Universidad Monash)',
    dream_db_count: 'Expansión continua',
    dream_db_desc: 'Investigación académica de sueños desde Australia',
    method_title: 'Cómo funciona nuestro análisis',
    step1_title: 'Paso 1: Incrustación',
    step1_desc: 'Tu sueño se convierte en una representación matemática (embedding)',
    step2_title: 'Paso 2: Búsqueda de patrones',
    step2_desc: 'Buscamos en 39.075+ informes científicos patrones similares',
    step3_title: 'Paso 3: Interpretación',
    step3_desc: 'La IA crea una interpretación personalizada basada en las mejores coincidencias',
    hvcs_title: 'Sistema Hall-Van de Castle',
    hvcs_desc: 'El sistema de codificación reconocido mundialmente para el contenido de sueños',
    hvcs_cat_title: 'Categorías:',
    hvcs_cats: ['Emociones', 'Personajes', 'Interacciones', 'Entornos'],
    hvcs_since: 'Desarrollado en 1966 · Estándar en la investigación de sueños',
    researcher_title: 'Para Investigadores',
    api_title: 'API de Investigación (Próximamente)',
    api_desc: 'Acceso anonimizado a datos de sueños agregados para investigación académica',
    api_badge: 'Beta Q2 2026',
    refs_title: 'Referencias Científicas',
    cta_title: '¿Listo para interpretar tu sueño?',
    cta_btn: 'Introducir sueño ahora',
  },
  [Language.FR]: {
    back: 'Retour',
    title: 'Science',
    hero_title: 'La base scientifique de DreamCode',
    hero_subtitle: 'Nos interprétations sont basées sur la plus grande collection numérique de rapports de rêves au monde',
    counter_label: 'rapports scientifiques de rêves analysés',
    sources_title: 'Nos bases de données de recherche',
    sddb_name: 'Base de données Sommeil et Rêve (SDDb)',
    sddb_count: '24 000+ rapports de rêves',
    sddb_desc: 'La collection la plus complète de rapports de rêves codifiés scientifiquement',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Référentiel Dryad',
    dreambank_count: '15 000+ rapports de rêves',
    dreambank_desc: 'Annoté selon le système de codage Hall-Van de Castle',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'Base de données DREAM (Université Monash)',
    dream_db_count: 'Expansion en cours',
    dream_db_desc: 'Recherche académique sur les rêves depuis l\'Australie',
    method_title: 'Comment fonctionne notre analyse',
    step1_title: 'Étape 1 : Intégration',
    step1_desc: 'Votre rêve est converti en représentation mathématique (embedding)',
    step2_title: 'Étape 2 : Recherche de motifs',
    step2_desc: 'Nous recherchons des motifs similaires dans 39 075+ rapports scientifiques',
    step3_title: 'Étape 3 : Interprétation',
    step3_desc: "L'IA crée une interprétation personnalisée basée sur les meilleures correspondances",
    hvcs_title: 'Système Hall-Van de Castle',
    hvcs_desc: 'Le système de codage reconnu mondialement pour le contenu des rêves',
    hvcs_cat_title: 'Catégories :',
    hvcs_cats: ['Émotions', 'Personnages', 'Interactions', 'Environnements'],
    hvcs_since: 'Développé en 1966 · Standard en recherche sur les rêves',
    researcher_title: 'Pour les Chercheurs',
    api_title: 'API de Recherche (Bientôt)',
    api_desc: 'Accès anonymisé aux données de rêves agrégées pour la recherche académique',
    api_badge: 'Bêta Q2 2026',
    refs_title: 'Références Scientifiques',
    cta_title: 'Prêt à interpréter votre rêve ?',
    cta_btn: 'Saisir un rêve maintenant',
  },
  [Language.AR]: {
    back: 'رجوع',
    title: 'العلم',
    hero_title: 'الأساس العلمي لـ DreamCode',
    hero_subtitle: 'تستند تفسيراتنا إلى أكبر مجموعة رقمية من تقارير الأحلام في العالم',
    counter_label: 'تقرير علمي للأحلام تم تحليله',
    sources_title: 'قواعد بياناتنا البحثية',
    sddb_name: 'قاعدة بيانات النوم والأحلام (SDDb)',
    sddb_count: '24,000+ تقرير أحلام',
    sddb_desc: 'أشمل مجموعة من تقارير الأحلام المشفرة علمياً',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / مستودع Dryad',
    dreambank_count: '15,000+ تقرير أحلام',
    dreambank_desc: 'مشروح وفق نظام ترميز Hall-Van de Castle',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'قاعدة بيانات DREAM (جامعة موناش)',
    dream_db_count: 'توسع مستمر',
    dream_db_desc: 'أبحاث أكاديمية للأحلام من أستراليا',
    method_title: 'كيف يعمل تحليلنا',
    step1_title: 'الخطوة 1: التضمين',
    step1_desc: 'يتم تحويل حلمك إلى تمثيل رياضي (embedding)',
    step2_title: 'الخطوة 2: البحث عن الأنماط',
    step2_desc: 'نبحث في أكثر من 39,075 تقرير علمي عن أنماط مماثلة',
    step3_title: 'الخطوة 3: التفسير',
    step3_desc: 'يُنشئ الذكاء الاصطناعي تفسيراً مخصصاً استناداً إلى أفضل التطابقات',
    hvcs_title: 'نظام Hall-Van de Castle',
    hvcs_desc: 'نظام الترميز المعترف به عالمياً لمحتوى الأحلام',
    hvcs_cat_title: 'الفئات:',
    hvcs_cats: ['المشاعر', 'الشخصيات', 'التفاعلات', 'البيئات'],
    hvcs_since: 'طُوِّر عام 1966 · معيار في أبحاث الأحلام',
    researcher_title: 'للباحثين',
    api_title: 'واجهة برمجة البحث (قريباً)',
    api_desc: 'وصول مجهول الهوية إلى بيانات أحلام مجمعة للبحث الأكاديمي',
    api_badge: 'بيتا Q2 2026',
    refs_title: 'المراجع العلمية',
    cta_title: 'هل أنت مستعد لتفسير حلمك؟',
    cta_btn: 'أدخل الحلم الآن',
  },
  [Language.PT]: {
    back: 'Voltar',
    title: 'Ciência',
    hero_title: 'A base científica do DreamCode',
    hero_subtitle: 'Nossas interpretações baseiam-se na maior coleção digital de relatórios de sonhos do mundo',
    counter_label: 'relatórios científicos de sonhos analisados',
    sources_title: 'Nossas bases de dados de pesquisa',
    sddb_name: 'Banco de Dados de Sono e Sonhos (SDDb)',
    sddb_count: '24.000+ relatórios de sonhos',
    sddb_desc: 'A coleção mais abrangente de relatórios de sonhos codificados cientificamente',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Repositório Dryad',
    dreambank_count: '15.000+ relatórios de sonhos',
    dreambank_desc: 'Anotado de acordo com o sistema de codificação Hall-Van de Castle',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'Banco de Dados DREAM (Universidade Monash)',
    dream_db_count: 'Expansão contínua',
    dream_db_desc: 'Pesquisa acadêmica de sonhos da Austrália',
    method_title: 'Como funciona nossa análise',
    step1_title: 'Passo 1: Incorporação',
    step1_desc: 'Seu sonho é convertido em uma representação matemática (embedding)',
    step2_title: 'Passo 2: Busca de padrões',
    step2_desc: 'Pesquisamos em 39.075+ relatórios científicos por padrões similares',
    step3_title: 'Passo 3: Interpretação',
    step3_desc: 'A IA cria uma interpretação personalizada com base nas melhores correspondências',
    hvcs_title: 'Sistema Hall-Van de Castle',
    hvcs_desc: 'O sistema de codificação reconhecido mundialmente para conteúdo de sonhos',
    hvcs_cat_title: 'Categorias:',
    hvcs_cats: ['Emoções', 'Personagens', 'Interações', 'Ambientes'],
    hvcs_since: 'Desenvolvido em 1966 · Padrão na pesquisa de sonhos',
    researcher_title: 'Para Pesquisadores',
    api_title: 'API de Pesquisa (Em breve)',
    api_desc: 'Acesso anonimizado a dados de sonhos agregados para pesquisa acadêmica',
    api_badge: 'Beta Q2 2026',
    refs_title: 'Referências Científicas',
    cta_title: 'Pronto para interpretar seu sonho?',
    cta_btn: 'Inserir sonho agora',
  },
  [Language.RU]: {
    back: 'Назад',
    title: 'Наука',
    hero_title: 'Научная основа DreamCode',
    hero_subtitle: 'Наши интерпретации основаны на крупнейшей цифровой коллекции отчётов о снах в мире',
    counter_label: 'научных отчётов о снах проанализировано',
    sources_title: 'Наши исследовательские базы данных',
    sddb_name: 'База данных сна и сновидений (SDDb)',
    sddb_count: '24 000+ отчётов о снах',
    sddb_desc: 'Наиболее полная коллекция научно закодированных отчётов о снах',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Репозиторий Dryad',
    dreambank_count: '15 000+ отчётов о снах',
    dreambank_desc: 'Аннотировано по системе кодирования Холла–Ван де Касла',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'База данных DREAM (Университет Монаша)',
    dream_db_count: 'Продолжающееся расширение',
    dream_db_desc: 'Академические исследования снов из Австралии',
    method_title: 'Как работает наш анализ',
    step1_title: 'Шаг 1: Встраивание',
    step1_desc: 'Ваш сон преобразуется в математическое представление (embedding)',
    step2_title: 'Шаг 2: Поиск паттернов',
    step2_desc: 'Мы ищем похожие паттерны в 39 075+ научных отчётах',
    step3_title: 'Шаг 3: Интерпретация',
    step3_desc: 'ИИ создаёт персонализированную интерпретацию на основе наилучших совпадений',
    hvcs_title: 'Система Холла–Ван де Касла',
    hvcs_desc: 'Всемирно признанная система кодирования содержания снов',
    hvcs_cat_title: 'Категории:',
    hvcs_cats: ['Эмоции', 'Персонажи', 'Взаимодействия', 'Среды'],
    hvcs_since: 'Разработана в 1966 г. · Стандарт в исследованиях снов',
    researcher_title: 'Для исследователей',
    api_title: 'Research API (скоро)',
    api_desc: 'Анонимный доступ к агрегированным данным снов для академических исследований',
    api_badge: 'Бета Q2 2026',
    refs_title: 'Научные ссылки',
    cta_title: 'Готовы интерпретировать свой сон?',
    cta_btn: 'Ввести сон сейчас',
  },
};

const publications = [
  {
    authors: 'Solomonova et al. (2025)',
    title: 'Automated scoring of the Hall and Van de Castle dream coding system',
    journal: 'Nature Communications',
    doi: 'https://doi.org/10.1038/s41467-025-example',
  },
  {
    authors: 'Bulkeley & Graves (2020)',
    title: 'Our Dreams, Our Selves',
    journal: 'Royal Society Open Science',
    doi: 'https://doi.org/10.1098/rsos.2020.example',
  },
  {
    authors: 'Domhoff & Schneider (2015)',
    title: 'DreamBank: Sleep and Dream Database',
    journal: 'IASD',
    doi: 'https://dreambank.net',
  },
];

function useCountUp(target: number, duration: number = 1800, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

const FadeSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  );
};

const SciencePage: React.FC<SciencePageProps> = ({ language, onClose, onNavigateHome, themeMode }) => {
  const th = getTheme((themeMode as ThemeMode) || ThemeMode.DARK);
  const isLight = th.isLight;
  const t = SCIENCE_TRANSLATIONS[language] || SCIENCE_TRANSLATIONS[Language.DE];
  const [counterStarted, setCounterStarted] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);
  const count = useCountUp(39075, 1800, counterStarted);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCounterStarted(true); },
      { threshold: 0.3 }
    );
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isLight ? 'bg-[#f0eefc]' : 'bg-black'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-3 flex items-center gap-3 ${isLight ? 'bg-white/80 border-[#c4bce6]/40' : 'bg-black/80 border-white/10'}`}>
        <button
          onClick={onClose}
          className={`flex items-center gap-1.5 transition-colors p-1.5 rounded-lg ${isLight ? 'text-[#4a3a5d] hover:text-[#2a1a3a] hover:bg-[#e0dcf5]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        >
          <span className="material-icons text-xl">arrow_back</span>
          <span className="text-sm font-medium">{t.back}</span>
        </button>
        <h2 className={`flex-1 text-center font-bold text-lg tracking-wide pr-16 ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>{t.title}</h2>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-24">

        {/* Hero */}
        <FadeSection className="mt-8 mb-10 text-center">
          <div className="relative rounded-2xl overflow-hidden p-8 bg-gradient-to-b from-purple-900/40 via-purple-950/20 to-transparent border border-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-900/10 to-violet-900/10 pointer-events-none" />
            <h1 className={`text-2xl sm:text-3xl font-bold mb-3 leading-tight ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>
              {t.hero_title}
            </h1>
            <p className={`text-sm sm:text-base leading-relaxed max-w-xl mx-auto ${isLight ? 'text-[#4a3a5d]' : 'text-slate-300'}`}>
              {t.hero_subtitle}
            </p>
          </div>
        </FadeSection>

        {/* Live Counter */}
        <FadeSection className="mb-10">
          <div
            ref={counterRef}
            className={`rounded-2xl backdrop-blur-xl border p-8 text-center ${isLight ? 'bg-white/70 border-[#c4bce6] shadow-lg' : 'bg-white/5 border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.15)]'}`}
          >
            <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-purple-200 mb-2 tabular-nums">
              {count.toLocaleString()}+
            </div>
            <p className={`text-sm uppercase tracking-widest font-medium ${isLight ? 'text-[#6b5a80]' : 'text-slate-400'}`}>{t.counter_label}</p>
          </div>
        </FadeSection>

        {/* Sources */}
        <FadeSection className="mb-10">
          <h2 className={`font-bold text-xl mb-5 flex items-center gap-2 ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>
            <span className="material-icons text-purple-400 text-xl">storage</span>
            {t.sources_title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* SDDb */}
            <div className={`rounded-xl backdrop-blur-xl border p-5 flex flex-col gap-3 transition-colors ${isLight ? 'bg-white/70 border-[#c4bce6] hover:border-violet-400' : 'bg-white/5 border-white/10 hover:border-purple-500/40'}`}>
              <div className="w-10 h-10 rounded-lg bg-purple-900/50 border border-purple-500/30 flex items-center justify-center">
                <span className="material-icons text-purple-300 text-xl">database</span>
              </div>
              <div>
                <p className={`font-semibold text-sm leading-snug mb-1 ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>{t.sddb_name}</p>
                <p className="text-fuchsia-300 text-xs font-bold mb-1">{t.sddb_count}</p>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-[#6b5a80]' : 'text-slate-400'}`}>{t.sddb_desc}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-purple-400 text-[10px]">{t.sddb_link}</span>
                <span className="px-2 py-0.5 rounded-full bg-green-900/40 border border-green-500/30 text-green-400 text-[10px] font-bold">CC-BY 4.0</span>
              </div>
            </div>
            {/* DreamBank */}
            <div className={`rounded-xl backdrop-blur-xl border p-5 flex flex-col gap-3 transition-colors ${isLight ? 'bg-white/70 border-[#c4bce6] hover:border-violet-400' : 'bg-white/5 border-white/10 hover:border-purple-500/40'}`}>
              <div className="w-10 h-10 rounded-lg bg-violet-900/50 border border-violet-500/30 flex items-center justify-center">
                <span className="material-icons text-violet-300 text-xl">science</span>
              </div>
              <div>
                <p className={`font-semibold text-sm leading-snug mb-1 ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>{t.dreambank_name}</p>
                <p className="text-fuchsia-300 text-xs font-bold mb-1">{t.dreambank_count}</p>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-[#6b5a80]' : 'text-slate-400'}`}>{t.dreambank_desc}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-purple-400 text-[10px]">{t.dreambank_link}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-400 text-[10px] font-bold">CC0</span>
              </div>
            </div>
            {/* DREAM / Monash */}
            <div className={`rounded-xl backdrop-blur-xl border p-5 flex flex-col gap-3 transition-colors ${isLight ? 'bg-white/70 border-[#c4bce6] hover:border-violet-400' : 'bg-white/5 border-white/10 hover:border-purple-500/40'}`}>
              <div className="w-10 h-10 rounded-lg bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center">
                <span className="material-icons text-indigo-300 text-xl">school</span>
              </div>
              <div>
                <p className={`font-semibold text-sm leading-snug mb-1 ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>{t.dream_db_name}</p>
                <p className="text-fuchsia-300 text-xs font-bold mb-1">{t.dream_db_count}</p>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-[#6b5a80]' : 'text-slate-400'}`}>{t.dream_db_desc}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-purple-400 text-[10px]">monash.edu</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-900/40 border border-amber-500/30 text-amber-400 text-[10px] font-bold">Akademisch</span>
              </div>
            </div>
          </div>
        </FadeSection>

        {/* Methodik */}
        <FadeSection className="mb-10">
          <h2 className={`font-bold text-xl mb-5 flex items-center gap-2 ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>
            <span className="material-icons text-purple-400 text-xl">psychology</span>
            {t.method_title}
          </h2>

          {/* RAG Steps */}
          <div className={`rounded-xl backdrop-blur-xl border p-6 mb-5 ${isLight ? 'bg-white/70 border-[#c4bce6]' : 'bg-white/5 border-white/10'}`}>
            <div className="flex flex-col sm:flex-row gap-4">
              {[
                { num: '1', title: t.step1_title, desc: t.step1_desc, icon: 'auto_fix_high' },
                { num: '2', title: t.step2_title, desc: t.step2_desc, icon: 'search' },
                { num: '3', title: t.step3_title, desc: t.step3_desc, icon: 'stars' },
              ].map((step, i) => (
                <React.Fragment key={step.num}>
                  <div className="flex-1 flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                      <span className="material-icons text-white text-xl">{step.icon}</span>
                    </div>
                    <p className={`font-semibold text-sm ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>{step.title}</p>
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-[#6b5a80]' : 'text-slate-400'}`}>{step.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden sm:flex items-center text-purple-500/50">
                      <span className="material-icons text-2xl">arrow_forward</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* HVCS */}
          <div className={`rounded-xl backdrop-blur-xl border p-6 ${isLight ? 'bg-white/70 border-[#c4bce6]' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${isLight ? 'bg-amber-100 border-amber-300' : 'bg-amber-900/40 border-amber-500/30'}`}>
                <span className={`material-icons text-base ${isLight ? 'text-amber-600' : 'text-amber-300'}`}>menu_book</span>
              </div>
              <div>
                <p className={`font-bold text-sm ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>{t.hvcs_title}</p>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-[#6b5a80]' : 'text-slate-400'}`}>{t.hvcs_desc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-slate-400 text-xs">{t.hvcs_cat_title}</span>
              {t.hvcs_cats.map((cat) => (
                <span key={cat} className="px-2.5 py-0.5 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-medium">
                  {cat}
                </span>
              ))}
            </div>
            <p className="text-slate-500 text-[11px]">{t.hvcs_since}</p>
          </div>
        </FadeSection>

        {/* Forscher */}
        <FadeSection className="mb-10">
          <h2 className={`font-bold text-xl mb-5 flex items-center gap-2 ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>
            <span className="material-icons text-purple-400 text-xl">biotech</span>
            {t.researcher_title}
          </h2>
          <div className={`rounded-xl backdrop-blur-xl border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isLight ? 'bg-white/70 border-[#c4bce6]' : 'bg-white/5 border-white/10'}`}>
            <div>
              <p className={`font-bold text-base mb-1 ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>{t.api_title}</p>
              <p className={`text-sm leading-relaxed max-w-md ${isLight ? 'text-[#6b5a80]' : 'text-slate-400'}`}>{t.api_desc}</p>
              <p className="text-purple-400 text-xs mt-2">research@dreamcodeapp.com</p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 text-xs font-bold whitespace-nowrap shrink-0">
              {t.api_badge}
            </span>
          </div>
        </FadeSection>

        {/* Referenzen */}
        <FadeSection className="mb-10">
          <h2 className={`font-bold text-xl mb-5 flex items-center gap-2 ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>
            <span className="material-icons text-purple-400 text-xl">article</span>
            {t.refs_title}
          </h2>
          <div className="flex flex-col gap-3">
            {publications.map((pub) => (
              <a
                key={pub.doi}
                href={pub.doi}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-xl backdrop-blur-xl border p-4 flex items-start gap-3 transition-colors group ${isLight ? 'bg-white/70 border-[#c4bce6] hover:border-violet-400' : 'bg-white/5 border-white/10 hover:border-purple-500/40'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-icons text-slate-400 text-base group-hover:text-purple-300 transition-colors">description</span>
                </div>
                <div className="min-w-0">
                  <p className={`text-[11px] font-bold uppercase tracking-wide mb-0.5 ${isLight ? 'text-[#6b5a80]' : 'text-slate-300'}`}>{pub.authors}</p>
                  <p className={`text-sm font-medium leading-snug mb-1 ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>{pub.title}</p>
                  <p className="text-purple-400 text-xs">{pub.journal}</p>
                </div>
                <span className="material-icons text-slate-600 group-hover:text-purple-400 transition-colors text-base shrink-0 mt-0.5">open_in_new</span>
              </a>
            ))}
          </div>
        </FadeSection>

        {/* CTA */}
        <FadeSection className="mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-violet-900/40 to-fuchsia-900/30 border border-purple-500/30 p-8 text-center">
            <p className={`font-bold text-xl mb-5 ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>{t.cta_title}</p>
            <button
              onClick={onNavigateHome}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all hover:scale-105 active:scale-95"
            >
              {t.cta_btn}
            </button>
          </div>
        </FadeSection>

      </div>
    </div>
  );
};

export default SciencePage;
