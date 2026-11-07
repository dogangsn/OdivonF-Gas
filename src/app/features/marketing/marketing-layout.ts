import { DOCUMENT } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { I18nStore } from '../../core/i18n/i18n';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

export const MARKETING_NAV = [
  { path: '/ozellikler', label: 'Özellikler' },
  { path: '/servis-firmalari', label: 'Servis firmaları' },
  { path: '/fiyatlar', label: 'Fiyatlar' },
  { path: '/araclar/co2-esdegeri-hesaplama', label: 'CO2e hesaplayıcı' },
] as const;

@Component({
  selector: 'app-marketing-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <a
      href="#icerik"
      class="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-indigo-700"
      >İçeriğe geç</a
    >
    <header
      class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-[#0b1120]/85"
    >
      <nav
        class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
        aria-label="Ana menü"
      >
        <a routerLink="/" class="flex items-center gap-2.5" aria-label="Odivon F-Gas ana sayfa">
          <span
            class="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25"
            ><span class="material-symbols-rounded text-[20px]" aria-hidden="true"
              >verified_user</span
            ></span
          >
          <span class="leading-tight">
            <strong class="block text-base font-black text-slate-900 dark:text-white"
              >Odivon</strong
            >
            <span class="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400"
              >F-Gas</span
            >
          </span>
        </a>
        <ul class="hidden items-center gap-1 lg:flex">
          @for (item of nav; track item.path) {
            <li>
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                class="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >{{ item.label }}</a
              >
            </li>
          }
        </ul>
        <div class="hidden items-center gap-2 lg:flex">
          <a routerLink="/login" class="odv-btn-ghost">Giriş yap</a>
          <a routerLink="/register" class="odv-btn-primary">Ücretsiz hesap aç</a>
        </div>
        <button
          type="button"
          class="odv-icon-btn lg:hidden"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="mobil-menu"
          (click)="menuOpen.set(!menuOpen())"
        >
          <span class="material-symbols-rounded" aria-hidden="true">{{
            menuOpen() ? 'close' : 'menu'
          }}</span>
          <span class="sr-only">Menüyü aç veya kapat</span>
        </button>
      </nav>
      @if (menuOpen()) {
        <div
          id="mobil-menu"
          class="border-t border-slate-200 px-4 pb-4 pt-2 lg:hidden dark:border-slate-800"
        >
          <ul class="space-y-1">
            @for (item of nav; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  (click)="menuOpen.set(false)"
                  class="block rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200"
                  >{{ item.label }}</a
                >
              </li>
            }
          </ul>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <a routerLink="/login" class="odv-btn-secondary justify-center">Giriş yap</a>
            <a routerLink="/register" class="odv-btn-primary justify-center">Hesap aç</a>
          </div>
        </div>
      }
    </header>

    <main id="icerik">
      <router-outlet />
    </main>

    <footer class="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b1120]">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div class="md:col-span-2">
          <strong class="text-lg font-black text-slate-900 dark:text-white">Odivon F-Gas</strong>
          <p class="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Soğutma, klima ve ısı pompası ekipmanları için F-Gas uyum ve saha operasyon platformu.
            Ekipman, sızıntı kontrolü, gaz hareketi ve denetim kayıtları tek panelde.
          </p>
        </div>
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500">Ürün</h2>
          <ul class="mt-3 space-y-2 text-sm">
            @for (item of nav; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  class="text-slate-600 hover:text-indigo-600 dark:text-slate-300"
                  >{{ item.label }}</a
                >
              </li>
            }
          </ul>
        </div>
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500">Kurumsal</h2>
          <ul class="mt-3 space-y-2 text-sm">
            <li>
              <a
                routerLink="/legal/privacy"
                class="text-slate-600 hover:text-indigo-600 dark:text-slate-300"
                >Gizlilik ve KVKK</a
              >
            </li>
            <li>
              <a
                routerLink="/legal/terms"
                class="text-slate-600 hover:text-indigo-600 dark:text-slate-300"
                >Kullanım koşulları</a
              >
            </li>
            <li>
              <a
                href="https://odivon.com"
                class="text-slate-600 hover:text-indigo-600 dark:text-slate-300"
                >Odivon</a
              >
            </li>
          </ul>
        </div>
      </div>
      <p
        class="border-t border-slate-100 py-5 text-center text-xs text-slate-400 dark:border-slate-800"
      >
        © 2026 Odivon. Tüm hakları saklıdır.
      </p>
    </footer>
  `,
})
export class MarketingLayout implements OnDestroy {
  readonly nav = MARKETING_NAV;
  readonly menuOpen = signal(false);
  private readonly i18n = inject(I18nStore);

  constructor() {
    // The public site is Turkish for now, whatever language the app uses.
    const root = inject(DOCUMENT).documentElement;
    root.lang = 'tr';
    root.dir = 'ltr';
    root.classList.remove('rtl');
  }

  ngOnDestroy() {
    this.i18n.applyDocument();
  }
}
