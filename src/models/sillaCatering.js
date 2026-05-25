/* ─────────────────────────────────────────────────────────
   SILLA CATERING — 4 subtipos: plegable, chiavari, tiffany, tolix
   item.subtype: 'plegable' | 'chiavari' | 'tiffany' | 'tolix'
   item.dims: { width, depth, seatHeight, totalHeight }
   item.color: hex
   ───────────────────────────────────────────────────────── */

export function createSillaCatering(item) {
  const sub = item.subtype || 'plegable';
  const W   = item.dims?.width        ?? 0.44;
  const D   = item.dims?.depth        ?? 0.44;
  const SH  = item.dims?.seatHeight   ?? 0.45;
  const TH  = item.dims?.totalHeight  ?? 0.92;
  const color = parseHex(item.color || defaultColor(sub));

  switch (sub) {
    case 'chiavari': return buildChiavari(W, D, SH, TH, color);
    case 'tiffany':  return buildTiffany(W, D, SH, TH, color);
    case 'tolix':    return buildTolix(W, D, SH, TH, color);
    default:         return buildPlegable(W, D, SH, TH, color);
  }
}

function defaultColor(sub) {
  return sub === 'tolix' ? '#3a4d5c'
       : sub === 'chiavari' ? '#c9a55a'
       : sub === 'tiffany'  ? '#d4c89a'
       : '#f5f3ee';
}

/* ─── PLEGABLE PLÁSTICO ─── */
function buildPlegable(W, D, SH, TH, color) {
  const g = new THREE.Group();
  const seatMat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, flatShading: true });
  const legMat  = new THREE.MeshStandardMaterial({ color: 0x6b6864, roughness: 0.4, metalness: 0.7, flatShading: true });

  // Asiento
  const seat = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), seatMat);
  seat.position.y = SH;
  seat.castShadow = true; seat.receiveShadow = true;
  seat.userData.baseColor = color; seat.userData.isMain = true;
  g.add(seat);

  // Respaldo recto
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, TH - SH - 0.04, 0.03), seatMat.clone());
  back.position.set(0, SH + (TH - SH) / 2, D/2 - 0.015);
  back.castShadow = true;
  back.userData.baseColor = color;
  g.add(back);

  // 4 patas tubeías Ø 1.8 cm
  const legGeo = new THREE.CylinderGeometry(0.009, 0.009, SH, 8);
  const offX = W/2 - 0.04, offZ = D/2 - 0.04;
  [[-offX,-offZ],[offX,-offZ],[-offX,offZ],[offX,offZ]].forEach(([x,z]) => {
    const l = new THREE.Mesh(legGeo, legMat.clone());
    l.position.set(x, SH/2, z); l.castShadow = true;
    l.userData.baseColor = 0x6b6864;
    g.add(l);
  });

  return g;
}

/* ─── CHIAVARI (dorada con barrotes verticales) ─── */
function buildChiavari(W, D, SH, TH, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.55, flatShading: true });

  // Asiento
  const seat = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), mat.clone());
  seat.position.y = SH;
  seat.castShadow = true; seat.receiveShadow = true;
  seat.userData.baseColor = color; seat.userData.isMain = true;
  g.add(seat);

  // Barra superior del respaldo — en +Z (misma convención que chair.js: respaldo en +Z)
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, 0.03, 0.03), mat.clone());
  topBar.position.set(0, TH - 0.02, D/2 - 0.03);
  topBar.castShadow = true;
  topBar.userData.baseColor = color;
  g.add(topBar);

  // 5 barrotes verticales
  const barH = TH - SH - 0.06;
  const barGeo = new THREE.CylinderGeometry(0.008, 0.008, barH, 8);
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const x = -(W/2 - 0.05) + t * (W - 0.10);
    const bar = new THREE.Mesh(barGeo, mat.clone());
    bar.position.set(x, SH + barH/2 + 0.02, D/2 - 0.025);
    bar.castShadow = true;
    bar.userData.baseColor = color;
    g.add(bar);
  }

  // 4 patas cónicas
  const legGeo = new THREE.CylinderGeometry(0.010, 0.018, SH, 8);
  const offX = W/2 - 0.035, offZ = D/2 - 0.035;
  [[-offX,-offZ],[offX,-offZ],[-offX,offZ],[offX,offZ]].forEach(([x,z]) => {
    const l = new THREE.Mesh(legGeo, mat.clone());
    l.position.set(x, SH/2, z); l.castShadow = true;
    l.userData.baseColor = color;
    g.add(l);
  });

  return g;
}

/* ─── TIFFANY (transparente acrílico, similar a Chiavari) ─── */
function buildTiffany(W, D, SH, TH, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color, roughness: 0.15, metalness: 0.1,
    transparent: true, opacity: 0.55, flatShading: false
  });

  // Asiento
  const seat = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), mat.clone());
  seat.position.y = SH;
  seat.castShadow = true;
  seat.userData.baseColor = color; seat.userData.baseOpacity = 0.55; seat.userData.isMain = true;
  g.add(seat);

  // Respaldo plano — en +Z (convención canónica: respaldo en +Z, frente en -Z)
  const back = new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, TH - SH - 0.04, 0.025), mat.clone());
  back.position.set(0, SH + (TH - SH)/2, D/2 - 0.015);
  back.castShadow = true;
  back.userData.baseColor = color; back.userData.baseOpacity = 0.55;
  g.add(back);

  // 4 patas
  const legGeo = new THREE.CylinderGeometry(0.012, 0.015, SH, 8);
  const offX = W/2 - 0.035, offZ = D/2 - 0.035;
  [[-offX,-offZ],[offX,-offZ],[-offX,offZ],[offX,offZ]].forEach(([x,z]) => {
    const l = new THREE.Mesh(legGeo, mat.clone());
    l.position.set(x, SH/2, z); l.castShadow = true;
    l.userData.baseColor = color; l.userData.baseOpacity = 0.55;
    g.add(l);
  });

  return g;
}

/* ─── TOLIX (metal industrial) ─── */
function buildTolix(W, D, SH, TH, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.65, flatShading: true });

  // Asiento circular
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(W/2, W/2 - 0.02, 0.045, 16), mat.clone());
  seat.position.y = SH;
  seat.castShadow = true; seat.receiveShadow = true;
  seat.userData.baseColor = color; seat.userData.isMain = true;
  g.add(seat);

  // Respaldo plano curvado — en +Z (convención canónica: respaldo en +Z, frente en -Z)
  const backH = TH - SH - 0.05;
  const back = new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, backH, 0.03), mat.clone());
  back.position.set(0, SH + backH/2 + 0.02, D/2 - 0.02);
  back.castShadow = true;
  back.userData.baseColor = color;
  g.add(back);

  // 4 patas ligeramente inclinadas
  const legGeo = new THREE.CylinderGeometry(0.011, 0.011, SH, 8);
  const offX = W/2 - 0.04, offZ = D/2 - 0.04;
  [[-offX,-offZ],[offX,-offZ],[-offX,offZ],[offX,offZ]].forEach(([x,z]) => {
    const l = new THREE.Mesh(legGeo, mat.clone());
    l.position.set(x * 1.06, SH/2, z * 1.06);
    l.rotation.x = z > 0 ? -0.06 :  0.06;
    l.rotation.z = x > 0 ?  0.06 : -0.06;
    l.castShadow = true;
    l.userData.baseColor = color;
    g.add(l);
  });

  return g;
}

function parseHex(hex) {
  return parseInt((hex || '#cccccc').replace('#', ''), 16);
}