import React from 'react';
import { useWorldMapDots } from '../hooks/useWorldMapDots';

interface Props {
  isLight: boolean;
  language?: string;
  onClickFullscreen: () => void;
}

const VIEWBOX_W = 950;
const VIEWBOX_H = 620;

function projectLngLat(lng: number, lat: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * VIEWBOX_W;
  const y = ((90 - lat) / 180) * VIEWBOX_H;
  return { x, y };
}

function formatNumber(n: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale).format(n);
  } catch {
    return String(n);
  }
}

function buildOverlayText(
  participantCount: number | null,
  countryCount: number | null,
  loading: boolean,
  error: string | null,
  locale: string,
): string {
  if (loading) return '';
  if (error || participantCount == null) return 'Träumer aus aller Welt · Zum Erkunden klicken';
  const nPart = formatNumber(participantCount, locale);
  if (countryCount && countryCount > 1) {
    return `${nPart} Träumer aus ${countryCount} Ländern · Zum Erkunden klicken`;
  }
  return `${nPart} Träumer · Zum Erkunden klicken`;
}

const WorldMapPreview: React.FC<Props> = ({ isLight, language, onClickFullscreen }) => {
  const { dots, participantCount, countryCount, loading, error } = useWorldMapDots();
  const locale = language || 'de';

  const bgOpacity = isLight ? 0.55 : 0.35;
  const dotColor = isLight ? '#4f46e5' : '#60a5fa';
  const overlayBg = isLight ? 'bg-white/70 text-indigo-900' : 'bg-black/50 text-white';

  return (
    <button
      type="button"
      onClick={onClickFullscreen}
      aria-label="Weltkarte erkunden"
      className={`group relative w-full h-full overflow-hidden cursor-pointer transition-[filter] duration-300 hover:brightness-110 ${
        isLight ? 'bg-indigo-50' : 'bg-[#0b1020]'
      }`}
    >
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
        {loading ? null : (
          <g>
            {dots.map((d, i) => {
              const { x, y } = projectLngLat(d.lng, d.lat);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={1.8}
                  fill={dotColor}
                  opacity={0.75}
                />
              );
            })}
          </g>
        )}
      </svg>

      {loading && (
        <div
          className={`absolute inset-0 flex items-center justify-center text-xs ${
            isLight ? 'text-indigo-400' : 'text-white/50'
          }`}
        >
          <span className="animate-pulse">Weltkarte wird geladen …</span>
        </div>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 flex justify-center pb-4 px-4 pointer-events-none`}
      >
        <div
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm ${overlayBg}`}
        >
          {buildOverlayText(participantCount, countryCount, loading, error, locale)}
        </div>
      </div>
    </button>
  );
};

export default WorldMapPreview;
