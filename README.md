# OdivonF-Gas

Odivon'un F‑Gas uyumluluk ve saha operasyonu ürünüdür. Angular 22, Signals, Tailwind CSS 4 ve Odivon UI Design System ile geliştirilir.

## Yerel geliştirme

```bash
npm install
npm start
```

MainAPI adresi ve Firebase web istemci ayarları `src/environments/environment.ts` içinde yerel/deployment ortamına göre sağlanır. Bu repoya service-account veya production credential eklenmez.

Production build `environment.production.ts` kullanır ve API adresi `https://mainapi.odivon.com/api/v1` olarak sabittir. Firebase App Check reCAPTCHA Enterprise site anahtarı dağıtım sırasında `public/runtime-config.js` içindeki `appCheckSiteKey` alanına verilir. MainAPI'de `FGAS_REQUIRE_APP_CHECK=true` yalnız bu değer canlı ortama yerleştirildikten sonra açılmalıdır.

## Doğrulama

```bash
npm run typecheck
npm test -- --watch=false
npm run build
```

İş verisi yalnız `/api/v1/fgas` MainAPI alanından alınır. Firebase yalnız Auth ve App Check için kullanılır.

## Lisans

Bu projeye açık kaynak lisansı verilmemiştir. Tüm hakları saklıdır.
