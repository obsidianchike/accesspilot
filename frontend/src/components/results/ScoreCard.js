'use client'

import ScoreRing from '../ui/ScoreRing'
import { getScoreGrade } from '../../lib/scoring'
import { SEVERITY } from '../../lib/constants'

// ─────────────────────────────────────────────
// ScoreCard — top-level results summary
//
// Shows: score ring, grade, total violation counts by severity,
//        passes count, and the scanned URL.
// ─────────────────────────────────────────────

export default function ScoreCard({ result }) {
  const { score, summary, url, pageTitle } = result
  const { label } = getScoreGrade(score)

  const severityCounts = [
    { key: 'critical', count: summary.critical },
    { key: 'serious',  count: summary.serious  },
    { key: 'moderate', count: summary.moderate },
    { key: 'minor',    count: summary.minor    },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">

      {/* Scanned URL banner */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 pb-5 border-b border-slate-100">
        <svg className="w-4 h-4 shrink-0 text-pilot-400" fill="none" stroke="currentColor"
          viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
        </svg>
        <span className="truncate font-medium text-slate-700" title={url}>{url}</span>
        {pageTitle && (
          <span className="hidden sm:inline text-slate-400">— {pageTitle}</span>
        )}
      </div>

      {/* Main content: ring + summary */}
      <div className="flex flex-col sm:flex-row items-center gap-8">

        {/* Score ring */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 pb-6">
          <ScoreRing score={score} size="lg" animate />
          <p className="mt-6 text-xs text-slate-400 font-medium uppercase tracking-wider">
            Accessibility Score
          </p>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px self-stretch bg-slate-100" aria-hidden="true" />
        <div className="sm:hidden w-full h-px bg-slate-100" aria-hidden="true" />

        {/* Stats grid */}
        <div className="flex-1 w-full">
          {/* Severity breakdown */}
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Violations by Severity
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {severityCounts.map(({ key, count }) => {
              const sev = SEVERITY[key]
              return (
                <div
                  key={key}
                  className="rounded-xl p-3 text-center border"
                  style={{
                    background:   sev.bg,
                    borderColor:  sev.border,
                  }}
                  aria-label={`${sev.label}: ${count} violation${count !== 1 ? 's' : ''}`}
                >
                  <div
                    className="text-2xl font-bold font-display"
                    style={{ color: sev.color }}
                  >
                    {count}
                  </div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: sev.text }}>
                    {sev.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Passes + total row */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-minor-500" aria-hidden="true" />
              <strong>{summary.passes}</strong> rules passed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-serious-500" aria-hidden="true" />
              <strong>{summary.total}</strong> violations found
            </span>
            {summary.incomplete > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
                <strong>{summary.incomplete}</strong> needs manual review
              </span>
            )}
          </div>
        </div>
      </div>

      {/* WCAG compliance note */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor"
          viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Audited against WCAG 2.1 Level AA · Powered by axe-core + Azure OpenAI GPT-4o
      </div>
    </div>
  )
}
