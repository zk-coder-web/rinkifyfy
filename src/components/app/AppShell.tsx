'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Link as LinkIcon,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/components/providers/AuthProvider'

// Static notification IDs — in the future this comes from an API
export const STATIC_NOTIF_IDS = ['welcome-rankify-v1']

// Detecta se está rodando como PWA (standalone)
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (navigator as any).standalone === true
    setIsPWA(standalone)
  }, [])
  
  return isPWA
}

// Hook para detectar a altura da status bar em PWAs
export function useSafeAreaTop() {
  const [safeAreaTop, setSafeAreaTop] = useState(0)
  const isPWA = useIsPWA()
  
  useEffect(() => {
    if (!isPWA || typeof window === 'undefined') {
      setSafeAreaTop(0)
      return
    }
    
    // Aumentado para afastar mais do topo e não colar nos ícones do celular
    setSafeAreaTop(24)
  }, [isPWA])
  
  return safeAreaTop
}

const NAV = [
  { href: '/dashboard',               icon: LayoutDashboard, label: 'Dashboard'     },
  { href: '/dashboard/minhas-paginas', icon: LinkIcon,       label: 'Minhas Páginas' },
]

/* ── Hook: tracks unread notifications ── */
function useUnreadNotif() {
  // Implementação temporária para evitar erro
  const [naoLidas, setNaoLidas] = useState(0)
  
  useEffect(() => {
    // Simular carregamento de notificações
    // Em produção, isso viria de uma API
    setNaoLidas(0) // Por enquanto, nenhuma notificação não lida
  }, [])
  
  return naoLidas > 0
}

function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const [userDetails, setUserDetails] = useState<{ name: string; displayName: string } | null>(null)

  // Busca dados atualizados do usuário periodicamente
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await fetch('/api/auth/user', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUserDetails({ 
            name: data.user?.name || '', 
            displayName: data.user?.displayName || '' 
          })
        }
      } catch { /* ignore */ }
    }

    fetchUserDetails()
  }, [])

  // Usa os dados da API ou fallback para o user do contexto
  const displayName = userDetails?.displayName || userDetails?.name || user?.displayName || user?.name || ''

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 w-64 h-screen border-r border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card">
      <div className="px-5 py-5 border-b border-slate-200 dark:border-dark-border">
        <Logo size="sm" />
      </div>

      <div className="px-4 py-4 border-b border-slate-200 dark:border-dark-border">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-100 dark:bg-dark-bg px-3 py-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-sm shrink-0">
            {displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 dark:text-dark-text truncate">
              {displayName || 'Usuário'}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-dark-muted truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="px-3 py-4 space-y-1 flex-shrink-0">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                  : 'text-slate-600 dark:text-dark-muted hover:bg-slate-100 dark:hover:bg-dark-bg'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-70" />}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1"></div>

      <div className="px-3 py-4 border-t border-slate-100 dark:border-dark-border space-y-1 flex-shrink-0">
        {/* Configurações */}
        <Link href="/dashboard/configuracoes"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 dark:text-dark-muted hover:bg-slate-100 dark:hover:bg-dark-bg transition">
          <Settings className="w-4 h-4" />
          Configurações
        </Link>
        
        {/* "Voltar ao site" — simple link, no redirect guard on "/" */}
        <Link href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 dark:text-dark-muted hover:bg-slate-100 dark:hover:bg-dark-bg transition">
          <Settings className="w-4 h-4" />
          Voltar ao site
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition">
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}

function TopBar({ title }: { title: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const isDark = mounted ? theme === 'dark' : false
  const hasUnread = useUnreadNotif()
  const isPWA = useIsPWA()
  const safeAreaTop = useSafeAreaTop()

  const handleThemeToggle = () => {
    if (mounted) {
      setTheme(isDark ? 'light' : 'dark')
    }
  }

  return (
    <header 
      className="sticky top-0 z-40 bg-white dark:bg-dark-card/95 backdrop-blur-md border-b border-slate-200 dark:border-dark-border px-6 py-3.5 md:ml-0"
      style={isPWA ? { paddingTop: `${safeAreaTop + 14}px` } : undefined}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-black text-slate-900 dark:text-dark-text">{title}</h1>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/notificacoes"
            className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-dark-bg flex items-center justify-center transition hover:bg-slate-200 dark:hover:bg-dark-border"
            aria-label="Notificações">
            <Bell className="w-4 h-4 text-slate-700 dark:text-dark-muted" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-dark-card" />
            )}
          </Link>
          <button 
            type="button" 
            onClick={handleThemeToggle}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-dark-bg flex items-center justify-center transition hover:bg-slate-200 dark:hover:bg-dark-border"
            aria-label={isDark ? 'Tema claro' : 'Tema escuro'}>
            {isDark ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
          <Link href="/dashboard/configuracoes"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white transition hover:opacity-90"
            aria-label="Configurações">
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}

function MobileNav() {
  const pathname = usePathname()
  const isPWA = useIsPWA()
  
  // Menu para PWA: Dashboard, Minhas Páginas, Perfil (sem "Início")
  const pwaItems = [
    { href: '/dashboard',               icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/minhas-paginas', icon: LinkIcon,       label: 'Páginas'   },
    { href: '/dashboard/configuracoes',  icon: User,           label: 'Perfil'   },
  ]
  
  // Menu normal para navegador mobile: Dashboard, Minhas Páginas, Conta (sem "Site")
  const browserItems = [
    { href: '/dashboard',               icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/minhas-paginas', icon: LinkIcon,       label: 'Páginas'   },
    { href: '/dashboard/configuracoes', icon: User,            label: 'Conta'    },
  ]
  
  const items = isPWA ? pwaItems : browserItems

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-[#0d1117] backdrop-blur-md border-t border-slate-200 dark:border-dark-border py-2 px-4"
      style={isPWA ? { paddingBottom: `calc(0.5rem + env(safe-area-inset-bottom, 20px))` } : undefined}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`relative flex flex-col items-center gap-0.5 transition ${active ? 'text-blue-600 dark:text-white' : 'text-slate-600 dark:text-white/60'}`}>
              <Icon className="w-5 h-5" />
              <span className={`text-[10px] ${active ? 'font-semibold' : ''}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function AppShell({ children, title = 'Dashboard' }: { children: ReactNode; title?: string }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-dark-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <TopBar title={title} />
        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
