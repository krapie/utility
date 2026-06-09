import { useState } from 'react'
import yaml from 'js-yaml'

type Direction = 'yaml-to-json' | 'json-to-yaml'

function convert(input: string, direction: Direction): { output: string } | { error: string } {
  const raw = input.trim()
  if (!raw) return { output: '' }
  try {
    if (direction === 'yaml-to-json') {
      const parsed = yaml.load(raw)
      return { output: JSON.stringify(parsed, null, 2) }
    } else {
      const parsed = JSON.parse(raw)
      return { output: yaml.dump(parsed, { indent: 2, lineWidth: -1 }) }
    }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button className={'json-action-btn' + (copied ? ' copied' : '')} onClick={copy} style={{ fontSize: '11px', padding: '4px 10px' }}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function YamlJson() {
  const [direction, setDirection] = useState<Direction>('yaml-to-json')
  const [input, setInput] = useState('')

  const result = convert(input, direction)
  const output = 'output' in result ? result.output : ''
  const error = 'error' in result ? result.error : ''

  const inputLabel = direction === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'
  const outputLabel = direction === 'yaml-to-json' ? 'JSON Output' : 'YAML Output'
  const inputPlaceholder = direction === 'yaml-to-json'
    ? 'key: value\nlist:\n  - item1\n  - item2'
    : '{"key": "value", "list": ["item1", "item2"]}'

  return (
    <div className="yaml-root">
      <div className="yaml-direction-bar">
        <div className="yaml-dir-group">
          <button
            className={'yaml-dir-btn' + (direction === 'yaml-to-json' ? ' active' : '')}
            onClick={() => { setDirection('yaml-to-json'); setInput('') }}
          >
            YAML → JSON
          </button>
          <button
            className={'yaml-dir-btn' + (direction === 'json-to-yaml' ? ' active' : '')}
            onClick={() => { setDirection('json-to-yaml'); setInput('') }}
          >
            JSON → YAML
          </button>
        </div>
      </div>

      <div className="yaml-panels">
        <div className="yaml-panel">
          <div className="yaml-panel-label">{inputLabel}</div>
          <textarea
            className={'kp-textarea' + (error ? ' error' : '')}
            rows={16}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={inputPlaceholder}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            style={{ minHeight: 260, flex: 1 }}
          />
        </div>

        <div className="yaml-panel">
          <div className="yaml-output-header">
            <span className="yaml-panel-label">{outputLabel}</span>
            {output && <CopyBtn text={output} />}
          </div>

          {error ? (
            <div className="error-bar" style={{ marginBottom: 'var(--kp-space-2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span className="error-bar-msg">{error}</span>
            </div>
          ) : null}

          <div className={'yaml-output' + (!output ? ' empty' : '')} style={{ minHeight: 260 }}>
            {output || (input ? '' : `${outputLabel} will appear here.`)}
          </div>
        </div>
      </div>
    </div>
  )
}
