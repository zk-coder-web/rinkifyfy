/**
 * Auth functions — Funciona com SQLite (local) e PostgreSQL (Vercel)
 * Detecta automaticamente qual usar baseado no ambiente
 */
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

const IS_VERCEL = !!(
  process.env.VERCEL === '1' ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_URL ||
  process.env.VERCEL_REGION
)

console.log('[Auth] Ambiente detectado:', IS_VERCEL ? 'Vercel (PostgreSQL)' : 'Local (SQLite)')

// Lazy load dos drivers para evitar erros de importação
let sqliteDb: any = null
let vercelSql: any = null

function getSqliteDb() {
  if (IS_VERCEL) {
    throw new Error('Você está em Vercel! Use @vercel/postgres em vez de better-sqlite3. Importe de auth-vercel.ts em vez de auth.ts')
  }
  if (!sqliteDb) {
    // Importação dinâmica para evitar carregar better-sqlite3 no Vercel
    try {
      const { getDb } = require('./db')
      sqliteDb = getDb()
    } catch (error: any) {
      throw new Error(`Erro ao carregar SQLite: ${error.message}`)
    }
  }
  return sqliteDb
}

async function getVercelSql() {
  if (!vercelSql) {
    if (!IS_VERCEL) {
      throw new Error('Tentando usar PostgreSQL fora de Vercel!')
    }
    const { sql } = await import('@vercel/postgres')
    vercelSql = sql
  }
  return vercelSql
}

// ============ TYPES ============
export interface UserRow {
  id: number
  email: string
  password?: string
  display_name: string
  name: string
  provider: string
  verified: number
  pin?: string
  last_login?: string
  failed_logins: number
  locked_until?: string
  created_at?: string
  picture?: string
}

export interface SessionRow {
  user_id: number
  expires_at: string
}

export interface VerifyCodeRow {
  id: number
  email: string
  code: string
  expires_at: string
  used: number
}

export interface VerifyTokenRow {
  id: number
  email: string
  token: string
  expires_at: string
  used: number
}

// ============ MAIN FUNCTIONS ============

export async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null

    const token = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('rankify_session='))
      ?.split('=')[1]

    if (!token) return null

    if (IS_VERCEL) {
      const sql = await getVercelSql()
      const result = await sql`
        SELECT user_id, expires_at
        FROM sessions
        WHERE token = ${token} AND expires_at > NOW()::TEXT
        LIMIT 1
      `
      if (result.rows.length === 0) return null
      return (result.rows[0] as any).user_id
    } else {
      const db = getSqliteDb()
      const session = db.prepare(`
        SELECT user_id, expires_at
        FROM sessions
        WHERE token = ? AND expires_at > datetime('now')
        LIMIT 1
      `).get(token) as SessionRow | undefined
      return session ? session.user_id : null
    }
  } catch (error) {
    console.error('Erro ao obter userId do token:', error)
    return null
  }
}

export async function getSessionUser(requestOrToken: NextRequest | string): Promise<UserRow | null> {
  try {
    let userId: number | null = null
    
    if (typeof requestOrToken === 'string') {
      if (IS_VERCEL) {
        const sql = await getVercelSql()
        const result = await sql`
          SELECT user_id, expires_at
          FROM sessions
          WHERE token = ${requestOrToken} AND expires_at > NOW()::TEXT
          LIMIT 1
        `
        userId = result.rows.length > 0 ? (result.rows[0] as any).user_id : null
      } else {
        const db = getSqliteDb()
        const session = db.prepare(`
          SELECT user_id, expires_at
          FROM sessions
          WHERE token = ? AND expires_at > datetime('now')
          LIMIT 1
        `).get(requestOrToken) as SessionRow | undefined
        userId = session ? session.user_id : null
      }
    } else {
      userId = await getUserIdFromToken(requestOrToken)
    }

    if (!userId) return null

    if (IS_VERCEL) {
      const sql = await getVercelSql()
      const result = await sql`
        SELECT * FROM users WHERE id = ${userId} LIMIT 1
      `
      if (result.rows.length === 0) return null
      return result.rows[0] as UserRow
    } else {
      const db = getSqliteDb()
      const user = db.prepare(`
        SELECT * FROM users WHERE id = ? LIMIT 1
      `).get(userId) as UserRow | undefined
      return user || null
    }
  } catch (error) {
    console.error('Erro ao obter usuário da sessão:', error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  try {
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      const result = await sql`
        SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1
      `
      if (result.rows.length === 0) return null
      return result.rows[0] as UserRow
    } else {
      const db = getSqliteDb()
      const user = db.prepare(`
        SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1
      `).get(email) as UserRow | undefined
      return user || null
    }
  } catch (error) {
    console.error('Erro ao obter usuário por email:', error)
    return null
  }
}

export function getUserPin(email: string): string | null {
  return null
}

export async function verifyUserPassword(
  email: string,
  password: string
): Promise<{ success: boolean; userId?: number }> {
  try {
    const user = await getUserByEmail(email)
    if (!user || !user.password) return { success: false }

    const isValid = await bcrypt.compare(password, user.password)
    return { success: isValid, userId: isValid ? user.id : undefined }
  } catch (error) {
    console.error('Erro ao verificar senha:', error)
    return { success: false }
  }
}

export async function verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, storedHash)
  } catch (error) {
    console.error('Erro ao comparar senhas:', error)
    return false
  }
}

