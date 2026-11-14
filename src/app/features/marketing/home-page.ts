import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarketingCta } from './marketing-cta';
import { MarketingFaq } from './marketing-faq';
import { HOME_FAQ } from './marketing-faq-content';

@Component({
  selector: 'app-marketing-home',
  imports: [RouterLink, MarketingCta, MarketingFaq],
  template: `
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div
        class="pointer-events-none absolute -top-40 end-[-10rem] size-[36rem] rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/20"
        aria-hidden="true"
      ></div>
      <div
        class="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:pb-20 lg:pt-16"
      >
        <div>
          <span
            class="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
          >
            <span class="material-symbols-rounded text-[16px]" aria-hidden="true">gavel</span>
            AB 2024/573 F-Gas Tüzüğü Madde 5 kuralları
          </span>
          <h1
            class="mt-5 text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl dark:text-white"
          >
            F-Gas takip yazılımı:
            <span
              class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"
              >denetime her gün hazır olun.</span
            >
          </h1>
          <p class="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Soğutma ve klima ekipmanlarınızın gaz yükünü, sızıntı kontrol tarihlerini, gaz
            hareketlerini ve teknisyen sertifikalarını tek yerde tutun. Gaz türünü ve kilogramı
            girin; CO2 eşdeğeri, kontrol periyodu ve bir sonraki kontrol tarihi otomatik
            hesaplansın.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a routerLink="/register" class="odv-btn-primary px-6 py-3 text-base"
              >14 gün ücretsiz deneyin</a
            >
            <a [href]="demoMail" class="odv-btn-secondary px-6 py-3 text-base">Demo isteyin</a>
          </div>
          <ul
            class="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            @for (item of heroNotes; track item) {
              <li class="flex items-center gap-1.5">
                <span
                  class="material-symbols-rounded text-[16px] text-indigo-600"
                  aria-hidden="true"
                  >check</span
                >{{ item }}
              </li>
            }
          </ul>
        </div>

        <!-- Product preview: the check schedule the app keeps for you -->
        <figure
          class="m-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900"
          aria-label="Örnek kontrol takvimi"
        >
          <div
            class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700"
          >
            <div>
              <strong class="block text-sm text-slate-900 dark:text-white">Kontrol takvimi</strong>
              <span class="text-xs text-slate-500">Arktik Soğutma · 3 lokasyon · 42 ekipman</span>
            </div>
            <div class="flex gap-1.5 text-[11px] font-bold">
              <span
                class="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                >2 gecikmiş</span
              ><span
                class="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                >5 bu ay</span
              >
            </div>
          </div>
          <table class="w-full text-left text-sm">
            <caption class="sr-only">
              Örnek ekipman kontrol listesi
            </caption>
            <thead>
              <tr class="text-[11px] uppercase tracking-wider text-slate-500">
                <th scope="col" class="px-5 py-2.5 font-bold">Ekipman</th>
                <th scope="col" class="hidden px-3 py-2.5 font-bold sm:table-cell">Gaz · CO2e</th>
                <th scope="col" class="px-3 py-2.5 font-bold">Sonraki kontrol</th>
              </tr>
            </thead>
            <tbody>
              @for (row of preview; track row.name) {
                <tr class="border-t border-slate-100 dark:border-slate-800">
                  <td class="px-5 py-3">
                    <strong class="block text-slate-900 dark:text-white">{{ row.name }}</strong
                    ><span class="text-xs text-slate-500">{{ row.place }}</span>
                  </td>
                  <td class="hidden px-3 py-3 sm:table-cell">
                    <span class="font-semibold text-slate-800 dark:text-slate-200">{{
                      row.gas
                    }}</span
                    ><span class="block text-xs text-slate-500"
                      >{{ row.co2 }} · {{ row.period }}</span
                    >
                  </td>
                  <td class="px-3 py-3">
                    <span class="block font-semibold text-slate-800 dark:text-slate-200">{{
                      row.due
                    }}</span>
                    <span [class]="row.badge">{{ row.state }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <figcaption
            class="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-950/40"
          >
            CO2e = kg × GWP. Periyot ve tarih, son kontrole göre otomatik hesaplanır.
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Trust strip -->
    <section
      class="border-y border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900/40"
      aria-label="Güvence"
    >
      <ul
        class="mx-auto grid max-w-7xl gap-4 px-4 py-8 text-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-4"
      >
        @for (item of trust; track item.title) {
          <li class="flex items-start gap-3">
            <span
              class="material-symbols-rounded text-indigo-700 dark:text-indigo-300"
              aria-hidden="true"
              >{{ item.icon }}</span
            >
            <span
              ><strong class="block text-slate-900 dark:text-white">{{ item.title }}</strong
              ><span class="text-xs text-slate-500 dark:text-slate-400">{{ item.body }}</span></span
            >
          </li>
        }
      </ul>
    </section>

    <!-- Excel vs Odivon -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <span class="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300"
        >Neden Excel değil?</span
      >
      <h2
        class="mt-2 max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white"
      >
        Tablo kayıt tutar. Odivon F-Gas takvimi sizin yerinize tutar.
      </h2>
      <div class="odv-card mt-10 overflow-x-auto">
        <table class="w-full min-w-[36rem] text-sm">
          <caption class="sr-only">
            Excel ile Odivon F-Gas karşılaştırması
          </caption>
          <thead class="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th scope="col" class="odv-th">İş</th>
              <th scope="col" class="odv-th">Excel ve kâğıt form</th>
              <th scope="col" class="odv-th">Odivon F-Gas</th>
            </tr>
          </thead>
          <tbody>
            @for (row of comparison; track row.task) {
              <tr class="odv-row">
                <th scope="row" class="odv-td text-start font-bold text-slate-900 dark:text-white">
                  {{ row.task }}
                </th>
                <td class="odv-td text-slate-500">
                  <span class="flex items-start gap-2"
                    ><span
                      class="material-symbols-rounded text-[18px] text-rose-500"
                      aria-hidden="true"
                      >close</span
                    >{{ row.excel }}</span
                  >
                </td>
                <td class="odv-td text-slate-700 dark:text-slate-200">
                  <span class="flex items-start gap-2"
                    ><span
                      class="material-symbols-rounded text-[18px] text-indigo-600 dark:text-indigo-300"
                      aria-hidden="true"
                      >check</span
                    >{{ row.odivon }}</span
                  >
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <!-- How it works -->
    <section
      class="border-y border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/40"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <span
          class="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300"
          >Nasıl çalışır?</span
        >
        <h2
          class="mt-2 max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white"
        >
          Üç adımda kontrol takvimi
        </h2>
        <ol class="mt-10 grid gap-5 md:grid-cols-3">
          @for (step of steps; track step.title; let index = $index) {
            <li class="odv-card p-6">
              <span
                class="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-black text-white shadow-md shadow-indigo-500/25"
                >{{ index + 1 }}</span
              >
              <h3 class="mt-4 text-lg font-black text-slate-900 dark:text-white">
                {{ step.title }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {{ step.body }}
              </p>
            </li>
          }
        </ol>
      </div>
    </section>

    <!-- Modules -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <span class="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300"
        >Modüller</span
      >
      <h2
        class="mt-2 max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white"
      >
        F-Gas uyumu için gereken kayıtlar tek yerde
      </h2>
      <div class="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        @for (item of modules; track item.title) {
          <article class="flex gap-4">
            <span
              class="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"
              ><span class="material-symbols-rounded" aria-hidden="true">{{
                item.icon
              }}</span></span
            >
            <div>
              <h3 class="text-base font-black text-slate-900 dark:text-white">{{ item.title }}</h3>
              <p class="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {{ item.body }}
              </p>
            </div>
          </article>
        }
      </div>
      <a
        routerLink="/ozellikler"
        class="mt-10 inline-flex items-center gap-1 text-sm font-bold text-indigo-700 dark:text-indigo-300"
        >Tüm özellikleri inceleyin
        <span class="material-symbols-rounded directional-icon text-[18px]" aria-hidden="true"
          >arrow_forward</span
        ></a
      >
    </section>

    <!-- Thresholds -->
    <section class="bg-slate-50 py-16 dark:bg-slate-950/40">
      <div class="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span
            class="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300"
            >Otomatik kontrol periyodu</span
          >
          <h2
            class="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white"
          >
            Sızıntı kontrolü kaç ayda bir? Sistem sizin yerinize hesaplar.
          </h2>
          <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Gaz türünü ve şarj miktarını girin. Odivon F-Gas, GWP değerinden ton CO2 eşdeğerini
            bulur, F-Gas Tüzüğü Madde 5’teki eşiklere göre kontrol periyodunu belirler ve son
            kontrolden bir sonraki tarihi planlar.
          </p>
          <a routerLink="/araclar/co2-esdegeri-hesaplama" class="odv-btn-primary mt-6 inline-flex"
            >Ücretsiz CO2e hesaplayıcı</a
          >
        </div>
        <div class="odv-card overflow-hidden">
          <table class="w-full text-sm">
            <caption class="sr-only">
              CO2 eşdeğerine göre sızıntı kontrol periyotları
            </caption>
            <thead>
              <tr>
                <th scope="col" class="odv-th">Gaz miktarı (ton CO2e)</th>
                <th scope="col" class="odv-th">Kontrol periyodu</th>
                <th scope="col" class="odv-th">Kaçak tespit sistemi ile</th>
              </tr>
            </thead>
            <tbody>
              @for (row of thresholds; track row.range) {
                <tr class="odv-row">
                  <td class="odv-td font-bold">{{ row.range }}</td>
                  <td class="odv-td">{{ row.base }}</td>
                  <td class="odv-td">{{ row.lds }}</td>
                </tr>
              }
            </tbody>
          </table>
          <p class="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
            Hermetik olarak kapalı ve 10 ton CO2e altındaki ekipmanlar periyodik kontrolden muaftır.
            Kaynak: AB 2024/573 Madde 5.
          </p>
        </div>
      </div>
    </section>

    <!-- Audience -->
    <section class="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 md:grid-cols-2">
      <article class="odv-card p-8">
        <span
          class="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300"
          >Servis firmaları için</span
        >
        <h2 class="mt-2 text-2xl font-black text-slate-900 dark:text-white">
          Müşterilerinize denetim paketi sunun
        </h2>
        <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Klima ve soğutma servis firmaları her müşterinin ekipmanını, servis kaydını ve teknisyen
          sertifikasını düzenli tutar; denetim öncesi kayıtları tek pakette verir.
        </p>
        <a
          routerLink="/servis-firmalari"
          class="mt-5 inline-flex text-sm font-bold text-indigo-700 dark:text-indigo-300"
          >Servis firmaları için F-Gas takibi</a
        >
      </article>
      <article class="odv-card p-8">
        <span
          class="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300"
          >İşletmeler için</span
        >
        <h2 class="mt-2 text-2xl font-black text-slate-900 dark:text-white">
          Çok lokasyonlu tesislerde tam görünürlük
        </h2>
        <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Market zincirleri, oteller, hastaneler, soğuk zincir depoları ve veri merkezleri tüm
          lokasyonların gaz yükünü, geciken kontrolleri ve açık aksiyonları tek ekranda görür.
        </p>
        <a
          routerLink="/fiyatlar"
          class="mt-5 inline-flex text-sm font-bold text-indigo-700 dark:text-indigo-300"
          >Planları karşılaştırın</a
        >
      </article>
    </section>

    <app-marketing-faq [items]="faq" />
    <app-marketing-cta />
  `,
})
export class HomePage {
  readonly faq = HOME_FAQ;
  readonly demoMail =
    'mailto:destek@odivon.com?subject=' + encodeURIComponent('Odivon F-Gas demo talebi');
  readonly heroNotes = ['Kredi kartı gerekmez', 'Kurulum yok', 'Türkçe destek'] as const;
  readonly preview = [
    {
      name: 'Soğuk oda kompresörü',
      place: 'İstanbul Depo',
      gas: 'R-404A · 12 kg',
      co2: '56,7 t CO2e',
      period: '6 ayda bir',
      due: '2 Kas 2026',
      state: 'Gecikti',
      badge: 'text-xs font-bold text-rose-700 dark:text-rose-300',
    },
    {
      name: 'VRF dış ünite',
      place: 'Ankara Şube',
      gas: 'R-410A · 15 kg',
      co2: '33,8 t CO2e',
      period: '12 ayda bir',
      due: '21 Kas 2026',
      state: '7 gün kaldı',
      badge: 'text-xs font-bold text-amber-700 dark:text-amber-300',
    },
    {
      name: 'Market reyon dolabı',
      place: 'İzmir Mağaza',
      gas: 'R-448A · 24 kg',
      co2: '35,9 t CO2e',
      period: '12 ayda bir',
      due: '9 Ara 2026',
      state: 'Planlandı',
      badge: 'text-xs font-bold text-slate-500',
    },
    {
      name: 'Isı pompası',
      place: 'İzmir Fabrika',
      gas: 'R-32 · 18 kg',
      co2: '13,9 t CO2e',
      period: '12 ayda bir',
      due: '14 Mar 2027',
      state: 'Uygun',
      badge: 'text-xs font-bold text-indigo-700 dark:text-indigo-300',
    },
  ] as const;
  readonly trust = [
    {
      icon: 'gavel',
      title: 'Tüzüğe göre hesap',
      body: 'GWP ve periyotlar AB 2024/573’e göre',
    },
    {
      icon: 'history',
      title: 'Değiştirilemez kayıt',
      body: 'Her değişiklik kim ve ne zaman bilgisiyle',
    },
    {
      icon: 'shield_lock',
      title: 'Şirketinize özel veri',
      body: 'Her firmanın verisi ayrı ve yetkiyle erişilir',
    },
    {
      icon: 'support_agent',
      title: 'Türkçe destek',
      body: 'destek@odivon.com',
    },
  ] as const;
  readonly comparison = [
    {
      task: 'CO2 eşdeğeri',
      excel: 'GWP değeri elle aranır, karışımlarda hata yapılır',
      odivon: 'Gaz türü ve kg’dan otomatik hesaplanır',
    },
    {
      task: 'Kontrol periyodu',
      excel: 'Eşikler her cihaz için ayrı yorumlanır',
      odivon: 'Madde 5 eşiklerine göre otomatik belirlenir',
    },
    {
      task: 'Sonraki kontrol tarihi',
      excel: 'Unutulur, gecikme denetimde ortaya çıkar',
      odivon: 'Son kontrolden hesaplanır, gecikenler listede öne çıkar',
    },
    {
      task: 'Kaçak sonrası takip',
      excel: 'Takip kontrolü ayrıca not edilmezse kaçar',
      odivon: 'Kaçak bulunduğunda takip tarihi ve aksiyon kaydı oluşur',
    },
    {
      task: 'Kim neyi değiştirdi?',
      excel: 'Dosya üzerine yazılır, geçmiş kaybolur',
      odivon: 'Her değişiklik denetim izine yazılır',
    },
  ] as const;
  readonly steps = [
    {
      title: 'Ekipmanı ekleyin',
      body: 'Ad, lokasyon, gaz türü ve kilogram. CO2 eşdeğeri ve kontrol periyodu kayıt anında hesaplanır.',
    },
    {
      title: 'Takvim kendiliğinden oluşsun',
      body: 'Son kontrol tarihinden bir sonraki kontrol planlanır; yaklaşan ve geciken kontroller öne çıkar.',
    },
    {
      title: 'Kontrolü kaydedin, denetime hazır olun',
      body: 'Teknisyen, sonuç ve kaçak bilgisini girin. Ekipman takvimi güncellenir, kayıt denetim paketine girer.',
    },
  ] as const;
  readonly modules = [
    {
      icon: 'inventory_2',
      title: 'Ekipman envanteri',
      body: 'Cihaz, lokasyon, gaz türü, şarj miktarı, CO2 eşdeğeri, hermetiklik ve kaçak tespit sistemi bilgisi.',
    },
    {
      icon: 'event_upcoming',
      title: 'Sızıntı kontrol planı',
      body: 'Yasal periyoda göre takvim, sonuç, onarım ve takip kontrolü kaydı.',
    },
    {
      icon: 'swap_horiz',
      title: 'Gaz hareket defteri',
      body: 'Dolum, geri kazanım, transfer ve imha hareketleri kilogram bazında.',
    },
    {
      icon: 'badge',
      title: 'Teknisyen ve sertifika',
      body: 'Sertifika numarası, kategori ve geçerlilik tarihi.',
    },
    {
      icon: 'fact_check',
      title: 'Denetim paketi',
      body: 'Ekipman, kontrol, gaz hareketi ve teknisyen kayıtlarının dışa aktarımı.',
    },
    {
      icon: 'group',
      title: 'Ekip ve yetkiler',
      body: 'Yönetici, teknisyen ve görüntüleyici rolleriyle ekibinizi davet edin.',
    },
  ] as const;
  readonly thresholds = [
    { range: '5 – 50', base: '12 ayda bir', lds: '24 ayda bir' },
    { range: '50 – 500', base: '6 ayda bir', lds: '12 ayda bir' },
    { range: '500 ve üzeri', base: '3 ayda bir', lds: '6 ayda bir' },
  ] as const;
}
