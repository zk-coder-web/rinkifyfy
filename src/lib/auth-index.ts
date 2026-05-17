/**
 * Auth index — Re-exporta tudo de auth-neon.ts
 * Em Vercel, usa PostgreSQL. Localmente, usa SQLite (auth.ts)
 * 
 * IMPORTANTE: Este arquivo sempre exporta auth-neon.ts
 * Localmente, você pode usar auth.ts diretamente se preferir
 */

export * from './auth-neon'
