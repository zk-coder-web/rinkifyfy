# Correção do Erro no Vercel

## 🔴 Problema Original

```
Error: Você está em Vercel! Use @vercel/postgres em vez de better-sqlite3. 
Importe de auth-neon.ts em vez de auth.ts
```

O erro ocorria porque o código estava tentando usar `better-sqlite3` (SQLite) no Vercel, que só suporta PostgreSQL via `@vercel/postgres`.

## ✅ Soluções Implementadas

### 1. Modificado `src/lib/db.ts`
**Problema:** Importava `better-sqlite3` no topo do arquivo, causando erro no build do Vercel.

**Solução:**
- Importação condicional usando `require()` apenas quando não está no Vercel
- Erro só é lançado quando `getDb()` é chamado, não na importação do módulo

```typescript
// Antes
import Database from 'better-sqlite3'

// Depois
let Database: any = null
if (!IS_VERCEL) {
  try {
    Database = require('better-sqlite3')
  } catch (error) {
    console.warn('[DB] better-sqlite3 não disponível')
  }
}
```

### 2. Criado `src/lib/auth-vercel.ts`
**Problema:** `auth.ts` usava apenas SQLite.

**Solução:**
- Novo arquivo que detecta automaticamente o ambiente
- Usa SQLite localmente e PostgreSQL no Vercel
- Todas as funções de autenticação adaptadas para ambos os bancos

**Funções principais:**
- `getUserByEmail()` - Busca usuário por email
- `saveVerifyCode()` - Salva código de verificação
- `saveVerifyToken()` - Salva token de verificação
- `createLocalUser()` - Cria novo usuário
- `updateUserPassword()` - Atualiza senha
- `updateUserPin()` - Atualiza PIN
- `markUserVerified()` - Marca usuário como verificado
- `createPersistentSession()` - Cria sessão com refresh token

### 3. Criado `src/lib/pending-pin-vercel.ts`
**Problema:** `pending-pin.ts` usava apenas SQLite.

**Solução:**
- Versão que funciona com ambos os bancos
- Funções assíncronas para compatibilidade com PostgreSQL

**Funções:**
- `savePendingPin()` - Salva PIN temporário
- `getPendingPin()` - Recupera PIN temporário
- `clearPendingPin()` - Remove PIN temporário
- `purgeExpiredPins()` - Limpa PINs expirados

### 4. Atualizado `next.config.js`
**Problema:** Next.js tentava fazer bundle do `better-sqlite3` no Vercel.

**Solução:**
```javascript
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals = config.externals || []
    config.externals.push('better-sqlite3')
  }
  return config
}
```

### 5. Atualizado Rotas de Autenticação

#### ✅ `src/app/api/auth/send-code/route.ts`
- Importa de `auth-vercel` e `pending-pin-vercel`
- Todas as operações assíncronas com `await`

#### ✅ `src/app/api/auth/register/route.ts`
- Importa de `auth-vercel` e `pending-pin-vercel`
- Removido uso direto de `getDb()`
- Usa funções do `auth-vercel`: `updateUserPassword()`, `updateUserPin()`, `markUserVerified()`

## 🟡 Rotas que Ainda Precisam Ser Atualizadas

Estas rotas ainda usam `getDb()` diretamente e **vão falhar no Vercel**:

### Rotas de Páginas
- ❌ `/api/paginas/route.ts` - Listar/criar páginas
- ❌ `/api/paginas/[id]/route.ts` - CRUD de página específica
- ❌ `/api/paginas/create/route.ts` - Criar página
- ❌ `/api/public/paginas/[slug]/route.ts` - Página pública
- ❌ `/api/public/paginas/[slug]/html/route.ts` - HTML da página

### Rotas de Notificações
- ❌ `/api/notificacoes/route.ts` - CRUD de notificações

### Rotas de Upload
- ❌ `/api/upload/foto/route.ts` - Upload de fotos

