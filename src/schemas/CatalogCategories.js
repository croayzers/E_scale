export const CATALOG_CATEGORIES = [
  { key: 'chairs', label: 'Sillas', icon: 'armchair' },
  { key: 'tables', label: 'Mesas', icon: 'circle-dot' },
  { key: 'decor', label: 'Carpas', icon: 'tent' },
  { key: 'bars', label: 'Buffet', icon: 'utensils-crossed' },
  { key: 'structures', label: 'Estructuras', icon: 'columns-3' },
  { key: 'ambient', label: 'Ambiente', icon: 'sparkles' },
  { key: 'scenography', label: 'Escenografia', icon: 'gallery-horizontal' },
  { key: 'services', label: 'Servicios', icon: 'shield-check' },
  { key: 'staff', label: 'Personal', icon: 'users' },
  { key: 'hospitality', label: 'Hosteleria', icon: 'martini' },
  { key: 'decoration', label: 'Decoracion', icon: 'flower-2' },
  { key: 'lighting', label: 'Iluminacion', icon: 'lamp' }
];

export const CATEGORY_KEYS = CATALOG_CATEGORIES.map(category => category.key);
