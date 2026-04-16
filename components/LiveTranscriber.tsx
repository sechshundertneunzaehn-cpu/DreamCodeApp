import React, { useState, useRef, useCallback, useEffect } from 'react';
import { apiFetch } from '../services/apiConfig';
import { getVideoT } from './videoTranslations';

interface LiveTranscriberProps {
  language: string;
  onTranscriptComplete: (text: string, audioBlob?: Blob | null) => void;
  onCancel: () => void;
  isLight?: boolean;
}

const LiveTranscriber: React.FC<LiveTranscriberProps> = ({ language, onTranscriptComplete, onCancel, isLight }) => {
  const t = getVideoT(language);
  const [recState, setRecState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    // Speech Recognition stoppen
    try { (window as any).__dreamcode_transcriber?.abort(); } catch { /* ok */ }
    (window as any).__dreamcode_transcriber = null;
    // Deepgram Fallback stoppen
    const dg = (window as any).__dreamcode_deepgram;
    if (dg) {
      try { dg.ws?.close(); } catch { /* ok */ }
      try { dg.processor?.disconnect(); } catch { /* ok */ }
      try { dg.audioCtx?.close(); } catch { /* ok */ }
      (window as any).__dreamcode_deepgram = null;
    }
    // MediaRecorder stoppen
    if (recorderRef.current?.state !== 'inactive') {
      try { recorderRef.current?.stop(); } catch { /* ok */ }
    }
    recorderRef.current = null;
    // Audio Stream stoppen
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setTranscript('');
      setInterimText('');
      setAudioUrl(null);
      chunksRef.current = [];

      // MediaRecorder parallel starten fuer Aufnahme-Wiedergabe
      try {
        const mr = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm',
        });
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.onstop = () => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            setAudioUrl(URL.createObjectURL(blob));
          }
        };
        mr.start(250);
        recorderRef.current = mr;
      } catch { /* MediaRecorder nicht verfuegbar — ignorieren */ }

      // ── STT: Deepgram zuerst (zuverlaessiger auf allen Browsern/Mobile) ──
      const langCode = language.replace('-', '_').split('_')[0] || 'de';
      let sttStarted = false;

      // Deepgram als primaere Methode (funktioniert ueberall inkl. Mobile)
      try {
        const tokenRes = await apiFetch('/api/transcribe', {
          method: 'POST',
          body: JSON.stringify({ action: 'get-token' }),
        });
        if (!tokenRes.ok) throw new Error('Token failed');
        const { key } = await tokenRes.json();

        const ws = new WebSocket(
          `wss://api.deepgram.com/v1/listen?model=nova-3&language=${langCode}&encoding=linear16&sample_rate=16000&channels=1&punctuate=true&interim_results=true&smart_format=true&endpointing=300`,
          ['token', key]
        );

        ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            const alt = data?.channel?.alternatives?.[0];
            if (!alt || !alt.transcript) return;
            if (data.is_final) {
              setTranscript(prev => (prev ? prev + ' ' : '') + alt.transcript);
              setInterimText('');
            } else {
              setInterimText(alt.transcript);
            }
          } catch { /* ignore */ }
        };
        ws.onerror = () => console.warn('[LiveTranscriber] Deepgram WS Fehler');

        const audioCtx = new AudioContext({ sampleRate: 16000 });
        // Mobile: AudioContext muss nach User-Geste resumed werden
        if (audioCtx.state === 'suspended') await audioCtx.resume();

        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const pcm = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(pcm.length);
            for (let i = 0; i < pcm.length; i++) {
              int16[i] = Math.max(-32768, Math.min(32767, pcm[i] * 32768));
            }
            ws.send(int16.buffer);
          }
        };
        source.connect(processor);
        processor.connect(audioCtx.destination);

        (window as any).__dreamcode_deepgram = { ws, audioCtx, processor };
        sttStarted = true;
        console.log('[LiveTranscriber] Deepgram STT gestartet');
      } catch (dgErr) {
        console.warn('[LiveTranscriber] Deepgram nicht verfuegbar:', dgErr);
      }

      // Web Speech API als Fallback (falls Deepgram fehlschlaegt)
      if (!sttStarted) {
        const LANG_MAP: Record<string, string> = {
          de: 'de-DE', en: 'en-US', tr: 'tr-TR', ar: 'ar-SA', es: 'es-ES',
          fr: 'fr-FR', pt: 'pt-BR', ru: 'ru-RU', pl: 'pl-PL', it: 'it-IT',
          ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN', hi: 'hi-IN', id: 'id-ID',
          hu: 'hu-HU', fa: 'fa-IR', vi: 'vi-VN', th: 'th-TH',
        };
        const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (SR) {
          const buildRecognition = (): any => {
            const rec = new SR();
            rec.lang = LANG_MAP[language.split('-')[0]] || LANG_MAP[language] || 'de-DE';
            rec.continuous = false;
            rec.interimResults = true;
            rec.onresult = (event: any) => {
              let finalText = '';
              let interimStr = '';
              for (let i = 0; i < event.results.length; i++) {
                const t = event.results[i][0]?.transcript || '';
                if (event.results[i].isFinal) finalText += t;
                else interimStr += t;
              }
              if (finalText) {
                setTranscript(prev => (prev ? prev + ' ' : '') + finalText);
                setInterimText('');
              } else {
                setInterimText(interimStr);
              }
            };
            rec.onerror = (ev: any) => {
              if (ev.error === 'no-speech' || ev.error === 'aborted') return;
            };
            rec.onend = () => {
              if (recorderRef.current?.state === 'recording' || recorderRef.current?.state === 'paused') {
                const fresh = buildRecognition();
                (window as any).__dreamcode_transcriber = fresh;
                try { fresh.start(); } catch { /* ok */ }
              }
            };
            return rec;
          };
          const recognition = buildRecognition();
          (window as any).__dreamcode_transcriber = recognition;
          try { recognition.start(); } catch { /* ok */ }
          console.log('[LiveTranscriber] Web Speech API Fallback gestartet');
        }
      }

      setRecState('recording');
    } catch (e) {
      console.error('[LiveTranscriber] Mic access denied:', e);
    }
  }, [language]);

  const pauseRecording = useCallback(() => {
    recorderRef.current?.pause();
    setRecState('paused');
  }, []);

  const resumeRecording = useCallback(() => {
    recorderRef.current?.resume();
    setRecState('recording');
  }, []);

  const handleClear = useCallback(() => {
    cleanup();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTranscript('');
    setInterimText('');
    setRecState('idle');
  }, [cleanup, audioUrl]);

  const togglePlayback = useCallback(() => {
    if (!audioUrl) return;
    if (isPlaying && audioElRef.current) {
      audioElRef.current.pause();
      setIsPlaying(false);
    } else {
      const audio = new Audio(audioUrl);
      audioElRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  const handleDone = useCallback(() => {
    // Audio-Blob aus Chunks erstellen BEVOR cleanup
    let blob: Blob | null = null;
    if (chunksRef.current.length > 0) {
      blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    }
    cleanup();
    onTranscriptComplete(transcript.trim(), blob);
  }, [cleanup, transcript, onTranscriptComplete]);

  const cardBg = isLight ? 'bg-white border-indigo-100' : 'bg-white/5 border-white/10';
  const textColor = isLight ? 'text-gray-900' : 'text-white';
  const mutedColor = isLight ? 'text-gray-400' : 'text-white/40';

  return (
    <div className={`rounded-2xl border p-4 ${cardBg}`}>
      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        {recState === 'recording' && (
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        <span className={`text-sm font-medium ${textColor}`}>
          {recState === 'idle' ? t.trans_ready : recState === 'recording' ? t.trans_recording : t.trans_paused}
        </span>
      </div>

      {/* Transcript Textarea */}
      <textarea
        value={transcript + (interimText ? (transcript ? ' ' : '') + interimText : '')}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder={t.trans_placeholder}
        rows={4}
        className={`w-full rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500 ${
          isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'
        }`}
      />

      {/* Interim text indicator */}
      {interimText && (
        <p className={`text-xs italic mt-1 ${mutedColor}`}>{interimText}</p>
      )}

      {/* Playback */}
      {audioUrl && recState === 'idle' && (
        <button
          onClick={togglePlayback}
          className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-sm transition-all ${
            isPlaying
              ? 'bg-fuchsia-600 text-white'
              : isLight ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <span className="material-icons text-lg">{isPlaying ? 'pause' : 'play_arrow'}</span>
          {isPlaying ? t.stop : t.trans_listen}
        </button>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2 mt-3">
        {recState === 'idle' ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-fuchsia-500 text-white rounded-xl text-sm font-medium hover:scale-105 transition-transform"
          >
            <span className="material-icons text-lg">mic</span>
            {t.trans_start}
          </button>
        ) : (
          <>
            {recState === 'recording' ? (
              <button onClick={pauseRecording} className="flex items-center gap-1 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl text-sm hover:bg-yellow-500/30 transition-colors">
                <span className="material-icons text-lg">pause</span>
                {t.trans_pause}
              </button>
            ) : (
              <button onClick={resumeRecording} className="flex items-center gap-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30 transition-colors">
                <span className="material-icons text-lg">play_arrow</span>
                {t.trans_resume}
              </button>
            )}

            <button onClick={() => { cleanup(); setRecState('idle'); }} className="flex items-center gap-1 px-3 py-2 bg-white/10 text-white/70 rounded-xl text-sm hover:bg-white/20 transition-colors">
              <span className="material-icons text-lg">stop</span>
              {t.trans_stop}
            </button>

            <button onClick={handleClear} className="flex items-center gap-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-colors">
              <span className="material-icons text-lg">delete</span>
              {t.trans_clear}
            </button>
          </>
        )}

        <div className="flex-1" />

        {(transcript.trim() || recState !== 'idle') && (
          <button
            onClick={handleDone}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:scale-105 transition-transform"
          >
            <span className="material-icons text-lg">check</span>
            {t.trans_done}
          </button>
        )}

        <button onClick={onCancel} className={`px-3 py-2 rounded-xl text-sm ${mutedColor} hover:bg-white/10 transition-colors`}>
          {t.trans_cancel}
        </button>
      </div>
    </div>
  );
};

export default LiveTranscriber;
