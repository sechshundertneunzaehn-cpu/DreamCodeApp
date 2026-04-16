/**
 * Video-Vorschau mit Play/Pause-Controls und Text-Overlay-Rendering.
 */

import React from 'react';
import { TextOverlay, StyleFilter, STYLE_FILTERS } from './types';

interface ProVideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  sourceVideoUrl: string;
  styleFilter: StyleFilter;
  textOverlays: TextOverlay[];
  currentTimeMs: number;
  playing: boolean;
  onTogglePlay: () => void;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  isDark: boolean;
}

const POSITION_MAP: Record<string, string> = {
  top: 'top-4 left-0 right-0 text-center',
  center: 'top-1/2 left-0 right-0 text-center -translate-y-1/2',
  bottom: 'bottom-4 left-0 right-0 text-center',
};

const ProVideoPreview: React.FC<ProVideoPreviewProps> = ({
  videoRef,
  sourceVideoUrl,
  styleFilter,
  textOverlays,
  currentTimeMs,
  playing,
  onTogglePlay,
  onLoadedMetadata,
  onTimeUpdate,
  isDark,
}) => {
  const filterStyle = STYLE_FILTERS.find(f => f.id === styleFilter)?.cssFilter || 'none';

  // Sichtbare Overlays zur aktuellen Zeit
  const visibleOverlays = textOverlays.filter(
    o => currentTimeMs >= o.startTime && currentTimeMs <= o.endTime
  );

  return (
    <div className="relative bg-black rounded-xl overflow-hidden" onClick={onTogglePlay}>
      <video
        ref={videoRef as any}
        src={sourceVideoUrl}
        className="w-full h-full object-contain cursor-pointer"
        style={{ filter: filterStyle, maxHeight: '50vh' }}
        playsInline
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
      />

      {/* Text-Overlays */}
      {visibleOverlays.map(overlay => (
        <div
          key={overlay.id}
          className={`absolute ${POSITION_MAP[overlay.position]} pointer-events-none px-4`}
        >
          <span
            style={{
              fontSize: `${overlay.fontSize}px`,
              color: overlay.color,
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              fontWeight: 'bold',
            }}
          >
            {overlay.text}
          </span>
        </div>
      ))}

      {/* Play/Pause Overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="material-icons text-white text-4xl">play_arrow</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProVideoPreview;
