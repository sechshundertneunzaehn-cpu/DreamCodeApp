import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
      base: '/app/',
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
      // define: {} — alle API-Keys sind server-seitig in /api/* Endpoints
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules/react')) return 'vendor-react';
              if (id.includes('node_modules/html2canvas') || id.includes('node_modules/jspdf')) return 'vendor-pdf';
              if (id.includes('node_modules/mapbox-gl')) return 'vendor-mapbox';
              if (id.includes('data/knowledgeBase')) return 'knowledge';
              if (id.includes('services/geminiService') || id.includes('services/videoGenerationService') || id.includes('services/elevenlabsService')) return 'services';
              if (id.includes('@mediapipe/tasks-vision')) return 'vendor-mediapipe';
              if (id.includes('components/FaceUpload') || id.includes('components/FaceCamera') || id.includes('components/FaceManage') || id.includes('services/faceDetection')) return 'face-upload';
              // Sprach-Chunks: jede Locale als eigener lazy Chunk
              const localeMatch = id.match(/data\/translations\/([a-z]{2}(?:-[a-z]+)?)\.ts$/);
              if (localeMatch) return `locale-${localeMatch[1]}`;
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
