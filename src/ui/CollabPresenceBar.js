import { CollabManager } from '../services/CollabManager.js';

let _bar = null;

function injectStyles() {
  if (document.getElementById('collab-bar-styles')) return;
  const s = document.createElement('style');
  s.id = 'collab-bar-styles';
  s.textContent = `
    #collab-presence-bar { display:none; position:fixed; top:0; left:0; right:0; height:32px; background:#0f172a; border-bottom:1px solid #1e293b; z-index:8000; align-items:center; justify-content:space-between; padding:0 14px; font-family:inherit; }
    #collab-presence-bar.visible { display:flex; }
    body.collab-active { padding-top:32px; }
    .cpb-left { display:flex; align-items:center; gap:10px; }
    .cpb-pulse { width:7px; height:7px; border-radius:50%; background:#10B981; animation:cpb-blink 1.4s ease-in-out infinite; flex-shrink:0; }
    @keyframes cpb-blink { 0%,100%{opacity:1} 50%{opacity:.25} }
    .cpb-label { font-size:11px; font-weight:600; color:#10B981; text-transform:uppercase; letter-spacing:.07em; }
    .cpb-users { display:flex; align-items:center; gap:6px; }
    .cpb-avatar { display:flex; align-items:center; gap:4px; background:rgba(255,255,255,.06); border-radius:100px; padding:1px 8px 1px 4px; }
    .cpb-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .cpb-name { font-size:11px; color:#cbd5e1; white-space:nowrap; max-width:80px; overflow:hidden; text-overflow:ellipsis; }
    .cpb-badge { font-size:10px; margin-left:2px; }
    .cpb-right { display:flex; align-items:center; gap:12px; }
    .cpb-session { font-size:11px; color:#64748b; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .cpb-viewer-badge { background:#374151; border-radius:100px; padding:1px 8px; font-size:10px; color:#9ca3af; }
    .cpb-end-btn { background:none; border:1px solid #374151; border-radius:6px; color:#9ca3af; font-size:11px; padding:2px 10px; cursor:pointer; transition:all .15s; }
    .cpb-end-btn:hover { background:#7f1d1d; border-color:#b91c1c; color:#fca5a5; }
  `;
  document.head.appendChild(s);
}

function renderUsers(participants) {
  const container = _bar?.querySelector('.cpb-users');
  if (!container) return;
  container.innerHTML = participants.slice(0, 6).map(p => `
    <div class="cpb-avatar" title="${p.displayName}${p.isLocal ? ' (Tú)' : ''}">
      <span class="cpb-dot" style="background:${p.color}"></span>
      <span class="cpb-name">${p.displayName.split(' ')[0]}${p.isLocal ? ' ✓' : ''}</span>
      ${p.role === 'viewer' ? '<span class="cpb-badge">👁</span>' : ''}
    </div>
  `).join('');
}

export const CollabPresenceBar = {
  init() {
    injectStyles();
    _bar = document.createElement('div');
    _bar.id = 'collab-presence-bar';
    _bar.innerHTML = `
      <div class="cpb-left">
        <span class="cpb-pulse"></span>
        <span class="cpb-label">En vivo</span>
        <div class="cpb-users"></div>
      </div>
      <div class="cpb-right">
        <span class="cpb-session"></span>
        <span class="cpb-viewer-badge" id="cpb-viewer-badge" hidden>Solo lectura</span>
        <button class="cpb-end-btn">Salir</button>
      </div>
    `;
    document.body.prepend(_bar);

    _bar.querySelector('.cpb-end-btn').addEventListener('click', () => {
      CollabManager.end();
      this.hide();
    });

    document.addEventListener('escale:collab-presence', e => {
      renderUsers(e.detail.participants || []);
    });
    document.addEventListener('escale:collab-ended', () => this.hide());
  },

  show(sessionName) {
    if (!_bar) this.init();
    const label = _bar.querySelector('.cpb-session');
    if (label) label.textContent = sessionName ? `· ${sessionName}` : '';
    const badge = document.getElementById('cpb-viewer-badge');
    if (badge) badge.hidden = CollabManager.localRole !== 'viewer';
    _bar.classList.add('visible');
    document.body.classList.add('collab-active');
  },

  hide() {
    _bar?.classList.remove('visible');
    document.body.classList.remove('collab-active');
  }
};
