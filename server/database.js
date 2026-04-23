import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'on-track.db'))

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    label TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS plan_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    exercise_name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES plans(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    plan_id INTEGER,
    started_at TEXT,
    finished_at TEXT,
    feeling TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    exercise_name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    is_rehab INTEGER DEFAULT 0,
    weight REAL,
    weight_label TEXT,
    reps TEXT NOT NULL,
    duration_seconds INTEGER,
    rest_seconds INTEGER,
    notes TEXT,
    logged_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );
`)

export default db
