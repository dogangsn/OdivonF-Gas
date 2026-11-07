import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-marketing-cta',
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-800 to-slate-950 p-8 text-white sm:p-12"
      >
        <div
          class="pointer-events-none absolute -end-16 -top-16 size-72 rounded-full bg-fuchsia-400/20 blur-3xl"
          aria-hidden="true"
        ></div>
        <div class="relative max-w-2xl">
          <h2 class="text-3xl font-black tracking-tight sm:text-4xl">{{ title() }}</h2>
          <p class="mt-3 text-base leading-7 text-indigo-100">{{ body() }}</p>
          <div class="mt-7 flex flex-wrap gap-3">
            <a
              routerLink="/register"
              class="inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-black text-indigo-700 shadow-lg transition hover:scale-[1.02]"
              >14 gün ücretsiz deneyin</a
            >
            <a
              routerLink="/fiyatlar"
              class="inline-flex items-center rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
              >Fiyatları görün</a
            >
          </div>
        </div>
      </div>
    </section>
  `,
})
export class MarketingCta {
  readonly title = input('F-Gas uyumunu bugün düzene sokun');
  readonly body = input(
    'Ekipmanlarınızı içe aktarın, kontrol takviminiz dakikalar içinde hazır olsun. Kredi kartı gerekmez.',
  );
}
