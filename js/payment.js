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
      headers: { 'Content-Type': 'application/json' },
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
