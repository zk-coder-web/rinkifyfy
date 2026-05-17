# 🚀 Guia Rápido - Configurar PostgreSQL no Vercel

## ❌ Erro Atual
```
missing_connection_string: You did not supply a 'connectionString' 
and no 'POSTGRES_URL' env var was found.
```

## ✅ Solução em 3 Passos

### 1️⃣ Criar Banco de Dados Neon (2 minutos)

1. Acesse: https://console.neon.tech
2. Clique em **Create Project**
3. Escolha:
   - **Name:** rankify-db
   - **Region:** US East (Ohio) - us-east-2
   - **Postgres version:** 16 (latest)
4. Clique em **Create Project**
5. **COPIE** a connection string que aparece (algo como):
   ```
   postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2️⃣ Configurar no Vercel (1 minuto)

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto: **rinkifyfy-verify**
3. Vá em: **Settings** → **Environment Variables**
4. Clique em **Add New**
5. Adicione:
   - **Name:** `POSTGRES_URL`
   - **Value:** Cole a connection string do Neon
   - **Environments:** Marque **Production**, **Preview** e **Development**
6. Clique em **Save**

### 3️⃣ Criar Tabelas no Banco (2 minutos)

1. Volte ao Neon Console: https://console.neon.tech
2. Clique no seu projeto **rankify-db**
3. Vá em **SQL Editor** (menu lateral)
4. Abra o arquivo `schema-postgres.sql` deste projeto
5. **Copie TODO o conteúdo** do arquivo
6. **Cole** no SQL Editor do Neon
7. Clique em **Run** (ou pressione Ctrl+Enter)
8. Aguarde a mensagem: ✅ **Schema criado com sucesso!**

### 4️⃣ Fazer Redeploy (30 segundos)

1. No Vercel, vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Clique em **Redeploy**
4. Aguarde o deploy terminar

## 🎉 Pronto!

Agora teste enviando um código de verificação:

```bash
curl -X POST https://rinkifyfy-verify.vercel.app/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@gmail.com"}'
```

Ou acesse a aplicação e tente criar uma conta.

## 📊 Verificar se Funcionou

### ✅ Sinais de Sucesso:
- Você recebe um email com o código de verificação
- Não aparece mais o erro `missing_connection_string` nos logs
- Consegue criar conta e fazer login

### ❌ Se Ainda Não Funcionar:

1. **Verifique os logs no Vercel:**
   - Deployments → Último deploy → **View Function Logs**
   - Procure por erros

2. **Verifique se a variável foi salva:**
   - Settings → Environment Variables
   - Confirme que `POSTGRES_URL` está lá

3. **Verifique se as tabelas foram criadas:**
   - No Neon Console, vá em **Tables**
   - Deve aparecer: users, sessions, verify_codes, etc.

4. **Teste a conexão:**
   - No Neon SQL Editor, execute:
   ```sql
   SELECT COUNT(*) FROM users;
   ```
   - Deve retornar 0 (zero usuários)

## 💡 Dicas

- **Free Tier do Neon:** 0.5 GB storage, 100 horas de compute/mês
- **Connection Pooling:** Neon já tem pooling automático
- **Backups:** Neon faz backups automáticos diários
- **Monitoramento:** Use o dashboard do Neon para ver queries

## 🆘 Problemas Comuns

### "SSL required"
Adicione `?sslmode=require` no final da connection string

### "too many connections"
Use a URL com pooling (geralmente termina com `-pooler.`)

### "relation does not exist"
Execute o SQL do `schema-postgres.sql` novamente

### "password authentication failed"
Copie a connection string novamente do Neon (pode ter expirado)

## 📞 Precisa de Ajuda?

Se ainda tiver problemas:
1. Verifique os logs do Vercel
2. Verifique os logs do Neon (Monitoring → Logs)
3. Teste a connection string localmente:
   ```bash
   psql "sua-connection-string-aqui"
   ```
