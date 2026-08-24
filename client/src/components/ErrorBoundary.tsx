import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            <h1 className="text-2xl font-bold text-text tracking-tight mb-2">Something went wrong</h1>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              An unexpected error occurred. Please try refreshing the page. If the problem persists, contact support.
            </p>
            {this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-surface border border-border/50 text-left">
                <p className="text-xs font-mono text-text-muted break-all leading-relaxed">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-light transition-all duration-200 shadow-sm text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh page
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border text-text-muted font-medium rounded-xl hover:border-brand-navy hover:text-brand-navy transition-all duration-200 text-sm"
              >
                <Home className="w-4 h-4" />
                Go home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}