import {
  addBox, addCylinder, addSphere, addWheel, addLabel,
  addTransparentShell, addPolylineTubes, markMain
} from './primitives.js';

export function buildPortableToilet(group, item, L, W, H, color) {
  const cabin = addBox(group, { size: [L, H, W], position: [0, H / 2, 0], color, preset: 'matte' });
  markMain(cabin, color);
  addBox(group, { size: [L + 0.06, 0.08, W + 0.06], position: [0, H + 0.04, 0], color: '#0F172A', preset: 'metal' });
  addBox(group, { size: [L * 0.58, H * 0.5, 0.02], position: [0, H * 0.46, W / 2 + 0.011], color: '#E5E7EB', preset: 'glass', opacity: 0.48 });
}

export function buildSinkStation(group, item, L, W, H, color) {
  const base = addBox(group, { size: [L, H * 0.82, W], position: [0, H * 0.41, 0], color, preset: 'matte' });
  markMain(base, color);
  addBox(group, { size: [L + 0.06, 0.05, W + 0.06], position: [0, H * 0.84, 0], color: '#CBD5E1', preset: 'metal' });
  addCylinder(group, { radiusTop: 0.07, height: 0.24, position: [0, H + 0.06, 0], color: '#94A3B8', preset: 'metal' });
}

export function buildGenerator(group, item, L, W, H, color) {
  const body = addBox(group, { size: [L, H * 0.78, W], position: [0, H * 0.42, 0], color, preset: 'metal' });
  markMain(body, color);
  addBox(group, { size: [L * 0.86, H * 0.12, W * 0.8], position: [0, H * 0.83, 0], color: '#111827', preset: 'matte' });
  [-L * 0.32, L * 0.32].forEach(x => {
    addWheel(group, x, 0.12, -W / 2 - 0.05, 0.1);
    addWheel(group, x, 0.12, W / 2 + 0.05, 0.1);
  });
}

export function buildElectricalBox(group, item, L, W, H, color) {
  const body = addBox(group, { size: [L, H, W], position: [0, H / 2, 0], color, preset: 'metal' });
  markMain(body, color);
  addBox(group, { size: [L * 0.7, H * 0.65, 0.02], position: [0, H * 0.52, W / 2 + 0.011], color: '#E5E7EB', preset: 'glass', opacity: 0.26 });
}

export function buildExtinguisher(group, item, H, color) {
  const body = addCylinder(group, { radiusTop: 0.12, radiusBottom: 0.12, height: H, position: [0, H / 2, 0], color, preset: 'matte', radialSegments: 18 });
  markMain(body, color);
  addCylinder(group, { radiusTop: 0.04, height: 0.16, position: [0, H + 0.06, 0], color: '#111827', preset: 'metal' });
  addPolylineTubes(group, [[0, H + 0.02, 0], [0.16, H + 0.08, 0.05], [0.1, H * 0.72, 0.08]], 0.012, '#111827');
}

export function buildRecyclingPoint(group, item, L, W, H, color) {
  const segment = L / 3;
  for (let i = 0; i < 3; i += 1) {
    const x = -L / 2 + segment * 0.5 + segment * i;
    const bin = addBox(group, {
      size: [segment * 0.9, H, W],
      position: [x, H / 2, 0],
      color: i === 0 ? '#16A34A' : i === 1 ? '#0EA5E9' : color,
      preset: 'matte'
    });
    if (i === 0) markMain(bin, '#16A34A');
  }
}

export function buildTrashContainer(group, item, W, H, color) {
  const body = addCylinder(group, { radiusTop: W * 0.46, radiusBottom: W * 0.4, height: H, position: [0, H / 2, 0], color, preset: 'matte', radialSegments: 20 });
  markMain(body, color);
  addCylinder(group, { radiusTop: W * 0.5, height: 0.08, position: [0, H + 0.04, 0], color: '#111827', preset: 'metal' });
}

export function buildSignPanel(group, item, L, W, H, color) {
  const board = addBox(group, { size: [L, H, Math.max(0.04, W)], position: [0, H / 2 + 0.32, 0], color, preset: 'glass', opacity: 0.82 });
  markMain(board, color);
  [-L / 2 + 0.08, L / 2 - 0.08].forEach(x => {
    addCylinder(group, { radiusTop: 0.025, height: 0.64, position: [x, 0.32, 0], color: '#6B7280', preset: 'metal' });
  });
}

