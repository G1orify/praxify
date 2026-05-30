// CIPHER_OS - Main Application Entry
window.addEventListener('DOMContentLoaded', () => {
  setupFetchInterceptor();
  
  const token = localStorage.getItem('auth_token');
  if(token) {
    document.getElementById('auth-overlay').classList.remove('active');
    checkAdminRole();
  }
});

function switchTab(tabId, el) {
  document.querySelectorAll('.view-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  const view = document.getElementById(`${tabId}-view`);
  if (view) view.classList.add('active');
  if (el) el.classList.add('active');

  if (tabId === 'sniper') {
    startSniperLoop();
  } else {
    stopSniperLoop();
  }

  if (tabId === 'admin') {
    loadAdminData();
  }
}
