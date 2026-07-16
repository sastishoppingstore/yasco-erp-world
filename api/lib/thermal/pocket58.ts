// Pocket 58mm ESC/POS generator (minimal, scannable QR)
import { Buffer } from 'buffer';

const ESC = 0x1B;
const GS = 0x1D;

export function generatePocket58(invoice: any): Buffer {
  const cmds: number[] = [ESC, 0x40]; // init
  cmds.push(ESC, 0x61, 0x01); // center

  // short company name
  cmds.push(ESC, 0x21, 0x30); // double height/width
  cmds.push(...Buffer.from(invoice.company.nameAr.slice(0, 12)));
  cmds.push(ESC, 0x21, 0x00);

  cmds.push(...Buffer.from(`\nVAT:${invoice.company.vatNumber}\n`));
  cmds.push(...Buffer.from('────────────────\n'));

  // simplified header
  cmds.push(...Buffer.from('فاتورة مبسطة\n'));
  cmds.push(...Buffer.from(`#${invoice.number} ${invoice.issueDate}\n`));
  cmds.push(...Buffer.from('────────────────\n'));

  // single-line items
  invoice.lineItems.forEach((i: any) => {
    cmds.push(...Buffer.from(`${i.descAr}×${i.qty}=${i.total}\n`));
  });

  cmds.push(...Buffer.from('════════════════\n'));
  cmds.push(...Buffer.from(`الإجمالي:${invoice.totals.grandTotal} SAR\n`));

  // 20×20mm QR
  cmds.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x03); // size
  cmds.push(GS, 0x28, 0x6B, ...Buffer.from(invoice.zatca.qrData.length.toString()), 0x00, 0x31, 0x50, 0x30);
  cmds.push(...Buffer.from(invoice.zatca.qrData));
  cmds.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);

  cmds.push(ESC, 0x64, 0x03); // feed
  cmds.push(GS, 0x56, 0x01);  // cut
  return Buffer.from(cmds);
}
