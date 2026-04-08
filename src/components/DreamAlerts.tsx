import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const DreamAlerts: React.FC = () => {
  const { t } = useLang();

  return (
    <section id="alerts" className="py-20 relative scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-dream-primary font-medium text-sm tracking-[0.2em] uppercase">{t('da.badge')}</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
              {t('da.title1')}<br />{t('da.title2')} <span className="text-gradient-dream">{t('da.title3')}</span> {t('da.title4')}
            </h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto">
              {t('da.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Alert Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-6 border border-white/10 mb-6 max-w-lg mx-auto"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-4">
            <Bell className="w-4 h-4 text-dream-secondary" />
            {t('da.myAlerts')}
          </div>

          {/* Alert 1 */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium">{t('da.alert1')}</div>
              <div className="flex gap-1.5 mt-1">
                {['fliegen', 'wasser', 'ozean'].map(kw => (
                  <span key={kw} className="px-2 py-0.5 rounded-full text-[10px] bg-dream-primary/10 text-dream-primary border border-dream-primary/20">{kw}</span>
                ))}
              </div>
            </div>
            <span className="text-xs font-bold text-orange-400 shrink-0">2 {t('da.matches')}</span>
          </div>

          {/* Alert 2 */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(94,234,212,0.4)] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium">{t('da.alert2')}</div>
              <div className="flex gap-1.5 mt-1">
                {['schlange', 'snake', '\u062D\u064A\u0629'].map(kw => (
                  <span key={kw} className="px-2 py-0.5 rounded-full text-[10px] bg-dream-primary/10 text-dream-primary border border-dream-primary/20">{kw}</span>
                ))}
              </div>
            </div>
            <span className="text-xs text-gray-500 shrink-0">{t('da.active')}</span>
          </div>

          <p className="text-center text-xs text-gray-500 mt-3">
            {t('da.proVip')}
          </p>
        </motion.div>

        {/* Viral: Jemand hat von dir getraeumt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="max-w-lg mx-auto rounded-2xl p-6 text-center border border-dream-primary/20"
          style={{ background: 'linear-gradient(135deg, rgba(192,132,252,0.08), rgba(249,168,212,0.05))' }}
        >
          <Moon className="w-8 h-8 text-dream-secondary mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-white mb-2">{t('da.viralTitle')}</h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto mb-4">
            {t('da.viralDesc')}
          </p>
          <button className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-dream-primary to-dream-accent shadow-lg shadow-dream-primary/20 hover:shadow-xl hover:scale-105 transition-all">
            {t('da.shareButton')}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default DreamAlerts;
