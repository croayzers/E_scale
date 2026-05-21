/* ─────────────────────────────────────────────────────────
   AMBIENTE — Elementos decorativos: spot, alfombra, planta
   item.subtype: 'spot' | 'alfombra' | 'planta'
   ───────────────────────────────────────────────────────── */

export function createAmbiente(item) {
  switch (item.subtype) {
    case 'alfombra': return buildAlfombra(item);
    case 'planta':   return buildPlanta(item);
    default:         return buildSpot(item);
  }
}

/* ── SPOT DE LUZ ── */
function buildSpot(item) {
  const g = new THREE.Group();
  const H     = item.dims?.height ?? 2.0;
  const color = parseHex(item.color || '#f5f3ee');

  // Trípode 3 patas
  const legMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.5, metalness: 0.5, flatShading: true });
  const legGeo = new THREE.CylinderGeometry(0.012, 0.012, H, 8);
  [-0.25, 0, 0.25].forEach((x, i) => {
    const leg = new THREE.Mesh(legGeo, legMat.clone());
    leg.position.set(x, H/2, i === 1 ? 0.18 : -0.08);
    leg.rotation.x = i === 1 ? 0.18 : -0.08;
    leg.castShadow = true;
    leg.userData.baseColor = 0x2a2a2c;
    g.add(leg);
  });

  // Cabeza del foco (cono)
  const headMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.4, metalness: 0.6, flatShading: true });
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.22, 16), headMat);
  head.position.set(0, H + 0.11, 0);
  head.rotation.x = -0.4;
  head.castShadow = true;
  head.userData.baseColor = 0x1a1a1c;
  head.userData.isMain = true;
  g.add(head);

  // Cristal del foco (emisivo)
  const lensMat = new THREE.MeshStandardMaterial({
    color: parseHex(item.color || '#fffbe8'),
    emissive: parseHex(item.color || '#fffbe8'),
    emissiveIntensity: 0.8,
    roughness: 0.1
  });
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.055, 16), lensMat);
  lens.position.set(0, H + 0.22, 0.08);
  lens.rotation.x = -0.4;
  lens.userData.baseColor = parseHex(item.color || '#fffbe8');
  g.add(lens);

  return g;
}

/* ── ALFOMBRA ── */
function buildAlfombra(item) {
  const g = new THREE.Group();
  if (item.shape === 'round' || typeof item.dims?.diameter === 'number') return buildAlfombraRedonda(item);

  const L = item.dims?.length ?? 3.0;
  const W = item.dims?.width  ?? 2.0;
  const color = parseHex(item.color || '#8b1a1a');

  // Superficie principal
  const mat = new THREE.MeshStandardMaterial({
    color, roughness: 0.95, metalness: 0.0, flatShading: false
  });
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(L, W), mat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.008;
  rug.receiveShadow = true;
  rug.userData.baseColor = color;
  rug.userData.isMain = true;
  g.add(rug);

  // Borde decorativo
  const borderColor = parseHex(item.borderColor || '#c9a55a');
  const borderMat = new THREE.MeshStandardMaterial({ color: borderColor, roughness: 0.9 });
  const bW = 0.08;
  // 4 tiras de borde
  [
    { geo: new THREE.PlaneGeometry(L, bW), px: 0,       pz: -W/2 + bW/2 },
    { geo: new THREE.PlaneGeometry(L, bW), px: 0,       pz:  W/2 - bW/2 },
    { geo: new THREE.PlaneGeometry(bW, W), px: -L/2 + bW/2, pz: 0 },
    { geo: new THREE.PlaneGeometry(bW, W), px:  L/2 - bW/2, pz: 0 },
  ].forEach(({ geo, px, pz }) => {
    const border = new THREE.Mesh(geo, borderMat.clone());
    border.rotation.x = -Math.PI / 2;
    border.position.set(px, 0.009, pz);
    border.userData.baseColor = borderColor;
    g.add(border);
  });

  return g;
}

/* ── PLANTA DECORATIVA (maceta + arbusto) ── */
function buildAlfombraRedonda(item) {
  const g = new THREE.Group();
  const D = item.dims?.diameter ?? 2.0;
  const R = D / 2;
  const color = parseHex(item.color || '#8b1a1a');
  const borderColor = parseHex(item.borderColor || '#c9a55a');

  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    metalness: 0.0,
    flatShading: false,
    side: THREE.DoubleSide
  });
  const rug = new THREE.Mesh(new THREE.CircleGeometry(R, 64), mat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.008;
  rug.receiveShadow = true;
  rug.userData.baseColor = color;
  rug.userData.isMain = true;
  g.add(rug);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(Math.max(0.01, R - 0.08), R, 64),
    new THREE.MeshStandardMaterial({ color: borderColor, roughness: 0.9, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.009;
  ring.userData.baseColor = borderColor;
  g.add(ring);

  return g;
}

function buildPlanta(item) {
  const g = new THREE.Group();
  const H = item.dims?.height ?? 1.2;
  const potColor   = parseHex(item.potColor   || '#8b5e3c');
  const plantColor = parseHex(item.color      || '#3e7a3a');

  // Maceta (cilindro troncocónico)
  const potMat = new THREE.MeshStandardMaterial({ color: potColor, roughness: 0.8, flatShading: true });
  const potH   = H * 0.35;
  const pot    = new THREE.Mesh(new THREE.CylinderGeometry(potH * 0.55, potH * 0.42, potH, 16), potMat);
  pot.position.y = potH / 2;
  pot.castShadow = true; pot.receiveShadow = true;
  pot.userData.baseColor = potColor;
  pot.userData.isMain = true;
  g.add(pot);

  // Tierra
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.95 });
  const soil    = new THREE.Mesh(new THREE.CylinderGeometry(potH * 0.53, potH * 0.53, 0.04, 16), soilMat);
  soil.position.y = potH - 0.01;
  soil.userData.baseColor = 0x3d2b1f;
  g.add(soil);

  // Copa vegetal (icosaedro)
  const plantMat = new THREE.MeshStandardMaterial({ color: plantColor, roughness: 0.95, flatShading: true });
  const crownH = H - potH;
  const crown  = new THREE.Mesh(new THREE.IcosahedronGeometry(crownH * 0.55, 1), plantMat);
  crown.scale.y = 1.1;
  crown.position.y = potH + crownH * 0.5;
  crown.castShadow = true;
  crown.userData.baseColor = plantColor;
  g.add(crown);

  // Bultos secundarios
  const bumpGeo = new THREE.IcosahedronGeometry(crownH * 0.28, 0);
  [[-crownH*0.28, potH + crownH*0.55,  crownH*0.12],
   [ crownH*0.25, potH + crownH*0.45, -crownH*0.15]].forEach(([x,y,z]) => {
    const bump = new THREE.Mesh(bumpGeo, plantMat.clone());
    bump.position.set(x, y, z);
    bump.castShadow = true;
    bump.userData.baseColor = plantColor;
    g.add(bump);
  });

  return g;
}

function parseHex(h) { return parseInt((h || '#000000').replace('#',''),16); }
