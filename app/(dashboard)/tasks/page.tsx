import { createClient } from '@/lib/supabase/server'
import { formatISODate } from '@/lib/date-utils'
import TaskBoard from '@/components/tasks/TaskBoard'
import type { Task, Project } from '@/types'

export default async function TasksPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = formatISODate()

  const [{ data: tasks }, { data: projects }] = await Promise.all([
    supabase.from('tasks').select('*, project:projects(id,title,color)').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('projects').select('id, title, color').eq('user_id', user!.id).neq('status', 'complete').order('sort_order'),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title">Tasks</h1>
      <TaskBoard
        tasks={(tasks ?? []) as Task[]}
        projects={(projects ?? []) as Project[]}
        userId={user!.id}
        today={today}
      />
    </div>
  )
}
