'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Search,
  Menu,
  X,
  Plus,
  LogOut,
  User,
  Settings,
  Compass,
  Bell,
  LayoutDashboard,
  BookOpen,
} from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border bg-surface flex items-center justify-center shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="StudentHub Logo" 
                  width={32}
                  height={32}
                  className="object-cover"
                  priority
                />
              </div>
              <span className="font-bold text-lg tracking-tight text-navy">
                StudentHub
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavPill href="/dashboard" active={pathname?.startsWith('/dashboard')} icon={<LayoutDashboard className="w-4 h-4" />}>
                Dashboard
              </NavPill>
              <NavPill href="/explore" active={pathname === '/explore'} icon={<Compass className="w-4 h-4" />}>
                Explore
              </NavPill>
              <NavPill href="/search" active={pathname === '/search'} icon={<Search className="w-4 h-4" />}>
                Search
              </NavPill>
            </nav>
          </div>

          {/* Quick Search Shortcut & Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-background hover:bg-slate-100 border border-border rounded-lg text-xs text-text-muted transition-colors font-medium"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search notebooks, files...</span>
              <kbd className="font-mono bg-white border border-border px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-semibold">
                /
              </kbd>
            </Link>

            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 sh-btn-primary text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>New</span>
                </Link>

                <Link
                  href="/notifications"
                  className="w-8 h-8 rounded-lg border border-border hover:bg-background text-text-muted hover:text-navy flex items-center justify-center transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </Link>

                {/* Profile Popover */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-8 h-8 rounded-lg overflow-hidden border border-border hover:border-border-dark transition-colors flex items-center justify-center bg-navy text-white font-bold text-xs"
                  >
                    {session.user.name?.[0]?.toUpperCase() || 'U'}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-xl border border-border shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-2.5 border-b border-border mb-1">
                        <p className="font-bold text-sm text-navy truncate">{session.user.name}</p>
                        <p className="text-xs text-text-muted truncate">{session.user.email}</p>
                        <p className="text-xs font-mono text-primary font-medium mt-0.5">
                          @{(session.user as any).username || 'student'}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <DropdownLink href="/dashboard" onClick={() => setDropdownOpen(false)}>
                          <BookOpen className="w-4 h-4 text-text-muted" />
                          <span>My Notebooks</span>
                        </DropdownLink>
                        <DropdownLink href={`/u/${(session.user as any).username || ''}`} onClick={() => setDropdownOpen(false)}>
                          <User className="w-4 h-4 text-text-muted" />
                          <span>Public Profile</span>
                        </DropdownLink>
                        <DropdownLink href="/settings" onClick={() => setDropdownOpen(false)}>
                          <Settings className="w-4 h-4 text-text-muted" />
                          <span>Settings</span>
                        </DropdownLink>
                        <div className="h-px bg-border my-1" />
                        <button
                          onClick={() => {
                            setDropdownOpen(false)
                            signOut({ callbackUrl: '/' })
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-danger hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-navy transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 sh-btn-primary text-xs font-semibold"
                >
                  Get started
                </Link>
              </>
            )}

            {/* Mobile Navigation Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-border space-y-1">
            <MobileLink href="/dashboard" onClick={() => setMenuOpen(false)}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </MobileLink>
            <MobileLink href="/explore" onClick={() => setMenuOpen(false)}>
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </MobileLink>
            <MobileLink href="/search" onClick={() => setMenuOpen(false)}>
              <Search className="w-4 h-4" />
              <span>Search</span>
            </MobileLink>
          </div>
        )}
      </div>
    </header>
  )
}

function NavPill({ href, active, children, icon }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-primary font-semibold'
          : 'text-text-muted hover:text-navy hover:bg-background'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}

function DropdownLink({ href, children, onClick }: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-navy hover:bg-background rounded-lg transition-colors"
    >
      {children}
    </Link>
  )
}

function MobileLink({ href, onClick, children }: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-navy hover:bg-background rounded-lg transition-colors"
    >
      {children}
    </Link>
  )
}