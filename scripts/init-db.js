#!/usr/bin/env node

/**
 * Script para inicializar o banco de dados do Rankify
 * Execute: node scripts/init-db.js
 */

const path = require('path')
const Database = require('better-sqlite3')

const DB_PATH = path.join(process.cwd(), 'rankify.db')

console.log('🚀 Inicializando banco de dados do Rankify...')
console.log(`📁 Caminho do banco: ${DB_PATH}`)

try {
  // Conectar ao banco de dados
  const db = new Database(DB_PATH)
  
  // Configurar pragmas
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('busy_timeout = 5000')

  // Criar tabelas
  console.log('📊 Criando tabelas...')
  
  db.exec(`
    -- Tabela de usuários
    CREATE TABLE IF NOT EXISTS users (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      email        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      password     TEXT,           
      display_name TEXT    NOT NULL DEFAULT '',
      provider     TEXT    NOT NULL DEFAULT 'local',
      google_id    TEXT    UNIQUE,
      verified     INTEGER NOT NULL DEFAULT 0,
      pin          TEXT,           
      last_login   TEXT,          
      failed_logins INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Tabela de códigos de verificação
    CREATE TABLE IF NOT EXISTS verify_codes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT    NOT NULL COLLATE NOCASE,
      code       TEXT    NOT NULL,
      expires_at TEXT    NOT NULL,
      used       INTEGER NOT NULL DEFAULT 0
    );

    -- Tabela de sessões
    CREATE TABLE IF NOT EXISTS sessions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token      TEXT    NOT NULL UNIQUE,
      refresh_token TEXT,
      device_info TEXT,
      ip_address  TEXT,
      last_active  TEXT    NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Tabela de preferências do usuário
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key        TEXT    NOT NULL,
      value      TEXT,
      updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, key)
    );

    -- Tabela de notificações lidas
    CREATE TABLE IF NOT EXISTS notif_read (
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      notif_id TEXT    NOT NULL,
      PRIMARY KEY (user_id, notif_id)
    );

    -- Tabela de PINs pendentes
    CREATE TABLE IF NOT EXISTS pending_pins (
      email      TEXT NOT NULL PRIMARY KEY COLLATE NOCASE,
      pin        TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    -- Tabela de páginas
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
      data_criacao       TEXT    NOT NULL DEFAULT (datetime('now')),
      data_atualizacao   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Tabela de notificações
    CREATE TABLE IF NOT EXISTS notificacoes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tipo       TEXT    NOT NULL,
      mensagem   TEXT    NOT NULL,
      lida       INTEGER NOT NULL DEFAULT 0,
      data       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_paginas_user_id ON paginas(user_id);
    CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug);
    CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes(user_id);
    CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_refresh ON sessions(refresh_token);
    CREATE INDEX IF NOT EXISTS idx_user_prefs_user_id ON user_preferences(user_id);
  `)

  console.log('✅ Tabelas criadas com sucesso!')

  // Adicionar colunas de forma segura
  console.log('🔧 Verificando colunas...')
  
  const safeAlter = (sql) => {
    try { 
      db.exec(sql) 
      console.log(`   ✅ ${sql}`)
    } catch (e) { 
      // Coluna já existe, ignorar
    }
  }

  safeAlter(`ALTER TABLE users ADD COLUMN pin TEXT`)
  safeAlter(`ALTER TABLE users ADD COLUMN last_login TEXT`)
  safeAlter(`ALTER TABLE users ADD COLUMN failed_logins INTEGER NOT NULL DEFAULT 0`)
  safeAlter(`ALTER TABLE users ADD COLUMN locked_until TEXT`)

  // Criar usuário admin de exemplo (senha: admin123)
  console.log('👤 Criando usuário admin de exemplo...')
  
  try {
    const adminEmail = 'admin@rankify.com'
    const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)
    
    if (!adminExists) {
      db.prepare(`
        INSERT INTO users (email, password, display_name, verified, created_at)
        VALUES (?, ?, ?, 1, datetime('now'))
      `).run(adminEmail, 'admin123', 'Administrador')
      
      console.log('   ✅ Usuário admin criado:')
      console.log('      Email: admin@rankify.com')
      console.log('      Senha: admin123')
    } else {
      console.log('   ⚠️  Usuário admin já existe')
    }
  } catch (error) {
    console.log('   ⚠️  Erro ao criar usuário admin:', error.message)
  }

  // Fechar conexão
  db.close()
  
  console.log('\n🎉 Banco de dados inicializado com sucesso!')
  console.log('\n📋 Próximos passos:')
  console.log('   1. Renomeie .env.local.example para .env.local')
  console.log('   2. Execute: npm run dev')
  console.log('   3. Acesse: http://localhost:3000')
  console.log('   4. Faça login com:')
  console.log('      Email: admin@rankify.com')
  console.log('      Senha: admin123')
  
} catch (error) {
  console.error('❌ Erro ao inicializar banco de dados:', error)
  process.exit(1)
}