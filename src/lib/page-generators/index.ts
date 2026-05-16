import { THEMES, generatePageHTML } from './themes'

export interface PageData {
  nome: string
  slug: string
  instagram?: string
  whatsapp?: string
  googleReviewLink?: string
  tema?: string
}

export type ThemeType = 'neon-pink' | 'azul-puro' | 'preto-branco'

export const AVAILABLE_THEMES = [
  {
    id: 'neon-pink',
    name: 'Rosa/Pink',
    description: 'Tema padrão com cores vibrantes',
    icon: '🌸',
  },
  {
    id: 'azul-puro',
    name: 'Azul Puro',
    description: 'Tema azul moderno e profissional',
    icon: '🔵',
  },
  {
    id: 'preto-branco',
    name: 'Preto & Branco',
    description: 'Tema minimalista e elegante',
    icon: '⚫',
  },
]

export function generatePublicPageHTML(pagina: PageData, theme?: ThemeType): string {
  return generatePageHTML(pagina, theme)
}

export function getThemeInfo(themeId: ThemeType) {
  return AVAILABLE_THEMES.find(t => t.id === themeId) || AVAILABLE_THEMES[0]
}
