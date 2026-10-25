import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { apiErrorDetails } from '../api/api-error';

interface ApiEnvelope<T> {
  readonly success: true;
  readonly data: T;
}

export interface IdentityProfile {
  readonly uid: string;
  readonly tenantId: string;
  readonly email: string;
  readonly displayName: string | null;
  readonly role: 'owner' | 'admin' | 'user';
  readonly modules: readonly string[];
  readonly emailVerified: boolean;
  readonly membershipStatus: string;
  readonly trialEndsAt: string | null;
  readonly onboardingCompleted: boolean;
  readonly tenant: {
    readonly id: string;
    readonly name: string;
    readonly status: string;
    readonly subscriptionEndsAt: string | null;
    readonly graceEndsAt: string | null;
    readonly inGrace: boolean;
  };
}

export class IdentityApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class IdentityApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/identity`;

  async register(input: {
    name: string;
    company: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.request(
      this.http.post<ApiEnvelope<unknown>>(`${this.endpoint}/register`, {
        email: input.email.trim().toLowerCase(),
        password: input.password,
        tenantName: input.company.trim(),
        displayName: input.name.trim(),
        module: 'fgas',
      }),
    );
  }

  me(): Promise<IdentityProfile> {
    return this.request(this.http.get<ApiEnvelope<IdentityProfile>>(`${this.endpoint}/me`));
  }

  resendVerification(email: string): Promise<void> {
    return this.request(
      this.http.post<ApiEnvelope<unknown>>(`${this.endpoint}/resend-verification`, { email }),
    ).then(() => undefined);
  }

  private async request<T>(request: Observable<ApiEnvelope<T>>): Promise<T> {
    try {
      return ((await firstValueFrom(request)) as ApiEnvelope<T>).data;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        const details = apiErrorDetails(error, 'İşlem tamamlanamadı.');
        throw new IdentityApiError(details.code, details.message, error.status);
      }
      throw error;
    }
  }
}
