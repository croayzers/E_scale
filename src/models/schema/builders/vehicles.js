import {
  addBox, addCylinder, addSphere, addWheel, addPolylineTubes,
  markMain, makeStandardMaterial, tubeBetween
} from './primitives.js';

export function buildCoche(group, item, L, W, H, color) {
  const bH = H * 0.50;
  const body = addBox(group, { size: [L, bH, W], position: [0, bH / 2, 0], color, preset: 'matte' });
  markMain(body, color);
  addBox(group, { size: [L * 0.48, H - bH, W * 0.88], position: [-L * 0.04, bH + (H - bH) / 2, 0], color, preset: 'matte' });
  addBox(group, { size: [0.06, (H - bH) * 0.72, W * 0.82], position: [L * 0.19, bH + (H - bH) * 0.36, 0], color: '#9EC8EE', preset: 'glass', opacity: 0.52 });
  addBox(group, { size: [0.06, (H - bH) * 0.72, W * 0.82], position: [-L * 0.26, bH + (H - bH) * 0.36, 0], color: '#9EC8EE', preset: 'glass', opacity: 0.52 });
  [-W * 0.28, W * 0.28].forEach(z =>
    addBox(group, { size: [0.06, 0.1, 0.16], position: [L / 2 - 0.04, bH * 0.58, z], color: '#FFFDE7', preset: 'glass', opacity: 0.9 })
  );
  const wr = H * 0.22, wt = wr * 0.52;
  [[L * 0.3, W / 2 + wt / 2], [L * 0.3, -(W / 2 + wt / 2)],
   [-L * 0.3, W / 2 + wt / 2], [-L * 0.3, -(W / 2 + wt / 2)]].forEach(([wx, wz]) => {
    addWheel(group, wx, wr, wz, wr, '#1C1C1E');
    addCylinder(group, { radiusTop: wr * 0.44, height: 0.02, position: [wx, wr, wz + (wz > 0 ? -wt * 0.4 : wt * 0.4)], color: '#94A3B8', preset: 'metal', radialSegments: 14, rotation: [Math.PI / 2, 0, 0] });
  });
}

export function buildMoto(group, item, L, W, H, color) {
  const wr = H * 0.3;
  const frameW = Math.min(W * 0.28, 0.22);
  addBox(group, { size: [L * 0.32, H * 0.32, frameW], position: [0, wr * 1.1, 0], color: '#374151', preset: 'metal' });
  const frame = addBox(group, { size: [L * 0.54, 0.08, 0.06], position: [-L * 0.04, wr + H * 0.28, 0], color, preset: 'metal' });
  markMain(frame, color);
  addBox(group, { size: [L * 0.24, H * 0.18, frameW * 1.4], position: [L * 0.08, wr + H * 0.36, 0], color, preset: 'matte' });
  addBox(group, { size: [L * 0.26, 0.08, frameW * 1.6], position: [-L * 0.08, wr + H * 0.44, 0], color: '#111827', preset: 'matte' });
  addBox(group, { size: [0.06, 0.06, W * 0.78], position: [L * 0.3, wr + H * 0.5, 0], color: '#94A3B8', preset: 'metal' });
  addBox(group, { size: [0.04, wr * 0.9, 0.04], position: [L * 0.36, wr * 0.64, frameW * 0.4], color: '#9CA3AF', preset: 'metal' });
  addBox(group, { size: [0.04, wr * 0.9, 0.04], position: [L * 0.36, wr * 0.64, -frameW * 0.4], color: '#9CA3AF', preset: 'metal' });
  addBox(group, { size: [L * 0.32, 0.06, 0.06], position: [-L * 0.08, wr * 0.82, frameW * 0.6], color: '#6B7280', preset: 'metal' });
  addWheel(group, L * 0.36, wr, 0, wr, '#1C1C1E');
  addWheel(group, -L * 0.36, wr, 0, wr, '#1C1C1E');
}

