import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { generatePublicPageHTML } from '@/lib/page-generators'

// GET: Retorna página pública como HTML estático
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const db = getDb()
    
    // Buscar página ativa pelo slug
    const pagina = db.prepare(`
      SELECT 
        p.id,
        p.nome,
        p.slug,
        p.instagram,
        p.whatsapp,
        p.google_review_link as googleReviewLink,
        p.tema
      FROM paginas p
      WHERE p.slug = ? AND p.ativa = 1
    `).get(params.slug) as { id: string; nome: string; slug: string; instagram?: string; whatsapp?: string; googleReviewLink?: string; tema?: string } | undefined

    if (!pagina) {
      return new NextResponse('Página não encontrada', { status: 404 })
    }

    // Gerar HTML da página com o tema selecionado
    const html = generatePublicPageHTML(pagina, pagina.tema as any)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Erro ao gerar página HTML:', error)
    return new NextResponse('Erro interno do servidor', { status: 500 })
  }
}
