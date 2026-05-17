/**
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 * Renova a sessão usando refresh token
 * Suporta tanto autenticação simples quanto complexa
 */
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token obrigatório.' }, { status: 400 })
    }

    // Para autenticação simples, apenas retornar o mesmo token
    // (em produção, você deveria implementar lógica de refresh adequada)
    if (refreshToken.startsWith('token_')) {
      return NextResponse.json({
        ok: true,
        token: refreshToken,
        refreshToken: refreshToken,
      })
    }

    // Para autenticação complexa, tentar renovar
    // (implementação futura com banco de dados)
    return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Erro ao renovar sessão.' }, { status: 500 })
  }
}
