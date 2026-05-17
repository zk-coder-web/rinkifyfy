/**
 * POST /api/auth/recovery/reset
 * Body: { email: string; code: string; pin: string; password: string }
 * Resets the user's password after verifying code + PIN.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  getUserByEmail,
  consumeVerifyCode,
  verifyUserPin,
  hashPassword,
  updateUserPassword,
  validatePassword,
} from '@/lib/auth-vercel'

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json()
    const email    = String(body?.email    || '').trim().toLowerCase()
    const code     = String(body?.code     || '').trim()
    const pin      = String(body?.pin      || '').trim()
    const password = String(body?.password || '')

    if (!email || !code || !pin || !password) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }

    // Valida força da senha
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message || 'Senha muito fraca.' },
        { status: 400 }
      )
    }

    const user = await getUserByEmail(email)
    if (!user || !user.verified) {
      return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 })
    }

    // Validate code
    const codeValid = await consumeVerifyCode(email, code)
    if (!codeValid) {
      return NextResponse.json({ error: 'Código inválido ou expirado.' }, { status: 400 })
    }

    // Validate PIN
    const pinValid = verifyUserPin(user.email, pin)
    if (!pinValid) {
      return NextResponse.json({ error: 'PIN incorreto.' }, { status: 400 })
    }

    const hashed = await hashPassword(password)
    updateUserPassword(user.email, hashed)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[recovery/reset]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
