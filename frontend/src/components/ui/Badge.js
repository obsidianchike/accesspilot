'use client'

// ─────────────────────────────────────────────
// Badge — AccessPilot severity badge
//
// Renders a colour-coded pill for:
//   critical | serious | moderate | minor
//
// Also supports generic status badges via the `variant` prop.
// ─────────────────────────────────────────────

const SEVERITY_STYLES = {
  critical: {
    container: 'bg-critical-50  text-critical-700  border-critical-100',
    dot:       'bg-critical-500',
    label:     'Critical',
    icon:      '●',
  },
  serious: {
    container: 'bg-serious-50   text-serious-700   border-serious-100',
    dot:       'bg-serious-500',
    label:     'Serious',
    icon:      '●',
  },
  moderate: {
    container: 'bg-moderate-50  text-moderate-700  border-moderate-100',
    dot:       'bg-moderate-500',
    label:     'Moderate',
    icon:      '●',
  },
  minor: {
    container: 'bg-minor-50     text-minor-700     border-minor-100',
    dot:       'bg-minor-500',
    label:     'Minor',
    icon:      '●',
  },
  // Generic status badges
  complete: {
    container: 'bg-minor-50     text-minor-700     border-minor-100',
    dot:       'bg-minor-500',
    label:     'Complete',
    icon:      '✓',
  },
  running: {
    container: 'bg-pilot-50     text-pilot-700     border-pilot-100',
    dot:       'bg-pilot-500 animate-pulse',
    label:     'Running',
    icon:      '●',
  },
  pending: {
    container: 'bg-slate-100    text-slate-500     border-slate-200',
    dot:       'bg-slate-400',
    label:     'Pending',
    icon:      '○',
  },
}

export default function Badge({
  variant   = 'minor',
  label,
  showDot   = true,
  size      = 'sm',
  className = '',
}) {
  const styles     = SEVERITY_STYLES[variant] || SEVERITY_STYLES.minor
  const displayLabel = label || styles.label

  const sizeClasses = size === 'xs'
    ? 'text-xs px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5'

  return (
    <span
      className={`
        inline-flex items-center font-semibold
        border rounded-full tracking-wide
        ${sizeClasses}
        ${styles.container}
        ${className}
      `}
      // Announce severity to screen readers
      aria-label={`Severity: ${displayLabel}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`}
          aria-hidden="true"
        />
      )}
      {displayLabel}
    </span>
  )
}
