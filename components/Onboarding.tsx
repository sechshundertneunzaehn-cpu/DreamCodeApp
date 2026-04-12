import React, { useState } from 'react';
import { Language, UserProfile, SubscriptionTier, ThemeMode } from '../types';
import { getTheme } from '../theme';

// ─── Props ────────────────────────────────────────────────────────────────────

interface OnboardingProps {
    language: Language;
    initialData: UserProfile | null;
    onComplete: (profile: UserProfile) => void;
    onClose: () => void;
    themeMode?: ThemeMode;
}

// ─── Local data ───────────────────────────────────────────────────────────────

type OBLang = Record<Language, string>;

const T: Record<string, Record<Language, string>> = {
    title:       { en: 'DreamApp', de: 'DreamApp', tr: 'DreamApp', ar: 'DreamApp', es: 'DreamApp', fr: 'DreamApp', pt: 'DreamApp', ru: 'DreamApp', zh: 'DreamApp', hi: 'DreamApp', ja: 'DreamApp', ko: 'DreamApp', id: 'DreamApp', fa: 'DreamApp', it: 'DreamApp', pl: 'DreamApp', bn: 'DreamApp', ur: 'DreamApp', vi: 'DreamApp', th: 'DreamApp', sw: 'DreamApp', hu: 'DreamApp' },
    subtitle:    { en: 'Dreamy AI — Your personal dream guide', de: 'Dreamy AI — Dein persönlicher Traumführer', tr: 'Dreamy AI — Kişisel rüya rehberin', ar: 'Dreamy AI — مرشدك الشخصي للأحلام', es: 'Dreamy AI — Tu guía personal de sueños', fr: 'Dreamy AI — Ton guide personnel des rêves', pt: 'Dreamy AI — Seu guia pessoal de sonhos', ru: 'Dreamy AI — Твой личный гид по снам', zh: 'Dreamy AI — 你的私人解梦向导', hi: 'Dreamy AI — आपका निजी स्वप्न मार्गदर्शक', ja: 'Dreamy AI — あなた専属の夢ガイド', ko: 'Dreamy AI — 나만의 꿈 가이드', id: 'Dreamy AI — Panduan mimpi pribadimu', fa: 'Dreamy AI — راهنمای شخصی رویاهای شما', it: 'Dreamy AI — La tua guida personale dei sogni', pl: 'Dreamy AI — Twój osobisty przewodnik po snach', bn: 'Dreamy AI — আপনার ব্যক্তিগত স্বপ্ন গাইড', ur: 'Dreamy AI — آپ کا ذاتی خواب رہنما', vi: 'Dreamy AI — Hướng dẫn giấc mơ riêng của bạn', th: 'Dreamy AI — ผู้นำทางฝันส่วนตัวของคุณ', sw: 'Dreamy AI — Mwongozo wako binafsi wa ndoto', hu: 'Dreamy AI — Személyes álomkalauzod' },
    step_of:     { en: 'Step {n} of 5', de: 'Schritt {n} von 5', tr: 'Adım {n} / 5', ar: 'الخطوة {n} من 5', es: 'Paso {n} de 5', fr: 'Étape {n} sur 5', pt: 'Passo {n} de 5', ru: 'Шаг {n} из 5', zh: '第 {n} 步，共 5 步', hi: 'चरण {n} / 5', ja: 'ステップ {n} / 5', ko: '5단계 중 {n}단계', id: 'Langkah {n} dari 5', fa: 'مرحله {n} از 5', it: 'Passo {n} di 5', pl: 'Krok {n} z 5', bn: 'ধাপ {n} / ৫', ur: 'مرحلہ {n} از 5', vi: 'Bước {n} / 5', th: 'ขั้นตอน {n} จาก 5', sw: 'Hatua {n} ya 5', hu: '{n}. lépés az 5-ből' },
    btn_next:    { en: 'Continue', de: 'Weiter', tr: 'Devam', ar: 'متابعة', es: 'Continuar', fr: 'Continuer', pt: 'Continuar', ru: 'Продолжить', zh: '继续', hi: 'जारी रखें', ja: '続ける', ko: '계속', id: 'Lanjutkan', fa: 'ادامه', it: 'Continua', pl: 'Dalej', bn: 'চালিয়ে যান', ur: 'جاری رکھیں', vi: 'Tiếp tục', th: 'ดำเนินต่อ', sw: 'Endelea', hu: 'Tovább' },
    btn_back:    { en: 'Back', de: 'Zurück', tr: 'Geri', ar: 'رجوع', es: 'Atrás', fr: 'Retour', pt: 'Voltar', ru: 'Назад', zh: '返回', hi: 'वापस', ja: '戻る', ko: '뒤로', id: 'Kembali', fa: 'بازگشت', it: 'Indietro', pl: 'Wstecz', bn: 'ফিরে যান', ur: 'واپس', vi: 'Quay lại', th: 'ย้อนกลับ', sw: 'Rudi', hu: 'Vissza' },
    btn_finish:  { en: 'Get started', de: 'Loslegen', tr: 'Başla', ar: 'ابدأ', es: 'Empezar', fr: 'Commencer', pt: 'Começar', ru: 'Начать', zh: '开始使用', hi: 'शुरू करें', ja: '始める', ko: '시작하기', id: 'Mulai', fa: 'شروع کنید', it: 'Inizia', pl: 'Rozpocznij', bn: 'শুরু করুন', ur: 'شروع کریں', vi: 'Bắt đầu', th: 'เริ่มต้น', sw: 'Anza', hu: 'Kezdjük' },
    btn_skip:    { en: 'Skip', de: 'Überspringen', tr: 'Atla', ar: 'تخطى', es: 'Omitir', fr: 'Passer', pt: 'Pular', ru: 'Пропустить', zh: '跳过', hi: 'छोड़ें', ja: 'スキップ', ko: '건너뛰기', id: 'Lewati', fa: 'رد شدن', it: 'Salta', pl: 'Pomiń', bn: 'এড়িয়ে যান', ur: 'چھوڑیں', vi: 'Bỏ qua', th: 'ข้าม', sw: 'Ruka', hu: 'Kihagyás' },
    close:       { en: 'Close', de: 'Schließen', tr: 'Kapat', ar: 'إغلاق', es: 'Cerrar', fr: 'Fermer', pt: 'Fechar', ru: 'Закрыть', zh: '关闭', hi: 'बंद करें', ja: '閉じる', ko: '닫기', id: 'Tutup', fa: 'بستن', it: 'Chiudi', pl: 'Zamknij', bn: 'বন্ধ করুন', ur: 'بند کریں', vi: 'Đóng', th: 'ปิด', sw: 'Funga', hu: 'Bezárás' },
    select_hint: { en: 'Select all that apply', de: 'Alle zutreffenden auswählen', tr: 'Uygun olanları seçin', ar: 'اختر كل ما ينطبق', es: 'Selecciona todo lo que aplique', fr: 'Sélectionne tout ce qui s\'applique', pt: 'Selecione tudo que se aplica', ru: 'Выберите все подходящее', zh: '选择所有适用的', hi: 'सभी लागू विकल्प चुनें', ja: '該当するものをすべて選択', ko: '해당하는 항목을 모두 선택', id: 'Pilih semua yang sesuai', fa: 'همه موارد مرتبط را انتخاب کنید', it: 'Seleziona tutto ciò che si applica', pl: 'Zaznacz wszystkie pasujące', bn: 'প্রযোজ্য সব নির্বাচন করুন', ur: 'تمام متعلقہ منتخب کریں', vi: 'Chọn tất cả các mục phù hợp', th: 'เลือกทั้งหมดที่ตรง', sw: 'Chagua yote yanayofaa', hu: 'Jelöld meg az összeset, ami illik' },

    // Step 1
    s1_title:    { en: 'Your life context', de: 'Dein Lebenskontext', tr: 'Yaşam bağlamın', ar: 'سياق حياتك', es: 'Tu contexto de vida', fr: 'Ton contexte de vie', pt: 'Seu contexto de vida', ru: 'Контекст твоей жизни', zh: '你的生活背景', hi: 'आपका जीवन संदर्भ', ja: 'あなたの生活の背景', ko: '당신의 생활 맥락', id: 'Konteks hidupmu', fa: 'زمینه زندگی شما', it: 'Il tuo contesto di vita', pl: 'Twój kontekst życiowy', bn: 'আপনার জীবন প্রসঙ্গ', ur: 'آپ کی زندگی کا سیاق', vi: 'Bối cảnh cuộc sống của bạn', th: 'บริบทชีวิตของคุณ', sw: 'Muktadha wa maisha yako', hu: 'Élethelyzeted' },
    s1_desc:     { en: 'Select any challenges you\'re currently facing. This helps Dreamy AI understand your dreams better.', de: 'Wähle aktuelle Herausforderungen. Das hilft Dreamy AI, deine Träume besser zu verstehen.', tr: 'Şu anda yaşadığın zorlukları seçin. Bu, Dreamy AI\'nın rüyalarını daha iyi anlamasına yardımcı olur.', ar: 'اختر التحديات التي تواجهها حالياً. يساعد هذا Dreamy AI على فهم أحلامك بشكل أفضل.', es: 'Selecciona los desafíos actuales. Esto ayuda a Dreamy AI a entender mejor tus sueños.', fr: 'Sélectionne tes défis actuels. Cela aide Dreamy AI à mieux comprendre tes rêves.', pt: 'Selecione os desafios atuais. Isso ajuda o Dreamy AI a entender melhor seus sonhos.', ru: 'Выбери текущие трудности. Это поможет Dreamy AI лучше понять твои сны.', zh: '选择你当前面临的挑战。这有助于 Dreamy AI 更好地解读你的梦。', hi: 'वर्तमान चुनौतियाँ चुनें। इससे Dreamy AI आपके सपनों को बेहतर समझ पाएगा।', ja: '現在直面している課題を選んでください。Dreamy AI があなたの夢をより深く理解する助けになります。', ko: '현재 겪고 있는 어려움을 선택하세요. Dreamy AI가 꿈을 더 잘 이해하는 데 도움이 됩니다.', id: 'Pilih tantangan yang sedang kamu hadapi. Ini membantu Dreamy AI memahami mimpimu lebih baik.', fa: 'چالش‌هایی که اکنون با آن‌ها روبرو هستید را انتخاب کنید. این به Dreamy AI کمک می‌کند رویاهای شما را بهتر درک کند.', it: 'Seleziona le sfide che stai affrontando. Aiuta Dreamy AI a capire meglio i tuoi sogni.', pl: 'Wybierz wyzwania, z którymi się mierzysz. To pomoże Dreamy AI lepiej zrozumieć Twoje sny.', bn: 'আপনি বর্তমানে যে চ্যালেঞ্জগুলির মুখোমুখি সেগুলি নির্বাচন করুন। এটি Dreamy AI-কে আপনার স্বপ্ন ভালোভাবে বুঝতে সাহায্য করে।', ur: 'اپنے موجودہ چیلنجز منتخب کریں۔ یہ Dreamy AI کو آپ کے خوابوں کو بہتر سمجھنے میں مدد کرتا ہے۔', vi: 'Chọn những thách thức bạn đang đối mặt. Điều này giúp Dreamy AI hiểu giấc mơ của bạn tốt hơn.', th: 'เลือกความท้าทายที่คุณกำลังเผชิญ ซึ่งช่วยให้ Dreamy AI เข้าใจความฝันของคุณได้ดียิ่งขึ้น', sw: 'Chagua changamoto unazokabiliana nazo sasa. Hii husaidia Dreamy AI kuelewa ndoto zako vizuri zaidi.', hu: 'Válaszd ki a jelenlegi kihívásaidat. Ez segít a Dreamy AI-nak jobban megérteni az álmaidat.' },
    c_substance: { en: 'Substance abuse', de: 'Substanzmissbrauch', tr: 'Madde bağımlılığı', ar: 'إساءة استخدام المواد', es: 'Abuso de sustancias', fr: 'Abus de substances', pt: 'Abuso de substâncias', ru: 'Злоупотребление веществами', zh: '药物滥用', hi: 'मादक द्रव्यों का सेवन', ja: '薬物乱用', ko: '약물 남용', id: 'Penyalahgunaan zat', fa: 'سوء مصرف مواد', it: 'Abuso di sostanze', pl: 'Nadużywanie substancji', bn: 'মাদকদ্রব্যের অপব্যবহার', ur: 'منشیات کا غلط استعمال', vi: 'Lạm dụng chất gây nghiện', th: 'การใช้สารเสพติด', sw: 'Matumizi mabaya ya dawa', hu: 'Szerhasználat' },
    c_trauma:    { en: 'Trauma / PTSD', de: 'Trauma / PTBS', tr: 'Travma / TSSB', ar: 'صدمة / اضطراب ما بعد الصدمة', es: 'Trauma / TEPT', fr: 'Trauma / SSPT', pt: 'Trauma / PTSD', ru: 'Травма / ПТСР', zh: '创伤 / PTSD', hi: 'आघात / PTSD', ja: 'トラウマ / PTSD', ko: '트라우마 / PTSD', id: 'Trauma / PTSD', fa: 'تروما / PTSD', it: 'Trauma / PTSD', pl: 'Trauma / PTSD', bn: 'ট্রমা / PTSD', ur: 'صدمہ / PTSD', vi: 'Chấn thương / PTSD', th: 'บาดแผลทางจิต / PTSD', sw: 'Kiwewe / PTSD', hu: 'Trauma / PTSD' },
    c_health:    { en: 'Health issues', de: 'Gesundheitsprobleme', tr: 'Sağlık sorunları', ar: 'مشاكل صحية', es: 'Problemas de salud', fr: 'Problèmes de santé', pt: 'Problemas de saúde', ru: 'Проблемы со здоровьем', zh: '健康问题', hi: 'स्वास्थ्य समस्याएँ', ja: '健康上の問題', ko: '건강 문제', id: 'Masalah kesehatan', fa: 'مشکلات سلامتی', it: 'Problemi di salute', pl: 'Problemy zdrowotne', bn: 'স্বাস্থ্য সমস্যা', ur: 'صحت کے مسائل', vi: 'Vấn đề sức khỏe', th: 'ปัญหาสุขภาพ', sw: 'Matatizo ya afya', hu: 'Egészségügyi problémák' },
    c_relation:  { en: 'Relationship issues', de: 'Beziehungsprobleme', tr: 'İlişki sorunları', ar: 'مشاكل في العلاقات', es: 'Problemas de relaciones', fr: 'Problèmes relationnels', pt: 'Problemas de relacionamento', ru: 'Проблемы в отношениях', zh: '关系问题', hi: 'रिश्तों की समस्याएँ', ja: '人間関係の問題', ko: '관계 문제', id: 'Masalah hubungan', fa: 'مشکلات رابطه', it: 'Problemi relazionali', pl: 'Problemy w relacjach', bn: 'সম্পর্কের সমস্যা', ur: 'رشتوں کے مسائل', vi: 'Vấn đề mối quan hệ', th: 'ปัญหาความสัมพันธ์', sw: 'Matatizo ya mahusiano', hu: 'Kapcsolati problémák' },
    c_grief:     { en: 'Loss / Grief', de: 'Verlust / Trauer', tr: 'Kayıp / Yas', ar: 'خسارة / حزن', es: 'Pérdida / Duelo', fr: 'Perte / Deuil', pt: 'Perda / Luto', ru: 'Потеря / Горе', zh: '失去 / 悲伤', hi: 'हानि / शोक', ja: '喪失 / 悲嘆', ko: '상실 / 슬픔', id: 'Kehilangan / Duka', fa: 'فقدان / سوگ', it: 'Perdita / Lutto', pl: 'Strata / Żałoba', bn: 'ক্ষতি / শোক', ur: 'نقصان / غم', vi: 'Mất mát / Đau buồn', th: 'การสูญเสีย / ความเศร้า', sw: 'Msiba / Huzuni', hu: 'Veszteség / Gyász' },
    c_work:      { en: 'Professional stress', de: 'Beruflicher Stress', tr: 'İş stresi', ar: 'ضغط مهني', es: 'Estrés laboral', fr: 'Stress professionnel', pt: 'Estresse profissional', ru: 'Профессиональный стресс', zh: '职业压力', hi: 'पेशेवर तनाव', ja: '仕事のストレス', ko: '직장 스트레스', id: 'Stres pekerjaan', fa: 'استرس شغلی', it: 'Stress lavorativo', pl: 'Stres zawodowy', bn: 'পেশাগত চাপ', ur: 'پیشہ ورانہ تناؤ', vi: 'Áp lực công việc', th: 'ความเครียดจากงาน', sw: 'Msongo wa kazi', hu: 'Munkahelyi stressz' },
    c_finance:   { en: 'Financial worries', de: 'Finanzielle Sorgen', tr: 'Finansal endişeler', ar: 'قلق مالي', es: 'Preocupaciones financieras', fr: 'Soucis financiers', pt: 'Preocupações financeiras', ru: 'Финансовые заботы', zh: '经济担忧', hi: 'आर्थिक चिंताएँ', ja: '経済的な心配', ko: '재정 걱정', id: 'Kekhawatiran keuangan', fa: 'نگرانی‌های مالی', it: 'Preoccupazioni finanziarie', pl: 'Problemy finansowe', bn: 'আর্থিক উদ্বেগ', ur: 'مالی پریشانیاں', vi: 'Lo lắng tài chính', th: 'ความกังวลทางการเงิน', sw: 'Wasiwasi wa kifedha', hu: 'Pénzügyi gondok' },
    c_change:    { en: 'Relocation / Change', de: 'Umsiedlung / Veränderung', tr: 'Göç / Değişim', ar: 'انتقال / تغيير', es: 'Reubicación / Cambio', fr: 'Déménagement / Changement', pt: 'Realocação / Mudança', ru: 'Переезд / Изменения', zh: '搬迁 / 变化', hi: 'स्थानांतरण / बदलाव', ja: '引っ越し / 変化', ko: '이주 / 변화', id: 'Pindah / Perubahan', fa: 'نقل مکان / تغییر', it: 'Trasferimento / Cambiamento', pl: 'Przeprowadzka / Zmiana', bn: 'স্থানান্তর / পরিবর্তন', ur: 'نقل مکانی / تبدیلی', vi: 'Chuyển nơi ở / Thay đổi', th: 'ย้ายถิ่น / เปลี่ยนแปลง', sw: 'Kuhama / Mabadiliko', hu: 'Költözés / Változás' },
    c_other:     { en: 'Other', de: 'Andere', tr: 'Diğer', ar: 'أخرى', es: 'Otro', fr: 'Autre', pt: 'Outro', ru: 'Другое', zh: '其他', hi: 'अन्य', ja: 'その他', ko: '기타', id: 'Lainnya', fa: 'سایر', it: 'Altro', pl: 'Inne', bn: 'অন্যান্য', ur: 'دیگر', vi: 'Khác', th: 'อื่น ๆ', sw: 'Nyingine', hu: 'Egyéb' },
    c_none:      { en: 'None', de: 'Keiner', tr: 'Hiçbiri', ar: 'لا شيء', es: 'Ninguno', fr: 'Aucun', pt: 'Nenhum', ru: 'Ничего', zh: '无', hi: 'कोई नहीं', ja: 'なし', ko: '없음', id: 'Tidak ada', fa: 'هیچ‌کدام', it: 'Nessuno', pl: 'Żadne', bn: 'কিছু না', ur: 'کوئی نہیں', vi: 'Không có', th: 'ไม่มี', sw: 'Hakuna', hu: 'Egyik sem' },

    // Step 2
    s2_title:    { en: 'Negative feelings on waking', de: 'Negative Gefühle nach dem Aufwachen', tr: 'Uyanışta olumsuz duygular', ar: 'مشاعر سلبية عند الاستيقاظ', es: 'Sentimientos negativos al despertar', fr: 'Sentiments négatifs au réveil', pt: 'Sentimentos negativos ao acordar', ru: 'Негативные ощущения при пробуждении', zh: '醒来时的消极感受', hi: 'जागने पर नकारात्मक भावनाएँ', ja: '目覚めたときのネガティブな感情', ko: '기상 시 부정적인 감정', id: 'Perasaan negatif saat bangun', fa: 'احساسات منفی هنگام بیداری', it: 'Sensazioni negative al risveglio', pl: 'Negatywne uczucia po przebudzeniu', bn: 'জেগে ওঠার পর নেতিবাচক অনুভূতি', ur: 'جاگنے پر منفی احساسات', vi: 'Cảm xúc tiêu cực khi thức dậy', th: 'ความรู้สึกเชิงลบเมื่อตื่นนอน', sw: 'Hisia hasi unapoamka', hu: 'Negatív érzések ébredéskor' },
    s2_desc:     { en: 'How often do you experience negative feelings after waking up?', de: 'Wie oft erlebst du negative Gefühle nach dem Aufwachen?', tr: 'Uyanmanın ardından ne sıklıkla olumsuz duygular yaşıyorsun?', ar: 'كم مرة تشعر بمشاعر سلبية بعد الاستيقاظ؟', es: '¿Con qué frecuencia experimentas sentimientos negativos después de despertar?', fr: 'À quelle fréquence ressens-tu des émotions négatives après le réveil ?', pt: 'Com que frequência você tem sentimentos negativos ao acordar?', ru: 'Как часто ты испытываешь негативные ощущения после пробуждения?', zh: '你多久会在醒来后感到消极情绪？', hi: 'जागने के बाद आप कितनी बार नकारात्मक भावनाएँ महसूस करते हैं?', ja: '目覚めた後にネガティブな気持ちになることはどのくらいありますか？', ko: '잠에서 깬 후 부정적인 감정을 얼마나 자주 느끼나요?', id: 'Seberapa sering kamu merasakan perasaan negatif setelah bangun tidur?', fa: 'چند وقت یکبار پس از بیدار شدن احساسات منفی دارید؟', it: 'Quanto spesso provi sensazioni negative dopo il risveglio?', pl: 'Jak często odczuwasz negatywne emocje po przebudzeniu?', bn: 'ঘুম থেকে ওঠার পর কত ঘন ঘন নেতিবাচক অনুভূতি হয়?', ur: 'آپ جاگنے کے بعد کتنی بار منفی احساسات محسوس کرتے ہیں؟', vi: 'Bạn thường có cảm xúc tiêu cực sau khi thức dậy không?', th: 'คุณรู้สึกเชิงลบหลังตื่นนอนบ่อยแค่ไหน?', sw: 'Ni mara ngapi unapata hisia hasi baada ya kuamka?', hu: 'Milyen gyakran érzed magad negatívan ébredés után?' },
    f_never:     { en: 'Never', de: 'Nie', tr: 'Hiçbir zaman', ar: 'أبداً', es: 'Nunca', fr: 'Jamais', pt: 'Nunca', ru: 'Никогда', zh: '从不', hi: 'कभी नहीं', ja: '一度もない', ko: '전혀 없음', id: 'Tidak pernah', fa: 'هرگز', it: 'Mai', pl: 'Nigdy', bn: 'কখনো না', ur: 'کبھی نہیں', vi: 'Không bao giờ', th: 'ไม่เคย', sw: 'Kamwe', hu: 'Soha' },
    f_rarely:    { en: 'Rarely', de: 'Selten', tr: 'Nadiren', ar: 'نادراً', es: 'Raramente', fr: 'Rarement', pt: 'Raramente', ru: 'Редко', zh: '很少', hi: 'शायद ही कभी', ja: 'めったにない', ko: '드물게', id: 'Jarang', fa: 'به ندرت', it: 'Raramente', pl: 'Rzadko', bn: 'কদাচিৎ', ur: 'شاذ و نادر', vi: 'Hiếm khi', th: 'นาน ๆ ครั้ง', sw: 'Mara chache', hu: 'Ritkán' },
    f_sometimes: { en: 'Sometimes', de: 'Manchmal', tr: 'Bazen', ar: 'أحياناً', es: 'A veces', fr: 'Parfois', pt: 'Às vezes', ru: 'Иногда', zh: '有时', hi: 'कभी-कभी', ja: '時々', ko: '가끔', id: 'Kadang-kadang', fa: 'گاهی', it: 'A volte', pl: 'Czasami', bn: 'মাঝে মাঝে', ur: 'کبھی کبھی', vi: 'Thỉnh thoảng', th: 'บางครั้ง', sw: 'Wakati mwingine', hu: 'Néha' },
    f_often:     { en: 'Often', de: 'Oft', tr: 'Sık sık', ar: 'كثيراً', es: 'A menudo', fr: 'Souvent', pt: 'Frequentemente', ru: 'Часто', zh: '经常', hi: 'अक्सर', ja: 'よくある', ko: '자주', id: 'Sering', fa: 'اغلب', it: 'Spesso', pl: 'Często', bn: 'প্রায়ই', ur: 'اکثر', vi: 'Thường xuyên', th: 'บ่อยครั้ง', sw: 'Mara kwa mara', hu: 'Gyakran' },
    f_always:    { en: 'Always', de: 'Immer', tr: 'Her zaman', ar: 'دائماً', es: 'Siempre', fr: 'Toujours', pt: 'Sempre', ru: 'Всегда', zh: '总是', hi: 'हमेशा', ja: 'いつも', ko: '항상', id: 'Selalu', fa: 'همیشه', it: 'Sempre', pl: 'Zawsze', bn: 'সবসময়', ur: 'ہمیشہ', vi: 'Luôn luôn', th: 'ตลอดเวลา', sw: 'Daima', hu: 'Mindig' },

    // Step 3
    s3_title:    { en: 'Your motivation', de: 'Deine Motivation', tr: 'Motivasyonun', ar: 'دوافعك', es: 'Tu motivación', fr: 'Ta motivation', pt: 'Sua motivação', ru: 'Твоя мотивация', zh: '你的动机', hi: 'आपकी प्रेरणा', ja: 'あなたのモチベーション', ko: '당신의 동기', id: 'Motivasimu', fa: 'انگیزه شما', it: 'La tua motivazione', pl: 'Twoja motywacja', bn: 'আপনার প্রেরণা', ur: 'آپ کی تحریک', vi: 'Động lực của bạn', th: 'แรงจูงใจของคุณ', sw: 'Motisha yako', hu: 'Motivációd' },
    s3_desc:     { en: 'Why do you want to use DreamApp?', de: 'Warum möchtest du die DreamApp nutzen?', tr: 'DreamApp\'i neden kullanmak istiyorsun?', ar: 'لماذا تريد استخدام DreamApp؟', es: '¿Por qué quieres usar DreamApp?', fr: 'Pourquoi veux-tu utiliser DreamApp ?', pt: 'Por que você quer usar o DreamApp?', ru: 'Зачем тебе DreamApp?', zh: '你为什么想使用 DreamApp？', hi: 'आप DreamApp का उपयोग क्यों करना चाहते हैं?', ja: 'DreamApp を使いたい理由は？', ko: 'DreamApp을 사용하려는 이유는?', id: 'Kenapa kamu ingin menggunakan DreamApp?', fa: 'چرا می‌خواهید از DreamApp استفاده کنید؟', it: 'Perché vuoi usare DreamApp?', pl: 'Dlaczego chcesz używać DreamApp?', bn: 'আপনি কেন DreamApp ব্যবহার করতে চান?', ur: 'آپ DreamApp کیوں استعمال کرنا چاہتے ہیں؟', vi: 'Tại sao bạn muốn sử dụng DreamApp?', th: 'ทำไมคุณถึงอยากใช้ DreamApp?', sw: 'Kwa nini unataka kutumia DreamApp?', hu: 'Miért szeretnéd használni a DreamApp-ot?' },
    m_subcon:    { en: 'Understand my subconscious', de: 'Unterbewusstsein verstehen', tr: 'Bilinçaltımı anlamak', ar: 'فهم اللاوعي', es: 'Entender mi subconsciente', fr: 'Comprendre mon subconscient', pt: 'Entender meu subconsciente', ru: 'Понять своё подсознание', zh: '了解我的潜意识', hi: 'अपने अवचेतन को समझना', ja: '潜在意識を理解する', ko: '잠재의식 이해하기', id: 'Memahami alam bawah sadarku', fa: 'درک ضمیر ناخودآگاهم', it: 'Capire il mio subconscio', pl: 'Zrozumieć moją podświadomość', bn: 'আমার অবচেতন মন বোঝা', ur: 'اپنے لاشعور کو سمجھنا', vi: 'Hiểu tiềm thức của tôi', th: 'เข้าใจจิตใต้สำนึกของฉัน', sw: 'Kuelewa fahamu yangu ya ndani', hu: 'Megérteni a tudatalattim' },
    m_memory:    { en: 'Improve dream recall', de: 'Traumerinnerung verbessern', tr: 'Rüya hatırlama geliştirme', ar: 'تحسين استرجاع الأحلام', es: 'Mejorar el recuerdo de sueños', fr: 'Améliorer le souvenir des rêves', pt: 'Melhorar a lembrança dos sonhos', ru: 'Улучшить память на сны', zh: '提高梦境记忆', hi: 'सपनों की याद सुधारना', ja: '夢の記憶力を向上させる', ko: '꿈 기억력 향상', id: 'Meningkatkan daya ingat mimpi', fa: 'بهبود یادآوری رویا', it: 'Migliorare il ricordo dei sogni', pl: 'Poprawić zapamiętywanie snów', bn: 'স্বপ্ন মনে রাখা উন্নত করা', ur: 'خوابوں کی یاد بہتر کرنا', vi: 'Cải thiện khả năng nhớ giấc mơ', th: 'เพิ่มความสามารถในการจำฝัน', sw: 'Kuboresha kumbukumbu ya ndoto', hu: 'Álomfelidézés javítása' },
    m_mental:    { en: 'Mental health & wellbeing', de: 'Psychische Gesundheit', tr: 'Ruh sağlığı', ar: 'الصحة النفسية', es: 'Salud mental y bienestar', fr: 'Santé mentale et bien-être', pt: 'Saúde mental e bem-estar', ru: 'Психическое здоровье', zh: '心理健康', hi: 'मानसिक स्वास्थ्य एवं कल्याण', ja: 'メンタルヘルスとウェルビーイング', ko: '정신 건강 및 웰빙', id: 'Kesehatan mental & kesejahteraan', fa: 'سلامت روان و بهزیستی', it: 'Salute mentale e benessere', pl: 'Zdrowie psychiczne i dobrostan', bn: 'মানসিক স্বাস্থ্য ও সুস্থতা', ur: 'ذہنی صحت اور بہبود', vi: 'Sức khỏe tinh thần', th: 'สุขภาพจิตและความเป็นอยู่ที่ดี', sw: 'Afya ya akili na ustawi', hu: 'Mentális egészség és jóllét' },
    m_nightmare: { en: 'Cope with nightmares', de: 'Alpträume bewältigen', tr: 'Kabuslarla başa çıkmak', ar: 'التعامل مع الكوابيس', es: 'Hacer frente a las pesadillas', fr: 'Gérer les cauchemars', pt: 'Lidar com pesadelos', ru: 'Справляться с кошмарами', zh: '应对噩梦', hi: 'बुरे सपनों से निपटना', ja: '悪夢に対処する', ko: '악몽 대처하기', id: 'Mengatasi mimpi buruk', fa: 'کنار آمدن با کابوس‌ها', it: 'Affrontare gli incubi', pl: 'Radzić sobie z koszmarami', bn: 'দুঃস্বপ্ন মোকাবেলা করা', ur: 'برے خوابوں سے نمٹنا', vi: 'Đối phó với ác mộng', th: 'รับมือกับฝันร้าย', sw: 'Kukabiliana na ndoto mbaya', hu: 'Rémálmok kezelése' },

    // Step 4
    s4_title:    { en: 'Dream symbols', de: 'Traumsymbole', tr: 'Rüya sembolleri', ar: 'رموز الأحلام', es: 'Símbolos de sueños', fr: 'Symboles de rêves', pt: 'Símbolos de sonhos', ru: 'Символы снов', zh: '梦境符号', hi: 'स्वप्न प्रतीक', ja: '夢のシンボル', ko: '꿈의 상징', id: 'Simbol mimpi', fa: 'نمادهای رویا', it: 'Simboli dei sogni', pl: 'Symbole snów', bn: 'স্বপ্নের প্রতীক', ur: 'خواب کی علامات', vi: 'Biểu tượng giấc mơ', th: 'สัญลักษณ์ในฝัน', sw: 'Alama za ndoto', hu: 'Álomszimbólumok' },
    s4_desc:     { en: 'Choose up to 5 symbols that appear in your dreams', de: 'Wähle bis zu 5 Symbole, die in deinen Träumen vorkommen', tr: 'Rüyalarında görünen en fazla 5 sembol seç', ar: 'اختر حتى 5 رموز تظهر في أحلامك', es: 'Elige hasta 5 símbolos que aparecen en tus sueños', fr: 'Choisis jusqu\'à 5 symboles qui apparaissent dans tes rêves', pt: 'Escolha até 5 símbolos que aparecem em seus sonhos', ru: 'Выбери до 5 символов, которые встречаются в твоих снах', zh: '选择最多 5 个出现在你梦中的符号', hi: 'अपने सपनों में दिखने वाले 5 प्रतीक चुनें', ja: '夢に出てくるシンボルを最大5つ選んでください', ko: '꿈에 나타나는 상징을 최대 5개 선택하세요', id: 'Pilih hingga 5 simbol yang muncul dalam mimpimu', fa: 'تا ۵ نمادی که در رویاهای شما ظاهر می‌شوند را انتخاب کنید', it: 'Scegli fino a 5 simboli che appaiono nei tuoi sogni', pl: 'Wybierz do 5 symboli, które pojawiają się w Twoich snach', bn: 'আপনার স্বপ্নে দেখা ৫টি পর্যন্ত প্রতীক বেছে নিন', ur: 'اپنے خوابوں میں نظر آنے والی 5 علامات منتخب کریں', vi: 'Chọn tối đa 5 biểu tượng xuất hiện trong giấc mơ của bạn', th: 'เลือกสัญลักษณ์ที่ปรากฏในฝันของคุณสูงสุด 5 อย่าง', sw: 'Chagua hadi alama 5 zinazoonekana katika ndoto zako', hu: 'Válassz legfeljebb 5 szimbólumot, amelyek megjelennek álmaidban' },
    s4_hint:     { en: 'Selected: {n}/5', de: 'Ausgewählt: {n}/5', tr: 'Seçilen: {n}/5', ar: 'المحدد: {n}/5', es: 'Seleccionados: {n}/5', fr: 'Sélectionnés : {n}/5', pt: 'Selecionados: {n}/5', ru: 'Выбрано: {n}/5', zh: '已选：{n}/5', hi: 'चयनित: {n}/5', ja: '選択済み: {n}/5', ko: '선택됨: {n}/5', id: 'Dipilih: {n}/5', fa: 'انتخاب‌شده: {n}/۵', it: 'Selezionati: {n}/5', pl: 'Wybrano: {n}/5', bn: 'নির্বাচিত: {n}/৫', ur: 'منتخب: {n}/5', vi: 'Đã chọn: {n}/5', th: 'เลือกแล้ว: {n}/5', sw: 'Zimechaguliwa: {n}/5', hu: 'Kiválasztva: {n}/5' },

    // Step 5
    s5_title:    { en: 'Dream interpretation', de: 'Traumdeutung', tr: 'Rüya yorumu', ar: 'تفسير الأحلام', es: 'Interpretación de sueños', fr: 'Interprétation des rêves', pt: 'Interpretação de sonhos', ru: 'Толкование снов', zh: '梦境解析', hi: 'स्वप्न व्याख्या', ja: '夢の解釈', ko: '꿈 해석', id: 'Interpretasi mimpi', fa: 'تعبیر خواب', it: 'Interpretazione dei sogni', pl: 'Interpretacja snów', bn: 'স্বপ্নের ব্যাখ্যা', ur: 'خواب کی تعبیر', vi: 'Giải mã giấc mơ', th: 'การตีความฝัน', sw: 'Tafsiri ya ndoto', hu: 'Álomértelmezés' },
    s5_statement:{ en: 'I often have trouble interpreting my dreams', de: 'Ich habe oft Probleme mit der Interpretation meiner Träume', tr: 'Rüyalarımı yorumlamakta sıkça zorlanıyorum', ar: 'كثيراً ما أجد صعوبة في تفسير أحلامي', es: 'A menudo tengo dificultades para interpretar mis sueños', fr: 'J\'ai souvent du mal à interpréter mes rêves', pt: 'Muitas vezes tenho dificuldades para interpretar meus sonhos', ru: 'Мне часто сложно интерпретировать свои сны', zh: '我经常难以解读自己的梦', hi: 'मुझे अक्सर अपने सपनों की व्याख्या करने में कठिनाई होती है', ja: '自分の夢を解釈するのに苦労することがよくあります', ko: '저는 종종 꿈을 해석하는 데 어려움을 겪습니다', id: 'Saya sering kesulitan menafsirkan mimpi saya', fa: 'من اغلب در تعبیر رویاهایم مشکل دارم', it: 'Spesso ho difficoltà a interpretare i miei sogni', pl: 'Często mam problem z interpretacją moich snów', bn: 'আমি প্রায়ই আমার স্বপ্নের ব্যাখ্যা করতে অসুবিধায় পড়ি', ur: 'مجھے اکثر اپنے خوابوں کی تعبیر کرنے میں مشکل ہوتی ہے', vi: 'Tôi thường gặp khó khăn trong việc giải mã giấc mơ', th: 'ฉันมักมีปัญหาในการตีความฝันของตัวเอง', sw: 'Mara nyingi nina ugumu wa kutafsiri ndoto zangu', hu: 'Gyakran nehezen értem meg az álmaimat' },
    s5_yes:      { en: 'Yes, I need help', de: 'Ja, ich brauche Hilfe', tr: 'Evet, yardıma ihtiyacım var', ar: 'نعم، أحتاج مساعدة', es: 'Sí, necesito ayuda', fr: 'Oui, j\'ai besoin d\'aide', pt: 'Sim, preciso de ajuda', ru: 'Да, мне нужна помощь', zh: '是的，我需要帮助', hi: 'हाँ, मुझे मदद चाहिए', ja: 'はい、助けが必要です', ko: '네, 도움이 필요합니다', id: 'Ya, saya butuh bantuan', fa: 'بله، به کمک نیاز دارم', it: 'Sì, ho bisogno di aiuto', pl: 'Tak, potrzebuję pomocy', bn: 'হ্যাঁ, আমার সাহায্য দরকার', ur: 'ہاں، مجھے مدد چاہیے', vi: 'Có, tôi cần trợ giúp', th: 'ใช่ ฉันต้องการความช่วยเหลือ', sw: 'Ndiyo, nahitaji msaada', hu: 'Igen, segítségre van szükségem' },
    s5_no:       { en: 'No, I manage fine', de: 'Nein, ich komme klar', tr: 'Hayır, başarıyorum', ar: 'لا، أتعامل معها بشكل جيد', es: 'No, me arreglo bien', fr: 'Non, je me débrouille', pt: 'Não, me viro bem', ru: 'Нет, я справляюсь', zh: '不，我自己能应对', hi: 'नहीं, मैं ठीक से संभाल लेता/लेती हूँ', ja: 'いいえ、自分で大丈夫です', ko: '아니요, 잘 관리하고 있어요', id: 'Tidak, saya bisa sendiri', fa: 'نه، خودم کنار می‌آیم', it: 'No, me la cavo bene', pl: 'Nie, radzę sobie dobrze', bn: 'না, আমি ঠিকই সামলাই', ur: 'نہیں، میں خود سنبھال لیتا/لیتی ہوں', vi: 'Không, tôi tự xử lý được', th: 'ไม่ ฉันจัดการได้ดี', sw: 'Hapana, ninajisimamia vizuri', hu: 'Nem, jól boldogulok' },
};

