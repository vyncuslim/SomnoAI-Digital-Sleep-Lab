import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#01040a] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="p-4 bg-rose-500/10 rounded-full text-rose-500 mb-6 border border-rose-500/20">
            <AlertCircle size={48} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2">System Malfunction</h1>
          <p className="text-slate-400 max-w-md mb-8 font-mono text-sm">
            The neural interface encountered a critical error.
            <br />
            <span className="text-rose-400 mt-2 block bg-black/50 p-2 rounded border border-rose-500/20">
              {this.state.error?.message || 'Unknown Error'}
            </span>
          </p>
          <button
            onClick={this.handleReload}
            className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} /> Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
