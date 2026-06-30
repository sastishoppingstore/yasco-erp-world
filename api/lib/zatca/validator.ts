import { createHash } from "node:crypto";

export type ValidationSeverity = "error" | "warning";
export type ValidationCategory = "legal" | "technical" | "business";

export interface ValidationRule {
  code: string;
  name: string;
  description: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
}

export interface ValidationError {
  rule: ValidationRule;
  message: string;
  field?: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

const RULES: Record<string, ValidationRule> = {
  "BR-KSA-01": {
    code: "BR-KSA-01",
    name: "Currency must be SAR",
    description: "Invoice currency must be SAR for ZATCA compliance",
    severity: "error",
    category: "legal",
  },
  "BR-KSA-02": {
    code: "BR-KSA-02",
    name: "Valid VAT category code",
    description: "VAT category code must be one of: S (Standard), E (Exempt), Z (Zero-rated), O (Out of scope)",
    severity: "error",
    category: "technical",
  },
  "BR-KSA-03": {
    code: "BR-KSA-03",
    name: "Tax total equals sum of line taxes",
    description: "The tax total must equal the sum of all line-level tax amounts",
    severity: "error",
    category: "business",
  },
  "BR-KSA-04": {
    code: "BR-KSA-04",
    name: "Correct decimal rounding",
    description: "VAT amount must equal ROUND(taxable_amount x VAT_PERCENT / 100, 2)",
    severity: "error",
    category: "technical",
  },
  "BR-KSA-05": {
    code: "BR-KSA-05",
    name: "Sequential invoice numbering",
    description: "Invoice numbers must be sequential per company/tenant",
    severity: "warning",
    category: "business",
  },
  "BR-KSA-06": {
    code: "BR-KSA-06",
    name: "Mandatory field completeness",
    description: "All mandatory fields must be present and non-empty",
    severity: "error",
    category: "legal",
  },
  "BR-KSA-07": {
    code: "BR-KSA-07",
    name: "UUID format validation",
    description: "Invoice UUID must be a valid v4 UUID",
    severity: "error",
    category: "technical",
  },
  "BR-KSA-08": {
    code: "BR-KSA-08",
    name: "Invoice date not in future",
    description: "Invoice issue date must not be in the future",
    severity: "error",
    category: "legal",
  },
  "BR-KSA-09": {
    code: "BR-KSA-09",
    name: "Total must match sum of line totals + tax + discount",
    description: "The total amount must equal (sum of line totals) + tax - discount",
    severity: "error",
    category: "business",
  },
  "BR-KSA-10": {
    code: "BR-KSA-10",
    name: "VAT number format validation",
    description: "Saudi VAT number must be 15 digits starting with 3 and ending with 3",
    severity: "error",
    category: "legal",
  },
  "BR-KSA-11": {
    code: "BR-KSA-11",
    name: "Tax Percentage Validation",
    description: "VAT percentage must be 5%, 15% for standard, or 0% for zero-rated",
    severity: "error",
    category: "technical",
  },
  "BR-KSA-12": {
    code: "BR-KSA-12",
    name: "Invoice type code validation",
    description: "Invoice type code must match document type (388/381/383)",
    severity: "error",
    category: "technical",
  },
  "BR-KSA-13": {
    code: "BR-KSA-13",
    name: "Invoice line totals must be positive",
    description: "Each invoice line extension amount must be positive",
    severity: "error",
    category: "business",
  },
  "BR-KSA-14": {
    code: "BR-KSA-14",
    name: "Supplier and customer must differ",
    description: "Supplier VAT number must differ from customer VAT number",
    severity: "warning",
    category: "business",
  },
  "BR-KSA-15": {
    code: "BR-KSA-15",
    name: "QR tag completeness",
    description: "All 9 mandatory ZATCA QR tags must be present",
    severity: "error",
    category: "technical",
  },
  "BR-KSA-16": {
    code: "BR-KSA-16",
    name: "XML signature validity",
    description: "Invoice XML must contain a valid digital signature",
    severity: "error",
    category: "technical",
  },
};

export interface ValidationInput {
  currency: string;
  lines: Array<{
    lineExtensionAmount: number;
    taxPercent: number;
    taxAmount: number;
    taxCategory: string;
    unitPrice: number;
    quantity: number;
    itemName: string;
  }>;
  totals: {
    subTotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    taxPercent: number;
  };
  vatNumber?: string;
  customerVatNumber?: string;
  invoiceNumber?: string;
  uuid?: string;
  issueDate?: string;
  signedXml?: string;
  qrTags?: number[];
  invoiceType?: string;
}

function validSaudiVat(vatNumber: string): boolean {
  return /^3\d{13}3$/.test(vatNumber.replace(/\D/g, ""));
}

function validUuid(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function validateInvoice(input: ValidationInput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const addError = (ruleKey: string, message: string, field?: string, value?: unknown) => {
    const rule = RULES[ruleKey];
    if (!rule) return;
    const entry: ValidationError = { rule, message, field, value };
    if (rule.severity === "error") errors.push(entry);
    else warnings.push(entry);
  };

  const addWarning = (ruleKey: string, message: string, field?: string, value?: unknown) => {
    const rule = RULES[ruleKey];
    if (!rule) return;
    warnings.push({ rule, message, field, value });
  };

  // BR-KSA-01: Currency must be SAR
  if (input.currency !== "SAR") {
    addError("BR-KSA-01", `Invoice currency must be SAR, got "${input.currency}"`, "currency", input.currency);
  }

  // BR-KSA-02: Valid VAT category codes
  const validCategories = new Set(["S", "E", "Z", "O"]);
  for (const line of input.lines) {
    if (!validCategories.has(line.taxCategory)) {
      addError(
        "BR-KSA-02",
        `Invalid VAT category code "${line.taxCategory}". Must be S, E, Z, or O`,
        "taxCategory",
        line.taxCategory,
      );
    }
  }

  // BR-KSA-03: Tax total = sum of line taxes
  const sumLineTax = input.lines.reduce((sum, line) => sum + line.taxAmount, 0);
  if (Math.abs(sumLineTax - input.totals.taxAmount) > 0.01) {
    addError(
      "BR-KSA-03",
      `Tax total (${input.totals.taxAmount}) does not equal sum of line taxes (${sumLineTax})`,
      "taxAmount",
      { expected: sumLineTax, actual: input.totals.taxAmount },
    );
  }

  // BR-KSA-04: Correct decimal rounding per line
  for (let i = 0; i < input.lines.length; i++) {
    const line = input.lines[i];
    const expectedTax = round2(line.lineExtensionAmount * line.taxPercent / 100);
    if (Math.abs(expectedTax - line.taxAmount) > 0.005) {
      addError(
        "BR-KSA-04",
        `Line ${i + 1}: calculated VAT ${expectedTax} does not match provided VAT ${line.taxAmount}`,
        `lines[${i}].taxAmount`,
        { expected: expectedTax, actual: line.taxAmount },
      );
    }
  }

  // BR-KSA-05: Sequential invoice numbering (warning - can't fully validate without DB context)
  if (input.invoiceNumber) {
    const seqMatch = input.invoiceNumber.match(/(\d+)$/);
    if (!seqMatch) {
      addWarning("BR-KSA-05", "Invoice number does not end with a numeric sequence", "invoiceNumber", input.invoiceNumber);
    }
  }

  // BR-KSA-06: Mandatory field completeness
  if (!input.vatNumber) {
    addError("BR-KSA-06", "Supplier VAT number is required", "vatNumber", undefined);
  }
  if (!input.issueDate) {
    addError("BR-KSA-06", "Invoice issue date is required", "issueDate", undefined);
  }
  if (input.lines.length === 0) {
    addError("BR-KSA-06", "Invoice must have at least one line item", "lines", undefined);
  }

  // BR-KSA-07: UUID format
  if (input.uuid && !validUuid(input.uuid)) {
    addError("BR-KSA-07", `Invalid UUID format: "${input.uuid}"`, "uuid", input.uuid);
  }

  // BR-KSA-08: Invoice date not in future
  if (input.issueDate) {
    const issueDate = new Date(input.issueDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (issueDate > today) {
      addError("BR-KSA-08", `Invoice date ${input.issueDate} is in the future`, "issueDate", input.issueDate);
    }
  }

  // BR-KSA-09: Total = sum of line totals + tax - discount
  const sumLineTotals = input.lines.reduce((sum, line) => sum + line.lineExtensionAmount, 0);
  const expectedTotal = round2(sumLineTotals + input.totals.taxAmount - input.totals.discountAmount);
  if (Math.abs(expectedTotal - input.totals.totalAmount) > 0.01) {
    addError(
      "BR-KSA-09",
      `Total amount (${input.totals.totalAmount}) does not match expected (${expectedTotal})`,
      "totalAmount",
      { expected: expectedTotal, actual: input.totals.totalAmount },
    );
  }

  // BR-KSA-10: VAT number format
  if (input.vatNumber && !validSaudiVat(input.vatNumber)) {
    addError(
      "BR-KSA-10",
      `Saudi VAT number "${input.vatNumber}" must be 15 digits, start with 3, end with 3`,
      "vatNumber",
      input.vatNumber,
    );
  }

  // BR-KSA-11: Tax percentage validation
  for (let i = 0; i < input.lines.length; i++) {
    const line = input.lines[i];
    const validPcts = line.taxCategory === "Z" || line.taxCategory === "E" ? [0] : line.taxCategory === "O" ? [0] : [5, 15];
    if (!validPcts.includes(line.taxPercent)) {
      addError(
        "BR-KSA-11",
        `Line ${i + 1}: tax percent ${line.taxPercent}% is not valid for category ${line.taxCategory}`,
        `lines[${i}].taxPercent`,
        line.taxPercent,
      );
    }
  }

  // BR-KSA-12: Invoice type code validation
  const validTypes = ["standard", "simplified", "credit_note", "debit_note"];
  if (input.invoiceType && !validTypes.includes(input.invoiceType)) {
    addError("BR-KSA-12", `Invalid invoice type "${input.invoiceType}"`, "invoiceType", input.invoiceType);
  }

  // BR-KSA-13: Line totals must be positive
  for (let i = 0; i < input.lines.length; i++) {
    if (input.lines[i].lineExtensionAmount <= 0) {
      addError(
        "BR-KSA-13",
        `Line ${i + 1}: line extension amount must be positive, got ${input.lines[i].lineExtensionAmount}`,
        `lines[${i}].lineExtensionAmount`,
        input.lines[i].lineExtensionAmount,
      );
    }
  }

  // BR-KSA-14: Supplier and customer VAT differ
  if (input.vatNumber && input.customerVatNumber && input.vatNumber === input.customerVatNumber) {
    addWarning(
      "BR-KSA-14",
      "Supplier and customer have the same VAT number",
      "customerVatNumber",
      input.customerVatNumber,
    );
  }

  // BR-KSA-15: QR tag completeness
  if (input.qrTags) {
    const requiredTags = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const missingTags = requiredTags.filter((t) => !input.qrTags!.includes(t));
    if (missingTags.length > 0) {
      addError(
        "BR-KSA-15",
        `QR code is missing tags: [${missingTags.join(", ")}]`,
        "qrTags",
        { present: input.qrTags, missing: missingTags },
      );
    }
  }

  // BR-KSA-16: XML signature validity
  if (input.signedXml) {
    const hasSignature = input.signedXml.includes("ds:Signature") || input.signedXml.includes("<Signature");
    if (!hasSignature) {
      addError("BR-KSA-16", "Invoice XML does not contain a digital signature", "signedXml", undefined);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateBatch(invoices: ValidationInput[]): {
  totalValid: number;
  totalInvalid: number;
  totalErrors: number;
  totalWarnings: number;
  results: Array<{ input: ValidationInput; result: ValidationResult }>;
}> {
  const results = invoices.map((input) => ({
    input,
    result: validateInvoice(input),
  }));

  const valid = results.filter((r) => r.result.valid).length;
  const invalid = results.filter((r) => !r.result.valid).length;
  const totalErrors = results.reduce((s, r) => s + r.result.errors.length, 0);
  const totalWarnings = results.reduce((s, r) => s + r.result.warnings.length, 0);

  return {
    totalValid: valid,
    totalInvalid: invalid,
    totalErrors,
    totalWarnings,
    results,
  };
}

export function getValidationRules(): ValidationRule[] {
  return Object.values(RULES);
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return "No validation errors.";
  return errors
    .map(
      (e) =>
        `[${e.rule.code}] ${e.rule.name}: ${e.message}${e.field ? ` (field: ${e.field})` : ""}`,
    )
    .join("\n");
}
