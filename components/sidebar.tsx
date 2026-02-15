'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Terminal,
  Settings,
  FileText,
  Network,
  Clock,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Terminal },
  { label: 'Execute', href: '/dashboard/execute', icon: Terminal },
  { label: 'Sessions', href: '/dashboard/sessions', icon: Clock },
  { label: 'Policies', href: '/dashboard/policies', icon: Shield },
  { label: 'Logs', href: '/dashboard/logs', icon: FileText },
  { label: 'Nodes', href: '/dashboard/nodes', icon: Network },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[hsl(var(--card-bg))] border-r border-[hsl(var(--card-border))] flex flex-col">
      <div className="p-6 border-b border-[hsl(var(--card-border))]">
        <div className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-[hsl(var(--accent))]" />
          <h1 className="text-xl font-bold text-foreground">GPT Computer</h1>
        </div>
        <p className="text-xs text-muted mt-2">Sandbox Execution Engine</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-all',
                isActive
                  ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                  : 'text-muted hover:text-foreground hover:bg-[hsl(var(--secondary))]'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[hsl(var(--card-border))]">
        <div className="text-xs text-muted text-center">
          <p>Engine Status</p>
          <div className="mt-2 inline-flex items-center gap-1">
            <span className="status-indicator status-healthy" />
            <span>Operational</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
