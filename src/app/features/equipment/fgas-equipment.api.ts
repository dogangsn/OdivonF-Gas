import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type EquipmentType =
  | 'stationary-refrigeration'
  | 'air-conditioning'
  | 'heat-pump'
  | 'transport-refrigeration'
  | 'fire-protection'
  | 'switchgear'
  | 'other';
export type EquipmentStatus = 'active' | 'action-required' | 'out-of-service';
export type InspectionInterval = 3 | 6 | 12 | 24;

export interface FgasEquipment {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly location: string;
  readonly equipmentCode: string | null;
  readonly equipmentType: EquipmentType;
  readonly manufacturer: string | null;
  readonly model: string | null;
  readonly serialNumber: string | null;
  readonly refrigerant: string | null;
  readonly refrigerantChargeKg: number | null;
  readonly co2EquivalentTonnes: number | null;
  readonly hermeticallySealed: boolean;
  readonly leakDetectionSystem: boolean;
  readonly installationDate: string | null;
  readonly lastLeakCheckAt: string | null;
  readonly nextLeakCheckDueAt: string | null;
  readonly responsiblePerson: string | null;
  readonly inspectionIntervalMonths: InspectionInterval | null;
  readonly notes: string | null;
  readonly status: EquipmentStatus;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt: string | null;
}

export interface EquipmentDraft {
  name: string;
  location: string;
  equipmentCode: string;
  equipmentType: EquipmentType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  refrigerant: string;
  refrigerantChargeKg: number;
  co2EquivalentTonnes: number;
  hermeticallySealed: boolean;
  leakDetectionSystem: boolean;
  installationDate: string;
  lastLeakCheckAt: string;
  nextLeakCheckDueAt: string;
  responsiblePerson: string;
  inspectionIntervalMonths: InspectionInterval;
  notes: string;
  status: EquipmentStatus;
}

export interface FgasDashboard {
  readonly totalEquipment: number;
  readonly activeEquipment: number;
  readonly actionRequired: number;
  readonly overdueLeakChecks: number;
  readonly refrigerantChargeKg: number;
  readonly co2EquivalentTonnes: number;
}

export interface AuditEntry {
  readonly id: string;
  readonly event: string;
  readonly entityId: string;
  readonly version: number;
  readonly actorId: string;
  readonly createdAt: string;
}

interface ApiEnvelope<T> {
  readonly success: true;
  readonly data: T;
  readonly meta: { readonly requestId: string };
}

interface EquipmentList {
  readonly items: FgasEquipment[];
  readonly nextCursor: string | null;
}

export class FgasApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly requestId: string | null,
  ) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class FgasEquipmentApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/fgas`;

  async list(filters: { search?: string; archived?: boolean } = {}): Promise<EquipmentList> {
    let params = new HttpParams().set('limit', 100).set('archived', Boolean(filters.archived));
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    return this.request(
      this.http.get<ApiEnvelope<EquipmentList>>(`${this.endpoint}/records`, { params }),
    );
  }

  dashboard(): Promise<FgasDashboard> {
    return this.request(this.http.get<ApiEnvelope<FgasDashboard>>(`${this.endpoint}/dashboard`));
  }

  audit(id: string): Promise<AuditEntry[]> {
    return this.request(
      this.http.get<ApiEnvelope<AuditEntry[]>>(
        `${this.endpoint}/records/${encodeURIComponent(id)}/audit`,
      ),
    );
  }

  create(draft: EquipmentDraft): Promise<FgasEquipment> {
    return this.request(
      this.http.post<ApiEnvelope<FgasEquipment>>(`${this.endpoint}/records`, this.payload(draft)),
    );
  }

  update(id: string, version: number, draft: EquipmentDraft): Promise<FgasEquipment> {
    return this.request(
      this.http.patch<ApiEnvelope<FgasEquipment>>(
        `${this.endpoint}/records/${encodeURIComponent(id)}`,
        {
          ...this.payload(draft),
          expectedVersion: version,
        },
      ),
    );
  }

  archive(id: string): Promise<FgasEquipment> {
    return this.request(
      this.http.delete<ApiEnvelope<FgasEquipment>>(
        `${this.endpoint}/records/${encodeURIComponent(id)}`,
      ),
    );
  }

  restore(id: string): Promise<FgasEquipment> {
    return this.request(
      this.http.post<ApiEnvelope<FgasEquipment>>(
        `${this.endpoint}/records/${encodeURIComponent(id)}/restore`,
        {},
      ),
    );
  }

  private payload(draft: EquipmentDraft): Record<string, unknown> {
    const optional = (value: string) => value.trim() || undefined;
    return {
      ...draft,
      name: draft.name.trim(),
      location: draft.location.trim(),
      equipmentCode: optional(draft.equipmentCode),
      manufacturer: optional(draft.manufacturer),
      model: optional(draft.model),
      serialNumber: optional(draft.serialNumber),
      refrigerant: optional(draft.refrigerant),
      installationDate: optional(draft.installationDate),
      lastLeakCheckAt: optional(draft.lastLeakCheckAt),
      nextLeakCheckDueAt: optional(draft.nextLeakCheckDueAt),
      responsiblePerson: optional(draft.responsiblePerson),
      notes: optional(draft.notes),
    };
  }

  private async request<T>(observable: Observable<ApiEnvelope<T>>): Promise<T> {
    try {
      const envelope = (await firstValueFrom(observable)) as ApiEnvelope<T>;
      return envelope.data;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        const body = error.error as { code?: string; message?: string; requestId?: string } | null;
        throw new FgasApiError(
          error.status,
          body?.code ?? 'REQUEST_FAILED',
          body?.message ?? 'İşlem tamamlanamadı.',
          body?.requestId ?? error.headers.get('x-request-id'),
        );
      }
      throw error;
    }
  }
}
