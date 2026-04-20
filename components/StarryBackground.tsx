
import React from 'react';
import { ThemeMode, DesignTheme } from '../types';

interface StarryBackgroundProps {
    themeMode: ThemeMode;
    designTheme: DesignTheme;
}

const StarryBackground: React.FC<StarryBackgroundProps> = ({ themeMode, designTheme }) => {
  const isLight = themeMode === ThemeMode.LIGHT;

  // Blob colors based on theme and mode - DARKER colors
  let blob1Color = '';
  let blob2Color = '';
  let blob3Color = '';

  if (designTheme === DesignTheme.FEMININE) {
    if (isLight) {
      blob1Color = 'bg-rose-300';
      blob2Color = 'bg-pink-300';
      blob3Color = 'bg-fuchsia-300';
    } else {
      blob1Color = 'bg-rose-900';
      blob2Color = 'bg-pink-900';
      blob3Color = 'bg-fuchsia-900';
    }
  } else if (designTheme === DesignTheme.MASCULINE) {
    if (isLight) {
      blob1Color = 'bg-sky-300';
      blob2Color = 'bg-cyan-300';
      blob3Color = 'bg-blue-300';
    } else {
      blob1Color = 'bg-sky-900';
      blob2Color = 'bg-cyan-900';
      blob3Color = 'bg-blue-900';
    }
  } else if (designTheme === DesignTheme.NATURE) {
    // Beautiful green theme
    if (isLight) {
      blob1Color = 'bg-emerald-300';
      blob2Color = 'bg-green-300';
      blob3Color = 'bg-teal-300';
    } else {
      blob1Color = 'bg-emerald-900';
      blob2Color = 'bg-green-900';
      blob3Color = 'bg-teal-900';
    }
  } else {
    // Default theme - darker
    if (isLight) {
      blob1Color = 'bg-purple-300';
      blob2Color = 'bg-violet-300';
      blob3Color = 'bg-indigo-300';
    } else {
      blob1Color = 'bg-purple-900';
      blob2Color = 'bg-violet-900';
      blob3Color = 'bg-indigo-900';
    }
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Aurora/Lava Blob Effect - DARKER */}
      <div className="absolute inset-0">
        {/* Blob 1 */}
        <div
          className={`absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full ${blob1Color} ${isLight ? 'mix-blend-multiply' : 'mix-blend-screen'} filter blur-3xl opacity-40 animate-blob`}
        />

        {/* Blob 2 */}
        <div
          className={`absolute top-[-5%] right-[-5%] w-[65vw] h-[65vw] rounded-full ${blob2Color} ${isLight ? 'mix-blend-multiply' : 'mix-blend-screen'} filter blur-3xl opacity-40 animate-blob animation-delay-2000`}
        />

        {/* Blob 3 */}
        <div
          className={`absolute bottom-[-10%] left-[30%] w-[60vw] h-[60vw] rounded-full ${blob3Color} ${isLight ? 'mix-blend-multiply' : 'mix-blend-screen'} filter blur-3xl opacity-40 animate-blob animation-delay-4000`}
        />
      </div>

      {/* Subtle texture overlay (stardust effect) */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAOklEQVQoU2NkYGD4z4AEMJKI0Y6BgSEYiEkxEGMDCwNDOxCTbCA2BtJiIBwYyDYQH0xkG0icXQwMAADhMAr9Hb3xAAAAAElFTkSuQmCC)',
          backgroundRepeat: 'repeat'
        }}
      />
    </div>
  );
};

export default StarryBackground;
