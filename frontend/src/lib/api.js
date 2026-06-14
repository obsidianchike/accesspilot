// ─────────────────────────────────────────────
// AccessPilot API Client
// ─────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function scanUrl(url) {
  // Use AbortController to set a 120 second timeout
  // BBC and large sites can take 60-90 seconds
  const controller = new AbortController()
  const timeoutId  = setTimeout(() => controller.abort(), 120000)

  try {
    const response = await fetch(`${BASE_URL}/api/scan`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url }),
      signal:  controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let message = `Server error: ${response.status}`
      try {
        const errorBody = await response.json()
        message = errorBody.message || message
      } catch { }
      throw new Error(message)
    }

    return response.json()

  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Scan timed out — the site took too long to respond. Try a simpler URL.')
    }
    throw err
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}