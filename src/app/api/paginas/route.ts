import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

// GET: Listar todas as páginas do usuário
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const db = getDb()
    const paginas = db.prepare(`
      SELECT 
        id,
        nome,
        place_id as placeId,
        instagram,
        whatsapp,
        slug,
        google_review_link as googleReviewLink,
        ativa,
        cliques_instagram as cliquesInstagram,
        cliques_whatsapp as cliquesWhatsApp,
        cliques_google as cliquesGoogle,
        avaliacoes,
        tema,
        data_criacao as dataCriacao,
        data_atualizacao as dataAtualizacao
      FROM paginas 
      WHERE user_id = ?
      ORDER BY data_criacao DESC
    `).all(userId)

    return NextResponse.json({ paginas })
  } catch (error) {
    console.error('Erro ao listar páginas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST: Criar nova página
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nome, placeId, instagram, whatsapp, theme } = body

    // Validações
    if (!nome || !placeId) {
      return NextResponse.json({ error: 'Nome e Place ID são obrigatórios' }, { status: 400 })
    }

    if (placeId.length !== 27) {
      return NextResponse.json({ error: 'Place ID deve ter 27 caracteres' }, { status: 400 })
    }

    // Gerar slug único
    const slug = nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Verificar se slug já existe
    const db = getDb()
    const slugExistente = db.prepare(
      'SELECT id FROM paginas WHERE slug = ?'
    ).get(slug) as { id: string } | undefined

    if (slugExistente) {
      return NextResponse.json({ error: 'Slug já está em uso' }, { status: 400 })
    }

    // Verificar se nome já existe para este usuário
    const nomeExistente = db.prepare(
      'SELECT id FROM paginas WHERE user_id = ? AND LOWER(nome) = LOWER(?)'
    ).get(userId, nome) as { id: string } | undefined

    if (nomeExistente) {
      return NextResponse.json({ error: 'Já existe uma página com este nome' }, { status: 400 })
    }

    // Inserir página
    const googleReviewLink = `https://search.google.com/local/writereview?placeid=${placeId}`
    const temaSalvo = theme || 'neon-pink'
    
    const result = db.prepare(`
      INSERT INTO paginas (
        user_id, nome, place_id, instagram, whatsapp, slug, 
        google_review_link, ativa, tema, data_criacao, data_atualizacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'), datetime('now'))
    `).run(userId, nome, placeId, instagram || '', whatsapp || '', slug, googleReviewLink, temaSalvo)

    // Buscar página criada
    const pagina = db.prepare(`
      SELECT 
        id,
        nome,
        place_id as placeId,
        instagram,
        whatsapp,
        slug,
        google_review_link as googleReviewLink,
        ativa,
        cliques_instagram as cliquesInstagram,
        cliques_whatsapp as cliquesWhatsApp,
        cliques_google as cliquesGoogle,
        avaliacoes,
        tema,
        data_criacao as dataCriacao,
        data_atualizacao as dataAtualizacao
      FROM paginas 
      WHERE id = ?
    `).get(result.lastInsertRowid) as { id: string; nome: string; placeId: string; instagram: string; whatsapp: string; slug: string; googleReviewLink: string; ativa: number; cliquesInstagram: number; cliquesWhatsApp: number; cliquesGoogle: number; avaliacoes: number; tema: string; dataCriacao: string; dataAtualizacao: string } | undefined

    // Criar notificação
    db.prepare(`
      INSERT INTO notificacoes (user_id, tipo, mensagem, lida, data)
      VALUES (?, 'pagina_criada', ?, 0, datetime('now'))
    `).run(userId, `Nova página criada: ${nome}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Página criada com sucesso',
      pagina 
    })
  } catch (error) {
    console.error('Erro ao criar página:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}