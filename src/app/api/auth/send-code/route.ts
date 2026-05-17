/**
 * POST /api/auth/send-code
 * Body: { email: string }
 * Sends verification link + PIN to email. Token is persisted in DB.
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateCode, saveVerifyCode, getUserByEmail, generateUniquePin, generateVerifyToken, saveVerifyToken } from '@/lib/auth'
import { savePendingPin, purgeExpiredPins } from '@/lib/pending-pin'
import { sendWelcomeEmail } from '@/lib/mailer'
import { log } from '@/lib/stability'

export async function POST(req: NextRequest) {
  // Housekeeping — non-blocking
  try { purgeExpiredPins() } catch { /* ignore */ }

  try {
    const body  = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }

    const existing = getUserByEmail(email)
    // Check if user exists AND has password (fully registered)
    if (existing?.password) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado. Faça login.' },
        { status: 409 }
      )
    }

    // Generate verification token (for link) - we'll keep code for PIN verification
    const code = generateCode()
    saveVerifyCode(email, code)

    // Generate unique PIN and persist to DB — survives hot-reloads
    const pin = generateUniquePin()
    savePendingPin(email, pin)

    // Generate secure verification token and save to DB
    const verifyToken = generateVerifyToken()
    saveVerifyToken(email, verifyToken)

    // Send welcome email with verification link and PIN
    try {
      await sendWelcomeEmail(email, verifyToken, pin)
      log('info', 'send-code', `Verification link + PIN sent to ${email}`)
    } catch (emailError: any) {
      log('error', 'send-code', `Failed to send email to ${email}`, emailError)
      console.error('[send-code] Email error details:', {
        message: emailError?.message,
        code: emailError?.code,
        response: emailError?.response,
      })
      
      // Retornar erro específico
      return NextResponse.json(
        { error: 'Erro ao enviar e-mail de verificação. Verifique se o e-mail está correto e tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    log('error', 'send-code', 'Failed to send verification', err)
    console.error('[send-code] Error:', err)
    return NextResponse.json(
      { error: 'Erro ao enviar verificação. Tente novamente.' },
      { status: 500 }
    )
  }
}
