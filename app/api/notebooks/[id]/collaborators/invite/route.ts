import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// POST /api/notebooks/[id]/collaborators/invite
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notebook = await prisma.notebook.findUnique({ where: { id } })
  if (!notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (notebook.ownerId !== session.user.id) return NextResponse.json({ error: 'Only the owner can invite collaborators' }, { status: 403 })

  const { usernameOrEmail } = await req.json()
  if (!usernameOrEmail?.trim()) return NextResponse.json({ error: 'Username or email required' }, { status: 400 })

  const invitee = await prisma.user.findFirst({
    where: {
      OR: [
        { email: usernameOrEmail.trim() },
        { username: usernameOrEmail.trim() },
      ],
    },
  })

  if (!invitee) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (invitee.id === session.user.id) return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 })

  const existing = await prisma.notebookCollaborator.findUnique({
    where: { notebookId_userId: { notebookId: id, userId: invitee.id } },
  })

  if (existing) {
    if (existing.status === 'accepted') return NextResponse.json({ error: 'User is already a collaborator' }, { status: 409 })
    if (existing.status === 'pending') return NextResponse.json({ error: 'Invite already sent' }, { status: 409 })
  }

  const collab = await prisma.notebookCollaborator.upsert({
    where: { notebookId_userId: { notebookId: id, userId: invitee.id } },
    create: {
      notebookId: id,
      userId: invitee.id,
      invitedBy: session.user.id,
      status: 'pending',
    },
    update: { status: 'pending', invitedAt: new Date(), respondedAt: null },
  })

  // Create notification
  await prisma.notification.create({
    data: {
      userId: invitee.id,
      type: 'invite',
      payload: {
        notebookId: id,
        notebookTitle: notebook.title,
        invitedBy: (session.user as any).username || session.user.id,
        collaboratorId: collab.id,
      },
    },
  })

  return NextResponse.json({ message: 'Invite sent', collaborator: collab }, { status: 201 })
}
