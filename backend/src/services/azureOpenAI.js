// ─────────────────────────────────────────────
// AccessPilot AI Client
//
// Supports two providers via AI_PROVIDER env var:
//   AI_PROVIDER=azure  → Azure OpenAI (Microsoft stack)
//   AI_PROVIDER=openai → OpenAI direct (fallback)
//
// The API is identical — only the client config differs.
// Switch providers by changing one line in .env
// ─────────────────────────────────────────────

const { AzureOpenAI, OpenAI } = require('openai')
const logger = require('../utils/logger')

// ── Build the correct client based on AI_PROVIDER ──────────

function createClient() {
  const provider = (process.env.AI_PROVIDER || 'azure').toLowerCase()

  if (provider === 'openai') {
    // Direct OpenAI API
    logger.info('AI Client: using OpenAI direct API')
    return {
    client: new OpenAI({
      apiKey:  process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    }),
      model:    process.env.OPENAI_MODEL || 'gpt-4o-mini',
      provider: 'openai',
    }
  }

  // Default: Azure OpenAI
  logger.info('AI Client: using Azure OpenAI')
  return {
    client: new AzureOpenAI({
      endpoint:   process.env.AZURE_OPENAI_ENDPOINT,
      apiKey:     process.env.AZURE_OPENAI_API_KEY,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini',
    }),
    model:    process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini',
    provider: 'azure',
  }
}

// Create a singleton client — initialised once when the module loads
let aiClient = null

function getClient() {
  if (!aiClient) {
    aiClient = createClient()
  }
  return aiClient
}

/**
 * Run a prompt through the AI model and return the text response.
 *
 * @param {string} systemPrompt - The agent's system instructions
 * @param {string} userPrompt   - The specific request for this call
 * @param {Object} options      - Optional overrides: { temperature, maxTokens }
 * @returns {Promise<string>}   - The model's text response
 */
async function runPrompt(systemPrompt, userPrompt, options = {}) {
  const { client, model } = getClient()

  const requestParams = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    temperature: options.temperature ?? 0.3,   // Low temperature = more consistent JSON
    max_tokens:  options.maxTokens  ?? 2000,
  }

  try {
    const response = await client.chat.completions.create(requestParams)
    const content  = response.choices?.[0]?.message?.content || ''
    return content.trim()
  } catch (err) {
    logger.error(`AI API call failed: ${err.message}`)
    throw new Error(`AI request failed: ${err.message}`)
  }
}

/**
 * Run a prompt and parse the response as JSON.
 * Strips markdown code fences if the model wraps the JSON in them.
 *
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {Object} options
 * @returns {Promise<Object|Array>} - Parsed JSON
 */
async function runJSONPrompt(systemPrompt, userPrompt, options = {}) {
  const raw = await runPrompt(systemPrompt, userPrompt, options)

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch (parseErr) {
    logger.error('Failed to parse AI JSON response', { raw: cleaned.substring(0, 300) })
    throw new Error(`AI returned invalid JSON: ${parseErr.message}`)
  }
}

module.exports = { runPrompt, runJSONPrompt, getClient }
