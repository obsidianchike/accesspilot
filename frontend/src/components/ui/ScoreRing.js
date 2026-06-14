'use client'

import { getScoreGrade, getScoreOffset } from '../../lib/scoring'

// ─────────────────────────────────────────────
// ScoreRing — animated SVG circular score ring
//
// Renders a ring that animates from 0 → score on mount.
// The --score-offset CSS variable drives the animation
// defined in globals.css (.score-ring-circle keyframe).
//
// Props:
//   score   — integer 0-100
//   size    — 'sm' | 'md' | 'lg'  (default 'md')
//   animate — boolean (default true)
// ─────────────────────────────────────────────

const SIZES = {
  sm: { viewBox: 120, cx: 60, cy: 60, r: 48, stroke: 8,  fontSize: 22, labelSize: 10 },
  md: { viewBox: 160, cx: 80, cy: 80, r: 64, stroke: 10, fontSize: 30, labelSize: 12 },
  lg: { viewBox: 200, cx:100, cy:100, r: 80, stroke: 12, fontSize: 38, labelSize: 14 },
}

export default function ScoreRing({ score = 0, size = 'md', animate = true }) {
  const { label, ringColor } = getScoreGrade(score)
  const offset               = getScoreOffset(score)
  const cfg                  = SIZES[size] || SIZES.md

  // Circumference for this radius: 2πr
  const circumference = 2 * Math.PI * cfg.r

  // Offset = full circumference → empty ring
  // Offset = 0                  → full ring
  const scoreOffset = circumference - (score / 100) * circumference

  return (
    <div
      role="img"
      aria-label={`Accessibility score: ${score} out of 100 — ${label}`}
      className="relative inline-flex items-center justify-center"
    >
      <svg
        width={cfg.viewBox}
        height={cfg.viewBox}
        viewBox={`0 0 ${cfg.viewBox} ${cfg.viewBox}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={cfg.cx}
          cy={cfg.cy}
          r={cfg.r}
          stroke="#e2e8f0"
          strokeWidth={cfg.stroke}
          fill="none"
        />

        {/* Score arc */}
        <circle
          cx={cfg.cx}
          cy={cfg.cy}
          r={cfg.r}
          stroke={ringColor}
          strokeWidth={cfg.stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          // Inline the target offset as a CSS variable so the keyframe can read it
          style={{
            '--score-offset': `${scoreOffset}`,
            strokeDashoffset: animate ? circumference : scoreOffset,
          }}
          className={animate ? 'score-ring-circle' : ''}
          // Start at top (12 o'clock position)
          transform={`rotate(-90 ${cfg.cx} ${cfg.cy})`}
        />

        {/* Score number */}
        <text
          x={cfg.cx}
          y={cfg.cy - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={cfg.fontSize}
          fontWeight="700"
          fontFamily="Syne, sans-serif"
          fill={ringColor}
        >
          {score}
        </text>

        {/* /100 label */}
        <text
          x={cfg.cx}
          y={cfg.cy + cfg.fontSize / 2 + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={cfg.labelSize}
          fontWeight="500"
          fontFamily="DM Sans, sans-serif"
          fill="#94a3b8"
        >
          / 100
        </text>
      </svg>

      {/* Grade label below ring */}
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6
                   text-xs font-semibold tracking-wide uppercase"
        style={{ color: ringColor }}
      >
        {label}
      </span>
    </div>
  )
}
