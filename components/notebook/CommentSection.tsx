'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Reply, Trash2, MessageSquare } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

export function CommentSection({ notebookId, notebookOwnerId }: any) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/notebooks/${notebookId}/comments`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setComments(d))
      .finally(() => setLoading(false))
  }, [notebookId])

  const submit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/notebooks/${notebookId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim(), parentCommentId: replyTo }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const nc = await res.json()
      if (replyTo) setComments((p) => p.map((c) => (c.id === replyTo ? { ...c, replies: [...(c.replies || []), nc] } : c)))
      else setComments((p) => [nc, ...p])
      setText('')
      setReplyTo(null)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const del = async (id: string) => {
    await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    setComments((p) =>
      p.map((c) =>
        c.id === id
          ? { ...c, isDeleted: true, content: '[comment deleted]' }
          : { ...c, replies: c.replies?.map((r: any) => (r.id === id ? { ...r, isDeleted: true, content: '[comment deleted]' } : r)) }
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="font-bold text-sm text-navy flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Discussion & Comments</span>
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-background border border-border text-text-muted">
          {comments.length}
        </span>
      </div>

      {session?.user ? (
        <div className="flex gap-2.5 items-start">
          <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            {session.user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 space-y-2">
            {replyTo && (
              <div className="text-xs text-text-muted flex items-center gap-2">
                <span>Replying to comment</span>
                <button onClick={() => setReplyTo(null)} className="text-danger underline font-semibold">
                  Cancel
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
                placeholder="Ask a question or leave a study tip…"
                className="flex-1 px-3 py-2 sh-input text-xs"
              />
              <button
                onClick={submit}
                disabled={!text.trim() || submitting}
                className="px-3 py-2 sh-btn-primary text-xs font-semibold flex items-center gap-1 shrink-0 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-text-muted bg-background p-3 rounded-lg border border-border text-center">
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>{' '}
          to join the discussion.
        </p>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="sh-skeleton h-14 rounded-lg" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-6">No comments yet. Be the first to start the discussion!</p>
      ) : (
        <div className="space-y-3 pt-2">
          {comments.map((c: any) => (
            <Item key={c.id} c={c} uid={(session?.user as any)?.id} owner={notebookOwnerId} onDelete={del} onReply={() => setReplyTo(c.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function Item({ c, uid, owner, onDelete, onReply }: any) {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="w-7 h-7 rounded-full bg-background border border-border text-navy flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
        {c.user.displayName[0].toUpperCase()}
      </div>
      <div className="flex-1 bg-surface border border-border rounded-lg p-3 space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-navy">@{c.user.username}</span>
          <span className="text-[11px] text-text-muted">{formatRelativeTime(c.createdAt)}</span>
          {c.user.id === owner && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-primary border border-blue-200">
              AUTHOR
            </span>
          )}
        </div>
        <p className={`text-xs text-navy leading-relaxed ${c.isDeleted ? 'text-text-muted italic' : ''}`}>{c.content}</p>
        {!c.isDeleted && (
          <div className="flex gap-3 pt-1">
            <button onClick={onReply} className="text-[11px] font-semibold text-text-muted hover:text-navy flex items-center gap-1">
              <Reply className="w-3 h-3" /> Reply
            </button>
            {(uid === c.user.id || uid === owner) && (
              <button onClick={() => onDelete(c.id)} className="text-[11px] font-semibold text-text-muted hover:text-danger flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>
        )}
        {c.replies?.length > 0 && (
          <div className="mt-2.5 space-y-2 border-l border-border pl-3">
            {c.replies.map((r: any) => (
              <Item key={r.id} c={r} uid={uid} owner={owner} onDelete={onDelete} onReply={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
