import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-border bg-surface flex items-center justify-center">
                <Image src="/logo.png" alt="StudentHub Logo" width={28} height={28} className="object-cover" />
              </div>
              <span className="font-bold text-base text-navy">StudentHub</span>
            </Link>
            <p className="text-xs text-text-muted max-w-sm leading-relaxed">
              A modern, GitHub-inspired knowledge platform for students to organize coursework, share revision notes, and collaborate.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-success inline-block" />
              <span>All systems operational</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-navy">Platform</p>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <Link href="/dashboard" className="hover:text-navy transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-navy transition-colors">Explore Stacks</Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-navy transition-colors">Search Content</Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-navy transition-colors">Create Account</Link>
              </li>
            </ul>
          </div>

          {/* Community & Legal */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-navy">Community</p>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <span className="text-text-muted">Academic Integrity</span>
              </li>
              <li>
                <span className="text-text-muted">Privacy Policy</span>
              </li>
              <li>
                <span className="text-text-muted">Terms of Service</span>
              </li>
              <li>
                <span className="text-text-muted">support@studenthub.in</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 mt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted font-mono">
          <p>© {new Date().getFullYear()} StudentHub. All rights reserved.</p>
          <p>Built for students worldwide.</p>
        </div>
      </div>
    </footer>
  )
}