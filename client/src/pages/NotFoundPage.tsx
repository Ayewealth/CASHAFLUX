import { Link } from 'react-router'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <p className="text-[120px] font-bold text-brand-navy/10 leading-none tracking-tighter font-mono">404</p>
        </div>
        <h1 className="text-2xl font-bold text-text tracking-tight mb-2">Page not found</h1>
        <p className="text-sm text-text-muted leading-relaxed mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Check the URL or head back home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-light transition-all duration-200 shadow-sm text-sm"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border text-text-muted font-medium rounded-xl hover:border-brand-navy hover:text-brand-navy transition-all duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}