/**
 * Auth index — Detecta automaticamente qual implementação usar
 * Importa de auth.ts (SQLite local) ou auth-vercel.ts (PostgreSQL Vercel)
 */

const IS_VERCEL = !!(
  process.env.VERCEL === '1' ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_URL ||
  process.env.VERCEL_REGION
)

if (IS_VERCEL) {
  // Em Vercel, usar PostgreSQL via Neon
  module.exports = require('./auth-vercel')
} else {
  // Localmente, usar SQLite
  module.exports = require('./auth')
}
