import { Injectable, signal } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  AppCheck,
  ReCaptchaEnterpriseProvider,
  getToken,
  initializeAppCheck,
} from 'firebase/app-check';
import {
  Auth,
  User,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  reload,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseIdentity {
  readonly user = signal<User | null>(null);
  private app?: FirebaseApp;
  private auth?: Auth;
  private appCheck?: AppCheck;
  private initialization?: Promise<void>;

  readonly configured = Boolean(environment.firebase.apiKey);

  async initialize(): Promise<void> {
    if (this.initialization) return this.initialization;
    this.initialization = this.initializeInternal();
    return this.initialization;
  }

  private async initializeInternal(): Promise<void> {
    if (this.app || !environment.firebase.apiKey) return;
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    await setPersistence(this.auth, browserLocalPersistence);
    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth!, (user) => {
        this.user.set(user);
        unsubscribe();
        onAuthStateChanged(this.auth!, (nextUser) => this.user.set(nextUser));
        resolve();
      });
    });
    if (environment.appCheckSiteKey) {
      this.appCheck = initializeAppCheck(this.app, {
        provider: new ReCaptchaEnterpriseProvider(environment.appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }
  }

  async idToken(): Promise<string | null> {
    await this.initialize();
    return this.auth?.currentUser?.getIdToken() ?? null;
  }

  async requestHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    const token = await this.idToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (this.appCheck) {
      const result = await getToken(this.appCheck, false);
      headers['X-Firebase-AppCheck'] = result.token;
    }
    return headers;
  }

  async signIn(email: string, password: string): Promise<User> {
    await this.initialize();
    if (!this.auth) throw new Error('Firebase Auth is not configured.');
    return (await signInWithEmailAndPassword(this.auth, email, password)).user;
  }

  async logout(): Promise<void> {
    await this.initialize();
    if (this.auth) await signOut(this.auth);
  }

  async resetPassword(email: string): Promise<void> {
    await this.initialize();
    if (!this.auth) throw new Error('Firebase Auth is not configured.');
    await sendPasswordResetEmail(this.auth, email.trim().toLowerCase());
  }

  async refreshUser(): Promise<User | null> {
    await this.initialize();
    if (!this.auth?.currentUser) return null;
    await reload(this.auth.currentUser);
    await this.auth.currentUser.getIdToken(true);
    this.user.set(this.auth.currentUser);
    return this.auth.currentUser;
  }
}
