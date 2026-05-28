/* ─── Shared primitive helpers — imported by all category builders ─── */

export function colorNumber(value, fallback = '#CCCCCC') {
  const raw = String(value || fallback).replace('#', '');
  return parseInt(raw, 16);
}

export function makeStandardMaterial(color, preset = 'default', opacity = 1) {
  const presets = {
    default: { roughness: 0.55, metalness: 0.08 },
    matte:   { roughness: 0.88, metalness: 0.02 },
    metal:   { roughness: 0.35, metalness: 0.72 },
    glass:   { roughness: 0.08, metalness: 0.1, transparent: true, opacity: Math.min(opacity, 0.5) },
    fabric:  { roughness: 0.92, metalness: 0.02 }
  };
  const selected = presets[preset] || presets.default;
  return new THREE.MeshStandardMaterial({
    color: colorNumber(color),
    flatShading: preset !== 'glass',
    transparent: opacity < 1 || selected.transparent === true,
    opacity,
    ...selected
  });
}

export function makeTopFill(color, opacity = 0.16) {
  return new THREE.MeshBasicMaterial({
    color: colorNumber(color),
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });
}

export function makeCanvasTexture(text, {
  canvasWidth = 512, canvasHeight = 128,
  font = '600 42px "Inter Tight", sans-serif',
  color = '#111827',
  bg = 'rgba(245,243,238,0.94)',
  stroke = false,
  strokeColor = 'rgba(0,0,0,0.55)',
  strokeWidth = 4,
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasWidth, canvasHeight); }
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (stroke) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
    ctx.strokeText(text, canvasWidth / 2, canvasHeight / 2);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function addLabel(group, text, y, color = '#111827') {
  const normalized = String(text || '').trim();
  if (!normalized) return;
  const texture = makeCanvasTexture(normalized, { color });
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(1.8, 0.45, 1);
  sprite.position.set(0, y, 0);
  group.add(sprite);
}

export function addTopLabel(group, text, color = '#111827') {
  const normalized = String(text || '').trim();
  if (!normalized) return;
  const texture = makeCanvasTexture(normalized, {
    canvasWidth: 384, canvasHeight: 96,
    font: '600 34px "Inter Tight", sans-serif',
    color,
  });
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.45),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.06;
  group.add(plane);
}

export function addTopPlainText(group, text, {
  color = '#FFFFFF',
  fontSize = 34,
  width = 2.2,
  height = 0.5
} = {}) {
  const normalized = String(text || '').trim();
  if (!normalized) return;
  const clampedSize = Math.max(18, Math.min(fontSize, 72));
  const texture = makeCanvasTexture(normalized, {
    font: `700 ${clampedSize}px "Inter Tight", sans-serif`,
    color,
    bg: null,
    stroke: true,
    strokeWidth: Math.max(2, Math.min(8, clampedSize / 8)),
  });
  const computedWidth  = Math.max(width,  normalized.length * Math.max(0.34, fontSize * 0.018));
  const computedHeight = Math.max(height, Math.max(0.7, fontSize * 0.028));
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(computedWidth, computedHeight),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.085;
  plane.renderOrder = 40;
  plane.userData.skipTopStroke = true;
  group.add(plane);
}

export function markMain(mesh, color) {
  mesh.userData.isMain = true;
  mesh.userData.baseColor = colorNumber(color);
  return mesh;
}

export function triangleShape(length, width) {
  const L = length / 2;
  const W = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-L, -W);
  shape.lineTo(L, 0);
  shape.lineTo(-L, W);
  shape.lineTo(-L, -W);
  return shape;
}

export function archShape(length, width) {
  const L = length / 2;
  const W = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-L, -W);
  shape.lineTo(-L, 0);
  shape.absarc(0, 0, L, Math.PI, 0, false);
  shape.lineTo(L, -W);
  shape.lineTo(-L, -W);
  return shape;
}

export function annularSectorShape(innerRadius, outerRadius, angle, startAngle = -angle / 2) {
  const shape = new THREE.Shape();
  const endAngle = startAngle + angle;
  const segments = Math.max(18, Math.ceil((angle * 180) / Math.PI / 4));
  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const theta = startAngle + (endAngle - startAngle) * t;
    const x = Math.cos(theta) * outerRadius;
    const y = Math.sin(theta) * outerRadius;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let index = segments; index >= 0; index -= 1) {
    const t = index / segments;
    const theta = startAngle + (endAngle - startAngle) * t;
    shape.lineTo(Math.cos(theta) * innerRadius, Math.sin(theta) * innerRadius);
  }
  shape.closePath();
  return shape;
}

