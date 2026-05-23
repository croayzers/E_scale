import { ELEMENT_SCHEMAS } from './ElementSchemas.js';
import { buildDefaultsFromParams } from './ParamDefinitions.js';
import { deepClone, deepMerge } from './SchemaUtils.js';

const byId = new Map(ELEMENT_SCHEMAS.map(schema => [schema.id, schema]));

function resolve(item) {
  if (!item) return null;
  if (item.schemaId && byId.has(item.schemaId)) return byId.get(item.schemaId);
  return ELEMENT_SCHEMAS.find(schema => {
    if (typeof schema.match === 'function') return schema.match(item);
    return false;
  }) || null;
}

function defaultsFor(schemaOrId) {
  const schema = typeof schemaOrId === 'string' ? byId.get(schemaOrId) : schemaOrId;
  if (!schema) return {};
  const paramDefaults = buildDefaultsFromParams(schema.params || []);
  return deepMerge(paramDefaults, schema.defaults || {});
}

function enrichItem(item) {
  const schema = resolve(item);
  if (!schema) return deepClone(item);
  const merged = deepMerge(defaultsFor(schema), item);
  merged.schemaId = schema.id;
  return merged;
}

function all() {
  return ELEMENT_SCHEMAS.slice();
}

export const SchemaRegistry = {
  all,
  resolve,
  defaultsFor,
  enrichItem,
  getById(id) {
    return byId.get(id) || null;
  }
};
