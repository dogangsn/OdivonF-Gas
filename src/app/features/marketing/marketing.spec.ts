import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import axe from 'axe-core';
import { Co2CalculatorPage, refrigerantLabel } from './co2-calculator-page';
import { HomePage } from './home-page';
import { PricingPage } from './pricing-page';
import { co2EquivalentTonnes, leakCheckIntervalMonths, refrigerantGwp } from './refrigerants';

registerLocaleData(localeTr, 'tr-TR');

async function blockingViolations(component: unknown) {
  await TestBed.configureTestingModule({
    imports: [component as never],
    providers: [provideRouter([])],
  }).compileComponents();
  const fixture = TestBed.createComponent(component as never);
  await fixture.whenStable();
  const result = await axe.run(fixture.nativeElement as HTMLElement, {
    resultTypes: ['violations'],
  });
  return result.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

describe('marketing refrigerant rules', () => {
  it('matches the MainAPI GWP values and thresholds', () => {
    expect(refrigerantGwp('R410A')).toBe(2256);
    expect(refrigerantGwp('R404A')).toBe(4728);
    expect(co2EquivalentTonnes(25, 2256)).toBe(56.4);
    expect(
      leakCheckIntervalMonths({
        co2EquivalentTonnes: 56.4,
        hermeticallySealed: false,
        leakDetectionSystem: false,
        equipmentType: 'air-conditioning',
      }),
    ).toBe(6);
  });

  it('formats refrigerant names the industry way', () => {
    expect(refrigerantLabel('R410A')).toBe('R-410A');
    expect(refrigerantLabel('R134A')).toBe('R-134a');
    expect(refrigerantLabel('R1234ZE')).toBe('R-1234ze(E)');
    expect(refrigerantLabel('R32')).toBe('R-32');
  });
});

describe('marketing pages accessibility', () => {
  it('home page has no critical or serious AXE violations', async () => {
    expect(await blockingViolations(HomePage)).toEqual([]);
  });
  it('pricing page has no critical or serious AXE violations', async () => {
    expect(await blockingViolations(PricingPage)).toEqual([]);
  });
  it('calculator page has no critical or serious AXE violations', async () => {
    expect(await blockingViolations(Co2CalculatorPage)).toEqual([]);
  });
});
