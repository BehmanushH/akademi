'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Circle, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  firstTask: string | null
  deepWorkHoursToday: number
  todayLogId: string | null
  userId: string
}

export default function TodayFocusCard({ firstTask, deepWorkHoursToday, todayLogId, userId }: Props) {
  const [done, setDone] = useState(false)
  const [hours, setHours] = useState(deepWorkHoursToday)
  const router = useRouter()
  const supabase = createClient()

  async function adjustHours(delta: number) {
    const newHours = Math.max(0, Math.min(10, hours + delta))
    setHours(newHours)

    if (todayLogId) {
      await supabase.from('daily_logs').update({ deep_work_hours: newHours }).eq('id', todayLogId)
    }
    router.refresh()
  }

  return (
    <div className="card border-accent/30 bg-accent/5">
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-xs text-accent uppercase tracking-wider font-medium">Today&apos;s Focus</h2>
        <Link href="/daily-log" className="text-xs text-text-muted hover:text-accent transition-colors">
          Open Log →
        </Link>
      </div>

      {firstTask ? (
        <button
          onClick={() => setDone(!done)}
          className="flex items-start gap-3 w-full text-left group"
        >
          <div className="mt-0.5 shrink-0">
            {done
              ? <CheckCircle2 className="w-5 h-5 text-success" />
              : <Circle className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
            }
          </div>
          <p className={`text-base text-text-primary transition-all ${done ? 'line-through text-text-muted' : ''}`}>
            {firstTask}
          </p>
        </button>
      ) : (
        <Link href="/daily-log" className="text-text-muted hover:text-text-primary transition-colors">
          <p className="text-sm italic">What&apos;s your first task today?</p>
        </Link>
      )}

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-accent/20">
        <span className="text-xs text-text-muted">Deep work today</span>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => adjustHours(-0.5)}
            className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-text-primary font-medium w-12 text-center">{hours}h</span>
          <button
            onClick={() => adjustHours(0.5)}
            className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
