import ExcelJS from "exceljs";
import { Buffer } from "buffer";

/**
 * EXCEL EXPORT SERVICE - Complete Excel Generation
 * Supports data export, formatting, charts, and multi-sheet workbooks
 */

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  style?: Partial<ExcelJS.Style>;
}

interface ExcelExportOptions {
  sheetName: string;
  columns: ExcelColumn[];
  data: any[];
  title?: string;
  subtitle?: string;
  includeChart?: boolean;
  freezeHeader?: boolean;
  autoFilter?: boolean;
}

/**
 * GENERATE EXCEL FILE - Core function
 */
export async function generateExcel(
  options: ExcelExportOptions
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(options.sheetName);

  let currentRow = 1;

  // Title
  if (options.title) {
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(64 + options.columns.length)}${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = options.title;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    currentRow += 1;
  }

  // Subtitle
  if (options.subtitle) {
    worksheet.mergeCells(`A${currentRow}:${String.fromCharCode(64 + options.columns.length)}${currentRow}`);
    const subtitleCell = worksheet.getCell(`A${currentRow}`);
    subtitleCell.value = options.subtitle;
    subtitleCell.font = { size: 12 };
    subtitleCell.alignment = { horizontal: "center" };
    currentRow += 2;
  }

  // Define columns
  worksheet.columns = options.columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  // Style header row
  const headerRow = worksheet.getRow(currentRow);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3B82F6" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 25;

  currentRow += 1;

  // Add data
  options.data.forEach((row) => {
    worksheet.addRow(row);
  });

  // Apply borders
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber >= currentRow - 1) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }
  });

  // Freeze header
  if (options.freezeHeader) {
    worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: currentRow - 1 }];
  }

  // Auto filter
  if (options.autoFilter) {
    worksheet.autoFilter = {
      from: { row: currentRow - 1, column: 1 },
      to: {
        row: currentRow - 1,
        column: options.columns.length,
      },
    };
  }

  // Generate buffer
  return (await workbook.xlsx.writeBuffer()) as Buffer;
}

/**
 * EXPORT JOB COSTING DATA
 */
export async function exportJobCostingExcel(data: {
  projectName: string;
  categories: Array<{
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
    variancePercent: number;
  }>;
}): Promise<Buffer> {
  return generateExcel({
    sheetName: "Job Costing",
    title: `Job Costing Report - ${data.projectName}`,
    subtitle: `Generated: ${new Date().toLocaleDateString("en-SA")}`,
    columns: [
      { header: "Category", key: "category", width: 30 },
      { header: "Budgeted (SAR)", key: "budgeted", width: 15 },
      { header: "Actual (SAR)", key: "actual", width: 15 },
      { header: "Variance (SAR)", key: "variance", width: 15 },
      { header: "Variance (%)", key: "variancePercent", width: 15 },
    ],
    data: data.categories.map((cat) => ({
      category: cat.category,
      budgeted: cat.budgeted,
      actual: cat.actual,
      variance: cat.variance,
      variancePercent: `${cat.variancePercent.toFixed(2)}%`,
    })),
    freezeHeader: true,
    autoFilter: true,
  });
}

/**
 * EXPORT PAYMENT CERTIFICATES
 */
