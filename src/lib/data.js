const TIER_POINTS = {
  HT1: 125, LT1: 100, HT2: 90, LT2: 70,
  HT3: 60, LT3: 40, HT4: 30, LT4: 10,
  HT5: 5, LT5: 0,
}

const TIER_ORDER = ['LT5', 'LT4', 'LT3', 'LT2', 'LT1', 'HT5', 'HT4', 'HT3', 'HT2', 'HT1']

export function parseResults(r) {
  try { return typeof r === 'string' ? JSON.parse(r) : (r || {}) } catch { return {} }
}

export function getTierPoints(results) {
  const r = parseResults(results)
  return Object.values(r).reduce((s, t) => s + (TIER_POINTS[t] || 0), 0)
}

export function getBestTier(results) {
  const r = parseResults(results)
  const entries = Object.entries(r)
  if (!entries.length) return 'N/A'
  return entries.sort((a, b) => TIER_ORDER.indexOf(b[1]) - TIER_ORDER.indexOf(a[1]))[0][1]
}

export function getBestMode(results) {
  const r = parseResults(results)
  const entries = Object.entries(r)
  if (!entries.length) return 'N/A'
  return entries.sort((a, b) => TIER_ORDER.indexOf(b[1]) - TIER_ORDER.indexOf(a[1]))[0][0]
}

export function getMcHeadUrl(name, size = 32) {
  return `https://mc-heads.net/avatar/${encodeURIComponent(name)}/${size}`
}

export function getMcBodyUrl(name) {
  return `https://mc-heads.net/body/${encodeURIComponent(name)}`
}

export function getInitials(name) {
  return (name || '?').slice(0, 2).toUpperCase()
}
