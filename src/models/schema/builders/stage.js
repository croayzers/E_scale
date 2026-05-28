import {
  addBox, addCylinder, addLabel, addTopLabel, addTopFootprint,
  markMain, makeStandardMaterial, addTransparentShell,
  tubeBetween, addPolylineTubes, annularSectorShape
} from './primitives.js';

export function buildTrussBox(group, item, L, W, H, color) {
  addTransparentShell(group, new THREE.BoxGeometry(L, H, W), color, 0.08);
  const rail = Math.max(0.018, Math.min(W, H) * 0.05);
  const hx = L / 2, hy = H, hz = W / 2;
  const cornersBottom = [
    new THREE.Vector3(-hx, 0, -hz),
    new THREE.Vector3(hx, 0, -hz),
    new THREE.Vector3(hx, 0, hz),
    new THREE.Vector3(-hx, 0, hz)
  ];
  const cornersTop = cornersBottom.map(v => v.clone().setY(hy));
  cornersBottom.forEach((point, i) => group.add(tubeBetween(point, cornersTop[i], rail, color)));
  for (let i = 0; i < cornersBottom.length; i += 1) {
    const next = (i + 1) % cornersBottom.length;
    group.add(tubeBetween(cornersBottom[i], cornersBottom[next], rail, color));
    group.add(tubeBetween(cornersTop[i], cornersTop[next], rail, color));
  }
  [[0, 1], [3, 2]].forEach(([a, b]) => {
    group.add(tubeBetween(cornersBottom[a], cornersTop[b], rail * 0.7, color));
    group.add(tubeBetween(cornersBottom[b], cornersTop[a], rail * 0.7, color));
  });
}

export function buildTrussTri(group, item, L, W, H, color) {
  const triangle = new THREE.Shape();
  triangle.moveTo(-W / 2, 0);
  triangle.lineTo(W / 2, 0);
  triangle.lineTo(0, H);
  triangle.lineTo(-W / 2, 0);
  const prism = new THREE.ExtrudeGeometry(triangle, { depth: L, bevelEnabled: false });
  prism.center();
  prism.rotateY(Math.PI / 2);
  addTransparentShell(group, prism, color, 0.09);

  const rail = Math.max(0.018, W * 0.08);
  const front = [
    new THREE.Vector3(-L / 2, 0, -W / 2),
    new THREE.Vector3(-L / 2, 0, W / 2),
    new THREE.Vector3(-L / 2, H, 0)
  ];
  const back = front.map(p => p.clone().setX(L / 2));
  for (let i = 0; i < 3; i += 1) group.add(tubeBetween(front[i], back[i], rail, color));
  addPolylineTubes(group, front.map(p => [p.x, p.y, p.z]), rail, color, true);
  addPolylineTubes(group, back.map(p => [p.x, p.y, p.z]), rail, color, true);
  group.add(tubeBetween(front[0], back[2], rail * 0.65, color));
  group.add(tubeBetween(front[1], back[2], rail * 0.65, color));
}

export function buildScreen(group, item, L, W, H, color) {
  const frameColor = '#4B5563';
  const panel = addBox(group, {
    size: [L, H, Math.max(0.05, W)],
    position: [0, H / 2 + 0.18, 0],
    color,
    preset: color === '#111827' ? 'glass' : 'fabric',
    opacity: color === '#111827' ? 0.88 : 0.96
  });
  markMain(panel, color);
  addBox(group, { size: [L + 0.08, 0.08, W + 0.08], position: [0, H + 0.24, 0], color: frameColor, preset: 'metal' });
  [-L / 2 + 0.08, L / 2 - 0.08].forEach(x => {
    addCylinder(group, { radiusTop: 0.035, height: 0.36, position: [x, 0.18, 0], color: frameColor, preset: 'metal' });
  });
}

export function buildTotem(group, item, L, W, H, color) {
  const body = addBox(group, { size: [L, H, W], position: [0, H / 2, 0], color, preset: 'fabric', opacity: 0.98 });
  markMain(body, color);
  addBox(group, { size: [L + 0.18, 0.08, W + 0.18], position: [0, 0.04, 0], color: '#6B7280', preset: 'metal' });
}

