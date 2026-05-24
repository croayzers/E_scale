import { ExportManager } from '../io/ExportManager.js';
import { TemplateManager } from '../io/TemplateManager.js';
import { SubscriptionManager } from '../services/SubscriptionManager.js';
import { ProButtonManager } from './ProButtonManager.js';

const MENU_CONFIG = {
  template: {
    buttonId: 'btn-template-menu',
    menuId: 'template-menu'
  },
  print: {
    buttonId: 'btn-print-menu',
    menuId: 'print-menu'
  }
};

let activeMenuKey = '';

function getMenuElements(menuKey) {
  const config = MENU_CONFIG[menuKey];
  if (!config) return {};
  return {
    button: document.getElementById(config.buttonId),
    menu: document.getElementById(config.menuId)
  };
}

function positionMenu(menu, button) {
  if (!menu || !button) return;
  const rect = button.getBoundingClientRect();
  const menuWidth = menu.offsetWidth || 320;
  const left = Math.min(
    Math.max(12, rect.left),
    window.innerWidth - menuWidth - 12
  );

  menu.style.left = `${left}px`;
  menu.style.top = `${rect.bottom + 10}px`;
}

function setMenuOpenState(menuKey, open) {
  const { button, menu } = getMenuElements(menuKey);
  if (!button || !menu) return;
  button.classList.toggle('active', open);
  menu.classList.toggle('hidden', !open);
  menu.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function closeMenus() {
  Object.keys(MENU_CONFIG).forEach(key => setMenuOpenState(key, false));
  activeMenuKey = '';
}

function refreshTemplateMenu() {
  const meta = TemplateManager.getCurrentTemplateMeta();
  const currentName = document.getElementById('template-current-name');
  const source = document.getElementById('template-current-source');

  if (currentName) currentName.textContent = meta.name || 'Escena actual';
  if (source) {
    source.textContent = meta.source === 'loaded'
      ? 'Plantilla cargada'
      : meta.source === 'saved'
        ? 'Ultima plantilla guardada'
        : 'Escena en curso';
  }
}

function refreshPrintMenu() {
  const note = document.getElementById('print-menu-note');
  const insights = window.getEscaleSceneInsights?.('print-menu') || null;
  const hasPro = SubscriptionManager.currentPlanCode() === 'pro' || SubscriptionManager.currentPlanCode() === 'premium';

  if (!note) return;

  if (hasPro) {
    note.textContent = insights?.hasSceneItems
      ? 'PDF, inventario y planning listos para exportar.'
      : 'Disponible para cuando empieces a colocar elementos.';
    note.classList.remove('is-upsell');
    return;
  }

  note.textContent = insights?.hasSceneItems
    ? 'Disponible en PRO: PDF con vista previa, inventario CSV y planning compartible.'
    : 'Estas acciones se desbloquean en PRO cuando prepares el planning.';
  note.classList.add('is-upsell');
}

function refreshMenus() {
  refreshTemplateMenu();
  refreshPrintMenu();
  ProButtonManager.markButtons(document);
}

function openMenu(menuKey) {
  const { button, menu } = getMenuElements(menuKey);
  if (!button || !menu) return;

  refreshMenus();
  closeMenus();
  setMenuOpenState(menuKey, true);
  positionMenu(menu, button);
  activeMenuKey = menuKey;
}

function toggleMenu(menuKey) {
  if (activeMenuKey === menuKey) {
    closeMenus();
    return;
  }
  openMenu(menuKey);
}

function handleTemplateAction(action) {
  closeMenus();
  if (action === 'load') {
    TemplateManager.load();
    return;
  }
  if (action === 'save') TemplateManager.save();
}

function handlePrintAction(action, button) {
  const featureKey = button?.dataset?.proFeature || '';
  closeMenus();

  if (featureKey && !SubscriptionManager.hasFeature(featureKey)) {
    SubscriptionManager.ensureFeature(featureKey);
    return;
  }

  if (action === 'pdf') {
    ExportManager.openModal({ kind: 'pdf' });
    return;
  }

  if (action === 'inventory') {
    ExportManager.openModal({ kind: 'inventory' });
    return;
  }

  if (action === 'share') {
    document.dispatchEvent(new CustomEvent('escale:share-planning'));
  }
}

function onDocumentClick(event) {
  const clickedInsideMenu = Object.keys(MENU_CONFIG).some(key => {
    const { button, menu } = getMenuElements(key);
    return button?.contains(event.target) || menu?.contains(event.target);
  });

  if (!clickedInsideMenu) closeMenus();
}

function init() {
  ProButtonManager.init();

  document.getElementById('btn-template-menu')?.addEventListener('click', event => {
    event.stopPropagation();
    toggleMenu('template');
  });
  document.getElementById('btn-print-menu')?.addEventListener('click', event => {
    event.stopPropagation();
    toggleMenu('print');
  });

  document.querySelectorAll('[data-template-action]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      handleTemplateAction(button.dataset.templateAction);
    });
  });

  document.querySelectorAll('[data-print-action]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      handlePrintAction(button.dataset.printAction, button);
    });
  });

  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenus();
  });
  window.addEventListener('resize', closeMenus);
  window.addEventListener('scroll', closeMenus, true);
  document.addEventListener('escale:template-meta-changed', refreshTemplateMenu);
  document.addEventListener('escale:plan-changed', refreshPrintMenu);
  document.addEventListener('escale:scene-insights-changed', refreshPrintMenu);
  document.addEventListener('escale:open-print-menu', () => openMenu('print'));

  refreshMenus();
}

export const HeaderActionMenus = {
  init,
  openMenu,
  closeMenus
};
