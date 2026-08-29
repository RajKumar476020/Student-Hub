'use client'
import { useState, useRef } from 'react'
import { Upload, X, File as FileIcon } from 'lucide-react'
import { ALLOWED_EXTENSIONS, formatBytes } from '@/lib/utils'
import toast from 'react-hot-toast'

export function FileUploader({ notebookId, folderId, onSuccess }: any) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<File | null>(null)
  const ref = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(`.${ext} files are not supported. Supported: PDF, DOCX, PNG, JPG, TXT, MD`)
      return
    }
    if (f.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25MB limit')
      return
    }
    setSelected(f)
  }

  const upload = async () => {
    if (!selected) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', selected)
    if (folderId) fd.append('folderId', folderId)

    try {
      const res = await fetch(`/api/notebooks/${notebookId}/files`, {
        method: 'POST',
        body: fd,
      })

      const text = await res.text()
      let data: any = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        throw new Error('Server returned an invalid response. Please try again.')
      }

      if (!res.ok) {
        throw new Error(data.error || `Upload failed with status ${res.status}`)
      }

      toast.success('Document uploaded successfully!')
      onSuccess?.(data)
      setSelected(null)
    } catch (e: any) {
      console.error('Upload error:', e)
      toast.error(e.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {!selected ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const f = e.dataTransfer.files[0]
            if (f) handleFile(f)
          }}
          onClick={() => ref.current?.click()}
          className={`p-6 text-center cursor-pointer rounded-xl border-2 border-dashed transition-colors ${
            dragOver ? 'border-primary bg-blue-50' : 'border-border hover:border-primary/40 bg-background'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${
              dragOver ? 'bg-primary text-white' : 'bg-surface text-primary border border-border'
            }`}
          >
            <Upload className="w-5 h-5" />
          </div>
          <p className="font-bold text-xs text-navy">Click or drag file to upload</p>
          <p className="text-[11px] text-text-muted mt-0.5">PDF, DOCX, PNG, JPG, TXT, MD • Max 25MB</p>
          <input
            ref={ref}
            type="file"
            className="hidden"
            accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',')}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="sh-card p-3 bg-surface space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary border border-blue-200 flex items-center justify-center shrink-0">
              <FileIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-navy truncate">{selected.name}</p>
              <p className="text-[11px] text-text-muted">{formatBytes(selected.size)}</p>
            </div>
            {!uploading && (
              <button
                onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-lg hover:bg-background text-text-muted hover:text-navy flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={upload}
            disabled={uploading}
            className="w-full py-2 sh-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
