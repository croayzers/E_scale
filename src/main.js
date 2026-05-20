/* ═══════════════════════════════════════════════════════════
   E-SCALE · Bootstrap principal — UI macOS
   ═══════════════════════════════════════════════════════════ */

import { AppState }           from './core/AppState.js';
import { ElementLibrary }     from './core/ElementLibrary.js';
import { SceneManager }       from './scene/SceneManager.js';
import { InteractionManager } from './scene/InteractionManager.js';
import { SnapManager }        from './scene/SnapManager.js';
import { UIManager }          from './ui/UIManager.js';
import { PlanManager }        from './io/PlanManager.js';
import { CompanyManager }     from './io/CompanyManager.js';
import { ExportManager }      from './io/ExportManager.js';
import { Dock }               from './ui/Dock.js';
import { CatalogModal }       from './ui/CatalogModal.js';

async function bootstrap() {
  if (typeof THREE === 'undefined') {
    document.body.innerHTML = '<pre style="padding:24px;color:#b91c1c">Error: Three.js no se cargó.</pre>';
    return;
  }

  await UIManager.init();
  await SceneManager.init();

  InteractionManager.init();
  SnapManager.init();
  PlanManager.init();
  CompanyManager.init();
  ExportManager.init();
  CatalogModal.init();
  Dock.init();

  await ElementLibrary.load();

  // ── Cámara (header segmented) ──
  const camIso = document.getElementById('cam-iso');
  const camTop = document.getElementById('cam-top');
  camIso?.addEventListener('click', () => {
    SceneManager.setCamera('iso');
    camIso.classList.add('active');
    camTop.classList.remove('active');
  });
  camTop?.addEventListener('click', () => {
    SceneManager.setCamera('top');
    camTop.classList.add('active');
    camIso.classList.remove('active');
  });

  // ── Zoom slider ──
  const zoomRange = document.getElementById('zoom-range');
  const zoomPct   = document.getElementById('zoom-pct');
  zoomRange?.addEventListener('input', () => {
    const pct = parseInt(zoomRange.value, 10);
    if (zoomPct) zoomPct.textContent = pct + '%';
    SceneManager.setZoomPercent?.(pct);
  });

  // ── Stats en header ──
  const refreshHeaderStats = () => {
    const pax = AppState.items.reduce((s, i) => s + (i.chairs || 0), 0);
    const area = AppState.items
      .filter(i => i.type === 'carpa' || i.type === 'room')
      .reduce((s, i) => s + (i.dims.length || 0) * (i.dims.width || 0), 0);
    const elPax  = document.getElementById('hdr-pax');
    const elArea = document.getElementById('hdr-area');
    if (elPax)  elPax.textContent  = pax;
    if (elArea) elArea.textContent = area.toFixed(0);

    // Mostrar/ocultar empty-hint
    document.body.classList.toggle('has-items', AppState.items.length > 0);
  };
  // Hook al refresh global
  const _origRefresh = UIManager.refresh;
  UIManager.refresh = function() {
    _origRefresh.call(UIManager);
    refreshHeaderStats();
  };
  refreshHeaderStats();

  // ── Ajustes modal (⚙) ──
  const settingsModal = document.getElementById('settings-modal');
  document.getElementById('btn-settings')?.addEventListener('click', () => settingsModal.classList.add('visible'));
  document.getElementById('settings-close')?.addEventListener('click', () => settingsModal.classList.remove('visible'));
  document.getElementById('settings-done')?.addEventListener('click', () => settingsModal.classList.remove('visible'));

  // Toggles dentro de ajustes
  const snapToggle = document.getElementById('snap-toggle');
  snapToggle.checked = AppState.snap.enabled;
  snapToggle.addEventListener('change', () => {
    AppState.snap.enabled = snapToggle.checked;
    document.getElementById('status-snap').textContent = snapToggle.checked
      ? `SNAP ${AppState.snap.spacing}m` : 'SNAP OFF';
  });

  const cotasToggle = document.getElementById('cotas-toggle');
  cotasToggle.checked = AppState.showCotas;
  cotasToggle.addEventListener('change', () => {
    AppState.showCotas = cotasToggle.checked;
    SceneManager.drawCotas();
  });

  const shadowsToggle = document.getElementById('shadows-toggle');
  shadowsToggle.checked = AppState.shadows;
  shadowsToggle.addEventListener('change', () => {
    AppState.shadows = shadowsToggle.checked;
    SceneManager.applyShadowState();
  });

  // Acciones masivas
  document.getElementById('lock-all-struct')?.addEventListener('click', () => {
    const STRUCT = ['room', 'arbusto', 'arbol'];
    AppState.items.filter(i => STRUCT.includes(i.type) && !i.locked).forEach(i => AppState.toggleLock(i.id));
  });
  document.getElementById('lock-all-light')?.addEventListener('click', () => {
    AppState.items.filter(i => i.type === 'cableLuces' && !i.locked).forEach(i => AppState.toggleLock(i.id));
  });
  document.getElementById('unlock-all')?.addEventListener('click', () => {
    AppState.items.filter(i => i.locked).forEach(i => AppState.toggleLock(i.id));
  });
  document.getElementById('btn-clear')?.addEventListener('click', () => {
    if (AppState.items.length === 0) return;
    if (confirm('¿Vaciar toda la escena?')) AppState.clear();
  });

  // Imprimir
  document.getElementById('btn-print')?.addEventListener('click', () => window.print());

  if (window.lucide) lucide.createIcons();

  console.info('[E-scale] arranque OK · UI macOS');
}

window.addEventListener('load', bootstrap);