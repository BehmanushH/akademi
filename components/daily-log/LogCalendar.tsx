'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatISODate } from '@/lib/date-utils'
import type { Project } from '@/types'

interface LogEntry {
  log_date: string
  energy_level: number
  project_focus_id: string | null
  projects: { color: string } | null
}

export default function LogCalendar({
  logs, projects, userId,
}: { logs: LogEntry[]; projects: Project[]; userId: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selected, setSelected] = useState<LogEntry | null>(null)

  const logMap = new Map(logs.map(l => [l.log_date, l]))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Padding: Monday = 0, so adjust from Sunday=0 default
  const startPad = (getDay(monthStart) + 6) % 7

  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))} className="btn-ghost p-1.5">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-serif text-text-primary">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))} className="btn-ghost p-1.5">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map(d => (
          <div key={d} className="text-center text-xs text-text-muted py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const dateStr = formatISODate(day)
          const log = logMap.get(dateStr)
          const isToday = dateStr === formatISODate()
          const project = log?.project_focus_id
            ? projects.find(p => p.id === log.project_focus_id)
            : null

          return (
            <button
              key={dateStr}
              onClick={() => log && setSelected(selected?.log_date === dateStr ? null : log)}
              className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-all relative ${
                log ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
              } ${isToday ? 'ring-1 ring-accent' : ''} ${
                selected?.log_date === dateStr ? 'ring-2 ring-white/50' : ''
              }`}
              style={log ? { background: (project?.color ?? '#d4a853') + '40' } : undefined}
            >
              <span className={log ? 'text-text-primary font-medium' : 'text-text-muted'}>
                {format(day, 'd')}
              </span>
              {log && (
                <div
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: project?.color ?? '#d4a853' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">
              {format(parseISO(selected.log_date), 'EEEE, MMM d')}
            </span>
            <button onClick={() => setSelected(null)} className="text-xs text-text-muted hover:text-text-primary">
              Close
            </button>
          </div>
          <p className="text-xs text-text-muted">
            {projects.find(p => p.id === selected.project_focus_id)?.title ?? 'No project focus'}
          </p>
        </div>
      )}
    </div>
  )
}
