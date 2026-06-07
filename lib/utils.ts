import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ProjectStatus, TaskPriority } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PROJECT_COLORS = [
  '#d4a853', // warm gold
  '#3d9970', // green
  '#4a9eed', // blue
  '#9b59b6', // purple
  '#e05252', // red
  '#e8a838', // orange
  '#1abc9c', // teal
  '#e91e8c', // pink
]

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  on_track: 'On Track',
  slipping: 'Slipping',
  blocked: 'Blocked',
  complete: 'Complete',
}

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  on_track: '#3d9970',
  slipping: '#e8a838',
  blocked: '#e05252',
  complete: '#4a9eed',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#e05252',
  medium: '#e8a838',
  low: '#888899',
}

export const ENERGY_EMOJIS = ['', '😴', '😐', '🙂', '😄', '🚀']

export const DAY_TYPES = ['Research', 'Writing', 'Admin', 'Family', 'Teaching', 'Other'] as const
