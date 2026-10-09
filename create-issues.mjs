#!/usr/bin/env node
// create-issues.mjs — creates GitHub issues from KANBAN_on_track.md
//
// Dry run:  GITHUB_TOKEN=your_token DRY_RUN=1 node create-issues.mjs
// Real run: GITHUB_TOKEN=your_token node create-issues.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const GITHUB_URL = 'https://api.github.com'
const REPO_OWNER = 'maona-creative'
const REPO_NAME  = 'on-track'
const TOKEN      = process.env.GITHUB_TOKEN
const DRY_RUN    = process.env.DRY_RUN === '1'

if (!TOKEN) { console.error('Set GITHUB_TOKEN env var first'); process.exit(1) }

const EPIC_LABEL = {
  0: 'epic: scaffolding',
  1: 'epic: infrastructure',
  2: 'epic: auth',
  3: 'epic: onboarding',
  4: 'epic: exercise-library',
  5: 'epic: plan-builder',
  6: 'epic: workout-session',
  7: 'epic: tracking',
  8: 'epic: ai-insights',
}

const MILESTONE_TITLES = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8']

const MILESTONE_DESC = {
  M0: 'Frontend scaffolding — routing, folder structure, API client, protected routes',
  M1: 'Foundation — PostgreSQL migration, Docker dev setup',
  M2: 'Auth — register, login, JWT, refresh tokens, email verification, Google OAuth, password reset',
  M3: 'Onboarding & Profile — body profile, fitness profile, measurements setup',
  M4: 'Exercise Library — seed data, custom exercises',
  M5: 'Plan Builder — manual plans, backend volume validation, AI-generated plans',
  M6: 'Workout Session — real-time logging, rest timer, progressive overload',
  M7: 'Body & Performance Tracking — weight/measurement history, performance charts',
  M8: 'AI Insights — progress page with AI analysis (Llama/DeepSeek)',
}

const LABELS_SETUP = [
  { name: 'priority: high',           color: 'd73a4a' },
  { name: 'priority: medium',         color: 'fbca04' },
  { name: 'priority: low',            color: '0e8a16' },
  { name: 'epic: scaffolding',        color: 'f9d0c4' },
  { name: 'epic: infrastructure',     color: 'e4e669' },
  { name: 'epic: auth',               color: 'd4c5f9' },
  { name: 'epic: onboarding',         color: 'c2e0c6' },
  { name: 'epic: exercise-library',   color: 'bfd4f2' },
  { name: 'epic: plan-builder',       color: 'fef2c0' },
  { name: 'epic: workout-session',    color: 'c5def5' },
  { name: 'epic: tracking',           color: 'e6eeff' },
  { name: 'epic: ai-insights',        color: 'cccccc' },
]

const PRIORITY_LABEL = {
  '🔴': 'priority: high',
  '🟡': 'priority: medium',
  '🟢': 'priority: low',
}

// ── API ───────────────────────────────────────────────────────────────────────

const headers = {
  Authorization: 'token ' + TOKEN,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
}

async function apiGet(endpoint) {
  const res = await fetch(GITHUB_URL + endpoint, { headers })
  if (!res.ok) throw new Error('GET ' + endpoint + ' -> ' + res.status + ' ' + await res.text())
  return res.json()
}

async function apiPost(endpoint, body) {
  const res = await fetch(GITHUB_URL + endpoint, {
    method: 'POST', headers, body: JSON.stringify(body),
  })
  return res.json()
}

async function getLabelNames() {
  const items = await apiGet('/repos/' + REPO_OWNER + '/' + REPO_NAME + '/labels?per_page=100')
  return new Set(items.map(l => l.name))
}

async function getMilestoneMap() {
  const items = await apiGet('/repos/' + REPO_OWNER + '/' + REPO_NAME + '/milestones?state=open&per_page=100')
  // GitHub milestones use .number (not .id) when assigning to issues
  return Object.fromEntries(items.map(m => [m.title, m.number]))
}

async function getExistingIssues() {
  const map = new Map()
  let page = 1
  while (true) {
    const items = await apiGet('/repos/' + REPO_OWNER + '/' + REPO_NAME + '/issues?state=open&per_page=100&page=' + page)
    if (!items.length) break
    items.forEach(i => map.set(i.title.trim(), i.number))
    if (items.length < 100) break
    page++
  }
  return map
}

// ── SETUP ─────────────────────────────────────────────────────────────────────

