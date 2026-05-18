# 🚀 Configuração do Neon PostgreSQL

## Passo 1: Criar Conta no Neon

1. Acesse: https://neon.tech
2. Clique em **"Sign Up"** (pode usar GitHub)
3. Crie um novo projeto chamado **"rankify"**
4. Selecione a região mais próxima (ex: US East)

## Passo 2: Copiar Connection String

1. No dashboard do Neon, clique no seu projeto
2. Vá em **"Connection Details"**
3. Copie a **"Connection string"** (algo como):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Passo 3: Configurar Variáveis de Ambiente

### No Netlify:

1. Acesse: https://app.netlify.com/sites/rkfy/configuration/env
2. Adicione a variável:
   - **Key:** `DATABASE_URL`
   - **Value:** Cole a connection string do Neon
3. Clique em **"Save"**
4. Faça um novo deploy

### Localmente (.env.local):

Adicione no arquivo `.env.local`:
```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Passo 4: Inicializar o Schema

Execute o script para criar as tabelas:

```bash
npm run init-postgres
```

Ou acesse a rota manualmente:
```
http://localhost:3000/api/init-db
```

## ✅ Pronto!

Agora seu sistema está usando PostgreSQL persistente no Neon!

### Benefícios:
- ✅ Dados persistem entre deploys
- ✅ Sessões não expiram
- ✅ Compatível com Netlify e Vercel
- ✅ Gratuito até 0.5GB
- ✅ Backups automáticos
- ✅ SSL/TLS por padrão

### Próximos Passos:
1. Teste o login/cadastro
2. Verifique se a sessão persiste
3. Teste a exclusão de conta com confirmação
