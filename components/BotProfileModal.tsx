import React, { useEffect, useRef } from 'react';
import { BotSimUser, ProfileVisibility, CommunicationPreference } from '../types';
import { useUserLanguage } from '../hooks/useTranslation';

// ─── Inline translations ────────────────────────────────────────────────────

const BOT_PROFILE_TRANSLATIONS: Record<string, {
    anonymousDreamer: string;
    match: string;
    close: string;
    friendsOnlyNotice: string;
    noMessagesNotice: string;
    location: string;
    zodiac: string;
    memberSince: string;
    contributions: string;
    friendsOnlySuffix: string;
    lockNotice: (n: number) => string;
    connected: string;
    connect: string;
}> = {
    de: {
        anonymousDreamer: 'Anonymer Träumer',
        match: 'Übereinstimmung',
        close: 'Schließen',
        friendsOnlyNotice: 'Nur Freunde können das vollständige Profil sehen',
        noMessagesNotice: 'Dieser Nutzer möchte keine Nachrichten erhalten',
        location: 'Ort',
        zodiac: 'Sternzeichen',
        memberSince: 'Mitglied seit',
        contributions: 'Beiträge',
        friendsOnlySuffix: '— nur für Freunde',
        lockNotice: (n) => `Als Freund hinzufügen, um ${n} Beitrag${n !== 1 ? 'e' : ''} zu sehen`,
        connected: 'Verbunden',
        connect: 'Verbinden',
    },
    en: {
        anonymousDreamer: 'Anonymous Dreamer',
        match: 'match',
        close: 'Close',
        friendsOnlyNotice: 'Only friends can see the full profile',
        noMessagesNotice: 'This user prefers not to receive messages',
        location: 'Location',
        zodiac: 'Zodiac',
        memberSince: 'Member since',
        contributions: 'Contributions',
        friendsOnlySuffix: '— friends only',
        lockNotice: (n) => `Add as friend to see ${n} contribution${n !== 1 ? 's' : ''}`,
        connected: 'Connected',
        connect: 'Connect',
    },
    tr: {
        anonymousDreamer: 'Anonim Hayalperest',
        match: 'eşleşme',
        close: 'Kapat',
        friendsOnlyNotice: 'Tam profili yalnızca arkadaşlar görebilir',
        noMessagesNotice: 'Bu kullanıcı mesaj almak istemiyor',
        location: 'Konum',
        zodiac: 'Burç',
        memberSince: 'Üyelik tarihi',
        contributions: 'Katkılar',
        friendsOnlySuffix: '— yalnızca arkadaşlar',
        lockNotice: (n) => `${n} katkıyı görmek için arkadaş olarak ekle`,
        connected: 'Bağlandı',
        connect: 'Bağlan',
    },
    es: {
        anonymousDreamer: 'Soñador Anónimo',
        match: 'coincidencia',
        close: 'Cerrar',
        friendsOnlyNotice: 'Solo los amigos pueden ver el perfil completo',
        noMessagesNotice: 'Este usuario prefiere no recibir mensajes',
        location: 'Ubicación',
        zodiac: 'Zodiaco',
        memberSince: 'Miembro desde',
        contributions: 'Contribuciones',
        friendsOnlySuffix: '— solo amigos',
        lockNotice: (n) => `Agregar como amigo para ver ${n} contribución${n !== 1 ? 'es' : ''}`,
        connected: 'Conectado',
        connect: 'Conectar',
    },
    fr: {
        anonymousDreamer: 'Rêveur Anonyme',
        match: 'correspondance',
        close: 'Fermer',
        friendsOnlyNotice: 'Seuls les amis peuvent voir le profil complet',
        noMessagesNotice: 'Cet utilisateur préfère ne pas recevoir de messages',
        location: 'Lieu',
        zodiac: 'Zodiaque',
        memberSince: 'Membre depuis',
        contributions: 'Contributions',
        friendsOnlySuffix: '— amis uniquement',
        lockNotice: (n) => `Ajouter comme ami pour voir ${n} contribution${n !== 1 ? 's' : ''}`,
        connected: 'Connecté',
        connect: 'Connecter',
    },
    ar: {
        anonymousDreamer: 'حالم مجهول',
        match: 'تطابق',
        close: 'إغلاق',
        friendsOnlyNotice: 'يمكن للأصدقاء فقط رؤية الملف الكامل',
        noMessagesNotice: 'يفضل هذا المستخدم عدم استقبال الرسائل',
        location: 'الموقع',
        zodiac: 'برج',
        memberSince: 'عضو منذ',
        contributions: 'المساهمات',
        friendsOnlySuffix: '— للأصدقاء فقط',
        lockNotice: (n) => `أضف كصديق لرؤية ${n} مساهمة`,
        connected: 'متصل',
        connect: 'تواصل',
    },
    pt: {
        anonymousDreamer: 'Sonhador Anônimo',
        match: 'compatibilidade',
        close: 'Fechar',
        friendsOnlyNotice: 'Apenas amigos podem ver o perfil completo',
        noMessagesNotice: 'Este usuário prefere não receber mensagens',
        location: 'Localização',
        zodiac: 'Zodíaco',
        memberSince: 'Membro desde',
        contributions: 'Contribuições',
        friendsOnlySuffix: '— apenas amigos',
        lockNotice: (n) => `Adicionar como amigo para ver ${n} contribuição${n !== 1 ? 'ões' : ''}`,
        connected: 'Conectado',
        connect: 'Conectar',
    },
    ru: {
        anonymousDreamer: 'Анонимный Мечтатель',
        match: 'совпадение',
        close: 'Закрыть',
        friendsOnlyNotice: 'Полный профиль видят только друзья',
        noMessagesNotice: 'Этот пользователь предпочитает не получать сообщения',
        location: 'Местоположение',
        zodiac: 'Знак зодиака',
        memberSince: 'Участник с',
        contributions: 'Вклады',
        friendsOnlySuffix: '— только для друзей',
        lockNotice: (n) => `Добавить в друзья, чтобы увидеть ${n} вкладов`,
        connected: 'Подключён',
        connect: 'Подключиться',
    },
    zh: {
        anonymousDreamer: '匿名梦想者',
        match: '匹配',
        close: '关闭',
        friendsOnlyNotice: '只有好友才能查看完整资料',
        noMessagesNotice: '该用户不希望接收消息',
        location: '位置',
        zodiac: '星座',
        memberSince: '加入时间',
        contributions: '贡献',
        friendsOnlySuffix: '— 仅限好友',
        lockNotice: (n) => `添加好友以查看 ${n} 条贡献`,
        connected: '已连接',
        connect: '连接',
    },
    hi: {
        anonymousDreamer: 'गुमनाम सपनेबाज़',
        match: 'मेल',
        close: 'बंद करें',
        friendsOnlyNotice: 'केवल मित्र ही पूरी प्रोफ़ाइल देख सकते हैं',
        noMessagesNotice: 'यह उपयोगकर्ता संदेश नहीं चाहता',
        location: 'स्थान',
        zodiac: 'राशि',
        memberSince: 'सदस्य बने',
        contributions: 'योगदान',
        friendsOnlySuffix: '— केवल मित्रों के लिए',
        lockNotice: (n) => `${n} योगदान देखने के लिए मित्र जोड़ें`,
        connected: 'जुड़ा हुआ',
        connect: 'जोड़ें',
    },
    ja: {
        anonymousDreamer: '匿名の夢想家',
        match: 'マッチ',
        close: '閉じる',
        friendsOnlyNotice: '友達のみがフルプロフィールを閲覧できます',
        noMessagesNotice: 'このユーザーはメッセージの受信を希望しません',
        location: '場所',
        zodiac: '星座',
        memberSince: '参加日',
        contributions: '投稿',
        friendsOnlySuffix: '— 友達のみ',
        lockNotice: (n) => `${n}件の投稿を見るには友達追加してください`,
        connected: '接続済み',
        connect: '接続',
    },
    ko: {
        anonymousDreamer: '익명의 몽상가',
        match: '매칭',
        close: '닫기',
        friendsOnlyNotice: '친구만 전체 프로필을 볼 수 있습니다',
        noMessagesNotice: '이 사용자는 메시지를 원하지 않습니다',
        location: '위치',
        zodiac: '별자리',
        memberSince: '가입일',
        contributions: '기여',
        friendsOnlySuffix: '— 친구 전용',
        lockNotice: (n) => `${n}개의 기여를 보려면 친구 추가하세요`,
        connected: '연결됨',
        connect: '연결',
    },
    id: {
        anonymousDreamer: 'Pemimpi Anonim',
        match: 'kecocokan',
        close: 'Tutup',
        friendsOnlyNotice: 'Hanya teman yang bisa melihat profil lengkap',
        noMessagesNotice: 'Pengguna ini tidak ingin menerima pesan',
        location: 'Lokasi',
        zodiac: 'Zodiak',
        memberSince: 'Bergabung sejak',
        contributions: 'Kontribusi',
        friendsOnlySuffix: '— hanya teman',
        lockNotice: (n) => `Tambahkan sebagai teman untuk melihat ${n} kontribusi`,
        connected: 'Terhubung',
        connect: 'Hubungkan',
    },
    fa: {
        anonymousDreamer: 'رویاپرداز ناشناس',
        match: 'تطابق',
        close: 'بستن',
        friendsOnlyNotice: 'فقط دوستان می‌توانند پروفایل کامل را ببینند',
        noMessagesNotice: 'این کاربر ترجیح می‌دهد پیام دریافت نکند',
        location: 'مکان',
        zodiac: 'برج',
        memberSince: 'عضو از',
        contributions: 'مشارکت‌ها',
        friendsOnlySuffix: '— فقط دوستان',
        lockNotice: (n) => `برای دیدن ${n} مشارکت، به عنوان دوست اضافه کنید`,
        connected: 'متصل',
        connect: 'اتصال',
    },
    it: {
        anonymousDreamer: 'Sognatore Anonimo',
        match: 'corrispondenza',
        close: 'Chiudi',
        friendsOnlyNotice: 'Solo gli amici possono vedere il profilo completo',
        noMessagesNotice: 'Questo utente preferisce non ricevere messaggi',
        location: 'Luogo',
        zodiac: 'Zodiaco',
        memberSince: 'Membro dal',
        contributions: 'Contributi',
        friendsOnlySuffix: '— solo amici',
        lockNotice: (n) => `Aggiungi come amico per vedere ${n} contribut${n !== 1 ? 'i' : 'o'}`,
        connected: 'Connesso',
        connect: 'Connetti',
    },
    pl: {
        anonymousDreamer: 'Anonimowy Marzyciel',
        match: 'dopasowanie',
        close: 'Zamknij',
        friendsOnlyNotice: 'Tylko znajomi mogą zobaczyć pełny profil',
        noMessagesNotice: 'Ten użytkownik nie chce otrzymywać wiadomości',
        location: 'Lokalizacja',
        zodiac: 'Zodiak',
        memberSince: 'Członek od',
        contributions: 'Wkłady',
        friendsOnlySuffix: '— tylko znajomi',
        lockNotice: (n) => `Dodaj jako znajomego, aby zobaczyć ${n} wkład${n !== 1 ? 'ów' : ''}`,
        connected: 'Połączono',
        connect: 'Połącz',
    },
    bn: {
        anonymousDreamer: 'বেনামী স্বপ্নদ্রষ্টা',
        match: 'মিল',
        close: 'বন্ধ করুন',
        friendsOnlyNotice: 'শুধুমাত্র বন্ধুরা সম্পূর্ণ প্রোফাইল দেখতে পারবে',
        noMessagesNotice: 'এই ব্যবহারকারী বার্তা পেতে চান না',
        location: 'অবস্থান',
        zodiac: 'রাশিচক্র',
        memberSince: 'সদস্য হয়েছেন',
        contributions: 'অবদান',
        friendsOnlySuffix: '— শুধু বন্ধুদের জন্য',
        lockNotice: (n) => `${n}টি অবদান দেখতে বন্ধু হিসেবে যোগ করুন`,
        connected: 'সংযুক্ত',
        connect: 'সংযোগ করুন',
    },
    ur: {
        anonymousDreamer: 'گمنام خواب دیکھنے والا',
        match: 'میل',
        close: 'بند کریں',
        friendsOnlyNotice: 'صرف دوست مکمل پروفائل دیکھ سکتے ہیں',
        noMessagesNotice: 'یہ صارف پیغامات نہیں چاہتا',
        location: 'مقام',
        zodiac: 'برج',
        memberSince: 'رکن بنے',
        contributions: 'شراکتیں',
        friendsOnlySuffix: '— صرف دوستوں کے لیے',
        lockNotice: (n) => `${n} شراکتیں دیکھنے کے لیے دوست شامل کریں`,
        connected: 'متصل',
        connect: 'رابطہ کریں',
    },
    vi: {
        anonymousDreamer: 'Người Mơ Ẩn Danh',
        match: 'phù hợp',
        close: 'Đóng',
        friendsOnlyNotice: 'Chỉ bạn bè mới xem được hồ sơ đầy đủ',
        noMessagesNotice: 'Người dùng này không muốn nhận tin nhắn',
        location: 'Vị trí',
        zodiac: 'Cung hoàng đạo',
        memberSince: 'Thành viên từ',
        contributions: 'Đóng góp',
        friendsOnlySuffix: '— chỉ bạn bè',
        lockNotice: (n) => `Thêm bạn bè để xem ${n} đóng góp`,
        connected: 'Đã kết nối',
        connect: 'Kết nối',
    },
    th: {
        anonymousDreamer: 'นักฝันนิรนาม',
        match: 'ความเข้ากัน',
        close: 'ปิด',
        friendsOnlyNotice: 'เพื่อนเท่านั้นที่สามารถดูโปรไฟล์เต็มได้',
        noMessagesNotice: 'ผู้ใช้รายนี้ไม่ต้องการรับข้อความ',
        location: 'ที่ตั้ง',
        zodiac: 'ราศี',
        memberSince: 'สมาชิกตั้งแต่',
        contributions: 'การมีส่วนร่วม',
        friendsOnlySuffix: '— เพื่อนเท่านั้น',
        lockNotice: (n) => `เพิ่มเป็นเพื่อนเพื่อดู ${n} การมีส่วนร่วม`,
        connected: 'เชื่อมต่อแล้ว',
        connect: 'เชื่อมต่อ',
    },
    sw: {
        anonymousDreamer: 'Mwota Asiyejulikana',
        match: 'ulinganifu',
        close: 'Funga',
        friendsOnlyNotice: 'Marafiki pekee wanaweza kuona wasifu kamili',
        noMessagesNotice: 'Mtumiaji huyu hapendelei kupokea ujumbe',
        location: 'Mahali',
        zodiac: 'Nyota',
        memberSince: 'Mwanachama tangu',
        contributions: 'Michango',
        friendsOnlySuffix: '— marafiki pekee',
        lockNotice: (n) => `Ongeza kama rafiki kuona michango ${n}`,
        connected: 'Imeunganishwa',
        connect: 'Unganisha',
    },
    hu: {
        anonymousDreamer: 'Névtelen Álmodó',
        match: 'egyezés',
        close: 'Bezárás',
        friendsOnlyNotice: 'Csak barátok láthatják a teljes profilt',
        noMessagesNotice: 'Ez a felhasználó nem kíván üzeneteket fogadni',
        location: 'Helyszín',
        zodiac: 'Csillagjegy',
        memberSince: 'Tag azóta',
        contributions: 'Hozzájárulások',
        friendsOnlySuffix: '— csak barátoknak',
        lockNotice: (n) => `Adj hozzá barátként, hogy lásd a(z) ${n} hozzájárulást`,
        connected: 'Kapcsolódva',
        connect: 'Kapcsolódás',
    },
};

