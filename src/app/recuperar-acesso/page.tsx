'use client'

import { FormEvent, ReactNode, Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle, KeyRound, Lock, Mail, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Logo } from '@/components/ui/Logo'

type Step = 'email' | 'code' | 'password' | 'done'

async function apiPost(path: string, body: object) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro desconhecido.')
  return data
}

export default function RecuperarAcessoPage() {
  return (
    <Suspense>
      <RecuperarAcessoInner />
    </Suspense>
  )
}

function RecuperarAcessoInner() {
  const router = useRouter()
  const [step, setStep]       = useState<Step>('email')
  const [email, setEmail]     = useState('')
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState('')
  const [toastOk, setToastOk] = useState(false)

  function showError(msg: string)   { setToastOk(false); setToast(msg); setLoading(false) }
  function showSuccess(msg: string) { setToastOk(true);  setToast(msg); setLoading(false) }

  /* Step 1 — send recovery email */
  async function submitEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setToast('')
    const fd  = new FormData(e.currentTarget)
    const em  = String(fd.get('email') || '').trim().toLowerCase()
    try {
      await apiPost('/api/auth/recovery/send', { email: em })
      setEmail(em)
      setStep('code')
      showSuccess('E-mail enviado! Verifique sua caixa de entrada.')
    } catch (err: unknown) { showError(err instanceof Error ? err.message : 'Erro ao enviar.') }
  }

  /* Step 2 — verify code (just UI step, actual validation happens on reset) */
  function submitCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const c  = String(fd.get('code') || '').trim()
    if (!c) return showError('Informe o código.')
    setCode(c)
    setStep('password')
    setToast('')
  }

  /* Step 3 — reset password */
  async function submitReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setToast('')
    const fd       = new FormData(e.currentTarget)
    const pin      = String(fd.get('pin')      || '').trim()
    const password = String(fd.get('password') || '')
    const confirm  = String(fd.get('confirm')  || '')

    if (password.length < 8) return showError('A senha deve ter no mínimo 8 caracteres.')
    if (password !== confirm) return showError('As senhas não coincidem.')

    try {
      await apiPost('/api/auth/recovery/reset', { email, code, pin, password })
      setStep('done')
      setToast('')
    } catch (err: unknown) { showError(err instanceof Error ? err.message : 'Erro ao redefinir.') }
  }

  const stepLabels: Step[] = ['email', 'code', 'password']
  const stepIdx = stepLabels.indexOf(step)

  return (
    <Layout>
      <div className="w-full max-w-md mx-auto">

        {/* Back */}
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-dark-muted hover:text-slate-900 dark:hover:text-dark-text transition mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>

        <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 ring-1 ring-blue-100/70 backdrop-blur-xl dark:border-dark-border dark:bg-dark-card/90 dark:ring-dark-border">

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-950 dark:text-white">Recuperação de Acesso</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-dark-muted">
              Redefina sua senha com segurança.
            </p>
          </div>

          {/* Step indicator */}
          {step !== 'done' && (
            <div className="mb-5 flex items-center justify-center gap-2">
              {stepLabels.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition ${
                    i === stepIdx ? 'bg-blue-600 text-white'
                    : i < stepIdx ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-500 dark:bg-dark-border dark:text-dark-muted'
                  }`}>
                    {i < stepIdx ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < 2 && <div className="h-px w-6 bg-slate-200 dark:bg-dark-border" />}
                </div>
              ))}
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              toastOk
                ? 'border-green-400/20 bg-green-400/10 text-green-700 dark:text-green-300'
                : 'border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-300'
            }`}>
              {toast}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={submitEmail} className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
                Informe o e-mail da sua conta. Enviaremos o código de verificação e seu PIN.
              </p>
              <InputField name="email" type="email" label="E-mail" placeholder="seu@email.com" icon="email" />
              <SubmitBtn loading={loading} label="Enviar e-mail" loadingLabel="Enviando..." icon={<Mail className="w-4 h-4" />} />
            </form>
          )}

          {/* Step 2: Code */}
          {step === 'code' && (
            <form onSubmit={submitCode} className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
                Enviamos um código de 6 dígitos para <strong className="text-slate-700 dark:text-dark-text">{email}</strong>.
              </p>
              <InputField name="code" type="text" label="Código de verificação" placeholder="000000" icon="email" />
              <SubmitBtn loading={false} label="Continuar" loadingLabel="" icon={<ArrowRight className="w-4 h-4" />} />
              <button type="button" onClick={() => { setStep('email'); setToast('') }}
                className="w-full text-center text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
                Reenviar código
              </button>
            </form>
          )}

          {/* Step 3: PIN + new password */}
          {step === 'password' && (
            <form onSubmit={submitReset} className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
                Insira seu PIN de segurança (enviado no e-mail) e crie uma nova senha.
              </p>
              <InputField name="pin" type="text" label="PIN de Segurança" placeholder="RKF-0000-X0" icon="pin" mono />
              <PasswordInputField name="password" label="Nova senha" placeholder="Mínimo 8 caracteres" />
              <PasswordInputField name="confirm" label="Confirmar nova senha" placeholder="Repita a senha" />
              <SubmitBtn loading={loading} label="Redefinir senha" loadingLabel="Salvando..." icon={<CheckCircle className="w-4 h-4" />} />
            </form>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-dark-text">Senha redefinida!</h2>
                <p className="text-sm text-slate-500 dark:text-dark-muted mt-1">
                  Sua senha foi atualizada com sucesso.
                </p>
              </div>
              <button onClick={() => router.replace('/login')}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-black text-white hover:bg-blue-700 transition">
                Ir para o login
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </Layout>
  )
}

/* ── Layout wrapper ── */
function Layout({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-dark-text">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <button type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-dark-card flex items-center justify-center transition hover:bg-slate-200 dark:hover:bg-dark-border"
            aria-label="Alternar tema">
            {isDark ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>
      <main className="px-4 py-10">{children}</main>
    </div>
  )
}

/* ── Field components ── */
function InputField({ name, type, label, placeholder, icon, mono }: {
  name: string; type: string; label: string; placeholder: string
  icon: 'email' | 'pin'; mono?: boolean
}) {
  const Icon = icon === 'email' ? Mail : KeyRound
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-300">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input required name={name} type={type} placeholder={placeholder}
          className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 ${mono ? 'font-mono tracking-widest' : ''}`} />
      </div>
    </label>
  )
}

function PasswordInputField({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  const [show, setShow] = useState(false)
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-300">{label}</span>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input required name={name} type={show ? 'text' : 'password'} placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 pr-11 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500" />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
          {show
            ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          }
        </button>
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <svg className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Guarde sua senha com segurança. Após a criação, ela não poderá ser visualizada novamente.
      </p>
    </label>
  )
}

function SubmitBtn({ loading, label, loadingLabel, icon }: { loading: boolean; label: string; loadingLabel: string; icon: ReactNode }) {
  return (
    <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-400 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-900/30 disabled:opacity-70 transition">
      {loading
        ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />{loadingLabel}</>
        : <>{label}{icon}</>
      }
    </button>
  )
}
