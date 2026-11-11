# Aura Weather 🌤️

A production-ready, fullstack responsive weather web application powered by live [Open-Meteo](https://open-meteo.com/) APIs — no API keys required.

---

## 📂 Project Structure

```
Stitch/
├── frontend/                   # Static frontend (HTML, CSS via Tailwind CDN, JS)
│   ├── index.html              # Site entry point (auto-redirects new visitors)
│   ├── registration.html       # User registration (mobile-first, fully responsive)
│   ├── login.html              # Authentication portal
│   ├── weather-dashboard.html  # Live weather dashboard
│   ├── weather.js              # Open-Meteo API client & UI renderer
│   └── DESIGN.md               # Aura Atmosphere design system tokens
│
├── backend/                    # Python backend server
│   ├── server.py               # HTTP server with REST API & weather proxy
│   ├── database.py             # SQLite user auth (PBKDF2 password hashing)
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment config (do not commit)
│   └── .env.example            # Environment template
│
└── README.md
```

---

## 🚀 Quick Start (Local)

### Option A — Full Stack (Backend + Frontend)

**Run the backend** (also serves the frontend at `http://localhost:3000`):

```bash
cd backend
python server.py
```

Then open: **[http://localhost:3000](http://localhost:3000)**

---

### Option B — Frontend Only (Static)

```bash
cd frontend
python -m http.server 3000
```

> **Note:** In static mode, registration and login fall back to `localStorage` automatically. The weather API calls go directly to Open-Meteo from the browser — zero config required.

---

## 🌐 API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Authenticate & receive session token |
| `POST` | `/api/auth/logout` | Invalidate session token |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `GET` | `/api/weather/forecast` | Proxied Open-Meteo forecast (5-min cache) |
| `GET` | `/api/weather/air-quality` | Proxied air quality data (10-min cache) |
| `GET` | `/api/weather/search` | Geocoding city search (1-hr cache) |
| `GET` | `/api/weather/reverse` | Reverse geocoding by GPS coordinates |

**Example request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Alex", "email": "alex@example.com", "password": "mypassword"}'
```

---

## 📱 Features

- ✅ **Fully Responsive** — Mobile (360px), tablet, and desktop layouts
- ✅ **New Visitor Onboarding** — Automatically routes first-time visitors to Registration
- ✅ **Live Weather** — Real-time data: temperature, humidity, UV index, wind, AQI, 7-day forecast
- ✅ **City Search** — Autocomplete geocoding search with 190+ country coverage
- ✅ **GPS Location** — One-tap current location detection
- ✅ **Unit Toggle** — Switch between °C and °F
- ✅ **User Accounts** — Secure PBKDF2-SHA256 hashed passwords, persistent sessions
- ✅ **Guest Mode** — Skip registration and explore instantly
- ✅ **Weather Caching** — Backend TTL cache reduces redundant API calls
- ✅ **Zero API Keys** — Powered entirely by free Open-Meteo APIs

---

## ☁️ Deployment

### Frontend (Netlify / Vercel / GitHub Pages)

Deploy the **`frontend/`** folder as a static site:

```bash
# Netlify CLI
netlify deploy --dir=frontend --prod

# Vercel CLI
vercel frontend/
```

### Backend (Railway / Render / any VPS)

```bash
cd backend
pip install -r requirements.txt
python server.py
```

For production with **gunicorn** (Linux/Mac):
```bash
gunicorn --bind 0.0.0.0:3000 --workers 4 server:AuraRequestHandler
```

---

## 🔐 Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
PORT=3000
SECRET_KEY=your_secret_key_here
DATABASE_PATH=database.sqlite
WEATHER_CACHE_TTL_SECONDS=300
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Tailwind CSS (CDN), Vanilla JavaScript |
| Backend | Python 3.10+ Standard Library (no frameworks) |
| Database | SQLite (via Python `sqlite3`) |
| Weather API | [Open-Meteo](https://open-meteo.com/) (free, no key) |
| Fonts | Plus Jakarta Sans, Material Symbols |

---

## 📄 License

MIT — feel free to fork, modify, and deploy.
