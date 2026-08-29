'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Save, Eye, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
const MDEditor = dynamic(()=>import('@uiw/react-md-editor'),{ssr:false})
const MDPreview = dynamic(()=>import('@uiw/react-markdown-preview'),{ssr:false})
export function MarkdownEditor({ noteId, initialTitle, initialContent, readOnly }: any){
  const [title,setTitle]=useState(initialTitle)
  const [content,setContent]=useState(initialContent)
  const [mode,setMode]=useState('edit')
  const [saving,setSaving]=useState(false)
  const [dirty,setDirty]=useState(false)
  const save=async()=>{
    setSaving(true)
    try{ const r=await fetch(`/api/notes/${noteId}`,{method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title, contentMd:content})}); if(!r.ok) throw new Error(); toast.success('Saved'); setDirty(false)}catch{ toast.error('Failed')} finally{ setSaving(false)}
  }
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border glass">
        <input value={title} onChange={e=>{setTitle(e.target.value); setDirty(true)}} readOnly={readOnly} className="flex-1 bg-transparent font-semibold text-ink focus:outline-none" placeholder="Untitled" />
        <div className="flex gap-2">
          {!readOnly && <>
            <button onClick={()=>setMode(mode==='edit'?'preview':'edit')} className="px-3 py-1.5 text-xs font-semibold glass rounded-full flex items-center gap-1"><Eye className="w-3 h-3"/>{mode==='edit'?'Preview':'Edit'}</button>
            <button onClick={save} disabled={saving||!dirty} className="px-4 py-1.5 text-xs font-semibold bg-blue text-white rounded-full disabled:opacity-40 flex items-center gap-1"><Save className="w-3 h-3"/>{saving?'Saving…':'Save'}</button>
          </>}
        </div>
      </div>
      <div className="flex-1 overflow-hidden" data-color-mode="light">
        {readOnly||mode==='preview' ? <div className="h-full overflow-y-auto p-6 prose max-w-none"><MDPreview source={content} style={{background:'transparent'}}/></div> : <MDEditor value={content} onChange={v=>{setContent(v||''); setDirty(true)}} height="100%" data-color-mode="light" />}
      </div>
    </div>
  )
}
