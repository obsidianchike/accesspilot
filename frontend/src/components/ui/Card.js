'use client'

// ─────────────────────────────────────────────
// Card — AccessPilot generic card wrapper
//
// Variants: default | elevated | flat | highlight
// ─────────────────────────────────────────────

const VARIANTS = {
  default:   'bg-white border border-slate-200 shadow-sm',
  elevated:  'bg-white border border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-200',
  flat:      'bg-slate-50 border border-slate-100',
  highlight: 'bg-pilot-50 border border-pilot-200',
  glass:     'glass',
}

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

export default function Card({
  children,
  variant   = 'default',
  padding   = 'md',
  radius    = 'rounded-2xl',
  className = '',
  as: Tag   = 'div',
  ...props
}) {
  return (
    <Tag
      className={`
        ${VARIANTS[variant] || VARIANTS.default}
        ${PADDING[padding]  || PADDING.md}
        ${radius}
        ${className}
      `}
      {...props}
    >
      {children}
    </Tag>
  )
}

// ─── Sub-components ───────────────────────────

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-base font-semibold text-slate-900 font-display ${className}`}>
      {children}
    </h3>
  )
}

Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-slate-100 ${className}`}>
      {children}
    </div>
  )
}
