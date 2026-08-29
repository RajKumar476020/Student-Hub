import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/utils'
import { uploadFile } from '@/lib/storage'

async function isNotebookEditor(notebookId: string, userId: string) {
  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    include: {
      collaborators: { where: { userId, status: 'accepted' } },
    },
  })
  if (!notebook) return false
  return notebook.ownerId === userId || notebook.collaborators.length > 0
}

// POST /api/notebooks/[id]/files — Upload file
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const canEdit = await isNotebookEditor(id, session.user.id)
  if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folderId = formData.get('folderId') as string | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: `File too large. Max ${process.env.MAX_FILE_SIZE_MB || 25}MB` }, { status: 400 })
  }

  // Validate by MIME type OR extension — browsers often send empty or generic MIME types (e.g. "" or "application/octet-stream")
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const mimeType = file.type || ''
  const isMimeAllowed = mimeType ? ALLOWED_MIME_TYPES.includes(mimeType) : false
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext)
  // Accept if either MIME or extension is allowed. For generic/empty MIME, fall back to extension check.
  if (!isMimeAllowed && !isExtAllowed) {
    return NextResponse.json({ error: 'File type not allowed. Allowed: PDF, DOCX, PPTX, XLSX, PNG, JPG, JPEG, WEBP, TXT, MD' }, { status: 400 })
  }
  // If MIME is generic but extension is allowed, accept; if MIME is specific and not allowed but extension also not allowed, already rejected above

  // Infer MIME type from extension when browser sends empty/generic type
  const EXT_MIME_MAP: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    txt: 'text/plain',
    md: 'text/markdown',
  }
  let storedMimeType = mimeType
  if ((!storedMimeType || storedMimeType === 'application/octet-stream') && EXT_MIME_MAP[ext]) {
    storedMimeType = EXT_MIME_MAP[ext]
  }
  if (!storedMimeType) storedMimeType = 'application/octet-stream'

  // Validate folderId if provided — sanitize empty / "null" strings and trim
  let targetFolderId: string | null = null
  const rawFolderId = (folderId as string | null)?.trim() || null
  if (rawFolderId && rawFolderId !== 'null' && rawFolderId !== 'undefined' && rawFolderId !== '') {
    const folder = await prisma.folder.findUnique({ where: { id: rawFolderId } })
    if (!folder || folder.notebookId !== id || folder.deletedAt) {
      return NextResponse.json({ error: 'Invalid folder — folder not found in this notebook' }, { status: 400 })
    }
    targetFolderId = rawFolderId
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const storageKey = await uploadFile(buffer, file.name, storedMimeType)

  const fileRecord = await prisma.file.create({
    data: {
      notebookId: id,
      folderId: targetFolderId,
      uploaderId: session.user.id,
      name: file.name,
      mimeType: storedMimeType,
      sizeBytes: BigInt(file.size),
      storageKey,
    },
    include: {
      uploader: { select: { id: true, username: true } },
    },
  })

  return NextResponse.json({
    ...fileRecord,
    sizeBytes: fileRecord.sizeBytes.toString(),
  }, { status: 201 })
}

// GET /api/notebooks/[id]/files — List files
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  const notebook = await prisma.notebook.findUnique({ where: { id } })
  if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = session?.user?.id === notebook.ownerId
  const isCollab = session?.user?.id
    ? (await prisma.notebookCollaborator.count({
        where: { notebookId: id, userId: session.user.id, status: 'accepted' },
      })) > 0
    : false

  if (notebook.visibility !== 'public' && !isOwner && !isCollab) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const files = await prisma.file.findMany({
    where: { notebookId: id, deletedAt: null },
    orderBy: { name: 'asc' },
    include: { uploader: { select: { id: true, username: true } } },
  })

  return NextResponse.json(files.map((f) => ({ ...f, sizeBytes: f.sizeBytes.toString() })))
}
