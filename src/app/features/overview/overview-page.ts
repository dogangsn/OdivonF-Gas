import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth-store';
import { PageHeader } from '../../shared/ui/page-header';
import { FgasDashboard, FgasEquipment, FgasEquipmentApi } from '../equipment/fgas-equipment.api';

type Bucket = 'overdue' | 'week' | 'month' | 'later';

interface ScheduleRow {
  readonly equipment: FgasEquipment;
  readonly days: number;
  readonly bucket: Bucket;
}

interface ReadinessItem {
  readonly label: string;
  readonly hint: string;
  readonly ok: boolean;
  readonly link: string;
}

const DAY = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-overview-page',
  imports: [PageHeader, DecimalPipe, RouterLink],
  template: `
    <app-page-header
      icon="event_upcoming"
      [eyebrow]="greeting()"
      title="Kontrol takvimi"
      description="Geciken ve yaklaşan sızıntı kontrolleri, gaz yükü ve denetime hazırlık durumu."
    >
      <a actions class="odv-btn-secondary" routerLink="/equipment">
        <span class="material-symbols-rounded" aria-hidden="true">add</span>Ekipman ekle
      </a>
      <a actions class="odv-btn-primary" routerLink="/leak-checks">
        <span class="material-symbols-rounded" aria-hidden="true">fact_check</span>Kontrol kaydet
      </a>
    </app-page-header>

    @if (loading()) {
      <div class="space-y-5" role="status" aria-label="Takvim yükleniyor">
        <div class="h-24 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800"></div>
        <div class="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div class="h-96 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800"></div>
          <div class="h-96 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800"></div>
        </div>
      </div>
    } @else if (error()) {
      <div class="odv-card mx-auto max-w-lg p-10 text-center" role="alert">
        <span
          class="mx-auto grid size-14 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"
          ><span class="material-symbols-rounded !text-3xl" aria-hidden="true"
            >cloud_off</span
          ></span
        >
        <h2 class="mb-1 mt-4 text-lg font-black">Takvim alınamadı</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ error() }}</p>
        <button class="odv-btn-primary mt-4" type="button" (click)="load()">
          <span class="material-symbols-rounded" aria-hidden="true">refresh</span>Tekrar dene
        </button>
      </div>
    } @else if (dashboard(); as d) {
      <div class="space-y-5">
        <!-- Summary strip -->
        <section
          class="odv-card grid grid-cols-2 divide-slate-200 lg:grid-cols-4 lg:divide-x dark:divide-slate-800"
          aria-label="Özet"
        >
          @for (stat of stats(); track stat.label) {
            <a
              [routerLink]="stat.link"
              class="block p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <span class="odv-kpi-label">{{ stat.label }}</span>
              <strong class="mt-1.5 block text-2xl font-black tracking-tight" [class]="stat.tone">{{
                stat.value
              }}</strong>
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ stat.note }}</span>
            </a>
          }
        </section>

        <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <!-- Work list -->
          <section class="odv-card overflow-hidden" aria-labelledby="schedule-title">
            <div
              class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800"
            >
              <h2 id="schedule-title" class="m-0 text-base font-black tracking-tight">
                Yapılacak kontroller
              </h2>
              <div class="odv-segment" role="group" aria-label="Zaman aralığı">
                @for (tab of tabs(); track tab.key) {
                  <button
                    type="button"
                    class="odv-segment-item"
                    [attr.aria-pressed]="filter() === tab.key"
                    (click)="filter.set(tab.key)"
                  >
                    {{ tab.label }} <span class="ms-1 opacity-70">{{ tab.count }}</span>
                  </button>
                }
              </div>
            </div>

            @if (!equipment().length) {
              <div class="p-8">
                <h3 class="m-0 text-base font-black">Takviminizi üç adımda kurun</h3>
                <ol class="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li class="flex gap-3">
                    <span
                      class="grid size-6 shrink-0 place-items-center rounded-md bg-brand-700 text-xs font-black text-white"
                      >1</span
                    >
                    Ekipmanı gaz türü ve kilogramıyla ekleyin; CO₂e ve periyot otomatik hesaplanır.
                  </li>
                  <li class="flex gap-3">
                    <span
                      class="grid size-6 shrink-0 place-items-center rounded-md bg-brand-700 text-xs font-black text-white"
                      >2</span
                    >
                    Son kontrol tarihini girin; bir sonraki kontrol buraya düşer.
                  </li>
                  <li class="flex gap-3">
                    <span
                      class="grid size-6 shrink-0 place-items-center rounded-md bg-brand-700 text-xs font-black text-white"
                      >3</span
                    >
                    Kontrolü yapınca sonucu kaydedin; takvim kendiliğinden ilerler.
                  </li>
                </ol>
                <a routerLink="/equipment" class="odv-btn-primary mt-6 inline-flex">
                  <span class="material-symbols-rounded" aria-hidden="true">add</span>İlk ekipmanı
                  ekle
                </a>
              </div>
            } @else if (!visibleRows().length) {
              <p class="m-0 px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                {{ emptyText() }}
              </p>
            } @else {
              <ul class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (row of visibleRows(); track row.equipment.id) {
                  <li class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                    <span
                      class="h-10 w-1 shrink-0 rounded-full"
                      [class]="barClass(row.bucket)"
                      aria-hidden="true"
                    ></span>
                    <div class="min-w-0 flex-1 basis-48">
                      <strong class="block truncate text-sm">{{ row.equipment.name }}</strong>
                      <span class="block truncate text-xs text-slate-500 dark:text-slate-400"
                        >{{ row.equipment.location }}
                        @if (row.equipment.responsiblePerson) {
                          · {{ row.equipment.responsiblePerson }}
                        }
                      </span>
                    </div>
                    <div class="hidden w-40 text-xs sm:block">
                      <span class="block font-semibold text-slate-700 dark:text-slate-200">{{
                        row.equipment.refrigerant || '—'
                      }}</span>
                      <span class="text-slate-500 dark:text-slate-400"
                        >{{ row.equipment.co2EquivalentTonnes ?? 0 | number: '1.0-1' }} t CO₂e
                        @if (row.equipment.inspectionIntervalMonths) {
                          · {{ row.equipment.inspectionIntervalMonths }} ay
                        }
                      </span>
                    </div>
                    <div class="w-32 text-xs">
                      <span class="block font-bold text-slate-800 dark:text-slate-100">{{
                        formatDate(row.equipment.nextLeakCheckDueAt!)
                      }}</span>
                      <span class="font-bold" [class]="dueClass(row.bucket)">{{
                        relative(row.days)
                      }}</span>
                    </div>
                    <a
                      class="odv-btn-ghost !min-h-9 !px-3 !text-xs"
                      routerLink="/leak-checks"
                      [queryParams]="{ equipment: row.equipment.id }"
                      [attr.aria-label]="row.equipment.name + ' için kontrol kaydet'"
                      >Kontrol kaydet</a
                    >
                  </li>
                }
              </ul>
            }
            @if (unscheduled() && equipment().length) {
              <a
                routerLink="/equipment"
                class="flex items-center gap-2 border-t border-slate-200 bg-amber-50/60 px-5 py-3 text-xs font-bold text-amber-800 dark:border-slate-800 dark:bg-amber-950/30 dark:text-amber-300"
              >
                <span class="material-symbols-rounded !text-base" aria-hidden="true">info</span>
                {{ unscheduled() }} ekipmanın kontrol tarihi yok. Son kontrol tarihini girin.
              </a>
            }
          </section>

          <aside class="space-y-5">
            <!-- Readiness -->
            <section class="odv-card p-5">
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
              <ul class="mt-3 space-y-0.5">
                @for (item of readiness(); track item.label) {
                  <li>
                    <a
                      [routerLink]="item.link"
                      class="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <span
                        class="material-symbols-rounded !text-[20px]"
                        [class]="
                          item.ok
                            ? 'text-brand-600 dark:text-brand-300'
                            : 'text-amber-600 dark:text-amber-400'
                        "
                        aria-hidden="true"
                        >{{ item.ok ? 'check_circle' : 'error' }}</span
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
            </section>

            <!-- Gas load -->
            <section class="odv-card p-5">
              <h2 class="m-0 text-base font-black tracking-tight">Gaz yükü</h2>
              <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt class="odv-kpi-label">Şarj</dt>
                  <dd class="m-0 mt-1 font-black">
                    {{ d.refrigerantChargeKg | number: '1.0-1' }} kg
                  </dd>
                </div>
                <div>
                  <dt class="odv-kpi-label">Geri kazanım</dt>
                  <dd class="m-0 mt-1 font-black">{{ d.gasRecoveredKg | number: '1.0-1' }} kg</dd>
                </div>
              </dl>
              <a
                routerLink="/gas-movements"
                class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-brand-300"
                >Gaz defteri<span
                  class="material-symbols-rounded !text-base directional-icon"
                  aria-hidden="true"
                  >arrow_forward</span
                ></a
              >
            </section>
          </aside>
        </div>
      </div>
    }
  `,
})
export class OverviewPage {
  readonly auth = inject(AuthStore);
  private readonly api = inject(FgasEquipmentApi);
  readonly dashboard = signal<FgasDashboard | null>(null);
  readonly equipment = signal<FgasEquipment[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly filter = signal<Bucket | 'soon'>('soon');

  readonly greeting = computed(() => {
    const first = this.auth.session()?.name?.trim().split(/\s+/)[0];
    const hour = new Date().getHours();
    const part = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
    return first ? `${part}, ${first}` : 'Operasyon merkezi';
  });

  /** Active equipment with a next check date, earliest first. */
  readonly schedule = computed<ScheduleRow[]>(() => {
    const today = this.startOfDay(new Date());
    return this.equipment()
      .filter((item) => item.status !== 'out-of-service' && item.nextLeakCheckDueAt)
      .map((item) => {
        const days = Math.round((this.isoDay(item.nextLeakCheckDueAt!) - today) / DAY);
        const bucket: Bucket =
          days < 0 ? 'overdue' : days <= 7 ? 'week' : days <= 31 ? 'month' : 'later';
        return { equipment: item, days, bucket };
      })
      .sort((a, b) => a.days - b.days);
  });
  readonly unscheduled = computed(
    () =>
      this.equipment().filter(
        (item) => item.status !== 'out-of-service' && !item.nextLeakCheckDueAt,
      ).length,
  );
  private readonly counts = computed(() => {
    const rows = this.schedule();
    const count = (bucket: Bucket) => rows.filter((row) => row.bucket === bucket).length;
    return { overdue: count('overdue'), week: count('week'), month: count('month') };
  });
  readonly tabs = computed(() => {
    const c = this.counts();
    return [
      { key: 'soon' as const, label: '30 gün', count: c.overdue + c.week + c.month },
      { key: 'overdue' as const, label: 'Gecikmiş', count: c.overdue },
      { key: 'week' as const, label: 'Bu hafta', count: c.week },
      {
        key: 'later' as const,
        label: 'Sonra',
        count: this.schedule().length - c.overdue - c.week - c.month,
      },
    ];
  });
  readonly visibleRows = computed(() => {
    const filter = this.filter();
    return this.schedule().filter((row) =>
      filter === 'soon' ? row.bucket !== 'later' : row.bucket === filter,
    );
  });
  readonly emptyText = computed(
    () =>
      ({
        soon: 'Önümüzdeki 30 günde kontrol yok. Takvim güncel.',
        overdue: 'Geciken kontrol yok.',
        week: 'Bu hafta kontrol yok.',
        month: 'Bu ay kontrol yok.',
        later: 'İleri tarihli kontrol yok.',
      })[this.filter()],
  );
  readonly stats = computed(() => {
    const d = this.dashboard();
    if (!d) return [];
    const c = this.counts();
    return [
      {
        label: 'Gecikmiş kontrol',
        value: c.overdue,
        note: c.overdue ? 'Yasal tarihi geçti' : 'Takvim güncel',
        tone: c.overdue ? '!text-rose-600 dark:!text-rose-400' : '',
        link: '/leak-checks',
      },
      {
        label: '30 gün içinde',
        value: c.week + c.month,
        note: `${c.week} tanesi bu hafta`,
        tone: c.week ? '!text-amber-600 dark:!text-amber-400' : '',
        link: '/leak-checks',
      },
      {
        label: 'Ekipman',
        value: d.totalEquipment,
        note: `${d.activeEquipment} aktif`,
        tone: '',
        link: '/equipment',
      },
      {
        label: 'CO₂ eşdeğeri',
        value: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(
          d.co2EquivalentTonnes,
        ),
        note: 'ton CO₂e toplam',
        tone: '',
        link: '/equipment',
      },
    ];
  });
  readonly readiness = computed<ReadinessItem[]>(() => {
    const d = this.dashboard();
    if (!d) return [];
    const overdue = this.counts().overdue;
    const open = d.pendingActions + d.actionRequired;
    return [
      {
        label: 'Ekipman envanteri',
        hint: d.totalEquipment ? `${d.totalEquipment} ekipman kayıtlı` : 'Henüz ekipman eklenmedi',
        ok: d.totalEquipment > 0,
        link: '/equipment',
      },
      {
        label: 'Gecikmesiz kontrol takvimi',
        hint: overdue ? `${overdue} ekipmanın kontrolü gecikmiş` : 'Tüm kontroller zamanında',
        ok: d.totalEquipment > 0 && overdue === 0,
        link: '/leak-checks',
      },
      {
        label: 'Kapanmış bulgular',
        hint: open ? `${open} açık aksiyon var` : 'Açık aksiyon yok',
        ok: open === 0,
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

  constructor() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      const [dashboard, list] = await Promise.all([this.api.dashboard(), this.api.list()]);
      this.dashboard.set(dashboard);
      this.equipment.set(list.items);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Veri alınamadı.');
    } finally {
      this.loading.set(false);
    }
  }
  relative(days: number): string {
    if (days < 0) return `${-days} gün gecikti`;
    if (days === 0) return 'Bugün';
    if (days === 1) return 'Yarın';
    return `${days} gün kaldı`;
  }
  dueClass(bucket: Bucket): string {
    return {
      overdue: 'text-rose-600 dark:text-rose-400',
      week: 'text-amber-600 dark:text-amber-400',
      month: 'text-slate-600 dark:text-slate-300',
      later: 'text-slate-500 dark:text-slate-400',
    }[bucket];
  }
  barClass(bucket: Bucket): string {
    return {
      overdue: 'bg-rose-500',
      week: 'bg-amber-400',
      month: 'bg-brand-400',
      later: 'bg-slate-200 dark:bg-slate-700',
    }[bucket];
  }
  formatDate(value: string): string {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(this.isoDay(value));
  }
  /** Midnight UTC of a YYYY-MM-DD date, so the day never shifts with the time zone. */
  private isoDay(value: string): number {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  }
  private startOfDay(date: Date): number {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
