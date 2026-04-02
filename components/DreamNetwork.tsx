import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Language, ThemeMode, Dream } from '../types';
import { getTheme } from '../theme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DreamNetworkProps {
    language: Language;
    themeMode: ThemeMode;
    dreams: Dream[];
    onClose: () => void;
}

interface NetworkNode {
    id: string;
    label: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    count: number;
    color: string;
    radius: number;
}

interface NetworkEdge {
    source: string;
    target: string;
    strength: number;
}

// ─── Category Definitions ────────────────────────────────────────────────────

const CATEGORIES = [
    {
        id: 'water',
        color: '#38bdf8',
        keywords: ['wasser', 'water', 'su', 'agua', 'eau', 'ماء', 'água', 'вода', 'meer', 'see', 'fluss', 'regen', 'ocean', 'sea', 'river', 'lake', 'rain', 'flood', 'wave'],
    },
    {
        id: 'flying',
        color: '#a78bfa',
        keywords: ['fliegen', 'flying', 'uçmak', 'volar', 'voler', 'طيران', 'voar', 'полёт', 'fly', 'flug', 'schwebend', 'float', 'heaven', 'sky', 'cloud', 'wolke', 'himmel'],
    },
    {
        id: 'falling',
        color: '#fb923c',
        keywords: ['fallen', 'falling', 'düşmek', 'caer', 'tomber', 'سقوط', 'cair', 'падение', 'fall', 'sturz', 'absturz', 'drop', 'sink'],
    },
    {
        id: 'animals',
        color: '#f59e0b',
        keywords: ['tier', 'animal', 'hayvan', 'hund', 'katze', 'schlange', 'dog', 'cat', 'snake', 'wolf', 'bär', 'bear', 'lion', 'löwe', 'vogel', 'bird', 'fish', 'fisch', 'spider', 'spinne'],
    },
    {
        id: 'fear',
        color: '#ef4444',
        keywords: ['angst', 'fear', 'korku', 'miedo', 'peur', 'خوف', 'medo', 'страх', 'albtraum', 'nightmare', 'horror', 'monster', 'dunkel', 'dark', 'shadow', 'schatten', 'böse', 'evil'],
    },
    {
        id: 'spiritual',
        color: '#c084fc',
        keywords: ['spirituell', 'spiritual', 'manevi', 'gott', 'god', 'engel', 'angel', 'licht', 'light', 'heilig', 'holy', 'geist', 'spirit', 'seele', 'soul', 'temple', 'tempel', 'pray', 'beten'],
    },
    {
        id: 'death',
        color: '#64748b',
        keywords: ['tod', 'death', 'ölüm', 'muerte', 'mort', 'موت', 'morte', 'смерть', 'sterben', 'die', 'grave', 'grab', 'funeral', 'begräbnis', 'ende', 'end'],
    },
    {
        id: 'love',
        color: '#ec4899',
        keywords: ['liebe', 'love', 'aşk', 'amor', 'amour', 'حب', 'любовь', 'herz', 'heart', 'romance', 'kiss', 'kuss', 'hug', 'umarmung', 'partner', 'beziehung', 'relationship'],
    },
    {
        id: 'chase',
        color: '#f97316',
        keywords: ['verfolg', 'chase', 'koval', 'perseguir', 'poursuivre', 'مطاردة', 'rennen', 'run', 'fliehen', 'flee', 'escape', 'flucht', 'jagen', 'hunt'],
    },
    {
        id: 'house',
        color: '#4ade80',
        keywords: ['haus', 'house', 'ev', 'casa', 'maison', 'بيت', 'дом', 'home', 'room', 'zimmer', 'keller', 'basement', 'dach', 'roof', 'fenster', 'window', 'tür', 'door'],
    },
];

// ─── Translations ─────────────────────────────────────────────────────────────

