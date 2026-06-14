'use client'

import { useCallback } from 'react'

// ─────────────────────────────────────────────
// useReport — AccessPilot report download hook
//
// Two download modes:
//   1. JSON — downloads the raw report as a .json file
//   2. PDF  — opens a print-friendly version and triggers browser print
// ─────────────────────────────────────────────

export function useReport(result) {
  /**
   * Download the full report as a JSON file.
   * Creates a Blob, attaches it to a temporary <a> tag, clicks it, then cleans up.
   */
  const downloadJSON = useCallback(() => {
    if (!result) return

    const blob = new Blob(
      [JSON.stringify(result, null, 2)],
      { type: 'application/json' }
    )

    const url      = URL.createObjectURL(blob)
    const link     = document.createElement('a')
    const filename = `accesspilot-report-${result.scanId || Date.now()}.json`

    link.href     = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [result])

  /**
   * Download the report as a PDF.
   * Opens a new window with a print-friendly HTML version of the report,
   * then triggers the browser's print dialog (Ctrl+P → Save as PDF).
   */
  const downloadPDF = useCallback(() => {
    if (!result) return

    const { url, score, summary, violations, coachSummary, timestamp } = result

    // Build violation rows for the print view
    const violationRows = violations.map(v => `
      <div class="violation">
        <div class="violation-header">
          <span class="badge badge-${v.severity}">${v.severity.toUpperCase()}</span>
          <strong>${v.description}</strong>
        </div>
        <p><strong>WCAG:</strong> ${v.wcagRef} · ${v.wcagLevel}</p>
        <p><strong>Impact:</strong> ${v.userImpact}</p>
        <p><strong>Fix:</strong> ${v.recommendation}</p>
        <pre class="code">${escapeHtml(v.fixedHTML)}</pre>
      </div>
    `).join('')

    const priorityItems = (coachSummary?.priorityList || [])
      .map(item => `<li>${item}</li>`)
      .join('')

    const printHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AccessPilot Report — ${url}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; color: #0f172a; padding: 40px; font-size: 14px; line-height: 1.6; }
    h1 { font-size: 24px; color: #3366f4; margin-bottom: 4px; }
    .meta { color: #64748b; margin-bottom: 32px; font-size: 13px; }
    .score-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; display: flex; gap: 32px; align-items: center; }
    .score-number { font-size: 48px; font-weight: 700; color: #3366f4; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
    .summary-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
    .summary-item .count { font-size: 24px; font-weight: 700; }
    .summary-item .label { font-size: 12px; color: #64748b; }
    h2 { font-size: 18px; margin-bottom: 16px; margin-top: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .violation { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; page-break-inside: avoid; }
    .violation-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .badge { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-critical { background: #fff1f2; color: #b91c1c; }
    .badge-serious  { background: #fff7ed; color: #c2410c; }
    .badge-moderate { background: #fefce8; color: #a16207; }
    .badge-minor    { background: #f0fdf4; color: #15803d; }
    .violation p { margin-bottom: 6px; font-size: 13px; }
    .code { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 12px; overflow-x: auto; white-space: pre-wrap; margin-top: 8px; }
    .coach { background: #eef4ff; border: 1px solid #bcd4fe; border-radius: 8px; padding: 20px; margin-top: 24px; }
    .coach p { margin-bottom: 12px; }
    .coach ul { padding-left: 20px; }
    .coach li { margin-bottom: 6px; font-size: 13px; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
    @media print {
      body { padding: 20px; }
      .score-block, .violation, .coach { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>AccessPilot Accessibility Report</h1>
  <p class="meta">
    Scanned: <strong>${url}</strong> &nbsp;·&nbsp;
    Date: <strong>${new Date(timestamp).toLocaleString()}</strong>
  </p>

  <div class="score-block">
    <div>
      <div class="score-number">${score}/100</div>
      <div style="color:#64748b">Accessibility Score</div>
    </div>
    <div>
      <p><strong>${summary.total}</strong> violations found &nbsp;·&nbsp; <strong>${summary.passes}</strong> rules passed</p>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-item">
      <div class="count" style="color:#dc2626">${summary.critical}</div>
      <div class="label">Critical</div>
    </div>
    <div class="summary-item">
      <div class="count" style="color:#ea580c">${summary.serious}</div>
      <div class="label">Serious</div>
    </div>
    <div class="summary-item">
      <div class="count" style="color:#ca8a04">${summary.moderate}</div>
      <div class="label">Moderate</div>
    </div>
    <div class="summary-item">
      <div class="count" style="color:#16a34a">${summary.minor}</div>
      <div class="label">Minor</div>
    </div>
  </div>

  <h2>AI Coach Summary</h2>
  <div class="coach">
    <p>${coachSummary?.overview || ''}</p>
    <strong>Priority Actions:</strong>
    <ul>${priorityItems}</ul>
  </div>

  <h2>Violations (${violations.length})</h2>
  ${violationRows}

  <div class="footer">
    Generated by AccessPilot — AI-powered accessibility copilot &nbsp;·&nbsp;
    Microsoft Agents League Hackathon 2026
  </div>

  <script>window.onload = () => window.print()</script>
</body>
</html>`

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printHTML)
      printWindow.document.close()
    }
  }, [result])

  return { downloadJSON, downloadPDF }
}

// Helper: escape HTML special chars for safe rendering in print view
function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
