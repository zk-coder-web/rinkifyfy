'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Calendar, Check, Crown, LogOut, 
  Shield, Trash2, Clock, Sparkles
} from 'lucide-react'
import { AppShell } from '@/components/app/AppShell'
import { useAuth } from '@/components/providers/AuthProvider'

interface UserDetails {
  id: number
  email: string
  name: string
  displayName: string
  provider: string
  verified: boolean
  createdAt: string
  createdTime: string
}



/* ── Name Input with Auto-save ── */
function NameInput({ 
  initialName, 
  onSave 
}: { 
  initialName: string
  onSave: (name: string) => void 
}) {
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [lastSavedName, setLastSavedName] = useState(initialName)

  // Atualiza o nome inicial quando recebe novo valor
  useEffect(() => {
    setName(initialName)
    setLastSavedName(initialName)
  }, [initialName])

  useEffect(() => {
    // Se o nome não mudou, não faz nada
    if (name === lastSavedName) return
    
    const timer = setTimeout(async () => {
      setSaving(true)
      try {
        onSave(name)
        setLastSavedName(name)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch (error) {
        console.error('Erro ao salvar nome:', error)
        // Reverte para o último nome salvo em caso de erro
        setName(lastSavedName)
      } finally {
        setSaving(false)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [name, lastSavedName, onSave])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite seu nome"
          className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-dark-border text-sm font-semibold text-slate-900 dark:text-dark-text outline-none placeholder:text-slate-400 rounded-lg border border-slate-200 dark:border-dark-border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {saving && <Clock className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />}
        {!saving && saved && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
      </div>
      <p className="text-xs text-slate-400 dark:text-dark-muted">
        {saving ? 'Salvando...' : saved ? 'Salvo com sucesso!' : ''}
      </p>
    </div>
  )
}

/* ── Loading overlay ── */
function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-white/20" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-white border-t-transparent animate-spin" />
      </div>
      <p className="text-white font-bold text-sm">{label}</p>
    </div>
  )
}

/* ── Confirm modal ── */
function ConfirmModal({ title, description, confirmLabel, danger, onConfirm, onCancel }: {
  title: string; description: string; confirmLabel: string
  danger?: boolean; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-5 shadow-2xl">
        <h3 className="text-base font-black text-slate-900 dark:text-dark-text mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-dark-muted mb-4 leading-relaxed">{description}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 dark:border-dark-border py-2 text-sm font-bold text-slate-600 dark:text-dark-muted hover:bg-slate-50 dark:hover:bg-dark-bg transition">
            Cancelar
          </button>
          <button onClick={onConfirm} className={`flex-1 rounded-xl py-2 text-sm font-black text-white transition ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Page ── */
export default function ConfiguracoesPage() {
  const { logout } = useAuth()
  const [loadingLabel, setLoadingLabel] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(true)

  const fetchUserDetails = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/user', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUserDetails(data.user)
      }
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err)
    } finally {
      setLoadingDetails(false)
    }
  }, [])

  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails])

  const handleSaveName = async (name: string) => {
    try {
      const res = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const data = await res.json()
        // Atualiza o estado com os dados retornados da API
        setUserDetails(prev => prev ? { ...prev, name: data.user.name, displayName: data.user.displayName } : data.user)
        // Dispara evento para atualizar outros componentes
        window.dispatchEvent(new CustomEvent('user-updated', { 
          detail: { name: data.user.name, displayName: data.user.displayName } 
        }))
      } else {
        throw new Error('Erro ao salvar nome')
      }
    } catch (error) {
      console.error('Erro ao salvar nome:', error)
      throw error
    }
  }

  async function handleLogout() {
    setShowLogoutConfirm(false)
    setLoadingLabel('Saindo...')
    await new Promise(resolve => setTimeout(resolve, 500))
    await logout()
  }

  async function handleDeleteAccount() {
    setShowDeleteConfirm(false)
    setLoadingLabel('Deletando conta...')
    
    try {
      const res = await fetch('/api/auth/delete-account', { 
        method: 'DELETE', 
        credentials: 'include' 
      })
      
      if (res.ok) {
        setLoadingLabel('')
        await logout()
      } else {
        setLoadingLabel('')
      }
    } catch {
      setLoadingLabel('')
    }
  }

  const isGoogle = userDetails?.provider === 'google'

  return (
    <>
      {loadingLabel && <LoadingOverlay label={loadingLabel} />}
      {showLogoutConfirm && (
        <ConfirmModal title="Sair da conta" description="Você será desconectado. Poderá entrar novamente a qualquer momento."
          confirmLabel="Sair" onConfirm={handleLogout} onCancel={() => setShowLogoutConfirm(false)} />
      )}
      {showDeleteConfirm && (
        <ConfirmModal title="Deletar conta" description="Esta ação é irreversível. Todos os seus dados serão removidos."
          confirmLabel="Deletar" danger onConfirm={handleDeleteAccount} onCancel={() => setShowDeleteConfirm(false)} />
      )}

      <AppShell title="Perfil">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Avatar e Nome - Card Principal */}
          <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg flex items-center justify-center text-white font-black text-2xl shrink-0 bg-gradient-to-br from-blue-600 to-cyan-400">
                  <span>{(userDetails?.name || userDetails?.displayName || 'U')[0].toUpperCase()}</span>
                </div>
              </div>

              {/* Informações */}
              <div className="flex-1 text-center sm:text-left">
                {loadingDetails ? (
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-dark-border rounded animate-pulse" />
                    <div className="h-4 w-40 bg-slate-200 dark:bg-dark-border rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-black text-slate-900 dark:text-dark-text">
                      {userDetails?.name || userDetails?.displayName || 'Seu Nome'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-dark-muted mt-1">{userDetails?.email}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Campo de Nome com Auto-save */}
          <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-4 shadow-sm">
            <label className="block text-xs font-bold text-slate-700 dark:text-dark-text mb-2">
              Seu Nome
            </label>
            {loadingDetails ? (
              <div className="h-10 bg-slate-200 dark:bg-dark-border rounded-xl animate-pulse" />
            ) : (
              <NameInput 
                initialName={userDetails?.name || ''} 
                onSave={handleSaveName}
              />
            )}
            <p className="text-xs text-slate-400 dark:text-dark-muted mt-2">
              Nome personalizável.
            </p>
          </div>

          {/* Informações - Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Método de Login */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Login</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-dark-text">
                {isGoogle ? 'Google' : 'E-mail'}
              </p>
            </div>

            {/* Data de Criação */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Desde</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-dark-text">{userDetails?.createdAt || '-'}</p>
            </div>
          </div>

          {/* Plano */}
          <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Plano</p>
                  <p className="text-sm font-black text-blue-700 dark:text-blue-300">Grátis</p>
                </div>
              </div>
              <button className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition">
                <Sparkles className="w-3 h-3" />
                Upgrade
              </button>
            </div>
          </div>

          {/* Ações */}
          <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-4 shadow-sm space-y-2">
            <button onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-dark-border px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-dark-text hover:bg-slate-50 dark:hover:bg-dark-bg transition">
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
            <button onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/40 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition">
              <Trash2 className="w-4 h-4" />
              Deletar conta
            </button>
          </div>

        </div>
      </AppShell>
    </>
  )
}
