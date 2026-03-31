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
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <h3 className="text-lg font-bold text-white mb-2">Etwas ist schiefgelaufen</h3>
          <p className="text-sm text-slate-400 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold text-sm transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
