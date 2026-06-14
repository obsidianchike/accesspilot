// ─────────────────────────────────────────────
// AccessPilot — Agent 4: Coach Agent
//
// Responsibilities:
//   1. Take the full enriched report (violations + fixes)
//   2. Send it to Azure OpenAI
//   3. Get back a plain-English coaching summary:
//      - Overview of the site's accessibility health
//      - Prioritised list of top actions
//      - Learning tips and resources
//   4. Also generate individual coachTips for each violation
// ─────────────────────────────────────────────

const { runPrompt, runJSONPrompt } = require('../services/azureOpenAI')
const { COACH_SYSTEM_PROMPT, buildCoachPrompt } = require('../prompts/coachPrompt')
const { calculateScore, buildSummary } = require('../utils/scoring')
const logger = require('../utils/logger')

/**
 * Run the Coach Agent on the full enriched report.
 *
 * @param {Object}   reportData  - { url, violations, passes, incomplete }
 * @param {Function} onProgress  - callback for SSE progress updates
 * @returns {Promise<Object>}    - { coachSummary, violationsWithTips }
 */
async function runCoachAgent({ url, violations, passes, incomplete }, onProgress) {
  const startTime = Date.now()

  logger.agent('Coach', `Building coaching summary for ${url}`)
  onProgress('Coach', 'running', 'Building your personalised accessibility action plan…')

  const score   = calculateScore(violations)
  const summary = buildSummary(violations, passes, incomplete)

  try {
    // ── Step 1: Generate the overall coaching summary ─────
    let coachSummary

    try {
      coachSummary = await runJSONPrompt(
        COACH_SYSTEM_PROMPT,
        buildCoachPrompt({ url, score, summary, violations }),
        { temperature: 0.4, maxTokens: 1500 }
      )
    } catch (aiErr) {
      logger.warn(`Coach Agent summary failed, using fallback: ${aiErr.message}`)
      coachSummary = generateFallbackSummary(score, summary, violations)
    }

    // ── Step 2: Generate individual coach tips ────────────
    // Add a quick coachTip to the top 5 critical/serious violations
    // This is a lighter call — single prompt for all tips
    const violationsWithTips = await addCoachTips(violations, onProgress)

    const durationMs = Date.now() - startTime
    logger.agent('Coach', `Coaching complete in ${durationMs}ms`)
    onProgress('Coach', 'complete', 'Built your accessibility action plan')

    return { coachSummary, violationsWithTips }

  } catch (err) {
    logger.error(`Coach Agent failed: ${err.message}`)
    onProgress('Coach', 'error', `Coaching failed: ${err.message}`)

    // Return fallback data — never crash the whole scan
    return {
      coachSummary:       generateFallbackSummary(score, summary, violations),
      violationsWithTips: violations,
    }
  }
}

/**
 * Add individual coachTips to the most important violations.
 * Only processes the top violations to keep API costs low.
 */
async function addCoachTips(violations, onProgress) {
  // Only add tips to the first 6 violations — enough for the demo
  const priorityViolations = violations.slice(0, 6)
  const restViolations     = violations.slice(6)

  if (priorityViolations.length === 0) return violations

  const tipsPrompt = `
For each of these accessibility violations, write ONE short, memorable coaching tip 
(max 25 words) that helps a developer remember how to fix this type of issue in future.
The tip should be practical and connect the fix to real user benefit.

Return a JSON array: [{ "id": "violation-id", "coachTip": "your tip here" }]

VIOLATIONS:
${JSON.stringify(priorityViolations.map(v => ({ id: v.id, description: v.description, severity: v.severity })), null, 2)}
`.trim()

  const tipsSystemPrompt = `
You are an accessibility coach. Generate short, memorable tips (max 25 words each) 
that help developers remember accessibility best practices. Return only valid JSON.
`.trim()

  let tipsMap = {}
  try {
    const tips = await runJSONPrompt(tipsSystemPrompt, tipsPrompt, {
      temperature: 0.5,
      maxTokens:   800,
    })
    const tipsArray = Array.isArray(tips) ? tips : []
    tipsArray.forEach(t => { if (t.id) tipsMap[t.id] = t.coachTip })
  } catch {
    // Tips are optional — don't crash if they fail
    logger.warn('Coach tips generation failed — continuing without tips')
  }

  // Merge tips into violations
  const withTips = priorityViolations.map(v => ({
    ...v,
    coachTip: tipsMap[v.id] || generateFallbackTip(v),
  }))

  // Rest of violations get a generic tip
  const restWithTips = restViolations.map(v => ({
    ...v,
    coachTip: generateFallbackTip(v),
  }))

  return [...withTips, ...restWithTips]
}

// ── Fallback generators ────────────────────────────────────

function generateFallbackSummary(score, summary, violations) {
  const criticalCount = summary.critical
  const totalCount    = summary.total

  const overview = totalCount === 0
    ? 'Great news — no automatic accessibility violations were detected on this site. Consider running manual testing with a screen reader to catch issues automated tools miss.'
    : `Your site has ${totalCount} accessibility violation${totalCount !== 1 ? 's' : ''}, including ${criticalCount} critical issue${criticalCount !== 1 ? 's' : ''} that may completely block disabled users. Focus on the critical and serious issues first for the highest impact.`

  const topViolations = violations.slice(0, 5)
  const priorityList  = topViolations.map(v =>
    `Fix ${v.id}: ${v.description}`
  )

  return {
    overview,
    priorityList: priorityList.length > 0 ? priorityList : ['No violations found — great work!'],
    learningTips: [
      'Install the axe DevTools browser extension for real-time accessibility feedback during development',
      'Test your site with a screen reader — NVDA (Windows, free) or VoiceOver (Mac, built-in)',
      'Read WCAG 2.1 Level A success criteria — they are the non-negotiable baseline for accessibility',
    ],
  }
}

function generateFallbackTip(violation) {
  const tips = {
    'image-alt':       'Every image tells a story — make sure blind users can hear it too via alt text.',
    'color-contrast':  'Squint test: if text is hard to read when you squint, the contrast is too low.',
    'label':           'Placeholders disappear when users type. Always use a visible <label> instead.',
    'button-name':     'Every button must answer "what does this do?" — especially icon-only buttons.',
    'link-name':       'Read your links out of context. "Click here" tells nobody where they\'re going.',
    'html-lang':       'The lang attribute is one attribute that lets screen readers speak correctly.',
    'document-title':  'Your page title is the first thing a screen reader announces. Make it count.',
    'heading-order':   'Headings are your page\'s table of contents — never skip a level.',
    'skip-link':       'A skip link saves keyboard users from tabbing through your entire nav every page load.',
  }
  return tips[violation.id] || `Always verify: ${violation.description?.toLowerCase() || 'fix this accessibility issue'}.`
}

module.exports = { runCoachAgent }
