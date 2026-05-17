/**
 * PostgreSQL database via Neon (Vercel's recommended solution)
 * Works on both local (via connection string) and Vercel (native integration)
 */
import { sql } from '@vercel/postgres'

export async function getDb() {
  return sql
}

export async function initializeDatabase() {
  try {
    console.log('[DB] Inicializando banco PostgreSQL via Neon')

    // Criar tabelas
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE COLLATE "C",
        password TEXT,
        display_name TEXT NOT NULL DEFAULT '',
        name TEXT NOT NULL DEFAULT '',
        provider TEXT NOT NULL DEFAULT 'local',
        google_id TEXT UNIQUE,
        verified INTEGER NOT NULL DEFAULT 0,
        pin TEXT,
        last_login TEXT,
        failed_logins INTEGER NOT NULL DEFAULT 0,
        locked_until TEXT,
        created_at TEXT NOT NULL DEFAULT NOW()::TEXT
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS verify_codes (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL COLLATE "C",
        code TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER NOT NULL DEFAULT 0
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS verify_tokens (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL COLLATE "C",
        token TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        used INTEGER NOT NULL DEFAULT 0
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        refresh_token TEXT UNIQUE,
        device_info TEXT,
        ip_address TEXT,
        expires_at TEXT NOT NULL,
        last_active TEXT NOT NULL DEFAULT NOW()::TEXT,
        created_at TEXT NOT NULL DEFAULT NOW()::TEXT
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS notif_read (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notif_id TEXT NOT NULL,
        PRIMARY KEY (user_id, notif_id)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS pending_pins (
        email TEXT NOT NULL PRIMARY KEY COLLATE "C",
        pin TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS paginas (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        place_id TEXT NOT NULL,
        instagram TEXT NOT NULL DEFAULT '',
        whatsapp TEXT NOT NULL DEFAULT '',
        slug TEXT NOT NULL UNIQUE,
        google_review_link TEXT NOT NULL,
        ativa INTEGER NOT NULL DEFAULT 1,
        cliques_instagram INTEGER NOT NULL DEFAULT 0,
        cliques_whatsapp INTEGER NOT NULL DEFAULT 0,
        cliques_google INTEGER NOT NULL DEFAULT 0,
        avaliacoes INTEGER NOT NULL DEFAULT 0,
        tema TEXT NOT NULL DEFAULT 'neon-pink',
        foto_url TEXT,
        foto_rotacao REAL DEFAULT 0,
        mostrar_foto INTEGER DEFAULT 0,
        data_criacao TEXT NOT NULL DEFAULT NOW()::TEXT,
        data_atualizacao TEXT NOT NULL DEFAULT NOW()::TEXT
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tipo TEXT NOT NULL,
        mensagem TEXT NOT NULL,
        lida INTEGER NOT NULL DEFAULT 0,
        data TEXT NOT NULL DEFAULT NOW()::TEXT
      )
    `

    // Criar índices
    await sql`CREATE INDEX IF NOT EXISTS idx_paginas_user_id ON paginas(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug)`
    await sql`CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida)`

    console.log('[DB] Banco PostgreSQL inicializado com sucesso')
  } catch (error: any) {
    console.error('[DB] Erro ao inicializar banco:', error.message)
    throw error
  }
}
