import { createClient } from '@/lib/supabase/server'
import { STATUS_LABELS, STATUS_COLORS, PROJECT_COLORS } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'
import Link from 'next/link'
import NewProjectButton from '@/components/projects/NewProjectButton'
import type { Project } from '@/types'

export default async function ProjectsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user!.id)
    .order('sort_order')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-text-muted text-sm">{projects?.length ?? 0} active projects</p>
        </div>
        <NewProjectButton userId={user!.id} />
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {(projects as Project[]).map(p => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="card hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
                  <h3 className="font-medium text-text-primary truncate">{p.title}</h3>
                </div>
                <span className={`badge shrink-0 ml-2 status-${p.status}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </div>

              {p.description && (
                <p className="text-sm text-text-muted line-clamp-2 mb-3">{p.description}</p>
              )}

              <div className="progress-bar mb-2">
                <div
                  className="progress-fill"
                  style={{ width: `${p.progress_pct}%`, background: STATUS_COLORS[p.status] }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{p.progress_pct}% complete</span>
                {p.target_date && (
                  <span>{formatDate(p.target_date, 'MMM d, yyyy')}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-text-muted mb-4">No projects yet. Create your first one!</p>
          <NewProjectButton userId={user!.id} />
        </div>
      )}
    </div>
  )
}