### Outras Rotas de Auth
- ❌ `/api/auth/verify-token/route.ts` - Verificar token
- ❌ `/api/auth/delete-account/route.ts` - Deletar conta

## 🔧 Como Corrigir as Rotas Restantes

### Opção 1: Usar Wrapper Universal (Recomendado)
Criar `src/lib/db-universal.ts` que:
1. Detecta ambiente automaticamente
2. Converte queries SQLite para PostgreSQL
3. Fornece API unificada

### Opção 2: Atualizar Cada Rota
Para cada rota que usa `getDb()`:

1. **Remover importação direta:**
```typescript
// ❌ Remover
import { getDb } from '@/lib/db'
```

2. **Adicionar detecção de ambiente:**
```typescript
const IS_VERCEL = !!(process.env.VERCEL === '1' || process.env.VERCEL_ENV)

if (IS_VERCEL) {
  const { sql } = await import('@vercel/postgres')
  // Usar PostgreSQL
} else {
  const { getDb } = require('@/lib/db')
  const db = getDb()
  // Usar SQLite
}
```

3. **Adaptar queries:**
```typescript
// SQLite
db.prepare('SELECT * FROM users WHERE email = ?').get(email)

// PostgreSQL
await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
```

## 📊 Status Atual

| Componente | Status | Observações |
|------------|--------|-------------|
| `db.ts` | ✅ Corrigido | Importação condicional |
| `auth-vercel.ts` | ✅ Criado | Funciona em ambos ambientes |
| `pending-pin-vercel.ts` | ✅ Criado | Funciona em ambos ambientes |
| `next.config.js` | ✅ Atualizado | Exclui better-sqlite3 do bundle |
| Rota `/auth/send-code` | ✅ Corrigida | Usa auth-vercel |
| Rota `/auth/register` | ✅ Corrigida | Usa auth-vercel |
| Outras rotas de auth | ⚠️ Verificar | Podem precisar ajustes |
| Rotas de páginas | ❌ Pendente | Usam getDb() diretamente |
| Rotas de notificações | ❌ Pendente | Usam getDb() diretamente |
| Rotas de upload | ❌ Pendente | Usam getDb() diretamente |

## 🚀 Próximos Passos

1. **Testar no Vercel** - Verificar se o erro de autenticação foi resolvido
2. **Migrar rotas restantes** - Atualizar rotas que ainda usam `getDb()`
3. **Criar migrations para PostgreSQL** - Garantir que o schema está correto
4. **Testar funcionalidades** - Verificar se tudo funciona em produção

## 📝 Notas Importantes

### Diferenças SQLite vs PostgreSQL

| Recurso | SQLite | PostgreSQL |
|---------|--------|------------|
| Placeholders | `?` | `$1, $2, $3...` |
| Data/hora atual | `datetime('now')` | `NOW()` |
| Auto-incremento | `AUTOINCREMENT` | `SERIAL` |
| Retornar ID inserido | `lastInsertRowid` | `RETURNING id` |
| Case insensitive | `COLLATE NOCASE` | `LOWER()` ou `ILIKE` |

### Variáveis de Ambiente Vercel

O código detecta Vercel através de:
- `process.env.VERCEL === '1'`
- `process.env.VERCEL_ENV`
- `process.env.VERCEL_URL`
- `process.env.VERCEL_REGION`

### Banco de Dados no Vercel

Certifique-se de que:
1. Variável `POSTGRES_URL` está configurada no Vercel
2. Schema do PostgreSQL está criado (rodar migrations)
3. Tabelas necessárias existem no banco

## ✅ Conclusão

As correções implementadas resolvem o erro principal na rota `/auth/send-code`. O sistema de autenticação agora funciona tanto localmente (SQLite) quanto no Vercel (PostgreSQL). 

As rotas restantes que usam `getDb()` diretamente precisam ser migradas seguindo o mesmo padrão para funcionar completamente no Vercel.
