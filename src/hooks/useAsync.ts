'use client'

import { useState, useCallback, useRef } from 'react'

type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseAsyncOptions<T> {
  timeoutMs?: number
  retries?: number
  retryDelay?: number
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (promise: Promise<T>) => Promise<T | null>
  reset: () => void
  setData: (data: T) => void
}

/**
 * Professional async hook with timeout, retry, and state management
 */
export function useAsync<T>(options: UseAsyncOptions<T> = {}): UseAsyncReturn<T> {
  const {
    timeoutMs = 30_000,
    retries = 0,
    retryDelay = 1000,
  } = options

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    clearTimeouts()
    setState({ data: null, loading: false, error: null })
  }, [clearTimeouts])

  const setData = useCallback((data: T) => {
    setState({ data, loading: false, error: null })
  }, [])

  const execute = useCallback(async (promise: Promise<T>): Promise<T | null> => {
    // Cancel any in-flight request
    clearTimeouts()
    
    // Reset error state
    setState(prev => ({ ...prev, error: null, loading: true }))

    let lastError: string | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        abortRef.current = new AbortController()
        
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            reject(new Error('Timeout excedido'))
          }, timeoutMs)
        })

        // Race between the actual promise and timeout
        const result = await Promise.race([
          promise,
          timeoutPromise
        ])

        clearTimeouts()
        
        setState({
          data: result,
          loading: false,
          error: null,
        })

        options.onSuccess?.(result)
        return result

      } catch (err) {
        clearTimeouts()
        
        let errorMessage = 'Erro desconhecido'
        
        if (err instanceof Error) {
          if (err.name === 'AbortError' || err.message === 'Timeout excedido') {
            errorMessage = 'Tempo limite excedido. Tente novamente.'
          } else {
            errorMessage = err.message
          }
        } else if (typeof err === 'string') {
          errorMessage = err
        }

        lastError = errorMessage

        // Don't retry on last attempt
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
        }
      }
    }

    // All retries failed
    const finalError = lastError || 'Erro desconhecido'
    
    setState({
      data: null,
      loading: false,
      error: finalError,
    })

    options.onError?.(finalError)
    return null

  }, [timeoutMs, retries, retryDelay, options, clearTimeouts])

  return {
    ...state,
    execute,
    reset,
    setData,
  }
}

/**
 * Hook para requisições que precisam de loading contínuo
 */
export function useLoadingState() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const startLoading = useCallback((msg: string = 'Carregando...') => {
    setMessage(msg)
    setLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setLoading(false)
    setMessage('')
  }, [])

  const withLoading = useCallback(async <T,>(
    promise: Promise<T>,
    msg: string = 'Carregando...'
  ): Promise<T | null> => {
    startLoading(msg)
    try {
      const result = await promise
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    loading,
    message,
    startLoading,
    stopLoading,
    withLoading,
  }
}