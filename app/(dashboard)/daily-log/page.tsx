import { createClient } from '@/lib/supabase/server'
import { formatISODate } from '@/lib/date-utils'
import DailyLogForm from '@/components/daily-log/DailyLogForm'
import LogCalendar from '@/components/daily-log/LogCalendar'
import type { DailyLog, Project } from '@/types'

export default async function DailyLogPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = formatISODate()

  const [{ data: todayLog }, { data: projects }, { data: allLogs }] = await Promise.all([
    supabase.from('daily_logs').select('*').eq('user_id', user!.id).eq('log_date', today).single(),
    supabase.from('projects').select('id, title, color').eq('user_id', user!.id).neq('status', 'complete').order('sort_order'),
    supabase.from('daily_logs').select('log_date, energy_level, project_focus_id, projects:project_focus_id(color)')
      .eq('user_id', user!.id)
      .order('log_date', { ascending: false })
      .limit(90),
  ])

  // Streak calculation
  let streak = 0
  if (allLogs && allLogs.length > 0) {
    const dateSet = new Set(allLogs.map((l: any) => l.log_date))
    let d = new Date()
    // If today not logged, start from yesterday
    if (!dateSet.has(today)) d.setDate(d.getDate() - 1)
    while (dateSet.has(formatISODate(d))) {
      streak++
      d.setDate(d.getDate() - 1)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Daily Log</h1>
        {streak > 0 && (
          <p className="text-text-muted text-sm">
            🔥 {streak} day streak
          </p>
        )}
      </div>

      <DailyLogForm
        existingLog={todayLog as DailyLog | null}
        projects={(projects ?? []) as Project[]}
        userId={user!.id}
        today={today}
      />

      <section>
        <h2 className="section-title mb-3">Log History</h2>
        <LogCalendar
          logs={(allLogs ?? []) as any[]}
          projects={(projects ?? []) as Project[]}
          userId={user!.id}
        />
      </section>
    </div>
  )
}
