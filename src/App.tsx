import { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ToolRail from './components/ToolRail'
import ToolPage from './pages/ToolPage'
import HashGen from './components/HashGen'
import Base64Tool from './components/Base64Tool'
import RegexTester from './components/RegexTester'
import JsonPrettifier from './components/JsonPrettifier'
import YamlJson from './components/YamlJson'
import StringTransformer from './components/StringTransformer'
import HarAnalyzer from './components/HarAnalyzer'
import CronBuilder from './components/CronBuilder'

type Theme = 'light' | 'dark'
interface ThemeCtx { theme: Theme; toggle: () => void }
export const ThemeContext = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} })
export const useTheme = () => useContext(ThemeContext)

export default function App() {
  const [theme, setTheme] = useState<Theme>(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <BrowserRouter>
        <div className="kp-shell">
          <ToolRail />
          <div className="kp-shell-main">
            <Routes>
              <Route path="/" element={<Navigate to="/hash" replace />} />
              <Route path="/hash" element={
                <ToolPage title="Hash Generator" subtitle="Compute MD5, SHA-1, SHA-256, and SHA-512 hashes entirely in your browser.">
                  <HashGen />
                </ToolPage>
              } />
              <Route path="/base64" element={
                <ToolPage title="Base64" subtitle="Encode and decode text, or convert any file to Base64 — all client-side.">
                  <Base64Tool />
                </ToolPage>
              } />
              <Route path="/regex" element={
                <ToolPage title="Regex Tester" subtitle="Live match highlighting with capture group inspection.">
                  <RegexTester />
                </ToolPage>
              } />
              <Route path="/json" element={
                <ToolPage title="JSON Prettifier" subtitle="Format, validate, and minify JSON with monochrome syntax highlighting.">
                  <JsonPrettifier />
                </ToolPage>
              } />
              <Route path="/yaml" element={
                <ToolPage title="YAML ↔ JSON" subtitle="Convert between YAML and JSON, bidirectionally.">
                  <YamlJson />
                </ToolPage>
              } />
              <Route path="/string" element={
                <ToolPage title="String Transformer" subtitle="Convert between camelCase, snake_case, kebab-case, PascalCase, and more.">
                  <StringTransformer />
                </ToolPage>
              } />
              <Route path="/har" element={
                <ToolPage title="HAR Analyzer" subtitle="Inspect Chrome or Firefox network archives — waterfall, timings, headers.">
                  <HarAnalyzer />
                </ToolPage>
              } />
              <Route path="/cron" element={
                <ToolPage title="Cron Builder" subtitle="Build, validate, and explain cron expressions. See the next scheduled runs.">
                  <CronBuilder />
                </ToolPage>
              } />
              <Route path="*" element={<Navigate to="/hash" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  )
}
