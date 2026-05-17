#!/usr/bin/env node

/**
 * Script para criar o schema PostgreSQL no Neon
 * Uso: node scripts/create-postgres-schema.js
 */

// Carregar variáveis de ambiente do .env.vercel
require('dotenv').config({ path: '.env.vercel' });

const { sql } = require('@vercel/postgres');

const schema = `
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));

-- Tabela de códigos de verificação
CREATE TABLE IF NOT EXISTS verify_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_verify_codes_email ON verify_codes (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_verify_codes_expires ON verify_codes (expires_at);

-- Tabela de tokens de verificação
CREATE TABLE IF NOT EXISTS verify_tokens (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_verify_tokens_token ON verify_tokens (token);
CREATE INDEX IF NOT EXISTS idx_verify_tokens_email ON verify_tokens (LOWER(email));

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  refresh_token TEXT NOT NULL UNIQUE,
  device_info TEXT,
  ip_address TEXT,
  expires_at TIMESTAMP NOT NULL,
  last_active TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions (refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

-- Tabela de notificações lidas
CREATE TABLE IF NOT EXISTS notif_read (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notif_id TEXT NOT NULL,
  PRIMARY KEY (user_id, notif_id)
);

-- Tabela de PINs pendentes
CREATE TABLE IF NOT EXISTS pending_pins (
  email TEXT NOT NULL PRIMARY KEY,
  pin TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pending_pins_expires ON pending_pins (expires_at);

-- Tabela de páginas
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
  data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paginas_user_id ON paginas (user_id);
CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas (slug);
CREATE INDEX IF NOT EXISTS idx_paginas_place_id ON paginas (place_id);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida INTEGER NOT NULL DEFAULT 0,
  data TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes (user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes (lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data ON notificacoes (data DESC);

-- Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);
`;

async function createSchema() {
  try {
    // Verificar se POSTGRES_URL está configurada
    if (!process.env.POSTGRES_URL) {
      console.error('❌ Erro: POSTGRES_URL não está configurada');
      console.error('');
      console.error('💡 Solução:');
      console.error('1. Verifique se o arquivo .env.vercel existe');
      console.error('2. Verifique se POSTGRES_URL está no arquivo');
      console.error('3. Ou configure manualmente:');
      console.error('');
      console.error('   set POSTGRES_URL=postgresql://neondb_owner:npg_0UokGVPhaX4y@ep-royal-base-ap816j58-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require');
      console.error('   node scripts/create-postgres-schema.js');
      process.exit(1);
    }

    console.log('🔄 Conectando ao banco de dados...');
    console.log(`📍 Host: ${process.env.POSTGRES_URL.split('@')[1]?.split('/')[0] || 'desconhecido'}`);
    
    // Dividir o schema em statements individuais
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📋 Executando ${statements.length} statements...`);
    console.log('');

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        process.stdout.write(`[${i + 1}/${statements.length}] `);
        await sql.query(stmt);
        console.log('✅');
        successCount++;
      } catch (error) {
        // Ignorar erros de "already exists"
        if (error.message && (error.message.includes('already exists') || error.message.includes('duplicate key'))) {
          console.log('⏭️  (já existe)');
          skipCount++;
        } else {
          console.log('❌');
          throw error;
        }
      }
    }

    console.log('');
    console.log('✅ Schema criado com sucesso!');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`  ✅ Executados: ${successCount}`);
    console.log(`  ⏭️  Pulados: ${skipCount}`);
    console.log('');
    console.log('📋 Tabelas criadas:');
    console.log('  ✅ users');
    console.log('  ✅ verify_codes');
    console.log('  ✅ verify_tokens');
    console.log('  ✅ sessions');
    console.log('  ✅ notif_read');
    console.log('  ✅ pending_pins');
    console.log('  ✅ paginas');
    console.log('  ✅ notificacoes');
    console.log('  ✅ user_preferences');
    console.log('');
    console.log('🎉 Banco de dados pronto para usar!');
    console.log('');
    console.log('📝 Próximos passos:');
    console.log('  1. Fazer redeploy no Vercel');
    console.log('  2. Testar envio de código de verificação');
    console.log('  3. Sistema funcionará perfeitamente!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar schema:');
    console.error(error.message);
    console.error('');
    console.error('💡 Dicas:');
    console.error('  1. Verifique se POSTGRES_URL está configurada');
    console.error('  2. Verifique se a conexão com o banco está funcionando');
    console.error('  3. Tente executar o SQL manualmente no Neon Console');
    console.error('');
    console.error('📍 Detalhes do erro:');
    console.error(error);
    process.exit(1);
  }
}

createSchema();
