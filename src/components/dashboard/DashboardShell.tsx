'use client'

import { DependencyList, ReactNode, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Bell, Home, Lock, Moon, PieChart, Sun, User } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

type EmptyState = {
  icon: 'lock' | 'bell'
  title: string
  description: string
}

type DashboardShellProps = {
  children: ReactNode
  isLoggedIn: boolean
  emptyState: EmptyState
  headerAction?: ReactNode
}

export function useAnimateItems(deps: DependencyList = []) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const items = ref.current?.querySelectorAll<HTMLElement>('.animate-item')
    items?.forEach((item) => item.classList.add('visible'))
  }, deps)

  return ref
}

function Header({ action }: { action?: ReactNode }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-slate-100 dark:border-dark-border px-4 py-3">
      <div className="flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          {action}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="theme-toggle w-9 h-9 bg-slate-100 dark:bg-dark-card rounded-full flex items-center justify-center transition active:rotate-45"
            aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-slate-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

function EmptyStateView({ state }: { state: EmptyState }) {
  const Icon = state.icon === 'lock' ? Lock : Bell

  return (
    <main className="px-4 pb-24 pt-5 flex min-h-[80vh] flex-col items-center justify-center">
      <div className="animate-item text-center visible">
        <div className="w-20 h-20 bg-slate-100 dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-5">
          <Icon className="w-8 h-8 text-slate-400 dark:text-dark-subtle" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-dark-text mb-2">{state.title}</h2>
        <p className="text-slate-500 dark:text-dark-muted text-sm mb-6 max-w-xs mx-auto">{state.description}</p>
        <Link href="/login" className="inline-flex items-center bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg text-sm">
          <i className="fa-solid fa-arrow-right-to-bracket mr-2" />
          Fazer login
        </Link>
      </div>
    </main>
  )
}

function BottomNav() {
  const pathname = usePathname()
  const navItems = [
    { href: '/', icon: Home, label: 'Início' },
    { href: '/dashboard', icon: PieChart, label: 'Dashboard' },
    { href: '/notificacoes', icon: Bell, label: 'Notificações' },
    { href: '/login', icon: User, label: 'Perfil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0d1117] backdrop-blur-md border-t border-slate-100 dark:border-dark-border py-2 px-4 shadow-[0_-10px_30px_-24px_rgba(15,23,42,0.55)] dark:shadow-[0_-12px_34px_-24px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 no-underline transition ${
                active ? 'text-blue-600 dark:text-white' : 'text-slate-400 dark:text-white/80'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-[10px] ${active ? 'font-semibold' : ''}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function DashboardShell({ children, isLoggedIn, emptyState, headerAction }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-dark-text">
      <Header action={isLoggedIn ? headerAction : undefined} />
      {isLoggedIn ? children : <EmptyStateView state={emptyState} />}
      <BottomNav />
    </div>
  )
}
