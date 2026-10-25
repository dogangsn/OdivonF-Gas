import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, minLength, required, submit } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { PageHeader } from '../../shared/ui/page-header';
import { SlideOver } from '../../shared/ui/slide-over';
import {
  FgasOperation,
  FgasOperationsApi,
  OperationDraft,
  OperationKind,
  OperationStatus,
} from './fgas-operations.api';

const EMPTY: OperationDraft = {
  title: '',
  reference: '',
  equipmentId: '',
  location: '',
  occurredAt: '',
  dueAt: '',
  status: 'draft',
  technicianName: '',
  certificateNumber: '',
  certificateCategory: '',
  certificateExpiresAt: '',
  refrigerant: '',
  quantityKg: 0,
  movementType: 'charge',
  result: 'pass',
  leakDetected: false,
  repairRequired: false,
  followUpDueAt: '',
  notes: '',
  evidenceRefs: '',
};
const CONFIG: Record<
  OperationKind,
  { eyebrow: string; title: string; description: string; create: string; icon: string }
> = {
  'leak-check': {
    eyebrow: 'YASAL KONTROL PLANI',
    title: 'Sızıntı Kontrolleri',
    description:
      'Kontrol periyotlarını, ölçüm sonuçlarını, onarım ve takip kontrollerini değişmez denetim iziyle yönetin.',
    create: 'Kontrol planla',
    icon: 'troubleshoot',
  },
  'gas-movement': {
    eyebrow: 'SOĞUTUCU AKIŞKAN DEFTERİ',
    title: 'Gaz Hareketleri',
    description:
      'Dolum, geri kazanım, transfer ve bertaraf miktarlarını ekipman ve teknisyen bazında izleyin.',
    create: 'Hareket kaydet',
    icon: 'swap_horiz',
  },
  technician: {
    eyebrow: 'YETKİNLİK VE SERTİFİKA',
    title: 'Teknisyenler',
    description:
      'Teknisyen yetkinliklerini, sertifika kapsamını ve geçerlilik sürelerini kontrol altında tutun.',
    create: 'Teknisyen ekle',
    icon: 'engineering',
  },
  inspection: {
    eyebrow: 'DENETİME HAZIRLIK',
    title: 'Denetim ve Raporlar',
    description:
      'İç ve resmî denetimleri, bulguları, kanıtları ve takip aksiyonlarını tek kayıtta yönetin.',
    create: 'Denetim oluştur',
    icon: 'verified',
  },
};
@Component({
  selector: 'app-operation-page',
  imports: [PageHeader, SlideOver, FormField, DatePipe, DecimalPipe],
  template: `
    <div class="space-y-6">
      <app-page-header
        [eyebrow]="config.eyebrow"
        [title]="config.title"
        [description]="config.description"
        ><button actions type="button" class="odv-btn-primary" (click)="openCreate()">
          <span class="material-symbols-rounded">add</span>{{ config.create }}
        </button>
        @if (kind === 'inspection') {
          <button actions type="button" class="odv-btn-soft" (click)="exportReport()">
            <span class="material-symbols-rounded">download</span>Denetim paketini indir
          </button>
        }
      </app-page-header>
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Operasyon göstergeleri">
        <article class="odv-card bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white">
          <span class="text-xs font-extrabold uppercase tracking-wider text-white/75"
            >Toplam aktif kayıt</span
          ><strong class="mt-3 block text-4xl font-black">{{ rows().length }}</strong
          ><span class="mt-2 block text-xs text-white/75">MainAPI ile senkronize</span>
        </article>
        <article class="odv-card p-5">
          <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500"
            >Tamamlanan</span
          ><strong class="mt-3 block text-4xl font-black text-emerald-600">{{ completed() }}</strong
          ><span class="mt-2 block text-xs text-slate-500">Kanıtı kapanmış kayıt</span>
        </article>
        <article class="odv-card p-5">
          <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500"
            >Aksiyon gerekli</span
          ><strong class="mt-3 block text-4xl font-black text-amber-600">{{
            actionRequired()
          }}</strong
          ><span class="mt-2 block text-xs text-slate-500">Takip bekleyen bulgu</span>
        </article>
        <article class="odv-card p-5">
          <span class="text-xs font-extrabold uppercase tracking-wider text-slate-500"
            >Vadesi geçen</span
          ><strong class="mt-3 block text-4xl font-black text-rose-600">{{ overdue() }}</strong
          ><span class="mt-2 block text-xs text-slate-500">Bugünden önce kalan</span>
        </article>
      </section>
      <section class="odv-card overflow-hidden">
        <div
          class="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 lg:flex-row lg:items-center"
        >
          <div class="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-xs font-bold"
              [class.bg-white]="!archived()"
              (click)="setArchived(false)"
            >
              Aktif</button
            ><button
              type="button"
              class="rounded-lg px-4 py-2 text-xs font-bold"
              [class.bg-white]="archived()"
              (click)="setArchived(true)"
            >
              Arşiv
            </button>
          </div>
          <label class="relative flex-1"
            ><span class="sr-only">Kayıtlarda ara</span
            ><span
              class="material-symbols-rounded pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
              >search</span
            ><input
              class="odv-input ps-10"
              type="search"
              placeholder="Başlık, referans, lokasyon veya teknisyen ara…"
              [value]="search()"
              (input)="search.set($any($event.target).value)"
              (keyup.enter)="load()"
          /></label>
          <select
            class="odv-input !w-auto"
            aria-label="Durum filtresi"
            [value]="status()"
            (change)="status.set($any($event.target).value); load()"
          >
            <option value="">Tüm durumlar</option>
            <option value="draft">Taslak</option>
            <option value="scheduled">Planlandı</option>
            <option value="completed">Tamamlandı</option>
            <option value="action-required">Aksiyon gerekli</option>
            <option value="expired">Süresi doldu</option>
          </select>
        </div>
        @if (loading()) {
          <div class="grid min-h-64 place-items-center" role="status">
            <span class="material-symbols-rounded animate-spin text-4xl text-violet-600"
              >progress_activity</span
            >
          </div>
        } @else if (error()) {
          <div role="alert" class="p-12 text-center">
            <span class="material-symbols-rounded text-5xl text-rose-500">cloud_off</span>
            <h2 class="mt-3 text-xl font-black">Veriler alınamadı</h2>
            <p class="text-sm text-slate-500">{{ error() }}</p>
            <button class="odv-btn-primary mt-3" type="button" (click)="load()">Tekrar dene</button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full min-w-[1050px]">
              <thead>
                <tr>
                  <th class="odv-th">Kayıt</th>
                  <th class="odv-th">Referans / ekipman</th>
                  <th class="odv-th">Teknisyen / gaz</th>
                  <th class="odv-th">Tarih / vade</th>
                  <th class="odv-th">Durum</th>
                  <th class="odv-th text-end">İşlem</th>
                </tr>
              </thead>
              <tbody>
                @for (row of rows(); track row.id) {
                  <tr class="hover:bg-violet-50/40 dark:hover:bg-slate-800/60">
                    <td class="odv-td">
                      <button class="text-start" type="button" (click)="openEdit(row)">
                        <strong class="block">{{ row.title }}</strong
                        ><span class="text-xs text-slate-500">{{
                          row.location || 'Lokasyon belirtilmedi'
                        }}</span>
                      </button>
                    </td>
                    <td class="odv-td">
                      <span class="font-mono text-xs">{{ row.reference || '—' }}</span
                      ><span class="block text-xs text-slate-500">{{
                        row.equipmentId || 'Ekipman bağlantısı yok'
                      }}</span>
                    </td>
                    <td class="odv-td">
                      <span>{{ row.technicianName || 'Atanmadı' }}</span
                      ><span class="block text-xs text-slate-500"
                        >{{ row.refrigerant || '—' }}
                        @if (row.quantityKg) {
                          · {{ row.quantityKg | number: '1.0-3' }} kg
                        }
                      </span>
                    </td>
                    <td class="odv-td">
                      <span>{{
                        row.occurredAt ? (row.occurredAt | date: 'dd.MM.yyyy') : 'Planlanmadı'
                      }}</span
                      ><span class="block text-xs" [class.text-rose-600]="isOverdue(row)">{{
                        row.dueAt ? 'Vade: ' + (row.dueAt | date: 'dd.MM.yyyy') : 'Vade yok'
                      }}</span>
                    </td>
                    <td class="odv-td">
                      <span [class]="statusClass(row.status)">{{ statusLabel(row.status) }}</span>
                    </td>
                    <td class="odv-td text-end">
                      <button
                        class="odv-icon-btn"
                        type="button"
                        aria-label="Düzenle"
                        (click)="openEdit(row)"
                      >
                        <span class="material-symbols-rounded">edit</span></button
                      ><button
                        class="odv-icon-btn"
                        type="button"
                        [attr.aria-label]="archived() ? 'Geri yükle' : 'Arşivle'"
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
                    <td colspan="6" class="p-14 text-center">
                      <span class="material-symbols-rounded text-5xl text-slate-300">{{
                        config.icon
                      }}</span>
                      <h3 class="mb-1 mt-3 text-lg font-black">Henüz kayıt yok</h3>
                      <p class="m-0 text-sm text-slate-500">
                        İlk doğrulanabilir operasyon kaydını oluşturun.
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
      [dirty]="operationForm().dirty()"
      [submitting]="saving()"
      [title]="selected() ? 'Kaydı düzenle' : config.create"
      [description]="config.description"
      [eyebrow]="config.eyebrow"
      [icon]="config.icon"
      [submitLabel]="selected() ? 'Değişiklikleri kaydet' : 'Kaydı oluştur'"
      (closed)="close()"
      (submitted)="save()"
    >
      @if (saveError()) {
        <div role="alert" class="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {{ saveError() }}
        </div>
      }
      <section class="odv-card p-5 sm:p-6">
        <h3 class="m-0 text-base font-black">Kayıt kimliği ve planlama</h3>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="sm:col-span-2"
            ><span class="mb-1.5 block text-xs font-bold">Başlık *</span
            ><input class="odv-input" [formField]="operationForm.title"
          /></label>
          <label
            ><span class="mb-1.5 block text-xs font-bold">Referans no</span
            ><input class="odv-input" [formField]="operationForm.reference" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Ekipman kimliği</span
            ><input class="odv-input" [formField]="operationForm.equipmentId"
          /></label>
          <label class="sm:col-span-2"
            ><span class="mb-1.5 block text-xs font-bold">Tesis / lokasyon</span
            ><input class="odv-input" [formField]="operationForm.location"
          /></label>
          <label
            ><span class="mb-1.5 block text-xs font-bold">İşlem tarihi</span
            ><input class="odv-input" type="date" [formField]="operationForm.occurredAt" /></label
          ><label
            ><span class="mb-1.5 block text-xs font-bold">Son tarih</span
            ><input class="odv-input" type="date" [formField]="operationForm.dueAt"
          /></label>
          <label
            ><span class="mb-1.5 block text-xs font-bold">Durum</span
            ><select class="odv-input" [formField]="operationForm.status">
              <option value="draft">Taslak</option>
              <option value="scheduled">Planlandı</option>
              <option value="completed">Tamamlandı</option>
              <option value="action-required">Aksiyon gerekli</option>
              <option value="expired">Süresi doldu</option>
            </select></label
          >
          <label
            ><span class="mb-1.5 block text-xs font-bold">Teknisyen</span
            ><input class="odv-input" [formField]="operationForm.technicianName"
          /></label>
        </div>
      </section>
      <section class="odv-card p-5 sm:p-6">
        <h3 class="m-0 text-base font-black">Teknik sonuç ve izlenebilirlik</h3>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          @if (kind === 'technician') {
            <label
              ><span class="mb-1.5 block text-xs font-bold">Sertifika numarası</span
              ><input class="odv-input" [formField]="operationForm.certificateNumber" /></label
            ><label
              ><span class="mb-1.5 block text-xs font-bold">Sertifika kategorisi</span
              ><input class="odv-input" [formField]="operationForm.certificateCategory" /></label
            ><label
              ><span class="mb-1.5 block text-xs font-bold">Geçerlilik tarihi</span
              ><input
                class="odv-input"
                type="date"
                [formField]="operationForm.certificateExpiresAt"
            /></label>
          }
          @if (kind === 'gas-movement' || kind === 'leak-check') {
            <label
              ><span class="mb-1.5 block text-xs font-bold">Soğutucu akışkan</span
              ><input
                class="odv-input"
                placeholder="R-32"
                [formField]="operationForm.refrigerant" /></label
            ><label
              ><span class="mb-1.5 block text-xs font-bold">Miktar (kg)</span
              ><input
                class="odv-input"
                type="number"
                step="0.001"
                [formField]="operationForm.quantityKg"
            /></label>
          }
          @if (kind === 'gas-movement') {
            <label
              ><span class="mb-1.5 block text-xs font-bold">Hareket türü</span
              ><select class="odv-input" [formField]="operationForm.movementType">
                <option value="charge">Dolum</option>
                <option value="recovery">Geri kazanım</option>
                <option value="transfer">Transfer</option>
                <option value="disposal">Bertaraf</option>
              </select></label
            >
          }
          @if (kind === 'leak-check' || kind === 'inspection') {
            <label
              ><span class="mb-1.5 block text-xs font-bold">Kontrol sonucu</span
              ><select class="odv-input" [formField]="operationForm.result">
                <option value="pass">Uygun</option>
                <option value="conditional">Şartlı uygun</option>
                <option value="fail">Uygun değil</option>
              </select></label
            ><label class="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
              ><input type="checkbox" [formField]="operationForm.leakDetected" /><span
                class="text-xs font-bold"
                >Sızıntı tespit edildi</span
              ></label
            ><label class="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
              ><input type="checkbox" [formField]="operationForm.repairRequired" /><span
                class="text-xs font-bold"
                >Onarım / düzeltici faaliyet gerekli</span
              ></label
            ><label
              ><span class="mb-1.5 block text-xs font-bold">Takip kontrol tarihi</span
              ><input class="odv-input" type="date" [formField]="operationForm.followUpDueAt"
            /></label>
          }
          <label class="sm:col-span-2"
            ><span class="mb-1.5 block text-xs font-bold">Kanıt / belge referansları</span
            ><input
              class="odv-input"
              placeholder="Belge numaralarını virgülle ayırın"
              [formField]="operationForm.evidenceRefs" /></label
          ><label class="sm:col-span-2"
            ><span class="mb-1.5 block text-xs font-bold">Teknik notlar</span
            ><textarea class="odv-input min-h-28" [formField]="operationForm.notes"></textarea>
          </label>
        </div>
      </section>
    </app-slide-over>
  `,
})
export class OperationPage {
  readonly kind = inject(ActivatedRoute).snapshot.data['kind'] as OperationKind;
  readonly config = CONFIG[this.kind];
  readonly rows = signal<FgasOperation[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');
  readonly status = signal('');
  readonly archived = signal(false);
  readonly drawerOpen = signal(false);
  readonly selected = signal<FgasOperation | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly completed = computed(() => this.rows().filter((x) => x.status === 'completed').length);
  readonly actionRequired = computed(
    () => this.rows().filter((x) => x.status === 'action-required').length,
  );
  readonly overdue = computed(() => this.rows().filter((x) => this.isOverdue(x)).length);
  readonly model = signal<OperationDraft>({ ...EMPTY });
  readonly operationForm = form(this.model, (p) => {
    required(p.title);
    minLength(p.title, 2);
  });
  private readonly api = inject(FgasOperationsApi);
  constructor() {
    void this.load();
  }
  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.rows.set(
        (
          await this.api.list(this.kind, {
            search: this.search(),
            archived: this.archived(),
            status: this.status(),
          })
        ).items,
      );
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Veriler alınamadı.');
    } finally {
      this.loading.set(false);
    }
  }
  setArchived(value: boolean) {
    this.archived.set(value);
    void this.load();
  }
  openCreate() {
    this.selected.set(null);
    this.model.set({ ...EMPTY });
    this.operationForm().reset();
    this.drawerOpen.set(true);
  }
  openEdit(row: FgasOperation) {
    this.selected.set(row);
    this.model.set({
      title: row.title,
      reference: row.reference ?? '',
      equipmentId: row.equipmentId ?? '',
      location: row.location ?? '',
      occurredAt: row.occurredAt?.slice(0, 10) ?? '',
      dueAt: row.dueAt?.slice(0, 10) ?? '',
      status: row.status,
      technicianName: row.technicianName ?? '',
      certificateNumber: row.certificateNumber ?? '',
      certificateCategory: row.certificateCategory ?? '',
      certificateExpiresAt: row.certificateExpiresAt?.slice(0, 10) ?? '',
      refrigerant: row.refrigerant ?? '',
      quantityKg: row.quantityKg ?? 0,
      movementType: row.movementType ?? 'charge',
      result: row.result ?? 'pass',
      leakDetected: row.leakDetected ?? false,
      repairRequired: row.repairRequired ?? false,
      followUpDueAt: row.followUpDueAt?.slice(0, 10) ?? '',
      notes: row.notes ?? '',
      evidenceRefs: row.evidenceRefs.join(', '),
    });
    this.operationForm().reset();
    this.drawerOpen.set(true);
  }
  close() {
    this.drawerOpen.set(false);
    this.selected.set(null);
    this.saveError.set('');
  }
  save() {
    submit(this.operationForm, async () => {
      this.saving.set(true);
      this.saveError.set('');
      try {
        const current = this.selected();
        if (current) await this.api.update(this.kind, current, this.model());
        else await this.api.create(this.kind, this.model());
        this.close();
        await this.load();
      } catch (e) {
        this.saveError.set(e instanceof Error ? e.message : 'Kayıt tamamlanamadı.');
      } finally {
        this.saving.set(false);
      }
    });
  }
  async toggleArchive(row: FgasOperation) {
    const result = await Swal.fire({
      title: this.archived() ? 'Kayıt geri yüklensin mi?' : 'Kayıt arşivlensin mi?',
      text: 'Denetim izi ve sürüm geçmişi korunacaktır.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.archived() ? 'Geri yükle' : 'Arşivle',
      cancelButtonText: 'Vazgeç',
      customClass: { confirmButton: 'odv-btn-primary', cancelButton: 'odv-btn-ghost' },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;
    try {
      if (this.archived()) await this.api.restore(this.kind, row.id);
      else await this.api.archive(this.kind, row.id);
      await this.load();
    } catch (e) {
      await Swal.fire(
        'İşlem tamamlanamadı',
        e instanceof Error ? e.message : 'Tekrar deneyin.',
        'error',
      );
    }
  }
  isOverdue(row: FgasOperation) {
    return Boolean(
      row.dueAt &&
      row.dueAt.slice(0, 10) < new Date().toISOString().slice(0, 10) &&
      row.status !== 'completed',
    );
  }
  statusLabel(status: OperationStatus) {
    return {
      draft: 'Taslak',
      scheduled: 'Planlandı',
      completed: 'Tamamlandı',
      'action-required': 'Aksiyon gerekli',
      expired: 'Süresi doldu',
    }[status];
  }
  statusClass(status: OperationStatus) {
    return status === 'completed'
      ? 'odv-badge-success'
      : status === 'action-required' || status === 'expired'
        ? 'odv-badge-danger'
        : status === 'scheduled'
          ? 'odv-badge-warning'
          : 'odv-badge-neutral';
  }
  async exportReport() {
    try {
      const report = await this.api.complianceReport();
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `odivon-fgas-denetim-paketi-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      await Swal.fire(
        'Rapor oluşturulamadı',
        error instanceof Error ? error.message : 'Tekrar deneyin.',
        'error',
      );
    }
  }
}
