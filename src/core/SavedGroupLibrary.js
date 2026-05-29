/* ─────────────────────────────────────────────────────────
   SAVED GROUP LIBRARY — Guardar/cargar grupos de elementos
   ───────────────────────────────────────────────────────── */

import { AppState } from './AppState.js';

const STORAGE_KEY = 'escale_saved_groups';
let _groups = null; // caché en memoria

function generateSavedGroupId() {
  return 'sg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    _groups = raw ? JSON.parse(raw) : [];
  } catch {
    _groups = [];
  }
  return _groups;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_groups));
  } catch {
    // localStorage lleno — aviso silencioso
    console.warn('[SavedGroupLibrary] No se pudo guardar en localStorage.');
  }
  document.dispatchEvent(new CustomEvent('escale:saved-groups-changed'));
}

function getAll() {
  if (!_groups) load();
  return _groups;
}

function getById(id) {
  return getAll().find(g => g.id === id) || null;
}

/* ─── Guardar selección actual ─────────────────────────── */

function saveCurrentSelection(name) {
  const ids = [...AppState.selectedIds];
  if (ids.length < 2) {
    document.dispatchEvent(new CustomEvent('escale:toast', { detail: { msg: 'Selecciona 2 o más elementos para guardar como grupo', kind: 'warning' } }));
    return null;
  }

  const items = ids.map(id => AppState.items.find(i => i.id === id)).filter(Boolean);

  // Centroide
  const cx = items.reduce((s, i) => s + i.x, 0) / items.length;
  const cz = items.reduce((s, i) => s + i.z, 0) / items.length;

  // Clonar items, eliminar campos de escena, calcular posiciones relativas
  const itemTemplates = items.map(item => {
    const clone = JSON.parse(JSON.stringify(item));
    delete clone.id;
    delete clone._mesh;
    delete clone._group;
    delete clone.groupId;
    delete clone.savedGroupId;
    delete clone.groupClosed;
    clone._relX = item.x - cx;
    clone._relZ = item.z - cz;
    return clone;
  });

  const definition = {
    id: generateSavedGroupId(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    thumbnail: generateThumbnailSVG(itemTemplates),
    itemCount: itemTemplates.length,
    itemTemplates,
  };

  getAll().push(definition);
  persist();
  document.dispatchEvent(new CustomEvent('escale:toast', { detail: { msg: `Grupo "${definition.name}" guardado · ${itemTemplates.length} elementos`, kind: 'success' } }));
  return definition;
}

/* ─── Eliminar / renombrar ─────────────────────────────── */

function deleteSavedGroup(id) {
  _groups = getAll().filter(g => g.id !== id);
  persist();
}

function renameSavedGroup(id, newName) {
  const def = getById(id);
  if (!def) return;
  def.name = newName.trim();
  persist();
}

/* ─── Thumbnail SVG ────────────────────────────────────── */

function generateThumbnailSVG(itemTemplates) {
  if (!itemTemplates.length) return '';

  // Bounding box de posiciones relativas
  const xs = itemTemplates.map(i => i._relX);
  const zs = itemTemplates.map(i => i._relZ);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minZ = Math.min(...zs), maxZ = Math.max(...zs);
  const rangeX = Math.max(maxX - minX, 0.5);
  const rangeZ = Math.max(maxZ - minZ, 0.5);

  const pad = 10;
  const vw = 100, vh = 100;
  const usable = vw - pad * 2;

  // Escala uniforme para preservar aspecto
  const scale = usable / Math.max(rangeX, rangeZ);

  const toSvg = (rx, rz) => ({
    sx: pad + (rx - minX) * scale + (usable - rangeX * scale) / 2,
    sz: pad + (rz - minZ) * scale + (usable - rangeZ * scale) / 2,
  });

  const shapes = itemTemplates.map(item => {
    const { sx, sz } = toSvg(item._relX, item._relZ);
    const t = item.type || '';
    const fill = item.color || '#1a1a1c';
    const r = 0.2; // radio normalizado de la forma

    if (t === 'mesa' || t.startsWith('mesa') || t === 'table') {
      const d = Math.min(item.dims?.diameter || 1.8, rangeX * 0.35) * scale * 0.4;
      return `<circle cx="${sx.toFixed(1)}" cy="${sz.toFixed(1)}" r="${Math.max(d, 3).toFixed(1)}" fill="${fill}" opacity="0.8"/>`;
    }
    if (t.startsWith('silla') || t === 'chair' || t === 'seat') {
      const s = Math.max(scale * 0.18, 2.5);
      return `<rect x="${(sx - s).toFixed(1)}" y="${(sz - s).toFixed(1)}" width="${(s * 2).toFixed(1)}" height="${(s * 2).toFixed(1)}" fill="${fill}" opacity="0.7"/>`;
    }
    if (t === 'zone') {
      const w = Math.max((item.dims?.width || 3) * scale * 0.25, 8);
      const h = Math.max((item.dims?.length || 3) * scale * 0.25, 8);
      return `<rect x="${(sx - w / 2).toFixed(1)}" y="${(sz - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="${fill}" stroke-width="1.2" stroke-dasharray="3,2" opacity="0.6"/>`;
    }
    if (t === 'carpa' || t === 'structure') {
      const w = Math.max((item.dims?.width || 6) * scale * 0.18, 6);
      const h = Math.max((item.dims?.length || 6) * scale * 0.18, 6);
      return `<rect x="${(sx - w / 2).toFixed(1)}" y="${(sz - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" opacity="0.25" stroke="${fill}" stroke-width="1"/>`;
    }
    if (t.includes('bar') || t.includes('buffet')) {
      const w = Math.max(scale * 0.5, 8), h = Math.max(scale * 0.12, 2);
      return `<rect x="${(sx - w / 2).toFixed(1)}" y="${(sz - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" opacity="0.75"/>`;
    }
    // Fallback: círculo pequeño
    return `<circle cx="${sx.toFixed(1)}" cy="${sz.toFixed(1)}" r="3" fill="${fill}" opacity="0.6"/>`;
  }).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}">
  <rect width="${vw}" height="${vh}" fill="rgba(10,10,11,0.04)" rx="4"/>
  ${shapes}
</svg>`;
}

export const SavedGroupLibrary = {
  load,
  getAll,
  getById,
  saveCurrentSelection,
  deleteSavedGroup,
  renameSavedGroup,
  generateThumbnailSVG,
};

window.SavedGroupLibrary = SavedGroupLibrary;
