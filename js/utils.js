// utils.js
function showToast(msg, type='info') {
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<span>${escapeHTML(msg)}</span>`;
  if (type === 'error') toast.style.borderColor = '#ff3333';
  if (type === 'success') toast.style.borderColor = '#ffffff';

  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('active'), 10);
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

const originalFetch = window.fetch;
function setupFetchInterceptor() {
  window.fetch = async function(...args) {
    const token = localStorage.getItem('auth_token');
    if (token && typeof args[0] === 'string' && args[0].startsWith('/api/')) {
      args[1] = args[1] || {};
      args[1].headers = args[1].headers || {};
      args[1].headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await originalFetch.apply(this, args);
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('auth_token');
      document.getElementById('auth-overlay').classList.add('active');
    }
    return res;
  };
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) { return null; }
}
