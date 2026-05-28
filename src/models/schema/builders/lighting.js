import {
  addBox, addCylinder, addSphere, addLabel, markMain, makeTopFill, makeStandardMaterial,
  addPolylineTubes, colorNumber
} from './primitives.js';
import { buildTrussBox } from './stage.js';

export function buildSpotlight(group, item, height, color, lightColor) {
  addCylinder(group, { radiusTop: 0.04, height: height * 0.6, position: [0, height * 0.3, 0], color, preset: 'metal' });
  addBox(group, { size: [0.28, 0.12, 0.18], position: [0, height * 0.72, 0], color, preset: 'metal' });
  const head = addCylinder(group, {
    radiusTop: 0.11, height: 0.18,
    position: [0, height * 0.72, 0.12],
    color, preset: 'metal', radialSegments: 18,
    rotation: [Math.PI / 2, 0, 0]
  });
  markMain(head, color);
  addSphere(group, { radius: 0.06, position: [0, height * 0.72, 0.2], color: lightColor, emissive: true });
}

export function buildTowerLight(group, item, height, color, lightColor) {
  buildTrussBox(group, item, 0.42, 0.42, height, color);
  addBox(group, { size: [0.34, 0.12, 0.22], position: [0, height + 0.12, 0], color, preset: 'metal' });
  addSphere(group, { radius: 0.08, position: [0, height + 0.12, 0.16], color: lightColor, emissive: true });
}

export function buildStringLights(group, item, height, color, lightColor) {
  const postX = Math.max(0.8, (item.dims?.length ?? 0.6) * 0.8);
  [-postX, postX].forEach(x => addCylinder(group, { radiusTop: 0.03, height, position: [x, height / 2, 0], color, preset: 'metal' }));
  const cablePoints = [];
  const segments = 6;
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    cablePoints.push([-postX + t * postX * 2, height - Math.sin(Math.PI * t) * 0.18, 0]);
  }
  addPolylineTubes(group, cablePoints, 0.01, color);
  for (let i = 1; i < cablePoints.length - 1; i += 1) {
    const p = cablePoints[i];
    addSphere(group, { radius: 0.045, position: [p[0], p[1] - 0.08, 0], color: lightColor, emissive: true });
  }
  if (group.children[0]) markMain(group.children[0], color);
}

export function buildUplight(group, item, height, color, lightColor) {
  const base = addBox(group, { size: [0.24, Math.max(0.18, height * 0.22), 0.24], position: [0, Math.max(0.09, height * 0.11), 0], color, preset: 'metal' });
  markMain(base, color);
  addSphere(group, { radius: 0.14, position: [0, Math.max(0.18, height * 0.22), 0], color: lightColor, emissive: true });
}

export function buildMovingHead(group, item, height, color, lightColor) {
  const base = addBox(group, { size: [0.28, height * 0.32, 0.28], position: [0, height * 0.16, 0], color, preset: 'metal' });
  markMain(base, color);
  addBox(group, { size: [0.08, height * 0.22, 0.08], position: [-0.1, height * 0.44, 0], color, preset: 'metal' });
  addBox(group, { size: [0.08, height * 0.22, 0.08], position: [0.1, height * 0.44, 0], color, preset: 'metal' });
  const head = addBox(group, { size: [0.26, height * 0.18, 0.18], position: [0, height * 0.6, 0.02], color, preset: 'metal' });
  addSphere(group, { radius: 0.06, position: [0, height * 0.6, 0.14], color: lightColor, emissive: true });
  head.rotation.x = -0.35;
}

export function buildLaser(group, item, height, color, lightColor) {
  const base = addBox(group, { size: [0.34, height * 0.26, 0.28], position: [0, height * 0.13, 0], color, preset: 'metal' });
  markMain(base, color);
  const head = addBox(group, { size: [0.22, height * 0.12, 0.26], position: [0, height * 0.34, 0], color, preset: 'metal' });
  head.rotation.x = -0.2;
  addSphere(group, { radius: 0.04, position: [0, height * 0.34, 0.16], color: lightColor, emissive: true });
}

