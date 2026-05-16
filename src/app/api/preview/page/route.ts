import { NextRequest, NextResponse } from 'next/server'
import { generatePublicPageHTML } from '@/lib/page-generators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, instagram, whatsapp, theme } = body

    const pageData = {
      nome: nome || 'Seu Negócio',
      slug: 'preview',
      instagram,
      whatsapp,
      googleReviewLink: 'https://search.google.com/local/writereview?placeid=preview',
      tema: theme,
    }

    const html = generatePublicPageHTML(pageData, theme)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Erro ao gerar preview:', error)
    return new NextResponse('Erro ao gerar preview', { status: 500 })
  }
}
