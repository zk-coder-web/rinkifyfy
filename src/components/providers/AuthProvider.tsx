'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface User {
  id?: number
  displayName: string
  name: string
  email: string
  provider?: 'local' | 'google'
  createdAt?: string
  createdTime?: string
  picture?: string
}

type AuthCtx = {
  user: User | null
  isLoggedIn: boolean
  booting: boolean
  setSession: (user: User) => void
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  isLoggedIn: false,
  booting: true,
  setSession: () => {},
  logout: async () => {},
  refreshSession: async () => {},
})

const REDIRECT_IF_LOGGED = ['/login']
const APP_PREFIX = '/dashboard'

// Detecta se está rodando como PWA (standalone)
function isPWA(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || 
         (navigator as any).standalone === true
}

// How long to cache the /me response before re-fetching (ms)
const SESSION_CACHE_MS = 5_000 // Cache curto para atualização rápida entre abas/dispositivos

// Channel para sincronizar dados do usuário entre abas do mesmo navegador
let userBroadcastChannel: BroadcastChannel | null = null

function getBroadcastChannel() {
  if (typeof window === 'undefined') return null
  if (!userBroadcastChannel) {
    userBroadcastChannel = new BroadcastChannel('rankify-user-sync')
  }
  return userBroadcastChannel
}

