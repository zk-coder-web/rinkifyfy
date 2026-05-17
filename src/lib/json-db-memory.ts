/**
 * JSON Database - Versão em memória para Netlify
 * ATENÇÃO: Os dados são perdidos quando a função serverless é reiniciada
 * Para produção, considere usar um banco de dados real (Supabase, MongoDB, etc.)
 */

import { NextRequest } from 'next/server'

// Armazenamento em memória (temporário)
const memoryStore: {
  users: Record<string, User>
  codes: Record<string, VerificationCode>
  tokens: Record<string, TokenData>
} = {
  users: {},
  codes: {},
  tokens: {}
}

// ============ TOKENS E AUTENTICAÇÃO ============

export interface TokenData {
  userId: string
  email: string
  createdAt: string
}

export function saveToken(token: string, userId: string, email: string): void {
  memoryStore.tokens[token] = {
    userId,
    email,
    createdAt: new Date().toISOString()
  }
  console.log('[json-db-memory] Token salvo:', { token: token.substring(0, 10) + '...', userId, email })
}

export function getTokenData(token: string): TokenData | null {
  return memoryStore.tokens[token] || null
}

export function deleteToken(token: string): void {
  delete memoryStore.tokens[token]
  console.log('[json-db-memory] Token deletado')
}

/**
 * Extrai o userId do token de autenticação no cookie
 */
export async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      console.log('[json-db-memory] Sem cookie header')
      return null
    }

    // Extrair token do cookie auth_token
    const cookies = cookieHeader.split(';').map(c => c.trim())
    const authCookie = cookies.find(c => c.startsWith('auth_token='))
    
    if (!authCookie) {
      console.log('[json-db-memory] Cookie auth_token não encontrado')
      return null
    }

    const token = authCookie.split('=')[1]
    if (!token) {
      console.log('[json-db-memory] Token vazio')
      return null
    }

    const tokenData = getTokenData(token)
    if (!tokenData) {
      console.log('[json-db-memory] Token inválido ou expirado')
      return null
    }

    console.log('[json-db-memory] Usuário autenticado:', tokenData.userId)
    return tokenData.userId
  } catch (error) {
    console.error('[json-db-memory] Erro ao verificar token:', error)
    return null
  }
}

// ============ USUÁRIOS ============

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export function getUserByEmail(email: string): User | null {
  return memoryStore.users[email.toLowerCase()] || null
}

export function createUser(email: string, name: string): User {
  const id = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  const user: User = {
    id,
    email: email.toLowerCase(),
    name,
    createdAt: new Date().toISOString()
  }
  
  memoryStore.users[email.toLowerCase()] = user
  
  return user
}

export function getAllUsers(): User[] {
  return Object.values(memoryStore.users)
}

// ============ CÓDIGOS DE VERIFICAÇÃO ============

export interface VerificationCode {
  email: string
  code: string
  expiresAt: string
  used: boolean
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function saveCode(email: string, code: string): void {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
  
  memoryStore.codes[email.toLowerCase()] = {
    email: email.toLowerCase(),
    code,
    expiresAt,
    used: false
  }
  
  console.log('[json-db-memory] Código salvo:', { email, code, expiresAt })
}

export function getCode(email: string): VerificationCode | null {
  const code = memoryStore.codes[email.toLowerCase()]
  
  if (!code) {
    console.log('[json-db-memory] Código não encontrado para:', email)
    return null
  }
  
  // Verificar se expirou
  if (new Date(code.expiresAt) < new Date()) {
    console.log('[json-db-memory] Código expirado para:', email)
    delete memoryStore.codes[email.toLowerCase()]
    return null
  }
  
  return code
}

export function verifyCode(email: string, code: string): boolean {
  const storedCode = getCode(email.toLowerCase())
  
  if (!storedCode) {
    console.log('[json-db-memory] Código não encontrado ou expirado')
    return false
  }
  
  if (storedCode.used) {
    console.log('[json-db-memory] Código já foi usado')
    return false
  }
  
  if (storedCode.code !== code) {
    console.log('[json-db-memory] Código incorreto')
    return false
  }
  
  // Marcar como usado
  memoryStore.codes[email.toLowerCase()].used = true
  console.log('[json-db-memory] Código verificado com sucesso')
  
  return true
}

export function deleteCode(email: string): void {
  delete memoryStore.codes[email.toLowerCase()]
  console.log('[json-db-memory] Código deletado para:', email)
}

// ============ LIMPEZA ============

export function cleanupExpiredCodes(): void {
  const now = new Date()
  let cleaned = 0
  
  for (const email in memoryStore.codes) {
    if (new Date(memoryStore.codes[email].expiresAt) < now) {
      delete memoryStore.codes[email]
      cleaned++
    }
  }
  
  if (cleaned > 0) {
    console.log(`[json-db-memory] ${cleaned} códigos expirados removidos`)
  }
}