export function buildFence(group, item, L, W, H, color) {
  const shell = addTransparentShell(group, new THREE.BoxGeometry(L, H, W), color, 0.05);
  markMain(shell, color);
  const sections = Math.max(2, Math.round(L / 0.6));
  for (let i = 0; i <= sections; i += 1) {
    const x = -L / 2 + (L * i) / sections;
    addCylinder(group, { radiusTop: 0.018, height: H, position: [x, H / 2, 0], color, preset: 'metal' });
  }
  [H * 0.32, H * 0.68].forEach(y => {
    addBox(group, { size: [L, 0.04, 0.04], position: [0, y, 0], color, preset: 'metal' });
  });
}

export function buildInfoPoint(group, item, L, W, H, color) {
  const body = addBox(group, { size: [L, H * 0.72, W], position: [0, H * 0.36, 0], color, preset: 'fabric' });
  markMain(body, color);
  addBox(group, { size: [L * 0.72, H * 0.24, 0.05], position: [0, H * 0.86, W / 2 + 0.03], color: '#F8FAFC', preset: 'glass', opacity: 0.62 });
}

export function buildBarStraight(group, item, L, W, H, color) {
  const counter = addBox(group, { size: [L, H * 0.82, W], position: [0, H * 0.41, 0], color, preset: 'matte' });
  markMain(counter, color);
  addBox(group, { size: [L + 0.08, 0.06, W + 0.1], position: [0, H + 0.02, 0], color: '#E5E7EB', preset: 'metal' });
  for (let i = 0; i < 4; i += 1) {
    const x = -L / 2 + L * (i + 0.5) / 4;
    addBox(group, { size: [0.05, H * 0.72, 0.03], position: [x, H * 0.38, W / 2 + 0.02], color: '#F8FAFC', preset: 'glass', opacity: 0.38 });
  }
}

export function buildFridge(group, item, L, W, H, color) {
  const body = addBox(group, { size: [L, H, W], position: [0, H / 2, 0], color, preset: 'metal' });
  markMain(body, color);
  addBox(group, { size: [L * 0.78, H * 0.78, 0.03], position: [0, H * 0.54, W / 2 + 0.02], color: '#E5F4FF', preset: 'glass', opacity: 0.24 });
  addBox(group, { size: [0.04, H * 0.52, 0.02], position: [L * 0.24, H * 0.54, W / 2 + 0.03], color: '#64748B', preset: 'metal' });
}

export function buildBottleRack(group, item, L, W, H, color) {
  const shell = addTransparentShell(group, new THREE.BoxGeometry(L, H, W), color, 0.06);
  markMain(shell, color);
  const postR = 0.018;
  const x = L / 2 - 0.04, z = W / 2 - 0.04;
  [[-x, -z], [x, -z], [-x, z], [x, z]].forEach(([px, pz]) => {
    addCylinder(group, { radiusTop: postR, height: H, position: [px, H / 2, pz], color, preset: 'metal' });
  });
  [0.32, 0.62].forEach(t => {
    addBox(group, { size: [L, 0.03, W], position: [0, H * t, 0], color: '#CBD5E1', preset: 'metal' });
  });
}

