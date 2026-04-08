import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const DreamGuard: React.FC = () => {
  const { t } = useLang();

  const FEATURES = [
    {
      icon: '\uD83D\uDDE3\uFE0F',
      title: t('dg.feat1.title'),
      text: t('dg.feat1.desc'),
    },
    {
      icon: '\uD83D\uDE30',
      title: t('dg.feat2.title'),
      text: t('dg.feat2.desc'),
    },
    {
      icon: '\uD83D\uDCA4',
      title: t('dg.feat3.title'),
      text: t('dg.feat3.desc'),
    },
    {
      icon: '\uD83C\uDFB5',
      title: t('dg.feat4.title'),
      text: t('dg.feat4.desc'),
    },
  ];

  return (
    <section id="dreamguard" className="py-20 relative scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-dream-primary font-medium text-sm tracking-[0.2em] uppercase">{t('dg.badge')}</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
              {t('dg.title1')}<br />
              <span className="text-gradient-dream">{t('dg.title2')}</span>
            </h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto">
              {t('dg.subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {FEATURES.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="glass rounded-2xl p-6 border border-white/5 hover:border-dream-primary/20 transition-colors"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Privacy Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 p-4 rounded-xl border border-teal-500/20 mb-4"
          style={{ background: 'rgba(94,234,212,0.06)' }}
        >
          <Shield className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm text-teal-400">
            {t('dg.privacy')}
          </span>
        </motion.div>

        {/* APK Exclusive Badge */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.4)' }}>
            {t('dg.apkExclusive')}
          </span>
          <span className="text-xs text-gray-500">{t('dg.apkNote')}</span>
        </div>
      </div>
    </section>
  );
};

export default DreamGuard;
