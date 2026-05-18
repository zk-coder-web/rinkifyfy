/**
 * GET /api/list-users
 * Lista todos os usuários do banco (apenas para debug)
 */
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-postgres'

export async function GET(req: NextRequest) {
  try {
    // Verificar se tem DATABASE_URL
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Esta rota só funciona com PostgreSQL (DATABASE_URL configurada)' },
        { status: 400 }
      )
    }

    console.log('[list-users] Listando usuários...')

    // Buscar todos os usuários (sem senha)
    const users = await query(
      `SELECT id, email, name, display_name, provider, verified, pin, 
              created_at, last_login, failed_logins, locked_until
       FROM users 
       ORDER BY created_at DESC`,
      []
    )

    // Buscar contagem de sessões ativas
    const sessionCount = await query(
      `SELECT COUNT(*) as count FROM sessions WHERE expires_at > NOW()`,
      []
    )

    // Buscar contagem de códigos pendentes
    const codesCount = await query(
      `SELECT COUNT(*) as count FROM verify_codes WHERE used = false AND expires_at > NOW()`,
      []
    )

    // Buscar contagem de PINs pendentes
    const pinsCount = await query(
      `SELECT COUNT(*) as count FROM pending_pins WHERE expires_at > NOW()`,
      []
    )

    console.log('[list-users] Encontrados:', users.length, 'usuários')

    return NextResponse.json({
      success: true,
      total_users: users.length,
      active_sessions: sessionCount[0]?.count || 0,
      pending_codes: codesCount[0]?.count || 0,
      pending_pins: pinsCount[0]?.count || 0,
      users: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        display_name: u.display_name,
        provider: u.provider,
        verified: u.verified,
        has_pin: !!u.pin,
        created_at: u.created_at,
        last_login: u.last_login,
        failed_logins: u.failed_logins,
        is_locked: u.locked_until ? new Date(u.locked_until) > new Date() : false
      }))
    })
  } catch (error: any) {
    console.error('[list-users] Erro ao listar usuários:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao listar usuários',
        details: error?.message 
      },
      { status: 500 }
    )
  }
}
