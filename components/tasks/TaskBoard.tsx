'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatShortDate } from '@/lib/date-utils'
import { PRIORITY_COLORS } from '@/lib/utils'
import type { Task, Project, TaskPriority } from '@/types'

type TabType = 'active' | 'today' | 'completed'

export default function TaskBoard({
  tasks: initialTasks, projects, userId, today,
}: { tasks: Task[]; projects: Project[]; userId: string; today: string }) {
  const [tab, setTab] = useState<TabType>('active')
  const [tasks, setTasks] = useState(initialTasks)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newProject, setNewProject] = useState('')
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium')
  const [newDue, setNewDue] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function toggleTask(task: Task) {
    const completed = !task.completed
    setTasks(prev => prev.map(t => t.id === task.id
      ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null }
      : t
    ))
    await supabase.from('tasks').update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    }).eq('id', task.id)
  }

  async function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return

    const { data } = await supabase.from('tasks').insert({
      user_id: userId,
      title: newTitle.trim(),
      project_id: newProject || null,
      priority: newPriority,
      due_date: newDue || null,
    }).select('*, project:projects(id,title,color)').single()

    if (data) setTasks(prev => [data as Task, ...prev])
    setNewTitle('')
    setNewProject('')
    setNewPriority('medium')
    setNewDue('')
    setShowNew(false)
  }

  const activeTasks = tasks.filter(t => !t.completed)
  const todayTasks = tasks.filter(t => !t.completed && (t.due_date === today || (t.due_date && t.due_date < today)))
  const completedTasks = tasks.filter(t => t.completed).slice(0, 50)

  const shown = tab === 'active' ? activeTasks : tab === 'today' ? todayTasks : completedTasks

  // Group active by project
  const grouped = tab === 'active'
    ? Object.entries(
        shown.reduce((acc, t) => {
          const key = (t as any).project?.title ?? 'General'
          if (!acc[key]) acc[key] = []
          acc[key].push(t)
          return acc
        }, {} as Record<string, Task[]>)
      )
    : null

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'active', label: 'Active', count: activeTasks.length },
    { key: 'today', label: 'Today', count: todayTasks.length },
    { key: 'completed', label: 'Completed', count: completedTasks.length },
  ]

  function TaskRow({ task }: { task: Task }) {
    const isOverdue = task.due_date && task.due_date < today && !task.completed
    const project = (task as any).project as Project | null

    return (
      <div className="flex items-center gap-3 py-2 group border-l-2 pl-3 rounded-sm transition-colors hover:bg-surface/50"
        style={{ borderColor: PRIORITY_COLORS[task.priority] }}>
        <button onClick={() => toggleTask(task)} className="shrink-0 text-text-muted hover:text-accent transition-colors">
          {task.completed
            ? <CheckSquare className="w-4 h-4 text-success" />
            : <Square className="w-4 h-4" />
          }
        </button>

        <span className={`flex-1 text-sm transition-all ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {task.title}
        </span>

        {project && (
          <div className="flex items-center gap-1 text-xs text-text-muted shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ background: project.color }} />
          </div>
        )}

        {task.due_date && (
          <span className={`text-xs shrink-0 ${isOverdue ? 'text-danger' : 'text-text-muted'}`}>
            {formatShortDate(task.due_date)}
          </span>
        )}

        <button
          onClick={() => deleteTask(task.id)}
          className="text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Tabs + Add */}
      <div className="flex items-center gap-1 mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              tab === t.key ? 'bg-accent/20 text-accent font-medium' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-xs opacity-70">{t.count}</span>
            )}
          </button>
        ))}
        <button
          onClick={() => setShowNew(!showNew)}
          className="btn-primary flex items-center gap-1.5 ml-auto"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* New task form */}
      {showNew && (
        <form onSubmit={addTask} className="card mb-4 space-y-3">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="input-base"
            placeholder="Task title..."
            autoFocus
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={newProject}
              onChange={e => setNewProject(e.target.value)}
              className="input-base"
            >
              <option value="">General</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as TaskPriority)}
              className="input-base"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              type="date"
              value={newDue}
              onChange={e => setNewDue(e.target.value)}
              className="input-base"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Add Task</button>
          </div>
        </form>
      )}

      {/* Task list */}
      {shown.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-text-muted text-sm">
            {tab === 'today' ? 'No tasks due today' : 'No tasks here'}
          </p>
        </div>
      ) : grouped ? (
        <div className="space-y-4">
          {grouped.map(([group, groupTasks]) => (
            <div key={group} className="card">
              <h3 className="text-xs text-text-muted uppercase tracking-wider mb-3">{group}</h3>
              <div className="space-y-1">
                {groupTasks.map(t => <TaskRow key={t.id} task={t} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card space-y-1">
          {shown.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
    </div>
  )
}
