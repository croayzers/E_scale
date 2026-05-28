import { CollabManager } from './CollabManager.js';
import { AppState }      from '../core/AppState.js';
import { SceneManager }  from '../scene/SceneManager.js';

// Red BoxHelpers keyed by remote userId
const _lockBoxes  = new Map();
// Green BoxHelpers keyed by noteId
const _noteGlows  = new Map();
// CSS label divs keyed by noteId
const _noteLabels = new Map();
// All active notes keyed by noteId
const _notes      = new Map();

let _lastSelectedId = null;
let _presenceDebounce = null;

// ── Presence: broadcast local selection ───────────────────────────────────────

function syncSelectionToPresence() {
  if (!CollabManager.active) return;
  const id = AppState.selectedId ?? null;
  if (id === _lastSelectedId) return;
  _lastSelectedId = id;
  CollabManager.updatePresence({ selectedItemId: id });
}

// ── Lock boxes: red wireframe on remotely-selected items ──────────────────────

function updateLockBoxes(participants) {
  // Remove helpers whose owner is gone or changed selection
  for (const [userId, helper] of _lockBoxes) {
    const stillValid = participants.some(p => !p.isLocal && p.userId === userId && p.selectedItemId);
    if (!stillValid) {
      SceneManager.scene?.remove(helper);
      _lockBoxes.delete(userId);
    }
  }

  for (const p of participants) {
    if (p.isLocal || !p.selectedItemId) continue;
    const group = SceneManager.meshes?.get(p.selectedItemId);
    if (!group) continue;

    const existing = _lockBoxes.get(p.userId);
    // Only recreate if item changed
    if (existing?.userData?._itemId === p.selectedItemId) continue;

    if (existing) { SceneManager.scene?.remove(existing); _lockBoxes.delete(p.userId); }

    try {
      const helper = new THREE.BoxHelper(group, new THREE.Color(0xff2222));
      helper.userData._itemId = p.selectedItemId;
      SceneManager.scene?.add(helper);
      _lockBoxes.set(p.userId, helper);
    } catch {}
  }
}

// ── Note glows: green wireframe on noted items ────────────────────────────────

function addNoteGlow(noteId, itemId) {
  removeNoteGlow(noteId);
  const group = SceneManager.meshes?.get(itemId);
  if (!group || !SceneManager.scene) return;
  try {
    const helper = new THREE.BoxHelper(group, new THREE.Color(0x10B981));
    helper.userData._noteId = noteId;
    SceneManager.scene.add(helper);
    _noteGlows.set(noteId, { itemId, helper });
  } catch {}
}

function removeNoteGlow(noteId) {
  const entry = _noteGlows.get(noteId);
  if (!entry) return;
  SceneManager.scene?.remove(entry.helper);
  _noteGlows.delete(noteId);
}

// ── Note labels: CSS overlay near element ────────────────────────────────────

function createNoteLabel(noteId, itemId, text, authorName, authorColor) {
  removeNoteLabel(noteId);
  const div = document.createElement('div');
  div.className = 'ci-note-label';
  div.dataset.noteId = noteId;
  div.innerHTML = `
    <span class="cinl-dot" style="background:${authorColor}"></span>
    <span class="cinl-author">${authorName}:</span>
    <span class="cinl-text">${text}</span>
    <button class="cinl-dismiss" title="Quitar nota">×</button>
  `;
  document.body.appendChild(div);
  _noteLabels.set(noteId, { div, itemId });

  div.querySelector('.cinl-dismiss')?.addEventListener('click', () => {
    CollabManager.sendNoteEvent('collab-note-dismiss', { noteId });
    dismissNote(noteId);
  });

  positionLabel(noteId);
}

