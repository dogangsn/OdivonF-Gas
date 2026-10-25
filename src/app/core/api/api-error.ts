import { HttpErrorResponse } from '@angular/common/http';

interface ErrorEnvelope {
  readonly error?: { readonly code?: string; readonly message?: string };
  readonly code?: string;
  readonly message?: string;
  readonly meta?: { readonly requestId?: string };
  readonly requestId?: string;
}

export function apiErrorDetails(error: HttpErrorResponse, fallback: string) {
  const body = error.error as ErrorEnvelope | null;
  return {
    code: body?.error?.code ?? body?.code ?? 'REQUEST_FAILED',
    message: body?.error?.message ?? body?.message ?? fallback,
    requestId: body?.meta?.requestId ?? body?.requestId ?? error.headers.get('x-request-id'),
  };
}
