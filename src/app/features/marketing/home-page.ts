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
        class="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:pt-20"
      >
        <div>
          <span
            class="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
          >
            <span class="size-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
            AB 2024/573 F-Gas Tüzüğü’ne uygun
          </span>
          <h1
            class="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white"
          >
            F-Gas takip yazılımı:
            <span
              class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"
              >denetime her gün hazır olun.</span
            >
          </h1>
          <p class="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Soğutma ve klima ekipmanlarınızın gaz yükünü, sızıntı kontrol tarihlerini, gaz
            hareketlerini ve teknisyen sertifikalarını tek panelde yönetin. CO2 eşdeğeri ve kontrol
            periyodu otomatik hesaplanır, hiçbir kontrol tarihi kaçmaz.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a routerLink="/register" class="odv-btn-primary px-6 py-3 text-base"
              >14 gün ücretsiz deneyin</a
            >
            <a
              routerLink="/araclar/co2-esdegeri-hesaplama"
              class="odv-btn-secondary px-6 py-3 text-base"
              >CO2e hesaplayıcıyı açın</a
            >
          </div>
          <p class="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Kredi kartı gerekmez · Kurulum yok · 8 dil desteği
          </p>
        </div>
        <figure
          class="rounded-3xl border border-slate-200/80 bg-white p-2 shadow-2xl shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900"
        >
          <img
            src="marketing/overview-light.webp"
            width="1200"
            height="982"
            alt="Odivon F-Gas genel bakış ekranı: uyum oranı, CO2 eşdeğeri, geciken kontroller ve denetime hazırlık listesi"
            class="h-auto w-full rounded-2xl"
            fetchpriority="high"
          />
        </figure>
      </div>
    </section>

    <!-- Problems -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h2
        class="max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white"
      >
        Excel ve kâğıt formlarla F-Gas takibi neden riskli?
      </h2>
      <div class="mt-10 grid gap-5 md:grid-cols-3">
        @for (item of problems; track item.title) {
          <article class="odv-card p-6">
            <span
              class="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"
              ><span class="material-symbols-rounded" aria-hidden="true">{{
                item.icon
              }}</span></span
            >
            <h3 class="mt-4 text-lg font-black text-slate-900 dark:text-white">{{ item.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ item.body }}</p>
          </article>
        }
      </div>
    </section>

    <!-- Modules -->
    <section class="bg-white py-16 dark:bg-slate-900/40">
      <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Modüller</span>
        <h2
          class="mt-2 max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white"
        >
          F-Gas uyumu için ihtiyacınız olan her kayıt tek yerde
        </h2>
        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (item of modules; track item.title) {
            <article class="odv-card p-6">
              <span
                class="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"
                ><span class="material-symbols-rounded" aria-hidden="true">{{
                  item.icon
                }}</span></span
              >
              <h3 class="mt-4 text-lg font-black text-slate-900 dark:text-white">
                {{ item.title }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {{ item.body }}
              </p>
            </article>
          }
        </div>
        <a
          routerLink="/ozellikler"
          class="mt-8 inline-flex items-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400"
          >Tüm özellikleri inceleyin
          <span class="material-symbols-rounded directional-icon text-[18px]" aria-hidden="true"
            >arrow_forward</span
          ></a
        >
      </div>
    </section>

    <!-- Thresholds -->
    <section class="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600"
          >Otomatik kontrol takvimi</span
        >
        <h2
          class="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white"
        >
          Sızıntı kontrolü kaç ayda bir? Sistem sizin yerinize hesaplar.
        </h2>
        <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          Gaz türünü ve şarj miktarını girin. Odivon F-Gas, GWP değerinden ton CO2 eşdeğerini bulur,
          F-Gas Tüzüğü Madde 5’teki eşiklere göre kontrol periyodunu belirler ve son kontrolden bir
          sonraki tarihi planlar.
        </p>
        <a routerLink="/araclar/co2-esdegeri-hesaplama" class="odv-btn-primary mt-6 inline-flex"
          >Ekipmanınızı hesaplayın</a
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
    </section>

    <!-- Audience -->
    <section class="bg-white py-16 dark:bg-slate-900/40">
      <div class="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-2">
        <article class="odv-card p-8">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-600"
            >Servis firmaları için</span
          >
          <h2 class="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            Müşterilerinize denetim paketi sunun
          </h2>
          <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Klima ve soğutma servis firmaları her müşterinin ekipmanını, servis kaydını ve teknisyen
            sertifikasını ayrı tutar. Raporu tek tıkla verir, hizmetini farklılaştırır.
          </p>
          <a
            routerLink="/servis-firmalari"
            class="mt-5 inline-flex text-sm font-bold text-indigo-600 dark:text-indigo-400"
            >Servis firmaları için F-Gas takibi</a
          >
        </article>
        <article class="odv-card p-8">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-600"
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
            class="mt-5 inline-flex text-sm font-bold text-indigo-600 dark:text-indigo-400"
            >Planları karşılaştırın</a
          >
        </article>
      </div>
    </section>

    <app-marketing-faq [items]="faq" />
    <app-marketing-cta />
  `,
})
export class HomePage {
  readonly faq = HOME_FAQ;
  readonly problems = [
    {
      icon: 'event_busy',
      title: 'Kontrol tarihleri kaçar',
      body: 'Periyotlar elle takip edildiğinde geciken sızıntı kontrolleri ancak denetimde fark edilir.',
    },
    {
      icon: 'calculate',
      title: 'CO2e hesabı hatalı olur',
      body: 'Karışım gazlarda GWP değeri yanlış alındığında kontrol periyodu da yanlış belirlenir.',
    },
    {
      icon: 'folder_off',
      title: 'Kanıt dağınık kalır',
      body: 'Servis formu, sertifika ve gaz faturaları farklı yerlerde durur; denetim günü toplamak saatler sürer.',
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
      body: 'Yasal periyoda göre otomatik takvim, sonuç, onarım ve takip kontrolü kaydı.',
    },
    {
      icon: 'swap_horiz',
      title: 'Gaz hareket defteri',
      body: 'Dolum, geri kazanım, transfer ve imha hareketleri kilogram bazında.',
    },
    {
      icon: 'badge',
      title: 'Teknisyen ve sertifika',
      body: 'Sertifika numarası, kategori ve geçerlilik tarihi; süresi dolan sertifika uyarısı.',
    },
    {
      icon: 'fact_check',
      title: 'Denetim ve raporlar',
      body: 'Müşteri ve ekipman bazlı denetim paketi, dışa aktarım ve uyum özeti.',
    },
    {
      icon: 'history',
      title: 'Değiştirilemez denetim izi',
      body: 'Her kayıt değişikliği kim ve ne zaman bilgisiyle saklanır, sonradan silinemez.',
    },
  ] as const;
  readonly thresholds = [
    { range: '5 – 50', base: '12 ayda bir', lds: '24 ayda bir' },
    { range: '50 – 500', base: '6 ayda bir', lds: '12 ayda bir' },
    { range: '500 ve üzeri', base: '3 ayda bir', lds: '6 ayda bir' },
  ] as const;
}
