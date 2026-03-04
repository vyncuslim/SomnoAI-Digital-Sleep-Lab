import React from 'react';
import { Language } from '../types';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  lang?: Language;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      const isZh = this.props.lang === 'zh';
      return (
        <div className="min-h-screen bg-[#01040a] flex flex-col items-center justify-center text-white p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
            <span className="text-4xl font-bold">!</span>
          </div>
          <h1 className="text-3xl font-black italic mb-4 uppercase tracking-tighter">
            {isZh ? "出错了" : "Something went wrong"}
          </h1>
          <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
            {isZh 
              ? "我们在加载此实验室节点时遇到了意外错误。请尝试刷新页面或联系支持团队。" 
              : "We encountered an unexpected error while loading this laboratory node. Please try refreshing the page or contact support if the issue persists."}
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              {isZh ? "刷新页面" : "Refresh Page"}
            </button>
            <a 
              href="/contact" 
              className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold transition-all border border-white/10"
            >
              {isZh ? "联系支持" : "Contact Support"}
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
