/**
 * POST /api/auth/send-code-simple
 * Versão simplificada - sem banco de dados complexo
 * Body: { email: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateCode, saveCode, getUserByEmail, createUser } from '@/lib/json-db'
import { sendWelcomeEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()

    console.log('[send-code-simple] Email recebido:', email)

    // Validar email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Verificar se usuário já existe
    let user = getUserByEmail(email)
    if (!user) {
      // Criar novo usuário
      const name = email.split('@')[0]
      user = createUser(email, name)
      console.log('[send-code-simple] Novo usuário criado:', email)
    }

    // Gerar código
    const code = generateCode()
    saveCode(email, code)
    console.log('[send-code-simple] Código gerado:', code)

    // Enviar email
    try {
      await sendWelcomeEmail(email, '', code)
      console.log('[send-code-simple] Email enviado com sucesso')
    } catch (emailError: any) {
      console.error('[send-code-simple] Erro ao enviar email:', emailError.message)
      return NextResponse.json(
        { error: 'Erro ao enviar email. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      ok: true,
      message: 'Código enviado com sucesso'
    })
  } catch (err: any) {
    console.error('[send-code-simple] Erro:', err.message)
    return NextResponse.json(
      { error: 'Erro ao enviar código' },
      { status: 500 }
    )
  }
}
