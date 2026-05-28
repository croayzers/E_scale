import {
  addLabel, addTopLabel, addTopPlainText, markMain, makeTopFill, colorNumber, makeStandardMaterial
} from './primitives.js';

export function buildSurface(item, view) {
  const group = new THREE.Group();
  const W = item.dims?.width ?? 3;
  const L = item.dims?.length ?? 3;
  const H = item.dims?.height ?? 0.1;
  const color = item.color || '#6F8E57';
  const borderColor = item.borderColor || '#2F5A29';

  if (view !== 'top') {
    const visH = Math.max(0.3, H);
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(L, visH, W),
      new THREE.MeshStandardMaterial({ color: colorNumber(color), roughness: 0.85, metalness: 0.0, flatShading: false })
    );
    box.position.y = visH / 2;
    box.receiveShadow = true;
    box.castShadow = false;
    markMain(box, color);
    group.add(box);
    if (item.labelText) addLabel(group, item.labelText, visH + 0.4);
    return group;
  }

  const fill = new THREE.Mesh(new THREE.PlaneGeometry(L, W), makeTopFill(color, item.visual?.opacity ?? 0.65));
  fill.rotation.x = -Math.PI / 2;
  fill.position.y = 0.04;
  fill.receiveShadow = true;
  markMain(fill, color);
  group.add(fill);

  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(L, W)),
    new THREE.LineBasicMaterial({ color: colorNumber(borderColor), transparent: true, opacity: 0.58 })
  );
  border.rotation.x = -Math.PI / 2;
  border.position.y = fill.position.y + 0.002;
  group.add(border);

  if (item.labelText) addTopLabel(group, item.labelText);
  return group;
}

export function buildAlfombra(item, view) {
  const group = new THREE.Group();
  const isRound = item.shape === 'round' || typeof item.dims?.diameter === 'number';
  const color       = item.color       || '#8b1a1a';
  const borderColor = item.borderColor || '#c9a55a';

  if (isRound) {
    const D = item.dims?.diameter ?? 2.0;
    const R = D / 2;

    if (view === 'top') {
      const fill = new THREE.Mesh(new THREE.CircleGeometry(R, 64), makeTopFill(color, 0.75));
      fill.rotation.x = -Math.PI / 2;
      fill.position.y = 0.04;
      markMain(fill, color);
      group.add(fill);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(Math.max(0.01, R - 0.08), R, 64),
        new THREE.MeshBasicMaterial({ color: colorNumber(borderColor), transparent: true, opacity: 0.7, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.041;
      group.add(ring);
      return group;
    }

    const rug = new THREE.Mesh(
      new THREE.CylinderGeometry(R, R, 0.02, 64),
      makeStandardMaterial(color, 'matte', 1)
    );
    rug.position.y = 0.01;
    rug.receiveShadow = true;
    markMain(rug, color);
    group.add(rug);
    return group;
  }

  const L = item.dims?.length ?? 3.0;
  const W = item.dims?.width  ?? 2.0;

  if (view === 'top') {
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(L, W), makeTopFill(color, 0.75));
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.04;
    markMain(fill, color);
    group.add(fill);
    const bW = 0.08;
    [
      { geo: new THREE.PlaneGeometry(L, bW),      px: 0,           pz: -W / 2 + bW / 2 },
      { geo: new THREE.PlaneGeometry(L, bW),      px: 0,           pz:  W / 2 - bW / 2 },
      { geo: new THREE.PlaneGeometry(bW, W),      px: -L / 2 + bW / 2, pz: 0 },
      { geo: new THREE.PlaneGeometry(bW, W),      px:  L / 2 - bW / 2, pz: 0 },
    ].forEach(({ geo, px, pz }) => {
      const border = new THREE.Mesh(geo,
        new THREE.MeshBasicMaterial({ color: colorNumber(borderColor), transparent: true, opacity: 0.65, side: THREE.DoubleSide })
      );
      border.rotation.x = -Math.PI / 2;
      border.position.set(px, 0.042, pz);
      group.add(border);
    });
    return group;
  }

  const rug = new THREE.Mesh(
    new THREE.BoxGeometry(L, 0.02, W),
    makeStandardMaterial(color, 'matte', 1)
  );
  rug.position.y = 0.01;
  rug.receiveShadow = true;
  markMain(rug, color);
  group.add(rug);
  return group;
}

export function buildAmbiente(item, view) {
  switch (item.subtype) {
    case 'alfombra': return buildAlfombra(item, view);
    case 'planta':   return _buildPlanta(item, view);
    default:         return _buildSpot(item, view);
  }
}

function _buildSpot(item, view) {
  const group = new THREE.Group();
  const H     = item.dims?.height ?? 2.0;
  const color = item.color || '#1a1a1c';

  if (view === 'top') {
    const fill = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), makeTopFill(color, 0.7));
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.04;
    markMain(fill, color);
    group.add(fill);
    return group;
  }

  const legMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.5, metalness: 0.5, flatShading: true });
  const legGeo = new THREE.CylinderGeometry(0.012, 0.012, H, 8);
  [-0.25, 0, 0.25].forEach((x, i) => {
    const leg = new THREE.Mesh(legGeo, legMat.clone());
    leg.position.set(x, H / 2, i === 1 ? 0.18 : -0.08);
    leg.rotation.x = i === 1 ? 0.18 : -0.08;
    leg.castShadow = true;
    group.add(leg);
  });

  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.12, 0.22, 16),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.4, metalness: 0.6, flatShading: true })
  );
  head.position.set(0, H + 0.11, 0);
  head.rotation.x = -0.4;
  head.castShadow = true;
  markMain(head, color);
  group.add(head);

  const lensColor = item.color || '#fffbe8';
  const lens = new THREE.Mesh(
    new THREE.CircleGeometry(0.055, 16),
    new THREE.MeshStandardMaterial({ color: colorNumber(lensColor), emissive: colorNumber(lensColor), emissiveIntensity: 0.8, roughness: 0.1 })
  );
  lens.position.set(0, H + 0.22, 0.08);
  lens.rotation.x = -0.4;
  group.add(lens);
  return group;
}