export async function exportPaymentCertificatesExcel(
  certificates: Array<{
    certificateNumber: string;
    date: Date;
    projectName: string;
    stage: string;
    amount: number;
    status: string;
    approvedBy?: string;
  }>
): Promise<Buffer> {
  return generateExcel({
    sheetName: "Payment Certificates",
    title: "Payment Certificates Report",
    subtitle: `Total Certificates: ${certificates.length} | Total Amount: SAR ${certificates.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}`,
    columns: [
      { header: "Certificate No", key: "certificateNumber", width: 20 },
      { header: "Date", key: "date", width: 15 },
      { header: "Project", key: "projectName", width: 30 },
      { header: "Stage", key: "stage", width: 20 },
      { header: "Amount (SAR)", key: "amount", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Approved By", key: "approvedBy", width: 20 },
    ],
    data: certificates.map((cert) => ({
      certificateNumber: cert.certificateNumber,
      date: cert.date.toLocaleDateString("en-SA"),
      projectName: cert.projectName,
      stage: cert.stage,
      amount: cert.amount,
      status: cert.status,
      approvedBy: cert.approvedBy || "Pending",
    })),
    freezeHeader: true,
    autoFilter: true,
  });
}

/**
 * EXPORT HSE INCIDENTS
 */
export async function exportHseIncidentsExcel(
  incidents: Array<{
    incidentId: string;
    date: Date;
    type: string;
    severity: string;
    location: string;
    description: string;
    reportedBy: string;
    status: string;
  }>
): Promise<Buffer> {
  return generateExcel({
    sheetName: "HSE Incidents",
    title: "HSE Incidents Report",
    subtitle: `Total Incidents: ${incidents.length} | Date: ${new Date().toLocaleDateString("en-SA")}`,
    columns: [
      { header: "Incident ID", key: "incidentId", width: 15 },
      { header: "Date", key: "date", width: 15 },
      { header: "Type", key: "type", width: 20 },
      { header: "Severity", key: "severity", width: 12 },
      { header: "Location", key: "location", width: 25 },
      { header: "Description", key: "description", width: 40 },
      { header: "Reported By", key: "reportedBy", width: 20 },
      { header: "Status", key: "status", width: 15 },
    ],
    data: incidents.map((inc) => ({
      incidentId: inc.incidentId,
      date: inc.date.toLocaleDateString("en-SA"),
      type: inc.type,
      severity: inc.severity,
      location: inc.location,
      description: inc.description,
      reportedBy: inc.reportedBy,
      status: inc.status,
    })),
    freezeHeader: true,
    autoFilter: true,
  });
}

/**
 * EXPORT VISA QUOTA TRACKING
 */
export async function exportVisaQuotaExcel(data: {
  quotas: Array<{
    skillLevel: string;
    totalQuota: number;
    used: number;
    available: number;
    utilizationPercent: number;
  }>;
  workers: Array<{
    name: string;
    nationalId: string;
    skillLevel: string;
    visaStatus: string;
    expiryDate: Date;
    daysToExpiry: number;
  }>;
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Quota Summary
  const quotaSheet = workbook.addWorksheet("Quota Summary");
  quotaSheet.columns = [
    { header: "Skill Level", key: "skillLevel", width: 20 },
    { header: "Total Quota", key: "totalQuota", width: 15 },
    { header: "Used", key: "used", width: 15 },
    { header: "Available", key: "available", width: 15 },
    { header: "Utilization %", key: "utilizationPercent", width: 15 },
  ];

  // Header styling
  const quotaHeader = quotaSheet.getRow(1);
  quotaHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  quotaHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF10B981" },
  };

  data.quotas.forEach((quota) => {
    quotaSheet.addRow({
      skillLevel: quota.skillLevel,
      totalQuota: quota.totalQuota,
      used: quota.used,
      available: quota.available,
      utilizationPercent: `${quota.utilizationPercent.toFixed(1)}%`,
    });
  });

  // Sheet 2: Workers
  const workersSheet = workbook.addWorksheet("Workers");
  workersSheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "National ID", key: "nationalId", width: 20 },
    { header: "Skill Level", key: "skillLevel", width: 20 },
    { header: "Visa Status", key: "visaStatus", width: 15 },
    { header: "Expiry Date", key: "expiryDate", width: 15 },
    { header: "Days to Expiry", key: "daysToExpiry", width: 15 },
  ];

  // Header styling
  const workersHeader = workersSheet.getRow(1);
  workersHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  workersHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3B82F6" },
  };

  data.workers.forEach((worker) => {
    const row = workersSheet.addRow({
      name: worker.name,
      nationalId: worker.nationalId,
      skillLevel: worker.skillLevel,
      visaStatus: worker.visaStatus,
      expiryDate: worker.expiryDate.toLocaleDateString("en-SA"),
      daysToExpiry: worker.daysToExpiry,
    });

    // Highlight expiring visas
    if (worker.daysToExpiry <= 30) {
      row.getCell("daysToExpiry").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: worker.daysToExpiry <= 7 ? "FFEF4444" : "FFF59E0B" },
      };
    }
  });

  return (await workbook.xlsx.writeBuffer()) as Buffer;
}

