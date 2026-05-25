/* ─────────────────────────────────────────────────────────
   BARRA LIBRE — Mesa rectangular con cubiteras en el centro
   item.dims:      { length, width, height }
   item.name:      nombre visible en cotas
   item.cubiteras: número de cubiteras
   item.cubSep:    separación entre cubiteras (m)
   item.color:     hex tela
   ───────────────────────────────────────────────────────── */

export function createBarraLibre(item) {
  const g = new THREE.Group();

  const L    = item.dims?.length  ?? 3.0;
  const W    = item.dims?.width   ?? 0.8;
  const H    = item.dims?.height  ?? 0.90;
  const nCub = Math.max(1, item.cubiteras ?? 2);
  const sep  = Math.max(0.3, item.cubSep  ?? 1.0);
  const color = parseHex(item.color || '#1a1a1c');

  // Tablero
  const topMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2c,
    roughness: 0.4,
    metalness: 0.3,
    flatShading: true
  });

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(L, 0.05, W),
    topMat
  );
  top.position.y = H + 0.025;
  top.castShadow = true;
  top.receiveShadow = true;
  top.userData.baseColor = 0x2a2a2c;
  top.userData.isMain = true;
  g.add(top);

  // Cuerpo/falda
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    flatShading: true
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(L + 0.02, H, W + 0.02),
    bodyMat
  );
  body.position.y = H / 2;
  body.castShadow = true;
  body.userData.baseColor = color;
  g.add(body);

  // Zócalo inferior
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2c,
    roughness: 0.4,
    metalness: 0.4,
    flatShading: true
  });

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(L + 0.04, 0.06, W + 0.04),
    baseMat
  );
  base.position.y = 0.04;   // sube 1 cm para que su cara inferior (y=0.01) no coincida con body (y=0)
  base.castShadow = true;
  base.userData.baseColor = 0x2a2a2c;
  g.add(base);

  // Materiales cubiteras
  const cubMat = new THREE.MeshStandardMaterial({
    color: 0x8a8682,
    roughness: 0.3,
    metalness: 0.8,
    flatShading: true
  });

  const iceMat = new THREE.MeshStandardMaterial({
    color: 0xd0eef8,
    roughness: 0.2,
    metalness: 0.0,
    transparent: true,
    opacity: 0.7
  });

  // Materiales botellas de champán
  const bottleGlassMat = new THREE.MeshStandardMaterial({
    color: 0x173b24,
    roughness: 0.35,
    metalness: 0.15,
    transparent: true,
    opacity: 0.9
  });

  const foilMat = new THREE.MeshStandardMaterial({
    color: 0xd6b75a,
    roughness: 0.25,
    metalness: 0.7
  });

  const labelMat = new THREE.MeshStandardMaterial({
    color: 0xf1ead2,
    roughness: 0.6,
    metalness: 0.0
  });

  function addChampagneBottle(x, z, rot = 0) {
    const bottle = new THREE.Group();

    // Cuerpo botella
    const bottleBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.055, 0.32, 18),
      bottleGlassMat.clone()
    );
    bottleBody.position.y = 0.16;
    bottleBody.castShadow = true;
    bottleBody.userData.baseColor = 0x173b24;
    bottle.add(bottleBody);

    // Cuello botella
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.028, 0.18, 16),
      bottleGlassMat.clone()
    );
    neck.position.y = 0.40;
    neck.castShadow = true;
    neck.userData.baseColor = 0x173b24;
    bottle.add(neck);

    // Cápsula dorada
    const foil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.08, 16),
      foilMat.clone()
    );
    foil.position.y = 0.53;
    foil.castShadow = true;
    foil.userData.baseColor = 0xd6b75a;
    bottle.add(foil);

    // Etiqueta frontal
    const label = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, 0.08, 0.006),
      labelMat.clone()
    );
    label.position.set(0, 0.19, 0.056);
    label.userData.baseColor = 0xf1ead2;
    bottle.add(label);

    bottle.position.set(x, H + 0.055, z);
    bottle.rotation.y = rot;

    g.add(bottle);
  }

  // Cubiteras + 2 botellas por cada cubitera
  const totalSpan = (nCub - 1) * sep;

  for (let i = 0; i < nCub; i++) {
    const x = -totalSpan / 2 + i * sep;

    // Aro metálico de cubitera
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.12, 0.5, 16),
      cubMat.clone()
    );
    ring.position.set(x, H + 0.03, 0);
    ring.castShadow = true;
    ring.userData.baseColor = 0x8a8682;
    g.add(ring);

    // Hielo interior
    const ice = new THREE.Mesh(
      new THREE.CylinderGeometry(0.10, 0.09, 0.55, 16),
      iceMat.clone()
    );
    ice.position.set(x, H + 0.05, 0);
    ice.userData.baseColor = 0xd0eef8;
    ice.userData.baseOpacity = 0.7;
    g.add(ice);

    // 2 botellas de champán al lado de cada cubitera
    addChampagneBottle(x - 0.23, -W * 0.22, -0.18);
    addChampagneBottle(x + 0.23, -W * 0.22, 0.18);
  }

  // Barra frontal cromada
  const barMat = new THREE.MeshStandardMaterial({
    color: 0x9a9692,
    roughness: 0.3,
    metalness: 0.8
  });

  const bar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, L - 0.1, 12),
    barMat
  );
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, H * 0.55, W / 2 + 0.012);
  bar.castShadow = true;
  bar.userData.baseColor = 0x9a9692;
  g.add(bar);

  return g;
}

function parseHex(h) {
  return parseInt((h || '#1a1a1c').replace('#', ''), 16);
}