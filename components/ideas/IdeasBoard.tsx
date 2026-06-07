'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pin, PinOff, Trash2, Plus, X } from 'lucide-react'
import { formatShortDate } from '@/lib/date-utils'
import type { Idea, Project } from '@/types'

export default function IdeasBoard({
  ideas: initialIdeas, projects, userId,
}: { ideas: Idea[]; projects: Project[]; userId: string }) {
  const [ideas, setIdeas] = useState(initialIdeas)
  const [filterProject, setFilterProject] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newProject, setNewProject] = useState('')
  const supabase = createClient()

  const filtered = ideas.filter(i => !filterProject || i.project_id === filterProject)
  const pinned = filtered.filter(i => i.pinned)
  const unpinned = filtered.filter(i => !i.pinned)

  async function togglePin(idea: Idea) {
    const pinned = !idea.pinned
    setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, pinned } : i).sort((a, b) =>
      (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
    ))
    await supabase.from('ideas').update({ pinned }).eq('id', idea.id)
  }

  async function deleteIdea(id: string) {
    setIdeas(prev => prev.filter(i => i.id !== id))
    await supabase.from('ideas').delete().eq('id', id)
  }

  async function capture(e: React.FormEvent) {
    e.preventDefault()
    if (!newContent.trim()) return

    const { data } = await supabase.from('ideas').insert({
      user_id: userId,
      content: newContent.trim(),
      project_id: newProject || null,
    }).select('*, project:projects(id,title,color)').single()

    if (data) setIdeas(prev => [data as Idea, ...prev])
    setNewContent('')
    setNewProject('')
    setShowNew(false)
  }

  function IdeaCard({ idea }: { idea: Idea }) {
    const project = (idea as any).project as Project | null

    return (
      <div className="card flex flex-col gap-2 group relative">
        <p className="text-sm text-text-primary leading-relaxed flex-1">{idea.content}</p>
        <div className="flex items-center gap-2 mt-1">
          {project && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: project.color + '30', color: project.color }}
            >
              {project.title}
            </span>
          )}
          <span className="text-xs text-text-muted ml-auto">{formatShortDate(idea.created_at)}</span>
        </div>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => togglePin(idea)}
            className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-accent transition-colors bg-background"
          >
            {idea.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => deleteIdea(idea.id)}
            className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-danger transition-colors bg-background"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="input-base max-w-[180px]"
        >
          <option value="">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <span className="text-xs text-text-muted">{filtered.length} ideas</span>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5 ml-auto">
          <Plus className="w-4 h-4" />
          Capture
        </button>
      </div>

      {/* New idea modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm px-4 pb-4 sm:pb-0">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-text-primary">Capture Idea</h3>
              <button onClick={() => setShowNew(false)}><X className="w-4 h-4 text-text-muted" /></button>
            </div>
            <form onSubmit={capture} className="space-y-3">
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                className="input-base resize-none"
                rows={4}
                placeholder="What's the idea?"
                autoFocus
              />
              <select
                value={newProject}
                onChange={e => setNewProject(e.target.value)}
                className="input-base"
              >
                <option value="">No project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowNew(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="mb-6">
          <h2 className="section-title mb-3">📌 Pinned</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map(i => <IdeaCard key={i.id} idea={i} />)}
          </div>
        </div>
      )}

      {/* All */}
      {unpinned.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {unpinned.map(i => <IdeaCard key={i.id} idea={i} />)}
        </div>
      ) : pinned.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-text-muted text-sm">No ideas yet. Capture your first thought!</p>
        </div>
      )}
    </div>
  )
}
