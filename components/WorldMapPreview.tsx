import React from 'react';

interface Props {
  isLight: boolean;
  language?: string;
  onClickFullscreen: () => void;
}

// viewBox matcht public/world-map.svg (950 x 620) damit Dots und Karte
// identisch skaliert/positioniert werden (beide preserveAspectRatio="meet").
const VIEWBOX_W = 950;
const VIEWBOX_H = 620;

// Das SVG ist auf die ueblichen Welt-Breiten gecroppt (ca. 83°N bis -57°S).
// Plate-Carree Projektion innerhalb dieses Bereichs.
const LAT_NORTH = 83;
const LAT_SOUTH = -57;
const LAT_SPAN = LAT_NORTH - LAT_SOUTH;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * VIEWBOX_W;
  const y = ((LAT_NORTH - lat) / LAT_SPAN) * VIEWBOX_H;
  return { x, y };
}

// Hand-picked Staedte, jeweils etwas ins Landesinnere gezogen damit die
// Marker NICHT in Ozean/Meer landen (insbesondere Kuestenstaedte).
const CITIES: Array<[number, number]> = [
  // Nordamerika
  [47.6, -121.5], [37.5, -121.8], [34.0, -117.9], [39.7, -104.9], [41.8, -88.2],
  [40.7, -74.5], [27.9, -81.8], [43.7, -79.5], [49.3, -122.8], [19.4, -99.1],
  [45.5, -73.8], [32.7, -96.8], [29.8, -95.4], [36.1, -115.1], [45.4, -92.9],
  [35.5, -97.5], [44.9, -93.2], [39.3, -84.5], [38.6, -90.2], [30.3, -97.7],
  [42.3, -71.1], [33.7, -84.4], [50.4, -104.6], [53.5, -113.4], [56.1, -101.2],
  // Suedamerika
  [10.5, -66.9], [4.7, -74.1], [-12.0, -76.3], [-22.9, -43.6], [-23.5, -46.9],
  [-34.6, -58.7], [-33.4, -70.7], [-0.2, -78.5], [-15.8, -47.9], [-16.5, -68.1],
  [-25.3, -57.5], [-8.0, -34.9], [-3.1, -60.0],
  // Europa
  [51.5, -0.5], [48.9, 2.3], [40.4, -3.7], [52.5, 13.4], [41.9, 12.5],
  [38.0, 23.5], [59.3, 17.5], [55.8, 37.6], [52.2, 21.0], [41.0, 29.5],
  [60.2, 24.5], [50.1, 14.4], [47.5, 19.0], [45.8, 15.9], [45.4, 9.2],
  [43.3, -2.0], [53.4, -2.2], [55.7, 12.6], [63.4, 10.4], [58.0, 56.2],
  [49.0, 2.5], [48.2, 16.4], [46.2, 6.1], [44.4, 26.1], [54.7, 25.3],
  // Afrika
  [30.0, 31.2], [7.3, 3.9], [33.2, -6.5], [-1.3, 36.8], [9.0, 38.7],
  [-26.2, 28.0], [-4.3, 15.3], [-15.4, 28.3], [14.5, -16.5], [-33.7, 19.0],
  [-18.9, 47.0], [15.6, 32.5], [12.6, 8.0], [-13.0, 27.5], [3.9, 11.5],
  [36.7, 3.2], [31.6, -8.0], [-17.8, 31.0], [13.5, -2.0],
  // Asien
  [35.7, 51.4], [28.6, 77.2], [19.5, 73.2], [13.7, 100.5], [-6.5, 107.2],
  [1.3, 103.8], [14.6, 120.7], [23.0, 113.5], [31.2, 121.0], [39.9, 116.4],
  [37.3, 126.8], [35.7, 139.5], [33.7, 73.1], [23.7, 90.4], [10.8, 106.5],
  [30.6, 104.1], [22.6, 88.4], [12.9, 77.6], [17.4, 78.5], [26.9, 75.8],
  [43.3, 76.9], [41.3, 69.3], [50.0, 110.0], [55.0, 82.9], [36.0, 103.7],
  [34.5, 69.2], [32.6, 44.0], [24.5, 54.4],
  // Ozeanien
  [-33.9, 150.8], [-37.8, 144.7], [-31.9, 116.3], [-27.5, 152.7], [-36.8, 174.5],
  [-34.9, 138.6], [-42.9, 147.0], [-19.3, 146.8],
];

interface Dot {
  x: number;
  y: number;
  delay: number;
}

const DOTS: Dot[] = CITIES.map(([lat, lng], i) => {
  const { x, y } = project(lat, lng);
  return { x, y, delay: (i * 0.17) % 3 };
});

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
