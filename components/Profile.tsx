
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Dream, Language, FontSize, SubscriptionTier, ThemeMode } from '../types';
import DreamShare from './DreamShare';
import AudioLibrary from './AudioLibrary';

interface ProfileProps {
    language: Language;
    dreams: Dream[];
    userProfile: UserProfile | null;
    onUpdateProfile: (p: UserProfile) => void;
    onGenerateVideo: (prompt: string, dreamId?: string) => void;
    onGenerateNarrationVideo?: (prompt: string, dreamId?: string) => void;
    onGenerateUserVoiceVideo?: (prompt: string, audioBase64: string, dreamId?: string) => void;
    onPlayVideo?: (videoDataUrl: string) => void;
    onUpdateDream?: (dream: Dream) => void; // For updating dream visibility
    fontSize: FontSize;
    themeMode: ThemeMode;
}

const GLOBAL_CATEGORIES = [
    { id: 'nightmare', en: 'Nightmare', de: 'Albtraum', tr: 'Kabus', es: 'Pesadilla', fr: 'Cauchemar', ar: 'كابوس', pt: 'Pesadelo', ru: 'Кошмар' },
    { id: 'lucid', en: 'Lucid', de: 'Luzid', tr: 'Lüsid', es: 'Lúcido', fr: 'Lucide', ar: 'واضح', pt: 'Lúcido', ru: 'Осознанный' },
    { id: 'recurring', en: 'Recurring', de: 'Wiederkehrend', tr: 'Tekrarlayan', es: 'Recurrente', fr: 'Récurrent', ar: 'متكرر', pt: 'Recorrente', ru: 'Повторяющийся' },
    { id: 'prophetic', en: 'Prophetic', de: 'Prophetisch', tr: 'Kehanet', es: 'Profético', fr: 'Prophétique', ar: 'نبوي', pt: 'Profético', ru: 'Вещий' },
    { id: 'healing', en: 'Healing', de: 'Heilung', tr: 'Şifa', es: 'Sanador', fr: 'Guérison', ar: 'شفاء', pt: 'Cura', ru: 'Исцеляющий' },
    { id: 'funny', en: 'Funny', de: 'Lustig', tr: 'Komik', es: 'Gracioso', fr: 'Drôle', ar: 'مضحك', pt: 'Engraçado', ru: 'Смешной' },
    { id: 'scary', en: 'Scary', de: 'Gruselig', tr: 'Korkunç', es: 'Aterrador', fr: 'Effrayant', ar: 'مخيف', pt: 'Assustador', ru: 'Страшный' },
    { id: 'weird', en: 'Weird', de: 'Seltsam', tr: 'Garip', es: 'Extraño', fr: 'Étrange', ar: 'غريب', pt: 'Estranho', ru: 'Странный' },
    { id: 'sexual', en: 'Erotic', de: 'Erotisch', tr: 'Erotik', es: 'Erótico', fr: 'Érotique', ar: 'إثارة', pt: 'Erótico', ru: 'Эротический' },
    { id: 'spiritual', en: 'Spiritual', de: 'Spirituell', tr: 'Manevi', es: 'Espiritual', fr: 'Spirituel', ar: 'روحاني', pt: 'Espiritual', ru: 'Духовный' },
    { id: 'shadow', en: 'Shadow Work', de: 'Schattenarbeit', tr: 'Gölge Çalışması', es: 'Trabajo de Sombra', fr: 'Travail d\'Ombre', ar: 'عمل الظل', pt: 'Trabalho de Sombra', ru: 'Теневая Работа' },
    { id: 'animals', en: 'Animals', de: 'Tiere', tr: 'Hayvanlar', es: 'Animales', fr: 'Animaux', ar: 'حيوانات', pt: 'Animais', ru: 'Животные' },
    { id: 'flying', en: 'Flying', de: 'Fliegen', tr: 'Uçmak', es: 'Volar', fr: 'Voler', ar: 'طيران', pt: 'Voar', ru: 'Полёт' },
    { id: 'falling', en: 'Falling', de: 'Fallen', tr: 'Düşmek', es: 'Caer', fr: 'Tomber', ar: 'سقوط', pt: 'Cair', ru: 'Падение' }
];

