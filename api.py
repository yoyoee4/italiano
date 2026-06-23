#!/usr/bin/env python3
"""VolaLingo API — Auth + Progress Sync"""
import os, json, time, hashlib, secrets, sqlite3
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import bcrypt

app = FastAPI(title="VolaLingo API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DB_PATH = "/var/www/volalingo/vola.db"
JWT_SECRET = os.environ.get("VOLA_SECRET", secrets.token_hex(32))

def get_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA journal_mode=WAL")
    return db

def init_db():
    db = get_db()
    db.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        last_login TEXT
    );
    CREATE TABLE IF NOT EXISTS progress (
        user_id INTEGER,
        key TEXT,
        value TEXT,
        updated_at TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (user_id, key)
    );
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER,
        created_at REAL,
        expires_at REAL
    );
    """)
    db.commit()
    db.close()

init_db()

# ─────────────────── Analytics Tables ───────────────────
ANALYTICS_DB = "/var/www/volalingo/analytics.db"

def get_adb():
    db = sqlite3.connect(ANALYTICS_DB)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA journal_mode=WAL")
    return db

def init_adb():
    db = get_adb()
    db.executescript("""
    CREATE TABLE IF NOT EXISTS app_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app TEXT NOT NULL,
        uid TEXT NOT NULL,
        event TEXT NOT NULL,
        value INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_events_app ON app_events(app);
    CREATE INDEX IF NOT EXISTS idx_events_uid ON app_events(uid);
    CREATE INDEX IF NOT EXISTS idx_events_event ON app_events(event);
    """)
    db.commit()
    db.close()

init_adb()

# ─────────────────── Analytics Endpoints ───────────────────

@app.post("/api/analytics/track")
async def track_event(request: Request):
    """Track anonymous usage event. No auth required."""
    body = await request.json()
    app = body.get("app", "unknown")
    uid = body.get("uid", "anon")
    event = body.get("event", "ping")
    value = body.get("value", 0)
    if app not in ("italian", "german", "unknown"):
        app = "unknown"
    if event not in ("ping", "session", "word_learned", "xp_earned", "exam_taken", "lesson_done"):
        event = "ping"
    db = get_adb()
    db.execute("INSERT INTO app_events (app, uid, event, value) VALUES (?,?,?,?)",
               (app, uid, event, value))
    db.commit()
    db.close()
    return {"ok": True}

@app.get("/api/analytics/stats")
async def analytics_stats(request: Request):
    """Get aggregate analytics. Optional ?app= filter."""
    app = request.query_params.get("app")
    db = get_adb()
    if app:
        # Total unique users per app
        users = db.execute("SELECT COUNT(DISTINCT uid) FROM app_events WHERE app=?", (app,)).fetchone()[0]
        # Total words learned per app (latest value per user)
        words = db.execute("""
            SELECT COALESCE(SUM(max_val), 0) FROM (
                SELECT MAX(value) as max_val FROM app_events
                WHERE app=? AND event='word_learned' GROUP BY uid
            )
        """, (app,)).fetchone()[0]
        # Total sessions
        sessions = db.execute("SELECT COUNT(*) FROM app_events WHERE app=? AND event='session'", (app,)).fetchone()[0]
        # Total pings (daily active)
        pings = db.execute("SELECT COUNT(DISTINCT uid) FROM app_events WHERE app=? AND event='ping' AND created_at >= datetime('now', '-7 days')", (app,)).fetchone()[0]
        db.close()
        return {"ok": True, "app": app, "users": users, "wordsLearned": words, "sessions": sessions, "active7d": pings}
    else:
        # All apps summary
        rows = db.execute("""
            SELECT app, COUNT(DISTINCT uid) as users,
                   COUNT(*) FILTER (WHERE event='session') as sessions
            FROM app_events GROUP BY app
        """).fetchall()
        # Words per app
        word_rows = db.execute("""
            SELECT app, COALESCE(SUM(max_val), 0) FROM (
                SELECT app, MAX(value) as max_val FROM app_events
                WHERE event='word_learned' GROUP BY app, uid
            ) GROUP BY app
        """).fetchall()
        word_map = {r[0]: r[1] for r in word_rows}
        db.close()
        data = []
        for r in rows:
            data.append({
                "app": r["app"],
                "users": r["users"],
                "sessions": r["sessions"],
                "wordsLearned": word_map.get(r["app"], 0)
            })
        return {"ok": True, "apps": data, "total": {
            "users": sum(d["users"] for d in data),
            "wordsLearned": sum(d["wordsLearned"] for d in data),
            "sessions": sum(d["sessions"] for d in data)
        }}

@app.get("/api/analytics/dashboard")
async def analytics_dashboard():
    """Simple HTML dashboard showing analytics."""
    db = get_adb()
    # Get stats for both apps
    italian = db.execute("""
        SELECT COUNT(DISTINCT uid) as users,
               COUNT(*) FILTER (WHERE event='session') as sessions,
               COUNT(*) FILTER (WHERE event='ping') as pings
        FROM app_events WHERE app='italian'
    """).fetchone()
    german = db.execute("""
        SELECT COUNT(DISTINCT uid) as users,
               COUNT(*) FILTER (WHERE event='session') as sessions,
               COUNT(*) FILTER (WHERE event='ping') as pings
        FROM app_events WHERE app='german'
    """).fetchone()
    # Words learned
    it_words = db.execute("""
        SELECT COALESCE(SUM(max_val), 0) FROM (
            SELECT MAX(value) as max_val FROM app_events
            WHERE app='italian' AND event='word_learned' GROUP BY uid
        )
    """).fetchone()[0]
    de_words = db.execute("""
        SELECT COALESCE(SUM(max_val), 0) FROM (
            SELECT MAX(value) as max_val FROM app_events
            WHERE app='german' AND event='word_learned' GROUP BY uid
        )
    """).fetchone()[0]
    # Recent events (last 20)
    recent = db.execute("""
        SELECT app, event, value, created_at FROM app_events
        ORDER BY id DESC LIMIT 20
    """).fetchall()
    db.close()

    rows_html = ""
    for r in recent:
        rows_html += f"<tr><td>{r['app']}</td><td>{r['event']}</td><td>{r['value']}</td><td>{r['created_at']}</td></tr>"

    html = f"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>VolaLingo Analytics</title>
<style>
body {{ font-family: system-ui, sans-serif; background: #0a0e17; color: #e2e8f0; margin: 0; padding: 20px; direction: rtl; }}
h1 {{ color: #818cf8; font-size: 1.5rem; }}
.stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0; }}
.card {{ background: #141a26; border-radius: 12px; padding: 20px; border: 1px solid #1e293b; }}
.card h3 {{ margin: 0 0 8px; font-size: .85rem; color: #94a3b8; }}
.card .num {{ font-size: 2rem; font-weight: 800; color: #e2e8f0; }}
.card .italian {{ color: #818cf8; }}
.card .german {{ color: #fbbf24; }}
table {{ width: 100%; border-collapse: collapse; font-size: .8rem; }}
th, td {{ padding: 8px 12px; text-align: right; border-bottom: 1px solid #1e293b; }}
th {{ color: #94a3b8; font-weight: 600; }}
</style>
</head>
<body>
<h1>📊 VolaLingo Analytics</h1>
<div class="stats">
  <div class="card">
    <h3>🇮🇹 איטלקית — משתמשים</h3>
    <div class="num italian">{italian['users']}</div>
  </div>
  <div class="card">
    <h3>🇮🇹 איטלקית — מילים למדו</h3>
    <div class="num italian">{it_words}</div>
  </div>
  <div class="card">
    <h3>🇮🇹 איטלקית — סשנים</h3>
    <div class="num italian">{italian['sessions']}</div>
  </div>
  <div class="card">
    <h3>🇩🇪 גרמנית — משתמשים</h3>
    <div class="num german">{german['users']}</div>
  </div>
  <div class="card">
    <h3>🇩🇪 גרמנית — מילים למדו</h3>
    <div class="num german">{de_words}</div>
  </div>
  <div class="card">
    <h3>🇩🇪 גרמנית — סשנים</h3>
    <div class="num german">{german['sessions']}</div>
  </div>
</div>
<h2>פעילויות אחרונות</h2>
<table>
<tr><th>אפליקציה</th><th>אירוע</th><th>ערך</th><th>תאריך</th></tr>
{rows_html}
</table>
</body>
</html>"""
    from fastapi.responses import HTMLResponse
    return HTMLResponse(html)

