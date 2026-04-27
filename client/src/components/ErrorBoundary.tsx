import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React Component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-rose-900/30 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="h-16 w-16 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            Something went wrong
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-sm leading-relaxed">
            A rendering error occurred in this section. The development team has been notified.
            <br />
            <span className="mt-2 block font-mono text-xs text-rose-500/80 p-2 bg-rose-50 dark:bg-rose-950/50 rounded-lg text-left overflow-x-auto">
                {this.state.error?.message || 'Unknown render error'}
            </span>
          </p>
          
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
