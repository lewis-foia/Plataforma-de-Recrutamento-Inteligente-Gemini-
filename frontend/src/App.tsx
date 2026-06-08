import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppRouter from './routes/AppRouter';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro capturado:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-['Inter',system-ui,sans-serif]">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-md shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Algo correu mal</h2>
            <p className="text-gray-600 text-sm">A página encontrou um erro inesperado. Tente recarregar.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
      <Toaster
        position="top-right"
        richColors
        expand
        visibleToasts={3}
        duration={4000}
        closeButton
        toastOptions={{
          style: {
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 16px',
            borderRadius: '16px',
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          success: { style: { borderLeft: '3px solid #10b981' } },
          error: { style: { borderLeft: '3px solid #ef4444' } },
          warning: { style: { borderLeft: '3px solid #f59e0b' } },
          info: { style: { borderLeft: '3px solid #3b82f6' } },
        }}
      />
    </BrowserRouter>
  );
}

export default App;