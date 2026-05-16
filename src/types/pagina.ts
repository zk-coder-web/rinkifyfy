export interface Pagina {
  id: string // P1, P2, etc
  nome: string
  placeId: string
  instagram: string
  whatsapp: string
  slug: string
  googleReviewLink: string
  dataCriacao: string
  ativa: boolean
  cliquesInstagram: number
  cliquesWhatsApp: number
  cliquesGoogle: number
  avaliacoes: number
  tema?: string
}

export interface PaginaCriacao {
  nome: string
  placeId: string
  instagram: string
  whatsapp: string
  slug?: string
  googleReviewLink?: string
  theme?: string
}