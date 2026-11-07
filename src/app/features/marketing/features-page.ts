import { Component } from '@angular/core';
import { MarketingCta } from './marketing-cta';

@Component({
  selector: 'app-marketing-features',
  imports: [MarketingCta],
  template: `
    <section class="mx-auto max-w-7xl px-4 pb-6 pt-14 sm:px-6">
      <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Özellikler</span>
      <h1
        class="mt-2 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white"
      >
        F-Gas uyum özellikleri: envanterden denetim paketine
      </h1>
      <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
        Odivon F-Gas, AB 2024/573 F-Gas Tüzüğü ve Florlu Sera Gazları Yönetmeliği’nin istediği
        kayıtları sahadan rapora kadar tek akışta toplar.
      </p>
    </section>

    @for (block of blocks; track block.title; let odd = $odd) {
      <section class="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div [class.lg:order-2]="odd">
          <span
            class="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"
            ><span class="material-symbols-rounded" aria-hidden="true">{{ block.icon }}</span></span
          >
          <h2 class="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {{ block.title }}
          </h2>
          <p class="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
            {{ block.body }}
          </p>
          <ul class="mt-5 space-y-2.5">
            @for (point of block.points; track point) {
              <li class="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
                <span
                  class="material-symbols-rounded text-[20px] text-emerald-600"
                  aria-hidden="true"
                  >check_circle</span
                >{{ point }}
              </li>
            }
          </ul>
        </div>
        @if (block.image) {
          <img
            [src]="block.image.src"
            [width]="block.image.width"
            [height]="block.image.height"
            [alt]="block.image.alt"
            loading="lazy"
            class="h-auto w-full rounded-3xl border border-slate-200/80 shadow-xl shadow-indigo-500/10 dark:border-slate-800"
          />
        } @else {
          <div class="odv-card grid gap-3 p-6 sm:grid-cols-2">
            @for (stat of block.stats; track stat.label) {
              <div class="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/60">
                <span class="odv-kpi-label">{{ stat.label }}</span>
                <strong class="mt-2 block text-2xl font-black text-slate-900 dark:text-white">{{
                  stat.value
                }}</strong>
              </div>
            }
          </div>
        }
      </section>
    }

    <app-marketing-cta />
  `,
})
export class FeaturesPage {
  readonly blocks = [
    {
      icon: 'inventory_2',
      title: 'Ekipman envanteri ve otomatik CO2e',
      body: 'Her cihazı lokasyon, tip, üretici, seri numarası, gaz türü ve şarj miktarıyla kaydedin. Gaz ve kilogram girildiğinde ton CO2 eşdeğeri ve yasal kontrol periyodu otomatik hesaplanır.',
      points: [
        '40’tan fazla saf gaz ve karışım için güncel GWP değerleri',
        'Hermetik ekipman ve kaçak tespit sistemi kuralları',
        'Ekipman kodu, lokasyon ve sorumlu kişi ile arama',
      ],
      image: {
        src: 'marketing/equipment-dark.webp',
        width: 1200,
        height: 922,
        alt: 'Ekipman envanteri ekranı: gaz türü, şarj miktarı ve sonraki kontrol tarihleri',
      },
      stats: [],
    },
    {
      icon: 'event_upcoming',
      title: 'Sızıntı kontrol planı',
      body: 'Kontrolleri planlayın, sonucu ve kanıtı sahadan kaydedin. Sızıntı bulunursa onarım ve takip kontrolü tarihi açık aksiyon olarak izlenir.',
      points: [
        'Geciken ve yaklaşan kontroller için uyarı',
        'Sonuç: uygun, şartlı uygun, uygun değil',
        'Onarım sonrası takip kontrolü',
      ],
      image: {
        src: 'marketing/leak-light.webp',
        width: 1200,
        height: 801,
        alt: 'Sızıntı kontrolleri listesi: kayıt, teknisyen, gaz, vade ve durum',
      },
      stats: [],
    },
    {
      icon: 'swap_horiz',
      title: 'Gaz hareket defteri',
      body: 'Dolum, geri kazanım, transfer ve imha hareketlerini kilogram ve gaz türüyle kaydedin. Geri kazanılan gaz miktarı genel bakışta görünür.',
      points: [
        'Hareket türüne göre filtre',
        'Ekipman ve teknisyenle ilişkili kayıt',
        'Denetim için dışa aktarım',
      ],
      image: null,
      stats: [
        { label: 'Hareket türü', value: '4' },
        { label: 'Birim', value: 'kg' },
        { label: 'Bağlantı', value: 'Ekipman' },
        { label: 'Kayıt', value: 'Değişmez' },
      ],
    },
    {
      icon: 'verified_user',
      title: 'Teknisyen, denetim ve değişmez kayıt',
      body: 'Teknisyen sertifikalarını geçerlilik tarihiyle saklayın. Müşteri ve ekipman bazlı denetim paketini tek tıkla alın. Her değişiklik denetim izine yazılır.',
      points: [
        'Sertifika süresi dolmadan uyarı',
        'Rol bazlı yetki: görüntüleyici, teknisyen, yönetici',
        '8 dilde arayüz: TR, EN, DE, FR, ES, IT, NL, AR',
      ],
      image: null,
      stats: [
        { label: 'Roller', value: '3' },
        { label: 'Dil', value: '8' },
        { label: 'Denetim izi', value: '%100' },
        { label: 'Kurulum', value: 'Yok' },
      ],
    },
  ] as const;
}
