/**
 * Pending PIN store — Funciona com SQLite (local) e PostgreSQL (Vercel)
 * TTL: 30 minutes (same as verify code window).
 */

const IS_VERCEL = !!(
  process.env.VERCEL === '1' ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_URL ||
  process.env.VERCEL_REGION
)

const TTL_MS = 30 * 60 * 1000 // 30 min

// Lazy load dos drivers
let sqliteDb: any = null
let vercelSql: any = null

function getSqliteDb() {
  if (IS_VERCEL) {
    throw new Error('Tentando usar SQLite em Vercel!')
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

export async function savePendingPin(email: string, pin: string): Promise<void> {
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString()
  
  if (IS_VERCEL) {
    const sql = await getVercelSql()
    await sql`
      INSERT INTO pending_pins (email, pin, expires_at)
      VALUES (${email.toLowerCase()}, ${pin}, ${expiresAt})
      ON CONFLICT(email) DO UPDATE SET pin = EXCLUDED.pin, expires_at = EXCLUDED.expires_at
    `
  } else {
    const db = getSqliteDb()
    db.prepare(
      `INSERT INTO pending_pins (email, pin, expires_at)
       VALUES (?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET pin = excluded.pin, expires_at = excluded.expires_at`
    ).run(email.toLowerCase(), pin, expiresAt)
  }
}

export async function getPendingPin(email: string): Promise<string | null> {
  if (IS_VERCEL) {
    const sql = await getVercelSql()
    const result = await sql`
      SELECT pin, expires_at FROM pending_pins WHERE LOWER(email) = LOWER(${email}) LIMIT 1
    `
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0] as { pin: string; expires_at: string }
    if (new Date(row.expires_at) < new Date()) {
      await sql`DELETE FROM pending_pins WHERE LOWER(email) = LOWER(${email})`
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
  if (IS_VERCEL) {
    const sql = await getVercelSql()
    await sql`DELETE FROM pending_pins WHERE LOWER(email) = LOWER(${email})`
  } else {
    const db = getSqliteDb()
    db.prepare(`DELETE FROM pending_pins WHERE email = ?`).run(email.toLowerCase())
  }
}

/** Housekeeping — call occasionally to remove expired rows */
export function purgeExpiredPins(): void {
  if (IS_VERCEL) {
    // No Vercel, fazer de forma assíncrona
    (async () => {
      try {
        const sql = await getVercelSql()
        await sql`DELETE FROM pending_pins WHERE expires_at < NOW()`
      } catch (error) {
        console.error('Erro ao purgar PINs expirados:', error)
      }
    })()
  } else {
    const db = getSqliteDb()
    db.prepare(`DELETE FROM pending_pins WHERE expires_at < datetime('now')`).run()
  }
}
