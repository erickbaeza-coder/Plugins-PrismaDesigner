// ============================================================
// Component Resolver — Match inteligente de componentes Prisma
// ============================================================

// Mapa de keywords → componente Prisma preferido
const KEYWORD_MAP = [
  { keywords: ['header', 'encabezado', 'navbar top', 'top navigation', 'home header'], component: 'Nav Bar > Header · Color=White · Type=Home · State=Default', score: 90 },
  { keywords: ['topbar', 'top bar', 'atrás', 'back', 'flecha volver', 'no title'], component: 'Top bar > TopBar · State=Default · Type=Icon action_no title', score: 90 },
  { keywords: ['topbar title', 'top bar título', 'título arriba', 'title bar'], component: 'Top bar > TopBar_title · Type=Default', score: 90 },
  { keywords: ['search', 'búsqueda', 'buscar', 'buscador', 'search bar'], component: 'Nav Bar > Search_header · State=Default', score: 88 },
  { keywords: ['nav inferior', 'bottom nav', 'bottom navigation', 'tabs inferiores', 'footer navigation', 'menu inferior'], component: 'Nav Bar > NavBar · Color=Color · Type=Home · State=Default', score: 92 },
  { keywords: ['banner hero', 'hero banner', 'imagen principal', 'banner grande', 'hero image', 'full banner'], component: 'Banners Cards > Banner_principal · Size=Lg · Skeleton=False', score: 88 },
  { keywords: ['banner mediano', 'banner md', 'promo banner medium'], component: 'Banners Cards > Banner_principal · Size=Md · Skeleton=False', score: 85 },
  { keywords: ['banner pequeño', 'banner sm', 'small banner'], component: 'Banners Cards > Banner_principal · Size=Sm · Skeleton=False', score: 83 },
  { keywords: ['thumbnail', 'imagen pequeña', 'banner carrusel', 'carrusel imagen', 'event image'], component: 'Banners Cards > _Banners terciarios (Carruseles) · Size=Md · Skeleton=False', score: 82 },
  { keywords: ['hero slider', 'hero carousel', 'slider principal', 'full hero'], component: 'Carrusels > Hero_banner · State=Default', score: 85 },
  { keywords: ['categorías', 'categories carousel', 'category chips', 'filtros categoría'], component: 'Categorys > Category-carousel · State=Default', score: 85 },
  { keywords: ['título sección', 'section title', 'section header', 'heading sección', 'ver más', 'title cta'], component: 'Title_section > Title_section · Skeleton=No · CTA=Yes', score: 85 },
  { keywords: ['título', 'title', 'heading', 'sección', 'section'], component: 'Title_section > Title_section · Skeleton=No · CTA=No', score: 80 },
  { keywords: ['botón primario', 'primary button', 'cta principal', 'botón grande', 'button lg'], component: 'Buttons > Button-Primary · Size=Lg · State=Default', score: 90 },
  { keywords: ['botón secundario', 'secondary button', 'cta secundario'], component: 'Buttons > Button-Secondary · Size=Md · State=Default', score: 85 },
  { keywords: ['botón terciario', 'tertiary button', 'ghost button', 'link button', 'texto botón'], component: 'Buttons > Button-Tertiary · Size=Md · State=Default', score: 83 },
  { keywords: ['sticky cta', 'sticky button', 'botón fijo', 'fixed button', 'agregar carrito', 'comprar', 'add to cart'], component: 'Sticky Button > Sticky-button · Type=Horizontal', score: 92 },
  { keywords: ['tarjeta producto', 'product card', 'product grid', 'card producto'], component: 'Product Card > Product_card · Size=Md · State=Default', score: 88 },
  { keywords: ['producto lista', 'product list', 'card list', 'horizontal card'], component: 'Product Card > Product card_list · State=Default', score: 85 },
  { keywords: ['detalle producto', 'product detail', 'pdp', 'product page detail'], component: 'ProductCard_Details > ProductCard_Detail · Size=Md · State=Default', score: 85 },
  { keywords: ['badge verde', 'tag green', 'members', 'miembros', 'exclusive', 'exclusivo'], component: 'Tags > Tag · Color=Green', score: 85 },
  { keywords: ['badge naranja', 'tag orange', 'oferta', 'promo tag', 'descuento tag'], component: 'Tags > Tag · Color=Orange', score: 83 },
  { keywords: ['badge rojo', 'tag red', 'urgente', 'hot', 'agotándose'], component: 'Tags > Tag · Color=Red', score: 83 },
  { keywords: ['badge azul', 'tag blue', 'nuevo', 'new', 'destacado'], component: 'Tags > Tag · Color=Blue', score: 83 },
  { keywords: ['badge neutral', 'tag gray', 'tag gris', 'neutral badge'], component: 'Tags > Tag · Color=Neutral', score: 80 },
  { keywords: ['chip filtro', 'filter chip', 'chip selección', 'toggle chip'], component: 'Chips > pds-chip · State=Default', score: 82 },
  { keywords: ['input', 'campo texto', 'text field', 'formulario', 'campo formulario'], component: 'Inputs > Input · State=Default', score: 85 },
  { keywords: ['select', 'dropdown', 'lista selección', 'checkbox list'], component: 'Select list > Select_list · Type=Check', score: 83 },
  { keywords: ['delivery', 'domicilio', 'dirección entrega', 'location delivery', 'recibe'], component: 'Location > location · Type=Recibe', score: 85 },
  { keywords: ['pickup', 'retiro tienda', 'retira', 'store pickup'], component: 'Location > location · Type=Retira', score: 85 },
  { keywords: ['fila info', 'info row', 'metadata row', 'location brand', 'detalle fila'], component: 'Location > location · Type=Brand', score: 82 },
  { keywords: ['cantidad', 'quantity', 'selector cantidad', 'counter', 'más menos'], component: 'Quantity selector > Quantity Selector · Size=Md · State=Default', score: 88 },
  { keywords: ['bottom sheet', 'drawer', 'panel inferior', 'modal inferior', 'sheet'], component: 'Bottom sheet > Bottom_Sheet · State=Collapsed', score: 88 },
  { keywords: ['total', 'totalizer', 'resumen precio', 'precio total', 'checkout total'], component: 'Totalizer > Totalizer · State=Default', score: 88 },
  { keywords: ['alert info', 'información alerta', 'aviso', 'info message'], component: 'Alerts > Alert · Type=Info · Border=False', score: 82 },
  { keywords: ['alert error', 'error message', 'warning alerta'], component: 'Alerts > Alert · Type=Error · Border=False', score: 82 },
  { keywords: ['snackbar', 'toast', 'notificación', 'confirmación exitosa', 'success notification'], component: 'Snackbar > Snackbar · Type=Success', score: 85 },
  { keywords: ['dialog', 'modal', 'popup', 'confirmación modal', 'alert dialog'], component: 'Dialog > Dialog · State=Default', score: 85 },
  { keywords: ['empty state', 'vacío', 'sin resultados', 'no hay datos', 'sin contenido'], component: 'Empty States > Empty state · Type=Empty', score: 90 },
  { keywords: ['membresía gate', 'soft gate', 'members only', 'unirse', 'register gate', 'conversion cta', 'únete'], component: 'Information Card > InformationCard · State=Brand · Skeleton=False', score: 92 },
  { keywords: ['information card', 'info card', 'tarjeta info', 'información neutral'], component: 'Information Card > InformationCard · State=Default · Skeleton=False', score: 82 },
  { keywords: ['promo arrow', 'promo card flecha', 'promo link', 'cupón link'], component: 'Promo Card > Promo_card · State=Default · Type=Arrow', score: 83 },
  { keywords: ['promo button', 'promo card botón', 'reward card', 'canjear', 'claim coupon'], component: 'Promo Card > Promo_card · State=Default · Type=Button', score: 83 },
  { keywords: ['loyalty card', 'nivel', 'membership card', 'tier card', 'plus'], component: 'LevelsCards > CardNivele · Type=Plus', score: 80 },
  { keywords: ['payment', 'pago', 'visa', 'tarjeta crédito', 'método pago'], component: 'Payments > Payment · Type=VISA', score: 82 },
];

