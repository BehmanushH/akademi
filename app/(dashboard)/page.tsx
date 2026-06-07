import { createClient } from '@/lib/supabase/server'
import { formatDate, formatShortDate, getDaysUntil, getGreeting, formatISODate } from '@/lib/date-utils'
import { STATUS_LABELS, STATUS_COLORS, ENERGY_EMOJIS } from '@/lib/utils'
import Link from 'next/link'
import { format, subDays } from 'date-fns'
import TodayFocusCard from '@/components/dashboard/TodayFocusCard'
import QuickCapture from '@/components/dashboard/QuickCapture'
import type { Project, DailyLog, Milestone } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = formatISODate()
  const yesterday = formatISODate(subDays(new Date(), 1))

  const [
    { data: projects },
    { data: todayLog },
    { data: yesterdayLog },
    { data: recentLogs },
    { data: upcomingMilestones },
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('user_id', user!.id).neq('status', 'complete').order('sort_order'),
    supabase.from('daily_logs').select('*').eq('user_id', user!.id).eq('log_date', today).single(),
    supabase.from('daily_logs').select('*, project:projects(*)').eq('user_id', user!.id).eq('log_date', yesterday).single(),
    supabase.from('daily_logs').select('*, project:projects(*)').eq('user_id', user!.id).order('log_date', { ascending: false }).limit(3),
    supabase.from('milestones')
      .select('*, project:projects(*)')
      .eq('user_id', user!.id)
      .eq('completed', false)
      .gte('due_date', today)
      .lte('due_date', format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd'))
      .order('due_date')
      .limit(10),
  ])

  const greeting = getGreeting()
  const userName = user?.email?.split('@')[0] ?? 'Researcher'
  const firstTask = (yesterdayLog as DailyLog | null)?.tomorrows_task ?? null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-text-primary">
          {greeting}, <span className="text-accent capitalize">{userName}</span>
        </h1>
        <p className="text-text-muted text-sm mt-0.5">{formatDate(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Today's Focus */}
      <TodayFocusCard
        firstTask={firstTask}
        deepWorkHoursToday={(todayLog as DailyLog | null)?.deep_work_hours ?? 0}
        todayLogId={(todayLog as DailyLog | null)?.id ?? null}
        userId={user!.id}
      />

      {/* Project Status Cards */}
      {projects && projects.length > 0 && (
        <section>
          <h2 className="section-title mb-3">Projects</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible">
            {(projects as Project[]).map(p => {
              const nextMilestone = upcomingMilestones?.find(m => (m as any).project_id === p.id) as any
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="card shrink-0 w-64 md:w-auto hover:border-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                      <h3 className="font-medium text-text-primary text-sm truncate">{p.title}</h3>
                    </div>
                    <span className={`badge shrink-0 ml-2 status-${p.status}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </div>
                  <div className="progress-bar mb-2">
                    <div
                      className="progress-fill"
                      style={{ width: `${p.progress_pct}%`, background: STATUS_COLORS[p.status] }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{p.progress_pct}% complete</span>
                    {p.target_date && (
                      <span className={getDaysUntil(p.target_date) < 7 ? 'text-warning' : ''}>
                        {getDaysUntil(p.target_date) > 0
                          ? `${getDaysUntil(p.target_date)}d left`
                          : 'Overdue'}
                      </span>
                    )}
                  </div>
                  {nextMilestone && (
                    <p className="text-xs text-text-muted mt-2 truncate">
                      Next: {nextMilestone.title}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Logs */}
        {recentLogs && recentLogs.length > 0 && (
          <section>
            <h2 className="section-title mb-3">Recent Logs</h2>
            <div className="space-y-2">
              {(recentLogs as DailyLog[]).map(log => (
                <Link key={log.id} href="/daily-log" className="card flex items-start gap-3 hover:border-border/80 transition-colors">
                  <div className="shrink-0 text-center min-w-[40px]">
                    <div className="text-xs text-text-muted">{format(new Date(log.log_date), 'MMM')}</div>
                    <div className="text-lg font-serif text-text-primary leading-tight">{format(new Date(log.log_date), 'd')}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      {(log as any).project && (
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: (log as any).project.color }} />
                      )}
                      <span className="text-xs text-text-muted truncate">{(log as any).project?.title ?? 'No project'}</span>
                      <span className="ml-auto text-sm">{ENERGY_EMOJIS[log.energy_level]}</span>
                    </div>
                    <p className="text-sm text-text-primary line-clamp-1">
                      {log.completed_work ?? 'No notes'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Deadlines */}
        {upcomingMilestones && upcomingMilestones.length > 0 && (
          <section>
            <h2 className="section-title mb-3">Deadlines This Week</h2>
            <div className="space-y-2">
              {upcomingMilestones.map((m: any) => (
                <div key={m.id} className="card flex items-center gap-3">
                  <div
                    className="w-1 h-full self-stretch rounded-full min-h-[32px]"
                    style={{ background: m.project?.color ?? '#888899' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{m.title}</p>
                    <p className="text-xs text-text-muted">{m.project?.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-medium ${getDaysUntil(m.due_date) <= 2 ? 'text-danger' : 'text-text-muted'}`}>
                      {getDaysUntil(m.due_date) === 0 ? 'Today' :
                       getDaysUntil(m.due_date) === 1 ? 'Tomorrow' :
                       `${getDaysUntil(m.due_date)}d`}
                    </p>
                    <p className="text-xs text-text-muted">{formatShortDate(m.due_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Quick Capture */}
      <QuickCapture userId={user!.id} />
    </div>
  )
}
