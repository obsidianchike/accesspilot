'use client'

// ─────────────────────────────────────────────
// Footer — AccessPilot footer
// ─────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Left: logo + pitch */}
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="font-display text-base font-bold text-slate-900">
              Access<span className="text-pilot-500">Pilot</span>
            </span>
            <p className="text-sm text-slate-500 text-center sm:text-left max-w-xs">
              AI-powered accessibility copilot — making the web accessible for everyone.
            </p>
          </div>

          {/* Centre: compliance note */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Audits against WCAG 2.1 Level AA
          </div>

          {/* Right: powered-by + year */}
          <div className="flex flex-col items-center sm:items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              Powered by
              {/* Microsoft logo */}
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-label="Microsoft" role="img">
                <rect x="0" y="0" width="5.5" height="5.5" fill="#f25022" rx="0.4"/>
                <rect x="6.5" y="0" width="5.5" height="5.5" fill="#7fba00" rx="0.4"/>
                <rect x="0" y="6.5" width="5.5" height="5.5" fill="#00a4ef" rx="0.4"/>
                <rect x="6.5" y="6.5" width="5.5" height="5.5" fill="#ffb900" rx="0.4"/>
              </svg>
              Azure OpenAI &amp; axe-core
            </div>
            <span className="text-xs text-slate-300">
              © {year} AccessPilot · Microsoft Agents League Hackathon
            </span>
          </div>

        </div>
      </div>
    </footer>
  )
}
