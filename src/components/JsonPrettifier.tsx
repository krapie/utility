import { useState, useRef } from 'react'

type Indent = 2 | 4 | '\t'

function highlight(json: string): string {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(
    /("(?:[^"\\]|\\.)*")(\s*:)?|(\btrue\b|\bfalse\b)|(\bnull\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}\[\],])/g,
    (_match, str, colon, bool, nil, num, punct) => {
      if (str && colon) return `<span class="j-key">${str}</span>${colon}`
      if (str) return `<span class="j-str">${str}</span>`
      if (bool) return `<span class="j-bool">${bool}</span>`
      if (nil) return `<span class="j-null">${nil}</span>`
      if (num) return `<span class="j-num">${num}</span>`
      if (punct) return `<span class="j-punct">${punct}</span>`
      return _match
    }
  )
}

function analyze(parsed: unknown): { keys: number; maxDepth: number } {
  let keys = 0, maxDepth = 0
  function walk(node: unknown, depth: number) {
    if (depth > maxDepth) maxDepth = depth
    if (Array.isArray(node)) {
      node.forEach(v => walk(v, depth + 1))
    } else if (node !== null && typeof node === 'object') {
      for (const k of Object.keys(node as object)) {
        keys++
        walk((node as Record<string, unknown>)[k], depth + 1)
      }
    }
  }
  walk(parsed, 0)
  return { keys, maxDepth }
}

export default function JsonPrettifier() {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState<Indent>(2)
  const [minify, setMinify] = useState(false)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [rawInput, setRawInput] = useState('')

  function handleInput(val: string) {
    setRawInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setInput(val), 250)
  }

  const raw = input.trim()
  let parsed: unknown = null
  let parseError = ''

  if (raw) {
    try { parsed = JSON.parse(raw) }
    catch (e) { parseError = (e as Error).message }
  }

  const formatted = parsed !== null
    ? JSON.stringify(parsed, null, minify ? 0 : indent)
    : ''

  const { keys, maxDepth } = parsed !== null ? analyze(parsed) : { keys: 0, maxDepth: 0 }

  function copy() {
    if (!formatted) return
    navigator.clipboard.writeText(formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="json-root">
      <textarea
        className={'kp-textarea' + (parseError ? ' error' : '')}
        rows={7}
        value={rawInput}
        onChange={e => handleInput(e.target.value)}
        placeholder='Paste JSON here… {"key": "value"}'
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      <div className="json-controls">
        <div className="json-indent-group">
          {([2, 4, '\t'] as Indent[]).map(v => (
            <button
              key={String(v)}
              className={'json-indent-btn' + (indent === v && !minify ? ' active' : '')}
              onClick={() => { setIndent(v); setMinify(false) }}
            >
              {v === '\t' ? 'tab' : `${v} spaces`}
            </button>
          ))}
        </div>
        <button
          className={'json-action-btn' + (minify ? ' active' : '')}
          onClick={() => setMinify(m => !m)}
        >
          Minify
        </button>
        <div className="json-controls-spacer" />
        <button className="json-action-btn" onClick={() => { setRawInput(''); setInput('') }}>
          Clear
        </button>
        <button className={'json-action-btn' + (copied ? ' copied' : '')} onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {parseError && (
        <div className="error-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span className="error-bar-msg">{parseError}</span>
        </div>
      )}

      <div className="kp-section-label">output</div>

      {formatted ? (
        <div
          className="json-output-block"
          dangerouslySetInnerHTML={{ __html: highlight(formatted) }}
        />
      ) : (
        <div className="json-output-block empty">Formatted JSON will appear here.</div>
      )}

      {formatted && (
        <div className="json-stats">
          {keys > 0 && <span>{keys.toLocaleString()} key{keys !== 1 ? 's' : ''}</span>}
          <span>depth {maxDepth}</span>
          <span>{new TextEncoder().encode(formatted).length.toLocaleString()} B</span>
          {raw && new TextEncoder().encode(formatted).length !== new TextEncoder().encode(raw).length && (
            <span>(raw {new TextEncoder().encode(raw).length.toLocaleString()} B)</span>
          )}
        </div>
      )}
    </div>
  )
}
