import express from 'express'
import cors from 'cors'
import db from './database.js'

const app = express()
app.use(cors())
app.use(express.json())

// ── Plans ─────────────────────────────────────────────────────────────────────

app.get('/api/plans', (req, res) => {
  const plans = db.prepare('SELECT * FROM plans ORDER BY id').all()
  const exercises = db.prepare('SELECT * FROM plan_exercises ORDER BY order_index').all()
  const result = plans.map(plan => ({
    ...plan,
    exercises: exercises.filter(e => e.plan_id === plan.id)
  }))
  res.json(result)
})

app.post('/api/plans', (req, res) => {
  const { name, label, exercises } = req.body
  const plan = db.prepare('INSERT INTO plans (name, label) VALUES (?, ?)').run(name, label)
  const insertExercise = db.prepare(
    'INSERT INTO plan_exercises (plan_id, exercise_name, muscle_group, order_index) VALUES (?, ?, ?, ?)'
  )
  exercises.forEach((e, i) => insertExercise.run(plan.lastInsertRowid, e.exercise_name, e.muscle_group, i))
  res.json({ id: plan.lastInsertRowid })
})

app.put('/api/plans/:id', (req, res) => {
  const { name, label, exercises } = req.body
  db.prepare('UPDATE plans SET name = ?, label = ? WHERE id = ?').run(name, label, req.params.id)
  db.prepare('DELETE FROM plan_exercises WHERE plan_id = ?').run(req.params.id)
  const insertExercise = db.prepare(
    'INSERT INTO plan_exercises (plan_id, exercise_name, muscle_group, order_index) VALUES (?, ?, ?, ?)'
  )
  exercises.forEach((e, i) => insertExercise.run(req.params.id, e.exercise_name, e.muscle_group, i))
  res.json({ ok: true })
})

app.delete('/api/plans/:id', (req, res) => {
  db.prepare('DELETE FROM plan_exercises WHERE plan_id = ?').run(req.params.id)
  db.prepare('DELETE FROM plans WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// ── Sessions ──────────────────────────────────────────────────────────────────

app.get('/api/sessions', (req, res) => {
  const { from, to } = req.query
  let query = 'SELECT * FROM sessions'
  const params = []
  if (from && to) {
    query += ' WHERE date BETWEEN ? AND ?'
    params.push(from, to)
  }
  query += ' ORDER BY date DESC'
  res.json(db.prepare(query).all(...params))
})

app.post('/api/sessions', (req, res) => {
  const { date, plan_id, started_at } = req.body
  const result = db.prepare(
    'INSERT INTO sessions (date, plan_id, started_at) VALUES (?, ?, ?)'
  ).run(date, plan_id || null, started_at)
  res.json({ id: result.lastInsertRowid })
})

app.put('/api/sessions/:id', (req, res) => {
  const { finished_at, feeling, notes } = req.body
  db.prepare(
    'UPDATE sessions SET finished_at = ?, feeling = ?, notes = ? WHERE id = ?'
  ).run(finished_at, feeling, notes, req.params.id)
  res.json({ ok: true })
})

// ── Sets ──────────────────────────────────────────────────────────────────────

app.get('/api/sessions/:id/sets', (req, res) => {
  res.json(db.prepare('SELECT * FROM sets WHERE session_id = ? ORDER BY logged_at').all(req.params.id))
})

app.post('/api/sessions/:id/sets', (req, res) => {
  const { exercise_name, muscle_group, is_rehab, weight, weight_label, reps, duration_seconds, rest_seconds, notes } = req.body
  const result = db.prepare(`
    INSERT INTO sets (session_id, exercise_name, muscle_group, is_rehab, weight, weight_label, reps, duration_seconds, rest_seconds, notes, logged_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, exercise_name, muscle_group, is_rehab ? 1 : 0, weight, weight_label, reps, duration_seconds, rest_seconds, notes, new Date().toISOString())
  res.json({ id: result.lastInsertRowid })
})

app.delete('/api/sets/:id', (req, res) => {
  db.prepare('DELETE FROM sets WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// ── Progress & volume ─────────────────────────────────────────────────────────

app.get('/api/volume', (req, res) => {
  const { from, to } = req.query
  const rows = db.prepare(`
    SELECT muscle_group, COUNT(*) as sets
    FROM sets
    JOIN sessions ON sets.session_id = sessions.id
    WHERE sets.is_rehab = 0 AND sessions.date BETWEEN ? AND ?
    GROUP BY muscle_group
  `).all(from, to)
  res.json(rows)
})

app.get('/api/progress/:exercise', (req, res) => {
  const rows = db.prepare(`
    SELECT sets.*, sessions.date
    FROM sets
    JOIN sessions ON sets.session_id = sessions.id
    WHERE sets.exercise_name = ?
    ORDER BY sessions.date ASC
  `).all(req.params.exercise)
  res.json(rows)
})

app.get('/api/last-performance/:exercise', (req, res) => {
  const session = db.prepare(`
    SELECT sessions.id, sessions.date
    FROM sets
    JOIN sessions ON sets.session_id = sessions.id
    WHERE sets.exercise_name = ?
    ORDER BY sessions.date DESC, sets.logged_at DESC
    LIMIT 1
  `).get(req.params.exercise)

  if (!session) return res.json([])

  const sets = db.prepare(`
    SELECT * FROM sets
    WHERE session_id = ? AND exercise_name = ?
    ORDER BY logged_at
  `).all(session.id, req.params.exercise)

  res.json({ date: session.date, sets })
})

// ── Export CSV ────────────────────────────────────────────────────────────────

app.get('/api/export/sets', (req, res) => {
  const rows = db.prepare(`
    SELECT sessions.date, sets.*
    FROM sets
    JOIN sessions ON sets.session_id = sessions.id
    ORDER BY sessions.date, sets.logged_at
  `).all()

  const headers = ['date', 'exercise_name', 'muscle_group', 'is_rehab', 'weight', 'weight_label', 'reps', 'duration_seconds', 'rest_seconds', 'notes']
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
  ].join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="on-track-sets.csv"')
  res.send(csv)
})

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`on-track server running on http://localhost:${PORT}`)
})
