import { Routes } from '@angular/router';
import { SOFTWARE_LD, SeoPage, breadcrumbLd, faqLd } from '../../core/seo/seo';
import { CALCULATOR_FAQ, HOME_FAQ, PRICING_FAQ, SERVICE_FAQ } from './marketing-faq-content';

/** Public, indexable pages. Each is prerendered to static HTML (see app.routes.server.ts). */
export const MARKETING_PATHS = [
  '',
  'ozellikler',
  'fiyatlar',
  'servis-firmalari',
  'araclar/co2-esdegeri-hesaplama',
] as const;

const crumb = (name: string, path: string) =>
  breadcrumbLd([
    { name: 'Ana sayfa', path: '/' },
    { name, path },
  ]);

export const MARKETING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./marketing-layout').then((m) => m.MarketingLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./home-page').then((m) => m.HomePage),
        data: {
          seo: {
            title: 'F-Gas Takip Yazılımı | Sızıntı Kontrolü ve Denetim – Odivon',
            description:
              'Ekipman, gaz yükü, sızıntı kontrolleri ve teknisyen kayıtlarını tek panelde yönetin. CO2e ve kontrol periyodu otomatik. 14 gün ücretsiz deneyin.',
            path: '/',
            jsonLd: [SOFTWARE_LD, faqLd(HOME_FAQ)],
          } satisfies SeoPage,
        },
      },
      {
        path: 'ozellikler',
        loadComponent: () => import('./features-page').then((m) => m.FeaturesPage),
        data: {
          seo: {
            title: 'F-Gas Uyum Özellikleri: Envanter, Kontrol, Gaz Defteri',
            description:
              'Ekipman envanteri, otomatik CO2e ve kontrol takvimi, gaz hareket defteri, teknisyen sertifikaları ve değişmez denetim izi.',
            path: '/ozellikler',
            jsonLd: [crumb('Özellikler', '/ozellikler')],
          } satisfies SeoPage,
        },
      },
      {
        path: 'fiyatlar',
        loadComponent: () => import('./pricing-page').then((m) => m.PricingPage),
        data: {
          seo: {
            title: 'F-Gas Yazılımı Fiyatları | Starter, Pro, Enterprise',
            description:
              '100 ekipmandan sınırsıza kadar F-Gas takip planları. Aylık veya yıllık ödeme, kurulum ücreti yok, 14 gün ücretsiz deneme.',
            path: '/fiyatlar',
            jsonLd: [crumb('Fiyatlar', '/fiyatlar'), faqLd(PRICING_FAQ)],
          } satisfies SeoPage,
        },
      },
      {
        path: 'servis-firmalari',
        loadComponent: () => import('./service-companies-page').then((m) => m.ServiceCompaniesPage),
        data: {
          seo: {
            title: 'Klima ve Soğutma Servis Firmaları için F-Gas Takibi',
            description:
              'Müşteri bazında ekipman ve servis kayıtları, sahadan kontrol sonucu, müşteriye tek tıkla denetim paketi.',
            path: '/servis-firmalari',
            jsonLd: [crumb('Servis firmaları', '/servis-firmalari'), faqLd(SERVICE_FAQ)],
          } satisfies SeoPage,
        },
      },
      {
        path: 'araclar/co2-esdegeri-hesaplama',
        loadComponent: () => import('./co2-calculator-page').then((m) => m.Co2CalculatorPage),
        data: {
          seo: {
            title: 'CO2 Eşdeğeri Hesaplama (F-Gas) – Ücretsiz Araç',
            description:
              'Gaz türünü ve kg miktarını girin; ton CO2e ve yasal sızıntı kontrol periyodunu anında görün. R-410A, R-32, R-404A GWP tablosu.',
            path: '/araclar/co2-esdegeri-hesaplama',
            jsonLd: [
              crumb('CO2e hesaplayıcı', '/araclar/co2-esdegeri-hesaplama'),
              faqLd(CALCULATOR_FAQ),
            ],
          } satisfies SeoPage,
        },
      },
    ],
  },
];
