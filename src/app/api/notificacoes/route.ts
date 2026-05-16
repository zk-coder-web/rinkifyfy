import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

// GET: Listar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const db = getDb()
    const notificacoes = db.prepare(`
      SELECT 
        id,
        tipo,
        mensagem,
        lida,
        data
      FROM notificacoes 
      WHERE user_id = ?
      ORDER BY data DESC
      LIMIT 100
    `).all(userId)

    return NextResponse.json({ notificacoes })
  } catch (error) {
    console.error('Erro ao listar notificações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST: Marcar notificação como lida
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, marcarTodas } = body

    const db = getDb()

    if (marcarTodas) {
      // Marcar todas como lidas
      db.prepare(`
        UPDATE notificacoes 
        SET lida = 1 
        WHERE user_id = ? AND lida = 0
      `).run(userId)
    } else if (id) {
      // Marcar uma específica como lida
      db.prepare(`
        UPDATE notificacoes 
        SET lida = 1 
        WHERE id = ? AND user_id = ?
      `).run(id, userId)
    } else {
      return NextResponse.json({ error: 'ID ou marcarTodas é obrigatório' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Notificação marcada como lida' })
  } catch (error) {
    console.error('Erro ao marcar notificação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE: Limpar notificações
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const db = getDb()
    
    // Limpar todas as notificações do usuário
    db.prepare('DELETE FROM notificacoes WHERE user_id = ?').run(userId)

    return NextResponse.json({ success: true, message: 'Notificações limpas com sucesso' })
  } catch (error) {
    console.error('Erro ao limpar notificações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}