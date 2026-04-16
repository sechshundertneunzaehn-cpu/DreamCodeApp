/**
 * Tool-Panel mit Tab-Umschaltung (rechte Seite auf Desktop, Bottom-Sheet auf Mobile).
 */

import React, { useState, Dispatch } from 'react';
import { ToolTab, ProVideoProject, TextOverlay, StyleFilter, STYLE_FILTERS, AUDIO_TRACKS } from './types';

interface ProVideoToolPanelProps {
  project: ProVideoProject;
  dispatch: Dispatch<any>;
  durationMs: number;
  currentTimeMs: number;
  isDark: boolean;
}

const TABS: { id: ToolTab; icon: string; label: string }[] = [
  { id: 'trim', icon: 'content_cut', label: 'Trim' },
  { id: 'text', icon: 'title', label: 'Text' },
  { id: 'style', icon: 'palette', label: 'Stil' },
  { id: 'audio', icon: 'music_note', label: 'Audio' },
  { id: 'face', icon: 'face', label: 'Face' },
  { id: 'export', icon: 'download', label: 'Export' },
];

// Statische Emoji-Map fuer Style-Filter Icons (sicher, keine User-Eingabe)
const STYLE_EMOJI: Record<StyleFilter, string> = {
  none: '\u{1F3AC}',
  cartoon: '\u{1F3A8}',
  watercolor: '\u{1F308}',
  neon: '\u{1F4A1}',
  vintage: '\u{1F4F7}',
  noir: '\u{1F3AD}',
};

