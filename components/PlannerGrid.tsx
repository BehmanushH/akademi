'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, addDays, parseISO } from 'date-fns'
import { ENERGY_EMOJIS, DAY_TYPES } from '@/lib/utils'
import type { WeeklyPlan, Task, DayType } from '@/types'

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function PlannerGrid({
  plan: initialPlan, tasks, logs, userId, week, year, weekStart,
}: {
  plan: WeeklyPlan | null
  tasks: Task[]
  logs: { log_date: string; energy_level: number }[]
  userId: string
  week: number
  year: number
  weekStart: string
}) {
  const [plan, setPlan] = useState<Partial<WeeklyPlan>>(initialPlan ?? {})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  function getDate(dayIndex: number) {
    return addDays(parseISO(weekStart), dayIndex)
  }

  function getDateStr(dayIndex: number) {
    return format(getDate(dayIndex), 'yyyy-MM-dd')
  }

  function getTasksForDay(dayIndex: number) {
    const d = getDateStr(dayIndex)
    return tasks.filter(t => t.due_date === d)
  }

  function getEnergyForDay(dayIndex: number) {
    const d = getDateStr(dayIndex)
    return logs.find(l => l.log_date === d)?.energy_level
  }

  async function updateField(key: string, value: string) {
    const updated = { ...plan, [key]: value || null }
    setPlan(updated)

    // Debounced save
    setSaving(true)
    if (initialPlan) {
      await supabase.from('weekly_plans').update({ [key]: value || null, updated_at: new Date().toISOString() }).eq('id', initialPlan.id)
    } else {
      await supabase.from('weekly_plans').upsert({
        user_id: userId,
        week_number: week,
        year,
        ...updated,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,week_number,year' })
    }
    setSaving(false)
  }

  return (
    <div>
      {saving && <p className="text-xs text-text-muted mb-2">Saving...</p>}

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-7 gap-2">
        {DAY_KEYS.map((key, i) => {
          const dayTasks = getTasksForDay(i)
          const energy = getEnergyForDay(i)
          const date = getDate(i)
          const isToday = format(new Date(), 'yyyy-MM-dd') === getDateStr(i)

          return (
            <div key={key} className={`card flex flex-col gap-2 min-h-[200px] ${isToday ? 'border-accent/50' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${isToday ? 'text-accent' : 'text-text-muted'}`}>
                    {DAY_LABELS[i]}
                  </p>
                  <p className="text-sm text-text-primary">{format(date, 'd')}</p>
                </div>
                {energy && <span className="text-base">{ENERGY_EMOJIS[energy]}</span>}
              </div>

              <select
                value={(plan as any)[`${key}_type`] ?? ''}
                onChange={e => updateField(`${key}_type`, e.target.value)}
                className="input-base text-xs py-1"
              >
                <option value="">— Type —</option>
                {DAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <input
                value={(plan as any)[`${key}_focus`] ?? ''}
                onChange={e => updateField(`${key}_focus`, e.target.value)}
                className="input-base text-xs py-1"
                placeholder="Focus..."
              />

              {dayTasks.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayTasks.map(t => (
                    <p key={t.id} className="text-xs text-text-muted truncate">• {t.title}</p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: stacked */}
      <div className="md:hidden space-y-3">
        {DAY_KEYS.map((key, i) => {
          const dayTasks = getTasksForDay(i)
          const energy = getEnergyForDay(i)
          const date = getDate(i)
          const isToday = format(new Date(), 'yyyy-MM-dd') === getDateStr(i)

          return (
            <div key={key} className={`card ${isToday ? 'border-accent/50' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${isToday ? 'text-accent' : 'text-text-primary'}`}>
                    {DAY_LABELS[i]}, {format(date, 'MMM d')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {energy && <span>{ENERGY_EMOJIS[energy]}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={(plan as any)[`${key}_type`] ?? ''}
                  onChange={e => updateField(`${key}_type`, e.target.value)}
                  className="input-base flex-shrink-0 w-32 text-xs"
                >
                  <option value="">— Type —</option>
                  {DAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  value={(plan as any)[`${key}_focus`] ?? ''}
                  onChange={e => updateField(`${key}_focus`, e.target.value)}
                  className="input-base flex-1 text-xs"
                  placeholder="Focus..."
                />
              </div>
              {dayTasks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {dayTasks.map(t => (
                    <span key={t.id} className="text-xs bg-border/50 px-2 py-0.5 rounded text-text-muted">{t.title}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
