/**
 * POST /api/reset-db ou GET /api/reset-db?confirm=true
 * CUIDADO: Apaga TODOS os dados do banco!
 * Use apenas em desenvolvimento/testes
 */
import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db-postgres'

async function resetDatabase() {
  try {
    // Verificar se tem DATABASE_URL (só funciona com PostgreSQL)
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Esta rota só funciona com PostgreSQL (DATABASE_URL configurada)' },
        { status: 400 }
      )
    }

    console.log('[reset-db] Iniciando reset do banco...')

    // Deletar todos os dados (mantém as tabelas)
    await execute(`DELETE FROM sessions`, [])
    await execute(`DELETE FROM verify_codes`, [])
    await execute(`DELETE FROM verify_tokens`, [])
    await execute(`DELETE FROM pending_pins`, [])
    await execute(`DELETE FROM notif_read`, [])
    await execute(`DELETE FROM notificacoes`, [])
    await execute(`DELETE FROM paginas`, [])
    await execute(`DELETE FROM user_preferences`, [])
    await execute(`DELETE FROM users`, [])

    console.log('[reset-db] Banco resetado com sucesso!')

    return NextResponse.json({
      success: true,
      message: 'Banco de dados resetado com sucesso! Todos os dados foram apagados.',
      tables_cleared: [
        'users',
        'sessions',
        'verify_codes',
        'verify_tokens',
        'pending_pins',
        'paginas',
        'notificacoes',
        'notif_read',
        'user_preferences'
      ]
    })
  } catch (error: any) {
    console.error('[reset-db] Erro ao resetar banco:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao resetar banco de dados',
        details: error?.message 
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  return resetDatabase()
}

export async function GET(req: NextRequest) {
  const confirm = req.nextUrl.searchParams.get('confirm')
  
  if (confirm !== 'true') {
    return NextResponse.json({
      error: 'Confirmação necessária',
      message: 'Adicione ?confirm=true na URL para resetar o banco',
      example: 'https://rkfy.netlify.app/api/reset-db?confirm=true'
    }, { status: 400 })
  }
  
  return resetDatabase()
}
