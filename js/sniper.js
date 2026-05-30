// sniper.js
let sniperInterval = null;
async function fetchBots() {
  try {
    const res = await fetch('/api/bots');
    const bots = await res.json();
    const grid = document.getElementById('sniper-grid');
    if (!grid) return;
    
    if (bots.error) {
      grid.innerHTML = `<div class="empty-state error-state">${bots.error}</div>`;
      return;
    }

    grid.innerHTML = bots.map(bot => `
      <div class="sniper-card">
        <div class="bot-header">
          <span>${escapeHTML(bot.bot_name)}</span>
          <span class="role-badge">${bot.state}</span>
        </div>
        <div class="snipe-log">> ${escapeHTML(bot.log)}</div>
        <div class="snipe-input-group">
          <input type="text" id="target-${bot.bot_id}" placeholder="TARGET ID">
          <button onclick="sendSnipe(${bot.bot_id})">CH</button>
          <button onclick="sendUserSnipe(${bot.bot_id})">USR</button>
          <button onclick="cancelSnipe(${bot.bot_id})">STOP</button>
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

function startSniperLoop() {
  fetchBots();
  sniperInterval = setInterval(fetchBots, 3000);
}
function stopSniperLoop() {
  clearInterval(sniperInterval);
}

async function sendSnipe(botId) {
  const target = document.getElementById(`target-${botId}`).value;
  await fetch('/api/snipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId, targetChannel: target }) });
  fetchBots();
}
async function sendUserSnipe(botId) {
  const target = document.getElementById(`target-${botId}`).value;
  await fetch('/api/snipe_user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId, targetUser: target }) });
  fetchBots();
}
async function cancelSnipe(botId) {
  await fetch('/api/unsnipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId }) });
  fetchBots();
}
