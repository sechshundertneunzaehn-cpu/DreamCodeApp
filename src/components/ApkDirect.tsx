import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Download } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const ApkDirect: React.FC = () => {
  const { t } = useLang();

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
    <section id="apk-direct" className="py-20 relative scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-dream-primary font-medium text-sm tracking-[0.2em] uppercase">{t('dl.directBadge')}</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
              {t('dl.directTitle')}<br /><span className="text-gradient-dream">{t('dl.directTitleHighlight')}</span>
            </h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto">
              {t('dl.directSubtitle')}
            </p>
          </motion.div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {/* Store Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 border border-white/5"
          >
            <div className="text-sm font-bold text-gray-400 pb-3 mb-4 border-b border-white/5">
              {t('dl.storeColumn')}
            </div>
            <div className="space-y-3">
              {STORE_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                  <X className="w-4 h-4 text-red-400/60 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Direct Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 border border-dream-primary/30"
            style={{ background: 'rgba(192,132,252,0.06)' }}
          >
            <div className="flex items-center gap-2 text-sm font-bold text-white pb-3 mb-4 border-b border-dream-primary/20">
              <span className="text-dream-secondary">&#9889;</span> {t('dl.directColumn')}
            </div>
            <div className="space-y-3">
              {DIRECT_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-200">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Download Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <a
            href="https://dream-code.app/download"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-dream-bg shadow-lg shadow-dream-primary/30 hover:shadow-xl hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #c084fc, #5eead4)' }}
          >
            <Download className="w-5 h-5" />
            {t('dl.apkButton')}
          </a>
          <p className="text-xs text-gray-500 mt-3">{t('dl.apkNote')}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default ApkDirect;
