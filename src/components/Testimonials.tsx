import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const Testimonials: React.FC = () => {
  const { t } = useLang();

  const TRUST_BADGES = [
    t('test.trust1'),
    t('test.trust2'),
    t('test.trust3'),
    t('test.trust4'),
  ];

  const STATS = [
    { value: '12.4K+', label: t('test.stat1.label') },
    { value: '98%', label: t('test.stat2.label') },
    { value: '4.9/5', label: t('test.stat3.label') },
    { value: '850K+', label: t('test.stat4.label') },
  ];

  return (
    <section id="testimonials" className="py-28 relative scroll-mt-20">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-dream-primary/5 rounded-full blur-[200px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-dream-secondary font-medium text-sm tracking-[0.2em] uppercase">{t('test.badge')}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              {t('test.title')} <span className="text-gradient-gold">{t('test.titleHighlight')}</span> {t('test.titleSuffix')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('test.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {TRUST_BADGES.map((badge) => (
            <div key={badge} className="flex items-center gap-2 px-4 py-2 rounded-full bg-dream-primary/5 border border-dream-primary/20 text-sm">
              <CheckCircle2 className="w-4 h-4 text-dream-primary" />
              <span className="text-gray-300 font-medium">{badge}</span>
            </div>
          ))}
        </div>

        {/* Social Proof Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl glass border border-white/5">
              <p className="font-display text-3xl md:text-4xl font-bold text-gradient-dream mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
