type Props = {
  before: string
  after: string
  language?: string
}

export default function CodeDiff({ before, after, language = 'text' }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        margin: '1.5rem 0',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Before
        </div>
        <pre
          data-language={language}
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem',
            padding: '1rem',
            overflow: 'auto',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <code>{before}</code>
        </pre>
      </div>

      <div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          After
        </div>
        <pre
          data-language={language}
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.375rem',
            padding: '1rem',
            overflow: 'auto',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <code>{after}</code>
        </pre>
      </div>
    </div>
  )
}
