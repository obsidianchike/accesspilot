'use client'

// ─────────────────────────────────────────────
// Header — AccessPilot top navigation bar
// ─────────────────────────────────────────────

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo + wordmark */}
          <a
            href="/"
            className="flex items-center gap-3 group"
            aria-label="AccessPilot home"
          >
            {/* Icon mark */}
            <div className="
              flex h-9 w-9 items-center justify-center rounded-xl
              bg-pilot-500 text-white shadow-sm
              group-hover:bg-pilot-600 transition-colors duration-150
            ">
              {/* Accessibility icon: person with arms raised */}
              <svg
                width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="4" r="2" />
                <path d="M7 10h10" />
                <path d="M12 6v4" />
                <path d="M9 20l3-6 3 6" />
              </svg>
            </div>

            {/* Wordmark */}
            <span className="font-display text-xl font-bold text-slate-900 tracking-tight">
              Access<span className="text-pilot-500">Pilot</span>
            </span>
          </a>

          {/* Right side: tagline + badge */}
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-sm text-slate-500">
              AI-powered accessibility copilot
            </span>

            {/* Microsoft Agents League badge */}
            <span className="
              inline-flex items-center gap-1.5 rounded-full
              border border-pilot-200 bg-pilot-50
              px-3 py-1 text-xs font-semibold text-pilot-700
            ">
              {/* Microsoft logo simplified */}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="0" y="0" width="5.5" height="5.5" fill="#f25022" rx="0.5"/>
                <rect x="6.5" y="0" width="5.5" height="5.5" fill="#7fba00" rx="0.5"/>
                <rect x="0" y="6.5" width="5.5" height="5.5" fill="#00a4ef" rx="0.5"/>
                <rect x="6.5" y="6.5" width="5.5" height="5.5" fill="#ffb900" rx="0.5"/>
              </svg>
              Agents League 2026
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
