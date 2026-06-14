'use client'

import { useState } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import UrlInput from '../components/scan/UrlInput'
import ScanButton from '../components/scan/ScanButton'
import ScanProgress from '../components/scan/ScanProgress'
import ScoreCard from '../components/results/ScoreCard'
import AgentTimeline from '../components/results/AgentTimeline'
import ViolationList from '../components/results/ViolationList'
import CoachSummary from '../components/results/CoachSummary'
import ReportDownload from '../components/results/ReportDownload'
import { useScan } from '../hooks/useScan'

// ─────────────────────────────────────────────
// page.js — AccessPilot Home Page
//
// Three visual states:
//   1. IDLE     — hero + URL input form
//   2. SCANNING — agent progress timeline
//   3. COMPLETE — full results dashboard
// ─────────────────────────────────────────────

export default function HomePage() {
  const [url, setUrl] = useState('')

  const {
    state,
    result,
    error,
    progress,
    startScan,
    reset,
    isIdle,
    isScanning,
    isComplete,
    isError,
  } = useScan()

  function handleScan() {
    if (!url.trim()) return
    startScan(url.trim())
  }

  function handleReset() {
    setUrl('')
    reset()
  }

  // ── Validate URL (basic) for button disabled state
  function isValidUrl(value) {
    try {
      const parsed = new URL(value)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main id="main-content" className="flex-1">

        {/* ═══════════════════════════════════════
            STATE 1: IDLE — Hero + URL input
        ═══════════════════════════════════════ */}
        {isIdle && (
          <div className="relative overflow-hidden">

            {/* Mesh gradient background */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background: `
                  radial-gradient(at 20% 30%, rgba(51,102,244,0.08) 0px, transparent 50%),
                  radial-gradient(at 80% 10%, rgba(99,102,241,0.06) 0px, transparent 50%),
                  radial-gradient(at 50% 80%, rgba(30,58,138,0.05) 0px, transparent 50%)
                `,
              }}
            />

            {/* Hero content */}
            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">

              {/* Hackathon badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-pilot-200
                              bg-pilot-50 px-4 py-1.5 text-xs font-semibold text-pilot-700 mb-8">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Microsoft" role="img">
                  <rect x="0" y="0" width="5.5" height="5.5" fill="#f25022" rx="0.4"/>
                  <rect x="6.5" y="0" width="5.5" height="5.5" fill="#7fba00" rx="0.4"/>
                  <rect x="0" y="6.5" width="5.5" height="5.5" fill="#00a4ef" rx="0.4"/>
                  <rect x="6.5" y="6.5" width="5.5" height="5.5" fill="#ffb900" rx="0.4"/>
                </svg>
                Microsoft Agents League Hackathon 2026
              </div>

              {/* Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight text-balance mb-6">
                Make your website
                <span className="text-pilot-500 block sm:inline"> accessible</span>
                {' '}for everyone
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed text-balance">
                AccessPilot scans any website, identifies WCAG accessibility barriers,
                and generates AI-powered fixes — in seconds.
              </p>

              {/* Scan form */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
                  <div className="space-y-4">
                    <UrlInput
                      value={url}
                      onChange={setUrl}
                      disabled={isScanning}
                      onSubmit={handleScan}
                    />
                    <ScanButton
                      onClick={handleScan}
                      state={state}
                      disabled={!isValidUrl(url)}
                    />
                  </div>
                </div>

                {/* Example URLs */}
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-slate-500">
                  <span>Try:</span>
                  {[
                    'https://example.com',
                    'https://www.bbc.co.uk',
                    'https://gov.uk',
                  ].map(sample => (
                    <button
                      key={sample}
                      onClick={() => setUrl(sample)}
                      className="text-pilot-600 hover:text-pilot-800 font-medium hover:underline
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pilot-500 rounded"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature pills */}
              <div className="mt-16 flex flex-wrap justify-center gap-3">
                {[
                  { icon: '🔍', label: 'WCAG 2.1 AA Audit'     },
                  { icon: '🧠', label: 'AI Severity Analysis'   },
                  { icon: '🔧', label: 'Auto-Generated Fixes'   },
                  { icon: '🎯', label: 'Developer Coach'        },
                  { icon: '📄', label: 'Downloadable Report'    },
                  { icon: '⚡', label: 'Powered by Azure OpenAI'},
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                               bg-white border border-slate-200 text-sm text-slate-600 shadow-sm"
                  >
                    <span aria-hidden="true">{icon}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
              <h2 className="font-display text-2xl font-bold text-slate-900 text-center mb-10">
                Four AI agents. One actionable report.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: '🔍', name: 'Scanner Agent',   desc: 'Loads your page with Puppeteer and runs a full axe-core WCAG 2.1 audit.',       color: 'bg-pilot-50 border-pilot-200'    },
                  { icon: '🧠', name: 'Reasoning Agent', desc: 'Azure OpenAI classifies each violation by severity and explains the user impact.', color: 'bg-purple-50 border-purple-200'  },
                  { icon: '🔧', name: 'Fix Agent',       desc: 'GPT-4o generates corrected HTML and ARIA code for every violation found.',         color: 'bg-cyan-50   border-cyan-200'    },
                  { icon: '🎯', name: 'Coach Agent',     desc: 'Produces a plain-English action plan with prioritised fixes and learning tips.',    color: 'bg-minor-50  border-minor-200'   },
                ].map((agent, i) => (
                  <div
                    key={agent.name}
                    className={`rounded-2xl border p-5 ${agent.color}`}
                  >
                    <div className="text-2xl mb-3" aria-hidden="true">{agent.icon}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-display font-bold text-slate-900 text-sm">
                        {agent.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{agent.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            STATE 2: SCANNING — Agent progress
        ═══════════════════════════════════════ */}
        {isScanning && (
          <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24">
            <ScanProgress progress={progress} />
          </div>
        )}

        {/* ═══════════════════════════════════════
            STATE 3: ERROR
        ═══════════════════════════════════════ */}
        {isError && (
          <div className="mx-auto max-w-xl px-4 sm:px-6 py-24 text-center">
            <div className="bg-white border border-critical-200 rounded-3xl p-10 shadow-sm">
              <div className="text-4xl mb-4" aria-role="img" aria-label="Error">❌</div>
              <h2 className="font-display text-xl font-bold text-slate-900 mb-2">
                Scan failed
              </h2>
              <p className="text-slate-500 text-sm mb-6">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-pilot-500 hover:bg-pilot-600 text-white
                           font-semibold rounded-xl transition-colors duration-150
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pilot-500"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            STATE 4: COMPLETE — Full dashboard
        ═══════════════════════════════════════ */}
        {isComplete && result && (
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">

            {/* Top action bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  Accessibility Report
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  AccessPilot scanned <span className="font-medium text-slate-700">{result.url}</span>
                </p>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                           border border-slate-200 bg-white text-sm font-medium text-slate-600
                           hover:bg-slate-50 hover:border-slate-300 transition-all duration-150
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pilot-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                Scan another site
              </button>
            </div>

            {/* Score card */}
            <ScoreCard result={result} />

            {/* Agent timeline */}
            <AgentTimeline agentTimeline={result.agentTimeline} />

            {/* Coach summary */}
            <CoachSummary coachSummary={result.coachSummary} />

            {/* Violations list */}
            <ViolationList violations={result.violations} />

            {/* Report download */}
            <ReportDownload result={result} />

          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
