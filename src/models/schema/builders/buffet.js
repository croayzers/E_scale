import {
  addBox, addCylinder, addSphere, addWheel, addLabel, addTopLabel,
  addTopFootprint, markMain
} from './primitives.js';

export function buildBuffet(item, view) {
  const group = new THREE.Group();
  const L = item.dims?.length ?? 3.6;
  const W = item.dims?.width ?? 0.8;
  const H = item.dims?.height ?? 0.9;
  const color = item.color || '#DDD4C8';
  if (view === 'top') {
    addTopFootprint(group, item, L, W, color, 0.22);
    addTopLabel(group, item.labelText || item.subtype || 'Buffet');
    return group;
  }
  const body = addBox(group, {
    size: [L, H, W],
    position: [0, H / 2, 0],
    color,
    preset: item.visual?.materialPreset || 'fabric',
    opacity: item.visual?.opacity ?? 1
  });
  markMain(body, color);

  addBox(group, { size: [L + 0.04, 0.05, W + 0.04], position: [0, H + 0.02, 0], color: '#6B6864', preset: 'matte' });

  const toldoColor = item.toldoColor || '#C8A87A';
  const postH = 0.85;
  const awningW = W + 0.35;
  const awningL = L + 0.08;
  const awningY = H + postH;
  [-(L / 2 - 0.06), (L / 2 - 0.06)].forEach(x => {
    addBox(group, { size: [0.04, postH, 0.04], position: [x, H + postH / 2, W / 2 - 0.03], color: toldoColor, preset: 'matte' });
  });
  const awning = addBox(group, {
    size: [awningL, 0.06, awningW],
    position: [0, awningY, (awningW - W) / 2 - 0.05],
    color: toldoColor,
    preset: 'fabric'
  });
  awning.rotation.x = 0.15;
  addBox(group, {
    size: [awningL, 0.22, 0.03],
    position: [0, awningY - 0.12, -(awningW / 2) + 0.02],
    color: toldoColor,
    preset: 'fabric'
  });
  addLabel(group, item.labelText || item.subtype || 'Buffet', awningY + 0.45);
  return group;
}

export function buildBuffetCarrito(item, view) {
  const group = new THREE.Group();
  const L = item.dims?.length ?? 1.2;
  const W = item.dims?.width ?? 0.7;
  const H = item.dims?.height ?? 0.9;
  const color = item.color || '#E0DDD8';
  const metal = '#9CA3AF';

  if (view === 'top') {
    addTopFootprint(group, item, L, W, color, 0.15);
    addTopLabel(group, item.labelText || 'Carrito');
    return group;
  }

  const shelf1 = addBox(group, { size: [L, 0.03, W], position: [0, H * 0.28, 0], color: '#D1CEC9', preset: 'matte' });
  markMain(shelf1, color);
  addBox(group, { size: [L, 0.03, W], position: [0, H * 0.62, 0], color: '#D1CEC9', preset: 'matte' });
  addBox(group, { size: [L + 0.02, 0.025, W + 0.02], position: [0, H, 0], color: '#C8C4BE', preset: 'matte' });

  const offX = L / 2 - 0.04;
  const offZ = W / 2 - 0.04;
  [[offX, offZ], [-offX, offZ], [offX, -offZ], [-offX, -offZ]].forEach(([x, z]) => {
    addBox(group, { size: [0.03, H, 0.03], position: [x, H / 2, z], color: metal, preset: 'metal' });
  });
  [[offX, offZ], [-offX, offZ], [offX, -offZ], [-offX, -offZ]].forEach(([x, z]) => {
    addSphere(group, { radius: 0.035, position: [x, 0.035, z], color: '#374151', preset: 'matte' });
  });
  addLabel(group, item.labelText || 'Carrito', H + 0.35);
  return group;
}

export function buildBuffetCarro(item, view) {
  const group = new THREE.Group();
  const L = item.dims?.length ?? 3;
  const W = item.dims?.width ?? 1.5;
  const H = item.dims?.height ?? 1.0;
  const color = item.color || '#E8E4DF';
  const metal = '#4B5563';

  if (view === 'top') {
    addTopFootprint(group, item, L, W, color, 0.18);
    addTopLabel(group, item.labelText || 'Buffet carro');
    return group;
  }

  const wheelR = 0.18;
  const bodyBase = wheelR * 2;
  const offX = L / 2 - 0.15;
  const offZ = W / 2 - 0.18;

  [[offX, offZ], [-offX, offZ], [offX, -offZ], [-offX, -offZ]].forEach(([x, z]) => {
    addCylinder(group, { radiusTop: wheelR, height: wheelR * 0.42, position: [x, wheelR, z], color: '#1A1A1C', preset: 'matte', radialSegments: 24, rotation: [Math.PI / 2, 0, 0] });
    addCylinder(group, { radiusTop: wheelR * 0.52, height: wheelR * 0.44, position: [x, wheelR, z], color: metal, preset: 'metal', radialSegments: 12, rotation: [Math.PI / 2, 0, 0] });
    addCylinder(group, { radiusTop: 0.03, height: wheelR * 0.5, position: [x, wheelR, z], color: '#94A3B8', preset: 'metal', radialSegments: 8, rotation: [Math.PI / 2, 0, 0] });
  });

  [offX, -offX].forEach(x => addBox(group, { size: [0.04, 0.04, W - 0.3], position: [x, wheelR, 0], color: metal, preset: 'metal' }));

  [[offX, offZ], [-offX, offZ], [offX, -offZ], [-offX, -offZ]].forEach(([x, z]) => {
    addBox(group, { size: [0.06, bodyBase - wheelR, 0.06], position: [x, wheelR + (bodyBase - wheelR) / 2, z], color: metal, preset: 'metal' });
  });

  const base = addBox(group, { size: [L, 0.07, W], position: [0, bodyBase + 0.035, 0], color: metal, preset: 'matte' });
  markMain(base, color);

  addBox(group, { size: [L, H * 0.55, W * 0.92], position: [0, bodyBase + 0.07 + H * 0.275, 0], color, preset: 'fabric' });
  addBox(group, { size: [L + 0.04, 0.05, W + 0.04], position: [0, bodyBase + 0.07 + H * 0.57, 0], color: '#D1D5DB', preset: 'matte' });
  addBox(group, { size: [L - 0.06, 0.03, W * 0.88], position: [0, bodyBase + 0.07 + H * 0.36, 0], color: '#D4D0CB', preset: 'matte' });
  addBox(group, { size: [L, H * 0.36, 0.025], position: [0, bodyBase + 0.07 + H * 0.60, W / 2 - 0.015], color: '#B0CAD8', preset: 'glass' });

  addLabel(group, item.labelText || 'Buffet carro', bodyBase + H + 0.45);
  return group;
}
