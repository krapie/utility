import { useState, useRef } from 'react'

type Mode = 'encode' | 'decode' | 'file'

function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function decodeBase64(b64: string): { text: string } | { error: string } {
  try {
    const binary = atob(b64.trim())
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
    return { text: new TextDecoder().decode(bytes) }
  } catch {
    return { error: 'Invalid Base64 string' }
  }
}

function CopyBtn({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button className={className || 'json-action-btn' + (copied ? ' copied' : '')} onClick={copy}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode')
  const [textInput, setTextInput] = useState('')
  const [fileResult, setFileResult] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const encoded = mode === 'encode' ? (textInput ? encodeBase64(textInput) : '') : ''
  const decoded = mode === 'decode' ? (textInput ? decodeBase64(textInput) : null) : null

  function processFile(file: File) {
    setFileName(file.name)
    setFileSize(file.size)
    const reader = new FileReader()
    reader.onload = e => {
      const arr = e.target?.result as ArrayBuffer
      const bytes = new Uint8Array(arr)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
      setFileResult(btoa(binary))
    }
    reader.readAsArrayBuffer(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function formatBytes(n: number): string {
    if (n < 1024) return `${n} B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
    return `${(n / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="b64-root">
      <div className="b64-mode-bar">
        {(['encode', 'decode', 'file'] as Mode[]).map(m => (
          <button
            key={m}
            className={'b64-mode-btn' + (mode === m ? ' active' : '')}
            onClick={() => setMode(m)}
          >
            {m === 'file' ? 'File → Base64' : m === 'encode' ? 'Encode' : 'Decode'}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
        <>
          <div
            className={'b64-file-drop' + (dragging ? ' dragging' : '')}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <UploadIcon />
            <p>Drop a file or <span className="b64-file-drop-link" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>browse</span></p>
            <small>Any file type — converted to Base64 in your browser</small>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }}
            />
          </div>

          {fileResult && (
            <div className="b64-panel">
              <div className="b64-output-bar">
                <span className="b64-label">Base64 Output</span>
                <span className="b64-file-info">{fileName} · {formatBytes(fileSize)}</span>
                <CopyBtn text={fileResult} />
              </div>
              <textarea
                className="kp-textarea"
                rows={6}
                readOnly
                value={fileResult}
                style={{ cursor: 'text' }}
              />
              <div className="hash-meta">{fileResult.length.toLocaleString()} characters</div>
            </div>
          )}
        </>
      ) : (
        <div className="b64-io">
          <div className="b64-panel">
            <div className="b64-label">{mode === 'encode' ? 'Plain text' : 'Base64 input'}</div>
            <textarea
              className="kp-textarea"
              rows={8}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Type or paste text…' : 'Paste Base64 string…'}
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          <div className="b64-panel">
            <div className="b64-output-bar">
              <span className="b64-label">{mode === 'encode' ? 'Base64 output' : 'Decoded text'}</span>
              {mode === 'encode' && encoded && <CopyBtn text={encoded} />}
              {mode === 'decode' && decoded && 'text' in decoded && <CopyBtn text={decoded.text} />}
            </div>

            {mode === 'encode' && (
              <textarea
                className="kp-textarea"
                rows={8}
                readOnly
                value={encoded}
                placeholder="Base64 output will appear here…"
                style={{ cursor: 'text' }}
              />
            )}
            {mode === 'decode' && decoded && 'error' in decoded && (
              <div className="error-bar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className="error-bar-msg">{decoded.error}</span>
              </div>
            )}
            {mode === 'decode' && decoded && 'text' in decoded && (
              <textarea
                className="kp-textarea"
                rows={8}
                readOnly
                value={decoded.text}
                placeholder="Decoded text will appear here…"
                style={{ cursor: 'text' }}
              />
            )}
            {mode === 'decode' && !decoded && (
              <textarea
                className="kp-textarea"
                rows={8}
                readOnly
                value=""
                placeholder="Decoded text will appear here…"
                style={{ cursor: 'text' }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
