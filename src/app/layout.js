'use client'
import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { Home, Users, List, Settings as SettingsIcon, Shield } from 'lucide-react'
import './globals.css'

const AppContext = createContext()
export const useApp = () => useContext(AppContext)

export default function RootLayout({ children }) {
  const [page, setPage] = useState('home')
  const [theme, setTheme] = useState('dark')
  const [data, setData] = useState({ stats: null, users: [], queues: [], matches: [] })
  const [mobileOpen, setMobileOpen] = useState(false)
  const starsRef = useRef(null)
  const particlesRef = useRef(null)

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light' : ''
    window.__goPage = setPage
  }, [theme])

  useEffect(() => {
    const canvas = starsRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = []
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 0.3,
        a: Math.random() * 0.8 + 0.2,
        speed: 0.005 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.7 ? 270 + Math.random() * 40 : 0,
      })
    }

    let frame
    function drawStars(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const isLight = document.body.classList.contains('light')
      for (const s of stars) {
        const alpha = s.a * (0.6 + 0.4 * Math.sin(t * s.speed + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        if (isLight) {
          ctx.fillStyle = `rgba(80, 50, 140, ${alpha * 0.3})`
        } else if (s.hue > 0) {
          ctx.fillStyle = `hsla(${s.hue}, 60%, 80%, ${alpha})`
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        }
        ctx.fill()
      }
      frame = requestAnimationFrame(drawStars)
    }
    drawStars(0)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    const layer = document.getElementById('bg-stars-layer')
    if (layer) {
      for (let i = 0; i < 300; i++) {
        const el = document.createElement('div')
        el.className = 'star'
        const size = Math.random() * 2 + 0.5
        el.style.cssText = `
          width: ${size}px; height: ${size}px;
          top: ${Math.random() * 100}%; left: ${Math.random() * 100}%;
          opacity: ${Math.random() * 0.6 + 0.1};
          background: ${Math.random() > 0.7 ? 'rgba(200,160,255,0.6)' : 'rgba(255,255,255,0.5)'};
          box-shadow: 0 0 ${size * 2}px rgba(200,160,255,${Math.random() * 0.2});
        `
        layer.appendChild(el)
      }
    }

    const container = particlesRef.current
    if (!container) return
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div')
      p.className = 'bg-particle'
      const size = Math.random() * 3 + 1
      const x = Math.random() * 100
      const delay = Math.random() * 8
      const dur = 8 + Math.random() * 12
      p.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${x}%; bottom: -10px;
        animation-delay: ${delay}s; animation-duration: ${dur}s;
        opacity: ${Math.random() * 0.3};
        background: rgba(${180 + Math.random() * 75}, ${60 + Math.random() * 100}, 255, ${Math.random() * 0.2 + 0.1});
      `
      container.appendChild(p)
    }
  }, [])

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
          <div className="bg-layer">
            <canvas ref={starsRef} id="bg-stars"></canvas>
            <div className="nebula">
              <div className="nebula-1"></div>
              <div className="nebula-2"></div>
              <div className="nebula-3"></div>
              <div className="nebula-4"></div>
            </div>
            <div className="stars-layer" id="bg-stars-layer"></div>
            <div ref={particlesRef} id="bg-particles"></div>
          </div>
          <div className="app">
            <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
            <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
              <div className="sidebar-logo">
                <img src="/logo.png" alt="Shadow Ladder" className="sidebar-logo-img" />
                <div className="sidebar-logo-text">Shadow Ladder</div>
              </div>
              <nav className="sidebar-nav">
                {sections.map(section => (
                  <div key={section}>
                    <div className="nav-section">{section}</div>
                    {pages.filter(p => p.section === section).map(p => (
                      <button key={p.key}
                        className={`nav-btn ${page === p.key ? 'active' : ''}`}
                        onClick={() => { setPage(p.key); setMobileOpen(false) }}>
                        <p.icon size={18} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                ))}
              </nav>
              <div className="sidebar-bottom">
                <SidebarTierInfo data={data} />
              </div>
            </aside>
            <div className="main">
              <div className="topbar">
                <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
                  <span /><span /><span />
                </button>
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

function SidebarTierInfo({ data }) {
  const users = data.users || []
  const htModes = {}
  const ltModes = {}
  for (const u of users) {
    const mode = u.best_mode || 'N/A'
    if (u.best_tier?.startsWith('HT')) {
      htModes[mode] = (htModes[mode] || 0) + 1
    } else if (u.best_tier?.startsWith('LT')) {
      ltModes[mode] = (ltModes[mode] || 0) + 1
    }
  }

  return (
    <div className="tier-summary">
      <div className="tier-summary-row">
        <span className="tier-summary-label">HT</span>
        <span className="tier-summary-count">{Object.values(htModes).reduce((a, b) => a + b, 0)}</span>
      </div>
      <div className="tier-summary-modes">
        {Object.entries(htModes).sort((a, b) => b[1] - a[1]).map(([mode, count]) => (
          <span key={mode} className="tier-summary-chip ht">{mode} {count}</span>
        ))}
        {!Object.keys(htModes).length && <span className="tier-summary-chip">—</span>}
      </div>
      <div className="tier-summary-row lt">
        <span className="tier-summary-label">LT</span>
        <span className="tier-summary-count">{Object.values(ltModes).reduce((a, b) => a + b, 0)}</span>
      </div>
      <div className="tier-summary-modes">
        {Object.entries(ltModes).sort((a, b) => b[1] - a[1]).map(([mode, count]) => (
          <span key={mode} className="tier-summary-chip lt">{mode} {count}</span>
        ))}
        {!Object.keys(ltModes).length && <span className="tier-summary-chip">—</span>}
      </div>
    </div>
  )
}
