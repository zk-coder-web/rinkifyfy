/**
 * Database wrapper — Funciona com SQLite (local) e PostgreSQL (Vercel)
 * Detecta automaticamente qual usar baseado no ambiente
 */

const IS_VERCEL = !!(
  process.env.VERCEL === '1' ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_URL ||
  process.env.VERCEL_REGION
)

console.log('[DB-Vercel] Ambiente detectado:', IS_VERCEL ? 'Vercel (PostgreSQL)' : 'Local (SQLite)')

// Lazy load dos drivers
let sqliteDb: any = null
let vercelSql: any = null

function getSqliteDb() {
  if (IS_VERCEL) {
    throw new Error('Tentando usar SQLite em Vercel! Use PostgreSQL.')
  }
  if (!sqliteDb) {
    const { getDb } = require('./db')
    sqliteDb = getDb()
  }
  return sqliteDb
}

async function getVercelSql() {
  if (!vercelSql) {
    if (!IS_VERCEL) {
      throw new Error('Tentando usar PostgreSQL fora de Vercel!')
    }
    const { sql } = await import('@vercel/postgres')
    vercelSql = sql
  }
  return vercelSql
}

/**
 * Wrapper para queries que funciona com SQLite e PostgreSQL
 */
export class DbWrapper {
  async query(sqlQuery: string, params: any[] = []): Promise<any[]> {
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      // Converter placeholders ? para $1, $2, etc.
      let pgQuery = sqlQuery
      let paramIndex = 1
      pgQuery = pgQuery.replace(/\?/g, () => `$${paramIndex++}`)
      
      const result = await sql.query(pgQuery, params)
      return result.rows
    } else {
      const db = getSqliteDb()
      return db.prepare(sqlQuery).all(...params)
    }
  }

  async get(sqlQuery: string, params: any[] = []): Promise<any | undefined> {
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      // Converter placeholders ? para $1, $2, etc.
      let pgQuery = sqlQuery
      let paramIndex = 1
      pgQuery = pgQuery.replace(/\?/g, () => `$${paramIndex++}`)
      
      // Adicionar LIMIT 1 se não existir
      if (!pgQuery.toLowerCase().includes('limit')) {
        pgQuery += ' LIMIT 1'
      }
      
      const result = await sql.query(pgQuery, params)
      return result.rows[0]
    } else {
      const db = getSqliteDb()
      return db.prepare(sqlQuery).get(...params)
    }
  }

  async run(sqlQuery: string, params: any[] = []): Promise<{ lastInsertRowid?: number; changes?: number }> {
    if (IS_VERCEL) {
      const sql = await getVercelSql()
      // Converter placeholders ? para $1, $2, etc.
      let pgQuery = sqlQuery
      let paramIndex = 1
      pgQuery = pgQuery.replace(/\?/g, () => `$${paramIndex++}`)
      
      // Se for INSERT, adicionar RETURNING id
      if (pgQuery.trim().toLowerCase().startsWith('insert')) {
        if (!pgQuery.toLowerCase().includes('returning')) {
          pgQuery += ' RETURNING id'
        }
        const result = await sql.query(pgQuery, params)
        return { 
          lastInsertRowid: result.rows[0]?.id,
          changes: result.rowCount || 0
        }
      } else {
        const result = await sql.query(pgQuery, params)
        return { changes: result.rowCount || 0 }
      }
    } else {
      const db = getSqliteDb()
      const result = db.prepare(sqlQuery).run(...params)
      return {
        lastInsertRowid: result.lastInsertRowid as number,
        changes: result.changes
      }
    }
  }
}

/**
 * Retorna uma instância do wrapper de banco de dados
 */
export function getDbWrapper(): DbWrapper {
  return new DbWrapper()
}

/**
 * Para compatibilidade com código existente que usa getDb() diretamente
 * AVISO: Isso só funciona localmente! No Vercel, use getDbWrapper()
 */
export function getDb(): any {
  if (IS_VERCEL) {
    throw new Error(
      'getDb() não funciona no Vercel! Use getDbWrapper() para compatibilidade com PostgreSQL.'
    )
  }
  return getSqliteDb()
}