export function buildPodium(group, item, L, W, H, color) {
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(Math.max(0.16, W * 0.38), Math.max(0.2, W * 0.55), H, 4),
    makeStandardMaterial(color, 'matte', 1)
  );
  body.rotation.y = Math.PI / 4;
  body.position.y = H / 2;
  markMain(body, color);
  group.add(body);
  addBox(group, { size: [L * 0.62, 0.04, W * 0.72], position: [0, H + 0.03, 0], color: '#F8FAFC', preset: 'matte' });
}

export function buildRunway(group, item, L, W, H, color) {
  const body = addBox(group, { size: [L, H, W], position: [0, H / 2, 0], color, preset: 'matte' });
  markMain(body, color);
  addBox(group, { size: [L, 0.04, 0.06], position: [0, H + 0.02, W / 2 - 0.03], color: '#D1D5DB', preset: 'metal' });
  addBox(group, { size: [L, 0.04, 0.06], position: [0, H + 0.02, -W / 2 + 0.03], color: '#D1D5DB', preset: 'metal' });
}

export function buildCurvedPlatform(group, item, L, W, H, color) {
  const outerRadius = Math.max(L * 0.62, W * 0.9);
  const thickness = Math.max(0.28, Math.min(outerRadius - 0.12, W));
  const innerRadius = Math.max(0.12, outerRadius - thickness);
  const angle = Math.PI * 0.54;
  const shape = annularSectorShape(innerRadius, outerRadius, angle);
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: H, bevelEnabled: false, curveSegments: 28 }),
    makeStandardMaterial(color, item.visual?.materialPreset || 'matte', item.visual?.opacity ?? 1)
  );
  body.rotation.x = -Math.PI / 2;
  body.position.y = 0;
  body.castShadow = item.visual?.shadows !== false;
  markMain(body, color);
  group.add(body);
  const trim = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: Math.max(0.03, H * 0.12), bevelEnabled: false, curveSegments: 28 }),
    makeStandardMaterial('#4B5563', 'metal', 1)
  );
  trim.rotation.x = -Math.PI / 2;
  trim.position.y = H + Math.max(0.03, H * 0.12);
  group.add(trim);
}

export function buildBooth(group, item, L, W, H, color) {
  const wd = Math.max(0.06, W * 0.09);
  const shell = addBox(group, { size: [L, H, W], position: [0, H / 2, 0], color, preset: 'glass', opacity: 0.12 });
  markMain(shell, color);
  addBox(group, { size: [L, H, wd], position: [0, H / 2, -W / 2 + wd / 2], color, preset: 'matte' });
  addBox(group, { size: [wd, H, W], position: [-L / 2 + wd / 2, H / 2, 0], color, preset: 'matte' });
  addBox(group, { size: [wd, H, W], position: [L / 2 - wd / 2, H / 2, 0], color, preset: 'matte' });
  addBox(group, { size: [L + wd * 2, wd, W + wd * 2], position: [0, H + wd / 2, 0], color: '#111827', preset: 'metal' });
}

export function buildStage(item, view) {
  const group = new THREE.Group();
  const W = item.dims?.width ?? 4;
  const L = item.dims?.length ?? 6;
  const H = item.dims?.height ?? 0.8;
  const color = item.color || '#27272A';
  if (view === 'top') {
    addTopFootprint(group, item, L, W, color, 0.18);
    addTopLabel(group, item.labelText || 'Escenario');
    return group;
  }
  const body = addBox(group, {
    size: [L, H, W],
    position: [0, H / 2, 0],
    color,
    preset: item.visual?.materialPreset || 'matte',
    opacity: item.visual?.opacity ?? 1
  });
  markMain(body, color);
  const edgeColor = '#4B5563';
  addBox(group, { size: [L, 0.04, 0.08], position: [0, H + 0.02, W / 2 - 0.04], color: edgeColor, preset: 'metal' });
  addBox(group, { size: [L, 0.04, 0.08], position: [0, H + 0.02, -W / 2 + 0.04], color: edgeColor, preset: 'metal' });
  addLabel(group, item.labelText || 'Escenario', H + 0.45);
  return group;
}
