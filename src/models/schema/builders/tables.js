import {
  addBox, addCylinder, addLabel, addTopLabel, markMain,
  makeStandardMaterial, makeTopFill, colorNumber
} from './primitives.js';

export function buildRoundTable(item, view) {
  const group = new THREE.Group();
  const diameter = item.dims?.diameter ?? 1.8;
  const height = item.dims?.height ?? 0.75;
  const color = item.color || '#DDD4C8';
  const materialPreset = item.visual?.materialPreset || 'fabric';
  const opacity = item.visual?.opacity ?? 1;

  if (view === 'top') {
    const fill = new THREE.Mesh(new THREE.CircleGeometry(diameter / 2, 72), makeTopFill(color, 0.18));
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.04;
    markMain(fill, color);
    group.add(fill);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(Math.max(0.03, diameter / 2 - 0.04), diameter / 2, 72),
      new THREE.MeshBasicMaterial({ color: colorNumber('#111827'), transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.045;
    group.add(ring);
    addTopLabel(group, item.labelText, '#111827');
    return group;
  }

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(diameter / 2, diameter / 2, 0.06, 64),
    makeStandardMaterial(color, materialPreset, opacity)
  );
  top.position.y = height;
  top.castShadow = item.visual?.shadows !== false;
  top.receiveShadow = true;
  markMain(top, color);
  group.add(top);

  const cloth = new THREE.Mesh(
    new THREE.CylinderGeometry(diameter / 2 + 0.04, diameter / 2 + 0.12, height - 0.05, 52, 1, true),
    makeStandardMaterial(color, 'fabric', Math.min(opacity, 0.96))
  );
  cloth.position.y = (height - 0.05) / 2;
  cloth.castShadow = item.visual?.shadows !== false;
  group.add(cloth);

  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, height, 12),
    makeStandardMaterial('#6B6864', 'metal', 1)
  );
  leg.position.y = height / 2;
  leg.castShadow = true;
  group.add(leg);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(diameter * 0.18, diameter * 0.2, 0.05, 32),
    makeStandardMaterial('#6B6864', 'metal', 1)
  );
  base.position.y = 0.025;
  group.add(base);
  addLabel(group, item.labelText, height + 0.45);
  return group;
}

export function buildChair(item, view) {
  const group = new THREE.Group();
  const W = item.dims?.width ?? 0.44;
  const D = item.dims?.depth ?? 0.44;
  const SH = item.dims?.seatHeight ?? 0.45;
  const TH = item.dims?.totalHeight ?? 0.85;
  const color = item.color || '#F5F3EE';
  const accent = item.subtype === 'napoleon' ? '#C7A25F' : color;

  if (view === 'top') {
    const seat = new THREE.Mesh(new THREE.PlaneGeometry(W, D), makeTopFill(accent, 0.28));
    seat.rotation.x = -Math.PI / 2;
    seat.position.y = 0.04;
    markMain(seat, accent);
    group.add(seat);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, 0.08), makeTopFill('#111827', 0.22));
    back.rotation.x = -Math.PI / 2;
    back.position.set(0, 0.041, D / 2 - 0.04);
    group.add(back);
    return group;
  }

  const material = makeStandardMaterial(accent, item.visual?.materialPreset || 'default', item.visual?.opacity ?? 1);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), material);
  seat.position.y = SH;
  seat.castShadow = item.visual?.shadows !== false;
  markMain(seat, accent);
  group.add(seat);

  const backHeight = Math.max(0.2, TH - SH - 0.03);
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, backHeight, 0.03), material.clone());
  back.position.set(0, SH + backHeight / 2, D / 2 - 0.02);
  back.castShadow = item.visual?.shadows !== false;
  group.add(back);

  const legMat = makeStandardMaterial(item.subtype === 'tolix' ? accent : '#6B6864', 'metal', 1);
  const legGeo = new THREE.CylinderGeometry(0.01, 0.012, SH, 8);
  const offX = W / 2 - 0.04;
  const offZ = D / 2 - 0.04;
  [[-offX, -offZ], [offX, -offZ], [-offX, offZ], [offX, offZ]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat.clone());
    leg.position.set(x, SH / 2, z);
    leg.castShadow = true;
    group.add(leg);
  });
  return group;
}

export function buildChairLine(item, view) {
  const group = new THREE.Group();
  const count = Math.max(2, item.count ?? 6);
  const gap = item.gap ?? 0.5;
  for (let index = 0; index < count; index += 1) {
    const chair = buildChair(item, view);
    chair.position.x = index * gap - ((count - 1) * gap) / 2;
    group.add(chair);
  }
  return group;
}

export function buildMesaPlegable(group, item, L, W, H, color) {
  const topThick = 0.03;
  const legSize = 0.04;
  const legColor = '#C0BDB8';
  const inset = 0.06;
  const legH = H - topThick;

  const top = addBox(group, { size: [L, topThick, W], position: [0, H - topThick / 2, 0], color, preset: 'matte' });
  markMain(top, color);

  [[L / 2 - inset, W / 2 - inset], [L / 2 - inset, -W / 2 + inset],
   [-L / 2 + inset, W / 2 - inset], [-L / 2 + inset, -W / 2 + inset]].forEach(([x, z]) => {
    addBox(group, { size: [legSize, legH, legSize], position: [x, legH / 2, z], color: legColor, preset: 'metal' });
  });

  const braceY = H * 0.35;
  const bt = 0.02;
  addBox(group, { size: [L - 0.12, bt, bt], position: [0, braceY, W / 2 - inset], color: legColor, preset: 'metal' });
  addBox(group, { size: [L - 0.12, bt, bt], position: [0, braceY, -W / 2 + inset], color: legColor, preset: 'metal' });
}
