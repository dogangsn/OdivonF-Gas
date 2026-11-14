import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarketingCta } from './marketing-cta';
import { MarketingFaq } from './marketing-faq';
import { CALCULATOR_FAQ } from './marketing-faq-content';
import {
  CALCULATOR_REFRIGERANTS,
  COMPONENT_GWP,
  co2EquivalentTonnes,
  leakCheckIntervalMonths,
  refrigerantGwp,
} from './refrigerants';

/** "R410A" → "R-410A", "R134A" → "R-134a", "R1234ZE" → "R-1234ze(E)". */
export function refrigerantLabel(key: string): string {
  if (key === 'SF6') return 'SF6';
  const match = /^R(\d+)([A-Z]*)$/.exec(key);
  if (!match) return key;
  const [, digits, suffix] = match;
  if (!suffix) return `R-${digits}`;
  if (!(key in COMPONENT_GWP)) return `R-${digits}${suffix}`;
  return `R-${digits}${suffix.toLowerCase()}${key === 'R1234ZE' ? '(E)' : ''}`;
}

@Component({
  selector: 'app-marketing-co2-calculator',
  imports: [DecimalPipe, RouterLink, MarketingCta, MarketingFaq],
  template: `
    <section class="mx-auto max-w-7xl px-4 pb-6 pt-14 sm:px-6">
      <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Ücretsiz araç</span>
      <h1
        class="mt-2 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white"
      >
        CO2 eşdeğeri hesaplama ve sızıntı kontrol periyodu
      </h1>
      <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
        Gaz türünü ve şarj miktarını girin. Ton CO2 eşdeğerini ve F-Gas Tüzüğü’ne göre sızıntı
        kontrolünü kaç ayda bir yapmanız gerektiğini anında görün.
      </p>
    </section>

    <section class="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_1fr]">
      <form class="odv-card space-y-5 p-6 sm:p-8" (submit)="$event.preventDefault()">
        <div>
          <label class="odv-label" for="calc-gas">Soğutucu gaz</label>
          <select id="calc-gas" class="odv-input" (change)="gas.set($any($event.target).value)">
            @for (key of refrigerants; track key) {
              <option [value]="key" [selected]="key === gas()">{{ label(key) }}</option>
            }
          </select>
        </div>
        <div>
          <label class="odv-label" for="calc-kg">Şarj miktarı (kg)</label>
          <input
            id="calc-kg"
            class="odv-input"
            type="number"
            inputmode="decimal"
            min="0"
            step="0.01"
            [value]="kg()"
            (input)="kg.set(toNumber($any($event.target).value))"
          />
        </div>
        <fieldset class="space-y-3">
          <legend class="odv-label">Ekipman özellikleri</legend>
          <label class="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              class="size-4 accent-indigo-600"
              [checked]="hermetic()"
              (change)="hermetic.set($any($event.target).checked)"
            />
            Hermetik olarak kapalı ve etiketli
          </label>
          <label class="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              class="size-4 accent-indigo-600"
              [checked]="detection()"
              (change)="detection.set($any($event.target).checked)"
            />
            Kaçak tespit sistemi kurulu
          </label>
        </fieldset>
      </form>

      <div
        class="rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-800 to-slate-950 p-6 text-white sm:p-8"
        aria-live="polite"
      >
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-200">Sonuç</span>
        <div class="mt-5 grid grid-cols-2 gap-4">
          <div class="rounded-2xl bg-white/10 p-5">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-200">GWP</span>
            <strong class="mt-2 block text-3xl font-black">{{
              gwp() | number: '1.0-3' : 'tr-TR'
            }}</strong>
          </div>
          <div class="rounded-2xl bg-white/10 p-5">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-200">Ton CO2e</span>
            <strong class="mt-2 block text-3xl font-black">{{
              tonnes() | number: '1.0-3' : 'tr-TR'
            }}</strong>
          </div>
        </div>
        <div class="mt-4 rounded-2xl bg-white/10 p-5">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-200"
            >Sızıntı kontrolü</span
          >
          <strong class="mt-2 block text-2xl font-black">{{ intervalText() }}</strong>
          <p class="mt-2 text-sm leading-6 text-indigo-100">{{ intervalNote() }}</p>
        </div>
        <a
          routerLink="/register"
          class="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-black text-indigo-700"
          >Tüm ekipmanlarınızı otomatik takip edin</a
        >
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
        Yaygın soğutucu gazların GWP değerleri
      </h2>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        AB 2024/573 Ek I esaslı 100 yıllık GWP değerleri. 5 ton CO2e eşiğine ulaşan şarj miktarı,
        periyodik sızıntı kontrolünün başladığı miktardır.
      </p>
      <div class="odv-card mt-6 overflow-x-auto">
        <table class="w-full min-w-[32rem] text-sm">
          <thead>
            <tr>
              <th scope="col" class="odv-th">Gaz</th>
              <th scope="col" class="odv-th">GWP</th>
              <th scope="col" class="odv-th">5 ton CO2e eşiği (kg)</th>
              <th scope="col" class="odv-th">50 ton CO2e eşiği (kg)</th>
            </tr>
          </thead>
          <tbody>
            @for (row of table; track row.key) {
              <tr class="odv-row">
                <th scope="row" class="odv-td text-start font-bold">{{ row.label }}</th>
                <td class="odv-td">{{ row.gwp | number: '1.0-3' : 'tr-TR' }}</td>
                <td class="odv-td">{{ row.kg5 }}</td>
                <td class="odv-td">{{ row.kg50 }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <app-marketing-faq [items]="faq" />
    <app-marketing-cta />
  `,
})
export class Co2CalculatorPage {
  readonly refrigerants = CALCULATOR_REFRIGERANTS;
  readonly faq = CALCULATOR_FAQ;
  readonly label = refrigerantLabel;
  readonly gas = signal<string>('R410A');
  readonly kg = signal(10);
  readonly hermetic = signal(false);
  readonly detection = signal(false);

  readonly gwp = computed(() => refrigerantGwp(this.gas()) ?? 0);
  readonly tonnes = computed(() => co2EquivalentTonnes(this.kg(), this.gwp()));
  readonly interval = computed(() =>
    leakCheckIntervalMonths({
      co2EquivalentTonnes: this.tonnes(),
      hermeticallySealed: this.hermetic(),
      leakDetectionSystem: this.detection(),
      equipmentType: 'stationary-refrigeration',
    }),
  );
  readonly intervalText = computed(() =>
    this.interval() ? `${this.interval()} ayda bir` : 'Periyodik kontrol zorunlu değil',
  );
  readonly intervalNote = computed(() => {
    const tonnes = this.tonnes();
    if (this.interval()) return 'AB 2024/573 Madde 5 eşiklerine göre hesaplandı.';
    if (this.hermetic() && tonnes >= 5)
      return 'Hermetik ve etiketli ekipmanlarda 10 ton CO2e altına periyodik kontrol gerekmez.';
    return 'Ekipman 5 ton CO2e altında. Kayıt ve bakım yükümlülükleri yine de geçerlidir.';
  });

  readonly table = CALCULATOR_REFRIGERANTS.map((key) => {
    const gwp = refrigerantGwp(key) ?? 0;
    const threshold = (tonnes: number) =>
      gwp >= 1 ? (Math.round(((tonnes * 1000) / gwp) * 100) / 100).toLocaleString('tr-TR') : '—';
    return { key, label: refrigerantLabel(key), gwp, kg5: threshold(5), kg50: threshold(50) };
  });

  toNumber(value: string): number {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }
}
