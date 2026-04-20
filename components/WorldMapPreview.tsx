import React from 'react';
import dotsData from './WorldMapPreview.dots.json';

interface Props {
  isLight: boolean;
  language?: string;
  onClickFullscreen: () => void;
}

// viewBox muss mit dotsData.viewBox uebereinstimmen und mit public/world-map.svg
// (beide preserveAspectRatio="meet") damit Dots exakt auf Land-Polygonen sitzen.
const VIEWBOX_W = dotsData.viewBox.w;
const VIEWBOX_H = dotsData.viewBox.h;

// Dots werden von scripts/generate-preview-dots.mjs deterministisch erzeugt:
// Fibonacci-Spiral ueber die Sphaere + point-in-polygon gegen Natural Earth
// 110m Land-Polygone. Jeder Dot ist im Land-Polygon eines Landes.

interface Dot {
  x: number;
  y: number;
  delay: number;
}

const DOTS: Dot[] = (dotsData.dots as Dot[]).map((d) => ({ x: d.x, y: d.y, delay: d.delay }));

const WorldMapPreview: React.FC<Props> = ({ isLight, onClickFullscreen }) => {
  const bgOpacity = isLight ? 0.7 : 0.95;
  const dotFill = isLight ? '#4338ca' : '#fef9c3';
  const dotStroke = isLight ? '#ffffff' : '#f59e0b';
  const overlayBg = isLight ? 'bg-white/70 text-indigo-900' : 'bg-black/50 text-white';

  return (
    <button
      type="button"
      onClick={onClickFullscreen}
      aria-label="Weltkarte erkunden"
      className={`group relative w-full h-full overflow-hidden cursor-pointer transition-[filter] duration-300 hover:brightness-110 ${
        isLight
          ? 'bg-gradient-to-br from-indigo-50 via-white to-sky-100'
          : 'bg-gradient-to-br from-[#050714] via-[#0d1430] to-[#1a2654]'
      }`}
    >
      <style>{`
        @keyframes wmpDotPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.2); }
        }
        .wmp-dot {
          animation: wmpDotPulse 2.8s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
          will-change: opacity, transform;
        }
      `}</style>

      <img
        src={`${import.meta.env.BASE_URL}world-map.svg`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        style={{ opacity: bgOpacity }}
        draggable={false}
      />

      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        {DOTS.map((d, i) => (
          <circle
            key={i}
            className="wmp-dot"
            cx={d.x}
            cy={d.y}
            r={4.5}
            fill={dotFill}
            stroke={dotStroke}
            strokeWidth={0.8}
            style={{ animationDelay: `${d.delay}s` }}
          />
        ))}
      </svg>

      <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4 px-4 pointer-events-none">
        <div className={`px-3 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm ${overlayBg}`}>
          Träumer aus aller Welt · Zum Erkunden klicken
        </div>
      </div>
    </button>
  );
};

export default WorldMapPreview;
