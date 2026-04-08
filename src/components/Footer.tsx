import React from 'react';
import { Sparkles, Mail, Globe } from 'lucide-react';
import { useLang } from '../i18n/useLang';

const Footer: React.FC = () => {
  const { t } = useLang();

  return (
    <footer className="bg-black/50 border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dream-primary to-dream-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Dream<span className="text-dream-primary">Code</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {t('footer.desc')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">{t('footer.product')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#features" className="hover:text-dream-primary transition-colors">{t('nav.features')}</a></li>
              <li><a href="#traditions" className="hover:text-dream-primary transition-colors">{t('nav.traditions')}</a></li>
              <li><a href="#cosmic-dna" className="hover:text-dream-primary transition-colors">{t('nav.cosmic')}</a></li>
              <li><a href="#moon-sync" className="hover:text-dream-primary transition-colors">{t('nav.moon')}</a></li>
              <li><a href="#testimonials" className="hover:text-dream-primary transition-colors">{t('nav.reviews')}</a></li>
            </ul>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 mt-6">{t('footer.research')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/samedream.html" className="hover:text-dream-rose transition-colors">SameDream</a></li>
              <li><a href="/dreamatlas.html" className="hover:text-dream-primary transition-colors">DreamAtlas</a></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-dream-primary shrink-0" />
                <a href="https://www.dream-code.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  www.dream-code.app
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-dream-primary shrink-0" />
                <a href="mailto:info@dream-code.app" className="hover:text-white transition-colors">
                  info@dream-code.app
                </a>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-dream-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-gray-500 text-xs ml-2">4.9 / 5</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} DreamCode. {t('footer.copyright')}
          </p>
          <div className="flex gap-6 text-gray-500 text-sm">
            <a href="/impressum.html" className="hover:text-gray-300 transition-colors">{t('footer.impressum')}</a>
            <a href="/datenschutz.html" className="hover:text-gray-300 transition-colors">{t('footer.datenschutz')}</a>
            <a href="/agb.html" className="hover:text-gray-300 transition-colors">{t('footer.agb')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
