import { NextRequest } from 'next/server'
import { getDb } from './db'
import { 
  verifyPasswordSecure, 
  checkRateLimit, 
  recordLoginAttempt, 
  hashPasswordSecure,
  validatePasswordStrength 
} from './password-security'
import crypto from 'crypto'

// Interfaces para tipagem dos retornos do banco
interface UserRow {
  id: number;
  email: string;
  password?: string;
  display_name: string;
  name: string;
  provider: string;
  verified: number;
  pin?: string;
  last_login?: string;
  failed_logins: number;
  locked_until?: string;
  created_at?: string;
  picture?: string;
}

interface SessionRow {
  user_id: number;
  expires_at: string;
}

interface VerifyCodeRow {
  id: number;
  email: string;
  code: string;
  expires_at: string;
  used: number;
}

interface VerifyTokenRow {
  id: number;
  email: string;
  token: string;
  expires_at: string;
  used: number;
}

/**
 * Recupera o ID do usuário através do cookie de sessão
 */
export async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null

    // Busca o valor do cookie 'rankify_session'
    const token = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('rankify_session='))
      ?.split('=')[1];

    if (!token) return null

    const db = getDb()
    const session = db.prepare(`
      SELECT s.user_id, s.expires_at
      FROM sessions s
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).get(token) as SessionRow | undefined;

    return session ? session.user_id : null
  } catch (error) {
    console.error('Erro ao obter userId do token:', error)
    return null
  }
}

/**
 * Obtém o usuário da sessão atual
 * Aceita tanto NextRequest quanto string (token)
 */
export async function getSessionUser(requestOrToken: NextRequest | string): Promise<UserRow | null> {
  try {
    let userId: number | null = null
    
    if (typeof requestOrToken === 'string') {
      // Se for string, busca o userId diretamente do token
      const db = getDb()
      const session = db.prepare(`
        SELECT s.user_id, s.expires_at
        FROM sessions s
        WHERE s.token = ? AND s.expires_at > datetime('now')
      `).get(requestOrToken) as SessionRow | undefined;
      
      userId = session ? session.user_id : null
    } else {
      // Se for NextRequest, usa getUserIdFromToken
      userId = await getUserIdFromToken(requestOrToken)
    }
    
    if (!userId) return null

    const db = getDb()
    const user = db.prepare(`
      SELECT id, email, password, name, display_name, provider, verified, pin, last_login, failed_logins, locked_until
      FROM users 
      WHERE id = ?
    `).get(userId) as UserRow | undefined;

    return user || null
  } catch (error) {
    console.error('Erro ao obter usuário da sessão:', error)
    return null
  }
}

/**
 * Obtém um usuário pelo e-mail
 */
export function getUserByEmail(email: string): UserRow | null {
  try {
    const db = getDb()
    const user = db.prepare(`
      SELECT id, email, password, display_name, provider, verified, pin, last_login, failed_logins, locked_until
      FROM users 
      WHERE email = ?
    `).get(email.toLowerCase()) as UserRow | undefined;

    return user || null
  } catch (error) {
    console.error('Erro ao obter usuário por email:', error)
    return null
  }
}

/**
 * Obtém o PIN de um usuário
 */
export function getUserPin(email: string): string | null {
  try {
    const db = getDb()
    const user = db.prepare(
      'SELECT pin FROM users WHERE email = ?'
    ).get(email.toLowerCase()) as { pin?: string } | undefined;

    return user?.pin || null
  } catch (error) {
    console.error('Erro ao obter PIN do usuário:', error)
    return null
  }
}

/**
 * Valida se o e-mail existe e se a senha coincide
 */
export function verifyUserPassword(email: string, password: string): { success: boolean, userId?: number } {
  try {
    const db = getDb()
    const user = db.prepare(
      'SELECT id, password FROM users WHERE email = ?'
    ).get(email) as { id: number, password?: string } | undefined;

    if (!user || !user.password) return { success: false };

    // Comparação simples (em produção use bcrypt)
    const isValid = user.password === password;
    
    return { 
      success: isValid, 
      userId: isValid ? user.id : undefined 
    };
  } catch (error) {
    console.error('Erro ao verificar senha:', error)
    return { success: false };
  }
}

/**
 * Verifica senha usando bcrypt (para compatibilidade com o sistema atual)
 */
export async function verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
  return verifyPasswordSecure(plainPassword, storedHash);
}

/**
 * Verifica rate limiting para login
 */
export function checkLoginRateLimit(identifier: string): { allowed: boolean; remainingAttempts?: number; lockoutTime?: number } {
  return checkRateLimit(identifier);
}

/**
 * Registra tentativa de login
 */
export function recordLogin(identifier: string, success: boolean): void {
  recordLoginAttempt(identifier, success);
}

/**
 * Gera um código de verificação
 */
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Salva um código de verificação no banco
 */
export function saveVerifyCode(email: string, code: string): void {
  try {
    const db = getDb()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
    
    db.prepare(`
      INSERT INTO verify_codes (email, code, expires_at, used)
      VALUES (?, ?, ?, 0)
    `).run(email.toLowerCase(), code, expiresAt)
  } catch (error) {
    console.error('Erro ao salvar código de verificação:', error)
    throw error
  }
}

/**
 * Consome um código de verificação
 */
export function consumeVerifyCode(email: string, code: string): boolean {
  try {
    const db = getDb()
    
    // Verifica se o código existe e não foi usado
    const verifyCode = db.prepare(`
      SELECT id, expires_at, used
      FROM verify_codes
      WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
    `).get(email.toLowerCase(), code) as VerifyCodeRow | undefined;

    if (!verifyCode) return false

    // Marca como usado
    db.prepare('UPDATE verify_codes SET used = 1 WHERE id = ?').run(verifyCode.id)
    return true
  } catch (error) {
    console.error('Erro ao consumir código de verificação:', error)
    return false
  }
}

/**
 * Verifica se um código foi verificado
 */
export function wasCodeVerified(email: string, code?: string): boolean {
  try {
    const db = getDb()
    
    if (code) {
      // Verifica código específico
      const verifyCode = db.prepare(`
        SELECT used
        FROM verify_codes
        WHERE email = ? AND code = ? AND expires_at > datetime('now')
      `).get(email.toLowerCase(), code) as { used: number } | undefined;

      return verifyCode?.used === 1
    } else {
      // Verifica se há algum código verificado para este email
      const verifyCode = db.prepare(`
        SELECT used
        FROM verify_codes
        WHERE email = ? AND used = 1 AND expires_at > datetime('now')
        ORDER BY id DESC
        LIMIT 1
      `).get(email.toLowerCase()) as { used: number } | undefined;

      return verifyCode?.used === 1
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
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Verifica o PIN do usuário
 */
export function verifyUserPin(email: string, pin: string): boolean {
  try {
    const db = getDb()
    const user = db.prepare(
      'SELECT pin FROM users WHERE email = ?'
    ).get(email.toLowerCase()) as { pin?: string } | undefined;

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
  return validatePasswordStrength(password);
}

/**
 * Hash de senha (alias para hashPasswordSecure)
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return hashPasswordSecure(plainPassword);
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
    const db = getDb()
    const hashedPassword = await hashPasswordSecure(password)
    const name = displayName || displayNameFromEmail(email)
    
    const result = db.prepare(`
      INSERT INTO users (email, password, display_name, provider, verified, pin)
      VALUES (?, ?, ?, 'local', 0, ?)
    `).run(email.toLowerCase(), hashedPassword, name, pin || null)
    
    return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as UserRow
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
    const db = getDb()
    const hashedPassword = await hashPasswordSecure(newPassword)
    
    db.prepare(`
      UPDATE users 
      SET password = ?, failed_logins = 0, locked_until = NULL
      WHERE email = ?
    `).run(hashedPassword, email.toLowerCase())
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return false
  }
}

/**
 * Cria ou atualiza um usuário do Google
 */
export function upsertGoogleUser(googleId: string, email: string, displayName: string): UserRow {
  try {
    const db = getDb()
    
    // Tenta encontrar usuário existente pelo google_id ou email
    const existingUser = db.prepare(`
      SELECT id FROM users WHERE google_id = ? OR email = ?
    `).get(googleId, email.toLowerCase()) as { id: number } | undefined;

    if (existingUser) {
      // Atualiza usuário existente
      db.prepare(`
        UPDATE users 
        SET google_id = ?, display_name = ?, provider = 'google', verified = 1
        WHERE id = ?
      `).run(googleId, displayName, existingUser.id)
      
      return db.prepare('SELECT * FROM users WHERE id = ?').get(existingUser.id) as UserRow
    } else {
      // Cria novo usuário
      const result = db.prepare(`
        INSERT INTO users (email, display_name, provider, google_id, verified)
        VALUES (?, ?, 'google', ?, 1)
      `).run(email.toLowerCase(), displayName, googleId)
      
      return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as UserRow
    }
  } catch (error) {
    console.error('Erro ao upsert usuário do Google:', error)
    throw error
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
export function markNotifRead(userId: number, notifId: string): void {
  try {
    const db = getDb()
    db.prepare(`
      INSERT OR IGNORE INTO notif_read (user_id, notif_id)
      VALUES (?, ?)
    `).run(userId, notifId)
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
  }
}

/**
 * Obtém IDs de notificações lidas
 */
export function getReadNotifIds(userId: number): string[] {
  try {
    const db = getDb()
    const rows = db.prepare(
      'SELECT notif_id FROM notif_read WHERE user_id = ?'
    ).all(userId) as { notif_id: string }[];
    
    return rows.map(row => row.notif_id)
  } catch (error) {
    console.error('Erro ao obter notificações lidas:', error)
    return []
  }
}

/**
 * Cria uma nova sessão no banco e retorna o token
 */
export function createSession(userId: number): string {
  try {
    const db = getDb()
    
    // Gerar token simples
    const token = `rankify_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    // Expiração para 7 dias
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    
    db.prepare(`
      INSERT INTO sessions (user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(userId, token, expiresAt)

    return token
  } catch (error) {
    console.error('Erro ao criar sessão:', error)
    throw new Error('Falha ao gerar sessão no banco');
  }
}

/**
 * Remove a sessão (Logout)
 */
export function deleteSession(token: string): void {
  try {
    const db = getDb()
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
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
export function saveVerifyToken(email: string, token: string): void {
  try {
    const db = getDb()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    
    db.prepare(`
      INSERT INTO verify_tokens (email, token, expires_at, used)
      VALUES (?, ?, ?, 0)
    `).run(email.toLowerCase(), token, expiresAt)
  } catch (error) {
    console.error('Erro ao salvar token de verificação:', error)
    throw error
  }
}

/**
 * Consome e retorna o e-mail associado ao token
 */
export function consumeVerifyToken(token: string): string | null {
  try {
    const db = getDb()
    
    const verifyToken = db.prepare(`
      SELECT id, email, expires_at, used
      FROM verify_tokens
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `).get(token) as VerifyTokenRow | undefined

    if (!verifyToken) return null

    // Marca como usado
    db.prepare('UPDATE verify_tokens SET used = 1 WHERE id = ?').run(verifyToken.id)
    
    return verifyToken.email
  } catch (error) {
    console.error('Erro ao consumir token de verificação:', error)
    return null
  }
}
/**
 * Atualiza o nome do usuário
 */
export function updateUserName(userId: number, name: string): boolean {
  try {
    const db = getDb()
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, userId)
    return true
  } catch (error) {
    console.error('Erro ao atualizar nome:', error)
    return false
  }
}

/**
 * Obtém usuário por ID
 */
export function getUserById(userId: number): UserRow | null {
  try {
    const db = getDb()
    const user = db.prepare(`
      SELECT id, email, password, display_name, name, provider, verified, pin, last_login, failed_logins, locked_until, created_at
      FROM users WHERE id = ?
    `).get(userId) as UserRow | undefined

    return user || null
  } catch (error) {
    console.error('Erro ao obter usuário por ID:', error)
    return null
  }
}
/**
 * Sessões múltiplas e persistência
 */

// Interface para sessão completa
interface SessionData {
  user_id: number
  token: string
  refresh_token?: string
  device_info?: string
  ip_address?: string
  last_active: string
  expires_at: string
  created_at: string
}

/**
 * Cria uma sessão com refresh token para persistência longa
 */
export function createPersistentSession(
  userId: number, 
  deviceInfo?: string, 
  ipAddress?: string
): { token: string; refreshToken: string } {
  const db = getDb()
  
  // Token principal (curta duração)
  const token = `rankify_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  
  // Refresh token (longa duração - 30 dias)
  const refreshToken = `rft_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  
  // Expiração do token principal: 7 dias
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  
  db.prepare(`
    INSERT INTO sessions (user_id, token, refresh_token, device_info, ip_address, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, token, refreshToken, deviceInfo || null, ipAddress || null, expiresAt)

  // Limitar a 5 sessões por usuário
  const sessionCount = db.prepare(
    'SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND expires_at > datetime(\'now\')'
  ).get(userId) as { count: number }
  
  if (sessionCount.count > 5) {
    // Remove sessões mais antigas
    db.prepare(`
      DELETE FROM sessions 
      WHERE user_id = ? AND id NOT IN (
        SELECT id FROM sessions WHERE user_id = ? ORDER BY last_active DESC LIMIT 5
      )
    `).run(userId, userId)
  }

  return { token, refreshToken }
}

/**
 * Renova sessão usando refresh token
 */
export function refreshSessionByToken(refreshToken: string): { token: string; refreshToken: string } | null {
  const db = getDb()
  
  const session = db.prepare(`
    SELECT id, user_id FROM sessions 
    WHERE refresh_token = ? AND expires_at > datetime('now')
  `).get(refreshToken) as { id: number; user_id: number } | undefined

  if (!session) return null

  // Gera novos tokens
  const newToken = `rankify_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  const newRefreshToken = `rft_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  db.prepare(`
    UPDATE sessions SET token = ?, refresh_token = ?, last_active = datetime('now'), expires_at = ?
    WHERE id = ?
  `).run(newToken, newRefreshToken, expiresAt, session.id)

  return { token: newToken, refreshToken: newRefreshToken }
}

/**
 * Atualiza última atividade da sessão
 */
export function updateSessionActivity(token: string): void {
  try {
    const db = getDb()
    db.prepare('UPDATE sessions SET last_active = datetime("now") WHERE token = ?').run(token)
  } catch {
    // Silencioso - não falha por isso
  }
}

/**
 * Obtém todas as sessões ativas do usuário
 */
export function getUserSessions(userId: number): SessionData[] {
  try {
    const db = getDb()
    return db.prepare(`
      SELECT * FROM sessions 
      WHERE user_id = ? AND expires_at > datetime('now')
      ORDER BY last_active DESC
    `).all(userId) as SessionData[]
  } catch {
    return []
  }
}

/**
 * Revoga uma sessão específica
 */
export function revokeSession(token: string): void {
  try {
    const db = getDb()
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
  } catch {
    // Silencioso
  }
}

/**
 * Revoga todas as sessões do usuário (exceto a atual)
 */
export function revokeOtherSessions(userId: number, currentToken: string): void {
  try {
    const db = getDb()
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?').run(userId, currentToken)
  } catch {
    // Silencioso
  }
}


/**
 * Preferências do usuário (persistência de configurações)
 */

/**
 * Salva uma preferência do usuário
 */
export function setUserPreference(userId: number, key: string, value: string): void {
  try {
    const db = getDb()
    db.prepare(`
      INSERT INTO user_preferences (user_id, key, value, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, key) DO UPDATE SET value = ?, updated_at = datetime('now')
    `).run(userId, key, value, value)
  } catch (error) {
    console.error('Erro ao salvar preferência:', error)
  }
}

/**
 * Obtém uma preferência do usuário
 */
export function getUserPreference(userId: number, key: string): string | null {
  try {
    const db = getDb()
    const result = db.prepare(
      'SELECT value FROM user_preferences WHERE user_id = ? AND key = ?'
    ).get(userId, key) as { value: string } | undefined
    return result?.value || null
  } catch {
    return null
  }
}

/**
 * Obtém todas as preferências do usuário
 */
export function getAllUserPreferences(userId: number): Record<string, string> {
  try {
    const db = getDb()
    const rows = db.prepare(
      'SELECT key, value FROM user_preferences WHERE user_id = ?'
    ).all(userId) as { key: string; value: string }[]
    
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
export function deleteUserPreference(userId: number, key: string): void {
  try {
    const db = getDb()
    db.prepare('DELETE FROM user_preferences WHERE user_id = ? AND key = ?').run(userId, key)
  } catch {
    // Silencioso
  }
}