#!/usr/bin/env node

/**
 * Script de migração para adicionar colunas de sessão persistente
 * Execute: node scripts/migrate-sessions.js
 */

const path = require('path')
const Database = require('better-sqlite3')

const DB_PATH = path.join(process.cwd(), 'rankify.db')

console.log('🔄 Verificando schema do banco de dados...')

try {
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  
  // Verificar se a coluna refresh_token existe na tabela sessions
  const tableInfo = db.prepare("PRAGMA table_info(sessions)").all()
  const columns = tableInfo.map(col => col.name)
  
  console.log('📋 Colunas atuais na tabela sessions:', columns.join(', '))
  
  // Adicionar colunas que não existem
  const safeAlter = (sql, colName) => {
    try { 
      db.exec(sql) 
      console.log(`   ✅ Adicionada coluna: ${colName}`)
    } catch (e) { 
      if (e.message.includes('duplicate')) {
        console.log(`   ⚠️  Coluna já existe: ${colName}`)
      } else {
        console.log(`   ❌ Erro ao adicionar ${colName}: ${e.message}`)
      }
    }
  }
  
  if (!columns.includes('refresh_token')) {
    safeAlter('ALTER TABLE sessions ADD COLUMN refresh_token TEXT', 'refresh_token')
  }
  
  if (!columns.includes('device_info')) {
    safeAlter('ALTER TABLE sessions ADD COLUMN device_info TEXT', 'device_info')
  }
  
  if (!columns.includes('ip_address')) {
    safeAlter('ALTER TABLE sessions ADD COLUMN ip_address TEXT', 'ip_address')
  }
  
  if (!columns.includes('last_active')) {
    safeAlter('ALTER TABLE sessions ADD COLUMN last_active TEXT', 'last_active')
  }
  
  // Verificar se a tabela user_preferences existe
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_preferences'").all()
  
  if (tables.length === 0) {
    console.log('📊 Criando tabela user_preferences...')
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key        TEXT    NOT NULL,
        value      TEXT,
        updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (user_id, key)
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_prefs_user_id ON user_preferences(user_id);
    `)
    console.log('   ✅ Tabela user_preferences criada')
  } else {
    console.log('   ⚠️  Tabela user_preferences já existe')
  }
  
  // Verificar se a coluna 'name' existe na tabela users
  if (!columns.includes('name')) {
    safeAlter('ALTER TABLE users ADD COLUMN name TEXT', 'name')
  }
  
  db.close()
  
  console.log('\n✅ Migração concluída!')
  console.log('\n📝 Nota: Se as colunas ainda não aparecerem, delete o arquivo rankify.db e rode:')
  console.log('   node scripts/init-db.js')
  
} catch (error) {
  console.error('❌ Erro na migração:', error)
  process.exit(1)
}