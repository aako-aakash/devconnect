# 🚀 DevConnect — Mini Social Platform for Students

> A production-quality full-stack social platform where student developers can share posts, connect with peers, like and comment on content, and build their developer identity.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql)](https://postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## 📸 Features

| Feature | Status |
|---|---|
| 🔐 JWT Authentication (Signup / Login) | ✅ |
| 🌐 Global Post Feed (paginated + infinite scroll) | ✅ |
| ❤️ Like / Unlike posts | ✅ |
| 💬 Comments on posts | ✅ |
| 🧑 User Profile with editable bio | ✅ |
| 🔍 Search users & posts | ✅ |
| 🔔 Real-time Notifications | ✅ |
| 🌙 Dark mode (default) | ✅ |
| 📱 Fully responsive UI | ✅ |
| 🗑️ Delete your own posts | ✅ |

---

## 🧱 Tech Stack

### Frontend
- **React 18** — UI library with hooks
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **Axios** — HTTP client with interceptors
- **Lucide React** — Icon set
- **date-fns** — Date formatting
- **Vite** — Build tool

### Backend
- **FastAPI** — High-performance Python web framework
- **SQLAlchemy 2.0** — ORM with async-ready models
- **Pydantic v2** — Data validation
- **Python-Jose** — JWT token handling
- **Passlib + bcrypt** — Password hashing
- **Uvicorn** — ASGI server

### Database
- **PostgreSQL** — Relational database
- **Supabase / Neon** (recommended for cloud)

### Deployment
- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Render](https://render.com)
- **Database** → [Supabase](https://supabase.com) or [Neon](https://neon.tech)

---

## 📂 Project Structure

```
devconnect/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic Settings
│   │   │   └── security.py      # JWT + bcrypt
│   │   ├── db/
│   │   │   └── database.py      # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   └── models.py        # ORM: User, Post, Like, Comment, Notification
│   │   ├── schemas/
│   │   │   ├── user.py          # User request/response schemas
│   │   │   └── schemas.py       # Post, Comment, Like, Notification schemas
│   │   ├── routes/
│   │   │   ├── auth.py          # /api/auth/*
│   │   │   ├── posts.py         # /api/posts/*
│   │   │   └── users.py         # /api/users/*
│   │   ├── services/
│   │   │   ├── auth_service.py  # Registration & login logic
│   │   │   ├── post_service.py  # Feed, CRUD, likes, comments
│   │   │   └── user_service.py  # Profiles, search, notifications
│   │   └── main.py              # App factory + CORS + startup
│   ├── requirements.txt
│   ├── render.yaml
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.js         # Axios client + all API calls
    │   ├── components/
    │   │   ├── Navbar.jsx       # Navigation + search + notifications
    │   │   ├── PostCard.jsx     # Post with like/comment/delete
    │   │   ├── CreatePost.jsx   # Post composer
    │   │   ├── Avatar.jsx       # Reusable avatar with fallback
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── hooks/
    │   │   └── index.js         # useFetch, useDebounce, useLocalStorage
    │   ├── pages/
    │   │   ├── Login.jsx        # Login page
    │   │   ├── Signup.jsx       # Signup page + password strength
    │   │   ├── Feed.jsx         # Global feed + infinite scroll
    │   │   ├── Profile.jsx      # User profile + editable
    │   │   └── NotFound.jsx     # 404 page
    │   ├── App.jsx              # Router + layout
    │   ├── main.jsx
    │   └── index.css            # Tailwind + design tokens
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── vercel.json
```

---

## 🗄️ Database Schema

```sql
-- Users
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bio           TEXT,
  avatar_url    VARCHAR(500),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Likes
CREATE TABLE likes (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  post_id    INT REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Comments
CREATE TABLE comments (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  post_id    INT REFERENCES posts(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id           SERIAL PRIMARY KEY,
  recipient_id INT REFERENCES users(id) ON DELETE CASCADE,
  actor_name   VARCHAR(100) NOT NULL,
  action       VARCHAR(100) NOT NULL,
  post_id      INT,
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT NOW()
);
```

> **Note:** Tables are created automatically on startup via `Base.metadata.create_all()`. No manual migration needed for development.

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (local or cloud)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/devconnect.git
cd devconnect
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

The app will be live at `http://localhost:5173`

---

## 🚀 Deployment

### Database (Neon or Supabase)
1. Create a free PostgreSQL database
2. Copy the connection string (format: `postgresql://user:pass@host/db`)

### Backend (Render)
1. Push backend to GitHub
2. Create a new **Web Service** on Render
3. Set environment variables:
   ```
   DATABASE_URL=<your-postgres-url>
   SECRET_KEY=<random-secret>
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
1. Push frontend to GitHub
2. Import project on Vercel
3. Set environment variable:
   ```
   VITE_API_URL=https://your-api.onrender.com
   ```
4. Deploy — Vercel handles the rest!

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login + get JWT | ❌ |
| `GET` | `/api/auth/me` | Get current user | ✅ |

### Posts
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/posts/feed` | Paginated global feed | ✅ |
| `POST` | `/api/posts/` | Create a post | ✅ |
| `DELETE` | `/api/posts/{id}` | Delete own post | ✅ |
| `POST` | `/api/posts/{id}/like` | Toggle like | ✅ |
| `GET` | `/api/posts/{id}/comments` | Get comments | ✅ |
| `POST` | `/api/posts/{id}/comments` | Add comment | ✅ |
| `GET` | `/api/posts/search/posts?q=` | Search posts | ✅ |

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/users/{id}` | Get user profile | ✅ |
| `GET` | `/api/users/{id}/posts` | Get user's posts | ✅ |
| `PATCH` | `/api/users/me/profile` | Update own profile | ✅ |
| `GET` | `/api/users/search?q=` | Search users | ✅ |
| `GET` | `/api/users/notifications` | Get notifications | ✅ |
| `POST` | `/api/users/notifications/read` | Mark all read | ✅ |

### Request/Response Examples

**POST /api/auth/signup**
```json
// Request
{ "name": "Jane Dev", "email": "jane@uni.edu", "password": "securePass1" }

// Response 201
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": 1, "name": "Jane Dev", "email": "jane@uni.edu", ... }
}
```

**POST /api/posts/**
```json
// Request (Authorization: Bearer <token>)
{ "content": "Just shipped my first FastAPI project! 🚀" }

// Response 201
{
  "id": 42,
  "content": "Just shipped my first FastAPI project! 🚀",
  "created_at": "2024-06-01T12:00:00",
  "author": { "id": 1, "name": "Jane Dev", "avatar_url": null },
  "like_count": 0,
  "comment_count": 0,
  "liked_by_me": false
}
```

---

## 🔐 Security

- Passwords hashed with **bcrypt** (cost factor 12)
- **JWT** tokens with 7-day expiry
- All protected routes require `Authorization: Bearer <token>`
- Input validation via **Pydantic v2** schemas
- SQL injection prevented by **SQLAlchemy ORM**
- CORS configured to allow only the frontend origin

---

## 🧪 Testing the API

Visit `http://localhost:8000/docs` for the **Swagger UI** — all endpoints are testable directly in the browser.

---

## 📄 License

MIT — build on it, learn from it, ship your own version.

---

> Built with ❤️ as a full-stack learning project. Star ⭐ if this helped you!

## Author :
# AAKASH