// Tempo mínimo entre tentativas de refresh (ms)
const REFRESH_MIN_INTERVAL = 30_000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [booting, setBooting] = useState(true)
  const router                = useRouter()
  const pathname              = usePathname()

  // Prevent concurrent /me fetches
  const fetchingRef    = useRef(false)
  const lastFetchRef   = useRef(0)
  const lastRefreshRef = useRef(0) // Para evitar refresh muito frequente
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Tenta renovar sessão automaticamente usando refresh token
  const tryRefreshSession = useCallback(async (): Promise<boolean> => {
    // Verificar se está no cliente
    if (typeof window === 'undefined') return false
    
    const now = Date.now()
    
    // Evita refresh muito frequente
    if (now - lastRefreshRef.current < REFRESH_MIN_INTERVAL) {
      return false
    }
    
    try {
      // Busca refresh token dos cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, ...v] = cookie.trim().split('=')
        acc[key] = v.join('=')
        return acc
      }, {} as Record<string, string>)
      
      const refreshToken = cookies['rankify_refresh']
      if (!refreshToken) return false

      lastRefreshRef.current = now

      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      })

      if (!res.ok) return false

      const data = await res.json() as { ok: boolean; token: string; refreshToken: string }
      
      if (data.ok && data.token) {
        // Atualiza cookies
        document.cookie = `rankify_session=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''} samesite=lax`
        document.cookie = `rankify_refresh=${data.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''} samesite=lax`
        
        lastFetchRef.current = 0 // Força re-busca de dados do usuário
        return true
      }
      
      return false
    } catch {
      return false
    }
  }, [])

  const fetchSession = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && now - lastFetchRef.current < SESSION_CACHE_MS) return
    if (fetchingRef.current) return

    fetchingRef.current = true
    lastFetchRef.current = now

    try {
      const controller = new AbortController()
      const timer      = setTimeout(() => controller.abort(), 10_000)

      // Adiciona timestamp para evitar cache do navegador
      const res  = await fetch(`/api/auth/me?_=${Date.now()}`, {
        credentials: 'include',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      })
      clearTimeout(timer)

      console.log('[AuthProvider] fetchSession response status:', res.status)

      if (!res.ok) { 
        console.log('[AuthProvider] Session check failed with status:', res.status)
        // Se sessão expirou, tenta refresh automático
        if (res.status === 401) {
          const refreshed = await tryRefreshSession()
          if (refreshed) {
            // Tenta buscar sessão novamente após refresh
            fetchingRef.current = false
            lastFetchRef.current = 0
            await fetchSession(true)
            return
          }
        }
        setUser(null)
        return 
      }

      const data = await res.json() as { user: User | null }
      console.log('[AuthProvider] fetchSession result:', data.user)
      if (data.user) {
        console.log('[AuthProvider] User found:', { id: data.user.id, email: data.user.email, provider: data.user.provider })
      } else {
        console.log('[AuthProvider] No user in response')
      }
      setUser(data.user ?? null)
    } catch (e) {
      console.error('[AuthProvider] fetchSession error:', e)
      // Network error or timeout — keep existing state, don't log out
      // Only clear user if we've never loaded (booting)
      if (booting) setUser(null)
    } finally {
      fetchingRef.current = false
      setBooting(false)
    }
  }, [booting, tryRefreshSession])

  // Initial session check
  useEffect(() => {
    // Verificar se está no cliente
    if (typeof window === 'undefined') return
    
    fetchSession(true)
    
    // Inicializar notificações
    try {
      const notificacoes = localStorage.getItem('notificacoes')
      if (!notificacoes) {
        const notifInicial = [
          {
            id: 'welcome',
            tipo: 'sistema',
            mensagem: 'Bem-vindo ao Rankify! Comece criando sua primeira página.',
            data: new Date().toISOString(),
            lida: false
          }
        ]
        localStorage.setItem('notificacoes', JSON.stringify(notifInicial))
      }
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error)
    }

    // Sincronização entre abas do mesmo navegador usando BroadcastChannel
    const channel = getBroadcastChannel()
    if (channel) {
      channel.onmessage = (event) => {
        if (event.data.type === 'user-updated') {
          // Forçar refresh quando receber atualização de outra aba
          lastFetchRef.current = 0
          fetchingRef.current = false
          fetchSession(true)
        }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-check session when tab becomes visible (handles long idle periods)
  useEffect(() => {
    // Verificar se está no cliente
    if (typeof window === 'undefined') return
    
    const onVisible = async () => {
      if (document.visibilityState === 'visible') {
        // Sempre força fetch quando a aba fica visível para garantir dados atualizados
        lastFetchRef.current = 0
        fetchingRef.current = false
        
        // Tenta refresh primeiro, depois fetch
        const refreshed = await tryRefreshSession()
        if (refreshed) {
          fetchSession(true)
        } else {
          fetchSession(true) // força refresh de dados do usuário
        }
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchSession, tryRefreshSession])

  // Verificação periódica de sessão em background (a cada 5 minutos)
  useEffect(() => {
    const checkInterval = () => {
      tryRefreshSession().catch(() => {})
    }
    
    refreshTimerRef.current = setInterval(checkInterval, 5 * 60 * 1000)
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [tryRefreshSession])

  // Route protection — runs after booting completes
  useEffect(() => {
    if (booting) return

    const inApp       = pathname.startsWith(APP_PREFIX)
    const isLoginPage = REDIRECT_IF_LOGGED.includes(pathname)

    if (user && isLoginPage) {
      // Se for PWA, redireciona para o dashboard após login
      if (isPWA()) {
        router.replace('/dashboard')
      } else {
        router.replace('/dashboard')
      }
    } else if (!user && inApp) {
      router.replace('/login')
    }
  }, [booting, user, pathname, router])

  const setSession = useCallback((nextUser: User) => {
    lastFetchRef.current = Date.now() // mark as fresh
    setUser(nextUser)
  }, [])

  // Listener para atualizações de usuário vindas de outras páginas
  useEffect(() => {
    // Verificar se está no cliente
    if (typeof window === 'undefined') return
    
    const handleUserUpdate = async (e: CustomEvent) => {
      const { name, displayName } = e.detail
      console.log('[Auth] user-updated event received:', { name, displayName })
      
      // Sempre força refresh do servidor, ignorando qualquer cache
      lastFetchRef.current = 0
      fetchingRef.current = false
      await fetchSession(true)
    }
    
    const wrappedHandler = (evt: Event) => handleUserUpdate(evt as unknown as CustomEvent)
    window.addEventListener('user-updated', wrappedHandler)
    return () => window.removeEventListener('user-updated', wrappedHandler)
  }, [fetchSession])

  const logout = useCallback(async () => {
    // Limpa timers
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        signal: AbortSignal.timeout?.(8_000),
      })
    } catch { /* ignore — cookie will expire */ }
    
    // Limpa localStorage relacionado a sessão
    try {
      localStorage.removeItem('notificacoes')
      localStorage.removeItem('paginas_cache')
    } catch { /* ignore */ }
    
    setUser(null)
    lastFetchRef.current = 0
    router.replace('/login')
  }, [router])

  const refreshSession = useCallback(() => fetchSession(true), [fetchSession])

  const value = useMemo(
    () => ({ user, isLoggedIn: !!user, booting, setSession, logout, refreshSession }),
    [user, booting, setSession, logout, refreshSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
