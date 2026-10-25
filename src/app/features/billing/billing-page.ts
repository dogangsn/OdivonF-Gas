import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormField, form, minLength, required, submit } from '@angular/forms/signals';
import { AuthStore } from '../../core/auth/auth-store';
import { PageHeader } from '../../shared/ui/page-header';
import { SlideOver } from '../../shared/ui/slide-over';
import {
  BillingApi,
  BillingStatus,
  BuyerDraft,
  FgasEntitlements,
  PaymentRecord,
  SaasPlan,
} from './billing.api';
@Component({
  selector: 'app-billing-page',
  imports: [PageHeader, SlideOver, FormField, CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-6">
      <app-page-header
        eyebrow="HESAP VE FATURALAMA"
        title="Abonelik Yönetimi"
        description="Planınızı, deneme sürenizi, güvenli ödeme akışını ve makbuz geçmişini yönetin."
      />
      @if (loading()) {
        <div class="odv-card grid min-h-72 place-items-center">
          <span class="material-symbols-rounded animate-spin text-5xl text-violet-600"
            >progress_activity</span
          >
        </div>
      } @else if (error()) {
        <div class="odv-card p-10 text-center" role="alert">
          <h2 class="text-xl font-black">Abonelik bilgileri alınamadı</h2>
          <p class="text-sm text-slate-500">{{ error() }}</p>
          <button type="button" class="odv-btn-primary" (click)="load()">Tekrar dene</button>
        </div>
      } @else {
        @if (status(); as state) {
          <section
            class="odv-card overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 p-6 text-white lg:p-8"
          >
            <div class="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span
                  [class]="
                    state.inGrace
                      ? 'odv-badge-danger'
                      : state.membershipStatus === 'active'
                        ? 'odv-badge-success'
                        : 'odv-badge-warning'
                  "
                  >{{ statusLabel(state) }}</span
                >
                <h2 class="mb-2 mt-4 text-3xl font-black">
                  {{
                    state.daysLeft === null
                      ? 'Hesabınız kullanıma hazır'
                      : state.daysLeft + ' gün kaldı'
                  }}
                </h2>
                <p class="m-0 max-w-2xl text-sm leading-6 text-slate-300">
                  {{
                    state.subscriptionEndsAt
                      ? 'Mevcut erişim dönemi ' +
                        (state.subscriptionEndsAt | date: 'dd.MM.yyyy') +
                        ' tarihinde sona erer.'
                      : '14 günlük deneme süresinde tüm F-Gas özelliklerini değerlendirebilirsiniz.'
                  }}
                </p>
              </div>
              <div class="rounded-2xl bg-white/10 p-5 text-center">
                <span class="material-symbols-rounded text-4xl text-violet-300">verified_user</span
                ><strong class="mt-2 block text-sm">Tenant izolasyonu aktif</strong
                ><span class="text-xs text-slate-300">{{ auth.session()?.tenantName }}</span>
              </div>
            </div>
          </section>
        }
        @if (entitlements(); as access) {
          <section class="odv-card p-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span class="text-xs font-black uppercase tracking-wider text-violet-600"
                  >Mevcut kullanım · {{ access.planId }}</span
                >
                <h2 class="mb-0 mt-2 text-lg font-black">Plan kapasitesi</h2>
              </div>
              <div class="grid gap-3 sm:grid-cols-3">
                <div class="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                  <strong class="block"
                    >{{ access.usage.equipment }} / {{ access.maxEquipment ?? '∞' }}</strong
                  ><span class="text-xs text-slate-500">Ekipman</span>
                </div>
                <div class="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                  <strong class="block"
                    >{{ access.usage.operations }} / {{ access.maxOperations ?? '∞' }}</strong
                  ><span class="text-xs text-slate-500">Operasyon</span>
                </div>
                <div class="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                  <strong class="block"
                    >{{ access.usage.users }} / {{ access.maxUsers ?? '∞' }}</strong
                  ><span class="text-xs text-slate-500">Kullanıcı kapasitesi</span>
                </div>
              </div>
            </div>
          </section>
        }
        <section>
          <div class="mb-4 flex items-end justify-between">
            <div>
              <h2 class="m-0 text-xl font-black">Planlar</h2>
              <p class="mb-0 mt-1 text-sm text-slate-500">Yıllık ödemede iki aylık avantaj.</p>
            </div>
            <div class="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-xs font-bold"
                [class.bg-white]="cycle() === 'monthly'"
                (click)="cycle.set('monthly')"
              >
                Aylık</button
              ><button
                type="button"
                class="rounded-lg px-4 py-2 text-xs font-bold"
                [class.bg-white]="cycle() === 'yearly'"
                (click)="cycle.set('yearly')"
              >
                Yıllık
              </button>
            </div>
          </div>
          <div class="grid gap-4 lg:grid-cols-3">
            @for (plan of plans(); track plan.id; let index = $index) {
              <article
                class="odv-card relative p-6"
                [class.ring-2]="index === 1"
                [class.ring-violet-500]="index === 1"
              >
                @if (entitlements()?.planId === plan.id) {
                  <span
                    class="absolute end-4 top-4 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700"
                    >MEVCUT PLAN</span
                  >
                } @else if (index === 1) {
                  <span
                    class="absolute end-4 top-4 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-black text-violet-700"
                    >ÖNERİLEN</span
                  >
                }
                <h3 class="m-0 text-xl font-black">{{ plan.name }}</h3>
                <p class="mt-2 text-sm text-slate-500">{{ planDescription(plan.id) }}</p>
                <div class="my-6">
                  <strong class="text-4xl font-black">{{
                    price(plan) | currency: 'TRY' : 'symbol-narrow' : '1.0-0' : 'tr-TR'
                  }}</strong
                  ><span class="text-xs text-slate-500">
                    / {{ cycle() === 'monthly' ? 'ay' : 'yıl' }}</span
                  >
                </div>
                <ul class="mb-6 space-y-3 text-sm">
                  @for (feature of planFeatures(plan.id); track feature) {
                    <li class="flex gap-2">
                      <span class="material-symbols-rounded text-emerald-600">check_circle</span
                      >{{ feature }}
                    </li>
                  }
                </ul>
                <button
                  type="button"
                  class="w-full"
                  [class.odv-btn-primary]="index === 1"
                  [class.odv-btn-soft]="index !== 1"
                  [disabled]="auth.session()?.role !== 'owner' || !price(plan)"
                  (click)="selectPlan(plan)"
                >
                  {{
                    auth.session()?.role === 'owner'
                      ? entitlements()?.planId === plan.id
                        ? 'Planı yenile'
                        : 'Bu planı seç'
                      : 'Yalnız hesap sahibi değiştirebilir'
                  }}
                </button>
              </article>
            }
          </div>
        </section>
        <section class="odv-card overflow-hidden">
          <div class="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 class="m-0 text-xl font-black">Ödeme ve makbuz geçmişi</h2>
            <p class="mb-0 mt-1 text-sm text-slate-500">
              Başarılı, sunucu tarafından doğrulanmış abonelik ödemeleri.
            </p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th class="odv-th">Makbuz</th>
                  <th class="odv-th">Plan</th>
                  <th class="odv-th">Dönem</th>
                  <th class="odv-th">Tutar</th>
                  <th class="odv-th">Ödeme tarihi</th>
                  <th class="odv-th">Ortam</th>
                </tr>
              </thead>
              <tbody>
                @for (payment of history(); track payment.id) {
                  <tr>
                    <td class="odv-td font-mono text-xs">{{ payment.receiptNo }}</td>
                    <td class="odv-td font-bold">{{ payment.planId }}</td>
                    <td class="odv-td">
                      {{ payment.periodStartsAt | date: 'dd.MM.yyyy' }} –
                      {{ payment.periodEndsAt | date: 'dd.MM.yyyy' }}
                    </td>
                    <td class="odv-td font-bold">
                      {{
                        payment.amountKurus / 100
                          | currency: payment.currency : 'symbol-narrow' : '1.2-2' : 'tr-TR'
                      }}
                    </td>
                    <td class="odv-td">{{ payment.paidAt | date: 'dd.MM.yyyy HH:mm' }}</td>
                    <td class="odv-td">
                      <span
                        [class]="
                          payment.mode === 'live' ? 'odv-badge-success' : 'odv-badge-warning'
                        "
                        >{{ payment.mode === 'live' ? 'Canlı' : 'Test' }}</span
                      >
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="p-10 text-center text-sm text-slate-500">
                      Henüz tamamlanmış bir ödeme yok.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
    <app-slide-over
      [open]="drawerOpen()"
      [wide]="true"
      [dirty]="buyerForm().dirty()"
      [submitting]="saving()"
      title="Güvenli ödeme bilgileri"
      [description]="selectedPlan()?.name + ' · ' + (cycle() === 'monthly' ? 'Aylık' : 'Yıllık')"
      eyebrow="IYZICO GÜVENLİ ÖDEME"
      icon="credit_card"
      submitLabel="Güvenli ödemeye geç"
      (closed)="drawerOpen.set(false)"
      (submitted)="checkout()"
    >
      @if (saveError()) {
        <div role="alert" class="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {{ saveError() }}
        </div>
      }
      <section class="odv-card p-5 sm:p-6">
        <h3 class="m-0 text-base font-black">Fatura ve kart sahibi bilgileri</h3>
        <p class="mt-1 text-xs text-slate-500">
          Kart bilgileri Odivon sunucularında tutulmaz; güvenli iyzico sayfasında girilir.
        </p>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label
            ><span class="mb-1.5 block text-xs font-bold">Ad *</span
            ><input
              class="odv-input"
              autocomplete="given-name"
              [formField]="buyerForm.name" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Soyad *</span
            ><input
              class="odv-input"
              autocomplete="family-name"
              [formField]="buyerForm.surname" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">T.C. kimlik no *</span
            ><input
              class="odv-input"
              inputmode="numeric"
              [formField]="buyerForm.identityNumber" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">E-posta *</span
            ><input
              class="odv-input"
              type="email"
              autocomplete="email"
              [formField]="buyerForm.email" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Telefon *</span
            ><input class="odv-input" autocomplete="tel" [formField]="buyerForm.gsmNumber" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Şehir *</span
            ><input
              class="odv-input"
              autocomplete="address-level2"
              [formField]="buyerForm.city" /></label
          ><label class="sm:col-span-2"
            ><span class="mb-1.5 block text-xs font-bold">Fatura adresi *</span
            ><textarea
              class="odv-input min-h-24"
              autocomplete="street-address"
              [formField]="buyerForm.address"
            ></textarea>
          </label>
        </div>
      </section>
    </app-slide-over>
  `,
})
export class BillingPage {
  readonly auth = inject(AuthStore);
  readonly plans = signal<SaasPlan[]>([]);
  readonly status = signal<BillingStatus | null>(null);
  readonly history = signal<PaymentRecord[]>([]);
  readonly entitlements = signal<FgasEntitlements | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly cycle = signal<'monthly' | 'yearly'>('yearly');
  readonly drawerOpen = signal(false);
  readonly selectedPlan = signal<SaasPlan | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly buyer = signal<BuyerDraft>({
    name: '',
    surname: '',
    identityNumber: '',
    email: this.auth.session()?.email ?? '',
    gsmNumber: '',
    address: '',
    city: '',
    country: 'Turkey',
  });
  readonly buyerForm = form(this.buyer, (p) => {
    required(p.name);
    required(p.surname);
    required(p.identityNumber);
    minLength(p.identityNumber, 11);
    required(p.email);
    required(p.gsmNumber);
    required(p.address);
    required(p.city);
  });
  private readonly api = inject(BillingApi);
  constructor() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      const [plans, status, history, entitlements] = await Promise.all([
        this.api.plans(),
        this.api.status(),
        this.api.history(),
        this.api.entitlements(),
      ]);
      this.plans.set(plans);
      this.status.set(status);
      this.history.set(history);
      this.entitlements.set(entitlements);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Abonelik verileri alınamadı.');
    } finally {
      this.loading.set(false);
    }
  }
  price(plan: SaasPlan) {
    return this.cycle() === 'monthly' ? plan.monthly : plan.yearly;
  }
  selectPlan(plan: SaasPlan) {
    this.selectedPlan.set(plan);
    this.drawerOpen.set(true);
  }
  checkout() {
    submit(this.buyerForm, async () => {
      const plan = this.selectedPlan();
      if (!plan) return;
      this.saving.set(true);
      this.saveError.set('');
      try {
        const url = await this.api.checkout(plan.id, this.cycle(), this.buyer());
        window.location.assign(url);
      } catch (e) {
        this.saveError.set(e instanceof Error ? e.message : 'Ödeme başlatılamadı.');
        this.saving.set(false);
      }
    });
  }
  statusLabel(state: BillingStatus) {
    return state.inGrace
      ? 'EK SÜRE'
      : state.membershipStatus === 'active'
        ? 'AKTİF ABONELİK'
        : state.membershipStatus === 'trial'
          ? 'ÜCRETSİZ DENEME'
          : 'ERİŞİM SONA ERDİ';
  }
  planDescription(id: string) {
    return id === 'starter'
      ? 'Küçük ekipler ve tek tesis için temel uyum yönetimi.'
      : id === 'pro'
        ? 'Çok tesisli operasyonlar ve gelişmiş raporlama.'
        : 'Kurumsal yönetişim, ölçek ve öncelikli destek.';
  }
  planFeatures(id: string): readonly string[] {
    if (id === 'starter')
      return ['100 ekipman ve 2.500 operasyon', '3 kullanıcı', 'Değişmez denetim izi'];
    if (id === 'pro')
      return [
        '1.000 ekipman ve 25.000 operasyon',
        '15 kullanıcı',
        'Gelişmiş rapor ve dışa aktarım',
      ];
    return [
      'Sınırsız ekipman ve operasyon',
      'Sınırsız kullanıcı',
      'Gelişmiş rapor ve öncelikli destek',
    ];
  }
}
