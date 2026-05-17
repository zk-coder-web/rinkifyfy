/**
 * Auth functions for PostgreSQL (Neon)
 * Replaces better-sqlite3 with @vercel/postgres
 */
import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

// ============ TYPES ============
export interface UserRow {
  id: number
  email: string
  password: string | null
  display_name: string
  name: string
  provider: string
  google_id: string | null
  verified: number
  pin: string | null
  last_login: string | null
  failed_logins: number
  locked_until: string | null
  created_at: string
}

export interface SessionRow {
  id: number
  user_id: number
  token: string
  refresh_token: string | null
  device_info: string | null
  ip_address: string | null
  expires_at: string
  last_active: string
  created_at: string
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

// ============ SESSION FUNCTIONS ============
export async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const token = request.cookies.get('rankify_session')?.value
    if (!token) return null

    const result = await sql`
      SELECT user_id FROM sessions 
      WHERE token = ${token} 
      AND expires_at > NOW()::TEXT
      LIMIT 1
    `

    if (result.rows.length === 0) return null
    return (result.rows[0] as any).user_id
  } catch (error) {
    console.error('Erro ao obter user ID do token:', error)
    return null
  }
}

export async function getSessionUser(requestOrToken: NextRequest | string): Promise<UserRow | null> {
  try {
    let token: string | undefined

    if (typeof requestOrToken === 'string') {
      token = requestOrToken
    } else {
      token = requestOrToken.cookies.get('rankify_session')?.value
    }

    if (!token) return null

    const result = await sql`
      SELECT u.* FROM users u
      JOIN sessions s ON u.id = s.user_id
      WHERE s.token = ${token}
      AND s.expires_at > NOW()::TEXT
      LIMIT 1
    `

    if (result.rows.length === 0) return null
    return result.rows[0] as UserRow
  } catch (error) {
    console.error('Erro ao obter usuário da sessão:', error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1
    `
    if (result.rows.length === 0) return null
    return result.rows[0] as UserRow
  } catch (error) {
    console.error('Erro ao obter usuário por email:', error)
    return null
  }
}

export function getUserPin(email: string): string | null {
  // Implementar se necessário
  return null
}

export async function verifyUserPassword(
  email: string,
  password: string
): Promise<{ success: boolean; userId?: number }> {
  try {
    const user = await getUserByEmail(email)
    if (!user || !user.password) return { success: false }

    const isValid = await verifyPassword(password, user.password)
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
  // Implementar se necessário
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
    await sql`
      INSERT INTO verify_codes (email, code, expires_at, used)
      VALUES (${email.toLowerCase()}, ${code}, ${expiresAt}, 0)
    `
  } catch (error) {
    console.error('Erro ao salvar código de verificação:', error)
    throw error
  }
}

export async function consumeVerifyCode(email: string, code: string): Promise<boolean> {
  try {
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

    return true
  } catch (error) {
    console.error('Erro ao consumir código de verificação:', error)
    return false
  }
}

export async function wasCodeVerified(email: string, code?: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT * FROM verify_codes
      WHERE LOWER(email) = LOWER(${email})
      AND used = 1
      LIMIT 1
    `
    return result.rows.length > 0
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
    const result = await sql`
      INSERT INTO users (email, password, display_name, name, provider, pin, verified)
      VALUES (${email.toLowerCase()}, ${hashedPassword}, ${displayName}, ${displayName}, 'local', ${pin}, 0)
      RETURNING *
    `
    return result.rows[0] as UserRow
  } catch (error) {
    console.error('Erro ao criar usuário local:', error)
    throw error
  }
}

export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  try {
    const hashed = await hashPassword(newPassword)
    await sql`
      UPDATE users SET password = ${hashed}
      WHERE LOWER(email) = LOWER(${email})
    `
    return true
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return false
  }
}

export function upsertGoogleUser(googleId: string, email: string, displayName: string): UserRow {
  // Implementar se necessário
  throw new Error('Not implemented')
}

export function displayNameFromEmail(email: string): string {
  return email.split('@')[0]
}

export function markNotifRead(userId: number, notifId: string): void {
  // Implementar se necessário
}

export function getReadNotifIds(userId: number): string[] {
  // Implementar se necessário
  return []
}

export function createSession(userId: number): string {
  // Implementar se necessário
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
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    await sql`
      INSERT INTO verify_tokens (email, token, expires_at, used)
      VALUES (${email.toLowerCase()}, ${token}, ${expiresAt}, 0)
    `
  } catch (error) {
    console.error('Erro ao salvar token de verificação:', error)
    throw error
  }
}

export async function consumeVerifyToken(token: string): Promise<string | null> {
  try {
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
  } catch (error) {
    console.error('Erro ao consumir token de verificação:', error)
    return null
  }
}

export function updateUserName(userId: number, name: string): boolean {
  // Implementar se necessário
  return false
}

export async function getUserById(userId: number): Promise<UserRow | null> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE id = ${userId} LIMIT 1
    `
    if (result.rows.length === 0) return null
    return result.rows[0] as UserRow
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

    await sql`
      INSERT INTO sessions (user_id, token, refresh_token, device_info, ip_address, expires_at)
      VALUES (${userId}, ${token}, ${refreshToken}, ${deviceInfo || null}, ${ipAddress || null}, ${expiresAt})
    `

    return { token, refreshToken }
  } catch (error) {
    console.error('Erro ao criar sessão persistente:', error)
    throw error
  }
}

export function refreshSessionByToken(refreshToken: string): { token: string; refreshToken: string } | null {
  // Implementar se necessário
  return null
}

export function updateSessionActivity(token: string): void {
  // Implementar se necessário
}

export function getUserSessions(userId: number): SessionData[] {
  // Implementar se necessário
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
  // Implementar se necessário
  return null
}

export function getAllUserPreferences(userId: number): Record<string, string> {
  // Implementar se necessário
  return {}
}

export function deleteUserPreference(userId: number, key: string): void {
  // Implementar se necessário
}
