import { useState } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const PRESETS = [
  { label: 'Every minute',      expr: '* * * * *' },
  { label: 'Every hour',        expr: '0 * * * *' },
  { label: 'Daily midnight',    expr: '0 0 * * *' },
  { label: 'Daily 9am',        expr: '0 9 * * *' },
  { label: 'Weekdays 9am',     expr: '0 9 * * 1-5' },
  { label: 'Every Sunday',     expr: '0 0 * * 0' },
  { label: 'Weekly Mon 9am',   expr: '0 9 * * 1' },
  { label: '1st of month',     expr: '0 0 1 * *' },
]

interface Field { desc: string; valid: boolean }

function parseSingle(val: string, min: number, max: number, names?: string[]): Field {
  const v = val.trim()
  const label = (n: number) => names ? names[n - min] : String(n)

  if (v === '*') return { desc: 'every', valid: true }

  if (/^\*\/\d+$/.test(v)) {
    const n = +v.slice(2)
    return n >= 1 && n <= max - min
      ? { desc: `every ${n}`, valid: true }
      : { desc: 'invalid step', valid: false }
  }

  if (/^\d+$/.test(v)) {
    const n = +v
    return n >= min && n <= max
      ? { desc: label(n), valid: true }
      : { desc: `out of range (${min}–${max})`, valid: false }
  }

  if (/^\d+-\d+$/.test(v)) {
    const [a, b] = v.split('-').map(Number)
    return a >= min && b <= max && a <= b
      ? { desc: `${label(a)} – ${label(b)}`, valid: true }
      : { desc: 'invalid range', valid: false }
  }

  if (/^[\d,]+$/.test(v)) {
    const parts = v.split(',').map(Number)
    if (parts.some(n => n < min || n > max)) return { desc: `out of range (${min}–${max})`, valid: false }
    return { desc: parts.map(label).join(', '), valid: true }
  }

  if (/^\d+-\d+\/\d+$/.test(v)) {
    const [range, step] = v.split('/')
    const [a, b] = range.split('-').map(Number)
    return a >= min && b <= max && a <= b && +step >= 1
      ? { desc: `every ${step} from ${label(a)} to ${label(b)}`, valid: true }
      : { desc: 'invalid', valid: false }
  }

  return { desc: 'unrecognized', valid: false }
}

function matchesField(v: string, n: number, min: number): boolean {
  const val = v.trim()
  if (val === '*') return true
  if (/^\*\/\d+$/.test(val)) return (n - min) % +val.slice(2) === 0
  if (/^\d+$/.test(val)) return +val === n
  if (/^\d+-\d+$/.test(val)) { const [a, b] = val.split('-').map(Number); return n >= a && n <= b }
  if (/^[\d,]+$/.test(val)) return val.split(',').map(Number).includes(n)
  if (/^\d+-\d+\/\d+$/.test(val)) {
    const [range, step] = val.split('/')
    const [a, b] = range.split('-').map(Number)
    return n >= a && n <= b && (n - a) % +step === 0
  }
  return false
}

function nextRuns(expr: string, count = 6): Date[] {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return []
  const [min, hour, dom, month, dow] = parts
  const results: Date[] = []
  const d = new Date()
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() + 1)
  for (let i = 0; i < 60 * 24 * 400 && results.length < count; i++) {
    if (
      matchesField(min, d.getMinutes(), 0) &&
      matchesField(hour, d.getHours(), 0) &&
      matchesField(dom, d.getDate(), 1) &&
      matchesField(month, d.getMonth() + 1, 1) &&
      matchesField(dow, d.getDay(), 0)
    ) results.push(new Date(d))
    d.setMinutes(d.getMinutes() + 1)
  }
  return results
}

function fmtRun(d: Date): string {
  return d.toLocaleString([], {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const FIELDS = [
  { label: 'Minute',     min: 0,  max: 59 },
  { label: 'Hour',       min: 0,  max: 23 },
  { label: 'Day',        min: 1,  max: 31 },
  { label: 'Month',      min: 1,  max: 12, names: MONTHS },
  { label: 'Weekday',    min: 0,  max: 6,  names: DAYS },
]

export default function CronBuilder() {
  const [expr, setExpr] = useState('0 9 * * 1-5')

  const parts = expr.trim().split(/\s+/)
  const isWrongLength = parts.length !== 5
  const fields = isWrongLength
    ? []
    : parts.map((p, i) => parseSingle(p, FIELDS[i].min, FIELDS[i].max, FIELDS[i].names))
  const allValid = !isWrongLength && fields.every(f => f.valid)
  const runs = allValid ? nextRuns(expr) : []

  return (
    <div className="cron-wrap">
      <div className="cron-input-row">
        <input
          className={`cron-input${!allValid && expr.trim() ? ' cron-input--invalid' : ''}`}
          value={expr}
          onChange={e => setExpr(e.target.value)}
          spellCheck={false}
          placeholder="* * * * *"
        />
        <span className="cron-hint">min  hour  day  month  weekday</span>
      </div>

      <div className="cron-presets">
        {PRESETS.map(p => (
          <button
            key={p.expr}
            className={`cron-preset${expr === p.expr ? ' cron-preset--active' : ''}`}
            onClick={() => setExpr(p.expr)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {!isWrongLength && (
        <div className="cron-fields">
          {fields.map((f, i) => (
            <div key={i} className={`cron-field${f.valid ? '' : ' cron-field--invalid'}`}>
              <div className="cron-field-label">{FIELDS[i].label}</div>
              <div className="cron-field-val">{parts[i]}</div>
              <div className="cron-field-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      )}

      {isWrongLength && expr.trim() && (
        <p className="cron-error">Cron expression must have exactly 5 fields.</p>
      )}

      {allValid && runs.length > 0 && (
        <div className="cron-runs">
          <div className="cron-runs-label">next runs</div>
          <ol className="cron-runs-list">
            {runs.map((d, i) => (
              <li key={i}>{fmtRun(d)}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
