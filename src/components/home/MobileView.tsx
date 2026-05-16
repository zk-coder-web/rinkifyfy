'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Moon, Sun, User } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { RankifyFlow } from '@/components/home/RankifyFlow'
import { useAuth } from '@/components/providers/AuthProvider'

/* ── HOOK: animate-item ao entrar na tela ── */
function useAnimateItems() {
  const ref = useRef<HTMLDivElement>(null)

  return ref
}

/* ── HOOK: altura real do viewport mobile ── */
function useMobileHeight() {
  const [height, setHeight] = useState('100vh')

  useEffect(() => {
    const update = () => setHeight(`${window.innerHeight}px`)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return height
}

/* ── HEADER ── */
function MobileHeader() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const { user, isLoggedIn } = useAuth()
  const [notifCount, setNotifCount] = useState(0)
  const [isPWA, setIsPWA] = useState(false)
  const [safeAreaTop, setSafeAreaTop] = useState(0)

  // Detecta PWA e safe area
  useEffect(() => {
    if (typeof window === 'undefined') return
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (navigator as any).standalone === true
    setIsPWA(standalone)
    
    if (standalone) {
      // Valor mínimo para não sobrepor status bar
      setSafeAreaTop(10)
    }
  }, [])

  // Carrega contagem de notificações não lidas
  useEffect(() => {
    if (isLoggedIn) {
      try {
        const notifs = JSON.parse(localStorage.getItem('notificacoes') || '[]')
        const naoLidas = notifs.filter((n: any) => !n.lida).length
        setNotifCount(naoLidas)
      } catch {}
    }
  }, [isLoggedIn])

  const displayName = user?.displayName || user?.name || user?.email || ''

  return (
    <header 
      className="sticky top-0 z-50 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-slate-100 dark:border-dark-border px-3 py-2.5"
      style={isPWA ? { paddingTop: `${safeAreaTop + 10}px` } : undefined}
    >
      <div className="flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <Link
              href="/dashboard/notificacoes"
              className="relative w-9 h-9 bg-slate-100 dark:bg-dark-card rounded-full flex items-center justify-center transition active:scale-95"
            >
              <i className="fa-solid fa-bell text-base text-slate-700 dark:text-dark-muted" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-9 h-9 bg-slate-100 dark:bg-dark-card rounded-full flex items-center justify-center transition"
          >
            {isDark
              ? <Sun  className="w-4 h-4 text-slate-300" />
              : <Moon className="w-4 h-4 text-slate-700" />
            }
          </button>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-full transition"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 truncate max-w-[80px]">
                {displayName}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-9 h-9 bg-slate-100 dark:bg-dark-card rounded-full flex items-center justify-center transition active:scale-95"
            >
              <User className="w-4 h-4 text-slate-700 dark:text-dark-muted" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

/* ── HERO CARD ── */
function HeroCard() {
  return (
    <div className="animate-item mb-6">
      <div className="rounded-2xl">
        <div className="hidden">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600" />
          </span>
          Algoritmo 2026
        </div>
        <h1 className="hidden">Seja o Nº 1 no Google</h1>
        <p className="hidden">
          Centralize avaliações, redes sociais e contatos.
        </p>
        <div className="bg-white dark:bg-dark-card border-y border-slate-200 dark:border-dark-border p-1.5 mb-4 shadow-sm">
          <Image
            src="/assets/lg.png"
            alt="Banner Rankify"
            width={900}
            height={580}
            className="w-full h-auto"
            priority
          />
        </div>
        <button className="mx-4 w-[calc(100%-2rem)] bg-blue-600 text-white font-bold py-3 rounded-xl text-sm shadow-lg active:scale-[0.98] transition">
          Criar minha página grátis →
        </button>
      </div>
    </div>
  )
}

/* ── STATS ROW ── */
function StatsRow() {
  const stats = [
    { icon: 'fa-star',       color: 'text-yellow-500', value: '4.9',   label: 'Avaliação'    },
    { icon: 'fa-chart-line', color: 'text-blue-500',   value: '+120%', label: 'Mais reviews' },
    { icon: 'fa-users',      color: 'text-green-500',  value: '2.5k+', label: 'Clientes'     },
  ]

  return (
    <div className="animate-item mb-6">
      <div className="grid grid-cols-3 gap-2">
        {stats.map(({ icon, color, value, label }) => (
          <div key={label} className="bg-white dark:bg-dark-card rounded-xl p-3 text-center shadow-sm border border-slate-100 dark:border-dark-border">
            <i className={`fa-solid ${icon} ${color} text-lg mb-1 block`} />
            <p className="text-xl font-black text-slate-900 dark:text-dark-text">{value}</p>
            <p className="text-[10px] text-slate-500 dark:text-dark-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── STEPS LIST ── */
const mobileSteps = [
  { n: 1, title: 'Cadastre sua empresa',   desc: 'Nome e link do Maps'    },
  { n: 2, title: 'Personalize sua página', desc: 'Logo e redes sociais'   },
  { n: 3, title: 'Gere o QR Code',         desc: 'Baixe em PNG/PDF'       },
  { n: 4, title: 'Acompanhe métricas',     desc: 'Scans em tempo real'    },
]

function StepsList() {
  return (
    <div className="animate-item mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-dark-text">Como funciona</h2>
        <span className="text-xs text-blue-600 font-semibold">4 passos</span>
      </div>
      <div className="space-y-3">
        {mobileSteps.map(({ n, title, desc }) => (
          <div
            key={n}
            className="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm border border-slate-100 dark:border-dark-border flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
              {n}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-dark-text">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-dark-muted">{desc}</p>
            </div>
            <i className="fa-solid fa-chevron-right text-slate-300 text-xs" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── BENEFÍCIOS ── */
const beneficios = [
  { icon: 'fa-link',         color: 'text-blue-600',  label: 'Link curto'  },
  { icon: 'fa-mobile-alt',   color: 'text-blue-600',  label: 'Responsivo'  },
  { icon: 'fa-brands fa-whatsapp', color: 'text-green-600', label: 'WhatsApp' },
  { icon: 'fa-chart-simple', color: 'text-blue-600',  label: 'Dashboard'   },
]

function Beneficios() {
  return (
    <div className="animate-item mb-6">
      <h2 className="text-lg font-extrabold mb-3 text-slate-900 dark:text-dark-text">Benefícios</h2>
      <div className="grid grid-cols-2 gap-2">
        {beneficios.map(({ icon, color, label }) => (
          <div key={label} className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3">
            <i className={`fa-solid ${icon} ${color} mb-1 block`} />
            <p className="text-xs font-semibold text-slate-700 dark:text-dark-text">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RankifyMobileHero() {
  const { user, isLoggedIn } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const benefits = [
    { icon: 'fa-star', label: 'Mais reviews', color: 'text-yellow-500' },
    { icon: 'fa-location-dot', label: 'Mais buscas', color: 'text-blue-600 dark:text-blue-400' },
    { icon: 'fa-user-plus', label: 'Mais clientes', color: 'text-green-600 dark:text-green-400' },
  ]

  // Busca o nome diretamente da API para garantir dados atualizados
  const fetchUserName = () => {
    if (isLoggedIn) {
      fetch('/api/auth/user', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            const name = data.user.name || data.user.displayName || ''
            setDisplayName(name)
          }
        })
        .catch(() => {})
    }
  }

  // Busca ao montar apenas uma vez
  useEffect(() => {
    fetchUserName()
  }, [isLoggedIn])

  const finalName = displayName || user?.name || user?.displayName || user?.email || ''

  return (
    <div className="animate-item mb-6">
      <div className="rankify-mobile-hero">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-dark-card/90 px-3 py-1.5 text-[11px] font-extrabold text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-100 dark:ring-dark-border">
          <i className="fa-solid fa-star text-yellow-400" />
          Reputação que gera resultados.
        </div>

        {isLoggedIn ? (
          <>
            <h1 className="mt-5 text-[2rem] font-black leading-[1.1] tracking-tight text-slate-950 dark:text-dark-text">
              {finalName && finalName.trim() !== '' && finalName !== 'Usuário' ? (
                <span>Olá, <span className="text-[#0066ff] dark:text-[#4d94ff]">{finalName}!</span></span>
              ) : (
                <span>Olá, feliz em te ver no Rankify!</span>
              )}
            </h1>
            <p className="mt-2 text-base font-extrabold leading-snug text-blue-700 dark:text-blue-300">
              Bem-vindo de volta.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-[2.15rem] font-black leading-[1.08] tracking-tight text-slate-950 dark:text-dark-text">
              Mais clientes <span className="text-[#0066ff] dark:text-[#4d94ff]">até você.</span>
            </h1>
            <p className="mt-3 text-base font-extrabold leading-snug text-blue-700 dark:text-blue-300">
              Reputação forte. Mais visibilidade. Mais vendas.
            </p>
          </>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          {benefits.map((item) => (
            <div key={item.label} className="rounded-xl bg-white dark:bg-dark-card px-2 py-3 text-center text-[11px] font-bold text-slate-700 dark:text-dark-text shadow-sm ring-1 ring-slate-200 dark:ring-dark-border">
              <i className={`fa-solid ${item.icon} ${item.color} mb-1 block text-base`} />
              {item.label}
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-dark-muted">
          Transforme avaliações em confiança e leve o cliente direto para seu negócio.
        </p>

        <Link href={isLoggedIn ? '/dashboard' : '/login'} className="mt-5 block w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm shadow-lg active:scale-[0.98] transition text-center">
          {isLoggedIn ? 'Ir ao Dashboard' : 'Criar minha conta grátis'}
        </Link>
      </div>
    </div>
  )
}

const mobileRankifyAreas = [
  {
    icon: 'fa-solid fa-star',
    bg: 'bg-yellow-100 dark:bg-yellow-950/30',
    color: 'text-yellow-500',
    title: 'Mais avaliações no Google',
    desc: 'Crie um caminho simples para o cliente avaliar sua empresa depois do atendimento.',
  },
  {
    icon: 'fa-solid fa-qrcode',
    bg: 'bg-blue-100 dark:bg-blue-950/30',
    color: 'text-blue-600 dark:text-blue-400',
    title: 'Página e QR Code prontos',
    desc: 'Centralize contatos, redes sociais e o link de review em uma experiência rápida.',
  },
  {
    icon: 'fa-solid fa-chart-simple',
    bg: 'bg-green-100 dark:bg-green-950/30',
    color: 'text-green-600 dark:text-green-400',
    title: 'Métricas do negócio',
    desc: 'Veja scans, cliques e interações para entender o que gera resultado.',
  },
]

function MobileVideoGuide() {
  return (
    <div className="animate-item mb-6 -mx-4">
      <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl">
        <div className="aspect-video rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-play text-lg ml-0.5" />
            </div>
            <p className="text-xs font-bold">Vídeo passo a passo</p>
          </div>
        </div>
        <h2 className="text-lg font-extrabold leading-tight mb-2">Veja como publicar sua página</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Espaço para explicar cadastro, personalização, QR Code e dashboard em um vídeo curto.
        </p>
      </div>
    </div>
  )
}

function MobileRankifyAreas() {
  return (
    <div className="animate-item mb-6">
      <h2 className="text-lg font-extrabold mb-3 text-slate-900 dark:text-dark-text">O que a Rankify faz</h2>
      <div className="space-y-3">
        {mobileRankifyAreas.map((area) => (
          <div key={area.title} className="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm border border-slate-100 dark:border-dark-border">
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 ${area.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <i className={`${area.icon} ${area.color}`} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-dark-text">{area.title}</h3>
                <p className="text-xs text-slate-500 dark:text-dark-muted leading-relaxed mt-1">{area.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── CTA ── */
function CTAButton() {
  return (
    <div className="animate-item">
      <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition text-sm">
        Começar agora - Grátis 🚀
      </button>
    </div>
  )
}

/* ── BOTTOM NAV ── */
function BottomNav() {
  const pathname = usePathname()
  
  // Verifica se está em modo PWA
  const [isPWA, setIsPWA] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (navigator as any).standalone === true
    setIsPWA(standalone)
  }, [])
  
  // Menu PWA: Dashboard, Páginas, Perfil (sem "Início")
  const pwaNavItems = [
    { href: '/dashboard',               icon: 'fa-chart-pie', label: 'Dashboard' },
    { href: '/dashboard/minhas-paginas', icon: 'fa-link',     label: 'Páginas'   },
    { href: '/dashboard/configuracoes',  icon: 'fa-user',     label: 'Perfil'   },
  ]
  
  // Menu normal: Início, Dashboard, Perfil
  const browserNavItems = [
    { href: '/',          icon: 'fa-house',     label: 'Início'    },
    { href: '/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { href: '/login',     icon: 'fa-user',      label: 'Perfil'    },
  ]
  
  const navItems = isPWA ? pwaNavItems : browserNavItems

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0d1117] backdrop-blur-md border-t border-slate-100 dark:border-dark-border py-2 px-4 z-50 shadow-[0_-10px_30px_-24px_rgba(15,23,42,0.55)] dark:shadow-[0_-12px_34px_-24px_rgba(0,0,0,0.9)]"
      style={isPWA ? { paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 20px))' } : undefined}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 no-underline transition ${
                active ? 'text-blue-600 dark:text-white' : 'text-slate-400 dark:text-white/80'
              }`}
            >
              <i className={`fa-solid ${icon} text-xl`} />
              <span className={`text-[10px] ${active ? 'font-semibold' : ''}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/* ── EXPORT ── */
export function MobileView() {
  const containerRef = useAnimateItems()
  const height = useMobileHeight()

  return (
    <div
      className="bg-slate-50 dark:bg-dark-bg"
      style={{ height, overflowY: 'auto', overflowX: 'hidden' }}
    >
      <MobileHeader />

      <main ref={containerRef} className="px-4 pb-24 pt-4">
        <RankifyMobileHero />
        <RankifyFlow />
        <StatsRow />
        <StepsList />
        <Beneficios />
        <MobileRankifyAreas />
        <CTAButton />
      </main>

      <BottomNav />
    </div>
  )
}
