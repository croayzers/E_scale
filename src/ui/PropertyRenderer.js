import { SchemaRegistry } from '../schemas/SchemaRegistry.js';
import { buildPatch, clamp, deepMerge, getValueAtPath } from '../schemas/SchemaUtils.js';

function canRender(item) {
  return Boolean(SchemaRegistry.resolve(item));
}

function displayValue(item, param) {
  if (typeof param.read === 'function') return param.read(item, param);
  return getValueAtPath(item, param.path, param.default);
}

function parseRawValue(param, element) {
  if (param.type === 'toggle') return Boolean(element.checked);
  if (param.type === 'number' || param.type === 'range') return Number(element.value);
  return element.value;
}

function normalizeValue(param, value) {
  if (typeof param.coerce === 'function') return param.coerce(value, param);
  if (param.type === 'number' || param.type === 'range') {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return Number(param.default || 0);
    if (param.min !== undefined || param.max !== undefined) {
      return clamp(numeric, param.min ?? Number.NEGATIVE_INFINITY, param.max ?? Number.POSITIVE_INFINITY);
    }
    return numeric;
  }
  return value;
}

function patchForParam(item, param, nextValue) {
  if (typeof param.write === 'function') return param.write(nextValue, item, param) || {};
  const basePatch = param.path ? buildPatch(param.path, nextValue) : {};
  if (typeof param.onChange === 'function') {
    return deepMerge(basePatch, param.onChange({ value: nextValue, item, param, patch: basePatch }) || {});
  }
  return basePatch;
}

function isVisible(item, param) {
  if (typeof param.visibleIf === 'function') return Boolean(param.visibleIf(item, param));
  return true;
}

function fieldMarkup(item, param) {
  const value = displayValue(item, param);
  const label = param.label || param.key;
  const unit = param.unit ? `<span class="mono text-[9px] uppercase tracking-widest" style="color:var(--muted)">${param.unit}</span>` : '';
  const hint = param.suffix ? `<span class="mono text-[9px] uppercase tracking-widest" style="color:var(--muted)">${param.suffix}</span>` : unit;

  if (param.type === 'toggle') {
    return `
      <label class="flex items-center justify-between gap-3 py-1.5">
        <span class="text-[12px]">${label}</span>
        <input data-param-key="${param.key}" type="checkbox" ${value ? 'checked' : ''}/>
      </label>
    `;
  }

  if (param.type === 'select') {
    const options = (param.options || []).map(option => `
      <option value="${option.value}" ${String(option.value) === String(value) ? 'selected' : ''}>${option.label}</option>
    `).join('');
    return `
      <label class="block">
        <span class="mono text-[9.5px] uppercase block mb-1" style="color:var(--muted)">${label}</span>
        <select data-param-key="${param.key}" class="input-field">${options}</select>
      </label>
    `;
  }

  if (param.type === 'color') {
    return `
      <label class="block">
        <span class="mono text-[9.5px] uppercase block mb-1" style="color:var(--muted)">${label}</span>
        <input data-param-key="${param.key}" type="color" value="${value || '#CCCCCC'}" class="input-field" style="padding:2px;height:36px"/>
      </label>
    `;
  }

  if (param.type === 'range') {
    return `
      <label class="block">
        <span class="mono text-[9.5px] uppercase block mb-1" style="color:var(--muted)">${label}</span>
        <div class="flex items-center gap-2">
          <input data-param-key="${param.key}" type="range" min="${param.min ?? 0}" max="${param.max ?? 100}" step="${param.step ?? 1}" value="${value}" class="flex-1"/>
          <span class="mono text-[10px]" style="min-width:44px">${Number(value).toFixed(2)}</span>
        </div>
      </label>
    `;
  }

  const type = param.type === 'number' ? 'number' : 'text';
  const attrs = [
    `data-param-key="${param.key}"`,
    `type="${type}"`,
    `class="input-field"`,
    param.min !== undefined ? `min="${param.min}"` : '',
    param.max !== undefined ? `max="${param.max}"` : '',
    param.step !== undefined ? `step="${param.step}"` : '',
    param.maxLength !== undefined ? `maxlength="${param.maxLength}"` : '',
    `value="${value ?? ''}"`
  ].filter(Boolean).join(' ');

  return `
    <label class="block">
      <span class="mono text-[9.5px] uppercase block mb-1" style="color:var(--muted)">${label}</span>
      <div class="flex items-center gap-2">
        <input ${attrs}/>
        ${hint}
      </div>
    </label>
  `;
}

function groupMarkup(title, params, item, advanced = false) {
  if (!params.length) return '';
  const body = params.map(param => fieldMarkup(item, param)).join('');
  if (!advanced) {
    return `
      <div class="space-y-3">
        <div class="mono text-[9.5px] uppercase tracking-widest" style="color:var(--muted)">${title}</div>
        <div class="grid grid-cols-2 gap-2">${body}</div>
      </div>
    `;
  }
  return `
    <details class="schema-advanced-panel">
      <summary class="schema-advanced-summary">
        <span class="mono text-[10px] uppercase tracking-widest" style="color:var(--muted)">Ajustes avanzados</span>
        <span class="mono text-[10px]" style="color:var(--muted)">⚙</span>
      </summary>
      <div class="grid grid-cols-2 gap-2 pt-3">${body}</div>
    </details>
  `;
}

function bindFieldEvents(panel, item, params, AppState) {
  params.forEach(param => {
    const element = panel.querySelector(`[data-param-key="${param.key}"]`);
    if (!element) return;
    const eventName = param.type === 'color' || param.type === 'range'
      ? 'input'
      : 'change';
    element.addEventListener(eventName, () => {
      const raw = parseRawValue(param, element);
      const normalized = normalizeValue(param, raw);
      const patch = patchForParam(item, param, normalized);
      AppState.update(item.id, patch, { skipDetailRebuild: param.type === 'color' || param.type === 'range' });
    });
  });
}

function render({ item, panel, content, AppState }) {
  const schema = SchemaRegistry.resolve(item);
  if (!schema || !panel || !content) return false;

  const visibleParams = (schema.params || []).filter(param => isVisible(item, param));
  const basic = visibleParams.filter(param => param.level !== 'advanced');
  const advanced = visibleParams.filter(param => param.level === 'advanced');
  const title = schema.metadata?.label || item.labelText || item.type;
  const subtitle = [item.name, item.subtype, `ID #${item.id}`].filter(Boolean).join(' · ');

  content.innerHTML = `
    <div class="display-font text-2xl mb-1 leading-tight">${title}</div>
    <div class="mono text-[10px] uppercase tracking-widest mb-4" style="color:var(--muted)">${subtitle}</div>
    ${groupMarkup('Parametros basicos', basic, item, false)}
    ${advanced.length ? '<div class="rule"></div>' : ''}
    ${groupMarkup('Ajustes avanzados', advanced, item, true)}
    <div class="rule"></div>
    <div class="flex gap-2">
      <button data-act="dup" class="btn ghost flex-1 justify-center"><i data-lucide="copy" class="w-3.5 h-3.5"></i>Duplicar</button>
      <button data-act="del" class="btn danger ghost flex-1 justify-center"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i>Eliminar</button>
    </div>
  `;

  panel.style.display = 'block';
  if (window.lucide) lucide.createIcons();

  bindFieldEvents(panel, item, visibleParams, AppState);
  panel.querySelector('[data-act="dup"]')?.addEventListener('click', () => AppState.duplicate(item.id));
  panel.querySelector('[data-act="del"]')?.addEventListener('click', () => AppState.remove(item.id));
  return true;
}

export const PropertyRenderer = {
  canRender,
  render
};
