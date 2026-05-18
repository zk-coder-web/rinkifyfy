/**
 * POST /api/auth/recovery/send
 * Body: { email: string }
 * Sends recovery email with verification code + PIN reminder.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, generateCode, saveVerifyCode, getUserPin } from '@/lib/auth-adapter'
import { sendRecoveryEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    // Always return ok to avoid user enumeration
    if (!user || !user.verified || user.provider !== 'local') {
      return NextResponse.json({ ok: true })
    }

    const pin = getUserPin(user.email)
    if (!pin) return NextResponse.json({ ok: true })

    const code = generateCode()
    await saveVerifyCode(email, code)

    await sendRecoveryEmail(email, code, pin)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[recovery/send]', err)
    return NextResponse.json({ error: 'Erro ao enviar e-mail.' }, { status: 500 })
  }
}
