import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { BillingApi, BuyerDraft } from './billing.api';

describe('BillingApi', () => {
  let api: BillingApi;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(BillingApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('creates a server-priced order before the payment checkout', async () => {
    const buyer: BuyerDraft = {
      name: 'Ayşe',
      surname: 'Yılmaz',
      identityNumber: '11111111111',
      email: 'ayse@example.com',
      gsmNumber: '+905551112233',
      address: 'Merkez Mah.',
      city: 'İstanbul',
      country: 'Turkey',
    };
    const result = api.checkout('pro', 'yearly', buyer);
    const order = http.expectOne(`${environment.apiBaseUrl}/payments/saas-orders`);
    expect(order.request.body).toEqual({ planId: 'pro', billingCycle: 'yearly' });
    order.flush({ data: { id: 'order-1' } });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const checkout = http.expectOne(`${environment.apiBaseUrl}/payments/checkout`);
    expect(checkout.request.body).toMatchObject({
      source: 'saas_subscription',
      sourceId: 'order-1',
      identityNumber: '11111111111',
    });
    checkout.flush({ data: { paymentPageUrl: 'https://sandbox-cpp.iyzipay.com/checkout' } });
    await expect(result).resolves.toBe('https://sandbox-cpp.iyzipay.com/checkout');
  });
});
