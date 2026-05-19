/* ─────────────────────────────────────────────────────────
   CABLE CON LUCES — Guirnalda colgante
   ────────────────────────────────────────────────────────
   El largo total se calcula automáticamente:
     length = count * spacing
   item.height      altura del cable sobre el suelo (m)
   item.count       número de bombillas
   item.spacing     separación entre bombillas (m)
   item.lightColor  color de las bombillas
   item.cableColor  color del cable
   ───────────────────────────────────────────────────────── */

export function createCableLuces(item) {
  const group = new THREE.Group();

  const height      = item.height     ?? 4.0;
  const count       = Math.max(2, item.count ?? 8);
  const spacing     = Math.max(0.2, item.spacing ?? 1.0);
  const lightColor  = parseHex(item.lightColor ?? '#ffd454');
  const cableColor  = parseHex(item.cableColor ?? '#1a1a1c');

  // Largo total derivado
  const totalLength = count * spacing;
  // Caída en el centro (catenaria simple aproximada): 5% del largo
  const sag = Math.max(0.15, totalLength * 0.05);

  // ── Cable (curva poligonal con caída) ──
  // Generamos puntos a lo largo del eje X con una caída parabólica.
  const points = [];
  const segments = Math.max(20, count * 3);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;                  // 0..1
    const x = -totalLength / 2 + totalLength * t;
    // Parábola normalizada: 4t(1-t) llega a 1 en el centro
    const y = height - sag * (4 * t * (1 - t));
    points.push(new THREE.Vector3(x, y, 0));
  }
  const cableGeo = new THREE.BufferGeometry().setFromPoints(points);
  const cableMat = new THREE.LineBasicMaterial({
    color: cableColor,
    linewidth: 2
  });
  const cable = new THREE.Line(cableGeo, cableMat);
  // Importante: las Line no participan del raycaster por defecto, pero
  // expongo baseColor por consistencia con el resto del sistema.
  cable.userData.baseColor = cableColor;
  cable.userData.role = 'cable-luces-wire';
  group.add(cable);

  // ── Bombillas distribuidas a lo largo del cable ──
  const bulbGeo = new THREE.SphereGeometry(0.08, 12, 10);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: lightColor,
    emissive: lightColor,
    emissiveIntensity: 0.6,
    roughness: 0.4,
    metalness: 0.0
  });

  for (let i = 0; i < count; i++) {
    // Distribuimos uniformemente; primera y última centradas dentro del cable
    const t = count === 1 ? 0.5 : (i + 0.5) / count;
    const x = -totalLength / 2 + totalLength * t;
    const y = height - sag * (4 * t * (1 - t)) - 0.08;  // cuelga ligeramente debajo

    const bulb = new THREE.Mesh(bulbGeo, bulbMat.clone());
    bulb.position.set(x, y, 0);
    bulb.castShadow = true;
    bulb.userData.baseColor = lightColor;
    if (i === 0) bulb.userData.isMain = true;   // primera bombilla es el "ancla" para selección
    group.add(bulb);

    // Cordón colgante mínimo entre cable y bombilla
    const stringGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y + 0.08, 0),
      new THREE.Vector3(x, height - sag * (4 * t * (1 - t)), 0)
    ]);
    const stringLine = new THREE.Line(stringGeo, cableMat.clone());
    stringLine.userData.baseColor = cableColor;
    stringLine.userData.role = 'cable-luces-string';
    group.add(stringLine);
  }

  // ── Postes invisibles en los extremos (área clicable amplia) ──
  // Sin esto el cable es muy fino y casi imposible de seleccionar.
  const hitMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0
  });
  const hitGeo = new THREE.BoxGeometry(totalLength, 0.3, 0.3);
  const hit = new THREE.Mesh(hitGeo, hitMat);
  hit.position.y = height;
  hit.userData.baseColor = cableColor;
  hit.userData.role = 'cable-luces-hit';
  group.add(hit);

  return group;
}

function parseHex(hex) {
  return parseInt((hex || '#000000').replace('#', ''), 16);
}
