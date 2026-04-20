// ─── dreamMapService.ts ───────────────────────────────────────────────────────
// Liefert Daten fuer die Traumkarte aus Supabase (user_dreams + dream_reports).
// Gibt null zurueck wenn Supabase nicht konfiguriert ist → Fallback auf BASE_USERS.
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// ─── Typen ────────────────────────────────────────────────────────────────────

export interface MapDreamUser {
  id: string
  name: string
  avatar: string
  city: string
  country: string
  lat: number
  lng: number
  category: string
  mood: string
  dreamSummary: string
  matchPct: number
  privacy: 'public' | 'partial' | 'private'
  memberSince: string
  bio: string
  dreamCount: number
  matchCount: number
  favCategory: string
}

// ─── Konstanten ───────────────────────────────────────────────────────────────

const AVATAR_POOL = [
  '👩','👩🏻','👩🏽','👩🏿','👨','👨🏻','👨🏽','👨🏿',
  '🧑','🧑🏻','🧑🏽','🧑🏿','👱‍♀️','👩‍🦰','👩‍🦱','👩‍🦳',
]

const VALID_CATEGORIES = new Set([
  'horror','funny','ufo','love','erotic','flying','falling','water',
  'animals','death','chase','family','money','school','spiritual',
  'nature','timetravel','celebrity',
])

const VALID_MOODS = new Set([
  'scared','happy','sad','confused','peaceful','anxious','excited',
  'free','yearning','passionate','amazed','euphoric','terrified',
  'melancholic','serene','mystified','wonder','star-struck','eerie',
  'amused','nostalgic','guided','intense','bliss','transcendent',
  'breathless','warm','longing','thrilled','calm','joyful','dizzy',
])

// Anonyme Vorname-Listen pro Region
const ANON_FIRST_NAMES: Record<string, string[]> = {
  US: ['Alex','Jordan','Morgan','Taylor','Casey','Riley','Drew','Cameron'],
  DE: ['Lea','Jan','Nico','Mia','Luca','Anna','Erik','Sophie'],
  GB: ['Sam','Chris','Jamie','Robin','Charlie','Emma','Oliver','Isla'],
  FR: ['Lea','Jules','Emma','Hugo','Chloe','Louis','Camille','Theo'],
  JP: ['Yuki','Hana','Rin','Sora','Miku','Kai','Aoi','Ren'],
  CN: ['Wei','Mei','Lin','Jia','Xiao','Yu','Fang','Ying'],
  KR: ['Ji','Soo','Min','Hana','Yuna','Jae','Eun','Da'],
  IN: ['Priya','Ananya','Rahul','Kavya','Arjun','Sneha','Ravi','Nisha'],
  BR: ['Ana','Lucas','Julia','Pedro','Camila','Gabriel','Beatriz','Iago'],
  DEFAULT: ['Dream','Luna','Nova','Sky','Echo','Miro','Sage','River'],
}

// Survey → Koordinaten-Bereiche [latMin, latMax, lngMin, lngMax]
const SURVEY_COORD_RANGES: Record<string, [number,number,number,number]> = {
  Pandemic:          [25, 65, -125,  55],  // USA + Europa
  Nepal:             [26, 30,  80,  88],   // Nepal
  'Santa Clara':     [37, 38, -122,-121],  // Kalifornien
  'Krippner':        [-60, 80, -180, 180], // weltweit
}

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function coordsForSurvey(surveyName: string | null): [number, number] {
  if (surveyName) {
    for (const [key, range] of Object.entries(SURVEY_COORD_RANGES)) {
      if (surveyName.includes(key)) {
        return [
          randomBetween(range[0], range[1]),
          randomBetween(range[2], range[3]),
        ]
      }
    }
  }
  // Bewohnte Gebiete-Verteilung (kein offener Ozean)
  const zones: [number,number,number,number][] = [
    [35, 60,  -10,  40],  // Europa
    [25, 55,   60, 140],  // Asien
    [25, 55,  -80, -40],  // Nordamerika Ost
    [30, 50, -125, -80],  // Nordamerika West
    [-35,  5,  -80, -35], // Suedamerika
    [ -5, 20,  -20,  50], // Afrika
    [-35, -5,   15,  50], // Suedafrika
    [ 20, 35,   60,  80], // Suedasien
  ]
  const zone = pickRandom(zones)
  return [
    randomBetween(zone[0], zone[1]),
    randomBetween(zone[2], zone[3]),
  ]
}

