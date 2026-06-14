// ─────────────────────────────────────────────
// AccessPilot Report Builder
//
// Assembles the final report JSON from the
// outputs of all four agents.
// ─────────────────────────────────────────────

const { v4: uuidv4 } = require('uuid')
const { calculateScore, buildSummary } = require('./scoring')

/**
 * Build the final AccessPilot report JSON.
 *
 * @param {Object} params
 * @param {string}   params.url           - scanned URL
 * @param {string}   params.pageTitle     - page <title> from Puppeteer
 * @param {Array}    params.violations    - enriched violations from Fix Agent
 * @param {Array}    params.passes        - passing rules from Scanner Agent
 * @param {Array}    params.incomplete    - incomplete rules from Scanner Agent
 * @param {Array}    params.agentTimeline - timing data from orchestrator
 * @param {Object}   params.coachSummary  - output from Coach Agent
 * @returns {Object} - complete AccessPilot report
 */
function buildReport({
  url,
  pageTitle     = '',
  violations    = [],
  passes        = [],
  incomplete    = [],
  agentTimeline = [],
  coachSummary  = {},
}) {
  const score   = calculateScore(violations)
  const summary = buildSummary(violations, passes, incomplete)

  return {
    scanId:        `ap-${uuidv4()}`,
    url,
    pageTitle,
    timestamp:     new Date().toISOString(),
    score,
    summary,
    agentTimeline,
    violations,
    coachSummary,
    meta: {
      engine:    'axe-core 4.x',
      aiModel:   process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      wcagLevel: 'WCAG 2.1 AA',
      generator: 'AccessPilot — Microsoft Agents League Hackathon 2026',
    },
  }
}

module.exports = { buildReport }
