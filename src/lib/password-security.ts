/**
 * Sistema profissional de segurança para armazenamento de senhas
 * Padrão de segurança de plataformas SaaS modernas e bancos digitais
 */

import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Configurações de segurança
const BCRYPT_COST = 14 // Custo alto (2^14 iterações) - mais seguro que o padrão 12
const PEPPER = process.env.PASSWORD_PEPPER || 'default-pepper-change-in-production'
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_TIME_MS = 15 * 60 * 1000 // 15 minutos

// Cache de tentativas de login para rate limiting
const loginAttempts = new Map<string, { count: number; lockedUntil: number | null }>()

/**
 * Gera um hash seguro para senha usando bcrypt com pepper
 * - Salt automático e único por usuário (gerado pelo bcrypt)
 * - Pepper adicional (chave secreta do servidor)
 * - Custo alto (14) para resistência a ataques de força bruta
 */
export async function hashPasswordSecure(plainPassword: string): Promise<string> {
  // Adiciona pepper antes de fazer o hash
  const pepperedPassword = plainPassword + PEPPER
  
  // Gera hash com bcrypt (já inclui salt único)
  const hash = await bcrypt.hash(pepperedPassword, BCRYPT_COST)
  
  return hash
}

/**
 * Verifica uma senha contra o hash armazenado
 * - Compara com pepper
 * - Retorna boolean indicando se a senha está correta
 * - Mensagens de erro genéricas para evitar vazamento de informações
 */
export async function verifyPasswordSecure(
  plainPassword: string, 
  storedHash: string
): Promise<boolean> {
  // Adiciona pepper antes de verificar
  const pepperedPassword = plainPassword + PEPPER
  
  // Verifica com bcrypt
  const isValid = await bcrypt.compare(pepperedPassword, storedHash)
  
  return isValid
}

/**
 * Verifica se uma senha atende aos requisitos de segurança
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula  
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'A senha deve ter no mínimo 8 caracteres.' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula.' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos uma letra minúscula.' }
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos um número.' }
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos um caractere especial.' }
  }
  
  return { valid: true }
}

/**
 * Sistema de rate limiting para proteção contra força bruta
 * - Limita tentativas de login por IP/email
 * - Bloqueia temporariamente após muitas tentativas
 */
export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts?: number; lockoutTime?: number } {
  const now = Date.now()
  const attemptData = loginAttempts.get(identifier) || { count: 0, lockedUntil: null }
  
  // Se estiver bloqueado, verifica se já expirou
  if (attemptData.lockedUntil && now < attemptData.lockedUntil) {
    const remainingTime = Math.ceil((attemptData.lockedUntil - now) / 1000 / 60) // minutos
    return { 
      allowed: false, 
      lockoutTime: remainingTime 
    }
  }
  
  // Se não estiver bloqueado ou bloqueio expirou, reseta
  if (attemptData.lockedUntil && now >= attemptData.lockedUntil) {
    attemptData.count = 0
    attemptData.lockedUntil = null
  }
  
  // Verifica se excedeu o limite
  if (attemptData.count >= MAX_LOGIN_ATTEMPTS) {
    // Bloqueia por 15 minutos
    attemptData.lockedUntil = now + LOCKOUT_TIME_MS
    loginAttempts.set(identifier, attemptData)
    
    return { 
      allowed: false, 
      lockoutTime: 15 // 15 minutos
    }
  }
  
  return { 
    allowed: true, 
    remainingAttempts: MAX_LOGIN_ATTEMPTS - attemptData.count 
  }
}

/**
 * Registra uma tentativa de login (sucesso ou falha)
 * - Incrementa contador para falhas
 * - Reseta contador para sucesso
 */
export function recordLoginAttempt(identifier: string, success: boolean): void {
  if (success) {
    // Reseta contador em caso de sucesso
    loginAttempts.delete(identifier)
  } else {
    // Incrementa contador em caso de falha
    const attemptData = loginAttempts.get(identifier) || { count: 0, lockedUntil: null }
    attemptData.count += 1
    loginAttempts.set(identifier, attemptData)
  }
}

/**
 * Gera um token seguro para redefinição de senha
 * - Token criptograficamente seguro
 * - Expiração configurável
 */
export function generateResetToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hora
  
  return { token, expiresAt }
}

/**
 * Verifica se um token de redefinição é válido
 */
export function validateResetToken(token: string, storedToken: string, storedExpiresAt: Date): boolean {
  const now = new Date()
  
  // Verifica se o token corresponde e não expirou
  if (token !== storedToken) return false
  if (now > storedExpiresAt) return false
  
  return true
}

/**
 * Limpa dados antigos do rate limiting (para evitar memory leak)
 */
export function cleanupOldAttempts(): void {
  const now = Date.now()
  const oneHourAgo = now - 60 * 60 * 1000
  
  for (const [identifier, data] of loginAttempts.entries()) {
    // Remove entradas antigas (mais de 1 hora sem atividade)
    if (data.lockedUntil && data.lockedUntil < oneHourAgo) {
      loginAttempts.delete(identifier)
    }
  }
}

// Executa limpeza a cada hora
setInterval(cleanupOldAttempts, 60 * 60 * 1000)