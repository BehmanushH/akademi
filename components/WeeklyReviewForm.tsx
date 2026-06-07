'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Edit2 } from 'lucide-react'
import { STATUS_LABELS } from '@/lib/utils'
import type { WeeklyReview, Project, DailyLog, ProjectStatus } from '@/types'

interface Props {
  existingReview: WeeklyReview | null
  projects: (Project & { status: ProjectStatus })[]
  userId: string
  week: number
  year: number
  dateStart: string
  dateEnd: string
  totalDeepWork: number
  weekLogs: DailyLog[]
}

export default function WeeklyReviewForm({
  existingReview, projects, userId, week, year,
  dateStart, dateEnd, totalDeepWork, weekLogs,
}: Props) {
  const [editing, setEditing] = useState(!existingReview)
  const [wins, setWins] = useState(existingReview?.wins ?? '')
  const [didntHappen, setDidntHappen] = useState(existingReview?.didnt_happen ?? '')
  const [nextGoal, setNextGoal] = useState(existingReview?.next_week_goal ?? '')
  const [projectUpdates, setProjectUpdates] = useState<Record<string, string>>(
    Object.fromEntries((existingReview?.project_updates ?? []).map(p => [p.project_id, p.update]))
  )
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const updates = projects.map(p => ({
      project_id: p.id,
      project_title: p.title,
      status: p.status,
      update: projectUpdates[p.id] ?? '',
    }))

    const payload = {
      user_id: userId,
      week_number: week,
      year,
      date_start: dateStart,
      date_end: dateEnd,
      wins: wins || null,
      didnt_happen: didntHappen || null,
      next_week_goal: nextGoal || null,
      project_updates: updates,
      total_deep_work_hours: totalDeepWork,
      updated_at: new Date().toISOString(),
    }

    if (existingReview) {
      await supabase.from('weekly_reviews').update(payload).eq('id', existingReview.id)
    } else {
      await supabase.from('weekly_reviews').insert(payload)
    }

    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  if (!editing && existingReview) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg">This Week&apos;s Review</h2>
          <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-text-muted">Deep Work</p>
              <p className="text-text-primary font-medium">{totalDeepWork}h</p>
            </div>
            {existingReview.next_week_goal && (
              <div>
                <p className="text-xs text-accent">Next Week&apos;s Goal</p>
                <p className="text-text-primary">{existingReview.next_week_goal}</p>
              </div>
            )}
          </div>
          {existingReview.wins && (
            <div>
              <p className="text-xs text-success mb-0.5">Wins</p>
              <p className="text-text-primary">{existingReview.wins}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg">
          {existingReview ? 'Edit Review' : 'Write This Week\'s Review'}
        </h2>
        <div className="text-sm text-text-muted">
          {totalDeepWork}h deep work logged
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label text-success">Wins This Week</label>
          <textarea
            value={wins}
            onChange={e => setWins(e.target.value)}
            className="input-base resize-none"
            rows={3}
            placeholder="What went well? What are you proud of?"
          />
        </div>

        <div>
          <label className="label text-warning">What Didn&apos;t Happen</label>
          <textarea
            value={didntHappen}
            onChange={e => setDidntHappen(e.target.value)}
            className="input-base resize-none"
            rows={2}
            placeholder="Plans that didn't work out..."
          />
        </div>

        <div>
          <label className="label text-accent">Next Week&apos;s #1 Goal</label>
          <input
            value={nextGoal}
            onChange={e => setNextGoal(e.target.value)}
            className="input-base border-accent/30 focus:border-accent"
            placeholder="One clear goal for next week..."
          />
        </div>

        {projects.length > 0 && (
          <div>
            <label className="label">Project Updates</label>
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                    <span className="text-sm text-text-primary">{p.title}</span>
                    <span className={`badge ml-auto status-${p.status}`}>{STATUS_LABELS[p.status]}</span>
                  </div>
                  <textarea
                    value={projectUpdates[p.id] ?? ''}
                    onChange={e => setProjectUpdates(prev => ({ ...prev, [p.id]: e.target.value }))}
                    className="input-base resize-none text-xs"
                    rows={2}
                    placeholder="2-3 line update on this project..."
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {existingReview && (
            <button type="button" onClick={() => setEditing(false)} className="btn-ghost flex-1">Cancel</button>
          )}
          <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Weekly Review
          </button>
        </div>
      </form>
    </div>
  )
}
