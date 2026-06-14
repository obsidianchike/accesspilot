'use client'

import { useState } from 'react'
import Badge from '../ui/Badge'
import FixPanel from './FixPanel'

// ─────────────────────────────────────────────
// ViolationCard — single accessibility violation
//
// Collapsible card showing:
//   • Severity badge + rule name
//   • WCAG reference
//   • User impact (from Reasoning Agent)
//   • AI explanation
//   • Fix panel (from Fix Agent)
//   • Coach tip (from Coach Agent)
//   • Recommendation
// ─────────────────────────────────────────────

export default function ViolationCard({ violation, index = 0 }) {
  const [expanded, setExpanded] = useState(false)

  const {
    id,
    description,
    severity,
    wcagRef,
    wcagLevel,
    userImpact,
    explanation,
    htmlSnippet,
    fixedHTML,
    ariaFix,
    recommendation,
    coachTip,
  } = violation

  const cardId = `violation-${id}-${index}`

  return (
    <div
      className="violation-card bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* ── Card header (always visible, clickable) ── */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
        aria-controls={`${cardId}-body`}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors duration-100 group"
      >
        {/* Severity badge */}
        <div className="flex-shrink-0 pt-0.5">
          <Badge variant={severity} />
        </div>

        {/* Main text */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm leading-snug">
            {description}
          </p>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {wcagRef} · {wcagLevel}
          </p>
        </div>

        {/* Expand/collapse chevron */}
        <div className="flex-shrink-0 flex items-center gap-2 pt-0.5" aria-hidden="true">
          <span className="text-xs text-slate-400 hidden sm:inline group-hover:text-slate-600 transition-colors">
            {expanded ? 'Collapse' : 'View fix'}
          </span>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </button>

      {/* ── Expandable body ── */}
      {expanded && (
        <div
          id={`${cardId}-body`}
          className="border-t border-slate-100 px-5 py-5 space-y-5 animate-fade-in"
        >
          {/* User impact */}
          <div className="rounded-xl bg-serious-50 border border-serious-100 p-4">
            <h4 className="text-xs font-semibold text-serious-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
              User Impact
            </h4>
            <p className="text-sm text-serious-800 leading-relaxed">{userImpact}</p>
          </div>

          {/* AI explanation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span aria-hidden="true">🧠</span> AI Explanation
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{explanation}</p>
          </div>

          {/* Fix panel */}
          <FixPanel
            original={htmlSnippet}
            fixed={fixedHTML}
            ariaFix={ariaFix}
          />

          {/* Recommendation */}
          {recommendation && (
            <div className="rounded-xl bg-pilot-50 border border-pilot-100 p-4">
              <h4 className="text-xs font-semibold text-pilot-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                Recommendation
              </h4>
              <p className="text-sm text-pilot-800 leading-relaxed">{recommendation}</p>
            </div>
          )}

          {/* Coach tip */}
          {coachTip && (
            <div className="rounded-xl bg-minor-50 border border-minor-100 p-4">
              <h4 className="text-xs font-semibold text-minor-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span aria-hidden="true">🎯</span> Coach Tip
              </h4>
              <p className="text-sm text-minor-800 leading-relaxed italic">
                "{coachTip}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
