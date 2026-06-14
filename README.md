# AccessPilot — AI-Powered Accessibility Copilot

> **AccessPilot** scans websites, identifies WCAG accessibility barriers, and generates actionable AI-powered fixes to make the web accessible for everyone.

<div align="center">

![AccessPilot Banner](https://img.shields.io/badge/AccessPilot-AI%20Accessibility%20Copilot-3366f4?style=for-the-badge&logo=microsoft&logoColor=white)
![Microsoft Agents League](https://img.shields.io/badge/Microsoft-Agents%20League%202026-0078d4?style=for-the-badge&logo=microsoft&logoColor=white)
![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20Level%20AA-16a34a?style=for-the-badge)
![Azure OpenAI](https://img.shields.io/badge/Azure-OpenAI%20GPT--4o-0078d4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)

**[Live Demo](#) · [Video Demo](#) · [Architecture](#architecture) · [Setup Guide](#quick-start)**

</div>

---

## The Problem

**1 billion people** live with disabilities worldwide. Yet over **96% of the top 1 million websites** have detectable WCAG accessibility failures. Most developers don't fix these issues not because they don't care — but because:

- They don't know what's broken
- They don't understand why it matters to real users
- They don't know how to fix it

**AccessPilot solves all three problems at once.**

---

## What AccessPilot Does

Paste any website URL. In under 30 seconds, AccessPilot:

1. **Scans** the page using axe-core — the industry standard WCAG engine used by Microsoft, Google, and Deque
2. **Reasons** about every violation using Azure OpenAI — explaining severity and real user impact
3. **Fixes** each issue — generating copy-paste-ready HTML and ARIA code
4. **Coaches** you — producing a prioritised plain-English action plan with learning resources

---

## Agent Architecture

AccessPilot is built as a **4-agent sequential pipeline** on Azure AI Foundry:

```
User submits URL
      │
      ▼
┌─────────────────────────────────────────────┐
│           Express API Orchestrator           │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────┐
│   Agent 1: Scanner  │  Puppeteer + axe-core
│                     │  Loads page, runs WCAG audit
│  Output: violations │  No AI — pure engine
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Agent 2: Reasoning  │  Azure OpenAI GPT-4o-mini
│                     │  Classifies severity
│  Output: severity + │  Explains user impact
│  WCAG refs + impact │  Maps to WCAG criteria
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│    Agent 3: Fix     │  Azure OpenAI GPT-4o-mini
│                     │  Generates corrected HTML
│  Output: fixedHTML  │  Adds ARIA attributes
│  + ariaFix + tips   │  Writes recommendations
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   Agent 4: Coach    │  Azure OpenAI GPT-4o-mini
│                     │  Plain-English summary
│  Output: action     │  Priority action list
│  plan + tips        │  Learning resources
└─────────────────────┘
         │
         ▼
  Complete AccessPilot Report JSON
  (score, violations, fixes, coaching)
```

---

## Features

| Feature | Description |
|---|---|
| 🔍 **WCAG 2.1 AA Audit** | Full axe-core scan against all Level A and AA criteria |
| 🧠 **AI Severity Analysis** | GPT-4o-mini classifies every violation by real-world impact |
| 🔧 **Auto-Generated Fixes** | Copy-paste HTML and ARIA fixes for every violation |
| 🎯 **Developer Coach** | Plain-English action plan with learning resources |
| 📊 **Accessibility Score** | 0-100 score with animated ring and grade label |
| ⏱️ **Agent Timeline** | Live execution timeline showing each agent's progress |
| 📄 **Downloadable Report** | Export full report as JSON or PDF |
| 🎨 **Microsoft Fluent Design** | Clean, professional UI inspired by Microsoft's design system |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework — deployed to Azure Static Web Apps |
| TailwindCSS | Utility-first styling |
| DM Sans + Syne fonts | Clean, modern typography |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | API server — deployed to Azure App Service |
| Puppeteer | Headless Chrome for JavaScript-rendered page loading |
| axe-core 4.x | WCAG 2.1 accessibility audit engine |

### AI & Azure
| Technology | Purpose |
|---|---|
| Azure AI Foundry | Agent orchestration platform |
| Azure OpenAI GPT-4o-mini | Powers Reasoning, Fix, and Coach agents |
| Azure Static Web Apps | Frontend hosting |
| Azure App Service | Backend API hosting |

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- An Azure account with Azure OpenAI access
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/obsidianchike/accesspilot.git
cd accesspilot
```

### 2. Set Up the Backend
```bash
cd backend
npm install
npx puppeteer browsers install chrome
cp .env.example .env
```

Edit `.env` with your Azure credentials:
```bash
AI_PROVIDER=azure
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-08-01-preview
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

Verify it's running:
```
http://localhost:4000/health
```

### 3. Set Up the Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open AccessPilot
```
http://localhost:3000
```

Paste any URL and click **Scan for Accessibility Issues**.

---

## Project Structure

```
accesspilot/
├── frontend/                    # Next.js 14 app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js        # Root layout + fonts
│   │   │   ├── page.js          # Home page
│   │   │   └── globals.css      # Global styles + tokens
│   │   ├── components/
│   │   │   ├── ui/              # Button, Badge, Card, ScoreRing, Spinner
│   │   │   ├── scan/            # UrlInput, ScanButton, ScanProgress
│   │   │   ├── results/         # ScoreCard, AgentTimeline, ViolationList,
│   │   │   │                    # ViolationCard, FixPanel, CoachSummary,
│   │   │   │                    # ReportDownload
│   │   │   └── layout/          # Header, Footer
│   │   ├── hooks/
│   │   │   ├── useScan.js       # Scan state machine
│   │   │   └── useReport.js     # Report download
│   │   └── lib/
│   │       ├── api.js           # Backend fetch wrapper
│   │       ├── scoring.js       # Score calculator
│   │       └── constants.js     # Severity config + mock data
│   └── package.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── server.js            # Express entry point
│   │   ├── routes/
│   │   │   ├── scan.js          # POST /api/scan
│   │   │   └── health.js        # GET /health
│   │   ├── agents/
│   │   │   ├── scannerAgent.js   # Agent 1: axe-core
│   │   │   ├── reasoningAgent.js # Agent 2: Azure OpenAI
│   │   │   ├── fixAgent.js       # Agent 3: Azure OpenAI
│   │   │   └── coachAgent.js     # Agent 4: Azure OpenAI
│   │   ├── orchestrator/
│   │   │   └── agentOrchestrator.js  # Pipeline runner
│   │   ├── services/
│   │   │   ├── azureOpenAI.js    # AI client (Azure + OpenAI)
│   │   │   └── puppeteerService.js   # Headless browser
│   │   ├── prompts/
│   │   │   ├── reasoningPrompt.js
│   │   │   ├── fixPrompt.js
│   │   │   └── coachPrompt.js
│   │   └── utils/
│   │       ├── scoring.js        # Score formula
│   │       ├── reportBuilder.js  # Report assembler
│   │       └── logger.js         # Console logger
│   └── package.json
│
└── README.md
```

---

## Report JSON Schema

Every AccessPilot scan produces a structured report:

```json
{
  "scanId": "ap-uuid-here",
  "url": "https://example.com",
  "pageTitle": "Example Domain",
  "timestamp": "2026-06-13T14:30:24Z",
  "score": 94,
  "summary": {
    "total": 2,
    "critical": 0,
    "serious": 0,
    "moderate": 2,
    "minor": 0,
    "passes": 13,
    "incomplete": 0
  },
  "agentTimeline": [
    { "agent": "Scanner",   "status": "complete", "durationMs": 5384 },
    { "agent": "Reasoning", "status": "complete", "durationMs": 7826 },
    { "agent": "Fix",       "status": "complete", "durationMs": 5382 },
    { "agent": "Coach",     "status": "complete", "durationMs": 5814 }
  ],
  "violations": [
    {
      "id": "landmark-one-main",
      "description": "Ensure the document has a main landmark",
      "severity": "moderate",
      "wcagRef": "WCAG 2.1 — 1.3.1 Info and Relationships",
      "wcagLevel": "Level A",
      "userImpact": "Screen reader users cannot quickly navigate to the main content area.",
      "explanation": "The page lacks a main landmark...",
      "fixedHTML": "<main>...</main>",
      "ariaFix": "Add role=\"main\" as an alternative...",
      "recommendation": "Always wrap your primary page content in a <main> element.",
      "coachTip": "A <main> landmark is like a signpost for screen reader users..."
    }
  ],
  "coachSummary": {
    "overview": "Your site scores 94/100...",
    "priorityList": ["Add a <main> landmark element", "..."],
    "learningTips": ["Install axe DevTools", "..."]
  }
}
```

---

## Scoring Formula

```
Score = 100 - (critical×8 + serious×5 + moderate×3 + minor×1)
Score floors at 0 and caps at 100

Grade:
  90-100 → Excellent  (green)
  75-89  → Good       (yellow)
  50-74  → Needs Work (orange)
  0-49   → Poor       (red)
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AI_PROVIDER` | Yes | `azure` or `openai` |
| `AZURE_OPENAI_ENDPOINT` | If azure | Your Azure OpenAI resource endpoint |
| `AZURE_OPENAI_API_KEY` | If azure | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | If azure | Deployment name (e.g. `gpt-4o-mini`) |
| `AZURE_OPENAI_API_VERSION` | If azure | API version (e.g. `2024-08-01-preview`) |
| `OPENAI_API_KEY` | If openai | OpenAI or GitHub Models API key |
| `OPENAI_MODEL` | If openai | Model name (e.g. `gpt-4o-mini`) |
| `OPENAI_BASE_URL` | If GitHub Models | `https://models.inference.ai.azure.com` |
| `PORT` | No | Backend port (default: 4000) |
| `NODE_ENV` | No | `development` or `production` |
| `FRONTEND_URL` | No | Frontend URL for CORS |
| `PUPPETEER_NO_SANDBOX` | No | Set `true` on Azure App Service |

---

## API Reference

### POST /api/scan
Scan a website through the full 4-agent pipeline.

**Request:**
```json
{ "url": "https://example.com" }
```

**Response:** Full AccessPilot report JSON (see schema above)

---

### GET /health
Health check endpoint for Azure App Service probes.

**Response:**
```json
{
  "status": "ok",
  "service": "AccessPilot Backend",
  "version": "1.0.0",
  "ai": { "provider": "azure", "deployment": "gpt-4o-mini" }
}
```

---

### GET /api/scan/test
Returns a mock report instantly — useful for frontend testing without running a real scan.

---

## Why AccessPilot Matters

> **1 in 4 adults** in the US lives with a disability.
> **71% of disabled users** leave a website immediately if it's hard to use.
> **98% of home pages** have WCAG failures.
> Legal risk is real — **accessibility lawsuits increased 300%** in the past 5 years.

AccessPilot turns a complex, specialist problem into something any developer can solve in minutes — regardless of their accessibility expertise.

---

## Hackathon Submission

**Event:** Microsoft Agents League Hackathon 2026

**Team:** Prince Amadi (obsidianchike)

**Pitch:** AccessPilot — An AI-powered accessibility copilot that scans websites, identifies barriers, and generates actionable fixes to make the web accessible for everyone.

**Microsoft Technologies Used:**
- ✅ Azure AI Foundry — agent orchestration
- ✅ Azure OpenAI GPT-4o-mini — 3 AI agents
- ✅ Azure Static Web Apps — frontend hosting
- ✅ Azure App Service — backend hosting
- ✅ GitHub Models — development API access

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ for the Microsoft Agents League Hackathon 2026

**AccessPilot — Making the web accessible for everyone**

</div>
