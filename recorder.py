import os
import datetime
import logging
import asyncio
import subprocess
import sqlite3
from pathlib import Path
import discord
from discord.ext import voice_recv

# Optional import for DAVE decryption
try:
    import davey
except ImportError:
    davey = None

logger = logging.getLogger("VibeRecorder.Recorder")

class PerUserOpusToMP3Sink(voice_recv.AudioSink):
    """Sink that pipes raw PCM packets directly to FFmpeg for MP3 conversion."""
    
    def __init__(self, filepath: Path):
        super().__init__()
        self.filepath = filepath
        self._process = None
        self._stdin = None
        self._ffmpeg_available = self._check_ffmpeg()
        if self._ffmpeg_available:
            self._start_ffmpeg()
        else:
            logger.error("FFmpeg not found! Install FFmpeg and add to PATH, or set FFMPEG_PATH environment variable")
    
    def _check_ffmpeg(self):
        """Check if FFmpeg is available."""
        ffmpeg_path = os.getenv("FFMPEG_PATH", "ffmpeg")
        try:
            result = subprocess.run(
                [ffmpeg_path, '-version'],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            return result.returncode == 0
        except (FileNotFoundError, subprocess.SubprocessError):
            return False
    
    def _get_ffmpeg_path(self):
        """Get FFmpeg executable path."""
        custom_path = os.getenv("FFMPEG_PATH")
        if custom_path and os.path.exists(custom_path):
            return custom_path
        return "ffmpeg"
    
    def _start_ffmpeg(self):
        """Start FFmpeg process that reads raw PCM from stdin and outputs MP3."""
        if not self._ffmpeg_available:
            logger.error("Cannot start FFmpeg - executable not found")
            return
        
        audio_bitrate = os.getenv("AUDIO_BITRATE", "192") + "k"
        ffmpeg_cmd = self._get_ffmpeg_path()
        args = [
            ffmpeg_cmd,
            '-hide_banner',
            '-loglevel', 'error',
            '-f', 's16le',
            '-ar', '48000',
            '-ac', '2',
            '-i', 'pipe:0',
            '-af', 'alimiter=limit=-1.5dB:attack=1:release=50,acompressor=threshold=-15dB:ratio=4:attack=5:release=50,silencedetect=noise=-50dB:d=2',
            '-c:a', 'libmp3lame',
            '-b:a', audio_bitrate,
            '-y',
            str(self.filepath)
        ]
        
        try:
            self._process = subprocess.Popen(
                args,
                stdin=subprocess.PIPE,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            self._stdin = self._process.stdin
        except FileNotFoundError as e:
            logger.error(f"FFmpeg not found at {ffmpeg_cmd}: {e}")
            self._ffmpeg_available = False
        except Exception as e:
            logger.error(f"Failed to start FFmpeg: {e}")
            self._ffmpeg_available = False
    
    def wants_opus(self) -> bool:
        return False
    
    def write(self, user, data):
        """Write PCM data to FFmpeg."""
        if not self._ffmpeg_available or not self._stdin or self._stdin.closed:
            logger.debug("FFmpeg not available, skipping audio write")
            return
        
        try:
            pcm = getattr(data, 'pcm', data) if not isinstance(data, (bytes, bytearray)) else data
            if pcm:
                self._stdin.write(pcm)
                self._stdin.flush()
        except Exception as e:
            logger.error(f"Error writing PCM data: {e}")
    
    def cleanup(self):
        """Close FFmpeg process without blocking the event loop."""
        try:
            if self._stdin:
                self._stdin.close()
        except Exception:
            pass
        
        if self._process:
            import threading
            def wait_and_kill(proc):
                try:
                    proc.wait(timeout=5)
                except Exception:
                    proc.kill()
            threading.Thread(target=wait_and_kill, args=(self._process,), daemon=True).start()
        
        if not self._ffmpeg_available:
            logger.warning("FFmpeg was not available - no process to cleanup")

class MultiUserSink(voice_recv.AudioSink):
    def __init__(self, base_dir: Path, guild_name: str, channel_name: str, db_path: Path):
        super().__init__()
        self.base_dir = base_dir
        self.guild_name = guild_name
        self.channel_name = channel_name
        self.db_path = db_path
        
        self.user_sinks = {} # user_id -> PerUserOpusToMP3Sink
        self.user_data = {}  # user_id -> metadata
        self.decoders = {}   # user_id -> OpusDecoder
        self._voice_client = None
        self.session_start = datetime.datetime.now()
        
        logger.info(f"✨ Session: {channel_name}")

    def wants_opus(self) -> bool:
        return True

    def _finalize_user(self, user_id):
        sink = self.user_sinks.pop(user_id, None)
        if sink:
            sink.cleanup()
            self._save_to_database(user_id)
            logger.info(f"✅ Saved Segment: {self.user_data[user_id]['user_name']}")
            if user_id in self.user_data:
                self.user_data[user_id]["packets"] = 0
                self.user_data[user_id]["bytes"] = 0
                self.user_data[user_id]["warmup"] = 5

    def write(self, user, data):
        if user is None: return

        user_id = user.id
        now = datetime.datetime.now()

        if user_id in self.user_sinks:
            data_meta = self.user_data[user_id]
            last_spoke = data_meta["last_spoke"]
            first_spoke = data_meta["start_time"]
            
            silence_threshold = float(os.getenv("SILENCE_THRESHOLD", 5))
            max_segment_duration = float(os.getenv("MAX_SEGMENT_DURATION", 60))
            
            if (now - last_spoke).total_seconds() > silence_threshold or (now - first_spoke).total_seconds() > max_segment_duration:
                self._finalize_user(user_id)

        if user_id not in self.user_sinks:
            user_dir = self.base_dir / str(user_id)
            user_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp_str = now.strftime("%Y%m%d_%H%M%S")
            safe_channel = "".join(x for x in self.channel_name if x.isalnum() or x in "._- ")
            filename = f"{timestamp_str}_{safe_channel}.mp3"
            filepath = user_dir / filename
            
            logger.info(f"🎙️  {user.name} ({user_id})")
            sink = PerUserOpusToMP3Sink(filepath)
            self.user_sinks[user_id] = sink
            
            if user_id not in self.user_data:
                self.user_data[user_id] = {
                    "user_name": user.name,
                    "display_name": getattr(user, 'display_name', user.name),
                    "errors": 0,
                    "warmup": 10
                }
            
            self.user_data[user_id].update({
                "filepath": str(filepath),
                "start_time": now,
                "last_spoke": now,
                "packets": 0,
                "bytes": 0
            })

        opus_data = getattr(data, 'opus', None)
        pcm_data = getattr(data, 'pcm', None)
        user_info = self.user_data[user_id]

        if opus_data and not pcm_data:
            if user_info["warmup"] > 0:
                user_info["warmup"] -= 1
                return

            if davey and self._voice_client:
                vc = self._voice_client
                dave = getattr(vc._connection, 'dave_session', None)
                if dave and dave.ready:
                    try:
                        opus_data = dave.decrypt(user_id, davey.MediaType.audio, opus_data)
                    except Exception as e:
                        if "Unencrypted" not in str(e): return
            
            if user_id not in self.decoders:
                try: self.decoders[user_id] = discord.opus.Decoder()
                except: return
            
            try: pcm_data = self.decoders[user_id].decode(opus_data, fec=False)
            except: return

        if pcm_data:
            sink = self.user_sinks[user_id]
            sink.write(user, pcm_data)
            user_info["packets"] += 1
            user_info["bytes"] += len(pcm_data)
            user_info["last_spoke"] = now

    def cleanup(self):
        uids = list(self.user_sinks.keys())
        for uid in uids: self._finalize_user(uid)
        self.decoders.clear()

    def _save_to_database(self, user_id):
        data = self.user_data.get(user_id)
        if not data or data.get("packets", 0) < 10: return

        filepath = Path(data["filepath"])
        if filepath.exists() and filepath.stat().st_size < 10240:
            # Phase 3.4 Fix: Use a background thread for deletion to avoid blocking and WinError 32
            def delayed_delete(p):
                import time
                for _ in range(20): # Try for 10 seconds
                    try:
                        p.unlink(missing_ok=True)
                        logger.info(f"🗑️ Deleted silent/small segment: {p.name}")
                        return
                    except PermissionError:
                        time.sleep(0.5)
                logger.warning(f"⚠️ Could not delete locked segment: {p.name}")
            
            import threading
            threading.Thread(target=delayed_delete, args=(filepath,), daemon=True).start()
            return

        end_time = datetime.datetime.now()
        duration = (end_time - data["start_time"]).total_seconds()
        
        try:
            conn = sqlite3.connect(self.db_path, timeout=30.0)
            conn.execute("PRAGMA journal_mode=WAL")
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO recordings (
                    user_id, user_name, display_name, guild_name, channel_name, 
                    filepath, timestamp, duration_seconds, total_packets, total_bytes,
                    start_time, end_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id,
                data["user_name"],
                data["display_name"],
                self.guild_name,
                self.channel_name,
                data["filepath"],
                data["start_time"].isoformat(),
                duration,
                data["packets"],
                data["bytes"],
                data["start_time"].strftime("%H:%M:%S"),
                end_time.strftime("%H:%M:%S")
            ))
            
            # Phase 2.2 Activity Logging
            cursor.execute("INSERT INTO activity_log (admin_username, action, target) VALUES (?, ?, ?)", 
                           ("SYSTEM_REC", f"recording_saved: {data['user_name']}", f"user_{user_id}"))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"❌ DB Error: {e}")

class AudioRecorder:
    def __init__(self, output_dir: Path, db_path: Path):
        self.output_dir = output_dir
        self.db_path = db_path
        self.active_sink = None

    def start_recording(self, vc, guild_name, channel_name):
        self.active_sink = MultiUserSink(self.output_dir, guild_name, channel_name, self.db_path)
        self.active_sink._voice_client = vc
        vc.listen(self.active_sink)
        return self.active_sink

    def stop_recording(self, vc):
        if vc and vc.is_listening():
            vc.stop_listening()
            if self.active_sink:
                self.active_sink.cleanup()
            self.active_sink = None
