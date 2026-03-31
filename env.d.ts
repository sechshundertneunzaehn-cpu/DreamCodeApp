/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_DEEPGRAM_API_KEY: string;
  readonly VITE_GROQ_API_KEY: string;
  readonly VITE_MISTRAL_API_KEY: string;
  readonly VITE_GOOGLE_CLOUD_TTS_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_GEMINI_API_KEY_2: string;
  readonly VITE_GEMINI_API_KEY_3: string;
  readonly VITE_GEMINI_API_KEY_4: string;
  readonly VITE_RUNWARE_API_KEY: string;
  readonly VITE_GETIMG_API_KEY: string;
  readonly VITE_DEEPSEEK_API_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_REPLICATE_API_KEY: string;
  readonly VITE_ELEVENLABS_API_KEY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
