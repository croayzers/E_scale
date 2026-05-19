/* ─────────────────────────────────────────────────────────
   ARBUSTO — Vegetación baja, poligonal low-poly
   ────────────────────────────────────────────────────────
   item.dims: { width, height }
   item.color: hex string (#RRGGBB)
   ───────────────────────────────────────────────────────── */

export function createArbusto(item) {
  const group = new THREE.Group();

  const width  = item.dims?.width  ?? 1.5;   // diámetro
  const height = item.dims?.height ?? 1.0;   // alto total
  const color  = parseHex(item.color ?? '#3e7a3a');

  // ── Cuerpo principal: icosaedro escalado ──
  const mainGeo = new THREE.IcosahedronGeometry(width / 2, 1);
  const mainMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true
  });
  const main = new THREE.Mesh(mainGeo, mainMat);
  // Escalamos en Y para ajustar a la altura pedida
  main.scale.y = (height / width) * 1.0;
  main.position.y = (height * main.scale.y) / 2;
  main.castShadow = true;
  main.receiveShadow = true;
  main.userData.baseColor = color;
  main.userData.isMain = true;
  group.add(main);

  // ── Dos bultos secundarios para romper la simetría ──
  const bumpGeo = new THREE.IcosahedronGeometry(width * 0.3, 0);
  [[ width * 0.25,  height * 0.55,  width * 0.1],
   [-width * 0.22,  height * 0.45, -width * 0.15]].forEach(([x, y, z]) => {
    const bump = new THREE.Mesh(bumpGeo, mainMat.clone());
    bump.position.set(x, y, z);
    bump.castShadow = true;
    bump.userData.baseColor = color;
    group.add(bump);
  });

  return group;
}

function parseHex(hex) {
  return parseInt((hex || '#3e7a3a').replace('#', ''), 16);
}
