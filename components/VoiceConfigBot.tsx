import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { API_BASE } from '../services/apiConfig';
import type { Language, ThemeMode } from '../types';

// ═══════════════════════════════════════════════════════════════════
// VoiceConfigBot — Diktat-Architektur (Mic → Deepgram STT → Gemini Extract)
// Kosten: 1 Coin pro erfolgreichem Diktat.
// ═══════════════════════════════════════════════════════════════════

interface VoiceConfigBotProps {
  language: Language;
  themeMode: ThemeMode;
  onClose: () => void;
  onSaved?: (config: Record<string, unknown>) => void;
  onConfigUpdate?: (partial: Record<string, unknown>) => void;
  onComplete?: (finalConfig: Record<string, unknown>) => void;
}

type Phase = 'idle' | 'recording' | 'processing' | 'success' | 'error';

// ── i18n (9 UI-Sprachen, Fallback EN) ────────────────────────────
const TEXTS: Record<string, Record<string, string>> = {
  de: {
    title: 'Sprachassistent',
    subtitle: 'Drücke das Mikro, sag deinen Traum.',
    tap_to_record: 'Mikro drücken zum Aufnehmen',
    stop_recording: 'Aufnahme stoppen',
    processing: 'Verstehe dich…',
    err_mic: 'Kein Mikrofon-Zugriff.',
    err_auth: 'Du musst eingeloggt sein.',
    err_stt: 'Ich konnte dich nicht verstehen. Versuch es nochmal.',
    err_gemini: 'Die KI ist gerade nicht erreichbar. Versuch es nochmal.',
    err_insufficient_coins: 'Nicht genug Münzen. Du brauchst 1.',
    err_generic: 'Etwas ist schief gelaufen.',
    missing_prefix: 'Noch fehlt: ',
    missing_none: 'Alles erfasst.',
    record_again: 'Noch etwas hinzufügen',
    close: 'Schließen',
    done: 'Fertig',
    cost: '1 🪙',
    hint_first: 'Sag einfach was du möchtest — Alter, Aussehen, Stil, Stimmung, Szene.',
  },
  en: {
    title: 'Voice Assistant',
    subtitle: 'Tap the mic and describe your dream.',
    tap_to_record: 'Tap mic to record',
    stop_recording: 'Stop recording',
    processing: 'Understanding you…',
    err_mic: 'No microphone access.',
    err_auth: 'You must be logged in.',
    err_stt: 'I couldn\'t understand you. Try again.',
    err_gemini: 'The AI is unreachable right now. Try again.',
    err_insufficient_coins: 'Not enough coins. You need 1.',
    err_generic: 'Something went wrong.',
    missing_prefix: 'Still missing: ',
    missing_none: 'All captured.',
    record_again: 'Add more',
    close: 'Close',
    done: 'Done',
    cost: '1 🪙',
    hint_first: 'Just say what you want — age, appearance, style, mood, scene.',
  },
  tr: {
    title: 'Sesli Asistan', subtitle: 'Mikrofona bas ve rüyanı anlat.',
    tap_to_record: 'Kayıt için mikrofona bas', stop_recording: 'Kaydı durdur',
    processing: 'Seni anlıyorum…',
    err_mic: 'Mikrofon erişimi yok.', err_auth: 'Giriş yapmalısın.',
    err_stt: 'Seni anlayamadım. Tekrar dene.',
    err_gemini: 'Yapay zeka şu an ulaşılabilir değil. Tekrar dene.',
    err_insufficient_coins: 'Yeterli jeton yok. 1 gerekli.',
    err_generic: 'Bir şeyler ters gitti.',
    missing_prefix: 'Eksik: ', missing_none: 'Her şey tamam.',
    record_again: 'Daha fazla ekle', close: 'Kapat', done: 'Bitti',
    cost: '1 🪙',
    hint_first: 'Ne istediğini söyle — yaş, görünüş, stil, ruh hali, sahne.',
  },
  es: {
    title: 'Asistente de voz', subtitle: 'Pulsa el micro y describe tu sueño.',
    tap_to_record: 'Pulsa el micro para grabar', stop_recording: 'Detener grabación',
    processing: 'Te estoy entendiendo…',
    err_mic: 'Sin acceso al micrófono.', err_auth: 'Debes iniciar sesión.',
    err_stt: 'No pude entenderte. Inténtalo de nuevo.',
    err_gemini: 'La IA no está disponible. Inténtalo.',
    err_insufficient_coins: 'No hay suficientes monedas. Necesitas 1.',
    err_generic: 'Algo salió mal.',
    missing_prefix: 'Falta: ', missing_none: 'Todo capturado.',
    record_again: 'Añadir más', close: 'Cerrar', done: 'Listo',
    cost: '1 🪙',
    hint_first: 'Di lo que quieres — edad, aspecto, estilo, ánimo, escena.',
  },
  fr: {
    title: 'Assistant vocal', subtitle: 'Appuie sur le micro et décris ton rêve.',
    tap_to_record: 'Appuie sur le micro', stop_recording: 'Arrêter',
    processing: 'Je te comprends…',
    err_mic: 'Pas d\'accès au micro.', err_auth: 'Tu dois être connecté.',
    err_stt: 'Je n\'ai pas compris. Réessaie.',
    err_gemini: 'L\'IA n\'est pas joignable. Réessaie.',
    err_insufficient_coins: 'Pas assez de jetons. Il en faut 1.',
    err_generic: 'Quelque chose a mal tourné.',
    missing_prefix: 'Il manque : ', missing_none: 'Tout saisi.',
    record_again: 'Ajouter', close: 'Fermer', done: 'Fini',
    cost: '1 🪙',
    hint_first: 'Dis ce que tu veux — âge, apparence, style, ambiance, scène.',
  },
  ar: {
    title: 'المساعد الصوتي', subtitle: 'اضغط الميكروفون وصف حلمك.',
    tap_to_record: 'اضغط للتسجيل', stop_recording: 'إيقاف التسجيل',
    processing: 'أفهمك…',
    err_mic: 'لا يوجد وصول إلى الميكروفون.', err_auth: 'يجب تسجيل الدخول.',
    err_stt: 'لم أفهمك. حاول مرة أخرى.',
    err_gemini: 'الذكاء الاصطناعي غير متاح. حاول مجددا.',
    err_insufficient_coins: 'لا توجد عملات كافية. تحتاج إلى ١.',
    err_generic: 'حدث خطأ ما.',
    missing_prefix: 'ناقص: ', missing_none: 'تم التقاط كل شيء.',
    record_again: 'إضافة المزيد', close: 'إغلاق', done: 'تم',
    cost: '١ 🪙',
    hint_first: 'قل ما تريد — العمر، المظهر، الأسلوب، المزاج، المشهد.',
  },
  ru: {
    title: 'Голосовой ассистент', subtitle: 'Нажми микрофон и опиши свой сон.',
    tap_to_record: 'Нажми микрофон', stop_recording: 'Остановить',
    processing: 'Понимаю тебя…',
    err_mic: 'Нет доступа к микрофону.', err_auth: 'Нужно войти.',
    err_stt: 'Я не понял. Попробуй снова.',
    err_gemini: 'ИИ недоступен. Попробуй снова.',
    err_insufficient_coins: 'Недостаточно монет. Нужна 1.',
    err_generic: 'Что-то пошло не так.',
    missing_prefix: 'Не хватает: ', missing_none: 'Всё записано.',
    record_again: 'Добавить', close: 'Закрыть', done: 'Готово',
    cost: '1 🪙',
    hint_first: 'Скажи что хочешь — возраст, вид, стиль, настроение, сцена.',
  },
  it: {
    title: 'Assistente vocale', subtitle: 'Tocca il microfono e descrivi il sogno.',
    tap_to_record: 'Tocca il mic', stop_recording: 'Ferma',
    processing: 'Ti capisco…',
    err_mic: 'Nessun accesso al microfono.', err_auth: 'Devi essere loggato.',
    err_stt: 'Non ho capito. Riprova.',
    err_gemini: 'L\'IA non è raggiungibile. Riprova.',
    err_insufficient_coins: 'Monete insufficienti. Serve 1.',
    err_generic: 'Qualcosa è andato storto.',
    missing_prefix: 'Manca: ', missing_none: 'Tutto catturato.',
    record_again: 'Aggiungi', close: 'Chiudi', done: 'Fatto',
    cost: '1 🪙',
    hint_first: 'Dì cosa vuoi — età, aspetto, stile, umore, scena.',
  },
  pt: {
    title: 'Assistente de voz', subtitle: 'Toque no microfone e descreva seu sonho.',
    tap_to_record: 'Toque no microfone', stop_recording: 'Parar',
    processing: 'Entendendo você…',
    err_mic: 'Sem acesso ao microfone.', err_auth: 'Precisa estar logado.',
    err_stt: 'Não entendi. Tente novamente.',
    err_gemini: 'IA não disponível. Tente novamente.',
    err_insufficient_coins: 'Moedas insuficientes. Precisa de 1.',
    err_generic: 'Algo deu errado.',
    missing_prefix: 'Falta: ', missing_none: 'Tudo capturado.',
    record_again: 'Adicionar', close: 'Fechar', done: 'Pronto',
    cost: '1 🪙',
    hint_first: 'Diga o que quer — idade, aparência, estilo, humor, cena.',
  },
};