function t(key: string, lang: Language, vars?: Record<string, string | number>): string {
    const baseLang = lang.startsWith('ar-') ? 'ar' as Language : lang;
    let val = T[key]?.[lang] ?? T[key]?.[baseLang] ?? T[key]?.['en'] ?? key;
    if (vars) {
        Object.entries(vars).forEach(([k, v]) => { val = val.replace(`{${k}}`, String(v)); });
    }
    return val;
}

// Symbol list (language-agnostic keys with translations)
const SYMBOL_KEYS = [
    'airplane','attack','baby','beach','blood','boat','boy','friend','brother','car',
    'chased','cheating','child','church','clothes','death','dog','falling','fire',
    'flying','forest','house','key','moon','mountain','ocean','snake','spider','star','water',
];
const SYMBOL_LABELS: Record<string, OBLang> = {
    airplane:  { en: 'Airplane', de: 'Flugzeug', tr: 'Uçak', ar: 'طائرة', es: 'Avión', fr: 'Avion', pt: 'Avião', ru: 'Самолёт', zh: '飞机', hi: 'हवाई जहाज', ja: '飛行機', ko: '비행기', id: 'Pesawat', fa: 'هواپیما', it: 'Aereo', pl: 'Samolot', bn: 'বিমান', ur: 'ہوائی جہاز', vi: 'Máy bay', th: 'เครื่องบิน', sw: 'Ndege', hu: 'Repülőgép' },
    attack:    { en: 'Attack', de: 'Angriff', tr: 'Saldırı', ar: 'هجوم', es: 'Ataque', fr: 'Attaque', pt: 'Ataque', ru: 'Нападение', zh: '攻击', hi: 'हमला', ja: '攻撃', ko: '공격', id: 'Serangan', fa: 'حمله', it: 'Attacco', pl: 'Atak', bn: 'আক্রমণ', ur: 'حملہ', vi: 'Tấn công', th: 'การโจมตี', sw: 'Shambulio', hu: 'Támadás' },
    baby:      { en: 'Baby', de: 'Baby', tr: 'Bebek', ar: 'طفل رضيع', es: 'Bebé', fr: 'Bébé', pt: 'Bebê', ru: 'Младенец', zh: '婴儿', hi: 'शिशु', ja: '赤ちゃん', ko: '아기', id: 'Bayi', fa: 'نوزاد', it: 'Neonato', pl: 'Niemowlę', bn: 'শিশু', ur: 'بچہ', vi: 'Em bé', th: 'ทารก', sw: 'Mtoto mchanga', hu: 'Baba' },
    beach:     { en: 'Beach', de: 'Strand', tr: 'Sahil', ar: 'شاطئ', es: 'Playa', fr: 'Plage', pt: 'Praia', ru: 'Пляж', zh: '海滩', hi: 'समुद्र तट', ja: 'ビーチ', ko: '해변', id: 'Pantai', fa: 'ساحل', it: 'Spiaggia', pl: 'Plaża', bn: 'সমুদ্র সৈকত', ur: 'ساحل سمندر', vi: 'Bãi biển', th: 'ชายหาด', sw: 'Ufukwe', hu: 'Tengerpart' },
    blood:     { en: 'Blood', de: 'Blut', tr: 'Kan', ar: 'دم', es: 'Sangre', fr: 'Sang', pt: 'Sangue', ru: 'Кровь', zh: '血', hi: 'खून', ja: '血', ko: '피', id: 'Darah', fa: 'خون', it: 'Sangue', pl: 'Krew', bn: 'রক্ত', ur: 'خون', vi: 'Máu', th: 'เลือด', sw: 'Damu', hu: 'Vér' },
    boat:      { en: 'Boat', de: 'Boot', tr: 'Tekne', ar: 'قارب', es: 'Barco', fr: 'Bateau', pt: 'Barco', ru: 'Лодка', zh: '船', hi: 'नाव', ja: '船', ko: '배', id: 'Perahu', fa: 'قایق', it: 'Barca', pl: 'Łódka', bn: 'নৌকা', ur: 'کشتی', vi: 'Thuyền', th: 'เรือ', sw: 'Mashua', hu: 'Csónak' },
    boy:       { en: 'Boy', de: 'Junge', tr: 'Erkek çocuk', ar: 'ولد', es: 'Chico', fr: 'Garçon', pt: 'Menino', ru: 'Мальчик', zh: '男孩', hi: 'लड़का', ja: '男の子', ko: '소년', id: 'Anak laki-laki', fa: 'پسر', it: 'Ragazzo', pl: 'Chłopiec', bn: 'ছেলে', ur: 'لڑکا', vi: 'Cậu bé', th: 'เด็กผู้ชาย', sw: 'Mvulana', hu: 'Fiú' },
    friend:    { en: 'Friend', de: 'Freund', tr: 'Arkadaş', ar: 'صديق', es: 'Amigo', fr: 'Ami', pt: 'Amigo', ru: 'Друг', zh: '朋友', hi: 'दोस्त', ja: '友達', ko: '친구', id: 'Teman', fa: 'دوست', it: 'Amico', pl: 'Przyjaciel', bn: 'বন্ধু', ur: 'دوست', vi: 'Bạn bè', th: 'เพื่อน', sw: 'Rafiki', hu: 'Barát' },
    brother:   { en: 'Brother', de: 'Bruder', tr: 'Erkek kardeş', ar: 'أخ', es: 'Hermano', fr: 'Frère', pt: 'Irmão', ru: 'Брат', zh: '兄弟', hi: 'भाई', ja: '兄弟', ko: '형제', id: 'Saudara laki-laki', fa: 'برادر', it: 'Fratello', pl: 'Brat', bn: 'ভাই', ur: 'بھائی', vi: 'Anh em', th: 'พี่ชาย/น้องชาย', sw: 'Kaka/Ndugu', hu: 'Fivér' },
    car:       { en: 'Car', de: 'Auto', tr: 'Araba', ar: 'سيارة', es: 'Coche', fr: 'Voiture', pt: 'Carro', ru: 'Машина', zh: '汽车', hi: 'कार', ja: '車', ko: '자동차', id: 'Mobil', fa: 'ماشین', it: 'Auto', pl: 'Samochód', bn: 'গাড়ি', ur: 'گاڑی', vi: 'Ô tô', th: 'รถยนต์', sw: 'Gari', hu: 'Autó' },
    chased:    { en: 'Being chased', de: 'Verfolgt werden', tr: 'Kovalanmak', ar: 'الملاحقة', es: 'Ser perseguido', fr: 'Être poursuivi', pt: 'Ser perseguido', ru: 'Погоня', zh: '被追赶', hi: 'पीछा किया जाना', ja: '追いかけられる', ko: '쫓기는 것', id: 'Dikejar', fa: 'تعقیب شدن', it: 'Essere inseguito', pl: 'Bycie ściganym', bn: 'তাড়া করা হচ্ছে', ur: 'پیچھا کیا جانا', vi: 'Bị đuổi theo', th: 'ถูกไล่ล่า', sw: 'Kufukuzwa', hu: 'Üldözés' },
    cheating:  { en: 'Cheating', de: 'Schummeln', tr: 'Aldatma', ar: 'الغش', es: 'Engañar', fr: 'Tricher', pt: 'Traição', ru: 'Измена', zh: '欺骗', hi: 'धोखा', ja: '浮気', ko: '배신', id: 'Selingkuh', fa: 'خیانت', it: 'Tradimento', pl: 'Zdrada', bn: 'প্রতারণা', ur: 'دھوکا', vi: 'Phản bội', th: 'การหลอกลวง', sw: 'Udanganyifu', hu: 'Csalás' },
    child:     { en: 'Child', de: 'Kind', tr: 'Çocuk', ar: 'طفل', es: 'Niño', fr: 'Enfant', pt: 'Criança', ru: 'Ребёнок', zh: '孩子', hi: 'बच्चा', ja: '子ども', ko: '아이', id: 'Anak', fa: 'کودک', it: 'Bambino', pl: 'Dziecko', bn: 'শিশু', ur: 'بچہ', vi: 'Trẻ em', th: 'เด็ก', sw: 'Mtoto', hu: 'Gyerek' },
    church:    { en: 'Church', de: 'Kirche', tr: 'Kilise', ar: 'كنيسة', es: 'Iglesia', fr: 'Église', pt: 'Igreja', ru: 'Церковь', zh: '教堂', hi: 'गिरजाघर', ja: '教会', ko: '교회', id: 'Gereja', fa: 'کلیسا', it: 'Chiesa', pl: 'Kościół', bn: 'গির্জা', ur: 'گرجا', vi: 'Nhà thờ', th: 'โบสถ์', sw: 'Kanisa', hu: 'Templom' },
    clothes:   { en: 'Clothes', de: 'Kleidung', tr: 'Kıyafet', ar: 'ملابس', es: 'Ropa', fr: 'Vêtements', pt: 'Roupas', ru: 'Одежда', zh: '衣服', hi: 'कपड़े', ja: '衣服', ko: '옷', id: 'Pakaian', fa: 'لباس', it: 'Vestiti', pl: 'Ubrania', bn: 'পোশাক', ur: 'کپڑے', vi: 'Quần áo', th: 'เสื้อผ้า', sw: 'Nguo', hu: 'Ruhák' },
    death:     { en: 'Death', de: 'Tod', tr: 'Ölüm', ar: 'موت', es: 'Muerte', fr: 'Mort', pt: 'Morte', ru: 'Смерть', zh: '死亡', hi: 'मृत्यु', ja: '死', ko: '죽음', id: 'Kematian', fa: 'مرگ', it: 'Morte', pl: 'Śmierć', bn: 'মৃত্যু', ur: 'موت', vi: 'Cái chết', th: 'ความตาย', sw: 'Kifo', hu: 'Halál' },
    dog:       { en: 'Dog', de: 'Hund', tr: 'Köpek', ar: 'كلب', es: 'Perro', fr: 'Chien', pt: 'Cachorro', ru: 'Собака', zh: '狗', hi: 'कुत्ता', ja: '犬', ko: '개', id: 'Anjing', fa: 'سگ', it: 'Cane', pl: 'Pies', bn: 'কুকুর', ur: 'کتا', vi: 'Chó', th: 'สุนัข', sw: 'Mbwa', hu: 'Kutya' },
    falling:   { en: 'Falling', de: 'Fallen', tr: 'Düşmek', ar: 'السقوط', es: 'Caída', fr: 'Tomber', pt: 'Cair', ru: 'Падение', zh: '坠落', hi: 'गिरना', ja: '落ちる', ko: '추락', id: 'Jatuh', fa: 'سقوط', it: 'Cadere', pl: 'Upadek', bn: 'পড়ে যাওয়া', ur: 'گرنا', vi: 'Rơi', th: 'การตกลง', sw: 'Kuanguka', hu: 'Zuhanás' },
    fire:      { en: 'Fire', de: 'Feuer', tr: 'Ateş', ar: 'نار', es: 'Fuego', fr: 'Feu', pt: 'Fogo', ru: 'Огонь', zh: '火', hi: 'आग', ja: '火', ko: '불', id: 'Api', fa: 'آتش', it: 'Fuoco', pl: 'Ogień', bn: 'আগুন', ur: 'آگ', vi: 'Lửa', th: 'ไฟ', sw: 'Moto', hu: 'Tűz' },
    flying:    { en: 'Flying', de: 'Fliegen', tr: 'Uçmak', ar: 'الطيران', es: 'Volar', fr: 'Voler', pt: 'Voar', ru: 'Полёт', zh: '飞行', hi: 'उड़ना', ja: '空を飛ぶ', ko: '비행', id: 'Terbang', fa: 'پرواز', it: 'Volare', pl: 'Latanie', bn: 'উড়া', ur: 'اڑنا', vi: 'Bay', th: 'การบิน', sw: 'Kuruka', hu: 'Repülés' },
    forest:    { en: 'Forest', de: 'Wald', tr: 'Orman', ar: 'غابة', es: 'Bosque', fr: 'Forêt', pt: 'Floresta', ru: 'Лес', zh: '森林', hi: 'जंगल', ja: '森', ko: '숲', id: 'Hutan', fa: 'جنگل', it: 'Foresta', pl: 'Las', bn: 'বন', ur: 'جنگل', vi: 'Rừng', th: 'ป่า', sw: 'Msitu', hu: 'Erdő' },
    house:     { en: 'House', de: 'Haus', tr: 'Ev', ar: 'منزل', es: 'Casa', fr: 'Maison', pt: 'Casa', ru: 'Дом', zh: '房子', hi: 'घर', ja: '家', ko: '집', id: 'Rumah', fa: 'خانه', it: 'Casa', pl: 'Dom', bn: 'বাড়ি', ur: 'گھر', vi: 'Ngôi nhà', th: 'บ้าน', sw: 'Nyumba', hu: 'Ház' },
    key:       { en: 'Key', de: 'Schlüssel', tr: 'Anahtar', ar: 'مفتاح', es: 'Llave', fr: 'Clé', pt: 'Chave', ru: 'Ключ', zh: '钥匙', hi: 'चाबी', ja: '鍵', ko: '열쇠', id: 'Kunci', fa: 'کلید', it: 'Chiave', pl: 'Klucz', bn: 'চাবি', ur: 'چابی', vi: 'Chìa khóa', th: 'กุญแจ', sw: 'Ufunguo', hu: 'Kulcs' },
    moon:      { en: 'Moon', de: 'Mond', tr: 'Ay', ar: 'قمر', es: 'Luna', fr: 'Lune', pt: 'Lua', ru: 'Луна', zh: '月亮', hi: 'चाँद', ja: '月', ko: '달', id: 'Bulan', fa: 'ماه', it: 'Luna', pl: 'Księżyc', bn: 'চাঁদ', ur: 'چاند', vi: 'Mặt trăng', th: 'พระจันทร์', sw: 'Mwezi', hu: 'Hold' },
    mountain:  { en: 'Mountain', de: 'Berg', tr: 'Dağ', ar: 'جبل', es: 'Montaña', fr: 'Montagne', pt: 'Montanha', ru: 'Гора', zh: '山', hi: 'पहाड़', ja: '山', ko: '산', id: 'Gunung', fa: 'کوه', it: 'Montagna', pl: 'Góra', bn: 'পাহাড়', ur: 'پہاڑ', vi: 'Núi', th: 'ภูเขา', sw: 'Mlima', hu: 'Hegy' },
    ocean:     { en: 'Ocean', de: 'Ozean', tr: 'Okyanus', ar: 'محيط', es: 'Océano', fr: 'Océan', pt: 'Oceano', ru: 'Океан', zh: '海洋', hi: 'महासागर', ja: '海', ko: '바다', id: 'Samudra', fa: 'اقیانوس', it: 'Oceano', pl: 'Ocean', bn: 'মহাসাগর', ur: 'سمندر', vi: 'Đại dương', th: 'มหาสมุทร', sw: 'Bahari', hu: 'Óceán' },
    snake:     { en: 'Snake', de: 'Schlange', tr: 'Yılan', ar: 'أفعى', es: 'Serpiente', fr: 'Serpent', pt: 'Cobra', ru: 'Змея', zh: '蛇', hi: 'साँप', ja: '蛇', ko: '뱀', id: 'Ular', fa: 'مار', it: 'Serpente', pl: 'Wąż', bn: 'সাপ', ur: 'سانپ', vi: 'Rắn', th: 'งู', sw: 'Nyoka', hu: 'Kígyó' },
    spider:    { en: 'Spider', de: 'Spinne', tr: 'Örümcek', ar: 'عنكبوت', es: 'Araña', fr: 'Araignée', pt: 'Aranha', ru: 'Паук', zh: '蜘蛛', hi: 'मकड़ी', ja: '蜘蛛', ko: '거미', id: 'Laba-laba', fa: 'عنکبوت', it: 'Ragno', pl: 'Pająk', bn: 'মাকড়সা', ur: 'مکڑی', vi: 'Nhện', th: 'แมงมุม', sw: 'Buibui', hu: 'Pók' },
    star:      { en: 'Star', de: 'Stern', tr: 'Yıldız', ar: 'نجمة', es: 'Estrella', fr: 'Étoile', pt: 'Estrela', ru: 'Звезда', zh: '星星', hi: 'तारा', ja: '星', ko: '별', id: 'Bintang', fa: 'ستاره', it: 'Stella', pl: 'Gwiazda', bn: 'তারা', ur: 'ستارہ', vi: 'Ngôi sao', th: 'ดาว', sw: 'Nyota', hu: 'Csillag' },
    water:     { en: 'Water', de: 'Wasser', tr: 'Su', ar: 'ماء', es: 'Agua', fr: 'Eau', pt: 'Água', ru: 'Вода', zh: '水', hi: 'पानी', ja: '水', ko: '물', id: 'Air', fa: 'آب', it: 'Acqua', pl: 'Woda', bn: 'জল', ur: 'پانی', vi: 'Nước', th: 'น้ำ', sw: 'Maji', hu: 'Víz' },
};
const SYMBOL_EMOJIS: Record<string, string> = {
    airplane: '✈️', attack: '⚔️', baby: '👶', beach: '🏖️', blood: '🩸',
    boat: '⛵', boy: '👦', friend: '🤝', brother: '👨‍👦', car: '🚗',
    chased: '🏃', cheating: '🎭', child: '🧒', church: '⛪', clothes: '👗',
    death: '💀', dog: '🐕', falling: '🌊', fire: '🔥', flying: '🕊️',
    forest: '🌲', house: '🏠', key: '🗝️', moon: '🌙', mountain: '⛰️',
    ocean: '🌊', snake: '🐍', spider: '🕷️', star: '⭐', water: '💧',
};

