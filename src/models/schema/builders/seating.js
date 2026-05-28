import { addBox, addCylinder, addLabel, markMain, makeStandardMaterial, makeTopFill } from './primitives.js';

export function buildSofa(item, view) {
  const group = new THREE.Group();
  const W = item.dims?.width ?? 1.4;
  const D = item.dims?.length ?? 0.9;
  const H = item.dims?.height ?? 0.82;
  const color = item.color || '#4a4a52';
  const accent = item.accentColor || '#2a2a30';

  if (view === 'top') {
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(W, D), makeTopFill(color, 0.26));
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.04;
    markMain(fill, color);
    group.add(fill);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, 0.12), makeTopFill(accent, 0.9));
    back.rotation.x = -Math.PI / 2;
    back.position.set(0, 0.041, D / 2 - 0.06);
    group.add(back);
    return group;
  }

  // Seat cushion — slightly forward, not reaching the rear edge
  const seatH = H * 0.42;
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(W, seatH, D * 0.80),
    makeStandardMaterial(color, 'fabric', 1)
  );
  base.position.set(0, seatH / 2, -D * 0.05);
  base.castShadow = true;
  markMain(base, color);
  group.add(base);

  // Backrest — starts exactly at seat top, no overlap
  const backH = H * 0.52;
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(W, backH, D * 0.14),
    makeStandardMaterial(color, 'fabric', 1)
  );
  back.position.set(0, seatH + backH / 2, D / 2 - D * 0.07);
  back.castShadow = true;
  group.add(back);

  // Arm rests — same height as backrest, on sides
  const armGeo = new THREE.BoxGeometry(W * 0.11, H * 0.50, D * 0.80);
  [-W / 2 + W * 0.055, W / 2 - W * 0.055].forEach(x => {
    const arm = new THREE.Mesh(armGeo, makeStandardMaterial(accent, 'matte', 1));
    arm.position.set(x, H * 0.25, -D * 0.05);
    arm.castShadow = true;
    group.add(arm);
  });

  // Thin legs
  const legR = 0.025, legH = seatH * 0.28;
  const legOffX = W / 2 - 0.12, legOffZ = D * 0.35;
  [[-legOffX, -legOffZ], [legOffX, -legOffZ], [-legOffX, legOffZ], [legOffX, legOffZ]].forEach(([x, z]) => {
    addCylinder(group, { radiusTop: legR, height: legH, position: [x, legH / 2, z - D * 0.05], color: accent, preset: 'metal', radialSegments: 8 });
  });

  addLabel(group, item.labelText, H + 0.35);
  return group;
}

export function buildStool(group, item, W, H, color) {
  const seat = addCylinder(group, {
    radiusTop: W * 0.45,
    height: 0.06,
    position: [0, H, 0],
    color,
    preset: 'matte',
    radialSegments: 24
  });
  markMain(seat, color);
  const legRadius = 0.018;
  const legOffset = W * 0.28;
  [[-legOffset, -legOffset], [legOffset, -legOffset], [-legOffset, legOffset], [legOffset, legOffset]].forEach(([x, z]) => {
    addCylinder(group, { radiusTop: legRadius, height: H, position: [x, H / 2, z], color: '#6B7280', preset: 'metal' });
  });
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(W * 0.24, 0.012, 8, 24),
    makeStandardMaterial('#6B7280', 'metal', 1)
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = H * 0.42;
  group.add(ring);
}
