/**
 * Funções de autenticação usando PostgreSQL (Neon)
 * Compatível com Netlify e Vercel
 */
import { NextRequest } from 'next/server'
import { query, queryOne, execute } from './db-postgres'
import { 
  verifyPasswordSecure, 
  checkRateLimit, 
  recordLoginAttempt, 
  hashPasswordSecure,
  validatePasswordStrength 
} from './password-security'
import crypto from 'crypto'

// Interfaces
interface UserRow {
  id: number
  email: string
  password?: string
  display_name: string
  name: string
  provider: string
  verified: boolean
  pin?: string
  last_login?: Date
  failed_logins: number
  locked_until?: Date
  created_at?: Date
  picture?: string
}

interface SessionRow {
  user_id: number
  expires_at: Date
}

/**
 * Recupera o ID do usuário através do cookie de sessão
 */
export async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null

    const token = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('rankify_session='))
      ?.split('=')[1]

    if (!token) return null

    const session = await queryOne<SessionRow>(
      `SELECT user_id, expires_at FROM sessions WHERE token = $1 AND expires_at > NOW()`,
      [token]
    )

    return session ? session.user_id : null
  } catch (error) {
    console.error('Erro ao obter userId do token:', error)
    return null
  }
}

/**
 * Obtém o usuário da sessão atual
 */
export async function getSessionUser(requestOrToken: NextRequest | string): Promise<UserRow | null> {
  try {
    let userId: number | null = null
    
    if (typeof requestOrToken === 'string') {
      const session = await queryOne<SessionRow>(
        `SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()`,
        [requestOrToken]
      )
      userId = session ? session.user_id : null
    } else {
      userId = await getUserIdFromToken(requestOrToken)
    }
    
    if (!userId) return null

    const user = await queryOne<UserRow>(
      `SELECT id, email, password, name, display_name, provider, verified, pin, last_login, failed_logins, locked_until, picture, created_at
       FROM users WHERE id = $1`,
      [userId]
    )

    return user
  } catch (error) {
    console.error('Erro ao obter usuário da sessão:', error)
    return null
  }
}

/**
 * Obtém um usuário pelo e-mail
 */
export async function getUserByEmail(email: string): Promise<UserRow | null> {
  try {
    const user = await queryOne<UserRow>(
      `SELECT id, email, password, display_name, name, provider, verified, pin, last_login, failed_logins, locked_until, picture, created_at
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    )
    return user
  } catch (error) {
    console.error('Erro ao obter usuário por email:', error)
    return null
  }
}

/**
 * Obtém o PIN de um usuário
 */
export async function getUserPin(email: string): Promise<string | null> {
  try {
    const result = await queryOne<{ pin?: string }>(
      `SELECT pin FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    )
    return result?.pin || null
  } catch (error) {
    console.error('Erro ao obter PIN do usuário:', error)
    return null
  }
}

/**
 * Verifica senha usando bcrypt
 */
export async function verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
  return verifyPasswordSecure(plainPassword, storedHash)
}

/**
 * Verifica rate limiting para login
 */
export function checkLoginRateLimit(identifier: string): { allowed: boolean; remainingAttempts?: number; lockoutTime?: number } {
  return checkRateLimit(identifier)
}

/**
 * Registra tentativa de login
 */
export function recordLogin(identifier: string, success: boolean): void {
  recordLoginAttempt(identifier, success)
}

/**
 * Gera um código de verificação
 */
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Salva um código de verificação no banco
 */
export async function saveVerifyCode(email: string, code: string): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
    await execute(
      `INSERT INTO verify_codes (email, code, expires_at, used) VALUES (LOWER($1), $2, $3, false)`,
      [email, code, expiresAt]
    )
  } catch (error) {
    console.error('Erro ao salvar código de verificação:', error)
    throw error
  }
}

/**
 * Consome um código de verificação
 */
export async function consumeVerifyCode(email: string, code: string): Promise<boolean> {
  try {
    const verifyCode = await queryOne<{ id: number }>(
      `SELECT id FROM verify_codes 
       WHERE LOWER(email) = LOWER($1) AND code = $2 AND used = false AND expires_at > NOW()`,
      [email, code]
    )

    if (!verifyCode) return false

    await execute(`UPDATE verify_codes SET used = true WHERE id = $1`, [verifyCode.id])
    return true
  } catch (error) {
    console.error('Erro ao consumir código de verificação:', error)
    return false
  }
}

/**
 * Verifica se um código foi verificado
 */