async function setupLabels(existingNames) {
  console.log('-- Setup: labels ----------------------------------------------------')
  let created = 0
  for (const def of LABELS_SETUP) {
    if (existingNames.has(def.name)) continue
    const result = await apiPost('/repos/' + REPO_OWNER + '/' + REPO_NAME + '/labels', {
      name: def.name, color: def.color,
    })
    if (result.id) {
      existingNames.add(def.name)
      console.log('  created label: ' + def.name)
      created++
    } else {
      console.log('  FAIL label ' + def.name + ': ' + JSON.stringify(result))
    }
    await new Promise(r => setTimeout(r, 150))
  }
  console.log('Labels: ' + created + ' created\n')
}

async function setupMilestones(existingMap) {
  console.log('-- Setup: milestones ------------------------------------------------')
  let created = 0
  for (const m of MILESTONE_TITLES) {
    if (existingMap[m] !== undefined) continue
    const result = await apiPost('/repos/' + REPO_OWNER + '/' + REPO_NAME + '/milestones', {
      title: m, description: MILESTONE_DESC[m] || '',
    })
    if (result.number) {
      existingMap[m] = result.number
      console.log('  created milestone: ' + m + ' (#' + result.number + ')')
      created++
    } else {
      console.log('  FAIL milestone ' + m + ': ' + JSON.stringify(result))
    }
    await new Promise(r => setTimeout(r, 150))
  }
  console.log('Milestones: ' + created + ' created\n')
}

// ── PARSE KANBAN ──────────────────────────────────────────────────────────────
// Format: | Status | Task | Milestone | Priority |

function parseKanban(content) {
  const issues = []
  let epicNum = null

  for (const line of content.split('\n')) {
    const epicMatch = line.match(/^## Epic (\d+)/)
    if (epicMatch) { epicNum = parseInt(epicMatch[1]); continue }

    const cols = line.split('|').map(c => c.trim())
    if (cols.length < 5) continue

    const status    = cols[1]
    const taskText  = cols[2]
    const milestone = cols[3].trim()
    const priority  = cols[4]

    if (status === 'Status' || status.startsWith('-')) continue
    if (!status.includes('Backlog') && !status.includes('To Do')) continue
    if (!taskText || taskText === 'Task') continue
    if (!MILESTONE_TITLES.includes(milestone)) continue

    const prioKey = ['🔴', '🟡', '🟢'].find(e => priority.includes(e))
    if (!prioKey) continue
    if (epicNum === null) continue

    const title = '[E' + epicNum + '] ' + taskText.trim()
    issues.push({ title, priority: prioKey, epicNum, milestone })
  }

  return issues
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  const content = fs.readFileSync(path.join(__dirname, 'KANBAN_on_track.md'), 'utf-8')
  const issues  = parseKanban(content)
  console.log('Parsed ' + issues.length + ' issues from KANBAN_on_track.md\n')

  if (DRY_RUN) {
    issues.forEach((issue, i) =>
      console.log('  ' + String(i + 1).padStart(3) + '. [' + issue.milestone + '] ' + issue.title)
    )
    console.log('\nDry run — ' + issues.length + ' issues would be created.')
    return
  }

  console.log('Fetching GitHub data...')
  const existingLabelNames = await getLabelNames()
  const milestoneMap       = await getMilestoneMap()

  await setupLabels(existingLabelNames)
  await setupMilestones(milestoneMap)

  const existingIssues = await getExistingIssues()
  console.log('  ' + existingIssues.size + ' existing issues — duplicates will be skipped\n')

  console.log('-- Creating issues --------------------------------------------------')
  let created = 0, skipped = 0, failed = 0

  for (const issue of issues) {
    if (existingIssues.has(issue.title)) { skipped++; continue }

    const labels = [
      PRIORITY_LABEL[issue.priority],
      EPIC_LABEL[issue.epicNum],
    ].filter(Boolean)

    const milestoneNumber = milestoneMap[issue.milestone] ?? null

    const result = await apiPost('/repos/' + REPO_OWNER + '/' + REPO_NAME + '/issues', {
      title: issue.title,
      labels,
      ...(milestoneNumber !== null && { milestone: milestoneNumber }),
    })

    if (result.number) {
      console.log('  + #' + result.number + ' [' + issue.milestone + '] ' + issue.title)
      existingIssues.set(issue.title, result.number)
      created++
    } else {
      console.log('  FAIL: ' + issue.title + ' — ' + (result.message || JSON.stringify(result)))
      failed++
    }

    await new Promise(r => setTimeout(r, 300))
  }

  console.log('\nDone: ' + created + ' created, ' + skipped + ' skipped, ' + failed + ' failed')
}

main().catch(err => { console.error(err); process.exit(1) })
