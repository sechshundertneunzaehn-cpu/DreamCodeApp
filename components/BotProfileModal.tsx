import React, { useEffect, useRef } from 'react';
import { BotSimUser, ProfileVisibility, CommunicationPreference } from '../types';

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface BotProfileModalProps {
    bot: BotSimUser | null;
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
    isFriend?: boolean;
    onToggleFriend?: (botId: string) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const ZODIAC_ICONS: Record<string, string> = {
    aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
    leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
    sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

function getZodiacIcon(sign: string): string {
    const key = sign?.toLowerCase() ?? '';
    return ZODIAC_ICONS[key] ?? '⭐';
}

function formatDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch {
        return dateStr;
    }
}

// ─── Component ─────────────────────────────────────────────────────────────────

const BotProfileModal: React.FC<BotProfileModalProps> = ({
    bot,
    isOpen,
    onClose,
    isDark,
    isFriend = false,
    onToggleFriend,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Reset scroll when a new bot opens
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [isOpen, bot?.id]);

    if (!isOpen || !bot) return null;

    // ── Derived values ──────────────────────────────────────────────────────────

    const displayName = bot.isAnonymous ? 'Anonymous Dreamer' : bot.name;
    const isPrivate =
        bot.privacyLevel === ProfileVisibility.ANONYMOUS ||
        bot.privacyLevel === ProfileVisibility.MINIMAL;
    const isFriendsOnly = bot.privacyLevel === ProfileVisibility.FRIENDS;
    const showFullProfile = !isPrivate && (!isFriendsOnly || isFriend);
    const noMessages = bot.communicationPreference === CommunicationPreference.CLOSED;

    // ── Theme tokens ────────────────────────────────────────────────────────────

    const bg = isDark
        ? 'bg-[#0f0a1e]'
        : 'bg-white';
    const cardBg = isDark
        ? 'bg-white/5 border-white/10'
        : 'bg-slate-50 border-slate-200';
    const textMain = isDark ? 'text-white' : 'text-slate-900';
    const textSub = isDark ? 'text-slate-400' : 'text-slate-500';
    const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
    const divider = isDark ? 'border-white/10' : 'border-slate-200';

    // ── Badge factory ───────────────────────────────────────────────────────────

    const Badge: React.FC<{
        icon: string;
        label: string;
        colorClass?: string;
    }> = ({ icon, label, colorClass }) => (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border
                ${colorClass ??
                (isDark
                    ? 'bg-purple-900/40 border-purple-500/30 text-purple-300'
                    : 'bg-purple-100 border-purple-200 text-purple-700')
                }`}
        >
            <span className="material-icons text-[14px] leading-none">{icon}</span>
            {label}
        </span>
    );

    // ── Render ──────────────────────────────────────────────────────────────────

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
            onClick={onClose}
        >
            {/* Modal card — stop propagation so inner clicks don't close */}
            <div
                className={`
                    relative w-full sm:max-w-md max-h-[92dvh] sm:max-h-[88vh]
                    rounded-t-3xl sm:rounded-3xl overflow-hidden
                    ${bg} shadow-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'}
                    flex flex-col
                    animate-[fadeSlideUp_0.28s_cubic-bezier(0.34,1.56,0.64,1)_both]
                `}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`Profile of ${displayName}`}
            >
                {/* ── Gradient header banner ─────────────────────────────────── */}
                <div className="relative h-28 sm:h-32 flex-shrink-0 bg-gradient-to-br from-purple-900 via-fuchsia-800 to-indigo-900 overflow-hidden">
                    {/* decorative blobs */}
                    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-fuchsia-500/20 blur-2xl" />
                    <div className="absolute bottom-0 -left-4 w-20 h-20 rounded-full bg-purple-400/20 blur-2xl" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
                        aria-label="Close"
                    >
                        <span className="material-icons text-[18px]">close</span>
                    </button>

                    {/* Match badge */}
                    {bot.matchPct > 0 && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-xs font-bold">
                            <span className="material-icons text-fuchsia-300 text-[14px]">auto_awesome</span>
                            {bot.matchPct}% match
                        </div>
                    )}
                </div>

                {/* ── Avatar + name row ─────────────────────────────────────── */}
                <div className="relative flex-shrink-0 px-5 pb-3">
                    {/* Avatar bubble overlapping banner */}
                    <div className="absolute -top-9 left-5">
                        <div className="w-[72px] h-[72px] rounded-2xl border-4 border-[#0f0a1e] bg-gradient-to-br from-purple-700 to-fuchsia-600 flex items-center justify-center text-4xl shadow-xl select-none"
                            style={{ borderColor: isDark ? '#0f0a1e' : '#fff' }}
                        >
                            {bot.avatar}
                        </div>
                    </div>

                    {/* Name block pushed right of avatar */}
                    <div className="pl-[88px] pt-2 min-h-[56px] flex flex-col justify-center">
                        <h2 className={`text-base font-bold leading-tight ${textMain}`}>
                            {displayName}
                        </h2>
                        {!bot.isAnonymous && (
                            <p className={`text-xs ${textSub}`}>
                                {bot.gender}
                                {!isPrivate && bot.age ? `, ${bot.age}` : ''}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Scrollable body ───────────────────────────────────────── */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">

                    {/* Privacy / friends-only notice */}
                    {(isFriendsOnly && !isFriend) && (
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium
                            ${isDark ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'}`}
                        >
                            <span className="material-icons text-[16px]">lock</span>
                            Only friends can see the full profile
                        </div>
                    )}

                    {/* No-messages notice */}
                    {noMessages && (
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium
                            ${isDark ? 'bg-slate-800/60 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                        >
                            <span className="material-icons text-[16px]">do_not_disturb</span>
                            This user prefers not to receive messages
                        </div>
                    )}

                    {/* Bio */}
                    {showFullProfile && bot.bio && (
                        <p className={`text-sm leading-relaxed ${textSub}`}>{bot.bio}</p>
                    )}

                    {/* Info grid */}
                    <div className={`grid grid-cols-2 gap-2.5`}>

                        {/* Location */}
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${cardBg}`}>
                            <span className={`material-icons text-[18px] text-fuchsia-400`}>location_on</span>
                            <div>
                                <p className={`text-[10px] uppercase tracking-wide font-semibold ${textMuted}`}>Location</p>
                                <p className={`text-xs font-medium ${textMain}`}>
                                    {bot.city}, {bot.country}
                                </p>
                            </div>
                        </div>

                        {/* Zodiac */}
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${cardBg}`}>
                            <span className="text-lg leading-none">{getZodiacIcon(bot.zodiacSign)}</span>
                            <div>
                                <p className={`text-[10px] uppercase tracking-wide font-semibold ${textMuted}`}>Zodiac</p>
                                <p className={`text-xs font-medium capitalize ${textMain}`}>{bot.zodiacSign}</p>
                            </div>
                        </div>

                        {/* Member since */}
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${cardBg}`}>
                            <span className={`material-icons text-[18px] text-purple-400`}>calendar_today</span>
                            <div>
                                <p className={`text-[10px] uppercase tracking-wide font-semibold ${textMuted}`}>Member since</p>
                                <p className={`text-xs font-medium ${textMain}`}>{formatDate(bot.joinedDate)}</p>
                            </div>
                        </div>

                        {/* Contributions */}
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${cardBg}`}>
                            <span className={`material-icons text-[18px] ${isFriend ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {isFriend ? 'auto_stories' : 'lock'}
                            </span>
                            <div>
                                <p className={`text-[10px] uppercase tracking-wide font-semibold ${textMuted}`}>Contributions</p>
                                <p className={`text-xs font-medium ${textMain}`}>
                                    {bot.contributionsCount}
                                    {!isFriend && <span className={`ml-1 ${textMuted}`}>— friends only</span>}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap gap-2">
                        <Badge icon="category" label={bot.category} />
                        <Badge
                            icon="mood"
                            label={bot.mood}
                            colorClass={
                                isDark
                                    ? 'bg-fuchsia-900/40 border-fuchsia-500/30 text-fuchsia-300'
                                    : 'bg-fuchsia-100 border-fuchsia-200 text-fuchsia-700'
                            }
                        />
                        {bot.dreamStyle && (
                            <Badge
                                icon="auto_awesome"
                                label={bot.dreamStyle}
                                colorClass={
                                    isDark
                                        ? 'bg-indigo-900/40 border-indigo-500/30 text-indigo-300'
                                        : 'bg-indigo-100 border-indigo-200 text-indigo-700'
                                }
                            />
                        )}
                    </div>

                    {/* Dream summary quote */}
                    {bot.dreamSummary && (
                        <div className={`relative px-4 py-3 rounded-xl border ${cardBg}`}>
                            <span className={`material-icons text-[16px] absolute top-2.5 left-3 ${isDark ? 'text-fuchsia-500/50' : 'text-fuchsia-400/60'}`}>
                                format_quote
                            </span>
                            <p className={`text-xs leading-relaxed italic pl-5 ${textSub}`}>
                                {bot.dreamSummary}
                            </p>
                        </div>
                    )}

                    {/* Contributions list — only unlocked for friends */}
                    {isFriend && bot.contributions && bot.contributions.length > 0 ? (
                        <div>
                            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textMuted}`}>
                                Contributions
                            </p>
                            <div className="space-y-2">
                                {bot.contributions.map(c => (
                                    <div
                                        key={c.id}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${cardBg}`}
                                    >
                                        <span className={`material-icons text-[18px] ${
                                            c.type === 'dream'
                                                ? 'text-fuchsia-400'
                                                : c.type === 'audio'
                                                ? 'text-purple-400'
                                                : 'text-indigo-400'
                                        }`}>
                                            {c.type === 'dream'
                                                ? 'nightlight'
                                                : c.type === 'audio'
                                                ? 'graphic_eq'
                                                : 'psychology'}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-medium truncate ${textMain}`}>{c.title}</p>
                                            <p className={`text-[10px] ${textMuted}`}>{formatDate(c.date)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : !isFriend && bot.contributionsCount > 0 ? (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                            isDark ? 'bg-white/3 border-white/8' : 'bg-slate-50 border-slate-200'
                        }`}>
                            <span className={`material-icons text-[20px] ${textMuted}`}>lock</span>
                            <p className={`text-xs ${textSub}`}>
                                Add as friend to see {bot.contributionsCount} contribution{bot.contributionsCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    ) : null}

                    {/* Languages */}
                    {isFriend && bot.languages && bot.languages.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {bot.languages.map(lang => (
                                <span
                                    key={lang}
                                    className={`px-2 py-0.5 rounded-full text-[11px] border font-medium ${
                                        isDark
                                            ? 'bg-white/5 border-white/10 text-slate-300'
                                            : 'bg-slate-100 border-slate-200 text-slate-600'
                                    }`}
                                >
                                    {lang}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Sticky action bar ─────────────────────────────────────── */}
                <div className={`flex-shrink-0 px-5 py-4 border-t ${divider} ${isDark ? 'bg-[#0f0a1e]/95' : 'bg-white/95'} backdrop-blur-sm`}>
                    <button
                        onClick={() => onToggleFriend && bot && onToggleFriend(bot.id)}
                        disabled={!onToggleFriend}
                        className={`
                            w-full py-3 rounded-2xl font-bold text-sm tracking-wide
                            flex items-center justify-center gap-2
                            transition-all duration-200 active:scale-[0.97]
                            ${isFriend
                                ? isDark
                                    ? 'bg-white/10 border border-white/20 text-white hover:bg-white/15'
                                    : 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200'
                                : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-fuchsia-900/30'
                            }
                            disabled:opacity-40 disabled:cursor-not-allowed
                        `}
                    >
                        <span className="material-icons text-[18px]">
                            {isFriend ? 'person_remove' : 'person_add'}
                        </span>
                        {isFriend ? 'Connected' : 'Connect'}
                    </button>
                </div>
            </div>

            {/* Keyframe animation — injected once */}
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)     scale(1);    }
                }
            `}</style>
        </div>
    );
};

export default BotProfileModal;
