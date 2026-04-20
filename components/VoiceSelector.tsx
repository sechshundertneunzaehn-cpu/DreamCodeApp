import React, { useState } from 'react';
import { Language } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VoiceCharacter {
    id: string;
    name: string;
    gender: 'female' | 'male';
    voiceSuffix: string; // e.g. 'Achernar' -> appended to lang prefix 'de-DE-Chirp3-HD-'
    icon: string;        // material icon name
    descriptions: Record<string, string>; // per language
}

interface VoiceSelectorProps {
    mode: 'firstTime' | 'settings';
    language: string;
    currentVoiceId?: string;
    onSelect: (character: VoiceCharacter) => void;
    onClose?: () => void;
    isLight?: boolean;
}

// ---------------------------------------------------------------------------
// Voice characters data
// ---------------------------------------------------------------------------

export const VOICE_CHARACTERS: VoiceCharacter[] = [
    // ---- FEMALE ----
    {
        id: 'luna',
        name: 'Luna',
        gender: 'female',
        voiceSuffix: 'Achernar',
        icon: 'auto_awesome',
        descriptions: {
            de: 'Mystisch & Sanft – warme, geheimnisvolle Orakelstimme',
            tr: 'Gizemli & Nazik – sicak, esrarengiz kahin sesi',
            en: 'Mystical & Gentle – warm, mysterious oracle voice',
            es: 'Mistica & Suave – voz oraculo calida y misteriosa',
            fr: 'Mystique & Douce – voix oracle chaude et mysterieuse',
            ar: 'Ghaamida & Latiifa \u2013 sawt kahin daafi wa ghaamiD',
            pt: 'Mistico & Suave – voz oraculo quente e misteriosa',
            ru: 'Mистична & Нежна – тёплый, загадочный голос оракула',
            zh: '神秘而温柔 – 温暖、神秘的神谕之声',
            hi: 'रहस्यमय और कोमल – गर्म, रहस्यमयी भविष्यवाणी की आवाज़',
            ja: '神秘的で優しい – 温かく神秘的なオラクルの声',
            ko: '신비롭고 부드러운 – 따뜻하고 신비로운 오라클 음성',
            id: 'Mistis & Lembut – suara oracle hangat dan misterius',
            fa: 'اسرارآمیز و مهربان – صدای پیشگوی گرم و رازآلود',
            it: 'Mistica & Dolce – voce oracolare calda e misteriosa',
            pl: 'Mistyczna & Łagodna – ciepły, tajemniczy głos wyroczni',
            bn: 'রহস্যময় ও কোমল – উষ্ণ, রহস্যময় ওরাকলের কণ্ঠ',
            ur: 'پراسرار اور نرم – گرم، پراسرار اوریکل کی آواز',
            vi: 'Huyền bí & Dịu dàng – giọng tiên tri ấm áp, bí ẩn',
            th: 'ลึกลับและอ่อนโยน – เสียงพยากรณ์อบอุ่นและลึกลับ',
            sw: 'Fumbo & Laini – sauti ya oracle yenye joto na siri',
            hu: 'Misztikus és Lágy – meleg, titokzatos jósnő hangja',
        },
    },
    {
        id: 'aria',
        name: 'Aria',
        gender: 'female',
        voiceSuffix: 'Aoede',
        icon: 'psychology',
        descriptions: {
            de: 'Klar & Weise – kluge, ruhige Beraterstimme',
            tr: 'Net & Bilge – akilli, sakin danisman sesi',
            en: 'Clear & Wise – intelligent, calm counselor voice',
            es: 'Clara & Sabia – voz consejera inteligente y tranquila',
            fr: 'Claire & Sage – voix de conseillere intelligente et calme',
            ar: 'WaaDiHa & Haakiima \u2013 sawt mustashaar dhakiy wa haadi',
            pt: 'Clara & Sabia – voz conselheira inteligente e calma',
            ru: 'Ясная & Мудрая – умный, спокойный голос советника',
            zh: '清晰而智慧 – 聪慧、沉稳的顾问之声',
            hi: 'स्पष्ट और बुद्धिमान – समझदार, शांत सलाहकार की आवाज़',
            ja: '明晰で賢い – 知的で穏やかなカウンセラーの声',
            ko: '맑고 지혜로운 – 지적이고 차분한 상담사 음성',
            id: 'Jernih & Bijaksana – suara penasihat cerdas dan tenang',
            fa: 'شفاف و خردمند – صدای مشاور هوشمند و آرام',
            it: 'Chiara & Saggia – voce di consigliera intelligente e calma',
            pl: 'Jasna & Mądra – inteligentny, spokojny głos doradcy',
            bn: 'স্পষ্ট ও প্রজ্ঞাময় – বুদ্ধিমান, শান্ত উপদেষ্টার কণ্ঠ',
            ur: 'واضح اور دانا – ذہین، پرسکون مشیر کی آواز',
            vi: 'Rõ ràng & Thông thái – giọng cố vấn thông minh, điềm tĩnh',
            th: 'ชัดเจนและเฉลียวฉลาด – เสียงที่ปรึกษาที่ฉลาดและสงบ',
            sw: 'Wazi & Mwenye Hekima – sauti ya mshauri mwerevu na mtulivu',
            hu: 'Tiszta és Bölcs – intelligens, nyugodt tanácsadó hang',
        },
    },
    {
        id: 'nova',
        name: 'Nova',
        gender: 'female',
        voiceSuffix: 'Leda',
        icon: 'bolt',
        descriptions: {
            de: 'Energisch & Jung – lebhafte, begeisterte Stimme',
            tr: 'Enerjik & Genc – canli, heyecanli ses',
            en: 'Energetic & Youthful – lively, enthusiastic voice',
            es: 'Energica & Joven – voz vivaz y entusiasta',
            fr: 'Energique & Jeune – voix vive et enthousiaste',
            ar: 'Nashiita & Shabaabiyya – sawt hayy wa mutaHamis',
            pt: 'Energica & Jovem – voz vivaz e entusiasmada',
            ru: 'Энергичная & Юная – живой, полный энтузиазма голос',
            zh: '活力而青春 – 活泼、热情的声音',
            hi: 'ऊर्जावान और युवा – जीवंत, उत्साही आवाज़',
            ja: 'エネルギッシュで若々しい – 活気あふれる情熱的な声',
            ko: '활기차고 젊은 – 생기 넘치고 열정적인 음성',
            id: 'Energik & Muda – suara hidup dan antusias',
            fa: 'پرانرژی و جوان – صدای سرزنده و پرشور',
            it: 'Energica & Giovane – voce vivace ed entusiasta',
            pl: 'Energiczna & Młoda – żywy, entuzjastyczny głos',
            bn: 'উদ্যমী ও তরুণ – প্রাণবন্ত, উৎসাহী কণ্ঠ',
            ur: 'توانائی بھرپور اور نوجوان – جاندار، پُرجوش آواز',
            vi: 'Năng động & Trẻ trung – giọng nói sôi nổi, nhiệt huyết',
            th: 'กระฉับกระเฉงและเยาว์วัย – เสียงมีชีวิตชีวาและกระตือรือร้น',
            sw: 'Changamfu & Kijana – sauti hai na yenye shauku',
            hu: 'Energikus és Fiatalos – élénk, lelkes hang',
        },
    },
    // ---- MALE ----
    {
        id: 'orion',
        name: 'Orion',
        gender: 'male',
        voiceSuffix: 'Achird',
        icon: 'nights_stay',
        descriptions: {
            de: 'Tief & Ruhig – ruhige, tiefe Orakelstimme',
            tr: 'Derin & Sakin – sakin, derin kahin sesi',
            en: 'Deep & Calm – serene, deep oracle voice',
            es: 'Profundo & Tranquilo – voz oraculo serena y profunda',
            fr: 'Profond & Calme – voix oracle sereine et profonde',
            ar: 'Amiiq & Haadi \u2013 sawt kahin haadi wa amiiq',
            pt: 'Profundo & Calmo – voz oraculo serena e profunda',
            ru: 'Глубокий & Спокойный – безмятежный, глубокий голос оракула',
            zh: '深沉而平静 – 宁静、深邃的神谕之声',
            hi: 'गहरी और शांत – शांत, गहरी भविष्यवाणी की आवाज़',
            ja: '深く穏やか – 静かで深いオラクルの声',
            ko: '깊고 차분한 – 고요하고 깊은 오라클 음성',
            id: 'Dalam & Tenang – suara oracle yang tenang dan dalam',
            fa: 'عمیق و آرام – صدای پیشگوی آرام و عمیق',
            it: 'Profondo & Calmo – voce oracolare serena e profonda',
            pl: 'Głęboki & Spokojny – pogodny, głęboki głos wyroczni',
            bn: 'গভীর ও শান্ত – প্রশান্ত, গভীর ওরাকলের কণ্ঠ',
            ur: 'گہری اور پرسکون – پُرامن، گہری اوریکل کی آواز',
            vi: 'Trầm ấm & Bình thản – giọng tiên tri sâu lắng, thanh thản',
            th: 'ลึกและสงบ – เสียงพยากรณ์ที่สงบและลึกซึ้ง',
            sw: 'Nzito & Tulivu – sauti ya oracle yenye utulivu na kina',
            hu: 'Mély és Nyugodt – higgadt, mély jóslat hang',
        },
    },
    {
        id: 'atlas',
        name: 'Atlas',
        gender: 'male',
        voiceSuffix: 'Charon',
        icon: 'explore',
        descriptions: {
            de: 'Stark & Weise – kraftvolle, weise Stimme',
            tr: 'Guclu & Bilge – guclu, bilge ses',
            en: 'Strong & Wise – powerful, wise voice',
            es: 'Fuerte & Sabio – voz poderosa y sabia',
            fr: 'Fort & Sage – voix puissante et sage',
            ar: 'Qawiy & Haakiim – sawt qawiy wa Haakiim',
            pt: 'Forte & Sabio – voz poderosa e sabia',
            ru: 'Сильный & Мудрый – мощный, мудрый голос',
            zh: '强大而智慧 – 有力量、充满智慧的声音',
            hi: 'शक्तिशाली और बुद्धिमान – ताकतवर, बुद्धिमान आवाज़',
            ja: '力強く賢い – パワフルで知恵ある声',
            ko: '강하고 지혜로운 – 힘 있고 지혜로운 음성',
            id: 'Kuat & Bijaksana – suara kuat dan penuh hikmah',
            fa: 'قوی و خردمند – صدای قدرتمند و حکیمانه',
            it: 'Forte & Saggio – voce potente e saggia',
            pl: 'Silny & Mądry – potężny, mądry głos',
            bn: 'শক্তিশালী ও প্রজ্ঞাবান – শক্তিশালী, জ্ঞানী কণ্ঠ',
            ur: 'طاقتور اور دانا – طاقتور، دانشمند آواز',
            vi: 'Mạnh mẽ & Thông thái – giọng nói đầy sức mạnh và trí tuệ',
            th: 'แข็งแกร่งและเฉลียวฉลาด – เสียงที่ทรงพลังและเปี่ยมปัญญา',
            sw: 'Hodari & Mwenye Hekima – sauti yenye nguvu na hekima',
            hu: 'Erős és Bölcs – erőteljes, bölcs hang',
        },
    },
    {
        id: 'zephyr',
        name: 'Zephyr',
        gender: 'male',
        voiceSuffix: 'Orus',
        icon: 'air',
        descriptions: {
            de: 'Sanft & Meditativ – ruhige, meditative Stimme',
            tr: 'Nazik & Meditatif – sakin, meditatif ses',
            en: 'Gentle & Meditative – calm, meditative voice',
            es: 'Suave & Meditativo – voz tranquila y meditativa',
            fr: 'Doux & Meditatif – voix calme et meditative',
            ar: 'LaTiif & Taammuli \u2013 sawt haadi wa taammuli',
            pt: 'Suave & Meditativo – voz calma e meditativa',
            ru: 'Мягкий & Медитативный – спокойный, медитативный голос',
            zh: '温柔而冥想 – 平静、冥想般的声音',
            hi: 'कोमल और ध्यानपूर्ण – शांत, ध्यानमग्न आवाज़',
            ja: '穏やかで瞑想的 – 静かで瞑想的な声',
            ko: '부드럽고 명상적인 – 차분하고 명상적인 음성',
            id: 'Lembut & Meditatif – suara tenang dan meditatif',
            fa: 'ملایم و مراقبه‌ای – صدای آرام و تأملی',
            it: 'Dolce & Meditativo – voce calma e meditativa',
            pl: 'Łagodny & Medytacyjny – spokojny, medytacyjny głos',
            bn: 'কোমল ও ধ্যানমগ্ন – শান্ত, ধ্যানমগ্ন কণ্ঠ',
            ur: 'نرم اور مراقبہ جیسی – پرسکون، مراقبہ جیسی آواز',
            vi: 'Nhẹ nhàng & Thiền định – giọng nói bình tĩnh, thiền định',
            th: 'อ่อนโยนและสมาธิ – เสียงที่สงบและเหมือนทำสมาธิ',
            sw: 'Laini & Tafakuri – sauti tulivu na ya kutafakari',
            hu: 'Lágy és Meditatív – nyugodt, meditatív hang',
        },
    },
];

