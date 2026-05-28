import { addBox, markMain, makeStandardMaterial } from './primitives.js';

export function buildTejado1Aguas(group, item, L, W, H, color) {
  const peak = Math.max(0.1, H);
  const t = 0.14;
  const profile = new THREE.Shape();
  profile.moveTo(-W / 2, 0);
  profile.lineTo(W / 2, peak);
  profile.lineTo(W / 2, peak - t);
  profile.lineTo(-W / 2, -t);
  profile.closePath();
  const geo = new THREE.ExtrudeGeometry(profile, { depth: L, bevelEnabled: false, curveSegments: 1 });
  const mesh = new THREE.Mesh(geo, makeStandardMaterial(color, 'matte', 1));
  mesh.rotation.y = Math.PI / 2;
  mesh.position.set(-L / 2, 0, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  markMain(mesh, color);
  group.add(mesh);
}

export function buildTejado2Aguas(group, item, L, W, H, color) {
  const peak = Math.max(0.1, H);
  const profile = new THREE.Shape();
  profile.moveTo(-W / 2, 0);
  profile.lineTo(0, peak);
  profile.lineTo(W / 2, 0);
  profile.closePath();
  const geo = new THREE.ExtrudeGeometry(profile, { depth: L, bevelEnabled: false, curveSegments: 1 });
  const mesh = new THREE.Mesh(geo, makeStandardMaterial(color, 'matte', 1));
  mesh.rotation.y = Math.PI / 2;
  mesh.position.set(-L / 2, 0, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  markMain(mesh, color);
  group.add(mesh);
  addBox(group, { size: [L, 0.06, 0.08], position: [0, peak + 0.03, 0], color: '#8B7355', preset: 'matte' });
}

export function buildTejado4Aguas(group, item, L, W, H, color) {
  const peak = Math.max(0.1, H);
  const mat = makeStandardMaterial(color, 'matte', 1);
  const apex = [0, peak, 0];
  const corners = [
    [-L / 2, 0, -W / 2], [L / 2, 0, -W / 2],
    [L / 2, 0, W / 2],   [-L / 2, 0, W / 2]
  ];
  for (let i = 0; i < 4; i++) {
    const c1 = corners[i];
    const c2 = corners[(i + 1) % 4];
    const verts = new Float32Array([
      apex[0], apex[1], apex[2],
      c1[0], c1[1], c1[2],
      c2[0], c2[1], c2[2]
    ]);
    const faceGeo = new THREE.BufferGeometry();
    faceGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    faceGeo.setIndex([0, 1, 2]);
    faceGeo.computeVertexNormals();
    const face = new THREE.Mesh(faceGeo, mat.clone());
    face.castShadow = true;
    face.receiveShadow = true;
    markMain(face, color);
    group.add(face);
  }
  addBox(group, { size: [L, 0.02, W], position: [0, 0.01, 0], color, preset: 'matte', opacity: 0.35 });
}
