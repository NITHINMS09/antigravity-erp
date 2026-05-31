# 🧠 PulseMind AI

### Enterprise Employee Feedback & Organizational Intelligence Platform

An AI-powered SaaS platform that transforms employee feedback into actionable organizational intelligence using advanced NLP, sentiment analysis, burnout prediction, and real-time analytics.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand |
| **Backend** | Node.js, Express.js, TypeScript, Socket.io |
| **Database** | PostgreSQL, Prisma ORM |
| **AI** | OpenAI GPT-4, NLP, Sentiment Analysis, Emotion Detection |
| **Auth** | JWT + bcrypt, RBAC (5 roles) |
| **Deployment** | Docker, Vercel, Render, Railway |

---

## ✨ Features

### AI Engines
- 🧠 **AI Insight Engine** — Summarizes feedback, generates executive reports
- 📊 **Smart Text Classification** — NLP keyword extraction, auto-categorization
- 💡 **Recommendation Engine** — HR actions, wellness strategies
- 🔴 **Live Alert System** — Real-time critical notifications via WebSocket
- 🔥 **Burnout Risk Analyzer** — Predicts burnout and resignation probability
- 🛡️ **Anonymous Feedback** — Encrypted identity masking
- 📈 **Pattern Recognition** — Detects recurring complaint patterns
- 💬 **Emotion Detection** — Stress, anger, frustration, satisfaction analysis
- ☣️ **Toxicity Detection** — Abusive language and harassment detection
- 🌐 **Multilingual Support** — EN, HI, KN, TA, TE, ML with auto-translation

### Employee Features
- Modern dashboard with wellness scores and mood tracking
- Multi-step feedback form with AI analysis preview
- Star ratings, mood emoji selector, stress slider
- Anonymous reporting with encrypted identity
- Feedback history and complaint tracking
- AI-powered wellness recommendations
- Gamification with badges and streaks

### Admin Features
- Real-time organizational health dashboard
- Department intelligence with risk assessment
- Burnout monitoring with employee-level tracking
- Toxicity report management
- Complaint routing and resolution workflow
- User management with RBAC
- AI analytics with charts, radar, and heatmaps
- Configurable AI thresholds and notification settings

---

## 🏗️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use Docker)

### 1. Clone & Install

```bash
cd pulsemind-ai

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Database Setup

```bash
cd backend

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed demo data
npx ts-node prisma/seed.ts
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Open Browser
- Frontend: http://localhost:3000
- API: http://localhost:5000/api
- Prisma Studio: `npx prisma studio` (port 5555)

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | admin@pulsemind.ai | admin123 |
| **HR Admin** | hr@pulsemind.ai | admin123 |
| **Employee** | dev1@pulsemind.ai | employee123 |

---

## 📁 Project Structure

```
pulsemind-ai/
├── frontend/               # Next.js 14 App
│   └── src/
│       ├── app/            # App Router pages
│       │   ├── (dashboard)/ # Protected pages
│       │   │   ├── dashboard/ # Employee pages
│       │   │   └── admin/     # Admin pages
│       │   ├── login/
│       │   └── register/
│       └── lib/            # API, stores, utils
├── backend/                # Express.js API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   │   ├── ai/         # AI engines
│   │   │   ├── auth/       # Authentication
│   │   │   ├── analytics/  # Analytics
│   │   │   └── feedback/   # Feedback processing
│   │   ├── middleware/     # Auth, RBAC
│   │   └── socket/        # WebSocket
│   └── prisma/            # Schema & seed
├── docker-compose.yml
└── README.md
```

---

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

This starts PostgreSQL, backend, and frontend containers.

---

## 🔐 User Roles

1. **EMPLOYEE** — Submit feedback, view wellness, track complaints
2. **TEAM_MEMBER** — Employee features + team management
3. **HR_ADMIN** — Full analytics, complaint routing, user management
4. **SUPER_ADMIN** — Complete platform control, settings, audit logs
5. **AI_AGENT** — System role for automated AI operations

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile |
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/feedback` | List feedbacks |
| GET | `/api/feedback/my` | User's feedbacks |
| GET | `/api/analytics/health` | Org health score |
| GET | `/api/analytics/departments` | Department analytics |
| GET | `/api/analytics/trends` | Feedback trends |
| GET | `/api/analytics/burnout/:userId` | Burnout prediction |
| GET | `/api/analytics/patterns` | Pattern detection |
| POST | `/api/analytics/analyze` | AI text analysis |
| GET | `/api/admin/complaints` | All complaints |
| GET | `/api/admin/users` | User management |
| GET | `/api/admin/departments` | Departments |

---

## 🌟 Built with ❤️ by PulseMind AI Team
