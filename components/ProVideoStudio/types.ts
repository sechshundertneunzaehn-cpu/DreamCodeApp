/**
 * Type-Definitionen fuer das Pro Video Studio.
 */

export interface TextOverlay {
  id: string;
  text: string;
  fontSize: number;
  color: string;
  position: 'top' | 'center' | 'bottom';
  startTime: number;
  endTime: number;
}

export interface TrimRange {
  startMs: number;
  endMs: number;
}

export type StyleFilter = 'none' | 'cartoon' | 'watercolor' | 'neon' | 'vintage' | 'noir';

export interface AudioTrackSelection {
  trackId: string;
  volume: number;
  fadeIn: boolean;
  fadeOut: boolean;
  loop: boolean;
}

export interface ExportSettings {
  resolution: 'hd' | '4k';
  format: 'mp4';
}

export interface FaceSwapRequest {
  faceImageBase64: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  resultUrl?: string;
}

export interface ProVideoProject {
  sourceVideoUrl: string;
  durationMs: number;
  textOverlays: TextOverlay[];
  audioTrack: AudioTrackSelection | null;
  styleFilter: StyleFilter;
  trimRange: TrimRange;
  faceSwapRequest: FaceSwapRequest | null;
  exportSettings: ExportSettings;
}

export type ToolTab = 'face' | 'text' | 'style' | 'audio' | 'trim' | 'export';

export interface AudioTrack {
  id: string;
  name: string;
  genre: string;
  durationSec: number;
  url: string;
}

export const AUDIO_TRACKS: AudioTrack[] = [
  { id: 'ambient-dream', name: 'Ambient Dream', genre: 'ambient', durationSec: 120, url: '/audio/ambient-dream.mp3' },
  { id: 'mystic-night', name: 'Mystic Night', genre: 'mystical', durationSec: 90, url: '/audio/mystic-night.mp3' },
  { id: 'deep-ocean', name: 'Deep Ocean', genre: 'nature', durationSec: 150, url: '/audio/deep-ocean.mp3' },
  { id: 'cosmic-flow', name: 'Cosmic Flow', genre: 'electronic', durationSec: 100, url: '/audio/cosmic-flow.mp3' },
  { id: 'gentle-rain', name: 'Gentle Rain', genre: 'nature', durationSec: 180, url: '/audio/gentle-rain.mp3' },
  { id: 'piano-dreams', name: 'Piano Dreams', genre: 'classical', durationSec: 130, url: '/audio/piano-dreams.mp3' },
  { id: 'starlight', name: 'Starlight', genre: 'ambient', durationSec: 110, url: '/audio/starlight.mp3' },
  { id: 'forest-whisper', name: 'Forest Whisper', genre: 'nature', durationSec: 140, url: '/audio/forest-whisper.mp3' },
];

export const STYLE_FILTERS: { id: StyleFilter; label: string; icon: string; cssFilter: string }[] = [
  { id: 'none', label: 'Original', icon: '&#x1F3AC;', cssFilter: 'none' },
  { id: 'cartoon', label: 'Cartoon', icon: '&#x1F3A8;', cssFilter: 'saturate(1.5) contrast(1.2)' },
  { id: 'watercolor', label: 'Aquarell', icon: '&#x1F308;', cssFilter: 'saturate(0.7) brightness(1.1) blur(0.5px)' },
  { id: 'neon', label: 'Neon', icon: '&#x1F4A1;', cssFilter: 'saturate(2) contrast(1.4) brightness(1.1)' },
  { id: 'vintage', label: 'Vintage', icon: '&#x1F4F7;', cssFilter: 'sepia(0.4) contrast(1.1) brightness(0.95)' },
  { id: 'noir', label: 'Noir', icon: '&#x1F3AD;', cssFilter: 'grayscale(1) contrast(1.3) brightness(0.9)' },
];

export function createDefaultProject(sourceVideoUrl: string, durationMs: number): ProVideoProject {
  return {
    sourceVideoUrl,
    durationMs,
    textOverlays: [],
    audioTrack: null,
    styleFilter: 'none',
    trimRange: { startMs: 0, endMs: durationMs },
    faceSwapRequest: null,
    exportSettings: { resolution: 'hd', format: 'mp4' },
  };
}