/**
 * EXPORT NITAQAT COMPLIANCE
 */
export async function exportNitaqatExcel(data: {
  summary: {
    totalEmployees: number;
    saudiEmployees: number;
    saudiPercent: number;
    category: string;
    targetPercent: number;
  };
  employees: Array<{
    name: string;
    nationality: string;
    position: string;
    salary: number;
    joinDate: Date;
  }>;
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.mergeCells("A1:B1");
  summarySheet.getCell("A1").value = "Nitaqat Compliance Summary";
  summarySheet.getCell("A1").font = { size: 16, bold: true };
  summarySheet.getCell("A1").alignment = { horizontal: "center" };

  summarySheet.getCell("A3").value = "Total Employees:";
  summarySheet.getCell("B3").value = data.summary.totalEmployees;

  summarySheet.getCell("A4").value = "Saudi Employees:";
  summarySheet.getCell("B4").value = data.summary.saudiEmployees;

  summarySheet.getCell("A5").value = "Saudi %:";
  summarySheet.getCell("B5").value = `${data.summary.saudiPercent.toFixed(2)}%`;

  summarySheet.getCell("A6").value = "Category:";
  summarySheet.getCell("B6").value = data.summary.category;
  summarySheet.getCell("B6").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF10B981" },
  };

  summarySheet.getCell("A7").value = "Target %:";
  summarySheet.getCell("B7").value = `${data.summary.targetPercent}%`;

  // Employees Sheet
  const employeesSheet = workbook.addWorksheet("Employees");
  employeesSheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Nationality", key: "nationality", width: 15 },
    { header: "Position", key: "position", width: 25 },
    { header: "Salary (SAR)", key: "salary", width: 15 },
    { header: "Join Date", key: "joinDate", width: 15 },
  ];

  const employeesHeader = employeesSheet.getRow(1);
  employeesHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  employeesHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF8B5CF6" },
  };

  data.employees.forEach((emp) => {
    const row = employeesSheet.addRow({
      name: emp.name,
      nationality: emp.nationality,
      position: emp.position,
      salary: emp.salary,
      joinDate: emp.joinDate.toLocaleDateString("en-SA"),
    });

    // Highlight Saudi employees
    if (emp.nationality === "Saudi") {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD1FAE5" },
      };
    }
  });

  return (await workbook.xlsx.writeBuffer()) as Buffer;
}

/**
 * EXPORT MULTI-SHEET WORKBOOK
 */
export async function exportMultiSheetExcel(sheets: Array<{
  sheetName: string;
  columns: ExcelColumn[];
  data: any[];
  title?: string;
}>): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach((sheetData) => {
    const worksheet = workbook.addWorksheet(sheetData.sheetName);

    if (sheetData.title) {
      worksheet.mergeCells(`A1:${String.fromCharCode(64 + sheetData.columns.length)}1`);
      const titleCell = worksheet.getCell("A1");
      titleCell.value = sheetData.title;
      titleCell.font = { size: 14, bold: true };
      titleCell.alignment = { horizontal: "center" };
    }

    worksheet.columns = sheetData.columns;

    const headerRow = worksheet.getRow(sheetData.title ? 2 : 1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B82F6" },
    };

    sheetData.data.forEach((row) => worksheet.addRow(row));
  });

  return (await workbook.xlsx.writeBuffer()) as Buffer;
}
