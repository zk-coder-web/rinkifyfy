/**
 * POST /api/auth/verify-code
 * Body: { email: string; code: string }
 * Validates the code. Returns { ok: true } so the client can proceed to set password.
 */
import { NextRequest, NextResponse } from 'next/server'
import { consumeVerifyCode } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const code  = String(body?.code  || '').trim()

    if (!email || !code) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }

    const valid = consumeVerifyCode(email, code)
    if (!valid) {
      return NextResponse.json(
        { error: 'Código inválido ou expirado.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[verify-code]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
