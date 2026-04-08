import React from 'react';
import { motion } from 'framer-motion';
import { Moon, CircleDot, Eye, TrendingUp, Waves, Heart, Brain, Sparkles } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const MoonSync: React.FC = () => {
  const { t } = useLang();

  const MOON_PHASES = [
    {
      icon: CircleDot,
      phase: t('moon.phase1.name'),
      meaning: t('moon.phase1.meaning'),
      dreamEffect: t('moon.phase1.effect'),
      color: 'text-gray-400',
      bg: 'bg-gray-500/10',
    },
    {
      icon: Moon,
      phase: t('moon.phase2.name'),
      meaning: t('moon.phase2.meaning'),
      dreamEffect: t('moon.phase2.effect'),
      color: 'text-dream-cyan',
      bg: 'bg-dream-cyan/10',
    },
    {
      icon: Eye,
      phase: t('moon.phase3.name'),
      meaning: t('moon.phase3.meaning'),
      dreamEffect: t('moon.phase3.effect'),
      color: 'text-dream-secondary',
      bg: 'bg-dream-secondary/10',
    },
    {
      icon: Waves,
      phase: t('moon.phase4.name'),
      meaning: t('moon.phase4.meaning'),
      dreamEffect: t('moon.phase4.effect'),
      color: 'text-dream-primary',
      bg: 'bg-dream-primary/10',
    },
  ];

  const SYNC_FEATURES = [
    { icon: TrendingUp, title: t('moon.feat1.title'), desc: t('moon.feat1.desc') },
    { icon: Heart, title: t('moon.feat2.title'), desc: t('moon.feat2.desc') },
    { icon: Brain, title: t('moon.feat3.title'), desc: t('moon.feat3.desc') },
    { icon: Sparkles, title: t('moon.feat4.title'), desc: t('moon.feat4.desc') },
  ];

  return (
    <section id="moon-sync" className="py-28 relative overflow-hidden scroll-mt-20">
      {/* Hintergrund */}
      <div className="absolute inset-0 bg-gradient-to-b from-dream-bg via-[#0d0d2b] to-dream-bg"></div>
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-dream-accent/8 rounded-full blur-[200px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-dream-accent font-medium text-sm tracking-[0.2em] uppercase">{t('moon.badge')}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              <span className="text-gradient-dream">{t('moon.title')}</span>{t('moon.titleSuffix')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('moon.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Mond-Phasen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {MOON_PHASES.map((phase, idx) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/5 hover:border-dream-accent/20 transition-all duration-500 group relative overflow-hidden"
            >
              {/* Glow Effekt */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 ${phase.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${phase.bg} flex items-center justify-center mb-4 ${phase.color}`}>
                  <phase.icon className="w-6 h-6" />
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-1">{phase.phase}</h3>
                <p className={`text-xs font-bold ${phase.color} uppercase tracking-wider mb-3`}>{phase.meaning}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{phase.dreamEffect}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sync Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-br from-dream-accent/10 via-dream-card to-dream-primary/5 border border-dream-accent/20 p-8 md:p-12"
        >
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3 text-center">
            {t('moon.whatTitle')}
          </h3>
          <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
            {t('moon.whatSubtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SYNC_FEATURES.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -15 : 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-black/30 border border-white/5 hover:border-dream-accent/30 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-dream-accent/15 flex items-center justify-center text-dream-accent shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{f.title}</h4>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MoonSync;