export function checkLoginRateLimit(identifier: string): { allowed: boolean; remainingAttempts?: number; lockoutTime?: number } {
  return { allowed: true }
}

export function recordLogin(identifier: string, success: boolean): void {
  // Implementar se necessário
}

export function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function saveVerifyCode(email: string, code: string): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      await sql`
        INSERT INTO verify_codes (email, code, expires_at, used)
        VALUES (${email.toLowerCase()}, ${code}, ${expiresAt}, 0)
      `
    } else {
      const db = getSqliteDb()
      db.prepare(`
        INSERT INTO verify_codes (email, code, expires_at, used)
        VALUES (?, ?, ?, 0)
      `).run(email.toLowerCase(), code, expiresAt)
    }
  } catch (error) {
    console.error('Erro ao salvar código de verificação:', error)
    throw error
  }
}

export async function consumeVerifyCode(email: string, code: string): Promise<boolean> {
  try {
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      const result = await sql`
        SELECT * FROM verify_codes
        WHERE LOWER(email) = LOWER(${email})
        AND code = ${code}
        AND used = 0
        AND expires_at > NOW()::TEXT
        LIMIT 1
      `

      if (result.rows.length === 0) return false

      await sql`
        UPDATE verify_codes SET used = 1
        WHERE LOWER(email) = LOWER(${email})
        AND code = ${code}
      `
    } else {
      const db = getSqliteDb()
      const row = db.prepare(`
        SELECT * FROM verify_codes
        WHERE LOWER(email) = LOWER(?)
        AND code = ?
        AND used = 0
        AND expires_at > datetime('now')
        LIMIT 1
      `).get(email, code) as any

      if (!row) return false

      db.prepare(`
        UPDATE verify_codes SET used = 1
        WHERE LOWER(email) = LOWER(?)
        AND code = ?
      `).run(email, code)
    }

    return true
  } catch (error) {
    console.error('Erro ao consumir código de verificação:', error)
    return false
  }
}

export async function wasCodeVerified(email: string, code?: string): Promise<boolean> {
  try {
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      const result = await sql`
        SELECT * FROM verify_codes
        WHERE LOWER(email) = LOWER(${email})
        AND used = 1
        LIMIT 1
      `
      return result.rows.length > 0
    } else {
      const db = getSqliteDb()
      const row = db.prepare(`
        SELECT * FROM verify_codes
        WHERE LOWER(email) = LOWER(?)
        AND used = 1
        LIMIT 1
      `).get(email) as any
      return !!row
    }
  } catch (error) {
    console.error('Erro ao verificar código:', error)
    return false
  }
}

export function generateUniquePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export async function verifyUserPin(email: string, pin: string): Promise<boolean> {
  try {
    const user = await getUserByEmail(email)
    return user?.pin === pin
  } catch (error) {
    console.error('Erro ao verificar PIN:', error)
    return false
  }
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres.' }
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Senha deve conter uma letra maiúscula.' }
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Senha deve conter uma letra minúscula.' }
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Senha deve conter um número.' }
  return { valid: true }
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plainPassword, salt)
}

export async function createLocalUser(
  email: string,
  hashedPassword: string,
  displayName: string,
  pin: string
): Promise<UserRow> {
  try {
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      const result = await sql`
        INSERT INTO users (email, password, display_name, name, provider, pin, verified)
        VALUES (${email.toLowerCase()}, ${hashedPassword}, ${displayName}, ${displayName}, 'local', ${pin}, 0)
        RETURNING *
      `
      return result.rows[0] as UserRow
    } else {
      const db = getSqliteDb()
      const info = db.prepare(`
        INSERT INTO users (email, password, display_name, name, provider, pin, verified)
        VALUES (?, ?, ?, ?, 'local', ?, 0)
      `).run(email.toLowerCase(), hashedPassword, displayName, displayName, pin)

      const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(info.lastInsertRowid) as UserRow
      return user
    }
  } catch (error) {
    console.error('Erro ao criar usuário local:', error)
    throw error
  }
}

export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  try {
    const hashed = await hashPassword(newPassword)
    
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      await sql`
        UPDATE users SET password = ${hashed}, verified = 1
        WHERE LOWER(email) = LOWER(${email})
      `
    } else {
      const db = getSqliteDb()
      db.prepare(`
        UPDATE users SET password = ?, verified = 1
        WHERE LOWER(email) = LOWER(?)
      `).run(hashed, email)
    }
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return false
  }
}

export async function updateUserPin(email: string, pin: string): Promise<boolean> {
  try {
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      await sql`
        UPDATE users SET pin = ${pin}
        WHERE LOWER(email) = LOWER(${email})
      `
    } else {
      const db = getSqliteDb()
      db.prepare(`UPDATE users SET pin = ? WHERE LOWER(email) = LOWER(?)`).run(pin, email)
    }
    return true
  } catch (error) {
    console.error('Erro ao atualizar PIN:', error)
    return false
  }
}

