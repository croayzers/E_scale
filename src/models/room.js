/* ─────────────────────────────────────────────────────────
   ROOM — Estructura "4 paredes" como recinto único
   ────────────────────────────────────────────────────────
   Un solo item editable globalmente (no por pared).
   item.dims:   { length, width, height, thickness }
   item.color:  hex
   ───────────────────────────────────────────────────────── */

export function createRoom(item) {
  const group = new THREE.Group();

  const L = item.dims?.length    ?? 6.0;     // eje X
  const W = item.dims?.width     ?? 4.0;     // eje Z
  const H = item.dims?.height    ?? 3.0;     // altura paredes
  const T = item.dims?.thickness ?? 0.10;    // grosor
  const color = parseHex(item.color ?? '#ffffff');

  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.0,
    flatShading: true
  });

  // ── 4 paredes ──
  // Norte (+Z) y Sur (-Z): largo = L, ancho = T
  // Este  (+X) y Oeste (-X): largo = W, ancho = T
  const walls = [
    { size: [L, H, T], pos: [0, H/2,  W/2 - T/2] },   // norte
    { size: [L, H, T], pos: [0, H/2, -W/2 + T/2] },   // sur
    { size: [T, H, W], pos: [ L/2 - T/2, H/2, 0] },   // este
    { size: [T, H, W], pos: [-L/2 + T/2, H/2, 0] },   // oeste
  ];

  walls.forEach(({ size, pos }, idx) => {
    const wallGeo = new THREE.BoxGeometry(...size);
    const wall = new THREE.Mesh(wallGeo, mat.clone());
    wall.position.set(...pos);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.baseColor = color;
    if (idx === 0) wall.userData.isMain = true;
    group.add(wall);
  });

  // ── Suelo de referencia translúcido ──
  // Ayuda a visualizar el recinto sin tapar el plano base.
  const floorGeo = new THREE.PlaneGeometry(L - T, W - T);
  const floorMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.01;
  floor.userData.baseColor = color;
  floor.userData.baseOpacity = 0.08;
  floor.userData.role = 'room-floor';
  group.add(floor);

  return group;
}

function parseHex(hex) {
  return parseInt((hex || '#ffffff').replace('#', ''), 16);
}
