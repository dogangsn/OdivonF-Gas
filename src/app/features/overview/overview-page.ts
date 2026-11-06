import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth-store';
import { PageHeader } from '../../shared/ui/page-header';
import { FgasDashboard, FgasEquipmentApi } from '../equipment/fgas-equipment.api';

interface ReadinessItem {
  readonly label: string;
  readonly hint: string;
  readonly ok: boolean;
  readonly link: string;
}

@Component({
  selector: 'app-overview-page',
  imports: [PageHeader, DecimalPipe, RouterLink],
  template: `
    <app-page-header
      icon="space_dashboard"
      [eyebrow]="greeting()"
      title="F-Gas Genel Bakış"
      description="Yasal kontrol takvimi, gaz yükü, saha aksiyonları ve denetime hazırlık durumu tek ekranda."
    >
      <a actions class="odv-btn-secondary" routerLink="/inspections">
        <span class="material-symbols-rounded" aria-hidden="true">verified</span>Denetimler
      </a>
      <a actions class="odv-btn-primary" routerLink="/equipment">
        <span class="material-symbols-rounded" aria-hidden="true">add</span>Ekipman ekle
      </a>
    </app-page-header>

    @if (loading()) {
      <div class="space-y-5" role="status" aria-label="Gösterge yükleniyor">
        <div class="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div class="h-56 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800"></div>
          <div class="h-56 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800"></div>
        </div>
        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="h-36 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800"></div>
          }
        </div>
      </div>
    } @else if (error()) {
      <div class="odv-card mx-auto max-w-lg p-10 text-center" role="alert">
        <span
          class="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"
          ><span class="material-symbols-rounded !text-3xl" aria-hidden="true"
            >cloud_off</span
          ></span
        >
        <h2 class="mb-1 mt-4 text-lg font-black">Canlı gösterge alınamadı</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ error() }}</p>
        <button class="odv-btn-primary mt-4" type="button" (click)="load()">
          <span class="material-symbols-rounded" aria-hidden="true">refresh</span>Tekrar dene
        </button>
      </div>
    } @else if (dashboard(); as d) {
      <div class="space-y-5">
        <section class="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <!-- Compliance radar -->
          <article
            class="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-6 text-white shadow-xl shadow-indigo-950/20 sm:p-7"
          >
            <div
              class="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-indigo-500/25 blur-3xl"
              aria-hidden="true"
            ></div>
            <div class="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div class="relative mx-auto size-36 shrink-0 sm:mx-0" aria-hidden="true">
                <svg viewBox="0 0 120 120" class="size-full -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgb(255 255 255 / .12)"
                    stroke-width="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke-width="10"
                    stroke-linecap="round"
                    [attr.stroke]="scoreColor()"
                    [attr.stroke-dasharray]="ringLength"
                    [attr.stroke-dashoffset]="ringOffset()"
                    class="transition-[stroke-dashoffset] duration-700"
                  />
                </svg>
                <div class="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <strong class="block text-4xl font-black leading-none tracking-tight">{{
                      score() === null ? '—' : score() + '%'
                    }}</strong>
                    <span
                      class="mt-1 block text-[10px] font-bold uppercase tracking-wider text-white/60"
                      >zamanında</span
                    >
                  </div>
                </div>
              </div>
              <div class="min-w-0">
                <span
                  class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-emerald-300"
                  ><span class="size-2 animate-pulse rounded-full bg-emerald-400"></span>CANLI UYUM
                  RADARI</span
                >
                <h2
                  class="mb-0 mt-3 text-2xl font-black leading-tight tracking-tight sm:text-[26px]"
                >
                  {{ headline() }}
                </h2>
                <p class="mb-0 mt-2 text-sm leading-6 text-white/70">
                  @if (d.totalEquipment) {
                    {{ d.totalEquipment }} ekipmanın
                    <strong class="text-white">{{ d.totalEquipment - d.overdueLeakChecks }}</strong>
                    tanesi kontrol takvimine uygun. {{ d.leakChecks }} sızıntı kontrolü ve
                    {{ d.certifiedTechnicians }} geçerli teknisyen kaydı izleniyor.
                  } @else {
                    Uyum oranını görmek için ilk ekipmanınızı ekleyin; kontrol takvimi buradan
                    izlenecek.
                  }
                </p>
              </div>
            </div>
          </article>

          <!-- Footprint -->
          <article class="odv-card flex flex-col p-6">
            <div class="flex items-center justify-between">
              <h2 class="m-0 text-base font-black tracking-tight">Gaz ve emisyon yükü</h2>
              <span class="odv-kpi-icon bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300"
                ><span class="material-symbols-rounded" aria-hidden="true">eco</span></span
              >
            </div>
            <div class="mt-4 grid flex-1 grid-cols-2 gap-3">
              <div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <span class="odv-kpi-label">CO₂ eşdeğeri</span>
                <strong class="mt-2 block text-2xl font-black tracking-tight">{{
                  d.co2EquivalentTonnes | number: '1.0-2'
                }}</strong>
                <span class="text-xs text-slate-500 dark:text-slate-400">ton CO₂e</span>
              </div>
              <div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <span class="odv-kpi-label">Toplam şarj</span>
                <strong class="mt-2 block text-2xl font-black tracking-tight">{{
                  d.refrigerantChargeKg | number: '1.0-2'
                }}</strong>
                <span class="text-xs text-slate-500 dark:text-slate-400">kg soğutucu akışkan</span>
              </div>
              <div
                class="col-span-2 flex items-center justify-between rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/40"
              >
                <div>
                  <span class="odv-kpi-label !text-emerald-700 dark:!text-emerald-300"
                    >Geri kazanım</span
                  >
                  <strong
                    class="mt-1 block text-xl font-black text-emerald-700 dark:text-emerald-300"
                    >{{ d.gasRecoveredKg | number: '1.0-2' }} kg</strong
                  >
                </div>
                <a routerLink="/gas-movements" class="odv-btn-ghost !min-h-9 !px-3 !text-xs"
                  >Gaz defteri<span
                    class="material-symbols-rounded !text-base directional-icon"
                    aria-hidden="true"
                    >arrow_forward</span
                  ></a
                >
              </div>
            </div>
          </article>
        </section>

        <!-- KPI cards -->
        <section class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Temel göstergeler">
          @for (kpi of kpis(); track kpi.label) {
            <a [routerLink]="kpi.link" class="odv-kpi group hover:-translate-y-0.5">
              <div class="flex items-center justify-between">
                <span class="odv-kpi-label">{{ kpi.label }}</span>
                <span class="odv-kpi-icon" [class]="kpi.iconClass"
                  ><span class="material-symbols-rounded" aria-hidden="true">{{
                    kpi.icon
                  }}</span></span
                >
              </div>
              <strong class="odv-kpi-value" [class]="kpi.valueClass">{{ kpi.value }}</strong>
              <span class="mt-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">{{
                kpi.note
              }}</span>
              <div
                class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400"
              >
                <span>{{ kpi.footer }}</span>
                <span
                  class="material-symbols-rounded !text-base transition-transform group-hover:translate-x-0.5 directional-icon"
                  aria-hidden="true"
                  >arrow_forward</span
                >
              </div>
            </a>
          }
        </section>

        <section class="grid gap-5 lg:grid-cols-2">
          <article class="odv-card p-6">
            <h2 class="m-0 text-base font-black tracking-tight">Hızlı işlemler</h2>
            <p class="mb-0 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Sahada en sık yapılan kayıtlara tek tıkla geçin.
            </p>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              @for (action of quickActions; track action.link) {
                <a
                  [routerLink]="action.link"
                  class="group flex items-center gap-3 rounded-xl border border-slate-200/80 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-slate-800 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/5"
                >
                  <span
                    class="odv-kpi-icon shrink-0 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300"
                    ><span class="material-symbols-rounded" aria-hidden="true">{{
                      action.icon
                    }}</span></span
                  >
                  <span class="min-w-0">
                    <strong class="block text-sm">{{ action.label }}</strong>
                    <span class="block truncate text-xs text-slate-500 dark:text-slate-400">{{
                      action.hint
                    }}</span>
                  </span>
                </a>
              }
            </div>
          </article>

          <article class="odv-card p-6">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="m-0 text-base font-black tracking-tight">Denetime hazırlık</h2>
                <p class="mb-0 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {{ readyCount() }} / {{ readiness().length }} madde tamam
                </p>
              </div>
              <span
                [class]="
                  readyCount() === readiness().length ? 'odv-badge-success' : 'odv-badge-warning'
                "
                >{{ readyCount() === readiness().length ? 'Hazır' : 'Eksikler var' }}</span
              >
            </div>
            <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-700"
                [style.width.%]="(readyCount() / readiness().length) * 100"
              ></div>
            </div>
            <ul class="mt-4 space-y-1">
              @for (item of readiness(); track item.label) {
                <li>
                  <a
                    [routerLink]="item.link"
                    class="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <span
                      class="grid size-7 shrink-0 place-items-center rounded-full"
                      [class]="
                        item.ok
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300'
                      "
                      ><span class="material-symbols-rounded !text-[18px]" aria-hidden="true">{{
                        item.ok ? 'check' : 'priority_high'
                      }}</span></span
                    >
                    <span class="min-w-0 flex-1">
                      <strong class="block text-sm">{{ item.label }}</strong>
                      <span class="block text-xs text-slate-500 dark:text-slate-400">{{
                        item.hint
                      }}</span>
                    </span>
                    <span class="sr-only">{{ item.ok ? 'Tamam' : 'Eksik' }}</span>
                  </a>
                </li>
              }
            </ul>
          </article>
        </section>
      </div>
    }
  `,
})
export class OverviewPage {
  readonly auth = inject(AuthStore);
  readonly dashboard = signal<FgasDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly ringLength = 2 * Math.PI * 52;
  readonly quickActions = [
    {
      link: '/leak-checks',
      icon: 'fact_check',
      label: 'Kontrol planla',
      hint: 'Periyodik sızıntı kontrolü',
    },
    {
      link: '/gas-movements',
      icon: 'swap_horiz',
      label: 'Gaz hareketi gir',
      hint: 'Dolum, geri kazanım, bertaraf',
    },
    { link: '/technicians', icon: 'badge', label: 'Sertifika ekle', hint: 'Teknisyen yetkinliği' },
    {
      link: '/inspections',
      icon: 'description',
      label: 'Denetim oluştur',
      hint: 'Bulgu ve kanıt paketi',
    },
  ];
  readonly greeting = computed(() => {
    const first = this.auth.session()?.name?.trim().split(/\s+/)[0];
    const hour = new Date().getHours();
    const part = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
    return first ? `${part}, ${first}` : 'Operasyon merkezi';
  });
  readonly score = computed(() => {
    const d = this.dashboard();
    if (!d || !d.totalEquipment) return null;
    return Math.round(((d.totalEquipment - d.overdueLeakChecks) / d.totalEquipment) * 100);
  });
  readonly ringOffset = computed(() => this.ringLength * (1 - (this.score() ?? 0) / 100));
  readonly scoreColor = computed(() => {
    const s = this.score();
    return s === null ? '#64748b' : s >= 90 ? '#34d399' : s >= 70 ? '#fbbf24' : '#fb7185';
  });
  readonly headline = computed(() => {
    const d = this.dashboard();
    if (!d) return '';
    if (!d.totalEquipment) return 'Envanteriniz henüz boş';
    const open = d.pendingActions + d.overdueLeakChecks;
    return open ? `${open} kritik aksiyon takip bekliyor` : 'Kritik aksiyon bulunmuyor';
  });
  readonly kpis = computed(() => {
    const d = this.dashboard();
    if (!d) return [];
    return [
      {
        label: 'Toplam ekipman',
        value: d.totalEquipment,
        note: `${d.activeEquipment} aktif varlık`,
        footer: 'Envantere git',
        icon: 'precision_manufacturing',
        iconClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
        valueClass: '',
        link: '/equipment',
      },
      {
        label: 'Geciken kontrol',
        value: d.overdueLeakChecks,
        note: d.overdueLeakChecks ? 'Yasal tarihi aşan ekipman' : 'Takvim güncel',
        footer: 'Kontrolleri planla',
        icon: 'event_busy',
        iconClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300',
        valueClass: d.overdueLeakChecks ? '!text-rose-600 dark:!text-rose-400' : '',
        link: '/leak-checks',
      },
      {
        label: 'Geçerli teknisyen',
        value: d.certifiedTechnicians,
        note: 'Sertifikası geçerli kayıt',
        footer: 'Teknisyenler',
        icon: 'engineering',
        iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300',
        valueClass: '',
        link: '/technicians',
      },
      {
        label: 'Açık aksiyon',
        value: d.pendingActions + d.actionRequired,
        note: 'Bulgu ve takip bekleyen kayıt',
        footer: 'Denetimlere git',
        icon: 'warning',
        iconClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300',
        valueClass:
          d.pendingActions + d.actionRequired ? '!text-amber-600 dark:!text-amber-400' : '',
        link: '/inspections',
      },
    ];
  });
  readonly readiness = computed<ReadinessItem[]>(() => {
    const d = this.dashboard();
    if (!d) return [];
    return [
      {
        label: 'Ekipman envanteri',
        hint: d.totalEquipment ? `${d.totalEquipment} ekipman kayıtlı` : 'Henüz ekipman eklenmedi',
        ok: d.totalEquipment > 0,
        link: '/equipment',
      },
      {
        label: 'Gecikmesiz kontrol takvimi',
        hint: d.overdueLeakChecks
          ? `${d.overdueLeakChecks} ekipmanın kontrolü gecikmiş`
          : 'Tüm kontroller zamanında',
        ok: d.totalEquipment > 0 && d.overdueLeakChecks === 0,
        link: '/leak-checks',
      },
      {
        label: 'Kapanmış bulgular',
        hint:
          d.pendingActions + d.actionRequired
            ? `${d.pendingActions + d.actionRequired} açık aksiyon var`
            : 'Açık aksiyon yok',
        ok: d.pendingActions + d.actionRequired === 0,
        link: '/inspections',
      },
      {
        label: 'Yetkin teknisyen',
        hint: d.certifiedTechnicians
          ? `${d.certifiedTechnicians} geçerli kayıt`
          : 'Sertifikalı teknisyen ekleyin',
        ok: d.certifiedTechnicians > 0,
        link: '/technicians',
      },
    ];
  });
  readonly readyCount = computed(() => this.readiness().filter((x) => x.ok).length);
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
