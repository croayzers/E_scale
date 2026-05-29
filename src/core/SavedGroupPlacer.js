/* ─────────────────────────────────────────────────────────
   SAVED GROUP PLACER — Colocar instancias de grupos guardados
   ───────────────────────────────────────────────────────── */

import { AppState } from './AppState.js';
import { GroupManager } from './GroupManager.js';

function hasPendingGroupPlacement() {
  return Boolean(window.__escalePendingGroupPlacement);
}

function getPendingGroupPlacement() {
  return window.__escalePendingGroupPlacement || null;
}

function activatePlacement(def) {
  window.__escalePendingGroupPlacement = def;
  document.body.classList.add('placement-pending');
  document.dispatchEvent(new CustomEvent('escale:group-placement-start', {
    detail: { label: def.name }
  }));
}

function clearPlacement() {
  delete window.__escalePendingGroupPlacement;
  document.body.classList.remove('placement-pending');
  document.dispatchEvent(new CustomEvent('escale:group-placement-end'));
}

function placeGroupAt({ x, z }) {
  const def = getPendingGroupPlacement();
  if (!def || !def.itemTemplates?.length) return;

  AppState.pushHistory();
  const newGroupId = GroupManager.generateGroupId();
  const newIds = [];

  AppState._suppressHistory = true;
  try {
    def.itemTemplates.forEach(template => {
      const clone = JSON.parse(JSON.stringify(template));
      clone.x = x + (template._relX || 0);
      clone.z = z + (template._relZ || 0);
      delete clone._relX;
      delete clone._relZ;
      delete clone.id;
      clone.groupId = newGroupId;
      clone.savedGroupId = def.id;
      clone.groupClosed = false;
      clone.locked = false;
      const placed = AppState.add(clone);
      newIds.push(placed.id);
    });
  } finally {
    AppState._suppressHistory = false;
  }

  if (newIds.length) AppState.selectMany(newIds, false);
  document.dispatchEvent(new CustomEvent('escale:toast', {
    detail: { msg: `Grupo colocado · ${def.name}`, kind: 'success' }
  }));
}

export const SavedGroupPlacer = {
  hasPendingGroupPlacement,
  getPendingGroupPlacement,
  activatePlacement,
  clearPlacement,
  placeGroupAt,
};

window.SavedGroupPlacer = SavedGroupPlacer;
