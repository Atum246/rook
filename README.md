<div align="center">

```
██████╗  ██████╗  ██████╗ ██╗  ██╗
██╔══██╗██╔═══██╗██╔═══██╗██║ ██╔╝
██████╔╝██║   ██║██║   ██║█████╔╝ 
██╔══██╗██║   ██║██║   ██║██╔═██╗ 
██║  ██║╚██████╔╝╚██████╔╝██║  ██╗
╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
```

# ♜ Rook

**Your agent's home.**

Deploy [OpenClaw](https://github.com/openclaw/openclaw) AI agents in one click.  
No credit card. No DevOps. No headaches.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-features) • [Quick Start](#-quick-start) • [Deploy Online](#-deploy-online-recommended-) • [How It Works](#-how-people-use-it) • [API](#-api) • [Contributing](#-contributing)

</div>

---

## 🤔 What is Rook?

Rook turns this painful 6-step manual process:

> ~~Sign up for OpenRouter → Set up MongoDB Atlas → Fork the repo → Deploy to Render → Configure env vars → Set up cron-job.org~~

Into this:

> **Sign up → Connect your API keys → Click deploy → Done. ♜**

Behind the scenes, Rook handles ALL the boring infrastructure stuff so you can focus on your agent.

---

## ✨ Features

### 🎯 Core
- **🖱️ One-Click Deploy** — 3-step wizard: pick template, pick model, hit deploy
- **📊 Live Dashboard** — See all agents, status, uptime, messages
- **💬 Built-in Chat** — Talk to your agent directly from the dashboard
- **⏰ Auto Keep-Alive** — Your agent never sleeps (handles cron-job.org silently)
- **💓 Health Monitor** — Auto-restarts agents when they go down

### 🚀 Smart Features
- **📦 Agent Templates** — Personal Assistant, Customer Support, Code Helper
- **🤖 Multi-Model** — Free models via OpenRouter (Gemini, Llama, Mistral)
- **📱 Messaging Setup** — Telegram, WhatsApp, Discord integration ready
- **📋 Activity Feed** — Real-time logs and events
- **🔒 Encrypted Keys** — All API keys stored with AES encryption

### 💎 Developer Friendly
- **🏗️ Full REST API** — Integrate with anything
- **⚡ Modern Stack** — Express + Next.js + Tailwind
- **🔓 Open Source** — MIT license, fork it, own it

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Install & Run

```bash
# Clone
git clone https://github.com/your-username/rook.git
cd rook

# Install backend
npm install

# Install frontend
cd frontend && npm install && cd ..

# Configure
cp .env.example .env
# Edit .env → set MONGODB_URI and JWT_SECRET

# Run both (in separate terminals)
npm run dev              # Backend → http://localhost:3001
npm run frontend:dev     # Frontend → http://localhost:3000
```

Open **http://localhost:3000** and you're in! ♜

---

## 🌐 Deploy Online (Recommended!) ☁️

Running Rook locally means your computer must stay ON. **Deploy to Render instead — it's free and runs 24/7!**

### Step 1: Get a MongoDB Connection String 🗄️

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and sign up (free)
2. Click **"Create"** → Choose **"M0 Free Shared Cluster"**
3. Go to **"Network Access"** → Click **"Add IP Address"** → Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Go to **"Database Access"** → Click **"Add New Database User"**
   - Username: `rook`
   - Password: generate a secure one (save it!)
   - Role: **Read and write to any database**
5. Go to **"Database"** → Click **"Connect"** → **"Drivers"**
6. Copy the connection string — it looks like:
   ```
   mongodb+srv://rook:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/rook?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password

### Step 2: Fork This Repo 🍴

1. Go to [github.com/Atum246/rook](https://github.com/Atum246/rook)
2. Click **"Fork"** (top right)
3. Done! You now have your own copy

### Step 3: Deploy to Render 🚀

1. Go to [Render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect"** next to your GitHub account
4. Find and select **your fork of rook**
5. Fill in the settings:

   | Field | Value |
   |-------|-------|
   | **Name** | `rook` (or anything you want) |
   | **Region** | Pick the one closest to you |
   | **Branch** | `main` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && cd frontend && npm install && npm run build && cd ..` |
   | **Start Command** | `npm start` |
   | **Plan** | `Free` |

6. Click **"Advanced"** and add these **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your MongoDB connection string (from Step 1) |
   | `JWT_SECRET` | Any random string, e.g. `my-super-secret-rook-key-2026` |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |

7. Click **"Create Web Service"**
8. Wait 3-5 minutes for the build to complete ⏳

### Step 4: Keep It Awake (Important!) ⏰

Render kills free apps after 15 minutes of inactivity. Fix this:

1. Copy your Render URL (e.g., `https://rook-xxxx.onrender.com`)
2. Go to [Cron-job.org](https://cron-job.org) and sign up (free)
3. Click **"Create cronjob"**
4. Fill in:
   - **Title:** `Keep Rook Awake`
   - **URL:** Your Render URL (e.g., `https://rook-xxxx.onrender.com/api/health`)
   - **Schedule:** Every **5 minutes**
5. Click **"Create cronjob"**
6. Done! Your Rook is now awake 24/7! 🎉

### Step 5: Open Your Rook! 🎉

1. Open your Render URL in a browser
2. You'll see the Rook login page
3. Sign up → Connect your API keys → Deploy agents!

### 🎉 You're Live!

Your Rook dashboard is now running 24/7 for $0. Share the URL with your team or keep it private — it's yours! ♜

---

## 🧑‍💻 How People Use It

### Step 1: Sign Up 📝
Create your Rook account. Takes 10 seconds.

### Step 2: Connect Services 🔗
Rook needs your API keys to deploy agents for you:

| Service | What For | Required? | Where to Get |
|---------|----------|-----------|-------------|
| 🤖 OpenRouter | AI models | ✅ Yes | [openrouter.ai/keys](https://openrouter.ai/keys) |
| 🚀 Render | Hosting | ✅ Yes | [dashboard.render.com](https://dashboard.render.com) |
| 🗄️ MongoDB Atlas | Database | Optional | [cloud.mongodb.com](https://cloud.mongodb.com) |
| ⏰ Cron-job.org | Keep-alive | Optional | [console.cron-job.org](https://console.cron-job.org) |

> 💡 Rook can work with just OpenRouter + Render. MongoDB and Cron-job are optional but recommended.

### Step 3: Deploy 🚀
1. Click **"Deploy Agent"**
2. Pick a template (or build custom)
3. Choose your AI model and region
4. Hit **"Deploy Now"**

Rook handles the rest:
- Creates your MongoDB database
- Deploys to Render
- Sets up keep-alive pings
- Configures your agent

### Step 4: Chat 💬
Your agent is live! Chat with it directly from the Rook dashboard, or connect Telegram/WhatsApp.

### That's it. No YAML. No Dockerfiles. No CLI magic. ♜

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  Rook Platform                   │
├─────────────────┬───────────────────────────────┤
│                 │                                │
│   Frontend      │   Backend (Express.js)         │
│   (Next.js)     │                                │
│                 │   ┌─────────────────────────┐  │
│  • Auth Page    │   │     Services             │  │
│  • Setup Wizard │   │                          │  │
│  • Dashboard    │   │  🚀 Render API           │  │
│  • Agent Cards  │   │  🗄️ MongoDB Atlas API    │  │
│  • Deploy Modal │   │  ⏰ Cron-job.org API     │  │
│  • Chat Panel   │   │  🤖 OpenRouter API       │  │
│  • Activity Feed│   │  💓 Health Monitor       │  │
│                 │   │  🔄 Deploy Orchestrator  │  │
│                 │   └─────────────────────────┘  │
└─────────────────┴───────────────────────────────┘
```

---

## 📡 API

### Auth
```
POST   /api/auth/register          Create account
POST   /api/auth/login             Sign in
GET    /api/auth/me                Current user
POST   /api/auth/connect/:service  Connect a service
GET    /api/auth/connections       Connection status
```

### Agents
```
GET    /api/agents                 List agents
POST   /api/agents                 Create & deploy
GET    /api/agents/:id             Agent details
POST   /api/agents/:id/restart     Restart agent
DELETE /api/agents/:id             Delete agent
GET    /api/agents/:id/logs        Agent logs
PUT    /api/agents/:id/config      Update config
```

### Chat
```
POST   /api/chat/:agentId/message  Send message
GET    /api/chat/:agentId/history  Chat history
```

### Dashboard
```
GET    /api/dashboard/overview     Dashboard stats
GET    /api/dashboard/agents       Agent cards
GET    /api/dashboard/activity     Activity feed
GET    /api/dashboard/health       Health overview
```

### Deploy
```
GET    /api/deploy/prerequisites   Check readiness
GET    /api/deploy/models          Available models
GET    /api/deploy/regions         Available regions
```

---

## 📁 Project Structure

```
rook/
├── server.js                   # Express server entry
├── package.json                # Backend dependencies
├── .env.example                # Config template
│
├── models/                     # Database schemas
│   ├── User.js                 #   User with encrypted keys
│   └── Agent.js                #   Agent with deployment info
│
├── middleware/
│   └── auth.js                 # JWT auth + plan limits
│
├── utils/
│   ├── logger.js               # Winston logger
│   └── crypto.js               # AES encryption
│
├── services/                   # External API integrations
│   ├── renderService.js        #   Render.com
│   ├── mongoAtlasService.js    #   MongoDB Atlas
│   ├── cronjobService.js       #   Cron-job.org
│   ├── openrouterService.js    #   OpenRouter
│   ├── deployService.js        #   Orchestrator
│   └── healthMonitor.js        #   Auto-restart
│
├── routes/                     # API endpoints
│   ├── auth.js
│   ├── agents.js
│   ├── deploy.js
│   ├── dashboard.js
│   ├── settings.js
│   └── chat.js
│
└── frontend/                   # Next.js app
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── src/
        ├── app/
        │   ├── layout.jsx
        │   └── page.jsx
        ├── components/
        │   ├── AuthProvider.jsx
        │   ├── AuthPage.jsx
        │   ├── SetupWizard.jsx
        │   ├── Dashboard.jsx
        │   ├── AgentCard.jsx
        │   ├── DeployModal.jsx
        │   ├── ChatPanel.jsx
        │   └── ActivityFeed.jsx
        └── styles/
            └── globals.css
```

---

## 🤝 Contributing

We love contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Quick start for contributors
git clone https://github.com/your-username/rook.git
cd rook
npm install
cd frontend && npm install && cd ..
cp .env.example .env
# Edit .env
npm run dev
```

---

## 📄 License

MIT — do whatever you want with it. See [LICENSE](LICENSE).

---

## 💡 FAQ

**Q: Do I need a credit card?**  
A: Nope! All services (OpenRouter, Render, MongoDB Atlas, Cron-job.org) have free tiers.

**Q: What happens when Render restarts?**  
A: Rook uses MongoDB Atlas for persistent storage + Cron-job.org to prevent sleeping.

**Q: Can I use my own domain?**  
A: Yes! Render supports custom domains on all plans.

**Q: Is my data safe?**  
A: All API keys are encrypted with AES before storage. We never see your keys in plain text.

**Q: Can I self-host Rook?**  
A: Absolutely. That's the whole point. It's yours.

---

<div align="center">

**Built with ♜ by the Rook community.**

⭐ Star us on GitHub if this helped you!

</div>
