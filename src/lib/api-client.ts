/**
 * Rankify API Client
 * Wraps all fetch calls with: timeout, retry, error normalisation, signal support.
 */
import { normaliseError } from './stability'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface FetchOptions extends RequestInit {
  timeoutMs?: number
  retries?: number
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { timeoutMs = 20_000, retries = 1, signal: externalSignal, ...rest } = options

  const attempt = async (signal: AbortSignal): Promise<T> => {
    const res  = await fetch(path, {
      ...rest,
      signal,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(rest.headers ?? {}) },
    })

    let data: unknown
    try { data = await res.json() } catch { data = {} }

    if (!res.ok) {
      throw new ApiError(
        (data as any)?.error || `HTTP ${res.status}`,
        res.status,
        data
      )
    }

    return data as T
  }

  let lastErr: unknown

  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController()
    const timer      = setTimeout(() => controller.abort(), timeoutMs)

    // Combine external signal with our timeout signal
    const combined = externalSignal
      ? anyAbort([externalSignal, controller.signal])
      : controller.signal

    try {
      const result = await attempt(combined)
      clearTimeout(timer)
      return result
    } catch (err: unknown) {
      clearTimeout(timer)
      lastErr = err

      const isAbort  = (err as any)?.name === 'AbortError'
      const is4xx    = err instanceof ApiError && err.status >= 400 && err.status < 500
      const noRetry  = isAbort || is4xx

      if (noRetry || i >= retries) break
      await new Promise((r) => setTimeout(r, 350 * (i + 1)))
    }
  }

  if ((lastErr as any)?.name === 'AbortError') {
    throw new ApiError('Tempo limite excedido. Verifique sua conexão.', 408)
  }
  throw lastErr
}

/** Returns an AbortSignal that fires when ANY of the given signals abort */
function anyAbort(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()
  for (const s of signals) {
    if (s.aborted) { controller.abort(); break }
    s.addEventListener('abort', () => controller.abort(), { once: true })
  }
  return controller.signal
}

export const apiClient = {
  post: <T = unknown>(path: string, body: unknown, opts?: FetchOptions) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts }),

  get: <T = unknown>(path: string, opts?: FetchOptions) =>
    request<T>(path, { method: 'GET', ...opts }),

  delete: <T = unknown>(path: string, opts?: FetchOptions) =>
    request<T>(path, { method: 'DELETE', ...opts }),
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return normaliseError(err)
}