// Keywords de tipo de pantalla para inferir patrón
const SCREEN_TYPE_KEYWORDS = {
  home: ['home', 'inicio', 'main', 'principal', 'dashboard'],
  feed: ['feed', 'lista', 'list', 'listado', 'catálogo', 'events feed', 'explorar'],
  detail: ['detalle', 'detail', 'profile', 'perfil', 'info página', 'event detail'],
  gate: ['gate', 'members only', 'membresía', 'soft gate', 'unlock', 'exclusive'],
  empty: ['empty', 'vacío', 'sin resultados', 'no hay', 'carga']
};

export class ComponentResolver {
  constructor(catalog) {
    this.catalog = catalog;
  }

  /** Encuentra componentes Prisma que coinciden con una descripción */
  findByDescription(description) {
    const desc = description.toLowerCase();
    const matches = [];

    for (const entry of KEYWORD_MAP) {
      const matched = entry.keywords.some(kw => desc.includes(kw.toLowerCase()));
      if (matched) {
        matches.push({
          name: entry.component,
          group: entry.component.split(' > ')[0],
          score: entry.score
        });
      }
    }

    // También buscar en el catálogo por tags
    const catalogMatches = this.catalog.list(description.split(' ')[0]);
    for (const cm of catalogMatches) {
      if (!matches.find(m => m.name === cm.name)) {
        matches.push({ name: cm.name, group: cm.group, score: 65 });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  /** Infiere los componentes de una pantalla a partir de su prompt de texto */
  inferFromPrompt(prompt) {
    if (!prompt) return this._defaultComponents();

    const p = prompt.toLowerCase();

    // Detectar tipo de pantalla
    const screenType = this._detectScreenType(p);

    // Componentes base por tipo
    const baseComponents = this._getBaseComponentsForType(screenType);

    // Enriquecer con componentes mencionados en el prompt
    const extra = this._extractFromPromptText(p, baseComponents);

    return [...baseComponents, ...extra].map((c, i) => ({
      orden: i + 1,
      ...c,
      sizing: c.sizing || { horizontal: 'fill', vertical: 'hug' }
    }));
  }

  _detectScreenType(prompt) {
    for (const [type, keywords] of Object.entries(SCREEN_TYPE_KEYWORDS)) {
      if (keywords.some(kw => prompt.includes(kw))) return type;
    }
    return 'detail'; // default
  }

  _getBaseComponentsForType(type) {
    const patterns = {
      home: [
        { componente: 'Nav Bar > Header · Color=White · Type=Home · State=Default', rol: 'header principal' },
        { componente: 'Carrusels > Hero_banner · State=Default', rol: 'hero banner' },
        { componente: 'Categorys > Category-carousel · State=Default', rol: 'categorías' },
        { componente: 'Nav Bar > NavBar · Color=Color · Type=Home · State=Default', rol: 'nav inferior' }
      ],
      feed: [
        { componente: 'Top bar > TopBar_title · Type=Default', rol: 'navegación' },
        { componente: 'Title_section > Title_section · Skeleton=No · CTA=No', rol: 'encabezado sección' },
        { tipo: 'composicion', nombre_intencional: 'ItemCard', rol: 'tarjeta de ítem', composicion: this._buildItemCardComposition() },
        { componente: 'Nav Bar > NavBar · Color=Color · Type=Home · State=Default', rol: 'nav inferior' }
      ],
      detail: [
        { componente: 'Top bar > TopBar · State=Default · Type=Icon action_no title', rol: 'back navigation' },
        { componente: 'Banners Cards > Banner_principal · Size=Lg · Skeleton=False', rol: 'imagen hero' },
        { componente: 'Title_section > Title_section · Skeleton=No · CTA=No', rol: 'título y descripción' },
        { componente: 'Sticky Button > Sticky-button · Type=Horizontal', rol: 'CTA principal' }
      ],
      gate: [
        { componente: 'Top bar > TopBar · State=Default · Type=Icon action_no title', rol: 'back' },
        { componente: 'Banners Cards > Banner_principal · Size=Lg · Skeleton=False', rol: 'imagen hero' },
        { componente: 'Title_section > Title_section · Skeleton=No · CTA=No', rol: 'título' },
        { componente: 'Information Card > InformationCard · State=Brand · Skeleton=False', rol: 'gate de membresía' },
        { componente: 'Nav Bar > NavBar · Color=Color · Type=Home · State=Default', rol: 'nav inferior' }
      ],
      empty: [
        { componente: 'Top bar > TopBar_title · Type=Default', rol: 'navegación' },
        { componente: 'Empty States > Empty state · Type=Empty', rol: 'estado vacío' },
        { componente: 'Nav Bar > NavBar · Color=Color · Type=Home · State=Default', rol: 'nav inferior' }
      ]
    };

    return (patterns[type] || patterns.detail).map(c => ({ ...c }));
  }

  _extractFromPromptText(prompt, baseComponents) {
    const extra = [];
    const existingRoles = baseComponents.map(c => c.rol || '');

    // Buscar menciones adicionales
    if (prompt.includes('search') || prompt.includes('búsqueda') && !existingRoles.includes('búsqueda')) {
      extra.push({ componente: 'Nav Bar > Search_header · State=Default', rol: 'búsqueda' });
    }
    if ((prompt.includes('tag') || prompt.includes('badge') || prompt.includes('categoría')) && !existingRoles.includes('badge de categoría')) {
      extra.push({ componente: 'Tags > Tag · Color=Green', rol: 'badge de categoría' });
    }
    if (prompt.includes('alerta') || prompt.includes('aviso') || prompt.includes('alert')) {
      extra.push({ componente: 'Alerts > Alert · Type=Info · Border=False', rol: 'alerta informativa' });
    }

    return extra;
  }

  _buildItemCardComposition() {
    return [
      {
        componente: 'Banners Cards > _Banners terciarios (Carruseles) · Size=Md · Skeleton=False',
        rol: 'imagen del ítem',
        sizing: { horizontal: 'fill', vertical: 'hug' }
      },
      {
        componente: 'Tags > Tag · Color=Green',
        rol: 'badge de categoría',
        sizing: { horizontal: 'hug', vertical: 'hug' },
        textOverrides: { Label: 'Categoría' }
      },
      {
        componente: 'Title_section > Title_section · Skeleton=No · CTA=No',
        rol: 'título y metadata',
        sizing: { horizontal: 'fill', vertical: 'hug' }
      }
    ];
  }

  _defaultComponents() {
    return [
      { componente: 'Top bar > TopBar_title · Type=Default', rol: 'navegación' },
      { componente: 'Title_section > Title_section · Skeleton=No · CTA=No', rol: 'contenido' },
      { componente: 'Nav Bar > NavBar · Color=Color · Type=Home · State=Default', rol: 'nav inferior' }
    ];
  }

  /** Genera spec completa para un componente local nuevo */
  createLocalComponentSpec(name, description, platform = 'iOS', brand = 'Jumbo') {
    const desc = description.toLowerCase();

    // Inferir sub-componentes de la descripción
    const subComponents = this._inferSubComponents(desc);

    const composicion = {
      tipo: 'composicion',
      nombre_intencional: name,
      rol: description,
      layout: { direction: 'vertical', gap: 8, padding: { top: 0, right: 0, bottom: 12, left: 0 } },
      sizing: { horizontal: 'fill', vertical: 'hug' },
      composicion: subComponents
    };

    const figmaMakePrompt = this._buildFigmaMakePrompt(name, description, subComponents, platform, brand);

    return { composicion, figmaMakePrompt };
  }

  _inferSubComponents(desc) {
    const subs = [];

    if (desc.includes('imagen') || desc.includes('image') || desc.includes('foto') || desc.includes('photo')) {
      subs.push({
        componente: 'Banners Cards > _Banners terciarios (Carruseles) · Size=Md · Skeleton=False',
        rol: 'imagen del componente',
        sizing: { horizontal: 'fill', vertical: 'hug' }
      });
    }
    if (desc.includes('título') || desc.includes('title') || desc.includes('nombre') || desc.includes('name')) {
      subs.push({
        componente: 'Title_section > Title_section · Skeleton=No · CTA=No',
        rol: 'título y subtítulo',
        sizing: { horizontal: 'fill', vertical: 'hug' }
      });
    }
    if (desc.includes('tag') || desc.includes('badge') || desc.includes('etiqueta') || desc.includes('categoría')) {
      subs.push({
        componente: 'Tags > Tag · Color=Green',
        rol: 'badge de categoría',
        sizing: { horizontal: 'hug', vertical: 'hug' }
      });
    }
    if (desc.includes('botón') || desc.includes('button') || desc.includes('cta') || desc.includes('acción')) {
      subs.push({
        componente: 'Buttons > Button-Primary · Size=Lg · State=Default',
        rol: 'acción principal',
        sizing: { horizontal: 'fill', vertical: 'hug' }
      });
    }
    if (desc.includes('fecha') || desc.includes('date') || desc.includes('hora') || desc.includes('time') || desc.includes('lugar') || desc.includes('location')) {
      subs.push({
        componente: 'Location > location · Type=Brand',
        rol: 'metadata (fecha/hora/lugar)',
        sizing: { horizontal: 'fill', vertical: 'hug' }
      });
    }

    // Fallback: composición genérica
    if (subs.length === 0) {
      subs.push(
        { componente: 'Banners Cards > _Banners terciarios (Carruseles) · Size=Md · Skeleton=False', rol: 'imagen', sizing: { horizontal: 'fill', vertical: 'hug' } },
        { componente: 'Title_section > Title_section · Skeleton=No · CTA=No', rol: 'información', sizing: { horizontal: 'fill', vertical: 'hug' } }
      );
    }

    return subs;
  }

  _buildFigmaMakePrompt(name, description, subComponents, platform, brand) {
    const structure = subComponents.map((s, i) => {
      const compName = s.componente ? s.componente.split(' > ').pop().split(' · ')[0] : 'Frame';
      return `${i + 1}. ${compName} — ${s.rol}`;
    }).join('\n');

    return [
      `══════════════════════════════════════════════════`,
      `⚠️ COMPONENTE NUEVO — ${name}`,
      `No existe en Prisma-Components · Crear como componente local`,
      `══════════════════════════════════════════════════`,
      ``,
      `Diseña un componente llamado "${name}" para ${brand}.`,
      ``,
      `ROL EN LA PANTALLA: ${description}`,
      ``,
      `ESTRUCTURA (de arriba a abajo):`,
      structure,
      ``,
      `ESTADO A DISEÑAR: Default`,
      `PLATAFORMA: ${platform}`,
      `LIBRERÍA DE REFERENCIA: Prisma-Components (para mantener consistencia visual)`,
      ``,
      `IMPORTANTE:`,
      `- Guardarlo como componente local en el archivo de trabajo (no en la librería)`,
      `- Nombrarlo exactamente "${name}" para facilitar la integración futura`,
      `- Cuando el componente sea aprobado, publicarlo en Prisma-Components`
    ].join('\n');
  }
}
