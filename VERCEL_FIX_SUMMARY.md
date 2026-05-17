# Correções para Vercel - Resumo

## Problema
O erro ocorria porque o código estava tentando usar `better-sqlite3` (banco SQLite local) no Vercel, que só suporta PostgreSQL.

## Soluções Implementadas

### 1. ✅ Modificado `db.ts`
- Importação condicional de `better-sqlite3` apenas quando não está no Vercel
- Lança erro apenas quando `getDb()` é chamado no Vercel, não na importação

### 2. ✅ Criado `auth-vercel.ts`
- Detecta automaticamente o ambiente (local vs Vercel)
- Usa SQLite localmente e PostgreSQL no Vercel
- Todas as funções de autenticação funcionam em ambos os ambientes

### 3. ✅ Criado `pending-pin-vercel.ts`
- Versão do `pending-pin.ts` que funciona com ambos os bancos
- Funções assíncronas para compatibilidade com PostgreSQL

### 4. ✅ Atualizado `next.config.js`
- Adicionado webpack config para marcar `better-sqlite3` como external no Vercel

### 5. ✅ Atualizado rotas críticas
- `send-code/route.ts` - usa `auth-vercel` e `pending-pin-vercel`
- `register/route.ts` - usa `auth-vercel` e `pending-pin-vercel`, removido uso direto de `getDb()`

## Rotas que AINDA precisam ser atualizadas

As seguintes rotas ainda usam `getDb()` diretamente e vão falhar no Vercel:

### Rotas de API que precisam correção:
1. `/api/upload/foto/route.ts` - Upload de fotos
2. `/api/notificacoes/route.ts` - Notificações
3. `/api/paginas/route.ts` - CRUD de páginas
4. `/api/paginas/[id]/route.ts` - Página específica
5. `/api/paginas/create/route.ts` - Criar página
6. `/api/public/paginas/[slug]/route.ts` - Página pública
7. `/api/public/paginas/[slug]/html/route.ts` - HTML da página
8. `/api/auth/verify-token/route.ts` - Verificar token
9. `/api/auth/delete-account/route.ts` - Deletar conta

## Próximos Passos

### Opção 1: Criar wrapper universal (RECOMENDADO)
Criar `db-universal.ts` que:
- Detecta ambiente automaticamente
- Fornece API unificada para queries
- Converte sintaxe SQLite para PostgreSQL automaticamente

### Opção 2: Atualizar cada rota individualmente
- Adicionar detecção de ambiente em cada rota
- Usar queries diferentes para SQLite vs PostgreSQL
- Mais trabalhoso e propenso a erros

## Diferenças SQLite vs PostgreSQL

### Placeholders
- SQLite: `?`
- PostgreSQL: `$1, $2, $3...`

### Funções de data/hora
- SQLite: `datetime('now')`
- PostgreSQL: `NOW()`

### AUTOINCREMENT
- SQLite: `INTEGER PRIMARY KEY AUTOINCREMENT`
- PostgreSQL: `SERIAL PRIMARY KEY` ou `BIGSERIAL`

### RETURNING
- SQLite: Não suporta nativamente (usa `lastInsertRowid`)
- PostgreSQL: `INSERT ... RETURNING id`

### Case sensitivity
- SQLite: `COLLATE NOCASE`
- PostgreSQL: `LOWER()` ou `ILIKE`

## Status Atual
✅ Autenticação funcionando em ambos os ambientes
✅ Envio de código de verificação funcionando
✅ Registro de usuário funcionando
⚠️ Outras rotas ainda precisam ser migradas
