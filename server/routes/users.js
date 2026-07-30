import express from 'express';
import pool from "../db/pool.js";
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, name, home_neighborhood, bio, role, created_at
       FROM users WHERE id = $1`,
      [req.userId]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;