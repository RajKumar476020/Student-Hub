import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { MarkdownEditor } from '@/components/notebook/MarkdownEditor'
import { Navbar } from '@/components/layout/Navbar'
import { ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'

interface Props { params: Promise<{ id: string; noteId: string }> }

export default async function NoteEditorPage({ params }: Props) {
  const { id, noteId } = await params
  const session = await auth()
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: {
      notebook: { include: { collaborators: session?.user?.id ? { where: { userId: session.user.id, status: 'accepted' } } : { where: { id: 'none' } } } },
      creator: { select: { id: true, username: true } },
    },
  })
  if (!note || note.notebookId !== id) notFound()
  const isOwner = session?.user?.id === note.notebook.ownerId
  const isCollab = note.notebook.collaborators.length > 0
  const isPublic = note.notebook.visibility === 'public'
  if (!isPublic && !isOwner && !isCollab) notFound()
  const canEdit = isOwner || isCollab

  return (
    <>
      <Navbar />
      <div className="h-screen pt-16 flex flex-col bg-background">
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-3 border-b border-border bg-white text-xs">
          <Link href="/dashboard" className="font-medium text-muted hover:text-ink transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3 text-muted" />
          <Link href={`/notebooks/${id}`} className="font-medium text-muted hover:text-ink transition-colors max-w-[200px] truncate">{note.notebook.title}</Link>
          <ChevronRight className="w-3 h-3 text-muted" />
          <span className="inline-flex items-center gap-1.5 font-medium text-ink truncate">
            <span className="w-6 h-6 rounded-lg bg-primary-soft border border-primary-muted flex items-center justify-center"><FileText className="w-3 h-3 text-primary" /></span>
            {note.title}
          </span>
        </div>
        <div className="flex-1 overflow-hidden bg-white">
          <MarkdownEditor noteId={note.id} notebookId={id} initialTitle={note.title} initialContent={note.contentMd} readOnly={!canEdit} />
        </div>
      </div>
    </>
  )
}
