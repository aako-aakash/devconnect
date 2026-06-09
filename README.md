<div align="center">

<br/>

```
██████╗ ███████╗██╗   ██╗ ██████╗ ██████╗ ███╗   ██╗███╗   ██╗███████╗ ██████╗████████╗
██╔══██╗██╔════╝██║   ██║██╔════╝██╔═══██╗████╗  ██║████╗  ██║██╔════╝██╔════╝╚══██╔══╝
██║  ██║█████╗  ██║   ██║██║     ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██║        ██║   
██║  ██║██╔══╝  ╚██╗ ██╔╝██║     ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██║        ██║   
██████╔╝███████╗ ╚████╔╝ ╚██████╗╚██████╔╝██║ ╚████║██║ ╚████║███████╗╚██████╗   ██║   
╚═════╝ ╚══════╝  ╚═══╝   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═╝   
```

### 🚀 A full-stack social platform for student developers

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-devconnect--steel.vercel.app-6366f1?style=for-the-badge&logoColor=white)](https://devconnect-steel.vercel.app)
[![API Docs](https://img.shields.io/badge/📡_API_Docs-Swagger_UI-10b981?style=for-the-badge)](https://devconnect-api-pgg4.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/GitHub-aako--aakash-181717?style=for-the-badge&logo=github)](https://github.com/aako-aakash)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/aako-aakash)

<br/>

![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black)

</div>

---

## ✨ What is DevConnect?

**DevConnect** is a production-quality social platform built for student developers — think Twitter, but for people who code. Share what you're building, get feedback, like and comment on others' work, and discover a community of learners.

> 💡 *Built as a full-stack portfolio project demonstrating real-world auth, REST API design, relational database modelling, and cloud deployment — from zero to live in one project.*

---

## 🖼️ Feature Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DevConnect                               │
├──────────────────┬──────────────────┬───────────────────────────┤
│  🔐 Auth System  │   🌐 Social Feed  │    👤 User Profiles       │
│                  │                  │                           │
│  • JWT tokens    │  • Infinite scroll│  • Editable bio & avatar  │
│  • bcrypt hashing│  • Create posts   │  • Personal post history  │
│  • Auto-logout   │  • Like / Unlike  │  • Join date & post count │
│  • Token refresh │  • Comments       │                           │
├──────────────────┼──────────────────┼───────────────────────────┤
│  🔔 Notifications│   🔍 Search       │    📱 Responsive UI       │
│                  │                  │                           │
│  • Like alerts   │  • Search users  │  • Mobile-first design    │
│  • Comment alerts│  • Search posts  │  • Glassmorphism cards    │
│  • Unread badge  │  • Live results  │  • Premium dark theme     │
│  • Mark as read  │  • Debounced     │  • Powered by Skyward     │
└──────────────────┴──────────────────┴───────────────────────────┘
```

---

## 🏗️ Architecture

```
                        ┌─────────────────────────────┐
                        │        User's Browser        │
                        │   React SPA (Vite bundled)   │
                        └──────────────┬──────────────┘
                                       │ HTTPS + JWT
                        ┌──────────────▼──────────────┐
                        │     Vercel Edge Network      │
                        │   Static files + CDN + SSL   │
                        └──────────────┬──────────────┘
                                       │ REST API calls
                        ┌──────────────▼──────────────┐
                        │    Render (Docker container) │
                        │   FastAPI + Uvicorn + Python │
                        │   JWT validation · bcrypt    │
                        │   SQLAlchemy ORM · Pydantic  │
                        └──────────────┬──────────────┘
                                       │ SSL connection
                        ┌──────────────▼──────────────┐
                        │    Neon Serverless Postgres  │
                        │   users · posts · likes      │
                        │   comments · notifications   │
                        └─────────────────────────────┘
```

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Component-based SPA |
| **Styling** | Tailwind CSS + Custom CSS | Utility-first + premium design tokens |
| **HTTP Client** | Axios | Request/response interceptors, JWT injection |
| **Routing** | React Router v6 | Client-side navigation, protected routes |
| **Backend** | FastAPI (Python) | High-performance async REST API |
| **ORM** | SQLAlchemy 2.0 | Database models and query building |
| **Validation** | Pydantic v2 | Request validation + response serialization |
| **Auth** | PyJWT + passlib/bcrypt | Stateless JWT + secure password hashing |
| **Database** | PostgreSQL 16 | Relational data with foreign keys |
| **Container** | Docker (Python 3.11) | Reproducible build environment |
| **Frontend Host** | Vercel | Global CDN, auto-deploy on push |
| **Backend Host** | Render | Docker web service, free tier |
| **Database Host** | Neon | Serverless PostgreSQL, SSL enforced |

---

## 🗄️ Database Schema

```sql
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    users    │       │    posts     │       │    likes    │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)      │──┐    │ id (PK)     │
│ name        │  │    │ user_id (FK) │◄─┘    │ user_id (FK)│
│ email       │  └───►│ content      │    ┌─►│ post_id (FK)│
│ password_hash│       │ created_at   │    │  │ created_at  │
│ bio         │       └──────────────┘    │  └─────────────┘
│ avatar_url  │              │            │
│ created_at  │              ▼            │  ┌─────────────┐
└─────────────┘       ┌──────────────┐   │  │  comments   │
                       │   comments   │   │  ├─────────────┤
                       ├──────────────┤   │  │ id (PK)     │
                       │ id (PK)      │   └──│ user_id (FK)│
                       │ user_id (FK) │      │ post_id (FK)│
                       │ post_id (FK) │      │ content     │
                       │ content      │      │ created_at  │
                       │ created_at   │      └─────────────┘
                       └──────────────┘
                                            ┌──────────────────┐
                                            │  notifications   │
                                            ├──────────────────┤
                                            │ id (PK)          │
                                            │ recipient_id (FK)│
                                            │ actor_name       │
                                            │ action           │
                                            │ post_id          │
                                            │ is_read          │
                                            │ created_at       │
                                            └──────────────────┘
```

**Key constraints:**
- `likes(user_id, post_id)` — UNIQUE constraint (one like per user per post)
- All foreign keys use `ON DELETE CASCADE` — deleting a user removes all their data

---

## 📡 API Reference

### Authentication
```
POST   /api/auth/signup     → Register + returns JWT
POST   /api/auth/login      → Login  + returns JWT
GET    /api/auth/me         → Current user info       🔒
```

### Posts
```
GET    /api/posts/feed              → Paginated global feed    🔒
POST   /api/posts/                  → Create a post            🔒
DELETE /api/posts/{id}              → Delete own post          🔒
POST   /api/posts/{id}/like         → Toggle like/unlike       🔒
GET    /api/posts/{id}/comments     → Get all comments         🔒
POST   /api/posts/{id}/comments     → Add a comment            🔒
GET    /api/posts/search/posts?q=   → Search posts             🔒
```

### Users
```
GET    /api/users/search?q=         → Search users by name     🔒
GET    /api/users/{id}              → Get user profile         🔒
GET    /api/users/{id}/posts        → Get user's posts         🔒
PATCH  /api/users/me/profile        → Update own profile       🔒
GET    /api/users/notifications     → Get notifications        🔒
POST   /api/users/notifications/read→ Mark all read            🔒
```

> 🔒 = Requires `Authorization: Bearer <token>` header

### Example Request / Response

```bash
# Signup
curl -X POST https://devconnect-api-pgg4.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Dev","email":"jane@uni.edu","password":"secure123"}'

# Response 201
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Jane Dev",
    "email": "jane@uni.edu",
    "bio": null,
    "avatar_url": null,
    "created_at": "2025-01-01T12:00:00",
    "post_count": 0
  }
}
```

---

## 📁 Project Structure

```
devconnect/
├── 📦 requirements.txt              ← All Python deps (repo root)
│
├── backend/
│   ├── 🐳 Dockerfile               ← Python 3.11-slim container
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py                  ← FastAPI app + CORS + startup
│       ├── core/
│       │   ├── config.py            ← Pydantic Settings (env vars)
│       │   └── security.py          ← JWT + bcrypt
│       ├── db/
│       │   └── database.py          ← SQLAlchemy engine + session
│       ├── models/
│       │   └── models.py            ← ORM: User, Post, Like, Comment, Notification
│       ├── schemas/
│       │   ├── user.py              ← Pydantic request/response schemas
│       │   └── schemas.py           ← Post, Comment, Like, Notification schemas
│       ├── routes/
│       │   ├── auth.py              ← /api/auth/*
│       │   ├── posts.py             ← /api/posts/*
│       │   └── users.py             ← /api/users/*
│       └── services/
│           ├── auth_service.py      ← Register / login logic
│           ├── post_service.py      ← Feed, CRUD, likes, comments
│           └── user_service.py      ← Profiles, search, notifications
│
└── frontend/
    ├── index.html
    ├── vercel.json                  ← SPA routing rewrite
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                  ← Router + auth guards + layout
        ├── index.css                ← Premium design tokens + mobile CSS
        ├── api/
        │   └── index.js             ← Axios client + all API functions
        ├── context/
        │   └── AuthContext.jsx      ← Global auth state
        ├── components/
        │   ├── Navbar.jsx           ← Search, notifications, user menu
        │   ├── PostCard.jsx         ← Like, comment, delete
        │   ├── Footer.jsx           ← Skyward branding + social links
        │   └── helpers.jsx          ← Avatar, Spinner, SkeletonCard
        └── pages/
            ├── Login.jsx            ← Split-panel login
            ├── Signup.jsx           ← Card signup + password strength
            ├── Feed.jsx             ← Infinite scroll + sidebar
            └── Profile.jsx          ← Editable user profile
```

---

## 🚀 Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (local or Neon cloud)

### 1. Clone
```bash
git clone https://github.com/aako-aakash/devconnect.git
cd devconnect
```

### 2. Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and SECRET_KEY

# Start API (auto-creates tables on first run)
uvicorn app.main:app --reload --port 8000
```

✅ API live at `http://localhost:8000`
✅ Swagger UI at `http://localhost:8000/docs`

### 3. Frontend
```bash
cd frontend

npm install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

npm run dev
```

✅ App live at `http://localhost:5173`

---

## ☁️ Deployment

### Database — Neon (free tier)
1. Sign up at [neon.tech](https://neon.tech)
2. Create project → copy connection string (psycopg2 format)
3. String format: `postgresql://user:pass@host/db?sslmode=require`

### Backend — Render (Docker)
1. New Web Service → connect GitHub repo
2. **Environment: Docker** | **Root Directory: `backend`**
3. Add environment variables:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `SECRET_KEY` | Click Generate |
| `FRONTEND_URL` | Your Vercel URL |

### Frontend — Vercel
1. Import GitHub repo → **Root Directory: `frontend`**
2. Add environment variable:

| Key | Value |
|---|---|
| `VITE_API_URL` | Your Render service URL |

### Auto-deploy
Every `git push origin main` → Vercel rebuilds frontend (~30s) + Render rebuilds backend (~2 min)

---

## 🔐 Security

| Concern | Implementation |
|---|---|
| Passwords | bcrypt with cost factor 12 — never stored in plain text |
| Tokens | JWT signed with HMAC-SHA256, 7-day expiry |
| Transport | HTTPS enforced on all services |
| Database | SSL required (Neon enforces `sslmode=require`) |
| CORS | Regex-based origin matching for `*.vercel.app` + explicit origins |
| SQL Injection | Prevented by SQLAlchemy ORM parameterized queries |
| Ownership | Delete endpoint verifies `post.user_id === current_user.id` |

---

## 📊 Key Concepts Demonstrated

```
✅ RESTful API design (17 endpoints)    ✅ JWT stateless authentication
✅ Relational database modelling        ✅ Password hashing (bcrypt)
✅ SQLAlchemy ORM with relationships    ✅ Pydantic v2 validation
✅ React hooks + Context API            ✅ Axios interceptors
✅ Infinite scroll (IntersectionObserver) ✅ Optimistic UI updates
✅ CORS configuration                   ✅ Docker containerisation
✅ Environment variable management      ✅ CI/CD auto-deployment
✅ Mobile-responsive design             ✅ Glassmorphism UI
```

---

## 👤 Author

<div align="center">

**Built with ❤️ by [aako-aakash](https://github.com/aako-aakash)**

Powered by **Skyward** 🚀

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/aako-aakash)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/aako-aakash)

<br/>

*If this project helped you, consider leaving a ⭐ on GitHub!*

---

```
Made with  FastAPI · React · PostgreSQL · Docker · Vercel · Render · Neon
```

</div>
