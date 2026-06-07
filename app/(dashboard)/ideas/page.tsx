import { createClient } from '@/lib/supabase/server'
import IdeasBoard from '@/components/ideas/IdeasBoard'
import type { Idea, Project } from '@/types'

export default async function IdeasPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: ideas }, { data: projects }] = await Promise.all([
    supabase.from('ideas').select('*, project:projects(id,title,color)').eq('user_id', user!.id).order('pinned', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('projects').select('id, title, color').eq('user_id', user!.id).neq('status', 'complete').order('sort_order'),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title">Ideas & Capture</h1>
      <IdeasBoard
        ideas={(ideas ?? []) as Idea[]}
        projects={(projects ?? []) as Project[]}
        userId={user!.id}
      />
    </div>
  )
}
