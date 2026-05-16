'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Star, Instagram, MessageSquare, Link as LinkIcon, Plus, Building2 } from 'lucide-react'
import { AppShell } from '@/components/app/AppShell'
import { useAuth } from '@/components/providers/AuthProvider'
import GerenciadorPaginas from '@/components/dashboard/GerenciadorPaginas'
import PaginasAtivas from '@/components/dashboard/PaginasAtivas'
import { usePaginas } from '@/hooks/usePaginas'

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string
}) {
  return (
    <div className="rounded-lg md:rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-3 md:p-5 shadow-sm">
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4 ${color}`}>
        <Icon className="w-4 h-4 md:w-5 md:h-5 font-bold" />
      </div>
      <p className="text-lg md:text-2xl font-black text-slate-900 dark:text-dark-text">{value}</p>
      <p className="text-xs md:text-sm font-bold text-slate-600 dark:text-dark-muted mt-0.5 md:mt-0.5">{label}</p>
      <p className="text-xs text-slate-500 dark:text-dark-subtle mt-0.5 md:mt-1">{sub}</p>
    </div>
  )
}

function WelcomeBanner({ name }: { name: string }) {
  const hasName = name && name.trim() !== '' && name !== 'Usuário'
  
  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-200 dark:shadow-none">
      <p className="text-sm font-bold opacity-80 mb-1">Bem-vindo de volta 👋</p>
      <h2 className="text-2xl font-black">
        {hasName ? `Olá, ${name}!` : 'Olá, feliz em te ver no Rankify!'}
      </h2>
      <p className="mt-2 text-sm opacity-80 max-w-md">
        Gerencie suas páginas e acompanhe o desempenho em tempo real.
      </p>
    </div>
  )
}

/* ── Mobile Welcome Banner (otimizado para PWA) ── */
function MobileWelcomeBanner({ name }: { name: string }) {
  const hasName = name && name.trim() !== '' && name !== 'Usuário'
  
  return (
    <div className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white shadow-lg shadow-blue-200 dark:shadow-none">
      <p className="text-xs font-bold opacity-90 mb-0.5">Bem-vindo de volta 👋</p>
      <h2 className="text-base font-black leading-tight">
        {hasName ? `Olá, ${name}!` : 'Feliz em te ver no Rankify!'}
      </h2>
      <p className="mt-1 text-xs opacity-80">
        Gerencie suas páginas e acompanhe métricas.
      </p>
    </div>
  )
}

function CreateCompanyButton() {
  return (
    <Link 
      href="/dashboard/paginas/nova"
      className="flex flex-col items-center gap-2 w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white shadow-lg shadow-blue-200 dark:shadow-none transition hover:from-blue-700 hover:to-cyan-600"
    >
      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
        <Building2 className="w-5 h-5" />
      </div>
      <div className="text-center">
        <p className="font-black text-sm">Crie sua primeira página</p>
        <p className="text-xs opacity-90">Cadastre sua empresa e gere QR Code</p>
      </div>
      <div className="flex items-center gap-2 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
        <Plus className="w-3 h-3" />
        Criar Empresa
      </div>
    </Link>
  )
}

function NotifPreview() {
  const [notificacoes, setNotificacoes] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const notifs = JSON.parse(localStorage.getItem('notificacoes') || '[]')
    setNotificacoes(notifs.slice(0, 3))
    setIsLoaded(true)
  }, [])

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO)
    const agora = new Date()
    const diffMs = agora.getTime() - data.getTime()
    const diffMin = Math.floor(diffMs / (1000 * 60))
    
    if (diffMin < 1) return 'Agora mesmo'
    if (diffMin < 60) return `há ${diffMin} min`
    if (diffMin < 1440) return `há ${Math.floor(diffMin / 60)} h`
    return `há ${Math.floor(diffMin / 1440)} d`
  }

  // Renderizar apenas após hidratação
  if (!isLoaded) {
    return (
      <div className="rounded-lg md:rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-4 md:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-dark-text">Notificações</h3>
          <Link href="/dashboard/notificacoes" className="text-xs font-bold text-blue-600 hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-2 md:p-3 text-center">
          <p className="text-xs md:text-sm text-slate-500 dark:text-dark-muted">
            Carregando notificações...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg md:rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-dark-text">Notificações</h3>
        <Link href="/dashboard/notificacoes" className="text-xs font-bold text-blue-600 hover:underline">
          Ver todas
        </Link>
      </div>
      <div className="space-y-1.5 md:space-y-2">
        {notificacoes.length === 0 ? (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-2 md:p-3 text-center">
            <p className="text-xs md:text-sm text-slate-500 dark:text-dark-muted">
              Nenhuma notificação recente
            </p>
          </div>
        ) : (
          notificacoes.map((notif) => (
            <div key={notif.id} className="flex items-start gap-2 md:gap-3 rounded-lg bg-slate-50 dark:bg-dark-border p-2 md:p-3">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <Bell className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-semibold text-slate-900 dark:text-dark-text truncate">
                  {notif.mensagem}
                </p>
                <p className="text-xs text-slate-400 dark:text-dark-muted mt-0.5">
                  {formatarData(notif.data)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import { ClientOnly } from '@/components/providers/ClientOnly'

export default function DashboardPage() {
  const { user } = useAuth()
  const { paginas } = usePaginas()
  const [displayName, setDisplayName] = useState('')

  console.log('[Dashboard] user:', user)

  // Busca o nome diretamente da API para garantir dados atualizados
  const fetchUserName = () => {
    fetch('/api/auth/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        console.log('[Dashboard] API response:', data.user)
        if (data.user) {
          const name = data.user.name || data.user.displayName || ''
          setDisplayName(name)
        }
      })
      .catch(() => {})
  }

  // Busca ao montar apenas uma vez
  useEffect(() => {
    fetchUserName()
  }, [])

  // Usa o nome da API ou fallback para o do user
  const name = displayName || user?.name || user?.displayName || ''

  console.log('[Dashboard] name:', name, 'displayName:', displayName, 'user?.name:', user?.name)

  // Calcular estatísticas totais
  const totalCliquesInstagram = paginas.reduce((sum, p) => sum + p.cliquesInstagram, 0)
  const totalCliquesWhatsApp = paginas.reduce((sum, p) => sum + p.cliquesWhatsApp, 0)
  const totalAvaliacoes = paginas.reduce((sum, p) => sum + p.avaliacoes, 0)
  const paginasAtivas = paginas.filter(p => p.ativa).length

  const stats = [
    { 
      icon: Star, 
      label: 'Avaliações', 
      value: totalAvaliacoes.toString(), 
      sub: 'Total recebidas', 
      color: 'bg-yellow-200 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400' 
    },
    { 
      icon: Instagram, 
      label: 'Instagram', 
      value: totalCliquesInstagram.toString(), 
      sub: 'Cliques no Instagram', 
      color: 'bg-pink-200 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400' 
    },
    { 
      icon: MessageSquare, 
      label: 'WhatsApp', 
      value: totalCliquesWhatsApp.toString(), 
      sub: 'Cliques no WhatsApp', 
      color: 'bg-green-200 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
    },
    { 
      icon: LinkIcon, 
      label: 'Páginas', 
      value: paginasAtivas.toString(), 
      sub: 'Páginas ativas', 
      color: 'bg-purple-200 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400' 
    },
  ]

  return (
    <AppShell title="Dashboard">
      <ClientOnly>
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
          {/* Mobile: Banner de boas-vindas otimizado + Botão Criar Empresa */}
          <div className="md:hidden space-y-3">
            <MobileWelcomeBanner name={name} />
            <CreateCompanyButton />
          </div>
          
          {/* Desktop: Banner de boas-vindas */}
          <div className="hidden md:block">
            <WelcomeBanner name={name} />
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
          
          <div className="grid lg:grid-cols-2 gap-3 md:gap-5">
            <PaginasAtivas />
            <div className="hidden md:block">
              <NotifPreview />
            </div>
          </div>

          <div className="hidden md:block">
            <GerenciadorPaginas />
          </div>
        </div>
      </ClientOnly>
    </AppShell>
  )
}
