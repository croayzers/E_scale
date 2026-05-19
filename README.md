# E-scale · Planificador 3D de Eventos

Planificador 3D de eventos basado en Three.js. Arquitectura modular ES Modules, sin build step.

## Ejecutar en local

ES Modules requieren servidor HTTP — no abre con doble click.

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .
```

Abre `http://localhost:8000`.

## Desplegar en GitHub Pages

1. Sube el proyecto a un repo de GitHub.
2. `Settings → Pages → Source: Deploy from branch → main / root`.
3. Rutas relativas (`elements.json`, `styles/*.css`, `src/**/*.js`) funcionan tal cual.

## Estructura

```
e-scale/
├── index.html              Shell HTML
├── elements.json           Catálogo editable de elementos
├── styles/                 CSS modularizado
│   ├── base.css
│   ├── layout.css
│   └── components.css
└── src/
    ├── main.js             Bootstrap + wiring
    ├── core/
    │   ├── AppState.js     Estado central + history + mutaciones
    │   └── ElementLibrary.js   Carga elements.json + render botones
    ├── scene/
    │   ├── SceneManager.js     Three.js: escena, cámaras, render, cotas, plano
    │   ├── InteractionManager.js   Raycaster, drag, atajos, context menu
    │   └── SnapManager.js      Snap a rejilla + atajo S
    ├── models/             ↳ UN ARCHIVO POR TIPO 3D
    │   ├── index.js        ModelFactory (registry type→builder)
    │   ├── colors.js
    │   ├── chair.js
    │   ├── mesa.js         Estándar, Napoleón, Presi
    │   ├── buffet.js
    │   ├── carpa.js
    │   └── carpaHelpers.js
    ├── ui/
    │   └── UIManager.js    Stats, tooltip, panel detalle editable
    └── io/                 ↳ Carga/exportación + configuración
        ├── PlanManager.js      Plano IMG/PDF/DXF + calibración
        ├── CompanyManager.js   Datos empresa + logo (localStorage)
        └── ExportManager.js    Export PDF 3D / Plano cenital
```

## Añadir un nuevo elemento

1. **Si ya existe ese `type`**: añádelo a `elements.json`. Cero código.
2. **Si es un `type` nuevo** (ej. `arbol`):
   - Crea `src/models/arbol.js` exportando `createArbol(item)`.
   - Regístralo en `src/models/index.js`:
     ```js
     import { createArbol } from './arbol.js';
     const builders = { …, arbol: createArbol };
     ```
   - Añade su definición en `elements.json`.

## Estado de las entregas

- **Entrega 1:** núcleo arrancable. Mesa, Buffet, Carpa. Drag/zoom/rotación R/snap/cotas/click derecho/undo.
- **Entrega 2:** panel detalle editable, plano IMG/PDF/DXF + calibración, exportación PDF (3D y plano cenital), configuración de empresa con logo.
- **Entrega 3 (actual):** rotación en pasos de 15°, toggle de sombras solo en ISO, categoría **Estructuras**: 4 Paredes, Arbusto, Árbol, Cable con luces (largo auto = nº × separación). Todos con menú contextual y panel editable de propiedades.

## Atajos

| Acción | Atajo |
|---|---|
| Seleccionar | Click izq. |
| Mover | Arrastrar |
| Rotar | R + mover ratón |
| Duplicar | Ctrl + Click |
| Eliminar | Supr / Del |
| Toggle snap | S |
| Undo (3 niveles) | Ctrl + Z |
| Cancelar / deseleccionar | Esc |
