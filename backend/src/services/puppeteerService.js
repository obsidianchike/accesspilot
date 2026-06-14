// ─────────────────────────────────────────────
// AccessPilot Puppeteer Service
//
// Launches a headless Chrome browser, loads a URL,
// waits for the page to fully render (including
// JavaScript), then returns the browser page object
// ready for axe-core injection.
// ─────────────────────────────────────────────

const puppeteer = require('puppeteer')
const logger    = require('../utils/logger')

// How long to wait for page load (ms)
const PAGE_TIMEOUT    = 30000  // 30 seconds
const NETWORK_TIMEOUT = 10000  // 10 seconds after load

/**
 * Launch a Puppeteer browser and load a URL.
 * Returns the page object — caller must close the browser when done.
 *
 * @param {string} url - The URL to load
 * @returns {Promise<{ browser, page, pageTitle }>}
 */
async function loadPage(url) {
  logger.agent('Scanner', `Launching headless browser for: ${url}`)

  // Browser launch options
  // On Azure App Service (Linux), we need --no-sandbox
  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',      // Prevents crashes in Docker/Linux
      '--disable-gpu',
      '--disable-web-security',       // Allow cross-origin axe-core injection
      '--disable-features=VizDisplayCompositor',
      '--window-size=1280,800',
    ],
  }

  // In production (Azure) always use no-sandbox
  if (process.env.NODE_ENV === 'production' || process.env.PUPPETEER_NO_SANDBOX === 'true') {
    launchOptions.args.push('--single-process')
  }

  const browser = await puppeteer.launch(launchOptions)
  const page    = await browser.newPage()

  // Set a realistic viewport and user agent
  await page.setViewport({ width: 1280, height: 800 })
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AccessPilot/1.0'
  )

  // Block unnecessary resources to speed up the scan
  // We don't need images, fonts, or media — just the DOM and JS
  await page.setRequestInterception(true)
  page.on('request', req => {
    const type = req.resourceType()
    if (['image', 'media', 'font'].includes(type)) {
      req.abort()
    } else {
      req.continue()
    }
  })

  // Navigate to the URL
  logger.agent('Scanner', `Navigating to ${url}`)
  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',   // Wait until network is mostly idle
      timeout:   PAGE_TIMEOUT,
    })
  } catch (err) {
    // If networkidle2 times out, try with just domcontentloaded
    logger.warn(`networkidle2 timed out, retrying with domcontentloaded`)
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout:   PAGE_TIMEOUT,
    })
    // Extra wait for JS to execute
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  // Get the page title for the report
  const pageTitle = await page.title().catch(() => '')
  logger.agent('Scanner', `Page loaded: "${pageTitle}"`)

  return { browser, page, pageTitle }
}

/**
 * Safely close a Puppeteer browser instance.
 * Always call this in a finally block.
 *
 * @param {Browser} browser
 */
async function closeBrowser(browser) {
  try {
    if (browser) await browser.close()
  } catch (err) {
    logger.warn('Failed to close browser cleanly', err.message)
  }
}

module.exports = { loadPage, closeBrowser }
