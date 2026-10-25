import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VersionStore } from './core/version/version-store';
import { I18nStore, TranslatePipe } from './core/i18n/i18n';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe],
  template: `
    <router-outlet />
    @if (version.updateRequired()) {
      <div
        class="fixed inset-0 z-[90] grid place-items-center bg-slate-950/70 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-title"
      >
        <section class="odv-card max-w-md p-7 text-center">
          <span class="material-symbols-rounded mb-3 text-5xl text-violet-600">system_update</span>
          <h2 id="update-title" class="text-xl font-black">{{ 'update.title' | t }}</h2>
          <p class="text-sm text-slate-500">{{ 'update.body' | t }}</p>
          <button type="button" class="odv-btn-primary mt-3 w-full" (click)="version.applyUpdate()">
            {{ 'update.action' | t }}
          </button>
        </section>
      </div>
    }
  `,
})
export class App {
  readonly version = inject(VersionStore);
  constructor() {
    inject(I18nStore);
    this.version.start();
  }
}
