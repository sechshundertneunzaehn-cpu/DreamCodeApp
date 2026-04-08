import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const PILLS = [
  { emoji: '\uD83D\uDCDD', label: 'Text', cost: '~0,001\u20AC', userPays: '2 Coins (0,04\u20AC)', margin: '97%' },
  { emoji: '\uD83C\uDFA8', label: 'Bild HD', cost: '~0,004\u20AC', userPays: '12 Coins (0,24\u20AC)', margin: '98%' },
  { emoji: '\uD83C\uDFAC', label: 'Video 30s', cost: '~0,48\u20AC', userPays: '80 Coins (1,59\u20AC)', margin: '70%' },
  { emoji: '\uD83C\uDF99\uFE0F', label: 'Live Voice', cost: '~0,05\u20AC', userPays: '100 Coins (1,99\u20AC)', margin: '97%' },
];

const BREAKDOWN = [
  { feature: 'Text-Deutung (Groq)', coins: 2, apiCost: 0.001, provider: 'Groq/Llama' },
  { feature: 'Text-Deutung (Gemini)', coins: 3, apiCost: 0.005, provider: 'Google Gemini' },
  { feature: 'Text-Deutung (Claude 6P)', coins: 12, apiCost: 0.03, provider: 'Anthropic Claude' },
  { feature: 'Bild Standard', coins: 5, apiCost: 0.002, provider: 'Runware' },
  { feature: 'Bild HD', coins: 12, apiCost: 0.004, provider: 'Runware' },
  { feature: 'Video 30s', coins: 80, apiCost: 0.48, provider: 'Replicate' },
  { feature: 'Slideshow 30s', coins: 15, apiCost: 0.02, provider: 'Intern' },
  { feature: 'TTS Audio', coins: 6, apiCost: 0.018, provider: 'ElevenLabs' },
  { feature: 'Live Voice 30min', coins: 100, apiCost: 0.05, provider: 'Gemini Live' },
  { feature: 'AI Chat (10 Msg)', coins: 5, apiCost: 0.01, provider: 'Gemini/Groq' },
];

const COIN_VALUE = 0.0199;

const CostTransparency: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLang();

  return (
    <section className="py-10 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl border border-dream-secondary/20 overflow-hidden"
        >
          {/* Banner */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-dream-secondary/10 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-dream-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">{t('cost.title')}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {t('cost.subtitle')}
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Expandable */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-6">
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {t('cost.explanation')}
                  </p>

                  {/* Cost Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    {PILLS.map(p => (
                      <div key={p.label} className="px-3 py-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{p.emoji}</span>
                          <span className="text-xs text-white font-medium">{p.label}</span>
                        </div>
                        <div className="text-[10px] text-dream-secondary">{p.cost} {t('cost.apiLabel')}</div>
                        <div className="text-[10px] text-gray-500">{t('cost.youPay')} {p.userPays}</div>
                      </div>
                    ))}
                  </div>

                  {/* Full Price Table */}
                  <div className="rounded-xl border border-white/5 overflow-hidden">
                    <div className="grid grid-cols-5 gap-0 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white/5 px-3 py-2">
                      <span className="col-span-2">{t('cost.feature')}</span>
                      <span>{t('cost.youPay')}</span>
                      <span>{t('cost.apiLabel')}</span>
                      <span>{t('cost.margin')}</span>
                    </div>
                    {BREAKDOWN.map((item, i) => {
                      const userEur = Math.round(item.coins * COIN_VALUE * 1000) / 1000;
                      const margin = userEur > 0 ? Math.round(((userEur - item.apiCost) / userEur) * 100) : 0;
                      const apiPct = userEur > 0 ? Math.min((item.apiCost / userEur) * 100, 100) : 0;
                      return (
                        <div key={i} className={`grid grid-cols-5 gap-0 px-3 py-2 text-xs ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                          <div className="col-span-2">
                            <span className="text-gray-300">{item.feature}</span>
                            <span className="text-[9px] text-gray-600 ml-1">({item.provider})</span>
                          </div>
                          <span className="text-emerald-400">{item.coins} <span className="text-gray-600">({userEur.toFixed(3)}\u20AC)</span></span>
                          <span className="text-orange-400">{item.apiCost.toFixed(3)}\u20AC</span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-orange-400" style={{ width: `${apiPct}%` }} />
                            </div>
                            <span className="text-gray-500 text-[10px] w-7 text-right">{margin}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-gray-600 mt-3 text-center">
                    1 Coin = {COIN_VALUE}\u20AC \u00B7 Preise inkl. API-Kosten an Google, Anthropic, Replicate, ElevenLabs \u00B7 Stripe-Gebuehren nicht enthalten
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default CostTransparency;
