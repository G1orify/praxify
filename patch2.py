import re

with open(r'C:\Users\Administrator\Desktop\vibe-frontend\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_css = """
    :root {
      --bg: #000000;
      --fg: #ffffff;
      --primary: #ffffff;
      --primary-hover: #e5e5e5;
      --primary-glow: rgba(255, 255, 255, 0.3);
      --accent: #888888;
      --success: #a3a3a3;
      --danger: #525252;
      --glass-bg: rgba(25, 25, 25, 0.6);
      --glass-border: rgba(255, 255, 255, 0.15);
      --glass-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.8);
      --font-main: 'Inter', sans-serif;
      --font-display: 'Outfit', sans-serif;
      --font-mono: 'Space Mono', monospace;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font-main);
      background-color: var(--bg);
      background-image: 
        radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.05), transparent 40%),
        radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.03), transparent 40%);
      background-attachment: fixed;
      color: var(--fg);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      letter-spacing: -0.02em;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #666; }

    .container {
      width: 100%;
      max-width: 1100px;
      animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }

    header {
      text-align: center;
      margin-bottom: 50px;
    }

    h1 {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 5rem;
      letter-spacing: -2px;
      color: #fff;
      text-transform: uppercase;
      margin-bottom: 10px;
      animation: float 8s ease-in-out infinite;
      text-shadow: 0 0 40px rgba(255,255,255,0.2);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .tabs {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 50px;
      flex-wrap: wrap;
    }

    .tab-btn {
      background: rgba(255, 255, 255, 0.03);
      color: #a3a3a3;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px 24px;
      font-family: var(--font-main);
      font-weight: 500;
      font-size: 0.95rem;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      transform: translateY(-1px);
    }

    .tab-btn.active {
      background: #ffffff;
      color: #000000;
      border-color: #ffffff;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
      font-weight: 700;
    }

    .view-content { display: none; }
    .view-content.active {
      display: block;
      animation: fadeIn 0.5s ease-out;
    }

    .search-block {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      padding: 35px;
      margin-bottom: 40px;
      backdrop-filter: blur(20px);
      box-shadow: var(--glass-shadow);
      transition: transform 0.3s, border-color 0.3s;
    }
    
    .search-block:hover {
      border-color: rgba(255,255,255,0.25);
    }

    .search-block h2 {
      font-family: var(--font-display);
      font-size: 1.2rem;
      margin-bottom: 25px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 10px;
      display: inline-block;
    }

    .user-form { display: flex; gap: 15px; flex-wrap: wrap; }

    input[type="text"], input[type="password"] {
      flex: 1;
      min-width: 250px;
      background: rgba(0,0,0,0.5);
      color: var(--fg);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 6px;
      padding: 14px 20px;
      font-family: var(--font-mono);
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
    }

    input[type="text"]:focus, input[type="password"]:focus {
      border-color: #fff;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
      background: rgba(0,0,0,0.8);
    }

    input::placeholder { color: #555; }

    button {
      background: #ffffff;
      color: #000000;
      border: none;
      border-radius: 6px;
      padding: 14px 30px;
      font-family: var(--font-main);
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    button:hover {
      background: #e5e5e5;
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(255,255,255,0.2);
    }

    button:active {
      transform: translateY(1px);
      box-shadow: none;
    }

    .tracks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .track-card {
      background: rgba(20,20,20,0.8);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 25px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .track-card:hover {
      transform: translateY(-3px);
      border-color: rgba(255,255,255,0.3);
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    }

    .track-title {
      font-family: var(--font-display);
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #fff;
    }

    .track-meta {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      margin-bottom: 25px;
      color: #666;
      text-transform: uppercase;
    }

    .audio-player {
      background: #000;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 8px;
      padding: 10px 15px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .play-btn {
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #fff;
      color: #000;
    }

    .play-btn:hover { background: #e5e5e5; }

    .progress-container {
      flex: 1;
      height: 4px;
      background: #333;
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: #fff;
      width: 0%;
      border-radius: 2px;
      transition: width 0.1s linear;
    }

    .time-display {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: #888;
      min-width: 40px;
      text-align: right;
    }

    .track-actions {
      display: flex;
      gap: 10px;
      margin-top: auto;
    }

    .btn-action {
      flex: 1;
      background: transparent;
      color: #ccc;
      border: 1px solid #444;
      border-radius: 6px;
      padding: 8px;
      text-align: center;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.8rem;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-action:hover {
      background: #fff;
      color: #000;
      border-color: #fff;
    }

    .sniper-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .sniper-card {
      background: rgba(15,15,15,0.9);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 25px;
      backdrop-filter: blur(15px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
      position: relative;
      transition: all 0.3s;
    }
    
    .sniper-card:hover {
      border-color: rgba(255,255,255,0.3);
    }

    .bot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .bot-name {
      font-family: var(--font-display);
      font-size: 1.3rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #fff;
    }

    .bot-status {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 4px;
      background: #222;
      border: 1px solid #444;
      color: #ccc;
      text-transform: uppercase;
    }

    .snipe-log {
      background: #0a0a0a;
      border-radius: 6px;
      padding: 15px;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      margin-bottom: 20px;
      min-height: 80px;
      border-left: 2px solid #fff;
      color: #999;
    }

    .snipe-input-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .snipe-input-group input {
      flex: 1;
      min-width: 150px;
      padding: 10px 15px;
      font-size: 0.85rem;
      border-radius: 4px;
    }
    
    .snipe-btn {
      padding: 10px 15px;
      font-size: 0.85rem;
      flex: 1;
      border-radius: 4px;
    }
    
    .unsnipe-btn {
      background: transparent;
      color: #888;
      border: 1px solid #555;
      border-radius: 4px;
    }
    .unsnipe-btn:hover {
      background: #333;
      color: #fff;
      border-color: #777;
    }

    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.9);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .modal-overlay.active {
      opacity: 1;
      pointer-events: all;
    }

    .modal {
      background: #0a0a0a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 1);
      width: 100%;
      max-width: 450px;
      padding: 40px;
      transform: scale(0.98) translateY(10px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-overlay.active .modal {
      transform: scale(1) translateY(0);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .modal-header h3 {
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .modal-close {
      background: transparent;
      color: #666;
      box-shadow: none;
      padding: 5px;
      border-radius: 4px;
    }
    .modal-close:hover { background: #222; color: #fff; }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #555;
      background: rgba(10,10,10,0.5);
      border-radius: 12px;
      border: 1px dashed rgba(255,255,255,0.1);
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 25px;
      color: #fff;
      opacity: 0.2;
    }

    .empty-state h3 {
      font-family: var(--font-display);
      font-size: 1.2rem;
      margin-bottom: 10px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .spinner {
      border: 2px solid rgba(255,255,255,0.1);
      border-top-color: #fff;
      border-radius: 50%;
      width: 14px;
      height: 14px;
      animation: spin 0.8s linear infinite;
      display: none;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-card {
      text-align: center;
    }
    .auth-input-group {
      margin-bottom: 20px;
      position: relative;
    }
    .auth-input-group input {
      width: 100%;
      padding-left: 45px;
      background: #111;
    }
    .auth-input-group input:focus {
      background: #000;
    }
    .auth-input-group i {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: #555;
    }
"""

content = re.sub(r'<style>.*?</style>', f'<style>\n{new_css}\n</style>', content, flags=re.DOTALL)

with open(r'C:\Users\Administrator\Desktop\vibe-frontend\index.html', 'w', encoding='utf-8') as f:
    f.write(content)
