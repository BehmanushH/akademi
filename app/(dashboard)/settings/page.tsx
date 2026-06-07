import { createClient } from '@/lib/supabase/server'
import SettingsClient from '@/components/SettingsClient'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, color, status, sort_order')
    .eq('user_id', user!.id)
    .order('sort_order')

  return (
    <div className="space-y-8 animate-fade-in max-w-xl">
      <h1 className="page-title">Settings</h1>
      <SettingsClient
        user={{ email: user?.email ?? '', id: user!.id }}
        projects={projects ?? []}
      />
    </div>
  )
}
