import { Component, input } from '@angular/core';

@Component({
  selector: 'app-marketing-faq',
  template: `
    <section class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h2
        class="text-center text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white"
      >
        Sık sorulan sorular
      </h2>
      <div class="mt-10 space-y-3">
        @for (item of items(); track item.q) {
          <details class="odv-card group p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-slate-900 dark:text-white"
            >
              <h3 class="m-0 text-base font-bold">{{ item.q }}</h3>
              <span
                class="material-symbols-rounded shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                aria-hidden="true"
                >expand_more</span
              >
            </summary>
            <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ item.a }}</p>
          </details>
        }
      </div>
    </section>
  `,
})
export class MarketingFaq {
  readonly items = input.required<readonly { q: string; a: string }[]>();
}
