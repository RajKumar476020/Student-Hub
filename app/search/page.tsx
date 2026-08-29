'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { NotebookCard } from '@/components/notebook/NotebookCard'
import { Search as SearchIcon, X, BookOpen, CornerDownLeft } from 'lucide-react'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '')
  const [notebooks, setNotebooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setNotebooks([])
      setTotal(0)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setNotebooks(data.notebooks || [])
      setTotal(data.pagination?.total || 0)
    } catch {
      setNotebooks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    doSearch(query)
    if (query) router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false })
  }, [query, doSearch, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(inputValue)
  }

  return (
    <main className="flex-1">
      {/* Search Header Hero */}
      <div className="border-b border-border bg-surface py-8 sm:py-10">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
            Search Notebooks
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Search titles, subjects, and study materials across public notebooks.
          </p>

          {/* Search Input Bar */}
          <form onSubmit={handleSubmit} className="relative mt-6">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <SearchIcon className="w-4 h-4" />
            </div>

            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search by topic, e.g. 'Class 12 Physics', 'Calculus'..."
              className="w-full pl-10 pr-20 py-3 sh-input text-sm font-medium"
              autoFocus
            />

            {inputValue ? (
              <button
                type="button"
                onClick={() => {
                  setInputValue('')
                  setQuery('')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md hover:bg-background text-text-muted flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-background border border-border px-2 py-0.5 rounded">
                <span>Enter</span>
                <CornerDownLeft className="w-2.5 h-2.5" />
              </span>
            )}
          </form>

          {/* Quick Suggestions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-muted">Popular:</span>
            {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Class 12'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInputValue(s)
                  setQuery(s)
                }}
                className="text-xs font-medium text-text-muted hover:text-navy bg-background hover:bg-slate-100 border border-border px-2.5 py-1 rounded-md transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="sh-skeleton h-[200px] rounded-xl" />
            ))}
          </div>
        ) : query && notebooks.length === 0 ? (
          <div className="text-center py-16 sh-card border-dashed p-8 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-warning flex items-center justify-center mx-auto mb-3">
              <SearchIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-navy">No results for “{query}”</h3>
            <p className="text-xs text-text-muted mt-1">
              Try a broader keyword or explore verified community stacks.
            </p>
          </div>
        ) : notebooks.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-text-muted">
                Found <span className="text-navy font-bold">{total}</span> notebooks for “{query}”
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {notebooks.map((nb) => (
                <NotebookCard key={nb.id} notebook={nb} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 sh-card p-8 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-primary flex items-center justify-center mx-auto mb-3">
              <SearchIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy">Type to start searching</h3>
            <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto leading-relaxed">
              Find study notebooks by title, description, or subject tags.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  )
}