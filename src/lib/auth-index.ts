/**
 * Auth index — Detecta automaticamente qual implementação usar
 * Importa de auth.ts (SQLite local) ou auth-neon.ts (PostgreSQL Vercel)
 */

const IS_VERCEL = !!(
  process.env.VERCEL === '1' ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_URL ||
  process.env.VERCEL_REGION
)

console.log('[Auth] Ambiente detectado:', IS_VERCEL ? 'Vercel (PostgreSQL)' : 'Local (SQLite)')

// Re-exportar tudo da implementação apropriada
if (IS_VERCEL) {
  // Em Vercel, usar PostgreSQL via Neon
  // Importar dinamicamente para evitar erro de módulo
  export * from './auth-neon'
} else {
  // Localmente, usar SQLite
  export * from './auth'
}
