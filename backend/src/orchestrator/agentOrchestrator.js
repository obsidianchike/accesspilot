// ─────────────────────────────────────────────
// AccessPilot — Agent Orchestrator
//
// Runs all four agents in sequence:
//   1. Scanner Agent   → raw violations
//   2. Reasoning Agent → enriched violations
//   3. Fix Agent       → violations + fixes
//   4. Coach Agent     → coaching summary + tips
//
// Emits SSE (Server-Sent Events) progress updates
// so the frontend can show live agent status.
//
// SSE event format:
//   data: { agent, status, message, timestamp }
// ─────────────────────────────────────────────

const { runScannerAgent }   = require('../agents/scannerAgent')
const { runReasoningAgent } = require('../agents/reasoningAgent')
const { runFixAgent }       = require('../agents/fixAgent')
const { runCoachAgent }     = require('../agents/coachAgent')
const { buildReport }       = require('../utils/reportBuilder')
const logger                = require('../utils/logger')

/**
 * Run the full AccessPilot 4-agent pipeline for a given URL.
 *
 * @param {string}   url    - The URL to scan
 * @param {Function} onSSE  - Callback to send SSE events to the client
 *                            signature: (eventData: Object) => void
 * @returns {Promise<Object>} - Complete AccessPilot report JSON
 */
async function runAgentPipeline(url, onSSE) {
  logger.divider()
  logger.info(`🚀 AccessPilot pipeline starting for: ${url}`)
  logger.divider()

  // Timeline tracking — records each agent's duration and message
  const agentTimeline = []

  // SSE helper — sends a progress event to the connected client
  function emitProgress(agent, status, message) {
    const event = {
      agent,
      status,
      message,
      timestamp: new Date().toISOString(),
    }
    logger.agent(agent, `[${status.toUpperCase()}] ${message}`)
    onSSE(event)
  }

  // Agent timer — records start time and returns a function to stop it
  function startTimer(agentName) {
    const start = Date.now()
    return function stopTimer(status, message) {
      const durationMs = Date.now() - start
      agentTimeline.push({ agent: agentName, status, durationMs, message })
      return durationMs
    }
  }

  // ════════════════════════════════════════════
  // AGENT 1 — Scanner
  // ════════════════════════════════════════════
  emitProgress('Scanner', 'running', 'Loading page and preparing axe-core audit…')
  const stopScanner = startTimer('Scanner')
  let scannerResult

  try {
    scannerResult = await runScannerAgent(url, emitProgress)
    stopScanner('complete', scannerResult
      ? `Found ${scannerResult.violations.length} violations across ${scannerResult.passes.length} rules`
      : 'Scan complete'
    )
  } catch (err) {
    stopScanner('error', `Scanner failed: ${err.message}`)
    throw new Error(`Scanner Agent failed: ${err.message}`)
  }

  const { violations: rawViolations, passes, incomplete, pageTitle } = scannerResult

  // ════════════════════════════════════════════
  // AGENT 2 — Reasoning
  // ════════════════════════════════════════════
  emitProgress('Reasoning', 'running', 'Analysing violations with Azure OpenAI…')
  const stopReasoning = startTimer('Reasoning')
  let enrichedViolations

  try {
    enrichedViolations = await runReasoningAgent(rawViolations, emitProgress)
    stopReasoning('complete', `Classified and explained all ${enrichedViolations.length} issues`)
  } catch (err) {
    stopReasoning('error', `Reasoning failed: ${err.message}`)
    // Don't throw — use raw violations with fallback data
    enrichedViolations = rawViolations
    logger.warn('Reasoning Agent failed — continuing with raw violations')
  }

  // ════════════════════════════════════════════
  // AGENT 3 — Fix
  // ════════════════════════════════════════════
  emitProgress('Fix', 'running', 'Generating HTML and ARIA fixes…')
  const stopFix = startTimer('Fix')
  let fixedViolations

  try {
    fixedViolations = await runFixAgent(enrichedViolations, emitProgress)
    stopFix('complete', 'Generated HTML and ARIA fixes')
  } catch (err) {
    stopFix('error', `Fix generation failed: ${err.message}`)
    fixedViolations = enrichedViolations
    logger.warn('Fix Agent failed — continuing without fixes')
  }

  // ════════════════════════════════════════════
  // AGENT 4 — Coach
  // ════════════════════════════════════════════
  emitProgress('Coach', 'running', 'Building your accessibility action plan…')
  const stopCoach = startTimer('Coach')
  let coachSummary
  let finalViolations = fixedViolations

  try {
    const coachResult = await runCoachAgent(
      { url, violations: fixedViolations, passes, incomplete },
      emitProgress
    )
    coachSummary    = coachResult.coachSummary
    finalViolations = coachResult.violationsWithTips
    stopCoach('complete', 'Built your accessibility action plan')
  } catch (err) {
    stopCoach('error', `Coach failed: ${err.message}`)
    coachSummary = { overview: '', priorityList: [], learningTips: [] }
    logger.warn('Coach Agent failed — continuing without coaching summary')
  }

  // ════════════════════════════════════════════
  // BUILD FINAL REPORT
  // ════════════════════════════════════════════
  const report = buildReport({
    url,
    pageTitle,
    violations:    finalViolations,
    passes,
    incomplete,
    agentTimeline,
    coachSummary,
  })

  logger.divider()
  logger.success(`✅ AccessPilot scan complete — Score: ${report.score}/100`)
  logger.divider()

  // Send final completion event
  emitProgress('Pipeline', 'complete', `Scan complete — score: ${report.score}/100`)

  return report
}

module.exports = { runAgentPipeline }
