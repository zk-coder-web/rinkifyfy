/**
 * GET /api/init-db
 * Inicializa o schema do banco de dados PostgreSQL (Neon)
 * Use apenas uma vez após configurar o DATABASE_URL
 */
import { NextResponse } from 'next/server'
import { initializeSchema } from '@/lib/db-postgres'

export async function GET() {
  try {
    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'DATABASE_URL não configurada',
        message: 'Configure a variável de ambiente DATABASE_URL com a connection string do Neon'
      }, { status: 500 })
    }

    console.log('[init-db] Inicializando schema do banco de dados...')
    
    await initializeSchema()
    
    console.log('[init-db] Schema inicializado com sucesso!')
    
    return NextResponse.json({
      success: true,
      message: 'Schema do banco de dados inicializado com sucesso!',
      tables: [
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
    console.error('[init-db] Erro ao inicializar schema:', error)
    
    return NextResponse.json({
      error: 'Erro ao inicializar schema',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