export function buildCamion(group, item, L, W, H, color) {
  const cabL = L * 0.24, cargoL = L - cabL;
  const cargoH = H * 0.74;
  const cabX = L / 2 - cabL / 2, cargoX = -L / 2 + cargoL / 2;
  const cargo = addBox(group, { size: [cargoL, cargoH, W], position: [cargoX, cargoH / 2, 0], color: '#E2E8F0', preset: 'matte' });
  markMain(cargo, '#E2E8F0');
  addBox(group, { size: [cargoL + 0.06, 0.04, W + 0.06], position: [cargoX, cargoH, 0], color: '#CBD5E1', preset: 'metal' });
  addBox(group, { size: [cabL, H, W], position: [cabX, H / 2, 0], color, preset: 'matte' });
  addBox(group, { size: [0.08, H * 0.36, W * 0.82], position: [L / 2 - cabL + 0.04, H * 0.66, 0], color: '#9EC8EE', preset: 'glass', opacity: 0.52 });
  addBox(group, { size: [0.08, H * 0.22, W * 0.68], position: [L / 2 - 0.04, H * 0.22, 0], color: '#4B5563', preset: 'metal' });
  [-W * 0.32, W * 0.32].forEach(z =>
    addBox(group, { size: [0.06, 0.14, 0.2], position: [L / 2 - 0.04, H * 0.26, z], color: '#FFFDE7', preset: 'glass', opacity: 0.9 })
  );
  addCylinder(group, { radiusTop: 0.06, height: H * 0.42, position: [L / 2 - cabL + 0.18, H * 1.06, -W * 0.38], color: '#374151', preset: 'metal' });
  const wr = H * 0.16, wz = W / 2 + wr * 0.5;
  [[L * 0.36, wz], [L * 0.36, -wz], [-cargoL * 0.2, wz], [-cargoL * 0.2, -wz],
   [-cargoL * 0.44, wz], [-cargoL * 0.44, -wz]].forEach(([wx, wz_]) =>
    addWheel(group, wx, wr, wz_, wr, '#1C1C1E')
  );
}

export function buildAvioneta(group, item, L, W, H, color) {
  const fR = H * 0.21;
  const fuselage = new THREE.Mesh(
    new THREE.CylinderGeometry(fR, fR * 0.72, L * 0.86, 18),
    makeStandardMaterial(color, 'matte', 1)
  );
  fuselage.rotation.z = Math.PI / 2;
  fuselage.position.set(-L * 0.06, fR * 1.6, 0);
  markMain(fuselage, color);
  group.add(fuselage);
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(fR, fR * 1.6, 16),
    makeStandardMaterial(color, 'matte', 1)
  );
  nose.rotation.z = Math.PI / 2;
  nose.position.set(L * 0.4, fR * 1.6, 0);
  group.add(nose);
  addBox(group, { size: [L * 0.26, 0.1, W], position: [-L * 0.06, fR * 1.16, 0], color, preset: 'matte' });
  addBox(group, { size: [L * 0.18, H * 0.44, 0.1], position: [-L * 0.38, fR * 1.6 + H * 0.18, 0], color, preset: 'matte' });
  addBox(group, { size: [L * 0.16, 0.08, W * 0.28], position: [-L * 0.38, fR * 1.6 + 0.04, 0], color, preset: 'matte' });
  addBox(group, { size: [0.08, H * 0.52, 0.06], position: [L * 0.42 + fR * 0.8, fR * 1.6, 0], color: '#374151', preset: 'metal' });
  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(fR * 0.78, 14, 8, 0, Math.PI * 0.9, 0, Math.PI * 0.55),
    makeStandardMaterial('#9EC8EE', 'glass', 0.48)
  );
  cockpit.rotation.z = Math.PI / 2;
  cockpit.position.set(L * 0.22, fR * 1.82, 0);
  group.add(cockpit);
  const lgY = fR * 1.16;
  addCylinder(group, { radiusTop: 0.04, height: lgY, position: [L * 0.1, lgY / 2, W * 0.22], color: '#6B7280', preset: 'metal' });
  addCylinder(group, { radiusTop: 0.04, height: lgY, position: [L * 0.1, lgY / 2, -W * 0.22], color: '#6B7280', preset: 'metal' });
  addWheel(group, L * 0.1, fR * 0.36, W * 0.22, fR * 0.36, '#1C1C1E');
  addWheel(group, L * 0.1, fR * 0.36, -W * 0.22, fR * 0.36, '#1C1C1E');
  addCylinder(group, { radiusTop: 0.025, height: lgY * 0.48, position: [-L * 0.38, lgY * 0.24, 0], color: '#6B7280', preset: 'metal' });
  addWheel(group, -L * 0.38, fR * 0.16, 0, fR * 0.16, '#1C1C1E');
}

