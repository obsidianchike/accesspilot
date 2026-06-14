'use client'

// ─────────────────────────────────────────────
// ScanButton — AccessPilot main scan CTA button
//
// Shows three states:
//   idle     → "Scan for Accessibility Issues"
//   scanning → "Scanning…" (with spinner)
//   complete → "Scan Another Site"
// ─────────────────────────────────────────────

export default function ScanButton({
  onClick,
  state     = 'idle',    // 'idle' | 'scanning' | 'complete'
  disabled  = false,
  className = '',
}) {
  const isScanning = state === 'scanning'
  const isComplete = state === 'complete'
  const isDisabled = disabled || isScanning

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isScanning}
      aria-label={
        isScanning ? 'Scanning in progress, please wait' :
        isComplete  ? 'Scan another website' :
                      'Start accessibility scan'
      }
      className={`
        relative w-full sm:w-auto
        inline-flex items-center justify-center gap-3
        px-8 py-4 rounded-2xl
        text-base font-semibold
        transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-pilot-500 focus-visible:ring-offset-2
        ${isDisabled
          ? 'opacity-60 cursor-not-allowed bg-pilot-400 text-white'
          : isComplete
            ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
            : 'bg-pilot-500 hover:bg-pilot-600 active:bg-pilot-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
        }
        ${className}
      `}
    >
      {/* Scanning state: spinner */}
      {isScanning && (
        <span
          className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"
          aria-hidden="true"
        />
      )}

      {/* Idle state: radar icon */}
      {!isScanning && !isComplete && (
        <svg
          className="w-5 h-5"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Radar / scan icon */}
          <circle cx="12" cy="12" r="2"/>
          <path d="M16.24 7.76a6 6 0 010 8.49m-8.49-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14"/>
        </svg>
      )}

      {/* Complete state: refresh icon */}
      {isComplete && (
        <svg
          className="w-5 h-5"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      )}

      {/* Button label */}
      <span>
        {isScanning && 'Scanning…'}
        {isComplete  && 'Scan Another Site'}
        {!isScanning && !isComplete && 'Scan for Accessibility Issues'}
      </span>

      {/* Shimmer pulse effect during scan */}
      {isScanning && (
        <span
          className="absolute inset-0 rounded-2xl overflow-hidden"
          aria-hidden="true"
        >
          <span className="
            absolute inset-0 -translate-x-full
            bg-gradient-to-r from-transparent via-white/20 to-transparent
            animate-[shimmer_1.5s_ease-in-out_infinite]
          "/>
        </span>
      )}
    </button>
  )
}
