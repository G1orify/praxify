// payment.js
async function submitPayment(e) {
  e.preventDefault();
  const txid = document.getElementById('paymentTxid').value;
  const crypto = document.getElementById('paymentCrypto').value;
  const plan_type = document.getElementById('paymentPlan').value;

  try {
    const res = await originalFetch('/api/payment/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txid, crypto, plan_type })
    });
    const data = await res.json();
    if (data.success) {
      showToast("Submitted. Awaiting approval.", 'success');
      document.getElementById('paymentForm').innerHTML = '<h4>[ PENDING APPROVAL ]</h4>';
    } else {
      showToast(data.error, 'error');
    }
  } catch(e) { showToast("Network error", 'error'); }
}

const _payFetch = window.fetch;
window.fetch = async function(...args) {
  const res = await _payFetch.apply(this, args);
  if (res.status === 402) {
    document.getElementById('payment-overlay').classList.add('active');
  }
  return res;
};
