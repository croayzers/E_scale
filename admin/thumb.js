/* ── E-scale element thumbnail SVG generator (standalone for admin) ── */
/* Mirrors src/ui/CatalogModal.js thumbSVG helpers */

function thumbSVG(def) {
  const t = def.type;
  if (t === 'mesa') {
    if (def.subtype === 'presi') return svgRect('#e6e2da');
    return svgCircle('#e6e2da');
  }
  if (t === 'mesaRect')       return svgMesaRect();
  if (t === 'mesaCocktail')   return svgMesaCocktail();
  if (t === 'mesaImperial')   return svgMesaImperial();
  if (t === 'mesaCurva')      return svgMesaCurva();
  if (t === 'mesaSerpentina') return svgMesaSerpentina();
  if (t === 'buffet')         return svgLongRect('#e6e2da');
  if (t === 'carpa')             return svgTent('#d4b78b');
  if (t === 'carpaCuadrada')     return svgTentSquare();
  if (t === 'carpaStar')         return svgTentStar();
  if (t === 'carpaPabellon')     return svgTentPabellon();
  if (t === 'carpaTransparente') return svgTentTransparent();
  if (t === 'carpaBeduina')      return svgTentBeduina();
  if (t === 'carpaSailcloth')    return svgTentSailcloth();
  if (t === 'carpaTipi')         return svgTentTipi();
  if (t === 'carpaDomo')         return svgTentDomo();
  if (t === 'arbusto')      return svgBush('#6fa86a');
  if (t === 'arbol')        return svgTree('#4a8d50', '#7a4f2a');
  if (t === 'cableLuces')   return svgLights('#f4c95d');
  if (t === 'room')         return svgRoom('#dddddd');
  if (t === 'sillaCatering') return svgChair(def.color || '#cccccc', def.subtype);
  if (t === 'sillaLineal')   return svgChairLineal(def.color || '#cccccc');
  if (t === 'poste')         return svgPoste();
  if (t === 'barraLibre')    return svgBarraLibre();
  if (t === 'ambiente') {
    if (def.subtype === 'alfombra' && (def.shape === 'round' || def.dims?.diameter)) return svgAlfombraRound(def.color || '#8b1a1a');
    if (def.subtype === 'alfombra') return svgAlfombra(def.color || '#8b1a1a');
    if (def.subtype === 'planta')   return svgPlantaDeco();
    return svgSpot();
  }
  if (def.schemaId) return svgSchemaThumb(def);
  return svgPlaceholder();
}

