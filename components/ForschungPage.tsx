import React from 'react';
import { Language } from '../types';
import LegalPage from './LegalPage';

interface ForschungPageProps {
  language: Language;
  onClose: () => void;
  themeMode?: string;
}

const TRANSLATIONS: Record<string, {
  title: string;
  foundation_h: string;
  foundation_p: string;
  sources_h: string;
  sddb_desc: string;
  dreambank_desc: string;
  historical_h: string;
  historical_desc: string;
  historical_names: string;
  ai_h: string;
  ai_p: string;
  hvdc_h: string;
  hvdc_p: string;
  ethics_h: string;
  ethics_p: string;
}> = {
  de: {
    title: 'Forschung & Methodik',
    foundation_h: 'Unsere wissenschaftliche Grundlage',
    foundation_p: 'DreamCode verbindet traditionelle Traumdeutung mit moderner KI-Technologie. Unsere Analysen basieren auf ueber 20 historischen und wissenschaftlichen Quellen.',
    sources_h: 'Datenquellen',
    sddb_desc: 'Ueber 30.000 Traumprotokolle aus wissenschaftlichen Studien',
    dreambank_desc: 'Umfangreiche Sammlung kodierter Traeume nach dem Hall-Van de Castle System',
    historical_h: 'Historische Quellen',
    historical_desc: 'Klassische Traumdeutungswerke aus verschiedenen Traditionen',
    historical_names: 'Ibn Sirin, Al-Nabulsi, Kirchenvaeter, tibetische und Zen-buddhistische Traditionen',
    ai_h: 'KI-Methodik',
    ai_p: 'Unsere KI nutzt Embedding-basierte Aehnlichkeitssuche ueber eine Vektordatenbank, um relevante Muster in historischen Traumprotokollen zu finden. Die Deutung kombiniert diese Muster mit quellenspezifischem Expertenwissen.',
    hvdc_h: 'Hall-Van de Castle Kodierung',
    hvdc_p: 'Wir verwenden das international anerkannte Hall-Van de Castle Kodiersystem zur Kategorisierung von Trauminhalten nach Emotionen, Charakteren, Interaktionen und Umgebungen.',
    ethics_h: 'Ethik & Transparenz',
    ethics_p: 'Alle Deutungen werden klar als KI-generiert gekennzeichnet. Wir empfehlen ausdruecklich, bei psychischen Belastungen professionelle Hilfe aufzusuchen. DreamCode ersetzt keine Therapie.',
  },
  en: {
    title: 'Research & Methodology',
    foundation_h: 'Our Scientific Foundation',
    foundation_p: 'DreamCode combines traditional dream interpretation with modern AI technology. Our analyses are based on over 20 historical and scientific sources.',
    sources_h: 'Data Sources',
    sddb_desc: 'Over 30,000 dream reports from scientific studies',
    dreambank_desc: 'Extensive collection of dreams coded using the Hall-Van de Castle system',
    historical_h: 'Historical Sources',
    historical_desc: 'Classical dream interpretation works from various traditions',
    historical_names: 'Ibn Sirin, Al-Nabulsi, Church Fathers, Tibetan and Zen Buddhist traditions',
    ai_h: 'AI Methodology',
    ai_p: 'Our AI uses embedding-based similarity search across a vector database to find relevant patterns in historical dream reports. Interpretation combines these patterns with source-specific expert knowledge.',
    hvdc_h: 'Hall-Van de Castle Coding',
    hvdc_p: 'We use the internationally recognized Hall-Van de Castle coding system to categorize dream content by emotions, characters, interactions, and settings.',
    ethics_h: 'Ethics & Transparency',
    ethics_p: 'All interpretations are clearly marked as AI-generated. We strongly recommend seeking professional help for mental health concerns. DreamCode is not a substitute for therapy.',
  },
  tr: {
    title: 'Araştırma ve Metodoloji',
    foundation_h: 'Bilimsel Temelimiz',
    foundation_p: 'DreamCode, geleneksel rüya yorumunu modern yapay zeka teknolojisiyle birleştirir. Analizlerimiz 20\'den fazla tarihsel ve bilimsel kaynağa dayanmaktadır.',
    sources_h: 'Veri Kaynakları',
    sddb_desc: 'Bilimsel çalışmalardan 30.000\'den fazla rüya raporu',
    dreambank_desc: 'Hall-Van de Castle sistemiyle kodlanmış kapsamlı rüya koleksiyonu',
    historical_h: 'Tarihi Kaynaklar',
    historical_desc: 'Çeşitli geleneklerden klasik rüya yorumu eserleri',
    historical_names: 'Ibn Sirin, Al-Nabulsi, Kilise Babaları, Tibet ve Zen Budist gelenekleri',
    ai_h: 'Yapay Zeka Metodolojisi',
    ai_p: 'Yapay zekamız, tarihi rüya raporlarındaki ilgili kalıpları bulmak için vektör veritabanı üzerinde gömme tabanlı benzerlik araması kullanır.',
    hvdc_h: 'Hall-Van de Castle Kodlaması',
    hvdc_p: 'Rüya içeriğini duygular, karakterler, etkileşimler ve ortamlara göre kategorize etmek için uluslararası alanda tanınan Hall-Van de Castle kodlama sistemini kullanıyoruz.',
    ethics_h: 'Etik ve Şeffaflık',
    ethics_p: 'Tüm yorumlar yapay zeka tarafından üretildiği şekilde açıkça işaretlenmiştir. Ruh sağlığı sorunları için profesyonel yardım aramanızı şiddetle tavsiye ederiz. DreamCode terapinin yerini alamaz.',
  },
  es: {
    title: 'Investigación y Metodología',
    foundation_h: 'Nuestra Base Científica',
    foundation_p: 'DreamCode combina la interpretación tradicional de sueños con tecnología moderna de IA. Nuestros análisis se basan en más de 20 fuentes históricas y científicas.',
    sources_h: 'Fuentes de Datos',
    sddb_desc: 'Más de 30.000 informes de sueños de estudios científicos',
    dreambank_desc: 'Extensa colección de sueños codificados con el sistema Hall-Van de Castle',
    historical_h: 'Fuentes Históricas',
    historical_desc: 'Obras clásicas de interpretación de sueños de diversas tradiciones',
    historical_names: 'Ibn Sirin, Al-Nabulsi, Padres de la Iglesia, tradiciones tibetanas y Zen budistas',
    ai_h: 'Metodología de IA',
    ai_p: 'Nuestra IA utiliza búsqueda de similitud basada en embeddings en una base de datos vectorial para encontrar patrones relevantes en informes históricos de sueños.',
    hvdc_h: 'Codificación Hall-Van de Castle',
    hvdc_p: 'Utilizamos el sistema de codificación Hall-Van de Castle, reconocido internacionalmente, para categorizar el contenido de los sueños por emociones, personajes, interacciones y entornos.',
    ethics_h: 'Ética y Transparencia',
    ethics_p: 'Todas las interpretaciones están claramente marcadas como generadas por IA. Recomendamos encarecidamente buscar ayuda profesional para problemas de salud mental. DreamCode no es un sustituto de la terapia.',
  },
  fr: {
    title: 'Recherche et Méthodologie',
    foundation_h: 'Notre Base Scientifique',
    foundation_p: 'DreamCode combine l\'interprétation traditionnelle des rêves avec la technologie d\'IA moderne. Nos analyses reposent sur plus de 20 sources historiques et scientifiques.',
    sources_h: 'Sources de Données',
    sddb_desc: 'Plus de 30 000 rapports de rêves issus d\'études scientifiques',
    dreambank_desc: 'Vaste collection de rêves codés selon le système Hall-Van de Castle',
    historical_h: 'Sources Historiques',
    historical_desc: 'Œuvres classiques d\'interprétation des rêves de diverses traditions',
    historical_names: 'Ibn Sirin, Al-Nabulsi, Pères de l\'Église, traditions tibétaines et Zen bouddhistes',
    ai_h: 'Méthodologie IA',
    ai_p: 'Notre IA utilise une recherche de similarité basée sur des embeddings dans une base de données vectorielle pour trouver des motifs pertinents dans les rapports de rêves historiques.',
    hvdc_h: 'Codage Hall-Van de Castle',
    hvdc_p: 'Nous utilisons le système de codage Hall-Van de Castle, reconnu internationalement, pour catégoriser le contenu des rêves par émotions, personnages, interactions et environnements.',
    ethics_h: 'Éthique et Transparence',
    ethics_p: 'Toutes les interprétations sont clairement identifiées comme générées par IA. Nous recommandons vivement de consulter un professionnel pour les problèmes de santé mentale. DreamCode ne remplace pas la thérapie.',
  },
  ar: {
    title: 'البحث والمنهجية',
    foundation_h: 'أساسنا العلمي',
    foundation_p: 'يجمع DreamCode تفسير الأحلام التقليدي مع تقنية الذكاء الاصطناعي الحديثة. تستند تحليلاتنا إلى أكثر من 20 مصدرًا تاريخيًا وعلميًا.',
    sources_h: 'مصادر البيانات',
    sddb_desc: 'أكثر من 30,000 تقرير حلم من دراسات علمية',
    dreambank_desc: 'مجموعة واسعة من الأحلام المشفرة وفق نظام Hall-Van de Castle',
    historical_h: 'المصادر التاريخية',
    historical_desc: 'أعمال تفسير الأحلام الكلاسيكية من تقاليد متنوعة',
    historical_names: 'ابن سيرين، النابلسي، آباء الكنيسة، التقاليد التبتية والزن البوذية',
    ai_h: 'منهجية الذكاء الاصطناعي',
    ai_p: 'يستخدم ذكاؤنا الاصطناعي البحث عن التشابه المعتمد على التضمين عبر قاعدة بيانات متجهة للعثور على أنماط ذات صلة في تقارير الأحلام التاريخية.',
    hvdc_h: 'ترميز Hall-Van de Castle',
    hvdc_p: 'نستخدم نظام ترميز Hall-Van de Castle المعترف به دوليًا لتصنيف محتوى الأحلام حسب المشاعر والشخصيات والتفاعلات والبيئات.',
    ethics_h: 'الأخلاق والشفافية',
    ethics_p: 'جميع التفسيرات مُصنَّفة بوضوح كمولَّدة بالذكاء الاصطناعي. نوصي بشدة بطلب مساعدة متخصصة لمشكلات الصحة النفسية. لا يُغني DreamCode عن العلاج.',
  },
  pt: {
    title: 'Pesquisa e Metodologia',
    foundation_h: 'Nossa Base Científica',
    foundation_p: 'DreamCode combina a interpretação tradicional de sonhos com tecnologia moderna de IA. Nossas análises baseiam-se em mais de 20 fontes históricas e científicas.',
    sources_h: 'Fontes de Dados',
    sddb_desc: 'Mais de 30.000 relatórios de sonhos de estudos científicos',
    dreambank_desc: 'Extensa coleção de sonhos codificados com o sistema Hall-Van de Castle',
    historical_h: 'Fontes Históricas',
    historical_desc: 'Obras clássicas de interpretação de sonhos de diversas tradições',
    historical_names: 'Ibn Sirin, Al-Nabulsi, Pais da Igreja, tradições tibetanas e Zen budistas',
    ai_h: 'Metodologia de IA',
    ai_p: 'Nossa IA usa busca de similaridade baseada em embeddings em um banco de dados vetorial para encontrar padrões relevantes em relatórios históricos de sonhos.',
    hvdc_h: 'Codificação Hall-Van de Castle',
    hvdc_p: 'Usamos o sistema de codificação Hall-Van de Castle, reconhecido internacionalmente, para categorizar o conteúdo dos sonhos por emoções, personagens, interações e ambientes.',
    ethics_h: 'Ética e Transparência',
    ethics_p: 'Todas as interpretações são claramente marcadas como geradas por IA. Recomendamos fortemente buscar ajuda profissional para problemas de saúde mental. DreamCode não substitui a terapia.',
  },
  ru: {
    title: 'Исследования и Методология',
    foundation_h: 'Наша Научная Основа',
    foundation_p: 'DreamCode сочетает традиционное толкование снов с современными технологиями ИИ. Наши анализы основаны на более чем 20 исторических и научных источниках.',
    sources_h: 'Источники Данных',
    sddb_desc: 'Более 30 000 отчётов о снах из научных исследований',
    dreambank_desc: 'Обширная коллекция снов, закодированных по системе Холла-Ван де Касла',
    historical_h: 'Исторические Источники',
    historical_desc: 'Классические произведения по толкованию снов из разных традиций',
    historical_names: 'Ибн Сирин, ан-Набулси, Отцы Церкви, тибетские и дзен-буддийские традиции',
    ai_h: 'Методология ИИ',
    ai_p: 'Наш ИИ использует поиск схожести на основе эмбеддингов в векторной базе данных для поиска релевантных паттернов в исторических отчётах о снах.',
    hvdc_h: 'Кодирование Холла-Ван де Касла',
    hvdc_p: 'Мы используем международно признанную систему кодирования Холла-Ван де Касла для категоризации содержимого снов по эмоциям, персонажам, взаимодействиям и обстановке.',
    ethics_h: 'Этика и Прозрачность',
    ethics_p: 'Все толкования чётко обозначены как сгенерированные ИИ. Мы настоятельно рекомендуем обращаться за профессиональной помощью при проблемах с психическим здоровьем. DreamCode не заменяет терапию.',
  },
};

const ForschungPage: React.FC<ForschungPageProps> = ({ language, onClose, themeMode }) => {
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  return (
    <LegalPage
      language={language}
      onClose={onClose}
      themeMode={themeMode}
      title={t.title}
    >
      <h2 className="text-xl font-bold mt-6 mb-2">{t.foundation_h}</h2>
      <p>{t.foundation_p}</p>

      <h2 className="text-xl font-bold mt-6 mb-2">{t.sources_h}</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>SDDb (Sleep and Dream Database)</strong> — {t.sddb_desc}
        </li>
        <li>
          <strong>DreamBank</strong> — {t.dreambank_desc}
        </li>
        <li>
          <strong>{t.historical_h}</strong> — {t.historical_names}
        </li>
      </ul>

      <h2 className="text-xl font-bold mt-6 mb-2">{t.ai_h}</h2>
      <p>{t.ai_p}</p>

      <h2 className="text-xl font-bold mt-6 mb-2">{t.hvdc_h}</h2>
      <p>{t.hvdc_p}</p>

      <h2 className="text-xl font-bold mt-6 mb-2">{t.ethics_h}</h2>
      <p>{t.ethics_p}</p>
    </LegalPage>
  );
};

export default ForschungPage;
