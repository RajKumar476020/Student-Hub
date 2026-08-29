'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { User, Building2, Save, AtSign, Mail, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({ displayName: '', bio: '', institution: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch('/api/users/me')
        .then((r) => r.json())
        .then((u) => setForm({ displayName: u.displayName || '', bio: u.bio || '', institution: u.institution || '' }))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [session])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-[680px] w-full mx-auto px-4 py-12 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="sh-skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[680px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-navy">Account Settings</h1>
          <p className="text-xs text-text-muted mt-1">Manage your public profile and educational details.</p>
        </div>

        <div className="sh-card p-6 bg-surface mb-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-navy text-sm">Public Profile</h2>
              <p className="text-xs text-text-muted">Displayed on your public notebook stacks.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                Display Name
              </label>
              <input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="w-full px-3.5 py-2.5 sh-input"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                Study Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                maxLength={280}
                className="w-full px-3.5 py-2.5 sh-input resize-none text-xs"
                placeholder="What are you studying or preparing for? (e.g. Class 12 CBSE / CS Undergrad)"
              />
              <p className="text-[11px] text-text-muted mt-1 text-right font-mono">{form.bio.length}/280</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-text-muted" />
                <span>College / School</span>
              </label>
              <input
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                className="w-full px-3.5 py-2.5 sh-input"
                placeholder="e.g. Delhi Public School / IIT Delhi"
              />
            </div>
          </div>
        </div>

        {/* Read-only Credentials */}
        <div className="sh-card p-6 bg-surface mb-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-background text-text-muted flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-navy text-sm">Account Identifiers</h2>
              <p className="text-xs text-text-muted">Fixed account parameters.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
              <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5" />
                <span>Username</span>
              </span>
              <span className="text-xs font-mono font-bold text-navy">
                @{(session?.user as any)?.username}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
              <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </span>
              <span className="text-xs font-mono font-semibold text-navy truncate ml-4">
                {session?.user?.email}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 sh-btn-primary text-xs font-bold disabled:opacity-60"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </main>

      <Footer />
    </div>
  )
}