// Life context options
const LIFE_CONTEXT_KEYS = [
    { key: 'c_substance', id: 'substance', emoji: '💊' },
    { key: 'c_trauma',    id: 'trauma',    emoji: '🧠' },
    { key: 'c_health',    id: 'health',    emoji: '🏥' },
    { key: 'c_relation',  id: 'relation',  emoji: '💔' },
    { key: 'c_grief',     id: 'grief',     emoji: '🕯️' },
    { key: 'c_work',      id: 'work',      emoji: '💼' },
    { key: 'c_finance',   id: 'finance',   emoji: '💸' },
    { key: 'c_change',    id: 'change',    emoji: '🌍' },
    { key: 'c_other',     id: 'other',     emoji: '📌' },
    { key: 'c_none',      id: 'none',      emoji: '✨' },
];

const FREQ_OPTIONS = [
    { key: 'f_never',    id: 'never',    icon: '😌' },
    { key: 'f_rarely',   id: 'rarely',   icon: '🙂' },
    { key: 'f_sometimes',id: 'sometimes',icon: '😐' },
    { key: 'f_often',    id: 'often',    icon: '😔' },
    { key: 'f_always',   id: 'always',   icon: '😰' },
];

const MOTIVATION_OPTIONS = [
    { key: 'm_subcon',    id: 'subcon',    emoji: '🔮' },
    { key: 'm_memory',    id: 'memory',    emoji: '📖' },
    { key: 'm_mental',    id: 'mental',    emoji: '🌿' },
    { key: 'm_nightmare', id: 'nightmare', emoji: '🌑' },
];

