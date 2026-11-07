import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideOdivonApi } from './core/api/api';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes), provideOdivonApi()],
};

registerLocaleData(localeTr, 'tr-TR');
