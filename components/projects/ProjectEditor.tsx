'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { PROJECT_COLORS, STATUS_LABELS } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types'

export default function ProjectEditor({ project, userId }: { project: Project; userId: string }) {
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description ?? '')
  const [status, setStatus] = useState<ProjectStatus>(project.status)
  const [progress, setProgress] = useState(project.progress_pct)
  const [color, setColor] = useState(project.color)
  const [targetDate, setTargetDate] = useState(project.target_date ?? '')
  const [notes, setNotes] = useState(project.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function save(quiet = false) {
    if (!quiet) setSaving(true)
    else setAutoSaving(true)

    await supabase.from('projects').update({
      title, description: description || null, status, progress_pct: progress,
      color, target_date: targetDate || null, notes: notes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', project.id)

    if (!quiet) { setSaving(false); router.refresh() }
    else { setAutoSaving(false) }
  }

  // Auto-save notes after 2s
  useEffect(() => {
    const t = setTimeout(() => {
      if (notes !== (project.notes ?? '')) save(true)
    }, 2000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes])

  async function deleteProject() {
    if (!confirm('Delete this project? This cannot be undone.')) return
    await supabase.from('projects').delete().eq('id', project.id)
    router.push('/projects')
  }

  const statusOptions: ProjectStatus[] = ['on_track', 'slipping', 'blocked', 'complete']

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projects" className="btn-ghost p-1.5">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
          <h1 className="page-title mb-0">{title}</h1>
        </div>
        {autoSaving && <span className="text-xs text-text-muted ml-auto">Auto-saving...</span>}
      </div>

      <div className="card space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ProjectStatus)}
              className="input-base"
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="input-base resize-none"
            rows={2}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Progress — {progress}%</label>
            <input
              type="range"
              min={0} max={100} value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full accent-amber-400 mt-1"
            />
          </div>
          <div>
            <label className="label">Target Date</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="input-base" />
          </div>
        </div>

        <div>
          <label className="label">Color</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {PROJECT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-all"
                style={{
                  background: c,
                  borderColor: color === c ? '#f0eff5' : 'transparent',
                  transform: color === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Progress Notes</label>
            {autoSaving && <span className="text-xs text-text-muted">Saving...</span>}
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input-base resize-none font-mono text-xs"
            rows={6}
            placeholder="Free-form notes about this project (supports markdown)..."
          />
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button onClick={deleteProject} className="btn-ghost text-danger hover:text-danger flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button onClick={() => save()} disabled={saving} className="btn-primary ml-auto flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
