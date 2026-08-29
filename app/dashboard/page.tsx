'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { NotebookCard } from '@/components/notebook/NotebookCard'
import { Plus, BookOpen, Users, Compass, Lock, Globe, X } from 'lucide-react'
import { NOTEBOOK_COLORS, SUBJECT_TAGS } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notebooks, setNotebooks] = useState<{ owned: any[]; collaborating: any[] }>({ owned: [], collaborating: [] })
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    tag: '',
    coverColor: NOTEBOOK_COLORS[0],
    visibility: 'private',
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch('/api/notebooks')
        .then((r) => r.json())
        .then((d) => setNotebooks(d))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [session])

  const createNotebook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setCreating(true)
    try {
      const res = await fetch('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Notebook created')
      router.push(`/notebooks/${data.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create notebook')
    } finally {
      setCreating(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="sh-skeleton h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="sh-skeleton h-[200px] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Section 10 Dashboard Header: Greeting & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
              {getGreeting()}, {session?.user?.name || 'Student'}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Organize your study resources and continue where you left off.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/explore"
              className="px-3.5 py-2 sh-btn-secondary text-xs font-semibold flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-text-muted" />
              <span>Explore Stacks</span>
            </Link>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 sh-btn-primary text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notebook</span>
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="mt-8 space-y-10">
          
          {/* My Notebooks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-navy flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>My Notebooks</span>
              </h2>
              <span className="text-xs font-semibold text-text-muted bg-surface border border-border px-2 py-0.5 rounded-md">
                {notebooks.owned.length} total
              </span>
            </div>

            {notebooks.owned.length === 0 ? (
              <div className="sh-card p-10 text-center border-dashed">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-primary flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy">No notebooks yet</h3>
                <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
                  Create your first notebook to organize study materials, lecture slides, and notes.
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 px-4 py-2 sh-btn-primary text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Notebook</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {notebooks.owned.map((nb) => (
                  <NotebookCard key={nb.id} notebook={nb} isOwner href={`/notebooks/${nb.id}`} />
                ))}
              </div>
            )}
          </section>

          {/* Shared With Me */}
          {notebooks.collaborating.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-navy flex items-center gap-2">
                  <Users className="w-4 h-4 text-success" />
                  <span>Shared With Me</span>
                </h2>
                <span className="text-xs font-semibold text-text-muted bg-surface border border-border px-2 py-0.5 rounded-md">
                  {notebooks.collaborating.length} total
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {notebooks.collaborating.map((nb) => (
                  <NotebookCard key={nb.id} notebook={nb} href={`/notebooks/${nb.id}`} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Clean Create Notebook Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-lg overflow-hidden border border-border shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-navy">Create Notebook</h3>
                  <p className="text-xs text-text-muted mt-0.5">Start a structured workspace for your subject.</p>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="w-8 h-8 rounded-lg hover:bg-background text-text-muted hover:text-navy flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={createNotebook} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                    Notebook Name *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Class 12 Physics"
                    className="w-full px-3.5 py-2.5 sh-input"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of this notebook..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 sh-input resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                      Subject
                    </label>
                    <select
                      value={form.tag}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      className="w-full px-3 py-2.5 sh-input text-navy font-medium"
                    >
                      <option value="">Select subject...</option>
                      {SUBJECT_TAGS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                      Visibility
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-border bg-background p-0.5">
                      {['private', 'public'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setForm({ ...form, visibility: v })}
                          className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-md transition-colors ${
                            form.visibility === v
                              ? 'bg-white text-primary shadow-xs'
                              : 'text-text-muted hover:text-navy'
                          }`}
                        >
                          {v === 'private' ? '🔒 Private' : '🌎 Public'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy mb-1.5">
                    Cover Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {NOTEBOOK_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, coverColor: color })}
                        className={`w-7 h-7 rounded-lg border-2 transition-transform ${
                          form.coverColor === color
                            ? 'border-navy scale-110'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 sh-btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-2.5 sh-btn-primary text-xs disabled:opacity-60"
                  >
                    {creating ? 'Creating...' : 'Create Notebook'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
