'use client'

// ─────────────────────────────────────────────
// Spinner — accessible loading spinner
// ─────────────────────────────────────────────

const SIZES = {
  xs:  'w-3 h-3 border',
  sm:  'w-4 h-4 border-2',
  md:  'w-6 h-6 border-2',
  lg:  'w-8 h-8 border-2',
  xl:  'w-12 h-12 border-[3px]',
}

const COLORS = {
  blue:  'border-pilot-500  border-t-transparent',
  white: 'border-white      border-t-transparent',
  gray:  'border-slate-400  border-t-transparent',
}

export default function Spinner({
  size      = 'md',
  color     = 'blue',
  label     = 'Loading…',
  className = '',
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block rounded-full animate-spin ${SIZES[size]} ${COLORS[color]} ${className}`}
    />
  )
}
