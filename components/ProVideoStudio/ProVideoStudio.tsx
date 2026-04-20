/**
 * ProVideoStudio — Professioneller Video-Editor fuer DreamCode.
 * Root-Komponente: orchestriert Layout, State und Sub-Komponenten.
 */

import React from 'react';
import { ThemeMode } from '../../types';
import { useProVideoState } from './hooks/useProVideoState';
import { useVideoPlayback } from './hooks/useVideoPlayback';
import ProVideoPreview from './ProVideoPreview';
import ProVideoTimeline from './ProVideoTimeline';
import ProVideoToolPanel from './ProVideoToolPanel';

interface ProVideoStudioProps {
  sourceVideoUrl: string;
  themeMode: ThemeMode;
  onClose: () => void;
  onExport?: (projectJson: string) => void;
}

const ProVideoStudio: React.FC<ProVideoStudioProps> = ({
  sourceVideoUrl,
  themeMode,
  onClose,
  onExport,
}) => {
  const isDark = themeMode === ThemeMode?.DARK;

  // Initialer Dummy-Wert fuer Duration (wird beim Video-Load aktualisiert)
  const { project, dispatch } = useProVideoState(sourceVideoUrl, 10000);

  const {
    videoRef,
    currentTime,
    duration,
    playing,
    togglePlay,
    seekTo,
    handleLoadedMetadata,
    handleTimeUpdate,
  } = useVideoPlayback(project.trimRange);

  // Duration aktualisieren wenn Video geladen
  React.useEffect(() => {
    if (duration > 0 && duration !== project.durationMs) {
      dispatch({ type: 'SET_TRIM', payload: { startMs: 0, endMs: duration } });
    }
  }, [duration]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <button onClick={onClose} className="text-2xl">&times;</button>
        <h2 className="text-sm font-bold tracking-wide uppercase">Pro Studio</h2>
        <button
          onClick={() => {
            if (onExport) onExport(JSON.stringify(project));
          }}
          className="text-sm text-blue-500 font-bold"
        >
          Export
        </button>
      </div>

      {/* Main Content — Responsive Grid */}
      <div className="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-[1fr_320px] lg:grid-rows-[1fr_auto]">

        {/* Video Preview */}
        <div className="lg:col-start-1 lg:row-start-1 p-2 flex items-center justify-center">
          <ProVideoPreview
            videoRef={videoRef}
            sourceVideoUrl={sourceVideoUrl}
            styleFilter={project.styleFilter}
            textOverlays={project.textOverlays}
            currentTimeMs={currentTime}
            playing={playing}
            onTogglePlay={togglePlay}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            isDark={isDark}
          />
        </div>

        {/* Tool Panel (rechts auf Desktop, unten auf Mobile) */}
        <div className="lg:col-start-2 lg:row-span-2 border-l border-gray-700/30 min-h-0 overflow-hidden">
          <ProVideoToolPanel
            project={project}
            dispatch={dispatch}
            durationMs={duration}
            currentTimeMs={currentTime}
            isDark={isDark}
          />
        </div>

        {/* Timeline (unten) */}
        <div className="lg:col-start-1 lg:row-start-2 p-2">
          <ProVideoTimeline
            durationMs={duration}
            currentTimeMs={currentTime}
            trimRange={project.trimRange}
            textOverlays={project.textOverlays}
            onSeek={seekTo}
            onTrimChange={(trim) => dispatch({ type: 'SET_TRIM', payload: trim })}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
};

export default ProVideoStudio;