# ─────────────────── Auth Helpers ───────────────────

def make_token(user_id: int) -> str:
    raw = f"{user_id}:{time.time()}:{secrets.token_hex(16)}"
    token = hashlib.sha256(f"{raw}:{JWT_SECRET}".encode()).hexdigest()
    db = get_db()
    db.execute("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?,?,?,?)",
               (token, user_id, time.time(), time.time() + 86400*30))
    db.commit()
    db.close()
    return token

def auth_user(request: Request) -> int:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    token = auth[7:]
    db = get_db()
    row = db.execute("SELECT user_id, expires_at FROM sessions WHERE token=?", (token,)).fetchone()
    db.close()
    if not row or row["expires_at"] < time.time():
        raise HTTPException(401, "Invalid or expired token")
    return row["user_id"]

@app.post("/api/register")
async def register(request: Request):
    body = await request.json()
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")
    name = body.get("name", "").strip()
    if not email or len(password) < 6:
        raise HTTPException(400, "Email and password (6+ chars) required")
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    db = get_db()
    try:
        db.execute("INSERT INTO users (email, password_hash, name) VALUES (?,?,?)", (email, pw_hash, name))
        db.commit()
        uid = db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()["id"]
    except sqlite3.IntegrityError:
        db.close()
        raise HTTPException(409, "Email already registered")
    db.close()
    token = make_token(uid)
    return {"ok": True, "token": token, "user": {"id": uid, "email": email, "name": name}}

