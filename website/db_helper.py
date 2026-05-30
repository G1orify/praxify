import sqlite3
import sys
import json
import base64

db_path = sys.argv[1]
b64_payload = sys.argv[2]
payload = json.loads(base64.b64decode(b64_payload).decode('utf-8'))

action = payload.get('action')
query = payload.get('query')
params = payload.get('params', [])

conn = sqlite3.connect(db_path, timeout=30.0, isolation_level=None)
conn.execute('PRAGMA journal_mode=WAL')
conn.row_factory = sqlite3.Row
c = conn.cursor()

try:
    if action == "select":
        c.execute(query, params)
        rows = [dict(row) for row in c.fetchall()]
        print(json.dumps(rows))
    elif action == "update":
        c.execute(query, params)
        conn.commit()
finally:
    conn.close()
