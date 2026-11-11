# Aura Weather 🌤️

A production-ready, fullstack responsive weather web application powered by live [Open-Meteo](https://open-meteo.com/) APIs — no API keys required.

---

## 📂 Project Structure

```
WeatherApp/
├── frontend/                   # Static frontend (HTML, Tailwind CSS, Vanilla JS)
│   ├── index.html              # Site entry point (auto-redirects new visitors)
│   ├── registration.html       # User registration (mobile-first, responsive)
│   ├── login.html              # Authentication portal
│   ├── weather-dashboard.html  # Live atmospheric weather dashboard
│   ├── weather.js              # Open-Meteo API client & UI renderer
│   ├── config.js               # Dynamic API endpoint configuration
│   └── DESIGN.md               # Aura Atmosphere design system tokens
│
├── backend/                    # Python backend server
│   ├── server.py               # REST API, weather proxy with TTL cache, static file server
│   ├── database.py             # SQLite user auth (PBKDF2-SHA256 password hashing)
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment config (git-ignored)
│   └── .env.example            # Environment template
│
├── render.yaml                 # Render Infrastructure-as-Code deployment config
├── vercel.json                 # Vercel static frontend deployment config
├── Procfile                    # Heroku / Railway backend process definition
├── netlify.toml                # Netlify deployment fallback config
├── .gitignore                  # Git ignore rules
└── README.md                   # Full documentation & deployment guide
```

---

## 🚀 Quick Start (Local)

### Full Stack Mode (Backend serves Frontend on port 3000)

```bash
cd backend
python server.py
```

Open: **[http://localhost:3000](http://localhost:3000)**

---

## ☁️ Cloud Deployment Guide

### 1. Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new) named `weather-app` (public or private, without initializing README).
2. Run these commands from the `WeatherApp` directory:

```bash
git remote add origin https://github.com/saintedit/weather-app.git
git branch -M main
git push -u origin main
```

---

### 2. Deploy Backend to Render

1. Sign in to [Render](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`weather-app`).
4. Set the following settings:
   - **Name**: `aura-weather-backend`
   - **Root Directory**: `.` (or leave blank)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python backend/server.py`
   - **Instance Type**: `Free`
5. In **Environment Variables**, add:
   - `PORT`: `10000`
   - `ENVIRONMENT`: `production`
   - `SECRET_KEY`: `your_random_secret_key`
6. Click **Create Web Service**.
7. Render will provide a live URL, e.g.:  
   `https://aura-weather-backend.onrender.com`

> **Note**: Test your backend health at `https://aura-weather-backend.onrender.com/api/health`.

---

### 3. Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New…** → **Project**.
3. Import your `weather-app` GitHub repository.
4. In **Project Configuration**:
   - **Framework Preset**: `Other`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build and Output Settings**: Leave defaults (no build command needed)
5. Click **Deploy**.
6. Vercel will give you a live production URL, e.g.:  
   `https://weather-app-xyz.vercel.app`

---

### 4. Connect Frontend to Render Backend

Once both are deployed, link your frontend to your Render backend:

**Option A (Recommended — Edit `frontend/config.js`):**
In `frontend/config.js`, set your Render URL:
```javascript
window.AURA_API_BASE = 'https://aura-weather-backend.onrender.com';
```
Commit and push:
```bash
git add frontend/config.js
git commit -m "Configure Render backend URL for Vercel deployment"
git push
```
Vercel will redeploy automatically within seconds!

**Option B (Vercel Rewrites):**
In `vercel.json` at root:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://aura-weather-backend.onrender.com/api/:path*"
    }
  ]
}
```

---

## 🌐 Backend REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check & uptime |
| `POST` | `/api/auth/register` | Create user account |
| `POST` | `/api/auth/login` | Authenticate & get session token |
| `POST` | `/api/auth/logout` | Invalidate session |
| `GET` | `/api/auth/me` | Current user info from Bearer token |
| `GET` | `/api/weather/forecast` | Proxied Open-Meteo forecast (5-min cache) |
| `GET` | `/api/weather/air-quality` | Air quality data (10-min cache) |
| `GET` | `/api/weather/search` | Geocoding city search (1-hr cache) |
| `GET` | `/api/weather/reverse` | Reverse geocode by GPS coordinates |

---

## 📱 Core Features

- ✅ **Full Responsiveness**: Seamless layout from 360px smartphones to 4K displays.
- ✅ **Automatic Onboarding**: First-time visitors automatically start on Registration.
- ✅ **Live Meteorological Telemetry**: Real-time Open-Meteo data (humidity, UV, wind compass, AQI, 7-day daily forecast).
- ✅ **City Search & GPS Locate**: Global geocoding across 190+ countries with one-tap device location.
- ✅ **Dynamic Horizon**: 6-hour dynamic slider that reflects conditions (rain animation activates on actual rain).
- ✅ **User Accounts & Guest Mode**: Password hashing with PBKDF2-SHA256, session tokens, or 1-click guest preview.
- ✅ **Graceful Offline Fallback**: Frontend works statically with local storage even without the backend.

---

## 📄 License

MIT — Created with Antigravity & Google Stitch.
