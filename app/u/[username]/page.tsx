import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { NotebookCard } from '@/components/notebook/NotebookCard'
import { Calendar, BookOpen, Building2, AtSign, Eye, Download } from 'lucide-react'
import { formatDate, formatCount } from '@/lib/utils'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await prisma.user.findUnique({ where: { username }, select: { displayName: true, bio: true } })
  if (!user) return { title: 'User Not Found' }
  return {
    title: `${user.displayName} (@${username})`,
    description: user.bio || `View ${user.displayName}'s public notebooks on StudentHub`,
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      institution: true,
      createdAt: true,
      ownedNotebooks: {
        where: { visibility: 'public' },
        orderBy: { downloadCount: 'desc' },
        take: 24,
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
      },
    },
  })

  if (!user) notFound()
  const totalViews = user.ownedNotebooks.reduce((s, n) => s + n.viewCount, 0)
  const totalDownloads = user.ownedNotebooks.reduce((s, n) => s + n.downloadCount, 0)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Profile Banner */}
        <div className="border-b border-border bg-surface py-10">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              
              <div className="w-16 h-16 rounded-xl bg-navy flex items-center justify-center text-2xl font-bold text-white shrink-0">
                {user.displayName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-navy">{user.displayName}</h1>
                <p className="text-text-muted text-xs font-mono font-medium flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5 text-primary" />
                  <span>{user.username}</span>
                </p>

                {user.bio && (
                  <p className="text-xs leading-relaxed text-text-muted bg-background border border-border rounded-lg p-3 max-w-xl mt-2">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-text-muted">
                  {user.institution && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border">
                      <Building2 className="w-3.5 h-3.5 text-text-muted" />
                      <span>{user.institution}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </span>
                </div>
              </div>

              {/* Stats Column */}
              <div className="flex gap-2.5 w-full sm:w-auto">
                {[
                  { k: user.ownedNotebooks.length, l: 'Notebooks', icon: BookOpen },
                  { k: formatCount(totalViews), l: 'Views', icon: Eye },
                  { k: formatCount(totalDownloads), l: 'Saves', icon: Download },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="flex-1 sm:flex-none sh-card p-3 text-center min-w-[85px] bg-surface"
                  >
                    <s.icon className="w-3.5 h-3.5 mx-auto mb-1 text-text-muted" />
                    <p className="font-bold text-navy text-sm">{s.k}</p>
                    <p className="text-[10px] font-semibold text-text-muted uppercase">{s.l}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Public Notebooks Grid */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold tracking-wide text-navy uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Public Notebooks</span>
            </h2>
            <span className="text-xs font-semibold text-text-muted bg-surface border border-border px-2 py-0.5 rounded-md">
              {user.ownedNotebooks.length} available
            </span>
          </div>

          {user.ownedNotebooks.length === 0 ? (
            <div className="text-center py-16 sh-card border-dashed p-8">
              <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mx-auto mb-3 text-text-muted">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="font-bold text-navy text-sm">No public notebooks yet</p>
              <p className="text-xs text-text-muted mt-0.5">This student has not published any public stacks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {user.ownedNotebooks.map((nb) => (
                <NotebookCard key={nb.id} notebook={nb as any} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}