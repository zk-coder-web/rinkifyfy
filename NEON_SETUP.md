# Setup Neon PostgreSQL na Vercel

## 🎯 Objetivo
Usar PostgreSQL (Neon) como banco de dados persistente na Vercel, em vez de SQLite em memória.

## 📋 Pré-requisitos
- Conta na Vercel
- Projeto conectado ao GitHub

## 🚀 Passos

### 1. Conectar Neon na Vercel

1. Acesse seu projeto na Vercel: https://vercel.com/dashboard
2. Vá para **Settings** → **Integrations**
3. Procure por **Neon** e clique em **Add**
4. Autorize a integração
5. Selecione seu projeto
6. Clique em **Create Database**

### 2. Variáveis de Ambiente

Após conectar Neon, a Vercel automaticamente adiciona:
- `DATABASE_URL` - Connection string do PostgreSQL

Você pode verificar em **Settings** → **Environment Variables**

### 3. Deploy

Faça um novo deploy:
```bash
git push origin main
```

A Vercel vai:
1. Detectar `DATABASE_URL`
2. Criar as tabelas automaticamente
3. Usar PostgreSQL em vez de SQLite

### 4. Verificar Logs

Após o deploy, verifique os logs em **Deployments** → **Logs**

Procure por:
```
[DB] Banco PostgreSQL inicializado com sucesso
```

## 🔄 Migração de Dados

Se você tinha dados no SQLite local, eles **não serão migrados automaticamente**.

Para migrar:
1. Exporte dados do SQLite local
2. Importe no PostgreSQL via Neon

## 📝 Arquivos Modificados

- `src/lib/db.ts` - Router que detecta ambiente
- `src/lib/db-neon.ts` - Funções PostgreSQL
- `src/lib/auth-neon.ts` - Auth com PostgreSQL
- `.env.vercel` - Configuração atualizada

## ⚠️ Importante

- **Localmente**: Continua usando SQLite (arquivo `rankify.db`)
- **Vercel**: Usa PostgreSQL via Neon (automático)
- **Código**: Detecta automaticamente qual usar

## 🆘 Troubleshooting

### Erro: "DATABASE_URL not found"
- Verifique se Neon foi conectado corretamente
- Faça um novo deploy

### Erro: "unable to open database file"
- Isso significa que está tentando usar SQLite em Vercel
- Verifique se DATABASE_URL está configurado

### Erro: "relation does not exist"
- As tabelas não foram criadas
- Verifique os logs de inicialização
