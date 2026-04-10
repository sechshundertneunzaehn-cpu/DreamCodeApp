import React from 'react';
import { motion } from 'framer-motion';
import {
  Apple,
  Check,
  Sparkles,
  Star,
  Crown,
  Gem,
  Brain,
  Play,
  Shield,
  Download,
} from 'lucide-react';
import { useLang } from '../i18n/useLang';

const Downloads: React.FC = () => {
  const { t } = useLang();

  const TIERS = [
    {
      name: 'Free',
      icon: Star,
      color: 'text-gray-400',
      border: 'border-white/5',
      features: [t('dl.free1'), t('dl.free2'), t('dl.free3'), t('dl.free4'), t('dl.free6')],
    },
    {
      name: 'Pro',
      icon: Gem,
      color: 'text-dream-primary',
      border: 'border-dream-primary/30',
      badge: t('dl.tierPopular'),
      features: [t('dl.pro1'), t('dl.pro2'), t('dl.pro3'), t('dl.pro4'), t('dl.pro5')],
    },
    {
      name: 'Premium',
      icon: Crown,
      color: 'text-dream-secondary',
      border: 'border-dream-secondary/40',
      features: [t('dl.premium1'), t('dl.premium2'), t('dl.premium3'), t('dl.premium4'), t('dl.premium5')],
    },
    {
      name: 'Smart',
      icon: Brain,
      color: 'text-dream-cyan',
      border: 'border-dream-cyan/30',
      features: [t('dl.smart1'), t('dl.smart2'), t('dl.smart3'), t('dl.smart4'), t('dl.smart5')],
    },
  ];

  const FREE_FEATURES = [
    t('dl.free1'),
    t('dl.free2'),
    t('dl.free3'),
    t('dl.free4'),
    t('dl.free5'),
    t('dl.free6'),
  ];

  const STORE_ITEMS = [
    t('dl.store1'),
    t('dl.store2'),
    t('dl.store3'),
    t('dl.store4'),
    t('dl.store5'),
  ];

  const DIRECT_ITEMS = [
    t('dl.direct1'),
    t('dl.direct2'),
    t('dl.direct3'),
    t('dl.direct4'),
    t('dl.direct5'),
  ];

  return (
    <section id="downloads" className="py-28 relative overflow-hidden scroll-mt-20">
      {/* Hintergrund */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-dream-primary/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-dream-secondary/8 rounded-full blur-[180px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-dream-accent/6 rounded-full blur-[220px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Header --- */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-dream-cyan font-medium text-sm tracking-[0.2em] uppercase">
            {t('dl.badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            {t('dl.title')}{' '}
            <span className="text-gradient-dream">{t('dl.titleHighlight')}</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t('dl.subtitle')}
          </p>
        </motion.div>

        {/* --- Store Download-Karten (2 Stueck) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-10">
          {/* Apple App Store */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-10 flex flex-col items-center text-center hover:border-white/10 transition-all duration-300"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <Apple className="w-11 h-11 text-white" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">{t('dl.appStore')}</h3>
            <p className="text-gray-400 text-sm mb-8">{t('dl.appStoreSub')}</p>
            <a href="#" className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-white/[0.06] border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 mb-4">
              <Apple className="w-5 h-5" />
              {t('dl.appStoreBtn')}
            </a>
            <p className="text-gray-500 text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {t('dl.allPremium')}
            </p>
          </motion.div>

          {/* Google Play Store */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-10 flex flex-col items-center text-center hover:border-white/10 transition-all duration-300"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <Play className="w-11 h-11 text-white" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">{t('dl.playStore')}</h3>
            <p className="text-gray-400 text-sm mb-8">{t('dl.playStoreSub')}</p>
            <a href="#" className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-white/[0.06] border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 mb-4">
              <Play className="w-5 h-5" />
              {t('dl.playStoreBtn')}
            </a>
            <p className="text-gray-500 text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {t('dl.allPremium')}
            </p>
          </motion.div>
        </div>

        {/* --- APK Direkt --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-16 rounded-2xl p-8 md:p-10 border border-dream-primary/30 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(192,132,252,0.08), rgba(94,234,212,0.05))' }}
        >
          <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-bold tracking-widest" style={{ background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>
            {t('dl.exclusive')}
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <Download className="w-6 h-6 text-dream-primary" />
              <span className="text-dream-primary font-medium text-sm tracking-[0.15em] uppercase">{t('dl.directBadge')}</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
              {t('dl.directTitle')} <span className="text-gradient-dream">{t('dl.directTitleHighlight')}</span>
            </h3>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              {t('dl.directSubtitle')}
            </p>
          </div>

          {/* Vergleichstabelle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Store */}
            <div className="rounded-xl p-5 bg-white/[0.03] border border-white/5">
              <div className="text-sm font-bold text-gray-400 pb-3 mb-3 border-b border-white/5">{t('dl.storeColumn')}</div>
              <div className="space-y-2.5">
                {STORE_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-500">
                    <span className="w-4 h-4 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                      <span className="text-red-400 text-[10px]">\u2715</span>
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Direkt */}
            <div className="rounded-xl p-5 border border-dream-primary/20" style={{ background: 'rgba(192,132,252,0.05)' }}>
              <div className="flex items-center gap-2 text-sm font-bold text-white pb-3 mb-3 border-b border-dream-primary/15">
                <span className="text-dream-secondary">\u26A1</span> {t('dl.directColumn')}
              </div>
              <div className="space-y-2.5">
                {DIRECT_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-200">
                    <span className="w-4 h-4 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-teal-400" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center">
            <a
              href="https://dream-code.app/download"
              className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full text-base font-bold text-dream-bg shadow-lg shadow-dream-primary/30 hover:shadow-xl hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #c084fc, #5eead4)' }}
            >
              <Download className="w-5 h-5" />
              {t('dl.apkButton')}
            </a>
            <p className="text-xs text-gray-500 mt-3">{t('dl.apkNote')}</p>
          </div>
        </motion.div>

        {/* --- Free Features Banner --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 mb-20 border-dream-secondary/10"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dream-secondary/10 border border-dream-secondary/20 text-dream-secondary text-sm font-bold">
                <Sparkles className="w-4 h-4" />
                {t('dl.freeIncluded')}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 flex-1">
              {FREE_FEATURES.map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/5 text-sm text-gray-300"
                >
                  <Check className="w-3.5 h-3.5 text-dream-secondary" />
                  {feat}
                </span>
              ))}
            </div>

            <p className="text-gray-500 text-xs md:text-right flex-shrink-0">
              {t('dl.premiumUpgrade')}
            </p>
          </div>
        </motion.div>

        {/* --- Abo-Übersicht --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-10">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
              {t('dl.tiersTitle')}
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              {t('dl.tiersSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIERS.map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className={`relative p-6 rounded-2xl bg-white/[0.02] border ${tier.border} hover:bg-white/[0.04] transition-all duration-300 group`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-dream-secondary to-amber-400 text-dream-bg text-xs font-extrabold whitespace-nowrap">
                    {tier.badge}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <tier.icon className={`w-6 h-6 ${tier.color}`} />
                  <h4 className="font-bold text-white text-lg">{tier.name}</h4>
                </div>

                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${tier.color}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Downloads;