function positionLabel(noteId) {
  const entry = _noteLabels.get(noteId);
  if (!entry) return;
  const { div, itemId } = entry;
  const group = SceneManager.meshes?.get(itemId);
  const cam   = SceneManager.activeCam;
  if (!group || !cam) { div.style.display = 'none'; return; }

  const box3 = new THREE.Box3().setFromObject(group);
  const top  = new THREE.Vector3(
    (box3.min.x + box3.max.x) * 0.5,
    box3.max.y,
    (box3.min.z + box3.max.z) * 0.5
  );
  top.project(cam);

  if (top.z > 1) { div.style.display = 'none'; return; }

  const x = (top.x *  0.5 + 0.5) * window.innerWidth;
  const y = (top.y * -0.5 + 0.5) * window.innerHeight;

  div.style.display = '';
  div.style.left = x + 'px';
  div.style.top  = (y - 44) + 'px';
}

function removeNoteLabel(noteId) {
  const entry = _noteLabels.get(noteId);
  if (!entry) return;
  entry.div.remove();
  _noteLabels.delete(noteId);
}

// ── Dismiss ───────────────────────────────────────────────────────────────────

function dismissNote(noteId) {
  removeNoteGlow(noteId);
  removeNoteLabel(noteId);
  _notes.delete(noteId);
}

// ── Animation loop ────────────────────────────────────────────────────────────

function animLoop() {
  for (const [, h]         of _lockBoxes)  h.update?.();
  for (const [, { helper }] of _noteGlows)  helper.update?.();
  for (const [noteId]       of _noteLabels) positionLabel(noteId);
  requestAnimationFrame(animLoop);
}

// ── Styles ────────────────────────────────────────────────────────────────────

function injectStyles() {
  if (document.getElementById('ci-interact-styles')) return;
  const s = document.createElement('style');
  s.id = 'ci-interact-styles';
  s.textContent = `
    /* Note label */
    .ci-note-label {
      position:fixed; z-index:7500; pointer-events:none;
      display:flex; align-items:center; gap:5px;
      background:rgba(10,10,14,.9); backdrop-filter:blur(12px);
      border:1px solid rgba(16,185,129,.5); border-radius:8px;
      padding:5px 10px; font-size:11px; color:#e5e7eb; white-space:nowrap;
      transform:translateX(-50%); pointer-events:all;
      box-shadow:0 2px 16px rgba(0,0,0,.5), 0 0 10px rgba(16,185,129,.2);
      max-width:280px; font-family:inherit;
    }
    .cinl-dot    { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .cinl-author { font-weight:700; color:#10B981; flex-shrink:0; }
    .cinl-text   { overflow:hidden; text-overflow:ellipsis; }
    .cinl-dismiss {
      background:none; border:none; color:#6b7280; cursor:pointer;
      padding:0 0 0 4px; font-size:14px; line-height:1; flex-shrink:0;
    }
    .cinl-dismiss:hover { color:#fff; }

    /* Note button inside detail panel */
    #collab-note-area {
      display:none; padding:0 0 8px;
      border-bottom:1px solid rgba(255,255,255,.06);
      margin-bottom:10px;
    }
    #collab-note-area.visible { display:block; }
    #collab-note-toggle {
      width:100%; background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.3);
      border-radius:8px; color:#10B981; font-size:12px; font-weight:600;
      padding:7px 10px; cursor:pointer; display:flex; align-items:center; gap:6px;
      transition:all .15s; font-family:inherit;
    }
    #collab-note-toggle:hover { background:rgba(16,185,129,.2); border-color:#10B981; }
    #collab-note-toggle svg   { flex-shrink:0; }

    /* Compose popover */
    #collab-note-compose {
      display:none; margin-top:8px;
      background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1);
      border-radius:10px; padding:10px;
    }
    #collab-note-compose.visible { display:block; }
    #collab-note-compose textarea {
      width:100%; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      border-radius:7px; color:#e5e7eb; font-size:12px; font-family:inherit;
      padding:8px 10px; resize:none; outline:none; box-sizing:border-box; height:60px;
    }
    #collab-note-compose textarea:focus { border-color:rgba(16,185,129,.5); }
    #collab-note-send {
      width:100%; margin-top:6px; background:#10B981; border:none;
      border-radius:7px; color:#fff; font-size:12px; font-weight:600;
      padding:7px; cursor:pointer; display:flex; align-items:center;
      justify-content:center; gap:5px; transition:background .15s; font-family:inherit;
    }
    #collab-note-send:hover { background:#059669; }
  `;
  document.head.appendChild(s);
}

