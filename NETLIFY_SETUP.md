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

## ⚠️ LIMITAÇÃO IMPORTANTE: Armazenamento em Memória

**ATENÇÃO:** A versão simplificada (`send-code-simple` e `verify-code-simple`) usa armazenamento em **memória temporária**.

### O que isso significa:
- ✅ Funciona para testes e desenvolvimento
- ❌ Os códigos de verificação são perdidos quando a função serverless é reiniciada
- ❌ Não é adequado para produção com muitos usuários

### Quando os dados são perdidos:
- Quando o Netlify reinicia as funções serverless (após alguns minutos de inatividade)
- Quando você faz um novo deploy
- Quando há um cold start da função

### Solução para Produção:
Para um ambiente de produção real, você precisa usar um banco de dados persistente:
- **Supabase** (PostgreSQL gratuito)
- **MongoDB Atlas** (NoSQL gratuito)
- **PlanetScale** (MySQL gratuito)
- **Vercel Postgres** (se migrar para Vercel)

### Como funciona agora:
1. Usuário solicita código → código é salvo na memória
2. Usuário verifica código → se a função ainda estiver "quente", funciona
3. Se a função for reiniciada → código é perdido e usuário precisa solicitar novo código
