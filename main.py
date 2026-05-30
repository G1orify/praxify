import os
import asyncio
import logging
import random
import sys
import time
import sqlite3
import json
import signal
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import discord
from discord.ext import commands, tasks, voice_recv
from recorder import AudioRecorder

load_dotenv()

# Enable ANSI support on Windows
if sys.platform == "win32":
    os.system('color')

# --- Professional Logging Setup ---
class CipherFormatter(logging.Formatter):
    """Custom formatter for a high-tech terminal look."""
    
    # ANSI Color Codes
    GREY = "\x1b[38;20m"
    CYAN = "\x1b[36;20m"
    YELLOW = "\x1b[33;20m"
    RED = "\x1b[31;20m"
    BOLD_RED = "\x1b[31;1m"
    RESET = "\x1b[0m"
    GREEN = "\x1b[32;20m"

    def format(self, record):
        log_fmt = "%(asctime)s | "
        
        # Color coding by level
        if record.levelno == logging.INFO:
            log_fmt += f"{self.CYAN}%(levelname)-7s{self.RESET} | "
        elif record.levelno == logging.WARNING:
            log_fmt += f"{self.YELLOW}%(levelname)-7s{self.RESET} | "
        elif record.levelno == logging.ERROR:
            log_fmt += f"{self.RED}%(levelname)-7s{self.RESET} | "
        else:
            log_fmt += "%(levelname)-7s | "

        log_fmt += "%(message)s"
        
        formatter = logging.Formatter(log_fmt, datefmt='%H:%M:%S')
        return formatter.format(record)

# Initialize enhanced logging
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(CipherFormatter())
logging.basicConfig(level=logging.INFO, handlers=[handler])
logger = logging.getLogger("VibeRecorder")

# Suppress noisy library logs
logging.getLogger("discord").setLevel(logging.WARNING)
logging.getLogger("discord.ext.voice_recv").setLevel(logging.WARNING)
# --- End Logging Setup ---

occupied_channels = set() 

SPOTIFY_SONGS = [
    ("Blinding Lights", "The Weeknd"),
    ("Starboy", "The Weeknd"),
    ("Heat Waves", "Glass Animals"),
    ("Stay", "The Kid LAROI & Justin Bieber"),
    ("As It Was", "Harry Styles"),
    ("Save Your Tears", "The Weeknd"),
    ("FE!N", "Travis Scott"),
    ("Not Like Us", "Kendrick Lamar"),
    ("Lover", "Taylor Swift"),
    ("Paint The Town Red", "Doja Cat"),
    ("Cruel Summer", "Taylor Swift"),
    ("Pink + White", "Frank Ocean"),
    ("EARFQUAKE", "Tyler, The Creator")
]

GAMES = [
    {"name": "Valorant", "id": "700136079562375258", "details": "Competitive", "state": "In a Match - 12-10"},
    {"name": "League of Legends", "id": "356869127241072640", "details": "Ranked Solo/Duo", "state": "Playing as Yasuo"},
    {"name": "Minecraft", "id": "432980117396586497", "details": "Hypixel Network", "state": "Playing Bedwars"},
    {"name": "Visual Studio Code", "id": "383226320970055681", "details": "Editing main.py", "state": "Workspace: Backend Engine"},
    {"name": "Grand Theft Auto V", "id": "329815017042509825", "details": "GTA Online", "state": "Freemode"},
    {"name": "Apex Legends", "id": "542069922511454208", "details": "Ranked Leagues", "state": "In Match - 3 Squads Left"},
    {"name": "Roblox", "id": "438122368288358401", "details": "Blox Fruits", "state": "Grinding levels"},
    {"name": "Genshin Impact", "id": "762434555021295667", "details": "Co-Op Mode", "state": "Exploring Teyvat"},
    {"name": "Call of Duty", "id": "601275990234562562", "details": "Warzone", "state": "15 Players Remaining"}
]