export function buildBarco(group, item, L, W, H, color) {
  const hullH = H * 0.38;
  const hull = addBox(group, { size: [L, hullH, W], position: [0, hullH / 2, 0], color, preset: 'matte' });
  markMain(hull, color);
  addBox(group, { size: [L * 0.14, hullH, W * 0.6], position: [L * 0.43, hullH / 2, 0], color, preset: 'matte' });
  addBox(group, { size: [L * 0.08, hullH, W * 0.24], position: [L * 0.47, hullH / 2, 0], color, preset: 'matte' });
  addBox(group, { size: [L * 0.82, 0.05, W * 0.92], position: [-L * 0.06, hullH + 0.025, 0], color: '#D4C5A0', preset: 'matte' });
  const superH = H * 0.48;
  addBox(group, { size: [L * 0.32, superH, W * 0.76], position: [-L * 0.14, hullH + superH / 2, 0], color: '#F1F5F9', preset: 'matte' });
  addBox(group, { size: [0.08, superH * 0.46, W * 0.64], position: [-L * 0.14 + L * 0.16, hullH + superH * 0.62, 0], color: '#9EC8EE', preset: 'glass', opacity: 0.52 });
  [-W * 0.38, W * 0.38].forEach(z =>
    addBox(group, { size: [L * 0.28, superH * 0.38, 0.08], position: [-L * 0.14, hullH + superH * 0.62, z], color: '#9EC8EE', preset: 'glass', opacity: 0.52 })
  );
  addCylinder(group, { radiusTop: 0.05, height: H * 0.72, position: [-L * 0.14, hullH + superH + H * 0.36, 0], color: '#9CA3AF', preset: 'metal' });
  for (let i = 0; i < 6; i++) {
    const rx = -L * 0.36 + i * (L * 0.78 / 5);
    addCylinder(group, { radiusTop: 0.022, height: H * 0.18, position: [rx, hullH + H * 0.09, W * 0.46], color: '#CBD5E1', preset: 'metal' });
    addCylinder(group, { radiusTop: 0.022, height: H * 0.18, position: [rx, hullH + H * 0.09, -W * 0.46], color: '#CBD5E1', preset: 'metal' });
  }
  addBox(group, { size: [L * 0.78, 0.025, 0.04], position: [-L * 0.06, hullH + H * 0.18, W * 0.46], color: '#CBD5E1', preset: 'metal' });
  addBox(group, { size: [L * 0.78, 0.025, 0.04], position: [-L * 0.06, hullH + H * 0.18, -W * 0.46], color: '#CBD5E1', preset: 'metal' });
}

