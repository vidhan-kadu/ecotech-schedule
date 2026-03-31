# EcoTech Scheduler — Scheduling Platform

A full-stack, mobile-responsive scheduling platform (similar to Calendly) built with **React.js**, **Express.js**, and **Tailwind CSS**.

## 🛠 Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React.js (Vite) + Tailwind CSS | Fast, modern, per project requirements (React.js with ES6+ and Tailwind CSS) |
| **Backend** | Node.js + Express.js | RESTful API server, per project requirements |
| **Database** | MongoDB (Mongoose) | Flexible NoSQL, standard MERN stack, free-tier via Atlas |
| **Authentication** | JWT + bcryptjs | Secure, stateless auth with password hashing |
| **Calendar Sync** | Google Calendar API (OAuth2) | Direct integration for appointment sync |
| **Timezone** | date-fns + date-fns-tz | Lightweight timezone handling, all dates stored in UTC |
| **LLM Feature** | Google Gemini API | AI-powered natural language scheduling suggestions |

## ✨ Key Features

1. **User Registration & Authentication** — Secure signup/login with JWT tokens and bcrypt password hashing.
2. **Calendar Integration** — Google Calendar OAuth2 flow to sync booked appointments automatically.
3. **Appointment Scheduling** — Create event types, set weekly availability, share public booking links.
4. **Time Zone Support** — All times stored in UTC; displayed in user's local timezone using `date-fns-tz`.
5. **Responsive UI** — Mobile-first design with Tailwind CSS, works across all devices and browsers.
6. **AI Smart Scheduling (LLM)** — Type natural language like "Find a 30-min slot next Wednesday afternoon" and get instant slot suggestions powered by Gemini.

## 📋 Folder Structure

```
├── client/              # React.js Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/         # Axios API client with JWT interceptor
│   │   ├── components/  # Reusable UI & layout components
│   │   ├── context/     # AuthContext for state management
│   │   ├── pages/       # All page components (Landing, Dashboard, Booking, etc.)
│   │   └── utils/       # Timezone helpers
│   └── ...
├── server/              # Express.js Backend
│   ├── models/          # Mongoose schemas (User, EventType, Availability, Booking)
│   ├── routes/          # RESTful API routes (auth, events, bookings, calendar, llm)
│   ├── middleware/      # JWT auth middleware
│   └── lib/             # DB connection utility
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas free tier)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd 4n-EcoTech
```

### 2. Setup Backend
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and other configs
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables (server/.env)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID (optional, for Calendar sync) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret (optional) |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `GEMINI_API_KEY` | Google Gemini API key (optional, for LLM features) |
| `CLIENT_URL` | Frontend URL (default: http://localhost:5173) |

## 📐 Design Decisions & Assumptions

- **MongoDB** was chosen over SQL because it's the most common pairing with Express.js in the MERN stack, and provides flexible schema for rapid development.
- **JWT-based auth** was chosen for stateless, scalable authentication suitable for a SPA architecture.
- **All times are stored in UTC** in the database to ensure consistency; timezone conversion happens at the display layer.
- **Google Calendar** is the primary calendar integration; the architecture supports adding other providers.
- **The LLM feature** uses Google Gemini's free tier to parse natural language scheduling requests into structured slot suggestions.

## 🔧 Tools & Open Source Used

- **React.js** (MIT) — UI library
- **Vite** (MIT) — Build tool
- **Express.js** (MIT) — Web framework
- **Mongoose** (MIT) — MongoDB ODM
- **Tailwind CSS** (MIT) — Utility-first CSS
- **date-fns / date-fns-tz** (MIT) — Date/timezone utilities
- **jsonwebtoken** (MIT) — JWT auth
- **bcryptjs** (MIT) — Password hashing
- **googleapis** (Apache-2.0) — Google Calendar API
- **@google/generative-ai** — Gemini LLM SDK
- **lucide-react** (ISC) — Icon library
- **GitHub Copilot / Gemini** — AI coding assistance used during development

## 📦 Deployment

- **Frontend**: Deploy `client/` to Vercel or Netlify
- **Backend**: Deploy `server/` to Render, Railway, or any Node.js hosting
- Set environment variables in your hosting platform
- Update `CLIENT_URL` and `GOOGLE_REDIRECT_URI` to production URLs
