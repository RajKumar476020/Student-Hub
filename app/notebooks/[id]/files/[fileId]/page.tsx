import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { ChevronRight, Download, Eye } from 'lucide-react'
import { getFileIcon, formatBytes, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Props { params: Promise<{ id: string; fileId: string }> }

export default async function FileViewPage({ params }: Props) {
  const { id, fileId } = await params
  const session = await auth()
  const file = await prisma.file.findUnique({
    where: { id: fileId, deletedAt: null },
    include: {
      notebook: { include: { owner: { select: { id: true, username: true } }, collaborators: session?.user?.id ? { where: { userId: session.user.id, status: 'accepted' } } : { where: { id: 'none' } } } },
      uploader: { select: { id: true, username: true, displayName: true } },
    },
  })
  if (!file || file.notebookId !== id) notFound()
  const isOwner = session?.user?.id === file.notebook.ownerId
  const isCollab = file.notebook.collaborators.length > 0
  const isPublic = file.notebook.visibility === 'public'
  if (!isPublic && !isOwner && !isCollab) notFound()
  const isViewable = file.mimeType === 'application/pdf' || file.mimeType.startsWith('image/')

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-16 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border bg-white">
          <div className="flex items-center gap-1.5 text-xs min-w-0">
            <Link href="/dashboard" className="font-medium text-muted hover:text-ink">Dashboard</Link>
            <ChevronRight className="w-3 h-3 text-muted shrink-0" />
            <Link href={`/notebooks/${id}`} className="font-medium text-muted hover:text-ink truncate max-w-[180px]">{file.notebook.title}</Link>
            <ChevronRight className="w-3 h-3 text-muted shrink-0" />
            <span className="inline-flex items-center gap-1.5 font-medium text-ink truncate"><span className="w-6 h-6 rounded-lg bg-white border border-border flex items-center justify-center text-sm">{getFileIcon(file.mimeType)}</span>{file.name}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-medium text-muted bg-surface-low border border-border px-2.5 py-1 rounded-full">{formatBytes(Number(file.sizeBytes))}</span>
            <a href={`/api/files/${fileId}/download`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink hover:bg-ink-light text-white text-xs font-semibold rounded-full transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-surface-low">
          {isViewable ? (
            file.mimeType.startsWith('image/') ? (
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-soft">
                <img src={`/api/files/serve/${file.storageKey}`} alt={file.name} className="max-w-full max-h-[70vh] rounded-xl" />
              </div>
            ) : (
              <div className="w-full max-w-5xl bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
                <div className="px-4 py-2 border-b border-border bg-surface-low flex items-center gap-2 text-xs text-muted">
                  <Eye className="w-3 h-3" /> Preview • PDF
                </div>
                <iframe src={`/api/files/serve/${file.storageKey}`} className="w-full h-[70vh] bg-white" title={file.name} />
              </div>
            )
          ) : (
            <div className="text-center bg-white border border-border rounded-[24px] p-8 sm:p-10 shadow-soft max-w-md w-full">
              <div className="w-16 h-16 rounded-2xl bg-primary-soft border border-primary-muted flex items-center justify-center mx-auto mb-4 text-3xl">{getFileIcon(file.mimeType)}</div>
              <h2 className="font-display font-semibold text-ink text-lg">{file.name}</h2>
              <p className="text-sm text-muted mt-1">{formatBytes(Number(file.sizeBytes))} • {file.mimeType}</p>
              <p className="text-sm text-muted mt-4">Preview not available for this file type — download to view.</p>
              <a href={`/api/files/${fileId}/download`} className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-ink text-white font-semibold rounded-full hover:bg-ink-light transition-colors shadow-sm">
                <Download className="w-4 h-4" /> Download file
              </a>
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 sm:px-6 py-3 flex flex-wrap items-center gap-4 text-xs text-muted bg-white">
          <span>Uploaded by <span className="font-medium text-ink">@{file.uploader.username}</span></span>
          <span className="hidden sm:inline w-1 h-1 bg-border-strong rounded-full" />
          <span>{formatDate(file.createdAt)}</span>
          <span className="hidden sm:inline w-1 h-1 bg-border-strong rounded-full" />
          <span>{file.downloadCount} downloads</span>
        </div>
      </div>
    </>
  )
}
