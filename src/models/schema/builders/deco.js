import {
  addBox, addCylinder, addSphere, addLabel, markMain,
  makeStandardMaterial, colorNumber, annularSectorShape, tubeBetween
} from './primitives.js';

export function buildFoldingScreen(group, item, L, W, H, color) {
  const panelW = L / 3;
  [-panelW, 0, panelW].forEach((x, index) => {
    const panel = addBox(group, { size: [panelW * 0.94, H, Math.max(0.04, W)], position: [x, H / 2, 0], color, preset: 'fabric' });
    if (index === 1) markMain(panel, color);
    panel.rotation.y = index === 0 ? -0.28 : index === 2 ? 0.28 : 0;
  });
}

export function buildFlowerPanel(group, item, L, W, H, color) {
  const board = addBox(group, { size: [L, H, Math.max(0.06, W)], position: [0, H / 2, 0], color, preset: 'matte' });
  markMain(board, color);
  const flowerColors = ['#16A34A', '#F472B6', '#F59E0B', '#84CC16'];
  for (let i = 0; i < 10; i += 1) {
    addSphere(group, {
      radius: 0.08 + (i % 3) * 0.03,
      position: [-L / 2 + 0.25 + (i % 5) * (L / 5), H * 0.25 + Math.floor(i / 5) * (H * 0.28), W / 2 + 0.05],
      color: flowerColors[i % flowerColors.length],
      preset: 'matte'
    });
  }
}

export function buildLedPanel(group, item, L, W, H, color) {
  const panel = addBox(group, { size: [L, H, Math.max(0.04, W)], position: [0, H / 2 + 0.18, 0], color, preset: 'glass', opacity: 0.88 });
  markMain(panel, color);
  addSphere(group, { radius: 0.1, position: [0, H * 0.72, W / 2 + 0.05], color: '#38BDF8', emissive: true });
  [-L / 2 + 0.08, L / 2 - 0.08].forEach(x =>
    addCylinder(group, { radiusTop: 0.03, height: 0.36, position: [x, 0.18, 0], color: '#6B7280', preset: 'metal' })
  );
}

export function buildPhotocall(group, item, L, W, H, color) {
  const banner = addBox(group, { size: [L, H, Math.max(0.03, W)], position: [0, H / 2 + 0.18, 0], color, preset: 'fabric' });
  markMain(banner, color);
  const x = L / 2 - 0.08;
  addCylinder(group, { radiusTop: 0.028, height: H + 0.36, position: [-x, (H + 0.36) / 2, 0], color: '#6B7280', preset: 'metal' });
  addCylinder(group, { radiusTop: 0.028, height: H + 0.36, position: [x, (H + 0.36) / 2, 0], color: '#6B7280', preset: 'metal' });
  addBox(group, { size: [L + 0.12, 0.04, 0.04], position: [0, H + 0.36, 0], color: '#6B7280', preset: 'metal' });
}

export function buildDecorArch(group, item, L, W, H, color) {
  const shell = new THREE.Mesh(new THREE.BoxGeometry(L, H, W), makeStandardMaterial(color, 'glass', 0.05));
  shell.castShadow = false;
  shell.receiveShadow = false;
  markMain(shell, color);
  group.add(shell);
  const tubeRadius = Math.max(0.03, W * 0.08);
  const leftBase = new THREE.Vector3(-L / 2, 0, 0);
  const leftTop  = new THREE.Vector3(-L / 2, H * 0.65, 0);
  const rightBase = new THREE.Vector3(L / 2, 0, 0);
  const rightTop  = new THREE.Vector3(L / 2, H * 0.65, 0);
  group.add(tubeBetween(leftBase, leftTop, tubeRadius, color, 'metal'));
  group.add(tubeBetween(rightBase, rightTop, tubeRadius, color, 'metal'));
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(L / 2, tubeRadius, 12, 42, Math.PI),
    makeStandardMaterial(color, 'metal', 1)
  );
  ring.rotation.z = Math.PI;
  ring.position.y = H * 0.65;
  group.add(ring);
}

export function buildGiantLetters(group, item, L, W, H, color) {
  const segments = 4;
  const glyphW = L / segments;
  for (let i = 0; i < segments; i += 1) {
    const body = addBox(group, { size: [glyphW * 0.72, H, W], position: [-L / 2 + glyphW * (i + 0.5), H / 2, 0], color, preset: 'matte' });
    if (i === 1) markMain(body, color);
  }
}

