import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export const SITE_URL = 'https://fgas.odivon.com';
export const SITE_NAME = 'Odivon F-Gas';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

/** SEO data for a public page, set on the route as `data.seo`. */
export interface SeoPage {
  readonly title: string;
  readonly description: string;
  /** Path starting with `/`, used for the canonical URL. */
  readonly path: string;
  readonly jsonLd?: readonly Record<string, unknown>[];
}

/**
 * Applies title, description, canonical, Open Graph and JSON-LD on every
 * navigation. Routes without `data.seo` (the signed-in app, auth screens) are
 * marked noindex so only the public site is indexed.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  start() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.apply(this.deepestSeo(this.router.routerState.snapshot.root)));
  }

  apply(page: SeoPage | null) {
    if (!page) {
      this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow,noarchive' });
      this.setCanonical(null);
      this.setJsonLd([]);
      return;
    }
    const url = `${SITE_URL}${page.path === '/' ? '/' : page.path}`;
    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ name: 'robots', content: 'index,follow,max-image-preview:large' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:locale', content: 'tr_TR' });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: DEFAULT_IMAGE });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    this.meta.updateTag({ name: 'twitter:image', content: DEFAULT_IMAGE });
    this.setCanonical(url);
    this.setJsonLd([ORGANIZATION_LD, ...(page.jsonLd ?? [])]);
  }

  private deepestSeo(route: ActivatedRouteSnapshot): SeoPage | null {
    let current: ActivatedRouteSnapshot | null = route;
    let seo: SeoPage | null = null;
    while (current) {
      seo = (current.data['seo'] as SeoPage | undefined) ?? seo;
      current = current.firstChild;
    }
    return seo;
  }

  private setCanonical(url: string | null) {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(items: readonly Record<string, unknown>[]) {
    const head = this.document.head;
    head.querySelectorAll('script[data-seo="ld"]').forEach((node) => node.remove());
    for (const item of items) {
      const script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo', 'ld');
      script.textContent = JSON.stringify({ '@context': 'https://schema.org', ...item });
      head.appendChild(script);
    }
  }
}

const ORGANIZATION_LD = {
  '@type': 'Organization',
  name: 'Odivon',
  url: 'https://odivon.com',
  logo: `${SITE_URL}/favicon.ico`,
};

export const SOFTWARE_LD = {
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  inLanguage: ['tr', 'en', 'de', 'fr', 'es', 'it', 'nl', 'ar'],
  description:
    'F-Gas ekipman envanteri, sızıntı kontrol takvimi, gaz hareket defteri ve denetime hazır raporlama.',
  offers: { '@type': 'AggregateOffer', priceCurrency: 'TRY', offerCount: 3 },
};

export function faqLd(items: readonly { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function breadcrumbLd(items: readonly { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
