/**
 * Hook fuer Video-Playback-Kontrolle.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { TrimRange } from '../types';

export function useVideoPlayback(trimRange: TrimRange) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Video-Metadaten laden
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration * 1000);
  }, []);

  // Time-Update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const timeMs = video.currentTime * 1000;
    setCurrentTime(timeMs);

    // Trim-Bereich einhalten
    if (timeMs >= trimRange.endMs) {
      video.pause();
      video.currentTime = trimRange.startMs / 1000;
      setPlaying(false);
    }
  }, [trimRange]);

  // Play/Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      if (video.currentTime * 1000 >= trimRange.endMs) {
        video.currentTime = trimRange.startMs / 1000;
      }
      video.play();
      setPlaying(true);
    }
  }, [playing, trimRange]);

  // Seek zu bestimmter Zeit (in ms)
  const seekTo = useCallback((timeMs: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clampedMs = Math.max(0, Math.min(timeMs, duration));
    video.currentTime = clampedMs / 1000;
    setCurrentTime(clampedMs);
  }, [duration]);

  // Pause-Event
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    video.addEventListener('pause', onPause);
    video.addEventListener('play', onPlay);
    return () => {
      video.removeEventListener('pause', onPause);
      video.removeEventListener('play', onPlay);
    };
  }, []);

  return {
    videoRef,
    currentTime,
    duration,
    playing,
    togglePlay,
    seekTo,
    handleLoadedMetadata,
    handleTimeUpdate,
  };
}
