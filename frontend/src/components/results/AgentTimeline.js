'use client'

import { AGENTS } from '../../lib/constants'

// ─────────────────────────────────────────────
// AgentTimeline — shows each agent's run,
// duration, and completion message.
//
// Props:
//   agentTimeline — array from the report JSON:
//   [{ agent, status, durationMs, message }]
// ─────────────────────────────────────────────

// Map agent names to the AGENTS config for icons and colors
const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.name, a]))

function formatMs(ms) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function AgentTimeline({ agentTimeline = [] }) {
  const totalMs = agentTimeline.reduce((sum, a) => sum + (a.durationMs || 0), 0)

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            Agent Execution Timeline
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Four AI agents ran in sequence to produce your report
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-lg font-bold font-display text-slate-900">
            {formatMs(totalMs)}
          </div>
          <div className="text-xs text-slate-400">total runtime</div>
        </div>
      </div>

      {/* Timeline */}
      <ol className="space-y-0" aria-label="Agent execution steps">
        {agentTimeline.map((step, index) => {
          const agentConfig = AGENT_MAP[step.agent] || {}
          const isLast      = index === agentTimeline.length - 1

          return (
            <li key={step.agent} className="agent-step relative flex gap-4">

              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className="absolute left-5 top-10 bottom-0 w-px bg-slate-100"
                  aria-hidden="true"
                />
              )}

              {/* Icon bubble */}
              <div
                className="relative z-10 flex-shrink-0 w-10 h-10 rounded-xl
                           flex items-center justify-center text-lg
                           bg-pilot-50 border border-pilot-100 mt-1"
                aria-hidden="true"
              >
                {agentConfig.icon || '🤖'}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-5 ${isLast ? '' : ''}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {step.agent} Agent
                    </span>
                    {/* Status badge */}
                    <span className="
                      inline-flex items-center gap-1 text-xs font-medium
                      bg-minor-50 text-minor-700 border border-minor-200
                      px-2 py-0.5 rounded-full
                    ">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round"
                        strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Complete
                    </span>
                  </div>

                  {/* Duration */}
                  <span className="
                    text-xs font-mono font-medium text-slate-400
                    bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md
                  "
                    aria-label={`Duration: ${formatMs(step.durationMs)}`}
                  >
                    {formatMs(step.durationMs)}
                  </span>
                </div>

                {/* Message */}
                <p className="text-sm text-slate-500 mt-0.5">
                  {step.message}
                </p>

                {/* Duration bar */}
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1" aria-hidden="true">
                  <div
                    className="bg-pilot-400 h-1 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (step.durationMs / totalMs) * 100 * 2)}%` }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {/* Footer note */}
      <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
          viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Agents run sequentially — each passes its output to the next.
        Total: {formatMs(totalMs)}.
      </p>
    </div>
  )
}
