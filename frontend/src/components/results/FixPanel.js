'use client'

import { useState } from 'react'

// ─────────────────────────────────────────────
// FixPanel — before / after code diff view
//
// Shows the original broken HTML and the AI-generated fix
// side by side (or stacked on mobile) with copy buttons.
//
// Props:
//   original  — string  (the broken htmlSnippet)
//   fixed     — string  (the AI-generated fixedHTML)
//   ariaFix   — string  (optional ARIA alternative)
// ─────────────────────────────────────────────

function CodeBlock({ code, label, variant = 'neutral' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text
    }
  }

  const bgClass = {
    bad:     'bg-critical-50  border-critical-200',
    good:    'bg-minor-50     border-minor-200',
    neutral: 'bg-slate-50     border-slate-200',
  }[variant]

  const labelClass = {
    bad:     'text-critical-700',
    good:    'text-minor-700',
    neutral: 'text-slate-500',
  }[variant]

  return (
    <div className={`rounded-xl border overflow-hidden ${bgClass}`}>
      {/* Label bar */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${bgClass}`}>
        <span className={`text-xs font-semibold uppercase tracking-wider ${labelClass}`}>
          {label}
        </span>
        <button
          onClick={handleCopy}
          aria-label={`Copy ${label} code`}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors duration-100"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-minor-500" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="
        p-4 text-xs font-mono leading-relaxed
        overflow-x-auto whitespace-pre-wrap break-words
        text-slate-800
      ">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function FixPanel({ original, fixed, ariaFix }) {
  const [showAria, setShowAria] = useState(false)

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        AI-Generated Fix
      </h4>

      {/* Before / After grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CodeBlock
          code={original || '<!-- original code not available -->'}
          label="❌ Before (broken)"
          variant="bad"
        />
        <CodeBlock
          code={fixed || '<!-- fix not generated -->'}
          label="✅ After (fixed)"
          variant="good"
        />
      </div>

      {/* ARIA alternative (optional) */}
      {ariaFix && (
        <div>
          <button
            onClick={() => setShowAria(prev => !prev)}
            className="text-xs text-pilot-600 hover:text-pilot-800 font-medium flex items-center gap-1 transition-colors"
            aria-expanded={showAria}
            aria-controls="aria-fix-panel"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-150 ${showAria ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
            {showAria ? 'Hide' : 'Show'} ARIA alternative
          </button>

          {showAria && (
            <div id="aria-fix-panel" className="mt-2">
              <CodeBlock
                code={ariaFix}
                label="ARIA alternative"
                variant="neutral"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
