import pool from "../db/pool.js";

/**
 * Writes a human-readable event into logs table.
 *
 * @param {Object} params
 * @param {number|null} params.actorUserId
 * @param {string} params.message
 * @param {string|null} [params.entityType]
 * @param {number|null} [params.entityId]
 */
export async function logEvent({
  actorUserId = null,
  message,
  entityType = null,
  entityId = null
}) {
  if (!message || typeof message !== "string") {
    throw new Error("logEvent: message must be a non-empty string");
  }

  const sql = `
    INSERT INTO booking_log (actor_user_id, message, entity_type, entity_id)
    VALUES ($1, $2, $3, $4)
  `;

  try {
    await pool.query(sql, [actorUserId, message, entityType, entityId]);
  } catch (err) {
    console.error("logEvent failed:", err.message);
  }
}