class VibeRecorderBot(commands.Bot):
    def __init__(self, token_index):
        super().__init__(command_prefix="v!", self_bot=True, help_command=None)
        self.token_index = token_index
        self.target_guild_id = int(os.getenv("TARGET_GUILD_ID", 0))
        self.hop_interval = int(os.getenv("HOP_INTERVAL", 120))
        self.owner_id = int(os.getenv("OWNER_ID", 0))
        self.activity_index = self.token_index
        
        base_path = Path(__file__).parent
        self.recordings_dir = base_path / "recordings"
        self.db_path = self.recordings_dir / "recordings.db"
        self.recorder = AudioRecorder(self.recordings_dir, self.db_path)
        
        self.current_channel = None
        self.last_hop_time = 0
        self.current_stay_duration = 0
        self.channel_cooldowns = {}
        self.init_db()

    def connect_db(self):
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.execute("PRAGMA journal_mode=WAL")
        return conn

    def init_db(self):
        try:
            conn = self.connect_db()
            c = conn.cursor()
            c.execute("""
                CREATE TABLE IF NOT EXISTS bot_state (
                    bot_id INTEGER PRIMARY KEY,
                    bot_name TEXT,
                    current_vc TEXT,
                    state TEXT,
                    log TEXT,
                    target_channel_id TEXT,
                    target_user_id TEXT,
                    force_kick BOOLEAN DEFAULT 0,
                    override_presence TEXT,
                    vc_members TEXT,
                    disabled BOOLEAN DEFAULT 0,
                    play_audio TEXT,
                    updated_at DATETIME
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS fleet_config (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    freeze_all BOOLEAN DEFAULT 0,
                    panic_disconnect BOOLEAN DEFAULT 0
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS blacklisted_channels (
                    channel_id TEXT PRIMARY KEY,
                    channel_name TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS blacklisted_users (
                    user_id TEXT PRIMARY KEY
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS recordings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    user_name TEXT,
                    display_name TEXT,
                    guild_name TEXT,
                    channel_name TEXT,
                    filepath TEXT,
                    timestamp TEXT,
                    duration_seconds REAL,
                    total_packets INTEGER,
                    total_bytes INTEGER,
                    start_time TEXT,
                    end_time TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS osint_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    message_id TEXT UNIQUE,
                    user_id TEXT,
                    channel_id TEXT,
                    guild_id TEXT,
                    content TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS osint_avatars (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    avatar_url TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            try: c.execute("ALTER TABLE bot_state ADD COLUMN target_user_id TEXT")
            except: pass
            c.execute("INSERT OR IGNORE INTO bot_state (bot_id, bot_name, state) VALUES (?, ?, ?)", (self.token_index, "Initializing...", "Booting up"))
            c.execute("INSERT OR IGNORE INTO fleet_config (id, freeze_all, panic_disconnect) VALUES (1, 0, 0)")
            
            # Populate User Blacklist
            for uid in ["1467949308816003193", "785043280865525791", "1508795813973987400"]:
                c.execute("INSERT OR IGNORE INTO blacklisted_users (user_id) VALUES (?)", (uid,))
                
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"DB Init Error: {e}")

    def update_state(self, vc_name, state, log_msg, vc_members_json="[]"):
        try:
            conn = self.connect_db()
            c = conn.cursor()
            c.execute("""
                UPDATE bot_state 
                SET bot_name = ?, current_vc = ?, state = ?, log = ?, vc_members = ?, updated_at = datetime('now', 'localtime')
                WHERE bot_id = ?
            """, (str(self.user), vc_name, state, log_msg, vc_members_json, self.token_index))
            
            # Phase 2.2 Activity Logging
            c.execute("INSERT INTO activity_log (admin_username, action, target) VALUES (?, ?, ?)", 
                      ("SYSTEM_BOT", f"state_change: {state}", f"bot_{self.token_index}"))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Set Status Error: {e}")

    async def on_ready(self):
        logger.info(f"✨ [{self.user}] Bot #{self.token_index + 1} online")
        self.update_state("None", "Idle", "Connected to Discord")
        if not self.core_loop.is_running(): self.core_loop.start()
        if not self.presence_task.is_running(): self.presence_task.start()

    async def on_message(self, message):
        if message.author.bot or not message.content: return
        try:
            conn = self.connect_db()
            c = conn.cursor()
            c.execute("""
                INSERT OR IGNORE INTO osint_messages (message_id, user_id, channel_id, guild_id, content)
                VALUES (?, ?, ?, ?, ?)
            """, (str(message.id), str(message.author.id), str(message.channel.id), str(message.guild.id) if message.guild else "DM", message.content))
            
            if message.author.avatar:
                c.execute("""
                    INSERT INTO osint_avatars (user_id, avatar_url)
                    SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM osint_avatars WHERE user_id = ? AND avatar_url = ?)
                """, (str(message.author.id), str(message.author.avatar.url), str(message.author.id), str(message.author.avatar.url)))
                
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"OSINT Message Error: {e}")
            
    async def on_user_update(self, before, after):
        try:
            if before.avatar != after.avatar and after.avatar:
                conn = self.connect_db()
                c = conn.cursor()
                c.execute("""
                    INSERT INTO osint_avatars (user_id, avatar_url)
                    SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM osint_avatars WHERE user_id = ? AND avatar_url = ?)
                """, (str(after.id), str(after.avatar.url), str(after.id), str(after.avatar.url)))
                conn.commit()
                conn.close()
        except Exception as e:
            pass

    @tasks.loop(minutes=3)
    async def presence_task(self):
        try:
            conn = self.connect_db()
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT override_presence FROM bot_state WHERE bot_id = ?", (self.token_index,)).fetchone()
            conn.close()
            
            override = row['override_presence'] if row else None
            
            status = random.choice([discord.Status.online, discord.Status.idle, discord.Status.dnd])
            activity = None
            
            if override:
                if override == "Spotify":
                    song, artist = SPOTIFY_SONGS[self.activity_index % len(SPOTIFY_SONGS)]
                    activity = discord.Activity(type=discord.ActivityType.listening, name="Spotify", details=song, state=artist, application_id=232920227181363200)
                else:
                    game = next((g for g in GAMES if g["name"] == override), GAMES[0])
                    activity = discord.Activity(type=discord.ActivityType.playing, name=game["name"], details=game.get("details"), state=game.get("state"), application_id=int(game["id"]))
            else:
                choice = (self.activity_index * 17) % 100 # Pseudo-random deterministic choice
                if choice < 40:
                    song, artist = SPOTIFY_SONGS[self.activity_index % len(SPOTIFY_SONGS)]
                    activity = discord.Activity(type=discord.ActivityType.listening, name="Spotify", details=song, state=artist, application_id=232920227181363200)
                elif choice < 90:
                    game = GAMES[self.activity_index % len(GAMES)]
                    activity = discord.Activity(type=discord.ActivityType.playing, name=game["name"], details=game.get("details"), state=game.get("state"), application_id=int(game["id"]))
                else:
                    activity = discord.Activity(type=discord.ActivityType.watching, name="YouTube", details="Watching Tech Documentaries", state="1080p | 60fps")

            self.activity_index += 1
            await self.change_presence(activity=activity, status=status)
        except Exception as e:
            logger.error(f"Presence Error: {e}")

    async def disconnect_current(self):
        if self.current_channel:
            occupied_channels.discard(self.current_channel.id)
        if self.voice_clients:
            for vc in list(self.voice_clients):
                self.recorder.stop_recording(vc)
                await vc.disconnect(force=True)
        self.current_channel = None

    @tasks.loop(seconds=2)
    async def core_loop(self):
        try:
            guild = self.get_guild(self.target_guild_id)
            if not guild: return
            now = time.time()

            # Generate members preview
            members_data = []
            if self.current_channel:
                for m in self.current_channel.members:
                    if not m.bot:
                        avatar_url = str(m.avatar.url) if m.avatar else None
                        members_data.append({"name": m.name, "avatar": avatar_url})
            members_json = json.dumps(members_data)

            # DB Fetch
            conn = self.connect_db()
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            fleet = c.execute("SELECT * FROM fleet_config WHERE id = 1").fetchone()
            state_row = c.execute("SELECT * FROM bot_state WHERE bot_id = ?", (self.token_index,)).fetchone()
            blacklisted = set(r[0] for r in c.execute("SELECT channel_id FROM blacklisted_channels").fetchall())
            blacklisted_users = set(r[0] for r in c.execute("SELECT user_id FROM blacklisted_users").fetchall())
            
            if state_row and state_row['disabled']:
                await self.disconnect_current()
                self.update_state("None", "🛑 Disabled", "Bot is powered off.", members_json)
                return

            if state_row and state_row['force_kick']:
                await self.disconnect_current()
                c.execute("UPDATE bot_state SET force_kick = 0, target_channel_id = NULL, target_user_id = NULL WHERE bot_id = ?", (self.token_index,))
                conn.commit()
                conn.close()
                self.last_hop_time = 0
                self.update_state("None", "👢 Kicked", "Forced out of VC. Re-evaluating.", members_json)
                await asyncio.sleep(2)
                return

            target_id_str = state_row['target_channel_id'] if state_row else None
            target_user_id_str = state_row['target_user_id'] if state_row else None
            conn.close()

            # Fleet Actions
            if fleet and fleet['panic_disconnect']:
                await self.disconnect_current()
                self.update_state("None", "🚨 PANIC", "Disconnected by Fleet Command", members_json)
                return

            if fleet and fleet['freeze_all'] and not target_id_str and not target_user_id_str:
                self.update_state(self.current_channel.name if self.current_channel else "None", "🧊 FROZEN", "Fleet Frozen", members_json)
                return

            is_sniping = bool(target_id_str or target_user_id_str)

            # --- TARGET USER MODE ---
            if target_user_id_str:
                target_uid = int(target_user_id_str)
                member = guild.get_member(target_uid)
                if member and member.voice and member.voice.channel:
                    target_channel = member.voice.channel
                    if self.current_channel and self.current_channel.id == target_channel.id:
                        self.update_state(self.current_channel.name, "🎯 User Sniper", f"Stalking target {member.name}", members_json)
                        return
                    
                    # Respect occupancy even in sniper mode to avoid double-up
                    if target_channel.id in occupied_channels:
                        self.update_state("None", "🕵️ User Sniper", f"Target in {target_channel.name}, but another bot is already there.", members_json)
                        await self.disconnect_current()
                        return

                    self.update_state("Moving...", "🎯 User Sniper", f"Following {member.name} to {target_channel.name}", members_json)
                    await self.join_and_record(target_channel)
                    self.last_hop_time = time.time()
                    return
                else:
                    self.update_state("None", "🕵️ User Sniper", "Waiting for target to join VC...", members_json)
                    await self.disconnect_current()
                    return

            # --- TARGET CHANNEL MODE ---
            if target_id_str:
                target_id = int(target_id_str)
                if self.current_channel and self.current_channel.id == target_id:
                    self.update_state(self.current_channel.name, "🎯 Sniper Mode", "Recording target VC", members_json)
                    return 
                
                if target_id in occupied_channels:
                    self.update_state("None", "🎯 Sniper Mode", "Target channel occupied by another unit.", members_json)
                    await self.disconnect_current()
                    return

                target_channel = guild.get_channel(target_id)
                if target_channel:
                    self.update_state("Moving...", "🎯 Sniper Mode", f"Deploying to target: {target_channel.name}", members_json)
                    await self.join_and_record(target_channel)
                    self.last_hop_time = time.time()
                else:
                    self.update_state("None", "⚠️ Error", "Target channel not found", members_json)
                return

            # --- AUTO HOPPING MODE ---
            if self.current_channel:
                humans_in_current = len([m for m in self.current_channel.members if not m.bot])
                if str(self.current_channel.id) in blacklisted:
                    self.channel_cooldowns[self.current_channel.id] = now
                    await self.disconnect_current()
                elif any(str(m.id) in blacklisted_users for m in self.current_channel.members) and not is_sniping:
                    self.channel_cooldowns[self.current_channel.id] = now
                    await self.disconnect_current()
                    self.update_state("None", "🛡️ Evading", "Blacklisted user detected. Bailing out.", members_json)
                    return
                elif humans_in_current == 0:
                    self.channel_cooldowns[self.current_channel.id] = now
                    await self.disconnect_current()
                    self.update_state("None", "🏃 Bail-Out", "Channel empty, leaving instantly.", members_json)
                elif (now - self.last_hop_time) < self.current_stay_duration:
                    remaining = int(self.current_stay_duration - (now - self.last_hop_time))
                    self.update_state(self.current_channel.name, "🔄 Auto-Hopping", f"Recording. Next hop in {remaining}s", members_json)
                    return
                else:
                    self.channel_cooldowns[self.current_channel.id] = now

            vcs = [ch for ch in guild.voice_channels 
                  if ch.permissions_for(guild.me).connect 
                  and ch != guild.afk_channel
                  and "afk" not in ch.name.lower()
                  and str(ch.id) not in blacklisted
                  and not any(str(m.id) in blacklisted_users for m in ch.members)
                  and (ch.id not in occupied_channels or ch == self.current_channel)]
            
            # Apply 5-minute cooldown (300s)
            vcs = [ch for ch in vcs if (now - self.channel_cooldowns.get(ch.id, 0) > 300) or (ch == self.current_channel)]
            
            active_vcs = [ch for ch in vcs if len([m for m in ch.members if not m.bot]) > 0]
            
            # --- HYBRID SELECTION LOGIC (Phase 3.2 Update) ---
            # 70% chance to prioritize active channels (Crowd-Seeking)
            # 30% chance to pick any valid channel (Deep-Sweep / Coverage)
            selection_mode = random.random()
            
            if active_vcs and selection_mode < 0.7:
                # Crowd-Seeking: Prioritize channels with more humans
                options = [ch for ch in active_vcs if ch != self.current_channel]
                if not options: options = active_vcs # Stay if only one active
                
                weights = [len([m for m in ch.members if not m.bot]) for ch in options]
                target = random.choices(options, weights=weights, k=1)[0]
                
                humans = len([m for m in target.members if not m.bot])
                self.current_stay_duration = min(300, 45 + (humans * 25))
                log_msg = f"Crowd-Seeking: {target.name} ({humans} humans). Staying {self.current_stay_duration}s"
                state_label = "🚀 Crowd-Seeking"
            else:
                # Deep-Sweep: Pick from ALL valid channels to ensure total coverage
                options = [ch for ch in vcs if ch != self.current_channel]
                if not options: options = vcs
                
                target = random.choice(options)
                humans = len([m for m in target.members if not m.bot])
                
                # Shorter stay for empty channels to keep moving
                self.current_stay_duration = min(300, 60 + (humans * 30)) if humans > 0 else 45
                log_msg = f"Deep-Sweep: Covering {target.name}. Staying {self.current_stay_duration}s"
                state_label = "🔍 Deep-Sweep"

            self.update_state("Moving...", state_label, log_msg, members_json)
            await self.join_and_record(target)
            self.last_hop_time = time.time()

        except Exception as e:
            logger.error(f"❌ [{self.user}] Core loop error: {e}")
            await asyncio.sleep(5)

    async def join_and_record(self, channel):
        # Claim immediately to prevent race conditions
        occupied_channels.add(channel.id)
        
        await self.disconnect_current()
        await asyncio.sleep(random.uniform(1.0, 2.5))

        try:
            vc = await channel.connect(cls=voice_recv.VoiceRecvClient, timeout=30.0)
            self.current_channel = channel
            self.recorder.start_recording(vc, channel.guild.name, channel.name)
            logger.info(f"📡 [{self.user}] Joined: {channel.name}")
        except Exception as e:
            occupied_channels.discard(channel.id)
            logger.error(f"❌ [{self.user}] Join fail ({channel.name}): {e}")

async def main():
    db_path = Path(__file__).parent / "recordings" / "recordings.db"
    dotenv_path = Path(__file__).parent / ".env"
    
    try:
        conn = sqlite3.connect(db_path, timeout=30.0)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("DELETE FROM bot_state")
        conn.commit()
        conn.close()
    except: pass

    active_bots = {}
    bot_tasks = {}
    assigned_indices = {}
    next_index = 0

    async def start_bot_safe(b, t, idx):
        try:
            await b.start(t)
        except Exception as e:
            logger.error(f"❌ Bot #{idx + 1} failed to start: {e}")
            try:
                c = sqlite3.connect(db_path, timeout=30.0)
                c.execute("PRAGMA journal_mode=WAL")
                c.execute("UPDATE bot_state SET bot_name = ?, state = ?, current_vc = ?, log = ? WHERE bot_id = ?", 
                          ("Error", "Login Failed", "None", str(e), idx))
                c.commit()
                c.close()
            except: pass

    try:
        while True:
            load_dotenv(dotenv_path=dotenv_path, override=True)
            tokens_str = os.getenv("DISCORD_TOKENS", "")
            current_tokens = [t.strip() for t in tokens_str.split(",")] if tokens_str else []
            current_tokens = [t for t in current_tokens if t]

            for token in list(bot_tasks.keys()):
                if token not in current_tokens:
                    logger.info("🛑 Token removed from .env! Stopping bot...")
                    bot = active_bots[token]
                    idx = assigned_indices[token]
                    await bot.close()
                    bot_tasks[token].cancel()
                    del bot_tasks[token]
                    del active_bots[token]
                    try:
                        c = sqlite3.connect(db_path, timeout=30.0)
                        c.execute("DELETE FROM bot_state WHERE bot_id = ?", (idx,))
                        c.commit()
                        c.close()
                    except Exception as e:
                        logger.error(f"Failed to clear db for removed bot: {e}")

            for token in current_tokens:
                if token not in bot_tasks:
                    if token not in assigned_indices:
                        assigned_indices[token] = next_index
                        next_index += 1
                    
                    idx = assigned_indices[token]
                    logger.info(f"🆕 Starting bot #{idx + 1}...")
                    bot = VibeRecorderBot(token_index=idx)
                    task = asyncio.create_task(start_bot_safe(bot, token, idx))
                    bot_tasks[token] = task
                    active_bots[token] = bot
                    await asyncio.sleep(5)

            await asyncio.sleep(10)
    except (KeyboardInterrupt, SystemExit, asyncio.CancelledError):
        pass
    finally:
        logger.info("Graceful shutdown initiated...")
        for token, bot in active_bots.items():
            idx = assigned_indices[token]
            try:
                await bot.disconnect_current()
                await bot.close()
                c = sqlite3.connect(db_path, timeout=30.0)
                c.execute("UPDATE bot_state SET state = 'Offline', bot_name = 'Offline', current_vc = 'None' WHERE bot_id = ?", (idx,))
                c.commit()
                c.close()
            except Exception as e:
                logger.error(f"Error shutting down bot #{idx}: {e}")

if __name__ == "__main__":
    def handle_sig(sig, frame):
        logger.info(f"Received signal {sig}, terminating...")
        sys.exit(0)
    
    try:
        signal.signal(signal.SIGINT, handle_sig)
        signal.signal(signal.SIGTERM, handle_sig)
    except Exception:
        pass

    try: asyncio.run(main())
    except (KeyboardInterrupt, SystemExit): pass
