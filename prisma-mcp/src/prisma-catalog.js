// ============================================================
// Prisma Catalog — Catálogo de componentes de Prisma-Components
// Fuente: Figma LnYUTRFuwWpI9phwDCSHOx + Tokens ajTov04sBM1NsSV10A801Y
// Última actualización: 2026-07-10
//
// figmaKey   → key del VARIANT específico en Prisma-Components (para importComponentByKeyAsync)
// layoutType → cómo se posiciona en el frame de pantalla:
//   'full-bleed'  : ancho 100%, sin padding lateral (header, topbar, banners, navBar)
//   'padded'      : ancho 100% dentro del screen padding (buttons, inputs, cards, alerts)
//   'center'      : centrado horizontalmente, ancho propio (dialog, OTP)
//   'inline'      : elemento inline, no ocupa fila completa (tags, chips)
// ============================================================

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_CATALOG = [
  // ── Nav Bar ─────────────────────────────────────────────────
  {
    group: 'Nav Bar',
    name: 'Nav Bar > Header · Color=White · Type=Home · State=Default',
    figmaKey: '452db011c9bf52d096561a021da5edc8edc03211',
    layoutType: 'full-bleed',
    tags: ['header', 'navigation', 'home', 'navbar', 'top']
  },
  {
    group: 'Nav Bar',
    name: 'Nav Bar > Header · Color=Color · Type=Brand · State=Default',
    figmaKey: 'ef5baf068f6a02f88e796db1ece6f01a3313d8b1',
    layoutType: 'full-bleed',
    tags: ['header', 'navigation', 'brand', 'colored', 'top']
  },
  {
    group: 'Nav Bar',
    name: 'Nav Bar > NavBar · Color=Color · Type=Home · State=Default',
    figmaKey: 'de67123ed529eb944b0f0f4668d1658456a59181',
    layoutType: 'full-bleed',
    tags: ['navbar', 'bottom', 'navigation', 'tabs', 'footer', 'nav inferior']
  },
  {
    group: 'Nav Bar',
    name: 'Nav Bar > Search_header · State=Default',
    figmaKey: '241a124eb50151467338165a7df4e85514311cea',
    layoutType: 'full-bleed',
    tags: ['search', 'header', 'buscar', 'búsqueda']
  },

  // ── Top bar ──────────────────────────────────────────────────
  {
    group: 'Top bar',
    name: 'Top bar > TopBar · State=Default · Type=Icon action_no title',
    figmaKey: 'f7b29b38303bd65d769ececdac723fd018539dc0',
    layoutType: 'full-bleed',
    tags: ['topbar', 'back', 'atrás', 'flecha', 'navigation', 'top', 'sin título']
  },
  {
    group: 'Top bar',
    name: 'Top bar > TopBar_title · Type=Default',
    figmaKey: 'e888e0bda21bad8c764fdea92e4d511c96781797',
    layoutType: 'full-bleed',
    textConfig: { type: 'node', name: 'Title' },
    tags: ['topbar', 'title', 'título', 'navigation', 'top']
  },

  // ── Buttons ──────────────────────────────────────────────────
  {
    group: 'Buttons',
    name: 'Buttons > Button-Primary · Size=Lg · State=Default',
    figmaKey: '1b771472d5daa386adab7b87ff07f20e5af746f8',
    layoutType: 'padded',
    textConfig: { type: 'prop', key: 'Label#307:93' },
    tags: ['button', 'botón', 'primary', 'primario', 'cta', 'lg', 'large', 'grande', 'action']
  },
  {
    group: 'Buttons',
    name: 'Buttons > Button-Secondary · Size=Md · State=Default',
    figmaKey: 'd95c91d788a4242c44cc78457845698e57cab1d1',
    layoutType: 'padded',
    textConfig: { type: 'prop', key: 'Label#307:124' },
    tags: ['button', 'botón', 'secondary', 'secundario', 'md', 'medium']
  },
  {
    group: 'Buttons',
    name: 'Buttons > Button-Tertiary · Size=Md · State=Default',
    figmaKey: '97e3f045c271313ff70bc5b8b62317eb9b61869d',
    layoutType: 'padded',
    textConfig: { type: 'prop', key: 'Label#307:93' },
    tags: ['button', 'botón', 'tertiary', 'terciario', 'ghost', 'link', 'md']
  },

  // ── Product Card ─────────────────────────────────────────────
  {
    group: 'Product Card',
    name: 'Product Card > Product_card · Size=Md · State=Default',
    figmaKey: 'e2ea416889ee6c4d2f5f890dfb99faadc7045e74', // WlProductCard · Type=PLP · State=Default
    layoutType: 'padded',
    tags: ['product', 'card', 'tarjeta', 'producto', 'grid', 'vertical']
  },
  {
    group: 'Product Card',
    name: 'Product Card > Product card_list · State=Default',
    figmaKey: '82b060a722e9df4cd1e1ee2b3715efe18bce3aef', // WlProductCardList · State=Default · Type=Lista
    layoutType: 'padded',
    tags: ['product', 'card', 'tarjeta', 'producto', 'list', 'horizontal', 'lista']
  },

  // ── ProductCard Details ──────────────────────────────────────
  {
    group: 'ProductCard_Details',
    name: 'ProductCard_Details > ProductCard_Detail · Size=Md · State=Default',
    figmaKey: 'f0fe990130c3af893d544273425490e5f2f5a8a5', // WlProductCardDetails · Type=Default · Size=Md
    layoutType: 'padded',
    tags: ['product', 'detail', 'detalle', 'producto', 'pdp']
  },

  // ── Title Section ────────────────────────────────────────────
  {
    group: 'Title_section',
    name: 'Title_section > Title_section · Skeleton=No · CTA=Yes',
    figmaKey: '937bdb8a62a0b56f85e7bf05f2a4d80b2ff98a5c',
    layoutType: 'padded',
    textConfig: { type: 'node', name: 'Place Holder', index: 0 },
    tags: ['title', 'section', 'título', 'sección', 'cta', 'header', 'heading', 'ver más']
  },
  {
    group: 'Title_section',
    name: 'Title_section > Title_section · Skeleton=No · CTA=No',
    figmaKey: '937bdb8a62a0b56f85e7bf05f2a4d80b2ff98a5c',
    layoutType: 'padded',
    textConfig: { type: 'node', name: 'Place Holder', index: 0 },
    tags: ['title', 'section', 'título', 'sección', 'heading', 'sin cta']
  },

  // ── Banners Cards ────────────────────────────────────────────
  {
    group: 'Banners Cards',
    name: 'Banners Cards > Banner_principal · Size=Sm · Skeleton=False',
    figmaKey: '5ce02295488929bb1adbd2b9e4d351ef9536e28b',
    layoutType: 'full-bleed',
    tags: ['banner', 'imagen', 'hero', 'promo', 'small', 'sm', 'pequeño']
  },
  {
    group: 'Banners Cards',
    name: 'Banners Cards > Banner_principal · Size=Md · Skeleton=False',
    figmaKey: 'd1186a371ef2946db6dbef8d237ea3e4accfb516',
    layoutType: 'full-bleed',
    tags: ['banner', 'imagen', 'hero', 'promo', 'medium', 'md']
  },
  {
    group: 'Banners Cards',
    name: 'Banners Cards > Banner_principal · Size=Lg · Skeleton=False',
    figmaKey: '4cb70a5444e8516b57ed3fa2b77d2c14c9c34a08',
    layoutType: 'full-bleed',
    tags: ['banner', 'imagen', 'hero', 'promo', 'large', 'lg', 'grande', 'full']
  },
  {
    group: 'Banners Cards',
    name: 'Banners Cards > Banner_principal · Size=Sm · Skeleton=True',
    figmaKey: 'b19ffc3542cee5bff39951e3d839ac2689b6c480',
    layoutType: 'full-bleed',
    tags: ['banner', 'skeleton', 'loading', 'carga', 'small', 'sm']
  },
  {
    group: 'Banners Cards',
    name: 'Banners Cards > Banner_principal · Size=Md · Skeleton=True',
    figmaKey: 'ae81d2e32540a5b4f1217e92b1966e04a62cdaed',
    layoutType: 'full-bleed',
    tags: ['banner', 'skeleton', 'loading', 'carga', 'medium', 'md']
  },
  {
    group: 'Banners Cards',
    name: 'Banners Cards > Banner_principal · Size=Lg · Skeleton=True',
    figmaKey: '9d93046529bc0f6324cae392e1b89e55c1290ce1',
    layoutType: 'full-bleed',
    tags: ['banner', 'skeleton', 'loading', 'carga', 'large', 'lg']
  },
  {
    group: 'Banners Cards',
    name: 'Banners Cards > _Banners terciarios (Carruseles) · Size=Md · Skeleton=False',
    figmaKey: 'a78f006f8babf30a94791b5dc02e9cd2530c267a',
    layoutType: 'padded',
    tags: ['banner', 'carousel', 'carrusel', 'terciario', 'thumbnail', 'imagen pequeña']
  },

  // ── Carrusels ────────────────────────────────────────────────
  {
    group: 'Carrusels',
    name: 'Carrusels > Hero_banner · State=Default',
    figmaKey: 'e5f74cb238839d920e5aa3ef486fa21768e0d199',
    layoutType: 'full-bleed',
    tags: ['hero', 'carousel', 'carrusel', 'slider', 'banner hero', 'destacado']
  },

  // ── Categorys ────────────────────────────────────────────────
  {
    group: 'Categorys',
    name: 'Categorys > Category-carousel · State=Default',
    figmaKey: '019651469e728c47a46b0f008698e7f9ac13ca00',
    layoutType: 'full-bleed',
    tags: ['category', 'categoría', 'carousel', 'carrusel', 'chips', 'filtros']
  },

  // ── Quantity selector ────────────────────────────────────────
  {
    group: 'Quantity selector',
    name: 'Quantity selector > Quantity Selector · Size=Md · State=Default',
    figmaKey: 'b209cf8f6b71c749242823302317601f2ea93f47',
    layoutType: 'padded',
    tags: ['quantity', 'cantidad', 'selector', 'counter', 'add', 'agregar', 'más menos']
  },

  // ── Bottom sheet ─────────────────────────────────────────────
  {
    group: 'Bottom sheet',
    name: 'Bottom sheet > Bottom_Sheet · State=Collapsed',
    figmaKey: 'd0780cf12fe16d80088098bbe5cbddc1212cb4f4',
    layoutType: 'full-bleed',
    tags: ['bottom sheet', 'modal', 'drawer', 'sheet', 'panel', 'collapsed']
  },

  // ── Totalizer ────────────────────────────────────────────────
  {
    group: 'Totalizer',
    name: 'Totalizer > Totalizer · State=Default',
    figmaKey: 'f02c9600e405e9ab5310eadb04e533728c4de5e7',
    layoutType: 'padded',
    tags: ['totalizer', 'total', 'precio total', 'resumen', 'checkout', 'suma']
  },

  // ── Sticky Button ────────────────────────────────────────────
  {
    group: 'Sticky Button',
    name: 'Sticky Button > Sticky-button · Type=Horizontal',
    figmaKey: 'f01d0fde145ce16435c84986384d497379d71323',
    layoutType: 'full-bleed',
    textConfig: { type: 'node', name: 'Botón', index: 1 },
    tags: ['sticky', 'button', 'cta', 'fixed', 'bottom', 'fijo', 'agregar al carrito', 'comprar']
  },

  // ── Alerts ───────────────────────────────────────────────────
  {
    group: 'Alerts',
    name: 'Alerts > Alert · Type=Info · Border=False',
    figmaKey: '9b639cba7cd1d7c59df4ee735ab6f165f14b4c64',
    layoutType: 'padded',
    tags: ['alert', 'info', 'mensaje', 'información', 'aviso']
  },
  {
    group: 'Alerts',
    name: 'Alerts > Alert · Type=Error · Border=False',
    figmaKey: '13619ad244acc3799c52efac45f55875ece814de',
    layoutType: 'padded',
    tags: ['alert', 'error', 'mensaje error', 'warning', 'advertencia']
  },

  // ── Snackbar ─────────────────────────────────────────────────
  {
    group: 'Snackbar',
    name: 'Snackbar > Snackbar · Type=Success',
    figmaKey: 'e454dc64da073d1de03792b6d24411569210bc70',
    layoutType: 'full-bleed',
    tags: ['snackbar', 'toast', 'success', 'éxito', 'notificación', 'confirmación']
  },

  // ── Dialog ───────────────────────────────────────────────────
  {
    group: 'Dialog',
    name: 'Dialog > Dialog · State=Default',
    figmaKey: 'c50881561edb1d4e4ae33006a9fb0b903feb98b7',
    layoutType: 'center',
    tags: ['dialog', 'modal', 'popup', 'alert dialog', 'confirmación']
  },

  // ── Empty States ─────────────────────────────────────────────
  {
    group: 'Empty States',
    name: 'Empty States > Empty state · Type=Empty',
    figmaKey: '99aab5277ed2bbbad15271f97e6646af6601f036',
    layoutType: 'padded',
    textConfig: { type: 'prop', key: 'Edit Title#7024:6' },
    tags: ['empty', 'vacío', 'no hay datos', 'sin resultados', 'sin contenido']
  },

  // ── Tags ─────────────────────────────────────────────────────
  {
    group: 'Tags',
    name: 'Tags > Tag · Color=Green',
    figmaKey: 'dab5e3c1b6ffbda3c5c4da1b1661b2db99670f17',
    layoutType: 'inline',
    textConfig: { type: 'node', name: 'Tag' },
    tags: ['tag', 'badge', 'chip', 'etiqueta', 'verde', 'green', 'members', 'miembros']
  },
  {
    group: 'Tags',
    name: 'Tags > Tag · Color=Orange',
    figmaKey: '29eec60a5412ff71cced3e0c39197d7fd6bae62d',
    layoutType: 'inline',
    textConfig: { type: 'node', name: 'Tag' },
    tags: ['tag', 'badge', 'chip', 'etiqueta', 'naranja', 'orange', 'promo', 'oferta']
  },
  {
    group: 'Tags',
    name: 'Tags > Tag · Color=Red',
    figmaKey: '631739a2887655a99e6ad686c2d59d9add61c250',
    layoutType: 'inline',
    textConfig: { type: 'node', name: 'Tag' },
    tags: ['tag', 'badge', 'chip', 'etiqueta', 'rojo', 'red', 'descuento', 'urgente']
  },
  {
    group: 'Tags',
    name: 'Tags > Tag · Color=Blue',
    figmaKey: '94cb61f5121d7f191e7101fbbb65bafca7936755',
    layoutType: 'inline',
    textConfig: { type: 'node', name: 'Tag' },
    tags: ['tag', 'badge', 'chip', 'etiqueta', 'azul', 'blue', 'nuevo', 'new']
  },
  {
    group: 'Tags',
    name: 'Tags > Tag · Color=Neutral',
    figmaKey: 'ca4c82ec32f007f0db8997a9d831f9c15392742f',
    layoutType: 'inline',
    textConfig: { type: 'node', name: 'Tag' },
    tags: ['tag', 'badge', 'chip', 'etiqueta', 'neutral', 'gris', 'gray']
  },

  // ── Chips ────────────────────────────────────────────────────
  {
    group: 'Chips',
    name: 'Chips > pds-chip · State=Default',
    figmaKey: '4a58a60abeb0d1db7bf8b383bf1aed55e0cdc66b',
    layoutType: 'inline',
    tags: ['chip', 'filter', 'filtro', 'selección', 'toggle', 'categoría']
  },

  // ── Inputs ───────────────────────────────────────────────────
  {
    group: 'Inputs',
    name: 'Inputs > Input · State=Default',
    figmaKey: '5d6e518745a2f61adca03167e19d3c1c88bf1545',
    layoutType: 'padded',
    tags: ['input', 'field', 'text field', 'campo', 'formulario', 'texto', 'escribir']
  },

  // ── Select list ──────────────────────────────────────────────
  {
    group: 'Select list',
    name: 'Select list > Select_list · Type=Check',
    figmaKey: '73bd3aebc0ad19043df41039aa18d2af4608dc6d',
    layoutType: 'padded',
    tags: ['select', 'list', 'lista', 'checkbox', 'check', 'selección múltiple']
  },

  // ── Location ─────────────────────────────────────────────────
  {
    group: 'Location',
    name: 'Location > location · Type=Recibe',
    figmaKey: 'ae60a3fcb20c48bbbd8bace321ec4524aef23092',
    layoutType: 'full-bleed',
    tags: ['location', 'ubicación', 'recibe', 'delivery', 'domicilio', 'dirección']
  },
  {
    group: 'Location',
    name: 'Location > location · Type=Retira',
    figmaKey: 'fed2ff32b9efba0ff6b283884d94f30e67e912d5', // WlLocation · Type=Retira
    layoutType: 'full-bleed',
    tags: ['location', 'ubicación', 'retira', 'pickup', 'tienda', 'retiro']
  },
  {
    group: 'Location',
    name: 'Location > location · Type=Brand',
    figmaKey: 'aeb03f66f31ba097c44766dd1a5324320063f38c',
    layoutType: 'full-bleed',
    tags: ['location', 'ubicación', 'brand', 'info row', 'fila info', 'detalle', 'metadata']
  },
  {
    group: 'Location',
    name: 'Location > location · Type=Ofertas',
    figmaKey: '3f0d891c726b1690f8e30070ab78c21fb6f0c33f',
    layoutType: 'full-bleed',
    tags: ['location', 'ubicación', 'ofertas', 'deals', 'tienda ofertas']
  },

  // ── Payments ─────────────────────────────────────────────────
  {
    group: 'Payments',
    name: 'Payments > Payment · Type=VISA',
    figmaKey: 'ef354b237c5afa062b2d43fd4dc86db104524c4c', // WlPayments · Type=Visa · Size=Md
    layoutType: 'padded',
    tags: ['payment', 'pago', 'tarjeta', 'visa', 'credit card', 'método de pago']
  },

  // ── Levels Cards ─────────────────────────────────────────────
  {
    group: 'LevelsCards',
    name: 'LevelsCards > CardNivele · Type=Plus',
    figmaKey: '6b99786889a38f28136868b771d5fbca68001f39',
    layoutType: 'padded',
    tags: ['loyalty', 'levels', 'niveles', 'membership', 'membresía', 'plus', 'tier']
  },

  // ── Promo Card ───────────────────────────────────────────────
  {
    group: 'Promo Card',
    name: 'Promo Card > Promo_card · State=Default · Type=Arrow',
    figmaKey: '1843f9b76e4c8b7d0fd2bff9ccc8bda816dd1816',
    layoutType: 'padded',
    tags: ['promo', 'card', 'tarjeta promo', 'arrow', 'flecha', 'link', 'cupón']
  },
  {
    group: 'Promo Card',
    name: 'Promo Card > Promo_card · State=Default · Type=Button',
    figmaKey: 'aa6a203d9e448b948e50a3aaaa3b65694b9e94b3',
    layoutType: 'padded',
    tags: ['promo', 'card', 'tarjeta promo', 'button', 'botón', 'cupón', 'reward', 'canjear']
  },

  // ── Information Card ─────────────────────────────────────────
  {
    group: 'Information Card',
    name: 'Information Card > InformationCard · State=Brand · Skeleton=False',
    figmaKey: '679d4ac16949a9467274b33929554c9bb07df9cd',
    layoutType: 'padded',
    tags: ['information', 'card', 'info', 'brand', 'cta', 'membresía', 'conversión', 'gate', 'unirse', 'registro']
  },
  {
    group: 'Information Card',
    name: 'Information Card > InformationCard · State=Default · Skeleton=False',
    figmaKey: '679d4ac16949a9467274b33929554c9bb07df9cd',
    layoutType: 'padded',
    tags: ['information', 'card', 'info', 'default', 'neutral', 'informativo']
  },
];

