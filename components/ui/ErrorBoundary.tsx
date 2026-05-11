/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-full">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Algo deu errado
            </h2>

            <p className="text-gray-400 mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-left">
                <p className="text-xs text-gray-500 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors mx-auto"
            >
              <RefreshCw size={20} />
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
