import { TestBed } from '@angular/core/testing';
import { I18nStore } from './i18n';

describe('I18nStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('dir');
    document.documentElement.classList.remove('rtl');
    TestBed.configureTestingModule({});
  });
  it('supports all eight product languages without falling back for navigation', () => {
    const store = TestBed.inject(I18nStore);
    for (const language of store.options) {
      store.setLanguage(language.code);
      expect(store.t('nav.equipment')).not.toBe('nav.equipment');
    }
    expect(store.options).toHaveLength(8);
  });
  it('switches the document to RTL for Arabic and returns to LTR', () => {
    const store = TestBed.inject(I18nStore);
    store.setLanguage('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.classList.contains('rtl')).toBe(true);
    store.setLanguage('tr');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.classList.contains('rtl')).toBe(false);
  });
});