const TRANSLATIONS: Record<string, {
    title: string;
    subtitle: string;
    your_dreams: string;
    most_common: string;
    times: string;
    community_soon: string;
    community_desc: string;
    no_data: string;
    no_data_desc: string;
    categories: Record<string, string>;
}> = {
    en: {
        title: 'Dream Network',
        subtitle: 'Your dream themes at a glance',
        your_dreams: 'Your dreams',
        most_common: 'Most frequent',
        times: 'x',
        community_soon: 'Community: Who dreams similarly?',
        community_desc: 'Coming Soon',
        no_data: 'No dreams yet',
        no_data_desc: 'Record your first dream to see the network.',
        categories: {
            water: 'Water', flying: 'Flying', falling: 'Falling', animals: 'Animals',
            fear: 'Fear', spiritual: 'Spiritual', death: 'Death', love: 'Love',
            chase: 'Chase', house: 'House',
        },
    },
    de: {
        title: 'Traum-Netzwerk',
        subtitle: 'Deine Traumthemen auf einen Blick',
        your_dreams: 'Deine Träume',
        most_common: 'Häufigstes',
        times: 'x',
        community_soon: 'Community: Wer träumt ähnlich?',
        community_desc: 'Demnächst',
        no_data: 'Noch keine Träume',
        no_data_desc: 'Zeichne deinen ersten Traum auf, um das Netzwerk zu sehen.',
        categories: {
            water: 'Wasser', flying: 'Fliegen', falling: 'Fallen', animals: 'Tiere',
            fear: 'Angst', spiritual: 'Spirituell', death: 'Tod', love: 'Liebe',
            chase: 'Verfolgt', house: 'Haus',
        },
    },
    tr: {
        title: 'Rüya Ağı',
        subtitle: 'Rüya temalarına genel bakış',
        your_dreams: 'Rüyalarım',
        most_common: 'En sık',
        times: 'x',
        community_soon: 'Topluluk: Kim benzer rüyalar görüyor?',
        community_desc: 'Yakında',
        no_data: 'Henüz rüya yok',
        no_data_desc: 'Ağı görmek için ilk rüyanı kaydet.',
        categories: {
            water: 'Su', flying: 'Uçmak', falling: 'Düşmek', animals: 'Hayvanlar',
            fear: 'Korku', spiritual: 'Manevi', death: 'Ölüm', love: 'Aşk',
            chase: 'Kovalanmak', house: 'Ev',
        },
    },
    es: {
        title: 'Red de Sueños',
        subtitle: 'Tus temas de sueños de un vistazo',
        your_dreams: 'Tus sueños',
        most_common: 'Más frecuente',
        times: 'x',
        community_soon: '¿Quién sueña de forma similar?',
        community_desc: 'Próximamente',
        no_data: 'Sin sueños aún',
        no_data_desc: 'Registra tu primer sueño para ver la red.',
        categories: {
            water: 'Agua', flying: 'Volar', falling: 'Caer', animals: 'Animales',
            fear: 'Miedo', spiritual: 'Espiritual', death: 'Muerte', love: 'Amor',
            chase: 'Persecución', house: 'Casa',
        },
    },
    fr: {
        title: 'Réseau de Rêves',
        subtitle: 'Vos thèmes de rêves en un coup d\'œil',
        your_dreams: 'Vos rêves',
        most_common: 'Le plus fréquent',
        times: 'x',
        community_soon: 'Qui rêve de façon similaire?',
        community_desc: 'Bientôt',
        no_data: 'Pas encore de rêves',
        no_data_desc: 'Enregistrez votre premier rêve pour voir le réseau.',
        categories: {
            water: 'Eau', flying: 'Voler', falling: 'Tomber', animals: 'Animaux',
            fear: 'Peur', spiritual: 'Spirituel', death: 'Mort', love: 'Amour',
            chase: 'Poursuite', house: 'Maison',
        },
    },
    ar: {
        title: 'شبكة الأحلام',
        subtitle: 'موضوعات أحلامك في لمحة',
        your_dreams: 'أحلامك',
        most_common: 'الأكثر شيوعاً',
        times: 'x',
        community_soon: 'المجتمع: من يحلم بشكل مماثل؟',
        community_desc: 'قريباً',
        no_data: 'لا أحلام بعد',
        no_data_desc: 'سجّل حلمك الأول لترى الشبكة.',
        categories: {
            water: 'ماء', flying: 'طيران', falling: 'سقوط', animals: 'حيوانات',
            fear: 'خوف', spiritual: 'روحاني', death: 'موت', love: 'حب',
            chase: 'مطاردة', house: 'بيت',
        },
    },
    pt: {
        title: 'Rede de Sonhos',
        subtitle: 'Seus temas de sonhos de relance',
        your_dreams: 'Seus sonhos',
        most_common: 'Mais frequente',
        times: 'x',
        community_soon: 'Quem sonha de forma similar?',
        community_desc: 'Em breve',
        no_data: 'Sem sonhos ainda',
        no_data_desc: 'Registre seu primeiro sonho para ver a rede.',
        categories: {
            water: 'Água', flying: 'Voar', falling: 'Cair', animals: 'Animais',
            fear: 'Medo', spiritual: 'Espiritual', death: 'Morte', love: 'Amor',
            chase: 'Perseguição', house: 'Casa',
        },
    },
    ru: {
        title: 'Сеть Снов',
        subtitle: 'Темы ваших снов с первого взгляда',
        your_dreams: 'Ваши сны',
        most_common: 'Чаще всего',
        times: 'x',
        community_soon: 'Кто видит похожие сны?',
        community_desc: 'Скоро',
        no_data: 'Снов пока нет',
        no_data_desc: 'Запишите первый сон, чтобы увидеть сеть.',
        categories: {
            water: 'Вода', flying: 'Полёт', falling: 'Падение', animals: 'Животные',
            fear: 'Страх', spiritual: 'Духовное', death: 'Смерть', love: 'Любовь',
            chase: 'Погоня', house: 'Дом',
        },
    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractCategoryCount(dreams: Dream[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const dream of dreams) {
        const text = [dream.title, dream.description, dream.interpretation].join(' ').toLowerCase();
        for (const cat of CATEGORIES) {
            for (const kw of cat.keywords) {
                if (text.includes(kw)) {
                    counts[cat.id] = (counts[cat.id] ?? 0) + 1;
                    break; // Count each category once per dream
                }
            }
        }
    }
    return counts;
}

function coOccurrenceStrength(catA: string, catB: string, dreams: Dream[]): number {
    let coOccur = 0;
    const kwA = CATEGORIES.find((c) => c.id === catA)?.keywords ?? [];
    const kwB = CATEGORIES.find((c) => c.id === catB)?.keywords ?? [];
    for (const dream of dreams) {
        const text = [dream.title, dream.description, dream.interpretation].join(' ').toLowerCase();
        const hasA = kwA.some((kw) => text.includes(kw));
        const hasB = kwB.some((kw) => text.includes(kw));
        if (hasA && hasB) coOccur++;
    }
    return coOccur;
}

// ─── Physics Simulation ───────────────────────────────────────────────────────

const W = 320;
const H = 280;
const CENTER_X = W / 2;
const CENTER_Y = H / 2;

function runSimulation(
    nodes: NetworkNode[],
    edges: NetworkEdge[],
    iterations: number
): NetworkNode[] {
    const ns = nodes.map((n) => ({ ...n }));
    const REPULSION = 3000;
    const ATTRACT = 0.03;
    const DAMPING = 0.7;
    const PADDING = 32;

    for (let iter = 0; iter < iterations; iter++) {
        // Reset forces
        for (const n of ns) { n.vx = 0; n.vy = 0; }

        // Repulsion between all nodes
        for (let i = 0; i < ns.length; i++) {
            for (let j = i + 1; j < ns.length; j++) {
                const dx = ns[i].x - ns[j].x;
                const dy = ns[i].y - ns[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = REPULSION / (dist * dist);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                ns[i].vx += fx;
                ns[i].vy += fy;
                ns[j].vx -= fx;
                ns[j].vy -= fy;
            }
        }

        // Attraction along edges
        for (const edge of edges) {
            const a = ns.find((n) => n.id === edge.source);
            const b = ns.find((n) => n.id === edge.target);
            if (!a || !b) continue;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = dist * ATTRACT * edge.strength;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            a.vx += fx; a.vy += fy;
            b.vx -= fx; b.vy -= fy;
        }

        // Center gravity (weak)
        for (const n of ns) {
            n.vx += (CENTER_X - n.x) * 0.005;
            n.vy += (CENTER_Y - n.y) * 0.005;
        }

        // Apply velocity + damping + clamp to canvas
        for (const n of ns) {
            n.x += n.vx * DAMPING;
            n.y += n.vy * DAMPING;
            n.x = Math.max(PADDING, Math.min(W - PADDING, n.x));
            n.y = Math.max(PADDING, Math.min(H - PADDING, n.y));
        }
    }
    return ns;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DreamNetwork: React.FC<DreamNetworkProps> = ({ language, themeMode, dreams, onClose }) => {
    const isDark = themeMode === ThemeMode.DARK;
    const th = getTheme(themeMode || ThemeMode.DARK);
    const lang = (typeof language === 'string' ? language : String(language)).toLowerCase();
    const t = TRANSLATIONS[lang] ?? TRANSLATIONS['en'];

    const [nodes, setNodes] = useState<NetworkNode[]>([]);
    const [edges, setEdges] = useState<NetworkEdge[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [pulse, setPulse] = useState(0);
    const rafRef = useRef<number | null>(null);
    const iterRef = useRef(0);
    const nodesRef = useRef<NetworkNode[]>([]);

    // Build graph from dreams
    useEffect(() => {
        const counts = extractCategoryCount(dreams);
        const activeCats = CATEGORIES.filter((c) => (counts[c.id] ?? 0) > 0);

        if (activeCats.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }

        // Initial positions: random around center
        const initNodes: NetworkNode[] = activeCats.map((cat, i) => {
            const angle = (i / activeCats.length) * Math.PI * 2;
            const r = 80 + Math.random() * 40;
            const count = counts[cat.id] ?? 0;
            return {
                id: cat.id,
                label: t.categories[cat.id] ?? cat.id,
                x: CENTER_X + Math.cos(angle) * r,
                y: CENTER_Y + Math.sin(angle) * r,
                vx: 0,
                vy: 0,
                count,
                color: cat.color,
                radius: Math.min(28, 12 + count * 3),
            };
        });

        // Edges: co-occurrence strength >= 1
        const initEdges: NetworkEdge[] = [];
        for (let i = 0; i < activeCats.length; i++) {
            for (let j = i + 1; j < activeCats.length; j++) {
                const strength = coOccurrenceStrength(activeCats[i].id, activeCats[j].id, dreams);
                if (strength > 0) {
                    initEdges.push({ source: activeCats[i].id, target: activeCats[j].id, strength });
                }
            }
        }
        // Add lightweight structural edges for connectivity even without co-occurrence
        if (initEdges.length === 0 && activeCats.length > 1) {
            for (let i = 0; i < activeCats.length - 1; i++) {
                initEdges.push({ source: activeCats[i].id, target: activeCats[i + 1].id, strength: 0.5 });
            }
        }

        nodesRef.current = initNodes;
        setEdges(initEdges);
        iterRef.current = 0;
    }, [dreams, lang]); // eslint-disable-line react-hooks/exhaustive-deps

    // Animation loop: run physics in steps, stop after 60 iterations
    const animate = useCallback(() => {
        if (iterRef.current >= 60) return;
        const stepped = runSimulation(nodesRef.current, edges, 1);
        nodesRef.current = stepped;
        setNodes([...stepped]);
        iterRef.current++;
        rafRef.current = requestAnimationFrame(animate);
    }, [edges]);

    useEffect(() => {
        if (edges.length === 0 && nodesRef.current.length === 0) return;
        iterRef.current = 0;
        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [animate]);

    // Pulse animation for nodes
    useEffect(() => {
        let t = 0;
        const id = setInterval(() => {
            t++;
            setPulse(Math.sin(t * 0.12) * 0.15 + 1);
        }, 50);
        return () => clearInterval(id);
    }, []);

    // Stats
    const counts = extractCategoryCount(dreams);
    const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const topCat = topEntry ? topEntry[0] : null;
    const topCount = topEntry ? topEntry[1] : 0;
    const topLabel = topCat ? (t.categories[topCat] ?? topCat) : '';

    // Theme helpers
    const bg = isDark
        ? 'bg-gradient-to-b from-[#0d0520] to-[#050210]'
        : 'bg-gradient-to-b from-slate-50 to-white';
    const headerBg = isDark ? 'bg-black/30 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
    const headerBorder = isDark ? 'border-b border-white/10' : 'border-b border-slate-200';
    const titleColor = isDark ? 'text-white' : 'text-slate-900';
    const subtitleColor = isDark ? 'text-slate-400' : 'text-slate-500';
    const svgBg = isDark ? '#0a0218' : '#f1f5f9';
    const svgBorder = isDark ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.15)';
    const statsCardBg = isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200';
    const statLabel = isDark ? 'text-slate-400' : 'text-slate-500';
    const statValue = isDark ? 'text-white' : 'text-slate-900';
    const communityBg = isDark
        ? 'bg-gradient-to-r from-purple-900/30 to-fuchsia-900/20 border border-purple-500/20'
        : 'bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200';

    return (
        <div className={`flex flex-col min-h-screen ${bg}`}>
            {/* Header */}
            <div className={`flex items-center gap-3 px-4 py-3 ${headerBg} ${headerBorder} sticky top-0 z-20`}>
                <button
                    onClick={onClose}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                    aria-label="Back"
                >
                    <span className="material-icons text-xl">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className={`text-base font-bold tracking-tight ${titleColor}`}>{t.title}</h1>
                    <p className={`text-xs ${subtitleColor}`}>{t.subtitle}</p>
                </div>
                <span className="material-icons text-2xl" style={{ color: '#a855f7' }}>hub</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                {/* SVG Network */}
                <div
                    className="w-full rounded-3xl overflow-hidden shadow-lg"
                    style={{
                        background: svgBg,
                        border: `1px solid ${svgBorder}`,
                        boxShadow: isDark ? '0 0 40px rgba(168,85,247,0.08)' : '0 4px 24px rgba(0,0,0,0.06)',
                    }}
                >
                    {nodes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                            <span className="material-icons text-4xl" style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>bubble_chart</span>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.no_data}</p>
                            <p className={`text-xs text-center max-w-[200px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{t.no_data_desc}</p>
                        </div>
                    ) : (
                        <svg
                            viewBox={`0 0 ${W} ${H}`}
                            width="100%"
                            height={H}
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ display: 'block' }}
                        >
                            {/* Background grid dots */}
                            <defs>
                                <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <circle cx="1" cy="1" r="0.5" fill={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'} />
                                </pattern>
                                {nodes.map((n) => (
                                    <radialGradient key={`grad-${n.id}`} id={`grad-${n.id}`} cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor={n.color} stopOpacity="0.9" />
                                        <stop offset="100%" stopColor={n.color} stopOpacity="0.4" />
                                    </radialGradient>
                                ))}
                            </defs>
                            <rect width={W} height={H} fill="url(#grid)" />

                            {/* Edges */}
                            {edges.map((edge) => {
                                const src = nodes.find((n) => n.id === edge.source);
                                const tgt = nodes.find((n) => n.id === edge.target);
                                if (!src || !tgt) return null;
                                const opacity = Math.min(0.6, 0.15 + edge.strength * 0.15);
                                const strokeW = Math.min(2.5, 0.8 + edge.strength * 0.4);
                                const isHighlighted =
                                    hoveredNode === edge.source || hoveredNode === edge.target;
                                return (
                                    <line
                                        key={`${edge.source}-${edge.target}`}
                                        x1={src.x} y1={src.y}
                                        x2={tgt.x} y2={tgt.y}
                                        stroke={isHighlighted ? '#e879f9' : (isDark ? '#7c3aed' : '#a855f7')}
                                        strokeWidth={isHighlighted ? strokeW + 0.5 : strokeW}
                                        strokeOpacity={isHighlighted ? Math.min(1, opacity * 2) : opacity}
                                        strokeLinecap="round"
                                    />
                                );
                            })}

                            {/* Nodes */}
                            {nodes.map((node) => {
                                const isHovered = hoveredNode === node.id;
                                const scaledR = isHovered ? node.radius * 1.15 : node.radius * pulse;
                                const glowOpacity = isHovered ? 0.6 : 0.25;
                                const fontSize = node.radius < 16 ? 7 : node.radius < 20 ? 8 : 9;
                                return (
                                    <g
                                        key={node.id}
                                        transform={`translate(${node.x},${node.y})`}
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={() => setHoveredNode(node.id)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                        onTouchStart={() => setHoveredNode(node.id)}
                                        onTouchEnd={() => setTimeout(() => setHoveredNode(null), 600)}
                                    >
                                        {/* Outer glow ring */}
                                        <circle
                                            r={scaledR + 6}
                                            fill="none"
                                            stroke={node.color}
                                            strokeWidth={1.5}
                                            strokeOpacity={glowOpacity}
                                        />
                                        {/* Main circle */}
                                        <circle
                                            r={scaledR}
                                            fill={`url(#grad-${node.id})`}
                                            stroke={node.color}
                                            strokeWidth={1.5}
                                            strokeOpacity={0.8}
                                        />
                                        {/* Count badge */}
                                        {node.count > 0 && (
                                            <text
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                y={-2}
                                                fontSize={fontSize + 1}
                                                fontWeight="700"
                                                fill="white"
                                                style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
                                            >
                                                {node.count}
                                            </text>
                                        )}
                                        {/* Label below node */}
                                        <text
                                            textAnchor="middle"
                                            y={scaledR + 11}
                                            fontSize={fontSize}
                                            fontWeight="600"
                                            fill={isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)'}
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            {node.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    )}
                </div>

                {/* Stats row */}
                {dreams.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`rounded-2xl px-4 py-3 ${statsCardBg}`}>
                            <p className={`text-xs ${statLabel}`}>{t.your_dreams}</p>
                            <p className={`text-2xl font-bold mt-0.5 ${statValue}`}>{dreams.length}</p>
                        </div>
                        <div className={`rounded-2xl px-4 py-3 ${statsCardBg}`}>
                            <p className={`text-xs ${statLabel}`}>{t.most_common}</p>
                            <p className={`text-base font-bold mt-0.5 truncate ${statValue}`}>
                                {topLabel
                                    ? `${topLabel} (${topCount}${t.times})`
                                    : '—'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Community teaser */}
                <div className={`rounded-2xl px-4 py-4 flex items-center gap-3 ${communityBg}`}>
                    <span className="material-icons text-2xl" style={{ color: '#a855f7' }}>group</span>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                            {t.community_soon}
                        </p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            {t.community_desc}
                        </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                        Soon
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DreamNetwork;
