# 🔐 Google Login Setup - RankUp Next

## 📋 Configuração

### Google Console URLs

Adicione estas URLs no Google Console para o OAuth 2.0 Client:

**Origens JavaScript Autorizadas** (SEM / no final):
```
https://rinkifyfy-kbve.vercel.app
http://localhost:3000
```

**URIs de Redirecionamento Autorizados** (COM / no caminho):
```
https://rinkifyfy-kbve.vercel.app/google-callback
http://localhost:3000/google-callback
```

### Variáveis de Ambiente

Já configuradas em `.env.local`:

```
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://rinkifyfy-kbve.vercel.app/google-callback
```

**Nota**: As variáveis reais estão em `.env.local` (não commitado no Git)

---

## 🔄 Fluxo

1. Usuário clica em "Login com Google"
2. Redireciona para Google OAuth
3. Google redireciona para `/google-callback?code=XXXXX`
4. Página exibe "Login bem sucedido!"
5. Código é armazenado no localStorage

---

## 📁 Arquivos Criados

- `src/app/google-callback/page.tsx` - Página de callback
- `src/app/api/auth/google/callback/route.ts` - Backend API

---

## 🧪 Teste

### Local
```
http://localhost:3000/google-callback
```

### Produção
```
https://rinkifyfy-kbve.vercel.app/google-callback
```

---

## ⚠️ Importante

- Aguarde 5-30 minutos após atualizar Google Console
- Não adicione `/` no final das Origens JavaScript
- Adicione `/google-callback` no final dos URIs de Redirecionamento
