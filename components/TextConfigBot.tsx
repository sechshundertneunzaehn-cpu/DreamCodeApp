import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { apiFetch, API_BASE } from '../services/apiConfig';
import type { Language, ThemeMode } from '../types';

// ═══════════════════════════════════════════════════════════════════
// TextConfigBot — kostenloser Text-Chat-Assistent für Video-Config
// Nutzt /api/voice-config/process (Gemini Flash via OpenRouter, kein Coin-Abzug).
// Gleiche Config-Felder wie der Sprachassistent.
// ═══════════════════════════════════════════════════════════════════

interface TextConfigBotProps {
  language: Language;
  themeMode: ThemeMode;
  onClose: () => void;
  onConfigUpdate?: (partial: Record<string, unknown>) => void;
  onComplete?: (finalConfig: Record<string, unknown>) => void;
}

type Role = 'user' | 'bot';
interface Msg { id: number; role: Role; text: string }

type Step = 'persona' | 'stil' | 'stimmung' | 'confirm' | 'done';

// ── Lokalisierte Mikro-Texte ────────────────────────────────────────
const TEXT_STRINGS: Record<string, Record<string, string>> = {
  de: {
    title: 'Text-Assistent', subtitle: 'Kostenlos — per Text einstellen',
    close: 'Schließen', send: 'Senden',
    placeholder: 'Beschreib deinen Traum oder antworte dem Assistenten…',
    first_login: 'Hallo! Damit ich deine Einstellungen beim nächsten Mal wiederfinde, logge dich bitte ein. Trotzdem kannst du jetzt loslegen — frag einfach los oder beschreib deinen Traum.',
    welcome_back: 'Willkommen zurück! Ich habe deine Wünsche noch gespeichert. Soll ich sie dir kurz zeigen, oder möchtest du etwas ändern?',
    first_time: 'Hallo! Das ist unser erstes Gespräch — lass uns deine Wünsche einmal einrichten. Erzähl mir kurz: Video oder Slideshow? Wie alt ist die Hauptperson, und was soll darin passieren?',
    fallback: 'Hallo! Erzähl mir kurz, was dein Traumvideo zeigen soll.',
    err_api: 'Der Assistent antwortet gerade nicht. Bitte nochmal versuchen.',
    err_net: 'Verbindungsproblem. Versuche es nochmal.',
    chip_format: 'Format', chip_age: 'Alter', chip_gender: 'Geschlecht',
    chip_hair: 'Haare', chip_style: 'Stil', chip_mood: 'Stimmung',
    chip_duration: 'Dauer', chip_wishes: 'Wünsche',
  },
  en: {
    title: 'Text Assistant', subtitle: 'Free — set up by text',
    close: 'Close', send: 'Send',
    placeholder: 'Describe your dream or answer the assistant…',
    first_login: 'Hi! So I can find your settings next time, please log in. You can still start now — just ask or describe your dream.',
    welcome_back: 'Welcome back! I still have your wishes saved. Shall I show them, or do you want to change something?',
    first_time: 'Hi! This is our first conversation — let\'s set up your wishes. Tell me briefly: video or slideshow? How old is the main character, and what should happen?',
    fallback: 'Hi! Tell me briefly what your dream video should show.',
    err_api: 'The assistant is not responding. Please try again.',
    err_net: 'Connection issue. Try again.',
    chip_format: 'Format', chip_age: 'Age', chip_gender: 'Gender',
    chip_hair: 'Hair', chip_style: 'Style', chip_mood: 'Mood',
    chip_duration: 'Duration', chip_wishes: 'Wishes',
  },
  tr: {
    title: 'Metin Asistanı', subtitle: 'Ücretsiz — metinle ayarla',
    close: 'Kapat', send: 'Gönder',
    placeholder: 'Rüyanı anlat veya asistana cevap ver…',
    first_login: 'Merhaba! Ayarlarını bir sonraki sefer bulabilmem için lütfen giriş yap. Yine de başlayabilirsin — rüyanı anlat.',
    welcome_back: 'Tekrar hoş geldin! İsteklerini hâlâ kayıtlı tutuyorum. Sana göstereyim mi, yoksa bir şeyi değiştirmek mi istersin?',
    first_time: 'Merhaba! Bu ilk sohbetimiz — birlikte isteklerini kuralım. Kısaca anlat: video mu slayt mı? Ana karakter kaç yaşında ve neler olmalı?',
    fallback: 'Merhaba! Rüya videonda ne olması gerektiğini kısaca anlat.',
    err_api: 'Asistan şu an cevap vermiyor. Lütfen tekrar dene.',
    err_net: 'Bağlantı sorunu. Tekrar dene.',
    chip_format: 'Format', chip_age: 'Yaş', chip_gender: 'Cinsiyet',
    chip_hair: 'Saç', chip_style: 'Stil', chip_mood: 'Ruh hali',
    chip_duration: 'Süre', chip_wishes: 'İstekler',
  },
  es: {
    title: 'Asistente de texto', subtitle: 'Gratis — configura por texto',
    close: 'Cerrar', send: 'Enviar',
    placeholder: 'Describe tu sueño o responde al asistente…',
    first_login: '¡Hola! Inicia sesión para guardar tus ajustes. Aun así puedes empezar — cuéntame tu sueño.',
    welcome_back: '¡Bienvenido de nuevo! Aún tengo tus deseos guardados. ¿Los muestro o quieres cambiar algo?',
    first_time: '¡Hola! Es nuestra primera conversación — configuremos tus deseos. Dime: ¿vídeo o diapositivas? ¿Qué edad tiene el personaje y qué debe pasar?',
    fallback: '¡Hola! Cuéntame qué debería mostrar tu vídeo de sueño.',
    err_api: 'El asistente no responde. Inténtalo de nuevo.',
    err_net: 'Problema de conexión. Inténtalo.',
    chip_format: 'Formato', chip_age: 'Edad', chip_gender: 'Género',
    chip_hair: 'Cabello', chip_style: 'Estilo', chip_mood: 'Ánimo',
    chip_duration: 'Duración', chip_wishes: 'Deseos',
  },
  fr: {
    title: 'Assistant texte', subtitle: 'Gratuit — configurer par texte',
    close: 'Fermer', send: 'Envoyer',
    placeholder: 'Décris ton rêve ou réponds à l\'assistant…',
    first_login: 'Salut ! Connecte-toi pour que je retrouve tes réglages. Tu peux déjà commencer — raconte ton rêve.',
    welcome_back: 'Bon retour ! J\'ai toujours tes souhaits. Je te les montre ou tu veux changer quelque chose ?',
    first_time: 'Salut ! C\'est notre première conversation — paramétrons tes souhaits. Dis-moi : vidéo ou diaporama ? Quel âge a le personnage, que doit-il se passer ?',
    fallback: 'Salut ! Dis-moi brièvement ce que ta vidéo de rêve doit montrer.',
    err_api: 'L\'assistant ne répond pas. Réessaie.',
    err_net: 'Problème de connexion. Réessaie.',
    chip_format: 'Format', chip_age: 'Âge', chip_gender: 'Genre',
    chip_hair: 'Cheveux', chip_style: 'Style', chip_mood: 'Ambiance',
    chip_duration: 'Durée', chip_wishes: 'Souhaits',
  },
  ar: {
    title: 'المساعد النصي', subtitle: 'مجاني — اضبط بالنص',
    close: 'إغلاق', send: 'إرسال',
    placeholder: 'صف حلمك أو أجب المساعد…',
    first_login: 'مرحبا! سجل الدخول لكي أحفظ إعداداتك للمرة القادمة. يمكنك البدء الآن — احكِ حلمك.',
    welcome_back: 'أهلا بعودتك! رغباتك ما زالت محفوظة. هل أعرضها أم تريد تغيير شيء؟',
    first_time: 'مرحبا! هذه محادثتنا الأولى — لنضبط رغباتك. أخبرني بإيجاز: فيديو أم شرائح؟ كم عمر الشخصية، وماذا يجب أن يحدث؟',
    fallback: 'مرحبا! أخبرني بإيجاز ماذا يجب أن يظهر في فيديو حلمك.',
    err_api: 'المساعد لا يرد. حاول مرة أخرى.',
    err_net: 'مشكلة في الاتصال. حاول مجددا.',
    chip_format: 'التنسيق', chip_age: 'العمر', chip_gender: 'الجنس',
    chip_hair: 'الشعر', chip_style: 'الأسلوب', chip_mood: 'المزاج',
    chip_duration: 'المدة', chip_wishes: 'الرغبات',
  },
  ru: {
    title: 'Текстовый ассистент', subtitle: 'Бесплатно — настройка текстом',
    close: 'Закрыть', send: 'Отправить',
    placeholder: 'Опиши свой сон или ответь ассистенту…',
    first_login: 'Привет! Войди, чтобы я запомнил твои настройки. Пока можешь начать — расскажи свой сон.',
    welcome_back: 'С возвращением! Твои пожелания сохранены. Показать их или что-то изменить?',
    first_time: 'Привет! Это наш первый разговор — настроим твои пожелания. Расскажи: видео или слайдшоу? Возраст героя и что должно произойти?',
    fallback: 'Привет! Расскажи кратко, что должно быть в твоём видео мечты.',
    err_api: 'Ассистент не отвечает. Попробуй снова.',
    err_net: 'Проблема соединения. Попробуй снова.',
    chip_format: 'Формат', chip_age: 'Возраст', chip_gender: 'Пол',
    chip_hair: 'Волосы', chip_style: 'Стиль', chip_mood: 'Настроение',
    chip_duration: 'Длительность', chip_wishes: 'Пожелания',
  },
  it: {
    title: 'Assistente testo', subtitle: 'Gratis — configura col testo',
    close: 'Chiudi', send: 'Invia',
    placeholder: 'Descrivi il tuo sogno o rispondi all\'assistente…',
    first_login: 'Ciao! Accedi così salvo i tuoi preferiti. Puoi già iniziare — raccontami il sogno.',
    welcome_back: 'Bentornato! Ho ancora i tuoi desideri. Te li mostro o vuoi cambiare?',
    first_time: 'Ciao! È la nostra prima conversazione — impostiamo i tuoi desideri. Dimmi: video o slideshow? Che età ha il personaggio e cosa deve succedere?',
    fallback: 'Ciao! Dimmi brevemente cosa dovrebbe mostrare il tuo video dei sogni.',
    err_api: 'L\'assistente non risponde. Riprova.',
    err_net: 'Problema di connessione. Riprova.',
    chip_format: 'Formato', chip_age: 'Età', chip_gender: 'Genere',
    chip_hair: 'Capelli', chip_style: 'Stile', chip_mood: 'Umore',
    chip_duration: 'Durata', chip_wishes: 'Desideri',
  },
  pt: {
    title: 'Assistente de texto', subtitle: 'Grátis — configurar por texto',
    close: 'Fechar', send: 'Enviar',
    placeholder: 'Descreva seu sonho ou responda ao assistente…',
    first_login: 'Olá! Faça login para que eu guarde seus ajustes. Pode começar já — conte seu sonho.',
    welcome_back: 'Bem-vindo de volta! Seus desejos ainda estão salvos. Mostro ou quer mudar algo?',
    first_time: 'Olá! É nossa primeira conversa — vamos configurar seus desejos. Diga: vídeo ou slideshow? Que idade tem o personagem e o que deve acontecer?',
    fallback: 'Olá! Conte rapidamente o que seu vídeo de sonho deve mostrar.',
    err_api: 'O assistente não responde. Tente novamente.',
    err_net: 'Problema de conexão. Tente novamente.',
    chip_format: 'Formato', chip_age: 'Idade', chip_gender: 'Gênero',
    chip_hair: 'Cabelo', chip_style: 'Estilo', chip_mood: 'Humor',
    chip_duration: 'Duração', chip_wishes: 'Desejos',
  },
};

