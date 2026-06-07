'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderOpen, BookOpen, BarChart2,
  CheckSquare, Lightbulb, Calendar, Settings, GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/daily-log', label: 'Daily Log', icon: BookOpen },
  { href: '/weekly-review', label: 'Weekly Review', icon: BarChart2 },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/planner', label: 'Planner', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-border bg-surface/50 py-6 px-3 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-accent" />
        </div>
        <span className="font-serif text-lg text-text-primary">Akademi</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(active ? 'nav-link-active' : 'nav-link')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 pt-4 border-t border-border">
        <p className="text-xs text-text-muted truncate">{userEmail}</p>
      </div>
    </aside>
  )
}
