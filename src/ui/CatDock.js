/* CatDock — gato animado que camina sobre el dock */

const SPRITE_URL = '/sprites/pepecat.png';
// Sprite real: 4465×3347 px, celda 1116.25×1116.25 (4 cols × 3 filas)
// Mostrar a 60px de alto: scale = 60/1116.25
const CELL_W = 60;   // 1116.25 × scale (celda cuadrada)
const CELL_H = 60;
const SHEET_W = 240; // 4465 × scale
const SHEET_H = 180; // 3347 × scale
const FPS = 7;
const WALK_PX_PER_S = 48;

// background-positions para cada frame (celdas de 60×60 px en pantalla)
const FRAMES = {
  anda1: '0px 0px',
  anda2: '-60px 0px',
  anda3: '-120px 0px',
  anda4: '-180px 0px',
  tumba: '0px -60px',
  boca:  '-60px -60px',
};

const WALK_FRAMES = ['anda1', 'anda2', 'anda3', 'anda4'];

const css = `
#cat-dock-wrap {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0;
}
#cat-sprite {
  position: absolute;
  width: ${CELL_W}px;
  height: ${CELL_H}px;
  bottom: 0px;
  background-image: url('${SPRITE_URL}');
  background-size: ${SHEET_W}px ${SHEET_H}px;
  background-repeat: no-repeat;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  pointer-events: auto;
  cursor: pointer;
  transition: none;
  will-change: transform, left;
}
`;

let _el      = null;   // #cat-sprite DOM element
let _wrap    = null;   // #cat-dock-wrap DOM element
let _dock    = null;   // #dock element

// --- state machine ---
// states: 'walk' | 'turn_start' | 'rest' | 'turn_end' | 'hover_enter' | 'hover' | 'hover_leave'
let _state       = 'walk';
let _dir         = 1;          // 1 = derecha, -1 = izquierda
let _x           = 0;          // posición actual en px desde left del dock
let _walkFrame   = 0;
let _frameTimer  = null;
let _stateTimer  = null;
let _hoverTimer  = null;
let _raf         = null;
let _lastTs      = null;
let _hovered     = false;
let _dockLeft    = 0;
let _dockWidth   = 0;

function injectStyles() {
  if (document.getElementById('cat-dock-css')) return;
  const style = document.createElement('style');
  style.id = 'cat-dock-css';
  style.textContent = css;
  document.head.appendChild(style);
}

function buildDOM() {
  _wrap = document.createElement('div');
  _wrap.id = 'cat-dock-wrap';

  _el = document.createElement('div');
  _el.id = 'cat-sprite';
  _wrap.appendChild(_el);
  document.body.appendChild(_wrap);

  _el.addEventListener('mouseenter', onMouseEnter);
  _el.addEventListener('mousemove',  onMouseMove);
  _el.addEventListener('mouseleave', onMouseLeave);
}

function setFrame(name) {
  _el.style.backgroundPosition = FRAMES[name];
}

function setDir(d) {
  _dir = d;
  _el.style.transform = d === 1 ? 'scaleX(1)' : 'scaleX(-1)';
}

function measureDock() {
  if (!_dock) return;
  const r = _dock.getBoundingClientRect();
  _dockLeft  = r.left;
  _dockWidth = r.width;
}

function positionCatOnDock() {
  if (!_dock || !_el) return;
  measureDock();
  // coloca el gato sobre el dock, superpuesto en su borde superior
  const dockR = _dock.getBoundingClientRect();
  // _el bottom = borde superior del dock → bottom desde viewport bottom
  const bottomFromBottom = window.innerHeight - dockR.top + 4;
  _wrap.style.bottom = `${bottomFromBottom}px`;
  applyX();
}

function applyX() {
  _el.style.left = `${_dockLeft + _x}px`;
}

// ─── state handlers ───────────────────────────────────────────────────────────

function startWalk() {
  _state = 'walk';
  startFrameLoop();
  tickRAF();
}

function startFrameLoop() {
  stopFrameLoop();
  let fi = 0;
  setFrame(WALK_FRAMES[fi]);
  _frameTimer = setInterval(() => {
    fi = (fi + 1) % WALK_FRAMES.length;
    setFrame(WALK_FRAMES[fi]);
  }, 1000 / FPS);
}

function stopFrameLoop() {
  if (_frameTimer) { clearInterval(_frameTimer); _frameTimer = null; }
}

function stopStateTimer() {
  if (_stateTimer) { clearTimeout(_stateTimer); _stateTimer = null; }
}

function stopHoverTimer() {
  if (_hoverTimer) { clearTimeout(_hoverTimer); _hoverTimer = null; }
}

// Llegó al borde: tumba → boca (5s) → tumba → flip → walk
function atEdge() {
  _state = 'turn_start';
  stopFrameLoop();
  setFrame('tumba');
  _stateTimer = setTimeout(() => {
    setFrame('boca');
    _stateTimer = setTimeout(() => {
      setFrame('tumba');
      _stateTimer = setTimeout(() => {
        setDir(-_dir);
        startWalk();
      }, 600);
    }, 5000);
  }, 500);
}

function tickRAF(ts) {
  if (_state !== 'walk') {
    _raf = null;
    _lastTs = null;
    return;
  }
  if (_lastTs === null) _lastTs = ts ?? performance.now();
  const dt = Math.min((ts - _lastTs) / 1000, 0.1);
  _lastTs = ts;

  measureDock();
  _x += _dir * WALK_PX_PER_S * dt;

  const minX = 0;
  const maxX = _dockWidth - CELL_W;

  if (_x >= maxX) {
    _x = maxX;
    applyX();
    stopFrameLoop();
    atEdge();
    return;
  }
  if (_x <= minX) {
    _x = minX;
    applyX();
    stopFrameLoop();
    atEdge();
    return;
  }

  applyX();
  _raf = requestAnimationFrame(tickRAF);
}

// ─── hover handlers ───────────────────────────────────────────────────────────

function onMouseEnter() {
  if (_hovered) return;
  _hovered = true;
  stopHoverTimer();
  stopStateTimer();
  stopFrameLoop();
  if (_raf) { cancelAnimationFrame(_raf); _raf = null; _lastTs = null; }

  _state = 'hover';
  setFrame('tumba');
  setTimeout(() => { if (_hovered) setFrame('boca'); }, 500);
}

function onMouseMove() {
  if (!_hovered) return;
  stopHoverTimer();
}

function onMouseLeave() {
  if (!_hovered) return;
  stopHoverTimer();
  _hoverTimer = setTimeout(leaveHover, 5000);
}

function leaveHover() {
  _hovered = false;
  setFrame('tumba');
  setTimeout(() => {
    _state = 'walk';
    startFrameLoop();
    _lastTs = null;
    _raf = requestAnimationFrame(tickRAF);
  }, 500);
}

// ─── public API ───────────────────────────────────────────────────────────────

export const CatDock = {
  init() {
    _dock = document.getElementById('dock');
    if (!_dock) return;

    injectStyles();
    buildDOM();
    measureDock();

    // posición inicial: cerca del borde izquierdo
    _x = CELL_W * 0.5;
    setDir(1);
    positionCatOnDock();

    // INIT: boca → tumba → walk
    setFrame('boca');
    _stateTimer = setTimeout(() => {
      setFrame('tumba');
      _stateTimer = setTimeout(() => {
        startWalk();
      }, 600);
    }, 1200);

    window.addEventListener('resize', () => {
      positionCatOnDock();
    });
  }
};
