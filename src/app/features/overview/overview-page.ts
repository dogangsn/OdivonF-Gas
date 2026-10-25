import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth-store';
import { PageHeader } from '../../shared/ui/page-header';
import { FgasDashboard, FgasEquipmentApi } from '../equipment/fgas-equipment.api';
@Component({
  selector: 'app-overview-page',
  imports: [PageHeader, DecimalPipe, RouterLink],
  template: ` <div class="space-y-6">
    <app-page-header
      eyebrow="OPERASYON MERKEZİ"
      title="F-Gas Genel Bakış"
      description="Yasal kontrol takvimi, gaz yükü, saha aksiyonları ve denetime hazırlık durumunun canlı görünümü."
      ><a actions class="odv-btn-primary" routerLink="/equipment"
        ><span class="material-symbols-rounded">add</span>Ekipman ekle</a
      ></app-page-header
    >
    @if (auth.session()?.membershipStatus === 'trial') {
      <section
        class="flex flex-col gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex gap-3">
          <span class="material-symbols-rounded text-violet-600">workspace_premium</span>
          <div>
            <strong class="block text-sm">Ücretsiz deneme hesabı</strong
            ><span class="text-xs text-slate-500"
              >Deneme süreniz bitmeden planınızı seçerek verilerinize kesintisiz erişin.</span
            >
          </div>
        </div>
        <a routerLink="/billing" class="odv-btn-soft">Planları incele</a>
      </section>
    }
    @if (loading()) {
      <div class="odv-card grid min-h-72 place-items-center">
        <span class="material-symbols-rounded animate-spin text-5xl text-violet-600"
          >progress_activity</span
        >
      </div>
    } @else if (error()) {
      <div class="odv-card p-10 text-center" role="alert">
        <h2 class="text-xl font-black">Canlı gösterge alınamadı</h2>
        <p class="text-sm text-slate-500">{{ error() }}</p>
        <button class="odv-btn-primary" type="button" (click)="load()">Tekrar dene</button>
      </div>
    } @else if (dashboard(); as d) {
      <section
        class="odv-card overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 p-6 text-white lg:p-8"
      >
        <div class="grid gap-7 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <div
              class="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300"
            >
              <span class="size-2 rounded-full bg-emerald-400"></span>CANLI UYUM RADARI
            </div>
            <h2 class="m-0 text-3xl font-black">
              {{
                d.pendingActions
                  ? d.pendingActions + ' kritik aksiyon takip bekliyor'
                  : 'Kritik aksiyon bulunmuyor'
              }}
            </h2>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {{ d.totalEquipment }} ekipman, {{ d.leakChecks }} kontrol ve
              {{ d.certifiedTechnicians }} yetkin teknisyen kaydı tenant sınırları içinde izleniyor.
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl bg-white/10 p-4">
              <strong class="block text-2xl">{{ d.co2EquivalentTonnes | number: '1.0-2' }}</strong
              ><span class="text-xs text-slate-300">ton CO₂e</span>
            </div>
            <div class="rounded-2xl bg-white/10 p-4">
              <strong class="block text-2xl">{{ d.gasRecoveredKg | number: '1.0-2' }}</strong
              ><span class="text-xs text-slate-300">kg geri kazanım</span>
            </div>
          </div>
        </div>
      </section>
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <a routerLink="/equipment" class="odv-card p-5 transition hover:-translate-y-0.5"
          ><span class="material-symbols-rounded text-violet-600">precision_manufacturing</span
          ><strong class="mt-4 block text-4xl font-black">{{ d.totalEquipment }}</strong
          ><span class="text-xs text-slate-500">Toplam ekipman</span></a
        ><a routerLink="/leak-checks" class="odv-card p-5 transition hover:-translate-y-0.5"
          ><span class="material-symbols-rounded text-rose-600">event_busy</span
          ><strong class="mt-4 block text-4xl font-black text-rose-600">{{
            d.overdueLeakChecks
          }}</strong
          ><span class="text-xs text-slate-500">Geciken sızıntı kontrolü</span></a
        ><a routerLink="/technicians" class="odv-card p-5 transition hover:-translate-y-0.5"
          ><span class="material-symbols-rounded text-emerald-600">engineering</span
          ><strong class="mt-4 block text-4xl font-black">{{ d.certifiedTechnicians }}</strong
          ><span class="text-xs text-slate-500">Geçerli teknisyen kaydı</span></a
        ><a routerLink="/inspections" class="odv-card p-5 transition hover:-translate-y-0.5"
          ><span class="material-symbols-rounded text-amber-600">warning</span
          ><strong class="mt-4 block text-4xl font-black text-amber-600">{{
            d.pendingActions + d.actionRequired
          }}</strong
          ><span class="text-xs text-slate-500">Aksiyon ve bulgu</span></a
        >
      </section>
      <section class="grid gap-5 lg:grid-cols-2">
        <article class="odv-card p-6">
          <h2 class="m-0 text-lg font-black">Hızlı işlemler</h2>
          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <a class="odv-btn-soft justify-start" routerLink="/leak-checks"
              ><span class="material-symbols-rounded">fact_check</span>Kontrol planla</a
            ><a class="odv-btn-soft justify-start" routerLink="/gas-movements"
              ><span class="material-symbols-rounded">swap_horiz</span>Gaz hareketi gir</a
            ><a class="odv-btn-soft justify-start" routerLink="/technicians"
              ><span class="material-symbols-rounded">badge</span>Sertifika ekle</a
            ><a class="odv-btn-soft justify-start" routerLink="/inspections"
              ><span class="material-symbols-rounded">description</span>Denetim oluştur</a
            >
          </div>
        </article>
        <article class="odv-card p-6">
          <h2 class="m-0 text-lg font-black">Denetim hazırlık kontrolü</h2>
          <div class="mt-5 space-y-4">
            <div class="flex items-center justify-between text-sm">
              <span>Ekipman envanteri</span
              ><strong>{{ d.totalEquipment ? 'Aktif' : 'Başlatılmadı' }}</strong>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                class="h-full rounded-full bg-violet-600"
                [style.width.%]="d.totalEquipment ? 100 : 0"
              ></div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Gecikmesiz kontrol takvimi</span
              ><strong>{{ d.overdueLeakChecks ? 'Aksiyon gerekli' : 'Uygun' }}</strong>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                class="h-full rounded-full"
                [class.bg-emerald-500]="!d.overdueLeakChecks"
                [class.bg-rose-500]="d.overdueLeakChecks"
                [style.width.%]="d.overdueLeakChecks ? 45 : 100"
              ></div>
            </div>
          </div>
        </article>
      </section>
    }
  </div>`,
})
export class OverviewPage {
  readonly auth = inject(AuthStore);
  readonly dashboard = signal<FgasDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  private readonly api = inject(FgasEquipmentApi);
  constructor() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      this.dashboard.set(await this.api.dashboard());
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Veri alınamadı.');
    } finally {
      this.loading.set(false);
    }
  }
}
