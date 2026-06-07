'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, CheckSquare, Square, Trash2, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatShortDate } from '@/lib/date-utils'
import type { Milestone } from '@/types'

export default function MilestoneList({
  milestones, projectId, userId,
}: { milestones: Milestone[]; projectId: string; userId: string }) {
  const [items, setItems] = useState(milestones)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [adding, setAdding] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggle(m: Milestone) {
    const completed = !m.completed
    setItems(prev => prev.map(i => i.id === m.id ? { ...i, completed } : i))
    await supabase.from('milestones').update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    }).eq('id', m.id)
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return

    const { data } = await supabase.from('milestones').insert({
      project_id: projectId,
      user_id: userId,
      title: newTitle.trim(),
      due_date: newDate || null,
    }).select().single()

    if (data) {
      setItems(prev => [...prev, data as Milestone].sort((a, b) =>
        (a.due_date ?? 'z').localeCompare(b.due_date ?? 'z')
      ))
    }
    setNewTitle('')
    setNewDate('')
    setAdding(false)
  }

  async function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('milestones').delete().eq('id', id)
  }

  return (
    <div className="card">
      <div className="space-y-2">
        {items.length === 0 && !adding && (
          <p className="text-sm text-text-muted py-2">No milestones yet.</p>
        )}
        {items.map(m => (
          <div key={m.id} className="flex items-center gap-3 group py-1">
            <button onClick={() => toggle(m)} className="shrink-0 text-text-muted hover:text-accent transition-colors">
              {m.completed
                ? <CheckSquare className="w-4 h-4 text-success" />
                : <Square className="w-4 h-4" />
              }
            </button>
            <span className={`flex-1 text-sm ${m.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
              {m.title}
            </span>
            {m.due_date && (
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatShortDate(m.due_date)}
              </span>
            )}
            <button
              onClick={() => remove(m.id)}
              className="text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {adding && (
          <form onSubmit={add} className="flex gap-2 pt-2">
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="input-base flex-1"
              placeholder="Milestone title..."
              autoFocus
            />
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="input-base w-36"
            />
            <button type="submit" className="btn-primary shrink-0">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-ghost shrink-0">Cancel</button>
          </form>
        )}
      </div>

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mt-3 pt-3 border-t border-border w-full"
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </button>
      )}
    </div>
  )
}
