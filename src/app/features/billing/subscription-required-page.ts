import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth-store';

@Component({
  selector: 'app-subscription-required-page',
  imports: [DatePipe, RouterLink],
  template: `
    <main class="mx-auto grid min-h-[70vh] max-w-4xl place-items-center px-4 py-10">
      <section class="odv-card w-full overflow-hidden">
        <div
          class="grid gap-8 bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 p-7 text-white md:grid-cols-[1fr_auto] md:items-center md:p-10"
        >
          <div>
            <span class="odv-badge-warning">ERİŞİM BEKLEMEDE</span>
            <h1 class="mb-3 mt-5 text-3xl font-black md:text-4xl">Abonelik süresi sona erdi</h1>
            <p class="m-0 max-w-2xl text-sm leading-7 text-slate-300">
              Kayıtlarınız güvenle korunuyor. Yeni işlem oluşturmak ve uyumluluk operasyonuna devam
              etmek için hesabın aboneliğinin yenilenmesi gerekiyor.
            </p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/10 p-5 text-center">
            <span class="material-symbols-rounded text-5xl text-amber-300">lock_clock</span>
            <strong class="mt-2 block text-sm">Veriler silinmedi</strong>
            <span class="text-xs text-slate-300">Tenant izolasyonu devam ediyor</span>
          </div>
        </div>
        <div class="grid gap-5 p-7 md:grid-cols-3 md:p-10">
          <div class="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
            <span class="material-symbols-rounded text-violet-600">calendar_month</span>
            <strong class="mt-3 block text-sm">Son erişim tarihi</strong>
            <span class="mt-1 block text-sm text-slate-500">{{
              auth.session()?.subscriptionEndsAt | date: 'dd.MM.yyyy'
            }}</span>
          </div>
          <div class="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
            <span class="material-symbols-rounded text-violet-600">database</span>
            <strong class="mt-3 block text-sm">Kayıt güvenliği</strong>
            <span class="mt-1 block text-sm text-slate-500"
              >Mevcut denetim izi değişmeden saklanır.</span
            >
          </div>
          <div class="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
            <span class="material-symbols-rounded text-violet-600">support_agent</span>
            <strong class="mt-3 block text-sm">Yardıma mı ihtiyacınız var?</strong>
            <a class="mt-1 block text-sm font-bold text-violet-600" href="mailto:destek@odivon.com"
              >destek@odivon.com</a
            >
          </div>
          <div
            class="md:col-span-3 flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <p class="m-0 text-sm text-slate-500">
              {{
                isBillingManager
                  ? 'Güvenli ödeme ile erişimi hemen yeniden açabilirsiniz.'
                  : 'Hesap sahibinizden veya yöneticinizden aboneliği yenilemesini isteyin.'
              }}
            </p>
            @if (isBillingManager) {
              <a class="odv-btn-primary justify-center" routerLink="/billing">Aboneliği yenile</a>
            }
          </div>
        </div>
      </section>
    </main>
  `,
})
export class SubscriptionRequiredPage {
  readonly auth = inject(AuthStore);
  readonly isBillingManager = ['owner', 'admin'].includes(this.auth.session()?.role ?? '');
}
