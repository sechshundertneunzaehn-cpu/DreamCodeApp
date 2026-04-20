/**
 * Zentraler State fuer das Pro Video Studio (useReducer).
 */

import { useReducer } from 'react';
import {
  ProVideoProject,
  TextOverlay,
  TrimRange,
  StyleFilter,
  AudioTrackSelection,
  ExportSettings,
  FaceSwapRequest,
  createDefaultProject,
} from '../types';

type Action =
  | { type: 'ADD_TEXT_OVERLAY'; payload: TextOverlay }
  | { type: 'UPDATE_TEXT_OVERLAY'; payload: { id: string; changes: Partial<TextOverlay> } }
  | { type: 'REMOVE_TEXT_OVERLAY'; payload: string }
  | { type: 'SET_TRIM'; payload: TrimRange }
  | { type: 'SET_STYLE_FILTER'; payload: StyleFilter }
  | { type: 'SET_AUDIO_TRACK'; payload: AudioTrackSelection | null }
  | { type: 'SET_EXPORT_SETTINGS'; payload: ExportSettings }
  | { type: 'SET_FACE_SWAP'; payload: FaceSwapRequest | null }
  | { type: 'RESET'; payload: { sourceVideoUrl: string; durationMs: number } };

function reducer(state: ProVideoProject, action: Action): ProVideoProject {
  switch (action.type) {
    case 'ADD_TEXT_OVERLAY':
      return { ...state, textOverlays: [...state.textOverlays, action.payload] };
    case 'UPDATE_TEXT_OVERLAY':
      return {
        ...state,
        textOverlays: state.textOverlays.map(o =>
          o.id === action.payload.id ? { ...o, ...action.payload.changes } : o
        ),
      };
    case 'REMOVE_TEXT_OVERLAY':
      return { ...state, textOverlays: state.textOverlays.filter(o => o.id !== action.payload) };
    case 'SET_TRIM':
      return { ...state, trimRange: action.payload };
    case 'SET_STYLE_FILTER':
      return { ...state, styleFilter: action.payload };
    case 'SET_AUDIO_TRACK':
      return { ...state, audioTrack: action.payload };
    case 'SET_EXPORT_SETTINGS':
      return { ...state, exportSettings: action.payload };
    case 'SET_FACE_SWAP':
      return { ...state, faceSwapRequest: action.payload };
    case 'RESET':
      return createDefaultProject(action.payload.sourceVideoUrl, action.payload.durationMs);
    default:
      return state;
  }
}

export function useProVideoState(sourceVideoUrl: string, durationMs: number) {
  const [project, dispatch] = useReducer(reducer, createDefaultProject(sourceVideoUrl, durationMs));

  return { project, dispatch };
}
