export type ProjectStatus = 'on_track' | 'slipping' | 'blocked' | 'complete'
export type TaskPriority = 'high' | 'medium' | 'low'
export type DayType = 'Research' | 'Writing' | 'Admin' | 'Family' | 'Teaching' | 'Other'

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  color: string
  status: ProjectStatus
  progress_pct: number
  target_date: string | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  project_id: string
  user_id: string
  title: string
  due_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  log_date: string
  project_focus_id: string | null
  completed_work: string | null
  in_progress: string | null
  blocked: string | null
  blocked_reason: string | null
  tomorrows_task: string | null
  deep_work_hours: number
  energy_level: number
  personal_note: string | null
  created_at: string
  updated_at: string
  project?: Project
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_number: number
  year: number
  date_start: string | null
  date_end: string | null
  wins: string | null
  didnt_happen: string | null
  next_week_goal: string | null
  project_updates: ProjectUpdate[]
  total_deep_work_hours: number | null
  created_at: string
  updated_at: string
}

export interface ProjectUpdate {
  project_id: string
  project_title: string
  status: ProjectStatus
  update: string
}

export interface Task {
  id: string
  user_id: string
  project_id: string | null
  title: string
  priority: TaskPriority
  due_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
  project?: Project
}

export interface Idea {
  id: string
  user_id: string
  project_id: string | null
  content: string
  pinned: boolean
  created_at: string
  project?: Project
}

export interface WeeklyPlan {
  id: string
  user_id: string
  week_number: number
  year: number
  mon_type: DayType | null
  mon_focus: string | null
  tue_type: DayType | null
  tue_focus: string | null
  wed_type: DayType | null
  wed_focus: string | null
  thu_type: DayType | null
  thu_focus: string | null
  fri_type: DayType | null
  fri_focus: string | null
  sat_type: DayType | null
  sat_focus: string | null
  sun_type: DayType | null
  sun_focus: string | null
  created_at: string
  updated_at: string
}
