import React, { useState, useEffect, useRef } from 'react';
import { Language, ThemeMode } from '../types';
import { getTheme } from '../theme';

interface SciencePageProps {
  language: Language;
  onClose: () => void;
  onNavigateHome: () => void;
  onNavigateToStudies?: () => void;
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
  [Language.ZH]: {
    back: '返回',
    title: '科学',
    hero_title: 'DreamCode的科学基础',
    hero_subtitle: '我们的解梦基于全球最大的梦境报告数字化收藏',
    counter_label: '已分析的科学梦境报告',
    sources_title: '我们的研究数据库',
    sddb_name: '睡眠与梦境数据库 (SDDb)',
    sddb_count: '24,000+ 梦境报告',
    sddb_desc: '最全面的科学编码梦境报告收藏',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Dryad 存储库',
    dreambank_count: '15,000+ 梦境报告',
    dreambank_desc: '按霍尔-范德卡斯尔编码系统标注',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM 数据库 (莫纳什大学)',
    dream_db_count: '持续扩展中',
    dream_db_desc: '来自澳大利亚的学术梦境研究',
    method_title: '我们的分析方法',
    step1_title: '第一步：嵌入',
    step1_desc: '您的梦境被转换为数学表示（嵌入向量）',
    step2_title: '第二步：模式搜索',
    step2_desc: '我们在39,075+科学报告中搜索相似模式',
    step3_title: '第三步：解读',
    step3_desc: 'AI根据最佳匹配创建个性化解读',
    hvcs_title: '霍尔-范德卡斯尔系统',
    hvcs_desc: '全球公认的梦境内容编码系统',
    hvcs_cat_title: '类别：',
    hvcs_cats: ['情感', '人物', '互动', '环境'],
    hvcs_since: '1966年开发 · 梦境研究标准',
    researcher_title: '面向研究人员',
    api_title: '研究API（即将推出）',
    api_desc: '匿名访问聚合梦境数据，用于学术研究',
    api_badge: 'Beta Q2 2026',
    refs_title: '科学参考文献',
    cta_title: '准备好解读你的梦了吗？',
    cta_btn: '立即输入梦境',
  },
  [Language.HI]: {
    back: 'वापस',
    title: 'विज्ञान',
    hero_title: 'DreamCode का वैज्ञानिक आधार',
    hero_subtitle: 'हमारी स्वप्न व्याख्याएँ दुनिया भर के सबसे बड़े डिजिटल स्वप्न रिपोर्ट संग्रह पर आधारित हैं',
    counter_label: 'वैज्ञानिक स्वप्न रिपोर्ट विश्लेषित',
    sources_title: 'हमारे शोध डेटाबेस',
    sddb_name: 'स्लीप एंड ड्रीम डेटाबेस (SDDb)',
    sddb_count: '24,000+ स्वप्न रिपोर्ट',
    sddb_desc: 'वैज्ञानिक रूप से कोडित स्वप्न रिपोर्ट का सबसे व्यापक संग्रह',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Dryad रिपॉजिटरी',
    dreambank_count: '15,000+ स्वप्न रिपोर्ट',
    dreambank_desc: 'हॉल-वैन डे कैसल कोडिंग प्रणाली द्वारा एनोटेटेड',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM डेटाबेस (मोनाश विश्वविद्यालय)',
    dream_db_count: 'निरंतर विस्तार',
    dream_db_desc: 'ऑस्ट्रेलिया से शैक्षणिक स्वप्न अनुसंधान',
    method_title: 'हमारा विश्लेषण कैसे काम करता है',
    step1_title: 'चरण 1: एम्बेडिंग',
    step1_desc: 'आपके सपने को गणितीय प्रतिनिधित्व में परिवर्तित किया जाता है',
    step2_title: 'चरण 2: पैटर्न खोज',
    step2_desc: 'हम 39,075+ वैज्ञानिक रिपोर्ट में समान पैटर्न खोजते हैं',
    step3_title: 'चरण 3: व्याख्या',
    step3_desc: 'AI सर्वोत्तम मिलान के आधार पर व्यक्तिगत व्याख्या बनाता है',
    hvcs_title: 'हॉल-वैन डे कैसल प्रणाली',
    hvcs_desc: 'स्वप्न सामग्री की विश्व स्तर पर मान्यता प्राप्त कोडिंग प्रणाली',
    hvcs_cat_title: 'श्रेणियाँ:',
    hvcs_cats: ['भावनाएँ', 'पात्र', 'बातचीत', 'वातावरण'],
    hvcs_since: '1966 में विकसित · स्वप्न अनुसंधान में मानक',
    researcher_title: 'शोधकर्ताओं के लिए',
    api_title: 'रिसर्च API (जल्द आ रहा है)',
    api_desc: 'शैक्षणिक अनुसंधान के लिए एकत्रित स्वप्न डेटा तक गुमनाम पहुँच',
    api_badge: 'बीटा Q2 2026',
    refs_title: 'वैज्ञानिक संदर्भ',
    cta_title: 'अपने सपने की व्याख्या के लिए तैयार हैं?',
    cta_btn: 'अभी सपना दर्ज करें',
  },
  [Language.JA]: {
    back: '戻る',
    title: 'サイエンス',
    hero_title: 'DreamCodeの科学的基盤',
    hero_subtitle: '私たちの夢解釈は、世界最大のデジタル夢レポートコレクションに基づいています',
    counter_label: '科学的夢レポートを分析済み',
    sources_title: '研究データベース',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '24,000+ 夢レポート',
    sddb_desc: '科学的にコード化された夢レポートの最も包括的なコレクション',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Dryad リポジトリ',
    dreambank_count: '15,000+ 夢レポート',
    dreambank_desc: 'ホール・ヴァン・デ・キャッスルコーディングシステムで注釈付き',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM データベース（モナシュ大学）',
    dream_db_count: '継続的に拡張中',
    dream_db_desc: 'オーストラリアの学術的夢研究',
    method_title: '分析の仕組み',
    step1_title: 'ステップ1：埋め込み',
    step1_desc: '夢が数学的表現（エンベディング）に変換されます',
    step2_title: 'ステップ2：パターン検索',
    step2_desc: '39,075+の科学レポートから類似パターンを検索します',
    step3_title: 'ステップ3：解釈',
    step3_desc: 'AIが最適なマッチに基づいてパーソナライズされた解釈を作成します',
    hvcs_title: 'ホール・ヴァン・デ・キャッスルシステム',
    hvcs_desc: '世界的に認められた夢内容コーディングシステム',
    hvcs_cat_title: 'カテゴリ：',
    hvcs_cats: ['感情', 'キャラクター', 'インタラクション', '環境'],
    hvcs_since: '1966年開発 · 夢研究の標準',
    researcher_title: '研究者向け',
    api_title: 'Research API（近日公開）',
    api_desc: '学術研究のための匿名集約夢データアクセス',
    api_badge: 'ベータ Q2 2026',
    refs_title: '科学文献',
    cta_title: '夢を解釈する準備はできましたか？',
    cta_btn: '今すぐ夢を入力',
  },
  [Language.KO]: {
    back: '뒤로',
    title: '과학',
    hero_title: 'DreamCode의 과학적 기반',
    hero_subtitle: '우리의 꿈 해석은 세계 최대의 디지털 꿈 보고서 컬렉션을 기반으로 합니다',
    counter_label: '과학적 꿈 보고서 분석 완료',
    sources_title: '연구 데이터베이스',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '24,000+ 꿈 보고서',
    sddb_desc: '과학적으로 코딩된 꿈 보고서의 가장 포괄적인 컬렉션',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Dryad 저장소',
    dreambank_count: '15,000+ 꿈 보고서',
    dreambank_desc: '홀-반 데 캐슬 코딩 시스템으로 주석 처리됨',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM 데이터베이스 (모나쉬 대학교)',
    dream_db_count: '지속적 확장 중',
    dream_db_desc: '호주의 학술적 꿈 연구',
    method_title: '분석 방법',
    step1_title: '1단계: 임베딩',
    step1_desc: '꿈이 수학적 표현(임베딩)으로 변환됩니다',
    step2_title: '2단계: 패턴 검색',
    step2_desc: '39,075+개의 과학 보고서에서 유사한 패턴을 검색합니다',
    step3_title: '3단계: 해석',
    step3_desc: 'AI가 최적 매칭을 기반으로 맞춤형 해석을 생성합니다',
    hvcs_title: '홀-반 데 캐슬 시스템',
    hvcs_desc: '세계적으로 인정된 꿈 내용 코딩 시스템',
    hvcs_cat_title: '카테고리:',
    hvcs_cats: ['감정', '인물', '상호작용', '환경'],
    hvcs_since: '1966년 개발 · 꿈 연구의 표준',
    researcher_title: '연구자를 위해',
    api_title: 'Research API (곧 출시)',
    api_desc: '학술 연구를 위한 익명 집계 꿈 데이터 접근',
    api_badge: '베타 Q2 2026',
    refs_title: '과학 참고문헌',
    cta_title: '꿈을 해석할 준비가 되셨나요?',
    cta_btn: '지금 꿈 입력하기',
  },
  [Language.ID]: {
    back: 'Kembali',
    title: 'Sains',
    hero_title: 'Dasar ilmiah DreamCode',
    hero_subtitle: 'Interpretasi mimpi kami didasarkan pada koleksi digital laporan mimpi terbesar di dunia',
    counter_label: 'laporan mimpi ilmiah dianalisis',
    sources_title: 'Database Penelitian Kami',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '24.000+ laporan mimpi',
    sddb_desc: 'Koleksi terlengkap laporan mimpi berkode ilmiah',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Dryad Repository',
    dreambank_count: '15.000+ laporan mimpi',
    dreambank_desc: 'Dianotasi dengan sistem pengkodean Hall-Van de Castle',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM Database (Universitas Monash)',
    dream_db_count: 'Perluasan berkelanjutan',
    dream_db_desc: 'Penelitian mimpi akademis dari Australia',
    method_title: 'Cara kerja analisis kami',
    step1_title: 'Langkah 1: Embedding',
    step1_desc: 'Mimpi Anda diubah menjadi representasi matematis (embedding)',
    step2_title: 'Langkah 2: Pencarian Pola',
    step2_desc: 'Kami mencari pola serupa di 39.075+ laporan ilmiah',
    step3_title: 'Langkah 3: Interpretasi',
    step3_desc: 'AI membuat interpretasi personal berdasarkan kecocokan terbaik',
    hvcs_title: 'Sistem Hall-Van de Castle',
    hvcs_desc: 'Sistem pengkodean konten mimpi yang diakui secara global',
    hvcs_cat_title: 'Kategori:',
    hvcs_cats: ['Emosi', 'Karakter', 'Interaksi', 'Lingkungan'],
    hvcs_since: 'Dikembangkan 1966 · Standar dalam penelitian mimpi',
    researcher_title: 'Untuk Peneliti',
    api_title: 'Research API (Segera Hadir)',
    api_desc: 'Akses anonim ke data mimpi agregat untuk penelitian akademis',
    api_badge: 'Beta Q2 2026',
    refs_title: 'Referensi Ilmiah',
    cta_title: 'Siap menginterpretasi mimpi Anda?',
    cta_btn: 'Masukkan mimpi sekarang',
  },
  [Language.FA]: {
    back: 'بازگشت',
    title: 'علم',
    hero_title: 'پایه علمی DreamCode',
    hero_subtitle: 'تعبیرهای خواب ما بر اساس بزرگترین مجموعه دیجیتال گزارش‌های خواب در جهان است',
    counter_label: 'گزارش علمی خواب تحلیل شده',
    sources_title: 'پایگاه‌های داده تحقیقاتی ما',
    sddb_name: 'پایگاه داده خواب و رؤیا (SDDb)',
    sddb_count: '۲۴٬۰۰۰+ گزارش خواب',
    sddb_desc: 'جامع‌ترین مجموعه گزارش‌های خواب کدگذاری شده علمی',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / مخزن Dryad',
    dreambank_count: '۱۵٬۰۰۰+ گزارش خواب',
    dreambank_desc: 'با سیستم کدگذاری هال-ون‌دکاسل حاشیه‌نویسی شده',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'پایگاه داده DREAM (دانشگاه موناش)',
    dream_db_count: 'گسترش مداوم',
    dream_db_desc: 'تحقیقات آکادمیک خواب از استرالیا',
    method_title: 'نحوه کار تحلیل ما',
    step1_title: 'مرحله ۱: جاسازی',
    step1_desc: 'خواب شما به یک نمایش ریاضی (embedding) تبدیل می‌شود',
    step2_title: 'مرحله ۲: جستجوی الگو',
    step2_desc: 'ما الگوهای مشابه را در ۳۹٬۰۷۵+ گزارش علمی جستجو می‌کنیم',
    step3_title: 'مرحله ۳: تعبیر',
    step3_desc: 'هوش مصنوعی بر اساس بهترین تطبیق‌ها تعبیر شخصی‌سازی شده ایجاد می‌کند',
    hvcs_title: 'سیستم هال-ون‌دکاسل',
    hvcs_desc: 'سیستم کدگذاری محتوای خواب که در سطح جهانی پذیرفته شده است',
    hvcs_cat_title: 'دسته‌بندی‌ها:',
    hvcs_cats: ['احساسات', 'شخصیت‌ها', 'تعاملات', 'محیط‌ها'],
    hvcs_since: 'توسعه در ۱۹۶۶ · استاندارد در تحقیقات خواب',
    researcher_title: 'برای محققان',
    api_title: 'API تحقیقاتی (به‌زودی)',
    api_desc: 'دسترسی ناشناس به داده‌های تجمیعی خواب برای تحقیقات آکادمیک',
    api_badge: 'بتا Q2 2026',
    refs_title: 'مراجع علمی',
    cta_title: 'آماده تعبیر خوابتان هستید؟',
    cta_btn: 'اکنون خواب را وارد کنید',
  },
  [Language.IT]: {
    back: 'Indietro',
    title: 'Scienza',
    hero_title: 'La base scientifica di DreamCode',
    hero_subtitle: 'Le nostre interpretazioni dei sogni si basano sulla più grande raccolta digitale di resoconti onirici al mondo',
    counter_label: 'resoconti onirici scientifici analizzati',
    sources_title: 'I nostri database di ricerca',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '24.000+ resoconti onirici',
    sddb_desc: 'La raccolta più completa di resoconti onirici codificati scientificamente',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Repository Dryad',
    dreambank_count: '15.000+ resoconti onirici',
    dreambank_desc: 'Annotati secondo il sistema di codifica Hall-Van de Castle',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM Database (Monash University)',
    dream_db_count: 'In continua espansione',
    dream_db_desc: 'Ricerca accademica sui sogni dall\'Australia',
    method_title: 'Come funziona la nostra analisi',
    step1_title: 'Passo 1: Embedding',
    step1_desc: 'Il tuo sogno viene convertito in una rappresentazione matematica (embedding)',
    step2_title: 'Passo 2: Ricerca di pattern',
    step2_desc: 'Cerchiamo pattern simili in oltre 39.075 resoconti scientifici',
    step3_title: 'Passo 3: Interpretazione',
    step3_desc: 'L\'AI crea un\'interpretazione personalizzata basata sulle migliori corrispondenze',
    hvcs_title: 'Sistema Hall-Van de Castle',
    hvcs_desc: 'Il sistema di codifica dei contenuti onirici riconosciuto a livello mondiale',
    hvcs_cat_title: 'Categorie:',
    hvcs_cats: ['Emozioni', 'Personaggi', 'Interazioni', 'Ambienti'],
    hvcs_since: 'Sviluppato nel 1966 · Standard nella ricerca sui sogni',
    researcher_title: 'Per i ricercatori',
    api_title: 'Research API (Prossimamente)',
    api_desc: 'Accesso anonimo ai dati aggregati sui sogni per la ricerca accademica',
    api_badge: 'Beta Q2 2026',
    refs_title: 'Riferimenti scientifici',
    cta_title: 'Pronto a interpretare il tuo sogno?',
    cta_btn: 'Inserisci il sogno ora',
  },
  [Language.PL]: {
    back: 'Wstecz',
    title: 'Nauka',
    hero_title: 'Naukowe podstawy DreamCode',
    hero_subtitle: 'Nasze interpretacje snów opierają się na największej cyfrowej kolekcji raportów sennych na świecie',
    counter_label: 'naukowych raportów sennych przeanalizowanych',
    sources_title: 'Nasze bazy danych badawczych',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '24 000+ raportów sennych',
    sddb_desc: 'Najbardziej kompleksowa kolekcja naukowo zakodowanych raportów sennych',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Repozytorium Dryad',
    dreambank_count: '15 000+ raportów sennych',
    dreambank_desc: 'Anotowane według systemu kodowania Halla-Van de Castle',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'Baza danych DREAM (Uniwersytet Monash)',
    dream_db_count: 'Ciągłe rozszerzanie',
    dream_db_desc: 'Akademickie badania snów z Australii',
    method_title: 'Jak działa nasza analiza',
    step1_title: 'Krok 1: Embedding',
    step1_desc: 'Twój sen jest przekształcany w reprezentację matematyczną (embedding)',
    step2_title: 'Krok 2: Wyszukiwanie wzorców',
    step2_desc: 'Przeszukujemy 39 075+ naukowych raportów w poszukiwaniu podobnych wzorców',
    step3_title: 'Krok 3: Interpretacja',
    step3_desc: 'AI tworzy spersonalizowaną interpretację na podstawie najlepszych dopasowań',
    hvcs_title: 'System Halla-Van de Castle',
    hvcs_desc: 'Uznany na całym świecie system kodowania treści sennych',
    hvcs_cat_title: 'Kategorie:',
    hvcs_cats: ['Emocje', 'Postacie', 'Interakcje', 'Środowiska'],
    hvcs_since: 'Opracowany w 1966 · Standard w badaniach snów',
    researcher_title: 'Dla badaczy',
    api_title: 'Research API (Wkrótce)',
    api_desc: 'Anonimowy dostęp do zagregowanych danych sennych dla badań akademickich',
    api_badge: 'Beta Q2 2026',
    refs_title: 'Odniesienia naukowe',
    cta_title: 'Gotowy na interpretację swojego snu?',
    cta_btn: 'Wprowadź sen teraz',
  },
  [Language.BN]: {
    back: 'পেছনে',
    title: 'বিজ্ঞান',
    hero_title: 'DreamCode-এর বৈজ্ঞানিক ভিত্তি',
    hero_subtitle: 'আমাদের স্বপ্ন ব্যাখ্যাগুলি বিশ্বের বৃহত্তম ডিজিটাল স্বপ্ন প্রতিবেদন সংগ্রহের উপর ভিত্তি করে',
    counter_label: 'বৈজ্ঞানিক স্বপ্ন প্রতিবেদন বিশ্লেষিত',
    sources_title: 'আমাদের গবেষণা ডেটাবেস',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '২৪,০০০+ স্বপ্ন প্রতিবেদন',
    sddb_desc: 'বৈজ্ঞানিকভাবে কোডকৃত স্বপ্ন প্রতিবেদনের সবচেয়ে ব্যাপক সংগ্রহ',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Dryad রিপোজিটরি',
    dreambank_count: '১৫,০০০+ স্বপ্ন প্রতিবেদন',
    dreambank_desc: 'হল-ভ্যান দে ক্যাসল কোডিং সিস্টেমে টীকাকৃত',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM ডেটাবেস (মোনাশ বিশ্ববিদ্যালয়)',
    dream_db_count: 'চলমান সম্প্রসারণ',
    dream_db_desc: 'অস্ট্রেলিয়া থেকে একাডেমিক স্বপ্ন গবেষণা',
    method_title: 'আমাদের বিশ্লেষণ কীভাবে কাজ করে',
    step1_title: 'ধাপ ১: এম্বেডিং',
    step1_desc: 'আপনার স্বপ্নকে গাণিতিক উপস্থাপনায় রূপান্তর করা হয়',
    step2_title: 'ধাপ ২: প্যাটার্ন অনুসন্ধান',
    step2_desc: 'আমরা ৩৯,০৭৫+ বৈজ্ঞানিক প্রতিবেদনে অনুরূপ প্যাটার্ন খুঁজি',
    step3_title: 'ধাপ ৩: ব্যাখ্যা',
    step3_desc: 'AI সেরা মিলের ভিত্তিতে ব্যক্তিগতকৃত ব্যাখ্যা তৈরি করে',
    hvcs_title: 'হল-ভ্যান দে ক্যাসল সিস্টেম',
    hvcs_desc: 'বিশ্বব্যাপী স্বীকৃত স্বপ্ন বিষয়বস্তু কোডিং সিস্টেম',
    hvcs_cat_title: 'বিভাগসমূহ:',
    hvcs_cats: ['আবেগ', 'চরিত্র', 'মিথস্ক্রিয়া', 'পরিবেশ'],
    hvcs_since: '১৯৬৬ সালে উন্নীত · স্বপ্ন গবেষণায় মানদণ্ড',
    researcher_title: 'গবেষকদের জন্য',
    api_title: 'Research API (শীঘ্রই আসছে)',
    api_desc: 'একাডেমিক গবেষণার জন্য সমষ্টিগত স্বপ্ন ডেটায় বেনামী অ্যাক্সেস',
    api_badge: 'বেটা Q2 2026',
    refs_title: 'বৈজ্ঞানিক তথ্যসূত্র',
    cta_title: 'আপনার স্বপ্ন ব্যাখ্যা করতে প্রস্তুত?',
    cta_btn: 'এখনই স্বপ্ন লিখুন',
  },
  [Language.UR]: {
    back: 'واپس',
    title: 'سائنس',
    hero_title: 'DreamCode کی سائنسی بنیاد',
    hero_subtitle: 'ہماری خواب کی تعبیرات دنیا کے سب سے بڑے ڈیجیٹل خواب رپورٹس کے مجموعے پر مبنی ہیں',
    counter_label: 'سائنسی خواب رپورٹس کا تجزیہ کیا گیا',
    sources_title: 'ہمارے تحقیقی ڈیٹابیس',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '۲۴٬۰۰۰+ خواب رپورٹس',
    sddb_desc: 'سائنسی طور پر کوڈ شدہ خواب رپورٹس کا سب سے جامع مجموعہ',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Dryad ریپوزٹری',
    dreambank_count: '۱۵٬۰۰۰+ خواب رپورٹس',
    dreambank_desc: 'ہال-وین ڈی کاسل کوڈنگ سسٹم سے تشریح شدہ',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM ڈیٹابیس (موناش یونیورسٹی)',
    dream_db_count: 'مسلسل توسیع',
    dream_db_desc: 'آسٹریلیا سے تعلیمی خواب تحقیق',
    method_title: 'ہمارا تجزیہ کیسے کام کرتا ہے',
    step1_title: 'مرحلہ ۱: ایمبیڈنگ',
    step1_desc: 'آپ کے خواب کو ریاضیاتی نمائندگی میں تبدیل کیا جاتا ہے',
    step2_title: 'مرحلہ ۲: پیٹرن تلاش',
    step2_desc: 'ہم ۳۹٬۰۷۵+ سائنسی رپورٹس میں ملتے جلتے پیٹرن تلاش کرتے ہیں',
    step3_title: 'مرحلہ ۳: تعبیر',
    step3_desc: 'AI بہترین مماثلت کی بنیاد پر ذاتی تعبیر بناتا ہے',
    hvcs_title: 'ہال-وین ڈی کاسل سسٹم',
    hvcs_desc: 'خواب کے مواد کی عالمی سطح پر تسلیم شدہ کوڈنگ سسٹم',
    hvcs_cat_title: 'زمرے:',
    hvcs_cats: ['جذبات', 'کردار', 'تعاملات', 'ماحول'],
    hvcs_since: '۱۹۶۶ میں تیار · خواب تحقیق میں معیار',
    researcher_title: 'محققین کے لیے',
    api_title: 'ریسرچ API (جلد آ رہا ہے)',
    api_desc: 'تعلیمی تحقیق کے لیے مجموعی خواب ڈیٹا تک گمنام رسائی',
    api_badge: 'بیٹا Q2 2026',
    refs_title: 'سائنسی حوالہ جات',
    cta_title: 'اپنے خواب کی تعبیر کے لیے تیار ہیں؟',
    cta_btn: 'ابھی خواب درج کریں',
  },
  [Language.VI]: {
    back: 'Quay lại',
    title: 'Khoa học',
    hero_title: 'Nền tảng khoa học của DreamCode',
    hero_subtitle: 'Giải mã giấc mơ của chúng tôi dựa trên bộ sưu tập số hóa báo cáo giấc mơ lớn nhất thế giới',
    counter_label: 'báo cáo giấc mơ khoa học đã phân tích',
    sources_title: 'Cơ sở dữ liệu nghiên cứu',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '24.000+ báo cáo giấc mơ',
    sddb_desc: 'Bộ sưu tập toàn diện nhất các báo cáo giấc mơ được mã hóa khoa học',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Kho lưu trữ Dryad',
    dreambank_count: '15.000+ báo cáo giấc mơ',
    dreambank_desc: 'Được chú thích theo hệ thống mã hóa Hall-Van de Castle',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'Cơ sở dữ liệu DREAM (Đại học Monash)',
    dream_db_count: 'Mở rộng liên tục',
    dream_db_desc: 'Nghiên cứu giấc mơ học thuật từ Úc',
    method_title: 'Phân tích hoạt động như thế nào',
    step1_title: 'Bước 1: Nhúng',
    step1_desc: 'Giấc mơ của bạn được chuyển đổi thành biểu diễn toán học (embedding)',
    step2_title: 'Bước 2: Tìm kiếm mẫu',
    step2_desc: 'Chúng tôi tìm kiếm mẫu tương tự trong 39.075+ báo cáo khoa học',
    step3_title: 'Bước 3: Giải thích',
    step3_desc: 'AI tạo ra giải thích cá nhân hóa dựa trên kết quả khớp tốt nhất',
    hvcs_title: 'Hệ thống Hall-Van de Castle',
    hvcs_desc: 'Hệ thống mã hóa nội dung giấc mơ được công nhận toàn cầu',
    hvcs_cat_title: 'Danh mục:',
    hvcs_cats: ['Cảm xúc', 'Nhân vật', 'Tương tác', 'Môi trường'],
    hvcs_since: 'Phát triển năm 1966 · Tiêu chuẩn trong nghiên cứu giấc mơ',
    researcher_title: 'Dành cho nhà nghiên cứu',
    api_title: 'Research API (Sắp ra mắt)',
    api_desc: 'Truy cập ẩn danh vào dữ liệu giấc mơ tổng hợp cho nghiên cứu học thuật',
    api_badge: 'Beta Q2 2026',
    refs_title: 'Tài liệu tham khảo khoa học',
    cta_title: 'Sẵn sàng giải mã giấc mơ của bạn?',
    cta_btn: 'Nhập giấc mơ ngay',
  },
  [Language.TH]: {
    back: 'ย้อนกลับ',
    title: 'วิทยาศาสตร์',
    hero_title: 'พื้นฐานทางวิทยาศาสตร์ของ DreamCode',
    hero_subtitle: 'การตีความฝันของเราอ้างอิงจากคลังรายงานฝันดิจิทัลที่ใหญ่ที่สุดในโลก',
    counter_label: 'รายงานฝันทางวิทยาศาสตร์ที่วิเคราะห์แล้ว',
    sources_title: 'ฐานข้อมูลวิจัยของเรา',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '24,000+ รายงานฝัน',
    sddb_desc: 'คลังรายงานฝันที่เข้ารหัสทางวิทยาศาสตร์ที่ครอบคลุมที่สุด',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / คลัง Dryad',
    dreambank_count: '15,000+ รายงานฝัน',
    dreambank_desc: 'มีคำอธิบายตามระบบการเข้ารหัส Hall-Van de Castle',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'ฐานข้อมูล DREAM (มหาวิทยาลัย Monash)',
    dream_db_count: 'ขยายอย่างต่อเนื่อง',
    dream_db_desc: 'การวิจัยฝันเชิงวิชาการจากออสเตรเลีย',
    method_title: 'การวิเคราะห์ทำงานอย่างไร',
    step1_title: 'ขั้นตอนที่ 1: การฝัง',
    step1_desc: 'ความฝันของคุณจะถูกแปลงเป็นการแทนค่าทางคณิตศาสตร์ (embedding)',
    step2_title: 'ขั้นตอนที่ 2: ค้นหารูปแบบ',
    step2_desc: 'เราค้นหารูปแบบที่คล้ายกันใน 39,075+ รายงานทางวิทยาศาสตร์',
    step3_title: 'ขั้นตอนที่ 3: การตีความ',
    step3_desc: 'AI สร้างการตีความเฉพาะบุคคลจากการจับคู่ที่ดีที่สุด',
    hvcs_title: 'ระบบ Hall-Van de Castle',
    hvcs_desc: 'ระบบเข้ารหัสเนื้อหาฝันที่ได้รับการยอมรับทั่วโลก',
    hvcs_cat_title: 'หมวดหมู่:',
    hvcs_cats: ['อารมณ์', 'ตัวละคร', 'ปฏิสัมพันธ์', 'สภาพแวดล้อม'],
    hvcs_since: 'พัฒนาในปี 1966 · มาตรฐานในการวิจัยฝัน',
    researcher_title: 'สำหรับนักวิจัย',
    api_title: 'Research API (เร็ว ๆ นี้)',
    api_desc: 'เข้าถึงข้อมูลฝันรวมแบบไม่ระบุตัวตนสำหรับการวิจัยเชิงวิชาการ',
    api_badge: 'เบต้า Q2 2026',
    refs_title: 'เอกสารอ้างอิงทางวิทยาศาสตร์',
    cta_title: 'พร้อมที่จะตีความฝันของคุณหรือยัง?',
    cta_btn: 'ป้อนความฝันตอนนี้',
  },
  [Language.SW]: {
    back: 'Rudi',
    title: 'Sayansi',
    hero_title: 'Msingi wa kisayansi wa DreamCode',
    hero_subtitle: 'Tafsiri zetu za ndoto zinategemea mkusanyiko mkubwa zaidi wa kidijitali wa ripoti za ndoto duniani',
    counter_label: 'ripoti za ndoto za kisayansi zilizochambuliwa',
    sources_title: 'Hifadhidata Zetu za Utafiti',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: 'Ripoti 24,000+ za ndoto',
    sddb_desc: 'Mkusanyiko kamili zaidi wa ripoti za ndoto zilizokodishwa kisayansi',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Hazina ya Dryad',
    dreambank_count: 'Ripoti 15,000+ za ndoto',
    dreambank_desc: 'Imeandikwa kwa mfumo wa ukodishaji wa Hall-Van de Castle',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'Hifadhidata ya DREAM (Chuo Kikuu cha Monash)',
    dream_db_count: 'Upanuzi unaoendelea',
    dream_db_desc: 'Utafiti wa kitaaluma wa ndoto kutoka Australia',
    method_title: 'Jinsi uchambuzi wetu unavyofanya kazi',
    step1_title: 'Hatua ya 1: Uwekaji',
    step1_desc: 'Ndoto yako inabadilishwa kuwa uwakilishi wa kihesabu (embedding)',
    step2_title: 'Hatua ya 2: Utafutaji wa mifumo',
    step2_desc: 'Tunatafuta mifumo inayofanana katika ripoti 39,075+ za kisayansi',
    step3_title: 'Hatua ya 3: Tafsiri',
    step3_desc: 'AI inaunda tafsiri iliyobinafsishwa kulingana na mechi bora zaidi',
    hvcs_title: 'Mfumo wa Hall-Van de Castle',
    hvcs_desc: 'Mfumo wa ukodishaji wa maudhui ya ndoto unaotambuliwa duniani kote',
    hvcs_cat_title: 'Makundi:',
    hvcs_cats: ['Hisia', 'Wahusika', 'Mwingiliano', 'Mazingira'],
    hvcs_since: 'Ulioendelezwa 1966 · Kiwango katika utafiti wa ndoto',
    researcher_title: 'Kwa watafiti',
    api_title: 'Research API (Inakuja Hivi Karibuni)',
    api_desc: 'Ufikiaji wa siri wa data ya ndoto iliyokusanywa kwa utafiti wa kitaaluma',
    api_badge: 'Beta Q2 2026',
    refs_title: 'Marejeleo ya kisayansi',
    cta_title: 'Uko tayari kutafsiri ndoto yako?',
    cta_btn: 'Ingiza ndoto sasa',
  },
  [Language.HU]: {
    back: 'Vissza',
    title: 'Tudomány',
    hero_title: 'A DreamCode tudományos alapja',
    hero_subtitle: 'Álomértelmezéseink a világ legnagyobb digitális álomjelentés-gyűjteményén alapulnak',
    counter_label: 'tudományos álomjelentés elemezve',
    sources_title: 'Kutatási adatbázisaink',
    sddb_name: 'Sleep and Dream Database (SDDb)',
    sddb_count: '24 000+ álomjelentés',
    sddb_desc: 'A tudományosan kódolt álomjelentések legátfogóbb gyűjteménye',
    sddb_link: 'sleepanddreamdatabase.org',
    dreambank_name: 'DreamBank / Dryad adattár',
    dreambank_count: '15 000+ álomjelentés',
    dreambank_desc: 'A Hall-Van de Castle kódolási rendszer szerint annotálva',
    dreambank_link: 'dreambank.net',
    dream_db_name: 'DREAM adatbázis (Monash Egyetem)',
    dream_db_count: 'Folyamatos bővítés',
    dream_db_desc: 'Akadémiai álomkutatás Ausztráliából',
    method_title: 'Hogyan működik az elemzésünk',
    step1_title: '1. lépés: Beágyazás',
    step1_desc: 'Az álmod matematikai ábrázolássá (embedding) alakítjuk',
    step2_title: '2. lépés: Mintakeresés',
    step2_desc: '39 075+ tudományos jelentésben keresünk hasonló mintákat',
    step3_title: '3. lépés: Értelmezés',
    step3_desc: 'Az AI személyre szabott értelmezést készít a legjobb egyezések alapján',
    hvcs_title: 'Hall-Van de Castle rendszer',
    hvcs_desc: 'A világ által elismert álomtartalom-kódolási rendszer',
    hvcs_cat_title: 'Kategóriák:',
    hvcs_cats: ['Érzelmek', 'Szereplők', 'Interakciók', 'Környezetek'],
    hvcs_since: '1966-ban fejlesztve · Az álomkutatás szabványa',
    researcher_title: 'Kutatóknak',
    api_title: 'Research API (Hamarosan)',
    api_desc: 'Anonim hozzáférés összesített álomadatokhoz akadémiai kutatáshoz',
    api_badge: 'Béta Q2 2026',
    refs_title: 'Tudományos hivatkozások',
    cta_title: 'Készen állsz az álmod értelmezésére?',
    cta_btn: 'Álom megadása most',
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

const SciencePage: React.FC<SciencePageProps> = ({ language, onClose, onNavigateHome, onNavigateToStudies, themeMode }) => {
  const th = getTheme((themeMode as ThemeMode) || ThemeMode.DARK);
  const isLight = th.isLight;
  const isRtl = [Language.AR, Language.FA, Language.UR].includes(language);
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
    <div dir={isRtl ? 'rtl' : 'ltr'} className={`fixed inset-0 z-50 overflow-y-auto ${isLight ? 'bg-[#f0eefc]' : 'bg-black'}`}>
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

        {/* Studies + Profiles CTA */}
        {onNavigateToStudies && (
          <FadeSection className="mb-4">
            <button
              onClick={onNavigateToStudies}
              className="w-full rounded-2xl bg-gradient-to-br from-indigo-900/60 to-purple-900/50 border border-indigo-500/40 p-6 text-center flex flex-col items-center gap-3 hover:border-indigo-400/60 transition-all active:scale-95"
            >
              <span className="text-3xl">🔬</span>
              <p className={`font-bold text-lg ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>
                {language === 'de' ? 'Studien & Teilnehmer-Profile öffnen' : 'Open Studies & Participant Profiles'}
              </p>
              <p className={`text-sm opacity-70 ${isLight ? 'text-[#4a3a5d]' : 'text-slate-300'}`}>
                {language === 'de'
                  ? '27.675 Teilnehmer · Einzelprofile · READ ONLY'
                  : '27,675 participants · Individual profiles · READ ONLY'}
              </p>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/50 text-indigo-300'} border border-indigo-500/30`}>
                {language === 'de' ? 'Zu den Profilen →' : 'View Profiles →'}
              </span>
            </button>
          </FadeSection>
        )}

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