function svgSchemaThumb(def) {
  const color   = def.color || def.lightColor || '#cfd4dc';
  const accent  = def.accentColor || '#111827';
  const schemaId = String(def.schemaId || '');
  if (schemaId.startsWith('chair.'))       return svgChair(def.color || '#f5f3ee', def.subtype);
  if (schemaId.startsWith('table.round'))  return svgCircle(color);
  if (schemaId.startsWith('buffet.'))      return svgLongRect(color);
  if (schemaId.startsWith('stage.'))       return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="58" width="72" height="10" rx="2" fill="rgba(0,0,0,0.08)"/><rect x="18" y="38" width="64" height="22" rx="4" fill="${color}" stroke="rgba(0,0,0,0.18)" stroke-width="0.8"/><rect x="40" y="62" width="20" height="12" rx="2" fill="${accent}" opacity="0.7"/><rect x="44" y="74" width="12" height="6" rx="2" fill="${accent}" opacity="0.45"/></svg>`;
  if (schemaId.startsWith('person.'))      return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="82" rx="18" ry="4" fill="rgba(0,0,0,0.1)"/><circle cx="50" cy="30" r="10" fill="${accent}"/><rect x="38" y="42" width="24" height="26" rx="12" fill="${color}" stroke="rgba(0,0,0,0.18)" stroke-width="0.6"/><line x1="44" y1="68" x2="38" y2="82" stroke="${accent}" stroke-width="3"/><line x1="56" y1="68" x2="62" y2="82" stroke="${accent}" stroke-width="3"/></svg>`;
  if (schemaId.startsWith('lighting.'))    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="84" rx="18" ry="3" fill="rgba(0,0,0,0.1)"/><rect x="47" y="24" width="6" height="48" rx="3" fill="${accent}"/><rect x="36" y="18" width="28" height="12" rx="4" fill="${accent}"/><circle cx="50" cy="36" r="16" fill="${color}" opacity="0.32"/><circle cx="50" cy="36" r="9" fill="${color}" opacity="0.72"/></svg>`;
  if (schemaId.startsWith('surface.'))     return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="82" rx="34" ry="5" fill="rgba(0,0,0,0.08)"/><rect x="18" y="30" width="64" height="36" rx="10" fill="${color}" opacity="0.85"/><rect x="22" y="34" width="56" height="28" rx="8" fill="none" stroke="${accent}" stroke-width="2" opacity="0.35"/></svg>`;
  if (schemaId.startsWith('seat.sofa'))    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="84" rx="32" ry="4" fill="rgba(0,0,0,0.08)"/><rect x="18" y="46" width="64" height="22" rx="8" fill="${color}" stroke="rgba(0,0,0,0.18)" stroke-width="0.8"/><rect x="18" y="32" width="64" height="18" rx="8" fill="${color}" opacity="0.92"/><rect x="16" y="36" width="10" height="30" rx="5" fill="${accent}" opacity="0.72"/><rect x="74" y="36" width="10" height="30" rx="5" fill="${accent}" opacity="0.72"/></svg>`;
  if (schemaId.startsWith('arrow.'))       return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 16 50 L 52 50 L 52 38 L 84 50 L 52 62 L 52 50 Z" fill="${accent}"/></svg>`;
  if (schemaId.startsWith('prop.generic-round')) return svgCircle(color);
  if (schemaId.startsWith('prop.generic-rect'))  return svgRect(color);
  const label = (def.name || '').slice(0, 2).toUpperCase();
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="16" width="72" height="68" rx="12" fill="rgba(255,255,255,0.82)" stroke="rgba(0,0,0,0.12)" stroke-width="1"/><rect x="20" y="24" width="60" height="32" rx="10" fill="${color}" opacity="0.86"/><text x="50" y="73" text-anchor="middle" font-size="18" font-family="monospace" fill="rgba(0,0,0,0.68)">${label}</text></svg>`;
}

function svgCircle(f) { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="62" rx="34" ry="10" fill="rgba(0,0,0,0.08)"/><circle cx="50" cy="50" r="34" fill="${f}" stroke="rgba(0,0,0,0.15)" stroke-width="0.8"/><ellipse cx="44" cy="42" rx="14" ry="6" fill="white" opacity="0.5"/></svg>`; }
function svgRect(f) { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="58" width="60" height="6" fill="rgba(0,0,0,0.08)" rx="2"/><rect x="22" y="32" width="56" height="28" fill="${f}" stroke="rgba(0,0,0,0.15)" stroke-width="0.8" rx="3"/><rect x="28" y="36" width="22" height="6" fill="white" opacity="0.5" rx="2"/></svg>`; }
function svgLongRect(f) { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="56" width="84" height="6" fill="rgba(0,0,0,0.08)" rx="2"/><rect x="10" y="38" width="80" height="20" fill="${f}" stroke="rgba(0,0,0,0.15)" stroke-width="0.8" rx="2"/><rect x="14" y="40" width="20" height="4" fill="white" opacity="0.5" rx="1"/></svg>`; }
function svgTent(f) { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="78" rx="38" ry="6" fill="rgba(0,0,0,0.08)"/><polygon points="50,18 88,62 12,62" fill="${f}" stroke="rgba(0,0,0,0.18)" stroke-width="0.8"/><polygon points="50,18 88,62 50,52" fill="rgba(0,0,0,0.08)"/></svg>`; }
function svgBush(f) { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="80" rx="30" ry="4" fill="rgba(0,0,0,0.1)"/><circle cx="38" cy="58" r="18" fill="${f}"/><circle cx="62" cy="56" r="20" fill="${f}"/><circle cx="50" cy="46" r="16" fill="${f}"/></svg>`; }
function svgTree(c,t) { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="86" rx="22" ry="3" fill="rgba(0,0,0,0.1)"/><rect x="46" y="58" width="8" height="28" fill="${t}"/><circle cx="40" cy="40" r="18" fill="${c}"/><circle cx="58" cy="36" r="20" fill="${c}"/><circle cx="50" cy="26" r="14" fill="${c}"/></svg>`; }
function svgLights(b) {
  const pts = [15,30,45,60,75,90].map((x,i) => { const t=i/5; const y=30+30*4*t*(1-t); return `<circle cx="${x}" cy="${y+4}" r="3.5" fill="${b}"/>`; }).join('');
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 10 30 Q 50 60 90 30" stroke="#2a2a2c" stroke-width="1.2" fill="none"/>${pts}</svg>`;
}
function svgRoom(f) { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="20,30 80,30 88,40 88,75 12,75 12,40" fill="${f}" stroke="rgba(0,0,0,0.25)" stroke-width="0.8"/><polygon points="20,30 12,40 12,75 20,70" fill="rgba(0,0,0,0.08)"/><rect x="40" y="48" width="20" height="22" fill="rgba(0,0,0,0.12)"/></svg>`; }
function svgChair(f,s) {
  const back = s === 'tolix' ? `<path d="M 32 26 Q 50 22 68 26 L 68 50 Q 50 46 32 50 Z" fill="${f}" stroke="rgba(0,0,0,0.2)" stroke-width="0.6"/>` : `<rect x="32" y="22" width="36" height="28" fill="${f}" stroke="rgba(0,0,0,0.18)" stroke-width="0.6" rx="3"/>`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="82" rx="22" ry="3" fill="rgba(0,0,0,0.1)"/>${back}<rect x="32" y="50" width="36" height="6" fill="${f}" stroke="rgba(0,0,0,0.2)" stroke-width="0.6"/><line x1="36" y1="56" x2="36" y2="78" stroke="rgba(0,0,0,0.5)" stroke-width="1.5"/><line x1="64" y1="56" x2="64" y2="78" stroke="rgba(0,0,0,0.5)" stroke-width="1.5"/></svg>`;
}
function svgChairLineal(f) {
  const cs = [18,38,58,78].map(x => `<rect x="${x-7}" y="30" width="14" height="22" fill="${f}" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" rx="2"/><rect x="${x-7}" y="52" width="14" height="4" fill="${f}" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"/><line x1="${x-5}" y1="56" x2="${x-5}" y2="76" stroke="rgba(0,0,0,0.4)" stroke-width="1"/><line x1="${x+5}" y1="56" x2="${x+5}" y2="76" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>`).join('');
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="82" rx="38" ry="3" fill="rgba(0,0,0,0.1)"/>${cs}</svg>`;
}
function svgMesaRect() {
  const cs = [30,46,62,78].flatMap(x=>[`<rect x="${x-5}" y="28" width="10" height="10" fill="#bbb" rx="1"/>`,`<rect x="${x-5}" y="66" width="10" height="10" fill="#bbb" rx="1"/>`]).join('');
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="62" width="60" height="4" fill="rgba(0,0,0,0.1)"/><rect x="22" y="42" width="56" height="20" fill="#e6e2da" stroke="rgba(0,0,0,0.18)" stroke-width="0.7" rx="2"/>${cs}</svg>`;
}
function svgMesaCocktail() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="86" rx="22" ry="3" fill="rgba(0,0,0,0.15)"/><rect x="46" y="40" width="8" height="38" fill="#888"/><polygon points="30,40 70,40 78,76 22,76" fill="#fff" stroke="rgba(0,0,0,0.2)" stroke-width="0.6"/><ellipse cx="50" cy="36" rx="22" ry="6" fill="#fff" stroke="rgba(0,0,0,0.2)" stroke-width="0.6"/></svg>`; }
function svgMesaImperial() {
  const cs = [14,26,38,50,62,74,86].flatMap(x=>[`<rect x="${x-3.5}" y="30" width="7" height="9" fill="#bbb" rx="1"/>`,`<rect x="${x-3.5}" y="63" width="7" height="9" fill="#bbb" rx="1"/>`]).join('');
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="58" width="88" height="4" fill="rgba(0,0,0,0.1)"/><rect x="8" y="42" width="84" height="18" fill="#e6e2da" stroke="rgba(0,0,0,0.18)" stroke-width="0.7" rx="2"/>${cs}</svg>`;
}
function svgMesaCurva() {
  const cs = [25,40,50,60,75].map((x,i)=>{const cy=75-Math.sin((i-2)*0.5)*4-12;return `<rect x="${x-4}" y="${cy}" width="8" height="8" fill="#bbb" rx="1"/>`;}).join('');
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 16 75 A 40 40 0 0 1 84 75 L 80 58 A 28 28 0 0 0 20 58 Z" fill="#e6e2da" stroke="rgba(0,0,0,0.2)" stroke-width="0.7"/>${cs}</svg>`;
}
function svgMesaSerpentina() {
  const cs=[18,32,48,62,78].map((x,i)=>{const y=i%2?70:38;return `<rect x="${x-3.5}" y="${y}" width="7" height="7" fill="#bbb" rx="1"/>`;}).join('');
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 8 70 Q 28 48 50 60 Q 72 72 92 50 L 90 38 Q 72 58 50 48 Q 28 38 10 58 Z" fill="#e6e2da" stroke="rgba(0,0,0,0.2)" stroke-width="0.7"/>${cs}</svg>`;
}
function svgTentSquare() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="84" rx="38" ry="4" fill="rgba(0,0,0,0.1)"/><polygon points="20,60 80,60 50,18" fill="#f5f1e8" stroke="rgba(0,0,0,0.2)" stroke-width="0.6"/><polygon points="20,60 50,18 50,72" fill="rgba(0,0,0,0.06)"/><line x1="20" y1="60" x2="20" y2="78" stroke="#6b4423" stroke-width="1.5"/><line x1="80" y1="60" x2="80" y2="78" stroke="#6b4423" stroke-width="1.5"/></svg>`; }
function svgTentStar() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="82" rx="38" ry="4" fill="rgba(0,0,0,0.1)"/><path d="M 50 20 L 80 50 L 70 70 L 50 60 L 30 70 L 20 50 Z" fill="#ede7d6" stroke="rgba(0,0,0,0.18)" stroke-width="0.6"/><circle cx="50" cy="56" r="2" fill="#6b4423"/></svg>`; }
function svgTentPabellon() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="84" rx="40" ry="4" fill="rgba(0,0,0,0.1)"/><polygon points="10,60 90,60 80,30 20,30" fill="#f0ead8" stroke="rgba(0,0,0,0.2)" stroke-width="0.6"/><line x1="20" y1="30" x2="80" y2="30" stroke="#3a4d5c" stroke-width="1.4"/><line x1="10" y1="60" x2="10" y2="78" stroke="#3a4d5c" stroke-width="1.5"/><line x1="90" y1="60" x2="90" y2="78" stroke="#3a4d5c" stroke-width="1.5"/></svg>`; }
function svgTentTransparent() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="84" rx="40" ry="4" fill="rgba(0,0,0,0.1)"/><polygon points="10,60 90,60 80,30 20,30" fill="rgba(168,216,232,0.35)" stroke="white" stroke-width="1.5"/><rect x="20" y="60" width="60" height="18" fill="rgba(168,216,232,0.25)" stroke="white" stroke-width="1.2"/></svg>`; }
function svgTentBeduina() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="84" rx="42" ry="4" fill="rgba(0,0,0,0.1)"/><path d="M 8 70 Q 25 60 35 30 Q 50 50 65 30 Q 75 60 92 70 L 88 78 L 12 78 Z" fill="#d9b88a" stroke="rgba(0,0,0,0.18)" stroke-width="0.6"/></svg>`; }
function svgTentSailcloth() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="84" rx="42" ry="4" fill="rgba(0,0,0,0.1)"/><path d="M 8 70 Q 30 56 35 20 Q 50 56 65 20 Q 70 56 92 70 L 92 78 L 8 78 Z" fill="#f8f5ec" stroke="rgba(0,0,0,0.18)" stroke-width="0.6"/></svg>`; }
function svgTentTipi() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="84" rx="32" ry="3" fill="rgba(0,0,0,0.12)"/><polygon points="50,12 22,80 78,80" fill="#e8dcc4" stroke="rgba(0,0,0,0.18)" stroke-width="0.6"/></svg>`; }
function svgTentDomo() {
  const lines = [22,32,42,52,62,72,82].map(x=>`<path d="M ${x} 76 Q ${x} 40 50 30" stroke="rgba(58,77,92,0.5)" stroke-width="0.6" fill="none"/>`).join('');
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="80" rx="38" ry="4" fill="rgba(0,0,0,0.1)"/><path d="M 12 76 A 38 38 0 0 1 88 76 Z" fill="#e8e2d0" stroke="rgba(0,0,0,0.2)" stroke-width="0.6"/>${lines}</svg>`;
}
function svgPoste() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="86" rx="10" ry="2.5" fill="rgba(0,0,0,0.18)"/><rect x="46" y="14" width="8" height="68" fill="#6b4423" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"/></svg>`; }
function svgBarraLibre() { const cs=[28,50,72].map(x=>`<circle cx="${x}" cy="49" r="8" fill="#6b6864" stroke="#9a9692" stroke-width="1"/><circle cx="${x}" cy="49" r="5.5" fill="#d0eef8" opacity="0.7"/>`).join(''); return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="54" width="80" height="26" fill="#1a1a1c" rx="2"/><rect x="10" y="50" width="80" height="6" fill="#2a2a2c" rx="1"/>${cs}</svg>`; }
function svgAlfombra(f) { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="28" width="76" height="44" fill="${f}" rx="3"/><rect x="16" y="32" width="68" height="36" fill="none" stroke="#c9a55a" stroke-width="2"/><circle cx="50" cy="50" r="8" fill="none" stroke="#c9a55a" stroke-width="1.5" opacity="0.6"/></svg>`; }
function svgAlfombraRound(f) { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="34" fill="${f}"/><circle cx="50" cy="50" r="28" fill="none" stroke="#c9a55a" stroke-width="3"/></svg>`; }
function svgPlantaDeco() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="84" rx="14" ry="3" fill="rgba(0,0,0,0.12)"/><ellipse cx="50" cy="72" rx="14" ry="8" fill="#8b5e3c"/><circle cx="38" cy="50" r="16" fill="#3e7a3a"/><circle cx="60" cy="46" r="18" fill="#3e7a3a"/><circle cx="50" cy="36" r="13" fill="#3e7a3a"/></svg>`; }
function svgSpot() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><line x1="35" y1="82" x2="42" y2="32" stroke="#2a2a2c" stroke-width="2"/><line x1="50" y1="82" x2="50" y2="28" stroke="#2a2a2c" stroke-width="2"/><line x1="65" y1="82" x2="58" y2="32" stroke="#2a2a2c" stroke-width="2"/><ellipse cx="50" cy="30" rx="12" ry="8" fill="#1a1a1c"/><ellipse cx="50" cy="28" rx="9" ry="5" fill="#fffbe8" opacity="0.9"/></svg>`; }
function svgPlaceholder() { return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="60" height="60" fill="#e6e2da" stroke="rgba(0,0,0,0.15)" stroke-width="0.8" rx="6"/></svg>`; }