const profileTranslations = {
    [Language.EN]: { posts: "Dreams", followers: "Friends", following: "Following", edit: "Edit Profile", cancel: "Cancel", share: "Share", social_title: "Social Links", basics_title: "Identity", name_label: "Display Name", bio_label: "Title / Role", remarks_label: "Bio / Remarks", remarks_placeholder: "Write something about your journey...", website_label: "Website", save: "Save Profile", no_posts: "No Dreams Yet", no_posts_desc: "Interpret a dream to see it here.", no_videos: "No videos yet.", no_videos_desc: "Generate a video to see it here.", no_matches: "No Matches", no_matches_desc: "Connect to find soulmates.", likes: "likes", bio_default: "Dream Explorer", tab_grid: "Dreams", tab_video: "Videos", tab_matches: "Matches", tab_audio: "Audio", new_story: "Category", manage_cats: "Manage", upload_photo: "Photo", match_score: "Match", website: "Website", tier_free: "Bronze Plan", tier_silver: "Silver Plan", tier_gold: "Gold Plan", your_dream: "Your Dream", btn_video: "Generate Dream Video", btn_narration: "Dream Narration Video", btn_user_voice: "Video with Your Voice (+5 Coins)", btn_play_video: "Play Saved Video", age_restricted: "This category is only available for users 18 and older." },
    [Language.DE]: { posts: "Träume", followers: "Freunde", following: "Gefolgt", edit: "Profil bearbeiten", cancel: "Abbrechen", share: "Teilen", social_title: "Social Links", basics_title: "Identität", name_label: "Anzeigename", bio_label: "Titel / Rolle", remarks_label: "Bio / Bemerkungen", remarks_placeholder: "Schreibe etwas über deine Reise...", website_label: "Webseite", save: "Profil Speichern", no_posts: "Keine Träume", no_posts_desc: "Deute einen Traum.", no_videos: "Keine Videos", no_videos_desc: "Generiere ein Video.", no_matches: "Keine Matches", no_matches_desc: "Verbinde dich.", likes: "Likes", bio_default: "Traumforscher", tab_grid: "Träume", tab_video: "Videos", tab_matches: "Matches", tab_audio: "Audio", new_story: "Kategorie", manage_cats: "Verwalten", upload_photo: "Foto", match_score: "Match", website: "Webseite", tier_free: "Bronze Plan", tier_silver: "Silber Plan", tier_gold: "Gold Plan", your_dream: "Dein Traum", btn_video: "Traumvideo erstellen", btn_narration: "Traum-Erzählung Video", btn_user_voice: "Video mit deiner Stimme (+5 Münzen)", btn_play_video: "Gespeichertes Video abspielen", age_restricted: "Diese Kategorie ist nur für Personen ab 18 Jahren verfügbar." },
    [Language.TR]: { posts: "Rüyalar", followers: "Arkadaşlar", following: "Takip", edit: "Düzenle", cancel: "İptal", share: "Paylaş", social_title: "Sosyal Bağlantılar", basics_title: "Kimlik", name_label: "Görünen Ad", bio_label: "Ünvan / Rol", remarks_label: "Biyo / Notlar", remarks_placeholder: "Yolculuğun hakkında yaz...", website_label: "Web Sitesi", save: "Kaydet", no_posts: "Rüya Yok", no_posts_desc: "Rüya yorumla.", no_videos: "Video yok", no_videos_desc: "Video oluştur.", no_matches: "Eşleşme Yok", no_matches_desc: "Bağlan.", likes: "beğeni", bio_default: "Rüya Kaşifi", tab_grid: "Rüyalar", tab_video: "Video", tab_matches: "Eşleşme", tab_audio: "Ses", new_story: "Kategori", manage_cats: "Yönet", upload_photo: "Foto", match_score: "Puan", website: "Web Sitesi", tier_free: "Bronz Plan", tier_silver: "Gümüş Plan", tier_gold: "Altın Plan", your_dream: "Senin Rüyan", btn_video: "Rüya Videosu Oluştur", btn_narration: "Rüya Anlatım Videosu", btn_user_voice: "Sesinle Video (+5 Jeton)", btn_play_video: "Kaydedilen Videoyu Oynat", age_restricted: "Bu kategori yalnızca 18 yaş ve üzeri kullanıcılar içindir." },
    [Language.ES]: { posts: "Sueños", followers: "Amigos", following: "Siguiendo", edit: "Editar Perfil", cancel: "Cancelar", share: "Compartir", social_title: "Redes Sociales", basics_title: "Identidad", name_label: "Nombre Visible", bio_label: "Título / Rol", remarks_label: "Bio / Observaciones", remarks_placeholder: "Escribe algo sobre tu viaje...", website_label: "Sitio Web", save: "Guardar Perfil", no_posts: "Sin Sueños", no_posts_desc: "Interpreta un sueño para verlo aquí.", no_videos: "Sin videos aún.", no_videos_desc: "Genera un video para verlo aquí.", no_matches: "Sin Coincidencias", no_matches_desc: "Conéctate para encontrar almas gemelas.", likes: "me gusta", bio_default: "Explorador de Sueños", tab_grid: "Sueños", tab_video: "Videos", tab_matches: "Coincidencias", tab_audio: "Audio", new_story: "Categoría", manage_cats: "Gestionar", upload_photo: "Foto", match_score: "Afinidad", website: "Sitio Web", tier_free: "Plan Bronce", tier_silver: "Plan Plata", tier_gold: "Plan Oro", your_dream: "Tu Sueño", btn_video: "Generar Video del Sueño", btn_narration: "Video Narración del Sueño", btn_user_voice: "Video con Tu Voz (+5 Monedas)", btn_play_video: "Reproducir Video Guardado", age_restricted: "Esta categoría solo está disponible para mayores de 18 años." },
    [Language.FR]: { posts: "Rêves", followers: "Amis", following: "Abonnements", edit: "Modifier le Profil", cancel: "Annuler", share: "Partager", social_title: "Réseaux Sociaux", basics_title: "Identité", name_label: "Nom d'Affichage", bio_label: "Titre / Rôle", remarks_label: "Bio / Remarques", remarks_placeholder: "Écrivez quelque chose sur votre voyage...", website_label: "Site Web", save: "Enregistrer le Profil", no_posts: "Aucun Rêve", no_posts_desc: "Interprétez un rêve pour le voir ici.", no_videos: "Aucune vidéo.", no_videos_desc: "Générez une vidéo pour la voir ici.", no_matches: "Aucune Correspondance", no_matches_desc: "Connectez-vous pour trouver des âmes sœurs.", likes: "j'aime", bio_default: "Explorateur de Rêves", tab_grid: "Rêves", tab_video: "Vidéos", tab_matches: "Correspondances", tab_audio: "Audio", new_story: "Catégorie", manage_cats: "Gérer", upload_photo: "Photo", match_score: "Affinité", website: "Site Web", tier_free: "Plan Bronze", tier_silver: "Plan Argent", tier_gold: "Plan Or", your_dream: "Votre Rêve", btn_video: "Générer Vidéo du Rêve", btn_narration: "Vidéo Narration du Rêve", btn_user_voice: "Vidéo avec Votre Voix (+5 Pièces)", btn_play_video: "Lire la Vidéo Enregistrée", age_restricted: "Cette catégorie est réservée aux personnes de 18 ans et plus." },
    [Language.AR]: { posts: "الأحلام", followers: "الأصدقاء", following: "المتابعون", edit: "تعديل الملف", cancel: "إلغاء", share: "مشاركة", social_title: "الروابط الاجتماعية", basics_title: "الهوية", name_label: "اسم العرض", bio_label: "اللقب / الدور", remarks_label: "السيرة / الملاحظات", remarks_placeholder: "اكتب شيئاً عن رحلتك...", website_label: "الموقع الإلكتروني", save: "حفظ الملف", no_posts: "لا توجد أحلام بعد", no_posts_desc: "فسر حلماً لرؤيته هنا.", no_videos: "لا توجد مقاطع فيديو بعد.", no_videos_desc: "أنشئ مقطع فيديو لرؤيته هنا.", no_matches: "لا توجد تطابقات", no_matches_desc: "اتصل للعثور على توأم الروح.", likes: "إعجاب", bio_default: "مستكشف الأحلام", tab_grid: "الأحلام", tab_video: "الفيديو", tab_matches: "التطابقات", tab_audio: "الصوت", new_story: "الفئة", manage_cats: "إدارة", upload_photo: "صورة", match_score: "التطابق", website: "الموقع", tier_free: "خطة البرونز", tier_silver: "خطة الفضة", tier_gold: "خطة الذهب", your_dream: "حلمك", btn_video: "إنشاء فيديو الحلم", btn_narration: "فيديو سرد الحلم", btn_user_voice: "فيديو بصوتك (+5 عملات)", btn_play_video: "تشغيل الفيديو المحفوظ", age_restricted: "هذه الفئة متاحة فقط للمستخدمين الذين تجاوزوا 18 عامًا." },
    [Language.PT]: { posts: "Sonhos", followers: "Amigos", following: "Seguindo", edit: "Editar Perfil", cancel: "Cancelar", share: "Compartilhar", social_title: "Redes Sociais", basics_title: "Identidade", name_label: "Nome de Exibição", bio_label: "Título / Função", remarks_label: "Bio / Observações", remarks_placeholder: "Escreva algo sobre sua jornada...", website_label: "Site", save: "Salvar Perfil", no_posts: "Nenhum Sonho", no_posts_desc: "Interprete um sonho para vê-lo aqui.", no_videos: "Nenhum vídeo ainda.", no_videos_desc: "Gere um vídeo para vê-lo aqui.", no_matches: "Sem Correspondências", no_matches_desc: "Conecte-se para encontrar almas gêmeas.", likes: "curtidas", bio_default: "Explorador de Sonhos", tab_grid: "Sonhos", tab_video: "Vídeos", tab_matches: "Correspondências", tab_audio: "Áudio", new_story: "Categoria", manage_cats: "Gerenciar", upload_photo: "Foto", match_score: "Afinidade", website: "Site", tier_free: "Plano Bronze", tier_silver: "Plano Prata", tier_gold: "Plano Ouro", your_dream: "Seu Sonho", btn_video: "Gerar Vídeo do Sonho", btn_narration: "Vídeo Narração do Sonho", btn_user_voice: "Vídeo com Sua Voz (+5 Moedas)", btn_play_video: "Reproduzir Vídeo Salvo", age_restricted: "Esta categoria só está disponível para maiores de 18 anos." },
    [Language.RU]: { posts: "Сны", followers: "Друзья", following: "Подписки", edit: "Редактировать Профиль", cancel: "Отмена", share: "Поделиться", social_title: "Социальные Сети", basics_title: "Личность", name_label: "Отображаемое Имя", bio_label: "Должность / Роль", remarks_label: "Био / Заметки", remarks_placeholder: "Напишите что-нибудь о своем путешествии...", website_label: "Веб-сайт", save: "Сохранить Профиль", no_posts: "Пока Нет Снов", no_posts_desc: "Истолкуйте сон, чтобы увидеть его здесь.", no_videos: "Пока нет видео.", no_videos_desc: "Создайте видео, чтобы увидеть его здесь.", no_matches: "Нет Совпадений", no_matches_desc: "Подключитесь, чтобы найти родственные души.", likes: "лайков", bio_default: "Исследователь Снов", tab_grid: "Сны", tab_video: "Видео", tab_matches: "Совпадения", tab_audio: "Аудио", new_story: "Категория", manage_cats: "Управление", upload_photo: "Фото", match_score: "Совпадение", website: "Веб-сайт", tier_free: "Бронзовый План", tier_silver: "Серебряный План", tier_gold: "Золотой План", your_dream: "Ваш Сон", btn_video: "Создать Видео Сна", btn_narration: "Видео Рассказ Сна", btn_user_voice: "Видео с Вашим Голосом (+5 Монет)", btn_play_video: "Воспроизвести Сохранённое Видео", age_restricted: "Эта категория доступна только пользователям от 18 лет." }
};

