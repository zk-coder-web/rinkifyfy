# Configuração de Variáveis de Ambiente - Vercel

## 🚀 Host
```
https://rinkifyfy-verify.vercel.app
```

## 📋 Variáveis de Ambiente para Vercel

### Passo 1: Acessar o Painel da Vercel

1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto **rinkifyfy-verify**
3. Vá para **Settings** → **Environment Variables**

### Passo 2: Adicionar as Variáveis

Copie e cole cada variável abaixo no painel da Vercel:

**IMPORTANTE:** Vercel detecta automaticamente o ambiente. Não é necessário configurar `VERCEL=1`.

#### URLs (Públicas)
```
NEXT_PUBLIC_API_URL = https://rinkifyfy-verify.vercel.app
NEXT_PUBLIC_APP_URL = https://rinkifyfy-verify.vercel.app
```

#### Banco de Dados
```
DATABASE_URL = file:./rankify.db
```

#### Segurança - NextAuth
```
NEXTAUTH_SECRET = 1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
NEXTAUTH_URL = https://rinkifyfy-verify.vercel.app
```

#### Google OAuth
```
GOOGLE_CLIENT_ID = 883498714141-u9drnfttupbn50ahkkavs9g29t0g3ijh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
GOOGLE_REDIRECT_URI = https://rinkifyfy-verify.vercel.app/login
```

#### Instagram API
```
INSTAGRAM_CHECKER_API_URL = http://localhost:5000
```

#### SMTP - Gmail
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = zkdopix@gmail.com
SMTP_PASS = zbfnuvbigijwbmch
SMTP_FROM = "Rankify <noreply@rankify.com.br>"
```

#### Password Security
```
PASSWORD_PEPPER = 1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
NODE_ENV = production
```

### Passo 3: Salvar e Fazer Deploy

1. Clique em **Save** após adicionar cada variável
2. Vá para **Deployments**
3. Clique em **Redeploy** no deployment mais recente
4. Aguarde o deploy completar

## ✅ Verificação

Após o deploy, teste:

1. Acesse https://rinkifyfy-verify.vercel.app/api/health
   - Deve mostrar todas as variáveis configuradas
   - `smtp_test.status` deve ser `"ok"`

2. Tente criar uma conta:
   - Acesse https://rinkifyfy-verify.vercel.app/login
   - Clique em "Criar conta"
   - Insira um email
   - Clique em "Enviar link de verificação"
   - Verifique se o email foi recebido

## 🔐 Segurança

⚠️ **IMPORTANTE:**
- Nunca commite o arquivo `.env.vercel` com valores reais
- Use o painel da Vercel para configurar variáveis sensíveis
- As variáveis com prefixo `NEXT_PUBLIC_` são públicas (visíveis no navegador)
- As outras variáveis são privadas (apenas no servidor)

## 📝 Variáveis Sensíveis

As seguintes variáveis devem ser configuradas **apenas** no painel da Vercel:
- `SMTP_PASS` - Senha do Gmail
- `GOOGLE_CLIENT_SECRET` - Secret do Google OAuth
- `NEXTAUTH_SECRET` - Chave secreta
- `PASSWORD_PEPPER` - Chave de hash

## 🆘 Troubleshooting

### Erro: "Missing credentials for PLAIN"
- Verifique se `SMTP_USER` e `SMTP_PASS` estão configurados
- Não deixe em branco

### Erro: "Invalid login"
- A App Password do Gmail pode estar errada
- Gere uma nova em https://myaccount.google.com/apppasswords

### Erro: "TLS error"
- Verifique se `SMTP_SECURE` está como `false`

### Email não é recebido
- Verifique os logs em **Deployments** → **Logs**
- Procure por `[send-code]` ou `[Mailer]`

## 📞 Suporte

Se tiver problemas:
1. Verifique o endpoint `/api/health`
2. Verifique os logs do deployment
3. Verifique se todas as variáveis estão configuradas
