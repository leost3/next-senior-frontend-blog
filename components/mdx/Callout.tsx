import type { ReactNode } from 'react'

type Variant = 'info' | 'warn' | 'danger'

type Props = {
  variant?: Variant
  children: ReactNode
}

const variantStyles: Record<Variant, { border: string; background: string; icon: string }> = {
  info:   { border: 'var(--callout-info-border)',   background: 'var(--callout-info-bg)',   icon: 'ℹ' },
  warn:   { border: 'var(--callout-warn-border)',   background: 'var(--callout-warn-bg)',   icon: '⚠' },
  danger: { border: 'var(--callout-danger-border)', background: 'var(--callout-danger-bg)', icon: '✕' },
}

export default function Callout({ variant = 'info', children }: Props) {
  const { border, background, icon } = variantStyles[variant]

  return (
    <aside
      data-variant={variant}
      role="note"
      style={{
        borderLeft: `4px solid ${border}`,
        backgroundColor: background,
        borderRadius: '0 0.375rem 0.375rem 0',
        padding: '1rem 1.25rem',
        margin: '1.5rem 0',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '1rem', lineHeight: 1.6, flexShrink: 0 }}>
        {icon}
      </span>
      <div style={{ lineHeight: 1.6 }}>{children}</div>
    </aside>
  )
}
