// ─────────────────────────────────────────────
// AccessPilot — Health Check Route
// GET /health
//
// Used by:
//   - Azure App Service health probe
//   - Frontend to check if backend is reachable
//   - Your own debugging
// ─────────────────────────────────────────────

const express = require('express')
const router  = express.Router()

router.get('/health', (req, res) => {
  res.status(200).json({
    status:    'ok',
    service:   'AccessPilot Backend',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    ai: {
      provider:   process.env.AI_PROVIDER || 'azure',
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.OPENAI_MODEL || 'not configured',
      endpoint:   process.env.AZURE_OPENAI_ENDPOINT ? 'configured' : 'not configured',
    },
    environment: process.env.NODE_ENV || 'development',
  })
})

module.exports = router
