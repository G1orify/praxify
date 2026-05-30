function showToast(msg, type='info') {
  let icon = type === 'error' ? '<i class="fas fa-times-circle"></i>' : (type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-info-circle"></i>');
  let toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.style.borderLeft = `4px solid ${type === 'error' ? '#ff3333' : (type === 'success' ? '#00ff00' : '#fff')}`;
  toast.innerHTML = `${icon} <span>${escapeHTML(msg)}</span>`;
  
  // Auto stacking logic
  const existingToasts = document.querySelectorAll('.toast-msg');
  existingToasts.forEach((t, i) => {
    t.style.bottom = `${(existingToasts.length - i) * 70 + 20}px`;
  });

  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('active');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('active');
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

const originalFetch = window.fetch;
function setupFetchInterceptor() {
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
        if (typeof loadCaptcha === 'function') loadCaptcha();
      }
    }
    return response;
  };
}

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
