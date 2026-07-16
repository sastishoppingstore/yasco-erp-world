import { useRef, useCallback } from "react";
import InvoicePrintTemplate from "./InvoicePrintTemplate";

interface PrintInvoiceProps {
  invoice: {
    invoiceNumber: string;
    date: string;
    dueDate?: string;
    status: string;
    subtotal: number;
    vatAmount: number;
    totalAmount: number;
    paidAmount?: number;
    balanceDue?: number;
    zatcaQrCode?: string;
    zatcaStatus?: string;
    zatcaUuid?: string;
    notes?: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      vatRate: number;
      vatAmount: number;
      total: number;
    }>;
  };
  company: {
    name: string;
    nameAr?: string;
    crNumber?: string;
    taxNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    signature?: string;
    stamp?: string;
    headerColor?: string;
    footerText?: string;
    footerTextAr?: string;
    bankName?: string;
    bankAccountName?: string;
    bankIban?: string;
    bankAccountNumber?: string;
  };
  customer: {
    name: string;
    nameAr?: string;
    taxNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
  };
  format?: "A4" | "THERMAL_80MM" | "THERMAL_58MM";
  showBankDetails?: boolean;
  showSignature?: boolean;
  showStamp?: boolean;
  showQr?: boolean;
  notes?: string;
  terms?: string;
}

export function usePrintInvoice() {
  const printRef = useRef<HTMLDivElement>(null);

  const print = useCallback(() => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Print Invoice</title>
            <style>
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${printRef.current.innerHTML}
            <script>window.onload=function(){setTimeout(function(){window.print();window.close()},500)}<\/script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  }, []);

  return { printRef, print };
}

export default function PrintInvoice({
  invoice,
  company,
  customer,
  format = "A4",
  showBankDetails = true,
  showSignature = true,
  showStamp = true,
  showQr = true,
  notes,
  terms,
}: PrintInvoiceProps) {
  const { printRef, print } = usePrintInvoice();

  return (
    <div>
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <InvoicePrintTemplate
          ref={printRef}
          invoice={invoice}
          company={company}
          customer={customer}
          format={format}
          showBankDetails={showBankDetails}
          showSignature={showSignature}
          showStamp={showStamp}
          showQr={showQr}
          notes={notes}
          terms={terms}
        />
      </div>
      <button onClick={print} className="print-invoice-btn">
        Print
      </button>
    </div>
  );
}
