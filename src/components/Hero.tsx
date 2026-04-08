import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Star, Smartphone, Globe } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const Hero: React.FC = () => {
  const { t } = useLang();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hintergrund-Effekte */}
      <div className="absolute inset-0 starfield"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-dream-bg via-transparent to-dream-bg"></div>
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-dream-primary/15 rounded-full blur-[200px] animate-glow-pulse"></div>
      <div className="absolute bottom-1/4 right-1/5 w-[500px] h-[500px] bg-dream-accent/10 rounded-full blur-[180px]" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-dream-secondary/10 rounded-full blur-[150px] animate-glow-pulse" style={{ animationDelay: '3s' }}></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dream-primary/30 bg-dream-primary/5 mb-8">
            <Star className="w-4 h-4 text-dream-secondary" />
            <span className="text-sm font-medium text-dream-primary">{t('hero.badge')}</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1]">
            {t('hero.title1')}{' '}
            <span className="text-gradient-dream">{t('hero.title2')}</span>
            <br />
            <span className="text-gradient-gold">{t('hero.title3')}</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-body font-light leading-relaxed mb-10">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <a
              href="#features"
              className="px-8 py-4 bg-gradient-to-r from-dream-primary to-dream-accent text-white font-bold rounded-full text-lg hover:shadow-2xl hover:shadow-dream-primary/30 transition-all hover:-translate-y-0.5"
            >
              {t('hero.cta1')}
            </a>
            <a
              href="#testimonials"
              className="px-8 py-4 border border-white/10 text-white font-bold rounded-full text-lg hover:bg-white/5 transition-all backdrop-blur-sm"
            >
              {t('hero.cta2')}
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-dream-primary" />
              <span>{t('hero.trust.mobile')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-dream-accent" />
              <span>{t('hero.trust.lang')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-dream-secondary" />
              <span>{t('hero.trust.stars')}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-6 h-6 text-dream-primary/50" />
      </motion.div>
    </section>
  );
};

export default Hero;
