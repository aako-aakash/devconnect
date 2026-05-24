import { Link } from 'react-router-dom'
import { Code2, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm slide-up">
        <p className="font-mono text-8xl font-bold text-brand-600/30 leading-none mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Page not found</h1>
        <p className="text-slate-500 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/feed" className="btn-primary">
          <Home className="h-4 w-4" />
          Back to Feed
        </Link>
      </div>
    </div>
  )
}