function _buildPlanta(item, view) {
  const group      = new THREE.Group();
  const H          = item.dims?.height ?? 1.2;
  const potColor   = item.potColor  || '#8b5e3c';
  const plantColor = item.color     || '#3e7a3a';

  if (view === 'top') {
    const fill = new THREE.Mesh(new THREE.CircleGeometry(H * 0.28, 36), makeTopFill(plantColor, 0.55));
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.04;
    markMain(fill, plantColor);
    group.add(fill);
    return group;
  }

  const potH = H * 0.35;
  const pot  = new THREE.Mesh(
    new THREE.CylinderGeometry(potH * 0.55, potH * 0.42, potH, 16),
    new THREE.MeshStandardMaterial({ color: colorNumber(potColor), roughness: 0.8, flatShading: true })
  );
  pot.position.y = potH / 2;
  pot.castShadow = true;
  markMain(pot, potColor);
  group.add(pot);

  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(potH * 0.53, potH * 0.53, 0.04, 16),
    new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.95 })
  );
  soil.position.y = potH - 0.01;
  group.add(soil);

  const crownH   = H - potH;
  const plantMat = new THREE.MeshStandardMaterial({ color: colorNumber(plantColor), roughness: 0.95, flatShading: true });
  const crown    = new THREE.Mesh(new THREE.IcosahedronGeometry(crownH * 0.55, 1), plantMat);
  crown.scale.y  = 1.1;
  crown.position.y = potH + crownH * 0.5;
  crown.castShadow = true;
  group.add(crown);

  const bumpGeo = new THREE.IcosahedronGeometry(crownH * 0.28, 0);
  [[-crownH * 0.28, potH + crownH * 0.55,  crownH * 0.12],
   [ crownH * 0.25, potH + crownH * 0.45, -crownH * 0.15]].forEach(([x, y, z]) => {
    const bump = new THREE.Mesh(bumpGeo, plantMat.clone());
    bump.position.set(x, y, z);
    bump.castShadow = true;
    group.add(bump);
  });
  return group;
}

export function buildArrow(item) {
  const group = new THREE.Group();
  const W = item.dims?.width ?? 1.2;
  const L = item.dims?.length ?? 2.2;
  const color = item.color || '#111827';
  const shape = new THREE.Shape();
  shape.moveTo(-L / 2, -W / 3);
  shape.lineTo(0, -W / 3);
  shape.lineTo(0, -W / 2);
  shape.lineTo(L / 2, 0);
  shape.lineTo(0, W / 2);
  shape.lineTo(0, W / 3);
  shape.lineTo(-L / 2, W / 3);
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    makeTopFill(color, item.visual?.opacity ?? 0.9)
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.04;
  markMain(mesh, color);
  group.add(mesh);
  if (item.labelText) {
    addTopPlainText(group, item.labelText, {
      color: item.textColor || '#FFFFFF',
      fontSize: item.display?.textSize ?? 34,
      width: Math.max(4.2, L * 1.75),
      height: Math.max(1.05, W * 0.95)
    });
  }
  return group;
}
