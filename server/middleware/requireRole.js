import pool from "../db/pool.js";

export function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT role FROM users WHERE id = $1`,
        [req.userId]
      );
      const role = rows[0]?.role;

      if (!role || !allowedRoles.includes(role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (err) {
      console.error('Role check error:', err);
      res.status(500).json({ error: 'Failed to verify role' });
    }
  };
}