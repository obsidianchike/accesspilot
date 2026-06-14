// ─────────────────────────────────────────────
// AccessPilot — Agent 1: Scanner Agent
//
// Responsibilities:
//   1. Load the target URL with Puppeteer (headless Chrome)
//   2. Inject axe-core into the page
//   3. Run a full WCAG 2.1 AA audit
//   4. Return structured violations, passes, incomplete
//
// This agent does NOT use AI — it uses axe-core directly.
// It is the fastest agent and runs first in the pipeline.
// ─────────────────────────────────────────────

const { loadPage, closeBrowser } = require('../services/puppeteerService')
const logger = require('../utils/logger')

/**
 * Run the Scanner Agent on a URL.
 *
 * @param {string}   url        - The URL to scan
 * @param {Function} onProgress - Callback for SSE progress updates
 * @returns {Promise<Object>}   - { violations, passes, incomplete, pageTitle }
 */
async function runScannerAgent(url, onProgress) {
  const startTime = Date.now()
  logger.agent('Scanner', `Starting scan of: ${url}`)
  onProgress('Scanner', 'running', 'Loading page in headless browser…')

  let browser = null

  try {
    // ── Step 1: Load the page with Puppeteer ──────────────
    const { browser: b, page, pageTitle } = await loadPage(url)
    browser = b

    onProgress('Scanner', 'running', 'Page loaded — injecting axe-core…')

    // ── Step 2: Get the axe-core source code ──────────────
    // We read axe-core from node_modules and inject it into the page
    const axePath   = require.resolve('axe-core')
    const axeSource = require('fs').readFileSync(axePath, 'utf8')

    // Inject axe-core into the page context
    await page.evaluate(axeSource)
    logger.agent('Scanner', 'axe-core injected into page')

    onProgress('Scanner', 'running', 'Running WCAG 2.1 AA audit…')

    // ── Step 3: Run the axe-core audit ────────────────────
    const axeResults = await page.evaluate(async () => {
      // Run axe with WCAG 2.1 AA ruleset
      const results = await window.axe.run(document, {
        runOnly: {
          type:   'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
        resultTypes: ['violations', 'passes', 'incomplete'],
      })
      return results
    })

    // ── Step 4: Clean and normalise the results ───────────
    const violations = normaliseViolations(axeResults.violations || [])
    const passes     = (axeResults.passes     || []).map(p => ({ id: p.id, description: p.description }))
    const incomplete = (axeResults.incomplete || []).map(i => ({ id: i.id, description: i.description }))

    const durationMs = Date.now() - startTime
    logger.agent('Scanner', `Scan complete in ${durationMs}ms — ${violations.length} violations, ${passes.length} passes`)
    onProgress('Scanner', 'complete', `Found ${violations.length} violations across ${passes.length} passing rules`)

    return {
      violations,
      passes,
      incomplete,
      pageTitle,
      durationMs,
    }

  } catch (err) {
    logger.error(`Scanner Agent failed: ${err.message}`)
    onProgress('Scanner', 'error', `Scan failed: ${err.message}`)
    throw err

  } finally {
    // Always close the browser — even if we crashed
    await closeBrowser(browser)
  }
}

/**
 * Normalise raw axe-core violations into AccessPilot format.
 * Extracts the most useful fields and cleans up the data.
 *
 * @param {Array} rawViolations - violations array from axe-core
 * @returns {Array} - cleaned violations array
 */
function normaliseViolations(rawViolations) {
  return rawViolations.map(v => {
    // Get the first failing node's HTML as the snippet
    const firstNode = v.nodes?.[0] || {}
    const htmlSnippet = firstNode.html
      ? firstNode.html.substring(0, 500)  // cap at 500 chars
      : ''

    return {
      id:          v.id,
      description: v.description,
      help:        v.help,
      helpUrl:     v.helpUrl,
      impact:      v.impact,  // axe-core's own impact: critical|serious|moderate|minor
      tags:        v.tags || [],
      htmlSnippet,
      nodes:       (v.nodes || []).slice(0, 3).map(n => ({
        html:           n.html?.substring(0, 300) || '',
        failureSummary: n.failureSummary?.substring(0, 200) || '',
        target:         n.target || [],
      })),
      // These fields will be filled by the Reasoning and Fix agents
      severity:       null,
      wcagRef:        null,
      wcagLevel:      null,
      userImpact:     null,
      explanation:    null,
      fixedHTML:      null,
      ariaFix:        null,
      recommendation: null,
      coachTip:       null,
    }
  })
}

module.exports = { runScannerAgent }
