import React, { useState } from 'react';
import { ThemeMode, Language } from '../types';
import { getTheme } from '../theme';

interface DreamMentionModalProps {
  themeMode: ThemeMode;
  language: Language;
  detectedNames: string[];
  onClose: () => void;
  onShare: (name: string, method: 'whatsapp' | 'email' | 'link') => void;
}

// Simple person name detection from dream text
export function detectMentionedPersons(dreamText: string): string[] {
  const names = new Set<string>();
  const patterns = [
    /(?:von|mit|mein(?:e[mr]?)?\s+(?:Bruder|Schwester|Freund|Freundin|Mutter|Vater|Chef|Kolleg(?:e|in)|Mann|Frau|Oma|Opa))\s+([A-Z\u00C0-\u024F][a-z\u00C0-\u024F]{2,})/g,
    /(?:with|my\s+(?:brother|sister|friend|mother|father|boss|wife|husband))\s+([A-Z][a-z]{2,})/gi,
    /(?:\u0645\u0639|\u0623\u062E\u064A|\u0623\u062E\u062A\u064A|\u0635\u062F\u064A\u0642\u064A)\s+([\u0600-\u06FF]{2,})/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(dreamText)) !== null) {
      const name = match[1];
      if (name && name.length >= 2 && name.length <= 20) {
        names.add(name);
      }
    }
  }

  return [...names];
}

export const DreamMentionModal: React.FC<DreamMentionModalProps> = ({
  themeMode, language, detectedNames, onClose, onShare,
}) => {
  const th = getTheme(themeMode);
  const isDE = language === 'de';
  const [selectedName, setSelectedName] = useState(detectedNames[0] || '');

  if (detectedNames.length === 0) return null;

  const shareLink = 'https://dream-code.app/?dreamedAbout=true&ref=DREAM';

  const handleShare = (method: 'whatsapp' | 'email' | 'link') => {
    if (method === 'whatsapp') {
      const text = isDE
        ? `Jemand hat von dir getraeumt! Finde heraus wer und was: ${shareLink}`
        : `Someone dreamed about you! Find out who and what: ${shareLink}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else if (method === 'email') {
      const subject = isDE ? 'Jemand hat von dir getraeumt' : 'Someone dreamed about you';
      const body = isDE
        ? `Hallo ${selectedName},\n\njemand hat von dir getraeumt! Oeffne DreamCode um herauszufinden wer:\n${shareLink}`
        : `Hi ${selectedName},\n\nSomeone dreamed about you! Open DreamCode to find out:\n${shareLink}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    } else {
      navigator.clipboard.writeText(shareLink);
    }
    onShare(selectedName, method);
  };

  return (
    <div className={`fixed inset-0 z-[120] ${th.modalOverlay} flex items-center justify-center p-4`} onClick={onClose}>
      <div className={`w-full max-w-sm rounded-2xl ${th.modalBg} border ${th.border} p-6`} onClick={e => e.stopPropagation()}>
        <h3 className={`text-lg font-bold ${th.textPrimary} mb-2`}>
          {isDE ? 'Du hast von jemandem getraeumt' : 'You dreamed about someone'}
        </h3>

        <p className={`text-sm ${th.textSecondary} mb-4`}>
          {isDE
            ? `Wir haben erkannt: "${selectedName}"`
            : `We detected: "${selectedName}"`}
        </p>

        {detectedNames.length > 1 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {detectedNames.map(n => (
              <button
                key={n}
                onClick={() => setSelectedName(n)}
                className={`px-2 py-1 rounded-full text-xs transition-all ${
                  selectedName === n
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : `${th.surfaceBg} ${th.textMuted} border ${th.borderLight}`
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        <p className={`text-xs ${th.textMuted} mb-4`}>
          {isDE
            ? 'Er/Sie erfaehrt nur dass jemand von ihm/ihr getraeumt hat \u2014 anonym.'
            : 'They will only know that someone dreamed about them \u2014 anonymously.'}
        </p>

        <div className="space-y-2">
          <button
            onClick={() => handleShare('whatsapp')}
            className="w-full py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            Per WhatsApp teilen
          </button>
          <button
            onClick={() => handleShare('email')}
            className={`w-full py-3 rounded-xl text-sm font-bold ${th.btnSecondary} border`}
          >
            Per Email teilen
          </button>
          <button
            onClick={() => handleShare('link')}
            className={`w-full py-3 rounded-xl text-sm ${th.btnGhost}`}
          >
            Link kopieren
          </button>
          <button
            onClick={onClose}
            className={`w-full py-2 text-xs ${th.textMuted}`}
          >
            {isDE ? 'Ueberspringen' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DreamMentionModal;
