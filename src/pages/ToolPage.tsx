interface Props {
  title: string
  subtitle: string
  children: React.ReactNode
}

export default function ToolPage({ title, subtitle, children }: Props) {
  return (
    <div className="kp-tool-content">
      <main className="kp-main">
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
        {children}
      </main>
      <footer className="kp-footer">
        <span>© {new Date().getFullYear()} kevin park</span>
        <span className="pi">π</span>
      </footer>
    </div>
  )
}
