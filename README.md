# 🚀 Rankify - Sistema de Páginas Públicas em Tempo Real

Sistema profissional para criação e gerenciamento de páginas públicas com sincronização em tempo real entre dispositivos.

## ✨ Funcionalidades

### 🎯 Sistema Completo
- **Páginas públicas reais** - Acessíveis por qualquer pessoa na internet
- **Sincronização em tempo real** - Dados atualizados em todos os dispositivos
- **Backend com banco de dados** - Persistência profissional com SQLite
- **APIs RESTful** - Sistema completo de gerenciamento

### 📱 Dashboard Premium
- **Criação de páginas** - Formulário com validações avançadas
- **Gerenciador de páginas** - Lista, edição e exclusão
- **Páginas ativas** - Monitoramento em tempo real
- **Estatísticas** - Cliques, avaliações e métricas
- **Notificações** - Sistema completo de alertas

### 🌐 Páginas Públicas
- **Design premium** - Interface moderna e responsiva
- **Botões de ação** - Instagram, WhatsApp, Google Reviews
- **Registro de cliques** - Contagem em tempo real
- **URLs amigáveis** - Baseadas no nome da empresa

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, SQLite (better-sqlite3)
- **Autenticação**: Sistema próprio com sessões
- **Banco de Dados**: SQLite com WAL mode
- **Estilo**: Design system premium com Tailwind

## 🚀 Instalação Rápida

### 1. Clonar e instalar
```bash
git clone [seu-repositorio]
cd rankup-next
npm install
```

### 2. Configurar ambiente
```bash
# Copiar arquivo de exemplo
cp .env.local.example .env.local

# Editar .env.local se necessário
```

### 3. Inicializar banco de dados
```bash
# Opção 1: Inicializar e rodar
npm run dev:full

# Opção 2: Separado
npm run init-db
npm run dev
```

### 4. Acessar o sistema
```
URL: http://localhost:3000
Login: admin@rankify.com
Senha: admin123
```

## 📁 Estrutura do Projeto

```
rankup-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # APIs RESTful
│   │   │   ├── paginas/       # Gerenciamento de páginas
│   │   │   ├── public/        # APIs públicas
│   │   │   └── notificacoes/  # Sistema de notificações
│   │   ├── dashboard/         # Área logada
│   │   ├── p/[slug]/          # Páginas públicas
│   │   └── login/             # Autenticação
│   ├── components/            # Componentes React
│   │   ├── dashboard/         # Componentes do dashboard
│   │   ├── providers/         # Context providers
│   │   └── ui/                # Componentes de UI
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilitários
│   ├── services/              # Serviços de API
│   └── types/                 # TypeScript types
├── scripts/                   # Scripts utilitários
├── public/                    # Arquivos estáticos
└── rankify.db                # Banco de dados SQLite
```

## 🔧 Configuração Avançada

### Banco de Dados
O sistema usa SQLite com as seguintes tabelas:
- `users` - Usuários do sistema
- `paginas` - Páginas criadas pelos usuários
- `notificacoes` - Sistema de notificações
- `sessions` - Sessões de autenticação

### APIs Disponíveis

#### 🔐 Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `GET /api/auth/me` - Informações do usuário logado
- `POST /api/auth/logout` - Logout

#### 📄 Páginas (Autenticado)
- `GET /api/paginas` - Listar todas as páginas
- `POST /api/paginas` - Criar nova página
- `GET /api/paginas/[id]` - Buscar página específica
- `PUT /api/paginas/[id]` - Atualizar página
- `DELETE /api/paginas/[id]` - Excluir página
- `PATCH /api/paginas/[id]` - Atualizações parciais

#### 🌐 Páginas Públicas
- `GET /api/public/paginas/[slug]` - Buscar página pública
- `POST /api/public/paginas/[slug]` - Registrar clique

#### 🔔 Notificações
- `GET /api/notificacoes` - Listar notificações
- `POST /api/notificacoes` - Marcar como lida
- `DELETE /api/notificacoes` - Limpar todas

## 📱 Como Usar

### 1. Criar uma Página
1. Faça login no dashboard
2. Clique em "Nova Página"
3. Preencha os dados:
   - Nome da empresa
   - Place ID do Google (27 caracteres)
   - Instagram (opcional)
   - WhatsApp (opcional)
4. Clique em "GERAR PÁGINA"

### 2. Gerenciar Páginas
- **Minhas Páginas**: Lista completa com ações
- **Editar**: Atualizar dados da página
- **Excluir**: Remover página permanentemente
- **Ativar/Desativar**: Controlar visibilidade

### 3. Monitorar Estatísticas
- **Cliques no Instagram**: Contagem em tempo real
- **Cliques no WhatsApp**: Registro automático
- **Cliques no Google**: Avaliações registradas
- **Páginas ativas**: Status em tempo real

### 4. Acessar Página Pública
Cada página gera uma URL única:
```
http://localhost:3000/p/nome-da-empresa
```

## 🎨 Personalização

### Estilos
- Edite `src/app/globals.css` para cores e temas
- Modifique `tailwind.config.ts` para configurações do Tailwind

### Componentes
- Personalize componentes em `src/components/ui/`
- Crie novos componentes seguindo o padrão existente

### APIs
- Extenda APIs em `src/app/api/`
- Adicione novas funcionalidades seguindo o padrão REST

## 🔒 Segurança

- **Autenticação**: Sistema próprio com sessões
- **Validações**: Input validation em todas as APIs
- **SQL Injection**: Prevenção com prepared statements
- **CORS**: Configurado para segurança
- **Cookies**: HttpOnly e Secure flags

## 🚨 Solução de Problemas

### Banco de dados não inicializa
```bash
# Remover banco existente
rm rankify.db

# Re-inicializar
npm run init-db
```

### APIs retornam erro 500
```bash
# Verificar logs
npm run dev

# Verificar permissões do banco
chmod 644 rankify.db
```

### Páginas não carregam
1. Verifique se o banco está inicializado
2. Confirme se o usuário está logado
3. Verifique os logs do servidor

## 📈 Próximos Passos

### Melhorias Planejadas
- [ ] Upload de logos das empresas
- [ ] Analytics avançados
- [ ] Templates de página
- [ ] Integração com mais redes sociais
- [ ] Sistema de planos e assinaturas

### Deployment
```bash
# Build para produção
npm run build

# Iniciar produção
npm start
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato.

---

**🎉 Sistema pronto para produção!** 

Todas as funcionalidades implementadas:
- ✅ Páginas públicas reais na internet
- ✅ Sincronização em tempo real entre dispositivos  
- ✅ Backend profissional com banco de dados
- ✅ Dashboard completo com gerenciamento
- ✅ Sistema de notificações
- ✅ Estatísticas em tempo real
- ✅ Design premium responsivo