import React from 'react';

interface StoryVideoPlayerProps {
  videoUrl?: string;
  onClose?: () => void;
}

const StoryVideoPlayer: React.FC<StoryVideoPlayerProps> = ({ videoUrl, onClose }) => {
  if (!videoUrl) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <video src={videoUrl} controls autoPlay className="max-w-full max-h-full rounded-xl" />
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2">
          <span className="material-icons">close</span>
        </button>
      )}
    </div>
  );
};

export default StoryVideoPlayer;
