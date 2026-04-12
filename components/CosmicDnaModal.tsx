import React, { useState, useEffect } from 'react';

interface CosmicDnaModalProps {
    isLight: boolean;
    onClose: () => void;
    t: { ui: Record<string, string> };
}

const CosmicDnaModal: React.FC<CosmicDnaModalProps> = ({ isLight, onClose, t }) => {
    const saved = (() => { try { const s = localStorage.getItem('cosmicDna'); return s ? JSON.parse(s) : null; } catch { return null; } })();
    const [birthDate, setBirthDate] = useState<string>(saved?.birthDate || '');
    const [birthTime, setBirthTime] = useState<string>(saved?.birthTime || '');
    const [toast, setToast] = useState(false);

    useEffect(() => {
        if (toast) { const id = setTimeout(() => { setToast(false); onClose(); }, 1800); return () => clearTimeout(id); }
    }, [toast, onClose]);

    const handleSave = () => {
        if (!birthDate) return;
        localStorage.setItem('cosmicDna', JSON.stringify({ birthDate, birthTime: birthTime || null }));
        setToast(true);
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className={`w-[95%] max-w-md ${isLight ? 'bg-white/95 border-indigo-100/60' : 'bg-dream-surface/95 border-fuchsia-500/20'} backdrop-blur-md border rounded-2xl shadow-2xl overflow-hidden`} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-fuchsia-900 p-6 text-center">
                    <span className="text-4xl">🧬</span>
                    <h2 className="text-xl font-bold text-white mt-2">{t.ui.cosmic_dna || 'Kosmische DNA'}</h2>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {t.ui.cosmic_dna_body || 'Deine Kosmische DNA ist dein einzigartiger Traum-Fingerabdruck.'}
                    </p>

                    {/* Birth Date */}
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>
                            Geburtsdatum *
                        </label>
                        <input
                            type="date"
                            required
                            value={birthDate}
                            onChange={e => setBirthDate(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-900 focus:border-indigo-400' : 'bg-indigo-900/20 border-indigo-500/30 text-white focus:border-indigo-400'}`}
                        />
                    </div>

                    {/* Birth Time */}
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>
                            Geburtszeit <span className={`font-normal normal-case ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>(optional)</span>
                        </label>
                        <input
                            type="time"
                            value={birthTime}
                            onChange={e => setBirthTime(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-900 focus:border-indigo-400' : 'bg-indigo-900/20 border-indigo-500/30 text-white focus:border-indigo-400'}`}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 flex gap-2">
                    <button onClick={onClose} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                        {t.ui.close || 'Schliessen'}
                    </button>
                    <button onClick={handleSave} disabled={!birthDate} className={`flex-[2] py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${!birthDate ? 'bg-indigo-600/40 text-white/40 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                        Berechnen
                    </button>
                </div>

                {/* Toast */}
                {toast && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                        <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-2xl animate-in zoom-in-95">
                            Gespeichert!
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CosmicDnaModal;
