/* ─────────────────────────────────────────────────────────
   ÁRBOL — Tronco + copa poligonal
   ────────────────────────────────────────────────────────
   item.dims: { height, crownWidth }
   item.crownColor: hex
   item.trunkColor: hex
   ───────────────────────────────────────────────────────── */

export function createArbol(item) {
  const group = new THREE.Group();

  const totalH    = item.dims?.height     ?? 5.0;
  const crownW    = item.dims?.crownWidth ?? 2.5;
  const crownColor = parseHex(item.crownColor ?? '#2f6a3f');
  const trunkColor = parseHex(item.trunkColor ?? '#5a3a1f');

  const trunkH   = totalH * 0.45;
  const crownH   = totalH - trunkH;
  const trunkD   = Math.max(0.15, crownW * 0.12);

  // ── Tronco ──
  const trunkGeo = new THREE.CylinderGeometry(trunkD * 0.45, trunkD * 0.5, trunkH, 8);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: trunkColor,
    roughness: 0.9,
    flatShading: true
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  trunk.userData.baseColor = trunkColor;
  trunk.userData.isMain = true;
  group.add(trunk);

  // ── Copa: icosaedro escalado ──
  const crownGeo = new THREE.IcosahedronGeometry(crownW / 2, 1);
  const crownMat = new THREE.MeshStandardMaterial({
    color: crownColor,
    roughness: 0.95,
    flatShading: true
  });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.scale.y = (crownH / crownW) * 1.1;
  crown.position.y = trunkH + (crownH / 2);
  crown.castShadow = true;
  crown.userData.baseColor = crownColor;
  group.add(crown);

  // ── Bultos secundarios en la copa para variedad ──
  const bumpGeo = new THREE.IcosahedronGeometry(crownW * 0.28, 0);
  [[ crownW * 0.3,  trunkH + crownH * 0.6,  crownW * 0.1],
   [-crownW * 0.25, trunkH + crownH * 0.4, -crownW * 0.15],
   [ 0,             trunkH + crownH * 0.85, crownW * 0.05]].forEach(([x, y, z]) => {
    const bump = new THREE.Mesh(bumpGeo, crownMat.clone());
    bump.position.set(x, y, z);
    bump.castShadow = true;
    bump.userData.baseColor = crownColor;
    group.add(bump);
  });

  return group;
}

function parseHex(hex) {
  return parseInt((hex || '#000000').replace('#', ''), 16);
}