export function buildNeonSign(group, item, L, W, H, color) {
  const back = addBox(group, { size: [L, H, Math.max(0.02, W)], position: [0, H / 2, 0], color: '#111827', preset: 'matte' });
  markMain(back, '#111827');
  const neon = new THREE.Mesh(
    new THREE.TorusGeometry(Math.max(0.18, L * 0.18), 0.04, 10, 48, Math.PI * 1.35),
    new THREE.MeshStandardMaterial({
      color: colorNumber(color),
      emissive: colorNumber(color),
      emissiveIntensity: 1.15,
      roughness: 0.15
    })
  );
  neon.position.set(0, H * 0.56, W / 2 + 0.04);
  neon.rotation.z = -0.25;
  group.add(neon);
}

export function buildCurvedBar(group, diameter, height, color) {
  const outerRadius = diameter / 2;
  const counterDepth = Math.max(0.42, diameter * 0.2);
  const innerRadius = Math.max(0.24, outerRadius - counterDepth);
  const angle = Math.PI * 0.74;
  const shape = annularSectorShape(innerRadius, outerRadius, angle);
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 32 }),
    makeStandardMaterial(color, 'matte', 0.98)
  );
  body.rotation.x = -Math.PI / 2;
  body.position.y = 0;
  markMain(body, color);
  group.add(body);
  const top = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false, curveSegments: 32 }),
    makeStandardMaterial('#E5E7EB', 'metal', 1)
  );
  top.rotation.x = -Math.PI / 2;
  top.position.y = height;
  group.add(top);
  const footRail = new THREE.Mesh(
    new THREE.TorusGeometry(innerRadius + 0.06, 0.018, 8, 64, angle),
    makeStandardMaterial('#9CA3AF', 'metal', 1)
  );
  footRail.rotation.x = Math.PI / 2;
  footRail.position.y = height * 0.28;
  group.add(footRail);
}

export function buildVase(group, diameter, height, color) {
  const profile = [
    new THREE.Vector2(0.02, 0),
    new THREE.Vector2(diameter * 0.18, 0.08),
    new THREE.Vector2(diameter * 0.3, height * 0.18),
    new THREE.Vector2(diameter * 0.16, height * 0.52),
    new THREE.Vector2(diameter * 0.26, height * 0.78),
    new THREE.Vector2(diameter * 0.1, height)
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 24), makeStandardMaterial(color, 'glass', 0.72));
  markMain(body, color);
  group.add(body);
}

export function buildCenterpiece(group, diameter, height, color) {
  const base = addCylinder(group, {
    radiusTop: diameter * 0.26, height: height * 0.32,
    position: [0, height * 0.16, 0], color: '#8B5E3C', preset: 'matte'
  });
  markMain(base, '#8B5E3C');
  ['#F472B6', '#FB7185', color, '#84CC16'].forEach((flowerColor, index) => {
    addSphere(group, {
      radius: diameter * 0.18,
      position: [
        (index % 2 === 0 ? -1 : 1) * diameter * 0.12,
        height * 0.56 + (index > 1 ? diameter * 0.08 : 0),
        index < 2 ? diameter * 0.08 : -diameter * 0.08
      ],
      color: flowerColor, preset: 'matte'
    });
  });
}

export function buildCandelabra(group, diameter, height, color) {
  const base = addCylinder(group, { radiusTop: diameter * 0.2, height: 0.08, position: [0, 0.04, 0], color, preset: 'metal' });
  markMain(base, color);
  addCylinder(group, { radiusTop: 0.03, height, position: [0, height / 2, 0], color, preset: 'metal' });
  [-0.16, 0, 0.16].forEach(x => {
    addCylinder(group, { radiusTop: 0.016, height: 0.18, position: [x, height, 0], color, preset: 'metal' });
    addSphere(group, { radius: 0.05, position: [x, height + 0.12, 0], color: '#FCD34D', emissive: true });
  });
}

export function buildPedestal(group, diameter, height, color) {
  const body = addCylinder(group, {
    radiusTop: diameter * 0.34, radiusBottom: diameter * 0.4, height,
    position: [0, height / 2, 0], color, preset: 'matte', radialSegments: 20
  });
  markMain(body, color);
}

export function buildIceBucket(group, diameter, height, color) {
  const body = addCylinder(group, {
    radiusTop: diameter * 0.42, radiusBottom: diameter * 0.34, height,
    position: [0, height / 2, 0], color, preset: 'glass', opacity: 0.62, radialSegments: 20
  });
  markMain(body, color);
  addCylinder(group, { radiusTop: diameter * 0.48, height: 0.04, position: [0, height + 0.02, 0], color: '#CBD5E1', preset: 'metal' });
}

