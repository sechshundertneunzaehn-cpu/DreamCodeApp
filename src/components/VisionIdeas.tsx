import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../i18n/useLang';

const IDEAS = [
  {
    num: '01',
    tag: 'Mental Health \u00B7 B2B \u00B7 Versicherungen',
    titleKey: 'vision.idea1.title',
    textKey: 'vision.idea1.desc',
    pot: '\u2605 $5B+ Markt \u00B7 noch kein Competitor',
  },
  {
    num: '02',
    tag: 'Oura Ring \u00B7 Apple Watch \u00B7 Samsung',
    titleKey: 'vision.idea2.title',
    textKey: 'vision.idea2.desc',
    pot: '\u2605 10\u00D7 Retention \u00B7 Oura Marketplace',
  },
  {
    num: '03',
    tag: 'AI \u00B7 Proprietaer \u00B7 Wettbewerbsmoat',
    titleKey: 'vision.idea3.title',
    textKey: 'vision.idea3.desc',
    pot: '\u2605 Lizenzierbar \u00B7 -90% Kosten',
  },
  {
    num: '04',
    tag: 'Viral \u00B7 K-Faktor 0,4 \u00B7 \u20AC0 Kosten',
    titleKey: 'vision.idea4.title',
    textKey: 'vision.idea4.desc',
    pot: '\u2605 STAERKSTE IDEE \u00B7 sofort implementierbar',
    highlight: true,
  },
  {
    num: '05',
    tag: 'AI Persona \u00B7 LTV \u00D7 3 \u00B7 Weltpresse',
    titleKey: 'vision.idea5.title',
    textKey: 'vision.idea5.desc',
    pot: '\u2605 3\u00D7 LTV \u00B7 PR-Magnet \u00B7 einzigartig',
  },
];

const VisionIdeas: React.FC = () => {
  const { t } = useLang();

  return (
    <section id="vision" className="py-20 relative scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-dream-primary font-medium text-sm tracking-[0.2em] uppercase">{t('vision.badge')}</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
              {t('vision.title')} <span className="text-gradient-dream">{t('vision.titleHighlight')}</span> {t('vision.titleSuffix')}
            </h2>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">
              {t('vision.subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {IDEAS.map((idea, idx) => (
            <motion.div
              key={idea.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className={`glass rounded-2xl p-6 border transition-colors ${
                idea.highlight
                  ? 'border-dream-secondary/30 hover:border-dream-secondary/50 md:col-span-2'
                  : 'border-white/5 hover:border-dream-primary/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl font-display font-bold text-white/20 shrink-0 w-8">{idea.num}</div>
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{idea.tag}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{t(idea.titleKey)}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">{t(idea.textKey)}</p>
                  <div className={`text-xs font-bold ${idea.highlight ? 'text-dream-secondary' : 'text-dream-primary'}`}>
                    {idea.pot}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VisionIdeas;
