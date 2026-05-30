import os
import shutil
import sqlite3
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger("Migration")

def migrate_data():
    db_path = "/home/scooby/vibe-recorder/recordings/recordings.db"
    new_base_dir = Path("/home/scooby/vibe-recorder/recordings")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, user_id, filepath FROM recordings WHERE filepath LIKE '%praxis-agent%'")
    rows = cursor.fetchall()
    
    moved_count = 0
    missing_count = 0
    
    for row_id, user_id, old_filepath in rows:
        old_path = Path(old_filepath.replace('\n', '').strip())
        
        if old_path.exists():
            # Create new user-centric directory
            new_user_dir = new_base_dir / str(user_id)
            new_user_dir.mkdir(parents=True, exist_ok=True)
            
            # Keep the same filename
            filename = old_path.name
            new_filepath = new_user_dir / filename
            
            # Move the file
            shutil.move(str(old_path), str(new_filepath))
            
            # Update the database
            cursor.execute("UPDATE recordings SET filepath = ? WHERE id = ?", (str(new_filepath), row_id))
            moved_count += 1
        else:
            missing_count += 1
            
    conn.commit()
    conn.close()
    logger.info(f"✅ Migrated {moved_count} recordings to new format.")
    if missing_count > 0:
        logger.info(f"⚠️ {missing_count} files were listed in DB but missing from disk.")

if __name__ == "__main__":
    migrate_data()
