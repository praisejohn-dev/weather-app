"""
Aura Weather — Fullstack Production Server
Provides RESTful Authentication APIs, Weather Proxy with Caching, and High-Performance Frontend Serving.
"""

import os
import sys
import json
import time
import urllib.request
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

# Import database module
sys.path.insert(0, os.path.dirname(__file__))
import database

# Directory paths
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")

# In-Memory TTL Cache for weather queries
WEATHER_CACHE = {}

def get_cached(key):
    entry = WEATHER_CACHE.get(key)
    if entry:
        val, expiry = entry
        if time.time() < expiry:
            return val
        else:
            del WEATHER_CACHE[key]
    return None

def set_cached(key, val, ttl_seconds=300):
    WEATHER_CACHE[key] = (val, time.time() + ttl_seconds)

START_TIME = time.time()

class AuraRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve frontend directory for static requests
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def end_headers(self):
        # Set CORS & Security Headers
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # API Routes
        if path.startswith("/api/"):
            return self.handle_api_get(path, parse_qs(parsed.query))

        # Static File Serving
        # Map root to index.html
        if path == "/" or path == "":
            self.path = "/index.html"

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            return self.handle_api_post(path)

        self.send_json_error(404, "Endpoint not found")

    def handle_api_get(self, path, query_params):
        # 1. Health check
        if path == "/api/health":
            self.send_json_response(200, {
                "status": "healthy",
                "service": "aura-weather-backend",
                "uptime_seconds": int(time.time() - START_TIME),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "cached_queries": len(WEATHER_CACHE)
            })
            return

        # 2. Get current authenticated user
        if path == "/api/auth/me":
            auth_header = self.headers.get("Authorization", "")
            token = auth_header.replace("Bearer ", "").strip()
            user = database.get_user_by_token(token)
            if not user:
                self.send_json_error(401, "Invalid or expired session token")
                return
            self.send_json_response(200, {"success": True, "user": user})
            return

        # 3. Weather Forecast Proxy with Cache
        if path == "/api/weather/forecast":
            query_str = urlparse(self.path).query
            cache_key = f"forecast:{query_str}"
            cached = get_cached(cache_key)
            if cached:
                self.send_json_response(200, cached, extra_headers={"X-Cache": "HIT"})
                return

            target_url = f"https://api.open-meteo.com/v1/forecast?{query_str}"
            try:
                data = self.fetch_remote_json(target_url)
                set_cached(cache_key, data, ttl_seconds=300) # 5 min TTL
                self.send_json_response(200, data, extra_headers={"X-Cache": "MISS"})
            except Exception as e:
                self.send_json_error(502, f"Weather service error: {str(e)}")
            return

        # 4. Air Quality Proxy with Cache
        if path == "/api/weather/air-quality":
            query_str = urlparse(self.path).query
            cache_key = f"air_quality:{query_str}"
            cached = get_cached(cache_key)
            if cached:
                self.send_json_response(200, cached, extra_headers={"X-Cache": "HIT"})
                return

            target_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?{query_str}"
            try:
                data = self.fetch_remote_json(target_url)
                set_cached(cache_key, data, ttl_seconds=600) # 10 min TTL
                self.send_json_response(200, data, extra_headers={"X-Cache": "MISS"})
            except Exception as e:
                self.send_json_error(502, f"Air quality service error: {str(e)}")
            return

        # 5. Geocoding Search Proxy
        if path == "/api/weather/search":
            query_str = urlparse(self.path).query
            cache_key = f"search:{query_str}"
            cached = get_cached(cache_key)
            if cached:
                self.send_json_response(200, cached, extra_headers={"X-Cache": "HIT"})
                return

            target_url = f"https://geocoding-api.open-meteo.com/v1/search?{query_str}"
            try:
                data = self.fetch_remote_json(target_url)
                set_cached(cache_key, data, ttl_seconds=3600) # 1 hr TTL
                self.send_json_response(200, data, extra_headers={"X-Cache": "MISS"})
            except Exception as e:
                self.send_json_error(502, f"Geocoding service error: {str(e)}")
            return

        # 6. Reverse Geocode Proxy
        if path == "/api/weather/reverse":
            lat = query_params.get("latitude", [""])[0]
            lon = query_params.get("longitude", [""])[0]
            if not lat or not lon:
                self.send_json_error(400, "Missing latitude or longitude parameter")
                return

            target_url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lon}&localityLanguage=en"
            try:
                data = self.fetch_remote_json(target_url)
                self.send_json_response(200, data)
            except Exception as e:
                self.send_json_error(502, f"Reverse geocoding error: {str(e)}")
            return

        self.send_json_error(404, "API route not found")

    def handle_api_post(self, path):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            body = json.loads(post_data.decode("utf-8")) if post_data else {}
        except json.JSONDecodeError:
            self.send_json_error(400, "Invalid JSON payload")
            return

        # User Registration
        if path == "/api/auth/register":
            name = body.get("name", "").strip()
            email = body.get("email", "").strip()
            password = body.get("password", "")

            if not name or not email or not password:
                self.send_json_error(400, "Name, email, and password are required")
                return

            try:
                user = database.create_user(name, email, password)
                self.send_json_response(201, {
                    "success": True,
                    "message": "User registered successfully",
                    "token": user["token"],
                    "user": {
                        "id": user["id"],
                        "name": user["name"],
                        "email": user["email"],
                        "created_at": user["created_at"]
                    }
                })
            except ValueError as err:
                self.send_json_error(400, str(err))
            return

        # User Login
        if path == "/api/auth/login":
            email = body.get("email", "").strip()
            password = body.get("password", "")

            if not email or not password:
                self.send_json_error(400, "Email and password are required")
                return

            try:
                user = database.verify_user(email, password)
                self.send_json_response(200, {
                    "success": True,
                    "message": "Login successful",
                    "token": user["token"],
                    "user": {
                        "id": user["id"],
                        "name": user["name"],
                        "email": user["email"],
                        "created_at": user["created_at"]
                    }
                })
            except ValueError as err:
                self.send_json_error(401, str(err))
            return

        # User Logout
        if path == "/api/auth/logout":
            auth_header = self.headers.get("Authorization", "")
            token = auth_header.replace("Bearer ", "").strip()
            if token:
                database.delete_session(token)
            self.send_json_response(200, {"success": True, "message": "Logged out successfully"})
            return

        self.send_json_error(404, "API route not found")

    def fetch_remote_json(self, url):
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "AuraWeather/1.0 (Nordic Telemetry Engine)"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))

    def send_json_response(self, status_code, data, extra_headers=None):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for k, v in extra_headers.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def send_json_error(self, status_code, message):
        self.send_json_response(status_code, {
            "success": False,
            "error": message,
            "status_code": status_code
        })

def run_server(port=3000, host="0.0.0.0"):
    # Ensure database tables exist
    database.init_db()

    server_address = (host, port)
    httpd = ThreadingHTTPServer(server_address, AuraRequestHandler)
    sep = "=" * 65
    print(sep)
    print(f"[*] Aura Weather Server  -->  http://localhost:{port}")
    print(f"[F] Frontend dir         -->  {FRONTEND_DIR}")
    print(f"[D] SQLite database      -->  {database.DB_PATH}")
    print(f"[A] Health check         -->  http://localhost:{port}/api/health")
    print(sep)
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server gracefully...")
        httpd.server_close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port=port)
