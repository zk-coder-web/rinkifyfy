/**
 * Pending PIN store — Funciona com SQLite (local) e PostgreSQL (Netlify/Vercel)
 * TTL: 30 minutes (same as verify code window).
 */

// Detectar se deve usar PostgreSQL (Netlify ou Vercel)
const USE_POSTGRES = !!process.env.DATABASE_URL

const TTL_MS = 30 * 60 * 1000 // 30 min

// Lazy load dos drivers
let sqliteDb: any = null
let postgresClient: any = null

function getSqliteDb() {
  if (USE_POSTGRES) {
    throw new Error('Tentando usar SQLite com DATABASE_URL configurada!')
  }
  if (!sqliteDb) {
    const { getDb } = require('./db')
    sqliteDb = getDb()
  }
  return sqliteDb
}

async function getPostgresClient() {
  if (!postgresClient) {
    if (!USE_POSTGRES) {
      throw new Error('Tentando usar PostgreSQL sem DATABASE_URL!')
    }
    const { query, execute } = await import('./db-postgres')
    postgresClient = { query, execute }
  }
  return postgresClient
}

export async function savePendingPin(email: string, pin: string): Promise<void> {
  const expiresAt = new Date(Date.now() + TTL_MS)
  
  if (USE_POSTGRES) {
    const pg = await getPostgresClient()
    await pg.execute(
      `INSERT INTO pending_pins (email, pin, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT(email) DO UPDATE SET pin = EXCLUDED.pin, expires_at = EXCLUDED.expires_at`,
      [email.toLowerCase(), pin, expiresAt]
    )
  } else {
    const db = getSqliteDb()
    db.prepare(
      `INSERT INTO pending_pins (email, pin, expires_at)
       VALUES (?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET pin = excluded.pin, expires_at = excluded.expires_at`
    ).run(email.toLowerCase(), pin, expiresAt.toISOString())
  }
}

export async function getPendingPin(email: string): Promise<string | null> {
  if (USE_POSTGRES) {
    const pg = await getPostgresClient()
    const rows = await pg.query(
      `SELECT pin, expires_at FROM pending_pins WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    )
    
    if (rows.length === 0) return null
    
    const row = rows[0] as { pin: string; expires_at: Date }
    if (new Date(row.expires_at) < new Date()) {
      await pg.execute(`DELETE FROM pending_pins WHERE LOWER(email) = LOWER($1)`, [email])
      return null
    }
    return row.pin
  } else {
    const db = getSqliteDb()
    const row = db
      .prepare(`SELECT pin, expires_at FROM pending_pins WHERE email = ?`)
      .get(email.toLowerCase()) as { pin: string; expires_at: string } | undefined

    if (!row) return null
    if (new Date(row.expires_at) < new Date()) {
      db.prepare(`DELETE FROM pending_pins WHERE email = ?`).run(email.toLowerCase())
      return null
    }
    return row.pin
  }
}

export async function clearPendingPin(email: string): Promise<void> {
  if (USE_POSTGRES) {
    const pg = await getPostgresClient()
    await pg.execute(`DELETE FROM pending_pins WHERE LOWER(email) = LOWER($1)`, [email])
  } else {
    const db = getSqliteDb()
    db.prepare(`DELETE FROM pending_pins WHERE email = ?`).run(email.toLowerCase())
  }
}

/** Housekeeping — call occasionally to remove expired rows */
export function purgeExpiredPins(): void {
  if (USE_POSTGRES) {
    // No PostgreSQL, fazer de forma assíncrona
    (async () => {
      try {
        const pg = await getPostgresClient()
        await pg.execute(`DELETE FROM pending_pins WHERE expires_at < NOW()`, [])
      } catch (error) {
        console.error('Erro ao purgar PINs expirados:', error)
      }
    })()
  } else {
    const db = getSqliteDb()
    db.prepare(`DELETE FROM pending_pins WHERE expires_at < datetime('now')`).run()
  }
}
