import { Component, inject, signal } from '@angular/core';
import {
  email,
  FormField,
  form,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth-store';
import { I18nStore, SupportedLang, TranslatePipe } from '../../core/i18n/i18n';
import { PRODUCT } from '../../domain/product-manifest';

@Component({
  selector: 'app-auth-page',
  imports: [FormField, RouterLink, TranslatePipe],
  template: `
    <main class="min-h-screen bg-slate-950 text-white lg:grid lg:grid-cols-[1.08fr_.92fr]">
      <section
        class="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-800 to-slate-950 p-12 lg:flex lg:flex-col lg:justify-between"
      >
        <div
          class="absolute -start-20 top-20 size-80 rounded-full bg-fuchsia-400/20 blur-3xl"
        ></div>
        <div class="relative flex items-center gap-3">
          <span
            class="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950/40"
            ><span class="material-symbols-rounded">verified_user</span></span
          >
          <div>
            <strong class="text-xl">Odivon</strong
            ><span class="block text-xs text-indigo-200">F-Gas Uyum</span>
          </div>
        </div>
        <div class="relative max-w-2xl">
          <span
            class="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold"
            >{{ 'auth.platform' | t }}</span
          >
          <h1 class="m-0 text-4xl font-black leading-tight xl:text-[2.75rem]">
            {{ 'auth.headline' | t }}
          </h1>
          <p class="mt-6 max-w-xl text-base leading-7 text-indigo-100">
            {{ product.promiseKey | t }}
          </p>
          <ul class="mt-8 space-y-3 text-sm text-indigo-50">
            @for (key of benefits; track key) {
              <li class="flex items-start gap-3">
                <span
                  class="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"
                  ><span class="material-symbols-rounded !text-[16px]" aria-hidden="true"
                    >check</span
                  ></span
                >{{ key | t }}
              </li>
            }
          </ul>
          <!-- Sample of the check schedule the workspace keeps -->
          <div
            class="mt-10 max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur"
            aria-hidden="true"
          >
            <div
              class="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs font-bold"
            >
              <span>{{ 'auth.previewTitle' | t }}</span>
              <span class="rounded-full bg-rose-400/20 px-2.5 py-0.5 text-rose-200"
                >1 · {{ 'auth.previewOverdue' | t }}</span
              >
            </div>
            @for (row of preview; track row.name) {
              <div
                class="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-3 text-sm last:border-0"
              >
                <span class="min-w-0">
                  <strong class="block truncate">{{ row.name }}</strong
                  ><span class="text-xs text-indigo-200">{{ row.gas }}</span>
                </span>
                <span class="shrink-0 text-end text-xs">
                  <strong class="block">{{ row.date }}</strong
                  ><span [class]="row.tone">{{ row.state | t }}</span>
                </span>
              </div>
            }
          </div>
        </div>
        <p class="relative text-xs text-indigo-300">{{ 'auth.cloud' | t }}</p>
      </section>
      <section
        class="relative flex min-h-screen items-center justify-center bg-slate-50 p-5 text-slate-900 dark:bg-[#0b1120] dark:text-white"
      >
        <a
          routerLink="/"
          class="absolute start-5 top-6 inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400"
          ><span class="material-symbols-rounded directional-icon !text-base" aria-hidden="true"
            >arrow_back</span
          >{{ 'auth.backHome' | t }}</a
        >
        <label class="absolute end-5 top-5">
          <span class="sr-only">{{ 'auth.language' | t }}</span>
          <select
            class="odv-input min-w-36 py-2 text-xs font-bold"
            [value]="i18n.currentLang()"
            (change)="setLanguage($event)"
          >
            @for (language of i18n.options; track language.code) {
              <option [value]="language.code">{{ language.flag }} {{ language.nativeName }}</option>
            }
          </select>
        </label>
        <div class="w-full max-w-md">
          <div class="mb-8 flex items-center gap-3 lg:hidden">
            <span class="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white"
              ><span class="material-symbols-rounded">verified_user</span></span
            ><strong>Odivon · F-Gas</strong>
          </div>
          <div class="mb-8">
            <span class="text-xs font-extrabold uppercase tracking-[.18em] text-indigo-600">{{
              (isRegister ? 'auth.newWorkspace' : 'auth.welcomeBack') | t
            }}</span>
            <h2 class="mb-2 mt-3 text-3xl font-black">
              {{ (isRegister ? 'auth.registerTitle' : 'auth.loginTitle') | t }}
            </h2>
            <p class="m-0 text-sm text-slate-500">
              {{ (isRegister ? 'auth.registerDesc' : 'auth.loginDesc') | t }}
            </p>
          </div>
          <form class="space-y-4" (submit)="onSubmit($event)">
            @if (isRegister) {
              <label class="block"
                ><span class="mb-1.5 block text-xs font-bold">{{ 'auth.fullName' | t }}</span
                ><input class="odv-input" [formField]="authForm.name" autocomplete="name" />
                @if (authForm.name().touched() && authForm.name().invalid()) {
                  <span class="mt-1 block text-xs text-rose-600">{{
                    'auth.nameRequired' | t
                  }}</span>
                }</label
              ><label class="block"
                ><span class="mb-1.5 block text-xs font-bold">{{ 'auth.company' | t }}</span
                ><input
                  class="odv-input"
                  [formField]="authForm.company"
                  autocomplete="organization"
              /></label>
            }
            <label class="block"
              ><span class="mb-1.5 block text-xs font-bold">{{ 'auth.email' | t }}</span
              ><input
                class="odv-input"
                type="email"
                [formField]="authForm.email"
                autocomplete="email"
              />
              @if (authForm.email().touched() && authForm.email().invalid()) {
                <span class="mt-1 block text-xs text-rose-600">{{ 'auth.emailInvalid' | t }}</span>
              }
            </label>
            @if (!isRegister) {
              <div class="-mt-2 text-end">
                <a
                  class="text-xs font-bold text-indigo-600 hover:underline"
                  routerLink="/forgot-password"
                  >{{ 'auth.forgot' | t }}</a
                >
              </div>
            }
            <label class="block"
              ><span class="mb-1.5 block text-xs font-bold">{{ 'auth.password' | t }}</span>
              <div class="relative">
                <input
                  class="odv-input pe-12"
                  [type]="showPassword() ? 'text' : 'password'"
                  [formField]="authForm.password"
                  [autocomplete]="isRegister ? 'new-password' : 'current-password'"
                /><button
                  class="odv-icon-btn absolute end-1 top-1/2 -translate-y-1/2"
                  type="button"
                  (click)="showPassword.update((v) => !v)"
                  [attr.aria-label]="
                    (showPassword() ? 'auth.hidePassword' : 'auth.showPassword') | t
                  "
                >
                  <span class="material-symbols-rounded">{{
                    showPassword() ? 'visibility_off' : 'visibility'
                  }}</span>
                </button>
              </div>
              @if (authForm.password().touched() && authForm.password().invalid()) {
                <span class="mt-1 block text-xs text-rose-600">{{ 'auth.passwordRule' | t }}</span>
              }
            </label>
            @if (isRegister) {
              <label
                class="flex items-start gap-3 rounded-xl bg-slate-100 p-3 text-xs leading-5 dark:bg-slate-800"
              >
                <input
                  class="mt-1 size-4 accent-indigo-600"
                  type="checkbox"
                  [checked]="consent()"
                  (change)="consent.set($any($event.target).checked)"
                />
                <span
                  ><a class="font-bold text-indigo-600" href="/legal/terms" target="_blank">{{
                    'auth.terms' | t
                  }}</a>
                  {{ 'auth.consentJoin' | t }}
                  <a class="font-bold text-indigo-600" href="/legal/privacy" target="_blank">{{
                    'auth.privacy' | t
                  }}</a>
                  {{ 'auth.consentSuffix' | t }}</span
                >
              </label>
            }
            @if (error()) {
              <div
                role="alert"
                class="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700"
              >
                {{ error() }}
              </div>
            }
            <button class="odv-btn-primary w-full" type="submit" [disabled]="busy()">
              {{ (busy() ? 'auth.processing' : isRegister ? 'auth.register' : 'auth.login') | t }}
            </button>
          </form>
          @if (isRegister) {
            <p class="mt-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              {{ 'auth.trialNote' | t }}
            </p>
          }
          <p class="mt-6 text-center text-sm text-slate-500">
            {{ (isRegister ? 'auth.hasAccount' : 'auth.noAccount') | t }}
            <a
              class="font-bold text-indigo-600 hover:underline"
              [routerLink]="isRegister ? '/login' : '/register'"
              >{{ (isRegister ? 'auth.loginLink' : 'auth.registerLink') | t }}</a
            >
          </p>
          @if (!isRegister) {
            <p class="mt-8 text-center text-[11px] leading-5 text-slate-400">
              {{ 'auth.security' | t }}
            </p>
          }
        </div>
      </section>
    </main>
  `,
})
export class AuthPage {
  readonly benefits = ['auth.benefitAuto', 'auth.benefitSchedule', 'auth.benefitAudit'] as const;
  readonly preview = [
    {
      name: 'Soğuk oda kompresörü',
      gas: 'R-404A · 12 kg · 56,7 t CO₂e',
      date: '02.11.2026',
      state: 'auth.previewOverdue',
      tone: 'font-bold text-rose-300',
    },
    {
      name: 'VRF dış ünite',
      gas: 'R-410A · 15 kg · 33,8 t CO₂e',
      date: '21.11.2026',
      state: 'auth.previewSoon',
      tone: 'font-bold text-amber-300',
    },
    {
      name: 'Isı pompası',
      gas: 'R-32 · 18 kg · 13,9 t CO₂e',
      date: '14.03.2027',
      state: 'auth.previewOk',
      tone: 'font-bold text-emerald-300',
    },
  ] as const;
  readonly product = PRODUCT;
  readonly i18n = inject(I18nStore);
  readonly isRegister = inject(ActivatedRoute).snapshot.data['mode'] === 'register';
  readonly showPassword = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly consent = signal(false);
  readonly model = signal({ name: '', company: '', email: '', password: '' });
  readonly authForm = form(this.model, (p) => {
    if (this.isRegister) required(p.name);
    if (this.isRegister) required(p.company);
    required(p.email);
    email(p.email);
    required(p.password);
    minLength(p.password, this.isRegister ? 10 : 8);
    if (this.isRegister)
      validate(p.password, ({ value }) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(value())
          ? undefined
          : { kind: 'passwordStrength', message: 'Şifre yeterince güçlü değil.' },
      );
  });
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  setLanguage(event: Event): void {
    this.i18n.setLanguage((event.target as HTMLSelectElement).value as SupportedLang);
  }
  onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.authForm, async () => {
      this.busy.set(true);
      this.error.set('');
      try {
        const value = this.model();
        if (this.isRegister && !this.consent()) {
          this.error.set(
            'Hesap oluşturmak için kullanım koşulları ve gizlilik bildirimini kabul edin.',
          );
          return;
        }
        if (this.isRegister)
          await this.auth.register(value.name, value.company, value.email, value.password);
        else await this.auth.signIn(value.email, value.password);
        await this.router.navigateByUrl(
          this.auth.session()?.emailVerified ? '/overview' : '/verify-email',
        );
      } catch (caught) {
        this.error.set(this.authError(caught));
      } finally {
        this.busy.set(false);
      }
    });
  }
  private authError(caught: unknown): string {
    const code = (caught as { code?: string } | null)?.code ?? '';
    if (
      code.includes('invalid-credential') ||
      code.includes('wrong-password') ||
      code.includes('user-not-found')
    )
      return 'E-posta veya şifre hatalı.';
    if (code.includes('email-already-in-use') || code === 'EMAIL_ALREADY_EXISTS')
      return 'Bu e-posta adresiyle daha önce hesap oluşturulmuş.';
    if (code.includes('too-many-requests') || code === 'TOO_MANY_REQUESTS')
      return 'Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.';
    if (code.includes('network-request-failed'))
      return 'Ağ bağlantısı kurulamadı. İnternet bağlantınızı kontrol edin.';
    if (code.includes('weak-password')) return 'Şifre güvenlik koşullarını karşılamıyor.';
    const message = caught instanceof Error ? caught.message : '';
    return message && !message.startsWith('Firebase:')
      ? message
      : 'İşlem tamamlanamadı. Bilgilerinizi kontrol edip tekrar deneyin.';
  }
}
