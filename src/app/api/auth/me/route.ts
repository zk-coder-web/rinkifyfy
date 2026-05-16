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
    if (!token) return NextResponse.json({ user: null })

    // Tentar decodificar como base64 (Google OAuth)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const googleUser = JSON.parse(decoded)
      
      if (googleUser.id && googleUser.email && googleUser.name) {
        // É um usuário do Google
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
    } catch {
      // Não é base64 válido, continuar com banco de dados
    }

    // Tentar buscar do banco de dados (sessão normal)
    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ user: null })

    // Return user with name field
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        displayName: user.name || user.display_name || '',
        picture: user.picture,
        provider: user.provider,
        verified: user.verified === 1,
      }
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
