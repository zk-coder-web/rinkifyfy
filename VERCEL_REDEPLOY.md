# 🚀 Redeployer no Vercel

Depois de adicionar as variáveis de ambiente, você precisa redeployer o projeto.

## 📋 Passos

### Opção 1: Redeployer via Vercel Dashboard (Mais Fácil)

1. Vá para https://vercel.com/dashboard
2. Selecione o projeto `rinkifyfy`
3. Clique em **Deployments**
4. Clique no último deployment (o mais recente)
5. Clique em **Redeploy** (botão no canto superior direito)
6. Aguarde o deploy terminar (deve levar 1-2 minutos)

### Opção 2: Redeployer via Git Push

1. Faça uma mudança qualquer no código (ex: adicionar um comentário)
2. Commit e push:
   ```bash
   git add .
   git commit -m "Trigger redeploy"
   git push
   ```
3. Vercel fará deploy automaticamente

## ✅ Verificar se Funcionou

Depois do redeploy, teste:

```
https://rinkifyfy-kbve.vercel.app/api/auth/google
```

Você deve ser redirecionado para o Google OAuth (não deve ver o erro "Google OAuth não configurado").

## 🔍 Verificar Variáveis

Se ainda der erro, verifique:

1. Vá para https://vercel.com/dashboard
2. Selecione o projeto `rinkifyfy`
3. Clique em **Settings** → **Environment Variables**
4. Verifique se as 3 variáveis estão lá:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`

Se faltarem, adicione novamente e redeploye.
