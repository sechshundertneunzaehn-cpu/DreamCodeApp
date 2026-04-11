import React, { useState } from 'react';
import { useAutoTranslate, useUserLanguage } from '../hooks/useTranslation';

const TOGGLE_LABELS: Record<string, { translated: string; original: string; badge: string }> = {
  de: { translated: 'Übersetzung anzeigen', original: 'Original anzeigen', badge: 'Übersetzt' },
  en: { translated: 'Show translation', original: 'Show original', badge: 'Translated' },
  tr: { translated: 'Çeviriyi göster', original: 'Orijinali göster', badge: 'Çevrildi' },
  es: { translated: 'Mostrar traducción', original: 'Mostrar original', badge: 'Traducido' },
  fr: { translated: 'Afficher la traduction', original: 'Afficher l\'original', badge: 'Traduit' },
  ar: { translated: 'عرض الترجمة', original: 'عرض الأصل', badge: 'مترجم' },
  pt: { translated: 'Mostrar tradução', original: 'Mostrar original', badge: 'Traduzido' },
  ru: { translated: 'Показать перевод', original: 'Показать оригинал', badge: 'Переведено' },
  zh: { translated: '显示翻译', original: '显示原文', badge: '已翻译' },
  hi: { translated: 'अनुवाद दिखाएं', original: 'मूल दिखाएं', badge: 'अनुवादित' },
  ja: { translated: '翻訳を表示', original: '原文を表示', badge: '翻訳済み' },
  ko: { translated: '번역 보기', original: '원문 보기', badge: '번역됨' },
  fa: { translated: 'نمایش ترجمه', original: 'نمایش اصل', badge: 'ترجمه شده' },
  ur: { translated: 'ترجمہ دکھائیں', original: 'اصل دکھائیں', badge: 'ترجمہ شدہ' },
  bn: { translated: 'অনুবাদ দেখান', original: 'মূল দেখান', badge: 'অনূদিত' },
  th: { translated: 'แสดงคำแปล', original: 'แสดงต้นฉบับ', badge: 'แปลแล้ว' },
  id: { translated: 'Tampilkan terjemahan', original: 'Tampilkan asli', badge: 'Diterjemahkan' },
  it: { translated: 'Mostra traduzione', original: 'Mostra originale', badge: 'Tradotto' },
  pl: { translated: 'Pokaż tłumaczenie', original: 'Pokaż oryginał', badge: 'Przetłumaczono' },
  vi: { translated: 'Hiển thị bản dịch', original: 'Hiển thị bản gốc', badge: 'Đã dịch' },
  sw: { translated: 'Onyesha tafsiri', original: 'Onyesha asili', badge: 'Imetafsiriwa' },
  hu: { translated: 'Fordítás mutatása', original: 'Eredeti mutatása', badge: 'Lefordítva' },
};

function getToggleLabels(lang: string) {
  return TOGGLE_LABELS[lang] || TOGGLE_LABELS.en;
}

export interface TranslatedTextProps {
  text: string;
  sourceId: string;
  table: string;
  field: string;
  sourceLang?: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  maxLines?: number;
  showOriginalToggle?: boolean;
  renderContent?: (text: string) => React.ReactNode;
}

const lineClampClass: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
};

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  sourceId,
  table,
  field,
  sourceLang,
  className = '',
  as: Tag = 'span',
  maxLines,
  showOriginalToggle = false,
  renderContent,
}) => {
  const [mode, setMode] = useState<'ai' | 'original'>('ai');
  const { language } = useUserLanguage();
  const labels = getToggleLabels(language);

  const { translatedText, isTranslating, isOriginal } = useAutoTranslate(
    text,
    sourceId,
    table,
    field,
    sourceLang
  );

  const displayText = mode === 'original' ? text : translatedText;

  const clampClass = maxLines && lineClampClass[maxLines] ? lineClampClass[maxLines] : '';

  const textClasses = [
    'transition-opacity duration-300',
    isTranslating ? 'opacity-60' : 'opacity-100',
    clampClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const googleUrl = `https://translate.google.com/?text=${encodeURIComponent(text)}&sl=auto&tl=${language}`;

  return (
    <>
      <Tag className={textClasses}>
        {renderContent ? renderContent(displayText) : displayText}
        {!isOriginal && mode === 'ai' && (
          <span
            className="ml-1 text-xs opacity-40 select-none"
            title={labels.badge}
            aria-hidden="true"
          >
            🌐
          </span>
        )}
      </Tag>
      {showOriginalToggle && !isOriginal && (
        <div className="flex gap-1 mt-1.5">
          <button
            type="button"
            onClick={() => setMode('original')}
            className={`text-xs px-2 py-0.5 rounded border transition-colors duration-150 ${
              mode === 'original'
                ? 'bg-slate-600 border-slate-400 text-white'
                : 'text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`text-xs px-2 py-0.5 rounded border transition-colors duration-150 ${
              mode === 'ai'
                ? 'bg-indigo-600 border-indigo-400 text-white'
                : 'text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            🤖 KI
          </button>
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-0.5 rounded border text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500 transition-colors duration-150"
          >
            🔗 Google
          </a>
        </div>
      )}
    </>
  );
};

export default TranslatedText;