// Official Brand SVGs
const SOCIAL_ICONS: Record<string, string> = {
    instagram: "M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M18,5A1,1 0 0,1 19,6A1,1 0 0,1 18,7A1,1 0 0,1 17,6A1,1 0 0,1 18,5Z",
    twitter: "M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10.03 2.38,10.05C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z",
    tiktok: "M16.6,5.82C15.63,5.82 14.71,5.53 13.92,5.04C13.13,4.55 12.5,3.86 12.1,3H9V15C9,16.1 8.1,17 7,17A2,2 0 0,1 5,15A2,2 0 0,1 7,13C7.5,13 7.97,13.19 8.33,13.5L10.06,12.27C9.42,11.5 8.27,11 7,11A4,4 0 0,0 3,15A4,4 0 0,0 7,19C9.21,19 11,17.21 11,15V9C12.05,9.81 13.37,10.33 14.81,10.45V7.45C14.81,7.45 14.81,7.45 14.81,7.45C15.37,7.45 15.9,7.28 16.36,6.97L16.6,5.82Z",
    youtube: "M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.66 21.94,11.44C21.94,12.22 21.91,13.01 21.84,13.81C21.78,14.61 21.69,15.24 21.56,15.71C21.28,16.96 20.42,17.83 19.21,18.12C17.76,18.5 12,18.5 12,18.5C12,18.5 6.24,18.5 4.79,18.12C3.58,17.83 2.72,16.96 2.44,15.71C2.31,15.24 2.22,14.61 2.16,13.81C2.09,13.01 2.06,12.22 2.06,11.44C2.06,10.66 2.09,9.87 2.16,9.07C2.22,8.27 2.31,7.64 2.44,7.17C2.72,5.92 3.58,5.04 4.79,4.75C6.24,4.38 12,4.38 12,4.38C12,4.38 17.76,4.38 19.21,4.75C20.42,5.04 21.28,5.92 21.56,7.17Z",
    linkedin: "M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M18.5,18.5V13.2C18.5,12.33 17.96,11.63 17.17,11.63C16.59,11.63 16.04,11.91 15.78,12.37V11.73H14.2V18.5H15.76V13.64C15.76,13.2 16.23,12.83 16.63,12.83C17.04,12.83 17.19,13.25 17.19,13.64V18.5H18.5M6.88,8.56A1.68,1.68 0 0,0 5.2,10.24A1.69,1.69 0 0,0 6.88,11.93A1.69,1.69 0 0,0 8.56,10.25A1.69,1.69 0 0,0 6.88,8.56M8.27,18.5V11.73H5.5V18.5H8.27Z",
    telegram: "M9.78,18.65L10.06,14.42L17.74,7.5C18.08,7.19 17.67,7.04 17.22,7.31L7.74,13.3L3.64,12C2.76,11.75 2.75,11.14 3.84,10.7L19.81,4.54C20.54,4.21 21.24,4.72 20.96,5.84L18.24,18.65C18.05,19.56 17.5,19.8 16.74,19.36L12.6,16.3L10.61,18.23C10.38,18.46 10.19,18.65 9.78,18.65Z",
    snapchat: "M12,5.5C13.77,5.5 15.29,6.12 15.84,7.53C15.91,7.71 16.09,7.81 16.28,7.76C16.68,7.66 17.14,7.68 17.44,7.81C17.91,8.03 18.15,8.53 17.97,9.09L17.79,9.66C17.68,10.03 17.78,10.43 18.06,10.71C18.35,11 18.75,11.13 19.14,11.07L20.17,10.9C20.31,10.88 20.45,10.95 20.5,11.09C20.71,11.68 20.28,12.41 19.53,12.58L18.5,12.8C17.63,13 17.1,13.95 17.47,14.79C17.6,15.09 17.55,15.44 17.33,15.68C16.81,16.26 16,16.5 15,16.5C14.8,16.5 14.62,16.6 14.5,16.75C14.19,17.16 13.63,17.5 13,17.5H11C10.37,17.5 9.81,17.16 9.5,16.75C9.38,16.6 9.2,16.5 9,16.5C8,16.5 7.19,16.26 6.67,15.68C6.45,15.44 6.4,15.09 6.53,14.79C6.9,13.95 6.37,13 5.5,12.8L4.47,12.58C3.72,12.41 3.29,11.68 3.5,11.09C3.55,10.95 3.69,10.88 3.83,10.9L4.86,11.07C5.25,11.13 5.65,11 5.94,10.71C6.22,10.43 6.32,10.03 6.21,9.66L6.03,9.09C5.85,8.53 6.09,8.03 6.56,7.81C6.86,7.66 7.32,7.66 7.72,7.76C7.91,7.81 8.09,7.71 8.16,7.53C8.71,6.12 10.23,5.5 12,5.5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
};

