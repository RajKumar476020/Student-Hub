import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Search, Compass, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] bg-background flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md w-full sh-card p-8 bg-surface">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-warning flex items-center justify-center mx-auto mb-4 font-bold">
            <Search className="w-6 h-6" />
          </div>
          <h1 className="font-bold text-2xl text-navy">Page not found</h1>
          <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
            The page or study stack you are looking for doesn’t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-6">
            <Link href="/" className="w-full sm:w-auto px-4 py-2 sh-btn-primary text-xs font-semibold flex items-center justify-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span>Go to Home</span>
            </Link>
            <Link href="/explore" className="w-full sm:w-auto px-4 py-2 sh-btn-secondary text-xs font-semibold flex items-center justify-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-text-muted" />
              <span>Explore Stacks</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
