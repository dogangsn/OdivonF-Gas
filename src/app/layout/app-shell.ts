import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../core/auth/auth-store';
import { I18nStore, SupportedLang, TranslatePipe } from '../core/i18n/i18n';
import { PRODUCT_NAVIGATION } from '../domain/domain-navigation';
import { PRODUCT } from '../domain/product-manifest';

interface MenuItem {
  readonly path: string;
  readonly icon: string;
  readonly labelKey: string;
}
interface MenuGroup {
  readonly label: string;
  readonly items: readonly MenuItem[];
}

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe],
  template: `
    <div class="min-h-screen text-slate-900 dark:text-slate-100">
      <a
        href="#main"
        class="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[80] odv-btn-primary"
        >İçeriğe geç</a
      >
      @if (mobileOpen()) {
        <button
          type="button"
          class="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          aria-label="Menüyü kapat"
          (click)="mobileOpen.set(false)"
        ></button>
      }
      <aside
        class="fixed inset-y-0 start-0 z-40 flex w-[17rem] flex-col border-e border-slate-200/80 bg-white/95 backdrop-blur transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950/95 lg:translate-x-0"
        [class.-translate-x-full]="!mobileOpen() && i18n.active().dir === 'ltr'"
        [class.translate-x-full]="!mobileOpen() && i18n.active().dir === 'rtl'"
      >
        <div class="flex h-16 items-center justify-between px-5">
          <a routerLink="/overview" class="flex items-center gap-3" (click)="mobileOpen.set(false)">
            <span
              class="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25"
            >
              <span class="material-symbols-rounded !text-[20px]" aria-hidden="true">ac_unit</span>
            </span>
            <span class="leading-tight">
              <strong class="block text-[15px] font-black tracking-tight">Odivon</strong>
              <span class="block text-[11px] font-semibold text-slate-500 dark:text-slate-400"
                >F-Gas Uyum</span
              >
            </span>
          </a>
          <button
            type="button"
            class="odv-icon-btn lg:hidden"
            (click)="mobileOpen.set(false)"
            aria-label="Menüyü kapat"
          >
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <nav aria-label="Ana menü" class="custom-scroll flex-1 overflow-y-auto px-3 pb-4 pt-2">
          @for (group of menu(); track group.label) {
            <div class="mb-5">
              <p
                class="mb-1.5 px-3 text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400 dark:text-slate-500"
              >
                {{ group.label }}
              </p>
              <ul class="space-y-0.5">
                @for (item of group.items; track item.path) {
                  <li>
                    <a
                      [routerLink]="item.path"
                      routerLinkActive
                      #rla="routerLinkActive"
                      [attr.aria-current]="rla.isActive ? 'page' : null"
                      class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 aria-[current=page]:bg-indigo-50 aria-[current=page]:text-indigo-700 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white dark:aria-[current=page]:bg-indigo-500/10 dark:aria-[current=page]:text-indigo-300"
                      (click)="mobileOpen.set(false)"
                    >
                      @if (rla.isActive) {
                        <span
                          class="absolute inset-y-2 start-0 w-1 rounded-e-full bg-indigo-500"
                          aria-hidden="true"
                        ></span>
                      }
                      <span
                        class="material-symbols-rounded !text-[20px] text-slate-400 group-hover:text-slate-600 group-aria-[current=page]:text-indigo-600 dark:group-hover:text-slate-200 dark:group-aria-[current=page]:text-indigo-300"
                        aria-hidden="true"
                        >{{ item.icon }}</span
                      >
                      {{ item.labelKey | t }}
                    </a>
                  </li>
                }
              </ul>
            </div>
          }
        </nav>

        <div class="space-y-2 border-t border-slate-200/80 p-3 dark:border-slate-800">
          @if (planNote(); as note) {
            <a
              [routerLink]="canManageBilling() ? '/billing' : null"
              class="block rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-3 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-violet-500/10"
            >
              <span
                class="flex items-center gap-2 text-xs font-extrabold text-indigo-700 dark:text-indigo-300"
              >
                <span class="material-symbols-rounded !text-base" aria-hidden="true"
                  >workspace_premium</span
                >{{ note.title }}
              </span>
              <span class="mt-1 block text-[11px] leading-4 text-slate-600 dark:text-slate-400">{{
                note.text
              }}</span>
            </a>
          }
          <div class="flex items-center gap-3 rounded-xl p-2">
            <span
              class="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-xs font-black text-indigo-700 dark:from-indigo-500/20 dark:to-violet-500/20 dark:text-indigo-200"
              aria-hidden="true"
              >{{ initials() }}</span
            >
            <div class="min-w-0 flex-1">
              <strong class="block truncate text-xs">{{ auth.session()?.name }}</strong>
              <span class="block truncate text-[11px] text-slate-500 dark:text-slate-400">{{
                auth.session()?.tenantName || auth.session()?.email
              }}</span>
            </div>
            <button
              type="button"
              class="odv-icon-btn !size-9 shrink-0"
              (click)="logout()"
              aria-label="Güvenli çıkış"
              title="Güvenli çıkış"
            >
              <span class="material-symbols-rounded !text-[20px] directional-icon">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div class="lg:ms-[17rem]">
        <header
          class="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70 sm:px-6 lg:px-8"
        >
          <div class="flex min-w-0 items-center gap-3">
            <button
              class="odv-icon-btn lg:hidden"
              type="button"
              (click)="mobileOpen.set(true)"
              aria-label="Menüyü aç"
            >
              <span class="material-symbols-rounded">menu</span>
            </button>
            <div class="min-w-0">
              <strong class="block truncate text-sm font-extrabold">{{
                auth.session()?.tenantName || product.name
              }}</strong>
              <span
                class="hidden text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:block"
                >{{ todayLabel() }}</span
              >
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <label class="sr-only" for="language">Dil</label>
            <select
              id="language"
              class="odv-input !min-h-10 !w-auto !py-1.5 !text-xs font-semibold"
              [value]="i18n.currentLang()"
              (change)="setLanguage($any($event.target).value)"
            >
              @for (language of i18n.options; track language.code) {
                <option [value]="language.code">
                  {{ language.flag }} {{ language.nativeName }}
                </option>
              }
            </select>
            <button
              type="button"
              class="odv-icon-btn"
              (click)="toggleTheme()"
              [attr.aria-label]="dark() ? 'Açık temaya geç' : 'Koyu temaya geç'"
              [attr.title]="dark() ? 'Açık tema' : 'Koyu tema'"
            >
              <span class="material-symbols-rounded">{{
                dark() ? 'light_mode' : 'dark_mode'
              }}</span>
            </button>
            <a
              routerLink="/activity"
              class="odv-icon-btn"
              aria-label="Aktivite günlüğü"
              title="Aktivite günlüğü"
            >
              <span class="material-symbols-rounded">notifications</span>
            </a>
          </div>
        </header>
        <main id="main" class="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
          <div class="animate-fade-up"><router-outlet /></div>
        </main>
      </div>
    </div>
  `,
})
export class AppShell {
  readonly product = PRODUCT;
  readonly auth = inject(AuthStore);
  readonly i18n = inject(I18nStore);
  readonly todayLabel = computed(() => {
    try {
      return new Intl.DateTimeFormat(this.i18n.currentLang(), {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString();
    }
  });
  readonly mobileOpen = signal(false);
  readonly dark = signal(this.readTheme());
  readonly canManageBilling = computed(() => {
    const role = this.auth.session()?.role;
    return role === 'owner' || role === 'admin';
  });
  readonly initials = computed(() => {
    const name = this.auth.session()?.name?.trim() || this.auth.session()?.email || '';
    const parts = name.split(/[\s@._-]+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toLocaleUpperCase('tr-TR') || '?';
  });
  readonly planNote = computed(() => {
    const session = this.auth.session();
    if (!session) return null;
    if (session.membershipStatus === 'trial') {
      const days = session.trialEndsAt
        ? Math.max(0, Math.ceil((Date.parse(session.trialEndsAt) - Date.now()) / 86_400_000))
        : null;
      return {
        title: 'Deneme sürümü',
        text:
          days === null
            ? 'Planınızı seçerek kesintisiz devam edin.'
            : `${days} gün kaldı. Planınızı seçerek kesintisiz devam edin.`,
      };
    }
    if (session.inGrace)
      return { title: 'Ödeme bekleniyor', text: 'Erişiminiz ek süre içinde devam ediyor.' };
    return null;
  });
  readonly menu = computed<MenuGroup[]>(() => [
    {
      label: 'Genel',
      items: [{ path: '/overview', icon: 'space_dashboard', labelKey: 'nav.overview' }],
    },
    {
      label: 'Uyum operasyonları',
      items: PRODUCT_NAVIGATION.map((item) => ({
        path: `/${item.path}`,
        icon: item.icon,
        labelKey: `nav.${item.key}`,
      })),
    },
    {
      label: 'Hesap',
      items: [
        { path: '/activity', icon: 'history', labelKey: 'nav.activity' },
        ...(this.canManageBilling()
          ? [{ path: '/billing', icon: 'credit_card', labelKey: 'nav.billing' }]
          : []),
        { path: '/settings', icon: 'settings', labelKey: 'nav.settings' },
      ],
    },
  ]);
  private readonly router = inject(Router);
  constructor() {
    document.documentElement.classList.toggle('dark', this.dark());
    this.i18n.setLanguage(this.i18n.currentLang());
  }
  setLanguage(value: string): void {
    this.i18n.setLanguage(value as SupportedLang);
  }
  toggleTheme(): void {
    this.dark.update((v) => !v);
    document.documentElement.classList.toggle('dark', this.dark());
    try {
      localStorage.setItem('odivon:theme', this.dark() ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
  }
  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
  private readTheme(): boolean {
    try {
      const stored = localStorage.getItem('odivon:theme');
      if (stored) return stored === 'dark';
    } catch {
      /* storage unavailable */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
