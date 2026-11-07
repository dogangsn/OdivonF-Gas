import { Component } from '@angular/core';
import { MarketingCta } from './marketing-cta';
import { MarketingFaq } from './marketing-faq';
import { SERVICE_FAQ } from './marketing-faq-content';

@Component({
  selector: 'app-marketing-service-companies',
  imports: [MarketingCta, MarketingFaq],
  template: `
    <section class="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6">
      <span class="text-xs font-bold uppercase tracking-wider text-indigo-600"
        >Klima ve soğutma servis firmaları</span
      >
      <h1
        class="mt-2 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white"
      >
        Servis firmaları için F-Gas takip programı
      </h1>
      <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
        Müşterilerinizin ekipman kayıtlarını, periyodik sızıntı kontrollerini ve gaz hareketlerini
        tek panelden yönetin. Denetim paketini müşterinize tek tıkla verin, servisinizi sözleşmeye
        bağlayın.
      </p>
    </section>

    <section class="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3">
      @for (item of benefits; track item.title) {
        <article class="odv-card p-6">
          <span
            class="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
            ><span class="material-symbols-rounded" aria-hidden="true">{{ item.icon }}</span></span
          >
          <h2 class="mt-4 text-lg font-black text-slate-900 dark:text-white">{{ item.title }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ item.body }}</p>
        </article>
      }
    </section>

    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
        Nasıl çalışır?
      </h2>
      <ol class="mt-8 grid gap-5 md:grid-cols-4">
        @for (step of steps; track step.title; let i = $index) {
          <li class="odv-card p-6">
            <span
              class="grid size-9 place-items-center rounded-full bg-indigo-600 text-sm font-black text-white"
              >{{ i + 1 }}</span
            >
            <h3 class="mt-4 text-base font-black text-slate-900 dark:text-white">
              {{ step.title }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {{ step.body }}
            </p>
          </li>
        }
      </ol>
    </section>

    <app-marketing-faq [items]="faq" />
    <app-marketing-cta
      title="Müşterilerinize denetime hazır servis sunun"
      body="14 gün boyunca tüm özellikleri ücretsiz kullanın. Ekibinizi davet edin, ilk müşterinizin ekipmanlarını bugün kaydedin."
    />
  `,
})
export class ServiceCompaniesPage {
  readonly faq = SERVICE_FAQ;
  readonly benefits = [
    {
      icon: 'groups',
      title: 'Müşteri bazında düzen',
      body: 'Her müşterinin lokasyonları, ekipmanları ve servis geçmişi ayrı. Kim, neyi, ne zaman yaptı belli.',
    },
    {
      icon: 'notifications_active',
      title: 'Kontrol tarihi kaçmaz',
      body: 'Yasal periyoda göre yaklaşan ve geciken kontrol listesi. Ekibinizin haftalık iş planı hazır.',
    },
    {
      icon: 'workspace_premium',
      title: 'Hizmetinize değer katın',
      body: 'Müşterinize F-Gas denetim paketi verin. Rapor, bakım sözleşmesini yenilemenin en güçlü gerekçesi olur.',
    },
  ] as const;
  readonly steps = [
    {
      title: 'Hesap açın',
      body: 'Firmanızı kaydedin, teknisyenlerinizi rolleriyle davet edin.',
    },
    {
      title: 'Ekipmanları girin',
      body: 'Gaz türü ve kg girin; CO2e ve kontrol periyodu otomatik hesaplanır.',
    },
    {
      title: 'Sahada kaydedin',
      body: 'Kontrol sonucunu, gaz hareketini ve kanıtı telefondan girin.',
    },
    {
      title: 'Raporu verin',
      body: 'Müşteri bazlı denetim paketini dışa aktarın ve paylaşın.',
    },
  ] as const;
}
