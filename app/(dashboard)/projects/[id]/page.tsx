import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/date-utils'
import { ENERGY_EMOJIS } from '@/lib/utils'
import ProjectEditor from '@/components/projects/ProjectEditor'
import MilestoneList from '@/components/projects/MilestoneList'
import type { Project, Milestone, DailyLog } from '@/types'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: project },
    { data: milestones },
    { data: logs },
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('id', params.id).eq('user_id', user!.id).single(),
    supabase.from('milestones').select('*').eq('project_id', params.id).order('due_date', { ascending: true, nullsFirst: false }),
    supabase.from('daily_logs').select('*').eq('user_id', user!.id).eq('project_focus_id', params.id).order('log_date', { ascending: false }).limit(20),
  ])

  if (!project) notFound()

  return (
    <div className="space-y-8 animate-fade-in">
      <ProjectEditor project={project as Project} userId={user!.id} />

      <section>
        <h2 className="section-title mb-3">Milestones</h2>
        <MilestoneList
          milestones={(milestones ?? []) as Milestone[]}
          projectId={params.id}
          userId={user!.id}
        />
      </section>

      {logs && logs.length > 0 && (
        <section>
          <h2 className="section-title mb-3">Log History ({logs.length})</h2>
          <div className="space-y-3">
            {(logs as DailyLog[]).map(log => (
              <div key={log.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">
                    {formatDate(log.log_date, 'EEEE, MMM d yyyy')}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{ENERGY_EMOJIS[log.energy_level]}</span>
                    {log.deep_work_hours > 0 && (
                      <span className="text-xs text-text-muted">{log.deep_work_hours}h deep work</span>
                    )}
                  </div>
                </div>
                {log.completed_work && (
                  <div className="mb-2">
                    <p className="text-xs text-text-muted mb-0.5">Completed</p>
                    <p className="text-sm text-text-primary">{log.completed_work}</p>
                  </div>
                )}
                {log.blocked && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-danger">Blocked: {log.blocked}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
