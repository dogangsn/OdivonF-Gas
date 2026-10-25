import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { apiErrorDetails } from '../../core/api/api-error';
interface Envelope<T> {
  readonly data: T;
}
export interface SaasPlan {
  readonly id: string;
  readonly name: string;
  readonly monthly: number | null;
  readonly yearly: number | null;
}
export interface BillingStatus {
  readonly membershipStatus: 'trial' | 'active' | 'expired' | 'grace';
  readonly subscriptionEndsAt: string | null;
  readonly graceEndsAt: string | null;
  readonly inGrace: boolean;
  readonly graceDays: number;
  readonly daysLeft: number | null;
}
export interface PaymentRecord {
  readonly id: string;
  readonly receiptNo: string;
  readonly planId: string;
  readonly billingCycle: 'monthly' | 'yearly';
  readonly amountKurus: number;
  readonly currency: 'TRY';
  readonly mode: 'sandbox' | 'live';
  readonly periodStartsAt: string;
  readonly periodEndsAt: string;
  readonly paidAt: string;
}
export interface FgasEntitlements {
  readonly planId: 'starter' | 'pro' | 'enterprise';
  readonly maxEquipment: number | null;
  readonly maxOperations: number | null;
  readonly maxUsers: number | null;
  readonly advancedReports: boolean;
  readonly prioritySupport: boolean;
  readonly usage: {
    readonly equipment: number;
    readonly operations: number;
    readonly users: number;
  };
}
export interface BuyerDraft {
  name: string;
  surname: string;
  identityNumber: string;
  email: string;
  gsmNumber: string;
  address: string;
  city: string;
  country: string;
}
@Injectable({ providedIn: 'root' })
export class BillingApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;
  plans() {
    return this.request(
      this.http.get<Envelope<SaasPlan[]>>(`${this.base}/payments/saas-plans/catalog`),
    );
  }
  status() {
    return this.request(this.http.get<Envelope<BillingStatus>>(`${this.base}/saas-billing/status`));
  }
  history() {
    return this.request(
      this.http.get<Envelope<PaymentRecord[]>>(`${this.base}/saas-billing/payments`),
    );
  }
  entitlements() {
    return this.request(
      this.http.get<Envelope<FgasEntitlements>>(`${this.base}/fgas/entitlements`),
    );
  }
  async checkout(
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    buyer: BuyerDraft,
  ): Promise<string> {
    const order = await this.request(
      this.http.post<Envelope<{ id: string }>>(`${this.base}/payments/saas-orders`, {
        planId,
        billingCycle,
      }),
    );
    const session = await this.request(
      this.http.post<Envelope<{ paymentPageUrl: string | null }>>(
        `${this.base}/payments/checkout`,
        { ...buyer, source: 'saas_subscription', sourceId: order.id },
      ),
    );
    if (!session.paymentPageUrl) throw new Error('Güvenli ödeme sayfası oluşturulamadı.');
    return session.paymentPageUrl;
  }
  session(id: string) {
    return this.request(
      this.http.get<Envelope<{ status: string; amountKurus: number; currency: string }>>(
        `${this.base}/payments/sessions/${encodeURIComponent(id)}`,
      ),
    );
  }
  reconcile(id: string) {
    return this.request(
      this.http.post<Envelope<{ status: string }>>(
        `${this.base}/payments/sessions/${encodeURIComponent(id)}/reconcile`,
        {},
      ),
    );
  }
  private async request<T>(source: Observable<Envelope<T>>): Promise<T> {
    try {
      return (await firstValueFrom(source)).data;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        throw new Error(apiErrorDetails(error, 'Abonelik servisine ulaşılamadı.').message);
      }
      throw error;
    }
  }
}
