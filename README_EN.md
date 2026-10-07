# ZY AI Native Engine

[中文](README.md) | **English**

> An AI-native enterprise intelligence platform for every industry: it fuses collaboration management (Feishu/DingTalk style) with AI-native automation, covering the **full operating loop** from project planning, building, and marketing acquisition down to financial accounting. Users create an AI-native company, then create projects inside it. AI automatically assembles an agent organization, breaks down tasks, executes in loops, and iterates on deliverables — running and "growing" like a real company.

- Current version: v3.x (under active development; the latest [git log](https://github.com/youkpan/AI-native-engine) and source code prevail)
- Tech stack: Go 1.26 · Vue 3 · PostgreSQL · SQLite · GLM / DeepSeek · [qianshou](https://zyinfo.pro/qianshou/) CLI

---

## Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Three-End Architecture](#three-end-architecture)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Quick Start](#quick-start)
- [Configuration & Ports Cheat Sheet](#configuration--ports-cheat-sheet)
- [Documentation](#documentation)
- [Contact](#contact)

## Introduction

ZY AI Native Engine is an operating platform for "AI-native companies": users create a company and projects on the platform, and the platform provisions a physically isolated project server for each project. An AI manager agent assembles an agent organization (managers + worker agents) based on the project definition, then automatically decomposes tasks, schedules execution, and delivers — with acceptance review — under budget and governance constraints, producing marketing content, business reports, and financial accounting along the way.

It supports both zero-to-one startups (the "OPC" one-person company) and mature multi-department enterprises. Three run modes are available — fully automatic, semi-automatic, and manual review — and at key milestones the system waits for human decisions via Feishu / Telegram notifications.

**Three ends working as one**:

1. **Service Platform (SaaS console)** — accounts, company / project management, project-server instance lifecycle, the platform's real-money ledger, and an admin console.
2. **Project Server (AI execution engine)** — one project per instance with physical isolation; hosts the agent execution loop, model routing, auto-ops scheduling, project ledger, layered knowledge base, and dashboards.
3. **Local Edge Client** — scans and uploads local documents and meeting materials, and runs edge agents on server commands.

## Key Features

### Auto Operations (auto-ops)
- **Three run modes**: fully automatic / semi-automatic / manual review, selected at project creation.
- **Full AI loop**: automatic task decomposition → time-slice round scheduling → review reordering → relay execution → free maintenance; failures degrade → escalate → exit with a safe fallback.
- **Guided project creation / import**: conversational intake generates an execution strategy (must be confirmed before auto-ops starts); existing projects can be imported with their materials and context.

### Dual Execution Engines
- **Loop engine**: spawns a [qianshou](https://zyinfo.pro/qianshou/) subprocess (a Claude Code-like CLI) — best for complex / coding / long-running tasks (default).
- **Agent engine**: in-process LLM + ToolCall — best for information synthesis and API calls.
- Engine selection priority: task-level > role-level > project default.

### Models & Billing
- **Hybrid model routing gateway**: every LLM call goes through one gateway that routes by task complexity (GLM / DeepSeek, etc.), with weight configuration, cost control, circuit breaking, and failover.
- **Token billing**: usage is aggregated from session logs and priced into both the platform's real ledger and the project's AI runtime budget; warning notifications at the threshold, circuit break and pause on overrun.

### Governance & Trust (V2.2)
- **Separation of powers for acceptance**: execution, acceptance, and approval are three independent roles; a dedicated acceptance agent scores deliverables against `done_when` (pass / rework / reject), with intensity tiered by risk.
- **Human in the loop**: RACI plus green / yellow / red decision channels; manual nodes carry SLA, escalation chains, and timeout degradation; supports permission leasing and progressive trust (autonomy levels L1–L5).
- **Objectives & audit**: goal tree (vision → goals → KRs → tasks), independent internal-audit agent, red-team drills, risk register, management transcription audit logs, and an emergency KillSwitch.
- **Permissions & compliance**: MCP connectors follow least privilege; write operations require human review; a mobile approval page handles pending items anywhere.

### Agent Organization & Evolution
- **Agent organization**: owner-responsibility system; manager agents coordinate without hands-on execution while worker agents specialize; three building blocks — experts, skills, connectors.
- **Role self-evolution**: role profiles plus per-role RunConfig (prompts / skill whitelist / engine, etc.); experience accumulation, versioned snapshots, and canary A/B rollout.
- **Organization evolution (V2.5)**: a four-stage org model (startup / growth / scale / maturity). AI senses business growth signals and proactively proposes hires with costs and evidence; supports a "propose → confirm → create role → onboard" expansion flow, stage transitions (snapshot backup / rollback), and eight-dimension quantitative control (budget, autonomy, optimization frequency, model tier, etc.).

### Data & Knowledge
- **Layered knowledge base**: company-level → project-level RAG with shared-child retrieval and a human-gated "pending confirmation" list; supports local document upload and meeting-import digesting (action items can become auto-ops tasks in one click).
- **Data flywheel**: all prompts / outputs / feedback land in structured storage; excellent cases → RAG retrieval injection → dynamic few-shot feedback.
- **Dual ledgers**: the platform's real-money ledger (top-ups / compute fees, circuit-broken on low balance) + virtual project accounting (paused on budget exhaustion) + per-role amoeba accounting.
- **Business visibility**: daily operation / analysis / audit / red-team reports, a business cockpit, monitoring metrics, and project-closure reports (goal attainment, ROI, knowledge assets).

### Ecosystem Capabilities
- **Media generation center**: video / image / song generation, priced per tier into the project ledger.
- **Public customer pages**: public AI Q&A pages (`/s/{token}`) restricted to whitelisted knowledge bases, with rate limits and expiry control.
- **Notifications & collaboration**: Feishu / Telegram notifications, manual handling nodes, approval quotas and batching windows (attention management).

## Three-End Architecture

```
┌────────────────────────────────────────────────────────┐
│      Users / Team members / Admins (browser, mobile)   │
└─────────────┬──────────────────────────────────────────┘
              │ HTTPS
┌─────────────▼────────────────┐   ┌────────────────────┐
│  Service Platform   :18000   │◄──┤  platform-web UI   │
│  platform: accounts,         │   │  Vue3 (dev :5176)  │
│  companies, projects,        │   └────────────────────┘
│  instances, real ledger,     │
│  admin console               │
└─────────────┬────────────────┘
              │ HMAC mutual trust / provisioning
┌─────────────▼────────────────┐   ┌────────────────────┐
│ Project Server      :8090    │◄──┤ qianshou CLI child │
│ project-server: one project  │   │ process (loop      │
│ per instance, physically     │   │ engine)            │
│ isolated; auto-ops sched.,   │   └────────────────────┘
│ acceptance, ledger, RAG,     │
│ reports                      │
└─────────────┬────────────────┘
              │ commands down / data back
┌─────────────▼────────────────┐
│  Local Edge Client           │
│  edge-client: document scan  │
│  & upload, edge agents       │
│  (local SQLite storage)      │
└──────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Go 1.26 (Gin + GORM; three independent Go modules) |
| Frontend | Vue 3 (Composition API) + Vite + TypeScript + Element Plus + Pinia + ECharts |
| Database | PostgreSQL 17 (`ai_native_engine` for the platform, `project_server` for the project server) |
| Edge storage | SQLite 3 (edge client, local) |
| LLMs | GLM + DeepSeek, unified through the hybrid model routing gateway |
| Execution | qianshou CLI subprocess (loop engine) + in-process LLM ToolCall (agent engine) |
| Testing | Go test + Playwright E2E (platform-web) |

## Repository Layout

```
AI-native-engine/
├── platform/          # Service platform (SaaS console backend, :18000)
├── project-server/    # Project server (AI execution engine, :8090)
├── edge-client/       # Local edge client (SQLite)
├── platform-web/      # Unified frontend (Vue3 + Vite, dev :5176)
├── release/           # Release packages and deployment guide (Chinese)
├── deploy/            # Deployment scripts
├── scripts/           # Utility scripts
├── test/              # General tests
└── wiki/              # Documentation hub (PRD / TAD / manuals / changelog / dev notes)
```

## Quick Start

### 1. Requirements

- Go 1.26+
- Node.js 18+ (frontend build and the qianshou CLI)
- PostgreSQL (17 recommended), local default port `5432`
- (Optional, needed by the loop engine) [qianshou CLI](https://zyinfo.pro/qianshou/)

### 2. Prepare the databases

The platform and the project server **require PostgreSQL** (no SQLite fallback); the edge client uses a local SQLite file and needs no deployment.

```sql
CREATE DATABASE ai_native_engine;    -- platform
CREATE DATABASE project_server;      -- project server
```

Tables and migrations are created automatically on first start.

### 3. Configure

Two config files: `platform/configs/config.yaml` and `project-server/configs/config.yaml` (copy from `config.example.yaml` in the same directory) — mainly the database connection. In production, prefer environment-variable overrides (prefixes `AE_` / `PS_`), for example:

```bash
AE_DATABASE_PASSWORD=...   # platform DB password
AE_JWT_SECRET=...          # platform JWT secret
PS_DATABASE_PASSWORD=...   # project-server DB password
PS_LLM_DEEPSEEK_API_KEY=sk-...   # DeepSeek API key
PS_LLM_GLM_API_KEY=...           # GLM API key
```

### 4. Build & run

```bash
# Platform (default :18000)
cd platform && go build -o server.exe ./cmd/server && ./server.exe

# Project server (default :8090)
cd project-server && go build -o server.exe ./cmd/server && ./server.exe

# Frontend (dev mode :5176)
cd platform-web && npm install && npm run dev
```

For production, build the frontend with `npm run build` and serve the static assets through the platform's `web_port` static proxy on one port (see `release/v1.0/使用说明.md`, in Chinese).

### 5. Link the project-server instance

1. Log in to the platform, create a company, then create a project under "Project Management" with instance host `127.0.0.1` and port `8090`.
2. Generate the instance's HMAC Secret on the platform and put it into `project-server/configs/config.yaml` to establish mutual trust.

### 6. Install qianshou (needed by the loop engine)

In PowerShell:

```powershell
winget install --exact --source winget --id Git.Git
winget install --exact --source winget --id OpenJS.NodeJS
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
npm install -g qianshou --registry=https://registry.npmmirror.com
```

Set the LLM key as the `QS_AUTH_TOKEN` environment variable (or put it in the startup script).

### 7. License activation

The platform activates online automatically on startup; without activation it runs for only 20–30 minutes. Inject the license key via the `AE_LICENSE_AUTH_KEY` environment variable, or check the machine code and activate manually under "Settings → License Management".

## Configuration & Ports Cheat Sheet

| Port / Variable | Purpose |
| --- | --- |
| `18000` | Platform API (`platform`) |
| `8090` | Project-server API (`project-server`) |
| `5176` | Frontend Vite dev server (`platform-web`) |
| `5432` | PostgreSQL |
| `AE_*` | Platform env-var prefix (database / JWT / license, etc.) |
| `PS_*` | Project-server env-var prefix (database / LLM keys, etc.) |
| `QS_AUTH_TOKEN` | qianshou CLI auth token |
| `AE_LICENSE_AUTH_KEY` | Platform license activation key |

## Documentation

| Document | Description |
| --- | --- |
| [wiki/PRD-v2.md](wiki/PRD-v2.md) | V2.2 PRD (three-end architecture, core flows, functional requirements) — Chinese |
| [wiki/PRD-v2.5-final-feat.md](wiki/PRD-v2.5-final-feat.md) | Organization Evolution PRD (four-stage model, hiring suggestions, one-click expansion, quantitative control) — Chinese |
| [wiki/TAD-v2/](wiki/TAD-v2/) | Technical architecture design — Chinese |
| [wiki/manuals/新手入门到精通/](wiki/manuals/新手入门到精通/) | 20-chapter user manual (companies, projects, auto-ops, task pipeline, metrics, cases, FAQ) — Chinese |
| [wiki/manuals/zy-engine/](wiki/manuals/zy-engine/) | OPC one-person-company starter handbook, etc. — Chinese |
| [release/v1.0/使用说明.md](release/v1.0/使用说明.md) | Release deployment & licensing guide — Chinese |
| [wiki/changelog/](wiki/changelog/) | Iteration changelog — Chinese |
| [wiki/dev-memory.md](wiki/dev-memory.md) | Dev memory (environment / decisions / progress) — Chinese |

> Note: documentation may lag behind the code; when in doubt, the latest code and git log prevail.

## Contact

- WeChat: `youkpan`
- Shenzhen ZhanYing Technology (深圳展映科技)
