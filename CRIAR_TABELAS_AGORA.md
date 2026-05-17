# 🚨 CRIAR TABELAS AGORA!

## ❌ Problema
```
relation "pending_pins" does not exist
relation "users" does not exist
relation "verify_codes" does not exist
```

As tabelas não foram criadas no banco de dados!

## ✅ Solução Rápida (2 opções)

### Opção 1: Executar Script Node.js (RECOMENDADO)

**Pré-requisito:** Ter `POSTGRES_URL` configurada localmente

1. **Abra um terminal na pasta do projeto:**
```bash
cd rankup-next
```

2. **Execute o script:**
```bash
node scripts/create-postgres-schema.js
```

3. **Resultado esperado:**
```
✅ Schema criado com sucesso!
📊 Tabelas criadas:
  ✅ users
  ✅ verify_codes
  ✅ verify_tokens
  ✅ sessions
  ✅ notif_read
  ✅ pending_pins
  ✅ paginas
  ✅ notificacoes
  ✅ user_preferences

🎉 Banco de dados pronto para usar!
```

### Opção 2: Executar SQL Manualmente no Neon

1. **Acesse:** https://console.neon.tech
2. **Selecione:** rankify-db
3. **Vá em:** SQL Editor
4. **Abra:** `schema-postgres.sql` deste projeto
5. **Copie TODO o conteúdo**
6. **Cole** no SQL Editor
7. **Clique:** Run (ou Ctrl+Enter)
8. **Aguarde:** ✅ Schema criado com sucesso!

## 🔍 Verificar se Funcionou

### Verificação 1: No Neon Console
1. Vá em **Tables**
2. Deve aparecer:
   - ✅ users
   - ✅ verify_codes
   - ✅ verify_tokens
   - ✅ sessions
   - ✅ pending_pins
   - ✅ paginas
   - ✅ notificacoes
   - ✅ user_preferences

### Verificação 2: Testar Rota
```bash
curl -X POST https://rinkifyfy-verify.vercel.app/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@gmail.com"}'
```

**Resultado esperado:**
- ✅ `{"ok":true}`
- ✅ Email recebido com código

## 🆘 Se o Script Falhar

### Erro: "POSTGRES_URL not found"
```bash
# Configure a variável de ambiente
export POSTGRES_URL="postgresql://neondb_owner:npg_0UokGVPhaX4y@ep-royal-base-ap816j58-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

# Depois execute novamente
node scripts/create-postgres-schema.js
```

### Erro: "connection refused"
```
✅ Solução:
1. Verifique se a connection string está correta
2. Verifique se o banco Neon está ativo
3. Tente executar manualmente no Neon Console
```

### Erro: "permission denied"
```
✅ Solução:
1. Verifique se o usuário tem permissões
2. Tente usar a URL sem pooling (NON_POOLING)
3. Tente executar manualmente no Neon Console
```

## 📋 Próximos Passos

Após criar as tabelas:

1. ✅ Fazer redeploy no Vercel
2. ✅ Testar envio de código de verificação
3. ✅ Verificar se os dados aparecem no banco

## 🎯 Resumo

```
❌ ANTES:
relation "pending_pins" does not exist

✅ DEPOIS:
✅ Schema criado com sucesso!
✅ Todas as tabelas criadas
✅ Sistema funcionando
```

---

**Execute agora e o sistema vai funcionar! 🚀**
