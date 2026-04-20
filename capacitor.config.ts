import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dreamcode.app',
  appName: 'DreamCode',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f0b1a',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
