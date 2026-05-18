/**
 * Database router — SQLite local, PostgreSQL (Neon) em produção
 * Detecta automaticamente o ambiente e usa o driver apropriado
 */
import path from 'path'

const IS_VERCEL = !!(
  process.env.VERCEL === '1' ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_URL ||
  process.env.VERCEL_REGION
)

const IS_NETLIFY = !!(
  process.env.NETLIFY === 'true' ||
  process.env.NETLIFY_DEV ||
  process.env.CONTEXT
)

// Se tem DATABASE_URL, usar PostgreSQL
const USE_POSTGRES = !!process.env.DATABASE_URL

// Importação condicional de better-sqlite3
let Database: any = null
if (!USE_POSTGRES && !IS_VERCEL && !IS_NETLIFY) {
  try {
    Database = require('better-sqlite3')
  } catch (error) {
    console.warn('[DB] better-sqlite3 não disponível')
  }
}

console.log('[DB] Inicializando banco de dados:', {
  environment: USE_POSTGRES ? 'PostgreSQL (Neon)' : IS_VERCEL ? 'Vercel' : IS_NETLIFY ? 'Netlify (SQLite)' : 'Local (SQLite)',
  usePostgres: USE_POSTGRES,
  vercelDetected: IS_VERCEL,
  netlifyDetected: IS_NETLIFY,
})

let _db: any = null

export function getDb(): any {
  // Se usar PostgreSQL, lançar erro para usar db-postgres.ts
  if (USE_POSTGRES) {
    throw new Error(
      'DATABASE_URL detectada! Use as funções de @/lib/db-postgres em vez de getDb(). ' +
      'As funções de auth precisam ser migradas para PostgreSQL.'
    )
  }
  
  if (IS_VERCEL) {
    throw new Error(
      'Você está em Vercel! Use @vercel/postgres em vez de better-sqlite3.'
    )
  }
  
  // No Netlify sem DATABASE_URL, usar SQLite em /tmp
  if (IS_NETLIFY) {
    if (!Database) {
      try {
        Database = require('better-sqlite3')
      } catch (error) {
        throw new Error('better-sqlite3 não está disponível no Netlify.')
      }
    }
    
    if (!_db) {
      try {
        const DB_PATH = '/tmp/rankify.db'
        _db = new Database(DB_PATH)
        _db.pragma('journal_mode = WAL')
        _db.pragma('foreign_keys = ON')
        _db.pragma('busy_timeout = 5000')
        
        console.log('[DB] Banco SQLite inicializado no Netlify (/tmp/rankify.db)')
        migrate(_db)
      } catch (error: any) {
        console.error('[DB] Erro ao inicializar banco de dados no Netlify:', error.message)
        throw error
      }
    }
    return _db
  }
  
  if (!Database) {
    throw new Error('better-sqlite3 não está disponível neste ambiente')
  }

  if (!_db) {
    try {
      const DB_PATH = path.join(process.cwd(), 'rankify.db')
      _db = new Database(DB_PATH)
      _db.pragma('journal_mode = WAL')
      _db.pragma('foreign_keys = ON')
      _db.pragma('busy_timeout = 5000')
      
      console.log('[DB] Banco SQLite inicializado com sucesso')
      migrate(_db)
    } catch (error: any) {
      console.error('[DB] Erro ao inicializar banco de dados:', error.message)
      throw error
    }
  }
  return _db
}

