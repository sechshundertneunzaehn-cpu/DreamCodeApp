import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import symbolData from '../data/traumsymbole.json';
import { useSymbolSearch } from '../hooks/useSymbolSearch';

const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'] as const;

const TRANSLATED_HINT: Record<string, (q: string, to: string) => string> = {
  de: (q, to) => `Übersetzt: ${q} → ${to}`,
  en: (q, to) => `Translated: ${q} → ${to}`,
  ar: (q, to) => `تُرجم: ${q} ← ${to}`,
  tr: (q, to) => `Çevrildi: ${q} → ${to}`,
  ru: (q, to) => `Переведено: ${q} → ${to}`,
  fr: (q, to) => `Traduit : ${q} → ${to}`,
  es: (q, to) => `Traducido: ${q} → ${to}`,
  it: (q, to) => `Tradotto: ${q} → ${to}`,
  pt: (q, to) => `Traduzido: ${q} → ${to}`,
  fa: (q, to) => `ترجمه شد: ${q} ← ${to}`,
  he: (q, to) => `תורגם: ${q} ← ${to}`,
  ur: (q, to) => `ترجمہ: ${q} ← ${to}`,
};

const UNKNOWN_SYMBOL: Record<string, string> = {
  de: 'Symbol nicht bekannt',
  en: 'Symbol not known',
  ar: 'الرمز غير معروف',
  tr: 'Sembol bilinmiyor',
  ru: 'Символ неизвестен',
  fr: 'Symbole inconnu',
  es: 'Símbolo desconocido',
  it: 'Simbolo sconosciuto',
  pt: 'Símbolo desconhecido',
  fa: 'نماد شناخته‌شده نیست',
  he: 'הסמל אינו מוכר',
  ur: 'علامت معلوم نہیں',
};

interface DreamSymbolsPageProps {
  language: Language;
  onClose: () => void;
  onNavigateHome: () => void;
  themeMode?: string;
}

// ─── Translations ────────────────────────────────────────────────────────────

