// ─────────────────────────────────────────────
// AccessPilot Logger
// Timestamped, colour-coded console logger
// ─────────────────────────────────────────────

const COLOURS = {
  reset:  '\x1b[0m',
  blue:   '\x1b[34m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  grey:   '\x1b[90m',
  bold:   '\x1b[1m',
}

function timestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19)
}

function format(level, colour, emoji, message, data) {
  const ts     = `${COLOURS.grey}[${timestamp()}]${COLOURS.reset}`
  const lvl    = `${colour}${COLOURS.bold}${emoji} ${level}${COLOURS.reset}`
  const msg    = `${colour}${message}${COLOURS.reset}`
  const suffix = data ? `\n${COLOURS.grey}${JSON.stringify(data, null, 2)}${COLOURS.reset}` : ''
  return `${ts} ${lvl} ${msg}${suffix}`
}

const logger = {
  info(message, data) {
    console.log(format('INFO ', COLOURS.blue,  'ℹ', message, data))
  },
  success(message, data) {
    console.log(format('OK   ', COLOURS.green,  '✓', message, data))
  },
  warn(message, data) {
    console.warn(format('WARN ', COLOURS.yellow, '⚠', message, data))
  },
  error(message, data) {
    console.error(format('ERROR', COLOURS.red,   '✗', message, data))
  },
  agent(agentName, message, data) {
    const colour = {
      Scanner:   COLOURS.cyan,
      Reasoning: COLOURS.blue,
      Fix:       COLOURS.green,
      Coach:     COLOURS.yellow,
    }[agentName] || COLOURS.grey
    console.log(format(`[${agentName}]`, colour, '🤖', message, data))
  },
  divider() {
    console.log(`${COLOURS.grey}${'─'.repeat(60)}${COLOURS.reset}`)
  },
}

module.exports = logger