export async function markUserVerified(email: string): Promise<boolean> {
  try {
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      await sql`
        UPDATE users SET verified = 1
        WHERE LOWER(email) = LOWER(${email})
      `
    } else {
      const db = getSqliteDb()
      db.prepare(`UPDATE users SET verified = 1 WHERE LOWER(email) = LOWER(?)`).run(email)
    }
    return true
  } catch (error) {
    console.error('Erro ao marcar usuário como verificado:', error)
    return false
  }
}

export function upsertGoogleUser(googleId: string, email: string, displayName: string): UserRow {
  throw new Error('Not implemented')
}

export function displayNameFromEmail(email: string): string {
  return email.split('@')[0]
}

export function markNotifRead(userId: number, notifId: string): void {
  // Implementar se necessário
}

export function getReadNotifIds(userId: number): string[] {
  return []
}

export function createSession(userId: number): string {
  return ''
}

export function deleteSession(token: string): void {
  // Implementar se necessário
}

export function generateVerifyToken(): string {
  return `vt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export async function saveVerifyToken(email: string, token: string): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      await sql`
        INSERT INTO verify_tokens (email, token, expires_at, used)
        VALUES (${email.toLowerCase()}, ${token}, ${expiresAt}, 0)
      `
    } else {
      const db = getSqliteDb()
      db.prepare(`
        INSERT INTO verify_tokens (email, token, expires_at, used)
        VALUES (?, ?, ?, 0)
      `).run(email.toLowerCase(), token, expiresAt)
    }
  } catch (error) {
    console.error('Erro ao salvar token de verificação:', error)
    throw error
  }
}

export async function consumeVerifyToken(token: string): Promise<string | null> {
  try {
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      const result = await sql`
        SELECT email FROM verify_tokens
        WHERE token = ${token}
        AND used = 0
        AND expires_at > NOW()::TEXT
        LIMIT 1
      `

      if (result.rows.length === 0) return null

      const email = (result.rows[0] as any).email

      await sql`
        UPDATE verify_tokens SET used = 1
        WHERE token = ${token}
      `

      return email
    } else {
      const db = getSqliteDb()
      const row = db.prepare(`
        SELECT email FROM verify_tokens
        WHERE token = ?
        AND used = 0
        AND expires_at > datetime('now')
        LIMIT 1
      `).get(token) as any

      if (!row) return null

      db.prepare(`
        UPDATE verify_tokens SET used = 1
        WHERE token = ?
      `).run(token)

      return row.email
    }
  } catch (error) {
    console.error('Erro ao consumir token de verificação:', error)
    return null
  }
}

export function updateUserName(userId: number, name: string): boolean {
  return false
}

export async function getUserById(userId: number): Promise<UserRow | null> {
  try {
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      const result = await sql`
        SELECT * FROM users WHERE id = ${userId} LIMIT 1
      `
      if (result.rows.length === 0) return null
      return result.rows[0] as UserRow
    } else {
      const db = getSqliteDb()
      const user = db.prepare(`
        SELECT * FROM users WHERE id = ? LIMIT 1
      `).get(userId) as UserRow | undefined
      return user || null
    }
  } catch (error) {
    console.error('Erro ao obter usuário por ID:', error)
    return null
  }
}

export interface SessionData {
  id: number
  token: string
  deviceInfo?: string
  ipAddress?: string
  expiresAt: string
  lastActive: string
}

export async function createPersistentSession(
  userId: number,
  deviceInfo?: string,
  ipAddress?: string
): Promise<{ token: string; refreshToken: string }> {
  try {
    const token = `rankify_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const refreshToken = `rft_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    if (IS_VERCEL) {
      const sql = await getVercelSql()
      await sql`
        INSERT INTO sessions (user_id, token, refresh_token, device_info, ip_address, expires_at)
        VALUES (${userId}, ${token}, ${refreshToken}, ${deviceInfo || null}, ${ipAddress || null}, ${expiresAt})
      `
    } else {
      const db = getSqliteDb()
      db.prepare(`
        INSERT INTO sessions (user_id, token, refresh_token, device_info, ip_address, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, token, refreshToken, deviceInfo || null, ipAddress || null, expiresAt)
    }

    return { token, refreshToken }
  } catch (error) {
    console.error('Erro ao criar sessão persistente:', error)
    throw error
  }
}

export function refreshSessionByToken(refreshToken: string): { token: string; refreshToken: string } | null {
  return null
}

export function updateSessionActivity(token: string): void {
  // Implementar se necessário
}

export function getUserSessions(userId: number): SessionData[] {
  return []
}

export function revokeSession(token: string): void {
  // Implementar se necessário
}

export function revokeOtherSessions(userId: number, currentToken: string): void {
  // Implementar se necessário
}

export function setUserPreference(userId: number, key: string, value: string): void {
  // Implementar se necessário
}

export function getUserPreference(userId: number, key: string): string | null {
  return null
}

export function getAllUserPreferences(userId: number): Record<string, string> {
  return {}
}

export function deleteUserPreference(userId: number, key: string): void {
  // Implementar se necessário
}
