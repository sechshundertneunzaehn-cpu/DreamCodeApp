import React, { useState, useEffect, useRef, useCallback } from 'react';

interface StorySegment {
  text: string;
  imageUrl?: string;
  startTime: number;
  endTime: number;
}

interface StoryData {
  segments: StorySegment[];
  audioBase64?: string;
  totalDuration: number;
}

interface StoryVideoPlayerProps {
  videoUrl?: string;
  onClose?: () => void;
}

const StoryVideoPlayer: React.FC<StoryVideoPlayerProps> = ({ videoUrl, onClose }) => {
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [isRealVideo, setIsRealVideo] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Parse the video URL -- either real video or JSON story data
  useEffect(() => {
    if (!videoUrl) return;

    if (videoUrl.startsWith('data:application/json;base64,')) {
      try {
        const base64 = videoUrl.replace('data:application/json;base64,', '');
        const json = decodeURIComponent(escape(atob(base64)));
        const data = JSON.parse(json);
        if (data.segments && data.totalDuration) {
          setStoryData(data);
          setIsRealVideo(false);
        }
      } catch (e) {
        console.error('[StoryPlayer] Failed to parse story data:', e);
      }
    } else {
      setIsRealVideo(true);
    }
  }, [videoUrl]);

  // Setup audio
  useEffect(() => {
    if (!storyData?.audioBase64) return;
    try {
      const audioSrc = storyData.audioBase64.startsWith('data:')
        ? storyData.audioBase64
        : `data:audio/mp3;base64,${storyData.audioBase64}`;
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(storyData.totalDuration);
      });
      return () => {
        audio.pause();
        audio.removeEventListener('ended', () => {});
      };
    } catch (e) {
      console.warn('[StoryPlayer] Audio setup failed:', e);
    }
  }, [storyData]);

  // Timer for slideshow progression
  useEffect(() => {
    if (!isPlaying || !storyData) return;

    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);

      // Find current segment
      const idx = storyData.segments.findIndex(
        s => elapsed >= s.startTime && elapsed < s.endTime
      );
      if (idx >= 0) setCurrentSegmentIndex(idx);

      if (elapsed >= storyData.totalDuration) {
        setIsPlaying(false);
        return;
      }
      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isPlaying, storyData]);

  const handlePlay = useCallback(() => {
    if (!storyData) return;
    startTimeRef.current = Date.now() - (currentTime * 1000);
    setIsPlaying(true);
    audioRef.current?.play().catch(() => {});
  }, [storyData, currentTime]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    audioRef.current?.pause();
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentTime(0);
    setCurrentSegmentIndex(0);
    startTimeRef.current = Date.now();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(true);
    audioRef.current?.play().catch(() => {});
  }, []);

  if (!videoUrl) return null;

  // Real video (mp4/webm from Replicate)
  if (isRealVideo) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
        <video
          src={videoUrl}
          controls
          autoPlay
          className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
        />
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full text-white flex items-center justify-center transition-colors">
            <span className="material-icons">close</span>
          </button>
        )}
      </div>
    );
  }

  // Story slideshow player
  if (!storyData) return null;

  const currentSegment = storyData.segments[currentSegmentIndex];
  const progress = storyData.totalDuration > 0 ? (currentTime / storyData.totalDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Close button */}
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full text-white flex items-center justify-center transition-colors">
          <span className="material-icons">close</span>
        </button>
      )}

      {/* Image area */}
      <div className="flex-1 relative overflow-hidden">
        {storyData.segments.map((segment, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === currentSegmentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            {segment.imageUrl ? (
              <img
                src={segment.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 flex items-center justify-center">
                <span className="material-icons text-8xl text-white/20">auto_awesome</span>
              </div>
            )}
            {/* Dark gradient overlay at bottom for text */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        ))}

        {/* Text overlay */}
        <div className="absolute bottom-16 left-0 right-0 px-6 z-10">
          <p className="text-white text-lg font-medium leading-relaxed text-center drop-shadow-lg max-w-2xl mx-auto">
            {currentSegment?.text || ''}
          </p>
        </div>

        {/* Segment indicators */}
        <div className="absolute top-4 left-4 right-16 flex gap-1 z-10">
          {storyData.segments.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full overflow-hidden bg-white/20"
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  i < currentSegmentIndex ? 'bg-white w-full' :
                  i === currentSegmentIndex ? 'bg-fuchsia-400' : 'w-0'
                }`}
                style={i === currentSegmentIndex ? {
                  width: `${Math.min(100, ((currentTime - (currentSegment?.startTime || 0)) / ((currentSegment?.endTime || 1) - (currentSegment?.startTime || 0))) * 100)}%`
                } : undefined}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/90 backdrop-blur-lg px-6 py-4 flex items-center gap-4 safe-area-bottom">
        {/* Play/Pause */}
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="w-14 h-14 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
        >
          <span className="material-icons text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
        </button>

        {/* Progress bar */}
        <div className="flex-1">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-400 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-white/50">{formatTime(currentTime)}</span>
            <span className="text-xs text-white/50">{formatTime(storyData.totalDuration)}</span>
          </div>
        </div>

        {/* Restart */}
        <button
          onClick={handleRestart}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <span className="material-icons text-lg">replay</span>
        </button>
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default StoryVideoPlayer;
