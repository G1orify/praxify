async function submitPayment(e) {
  e.preventDefault();
  const txid = document.getElementById('paymentTxid').value;
  const crypto = document.getElementById('paymentCrypto').value;
  const btn = document.querySelector('#paymentForm .auth-submit-btn');
  const btnText = document.getElementById('paymentSubmitBtn');
  const spinner = btn.querySelector('.spinner');

  btn.classList.add('loading');
  if (btnText) btnText.textContent = "[ SUBMITTING ]";
  if (spinner) spinner.style.display = 'inline-block';

  try {
    const res = await originalFetch('/api/payment/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') },
      body: JSON.stringify({ txid, crypto })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (typeof showToast === 'function') showToast("Payment submitted. Awaiting admin approval.", 'success');
      document.getElementById('paymentForm').innerHTML = '<div style="color:#00ff00;text-align:center;font-family:var(--font-mono);margin-top:20px;">[ TXID SUBMITTED - AWAITING VERIFICATION ]<br><br>Please check back later or contact an administrator.</div>';
    } else {
      if (typeof showToast === 'function') showToast(`ERROR: ${data.error}`, 'error');
    }
  } catch(err) {
    if (typeof showToast === 'function') showToast("NETWORK ERROR", 'error');
  } finally {
    btn.classList.remove('loading');
    if (btnText) btnText.textContent = "[ SUBMIT PAYMENT ]";
    if (spinner) spinner.style.display = 'none';
  }
}

// Global fetch interceptor for 402 Payment Required
const _paymentFetch = window.fetch;
window.fetch = async function(...args) {
  const response = await _paymentFetch.apply(this, args);
  if (response.status === 402) {
    // Show payment overlay
    document.getElementById('payment-overlay').classList.add('active');
  }
  return response;
};

async function loadAdminPayments() {
  const container = document.getElementById('paymentsListContainer');
  if (!container) return;
  container.innerHTML = '<div style="color: #aaa;">Loading payments...</div>';
  try {
    const res = await originalFetch('/api/admin/payments', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
    });
    const data = await res.json();
    if (data.success) {
      if (data.payments.length === 0) {
        container.innerHTML = '<div style="color: #888; font-family: var(--font-mono);">NO PENDING PAYMENTS</div>';
        return;
      }
      let html = '<table class="admin-table"><thead><tr><th>ID</th><th>USER</th><th>TXID</th><th>CRYPTO</th><th>STATUS</th><th>DATE</th><th>ACTIONS</th></tr></thead><tbody>';
      data.payments.forEach(p => {
        html += `
          <tr>
            <td>${p.id}</td>
            <td>${p.username}</td>
            <td class="mono" style="font-size:0.75rem;" title="${p.txid}">${p.txid.length > 15 ? p.txid.substring(0, 15) + '...' : p.txid}</td>
            <td>${p.crypto}</td>
            <td><span class="role-badge ${p.status === 'approved' ? 'admin' : (p.status === 'rejected' ? 'user' : '')}">${p.status}</span></td>
            <td>${new Date(p.created_at).toLocaleDateString()}</td>
            <td>
              ${p.status === 'pending' ? `
                <button onclick="approvePayment(${p.id})" class="btn-mini">[ APPROVE ]</button>
                <button onclick="rejectPayment(${p.id})" class="btn-mini btn-danger">[ REJECT ]</button>
              ` : '-'}
            </td>
          </tr>
        `;
      });
      html += '</tbody></table>';
      container.innerHTML = html;
    }
  } catch (e) {
    container.innerHTML = '<div style="color: #ff3333;">NETWORK ERROR</div>';
  }
}

async function approvePayment(id) {
  if (!confirm(`APPROVE PAYMENT ID ${id}?`)) return;
  try {
    const res = await originalFetch(`/api/admin/payments/${id}/approve`, { 
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') } 
    });
    if (res.ok) {
      if (typeof showToast === 'function') showToast("PAYMENT APPROVED", 'success');
      loadAdminPayments();
    }
  } catch (e) {}
}

async function rejectPayment(id) {
  if (!confirm(`REJECT PAYMENT ID ${id}?`)) return;
  try {
    const res = await originalFetch(`/api/admin/payments/${id}/reject`, { 
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') } 
    });
    if (res.ok) {
      if (typeof showToast === 'function') showToast("PAYMENT REJECTED", 'success');
      loadAdminPayments();
    }
  } catch (e) {}
}

// Hook into existing UI to load payments when admin tab is clicked
document.addEventListener('DOMContentLoaded', () => {
  const adminBtn = document.getElementById('adminTabBtn');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      setTimeout(loadAdminPayments, 100);
    });
  }
});

