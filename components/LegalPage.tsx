import React from 'react';
import { Language } from '../types';

interface LegalPageProps {
  language: Language;
  onClose: () => void;
  themeMode?: string;
  title: string;
  children: React.ReactNode;
}

const LegalPage: React.FC<LegalPageProps> = ({ language, onClose, themeMode, title, children }) => {
  const isLight = themeMode === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-mystic-text' : 'bg-dream-bg text-slate-200'}`}>
      <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
        <button
          onClick={onClose}
          className={`mb-6 flex items-center gap-2 text-sm font-medium ${isLight ? 'text-fuchsia-600 hover:text-fuchsia-800' : 'text-fuchsia-400 hover:text-fuchsia-300'} transition-colors`}
        >
          <span className="material-icons text-base">arrow_back</span>
          {language === Language.DE ? 'Zurueck' : 'Back'}
        </button>

        <h1 className={`text-3xl font-mystic font-bold mb-8 ${isLight ? 'text-indigo-900' : 'text-white'}`}>
          {title}
        </h1>

        <div className={`prose max-w-none space-y-6 text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
