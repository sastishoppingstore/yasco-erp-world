import React, { useRef } from 'react';
import InvoicePrintTemplate from './InvoicePrintTemplate';

interface PrintPreviewProps {
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
  format?: 'A4' | 'THERMAL_80MM' | 'THERMAL_58MM';
  onPrint?: () => void;
}

export const InvoicePrintPreview: React.FC<PrintPreviewProps> = ({ invoice, company, customer, format = 'A4', onPrint }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${invoice.invoiceNumber}</title>
              <style>
                @page { size: A4; margin: 0; }
                body { margin: 0; padding: 0; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
              <script>window.onload=function(){window.print();window.close()}<\/script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
    onPrint?.();
  };

  return (
    <div className="space-y-4">
      {/* Print Controls */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-lg">📄</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {format === 'A4' ? 'A4 Invoice Preview' : format === 'THERMAL_80MM' ? 'Thermal 80mm Preview' : 'Thermal 58mm Preview'}
            </p>
            <p className="text-xs text-slate-500">
              Invoice #{invoice.invoiceNumber} — {invoice.items.length} items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            🖨️ Print Invoice
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="bg-slate-200 rounded-xl p-6 overflow-auto" style={{ maxHeight: '80vh' }}>
        <div className="flex justify-center">
          <div className="shadow-2xl rounded-lg overflow-hidden" style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
            <InvoicePrintTemplate
              ref={printRef}
              invoice={invoice}
              company={company}
              customer={customer}
              format={format}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintPreview;
