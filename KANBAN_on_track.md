# on-track — Project Kanban
<!-- Format: | Status | Task | Milestone | Priority | -->
<!-- Status: Backlog / To Do / In Progress / Done     -->
<!-- Milestone: M0–M8                                  -->
<!-- Priority: 🔴 high  🟡 medium  🟢 low             -->

## Epic 0 — Scaffolding

| Status | Task | Milestone | Priority |
|--------|------|-----------|----------|
| Backlog | Reorganize src/ into pages/, components/, hooks/, api/ folders | M0 | 🟡 |
| Backlog | Add protected route wrapper (redirect to /login if no token) | M0 | 🔴 |
| Backlog | Add auth pages to React Router (login, register, verify-email, forgot-password) | M0 | 🔴 |
| Backlog | Add onboarding page to router with redirect after first login | M0 | 🟡 |
| Backlog | Create API client module with base URL and JWT header injection | M0 | 🔴 |

## Epic 1 — Infrastructure

| Status | Task | Milestone | Priority |
|--------|------|-----------|----------|
| Backlog | Install pg, remove better-sqlite3 | M1 | 🔴 |
| Backlog | Create database.js with pg Pool and DATABASE_URL from .env | M1 | 🔴 |
| Backlog | Write schema.sql for PostgreSQL (migrate all existing tables) | M1 | 🔴 |
| Backlog | Update all route handlers in index.js to async/await with pg | M1 | 🔴 |
| Backlog | Add postgres service to docker-compose.yml with named volume | M1 | 🟡 |

## Epic 2 — Auth

| Status | Task | Milestone | Priority |
|--------|------|-----------|----------|
| Backlog | Create users and refresh_tokens tables in schema.sql | M2 | 🔴 |
| Backlog | POST /api/auth/register — hash password with bcrypt, create user | M2 | 🔴 |
| Backlog | Configure nodemailer with HostGator SMTP credentials | M2 | 🔴 |
| Backlog | Email verification token — send on register, verify on click | M2 | 🔴 |
| Backlog | POST /api/auth/login — validate credentials, return JWT + refresh token | M2 | 🔴 |
| Backlog | POST /api/auth/refresh — issue new access token from refresh token | M2 | 🔴 |
| Backlog | POST /api/auth/logout — invalidate refresh token in database | M2 | 🟡 |
| Backlog | Auth middleware to verify JWT and protect all non-auth API routes | M2 | 🔴 |
| Backlog | POST /api/auth/forgot-password and POST /api/auth/reset-password | M2 | 🟡 |
| Backlog | Google OAuth integration (passport-google-oauth20) | M2 | 🟡 |
| Backlog | Login page UI | M2 | 🔴 |
| Backlog | Register page UI | M2 | 🔴 |
| Backlog | Email verification page UI | M2 | 🟡 |
| Backlog | Forgot password and reset password pages UI | M2 | 🟡 |

## Epic 3 — Onboarding

| Status | Task | Milestone | Priority |
|--------|------|-----------|----------|
| Backlog | Create user_profiles table (height, age, gender, experience, frequency, training_type) | M3 | 🔴 |
| Backlog | Create body_metrics table (user_id, type, value, measured_at) for history tracking | M3 | 🔴 |
| Backlog | Multi-step onboarding UI — step 1: body data (height, weight, age, gender) | M3 | 🔴 |
| Backlog | Multi-step onboarding UI — step 2: fitness profile (experience, frequency, duration, type) | M3 | 🔴 |
| Backlog | Multi-step onboarding UI — step 3: initial body measurements | M3 | 🟡 |
| Backlog | POST /api/profile and GET /api/profile endpoints | M3 | 🔴 |
| Backlog | POST /api/metrics — log weight and measurements over time | M3 | 🔴 |
| Backlog | Profile view and edit page | M3 | 🟡 |

## Epic 4 — Exercise Library

| Status | Task | Milestone | Priority |
|--------|------|-----------|----------|
| Backlog | Create exercises table (name, description, common_mistakes, optimal_sets, optimal_reps, rest_seconds, is_compound) | M4 | 🔴 |
| Backlog | Create exercise_muscles join table (exercise_id, muscle, factor: 1 = primary, 0.5 = secondary) | M4 | 🔴 |
| Backlog | Seed 30+ default exercises with science-based rest times and rep ranges | M4 | 🔴 |
| Backlog | GET /api/exercises with optional muscle_group filter | M4 | 🔴 |
| Backlog | POST /api/exercises — add custom exercise (user-owned) | M4 | 🟡 |
| Backlog | Exercise library page UI with filter by muscle group | M4 | 🟡 |
| Backlog | Add custom exercise form UI | M4 | 🟡 |

## Epic 5 — Plan Builder

| Status | Task | Milestone | Priority |
|--------|------|-----------|----------|
| Backlog | Migrate plans and plan_exercises tables — add user_id, link to exercises table | M5 | 🔴 |
| Backlog | Backend volume validator — check if plan covers all major muscle groups | M5 | 🔴 |
| Backlog | POST /api/plans/generate — AI plan generation with DeepSeek/Llama | M5 | 🟡 |
| Backlog | POST /api/plans/:id/feedback — AI feedback on existing plan balance | M5 | 🟢 |
| Backlog | Manual plan builder UI — select exercises from library, set reps/sets | M5 | 🔴 |
| Backlog | Plan list page UI | M5 | 🔴 |
| Backlog | Plan detail page with exercise list and edit capability | M5 | 🟡 |

## Epic 6 — Workout Session

| Status | Task | Milestone | Priority |
|--------|------|-----------|----------|
| Backlog | POST /api/sessions — start session linked to plan | M6 | 🔴 |
| Backlog | GET /api/exercises/:name/last-performance — previous sets for this user | M6 | 🔴 |
| Backlog | Session screen UI — exercise list with set input (weight + reps) | M6 | 🔴 |
| Backlog | Rest timer component — auto-start after set, configurable duration, pause/resume | M6 | 🔴 |
| Backlog | Progressive overload indicator — show previous performance per exercise | M6 | 🔴 |
| Backlog | Session finish screen with summary (total volume, sets per muscle group) | M6 | 🟡 |

## Epic 7 — Tracking

| Status | Task | Milestone | Priority |
|--------|------|-----------|----------|
| Backlog | GET /api/metrics — fetch weight and measurement history with date range | M7 | 🔴 |
| Backlog | Weight history chart UI (line chart over time) | M7 | 🔴 |
| Backlog | Body measurements history chart UI (per measurement type) | M7 | 🟡 |
| Backlog | Exercise performance chart (weight lifted over time, reps over time) | M7 | 🔴 |
| Backlog | Weekly training volume chart by muscle group | M7 | 🟡 |
| Backlog | Progress page — combine all charts with date range selector | M7 | 🔴 |

## Epic 8 — AI Insights

| Status | Task | Milestone | Priority |
|--------|------|-----------|----------|
| Backlog | Build user context prompt from profile + metrics + recent sessions | M8 | 🔴 |
| Backlog | POST /api/ai/insights — call Llama/DeepSeek with user context prompt | M8 | 🔴 |
| Backlog | AI insights page UI — display recommendations | M8 | 🔴 |
| Backlog | Custom question input on AI insights page | M8 | 🟢 |