// ── Public API ────────────────────────────────────────────────────────────────

export const CollabInteractions = {
  init() {
    injectStyles();

    // Inject note button area into detail panel before #detail-content
    const panel   = document.getElementById('detail-panel');
    const content = document.getElementById('detail-content');
    if (panel && content) {
      const noteArea = document.createElement('div');
      noteArea.id = 'collab-note-area';
      noteArea.innerHTML = `
        <button id="collab-note-toggle">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Añadir nota colaborativa
        </button>
        <div id="collab-note-compose">
          <textarea placeholder="Escribe una nota para todos…" maxlength="200"></textarea>
          <button id="collab-note-send">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Enviar
          </button>
        </div>
      `;
      panel.insertBefore(noteArea, content);
    }

    // Toggle compose on note button click
    document.addEventListener('click', e => {
      if (e.target.closest('#collab-note-toggle')) {
        document.getElementById('collab-note-compose')?.classList.toggle('visible');
        document.querySelector('#collab-note-compose textarea')?.focus();
      }
    });

    // Send note
    document.addEventListener('click', e => {
      if (!e.target.closest('#collab-note-send')) return;
      const ta     = document.querySelector('#collab-note-compose textarea');
      const text   = ta?.value.trim();
      const itemId = AppState.selectedId;
      if (!text || !itemId || !CollabManager.active) return;

      CollabManager.sendNoteEvent('collab-note', {
        noteId:      `n-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        itemId,
        text,
        authorName:  CollabManager.localName  || 'Anónimo',
        authorColor: CollabManager.localColor || '#10B981'
      });

      if (ta) ta.value = '';
      document.getElementById('collab-note-compose')?.classList.remove('visible');
    });

    // Show/hide note area based on collab + selection
    document.addEventListener('escale:scene-insights-changed', () => {
      const active   = CollabManager.active;
      const selected = AppState.selectedId !== null;
      const area = document.getElementById('collab-note-area');
      if (area) area.classList.toggle('visible', active && selected);
      if (!selected) document.getElementById('collab-note-compose')?.classList.remove('visible');
      // Broadcast local selection to presence
      if (_presenceDebounce) clearTimeout(_presenceDebounce);
      _presenceDebounce = setTimeout(syncSelectionToPresence, 120);
    });

    // Lock boxes from remote selections
    document.addEventListener('escale:collab-presence', e => {
      updateLockBoxes(e.detail.participants || []);
    });

    // Receive note events
    CollabManager.onNoteEvent((type, payload) => {
      if (type === 'collab-note') {
        const { noteId, itemId, text, authorName, authorColor } = payload;
        _notes.set(noteId, payload);
        addNoteGlow(noteId, itemId);
        createNoteLabel(noteId, itemId, text, authorName, authorColor);
      } else if (type === 'collab-note-dismiss') {
        dismissNote(payload.noteId);
      }
    });

    // Cleanup on session end
    document.addEventListener('escale:collab-ended', () => {
      for (const noteId of [..._notes.keys()]) dismissNote(noteId);
      for (const [, h] of _lockBoxes) SceneManager.scene?.remove(h);
      _lockBoxes.clear();
      _lastSelectedId = null;
      document.getElementById('collab-note-area')?.classList.remove('visible');
      document.getElementById('collab-note-compose')?.classList.remove('visible');
    });

    // Start animation loop for BoxHelper and label updates
    animLoop();
  }
};
