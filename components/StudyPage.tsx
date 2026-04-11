import React, { useState, useEffect, useRef } from 'react';
import { Language, UserProfile } from '../types';
import { getTheme } from '../theme';
import { supabase } from '../services/supabaseClient';

interface StudyPageProps {
  language: Language;
  onClose: () => void;
  themeMode?: string;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

// ─── Nationalitäten (DE Anzeige) ──────────────────────────────────────────────
const NATIONALITIES_DE = [
  'Deutsch','Österreichisch','Schweizerisch','Amerikanisch','Britisch',
  'Französisch','Spanisch','Italienisch','Portugiesisch','Niederländisch',
  'Belgisch','Schwedisch','Norwegisch','Dänisch','Finnisch','Polnisch',
  'Tschechisch','Ungarisch','Rumänisch','Griechisch','Türkisch','Russisch',
  'Ukrainisch','Weißrussisch','Serbisch','Kroatisch','Slowenisch','Slowakisch',
  'Bulgarisch','Litauisch','Lettisch','Estnisch','Isländisch','Irisch',
  'Schottisch','Walisisch','Japanisch','Chinesisch','Koreanisch','Indisch',
  'Pakistanisch','Bangladeschisch','Indonesisch','Malaysisch','Vietnamesisch',
  'Thailändisch','Philippinisch','Australisch','Neuseeländisch','Kanadisch',
  'Mexikanisch','Brasilianisch','Argentinisch','Kolumbianisch','Chilenisch',
  'Peruanisch','Venezolanisch','Ägyptisch','Marokkanisch','Tunesisch',
  'Algerisch','Nigerianisch','Südafrikanisch','Kenianisch','Ghanaisch',
  'Äthiopisch','Tansanisch','Saudi-Arabisch','Emiratisch','Israelisch',
  'Iranisch','Irakisch','Syrisch','Jordanisch','Libanesisch','Kuwaitisch',
  'Katarisch','Andere',
];

// ─── Übersetzungen ─────────────────────────────────────────────────────────────
const T = {
  header_title: 'Wissenschaftliche Studie',
  header_sub: 'Die größte globale Traumforschungs-Initiative',
  anon_note: 'Jeder Traum in DreamCode fließt automatisch anonym in die Forschung. Mit der offiziellen Teilnahme wirst du namentlich Teil der größten globalen Traumstudie.',
  section_title: 'Je mehr du zur Forschung beiträgst, desto mehr sparst du',
  tier1_name: 'Basis-Teilnahme',
  tier1_discount: '10 %',
  tier1_price: 'Kostenlos',
  tier1_bullets: [
    'Offiziell namentlich in Studie eingetragen',
    'Träume fließen in die Forschung',
    '10 % Rabatt auf alle Coin-Käufe',
    'Kein Selfie nötig',
  ],
  tier2_name: 'Deep Research',
  tier2_discount: '20 %',
  tier2_price: '3,50 € / Monat',
  tier2_price_year: '42 € / Jahr',
  tier2_bullets: [
    'Alles aus Basis-Teilnahme',
    'Mind. 5 Traumeingaben pro Woche',
    'Alle Features freigeschaltet',
    'Kein Gesichtsfoto nötig',
    'Daten pseudonymisiert & DSGVO-konform',
  ],
  tier2_note: 'Dieser minimale Preis dient ausschließlich zur Deckung unserer Grundkosten (API, Server, Infrastruktur). Wir verdienen nichts daran.',
  tier3_name: 'Deep Research + Selfie',
  tier3_discount: '30 %',
  tier3_price: '3,50 € / Monat',
  tier3_price_year: '42 € / Jahr',
  tier3_recommended: 'Empfohlen',
  tier3_bullets: [
    'Alles aus Deep Research',
    'Monatliches Gesichtsfoto für KI-Analyse',
    'Höchster Rabatt — größter Forschungsbeitrag',
    'Pionierforschung: Gesichtszüge & Träume',
  ],
  form_title: 'Registrierung',
  f_firstname: 'Vorname *',
  f_lastname: 'Nachname *',
  f_email: 'E-Mail *',
  f_birthyear: 'Geburtsjahr *',
  f_birthtime: 'Geburtszeit',
  f_birthtime_hint: 'Optional — ermöglicht zusätzliche chronobiologische Forschungserkenntnisse',
  f_birthtime_tooltip: 'Die Geburtszeit kann Aufschlüsse über zirkadiane Rhythmen und Schlafmuster geben.',
  f_gender: 'Geschlecht *',
  f_location: 'Ort',
  f_nationality: 'Nationalität',
  gender_options: ['Männlich', 'Weiblich', 'Divers', 'Keine Angabe'],
  consent_data: 'Ich stimme der Nutzung meiner Traumdaten für wissenschaftliche Zwecke zu.',
  consent_name: 'Mein Name darf in der Studienpublikation erscheinen.',
  consent_face: 'Ich stimme der monatlichen Nutzung meines Gesichtsfotos für die Traumforschung zu.',
  verify_send: 'Code senden',
  verify_resend: 'Neu senden',
  verify_placeholder: '6-stelliger Code',
  verify_checking: 'Prüfe Code…',
  verify_ok: 'E-Mail bestätigt ✓',
  verify_error: 'Falscher Code. Erneut versuchen.',
  verify_sent: 'Code gesendet an ',
  submit_btn: 'An Studie teilnehmen',
  submit_deep: 'Deep Research starten',
  submitting: 'Wird gespeichert…',
  success_title: '🎉 Willkommen in der Studie!',
  success_desc: 'Du bist jetzt offiziell eingetragen. Dein Rabatt ist sofort aktiv.',
  error_duplicate: 'Diese E-Mail ist bereits registriert.',
  error_generic: 'Fehler beim Speichern. Bitte erneut versuchen.',
  location_loading: 'Standort wird ermittelt…',
  cost_title: 'Was kostet was — und warum?',
  cost_intro: 'Die KI-Modelle kosten echtes Geld. Dein Beitrag finanziert Forschung + Entwicklung.',
  cost_items: [
    'Text-Deutung: 2 Coins ≈ 0,04 €',
    'Bild HD: 8 Coins ≈ 0,16 €',
    'Video 30s: 180 Coins ≈ 3,60 €',
    'Live Voice 30 min: 20 Coins ≈ 0,40 €',
  ],
  cost_footer: '1 Coin = 0,02 € · Coins finanzieren KI-Rechenzeit und Traumforschung.',
};

// ─── Reverse Geocoding ────────────────────────────────────────────────────────
async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; nationality: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=de`,
      { headers: { 'Accept-Language': 'de' } }
    );
    const data = await res.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      '';
    const country = data.address?.country || '';
    // Map country → Nationalität
    const countryNatMap: Record<string, string> = {
      'Deutschland': 'Deutsch', 'Österreich': 'Österreichisch', 'Schweiz': 'Schweizerisch',
      'Vereinigte Staaten von Amerika': 'Amerikanisch', 'Vereinigtes Königreich': 'Britisch',
      'Frankreich': 'Französisch', 'Spanien': 'Spanisch', 'Italien': 'Italienisch',
      'Portugal': 'Portugiesisch', 'Niederlande': 'Niederländisch', 'Türkei': 'Türkisch',
      'Russland': 'Russisch', 'Japan': 'Japanisch', 'China': 'Chinesisch',
      'Indien': 'Indisch', 'Australien': 'Australisch', 'Kanada': 'Kanadisch',
      'Brasilien': 'Brasilianisch', 'Ägypten': 'Ägyptisch', 'Marokko': 'Marokkanisch',
      'Saudi-Arabien': 'Saudi-Arabisch', 'Polen': 'Polnisch', 'Schweden': 'Schwedisch',
      'Norwegen': 'Norwegisch', 'Dänemark': 'Dänisch', 'Belgien': 'Belgisch',
      'Griechenland': 'Griechisch', 'Ukraine': 'Ukrainisch', 'Rumänien': 'Rumänisch',
    };
    return { city, nationality: countryNatMap[country] || '' };
  } catch {
    return { city: '', nationality: '' };
  }
}

// ─── E-Mail Verifizierung via Supabase Edge Function / eigener Flow ───────────
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────
const StudyPage: React.FC<StudyPageProps> = ({
  language,
  onClose,
  themeMode,
  userProfile,
  onUpdateProfile,
}) => {
  const th = getTheme(themeMode);
  const isLight = th.isLight;
  const isRtl = [Language.AR, Language.FA, Language.UR].includes(language);

  // Already joined?
  const alreadyJoined = (['basic', 'active', 'deep', 'deep_selfie'] as const).includes(
    userProfile.study_participation_level as string as any
  );
  const currentDiscount = alreadyJoined ? (userProfile.study_discount ?? 0) * 100 : 0;

  // ── Tier selection ──
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | null>(null);

  // ── Form state ──
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [nationality, setNationality] = useState('');
  const [consentData, setConsentData] = useState(false);
  const [consentName, setConsentName] = useState(false);
  const [consentFace, setConsentFace] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // ── Email verification ──
  const [verifyCode, setVerifyCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // ── Submit state ──
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  // ── Geolocation auto-fill ──
  const [locationLoading, setLocationLoading] = useState(false);
  const geoFetched = useRef(false);

  useEffect(() => {
    // Prefill from userProfile if logged in
    if (userProfile?.name) {
      const parts = userProfile.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    if ((userProfile as any)?.email) {
      setEmail((userProfile as any).email);
    }
  }, []);

  useEffect(() => {
    if (selectedTier && !geoFetched.current && !location) {
      geoFetched.current = true;
      setLocationLoading(true);
      navigator.geolocation?.getCurrentPosition(
        async (pos) => {
          const { city, nationality: nat } = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (city) setLocation(city);
          if (nat && !nationality) setNationality(nat);
          setLocationLoading(false);
        },
        () => setLocationLoading(false),
        { timeout: 8000 }
      );
    }
  }, [selectedTier]);

  // ── Send verification code ──
  async function handleSendCode() {
    if (!email || !email.includes('@')) return;
    setVerifyLoading(true);
    setVerifyError('');
    const code = generateCode();
    setSentCode(code);
    try {
      // Use Supabase to send OTP / or custom email via edge function
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { email, code },
      });
      if (error) throw error;
      setCodeSent(true);
    } catch {
      // Fallback: store code locally for demo (in production, always use server-side)
      setCodeSent(true);
    } finally {
      setVerifyLoading(false);
    }
  }

  function handleVerifyCode() {
    setVerifyLoading(true);
    setVerifyError('');
    setTimeout(() => {
      if (verifyInput.trim() === sentCode) {
        setEmailVerified(true);
        setVerifyError('');
      } else {
        setVerifyError(T.verify_error);
      }
      setVerifyLoading(false);
    }, 600);
  }

  // ── Submit ──
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.includes('@') &&
    emailVerified &&
    birthYear.length === 4 &&
    gender &&
    consentData &&
    (selectedTier !== 3 || consentFace);

  async function handleSubmit() {
    if (!canSubmit || !selectedTier) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      // Check duplicate email
      const { data: existing } = await supabase
        .from('research_participants')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      if (existing) {
        setSubmitError(T.error_duplicate);
        setSubmitting(false);
        return;
      }
      // Insert
      const { error } = await supabase.from('research_participants').insert({
        vorname: firstName.trim(),
        nachname: lastName.trim(),
        email: email.toLowerCase().trim(),
        geburtsjahr: parseInt(birthYear),
        geburtszeit: birthTime || null,
        geschlecht: gender,
        ort: location.trim() || null,
        nationalitaet: nationality || null,
        stufe: selectedTier,
        selfie_consent: selectedTier === 3,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;

      // Update local profile
      const discountMap = { 1: 0.10, 2: 0.20, 3: 0.30 };
      const levelMap = { 1: 'basic', 2: 'deep', 3: 'deep_selfie' } as const;
      onUpdateProfile({
        ...userProfile,
        study_participation_level: levelMap[selectedTier] as any,
        study_discount: discountMap[selectedTier],
      });
      setSuccess(true);
    } catch {
      setSubmitError(T.error_generic);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Styling helpers ──
  const bg = isLight ? 'bg-slate-50' : 'bg-[#0f0b1a]';
  const card = isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10';
  const text = isLight ? 'text-slate-800' : 'text-slate-100';
  const textSub = isLight ? 'text-slate-500' : 'text-slate-400';
  const inputCls = isLight
    ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-violet-500'
    : 'bg-white/5 border-white/10 text-slate-100 placeholder-slate-500 focus:border-violet-500';

  const tierBorder = (tier: 1 | 2 | 3) => {
    const sel = selectedTier === tier;
    if (tier === 1) return sel
      ? 'border-violet-500 bg-violet-500/10 shadow-md shadow-violet-500/10'
      : 'border-white/10 hover:border-white/20';
    if (tier === 2) return sel
      ? 'border-violet-400 bg-violet-500/15 shadow-lg shadow-violet-500/20'
      : 'border-violet-500/30 hover:border-violet-400/60';
    // tier 3
    return sel
      ? 'border-amber-400 bg-amber-500/10 shadow-xl shadow-amber-500/30 ring-1 ring-amber-400/30'
      : 'border-amber-500/40 hover:border-amber-400/70 shadow-lg shadow-amber-500/10';
  };

  const Checkbox = ({ val, setter, label, amber = false }: {
    val: boolean; setter: (v: boolean) => void; label: string; amber?: boolean;
  }) => (
    <label className="flex items-start gap-3 cursor-pointer">
      <div
        onClick={() => setter(!val)}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
          val
            ? amber ? 'bg-amber-500 border-amber-500' : 'bg-violet-600 border-violet-600'
            : isLight ? 'border-slate-300' : 'border-white/20'
        }`}
      >
        {val && <span className="material-icons text-white text-sm">check</span>}
      </div>
      <span className={`text-xs leading-relaxed ${amber ? 'text-amber-300/80' : textSub}`}>{label}</span>
    </label>
  );

  // ─── SUCCESS STATE ─────────────────────────────────────────────────────────
  if (success || alreadyJoined) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className={`fixed inset-0 z-50 overflow-y-auto ${bg}`}>
        <div className={`sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b ${isLight ? 'bg-white/90 border-slate-200' : 'bg-[#0f0b1a]/90 border-white/10'} backdrop-blur-md`}>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300'}`}>
            <span className="material-icons text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className={`font-bold text-base ${text}`}>{T.header_title}</h1>
            <p className={`text-xs ${textSub}`}>{T.header_sub}</p>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-10 flex flex-col items-center gap-4 text-center">
          <div className="text-5xl mb-2">📊</div>
          <h2 className={`font-bold text-xl ${text}`}>{T.success_title}</h2>
          <p className={`text-sm ${textSub}`}>{T.success_desc}</p>
          <div className="flex items-center justify-between w-full p-4 rounded-xl bg-green-500/10 border border-green-500/20 mt-2">
            <span className={`text-sm font-semibold ${text}`}>Dein Studienrabatt</span>
            <span className="text-green-400 font-bold text-2xl">{alreadyJoined ? currentDiscount : (selectedTier === 3 ? 30 : selectedTier === 2 ? 20 : 10)}%</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN RENDER ───────────────────────────────────────────────────────────
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={`fixed inset-0 z-50 overflow-y-auto ${bg}`}>

      {/* Header */}
      <div className={`sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b ${isLight ? 'bg-white/90 border-slate-200' : 'bg-[#0f0b1a]/90 border-white/10'} backdrop-blur-md`}>
        <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300'}`}>
          <span className="material-icons text-xl">arrow_back</span>
        </button>
        <div>
          <h1 className={`font-bold text-base ${text}`}>{T.header_title}</h1>
          <p className={`text-xs ${textSub}`}>{T.header_sub}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">

        {/* Anon Note */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-violet-500/20 bg-violet-900/20">
          <span className="material-icons text-violet-400 mt-0.5 text-xl shrink-0">science</span>
          <p className="text-violet-200 text-sm leading-relaxed">{T.anon_note}</p>
        </div>

        {/* Section title */}
        <h2 className={`text-center font-bold text-base ${text}`}>{T.section_title}</h2>

        {/* ── 3 TIER CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* TIER 1 */}
          <button
            onClick={() => setSelectedTier(1)}
            className={`p-4 rounded-xl border text-left transition-all ${tierBorder(1)}`}
          >
            <div className={`text-xs font-bold mb-1 ${selectedTier === 1 ? 'text-violet-400' : textSub}`}>{T.tier1_name}</div>
            <div className="text-green-400 font-bold text-2xl leading-none mb-1">{T.tier1_discount}</div>
            <div className={`text-[11px] text-green-400/80 mb-2`}>Rabatt</div>
            <div className={`text-xs font-semibold ${text} mb-2`}>{T.tier1_price}</div>
            <div className="space-y-1">
              {T.tier1_bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-violet-400 text-[10px] mt-0.5 shrink-0">✓</span>
                  <span className={`text-[11px] leading-tight ${textSub}`}>{b}</span>
                </div>
              ))}
            </div>
          </button>

          {/* TIER 2 */}
          <button
            onClick={() => setSelectedTier(2)}
            className={`p-4 rounded-xl border text-left transition-all ${tierBorder(2)}`}
          >
            <div className={`text-xs font-bold mb-1 ${selectedTier === 2 ? 'text-violet-300' : 'text-violet-400'}`}>{T.tier2_name}</div>
            <div className="text-green-400 font-bold text-2xl leading-none mb-1">{T.tier2_discount}</div>
            <div className={`text-[11px] text-green-400/80 mb-2`}>Rabatt</div>
            <div className={`text-xs font-semibold ${text}`}>{T.tier2_price}</div>
            <div className={`text-[10px] ${textSub} mb-2`}>{T.tier2_price_year}</div>
            <div className="space-y-1">
              {T.tier2_bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-violet-300 text-[10px] mt-0.5 shrink-0">✓</span>
                  <span className={`text-[11px] leading-tight ${textSub}`}>{b}</span>
                </div>
              ))}
            </div>
            <p className={`mt-3 text-[10px] italic ${textSub} border-t border-white/5 pt-2`}>{T.tier2_note}</p>
          </button>

          {/* TIER 3 — Empfohlen */}
          <button
            onClick={() => setSelectedTier(3)}
            className={`p-4 rounded-xl border text-left transition-all relative ${tierBorder(3)}`}
          >
            {/* Glow animation overlay */}
            {selectedTier === 3 && (
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ boxShadow: '0 0 20px 3px rgba(251,191,36,0.25)', animation: 'pulse 2s ease-in-out infinite' }} />
            )}
            {/* Empfohlen badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-[10px] font-bold shadow-md whitespace-nowrap">
              ⭐ {T.tier3_recommended}
            </div>
            <div className="text-amber-400 text-xs font-bold mb-1 mt-1">{T.tier3_name}</div>
            <div className="text-green-400 font-bold text-2xl leading-none mb-1">{T.tier3_discount}</div>
            <div className={`text-[11px] text-green-400/80 mb-2`}>Rabatt</div>
            <div className={`text-xs font-semibold ${text}`}>{T.tier3_price}</div>
            <div className={`text-[10px] ${textSub} mb-2`}>{T.tier3_price_year}</div>
            <div className="space-y-1">
              {T.tier3_bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 text-[10px] mt-0.5 shrink-0">✦</span>
                  <span className={`text-[11px] leading-tight ${textSub}`}>{b}</span>
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* ── FORM (erscheint nach Tier-Auswahl) ── */}
        {selectedTier && (
          <div className={`rounded-xl border p-5 space-y-4 ${
            selectedTier === 3
              ? 'border-amber-500/30 bg-amber-500/5'
              : selectedTier === 2
              ? 'border-violet-500/30 bg-violet-500/5'
              : card
          }`}>
            <h3 className={`font-bold text-sm ${text}`}>{T.form_title} — Stufe {selectedTier}</h3>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <input value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder={T.f_firstname}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
              <input value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder={T.f_lastname}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
            </div>

            {/* Email + Verification */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input value={email} onChange={e => { setEmail(e.target.value); setEmailVerified(false); setCodeSent(false); }}
                    placeholder={T.f_email} type="email"
                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls} ${emailVerified ? 'border-green-500' : ''}`} />
                  {emailVerified && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">✓</span>
                  )}
                </div>
                {!emailVerified && (
                  <button
                    onClick={codeSent ? () => { setCodeSent(false); handleSendCode(); } : handleSendCode}
                    disabled={!email.includes('@') || verifyLoading}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 whitespace-nowrap transition-colors"
                  >
                    {verifyLoading ? '…' : codeSent ? T.verify_resend : T.verify_send}
                  </button>
                )}
              </div>
              {emailVerified && (
                <p className="text-green-400 text-xs">{T.verify_ok}</p>
              )}
              {codeSent && !emailVerified && (
                <div className="space-y-1">
                  <p className={`text-xs ${textSub}`}>{T.verify_sent}{email}</p>
                  <div className="flex gap-2">
                    <input value={verifyInput} onChange={e => setVerifyInput(e.target.value)}
                      placeholder={T.verify_placeholder} maxLength={6}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
                    <button onClick={handleVerifyCode} disabled={verifyInput.length !== 6 || verifyLoading}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 transition-colors">
                      {verifyLoading ? '…' : 'OK'}
                    </button>
                  </div>
                  {verifyError && <p className="text-red-400 text-xs">{verifyError}</p>}
                </div>
              )}
            </div>

            {/* Geburtsjahr + Geschlecht */}
            <div className="grid grid-cols-2 gap-3">
              <input value={birthYear} onChange={e => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={T.f_birthyear} maxLength={4}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
              <select value={gender} onChange={e => setGender(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`}>
                <option value="">{T.f_gender}</option>
                {T.gender_options.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Geburtszeit (optional) */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs ${textSub}`}>{T.f_birthtime}</span>
                <span className={`text-[10px] ${textSub} italic`}>— {T.f_birthtime_hint}</span>
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="material-icons text-slate-500 text-sm cursor-help">info</button>
                  {showTooltip && (
                    <div className="absolute bottom-6 left-0 w-48 p-2 rounded-lg bg-slate-800 border border-white/10 text-[10px] text-slate-300 z-10 shadow-xl leading-relaxed">
                      {T.f_birthtime_tooltip}
                    </div>
                  )}
                </div>
              </div>
              <input value={birthTime} onChange={e => setBirthTime(e.target.value)}
                type="time"
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
            </div>

            {/* Ort + Nationalität */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder={locationLoading ? T.location_loading : T.f_location}
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
                {locationLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-icons text-violet-400 text-sm animate-spin">refresh</span>
                )}
              </div>
              <select value={nationality} onChange={e => setNationality(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`}>
                <option value="">{T.f_nationality}</option>
                {NATIONALITIES_DE.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-1">
              <Checkbox val={consentData} setter={setConsentData} label={T.consent_data} />
              <Checkbox val={consentName} setter={setConsentName} label={T.consent_name} />
              {selectedTier === 3 && (
                <Checkbox val={consentFace} setter={setConsentFace} label={T.consent_face} amber />
              )}
            </div>

            {submitError && (
              <p className="text-red-400 text-xs">{submitError}</p>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                canSubmit && !submitting
                  ? selectedTier === 3
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:opacity-90 shadow-lg shadow-amber-500/20'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20'
                  : isLight ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              {submitting ? T.submitting : selectedTier === 1 ? T.submit_btn : T.submit_deep}
            </button>

            {/* Email verification hint */}
            {!emailVerified && (
              <p className={`text-center text-[11px] ${textSub}`}>
                {T.verify_send + ' erforderlich bevor Teilnahme abgeschlossen werden kann'}
              </p>
            )}
          </div>
        )}

        {/* Cost Transparency */}
        <div className={`rounded-xl border p-5 ${card}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons text-amber-400 text-xl">info</span>
            <h2 className={`font-bold text-base ${text}`}>{T.cost_title}</h2>
          </div>
          <p className={`text-xs mb-4 ${textSub}`}>{T.cost_intro}</p>
          <div className="space-y-2 mb-4">
            {T.cost_items.map((line, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${textSub}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                {line}
              </div>
            ))}
          </div>
          <p className={`text-[11px] ${textSub} italic border-t pt-3 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
            {T.cost_footer}
          </p>
        </div>

      </div>
    </div>
  );
};

export default StudyPage;
