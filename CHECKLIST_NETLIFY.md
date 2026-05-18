# ✅ Checklist - Deploy Netlify com Neon PostgreSQL

## Status Atual
- ✅ Código migrado para PostgreSQL
- ✅ Adapter automático criado
- ✅ Banco Neon inicializado
- ✅ Commit e push realizados

## Variáveis de Ambiente no Netlify

Acesse: https://app.netlify.com → Seu site → Site settings → Environment variables

### ✅ Variáveis Obrigatórias

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_Kg4PnyhN8LfA@ep-patient-snow-aqrr1q1g-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require

# URLs
NEXT_PUBLIC_API_URL=https://rkfy.netlify.app
NEXT_PUBLIC_APP_URL=https://rkfy.netlify.app
NEXTAUTH_URL=https://rkfy.netlify.app

# Segurança
NEXTAUTH_SECRET=1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
PASSWORD_PEPPER=1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=zkdopix@gmail.com
SMTP_PASS=zbfnuvbigijwbmch
SMTP_FROM="Rankify <noreply@rankify.com.br>"

# Google OAuth
GOOGLE_CLIENT_ID=883498714141-u9drnfttupbn50ahkkavs9g29t0g3ijh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://rkfy.netlify.app/login

# Node
NODE_ENV=production
```

## Fluxo de Registro/Login no Netlify

### 1. Enviar Código de Verificação
```
POST /api/auth/send-code
Body: { "email": "usuario@email.com" }
```
- ✅ Gera código de 6 dígitos
- ✅ Salva no Neon (`verify_codes`)
- ✅ Envia email com código

### 2. Verificar Código
```
POST /api/auth/verify-code
Body: { "email": "usuario@email.com", "code": "123456" }
```
- ✅ Verifica código no Neon
- ✅ Marca como usado

### 3. Completar Registro
```
POST /api/auth/register
Body: { 
  "email": "usuario@email.com",
  "password": "senha123",
  "pin": "1234"
}
```
- ✅ Cria usuário no Neon (`users`)
- ✅ Hash da senha com bcrypt
- ✅ Cria sessão no Neon (`sessions`)

### 4. Login
```
POST /api/auth/login
Body: { 
  "email": "usuario@email.com",
  "password": "senha123"
}
```
- ✅ Verifica credenciais no Neon
- ✅ Cria sessão no Neon
- ✅ Retorna token

## Como Testar

1. **Fazer deploy no Netlify**
   ```bash
   git push origin main
   ```

2. **Aguardar build** (2-3 minutos)

3. **Testar registro:**
   - Ir em https://rkfy.netlify.app/login
   - Clicar em "Criar conta"
   - Inserir email
   - Receber código por email
   - Inserir código
   - Completar cadastro

4. **Verificar no Neon:**
   - Acessar https://console.neon.tech
   - Ir no seu projeto
   - SQL Editor → `SELECT * FROM users;`
   - Deve aparecer o usuário criado

## Troubleshooting

### Erro 500 ao enviar código
- Verificar se `DATABASE_URL` está no Netlify
- Verificar se SMTP está configurado
- Ver logs: Netlify → Functions → Logs

### Código não chega no email
- Verificar `SMTP_USER` e `SMTP_PASS`
- Verificar se Gmail permite "apps menos seguros"
- Ver logs do Netlify

### Usuário não salva no banco
- Verificar se banco foi inicializado: `/api/init-db`
- Verificar conexão com Neon
- Ver logs do Netlify

## Próximos Passos

1. ✅ Código já está no GitHub
2. ⏳ Netlify vai fazer deploy automático
3. ⏳ Testar fluxo completo de registro
4. ⏳ Verificar dados no Neon

---

**Tudo pronto!** O sistema vai usar PostgreSQL automaticamente no Netlify. 🚀
