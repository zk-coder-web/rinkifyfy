# 🔐 Autenticação Simples com JSON

## 📋 Visão Geral

Sistema de autenticação minimalista que usa JSON em vez de banco de dados complexo.

### ✅ Características

- ✅ Sem banco de dados (SQLite/PostgreSQL)
- ✅ Armazenamento em JSON simples
- ✅ Verificação de código por email
- ✅ Sem complexidade desnecessária
- ✅ Fácil de testar e debugar

## 📁 Estrutura

```
src/lib/json-db.ts                    # Gerenciador de JSON
src/app/api/auth/send-code-simple/    # Enviar código
src/app/api/auth/verify-code-simple/  # Verificar código
src/app/api/auth/me-simple/           # Obter usuário
.data/                                # Pasta de dados (criada automaticamente)
  ├── users.json                      # Usuários
  └── codes.json                      # Códigos de verificação
```

## 🚀 Como Usar

### 1️⃣ Enviar Código de Verificação

```bash
curl -X POST http://localhost:3000/api/auth/send-code-simple \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@gmail.com"}'
```

**Resposta:**
```json
{
  "ok": true,
  "message": "Código enviado com sucesso"
}
```

### 2️⃣ Verificar Código e Fazer Login

```bash
curl -X POST http://localhost:3000/api/auth/verify-code-simple \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@gmail.com","code":"123456"}'
```

**Resposta:**
```json
{
  "ok": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": "user_1234567890_abc123",
    "email": "seu-email@gmail.com",
    "name": "seu-email"
  },
  "token": "token_1234567890_abc123"
}
```

### 3️⃣ Obter Usuário Autenticado

```bash
curl -X GET http://localhost:3000/api/auth/me-simple \
  -H "Cookie: auth_token=token_1234567890_abc123"
```

**Resposta:**
```json
{
  "ok": true,
  "user": {
    "id": "user_placeholder",
    "email": "user@example.com",
    "name": "Usuário"
  }
}
```

## 📊 Estrutura dos Dados

### users.json
```json
{
  "seu-email@gmail.com": {
    "id": "user_1234567890_abc123",
    "email": "seu-email@gmail.com",
    "name": "seu-email",
    "createdAt": "2026-05-17T20:30:00.000Z"
  }
}
```

### codes.json
```json
{
  "seu-email@gmail.com": {
    "email": "seu-email@gmail.com",
    "code": "123456",
    "expiresAt": "2026-05-17T20:40:00.000Z",
    "used": false
  }
}
```

## 🔧 Funções Disponíveis

### Usuários
```typescript
// Obter usuário por email
getUserByEmail(email: string): User | null

// Criar novo usuário
createUser(email: string, name: string): User

// Obter todos os usuários
getAllUsers(): User[]
```

### Códigos
```typescript
// Gerar código aleatório
generateCode(): string

// Salvar código
saveCode(email: string, code: string): void

// Obter código
getCode(email: string): VerificationCode | null

// Verificar código
verifyCode(email: string, code: string): boolean

// Deletar código
deleteCode(email: string): void

// Limpar códigos expirados
cleanupExpiredCodes(): void
```

## ⚙️ Configuração

### Variáveis de Ambiente

Nenhuma variável especial necessária! Apenas use as variáveis de email existentes:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha
SMTP_FROM="Rankify <noreply@rankify.com.br>"
```

## 🧪 Testar Localmente

1. **Iniciar servidor:**
```bash
npm run dev
```

2. **Enviar código:**
```bash
curl -X POST http://localhost:3000/api/auth/send-code-simple \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

3. **Verificar arquivo `.data/codes.json`:**
```bash
cat .data/codes.json
```

4. **Copiar o código e verificar:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-code-simple \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"XXXXX"}'
```

## 📝 Notas Importantes

### Segurança
- ⚠️ Este sistema é para **desenvolvimento/testes**
- ⚠️ Não use em produção sem melhorias de segurança
- ⚠️ Adicione validação de token em produção
- ⚠️ Use HTTPS em produção

### Melhorias Futuras
- [ ] Validação de token JWT
- [ ] Hash de senhas
- [ ] Rate limiting
- [ ] Backup automático
- [ ] Migração para banco de dados real

## 🎯 Próximos Passos

1. Testar as rotas localmente
2. Integrar com frontend
3. Adicionar validação de token
4. Migrar para banco de dados real quando necessário

---

**Sistema simples, rápido e fácil de entender! 🚀**
