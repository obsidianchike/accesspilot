// ─────────────────────────────────────────────
// AccessPilot Score Calculator
//
// Scoring model:
//   Start at 100. Deduct points per violation weighted by severity.
//   Critical = 8pts, Serious = 5pts, Moderate = 3pts, Minor = 1pt
//   Score floors at 0.
//
// This same logic runs in the backend (backend/src/utils/scoring.js)
// Keep both files in sync.
// ─────────────────────────────────────────────

const WEIGHTS = {
  critical: 8,
  serious:  5,
  moderate: 3,
  minor:    1,
}

/**
 * Calculate a 0–100 accessibility score from violation counts.
 *
 * @param {Object} summary - { critical, serious, moderate, minor }
 * @returns {number} - integer 0–100
 */
export function calculateScore(summary) {
  const { critical = 0, serious = 0, moderate = 0, minor = 0 } = summary

  const deduction =
    critical * WEIGHTS.critical +
    serious  * WEIGHTS.serious  +
    moderate * WEIGHTS.moderate +
    minor    * WEIGHTS.minor

  return Math.max(0, Math.min(100, 100 - deduction))
}

/**
 * Get a colour class and label based on score.
 * Used by ScoreCard.js and ScoreRing.js.
 *
 * @param {number} score - 0–100
 * @returns {{ label: string, colorClass: string, ringColor: string }}
 */
export function getScoreGrade(score) {
  if (score >= 90) return { label: 'Excellent', colorClass: 'score-great', ringColor: '#16a34a' }
  if (score >= 75) return { label: 'Good',      colorClass: 'score-good',  ringColor: '#ca8a04' }
  if (score >= 50) return { label: 'Needs Work', colorClass: 'score-poor', ringColor: '#ea580c' }
  return              { label: 'Poor',       colorClass: 'score-bad',   ringColor: '#dc2626' }
}

/**
 * Calculate the SVG stroke-dashoffset for the score ring animation.
 * The full circle circumference at r=54 is 2πr ≈ 339.3
 *
 * @param {number} score - 0–100
 * @returns {number} - stroke-dashoffset value
 */
export function getScoreOffset(score) {
  const circumference = 339.3
  return circumference - (score / 100) * circumference
}
