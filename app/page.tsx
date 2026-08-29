import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { NotebookCard } from '@/components/notebook/NotebookCard'
import { ArrowRight, Search, Compass, Folder, Users, Download, Shield, BookOpen, Check } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getPopularNotebooks() {
  try {
    return await prisma.notebook.findMany({
      where: { visibility: 'public' },
      orderBy: { downloadCount: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        tag: true,
        coverColor: true,
        viewCount: true,
        downloadCount: true,
        updatedAt: true,
        visibility: true,
        owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { files: { where: { deletedAt: null } }, notes: true } },
      },
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const popular = await getPopularNotebooks()

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-surface py-14 sm:py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-primary">
                <span>The GitHub-inspired study workspace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy leading-[1.15]">
                A better place to <br className="hidden sm:inline" />
                <span className="text-primary">organize & share</span> your knowledge.
              </h1>

              <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
                StudentHub provides students with clean digital notebooks to structure notes, store lecture files, collaborate in real time, and share revisions effortlessly.
              </p>

              {/* Primary Call to Action */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-6 py-3 sh-btn-primary text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>Start learning for free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/explore"
                  className="w-full sm:w-auto px-6 py-3 sh-btn-secondary text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-text-muted" />
                  <span>Explore public stacks</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-6 pt-4 text-xs font-medium text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-success" /> 100% Free for students
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-success" /> Private by default
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-success" /> Instant cloud sync
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* Core Product Capabilities */}
        <section className="py-14 sm:py-16 max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-navy">
              Designed for serious study & organization
            </h2>
            <p className="text-sm text-text-muted">
              Everything you need to keep your courses, subjects, and study groups in sync.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Folder,
                title: 'Structured Stacks',
                desc: 'Organize coursework into clean nested folders and files with zero friction.',
              },
              {
                icon: Users,
                title: 'Collaborative Groups',
                desc: 'Invite classmates to co-edit revision notes and share past question sets.',
              },
              {
                icon: Download,
                title: 'Offline Export',
                desc: 'Download entire notebooks into clean ZIP packages whenever you need them.',
              },
              {
                icon: Shield,
                title: 'Explicit Privacy',
                desc: 'Keep raw notes strictly private or publish polished stacks to the community.',
              },
            ].map((f) => (
              <div key={f.title} className="sh-card p-5 bg-surface space-y-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-primary flex items-center justify-center font-bold">
                  <f.icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-navy">{f.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Notebooks Section */}
        {popular.length > 0 && (
          <section className="py-14 border-t border-border bg-surface">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-navy">
                    Popular Community Notebooks
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    Curated learning material shared by top students.
                  </p>
                </div>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  <span>Explore all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {popular.map((nb: any) => (
                  <NotebookCard key={nb.id} notebook={nb} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Bottom Call to Action */}
        <section className="py-16 border-t border-border bg-background">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
              Start building your knowledge stack today
            </h2>
            <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
              Join thousands of students organizing their study materials in one focused place.
            </p>
            <div className="pt-2">
              <Link
                href="/signup"
                className="px-6 py-3 sh-btn-primary text-sm font-semibold inline-flex items-center gap-2"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}