export function buildCoffeeMachine(group, item, L, W, H, color) {
  const chrome = '#CBD5E1', shiny = '#D1D5DB', dark = '#1E293B', black = '#0F172A';
  const groupCount = Math.max(1, Math.round(L / 0.38));

  const body = addBox(group, { size: [L, H * 0.84, W], position: [0, H * 0.42, 0], color, preset: 'metal' });
  markMain(body, color);
  addBox(group, { size: [L + 0.03, 0.04, W + 0.03], position: [0, 0.02, 0], color: chrome, preset: 'metal' });
  addBox(group, { size: [L - 0.04, 0.014, W - 0.04], position: [0, 0.042, 0], color: '#374151', preset: 'matte' });
  addBox(group, { size: [L + 0.02, 0.055, W + 0.02], position: [0, H * 0.84 + 0.028, 0], color: shiny, preset: 'metal' });

  for (let i = 0; i < groupCount; i++) {
    const hx = groupCount > 1 ? -L / 2 + (L / groupCount) * (i + 0.5) : 0;
    addCylinder(group, { radiusTop: 0.078, radiusBottom: 0.12, height: 0.22, position: [hx, H * 0.84 + 0.055 + 0.11, 0], color: dark, preset: 'glass', opacity: 0.6, radialSegments: 20 });
    addCylinder(group, { radiusTop: 0.088, height: 0.028, position: [hx, H * 0.84 + 0.055 + 0.22 + 0.014, 0], color: black, preset: 'matte', radialSegments: 16 });
  }
  for (let i = 0; i < groupCount; i++) {
    const gx = groupCount > 1 ? -L / 2 + (L / groupCount) * (i + 0.5) : 0;
    addCylinder(group, { radiusTop: 0.058, height: 0.06, position: [gx, H * 0.44, W / 2 + 0.03], color: chrome, preset: 'metal', radialSegments: 18 });
    addPolylineTubes(group, [[gx, H * 0.42, W / 2 + 0.09], [gx - 0.055, H * 0.37, W / 2 + 0.17], [gx + 0.055, H * 0.37, W / 2 + 0.17]], 0.012, dark);
    addCylinder(group, { radiusTop: 0.007, height: 0.055, position: [gx - 0.016, H * 0.31, W / 2 + 0.03], color: chrome, preset: 'metal', radialSegments: 6 });
    addCylinder(group, { radiusTop: 0.007, height: 0.055, position: [gx + 0.016, H * 0.31, W / 2 + 0.03], color: chrome, preset: 'metal', radialSegments: 6 });
  }
  [-L * 0.46, L * 0.46].forEach((x, idx) => {
    const side = idx === 0 ? -1 : 1;
    addPolylineTubes(group, [
      [x, H * 0.57, W / 2 + 0.01],
      [x + side * 0.06, H * 0.44, W / 2 + 0.1],
      [x + side * 0.1, H * 0.29, W / 2 + 0.15]
    ], 0.013, chrome);
    addCylinder(group, { radiusTop: 0.018, height: 0.024, position: [x + side * 0.1, H * 0.28, W / 2 + 0.15], color: chrome, preset: 'metal', radialSegments: 8 });
  });
  [-L * 0.28, L * 0.28].forEach(x => {
    addCylinder(group, { radiusTop: 0.034, height: 0.022, position: [x, H * 0.68, W / 2 + 0.011], color: shiny, preset: 'metal', radialSegments: 20 });
    addCylinder(group, { radiusTop: 0.027, height: 0.024, position: [x, H * 0.68, W / 2 + 0.022], color: '#E5E7EB', preset: 'glass', opacity: 0.75, radialSegments: 18 });
  });
  for (let i = 0; i < groupCount; i++) {
    const kx = groupCount > 1 ? -L / 2 + (L / groupCount) * (i + 0.5) : 0;
    addCylinder(group, { radiusTop: 0.022, height: 0.032, position: [kx, H * 0.72, W / 2 + 0.012], color: black, preset: 'matte', radialSegments: 12 });
  }
}

export function buildServiceCart(group, item, L, W, H, color) {
  const shell = addTransparentShell(group, new THREE.BoxGeometry(L, H, W), color, 0.05);
  markMain(shell, color);
  const postR = 0.018;
  const x = L / 2 - 0.05, z = W / 2 - 0.05;
  [[-x, -z], [x, -z], [-x, z], [x, z]].forEach(([px, pz]) => {
    addCylinder(group, { radiusTop: postR, height: H, position: [px, H / 2, pz], color: '#6B7280', preset: 'metal' });
  });
  [0.28, 0.7].forEach(t => addBox(group, { size: [L, 0.04, W], position: [0, H * t, 0], color, preset: 'matte' }));
  [[-x, -z], [x, -z], [-x, z], [x, z]].forEach(([px, pz]) => addWheel(group, px, 0.08, pz, 0.08));
}

export function buildDrinkDispenser(group, item, W, H, color) {
  const body = addCylinder(group, { radiusTop: W * 0.42, radiusBottom: W * 0.4, height: H, position: [0, H / 2 + 0.18, 0], color, preset: 'glass', opacity: 0.72, radialSegments: 24 });
  markMain(body, color);
  addBox(group, { size: [W * 0.76, 0.08, W * 0.76], position: [0, 0.04, 0], color: '#6B7280', preset: 'metal' });
  addBox(group, { size: [0.08, 0.05, 0.16], position: [W * 0.18, H * 0.42, W * 0.42], color: '#6B7280', preset: 'metal' });
}

export function buildShowcase(group, item, L, W, H, color) {
  const baseH = H * 0.32;
  const base = addBox(group, { size: [L, baseH, W], position: [0, baseH / 2, 0], color, preset: 'matte' });
  markMain(base, color);
  addBox(group, { size: [L, H * 0.66, W], position: [0, baseH + H * 0.33, 0], color: '#F8FAFC', preset: 'glass', opacity: 0.2 });
}
