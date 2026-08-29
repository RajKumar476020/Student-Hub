'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.displayName.trim()) e.displayName = 'Full name is required'
    if (!form.username.trim()) e.username = 'Username is required'
    else if (!/^[a-z0-9_]+$/.test(form.username)) e.username = 'Lowercase letters, numbers, and underscores only'
    else if (form.username.length < 3) e.username = 'Minimum 3 characters'
    if (!form.email) e.email = 'Email is required'
    if (form.password.length < 8) e.password = 'Minimum 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      if (!result?.error) {
        toast.success('Welcome to StudentHub! 🎉')
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    } catch (err: any) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Showcase Column */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-surface p-12 flex-col justify-between border-r border-border">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border bg-surface flex items-center justify-center">
            <Image src="/logo.png" alt="StudentHub Logo" width={32} height={32} className="object-cover" priority />
          </div>
          <span className="font-bold text-lg text-navy">StudentHub</span>
        </Link>

        <div className="space-y-6 max-w-md my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-primary text-xs font-semibold">
            <span>Free student account</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-navy leading-tight">
            Keep your coursework organized in one focused platform.
          </h2>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
              <Check className="w-4 h-4 text-success" /> Unlimited personal notebooks and study files
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
              <Check className="w-4 h-4 text-success" /> Real-time peer co-editing and collaboration
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
              <Check className="w-4 h-4 text-success" /> Fast search across community study stacks
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted font-mono">
          © {new Date().getFullYear()} StudentHub. All rights reserved.
        </p>
      </div>

      {/* Right Form Column */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-[420px]">
          
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border">
              <Image src="/logo.png" alt="StudentHub Logo" width={32} height={32} className="object-cover" priority />
            </div>
            <span className="font-bold text-lg text-navy">StudentHub</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Create your account
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Join students organizing their learning resources with StudentHub.
            </p>
          </div>

          <div className="sh-card p-6 sm:p-7 bg-surface">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={update('displayName')}
                  placeholder="e.g. Marie Curie"
                  className="w-full px-3.5 py-2.5 sh-input"
                  autoFocus
                />
                {errors.displayName && <p className="text-xs text-danger mt-1 font-semibold">{errors.displayName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono">@</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => update('username')({ target: { value: e.target.value.toLowerCase() } } as any)}
                    placeholder="marie_curie"
                    className="w-full pl-7 pr-3.5 py-2.5 sh-input font-mono text-xs"
                  />
                </div>
                {errors.username && <p className="text-xs text-danger mt-1 font-semibold">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="marie@university.edu"
                  className="w-full px-3.5 py-2.5 sh-input"
                />
                {errors.email && <p className="text-xs text-danger mt-1 font-semibold">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Minimum 8 characters"
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
                {errors.password && <p className="text-xs text-danger mt-1 font-semibold">{errors.password}</p>}
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
                    <span>Create Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-text-muted mt-5">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}