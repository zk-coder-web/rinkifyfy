/**
 * POST /api/auth/logout
 * Revoga a sessão atual do usuário
 * Suporta tanto autenticação simples (JSON) quanto complexa (banco de dados)
 */
import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/stability'

export async function POST(req: NextRequest) {
  // Suportar ambos os tipos de autenticação
  const simpleToken = req.cookies.get('auth_token')?.value
  const complexToken = req.cookies.get('rankify_session')?.value
  const refreshToken = req.cookies.get('rankify_refresh')?.value

  if (simpleToken) {
    log('info', 'logout', 'Simple auth logout')
  }

  if (complexToken) {
    log('info', 'logout', 'Complex auth logout')
  }

  const response = NextResponse.json({ ok: true })
  
  // Limpa cookie de autenticação simples
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  
  // Limpa cookie de sessão complexa
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
