import { z } from "zod";

export const WpsEmployeeRow = z.object({
  employeeCode: z.string(),
  bankIban: z.string(),
  beneficiaryName: z.string().max(200),
  amount: z.number().positive(),
  paymentDate: z.string(),
  bankCode: z.string().optional(),
  allowanceClassification: z.string().optional(),
});

export type WpsEmployeeRow = z.infer<typeof WpsEmployeeRow>;

export const WpsSubmissionInput = z.object({
  establishmentId: z.string(),
  payrollPeriodId: z.number(),
  bankFormat: z.enum(["sarie", "samba", "alrajhi", "ncb", "riyad", "anb", "albilad", "aljazira"]),
  paymentDate: z.string(),
  employees: z.array(WpsEmployeeRow).min(1),
  exceptions: z.array(z.object({
    employeeId: z.number(),
    exceptionType: z.enum(["unpaid_leave", "disciplinary_deduction", "bank_account_change", "other"]),
    amount: z.number(),
    reason: z.string(),
  })).optional(),
});

export type WpsSubmissionInput = z.infer<typeof WpsSubmissionInput>;

export interface WpsFileResult {
  fileName: string;
  fileContent: string;
  mimeType: string;
  totalAmount: number;
  employeeCount: number;
  complianceRate: number;
}

const BANK_FORMATS: Record<string, { header: string; delimiter: string; extension: string; mime: string }> = {
  sarie: { header: "EST_ID,BANK_CODE,BRANCH_CODE,IBAN,BENEFICIARY_NAME,AMOUNT,DATE,REFERENCE", delimiter: ",", extension: "csv", mime: "text/csv" },
  samba: { header: "HDR|EST_ID|DATE|TOTAL|COUNT\r\nDET|IBAN|NAME|AMOUNT|CODE", delimiter: "|", extension: "txt", mime: "text/plain" },
  alrajhi: { header: "H,EST_ID,DATE,TOTAL_AMOUNT,TOTAL_COUNT\r\nD,IBAN,BENEFICIARY,AMOUNT,REF", delimiter: ",", extension: "csv", mime: "text/csv" },
  ncb: { header: "01,EST_ID,DATE,TOTAL,COUNT\r\n02,IBAN,NAME,AMOUNT", delimiter: ",", extension: "csv", mime: "text/csv" },
  riyad: { header: "EST_ID|DATE|TOTAL|COUNT\nIBAN|NAME|AMOUNT|REF", delimiter: "|", extension: "txt", mime: "text/plain" },
  anb: { header: "ANB|EST_ID|DATE|TOTAL|COUNT\r\nD|IBAN|NAME|AMOUNT", delimiter: "|", extension: "txt", mime: "text/plain" },
  albilad: { header: "ESTID|DATE|TOTAL|COUNT\r\nIBAN|BENEFICIARY|AMOUNT|REF", delimiter: "|", extension: "txt", mime: "text/plain" },
  aljazira: { header: "HDR|EST_ID|DATE|TOTAL|COUNT\r\nDET|IBAN|BENEF|AMOUNT|CODE", delimiter: "|", extension: "txt", mime: "text/plain" },
};

export function validateSarieIban(iban: string): boolean {
  return /^SA\d{22}$/.test(iban.replace(/\s/g, ""));
}

export function generateWpsFile(input: WpsSubmissionInput): WpsFileResult {
  const fmt = BANK_FORMATS[input.bankFormat];
  if (!fmt) throw new Error(`Unsupported bank format: ${input.bankFormat}`);

  const totalAmount = input.employees.reduce((s, e) => s + e.amount, 0);
  const employeeCount = input.employees.length;
  const exceptionCount = input.exceptions?.length || 0;
  const complianceRate = Math.round(((employeeCount - exceptionCount) / Math.max(employeeCount, 1)) * 100);

  const formattedDate = input.paymentDate.replace(/-/g, "");
  const estId = input.establishmentId;

  let lines: string[] = [];
  const del = fmt.delimiter;

  if (input.bankFormat === "sarie") {
    lines.push(fmt.header);
    input.employees.forEach((emp, i) => {
      const iban = emp.bankIban.replace(/\s/g, "");
      const bankCode = iban.slice(4, 7);
      const branchCode = iban.slice(7, 11);
      lines.push(
        `${estId}${del}${bankCode}${del}${branchCode}${del}${iban}${del}"${emp.beneficiaryName}"${del}${emp.amount.toFixed(2)}${del}${formattedDate}${del}REF${String(i + 1).padStart(6, "0")}`,
      );
    });
  } else {
    const headerLine = fmt.header
      .replace("EST_ID", estId)
      .replace("DATE", formattedDate)
      .replace("TOTAL", totalAmount.toFixed(2))
      .replace("COUNT", String(employeeCount));
    lines.push(headerLine);
    input.employees.forEach((emp) => {
      const iban = emp.bankIban.replace(/\s/g, "");
      const name = emp.beneficiaryName.replace(/"/g, "");
      lines.push(
        `D${del}${iban}${del}"${name}"${del}${emp.amount.toFixed(2)}`,
      );
    });
  }

  return {
    fileName: `WPS_${estId}_${formattedDate}.${fmt.extension}`,
    fileContent: lines.join("\r\n"),
    mimeType: fmt.mime,
    totalAmount,
    employeeCount,
    complianceRate,
  };
}

export function classifyAllowance(label: string): "contractual" | "variable" {
  const fixed = ["basic", "housing", "transport", "hardship", "technical", "professional"];
  const lower = label.toLowerCase();
  return fixed.some((f) => lower.includes(f)) ? "contractual" : "variable";
}
