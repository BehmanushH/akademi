import { createClient } from '@/lib/supabase/server'
import { getISOWeekYear, getWeekRange, formatDate, formatISODate } from '@/lib/date-utils'
import PlannerGrid from '@/components/PlannerGrid'
import type { WeeklyPlan, Task } from '@/types'

export default async function PlannerPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { week, year } = getISOWeekYear()
  const { start, end } = getWeekRange(week, year)

  const startStr = formatDate(start, 'yyyy-MM-dd')
  const endStr = formatDate(end, 'yyyy-MM-dd')

  const [{ data: plan }, { data: tasks }, { data: logs }] = await Promise.all([
    supabase.from('weekly_plans').select('*').eq('user_id', user!.id).eq('week_number', week).eq('year', year).single(),
    supabase.from('tasks').select('id, title, due_date, priority').eq('user_id', user!.id).eq('completed', false).gte('due_date', startStr).lte('due_date', endStr),
    supabase.from('daily_logs').select('log_date, energy_level').eq('user_id', user!.id).gte('log_date', startStr).lte('log_date', endStr),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Weekly Planner</h1>
        <p className="text-text-muted text-sm">
          Week {week} · {formatDate(start, 'MMM d')} – {formatDate(end, 'MMM d, yyyy')}
        </p>
      </div>
      <PlannerGrid
        plan={plan as WeeklyPlan | null}
        tasks={(tasks ?? []) as Task[]}
        logs={(logs ?? []) as any[]}
        userId={user!.id}
        week={week}
        year={year}
        weekStart={startStr}
      />
    </div>
  )
}
