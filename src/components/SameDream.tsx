import React from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, Search, Link2, TrendingUp, MessageCircle, MapPin, Zap, Heart, Eye, Sparkles, ArrowRight, ExternalLink, Radio } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const SameDream: React.FC = () => {
  const { t } = useLang();

  const DREAM_MATCHES = [
    {
      dream: t('same.dream1'),
      count: '47.382',
      countries: 89,
      topLocations: ['New York', 'Istanbul', 'Sao Paulo', 'Berlin'],
      emoji: '\u{1F30C}',
    },
    {
      dream: t('same.dream2'),
      count: '38.914',
      countries: 72,
      topLocations: ['London', 'Mexico City', 'Dubai', 'Tokyo'],
      emoji: '\u{1F31F}',
    },
    {
      dream: t('same.dream3'),
      count: '52.107',
      countries: 94,
      topLocations: ['Los Angeles', 'Paris', 'Mumbai', 'Sydney'],
      emoji: '\u{2728}',
    },
  ];

  const HOW_IT_WORKS = [
    {
      step: 1,
      icon: Search,
      title: t('same.step1.title'),
      desc: t('same.step1.desc'),
    },
    {
      step: 2,
      icon: Globe,
      title: t('same.step2.title'),
      desc: t('same.step2.desc'),
    },
    {
      step: 3,
      icon: Users,
      title: t('same.step3.title'),
      desc: t('same.step3.desc'),
    },
    {
      step: 4,
      icon: TrendingUp,
      title: t('same.step4.title'),
      desc: t('same.step4.desc'),
    },
  ];

  const KEY_FEATURES = [
    {
      icon: MapPin,
      title: t('same.feat1.title'),
      desc: t('same.feat1.desc'),
      color: 'from-dream-rose to-pink-400',
    },
    {
      icon: TrendingUp,
      title: t('same.feat2.title'),
      desc: t('same.feat2.desc'),
      color: 'from-dream-cyan to-cyan-300',
    },
    {
      icon: MessageCircle,
      title: t('same.feat3.title'),
      desc: t('same.feat3.desc'),
      color: 'from-dream-primary to-purple-400',
    },
    {
      icon: Link2,
      title: t('same.feat4.title'),
      desc: t('same.feat4.desc'),
      color: 'from-dream-secondary to-amber-300',
    },
  ];

  return (
    <section id="same-dream" className="py-32 relative overflow-hidden scroll-mt-20">
      {/* Epischer Hintergrund */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dream-bg via-[#0d0820] to-dream-bg"></div>
        <div className="absolute top-0 left-0 w-full h-full starfield opacity-40"></div>
        <div className="absolute top-1/4 left-1/3 w-[800px] h-[800px] bg-dream-rose/8 rounded-full blur-[250px] animate-glow-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-dream-primary/10 rounded-full blur-[200px] animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-dream-secondary/8 rounded-full blur-[180px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===== HERO-ARTIGER HEADER ===== */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Live-Verbindung Badge */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-dream-rose/30 bg-dream-rose/5">
                <Heart className="w-4 h-4 text-dream-rose animate-pulse" />
                <span className="text-sm font-bold text-dream-rose tracking-wide uppercase">{t('same.badge')}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">{t('same.live')}</span>
              </div>
              <a
                href="https://www.dream-code.app/same-dream"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-dream-primary/30 transition-all text-sm font-medium text-gray-300 hover:text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('same.openTab')}
              </a>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
              {t('same.title1')} <span className="text-gradient-dream">{t('same.title2')}</span>
              <br />
              <span className="text-gradient-gold">{t('same.title3')}</span>
            </h2>

            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              {t('same.subtitle')}
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-dream-rose">
                <Eye className="w-4 h-4" />
                <span className="text-gray-400"><strong className="text-white">850.000+</strong> {t('same.stat.dreams')}</span>
              </div>
              <div className="flex items-center gap-2 text-dream-primary">
                <Globe className="w-4 h-4" />
                <span className="text-gray-400"><strong className="text-white">127</strong> {t('same.stat.countries')}</span>
              </div>
              <div className="flex items-center gap-2 text-dream-secondary">
                <Users className="w-4 h-4" />
                <span className="text-gray-400"><strong className="text-white">12.400+</strong> {t('same.stat.dreamers')}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===== LIVE TRAUM-MATCHES ===== */}
        <div className="mb-24">
          <div className="divider-star text-gray-500 text-sm font-bold tracking-widest uppercase mb-10">
            <Sparkles className="w-4 h-4 text-dream-secondary" />
          </div>

          <h3 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-10">
            {t('same.dreamsNow')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DREAM_MATCHES.map((match, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-dream-rose/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl blur-xl"></div>
                <div className="relative glass rounded-2xl p-6 border border-dream-rose/10 hover:border-dream-rose/30 transition-all duration-500">
                  {/* Traum-Text */}
                  <div className="text-3xl mb-4">{match.emoji}</div>
                  <p className="text-white font-medium text-lg italic mb-4 leading-relaxed">
                    {match.dream}
                  </p>

                  {/* Statistik */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">{t('same.sameDream')}</span>
                      <span className="text-dream-rose font-bold text-lg">{match.count}x</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">{t('same.inCountries')}</span>
                      <span className="text-dream-primary font-bold">{match.countries}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {match.topLocations.map((loc) => (
                        <span key={loc} className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/5 text-gray-400 border border-white/5">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ===== SO FUNKTIONIERT ES ===== */}
        <div className="mb-24">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-4">
            {t('same.howTitle')} <span className="text-dream-primary">{t('same.howTitleHighlight')}</span>
          </h3>
          <p className="text-gray-400 text-center max-w-xl mx-auto mb-12">
            {t('same.howSubtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                {/* Verbindungslinie */}
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(100%+0.5rem)] w-[calc(100%-3rem)] h-px bg-gradient-to-r from-dream-primary/30 to-transparent z-0"></div>
                )}

                <div className="relative z-10 text-center p-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-dream-primary/20 to-dream-accent/10 flex items-center justify-center mx-auto mb-5 border border-dream-primary/20 group-hover:shadow-lg transition-shadow">
                    <step.icon className="w-9 h-9 text-dream-primary" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-dream-primary/10 border border-dream-primary/30 flex items-center justify-center mx-auto -mt-3 mb-4 font-display font-bold text-dream-primary text-sm">
                    {step.step}
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">{step.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ===== KEY FEATURES GRID ===== */}
        <div className="mb-16">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-4">
            {t('same.moreTitle')} <span className="text-gradient-dream">{t('same.moreTitleHighlight')}</span>
          </h3>
          <p className="text-gray-400 text-center max-w-xl mx-auto mb-12">
            {t('same.moreSubtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {KEY_FEATURES.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-2xl p-8 border border-white/5 hover:border-dream-primary/20 transition-all duration-500 group"
              >
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-display text-xl font-bold mb-2">{feat.title}</h4>
                    <p className="text-gray-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ===== DREAM MAP WELTKARTE ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 relative rounded-3xl overflow-hidden border border-dream-cyan/20 group"
        >
          {/* Weltkarte mit echter SVG */}
          <div className="relative bg-gradient-to-br from-[#0a0e2a] via-[#0d1230] to-[#080c20] p-8 md:p-12">
            {/* Echte SVG-Weltkarte als Hintergrund */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute inset-0 bg-contain bg-no-repeat bg-center"
                style={{
                  backgroundImage: "url('/world-map.svg')",
                  filter: 'invert(1) hue-rotate(180deg) saturate(0.3) brightness(0.5) opacity(0.7)',
                }}
              />
              {/* Aktive Träumer-Marker auf der Karte */}
              {[
                { lat: 40.7, lng: -74, color: '#22d3ee', city: 'New York', delay: '0s', size: 8 },
                { lat: 34, lng: -118.2, color: '#a855f7', city: 'Los Angeles', delay: '0.5s', size: 6 },
                { lat: 19.4, lng: -99.1, color: '#f43f5e', city: 'México', delay: '1s', size: 6 },
                { lat: -23.5, lng: -46.6, color: '#6366f1', city: 'São Paulo', delay: '1.5s', size: 7 },
                { lat: -34.6, lng: -58.4, color: '#22d3ee', city: 'Buenos Aires', delay: '2s', size: 5 },
                { lat: 51.5, lng: -0.1, color: '#a855f7', city: 'London', delay: '0.3s', size: 7 },
                { lat: 48.8, lng: 2.3, color: '#f59e0b', city: 'Paris', delay: '0.8s', size: 6 },
                { lat: 52.5, lng: 13.4, color: '#22d3ee', city: 'Berlin', delay: '1.2s', size: 8 },
                { lat: 41, lng: 29, color: '#f59e0b', city: 'İstanbul', delay: '0.6s', size: 9 },
                { lat: 25.2, lng: 55.3, color: '#f59e0b', city: 'Dubai', delay: '1.8s', size: 7 },
                { lat: 24.7, lng: 46.7, color: '#f59e0b', city: 'Riad', delay: '2.2s', size: 6 },
                { lat: 30, lng: 31.2, color: '#a855f7', city: 'Kairo', delay: '1.4s', size: 7 },
                { lat: 19, lng: 72.8, color: '#f43f5e', city: 'Mumbai', delay: '2.5s', size: 6 },
                { lat: 35.7, lng: 139.7, color: '#22d3ee', city: 'Tokyo', delay: '0.9s', size: 7 },
                { lat: -33.9, lng: 151.2, color: '#6366f1', city: 'Sydney', delay: '3s', size: 5 },
                { lat: 55.7, lng: 37.6, color: '#a855f7', city: 'Moskau', delay: '1.7s', size: 6 },
              ].map((marker) => {
                const x = (marker.lng + 180) * (100 / 360);
                const y = (-marker.lat + 90) * (100 / 180);
                return (
                  <div key={marker.city} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                    <div
                      className="rounded-full animate-ping"
                      style={{
                        width: `${marker.size * 2}px`, height: `${marker.size * 2}px`,
                        backgroundColor: `${marker.color}30`,
                        animationDuration: '3s', animationDelay: marker.delay,
                      }}
                    />
                    <div
                      className="rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        width: `${marker.size}px`, height: `${marker.size}px`,
                        backgroundColor: marker.color,
                        boxShadow: `0 0 ${marker.size}px ${marker.color}80`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dream-cyan/10 border border-dream-cyan/20 text-dream-cyan text-sm font-bold mb-6">
                <MapPin className="w-4 h-4" />
                {t('same.mapBadge')}
              </div>

              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                {t('same.mapTitle1')}<br />
                {t('same.mapTitle2')} <span className="text-dream-cyan">{t('same.mapTitle3')}</span> {t('same.mapTitle4')}
              </h3>

              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                {t('same.mapDesc')}
              </p>

              {/* Live-Statistik */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-gray-300"><strong className="text-white">2.847</strong> {t('same.mapActive')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm">
                  <span className="w-2 h-2 bg-dream-rose rounded-full animate-pulse"></span>
                  <span className="text-gray-300"><strong className="text-white">384</strong> {t('same.mapMatches')}</span>
                </div>
              </div>

              <a
                href="https://www.dream-code.app/dream-map"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-dream-cyan to-dream-accent text-white font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-dream-cyan/30 transition-all hover:-translate-y-1"
              >
                <Globe className="w-5 h-5" />
                {t('same.mapButton')}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* ===== EMOTIONALER ABSCHLUSS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-dream-rose/20 via-dream-primary/15 to-dream-accent/20"></div>
          <div className="absolute inset-0 bg-dream-bg/70 backdrop-blur-sm"></div>

          <div className="relative z-10 p-10 md:p-16 text-center">
            <Heart className="w-12 h-12 text-dream-rose mx-auto mb-6 animate-pulse" />
            <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {t('same.closerTitle')}
            </h3>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('same.closerDesc')}
            </p>
            <a
              href="https://www.dream-code.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-dream-rose to-dream-primary text-white font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-dream-rose/30 transition-all hover:-translate-y-1"
            >
              {t('same.closerButton')}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default SameDream;
