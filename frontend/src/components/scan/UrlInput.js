'use client'

import { useState } from 'react'

// ─────────────────────────────────────────────
// UrlInput — URL text field with validation
//
// Validates that the value:
//   1. Is not empty
//   2. Starts with http:// or https://
//   3. Contains at least one dot (basic domain check)
//
// Props:
//   value       — controlled value string
//   onChange    — (value: string) => void
//   disabled    — boolean
//   onSubmit    — () => void  (called when Enter pressed)
// ─────────────────────────────────────────────

function validateUrl(url) {
  if (!url || url.trim() === '') return null  // null = not validated yet

  try {
    const parsed = new URL(url.trim())
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'URL must start with https:// or http://'
    }
    if (!parsed.hostname.includes('.')) {
      return 'Please enter a valid domain (e.g. https://example.com)'
    }
    return ''  // empty string = valid
  } catch {
    return 'Please enter a valid URL (e.g. https://example.com)'
  }
}

export default function UrlInput({
  value     = '',
  onChange,
  disabled  = false,
  onSubmit,
}) {
  const [touched, setTouched] = useState(false)
  const error = touched ? validateUrl(value) : null
  const isValid = validateUrl(value) === ''

  function handleChange(e) {
    onChange?.(e.target.value)
  }

  function handleBlur() {
    setTouched(true)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && isValid && !disabled) {
      onSubmit?.()
    }
  }

  // Paste handler: auto-prepend https:// if missing
  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').trim()
    if (pasted && !pasted.startsWith('http://') && !pasted.startsWith('https://')) {
      e.preventDefault()
      onChange?.(`https://${pasted}`)
    }
  }

  return (
    <div className="w-full">
      {/* Label — visually hidden but screen-reader accessible */}
      <label
        htmlFor="url-input"
        className="block text-sm font-medium text-slate-700 mb-2"
      >
        Website URL to scan
      </label>

      <div className="relative">
        {/* Globe icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4" aria-hidden="true">
          <svg
            className={`w-5 h-5 transition-colors duration-150 ${
              isValid ? 'text-pilot-500' : 'text-slate-400'
            }`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
        </div>

        <input
          id="url-input"
          type="url"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder="https://example.com"
          autoComplete="url"
          spellCheck={false}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'url-error' : 'url-hint'}
          className={`
            w-full pl-12 pr-4 py-4
            text-base font-medium text-slate-900 placeholder-slate-400
            bg-white border-2 rounded-2xl
            outline-none transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-critical-500 focus:border-critical-500 focus:ring-4 focus:ring-critical-100'
              : isValid
                ? 'border-minor-500 focus:border-pilot-500 focus:ring-4 focus:ring-pilot-100'
                : 'border-slate-200 focus:border-pilot-500 focus:ring-4 focus:ring-pilot-100'
            }
          `}
        />

        {/* Valid checkmark */}
        {isValid && !disabled && (
          <div
            className="absolute inset-y-0 right-4 flex items-center"
            aria-hidden="true"
          >
            <svg className="w-5 h-5 text-minor-500" fill="none" stroke="currentColor"
              viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p id="url-error" role="alert" className="mt-2 text-sm text-critical-600 flex items-center gap-1.5">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor"
            viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}

      {/* Hint text */}
      {!error && (
        <p id="url-hint" className="mt-2 text-xs text-slate-400">
          Enter any public website URL — AccessPilot will scan it for WCAG 2.1 AA violations.
          Press Enter or click Scan.
        </p>
      )}
    </div>
  )
}
