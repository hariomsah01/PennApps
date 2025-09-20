// server/index.js
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const db = require('./db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Helper: create token
function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

// Helper: verify token (returns user row or null)
function getUserFromToken(req) {
  try {
    const token = req.cookies.token;
    if (!token) return null;
    const payload = jwt.verify(token, JWT_SECRET);
    const row = db.prepare('SELECT id, email FROM users WHERE id = ?').get(payload.id);
    return row || null;
  } catch (err) {
    return null;
  }
}

/* ---------- Auth endpoints (signup / login / me / logout) ---------- */

app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const password_hash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, password_hash);
    const user = { id: result.lastInsertRowid, email };
    const token = createToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
    return res.json({ user });
  } catch (err) {
    console.error('signup err', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    const row = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email);
    if (!row) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const user = { id: row.id, email: row.email };
    const token = createToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
    return res.json({ user });
  } catch (err) {
    console.error('login err', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.json({ user: null });
  return res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

/* ---------- Optimization endpoint ---------- */
/*
  Expects: { prompt: string, optimized_prompt?: string, tokens_before?: number, tokens_after?: number }
  If tokens_before/after/optimized_prompt omitted, server will still store minimal info.
  Calculates tokens_saved and co2_saved_kg and inserts into optimizations table.
  If user is authenticated, user_id is stored.
*/
app.post('/api/optimize', (req, res) => {
  try {
    const { prompt, optimized_prompt, tokens_before, tokens_after } = req.body || {};
    if (!prompt) return res.status(400).json({ message: 'prompt required' });

    // Determine tokens if not provided — simple estimator: 1 token ≈ 4 chars
    const estimateTokens = (text) => {
      if (!text) return 0;
      // remove excessive whitespace
      const trimmed = text.replace(/\s+/g, ' ').trim();
      if (trimmed.length === 0) return 0;
      return Math.max(1, Math.ceil(trimmed.length / 4));
    };

    const tb = typeof tokens_before === 'number' ? tokens_before : estimateTokens(prompt);
    const ta = typeof tokens_after === 'number'
      ? tokens_after
      : (optimized_prompt ? estimateTokens(optimized_prompt) : Math.max(0, tb - Math.max(0, Math.floor(tb * 0.2))));

    const tokens_saved = Math.max(0, tb - ta);

    // token -> kWh conversion (representative): 0.0003 kWh per 1000 tokens => 3e-7 kWh/token
    const kwh_per_token = 0.0003 / 1000; // 0.0000003
    const kwh_saved = tokens_saved * kwh_per_token;

    // grid intensity (kg CO2 per kWh). Use env override or 0.45 kgCO2/kWh default.
    const GRID_KGCO2_PER_KWH = parseFloat(process.env.GRID_KGCO2_PER_KWH) || 0.45;

    const co2_saved_kg = kwh_saved * GRID_KGCO2_PER_KWH;

    const user = getUserFromToken(req);
    const user_id = user ? user.id : null;

    const stmt = db.prepare(`
      INSERT INTO optimizations (user_id, prompt, optimized_prompt, tokens_before, tokens_after, tokens_saved, co2_saved_kg)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(user_id, prompt, optimized_prompt || '', tb, ta, tokens_saved, co2_saved_kg);

    return res.json({
      id: info.lastInsertRowid,
      user_id,
      tokens_before: tb,
      tokens_after: ta,
      tokens_saved,
      kwh_saved,
      co2_saved_kg
    });
  } catch (err) {
    console.error('optimize err', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ---------- Stats endpoint ---------- */
/*
  Returns:
  {
    users: number,
    co2_saved_kg: number,
    prompts_optimized: number,
    energy_saved_kwh: number,
    impact_score: number
  }
*/
app.get('/api/stats', (req, res) => {
  try {
    const usersRow = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
    const promptsRow = db.prepare('SELECT COUNT(*) as cnt FROM optimizations').get();
    const co2Row = db.prepare('SELECT IFNULL(SUM(co2_saved_kg), 0) as total FROM optimizations').get();

    const users = usersRow?.cnt || 0;
    const prompts_optimized = promptsRow?.cnt || 0;
    const co2_saved_kg = Number(co2Row?.total || 0);

    // energy saved (kWh) = co2_saved_kg / GRID_KGCO2_PER_KWH
    const GRID_KGCO2_PER_KWH = parseFloat(process.env.GRID_KGCO2_PER_KWH) || 0.45;
    const energy_saved_kwh = GRID_KGCO2_PER_KWH > 0 ? co2_saved_kg / GRID_KGCO2_PER_KWH : 0;

    // impact score: arbitrary normalized metric: co2_saved_kg * 1000 + prompts*0.1 + users*1
    const impact_score = co2_saved_kg * 1000 + prompts_optimized * 0.1 + users * 1;

    return res.json({
        users,
        co2_saved_kg,
        co2_saved_g: co2_saved_kg * 1000,
        prompts_optimized,
        energy_saved_kwh,
        impact_score
    });

  } catch (err) {
    console.error('stats err', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ---------- optional: basic health ---------- */
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
