/* ─────────────────────────────────────────────────────────
   MEASURE MANAGER v2 — Herramienta "Tomar medidas"
   · Creación: clic P1 → hover → clic P2
   · Edición:  clic para seleccionar, handles para estirar/rotar
   · Rotación: sin Shift → snap 45°  |  con Shift → libre
   ───────────────────────────────────────────────────────── */

import { AppState } from '../core/AppState.js';
import { SceneManager } from '../scene/SceneManager.js';

/* ─── Constantes ─── */
const Y      = 0.04;           // altura base sobre el plano
const Y_H    = 0.055;          // handles (por encima de la anotación)
const ARL    = 0.18;           // longitud flecha
const ARH    = 0.07;           // semianchura flecha
const HR     = 0.13;           // radio visual del handle
const HIT    = 0.32;           // radio de click en metros (handles)
const LINE_H = 0.18;           // radio de click para la línea

const SNAP_RAD = Math.PI / 4;  // 45°

const C_ANN  = 0x111111;       // color anotación normal
const C_SEL  = 0x3b82f6;       // color seleccionado
const C_WHT  = 0xffffff;

/* ─── Estado de módulo ─── */
let sceneReady = false;
let annotationsGroup = null;
let guideGroup = null;
let guideLine = null;
let guideP1Dot = null;

/** @type {Array<{id:number,p1:{x,z},p2:{x,z},group:THREE.Group}>} */
const annotations = [];
let nextId = 1;
let selectedId = null;
/** @type {{annId:number, type:'p1'|'p2'|'center', halfLen?:number}|null} */
let drag = null;

/* ════════════════════════════════════════════
   INICIALIZACIÓN
   ════════════════════════════════════════════ */
function _boot() {
  if (sceneReady) return true;
  const scene = SceneManager.scene;
  if (!scene) return false;
  sceneReady = true;

  annotationsGroup = new THREE.Group();
  annotationsGroup.name = 'measureAnnotations';
  scene.add(annotationsGroup);

  guideGroup = new THREE.Group();
  guideGroup.name = 'measureGuide';
  guideGroup.visible = false;
  scene.add(guideGroup);

  // Línea guía (posiciones actualizables)
  const buf = new Float32Array(6);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(buf, 3));
  guideLine = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: C_ANN, depthTest: false }));
  guideLine.renderOrder = 950;
  guideGroup.add(guideLine);

  // Dot P1 durante creación
  const dg = new THREE.CircleGeometry(0.07, 16);
  dg.rotateX(-Math.PI / 2);
  guideP1Dot = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ color: C_ANN, depthTest: false }));
  guideP1Dot.renderOrder = 951;
  guideGroup.add(guideP1Dot);

  return true;
}

/* ════════════════════════════════════════════
   API PÚBLICA — MODO CREACIÓN
   ════════════════════════════════════════════ */

function isActive() { return Boolean(AppState.measure?.active); }

/** Activa modo creación. Llamar setTopCamera() antes desde main.js. */
function start() {
  if (!_boot()) return;
  AppState.measure = { active: true, p1: null };
  document.body.classList.add('cursor-measure');
  _banner('Haz clic en el primer punto de la medición');
}

/** Cancela creación o deselecciona la anotación activa. */
function cancel() {
  if (isActive()) {
    AppState.measure = { active: false, p1: null };
    document.body.classList.remove('cursor-measure');
    if (guideGroup) guideGroup.visible = false;
    _hideTooltip();
    _hideBanner();
  }
  _deselect();
}

/** Gestiona un clic durante la creación. */
function handleClick(point) {
  if (!_boot()) return;
  const state = AppState.measure;
  if (!state?.active) return;

  if (!state.p1) {
    state.p1 = { x: point.x, z: point.z };
    guideGroup.visible = true;
    guideP1Dot.position.set(point.x, Y, point.z);
    _banner('Haz clic en el segundo punto para fijar la medida');
  } else {
    const raw = { x: point.x, z: point.z };
    const p2  = state.snappedP2 ?? raw;
    const dx = p2.x - state.p1.x, dz = p2.z - state.p1.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist >= 0.01) _createAnnotation(state.p1, p2);
    // Reinicia para permitir otra medida inmediata
    state.p1 = null;
    state.snappedP2 = null;
    guideGroup.visible = false;
    _hideTooltip();
    _banner('Haz clic en el primer punto de la medición');
  }
}

