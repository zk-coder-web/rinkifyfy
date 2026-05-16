/**
 * GET /api/auth/verify-token?token=xxx
 * Verifies user email via token and returns JSON (for verify page)
 */
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { log } from '@/lib/stability'

interface VerifyTokenRow {
  id: number
  email: string
  token: string
  expires_at: string
  used: number
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  
  if (!token) {
    return NextResponse.json(
      { error: 'Token inválido.', verified: false },
      { status: 400 }
    )
  }

  try {
    const db = getDb()
    
    // Find valid, unused token
    const verifyToken = db.prepare(`
      SELECT id, email, expires_at, used
      FROM verify_tokens
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `).get(token) as VerifyTokenRow | undefined

    if (!verifyToken) {
      return NextResponse.json(
        { error: 'Token expirado ou já utilizado.', verified: false },
        { status: 400 }
      )
    }

    // Mark token as used
    db.prepare('UPDATE verify_tokens SET used = 1 WHERE id = ?').run(verifyToken.id)

    // Check if user exists and update or create
    const existingUser = db.prepare(`SELECT id, verified, password FROM users WHERE email = ?`).get(verifyToken.email) as { id: number; verified: number; password?: string } | undefined
    
    if (existingUser) {
      // User exists, mark as verified
      db.prepare(`UPDATE users SET verified = 1 WHERE email = ?`).run(verifyToken.email)
      log('info', 'verify-token', `Email verified for existing user: ${verifyToken.email}`)
    } else {
      // Create placeholder user (will set password later)
      db.prepare(`
        INSERT INTO users (email, display_name, provider, verified, pin)
        VALUES (?, ?, 'local', 1, NULL)
      `).run(verifyToken.email, verifyToken.email.split('@')[0])
      log('info', 'verify-token', `New verified user created: ${verifyToken.email}`)
    }

    return NextResponse.json({ 
      ok: true, 
      verified: true,
      email: verifyToken.email 
    })
  } catch (err) {
    log('error', 'verify-token', 'Verification failed', err)
    return NextResponse.json(
      { error: 'Erro ao verificar.', verified: false },
      { status: 500 }
    )
  }
}