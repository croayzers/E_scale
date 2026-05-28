import {
  addBox, addCylinder, addSphere, addLabel, markMain, makeTopFill, makeStandardMaterial,
  addPolylineTubes
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
