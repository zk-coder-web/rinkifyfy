/**
 * JSON Database - Armazenamento simples em arquivo JSON
 * Para desenvolvimento e testes rápidos
 */

import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const CODES_FILE = path.join(DATA_DIR, 'codes.json')

// Garantir que o diretório existe
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Ler arquivo JSON
function readJSON(filePath: string): any {
  ensureDataDir()
  try {
    if (!fs.existsSync(filePath)) {
      return {}
    }
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Erro ao ler ${filePath}:`, error)
    return {}
  }
}

// Escrever arquivo JSON
function writeJSON(filePath: string, data: any) {
  ensureDataDir()
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Erro ao escrever ${filePath}:`, error)
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
  const users = readJSON(USERS_FILE)
  return users[email.toLowerCase()] || null
}

export function createUser(email: string, name: string): User {
  const users = readJSON(USERS_FILE)
  const id = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  const user: User = {
    id,
    email: email.toLowerCase(),
    name,
    createdAt: new Date().toISOString()
  }
  
  users[email.toLowerCase()] = user
  writeJSON(USERS_FILE, users)
  
  return user
}

export function getAllUsers(): User[] {
  const users = readJSON(USERS_FILE)
  return Object.values(users)
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
  const codes = readJSON(CODES_FILE)
  
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
  
  codes[email.toLowerCase()] = {
    email: email.toLowerCase(),
    code,
    expiresAt,
    used: false
  }
  
  writeJSON(CODES_FILE, codes)
}

export function getCode(email: string): VerificationCode | null {
  const codes = readJSON(CODES_FILE)
  const code = codes[email.toLowerCase()]
  
  if (!code) return null
  
  // Verificar se expirou
  if (new Date(code.expiresAt) < new Date()) {
    delete codes[email.toLowerCase()]
    writeJSON(CODES_FILE, codes)
    return null
  }
  
  return code
}

export function verifyCode(email: string, code: string): boolean {
  const storedCode = getCode(email.toLowerCase())
  
  if (!storedCode) return false
  if (storedCode.used) return false
  if (storedCode.code !== code) return false
  
  // Marcar como usado
  const codes = readJSON(CODES_FILE)
  codes[email.toLowerCase()].used = true
  writeJSON(CODES_FILE, codes)
  
  return true
}

export function deleteCode(email: string): void {
  const codes = readJSON(CODES_FILE)
  delete codes[email.toLowerCase()]
  writeJSON(CODES_FILE, codes)
}

// ============ LIMPEZA ============

export function cleanupExpiredCodes(): void {
  const codes = readJSON(CODES_FILE)
  const now = new Date()
  
  let cleaned = false
  for (const email in codes) {
    if (new Date(codes[email].expiresAt) < now) {
      delete codes[email]
      cleaned = true
    }
  }
  
  if (cleaned) {
    writeJSON(CODES_FILE, codes)
  }
}
