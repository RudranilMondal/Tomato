import React from 'react';

/**
 * Clean, lightweight, brand-aligned loading spinner for lazy-loaded route views and modals.
 */
export const RouteLoadingFallback: React.FC<{ label?: string; minHeight?: string }> = ({
  label = 'Loading...',
  minHeight = '300px'
}) => (
  <div
    style={{
      flex: 1,
      minHeight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
      padding: '24px',
      color: 'var(--color-text-muted, #71717A)',
      fontFamily: 'inherit'
    }}
  >
    <div
      style={{
        width: '34px',
        height: '34px',
        border: '3px solid rgba(255, 75, 58, 0.2)',
        borderTopColor: 'var(--color-primary, #FF4B3A)',
        borderRadius: '50%',
        animation: 'tomattto-spin 0.8s linear infinite'
      }}
    />
    <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em' }}>{label}</span>
    <style>{`
      @keyframes tomattto-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Production-ready Error Boundary for dynamic chunk loading and component crashes.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[G1 Bites ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            flex: 1,
            minHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '32px',
            textAlign: 'center',
            color: 'var(--color-text, #18181B)'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 75, 58, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary, #FF4B3A)',
              fontSize: '22px',
              fontWeight: 800
            }}
          >
            !
          </div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
            {this.props.fallbackTitle || 'Unable to load this section'}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted, #71717A)', maxWidth: '320px' }}>
            A temporary connection issue prevented this view from loading.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              marginTop: '6px',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full, 999px)',
              backgroundColor: 'var(--color-primary, #FF4B3A)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 75, 58, 0.3)'
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