const ProVideoToolPanel: React.FC<ProVideoToolPanelProps> = ({ project, dispatch, durationMs, currentTimeMs, isDark }) => {
  const [activeTab, setActiveTab] = useState<ToolTab>('trim');
  const [newText, setNewText] = useState('');
  const [newTextPosition, setNewTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [newTextColor, setNewTextColor] = useState('#ffffff');
  const [newTextSize, setNewTextSize] = useState(24);

  const cardBg = isDark ? 'bg-gray-700' : 'bg-white';

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl overflow-hidden flex flex-col h-full`}>
      {/* Tab-Leiste */}
      <div className="flex overflow-x-auto border-b border-gray-700/50">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[60px] py-2 flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${
              activeTab === tab.id
                ? isDark ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'
                : isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            <span className="material-icons text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab-Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* TRIM */}
        {activeTab === 'trim' && (
          <div className="space-y-3">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Ziehe die gelben Handles in der Timeline um den Bereich zu waehlen.
            </p>
            <div className={`p-3 rounded-lg ${cardBg}`}>
              <div className="flex justify-between text-sm">
                <span>Start: {Math.round(project.trimRange.startMs / 1000)}s</span>
                <span>Ende: {Math.round(project.trimRange.endMs / 1000)}s</span>
              </div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Dauer: {Math.round((project.trimRange.endMs - project.trimRange.startMs) / 1000)}s
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_TRIM', payload: { startMs: 0, endMs: durationMs } })}
              className="w-full py-2 text-xs text-blue-400 border border-blue-400/30 rounded-lg"
            >
              Zuruecksetzen
            </button>
          </div>
        )}

        {/* TEXT OVERLAY */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            {project.textOverlays.map(overlay => (
              <div key={overlay.id} className={`p-2 rounded-lg flex items-center justify-between ${cardBg}`}>
                <span className="text-sm truncate flex-1">{overlay.text}</span>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_TEXT_OVERLAY', payload: overlay.id })}
                  className="text-red-400 ml-2"
                >
                  <span className="material-icons text-sm">delete</span>
                </button>
              </div>
            ))}
            <input
              type="text"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Text eingeben..."
              className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-white placeholder-gray-500' : 'bg-white text-gray-900'} outline-none`}
            />
            <div className="flex gap-2">
              {(['top', 'center', 'bottom'] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => setNewTextPosition(pos)}
                  className={`flex-1 py-1.5 text-xs rounded-lg ${newTextPosition === pos ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}
                >
                  {pos === 'top' ? 'Oben' : pos === 'center' ? 'Mitte' : 'Unten'}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input type="color" value={newTextColor} onChange={e => setNewTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <input type="range" min={12} max={48} value={newTextSize} onChange={e => setNewTextSize(Number(e.target.value))} className="flex-1" />
              <span className="text-xs w-8">{newTextSize}px</span>
            </div>
            <button
              onClick={() => {
                if (!newText.trim()) return;
                dispatch({
                  type: 'ADD_TEXT_OVERLAY',
                  payload: {
                    id: `txt_${Date.now()}`,
                    text: newText,
                    fontSize: newTextSize,
                    color: newTextColor,
                    position: newTextPosition,
                    startTime: project.trimRange.startMs,
                    endTime: project.trimRange.endMs,
                  } as TextOverlay,
                });
                setNewText('');
              }}
              disabled={!newText.trim()}
              className={`w-full py-2 rounded-lg text-sm font-medium ${newText.trim() ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-400'}`}
            >
              Text hinzufuegen
            </button>
          </div>
        )}

        {/* STYLE FILTER */}
        {activeTab === 'style' && (
          <div className="grid grid-cols-3 gap-2">
            {STYLE_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => dispatch({ type: 'SET_STYLE_FILTER', payload: filter.id })}
                className={`p-3 rounded-xl text-center transition-all ${
                  project.styleFilter === filter.id
                    ? 'bg-blue-500/20 border-2 border-blue-500'
                    : isDark ? 'bg-gray-700 border-2 border-transparent' : 'bg-white border-2 border-transparent'
                }`}
              >
                <span className="text-xl block mb-1">{STYLE_EMOJI[filter.id]}</span>
                <span className="text-[10px] font-medium">{filter.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* AUDIO */}
        {activeTab === 'audio' && (
          <div className="space-y-2">
            <button
              onClick={() => dispatch({ type: 'SET_AUDIO_TRACK', payload: null })}
              className={`w-full p-2 rounded-lg text-sm text-left ${!project.audioTrack ? 'bg-blue-500/20 border border-blue-500' : isDark ? 'bg-gray-700' : 'bg-white'}`}
            >
              Kein Audio
            </button>
            {AUDIO_TRACKS.map(track => (
              <button
                key={track.id}
                onClick={() => dispatch({
                  type: 'SET_AUDIO_TRACK',
                  payload: { trackId: track.id, volume: 0.5, fadeIn: true, fadeOut: true, loop: true },
                })}
                className={`w-full p-2 rounded-lg text-left ${
                  project.audioTrack?.trackId === track.id
                    ? 'bg-blue-500/20 border border-blue-500'
                    : isDark ? 'bg-gray-700' : 'bg-white'
                }`}
              >
                <div className="text-sm font-medium">{track.name}</div>
                <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {track.genre} &bull; {track.durationSec}s
                </div>
              </button>
            ))}
          </div>
        )}

        {/* FACE */}
        {activeTab === 'face' && (
          <div className="space-y-3 text-center py-4">
            <span className="text-4xl">{'\u{1F9D1}'}</span>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Face-Swap wird auf das exportierte Video angewendet.
              Stelle sicher, dass dein Gesichtsfoto im Profil hinterlegt ist.
            </p>
            <button
              onClick={() => {
                dispatch({
                  type: 'SET_FACE_SWAP',
                  payload: project.faceSwapRequest
                    ? null
                    : { faceImageBase64: '', status: 'pending' as const },
                });
              }}
              className={`w-full py-3 rounded-xl font-medium text-sm ${
                project.faceSwapRequest
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-cyan-500 text-white'
              }`}
            >
              {project.faceSwapRequest ? 'Face-Swap deaktivieren' : 'Face-Swap aktivieren'}
            </button>
          </div>
        )}

        {/* EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              {(['hd', '4k'] as const).map(res => (
                <button
                  key={res}
                  onClick={() => dispatch({ type: 'SET_EXPORT_SETTINGS', payload: { ...project.exportSettings, resolution: res } })}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase ${
                    project.exportSettings.resolution === res
                      ? 'bg-blue-500 text-white'
                      : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
            <div className={`p-3 rounded-xl ${cardBg}`}>
              <div className="flex justify-between text-sm">
                <span>Kosten:</span>
                <span className="font-bold">
                  {project.exportSettings.resolution === 'hd' ? 50 : 100} Coins
                </span>
              </div>
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98]">
              Video exportieren
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProVideoToolPanel;
