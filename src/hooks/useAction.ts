/**
 * useAction — central hook for all form/button actions
 *
 * Features:
 * - Prevents duplicate submissions (in-flight guard)
 * - Timeout protection (default 20s)
 * - Retry on network errors (not on 4xx)
 * - Normalised error messages
 * - Loading state management
 * - Race condition protection via AbortController
 */
import { useCallback, useRef, useState } from 'react'
import { normaliseError } from '@/lib/stability'

interface ActionOptions {
  timeoutMs?: number
  retries?: number
}

interface ActionState {
  loading: boolean
  error: string
  success: string
}

type ActionFn<T> = (signal: AbortSignal) => Promise<T>

export function useAction<T = unknown>(opts: ActionOptions = {}) {
  const { timeoutMs = 20_000, retries = 1 } = opts

  const [state, setState] = useState<ActionState>({ loading: false, error: '', success: '' })
  const inFlight = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  const run = useCallback(
    async (fn: ActionFn<T>): Promise<T | null> => {
      // Prevent duplicate calls
      if (inFlight.current) return null

      inFlight.current = true
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setState({ loading: true, error: '', success: '' })

      const timer = setTimeout(() => controller.abort(), timeoutMs)

      let lastErr: unknown
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const result = await fn(controller.signal)
          clearTimeout(timer)
          inFlight.current = false
          setState({ loading: false, error: '', success: '' })
          return result
        } catch (err: unknown) {
          lastErr = err
          // Don't retry on abort
          if ((err as any)?.name === 'AbortError') break
          // Don't retry if it's a known API error (has .status)
          if ((err as any)?.status && (err as any).status < 500) break
          // Wait before retry
          if (attempt < retries) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
        }
      }

      clearTimeout(timer)
      inFlight.current = false

      const msg =
        (lastErr as any)?.name === 'AbortError'
          ? 'Tempo limite excedido. Verifique sua conexão.'
          : normaliseError(lastErr)

      setState({ loading: false, error: msg, success: '' })
      return null
    },
    [timeoutMs, retries]
  )

  const setError   = useCallback((error: string)   => setState((s) => ({ ...s, error,   loading: false })), [])
  const setSuccess = useCallback((success: string) => setState((s) => ({ ...s, success, loading: false, error: '' })), [])
  const reset      = useCallback(() => setState({ loading: false, error: '', success: '' }), [])

  // Cancel in-flight request on unmount
  const cancel = useCallback(() => {
    abortRef.current?.abort()
    inFlight.current = false
    setState((s) => ({ ...s, loading: false }))
  }, [])

  return { ...state, run, setError, setSuccess, reset, cancel }
}