function anonName(countryCode: string | null, city: string | null, surveyName?: string | null): string {
  // Zeige Survey/Studie als Identifier statt Fake-Namen
  if (surveyName) {
    const short = surveyName.length > 25 ? surveyName.substring(0, 25) + '...' : surveyName
    return `🔬 ${short}`
  }
  // Fallback: Anonymer Teilnehmer mit Land
  const code = (countryCode ?? '??').toUpperCase()
  return `Teilnehmer (${code})`
}

function normalizeCategory(raw: string | null): string {
  if (!raw) return 'flying'
  const lower = raw.toLowerCase()
  // Direkt-Match
  if (VALID_CATEGORIES.has(lower)) return lower
  // Fuzzy-Map
  const map: Record<string, string> = {
    fly: 'flying', fall: 'falling', run: 'chase', chase: 'chase',
    water: 'water', love: 'love', sex: 'erotic', scary: 'horror',
    ghost: 'horror', alien: 'ufo', space: 'ufo', dead: 'death',
    die: 'death', family: 'family', money: 'money', school: 'school',
    exam: 'school', spiritual: 'spiritual', religious: 'spiritual',
    nature: 'nature', animal: 'animals', time: 'timetravel',
    celebrity: 'celebrity', funny: 'funny', laugh: 'funny',
  }
  for (const [key, cat] of Object.entries(map)) {
    if (lower.includes(key)) return cat
  }
  return 'flying'
}

function normalizeMood(raw: string | null): string {
  if (!raw) return 'mysterious'
  const lower = raw.toLowerCase()
  if (VALID_MOODS.has(lower)) return lower
  return lower.slice(0, 20) || 'mysterious'
}

function randomMatchPct(seed: string): number {
  // Stabiler Pseudozufall basierend auf ID-String
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return 35 + (hash % 64) // 35-98
}

function formatMemberSince(dateStr: string): string {
  return dateStr.slice(0, 7) // YYYY-MM
}

// ─── Supabase REST-Abfragen ───────────────────────────────────────────────────

interface RawUserDream {
  id: string
  text: string
  anonymous_name: string | null
  country_code: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  category: string | null
  mood: string | null
  created_at: string
}

interface RawDreamReport {
  id: string
  text: string
  survey_name: string | null
  language: string | null
  tags: string[] | null
  created_at: string
}

