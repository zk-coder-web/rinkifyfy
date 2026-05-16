/**
 * Pending PIN store — persisted in SQLite so hot-reloads don't lose state.
 * TTL: 30 minutes (same as verify code window).
 */
import { getDb } from './db'

const TTL_MS = 30 * 60 * 1000 // 30 min

export function savePendingPin(email: string, pin: string): void {
  const db        = getDb()
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString()
  db.prepare(
    `INSERT INTO pending_pins (email, pin, expires_at)
     VALUES (?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET pin = excluded.pin, expires_at = excluded.expires_at`
  ).run(email.toLowerCase(), pin, expiresAt)
}

export function getPendingPin(email: string): string | null {
  const db  = getDb()
  const row = db
    .prepare(
      `SELECT pin, expires_at FROM pending_pins WHERE email = ?`
    )
    .get(email.toLowerCase()) as { pin: string; expires_at: string } | undefined

  if (!row) return null
  if (new Date(row.expires_at) < new Date()) {
    db.prepare(`DELETE FROM pending_pins WHERE email = ?`).run(email.toLowerCase())
    return null
  }
  return row.pin
}

export function clearPendingPin(email: string): void {
  getDb().prepare(`DELETE FROM pending_pins WHERE email = ?`).run(email.toLowerCase())
}

/** Housekeeping — call occasionally to remove expired rows */
export function purgeExpiredPins(): void {
  getDb().prepare(`DELETE FROM pending_pins WHERE expires_at < datetime('now')`).run()
}
