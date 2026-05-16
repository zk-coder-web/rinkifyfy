'use client'

import { FormEvent, ReactNode, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, CheckCircle, Home, KeyRound,
  Mail, Moon, PieChart, Sun, User, UserPlus, Link as LinkIcon, Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/components/providers/AuthProvider'
import { Logo } from '@/components/ui/Logo'
import { useAction } from '@/hooks/useAction'
import { apiClient, getErrorMessage } from '@/lib/api-client'

type Mode = 'login' | 'register'
type RegisterStep = 'email' | 'verify' | 'password' | 'sent'

export default function LoginPage() {
  return <Suspense><LoginPageInner /></Suspense>
}

function LoginPageInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { setSession, isLoggedIn, booting } = useAuth()

  const [mode, setMode]         = useState<Mode>('login')
  const [regStep, setRegStep]   = useState<RegisterStep>('email')
  const [regEmail, setRegEmail] = useState('')
  const [toast, setToast]       = useState('')
  const [toastOk, setToastOk]   = useState(false)

  const action = useAction({ timeoutMs: 30_000, retries: 1 })

  // Handle after email verification link sent
  useEffect(() => {
    const sent = searchParams.get('sent')
    const email = searchParams.get('email')
    const mode = searchParams.get('mode')
    const created = searchParams.get('created')
    const code = searchParams.get('code')
    
    // Handle Google OAuth callback
    if (code) {
      setToastOk(true)
      setToast('Login bem sucedido!')
      // Armazenar código no localStorage para usar depois
      localStorage.setItem('googleAuthCode', code)
      // Limpar a URL
      window.history.replaceState({}, document.title, '/login')
      return
    }
    
    if (mode === 'register') {
      setMode('register')
    }
    
    if (sent === 'true' && email) {
      setRegStep('sent')
      setRegEmail(email)
    }
    
    // Handle account created successfully
    if (created === 'true') {
      setToastOk(true)
      setToast('Conta criada com sucesso! Faça login para continuar.')
    }
  }, [searchParams])

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'google_cancelled') { setToastOk(false); setToast('Login com Google cancelado.') }
    if (err === 'google_failed')    { setToastOk(false); setToast('Falha no login com Google. Tente novamente.') }
  }, [searchParams])

  // Sync action errors to toast
  useEffect(() => {
    if (action.error) { setToastOk(false); setToast(action.error) }
  }, [action.error])

  if (booting || isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  function showSuccess(msg: string) { setToastOk(true); setToast(msg) }
  function clearToast()             { setToast('') }

  /* ── Login ── */
  async function submitLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearToast()
    const fd = new FormData(e.currentTarget)

    await action.run(async (signal) => {
      const data = await apiClient.post<{ user: typeof setSession extends (u: infer U) => void ? U : never }>(
        '/api/auth/login',
        {
          email:    String(fd.get('email')    || '').trim().toLowerCase(),
          password: String(fd.get('password') || ''),
        },
        { signal }
      )
      setSession(data.user)
      
      // Verifica se está em modo PWA para redirecionar corretamente
      const isPWA = typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches || 
        (navigator as any).standalone === true
      )
      
      // Se for PWA, sempre redireciona para o dashboard
      router.replace('/dashboard')
    })
  }

  /* ── Register step 1: send verification link ── */
  async function submitSendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearToast()
    const fd    = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '').trim().toLowerCase()

    await action.run(async (signal) => {
      await apiClient.post('/api/auth/send-code', { email }, { signal })
      setRegEmail(email)
      // Redirect to show sent page
      router.push(`/login?mode=register&sent=true&email=${encodeURIComponent(email)}`)
    })
  }

  /* ── Register step 2: verify link clicked (user clicks link -> comes to this step) ── */
  async function submitVerifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearToast()
    const fd   = new FormData(e.currentTarget)
    const code = String(fd.get('code') || '').trim()

    await action.run(async (signal) => {
      await apiClient.post('/api/auth/verify-code', { email: regEmail, code }, { signal })
      setRegStep('password')
      showSuccess('E-mail verificado! Crie sua senha.')
    })
  }

  /* ── Register step 3: create password ── */
  async function submitRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearToast()
    const fd       = new FormData(e.currentTarget)
    const password = String(fd.get('password') || '')
    const confirm  = String(fd.get('confirm')  || '')

    if (password.length < 8) { setToastOk(false); setToast('A senha deve ter no mínimo 8 caracteres.'); return }
    if (password !== confirm) { setToastOk(false); setToast('As senhas não coincidem.'); return }

    await action.run(async (signal) => {
      const data = await apiClient.post<{ user: Parameters<typeof setSession>[0] }>(
        '/api/auth/register',
        { email: regEmail, password },
        { signal }
      )
      setSession(data.user)
      
      // Verifica se está em modo PWA para redirecionar corretamente
      const isPWA = typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches || 
        (navigator as any).standalone === true
      )
      
      // Se for PWA, sempre redireciona para o dashboard
      router.replace('/dashboard')
    })
  }

  const form = (
    <LoginForm
      loading={action.loading}
      mode={mode}
      regStep={regStep}
      regEmail={regEmail}
      toast={toast}
      toastOk={toastOk}
      onModeChange={(m) => { setMode(m); clearToast(); setRegStep('email'); action.reset() }}
      onSubmitLogin={submitLogin}
      onSubmitSendCode={submitSendCode}
      onSubmitVerifyCode={submitVerifyCode}
      onSubmitRegister={submitRegister}
      onResendCode={() => { setRegStep('email'); clearToast(); action.reset() }}
    />
  )

  return (
    <>
      <DesktopLogin>{form}</DesktopLogin>
      <MobileLogin>{form}</MobileLogin>
    </>
  )
}

