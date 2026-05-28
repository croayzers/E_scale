import { addBox, addSphere, addLabel, addTopLabel, addTopFootprint, markMain, makeTopFill, colorNumber } from './primitives.js';

export function buildArbustoRecto(group, item, L, W, H, color) {
  const baseColor = color || '#3D7A38';
  const leafColors = ['#4A8C45', '#3D7A38', '#558C50', '#2D6E30', '#3A7235'];
  const base = addBox(group, { size: [L, H * 0.55, W * 0.65], position: [0, H * 0.275, 0], color: '#2A5E28', preset: 'matte' });
  markMain(base, baseColor);
  const count = Math.max(5, Math.round(L / 0.55));
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0.5;
    const r = H * (0.34 + 0.07 * Math.sin(i * 1.7 + 0.5));
    addSphere(group, {
      radius: r,
      position: [
        -L / 2 + L * t,
        H * (0.64 + 0.08 * Math.cos(i * 2.3)),
        Math.sin(i * 1.9) * W * 0.22
      ],
      color: leafColors[i % leafColors.length],
      preset: 'matte',
      segments: 28
    });
  }
}

export function buildArbustoCorner(group, item, L, W, H, color) {
  const baseColor = color || '#3D7A38';
  const leafColors = ['#4A8C45', '#3D7A38', '#558C50'];
  const armW = W * 0.55;
  const armLen = L * 0.88;

  const armX = addBox(group, { size: [armLen, H * 0.55, armW], position: [-L / 2 + armLen / 2, H * 0.275, -W / 2 + armW / 2], color: '#2A5E28', preset: 'matte' });
  markMain(armX, baseColor);
  addBox(group, { size: [armW, H * 0.55, armLen], position: [-L / 2 + armW / 2, H * 0.275, -W / 2 + armLen / 2], color: '#2A5E28', preset: 'matte' });

  addSphere(group, { radius: H * 0.4, position: [-L / 2 + armW / 2, H * 0.68, -W / 2 + armW / 2], color: leafColors[0], preset: 'matte' });
  const nArm = Math.max(2, Math.round((armLen - armW) / 0.7));
  for (let i = 0; i < nArm; i++) {
    const t = (i + 0.5) / nArm;
    addSphere(group, { radius: H * 0.32, position: [-L / 2 + armW + (armLen - armW) * t, H * 0.68, -W / 2 + armW / 2], color: leafColors[(i + 1) % leafColors.length], preset: 'matte' });
    addSphere(group, { radius: H * 0.32, position: [-L / 2 + armW / 2, H * 0.68, -W / 2 + armW + (armLen - armW) * t], color: leafColors[(i + 2) % leafColors.length], preset: 'matte' });
  }
}

export function buildArbustoCurvo(group, item, L, W, H, color) {
  const baseColor = color || '#3D7A38';
  const leafColors = ['#4A8C45', '#3D7A38', '#558C50', '#2D6E30'];
  const curveR = item.curveDiameter ?? 1.0;
  const totalAngle = L / curveR;
  const startAngle = -totalAngle / 2;
  const count = Math.max(4, Math.round(L / 0.7));
  let firstBase = null;
  for (let i = 0; i < count; i++) {
    const angle = startAngle + totalAngle * (i / (count - 1));
    const cx = Math.sin(angle) * curveR;
    const cz = (Math.cos(angle) - Math.cos(startAngle)) * curveR;
    const b = addBox(group, { size: [W * 0.55, H * 0.5, W * 0.55], position: [cx, H * 0.25, cz], color: '#2A5E28', preset: 'matte' });
    if (!firstBase) { firstBase = b; markMain(b, baseColor); }
    addSphere(group, { radius: H * 0.4, position: [cx, H * 0.65, cz], color: leafColors[i % leafColors.length], preset: 'matte' });
  }
}

