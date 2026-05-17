# Configuração de Variáveis de Ambiente

## 🔐 Variáveis Sensíveis (NÃO commitar no repositório)

As seguintes variáveis devem ser configuradas **apenas** no painel da Netlify/Vercel:

- `SMTP_USER` - Email do Gmail
- `SMTP_PASS` - App Password do Gmail
- `NEXTAUTH_SECRET` - Chave secreta para autenticação
- `PASSWORD_PEPPER` - Chave para hash de senhas
- `GOOGLE_CLIENT_SECRET` - Secret do Google OAuth

## 📋 Instruções para Netlify

1. Acesse o painel da Netlify: https://app.netlify.com
2. Selecione seu site (rankfy.netlify.app)
3. Vá para **Site settings** → **Build & deploy** → **Environment**
4. Clique em **Edit variables**
5. Adicione as seguintes variáveis:

```
SMTP_USER = zkdopix@gmail.com
SMTP_PASS = zbfnuvbigijwbmch
NEXTAUTH_SECRET = 1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
PASSWORD_PEPPER = 1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
GOOGLE_CLIENT_SECRET = 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
NEXTAUTH_URL = https://rankfy.netlify.app
DATABASE_URL = file:./rankify.db
```

6. Clique em **Save**
7. Faça um novo deploy (push para main ou clique em "Trigger deploy")

## 📋 Instruções para Vercel

1. Acesse o painel da Vercel: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá para **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

```
SMTP_USER = zkdopix@gmail.com
SMTP_PASS = zbfnuvbigijwbmch
NEXTAUTH_SECRET = 1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
PASSWORD_PEPPER = 1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
GOOGLE_CLIENT_SECRET = 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
NEXTAUTH_URL = https://seu-dominio-vercel.com
DATABASE_URL = file:./rankify.db
```

5. Clique em **Save**
6. Faça um novo deploy (push para main)

## 🔑 Como Gerar uma App Password do Gmail

1. Acesse https://myaccount.google.com/security
2. Ative a **Autenticação de dois fatores** (se não estiver ativada)
3. Vá para **Senhas de app** (aparece após ativar 2FA)
4. Selecione **Mail** e **Windows Computer**
5. Copie a senha gerada (16 caracteres)
6. Use essa senha como `SMTP_PASS`

## ✅ Verificação

Após configurar as variáveis, faça um teste:

1. Acesse a página de login do seu site
2. Clique em "Criar conta"
3. Insira um email
4. Clique em "Enviar link de verificação"
5. Verifique se o email foi recebido

Se receber um erro, verifique:
- Se as variáveis SMTP estão configuradas corretamente
- Se a App Password do Gmail está correta
- Se o Gmail tem "Acesso de apps menos seguros" desativado (use App Password em vez disso)

## 📝 Variáveis Públicas (podem estar no netlify.toml)

As seguintes variáveis podem ser commitadas no repositório:

- `NEXT_PUBLIC_APP_URL` - URL do seu site
- `NEXT_PUBLIC_API_URL` - URL da API
- `SMTP_HOST` - smtp.gmail.com
- `SMTP_PORT` - 587
- `SMTP_SECURE` - false
- `SMTP_FROM` - "Rankify <noreply@rankify.com.br>"
- `NODE_VERSION` - 20
- `NEXT_TELEMETRY_DISABLED` - 1
