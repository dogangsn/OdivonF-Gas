/**
 * Public CO2e calculator rules, mirrored from MainAPI
 * (`src/modules/fgas/fgas.compliance.ts`). Keep both tables in sync.
 * GWP values: Regulation (EU) 2024/573 Annex I (IPCC AR6, 100-year).
 */

export const COMPONENT_GWP: Record<string, number> = {
  R23: 14600,
  R32: 771,
  R125: 3740,
  R134A: 1530,
  R143A: 5810,
  R152A: 164,
  R227EA: 3600,
  R236FA: 8690,
  R245FA: 962,
  R365MFC: 914,
  R1234YF: 0.501,
  R1234ZE: 1.37,
  R1233ZD: 3.88,
  R290: 0.02,
  R600: 0,
  R600A: 0,
  R601: 0,
  R601A: 0,
  R744: 1,
  SF6: 25200,
};

/** Mass fractions of common blends (sum = 1). */
export const BLENDS: Record<string, Record<string, number>> = {
  R404A: { R125: 0.44, R143A: 0.52, R134A: 0.04 },
  R407A: { R32: 0.2, R125: 0.4, R134A: 0.4 },
  R407C: { R32: 0.23, R125: 0.25, R134A: 0.52 },
  R407F: { R32: 0.3, R125: 0.3, R134A: 0.4 },
  R410A: { R32: 0.5, R125: 0.5 },
  R417A: { R125: 0.466, R134A: 0.5, R600: 0.034 },
  R422D: { R125: 0.651, R134A: 0.315, R600A: 0.034 },
  R427A: { R32: 0.15, R125: 0.25, R143A: 0.1, R134A: 0.5 },
  R434A: { R125: 0.632, R143A: 0.18, R134A: 0.16, R600A: 0.028 },
  R437A: { R125: 0.195, R134A: 0.785, R600: 0.014, R601: 0.006 },
  R438A: { R32: 0.085, R125: 0.455, R134A: 0.441, R600: 0.017, R601A: 0.002 },
  R442A: { R32: 0.31, R125: 0.31, R134A: 0.3, R152A: 0.03, R227EA: 0.05 },
  R448A: { R32: 0.26, R125: 0.26, R1234YF: 0.2, R134A: 0.21, R1234ZE: 0.07 },
  R449A: { R32: 0.243, R125: 0.247, R1234YF: 0.253, R134A: 0.257 },
  R452A: { R32: 0.11, R125: 0.59, R1234YF: 0.3 },
  R452B: { R32: 0.67, R125: 0.07, R1234YF: 0.26 },
  R454B: { R32: 0.689, R1234YF: 0.311 },
  R454C: { R32: 0.215, R1234YF: 0.785 },
  R455A: { R744: 0.03, R32: 0.215, R1234YF: 0.755 },
  R507A: { R125: 0.5, R143A: 0.5 },
  R513A: { R1234YF: 0.44, R134A: 0.56 },
  R515B: { R1234ZE: 0.911, R227EA: 0.089 },
};

/** Normalises user input such as "r-410a", "R 410A" or "HFC-134a" to "R410A". */
export function normalizeRefrigerant(value: string | null | undefined): string | null {
  if (!value) return null;
  const compact = value.toUpperCase().replace(/[\s\-_]/g, '');
  if (compact === 'SF6') return 'SF6';
  const match = /^(?:R|HFC|HFO|HCFO|HC)?(\d{2,4}[A-Z]{0,3})(?:\(E\))?$/.exec(compact);
  return match ? `R${match[1].replace('(E)', '')}` : null;
}

/** GWP of a refrigerant, or null when it is not in the table. */
export function refrigerantGwp(value: string | null | undefined): number | null {
  const key = normalizeRefrigerant(value);
  if (!key) return null;
  if (key in COMPONENT_GWP) return COMPONENT_GWP[key];
  const blend = BLENDS[key];
  if (!blend) return null;
  let total = 0;
  for (const [component, fraction] of Object.entries(blend)) {
    total += (COMPONENT_GWP[component] ?? 0) * fraction;
  }
  return Math.round(total);
}

/** Tonnes CO2 equivalent = kg × GWP / 1000, rounded to 3 decimals. */
export function co2EquivalentTonnes(chargeKg: number, gwp: number): number {
  return Math.round(((chargeKg * gwp) / 1000) * 1000) / 1000;
}

export type LeakCheckInterval = 3 | 6 | 12 | 24;

/**
 * Leak-check interval in months (Regulation (EU) 2024/573 Article 5).
 * Returns null when no periodic check is required, or when the equipment type
 * follows different rules (switchgear).
 */
export function leakCheckIntervalMonths(input: {
  co2EquivalentTonnes: number;
  hermeticallySealed: boolean;
  leakDetectionSystem: boolean;
  equipmentType: string;
}): LeakCheckInterval | null {
  if (input.equipmentType === 'switchgear') return null;
  const t = input.co2EquivalentTonnes;
  if (t < 5) return null;
  if (input.hermeticallySealed && t < 10) return null;
  const base: LeakCheckInterval = t >= 500 ? 3 : t >= 50 ? 6 : 12;
  if (!input.leakDetectionSystem) return base;
  return (base * 2) as LeakCheckInterval;
}

/** Refrigerants offered in the calculator, most common first. */
export const CALCULATOR_REFRIGERANTS = [
  'R32',
  'R410A',
  'R134A',
  'R404A',
  'R407C',
  'R507A',
  'R448A',
  'R449A',
  'R452A',
  'R454B',
  'R513A',
  'R407F',
  'R422D',
  'R427A',
  'R1234YF',
  'R1234ZE',
  'R290',
  'R744',
  'SF6',
] as const;
