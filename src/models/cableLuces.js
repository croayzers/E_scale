/* ─────────────────────────────────────────────────────────
   CABLE CON LUCES — Guirnalda colgante (versión robusta)
   ───────────────────────────────────────────────────────── */

export function createCableLuces(item) {
  const group = new THREE.Group();

  const height      = item.height     ?? 4.0;
  const count       = Math.max(2, item.count ?? 8);
  const spacing     = Math.max(0.2, item.spacing ?? 1.0);
  const lightColor  = parseHex(item.lightColor ?? '#ffd454');
  const cableColor  = parseHex(item.cableColor ?? '#1a1a1c');

  const totalLength = count * spacing;
  const sag = Math.max(0.15, totalLength * 0.05);

  // ── Cable principal ──
  const points = [];
  const segments = Math.max(20, count * 3);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = -totalLength / 2 + totalLength * t;
    const y = height - sag * (4 * t * (1 - t));
    points.push(new THREE.Vector3(x, y, 0));
  }
  const cableGeo = new THREE.BufferGeometry().setFromPoints(points);
  const cable = new THREE.Line(
    cableGeo,
    new THREE.LineBasicMaterial({ color: cableColor })
  );
  cable.userData.baseColor = cableColor;
  cable.userData.role = 'cable-luces-wire';
  group.add(cable);

  // ── Bombillas ──
  const bulbGeo = new THREE.SphereGeometry(0.08, 12, 10);

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : (i + 0.5) / count;
    const x = -totalLength / 2 + totalLength * t;
    const y = height - sag * (4 * t * (1 - t)) - 0.08;

    // Material NUEVO por bombilla (sin clone)
    const bulbMat = new THREE.MeshStandardMaterial({
      color: lightColor,
      emissive: lightColor,
      emissiveIntensity: 0.6,
      roughness: 0.4,
      metalness: 0.0
    });

    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(x, y, 0);
    bulb.castShadow = true;
    bulb.userData.baseColor = lightColor;
    if (i === 0) bulb.userData.isMain = true;
    group.add(bulb);

    // Cordón colgante
    const stringGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y + 0.08, 0),
      new THREE.Vector3(x, height - sag * (4 * t * (1 - t)), 0)
    ]);
    const stringLine = new THREE.Line(
      stringGeo,
      new THREE.LineBasicMaterial({ color: cableColor })
    );
    stringLine.userData.baseColor = cableColor;
    stringLine.userData.role = 'cable-luces-string';
    group.add(stringLine);
  }

  // ── Área clicable (caja invisible pero válida) ──
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(totalLength, 0.3, 0.3),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = height;
  hit.userData.baseColor = cableColor;
  hit.userData.role = 'cable-luces-hit';
  group.add(hit);

  return group;
}

function parseHex(hex) {
  return parseInt((hex || '#000000').replace('#', ''), 16);
}