'use client'
import { useApp } from './layout'
import { Users, Shield, Sword, Dices, X } from 'lucide-react'
import { getMcHeadUrl, getInitials } from '../lib/data'

export default function QueuesPage() {
  const { data } = useApp()

  const modeIcons = {
    CRYSTAL: <Sword size={16} style={{ color: 'var(--red)' }} />,
    UHC: <Sword size={16} style={{ color: 'var(--gold)' }} />,
    POT: <Sword size={16} style={{ color: 'var(--green)' }} />,
    NETHOP: <Sword size={16} style={{ color: 'var(--purple)' }} />,
    SWORD: <Sword size={16} style={{ color: 'var(--blue)' }} />,
    AXE: <Sword size={16} style={{ color: 'var(--text2)' }} />,
    SMP: <Dices size={16} style={{ color: 'var(--green)' }} />,
    MACE: <Sword size={16} style={{ color: 'var(--gold)' }} />,
  }

  return (
    <>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 18 }}>
        Gerenciar Filas
      </div>
      <div className="queue-grid">
        {data.queues?.length > 0 ? data.queues.map(q => {
          const [region, mode] = q.key.split('_')
          return (
            <div className="card" key={q.key}>
              <div className="queue-header">
                <div className="queue-type">
                  {modeIcons[mode] || <Sword size={16} />}
                  {region} — {mode}
                </div>
                <span className={`queue-count ${q.status === 'open' ? 'qc-open' : 'qc-closed'}`}>
                  {q.status === 'open' ? 'Aberta' : 'Fechada'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>
                {q.player_count || 0} jogadores · {q.testers?.length || 0} testers
              </div>
              {q.players?.length > 0 ? (
                <>
                  <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={13} /> Players
                  </div>
                  {q.players.map((p, i) => (
                    <div key={p.user_id || i} className="queue-player">
                      <span className="queue-pos">{i + 1}</span>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10, background: 'var(--bg4)' }}>
                        {p.nick ? <img src={getMcHeadUrl(p.nick, 26)} alt={p.nick} /> : getInitials(p.nick || p)}
                      </div>
                      <span className="queue-name">{p.nick || p}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="queue-empty">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px', opacity: 0.4 }}>
                    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                    <path d="M9 10l.01 0" /><path d="M15 10l.01 0" />
                    <path d="M9.5 15.5a3.5 3.5 0 0 0 5 0" />
                  </svg>
                  Nenhum jogador na fila
                </div>
              )}
              {q.testers?.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={13} /> Testers
                  </div>
                  {q.testers.map((t, i) => (
                    <div key={t.user_id || i} className="queue-player" style={{ background: 'transparent', padding: '4px 10px' }}>
                      <Shield size={14} style={{ color: 'var(--purple)' }} />
                      <span className="queue-name">{t.name || t}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )
        }) : (
          <div className="loading" style={{ gridColumn: '1 / -1' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
              <path d="M9 10l.01 0" /><path d="M15 10l.01 0" />
              <path d="M9.5 15.5a3.5 3.5 0 0 0 5 0" />
            </svg>
            Nenhuma fila ativa
          </div>
        )}
      </div>
    </>
  )
}
