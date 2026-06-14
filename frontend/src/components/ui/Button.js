'use client'

// ─────────────────────────────────────────────
// Button — AccessPilot reusable button component
//
// Variants: primary | secondary | ghost | danger
// Sizes:    sm | md | lg
// ─────────────────────────────────────────────

const VARIANTS = {
  primary: `
    bg-pilot-500 hover:bg-pilot-600 active:bg-pilot-700
    text-white border border-pilot-500
    shadow-sm hover:shadow-md
    hover:-translate-y-px
  `,
  secondary: `
    bg-white hover:bg-slate-50 active:bg-slate-100
    text-pilot-600 border border-slate-200
    shadow-sm hover:shadow-md hover:border-pilot-300
    hover:-translate-y-px
  `,
  ghost: `
    bg-transparent hover:bg-slate-100 active:bg-slate-200
    text-slate-600 hover:text-slate-900
    border border-transparent
  `,
  danger: `
    bg-critical-600 hover:bg-critical-700 active:bg-critical-700
    text-white border border-critical-600
    shadow-sm hover:shadow-md
    hover:-translate-y-px
  `,
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2   text-sm rounded-xl gap-2',
  lg: 'px-6 py-3   text-base rounded-xl gap-2.5',
}

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  loading  = false,
  onClick,
  type     = 'button',
  className = '',
  icon,
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150 ease-out
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-pilot-500 focus-visible:ring-offset-2
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size]       || SIZES.md}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}

      {/* Optional left icon (when not loading) */}
      {!loading && icon && (
        <span className="shrink-0" aria-hidden="true">{icon}</span>
      )}

      {children}
    </button>
  )
}
