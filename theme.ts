import { ThemeMode } from './types';

// Centralized theme tokens - use these instead of inline isLight ternaries
export function getTheme(themeMode: ThemeMode) {
  const isLight = themeMode === ThemeMode.LIGHT;

  return {
    isLight,

    // Page
    pageBg: isLight ? 'bg-[#f0eefc]' : 'bg-[#0f0b1a]',
    pageText: isLight ? 'text-[#2a1a3a]' : 'text-slate-200',

    // Cards & Surfaces
    cardBg: isLight ? 'bg-white/80 backdrop-blur-md' : 'bg-[#0f0518]/80 backdrop-blur-md',
    surfaceBg: isLight ? 'bg-white/70' : 'bg-white/5',
    elevatedBg: isLight ? 'bg-white/90' : 'bg-[#150b25]/90',
    modalBg: isLight ? 'bg-white/95 backdrop-blur-md' : 'bg-[#0f0b1a]/95 backdrop-blur-md',
    modalOverlay: isLight ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/80 backdrop-blur-md',

    // Text
    textPrimary: isLight ? 'text-[#2a1a3a]' : 'text-white',
    textSecondary: isLight ? 'text-[#4a3a5d]' : 'text-slate-400',
    textMuted: isLight ? 'text-[#6b5a80]' : 'text-slate-500',
    textInverse: isLight ? 'text-white' : 'text-[#2a1a3a]',

    // Borders
    border: isLight ? 'border-[#c4bce6]' : 'border-white/10',
    borderLight: isLight ? 'border-[#e0dcf5]' : 'border-white/5',
    borderAccent: isLight ? 'border-violet-300' : 'border-fuchsia-500/30',

    // Inputs
    inputBg: isLight ? 'bg-white/80 border-[#c4bce6]' : 'bg-black/40 border-white/10',
    inputText: isLight ? 'text-[#2a1a3a] placeholder-[#6b5a80]' : 'text-white placeholder-slate-600',
    inputFocus: 'focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30',

    // Buttons
    btnPrimary: isLight
      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
      : 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    btnSecondary: isLight
      ? 'bg-white/70 border-[#c4bce6] text-[#4a3a5d] hover:bg-white/90 hover:border-violet-300'
      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20',
    btnGhost: isLight
      ? 'text-[#4a3a5d] hover:bg-white/60 hover:text-[#2a1a3a]'
      : 'text-slate-400 hover:bg-white/5 hover:text-white',
    btnDisabled: isLight
      ? 'bg-slate-200/60 text-slate-400 cursor-not-allowed'
      : 'bg-slate-800/40 text-slate-600 cursor-not-allowed',

    // Navigation
    navBg: isLight
      ? 'bg-white/80 backdrop-blur-xl border-t border-[#c4bce6]/40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]'
      : 'bg-[#05020a]/80 backdrop-blur-lg border-t border-white/10',
    navActive: isLight ? 'text-violet-600' : 'text-fuchsia-400',
    navInactive: isLight ? 'text-[#6b5a80]' : 'text-slate-500',

    // Tags & Badges
    tagBg: isLight ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-indigo-900/40 text-indigo-200 border-indigo-500/30',

    // Status
    success: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30',
    error: isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-900/20 text-red-400 border-red-500/30',
    warning: isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-900/20 text-amber-400 border-amber-500/30',

    // Sections/Headers
    sectionHeaderBg: isLight ? 'bg-[#f0eefc]/60' : 'bg-slate-900/60',
    tabBg: isLight ? 'bg-[#e0dcf5]/50' : 'bg-slate-800/50',
    tabActive: isLight ? 'bg-violet-600 text-white shadow-lg' : 'bg-fuchsia-600 text-white shadow-lg',
    tabInactive: isLight ? 'text-[#4a3a5d] hover:bg-white/60' : 'text-slate-400 hover:bg-white/5',

    // Close button
    closeBtn: isLight
      ? 'hover:bg-[#e0dcf5] text-[#4a3a5d] hover:text-[#2a1a3a]'
      : 'hover:bg-white/10 text-slate-400 hover:text-white',

    // Scrollbar
    scrollThumb: isLight ? 'bg-[#c4bce6]' : 'bg-white/20',

    // Glassmorphism
    glass: isLight
      ? 'bg-white/70 backdrop-blur-xl border border-[#c4bce6]/60 shadow-[0_4px_30px_rgba(0,0,0,0.05)]'
      : 'bg-[#0f0b1a]/70 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]',

    // Charts/Stats area
    statsBg: isLight ? 'bg-violet-50/80' : 'bg-slate-900/50',
    statsGradient: isLight
      ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-fuchsia-600'
      : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400',
  };
}

export type Theme = ReturnType<typeof getTheme>;
