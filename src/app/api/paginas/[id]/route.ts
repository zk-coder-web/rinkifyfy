import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth-vercel'

// GET: Buscar página específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const db = getDb()
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
        data_criacao as dataCriacao,
        data_atualizacao as dataAtualizacao
      FROM paginas 
      WHERE id = ? AND user_id = ?
    `).get(params.id, userId) as { id: string; nome: string; placeId: string | null; instagram: string | null; whatsapp: string | null; slug: string; googleReviewLink: string | null; ativa: number; cliquesInstagram: number; cliquesWhatsApp: number; cliquesGoogle: number; avaliacoes: number; dataCriacao: string; dataAtualizacao: string } | undefined

    if (!pagina) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ pagina })
  } catch (error) {
    console.error('Erro ao buscar página:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT: Atualizar página
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nome, placeId, instagram, whatsapp } = body

    const db = getDb()
    
    // Verificar se página existe e pertence ao usuário
    const paginaExistente = db.prepare(
      'SELECT id, nome FROM paginas WHERE id = ? AND user_id = ?'
    ).get(params.id, userId) as { id: string; nome: string } | undefined

    if (!paginaExistente) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    // Validações
    if (placeId && placeId.length !== 27) {
      return NextResponse.json({ error: 'Place ID deve ter 27 caracteres' }, { status: 400 })
    }

    // Gerar novo slug se nome mudou
    let slug = null
    if (nome && nome !== paginaExistente.nome) {
      slug = nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Verificar se novo slug já existe
      const slugExistente = db.prepare(
        'SELECT id FROM paginas WHERE slug = ? AND id != ?'
      ).get(slug, params.id)

      if (slugExistente) {
        return NextResponse.json({ error: 'Slug já está em uso' }, { status: 400 })
      }

      // Verificar se nome já existe para este usuário
      const nomeExistente = db.prepare(
        'SELECT id FROM paginas WHERE user_id = ? AND LOWER(nome) = LOWER(?) AND id != ?'
      ).get(userId, nome, params.id)

      if (nomeExistente) {
        return NextResponse.json({ error: 'Já existe uma página com este nome' }, { status: 400 })
      }
    }

    // Atualizar página
    const googleReviewLink = placeId 
      ? `https://search.google.com/local/writereview?placeid=${placeId}`
      : null

    const updateFields = []
    const updateValues = []

    if (nome) {
      updateFields.push('nome = ?')
      updateValues.push(nome)
    }
    if (placeId) {
      updateFields.push('place_id = ?')
      updateValues.push(placeId)
    }
    if (instagram !== undefined) {
      updateFields.push('instagram = ?')
      updateValues.push(instagram)
    }
    if (whatsapp !== undefined) {
      updateFields.push('whatsapp = ?')
      updateValues.push(whatsapp)
    }
    if (slug) {
      updateFields.push('slug = ?')
      updateValues.push(slug)
    }
    if (googleReviewLink) {
      updateFields.push('google_review_link = ?')
      updateValues.push(googleReviewLink)
    }

    updateFields.push('data_atualizacao = datetime("now")')
    updateValues.push(params.id, userId)

    if (updateFields.length > 0) {
      const query = `
        UPDATE paginas 
        SET ${updateFields.join(', ')} 
        WHERE id = ? AND user_id = ?
      `
      db.prepare(query).run(...updateValues)
    }

    // Buscar página atualizada
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
        data_criacao as dataCriacao,
        data_atualizacao as dataAtualizacao
      FROM paginas 
      WHERE id = ? AND user_id = ?
    `).get(params.id, userId) as { id: string; nome: string; placeId: string | null; instagram: string | null; whatsapp: string | null; slug: string; googleReviewLink: string | null; ativa: number; cliquesInstagram: number; cliquesWhatsApp: number; cliquesGoogle: number; avaliacoes: number; dataCriacao: string; dataAtualizacao: string } | undefined

    // Criar notificação
    if (pagina && typeof pagina === 'object' && 'nome' in pagina) {
      db.prepare(`
        INSERT INTO notificacoes (user_id, tipo, mensagem, lida, data)
        VALUES (?, 'pagina_atualizada', ?, 0, datetime('now'))
      `).run(userId, `Página atualizada: ${(pagina as any).nome}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Página atualizada com sucesso',
      pagina 
    })
  } catch (error) {
    console.error('Erro ao atualizar página:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE: Excluir página
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const db = getDb()
    
    // Buscar página antes de excluir para notificação
    const pagina = db.prepare(
      'SELECT nome FROM paginas WHERE id = ? AND user_id = ?'
    ).get(params.id, userId) as { nome: string } | undefined

    if (!pagina) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    // Excluir página
    db.prepare('DELETE FROM paginas WHERE id = ? AND user_id = ?').run(params.id, userId)

    // Criar notificação
    db.prepare(`
      INSERT INTO notificacoes (user_id, tipo, mensagem, lida, data)
      VALUES (?, 'pagina_excluida', ?, 0, datetime('now'))
    `).run(userId, `Página excluída: ${pagina.nome}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Página excluída com sucesso' 
    })
  } catch (error) {
    console.error('Erro ao excluir página:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH: Atualizar parcialmente (ativa/inativa, cliques, foto, etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { ativa, tipoClique, fotoUrl, fotoRotacao, mostrarFoto } = body

    const db = getDb()
    
    // Verificar se página existe e pertence ao usuário
    const paginaExistente = db.prepare(
      'SELECT id, nome FROM paginas WHERE id = ? AND user_id = ?'
    ).get(params.id, userId) as { id: string; nome: string } | undefined

    if (!paginaExistente) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    // Atualizar foto se fornecida
    if (fotoUrl !== undefined || fotoRotacao !== undefined || mostrarFoto !== undefined) {
      const updateFields = []
      const updateValues = []

      if (fotoUrl !== undefined) {
        updateFields.push('foto_url = ?')
        updateValues.push(fotoUrl)
      }
      if (fotoRotacao !== undefined) {
        updateFields.push('foto_rotacao = ?')
        updateValues.push(fotoRotacao)
      }
      if (mostrarFoto !== undefined) {
        updateFields.push('mostrar_foto = ?')
        updateValues.push(mostrarFoto ? 1 : 0)
      }

      updateFields.push('data_atualizacao = datetime("now")')
      updateValues.push(params.id, userId)

      const query = `
        UPDATE paginas 
        SET ${updateFields.join(', ')} 
        WHERE id = ? AND user_id = ?
      `
      db.prepare(query).run(...updateValues)
    }

    if (ativa !== undefined) {
      // Atualizar status ativa/inativa
      db.prepare(`
        UPDATE paginas 
        SET ativa = ?, data_atualizacao = datetime('now')
        WHERE id = ? AND user_id = ?
      `).run(ativa ? 1 : 0, params.id, userId)

      // Criar notificação
      const tipo = ativa ? 'pagina_reativada' : 'pagina_desativada'
      const mensagem = ativa 
        ? `Página reativada: ${paginaExistente.nome}`
        : `Página desativada: ${paginaExistente.nome}`

      db.prepare(`
        INSERT INTO notificacoes (user_id, tipo, mensagem, lida, data)
        VALUES (?, ?, ?, 0, datetime('now'))
      `).run(userId, tipo, mensagem)
    }

    if (tipoClique) {
      // Registrar clique
      let campoClique = ''
      switch (tipoClique) {
        case 'instagram':
          campoClique = 'cliques_instagram'
          break
        case 'whatsapp':
          campoClique = 'cliques_whatsapp'
          break
        case 'google':
          campoClique = 'cliques_google'
          break
      }

      if (campoClique) {
        db.prepare(`
          UPDATE paginas 
          SET ${campoClique} = ${campoClique} + 1, data_atualizacao = datetime('now')
          WHERE id = ? AND user_id = ?
        `).run(params.id, userId)

        // Criar notificação de clique (apenas para o usuário)
        db.prepare(`
          INSERT INTO notificacoes (user_id, tipo, mensagem, lida, data)
          VALUES (?, 'clique', ?, 0, datetime('now'))
        `).run(userId, `Clique registrado no ${tipoClique} da página ${paginaExistente.nome}`)
      }
    }

    // Buscar página atualizada
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
        foto_url as fotoUrl,
        foto_rotacao as fotoRotacao,
        mostrar_foto as mostrarFoto,
        data_criacao as dataCriacao,
        data_atualizacao as dataAtualizacao
      FROM paginas 
      WHERE id = ? AND user_id = ?
    `).get(params.id, userId) as { id: string; nome: string; placeId: string | null; instagram: string | null; whatsapp: string | null; slug: string; googleReviewLink: string | null; ativa: number; cliquesInstagram: number; cliquesWhatsApp: number; cliquesGoogle: number; avaliacoes: number; fotoUrl: string | null; fotoRotacao: number | null; mostrarFoto: number; dataCriacao: string; dataAtualizacao: string } | undefined

    return NextResponse.json({ 
      success: true, 
      message: 'Página atualizada com sucesso',
      pagina 
    })
  } catch (error) {
    console.error('Erro ao atualizar página:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}