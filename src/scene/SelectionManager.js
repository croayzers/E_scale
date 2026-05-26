/* ─────────────────────────────────────────────────────────
   SELECTION MANAGER — Format copy/paste, same-style marks,
   selection helpers, clone helpers
   ───────────────────────────────────────────────────────── */

import { AppState } from '../core/AppState.js';

// Visual/style properties to carry across format copy
const FORMAT_PROPS = ['color', 'textColor', 'poleColor', 'tarpColor', 'cableColor', 'lightColor'];

let copiedFormat = null;              // { color?, textColor?, ... }
const markedSameStyleIds = new Set(); // Items marked as same-style as reference
let _layerManager = null;            // Lazy reference, set by LayerManager after init

function bindLayerManager(lm) { _layerManager = lm; }

/* ─── Style signature ─── */
function getItemStyleSignature(item) {
  if (!item) return '';
  return JSON.stringify({
    type:    item.type,
    subtype: item.subtype || null,
    color:   item.color   || null,
    textColor: item.textColor || null
  });
}

/* ─── Format copy ─── */
function copyItemFormat(item) {
  if (!item) return;
  copiedFormat = {};
  FORMAT_PROPS.forEach(prop => {
    if (item[prop] !== undefined) copiedFormat[prop] = item[prop];
  });
  document.dispatchEvent(new CustomEvent('escale:toast', {
    detail: { msg: 'Formato copiado', kind: 'info' }
  }));
}

function applyCopiedFormatToItem(item) {
  if (!copiedFormat || !item || !canEditItem(item)) return;
  const patch = {};
  FORMAT_PROPS.forEach(prop => {
    if (copiedFormat[prop] !== undefined) patch[prop] = copiedFormat[prop];
  });
  if (!Object.keys(patch).length) return;
  AppState.update(item.id, patch, { skipDetailRebuild: false });
}

function applyCopiedFormatToSelection() {
  if (!copiedFormat) return;
  [...AppState.selectedIds].forEach(id => {
    const item = AppState.items.find(i => i.id === id);
    if (item) applyCopiedFormatToItem(item);
  });
  document.dispatchEvent(new CustomEvent('escale:toast', {
    detail: { msg: 'Formato aplicado a selección', kind: 'info' }
  }));
}

/* ─── Same-style marking ─── */
function markItemsWithSameStyle(referenceItem) {
  markedSameStyleIds.clear();
  if (!referenceItem) return;
  const sig = getItemStyleSignature(referenceItem);
  AppState.items.forEach(item => {
    if (item.id !== referenceItem.id && getItemStyleSignature(item) === sig) {
      markedSameStyleIds.add(item.id);
    }
  });
  refreshSelectionVisuals();
  if (markedSameStyleIds.size > 0) {
    document.dispatchEvent(new CustomEvent('escale:toast', {
      detail: { msg: `${markedSameStyleIds.size} items del mismo estilo marcados`, kind: 'info' }
    }));
  }
}

function applyFormatToMarkedSameStyleItems() {
  if (!copiedFormat) return;
  markedSameStyleIds.forEach(id => {
    const item = AppState.items.find(i => i.id === id);
    if (item) applyCopiedFormatToItem(item);
  });
  document.dispatchEvent(new CustomEvent('escale:toast', {
    detail: { msg: 'Formato aplicado a items marcados', kind: 'info' }
  }));
}

function clearSameStyleMarks() {
  markedSameStyleIds.clear();
  refreshSelectionVisuals();
}

/* ─── Selection wrappers ─── */
function selectItem(item, additive = false) {
  if (!item) return;
  AppState.select(item.id, additive);
}

function selectMultipleItems(items) {
  if (!items?.length) return;
  AppState.selectMany(items.map(i => i.id));
}

function clearSelection() {
  AppState.deselect();
}

/* ─── Duplicate / Clone ─── */
function duplicateSelected() {
  if (AppState.selectedIds.size === 0) return;
  AppState.pushHistory();
  const newIds = [];
  [...AppState.selectedIds].forEach(id => {
    const item = AppState.items.find(i => i.id === id);
    if (!item || item.locked) return;
    const clone = JSON.parse(JSON.stringify(item));
    delete clone.id;
    clone.x = item.x + 1.5;
    clone.locked = false;
    const placed = AppState.add(clone);
    newIds.push(placed.id);
  });
  if (newIds.length) AppState.selectMany(newIds);
}

function cloneMultipleSelected(options = {}) {
  const { offsetX = 2, offsetZ = 0 } = options;
  if (AppState.selectedIds.size === 0) return;
  AppState.pushHistory();
  const newIds = [];
  [...AppState.selectedIds].forEach(id => {
    const item = AppState.items.find(i => i.id === id);
    if (!item || item.locked) return;
    const clone = JSON.parse(JSON.stringify(item));
    delete clone.id;
    clone.x = item.x + offsetX;
    clone.z = item.z + offsetZ;
    clone.locked = false;
    const placed = AppState.add(clone);
    newIds.push(placed.id);
  });
  if (newIds.length) AppState.selectMany(newIds);
}

/* ─── Edit guard ─── */
function canEditItem(item) {
  if (!item) return false;
  if (item.locked) return false;
  if (_layerManager) {
    const layer = _layerManager.getItemLayer(item);
    if (layer && layer.locked) return false;
  }
  return true;
}

/* ─── Visuals ─── */
function refreshSelectionVisuals() {
  // SceneManager.highlightSelection reads markedSameStyleIds from us
  import('../scene/SceneManager.js').then(({ SceneManager }) => {
    SceneManager.highlightSelection();
  });
}

export const SelectionManager = {
  bindLayerManager,
  getItemStyleSignature,
  copyItemFormat,
  applyCopiedFormatToItem,
  applyCopiedFormatToSelection,
  markItemsWithSameStyle,
  applyFormatToMarkedSameStyleItems,
  clearSameStyleMarks,
  selectItem,
  selectMultipleItems,
  clearSelection,
  duplicateSelected,
  cloneMultipleSelected,
  canEditItem,
  refreshSelectionVisuals,
  get copiedFormat()       { return copiedFormat; },
  get markedSameStyleIds() { return markedSameStyleIds; }
};

window.SelectionManager = SelectionManager;
