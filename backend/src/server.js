// ─────────────────────────────────────────────
// AccessPilot — Express Server
// Entry point for the backend API
//
// Endpoints:
//   GET  /health       → health check
//   POST /api/scan     → run 4-agent pipeline
//   GET  /api/scan/test→ test endpoint (no real scan)
// ─────────────────────────────────────────────

// Load environment variables FIRST — before anything else
require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const logger     = require('./utils/logger')
const healthRoute = require('./routes/health')
const scanRoute   = require('./routes/scan')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware ────────────────────────────────────────────

// CORS — allow requests from the Next.js frontend
const allowedOrigins = [
  'http://localhost:3000',                          // local dev
  'http://localhost:3001',                          // alternate local port
  process.env.FRONTEND_URL,                         // production frontend URL
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') return callback(null, true)
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  methods:          ['GET', 'POST', 'OPTIONS'],
  allowedHeaders:   ['Content-Type', 'Authorization'],
  credentials:      true,
}))

// Parse JSON request bodies
app.use(express.json({ limit: '1mb' }))
// Increase server timeout to 3 minutes for large site scans
app.use((req, res, next) => {
  res.setTimeout(180000)
  next()
})

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }))

// Request logger — logs every incoming request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// ── Routes ────────────────────────────────────────────────

// Health check — GET /health
app.use('/', healthRoute)

// Scan routes — POST /api/scan, GET /api/scan/test
app.use('/api', scanRoute)

// Root — friendly message for anyone who visits the base URL
app.get('/', (req, res) => {
  res.status(200).json({
    name:        'AccessPilot API',
    version:     '1.0.0',
    description: 'AI-powered accessibility auditing backend',
    pitch:       'AccessPilot — AI-powered accessibility copilot that scans websites, identifies barriers, and generates actionable fixes.',
    endpoints: {
      health:   'GET  /health',
      scan:     'POST /api/scan      { url: "https://example.com" }',
      test:     'GET  /api/scan/test (returns mock report)',
    },
    hackathon: 'Microsoft Agents League Hackathon 2026',
  })
})

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error:   true,
    message: `Route not found: ${req.method} ${req.path}`,
  })
})

// ── Global Error Handler ──────────────────────────────────
// Catches any unhandled errors from route handlers
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`)
  res.status(500).json({
    error:   true,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  })
})

// ── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  logger.divider()
  logger.success(`AccessPilot backend running on port ${PORT}`)
  logger.info(`Environment:  ${process.env.NODE_ENV || 'development'}`)
  logger.info(`AI Provider:  ${process.env.AI_PROVIDER || 'azure'}`)
  logger.info(`AI Model:     ${process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.OPENAI_MODEL || 'not set'}`)
  logger.info(`Health check: http://localhost:${PORT}/health`)
  logger.info(`Test scan:    http://localhost:${PORT}/api/scan/test`)
  logger.divider()
})

module.exports = app
