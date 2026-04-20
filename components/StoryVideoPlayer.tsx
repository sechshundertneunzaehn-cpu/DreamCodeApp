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
  onOpenProStudio?: (videoUrl: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Load a single image for canvas use, avoiding CORS taint.
 *  Strategy: fetch as blob → objectURL (same-origin, no taint).
 *  Falls back to crossOrigin=anonymous, then plain load. */
async function loadImageForCanvas(url: string): Promise<HTMLImageElement | null> {
  // data: URLs are already same-origin
  if (url.startsWith('data:')) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // Try fetch → blob → objectURL (safest for CORS)
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    return await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(null); };
      img.src = blobUrl;
    });
  } catch {
    // Fallback: crossOrigin attribute
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
}

/** Draw image to canvas with cover-fill (no black bars). */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) {
  const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
}

/** Wrap text on canvas and draw it. */
function drawText(ctx: CanvasRenderingContext2D, text: string, W: number, H: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, H - 160, W, 160);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const words = text.split(' ');
  let line = '';
  let y = H - 120;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > W - 40) {
      ctx.fillText(line, W / 2, y);
      line = word;
      y += 36;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, W / 2, y);
}

/** Convert base64-encoded audio to a Blob. */
function audioBase64ToBlob(audioBase64: string): Blob {
  const src = audioBase64.startsWith('data:') ? audioBase64 : `data:audio/mp3;base64,${audioBase64}`;
  const [header, b64] = src.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'audio/mp3';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const StoryVideoPlayer: React.FC<StoryVideoPlayerProps> = ({ videoUrl, onClose, onOpenProStudio }) => {
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [isRealVideo, setIsRealVideo] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Parse the video URL -- either real video or JSON story data
  useEffect(() => {
    if (!videoUrl) return;
    if (videoUrl.startsWith('data:application/json;base64,')) {
      try {
        const base64 = videoUrl.replace('data:application/json;base64,', '');
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        const json = new TextDecoder().decode(bytes);
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
      const onEnded = () => { setIsPlaying(false); setCurrentTime(storyData.totalDuration); };
      audio.addEventListener('ended', onEnded);
      return () => { audio.pause(); audio.removeEventListener('ended', onEnded); };
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
      const idx = storyData.segments.findIndex(s => elapsed >= s.startTime && elapsed < s.endTime);
      if (idx >= 0) setCurrentSegmentIndex(idx);
      if (elapsed >= storyData.totalDuration) { setIsPlaying(false); return; }
      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);
    return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current); };
  }, [isPlaying, storyData]);

  // Auto-start when storyData is ready
  useEffect(() => {
    if (!storyData) return;
    startTimeRef.current = Date.now();
    setIsPlaying(true);
    audioRef.current?.play().catch(() => {});
  }, [storyData]);

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
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(true);
    audioRef.current?.play().catch(() => {});
  }, []);

  // -------------------------------------------------------------------------
  // Canvas-based download with audio
  // -------------------------------------------------------------------------
  const handleDownload = useCallback(async () => {
    if (!storyData || isDownloading) return;
    setIsDownloading(true);

    try {
      const W = 720, H = 1280;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;

      // 1. Preload ALL images (fetch→blob→objectURL to avoid CORS taint)
      const images = await Promise.all(
        storyData.segments.map(seg =>
          seg.imageUrl ? loadImageForCanvas(seg.imageUrl) : Promise.resolve(null)
        )
      );

      // 2. Draw FIRST frame BEFORE recording starts
      ctx.fillStyle = '#0f0b1a';
      ctx.fillRect(0, 0, W, H);
      if (images[0]) drawCover(ctx, images[0], W, H);
      if (storyData.segments[0]?.text) drawText(ctx, storyData.segments[0].text, W, H);

      // 3. Best supported mimeType
      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9', 'video/webm']
        .find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';

      // 4. Setup stream (video from canvas)
      const stream = canvas.captureStream(30);

      // 5. Add audio track if available
      let audioSource: AudioBufferSourceNode | null = null;
      let audioCtx: AudioContext | null = null;
      if (storyData.audioBase64) {
        try {
          audioCtx = new AudioContext();
          const audioBlob = audioBase64ToBlob(storyData.audioBase64);
          const arrayBuf = await audioBlob.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
          audioSource = audioCtx.createBufferSource();
          audioSource.buffer = audioBuffer;
          const dest = audioCtx.createMediaStreamDestination();
          audioSource.connect(dest);
          dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
        } catch (audioErr) {
          console.warn('[Download] Audio track failed, video-only:', audioErr);
        }
      }

      // 6. Create recorder
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const donePromise = new Promise<void>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          if (blob.size < 5000) {
            console.warn('[Download] Blob too small, likely empty:', blob.size);
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `traumvideo-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          resolve();
        };
      });

      // 7. Start recording + audio
      recorder.start(100);
      audioSource?.start(0);

      // 8. Draw each segment for its duration
      for (let i = 0; i < storyData.segments.length; i++) {
        const seg = storyData.segments[i];
        const segDuration = Math.max(500, (seg.endTime - seg.startTime) * 1000);
        const img = images[i];

        ctx.fillStyle = '#0f0b1a';
        ctx.fillRect(0, 0, W, H);
        if (img) {
          drawCover(ctx, img, W, H);
        } else {
          // Fallback gradient when image failed
          const grad = ctx.createLinearGradient(0, 0, W, H);
          grad.addColorStop(0, '#312e81');
          grad.addColorStop(0.5, '#581c87');
          grad.addColorStop(1, '#701a75');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        }
        if (seg.text) drawText(ctx, seg.text, W, H);

        await new Promise<void>(r => setTimeout(r, segDuration));
      }

      // 9. Stop
      recorder.stop();
      audioSource?.stop();
      await donePromise;
      if (audioCtx) audioCtx.close().catch(() => {});
    } catch (e) {
      console.error('[StoryVideoPlayer] Download failed:', e);
    } finally {
      setIsDownloading(false);
    }
  }, [storyData, isDownloading]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (!videoUrl) return null;

  // Real video (mp4/webm from Replicate)
  if (isRealVideo) {
    const handleVideoDownload = async () => {
      try {
        const res = await fetch(videoUrl!);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `traumvideo-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch { window.open(videoUrl!, '_blank'); }
    };

    const handleVideoShare = async () => {
      try {
        if (navigator.share) {
          await navigator.share({ title: 'Mein Traumvideo', text: 'Schau dir mein Traumvideo an!', url: videoUrl! });
        } else {
          await navigator.clipboard.writeText(videoUrl!);
        }
      } catch { /* user cancelled */ }
    };

    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 z-50 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full text-white flex items-center justify-center transition-colors">
            <span className="material-icons">close</span>
          </button>
        )}

        <video src={videoUrl} controls autoPlay className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl" />

        {/* 3 Buttons: Download, Share, Save */}
        <div className="flex items-center gap-6 mt-6">
          <button onClick={handleVideoDownload} className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
            <div className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
              <span className="material-icons text-2xl">download</span>
            </div>
            <span className="text-xs">Download</span>
          </button>

          <button onClick={handleVideoShare} className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
            <div className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
              <span className="material-icons text-2xl">share</span>
            </div>
            <span className="text-xs">Teilen</span>
          </button>

          {onClose && (
            <button onClick={onClose} className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
              <div className="w-14 h-14 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="material-icons text-2xl">save</span>
              </div>
              <span className="text-xs">Speichern</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Story slideshow player
  if (!storyData) return null;

  const currentSegment = storyData.segments[currentSegmentIndex];
  const progress = storyData.totalDuration > 0 ? (currentTime / storyData.totalDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full text-white flex items-center justify-center transition-colors">
          <span className="material-icons">close</span>
        </button>
      )}

      {/* Image area */}
      <div className="flex-1 relative overflow-hidden">
        {storyData.segments.map((segment, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === currentSegmentIndex ? 'opacity-100' : 'opacity-0'}`}>
            {segment.imageUrl ? (
              <img src={segment.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 flex items-center justify-center">
                <span className="material-icons text-8xl text-white/20">auto_awesome</span>
              </div>
            )}
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
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/20">
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
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="w-14 h-14 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
        >
          <span className="material-icons text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
        </button>

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

        <button onClick={handleRestart} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
          <span className="material-icons text-lg">replay</span>
        </button>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          title="Als Video herunterladen"
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${
            isDownloading ? 'bg-fuchsia-700/40 animate-pulse cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <span className="material-icons text-lg">{isDownloading ? 'hourglass_top' : 'download'}</span>
        </button>

        <button
          onClick={async () => {
            try {
              if (navigator.share) await navigator.share({ title: 'Mein Traumvideo', text: 'Schau dir mein Traumvideo an!' });
            } catch { /* cancelled */ }
          }}
          title="Teilen"
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <span className="material-icons text-lg">share</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            title="Speichern"
            className="w-10 h-10 bg-gradient-to-br from-fuchsia-500/40 to-violet-500/40 hover:from-fuchsia-500/60 hover:to-violet-500/60 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <span className="material-icons text-lg">save</span>
          </button>
        )}

        {onOpenProStudio && videoUrl && (
          <button
            onClick={() => onOpenProStudio(videoUrl)}
            title="Im Pro Studio bearbeiten"
            className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <span className="material-icons text-lg">movie_edit</span>
          </button>
        )}
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
