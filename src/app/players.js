'use client'
import { useState, useEffect, useMemo } from 'react'
import { useApp } from './layout'
import { Heart, ArrowRightLeft, X, Shield, Trophy, MapPin, Clock, Gamepad2 } from 'lucide-react'
import { getMcHeadUrl, getMcBodyUrl } from '../lib/data'

const TIERS = ['LT5', 'LT4', 'LT3', 'LT2', 'LT1', 'HT5', 'HT4', 'HT3', 'HT2', 'HT1']
const TIER_CLASSES = {
  HT1: 'tier-ht1', HT2: 'tier-ht2', HT3: 'tier-ht3', HT4: 'tier-ht4', HT5: 'tier-ht5',
  LT1: 'tier-lt1', LT2: 'tier-lt2', LT3: 'tier-lt3', LT4: 'tier-lt4', LT5: 'tier-lt5',
}

export default function PlayersPage() {
  const { data } = useApp()
  const [search, setSearch] = useState('')
  const [filterRegion, setRegion] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [sort, setSort] = useState('pts')
  const [favorites, setFavorites] = useState([])
  const [compare, setCompare] = useState([])
  const [page, setPage] = useState(1)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const perPage = 25

  const list = useMemo(() => {
    let arr = [...(data.users || [])]
    if (search.trim()) {
      const q = search.toLowerCase()
      arr = arr.filter(p =>
        [p.nick_minecraft, p.region, String(p.points)].some(f => String(f).toLowerCase().includes(q))
      )
    }
    if (filterRegion) arr = arr.filter(p => p.region === filterRegion)
    if (filterTier) arr = arr.filter(p => p.best_tier === filterTier)
    arr.sort((a, b) => {
      if (sort === 'name') return a.nick_minecraft?.localeCompare(b.nick_minecraft)
      if (sort === 'tier') return TIERS.indexOf(b.best_tier) - TIERS.indexOf(a.best_tier)
      return (b.points || 0) - (a.points || 0)
    })
    return arr
  }, [data.users, search, filterRegion, filterTier, sort])

  const totalPages = Math.max(1, Math.ceil(list.length / perPage))
  const paged = list.slice((page - 1) * perPage, page * perPage)

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleCompare = (id) => {
    setCompare(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  useEffect(() => {
    if (!selectedPlayer) return
    const handler = (e) => { if (e.key === 'Escape') setSelectedPlayer(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedPlayer])

  const compareData = compare.map(id => data.users.find(u => u.user_id === id)).filter(Boolean)

  return (
    <>
      <div className="players-toolbar">
        <div>
          <div className="players-title">Jogadores</div>
          <div className="players-sub">{list.length} resultados · {data.users?.length || 0} totais</div>
        </div>
        <div className="players-toolbar-actions">
          <div className="search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Buscar..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="select-field" value={filterRegion} onChange={e => { setRegion(e.target.value); setPage(1) }}>
            <option value="">Todas regiões</option>
            <option value="NA">NA</option>
            <option value="SA">SA</option>
            <option value="EU">EU</option>
          </select>
          <select className="select-field" value={filterTier} onChange={e => { setFilterTier(e.target.value); setPage(1) }}>
            <option value="">Todos tiers</option>
            {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="select-field" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="pts">Maior pts</option>
            <option value="name">Nome</option>
            <option value="tier">Melhor tier</option>
          </select>
        </div>
      </div>

      {favorites.length > 0 && (
        <div className="players-chips">
          <div className="chip-group">
            <Heart size={14} style={{ color: 'var(--red)' }} /> Favoritos:
            {favorites.map(id => {
              const p = data.users?.find(u => u.user_id === id)
              return p ? (
                <span key={id} className="chip">
                  {p.nick_minecraft}
                  <button className="player-action-btn" style={{ width: 16, height: 16, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => toggleFav(id)}><X size={12} /></button>
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      {compare.length > 0 && (
        <div className="players-chips">
          <div className="chip-group">
            <ArrowRightLeft size={14} style={{ color: 'var(--purple)' }} /> Comparação:
            {compare.map(id => {
              const p = data.users?.find(u => u.user_id === id)
              return p ? (
                <span key={id} className="chip">
                  {p.nick_minecraft}
                  <button style={{ width: 16, height: 16, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => toggleCompare(id)}><X size={12} /></button>
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      <div className="players-grid">
        {paged.map(p => {
          const isFav = favorites.includes(p.user_id)
          const isComp = compare.includes(p.user_id)
          return (
            <div key={p.user_id} className="player-card" style={{ paddingTop: 12 }}
              onClick={() => setSelectedPlayer(p)}
              role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setSelectedPlayer(p) }}>
              {p.banner_url && (
                <div className="player-card-banner" style={{ backgroundImage: `url(${p.banner_url})` }} />
              )}
              <div className="player-card-head-wrap">
                <img className="player-mc-head" src={getMcHeadUrl(p.nick_minecraft, 48)} alt={p.nick_minecraft} />
                <div className="player-discord-badge" title="Sincronizado com Discord">
                  <DiscordIcon size={12} />
                </div>
              </div>
              <div className="player-skin-wrap">
                <img className="player-skin" src={getMcBodyUrl(p.nick_minecraft)} alt="" />
              </div>
              <div className="player-name">{p.nick_minecraft}</div>
              <div className="player-discord-tag">@{p.user_id}</div>
              <div className="player-mode-tiers">
                {Object.entries(p.tiers || {}).sort((a, b) => TIERS.indexOf(b[1]) - TIERS.indexOf(a[1])).slice(0, 2).map(([mode, tier]) => (
                  <span key={mode} className={`mode-tier-mini ${TIER_CLASSES[tier] || 'tier-lt5'}`}>{mode}</span>
                ))}
              </div>
              <div style={{ marginBottom: 4 }}>
                <span className={`tier-badge ${TIER_CLASSES[p.best_tier] || 'tier-lt5'}`}>{p.best_tier}</span>
              </div>
              <span className="player-pts-val">{p.points} pts</span>
              <div className="player-actions" onClick={(e) => e.stopPropagation()}>
                <button className={`player-action-btn ${isFav ? 'fav-active' : ''}`}
                  onClick={() => toggleFav(p.user_id)} title="Favoritar">
                  <Heart size={14} />
                </button>
                <button className={`player-action-btn ${isComp ? 'active' : ''}`}
                  onClick={() => toggleCompare(p.user_id)}
                  title={isComp ? 'Remover da comparação' : 'Comparar'}
                  disabled={!isComp && compare.length >= 3}>
                  <ArrowRightLeft size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {!paged.length && <div className="loading">Nenhum jogador encontrado</div>}

      {compareData.length >= 2 && (
        <div className="comparison-card card">
          <div className="card-header">
            <div className="card-title"><ArrowsLeftRight size={16} style={{ color: 'var(--purple)' }} /> Comparação</div>
          </div>
          <div className="comparison-grid">
            {compareData.map(p => (
              <div className="compare-column" key={p.user_id}>
                <div className="compare-name">
                  <img src={getMcHeadUrl(p.nick_minecraft, 24)} alt="" style={{ width: 24, height: 24, borderRadius: '50%', verticalAlign: 'middle', marginRight: 6 }} />
                  {p.nick_minecraft}
                </div>
                <div className="compare-row"><strong>Pontos</strong><span className="pts">{p.points}</span></div>
                <div className="compare-row"><strong>Tier</strong><span className={`tier-badge ${TIER_CLASSES[p.best_tier] || 'tier-lt5'}`}>{p.best_tier}</span></div>
                <div className="compare-row"><strong>Modo</strong><span>{p.best_mode}</span></div>
                <div className="compare-row"><strong>Região</strong><span className={`region region-${p.region?.toLowerCase()}`}>{p.region}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4))
            const pg = start + i
            if (pg > totalPages) return null
            return (
              <button key={pg} className={`page-btn ${pg === page ? 'active' : ''}`} onClick={() => setPage(pg)}>
                {pg}
              </button>
            )
          })}
          <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {selectedPlayer && (
        <div className="modal-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPlayer(null)}><X size={18} /></button>

            <div className="modal-header">
              <img className="modal-head" src={getMcHeadUrl(selectedPlayer.nick_minecraft, 80)} alt="" />
              <div>
                <div className="modal-name">{selectedPlayer.nick_minecraft}</div>
                <div className="modal-discord">
                  <DiscordIcon size={14} /> @{selectedPlayer.user_id}
                </div>
              </div>
            </div>

            <div className="modal-section">
              <div className="modal-section-title"><Trophy size={14} /> Pontos</div>
              <div className="modal-points">{selectedPlayer.points} pts</div>
            </div>

            <div className="modal-section">
              <div className="modal-section-title"><Shield size={14} /> Tiers por Modo</div>
              <div className="modal-tier-grid">
                {Object.entries(selectedPlayer.tiers || {})
                  .sort((a, b) => TIERS.indexOf(b[1]) - TIERS.indexOf(a[1]))
                  .map(([mode, tier]) => (
                    <div key={mode} className="modal-tier-item">
                      <span className="modal-mode-name">{mode}</span>
                      <span className={`tier-badge ${TIER_CLASSES[tier] || 'tier-lt5'}`}>{tier}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="modal-section">
              <div className="modal-section-title"><MapPin size={14} /> Região</div>
              <div><span className={`region region-${selectedPlayer.region?.toLowerCase()}`}>{selectedPlayer.region}</span></div>
            </div>

            <div className="modal-section">
              <div className="modal-section-title"><Clock size={14} /> Registrado em</div>
              <div className="modal-reg-date">{new Date(selectedPlayer.registered_at).toLocaleDateString('pt-BR')}</div>
            </div>

            <div className="modal-skin">
              <img src={getMcBodyUrl(selectedPlayer.nick_minecraft)} alt="" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DiscordIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
}

function ChevronLeft({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
}

function ChevronRight({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
}
