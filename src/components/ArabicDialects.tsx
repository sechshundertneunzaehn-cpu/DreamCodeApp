import React from 'react';
import { motion } from 'framer-motion';
import { Languages, Mic, Brain, BookOpen, Hash, Sparkles, Globe, Check } from 'lucide-react';
import { useLang } from '../i18n/useLang';

// ========== HAUPTSPRACHEN ==========
const MAIN_LANGUAGES = [
  { flag: '🇩🇪', name: 'Deutsch' },
  { flag: '🇺🇸', name: 'English' },
  { flag: '🇹🇷', name: 'Türkçe' },
  { flag: '🇪🇸', name: 'Español' },
  { flag: '🇫🇷', name: 'Français' },
  { flag: '🇸🇦', name: 'العربية' },
  { flag: '🇧🇷', name: 'Português' },
  { flag: '🇷🇺', name: 'Русский' },
];

// ========== ARABISCHE DIALEKTE ==========
const ARABIC_DIALECTS_DATA = [
  { flag: '🇸🇦', nameKey: 'dialect.saudi', region: 'Najdi / Hejazi' },
  { flag: '🇪🇬', nameKey: 'dialect.egyptian', region: 'Masri' },
  { flag: '🇶🇦', nameKey: 'dialect.qatari', region: 'Khaliji' },
  { flag: '🇲🇦', nameKey: 'dialect.moroccan', region: 'Maghrebi' },
  { flag: '🇱🇧', nameKey: 'dialect.levantine', region: 'Shami' },
  { flag: '🇸🇩', nameKey: 'dialect.sudanese', region: 'Sudani' },
];

// ========== WEITERE SPRACHEN VIA KI ==========
const AI_LANGUAGES = [
  { flag: '🇮🇳', nameKey: 'lang.ai1' },
  { flag: '🇵🇰', nameKey: 'lang.ai2' },
  { flag: '🇮🇩', nameKey: 'lang.ai3' },
  { flag: '🇮🇷', nameKey: 'lang.ai4' },
  { flag: '🇰🇪', nameKey: 'lang.ai5' },
  { flag: '🇯🇵', nameKey: 'lang.ai6' },
];

// ========== SPRACHMODELL-FEATURES ==========
const MODEL_FEATURES_DATA = [
  {
    icon: BookOpen,
    titleKey: 'lang.mf1.title',
    descKey: 'lang.mf1.desc',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Languages,
    titleKey: 'lang.mf2.title',
    descKey: 'lang.mf2.desc',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Brain,
    titleKey: 'lang.mf3.title',
    descKey: 'lang.mf3.desc',
    color: 'text-dream-primary',
    bg: 'bg-dream-primary/10',
  },
  {
    icon: Mic,
    titleKey: 'lang.mf4.title',
    descKey: 'lang.mf4.desc',
    color: 'text-dream-cyan',
    bg: 'bg-dream-cyan/10',
  },
  {
    icon: Hash,
    titleKey: 'lang.mf5.title',
    descKey: 'lang.mf5.desc',
    color: 'text-dream-rose',
    bg: 'bg-dream-rose/10',
  },
  {
    icon: Sparkles,
    titleKey: 'lang.mf6.title',
    descKey: 'lang.mf6.desc',
    color: 'text-dream-secondary',
    bg: 'bg-dream-secondary/10',
  },
];

// ========== MAIN COMPONENT ==========
const ArabicDialects: React.FC = () => {
  const { t } = useLang();

  return (
    <section id="languages" className="py-28 relative scroll-mt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-dream-bg via-dream-card/50 to-dream-bg"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========== SECTION HEADER ========== */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.15em] uppercase bg-dream-secondary/10 text-dream-secondary border border-dream-secondary/20 mb-6">
              {t('lang.badge')}
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              {t('lang.title')} <span className="text-gradient-dream">{t('lang.titleHighlight')}</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('lang.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* ========== HAUPTSPRACHEN ========== */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2"
          >
            <Globe className="w-5 h-5 text-dream-primary" />
            {t('lang.mainTitle')}
          </motion.h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {MAIN_LANGUAGES.map((lang, idx) => (
              <motion.div
                key={lang.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="glass rounded-xl p-4 border border-white/5 hover:border-dream-primary/20 transition-all text-center group"
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{lang.flag}</span>
                <span className="text-white text-sm font-medium">{lang.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ========== ARABISCHE DIALEKTE ========== */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2"
          >
            <Languages className="w-5 h-5 text-dream-accent" />
            {t('lang.dialectTitle')}
          </motion.h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ARABIC_DIALECTS_DATA.map((dialect, idx) => (
              <motion.div
                key={dialect.nameKey}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="glass rounded-xl p-4 border border-white/5 hover:border-dream-accent/20 transition-all text-center group"
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{dialect.flag}</span>
                <span className="text-white text-sm font-medium block">{t(dialect.nameKey)}</span>
                <span className="text-dream-accent text-xs">{dialect.region}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ========== WEITERE SPRACHEN VIA KI ========== */}
        <div className="mb-24">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-dream-secondary" />
            {t('lang.aiTitle')}
          </motion.h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {AI_LANGUAGES.map((lang, idx) => (
              <motion.div
                key={lang.nameKey}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="glass rounded-xl p-4 border border-white/5 hover:border-dream-secondary/20 transition-all text-center group"
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{lang.flag}</span>
                <span className="text-white text-sm font-medium">{t(lang.nameKey)}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ========== SPEECH MODEL CAPABILITIES ========== */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-dream-accent/10 via-dream-card to-dream-primary/10 border border-dream-accent/20 p-8 md:p-14 mb-24">
          <div className="absolute top-0 left-0 w-96 h-96 bg-dream-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-dream-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-dream-cyan text-sm font-bold tracking-[0.15em] uppercase">
                  {t('lang.modelBadge')}
                </span>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
                  {t('lang.modelTitle')}
                </h3>
                <p className="text-gray-400 mt-3 max-w-xl mx-auto">
                  {t('lang.modelSubtitle')}
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MODEL_FEATURES_DATA.map((feature, idx) => (
                <motion.div
                  key={feature.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex items-start gap-4 bg-black/30 p-5 rounded-2xl border border-white/5 hover:border-dream-accent/30 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center ${feature.color} shrink-0 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{t(feature.titleKey)}</h4>
                    <p className="text-gray-400 text-sm">{t(feature.descKey)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ========== EMOTIONAL CLOSER ========== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
            {t('lang.closerTitle')} <span className="text-gradient-dream">{t('lang.closerTitleHighlight')}</span>
          </h3>
          <p className="text-gray-300 text-lg leading-relaxed">
            {t('lang.closerDesc')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ArabicDialects;
