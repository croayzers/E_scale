/* ─────────────────────────────────────────────────────────
   SILLA LINEAL — Fila de N sillas separadas por X metros
   item.subtype:  'plegable' | 'chiavari' | 'tiffany' | 'tolix'
   item.count:    nº de sillas
   item.gap:      separación entre centros (m)
   item.dims:     mismo formato que sillaCatering
   item.color
   ───────────────────────────────────────────────────────── */

import { createSillaCatering } from './sillaCatering.js';

export function createSillaLineal(item) {
  const g = new THREE.Group();
  const count = Math.max(1, item.count ?? 6);
  const gap   = Math.max(0.30, item.gap ?? 0.55);
  const W     = item.dims?.width ?? 0.44;

  // Centramos la fila en el origen del grupo (eje X)
  const totalSpan = (count - 1) * gap;
  for (let i = 0; i < count; i++) {
    const x = -totalSpan / 2 + i * gap;
    const silla = createSillaCatering(item);
    silla.position.x = x;
    g.add(silla);
  }

  // Marcador invisible de selección (caja "hit" amplia)
  const hitGeo = new THREE.BoxGeometry(totalSpan + W, 0.05, W);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hit = new THREE.Mesh(hitGeo, hitMat);
  hit.position.y = 0.025;
  hit.userData.baseColor = parseHex(item.color || '#ffffff');
  hit.userData.isMain = true;
  g.add(hit);

  return g;
}

function parseHex(hex) { return parseInt((hex || '#ffffff').replace('#',''), 16); }