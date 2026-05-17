import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// POST: Criar nova página pública
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, nome, slug, instagram, whatsapp, googleReviewLink, theme } = body

    // Validar campos obrigatórios
    if (!userId || !nome || !slug) {
      return NextResponse.json(
        { error: 'userId, nome e slug são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar pelo menos um contato
    if (!instagram && !whatsapp && !googleReviewLink) {
      return NextResponse.json(
        { error: 'Adicione pelo menos um contato (Instagram, WhatsApp ou Google Reviews)' },
        { status: 400 }
      )
    }

    // Validar formato do slug
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug inválido. Use apenas letras minúsculas, números e hífens' },
        { status: 400 }
      )
    }

    const db = getDb()

    // Verificar se slug já existe
    const existingPage = db.prepare('SELECT id FROM paginas WHERE slug = ?').get(slug) as { id: string } | undefined
    if (existingPage) {
      return NextResponse.json(
        { error: 'Este slug já está em uso' },
        { status: 409 }
      )
    }

    // Verificar se usuário existe
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId) as { id: number } | undefined
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Criar página
    const pageId = uuidv4()
    const now = new Date().toISOString()
    const selectedTheme = theme || 'neon-pink'

    db.prepare(`
      INSERT INTO paginas (
        id,
        user_id,
        nome,
        slug,
        instagram,
        whatsapp,
        google_review_link,
        tema,
        ativa,
        data_criacao,
        data_atualizacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      pageId,
      userId,
      nome,
      slug,
      instagram || null,
      whatsapp || null,
      googleReviewLink || null,
      selectedTheme,
      now,
      now
    )

    // Criar notificação para o usuário
    db.prepare(`
      INSERT INTO notificacoes (user_id, tipo, mensagem, lida, data)
      VALUES (?, 'sucesso', ?, 0, datetime('now'))
    `).run(userId, `Página pública "${nome}" criada com sucesso! Acesse em: ${process.env.NEXT_PUBLIC_APP_URL || 'https://rankfy.netlify.app'}/p/${slug}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Página criada com sucesso',
        page: {
          id: pageId,
          slug,
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://rankfy.netlify.app'}/p/${slug}`,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar página:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
