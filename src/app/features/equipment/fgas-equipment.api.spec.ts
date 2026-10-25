import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { EquipmentDraft, FgasEquipmentApi } from './fgas-equipment.api';

describe('FgasEquipmentApi', () => {
  let api: FgasEquipmentApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(FgasEquipmentApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('unwraps the MainAPI list envelope and forwards filters', async () => {
    const result = api.list({ search: 'chiller', archived: false });
    const request = http.expectOne(
      (candidate) =>
        candidate.url === `${environment.apiBaseUrl}/fgas/records` &&
        candidate.params.get('search') === 'chiller' &&
        candidate.params.get('archived') === 'false',
    );
    request.flush({
      success: true,
      data: { items: [], nextCursor: null },
      meta: { requestId: 'r1' },
    });
    await expect(result).resolves.toEqual({ items: [], nextCursor: null });
  });

  it('sends optimistic version information when updating', async () => {
    const draft: EquipmentDraft = {
      name: 'Chiller A',
      location: 'Merkez',
      equipmentCode: 'CH-1',
      equipmentType: 'stationary-refrigeration',
      manufacturer: 'Odivon',
      model: 'X1',
      serialNumber: 'SN-1',
      refrigerant: 'R-32',
      refrigerantChargeKg: 10,
      co2EquivalentTonnes: 7,
      hermeticallySealed: false,
      leakDetectionSystem: true,
      installationDate: '',
      lastLeakCheckAt: '',
      nextLeakCheckDueAt: '',
      responsiblePerson: 'Teknik Ekip',
      inspectionIntervalMonths: 12,
      notes: '',
      status: 'active',
    };
    const result = api.update('eq-1', 4, draft);
    const request = http.expectOne(`${environment.apiBaseUrl}/fgas/records/eq-1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body.expectedVersion).toBe(4);
    request.flush({ success: true, data: { id: 'eq-1' }, meta: { requestId: 'r2' } });
    expect((await result).id).toBe('eq-1');
  });
});
