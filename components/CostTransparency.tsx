import React, { useState, useEffect } from 'react';
import { ThemeMode, Language } from '../types';
import { getTheme } from '../theme';
import { FEATURE_PRICES, API_COSTS, COIN_VALUE_EUR, coinToEur } from '../config/pricing';

// ============================================
// A) InfoBanner — Klappbar, App-Top
// ============================================
export function InfoBanner({ themeMode, language }: { themeMode: ThemeMode; language: Language }) {
  const th = getTheme(themeMode);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem('cost_info_dismissed') === 'true');
  }, []);

  if (dismissed) return null;

  const t = {
    de: { title: 'Warum kosten manche Features mehr?', dismiss: 'Verstanden',
      body: 'DreamCode nutzt verschiedene KI-APIs. Jede Anfrage kostet uns echtes Geld. Hier die ungefaehren Kosten pro Anfrage:' },
    en: { title: 'Why do some features cost more?', dismiss: 'Got it',
      body: 'DreamCode uses various AI APIs. Each request costs us real money. Here are the approximate costs per request:' },
    ar: { title: '\u0644\u0645\u0627\u0630\u0627 \u062A\u0643\u0644\u0641 \u0628\u0639\u0636 \u0627\u0644\u0645\u064A\u0632\u0627\u062A \u0623\u0643\u062B\u0631\u061F', dismiss: '\u0641\u0647\u0645\u062A',
      body: '\u064A\u0633\u062A\u062E\u062F\u0645 DreamCode \u0648\u0627\u062C\u0647\u0627\u062A \u0628\u0631\u0645\u062C\u0629 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0645\u062E\u062A\u0644\u0641\u0629.' },
    tr: { title: 'Neden bazi ozellikler daha pahali?', dismiss: 'Anladim',
      body: 'DreamCode cesitli yapay zeka API\'leri kullanir. Her istek bize gercek paraya mal olur.' },
    ru: { title: '\u041F\u043E\u0447\u0435\u043C\u0443 \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0441\u0442\u043E\u044F\u0442 \u0434\u043E\u0440\u043E\u0436\u0435?', dismiss: '\u041F\u043E\u043D\u044F\u0442\u043D\u043E',
      body: 'DreamCode \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 \u0440\u0430\u0437\u043B\u0438\u0447\u043D\u044B\u0435 API \u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u0438\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442\u0430.' },
  } as Record<string, { title: string; dismiss: string; body: string }>;
  const loc = t[language] || t.en;

  const pills = [
    { label: 'Text', cost: '~0,001\u20AC' },
    { label: 'Bild', cost: '~0,004\u20AC' },
    { label: 'Video', cost: '~0,48\u20AC' },
    { label: 'Voice', cost: '~0,05\u20AC' },
  ];

  return (
    <div className={`mx-4 mt-2 rounded-xl border ${th.border} ${th.cardBg} overflow-hidden transition-all duration-300`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-4 py-3 flex items-center justify-between ${th.textSecondary} text-sm`}
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          {loc.title}
        </span>
        <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>&#9660;</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <p className={`text-xs ${th.textMuted} mb-3`}>{loc.body}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {pills.map(p => (
              <span key={p.label} className={`px-3 py-1 rounded-full text-xs font-medium ${th.surfaceBg} ${th.border} border ${th.textSecondary}`}>
                {p.label} {p.cost}
              </span>
            ))}
          </div>
          <button
            onClick={() => { setDismissed(true); localStorage.setItem('cost_info_dismissed', 'true'); }}
            className={`text-xs ${th.btnGhost} px-3 py-1 rounded-lg`}
          >
            {loc.dismiss}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// B) CostStrip — Unter Feature-Buttons
// ============================================
export function CostStrip({ userPays, apiCost, themeMode }: { userPays: number; apiCost: number; themeMode: ThemeMode }) {
  const th = getTheme(themeMode);
  const userEur = coinToEur(userPays);
  return (
    <div className={`flex items-center gap-2 text-[10px] ${th.textMuted} mt-1`}>
      <span className="text-emerald-500">{userPays} Coins ({userEur.toFixed(3)}\u20AC)</span>
      <span>\u00B7</span>
      <span className="text-orange-400">API: {apiCost.toFixed(3)}\u20AC</span>
    </div>
  );
}

// ============================================
// C) VideoKostenRechner — Pricing Screen
// ============================================
export function VideoKostenRechner({ themeMode, language }: { themeMode: ThemeMode; language: Language }) {
  const th = getTheme(themeMode);
  const [days, setDays] = useState(30);
  const videoCostApi = 0.48;
  const videoCostUser = coinToEur(FEATURE_PRICES.VIDEO_30S);
  const totalApi = days * videoCostApi;
  const totalUser = days * videoCostUser;
  const profit = totalUser - totalApi;

  const options = [7, 30, 90, 365];
  const labels = { de: 'Video-Kostenrechner', en: 'Video Cost Calculator' } as Record<string, string>;

  return (
    <div className={`rounded-xl p-4 ${th.cardBg} border ${th.border}`}>
      <h3 className={`text-sm font-bold ${th.textPrimary} mb-3`}>{labels[language] || labels.en}</h3>
      <div className="flex gap-2 mb-4">
        {options.map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              days === d ? th.btnPrimary : `${th.surfaceBg} ${th.textSecondary} border ${th.border}`
            }`}
          >
            {d} {language === 'de' ? 'Tage' : 'days'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className={`rounded-lg p-3 ${th.surfaceBg}`}>
          <div className={`text-[10px] ${th.textMuted}`}>Du zahlst</div>
          <div className={`text-sm font-bold text-emerald-500`}>{totalUser.toFixed(2)}\u20AC</div>
        </div>
        <div className={`rounded-lg p-3 ${th.surfaceBg}`}>
          <div className={`text-[10px] ${th.textMuted}`}>API-Kosten</div>
          <div className={`text-sm font-bold text-orange-400`}>{totalApi.toFixed(2)}\u20AC</div>
        </div>
        <div className={`rounded-lg p-3 ${th.surfaceBg}`}>
          <div className={`text-[10px] ${th.textMuted}`}>Unser Anteil</div>
          <div className={`text-sm font-bold ${th.textPrimary}`}>{profit.toFixed(2)}\u20AC</div>
        </div>
      </div>
      {days === 30 && (
        <p className={`text-[10px] ${th.textMuted} mt-2`}>
          30 Videos = {totalUser.toFixed(2)}\u20AC \u00B7 Netflix kostet 17,99\u20AC
        </p>
      )}
    </div>
  );
}

