'use client'
import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Plus, Trash2, FilePlus, Upload } from 'lucide-react'
import { cn, getFileIcon } from '@/lib/utils'
import Link from 'next/link'

export function FileTree({
  notebookId,
  folders,
  files,
  notes,
  canEdit,
  selectedId,
  onCreateFolder,
  onCreateNote,
  onDeleteFolder,
  onDeleteFile,
  onDeleteNote,
  onUploadToFolder,
}: any) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(folders.map((f: any) => f.id)))

  useEffect(() => {
    setExpanded((prev) => {
      const n = new Set(prev)
      let c = false
      for (const f of folders) if (!n.has(f.id)) { n.add(f.id); c = true }
      for (const f of files) if (f.folderId && !n.has(f.folderId)) { n.add(f.folderId); c = true }
      for (const n2 of notes) if (n2.folderId && !n.has(n2.folderId)) { n.add(n2.folderId); c = true }
      return c ? n : prev
    })
  }, [folders, files, notes])

  const toggle = (id: string) =>
    setExpanded((p) => {
      const n = new Set(p)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  const roots = folders.filter((f: any) => !f.parentFolderId)
  const rootFiles = files.filter((f: any) => !f.folderId)
  const rootNotes = notes.filter((n: any) => !n.folderId)
  const empty = roots.length === 0 && rootFiles.length === 0 && rootNotes.length === 0

  return (
    <div className="space-y-0.5 text-xs">
      {empty && (
        <div className="text-center py-6 text-text-muted">
          <p className="font-semibold text-navy">No files yet</p>
          <p className="text-[11px] mt-0.5">Use actions above to add files</p>
        </div>
      )}

      {roots.map((f: any) => (
        <FolderNode
          key={f.id}
          folder={f}
          all={folders}
          files={files}
          notes={notes}
          expanded={expanded}
          toggle={toggle}
          canEdit={canEdit}
          notebookId={notebookId}
          onCreateFolder={onCreateFolder}
          onCreateNote={onCreateNote}
          onDeleteFolder={onDeleteFolder}
          onDeleteFile={onDeleteFile}
          onDeleteNote={onDeleteNote}
          onUpload={onUploadToFolder}
          depth={0}
        />
      ))}

      {rootFiles.map((f: any) => (
        <FileRow
          key={f.id}
          file={f}
          notebookId={notebookId}
          canEdit={canEdit}
          onDelete={() => onDeleteFile?.(f.id)}
          depth={0}
        />
      ))}

      {rootNotes.map((n: any) => (
        <NoteRow
          key={n.id}
          note={n}
          notebookId={notebookId}
          canEdit={canEdit}
          onDelete={() => onDeleteNote?.(n.id)}
          depth={0}
        />
      ))}
    </div>
  )
}

function FolderNode({
  folder,
  all,
  files,
  notes,
  expanded,
  toggle,
  canEdit,
  notebookId,
  onCreateFolder,
  onCreateNote,
  onDeleteFolder,
  onDeleteFile,
  onDeleteNote,
  onUpload,
  depth,
}: any) {
  const open = expanded.has(folder.id)
  const childF = all.filter((f: any) => f.parentFolderId === folder.id)
  const childFiles = files.filter((f: any) => f.folderId === folder.id)
  const childNotes = notes.filter((n: any) => n.folderId === folder.id)
  const [h, setH] = useState(false)

  return (
    <div>
      <div
        onClick={() => toggle(folder.id)}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-background cursor-pointer group select-none"
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        <span className="text-text-muted">
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </span>
        <span className="text-primary shrink-0">
          {open ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
        </span>
        <span className="font-semibold text-navy truncate flex-1">{folder.name}</span>
        
        {canEdit && h && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUpload?.(folder.id)
              }}
              className="p-1 hover:bg-surface rounded text-text-muted hover:text-navy"
              title="Upload file here"
            >
              <Upload className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteFolder?.(folder.id)
              }}
              className="p-1 hover:bg-surface rounded text-text-muted hover:text-danger"
              title="Delete folder"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="space-y-0.5">
          {childF.map((c: any) => (
            <FolderNode
              key={c.id}
              folder={c}
              all={all}
              files={files}
              notes={notes}
              expanded={expanded}
              toggle={toggle}
              canEdit={canEdit}
              notebookId={notebookId}
              onCreateFolder={onCreateFolder}
              onCreateNote={onCreateNote}
              onDeleteFolder={onDeleteFolder}
              onDeleteFile={onDeleteFile}
              onDeleteNote={onDeleteNote}
              onUpload={onUpload}
              depth={depth + 1}
            />
          ))}
          {childFiles.map((f: any) => (
            <FileRow
              key={f.id}
              file={f}
              notebookId={notebookId}
              canEdit={canEdit}
              onDelete={() => onDeleteFile?.(f.id)}
              depth={depth + 1}
            />
          ))}
          {childNotes.map((n: any) => (
            <NoteRow
              key={n.id}
              note={n}
              notebookId={notebookId}
              canEdit={canEdit}
              onDelete={() => onDeleteNote?.(n.id)}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FileRow({ file, notebookId, canEdit, onDelete, depth }: any) {
  const [h, setH] = useState(false)
  return (
    <Link
      href={`/notebooks/${notebookId}/files/${file.id}`}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background text-navy group transition-colors"
      style={{ paddingLeft: `${20 + depth * 12}px` }}
    >
      <span className="text-sm shrink-0">{getFileIcon(file.mimeType)}</span>
      <span className="truncate flex-1 font-medium text-slate-700 group-hover:text-navy">{file.name}</span>
      {canEdit && h && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete?.()
          }}
          className="p-1 hover:bg-surface rounded text-text-muted hover:text-danger"
          title="Delete file"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </Link>
  )
}

function NoteRow({ note, notebookId, canEdit, onDelete, depth }: any) {
  const [h, setH] = useState(false)
  return (
    <Link
      href={`/notebooks/${notebookId}/notes/${note.id}`}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background text-navy group transition-colors"
      style={{ paddingLeft: `${20 + depth * 12}px` }}
    >
      <span className="text-primary shrink-0">
        <FileText className="w-3.5 h-3.5" />
      </span>
      <span className="truncate flex-1 font-medium text-slate-700 group-hover:text-navy">{note.title}</span>
      {canEdit && h && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete?.()
          }}
          className="p-1 hover:bg-surface rounded text-text-muted hover:text-danger"
          title="Delete note"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </Link>
  )
}