export async function wasCodeVerified(email: string, code?: string): Promise<boolean> {
  try {
    if (code) {
      const verifyCode = await queryOne<{ used: boolean }>(
        `SELECT used FROM verify_codes 
         WHERE LOWER(email) = LOWER($1) AND code = $2 AND expires_at > NOW()`,
        [email, code]
      )
      return verifyCode?.used === true
    } else {
      const verifyCode = await queryOne<{ used: boolean }>(
        `SELECT used FROM verify_codes 
         WHERE LOWER(email) = LOWER($1) AND used = true AND expires_at > NOW()
         ORDER BY id DESC LIMIT 1`,
        [email]
      )
      return verifyCode?.used === true
    }
  } catch (error) {
    console.error('Erro ao verificar código:', error)
    return false
  }
}

/**
 * Gera um PIN único
 */
export function generateUniquePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

/**
 * Verifica o PIN do usuário
 */
export async function verifyUserPin(email: string, pin: string): Promise<boolean> {
  try {
    const user = await queryOne<{ pin?: string }>(
      `SELECT pin FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    )
    return user?.pin === pin
  } catch (error) {
    console.error('Erro ao verificar PIN:', error)
    return false
  }
}

/**
 * Valida a força da senha
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  return validatePasswordStrength(password)
}

/**
 * Hash de senha
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return hashPasswordSecure(plainPassword)
}

/**
 * Cria um usuário local
 */
export async function createLocalUser(
  email: string, 
  password: string, 
  displayName?: string,
  pin?: string
): Promise<UserRow> {
  try {
    const hashedPassword = await hashPasswordSecure(password)
    const name = displayName || displayNameFromEmail(email)
    
    const user = await queryOne<UserRow>(
      `INSERT INTO users (email, password, display_name, name, provider, verified, pin)
       VALUES (LOWER($1), $2, $3, $3, 'local', false, $4)
       RETURNING *`,
      [email, hashedPassword, name, pin || null]
    )
    
    if (!user) throw new Error('Falha ao criar usuário')
    return user
  } catch (error) {
    console.error('Erro ao criar usuário local:', error)
    throw error
  }
}

/**
 * Atualiza a senha do usuário
 */
export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  try {
    const hashedPassword = await hashPasswordSecure(newPassword)
    await execute(
      `UPDATE users SET password = $1, failed_logins = 0, locked_until = NULL WHERE LOWER(email) = LOWER($2)`,
      [hashedPassword, email]
    )
    return true
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return false
  }
}

/**
 * Gera display name a partir do email
 */
export function displayNameFromEmail(email: string): string {
  const atIndex = email.indexOf('@')
  if (atIndex > 0) {
    return email.substring(0, atIndex).replace(/[^a-zA-Z0-9]/g, ' ').trim()
  }
  return email
}

/**
 * Marca notificação como lida
 */
export async function markNotifRead(userId: number, notifId: string): Promise<void> {
  try {
    await execute(
      `INSERT INTO notif_read (user_id, notif_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, notifId]
    )
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
  }
}

/**
 * Obtém IDs de notificações lidas
 */
export async function getReadNotifIds(userId: number): Promise<string[]> {
  try {
    const rows = await query<{ notif_id: string }>(
      `SELECT notif_id FROM notif_read WHERE user_id = $1`,
      [userId]
    )
    return rows.map(row => row.notif_id)
  } catch (error) {
    console.error('Erro ao obter notificações lidas:', error)
    return []
  }
}

/**
 * Cria uma nova sessão no banco e retorna o token
 */
export async function createSession(userId: number): Promise<string> {
  try {
    const token = `rankify_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const refreshToken = `rft_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
    
    await execute(
      `INSERT INTO sessions (user_id, token, refresh_token, expires_at) VALUES ($1, $2, $3, $4)`,
      [userId, token, refreshToken, expiresAt]
    )

    return token
  } catch (error) {
    console.error('Erro ao criar sessão:', error)
    throw new Error('Falha ao gerar sessão no banco')
  }
}

/**
 * Remove a sessão (Logout)
 */
export async function deleteSession(token: string): Promise<void> {
  try {
    await execute(`DELETE FROM sessions WHERE token = $1`, [token])
  } catch (error) {
    console.error('Erro ao deletar sessão:', error)
  }
}

/**
 * Gera token seguro para verificação de e-mail
 */
export function generateVerifyToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Salva token de verificação no banco
 */
export async function saveVerifyToken(email: string, token: string): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    await execute(
      `INSERT INTO verify_tokens (email, token, expires_at, used) VALUES (LOWER($1), $2, $3, false)`,
      [email, token, expiresAt]
    )
  } catch (error) {
    console.error('Erro ao salvar token de verificação:', error)
    throw error
  }
}

/**
 * Consome e retorna o e-mail associado ao token
 */
