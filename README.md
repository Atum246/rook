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
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](#-deploy-with-docker)

[Features](#-features) • [Quick Start](#-quick-start) • [Deploy Online](#-deploy-online) • [How It Works](#-how-people-use-it) • [API](#-api) • [Contributing](#-contributing)

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
- **🐳 Docker Ready** — One command to run everything
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
git clone https://github.com/Atum246/rook.git
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

## 🐳 Deploy with Docker

The fastest way to run Rook — just one command:

```bash
# Clone and start everything (Rook + MongoDB)
git clone https://github.com/Atum246/rook.git
cd rook

# Edit docker-compose.yml → change JWT_SECRET to something random
# Then start:
docker-compose up -d

# Open http://localhost:10000
```

That's it. Rook + MongoDB running in containers. 🐳🎉

> ⚠️ Remember to change `JWT_SECRET` in `docker-compose.yml` before deploying!

---

## 🌐 Deploy Online

Running Rook locally means your computer must stay ON. **Deploy online instead — it's free and runs 24/7!**

### 📋 Prerequisites (Same for ALL Platforms)

Before deploying to ANY platform, you need:

1. **A MongoDB connection string** 🗄️
   - Go to [MongoDB Atlas](https://cloud.mongodb.com) (free)
   - Create an **M0 Free Shared Cluster**
   - Under **Network Access** → Add IP → Allow Access from Anywhere (0.0.0.0/0)
   - Under **Database Access** → Create a user (save username + password!)
   - Click **Connect** → **Drivers** → Copy the SRV connection string
   - Replace `<password>` with your actual password

2. **A JWT Secret** 🔐
   - Any random string, e.g. `my-super-secret-rook-key-2026`
   - Use a password generator for production!

### Environment Variables (Same for ALL Platforms)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | Your MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ Yes | Random secret for auth tokens |
| `NODE_ENV` | ✅ Yes | Set to `production` |
| `PORT` | ✅ Yes | Set to `10000` (or platform default) |

---

### Option 1: Render.com 🚀 (Recommended — Free)

1. Fork this repo on GitHub
2. Go to [Render.com](https://render.com) → Sign up (free)
3. Click **New +** → **Web Service** → Connect your fork
4. Settings:

   | Field | Value |
   |-------|-------|
   | Name | `rook` |
   | Region | Closest to you |
   | Branch | `main` |
   | Build Command | `npm install && cd frontend && npm install && npm run build && cd ..` |
   | Start Command | `npm start` |
   | Plan | Free |

5. Add environment variables (from the table above)
6. Click **Create Web Service** → Wait 3-5 min ⏳

**⏰ Keep-alive setup:**
- Go to [Cron-job.org](https://cron-job.org) (free)
- Create a job that pings your Render URL every 5 minutes
- URL: `https://your-app.onrender.com/api/health`

---

### Option 2: Railway 🚂 (Free $5/month credit)

1. Fork this repo
2. Go to [Railway.app](https://railway.app) → Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub repo** → Select your fork
4. Add a **MongoDB** plugin (Railway has built-in MongoDB!)
5. Set environment variables:
   - `MONGODB_URI` → Railway auto-provides this as `${{MongoDB.MONGO_URL}}`
   - `JWT_SECRET` → Your random secret
   - `NODE_ENV` → `production`
   - `PORT` → Railway auto-provides `${{PORT}}`
6. Add a **Start Command** override: `npm start`
7. Deploy! 🚀

> 💡 Railway keeps your app awake automatically — no cron-job needed!

---

### Option 3: Fly.io 🪰 (Free tier available)

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Fork and clone this repo
3. Run:
   ```bash
   cd rook
   fly launch
   # Follow prompts → Select Node.js
   # Say NO to Postgres (we use MongoDB)
   # Say NO to Redis
   ```
4. Set secrets:
   ```bash
   fly secrets set MONGODB_URI="your-mongodb-uri"
   fly secrets set JWT_SECRET="your-random-secret"
   fly secrets set NODE_ENV="production"
   ```
5. Deploy:
   ```bash
   fly deploy
   ```

> 💡 Fly.io has a generous free tier — 3 shared VMs, no sleep!

---

### Option 4: DigitalOcean App Platform 🌊 ($200 free credit!)

1. Fork this repo
2. Go to [DigitalOcean](https://digitalocean.com) → **App Platform**
3. Click **Create App** → Connect GitHub → Select your fork
4. Configure:
   - Source Directory: `/`
   - Build Command: `npm install && cd frontend && npm install && npm run build && cd ..`
   - Run Command: `npm start`
5. Add environment variables
6. Deploy! 🚀

> 💡 DigitalOcean gives $200 free credit for 60 days when you sign up!

---

### Option 5: Vercel + External Backend 🟢

Vercel handles the frontend, deploy the backend separately:

**Frontend on Vercel:**
1. Fork this repo
2. Go to [Vercel](https://vercel.com) → Import your fork
3. Set Root Directory to `frontend`
4. Set Build Command to `npm run build`
5. Set Environment Variable: `NEXT_PUBLIC_API_URL` = your backend URL

**Backend on Render/Railway:**
- Deploy just the backend (root `server.js`) to Render or Railway
- Follow the same steps as above but only for the backend

---

### Option 6: Any VPS (DigitalOcean Droplet, Linode, etc.) 🖥️

For full control — $5/month VPS:

```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install MongoDB
apt-get install -y mongodb

# Clone and setup
git clone https://github.com/Atum246/rook.git
cd rook
npm install
cd frontend && npm install && npm run build && cd ..

# Configure
cp .env.example .env
nano .env  # Add your MONGODB_URI, JWT_SECRET, NODE_ENV=production, PORT=10000

# Install PM2 (process manager)
npm install -g pm2

# Start
pm2 start server.js --name rook
pm2 startup
pm2 save

# Open firewall
ufw allow 10000

# Done! Visit http://your-server-ip:10000
```

> 💡 Use Nginx as a reverse proxy + Let's Encrypt for free HTTPS!

---

### 📊 Platform Comparison

| Platform | Free? | Always On? | Difficulty | Best For |
|----------|-------|-----------|------------|----------|
| 🚀 Render | ✅ Free | ⏰ Needs cron | ⭐ Easy | Beginners |
| 🚂 Railway | ✅ $5 credit | ✅ Yes | ⭐ Easy | Best free option |
| 🪰 Fly.io | ✅ Free | ✅ Yes | ⭐⭐ Medium | Developers |
| 🌊 DigitalOcean | 💰 $200 credit | ✅ Yes | ⭐⭐ Medium | Growing projects |
| 🟢 Vercel | ✅ Free | ✅ Yes | ⭐⭐⭐ Split setup | Frontend-focused |
| 🖥️ VPS | 💰 $5/mo | ✅ Yes | ⭐⭐⭐ Full control | Production |

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

## 🔧 Troubleshooting

### "Cannot connect to MongoDB"
- Make sure you whitelisted `0.0.0.0/0` in MongoDB Atlas Network Access
- Check your connection string has the correct password
- Ensure the database user has `readWrite` role

### "Render app keeps sleeping"
- Set up Cron-job.org to ping `/api/health` every 5 minutes
- Make sure the cron job URL is correct (use HTTPS)

### "Build failed on Render"
- Check build logs in Render dashboard
- Ensure Build Command is exactly: `npm install && cd frontend && npm install && npm run build && cd ..`
- Make sure you're on Node 18+

### "Frontend shows blank page"
- Check browser console for errors
- Make sure `NODE_ENV=production` is set
- Rebuild the frontend: `cd frontend && npm run build`

### "Agent won't deploy"
- Verify your OpenRouter API key is valid
- Check your Render API key has correct permissions
- Look at the Rook server logs for error details

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
├── Dockerfile                  # Docker image
├── docker-compose.yml          # Docker Compose (Rook + MongoDB)
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
git clone https://github.com/Atum246/rook.git
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
A: Yes! All platforms support custom domains.

**Q: Is my data safe?**  
A: All API keys are encrypted with AES before storage. We never see your keys in plain text.

**Q: Can I self-host Rook?**  
A: Absolutely. That's the whole point. It's yours.

**Q: Do I need Docker?**  
A: No! Docker is optional. You can run Rook directly with Node.js too.

**Q: Which platform should I pick?**  
A: Beginners → Render. Best free option → Railway. Full control → VPS.

---

<div align="center">

**Built with ♜ by the Rook community.**

⭐ Star us on GitHub if this helped you!

</div>
