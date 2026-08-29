'use client'
import { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { NotebookCard } from '@/components/notebook/NotebookCard'
import { TrendingUp, Clock, Download, Compass, ArrowRight, BookOpen } from 'lucide-react'
import { SUBJECT_TAGS } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Added', icon: Clock },
  { value: 'views', label: 'Most Viewed', icon: TrendingUp },
  { value: 'downloads', label: 'Most Saved', icon: Download },
]

export default function ExplorePage() {
  const [notebooks, setNotebooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('recent')
  const [tag, setTag] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchNotebooks = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ sort, page: page.toString() })
    if (tag) params.set('tag', tag)
    try {
      const res = await fetch(`/api/explore?${params}`)
      const data = await res.json()
      setNotebooks(data.notebooks || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch {
      setNotebooks([])
    } finally {
      setLoading(false)
    }
  }, [sort, tag, page])

  useEffect(() => {
    setPage(1)
  }, [sort, tag])

  useEffect(() => {
    fetchNotebooks()
  }, [fetchNotebooks])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Explore Header */}
        <div className="border-b border-border bg-surface py-8 sm:py-10">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
              Explore Student Knowledge
            </h1>
            <p className="text-sm text-text-muted mt-1 max-w-xl leading-relaxed">
              Discover verified revision notes, hand-written formulas, and past papers shared by students.
            </p>
          </div>
        </div>

        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Controls: Sorting & Subject Filters */}
          <div className="sh-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 bg-background p-1 rounded-lg border border-border w-fit">
              {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSort(value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    sort === value
                      ? 'bg-white text-primary shadow-xs border border-border'
                      : 'text-text-muted hover:text-navy'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-text-muted">
              Select a subject below to filter results
            </p>
          </div>

          {/* Subject Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTag('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                !tag
                  ? 'bg-navy text-white border-navy'
                  : 'bg-surface border-border text-text-muted hover:text-navy hover:bg-background'
              }`}
            >
              All Subjects
            </button>
            {SUBJECT_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setTag(tag === t ? '' : t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  tag === t
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface border-border text-text-muted hover:text-navy hover:bg-background'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="sh-skeleton h-[200px] rounded-xl" />
              ))}
            </div>
          ) : notebooks.length === 0 ? (
            <div className="text-center py-16 sh-card border-dashed p-8">
              <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mx-auto mb-3 text-text-muted">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy">No notebooks found</h3>
              <p className="text-xs text-text-muted mt-1">
                {tag ? `No public notebooks categorized under “${tag}” yet.` : 'No public notebooks available right now.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {notebooks.map((nb) => (
                  <NotebookCard key={nb.id} notebook={nb} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3.5 py-1.5 sh-btn-secondary text-xs font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-mono text-text-muted px-3 py-1.5 bg-surface border border-border rounded-lg">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3.5 py-1.5 sh-btn-secondary text-xs font-semibold disabled:opacity-40 inline-flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
