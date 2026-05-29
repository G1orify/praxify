import re

with open(r'C:\Users\Administrator\Desktop\vibe-frontend\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Update fonts
content = content.replace(
    '<link href="https://fonts.googleapis.com/css2?family=VT323&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">'
)

new_css = """
    :root {
      --bg: #09090b;
      --fg: #f8fafc;
      --primary: #3b82f6;
      --primary-hover: #60a5fa;
      --primary-glow: rgba(59, 130, 246, 0.5);
      --accent: #8b5cf6;
      --success: #10b981;
      --danger: #ef4444;
      --glass-bg: rgba(255, 255, 255, 0.03);
      --glass-border: rgba(255, 255, 255, 0.08);
      --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
      --font-main: 'Inter', sans-serif;
      --font-display: 'Outfit', sans-serif;
      --font-mono: 'Space Mono', monospace;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font-main);
      background-color: var(--bg);
      background-image: 
        radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.15), transparent 40%),
        radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.15), transparent 40%);
      background-attachment: fixed;
      color: var(--fg);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
    }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #555; }

    .container {
      width: 100%;
      max-width: 1000px;
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    header {
      text-align: center;
      margin-bottom: 40px;
    }

    h1 {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 4.5rem;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
      animation: float 6s ease-in-out infinite;
      filter: drop-shadow(0 0 20px var(--primary-glow));
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .tabs {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .tab-btn {
      background: var(--glass-bg);
      color: var(--fg);
      border: 1px solid var(--glass-border);
      border-radius: 30px;
      padding: 12px 30px;
      font-family: var(--font-main);
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.2);
    }

    .tab-btn.active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary-hover);
      box-shadow: 0 0 20px var(--primary-glow);
    }

    .view-content { display: none; }
    .view-content.active {
      display: block;
      animation: fadeIn 0.4s ease-out;
    }

    .search-block {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 40px;
      backdrop-filter: blur(12px);
      box-shadow: var(--glass-shadow);
      transition: transform 0.3s;
    }
    
    .search-block:hover {
      border-color: rgba(255,255,255,0.15);
    }

    .search-block h2 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      margin-bottom: 20px;
      font-weight: 700;
      color: #cbd5e1;
    }

    .user-form { display: flex; gap: 15px; flex-wrap: wrap; }

    input[type="text"], input[type="password"] {
      flex: 1;
      min-width: 250px;
      background: rgba(0,0,0,0.2);
      color: var(--fg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      padding: 14px 20px;
      font-family: var(--font-main);
      font-size: 1rem;
      outline: none;
      transition: all 0.2s;
    }

    input[type="text"]:focus, input[type="password"]:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      background: rgba(0,0,0,0.4);
    }

    button {
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 14px 28px;
      font-family: var(--font-main);
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    button:hover {
      background: var(--primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px var(--primary-glow);
    }

    button:active {
      transform: translateY(1px);
    }

    .tracks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 25px;
    }

    .track-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 25px;
      backdrop-filter: blur(12px);
      box-shadow: var(--glass-shadow);
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .track-card:hover {
      transform: translateY(-5px);
      border-color: rgba(255,255,255,0.2);
      box-shadow: 0 12px 40px rgba(0,0,0,0.4);
    }

    .track-title {
      font-family: var(--font-display);
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .track-meta {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      margin-bottom: 25px;
      color: #94a3b8;
    }

    .audio-player {
      background: rgba(0,0,0,0.2);
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .play-btn {
      width: 45px;
      height: 45px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }

    .progress-container {
      flex: 1;
      height: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      width: 0%;
      border-radius: 4px;
      transition: width 0.1s linear;
    }

    .time-display {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: #cbd5e1;
      min-width: 45px;
      text-align: right;
    }

    .track-actions {
      display: flex;
      gap: 12px;
      margin-top: auto;
    }

    .btn-action {
      flex: 1;
      background: rgba(255,255,255,0.05);
      color: var(--fg);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      padding: 10px;
      text-align: center;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-action:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.2);
    }

    .sniper-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 25px;
    }
    
    .sniper-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 25px;
      backdrop-filter: blur(12px);
      box-shadow: var(--glass-shadow);
      position: relative;
      transition: all 0.3s;
    }
    
    .sniper-card:hover {
      transform: translateY(-4px);
    }

    .bot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .bot-name {
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bot-status {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      padding: 6px 12px;
      border-radius: 20px;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--glass-border);
    }

    .snipe-log {
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
      padding: 15px;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      margin-bottom: 20px;
      min-height: 80px;
      border-left: 3px solid var(--primary);
      color: #94a3b8;
    }

    .snipe-input-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .snipe-input-group input {
      flex: 1;
      min-width: 150px;
    }
    
    .snipe-btn {
      padding: 10px 15px;
      font-size: 0.9rem;
      flex: 1;
    }
    
    .unsnipe-btn {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
      border: 1px solid var(--danger);
    }
    .unsnipe-btn:hover {
      background: var(--danger);
      color: #fff;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
    }

    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(8px);
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
      background: #111827;
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      width: 100%;
      max-width: 500px;
      padding: 35px;
      transform: scale(0.95) translateY(10px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-overlay.active .modal {
      transform: scale(1) translateY(0);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .modal-header h3 {
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 700;
    }

    .modal-close {
      background: transparent;
      color: #94a3b8;
      box-shadow: none;
      padding: 8px;
      border-radius: 50%;
    }
    .modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;
      background: var(--glass-bg);
      border-radius: 16px;
      border: 1px dashed var(--glass-border);
    }

    .empty-state i {
      font-size: 3.5rem;
      margin-bottom: 20px;
      opacity: 0.5;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .empty-state h3 {
      font-family: var(--font-display);
      font-size: 1.4rem;
      margin-bottom: 10px;
      color: #cbd5e1;
    }

    .spinner {
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #fff;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 1s linear infinite;
      display: none;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-card {
      text-align: center;
    }
    .auth-input-group {
      margin-bottom: 15px;
      position: relative;
    }
    .auth-input-group input {
      width: 100%;
      padding-left: 45px;
    }
    .auth-input-group i {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
    }
"""

content = re.sub(r'<style>.*?</style>', f'<style>{new_css}</style>', content, flags=re.DOTALL)

# Update Javascript for efficiency
# Replace setInterval with a smart recursive function
content = content.replace(
'''      if (tabId === 'sniper') {
        fetchBots();
        sniperInterval = setInterval(fetchBots, 2000);
      } else {
        if (sniperInterval) clearInterval(sniperInterval);
      }''',
'''      if (tabId === 'sniper') {
        sniperActive = true;
        loopBots();
      } else {
        sniperActive = false;
      }'''
)

# Replace the old sniperInterval declaration and loopBots function addition
content = content.replace('let sniperInterval = null;', '''let sniperActive = false;
    async function loopBots() {
      if (!sniperActive) return;
      await fetchBots();
      setTimeout(loopBots, 2000);
    }''')

# Fix logout issue with sniperInterval
content = content.replace('if (sniperInterval) clearInterval(sniperInterval);', 'sniperActive = false;')

# Update alert() with a custom toast function
toast_js = """
    function showToast(msg, type='info') {
      let toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.right = '20px';
      toast.style.padding = '15px 25px';
      toast.style.background = type === 'error' ? 'var(--danger)' : (type === 'success' ? 'var(--success)' : 'var(--primary)');
      toast.style.color = '#fff';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      toast.style.zIndex = '9999';
      toast.style.fontFamily = 'var(--font-main)';
      toast.style.fontWeight = '600';
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
      toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      toast.textContent = msg;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
      }, 10);
      
      setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
"""

content = content.replace('<script>', f'<script>{toast_js}')
content = content.replace('alert(', 'showToast(')

# Change border colors and HTML element styles slightly to fit the new design
content = content.replace('box-shadow: 6px 6px 0px ${statusColor};', 'box-shadow: 0 4px 20px ${statusColor}40;')
content = content.replace('border: 1px solid #333;', 'border: 1px solid var(--glass-border); border-radius: 12px;')

with open(r'C:\Users\Administrator\Desktop\vibe-frontend\index.html', 'w', encoding='utf-8') as f:
    f.write(content)