// Patrones de pantalla frecuentes (para inferir desde prompt)
export const SCREEN_PATTERNS = {
  feed: [
    { order: 1, component: 'Top bar > TopBar_title · Type=Default', role: 'navegación' },
    { order: 2, component: 'Title_section > Title_section · Skeleton=No · CTA=No', role: 'separador de sección' },
    { order: 3, tipo: 'composicion', nombre_intencional: 'ItemCard', role: 'tarjeta de ítem' },
    { order: 4, component: 'Nav Bar > NavBar · Color=Color · Type=Home · State=Default', role: 'nav inferior' }
  ],
  detail: [
    { order: 1, component: 'Top bar > TopBar · State=Default · Type=Icon action_no title', role: 'back navigation' },
    { order: 2, component: 'Banners Cards > Banner_principal · Size=Lg · Skeleton=False', role: 'imagen hero' },
    { order: 3, component: 'Tags > Tag · Color=Green', role: 'badge de categoría' },
    { order: 4, component: 'Title_section > Title_section · Skeleton=No · CTA=No', role: 'título y descripción' },
    { order: 5, component: 'Sticky Button > Sticky-button · Type=Horizontal', role: 'CTA principal' }
  ],
  home: [
    { order: 1, component: 'Nav Bar > Header · Color=White · Type=Home · State=Default', role: 'header principal' },
    { order: 2, component: 'Nav Bar > Search_header · State=Default', role: 'búsqueda' },
    { order: 3, component: 'Carrusels > Hero_banner · State=Default', role: 'banner hero' },
    { order: 4, component: 'Categorys > Category-carousel · State=Default', role: 'categorías' },
    { order: 5, component: 'Nav Bar > NavBar · Color=Color · Type=Home · State=Default', role: 'nav inferior' }
  ],
  gate: [
    { order: 1, component: 'Top bar > TopBar · State=Default · Type=Icon action_no title', role: 'back' },
    { order: 2, component: 'Banners Cards > Banner_principal · Size=Lg · Skeleton=False', role: 'imagen hero' },
    { order: 3, component: 'Title_section > Title_section · Skeleton=No · CTA=No', role: 'título' },
    { order: 4, component: 'Information Card > InformationCard · State=Brand · Skeleton=False', role: 'soft gate membresía' },
    { order: 5, component: 'Nav Bar > NavBar · Color=Color · Type=Home · State=Default', role: 'nav inferior' }
  ],
  empty: [
    { order: 1, component: 'Top bar > TopBar_title · Type=Default', role: 'navegación' },
    { order: 2, component: 'Empty States > Empty state · Type=Empty', role: 'estado vacío' },
    { order: 3, component: 'Nav Bar > NavBar · Color=Color · Type=Home · State=Default', role: 'nav inferior' }
  ]
};

