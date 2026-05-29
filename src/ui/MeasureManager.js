/* ─────────────────────────────────────────────────────────
   MEASURE MANAGER — Herramienta "Tomar medidas" (regla 2D)
   Dibuja cotas de distancia interactivas sobre el plano.
   ───────────────────────────────────────────────────────── */

import { AppState } from '../core/AppState.js';
import { SceneManager } from '../scene/SceneManager.js';

const Y          = 0.04;    // altura sobre el plano (evita z-fighting)
const ARROW_LEN  = 0.18;    // longitud de la cabeza de flecha (m)
const ARROW_HALF = 0.07;    // semianchura base de la flecha (m)

let annotationsGroup = null;
let guideGroup       = null;
let guideLineMesh    = null;
let guideP1Dot       = null;
let _ready           = false;

/* ── Inicialización lazy (espera a que SceneManager tenga escena) ── */
function _ensureReady() {
  if (_ready) return true;
  const scene = SceneManager.scene;
  if (!scene) return false;
  _ready = true;

  // Grupo permanente: anotaciones que quedan en el plano
  annotationsGroup = new THREE.Group();
  annotationsGroup.name = 'measureAnnotations';
  scene.add(annotationsGroup);

  // Grupo temporal: línea guía mientras el usuario elige el 2.º punto
  guideGroup = new THREE.Group();
  guideGroup.name   = 'measureGuide';
  guideGroup.visible = false;
  scene.add(guideGroup);

  // Línea guía: BufferGeometry con 2 vértices actualizables en cada mousemove
  const positions = new Float32Array(6);
  const geoLine   = new THREE.BufferGeometry();
  geoLine.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const matLine = new THREE.LineBasicMaterial({ color: 0x111111, depthTest: false });
  guideLineMesh = new THREE.Line(geoLine, matLine);
  guideLineMesh.renderOrder = 950;
  guideGroup.add(guideLineMesh);

  // Dot que marca el primer punto clicado
  const dotGeo = new THREE.CircleGeometry(0.07, 16);
  dotGeo.rotateX(-Math.PI / 2);           // gira al plano XZ
  const dotMat = new THREE.MeshBasicMaterial({ color: 0x111111, depthTest: false });
  guideP1Dot = new THREE.Mesh(dotGeo, dotMat);
  guideP1Dot.renderOrder = 951;
  guideGroup.add(guideP1Dot);

  return true;
}

/* ─── API pública ─── */

function isActive() {
  return Boolean(AppState.measure?.active);
}

/** Activa el modo medición. Llamar setTopCamera() antes desde main.js. */
function start() {
  if (!_ensureReady()) return;
  AppState.measure = { active: true, p1: null };
  document.body.classList.add('cursor-measure');
  _showBanner('Haz clic en el primer punto de la medición');
}

/** Cancela el modo medición sin crear anotación. */
function cancel() {
  AppState.measure = { active: false, p1: null };
  document.body.classList.remove('cursor-measure');
  if (guideGroup) guideGroup.visible = false;
  _hideTooltip();
  _hideBanner();
}

/**
 * Gestiona un clic en el plano mientras el modo está activo.
 * Primer clic → fija P1. Segundo clic → crea anotación permanente.
 * @param {THREE.Vector3} point  punto 3D en el plano (x, z = metros reales)
 */
function handleClick(point) {
  if (!_ensureReady()) return;
  const state = AppState.measure;
  if (!state?.active) return;

  if (!state.p1) {
    // ── Primer clic: guardar origen ──
    state.p1 = { x: point.x, z: point.z };
    guideGroup.visible = true;
    guideP1Dot.position.set(point.x, Y, point.z);
    _showBanner('Haz clic en el segundo punto para fijar la medida');
  } else {
    // ── Segundo clic: crear anotación y salir del modo ──
    const p2 = { x: point.x, z: point.z };
    const dx = p2.x - state.p1.x;
    const dz = p2.z - state.p1.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist >= 0.01) {
      _buildAnnotation(state.p1, p2, dist);
    }
    cancel();
  }
}

/**
 * Actualiza la línea guía y el tooltip de distancia mientras el usuario mueve el ratón.
 * @param {THREE.Vector3|null} point   punto 3D bajo el cursor
 * @param {number} clientX
 * @param {number} clientY
 */
