import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Smartphone } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const Cta: React.FC = () => {
  const { t } = useLang();

  return (
    <section id="cta" className="py-28 relative overflow-hidden scroll-mt-20">
      {/* Hintergrund-Effekte */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-dream-primary/15 rounded-full blur-[200px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-dream-accent/10 rounded-full blur-[180px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-dream-secondary/8 rounded-full blur-[200px]"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dream-primary/10 border border-dream-primary/30 text-dream-primary text-sm font-bold mb-8">
            <Sparkles className="w-4 h-4" />
            {t('cta.badge')}
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('cta.title1')}<br />
            {t('cta.title2').split('entschlüsseln')[0]}<span className="text-gradient-dream">{t('cta.title2').includes('?') ? t('cta.title2') : t('cta.title2')}</span>
          </h2>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <a
              href="https://www.dream-code.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-dream-primary via-dream-accent to-dream-primary text-white font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-dream-primary/40 transition-all hover:-translate-y-1 bg-[length:200%_100%] hover:bg-right"
            >
              <Smartphone className="w-5 h-5" />
              {t('cta.button')}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <p className="text-gray-500 text-sm">
            {t('cta.available')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Cta;