export class PrismaCatalog {
  constructor() {
    this._catalog = [...BASE_CATALOG];
    this._keyMap = {};
    // Pre-populate keyMap desde figmaKey del catálogo base
    for (const comp of this._catalog) {
      if (comp.figmaKey) {
        this._keyMap[normStr(comp.name)] = comp.figmaKey;
      }
    }
    // Cargar keys actualizados por el auto-sync (prisma-keys.json)
    try {
      const keysPath = join(__dirname, 'prisma-keys.json');
      const overrides = JSON.parse(readFileSync(keysPath, 'utf8'));
      // Merge: los keys del sync sobreescriben el catálogo base
      Object.assign(this._keyMap, overrides);
      // También actualizar el array _catalog con los keys frescos
      for (const comp of this._catalog) {
        const fresh = overrides[normStr(comp.name)];
        if (fresh) comp.figmaKey = fresh;
      }
    } catch {
      // prisma-keys.json aún no existe — usar catálogo base
    }
  }

  /** Enriquecer catálogo con keys reales de Figma (desde sync_prisma_library) */
  updateFromFigma(components) {
    let newCount = 0;
    for (const comp of components) {
      const existing = this._catalog.find(c => normStr(c.name) === normStr(comp.name));
      if (existing) {
        if (comp.key) existing.figmaKey = comp.key;
        if (comp.layoutType) existing.layoutType = comp.layoutType;
      } else {
        this._catalog.push({
          group: comp.group || 'Other',
          name: comp.name,
          figmaKey: comp.key || null,
          layoutType: comp.layoutType || 'padded',
          tags: [comp.name.toLowerCase()]
        });
        newCount++;
      }
      if (comp.key) this._keyMap[normStr(comp.name)] = comp.key;
    }
    return newCount;
  }

