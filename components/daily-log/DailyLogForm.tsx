'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Edit2 } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import { ENERGY_EMOJIS } from '@/lib/utils'
import type { DailyLog, Project } from '@/types'

export default function DailyLogForm({
  existingLog, projects, userId, today,
}: { existingLog: DailyLog | null; projects: Project[]; userId: string; today: string }) {
  const [editing, setEditing] = useState(!existingLog)
  const [form, setForm] = useState({
    project_focus_id: existingLog?.project_focus_id ?? '',
    completed_work: existingLog?.completed_work ?? '',
    in_progress: existingLog?.in_progress ?? '',
    blocked: existingLog?.blocked ?? '',
    blocked_reason: existingLog?.blocked_reason ?? '',
    tomorrows_task: existingLog?.tomorrows_task ?? '',
    deep_work_hours: existingLog?.deep_work_hours ?? 0,
    energy_level: existingLog?.energy_level ?? 3,
    personal_note: existingLog?.personal_note ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function update(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Auto-save after 2s when editing existing log
  useEffect(() => {
    if (!editing || !existingLog) return
    const t = setTimeout(() => {
      setAutoSaving(true)
      supabase.from('daily_logs').update({ ...form, updated_at: new Date().toISOString() }).eq('id', existingLog.id)
        .then(() => setAutoSaving(false))
    }, 2000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...form,
      project_focus_id: form.project_focus_id || null,
      blocked_reason: form.blocked ? form.blocked_reason : null,
    }

    if (existingLog) {
      await supabase.from('daily_logs').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', existingLog.id)
    } else {
      await supabase.from('daily_logs').insert({ ...payload, user_id: userId, log_date: today })
    }

    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  if (!editing && existingLog) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-text-primary">
            {formatDate(today, 'EEEE, MMMM d')}
          </h2>
          <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-4">
            <span className="text-text-muted">Energy</span>
            <span className="text-lg">{ENERGY_EMOJIS[existingLog.energy_level]}</span>
            <span className="text-text-muted ml-4">Deep work</span>
            <span className="text-text-primary">{existingLog.deep_work_hours}h</span>
          </div>
          {existingLog.completed_work && (
            <div>
              <p className="text-xs text-text-muted mb-0.5">Completed</p>
              <p className="text-text-primary">{existingLog.completed_work}</p>
            </div>
          )}
          {existingLog.tomorrows_task && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-accent mb-0.5">Tomorrow&apos;s first task</p>
              <p className="text-text-primary">{existingLog.tomorrows_task}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg text-text-primary">
          {formatDate(today, 'EEEE, MMMM d')}
        </h2>
        {autoSaving && <span className="text-xs text-text-muted">Auto-saving...</span>}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Project Focus</label>
          <select
            value={form.project_focus_id}
            onChange={e => update('project_focus_id', e.target.value)}
            className="input-base"
          >
            <option value="">— Select project —</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        <div>
          <label className="label">What did I actually complete?</label>
          <textarea
            value={form.completed_work}
            onChange={e => update('completed_work', e.target.value)}
            className="input-base resize-none"
            rows={3}
            placeholder="Be specific — what outputs exist now that didn't before?"
          />
        </div>

        <div>
          <label className="label">What&apos;s still open?</label>
          <textarea
            value={form.in_progress}
            onChange={e => update('in_progress', e.target.value)}
            className="input-base resize-none"
            rows={2}
          />
        </div>

        <div>
          <label className="label">What&apos;s stuck?</label>
          <textarea
            value={form.blocked}
            onChange={e => update('blocked', e.target.value)}
            className="input-base resize-none"
            rows={2}
          />
        </div>

        {form.blocked && (
          <div>
            <label className="label">Why is it stuck?</label>
            <input
              value={form.blocked_reason}
              onChange={e => update('blocked_reason', e.target.value)}
              className="input-base"
            />
          </div>
        )}

        <div>
          <label className="label text-accent">What&apos;s my first task tomorrow?</label>
          <input
            value={form.tomorrows_task}
            onChange={e => update('tomorrows_task', e.target.value)}
            className="input-base border-accent/30 focus:border-accent"
            placeholder="One clear, specific task..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Deep Work Hours</label>
            <input
              type="number"
              min={0} max={10} step={0.5}
              value={form.deep_work_hours}
              onChange={e => update('deep_work_hours', Number(e.target.value))}
              className="input-base"
            />
          </div>
          <div>
            <label className="label">Energy Level</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update('energy_level', n)}
                  className={`flex-1 text-xl py-1 rounded-lg transition-all ${
                    form.energy_level === n ? 'bg-accent/20 scale-110' : 'hover:bg-surface'
                  }`}
                >
                  {ENERGY_EMOJIS[n]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="label">Personal Note (private)</label>
          <textarea
            value={form.personal_note}
            onChange={e => update('personal_note', e.target.value)}
            className="input-base resize-none"
            rows={2}
            placeholder="Anything personal — not shown elsewhere"
          />
        </div>

        <div className="flex gap-2 pt-2">
          {existingLog && (
            <button type="button" onClick={() => setEditing(false)} className="btn-ghost flex-1">
              Cancel
            </button>
          )}
          <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Today\'s Log'}
          </button>
        </div>
      </form>
    </div>
  )
}
