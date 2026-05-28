import {
  addBox, addCylinder, addSphere, addLabel,
  markMain, makeStandardMaterial, addPolylineTubes
} from './primitives.js';

export function buildSpeaker(group, item, L, W, H, color) {
  const body = addBox(group, { size: [L, H, W], position: [0, H / 2, 0], color, preset: 'matte' });
  markMain(body, color);
  addBox(group, { size: [L * 0.94, H * 0.78, 0.016], position: [0, H * 0.50, W / 2 + 0.008], color: '#1A1A2E', preset: 'matte' });

  const wooferR = Math.min(L, H) * 0.34;
  addCylinder(group, { radiusTop: wooferR, height: 0.055, position: [0, H * 0.36, W / 2 + 0.024], color: '#2D3748', preset: 'matte', radialSegments: 28 });
  addCylinder(group, { radiusTop: wooferR * 0.27, height: 0.034, position: [0, H * 0.36, W / 2 + 0.056], color: '#111827', preset: 'matte', radialSegments: 16 });
  const wooferRing = new THREE.Mesh(
    new THREE.TorusGeometry(wooferR * 0.88, wooferR * 0.09, 8, 28),
    makeStandardMaterial('#111827', 'matte', 1)
  );
  wooferRing.rotation.x = Math.PI / 2;
  wooferRing.position.set(0, H * 0.36, W / 2 + 0.018);
  group.add(wooferRing);

  addBox(group, { size: [L * 0.78, H * 0.21, 0.058], position: [0, H * 0.75, W / 2 + 0.029], color: '#111827', preset: 'matte' });
  addCylinder(group, { radiusTop: 0.022, height: 0.038, position: [0, H * 0.75, W / 2 + 0.07], color: '#1E293B', preset: 'matte', radialSegments: 12 });

  const portCount = Math.max(1, Math.round(L / 0.3));
  for (let i = 0; i < portCount; i++) {
    addCylinder(group, { radiusTop: 0.034, height: 0.02, position: [-L / 2 + (L / portCount) * (i + 0.5), H * 0.09, W / 2 + 0.01], color: '#0F172A', preset: 'matte', radialSegments: 12 });
  }

  [[L / 2 - 0.012, W / 2 - 0.012], [-L / 2 + 0.012, W / 2 - 0.012],
   [L / 2 - 0.012, -W / 2 + 0.012], [-L / 2 + 0.012, -W / 2 + 0.012]].forEach(([x, z]) => {
    addCylinder(group, { radiusTop: 0.012, height: H, position: [x, H / 2, z], color: '#374151', preset: 'matte', radialSegments: 8 });
  });

  [-L * 0.27, L * 0.27].forEach(x => addBox(group, { size: [0.024, 0.11, 0.024], position: [x, H + 0.042, 0], color: '#6B7280', preset: 'metal' }));
  addBox(group, { size: [L * 0.66, 0.022, 0.022], position: [0, H + 0.097, 0], color: '#6B7280', preset: 'metal' });
}

export function buildMicrophone(group, item, L, W, H, color) {
  const standR = Math.min(L, W) * 0.09;
  const baseR = Math.min(L, W) * 0.42;
  const headR = Math.min(L, W) * 0.36;
  const chrome = '#94A3B8', dark = '#1F2937', black = '#0F172A';

  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const fx = Math.cos(a) * baseR, fz = Math.sin(a) * baseR;
    addPolylineTubes(group, [[0, 0.06, 0], [fx * 0.45, 0.04, fz * 0.45], [fx, 0.012, fz]], 0.012, '#374151');
    addCylinder(group, { radiusTop: 0.022, height: 0.014, position: [fx, 0.007, fz], color: black, preset: 'matte', radialSegments: 8 });
  }
  addCylinder(group, { radiusTop: 0.032, height: 0.072, position: [0, 0.036, 0], color: '#374151', preset: 'metal', radialSegments: 10 });

  const poleH = H * 0.78;
  const pole = addCylinder(group, { radiusTop: standR, height: poleH, position: [0, 0.072 + poleH / 2, 0], color: chrome, preset: 'metal', radialSegments: 12 });
  markMain(pole, color);
  addCylinder(group, { radiusTop: standR * 2.4, height: 0.038, position: [0, H * 0.52, 0], color: dark, preset: 'matte', radialSegments: 10 });
  addCylinder(group, { radiusTop: standR * 1.5, height: 0.07, position: [0, H * 0.56, 0], color: '#1E293B', preset: 'matte', radialSegments: 10 });
  addCylinder(group, { radiusTop: headR * 0.48, height: 0.055, position: [0, poleH + 0.072, 0], color: dark, preset: 'metal', radialSegments: 12 });
  const capsH = headR * 1.55;
  addCylinder(group, { radiusTop: headR * 0.44, radiusBottom: headR * 0.38, height: capsH, position: [0, poleH + 0.072 + 0.028 + capsH / 2, 0], color: dark, preset: 'metal', radialSegments: 14 });
  const grillY = poleH + 0.072 + 0.028 + capsH + headR * 0.58;
  addSphere(group, { radius: headR, position: [0, grillY, 0], color: '#1A1A2E', preset: 'matte' });
  addSphere(group, { radius: headR * 0.88, position: [0, grillY, 0], color: black, preset: 'matte' });
}

export function buildMesaDJ(group, item, L, W, H, color) {
  const tH = H * 0.68;
  const base = addBox(group, { size: [L, tH * 0.84, W], position: [0, tH * 0.42, 0], color: '#111827', preset: 'matte' });
  markMain(base, '#111827');
  addBox(group, { size: [L + 0.04, 0.05, W + 0.04], position: [0, tH + 0.025, 0], color: '#1E293B', preset: 'metal' });
  addBox(group, { size: [L * 0.34, tH * 0.14, W * 0.84], position: [0, tH + 0.07, 0], color: '#0F172A', preset: 'matte' });
  const turntableR = Math.min(L * 0.15, W * 0.36);
  [-L * 0.24, L * 0.24].forEach(x =>
    addCylinder(group, { radiusTop: turntableR, height: 0.04, position: [x, tH + 0.07, 0], color: '#0F172A', preset: 'matte', radialSegments: 24 })
  );
  [-L * 0.48, L * 0.48].forEach(x => {
    addBox(group, { size: [L * 0.12, H * 0.86, W * 0.84], position: [x, H * 0.43, 0], color: '#0F172A', preset: 'matte' });
    addSphere(group, { radius: W * 0.24, position: [x, H * 0.36, W * 0.42 + 0.04], color: '#1E293B', preset: 'metal' });
    addSphere(group, { radius: W * 0.1, position: [x, H * 0.62, W * 0.42 + 0.04], color: '#374151', preset: 'metal' });
  });
  addSphere(group, { radius: 0.055, position: [0, tH + 0.2, W * 0.42 + 0.04], color: '#FF00AA', emissive: true });
}
