import { useState, useMemo } from 'react'

type Flag = 'g' | 'i' | 'm' | 's'
const ALL_FLAGS: { id: Flag; label: string; title: string }[] = [
  { id: 'g', label: 'g', title: 'global — find all matches' },
  { id: 'i', label: 'i', title: 'case insensitive' },
  { id: 'm', label: 'm', title: 'multiline — ^ and $ match line starts/ends' },
  { id: 's', label: 's', title: 'dotAll — . matches newline' },
]

interface MatchResult {
  index: number
  start: number
  end: number
  fullMatch: string
  groups: (string | undefined)[]
  namedGroups: Record<string, string | undefined> | null
}

function runRegex(pattern: string, flags: Set<Flag>, test: string): MatchResult[] | { error: string } {
  if (!pattern) return []
  try {
    const flagStr = [...flags].join('')
    const re = new RegExp(pattern, flagStr.includes('g') ? flagStr : flagStr + 'g')
    const results: MatchResult[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(test)) !== null) {
      results.push({
        index: results.length,
        start: m.index,
        end: m.index + m[0].length,
        fullMatch: m[0],
        groups: m.slice(1),
        namedGroups: m.groups ? { ...m.groups } : null,
      })
      if (!flagStr.includes('g') || re.lastIndex === 0) break
    }
    return results
  } catch (e) {
    return { error: (e as Error).message }
  }
}

function buildHighlightedSegments(pattern: string, flags: Set<Flag>, test: string): React.ReactNode {
  if (!pattern || !test) return test

  try {
    const flagStr = [...flags].join('')
    const re = new RegExp(pattern, flagStr.includes('g') ? flagStr : flagStr + 'g')
    const segments: React.ReactNode[] = []
    let last = 0
    let m: RegExpExecArray | null
    let safetyCount = 0

    while ((m = re.exec(test)) !== null && safetyCount++ < 500) {
      if (m.index > last) segments.push(test.slice(last, m.index))
      segments.push(<mark key={m.index} className="regex-match">{m[0]}</mark>)
      last = m.index + m[0].length
      if (!flagStr.includes('g') || re.lastIndex === 0) break
    }
    if (last < test.length) segments.push(test.slice(last))
    return <>{segments}</>
  } catch {
    return test
  }
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState<Set<Flag>>(new Set(['g']))
  const [testStr, setTestStr] = useState('')

  function toggleFlag(f: Flag) {
    setFlags(prev => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next
    })
  }

  const result = useMemo(() => runRegex(pattern, flags, testStr), [pattern, flags, testStr])
  const highlighted = useMemo(() => buildHighlightedSegments(pattern, flags, testStr), [pattern, flags, testStr])

  const isError = result && 'error' in result
  const matches = !isError ? result as MatchResult[] : []

  return (
    <div className="regex-root">
      <div>
        <div className="kp-input-row" style={{ marginBottom: 'var(--kp-space-2)' }}>
          <input
            type="text"
            className={'kp-input' + (isError ? ' error' : '')}
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="Regular expression pattern…"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            style={{ fontFamily: 'var(--kp-font-mono)' }}
          />
        </div>
        <div className="regex-flags">
          {ALL_FLAGS.map(f => (
            <label
              key={f.id}
              className={'regex-flag-label' + (flags.has(f.id) ? ' checked' : '')}
              title={f.title}
            >
              <input
                type="checkbox"
                checked={flags.has(f.id)}
                onChange={() => toggleFlag(f.id)}
              />
              {f.label}
            </label>
          ))}
          {pattern && !isError && (
            <span className="regex-hint">
              /{pattern}/{[...flags].join('')}
            </span>
          )}
        </div>
      </div>

      {isError && (
        <div className="error-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span className="error-bar-msg">{(result as { error: string }).error}</span>
        </div>
      )}

      <div>
        <div className="kp-section-label">test string</div>
        <textarea
          className="kp-textarea"
          rows={5}
          value={testStr}
          onChange={e => setTestStr(e.target.value)}
          placeholder="Paste text to test against…"
          spellCheck={false}
        />
      </div>

      {testStr && pattern && !isError && (
        <div>
          <div className="kp-section-label">matches highlighted</div>
          <div className="regex-test-output">{highlighted}</div>
        </div>
      )}

      {matches.length > 0 && (
        <div>
          <div className="kp-section-label">
            {matches.length} match{matches.length !== 1 ? 'es' : ''}
          </div>
          <div className="regex-matches-list">
            {matches.map((m, i) => (
              <div className="regex-match-row" key={i}>
                <span className="regex-match-idx">#{i + 1}</span>
                <div>
                  <div className="regex-match-val">{m.fullMatch || <em style={{ color: 'var(--kp-fg-3)' }}>empty match</em>}</div>
                  {(m.groups.length > 0 || m.namedGroups) && (
                    <div className="regex-match-groups">
                      {m.groups.map((g, gi) => (
                        <span key={gi} className="regex-group-tag">
                          ${gi + 1}: {g ?? 'undefined'}
                        </span>
                      ))}
                      {m.namedGroups && Object.entries(m.namedGroups).map(([k, v]) => (
                        <span key={k} className="regex-group-tag">
                          ?&lt;{k}&gt;: {v ?? 'undefined'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="regex-match-pos">{m.start}–{m.end}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pattern && !isError && testStr && matches.length === 0 && (
        <p className="kp-empty">No matches found.</p>
      )}
    </div>
  )
}
