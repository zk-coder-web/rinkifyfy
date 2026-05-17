# 📋 Rotas Que Ainda Precisam Ser Corrigidas

## ❌ Rotas com `getDb()` Direto

Estas rotas ainda usam `getDb()` e vão falhar no Vercel:

### 1. `/api/upload/foto/route.ts`
- **Status:** ❌ Pendente
- **Problema:** Usa `getDb()` para verificar permissões
- **Solução:** Usar `executeQueryOne()` do `auth-vercel.ts`

### 2. `/api/paginas/route.ts`
- **Status:** ❌ Pendente
- **Problema:** Usa `getDb()` para CRUD de páginas
- **Solução:** Usar `executeQuery()` e `executeUpdate()` do `auth-vercel.ts`

### 3. `/api/paginas/[id]/route.ts`
- **Status:** ❌ Pendente
- **Problema:** Usa `getDb()` para CRUD de página específica
- **Solução:** Usar `executeQuery()` e `executeUpdate()` do `auth-vercel.ts`

### 4. `/api/paginas/create/route.ts`
- **Status:** ❌ Pendente
- **Problema:** Usa `getDb()` para criar página
- **Solução:** Usar `executeUpdate()` do `auth-vercel.ts`

### 5. `/api/public/paginas/[slug]/route.ts`
- **Status:** ❌ Pendente
- **Problema:** Usa `getDb()` para buscar página pública
- **Solução:** Usar `executeQueryOne()` do `auth-vercel.ts`

### 6. `/api/public/paginas/[slug]/html/route.ts`
- **Status:** ❌ Pendente
- **Problema:** Usa `getDb()` para gerar HTML da página
- **Solução:** Usar `executeQueryOne()` do `auth-vercel.ts`

### 7. `/api/notificacoes/route.ts`
- **Status:** ❌ Pendente
- **Problema:** Usa `getDb()` para CRUD de notificações
- **Solução:** Usar `executeQuery()` e `executeUpdate()` do `auth-vercel.ts`

### 8. `/api/auth/delete-account/route.ts`
- **Status:** ❌ Pendente
- **Problema:** Usa `getDb()` para deletar conta
- **Solução:** Usar `executeUpdate()` do `auth-vercel.ts`

## ✅ Rotas Já Corrigidas

- ✅ `/api/auth/send-code/route.ts` - Usa `auth-vercel`
- ✅ `/api/auth/register/route.ts` - Usa `auth-vercel`
- ✅ `/api/auth/verify-token/route.ts` - Usa `auth-vercel`

## 🔧 Como Corrigir

### Padrão de Correção

**Antes:**
```typescript
import { getDb } from '@/lib/db'

const db = getDb()
const result = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
```

**Depois:**
```typescript
import { executeQueryOne } from '@/lib/auth-vercel'

const result = await executeQueryOne('SELECT * FROM users WHERE id = ?', [userId])
```

### Funções Disponíveis

```typescript
// Buscar múltiplas linhas
const rows = await executeQuery('SELECT * FROM users', [])

// Buscar uma linha
const row = await executeQueryOne('SELECT * FROM users WHERE id = ?', [userId])

// INSERT/UPDATE/DELETE
const result = await executeUpdate('INSERT INTO users (...) VALUES (...)', [params])
```

## 📝 Notas Importantes

1. **Todas as funções são assíncronas** - Use `await`
2. **Placeholders:** Use `?` para ambos SQLite e PostgreSQL (a função converte automaticamente)
3. **Datas:** Use `datetime('now')` para ambos (a função converte automaticamente)
4. **Sem `getDb()`:** Nunca importe `getDb()` diretamente

## 🎯 Prioridade

### Alta (Afetam Autenticação)
1. `/api/auth/delete-account/route.ts`

### Média (Afetam Funcionalidades Principais)
2. `/api/paginas/route.ts`
3. `/api/paginas/[id]/route.ts`
4. `/api/notificacoes/route.ts`

### Baixa (Afetam Funcionalidades Secundárias)
5. `/api/upload/foto/route.ts`
6. `/api/paginas/create/route.ts`
7. `/api/public/paginas/[slug]/route.ts`
8. `/api/public/paginas/[slug]/html/route.ts`

## 🚀 Próximos Passos

1. Corrigir rotas de alta prioridade
2. Testar cada rota após correção
3. Fazer redeploy no Vercel
4. Verificar logs para novos erros

---

**Todas as rotas precisam ser corrigidas para funcionar completamente no Vercel!**
