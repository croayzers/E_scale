import { addBox, addCylinder, addLabel, markMain, makeStandardMaterial, makeTopFill } from './primitives.js';

export function buildSofa(item, view) {
  const group = new THREE.Group();
  const W = item.dims?.width ?? 1.4;
  const D = item.dims?.length ?? 0.9;
  const H = item.dims?.height ?? 0.82;
  const color = item.color || '#CFC7BC';
  const accent = item.accentColor || '#8B5E3C';

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

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(W, H * 0.45, D),
    makeStandardMaterial(color, 'fabric', 1)
  );
  base.position.y = H * 0.22;
  base.castShadow = true;
  markMain(base, color);
  group.add(base);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(W, H * 0.4, D * 0.16),
    makeStandardMaterial(color, 'fabric', 1)
  );
  back.position.set(0, H * 0.52, D / 2 - D * 0.08);
  group.add(back);

  const armGeo = new THREE.BoxGeometry(W * 0.12, H * 0.32, D * 0.82);
  [-W / 2 + W * 0.06, W / 2 - W * 0.06].forEach(x => {
    const arm = new THREE.Mesh(armGeo, makeStandardMaterial(accent, 'matte', 1));
    arm.position.set(x, H * 0.28, 0);
    group.add(arm);
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
