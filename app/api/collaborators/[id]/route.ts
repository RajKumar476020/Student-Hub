import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/collaborators/[id]/respond — accept/decline
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const collab = await prisma.notebookCollaborator.findUnique({
    where: { id },
    include: { notebook: true },
  })

  if (!collab) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (collab.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (collab.status !== 'pending') return NextResponse.json({ error: 'Invite already responded' }, { status: 400 })

  const { action } = await req.json()
  if (!['accept', 'decline'].includes(action)) return NextResponse.json({ error: 'Action must be accept or decline' }, { status: 400 })

  const updated = await prisma.notebookCollaborator.update({
    where: { id },
    data: {
      status: action === 'accept' ? 'accepted' : 'declined',
      respondedAt: new Date(),
    },
  })

  if (action === 'accept') {
    await prisma.notification.create({
      data: {
        userId: collab.notebook.ownerId,
        type: 'invite_accepted',
        payload: {
          notebookId: collab.notebookId,
          notebookTitle: collab.notebook.title,
          acceptedBy: (session.user as any).username || session.user.id,
        },
      },
    })
  }

  return NextResponse.json(updated)
}

// DELETE /api/collaborators/[id] — remove or leave
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const collab = await prisma.notebookCollaborator.findUnique({
    where: { id },
    include: { notebook: true },
  })

  if (!collab) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = session.user.id === collab.notebook.ownerId
  const isSelf = session.user.id === collab.userId

  if (!isOwner && !isSelf) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.notebookCollaborator.delete({ where: { id } })
  return NextResponse.json({ message: isOwner ? 'Collaborator removed' : 'Left notebook' })
}
