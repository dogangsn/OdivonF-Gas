import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { apiErrorDetails } from './api-error';

describe('apiErrorDetails', () => {
  it('reads the standard MainAPI error envelope and request id', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: {
        success: false,
        error: { code: 'COMPLIANCE_RECORD_CONFLICT', message: 'Kayıt güncellendi.' },
        meta: { requestId: 'req-42' },
      },
      headers: new HttpHeaders(),
    });
    expect(apiErrorDetails(error, 'fallback')).toEqual({
      code: 'COMPLIANCE_RECORD_CONFLICT',
      message: 'Kayıt güncellendi.',
      requestId: 'req-42',
    });
  });
});
