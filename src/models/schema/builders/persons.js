import { addBox, addCylinder, addSphere, markMain, makeTopFill } from './primitives.js';

function buildStandingPerson(group, item, height, color, accent) {
  const torsoH = height * 0.48;
  const legH = height * 0.32;
  const headR = Math.max(0.1, height * 0.095);
  const torso = addCylinder(group, {
    radiusTop: 0.14, radiusBottom: 0.16, height: torsoH,
    position: [0, legH + torsoH / 2, 0], color, preset: 'matte', radialSegments: 16
  });
  markMain(torso, color);
  addSphere(group, { radius: headR, position: [0, legH + torsoH + headR * 1.12, 0], color: accent, preset: 'matte' });
  [-0.08, 0.08].forEach(x => addCylinder(group, {
    radiusTop: 0.036, height: legH, position: [x, legH / 2, 0], color, preset: 'matte', radialSegments: 12
  }));
}

function buildSeatedPerson(group, item, height, color, accent) {
  const seatH = Math.max(0.42, height * 0.4);
  const torsoH = Math.max(0.34, height * 0.28);
  const seat = addBox(group, { size: [0.34, 0.06, 0.34], position: [0, seatH - 0.03, 0.02], color: '#64748B', preset: 'metal' });
  seat.userData.skipTopStroke = true;
  const torso = addBox(group, { size: [0.24, torsoH, 0.18], position: [0, seatH + torsoH / 2, -0.03], color, preset: 'matte' });
  markMain(torso, color);
  addSphere(group, { radius: 0.11, position: [0, seatH + torsoH + 0.14, -0.03], color: accent, preset: 'matte' });
  [-0.07, 0.07].forEach(x => addCylinder(group, {
    radiusTop: 0.028, height: 0.22, position: [x, seatH - 0.11, 0.12], color, preset: 'matte', radialSegments: 10
  }));
}

function inferPersonPose(item) {
  if (item.pose) return item.pose;
  return String(item.catalogDefinitionId || '').includes('sentado') ? 'seated' : 'standing';
}

export function buildPerson(item, view) {
  const group = new THREE.Group();
  const height = item.dims?.height ?? 1.75;
  const color = item.color || '#2C2C31';
  const accent = item.accentColor || '#D9D4CC';
  const pose = inferPersonPose(item);
  try {
    if (view === 'top') {
      const body = new THREE.Mesh(new THREE.CircleGeometry(pose === 'seated' ? 0.26 : 0.22, 36), makeTopFill(accent, 0.28));
      body.rotation.x = -Math.PI / 2;
      body.position.y = 0.04;
      markMain(body, accent);
      group.add(body);
      const head = new THREE.Mesh(new THREE.CircleGeometry(0.1, 28), makeTopFill(color, 0.8));
      head.rotation.x = -Math.PI / 2;
      head.position.set(0, 0.042, pose === 'seated' ? -0.08 : -0.14);
      group.add(head);
      return group;
    }
    if (pose === 'seated') buildSeatedPerson(group, item, height, color, accent);
    else buildStandingPerson(group, item, height, color, accent);
    return group;
  } catch (error) {
    console.error('[SchemaBuilders] buildPerson failed', {
      catalogDefinitionId: item.catalogDefinitionId || '',
      pose, view, dims: item.dims || {}, error
    });
    throw error;
  }
}
