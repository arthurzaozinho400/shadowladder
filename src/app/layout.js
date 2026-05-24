'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { Home, Users, List, Settings as SettingsIcon, Sword, Shield } from 'lucide-react'
import './globals.css'

const AppContext = createContext()
export const useApp = () => useContext(AppContext)

export default function RootLayout({ children }) {
  const [page, setPage] = useState('home')
  const [theme, setTheme] = useState('dark')
  const [data, setData] = useState({ stats: null, users: [], queues: [], matches: [] })

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light' : ''
    window.__goPage = setPage
  }, [theme])

  const pages = [
    { key: 'home', label: 'Início', icon: Home, section: 'Principal' },
    { key: 'players', label: 'Jogadores', icon: Users, section: 'Gerenciar' },
    { key: 'queues', label: 'Filas', icon: List, section: 'Gerenciar' },
    { key: 'settings', label: 'Configurações', icon: SettingsIcon, section: 'Sistema' },
  ]

  const sections = ['Principal', 'Gerenciar', 'Sistema']

  return (
    <AppContext.Provider value={{ page, setPage, theme, setTheme, data, setData }}>
      <html lang="pt-BR">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
          <title>Shadow Ladder</title>
        </head>
        <body>
          <div className="app">
            <aside className="sidebar">
              <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                  <Sword size={18} />
                </div>
                <div>
                  <div className="sidebar-logo-text">Shadow Ladder</div>
                  <div className="sidebar-logo-ver">v3.0 · Dashboard</div>
                </div>
              </div>
              <nav className="sidebar-nav">
                {sections.map(section => (
                  <div key={section}>
                    <div className="nav-section">{section}</div>
                    {pages.filter(p => p.section === section).map(p => (
                      <button key={p.key}
                        className={`nav-btn ${page === p.key ? 'active' : ''}`}
                        onClick={() => setPage(p.key)}>
                        <p.icon size={18} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                ))}
              </nav>
              <div className="sidebar-bottom">
                <div className="user-tile">
                  <div className="avatar">
                    <Shield size={16} />
                  </div>
                  <div>
                    <div className="user-name-sm">Dashboard</div>
                    <div className="user-role-sm">Shadow Ladder</div>
                  </div>
                  <div className="status-dot" />
                </div>
              </div>
            </aside>
            <div className="main">
              <div className="topbar">
                <span className="page-title">
                  {{ home: 'Início', players: 'Jogadores', queues: 'Filas', settings: 'Configurações' }[page]}
                </span>
                <button
                  className={`icon-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                  title="Alternar tema"
                  style={{ width: 36, height: 36 }}>
                  {theme === 'dark' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> :
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
                </button>
              </div>
              <div className="content">{children}</div>
            </div>
          </div>
        </body>
      </html>
    </AppContext.Provider>
  )
}
