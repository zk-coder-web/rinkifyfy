# 🔧 Configurar PostgreSQL no Vercel

## ❌ Erro Atual
```
VercelPostgresError - 'missing_connection_string': 
You did not supply a 'connectionString' and no 'POSTGRES_URL' env var was found.
```

## 📋 O que precisa ser feito

O código está funcionando corretamente e detectando que está no Vercel, mas **falta configurar a conexão com o banco de dados PostgreSQL**.

## 🚀 Solução: Configurar Neon PostgreSQL no Vercel

### Opção 1: Usar Integração Neon (RECOMENDADO)

1. **Acesse o Dashboard do Vercel**
   - Vá para: https://vercel.com/dashboard
   - Selecione seu projeto: `rinkifyfy-verify`

2. **Adicione a Integração Neon**
   - Vá em **Settings** → **Integrations**
   - Procure por **"Neon"** ou **"Vercel Postgres"**
   - Clique em **Add Integration**
   - Siga o processo de autenticação com Neon

3. **Configure o Banco**
   - A integração criará automaticamente:
     - `POSTGRES_URL` - URL completa de conexão
     - `POSTGRES_PRISMA_URL` - URL para Prisma (se usar)
     - `POSTGRES_URL_NON_POOLING` - URL sem pooling
   - Essas variáveis serão adicionadas automaticamente ao projeto

4. **Crie as Tabelas**
   - Após conectar, você precisa criar o schema do banco
   - Veja seção "Criar Schema PostgreSQL" abaixo

### Opção 2: Configurar Manualmente

Se preferir configurar manualmente ou usar outro provedor PostgreSQL:

1. **Crie um banco PostgreSQL**
   - Neon: https://neon.tech (Recomendado - tem free tier)
   - Supabase: https://supabase.com
   - Railway: https://railway.app
   - Ou qualquer outro provedor PostgreSQL

2. **Copie a Connection String**
   - Formato: `postgresql://user:password@host:port/database?sslmode=require`
   - Exemplo: `postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`

3. **Adicione no Vercel**
   - Vá em **Settings** → **Environment Variables**
   - Adicione a variável:
     - **Name:** `POSTGRES_URL`
     - **Value:** Sua connection string
     - **Environments:** Production, Preview, Development (marque todos)
   - Clique em **Save**

4. **Redeploy**
   - Vá em **Deployments**
   - Clique nos 3 pontos do último deploy
   - Clique em **Redeploy**

## 📊 Criar Schema PostgreSQL

Após configurar a conexão, você precisa criar as tabelas. Conecte-se ao banco e execute:

```sql
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

-- Tabela de códigos de verificação
CREATE TABLE IF NOT EXISTS verify_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

-- Tabela de tokens de verificação
CREATE TABLE IF NOT EXISTS verify_tokens (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

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

-- Índices para páginas
CREATE INDEX IF NOT EXISTS idx_paginas_user_id ON paginas(user_id);
CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida INTEGER NOT NULL DEFAULT 0,
  data TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);

-- Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);
```

## 🔍 Como Executar o SQL

### Opção 1: Neon Console
1. Acesse https://console.neon.tech
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Cole o SQL acima
5. Clique em **Run**

### Opção 2: psql (Terminal)
```bash
psql "postgresql://user:pass@host/database?sslmode=require" -f schema.sql
```

### Opção 3: Ferramenta GUI
- **pgAdmin**: https://www.pgadmin.org
- **DBeaver**: https://dbeaver.io
- **TablePlus**: https://tableplus.com

## ✅ Verificar se Funcionou

Após configurar:

1. **Redeploy no Vercel**
2. **Teste a rota de envio de código:**
   ```bash
   curl -X POST https://rinkifyfy-verify.vercel.app/api/auth/send-code \
     -H "Content-Type: application/json" \
     -d '{"email":"seu-email@example.com"}'
   ```

3. **Verifique os logs no Vercel:**
   - Vá em **Deployments** → Último deploy → **View Function Logs**
   - Não deve mais aparecer o erro `missing_connection_string`

## 📝 Variáveis de Ambiente Necessárias

Certifique-se de que estas variáveis estão configuradas no Vercel:

### ✅ Obrigatórias
- `POSTGRES_URL` - Connection string do PostgreSQL
- `SMTP_HOST` - Servidor SMTP para emails
- `SMTP_PORT` - Porta SMTP
- `SMTP_USER` - Usuário SMTP
- `SMTP_PASS` - Senha SMTP
- `SMTP_FROM` - Email remetente
- `NEXTAUTH_SECRET` - Secret para NextAuth
- `NEXTAUTH_URL` - URL da aplicação

### ⚠️ Opcionais
- `GOOGLE_CLIENT_ID` - Para login com Google
- `GOOGLE_CLIENT_SECRET` - Para login com Google
- `PASSWORD_PEPPER` - Salt adicional para senhas

## 🎯 Próximos Passos

1. ✅ Configurar `POSTGRES_URL` no Vercel
2. ✅ Criar schema do banco de dados
3. ✅ Fazer redeploy
4. ✅ Testar envio de código de verificação
5. ⚠️ Migrar rotas restantes que usam `getDb()` diretamente

## 💡 Dicas

- **Free Tier do Neon:** 0.5 GB de storage, suficiente para começar
- **Backups:** Configure backups automáticos no Neon
- **Monitoramento:** Use o dashboard do Neon para monitorar queries
- **Pooling:** Neon tem connection pooling automático, ideal para serverless

## 🆘 Problemas Comuns

### Erro: "too many connections"
**Solução:** Use a URL com pooling (`POSTGRES_PRISMA_URL`) ou configure max connections no Neon

### Erro: "SSL required"
**Solução:** Adicione `?sslmode=require` no final da connection string

### Erro: "relation does not exist"
**Solução:** Execute o SQL de criação de tabelas (schema) no banco

### Erro: "password authentication failed"
**Solução:** Verifique se a connection string está correta e se o usuário tem permissões
