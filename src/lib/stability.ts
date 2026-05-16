/**
 * Rankify Stability Layer
 * ─────────────────────────────────────────────────────────────────────────
 * Central module for: retry logic, request deduplication, error normalisation,
 * rate-limit helpers, and structured server-side logging.
 *
 * Import from here instead of writing ad-hoc fetch/try-catch everywhere.
 */

/* ── Types ── */
export interface ApiResult<T = unknown> {
  ok: boolean
  data?: T
  error?: string
  status?: number
}

/* ── Structured logger (server-side) ── */
type LogLevel = 'info' | 'warn' | 'error'

export function log(level: LogLevel, tag: string, message: string, meta?: unknown) {
  const ts  = new Date().toISOString()
  const out = `[${ts}] [${level.toUpperCase()}] [${tag}] ${message}`
  if (meta !== undefined) {
    if (level === 'error') console.error(out, meta)
    else if (level === 'warn') console.warn(out, meta)
    else console.log(out, meta)
  } else {
    if (level === 'error') console.error(out)
    else if (level === 'warn') console.warn(out)
    else console.log(out)
  }
}

/* ── Retry with exponential back-off ── */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; baseDelayMs?: number; tag?: string } = {}
): Promise<T> {
  const { retries = 2, baseDelayMs = 300, tag = 'retry' } = opts
  let lastErr: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (attempt < retries) {
        const delay = baseDelayMs * 2 ** attempt
        log('warn', tag, `Attempt ${attempt + 1} failed, retrying in ${delay}ms`, err)
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }

  throw lastErr
}

/* ── Normalise any thrown value into a string message ── */
export function normaliseError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try { return JSON.stringify(err) } catch { return 'Erro desconhecido.' }
}

/* ── Client-side: safe fetch with timeout + retry ── */
export async function safeFetch<T = unknown>(
  url: string,
  options: RequestInit & { timeoutMs?: number; retries?: number } = {}
): Promise<ApiResult<T>> {
  const { timeoutMs = 15_000, retries = 1, ...fetchOpts } = options

  const attempt = async (): Promise<ApiResult<T>> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res  = await fetch(url, { ...fetchOpts, signal: controller.signal, credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      clearTimeout(timer)

      if (!res.ok) {
        return { ok: false, error: (data as any)?.error || `HTTP ${res.status}`, status: res.status, data: data as T }
      }
      return { ok: true, data: data as T, status: res.status }
    } catch (err) {
      clearTimeout(timer)
      if ((err as any)?.name === 'AbortError') {
        return { ok: false, error: 'Tempo limite excedido. Tente novamente.', status: 408 }
      }
      throw err
    }
  }

  try {
    return await withRetry(attempt, { retries, tag: url })
  } catch (err) {
    return { ok: false, error: normaliseError(err) }
  }
}

/* ── Debounce ── */
export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}

/* ── Throttle ── */
export function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let last = 0
  return ((...args: any[]) => {
    const now = Date.now()
    if (now - last >= ms) { last = now; fn(...args) }
  }) as T
}

/* ── In-flight request deduplication (client-side) ── */
const _inflight = new Map<string, Promise<ApiResult>>()

export async function deduplicatedFetch<T = unknown>(
  key: string,
  fn: () => Promise<ApiResult<T>>
): Promise<ApiResult<T>> {
  if (_inflight.has(key)) return _inflight.get(key) as Promise<ApiResult<T>>
  const p = fn().finally(() => _inflight.delete(key))
  _inflight.set(key, p as Promise<ApiResult>)
  return p
}
