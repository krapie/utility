import { useState, useEffect, useRef } from 'react'

function md5(str: string): string {
  const bytes = new TextEncoder().encode(str)
  const l = bytes.length
  const m = new Array(((l + 8 >> 6) + 1) * 16).fill(0)
  for (let i = 0; i < l; i++) m[i >> 2] |= bytes[i] << ((i & 3) << 3)
  m[l >> 2] |= 0x80 << ((l & 3) << 3)
  m[m.length - 2] = l << 3
  m[m.length - 1] = l >>> 29

  const add = (x: number, y: number) => { const lsw = (x & 0xffff) + (y & 0xffff); return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff) }
  const rol = (n: number, c: number) => (n << c) | (n >>> (32 - c))
  const cmn = (q: number, a: number, b: number, x: number, s: number, t: number) => add(rol(add(add(a, q), add(x, t)), s), b)
  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & c) | (~b & d), a, b, x, s, t)
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & d) | (c & ~d), a, b, x, s, t)
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(b ^ c ^ d, a, b, x, s, t)
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(c ^ (b | ~d), a, b, x, s, t)

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878
  for (let i = 0; i < m.length; i += 16) {
    const A = a, B = b, C = c, D = d
    a=ff(a,b,c,d,m[i+0],7,-680876936);d=ff(d,a,b,c,m[i+1],12,-389564586);c=ff(c,d,a,b,m[i+2],17,606105819);b=ff(b,c,d,a,m[i+3],22,-1044525330)
    a=ff(a,b,c,d,m[i+4],7,-176418897);d=ff(d,a,b,c,m[i+5],12,1200080426);c=ff(c,d,a,b,m[i+6],17,-1473231341);b=ff(b,c,d,a,m[i+7],22,-45705983)
    a=ff(a,b,c,d,m[i+8],7,1770035416);d=ff(d,a,b,c,m[i+9],12,-1958414417);c=ff(c,d,a,b,m[i+10],17,-42063);b=ff(b,c,d,a,m[i+11],22,-1990404162)
    a=ff(a,b,c,d,m[i+12],7,1804603682);d=ff(d,a,b,c,m[i+13],12,-40341101);c=ff(c,d,a,b,m[i+14],17,-1502002290);b=ff(b,c,d,a,m[i+15],22,1236535329)
    a=gg(a,b,c,d,m[i+1],5,-165796510);d=gg(d,a,b,c,m[i+6],9,-1069501632);c=gg(c,d,a,b,m[i+11],14,643717713);b=gg(b,c,d,a,m[i+0],20,-373897302)
    a=gg(a,b,c,d,m[i+5],5,-701558691);d=gg(d,a,b,c,m[i+10],9,38016083);c=gg(c,d,a,b,m[i+15],14,-660478335);b=gg(b,c,d,a,m[i+4],20,-405537848)
    a=gg(a,b,c,d,m[i+9],5,568446438);d=gg(d,a,b,c,m[i+14],9,-1019803690);c=gg(c,d,a,b,m[i+3],14,-187363961);b=gg(b,c,d,a,m[i+8],20,1163531501)
    a=gg(a,b,c,d,m[i+13],5,-1444681467);d=gg(d,a,b,c,m[i+2],9,-51403784);c=gg(c,d,a,b,m[i+7],14,1735328473);b=gg(b,c,d,a,m[i+12],20,-1926607734)
    a=hh(a,b,c,d,m[i+5],4,-378558);d=hh(d,a,b,c,m[i+8],11,-2022574463);c=hh(c,d,a,b,m[i+11],16,1839030562);b=hh(b,c,d,a,m[i+14],23,-35309556)
    a=hh(a,b,c,d,m[i+1],4,-1530992060);d=hh(d,a,b,c,m[i+4],11,1272893353);c=hh(c,d,a,b,m[i+7],16,-155497632);b=hh(b,c,d,a,m[i+10],23,-1094730640)
    a=hh(a,b,c,d,m[i+13],4,681279174);d=hh(d,a,b,c,m[i+0],11,-358537222);c=hh(c,d,a,b,m[i+3],16,-722521979);b=hh(b,c,d,a,m[i+6],23,76029189)
    a=hh(a,b,c,d,m[i+9],4,-640364487);d=hh(d,a,b,c,m[i+12],11,-421815835);c=hh(c,d,a,b,m[i+15],16,530742520);b=hh(b,c,d,a,m[i+2],23,-995338651)
    a=ii(a,b,c,d,m[i+0],6,-198630844);d=ii(d,a,b,c,m[i+7],10,1126891415);c=ii(c,d,a,b,m[i+14],15,-1416354905);b=ii(b,c,d,a,m[i+5],21,-57434055)
    a=ii(a,b,c,d,m[i+12],6,1700485571);d=ii(d,a,b,c,m[i+3],10,-1894986606);c=ii(c,d,a,b,m[i+10],15,-1051523);b=ii(b,c,d,a,m[i+1],21,-2054922799)
    a=ii(a,b,c,d,m[i+8],6,1873313359);d=ii(d,a,b,c,m[i+15],10,-30611744);c=ii(c,d,a,b,m[i+6],15,-1560198380);b=ii(b,c,d,a,m[i+13],21,1309151649)
    a=ii(a,b,c,d,m[i+4],6,-145523070);d=ii(d,a,b,c,m[i+11],10,-1120210379);c=ii(c,d,a,b,m[i+2],15,718787259);b=ii(b,c,d,a,m[i+9],21,-343485551)
    a = add(a, A); b = add(b, B); c = add(c, C); d = add(d, D)
  }
  return [a, b, c, d].map(n =>
    Array.from({ length: 4 }, (_, j) => ((n >> (j * 8)) & 0xff).toString(16).padStart(2, '0')).join('')
  ).join('')
}

