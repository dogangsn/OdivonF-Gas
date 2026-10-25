import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
@Component({
  selector: 'app-legal-page',
  imports: [RouterLink],
  template: `<main class="min-h-screen bg-slate-50 p-5 dark:bg-[#0b1120]">
    <article class="odv-card mx-auto max-w-4xl p-7 sm:p-10">
      <a
        routerLink="/register"
        class="inline-flex items-center gap-2 text-sm font-bold text-violet-600"
        ><span class="material-symbols-rounded directional-icon">arrow_back</span>Kayıt ekranına
        dön</a
      ><span class="mt-8 block text-xs font-black uppercase tracking-[.18em] text-violet-600"
        >ODIVON F-GAS</span
      >
      <h1 class="mt-3 text-3xl font-black">
        {{ privacy ? 'Gizlilik ve Veri İşleme Bildirimi' : 'SaaS Kullanım Koşulları' }}
      </h1>
      <p class="text-xs text-slate-500">Son güncelleme: 25 Ekim 2026</p>
      @if (privacy) {
        <div class="prose mt-8 max-w-none text-sm leading-7 dark:prose-invert">
          <h2>Veri sorumluluğu ve kapsam</h2>
          <p>
            Odivon, hesap ve hizmet sunumu için gerekli kimlik, iletişim, tenant, denetim izi ve
            faturalama verilerini işler. Müşteri işletme, F-Gas operasyon verilerinin veri
            sorumlusudur.
          </p>
          <h2>İşleme amaçları</h2>
          <p>
            Kimlik doğrulama, tenant izolasyonu, erişim kontrolü, mevzuat kayıtlarının saklanması,
            güvenlik olaylarının araştırılması, abonelik yönetimi ve destek hizmetleri.
          </p>
          <h2>Saklama ve güvenlik</h2>
          <p>
            Veriler rol tabanlı erişim, tenant sınırı, aktarım şifreleme, değişmez denetim
            snapshotları ve yedekleme kontrolleriyle korunur. Hesap silme ve yasal saklama talepleri
            destek kanalı üzerinden yürütülür.
          </p>
          <h2>Haklar ve iletişim</h2>
          <p>
            Erişim, düzeltme, silme, kısıtlama ve itiraz talepleri sözleşmedeki iletişim kanalına
            iletilebilir. Yasal saklama yükümlülükleri saklıdır.
          </p>
        </div>
      } @else {
        <div class="prose mt-8 max-w-none text-sm leading-7 dark:prose-invert">
          <h2>Hizmetin kapsamı</h2>
          <p>
            Odivon F-Gas; envanter, sızıntı kontrolü, gaz hareketi, teknisyen, denetim izi ve
            raporlama araçları sunan abonelik tabanlı bir yazılımdır.
          </p>
          <h2>Hesap güvenliği</h2>
          <p>
            Kullanıcılar giriş bilgilerini korumak, doğru rol atamak ve yetkisiz erişimi gecikmeden
            bildirmekle yükümlüdür. Her tenant yalnız kendi verilerine erişir.
          </p>
          <h2>Abonelik ve ödeme</h2>
          <p>
            Plan, dönem ve fiyat ödeme öncesi gösterilir. Abonelik, ödeme sağlayıcısının sunucu
            tarafında doğruladığı başarılı tahsilat sonrasında aktifleşir. Test ödemeleri canlı
            abonelik oluşturmaz.
          </p>
          <h2>Müşteri sorumluluğu</h2>
          <p>
            Yazılım karar desteği ve kayıt altyapısı sağlar; mevzuata uygunluk, saha doğruluğu ve
            yetkili personel kullanımı müşterinin sorumluluğundadır.
          </p>
          <h2>Hizmet sürekliliği</h2>
          <p>
            Planlı bakım, güvenlik olayı ve mücbir sebep halleri dışında makul hizmet sürekliliği
            hedeflenir. Kritik güncellemeler istemci sürüm kontrolüyle zorunlu tutulabilir.
          </p>
        </div>
      }
    </article>
  </main>`,
})
export class LegalPage {
  readonly privacy = inject(ActivatedRoute).snapshot.data['document'] === 'privacy';
}
