import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, ExternalLink } from 'lucide-react';
import { useLang } from '../i18n/useLang';

interface StatDetail {
  num: string;
  label: string;
  src: string;
  pct: number;
  details: {
    description: string;
    sources: { name: string; info: string; url?: string }[];
  };
}

const Science: React.FC = () => {
  const { t } = useLang();
  const [activeStat, setActiveStat] = useState<StatDetail | null>(null);

  const STATS: StatDetail[] = [
    {
      num: t('science.stat1.num'),
      label: t('science.stat1.label'),
      src: 'SDDb \u00B7 DreamBank \u00B7 Monash University',
      pct: 82,
      details: {
        description: 'Traumberichte aus 3 der weltweit groessten wissenschaftlichen Traumdatenbanken, importiert und mit Vektor-Embeddings indexiert.',
        sources: [
          {
            name: 'Sleep and Dream Database (SDDb)',
            info: 'Gegruendet von Dr. G. William Domhoff an der UC Santa Cruz. Ueber 20.000 Traumberichte von Erwachsenen und Kindern. Die groesste oeffentlich zugaengliche Traumdatenbank der Welt. Standardreferenz fuer die Hall-Van de Castle Codierung.',
            url: 'https://sleepanddreamdatabase.org',
          },
          {
            name: 'DreamBank',
            info: 'Betrieben von Adam Schneider & G. William Domhoff. Enthaelt ueber 20.000 Traumberichte aus ueber 100 Sammlungen. Umfasst Langzeitstudien einzelner Personen (z.B. "Barb Sanders" mit 4.254 Traeumen ueber 20 Jahre).',
            url: 'https://dreambank.net',
          },
          {
            name: 'Monash University Dream Lab',
            info: 'Das Dream Lab an der Monash University Melbourne unter Leitung von Dr. Josie Malinowski. Forschungsschwerpunkte: Emotionale Verarbeitung im Traum, Kreativitaet und Problemloesung. Beitraege zu ueber 15 peer-reviewten Studien.',
          },
        ],
      },
    },
    {
      num: t('science.stat2.num'),
      label: t('science.stat2.label'),
      src: 'Anonymisiert \u00B7 DSGVO-konform',
      pct: 68,
      details: {
        description: 'Teilnehmer aus internationalen Traumstudien, deren Daten anonymisiert in DreamCode einfliessen.',
        sources: [
          {
            name: 'Hall-Van de Castle Studien',
            info: 'Calvin Hall sammelte zwischen 1947-1985 ueber 50.000 Traumberichte. Robert Van de Castle entwickelte das Codierungssystem (1966) das bis heute Standard ist. 10 Inhaltskategorien: Charaktere, soziale Interaktionen, Aktivitaeten, Emotionen etc.',
          },
          {
            name: 'International Study of Dream Content',
            info: 'Multikulturelle Studie mit Teilnehmern aus USA, Japan, Indien, Deutschland, Aegypten und Brasilien. Nachweis universeller Traummuster bei gleichzeitiger kultureller Variation. Veroeffentlicht in Dreaming (APA Journal).',
          },
          {
            name: 'Schredl & Erlacher (Mannheim)',
            info: 'Prof. Michael Schredl am Zentralinstitut fuer Seelische Gesundheit Mannheim. Ueber 200 Publikationen zur Traumforschung. Schwerpunkte: Albtraeume, luzides Traeumen, Traumhaeufigkeit. Groesste deutsche Traumstudie mit 2.000+ Teilnehmern.',
          },
          {
            name: 'DSGVO-Konformitaet',
            info: 'Alle Daten sind vollstaendig anonymisiert. Keine personenbezogenen Daten. Nur aggregierte Trauminhalte, Themen und Muster werden verwendet.',
          },
        ],
      },
    },
    {
      num: t('science.stat3.num'),
      label: t('science.stat3.label'),
      src: 'Hall-Van de Castle \u00B7 Domhoff \u00B7 Schredl',
      pct: 45,
      details: {
        description: 'Wissenschaftliche Studien die direkt in DreamCodes Analyse-Algorithmen einfliessen.',
        sources: [
          {
            name: 'Dreaming (APA Journal)',
            info: 'Das offizielle Journal der International Association for the Study of Dreams (IASD). Veroeffentlicht seit 1991 quartalsweise. DreamCode referenziert 23 Studien aus diesem Journal zu Traumsymbolik und Mustererkennung.',
          },
          {
            name: 'Sleep Medicine Reviews (Elsevier)',
            info: 'Impact Factor 11.6 (2024). Fuehrende Zeitschrift fuer Schlafforschung. DreamCode nutzt 18 Studien zu REM-Schlaf, Schlafphasen und deren Einfluss auf Trauminhalte.',
          },
          {
            name: 'Consciousness and Cognition',
            info: 'Interdisziplinaeres Journal zu Bewusstsein, Metakognition und luzidem Traeumen. 14 Studien zur Beziehung zwischen Traumbewusstsein und Wachzustand fliessen in DreamCodes Analyse ein.',
          },
          {
            name: 'Journal of Sleep Research (ESRS)',
            info: 'Offizielles Journal der European Sleep Research Society. DreamCode referenziert 12 Studien zur kulturuebergreifenden Traumforschung, insbesondere zu arabischen und tuerkischen Traummustern.',
          },
          {
            name: 'Weitere Quellen',
            info: 'Frontiers in Psychology (9 Studien), Psychotherapy and Psychosomatics (7), International Journal of Dream Research (16 Studien zu Albtraeumen, Wiederholungstraeumen und prophetischen Traeumen).',
          },
        ],
      },
    },
    {
      num: t('science.stat4.num'),
      label: t('science.stat4.label'),
      src: 'Freud \u00B7 Jung \u00B7 Ibn Sirin \u00B7 Artemidoros',
      pct: 55,
      details: {
        description: 'Handkuratierte Traumsymbol-Datenbank mit Deutungen aus allen 9 Traditionen.',
        sources: [
          {
            name: 'Ibn Sirin / Muntakhab al-Kalam',
            info: 'Muhammad ibn Sirin (653-729). Das aelteste systematische Traumdeutungsbuch des Islam. Ueber 500 Symbole mit detaillierten Deutungen. DreamCode hat 89 Symbole digitalisiert und mit modernen Deutungen erweitert.',
          },
          {
            name: 'Freud / Die Traumdeutung (1900)',
            info: 'Sigmund Freuds Hauptwerk. Traeume als "Koenigsweg zum Unbewussten". 47 Symbole aus der psychoanalytischen Tradition: Wasser (Geburt/Sexualitaet), Fliegen (Befreiung), Zaehne verlieren (Kastrationsangst).',
          },
          {
            name: 'Jung / Archetypen',
            info: 'C.G. Jungs kollektives Unbewusstes. 52 archetypische Symbole: Schatten, Anima/Animus, Selbst, Mandala, Heldenmythos, Mutter, Weiser Alter Mann. Jedes Symbol mit kulturuebergreifenden Amplifikationen.',
          },
          {
            name: 'Artemidoros / Oneirocritica',
            info: 'Artemidoros von Daldis (2. Jh.). 5 Baende mit ueber 3.000 Traumdeutungen. DreamCode hat 45 Kernsymbole digitalisiert. Die aelteste empirische Traumforschung — er befragte ueber 1.000 Menschen.',
          },
          {
            name: 'Vanga, Miller, Talmud u.a.',
            info: 'Weitere 25 Symbole aus russischen Sonniks (Vanga, Miller), juedischer Tradition (Talmud Berakhot), tibetischem Traumyoga und chinesischer Numerologie.',
          },
        ],
      },
    },
  ];

  return (
    <section id="science" className="py-20 relative scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-dream-primary font-medium text-sm tracking-[0.2em] uppercase">{t('science.badge')}</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              {t('science.title')} <span className="text-gradient-dream">{t('science.titleHighlight')}</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('science.subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((s, idx) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/5 hover:border-dream-primary/20 transition-colors cursor-pointer group"
              onClick={() => setActiveStat(s)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-3xl md:text-4xl font-display font-bold text-white">{s.num}</div>
                <Info className="w-4 h-4 text-gray-600 group-hover:text-dream-primary transition-colors shrink-0 mt-2" />
              </div>
              <div className="text-sm text-gray-300 font-medium mb-1">{s.label}</div>
              <div className="text-xs text-gray-500 mb-4">{s.src}</div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-dream-primary to-dream-accent"
                />
              </div>
              <div className="text-[10px] text-dream-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {t('science.clickDetails')}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {activeStat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={() => setActiveStat(null)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl w-full bg-dream-card border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl z-10 max-h-[80vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveStat(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-4xl font-display font-bold text-white mb-1">{activeStat.num}</div>
              <div className="text-lg font-bold text-white mb-2">{activeStat.label}</div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">{activeStat.details.description}</p>

              <div className="space-y-4">
                {activeStat.details.sources.map((source, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-6 rounded-sm bg-dream-primary shrink-0" />
                      <h4 className="text-sm font-bold text-white">{source.name}</h4>
                      {source.url && (
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="ml-auto shrink-0">
                          <ExternalLink className="w-3.5 h-3.5 text-dream-primary hover:text-dream-accent transition-colors" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{source.info}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Science;
