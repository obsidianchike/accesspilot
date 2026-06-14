// ─────────────────────────────────────────────
// AccessPilot — Agent 3: Fix Agent
//
// Responsibilities:
//   1. Take enriched violations from Reasoning Agent
//   2. Send each violation's HTML snippet to Azure OpenAI
//   3. Get back: fixedHTML, ariaFix, recommendation
//   4. Merge fixes into violation objects
// ─────────────────────────────────────────────

const { runJSONPrompt }   = require('../services/azureOpenAI')
const { FIX_SYSTEM_PROMPT, buildFixPrompt } = require('../prompts/fixPrompt')
const logger              = require('../utils/logger')

// Process violations in batches to keep prompts manageable
const BATCH_SIZE = 8

/**
 * Run the Fix Agent on enriched violations.
 *
 * @param {Array}    violations - enriched violations from Reasoning Agent
 * @param {Function} onProgress - callback for SSE progress updates
 * @returns {Promise<Array>}    - violations with HTML and ARIA fixes added
 */
async function runFixAgent(violations, onProgress) {
  const startTime = Date.now()

  if (violations.length === 0) {
    onProgress('Fix', 'complete', 'No violations to fix')
    return []
  }

  logger.agent('Fix', `Generating fixes for ${violations.length} violations`)
  onProgress('Fix', 'running', `Generating HTML and ARIA fixes…`)

  try {
    const fixedViolations = [...violations]  // copy so we don't mutate the original
    const batches = chunkArray(violations, BATCH_SIZE)

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]

      if (batches.length > 1) {
        onProgress('Fix', 'running', `Generating fixes: batch ${i + 1} of ${batches.length}…`)
      }

      let fixResults
      try {
        fixResults = await runJSONPrompt(
          FIX_SYSTEM_PROMPT,
          buildFixPrompt(batch),
          { temperature: 0.2, maxTokens: 2500 }
        )
      } catch (aiErr) {
        logger.warn(`Fix Agent AI call failed for batch ${i + 1}: ${aiErr.message}`)
        // Fall back to generic fixes based on violation type
        fixResults = batch.map(v => generateFallbackFix(v))
      }

      // Merge fixes back into the violations array
      const fixMap = {}
      const results = Array.isArray(fixResults) ? fixResults : []
      results.forEach(r => { if (r.id) fixMap[r.id] = r })

      // Apply fixes to the corresponding violations in our copy
      batch.forEach(v => {
        const fix = fixMap[v.id]
        const idx = fixedViolations.findIndex(fv => fv.id === v.id)
        if (idx !== -1 && fix) {
          fixedViolations[idx] = {
            ...fixedViolations[idx],
            fixedHTML:      fix.fixedHTML      || generateSimpleFix(v),
            ariaFix:        fix.ariaFix        || '',
            recommendation: fix.recommendation || v.help || '',
          }
        }
      })
    }

    const durationMs = Date.now() - startTime
    logger.agent('Fix', `Fix generation complete in ${durationMs}ms`)
    onProgress('Fix', 'complete', `Generated HTML and ARIA fixes for all violations`)

    return fixedViolations

  } catch (err) {
    logger.error(`Fix Agent failed: ${err.message}`)
    onProgress('Fix', 'error', `Fix generation failed: ${err.message}`)
    // Return violations with fallback fixes
    return violations.map(v => ({
      ...v,
      fixedHTML:      generateSimpleFix(v),
      ariaFix:        '',
      recommendation: v.help || v.description,
    }))
  }
}

// ── Fallback fix generators ────────────────────────────────
// Used when the AI call fails — provides basic guidance
// based on the violation type

function generateFallbackFix(violation) {
  return {
    id:             violation.id,
    fixedHTML:      generateSimpleFix(violation),
    ariaFix:        `Refer to the axe-core documentation for ${violation.id}: ${violation.helpUrl || ''}`,
    recommendation: violation.help || violation.description,
  }
}

function generateSimpleFix(violation) {
  const html = violation.htmlSnippet || ''

  // Common patterns — basic transformations
  const fixes = {
    'image-alt':      html.replace(/<img/g, '<img alt="Descriptive text here"'),
    'label':          `<label for="field-id">Field label</label>\n${html.replace(/<input/, '<input id="field-id"')}`,
    'color-contrast': `<!-- Update text or background colour to achieve 4.5:1 contrast ratio -->\n${html}`,
    'button-name':    html.replace(/<button/, '<button aria-label="Describe button purpose"'),
    'link-name':      html.replace(/>click here</i, '>Descriptive link text<').replace(/>read more</i, '>Read more about [topic]<'),
    'html-lang':      html.replace(/<html/, '<html lang="en"'),
    'document-title': '<title>Page Name — Site Name</title>',
  }

  return fixes[violation.id] || `<!-- Fix required for: ${violation.description} -->\n${html}`
}

function chunkArray(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

module.exports = { runFixAgent }
