# OdivonF-Gas

Odivon'un F‑Gas uyumluluk ve saha operasyonu ürünüdür. Angular 22, Signals, Tailwind CSS 4 ve Odivon UI Design System ile geliştirilir.

## Yerel geliştirme

```bash
npm install
npm start
```

MainAPI adresi ve Firebase web istemci ayarları `src/environments/environment.ts` içinde yerel/deployment ortamına göre sağlanır. Bu repoya service-account veya production credential eklenmez.

Production build `environment.production.ts` kullanır ve API adresi `https://mainapi.odivon.com/api/v1` olarak sabittir. Firebase App Check reCAPTCHA Enterprise site anahtarı dağıtım sırasında `public/runtime-config.js` içindeki `appCheckSiteKey` alanına verilir. MainAPI'de `FGAS_REQUIRE_APP_CHECK=true` yalnız bu değer canlı ortama yerleştirildikten sonra açılmalıdır.

## Tanıtım sitesi ve SEO

Herkese açık sayfalar (`/`, `/ozellikler`, `/fiyatlar`, `/servis-firmalari`, `/araclar/co2-esdegeri-hesaplama`, `/legal/*`) `src/app/features/marketing/` altındadır ve build sırasında statik HTML olarak prerender edilir (`src/app/app.routes.server.ts`). Uygulama ekranları istemci tarafında çalışır ve `index.csr.html` üzerinden sunulur; bu sayfalar `noindex` kalır. Başlık, açıklama, canonical, Open Graph ve JSON-LD route `data.seo` alanından `SeoService` ile uygulanır. Yeni bir herkese açık sayfa eklenirse `MARKETING_PATHS` ve `public/sitemap.xml` güncellenmelidir. Hesaplayıcıdaki GWP tablosu MainAPI `fgas.compliance.ts` ile aynı tutulmalıdır.

## Doğrulama

```bash
npm run typecheck
npm test -- --watch=false
npm run build
```

İş verisi yalnız `/api/v1/fgas` MainAPI alanından alınır. Firebase yalnız Auth ve App Check için kullanılır.

## Lisans

Bu projeye açık kaynak lisansı verilmemiştir. Tüm hakları saklıdır.
