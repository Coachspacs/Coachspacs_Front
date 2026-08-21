"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-3 font-sans my-4">
          <div className="mx-auto w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900">Component Error</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            This section failed to load properly.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