/** Actualiza línea guía y tooltip en hover durante creación. */
function handleMouseMove(point, cx, cy, shift = false) {
  const state = AppState.measure;
  if (!state?.active || !state.p1 || !point) return;

  const snapped = _snapEndpoint(state.p1, point, shift);
  state.snappedP2 = snapped;

  const pos = guideLine.geometry.attributes.position;
  pos.setXYZ(0, state.p1.x,  Y, state.p1.z);
  pos.setXYZ(1, snapped.x,   Y, snapped.z);
  pos.needsUpdate = true;
  guideLine.geometry.computeBoundingSphere();

  const dx = snapped.x - state.p1.x, dz = snapped.z - state.p1.z;
  _showTooltip(_fmt(Math.sqrt(dx*dx + dz*dz)), cx, cy);
}

/* ════════════════════════════════════════════
   API PÚBLICA — INTERACCIÓN (edición)
   ════════════════════════════════════════════ */

function isDraggingHandle() { return drag !== null; }

/**
 * Clic en modo normal (no creación). Devuelve true si el evento fue consumido.
 * @param {THREE.Vector3} point  punto 3D (dragPlane intersection)
 */
function handleInteractionPointerDown(point) {
  if (!point || !annotations.length) return false;

  // 1) Comprobar handles de la anotación seleccionada
  if (selectedId !== null) {
    const ann = _find(selectedId);
    if (ann) {
      // Handle P1
      if (_d2(point, ann.p1) < HIT) {
        drag = { annId: selectedId, type: 'p1' };
        return true;
      }
      // Handle P2
      if (_d2(point, ann.p2) < HIT) {
        drag = { annId: selectedId, type: 'p2' };
        return true;
      }
      // Handle central (rotación)
      const cx = (ann.p1.x + ann.p2.x) / 2, cz = (ann.p1.z + ann.p2.z) / 2;
      if (_d2(point, { x: cx, z: cz }) < HIT) {
        const dx = ann.p2.x - ann.p1.x, dz = ann.p2.z - ann.p1.z;
        drag = { annId: selectedId, type: 'center', halfLen: Math.sqrt(dx*dx+dz*dz) / 2 };
        return true;
      }
    }
  }

  // 2) Seleccionar una anotación al hacer clic sobre ella
  for (const ann of annotations) {
    if (_hitTest(point, ann)) {
      _select(ann.id);
      return true;
    }
  }

  // 3) Clic en vacío → deseleccionar
  if (selectedId !== null) {
    _deselect();
  }
  return false;
}

/** Mueve el handle activo. Llamar desde onPointerMove cuando isDraggingHandle(). */
function handleInteractionPointerMove(point, event) {
  if (!drag || !point) return;
  const ann = _find(drag.annId);
  if (!ann) { drag = null; return; }

  const sh = event?.shiftKey || false;

  if (drag.type === 'p1') {
    ann.p1 = _snapEndpoint(ann.p2, point, sh);
  } else if (drag.type === 'p2') {
    ann.p2 = _snapEndpoint(ann.p1, point, sh);
  } else {
    // Rotación desde el centro
    const cx = (ann.p1.x + ann.p2.x) / 2, cz = (ann.p1.z + ann.p2.z) / 2;
    const { p1, p2 } = _snapRotation({ x: cx, z: cz }, point, drag.halfLen, sh);
    ann.p1 = p1; ann.p2 = p2;
  }

  _rebuild(ann);
}

function handleInteractionPointerUp() {
  drag = null;
}

/** Borra la anotación seleccionada. Devuelve true si se borró algo. */
function deleteSelected() {
  if (selectedId === null) return false;
  const idx = annotations.findIndex(a => a.id === selectedId);
  if (idx === -1) return false;

  const ann = annotations[idx];
  annotationsGroup.remove(ann.group);
  ann.group.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
  annotations.splice(idx, 1);
  selectedId = null;
  return true;
}

/** Elimina todas las anotaciones. */
function clearAll() {
  if (!annotationsGroup) return;
  while (annotationsGroup.children.length) {
    const c = annotationsGroup.children[0];
    annotationsGroup.remove(c);
    c.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
  }
  annotations.length = 0;
  selectedId = null;
}

/* ════════════════════════════════════════════
   GEOMETRÍA
   ════════════════════════════════════════════ */

function _createAnnotation(p1, p2) {
  const group = new THREE.Group();
  group.renderOrder = 948;
  const ann = { id: nextId++, p1: { ...p1 }, p2: { ...p2 }, group };
  annotations.push(ann);
  annotationsGroup.add(group);
  _rebuild(ann);
}

