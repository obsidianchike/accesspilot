'use client'

import { useReport } from '../../hooks/useReport'
import Button from '../ui/Button'

// ─────────────────────────────────────────────
// ReportDownload — download buttons for the full report
//
// Props:
//   result — the full AccessPilot report object
// ─────────────────────────────────────────────

export default function ReportDownload({ result }) {
  const { downloadJSON, downloadPDF } = useReport(result)

  if (!result) return null

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-pilot-50 border border-pilot-100
                        flex items-center justify-center" aria-hidden="true">
          <svg className="w-5 h-5 text-pilot-500" fill="none" stroke="currentColor"
            viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div>
          <h2 className="font-display font-bold text-slate-900">Download Report</h2>
          <p className="text-sm text-slate-500">
            Save your full AccessPilot accessibility report
          </p>
        </div>
      </div>

      {/* Download options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* JSON download */}
        <button
          onClick={downloadJSON}
          className="
            group flex items-center gap-4 p-4 rounded-xl
            border-2 border-slate-200 hover:border-pilot-300
            bg-slate-50 hover:bg-pilot-50
            transition-all duration-150 text-left
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-pilot-500 focus-visible:ring-offset-1
          "
          aria-label="Download full report as JSON file"
        >
          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200
                          flex items-center justify-center flex-shrink-0
                          group-hover:border-pilot-200 transition-colors" aria-hidden="true">
            <svg className="w-5 h-5 text-slate-500 group-hover:text-pilot-500 transition-colors"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-slate-900 group-hover:text-pilot-700 transition-colors">
              Download JSON
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Full report data · use with your CI/CD pipeline
            </div>
          </div>
          <svg className="w-4 h-4 text-slate-300 group-hover:text-pilot-400 ml-auto flex-shrink-0 transition-colors"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>

        {/* PDF download */}
        <button
          onClick={downloadPDF}
          className="
            group flex items-center gap-4 p-4 rounded-xl
            border-2 border-slate-200 hover:border-pilot-300
            bg-slate-50 hover:bg-pilot-50
            transition-all duration-150 text-left
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-pilot-500 focus-visible:ring-offset-1
          "
          aria-label="Download formatted PDF report via browser print dialog"
        >
          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200
                          flex items-center justify-center flex-shrink-0
                          group-hover:border-pilot-200 transition-colors" aria-hidden="true">
            <svg className="w-5 h-5 text-slate-500 group-hover:text-pilot-500 transition-colors"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-slate-900 group-hover:text-pilot-700 transition-colors">
              Download PDF
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Formatted report · share with your team
            </div>
          </div>
          <svg className="w-4 h-4 text-slate-300 group-hover:text-pilot-400 ml-auto flex-shrink-0 transition-colors"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>

      {/* Scan metadata footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-400">
        <span>Scan ID: <code className="font-mono text-slate-600">{result.scanId}</code></span>
        <span>·</span>
        <span>{new Date(result.timestamp).toLocaleString()}</span>
        <span>·</span>
        <span>WCAG 2.1 Level AA</span>
      </div>
    </div>
  )
}