function handleMouseMove(point, clientX, clientY) {
  const state = AppState.measure;
  if (!state?.active || !state.p1 || !point) return;

  // Actualizar extremos de la línea guía
  const pos = guideLineMesh.geometry.attributes.position;
  pos.setXYZ(0, state.p1.x, Y, state.p1.z);
  pos.setXYZ(1, point.x,    Y, point.z);
  pos.needsUpdate = true;
  guideLineMesh.geometry.computeBoundingSphere();

  // Tooltip: distancia en tiempo real
  const dx   = point.x - state.p1.x;
  const dz   = point.z - state.p1.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  _showTooltip(_fmtDist(dist), clientX, clientY);
}

/** Elimina todas las anotaciones del plano. */
function clearAll() {
  if (!annotationsGroup) return;
  while (annotationsGroup.children.length) {
    const child = annotationsGroup.children[0];
    annotationsGroup.remove(child);
    child.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
  }
}

/* ─── Construcción de anotación permanente ─── */

function _buildAnnotation(p1, p2, dist) {
  const group = new THREE.Group();
  group.renderOrder = 948;

  const v1  = new THREE.Vector3(p1.x, Y, p1.z);
  const v2  = new THREE.Vector3(p2.x, Y, p2.z);
  const dir = v2.clone().sub(v1).normalize();   // dirección P1→P2

  // ── Línea de cota ──
  const lineGeo = new THREE.BufferGeometry().setFromPoints([v1, v2]);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x111111, depthTest: false });
  const line    = new THREE.Line(lineGeo, lineMat);
  line.renderOrder = 948;
  group.add(line);

  // ── Flechas en los extremos (apuntan hacia afuera) ──
  group.add(_makeArrow(p1.x, Y, p1.z, dir.clone().negate())); // flecha en P1
  group.add(_makeArrow(p2.x, Y, p2.z, dir));                  // flecha en P2

  // ── Etiqueta centrada ──
  const mx     = (p1.x + p2.x) / 2;
  const mz     = (p1.z + p2.z) / 2;
  const sprite = _makeLabel(_fmtDist(dist));
  sprite.position.set(mx, Y + 0.2, mz);
  group.add(sprite);

  annotationsGroup.add(group);
}

/** Triángulo de flecha plano en XZ. */
function _makeArrow(cx, cy, cz, dir) {
  const fwd   = dir.clone().normalize();
  const right = new THREE.Vector3(-fwd.z, 0, fwd.x); // perpendicular en XZ

  const tip = new THREE.Vector3(cx + fwd.x * ARROW_LEN,   cy, cz + fwd.z * ARROW_LEN);
  const lft = new THREE.Vector3(cx - right.x * ARROW_HALF, cy, cz - right.z * ARROW_HALF);
  const rgt = new THREE.Vector3(cx + right.x * ARROW_HALF, cy, cz + right.z * ARROW_HALF);

  const geo = new THREE.BufferGeometry().setFromPoints([tip, lft, rgt]);
  geo.setIndex([0, 1, 2]);
  geo.computeVertexNormals();

  const mat  = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide, depthTest: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 949;
  return mesh;
}

/** Sprite con el texto de la distancia (canvas 2D → textura Three.js). */
function _makeLabel(text) {
  const W = 512, H = 88;
  const cv  = document.createElement('canvas');
  cv.width  = W; cv.height = H;
  const ctx = cv.getContext('2d');

  // Fondo con bordes redondeados
  const r = 12;
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(W - r, 0); ctx.quadraticCurveTo(W, 0, W, r);
  ctx.lineTo(W, H - r); ctx.quadraticCurveTo(W, H, W - r, H);
  ctx.lineTo(r, H); ctx.quadraticCurveTo(0, H, 0, H - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = 'rgba(17,17,17,0.88)';
  ctx.fill();

  // Texto
  ctx.font         = 'bold 42px "JetBrains Mono", monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#ffffff';
  ctx.fillText(text, W / 2, H / 2);

  const tex    = new THREE.CanvasTexture(cv);
  const mat    = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.0, 0.52, 1);
  sprite.renderOrder = 950;
  return sprite;
}

/* ─── Helpers UI ─── */

function _fmtDist(m) {
  return m >= 10 ? `${m.toFixed(1)} m` : `${m.toFixed(2)} m`;
}

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

function _showBanner(msg) {
  const el   = document.getElementById('measure-banner');
  const text = document.getElementById('measure-banner-text');
  if (text) text.textContent = msg;
  if (el)   el.style.display = 'flex';
}

function _hideBanner() {
  const el = document.getElementById('measure-banner');
  if (el) el.style.display = 'none';
}

export const MeasureManager = {
  isActive,
  start,
  cancel,
  handleClick,
  handleMouseMove,
  clearAll,
};
