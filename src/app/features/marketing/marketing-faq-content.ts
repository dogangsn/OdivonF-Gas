/** FAQ copy shared by the pages and their FAQPage structured data. */

export const HOME_FAQ = [
  {
    q: 'F-Gas takip yazılımı ne işe yarar?',
    a: 'Florlu sera gazı içeren soğutma, klima ve ısı pompası ekipmanlarının envanterini, sızıntı kontrol tarihlerini, gaz dolum ve geri kazanım hareketlerini ve teknisyen sertifikalarını tek yerde tutar. Denetimde istenen kayıtları hazır hale getirir.',
  },
  {
    q: 'Sızıntı kontrolü kaç ayda bir yapılmalı?',
    a: 'AB 2024/573 sayılı F-Gas Tüzüğü Madde 5’e göre periyot ekipmandaki gazın ton CO2 eşdeğerine bağlıdır: 5 ton ve üzeri için 12 ayda, 50 ton ve üzeri için 6 ayda, 500 ton ve üzeri için 3 ayda bir. Kaçak tespit sistemi varsa süreler iki katına çıkar.',
  },
  {
    q: 'CO2 eşdeğerini kendim hesaplamam gerekiyor mu?',
    a: 'Hayır. Gaz türünü ve şarj miktarını kilogram olarak girdiğinizde Odivon F-Gas, GWP değeriyle ton CO2 eşdeğerini ve yasal kontrol periyodunu otomatik hesaplar.',
  },
  {
    q: 'Servis firmaları müşterileri adına kullanabilir mi?',
    a: 'Evet. Ekipmanları lokasyon ve müşteri bazında gruplayabilir, her servis kaydını teknisyen ve kanıtla birlikte saklayabilir, müşteriye denetim paketi verebilirsiniz.',
  },
  {
    q: 'Verilerim nerede ve nasıl saklanıyor?',
    a: 'Her firma kendi izole alanında çalışır. Tüm değişiklikler kim, ne zaman bilgisiyle değiştirilemez denetim izine yazılır. Kişisel veriler KVKK ve GDPR kapsamında işlenir.',
  },
  {
    q: 'Ücretsiz deneyebilir miyim?',
    a: 'Evet. Hesap açtığınızda 14 gün boyunca tüm özellikleri ücretsiz kullanırsınız. Kredi kartı gerekmez.',
  },
] as const;

export const SERVICE_FAQ = [
  {
    q: 'Birden fazla müşterinin ekipmanını ayrı tutabilir miyim?',
    a: 'Evet. Ekipmanlar lokasyon ve müşteri bilgisiyle kaydedilir; listeleri, kontrolleri ve raporları müşteri bazında filtreleyebilirsiniz.',
  },
  {
    q: 'Teknisyenlerim sahadan kayıt girebilir mi?',
    a: 'Evet. Teknisyen rolündeki kullanıcılar tarayıcıdan, telefondan veya tabletten kontrol sonucu, gaz hareketi ve not girebilir. Silme ve onay yetkisi yöneticide kalır.',
  },
  {
    q: 'Müşterime nasıl rapor veririm?',
    a: 'Denetim modülünden müşteri veya ekipman bazlı paketi dışa aktarırsınız. Paket ekipman listesini, kontrol geçmişini, gaz hareketlerini ve teknisyen sertifikalarını içerir.',
  },
] as const;

export const PRICING_FAQ = [
  {
    q: 'Deneme süresi sonunda ne olur?',
    a: '14 günlük deneme bittiğinde verileriniz korunur. Bir plan seçtiğinizde kaldığınız yerden devam edersiniz.',
  },
  {
    q: 'Planımı sonradan değiştirebilir miyim?',
    a: 'Evet. Ekipman veya kullanıcı sayınız arttığında Abonelik ekranından üst plana geçebilirsiniz.',
  },
  {
    q: 'Ödeme nasıl yapılıyor?',
    a: 'Ödemeler iyzico güvencesiyle kredi kartı veya banka kartı ile aylık ya da yıllık alınır.',
  },
] as const;

export const CALCULATOR_FAQ = [
  {
    q: 'CO2 eşdeğeri nasıl hesaplanır?',
    a: 'Ton CO2 eşdeğeri = gaz miktarı (kg) × GWP ÷ 1000. Örneğin 10 kg R-410A için 10 × 2256 ÷ 1000 = 22,56 ton CO2e.',
  },
  {
    q: 'Karışım gazların GWP değeri nasıl bulunur?',
    a: 'Karışımı oluşturan her gazın GWP değeri kütle oranıyla çarpılıp toplanır. Örneğin R-410A, yarı yarıya R-32 (771) ve R-125 (3740) içerir ve GWP değeri 2256’dır.',
  },
  {
    q: 'Hangi GWP değerleri kullanılıyor?',
    a: 'Hesaplayıcı, AB 2024/573 sayılı F-Gas Tüzüğü Ek I’deki 100 yıllık GWP değerlerini kullanır. Resmi beyan öncesinde değerleri güncel mevzuattan kontrol edin.',
  },
] as const;
