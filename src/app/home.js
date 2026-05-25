'use client'
import { useState, useEffect, useCallback } from 'react'
import { useApp } from './layout'
import { Trophy, Users, Gamepad2, Target, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getMcHeadUrl, getMcBodyUrl, getInitials } from '../lib/data'

const TIERS = ['LT5', 'LT4', 'LT3', 'LT2', 'LT1', 'HT5', 'HT4', 'HT3', 'HT2', 'HT1']
const TIER_COLORS = {
  HT1: { bar: '#ef4444', badge: 'tier-ht1' }, HT2: { bar: '#f59e0b', badge: 'tier-ht2' },
  HT3: { bar: '#fbbf24', badge: 'tier-ht3' }, HT4: { bar: '#22c55e', badge: 'tier-ht4' },
  HT5: { bar: '#10b981', badge: 'tier-ht5' }, LT1: { bar: '#a855f7', badge: 'tier-lt1' },
  LT2: { bar: '#7c6ff7', badge: 'tier-lt2' }, LT3: { bar: '#4f46e5', badge: 'tier-lt3' },
  LT4: { bar: '#3b82f6', badge: 'tier-lt4' }, LT5: { bar: '#6b7280', badge: 'tier-lt5' },
}

export default function HomePage() {
  const { data } = useApp()
  const s = data.stats

  const [spotlightIdx, setSpotlightIdx] = useState(0)
  const topRanked = s?.top_ranking?.slice(0, 3) || []

  const nextSlide = useCallback(() => {
    setSpotlightIdx(i => (i + 1) % (topRanked.length || 1))
  }, [topRanked.length])

  const prevSlide = useCallback(() => {
    setSpotlightIdx(i => (i - 1 + (topRanked.length || 1)) % (topRanked.length || 1))
  }, [topRanked.length])

  useEffect(() => {
    if (topRanked.length < 2) return
    const t = setInterval(nextSlide, 5500)
    return () => clearInterval(t)
  }, [topRanked.length, nextSlide])

  const tierData = TIERS.map(t => ({
    name: t, value: s?.tier_distribution?.[t] || 0,
    fill: TIER_COLORS[t]?.bar || '#6b7280',
  }))

  return (
    <>
      <div className="stats-grid">
        {[
          { icon: Trophy, label: 'Total de Pontos', value: s?.total_points?.toLocaleString() || '0', color: '#f59e0b', bg: 'var(--gold2)', badge: 'Ranking' },
          { icon: Users, label: 'Jogadores', value: s?.total_players || '0', color: '#7c6ff7', bg: 'var(--purple3)', badge: `${s?.total_players || 0} inscritos` },
          { icon: Gamepad2, label: 'Partidas', value: s?.total_queues || '0', color: '#22c55e', bg: 'var(--green2)', badge: `${s?.weekly_queues || 0} na semana` },
          { icon: Target, label: 'Média de Pontos', value: s?.avg_points || '0', color: '#3b82f6', bg: 'var(--blue2)', badge: 'Por jogador' },
        ].map(({ icon: Icon, label, value, color, bg, badge }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: bg, color }}><Icon size={18} /></div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <span className="stat-badge" style={{ background: bg, color }}>{badge}</span>
          </div>
        ))}
      </div>

      {topRanked.length > 0 && (
        <div className="top-spotlight">
          <div className="top-spotlight-title">Top {topRanked.length} em destaque</div>
          <div className="top-cards">
            <div className="top-slide-track" style={{ transform: `translateX(-${spotlightIdx * 100}%)` }}>
              {topRanked.map((p, i) => (
                <div key={p.user_id || i} className="top-card">
                  <div className="top-card-banner">
                    {p.banner_url ? 'Banner personalizado' : 'Destaque do ranking'}
                  </div>
                  <div className="top-card-content">
                    <div className="top-card-left">
                      <div className="top-skin">
                        <img src={getMcBodyUrl(p.nick)} alt={p.nick} />
                      </div>
                      <div className="top-card-info">
                        <div className="top-rank">#{i + 1}</div>
                        <div className="top-name">{p.nick}</div>
                        <div><span className={`tier-badge ${TIER_COLORS[p.best_tier]?.badge || 'tier-lt5'}`}>{p.best_tier}</span></div>
                        <div className="top-meta">{p.region} · {p.points} pts</div>
                      </div>
                    </div>
                    <div className="top-card-right">
                      <div className="top-discord-profile">
                        <img src={getMcHeadUrl(p.nick, 64)} alt={p.nick} />
                        <div className="top-discord-name">{p.nick}</div>
                        <div className="discord-tag-sm">
                          <DiscordIcon size={10} /> {p.user_id}
                        </div>
                        <div className="top-discord-label">Sincronizado</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="top-dots">
            {topRanked.map((_, i) => (
              <button key={i} className={`top-dot ${i === spotlightIdx ? 'active' : ''}`} onClick={() => setSpotlightIdx(i)} />
            ))}
          </div>
        </div>
      )}

      <div className="tier-progression">
        <div className="tier-title">Evolução de Rank</div>
        <div className="tier-cards">
          {TIERS.map(tier => (
            <div className="tier-block" key={tier}>
              <div className="tier-name">{tier}</div>
              <div className="tier-count">{s?.tier_distribution?.[tier] || 0}</div>
              <div className="tier-label">players</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title"><Trophy size={16} style={{ color: 'var(--gold)' }} /> Top Ranking</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Jogador</th><th>Região</th><th>Tier</th><th style={{ textAlign: 'right' }}>Pontos</th></tr>
            </thead>
            <tbody>
              {s?.top_ranking?.map((p, i) => {
                const rankClass = ['rank-1', 'rank-2', 'rank-3'][i] || 'rank-n'
                return (
                  <tr key={p.user_id}>
                    <td><span className={`rank ${rankClass}`}>#{i + 1}</span></td>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={getMcHeadUrl(p.nick, 24)} alt="" style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg4)' }} />
                      {p.nick}
                      <DiscordBadge />
                    </td>
                    <td><span className={`region region-${p.region?.toLowerCase()}`}>{p.region}</span></td>
                    <td><span className={`tier-badge ${TIER_COLORS[p.best_tier]?.badge || 'tier-lt5'}`}>{p.best_tier}</span></td>
                    <td style={{ textAlign: 'right' }}><span className="pts">{p.points} pts</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Users size={16} style={{ color: 'var(--purple)' }} /> Jogadores Recentes</div>
          </div>
          {s?.recent_players?.slice(0, 6).map((p, i) => (
            <div className="recent-row" key={i}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, background: 'var(--bg4)' }}>
                {getInitials(p.nick)}
              </div>
              <span className="recent-nick">{p.nick}</span>
              <span className={`region region-${p.region?.toLowerCase()}`}>{p.region}</span>
              <span className="recent-date">{new Date(p.registered_at).toLocaleDateString('pt-BR')}</span>
            </div>
          ))}
          {(!s?.recent_players || s.recent_players.length === 0) && (
            <div style={{ color: 'var(--text3)', fontSize: 13, padding: 12 }}>Nenhum jogador registrado ainda.</div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><Shield size={16} style={{ color: 'var(--gold)' }} /> Testers Ativos</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", color: 'var(--purple)', textAlign: 'center', padding: '20px 0' }}>
            {s?.active_testers || 0}
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>
            Testers disponíveis
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">Distribuição de Tiers</div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={tierData}>
            <XAxis dataKey="name" tick={{ fill: 'var(--text2)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--text2)', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}

function DiscordIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
}

function DiscordBadge() {
  return <span className="discord-badge"><DiscordIcon size={10} /> Discord</span>
}