export function buildLogoProjector(group, item, height, color, lightColor) {
  addCylinder(group, { radiusTop: 0.04, height: height * 0.72, position: [0, height * 0.36, 0], color, preset: 'metal' });
  const head = addCylinder(group, {
    radiusTop: 0.12, height: 0.24,
    position: [0, height * 0.78, 0],
    color, preset: 'metal', radialSegments: 18,
    rotation: [0, 0, Math.PI / 2]
  });
  markMain(head, color);
  addSphere(group, { radius: 0.045, position: [0.14, height * 0.78, 0], color: lightColor, emissive: true });
}

export function buildBollard(group, item, height, color, lightColor) {
  const body = addCylinder(group, {
    radiusTop: 0.12, radiusBottom: 0.16, height,
    position: [0, height / 2, 0], color, preset: 'metal'
  });
  markMain(body, color);
  addSphere(group, { radius: 0.08, position: [0, height - 0.04, 0], color: lightColor, emissive: true });
}

export function buildLightCurtain(group, item, height, color, lightColor) {
  const width = Math.max(0.8, item.dims?.width ?? 0.6);
  addBox(group, { size: [width, 0.05, 0.05], position: [0, height, 0], color, preset: 'metal' });
  const lines = 5;
  for (let i = 0; i < lines; i += 1) {
    const x = -width / 2 + width * i / (lines - 1);
    addCylinder(group, { radiusTop: 0.008, height: height * 0.92, position: [x, height * 0.54, 0], color, preset: 'metal' });
    [0.3, 0.54, 0.78].forEach(t => addSphere(group, { radius: 0.03, position: [x, height * t, 0], color: lightColor, emissive: true }));
  }
  if (group.children[0]) markMain(group.children[0], color);
}

export function buildLighting(item, view) {
  const group = new THREE.Group();
  const height = item.dims?.height ?? 2.5;
  const color = item.color || '#111827';
  const lightColor = item.lightColor || '#FFE8A3';
  const profile = inferLightingProfile(item);
  if (view === 'top') {
    const base = new THREE.Mesh(new THREE.CircleGeometry(0.18, 30), makeTopFill(color, 0.9));
    base.rotation.x = -Math.PI / 2;
    base.position.y = 0.04;
    markMain(base, color);
    group.add(base);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.42, 42), makeTopFill(lightColor, 0.28));
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.041;
    group.add(halo);
    return group;
  }
  switch (profile) {
    case 'towerLight':    buildTowerLight(group, item, height, color, lightColor); break;
    case 'stringLights':  buildStringLights(group, item, height, color, lightColor); break;
    case 'uplight':       buildUplight(group, item, height, color, lightColor); break;
    case 'movingHead':    buildMovingHead(group, item, height, color, lightColor); break;
    case 'laser':         buildLaser(group, item, height, color, lightColor); break;
    case 'logoProjector': buildLogoProjector(group, item, height, color, lightColor); break;
    case 'bollard':       buildBollard(group, item, height, color, lightColor); break;
    case 'lightCurtain':  buildLightCurtain(group, item, height, color, lightColor); break;
    default:              buildSpotlight(group, item, height, color, lightColor); break;
  }
  addLabel(group, item.labelText, height + 0.35, '#111827');
  return group;
}

