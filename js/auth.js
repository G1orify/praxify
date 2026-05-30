let authMode = 'login';
let currentCaptchaToken = '';

function switchAuthTab(mode, el) {
  authMode = mode;
  document.querySelectorAll('.auth-box .tab-btn').forEach(btn => btn.classList.remove('active'));
  if (el) el.classList.add('active');
  else document.getElementById(`tab-${mode}`).classList.add('active');
  
  document.getElementById('authTitle').textContent = mode === 'login' ? 'LOGIN // AUTHENTICATE' : 'SIGNUP // REGISTER';
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
  } catch(e) {
    console.error("Failed to load captcha", e);
  }
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
      showToast(`AUTH_ERR: ${data.error}`, 'error');
      loadCaptcha();
    }
  } catch(e) {
    showToast("NETWORK_ERR", 'error');
  }
}

function checkAdminRole() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    const payload = parseJwt(token);
    const isAdmin = payload && payload.role === 'admin';
    const adminTab = document.getElementById('adminTabBtn');
    const sniperTab = document.getElementById('sniperTabBtn');
    if (adminTab) adminTab.style.display = isAdmin ? 'inline-block' : 'none';
    if (sniperTab) sniperTab.style.display = isAdmin ? 'inline-block' : 'none';
  }
}

function logoutUser() {
  localStorage.removeItem('auth_token');
  document.getElementById('auth-overlay').classList.add('active');
  const adminTab = document.getElementById('adminTabBtn');
  const sniperTab = document.getElementById('sniperTabBtn');
  if (adminTab) adminTab.style.display = 'none';
  if (sniperTab) sniperTab.style.display = 'none';
  switchTab('dashboard', document.querySelector('.tab-btn[onclick*="switchTab(\'dashboard\'"]'));
  loadCaptcha();
  if (typeof stopSniperLoop === 'function') stopSniperLoop();
}
