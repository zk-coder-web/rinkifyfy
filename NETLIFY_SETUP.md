# 🚀 Configuração do Netlify para RankUp

## ⚠️ IMPORTANTE: Variáveis de Ambiente

As rotas de API estão dando 404 porque as **variáveis de ambiente não estão configuradas no painel do Netlify**.

### Passo a Passo:

1. **Acesse o painel do Netlify:**
   - Vá para: https://app.netlify.com
   - Selecione seu site: `rkfy`

2. **Configure as variáveis de ambiente:**
   - Vá em: `Site settings` → `Environment variables`
   - Clique em `Add a variable` e adicione TODAS as seguintes variáveis:

```
NEXT_PUBLIC_APP_URL=https://rkfy.netlify.app
NEXT_PUBLIC_API_URL=https://rkfy.netlify.app
NEXT_PUBLIC_USE_SIMPLE_AUTH=true

NEXTAUTH_SECRET=1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
NEXTAUTH_URL=https://rkfy.netlify.app

GOOGLE_CLIENT_ID=883498714141-u9drnfttupbn50ahkkavs9g29t0g3ijh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://rkfy.netlify.app/login

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=zkdopix@gmail.com
SMTP_PASS=zbfnuvbigijwbmch
SMTP_FROM=Rankify <noreply@rankify.com.br>

PASSWORD_PEPPER=1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6

NODE_ENV=production
```

3. **Fazer um novo deploy:**
   - Após adicionar todas as variáveis, vá em `Deploys`
   - Clique em `Trigger deploy` → `Clear cache and deploy site`

## 🔍 Verificação

Após o deploy, teste as rotas:

- ✅ Deve funcionar: `https://rkfy.netlify.app/api/auth/send-code-simple`
- ❌ Não vai funcionar: `https://rkfy.netlify.app/api/auth/send-code` (essa é só para Vercel)

## 📝 Notas

- O arquivo `.env.netlify` é apenas para referência local
- As variáveis DEVEM estar configuradas no painel do Netlify
- Variáveis que começam com `NEXT_PUBLIC_` são expostas no frontend
- Outras variáveis são apenas para o backend (API routes)