function _rebuild(ann) {
  // Limpiar geometría anterior
  while (ann.group.children.length) {
    const c = ann.group.children[0];
    ann.group.remove(c);
    c.geometry?.dispose();
    c.material?.dispose();
  }

  const { p1, p2 } = ann;
  const dx = p2.x - p1.x, dz = p2.z - p1.z;
  const dist = Math.sqrt(dx*dx + dz*dz);
  if (dist < 0.01) return;

  const isSel  = ann.id === selectedId;
  const color  = isSel ? C_SEL : C_ANN;
  const v1     = new THREE.Vector3(p1.x, Y, p1.z);
  const v2     = new THREE.Vector3(p2.x, Y, p2.z);
  const dir    = v2.clone().sub(v1).normalize();

  // ── Línea de cota ──
  const ln = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([v1, v2]),
    new THREE.LineBasicMaterial({ color, depthTest: false })
  );
  ln.renderOrder = 948;
  ann.group.add(ln);

  // ── Flechas ──
  ann.group.add(_arrow(p1.x, Y, p1.z, dir.clone().negate(), color));
  ann.group.add(_arrow(p2.x, Y, p2.z, dir, color));

  // ── Etiqueta ──
  const sp = _label(_fmt(dist), isSel);
  sp.position.set((p1.x+p2.x)/2, Y + 0.22, (p1.z+p2.z)/2);
  ann.group.add(sp);

  // ── Handles (solo si seleccionado) ──
  if (isSel) {
    ann.group.add(_handleEndpoint(p1.x, Y_H, p1.z));
    ann.group.add(_handleEndpoint(p2.x, Y_H, p2.z));
    ann.group.add(_handleCenter((p1.x+p2.x)/2, Y_H+0.005, (p1.z+p2.z)/2));
  }
}

function _arrow(cx, cy, cz, dir, color) {
  const fwd   = dir.clone().normalize();
  const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  const tip   = new THREE.Vector3(cx + fwd.x*ARL, cy, cz + fwd.z*ARL);
  const l     = new THREE.Vector3(cx - right.x*ARH, cy, cz - right.z*ARH);
  const r     = new THREE.Vector3(cx + right.x*ARH, cy, cz + right.z*ARH);

  const geo  = new THREE.BufferGeometry().setFromPoints([tip, l, r]);
  geo.setIndex([0,1,2]);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo,
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, depthTest: false }));
  mesh.renderOrder = 949;
  return mesh;
}

function _label(text, selected) {
  const W = 512, H = 88;
  const cv  = document.createElement('canvas');
  cv.width  = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const bg  = selected ? '#3b82f6' : 'rgba(17,17,17,0.88)';

  const r = 12;
  ctx.clearRect(0,0,W,H);
  ctx.beginPath();
  ctx.moveTo(r,0); ctx.lineTo(W-r,0); ctx.quadraticCurveTo(W,0,W,r);
  ctx.lineTo(W,H-r); ctx.quadraticCurveTo(W,H,W-r,H);
  ctx.lineTo(r,H); ctx.quadraticCurveTo(0,H,0,H-r);
  ctx.lineTo(0,r); ctx.quadraticCurveTo(0,0,r,0);
  ctx.closePath();
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.font = 'bold 42px "JetBrains Mono",monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(text, W/2, H/2);

  const tex    = new THREE.CanvasTexture(cv);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(3.0, 0.52, 1);
  sprite.renderOrder = 952;
  return sprite;
}

/** Handle de extremo: aro azul + disco blanco interior. */
function _handleEndpoint(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);

  // Aro exterior azul
  const ringGeo = new THREE.RingGeometry(HR * 0.58, HR, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo,
    new THREE.MeshBasicMaterial({ color: C_SEL, side: THREE.DoubleSide, depthTest: false }));
  ring.renderOrder = 961;

  // Disco interior blanco
  const discGeo = new THREE.CircleGeometry(HR * 0.56, 24);
  discGeo.rotateX(-Math.PI / 2);
  const disc = new THREE.Mesh(discGeo,
    new THREE.MeshBasicMaterial({ color: C_WHT, side: THREE.DoubleSide, depthTest: false }));
  disc.renderOrder = 962;

  g.add(ring, disc);
  return g;
}

/** Handle central de rotación: sprite con icono de giro. */
function _handleCenter(x, y, z) {
  const S = 128;
  const cv  = document.createElement('canvas');
  cv.width  = S; cv.height = S;
  const ctx = cv.getContext('2d');
  const cx  = S/2, cy = S/2, R = S*0.38;

  ctx.clearRect(0, 0, S, S);

  // Fondo circular azul
  ctx.beginPath();
  ctx.arc(cx, cy, S*0.42, 0, Math.PI*2);
  ctx.fillStyle = '#3b82f6';
  ctx.fill();

  // Arco de rotación blanco
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0.4, Math.PI*2 - 0.4);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = S * 0.09;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Punta de flecha (arrowhead del arco)
  const ax = cx + R * Math.cos(0.4), az = cy + R * Math.sin(0.4);
  ctx.beginPath();
  ctx.moveTo(ax - S*0.06, az - S*0.13);
  ctx.lineTo(ax + S*0.11, az - S*0.02);
  ctx.lineTo(ax - S*0.02, az + S*0.13);
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();

  const tex    = new THREE.CanvasTexture(cv);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.position.set(x, y, z);
  sprite.scale.set(HR * 2.6, HR * 2.6, 1);
  sprite.renderOrder = 963;
  return sprite;
}

