/* ─────────────────────────────────────────────────────────
   PLAN FEATURES — Fuente de verdad de diferencias entre planes
   Actualiza aquí primero; admin/index.html se genera a partir de esto.
   ───────────────────────────────────────────────────────── */

export const PLAN_CODES = ['free_lite', 'pro', 'premium', 'enterprise'];

export const PLAN_META = {
  free_lite:  { name: 'LITE',          price: 'Gratis',    audience: 'Particulares',    tier: 'lite',         color: '#718096' },
  pro:        { name: 'PRO',           price: '€34/mes',   audience: 'Freelance',        tier: 'pro',          color: '#667eea' },
  premium:    { name: 'PRO Unlimited', price: '€120/mes',  audience: 'Equipos',          tier: 'pro-unlimited', color: '#805ad5' },
  enterprise: { name: 'PREMIUM',       price: 'Consultar', audience: 'Empresa',          tier: 'enterprise',   color: '#c05621', comingSoon: true }
};

/* ── Límites numéricos ──────────────────────────────────── */
export const PLAN_LIMITS = {
  free_lite:  { activeProjects: 1,           elementsPerPlan: 50,    teamUsers: 1,  undoSteps: 5,  templateSlots: 3  },
  pro:        { activeProjects: null,         elementsPerPlan: null,  teamUsers: 2,  undoSteps: 20, templateSlots: 20 },
  premium:    { activeProjects: null,         elementsPerPlan: null,  teamUsers: null, undoSteps: 20, templateSlots: 50 },
  enterprise: { activeProjects: null,         elementsPerPlan: null,  teamUsers: null, undoSteps: 30, templateSlots: null }
};

/* Alias rápido para pushHistory en AppState */
export const PLAN_UNDO_LIMITS = {
  free_lite:  5,
  pro:        20,
  premium:    20,
  enterprise: 30
};

/* ── Tabla comparativa por categorías ──────────────────── */
export const PLAN_FEATURE_CATEGORIES = [
  {
    category: 'Proyectos y elementos',
    rows: [
      {
        id: 'activeProjects',
        label: 'Proyectos activos',
        icon: 'folder',
        values: { free_lite: '1 proyecto', pro: 'Ilimitados', premium: 'Ilimitados', enterprise: 'Ilimitados' }
      },
      {
        id: 'elementsPerPlan',
        label: 'Elementos por plano',
        icon: 'grid-2x2',
        values: { free_lite: 'Hasta 50', pro: 'Ilimitados', premium: 'Ilimitados', enterprise: 'Ilimitados' }
      },
      {
        id: 'catalog',
        label: 'Catálogo de elementos',
        icon: 'package',
        values: { free_lite: 'Básico (2 cat.)', pro: 'Completo', premium: 'Completo', enterprise: 'Completo' }
      }
    ]
  },
  {
    category: 'Exportación',
    rows: [
      {
        id: 'pngExport',
        label: 'Exportación PNG',
        icon: 'image',
        values: { free_lite: 'check', pro: 'check', premium: 'check', enterprise: 'check' }
      },
      {
        id: 'pdfExport',
        label: 'Exportación PDF',
        icon: 'file-text',
        values: { free_lite: 'dash', pro: 'check', premium: 'check', enterprise: 'check' }
      },
      {
        id: 'emailPdfToOwner',
        label: 'Envío PDF por email',
        icon: 'mail',
        values: { free_lite: 'dash', pro: 'check', premium: 'check', enterprise: 'check' }
      }
    ]
  },
  {
    category: 'Trabajo en equipo',
    rows: [
      {
        id: 'teamUsers',
        label: 'Usuarios del equipo',
        icon: 'users',
        values: { free_lite: '1 usuario', pro: '2 usuarios', premium: 'Ilimitados', enterprise: 'Ilimitados' }
      },
      {
        id: 'simultaneousEdit',
        label: 'Edición simultánea',
        icon: 'zap',
        values: { free_lite: 'dash', pro: 'dash', premium: 'check', enterprise: 'check' }
      },
      {
        id: 'cloudSync',
        label: 'Sincronización Cloud',
        icon: 'cloud',
        values: { free_lite: 'dash', pro: 'dash', premium: 'check', enterprise: 'check' }
      },
      {
        id: 'shareWithClients',
        label: 'Compartir con clientes',
        icon: 'share-2',
        values: { free_lite: 'dash', pro: 'check', premium: 'check', enterprise: 'check' }
      }
    ]
  },
  {
    category: 'Historial y deshacer',
    rows: [
      {
        id: 'undoSteps',
        label: 'Pasos Control+Z',
        icon: 'rotate-ccw',
        highlight: true,
        values: { free_lite: '5 pasos', pro: '20 pasos', premium: '20 pasos', enterprise: '30 pasos' }
      },
      {
        id: 'versionHistory',
        label: 'Historial de versiones',
        icon: 'clock',
        values: { free_lite: 'dash', pro: 'dash', premium: 'check', enterprise: 'check' }
      }
    ]
  },
  {
    category: 'Marca y personalización',
    rows: [
      {
        id: 'ownLogo',
        label: 'Logo propio en documentos',
        icon: 'image',
        values: { free_lite: 'dash', pro: 'check', premium: 'check', enterprise: 'check' }
      },
      {
        id: 'escaleBranding',
        label: 'Branding E-scale',
        icon: 'tag',
        values: { free_lite: 'Siempre visible', pro: 'Opcional', premium: 'Opcional', enterprise: 'Opcional' }
      }
    ]
  },
  {
    category: 'Integraciones',
    rows: [
      {
        id: 'supplierExcel',
        label: 'Importación Excel proveedores',
        icon: 'table-2',
        values: { free_lite: 'dash', pro: 'check', premium: 'check', enterprise: 'check' }
      },
      {
        id: 'crmIntegration',
        label: 'Integración CRM',
        icon: 'link',
        values: { free_lite: 'dash', pro: 'dash', premium: 'dash', enterprise: 'check' }
      },
      {
        id: 'erpIntegration',
        label: 'Integración ERP',
        icon: 'server',
        values: { free_lite: 'dash', pro: 'dash', premium: 'dash', enterprise: 'check' }
      },
      {
        id: 'reporting',
        label: 'Informes de empresa',
        icon: 'bar-chart-2',
        values: { free_lite: 'dash', pro: 'check', premium: 'check', enterprise: 'check' }
      }
    ]
  }
];
