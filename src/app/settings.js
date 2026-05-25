'use client'
import { useApp } from './layout'
import { Palette } from 'lucide-react'

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
    </div>
  )
}
