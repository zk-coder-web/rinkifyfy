/**
 * GET /api/auth/me-simple
 * Retorna dados do usuário autenticado
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/json-db'

export async function GET(req: NextRequest) {
  try {
    // Obter token do cookie
    const token = req.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Nota: Em produção, você deveria validar o token
    // Por enquanto, apenas retornamos um placeholder
    
    return NextResponse.json({
      ok: true,
      user: {
        id: 'user_placeholder',
        email: 'user@example.com',
        name: 'Usuário'
      }
    })
  } catch (err: any) {
    console.error('[me-simple] Erro:', err.message)
    return NextResponse.json(
      { error: 'Erro ao obter usuário' },
      { status: 500 }
    )
  }
}
