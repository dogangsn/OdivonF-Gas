import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-marketing-cta',
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div class="relative overflow-hidden rounded-2xl bg-brand-900 p-8 text-white sm:p-12">
        <div class="relative max-w-2xl">
          <h2 class="text-3xl font-black tracking-tight sm:text-4xl">{{ title() }}</h2>
          <p class="mt-3 text-base leading-7 text-brand-100">{{ body() }}</p>
          <div class="mt-7 flex flex-wrap gap-3">
            <a
              routerLink="/register"
              class="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-black text-brand-800 hover:bg-brand-50"
              >14 gün ücretsiz deneyin</a
            >
            <a
              [href]="demoMail"
              class="inline-flex items-center rounded-lg border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
              >Demo isteyin</a
            >
            <a
              routerLink="/fiyatlar"
              class="inline-flex items-center px-2 py-3 text-sm font-bold text-brand-100 underline-offset-4 hover:underline"
              >Fiyatları görün</a
            >
          </div>
        </div>
      </div>
    </section>
  `,
})
export class MarketingCta {
  readonly demoMail =
    'mailto:destek@odivon.com?subject=' + encodeURIComponent('Odivon F-Gas demo talebi');
  readonly title = input('F-Gas uyumunu bugün düzene sokun');
  readonly body = input(
    'İlk ekipmanınızı ekleyin, kontrol takviminiz dakikalar içinde hazır olsun. Kredi kartı gerekmez.',
  );
}
