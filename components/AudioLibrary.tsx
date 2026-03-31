import React, { useState, useEffect } from 'react';
import { Dream, Language, ThemeMode, AudioVisibility } from '../types';
import { base64ToAudioBlob, createAudioURL } from '../services/audioService';

interface AudioLibraryProps {
    dreams: Dream[];
    language: Language;
    themeMode: ThemeMode;
    onUpdateDream?: (dream: Dream) => void;
}

const audioTranslations = {
    en: { title: 'Audio Recordings', no_audio: 'No Audio Yet', no_audio_desc: 'Record a dream to see it here.', play: 'Play', pause: 'Pause', duration: 'Duration', visibility: 'Visibility', private: 'Private', friends: 'Friends Only', public: 'Public', coin_hint: '💰 Earn coins by making audio public!', transcribed: 'Transcribed', untitled: 'Untitled Dream' },
    de: { title: 'Audio-Aufnahmen', no_audio: 'Kein Audio', no_audio_desc: 'Nimm einen Traum auf.', play: 'Abspielen', pause: 'Pause', duration: 'Dauer', visibility: 'Sichtbarkeit', private: 'Privat', friends: 'Nur Freunde', public: 'Öffentlich', coin_hint: '💰 Verdiene Münzen, indem du Audio öffentlich machst!', transcribed: 'Transkribiert', untitled: 'Unbenannter Traum' },
    tr: { title: 'Ses Kayıtları', no_audio: 'Ses Yok', no_audio_desc: 'Rüya kaydet.', play: 'Oynat', pause: 'Duraklat', duration: 'Süre', visibility: 'Görünürlük', private: 'Özel', friends: 'Sadece Arkadaşlar', public: 'Herkese Açık', coin_hint: '💰 Sesi herkese açık yaparak jeton kazan!', transcribed: 'Transkripsyon', untitled: 'İsimsiz Rüya' },
    es: { title: 'Grabaciones de Audio', no_audio: 'Sin Audio', no_audio_desc: 'Graba un sueño.', play: 'Reproducir', pause: 'Pausa', duration: 'Duración', visibility: 'Visibilidad', private: 'Privado', friends: 'Solo Amigos', public: 'Público', coin_hint: '💰 ¡Gana monedas haciendo el audio público!', transcribed: 'Transcrito', untitled: 'Sueño sin título' },
    fr: { title: 'Enregistrements Audio', no_audio: 'Pas d\'Audio', no_audio_desc: 'Enregistrez un rêve.', play: 'Lire', pause: 'Pause', duration: 'Durée', visibility: 'Visibilité', private: 'Privé', friends: 'Amis Seulement', public: 'Public', coin_hint: '💰 Gagnez des pièces en rendant l\'audio public !', transcribed: 'Transcrit', untitled: 'Rêve sans titre' },
    ar: { title: 'التسجيلات الصوتية', no_audio: 'لا يوجد صوت', no_audio_desc: 'سجل حلماً.', play: 'تشغيل', pause: 'إيقاف', duration: 'المدة', visibility: 'الظهور', private: 'خاص', friends: 'الأصدقاء فقط', public: 'عام', coin_hint: '💰 احصل على عملات بجعل الصوت عامًا!', transcribed: 'مُفرَّغ', untitled: 'حلم بلا عنوان' },
    pt: { title: 'Gravações de Áudio', no_audio: 'Sem Áudio', no_audio_desc: 'Grave um sonho.', play: 'Reproduzir', pause: 'Pausar', duration: 'Duração', visibility: 'Visibilidade', private: 'Privado', friends: 'Apenas Amigos', public: 'Público', coin_hint: '💰 Ganhe moedas tornando o áudio público!', transcribed: 'Transcrito', untitled: 'Sonho sem título' },
    ru: { title: 'Аудиозаписи', no_audio: 'Нет Аудио', no_audio_desc: 'Запишите сон.', play: 'Воспроизвести', pause: 'Пауза', duration: 'Длительность', visibility: 'Видимость', private: 'Приватный', friends: 'Только Друзья', public: 'Публичный', coin_hint: '💰 Зарабатывайте монеты, делая аудио публичным!', transcribed: 'Транскрибировано', untitled: 'Безымянный сон' }
};