/* ── Theme button ── */
function ThemeButton({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`grid place-items-center rounded-full bg-white/80 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-white dark:bg-dark-card dark:text-slate-200 dark:ring-dark-border ${className}`}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}>
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

function DesktopLogin({ children }: { children: ReactNode }) {
  return (
    <main className="hidden min-h-screen bg-slate-50 text-slate-950 dark:bg-dark-bg dark:text-dark-text md:block">
      <nav className="fixed left-0 top-0 z-50 w-full px-6 py-4">
        <div className="glass mx-auto flex max-w-7xl items-center justify-between rounded-3xl px-6 py-3 shadow-sm">
          <Logo size="md" />
          <ThemeButton className="h-10 w-10" />
        </div>
      </nav>
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-[1.05fr_0.95fr] items-center gap-12 px-6 pb-12 pt-32">
        <div className="rankify-hero-card">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-dark-card/90 dark:text-blue-300 dark:ring-dark-border">
            <UserPlus className="h-4 w-4" />
            Acesse sua área Rankify
          </div>
          <h1 className="mt-8 max-w-2xl text-5xl font-black leading-tight tracking-tight text-slate-950 dark:text-dark-text">
            Entre para acompanhar reputação, cliques e crescimento.
          </h1>
          <p className="mt-5 max-w-xl text-lg font-semibold leading-relaxed text-slate-600 dark:text-dark-muted">
            Cadastro seguro com verificação por e-mail. Login com Google disponível.
          </p>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {['Reviews', 'QR Code', 'Métricas'].map((item) => (
              <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-dark-card dark:text-dark-text dark:ring-dark-border">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto w-full max-w-md">{children}</div>
      </section>
    </main>
  )
}

function MobileLogin({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-bg dark:text-dark-text md:hidden">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/95">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <ThemeButton className="h-9 w-9" />
        </div>
      </header>
      <main className="px-4 pb-24 pt-5">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/95 px-4 py-2 backdrop-blur-md dark:border-dark-border dark:bg-[#0d1117]">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {[
            { href: '/',          icon: Home,     label: 'Início'    },
            { href: '/dashboard', icon: PieChart, label: 'Dashboard' },
            { href: '/login',     icon: User,     label: 'Perfil', active: true },
          ].map(({ href, icon: Icon, label, active }) => (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 no-underline transition ${active ? 'text-blue-600 dark:text-white' : 'text-slate-400 dark:text-white/80'}`}>
              <Icon className="h-5 w-5" />
              <span className={`text-[10px] ${active ? 'font-semibold' : ''}`}>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}

/* ── Form card ── */
function LoginForm({
  loading, mode, regStep, regEmail, toast, toastOk,
  onModeChange, onSubmitLogin, onSubmitSendCode,
  onSubmitVerifyCode, onSubmitRegister, onResendCode,
}: {
  loading: boolean; mode: Mode; regStep: RegisterStep; regEmail: string
  toast: string; toastOk: boolean
  onModeChange: (m: Mode) => void
  onSubmitLogin: (e: FormEvent<HTMLFormElement>) => void
  onSubmitSendCode: (e: FormEvent<HTMLFormElement>) => void
  onSubmitVerifyCode: (e: FormEvent<HTMLFormElement>) => void
  onSubmitRegister: (e: FormEvent<HTMLFormElement>) => void
  onResendCode: () => void
}) {
  return (
    <div className="w-full rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-2xl shadow-blue-950/10 ring-1 ring-blue-100/70 backdrop-blur-xl dark:border-dark-border dark:bg-dark-card/90 dark:ring-dark-border md:p-7">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 shadow-lg shadow-blue-900/30">
          <User className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white">Rankify</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-dark-muted">
          {mode === 'login' ? 'Entre na sua conta.' : 'Crie sua conta gratuitamente.'}
        </p>
      </div>

      {toast && (
        <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${toastOk ? 'border-green-400/20 bg-green-400/10 text-green-700 dark:text-green-300' : 'border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-300'}`}>
          {toast}
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-950/70">
        <button type="button" disabled={loading} onClick={() => onModeChange('login')}
          className={`rounded-xl py-2.5 text-sm font-bold transition disabled:opacity-60 ${mode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
          Entrar
        </button>
        <button type="button" disabled={loading} onClick={() => onModeChange('register')}
          className={`rounded-xl py-2.5 text-sm font-bold transition disabled:opacity-60 ${mode === 'register' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
          Criar conta
        </button>
      </div>

      {mode === 'login' && (
        <div className="space-y-4">
          <form onSubmit={onSubmitLogin} className="space-y-3">
            <Field name="email" type="email" label="E-mail" placeholder="seu@email.com" icon="email" disabled={loading} />
            <PasswordField name="password" label="Senha" placeholder="Mínimo 8 caracteres" disabled={loading} />
            <SubmitBtn loading={loading} label="Entrar" loadingLabel="Entrando..." icon={<ArrowRight className="h-4 w-4" />} />
          </form>
          <div className="text-center">
            <Link href="/recuperar-acesso" className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Esqueci minha senha
            </Link>
          </div>
          <Divider />
          <GoogleBtn label="Continuar com Google" />
        </div>
      )}

      {mode === 'register' && (
        <div>
          {regStep !== 'sent' && <StepIndicator current={regStep} />}

          {regStep === 'email' && (
            <form onSubmit={onSubmitSendCode} className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
                Informe seu e-mail para receber o link de verificação.
              </p>
              <Field name="email" type="email" label="E-mail" placeholder="seu@email.com" icon="email" disabled={loading} />
              <SubmitBtn loading={loading} label="Enviar link de verificação" loadingLabel="Enviando..." icon={<Mail className="h-4 w-4" />} />
              <Divider />
              <GoogleBtn label="Cadastrar com Google" />
            </form>
          )}

          {regStep === 'sent' && (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-dark-text">
                Link enviado!
              </h2>
              <p className="text-sm text-slate-500 dark:text-dark-muted">
                Enviamos um link de verificação para<br />
                <strong className="text-slate-700 dark:text-dark-text">{regEmail}</strong>
              </p>
              <p className="text-xs text-slate-400 dark:text-dark-subtle">
                Clique no link do e-mail para verificar sua conta.
              </p>
              <button 
                type="button" 
                onClick={onResendCode}
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Usar outro e-mail
              </button>
            </div>
          )}

          {regStep === 'verify' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                      Verifique sua caixa de entrada
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Enviamos um link de verificação para{' '}
                      <strong>{regEmail}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-dark-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-dark-card px-2 text-slate-400">ou</span>
                </div>
              </div>

              <form onSubmit={onSubmitVerifyCode} className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
                  Já verificou? Insira o código recebido (alternativo)
                </p>
                <Field name="code" type="text" label="Código de verificação" placeholder="000000" icon="email" disabled={loading} />
                <SubmitBtn loading={loading} label="Verificar código" loadingLabel="Verificando..." icon={<CheckCircle className="h-4 w-4" />} />
              </form>

              <button type="button" disabled={loading} onClick={onResendCode}
                className="w-full text-center text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 disabled:opacity-50">
                Não recebi o link — reenviar
              </button>
            </div>
          )}

          {regStep === 'password' && (
            <form onSubmit={onSubmitRegister} className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
                Crie uma senha segura para sua conta.
              </p>
              <PasswordField name="password" label="Senha" placeholder="Mínimo 8 caracteres" disabled={loading} />
              <PasswordField name="confirm" label="Confirmar senha" placeholder="Repita a senha" disabled={loading} />
              <SubmitBtn loading={loading} label="Criar conta" loadingLabel="Criando conta..." icon={<UserPlus className="h-4 w-4" />} />
            </form>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ── */
function StepIndicator({ current }: { current: RegisterStep }) {
  const steps: RegisterStep[] = ['email', 'verify', 'password']
  // Map 'sent' to 'verify' for the indicator
  const displayStep = current === 'sent' ? 'verify' : current
  const idx = steps.indexOf(displayStep)
  return (
    <div className="mb-5 flex items-center justify-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition ${i === idx ? 'bg-blue-600 text-white' : i < idx ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-dark-border dark:text-dark-muted'}`}>
            {i < idx ? <CheckCircle className="h-4 w-4" /> : i + 1}
          </div>
          {i < 2 && <div className="h-px w-6 bg-slate-200 dark:bg-dark-border" />}
        </div>
      ))}
    </div>
  )
}

function Field({ name, type, label, placeholder, icon, disabled }: {
  name: string; type: string; label: string; placeholder: string
  icon?: 'email' | 'password'; disabled?: boolean
}) {
  const Icon = icon === 'email' ? Mail : KeyRound
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-300">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input required name={name} type={type} placeholder={placeholder} disabled={disabled}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 disabled:opacity-60 dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500" />
      </div>
    </label>
  )
}

function PasswordField({ name, label, placeholder, disabled }: {
  name: string; label: string; placeholder: string; disabled?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-300">{label}</span>
      <div className="relative">
        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input required name={name} type={show ? 'text' : 'password'} placeholder={placeholder} disabled={disabled}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 pr-11 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 disabled:opacity-60 dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500" />
        <button type="button" onClick={() => setShow(!show)} disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition disabled:opacity-50"
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
          {show
            ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
            : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          }
        </button>
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
       
      
      </p>
    </label>
  )
}

function SubmitBtn({ loading, label, loadingLabel, icon }: {
  loading: boolean; label: string; loadingLabel: string; icon: ReactNode
}) {
  return (
    <button disabled={loading} type="submit"
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-400 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-900/30 disabled:opacity-70 transition">
      {loading
        ? <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />{loadingLabel}</>
        : <>{label}{icon}</>
      }
    </button>
  )
}

function Divider() {
  return (
    <div className="relative flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200 dark:bg-dark-border" />
      <span className="text-xs font-semibold text-slate-400">ou</span>
      <div className="h-px flex-1 bg-slate-200 dark:bg-dark-border" />
    </div>
  )
}

function GoogleBtn({ label }: { label: string }) {
  return (
    <a href="/api/auth/google"
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-dark-border dark:bg-dark-card dark:text-dark-text dark:hover:bg-dark-border">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {label}
    </a>
  )
}
