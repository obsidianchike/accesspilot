// ─────────────────────────────────────────────
// AccessPilot Score Calculator (Backend)
//
// Mirrors frontend/src/lib/scoring.js exactly.
// Keep both files in sync if you change the formula.
//
// Formula:
//   Start at 100
//   Deduct: critical×8, serious×5, moderate×3, minor×1
//   Floor at 0
// ─────────────────────────────────────────────

const WEIGHTS = {
  critical: 8,
  serious:  5,
  moderate: 3,
  minor:    1,
}

/**
 * Calculate a 0-100 accessibility score from a violations array.
 *
 * @param {Array}  violations - array of violation objects with a severity field
 * @returns {number} - integer 0-100
 */
function calculateScore(violations = []) {
  // Count violations per severity
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 }

  violations.forEach(v => {
    const sev = (v.severity || 'minor').toLowerCase()
    if (counts[sev] !== undefined) counts[sev]++
  })

  const deduction =
    counts.critical * WEIGHTS.critical +
    counts.serious  * WEIGHTS.serious  +
    counts.moderate * WEIGHTS.moderate +
    counts.minor    * WEIGHTS.minor

  return Math.max(0, Math.min(100, 100 - deduction))
}

/**
 * Build a summary object from a violations array.
 *
 * @param {Array} violations
 * @param {Array} passes
 * @param {Array} incomplete
 * @returns {Object} summary
 */
function buildSummary(violations = [], passes = [], incomplete = []) {
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 }

  violations.forEach(v => {
    const sev = (v.severity || 'minor').toLowerCase()
    if (counts[sev] !== undefined) counts[sev]++
  })

  return {
    total:      violations.length,
    critical:   counts.critical,
    serious:    counts.serious,
    moderate:   counts.moderate,
    minor:      counts.minor,
    passes:     passes.length,
    incomplete: incomplete.length,
  }
}

module.exports = { calculateScore, buildSummary }
