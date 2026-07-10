import type { ReactNode } from 'react'

type Variant = 'info' | 'warn' | 'danger'

type Props = {
  variant?: Variant
  children: ReactNode
}

const variantStyles: Record<Variant, { border: string; background: string; icon: string }> = {
  info:   { border: '#0891b2', background: '#ecfeff', icon: 'ℹ' },
  warn:   { border: '#d97706', background: '#fffbeb', icon: '⚠' },
  danger: { border: '#dc2626', background: '#fef2f2', icon: '✕' },
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
