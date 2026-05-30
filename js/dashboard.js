let currentAudioPlaying = null;

async function searchUser(e) {
  e.preventDefault();
  const userId = document.querySelector('input[name="userId"]').value.trim();
  if (!userId) return;
  
  const container = document.getElementById('dashboard-content');
  container.innerHTML = '<div class="empty-state"><i class="fas fa-sync fa-spin"></i><h3>SEARCHING...</h3></div>';
  
  try {
    const [tracksRes, osintRes] = await Promise.all([
      fetch('/api/tracks/' + userId),
      fetch('/api/osint/' + userId).catch(() => null)
    ]);
    
    const data = await tracksRes.json();
    const osintData = osintRes && osintRes.ok ? await osintRes.json().catch(() => null) : null;
    
    // Phase 4: User Blacklist UI
    if ((data && data.blacklisted) || (osintData && osintData.blacklisted)) {
      container.innerHTML = `
      <div class="empty-state error-state">
        <i class="fas fa-ban" style="color: #ff3333; opacity: 1;"></i>
        <h3 style="color: #ff3333;">ACCESS DENIED</h3>
        <p style="color: #aaa; margin-top: 10px;">Target ID [${escapeHTML(userId)}] is permanently blacklisted by system administrators.</p>
      </div>`;
      return;
    }

    let html = '';

    if (osintData && osintData.success && (osintData.names.length > 0 || osintData.guilds.length > 0)) {
      html += `
      <div class="osint-card">
        <div class="osint-header">
          <div class="osint-avatar">
            ${osintData.avatars && osintData.avatars.length > 0 ? `<img src="${osintData.avatars[0]}" alt="Avatar">` : '<i class="fas fa-user"></i>'}
          </div>
          <div class="osint-title">
            <h3>${escapeHTML(osintData.names[0] || 'Unknown Target')}</h3>
            <div class="osint-id">ID: ${escapeHTML(userId)}</div>
          </div>
        </div>
        
        <div class="osint-grid">
          <div class="osint-section">
            <div class="osint-label">PAST ALIASES</div>
            <div class="osint-value">${osintData.names.map(n => `> ${escapeHTML(n)}`).join('<br>') || '> No data'}</div>
          </div>
          
          <div class="osint-section">
            <div class="osint-label">KNOWN GUILDS</div>
            <div class="osint-value">${osintData.guilds.map(g => `> ${escapeHTML(g)}`).join('<br>') || '> No data'}</div>
          </div>
          
          <div class="osint-section">
            <div class="osint-label">VOICE ACTIVITY</div>
            <div class="osint-value">${osintData.voice.map(v => `> ${escapeHTML(v.channel)} (${v.duration}s)`).join('<br>') || '> No data'}</div>
          </div>
          
          <div class="osint-section full-width">
            <div class="osint-label">MESSAGE INTERCEPTS</div>
            <div class="osint-value scrollable">
              ${osintData.messages && osintData.messages.length > 0 
                ? osintData.messages.map(m => `> "${escapeHTML(m)}"`).join('<br><br>') 
                : '> No messages intercepted'}
            </div>
          </div>
        </div>
      </div>`;
    }

    if (data.tracks && data.tracks.length > 0) {
      html += '<div class="tracks-grid">';
      data.tracks.forEach(track => {
        html += `
        <div class="track-card">
          <div class="track-title">${escapeHTML(track.title)}</div>
          <div class="track-meta">ID: ${escapeHTML(data.userId)}</div>

          <div class="audio-player">
            <button class="play-btn" onclick="togglePlay('${track.id}')">
              <i class="fas fa-play" id="icon-${track.id}"></i>
            </button>
            <div class="progress-container" onclick="seekAudio(event, '${track.id}')">
              <div class="progress-bar" id="progress-${track.id}"></div>
            </div>
            <div class="time-display" id="time-${track.id}">0:00</div>
            <audio id="audio-${track.id}" ontimeupdate="updateProgress('${track.id}')" onended="resetPlayer('${track.id}')">
              <source src="/recordings/${escapeHTML(track.file)}" type="audio/mpeg">
            </audio>
          </div>

          <div class="track-actions">
            <a href="/recordings/${escapeHTML(track.file)}" download class="btn-action">
              [ DL ]
            </a>
          </div>
        </div>`;
      });
      html += '</div>';
    }
    
    if (html !== '') {
      container.innerHTML = html;
    } else {
      container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-ghost"></i>
        <h3>NO DATA FOUND</h3>
        <p>Target ID [${escapeHTML(userId)}] has no data.</p>
      </div>`;
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `
    <div class="empty-state error-state">
      <i class="fas fa-exclamation-triangle" style="color: #ff3333;"></i>
      <h3 style="color: #ff3333;">CONNECTION ERROR</h3>
      <p style="color: #aaa; margin-top: 10px;">Failed to connect to backend API or data stream.</p>
    </div>`;
  }
}

function togglePlay(id) {
  const audio = document.getElementById(`audio-${id}`);
  const icon = document.getElementById(`icon-${id}`);

  if (currentAudioPlaying && currentAudioPlaying !== audio) {
    currentAudioPlaying.pause();
    const oldId = currentAudioPlaying.id.replace('audio-', '');
    const oldIcon = document.getElementById(`icon-${oldId}`);
    if (oldIcon) oldIcon.className = 'fas fa-play';
  }

  if (audio.paused) {
    audio.play();
    icon.className = 'fas fa-pause';
    currentAudioPlaying = audio;
  } else {
    audio.pause();
    icon.className = 'fas fa-play';
    currentAudioPlaying = null;
  }
}

function updateProgress(id) {
  const audio = document.getElementById(`audio-${id}`);
  const progress = document.getElementById(`progress-${id}`);
  const timeDisplay = document.getElementById(`time-${id}`);
  
  if (audio && audio.duration) {
    const percent = (audio.currentTime / audio.duration) * 100;
    if (progress) progress.style.width = `${percent}%`;
    
    const currentMins = Math.floor(audio.currentTime / 60);
    const currentSecs = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
    if (timeDisplay) timeDisplay.textContent = `${currentMins}:${currentSecs}`;
  }
}

function seekAudio(e, id) {
  const audio = document.getElementById(`audio-${id}`);
  const container = e.currentTarget;
  const rect = container.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  if (audio && audio.duration) {
    audio.currentTime = percent * audio.duration;
  }
}

function resetPlayer(id) {
  const icon = document.getElementById(`icon-${id}`);
  if (icon) icon.className = 'fas fa-play';
  if(currentAudioPlaying === document.getElementById(`audio-${id}`)) {
    currentAudioPlaying = null;
  }
}
