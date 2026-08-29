import Link from 'next/link'
import { Eye, Download, FileText, Lock, Globe } from 'lucide-react'
import { formatCount, formatRelativeTime } from '@/lib/utils'

export function NotebookCard({ notebook, href, isOwner }: any) {
  const cardHref = href || (notebook.visibility === 'private' ? `/notebooks/${notebook.id}` : `/n/${notebook.slug}`)
  const isPrivate = notebook.visibility === 'private'

  return (
    <Link href={cardHref} className="group block h-full focus:outline-none">
      <article className="sh-card h-full flex flex-col justify-between overflow-hidden relative p-5 bg-surface">
        
        <div>
          {/* Header: Title & Privacy Icon */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-bold text-base leading-snug text-navy group-hover:text-primary transition-colors line-clamp-2">
              {notebook.title}
            </h3>
            <span
              className={`shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                isPrivate
                  ? 'bg-amber-50 text-warning border-amber-200'
                  : 'bg-emerald-50 text-success border-emerald-200'
              }`}
            >
              {isPrivate ? (
                <>
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  <span>Public</span>
                </>
              )}
            </span>
          </div>

          {/* Description */}
          {notebook.description && (
            <p className="text-xs leading-relaxed text-text-muted line-clamp-2 mb-3">
              {notebook.description}
            </p>
          )}

          {/* Subject Badge */}
          {notebook.tag && (
            <div className="mb-4">
              <span className="sh-badge bg-background text-text-muted border border-border">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: notebook.coverColor || '#2563EB' }}
                />
                {notebook.tag}
              </span>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="pt-3.5 border-t border-border mt-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-bold">
              {notebook.owner?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-medium text-navy truncate max-w-[130px]">
              @{notebook.owner?.username || 'user'}
            </span>
            <span className="w-1 h-1 bg-border-dark rounded-full" />
            <span className="text-[11px] text-text-muted">
              {formatRelativeTime(notebook.updatedAt)}
            </span>
          </div>

          {/* Items & Views Count */}
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatCount(notebook.viewCount || 0)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatCount(notebook.downloadCount || 0)}</span>
            </span>
            {notebook._count && (
              <span className="ml-auto flex items-center gap-1 text-[11px] font-medium text-text-muted">
                <FileText className="w-3 h-3 text-slate-400" />
                <span>{(notebook._count.files || 0) + (notebook._count.notes || 0)} items</span>
              </span>
            )}
          </div>
        </div>

      </article>
    </Link>
  )
}
