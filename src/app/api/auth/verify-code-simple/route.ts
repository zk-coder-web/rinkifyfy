/**
 * POST /api/auth/verify-code-simple
 * Versão simplificada - verifica código e faz login
 * Body: { email: string, code: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyCode, getUserByEmail } from '@/lib/json-db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const code = String(body?.code || '').trim()

    console.log('[verify-code-simple] Email:', email, 'Código:', code)

    // Validar entrada
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email e código são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar código
    const isValid = verifyCode(email, code)
    if (!isValid) {
      console.log('[verify-code-simple] Código inválido ou expirado')
      return NextResponse.json(
        { error: 'Código inválido ou expirado' },
        { status: 400 }
      )
    }

    // Obter usuário
    const user = getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    console.log('[verify-code-simple] Código verificado com sucesso')

    // Gerar token simples (apenas para exemplo)
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Retornar resposta com token
    const response = NextResponse.json({
      ok: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    })

    // Salvar token em cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    })

    return response
  } catch (err: any) {
    console.error('[verify-code-simple] Erro:', err.message)
    return NextResponse.json(
      { error: 'Erro ao verificar código' },
      { status: 500 }
    )
  }
}