async function sha(algo: string, bytes: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest(algo, bytes.buffer as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const ALGOS = ['md5', 'sha1', 'sha256', 'sha512'] as const
type Algo = typeof ALGOS[number]
const ALGO_LABELS: Record<Algo, string> = { md5: 'MD5', sha1: 'SHA-1', sha256: 'SHA-256', sha512: 'SHA-512' }

function CopyBtn({ algo, val }: { algo: Algo; val: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    if (!val) return
    navigator.clipboard.writeText(val)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button className={'hash-copy-btn' + (copied ? ' copied' : '')} onClick={copy}>
      {copied ? 'copied' : 'copy'}
    </button>
  )
}

export default function HashGen() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<Algo, string>>({ md5: '', sha1: '', sha256: '', sha512: '' })
  const reqRef = useRef(0)

  const encoded = new TextEncoder().encode(input)

  useEffect(() => {
    const id = ++reqRef.current
    if (!input) { setHashes({ md5: '', sha1: '', sha256: '', sha512: '' }); return }
    const bytes = new TextEncoder().encode(input)
    const m5 = md5(input)
    Promise.all([sha('SHA-1', bytes), sha('SHA-256', bytes), sha('SHA-512', bytes)]).then(([h1, h256, h512]) => {
      if (id !== reqRef.current) return
      setHashes({ md5: m5, sha1: h1, sha256: h256, sha512: h512 })
    })
  }, [input])

  return (
    <div className="hash-root">
      <div>
        <textarea
          className="kp-textarea"
          rows={4}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type or paste anything…"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <div className="hash-meta">
          {input.length.toLocaleString()} character{input.length !== 1 ? 's' : ''} · {encoded.length.toLocaleString()} byte{encoded.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="kp-section-label">algorithms</div>
      <div className="hash-list">
        {ALGOS.map(algo => (
          <div className="hash-row" key={algo}>
            <span className="hash-algo">{ALGO_LABELS[algo]}</span>
            <span className={'hash-val' + (!hashes[algo] ? ' empty' : '')}>
              {hashes[algo] || '—'}
            </span>
            <CopyBtn algo={algo} val={hashes[algo]} />
          </div>
        ))}
      </div>
    </div>
  )
}