export function buildCableLuces(item, view) {
  const group    = new THREE.Group();
  const height   = item.height     ?? 4.0;
  const count    = Math.max(2, item.count ?? 8);
  const spacing  = Math.max(0.2, item.spacing ?? 1.0);
  const lightHex = item.lightColor  || '#ffd454';
  const cableHex = item.cableColor  || '#1a1a1c';
  const totalLen = count * spacing;
  const sag      = Math.max(0.15, totalLen * 0.05);

  if (view === 'top') {
    const hit = new THREE.Mesh(
      new THREE.PlaneGeometry(totalLen, 0.18),
      new THREE.MeshBasicMaterial({ color: colorNumber(cableHex), transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    hit.rotation.x = -Math.PI / 2;
    hit.position.y = 0.04;
    markMain(hit, cableHex);
    group.add(hit);
    return group;
  }

  const segments = Math.max(20, count * 3);
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    pts.push(new THREE.Vector3(
      -totalLen / 2 + totalLen * t,
      height - sag * (4 * t * (1 - t)),
      0
    ));
  }
  const cable = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: colorNumber(cableHex) })
  );
  markMain(cable, cableHex);
  group.add(cable);

  const bulbGeo = new THREE.SphereGeometry(0.08, 12, 10);
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const bx = -totalLen / 2 + totalLen * t;
    const by = height - sag * (4 * t * (1 - t)) - 0.08;
    const bulb = new THREE.Mesh(bulbGeo,
      new THREE.MeshStandardMaterial({ color: colorNumber(lightHex), emissive: colorNumber(lightHex), emissiveIntensity: 0.6, roughness: 0.4 })
    );
    bulb.position.set(bx, by, 0);
    bulb.castShadow = true;
    if (i === 0) markMain(bulb, lightHex);
    group.add(bulb);

    const cord = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(bx, by + 0.08, 0),
        new THREE.Vector3(bx, height - sag * (4 * t * (1 - t)), 0)
      ]),
      new THREE.LineBasicMaterial({ color: colorNumber(cableHex) })
    );
    group.add(cord);
  }

  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(totalLen, 0.3, 0.3),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = height;
  group.add(hit);
  return group;
}

export function buildFocoSpot(item, view) {
  const group = new THREE.Group();
  const H     = item.dims?.height ?? 2.0;
  const color = item.color || '#1a1a1c';

  if (view === 'top') {
    const fill = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), makeTopFill(color, 0.7));
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.04;
    markMain(fill, color);
    group.add(fill);
    return group;
  }

  const legMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.5, metalness: 0.5, flatShading: true });
  const legGeo = new THREE.CylinderGeometry(0.012, 0.012, H, 8);
  [-0.25, 0, 0.25].forEach((x, i) => {
    const leg = new THREE.Mesh(legGeo, legMat.clone());
    leg.position.set(x, H / 2, i === 1 ? 0.18 : -0.08);
    leg.rotation.x = i === 1 ? 0.18 : -0.08;
    leg.castShadow = true;
    group.add(leg);
  });

  const headMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.4, metalness: 0.6, flatShading: true });
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.22, 16), headMat);
  head.position.set(0, H + 0.11, 0);
  head.rotation.x = -0.4;
  head.castShadow = true;
  markMain(head, color);
  group.add(head);

  const lensColor = item.color || '#fffbe8';
  const lens = new THREE.Mesh(
    new THREE.CircleGeometry(0.055, 16),
    new THREE.MeshStandardMaterial({ color: colorNumber(lensColor), emissive: colorNumber(lensColor), emissiveIntensity: 0.8, roughness: 0.1 })
  );
  lens.position.set(0, H + 0.22, 0.08);
  lens.rotation.x = -0.4;
  group.add(lens);

  if (item.labelText) addLabel(group, item.labelText, H + 0.45);
  return group;
}

function inferLightingProfile(item) {
  if (item.lightingProfile) return item.lightingProfile;
  switch (item.catalogDefinitionId) {
    case 'foco_led':
    case 'foco_escenario':       return 'spotlight';
    case 'torre_iluminacion':    return 'towerLight';
    case 'guirnalda_luces':      return 'stringLights';
    case 'luz_ambiental_rgb':
    case 'luz_calida_decorativa': return 'uplight';
    case 'cabeza_movil':         return 'movingHead';
    case 'laser_evento':         return 'laser';
    case 'proyector_logo':       return 'logoProjector';
    case 'baliza_exterior':      return 'bollard';
    case 'cortina_luces':        return 'lightCurtain';
    default:                     return '';
  }
}