export function buildHelicoptero(group, item, L, W, H, color) {
  const bodyH = H * 0.52;
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyH * 0.5, bodyH * 0.44, L * 0.44, 20),
    makeStandardMaterial(color, 'matte', 1)
  );
  body.rotation.z = Math.PI / 2;
  body.position.set(L * 0.1, bodyH * 0.78, 0);
  markMain(body, color);
  group.add(body);
  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(bodyH * 0.46, 16, 10, 0, Math.PI * 0.82, 0, Math.PI * 0.62),
    makeStandardMaterial('#9EC8EE', 'glass', 0.5)
  );
  cockpit.rotation.z = -Math.PI / 2;
  cockpit.position.set(L * 0.34, bodyH * 0.78, 0);
  group.add(cockpit);
  addBox(group, { size: [L * 0.5, bodyH * 0.24, bodyH * 0.24], position: [-L * 0.26, bodyH * 0.68, 0], color, preset: 'matte' });
  addBox(group, { size: [L * 0.16, bodyH * 0.44, 0.08], position: [-L * 0.44, bodyH * 0.82, 0], color, preset: 'matte' });
  addCylinder(group, { radiusTop: W * 0.22, height: 0.04, position: [-L * 0.48, bodyH * 0.82, W * 0.14], color: '#374151', preset: 'metal', radialSegments: 18, rotation: [Math.PI / 2, 0, 0] });
  addCylinder(group, { radiusTop: 0.06, height: bodyH * 0.34, position: [L * 0.1, bodyH * 1.28, 0], color: '#4B5563', preset: 'metal' });
  const rotorY = bodyH * 1.62;
  addBox(group, { size: [L * 0.92, 0.04, 0.12], position: [L * 0.1, rotorY, 0], color: '#1F2937', preset: 'metal' });
  addBox(group, { size: [0.12, 0.04, L * 0.92], position: [L * 0.1, rotorY, 0], color: '#1F2937', preset: 'metal' });
  const rotorDisc = new THREE.Mesh(
    new THREE.CircleGeometry(L * 0.46, 28),
    new THREE.MeshBasicMaterial({ color: 0x374151, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
  );
  rotorDisc.rotation.x = -Math.PI / 2;
  rotorDisc.position.set(L * 0.1, rotorY + 0.02, 0);
  group.add(rotorDisc);
  [-W * 0.4, W * 0.4].forEach(z => {
    addBox(group, { size: [L * 0.48, 0.04, 0.06], position: [L * 0.04, 0.04, z], color: '#6B7280', preset: 'metal' });
    addCylinder(group, { radiusTop: 0.025, height: bodyH * 0.44, position: [L * 0.18, bodyH * 0.22, z], color: '#6B7280', preset: 'metal', rotation: [0, 0, 0.18] });
    addCylinder(group, { radiusTop: 0.025, height: bodyH * 0.44, position: [-L * 0.08, bodyH * 0.22, z], color: '#6B7280', preset: 'metal', rotation: [0, 0, -0.18] });
  });
}

export function buildEscalera(group, item, L, W, H, color) {
  const steps = Math.max(3, Math.round(L / 0.55));
  const stepW = L / steps, stepH = H / steps;
  const railColor = '#94A3B8';
  const rW = Math.max(0.024, Math.min(W * 0.028, 0.048));
  const railAbove = 0.92;

  for (let i = 0; i < steps; i++) {
    const blockH = (i + 1) * stepH;
    const block = addBox(group, {
      size: [stepW, blockH, W],
      position: [-L / 2 + i * stepW + stepW / 2, blockH / 2, 0],
      color, preset: 'matte'
    });
    if (i === 0) markMain(block, color);
    addBox(group, {
      size: [stepW + 0.01, 0.024, W + 0.01],
      position: [-L / 2 + i * stepW + stepW / 2, blockH + 0.012, 0],
      color: '#374151', preset: 'metal'
    });
  }

  [-W / 2 - rW / 2, W / 2 + rW / 2].forEach(z => {
    group.add(tubeBetween(
      new THREE.Vector3(-L / 2, railAbove, z),
      new THREE.Vector3(L / 2, H + railAbove, z),
      rW * 0.55, railColor
    ));
    for (let i = 0; i <= steps; i++) {
      const bx = -L / 2 + i * stepW;
      const stepY = i * stepH;
      addBox(group, { size: [rW, railAbove, rW], position: [bx, stepY + railAbove / 2, z], color: railColor, preset: 'metal' });
    }
  });
}
