import { useState, useRef } from 'react'

interface HarHeader { name: string; value: string }
interface HarEntry {
  request: { method: string; url: string; headers: HarHeader[]; bodySize: number }
  response: {
    status: number; statusText: string; headers: HarHeader[]
    content: { mimeType: string; size: number }
    bodySize: number; _transferSize?: number
  }
  time: number
  timings: { blocked?: number; dns?: number; ssl?: number; connect?: number; send: number; wait: number; receive: number }
  startedDateTime: string
  _resourceType?: string
}

type TypeFilter = 'all' | 'xhr' | 'fetch' | 'document' | 'stylesheet' | 'script' | 'image' | 'font' | 'other'
const TYPE_FILTERS: TypeFilter[] = ['all', 'xhr', 'fetch', 'document', 'stylesheet', 'script', 'image', 'font', 'other']

function getEntryType(entry: HarEntry): TypeFilter {
  const rt = entry._resourceType?.toLowerCase()
  if (rt && rt !== 'other') return rt as TypeFilter
  const mime = entry.response?.content?.mimeType || ''
  if (mime.includes('html')) return 'document'
  if (mime.includes('css')) return 'stylesheet'
  if (mime.includes('javascript') || mime.includes('ecmascript')) return 'script'
  if (mime.startsWith('image/')) return 'image'
  if (mime.includes('font')) return 'font'
  if (mime.includes('json') || mime.includes('xml')) return 'xhr'
  return 'other'
}

function formatBytes(n: number): string {
  if (!n || n < 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

function statusClass(status: number): string {
  if (status >= 200 && status < 300) return 'ok'
  if (status >= 300 && status < 400) return 'redir'
  if (status >= 400) return 'err'
  return ''
}

function getUrl(url: string): { host: string; path: string } {
  try {
    const u = new URL(url)
    return { host: u.host, path: u.pathname + u.search }
  } catch {
    return { host: '', path: url }
  }
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

export default function HarAnalyzer() {
  const [entries, setEntries] = useState<HarEntry[] | null>(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function loadFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const har = JSON.parse(e.target?.result as string)
        const list: HarEntry[] = har?.log?.entries
        if (!Array.isArray(list)) throw new Error('No entries found in HAR file')
        setEntries(list)
        setError('')
        setExpanded(null)
        setTypeFilter('all')
        setSearch('')
      } catch (err) {
        setError((err as Error).message)
        setEntries(null)
      }
    }
    reader.readAsText(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }

  if (!entries) {
    return (
      <div className="har-root">
        {error && (
          <div className="error-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="error-bar-msg">{error}</span>
          </div>
        )}
        <div
          className={'har-drop' + (dragging ? ' dragging' : '')}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <UploadIcon />
          <p className="har-drop-title">Drop a <span className="har-drop-link" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>HAR file</span> or click to browse</p>
          <p className="har-drop-hint">Export from Chrome / Firefox DevTools → Network → Save all as HAR</p>
          <input
            ref={fileRef}
            type="file"
            accept=".har,application/json"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f) }}
          />
        </div>
      </div>
    )
  }

  const startTimes = entries.map(e => new Date(e.startedDateTime).getTime())
  const minTime = Math.min(...startTimes)
  const maxTime = Math.max(...startTimes.map((t, i) => t + entries[i].time))
  const totalSpan = maxTime - minTime || 1

  const filtered = entries.filter(e => {
    if (typeFilter !== 'all' && getEntryType(e) !== typeFilter) return false
    if (search && !e.request.url.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalTransfer = entries.reduce((sum, e) => sum + (e.response._transferSize || e.response.bodySize || 0), 0)
  const errors = entries.filter(e => e.response.status >= 400).length
  const totalMs = entries.reduce((sum, e) => sum + e.time, 0)

  return (
    <div className="har-root">
      <div className="har-summary">
        <div className="har-stat">
          <div className="har-stat-val">{entries.length}</div>
          <div className="har-stat-label">Requests</div>
        </div>
        <div className="har-stat">
          <div className="har-stat-val">{formatBytes(totalTransfer)}</div>
          <div className="har-stat-label">Transferred</div>
        </div>
        <div className="har-stat">
          <div className="har-stat-val">{errors > 0 ? errors : '—'}</div>
          <div className="har-stat-label">Errors</div>
        </div>
        <div className="har-stat">
          <div className="har-stat-val">{formatTime(totalMs)}</div>
          <div className="har-stat-label">Total time</div>
        </div>
      </div>

      <div className="har-filter-bar">
        <div className="har-type-pills">
          {TYPE_FILTERS.map(t => (
            <button
              key={t}
              className={'har-pill' + (typeFilter === t ? ' active' : '')}
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="har-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by URL…"
        />
        <button className="har-reset-btn" onClick={() => { setEntries(null); setError('') }}>
          Reset
        </button>
      </div>

      <div className="har-section-header">
        <span>Requests</span>
        <span>{filtered.length} / {entries.length}</span>
      </div>

      <div className="har-table-wrap">
        <table className="har-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Status</th>
              <th>Type</th>
              <th style={{ width: '99%' }}>URL</th>
              <th style={{ textAlign: 'right' }}>Size</th>
              <th style={{ textAlign: 'right' }}>Time</th>
              <th className="har-waterfall-cell">Waterfall</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, i) => {
              const startMs = new Date(entry.startedDateTime).getTime()
              const offsetPct = ((startMs - minTime) / totalSpan) * 100
              const widthPct = Math.max((entry.time / totalSpan) * 100, 0.5)
              const size = entry.response._transferSize || entry.response.bodySize || 0
              const { host, path } = getUrl(entry.request.url)
              const type = getEntryType(entry)
              const isExpanded = expanded === i

              return [
                <tr
                  key={`row-${i}`}
                  className={'har-entry-row' + (isExpanded ? ' expanded' : '')}
                  onClick={() => setExpanded(isExpanded ? null : i)}
                >
                  <td><span className="har-method">{entry.request.method}</span></td>
                  <td>
                    <span className={`har-status ${statusClass(entry.response.status)}`}>
                      {entry.response.status}
                    </span>
                  </td>
                  <td><span className="har-type-tag">{type}</span></td>
                  <td>
                    <div className="har-url" title={entry.request.url}>
                      <span style={{ color: 'var(--kp-fg-3)' }}>{host}</span>
                      <span style={{ color: 'var(--kp-fg-1)' }}>{path}</span>
                    </div>
                  </td>
                  <td className="har-size">{formatBytes(size)}</td>
                  <td className="har-time">{formatTime(entry.time)}</td>
                  <td className="har-waterfall-cell">
                    <div className="har-waterfall-track">
                      <div
                        className="har-waterfall-bar"
                        style={{ left: `${offsetPct}%`, width: `${widthPct}%` }}
                      />
                    </div>
                  </td>
                </tr>,
                isExpanded && (
                  <tr key={`detail-${i}`} className="har-detail-row">
                    <td colSpan={7}>
                      <div className="har-detail-inner">
                        <div className="har-detail-section">
                          <div className="har-detail-title">Request Headers</div>
                          {entry.request.headers.map((h, hi) => (
                            <div key={hi} className="har-header-row">
                              <span className="har-header-name">{h.name}</span>
                              <span className="har-header-val">{h.value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="har-detail-section">
                          <div className="har-detail-title">Response Headers</div>
                          {entry.response.headers.map((h, hi) => (
                            <div key={hi} className="har-header-row">
                              <span className="har-header-name">{h.name}</span>
                              <span className="har-header-val">{h.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              ]
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
