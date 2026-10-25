import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { apiErrorDetails } from '../../core/api/api-error';

export type OperationKind = 'leak-check' | 'gas-movement' | 'technician' | 'inspection';
export type OperationStatus = 'draft' | 'scheduled' | 'completed' | 'action-required' | 'expired';
export interface FgasOperation {
  readonly id: string;
  readonly kind: OperationKind;
  readonly title: string;
  readonly reference: string | null;
  readonly equipmentId: string | null;
  readonly location: string | null;
  readonly occurredAt: string | null;
  readonly dueAt: string | null;
  readonly status: OperationStatus;
  readonly technicianId: string | null;
  readonly technicianName: string | null;
  readonly certificateNumber: string | null;
  readonly certificateCategory: string | null;
  readonly certificateExpiresAt: string | null;
  readonly refrigerant: string | null;
  readonly quantityKg: number | null;
  readonly movementType: 'charge' | 'recovery' | 'transfer' | 'disposal' | null;
  readonly result: 'pass' | 'conditional' | 'fail' | null;
  readonly leakDetected: boolean | null;
  readonly repairRequired: boolean | null;
  readonly followUpDueAt: string | null;
  readonly notes: string | null;
  readonly evidenceRefs: readonly string[];
  readonly version: number;
  readonly updatedAt: string;
  readonly archivedAt: string | null;
}
export interface OperationDraft {
  title: string;
  reference: string;
  equipmentId: string;
  location: string;
  occurredAt: string;
  dueAt: string;
  status: OperationStatus;
  technicianName: string;
  certificateNumber: string;
  certificateCategory: string;
  certificateExpiresAt: string;
  refrigerant: string;
  quantityKg: number;
  movementType: 'charge' | 'recovery' | 'transfer' | 'disposal';
  result: 'pass' | 'conditional' | 'fail';
  leakDetected: boolean;
  repairRequired: boolean;
  followUpDueAt: string;
  notes: string;
  evidenceRefs: string;
}
interface Envelope<T> {
  readonly data: T;
}
@Injectable({ providedIn: 'root' })
export class FgasOperationsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/fgas/operations`;
  async list(
    kind: OperationKind,
    filters: { search?: string; archived?: boolean; status?: string } = {},
  ): Promise<{ items: FgasOperation[]; nextCursor: string | null }> {
    let params = new HttpParams().set('limit', 100).set('archived', Boolean(filters.archived));
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters.status) params = params.set('status', filters.status);
    return this.request(
      this.http.get<Envelope<{ items: FgasOperation[]; nextCursor: string | null }>>(
        `${this.base}/${kind}`,
        { params },
      ),
    );
  }
  create(kind: OperationKind, draft: OperationDraft) {
    return this.request(
      this.http.post<Envelope<FgasOperation>>(`${this.base}/${kind}`, this.payload(draft)),
    );
  }
  update(kind: OperationKind, row: FgasOperation, draft: OperationDraft) {
    return this.request(
      this.http.patch<Envelope<FgasOperation>>(
        `${this.base}/${kind}/${encodeURIComponent(row.id)}`,
        { ...this.payload(draft), expectedVersion: row.version },
      ),
    );
  }
  archive(kind: OperationKind, id: string) {
    return this.request(
      this.http.delete<Envelope<FgasOperation>>(`${this.base}/${kind}/${encodeURIComponent(id)}`),
    );
  }
  restore(kind: OperationKind, id: string) {
    return this.request(
      this.http.post<Envelope<FgasOperation>>(
        `${this.base}/${kind}/${encodeURIComponent(id)}/restore`,
        {},
      ),
    );
  }
  complianceReport() {
    return this.request(
      this.http.get<Envelope<Record<string, unknown>>>(
        `${environment.apiBaseUrl}/fgas/reports/compliance`,
      ),
    );
  }
  private payload(draft: OperationDraft): Record<string, unknown> {
    const optional = (value: string) => value.trim() || undefined;
    return {
      ...draft,
      title: draft.title.trim(),
      reference: optional(draft.reference),
      equipmentId: optional(draft.equipmentId),
      location: optional(draft.location),
      occurredAt: optional(draft.occurredAt),
      dueAt: optional(draft.dueAt),
      technicianName: optional(draft.technicianName),
      certificateNumber: optional(draft.certificateNumber),
      certificateCategory: optional(draft.certificateCategory),
      certificateExpiresAt: optional(draft.certificateExpiresAt),
      refrigerant: optional(draft.refrigerant),
      followUpDueAt: optional(draft.followUpDueAt),
      notes: optional(draft.notes),
      quantityKg: draft.quantityKg || undefined,
      evidenceRefs: draft.evidenceRefs
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };
  }
  private async request<T>(source: Observable<Envelope<T>>): Promise<T> {
    try {
      return (await firstValueFrom(source)).data;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        throw new Error(apiErrorDetails(error, 'MainAPI isteği tamamlanamadı.').message);
      }
      throw error;
    }
  }
}
