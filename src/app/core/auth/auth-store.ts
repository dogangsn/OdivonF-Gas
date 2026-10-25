import { Injectable, computed, inject, signal } from '@angular/core';
import { FirebaseIdentity } from './firebase-identity';
import { IdentityApi, IdentityProfile } from './identity-api';

export interface AppSession {
  readonly name: string;
  readonly email: string;
  readonly tenantId: string | null;
  readonly tenantName: string | null;
  readonly emailVerified: boolean;
  readonly trialEndsAt: string | null;
  readonly role: 'owner' | 'admin' | 'user';
  readonly membershipStatus: string;
  readonly subscriptionEndsAt: string | null;
  readonly inGrace: boolean;
  readonly onboardingCompleted: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly identity = inject(FirebaseIdentity);
  private readonly identityApi = inject(IdentityApi);
  private readonly storageKey = 'odivon:session';
  readonly session = signal<AppSession | null>(this.restore());
  readonly isAuthenticated = computed(() => this.session() !== null);
  private hydration?: Promise<AppSession | null>;

  async signIn(email: string, password: string): Promise<void> {
    if (!this.identity.configured) throw new Error('Firebase Auth is not configured.');
    const user = await this.identity.signIn(email, password);
    const profile = await this.identityApi.me();
    this.persist(this.toSession(profile, user.displayName || email.split('@')[0]));
  }
  async register(name: string, company: string, email: string, password: string): Promise<void> {
    await this.identityApi.register({ name, company, email, password });
    const user = await this.identity.signIn(email, password);
    const profile = await this.identityApi.me();
    this.persist(this.toSession(profile, user.displayName || name));
  }
  async ensureSession(): Promise<AppSession | null> {
    if (this.hydration) return this.hydration;
    this.hydration = this.hydrate();
    return this.hydration;
  }
  async resetPassword(email: string): Promise<void> {
    await this.identity.resetPassword(email);
  }
  async resendVerification(): Promise<void> {
    const email = this.session()?.email;
    if (!email) throw new Error('Oturum bulunamadı.');
    await this.identityApi.resendVerification(email);
  }
  async refreshVerification(): Promise<boolean> {
    const user = await this.identity.refreshUser();
    if (!user) return false;
    const profile = await this.identityApi.me();
    this.persist(this.toSession(profile, user.displayName || profile.email.split('@')[0]));
    return profile.emailVerified;
  }
  async refreshProfile(): Promise<AppSession | null> {
    const user = await this.identity.refreshUser();
    if (!user) return null;
    const profile = await this.identityApi.me();
    const session = this.toSession(profile, user.displayName || profile.email.split('@')[0]);
    this.persist(session);
    return session;
  }
  logout(): void {
    void this.identity.logout();
    localStorage.removeItem(this.storageKey);
    this.session.set(null);
  }
  private persist(session: AppSession): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.session.set(session);
  }
  private restore(): AppSession | null {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) ?? 'null') as AppSession | null;
    } catch {
      return null;
    }
  }
  private toSession(profile: IdentityProfile, fallbackName: string): AppSession {
    return {
      name: profile.displayName || fallbackName,
      email: profile.email,
      tenantId: profile.tenantId,
      tenantName: profile.tenant.name,
      emailVerified: profile.emailVerified,
      trialEndsAt: profile.trialEndsAt,
      role: profile.role,
      membershipStatus: profile.membershipStatus,
      subscriptionEndsAt: profile.tenant.subscriptionEndsAt,
      inGrace: profile.tenant.inGrace,
      onboardingCompleted: profile.onboardingCompleted,
    };
  }
  private async hydrate(): Promise<AppSession | null> {
    try {
      await this.identity.initialize();
      const user = this.identity.user();
      if (!user) {
        this.clear();
        return null;
      }
      const profile = await this.identityApi.me();
      const session = this.toSession(profile, user.displayName || profile.email.split('@')[0]);
      this.persist(session);
      return session;
    } catch {
      this.clear();
      return null;
    }
  }
  private clear(): void {
    localStorage.removeItem(this.storageKey);
    this.session.set(null);
  }
}
