import { useState, useEffect } from 'react'
import HashGen from './components/HashGen'
import Base64Tool from './components/Base64Tool'
import RegexTester from './components/RegexTester'
import JsonPrettifier from './components/JsonPrettifier'
import YamlJson from './components/YamlJson'
import StringTransformer from './components/StringTransformer'
import HarAnalyzer from './components/HarAnalyzer'

type Tab = 'hash' | 'base64' | 'regex' | 'json' | 'yaml' | 'string' | 'har'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.06 1.06M17.34 17.34l1.06 1.06M5.6 18.4l1.06-1.06M17.34 6.66l1.06-1.06" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  )
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'hash',   label: 'Hash' },
  { id: 'base64', label: 'Base64' },
  { id: 'regex',  label: 'Regex' },
  { id: 'json',   label: 'JSON' },
  { id: 'yaml',   label: 'YAML' },
  { id: 'string', label: 'String' },
  { id: 'har',    label: 'HAR' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('hash')
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="page-root">
      <header className="kp-header">
        <div className="brand">
          <span className="pi-mark">π</span>
          <span>Utility</span>
        </div>
        <div className="kp-header-right">
          <a href="https://kevinprk.com" className="back-link">← kevinprk.com</a>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            aria-label="toggle theme"
            title="toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <main className="kp-main">
        <h1>Utility</h1>
        <p className="subtitle">General-purpose developer toolbox. Everything runs in your browser — nothing is sent to any server.</p>

        <div className="kp-tabs" role="tablist">
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={'kp-tab' + (tab === t.id ? ' active' : '')}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'hash'   && <HashGen />}
        {tab === 'base64' && <Base64Tool />}
        {tab === 'regex'  && <RegexTester />}
        {tab === 'json'   && <JsonPrettifier />}
        {tab === 'yaml'   && <YamlJson />}
        {tab === 'string' && <StringTransformer />}
        {tab === 'har'    && <HarAnalyzer />}
      </main>

      <footer className="kp-footer">
        <span>© {new Date().getFullYear()} kevin park</span>
        <span className="pi">π</span>
      </footer>
    </div>
  )
}
