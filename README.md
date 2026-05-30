# Vibe Recorder (Improved VC Self-Bot)

A streamlined, robust Discord self-bot for recording Voice Channels.

## Features
- **Multi-User Recording**: Records each user in the VC to a separate MP3 file.
- **Master Mix**: Automatically creates a merged master recording of the entire session.
- **Auto-Hopping**: Automatically moves between active voice channels to observe chatter.
- **Database Integration**: Keeps track of all recordings in an SQLite database.
- **Simple Control**: Control the bot via DM or in-server commands.

## Setup
1. Ensure you have `ffmpeg` installed on your system.
2. Install requirements: `pip install -r requirements.txt`
3. Configure `.env` with your token and target guild.
4. Run: `python main.py`

## Commands
- `v!status`: Show current recording status.
- `v!start`: Start hopping and recording.
- `v!stop`: Stop hopping and disconnect.

## File Structure
- `main.py`: The bot client and hopping logic.
- `recorder.py`: Audio handling and database updates.
- `recordings/`: Directory where all MP3s and the database are stored.
