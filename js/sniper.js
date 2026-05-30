let sniperActive = false;
let sniperLoopTimeout = null;

async function fetchBots() {
  try {
    const res = await fetch('/api/bots');
    const bots = await res.json();
    
    const grid = document.getElementById('sniper-grid');
    if (!grid) return;
    
    if (bots.error) {
      grid.innerHTML = `
        <div class="empty-state error-state">
          <i class="fas fa-exclamation-triangle" style="color: #ff3333;"></i>
          <h3 style="color: #ff3333;">API BLOCKED</h3>
          <p style="color: #aaa; margin-top: 10px;">${bots.error}</p>
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

async function loopBots() {
  if (!sniperActive) return;
  await fetchBots();
  sniperLoopTimeout = setTimeout(loopBots, 2000);
}

function startSniperLoop() {
  sniperActive = true;
  loopBots();
}

function stopSniperLoop() {
  sniperActive = false;
  if (sniperLoopTimeout) clearTimeout(sniperLoopTimeout);
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