function migrate(db: any) {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        email        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
        password     TEXT,           
        display_name TEXT    NOT NULL DEFAULT '',
        name         TEXT    NOT NULL DEFAULT '',  -- Nome real do usuário (editável)
        provider     TEXT    NOT NULL DEFAULT 'local',
        google_id    TEXT    UNIQUE,
        verified     INTEGER NOT NULL DEFAULT 0,
        pin          TEXT,           
        last_login   TEXT,          
        failed_logins INTEGER NOT NULL DEFAULT 0,
        locked_until TEXT,
        created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS verify_codes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        email      TEXT    NOT NULL COLLATE NOCASE,
        code       TEXT    NOT NULL,
        expires_at TEXT    NOT NULL,
        used       INTEGER NOT NULL DEFAULT 0
      );

      -- Tokens de verificação por link (mais seguro e user-friendly)
      CREATE TABLE IF NOT EXISTS verify_tokens (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        email      TEXT    NOT NULL COLLATE NOCASE,
        token      TEXT    NOT NULL UNIQUE,
        expires_at TEXT    NOT NULL,
        used       INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token        TEXT    NOT NULL UNIQUE,
        refresh_token TEXT   NOT NULL UNIQUE,
        device_info  TEXT,
        ip_address   TEXT,
        expires_at   TEXT    NOT NULL,
        last_active  TEXT    NOT NULL DEFAULT (datetime('now')),
        created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS notif_read (
        user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notif_id TEXT    NOT NULL,
        PRIMARY KEY (user_id, notif_id)
      );

      -- Persists pending PINs across hot-reloads (TTL = 30 min)
      CREATE TABLE IF NOT EXISTS pending_pins (
        email      TEXT NOT NULL PRIMARY KEY COLLATE NOCASE,
        pin        TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );

      -- Tabela para páginas dos usuários
      CREATE TABLE IF NOT EXISTS paginas (
        id                 INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nome               TEXT    NOT NULL,
        place_id           TEXT    NOT NULL,
        instagram          TEXT    NOT NULL DEFAULT '',
        whatsapp           TEXT    NOT NULL DEFAULT '',
        slug               TEXT    NOT NULL UNIQUE,
        google_review_link TEXT    NOT NULL,
        ativa              INTEGER NOT NULL DEFAULT 1,
        cliques_instagram  INTEGER NOT NULL DEFAULT 0,
        cliques_whatsapp   INTEGER NOT NULL DEFAULT 0,
        cliques_google     INTEGER NOT NULL DEFAULT 0,
        avaliacoes         INTEGER NOT NULL DEFAULT 0,
        tema               TEXT    NOT NULL DEFAULT 'neon-pink',
        data_criacao       TEXT    NOT NULL DEFAULT (datetime('now')),
        data_atualizacao   TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      -- Tabela para notificações dos usuários
      CREATE TABLE IF NOT EXISTS notificacoes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tipo       TEXT    NOT NULL,
        mensagem   TEXT    NOT NULL,
        lida       INTEGER NOT NULL DEFAULT 0,
        data       TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      -- Índices para melhor performance
      CREATE INDEX IF NOT EXISTS idx_paginas_user_id ON paginas(user_id);
      CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug);
      CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes(user_id);
      CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
    `)

    console.log('[DB] Tabelas criadas/verificadas com sucesso')

    // Safe column additions for existing DBs
    const safeAlter = (sql: string) => { 
      try { 
        db.exec(sql) 
      } catch (e) { 
        // Coluna já existe, ignorar
      } 
    }
    safeAlter(`ALTER TABLE users ADD COLUMN pin TEXT`)
    safeAlter(`ALTER TABLE users ADD COLUMN last_login TEXT`)
    safeAlter(`ALTER TABLE users ADD COLUMN failed_logins INTEGER NOT NULL DEFAULT 0`)
    safeAlter(`ALTER TABLE users ADD COLUMN locked_until TEXT`)
    safeAlter(`ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT ''`)
    safeAlter(`ALTER TABLE users ADD COLUMN photo TEXT`)
    safeAlter(`ALTER TABLE paginas ADD COLUMN tema TEXT NOT NULL DEFAULT 'neon-pink'`)
    safeAlter(`ALTER TABLE paginas ADD COLUMN foto_url TEXT`)
    safeAlter(`ALTER TABLE paginas ADD COLUMN foto_rotacao REAL DEFAULT 0`)
    safeAlter(`ALTER TABLE paginas ADD COLUMN mostrar_foto INTEGER DEFAULT 0`)
    safeAlter(`ALTER TABLE sessions ADD COLUMN refresh_token TEXT UNIQUE`)
    safeAlter(`ALTER TABLE sessions ADD COLUMN device_info TEXT`)
    safeAlter(`ALTER TABLE sessions ADD COLUMN ip_address TEXT`)
    safeAlter(`ALTER TABLE sessions ADD COLUMN last_active TEXT DEFAULT (datetime('now'))`)
    safeAlter(`ALTER TABLE sessions ADD COLUMN created_at TEXT DEFAULT (datetime('now'))`)
    safeAlter(`ALTER TABLE sessions ADD COLUMN expires_at TEXT`)
  } catch (error: any) {
    console.error('[DB] Erro durante migração:', error.message)
    throw error
  }
}
