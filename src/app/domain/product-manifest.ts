export interface ProductMetric {
  readonly labelKey: string;
  readonly value: string;
  readonly noteKey: string;
  readonly tone: 'primary' | 'positive' | 'warning' | 'info';
}
export interface ProductModule {
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly icon: string;
  readonly phase: 1 | 2 | 3;
}
export interface ProductManifest {
  readonly key: string;
  readonly name: string;
  readonly categoryKey: string;
  readonly taglineKey: string;
  readonly promiseKey: string;
  readonly apiNamespace: string;
  readonly accent: string;
  readonly metrics: readonly ProductMetric[];
  readonly modules: readonly ProductModule[];
}
export const PRODUCT: ProductManifest = {
  key: 'fgas',
  name: 'OdivonF-Gas',
  categoryKey: 'product.category',
  taglineKey: 'product.tagline',
  promiseKey: 'product.promise',
  apiNamespace: '/api/v1/fgas',
  accent: '#35d49a',
  metrics: [],
  modules: [
    { nameKey: 'module.one', descriptionKey: 'module.oneDesc', icon: 'inventory_2', phase: 1 },
    { nameKey: 'module.two', descriptionKey: 'module.twoDesc', icon: 'event_upcoming', phase: 1 },
    { nameKey: 'module.three', descriptionKey: 'module.threeDesc', icon: 'swap_horiz', phase: 2 },
    { nameKey: 'module.four', descriptionKey: 'module.fourDesc', icon: 'verified_user', phase: 3 },
  ],
};
