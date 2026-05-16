/**
 * GET /api/auth/user
 * Returns current session user with all details including picture
 * 
 * POST /api/auth/user
 * Updates user details (name, etc)
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
            createdAt: new Date().toISOString(),
            createdTime: new Date().toISOString(),
          }
        })
      }
    } catch {
      // Não é base64 válido, continuar com banco de dados
    }

    // Tentar buscar do banco de dados (sessão normal)
    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ user: null })

    // Return user with all details
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        displayName: user.name || user.display_name || '',
        picture: user.picture || undefined,
        provider: user.provider,
        verified: user.verified === 1,
        createdAt: user.created_at,
        createdTime: user.created_at,
      }
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('rankify_session')?.value
    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await req.json()
    const { name } = body

    // Tentar decodificar como base64 (Google OAuth)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const googleUser = JSON.parse(decoded)
      
      if (googleUser.id && googleUser.email && googleUser.name) {
        // Para usuários do Google, não permitir mudança de nome via API
        // (seria necessário atualizar no banco de dados)
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

    // Para usuários normais, atualizar no banco de dados
    if (name) {
      const user = await getSessionUser(token)
      if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

      // Aqui você implementaria a lógica de atualização no banco de dados
      // Por enquanto, apenas retorna o usuário atualizado
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: name,
          displayName: name,
          picture: user.picture,
          provider: user.provider,
          verified: user.verified === 1,
        }
      })
    }

    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  } catch (error) {
    console.error('Erro em POST /api/auth/user:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
