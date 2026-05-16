/**
 * API de preferências do usuário para sincronização e persistência
 * GET /api/auth/preferences - Obtém todas as preferências
 * POST /api/auth/preferences - Salva uma preferência
 * DELETE /api/auth/preferences - Remove uma preferência
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, getAllUserPreferences, setUserPreference, deleteUserPreference } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Obter todas as preferências do usuário
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('rankify_session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const user = await getSessionUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Sessão expirada.' }, { status: 401 })
    }

    const preferences = getAllUserPreferences(user.id)

    return NextResponse.json({
      ok: true,
      preferences,
    })
  } catch (error) {
    console.error('Erro ao buscar preferências:', error)
    return NextResponse.json({ error: 'Erro ao buscar preferências.' }, { status: 500 })
  }
}

// POST - Salvar uma preferência
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('rankify_session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const user = await getSessionUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Sessão expirada.' }, { status: 401 })
    }

    const body = await req.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    setUserPreference(user.id, key, JSON.stringify(value))

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    console.error('Erro ao salvar preferência:', error)
    return NextResponse.json({ error: 'Erro ao salvar preferência.' }, { status: 500 })
  }
}

// DELETE - Remover uma preferência
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('rankify_session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const user = await getSessionUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Sessão expirada.' }, { status: 401 })
    }

    const body = await req.json()
    const { key } = body

    if (!key) {
      return NextResponse.json({ error: 'Parâmetro key obrigatório.' }, { status: 400 })
    }

    deleteUserPreference(user.id, key)

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    console.error('Erro ao remover preferência:', error)
    return NextResponse.json({ error: 'Erro ao remover preferência.' }, { status: 500 })
  }
}