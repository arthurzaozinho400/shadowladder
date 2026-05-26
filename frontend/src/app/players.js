'use client'
import { useState, useMemo } from 'react'
import { useApp } from './layout'
import { Heart, ArrowRightLeft, X, Trophy, MapPin } from 'lucide-react'
import { getMcHeadUrl, getMcBodyUrl, getInitials, sanitizeBannerUrl } from '../lib/data'

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
  const perPage = 24

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
            <div key={p.user_id} className="player-card" style={{ paddingTop: 12 }}>
              {p.banner_url && (
                <div className="player-card-banner" style={{ backgroundImage: `url(${sanitizeBannerUrl(p.banner_url)})` }} />
              )}
              <img className="player-mc-head" src={getMcHeadUrl(p.nick_minecraft, 48)} alt={p.nick_minecraft} />
              <div className="player-skin-wrap">
                <img className="player-skin" src={getMcBodyUrl(p.nick_minecraft)} alt="" />
              </div>
              <div className="player-name">{p.nick_minecraft}</div>
              <div style={{ marginBottom: 4 }}>
                <span className={`tier-badge ${TIER_CLASSES[p.best_tier] || 'tier-lt5'}`}>{p.best_tier}</span>
              </div>
              <span className="player-pts-val">{p.points} pts</span>
              <div className="player-actions">
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
    </>
  )
}

function ChevronLeft({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
}

function ChevronRight({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
}
