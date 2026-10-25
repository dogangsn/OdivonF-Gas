import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  form,
  min,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import Swal from 'sweetalert2';
import { PageHeader } from '../../shared/ui/page-header';
import { SlideOver } from '../../shared/ui/slide-over';
import {
  AuditEntry,
  EquipmentDraft,
  FgasApiError,
  FgasEquipment,
  FgasEquipmentApi,
  InspectionInterval,
} from './fgas-equipment.api';

const EMPTY_DRAFT: EquipmentDraft = {
  name: '',
  location: '',
  equipmentCode: '',
  equipmentType: 'stationary-refrigeration',
  manufacturer: '',
  model: '',
  serialNumber: '',
  refrigerant: '',
  refrigerantChargeKg: 0,
  co2EquivalentTonnes: 0,
  hermeticallySealed: false,
  leakDetectionSystem: false,
  installationDate: '',
  lastLeakCheckAt: '',
  nextLeakCheckDueAt: '',
  responsiblePerson: '',
  inspectionIntervalMonths: 12,
  notes: '',
  status: 'active',
};

@Component({
  selector: 'app-equipment-page',
  imports: [PageHeader, SlideOver, FormField, DecimalPipe],
  template: `
    <div class="space-y-6">
      <app-page-header
        eyebrow="F-GAS UYUM MERKEZİ"
        title="Ekipman Envanteri"
        description="Florlu sera gazı içeren ekipmanların teknik kimliğini, gaz yükünü ve yasal kontrol takvimini yönetin."
      >
        <button actions type="button" class="odv-btn-primary" (click)="openCreate()">
          <span class="material-symbols-rounded">add</span>Ekipman ekle
        </button>
      </app-page-header>

      @if (dashboard(); as stats) {
        <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="F-Gas göstergeleri">
          <article class="odv-card bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white">
            <span class="text-xs font-extrabold uppercase tracking-wider text-white/75"
              >Toplam ekipman</span
            >
            <strong class="mt-3 block text-4xl font-black">{{ stats.totalEquipment }}</strong>
            <span class="mt-2 block text-xs text-white/75"
              >{{ stats.activeEquipment }} aktif varlık</span
            >
          </article>
          <article class="odv-card p-5">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500"
              >Aksiyon gerekli</span
            ><strong class="mt-3 block text-4xl font-black text-amber-600">{{
              stats.actionRequired
            }}</strong
            ><span class="mt-2 block text-xs text-slate-500">Teknik inceleme bekleyen</span>
          </article>
          <article class="odv-card p-5">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500"
              >Geciken kontrol</span
            ><strong class="mt-3 block text-4xl font-black text-rose-600">{{
              stats.overdueLeakChecks
            }}</strong
            ><span class="mt-2 block text-xs text-slate-500">Yasal tarihi aşan kayıt</span>
          </article>
          <article class="odv-card p-5">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500"
              >Toplam CO₂ eşdeğeri</span
            ><strong class="mt-3 block text-4xl font-black text-sky-600">{{
              stats.co2EquivalentTonnes | number: '1.0-2'
            }}</strong
            ><span class="mt-2 block text-xs text-slate-500"
              >ton CO₂e · {{ stats.refrigerantChargeKg | number: '1.0-2' }} kg gaz</span
            >
          </article>
        </section>
      }

      <section class="odv-card overflow-hidden">
        <div
          class="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-xs font-bold"
              [class.bg-white]="!archived()"
              [class.shadow-sm]="!archived()"
              (click)="setArchive(false)"
            >
              Aktif kayıtlar
            </button>
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-xs font-bold"
              [class.bg-white]="archived()"
              [class.shadow-sm]="archived()"
              (click)="setArchive(true)"
            >
              Arşiv
            </button>
          </div>
          <label class="relative block lg:w-96"
            ><span class="sr-only">Ekipman ara</span
            ><span
              class="material-symbols-rounded pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
              >search</span
            ><input
              class="odv-input ps-10"
              type="search"
              placeholder="Ad, ekipman kodu, seri no veya lokasyon…"
              [value]="search()"
              (input)="search.set($any($event.target).value)"
              (keyup.enter)="reload()"
          /></label>
        </div>

        @if (loading()) {
          <div class="grid min-h-64 place-items-center" role="status">
            <div class="text-center">
              <span class="material-symbols-rounded animate-spin text-4xl text-violet-600"
                >progress_activity</span
              >
              <p class="text-sm font-semibold text-slate-500">Ekipmanlar MainAPI’den yükleniyor…</p>
            </div>
          </div>
        } @else if (error()) {
          <div class="mx-auto max-w-xl p-10 text-center" role="alert">
            <span class="material-symbols-rounded text-5xl text-rose-500">cloud_off</span>
            <h2 class="mb-2 mt-4 text-xl font-black">Verilere ulaşılamadı</h2>
            <p class="text-sm leading-6 text-slate-500">{{ error() }}</p>
            <button type="button" class="odv-btn-primary mt-4" (click)="reload()">
              <span class="material-symbols-rounded">refresh</span>Tekrar dene
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto custom-scroll">
            <table class="w-full min-w-[1100px]">
              <thead>
                <tr>
                  <th class="odv-th">Ekipman</th>
                  <th class="odv-th">Gaz yükü</th>
                  <th class="odv-th">Lokasyon</th>
                  <th class="odv-th">Sonraki kontrol</th>
                  <th class="odv-th">Sorumlu</th>
                  <th class="odv-th">Durum</th>
                  <th class="odv-th text-end">İşlem</th>
                </tr>
              </thead>
              <tbody>
                @for (row of equipment(); track row.id) {
                  <tr class="hover:bg-violet-50/40 dark:hover:bg-slate-800/60">
                    <td class="odv-td">
                      <button type="button" class="text-start" (click)="openEdit(row)">
                        <strong class="block text-slate-950 dark:text-white">{{ row.name }}</strong
                        ><span class="font-mono text-[11px] text-slate-400"
                          >{{ row.equipmentCode || 'Kod yok' }} ·
                          {{ row.serialNumber || 'Seri no yok' }}</span
                        >
                      </button>
                    </td>
                    <td class="odv-td">
                      <strong>{{ row.refrigerant || '—' }}</strong
                      ><span class="block text-xs text-slate-500"
                        >{{ row.refrigerantChargeKg ?? 0 }} kg ·
                        {{ row.co2EquivalentTonnes ?? 0 }} t CO₂e</span
                      >
                    </td>
                    <td class="odv-td text-slate-600 dark:text-slate-300">{{ row.location }}</td>
                    <td class="odv-td">
                      <span [class.text-rose-600]="isOverdue(row)">{{
                        row.nextLeakCheckDueAt ? formatDate(row.nextLeakCheckDueAt) : 'Planlanmadı'
                      }}</span
                      ><span class="block text-xs text-slate-400">{{
                        row.inspectionIntervalMonths
                          ? row.inspectionIntervalMonths + ' ay periyot'
                          : 'Periyot yok'
                      }}</span>
                    </td>
                    <td class="odv-td text-slate-600 dark:text-slate-300">
                      {{ row.responsiblePerson || 'Atanmadı' }}
                    </td>
                    <td class="odv-td">
                      <span [class]="statusClass(row.status)">{{ statusLabel(row.status) }}</span>
                    </td>
                    <td class="odv-td text-end">
                      <button
                        type="button"
                        class="odv-icon-btn"
                        aria-label="Kaydı düzenle"
                        (click)="openEdit(row)"
                      >
                        <span class="material-symbols-rounded">edit</span></button
                      ><button
                        type="button"
                        class="odv-icon-btn"
                        [attr.aria-label]="archived() ? 'Kaydı geri yükle' : 'Kaydı arşivle'"
                        (click)="toggleArchive(row)"
                      >
                        <span class="material-symbols-rounded">{{
                          archived() ? 'unarchive' : 'archive'
                        }}</span>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="p-14 text-center">
                      <span class="material-symbols-rounded text-5xl text-slate-300"
                        >inventory_2</span
                      >
                      <h3 class="mb-1 mt-3 text-lg font-black">Kayıt bulunamadı</h3>
                      <p class="m-0 text-sm text-slate-500">
                        Filtreyi değiştirin veya ilk ekipmanı ekleyin.
                      </p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>

    <app-slide-over
      [open]="drawerOpen()"
      [wide]="true"
      [dirty]="equipmentForm().dirty()"
      [submitting]="saving()"
      [title]="selected() ? 'Ekipmanı düzenle' : 'Yeni F-Gas ekipmanı'"
      description="Teknik kimlik, gaz yükü ve sızıntı kontrol planı"
      eyebrow="F-GAS ENVANTERİ"
      icon="ac_unit"
      [submitLabel]="selected() ? 'Değişiklikleri kaydet' : 'Ekipmanı oluştur'"
      (closed)="closeDrawer()"
      (submitted)="save()"
    >
      @if (saveError()) {
        <div
          role="alert"
          class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
        >
          {{ saveError() }}
        </div>
      }
      <section class="odv-card p-5 sm:p-6">
        <h3 class="m-0 text-base font-black">Kimlik ve konum</h3>
        <p class="mt-1 text-xs text-slate-500">Sahada ekipmanı tekil olarak tanımlayan bilgiler.</p>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="sm:col-span-2"
            ><span class="mb-1.5 block text-xs font-bold">Ekipman adı *</span
            ><input class="odv-input" [formField]="equipmentForm.name" />
            @if (equipmentForm.name().touched() && equipmentForm.name().invalid()) {
              <span class="mt-1 block text-xs text-rose-600">En az 3 karakter girin.</span>
            }
          </label>
          <label
            ><span class="mb-1.5 block text-xs font-bold">Ekipman kodu</span
            ><input class="odv-input" [formField]="equipmentForm.equipmentCode"
          /></label>
          <label
            ><span class="mb-1.5 block text-xs font-bold">Ekipman türü *</span
            ><select class="odv-input" [formField]="equipmentForm.equipmentType">
              <option value="stationary-refrigeration">Sabit soğutma</option>
              <option value="air-conditioning">İklimlendirme</option>
              <option value="heat-pump">Isı pompası</option>
              <option value="transport-refrigeration">Taşıma soğutması</option>
              <option value="fire-protection">Yangın koruma</option>
              <option value="switchgear">Elektrik şalt</option>
              <option value="other">Diğer</option>
            </select></label
          >
          <label class="sm:col-span-2"
            ><span class="mb-1.5 block text-xs font-bold">Lokasyon / tesis *</span
            ><input class="odv-input" [formField]="equipmentForm.location"
          /></label>
          <label
            ><span class="mb-1.5 block text-xs font-bold">Üretici</span
            ><input class="odv-input" [formField]="equipmentForm.manufacturer" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Model</span
            ><input class="odv-input" [formField]="equipmentForm.model" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Seri numarası</span
            ><input class="odv-input" [formField]="equipmentForm.serialNumber" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Kurulum tarihi</span
            ><input class="odv-input" type="date" [formField]="equipmentForm.installationDate"
          /></label>
        </div>
      </section>
      <section class="odv-card p-5 sm:p-6">
        <h3 class="m-0 text-base font-black">Gaz ve CO₂ eşdeğeri</h3>
        <p class="mt-1 text-xs text-slate-500">
          Yasal eşik ve kontrol sıklığını belirleyen gaz bilgileri.
        </p>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label
            ><span class="mb-1.5 block text-xs font-bold">Soğutucu akışkan</span
            ><input
              class="odv-input"
              placeholder="Örn. R-32"
              [formField]="equipmentForm.refrigerant" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Gaz yükü (kg)</span
            ><input
              class="odv-input"
              type="number"
              step="0.001"
              [formField]="equipmentForm.refrigerantChargeKg" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">CO₂ eşdeğeri (ton)</span
            ><input
              class="odv-input"
              type="number"
              step="0.001"
              [formField]="equipmentForm.co2EquivalentTonnes" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Kontrol periyodu</span
            ><input
              class="odv-input"
              type="number"
              step="3"
              placeholder="3, 6, 12 veya 24"
              [formField]="equipmentForm.inspectionIntervalMonths"
          /></label>
          <label
            class="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            ><input type="checkbox" [formField]="equipmentForm.hermeticallySealed" /><span
              class="text-sm font-bold"
              >Hermetik kapalı</span
            ></label
          ><label
            class="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            ><input type="checkbox" [formField]="equipmentForm.leakDetectionSystem" /><span
              class="text-sm font-bold"
              >Sızıntı algılama sistemi var</span
            ></label
          >
        </div>
      </section>
      <section class="odv-card p-5 sm:p-6">
        <h3 class="m-0 text-base font-black">Kontrol planı ve sorumluluk</h3>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label
            ><span class="mb-1.5 block text-xs font-bold">Son kontrol tarihi</span
            ><input
              class="odv-input"
              type="date"
              [formField]="equipmentForm.lastLeakCheckAt" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Sonraki kontrol tarihi</span
            ><input
              class="odv-input"
              type="date"
              [formField]="equipmentForm.nextLeakCheckDueAt" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Sorumlu kişi</span
            ><input class="odv-input" [formField]="equipmentForm.responsiblePerson" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Durum</span
            ><select class="odv-input" [formField]="equipmentForm.status">
              <option value="active">Aktif</option>
              <option value="action-required">Aksiyon gerekli</option>
              <option value="out-of-service">Hizmet dışı</option>
            </select></label
          ><label class="sm:col-span-2"
            ><span class="mb-1.5 block text-xs font-bold">Teknik notlar</span
            ><textarea class="odv-input min-h-28" [formField]="equipmentForm.notes"></textarea>
          </label>
        </div>
      </section>
      @if (selected() && audit().length) {
        <section class="odv-card p-5 sm:p-6">
          <h3 class="m-0 text-base font-black">Değişmez denetim izi</h3>
          <ol class="mt-4 space-y-3">
            @for (entry of audit(); track entry.id) {
              <li class="flex items-start justify-between gap-4 border-s border-violet-300 ps-4">
                <div>
                  <strong class="block text-sm">{{ auditLabel(entry) }}</strong
                  ><span class="text-xs text-slate-500"
                    >Sürüm {{ entry.version }} · {{ entry.actorId }}</span
                  >
                </div>
                <time class="text-xs text-slate-400">{{ formatDateTime(entry.createdAt) }}</time>
              </li>
            }
          </ol>
        </section>
      }
    </app-slide-over>
  `,
})
export class EquipmentPage {
  private readonly api = inject(FgasEquipmentApi);
  readonly equipment = signal<FgasEquipment[]>([]);
  readonly dashboard = signal<Awaited<ReturnType<FgasEquipmentApi['dashboard']>> | null>(null);
  readonly audit = signal<AuditEntry[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly saveError = signal('');
  readonly archived = signal(false);
  readonly search = signal('');
  readonly drawerOpen = signal(false);
  readonly selected = signal<FgasEquipment | null>(null);
  readonly draft = signal<EquipmentDraft>({ ...EMPTY_DRAFT });
  readonly equipmentForm = form(this.draft, (p) => {
    required(p.name);
    minLength(p.name, 3);
    required(p.location);
    minLength(p.location, 2);
    required(p.equipmentType);
    min(p.refrigerantChargeKg, 0);
    min(p.co2EquivalentTonnes, 0);
    validate(p.inspectionIntervalMonths, ({ value }) =>
      ([3, 6, 12, 24] as number[]).includes(value())
        ? undefined
        : { kind: 'interval', message: 'Kontrol periyodu 3, 6, 12 veya 24 ay olmalıdır.' },
    );
  });

  constructor() {
    void this.reload();
  }
  async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const [list, stats] = await Promise.all([
        this.api.list({ search: this.search(), archived: this.archived() }),
        this.api.dashboard(),
      ]);
      this.equipment.set(list.items);
      this.dashboard.set(stats);
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.loading.set(false);
    }
  }
  setArchive(value: boolean): void {
    this.archived.set(value);
    void this.reload();
  }
  openCreate(): void {
    this.selected.set(null);
    this.audit.set([]);
    this.draft.set({ ...EMPTY_DRAFT });
    this.equipmentForm().reset();
    this.drawerOpen.set(true);
  }
  async openEdit(row: FgasEquipment): Promise<void> {
    this.selected.set(row);
    this.saveError.set('');
    this.draft.set({
      name: row.name,
      location: row.location,
      equipmentCode: row.equipmentCode ?? '',
      equipmentType: row.equipmentType,
      manufacturer: row.manufacturer ?? '',
      model: row.model ?? '',
      serialNumber: row.serialNumber ?? '',
      refrigerant: row.refrigerant ?? '',
      refrigerantChargeKg: row.refrigerantChargeKg ?? 0,
      co2EquivalentTonnes: row.co2EquivalentTonnes ?? 0,
      hermeticallySealed: row.hermeticallySealed,
      leakDetectionSystem: row.leakDetectionSystem,
      installationDate: row.installationDate?.slice(0, 10) ?? '',
      lastLeakCheckAt: row.lastLeakCheckAt?.slice(0, 10) ?? '',
      nextLeakCheckDueAt: row.nextLeakCheckDueAt?.slice(0, 10) ?? '',
      responsiblePerson: row.responsiblePerson ?? '',
      inspectionIntervalMonths: row.inspectionIntervalMonths ?? 12,
      notes: row.notes ?? '',
      status: row.status,
    });
    this.equipmentForm().reset(this.draft());
    this.drawerOpen.set(true);
    try {
      this.audit.set(await this.api.audit(row.id));
    } catch {
      this.audit.set([]);
    }
  }
  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selected.set(null);
    this.saveError.set('');
  }
  save(): void {
    submit(this.equipmentForm, async () => {
      this.saving.set(true);
      this.saveError.set('');
      try {
        const current = this.selected();
        if (current) await this.api.update(current.id, current.version, this.draft());
        else await this.api.create(this.draft());
        this.closeDrawer();
        await this.reload();
        await Swal.fire({
          title: 'Kayıt tamamlandı',
          text: 'Ekipman ve denetim izi MainAPI üzerinde güncellendi.',
          icon: 'success',
          confirmButtonText: 'Tamam',
          customClass: { popup: 'odv-swal-popup', confirmButton: 'odv-swal-confirm' },
        });
      } catch (error) {
        this.saveError.set(this.message(error));
      } finally {
        this.saving.set(false);
      }
    });
  }
  async toggleArchive(row: FgasEquipment): Promise<void> {
    const result = await Swal.fire({
      title: this.archived() ? 'Ekipman geri yüklensin mi?' : 'Ekipman arşivlensin mi?',
      text: 'Kayıt silinmez; denetim izi korunur.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.archived() ? 'Geri yükle' : 'Arşivle',
      cancelButtonText: 'Vazgeç',
      customClass: {
        popup: 'odv-swal-popup',
        confirmButton: 'odv-swal-danger',
        cancelButton: 'odv-swal-cancel',
      },
    });
    if (!result.isConfirmed) return;
    try {
      if (this.archived()) await this.api.restore(row.id);
      else await this.api.archive(row.id);
      await this.reload();
    } catch (error) {
      await Swal.fire('İşlem tamamlanamadı', this.message(error), 'error');
    }
  }
  isOverdue(row: FgasEquipment): boolean {
    return Boolean(
      row.nextLeakCheckDueAt &&
      row.nextLeakCheckDueAt.slice(0, 10) < new Date().toISOString().slice(0, 10),
    );
  }
  statusLabel(status: FgasEquipment['status']): string {
    return {
      active: 'Aktif',
      'action-required': 'Aksiyon gerekli',
      'out-of-service': 'Hizmet dışı',
    }[status];
  }
  statusClass(status: FgasEquipment['status']): string {
    return status === 'active'
      ? 'odv-badge-success'
      : status === 'action-required'
        ? 'odv-badge-warning'
        : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600';
  }
  formatDate(value: string): string {
    return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(value));
  }
  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(
      new Date(value),
    );
  }
  auditLabel(entry: AuditEntry): string {
    return (
      {
        'fgas.record.created': 'Ekipman oluşturuldu',
        'fgas.record.updated': 'Ekipman güncellendi',
        'fgas.record.archived': 'Ekipman arşivlendi',
        'fgas.record.restored': 'Ekipman geri yüklendi',
      }[entry.event] ?? entry.event
    );
  }
  private message(error: unknown): string {
    if (error instanceof FgasApiError) {
      if (error.status === 401)
        return 'Oturum doğrulanamadı. Firebase kimlik yapılandırmasını kontrol edip yeniden giriş yapın.';
      if (error.status === 403) return 'Bu işlem için F-Gas yetkiniz bulunmuyor.';
      if (error.status === 409)
        return 'Kayıt başka bir kullanıcı tarafından değiştirildi. Listeyi yenileyip tekrar deneyin.';
      return `${error.message}${error.requestId ? ` (İstek: ${error.requestId})` : ''}`;
    }
    return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
  }
}
