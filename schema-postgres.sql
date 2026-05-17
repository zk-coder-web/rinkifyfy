-- ============================================
-- SCHEMA POSTGRESQL PARA VERCEL/NEON
-- RankUp/Rankify Application
-- ============================================

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

-- Índice para email (case insensitive)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));

-- Tabela de códigos de verificação (6 dígitos)
CREATE TABLE IF NOT EXISTS verify_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_verify_codes_email ON verify_codes (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_verify_codes_expires ON verify_codes (expires_at);

-- Tabela de tokens de verificação (links seguros)
CREATE TABLE IF NOT EXISTS verify_tokens (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_verify_tokens_token ON verify_tokens (token);
CREATE INDEX IF NOT EXISTS idx_verify_tokens_email ON verify_tokens (LOWER(email));

-- Tabela de sessões (com refresh token)
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

-- Tabela de PINs pendentes (temporários, 30 min TTL)
CREATE TABLE IF NOT EXISTS pending_pins (
  email TEXT NOT NULL PRIMARY KEY,
  pin TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pending_pins_expires ON pending_pins (expires_at);

-- Tabela de páginas (landing pages dos usuários)
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

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para limpar códigos de verificação expirados
CREATE OR REPLACE FUNCTION cleanup_expired_verify_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verify_codes WHERE expires_at < NOW();
  DELETE FROM verify_tokens WHERE expires_at < NOW();
  DELETE FROM pending_pins WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar data_atualizacao em paginas
DROP TRIGGER IF EXISTS update_paginas_updated_at ON paginas;
CREATE TRIGGER update_paginas_updated_at
  BEFORE UPDATE ON paginas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Você pode adicionar dados iniciais aqui se necessário
-- Por exemplo, um usuário admin ou configurações padrão

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'users', 'verify_codes', 'verify_tokens', 'sessions',
    'notif_read', 'pending_pins', 'paginas', 'notificacoes',
    'user_preferences'
  );
  
  RAISE NOTICE 'Tabelas criadas: %', table_count;
  
  IF table_count = 9 THEN
    RAISE NOTICE '✅ Schema criado com sucesso!';
  ELSE
    RAISE WARNING '⚠️ Algumas tabelas podem não ter sido criadas. Esperado: 9, Encontrado: %', table_count;
  END IF;
END $$;
