export interface NavItem {
  label: string;
  icon: string;
  route: string;
  /** Mobile only: `bar` shows it in the bottom bar, `drawer` in the "Más" drawer. */
  mobile: 'bar' | 'drawer';
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Cajas', icon: 'package_2', route: '/boxes', mobile: 'bar' },
  { label: 'Zonas', icon: 'shelves', route: '/zones', mobile: 'drawer' },
  { label: 'Búsqueda', icon: 'search', route: '/search', mobile: 'bar' },
  { label: 'Movimientos', icon: 'swap_horiz', route: '/logs', mobile: 'drawer' },
  { label: 'Importar', icon: 'upload_file', route: '/import', mobile: 'drawer' },
];
