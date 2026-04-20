/**
 * Timeline mit Playhead, Trim-Handles und Text-Overlay-Indikatoren.
 */

import React, { useRef, useCallback, useState } from 'react';
import { TrimRange, TextOverlay } from './types';

interface ProVideoTimelineProps {
  durationMs: number;
  currentTimeMs: number;
  trimRange: TrimRange;
  textOverlays: TextOverlay[];
  onSeek: (timeMs: number) => void;
  onTrimChange: (trim: TrimRange) => void;
  isDark: boolean;
}

function formatTime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const ProVideoTimeline: React.FC<ProVideoTimelineProps> = ({
  durationMs,
  currentTimeMs,
  trimRange,
  textOverlays,
  onSeek,
  onTrimChange,
  isDark,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'playhead' | 'trimStart' | 'trimEnd' | null>(null);

  const positionToTime = useCallback((clientX: number): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * durationMs;
  }, [durationMs]);

  const handlePointerDown = useCallback((e: React.PointerEvent, target: 'playhead' | 'trimStart' | 'trimEnd') => {
    e.stopPropagation();
    setDragging(target);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const timeMs = positionToTime(e.clientX);

    if (dragging === 'playhead') {
      onSeek(timeMs);
    } else if (dragging === 'trimStart') {
      onTrimChange({ ...trimRange, startMs: Math.min(timeMs, trimRange.endMs - 500) });
    } else if (dragging === 'trimEnd') {
      onTrimChange({ ...trimRange, endMs: Math.max(timeMs, trimRange.startMs + 500) });
    }
  }, [dragging, positionToTime, onSeek, onTrimChange, trimRange]);

  const handlePointerUp = useCallback(() => setDragging(null), []);

  const handleTrackClick = useCallback((e: React.PointerEvent) => {
    if (dragging) return;
    onSeek(positionToTime(e.clientX));
  }, [dragging, positionToTime, onSeek]);

  const playheadPercent = durationMs > 0 ? (currentTimeMs / durationMs) * 100 : 0;
  const trimStartPercent = durationMs > 0 ? (trimRange.startMs / durationMs) * 100 : 0;
  const trimEndPercent = durationMs > 0 ? (trimRange.endMs / durationMs) * 100 : 100;

  return (
    <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
      {/* Zeitanzeige */}
      <div className="flex justify-between text-xs mb-2 opacity-60">
        <span>{formatTime(currentTimeMs)}</span>
        <span>{formatTime(durationMs)}</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-10 rounded-lg overflow-hidden cursor-pointer select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={handleTrackClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Hintergrund */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

        {/* Trim-Bereich (aktiver Bereich) */}
        <div
          className="absolute top-0 bottom-0 bg-blue-500/30"
          style={{ left: `${trimStartPercent}%`, width: `${trimEndPercent - trimStartPercent}%` }}
        />

        {/* Text-Overlay-Indikatoren */}
        {textOverlays.map(overlay => {
          const startP = durationMs > 0 ? (overlay.startTime / durationMs) * 100 : 0;
          const endP = durationMs > 0 ? (overlay.endTime / durationMs) * 100 : 0;
          return (
            <div
              key={overlay.id}
              className="absolute top-1 h-2 bg-green-500/60 rounded-full"
              style={{ left: `${startP}%`, width: `${endP - startP}%` }}
            />
          );
        })}

        {/* Trim-Start Handle */}
        <div
          className="absolute top-0 bottom-0 w-3 bg-yellow-500 cursor-col-resize z-10 rounded-l"
          style={{ left: `${trimStartPercent}%`, transform: 'translateX(-100%)' }}
          onPointerDown={e => handlePointerDown(e, 'trimStart')}
        />

        {/* Trim-End Handle */}
        <div
          className="absolute top-0 bottom-0 w-3 bg-yellow-500 cursor-col-resize z-10 rounded-r"
          style={{ left: `${trimEndPercent}%` }}
          onPointerDown={e => handlePointerDown(e, 'trimEnd')}
        />

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-20 cursor-col-resize"
          style={{ left: `${playheadPercent}%` }}
          onPointerDown={e => handlePointerDown(e, 'playhead')}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow" />
        </div>
      </div>

      {/* Trim-Labels */}
      <div className="flex justify-between text-[10px] mt-1 opacity-50">
        <span>In: {formatTime(trimRange.startMs)}</span>
        <span>Out: {formatTime(trimRange.endMs)}</span>
      </div>
    </div>
  );
};

export default ProVideoTimeline;
