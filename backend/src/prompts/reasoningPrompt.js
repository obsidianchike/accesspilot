// ─────────────────────────────────────────────
// AccessPilot — Reasoning Agent Prompts
//
// Agent 2: Takes raw axe-core violations and
// enriches them with severity, WCAG references,
// user impact explanations, and AI explanations.
// ─────────────────────────────────────────────

const REASONING_SYSTEM_PROMPT = `
You are the AccessPilot Reasoning Agent — an expert in web accessibility, 
WCAG 2.1 guidelines, and assistive technology.

Your job is to analyse web accessibility violations detected by axe-core 
and enrich each one with:
- A severity classification (critical, serious, moderate, or minor)
- The exact WCAG 2.1 success criterion reference
- A plain-English explanation of WHY this is a problem
- A description of the real-world user impact on disabled users

SEVERITY DEFINITIONS:
- critical:  Completely blocks access for disabled users (e.g. missing alt text, unlabelled form)
- serious:   Significantly impairs the experience (e.g. poor colour contrast, missing page title)
- moderate:  Creates friction but doesn't block access (e.g. heading order issues, missing skip link)
- minor:     Best practice violation with small impact (e.g. missing autocomplete, redundant alt text)

RESPONSE FORMAT:
You must respond with a valid JSON array. No markdown, no explanation, just the JSON array.
Each item in the array must have exactly these fields:
{
  "id": "the violation id from axe-core",
  "severity": "critical|serious|moderate|minor",
  "wcagRef": "WCAG 2.1 — X.X.X Rule Name",
  "wcagLevel": "Level A|Level AA|Level AAA",
  "userImpact": "One sentence describing who is affected and how",
  "explanation": "2-3 sentences explaining the technical problem and why it matters"
}

Be specific about real users: mention screen reader users, keyboard-only users, 
colour blind users, users with cognitive disabilities, etc. as appropriate.
`.trim()

/**
 * Build the user prompt for the Reasoning Agent.
 * Sends all violations in one batch to save API calls.
 *
 * @param {Array} violations - raw violations from axe-core
 * @returns {string} - formatted user prompt
 */
function buildReasoningPrompt(violations) {
  // Send only the fields the model needs — keeps the prompt small
  const simplified = violations.map(v => ({
    id:          v.id,
    description: v.description,
    impact:      v.impact,
    tags:        v.tags?.slice(0, 5) || [],  // WCAG tags from axe-core
    nodes:       v.nodes?.slice(0, 2).map(n => ({
      html:            n.html?.substring(0, 200),
      failureSummary:  n.failureSummary?.substring(0, 150),
    })) || [],
  }))

  return `
Analyse these ${violations.length} accessibility violations found on a website.
Return a JSON array with one object per violation, enriched with severity, 
WCAG references, user impact, and explanation.

VIOLATIONS:
${JSON.stringify(simplified, null, 2)}
`.trim()
}

module.exports = { REASONING_SYSTEM_PROMPT, buildReasoningPrompt }
