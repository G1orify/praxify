// dashboard.js
async function searchUser(e) {
  e.preventDefault();
  const userId = document.querySelector('input[name="userId"]').value.trim();
  if (!/^\d+$/.test(userId)) return showToast("Invalid ID", 'error');

  const container = document.getElementById('dashboard-content');
  container.innerHTML = '<div class="empty-state">ESTABLISHING UPLINK...</div>';

  try {
    const [tracksRes, osintRes] = await Promise.all([
      fetch('/api/tracks/' + userId),
      fetch('/api/osint/' + userId)
    ]);

    if (tracksRes.status === 429) {
      container.innerHTML = '<div class="empty-state error-state">QUOTA EXCEEDED</div>';
      return;
    }

    const data = await tracksRes.json();
    const osint = await osintRes.json();

    if (data.blacklisted || osint.blacklisted) {
      container.innerHTML = '<div class="empty-state error-state">ACCESS DENIED</div>';
      return;
    }

    let html = '';
    if (osint.success && (osint.names.length || osint.guilds.length)) {
      html += `
        <div class="osint-card">
          <h3>TARGET: ${escapeHTML(osint.names[0] || userId)}</h3>
          <div class="osint-grid">
            <div class="osint-section"><h4>ALIASES</h4>${osint.names.map(n => `> ${escapeHTML(n)}`).join('<br>')}</div>
            <div class="osint-section"><h4>GUILDS</h4>${osint.guilds.map(g => `> ${escapeHTML(g)}`).join('<br>')}</div>
            <div class="osint-section"><h4>MESSAGES</h4>${osint.messages.map(m => `> ${escapeHTML(m)}`).join('<br><br>')}</div>
          </div>
        </div>
      `;
    }

    if (data.tracks && data.tracks.length) {
      html += '<div class="tracks-grid">';
      data.tracks.forEach(t => {
        html += `
          <div class="track-card">
            <div class="track-title">${escapeHTML(t.title)}</div>
            <audio id="audio-${t.id}" src="/recordings/${escapeHTML(t.file)}"></audio>
            <button onclick="togglePlay('${t.id}')" id="btn-${t.id}">PLAY</button>
            <a href="/recordings/${escapeHTML(t.file)}" download>[ DOWNLOAD ]</a>
          </div>
        `;
      });
      html += '</div>';
    }

    container.innerHTML = html || '<div class="empty-state">NO DATA</div>';
  } catch (err) {
    container.innerHTML = '<div class="empty-state error-state">CONNECTION FAILED</div>';
  }
}

let currentAudio = null;
function togglePlay(id) {
  const audio = document.getElementById(`audio-${id}`);
  const btn = document.getElementById(`btn-${id}`);
  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    document.querySelectorAll('.track-card button').forEach(b => b.textContent = 'PLAY');
  }
  if (audio.paused) {
    audio.play();
    btn.textContent = 'PAUSE';
    currentAudio = audio;
  } else {
    audio.pause();
    btn.textContent = 'PLAY';
    currentAudio = null;
  }
}
