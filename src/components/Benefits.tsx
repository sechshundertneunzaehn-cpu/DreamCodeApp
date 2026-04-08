import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Lock, Palette, CloudOff, Award, HeartHandshake } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const Benefits: React.FC = () => {
  const { t } = useLang();

  const BENEFITS = [
    { icon: Shield, title: t('benefits.b1.title'), desc: t('benefits.b1.desc') },
    { icon: Zap, title: t('benefits.b2.title'), desc: t('benefits.b2.desc') },
    { icon: Globe, title: t('benefits.b3.title'), desc: t('benefits.b3.desc') },
    { icon: Palette, title: t('benefits.b4.title'), desc: t('benefits.b4.desc') },
    { icon: CloudOff, title: t('benefits.b5.title'), desc: t('benefits.b5.desc') },
    { icon: Lock, title: t('benefits.b6.title'), desc: t('benefits.b6.desc') },
    { icon: Award, title: t('benefits.b7.title'), desc: t('benefits.b7.desc') },
    { icon: HeartHandshake, title: t('benefits.b8.title'), desc: t('benefits.b8.desc') },
  ];

  return (
    <section className="py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-dream-bg via-dream-card/30 to-dream-bg"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-dream-cyan font-medium text-sm tracking-[0.2em] uppercase">{t('benefits.badge')}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              {t('benefits.title')} <span className="text-gradient-dream">{t('benefits.titleHighlight')}</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('benefits.subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-dream-primary/20 hover:bg-white/[0.04] transition-all duration-300 group"
            >
              <b.icon className="w-8 h-8 text-dream-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-lg mb-2">{b.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Trusted Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col items-center gap-3 px-8 py-6 rounded-2xl glass border border-dream-primary/10">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-dream-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white font-bold text-lg">{t('benefits.rating')}</p>
            <p className="text-gray-400 text-sm">{t('benefits.recommended')}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;
