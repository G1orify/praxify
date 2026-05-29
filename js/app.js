function showToast(msg, type='info') {
      let icon = type === 'error' ? '<i class="fas fa-times-circle"></i>' : (type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-info-circle"></i>');
      let toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.right = '20px';
      toast.style.padding = '15px 25px';
      toast.style.background = '#111';
      toast.style.color = '#fff';
      toast.style.borderLeft = `4px solid ${type === 'error' ? '#ff3333' : (type === 'success' ? '#00ff00' : '#fff')}`;
      toast.style.borderRadius = '4px';
      toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
      toast.style.zIndex = '9999';
      toast.style.fontFamily = 'var(--font-mono)';
      toast.style.fontSize = '0.9rem';
      toast.style.display = 'flex';
      toast.style.alignItems = 'center';
      toast.style.gap = '10px';
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
      toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      toast.innerHTML = `${icon} <span>${escapeHTML(msg)}</span>`;
      
      // Auto stacking logic
      const existingToasts = document.querySelectorAll('.toast-msg');
      existingToasts.forEach((t, i) => {
        t.style.bottom = `${(existingToasts.length - i) * 70 + 20}px`;
      });
      toast.className = 'toast-msg';

      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
      }, 10);
      
      setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    function escapeHTML(str) {
      if (str === null || str === undefined) return '';
      return String(str).replace(/[&<>"']/g, function(m) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[m];
      });
    }

    // Add interceptor to fetch calls
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = args[0];
      const token = localStorage.getItem('auth_token');
      if(token && typeof url === 'string' && url.startsWith('/api/')) {
        args[1] = args[1] || {};
        args[1].headers = args[1].headers || {};
        args[1].headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await originalFetch.apply(this, args);
      if(response.status === 401 || response.status === 403) {
        if(url.startsWith('/api/') && !url.includes('/api/auth/')) {
          localStorage.removeItem('auth_token');
          document.getElementById('auth-overlay').classList.add('active');
          loadCaptcha();
        }
      }
      return response;
    };

    function parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) { return null; }
    }

    function checkAdminRole() {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const payload = parseJwt(token);
        const isAdmin = payload && payload.role === 'admin';
        document.getElementById('adminTabBtn').style.display = isAdmin ? 'inline-block' : 'none';
        document.getElementById('sniperTabBtn').style.display = isAdmin ? 'inline-block' : 'none';
      }
    }

    let authMode = 'login';
    let currentCaptchaToken = '';

    function switchAuthTab(mode) {
      authMode = mode;
      document.getElementById('tab-login').classList.remove('active');
      document.getElementById('tab-signup').classList.remove('active');
      document.getElementById(`tab-${mode}`).classList.add('active');
      document.getElementById('authTitle').textContent = `CIPHER_OS // ${mode.toUpperCase()}`;
      document.getElementById('authSubmitBtn').textContent = mode === 'login' ? '[ AUTHENTICATE ]' : '[ REGISTER ]';
      loadCaptcha();
    }

    async function loadCaptcha() {
      try {
        const res = await originalFetch('/api/auth/captcha');
        const data = await res.json();
        if(data.success) {
          document.getElementById('captchaImageContainer').innerHTML = data.svg;
          currentCaptchaToken = data.captchaToken;
        }
      } catch(e) {}
    }

    async function submitAuth(e) {
      e.preventDefault();
      const username = document.getElementById('authUsername').value;
      const password = document.getElementById('authPassword').value;
      const captchaAnswer = document.getElementById('authCaptcha').value;
      
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      
      try {
        const res = await originalFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, captchaToken: currentCaptchaToken, captchaAnswer })
        });
        const data = await res.json();
        if(res.ok && data.success) {
          localStorage.setItem('auth_token', data.token);
          document.getElementById('auth-overlay').classList.remove('active');
          checkAdminRole();
        } else {
          showToast(`AUTH_ERR: ${data.error}`);
          loadCaptcha();
        }
      } catch(e) {
        showToast("NETWORK_ERR");
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      const token = localStorage.getItem('auth_token');
      if(token) {
        document.getElementById('auth-overlay').classList.remove('active');
        checkAdminRole();
      } else {
        loadCaptcha();
      }
    });

    function logoutUser() {
      localStorage.removeItem('auth_token');
      document.getElementById('auth-overlay').classList.add('active');
      document.getElementById('adminTabBtn').style.display = 'none';
      document.getElementById('sniperTabBtn').style.display = 'none';
      switchTab('dashboard', document.querySelector('.tab-btn[onclick*="switchTab(\'dashboard\'"]'));
      loadCaptcha();
      sniperActive = false;
    }

    async function addBotToken(e, inputId = 'newBotToken', btnId = 'addTokenBtn') {
      e.preventDefault();
      const tokenInput = document.getElementById(inputId).value;
      const btn = document.getElementById(btnId);
      const btnText = btn.querySelector('.btn-text');
      const spinner = btn.querySelector('.spinner');
      
      btn.classList.add('loading');
      if (btnText) btnText.textContent = "[ INJECTING ]";
      if (spinner) spinner.style.display = 'inline-block';
      
      try {
        const res = await fetch('/api/admin/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenInput })
        });
        const data = await res.json();
        if (data.success) {
          showToast("SUCCESS: " + data.message);
          document.getElementById(inputId).value = '';
          loadAdminTokens();
        } else {
          showToast("ERROR: " + data.error);
        }
      } catch (err) {
        showToast("NETWORK ERROR: " + err);
      } finally {
        btn.classList.remove('loading');
        if (btnText) btnText.textContent = "[ INJECT ]";
        if (spinner) spinner.style.display = 'none';
      }
    }

    async function loadAdminTokens() {
      const container = document.getElementById('tokensListContainer');
      if (!container) return;
      container.innerHTML = '<div style="color: #aaa;">Loading tokens...</div>';
      
      try {
        const res = await fetch('/api/admin/tokens');
        const data = await res.json();
        if (data.success && data.tokens) {
          if (data.tokens.length === 0) {
            container.innerHTML = '<div style="color: #ff3333;">NO TOKENS CONFIGURED</div>';
            return;
          }
          
          let html = '';
          data.tokens.forEach((token, index) => {
            const maskedToken = token.length > 20 
              ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` 
              : token;
              
            html += `
              <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--glass-border); border-radius: 12px; padding: 10px 15px; background: rgba(255,255,255,0.02);">
                <div style="font-family: 'Space Mono', monospace; font-size: 0.9rem; color: #fff;">
                  <strong>[#${index + 1}]</strong> ${escapeHTML(maskedToken)}
                </div>
                <button type="button" onclick="removeBotToken(${index})" style="padding: 5px 15px; font-size: 0.8rem; border-color: #ff3333; color: #ff3333; box-shadow: 2px 2px 0px #ff3333; height: auto;">
                  [ REMOVE ]
                </button>
              </div>
            `;
          });
          container.innerHTML = html;
        } else {
          container.innerHTML = `<div style="color: #ff3333;">ERROR: ${data.error || 'Failed to load tokens'}</div>`;
        }
      } catch (err) {
        container.innerHTML = '<div style="color: #ff3333;">NETWORK ERROR</div>';
      }
    }

    async function removeBotToken(index) {
      if (!confirm(`ARE YOU SURE YOU WANT TO REMOVE BOT TOKEN #${index + 1}?`)) {
        return;
      }
      
      try {
        const res = await fetch('/api/admin/token/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index })
        });
        const data = await res.json();
        if (data.success) {
          showToast("SUCCESS: " + data.message);
          loadAdminTokens();
        } else {
          showToast("ERROR: " + data.error);
        }
      } catch (err) {
        showToast("NETWORK ERROR: " + err);
      }
    }

    // Tab Switching
    let sniperActive = false;
    async function loopBots() {
      if (!sniperActive) return;
      await fetchBots();
      setTimeout(loopBots, 2000);
    }

    function switchTab(tabId, el) {
      document.querySelectorAll('.view-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      
      document.getElementById(`${tabId}-view`).classList.add('active');
      if(el) el.classList.add('active');

      if (tabId === 'sniper') {
        sniperActive = true;
        loopBots();
      } else {
        sniperActive = false;
      }

      if (tabId === 'admin') {
        loadAdminTokens();
      }
    }

    // Sniper Logic
    async function fetchBots() {
      try {
        const res = await fetch('/api/bots');
        const bots = await res.json();
        
        const grid = document.getElementById('sniper-grid');
        
        if (bots.error) {
          grid.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-exclamation-triangle" style="color: #ff3333;"></i>
              <h3>API BLOCKED</h3>
              <p>${bots.error}</p>
            </div>`;
          return;
        }

        if (!bots || !Array.isArray(bots) || bots.length === 0) {
          grid.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-satellite-dish"></i>
              <h3>NO BOTS ONLINE</h3>
            </div>`;
          return;
        }

        let html = '';
        bots.forEach(bot => {
          const isSniper = !!bot.target_channel_id || !!bot.target_user_id;
          const statusColor = bot.target_user_id ? '#00ff00' : (isSniper ? '#ff3333' : '#fff');
          
          html += `
            <div class="sniper-card" style="border-color: ${statusColor}; box-shadow: 0 4px 20px ${statusColor}40;">
              <div class="bot-header" style="border-color: ${statusColor}">
                <div class="bot-name">
                  <i class="fas ${isSniper ? 'fa-crosshairs' : 'fa-robot'}" style="color: ${statusColor}"></i> 
                  ${escapeHTML(bot.bot_name || 'Unit-' + bot.bot_id)}
                </div>
                <div class="bot-status" style="color: ${statusColor}; border-color: ${statusColor}">
                  ${escapeHTML(bot.state)}
                </div>
              </div>
              
              <div class="snipe-log">
                <div style="margin-bottom: 5px;"><strong>> CURRENT LOCATION:</strong> ${escapeHTML(bot.current_vc || 'Unknown')}</div>
                <div><strong>> STATUS LOG:</strong> ${escapeHTML(bot.log || 'Awaiting orders...')}</div>
                ${bot.target_channel_id ? `<div style="margin-top: 5px; color: #ff3333;"><strong>> CH TARGET LOCKED:</strong> ${escapeHTML(bot.target_channel_id)}</div>` : ''}
                ${bot.target_user_id ? `<div style="margin-top: 5px; color: #00ff00;"><strong>> USR TARGET LOCKED:</strong> ${escapeHTML(bot.target_user_id)}</div>` : ''}
              </div>

              <div class="snipe-input-group">
                <input type="text" id="snipe-input-${bot.bot_id}" placeholder="ENTER TARGET ID..." value="${bot.target_channel_id || bot.target_user_id || ''}">
                <button class="snipe-btn" onclick="sendSnipe(${bot.bot_id})">[ SNIPE CH ]</button>
                <button class="snipe-btn" onclick="sendUserSnipe(${bot.bot_id})" style="border-color: #00ff00; color: #00ff00; min-width: 100px;">[ SNIPE USR ]</button>
                ${isSniper ? `<button class="unsnipe-btn" onclick="cancelSnipe(${bot.bot_id})">[ STOP ]</button>` : ''}
              </div>
            </div>
          `;
        });
        
        // Only update if focused to prevent input wiping
        if (document.activeElement.tagName !== "INPUT") {
          grid.innerHTML = html;
        }

      } catch (e) {
        console.error("Failed to fetch bots", e);
      }
    }

    async function sendSnipe(botId) {
      const input = document.getElementById(`snipe-input-${botId}`);
      const targetChannel = input.value.trim();
      if (!targetChannel) return;

      await fetch('/api/snipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, targetChannel })
      });
      fetchBots();
    }

    async function sendUserSnipe(botId) {
      const input = document.getElementById(`snipe-input-${botId}`);
      const targetUser = input.value.trim();
      if (!targetUser) return;

      await fetch('/api/snipe_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, targetUser })
      });
      fetchBots();
    }

    async function cancelSnipe(botId) {
      await fetch('/api/unsnipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId })
      });
      fetchBots();
    }



    // Media Logic
    let currentTrackFile = '';
    let currentAudioPlaying = null;

    function togglePlay(id) {
      const audio = document.getElementById(`audio-${id}`);
      const icon = document.getElementById(`icon-${id}`);

      if (currentAudioPlaying && currentAudioPlaying !== audio) {
        currentAudioPlaying.pause();
        const oldId = currentAudioPlaying.id.replace('audio-', '');
        document.getElementById(`icon-${oldId}`).className = 'fas fa-play';
      }

      if (audio.paused) {
        audio.play();
        icon.className = 'fas fa-pause';
        currentAudioPlaying = audio;
      } else {
        audio.pause();
        icon.className = 'fas fa-play';
        currentAudioPlaying = null;
      }
    }

    function updateProgress(id) {
      const audio = document.getElementById(`audio-${id}`);
      const progress = document.getElementById(`progress-${id}`);
      const timeDisplay = document.getElementById(`time-${id}`);
      
      if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${percent}%`;
        
        const currentMins = Math.floor(audio.currentTime / 60);
        const currentSecs = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${currentMins}:${currentSecs}`;
      }
    }

    function seekAudio(e, id) {
      const audio = document.getElementById(`audio-${id}`);
      const container = e.currentTarget;
      const rect = container.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      if (audio.duration) {
        audio.currentTime = percent * audio.duration;
      }
    }

    function resetPlayer(id) {
      const icon = document.getElementById(`icon-${id}`);
      icon.className = 'fas fa-play';
      if(currentAudioPlaying === document.getElementById(`audio-${id}`)) {
        currentAudioPlaying = null;
      }
    }


  
    async function searchUser(e) {
      e.preventDefault();
      const userId = document.querySelector('input[name="userId"]').value.trim();
      if (!userId) return;
      
      const container = document.getElementById('dashboard-content');
      container.innerHTML = '<div class="empty-state"><i class="fas fa-sync fa-spin"></i><h3>SEARCHING...</h3></div>';
      
      try {
        const [tracksRes, osintRes] = await Promise.all([
          fetch('/api/tracks/' + userId),
          fetch('/api/osint/' + userId).catch(() => null)
        ]);
        
        const data = await tracksRes.json();
        const osintData = osintRes && osintRes.ok ? await osintRes.json().catch(() => null) : null;
        
        let html = '';

        if (osintData && osintData.success && (osintData.names.length > 0 || osintData.guilds.length > 0)) {
          html += `
          <div style="background: rgba(20,20,20,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
              <div style="width: 80px; height: 80px; border-radius: 50%; background: #222; border: 2px solid #555; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                ${osintData.avatars && osintData.avatars.length > 0 ? `<img src="${osintData.avatars[0]}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fas fa-user" style="font-size: 2rem; color: #555;"></i>'}
              </div>
              <div>
                <h3 style="font-family: var(--font-display); font-size: 1.8rem; color: #fff; margin-bottom: 5px; font-weight: 700; letter-spacing: 1px;">${escapeHTML(osintData.names[0] || 'Unknown Target')}</h3>
                <div style="font-family: var(--font-mono); font-size: 0.9rem; color: #888;">ID: ${escapeHTML(userId)}</div>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; font-family: var(--font-mono); font-size: 0.85rem;">
              <div style="background: #000; padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <strong style="color: #fff; display: block; margin-bottom: 10px; border-bottom: 1px dashed #333; padding-bottom: 5px;">PAST ALIASES</strong>
                <div style="color: #aaa;">${osintData.names.map(n => `> ${escapeHTML(n)}`).join('<br>') || '> No data'}</div>
              </div>
              
              <div style="background: #000; padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <strong style="color: #fff; display: block; margin-bottom: 10px; border-bottom: 1px dashed #333; padding-bottom: 5px;">KNOWN GUILDS</strong>
                <div style="color: #aaa;">${osintData.guilds.map(g => `> ${escapeHTML(g)}`).join('<br>') || '> No data'}</div>
              </div>
              
              <div style="background: #000; padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <strong style="color: #fff; display: block; margin-bottom: 10px; border-bottom: 1px dashed #333; padding-bottom: 5px;">VOICE ACTIVITY</strong>
                <div style="color: #aaa;">${osintData.voice.map(v => `> ${escapeHTML(v.channel)} (${v.duration}s)`).join('<br>') || '> No data'}</div>
              </div>
              
              <div style="background: #000; padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); grid-column: 1 / -1;">
                <strong style="color: #fff; display: block; margin-bottom: 10px; border-bottom: 1px dashed #333; padding-bottom: 5px;">MESSAGE INTERCEPTS</strong>
                <div style="color: #aaa; max-height: 150px; overflow-y: auto;">
                  ${osintData.messages && osintData.messages.length > 0 
                    ? osintData.messages.map(m => `> "${escapeHTML(m)}"`).join('<br><br>') 
                    : '> No messages intercepted'}
                </div>
              </div>
            </div>
          </div>`;
        }

        if (data.tracks && data.tracks.length > 0) {
          html += '<div class="tracks-grid">';
          data.tracks.forEach(track => {
            html += `
            <div class="track-card">
              <div class="track-title">${escapeHTML(track.title)}</div>
              <div class="track-meta">ID: ${escapeHTML(data.userId)}</div>

              <div class="audio-player">
                <button class="play-btn" onclick="togglePlay('${track.id}')">
                  <i class="fas fa-play" id="icon-${track.id}"></i>
                </button>
                <div class="progress-container" onclick="seekAudio(event, '${track.id}')">
                  <div class="progress-bar" id="progress-${track.id}"></div>
                </div>
                <div class="time-display" id="time-${track.id}">0:00</div>
                <audio id="audio-${track.id}" ontimeupdate="updateProgress('${track.id}')" onended="resetPlayer('${track.id}')">
                  <source src="/recordings/${escapeHTML(track.file)}" type="audio/mpeg">
                </audio>
              </div>

              <div class="track-actions">
                <a href="/recordings/${escapeHTML(track.file)}" download class="btn-action">
                  [ DL ]
                </a>
                
              </div>
            </div>`;
          });
          html += '</div>';
        }
        
        if (html !== '') {
          container.innerHTML = html;
        } else {
          container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-ghost"></i>
            <h3>NO DATA FOUND</h3>
            <p>Target ID [${escapeHTML(userId)}] has no data.</p>
          </div>`;
        }
      } catch (err) {
        console.error(err);
        container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>ERROR</h3>
          <p>Failed to connect to backend API.</p>
        </div>`;
      }
    }