function tt(lang: string, key: string): string {
  const short = String(lang || 'de').slice(0, 2).toLowerCase();
  return TEXT_STRINGS[short]?.[key] ?? TEXT_STRINGS.en[key] ?? TEXT_STRINGS.de[key] ?? key;
}

export const TextConfigBot: React.FC<TextConfigBotProps> = ({
  language, themeMode, onClose, onConfigUpdate, onComplete,
}) => {
  const isLight = themeMode === 'light';
  const L = (key: string) => tt(String(language), key);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [step, setStep] = useState<Step>('persona');
  const msgIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Initial: bestehende Config laden + passende Begrüßung
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          addBot(L('first_login'));
          return;
        }
        // Existierende Config abrufen
        try {
          const r = await fetch(`${API_BASE}/api/voice-config/current`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (r.ok) {
            const data = await r.json() as { config?: Record<string, unknown> };
            if (!cancelled && data.config && Object.keys(data.config).length > 0) {
              setConfig(data.config);
              addBot(L('welcome_back'));
              return;
            }
          }
        } catch { /* egal, wir begrüßen einfach so */ }

        if (!cancelled) {
          addBot(L('first_time'));
        }
      } catch {
        if (!cancelled) {
          addBot(L('fallback'));
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const addBot = (text: string) => {
    setMessages(prev => [...prev, { id: ++msgIdRef.current, role: 'bot', text }]);
  };
  const addUser = (text: string) => {
    setMessages(prev => [...prev, { id: ++msgIdRef.current, role: 'user', text }]);
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setError(null);
    addUser(text);
    setBusy(true);
    try {
      const r = await apiFetch('/api/voice-config/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          input: text,
          currentConfig: config,
          language: String(language).slice(0, 2) || 'de',
        }),
      });
      if (!r.ok) {
        setError(L('err_api'));
        return;
      }
      const data = await r.json() as {
        response?: string;
        configUpdate?: Record<string, unknown>;
        nextStep?: string;
      };
      if (data.response) addBot(data.response);

      if (data.configUpdate && Object.keys(data.configUpdate).length > 0) {
        const merged = { ...config, ...data.configUpdate };
        // Persona deep-merge
        if (data.configUpdate.persona && typeof data.configUpdate.persona === 'object') {
          merged.persona = {
            ...(config.persona as Record<string, unknown> | undefined ?? {}),
            ...(data.configUpdate.persona as Record<string, unknown>),
          };
        }
        setConfig(merged);
        onConfigUpdate?.(merged);
      }
      const next = (data.nextStep as Step | undefined) ?? step;
      setStep(next);
      if (next === 'done') {
        // Save via HTTP
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (token) {
            await fetch(`${API_BASE}/api/voice-config/save-http`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ config }),
            });
          }
        } catch { /* nicht blockieren — Editor ist schon gefüllt */ }
        onComplete?.(config);
      }
    } catch {
      setError(L('err_net'));
    } finally {
      setBusy(false);
    }
  }, [input, busy, step, config, language, onConfigUpdate, onComplete]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const cardClass = isLight
    ? 'bg-white/95 border-gray-200 text-gray-900'
    : 'bg-neutral-900/95 border-white/10 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm bg-black/40"
         role="dialog" aria-modal="true" aria-label="Text-Assistent">
      <div className={`w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl ${cardClass} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="material-icons text-white">chat</span>
            </div>
            <div>
              <h2 className="text-base font-bold">{L('title')}</h2>
              <p className="text-xs opacity-70">{L('subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label={L('close')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
            <span className="material-icons text-sm">close</span>
          </button>
        </div>

        {/* Chat */}
        <div ref={scrollRef} className="px-4 py-3 space-y-2 overflow-y-auto flex-1 min-h-[240px]">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                  : isLight ? 'bg-gray-100' : 'bg-white/10'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className={`rounded-2xl px-3 py-2 text-sm ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
                <span className="inline-block animate-pulse">…</span>
              </div>
            </div>
          )}
          {error && (
            <div className="text-center text-xs text-red-500 py-1">{error}</div>
          )}
        </div>

        {/* Config-Chips (live) */}
        {Object.keys(config).length > 0 && (
          <div className="px-4 py-2 border-t border-white/5 flex flex-wrap gap-1">
            {(() => {
              const chips: Array<{ label: string; value: string }> = [];
              const c = config as any;
              if (c.media_type) chips.push({ label: L('chip_format'), value: c.media_type });
              if (c.persona?.age) chips.push({ label: L('chip_age'), value: String(c.persona.age) });
              if (c.persona?.gender) chips.push({ label: L('chip_gender'), value: c.persona.gender });
              if (c.persona?.hair_color) chips.push({ label: L('chip_hair'), value: c.persona.hair_color });
              const prefs = c.video_preferences ?? c.slideshow_preferences;
              if (prefs?.art_style) chips.push({ label: L('chip_style'), value: prefs.art_style });
              if (prefs?.mood) chips.push({ label: L('chip_mood'), value: prefs.mood });
              if (prefs?.duration_seconds) chips.push({ label: L('chip_duration'), value: `${prefs.duration_seconds}s` });
              if (c.custom_wishes) chips.push({ label: L('chip_wishes'), value: String(c.custom_wishes).slice(0, 40) });
              return chips.map((chip, i) => (
                <span key={i} className={`text-xs px-2 py-1 rounded-full ${isLight ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'bg-white/10 text-white/90 border border-white/10'}`}>
                  <span className="opacity-60">{chip.label}:</span> <b>{chip.value}</b>
                </span>
              ));
            })()}
          </div>
        )}

        {/* Footer: Eingabe */}
        <div className="p-3 border-t border-white/5 flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={L('placeholder')}
            rows={1}
            className={`flex-1 rounded-2xl px-3 py-2 text-sm resize-none ${isLight ? 'bg-gray-50 border border-gray-200' : 'bg-white/5 border border-white/10'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
          />
          <button
            onClick={send}
            disabled={busy || !input.trim()}
            className="rounded-2xl px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {L('send')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextConfigBot;