const MOCK_MATCHES = [
    { id: 1, name: "Luna_Dreamer", match: 98, avatar: "🌙", bio: "Lucid dreamer & Astral traveler.", status: "online" },
    { id: 2, name: "Mystic_John", match: 92, avatar: "🔮", bio: "Interpreting symbols since 2010.", status: "offline" },
    { id: 3, name: "Star_Child", match: 85, avatar: "✨", bio: "Astrology & Dreams enthusiast.", status: "online" },
    { id: 4, name: "Nebula_Walker", match: 78, avatar: "🛸", bio: "Seeking meaning in the stars.", status: "offline" }
];

// --- EXTRACTED COMPONENT: FIX FOR KEYBOARD ISSUE ---
// Moving this OUTSIDE the Profile component ensures it doesn't re-mount on state changes.
const InputGroup = ({ label, value, onChange, placeholder, isLight }: { label: string, value: string, onChange: (s: string) => void, placeholder: string, isLight: boolean }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
        <input 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder} 
            className={`w-full rounded-lg p-2.5 text-sm outline-none border transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-fuchsia-500' : 'bg-black/40 border-white/10 text-white focus:border-fuchsia-500'}`} 
        />
    </div>
);

const Profile: React.FC<ProfileProps> = ({ userProfile, dreams, onUpdateProfile, onGenerateVideo, onGenerateNarrationVideo, onGenerateUserVoiceVideo, onPlayVideo, onUpdateDream, fontSize, language, themeMode }) => {
    const t = profileTranslations[language];
    const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'grid' | 'video' | 'matches' | 'audio'>('grid');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isLight = themeMode === ThemeMode.LIGHT;

    // Styles
    const textMain = isLight ? 'text-slate-900' : 'text-white';
    const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
    const bgCard = isLight ? 'bg-white border-slate-200 shadow-lg' : 'bg-dream-card/80 border-white/10 shadow-2xl';
    const bgElement = isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10';

    // Default structure to prevent crashes
    const defaultProfile: Partial<UserProfile> = {
        name: "Dreamer", 
        bio: "Dream Explorer",
        interests: [], 
        stats: { followers: 0, following: 12 },
        socialLinks: { website: '', instagram: '', twitter: '', tiktok: '', youtube: '', linkedin: '', telegram: '', snapchat: '' },
        remarks: '', 
        activeCategories: ['nightmare', 'lucid', 'spiritual'],
        subscriptionTier: SubscriptionTier.FREE,
        credits: 0
    };

    const displayProfile = { 
        ...defaultProfile, 
        ...userProfile, 
        socialLinks: { 
            ...defaultProfile.socialLinks, 
            ...(userProfile?.socialLinks || {}) 
        } 
    };

    // --- EDIT STATE WITH NAME & BIO ---
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        website: '',
        instagram: '',
        twitter: '',
        tiktok: '',
        youtube: '',
        linkedin: '',
        telegram: '',
        snapchat: '',
        remarks: ''
    });

    useEffect(() => {
        if (userProfile) {
             setEditForm({
                name: userProfile.name || 'Dreamer',
                bio: userProfile.bio || 'Dream Explorer',
                website: userProfile.socialLinks?.website || '',
                instagram: userProfile.socialLinks?.instagram || '',
                twitter: userProfile.socialLinks?.twitter || '',
                tiktok: userProfile.socialLinks?.tiktok || '',
                youtube: userProfile.socialLinks?.youtube || '',
                linkedin: userProfile.socialLinks?.linkedin || '',
                telegram: userProfile.socialLinks?.telegram || '',
                snapchat: userProfile.socialLinks?.snapchat || '',
                remarks: userProfile.remarks || ''
            });
        }
    }, [userProfile, isEditing]);

    const handleSaveProfile = () => {
        const updatedProfile: UserProfile = {
            ...(userProfile || defaultProfile) as UserProfile,
            name: editForm.name,
            bio: editForm.bio,
            remarks: editForm.remarks,
            socialLinks: {
                website: editForm.website,
                instagram: editForm.instagram,
                twitter: editForm.twitter,
                tiktok: editForm.tiktok,
                youtube: editForm.youtube,
                linkedin: editForm.linkedin,
                telegram: editForm.telegram,
                snapchat: editForm.snapchat,
            }
        };
        onUpdateProfile(updatedProfile);
        setIsEditing(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updated = { ...(userProfile || defaultProfile) as UserProfile, avatarUrl: reader.result as string };
                onUpdateProfile(updated);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleCategory = (catId: string) => {
        // Age restriction for sexual category (+18)
        if (catId === 'sexual') {
            const userAge = userProfile?.age ? parseInt(userProfile.age) : 0;
            if (userAge < 18) {
                alert(t.age_restricted);
                return;
            }
        }

        const current = userProfile?.activeCategories || defaultProfile.activeCategories || [];
        let updated = current.includes(catId) ? current.filter(c => c !== catId) : [...current, catId];
        const newProfile = { ...(userProfile || defaultProfile) as UserProfile, activeCategories: updated };
        onUpdateProfile(newProfile);
    };

    const postCount = dreams.length;
    const followerCount = (displayProfile.stats?.followers || 0) + (postCount * 3);
    const followingCount = displayProfile.stats?.following || 12;

    const getCatLabel = (id: string) => {
        const cat = GLOBAL_CATEGORIES.find(c => c.id === id);
        if (!cat) return id;
        switch (language) {
            case Language.DE: return cat.de;
            case Language.TR: return cat.tr;
            case Language.ES: return cat.es;
            case Language.FR: return cat.fr;
            case Language.AR: return cat.ar;
            case Language.PT: return cat.pt;
            case Language.RU: return cat.ru;
            default: return cat.en;
        }
    };

    const SocialLink = ({ iconKey, val, color }: { iconKey: string, val?: string, color: string }) => {
        if (!val) return null;
        let display = val.replace('https://', '').replace('www.', '').replace('instagram.com/', '').replace('twitter.com/', '').replace('tiktok.com/', '');
        if (display.length > 12) display = display.substring(0, 12) + '...';
        
        const href = val.startsWith('http') ? val : `https://${val}`;
        const svgPath = SOCIAL_ICONS[iconKey];

        const linkBg = isLight ? 'bg-slate-100 border-slate-300 hover:bg-slate-200' : 'bg-slate-800/50 border-white/5 hover:bg-slate-800';
        const linkText = isLight ? 'text-slate-600 group-hover:text-slate-900' : 'text-slate-300 group-hover:text-white';

        // UPDATED CSS: h-7 (28px) for ~50% slimmer look
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 h-7 px-2 rounded-lg border transition-all group ${linkBg} ${color}`}>
                <div className={`w-4 h-4 rounded flex items-center justify-center text-current group-hover:scale-110 transition-transform ${isLight ? 'bg-white' : 'bg-white/10'}`}>
                    {svgPath && (
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                            <path d={svgPath} />
                        </svg>
                    )}
                </div>
                <span className={`text-[9px] font-medium truncate ${linkText}`}>{display}</span>
            </a>
        );
    };

    const videoDreams = dreams.filter(d => d.videoUrl);
    const tier = displayProfile.subscriptionTier || SubscriptionTier.FREE;
    const tierLabel = tier === SubscriptionTier.PRO ? t.tier_gold : tier === SubscriptionTier.PLUS ? t.tier_silver : t.tier_free;
    const tierColor = tier === SubscriptionTier.PRO ? 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20' : tier === SubscriptionTier.PLUS ? 'text-slate-300 border-slate-400/30 bg-slate-800/40' : 'text-amber-700 border-amber-800/30 bg-amber-900/10';

    return (
        <div className={`max-w-2xl mx-auto pb-24 animate-in fade-in duration-500 bg-transparent min-h-screen ${textMain}`}>
            
            <div className={`${bgCard} backdrop-blur-xl rounded-[2rem] border overflow-hidden mb-6`}>
                
                <div className="h-24 bg-gradient-to-r from-fuchsia-900/40 via-purple-900/40 to-blue-900/40 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                </div>

                <div className="px-6 pb-6 -mt-10 relative z-10">
                    
                    <div className="flex justify-between items-end mb-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className={`w-24 h-24 rounded-full p-1 ${isLight ? 'bg-mystic-card' : 'bg-dream-card'} border border-white/20 shadow-xl`}>
                                <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center relative">
                                     {displayProfile.avatarUrl ? <img src={displayProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-4xl">🧙‍♂️</span>}
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-icons text-white">edit</span></div>
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
                        </div>

                        <div className="flex gap-6 mb-2">
                             <div className="text-center"><span className={`block text-lg font-bold ${textMain}`}>{postCount}</span><span className="text-xs text-slate-400 uppercase font-bold">{t.posts}</span></div>
                             <div className="text-center"><span className={`block text-lg font-bold ${textMain}`}>{followerCount}</span><span className="text-xs text-slate-400 uppercase font-bold">{t.followers}</span></div>
                             <div className="text-center"><span className={`block text-lg font-bold ${textMain}`}>{followingCount}</span><span className="text-xs text-slate-400 uppercase font-bold">{t.following}</span></div>
                        </div>
                    </div>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className={`text-2xl font-bold leading-tight ${textMain}`}>{displayProfile.name}</h1>
                            <div className={`text-sm mb-3 flex items-center gap-2 ${isLight ? 'text-fuchsia-700' : 'text-fuchsia-200'}`}>
                                {displayProfile.zodiacSign && <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 text-xs opacity-80">{displayProfile.zodiacSign}</span>}
                                <span className="opacity-70">{displayProfile.bio || t.bio_default}</span>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${tierColor}`}>
                            <span className="material-icons text-xs">verified</span>
                            {tierLabel}
                        </div>
                    </div>

                    {displayProfile.remarks && displayProfile.remarks.trim().length > 0 && (
                        <div className={`mb-4 p-3 rounded-xl border text-sm italic ${bgElement} ${textSub}`}>
                            "{displayProfile.remarks}"
                        </div>
                    )}

                    {displayProfile.socialLinks?.website && displayProfile.socialLinks.website.trim().length > 0 && (
                        <a href={displayProfile.socialLinks.website.startsWith('http') ? displayProfile.socialLinks.website : `https://${displayProfile.socialLinks.website}`} 
                           target="_blank" rel="noreferrer"
                           className="flex items-center gap-2 mb-4 text-blue-500 hover:text-blue-400 transition-colors bg-blue-900/10 px-3 py-2 rounded-lg border border-blue-500/30 w-max"
                        >
                            <span className="material-icons text-sm">public</span>
                            <span className="text-xs font-bold underline decoration-blue-500/50">{displayProfile.socialLinks.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                    )}

                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <SocialLink iconKey="instagram" val={displayProfile.socialLinks?.instagram} color="hover:border-pink-500/50 text-pink-500" />
                        <SocialLink iconKey="twitter" val={displayProfile.socialLinks?.twitter} color="hover:border-sky-500/50 text-sky-500" />
                        <SocialLink iconKey="tiktok" val={displayProfile.socialLinks?.tiktok} color="hover:border-slate-500/50 text-slate-500" />
                        <SocialLink iconKey="youtube" val={displayProfile.socialLinks?.youtube} color="hover:border-red-500/50 text-red-500" />
                        <SocialLink iconKey="linkedin" val={displayProfile.socialLinks?.linkedin} color="hover:border-blue-500/50 text-blue-500" />
                        <SocialLink iconKey="telegram" val={displayProfile.socialLinks?.telegram} color="hover:border-cyan-500/50 text-cyan-500" />
                        <SocialLink iconKey="snapchat" val={displayProfile.socialLinks?.snapchat} color="hover:border-yellow-500/50 text-yellow-500" />
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(!isEditing)} className={`flex-1 py-3 rounded-xl border text-xs font-bold uppercase tracking-wide min-h-[44px] ${bgElement} ${textMain}`}>{isEditing ? t.cancel : t.edit}</button>
                        <button className="flex-1 py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold uppercase tracking-wide shadow-lg min-h-[44px]">{t.share}</button>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className={`${isLight ? 'bg-white border-slate-200 shadow-xl' : 'bg-slate-900 border-white/10'} border rounded-3xl p-6 mb-8 animate-in slide-in-from-top-4`}>
                    
                    {/* IDENTITY SECTION */}
                    <h3 className="text-xs font-bold uppercase text-fuchsia-500 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">{t.basics_title}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <InputGroup label={t.name_label} value={editForm.name} onChange={v => setEditForm({...editForm, name: v})} placeholder="Dreamer" isLight={isLight} />
                        <InputGroup label={t.bio_label} value={editForm.bio} onChange={v => setEditForm({...editForm, bio: v})} placeholder="Dream Explorer" isLight={isLight} />
                    </div>

                    <h3 className="text-xs font-bold uppercase text-fuchsia-500 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">{t.remarks_label}</h3>
                    <textarea 
                        value={editForm.remarks} 
                        onChange={e => setEditForm({...editForm, remarks: e.target.value})} 
                        className={`w-full rounded-xl p-3 text-sm outline-none h-24 mb-6 resize-none border transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-fuchsia-500' : 'bg-black/40 border-white/10 text-white focus:border-fuchsia-500'}`}
                        placeholder={t.remarks_placeholder} 
                    />
                    
                    <h3 className="text-xs font-bold uppercase text-fuchsia-500 mb-4 border-b border-gray-100 dark:border-white/5 pb-2">{t.social_title}</h3>
                    <div className="space-y-3">
                         <InputGroup label={t.website_label} value={editForm.website} onChange={v => setEditForm({...editForm, website: v})} placeholder="example.com" isLight={isLight} />
                         <div className="grid grid-cols-2 gap-3">
                            <InputGroup label="Instagram" value={editForm.instagram} onChange={v => setEditForm({...editForm, instagram: v})} placeholder="@username" isLight={isLight} />
                            <InputGroup label="Twitter / X" value={editForm.twitter} onChange={v => setEditForm({...editForm, twitter: v})} placeholder="@username" isLight={isLight} />
                            <InputGroup label="TikTok" value={editForm.tiktok} onChange={v => setEditForm({...editForm, tiktok: v})} placeholder="@username" isLight={isLight} />
                            <InputGroup label="YouTube" value={editForm.youtube} onChange={v => setEditForm({...editForm, youtube: v})} placeholder="Channel" isLight={isLight} />
                            <InputGroup label="LinkedIn" value={editForm.linkedin} onChange={v => setEditForm({...editForm, linkedin: v})} placeholder="URL" isLight={isLight} />
                            <InputGroup label="Telegram" value={editForm.telegram} onChange={v => setEditForm({...editForm, telegram: v})} placeholder="@user" isLight={isLight} />
                            <InputGroup label="Snapchat" value={editForm.snapchat} onChange={v => setEditForm({...editForm, snapchat: v})} placeholder="@user" isLight={isLight} />
                         </div>
                         <button onClick={handleSaveProfile} className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white shadow-lg mt-4 flex items-center justify-center gap-2">
                             <span className="material-icons text-sm">save</span> {t.save}
                         </button>
                    </div>
                </div>
            )}

            <div className="flex gap-4 overflow-x-auto pb-4 mb-2 scrollbar-hide px-1">
                 <div className="flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group" onClick={() => setShowCategoryModal(true)}>
                      <div className={`w-14 h-14 rounded-full border-2 border-dashed border-slate-400 group-hover:border-fuchsia-400 flex items-center justify-center transition-all ${isLight ? 'bg-white' : 'bg-white/5'}`}>
                          <span className="material-icons text-slate-400 group-hover:text-fuchsia-500 text-xl">add</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-500">{t.manage_cats}</span>
                 </div>
                 {(displayProfile.activeCategories || []).map((catId) => (
                      <div key={catId} className={`flex flex-col items-center gap-1 min-w-[64px] p-1 rounded-xl border ${isLight ? 'bg-white border-indigo-100' : 'bg-white/5 border-white/10'}`}>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-lg">
                              {catId === 'nightmare' ? '👻' : catId === 'lucid' ? '👁️' : catId === 'recurring' ? '🔁' : '✨'}
                          </div>
                          <span className="text-[9px] font-bold uppercase text-center leading-tight">{getCatLabel(catId)}</span>
                          <span onClick={() => toggleCategory(catId)} className="text-[8px] text-red-400 cursor-pointer hover:text-red-300"><span className="material-icons text-[10px]">remove_circle</span></span>
                      </div>
                 ))}
            </div>

            {/* Tabs - Updated Labels */}
            <div className={`flex p-1 rounded-xl mb-6 ${bgElement}`}>
                 <button onClick={() => setActiveTab('grid')} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] ${activeTab === 'grid' ? (isLight ? 'bg-white text-indigo-900 shadow' : 'bg-slate-800 text-white shadow') : 'text-slate-400'}`}>{t.tab_grid}</button>
                 <button onClick={() => setActiveTab('video')} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] ${activeTab === 'video' ? (isLight ? 'bg-white text-indigo-900 shadow' : 'bg-slate-800 text-white shadow') : 'text-slate-400'}`}>{t.tab_video}</button>
                 <button onClick={() => setActiveTab('matches')} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] ${activeTab === 'matches' ? (isLight ? 'bg-white text-indigo-900 shadow' : 'bg-slate-800 text-white shadow') : 'text-slate-400'}`}>{t.tab_matches}</button>
                 <button onClick={() => setActiveTab('audio')} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] ${activeTab === 'audio' ? (isLight ? 'bg-white text-indigo-900 shadow' : 'bg-slate-800 text-white shadow') : 'text-slate-400'}`}>{t.tab_audio}</button>
            </div>

            {/* Grid Tab */}
            {activeTab === 'grid' && (
                <div className="grid grid-cols-3 gap-1">
                    {dreams.map(dream => (
                        <div key={dream.id} onClick={() => setSelectedDream(dream)} className="aspect-square bg-slate-800 rounded-lg overflow-hidden relative cursor-pointer group">
                             {dream.imageUrl ? <img src={dream.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><span className="material-icons">image</span></div>}
                             <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                 <span className="flex items-center gap-1 text-[10px] text-white"><span className="material-icons text-[10px]">favorite</span> {dream.likes}</span>
                             </div>
                        </div>
                    ))}
                    {dreams.length === 0 && (
                        <div className="col-span-3 py-10 text-center opacity-50">
                            <span className="material-icons text-4xl mb-2 text-slate-400">bedtime_off</span>
                            <p className="text-xs font-bold uppercase tracking-wide">{t.no_posts}</p>
                            <p className="text-xs">{t.no_posts_desc}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Video Tab */}
            {activeTab === 'video' && (
                <div className="space-y-4">
                     {videoDreams.length > 0 ? videoDreams.map(dream => (
                         <div key={dream.id} className="rounded-2xl overflow-hidden border border-white/10 relative cursor-pointer hover:border-fuchsia-500/50 transition-all" onClick={() => onPlayVideo?.(dream.videoUrl!)}>
                             <div className="w-full h-48 bg-gradient-to-br from-fuchsia-900/40 to-indigo-900/40 flex items-center justify-center">
                                 <span className="material-icons text-5xl text-white/60">play_circle</span>
                             </div>
                             <div className="p-3 bg-slate-900/80">
                                 <h4 className="text-sm font-bold text-white">{dream.title}</h4>
                                 <p className="text-xs text-slate-400">{dream.date}</p>
                             </div>
                         </div>
                     )) : (
                        <div className="py-10 text-center opacity-50">
                            <span className="material-icons text-4xl mb-2 text-slate-400">videocam_off</span>
                            <p className="text-xs font-bold uppercase tracking-wide">{t.no_videos}</p>
                            <p className="text-xs">{t.no_videos_desc}</p>
                        </div>
                     )}
                </div>
            )}

            {/* Matches Tab */}
            {activeTab === 'matches' && (
                <div className="space-y-3">
                    {MOCK_MATCHES.map(match => (
                        <div key={match.id} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/40 border-white/5'}`}>
                             <div className="relative">
                                 <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl">{match.avatar}</div>
                                 {match.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black"></div>}
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between">
                                     <h4 className={`font-bold text-sm ${textMain}`}>{match.name}</h4>
                                     <span className="text-xs font-bold text-fuchsia-500">{match.match}% {t.match_score}</span>
                                 </div>
                                 <p className={`text-xs ${textSub}`}>{match.bio}</p>
                             </div>
                             <button className="w-11 h-11 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 flex items-center justify-center text-white transition-colors"><span className="material-icons text-sm">chat</span></button>
                        </div>
                    ))}
                </div>
            )}

            {/* Audio Tab */}
            {activeTab === 'audio' && (
                <AudioLibrary dreams={dreams} language={language} themeMode={themeMode} onUpdateDream={onUpdateDream} />
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowCategoryModal(false)}>
                     <div className={`w-full max-w-sm ${isLight ? 'bg-white' : 'bg-dream-deep'} border border-fuchsia-500/30 rounded-3xl p-6 shadow-2xl`} onClick={e => e.stopPropagation()}>
                         <div className="flex justify-between items-center mb-4">
                             <h3 className={`text-lg font-bold font-mystic ${textMain}`}>{t.new_story}</h3>
                             <button onClick={() => setShowCategoryModal(false)} className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors" aria-label="Close"><span className="material-icons text-sm">close</span></button>
                         </div>
                         <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                             {GLOBAL_CATEGORIES.map(cat => {
                                 const isActive = (displayProfile.activeCategories || []).includes(cat.id);
                                 return (
                                     <button 
                                        key={cat.id} 
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${isActive ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : (isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800')}`}
                                     >
                                         <span className="text-xs font-bold flex items-center gap-1">
                                            {getCatLabel(cat.id)}
                                            {cat.id === 'sexual' && <span className="text-[8px] bg-red-600 text-white px-1 py-0.5 rounded font-bold">+18</span>}
                                        </span>
                                         {isActive && <span className="material-icons text-xs">check</span>}
                                     </button>
                                 );
                             })}
                         </div>
                     </div>
                </div>
            )}

            {/* Selected Dream Modal - UPDATED with Video Button & Share Buttons */}
            {selectedDream && (
                <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in zoom-in-95 duration-300" onClick={() => setSelectedDream(null)}>
                     <div className="bg-dream-card border border-white/10 w-full max-w-lg h-[85vh] rounded-3xl overflow-y-auto relative flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                         <div className="h-64 bg-slate-900 relative shrink-0">
                             {selectedDream.imageUrl ? <img src={selectedDream.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><span className="material-icons text-6xl">image</span></div>}
                             <button onClick={() => setSelectedDream(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full text-white flex items-center justify-center hover:bg-black/70"><span className="material-icons">close</span></button>
                             <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-lg text-xs font-bold border border-white/10 text-white">{selectedDream.date}</div>
                         </div>
                         <div className="p-8">
                             {/* User Description Block */}
                             <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
                                 <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">{t.your_dream}</h4>
                                 <p className="text-slate-300 text-sm italic leading-relaxed">"{selectedDream.description}"</p>
                             </div>

                             <h2 className="text-2xl font-mystic text-white mb-4">{selectedDream.title}</h2>
                             
                             {/* Interpretation with proper whitespace formatting */}
                             <div className="prose prose-invert prose-sm max-w-none mb-6">
                                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{selectedDream.interpretation}</p>
                             </div>
                             
                             <div className="mb-6 flex gap-2 flex-wrap">
                                {selectedDream.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-[10px] uppercase tracking-wider text-slate-400 border border-white/5">{tag}</span>
                                ))}
                             </div>

                             {/* Play saved video */}
                             {selectedDream.videoUrl && onPlayVideo && (
                             <button
                                onClick={() => onPlayVideo(selectedDream.videoUrl!)}
                                className="w-full py-3 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-fuchsia-500/30 transition-all mb-2"
                             >
                                <span className="material-icons">play_circle</span> {(t as any).btn_play_video}
                             </button>
                             )}

                             {/* Generate Video Buttons */}
                             <button
                                onClick={() => onGenerateVideo(selectedDream.description, selectedDream.id)}
                                className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-amber-500/30 transition-all mb-2"
                             >
                                <span className="material-icons">movie</span> {t.btn_video}
                             </button>

                             {/* Dream Narration Video (raw dream, AI voice) */}
                             {onGenerateNarrationVideo && (
                             <button
                                onClick={() => onGenerateNarrationVideo(selectedDream.description, selectedDream.id)}
                                className="w-full py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-indigo-500/30 transition-all mb-2"
                             >
                                <span className="material-icons">auto_stories</span> {(t as any).btn_narration}
                             </button>
                             )}

                             {/* User Voice Video (raw dream, user's own voice) */}
                             {onGenerateUserVoiceVideo && selectedDream.audioUrl && selectedDream.audioSource !== 'livechat' && (
                             <button
                                onClick={() => onGenerateUserVoiceVideo(selectedDream.description, selectedDream.audioUrl!, selectedDream.id)}
                                className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-emerald-500/30 transition-all mb-2"
                             >
                                <span className="material-icons">mic</span> {(t as any).btn_user_voice}
                             </button>
                             )}

                             {/* --- SHARE & PDF BUTTONS --- */}
                             <DreamShare dream={selectedDream} language={language} userProfile={userProfile} />
                         </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
