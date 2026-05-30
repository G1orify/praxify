// app.js
window.addEventListener('DOMContentLoaded', () => {
  setupFetchInterceptor();
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    document.getElementById('landing-hero').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
    checkAdminRole();
  } else {
    document.getElementById('landing-hero').style.display = 'flex';
    document.querySelector('.container').style.display = 'none';
  }
});

function switchTab(tabId, el) {
  document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tabs .tab-btn').forEach(t => t.classList.remove('active'));
  
  const view = document.getElementById(`${tabId}-view`);
  if (view) view.classList.add('active');
  if (el) el.classList.add('active');

  if (tabId === 'sniper') startSniperLoop();
  else stopSniperLoop();

  if (tabId === 'admin') loadAdminData();
}
