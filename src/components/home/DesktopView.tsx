'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { RankifyFlow } from '@/components/home/RankifyFlow'
import { useAuth } from '@/components/providers/AuthProvider'

/* NAVBAR */
function Navbar() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const { user, isLoggedIn } = useAuth()

  return (
    <nav className="fixed w-full z-[100] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-3xl px-6 py-3 shadow-sm">
        <Logo size="md" />

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-dark-muted">
          <a href="#funciona" className="hover:text-blue-600 transition">Como funciona</a>
          <a href="#recursos" className="hover:text-blue-600 transition">Recursos</a>
          <a href="#recursos" className="hover:text-blue-600 transition">Preços</a>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              {user?.displayName && user.displayName.trim() !== '' && user.displayName !== 'Usuário' ? user.displayName : user?.email}
            </Link>
          ) : (
            <Link href="/login" className="hidden sm:block px-5 py-2 text-sm font-bold text-slate-700 dark:text-dark-text hover:bg-white/50 rounded-xl transition">
              Entrar
            </Link>
          )}

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full bg-white/70 dark:bg-dark-card flex items-center justify-center transition hover:bg-white/90 dark:hover:bg-dark-border ring-1 ring-white/60 dark:ring-dark-border"
            aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          >
            {isDark ? <Sun className="w-4 h-4 text-blue-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-xl"
            >
              Acessar Dashboard
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          ) : (
            <Link href="/login" className="px-6 py-2.5 text-sm font-bold bg-slate-900 dark:bg-blue-600 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition shadow-xl">
              Começar agora
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
/* HERO */
function Hero() {
  return (
    <section className="bg-white dark:bg-dark-bg pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="hidden">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-bold text-blue-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            Otimizado para o algoritmo de 2026
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-dark-text">
            Não seja apenas mais um. Seja o{' '}
            <span className="gradient-text">Nº 1 no Google.</span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-dark-muted leading-relaxed max-w-xl">
            Centralize suas avaliações, redes sociais e contatos em uma{' '}
            <span className="font-bold text-slate-900 dark:text-dark-text">página ultraveloz</span>{' '}
            desenhada para converter curiosos em clientes fiéis.
          </p>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[8, 12, 25].map((u) => (
                <Image
                  key={u}
                  className="w-10 h-10 rounded-full border-4 border-white shadow-sm"
                  src={`https://i.pravatar.cc/100?u=${u}`}
                  alt="Avatar"
                  width={40}
                  height={40}
                />
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-dark-muted">
              Aprovado por{' '}
              <span className="font-bold text-slate-900 dark:text-dark-text">+2.500 donos de negócios</span>
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl border border-slate-200 dark:border-dark-border overflow-hidden p-2">
            <Image
              src="/assets/lg.png"
              alt="Banner Rankify"
              width={1400}
              height={900}
              className="w-full h-auto rounded-lg"
              priority
            />
          </div>
          <Link href="/login" className="mt-6 mx-auto max-w-md w-full bg-blue-600 text-white font-bold rounded-xl py-4 text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3">
            Criar minha página grátis
            <i className="fa-solid fa-chevron-right text-sm" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* COMO FUNCIONA */
const steps = [
  { n: 1, title: 'Cadastre sua empresa',   desc: 'Nome, categoria e link do Google Maps.' },
  { n: 2, title: 'Personalize sua página', desc: 'Logo, cores, WhatsApp e Instagram.'      },
  { n: 3, title: 'Gere o QR Code',         desc: 'Baixe em alta resolução para imprimir.'  },
  { n: 4, title: 'Acompanhe métricas',     desc: 'Scans, cliques e relatórios.'            },
]

function ComoFunciona() {
  return (
    <section id="funciona" className="py-24 px-6 bg-white dark:bg-dark-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-600">
            <i className="fa-solid fa-play text-xs" />
            <span>Passo a passo simples</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-dark-text">
            Sua jornada para o <span className="gradient-text">topo do Google</span>
          </h2>
          <p className="text-slate-500 dark:text-dark-muted max-w-2xl mx-auto mt-4">
            Em apenas 4 passos, você transforma sua presença online.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {steps.map(({ n, title, desc }) => (
            <div
              key={n}
              className="card-3d bg-gradient-to-br from-white to-slate-50 dark:from-dark-card dark:to-dark-bg rounded-2xl p-6 border border-slate-200 dark:border-dark-border shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-5 bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg">
                {n}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-dark-text">{title}</h3>
              <p className="text-slate-500 dark:text-dark-muted">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl p-12 mb-16 text-center">
          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-dark-text">+120% de avaliações em média</h3>
          <p className="text-slate-600 dark:text-dark-muted">
            Empresas que usam Rankify aumentam significativamente suas avaliações no Google.
          </p>
        </div>

      </div>
    </section>
  )
}

function RankifyHero() {
  const { user, isLoggedIn } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const benefits = ['Mais avaliações', 'Melhor reputação', 'Mais visibilidade', 'Mais clientes']

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

  const finalName = displayName || user?.name || user?.displayName || ''

  return (
    <section className="bg-white dark:bg-dark-bg pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="rankify-hero-card">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/85 dark:bg-dark-card/90 px-4 py-2 text-sm font-extrabold text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-100 dark:ring-dark-border">
                <i className="fa-solid fa-star text-yellow-400" />
                Reputação que gera resultados.
              </div>

              {isLoggedIn ? (
                <>
                  {/* Saudação com nome em uma linha */}
                  <h1 className="mt-10 max-w-3xl text-5xl md:text-7xl font-black leading-[1.16] tracking-tight text-slate-950 dark:text-dark-text">
                    {finalName && finalName.trim() !== '' && finalName !== 'Usuário' ? (
                      <span>Olá, <span className="text-[#0066ff] dark:text-[#4d94ff]">{finalName}!</span></span>
                    ) : (
                      <span>Olá, feliz em te ver no Rankify!</span>
                    )}
                  </h1>
                  <p className="mt-4 max-w-2xl text-xl md:text-2xl font-extrabold leading-tight text-blue-700">
                    Bem-vindo de volta.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="mt-10 max-w-3xl text-5xl md:text-7xl font-black leading-[1.16] tracking-tight text-slate-950 dark:text-dark-text">
                    <span className="block">Mais clientes chegando</span>
                    <span className="mt-3 block text-[#0066ff] dark:text-[#4d94ff]">até você.</span>
                  </h1>
                  <p className="mt-6 max-w-2xl text-2xl md:text-3xl font-extrabold leading-tight text-blue-700">
                    Melhore sua reputação. Apareça mais. Venda mais!
                  </p>
                </>
              )}

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-dark-muted">
                Rankify impulsiona seu negócio com mais avaliações e visibilidade para você conquistar mais clientes todos os dias.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {benefits.map((item) => (
                  <span key={item} className="rounded-full bg-white dark:bg-dark-card px-4 py-2 text-sm font-bold text-slate-700 dark:text-dark-text shadow-sm ring-1 ring-slate-200 dark:ring-dark-border">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rankify-hero-visual">
              <Image
                src="/assets/model.png"
                alt="Modelo visual Rankify"
                width={720}
                height={640}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>

          <Link href={isLoggedIn ? '/dashboard' : '/login'} className="mt-10 max-w-md w-full bg-blue-600 text-white font-bold rounded-xl py-4 text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-200 flex items-center justify-center gap-3">
            {isLoggedIn ? 'Ir ao Dashboard' : 'Criar minha página grátis'}
            <i className="fa-solid fa-arrow-right text-sm" />
          </Link>
        </div>
      </div>
    </section>
  )
}

const companyAreas = [
  {
    title: 'Transforma atendimento em avaliações',
    desc: 'O Rankify organiza o pedido de review no momento certo, com uma página simples para o cliente abrir o Google, avaliar e concluir sem fricção.',
    metric: 'Mais reviews',
    accent: 'from-blue-600 to-cyan-500',
    icon: 'reviews',
  },
  {
    title: 'Cria uma vitrine digital para cada negócio',
    desc: 'Sua empresa ganha uma página rápida com logo, contatos, WhatsApp, Instagram e chamadas claras para converter visitantes em clientes reais.',
    metric: 'Link único',
    accent: 'from-slate-900 to-blue-700',
    icon: 'page',
  },
  {
    title: 'Mostra o que está funcionando',
    desc: 'O painel acompanha scans, cliques e interações para você saber quais canais trazem movimento e onde vale reforçar a estratégia.',
    metric: 'Dados claros',
    accent: 'from-emerald-600 to-blue-600',
    icon: 'analytics',
  },
]

function AreaIcon({ type }: { type: string }) {
  if (type === 'reviews') {
    return (
      <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" aria-hidden="true">
        <rect x="20" y="24" width="80" height="62" rx="14" className="fill-blue-50 dark:fill-blue-950/30" />
        <path d="M36 45h48M36 59h32M36 73h22" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="6" strokeLinecap="round" />
        <path d="M82 78l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2 5-10z" className="fill-yellow-400" />
      </svg>
    )
  }

  if (type === 'page') {
    return (
      <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" aria-hidden="true">
        <rect x="28" y="16" width="64" height="88" rx="16" className="fill-slate-900 dark:fill-dark-border" />
        <rect x="38" y="30" width="44" height="8" rx="4" className="fill-blue-400" />
        <rect x="38" y="48" width="44" height="22" rx="8" className="fill-white/90 dark:fill-dark-card" />
        <path d="M43 84h34" className="stroke-emerald-400" strokeWidth="7" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" aria-hidden="true">
      <rect x="18" y="20" width="84" height="76" rx="18" className="fill-emerald-50 dark:fill-emerald-950/20" />
      <path d="M36 76V58M60 76V42M84 76V50" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="10" strokeLinecap="round" />
      <path d="M33 42l18 10 19-22 18 10" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function VideoWalkthrough() {
  return (
    <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
      <div className="aspect-video rounded-2xl bg-slate-950 border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-blue-900/40">
            <i className="fa-solid fa-play text-2xl ml-1" />
          </div>
          <p className="text-sm font-bold text-white">Vídeo passo a passo</p>
          <p className="text-xs text-slate-400 mt-1">Espaço reservado para demonstração</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-blue-300 mb-3">Como o Rankify funciona na prática</p>
        <h3 className="text-3xl font-extrabold leading-tight mb-4">Do QR Code ao review no Google, em poucos cliques.</h3>
        <p className="text-slate-300 leading-relaxed">
          Use esta área para colocar um vídeo curto mostrando cadastro, personalização da página,
          geração do QR Code e leitura dos resultados no dashboard.
        </p>
      </div>
    </div>
  )
}

function Recursos() {
  return (
    <section id="recursos" className="py-24 px-6 bg-slate-50 dark:bg-dark-bg">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <p className="text-sm font-bold text-blue-600 mb-3">O que a Rankify faz</p>
          <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-dark-text max-w-3xl">
            Uma operação simples para melhorar reputação, presença e conversão local.
          </h3>
        </div>

        <div className="space-y-6">
          {companyAreas.map((area, index) => (
            <div
              key={area.title}
              className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-8 grid md:grid-cols-[180px_1fr_auto] gap-8 items-center shadow-sm"
            >
              <div className="flex justify-center md:justify-start">
                <AreaIcon type={area.icon} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-9 h-9 rounded-full bg-gradient-to-br ${area.accent} text-white flex items-center justify-center text-sm font-black`}>
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-dark-subtle">{area.metric}</span>
                </div>
                <h4 className="text-2xl font-extrabold text-slate-900 dark:text-dark-text mb-3">{area.title}</h4>
                <p className="text-slate-600 dark:text-dark-muted leading-relaxed">{area.desc}</p>
              </div>
              <i className="fa-solid fa-arrow-right text-slate-300 dark:text-dark-subtle hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* FOOTER */
function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-card pt-20 pb-10 px-6 border-t border-slate-100 dark:border-dark-border">
      <div className="max-w-7xl mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <Logo size="sm" />
        </div>
        <p className="text-slate-500 dark:text-dark-muted max-w-md mx-auto">
          A plataforma líder em gestão de reputação online.
        </p>
        <div className="pt-8 border-t border-slate-100 dark:border-dark-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400 dark:text-dark-subtle">
          <p>© 2026 Rankify Tecnologia Ltda.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-600 transition">Termos</a>
            <a href="#" className="hover:text-blue-600 transition">Privacidade</a>
          </div>
          <p>Otimizado para SEO</p>
        </div>
      </div>
    </footer>
  )
}

/* EXPORT */
export function DesktopView() {
  return (
    <div className="bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <RankifyHero />
      <RankifyFlow />
      <ComoFunciona />
      <Recursos />
      <Footer />
    </div>
  )
}