export function roundedRectShape(length, width, radius = 0.08) {
  const L = length / 2;
  const W = width / 2;
  const r = Math.max(0, Math.min(radius, L, W));
  const shape = new THREE.Shape();
  shape.moveTo(-L + r, -W);
  shape.lineTo(L - r, -W);
  shape.quadraticCurveTo(L, -W, L, -W + r);
  shape.lineTo(L, W - r);
  shape.quadraticCurveTo(L, W, L - r, W);
  shape.lineTo(-L + r, W);
  shape.quadraticCurveTo(-L, W, -L, W - r);
  shape.lineTo(-L, -W + r);
  shape.quadraticCurveTo(-L, -W, -L + r, -W);
  return shape;
}

export function inferTopFootprintKind(item) {
  if (item.display?.topKind) return item.display.topKind;
  switch (item.catalogDefinitionId) {
    case 'truss_triangular': return 'triangle';
    case 'arco_decorativo':  return 'arch';
    default:                 return 'rect';
  }
}

export function addTopFootprint(group, item, length, width, color, opacity = 0.2) {
  const kind = inferTopFootprintKind(item);
  if (kind === 'triangle' || kind === 'arch') {
    const shape = kind === 'triangle' ? triangleShape(length, width) : archShape(length, width);
    const fill = new THREE.Mesh(new THREE.ShapeGeometry(shape), makeTopFill(color, opacity));
    fill.rotation.x = -Math.PI / 2;
    fill.position.y = 0.04;
    markMain(fill, color);
    group.add(fill);
    if (item.labelText && item.display?.topLabel !== false) addTopLabel(group, item.labelText);
    return;
  }
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(length, width), makeTopFill(color, opacity));
  fill.rotation.x = -Math.PI / 2;
  fill.position.y = 0.04;
  markMain(fill, color);
  group.add(fill);
  if (item.labelText && item.display?.topLabel !== false) addTopLabel(group, item.labelText);
}

export function addBox(group, { size, position, color, preset = 'matte', opacity = 1, yOffset = 0 }) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    makeStandardMaterial(color, preset, opacity)
  );
  mesh.position.set(position[0], position[1] + yOffset, position[2]);
  mesh.castShadow = opacity > 0.12;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

export function addCylinder(group, { radiusTop, radiusBottom = radiusTop, height, position, color, preset = 'metal', radialSegments = 18, rotation = null, opacity = 1 }) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments),
    makeStandardMaterial(color, preset, opacity)
  );
  mesh.position.set(position[0], position[1], position[2]);
  if (rotation) mesh.rotation.set(rotation[0] || 0, rotation[1] || 0, rotation[2] || 0);
  mesh.castShadow = opacity > 0.12;
  group.add(mesh);
  return mesh;
}

export function addSphere(group, { radius, position, color, preset = 'glass', opacity = 1, emissive = false }) {
  const material = emissive
    ? new THREE.MeshStandardMaterial({
        color: colorNumber(color),
        emissive: colorNumber(color),
        emissiveIntensity: 0.9,
        roughness: 0.25,
        transparent: opacity < 1,
        opacity
      })
    : makeStandardMaterial(color, preset, opacity);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 18), material);
  mesh.position.set(position[0], position[1], position[2]);
  group.add(mesh);
  return mesh;
}

export function addWheel(group, x, y, z, radius = 0.08, color = '#2a2a2c') {
  const wheel = addCylinder(group, {
    radiusTop: radius,
    height: radius * 0.55,
    position: [x, y, z],
    color,
    preset: 'metal',
    radialSegments: 14,
    rotation: [Math.PI / 2, 0, 0]
  });
  wheel.receiveShadow = false;
  return wheel;
}

export function tubeBetween(a, b, radius, color, preset = 'metal') {
  const start = a.clone();
  const end = b.clone();
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, 8),
    makeStandardMaterial(color, preset, 1)
  );
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  return mesh;
}

export function addPolylineTubes(group, points, radius, color, closed = false) {
  const vectors = points.map(point => new THREE.Vector3(point[0], point[1], point[2]));
  for (let index = 1; index < vectors.length; index += 1) {
    group.add(tubeBetween(vectors[index - 1], vectors[index], radius, color));
  }
  if (closed && vectors.length > 2) {
    group.add(tubeBetween(vectors[vectors.length - 1], vectors[0], radius, color));
  }
}

export function addTransparentShell(group, geometry, color, opacity = 0.08) {
  const shell = new THREE.Mesh(geometry, makeStandardMaterial(color, 'glass', opacity));
  shell.castShadow = false;
  shell.receiveShadow = false;
  markMain(shell, color);
  group.add(shell);
  return shell;
}
