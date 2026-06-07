'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Download, Loader2, Archive } from 'lucide-react'

interface Project {
  id: string
  title: string
  color: string
  status: string
  sort_order: number
}

export default function SettingsClient({
  user, projects: initialProjects,
}: {
  user: { email: string; id: string }
  projects: Project[]
}) {
  const [projects, setProjects] = useState(initialProjects)
  const [signingOut, setSigningOut] = useState(false)
  const [exporting, setExporting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function archiveProject(id: string) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'complete' } : p))
    await supabase.from('projects').update({ status: 'complete' }).eq('id', id)
    router.refresh()
  }

  async function exportData() {
    setExporting(true)
    const [
      { data: projects },
      { data: tasks },
      { data: logs },
      { data: ideas },
      { data: reviews },
    ] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', user.id),
      supabase.from('tasks').select('*').eq('user_id', user.id),
      supabase.from('daily_logs').select('*').eq('user_id', user.id),
      supabase.from('ideas').select('*').eq('user_id', user.id),
      supabase.from('weekly_reviews').select('*').eq('user_id', user.id),
    ])

    const data = { projects, tasks, daily_logs: logs, ideas, weekly_reviews: reviews, exported_at: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `akademi-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <section className="card">
        <h2 className="section-title mb-3">Profile</h2>
        <div>
          <label className="label">Email</label>
          <p className="text-text-primary text-sm">{user.email}</p>
        </div>
      </section>

      {/* Projects management */}
      <section className="card">
        <h2 className="section-title mb-3">Projects</h2>
        <div className="space-y-2">
          {projects.filter(p => p.status !== 'complete').map(p => (
            <div key={p.id} className="flex items-center gap-3 py-1">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
              <span className="text-sm text-text-primary flex-1">{p.title}</span>
              <button
                onClick={() => archiveProject(p.id)}
                className="text-xs text-text-muted hover:text-warning transition-colors flex items-center gap-1"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive
              </button>
            </div>
          ))}
          {projects.filter(p => p.status === 'complete').length > 0 && (
            <div className="pt-2 border-t border-border mt-2">
              <p className="text-xs text-text-muted mb-2">Archived</p>
              {projects.filter(p => p.status === 'complete').map(p => (
                <div key={p.id} className="flex items-center gap-3 py-1">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 opacity-40" style={{ background: p.color }} />
                  <span className="text-sm text-text-muted line-through flex-1">{p.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Data */}
      <section className="card">
        <h2 className="section-title mb-3">Data Export</h2>
        <p className="text-sm text-text-muted mb-3">Download all your data as a JSON file.</p>
        <button
          onClick={exportData}
          disabled={exporting}
          className="btn-ghost flex items-center gap-2 border border-border"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? 'Exporting...' : 'Export All Data'}
        </button>
      </section>

      {/* Account */}
      <section className="card">
        <h2 className="section-title mb-3">Account</h2>
        <button
          onClick={signOut}
          disabled={signingOut}
          className="flex items-center gap-2 text-sm text-danger hover:text-danger/80 transition-colors"
        >
          {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Sign Out
        </button>
      </section>
    </div>
  )
}