  /** Buscar key de Figma para un nombre de componente */
  getKey(name) {
    // Buscar match exacto primero
    const exact = this._catalog.find(c => normStr(c.name) === normStr(name));
    if (exact?.figmaKey) return exact.figmaKey;
    // Fallback: keyMap
    return this._keyMap[normStr(name)] || null;
  }

  /** Obtener layoutType para un nombre de componente */
  getLayoutType(name) {
    const comp = this.get(name);
    return comp?.layoutType || 'padded';
  }

  /** Obtener componentes con figmaKey resuelto (para generador de pantallas) */
  getResolved(name) {
    const comp = this.get(name);
    if (!comp) return null;
    return { ...comp, resolved: !!comp.figmaKey };
  }

  /** Listar componentes (con filtro opcional) */
  list(filter, group) {
    let result = [...this._catalog];
    if (group) result = result.filter(c => normStr(c.group).includes(normStr(group)));
    if (filter) {
      const f = normStr(filter);
      result = result.filter(c =>
        normStr(c.name).includes(f) || c.tags.some(t => normStr(t).includes(f))
      );
    }
    return result;
  }

  /** Stats de cobertura */
  coverage() {
    const total = this._catalog.length;
    const withKey = this._catalog.filter(c => c.figmaKey).length;
    return { total, withKey, missing: total - withKey, pct: Math.round((withKey / total) * 100) };
  }

