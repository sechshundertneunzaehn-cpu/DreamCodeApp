import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
      base: process.env.GITHUB_PAGES === 'true' ? '/DreamCodeApp/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/groq': {
            target: 'https://api.groq.com',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/api\/groq/, ''),
          },
          '/api/deepseek': {
            target: 'https://api.deepseek.com',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/api\/deepseek/, ''),
          },
          '/api/mistral': {
            target: 'https://api.mistral.ai',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/api\/mistral/, ''),
          },
          '/api/replicate': {
            target: 'https://api.replicate.com',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/api\/replicate/, ''),
          },
          '/api/getimg': {
            target: 'https://api.getimg.ai',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/api\/getimg/, ''),
          },
          '/api/deepgram': {
            target: 'https://api.deepgram.com',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/api\/deepgram/, ''),
          },
          '/api/gemini': {
            target: 'https://generativelanguage.googleapis.com',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/api\/gemini/, ''),
          },
          '/api/runware': {
            target: 'https://api.runware.ai',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/api\/runware/, ''),
          },
        }
      },
      plugins: [react()],
      define: {
        // VITE_ Keys werden von import.meta.env automatisch gelesen
        // Hier nur process.env Kompatibilitaet fuer alte SDK-Aufrufe
        'process.env.API_KEY':            JSON.stringify(env.VITE_GEMINI_API_KEY    || ''),
        'process.env.GEMINI_API_KEY':     JSON.stringify(env.VITE_GEMINI_API_KEY    || ''),
        'process.env.GEMINI_API_KEY_2':   JSON.stringify(env.VITE_GEMINI_API_KEY_2  || ''),
        'process.env.GEMINI_API_KEY_3':   JSON.stringify(env.VITE_GEMINI_API_KEY_3  || ''),
        'process.env.GEMINI_API_KEY_4':   JSON.stringify(env.VITE_GEMINI_API_KEY_4  || ''),
        'process.env.GROQ_API_KEY':       JSON.stringify(env.VITE_GROQ_API_KEY      || ''),
        'process.env.MISTRAL_API_KEY':    JSON.stringify(env.VITE_MISTRAL_API_KEY   || ''),
        'process.env.RUNWARE_API_KEY':    JSON.stringify(env.VITE_RUNWARE_API_KEY   || ''),
        'process.env.DEEPGRAM_API_KEY':   JSON.stringify(env.VITE_DEEPGRAM_API_KEY  || ''),
        'process.env.REPLICATE_API_KEY':  JSON.stringify(env.VITE_REPLICATE_API_KEY || ''),
        'process.env.GETIMG_API_KEY':     JSON.stringify(env.VITE_GETIMG_API_KEY    || ''),
        'process.env.DEEPSEEK_API_KEY':   JSON.stringify(env.VITE_DEEPSEEK_API_KEY  || ''),
        'process.env.OPENAI_API_KEY':     JSON.stringify(env.VITE_OPENAI_API_KEY    || ''),
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
              'vendor-pdf': ['html2canvas', 'jspdf'],
              'knowledge': ['./data/knowledgeBase'],
              'services': [
                './services/geminiService',
                './services/videoGenerationService',
                './services/elevenlabsService',
              ],
            },
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
