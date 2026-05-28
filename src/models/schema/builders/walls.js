import { addBox, markMain, makeStandardMaterial, makeTopFill, colorNumber } from './primitives.js';

export function buildPared(group, item, L, W, H, color) {
  const body = addBox(group, { size: [L, H, W], position: [0, H / 2, 0], color, preset: 'matte' });
  markMain(body, color);
}

export function buildMuro(group, item, L, W, H, color) {
  const body = addBox(group, { size: [L, H, W], position: [0, H / 2, 0], color, preset: 'matte' });
  markMain(body, color);
  addBox(group, { size: [L + 0.04, 0.06, W + 0.04], position: [0, H + 0.03, 0], color: '#6B4423', preset: 'matte' });
}

export function buildTecho(group, item, L, W, H, color) {
  const floorH = item.dims?.floorHeight ?? 2.0;
  const t = Math.max(0.06, H);
  const body = addBox(group, { size: [L, t, W], position: [0, floorH + t / 2, 0], color, preset: 'matte' });
  markMain(body, color);
  const pillarColor = '#A09B95';
  const px = L / 2 - 0.08, pz = W / 2 - 0.08;
  [[px, pz], [px, -pz], [-px, pz], [-px, -pz]].forEach(([x, z]) => {
    addBox(group, { size: [0.1, floorH, 0.1], position: [x, floorH / 2, z], color: pillarColor, preset: 'matte' });
  });
}

export function buildRoom(item, view) {
  const group = new THREE.Group();
  const L = item.dims?.length    ?? 6.0;
  const W = item.dims?.width     ?? 4.0;
  const H = item.dims?.height    ?? 3.0;
  const T = item.dims?.thickness ?? 0.10;
  const color = item.color || '#ffffff';

  if (view === 'top') {
    const mat = makeTopFill(color, 0.55);
    [
      { w: L, d: T, px: 0,           pz:  W / 2 - T / 2 },
      { w: L, d: T, px: 0,           pz: -W / 2 + T / 2 },
      { w: T, d: W, px:  L / 2 - T / 2, pz: 0 },
      { w: T, d: W, px: -L / 2 + T / 2, pz: 0 },
    ].forEach(({ w, d, px, pz }) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat.clone());
      m.rotation.x = -Math.PI / 2;
      m.position.set(px, 0.04, pz);
      group.add(m);
    });
    return group;
  }

  const walls = [
    { size: [L, H, T], pos: [0,       H / 2,  W / 2 - T / 2] },
    { size: [L, H, T], pos: [0,       H / 2, -W / 2 + T / 2] },
    { size: [T, H, W], pos: [ L / 2 - T / 2, H / 2, 0] },
    { size: [T, H, W], pos: [-L / 2 + T / 2, H / 2, 0] },
  ];
  walls.forEach(({ size, pos }, idx) => {
    const mesh = addBox(group, { size, position: pos, color, preset: 'matte' });
    if (idx === 0) markMain(mesh, color);
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(L - T, W - T),
    new THREE.MeshBasicMaterial({ color: colorNumber(color), transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.01;
  floor.userData.role = 'room-floor';
  group.add(floor);
  return group;
}

export function buildParedPuerta(group, item, L, W, H, color) {
  const doorW = item.dims?.doorWidth ?? item.doorWidth ?? 1.0;
  const doorH = item.dims?.doorHeight ?? item.doorHeight ?? 2.0;
  const sideW = (L - doorW) / 2;
  const frameColor = '#8B7355';

  const leftBody = addBox(group, { size: [sideW, H, W], position: [-L / 2 + sideW / 2, H / 2, 0], color, preset: 'matte' });
  markMain(leftBody, color);
  addBox(group, { size: [sideW, H, W], position: [L / 2 - sideW / 2, H / 2, 0], color, preset: 'matte' });
  if (H > doorH) {
    addBox(group, { size: [doorW, H - doorH, W], position: [0, doorH + (H - doorH) / 2, 0], color, preset: 'matte' });
  }

  addBox(group, { size: [0.06, doorH, W + 0.02], position: [-doorW / 2 + 0.03, doorH / 2, 0], color: frameColor, preset: 'matte' });
  addBox(group, { size: [0.06, doorH, W + 0.02], position: [doorW / 2 - 0.03, doorH / 2, 0], color: frameColor, preset: 'matte' });
  addBox(group, { size: [doorW, 0.06, W + 0.02], position: [0, doorH - 0.03, 0], color: frameColor, preset: 'matte' });

  const doorPivot = new THREE.Group();
  doorPivot.position.set(-doorW / 2, 0, W / 2 + 0.02);
  doorPivot.rotation.y = Math.PI / 4;
  const doorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(doorW * 0.96, doorH * 0.97, 0.04),
    makeStandardMaterial(frameColor, 'matte', 1)
  );
  doorMesh.position.set(doorW * 0.48, doorH / 2, 0);
  doorMesh.castShadow = true;
  doorPivot.add(doorMesh);
  group.add(doorPivot);

  const hingeX = -doorW / 2;
  const hingeZ = W / 2 + 0.02;
  const arcSegs = 24;
  const arcPts = [];
  for (let i = 0; i <= arcSegs; i++) {
    const a = (i / arcSegs) * (Math.PI / 2);
    arcPts.push(new THREE.Vector3(hingeX + Math.cos(a) * doorW, 0.016, hingeZ + Math.sin(a) * doorW));
  }
  const arcLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPts),
    new THREE.LineDashedMaterial({ color: 0x999999, dashSize: 0.1, gapSize: 0.06, transparent: true, opacity: 0.65 })
  );
  arcLine.computeLineDistances();
  group.add(arcLine);

  const arcShape = new THREE.Shape();
  arcShape.moveTo(hingeX, hingeZ);
  for (let i = 0; i <= arcSegs; i++) {
    const a = (i / arcSegs) * (Math.PI / 2);
    arcShape.lineTo(hingeX + Math.cos(a) * doorW, hingeZ + Math.sin(a) * doorW);
  }
  arcShape.lineTo(hingeX, hingeZ);
  const arcFill = new THREE.Mesh(
    new THREE.ShapeGeometry(arcShape),
    new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.10, side: THREE.DoubleSide, depthWrite: false })
  );
  arcFill.rotation.x = -Math.PI / 2;
  arcFill.position.y = 0.012;
  arcFill.renderOrder = 10;
  group.add(arcFill);
}
