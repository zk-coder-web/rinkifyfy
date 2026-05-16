/**
 * POST /api/auth/register
 * Body: { email: string; password: string; verified?: boolean }
 * Creates account after email verification via link.
 * Or sets password for users who verified via link but haven't set password yet.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  hashPassword,
  createLocalUser,
  createPersistentSession,
  displayNameFromEmail,
  getUserByEmail,
  wasCodeVerified,
  validatePassword,
  setUserPreference,
} from '@/lib/auth'
import { getPendingPin, clearPendingPin } from '@/lib/pending-pin'
import { getDb } from '@/lib/db'
import { log } from '@/lib/stability'
import { sendWelcomeUserEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const body      = await req.json()
    const email     = String(body?.email    || '').trim().toLowerCase()
    const password  = String(body?.password || '')
    const verified  = body?.verified === true

    if (!email || !password) {
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

    const db = getDb()
    const existingUser = getUserByEmail(email)

    // Case 1: User came from verification link but needs to set password
    if (verified && existingUser && !existingUser.password) {
      const hashed = await hashPassword(password)
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      
      // Update existing user with password
      db.prepare(`
        UPDATE users SET password = ?, verified = 1 WHERE email = ?
      `).run(hashed, email)

      // Get PIN from pending or generate new one
      let pin = getPendingPin(email)
      if (!pin) {
        pin = String(Math.floor(1000 + Math.random() * 9000))
      }
      db.prepare('UPDATE users SET pin = ? WHERE email = ?').run(pin, email)
      clearPendingPin(email)

      const updatedUser = getUserByEmail(email)
      const deviceInfo = req.headers.get('user-agent') || 'Unknown'
      
      // Cria sessão persistente
      const { token, refreshToken } = createPersistentSession(updatedUser!.id, deviceInfo, ip)
      
      // Salva preferências
      setUserPreference(updatedUser!.id, 'last_login', new Date().toISOString())
      setUserPreference(updatedUser!.id, 'last_ip', ip)
      
      log('info', 'register', `Password set for verified user: ${email} (id=${updatedUser!.id})`)

      const response = NextResponse.json({
        ok: true,
        user: { id: updatedUser!.id, email, displayName: updatedUser!.display_name || '', name: updatedUser!.display_name || '', provider: 'local', verified: true },
      })

      // Cookie de sessão
      response.cookies.set('rankify_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      })

      // Cookie de refresh
      response.cookies.set('rankify_refresh', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })

      return response
    }

    // Case 2: Normal registration flow
    if (!wasCodeVerified(email)) {
      return NextResponse.json(
        { error: 'E-mail não verificado. Verifique sua caixa de entrada e clique no link.' },
        { status: 400 }
      )
    }

    // Allow if user exists but has no password (verified via link but needs to set password)
    if (existingUser && existingUser.password) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })
    }

    // Retrieve PIN from DB-backed store
    let pin = getPendingPin(email)
    if (!pin) {
      // Generate PIN if not exists
      pin = String(Math.floor(1000 + Math.random() * 9000))
    }

    const hashed      = await hashPassword(password)
    const displayName = displayNameFromEmail(email)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const deviceInfo = req.headers.get('user-agent') || 'Unknown'
    
    // Create user as verified
    const user = await createLocalUser(email, hashed, displayName, pin)
    db.prepare('UPDATE users SET verified = 1 WHERE id = ?').run(user.id)

    clearPendingPin(email)

    // Cria sessão persistente
    const { token, refreshToken } = createPersistentSession(user.id, deviceInfo, ip)
    
    // Salva preferências
    setUserPreference(user.id, 'last_login', new Date().toISOString())
    setUserPreference(user.id, 'last_ip', ip)

    // Enviar email de boas-vindas (não bloqueia resposta)
    const userName = displayName || email.split('@')[0]
    sendWelcomeUserEmail(email, userName).catch(err => {
      log('error', 'register', 'Failed to send welcome email', err)
    })

    log('info', 'register', `New verified user created: ${email} (id=${user.id})`)

    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, email, displayName, name: displayName, provider: 'local', verified: true },
    })

    // Cookie de sessão
    response.cookies.set('rankify_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    // Cookie de refresh
    response.cookies.set('rankify_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (err) {
    log('error', 'register', 'Registration failed', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
