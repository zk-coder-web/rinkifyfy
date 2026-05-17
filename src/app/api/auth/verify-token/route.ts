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
  
  console.log('[verify-token] Recebido request com token:', token ? `${token.substring(0, 10)}...` : 'vazio')

  if (!token) {
    console.log('[verify-token] Token vazio')
    return NextResponse.json(
      { error: 'Token inválido.', verified: false },
      { status: 400 }
    )
  }

  try {
    console.log('[verify-token] Obtendo banco de dados')
    const db = getDb()
    
    console.log('[verify-token] Procurando token no banco')
    // Find valid, unused token
    const verifyToken = db.prepare(`
      SELECT id, email, expires_at, used
      FROM verify_tokens
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `).get(token) as VerifyTokenRow | undefined

    if (!verifyToken) {
      console.log('[verify-token] Token não encontrado ou expirado')
      return NextResponse.json(
        { error: 'Token expirado ou já utilizado.', verified: false },
        { status: 400 }
      )
    }

    console.log('[verify-token] Token encontrado para email:', verifyToken.email)

    // Mark token as used
    console.log('[verify-token] Marcando token como usado')
    db.prepare('UPDATE verify_tokens SET used = 1 WHERE id = ?').run(verifyToken.id)

    // Check if user exists and update or create
    console.log('[verify-token] Procurando usuário existente')
    const existingUser = db.prepare(`SELECT id, verified, password FROM users WHERE email = ?`).get(verifyToken.email) as { id: number; verified: number; password?: string } | undefined
    
    if (existingUser) {
      // User exists, mark as verified
      console.log('[verify-token] Usuário existe, marcando como verificado')
      db.prepare(`UPDATE users SET verified = 1 WHERE email = ?`).run(verifyToken.email)
      log('info', 'verify-token', `Email verified for existing user: ${verifyToken.email}`)
    } else {
      // Create placeholder user (will set password later)
      console.log('[verify-token] Criando novo usuário placeholder')
      db.prepare(`
        INSERT INTO users (email, display_name, provider, verified, pin)
        VALUES (?, ?, 'local', 1, NULL)
      `).run(verifyToken.email, verifyToken.email.split('@')[0])
      log('info', 'verify-token', `New verified user created: ${verifyToken.email}`)
    }

    console.log('[verify-token] Sucesso! Retornando resposta')
    return NextResponse.json({ 
      ok: true, 
      verified: true,
      email: verifyToken.email 
    })
  } catch (err: any) {
    console.error('[verify-token] Erro:', err.message)
    console.error('[verify-token] Stack:', err.stack)
    log('error', 'verify-token', 'Verification failed', err)
    return NextResponse.json(
      { error: 'Erro ao verificar.', verified: false },
      { status: 500 }
    )
  }
}