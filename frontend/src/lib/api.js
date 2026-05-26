import { supabase } from './supabase'
import { parseResults, getTierPoints, getBestTier, getBestMode } from './data'

const TABLE_COLUMNS = {
  players: 'nick, user_id, region, results, registered_at, banner_url',
  matches: '*',
  queues: '*',
}

async function query(table, opts = {}) {
  let q = supabase.from(table).select(TABLE_COLUMNS[table] || '*', { count: 'exact' })
  if (opts.order) q = q.order(opts.order, { ascending: opts.asc ?? false })
  if (opts.limit) q = q.limit(opts.limit)
  const { data, error } = await q
  if (error) { console.error(error); return null }
  return data
}

export async function loadStats() {
  const [players, matches] = await Promise.all([
    query('players'),
    query('matches', { order: 'timestamp', asc: false, limit: 1000 }),
  ])
  if (!players) return null

  const totalPoints = players.reduce((s, p) => s + getTierPoints(p.results), 0)
  const ranking = players.map(p => ({
    nick: p.nick, points: getTierPoints(p.results), user_id: p.user_id, discord_name: p.discord_name || p.nick,
    best_tier: getBestTier(p.results), best_mode: getBestMode(p.results),
    region: p.region || 'N/A', banner_url: p.banner_url || '',
  })).sort((a, b) => b.points - a.points)

  const tierDist = {}
  for (const t of ['HT1','HT2','HT3','HT4','HT5','LT1','LT2','LT3','LT4','LT5']) tierDist[t] = 0
  players.forEach(p => { const t = getBestTier(p.results); if (t in tierDist) tierDist[t]++ })

  return {
    total_players: players.length,
    total_queues: matches?.length || 0,
    total_points: totalPoints,
    avg_points: players.length ? Math.round(totalPoints / players.length) : 0,
    top_ranking: ranking.slice(0, 10),
    recent_players: players.sort((a, b) => (b.registered_at || '').localeCompare(a.registered_at || '')).slice(0, 10),
    tier_distribution: tierDist,
  }
}

export async function loadUsers() {
  const data = await query('players')
  if (!data) return null
  return data.map(p => {
    const results = parseResults(p.results)
    return {
      user_id: p.user_id, nick_minecraft: p.nick, discord_name: p.discord_name || p.nick,
      region: p.region, points: getTierPoints(p.results), registered_at: p.registered_at,
      best_tier: getBestTier(p.results), best_mode: getBestMode(p.results),
      banner_url: p.banner_url || '',
      tiers: results,
    }
  })
}

export async function loadQueues() {
  const data = await query('queues')
  if (!data) return []
  return data.map(q => ({
    key: q.queue_key, status: 'open',
    players: typeof q.players === 'string' ? safeJsonParse(q.players, []) : (q.players || []),
    testers: typeof q.testers === 'string' ? safeJsonParse(q.testers, []) : (q.testers || []),
  }))
}

export async function loadMatches() {
  return await query('matches', { order: 'timestamp', asc: false, limit: 50 }) || []
}

function safeJsonParse(str, fallback) {
  try { return JSON.parse(str) } catch { return fallback }
}
