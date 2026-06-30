import { Buffer } from 'buffer';

const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;

export interface ThermalLineItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface ThermalInvoiceData {
  companyNameAr: string;
  companyNameEn: string;
  vatNumber: string;
  address?: string;
  invoiceNumber: string;
  date: string;
  customerName?: string;
  items: ThermalLineItem[];
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  qrData: string; // base64 or raw TLV
  isSimplified?: boolean;
}

export class ThermalPrinter {
  private commands: number[] = [];

  private add(...bytes: number[]) {
    this.commands.push(...bytes);
  }

  init() {
    this.add(ESC, 0x40); // Initialize
    return this;
  }

  alignCenter() {
    this.add(ESC, 0x61, 0x01);
    return this;
  }

  alignLeft() {
    this.add(ESC, 0x61, 0x00);
    return this;
  }

  alignRight() {
    this.add(ESC, 0x61, 0x02);
    return this;
  }

  boldOn() {
    this.add(ESC, 0x45, 0x01);
    return this;
  }

  boldOff() {
    this.add(ESC, 0x45, 0x00);
    return this;
  }

  doubleWidthOn() {
    this.add(ESC, 0x21, 0x20);
    return this;
  }

  doubleWidthOff() {
    this.add(ESC, 0x21, 0x00);
    return this;
  }

  text(str: string) {
    this.add(...Buffer.from(str, 'utf8'));
    return this;
  }

  line(str = '') {
    this.text(str);
    this.add(LF);
    return this;
  }

  separator(char = '─', width = 48) {
    this.line(char.repeat(width));
    return this;
  }

  qrCode(data: string, size = 8) {
    const buf = Buffer.from(data);
    this.add(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size); // Module size
    this.add(GS, 0x28, 0x6B, buf.length + 3, 0x00, 0x31, 0x50, 0x30); // Store
    this.add(...buf);
    this.add(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30); // Print
    return this;
  }

  cut() {
    this.add(GS, 0x56, 0x01);
    return this;
  }

  openDrawer() {
    this.add(ESC, 0x70, 0x00, 0x19, 0xFA);
    return this;
  }

  build(): Buffer {
    return Buffer.from(this.commands);
  }
}

export function generate80mmThermal(invoice: ThermalInvoiceData): Buffer {
  const p = new ThermalPrinter();

  p.init()
    .alignCenter()
    .boldOn()
    .doubleWidthOn()
    .line(invoice.companyNameAr)
    .doubleWidthOff()
    .boldOff()
    .line(invoice.companyNameEn)
    .line(`VAT: ${invoice.vatNumber}`)
    .separator()
    .alignCenter()
    .boldOn()
    .line(invoice.isSimplified ? 'فاتورة ضريبية مبسطة' : 'فاتورة ضريبية')
    .boldOff()
    .line(`رقم: ${invoice.invoiceNumber}`)
    .line(invoice.date)
    .separator();

  if (invoice.customerName) {
    p.alignLeft().line(`العميل: ${invoice.customerName}`).separator();
  }

  p.alignLeft();
  for (const item of invoice.items) {
    p.line(`${item.description} ×${item.qty} = ${item.total.toFixed(2)} SAR`);
  }

  p.separator('═')
    .alignRight()
    .boldOn()
    .line(`الإجمالي: ${invoice.grandTotal.toFixed(2)} SAR`)
    .boldOff()
    .separator();

  p.alignCenter()
    .qrCode(invoice.qrData, 6)
    .line('امسح للتحقق / Scan to Verify')
    .line('شكراً لتعاملكم معنا')
    .cut();

  return p.build();
}

export function generate58mmThermal(invoice: ThermalInvoiceData): Buffer {
  const p = new ThermalPrinter();

  p.init()
    .alignCenter()
    .boldOn()
    .line(invoice.companyNameAr.length > 18 ? invoice.companyNameAr.slice(0, 18) : invoice.companyNameAr)
    .boldOff()
    .line(`VAT:${invoice.vatNumber}`)
    .separator('-', 32)
    .line(invoice.isSimplified ? 'مبسطة' : 'فاتورة')
    .line(`#${invoice.invoiceNumber} ${invoice.date}`)
    .separator('-', 32);

  for (const item of invoice.items) {
    p.line(`${item.description.slice(0, 20)} ×${item.qty} = ${item.total.toFixed(0)}`);
  }

  p.separator('=', 32)
    .boldOn()
    .line(`الإجمالي: ${invoice.grandTotal.toFixed(0)} SAR`)
    .boldOff()
    .qrCode(invoice.qrData, 4)
    .line('شكراً')
    .cut();

  return p.build();
}
