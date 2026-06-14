'use client'

import { useState, useMemo } from 'react'
import ViolationCard from './ViolationCard'
import { FILTER_TABS, SEVERITY } from '../../lib/constants'

// ─────────────────────────────────────────────
// ViolationList — full violation list with tabs
//
// Props:
//   violations — array of violation objects from the report
// ─────────────────────────────────────────────

export default function ViolationList({ violations = [] }) {
  const [activeFilter, setActiveFilter] = useState('all')

  // Filtered list based on active tab
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return violations
    return violations.filter(v => v.severity === activeFilter)
  }, [violations, activeFilter])

  // Count per severity for tab badges
  const counts = useMemo(() => {
    const result = { all: violations.length }
    violations.forEach(v => {
      result[v.severity] = (result[v.severity] || 0) + 1
    })
    return result
  }, [violations])

  if (!violations.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
        <div className="text-4xl mb-4" aria-hidden="true">✅</div>
        <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
          No violations found!
        </h3>
        <p className="text-slate-500">
          This site passed all WCAG 2.1 AA checks that axe-core could automatically verify.
        </p>
        <p className="text-xs text-slate-400 mt-3">
          Note: automated tools cover ~30–40% of WCAG criteria. Manual testing is still recommended.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Accessibility Violations
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {violations.length} issue{violations.length !== 1 ? 's' : ''} found ·
            click any card to see the AI-generated fix
          </p>
        </div>

        {/* Filter count pill */}
        {activeFilter !== 'all' && (
          <div className="text-sm text-slate-500">
            Showing <strong>{filtered.length}</strong> of <strong>{violations.length}</strong>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="Filter violations by severity"
        className="flex flex-wrap gap-2"
      >
        {FILTER_TABS.map(tab => {
          const count    = counts[tab.key] || 0
          const isActive = activeFilter === tab.key
          const sev      = tab.key !== 'all' ? SEVERITY[tab.key] : null

          // Don't show tabs with 0 violations (except "all")
          if (tab.key !== 'all' && count === 0) return null

          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(tab.key)}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                border transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-pilot-500 focus-visible:ring-offset-1
                ${isActive
                  ? sev
                    ? `text-white border-transparent`
                    : 'bg-pilot-500 text-white border-pilot-500 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
              style={isActive && sev ? { background: sev.color, borderColor: sev.color } : {}}
            >
              {tab.label}
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${isActive
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-100 text-slate-500'
                }
              `}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Empty filter state */}
      {filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-slate-500">
            No {activeFilter} violations found.
          </p>
        </div>
      )}

      {/* Violation cards */}
      <div
        role="tabpanel"
        aria-label={`${activeFilter} violations`}
        className="space-y-3"
      >
        {filtered.map((violation, index) => (
          <ViolationCard
            key={`${violation.id}-${index}`}
            violation={violation}
            index={index}
          />
        ))}
      </div>

      {/* Automated testing disclaimer */}
      <div className="text-xs text-slate-400 flex items-start gap-2 pt-2">
        <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor"
          viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
        <span>
          Automated tools detect approximately 30–40% of WCAG issues.
          Always complement automated testing with manual review and
          real screen reader testing.
        </span>
      </div>
    </div>
  )
}
