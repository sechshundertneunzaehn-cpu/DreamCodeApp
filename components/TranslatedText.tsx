import React, { useState } from 'react';
import { useAutoTranslate } from '../hooks/useTranslation';

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
  const [showingOriginal, setShowingOriginal] = useState(false);

  const { translatedText, isTranslating, isOriginal } = useAutoTranslate(
    text,
    sourceId,
    table,
    field,
    sourceLang
  );

  const displayText = showingOriginal ? text : translatedText;

  const clampClass = maxLines && lineClampClass[maxLines] ? lineClampClass[maxLines] : '';

  const textClasses = [
    'transition-opacity duration-300',
    isTranslating ? 'animate-pulse opacity-60' : 'opacity-100',
    clampClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <Tag className={textClasses}>
        {renderContent ? renderContent(displayText) : displayText}
        {!isOriginal && !showingOriginal && (
          <span
            className="ml-1 text-xs opacity-40 select-none"
            title="Übersetzt"
            aria-hidden="true"
          >
            🌐
          </span>
        )}
      </Tag>
      {showOriginalToggle && !isOriginal && (
        <button
          type="button"
          onClick={() => setShowingOriginal((prev) => !prev)}
          className="mt-1 text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors duration-150 block"
        >
          {showingOriginal ? 'Übersetzung anzeigen' : 'Original anzeigen'}
        </button>
      )}
    </>
  );
};

export default TranslatedText;
