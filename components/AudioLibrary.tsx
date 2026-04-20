import React, { useState, useEffect } from 'react';
import { Dream, Language, ThemeMode, AudioVisibility } from '../types';
import { base64ToAudioBlob, createAudioURL } from '../services/audioService';
import { getTheme } from '../theme';

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
    ru: { title: 'Аудиозаписи', no_audio: 'Нет Аудио', no_audio_desc: 'Запишите сон.', play: 'Воспроизвести', pause: 'Пауза', duration: 'Длительность', visibility: 'Видимость', private: 'Приватный', friends: 'Только Друзья', public: 'Публичный', coin_hint: '💰 Зарабатывайте монеты, делая аудио публичным!', transcribed: 'Транскрибировано', untitled: 'Безымянный сон' },
    zh: { title: '音频录制', no_audio: '暂无音频', no_audio_desc: '录制一个梦境即可在这里查看。', play: '播放', pause: '暂停', duration: '时长', visibility: '可见性', private: '私密', friends: '仅好友', public: '公开', coin_hint: '💰 公开音频可赚取金币！', transcribed: '已转录', untitled: '无标题梦境' },
    hi: { title: 'ऑडियो रिकॉर्डिंग', no_audio: 'कोई ऑडियो नहीं', no_audio_desc: 'एक सपना रिकॉर्ड करें।', play: 'चलाएँ', pause: 'रोकें', duration: 'अवधि', visibility: 'दृश्यता', private: 'निजी', friends: 'केवल मित्र', public: 'सार्वजनिक', coin_hint: '💰 ऑडियो सार्वजनिक करके सिक्के कमाएँ!', transcribed: 'लिप्यंतरित', untitled: 'बिना शीर्षक सपना' },
    ja: { title: 'オーディオ録音', no_audio: 'オーディオなし', no_audio_desc: '夢を録音してください。', play: '再生', pause: '一時停止', duration: '再生時間', visibility: '公開設定', private: 'プライベート', friends: '友達のみ', public: '公開', coin_hint: '💰 オーディオを公開してコインを獲得！', transcribed: '文字起こし済み', untitled: '無題の夢' },
    ko: { title: '오디오 녹음', no_audio: '오디오 없음', no_audio_desc: '꿈을 녹음해보세요.', play: '재생', pause: '일시정지', duration: '길이', visibility: '공개 범위', private: '비공개', friends: '친구만', public: '공개', coin_hint: '💰 오디오를 공개하면 코인을 받을 수 있어요!', transcribed: '텍스트 변환됨', untitled: '제목 없는 꿈' },
    id: { title: 'Rekaman Audio', no_audio: 'Belum Ada Audio', no_audio_desc: 'Rekam mimpi untuk melihatnya di sini.', play: 'Putar', pause: 'Jeda', duration: 'Durasi', visibility: 'Visibilitas', private: 'Pribadi', friends: 'Hanya Teman', public: 'Publik', coin_hint: '💰 Dapatkan koin dengan membuat audio publik!', transcribed: 'Sudah Ditranskripsi', untitled: 'Mimpi Tanpa Judul' },
    fa: { title: 'ضبط‌های صوتی', no_audio: 'صوتی موجود نیست', no_audio_desc: 'یک رؤیا ضبط کنید.', play: 'پخش', pause: 'توقف', duration: 'مدت', visibility: 'قابلیت دیده شدن', private: 'خصوصی', friends: 'فقط دوستان', public: 'عمومی', coin_hint: '💰 با عمومی کردن صوت سکه کسب کنید!', transcribed: 'رونویسی شده', untitled: 'رؤیای بدون عنوان' },
    it: { title: 'Registrazioni Audio', no_audio: 'Nessun Audio', no_audio_desc: 'Registra un sogno per vederlo qui.', play: 'Riproduci', pause: 'Pausa', duration: 'Durata', visibility: 'Visibilità', private: 'Privato', friends: 'Solo Amici', public: 'Pubblico', coin_hint: '💰 Guadagna monete rendendo l\'audio pubblico!', transcribed: 'Trascritto', untitled: 'Sogno senza titolo' },
    pl: { title: 'Nagrania Audio', no_audio: 'Brak Audio', no_audio_desc: 'Nagraj sen, aby go tu zobaczyć.', play: 'Odtwórz', pause: 'Pauza', duration: 'Czas trwania', visibility: 'Widoczność', private: 'Prywatne', friends: 'Tylko Znajomi', public: 'Publiczne', coin_hint: '💰 Zdobywaj monety, udostępniając audio publicznie!', transcribed: 'Transkrypcja', untitled: 'Sen bez tytułu' },
    bn: { title: 'অডিও রেকর্ডিং', no_audio: 'কোনো অডিও নেই', no_audio_desc: 'একটি স্বপ্ন রেকর্ড করুন।', play: 'চালান', pause: 'বিরতি', duration: 'সময়কাল', visibility: 'দৃশ্যমানতা', private: 'ব্যক্তিগত', friends: 'শুধু বন্ধুরা', public: 'সর্বজনীন', coin_hint: '💰 অডিও সর্বজনীন করে কয়েন অর্জন করুন!', transcribed: 'প্রতিলিপি করা হয়েছে', untitled: 'শিরোনামহীন স্বপ্ন' },
    ur: { title: 'آڈیو ریکارڈنگز', no_audio: 'کوئی آڈیو نہیں', no_audio_desc: 'ایک خواب ریکارڈ کریں۔', play: 'چلائیں', pause: 'روکیں', duration: 'دورانیہ', visibility: 'مرئیت', private: 'نجی', friends: 'صرف دوست', public: 'عوامی', coin_hint: '💰 آڈیو عوامی بنا کر سکے کمائیں!', transcribed: 'نقل شدہ', untitled: 'بے عنوان خواب' },
    vi: { title: 'Bản ghi Âm thanh', no_audio: 'Chưa có Âm thanh', no_audio_desc: 'Ghi âm một giấc mơ để xem tại đây.', play: 'Phát', pause: 'Tạm dừng', duration: 'Thời lượng', visibility: 'Hiển thị', private: 'Riêng tư', friends: 'Chỉ Bạn bè', public: 'Công khai', coin_hint: '💰 Kiếm xu bằng cách công khai âm thanh!', transcribed: 'Đã chuyển lời', untitled: 'Giấc mơ chưa đặt tên' },
    th: { title: 'บันทึกเสียง', no_audio: 'ไม่มีเสียง', no_audio_desc: 'บันทึกความฝันเพื่อดูที่นี่', play: 'เล่น', pause: 'หยุดชั่วคราว', duration: 'ระยะเวลา', visibility: 'การมองเห็น', private: 'ส่วนตัว', friends: 'เฉพาะเพื่อน', public: 'สาธารณะ', coin_hint: '💰 รับเหรียญโดยทำให้เสียงเป็นสาธารณะ!', transcribed: 'ถอดเสียงแล้ว', untitled: 'ความฝันไม่มีชื่อ' },
    sw: { title: 'Rekodi za Sauti', no_audio: 'Hakuna Sauti', no_audio_desc: 'Rekodi ndoto ili kuiona hapa.', play: 'Cheza', pause: 'Simamisha', duration: 'Muda', visibility: 'Mwonekano', private: 'Binafsi', friends: 'Marafiki Pekee', public: 'Hadharani', coin_hint: '💰 Pata sarafu kwa kufanya sauti kuwa hadharani!', transcribed: 'Imeandikwa', untitled: 'Ndoto Bila Jina' },
    hu: { title: 'Hangfelvételek', no_audio: 'Nincs hang', no_audio_desc: 'Rögzíts egy álmot, hogy itt megjelenjen.', play: 'Lejátszás', pause: 'Szünet', duration: 'Időtartam', visibility: 'Láthatóság', private: 'Privát', friends: 'Csak barátok', public: 'Nyilvános', coin_hint: '💰 Szerezz érméket a hang nyilvánossá tételével!', transcribed: 'Átírt', untitled: 'Névtelen álom' },
    ta: { title: 'ஒலிப் பதிவுகள்', no_audio: 'ஒலி இல்லை', no_audio_desc: 'ஒரு கனவைப் பதிவு செய்யுங்கள்.', play: 'இயக்கு', pause: 'இடைநிறுத்து', duration: 'காலம்', visibility: 'தெரிவுநிலை', private: 'தனிப்பட்ட', friends: 'நண்பர்கள் மட்டும்', public: 'பொது', coin_hint: '💰 ஒலியைப் பொதுவாக்கி நாணயங்கள் சம்பாதியுங்கள்!', transcribed: 'எழுத்தாக்கம் செய்யப்பட்டது', untitled: 'தலைப்பில்லா கனவு' },
    te: { title: 'ఆడియో రికార్డింగ్‌లు', no_audio: 'ఆడియో లేదు', no_audio_desc: 'ఒక కలను రికార్డ్ చేయండి.', play: 'ప్లే', pause: 'పాజ్', duration: 'వ్యవధి', visibility: 'దృశ్యమానత', private: 'ప్రైవేట్', friends: 'స్నేహితులు మాత్రమే', public: 'పబ్లిక్', coin_hint: '💰 ఆడియోను పబ్లిక్ చేసి నాణేలు సంపాదించండి!', transcribed: 'లిప్యంతరీకరించబడింది', untitled: 'శీర్షిక లేని కల' },
    tl: { title: 'Mga Audio Recording', no_audio: 'Walang Audio', no_audio_desc: 'Mag-record ng panaginip para makita dito.', play: 'I-play', pause: 'I-pause', duration: 'Tagal', visibility: 'Visibility', private: 'Pribado', friends: 'Mga Kaibigan Lamang', public: 'Publiko', coin_hint: '💰 Kumita ng coins sa pamamagitan ng pagpapubliko ng audio!', transcribed: 'Na-transcribe', untitled: 'Walang Pamagat na Panaginip' },
    ml: { title: 'ഓഡിയോ റെക്കോർഡിംഗുകൾ', no_audio: 'ഓഡിയോ ഇല്ല', no_audio_desc: 'ഒരു സ്വപ്നം റെക്കോർഡ് ചെയ്യുക.', play: 'പ്ലേ', pause: 'താൽക്കാലികമായി നിർത്തുക', duration: 'ദൈർഘ്യം', visibility: 'ദൃശ്യപരത', private: 'സ്വകാര്യം', friends: 'സുഹൃത്തുക്കൾ മാത്രം', public: 'പൊതു', coin_hint: '💰 ഓഡിയോ പൊതുവാക്കി നാണയങ്ങൾ നേടൂ!', transcribed: 'ലിപ്യന്തരണം ചെയ്തത്', untitled: 'ശീർഷകമില്ലാത്ത സ്വപ്നം' },
    mr: { title: 'ऑडिओ रेकॉर्डिंग', no_audio: 'ऑडिओ नाही', no_audio_desc: 'एक स्वप्न रेकॉर्ड करा.', play: 'चालवा', pause: 'थांबवा', duration: 'कालावधी', visibility: 'दृश्यमानता', private: 'खाजगी', friends: 'फक्त मित्र', public: 'सार्वजनिक', coin_hint: '💰 ऑडिओ सार्वजनिक करून नाणी मिळवा!', transcribed: 'लिप्यंतरित', untitled: 'शीर्षक नसलेले स्वप्न' },
    kn: { title: 'ಆಡಿಯೋ ರೆಕಾರ್ಡಿಂಗ್‌ಗಳು', no_audio: 'ಆಡಿಯೋ ಇಲ್ಲ', no_audio_desc: 'ಒಂದು ಕನಸನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಿ.', play: 'ಪ್ಲೇ', pause: 'ವಿರಾಮ', duration: 'ಅವಧಿ', visibility: 'ಗೋಚರತೆ', private: 'ಖಾಸಗಿ', friends: 'ಸ್ನೇಹಿತರು ಮಾತ್ರ', public: 'ಸಾರ್ವಜನಿಕ', coin_hint: '💰 ಆಡಿಯೋವನ್ನು ಸಾರ್ವಜನಿಕಗೊಳಿಸಿ ನಾಣ್ಯಗಳನ್ನು ಗಳಿಸಿ!', transcribed: 'ಲಿಪ್ಯಂತರಿಸಲಾಗಿದೆ', untitled: 'ಶೀರ್ಷಿಕೆಯಿಲ್ಲದ ಕನಸು' },
    gu: { title: 'ઑડિયો રેકોર્ડિંગ્સ', no_audio: 'કોઈ ઑડિયો નથી', no_audio_desc: 'એક સ્વપ્ન રેકોર્ડ કરો.', play: 'ચલાવો', pause: 'થોભો', duration: 'સમયગાળો', visibility: 'દૃશ્યતા', private: 'ખાનગી', friends: 'ફક્ત મિત્રો', public: 'જાહેર', coin_hint: '💰 ઑડિયો જાહેર કરીને સિક્કા કમાઓ!', transcribed: 'લિપ્યંતરિત', untitled: 'શીર્ષક વિનાનું સ્વપ્ન' },
    he: { title: 'הקלטות שמע', no_audio: 'אין שמע', no_audio_desc: 'הקלט חלום כדי לראות אותו כאן.', play: 'נגן', pause: 'השהה', duration: 'משך', visibility: 'נראות', private: 'פרטי', friends: 'חברים בלבד', public: 'ציבורי', coin_hint: '💰 הרוויחו מטבעות על ידי הפיכת השמע לציבורי!', transcribed: 'תומלל', untitled: 'חלום ללא כותרת' },
    ne: { title: 'अडियो रेकर्डिङहरू', no_audio: 'कुनै अडियो छैन', no_audio_desc: 'एउटा सपना रेकर्ड गर्नुहोस्।', play: 'बजाउनुहोस्', pause: 'रोक्नुहोस्', duration: 'अवधि', visibility: 'दृश्यता', private: 'निजी', friends: 'साथीहरू मात्र', public: 'सार्वजनिक', coin_hint: '💰 अडियो सार्वजनिक बनाएर सिक्काहरू कमाउनुहोस्!', transcribed: 'ट्रान्सक्राइब गरिएको', untitled: 'शीर्षक नभएको सपना' },
    prs: { title: 'ضبط‌های صوتی', no_audio: 'صدا موجود نیست', no_audio_desc: 'یک خواب ضبط کنید.', play: 'پخش', pause: 'توقف', duration: 'مدت', visibility: 'قابلیت دیدن', private: 'خصوصی', friends: 'فقط دوستان', public: 'عمومی', coin_hint: '💰 با عمومی کردن صدا سکه کمایی کنید!', transcribed: 'رونویسی شده', untitled: 'خواب بدون عنوان' },
    'ar-gulf': { title: 'التسجيلات الصوتية', no_audio: 'لا يوجد صوت', no_audio_desc: 'سجل حلماً.', play: 'تشغيل', pause: 'إيقاف', duration: 'المدة', visibility: 'الظهور', private: 'خاص', friends: 'الأصدقاء فقط', public: 'عام', coin_hint: '💰 احصل على عملات بجعل الصوت عامًا!', transcribed: 'مُفرَّغ', untitled: 'حلم بلا عنوان' },
    'ar-eg': { title: 'التسجيلات الصوتية', no_audio: 'لا يوجد صوت', no_audio_desc: 'سجل حلماً.', play: 'تشغيل', pause: 'إيقاف', duration: 'المدة', visibility: 'الظهور', private: 'خاص', friends: 'الأصدقاء فقط', public: 'عام', coin_hint: '💰 احصل على عملات بجعل الصوت عامًا!', transcribed: 'مُفرَّغ', untitled: 'حلم بلا عنوان' },
    'ar-lev': { title: 'التسجيلات الصوتية', no_audio: 'لا يوجد صوت', no_audio_desc: 'سجل حلماً.', play: 'تشغيل', pause: 'إيقاف', duration: 'المدة', visibility: 'الظهور', private: 'خاص', friends: 'الأصدقاء فقط', public: 'عام', coin_hint: '💰 احصل على عملات بجعل الصوت عامًا!', transcribed: 'مُفرَّغ', untitled: 'حلم بلا عنوان' },
    'ar-mag': { title: 'التسجيلات الصوتية', no_audio: 'لا يوجد صوت', no_audio_desc: 'سجل حلماً.', play: 'تشغيل', pause: 'إيقاف', duration: 'المدة', visibility: 'الظهور', private: 'خاص', friends: 'الأصدقاء فقط', public: 'عام', coin_hint: '💰 احصل على عملات بجعل الصوت عامًا!', transcribed: 'مُفرَّغ', untitled: 'حلم بلا عنوان' },
    'ar-iq': { title: 'التسجيلات الصوتية', no_audio: 'لا يوجد صوت', no_audio_desc: 'سجل حلماً.', play: 'تشغيل', pause: 'إيقاف', duration: 'المدة', visibility: 'الظهور', private: 'خاص', friends: 'الأصدقاء فقط', public: 'عام', coin_hint: '💰 احصل على عملات بجعل الصوت عامًا!', transcribed: 'مُفرَّغ', untitled: 'حلم بلا عنوان' }
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

    const th = getTheme(themeMode || ThemeMode.DARK);
    const textMain = th.textPrimary;
    const textSub = th.textSecondary;
    const bgCard = isLight ? 'bg-white/80 border-[#c4bce6]' : 'bg-slate-800/50 border-white/10';

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
