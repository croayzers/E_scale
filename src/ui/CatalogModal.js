/* ─────────────────────────────────────────────────────────
   CATALOG MODAL — Modal flotante con tarjetas por categoría
   ───────────────────────────────────────────────────────── */

import { AppState }       from '../core/AppState.js';
import { ElementLibrary } from '../core/ElementLibrary.js';

let currentCategory = null;

function init() {
  document.getElementById('catalog-close')?.addEventListener('click', close);

  // Cerrar al pulsar fuera
  document.addEventListener('click', e => {
    const modal = document.getElementById('catalog-modal');
    const dock = document.getElementById('dock');
    if (!modal || modal.classList.contains('hidden')) return;
    if (modal.contains(e.target) || dock.contains(e.target)) return;
    close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}

function open(categoryKey) {
  currentCategory = categoryKey;
  const modal = document.getElementById('catalog-modal');
  const grid  = document.getElementById('catalog-grid');
  if (!modal || !grid) return;

  const items = ElementLibrary.data[categoryKey] || [];
  if (items.length === 0) {
    grid.innerHTML = `<div class="col-span-4 text-center py-8 mono text-[11px]" style="color:var(--muted)">No hay elementos en esta categoría todavía.</div>`;
  } else {
    grid.innerHTML = items.map(def => `
      <div class="cat-card" data-element-id="${def.id}">
        <div class="cat-thumb">${thumbSVG(def)}</div>
        <div class="cat-name">${def.name}</div>
      </div>
    `).join('');

    grid.querySelectorAll('.cat-card').forEach(card => {
      card.addEventListener('click', () => {
        const def = items.find(d => d.id === card.dataset.elementId);
        if (def) {
          AppState.add(ElementLibrary.toItem(def));
          document.body.classList.add('has-items');
          // No cerramos para permitir añadir varios
        }
      });
    });
  }

  modal.classList.remove('hidden');
}

function close() {
  const modal = document.getElementById('catalog-modal');
  if (modal) modal.classList.add('hidden');
  currentCategory = null;
  // Quitar active del dock
  document.querySelectorAll('#dock-items button').forEach(b => b.classList.remove('active'));
}

function isOpen() {
  return !document.getElementById('catalog-modal')?.classList.contains('hidden');
}

/* ─── Generador de thumbnails SVG 2.5D según tipo ─── */
function thumbSVG(def) {
  const t = def.type;
  if (t === 'mesa') {
    if (def.subtype === 'presi') return svgRect('#e6e2da');
    return svgCircle('#e6e2da');
  }
  if (t === 'buffet')        return svgLongRect('#e6e2da');
  if (t === 'carpa')         return svgTent('#d4b78b');
  if (t === 'arbusto')       return svgBush('#6fa86a');
  if (t === 'arbol')         return svgTree('#4a8d50', '#7a4f2a');
  if (t === 'cableLuces')    return svgLights('#f4c95d');
  if (t === 'room')          return svgRoom('#dddddd');
  if (t === 'sillaCatering') return svgChair(def.color || '#cccccc', def.subtype);
  if (t === 'sillaLineal')   return svgChairLineal(def.color || '#cccccc');
  return svgPlaceholder();
}

function svgCircle(fill) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="62" rx="34" ry="10" fill="rgba(0,0,0,0.08)"/>
    <circle cx="50" cy="50" r="34" fill="${fill}" stroke="rgba(0,0,0,0.15)" stroke-width="0.8"/>
    <ellipse cx="44" cy="42" rx="14" ry="6" fill="white" opacity="0.5"/>
  </svg>`;
}

function svgRect(fill) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="58" width="60" height="6" fill="rgba(0,0,0,0.08)" rx="2"/>
    <rect x="22" y="32" width="56" height="28" fill="${fill}" stroke="rgba(0,0,0,0.15)" stroke-width="0.8" rx="3"/>
    <rect x="28" y="36" width="22" height="6" fill="white" opacity="0.5" rx="2"/>
  </svg>`;
}

function svgLongRect(fill) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="56" width="84" height="6" fill="rgba(0,0,0,0.08)" rx="2"/>
    <rect x="10" y="38" width="80" height="20" fill="${fill}" stroke="rgba(0,0,0,0.15)" stroke-width="0.8" rx="2"/>
    <rect x="14" y="40" width="20" height="4" fill="white" opacity="0.5" rx="1"/>
  </svg>`;
}

function svgTent(fill) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="78" rx="38" ry="6" fill="rgba(0,0,0,0.08)"/>
    <polygon points="50,18 88,62 12,62" fill="${fill}" stroke="rgba(0,0,0,0.18)" stroke-width="0.8"/>
    <polygon points="50,18 88,62 50,52" fill="rgba(0,0,0,0.08)"/>
    <line x1="50" y1="18" x2="50" y2="62" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"/>
  </svg>`;
}