  getGroups() { return [...new Set(this._catalog.map(c => c.group))]; }
  getAll()    { return [...this._catalog]; }
  exists(name) {
    const n = normStr(name);
    return this._catalog.some(c => normStr(c.name) === n || normStr(c.name).includes(n));
  }
  get(name) {
    const n = normStr(name);

    // 1. Exact normalized match
    let found = this._catalog.find(c => normStr(c.name) === n);
    if (found) return found;

    // 2. Partial: catalog name contains the search term
    found = this._catalog.find(c => normStr(c.name).includes(n));
    if (found) return found;

    // 3. Fuzzy fallback: strip variant props (Skeleton, Size, State) one at a time
    //    and retry — lets "Tag · Color=Green · Size=Md" match "Tag · Color=Green"
    //    and "Banner_principal · Size=Md · Skeleton=True" match "· Skeleton=False"
    let stripped = name;
    for (const prop of ['Skeleton', 'Size', 'State']) {
      const before = stripped;
      stripped = stripped.replace(new RegExp(`·?\\s*${prop}=[^\\s·,]+`, 'gi'), '').trim();
      if (stripped === before) continue;  // prop wasn't present, skip
      const sn = normStr(stripped);
      found = this._catalog.find(c => normStr(c.name) === sn) ||
              this._catalog.find(c => normStr(c.name).includes(sn));
      if (found) return found;
    }

    return null;
  }
}

function normStr(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[_\-\s·>]/g, '')
    .replace(/[^a-z0-9=]/g, '');
}
