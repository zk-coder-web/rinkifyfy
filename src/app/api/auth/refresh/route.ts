/**
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 * Renova a sessão usando refresh token
 */
import { NextRequest, NextResponse } from 'next/server'
import { refreshSessionByToken, updateSessionActivity } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token obrigatório.' }, { status: 400 })
    }

    const tokens = refreshSessionByToken(refreshToken)
    if (!tokens) {
      return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 })
    }

    return NextResponse.json({
      ok: true,
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao renovar sessão.' }, { status: 500 })
  }
}