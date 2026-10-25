import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { FgasOperation, FgasOperationsApi, OperationDraft } from './fgas-operations.api';

describe('FgasOperationsApi', () => {
  let api: FgasOperationsApi;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(FgasOperationsApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('keeps kind and tenant filters in the MainAPI URL', async () => {
    const result = api.list('leak-check', {
      archived: false,
      status: 'scheduled',
      search: 'chiller',
    });
    const request = http.expectOne(
      (candidate) =>
        candidate.url === `${environment.apiBaseUrl}/fgas/operations/leak-check` &&
        candidate.params.get('status') === 'scheduled' &&
        candidate.params.get('search') === 'chiller',
    );
    request.flush({ data: { items: [], nextCursor: null } });
    await expect(result).resolves.toEqual({ items: [], nextCursor: null });
  });
  it('sends optimistic version and normalized evidence when updating', async () => {
    const row = { id: 'op-1', version: 7 } as FgasOperation;
    const draft = {
      title: 'Kontrol',
      reference: '',
      equipmentId: 'eq-1',
      location: '',
      occurredAt: '2026-10-25',
      dueAt: '',
      status: 'completed',
      technicianName: 'Ayşe',
      certificateNumber: '',
      certificateCategory: '',
      certificateExpiresAt: '',
      refrigerant: 'R-32',
      quantityKg: 2,
      movementType: 'charge',
      result: 'pass',
      leakDetected: false,
      repairRequired: false,
      followUpDueAt: '',
      notes: '',
      evidenceRefs: 'DOC-1, DOC-2',
    } as OperationDraft;
    const result = api.update('leak-check', row, draft);
    const request = http.expectOne(`${environment.apiBaseUrl}/fgas/operations/leak-check/op-1`);
    expect(request.request.body).toMatchObject({
      expectedVersion: 7,
      evidenceRefs: ['DOC-1', 'DOC-2'],
    });
    request.flush({ data: { id: 'op-1' } });
    expect((await result).id).toBe('op-1');
  });
});
