/**
 * GET /api/auth/me
 * Returns current session user. Never throws — always returns { user: null } on failure.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('rankify_session')?.value
    console.log('[/api/auth/me] Token:', token ? 'present' : 'missing')
    
    if (!token) {
      console.log('[/api/auth/me] No token found')
      return NextResponse.json({ user: null })
    }

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
      // Não é base64 válido, tentar buscar do banco de dados
      console.log('[/api/auth/me] Not base64, checking database session')
    }

    // Buscar sessão do banco de dados
    try {
      const user = await getSessionUser(token)
      
      if (user) {
        console.log('[/api/auth/me] User found in database:', { id: user.id, email: user.email })
        return NextResponse.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name || user.display_name || '',
            displayName: user.display_name || user.name || '',
            picture: user.picture,
            provider: user.provider,
            verified: user.verified === 1,
            createdAt: user.created_at,
            createdTime: user.created_at,
          }
        })
      }
    } catch (dbError) {
      console.error('[/api/auth/me] Database error:', dbError)
    }

    // Se chegou aqui, não há sessão válida
    console.log('[/api/auth/me] No valid session found')
    return NextResponse.json({ user: null })
  } catch (e) {
    console.error('[/api/auth/me] Error:', e)
    return NextResponse.json({ user: null })
  }
}
