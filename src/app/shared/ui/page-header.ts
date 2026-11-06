import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex min-w-0 items-start gap-4">
        <span
          class="hidden size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 sm:grid"
        >
          <span class="material-symbols-rounded" aria-hidden="true">{{ icon() }}</span>
        </span>
        <div class="min-w-0">
          @if (eyebrow()) {
            <p
              class="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[.14em] text-indigo-600 dark:text-indigo-400"
            >
              {{ eyebrow() }}
            </p>
          }
          <h1
            class="m-0 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-[28px] sm:leading-9"
          >
            {{ title() }}
          </h1>
          @if (description()) {
            <p
              class="mb-0 mt-1.5 max-w-[72ch] text-sm leading-6 text-slate-500 dark:text-slate-400"
            >
              {{ description() }}
            </p>
          }
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:shrink-0">
        <ng-content select="[actions]" />
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly eyebrow = input('');
  readonly icon = input('dashboard');
  readonly title = input.required<string>();
  readonly description = input('');
}
