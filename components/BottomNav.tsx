'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderOpen, BookOpen,
  CheckSquare, Lightbulb, Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/daily-log', label: 'Log', icon: BookOpen },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/planner', label: 'Plan', icon: Calendar },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-surface/95 backdrop-blur-sm">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0',
                active ? 'text-accent' : 'text-text-muted'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
