import { RenderMode, ServerRoute } from '@angular/ssr';
import { MARKETING_PATHS } from './features/marketing/marketing.routes';

/**
 * Only the public site is prerendered to static HTML for search engines.
 * The signed-in app stays a client-rendered SPA (served from index.csr.html).
 */
export const serverRoutes: ServerRoute[] = [
  ...MARKETING_PATHS.map((path) => ({ path, renderMode: RenderMode.Prerender as const })),
  { path: 'legal/terms', renderMode: RenderMode.Prerender },
  { path: 'legal/privacy', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
