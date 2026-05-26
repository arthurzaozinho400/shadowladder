'use client'
import { useApp } from './layout'
import { Palette, Info, Shield, ExternalLink } from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme } = useApp()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title"><Palette size={16} /> Aparência</div>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-lbl">Tema escuro</div>
            <div className="settings-sub">Alternar entre tema claro e escuro</div>
          </div>
          <button className={`toggle ${theme !== 'dark' ? 'on' : ''}`}
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><Shield size={16} /> Sobre</div>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
          <p><strong>Shadow Ladder</strong> — Sistema de ranking e filas para Minecraft PvP.</p>
          <p style={{ marginTop: 8 }}>Dashboard v3.0 · Next.js + Supabase + Recharts</p>
          <p style={{ marginTop: 8, color: 'var(--text3)' }}>
            <ExternalLink size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Dados carregados do Supabase em tempo real.
          </p>
        </div>
      </div>
    </div>
  )
}
