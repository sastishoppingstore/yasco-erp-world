import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { createWriteStream } from "fs";
import { Buffer } from "buffer";

/**
 * PDF GENERATION SERVICE - Complete PDF Creation
 * Supports invoices, certificates, reports with Arabic & English
 */

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  dueDate?: Date;
  companyName: string;
  companyAddress: string;
  companyVat?: string;
  customerName: string;
  customerAddress: string;
  customerVat?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  currency: string;
  zatcaQrCode?: string;
  notes?: string;
}

/**
 * GENERATE INVOICE PDF
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      // Collect chunks
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("INVOICE / فاتورة", { align: "center" })
        .moveDown();

      // Company Info
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(data.companyName)
        .font("Helvetica")
        .fontSize(10)
        .text(data.companyAddress);

      if (data.companyVat) {
        doc.text(`VAT: ${data.companyVat}`);
      }

      doc.moveDown();

      // Invoice Details (Right side)
      const rightX = 400;
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Invoice Number:", rightX, 120)
        .font("Helvetica")
        .text(data.invoiceNumber, rightX + 100, 120);

      doc
        .font("Helvetica-Bold")
        .text("Date:", rightX, 135)
        .font("Helvetica")
        .text(data.date.toLocaleDateString("en-SA"), rightX + 100, 135);

      if (data.dueDate) {
        doc
          .font("Helvetica-Bold")
          .text("Due Date:", rightX, 150)
          .font("Helvetica")
          .text(data.dueDate.toLocaleDateString("en-SA"), rightX + 100, 150);
      }

      doc.moveDown(3);

      // Bill To
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Bill To:")
        .fontSize(10)
        .font("Helvetica")
        .text(data.customerName)
        .text(data.customerAddress);

      if (data.customerVat) {
        doc.text(`VAT: ${data.customerVat}`);
      }

      doc.moveDown(2);

      // Table Header
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 250;
      const col3 = 350;
      const col4 = 420;
      const col5 = 490;

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Description", col1, tableTop)
        .text("Qty", col2, tableTop)
        .text("Unit Price", col3, tableTop)
        .text("Amount", col5, tableTop, { width: 90, align: "right" });

      // Line under header
      doc
        .moveTo(col1, tableTop + 15)
        .lineTo(545, tableTop + 15)
        .stroke();

      // Table Items
      let currentY = tableTop + 25;
      data.items.forEach((item) => {
        doc
          .fontSize(9)
          .font("Helvetica")
          .text(item.description, col1, currentY, { width: 180 })
          .text(item.quantity.toString(), col2, currentY)
          .text(
            `${data.currency} ${item.unitPrice.toLocaleString()}`,
            col3,
            currentY
          )
          .text(
            `${data.currency} ${item.amount.toLocaleString()}`,
            col5,
            currentY,
            { width: 90, align: "right" }
          );
        currentY += 20;
      });

      // Line before totals
      currentY += 10;
      doc
        .moveTo(col1, currentY)
        .lineTo(545, currentY)
        .stroke();

      currentY += 15;

      // Totals
      const totalsX = 380;
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Subtotal:", totalsX, currentY)
        .text(
          `${data.currency} ${data.subtotal.toLocaleString()}`,
          col5,
          currentY,
          { width: 90, align: "right" }
        );

      currentY += 20;
      doc
        .text(`Tax (${data.taxPercent}%):`, totalsX, currentY)
        .text(
          `${data.currency} ${data.taxAmount.toLocaleString()}`,
          col5,
          currentY,
          { width: 90, align: "right" }
        );

      currentY += 20;
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Total:", totalsX, currentY)
        .text(
          `${data.currency} ${data.total.toLocaleString()}`,
          col5,
          currentY,
          { width: 90, align: "right" }
        );

      // ZATCA QR Code
      if (data.zatcaQrCode) {
        currentY += 40;
        QRCode.toDataURL(data.zatcaQrCode, { width: 150 }, (err, url) => {
          if (!err && url) {
            doc.image(url, col1, currentY, { width: 150 });
            doc
              .fontSize(8)
              .font("Helvetica")
              .text("ZATCA Compliant", col1, currentY + 160, {
                width: 150,
                align: "center",
              });
          }
        });
      }

      // Notes
      if (data.notes) {
        doc
          .moveDown(10)
          .fontSize(9)
          .font("Helvetica-Bold")
          .text("Notes:")
          .font("Helvetica")
          .text(data.notes);
      }

      // Footer
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          "Generated by YASCO ERP - Saudi Construction Management System",
          50,
          750,
          { align: "center", width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

interface CertificateData {
  certificateNumber: string;
  date: Date;
  projectName: string;
  projectLocation: string;
  contractor: string;
  consultant?: string;
  stage: string;
  workDescription: string;
  amount: number;
  currency: string;
  certifiedBy: string;
  approvals: Array<{
    role: string;
    name: string;
    date: Date;
    signature?: string;
  }>;
}

/**
 * GENERATE PAYMENT CERTIFICATE PDF
 */
