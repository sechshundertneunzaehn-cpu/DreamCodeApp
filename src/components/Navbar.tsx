import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Heart, Sun, Moon, Globe, ChevronDown, Download } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useLang } from '../i18n/useLang';
import { LANG_FLAGS, LANG_LABELS, Lang } from '../i18n/translations';

const NAV_KEYS = [
  { key: 'nav.features', href: '#features' },
  { key: 'nav.samedream', href: '#same-dream', highlight: true },
  { key: 'nav.traditions', href: '#traditions' },
  { key: 'nav.cosmic', href: '#cosmic-dna' },
  { key: 'nav.moon', href: '#moon-sync' },
  { key: 'nav.reviews', href: '#testimonials' },
];

const ALL_LANGS: Lang[] = [
  'de','en','tr','es','fr','ar','pt','ru',
  'zh','hi','ja','ko','id','fa','it','pl',
  'bn','ur','vi','th','sw','hu',
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.getElementById(href.replace('#', ''));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'dark:bg-dream-bg/90 bg-white/90 backdrop-blur-xl border-b dark:border-white/5 border-gray-200 shadow-lg dark:shadow-dream-primary/5 shadow-gray-200/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dream-primary to-dream-accent flex items-center justify-center shadow-lg shadow-dream-primary/30 group-hover:shadow-dream-primary/50 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-wide dark:text-white text-gray-900 leading-none">
                Dream<span className="text-dream-primary">Code</span>
              </span>
              <span className="text-[10px] text-dream-secondary tracking-widest uppercase">dream-code.app</span>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_KEYS.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={(e) => scrollTo(e, item.href)}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                  item.highlight
                    ? 'text-dream-rose hover:text-dream-rose hover:bg-dream-rose/10 flex items-center gap-1.5 font-bold'
                    : 'dark:text-gray-300 text-gray-600 hover:text-dream-primary dark:hover:bg-white/5 hover:bg-gray-100'
                }`}
              >
                {item.highlight && <Heart className="w-3.5 h-3.5" />}
                {t(item.key)}
              </a>
            ))}

            {/* Sprachumschalter */}
            <div className="relative ml-2">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg dark:text-gray-300 text-gray-600 hover:text-dream-primary dark:hover:bg-white/5 hover:bg-gray-100 transition-colors text-sm"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-bold">{LANG_FLAGS[lang]} {lang.toUpperCase()}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 dark:bg-dream-card bg-white rounded-xl border dark:border-white/10 border-gray-200 shadow-xl py-1 min-w-[160px]">
                    {ALL_LANGS.map((l) => (
                      <button
                        key={l}
                        onClick={() => { setLang(l); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                          l === lang
                            ? 'text-dream-primary font-bold dark:bg-white/5 bg-dream-primary/5'
                            : 'dark:text-gray-300 text-gray-600 dark:hover:bg-white/5 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base">{LANG_FLAGS[l]}</span>
                        <span>{LANG_LABELS[l]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full dark:text-gray-300 text-gray-600 hover:text-dream-primary dark:hover:bg-white/5 hover:bg-gray-100 transition-colors"
              aria-label={isDark ? t('theme.light') : t('theme.dark')}
              title={isDark ? t('theme.light') : t('theme.dark')}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <a
              href="#downloads"
              onClick={(e) => scrollTo(e, '#downloads')}
              className="ml-2 px-4 py-2.5 border border-dream-primary/40 text-dream-primary text-sm font-bold rounded-full hover:bg-dream-primary/10 transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              {t('nav.download')}
            </a>
            <a
              href="#cta"
              onClick={(e) => scrollTo(e, '#cta')}
              className="px-6 py-2.5 bg-gradient-to-r from-dream-primary to-dream-accent text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-dream-primary/30 transition-all"
            >
              {t('nav.cta')}
            </a>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900">
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden dark:bg-dream-bg/98 bg-white/98 backdrop-blur-2xl border-b dark:border-white/5 border-gray-200 absolute w-full">
          <div className="px-4 py-4 space-y-1">
            {NAV_KEYS.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={(e) => scrollTo(e, item.href)}
                className="block px-4 py-3 dark:text-gray-300 text-gray-600 hover:text-dream-primary text-lg font-medium rounded-lg dark:hover:bg-white/5 hover:bg-gray-100 transition-colors"
              >
                {t(item.key)}
              </a>
            ))}

            {/* Mobile Sprache + Theme */}
            <div className="flex items-center gap-2 px-4 py-3 border-t dark:border-white/5 border-gray-200 mt-2 pt-4">
              <div className="flex flex-wrap gap-1.5 flex-1">
                {ALL_LANGS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      l === lang
                        ? 'bg-dream-primary text-white'
                        : 'dark:bg-white/5 bg-gray-100 dark:text-gray-400 text-gray-500'
                    }`}
                  >
                    {LANG_FLAGS[l]}
                  </button>
                ))}
              </div>
              <button onClick={toggleTheme} className="p-2 rounded-lg dark:bg-white/5 bg-gray-100">
                {isDark ? <Sun className="w-4 h-4 text-dream-secondary" /> : <Moon className="w-4 h-4 text-dream-primary" />}
              </button>
            </div>

            <a
              href="#cta"
              onClick={(e) => scrollTo(e, '#cta')}
              className="block mt-3 px-4 py-3 bg-gradient-to-r from-dream-primary to-dream-accent text-white text-center font-bold rounded-xl"
            >
              {t('nav.cta')}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