const T: Record<string, {
  back: string; title: string; hero_title: string; hero_subtitle: string;
  stats_symbols: string; stats_freud: string; stats_ibn_sirin: string; stats_both: string;
  stats_categories: string; search_placeholder: string; all_categories: string;
  source_freud: string; source_ibn_sirin: string; no_results: string;
  context_examples: string; original_quote: string; related_symbols: string;
  east_west: string; western: string; eastern: string; cta_title: string; cta_btn: string;
  interpretations: string; sources_label: string; category_names: Record<string, string>;
}> = {
  de: {
    back: 'Zurück', title: 'Traumsymbol-Bibliothek', sources_label: 'Quellen',
    hero_title: 'Die große Traumsymbol-Datenbank',
    hero_subtitle: '877 Traumsymbole mit Deutungen aus Psychoanalyse (Freud) und islamischer Tradition (Ibn Sirin)',
    stats_symbols: 'Symbole', stats_freud: 'Freud-Deutungen', stats_ibn_sirin: 'Ibn-Sirin-Deutungen',
    stats_both: 'mit beiden Perspektiven', stats_categories: 'Kategorien',
    search_placeholder: 'Symbol suchen...', all_categories: 'Alle',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Keine Symbole gefunden',
    context_examples: 'Kontext-Beispiele', original_quote: 'Originalzitat',
    related_symbols: 'Verwandte Symbole', east_west: 'Ost-West-Vergleich',
    western: 'Westlich (Freud)', eastern: 'Östlich (Ibn Sirin)',
    cta_title: 'Bereit deinen Traum zu deuten?', cta_btn: 'Jetzt Traum eingeben',
    interpretations: 'Deutungen',
    category_names: { 'Natur': 'Natur', 'Objekte': 'Objekte', 'Personen': 'Personen', 'Tiere': 'Tiere', 'Aktivitäten': 'Aktivitäten', 'Emotionen': 'Emotionen', 'Körper': 'Körper', 'Orte': 'Orte' },
  },
  en: {
    back: 'Back', title: 'Dream Symbol Library', sources_label: 'Sources',
    hero_title: 'The Great Dream Symbol Database',
    hero_subtitle: '877 dream symbols with interpretations from Psychoanalysis (Freud) and Islamic tradition (Ibn Sirin)',
    stats_symbols: 'Symbols', stats_freud: 'Freud Interpretations', stats_ibn_sirin: 'Ibn Sirin Interpretations',
    stats_both: 'with both perspectives', stats_categories: 'Categories',
    search_placeholder: 'Search symbol...', all_categories: 'All',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'No symbols found',
    context_examples: 'Context Examples', original_quote: 'Original Quote',
    related_symbols: 'Related Symbols', east_west: 'East-West Comparison',
    western: 'Western (Freud)', eastern: 'Eastern (Ibn Sirin)',
    cta_title: 'Ready to interpret your dream?', cta_btn: 'Enter dream now',
    interpretations: 'Interpretations',
    category_names: { 'Natur': 'Nature', 'Objekte': 'Objects', 'Personen': 'People', 'Tiere': 'Animals', 'Aktivitäten': 'Activities', 'Emotionen': 'Emotions', 'Körper': 'Body', 'Orte': 'Places' },
  },
  tr: {
    back: 'Geri', title: 'Rüya Sembol Kütüphanesi', sources_label: 'Kaynaklar',
    hero_title: 'Büyük Rüya Sembol Veritabanı',
    hero_subtitle: '877 rüya sembolü — Psikanaliz (Freud) ve İslami gelenek (İbn Sirin) yorumlarıyla',
    stats_symbols: 'Sembol', stats_freud: 'Freud Yorumu', stats_ibn_sirin: 'İbn Sirin Yorumu',
    stats_both: 'her iki perspektifle', stats_categories: 'Kategori',
    search_placeholder: 'Sembol ara...', all_categories: 'Tümü',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'İbn Sirin',
    no_results: 'Sembol bulunamadı',
    context_examples: 'Bağlam Örnekleri', original_quote: 'Orijinal Alıntı',
    related_symbols: 'İlgili Semboller', east_west: 'Doğu-Batı Karşılaştırması',
    western: 'Batı (Freud)', eastern: 'Doğu (İbn Sirin)',
    cta_title: 'Rüyanı yorumlamaya hazır mısın?', cta_btn: 'Şimdi rüya gir',
    interpretations: 'Yorumlar',
    category_names: { 'Natur': 'Doğa', 'Objekte': 'Nesneler', 'Personen': 'Kişiler', 'Tiere': 'Hayvanlar', 'Aktivitäten': 'Aktiviteler', 'Emotionen': 'Duygular', 'Körper': 'Vücut', 'Orte': 'Yerler' },
  },
  es: {
    back: 'Volver', title: 'Biblioteca de Símbolos Oníricos', sources_label: 'Fuentes',
    hero_title: 'La Gran Base de Datos de Símbolos Oníricos',
    hero_subtitle: '877 símbolos oníricos con interpretaciones del Psicoanálisis (Freud) y la tradición islámica (Ibn Sirin)',
    stats_symbols: 'Símbolos', stats_freud: 'Interpretaciones de Freud', stats_ibn_sirin: 'Interpretaciones de Ibn Sirin',
    stats_both: 'con ambas perspectivas', stats_categories: 'Categorías',
    search_placeholder: 'Buscar símbolo...', all_categories: 'Todos',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'No se encontraron símbolos',
    context_examples: 'Ejemplos de Contexto', original_quote: 'Cita Original',
    related_symbols: 'Símbolos Relacionados', east_west: 'Comparación Este-Oeste',
    western: 'Occidental (Freud)', eastern: 'Oriental (Ibn Sirin)',
    cta_title: '¿Listo para interpretar tu sueño?', cta_btn: 'Introducir sueño ahora',
    interpretations: 'Interpretaciones',
    category_names: { 'Natur': 'Naturaleza', 'Objekte': 'Objetos', 'Personen': 'Personas', 'Tiere': 'Animales', 'Aktivitäten': 'Actividades', 'Emotionen': 'Emociones', 'Körper': 'Cuerpo', 'Orte': 'Lugares' },
  },
  fr: {
    back: 'Retour', title: 'Bibliothèque des Symboles Oniriques', sources_label: 'Sources',
    hero_title: 'La Grande Base de Données des Symboles Oniriques',
    hero_subtitle: '877 symboles oniriques avec interprétations de la Psychanalyse (Freud) et de la tradition islamique (Ibn Sirin)',
    stats_symbols: 'Symboles', stats_freud: 'Interprétations de Freud', stats_ibn_sirin: 'Interprétations d\'Ibn Sirin',
    stats_both: 'avec les deux perspectives', stats_categories: 'Catégories',
    search_placeholder: 'Rechercher un symbole...', all_categories: 'Tous',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Aucun symbole trouvé',
    context_examples: 'Exemples de Contexte', original_quote: 'Citation Originale',
    related_symbols: 'Symboles Associés', east_west: 'Comparaison Est-Ouest',
    western: 'Occidental (Freud)', eastern: 'Oriental (Ibn Sirin)',
    cta_title: 'Prêt à interpréter votre rêve ?', cta_btn: 'Saisir un rêve maintenant',
    interpretations: 'Interprétations',
    category_names: { 'Natur': 'Nature', 'Objekte': 'Objets', 'Personen': 'Personnes', 'Tiere': 'Animaux', 'Aktivitäten': 'Activités', 'Emotionen': 'Émotions', 'Körper': 'Corps', 'Orte': 'Lieux' },
  },
  ar: {
    back: 'رجوع', title: 'مكتبة رموز الأحلام', sources_label: 'المصادر',
    hero_title: 'قاعدة بيانات رموز الأحلام الكبرى',
    hero_subtitle: '877 رمزاً للأحلام مع تفسيرات من التحليل النفسي (فرويد) والتراث الإسلامي (ابن سيرين)',
    stats_symbols: 'رمز', stats_freud: 'تفسير فرويد', stats_ibn_sirin: 'تفسير ابن سيرين',
    stats_both: 'بكلا المنظورين', stats_categories: 'فئات',
    search_placeholder: 'ابحث عن رمز...', all_categories: 'الكل',
    source_freud: 'سيغموند فرويد', source_ibn_sirin: 'ابن سيرين',
    no_results: 'لم يتم العثور على رموز',
    context_examples: 'أمثلة سياقية', original_quote: 'اقتباس أصلي',
    related_symbols: 'رموز مرتبطة', east_west: 'مقارنة شرق-غرب',
    western: 'غربي (فرويد)', eastern: 'شرقي (ابن سيرين)',
    cta_title: 'هل أنت مستعد لتفسير حلمك؟', cta_btn: 'أدخل الحلم الآن',
    interpretations: 'تفسيرات',
    category_names: { 'Natur': 'طبيعة', 'Objekte': 'أشياء', 'Personen': 'أشخاص', 'Tiere': 'حيوانات', 'Aktivitäten': 'أنشطة', 'Emotionen': 'مشاعر', 'Körper': 'جسم', 'Orte': 'أماكن' },
  },
  pt: {
    back: 'Voltar', title: 'Biblioteca de Símbolos Oníricos', sources_label: 'Fontes',
    hero_title: 'A Grande Base de Dados de Símbolos Oníricos',
    hero_subtitle: '877 símbolos oníricos com interpretações da Psicanálise (Freud) e da tradição islâmica (Ibn Sirin)',
    stats_symbols: 'Símbolos', stats_freud: 'Interpretações de Freud', stats_ibn_sirin: 'Interpretações de Ibn Sirin',
    stats_both: 'com ambas as perspectivas', stats_categories: 'Categorias',
    search_placeholder: 'Pesquisar símbolo...', all_categories: 'Todos',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Nenhum símbolo encontrado',
    context_examples: 'Exemplos de Contexto', original_quote: 'Citação Original',
    related_symbols: 'Símbolos Relacionados', east_west: 'Comparação Leste-Oeste',
    western: 'Ocidental (Freud)', eastern: 'Oriental (Ibn Sirin)',
    cta_title: 'Pronto para interpretar seu sonho?', cta_btn: 'Inserir sonho agora',
    interpretations: 'Interpretações',
    category_names: { 'Natur': 'Natureza', 'Objekte': 'Objetos', 'Personen': 'Pessoas', 'Tiere': 'Animais', 'Aktivitäten': 'Atividades', 'Emotionen': 'Emoções', 'Körper': 'Corpo', 'Orte': 'Lugares' },
  },
  ru: {
    back: 'Назад', title: 'Библиотека символов снов', sources_label: 'Источники',
    hero_title: 'Большая база данных символов снов',
    hero_subtitle: '877 символов снов с толкованиями из психоанализа (Фрейд) и исламской традиции (Ибн Сирин)',
    stats_symbols: 'Символов', stats_freud: 'Толкований Фрейда', stats_ibn_sirin: 'Толкований Ибн Сирина',
    stats_both: 'с обоими перспективами', stats_categories: 'Категорий',
    search_placeholder: 'Искать символ...', all_categories: 'Все',
    source_freud: 'Зигмунд Фрейд', source_ibn_sirin: 'Ибн Сирин',
    no_results: 'Символы не найдены',
    context_examples: 'Контекстные примеры', original_quote: 'Оригинальная цитата',
    related_symbols: 'Связанные символы', east_west: 'Сравнение Восток-Запад',
    western: 'Западный (Фрейд)', eastern: 'Восточный (Ибн Сирин)',
    cta_title: 'Готовы истолковать свой сон?', cta_btn: 'Ввести сон сейчас',
    interpretations: 'Толкования',
    category_names: { 'Natur': 'Природа', 'Objekte': 'Предметы', 'Personen': 'Люди', 'Tiere': 'Животные', 'Aktivitäten': 'Действия', 'Emotionen': 'Эмоции', 'Körper': 'Тело', 'Orte': 'Места' },
  },
  hi: {
    back: 'वापस', title: 'स्वप्न प्रतीक पुस्तकालय', sources_label: 'स्रोत',
    hero_title: 'महान स्वप्न प्रतीक डेटाबेस',
    hero_subtitle: '877 स्वप्न प्रतीक — मनोविश्लेषण (फ्रायड) और इस्लामी परंपरा (इब्न सिरीन) के अर्थों सहित',
    stats_symbols: 'प्रतीक', stats_freud: 'फ्रायड व्याख्या', stats_ibn_sirin: 'इब्न सिरीन व्याख्या',
    stats_both: 'दोनों दृष्टिकोणों के साथ', stats_categories: 'श्रेणियाँ',
    search_placeholder: 'प्रतीक खोजें...', all_categories: 'सभी',
    source_freud: 'सिगमंड फ्रायड', source_ibn_sirin: 'इब्न सिरीन',
    no_results: 'कोई प्रतीक नहीं मिला',
    context_examples: 'संदर्भ उदाहरण', original_quote: 'मूल उद्धरण',
    related_symbols: 'संबंधित प्रतीक', east_west: 'पूर्व-पश्चिम तुलना',
    western: 'पश्चिमी (फ्रायड)', eastern: 'पूर्वी (इब्न सिरीन)',
    cta_title: 'अपना सपना देखने के लिए तैयार हैं?', cta_btn: 'अभी सपना दर्ज करें',
    interpretations: 'व्याख्याएँ',
    category_names: { 'Natur': 'प्रकृति', 'Objekte': 'वस्तुएँ', 'Personen': 'लोग', 'Tiere': 'जानवर', 'Aktivitäten': 'गतिविधियाँ', 'Emotionen': 'भावनाएँ', 'Körper': 'शरीर', 'Orte': 'स्थान' },
  },
  zh: {
    back: '返回', title: '梦境符号图书馆', sources_label: '来源',
    hero_title: '梦境符号大数据库',
    hero_subtitle: '877个梦境符号——来自心理分析（弗洛伊德）和伊斯兰传统（伊本·西林）的解读',
    stats_symbols: '符号', stats_freud: '弗洛伊德解读', stats_ibn_sirin: '伊本·西林解读',
    stats_both: '双重视角', stats_categories: '类别',
    search_placeholder: '搜索符号...', all_categories: '全部',
    source_freud: '西格蒙德·弗洛伊德', source_ibn_sirin: '伊本·西林',
    no_results: '未找到符号',
    context_examples: '情境示例', original_quote: '原文引用',
    related_symbols: '相关符号', east_west: '东西方比较',
    western: '西方（弗洛伊德）', eastern: '东方（伊本·西林）',
    cta_title: '准备好解析您的梦境了吗？', cta_btn: '立即输入梦境',
    interpretations: '解读',
    category_names: { 'Natur': '自然', 'Objekte': '物品', 'Personen': '人物', 'Tiere': '动物', 'Aktivitäten': '活动', 'Emotionen': '情感', 'Körper': '身体', 'Orte': '地点' },
  },
  ja: {
    back: '戻る', title: '夢のシンボルライブラリ', sources_label: 'ソース',
    hero_title: '夢のシンボルデータベース',
    hero_subtitle: '877の夢のシンボル——精神分析（フロイト）とイスラムの伝統（イブン・スィーリーン）の解釈付き',
    stats_symbols: 'シンボル', stats_freud: 'フロイトの解釈', stats_ibn_sirin: 'イブン・スィーリーンの解釈',
    stats_both: '両方の視点', stats_categories: 'カテゴリ',
    search_placeholder: 'シンボルを検索...', all_categories: 'すべて',
    source_freud: 'ジークムント・フロイト', source_ibn_sirin: 'イブン・スィーリーン',
    no_results: 'シンボルが見つかりません',
    context_examples: 'コンテキスト例', original_quote: '原文引用',
    related_symbols: '関連シンボル', east_west: '東西比較',
    western: '西洋（フロイト）', eastern: '東洋（イブン・スィーリーン）',
    cta_title: '夢を解釈する準備はできましたか？', cta_btn: '今すぐ夢を入力',
    interpretations: '解釈',
    category_names: { 'Natur': '自然', 'Objekte': 'モノ', 'Personen': '人物', 'Tiere': '動物', 'Aktivitäten': '活動', 'Emotionen': '感情', 'Körper': '身体', 'Orte': '場所' },
  },
  ko: {
    back: '뒤로', title: '꿈 상징 라이브러리', sources_label: '출처',
    hero_title: '꿈 상징 데이터베이스',
    hero_subtitle: '877개의 꿈 상징 — 정신분석(프로이트)과 이슬람 전통(이븐 시린)의 해석 포함',
    stats_symbols: '상징', stats_freud: '프로이트 해석', stats_ibn_sirin: '이븐 시린 해석',
    stats_both: '두 가지 관점', stats_categories: '카테고리',
    search_placeholder: '상징 검색...', all_categories: '전체',
    source_freud: '지그문트 프로이트', source_ibn_sirin: '이븐 시린',
    no_results: '상징을 찾을 수 없습니다',
    context_examples: '맥락 예시', original_quote: '원문 인용',
    related_symbols: '관련 상징', east_west: '동서양 비교',
    western: '서양 (프로이트)', eastern: '동양 (이븐 시린)',
    cta_title: '꿈을 해석할 준비가 되셨나요?', cta_btn: '지금 꿈 입력',
    interpretations: '해석',
    category_names: { 'Natur': '자연', 'Objekte': '사물', 'Personen': '인물', 'Tiere': '동물', 'Aktivitäten': '활동', 'Emotionen': '감정', 'Körper': '신체', 'Orte': '장소' },
  },
  id: {
    back: 'Kembali', title: 'Perpustakaan Simbol Mimpi', sources_label: 'Sumber',
    hero_title: 'Database Simbol Mimpi Besar',
    hero_subtitle: '877 simbol mimpi dengan interpretasi dari Psikoanalisis (Freud) dan tradisi Islam (Ibn Sirin)',
    stats_symbols: 'Simbol', stats_freud: 'Interpretasi Freud', stats_ibn_sirin: 'Interpretasi Ibn Sirin',
    stats_both: 'dengan kedua perspektif', stats_categories: 'Kategori',
    search_placeholder: 'Cari simbol...', all_categories: 'Semua',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Tidak ada simbol ditemukan',
    context_examples: 'Contoh Konteks', original_quote: 'Kutipan Asli',
    related_symbols: 'Simbol Terkait', east_west: 'Perbandingan Timur-Barat',
    western: 'Barat (Freud)', eastern: 'Timur (Ibn Sirin)',
    cta_title: 'Siap menafsirkan mimpi Anda?', cta_btn: 'Masukkan mimpi sekarang',
    interpretations: 'Interpretasi',
    category_names: { 'Natur': 'Alam', 'Objekte': 'Benda', 'Personen': 'Orang', 'Tiere': 'Hewan', 'Aktivitäten': 'Aktivitas', 'Emotionen': 'Emosi', 'Körper': 'Tubuh', 'Orte': 'Tempat' },
  },
  fa: {
    back: 'بازگشت', title: 'کتابخانه نمادهای رویا', sources_label: 'منابع',
    hero_title: 'پایگاه داده بزرگ نمادهای رویا',
    hero_subtitle: '877 نماد رویا با تفسیرهای روانکاوی (فروید) و سنت اسلامی (ابن سیرین)',
    stats_symbols: 'نماد', stats_freud: 'تفسیر فروید', stats_ibn_sirin: 'تفسیر ابن سیرین',
    stats_both: 'با هر دو دیدگاه', stats_categories: 'دسته‌بندی‌ها',
    search_placeholder: 'جستجوی نماد...', all_categories: 'همه',
    source_freud: 'زیگموند فروید', source_ibn_sirin: 'ابن سیرین',
    no_results: 'نمادی یافت نشد',
    context_examples: 'مثال‌های متنی', original_quote: 'نقل‌قول اصلی',
    related_symbols: 'نمادهای مرتبط', east_west: 'مقایسه شرق و غرب',
    western: 'غربی (فروید)', eastern: 'شرقی (ابن سیرین)',
    cta_title: 'آماده تفسیر رویایتان هستید؟', cta_btn: 'رویا را وارد کنید',
    interpretations: 'تفسیرها',
    category_names: { 'Natur': 'طبیعت', 'Objekte': 'اشیاء', 'Personen': 'افراد', 'Tiere': 'حیوانات', 'Aktivitäten': 'فعالیت‌ها', 'Emotionen': 'احساسات', 'Körper': 'بدن', 'Orte': 'مکان‌ها' },
  },
  it: {
    back: 'Indietro', title: 'Biblioteca dei Simboli Onirici', sources_label: 'Fonti',
    hero_title: 'Il Grande Database dei Simboli Onirici',
    hero_subtitle: '877 simboli onirici con interpretazioni dalla Psicanalisi (Freud) e dalla tradizione islamica (Ibn Sirin)',
    stats_symbols: 'Simboli', stats_freud: 'Interpretazioni di Freud', stats_ibn_sirin: 'Interpretazioni di Ibn Sirin',
    stats_both: 'con entrambe le prospettive', stats_categories: 'Categorie',
    search_placeholder: 'Cerca simbolo...', all_categories: 'Tutti',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Nessun simbolo trovato',
    context_examples: 'Esempi di Contesto', original_quote: 'Citazione Originale',
    related_symbols: 'Simboli Correlati', east_west: 'Confronto Est-Ovest',
    western: 'Occidentale (Freud)', eastern: 'Orientale (Ibn Sirin)',
    cta_title: 'Pronto a interpretare il tuo sogno?', cta_btn: 'Inserisci il sogno ora',
    interpretations: 'Interpretazioni',
    category_names: { 'Natur': 'Natura', 'Objekte': 'Oggetti', 'Personen': 'Persone', 'Tiere': 'Animali', 'Aktivitäten': 'Attività', 'Emotionen': 'Emozioni', 'Körper': 'Corpo', 'Orte': 'Luoghi' },
  },
  pl: {
    back: 'Wróć', title: 'Biblioteka Symboli Snów', sources_label: 'Źródła',
    hero_title: 'Wielka Baza Danych Symboli Snów',
    hero_subtitle: '877 symboli snów z interpretacjami psychoanalizy (Freud) i tradycji islamskiej (Ibn Sirin)',
    stats_symbols: 'Symboli', stats_freud: 'Interpretacje Freuda', stats_ibn_sirin: 'Interpretacje Ibn Sirina',
    stats_both: 'z obiema perspektywami', stats_categories: 'Kategorii',
    search_placeholder: 'Szukaj symbolu...', all_categories: 'Wszystkie',
    source_freud: 'Zygmunt Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Nie znaleziono symboli',
    context_examples: 'Przykłady Kontekstu', original_quote: 'Oryginalny Cytat',
    related_symbols: 'Powiązane Symbole', east_west: 'Porównanie Wschód-Zachód',
    western: 'Zachodni (Freud)', eastern: 'Wschodni (Ibn Sirin)',
    cta_title: 'Gotowy zinterpretować swój sen?', cta_btn: 'Wpisz sen teraz',
    interpretations: 'Interpretacje',
    category_names: { 'Natur': 'Natura', 'Objekte': 'Przedmioty', 'Personen': 'Osoby', 'Tiere': 'Zwierzęta', 'Aktivitäten': 'Czynności', 'Emotionen': 'Emocje', 'Körper': 'Ciało', 'Orte': 'Miejsca' },
  },
  bn: {
    back: 'ফিরে যান', title: 'স্বপ্ন প্রতীক লাইব্রেরি', sources_label: 'উৎস',
    hero_title: 'মহান স্বপ্ন প্রতীক ডেটাবেস',
    hero_subtitle: '877টি স্বপ্ন প্রতীক — মনোবিশ্লেষণ (ফ্রয়েড) ও ইসলামিক ঐতিহ্য (ইবনে সিরিন) থেকে ব্যাখ্যা',
    stats_symbols: 'প্রতীক', stats_freud: 'ফ্রয়েডের ব্যাখ্যা', stats_ibn_sirin: 'ইবনে সিরিনের ব্যাখ্যা',
    stats_both: 'উভয় দৃষ্টিভঙ্গি সহ', stats_categories: 'বিভাগ',
    search_placeholder: 'প্রতীক খুঁজুন...', all_categories: 'সব',
    source_freud: 'সিগমুন্ড ফ্রয়েড', source_ibn_sirin: 'ইবনে সিরিন',
    no_results: 'কোনো প্রতীক পাওয়া যায়নি',
    context_examples: 'প্রসঙ্গ উদাহরণ', original_quote: 'মূল উদ্ধৃতি',
    related_symbols: 'সম্পর্কিত প্রতীক', east_west: 'পূর্ব-পশ্চিম তুলনা',
    western: 'পশ্চিমা (ফ্রয়েড)', eastern: 'পূর্বাঞ্চলীয় (ইবনে সিরিন)',
    cta_title: 'আপনার স্বপ্ন ব্যাখ্যা করতে প্রস্তুত?', cta_btn: 'এখনই স্বপ্ন লিখুন',
    interpretations: 'ব্যাখ্যা',
    category_names: { 'Natur': 'প্রকৃতি', 'Objekte': 'বস্তু', 'Personen': 'ব্যক্তি', 'Tiere': 'প্রাণী', 'Aktivitäten': 'কার্যকলাপ', 'Emotionen': 'আবেগ', 'Körper': 'শরীর', 'Orte': 'স্থান' },
  },
  ur: {
    back: 'واپس', title: 'خواب کی علامات کی لائبریری', sources_label: 'ذرائع',
    hero_title: 'خوابوں کی علامات کا عظیم ڈیٹابیس',
    hero_subtitle: '877 خواب علامات — نفسیاتی تجزیہ (فرائڈ) اور اسلامی روایت (ابن سیرین) سے تعبیرات',
    stats_symbols: 'علامات', stats_freud: 'فرائڈ کی تعبیر', stats_ibn_sirin: 'ابن سیرین کی تعبیر',
    stats_both: 'دونوں نقطہ نظر کے ساتھ', stats_categories: 'زمرے',
    search_placeholder: 'علامت تلاش کریں...', all_categories: 'سب',
    source_freud: 'سگمنڈ فرائڈ', source_ibn_sirin: 'ابن سیرین',
    no_results: 'کوئی علامت نہیں ملی',
    context_examples: 'سیاقی مثالیں', original_quote: 'اصل اقتباس',
    related_symbols: 'متعلقہ علامات', east_west: 'مشرق-مغرب موازنہ',
    western: 'مغربی (فرائڈ)', eastern: 'مشرقی (ابن سیرین)',
    cta_title: 'اپنا خواب تعبیر کرنے کے لیے تیار ہیں؟', cta_btn: 'ابھی خواب درج کریں',
    interpretations: 'تعبیرات',
    category_names: { 'Natur': 'فطرت', 'Objekte': 'اشیاء', 'Personen': 'لوگ', 'Tiere': 'جانور', 'Aktivitäten': 'سرگرمیاں', 'Emotionen': 'جذبات', 'Körper': 'جسم', 'Orte': 'مقامات' },
  },
  vi: {
    back: 'Quay lại', title: 'Thư viện Biểu tượng Giấc mơ', sources_label: 'Nguồn',
    hero_title: 'Cơ sở dữ liệu Biểu tượng Giấc mơ Vĩ đại',
    hero_subtitle: '877 biểu tượng giấc mơ với giải thích từ Phân tâm học (Freud) và truyền thống Hồi giáo (Ibn Sirin)',
    stats_symbols: 'Biểu tượng', stats_freud: 'Giải thích Freud', stats_ibn_sirin: 'Giải thích Ibn Sirin',
    stats_both: 'với cả hai quan điểm', stats_categories: 'Danh mục',
    search_placeholder: 'Tìm kiếm biểu tượng...', all_categories: 'Tất cả',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Không tìm thấy biểu tượng',
    context_examples: 'Ví dụ ngữ cảnh', original_quote: 'Trích dẫn gốc',
    related_symbols: 'Biểu tượng liên quan', east_west: 'So sánh Đông-Tây',
    western: 'Phương Tây (Freud)', eastern: 'Phương Đông (Ibn Sirin)',
    cta_title: 'Sẵn sàng giải mã giấc mơ của bạn?', cta_btn: 'Nhập giấc mơ ngay',
    interpretations: 'Giải thích',
    category_names: { 'Natur': 'Thiên nhiên', 'Objekte': 'Đồ vật', 'Personen': 'Con người', 'Tiere': 'Động vật', 'Aktivitäten': 'Hoạt động', 'Emotionen': 'Cảm xúc', 'Körper': 'Cơ thể', 'Orte': 'Địa điểm' },
  },
  th: {
    back: 'กลับ', title: 'ห้องสมุดสัญลักษณ์ความฝัน', sources_label: 'แหล่งที่มา',
    hero_title: 'ฐานข้อมูลสัญลักษณ์ความฝันขนาดใหญ่',
    hero_subtitle: 'สัญลักษณ์ความฝัน 877 แบบพร้อมการตีความจากจิตวิเคราะห์ (ฟรอยด์) และประเพณีอิสลาม (อิบนู ซิริน)',
    stats_symbols: 'สัญลักษณ์', stats_freud: 'การตีความของฟรอยด์', stats_ibn_sirin: 'การตีความของอิบนู ซิริน',
    stats_both: 'ทั้งสองมุมมอง', stats_categories: 'หมวดหมู่',
    search_placeholder: 'ค้นหาสัญลักษณ์...', all_categories: 'ทั้งหมด',
    source_freud: 'ซิกมันด์ ฟรอยด์', source_ibn_sirin: 'อิบนู ซิริน',
    no_results: 'ไม่พบสัญลักษณ์',
    context_examples: 'ตัวอย่างบริบท', original_quote: 'คำพูดต้นฉบับ',
    related_symbols: 'สัญลักษณ์ที่เกี่ยวข้อง', east_west: 'การเปรียบเทียบตะวันออก-ตะวันตก',
    western: 'ตะวันตก (ฟรอยด์)', eastern: 'ตะวันออก (อิบนู ซิริน)',
    cta_title: 'พร้อมตีความความฝันของคุณแล้วหรือยัง?', cta_btn: 'ป้อนความฝันเดี๋ยวนี้',
    interpretations: 'การตีความ',
    category_names: { 'Natur': 'ธรรมชาติ', 'Objekte': 'วัตถุ', 'Personen': 'บุคคล', 'Tiere': 'สัตว์', 'Aktivitäten': 'กิจกรรม', 'Emotionen': 'อารมณ์', 'Körper': 'ร่างกาย', 'Orte': 'สถานที่' },
  },
  sw: {
    back: 'Rudi', title: 'Maktaba ya Alama za Ndoto', sources_label: 'Vyanzo',
    hero_title: 'Hifadhidata Kubwa ya Alama za Ndoto',
    hero_subtitle: 'Alama 877 za ndoto na tafsiri kutoka kwa Uchambuzi wa Kisaikolojia (Freud) na mila ya Kiislamu (Ibn Sirin)',
    stats_symbols: 'Alama', stats_freud: 'Tafsiri za Freud', stats_ibn_sirin: 'Tafsiri za Ibn Sirin',
    stats_both: 'na mtazamo wote wawili', stats_categories: 'Makundi',
    search_placeholder: 'Tafuta alama...', all_categories: 'Zote',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Hakuna alama zilizopatikana',
    context_examples: 'Mifano ya Muktadha', original_quote: 'Nukuu Asili',
    related_symbols: 'Alama Zinazohusiana', east_west: 'Ulinganisho wa Mashariki-Magharibi',
    western: 'Magharibi (Freud)', eastern: 'Mashariki (Ibn Sirin)',
    cta_title: 'Uko tayari kutafsiri ndoto yako?', cta_btn: 'Ingiza ndoto sasa',
    interpretations: 'Tafsiri',
    category_names: { 'Natur': 'Asili', 'Objekte': 'Vitu', 'Personen': 'Watu', 'Tiere': 'Wanyama', 'Aktivitäten': 'Shughuli', 'Emotionen': 'Hisia', 'Körper': 'Mwili', 'Orte': 'Maeneo' },
  },
  hu: {
    back: 'Vissza', title: 'Álomszimbólum-könyvtár', sources_label: 'Források',
    hero_title: 'A Nagy Álomszimbólum-adatbázis',
    hero_subtitle: '877 álomszimbólum értelmezéssel a pszichoanalízistől (Freud) és az iszlám hagyományból (Ibn Szirin)',
    stats_symbols: 'Szimbólum', stats_freud: 'Freud-értelmezések', stats_ibn_sirin: 'Ibn Szirin-értelmezések',
    stats_both: 'mindkét perspektívával', stats_categories: 'Kategóriák',
    search_placeholder: 'Szimbólum keresése...', all_categories: 'Összes',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Szirin',
    no_results: 'Nem találhatók szimbólumok',
    context_examples: 'Kontextuspéldák', original_quote: 'Eredeti idézet',
    related_symbols: 'Kapcsolódó szimbólumok', east_west: 'Kelet-Nyugat összehasonlítás',
    western: 'Nyugati (Freud)', eastern: 'Keleti (Ibn Szirin)',
    cta_title: 'Készen áll álmát értelmezni?', cta_btn: 'Álom beírása most',
    interpretations: 'Értelmezések',
    category_names: { 'Natur': 'Természet', 'Objekte': 'Tárgyak', 'Personen': 'Személyek', 'Tiere': 'Állatok', 'Aktivitäten': 'Tevékenységek', 'Emotionen': 'Érzelmek', 'Körper': 'Test', 'Orte': 'Helyek' },
  },
  ta: {
    back: 'திரும்பு', title: 'கனவு சின்னங்கள் நூலகம்', sources_label: 'ஆதாரங்கள்',
    hero_title: 'மாபெரும் கனவு சின்னங்கள் தரவுத்தளம்',
    hero_subtitle: '877 கனவு சின்னங்கள் — உளவியல் பகுப்பாய்வு (ஃப்ரூட்) மற்றும் இஸ்லாமிய பாரம்பரியம் (இப்னு சிரீன்) விளக்கங்களுடன்',
    stats_symbols: 'சின்னங்கள்', stats_freud: 'ஃப்ரூட் விளக்கம்', stats_ibn_sirin: 'இப்னு சிரீன் விளக்கம்',
    stats_both: 'இரு கோணங்களும்', stats_categories: 'வகைகள்',
    search_placeholder: 'சின்னம் தேடு...', all_categories: 'அனைத்தும்',
    source_freud: 'சிக்மண்ட் ஃப்ரூட்', source_ibn_sirin: 'இப்னு சிரீன்',
    no_results: 'சின்னங்கள் கிடைக்கவில்லை',
    context_examples: 'சூழல் உதாரணங்கள்', original_quote: 'அசல் மேற்கோள்',
    related_symbols: 'தொடர்புடைய சின்னங்கள்', east_west: 'கிழக்கு-மேற்கு ஒப்பீடு',
    western: 'மேற்கத்திய (ஃப்ரூட்)', eastern: 'கிழக்கத்திய (இப்னு சிரீன்)',
    cta_title: 'உங்கள் கனவை விளக்க தயாரா?', cta_btn: 'இப்போது கனவை உள்ளிடுக',
    interpretations: 'விளக்கங்கள்',
    category_names: { 'Natur': 'இயற்கை', 'Objekte': 'பொருட்கள்', 'Personen': 'நபர்கள்', 'Tiere': 'விலங்குகள்', 'Aktivitäten': 'செயல்பாடுகள்', 'Emotionen': 'உணர்வுகள்', 'Körper': 'உடல்', 'Orte': 'இடங்கள்' },
  },
  te: {
    back: 'వెనక్కి', title: 'కల చిహ్నాల లైబ్రరీ', sources_label: 'మూలాలు',
    hero_title: 'మహా కల చిహ్నాల డేటాబేస్',
    hero_subtitle: '877 కల చిహ్నాలు — మనోవిశ్లేషణ (ఫ్రాయిడ్) మరియు ఇస్లామిక్ సంప్రదాయం (ఇబ్న్ సిరీన్) వివరణలతో',
    stats_symbols: 'చిహ్నాలు', stats_freud: 'ఫ్రాయిడ్ వివరణ', stats_ibn_sirin: 'ఇబ్న్ సిరీన్ వివరణ',
    stats_both: 'రెండు దృక్కోణాలతో', stats_categories: 'వర్గాలు',
    search_placeholder: 'చిహ్నం వెతకండి...', all_categories: 'అన్నీ',
    source_freud: 'సిగ్మండ్ ఫ్రాయిడ్', source_ibn_sirin: 'ఇబ్న్ సిరీన్',
    no_results: 'చిహ్నాలు కనుగొనబడలేదు',
    context_examples: 'సందర్భ ఉదాహరణలు', original_quote: 'అసలు కోటేషన్',
    related_symbols: 'సంబంధిత చిహ్నాలు', east_west: 'తూర్పు-పడమర పోలిక',
    western: 'పాశ్చాత్య (ఫ్రాయిడ్)', eastern: 'తూర్పు (ఇబ్న్ సిరీన్)',
    cta_title: 'మీ కలను అర్థం చేసుకోవడానికి సిద్ధంగా ఉన్నారా?', cta_btn: 'ఇప్పుడు కల నమోదు చేయండి',
    interpretations: 'వివరణలు',
    category_names: { 'Natur': 'ప్రకృతి', 'Objekte': 'వస్తువులు', 'Personen': 'వ్యక్తులు', 'Tiere': 'జంతువులు', 'Aktivitäten': 'కార్యకలాపాలు', 'Emotionen': 'భావాలు', 'Körper': 'శరీరం', 'Orte': 'స్థలాలు' },
  },
  tl: {
    back: 'Bumalik', title: 'Aklatan ng mga Simbolo ng Panaginip', sources_label: 'Mga Pinagmulan',
    hero_title: 'Ang Dakilang Database ng mga Simbolo ng Panaginip',
    hero_subtitle: '877 simbolo ng panaginip na may interpretasyon mula sa Psychoanalysis (Freud) at tradisyong Islamiko (Ibn Sirin)',
    stats_symbols: 'Simbolo', stats_freud: 'Interpretasyon ni Freud', stats_ibn_sirin: 'Interpretasyon ni Ibn Sirin',
    stats_both: 'may parehong pananaw', stats_categories: 'Kategorya',
    search_placeholder: 'Maghanap ng simbolo...', all_categories: 'Lahat',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Walang simbolong nahanap',
    context_examples: 'Mga Halimbawa ng Konteksto', original_quote: 'Orihinal na Sipi',
    related_symbols: 'Mga Kaugnay na Simbolo', east_west: 'Paghahambing Silangan-Kanluran',
    western: 'Kanluran (Freud)', eastern: 'Silangan (Ibn Sirin)',
    cta_title: 'Handa nang bigyang-kahulugan ang iyong panaginip?', cta_btn: 'Ilagay ang panaginip ngayon',
    interpretations: 'Mga Interpretasyon',
    category_names: { 'Natur': 'Kalikasan', 'Objekte': 'Mga Bagay', 'Personen': 'Mga Tao', 'Tiere': 'Mga Hayop', 'Aktivitäten': 'Mga Aktibidad', 'Emotionen': 'Mga Damdamin', 'Körper': 'Katawan', 'Orte': 'Mga Lugar' },
  },
  ml: {
    back: 'തിരിച്ചു', title: 'സ്വപ്ന ചിഹ്ന ലൈബ്രറി', sources_label: 'ഉറവിടങ്ങൾ',
    hero_title: 'മഹത്തായ സ്വപ്ന ചിഹ്ന ഡേറ്റാബേസ്',
    hero_subtitle: '877 സ്വപ്ന ചിഹ്നങ്ങൾ — മനോവിശ്ലേഷണം (ഫ്രോയ്ഡ്) ഇസ്‌ലാമിക് പാരമ്പര്യം (ഇബ്‌നു സിരീൻ) വ്യാഖ്യാനങ്ങളോടൊപ്പം',
    stats_symbols: 'ചിഹ്നങ്ങൾ', stats_freud: 'ഫ്രോയ്ഡ് വ്യാഖ്യാനം', stats_ibn_sirin: 'ഇബ്‌നു സിരീൻ വ്യാഖ്യാനം',
    stats_both: 'രണ്ട് കാഴ്ചപ്പാടുകളും', stats_categories: 'വിഭാഗങ്ങൾ',
    search_placeholder: 'ചിഹ്നം തിരയുക...', all_categories: 'എല്ലാം',
    source_freud: 'സിഗ്മണ്ട് ഫ്രോയ്ഡ്', source_ibn_sirin: 'ഇബ്‌നു സിരീൻ',
    no_results: 'ചിഹ്നങ്ങൾ കണ്ടെത്തിയില്ല',
    context_examples: 'സന്ദർഭ ഉദാഹരണങ്ങൾ', original_quote: 'യഥാർഥ ഉദ്ധരണി',
    related_symbols: 'ബന്ധപ്പെട്ട ചിഹ്നങ്ങൾ', east_west: 'കിഴക്ക്-പടിഞ്ഞാറ് താരതമ്യം',
    western: 'പാശ്ചാത്യ (ഫ്രോയ്ഡ്)', eastern: 'പൗരസ്ത്യ (ഇബ്‌നു സിരീൻ)',
    cta_title: 'നിങ്ങളുടെ സ്വപ്നം വ്യാഖ്യാനിക്കാൻ തയ്യാറോ?', cta_btn: 'ഇപ്പോൾ സ്വപ്നം നൽകുക',
    interpretations: 'വ്യാഖ്യാനങ്ങൾ',
    category_names: { 'Natur': 'പ്രകൃതി', 'Objekte': 'വസ്തുക്കൾ', 'Personen': 'ആളുകൾ', 'Tiere': 'മൃഗങ്ങൾ', 'Aktivitäten': 'പ്രവർത്തനങ്ങൾ', 'Emotionen': 'വികാരങ്ങൾ', 'Körper': 'ശരീരം', 'Orte': 'സ്ഥലങ്ങൾ' },
  },
  mr: {
    back: 'मागे', title: 'स्वप्न प्रतीक ग्रंथालय', sources_label: 'स्रोत',
    hero_title: 'महान स्वप्न प्रतीक डेटाबेस',
    hero_subtitle: '877 स्वप्न प्रतीके — मनोविश्लेषण (फ्रॉइड) आणि इस्लामिक परंपरा (इब्न सिरीन) यांच्या अर्थांसह',
    stats_symbols: 'प्रतीके', stats_freud: 'फ्रॉइड अर्थ', stats_ibn_sirin: 'इब्न सिरीन अर्थ',
    stats_both: 'दोन्ही दृष्टिकोनांसह', stats_categories: 'श्रेण्या',
    search_placeholder: 'प्रतीक शोधा...', all_categories: 'सर्व',
    source_freud: 'सिगमंड फ्रॉइड', source_ibn_sirin: 'इब्न सिरीन',
    no_results: 'कोणतेही प्रतीक आढळले नाही',
    context_examples: 'संदर्भ उदाहरणे', original_quote: 'मूळ उद्धरण',
    related_symbols: 'संबंधित प्रतीके', east_west: 'पूर्व-पश्चिम तुलना',
    western: 'पाश्चिमात्य (फ्रॉइड)', eastern: 'पौर्वात्य (इब्न सिरीन)',
    cta_title: 'तुमचे स्वप्न अर्थ लावण्यास तयार आहात?', cta_btn: 'आता स्वप्न प्रविष्ट करा',
    interpretations: 'अर्थ',
    category_names: { 'Natur': 'निसर्ग', 'Objekte': 'वस्तू', 'Personen': 'व्यक्ती', 'Tiere': 'प्राणी', 'Aktivitäten': 'क्रियाकलाप', 'Emotionen': 'भावना', 'Körper': 'शरीर', 'Orte': 'ठिकाणे' },
  },
  kn: {
    back: 'ಹಿಂದೆ', title: 'ಕನಸಿನ ಸಂಕೇತ ಗ್ರಂಥಾಲಯ', sources_label: 'ಮೂಲಗಳು',
    hero_title: 'ಮಹಾನ್ ಕನಸಿನ ಸಂಕೇತ ಡೇಟಾಬೇಸ್',
    hero_subtitle: '877 ಕನಸಿನ ಸಂಕೇತಗಳು — ಮನೋವಿಶ್ಲೇಷಣೆ (ಫ್ರಾಯ್ಡ್) ಮತ್ತು ಇಸ್ಲಾಮಿಕ್ ಸಂಪ್ರದಾಯ (ಇಬ್ನ್ ಸಿರೀನ್) ವ್ಯಾಖ್ಯಾನಗಳೊಂದಿಗೆ',
    stats_symbols: 'ಸಂಕೇತಗಳು', stats_freud: 'ಫ್ರಾಯ್ಡ್ ವ್ಯಾಖ್ಯಾನ', stats_ibn_sirin: 'ಇಬ್ನ್ ಸಿರೀನ್ ವ್ಯಾಖ್ಯಾನ',
    stats_both: 'ಎರಡೂ ದೃಷ್ಟಿಕೋನಗಳು', stats_categories: 'ವರ್ಗಗಳು',
    search_placeholder: 'ಸಂಕೇತ ಹುಡುಕಿ...', all_categories: 'ಎಲ್ಲಾ',
    source_freud: 'ಸಿಗ್ಮಂಡ್ ಫ್ರಾಯ್ಡ್', source_ibn_sirin: 'ಇಬ್ನ್ ಸಿರೀನ್',
    no_results: 'ಯಾವುದೇ ಸಂಕೇತಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    context_examples: 'ಸಂದರ್ಭ ಉದಾಹರಣೆಗಳು', original_quote: 'ಮೂಲ ಉಲ್ಲೇಖ',
    related_symbols: 'ಸಂಬಂಧಿತ ಸಂಕೇತಗಳು', east_west: 'ಪೂರ್ವ-ಪಶ್ಚಿಮ ಹೋಲಿಕೆ',
    western: 'ಪಶ್ಚಿಮ (ಫ್ರಾಯ್ಡ್)', eastern: 'ಪೂರ್ವ (ಇಬ್ನ್ ಸಿರೀನ್)',
    cta_title: 'ನಿಮ್ಮ ಕನಸನ್ನು ಅರ್ಥೈಸಲು ಸಿದ್ಧರಾಗಿದ್ದೀರಾ?', cta_btn: 'ಈಗ ಕನಸನ್ನು ನಮೂದಿಸಿ',
    interpretations: 'ವ್ಯಾಖ್ಯಾನಗಳು',
    category_names: { 'Natur': 'ಪ್ರಕೃತಿ', 'Objekte': 'ವಸ್ತುಗಳು', 'Personen': 'ವ್ಯಕ್ತಿಗಳು', 'Tiere': 'ಪ್ರಾಣಿಗಳು', 'Aktivitäten': 'ಚಟುವಟಿಕೆಗಳು', 'Emotionen': 'ಭಾವನೆಗಳು', 'Körper': 'ದೇಹ', 'Orte': 'ಸ್ಥಳಗಳು' },
  },
  gu: {
    back: 'પાછા', title: 'સ્વપ્ન પ્રતીક પુસ્તકાલય', sources_label: 'સ્રોત',
    hero_title: 'મહાન સ્વપ્ન પ્રતીક ડેટાબેઝ',
    hero_subtitle: '877 સ્વપ્ન પ્રતીકો — મનોવિશ્લેષણ (ફ્રોઈડ) અને ઇસ્લામિક પરંપરા (ઇબ્ન સિરીન)ના અર્થઘટન સહ',
    stats_symbols: 'પ્રતીકો', stats_freud: 'ફ્રોઈડ અર્થઘટન', stats_ibn_sirin: 'ઇબ્ન સિરીન અર્થઘટન',
    stats_both: 'બંને દ્રષ્ટિકોણ સહ', stats_categories: 'શ્રેણીઓ',
    search_placeholder: 'પ્રતીક શોધો...', all_categories: 'બધા',
    source_freud: 'સિગ્મંડ ફ્રોઈડ', source_ibn_sirin: 'ઇબ્ન સિરીન',
    no_results: 'કોઈ પ્રતીક મળ્યા નહીં',
    context_examples: 'સંદર્ભ ઉદાહરણો', original_quote: 'મૂળ અવતરણ',
    related_symbols: 'સંબંધિત પ્રતીકો', east_west: 'પૂર્વ-પશ્ચિમ સરખામણી',
    western: 'પશ્ચિમી (ફ્રોઈડ)', eastern: 'પૂર્વીય (ઇબ્ન સિરીન)',
    cta_title: 'તમારું સ્વપ્ન અર્થઘટન કરવા તૈયાર છો?', cta_btn: 'હમણાં સ્વપ્ન દાખલ કરો',
    interpretations: 'અર્થઘટન',
    category_names: { 'Natur': 'પ્રકૃતિ', 'Objekte': 'વસ્તુઓ', 'Personen': 'વ્યક્તિઓ', 'Tiere': 'પ્રાણીઓ', 'Aktivitäten': 'પ્રવૃત્તિઓ', 'Emotionen': 'ભાવનાઓ', 'Körper': 'શરીર', 'Orte': 'સ્થળો' },
  },
  he: {
    back: 'חזרה', title: 'ספריית סמלי חלומות', sources_label: 'מקורות',
    hero_title: 'מאגר סמלי החלומות הגדול',
    hero_subtitle: '877 סמלי חלומות עם פרשנויות מהפסיכואנליזה (פרויד) ומהמסורת האסלאמית (אבן סירין)',
    stats_symbols: 'סמלים', stats_freud: 'פרשנויות פרויד', stats_ibn_sirin: 'פרשנויות אבן סירין',
    stats_both: 'שתי הפרספקטיבות', stats_categories: 'קטגוריות',
    search_placeholder: 'חפש סמל...', all_categories: 'הכל',
    source_freud: 'זיגמונד פרויד', source_ibn_sirin: 'אבן סירין',
    no_results: 'לא נמצאו סמלים',
    context_examples: 'דוגמאות הקשר', original_quote: 'ציטוט מקורי',
    related_symbols: 'סמלים קשורים', east_west: 'השוואה מזרח-מערב',
    western: 'מערבי (פרויד)', eastern: 'מזרחי (אבן סירין)',
    cta_title: 'מוכן לפרש את החלום שלך?', cta_btn: 'הזן חלום עכשיו',
    interpretations: 'פרשנויות',
    category_names: { 'Natur': 'טבע', 'Objekte': 'חפצים', 'Personen': 'אנשים', 'Tiere': 'בעלי חיים', 'Aktivitäten': 'פעילויות', 'Emotionen': 'רגשות', 'Körper': 'גוף', 'Orte': 'מקומות' },
  },
  ne: {
    back: 'फिर्ता', title: 'सपना प्रतीक पुस्तकालय', sources_label: 'स्रोतहरू',
    hero_title: 'महान सपना प्रतीक डेटाबेस',
    hero_subtitle: '877 सपना प्रतीकहरू — मनोविश्लेषण (फ्रायड) र इस्लामी परम्परा (इब्न सिरीन) का व्याख्याहरूसहित',
    stats_symbols: 'प्रतीकहरू', stats_freud: 'फ्रायड व्याख्या', stats_ibn_sirin: 'इब्न सिरीन व्याख्या',
    stats_both: 'दुवै दृष्टिकोणसहित', stats_categories: 'श्रेणीहरू',
    search_placeholder: 'प्रतीक खोज्नुहोस्...', all_categories: 'सबै',
    source_freud: 'सिगमन्ड फ्रायड', source_ibn_sirin: 'इब्न सिरीन',
    no_results: 'कुनै प्रतीक फेला परेन',
    context_examples: 'सन्दर्भ उदाहरणहरू', original_quote: 'मूल उद्धरण',
    related_symbols: 'सम्बन्धित प्रतीकहरू', east_west: 'पूर्व-पश्चिम तुलना',
    western: 'पश्चिमी (फ्रायड)', eastern: 'पूर्वी (इब्न सिरीन)',
    cta_title: 'तपाईंको सपना व्याख्या गर्न तयार हुनुहुन्छ?', cta_btn: 'अहिले सपना प्रविष्ट गर्नुहोस्',
    interpretations: 'व्याख्याहरू',
    category_names: { 'Natur': 'प्रकृति', 'Objekte': 'वस्तुहरू', 'Personen': 'व्यक्तिहरू', 'Tiere': 'जनावरहरू', 'Aktivitäten': 'क्रियाकलापहरू', 'Emotionen': 'भावनाहरू', 'Körper': 'शरीर', 'Orte': 'ठाउँहरू' },
  },
  prs: {
    back: 'برگشت', title: 'کتابخانه نمادهای خواب', sources_label: 'منابع',
    hero_title: 'پایگاه داده بزرگ نمادهای خواب',
    hero_subtitle: '877 نماد خواب با تفسیرهای روانکاوی (فروید) و سنت اسلامی (ابن سیرین)',
    stats_symbols: 'نماد', stats_freud: 'تفسیر فروید', stats_ibn_sirin: 'تفسیر ابن سیرین',
    stats_both: 'با هر دو دیدگاه', stats_categories: 'دسته‌بندی‌ها',
    search_placeholder: 'جستجوی نماد...', all_categories: 'همه',
    source_freud: 'زیگموند فروید', source_ibn_sirin: 'ابن سیرین',
    no_results: 'نمادی یافت نشد',
    context_examples: 'مثال‌های متنی', original_quote: 'نقل‌قول اصلی',
    related_symbols: 'نمادهای مرتبط', east_west: 'مقایسه شرق و غرب',
    western: 'غربی (فروید)', eastern: 'شرقی (ابن سیرین)',
    cta_title: 'آماده تفسیر خوابتان هستید؟', cta_btn: 'خواب را وارد کنید',
    interpretations: 'تفسیرها',
    category_names: { 'Natur': 'طبیعت', 'Objekte': 'اشیاء', 'Personen': 'افراد', 'Tiere': 'حیوانات', 'Aktivitäten': 'فعالیت‌ها', 'Emotionen': 'احساسات', 'Körper': 'بدن', 'Orte': 'مکان‌ها' },
  },
  'ar-gulf': {
    back: 'رجوع', title: 'مكتبة رموز الأحلام', sources_label: 'المصادر',
    hero_title: 'قاعدة بيانات رموز الأحلام الكبرى',
    hero_subtitle: '877 رمز للأحلام مع تفسيرات من التحليل النفسي (فرويد) والتراث الإسلامي (ابن سيرين)',
    stats_symbols: 'رمز', stats_freud: 'تفسير فرويد', stats_ibn_sirin: 'تفسير ابن سيرين',
    stats_both: 'بكلا المنظورين', stats_categories: 'فئات',
    search_placeholder: 'دور على رمز...', all_categories: 'الكل',
    source_freud: 'سيغموند فرويد', source_ibn_sirin: 'ابن سيرين',
    no_results: 'ما لقيت رموز',
    context_examples: 'أمثلة سياقية', original_quote: 'اقتباس أصلي',
    related_symbols: 'رموز مرتبطة', east_west: 'مقارنة شرق-غرب',
    western: 'غربي (فرويد)', eastern: 'شرقي (ابن سيرين)',
    cta_title: 'مستعد تفسر حلمك؟', cta_btn: 'أدخل الحلم الحين',
    interpretations: 'تفسيرات',
    category_names: { 'Natur': 'طبيعة', 'Objekte': 'أشياء', 'Personen': 'أشخاص', 'Tiere': 'حيوانات', 'Aktivitäten': 'أنشطة', 'Emotionen': 'مشاعر', 'Körper': 'جسم', 'Orte': 'أماكن' },
  },
  'ar-eg': {
    back: 'رجوع', title: 'مكتبة رموز الأحلام', sources_label: 'المصادر',
    hero_title: 'قاعدة بيانات رموز الأحلام الكبيرة',
    hero_subtitle: '877 رمز للأحلام مع تفسيرات من التحليل النفسي (فرويد) والتراث الإسلامي (ابن سيرين)',
    stats_symbols: 'رمز', stats_freud: 'تفسير فرويد', stats_ibn_sirin: 'تفسير ابن سيرين',
    stats_both: 'بالمنظورين مع بعض', stats_categories: 'فئات',
    search_placeholder: 'دور على رمز...', all_categories: 'الكل',
    source_freud: 'سيغموند فرويد', source_ibn_sirin: 'ابن سيرين',
    no_results: 'مفيش رموز اتلاقت',
    context_examples: 'أمثلة سياقية', original_quote: 'اقتباس أصلي',
    related_symbols: 'رموز مرتبطة', east_west: 'مقارنة شرق-غرب',
    western: 'غربي (فرويد)', eastern: 'شرقي (ابن سيرين)',
    cta_title: 'مستعد تفسر حلمك؟', cta_btn: 'أدخل الحلم دلوقتي',
    interpretations: 'تفسيرات',
    category_names: { 'Natur': 'طبيعة', 'Objekte': 'أشياء', 'Personen': 'أشخاص', 'Tiere': 'حيوانات', 'Aktivitäten': 'أنشطة', 'Emotionen': 'مشاعر', 'Körper': 'جسم', 'Orte': 'أماكن' },
  },
  'ar-lev': {
    back: 'رجوع', title: 'مكتبة رموز الأحلام', sources_label: 'المصادر',
    hero_title: 'قاعدة بيانات رموز الأحلام الكبيرة',
    hero_subtitle: '877 رمز للأحلام مع تفسيرات من التحليل النفسي (فرويد) والتراث الإسلامي (ابن سيرين)',
    stats_symbols: 'رمز', stats_freud: 'تفسير فرويد', stats_ibn_sirin: 'تفسير ابن سيرين',
    stats_both: 'بكلا المنظورين', stats_categories: 'فئات',
    search_placeholder: 'دوّر على رمز...', all_categories: 'الكل',
    source_freud: 'سيغموند فرويد', source_ibn_sirin: 'ابن سيرين',
    no_results: 'ما في رموز انعثرت',
    context_examples: 'أمثلة سياقية', original_quote: 'اقتباس أصلي',
    related_symbols: 'رموز مرتبطة', east_west: 'مقارنة شرق-غرب',
    western: 'غربي (فرويد)', eastern: 'شرقي (ابن سيرين)',
    cta_title: 'جاهز تفسر حلمك؟', cta_btn: 'أدخل الحلم هلق',
    interpretations: 'تفسيرات',
    category_names: { 'Natur': 'طبيعة', 'Objekte': 'أشياء', 'Personen': 'أشخاص', 'Tiere': 'حيوانات', 'Aktivitäten': 'أنشطة', 'Emotionen': 'مشاعر', 'Körper': 'جسم', 'Orte': 'أماكن' },
  },
  'ar-mag': {
    back: 'ارجع', title: 'مكتبة رموز الأحلام', sources_label: 'المصادر',
    hero_title: 'قاعدة بيانات رموز الأحلام الكبيرة',
    hero_subtitle: '877 رمز للأحلام مع تفسيرات من التحليل النفسي (فرويد) والتراث الإسلامي (ابن سيرين)',
    stats_symbols: 'رمز', stats_freud: 'تفسير فرويد', stats_ibn_sirin: 'تفسير ابن سيرين',
    stats_both: 'بجوج المنظورين', stats_categories: 'فئات',
    search_placeholder: 'قلّب على رمز...', all_categories: 'الكل',
    source_freud: 'سيغموند فرويد', source_ibn_sirin: 'ابن سيرين',
    no_results: 'ما لقينا حتى رمز',
    context_examples: 'أمثلة سياقية', original_quote: 'اقتباس أصلي',
    related_symbols: 'رموز مرتبطة', east_west: 'مقارنة شرق-غرب',
    western: 'غربي (فرويد)', eastern: 'شرقي (ابن سيرين)',
    cta_title: 'واش راك مستعد تفسر حلمك؟', cta_btn: 'دخّل الحلم دابا',
    interpretations: 'تفسيرات',
    category_names: { 'Natur': 'طبيعة', 'Objekte': 'أشياء', 'Personen': 'أشخاص', 'Tiere': 'حيوانات', 'Aktivitäten': 'أنشطة', 'Emotionen': 'مشاعر', 'Körper': 'جسم', 'Orte': 'أماكن' },
  },
  'ar-iq': {
    back: 'رجوع', title: 'مكتبة رموز الأحلام', sources_label: 'المصادر',
    hero_title: 'قاعدة بيانات رموز الأحلام الكبيرة',
    hero_subtitle: '877 رمز للأحلام مع تفسيرات من التحليل النفسي (فرويد) والتراث الإسلامي (ابن سيرين)',
    stats_symbols: 'رمز', stats_freud: 'تفسير فرويد', stats_ibn_sirin: 'تفسير ابن سيرين',
    stats_both: 'بالمنظورين', stats_categories: 'فئات',
    search_placeholder: 'دوّر على رمز...', all_categories: 'الكل',
    source_freud: 'سيغموند فرويد', source_ibn_sirin: 'ابن سيرين',
    no_results: 'ما لگينا رموز',
    context_examples: 'أمثلة سياقية', original_quote: 'اقتباس أصلي',
    related_symbols: 'رموز مرتبطة', east_west: 'مقارنة شرق-غرب',
    western: 'غربي (فرويد)', eastern: 'شرقي (ابن سيرين)',
    cta_title: 'مستعد تفسر حلمك؟', cta_btn: 'أدخل الحلم هسة',
    interpretations: 'تفسيرات',
    category_names: { 'Natur': 'طبيعة', 'Objekte': 'أشياء', 'Personen': 'أشخاص', 'Tiere': 'حيوانات', 'Aktivitäten': 'أنشطة', 'Emotionen': 'مشاعر', 'Körper': 'جسم', 'Orte': 'أماكن' },
  },
};