function tx(lang: string, key: string): string {
  const short = (lang || 'de').toLowerCase().split('-')[0];
  return TEXTS[short]?.[key] ?? TEXTS.en[key] ?? TEXTS.de[key] ?? key;
}

// ── Human-Label für missing-Field ────────────────────────────────
function labelMissing(field: string, lang: string): string {
  const short = (lang || 'de').toLowerCase().split('-')[0];
  const maps: Record<string, Record<string, string>> = {
    de: { media_type: 'Format', persona: 'Person', style: 'Stil', mood: 'Stimmung', duration: 'Dauer', music: 'Musik', wishes: 'Traum' },
    en: { media_type: 'format', persona: 'person', style: 'style', mood: 'mood', duration: 'duration', music: 'music', wishes: 'dream' },
    tr: { media_type: 'format', persona: 'kişi', style: 'stil', mood: 'ruh hali', duration: 'süre', music: 'müzik', wishes: 'rüya' },
    es: { media_type: 'formato', persona: 'persona', style: 'estilo', mood: 'ánimo', duration: 'duración', music: 'música', wishes: 'sueño' },
    fr: { media_type: 'format', persona: 'personne', style: 'style', mood: 'ambiance', duration: 'durée', music: 'musique', wishes: 'rêve' },
    ar: { media_type: 'تنسيق', persona: 'شخص', style: 'أسلوب', mood: 'مزاج', duration: 'مدة', music: 'موسيقى', wishes: 'حلم' },
    ru: { media_type: 'формат', persona: 'человек', style: 'стиль', mood: 'настроение', duration: 'длит.', music: 'музыка', wishes: 'сон' },
    it: { media_type: 'formato', persona: 'persona', style: 'stile', mood: 'umore', duration: 'durata', music: 'musica', wishes: 'sogno' },
    pt: { media_type: 'formato', persona: 'pessoa', style: 'estilo', mood: 'humor', duration: 'duração', music: 'música', wishes: 'sonho' },
  };
  return maps[short]?.[field] ?? maps.en[field] ?? field;
}

