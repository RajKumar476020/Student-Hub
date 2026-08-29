'use client'
import { useState, useRef } from 'react'
import { Upload, X, File } from 'lucide-react'
import { ALLOWED_EXTENSIONS, formatBytes } from '@/lib/utils'
import toast from 'react-hot-toast'

export function FileUploader({ notebookId, folderId, onSuccess }: any){
  const [dragOver,setDragOver]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [progress,setProgress]=useState(0)
  const [selected,setSelected]=useState<File|null>(null)
  const ref=useRef<HTMLInputElement>(null)
  const handleFile=(f:File)=>{
    const ext=f.name.split('.').pop()?.toLowerCase()||''
    if(!ALLOWED_EXTENSIONS.includes(ext)){ toast.error(`.${ext} not allowed`); return }
    if(f.size>25*1024*1024){ toast.error('Max 25MB'); return }
    setSelected(f)
  }
  const upload=async()=>{
    if(!selected) return
    setUploading(true); setProgress(0)
    const fd=new FormData(); fd.append('file',selected)
    if(folderId) fd.append('folderId',folderId)
    try{
      const iv=setInterval(()=>setProgress(p=>Math.min(p+12,90)),180)
      const res=await fetch(`/api/notebooks/${notebookId}/files`,{method:'POST',body:fd})
      clearInterval(iv); setProgress(100)
      if(!res.ok){ const e=await res.json(); throw new Error(e.error) }
      const file=await res.json(); toast.success('Added to library'); onSuccess?.(file); setSelected(null); setProgress(0)
    }catch(e:any){ toast.error(e.message)} finally{ setUploading(false)}
  }
  return (
    <div className="space-y-3">
      {!selected ? (
        <div onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false); const f=e.dataTransfer.files[0]; if(f) handleFile(f)}} onClick={()=>ref.current?.click()} className={`p-8 text-center cursor-pointer rounded-2xl border-2 border-dashed ${dragOver?'border-blue bg-blue-soft':'border-border glass hover:border-blue/30'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${dragOver?'bg-blue text-white':'glass text-blue'}`}>
            <Upload className="w-6 h-6" />
          </div>
          <p className="font-semibold">Drop file here</p>
          <p className="text-xs text-muted mt-1">PDF, DOCX, PNG, JPG, TXT, MD • 25MB</p>
          <input ref={ref} type="file" className="hidden" accept={ALLOWED_EXTENSIONS.map(e=>`.${e}`).join(',')} onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue text-white flex items-center justify-center"><File className="w-5 h-5"/></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{selected.name}</p>
              <p className="text-xs text-muted">{formatBytes(selected.size)}</p>
            </div>
            {!uploading && <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-full glass flex items-center justify-center"><X className="w-4 h-4"/></button>}
          </div>
          {uploading ? <div><div className="flex justify-between text-xs mb-1"><span>Uploading…</span><span>{progress}%</span></div><div className="h-2 bg-black/5 rounded-full overflow-hidden"><div className="h-2 bg-blue rounded-full transition-all" style={{width:`${progress}%`}}/></div></div> : <button onClick={upload} className="w-full py-3 bg-blue text-white font-semibold rounded-full hover:bg-blue-hover">Add to Library</button>}
        </div>
      )}
    </div>
  )
}
