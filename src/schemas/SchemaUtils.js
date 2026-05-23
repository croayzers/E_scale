export function deepClone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function deepMerge(base, override) {
  if (Array.isArray(base) || Array.isArray(override)) {
    return deepClone(override ?? base);
  }
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override === undefined ? deepClone(base) : deepClone(override);
  }

  const result = { ...deepClone(base) };
  Object.entries(override).forEach(([key, value]) => {
    if (value === undefined) return;
    result[key] = key in result
      ? deepMerge(result[key], value)
      : deepClone(value);
  });
  return result;
}

export function getValueAtPath(source, path, fallback = undefined) {
  if (!path) return source;
  const parts = Array.isArray(path) ? path : String(path).split('.');
  let current = source;
  for (const part of parts) {
    if (current == null || !(part in current)) return fallback;
    current = current[part];
  }
  return current === undefined ? fallback : current;
}

export function setValueAtPath(target, path, value) {
  const parts = Array.isArray(path) ? path : String(path).split('.');
  const clone = isPlainObject(target) ? deepClone(target) : {};
  let current = clone;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      current[part] = value;
      return;
    }
    if (!isPlainObject(current[part])) current[part] = {};
    current = current[part];
  });
  return clone;
}

export function buildPatch(path, value) {
  return setValueAtPath({}, path, value);
}

export function clamp(value, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

export function roundToStep(value, step = 1) {
  if (!step) return value;
  return Math.round(value / step) * step;
}

export function radiansToDegrees(value) {
  return Number(value || 0) * 180 / Math.PI;
}

export function degreesToRadians(value) {
  return Number(value || 0) * Math.PI / 180;
}

export function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueById(items = []) {
  const seen = new Map();
  items.forEach(item => {
    if (!item?.id) return;
    seen.set(item.id, item);
  });
  return [...seen.values()];
}

export function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function toTitleCase(value) {
  return String(value || '')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}
