// ─────────────────────────────────────────────
// AccessPilot — Quick Test Script
//
// Run this BEFORE starting the server to verify
// Puppeteer and axe-core are working correctly.
//
// Usage:
//   node src/test-scan.js
//   node src/test-scan.js https://your-url.com
// ─────────────────────────────────────────────

require('dotenv').config()
const { runScannerAgent } = require('./agents/scannerAgent')
const logger = require('./utils/logger')

// Default test URL — a simple page that will have some violations
const TEST_URL = process.argv[2] || 'https://example.com'

async function runTest() {
  logger.divider()
  logger.info(`AccessPilot Scanner Test`)
  logger.info(`Target URL: ${TEST_URL}`)
  logger.divider()

  try {
    const result = await runScannerAgent(TEST_URL, (agent, status, message) => {
      logger.agent(agent, `[${status}] ${message}`)
    })

    logger.divider()
    logger.success('Scanner Agent test PASSED ✓')
    logger.info(`Page title:  "${result.pageTitle}"`)
    logger.info(`Violations:  ${result.violations.length}`)
    logger.info(`Passes:      ${result.passes.length}`)
    logger.info(`Incomplete:  ${result.incomplete.length}`)
    logger.info(`Duration:    ${result.durationMs}ms`)
    logger.divider()

    if (result.violations.length > 0) {
      logger.info('First 3 violations:')
      result.violations.slice(0, 3).forEach((v, i) => {
        console.log(`  ${i + 1}. [${v.impact}] ${v.description}`)
        console.log(`     HTML: ${v.htmlSnippet?.substring(0, 80)}`)
      })
    }

    logger.divider()
    logger.success('✅ Puppeteer + axe-core are working correctly!')
    logger.info('You can now start the server with: npm run dev')
    logger.divider()

  } catch (err) {
    logger.divider()
    logger.error(`Scanner test FAILED: ${err.message}`)
    logger.divider()
    logger.warn('Common fixes:')
    console.log('  1. Run: npm install')
    console.log('  2. Run: npx puppeteer browsers install chrome')
    console.log('  3. Check your internet connection')
    console.log('  4. Try a different URL')
    logger.divider()
    process.exit(1)
  }
}

runTest()
