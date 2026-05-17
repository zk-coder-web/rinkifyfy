import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import PublicPageView from '@/components/public/PublicPageView'

interface PageProps {
  params: {
    slug: string
  }
}

// Gerar metadados dinâmicos para SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const db = getDb()
    const pagina = db.prepare(`
      SELECT 
        p.nome,
        p.slug,
        p.avaliacoes
      FROM paginas p
      WHERE p.slug = ? AND p.ativa = 1
    `).get(params.slug) as { nome: string; slug: string; avaliacoes: number } | undefined

    if (!pagina) {
      return {
        title: 'Página não encontrada',
        description: 'A página que você procura não existe.',
      }
    }

    return {
      title: `${pagina.nome} | Rankify`,
      description: `Conheça ${pagina.nome}. Acesse nossa página e entre em contato conosco.`,
      openGraph: {
        title: pagina.nome,
        description: `Conheça ${pagina.nome}. Acesse nossa página e entre em contato conosco.`,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://rankfy.netlify.app'}/p/${pagina.slug}`,
      },
    }
  } catch (error) {
    console.error('Erro ao gerar metadados:', error)
    return {
      title: 'Rankify',
      description: 'Plataforma de páginas públicas para empresas',
    }
  }
}

export default async function PublicPage({ params }: PageProps) {
  try {
    const db = getDb()

    // Buscar página pública pelo slug
    const paginaData = db.prepare(`
      SELECT 
        p.id,
        p.nome,
        p.place_id as placeId,
        p.instagram,
        p.whatsapp,
        p.slug,
        p.google_review_link as googleReviewLink,
        p.cliques_instagram as cliquesInstagram,
        p.cliques_whatsapp as cliquesWhatsApp,
        p.cliques_google as cliquesGoogle,
        p.avaliacoes,
        p.tema,
        p.foto_url as fotoUrl,
        p.foto_rotacao as fotoRotacao,
        p.mostrar_foto as mostrarFoto,
        p.data_criacao as dataCriacao,
        u.display_name as criadorNome
      FROM paginas p
      JOIN users u ON p.user_id = u.id
      WHERE p.slug = ? AND p.ativa = 1
    `).get(params.slug) as any

    const pagina = paginaData ? {
      ...paginaData,
      placeId: paginaData.placeId || undefined,
      instagram: paginaData.instagram || undefined,
      whatsapp: paginaData.whatsapp || undefined,
      googleReviewLink: paginaData.googleReviewLink || undefined,
      avaliacoes: paginaData.avaliacoes?.toString(),
      tema: paginaData.tema || undefined,
      fotoUrl: paginaData.fotoUrl || undefined,
      fotoRotacao: paginaData.fotoRotacao || undefined,
      mostrarFoto: paginaData.mostrarFoto ? true : undefined,
    } : null

    if (!pagina) {
      notFound()
    }

    return <PublicPageView pagina={pagina} />
  } catch (error) {
    console.error('Erro ao carregar página pública:', error)
    notFound()
  }
}
