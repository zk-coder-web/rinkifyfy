/**
 * POST /api/auth/logout
 * Revoga a sessão atual do usuário
 */
import { NextRequest, NextResponse } from 'next/server'
import { revokeSession, revokeOtherSessions } from '@/lib/auth'
import { log } from '@/lib/stability'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('rankify_session')?.value
  const refreshToken = req.cookies.get('rankify_refresh')?.value

  // Revoga sessão principal
  if (token) {
    try {
      revokeSession(token)
      log('info', 'logout', 'Session revoked')
    } catch (err) {
      log('warn', 'logout', 'Could not revoke session from DB', err)
    }
  }

  // Revoga sessão de refresh se existir
  if (refreshToken) {
    try {
      revokeSession(refreshToken) // O refresh token está na mesma tabela
    } catch {
      // Silencioso
    }
  }

  const response = NextResponse.json({ ok: true })
  
  // Limpa cookie de sessão
  response.cookies.set('rankify_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  
  // Limpa cookie de refresh
  response.cookies.set('rankify_refresh', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  
  return response
}
