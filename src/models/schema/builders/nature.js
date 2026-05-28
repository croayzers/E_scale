import { addBox, addSphere, addLabel, addTopLabel, addTopFootprint, markMain } from './primitives.js';

export function buildArbustoRecto(group, item, L, W, H, color) {
  const baseColor = color || '#3D7A38';
  const leafColors = ['#4A8C45', '#3D7A38', '#558C50', '#2D6E30'];
  const base = addBox(group, { size: [L, H * 0.55, W * 0.65], position: [0, H * 0.275, 0], color: '#2A5E28', preset: 'matte' });
  markMain(base, baseColor);
  const count = Math.max(3, Math.round(L / 0.75));
  for (let i = 0; i < count; i++) {
    addSphere(group, {
      radius: H * 0.42,
      position: [-L / 2 + L * (i + 0.5) / count, H * 0.68, Math.sin(i * 2.1) * W * 0.08],
      color: leafColors[i % leafColors.length],
      preset: 'matte'
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