// ---------------------------------------------------------------------------
// UI translations
// ---------------------------------------------------------------------------

const UI_TRANSLATIONS: Record<string, {
    title: string;
    male: string;
    female: string;
    confirm: string;
}> = {
    de: { title: 'Waehle die Stimme deines Orakels', male: 'Maennlich', female: 'Weiblich', confirm: 'Bestaetigen' },
    tr: { title: 'Kahininin Sesini Sec', male: 'Erkek', female: 'Kadin', confirm: 'Onayla' },
    en: { title: 'Choose your Oracle\'s voice', male: 'Male', female: 'Female', confirm: 'Confirm' },
    es: { title: 'Elige la voz de tu Oraculo', male: 'Masculino', female: 'Femenino', confirm: 'Confirmar' },
    fr: { title: 'Choisissez la voix de votre Oracle', male: 'Masculin', female: 'Feminin', confirm: 'Confirmer' },
    ar: { title: 'Ikhtaar Sawt Kahinak', male: 'Dhakar', female: 'Untha', confirm: 'Takiid' },
    pt: { title: 'Escolha a voz do seu Oraculo', male: 'Masculino', female: 'Feminino', confirm: 'Confirmar' },
    ru: { title: 'Выберите голос своего Оракула', male: 'Мужской', female: 'Женский', confirm: 'Подтвердить' },
    zh: { title: '选择你的神谕之声', male: '男声', female: '女声', confirm: '确认' },
    hi: { title: 'अपने ओरेकल की आवाज़ चुनें', male: 'पुरुष', female: 'महिला', confirm: 'पुष्टि करें' },
    ja: { title: 'オラクルの声を選んでください', male: '男性', female: '女性', confirm: '確認' },
    ko: { title: '오라클의 목소리를 선택하세요', male: '남성', female: '여성', confirm: '확인' },
    id: { title: 'Pilih suara Oracle-mu', male: 'Pria', female: 'Wanita', confirm: 'Konfirmasi' },
    fa: { title: 'صدای پیشگوی خود را انتخاب کنید', male: 'مرد', female: 'زن', confirm: 'تأیید' },
    it: { title: 'Scegli la voce del tuo Oracolo', male: 'Maschile', female: 'Femminile', confirm: 'Conferma' },
    pl: { title: 'Wybierz głos swojej Wyroczni', male: 'Męski', female: 'Żeński', confirm: 'Potwierdź' },
    bn: { title: 'আপনার ওরাকলের কণ্ঠ বেছে নিন', male: 'পুরুষ', female: 'মহিলা', confirm: 'নিশ্চিত করুন' },
    ur: { title: 'اپنے اوریکل کی آواز چنیں', male: 'مرد', female: 'عورت', confirm: 'تصدیق کریں' },
    vi: { title: 'Chọn giọng nói của Nhà tiên tri', male: 'Nam', female: 'Nữ', confirm: 'Xác nhận' },
    th: { title: 'เลือกเสียงของนักพยากรณ์ของคุณ', male: 'ชาย', female: 'หญิง', confirm: 'ยืนยัน' },
    sw: { title: 'Chagua sauti ya Oracle wako', male: 'Kiume', female: 'Kike', confirm: 'Thibitisha' },
    hu: { title: 'Válaszd ki az Orákulumod hangját', male: 'Férfi', female: 'Nő', confirm: 'Megerősítés' },
};

