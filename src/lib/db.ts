/**
 * SQLite database singleton — Rankify
 * WAL mode + foreign keys + safe migrations
 * Suporta tanto arquivo (local) quanto memória (Vercel/serverless)
 */
import path from 'path'
import Database from 'better-sqlite3'

// Detectar ambiente Vercel automaticamente
// Vercel define várias variáveis de ambiente automaticamente
const IS_VERCEL = !!(
  process.env.VERCEL === '1' ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_URL ||
  process.env.VERCEL_REGION
)

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Em produção (Vercel), usar memória. Localmente, usar arquivo.
const DB_PATH = IS_VERCEL ? ':memory:' : path.join(process.cwd(), 'rankify.db')

console.log('[DB] Inicializando banco de dados:', {
  environment: IS_VERCEL ? 'Vercel (serverless)' : 'Local',
  path: DB_PATH,
  mode: IS_VERCEL ? 'In-Memory' : 'File-based',
  vercelDetected: IS_VERCEL,
  vercelEnv: process.env.VERCEL_ENV,
  vercelUrl: process.env.VERCEL_URL,
})

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    try {
      _db = new Database(DB_PATH)
      _db.pragma('journal_mode = WAL')
      _db.pragma('foreign_keys = ON')
      _db.pragma('busy_timeout = 5000')   // wait up to 5s on lock
      
      console.log('[DB] Banco de dados inicializado com sucesso')
      migrate(_db)
    } catch (error: any) {
      console.error('[DB] Erro ao inicializar banco de dados:', error.message)
      console.error('[DB] Stack:', error.stack)
      throw error
    }
  }
  return _db
}

function migrate(db: Database.Database) {
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