function svgBush(fill) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="80" rx="30" ry="4" fill="rgba(0,0,0,0.1)"/>
    <circle cx="38" cy="58" r="18" fill="${fill}"/>
    <circle cx="62" cy="56" r="20" fill="${fill}"/>
    <circle cx="50" cy="46" r="16" fill="${fill}"/>
    <circle cx="42" cy="44" r="6" fill="white" opacity="0.25"/>
  </svg>`;
}

function svgTree(crown, trunk) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="86" rx="22" ry="3" fill="rgba(0,0,0,0.1)"/>
    <rect x="46" y="58" width="8" height="28" fill="${trunk}"/>
    <circle cx="40" cy="40" r="18" fill="${crown}"/>
    <circle cx="58" cy="36" r="20" fill="${crown}"/>
    <circle cx="50" cy="26" r="14" fill="${crown}"/>
    <circle cx="44" cy="26" r="5" fill="white" opacity="0.25"/>
  </svg>`;
}

function svgLights(bulb) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 30 Q 50 60 90 30" stroke="#2a2a2c" stroke-width="1.2" fill="none"/>
    ${[15,30,45,60,75,90].map((x,i) => {
      const t = i/5;
      const y = 30 + 30*4*t*(1-t);
      return `<circle cx="${x}" cy="${y+4}" r="3.5" fill="${bulb}"/>
              <circle cx="${x-1}" cy="${y+3}" r="1" fill="white" opacity="0.6"/>`;
    }).join('')}
  </svg>`;
}

function svgRoom(fill) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="20,30 80,30 88,40 88,75 12,75 12,40" fill="${fill}" stroke="rgba(0,0,0,0.25)" stroke-width="0.8"/>
    <polygon points="20,30 12,40 12,75 20,70" fill="rgba(0,0,0,0.08)"/>
    <polygon points="80,30 88,40 88,75 80,70" fill="rgba(0,0,0,0.05)"/>
    <rect x="40" y="48" width="20" height="22" fill="rgba(0,0,0,0.12)"/>
  </svg>`;
}

function svgChair(fill, subtype) {
  const back = subtype === 'tolix'
    ? `<path d="M 32 26 Q 50 22 68 26 L 68 50 Q 50 46 32 50 Z" fill="${fill}" stroke="rgba(0,0,0,0.2)" stroke-width="0.6"/>`
    : `<rect x="32" y="22" width="36" height="28" fill="${fill}" stroke="rgba(0,0,0,0.18)" stroke-width="0.6" rx="3"/>`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="82" rx="22" ry="3" fill="rgba(0,0,0,0.1)"/>
    ${back}
    <rect x="32" y="50" width="36" height="6" fill="${fill}" stroke="rgba(0,0,0,0.2)" stroke-width="0.6"/>
    <line x1="36" y1="56" x2="36" y2="78" stroke="rgba(0,0,0,0.5)" stroke-width="1.5"/>
    <line x1="64" y1="56" x2="64" y2="78" stroke="rgba(0,0,0,0.5)" stroke-width="1.5"/>
    <line x1="38" y1="56" x2="38" y2="78" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
    <line x1="62" y1="56" x2="62" y2="78" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
  </svg>`;
}

function svgChairLineal(fill) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="82" rx="38" ry="3" fill="rgba(0,0,0,0.1)"/>
    ${[18,38,58,78].map(x => `
      <rect x="${x-7}" y="30" width="14" height="22" fill="${fill}" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" rx="2"/>
      <rect x="${x-7}" y="52" width="14" height="4" fill="${fill}" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"/>
      <line x1="${x-5}" y1="56" x2="${x-5}" y2="76" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>
      <line x1="${x+5}" y1="56" x2="${x+5}" y2="76" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>
    `).join('')}
  </svg>`;
}

function svgPlaceholder() {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="60" height="60" fill="#e6e2da" stroke="rgba(0,0,0,0.15)" stroke-width="0.8" rx="6"/>
  </svg>`;
}

export const CatalogModal = { init, open, close, isOpen };