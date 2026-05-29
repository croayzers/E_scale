/* ─────────────────────────────────────────────────────────
   GROUP MANAGER — Agrupar / desagrupar / duplicar grupos
   ───────────────────────────────────────────────────────── */

import { AppState } from './AppState.js';

function toast(msg, kind = 'info') {
  document.dispatchEvent(new CustomEvent('escale:toast', { detail: { msg, kind } }));
}

function generateGroupId() {
  return 'grp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ─── Queries ─── */

function getGroupItems(groupId) {
  if (!groupId) return [];
  return AppState.items.filter(i => i.groupId === groupId);
}

function getItemGroup(item) {
  return item?.groupId || null;
}

/* ─── Group all selected items ─── */

function groupSelected() {
  const ids = [...AppState.selectedIds];
  if (ids.length < 2) {
    toast('Selecciona 2 o más elementos para agrupar', 'warning');
    return null;
  }

  // If all belong to the same group already → nothing to do
  const items = ids.map(id => AppState.items.find(i => i.id === id)).filter(Boolean);
  const existingGroups = new Set(items.map(i => i.groupId).filter(Boolean));
  if (existingGroups.size === 1 && items.every(i => i.groupId === [...existingGroups][0])) {
    toast('Los elementos ya están en el mismo grupo', 'info');
    return [...existingGroups][0];
  }

  AppState.pushHistory();
  const gid = generateGroupId();
  items.forEach(item => { item.groupId = gid; });
  AppState.emitSceneInsights('group');
  toast(`Grupo creado · ${ids.length} elementos · ID ${gid.slice(-6)}`);
  return gid;
}

/* ─── Ungroup items in selection ─── */

function ungroupSelected() {
  const ids = [...AppState.selectedIds];
  const items = ids.map(id => AppState.items.find(i => i.id === id)).filter(Boolean);
  const affectedGroupIds = new Set(items.map(i => i.groupId).filter(Boolean));

  if (!affectedGroupIds.size) {
    toast('Los elementos seleccionados no pertenecen a ningún grupo', 'info');
    return;
  }

  AppState.pushHistory();
  // Remove groupId from ALL members of every affected group (not just selected ones)
  AppState.items.forEach(item => {
    if (affectedGroupIds.has(item.groupId)) delete item.groupId;
  });
  AppState.emitSceneInsights('ungroup');
  toast(`${affectedGroupIds.size} grupo${affectedGroupIds.size > 1 ? 's' : ''} disuelto${affectedGroupIds.size > 1 ? 's' : ''}`);
}

/* ─── Select all members of a group ─── */

function selectGroup(groupId) {
  if (!groupId) return;
  const ids = getGroupItems(groupId).map(i => i.id);
  if (ids.length) AppState.selectMany(ids, false);
}

/* ─── Duplicate entire group ─── */

function duplicateGroup(groupId) {
  if (!groupId) return;
  const items = getGroupItems(groupId);
  if (!items.length) return;

  AppState.pushHistory();
  const newGid = generateGroupId();
  const newIds = [];

  items.forEach(item => {
    const clone = JSON.parse(JSON.stringify(item));
    delete clone.id;
    clone.x = item.x + 2;
    clone.groupId = newGid;
    clone.locked = false;
    const placed = AppState.add(clone);
    newIds.push(placed.id);
  });

  AppState.selectMany(newIds, false);
  toast(`Grupo duplicado · ${items.length} elementos`);
}

/* ─── Abrir / cerrar grupo (modo movimiento unitario) ──── */

function toggleGroupClosed(groupId) {
  const members = getGroupItems(groupId);
  if (!members.length) return;
  AppState.pushHistory();
  const newState = !members[0].groupClosed;
  members.forEach(item => { item.groupClosed = newState; });
  AppState.emitSceneInsights('group-toggle-closed');
  toast(newState
    ? 'Grupo cerrado · Los items se mueven como unidad'
    : 'Grupo abierto · Items editables individualmente');
}

/* ─── Handle click on grouped item ─────────────────────────────
   Returns true if the click was "consumed" (group expanded).
   Returns false if normal click flow should proceed.
   ────────────────────────────────────────────────────────────── */

function handleGroupClick(item, shiftDown) {
  const gid = item?.groupId;
  if (!gid || shiftDown) return false;

  const groupIds = getGroupItems(gid).map(i => i.id);

  // Grupo cerrado: siempre seleccionar todo sin pasar al item individual
  if (item.groupClosed) {
    AppState.selectMany(groupIds, false);
    return true;
  }

  const allAlreadySelected = groupIds.length > 0 && groupIds.every(id => AppState.selectedIds.has(id));
  if (allAlreadySelected) return false; // Group already active, pass through for context menu

  AppState.selectMany(groupIds, false);
  return true; // Consumed — caller should set up drag for the expanded selection
}

/* ─── Context menu HTML fragment ─── */

function contextMenuHTML(item) {
  const gid = item.groupId;
  const multiSelected = AppState.selectedIds.size > 1;

  const canGroup = multiSelected;
  const canUngroup = gid || ([...AppState.selectedIds].some(id => AppState.items.find(i => i.id === id)?.groupId));
  const canDupGroup = Boolean(gid);
  const canSelectGroup = Boolean(gid);

  if (!canGroup && !canUngroup) return '';

  const groupCount = gid ? getGroupItems(gid).length : 0;
  const groupLabel = gid
    ? `Grupo · ${groupCount} elemento${groupCount !== 1 ? 's' : ''} · <small style="opacity:.55">${gid.slice(-6)}</small>`
    : `Agrupar selección <small style="opacity:.55">(${AppState.selectedIds.size} items)</small>`;

  return `
    <div class="ctx-divider"></div>
    <div class="ctx-block">
      <div class="ctx-label">Grupos</div>
      ${gid ? `<div class="ctx-readonly" style="font-size:10.5px;line-height:1.4;color:var(--muted)">${groupLabel}</div>` : ''}
      <div class="ctx-actions" style="flex-wrap:wrap;gap:4px;margin-top:4px">
        ${canGroup ? `<button data-action="group-selected" class="ctx-action-btn">
          <i data-lucide="group" class="w-3.5 h-3.5"></i>
          <span>${gid ? 'Re-agrupar' : 'Agrupar'}</span>
          <small>Ctrl+G</small>
        </button>` : ''}
        ${canSelectGroup ? `<button data-action="group-select-all" class="ctx-action-btn">
          <i data-lucide="box-select" class="w-3.5 h-3.5"></i>
          <span>Sel. grupo</span>
        </button>` : ''}
        ${canDupGroup ? `<button data-action="group-duplicate" class="ctx-action-btn">
          <i data-lucide="copy-plus" class="w-3.5 h-3.5"></i>
          <span>Dup. grupo</span>
        </button>` : ''}
        ${canUngroup ? `<button data-action="group-dissolve" class="ctx-action-btn danger">
          <i data-lucide="ungroup" class="w-3.5 h-3.5"></i>
          <span>Disolver</span>
          <small>Ctrl+⇧+G</small>
        </button>` : ''}
        ${gid ? `<button data-action="group-toggle-closed" class="ctx-action-btn">
          <i data-lucide="${item.groupClosed ? 'lock-open' : 'lock'}" class="w-3.5 h-3.5"></i>
          <span>${item.groupClosed ? 'Abrir grupo' : 'Cerrar grupo'}</span>
        </button>` : ''}
        ${multiSelected ? `<button data-action="save-as-group" class="ctx-action-btn">
          <i data-lucide="bookmark-plus" class="w-3.5 h-3.5"></i>
          <span>Guardar grupo</span>
        </button>` : ''}
      </div>
    </div>`;
}

export const GroupManager = {
  generateGroupId,
  getGroupItems,
  getItemGroup,
  groupSelected,
  ungroupSelected,
  selectGroup,
  duplicateGroup,
  handleGroupClick,
  toggleGroupClosed,
  contextMenuHTML,
};

window.GroupManager = GroupManager;
