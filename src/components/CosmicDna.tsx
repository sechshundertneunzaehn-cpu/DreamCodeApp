import React from 'react';
import { motion } from 'framer-motion';
import { Dna, Star, Hash, Orbit, Compass, Zap } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const CosmicDna: React.FC = () => {
  const { t } = useLang();

  const DNA_ELEMENTS = [
    {
      icon: Star,
      title: t('cosmic.el1.title'),
      description: t('cosmic.el1.desc'),
      highlight: t('cosmic.el1.highlight'),
    },
    {
      icon: Hash,
      title: t('cosmic.el2.title'),
      description: t('cosmic.el2.desc'),
      highlight: t('cosmic.el2.highlight'),
    },
    {
      icon: Orbit,
      title: t('cosmic.el3.title'),
      description: t('cosmic.el3.desc'),
      highlight: t('cosmic.el3.highlight'),
    },
  ];

  const BENEFITS = [
    { icon: Compass, text: t('cosmic.benefit1') },
    { icon: Zap, text: t('cosmic.benefit2') },
    { icon: Dna, text: t('cosmic.benefit3') },
  ];

  return (
    <section id="cosmic-dna" className="py-28 relative overflow-hidden scroll-mt-20">
      {/* Hintergrund */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-dream-secondary/8 rounded-full blur-[200px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-dream-primary/5 rounded-full blur-[180px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-dream-secondary font-medium text-sm tracking-[0.2em] uppercase">{t('cosmic.badge')}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              {t('cosmic.title')} <span className="text-gradient-gold">{t('cosmic.titleHighlight')}</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('cosmic.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* DNA Elemente */}
        <div className="space-y-8 mb-20">
          {DNA_ELEMENTS.map((el, idx) => (
            <motion.div
              key={el.title}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="glass rounded-2xl p-8 md:p-10 border border-dream-secondary/10 hover:border-dream-secondary/30 transition-all duration-500 group">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dream-secondary to-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-dream-secondary/20 group-hover:shadow-dream-secondary/40 transition-shadow">
                    <el.icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold text-white mb-3">{el.title}</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-4">{el.description}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dream-secondary/10 border border-dream-secondary/20 text-dream-secondary text-sm font-bold">
                      <Zap className="w-4 h-4" />
                      {el.highlight}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Warum Kosmische DNA? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-r from-dream-secondary/10 via-dream-card to-dream-secondary/5 border border-dream-secondary/20 p-8 md:p-12"
        >
          <h3 className="font-display text-2xl font-bold text-white mb-8 text-center">
            {t('cosmic.whyTitle')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map((b, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 rounded-xl bg-black/20 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-dream-secondary/20 flex items-center justify-center text-dream-secondary shrink-0">
                  <b.icon className="w-5 h-5" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CosmicDna;
