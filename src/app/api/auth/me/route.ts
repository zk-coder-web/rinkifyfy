/**
 * GET /api/auth/me
 * Returns current session user. Never throws — always returns { user: null } on failure.
 * Supports both simple JSON auth and database auth.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/json-db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Tentar primeiro com auth_token (autenticação simples JSON)
    const simpleToken = req.cookies.get('auth_token')?.value
    if (simpleToken) {
      console.log('[/api/auth/me] Found auth_token (simple auth)')
      // Token simples - buscar email do localStorage ou sessão
      // Por enquanto, retornar um placeholder que será preenchido pelo cliente
      return NextResponse.json({
        user: {
          id: 'simple_user',
          email: 'user@example.com',
          name: 'Usuário',
          displayName: 'Usuário',
          provider: 'local',
          verified: true,
        }
      })
    }

    // Tentar com rankify_session (autenticação complexa)
    const token = req.cookies.get('rankify_session')?.value
    console.log('[/api/auth/me] Token:', token ? 'present' : 'missing')
    
    if (!token) return NextResponse.json({ user: null })

    // Tentar decodificar como base64 (Google OAuth)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const googleUser = JSON.parse(decoded)
      
      console.log('[/api/auth/me] Decoded Google user:', googleUser)
      
      if (googleUser.id && googleUser.email && googleUser.name) {
        // É um usuário do Google
        console.log('[/api/auth/me] Returning Google user')
        return NextResponse.json({
          user: {
            id: googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            displayName: googleUser.name,
            picture: googleUser.picture,
            provider: 'google',
            verified: true,
          }
        })
      }
    } catch (e) {
      // Não é base64 válido, continuar
      console.log('[/api/auth/me] Not base64 or invalid JSON')
    }

    // Se chegou aqui, não há sessão válida
    return NextResponse.json({ user: null })
  } catch (e) {
    console.error('[/api/auth/me] Error:', e)
    return NextResponse.json({ user: null })
  }
}
