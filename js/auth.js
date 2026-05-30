// auth.js
let authMode = 'login';

function switchAuthTab(mode, el) {
  authMode = mode;
  document.querySelectorAll('.auth-box .tab-btn').forEach(btn => btn.classList.remove('active'));
  if (el) el.classList.add('active');
  
  document.getElementById('authTitle').textContent = mode === 'login' ? 'LOGIN // AUTH' : 'SIGNUP // REG';
  if (window.turnstile) turnstile.reset('#turnstile-widget');
}

async function submitAuth(e) {
  e.preventDefault();
  const username = document.getElementById('authUsername').value;
  const password = document.getElementById('authPassword').value;
  const captchaToken = document.querySelector('[name="cf-turnstile-response"]')?.value;

  if (!captchaToken) { showToast("Verification required", 'error'); return; }

  const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
  try {
    const res = await originalFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, captchaToken })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('auth_token', data.token);
      location.reload(); // Hard reload to clear states
    } else {
      showToast(data.error || "Auth failed", 'error');
      if (window.turnstile) turnstile.reset('#turnstile-widget');
    }
  } catch(e) { showToast("Network error", 'error'); }
}

function checkAdminRole() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    const payload = parseJwt(token);
    const isAdmin = payload && payload.role === 'admin';
    const adminTab = document.getElementById('adminTabBtn');
    const sniperTab = document.getElementById('sniperTabBtn');
    if (adminTab) adminTab.style.display = isAdmin ? 'block' : 'none';
    if (sniperTab) sniperTab.style.display = isAdmin ? 'block' : 'none';
  }
}

function logoutUser() {
  localStorage.removeItem('auth_token');
  location.reload();
}
