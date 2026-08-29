'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { FileTree } from '@/components/notebook/FileTree'
import { FileUploader } from '@/components/notebook/FileUploader'
import {
  Settings,
  Globe,
  Lock,
  Download,
  Plus,
  FolderPlus,
  FilePlus,
  Eye,
  X,
  Trash2,
  BookOpen,
  Users,
  ChevronRight,
  Share2,
} from 'lucide-react'
import { formatCount, formatDate, SUBJECT_TAGS, NOTEBOOK_COLORS } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function NotebookWorkspacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const notebookId = params.id as string

  const [notebook, setNotebook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteInput, setInviteInput] = useState('')
  const [settingsForm, setSettingsForm] = useState<any>({})
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [uploadFolderId, setUploadFolderId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (!notebookId) return
    fetch(`/api/notebooks/${notebookId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error)
          router.push('/dashboard')
          return
        }
        setNotebook(data)
        setSettingsForm({
          title: data.title,
          description: data.description || '',
          tag: data.tag || '',
          coverColor: data.coverColor,
          visibility: data.visibility,
        })
      })
      .catch(() => toast.error('Failed to load notebook'))
      .finally(() => setLoading(false))
  }, [notebookId, router])

  const isOwner = notebook?.role === 'owner'
  const canEdit = notebook?.role === 'owner' || notebook?.role === 'collaborator'

  const createFolder = async (parentId?: string) => {
    const name = newFolderName.trim() || prompt('Folder name:')
    if (!name) return
    const res = await fetch(`/api/notebooks/${notebookId}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parentFolderId: parentId }),
    })
    const data = await res.json()
    if (!res.ok) return toast.error(data.error)
    setNotebook((prev: any) => ({ ...prev, folders: [...prev.folders, data] }))
    setShowNewFolder(false)
    setNewFolderName('')
    toast.success('Folder created')
  }

  const createNote = async (folderId?: string) => {
    const title = prompt('Note title:') || 'Untitled Note'
    const res = await fetch(`/api/notebooks/${notebookId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, folderId }),
    })
    const data = await res.json()
    if (!res.ok) return toast.error(data.error)
    router.push(`/notebooks/${notebookId}/notes/${data.id}`)
  }

  const deleteFolder = async (id: string) => {
    if (!confirm('Move folder to trash?')) return
    await fetch(`/api/folders/${id}`, { method: 'DELETE' })
    setNotebook((prev: any) => ({ ...prev, folders: prev.folders.filter((f: any) => f.id !== id) }))
    toast.success('Folder moved to trash')
  }

  const deleteFile = async (id: string) => {
    if (!confirm('Move file to trash?')) return
    await fetch(`/api/files/${id}`, { method: 'DELETE' })
    setNotebook((prev: any) => ({ ...prev, files: prev.files.filter((f: any) => f.id !== id) }))
    toast.success('File moved to trash')
  }

  const deleteNote = async (id: string) => {
    if (!confirm('Delete note?')) return
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    setNotebook((prev: any) => ({ ...prev, notes: prev.notes.filter((n: any) => n.id !== id) }))
    toast.success('Note deleted')
  }

  const saveSettings = async () => {
    const res = await fetch(`/api/notebooks/${notebookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsForm),
    })
    if (!res.ok) return toast.error('Failed to save')
    const data = await res.json()
    setNotebook((prev: any) => ({ ...prev, ...data }))
    setShowSettings(false)
    toast.success('Settings saved')
  }

  const deleteNotebook = async () => {
    const confirmed = prompt(`Type "${notebook.title}" to confirm deletion:`)
    if (confirmed !== notebook.title) return toast.error('Title does not match')
    const res = await fetch(`/api/notebooks/${notebookId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmTitle: confirmed }),
    })
    if (!res.ok) return toast.error('Failed to delete')
    toast.success('Notebook deleted')
    router.push('/dashboard')
  }

  const sendInvite = async () => {
    if (!inviteInput.trim()) return
    const res = await fetch(`/api/notebooks/${notebookId}/collaborators/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: inviteInput.trim() }),
    })
    const data = await res.json()
    if (!res.ok) return toast.error(data.error)
    toast.success('Invite sent!')
    setInviteInput('')
    setShowInvite(false)
  }

  if (loading || !notebook) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex">
          <div className="hidden lg:block w-72 border-r border-border bg-surface sh-skeleton" />
          <div className="flex-1 p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="sh-skeleton h-12 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Section 11 Notebook UI Header Bar */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs min-w-0">
            <Link href="/dashboard" className="font-semibold text-text-muted hover:text-navy">
              My Notebooks
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="font-bold text-navy text-sm truncate">{notebook.title}</span>
            <span
              className={`ml-2 flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                notebook.visibility === 'public'
                  ? 'bg-emerald-50 text-success border-emerald-200'
                  : 'bg-amber-50 text-warning border-amber-200'
              }`}
            >
              {notebook.visibility === 'public' ? (
                <>
                  <Globe className="w-3 h-3" /> Public
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" /> Private
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {notebook.visibility === 'public' && (
              <Link
                href={`/n/${notebook.slug}`}
                className="px-3 py-1.5 sh-btn-secondary text-xs font-semibold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-text-muted" />
                <span>Public page</span>
              </Link>
            )}
            <a
              href={`/api/notebooks/${notebookId}/download-all`}
              className="px-3 py-1.5 sh-btn-secondary text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-text-muted" />
              <span>Download ZIP</span>
            </a>
            {isOwner && (
              <button
                onClick={() => setShowInvite(true)}
                className="px-3 py-1.5 sh-btn-secondary text-xs font-semibold flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-text-muted" />
                <span>Share</span>
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-lg border border-border hover:bg-background text-text-muted hover:text-navy transition-colors"
                title="Notebook settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Mobile backdrop */}
        {mobileSidebar && (
          <div
            className="fixed inset-0 bg-navy/40 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setMobileSidebar(false)}
          />
        )}

        {/* Workspace File Browser Sidebar */}
        <aside
          className={`w-[280px] shrink-0 border-r border-border bg-surface flex flex-col fixed left-0 top-[110px] bottom-0 z-30 transition-transform lg:static lg:translate-x-0 ${
            mobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Action Toolbar */}
          {canEdit && (
            <div className="p-3 border-b border-border flex items-center gap-2">
              <button
                onClick={() => {
                  setUploadFolderId(null)
                  setShowUpload(!showUpload)
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                  showUpload && !uploadFolderId
                    ? 'bg-blue-50 text-primary border-blue-200'
                    : 'bg-background hover:bg-slate-100 border-border text-navy'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>

              <button
                onClick={() => setShowNewFolder(true)}
                className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-background hover:bg-slate-100 border border-border text-navy flex items-center justify-center gap-1"
                title="New folder"
              >
                <FolderPlus className="w-3.5 h-3.5 text-text-muted" />
              </button>

              <button
                onClick={() => createNote()}
                className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-background hover:bg-slate-100 border border-border text-navy flex items-center justify-center gap-1"
                title="New note"
              >
                <FilePlus className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
          )}

          {/* New folder input */}
          {showNewFolder && (
            <div className="p-2.5 border-b border-border bg-background">
              <div className="flex gap-1.5">
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                  placeholder="Folder name…"
                  className="flex-1 px-2.5 py-1 text-xs sh-input"
                />
                <button onClick={() => createFolder()} className="px-2.5 py-1 sh-btn-primary text-xs font-bold">
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowNewFolder(false)
                    setNewFolderName('')
                  }}
                  className="p-1 rounded text-text-muted hover:text-navy"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Inline File Uploader */}
          {showUpload && (
            <div className="p-3 border-b border-border bg-background space-y-2">
              {notebook.folders.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Destination</label>
                  <select
                    value={uploadFolderId || ''}
                    onChange={(e) => setUploadFolderId(e.target.value || null)}
                    className="w-full px-2 py-1 sh-input text-xs"
                  >
                    <option value="">Root folder</option>
                    {notebook.folders.map((f: any) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <FileUploader
                notebookId={notebookId}
                folderId={uploadFolderId || undefined}
                onSuccess={(f: any) => {
                  setNotebook((prev: any) => ({ ...prev, files: [...prev.files, f] }))
                  setShowUpload(false)
                  setUploadFolderId(null)
                }}
              />
            </div>
          )}

          {/* Tree Explorer */}
          <div className="flex-1 overflow-y-auto p-2">
            <FileTree
              notebookId={notebookId}
              folders={notebook.folders}
              files={notebook.files}
              notes={notebook.notes}
              canEdit={canEdit}
              onCreateFolder={createFolder}
              onCreateNote={createNote}
              onDeleteFolder={deleteFolder}
              onDeleteFile={deleteFile}
              onDeleteNote={deleteNote}
              onUploadToFolder={(fid: string) => {
                setUploadFolderId(fid)
                setShowUpload(true)
              }}
            />
          </div>
        </aside>

        {/* Workspace Canvas / Focus Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Mobile switcher */}
          <div className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface">
            <button onClick={() => setMobileSidebar(true)} className="px-3 py-1 sh-btn-secondary text-xs font-semibold">
              Browse Files
            </button>
            <span className="text-xs text-text-muted">
              {notebook.files.length + notebook.notes.length} items in notebook
            </span>
          </div>

          {/* Canvas Center Info */}
          <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
            <div className="text-center max-w-md w-full sh-card p-8 bg-surface">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-white font-bold"
                style={{ background: notebook.coverColor || '#2563EB' }}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-navy">{notebook.title}</h2>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                {notebook.description || 'Select a document or note from the left sidebar to preview and edit.'}
              </p>

              {canEdit && (
                <div className="flex items-center justify-center gap-2.5 mt-5">
                  <button
                    onClick={() => setShowUpload(true)}
                    className="px-4 py-2 sh-btn-primary text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload file</span>
                  </button>
                  <button
                    onClick={() => createNote()}
                    className="px-4 py-2 sh-btn-secondary text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>New note</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border w-full max-w-lg overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-navy">Notebook Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-lg hover:bg-background text-text-muted hover:text-navy flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-navy mb-1.5">Title</label>
                  <input
                    value={settingsForm.title}
                    onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 sh-input font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy mb-1.5">Description</label>
                  <textarea
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3.5 py-2 sh-input resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-navy mb-1.5">Subject</label>
                    <select
                      value={settingsForm.tag}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tag: e.target.value })}
                      className="w-full px-3 py-2 sh-input text-navy"
                    >
                      <option value="">No Subject</option>
                      {SUBJECT_TAGS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-navy mb-1.5">Visibility</label>
                    <div className="flex rounded-lg overflow-hidden border border-border bg-background p-0.5">
                      {['private', 'public'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, visibility: v })}
                          className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-md transition-colors ${
                            settingsForm.visibility === v ? 'bg-white text-primary shadow-xs' : 'text-text-muted'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy mb-1.5">Cover Color</label>
                  <div className="flex flex-wrap gap-2">
                    {NOTEBOOK_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, coverColor: c })}
                        className={`w-7 h-7 rounded-lg border-2 transition-transform ${
                          settingsForm.coverColor === c ? 'border-navy scale-110' : 'border-transparent opacity-80'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <button onClick={saveSettings} className="w-full py-2.5 sh-btn-primary text-xs font-bold mt-2">
                  Save Changes
                </button>

                <div className="pt-3 border-t border-border">
                  <button
                    onClick={deleteNotebook}
                    className="w-full py-2 sh-btn-danger text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Notebook</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-navy">Invite Collaborator</h3>
              <button
                onClick={() => setShowInvite(false)}
                className="w-7 h-7 rounded-lg hover:bg-background text-text-muted hover:text-navy flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-muted mb-3">
              Enter their username or email. They will receive an invitation to edit this stack.
            </p>
            <input
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
              placeholder="username or email..."
              className="w-full px-3 py-2 sh-input mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowInvite(false)}
                className="flex-1 py-2 sh-btn-secondary text-xs font-semibold"
              >
                Cancel
              </button>
              <button onClick={sendInvite} className="flex-1 py-2 sh-btn-primary text-xs font-bold">
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
