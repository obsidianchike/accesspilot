'use client'

import { useState, useCallback } from 'react'
import { scanUrl } from '../lib/api'
import { MOCK_SCAN_RESULT } from '../lib/constants'

// ─────────────────────────────────────────────
// useScan — AccessPilot scan state machine
//
// States: idle → scanning → complete → error
//         (reset goes back to idle)
//
// During Phase 2 (frontend only), set USE_MOCK=true.
// In Phase 4 when the backend is live, set USE_MOCK=false.
// ─────────────────────────────────────────────

// Set to true to use mock data while backend isn't ready
const USE_MOCK = false

// Simulated agent progress delays (milliseconds) for the mock
const MOCK_AGENT_DELAYS = [1200, 2000, 2800, 3400]

export function useScan() {
  const [state,    setState]    = useState('idle')    // idle | scanning | complete | error
  const [result,   setResult]   = useState(null)      // Full AccessPilot report JSON
  const [error,    setError]    = useState(null)      // Error message string
  const [progress, setProgress] = useState([])        // Array of completed agent names

  /**
   * Start a scan.
   * In mock mode: simulates agent progress with delays.
   * In live mode: calls the real backend API.
   *
   * @param {string} url - The URL to scan
   */
  const startScan = useCallback(async (url) => {
    // Reset state
    setState('scanning')
    setResult(null)
    setError(null)
    setProgress([])

    if (USE_MOCK) {
      // ── Mock mode: simulate agent pipeline ──────────────
      const agents = ['Scanner', 'Reasoning', 'Fix', 'Coach']

      try {
        for (let i = 0; i < agents.length; i++) {
          // Wait for this agent's simulated delay
          await new Promise(resolve => setTimeout(resolve, MOCK_AGENT_DELAYS[i]))
          // Mark this agent as complete
          setProgress(prev => [...prev, agents[i]])
        }

        // Small pause before showing results
        await new Promise(resolve => setTimeout(resolve, 400))

        setResult(MOCK_SCAN_RESULT)
        setState('complete')
      } catch (err) {
        setError('Mock scan failed unexpectedly.')
        setState('error')
      }

    } else {
  // ── Live mode: call the real backend ────────────────
  try {
    const report = await scanUrl(url)
    if (report && report.scanId) {
      setResult(report)
      setState('complete')
    } else {
      throw new Error('Invalid response from server')
    }
  } catch (err) {
    // Only show error if scan truly failed
    // Don't error on timeout — backend may still be running
    if (err.name === 'AbortError' || err.message?.includes('timed out')) {
      setError('The site took too long to scan. Try https://example.com instead.')
    } else {
      setError(err.message || 'Scan failed. Please try again.')
    }
    setState('error')
  }
}
  }, [])

  /**
   * Reset back to idle so the user can scan a new URL.
   */
  const reset = useCallback(() => {
    setState('idle')
    setResult(null)
    setError(null)
    setProgress([])
  }, [])

  return {
    state,       // Current state string
    result,      // Report object (null until complete)
    error,       // Error string (null unless errored)
    progress,    // ['Scanner', 'Reasoning', ...] — agents completed so far
    startScan,   // Function: (url: string) => void
    reset,       // Function: () => void
    isIdle:      state === 'idle',
    isScanning:  state === 'scanning',
    isComplete:  state === 'complete',
    isError:     state === 'error',
  }
}
