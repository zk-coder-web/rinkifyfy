/**
 * PostgreSQL Database Connection (Neon)
 * Compatível com Netlify e Vercel
 */
import { Pool } from '@neondatabase/serverless'

let pool: Pool | null = null

export function getPostgresPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      throw new Error('DATABASE_URL não configurada. Configure a connection string do Neon.')
    }
    
    pool = new Pool({ connectionString })
    console.log('[DB-Postgres] Pool de conexão criado')
  }
  
  return pool
}

/**
 * Executa uma query no PostgreSQL
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getPostgresPool()
  const result = await pool.query(sql, params)
  return result.rows as T[]
}

/**
 * Executa uma query que retorna um único resultado
 */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] || null
}

/**
 * Executa uma query de modificação (INSERT, UPDATE, DELETE)
 */
export async function execute(sql: string, params: any[] = []): Promise<number> {
  const pool = getPostgresPool()
  const result = await pool.query(sql, params)
  return result.rowCount || 0
}

/**
 * Inicializa o schema do banco de dados
 */
export async function initializeSchema(): Promise<void> {
  console.log('[DB-Postgres] Inicializando schema...')
  
  const pool = getPostgresPool()
  
  await pool.query(`
    -- Tabela de usuários
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT,
      display_name VARCHAR(255) NOT NULL DEFAULT '',
      name VARCHAR(255) NOT NULL DEFAULT '',
      provider VARCHAR(50) NOT NULL DEFAULT 'local',
      google_id VARCHAR(255) UNIQUE,
      verified BOOLEAN NOT NULL DEFAULT false,
      pin VARCHAR(4),
      last_login TIMESTAMP,
      failed_logins INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMP,
      picture TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Índice para email (case-insensitive)
    CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

    -- Tabela de sessões
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      refresh_token TEXT NOT NULL UNIQUE,
      device_info TEXT,
      ip_address VARCHAR(45),
      expires_at TIMESTAMP NOT NULL,
      last_active TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Índices para sessões
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);

    -- Tabela de códigos de verificação
    CREATE TABLE IF NOT EXISTS verify_codes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Índice para verify_codes
    CREATE INDEX IF NOT EXISTS idx_verify_codes_email ON verify_codes (LOWER(email));

    -- Tabela de tokens de verificação (links)
    CREATE TABLE IF NOT EXISTS verify_tokens (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Índice para verify_tokens
    CREATE INDEX IF NOT EXISTS idx_verify_tokens_token ON verify_tokens (token);

    -- Tabela de PINs pendentes
    CREATE TABLE IF NOT EXISTS pending_pins (
      email VARCHAR(255) PRIMARY KEY,
      pin VARCHAR(4) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Tabela de páginas
    CREATE TABLE IF NOT EXISTS paginas (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nome VARCHAR(255) NOT NULL,
      place_id VARCHAR(27) NOT NULL,
      instagram VARCHAR(255) NOT NULL DEFAULT '',
      whatsapp VARCHAR(20) NOT NULL DEFAULT '',
      slug VARCHAR(255) NOT NULL UNIQUE,
      google_review_link TEXT NOT NULL,
      ativa BOOLEAN NOT NULL DEFAULT true,
      cliques_instagram INTEGER NOT NULL DEFAULT 0,
      cliques_whatsapp INTEGER NOT NULL DEFAULT 0,
      cliques_google INTEGER NOT NULL DEFAULT 0,
      avaliacoes INTEGER NOT NULL DEFAULT 0,
      tema VARCHAR(50) NOT NULL DEFAULT 'neon-pink',
      foto_url TEXT,
      foto_rotacao REAL DEFAULT 0,
      mostrar_foto BOOLEAN DEFAULT false,
      data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
      data_atualizacao TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Índices para páginas
    CREATE INDEX IF NOT EXISTS idx_paginas_user_id ON paginas (user_id);
    CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas (slug);

    -- Tabela de notificações
    CREATE TABLE IF NOT EXISTS notificacoes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tipo VARCHAR(50) NOT NULL,
      mensagem TEXT NOT NULL,
      lida BOOLEAN NOT NULL DEFAULT false,
      data TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Índices para notificações
    CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes (user_id);
    CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes (lida);

    -- Tabela de notificações lidas
    CREATE TABLE IF NOT EXISTS notif_read (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      notif_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, notif_id)
    );

    -- Tabela de preferências do usuário
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key VARCHAR(255) NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, key)
    );
  `)
  
  console.log('[DB-Postgres] Schema inicializado com sucesso')
}
