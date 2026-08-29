import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CommentSection } from '@/components/notebook/CommentSection'
import { FileTree } from '@/components/notebook/FileTree'
import { Eye, Download, FileText, Globe, Calendar, FolderOpen, Layers, User } from 'lucide-react'
import { formatCount, formatDate, formatBytes, getFileIcon } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

async function getNotebook(slug: string) {
  return prisma.notebook.findUnique({
    where: { slug, visibility: 'public' },
    include: {
      owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      collaborators: {
        where: { status: 'accepted' },
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      },
      folders: { where: { deletedAt: null }, orderBy: { name: 'asc' } },
      files: {
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          mimeType: true,
          sizeBytes: true,
          folderId: true,
          downloadCount: true,
          createdAt: true,
          updatedAt: true,
          uploader: { select: { id: true, username: true } },
        },
      },
      notes: {
        orderBy: { updatedAt: 'desc' },
        select: { id: true, title: true, folderId: true, createdAt: true, updatedAt: true },
      },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const notebook = await getNotebook(slug)
  if (!notebook) return { title: 'Notebook Not Found' }
  return {
    title: `${notebook.title} by @${notebook.owner.username}`,
    description: notebook.description || `Study notebook by ${notebook.owner.displayName}`,
    openGraph: {
      title: notebook.title,
      description: notebook.description || `Study notebook by ${notebook.owner.displayName}`,
      type: 'article',
    },
  }
}

export default async function PublicNotebookPage({ params }: Props) {
  const { slug } = await params
  const notebook = await getNotebook(slug)
  if (!notebook) notFound()

  await prisma.notebook.update({ where: { id: notebook.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})
  const totalSize = notebook.files.reduce((sum, f) => sum + Number(f.sizeBytes), 0)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Notebook Header Hero */}
        <div className="border-b border-border bg-surface py-8 sm:py-10">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
              
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-success border border-emerald-200">
                    <Globe className="w-3 h-3" />
                    <span>Public Stack</span>
                  </span>
                  {notebook.tag && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-primary border border-blue-200">
                      {notebook.tag}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
                  {notebook.title}
                </h1>

                {notebook.description && (
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-2xl">
                    {notebook.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-text-muted">
                  <Link
                    href={`/u/${notebook.owner.username}`}
                    className="flex items-center gap-1.5 font-semibold text-navy hover:text-primary transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-bold">
                      {notebook.owner.displayName.charAt(0)}
                    </div>
                    <span>@{notebook.owner.username}</span>
                  </Link>

                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(notebook.createdAt)}</span>
                  </span>

                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{formatCount(notebook.viewCount)} views</span>
                  </span>

                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>{formatCount(notebook.downloadCount)} saves</span>
                  </span>
                </div>
              </div>

              {/* Action Column */}
              <div className="shrink-0 w-full lg:w-auto">
                <a
                  href={`/api/notebooks/${notebook.id}/download-all`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sh-btn-primary text-xs font-bold w-full sm:w-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Download ZIP ({formatBytes(totalSize)})</span>
                </a>
              </div>

            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">
          {/* Left Table of Contents */}
          <aside className="lg:w-[300px] shrink-0">
            <div className="sh-card bg-surface overflow-hidden sticky top-20">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-primary" />
                  <h2 className="text-xs font-bold uppercase text-navy">Contents</h2>
                </div>
                <span className="text-[11px] font-semibold text-text-muted">
                  {notebook.files.length + notebook.notes.length} items
                </span>
              </div>
              <div className="p-2 max-h-[60vh] overflow-y-auto">
                <FileTree
                  notebookId={notebook.id}
                  folders={notebook.folders}
                  files={notebook.files.map((f) => ({ ...f, sizeBytes: f.sizeBytes.toString() })) as any}
                  notes={notebook.notes}
                  canEdit={false}
                />
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Files List */}
            {notebook.files.length > 0 && (
              <div className="sh-card bg-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-background flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase text-navy flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>Documents & Files ({notebook.files.length})</span>
                  </h2>
                  <span className="text-xs text-text-muted">{formatBytes(totalSize)}</span>
                </div>

                <div className="divide-y divide-border">
                  {notebook.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors"
                    >
                      <span className="text-base shrink-0">{getFileIcon(file.mimeType)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-navy truncate">{file.name}</p>
                        <p className="text-[11px] text-text-muted">
                          {formatBytes(Number(file.sizeBytes))} • @{file.uploader.username}
                        </p>
                      </div>
                      <a
                        href={`/api/files/${file.id}/download`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 sh-btn-secondary text-xs font-semibold"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes List */}
            {notebook.notes.length > 0 && (
              <div className="sh-card bg-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-background">
                  <h2 className="text-xs font-bold uppercase text-navy flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Study Notes ({notebook.notes.length})</span>
                  </h2>
                </div>

                <div className="divide-y divide-border">
                  {notebook.notes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/notebooks/${notebook.id}/notes/${note.id}`}
                      className="flex items-center gap-2.5 px-4 py-3 hover:bg-background transition-colors group"
                    >
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-navy group-hover:text-primary transition-colors truncate flex-1">
                        {note.title}
                      </span>
                      <span className="text-[11px] text-text-muted font-mono">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Discussion / Comments */}
            <div className="sh-card bg-surface p-5 sm:p-6">
              <CommentSection notebookId={notebook.id} isPublic={true} notebookOwnerId={notebook.owner.id} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}