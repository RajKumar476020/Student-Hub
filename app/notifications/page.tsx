'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Bell, Users, MessageSquare, Check, CheckCheck, Inbox } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

const TYPE_ICONS: Record<string, any> = {
  invite: Users,
  invite_accepted: Users,
  new_comment: MessageSquare,
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch('/api/notifications')
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) setNotifications(d)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [session])

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead)
    await Promise.all(unread.map((n) => fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' })))
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    toast.success('All marked as read')
  }

  const respondToInvite = async (collaboratorId: string, action: 'accept' | 'decline', notifId: string) => {
    const res = await fetch(`/api/collaborators/${collaboratorId}/respond`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (!res.ok) return toast.error('Failed to respond')
    toast.success(action === 'accept' ? 'Invite accepted' : 'Invite declined')
    await markRead(notifId)
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[720px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy flex items-center gap-2.5">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-primary border border-blue-200">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-xs text-text-muted mt-0.5">Stay updated on notebook collaborations and replies.</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3 py-1.5 sh-btn-secondary text-xs font-semibold flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="sh-skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 sh-card border-dashed p-8">
            <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mx-auto mb-3 text-text-muted">
              <Inbox className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-navy">All caught up</h3>
            <p className="text-xs text-text-muted mt-0.5">
              You will receive notifications here when classmates invite you or leave comments.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((notif) => {
              const Icon = TYPE_ICONS[notif.type] || Bell
              const payload = notif.payload as any
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border transition-colors ${
                    notif.isRead
                      ? 'bg-surface border-border'
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      notif.isRead
                        ? 'bg-background text-text-muted'
                        : 'bg-primary text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed text-navy">
                      {notif.type === 'invite' && (
                        <>
                          <span className="font-semibold text-primary">@{payload.invitedBy}</span> invited you to collaborate on{' '}
                          <span className="font-semibold text-navy">“{payload.notebookTitle}”</span>
                        </>
                      )}
                      {notif.type === 'invite_accepted' && (
                        <>
                          <span className="font-semibold text-success">@{payload.acceptedBy}</span> accepted your collaboration invite to{' '}
                          <span className="font-semibold text-navy">“{payload.notebookTitle}”</span>
                        </>
                      )}
                      {notif.type === 'new_comment' && (
                        <>
                          <span className="font-semibold text-primary">@{payload.commentBy}</span> commented on{' '}
                          <span className="font-semibold text-navy">“{payload.notebookTitle}”</span>
                        </>
                      )}
                      {!['invite', 'invite_accepted', 'new_comment'].includes(notif.type) && (
                        <span className="font-semibold">{notif.type}</span>
                      )}
                    </p>

                    <p className="text-[11px] text-text-muted mt-1">
                      {formatRelativeTime(notif.createdAt)}
                    </p>

                    {notif.type === 'invite' && !notif.isRead && payload.collaboratorId && (
                      <div className="flex gap-2 mt-2.5">
                        <button
                          onClick={() => respondToInvite(payload.collaboratorId, 'accept', notif.id)}
                          className="px-3 py-1 sh-btn-primary text-xs font-semibold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respondToInvite(payload.collaboratorId, 'decline', notif.id)}
                          className="px-3 py-1 sh-btn-secondary text-xs font-semibold"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {notif.type === 'new_comment' && payload.notebookId && (
                      <Link
                        href={`/notebooks/${payload.notebookId}`}
                        onClick={() => markRead(notif.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-1.5"
                      >
                        View notebook →
                      </Link>
                    )}
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="w-7 h-7 rounded-lg bg-surface hover:bg-background text-text-muted hover:text-navy border border-border flex items-center justify-center shrink-0 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}