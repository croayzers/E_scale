import { CollabManager } from '../services/CollabManager.js';

let _el    = null;
let _token = null;

function q(attr) { return _el?.querySelector(`[data-cj="${attr}"]`); }

function setView(view) {
  _el?.querySelectorAll('[data-view]').forEach(el => {
    el.hidden = el.dataset.view !== view;
  });
}

function injectStyles() {
  if (document.getElementById('collab-join-styles')) return;
  const s = document.createElement('style');
  s.id = 'collab-join-styles';
  s.textContent = `
    #collab-join-modal { display:none; position:fixed; inset:0; background:rgba(0,0,0,.72); z-index:9500; align-items:center; justify-content:center; }
    #collab-join-modal.visible { display:flex; }
    .cj-box { background:#1c1c1e; border:1px solid #2a2a2e; border-radius:16px; width:400px; max-width:calc(100vw - 32px); box-shadow:0 32px 80px rgba(0,0,0,.7); color:#f0ede8; font-family:inherit; overflow:hidden; }
    .cj-hero { text-align:center; padding:32px 24px 20px; background:linear-gradient(160deg,#1a2640 0%,#1c1c1e 70%); }
    .cj-icon { font-size:42px; margin-bottom:12px; }
    .cj-host { font-size:16px; font-weight:700; color:#e5e7eb; }
    .cj-subtitle { font-size:13px; color:#9ca3af; margin-top:4px; }
    .cj-session-name { font-size:13px; color:#60a5fa; margin-top:6px; font-weight:500; }
    .cj-body { padding:20px 24px; }
    .cj-label { display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:#6b7280; margin:14px 0 6px; }
    .cj-label:first-child { margin-top:0; }
    .cj-input { width:100%; background:#111; border:1px solid #374151; border-radius:8px; padding:10px 12px; color:#e5e7eb; font-size:14px; outline:none; box-sizing:border-box; transition:border-color .15s; }
    .cj-input:focus { border-color:#3B82F6; }
    .cj-note { font-size:11px; color:#6b7280; margin-top:8px; line-height:1.5; }
    .cj-join-btn { width:100%; background:#3B82F6; border:none; border-radius:8px; color:#fff; font-size:14px; font-weight:600; padding:12px; cursor:pointer; margin-top:18px; transition:background .15s; }
    .cj-join-btn:hover { background:#2563eb; }
    .cj-join-btn:disabled { background:#374151; cursor:not-allowed; }
    .cj-spinner { width:32px; height:32px; border:3px solid #374151; border-top-color:#3B82F6; border-radius:50%; margin:0 auto; animation:cj-spin .7s linear infinite; }
    @keyframes cj-spin { to { transform:rotate(360deg) } }
    .cj-loading-label { text-align:center; font-size:13px; color:#9ca3af; margin-top:12px; }
    .cj-error-msg { background:#3f1010; border:1px solid #7f1d1d; border-radius:8px; padding:12px; font-size:13px; color:#fca5a5; }
    .cj-retry-btn { background:none; border:1px solid #374151; border-radius:8px; color:#d1d5db; font-size:13px; padding:8px 14px; cursor:pointer; margin-top:10px; }
  `;
  document.head.appendChild(s);
}

export const CollabJoinModal = {
  init() {
    injectStyles();
    _el = document.createElement('div');
    _el.id = 'collab-join-modal';
    _el.innerHTML = `
      <div class="cj-box">
        <div class="cj-hero">
          <div class="cj-icon">🤝</div>
          <div data-cj="host-name" class="cj-host">Colaboración</div>
          <div class="cj-subtitle">te invita a editar el plano juntos</div>
          <div data-cj="session-name" class="cj-session-name"></div>
        </div>
        <div class="cj-body">
          <div data-view="form">
            <label class="cj-label">Tu nombre</label>
            <input data-cj="name-input" class="cj-input" placeholder="¿Cómo te llaman?" maxlength="40" autocomplete="off" />
            <label class="cj-label">Email (opcional)</label>
            <input data-cj="email-input" class="cj-input" type="email" placeholder="Para guardar tu cuenta después" />
            <p class="cj-note">Puedes colaborar ahora sin cuenta. Te pediremos el registro al terminar si quieres guardar tus cambios.</p>
            <button data-cj="join-btn" class="cj-join-btn">Unirme a la sesión</button>
          </div>
          <div data-view="loading" hidden>
            <div class="cj-spinner"></div>
            <p class="cj-loading-label">Cargando la escena…</p>
          </div>
          <div data-view="error" hidden>
            <div data-cj="error-msg" class="cj-error-msg"></div>
            <button data-cj="retry-btn" class="cj-retry-btn">Volver a intentar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(_el);

    q('join-btn')?.addEventListener('click', () => this._doJoin());
    q('retry-btn')?.addEventListener('click', () => setView('form'));
    q('name-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') this._doJoin(); });

    // Triggered by CollabManager.init() when ?collab= param detected
    document.addEventListener('escale:collab-invite-detected', e => {
      _token = e.detail.token;
      this._prefetch(_token);
      this.show();
    });
  },

  async _prefetch(token) {
    // Optionally pre-load session metadata to show host name before joining
    try {
      const resp = await fetch(`/api/collab/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Dry-run: send empty displayName to get 400 with session info
        // Instead, we expose a lightweight GET endpoint
        body: JSON.stringify({ inviteToken: token, displayName: '__peek__' })
      });
      const data = await resp.json();
      if (data.hostName) {
        const el = q('host-name');
        if (el) el.textContent = data.hostName;
      }
      if (data.sessionName) {
        const el = q('session-name');
        if (el) el.textContent = data.sessionName;
      }
    } catch {
      // Silently ignore prefetch errors — join will show the real error
    }
  },

  async _doJoin() {
    const name = q('name-input')?.value.trim();
    if (!name) { q('name-input')?.focus(); return; }

    const btn = q('join-btn');
    if (btn) btn.disabled = true;
    setView('loading');

    try {
      const data = await CollabManager.joinSession({
        inviteToken:  _token,
        displayName:  name,
        email:        q('email-input')?.value.trim() || ''
      });
      _el.classList.remove('visible');
      document.dispatchEvent(new CustomEvent('escale:collab-joined', { detail: data }));
    } catch (err) {
      const msg = q('error-msg');
      if (msg) msg.textContent = err.message || 'No se pudo conectar a la sesión';
      if (btn) btn.disabled = false;
      setView('error');
    }
  },

  show() {
    if (!_el) this.init();
    setView('form');
    _el.classList.add('visible');
    setTimeout(() => q('name-input')?.focus(), 80);
  },

  hide() { _el?.classList.remove('visible'); }
};
