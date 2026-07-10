import ThemeToggle from './ThemeToggle'

const LINKEDIN_URL = 'https://www.linkedin.com/in/leonardo-studart'
const EMAIL = 'leonardo.studart@bell.ca'

export default function Header() {
  return (
    <header style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      <div
        style={{
          maxWidth: '64rem',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
            Leonardo Studart
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Senior Frontend Developer
          </p>
        </div>

        <nav aria-label="Contact and preferences" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
            LinkedIn
          </a>
          <a href={`mailto:${EMAIL}`} aria-label={`Send email to ${EMAIL}`} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
            Email
          </a>
          <a href="/cv.pdf" download aria-label="Download CV as PDF" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
            CV
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
