import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET: Buscar página pública por slug
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
        p.data_criacao as dataCriacao,
        u.display_name as criadorNome
      FROM paginas p
      JOIN users u ON p.user_id = u.id
      WHERE p.slug = ? AND p.ativa = 1
    `).get(params.slug) as { id: string; nome: string; placeId: string | null; instagram: string | null; whatsapp: string | null; slug: string; googleReviewLink: string | null; cliquesInstagram: number; cliquesWhatsApp: number; cliquesGoogle: number; avaliacoes: number; tema?: string; dataCriacao: string; criadorNome: string } | undefined

    if (!pagina) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ pagina })
  } catch (error) {
    console.error('Erro ao buscar página pública:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST: Registrar clique em página pública
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    const { tipoClique } = body

    if (!tipoClique || !['instagram', 'whatsapp', 'google', 'avaliacao'].includes(tipoClique)) {
      return NextResponse.json({ error: 'Tipo de clique inválido' }, { status: 400 })
    }

    const db = getDb()
    
    // Buscar página pelo slug
    const pagina = db.prepare(
      'SELECT id, user_id FROM paginas WHERE slug = ? AND ativa = 1'
    ).get(params.slug) as { id: string; user_id: number } | undefined

    if (!pagina) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    // Registrar clique
    let campoClique = ''
    let tipoNotificacao = 'clique'
    let mensagemNotificacao = ''

    switch (tipoClique) {
      case 'instagram':
        campoClique = 'cliques_instagram'
        mensagemNotificacao = `Clique registrado no Instagram da página`
        break
      case 'whatsapp':
        campoClique = 'cliques_whatsapp'
        mensagemNotificacao = `Clique registrado no WhatsApp da página`
        break
      case 'google':
        campoClique = 'cliques_google'
        mensagemNotificacao = `Clique registrado no Google da página`
        break
      case 'avaliacao':
        campoClique = 'avaliacoes'
        tipoNotificacao = 'avaliacao'
        mensagemNotificacao = `Nova avaliação recebida na página`
        break
    }

    db.prepare(`
      UPDATE paginas 
      SET ${campoClique} = ${campoClique} + 1, data_atualizacao = datetime('now')
      WHERE id = ?
    `).run(pagina.id)

    // Buscar nome da página para notificação
    const paginaInfo = db.prepare(
      'SELECT nome FROM paginas WHERE id = ?'
    ).get(pagina.id) as { nome: string } | undefined

    // Criar notificação para o dono da página
    db.prepare(`
      INSERT INTO notificacoes (user_id, tipo, mensagem, lida, data)
      VALUES (?, ?, ?, 0, datetime('now'))
    `).run(pagina.user_id, tipoNotificacao, `${mensagemNotificacao} ${paginaInfo?.nome || 'Página'}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Clique registrado com sucesso' 
    })
  } catch (error) {
    console.error('Erro ao registrar clique:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}