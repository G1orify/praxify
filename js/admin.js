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
      showToast("SUCCESS: " + data.message, 'success');
      document.getElementById(inputId).value = '';
      loadAdminTokens();
    } else {
      showToast("ERROR: " + data.error, 'error');
    }
  } catch (err) {
    showToast("NETWORK ERROR: " + err, 'error');
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
        container.innerHTML = '<div style="color: #ff3333; font-family: var(--font-mono);">NO TOKENS CONFIGURED</div>';
        return;
      }
      
      let html = '';
      data.tokens.forEach((token, index) => {
        const maskedToken = token.length > 20 
          ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` 
          : token;
          
        html += `
          <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--glass-border); border-radius: 12px; padding: 10px 15px; background: rgba(255,255,255,0.02);">
            <div style="font-family: var(--font-mono); font-size: 0.9rem; color: #fff;">
              <strong>[#${index + 1}]</strong> ${escapeHTML(maskedToken)}
            </div>
            <button type="button" onclick="removeBotToken(${index})" style="padding: 5px 15px; font-size: 0.8rem; border: 1px solid #525252; color: #fff; background: transparent; border-radius: 4px; cursor: pointer;">
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
      showToast("SUCCESS: " + data.message, 'success');
      loadAdminTokens();
    } else {
      showToast("ERROR: " + data.error, 'error');
    }
  } catch (err) {
    showToast("NETWORK ERROR: " + err, 'error');
  }
}

async function loadAdminStats() {
  const container = document.getElementById('admin-stats-grid');
  if (!container) return;
  
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.success) {
      const stats = data.stats;
      container.innerHTML = `
        <div class="stat-card">
          <div class="stat-value">${stats.totalRecordings}</div>
          <div class="stat-label">TOTAL RECORDINGS</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.onlineBots}</div>
          <div class="stat-label">ONLINE BOTS</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalUsers}</div>
          <div class="stat-label">REGISTERED USERS</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.diskUsageFormatted}</div>
          <div class="stat-label">DISK USAGE</div>
        </div>
      `;
    }
  } catch (e) { console.error(e); }
}

async function loadUsersList() {
  const container = document.getElementById('usersListContainer');
  if (!container) return;
  
  try {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (data.success) {
      let html = '<table class="admin-table"><thead><tr><th>ID</th><th>USERNAME</th><th>ROLE</th><th>CREATED</th><th>ACTIONS</th></tr></thead><tbody>';
      data.users.forEach(user => {
        html += `
          <tr>
            <td>${user.id}</td>
            <td>${escapeHTML(user.username)}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
              <button onclick="toggleUserRole(${user.id}, '${user.role}')" class="btn-mini">[ ROLE ]</button>
              <button onclick="deleteUser(${user.id})" class="btn-mini btn-danger">[ DEL ]</button>
            </td>
          </tr>
        `;
      });
      html += '</tbody></table>';
      container.innerHTML = html;
    }
  } catch (e) { console.error(e); }
}

async function loadActivityLogs() {
  const container = document.getElementById('activityLogContainer');
  if (!container) return;
  
  try {
    const res = await fetch('/api/admin/activity');
    const data = await res.json();
    if (data.success) {
      let html = '<table class="admin-table"><thead><tr><th>ADMIN</th><th>ACTION</th><th>TARGET</th><th>TIME</th></tr></thead><tbody>';
      data.logs.forEach(log => {
        html += `
          <tr>
            <td>${escapeHTML(log.admin_username)}</td>
            <td>${escapeHTML(log.action)}</td>
            <td class="mono">${escapeHTML(log.target)}</td>
            <td>${new Date(log.timestamp).toLocaleString()}</td>
          </tr>
        `;
      });
      html += '</tbody></table>';
      container.innerHTML = html;
    }
  } catch (e) { console.error(e); }
}

async function restartFleet() {
  if (!confirm("SIGNAL ALL BOTS TO RESTART?")) return;
  try {
    const res = await fetch('/api/fleet/restart', { method: 'POST' });
    const data = await res.json();
    if (data.success) showToast(data.message, 'success');
  } catch (e) { showToast("FAILED TO RESTART", 'error'); }
}

async function freezeFleet(freeze) {
  try {
    const res = await fetch('/api/fleet/freeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ freeze })
    });
    const data = await res.json();
    if (data.success) showToast(freeze ? "FLEET FROZEN" : "FLEET UNFROZEN", 'success');
  } catch (e) { showToast("FAILED TO TOGGLE", 'error'); }
}

async function panicFleet() {
  if (!confirm("!!! EMERGENCY PANIC DISCONNECT !!!\nTHIS WILL REMOVE ALL TOKENS AND STOP ALL BOTS.\nCONTINUE?")) return;
  try {
    const res = await fetch('/api/fleet/panic', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadAdminTokens();
    }
  } catch (e) { showToast("PANIC FAILED", 'error'); }
}

async function deleteUser(id) {
  if (!confirm(`DELETE USER ID ${id}?`)) return;
  try {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast("USER DELETED", 'success');
      loadUsersList();
    }
  } catch (e) { showToast("DELETE FAILED", 'error'); }
}

async function toggleUserRole(id, currentRole) {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  try {
    const res = await fetch(`/api/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      showToast("ROLE UPDATED", 'success');
      loadUsersList();
    }
  } catch (e) { showToast("UPDATE FAILED", 'error'); }
}

function loadAdminData() {
  loadAdminStats();
  loadAdminTokens();
  loadUsersList();
  loadActivityLogs();
}