// ─── Collected data shape ─────────────────────────────────────────────────────

interface OnboardingData {
    lifeStressors: string[];
    negativeFeelingFreq: string;
    motivations: string[];
    dreamSymbols: string[];
    interpretationHelp: boolean | null;
}

// ─── RTL languages ────────────────────────────────────────────────────────────

function isRtl(lang: Language) {
  return (lang as string).startsWith('ar') || [Language.FA, Language.UR, Language.HE, Language.PRS].includes(lang);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressDots({ step, total }: { step: number; total: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mt-2 mb-1">
            {Array.from({ length: total }).map((_, i) => (
                <span
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                        i < step
                            ? 'w-6 h-2 bg-fuchsia-500'
                            : i === step
                            ? 'w-6 h-2 bg-fuchsia-400 shadow-[0_0_8px_2px_rgba(217,70,239,0.5)]'
                            : 'w-2 h-2 bg-white/20'
                    }`}
                />
            ))}
        </div>
    );
}

function ChoiceChip({
    label,
    emoji,
    selected,
    onClick,
    disabled,
    isLight,
}: {
    label: string;
    emoji?: string;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
    isLight?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled && !selected}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400
                ${selected
                    ? 'bg-fuchsia-600/80 border-fuchsia-400 text-white shadow-[0_0_10px_2px_rgba(217,70,239,0.35)]'
                    : disabled
                    ? (isLight ? 'bg-[#e0dcf5] border-[#c4bce6] text-[#6b5a80]/40 cursor-not-allowed' : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed')
                    : (isLight ? 'bg-white/70 border-[#c4bce6] text-[#4a3a5d] hover:bg-white/90 hover:border-violet-400 active:scale-95' : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:border-fuchsia-500/40 active:scale-95')
                }`}
        >
            {emoji && <span>{emoji}</span>}
            <span>{label}</span>
            {selected && (
                <span className="ms-auto text-fuchsia-200 text-xs">✓</span>
            )}
        </button>
    );
}

function SingleChoiceCard({
    label,
    icon,
    selected,
    onClick,
    isLight,
}: {
    label: string;
    icon: string;
    selected: boolean;
    onClick: () => void;
    isLight?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 active:scale-[0.98]
                ${selected
                    ? 'bg-fuchsia-600/70 border-fuchsia-400 text-white shadow-[0_0_12px_2px_rgba(217,70,239,0.3)]'
                    : (isLight ? 'bg-white/70 border-[#c4bce6] text-[#4a3a5d] hover:bg-white/90 hover:border-violet-400' : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:border-fuchsia-500/40')
                }`}
        >
            <span className="text-xl w-7 flex-shrink-0 text-center">{icon}</span>
            <span className="text-start">{label}</span>
            {selected && <span className="ms-auto text-fuchsia-200">●</span>}
        </button>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Onboarding: React.FC<OnboardingProps> = ({ language, initialData, onComplete, onClose, themeMode }) => {
    const th = getTheme(themeMode || ThemeMode.DARK);
    const lang = language ?? Language.EN;
    const rtl = isRtl(lang);
    const dir = rtl ? 'rtl' : 'ltr';

    const TOTAL_STEPS = 5;
    const [step, setStep] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');

    const [data, setData] = useState<OnboardingData>({
        lifeStressors: initialData?.lifeStressors ?? [],
        negativeFeelingFreq: initialData?.negativeFeelingFreq ?? '',
        motivations: [],
        dreamSymbols: [],
        interpretationHelp: null,
    });

    // ── navigation ──────────────────────────────────────────────────────────

    function navigate(nextStep: number, dir: 'forward' | 'back') {
        if (animating) return;
        setDirection(dir);
        setAnimating(true);
        setTimeout(() => {
            setStep(nextStep);
            setAnimating(false);
        }, 220);
    }

    function goNext() {
        if (step < TOTAL_STEPS - 1) navigate(step + 1, 'forward');
        else finish();
    }
    function goBack() {
        if (step > 0) navigate(step - 1, 'back');
    }

    function finish() {
        const base: UserProfile = {
            name: initialData?.name ?? '',
            interests: initialData?.interests ?? [],
            subscriptionTier: initialData?.subscriptionTier ?? SubscriptionTier.FREE,
            credits: initialData?.credits ?? 100,
            ...(initialData ?? {}),
            lifeStressors: data.lifeStressors,
            negativeFeelingFreq: data.negativeFeelingFreq,
            isComplete: true,
        };
        onComplete(base);
    }

    // ── step validation (loose — user may skip) ──────────────────────────────
    function canProceed(): boolean {
        return true; // all steps optional
    }

    // ── toggle helpers ───────────────────────────────────────────────────────

    function toggleStressor(id: string) {
        setData(prev => {
            if (id === 'none') return { ...prev, lifeStressors: prev.lifeStressors.includes('none') ? [] : ['none'] };
            const without_none = prev.lifeStressors.filter(x => x !== 'none');
            return {
                ...prev,
                lifeStressors: without_none.includes(id)
                    ? without_none.filter(x => x !== id)
                    : [...without_none, id],
            };
        });
    }

    function toggleMotivation(id: string) {
        setData(prev => ({
            ...prev,
            motivations: prev.motivations.includes(id)
                ? prev.motivations.filter(x => x !== id)
                : [...prev.motivations, id],
        }));
    }

    function toggleSymbol(key: string) {
        setData(prev => {
            if (prev.dreamSymbols.includes(key)) return { ...prev, dreamSymbols: prev.dreamSymbols.filter(x => x !== key) };
            if (prev.dreamSymbols.length >= 5) return prev;
            return { ...prev, dreamSymbols: [...prev.dreamSymbols, key] };
        });
    }

    // ── slide animation classes ──────────────────────────────────────────────

    const slideClass = animating
        ? direction === 'forward'
            ? 'opacity-0 translate-x-4'
            : 'opacity-0 -translate-x-4'
        : 'opacity-100 translate-x-0';

    // ── render step content ──────────────────────────────────────────────────

    function renderStep() {
        switch (step) {
            case 0: return (
                <div>
                    <p className={`${th.isLight ? "text-[#4a3a5d]" : "text-white/60"} text-sm mb-4`}>{t('select_hint', lang)}</p>
                    <div className="flex flex-wrap gap-2">
                        {LIFE_CONTEXT_KEYS.map(({ key, id, emoji }) => (
                            <ChoiceChip
                                key={id}
                                label={t(key, lang)}
                                emoji={emoji}
                                selected={data.lifeStressors.includes(id)}
                                onClick={() => toggleStressor(id)}
                                isLight={th.isLight}
                            />
                        ))}
                    </div>
                </div>
            );

            case 1: return (
                <div className="flex flex-col gap-3">
                    {FREQ_OPTIONS.map(({ key, id, icon }) => (
                        <SingleChoiceCard
                            key={id}
                            label={t(key, lang)}
                            icon={icon}
                            selected={data.negativeFeelingFreq === id}
                            onClick={() => setData(prev => ({ ...prev, negativeFeelingFreq: id }))}
                            isLight={th.isLight}
                        />
                    ))}
                </div>
            );

            case 2: return (
                <div>
                    <p className={`${th.isLight ? "text-[#4a3a5d]" : "text-white/60"} text-sm mb-4`}>{t('select_hint', lang)}</p>
                    <div className="flex flex-col gap-3">
                        {MOTIVATION_OPTIONS.map(({ key, id, emoji }) => (
                            <ChoiceChip
                                key={id}
                                label={t(key, lang)}
                                emoji={emoji}
                                selected={data.motivations.includes(id)}
                                onClick={() => toggleMotivation(id)}
                                isLight={th.isLight}
                            />
                        ))}
                    </div>
                </div>
            );

            case 3: return (
                <div>
                    <p className={`${th.isLight ? "text-[#4a3a5d]" : "text-white/60"} text-sm mb-3`}>
                        {t('s4_hint', lang, { n: data.dreamSymbols.length })}
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1
                        [&::-webkit-scrollbar]:w-1
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-fuchsia-700/50">
                        {SYMBOL_KEYS.map(key => (
                            <ChoiceChip
                                key={key}
                                label={SYMBOL_LABELS[key]?.[lang] ?? SYMBOL_LABELS[key]?.['en'] ?? key}
                                emoji={SYMBOL_EMOJIS[key]}
                                selected={data.dreamSymbols.includes(key)}
                                disabled={data.dreamSymbols.length >= 5}
                                onClick={() => toggleSymbol(key)}
                                isLight={th.isLight}
                            />
                        ))}
                    </div>
                </div>
            );

            case 4: return (
                <div>
                    <div className="mb-6 p-4 rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/30">
                        <p className={`${th.textPrimary} text-base font-medium leading-relaxed text-center`}>
                            "{t('s5_statement', lang)}"
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => setData(prev => ({ ...prev, interpretationHelp: true }))}
                            className={`w-full py-4 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-[0.98]
                                ${data.interpretationHelp === true
                                    ? 'bg-fuchsia-600/70 border-fuchsia-400 text-white shadow-[0_0_12px_2px_rgba(217,70,239,0.3)]'
                                    : (th.isLight ? 'bg-white/70 border-[#c4bce6] text-[#4a3a5d] hover:bg-white/90 hover:border-fuchsia-400' : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:border-fuchsia-500/40')
                                }`}
                        >
                            {t('s5_yes', lang)}
                        </button>
                        <button
                            type="button"
                            onClick={() => setData(prev => ({ ...prev, interpretationHelp: false }))}
                            className={`w-full py-4 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-[0.98]
                                ${data.interpretationHelp === false
                                    ? 'bg-violet-600/70 border-violet-400 text-white shadow-[0_0_12px_2px_rgba(139,92,246,0.3)]'
                                    : (th.isLight ? 'bg-white/70 border-[#c4bce6] text-[#4a3a5d] hover:bg-white/90 hover:border-violet-400' : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:border-violet-500/40')
                                }`}
                        >
                            {t('s5_no', lang)}
                        </button>
                    </div>
                </div>
            );

            default: return null;
        }
    }

    const stepTitles = ['s1_title', 's2_title', 's3_title', 's4_title', 's5_title'];
    const stepDescs  = ['s1_desc',  's2_desc',  's3_desc',  's4_desc',  's5_title'];

    // ── render ───────────────────────────────────────────────────────────────

    return (
        <div
            dir={dir}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: th.isLight ? 'rgba(240,238,252,0.95)' : 'rgba(10,8,26,0.92)', backdropFilter: 'blur(12px)' }}
        >
            {/* Stars decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
                {[...Array(30)].map((_, i) => (
                    <span
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            width:  Math.random() * 2 + 1 + 'px',
                            height: Math.random() * 2 + 1 + 'px',
                            top:    Math.random() * 100 + '%',
                            left:   Math.random() * 100 + '%',
                            opacity: Math.random() * 0.5 + 0.1,
                        }}
                    />
                ))}
            </div>

            {/* Modal card */}
            <div
                className={`relative w-full max-w-md rounded-2xl border ${th.isLight ? 'border-[#c4bce6]' : 'border-white/10'} shadow-2xl flex flex-col`}
                style={{
                    background: th.isLight ? 'linear-gradient(160deg, #fdfbff 0%, #f0eefc 60%, #e8e4f8 100%)' : 'linear-gradient(160deg, #130b2b 0%, #0f0b1a 60%, #1a0a2e 100%)',
                    maxHeight: 'min(90dvh, 700px)',
                }}
            >
                {/* Header */}
                <div className={`px-5 pt-5 pb-3 border-b ${th.border} flex-shrink-0`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🌙</span>
                            <span className={`${th.textPrimary} font-bold tracking-wide text-base`}>
                                {t('title', lang)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={t('close', lang)}
                            className={`${th.isLight ? "text-[#4a3a5d] hover:text-[#2a1a3a] hover:bg-[#e0dcf5]" : "text-white/40 hover:text-white/80 hover:bg-white/10"} transition-colors p-1 rounded-lg`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <ProgressDots step={step} total={TOTAL_STEPS} />
                    <p className={`${th.isLight ? "text-[#6b5a80]" : "text-white/40"} text-xs text-center mt-1`}>
                        {t('step_of', lang, { n: step + 1 })}
                    </p>
                </div>

                {/* Step content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                    <div
                        className={`transition-all duration-200 ease-out ${slideClass}`}
                    >
                        <h2 className={`${th.textPrimary} text-lg font-bold mb-1`}>
                            {t(stepTitles[step], lang)}
                        </h2>
                        <p className={`${th.isLight ? "text-[#4a3a5d]" : "text-white/55"} text-sm mb-4 leading-relaxed`}>
                            {step < 4 ? t(stepDescs[step], lang) : ''}
                        </p>
                        {renderStep()}
                    </div>
                </div>

                {/* Footer navigation */}
                <div className={`px-5 pb-5 pt-3 border-t ${th.border} flex-shrink-0`}>
                    <div className="flex gap-3">
                        {step > 0 ? (
                            <button
                                type="button"
                                onClick={goBack}
                                className={`flex-1 py-3 rounded-xl border ${th.isLight ? "border-[#c4bce6] text-[#4a3a5d] hover:bg-[#e0dcf5]" : "border-white/20 text-white/70 hover:bg-white/10"} text-sm font-semibold transition-all active:scale-[0.98]`}
                            >
                                {t('btn_back', lang)}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all active:scale-[0.98] ${th.isLight ? 'border-[#c4bce6] text-[#6b5a80] hover:bg-[#e0dcf5]' : 'border-white/20 text-white/40 hover:bg-white/5'}`}
                            >
                                {t('btn_skip', lang)}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={goNext}
                            className="flex-[2] py-3 rounded-xl text-white text-sm font-bold transition-all active:scale-[0.98]
                                bg-gradient-to-r from-fuchsia-600 to-violet-600
                                hover:from-fuchsia-500 hover:to-violet-500
                                shadow-[0_0_16px_2px_rgba(217,70,239,0.3)]"
                        >
                            {step === TOTAL_STEPS - 1 ? t('btn_finish', lang) : t('btn_next', lang)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