export function buildArbol(item, view) {
  const group = new THREE.Group();
  const totalH  = item.dims?.height     ?? 5.0;
  const crownW  = item.dims?.crownWidth ?? 2.5;
  const crownHex = item.crownColor ?? '#2f6a3f';
  const trunkHex = item.trunkColor ?? '#5a3a1f';

  if (view === 'top') {
    const fill = new THREE.Mesh(new THREE.CircleGeometry(crownW / 2, 56), makeTopFill(crownHex, 0.6));
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.04;
    markMain(fill, crownHex);
    group.add(fill);
    return group;
  }

  const trunkH = totalH * 0.45;
  const crownH = totalH - trunkH;
  const trunkD = Math.max(0.15, crownW * 0.12);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkD * 0.45, trunkD * 0.5, trunkH, 8),
    new THREE.MeshStandardMaterial({ color: colorNumber(trunkHex), roughness: 0.9, flatShading: true })
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  markMain(trunk, trunkHex);
  group.add(trunk);

  const crownMat = new THREE.MeshStandardMaterial({ color: colorNumber(crownHex), roughness: 0.95, flatShading: true });
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(crownW / 2, 1), crownMat);
  crown.scale.y = (crownH / crownW) * 1.1;
  crown.position.y = trunkH + crownH / 2;
  crown.castShadow = true;
  group.add(crown);

  const bumpGeo = new THREE.IcosahedronGeometry(crownW * 0.28, 0);
  [[ crownW * 0.3,  trunkH + crownH * 0.6,  crownW * 0.1],
   [-crownW * 0.25, trunkH + crownH * 0.4, -crownW * 0.15],
   [ 0,             trunkH + crownH * 0.85,  crownW * 0.05]].forEach(([x, y, z]) => {
    const bump = new THREE.Mesh(bumpGeo, crownMat.clone());
    bump.position.set(x, y, z);
    bump.castShadow = true;
    group.add(bump);
  });

  if (item.labelText) addLabel(group, item.labelText, totalH + 0.4);
  return group;
}

export function buildPoste(item, view) {
  const group = new THREE.Group();
  const D   = item.dims?.diameter ?? 0.12;
  const H   = item.dims?.height   ?? 3.0;
  const color = item.color || '#6b4423';

  if (view === 'top') {
    const fill = new THREE.Mesh(new THREE.CircleGeometry(D, 24), makeTopFill(color, 0.8));
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.04;
    markMain(fill, color);
    group.add(fill);
    return group;
  }

  const mat = new THREE.MeshStandardMaterial({ color: colorNumber(color), roughness: 0.6, metalness: 0.2, flatShading: true });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(D / 2, D / 2, H, 12), mat);
  post.position.y = H / 2;
  post.castShadow = true;
  post.receiveShadow = true;
  markMain(post, color);
  group.add(post);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(D * 1.6, D * 1.8, 0.04, 16), mat.clone());
  base.position.y = 0.02;
  group.add(base);

  if (item.labelText) addLabel(group, item.labelText, H + 0.35);
  return group;
}

export function buildPlanta(item, view) {
  const group = new THREE.Group();
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
  pot.receiveShadow = true;
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

export function buildPergola(item, view) {
  const group = new THREE.Group();
  const L = item.dims?.length ?? 4;
  const W = item.dims?.width ?? 4;
  const postH = item.dims?.height ?? 3;
  const roofH = item.dims?.roofHeight ?? 0.12;
  const modSpacing = item.dims?.modSpacing ?? 4;
  const postColor = item.color || '#C4A265';
  const roofColor = item.roofColor || '#4A4744';
  const postDim = 0.1;

  if (view === 'top') {
    addTopFootprint(group, item, L, W, postColor, 0.10);
    addTopLabel(group, item.labelText || 'Pérgola');
    return group;
  }

  const nSegsL = Math.max(1, Math.round(L / modSpacing));
  const postXs = Array.from({ length: nSegsL + 1 }, (_, i) => -L / 2 + i * (L / nSegsL));
  const postZs = [-W / 2, W / 2];

  postXs.forEach(x => {
    postZs.forEach(z => {
      const post = addBox(group, { size: [postDim, postH, postDim], position: [x, postH / 2, z], color: postColor, preset: 'matte' });
      markMain(post, postColor);
    });
  });

  const beamH = 0.14, beamD = 0.08;
  postZs.forEach(z => {
    addBox(group, { size: [L + postDim, beamH, beamD], position: [0, postH + beamH / 2, z], color: roofColor, preset: 'matte' });
  });

  const nRafters = Math.max(3, Math.ceil(L / 0.45) + 1);
  const rafterW = 0.07, rafterH = roofH;
  for (let i = 0; i < nRafters; i++) {
    const x = -L / 2 + (i / (nRafters - 1)) * L;
    addBox(group, { size: [rafterW, rafterH, W + postDim * 2], position: [x, postH + beamH + rafterH / 2, 0], color: roofColor, preset: 'matte' });
  }

  if (item.labelText) addLabel(group, item.labelText, postH + beamH + rafterH + 0.4);
  return group;
}
