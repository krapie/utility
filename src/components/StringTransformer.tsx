import { useState } from 'react'

function tokenize(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[\-_.\s]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(w => w.toLowerCase())
}

function toCamel(words: string[]): string {
  return words.map((w, i) => i === 0 ? w : w[0].toUpperCase() + w.slice(1)).join('')
}
function toPascal(words: string[]): string {
  return words.map(w => w[0].toUpperCase() + w.slice(1)).join('')
}
function toSnake(words: string[]): string { return words.join('_') }
function toScreaming(words: string[]): string { return words.join('_').toUpperCase() }
function toKebab(words: string[]): string { return words.join('-') }
function toTitle(words: string[]): string {
  return words.map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}
function toDot(words: string[]): string { return words.join('.') }
function toSlash(words: string[]): string { return words.join('/') }

const TRANSFORMS: { label: string; fn: (w: string[]) => string }[] = [
  { label: 'camelCase',        fn: toCamel },
  { label: 'PascalCase',       fn: toPascal },
  { label: 'snake_case',       fn: toSnake },
  { label: 'SCREAMING_SNAKE',  fn: toScreaming },
  { label: 'kebab-case',       fn: toKebab },
  { label: 'Title Case',       fn: toTitle },
  { label: 'dot.case',         fn: toDot },
  { label: 'path/case',        fn: toSlash },
  { label: 'lowercase',        fn: w => w.join(' ') },
  { label: 'UPPERCASE',        fn: w => w.join(' ').toUpperCase() },
]

function CopyBtn({ val }: { val: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    if (!val) return
    navigator.clipboard.writeText(val)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button className={'str-copy-btn' + (copied ? ' copied' : '')} onClick={copy}>
      {copied ? 'copied' : 'copy'}
    </button>
  )
}

export default function StringTransformer() {
  const [input, setInput] = useState('')

  const words = input.trim() ? tokenize(input) : []

  return (
    <div className="str-root">
      <div>
        <textarea
          className="kp-textarea"
          rows={3}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="helloWorldFoo, hello_world_foo, Hello World Foo, hello-world-foo…"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        {words.length > 0 && (
          <div className="hash-meta">
            {words.length} word{words.length !== 1 ? 's' : ''}: {words.map((w, i) => (
              <span key={i} style={{ color: 'var(--kp-fg-2)' }}>{i > 0 ? ', ' : ''}{w}</span>
            ))}
          </div>
        )}
      </div>

      <div className="kp-section-label">transformations</div>
      <div className="str-results">
        {TRANSFORMS.map(({ label, fn }) => {
          const val = words.length > 0 ? fn(words) : ''
          return (
            <div className="str-result-row" key={label}>
              <span className="str-result-label">{label}</span>
              <span className={'str-result-val' + (!val ? ' empty' : '')}>{val || '—'}</span>
              <CopyBtn val={val} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
