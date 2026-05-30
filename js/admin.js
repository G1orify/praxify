// admin.js
async function loadAdminData() {
  loadAdminStats();
  loadAdminTokens();
  loadUsersList();
  loadActivityLogs();
  if (typeof loadAdminPayments === 'function') loadAdminPayments();
}

async function loadAdminStats() {
  const res = await fetch('/api/stats');
  const data = await res.json();
  if (data.success) {
    document.getElementById('admin-stats-grid').innerHTML = `
      <div class="stat-card"><div>${data.stats.totalRecordings}</div><label>RECS</label></div>
      <div class="stat-card"><div>${data.stats.onlineBots}</div><label>BOTS</label></div>
      <div class="stat-card"><div>${data.stats.totalUsers}</div><label>USERS</label></div>
    `;
  }
}

async function loadAdminTokens() {
  const res = await fetch('/api/admin/tokens');
  const data = await res.json();
  if (data.success) {
    document.getElementById('tokensListContainer').innerHTML = data.tokens.map((t, i) => `
      <div class="token-row">
        <span>[#${i+1}] ${t.substring(0,20)}...</span>
        <button onclick="removeBotToken(${i})">DEL</button>
      </div>
    `).join('');
  }
}

async function addBotToken(e) {
  e.preventDefault();
  const token = document.getElementById('newBotToken').value;
  const res = await fetch('/api/admin/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
  if (res.ok) loadAdminTokens();
}

async function restartFleet() { await fetch('/api/fleet/restart', { method: 'POST' }); showToast("RESTART SIGNAL SENT"); }
