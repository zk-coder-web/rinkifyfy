# Page Generators - Sistema de Temas

Pasta contendo os geradores de páginas públicas com suporte a múltiplos temas.

## Estrutura

```
page-generators/
├── index.ts                      # Arquivo principal com gerenciamento de temas
├── page-generator.ts             # Tema Neon Pink (padrão)
├── page-generatorAzul.ts         # Tema Azul Puro
├── page-generatorPretoEbranco.ts # Tema Preto & Branco
└── README.md                     # Este arquivo
```

## Temas Disponíveis

### 1. 🌸 Rosa/Pink (Padrão)
- **ID**: `neon-pink`
- **Cores**: Rosa vibrante, roxo, azul
- **Efeitos**: Partículas animadas, glow
- **Uso**: Tema padrão e mais vibrante

### 2. 🔵 Azul Puro
- **ID**: `azul-puro`
- **Cores**: Azul profissional, ciano
- **Efeitos**: Partículas animadas, glow
- **Uso**: Empresas profissionais e tech

### 3. ⚫ Preto & Branco
- **ID**: `preto-branco`
- **Cores**: Branco, cinza, preto
- **Efeitos**: Sem partículas, sem glow (minimalista)
- **Uso**: Empresas premium e elegantes

## Como Usar

### No Backend (API)

```typescript
import { generatePublicPageHTML } from '@/lib/page-generators'

// Gerar página com tema específico
const html = generatePublicPageHTML(
  {
    nome: 'Barbearia do Zak',
    slug: 'barbearia-zak',
    instagram: 'barbeariazak',
    whatsapp: '5511999999999',
    googleReviewLink: 'https://...',
  },
  'azul-puro' // Tema desejado
)
```

### No Frontend (Componente React)

```typescript
import ThemeSelector from '@/components/dashboard/ThemeSelector'
import { ThemeType } from '@/lib/page-generators'

export default function Dashboard() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('neon-pink')

  return (
    <ThemeSelector 
      selectedTheme={selectedTheme}
      onThemeChange={setSelectedTheme}
    />
  )
}
```

## Adicionando Novos Temas

1. Crie um novo arquivo `page-generatorNovoTema.ts`
2. Defina a constante `THEME_NOVO_TEMA` com as cores e efeitos
3. Exporte a função `generatePublicPageHTMLNovoTema()`
4. Adicione o tema ao array `AVAILABLE_THEMES` em `index.ts`
5. Atualize o switch case em `generatePublicPageHTML()`

## Estrutura de Cores

Cada tema possui:

```typescript
colors: {
  primary: string        // Cor principal
  secondary: string      // Cor secundária
  tertiary: string       // Cor terciária
  background: string     // Fundo
  backgroundSecondary: string // Fundo secundário
  accent: string         // Cor de destaque
  accentLight: string    // Cor de destaque clara
}

effects: {
  particles: boolean     // Ativa partículas animadas
  glow: boolean         // Ativa efeito glow no avatar
}
```

## Exportações

- `generatePublicPageHTML()` - Função principal
- `AVAILABLE_THEMES` - Array com todos os temas
- `ThemeType` - Tipo TypeScript para temas
- `getThemeInfo()` - Obter informações de um tema
