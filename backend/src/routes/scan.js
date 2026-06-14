// ─────────────────────────────────────────────
// AccessPilot — Scan Route
// POST /api/scan
//
// This is the main endpoint. It:
//   1. Validates the incoming URL
//   2. Sets up SSE (Server-Sent Events) for live progress
//   3. Runs the full 4-agent pipeline
//   4. Returns the complete report JSON
//
// Two response modes:
//   - SSE streaming: sends progress events during scan
//   - Final JSON:    sends the complete report at the end
//
// The frontend uses a single fetch() — it receives the
// final JSON when the scan completes. The SSE progress
// events are handled separately via /api/scan/progress
// ─────────────────────────────────────────────

const express              = require('express')
const router               = express.Router()
const { runAgentPipeline } = require('../orchestrator/agentOrchestrator')
const logger               = require('../utils/logger')

// In-memory store for SSE progress events per scanId
// In production you'd use Redis — for hackathon, memory is fine
const progressStore = new Map()

// ── POST /api/scan ─────────────────────────────────────────
// Accepts: { url: string }
// Returns: AccessPilot report JSON

router.post('/scan', async (req, res) => {
  const { url } = req.body

  // ── Validate ──────────────────────────────────────────────
  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error:   true,
      message: 'URL is required. Send: { "url": "https://example.com" }',
    })
  }

  let parsedUrl
  try {
    parsedUrl = new URL(url.trim())
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol')
    }
  } catch {
    return res.status(400).json({
      error:   true,
      message: 'Invalid URL. Must start with http:// or https://',
    })
  }

  const cleanUrl = parsedUrl.toString()
  logger.info(`Scan request received for: ${cleanUrl}`)

  // ── Run the pipeline ──────────────────────────────────────
  try {
    // Collect progress events so we can stream them if needed
    const progressEvents = []

    function onProgress(agent, status, message) {
      const event = { agent, status, message, timestamp: new Date().toISOString() }
      progressEvents.push(event)
    }

    const report = await runAgentPipeline(cleanUrl, onProgress)

    // Attach progress events to the report for the frontend timeline
    // (the agentTimeline is already built by the orchestrator,
    //  but we send raw events too for debugging)
    report._progressEvents = progressEvents

    logger.success(`Scan complete for ${cleanUrl} — score: ${report.score}`)
    return res.status(200).json(report)

  } catch (err) {
    logger.error(`Scan failed for ${cleanUrl}: ${err.message}`)

    // Return a structured error so the frontend can show a useful message
    return res.status(500).json({
      error:   true,
      message: err.message || 'Scan failed. Please try again.',
      url:     cleanUrl,
    })
  }
})

// ── GET /api/scan/test ─────────────────────────────────────
// Quick test endpoint — returns a mock report without scanning
// Useful for testing the frontend without running a real scan

router.get('/scan/test', (req, res) => {
  logger.info('Test endpoint hit — returning mock report')
  res.status(200).json({
    scanId:    'ap-test-001',
    url:       'https://test.accesspilot.dev',
    pageTitle: 'AccessPilot Test Page',
    timestamp: new Date().toISOString(),
    score:     72,
    summary: {
      total: 5, critical: 1, serious: 2,
      moderate: 1, minor: 1, passes: 30, incomplete: 2,
    },
    agentTimeline: [
      { agent: 'Scanner',   status: 'complete', durationMs: 1200, message: 'Found 5 violations' },
      { agent: 'Reasoning', status: 'complete', durationMs: 2100, message: 'Classified all issues' },
      { agent: 'Fix',       status: 'complete', durationMs: 2800, message: 'Generated fixes' },
      { agent: 'Coach',     status: 'complete', durationMs: 1100, message: 'Built action plan' },
    ],
    violations: [
      {
        id: 'image-alt',
        description: 'Images must have alternate text',
        htmlSnippet: '<img src="logo.png">',
        severity: 'critical',
        wcagRef: 'WCAG 2.1 — 1.1.1',
        wcagLevel: 'Level A',
        userImpact: 'Screen reader users cannot understand what this image shows.',
        explanation: 'The img element has no alt attribute.',
        fixedHTML: '<img src="logo.png" alt="Company logo">',
        ariaFix: 'Use alt="" for decorative images.',
        recommendation: 'Always add descriptive alt text to meaningful images.',
        coachTip: 'Ask: what would a sighted user understand from this image? Write that as alt text.',
      },
    ],
    coachSummary: {
      overview: 'This is a test report from the AccessPilot backend.',
      priorityList: ['Add alt text to images', 'Fix colour contrast'],
      learningTips: ['Install axe DevTools browser extension', 'Test with NVDA screen reader'],
    },
    meta: {
      engine: 'axe-core 4.x (test mode)',
      aiModel: 'mock',
      wcagLevel: 'WCAG 2.1 AA',
      generator: 'AccessPilot — Microsoft Agents League Hackathon 2026',
    },
  })
})

module.exports = router
