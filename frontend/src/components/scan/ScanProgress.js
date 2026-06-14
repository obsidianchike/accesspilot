'use client'

import { AGENTS } from '../../lib/constants'
import Spinner from '../ui/Spinner'

// ─────────────────────────────────────────────
// ScanProgress — live agent pipeline status
//
// Receives `progress` (array of completed agent names)
// and renders each agent as: pending → running → complete
//
// Props:
//   progress — string[]  e.g. ['Scanner', 'Reasoning']
// ─────────────────────────────────────────────

export default function ScanProgress({ progress = [] }) {
  // Determine the index of the currently running agent
  const completedCount = progress.length
  const currentIndex   = completedCount < AGENTS.length ? completedCount : -1

  return (
    <div
      role="status"
      aria-label="Agent pipeline progress"
      aria-live="polite"
      className="w-full max-w-xl mx-auto"
    >
      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          AccessPilot is scanning…
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
  Four AI agents are working on your report
</p>
<p className="text-slate-400 mt-1 text-xs">
  Large sites like BBC can take up to 60 seconds — please wait ⏱️
</p>
      </div>

      {/* Agent steps */}
      <div className="space-y-3">
        {AGENTS.map((agent, index) => {
          const isComplete = progress.includes(agent.name) ||
                             AGENTS.slice(0, index).every(a => progress.includes(a.name)) &&
                             progress.length > index
          // Simpler check:
          const isDone     = index < completedCount
          const isRunning  = index === currentIndex
          const isPending  = index > currentIndex

          return (
            <div
              key={agent.key}
              className={`
                agent-step
                flex items-center gap-4 p-4 rounded-xl border
                transition-all duration-300
                ${isDone    ? 'bg-minor-50  border-minor-200' : ''}
                ${isRunning ? 'bg-pilot-50  border-pilot-200 shadow-sm' : ''}
                ${isPending ? 'bg-slate-50  border-slate-100 opacity-50' : ''}
              `}
              aria-label={`${agent.name}: ${isDone ? 'complete' : isRunning ? 'running' : 'pending'}`}
            >
              {/* Status icon */}
              <div
                className={`
                  flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                  text-lg font-bold transition-all duration-300
                  ${isDone    ? 'bg-minor-100' : ''}
                  ${isRunning ? 'bg-pilot-100' : ''}
                  ${isPending ? 'bg-slate-100' : ''}
                `}
                aria-hidden="true"
              >
                {isDone    ? '✓' : agent.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`
                    font-semibold text-sm
                    ${isDone    ? 'text-minor-800'  : ''}
                    ${isRunning ? 'text-pilot-800'  : ''}
                    ${isPending ? 'text-slate-400'  : ''}
                  `}>
                    {agent.name}
                  </span>

                  {isRunning && (
                    <span className="
                      text-xs font-medium text-pilot-600
                      bg-pilot-100 px-2 py-0.5 rounded-full
                    ">
                      Running
                    </span>
                  )}
                  {isDone && (
                    <span className="
                      text-xs font-medium text-minor-700
                      bg-minor-100 px-2 py-0.5 rounded-full
                    ">
                      Done
                    </span>
                  )}
                </div>
                <p className={`
                  text-xs mt-0.5 truncate
                  ${isDone    ? 'text-minor-600' : ''}
                  ${isRunning ? 'text-pilot-600' : ''}
                  ${isPending ? 'text-slate-400' : ''}
                `}>
                  {agent.description}
                </p>
              </div>

              {/* Right: spinner or checkmark */}
              <div className="flex-shrink-0" aria-hidden="true">
                {isRunning && <Spinner size="sm" color="blue" />}
                {isDone && (
                  <svg className="w-5 h-5 text-minor-500" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-6" aria-hidden="true">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>{completedCount} of {AGENTS.length} agents complete</span>
          <span>{Math.round((completedCount / AGENTS.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className="bg-pilot-500 h-1.5 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(completedCount / AGENTS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
