#!/usr/bin/env node
/* Genera admin/project-tree.json para el visor interactivo del admin dashboard.
   Uso: node generate-tree-json.js */

const fs   = require('fs');
const path = require('path');

const ROOT = process.cwd();
const OUT  = path.join(ROOT, 'admin', 'project-tree.json');

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.chrome-cdp', '.edge-cdp',
  '__pycache__', '.claude', '.codex-artifacts'
]);
const IGNORE_FILES = new Set([
  'project-tree.json', 'project-tree.txt'
]);

function sortItems(items, dir) {
  return [...items].sort((a, b) => {
    const aDir = fs.statSync(path.join(dir, a)).isDirectory();
    const bDir = fs.statSync(path.join(dir, b)).isDirectory();
    if (aDir !== bDir) return aDir ? -1 : 1;
    return a.localeCompare(b, 'es', { sensitivity: 'base' });
  });
}

function build(abs, rel) {
  const stat = fs.statSync(abs);
  const name = path.basename(abs);

  if (stat.isDirectory()) {
    const raw = fs.readdirSync(abs).filter(i => !IGNORE_DIRS.has(i) && !IGNORE_FILES.has(i));
    return {
      name, path: rel, type: 'dir',
      children: sortItems(raw, abs).map(i => build(path.join(abs, i), rel ? `${rel}/${i}` : i))
    };
  }

  return {
    name, path: rel, type: 'file',
    ext:  path.extname(name).slice(1).toLowerCase() || '',
    size: stat.size
  };
}

const topLevel = fs.readdirSync(ROOT).filter(i => !IGNORE_DIRS.has(i) && !IGNORE_FILES.has(i));
const tree = {
  name:      'E-scale',
  path:      '.',
  type:      'dir',
  generated: new Date().toISOString(),
  children:  sortItems(topLevel, ROOT).map(i => build(path.join(ROOT, i), i))
};

fs.writeFileSync(OUT, JSON.stringify(tree, null, 2));
console.log(`✔  project-tree.json → ${path.relative(ROOT, OUT)}`);
