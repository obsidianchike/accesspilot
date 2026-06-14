// ─────────────────────────────────────────────
// AccessPilot — Agent 2: Reasoning Agent
//
// Responsibilities:
//   1. Take raw violations from Scanner Agent
//   2. Send them to Azure OpenAI GPT-4o-mini
//   3. Get back: severity, wcagRef, userImpact, explanation
//   4. Merge AI enrichment into violation objects
//   5. Sort violations by severity (critical first)
// ─────────────────────────────────────────────

const { runJSONPrompt }         = require('../services/azureOpenAI')
const { REASONING_SYSTEM_PROMPT, buildReasoningPrompt } = require('../prompts/reasoningPrompt')
const logger                    = require('../utils/logger')

// Severity sort order — critical violations shown first
const SEVERITY_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 }

// Max violations to send to AI in one batch
// Keeps prompt size manageable and cost low
const BATCH_SIZE = 15

/**
 * Run the Reasoning Agent on the violations from Scanner Agent.
 *
 * @param {Array}    violations - normalised violations from scannerAgent
 * @param {Function} onProgress - callback for SSE progress updates
 * @returns {Promise<Array>}    - violations enriched with AI analysis
 */
async function runReasoningAgent(violations, onProgress) {
  const startTime = Date.now()

  if (violations.length === 0) {
    logger.agent('Reasoning', 'No violations to analyse — skipping')
    onProgress('Reasoning', 'complete', 'No violations found — site looks accessible!')
    return []
  }

  logger.agent('Reasoning', `Analysing ${violations.length} violations with Azure OpenAI`)
  onProgress('Reasoning', 'running', `Classifying ${violations.length} violations by severity…`)

  try {
    // Process in batches to avoid hitting token limits
    const enrichedViolations = []
    const batches = chunkArray(violations, BATCH_SIZE)

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]

      if (batches.length > 1) {
        onProgress('Reasoning', 'running', `Analysing batch ${i + 1} of ${batches.length}…`)
      }

      // Call Azure OpenAI
      const systemPrompt = REASONING_SYSTEM_PROMPT
      const userPrompt   = buildReasoningPrompt(batch)

      let aiResults
      try {
        aiResults = await runJSONPrompt(systemPrompt, userPrompt, {
          temperature: 0.2,
          maxTokens:   2500,
        })
      } catch (aiErr) {
        // If AI fails, fall back to axe-core's own impact values
        logger.warn(`Reasoning Agent AI call failed, using fallback: ${aiErr.message}`)
        aiResults = batch.map(v => ({
          id:          v.id,
          severity:    mapAxeImpactToSeverity(v.impact),
          wcagRef:     extractWcagRef(v.tags),
          wcagLevel:   extractWcagLevel(v.tags),
          userImpact:  v.nodes?.[0]?.failureSummary || 'This issue affects users of assistive technology.',
          explanation: v.help || v.description,
        }))
      }

      // Merge AI results back into violation objects
      const enriched = mergeAiResults(batch, Array.isArray(aiResults) ? aiResults : [])
      enrichedViolations.push(...enriched)
    }

    // Sort: critical → serious → moderate → minor
    enrichedViolations.sort((a, b) => {
      const orderA = SEVERITY_ORDER[a.severity] ?? 99
      const orderB = SEVERITY_ORDER[b.severity] ?? 99
      return orderA - orderB
    })

    const durationMs = Date.now() - startTime
    logger.agent('Reasoning', `Analysis complete in ${durationMs}ms`)
    onProgress('Reasoning', 'complete', `Classified and explained all ${enrichedViolations.length} issues`)

    return enrichedViolations

  } catch (err) {
    logger.error(`Reasoning Agent failed: ${err.message}`)
    onProgress('Reasoning', 'error', `Reasoning failed: ${err.message}`)
    // Return violations with fallback severity instead of crashing
    return violations.map(v => ({
      ...v,
      severity:    mapAxeImpactToSeverity(v.impact),
      wcagRef:     extractWcagRef(v.tags),
      wcagLevel:   extractWcagLevel(v.tags),
      userImpact:  'This issue affects users of assistive technology.',
      explanation: v.description,
    }))
  }
}

// ── Helper functions ───────────────────────────────────────

/**
 * Merge AI-generated fields back into the original violation objects.
 * The AI response is matched by violation ID.
 */
function mergeAiResults(violations, aiResults) {
  // Build a lookup map from AI results
  const aiMap = {}
  aiResults.forEach(r => {
    if (r.id) aiMap[r.id] = r
  })

  return violations.map(v => {
    const ai = aiMap[v.id] || {}
    return {
      ...v,
      severity:    ai.severity    || mapAxeImpactToSeverity(v.impact),
      wcagRef:     ai.wcagRef     || extractWcagRef(v.tags),
      wcagLevel:   ai.wcagLevel   || extractWcagLevel(v.tags),
      userImpact:  ai.userImpact  || v.nodes?.[0]?.failureSummary || '',
      explanation: ai.explanation || v.description,
    }
  })
}

/**
 * Map axe-core's impact values to AccessPilot severity levels.
 * Used as a fallback when AI is unavailable.
 */
function mapAxeImpactToSeverity(impact) {
  const map = {
    critical: 'critical',
    serious:  'serious',
    moderate: 'moderate',
    minor:    'minor',
  }
  return map[impact] || 'moderate'
}

/**
 * Extract a WCAG reference string from axe-core tags.
 * e.g. ['wcag2a', 'wcag412'] → 'WCAG 2.1 — 4.1.2'
 */
function extractWcagRef(tags = []) {
  const wcagTag = tags.find(t => /^wcag\d/.test(t) && t.length > 6)
  if (!wcagTag) return 'WCAG 2.1'

  // Convert 'wcag412' → '4.1.2'
  const digits = wcagTag.replace('wcag', '')
  const criterion = digits.split('').join('.')
  return `WCAG 2.1 — ${criterion}`
}

/**
 * Extract the WCAG compliance level from axe-core tags.
 */
function extractWcagLevel(tags = []) {
  if (tags.includes('wcag2a')   || tags.includes('wcag21a'))  return 'Level A'
  if (tags.includes('wcag2aa')  || tags.includes('wcag21aa')) return 'Level AA'
  if (tags.includes('wcag2aaa') || tags.includes('wcag21aaa'))return 'Level AAA'
  return 'Level A'
}

/**
 * Split an array into chunks of a given size.
 */
function chunkArray(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

module.exports = { runReasoningAgent }
