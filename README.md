# ServiceDesk 

<div align="center">

![Servicedesk Banner](./public/favicon.svg)

An enterprise-grade IT Service Management (ITSM) and Asset Lifecycle platform powered by real-time WebSockets and multi-model AI diagnostics.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_%26_Mongoose_9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Groq%20%7C%20Gemini%20%7C%20OpenAI-FF6B6B?style=flat-square&logo=openai&logoColor=white)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [How the Platform Works](#-how-the-platform-works)
  - [1. AI-Driven First Response & Self-Service](#1-ai-driven-first-response--self-service)
  - [2. Intelligent SLA Management Engine](#2-intelligent-sla-management-engine)
  - [3. Technician Dispatch & Workstation](#3-technician-dispatch--workstation)
  - [4. Real-Time Collaboration & Auditing](#4-real-time-collaboration--auditing)
- [Key Features by Role](#-key-features-by-role)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Seeding](#database-seeding)
  - [Running the Application](#running-the-application)
- [Automated API Testing](#-automated-api-testing)
- [Project Directory Structure](#-project-directory-structure)

---

##  Overview

**Servicedesk** modernizes enterprise IT operations by merging self-healing AI diagnostic assistants with standard ITIL service workflows. It replaces clunky ticketing interfaces with a streamlined, real-time reactive workspace designed for employees, IT technicians, department managers, and system administrators.

Whether an employee faces VPN gateway failure, needs software license allocation, or requires identity recovery, Servicedesk automates symptom analysis, dynamically assigns SLA policies, distributes tickets to available specialists, and monitors resolution compliance in real time.

---

## ⚙️ How the Platform Works

```
                                ┌────────────────────────────────────────────────────────┐
                                │             EMPLOYEE SELF-SERVICE PORTAL               │
                                └──────────────────────────┬─────────────────────────────┘
                                                           │
                                   ┌───────────────────────┴───────────────────────┐
                                   ▼                                               ▼
                        [Direct Ticket Creation]                      [AI Diagnostic Console]
                                   │                                               │
                                   │                              • Interactive Symptom Probing
                                   │                              • Real-Time Troubleshooting
                                   │                              • Automated Category & Urgency
                                   │                                               │
                                   └───────────────────────┬───────────────────────┘
                                                           │
                                                           ▼
                                         ┌──────────────────────────────────┐
                                         │       SLA POLICY ENGINE          │
                                         ├──────────────────────────────────┤
                                         │ • CRITICAL: 15m resp / 2h resol  │
                                         │ • HIGH:     30m resp / 4h resol  │
                                         │ • MEDIUM:  120m resp / 8h resol  │
                                         │ • LOW:     480m resp / 24h resol │
                                         └─────────────────┬────────────────┘
                                                           │
                                                           ▼
                                         ┌──────────────────────────────────┐
                                         │   CENTRAL DISPATCH & QUEUE       │
                                         ├──────────────────────────────────┤
                                         │ • Manager Dispatch or Self-Claim │
                                         │ • Workload Heatmap Distribution  │
                                         └─────────────────┬────────────────┘
                                                           │
                                                           ▼
                                         ┌──────────────────────────────────┐
                                         │     TECHNICIAN WORKSTATION       │
                                         ├──────────────────────────────────┤
                                         │ • Live Stopwatch & Time Logs     │
                                         │ • Dual Notes (Internal vs Public)│
                                         │ • Linked Asset Diagnostics       │
                                         └─────────────────┬────────────────┘
                                                           │
                                                           ▼
                                         ┌──────────────────────────────────┐
                                         │    RESOLUTION & CSAT AUDIT       │
                                         ├──────────────────────────────────┤
                                         │ • Requester Confirmation/Reopen  │
                                         │ • Star Rating & Feedback         │
                                         │ • Immutable Audit Trail Logged   │
                                         └──────────────────────────────────┘
```

### 1. AI-Driven First Response & Self-Service
- **Guided AI Triage**: When employees experience technical hitches, they engage with the interactive **AI Support Diagnostic Console**.
- **Interactive Probing**: Instead of submitting vague tickets, the AI queries the user for specific error messages, network states, and affected hardware.
- **One-Click Escalation**: If automated remediation fails, the AI formulates a structured incident dossier (summary, observed symptoms, recommended technician actions, priority, and category) and escalates it to a formal ticket.

### 2. Intelligent SLA Management Engine
- **Automated Deadline Calculation**: On ticket creation, the backend matches priority tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) against active **SLA Policies**.
- **Dual Deadlines**: Tracks both **First Response Deadline** and **Resolution Deadline**.
- **Breach Detection**: Automatically transitions tickets into `BREACHED` status when resolution deadlines pass, highlighting them in manager dashboards.

### 3. Technician Dispatch & Workstation
- **Dispatch or Claim**: IT Managers can dispatch tickets based on technician workload, or technicians can directly claim unassigned pool tickets.
- **Integrated Diagnostic Workstation**:
  - **Live Stopwatch**: Track exact minutes spent diagnosing and resolving issues.
  - **Work Logs**: Keep auditable time-tracking logs with duration and activity notes.
  - **Dual Comments**: Publish public updates to the requester while keeping sensitive diagnostic notes strictly internal (`isInternal: true`).
  - **Asset Integration**: View hardware specifications, serial numbers, and warranty status of the requester's assigned computer or peripherals.

### 4. Real-Time Collaboration & Auditing
- **Instant WebSocket Synchronization**: Built with `Socket.io` to dispatch live events across active browser sessions whenever tickets are created, assigned, commented on, or resolved.
- **Requester Satisfaction (CSAT)**: When resolved, requesters confirm the resolution with a 1-5 star rating and feedback, or reopen the ticket with additional comments.
- **Audit Logs**: Every status transition, assignment, and comment writes an immutable audit record capturing actor, action, timestamp, and state delta.

---

##  Key Features by Role

| Role | Workspace Capabilities |
| :--- | :--- |
| **Employee** | • Interactive AI Support Assistant for instant troubleshooting<br>• Fast-track manual ticket submission with attachments and asset linkage<br>• Personal ticket tracker with real-time status and technician chat<br>• Resolution confirmation and 5-star CSAT rating submission<br>• My Assigned Assets inventory view |
| **Technician** | • Assigned ticket workspace with live queue metrics<br>• One-click ticket claiming from the unassigned pool<br>• Diagnostic workstation with integrated stopwatch and time logger<br>• Dual communication channels: requester chat and private internal notes<br>• Direct ticket resolution workflow with detailed resolution summaries |
| **IT Manager** | • Organization-wide ticket queue management and manual dispatcher<br>• Real-time technician workload capacity and assignment heatmaps<br>• SLA compliance monitoring with breach alerts and countdowns<br>• Executive metrics: resolution rate, average response time, CSAT averages |
| **System Admin** | • Complete user and role management (`ADMIN`, `MANAGER`, `TECHNICIAN`, `EMPLOYEE`)<br>• SLA policy configuration (deadlines, warning thresholds, priorities)<br>• Service catalog management (Departments, Categories, Subcategories)<br>• Enterprise Hardware & Software Asset registry<br>• Security audit trail log viewer |

---

##  System Architecture

- **Frontend Client**: SPA developed with **React 19**, **Vite**, and **Tailwind CSS v4**. Utilizes modern typography (Figtree), Radix UI primitives, Lucide / Hugeicons, and responsive dashboard layouts tailored to each role.
- **Backend API**: RESTful API running on **Node.js** and **Express 5**, implementing stateless JWT authentication, role guards, and structured error handling.
- **Real-Time Layer**: **Socket.io** server broadcasting lifecycle events (`ticket:created`, `ticket:assigned`, `ticket:updated`, `comment:added`, `notification:new`).
- **Data Persistence**: **MongoDB** with **Mongoose 9** schemas, unique sequential ticket number generation (`SD-1001`, `SD-1002`), text search indexes, and relational population.
- **AI Core**: Provider-agnostic gateway supporting **Groq** (Llama / GPT-OSS models), **Google Gemini**, or **OpenAI** for classification and conversational troubleshooting.

---

##  Technology Stack

```
Frontend:
├── Framework: React 19.2 + Vite 8.3
├── Styling: Tailwind CSS v4.3 + Modern Design Tokens
├── Icons: @hugeicons/react, Lucide React
├── UI Primitives: Radix UI, Class Variance Authority
├── Real-Time Client: Socket.io-client
└── Markdown: react-markdown

Backend:
├── Runtime: Node.js (ES Modules)
├── Server: Express 5.2
├── Database: MongoDB (Mongoose 9.10)
├── Real-Time Server: Socket.io 4.8
├── Security: JSON Web Tokens (JWT), Bcrypt.js, CORS, Dotenv
└── AI Integration: Groq SDK, Google Generative AI, OpenAI API
```

---

##  Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v20.0.0 or higher recommended)
- **npm** (v10.0.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas connection URI)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dawnbreaker88/ServiceDesk.git
   cd ServiceDesk
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the project root directory (or update the existing `.env`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/servicedesk?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend API & Socket Targets
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000


# Option A: Groq (Recommended for lightning-fast responses)
AI_PROVIDER=groq
AI_API_KEY=your_groq_api_key_here
AI_MODEL=openai/gpt-oss-120b

# Option B: Google Gemini
# AI_PROVIDER=gemini
# AI_API_KEY=your_gemini_api_key_here
# AI_MODEL=gemini-1.5-flash

# Option C: OpenAI
# AI_PROVIDER=openai
# AI_API_KEY=your_openai_api_key_here
# AI_MODEL=gpt-4o-mini
```

### Database Seeding

Populate your database with enterprise departments, service categories, SLA policies, demo hardware assets, realistic multi-state tickets, and pre-configured user personas:

```bash
npm run seed
```

### Running the Application

You can run the backend and frontend simultaneously in separate terminals:

**Terminal 1 — Backend Server**:
```bash
npm run server
# Starts Express & Socket.io server on http://localhost:5000
```

**Terminal 2 — Frontend Application**:
```bash
npm run dev
# Starts Vite development server on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.


---

##  Automated API Testing

Servicedesk includes a full automated end-to-end REST test suite covering authentication, profile endpoints, asset management, complete ticket lifecycle (create -> assign -> start -> comment -> log -> resolve -> close), AI assistant, notifications, and analytics.

To run the verification suite:

```bash
npm run test:api
```

---

##  Project Directory Structure

```text
ServiceDesk/
├── public/                 # Static web assets
├── server/                 # Express backend application
│   ├── config/             # Database connection & configurations
│   ├── controllers/        # Route controllers (tickets, AI, auth, users, SLA, assets)
│   ├── middleware/         # Auth verification, role guards, error handlers
│   ├── models/             # Mongoose data models (Ticket, User, Asset, SLA, etc.)
│   ├── routes/             # REST API endpoint definitions
│   ├── scripts/            # Database seeder (`seed.js`) & test harness (`testApis.js`)
│   ├── socket.js           # Real-time WebSocket event broadcaster
│   ├── utils/              # Sequential ticket number generator & SLA calculators
│   ├── app.js              # Express app setup and middleware
│   └── server.js           # Server entry point & HTTP listener
├── src/                    # React frontend application
│   ├── assets/             # Brand logos & UI assets
│   ├── components/         # Reusable UI components, modal dialogs, layouts, navbar
│   │   ├── common/         # Buttons, badges, inputs, avatar, card wrappers
│   │   ├── layout/         # Shell, sidebar, header, role switcher
│   │   └── tickets/        # Ticket modals, chat panels, stopwatch widgets
│   ├── context/            # Global React Contexts (AuthContext, SocketContext)
│   ├── pages/              # Role-specific application views
│   │   ├── admin/          # Admin settings, user manager, SLA editor, audit log
│   │   ├── employee/       # Employee home, AI console (`GetSupportPage`), My Tickets
│   │   ├── manager/        # Manager queue, team workload, SLA report
│   │   └── technician/     # Technician queue, diagnostic workstation, work logs
│   ├── services/           # Axios / Fetch API client abstractions
│   ├── App.jsx             # Top-level routing and role-protected route guards
│   ├── main.jsx            # React root mount
│   └── index.css           # Global Tailwind CSS directives and design tokens
├── package.json            # Scripts and dependencies
└── vite.config.js          # Vite configuration with React & Tailwind plugins
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