export async function generateCertificatePdf(
  data: CertificateData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("PAYMENT CERTIFICATE", { align: "center" })
        .fontSize(16)
        .text("شهادة دفع", { align: "center" })
        .moveDown(2);

      // Certificate Details Box
      doc
        .rect(50, doc.y, 495, 100)
        .stroke();

      const boxY = doc.y + 10;
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Certificate No:", 60, boxY)
        .font("Helvetica")
        .text(data.certificateNumber, 160, boxY);

      doc
        .font("Helvetica-Bold")
        .text("Date:", 350, boxY)
        .font("Helvetica")
        .text(data.date.toLocaleDateString("en-SA"), 400, boxY);

      doc
        .font("Helvetica-Bold")
        .text("Project:", 60, boxY + 25)
        .font("Helvetica")
        .text(data.projectName, 160, boxY + 25, { width: 320 });

      doc
        .font("Helvetica-Bold")
        .text("Location:", 60, boxY + 45)
        .font("Helvetica")
        .text(data.projectLocation, 160, boxY + 45);

      doc
        .font("Helvetica-Bold")
        .text("Contractor:", 60, boxY + 65)
        .font("Helvetica")
        .text(data.contractor, 160, boxY + 65);

      doc.moveDown(7);

      // Work Details
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("WORK STAGE / DESCRIPTION")
        .moveDown(0.5)
        .fontSize(10)
        .font("Helvetica")
        .text(data.stage)
        .moveDown(0.5)
        .text(data.workDescription)
        .moveDown(2);

      // Amount Box
      doc
        .rect(50, doc.y, 495, 60)
        .fillAndStroke("#F3F4F6", "#000000");

      const amountY = doc.y + 15;
      doc
        .fillColor("#000000")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("CERTIFIED AMOUNT:", 60, amountY)
        .fontSize(20)
        .fillColor("#10B981")
        .text(
          `${data.currency} ${data.amount.toLocaleString()}`,
          300,
          amountY
        );

      doc.fillColor("#000000").moveDown(4);

      // Approvals Section
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("APPROVALS")
        .moveDown(1);

      data.approvals.forEach((approval, idx) => {
        const approvalY = doc.y;
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(approval.role, 60, approvalY)
          .font("Helvetica")
          .text(approval.name, 60, approvalY + 15)
          .text(
            approval.date.toLocaleDateString("en-SA"),
            60,
            approvalY + 30
          );

        if (approval.signature) {
          doc.text("Signature: _____________", 350, approvalY + 15);
        }

        doc.moveDown(3);
      });

      // Footer
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          "This certificate is generated electronically and is valid without signature",
          50,
          750,
          { align: "center", width: 500 }
        )
        .text("YASCO ERP - Construction Payment System", 50, 765, {
          align: "center",
          width: 500,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

interface ReportData {
  title: string;
  subtitle?: string;
  date: Date;
  sections: Array<{
    heading: string;
    content: string | string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
  }>;
}

/**
 * GENERATE GENERIC REPORT PDF
 */
export async function generateReportPdf(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Title
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(data.title, { align: "center" });

      if (data.subtitle) {
        doc
          .fontSize(12)
          .font("Helvetica")
          .text(data.subtitle, { align: "center" });
      }

      doc
        .fontSize(10)
        .text(data.date.toLocaleDateString("en-SA"), { align: "center" })
        .moveDown(2);

      // Sections
      data.sections.forEach((section) => {
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text(section.heading)
          .moveDown(0.5);

        if (typeof section.content === "string") {
          doc.fontSize(10).font("Helvetica").text(section.content).moveDown();
        } else {
          section.content.forEach((line) => {
            doc.fontSize(10).font("Helvetica").text(`• ${line}`);
          });
          doc.moveDown();
        }

        // Table
        if (section.table) {
          const tableTop = doc.y;
          const colWidth = 495 / section.table.headers.length;

          // Headers
          section.table.headers.forEach((header, idx) => {
            doc
              .fontSize(9)
              .font("Helvetica-Bold")
              .text(header, 50 + idx * colWidth, tableTop, {
                width: colWidth,
                align: "left",
              });
          });

          doc
            .moveTo(50, tableTop + 15)
            .lineTo(545, tableTop + 15)
            .stroke();

          let rowY = tableTop + 20;
          section.table.rows.forEach((row) => {
            row.forEach((cell, idx) => {
              doc
                .fontSize(9)
                .font("Helvetica")
                .text(cell, 50 + idx * colWidth, rowY, {
                  width: colWidth,
                  align: "left",
                });
            });
            rowY += 20;
          });

          doc.moveDown(2);
        }
      });

      // Footer
      doc
        .fontSize(8)
        .font("Helvetica")
        .text("YASCO ERP - Report Generation System", 50, 750, {
          align: "center",
          width: 500,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * HELPER: Save PDF to file
 */
export async function savePdfToFile(
  buffer: Buffer,
  filePath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(filePath);
    stream.on("finish", resolve);
    stream.on("error", reject);
    stream.write(buffer);
    stream.end();
  });
}