function getUiText(language: string) {
    return UI_TRANSLATIONS[language] ?? UI_TRANSLATIONS['en'];
}

// ---------------------------------------------------------------------------
// Helper: get description for a character in current language
// ---------------------------------------------------------------------------

function getDesc(character: VoiceCharacter, language: string): string {
    return character.descriptions[language] ?? character.descriptions['en'] ?? '';
}

// ---------------------------------------------------------------------------
// VoiceCard – shared between both modes
// ---------------------------------------------------------------------------

interface VoiceCardProps {
    character: VoiceCharacter;
    isSelected: boolean;
    language: string;
    compact?: boolean;
    isLight?: boolean;
    onClick: () => void;
}

const VoiceCard: React.FC<VoiceCardProps> = ({ character, isSelected, language, compact, isLight, onClick }) => {
    const baseRing = isSelected
        ? isLight
            ? 'ring-2 ring-accent-primary shadow-mystic'
            : 'ring-2 ring-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.55)]'
        : isLight
            ? 'ring-1 ring-mystic-border hover:ring-accent-primary/50'
            : 'ring-1 ring-white/10 hover:ring-purple-400/50';

    const cardBg = isLight ? 'bg-white/70 hover:bg-white/90' : 'bg-white/5';
    const iconColor = isLight ? 'text-accent-primary' : 'text-purple-300';
    const nameColor = isLight ? 'text-mystic-text' : 'text-white';
    const descColor = isLight ? 'text-mystic-text-secondary' : 'text-white/60';

    if (compact) {
        return (
            <button
                onClick={onClick}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-3 rounded-xl min-w-[60px] min-h-[64px]
                    ${cardBg} transition-all duration-200 cursor-pointer active:scale-95 ${baseRing}`}
            >
                <span className={`material-icons text-2xl ${iconColor}`}>{character.icon}</span>
                <span className={`text-xs font-medium ${nameColor} whitespace-nowrap`}>{character.name}</span>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl w-full text-center
                ${cardBg} transition-all duration-200 cursor-pointer ${baseRing}`}
        >
            <span className={`material-icons text-4xl ${iconColor}`}>{character.icon}</span>
            <span className={`text-base font-semibold ${nameColor}`}>{character.name}</span>
            <span className={`text-xs ${descColor} leading-snug line-clamp-2`}>
                {getDesc(character, language)}
            </span>
        </button>
    );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
    mode,
    language,
    currentVoiceId,
    onSelect,
    onClose,
    isLight,
}) => {
    const [selected, setSelected] = useState<string>(
        currentVoiceId ?? VOICE_CHARACTERS[0].id
    );

    const ui = getUiText(language);

    const females = VOICE_CHARACTERS.filter(v => v.gender === 'female');
    const males   = VOICE_CHARACTERS.filter(v => v.gender === 'male');

    const handleConfirm = () => {
        const character = VOICE_CHARACTERS.find(v => v.id === selected);
        if (character) {
            onSelect(character);
            onClose?.();
        }
    };

    // -----------------------------------------------------------------------
    // SETTINGS mode – two rows: female + male
    // -----------------------------------------------------------------------
    if (mode === 'settings') {
        return (
            <div className="space-y-3">
                <div>
                    <span className={`text-[10px] uppercase tracking-widest font-medium mb-1.5 block ${isLight ? 'text-fuchsia-600' : 'text-fuchsia-400'}`}>
                        {ui.female}
                    </span>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        {females.map(character => (
                            <VoiceCard
                                key={character.id}
                                character={character}
                                isSelected={selected === character.id}
                                language={language}
                                isLight={isLight}
                                compact
                                onClick={() => {
                                    setSelected(character.id);
                                    onSelect(character);
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <span className={`text-[10px] uppercase tracking-widest font-medium mb-1.5 block ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                        {ui.male}
                    </span>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        {males.map(character => (
                            <VoiceCard
                                key={character.id}
                                character={character}
                                isSelected={selected === character.id}
                                language={language}
                                isLight={isLight}
                                compact
                                onClick={() => {
                                    setSelected(character.id);
                                    onSelect(character);
                                }}
                            />
                        ))}
                    </div>
                </div>
                {/* Selected voice description */}
                {(() => {
                    const sel = VOICE_CHARACTERS.find(v => v.id === selected);
                    if (!sel) return null;
                    return (
                        <div className={`mt-3 px-3 py-2.5 rounded-xl ${isLight ? 'bg-purple-50 border border-purple-200' : 'bg-white/5 border border-white/10'}`}>
                            <div className="flex items-center gap-2">
                                <span className={`material-icons text-lg ${isLight ? 'text-purple-500' : 'text-purple-400'}`}>{sel.icon}</span>
                                <span className={`text-sm font-bold ${isLight ? 'text-purple-900' : 'text-white'}`}>{sel.name}</span>
                            </div>
                            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-purple-700' : 'text-white/60'}`}>{getDesc(sel, language)}</p>
                        </div>
                    );
                })()}
            </div>
        );
    }

    // -----------------------------------------------------------------------
    // FIRST TIME mode – full-screen modal
    // -----------------------------------------------------------------------
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4 ${isLight ? 'bg-black/40' : 'bg-black/90'}`}>
            {/* Modal container */}
            <div className={`relative w-full max-w-lg rounded-3xl border p-6 flex flex-col gap-6 ${isLight ? 'bg-mystic-card border-mystic-border shadow-mystic-lg' : 'border-white/10 bg-black/80 shadow-[0_0_60px_rgba(168,85,247,0.25)]'}`}>

                {/* Close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`absolute top-3 end-3 w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isLight ? 'bg-mystic-border/40 hover:bg-mystic-border/70 text-mystic-text-secondary hover:text-mystic-text' : 'bg-white/5 hover:bg-white/15 text-white/40 hover:text-white/80'}`}
                        aria-label="Close"
                    >
                        <span className="material-icons">close</span>
                    </button>
                )}

                {/* Title */}
                <div className="text-center">
                    <span className={`material-icons text-4xl mb-2 block ${isLight ? 'text-accent-primary' : 'text-purple-400'}`}>record_voice_over</span>
                    <h2 className={`text-lg font-semibold leading-snug ${isLight ? 'text-mystic-text' : 'text-white'}`}>{ui.title}</h2>
                </div>

                {/* Two-column grid: Female | Male */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Female column */}
                    <div className="flex flex-col gap-2">
                        <span className={`text-xs uppercase tracking-widest font-medium text-center mb-1 ${isLight ? 'text-fuchsia-600' : 'text-fuchsia-400'}`}>
                            {ui.female}
                        </span>
                        {females.map(character => (
                            <VoiceCard
                                key={character.id}
                                character={character}
                                isSelected={selected === character.id}
                                language={language}
                                isLight={isLight}
                                onClick={() => setSelected(character.id)}
                            />
                        ))}
                    </div>

                    {/* Male column */}
                    <div className="flex flex-col gap-2">
                        <span className={`text-xs uppercase tracking-widest font-medium text-center mb-1 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                            {ui.male}
                        </span>
                        {males.map(character => (
                            <VoiceCard
                                key={character.id}
                                character={character}
                                isSelected={selected === character.id}
                                language={language}
                                isLight={isLight}
                                onClick={() => setSelected(character.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Confirm button */}
                <button
                    onClick={handleConfirm}
                    className="w-full py-4 rounded-2xl font-semibold text-white text-base min-h-[52px]
                        bg-gradient-to-r from-purple-600 to-fuchsia-600
                        hover:from-purple-500 hover:to-fuchsia-500
                        shadow-[0_0_20px_rgba(168,85,247,0.4)]
                        transition-all duration-200 active:scale-95"
                >
                    {ui.confirm}
                </button>
            </div>
        </div>
    );
};

export default VoiceSelector;