async function fetchFromSupabase<T>(
  table: string,
  params: URLSearchParams,
): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Supabase ${table}: ${res.status}`)
  return res.json()
}

// ─── Transformation ───────────────────────────────────────────────────────────

function userDreamToMap(d: RawUserDream): MapDreamUser {
  const lat = d.latitude ?? coordsForSurvey(null)[0]
  const lng = d.longitude ?? coordsForSurvey(null)[1]
  const category = normalizeCategory(d.category)
  return {
    id: `ud_${d.id}`,
    name: d.anonymous_name ?? anonName(d.country_code, d.city),
    avatar: pickRandom(AVATAR_POOL),
    city: d.city ?? '?',
    country: d.country_code ?? '?',
    lat,
    lng,
    category,
    mood: normalizeMood(d.mood),
    dreamSummary: d.text.slice(0, 500),
    matchPct: randomMatchPct(d.id),
    privacy: 'partial',
    memberSince: formatMemberSince(d.created_at),
    bio: 'Traumreisende/r auf der Traumkarte.',
    dreamCount: 1,
    matchCount: 0,
    favCategory: category,
  }
}

function dreamReportToMap(r: RawDreamReport): MapDreamUser {
  const [lat, lng] = coordsForSurvey(r.survey_name)
  const category = normalizeCategory((r.tags ?? [])[0] ?? null)
  return {
    id: `dr_${r.id}`,
    name: anonName(null, null, r.survey_name),
    avatar: '🔬',
    city: '?',
    country: (r.language ?? 'en').toUpperCase().slice(0, 2),
    lat,
    lng,
    category,
    mood: 'mysterious',
    dreamSummary: r.text.slice(0, 500),
    matchPct: randomMatchPct(r.id),
    privacy: 'partial',
    memberSince: formatMemberSince(r.created_at),
    bio: 'Historischer Traumbericht aus einer Traumstudie.',
    dreamCount: 1,
    matchCount: 0,
    favCategory: category,
  }
}

// ─── Haupt-Export ─────────────────────────────────────────────────────────────

/**
 * Laedt echte Traumdaten aus Supabase fuer die Traumkarte.
 * Gibt null zurueck wenn Supabase nicht konfiguriert oder nicht erreichbar ist.
 */
export async function fetchMapDreams(): Promise<MapDreamUser[] | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null
  }

  try {
    // Lade wissenschaftliche Teilnehmer + echte dream_reports
    const [userDreams, dreamReports, studyMarkers, individualParticipants] = await Promise.all([
      fetchFromSupabase<RawUserDream>(
        'user_dreams',
        new URLSearchParams({
          select: 'id,text,anonymous_name,country_code,city,latitude,longitude,category,mood,created_at',
          is_public: 'eq.true',
          order: 'created_at.desc',
          limit: '50',
        }),
      ),
      fetchFromSupabase<RawDreamReport>(
        'dream_reports',
        new URLSearchParams({
          select: 'id,text,survey_name,language,tags,created_at',
          order: 'created_at.desc',
          limit: '200',
        }),
      ),
      fetchFromSupabase<any>(
        'study_map_markers',
        new URLSearchParams({
          select: 'study_code,lat,lng,city,country,dream_count,map_color',
          limit: '500',
        }),
      ).catch(() => [] as any[]),
      // Individual research participants — verlinkt zu ParticipantProfile
      fetchFromSupabase<any>(
        'research_participants',
        new URLSearchParams({
          select: 'id,participant_id,country,lat,lng,dream_count,study_id',
          'dream_count': 'gt.0',
          'lat': 'not.is.null',
          order: 'dream_count.desc',
          limit: '500',
        }),
      ).catch(() => [] as any[]),
    ])

    // Studie-Aggregat-Marker (für Cluster-Übersicht)
    const researchUsers: MapDreamUser[] = (studyMarkers || []).map((rp: any, i: number) => ({
      id: `research-${rp.study_code}-${i}`,
      name: `🔬 ${rp.study_code}`,
      avatar: '🔬',
      city: rp.city || '',
      country: rp.country || '',
      lat: rp.lat || 0,
      lng: rp.lng || 0,
      category: 'spiritual',
      mood: 'peaceful',
      dreamSummary: `${rp.dream_count || 0} wissenschaftliche Traumberichte`,
      matchPct: 0,
      privacy: 'partial' as const,
      memberSince: '',
      bio: `Forschungsdaten aus Studie ${rp.study_code}`,
      dreamCount: rp.dream_count || 0,
      matchCount: 0,
      favCategory: 'spiritual',
    }))

    // Individuelle Forschungsteilnehmer → verlinkt zu ParticipantProfile via rp_ prefix
    const individualUsers: MapDreamUser[] = (individualParticipants || [])
      .filter((p: any) => p.lat && p.lng)
      .map((p: any) => ({
        id: `rp_${p.participant_id || p.id}`,  // rp_ prefix → DreamMap routet zu onSelectParticipant; participant_id für ParticipantProfile-Query
        name: p.participant_id || `Teilnehmer`,
        avatar: '🔬',
        city: '',
        country: p.country || '?',
        lat: p.lat,
        lng: p.lng,
        category: 'spiritual',
        mood: 'peaceful',
        dreamSummary: `${p.dream_count || 0} Träume in der Studie`,
        matchPct: 98,
        privacy: 'partial' as const,
        memberSince: '',
        bio: 'Forschungsteilnehmer — Profil mit Originaldaten ansehen',
        dreamCount: p.dream_count || 0,
        matchCount: 0,
        favCategory: 'spiritual',
      }))

    // Mindestens ein Datensatz vorhanden?
    if (userDreams.length === 0 && dreamReports.length === 0 && researchUsers.length === 0) {
      return null
    }

    // Shuffle und limitiere dream_reports auf 150 fuer die Karte
    const shuffledReports = dreamReports
      .sort(() => Math.random() - 0.5)
      .slice(0, 150)

    const result: MapDreamUser[] = [
      ...individualUsers,      // Einzelprofile zuerst — mit Profil-Link
      ...researchUsers,        // Studie-Aggregate
      ...userDreams.map(userDreamToMap),
      ...shuffledReports.map(dreamReportToMap),
    ]

    return result
  } catch (err) {
    console.warn('dreamMapService: Supabase nicht erreichbar, nutze Fallback.', err)
    return null
  }
}
