# 🚀 Deploy no Netlify

## 📋 Configuração

### Host
```
https://rinkify-system.netlify.app
```

### Variáveis de Ambiente
Todas as variáveis estão configuradas em:
- `.env.netlify` - Arquivo local
- `netlify.toml` - Configuração do build

## 🔧 Como Fazer Deploy

### Opção 1: Via GitHub (Recomendado)

1. **Conectar repositório:**
   - Acesse: https://app.netlify.com
   - Clique em "New site from Git"
   - Selecione GitHub
   - Escolha o repositório: `rinkifyfy`

2. **Configurar build:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 20

3. **Adicionar variáveis de ambiente:**
   - Vá em: Settings → Environment
   - Adicione as variáveis do `.env.netlify`

4. **Deploy:**
   - Clique em "Deploy site"
   - Aguarde o build terminar

### Opção 2: Via CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Deploy
netlify deploy --prod
```

### Opção 3: Via Drag & Drop

```bash
# Fazer build localmente
npm run build

# Fazer deploy
netlify deploy --prod --dir=.next
```

## 📊 Variáveis de Ambiente

As seguintes variáveis estão configuradas:

```
NEXT_PUBLIC_API_URL=https://rinkify-system.netlify.app
NEXT_PUBLIC_APP_URL=https://rinkify-system.netlify.app
NEXTAUTH_SECRET=1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
NEXTAUTH_URL=https://rinkify-system.netlify.app
GOOGLE_CLIENT_ID=883498714141-u9drnfttupbn50ahkkavs9g29t0g3ijh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://rinkify-system.netlify.app/login
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=zkdopix@gmail.com
SMTP_PASS=zbfnuvbigijwbmch
SMTP_FROM="Rankify <noreply@rankify.com.br>"
PASSWORD_PEPPER=1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
NODE_ENV=production
NEXT_PUBLIC_USE_SIMPLE_AUTH=true
```

## ✅ Checklist de Deploy

- [ ] Repositório conectado ao Netlify
- [ ] Build command configurado: `npm run build`
- [ ] Publish directory: `.next`
- [ ] Node version: 20
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy realizado com sucesso
- [ ] Site acessível em https://rinkify-system.netlify.app

## 🧪 Testar Após Deploy

### 1. Verificar se o site está online
```bash
curl https://rinkify-system.netlify.app
```

### 2. Testar autenticação simples
```bash
curl -X POST https://rinkify-system.netlify.app/api/auth/send-code-simple \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. Verificar logs
- Acesse: https://app.netlify.com
- Selecione o site
- Vá em: Deploys → Logs

## 🆘 Troubleshooting

### Erro: "Build failed"
1. Verifique os logs do build
2. Certifique-se de que `npm run build` funciona localmente
3. Verifique se todas as dependências estão instaladas

### Erro: "Function not found"
1. Verifique se o arquivo está em `.netlify/functions`
2. Verifique se o nome da função está correto
3. Faça um novo deploy

### Erro: "Environment variable not found"
1. Verifique se a variável foi adicionada no Netlify
2. Verifique o nome da variável (case-sensitive)
3. Faça um novo deploy após adicionar

## 📝 Arquivos de Configuração

### `.env.netlify`
Variáveis de ambiente para Netlify

### `netlify.toml`
Configuração do build e deploy

### `.gitignore`
Certifique-se de que `.env.netlify` está no `.gitignore` se contiver secrets

## 🎯 Próximos Passos

1. Conectar repositório ao Netlify
2. Configurar variáveis de ambiente
3. Fazer primeiro deploy
4. Testar autenticação
5. Monitorar logs e performance

---

**Deploy no Netlify é simples e rápido! 🚀**
