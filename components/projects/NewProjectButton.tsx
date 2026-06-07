'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PROJECT_COLORS } from '@/lib/utils'

export default function NewProjectButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [targetDate, setTargetDate] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)

    await supabase.from('projects').insert({
      user_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      color,
      target_date: targetDate || null,
    })

    setTitle('')
    setDescription('')
    setColor(PROJECT_COLORS[0])
    setTargetDate('')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-1.5">
        <Plus className="w-4 h-4" />
        New Project
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4" onClick={() => setOpen(false)}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-text-primary">New Project</h2>
          <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={create} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-base"
              placeholder="e.g. Dissertation Chapter 3"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-base resize-none"
              rows={2}
              placeholder="Brief description..."
            />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    background: c,
                    borderColor: color === c ? '#f0eff5' : 'transparent',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="label">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="input-base"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading || !title.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
