'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, ArrowRight, ShieldCheck, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        toast.error('Invalid email or password')
      } else {
        toast.success('Welcome back to StudentHub!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Form Column */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-[400px]">
          
          {/* Brand Header */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group focus:outline-none">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border bg-surface flex items-center justify-center">
              <Image src="/logo.png" alt="StudentHub Logo" width={32} height={32} className="object-cover" priority />
            </div>
            <span className="font-bold text-lg tracking-tight text-navy">
              StudentHub
            </span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Sign in to your account
            </h1>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Access your personal notebooks, files, and collaborative stacks.
            </p>
          </div>

          <div className="sh-card p-6 sm:p-7 bg-surface">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@college.edu"
                  className="w-full px-3.5 py-2.5 sh-input"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase text-navy">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 sh-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 sh-btn-primary text-xs font-bold mt-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-text-muted mt-5">
            Don’t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Editorial Showcase */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-surface p-12 flex-col justify-between border-l border-border">
        <div className="space-y-6 max-w-md my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-primary text-xs font-semibold">
            <span>Built for students</span>
          </div>

          <blockquote className="text-2xl font-bold tracking-tight text-navy leading-snug">
            “StudentHub feels like GitHub, but tailored for course materials, handwritten notes, and peer collaboration.”
          </blockquote>
          
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
              <Check className="w-4 h-4 text-success" /> Structured file directories with deep nesting
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
              <Check className="w-4 h-4 text-success" /> Integrated markdown notes and PDF previews
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
              <Check className="w-4 h-4 text-success" /> Explicit public vs private sharing controls
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted font-mono">
          © {new Date().getFullYear()} StudentHub. All rights reserved.
        </p>
      </div>
    </div>
  )
}