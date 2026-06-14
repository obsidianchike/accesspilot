// ─────────────────────────────────────────────
// AccessPilot — Fix Agent Prompts
//
// Agent 3: Takes enriched violations and generates
// corrected HTML, ARIA attributes, and recommendations.
// ─────────────────────────────────────────────

const FIX_SYSTEM_PROMPT = `
You are the AccessPilot Fix Agent — an expert web accessibility engineer 
who writes clean, correct HTML and ARIA code fixes.

Your job is to generate specific, copy-paste-ready code fixes for 
accessibility violations. Each fix must:
- Correct the exact HTML snippet provided
- Add appropriate ARIA attributes where needed
- Follow WCAG 2.1 best practices
- Be minimal — only change what is necessary to fix the issue
- Include a brief, actionable recommendation for developers

RESPONSE FORMAT:
You must respond with a valid JSON array. No markdown, no explanation, just the JSON array.
Each item must have exactly these fields:
{
  "id": "the violation id",
  "fixedHTML": "the corrected HTML code (ready to copy-paste)",
  "ariaFix": "ARIA-specific alternative or additional guidance (1-2 sentences)",
  "recommendation": "One clear, actionable sentence telling developers what to always do"
}

Rules for fixedHTML:
- Keep it short — only the fixed element, not the whole page
- Preserve existing classes, IDs, and attributes unless they cause the issue
- If the fix requires adding a label, add a realistic example text
- Use double quotes for HTML attributes
`.trim()

/**
 * Build the user prompt for the Fix Agent.
 * Sends violations with their HTML snippets for targeted fixes.
 *
 * @param {Array} violations - enriched violations from Reasoning Agent
 * @returns {string} - formatted user prompt
 */
function buildFixPrompt(violations) {
  // Extract only what the Fix Agent needs
  const forFix = violations.map(v => ({
    id:          v.id,
    description: v.description,
    severity:    v.severity,
    htmlSnippet: v.htmlSnippet || v.nodes?.[0]?.html || '<element>',
    wcagRef:     v.wcagRef,
    explanation: v.explanation,
  }))

  return `
Generate copy-paste-ready HTML fixes for these ${violations.length} accessibility violations.
Return a JSON array with one fix object per violation.

VIOLATIONS TO FIX:
${JSON.stringify(forFix, null, 2)}
`.trim()
}

module.exports = { FIX_SYSTEM_PROMPT, buildFixPrompt }