// ============================================
// D) PricingAufschluesselung — Pricing Screen
// ============================================
export function PricingAufschluesselung({ themeMode, language }: { themeMode: ThemeMode; language: Language }) {
  const th = getTheme(themeMode);

  const features = [
    { name: 'Text (Groq)', coins: FEATURE_PRICES.TEXT_BASIC, api: 0.001 },
    { name: 'Text (Gemini)', coins: FEATURE_PRICES.TEXT_GEMINI, api: 0.005 },
    { name: 'Text (Claude 6P)', coins: FEATURE_PRICES.TEXT_PREMIUM_6P, api: 0.03 },
    { name: 'Bild (Standard)', coins: FEATURE_PRICES.IMAGE_STANDARD, api: API_COSTS.IMAGE_RUNWARE },
    { name: 'Bild (HD)', coins: FEATURE_PRICES.IMAGE_HD, api: API_COSTS.IMAGE_REPLICATE },
    { name: 'Video (30s)', coins: FEATURE_PRICES.VIDEO_30S, api: 0.48 },
    { name: 'Slideshow (30s)', coins: FEATURE_PRICES.SLIDESHOW_30S, api: 0.02 },
    { name: 'TTS (1K Zeichen)', coins: FEATURE_PRICES.TTS_PER_1K_CHARS, api: API_COSTS.TTS_DEEPGRAM_PER_1K_CHARS },
    { name: 'AI Chat (10 Msg)', coins: FEATURE_PRICES.AI_CHAT_10MSG, api: 0.01 },
    { name: 'Live Voice (30min)', coins: FEATURE_PRICES.LIVE_VOICE_30MIN, api: 0.05 },
  ];

  return (
    <div className={`rounded-xl p-4 ${th.cardBg} border ${th.border}`}>
      <h3 className={`text-sm font-bold ${th.textPrimary} mb-3`}>
        {language === 'de' ? 'Preisaufschluesselung' : 'Price Breakdown'}
      </h3>
      <div className="space-y-2">
        {features.map(f => {
          const userEur = coinToEur(f.coins);
          const margin = userEur > 0 ? Math.round(((userEur - f.api) / userEur) * 100) : 0;
          const apiPct = userEur > 0 ? Math.min((f.api / userEur) * 100, 100) : 0;
          return (
            <div key={f.name}>
              <div className={`flex justify-between text-[10px] ${th.textSecondary} mb-0.5`}>
                <span>{f.name}</span>
                <span>{f.coins} Coins \u00B7 {userEur.toFixed(3)}\u20AC \u00B7 API {f.api.toFixed(3)}\u20AC \u00B7 {margin}%</span>
              </div>
              <div className={`h-1.5 rounded-full ${th.surfaceBg} overflow-hidden`}>
                <div className="h-full rounded-full bg-orange-400" style={{ width: `${apiPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// E) OnboardingModal — Erstes teures Feature
// ============================================
export function CostOnboardingModal({ themeMode, language, featureType, onContinue, onAlternative, onClose }: {
  themeMode: ThemeMode;
  language: Language;
  featureType: 'video' | 'voice';
  onContinue: () => void;
  onAlternative: () => void;
  onClose: () => void;
}) {
  const th = getTheme(themeMode);
  const storageKey = `onboarding_${featureType}_seen`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(storageKey) !== 'true') setVisible(true);
  }, []);

  if (!visible) { onContinue(); return null; }

  const dismiss = () => { localStorage.setItem(storageKey, 'true'); setVisible(false); };
  const isVideo = featureType === 'video';

  const facts = isVideo ? [
    { icon: '\uD83C\uDFA5', text: 'KI generiert ein einzigartiges Video aus deinem Traum' },
    { icon: '\uD83D\uDCB0', text: `Kostet ${FEATURE_PRICES.VIDEO_30S} Coins (~${coinToEur(FEATURE_PRICES.VIDEO_30S).toFixed(2)}\u20AC)` },
    { icon: '\u26A1', text: `API-Kosten fuer uns: ~0,48\u20AC pro Video` },
    { icon: '\u2728', text: 'Alternative: Slideshow fuer nur 15 Coins' },
  ] : [
    { icon: '\uD83C\uDF99\uFE0F', text: 'Live-Gespraech mit der Traum-KI per Sprache' },
    { icon: '\uD83D\uDCB0', text: `Kostet ${FEATURE_PRICES.LIVE_VOICE_30MIN} Coins fuer 30 Minuten` },
    { icon: '\u26A1', text: 'API-Kosten: ~0,05\u20AC pro Session' },
    { icon: '\u2728', text: 'Alternative: Text-Chat fuer 5 Coins' },
  ];

  return (
    <div className={`fixed inset-0 z-[120] ${th.modalOverlay} flex items-center justify-center p-4`} onClick={onClose}>
      <div className={`w-full max-w-sm rounded-2xl ${th.modalBg} border ${th.border} p-6`} onClick={e => e.stopPropagation()}>
        <h3 className={`text-lg font-bold ${th.textPrimary} mb-4`}>
          {isVideo ? '\uD83C\uDFA5 Dein erstes Traumvideo' : '\uD83C\uDF99\uFE0F Dein erstes Live-Gespraech'}
        </h3>
        <div className="space-y-3 mb-6">
          {facts.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl">{f.icon}</span>
              <span className={`text-sm ${th.textSecondary}`}>{f.text}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <button
            onClick={() => { dismiss(); onContinue(); }}
            className={`w-full py-3 rounded-xl text-sm font-bold ${th.btnPrimary}`}
          >
            {isVideo ? `Video erstellen \u00B7 ${FEATURE_PRICES.VIDEO_30S} Coins` : `Live starten \u00B7 ${FEATURE_PRICES.LIVE_VOICE_30MIN} Coins`}
          </button>
          <button
            onClick={() => { dismiss(); onAlternative(); }}
            className={`w-full py-3 rounded-xl text-sm ${th.btnSecondary} border`}
          >
            {isVideo ? 'Nur Slideshow \u00B7 15 Coins' : 'Nur Text-Chat \u00B7 5 Coins'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// F) CoinKaufErklaerung — Coin Shop
// ============================================
export function CoinKaufErklaerung({ themeMode, language }: { themeMode: ThemeMode; language: Language }) {
  const th = getTheme(themeMode);

  const steps = [
    { label: 'Text-Deutung', cost: '0,001\u20AC', color: 'bg-emerald-500', width: '2%' },
    { label: 'Bild', cost: '0,004\u20AC', color: 'bg-blue-500', width: '5%' },
    { label: 'TTS Audio', cost: '0,018\u20AC', color: 'bg-violet-500', width: '12%' },
    { label: 'Live Voice', cost: '0,05\u20AC', color: 'bg-fuchsia-500', width: '25%' },
    { label: 'Video (30s)', cost: '0,48\u20AC', color: 'bg-orange-500', width: '100%' },
  ];

  return (
    <div className={`rounded-xl p-4 ${th.cardBg} border ${th.border}`}>
      <h3 className={`text-sm font-bold ${th.textPrimary} mb-1`}>
        {language === 'de' ? 'Warum kosten Videos mehr als Text?' : 'Why do videos cost more than text?'}
      </h3>
      <p className={`text-[10px] ${th.textMuted} mb-3`}>
        {language === 'de'
          ? 'Diese Kosten entstehen bei Google, Anthropic, Replicate \u2014 nicht bei uns.'
          : 'These costs arise at Google, Anthropic, Replicate \u2014 not at our end.'}
      </p>
      <div className="space-y-2">
        {steps.map(s => (
          <div key={s.label}>
            <div className={`flex justify-between text-[10px] ${th.textSecondary} mb-0.5`}>
              <span>{s.label}</span>
              <span>{s.cost}</span>
            </div>
            <div className={`h-2 rounded-full ${th.surfaceBg} overflow-hidden`}>
              <div className={`h-full rounded-full ${s.color}`} style={{ width: s.width }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
