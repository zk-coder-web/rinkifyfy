/**
 * Auth wrapper — Detecta automaticamente SQLite (local) ou PostgreSQL (Vercel)
 * Importa de auth.ts ou auth-neon.ts conforme o ambiente
 */

const IS_VERCEL = !!(
  process.env.VERCEL === '1' ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_URL ||
  process.env.VERCEL_REGION
)

if (IS_VERCEL) {
  // Em Vercel, usar PostgreSQL
  module.exports = require('./auth-neon')
} else {
  // Localmente, usar SQLite
  module.exports = require('./auth')
}
