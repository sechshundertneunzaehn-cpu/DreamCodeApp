import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const TESTIMONIALS = [
  // Englisch (US)
  {
    name: 'Sarah Mitchell',
    location: 'New York, USA',
    lang: 'EN',
    flag: '\u{1F1FA}\u{1F1F8}',
    stars: 5,
    verified: true,
    text: "I've tried dozens of dream apps, but DreamCode is on another level. The AI doesn't just spit out generic meanings -- it actually asks follow-up questions and gives you a deeply personal interpretation. The Cosmic DNA feature blew my mind. It connected patterns in my dreams I never would have seen on my own. Absolutely worth every penny.",
    highlight: 'Best dream app I have ever used. Period.',
  },
  {
    name: 'James Rodriguez',
    location: 'Miami, USA',
    lang: 'EN',
    flag: '\u{1F1FA}\u{1F1F8}',
    stars: 5,
    verified: true,
    text: "The MoonSync feature is genius. I started tracking my dreams alongside the lunar cycle and the patterns are undeniable. During full moons, my dreams are incredibly vivid and the AI picks up on details that are honestly scary accurate. My therapist even asked me what app I'm using!",
    highlight: 'My therapist wants to know what app I use.',
  },
  // Türkisch
  {
    name: 'Elif Yılmaz',
    location: 'İstanbul, Türkiye',
    lang: 'TR',
    flag: '\u{1F1F9}\u{1F1F7}',
    stars: 5,
    verified: true,
    text: "Rüyalarımı bu kadar derin analiz eden bir uygulama daha önce hiç görmedim. Özellikle İslam geleneği üzerinden yapılan yorumlar inanılmaz detaylı -- İbn Sirin ve Nabulsi kaynaklarına dayanması beni çok etkiledi. Sesli anlatım özelliği de muhteşem, rüyanızı anlatıyorsunuz ve yapay zekâ birebir anlıyor.",
    highlight: 'İbn Sirin kaynaklarına dayanan tek uygulama.',
  },
  {
    name: 'Ahmet Demir',
    location: 'Ankara, Türkiye',
    lang: 'TR',
    flag: '\u{1F1F9}\u{1F1F7}',
    stars: 5,
    verified: true,
    text: "Kozmik DNA özelliği hayatımı değiştirdi. Doğum tarihimle hesaplanan yaşam yolu sayısı ve burç analizi, rüyalarıma bambaşka bir perspektif kattı. Ayrıca ay evreleri ile rüyalarım arasındaki bağlantı gerçekten şaşırttı. Herkese öneriyorum!",
    highlight: 'Kozmik DNA özelliği hayatımı değiştirdi.',
  },
  // Lateinamerika (Spanisch)
  {
    name: 'Valentina Herrera',
    location: 'Ciudad de México, México',
    lang: 'ES',
    flag: '\u{1F1F2}\u{1F1FD}',
    stars: 5,
    verified: true,
    text: "¡Increíble! DreamCode no es solo una app de sueños -- es un viaje espiritual completo. La función de ADN Cósmico conectó mi signo zodiacal con mis sueños de una manera que nunca había experimentado. La IA habla como un verdadero maestro espiritual. He probado muchas apps y ninguna se acerca a esta.",
    highlight: 'La IA habla como un verdadero maestro espiritual.',
  },
  {
    name: 'Carlos Mendoza',
    location: 'Buenos Aires, Argentina',
    lang: 'ES',
    flag: '\u{1F1E6}\u{1F1F7}',
    stars: 5,
    verified: true,
    text: "Lo que más me impresiona es la sincronización lunar. Empecé a notar que mis sueños más intensos coinciden con la luna llena, y la app lo confirmó con datos. La interpretación psicológica basada en Jung es profundísima. Esta app realmente entiende los sueños a un nivel científico y espiritual.",
    highlight: 'Combina ciencia y espiritualidad perfectamente.',
  },
  // Arabisch
  {
    name: 'فاطمة الحسيني',
    location: 'دبي، الإمارات',
    lang: 'AR',
    flag: '\u{1F1E6}\u{1F1EA}',
    stars: 5,
    verified: true,
    text: "تطبيق DreamCode غيّر نظرتي لأحلامي تمامًا. التفسير الإسلامي مبني على مصادر ابن سيرين والنابلسي الأصلية -- وهذا نادر جدًا في التطبيقات الحديثة. الذكاء الاصطناعي يسألك أسئلة ذكية عن تفاصيل الحلم ويعطيك تفسيرًا شخصيًا عميقًا. أنصح به كل من يبحث عن فهم أعمق لأحلامه.",
    highlight: 'مبني على مصادر ابن سيرين والنابلسي الأصلية.',
  },
  {
    name: 'أحمد الشريف',
    location: 'الرياض، السعودية',
    lang: 'AR',
    flag: '\u{1F1F8}\u{1F1E6}',
    stars: 5,
    verified: true,
    text: "ميزة الحمض النووي الكوني مذهلة -- ربطت برجي وتاريخ ميلادي بأحلامي بطريقة لم أتخيلها. كذلك ميزة مزامنة القمر تُظهر كيف تتغير أحلامي مع أطوار القمر. التطبيق متوفر بالعربية بجودة عالية وهذا شيء نادر. أفضل تطبيق تفسير أحلام استخدمته على الإطلاق.",
    highlight: 'أفضل تطبيق تفسير أحلام استخدمته على الإطلاق.',
  },
];

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

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="glass rounded-2xl p-5 border border-white/5 hover:border-dream-primary/20 transition-all duration-300 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dream-primary to-dream-accent flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold text-sm">{t.name}</span>
                      {t.verified && <CheckCircle2 className="w-3.5 h-3.5 text-dream-primary" />}
                    </div>
                    <span className="text-gray-500 text-[11px]">{t.flag} {t.location}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">{t.lang}</span>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-2.5">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-dream-secondary fill-dream-secondary" />
                ))}
              </div>

              {/* Highlight */}
              <p className="text-dream-primary font-bold text-xs mb-2.5 italic flex items-start gap-1.5" dir={t.lang === 'AR' ? 'rtl' : 'ltr'}>
                <Quote className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50" />
                {t.highlight}
              </p>

              {/* Text */}
              <p className={`text-gray-300 text-xs leading-relaxed flex-grow ${t.lang === 'AR' ? 'text-right' : ''}`} dir={t.lang === 'AR' ? 'rtl' : 'ltr'}>
                {t.text}
              </p>
            </motion.div>
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
