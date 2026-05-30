/* ─────────────────────────────────────────────────────────
   PREDICTIVE ARRAY — Patrón de repetición inteligente
   Detecta 3 objetos idénticos alineados y equidistantes y
   proyecta 3 "fantasmas" adicionales que el usuario puede
   confirmar con un clic.
   ───────────────────────────────────────────────────────── */

import { AppState }    from '../core/AppState.js';
import { SceneManager } from '../scene/SceneManager.js';

/* ─── Constantes ─── */
const GHOST_COUNT  = 3;
const HIT_RADIUS   = 1.6;   // metros — radio de proximidad para clic
const EPS_DIST     = 0.08;  // fracción — tolerancia de equidistancia (8 %)
const EPS_ALIGN    = 0.15;  // metros — tolerancia de colinearidad
const MIN_SPAN     = 0.4;   // metros — separación mínima entre objetos

/* ─── Estado ─── */
/** @type {Array<{group: THREE.Group, pos: {x,z}, idx: number}>} */
let _ghosts   = [];
let _template = null; // item fuente (último del trío)
let _enabled  = true;

/* ════════════════════════════════════════════════════════
   API PÚBLICA
   ════════════════════════════════════════════════════════ */

function isActive()  { return _ghosts.length > 0; }
function setEnabled(v) { _enabled = v; if (!v) _clearGhosts(); }

/**
 * Llamar cada vez que cambie la selección.
 * Limpia los fantasmas actuales y recalcula si procede.
 */
function onSelectionChanged() {
  _clearGhosts();
  if (!_enabled) return;

  const selectedItems = [...AppState.selectedIds]
    .map(id => AppState.items.find(i => i.id === id))
    .filter(Boolean);

  const pattern = _validatePattern(selectedItems);
  if (!pattern) return;

  _template = pattern.templateItem;
  _showGhosts(pattern.positions);
}

/**
 * Llamar desde InteractionManager.onPointerDown antes del flujo normal.
 * Devuelve true si consumió el evento.
 * @param {THREE.Vector3|null} worldPoint
 */
function handleInteractionPointerDown(worldPoint) {
  if (!isActive() || !worldPoint) return false;

  const pt = { x: worldPoint.x, z: worldPoint.z };
  let hitIdx = -1;

  for (const ghost of _ghosts) {
    if (_dist2D(pt, ghost.pos) < HIT_RADIUS) {
      hitIdx = ghost.idx;
      break;
    }
  }

  if (hitIdx === -1) {
    // Clic fuera de cualquier fantasma → limpiar pero no consumir
    _clearGhosts();
    return false;
  }

  // Confirmar fantasmas 0 … hitIdx como items reales
  _ghosts
    .filter(g => g.idx <= hitIdx)
    .forEach(g => {
      const newItem = { ..._template, x: g.pos.x, z: g.pos.z };
      delete newItem.id;
      AppState.add(newItem);
    });

  _clearGhosts();
  return true;
}

/** Descarta todos los fantasmas (p. ej. al pulsar ESC). */
function clear() { _clearGhosts(); }

/* ════════════════════════════════════════════════════════
   VALIDACIÓN GEOMÉTRICA
   ════════════════════════════════════════════════════════ */

function _dist2D(a, b) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.z - a.z) ** 2);
}

/**
 * Valida si 3 items son idénticos (mismo type), colineares y equidistantes.
 * Devuelve { templateItem, positions[] } o null.
 */
function _validatePattern(items) {
  if (items.length !== 3) return null;

  // Mismo tipo
  const types = new Set(items.map(i => i.type));
  if (types.size !== 1) return null;

  const [a, b, c] = items;

  // Distancias pairwise para identificar extremos y punto medio
  const dAB = _dist2D(a, b), dAC = _dist2D(a, c), dBC = _dist2D(b, c);

  let p1, p2, p3; // p1=inicio, p2=medio, p3=final
  if (dAB >= dAC && dAB >= dBC)      { p1 = a; p3 = b; p2 = c; }
  else if (dAC >= dAB && dAC >= dBC) { p1 = a; p3 = c; p2 = b; }
  else                                { p1 = b; p3 = c; p2 = a; }

  const span = _dist2D(p1, p3);
  if (span < MIN_SPAN) return null; // demasiado juntos

  // p2 debe ser el punto medio (equidistancia)
  const midX = (p1.x + p3.x) / 2, midZ = (p1.z + p3.z) / 2;
  if (_dist2D({ x: midX, z: midZ }, p2) > span * EPS_DIST) return null;

  // Colinearidad: área del triángulo / span < tolerancia
  const area = Math.abs(
    (p2.x - p1.x) * (p3.z - p1.z) - (p3.x - p1.x) * (p2.z - p1.z)
  );
  if (area / span > EPS_ALIGN) return null;

  // Vector paso: de p1 a p2 (= mitad del trecho total)
  let step = { x: p2.x - p1.x, z: p2.z - p1.z };

  // Garantizar que el paso apunta de p1 hacia p3
  const toP3 = { x: p3.x - p1.x, z: p3.z - p1.z };
  if (step.x * toP3.x + step.z * toP3.z < 0) {
    step = { x: -step.x, z: -step.z };
    [p1, p3] = [p3, p1];
  }

  return {
    templateItem: p3,
    positions: [
      { x: p3.x +       step.x, z: p3.z +       step.z },
      { x: p3.x + 2 * step.x,   z: p3.z + 2 * step.z   },
      { x: p3.x + 3 * step.x,   z: p3.z + 3 * step.z   },
    ]
  };
}

/* ════════════════════════════════════════════════════════
   RENDERIZADO
   ════════════════════════════════════════════════════════ */

function _showGhosts(positions) {
  positions.forEach((pos, idx) => {
    const ghostItem = { ..._template, x: pos.x, z: _template.z !== undefined ? pos.z : pos.z, y: _template.y ?? 0 };
    const group = SceneManager.spawnGhost(ghostItem, idx);
    if (group) _ghosts.push({ group, pos, idx });
  });
}

function _clearGhosts() {
  _ghosts.forEach(g => SceneManager.despawnGhost(g.group));
  _ghosts   = [];
  _template = null;
}

/* ════════════════════════════════════════════════════════
   EXPORT
   ════════════════════════════════════════════════════════ */
export const PredictiveArray = {
  isActive,
  setEnabled,
  onSelectionChanged,
  handleInteractionPointerDown,
  clear,
};
