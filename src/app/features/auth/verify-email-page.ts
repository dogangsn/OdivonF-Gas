import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/auth/auth-store';

@Component({
  selector: 'app-verify-email-page',
  template: `
    <main class="grid min-h-screen place-items-center bg-slate-50 p-5 dark:bg-[#0b1120]">
      <section
        class="odv-card w-full max-w-lg p-7 text-center sm:p-10"
        aria-labelledby="verify-title"
      >
        <span
          class="mx-auto grid size-16 place-items-center rounded-3xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
          ><span class="material-symbols-rounded !text-3xl">mark_email_unread</span></span
        >
        <h1 id="verify-title" class="mb-3 mt-6 text-3xl font-black">
          E-posta adresinizi doğrulayın
        </h1>
        <p class="mx-auto max-w-md text-sm leading-6 text-slate-500">
          <strong>{{ auth.session()?.email }}</strong> adresine gönderilen bağlantıyı açın. Bu
          kontrol tenant verilerinizi ve denetim kayıtlarınızı korur.
        </p>
        @if (message()) {
          <div
            role="status"
            class="my-5 rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200"
          >
            {{ message() }}
          </div>
        }
        @if (error()) {
          <div
            role="alert"
            class="my-5 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700"
          >
            {{ error() }}
          </div>
        }
        <div class="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" class="odv-btn-primary" [disabled]="busy()" (click)="check()">
            <span class="material-symbols-rounded">refresh</span>Doğrulamayı kontrol et
          </button>
          <button
            type="button"
            class="odv-btn-ghost border border-slate-200 dark:border-slate-700"
            [disabled]="busy() || cooldown() > 0"
            (click)="resend()"
          >
            {{ cooldown() > 0 ? cooldown() + ' sn sonra gönder' : 'E-postayı yeniden gönder' }}
          </button>
        </div>
        <button
          type="button"
          class="mt-6 text-xs font-bold text-slate-500 hover:text-rose-600"
          (click)="logout()"
        >
          Farklı hesapla giriş yap
        </button>
      </section>
    </main>
  `,
})
export class VerifyEmailPage {
  readonly auth = inject(AuthStore);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly cooldown = signal(0);
  private readonly router = inject(Router);
  private timer?: ReturnType<typeof setInterval>;
  async check(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      if (await this.auth.refreshVerification()) await this.router.navigateByUrl('/overview');
      else
        this.message.set(
          'Doğrulama henüz görünmüyor. Bağlantıyı açtıktan sonra tekrar kontrol edin.',
        );
    } catch {
      this.error.set('Doğrulama durumu alınamadı. Tekrar deneyin.');
    } finally {
      this.busy.set(false);
    }
  }
  async resend(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.resendVerification();
      this.message.set('Yeni doğrulama e-postası gönderildi.');
      this.cooldown.set(60);
      this.timer = setInterval(() => {
        this.cooldown.update((v) => Math.max(0, v - 1));
        if (!this.cooldown() && this.timer) clearInterval(this.timer);
      }, 1000);
    } catch {
      this.error.set('E-posta yeniden gönderilemedi. Birkaç dakika sonra tekrar deneyin.');
    } finally {
      this.busy.set(false);
    }
  }
  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