export async function consumeVerifyToken(token: string): Promise<string | null> {
  try {
    const verifyToken = await queryOne<{ id: number; email: string }>(
      `SELECT id, email FROM verify_tokens WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    )

    if (!verifyToken) return null

    await execute(`UPDATE verify_tokens SET used = true WHERE id = $1`, [verifyToken.id])
    return verifyToken.email
  } catch (error) {
    console.error('Erro ao consumir token de verificação:', error)
    return null
  }
}

/**
 * Atualiza o nome do usuário
 */
export async function updateUserName(userId: number, name: string): Promise<boolean> {
  try {
    await execute(`UPDATE users SET name = $1 WHERE id = $2`, [name, userId])
    return true
  } catch (error) {
    console.error('Erro ao atualizar nome:', error)
    return false
  }
}

/**
 * Obtém usuário por ID
 */
export async function getUserById(userId: number): Promise<UserRow | null> {
  try {
    const user = await queryOne<UserRow>(
      `SELECT id, email, password, display_name, name, provider, verified, pin, last_login, failed_logins, locked_until, created_at, picture
       FROM users WHERE id = $1`,
      [userId]
    )
    return user
  } catch (error) {
    console.error('Erro ao obter usuário por ID:', error)
    return null
  }
}

/**
 * Cria uma sessão com refresh token
 */
export async function createPersistentSession(
  userId: number, 
  deviceInfo?: string, 
  ipAddress?: string
): Promise<{ token: string; refreshToken: string }> {
  try {
    const token = `rankify_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const refreshToken = `rft_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    
    await execute(
      `INSERT INTO sessions (user_id, token, refresh_token, device_info, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, token, refreshToken, deviceInfo || null, ipAddress || null, expiresAt]
    )

    // Limitar a 5 sessões por usuário
    const sessionCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM sessions WHERE user_id = $1 AND expires_at > NOW()`,
      [userId]
    )
    
    if (sessionCount && sessionCount.count > 5) {
      await execute(
        `DELETE FROM sessions WHERE user_id = $1 AND id NOT IN (
          SELECT id FROM sessions WHERE user_id = $1 ORDER BY last_active DESC LIMIT 5
        )`,
        [userId]
      )
    }

    return { token, refreshToken }
  } catch (error) {
    console.error('Erro ao criar sessão persistente:', error)
    throw error
  }
}

/**
 * Salva uma preferência do usuário
 */
export async function setUserPreference(userId: number, key: string, value: string): Promise<void> {
  try {
    await execute(
      `INSERT INTO user_preferences (user_id, key, value, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, key) DO UPDATE SET value = $3, updated_at = NOW()`,
      [userId, key, value]
    )
  } catch (error) {
    console.error('Erro ao salvar preferência:', error)
  }
}

/**
 * Obtém uma preferência do usuário
 */
export async function getUserPreference(userId: number, key: string): Promise<string | null> {
  try {
    const result = await queryOne<{ value: string }>(
      `SELECT value FROM user_preferences WHERE user_id = $1 AND key = $2`,
      [userId, key]
    )
    return result?.value || null
  } catch {
    return null
  }
}

/**
 * Obtém todas as preferências do usuário
 */
export async function getAllUserPreferences(userId: number): Promise<Record<string, string>> {
  try {
    const rows = await query<{ key: string; value: string }>(
      `SELECT key, value FROM user_preferences WHERE user_id = $1`,
      [userId]
    )
    
    const prefs: Record<string, string> = {}
    rows.forEach(row => {
      prefs[row.key] = row.value
    })
    return prefs
  } catch {
    return {}
  }
}

/**
 * Remove uma preferência do usuário
 */
export async function deleteUserPreference(userId: number, key: string): Promise<void> {
  try {
    await execute(`DELETE FROM user_preferences WHERE user_id = $1 AND key = $2`, [userId, key])
  } catch {
    // Silencioso
  }
}

/**
 * Marca usuário como verificado
 */
export async function markUserVerified(email: string): Promise<boolean> {
  try {
    await execute(`UPDATE users SET verified = true WHERE LOWER(email) = LOWER($1)`, [email])
    return true
  } catch (error) {
    console.error('Erro ao marcar usuário como verificado:', error)
    return false
  }
}

/**
 * Executa uma query de atualização genérica
 */
export async function executeUpdate(query: string, params: any[]): Promise<void> {
  try {
    await execute(query, params)
  } catch (error) {
    console.error('Erro ao executar update:', error)
    throw error
  }
}

/**
 * Atualiza o PIN do usuário
 */
export async function updateUserPin(email: string, pin: string): Promise<boolean> {
  try {
    await execute(`UPDATE users SET pin = $1 WHERE LOWER(email) = LOWER($2)`, [pin, email])
    return true
  } catch (error) {
    console.error('Erro ao atualizar PIN:', error)
    return false
  }
}