// ─── Category Icons ──────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  'Natur': '🌿', 'Objekte': '🔑', 'Personen': '👤', 'Tiere': '🐍',
  'Aktivitäten': '🏃', 'Emotionen': '💭', 'Körper': '🫀', 'Orte': '🏛️',
  'Spirituelles': '✨',
};

// ─── Helper: render bold markdown ────────────────────────────────────────────

function renderBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>);
}

// ─── Source definitions ──────────────────────────────────────────────────────

const SOURCE_DEFS: { key: string; label: string; icon: string; color: string }[] = [
  { key: 'freud', label: 'Freud', icon: '🧠', color: 'blue' },
  { key: 'ibn_sirin', label: 'Ibn Sirin', icon: '🕌', color: 'emerald' },
  { key: 'jung', label: 'C.G. Jung', icon: '🔮', color: 'purple' },
  { key: 'gestalt', label: 'Gestalt', icon: '🪞', color: 'orange' },
  { key: 'nabulsi', label: 'Al-Nabulsi', icon: '📖', color: 'teal' },
  { key: 'medieval', label: 'Mittelalter', icon: '🏰', color: 'amber' },
  { key: 'church_fathers', label: 'Kirchenväter', icon: '⛪', color: 'rose' },
  { key: 'modern_theology', label: 'Mod. Theologie', icon: '✝️', color: 'sky' },
  { key: 'tibetan', label: 'Tibet', icon: '🏔️', color: 'violet' },
  { key: 'zen', label: 'Zen', icon: '☯️', color: 'lime' },
  { key: 'theravada', label: 'Theravada', icon: '🪷', color: 'yellow' },
  { key: 'western_zodiac', label: 'Astrologie', icon: '♈', color: 'pink' },
];

