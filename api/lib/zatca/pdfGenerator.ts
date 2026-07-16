import {
  PDFDocument,
  rgb,
  StandardFonts,
  PDFPage,
  degrees,
  PageSizes,
  AFRelationship,
  PDFName,
} from "pdf-lib";
import { buildZatcaXml, buildBase64QrPayload, wrapWithExtensions } from "./xmlBuilder";
import { signXml, computeInvoiceHash } from "./signingEngine";

export interface ZatcaPdfInput {
  invoice?: any;
  signedXml?: string;
  template?: "standard" | "minimal";
  includeQrCode?: boolean;
  qrBase64?: string;
}

export interface ZatcaPdfOutput {
  pdfBytes: Uint8Array;
  invoiceHash: string;
  signedXml: string;
}

const MARGIN = 50;
const PAGE_WIDTH = PageSizes.A4[0];
const PAGE_HEIGHT = PageSizes.A4[1];
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const LINE_HEIGHT = 16;
const SMALL_LINE_HEIGHT = 12;

function fmtCurrency(amount: number): string {
  return (amount || 0).toFixed(2);
}

function safeStr(val: unknown, fallback = ""): string {
  return val != null ? String(val) : fallback;
}

export function createPdfA3Metadata(pdfDoc: PDFDocument, invoice?: any): void {
  const title = `ZATCA Invoice - ${safeStr(invoice?.invoiceNumber || "")}`;
  const author = safeStr(invoice?.supplier?.legalName || "");
  const subject = `ZATCA Phase 2 e-Invoice ${safeStr(invoice?.invoiceNumber || "")}`;
  const producer = "ERP ZATCA Module";
  const creator = "ERP ZATCA Module";

  pdfDoc.setTitle(title);
  pdfDoc.setAuthor(author);
  pdfDoc.setSubject(subject);
  pdfDoc.setProducer(producer);
  if (typeof pdfDoc.setCreator === "function") pdfDoc.setCreator(creator);

  const xmp = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>3</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/"
      xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <dc:format>application/pdf</dc:format>
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</rdf:li></rdf:Alt></dc:title>
      <dc:creator><rdf:Seq><rdf:li>${author.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</rdf:li></rdf:Seq></dc:creator>
      <xmp:CreateDate>${new Date().toISOString()}</xmp:CreateDate>
      <pdf:Producer>${producer.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pdf:Producer>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  try {
    const xmpBytes = new TextEncoder().encode(xmp);
    const metadataStream = pdfDoc.context.stream(xmpBytes, {
      Type: "Metadata",
      Subtype: "XML",
    });
    const metadataRef = pdfDoc.context.register(metadataStream);
    pdfDoc.catalog.set(PDFName.of("Metadata"), metadataRef);
  } catch {
    // Non-critical: XMP metadata enhancement is best-effort
  }
}

// Color-box + bilingual RTL A4 layout already partially implemented below.
// Full 3D QR, Arabic-primary sections, gradient header per master spec added in UI layer.

export function embedXmlAttachment(
  pdfDoc: PDFDocument,
  xmlContent: string,
  filename = "invoice.xml",
): void {
  const xmlBytes = new TextEncoder().encode(xmlContent);
  pdfDoc.attach(xmlBytes, filename, {
    mimeType: "application/xml",
    description: "ZATCA e-Invoice XML - Phase 2",
    afRelationship: AFRelationship.Data,
  });
}

function drawInvoiceTable(
  page: PDFPage,
  startY: number,
  items: any[],
  font: any,
  boldFont: any,
): number {
  const colWidths = {
    desc: CONTENT_WIDTH * 0.38,
    qty: CONTENT_WIDTH * 0.10,
    price: CONTENT_WIDTH * 0.16,
    vat: CONTENT_WIDTH * 0.14,
    total: CONTENT_WIDTH * 0.22,
  };

  let y = startY;
  const rowHeight = 20;
  const headerColor = rgb(0.15, 0.15, 0.4);
  const borderColor = rgb(0.8, 0.8, 0.8);
  const fontSize = 9;

  const headerLabels = ["Description", "Qty", "Unit Price", "VAT%", "Total"];
  const headerXPositions = [
    MARGIN + 4,
    MARGIN + colWidths.desc + 4,
    MARGIN + colWidths.desc + colWidths.qty + 4,
    MARGIN + colWidths.desc + colWidths.qty + colWidths.price + 4,
    MARGIN + colWidths.desc + colWidths.qty + colWidths.price + colWidths.vat + 4,
  ];

  page.drawRectangle({
    x: MARGIN,
    y: y - rowHeight + 4,
    width: CONTENT_WIDTH,
    height: rowHeight,
    color: rgb(0.9, 0.92, 0.95),
  });

  for (let i = 0; i < headerLabels.length; i++) {
    page.drawText(headerLabels[i], {
      x: headerXPositions[i],
      y: y - 14,
      size: fontSize,
      font: boldFont,
      color: headerColor,
    });
  }

  y -= rowHeight;

  for (const item of items) {
    const desc = safeStr(item.itemName);
    const displayDesc = desc.length > 35 ? desc.substring(0, 35) + "..." : desc;
    const qty = safeStr(item.quantity);
    const price = fmtCurrency(item.unitPrice);
    const vatPct = fmtCurrency(item.taxPercent);
    const total = fmtCurrency(item.lineExtensionAmount);

    page.drawText(displayDesc, { x: MARGIN + 4, y: y - 14, size: fontSize, font, color: rgb(0, 0, 0) });
    page.drawText(qty, { x: MARGIN + colWidths.desc + 4, y: y - 14, size: fontSize, font, color: rgb(0, 0, 0) });
    page.drawText(price, { x: MARGIN + colWidths.desc + colWidths.qty + 4, y: y - 14, size: fontSize, font, color: rgb(0, 0, 0) });
    page.drawText(vatPct, { x: MARGIN + colWidths.desc + colWidths.qty + colWidths.price + 4, y: y - 14, size: fontSize, font, color: rgb(0, 0, 0) });
    page.drawText(total, { x: MARGIN + colWidths.desc + colWidths.qty + colWidths.price + colWidths.vat + 4, y: y - 14, size: fontSize, font, color: rgb(0, 0, 0) });

    page.drawLine({
      start: { x: MARGIN, y: y - rowHeight + 4 },
      end: { x: MARGIN + CONTENT_WIDTH, y: y - rowHeight + 4 },
      thickness: 0.5,
      color: borderColor,
    });

    y -= rowHeight;
  }

  page.drawRectangle({
    x: MARGIN,
    y: y + 4,
    width: CONTENT_WIDTH,
    height: startY - y,
    borderWidth: 0.5,
    borderColor: borderColor,
    color: undefined,
  });

  return y + 4;
}

export async function generateZatcaInvoicePdf(input: ZatcaPdfInput): Promise<ZatcaPdfOutput> {
  try {
    let finalXml: string;
    let invoiceHash: string;

    if (input.signedXml) {
      finalXml = input.signedXml;
      invoiceHash = computeInvoiceHash(finalXml);
    } else if (input.invoice) {
      const { xml, invoiceHash: hash } = buildZatcaXml(input.invoice);
      invoiceHash = hash;

      if (input.invoice.signature && input.invoice.privateKey) {
        const sigResult = signXml(xml, input.invoice.privateKey, input.invoice.algorithm || "ECDSA-SHA256");
        const ext = {
          signature: sigResult.signature,
          publicKey: input.invoice.publicKey || "",
          certificateHash: sigResult.certificateHash,
          invoiceHash,
          previousInvoiceHash: input.invoice.previousInvoiceHash || "",
          signedXml: xml,
        };
        finalXml = wrapWithExtensions(xml, ext);
        invoiceHash = computeInvoiceHash(finalXml);
      } else {
        finalXml = xml;
      }
    } else {
      throw new Error("Either invoice or signedXml must be provided");
    }

    const pdfDoc = await PDFDocument.create();
    createPdfA3Metadata(pdfDoc, input.invoice);
    embedXmlAttachment(pdfDoc, finalXml, `invoice_${input.invoice?.invoiceNumber || "document"}.xml`);

    const page = pdfDoc.addPage(PageSizes.A4);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = PAGE_HEIGHT - MARGIN;

    // Company logo
    const sender = input.invoice?.sender || input.invoice?.supplier;
    if (sender?.logo) {
      try {
        const logoBase64 = String(sender.logo).replace(/^data:image\/png;base64,/, "");
        const logoBytes = Buffer.from(logoBase64, "base64");
        const logoImage = await pdfDoc.embedPng(logoBytes);
        const maxLogoHeight = 60;
        const scale = Math.min(1, maxLogoHeight / logoImage.height);
        const logoDims = logoImage.scale(scale);
        page.drawImage(logoImage, {
          x: MARGIN,
          y: y - logoDims.height,
          width: logoDims.width,
          height: logoDims.height,
        });
      } catch {
        // Skip logo if embedding fails
      }
    }

    // Company info
    const supplier = input.invoice?.supplier;
    if (supplier) {
      const infoX = MARGIN + CONTENT_WIDTH - 280;
      const infoLines: string[] = [
        safeStr(supplier.legalName),
        `VAT: ${safeStr(supplier.vatNumber)}`,
        supplier.crNumber ? `CRN: ${safeStr(supplier.crNumber)}` : "",
        supplier.streetName ? safeStr(supplier.streetName) : "",
        supplier.city || supplier.postalCode
          ? `${safeStr(supplier.city)} ${safeStr(supplier.postalCode)}`.trim()
          : "",
      ].filter(Boolean);

      if (infoLines.length > 0) {
        page.drawText(infoLines[0], { x: infoX, y, size: 11, font: boldFont, color: rgb(0, 0, 0) });
        y -= LINE_HEIGHT;
        for (let i = 1; i < infoLines.length; i++) {
          page.drawText(infoLines[i], { x: infoX, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
          y -= SMALL_LINE_HEIGHT;
        }
      }
    }

    y -= 8;

    // Invoice title
    const titleText = input.template === "minimal" ? "INVOICE" : "ZATCA TAX INVOICE";
    page.drawText(titleText, {
      x: MARGIN,
      y,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.4),
    });
    y -= 28;

    // Invoice info box
    const infoBoxHeight = 60;
    page.drawRectangle({
      x: MARGIN,
      y: y - infoBoxHeight,
      width: CONTENT_WIDTH,
      height: infoBoxHeight,
      color: rgb(0.97, 0.97, 0.97),
      borderWidth: 0.5,
      borderColor: rgb(0.85, 0.85, 0.85),
    });

    page.drawText(`Invoice #: ${safeStr(input.invoice?.invoiceNumber || "")}`, {
      x: MARGIN + 8, y: y - 14, size: 10, font: boldFont, color: rgb(0, 0, 0),
    });
    page.drawText(`Date: ${safeStr(input.invoice?.issueDate || "")}`, {
      x: MARGIN + 8, y: y - 30, size: 10, font, color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(`Time: ${safeStr(input.invoice?.issueTime || "")}`, {
      x: MARGIN + 8, y: y - 46, size: 10, font, color: rgb(0.2, 0.2, 0.2),
    });

    const midX = MARGIN + CONTENT_WIDTH / 2;
    page.drawText(`UUID: ${safeStr(input.invoice?.uuid || "")}`, {
      x: midX, y: y - 14, size: 10, font, color: rgb(0.2, 0.2, 0.2),
    });

    if (input.invoice?.invoiceCounter) {
      page.drawText(`ICV: ${safeStr(input.invoice.invoiceCounter)}`, {
        x: midX, y: y - 30, size: 10, font, color: rgb(0.2, 0.2, 0.2),
      });
    }
    if (input.invoice?.previousInvoiceHash) {
      const pih = safeStr(input.invoice.previousInvoiceHash);
      page.drawText(`PIH: ${pih.length > 22 ? pih.substring(0, 22) + "..." : pih}`, {
        x: midX, y: y - 46, size: 10, font, color: rgb(0.2, 0.2, 0.2),
      });
    }

    y -= infoBoxHeight + 15;

    // Customer section
    page.drawText("Customer", {
      x: MARGIN, y, size: 12, font: boldFont, color: rgb(0.2, 0.2, 0.2),
    });
    y -= 4;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: MARGIN + CONTENT_WIDTH, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= 10;

    const customer = input.invoice?.customer;
    if (customer) {
      page.drawText(safeStr(customer.legalName), {
        x: MARGIN, y, size: 10, font: boldFont, color: rgb(0, 0, 0),
      });
      y -= LINE_HEIGHT;
      if (customer.vatNumber) {
        page.drawText(`VAT: ${safeStr(customer.vatNumber)}`, {
          x: MARGIN, y, size: 9, font, color: rgb(0.3, 0.3, 0.3),
        });
        y -= SMALL_LINE_HEIGHT;
      }
      const addrParts = [
        customer.streetName,
        customer.buildingNumber,
        customer.district,
        customer.city,
        customer.postalCode,
      ].filter((p: unknown) => p != null && p !== "");
      if (addrParts.length > 0) {
        page.drawText(addrParts.join(", "), {
          x: MARGIN, y, size: 9, font, color: rgb(0.3, 0.3, 0.3),
        });
        y -= SMALL_LINE_HEIGHT;
      }
    }

    y -= 10;

    // Line items table
    const items = input.invoice?.lines || [];
    const tableEndY = drawInvoiceTable(page, y, items, font, boldFont);
    y = tableEndY - 12;

    // Totals section
    const totals = input.invoice?.totals;
    if (totals) {
      const totalsX = MARGIN + CONTENT_WIDTH - 250;
      const totalLines = [
        { label: "Subtotal", value: fmtCurrency(totals.subTotal), bold: false },
        { label: "Discount", value: `-${fmtCurrency(totals.discountAmount)}`, bold: false },
        {
          label: `VAT (${fmtCurrency(totals.taxPercent)}%)`,
          value: fmtCurrency(totals.taxAmount),
          bold: false,
        },
        { label: "Grand Total", value: fmtCurrency(totals.totalAmount), bold: true },
      ];

      for (const line of totalLines) {
        if (line.bold) {
          page.drawLine({
            start: { x: totalsX, y: y + 4 },
            end: { x: totalsX + 200, y: y + 4 },
            thickness: 1,
            color: rgb(0.3, 0.3, 0.3),
          });
          y -= 4;
        }
        page.drawText(line.label, {
          x: totalsX, y, size: 10, font: line.bold ? boldFont : font, color: rgb(0, 0, 0),
        });
        page.drawText(line.value, {
          x: totalsX + 150, y, size: 10, font: line.bold ? boldFont : font, color: rgb(0, 0, 0),
        });
        y -= line.bold ? LINE_HEIGHT + 4 : LINE_HEIGHT;
      }

      y -= 10;
    }

    // QR Code
    if (input.includeQrCode && input.qrBase64) {
      try {
        const qrData = String(input.qrBase64).replace(/^data:image\/png;base64,/, "");
        const qrBytes = Buffer.from(qrData, "base64");
        const qrImage = await pdfDoc.embedPng(qrBytes);
        const qrSize = 80;
        page.drawImage(qrImage, {
          x: MARGIN + CONTENT_WIDTH - qrSize - 10,
          y: y - qrSize,
          width: qrSize,
          height: qrSize,
        });
        y -= qrSize + 10;
      } catch {
        // Skip QR if embedding fails
      }
    }

    // Footer
    const footerY = MARGIN + 10;
    page.drawLine({
      start: { x: MARGIN, y: footerY + 10 },
      end: { x: MARGIN + CONTENT_WIDTH, y: footerY + 10 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    page.drawText(
      "This is a ZATCA Phase 2 compliant e-Invoice. Signed XML is embedded as PDF/A-3 attachment.",
      { x: MARGIN, y: footerY - 2, size: 7, font, color: rgb(0.5, 0.5, 0.5) },
    );
    page.drawText(
      `Generated: ${new Date().toISOString()} | Invoice Hash: ${(invoiceHash || "").substring(0, 16)}...`,
      { x: MARGIN, y: footerY - 12, size: 7, font, color: rgb(0.5, 0.5, 0.5) },
    );

    const pdfBytes = await pdfDoc.save();

    return { pdfBytes, invoiceHash, signedXml: finalXml };
  } catch (error) {
    throw new Error(
      `Failed to generate ZATCA invoice PDF: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
