import {
  clamp,
  degreesToRadians,
  getValueAtPath,
  radiansToDegrees,
  roundToStep
} from './SchemaUtils.js';

export const PARAM_LEVEL = {
  BASIC: 'basic',
  ADVANCED: 'advanced'
};

export const PARAM_CATEGORY = {
  SIZE: 'size',
  APPEARANCE: 'appearance',
  LAYOUT: 'layout',
  MATERIALS: 'materials',
  PHYSICS: 'physics',
  LABELS: 'labels',
  CHILDREN: 'children',
  BEHAVIOR: 'behavior'
};

function createParam(definition) {
  return Object.freeze(definition);
}

function metersParam({
  key,
  label,
  path,
  defaultValue,
  min = 0.1,
  max = 100,
  step = 0.1,
  level = PARAM_LEVEL.BASIC,
  category = PARAM_CATEGORY.SIZE,
  ...rest
}) {
  return createParam({
    key,
    path,
    type: 'number',
    inputMode: 'decimal',
    unit: 'm',
    label,
    default: defaultValue,
    min,
    max,
    step,
    level,
    category,
    coerce: value => roundToStep(clamp(value, min, max), step),
    ...rest
  });
}

function integerParam({
  key,
  label,
  path,
  defaultValue,
  min = 0,
  max = 999,
  step = 1,
  level = PARAM_LEVEL.BASIC,
  category = PARAM_CATEGORY.LAYOUT,
  ...rest
}) {
  return createParam({
    key,
    path,
    type: 'number',
    inputMode: 'numeric',
    label,
    default: defaultValue,
    min,
    max,
    step,
    level,
    category,
    coerce: value => Math.round(clamp(value, min, max)),
    ...rest
  });
}

export const StandardParams = {
  width: overrides => metersParam({
    key: 'width',
    label: 'Ancho',
    path: 'dims.width',
    defaultValue: 1.2,
    ...overrides
  }),

  length: overrides => metersParam({
    key: 'length',
    label: 'Largo',
    path: 'dims.length',
    defaultValue: 1.8,
    ...overrides
  }),

  height: overrides => metersParam({
    key: 'height',
    label: 'Alto',
    path: 'dims.height',
    defaultValue: 0.75,
    min: 0.05,
    ...overrides
  }),

  diameter: overrides => metersParam({
    key: 'diameter',
    label: 'Diametro',
    path: 'dims.diameter',
    defaultValue: 1.8,
    min: 0.3,
    ...overrides
  }),

  rotation: overrides => createParam({
    key: 'rotation',
    path: 'rotY',
    type: 'number',
    inputMode: 'numeric',
    label: 'Rotacion',
    default: 0,
    min: -180,
    max: 180,
    step: 15,
    suffix: 'deg',
    level: PARAM_LEVEL.BASIC,
    category: PARAM_CATEGORY.LAYOUT,
    read: item => roundToStep(radiansToDegrees(getValueAtPath(item, 'rotY', 0)), 1),
    write: value => ({ rotY: degreesToRadians(clamp(value, -180, 180)) }),
    ...overrides
  }),

  color: overrides => createParam({
    key: 'color',
    path: 'color',
    type: 'color',
    label: 'Color',
    default: '#D9D4CC',
    level: PARAM_LEVEL.BASIC,
    category: PARAM_CATEGORY.APPEARANCE,
    ...overrides
  }),

  opacity: overrides => createParam({
    key: 'opacity',
    path: 'visual.opacity',
    type: 'range',
    label: 'Opacidad',
    default: 1,
    min: 0.1,
    max: 1,
    step: 0.05,
    level: PARAM_LEVEL.ADVANCED,
    category: PARAM_CATEGORY.APPEARANCE,
    coerce: value => clamp(value, 0.1, 1),
    ...overrides
  }),

  text: overrides => createParam({
    key: 'text',
    path: 'labelText',
    type: 'text',
    label: 'Texto',
    default: '',
    maxLength: 64,
    level: PARAM_LEVEL.BASIC,
    category: PARAM_CATEGORY.LABELS,
    ...overrides
  }),

  chairs: overrides => integerParam({
    key: 'chairs',
    label: 'Sillas',
    path: 'chairs',
    defaultValue: 0,
    min: 0,
    max: 48,
    level: PARAM_LEVEL.BASIC,
    category: PARAM_CATEGORY.LAYOUT,
    ...overrides
  }),

  spacing: overrides => metersParam({
    key: 'spacing',
    label: 'Separacion',
    path: 'layout.spacing',
    defaultValue: 0.6,
    min: 0.1,
    max: 8,
    step: 0.05,
    level: PARAM_LEVEL.ADVANCED,
    category: PARAM_CATEGORY.LAYOUT,
    ...overrides
  }),

  padding: overrides => metersParam({
    key: 'padding',
    label: 'Padding',
    path: 'layout.padding',
    defaultValue: 0.2,
    min: 0,
    max: 5,
    step: 0.05,
    level: PARAM_LEVEL.ADVANCED,
    category: PARAM_CATEGORY.LAYOUT,
    ...overrides
  }),

  offset: overrides => metersParam({
    key: 'offset',
    label: 'Offset',
    path: 'layout.offset',
    defaultValue: 0.3,
    min: -10,
    max: 10,
    step: 0.05,
    level: PARAM_LEVEL.ADVANCED,
    category: PARAM_CATEGORY.LAYOUT,
    ...overrides
  }),

  shadow: overrides => createParam({
    key: 'shadow',
    path: 'visual.shadows',
    type: 'toggle',
    label: 'Sombras',
    default: true,
    level: PARAM_LEVEL.ADVANCED,
    category: PARAM_CATEGORY.APPEARANCE,
    ...overrides
  }),

  collisions: overrides => createParam({
    key: 'collisions',
    path: 'physics.collisions',
    type: 'toggle',
    label: 'Colisiones',
    default: true,
    level: PARAM_LEVEL.ADVANCED,
    category: PARAM_CATEGORY.PHYSICS,
    ...overrides
  }),

  snap: overrides => createParam({
    key: 'snap',
    path: 'physics.snap',
    type: 'toggle',
    label: 'Snap',
    default: true,
    level: PARAM_LEVEL.ADVANCED,
    category: PARAM_CATEGORY.PHYSICS,
    ...overrides
  }),

  materialPreset: overrides => createParam({
    key: 'materialPreset',
    path: 'visual.materialPreset',
    type: 'select',
    label: 'Material',
    default: 'default',
    options: [
      { value: 'default', label: 'Estandar' },
      { value: 'matte', label: 'Mate' },
      { value: 'metal', label: 'Metalico' },
      { value: 'glass', label: 'Cristal' },
      { value: 'fabric', label: 'Textil' }
    ],
    level: PARAM_LEVEL.ADVANCED,
    category: PARAM_CATEGORY.MATERIALS,
    ...overrides
  })
};

export function buildDefaultsFromParams(params = []) {
  return params.reduce((result, param) => {
    if (!param?.path || param.default === undefined) return result;
    const current = getValueAtPath(result, param.path);
    if (current !== undefined) return result;
    return mergeAtPath(result, param.path, param.default);
  }, {});
}

function mergeAtPath(seed, path, value) {
  const next = JSON.parse(JSON.stringify(seed));
  const parts = String(path).split('.');
  let current = next;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      current[part] = value;
      return;
    }
    if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) {
      current[part] = {};
    }
    current = current[part];
  });
  return next;
}
