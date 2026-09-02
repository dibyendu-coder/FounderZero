# 🚀 FounderZero

> **The Zero-Budget Startup Growth Operating System for Founders**  
> An autonomous, evidence-driven AI copilot and telemetry dashboard built to help solo builders and early-stage founders achieve Product-Market Fit (PMF) with ₹0 ad spend.

---

## ✨ Features Overview

### 🤖 Founder Copilot (AI Thinking Partner)
- **Evidence-First AI Reasoning**: Analyzes real-time metrics, user telemetry, and qualitative customer feedback before recommending actions.
- **Slash Commands (`/commands`)**: Quick modes for `/reality-check`, `/retention`, `/pricing`, `/growth`, and `/building`.
- **Action Proposals**: Converts AI insights into 1-click executable Missions, Telemetry Experiments, or Notepad strategy drafts.
- **Progressive Streaming**: High-throughput Server-Sent Events (SSE) streaming backed by Groq LLM & Gemini AI models.

### 📊 Startup Telemetry & Diagnostics
- **Retention & Funnel Benchmarking**: Real-time tracking of Day-7 retention, signups, MRR, and activation drop-offs.
- **Founder Score & Health Dimensions**: Instant calibration across growth, distribution, product activation, and runway.
- **Bottleneck Identification**: Pinpoints exact leverage points preventing user activation and retention.

### 🎯 Growth Missions & Experiments Engine
- **Zero-Burn Distribution Sprints**: Actionable 7-day distribution playbooks for Show HN, IndieHackers, and developer communities.
- **Hypothesis-Driven Experiments**: Track structured growth experiments with target metrics, cohort duration, and baseline values.

### 📝 Founder Strategy Notepad
- **Interactive Block Editor**: Create and organize strategy notes, checklists, and execution logs.
- **1-Click Copilot Sync**: Save action proposals directly from Copilot chats into tagged Notepad collections.

### 📚 Curated Resource Vault
- Free-tier SaaS tools, open-source libraries, and zero-budget growth guides tailored for technical founders.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & Icons** | TailwindCSS v4, Lucide React |
| **Charts & Visualization**| Recharts, Framer Motion |
| **Backend API** | Express.js, TypeScript (`server.ts`) |
| **LLM & AI Engine** | Groq SDK (`llama-3.3-70b-versatile`), Google GenAI |
| **Persistence** | Local JSON Store (`founderzero-db.json`) / Firebase |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/founderzero.git
cd founderzero
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Groq API Key for Founder Copilot (Required for AI Reasoning)
GROQ_API_KEY=your_groq_api_key_here

# Optional: Gemini API Key (Fallback)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port
PORT=3000
```

> 💡 *Note: If no API key is configured, Founder Copilot automatically operates using its built-in deterministic heuristic reasoning engine.*

### 3. Development Server
Start the development server with hot-reloading:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
Build the optimized static frontend bundle and server executable:
```bash
npm run build
```

To run the production build locally:
```bash
npm start
```

---

## 📂 Project Architecture

```
FounderZero/
├── api/                   # Vercel serverless function entry points
├── data/                  # Local persistent JSON database storage
├── server/                # Backend services & AI engines
│   ├── db.ts              # App state persistence & database adapters
│   ├── copilotEngine.ts   # Context retrieval & prompt engineering
│   └── onboardingEngine.ts# Founder state initialization
├── src/                   # React frontend application
│   ├── components/        # UI components & Copilot widgets
│   ├── pages/             # Dashboard, Copilot, Missions, Notepad pages
│   ├── types.ts           # Shared TypeScript interfaces & state schemas
│   └── App.tsx            # Main application layout & routing
├── server.ts              # Express API server & SSE streaming routes
├── vite.config.ts         # Vite build configuration
└── package.json           # Project dependencies & scripts
```

---

## 📜 Available Scripts

- `npm run dev`: Starts the TypeScript Express backend with Vite middleware.
- `npm run build`: Bundles the client app with Vite and server with Esbuild.
- `npm start`: Runs the compiled CJS server from `dist/server.cjs`.
- `npm run lint`: Runs TypeScript type checking (`tsc --noEmit`).

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
