/**
 * Adapter que detecta automaticamente se deve usar SQLite ou PostgreSQL
 * Exporta as mesmas funções, mas usa o driver correto baseado no ambiente
 */

// Detectar se deve usar PostgreSQL
const USE_POSTGRES = !!process.env.DATABASE_URL

// Importar do módulo correto
let authModule: any

if (USE_POSTGRES) {
  console.log('[Auth] Usando PostgreSQL (Neon)')
  authModule = require('./auth-postgres')
} else {
  console.log('[Auth] Usando SQLite (local)')
  authModule = require('./auth')
}

// Re-exportar todas as funções
export const getUserIdFromToken = authModule.getUserIdFromToken
export const getSessionUser = authModule.getSessionUser
export const getUserByEmail = authModule.getUserByEmail
export const getUserPin = authModule.getUserPin
export const verifyPassword = authModule.verifyPassword
export const checkLoginRateLimit = authModule.checkLoginRateLimit
export const recordLogin = authModule.recordLogin
export const generateCode = authModule.generateCode
export const saveVerifyCode = authModule.saveVerifyCode
export const consumeVerifyCode = authModule.consumeVerifyCode
export const wasCodeVerified = authModule.wasCodeVerified
export const generateUniquePin = authModule.generateUniquePin
export const verifyUserPin = authModule.verifyUserPin
export const validatePassword = authModule.validatePassword
export const hashPassword = authModule.hashPassword
export const createLocalUser = authModule.createLocalUser
export const updateUserPassword = authModule.updateUserPassword
export const displayNameFromEmail = authModule.displayNameFromEmail
export const markNotifRead = authModule.markNotifRead
export const getReadNotifIds = authModule.getReadNotifIds
export const createSession = authModule.createSession
export const deleteSession = authModule.deleteSession
export const generateVerifyToken = authModule.generateVerifyToken
export const saveVerifyToken = authModule.saveVerifyToken
export const consumeVerifyToken = authModule.consumeVerifyToken
export const updateUserName = authModule.updateUserName
export const getUserById = authModule.getUserById
export const createPersistentSession = authModule.createPersistentSession
export const setUserPreference = authModule.setUserPreference
export const getUserPreference = authModule.getUserPreference
export const getAllUserPreferences = authModule.getAllUserPreferences
export const deleteUserPreference = authModule.deleteUserPreference
export const markUserVerified = authModule.markUserVerified
export const executeUpdate = authModule.executeUpdate
export const updateUserPin = authModule.updateUserPin
