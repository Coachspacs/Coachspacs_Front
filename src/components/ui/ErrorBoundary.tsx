"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  description?: string;
  resetText?: string;
  className?: string;
  onReset?: () => void;
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
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const {
        title = "Component Error",
        description = "This section failed to load properly. The rest of the application remains functional.",
        resetText = "Try Again",
        className = "",
      } = this.props;

      return (
        <div className={`p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-3 font-sans my-4 shadow-xs ${className}`}>
          <div className="mx-auto w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-2xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {description}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{resetText}</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