/* ════════════════════════════════════════════
   LÓGICA DE SNAP Y SELECCIÓN
   ════════════════════════════════════════════ */

/** Mueve un extremo libre hacia `cursor`, con snap de ángulo 45° si !shift. */
function _snapEndpoint(fixed, cursor, shift) {
  const dx = cursor.x - fixed.x, dz = cursor.z - fixed.z;
  const dist = Math.sqrt(dx*dx + dz*dz);
  if (dist < 0.001) return { x: cursor.x, z: cursor.z };

  let angle = Math.atan2(dz, dx);
  if (!shift) angle = Math.round(angle / SNAP_RAD) * SNAP_RAD;

  return {
    x: fixed.x + dist * Math.cos(angle),
    z: fixed.z + dist * Math.sin(angle)
  };
}

/** Rota la línea desde su centro hacia `cursor`, snap 45° si !shift. */
function _snapRotation(center, cursor, halfLen, shift) {
  const dx = cursor.x - center.x, dz = cursor.z - center.z;
  let angle = Math.atan2(dz, dx);
  if (!shift) angle = Math.round(angle / SNAP_RAD) * SNAP_RAD;

  return {
    p1: { x: center.x - halfLen * Math.cos(angle), z: center.z - halfLen * Math.sin(angle) },
    p2: { x: center.x + halfLen * Math.cos(angle), z: center.z + halfLen * Math.sin(angle) }
  };
}

/** Distancia 2D (metros) entre punto y extremo de anotación. */
function _d2(pt, ep) {
  const dx = pt.x - ep.x, dz = pt.z - ep.z;
  return Math.sqrt(dx*dx + dz*dz);
}

/** True si el punto está sobre la línea de la anotación (dentro de LINE_H metros). */
function _hitTest(pt, ann) {
  return _distToSeg(pt.x, pt.z, ann.p1.x, ann.p1.z, ann.p2.x, ann.p2.z) < LINE_H;
}

function _distToSeg(px, pz, ax, az, bx, bz) {
  const dx = bx-ax, dz = bz-az, len2 = dx*dx+dz*dz;
  if (len2 === 0) return Math.sqrt((px-ax)**2 + (pz-az)**2);
  const t = Math.max(0, Math.min(1, ((px-ax)*dx + (pz-az)*dz) / len2));
  return Math.sqrt((px-(ax+t*dx))**2 + (pz-(az+t*dz))**2);
}

function _find(id) { return annotations.find(a => a.id === id) || null; }

function _select(id) {
  const prev = selectedId;
  selectedId = id;
  if (prev !== null) { const a = _find(prev); if (a) _rebuild(a); }
  if (id !== null)   { const a = _find(id);   if (a) _rebuild(a); }
}

function _deselect() {
  if (selectedId === null) return;
  const prev = selectedId;
  selectedId = null;
  const a = _find(prev);
  if (a) _rebuild(a);
}

/* ════════════════════════════════════════════
   HELPERS UI
   ════════════════════════════════════════════ */

function _fmt(m) { return m >= 10 ? `${m.toFixed(1)} m` : `${m.toFixed(2)} m`; }

function _showTooltip(text, cx, cy) {
  const el = document.getElementById('measure-tooltip');
  if (!el) return;
  el.textContent  = text;
  el.style.left   = (cx + 16) + 'px';
  el.style.top    = (cy - 28) + 'px';
  el.style.display = 'block';
}

function _hideTooltip() {
  const el = document.getElementById('measure-tooltip');
  if (el) el.style.display = 'none';
}

function _banner(msg) {
  const el   = document.getElementById('measure-banner');
  const text = document.getElementById('measure-banner-text');
  if (text) text.textContent = msg;
  if (el)   el.style.display = 'flex';
}

function _hideBanner() {
  const el = document.getElementById('measure-banner');
  if (el) el.style.display = 'none';
}

/* ════════════════════════════════════════════
   EXPORT
   ════════════════════════════════════════════ */
export const MeasureManager = {
  // Creación
  isActive,
  start,
  cancel,
  handleClick,
  handleMouseMove,
  // Interacción (edición)
  isDraggingHandle,
  handleInteractionPointerDown,
  handleInteractionPointerMove,
  handleInteractionPointerUp,
  deleteSelected,
  clearAll,
};
