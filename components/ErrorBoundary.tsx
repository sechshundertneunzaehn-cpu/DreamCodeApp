import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    // ChunkLoadError nach Deploy: Seite einmal neu laden
    if (error.name === 'ChunkLoadError' || error.message?.includes('Failed to fetch dynamically imported module')) {
      const key = 'chunk_reload';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      const messages: Record<string, { title: string; retry: string }> = {
        de: { title: 'Etwas ist schiefgelaufen', retry: 'Erneut versuchen' },
        en: { title: 'Something went wrong', retry: 'Try again' },
        tr: { title: 'Bir şeyler ters gitti', retry: 'Tekrar dene' },
        ar: { title: 'حدث خطأ ما', retry: 'حاول مرة أخرى' },
        es: { title: 'Algo salió mal', retry: 'Intentar de nuevo' },
        fr: { title: 'Quelque chose a mal tourné', retry: 'Réessayer' },
        pt: { title: 'Algo deu errado', retry: 'Tentar novamente' },
        ru: { title: 'Что-то пошло не так', retry: 'Попробовать снова' },
      };
      const lang = navigator.language?.slice(0, 2) || 'en';
      const msg = messages[lang] || messages.en;
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <h3 className="text-lg font-bold text-white mb-2">{msg.title}</h3>
          <p className="text-sm text-slate-400 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold text-sm transition-colors"
          >
            {msg.retry}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
