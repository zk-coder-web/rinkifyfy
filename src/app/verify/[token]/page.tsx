'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CheckCircle, Loader2, Lock, Mail, XCircle } from 'lucide-react'

function VerifyContent() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string
  
  const [status, setStatus] = useState<'loading' | 'verified' | 'error'>('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; general?: string }>({})

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    async function verifyToken() {
      try {
        const res = await fetch(`/api/auth/verify-token?token=${token}`, {
          method: 'GET',
          credentials: 'include',
        })
        
        const data = await res.json()
        
        if (res.ok && data.verified) {
          setStatus('verified')
          setEmail(data.email)
        } else {
          setStatus('error')
        }
      } catch (error) {
        setStatus('error')
      }
    }

    const timer = setTimeout(() => {
      verifyToken()
    }, 1500)

    return () => clearTimeout(timer)
  }, [token])

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!password) {
      newErrors.password = 'Senha obrigatória'
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres'
    }
    
    if (!confirm) {
      newErrors.confirm = 'Confirme sua senha'
    } else if (password !== confirm) {
      newErrors.confirm = 'As senhas não coincidem'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoadingSubmit(true)
    setErrors({})

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password,
          verified: true 
        }),
      })

      const result = await res.json()

      if (res.ok) {
        // Redirect to login with success message
        router.push(`/login?created=true&email=${encodeURIComponent(email)}`)
      } else {
        setErrors({ general: result.error || 'Erro ao criar conta.' })
      }
    } catch (error) {
      setErrors({ general: 'Erro ao conectar. Tente novamente.' })
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg px-4 py-8">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg dark:bg-dark-card">
          {status === 'loading' && (
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          )}
          {status === 'verified' && (
            <CheckCircle className="h-10 w-10 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="h-10 w-10 text-red-500" />
          )}
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-black text-slate-900 dark:text-dark-text text-center">
          {status === 'loading' && 'Verificando...'}
          {status === 'verified' && 'Conta Verificada!'}
          {status === 'error' && 'Verificação Falhou'}
        </h1>

        {/* Message */}
        <p className="mb-8 text-sm text-slate-500 dark:text-dark-muted text-center">
          {status === 'loading' && 'Aguarde enquanto verificamos seu e-mail...'}
          {status === 'verified' && 'E-mail verificado com sucesso! Agora crie sua senha.'}
          {status === 'error' && 'Link de verificação inválido ou expirado.'}
        </p>

        {/* Loading animation */}
        {status === 'loading' && (
          <div className="mb-6 flex justify-center gap-2">
            <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: '0ms' }} />
            <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: '150ms' }} />
            <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Create Password Form */}
        {status === 'verified' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-300">
                E-mail
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/80">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-900 dark:text-dark-text">{email}</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-300">
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 dark:border-white/10 dark:bg-slate-950/80 dark:text-white"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-300">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 dark:border-white/10 dark:bg-slate-950/80 dark:text-white"
                />
              </div>
              {errors.confirm && (
                <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>
              )}
            </div>

            {errors.general && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              disabled={loadingSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-400 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-900/30 disabled:opacity-70 transition hover:from-blue-700 hover:to-cyan-500"
            >
              {loadingSubmit ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Criar conta
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400">
              Após criar, você será redirecionado para fazer login.
            </p>
          </form>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-700"
            >
              Ir para Login
            </button>
            <div className="text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Solicitar novo link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}