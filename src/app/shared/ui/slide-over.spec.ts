import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import Swal from 'sweetalert2';
import { SlideOver } from './slide-over';

@Component({
  imports: [SlideOver],
  template: `<button id="opener" (click)="open.set(true)">Aç</button
    ><app-slide-over [open]="open()" [dirty]="dirty()" title="Test" (closed)="open.set(false)"
      ><input id="first" /><button id="last" type="button">Son</button></app-slide-over
    >`,
})
class Host {
  readonly open = signal(false);
  readonly dirty = signal(false);
}

describe('SlideOver', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  });
  it('traps keyboard focus and restores it to the opener', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const opener = fixture.nativeElement.querySelector('#opener') as HTMLButtonElement;
    opener.focus();
    opener.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const panel = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    const last = fixture.nativeElement.querySelector('#last') as HTMLButtonElement;
    last.focus();
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).not.toBe(document.body);
    const close = panel.querySelector('[aria-label="Kapat"]') as HTMLButtonElement;
    close.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(opener);
  });
  it('protects dirty form content when confirmation is cancelled', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.open.set(true);
    fixture.componentInstance.dirty.set(true);
    fixture.detectChanges();
    vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: false } as never);
    const close = fixture.nativeElement.querySelector('[aria-label="Kapat"]') as HTMLButtonElement;
    close.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(true);
  });
});