function getBotProfileT(lang: string) {
    return BOT_PROFILE_TRANSLATIONS[lang] ?? BOT_PROFILE_TRANSLATIONS['en'];
}

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

function formatDate(dateStr: string, lang: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString(lang, { year: 'numeric', month: 'long' });
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
    const { language } = useUserLanguage();
    const t = getBotProfileT(language);
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

    const displayName = bot.isAnonymous ? t.anonymousDreamer : bot.name;
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
                        aria-label={t.close}
                    >
                        <span className="material-icons text-[18px]">close</span>
                    </button>

                    {/* Match badge */}
                    {bot.matchPct > 0 && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-xs font-bold">
                            <span className="material-icons text-fuchsia-300 text-[14px]">auto_awesome</span>
                            {bot.matchPct}% {t.match}
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
                            {t.friendsOnlyNotice}
                        </div>
                    )}

                    {/* No-messages notice */}
                    {noMessages && (
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium
                            ${isDark ? 'bg-slate-800/60 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                        >
                            <span className="material-icons text-[16px]">do_not_disturb</span>
                            {t.noMessagesNotice}
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
                                <p className={`text-[10px] uppercase tracking-wide font-semibold ${textMuted}`}>{t.location}</p>
                                <p className={`text-xs font-medium ${textMain}`}>
                                    {bot.city}, {bot.country}
                                </p>
                            </div>
                        </div>

                        {/* Zodiac */}
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${cardBg}`}>
                            <span className="text-lg leading-none">{getZodiacIcon(bot.zodiacSign)}</span>
                            <div>
                                <p className={`text-[10px] uppercase tracking-wide font-semibold ${textMuted}`}>{t.zodiac}</p>
                                <p className={`text-xs font-medium capitalize ${textMain}`}>{bot.zodiacSign}</p>
                            </div>
                        </div>

                        {/* Member since */}
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${cardBg}`}>
                            <span className={`material-icons text-[18px] text-purple-400`}>calendar_today</span>
                            <div>
                                <p className={`text-[10px] uppercase tracking-wide font-semibold ${textMuted}`}>{t.memberSince}</p>
                                <p className={`text-xs font-medium ${textMain}`}>{formatDate(bot.joinedDate, language)}</p>
                            </div>
                        </div>

                        {/* Contributions */}
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${cardBg}`}>
                            <span className={`material-icons text-[18px] ${isFriend ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {isFriend ? 'auto_stories' : 'lock'}
                            </span>
                            <div>
                                <p className={`text-[10px] uppercase tracking-wide font-semibold ${textMuted}`}>{t.contributions}</p>
                                <p className={`text-xs font-medium ${textMain}`}>
                                    {bot.contributionsCount}
                                    {!isFriend && <span className={`ml-1 ${textMuted}`}>{t.friendsOnlySuffix}</span>}
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
                                {t.contributions}
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
                                            <p className={`text-[10px] ${textMuted}`}>{formatDate(c.date, language)}</p>
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
                                {t.lockNotice(bot.contributionsCount)}
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
                        {isFriend ? t.connected : t.connect}
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
