'use client'
import { useEffect, useState } from 'react'
import { useApp } from './layout'
import { loadStats, loadUsers, loadQueues, loadMatches } from '../lib/api'
import HomePage from './home'
import PlayersPage from './players'
import QueuesPage from './queues'
import SettingsPage from './settings'

export default function Page() {
  const { page, data, setData } = useApp()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [stats, users, queues, matches] = await Promise.all([
          loadStats(), loadUsers(), loadQueues(), loadMatches(),
        ])
        if (!stats) throw new Error('Falha ao carregar dados do Supabase.')
        setData({ stats, users: users || [], queues: queues || [], matches: matches || [] })
      } catch (e) {
        setError(e.message)
      }
      setLoading(false)
    }
    load()
    const timer = setInterval(async () => {
      const queues = await loadQueues()
      if (queues) setData(prev => ({ ...prev, queues }))
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  if (loading) return <div className="loading"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Carregando...</div>
  if (error) return <div className="loading" style={{ color: 'var(--red)' }}>Erro: {error}</div>

  switch (page) {
    case 'players': return <PlayersPage />
    case 'queues': return <QueuesPage />
    case 'settings': return <SettingsPage />
    default: return <HomePage />
  }
}