function getSymbolSources(sym: any): string[] {
  const sources: string[] = [];
  if (sym.freud?.vorhanden) sources.push('freud');
  if (sym.ibn_sirin?.vorhanden) sources.push('ibn_sirin');
  if (sym.additional_sources) {
    Object.keys(sym.additional_sources).forEach(k => sources.push(k));
  }
  return sources;
}

// ─── Component ───────────────────────────────────────────────────────────────

const DreamSymbolsPage: React.FC<DreamSymbolsPageProps> = ({ language, onClose, onNavigateHome, themeMode }) => {
  const isLight = themeMode === 'light';
  const langKey = (language as string).startsWith('ar-') ? (language as string) : (language as string);
  const t = T[langKey] || ((language as string).startsWith('ar') ? T.ar : T.en);
  const isRtl = (language as string).startsWith('ar') || ['fa', 'ur', 'he', 'prs'].includes(language as string);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

  const { data: searchData, loading: searchLoading } = useSymbolSearch(search, language as string);
  const hasActiveSearch = search.trim().length > 0;
  const langShort = ((language as string) || 'de').split('-')[0].toLowerCase();
  const inputDir: 'rtl' | 'ltr' = (RTL_LOCALES as readonly string[]).includes(langShort) ? 'rtl' : 'ltr';
  const isTranslatedMatch =
    searchData?.matched_via === 'gemini_translation' || searchData?.matched_via === 'query_cache';
  const translatedHint =
    hasActiveSearch && isTranslatedMatch && searchData?.translated_to
      ? (TRANSLATED_HINT[langShort] ?? TRANSLATED_HINT.de)(search.trim(), searchData.translated_to)
      : null;

  const symbols = (symbolData as any).symbole as any[];
  const meta = (symbolData as any).metadata;
  const categories = Object.keys(CATEGORY_ICONS);

  // Count how many symbols each source has
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    symbols.forEach((s: any) => {
      getSymbolSources(s).forEach(src => {
        counts[src] = (counts[src] || 0) + 1;
      });
    });
    return counts;
  }, [symbols]);

  const filtered = useMemo(() => {
    let result = hasActiveSearch ? (searchData?.results ?? []) : symbols;
    if (selectedCategory) result = result.filter((s: any) => s.kategorie === selectedCategory);
    if (selectedSource) result = result.filter((s: any) => getSymbolSources(s).includes(selectedSource));
    return result;
  }, [hasActiveSearch, searchData, selectedCategory, selectedSource, symbols]);

  const card = isLight ? 'bg-white/80 border-slate-200' : 'bg-white/5 border-white/10';
  const accent = isLight ? 'text-indigo-700' : 'text-indigo-400';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-slate-800' : 'bg-[#0a0a1a] text-slate-200'} pb-32`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back */}
        <button onClick={onClose} className={`mb-4 flex items-center gap-1 text-sm font-medium ${isLight ? 'text-fuchsia-600' : 'text-fuchsia-400'}`}>
          <span className="material-icons text-base">arrow_back</span> {t.back}
        </button>

        {/* Hero */}
        <div className={`rounded-2xl p-6 mb-6 text-center ${isLight ? 'bg-gradient-to-br from-indigo-50 to-fuchsia-50' : 'bg-gradient-to-br from-indigo-900/30 to-fuchsia-900/20'}`}>
          <h1 className="text-2xl font-bold font-mystic mb-2">{t.hero_title}</h1>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{t.hero_subtitle}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`rounded-xl border p-3 text-center ${card}`}>
            <div className="text-2xl mb-1">📚</div>
            <div className={`text-xl font-bold ${accent}`}>{meta.statistik.gesamt_symbole}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{t.stats_symbols}</div>
          </div>
          <div className={`rounded-xl border p-3 text-center ${card}`}>
            <div className="text-2xl mb-1">📖</div>
            <div className={`text-xl font-bold ${accent}`}>{SOURCE_DEFS.filter(s => sourceCounts[s.key]).length}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{t.stats_categories}</div>
          </div>
          <div className={`rounded-xl border p-3 text-center ${card}`}>
            <div className="text-2xl mb-1">🌍</div>
            <div className={`text-xl font-bold ${accent}`}>{Object.keys(CATEGORY_ICONS).length}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{t.all_categories}</div>
          </div>
        </div>

        {/* Source Filter Buttons */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">{t.sources_label}</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setSelectedSource(null)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${!selectedSource ? 'bg-indigo-600 text-white shadow-lg' : `border ${card}`}`}>
              {t.all_categories} ({meta.statistik.gesamt_symbole})
            </button>
            {SOURCE_DEFS.filter(s => sourceCounts[s.key]).sort((a, b) => (sourceCounts[b.key] || 0) - (sourceCounts[a.key] || 0)).map(src => (
              <button key={src.key} onClick={() => setSelectedSource(selectedSource === src.key ? null : src.key)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedSource === src.key ? 'bg-indigo-600 text-white shadow-lg' : `border ${card}`}`}>
                <span>{src.icon}</span> {src.label} <span className="opacity-60">({sourceCounts[src.key]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t.search_placeholder}
            dir={inputDir}
            data-testid="symbol-search-input"
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isLight ? 'bg-white border-slate-200 focus:border-indigo-400' : 'bg-white/5 border-white/10 focus:border-indigo-500'}`}
          />
          {translatedHint && (
            <p className={`mt-1 text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`} data-testid="translated-hint">
              {translatedHint}
            </p>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!selectedCategory ? 'bg-fuchsia-600 text-white' : `border ${card}`}`}>
            {t.all_categories}
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${selectedCategory === cat ? 'bg-fuchsia-600 text-white' : `border ${card}`}`}>
              {CATEGORY_ICONS[cat]} {t.category_names[cat] || cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs mb-3 text-slate-500">{filtered.length} {t.stats_symbols}</p>

        {/* Symbol List */}
        {filtered.length === 0 ? (
          <div className={`text-center py-12 ${isLight ? 'text-slate-400' : 'text-slate-600'}`} data-testid="no-results">
            {hasActiveSearch && !searchLoading && searchData
              ? (UNKNOWN_SYMBOL[langShort] ?? UNKNOWN_SYMBOL.de)
              : t.no_results}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((sym: any) => {
              const isExpanded = expandedSymbol === sym.id;
              const hasFreud = sym.freud?.vorhanden;
              const hasIbnSirin = sym.ibn_sirin?.vorhanden;
              const allSources = getSymbolSources(sym);

              return (
                <div key={sym.id} className={`rounded-xl border overflow-hidden transition-all ${card} ${isExpanded ? 'ring-1 ring-indigo-500/50' : ''}`}>
                  {/* Header */}
                  <button onClick={() => setExpandedSymbol(isExpanded ? null : sym.id)}
                    className="w-full flex items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{sym.emoji || CATEGORY_ICONS[sym.kategorie] || '✨'}</span>
                      <div>
                        <span className="font-bold text-sm">{sym.name}</span>
                        {sym.synonyme?.length > 0 && (
                          <span className={`text-xs ml-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                            ({sym.synonyme.slice(0, 3).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {allSources.map(src => {
                          const def = SOURCE_DEFS.find(d => d.key === src);
                          return def ? <span key={src} className="text-xs" title={def.label}>{def.icon}</span> : null;
                        })}
                      </div>
                      <span className="text-xs text-slate-500">{allSources.length}</span>
                      <span className={`material-icons text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className={`px-4 pb-4 space-y-4 border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                      {/* Freud */}
                      {hasFreud && (
                        <div className="pt-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2 flex items-center gap-1">
                            <span>🧠</span> {t.source_freud}
                          </h4>
                          <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {sym.freud.interpretation}
                          </p>
                          {sym.freud.original_zitat && (
                            <blockquote className={`mt-2 pl-3 border-l-2 italic text-xs ${isLight ? 'border-blue-300 text-slate-500' : 'border-blue-700 text-slate-400'}`}>
                              &ldquo;{sym.freud.original_zitat}&rdquo;
                            </blockquote>
                          )}
                          {sym.freud.kontext_beispiele?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-500">{t.context_examples}</p>
                              <ul className={`text-xs space-y-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                {sym.freud.kontext_beispiele.map((ex: string, i: number) => <li key={i}>• {ex}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ibn Sirin */}
                      {hasIbnSirin && (
                        <div className={hasFreud ? 'pt-2' : 'pt-4'}>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2 flex items-center gap-1">
                            <span>🕌</span> {t.source_ibn_sirin}
                          </h4>
                          <ul className={`text-sm space-y-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {sym.ibn_sirin.deutungen?.map((d: string, i: number) => (
                              <li key={i} className="leading-relaxed">{renderBold(d)}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Additional Sources (Jung, Gestalt, etc.) */}
                      {sym.additional_sources && Object.entries(sym.additional_sources).map(([key, val]: [string, any]) => {
                        const def = SOURCE_DEFS.find(d => d.key === key);
                        return (
                          <div key={key} className="pt-2">
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
                              <span>{def?.icon || '📖'}</span> {val.label || def?.label || key}
                            </h4>
                            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              {val.text}
                            </p>
                          </div>
                        );
                      })}

                      {/* East-West Comparison */}
                      {sym.ost_west_vergleich?.unterschiede && (
                        <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>
                          <p className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${accent}`}>{t.east_west}</p>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="font-bold text-blue-500 mb-1">{t.western}</p>
                              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>{sym.ost_west_vergleich.unterschiede.westlich_freud}</p>
                            </div>
                            <div>
                              <p className="font-bold text-emerald-500 mb-1">{t.eastern}</p>
                              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>{sym.ost_west_vergleich.unterschiede.östlich_ibn_sirin}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Related Symbols */}
                      {sym.verwandte_symbole?.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-500">{t.related_symbols}</p>
                          <div className="flex flex-wrap gap-1">
                            {sym.verwandte_symbole.map((r: string, i: number) => (
                              <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-slate-400'}`}>{r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <h3 className={`text-lg font-bold mb-3 ${accent}`}>{t.cta_title}</h3>
          <button onClick={onNavigateHome}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">
            {t.cta_btn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DreamSymbolsPage;
