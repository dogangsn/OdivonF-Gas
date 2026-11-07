import { CurrencyPipe } from '@angular/common';
import { Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MarketingFaq } from './marketing-faq';
import { PRICING_FAQ } from './marketing-faq-content';

interface PublicPlan {
  readonly id: string;
  readonly name: string;
  readonly monthly: number;
  readonly yearly: number;
}

/** Plan limits mirror the in-app billing page and MainAPI fgas entitlements. */
const PLAN_DETAILS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Küçük ekipler ve tek tesis için temel uyum yönetimi.',
    features: ['100 ekipman', '2.500 operasyon kaydı', '3 kullanıcı', 'Değişmez denetim izi'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Servis firmaları ve çok tesisli operasyonlar için.',
    features: [
      '1.000 ekipman',
      '25.000 operasyon kaydı',
      '15 kullanıcı',
      'Gelişmiş rapor ve dışa aktarım',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Kurumsal yönetişim, ölçek ve öncelikli destek.',
    features: [
      'Sınırsız ekipman',
      'Sınırsız operasyon kaydı',
      'Sınırsız kullanıcı',
      'Öncelikli destek',
    ],
  },
] as const;

@Component({
  selector: 'app-marketing-pricing',
  imports: [RouterLink, CurrencyPipe, MarketingFaq],
  template: `
    <section class="mx-auto max-w-7xl px-4 pb-6 pt-14 text-center sm:px-6">
      <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Fiyatlar</span>
      <h1
        class="mx-auto mt-2 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white"
      >
        F-Gas yazılımı fiyatları
      </h1>
      <p class="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
        Ekipman ve kullanıcı sayınıza göre bir plan seçin. Tüm planlarda 14 gün ücretsiz deneme var,
        kurulum ücreti yok.
      </p>
      <div class="odv-segment mx-auto mt-8 inline-flex" role="group" aria-label="Ödeme dönemi">
        <button
          type="button"
          class="odv-segment-item"
          [attr.aria-pressed]="cycle() === 'monthly'"
          (click)="cycle.set('monthly')"
        >
          Aylık
        </button>
        <button
          type="button"
          class="odv-segment-item"
          [attr.aria-pressed]="cycle() === 'yearly'"
          (click)="cycle.set('yearly')"
        >
          Yıllık
        </button>
      </div>
    </section>

    <section class="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 md:grid-cols-3">
      @for (plan of plans; track plan.id; let index = $index) {
        <article
          class="odv-card flex flex-col p-7"
          [class.ring-2]="index === 1"
          [class.ring-indigo-500]="index === 1"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-black text-slate-900 dark:text-white">{{ plan.name }}</h2>
            @if (index === 1) {
              <span class="odv-badge-info">En çok tercih edilen</span>
            }
          </div>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ plan.description }}</p>
          <div class="mt-6 min-h-12">
            @if (price(plan.id); as amount) {
              <strong class="text-4xl font-black text-slate-900 dark:text-white">{{
                amount | currency: 'TRY' : 'symbol-narrow' : '1.0-0' : 'tr-TR'
              }}</strong>
              <span class="text-sm text-slate-500">
                / {{ cycle() === 'monthly' ? 'ay' : 'yıl' }}</span
              >
            } @else {
              <strong class="text-lg font-black text-slate-900 dark:text-white">{{
                loading() ? 'Fiyat yükleniyor…' : 'Fiyat için hesap açın'
              }}</strong>
            }
          </div>
          <ul class="mb-7 mt-6 flex-1 space-y-3 text-sm">
            @for (feature of plan.features; track feature) {
              <li class="flex gap-2 text-slate-700 dark:text-slate-200">
                <span
                  class="material-symbols-rounded text-[20px] text-emerald-600"
                  aria-hidden="true"
                  >check_circle</span
                >{{ feature }}
              </li>
            }
          </ul>
          <a
            routerLink="/register"
            class="justify-center"
            [class.odv-btn-primary]="index === 1"
            [class.odv-btn-soft]="index !== 1"
            >14 gün ücretsiz deneyin</a
          >
        </article>
      }
    </section>

    <app-marketing-faq [items]="faq" />
  `,
})
export class PricingPage {
  readonly plans = PLAN_DETAILS;
  readonly faq = PRICING_FAQ;
  readonly cycle = signal<'monthly' | 'yearly'>('monthly');
  readonly loading = signal(true);
  private readonly prices = signal<readonly PublicPlan[]>([]);

  constructor() {
    // Prices change from the admin panel, so they are read live in the browser.
    afterNextRender(() => void this.loadPrices());
  }

  price(id: string): number | null {
    const plan = this.prices().find((item) => item.id === id);
    if (!plan) return null;
    return (this.cycle() === 'monthly' ? plan.monthly : plan.yearly) || null;
  }

  private async loadPrices() {
    try {
      const response = await fetch(`${environment.apiBaseUrl}/public/saas-pricing?product=fgas`);
      if (!response.ok) return;
      const body = (await response.json()) as {
        data?: { plans?: PublicPlan[] };
        plans?: PublicPlan[];
      };
      this.prices.set(body.data?.plans ?? body.plans ?? []);
    } catch {
      // Network errors leave the "open an account" fallback in place.
    } finally {
      this.loading.set(false);
    }
  }
}