@app.post("/api/login")
async def login(request: Request):
    body = await request.json()
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")
    db = get_db()
    row = db.execute("SELECT id, password_hash, name FROM users WHERE email=?", (email,)).fetchone()
    db.close()
    if not row or not bcrypt.checkpw(password.encode(), row["password_hash"].encode()):
        raise HTTPException(401, "Invalid email or password")
    token = make_token(row["id"])
    db = get_db()
    db.execute("UPDATE users SET last_login=datetime('now') WHERE id=?", (row["id"],))
    db.commit()
    db.close()
    return {"ok": True, "token": token, "user": {"id": row["id"], "email": email, "name": row["name"]}}

@app.post("/api/logout")
async def logout(request: Request):
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
        db = get_db()
        db.execute("DELETE FROM sessions WHERE token=?", (token,))
        db.commit()
        db.close()
    return {"ok": True}

@app.get("/api/me")
async def me(request: Request):
    uid = auth_user(request)
    db = get_db()
    row = db.execute("SELECT id, email, name, created_at FROM users WHERE id=?", (uid,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(404, "User not found")
    return {"ok": True, "user": dict(row)}

@app.get("/api/progress")
async def get_progress(request: Request):
    uid = auth_user(request)
    db = get_db()
    rows = db.execute("SELECT key, value FROM progress WHERE user_id=?", (uid,)).fetchall()
    db.close()
    data = {r["key"]: json.loads(r["value"]) for r in rows}
    return {"ok": True, "progress": data}

@app.post("/api/progress")
async def save_progress(request: Request):
    uid = auth_user(request)
    body = await request.json()
    data = body.get("progress", {})
    db = get_db()
    for key, value in data.items():
        db.execute("""
            INSERT INTO progress (user_id, key, value, updated_at) VALUES (?,?,?,datetime('now'))
            ON CONFLICT(user_id, key) DO UPDATE SET value=?, updated_at=datetime('now')
        """, (uid, key, json.dumps(value), json.dumps(value)))
    db.commit()
    db.close()
    return {"ok": True}

@app.post("/api/progress/sync")
async def sync_progress(request: Request):
    """Merge local progress with server — server wins on conflict for safety"""
    uid = auth_user(request)
    body = await request.json()
    local = body.get("local", {})
    db = get_db()
    # Get server data
    rows = db.execute("SELECT key, value FROM progress WHERE user_id=?", (uid,)).fetchall()
    server = {r["key"]: json.loads(r["value"]) for r in rows}
    # Merge: for each key, take the one with more data
    merged = {}
    all_keys = set(list(local.keys()) + list(server.keys()))
    for key in all_keys:
        lv = local.get(key)
        sv = server.get(key)
        if lv is None:
            merged[key] = sv
        elif sv is None:
            merged[key] = lv
        else:
            # Both exist — merge intelligently
            if isinstance(lv, dict) and isinstance(sv, dict):
                # For objects like sentencesPracticed, take max values
                merged_val = {}
                for k in set(list(lv.keys()) + list(sv.keys())):
                    lval = lv.get(k, 0)
                    sval = sv.get(k, 0)
                    merged_val[k] = max(lval, sval) if isinstance(lval, (int, float)) else (sval or lval)
                merged[key] = merged_val
            elif isinstance(lv, list) and isinstance(sv, list):
                # For lists like wordsLearned, take union
                merged[key] = list(set(lv + sv))
            elif isinstance(lv, (int, float)) and isinstance(sv, (int, float)):
                merged[key] = max(lv, sv)  # Take higher XP/score
            else:
                merged[key] = sv if sv is not None else lv
    # Save merged
    for key, value in merged.items():
        db.execute("""
            INSERT INTO progress (user_id, key, value, updated_at) VALUES (?,?,?,datetime('now'))
            ON CONFLICT(user_id, key) DO UPDATE SET value=?, updated_at=datetime('now')
        """, (uid, key, json.dumps(value), json.dumps(value)))
    db.commit()
    db.close()
    return {"ok": True, "progress": merged}

@app.get("/api/health")
async def health():
    return {"ok": True, "time": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3100)