export const VoiceConfigBot: React.FC<VoiceConfigBotProps> = ({
  language, themeMode, onClose, onSaved, onConfigUpdate, onComplete,
}) => {
  const isLight = themeMode === 'light';
  const T = (k: string) => tx(String(language), k);

  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [reply, setReply] = useState<string>('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [liveConfig, setLiveConfig] = useState<Record<string, unknown>>({});
  const [coinsLeft, setCoinsLeft] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      try { mediaRecorderRef.current?.stop(); } catch { /* noop */ }
      try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch { /* noop */ }
    };
  }, []);

  // ── Initial: bestehende Config laden ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;
        const r = await fetch(`${API_BASE}/api/voice-config/current`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) {
          const data = await r.json() as { config?: Record<string, unknown> };
          if (!cancelled && data.config) {
            setLiveConfig(data.config);
          }
        }
      } catch { /* egal */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Recording starten ────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setErrorMsg('');
    setReply('');
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      setErrorMsg(T('err_mic'));
      setPhase('error');
      return;
    }
    streamRef.current = stream;

    // MimeType: WebM/Opus bevorzugt, Fallback OGG
    let mimeType = 'audio/webm;codecs=opus';
    if (!('MediaRecorder' in window) || !MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
    }

    const rec = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = rec;
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => { void uploadRecording(mimeType); };
    rec.start();
    setPhase('recording');
  }, []);

  // ── Recording stoppen → Upload ───────────────────────────────────
  const stopRecording = useCallback(() => {
    try { mediaRecorderRef.current?.stop(); } catch { /* noop */ }
    try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch { /* noop */ }
    streamRef.current = null;
  }, []);

  const uploadRecording = useCallback(async (mimeType: string) => {
    setPhase('processing');
    const audioBlob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];

    if (audioBlob.size === 0) {
      setErrorMsg(T('err_stt'));
      setPhase('error');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setErrorMsg(T('err_auth'));
      setPhase('error');
      return;
    }

    const fd = new FormData();
    fd.append('audio', audioBlob, `dictation.${mimeType.includes('ogg') ? 'ogg' : 'webm'}`);
    fd.append('lang', String(language || 'de').slice(0, 3));
    fd.append('currentConfig', JSON.stringify(liveConfig));

    try {
      const r = await fetch(`${API_BASE}/api/voice-config/dictate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!r.ok) {
        let errCode = '';
        try { const j = await r.json(); errCode = j.error || ''; } catch { /* noop */ }
        if (r.status === 402 || errCode === 'insufficient_coins') setErrorMsg(T('err_insufficient_coins'));
        else if (errCode === 'auth_required' || errCode === 'invalid_token') setErrorMsg(T('err_auth'));
        else if (errCode === 'stt_failed') setErrorMsg(T('err_stt'));
        else if (errCode === 'extract_failed') setErrorMsg(T('err_gemini'));
        else setErrorMsg(T('err_generic'));
        setPhase('error');
        return;
      }

      const data = await r.json() as {
        configUpdate?: Record<string, unknown>;
        missingFields?: string[];
        isComplete?: boolean;
        reply?: string;
        coinsLeft?: number;
      };

      if (data.configUpdate) {
        setLiveConfig(data.configUpdate);
        onConfigUpdate?.(data.configUpdate);
      }
      if (typeof data.coinsLeft === 'number') setCoinsLeft(data.coinsLeft);
      setReply(data.reply || '');
      setMissingFields(data.missingFields || []);

      if (data.isComplete && data.configUpdate) {
        setPhase('success');
        onSaved?.(data.configUpdate);
        onComplete?.(data.configUpdate);
        setTimeout(() => onClose(), 1500);
      } else {
        setPhase('idle'); // bereit für weiteres Diktat
      }
    } catch {
      setErrorMsg(T('err_generic'));
      setPhase('error');
    }
  }, [language, liveConfig, onConfigUpdate, onSaved, onComplete, onClose, T]);

  // ── UI ──────────────────────────────────────────────────────────
  const cardClass = isLight
    ? 'bg-white/95 border-gray-200 text-gray-900'
    : 'bg-neutral-900/95 border-white/10 text-white';

  const chipClass = isLight
    ? 'bg-gray-100 text-gray-800 border border-gray-200'
    : 'bg-white/10 text-white/90 border border-white/10';

  const configChips: Array<{ label: string; value: string }> = [];
  const c = liveConfig as any;
  if (c.media_type) configChips.push({ label: 'Format', value: c.media_type });
  if (c.persona?.age) configChips.push({ label: 'Age', value: String(c.persona.age) });
  if (c.persona?.gender) configChips.push({ label: 'Gender', value: c.persona.gender });
  if (c.persona?.hair_color) configChips.push({ label: 'Hair', value: c.persona.hair_color });
  const prefs = c.video_preferences ?? c.slideshow_preferences;
  if (prefs?.art_style) configChips.push({ label: 'Style', value: prefs.art_style });
  if (prefs?.mood) configChips.push({ label: 'Mood', value: prefs.mood });
  if (prefs?.duration_seconds) configChips.push({ label: 'Duration', value: `${prefs.duration_seconds}s` });
  if (c.custom_wishes) configChips.push({ label: 'Dream', value: String(c.custom_wishes).slice(0, 50) });

  const missingLabel = missingFields.length > 0
    ? T('missing_prefix') + missingFields.map(f => labelMissing(f, String(language))).join(', ')
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm bg-black/40"
         role="dialog" aria-modal="true" aria-label={T('title')}>
      <div className={`w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl ${cardClass} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center">
              <span className="material-icons text-white">mic</span>
            </div>
            <div>
              <h2 className="text-base font-bold">{T('title')}</h2>
              <p className="text-xs opacity-70">{T('subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label={T('close')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
            <span className="material-icons text-sm">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-3 overflow-y-auto flex-1 min-h-[220px] flex flex-col items-center justify-center">
          {phase === 'idle' && reply === '' && (
            <p className={`text-center text-sm ${isLight ? 'text-gray-500' : 'text-white/60'}`}>
              {T('hint_first')}
            </p>
          )}

          {reply && (
            <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
              {reply}
            </div>
          )}

          {phase === 'processing' && (
            <div className="flex items-center gap-2 text-sm opacity-80">
              <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
              <span>{T('processing')}</span>
            </div>
          )}

          {phase === 'error' && errorMsg && (
            <div className="text-center text-sm text-red-500 px-4">{errorMsg}</div>
          )}

          {phase === 'success' && (
            <div className="text-center text-sm text-emerald-500 font-semibold">✓ {T('done')}</div>
          )}
        </div>

        {/* Config-Chips */}
        {configChips.length > 0 && (
          <div className="px-4 py-2 border-t border-white/5 flex flex-wrap gap-1">
            {configChips.map((c2, i) => (
              <span key={i} className={`text-xs px-2 py-1 rounded-full ${chipClass}`}>
                <span className="opacity-60">{c2.label}:</span> <b>{c2.value}</b>
              </span>
            ))}
          </div>
        )}

        {/* Missing-Fields Hinweis */}
        {phase !== 'success' && missingFields.length > 0 && (
          <div className={`px-4 py-2 border-t border-white/5 text-xs ${isLight ? 'text-amber-600' : 'text-amber-300'}`}>
            {missingLabel}
          </div>
        )}

        {/* Footer: Mic-Button */}
        <div className="p-4 border-t border-white/5 flex flex-col items-center gap-2">
          {coinsLeft !== null && (
            <div className="text-xs opacity-60">🪙 {coinsLeft}</div>
          )}

          {phase === 'recording' ? (
            <button onClick={stopRecording}
                    className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl active:scale-95 transition relative">
              <span className="absolute inset-0 rounded-full bg-red-500/50 animate-ping" />
              <span className="material-icons text-3xl relative z-10">stop</span>
            </button>
          ) : (
            <button onClick={startRecording}
                    disabled={phase === 'processing'}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-600 to-violet-600 text-white flex items-center justify-center shadow-2xl active:scale-95 transition disabled:opacity-50">
              <span className="material-icons text-3xl">mic</span>
            </button>
          )}

          <p className="text-xs opacity-70 text-center">
            {phase === 'recording' ? T('stop_recording') :
             phase === 'processing' ? T('processing') :
             phase === 'success' ? T('done') :
             reply ? T('record_again') : `${T('tap_to_record')} · ${T('cost')}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceConfigBot;