const AudioLibrary: React.FC<AudioLibraryProps> = ({ dreams, language, themeMode, onUpdateDream }) => {
    const t = audioTranslations[language] || audioTranslations.en;
    const isLight = themeMode === ThemeMode.LIGHT;
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());
    const [editingVisibilityId, setEditingVisibilityId] = useState<string | null>(null);

    // Filter dreams that have audio
    const dreamsWithAudio = dreams.filter(dream =>
        (dream as any).audioUrl || dream.audioUrl
    );

    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
    const bgCard = isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-white/10';

    const handleVisibilityChange = (dream: Dream, newVisibility: AudioVisibility) => {
        if (onUpdateDream) {
            const updatedDream = { ...dream, audioVisibility: newVisibility };
            onUpdateDream(updatedDream);
        }
        setEditingVisibilityId(null);
    };

    const togglePlay = (dream: Dream) => {
        const audioUrl = (dream as any).audioUrl || dream.audioUrl;

        if (!audioUrl) return;

        // If this dream is already playing, pause it
        if (playingId === dream.id) {
            const audio = audioElements.get(dream.id);
            if (audio) {
                audio.pause();
                setPlayingId(null);
            }
            return;
        }

        // Pause any currently playing audio
        if (playingId) {
            const currentAudio = audioElements.get(playingId);
            if (currentAudio) {
                currentAudio.pause();
            }
        }

        // Create or get audio element for this dream
        let audio = audioElements.get(dream.id);

        if (!audio) {
            // Create new audio element
            try {
                // Check if it's a base64 string
                if (audioUrl.startsWith('data:audio')) {
                    const blob = base64ToAudioBlob(audioUrl);
                    const url = createAudioURL(blob);
                    audio = new Audio(url);
                } else {
                    audio = new Audio(audioUrl);
                }

                audio.onended = () => {
                    setPlayingId(null);
                };

                audio.onerror = (e) => {
                    console.error('Audio playback error:', e);
                    setPlayingId(null);
                };

                const newMap = new Map(audioElements);
                newMap.set(dream.id, audio);
                setAudioElements(newMap);
            } catch (error) {
                console.error('Error creating audio:', error);
                return;
            }
        }

        // Play the audio
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
        setPlayingId(dream.id);
    };

    // Cleanup audio elements on unmount
    useEffect(() => {
        return () => {
            audioElements.forEach(audio => {
                audio.pause();
                audio.src = '';
            });
        };
    }, []);

    if (dreamsWithAudio.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-6xl mb-4">🎤</div>
                <p className={`text-lg font-semibold mb-2 ${textMain}`}>{t.no_audio}</p>
                <p className={`text-sm ${textSub}`}>{t.no_audio_desc}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {dreamsWithAudio.map(dream => (
                <div
                    key={dream.id}
                    className={`rounded-xl border p-4 ${bgCard} transition-all hover:scale-[1.02]`}
                >
                    <div className="flex items-start gap-3">
                        {/* Play Button — min 44px touch target */}
                        <button
                            onClick={() => togglePlay(dream)}
                            className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-purple-500/30"
                            aria-label={playingId === dream.id ? t.pause : t.play}
                        >
                            <span className="material-icons text-2xl">{playingId === dream.id ? 'pause' : 'play_arrow'}</span>
                        </button>

                        {/* Dream Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold mb-1 truncate ${textMain}`}>
                                {dream.title || t.untitled}
                            </h3>
                            <p className={`text-sm mb-2 line-clamp-2 ${textSub}`}>
                                {dream.audioTranscript || dream.description.substring(0, 100)}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <span>🗓️ {dream.date}</span>
                                {dream.audioTranscript && (
                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                                        {t.transcribed}
                                    </span>
                                )}
                            </div>

                            {/* Visibility Settings */}
                            <div className="mt-2">
                                {editingVisibilityId === dream.id ? (
                                    <div className={`flex gap-2 items-center p-2 rounded-lg ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
                                        <span className={`text-xs font-semibold ${textSub}`}>{t.visibility}:</span>
                                        <button
                                            onClick={() => handleVisibilityChange(dream, AudioVisibility.PRIVATE)}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                                (dream.audioVisibility || AudioVisibility.PRIVATE) === AudioVisibility.PRIVATE
                                                    ? 'bg-gray-600 text-white'
                                                    : isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                        >
                                            🔒 {t.private}
                                        </button>
                                        <button
                                            onClick={() => handleVisibilityChange(dream, AudioVisibility.FRIENDS)}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                                dream.audioVisibility === AudioVisibility.FRIENDS
                                                    ? 'bg-blue-600 text-white'
                                                    : isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                        >
                                            👥 {t.friends}
                                        </button>
                                        <button
                                            onClick={() => handleVisibilityChange(dream, AudioVisibility.PUBLIC)}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                                dream.audioVisibility === AudioVisibility.PUBLIC
                                                    ? 'bg-green-600 text-white'
                                                    : isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                        >
                                            🌍 {t.public}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditingVisibilityId(dream.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                        }`}
                                    >
                                        {(dream.audioVisibility || AudioVisibility.PRIVATE) === AudioVisibility.PRIVATE && '🔒'}
                                        {dream.audioVisibility === AudioVisibility.FRIENDS && '👥'}
                                        {dream.audioVisibility === AudioVisibility.PUBLIC && '🌍'}
                                        <span>
                                            {(dream.audioVisibility || AudioVisibility.PRIVATE) === AudioVisibility.PRIVATE && t.private}
                                            {dream.audioVisibility === AudioVisibility.FRIENDS && t.friends}
                                            {dream.audioVisibility === AudioVisibility.PUBLIC && t.public}
                                        </span>
                                        <span className="text-[10px]">▼</span>
                                    </button>
                                )}
                                {/* Coin Hint for Public */}
                                {dream.audioVisibility === AudioVisibility.PUBLIC && (
                                    <p className="text-[10px] text-green-600 mt-1">
                                        {t.coin_hint}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Waveform Animation (when playing) */}
                        {playingId === dream.id && (
                            <div className="flex items-center gap-1">
                                <div className="w-1 bg-purple-500 rounded-full animate-wave-1" style={{height: '20px'}}></div>
                                <div className="w-1 bg-purple-500 rounded-full animate-wave-2" style={{height: '30px'}}></div>
                                <div className="w-1 bg-purple-500 rounded-full animate-wave-3" style={{height: '25px'}}></div>
                                <div className="w-1 bg-purple-500 rounded-full animate-wave-4" style={{height: '35px'}}></div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <style>{`
                @keyframes wave1 {
                    0%, 100% { height: 20px; }
                    50% { height: 35px; }
                }
                @keyframes wave2 {
                    0%, 100% { height: 30px; }
                    50% { height: 20px; }
                }
                @keyframes wave3 {
                    0%, 100% { height: 25px; }
                    50% { height: 40px; }
                }
                @keyframes wave4 {
                    0%, 100% { height: 35px; }
                    50% { height: 25px; }
                }
                .animate-wave-1 { animation: wave1 0.8s ease-in-out infinite; }
                .animate-wave-2 { animation: wave2 0.8s ease-in-out infinite 0.2s; }
                .animate-wave-3 { animation: wave3 0.8s ease-in-out infinite 0.4s; }
                .animate-wave-4 { animation: wave4 0.8s ease-in-out infinite 0.6s; }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default AudioLibrary;
