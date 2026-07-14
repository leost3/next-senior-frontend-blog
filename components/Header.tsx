import ThemeToggle from './ThemeToggle'

const LINKEDIN_URL = 'https://www.linkedin.com/in/leonardo-studart'
const EMAIL = 'leonardo.studart@bell.ca'

const navLinkStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  color: 'var(--primary)',
  textDecoration: 'none',
  fontFamily: 'var(--font-mono)',
  fontWeight: 500,
}

export default function Header() {
  return (
    <header style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
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
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--font-size-lg)', color: 'var(--foreground)', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Leonardo Studart
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)', margin: '0.2rem 0 0', fontFamily: 'var(--font-mono)' }}>
            Senior Frontend Developer
          </p>
        </div>

        <nav aria-label="Contact and preferences" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" style={navLinkStyle}>
            LinkedIn
          </a>
          <a href={`mailto:${EMAIL}`} aria-label={`Send email to ${EMAIL}`} style={navLinkStyle}>
            Email
          </a>
          <a href="/cv.pdf" download aria-label="Download CV as PDF" style={navLinkStyle}>
            CV
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
