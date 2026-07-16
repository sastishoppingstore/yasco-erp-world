export type WavePhase = "wave1" | "wave2" | "wave3" | "wave4" | "wave5" | "custom";

export interface WaveConfiguration {
  wave: WavePhase;
  label: string;
  description: string;
  effectiveDate: string;
  thresholds: {
    annualRevenueSar: number;
    annualTransactionCount: number;
  };
  requirements: {
    requiresClearance: boolean;
    requiresReporting: boolean;
    requiresQrCode: boolean;
    requiresSignature: boolean;
    requiresPih: boolean;
  };
  invoiceTypeDefaults: {
    b2b: "standard" | "simplified";
    b2c: "simplified";
  };
}

export interface ThresholdOverride {
  enabled: boolean;
  annualRevenueSar?: number;
  annualTransactionCount?: number;
  waveOverride?: WavePhase;
}

const DEFAULT_WAVES: Record<WavePhase, WaveConfiguration> = {
  wave1: {
    wave: "wave1",
    label: "Wave 1",
    description: "Phase 1 - Generation of e-invoice XML and QR code (All taxpayers)",
    effectiveDate: "2021-12-04",
    thresholds: {
      annualRevenueSar: 0,
      annualTransactionCount: 0,
    },
    requirements: {
      requiresClearance: false,
      requiresReporting: false,
      requiresQrCode: true,
      requiresSignature: false,
      requiresPih: false,
    },
    invoiceTypeDefaults: {
      b2b: "standard",
      b2c: "simplified",
    },
  },
  wave2: {
    wave: "wave2",
    label: "Wave 2",
    description: "Phase 2 Integration - Taxpayers with revenue > SAR 3B or > 300k transactions/year",
    effectiveDate: "2023-01-01",
    thresholds: {
      annualRevenueSar: 3_000_000_000,
      annualTransactionCount: 300_000,
    },
    requirements: {
      requiresClearance: true,
      requiresReporting: true,
      requiresQrCode: true,
      requiresSignature: true,
      requiresPih: true,
    },
    invoiceTypeDefaults: {
      b2b: "standard",
      b2c: "simplified",
    },
  },
  wave3: {
    wave: "wave3",
    label: "Wave 3",
    description: "Phase 2 Integration - Taxpayers with revenue > SAR 1.5B or > 150k transactions/year",
    effectiveDate: "2023-07-01",
    thresholds: {
      annualRevenueSar: 1_500_000_000,
      annualTransactionCount: 150_000,
    },
    requirements: {
      requiresClearance: true,
      requiresReporting: true,
      requiresQrCode: true,
      requiresSignature: true,
      requiresPih: true,
    },
    invoiceTypeDefaults: {
      b2b: "standard",
      b2c: "simplified",
    },
  },
  wave4: {
    wave: "wave4",
    label: "Wave 4",
    description: "Phase 2 Integration - Taxpayers with revenue > SAR 500M or > 50k transactions/year",
    effectiveDate: "2023-11-01",
    thresholds: {
      annualRevenueSar: 500_000_000,
      annualTransactionCount: 50_000,
    },
    requirements: {
      requiresClearance: true,
      requiresReporting: true,
      requiresQrCode: true,
      requiresSignature: true,
      requiresPih: true,
    },
    invoiceTypeDefaults: {
      b2b: "standard",
      b2c: "simplified",
    },
  },
  wave5: {
    wave: "wave5",
    label: "Wave 5",
    description: "Phase 2 Integration - All remaining taxpayers",
    effectiveDate: "2024-07-01",
    thresholds: {
      annualRevenueSar: 0,
      annualTransactionCount: 0,
    },
    requirements: {
      requiresClearance: true,
      requiresReporting: true,
      requiresQrCode: true,
      requiresSignature: true,
      requiresPih: true,
    },
    invoiceTypeDefaults: {
      b2b: "standard",
      b2c: "simplified",
    },
  },
  custom: {
    wave: "custom",
    label: "Custom Wave",
    description: "User-defined threshold configuration",
    effectiveDate: new Date().toISOString().split("T")[0],
    thresholds: {
      annualRevenueSar: 0,
      annualTransactionCount: 0,
    },
    requirements: {
      requiresClearance: true,
      requiresReporting: true,
      requiresQrCode: true,
      requiresSignature: true,
      requiresPih: true,
    },
    invoiceTypeDefaults: {
      b2b: "standard",
      b2c: "simplified",
    },
  },
};

export function getWaveConfiguration(wave: WavePhase): WaveConfiguration {
  return DEFAULT_WAVES[wave] || DEFAULT_WAVES.wave5;
}

export function getAllWaveConfigurations(): WaveConfiguration[] {
  return Object.values(DEFAULT_WAVES);
}

export function determineWave(
  annualRevenueSar: number,
  annualTransactionCount: number,
  override?: ThresholdOverride,
): WaveConfiguration {
  if (override?.enabled && override.waveOverride) {
    return getWaveConfiguration(override.waveOverride);
  }

  const waves: Array<WavePhase> = ["wave2", "wave3", "wave4", "wave5"];

  for (const wave of waves) {
    const config = DEFAULT_WAVES[wave];
    if (
      annualRevenueSar >= config.thresholds.annualRevenueSar ||
      annualTransactionCount >= config.thresholds.annualTransactionCount
    ) {
      return config;
    }
  }

  return DEFAULT_WAVES.wave5;
}

export function determineInvoiceType(
  hasVatNumber: boolean,
  wave: WavePhase,
  override?: "standard" | "simplified",
): "standard" | "simplified" {
  if (override) return override;

  const config = getWaveConfiguration(wave);

  if (hasVatNumber) {
    return config.invoiceTypeDefaults.b2b;
  }

  return config.invoiceTypeDefaults.b2c;
}

export function getRequiredFeatures(wave: WavePhase): string[] {
  const config = getWaveConfiguration(wave);
  const features: string[] = [];

  if (config.requiresClearance) features.push("B2B Clearance");
  if (config.requiresReporting) features.push("B2C Reporting");
  if (config.requiresQrCode) features.push("QR Code Generation");
  if (config.requiresSignature) features.push("Digital Signature (XAdES)");
  if (config.requiresPih) features.push("Previous Invoice Hash (PIH) Chain");

  return features;
}

export function validateThresholdOverride(override: ThresholdOverride): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (override.enabled) {
    if (override.annualRevenueSar !== undefined && override.annualRevenueSar < 0) {
      errors.push("Annual revenue threshold cannot be negative");
    }
    if (override.annualTransactionCount !== undefined && override.annualTransactionCount < 0) {
      errors.push("Annual transaction count threshold cannot be negative");
    }
    if (override.waveOverride && !DEFAULT_WAVES[override.waveOverride]) {
      errors.push(`Invalid wave override: "${override.waveOverride}"`);
    }
  }

  return { valid: errors.length === 0, errors };
}
