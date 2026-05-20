/* ─────────────────────────────────────────────────────────
   DOCK — Barra inferior estilo macOS con categorías
   ───────────────────────────────────────────────────────── */

import { CatalogModal } from './CatalogModal.js';

const CATEGORIES = [
  { key: 'chairs',     label: 'Sillas',      icon: 'armchair' },
  { key: 'tables',     label: 'Mesas',       icon: 'circle-dot' },
  { key: 'decor',      label: 'Carpas',      icon: 'tent' },
  { key: 'bars',       label: 'Buffets',     icon: 'utensils' },
  { key: 'freebar',    label: 'Barra libre', icon: 'wine' },
  { key: 'structures', label: 'Estructuras', icon: 'columns-3' },
  { key: 'ambient',    label: 'Ambiente',    icon: 'sparkles' },
];

function init() {
  const host = document.getElementById('dock-items');
  if (!host) return;
  host.innerHTML = '';

  CATEGORIES.forEach((cat, idx) => {
    const btn = document.createElement('button');
    btn.dataset.cat = cat.key;
    btn.title = cat.label;
    btn.innerHTML = `<i data-lucide="${cat.icon}" class="w-5 h-5"></i>`;
    btn.addEventListener('click', () => toggle(cat.key, btn));
    host.appendChild(btn);

    if (idx === CATEGORIES.length - 2) {
      const sep = document.createElement('div');
      sep.className = 'dock-sep';
      host.appendChild(sep);
    }
  });

  if (window.lucide) lucide.createIcons();
}

function toggle(key, btn) {
  const isActive = btn.classList.contains('active');
  document.querySelectorAll('#dock-items button').forEach(b => b.classList.remove('active'));

  if (isActive) {
    CatalogModal.close();
  } else {
    btn.classList.add('active');
    CatalogModal.open(key);
  }
}

export const Dock = { init };