import {
  addLabel, addTopLabel, addTopPlainText, markMain, makeTopFill, colorNumber
} from './primitives.js';

export function buildSurface(item, view) {
  const group = new THREE.Group();
  const W = item.dims?.width ?? 3;
  const L = item.dims?.length ?? 3;
  const H = item.dims?.height ?? 0.1;
  const color = item.color || '#6F8E57';
  const borderColor = item.borderColor || '#2F5A29';

  if (view !== 'top') {
    const visH = Math.max(0.3, H);
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(L, visH, W),
      new THREE.MeshStandardMaterial({ color: colorNumber(color), roughness: 0.85, metalness: 0.0, flatShading: false })
    );
    box.position.y = visH / 2;
    box.receiveShadow = true;
    box.castShadow = false;
    markMain(box, color);
    group.add(box);
    if (item.labelText) addLabel(group, item.labelText, visH + 0.4);
    return group;
  }

  const fill = new THREE.Mesh(new THREE.PlaneGeometry(L, W), makeTopFill(color, item.visual?.opacity ?? 0.65));
  fill.rotation.x = -Math.PI / 2;
  fill.position.y = 0.04;
  fill.receiveShadow = true;
  markMain(fill, color);
  group.add(fill);

  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(L, W)),
    new THREE.LineBasicMaterial({ color: colorNumber(borderColor), transparent: true, opacity: 0.58 })
  );
  border.rotation.x = -Math.PI / 2;
  border.position.y = fill.position.y + 0.002;
  group.add(border);

  if (item.labelText) addTopLabel(group, item.labelText);
  return group;
}

export function buildArrow(item) {
  const group = new THREE.Group();
  const W = item.dims?.width ?? 1.2;
  const L = item.dims?.length ?? 2.2;
  const color = item.color || '#111827';
  const shape = new THREE.Shape();
  shape.moveTo(-L / 2, -W / 3);
  shape.lineTo(0, -W / 3);
  shape.lineTo(0, -W / 2);
  shape.lineTo(L / 2, 0);
  shape.lineTo(0, W / 2);
  shape.lineTo(0, W / 3);
  shape.lineTo(-L / 2, W / 3);
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    makeTopFill(color, item.visual?.opacity ?? 0.9)
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.04;
  markMain(mesh, color);
  group.add(mesh);
  if (item.labelText) {
    addTopPlainText(group, item.labelText, {
      color: item.textColor || '#FFFFFF',
      fontSize: item.display?.textSize ?? 34,
      width: Math.max(4.2, L * 1.75),
      height: Math.max(1.05, W * 0.95)
    });
  }
  return group;
}
