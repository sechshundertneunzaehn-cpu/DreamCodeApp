import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sparkles, Dna, MessageSquare, Image, Languages, Mic, FileText } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const Features: React.FC = () => {
  const { t } = useLang();

  const PILLARS = [
    {
      icon: MessageSquare,
      title: t('features.pillar1.title'),
      description: t('features.pillar1.desc'),
      color: 'from-dream-primary to-purple-400',
      glow: 'shadow-dream-primary/20',
      features: [t('features.pillar1.tag1'), t('features.pillar1.tag2'), t('features.pillar1.tag3')],
    },
    {
      icon: Dna,
      title: t('features.pillar2.title'),
      description: t('features.pillar2.desc'),
      color: 'from-dream-secondary to-amber-300',
      glow: 'shadow-dream-secondary/20',
      features: [t('features.pillar2.tag1'), t('features.pillar2.tag2'), t('features.pillar2.tag3')],
    },
    {
      icon: Moon,
      title: t('features.pillar3.title'),
      description: t('features.pillar3.desc'),
      color: 'from-dream-accent to-indigo-300',
      glow: 'shadow-dream-accent/20',
      features: [t('features.pillar3.tag1'), t('features.pillar3.tag2'), t('features.pillar3.tag3')],
    },
  ];

  const SUB_FEATURES = [
    { icon: Image, label: t('features.sub1.label'), desc: t('features.sub1.desc') },
    { icon: Mic, label: t('features.sub2.label'), desc: t('features.sub2.desc') },
    { icon: Languages, label: t('features.sub3.label'), desc: t('features.sub3.desc') },
    { icon: FileText, label: t('features.sub4.label'), desc: t('features.sub4.desc') },
  ];

  return (
    <section id="features" className="py-28 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-dream-primary font-medium text-sm tracking-[0.2em] uppercase">{t('features.badge')}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              {t('features.title')} <span className="text-gradient-dream">{t('features.titleHighlight')}</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* 3 Säulen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {PILLARS.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${pillar.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700 rounded-2xl blur-xl`}></div>
              <div className={`relative glass rounded-2xl p-8 h-full flex flex-col hover:border-white/10 transition-all duration-500 hover:${pillar.glow} hover:shadow-xl`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <pillar.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">{pillar.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6 flex-grow">{pillar.description}</p>
                <div className="flex flex-wrap gap-2">
                  {pillar.features.map((f) => (
                    <span key={f} className="px-3 py-1 text-xs font-medium rounded-full border border-white/10 text-gray-300 bg-white/5">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sub-Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {SUB_FEATURES.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-dream-primary/20 transition-colors group"
            >
              <feat.icon className="w-8 h-8 text-dream-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-white text-sm mb-1">{feat.label}</h4>
              <p className="text-gray-500 text-xs">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
