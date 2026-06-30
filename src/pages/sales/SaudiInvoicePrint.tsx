
import { forwardRef } from "react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: string | number;
  taxPercent: string | number;
  totalAmount: string | number;
}

interface CompanyInfo {
  companyName?: string;
  companyNameAr?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  crNumber?: string;
  logo?: string;
  defaultCurrency?: string;
  invoiceTerms?: string;
}

interface CustomerInfo {
  name?: string;
  nameAr?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
}

interface InvoiceData {
  invoiceNumber?: string;
  date?: string;
  dueDate?: string;
  invoiceType?: string;
  taxPercent?: string | number;
  subTotal?: string | number;
  taxAmount?: string | number;
  totalAmount?: string | number;
  paidAmount?: string | number;
  status?: string;
  zatcaStatus?: string;
  zatcaQrCode?: string;
  notes?: string;
  terms?: string;
  uuid?: string;
  hash?: string;
}

export interface SaudiInvoicePrintProps {
  invoice: InvoiceData;
  company: CompanyInfo;
  customer: CustomerInfo;
  items: InvoiceItem[];
  className?: string;
}

const SAR_SYMBOL = "SAR";

function toNum(v?: string | number | null) {
  return Number(v ?? 0);
}

function fmtMoney(v?: string | number | null) {
  return toNum(v).toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function isSimplified(type?: string) {
  return type === "simplified";
}

// ── Hijri date helper (approximate) ────────────────────────────────────
function toHijri(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("ar-SA-u-ca-islamic", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return "";
  }
}

// ── Status badge ─────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; labelAr: string; color: string }> = {
  draft:     { label: "Draft",     labelAr: "مسودة",    color: "#64748b" },
  sent:      { label: "Sent",      labelAr: "مُرسلة",  color: "#3b82f6" },
  paid:      { label: "Paid",      labelAr: "مدفوعة",  color: "#10b981" },
  partial:   { label: "Partial",   labelAr: "جزئي",    color: "#f59e0b" },
  overdue:   { label: "Overdue",   labelAr: "متأخرة",  color: "#ef4444" },
  cancelled: { label: "Cancelled", labelAr: "ملغاة",   color: "#6b7280" },
};

const ZATCA_MAP: Record<string, { label: string; color: string }> = {
  cleared:  { label: "Cleared",  color: "#10b981" },
  reported: { label: "Reported", color: "#3b82f6" },
  pending:  { label: "Pending",  color: "#f59e0b" },
  failed:   { label: "Failed",   color: "#ef4444" },
};

export const SaudiInvoicePrint = forwardRef<HTMLDivElement, SaudiInvoicePrintProps>(
  ({ invoice, company, customer, items, className = "" }, ref) => {
    const [qrUrl, setQrUrl] = useState<string>("");

    useEffect(() => {
      if (!invoice.zatcaQrCode) { setQrUrl(""); return; }
      QRCode.toDataURL(invoice.zatcaQrCode, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 180,
        color: { dark: "#0f172a", light: "#ffffff" },
      })
        .then(setQrUrl)
        .catch(() => setQrUrl(""));
    }, [invoice.zatcaQrCode]);

    const currency = company.defaultCurrency ?? SAR_SYMBOL;
    const isSimplifiedType = isSimplified(invoice.invoiceType);
    const statusInfo = STATUS_MAP[invoice.status ?? "draft"] ?? STATUS_MAP.draft;
    const zatcaInfo  = ZATCA_MAP[invoice.zatcaStatus ?? "pending"] ?? ZATCA_MAP.pending;
    const vatPct     = toNum(invoice.taxPercent ?? 15);
    const subTotal   = toNum(invoice.subTotal);
    const taxAmount  = toNum(invoice.taxAmount);
    const total      = toNum(invoice.totalAmount);
    const paid       = toNum(invoice.paidAmount);
    const due        = total - paid;
    const hijriDate  = toHijri(invoice.date);

    return (
      <div ref={ref} className={`saudi-invoice-root ${className}`} style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
          .saudi-invoice-root { font-family: 'Tajawal', 'Segoe UI', sans-serif; background: #f8fafc; }

          /* ── Page ── */
          .inv-page {
            max-width: 860px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow:
              0 25px 50px -12px rgba(0,0,0,.15),
              0 0 0 1px rgba(0,0,0,.04),
              inset 0 1px 0 rgba(255,255,255,.8);
          }

          /* ── Header gradient ── */
          .inv-header {
            background: linear-gradient(135deg, #0f4c35 0%, #1a7a56 40%, #0d6e4e 70%, #063d26 100%);
            padding: 32px 36px 28px;
            position: relative;
            overflow: hidden;
          }
          .inv-header::before {
            content: '';
            position: absolute;
            top: -60px; right: -60px;
            width: 220px; height: 220px;
            border-radius: 50%;
            background: rgba(255,255,255,.06);
          }
          .inv-header::after {
            content: '';
            position: absolute;
            bottom: -40px; left: -40px;
            width: 180px; height: 180px;
            border-radius: 50%;
            background: rgba(255,255,255,.04);
          }

          /* ── Logo box ── */
          .inv-logo-box {
            width: 72px; height: 72px;
            border-radius: 16px;
            background: rgba(255,255,255,.15);
            border: 2px solid rgba(255,255,255,.25);
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(4px);
            overflow: hidden;
            flex-shrink: 0;
          }
          .inv-logo-box img { width: 100%; height: 100%; object-fit: contain; }

          /* ── Title badge ── */
          .inv-title-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255,255,255,.15);
            border: 1px solid rgba(255,255,255,.3);
            border-radius: 100px;
            padding: 4px 14px;
            backdrop-filter: blur(4px);
            margin-bottom: 6px;
          }

          /* ── Color stat boxes ── */
          .inv-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0;
          }
          .inv-stat-box {
            padding: 20px 24px;
            position: relative;
          }
          .inv-stat-box:not(:last-child)::after {
            content: '';
            position: absolute;
            right: 0; top: 16px; bottom: 16px;
            width: 1px;
            background: rgba(0,0,0,.07);
          }
          .inv-stat-box-subtotal { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
          .inv-stat-box-vat      { background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
          .inv-stat-box-total    { background: linear-gradient(135deg, #0f4c35, #1a7a56); }
          .inv-stat-box-paid     { background: linear-gradient(135deg, #fefce8, #fef9c3); }

          .inv-stat-label {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .05em;
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .inv-stat-value {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -.5px;
            line-height: 1.1;
          }
          .inv-stat-currency {
            font-size: 11px;
            font-weight: 600;
            margin-top: 2px;
          }

          /* ── Body ── */
          .inv-body { padding: 28px 36px; }

          /* ── Info cards ── */
          .inv-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }
          .inv-info-card {
            border-radius: 14px;
            padding: 18px 20px;
            border: 1.5px solid;
            position: relative;
            overflow: hidden;
          }
          .inv-info-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            border-radius: 14px 14px 0 0;
          }
          .inv-info-card-seller {
            background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
            border-color: #bbf7d0;
          }
          .inv-info-card-seller::before { background: linear-gradient(90deg, #10b981, #059669); }
          .inv-info-card-buyer {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            border-color: #bfdbfe;
          }
          .inv-info-card-buyer::before { background: linear-gradient(90deg, #3b82f6, #2563eb); }

          .inv-card-tag {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .1em;
            text-transform: uppercase;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .inv-card-name {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .inv-card-name-ar {
            font-size: 14px;
            font-weight: 600;
            direction: rtl;
            margin-bottom: 4px;
          }
          .inv-card-text {
            font-size: 12px;
            color: #475569;
            line-height: 1.6;
          }
          .inv-vat-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            margin-top: 8px;
          }

          /* ── Meta row ── */
          .inv-meta-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .inv-meta-pill {
            border-radius: 12px;
            padding: 12px 16px;
            text-align: center;
            border: 1.5px solid;
          }
          .inv-meta-pill-type  { background: #f8fafc; border-color: #e2e8f0; }
          .inv-meta-pill-date  { background: #fff7ed; border-color: #fed7aa; }
          .inv-meta-pill-due   { background: #fef2f2; border-color: #fecaca; }
          .inv-meta-pill-uuid  { background: #faf5ff; border-color: #e9d5ff; }
          .inv-meta-label { font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #64748b; }
          .inv-meta-value { font-size: 13px; font-weight: 700; margin-top: 3px; word-break: break-all; }

          /* ── Items table ── */
          .inv-table-wrap {
            border-radius: 14px;
            border: 1.5px solid #e2e8f0;
            overflow: hidden;
            margin-bottom: 24px;
          }
          .inv-table { width: 100%; border-collapse: collapse; }
          .inv-table thead { background: linear-gradient(135deg, #0f4c35, #1a7a56); }
          .inv-table thead th {
            padding: 14px 16px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .06em;
            text-transform: uppercase;
            color: rgba(255,255,255,.9);
          }
          .inv-table thead th:last-child { text-align: right; }
          .inv-table tbody tr { border-bottom: 1px solid #f1f5f9; }
          .inv-table tbody tr:last-child { border-bottom: none; }
          .inv-table tbody tr:nth-child(even) { background: #f8fafc; }
          .inv-table tbody tr:hover { background: #f0fdf4; }
          .inv-table td {
            padding: 14px 16px;
            font-size: 13px;
            color: #1e293b;
          }
          .inv-table td:last-child { text-align: right; font-weight: 700; }
          .inv-item-desc { font-weight: 600; }
          .inv-item-desc-ar { font-size: 11px; color: #64748b; direction: rtl; }
          .inv-table-number { font-variant-numeric: tabular-nums; }
          .inv-row-num {
            width: 28px; height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            font-size: 11px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          /* ── Footer section ── */
          .inv-footer-grid {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 20px;
            align-items: start;
          }

          /* ── Totals box ── */
          .inv-totals {
            border-radius: 16px;
            overflow: hidden;
            border: 1.5px solid #e2e8f0;
          }
          .inv-totals-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 18px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
          }
          .inv-totals-row:last-child { border-bottom: none; }
          .inv-totals-row-sub   { background: #f8fafc; }
          .inv-totals-row-vat   { background: #f0fdf4; }
          .inv-totals-row-total {
            background: linear-gradient(135deg, #0f4c35, #1a7a56);
            color: white;
            padding: 16px 18px;
          }
          .inv-totals-row-paid  { background: #fefce8; }
          .inv-totals-row-due   { background: #fef2f2; }
          .inv-totals-label { font-weight: 600; color: #475569; }
          .inv-totals-label-white { font-weight: 700; color: rgba(255,255,255,.85); }
          .inv-totals-value { font-weight: 700; font-variant-numeric: tabular-nums; }
          .inv-totals-value-big { font-size: 20px; font-weight: 800; color: white; }
          .inv-totals-value-due { color: #ef4444; font-weight: 800; }

          /* ── QR box ── */
          .inv-qr-box {
            border-radius: 16px;
            border: 1.5px solid #bbf7d0;
            background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
            padding: 20px;
            text-align: center;
          }
          .inv-qr-img {
            width: 140px; height: 140px;
            object-fit: contain;
            border-radius: 12px;
            padding: 8px;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,.1);
            margin: 0 auto 12px;
            display: block;
          }
          .inv-qr-label {
            font-size: 11px;
            font-weight: 700;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: .05em;
          }
          .inv-qr-label-ar {
            font-size: 13px;
            font-weight: 600;
            color: #047857;
            direction: rtl;
            margin-top: 2px;
          }

          /* ── Notes / Terms ── */
          .inv-notes {
            margin-top: 20px;
            border-radius: 14px;
            padding: 16px 20px;
            background: linear-gradient(135deg, #faf5ff, #f3e8ff);
            border: 1.5px solid #e9d5ff;
            font-size: 12px;
            color: #4c1d95;
          }

          /* ── Compliance footer ── */
          .inv-compliance {
            margin-top: 24px;
            border-top: 2px dashed #e2e8f0;
            padding-top: 20px;
          }
          .inv-compliance-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          .inv-compliance-item {
            border-radius: 10px;
            padding: 12px 14px;
            font-size: 11px;
            text-align: center;
          }
          .inv-compliance-item-zatca { background: #f0fdf4; border: 1px solid #bbf7d0; color: #065f46; }
          .inv-compliance-item-vat   { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
          .inv-compliance-item-cr    { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; }
          .inv-compliance-label { font-weight: 700; letter-spacing: .05em; text-transform: uppercase; margin-bottom: 4px; }
          .inv-compliance-value { font-weight: 600; word-break: break-all; }

          /* ── Watermark ── */
          .inv-watermark {
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            font-size: 10px;
            color: #cbd5e1;
            letter-spacing: .05em;
          }

          /* ── Badge ── */
          .inv-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 700;
          }

          /* ── Print ── */
          @media print {
            .saudi-invoice-root { background: white; }
            .inv-page { box-shadow: none; border-radius: 0; }
            .inv-body { padding: 20px; }
          }
        `}</style>

        <div className="inv-page">
          {/* ══════════════════════════════════════════
              HEADER
          ══════════════════════════════════════════ */}
          <div className="inv-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
              {/* Left: Logo + Company */}
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div className="inv-logo-box">
                  {company.logo
                    ? <img src={company.logo} alt="logo" />
                    : <span style={{ color: "white", fontWeight: 800, fontSize: 20 }}>
                        {(company.companyName ?? "YA").slice(0, 2).toUpperCase()}
                      </span>
                  }
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 20, lineHeight: 1.2 }}>
                    {company.companyName ?? "Company Name"}
                  </div>
                  {company.companyNameAr && (
                    <div style={{ color: "rgba(255,255,255,.8)", fontWeight: 600, fontSize: 14, direction: "rtl", marginTop: 2 }}>
                      {company.companyNameAr}
                    </div>
                  )}
                  <div style={{ color: "rgba(255,255,255,.65)", fontSize: 11, marginTop: 6, lineHeight: 1.7 }}>
                    {company.address && <div>{company.address}{company.city ? `, ${company.city}` : ""}</div>}
                    {company.phone && <div>{company.phone}</div>}
                    {company.email && <div>{company.email}</div>}
                  </div>
                </div>
              </div>

              {/* Right: Invoice Title */}
              <div style={{ textAlign: "right" }}>
                <div className="inv-title-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span style={{ color: "white", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
                    {isSimplifiedType ? "Simplified Tax Invoice" : "Tax Invoice"}
                  </span>
                </div>
                <div style={{ color: "rgba(255,255,255,.9)", fontWeight: 800, fontSize: 18, direction: "rtl", marginBottom: 4 }}>
                  {isSimplifiedType ? "فاتورة ضريبية مبسطة" : "فاتورة ضريبية"}
                </div>
                <div style={{ color: "rgba(255,255,255,.7)", fontFamily: "monospace", fontSize: 16, fontWeight: 700 }}>
                  {invoice.invoiceNumber ?? "INV-000000"}
                </div>
                {invoice.zatcaStatus && (
                  <div style={{ marginTop: 10 }}>
                    <span className="inv-badge" style={{
                      background: `${zatcaInfo.color}22`,
                      border: `1.5px solid ${zatcaInfo.color}44`,
                      color: zatcaInfo.color,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: zatcaInfo.color, display: "inline-block" }} />
                      ZATCA {zatcaInfo.label}
                    </span>
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <span className="inv-badge" style={{
                    background: `${statusInfo.color}22`,
                    border: `1.5px solid ${statusInfo.color}44`,
                    color: statusInfo.color,
                  }}>
                    {statusInfo.label} / {statusInfo.labelAr}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              COLOR STAT BOXES
          ══════════════════════════════════════════ */}
          <div className="inv-stats">
            {/* Subtotal */}
            <div className="inv-stat-box inv-stat-box-subtotal">
              <div className="inv-stat-label" style={{ color: "#2563eb" }}>Subtotal / المجموع</div>
              <div className="inv-stat-value" style={{ color: "#1d4ed8" }}>{fmtMoney(subTotal)}</div>
              <div className="inv-stat-currency" style={{ color: "#3b82f6" }}>{currency}</div>
            </div>
            {/* VAT */}
            <div className="inv-stat-box inv-stat-box-vat">
              <div className="inv-stat-label" style={{ color: "#059669" }}>VAT {vatPct}% / ضريبة القيمة</div>
              <div className="inv-stat-value" style={{ color: "#047857" }}>{fmtMoney(taxAmount)}</div>
              <div className="inv-stat-currency" style={{ color: "#10b981" }}>{currency}</div>
            </div>
            {/* Grand Total */}
            <div className="inv-stat-box inv-stat-box-total">
              <div className="inv-stat-label" style={{ color: "rgba(255,255,255,.75)" }}>TOTAL / الإجمالي</div>
              <div className="inv-stat-value" style={{ color: "white" }}>{fmtMoney(total)}</div>
              <div className="inv-stat-currency" style={{ color: "rgba(255,255,255,.7)" }}>{currency}</div>
            </div>
            {/* Paid / Due */}
            <div className="inv-stat-box inv-stat-box-paid">
              <div className="inv-stat-label" style={{ color: "#d97706" }}>Amount Due / المستحق</div>
              <div className="inv-stat-value" style={{ color: due > 0 ? "#dc2626" : "#16a34a" }}>
                {fmtMoney(due)}
              </div>
              <div className="inv-stat-currency" style={{ color: "#f59e0b" }}>{currency}</div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              BODY
          ══════════════════════════════════════════ */}
          <div className="inv-body">

            {/* ── Info Cards ── */}
            <div className="inv-info-grid">
              {/* Seller */}
              <div className="inv-info-card inv-info-card-seller">
                <div className="inv-card-tag" style={{ color: "#059669" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                  Seller / البائع
                </div>
                <div className="inv-card-name">{company.companyName ?? "—"}</div>
                {company.companyNameAr && (
                  <div className="inv-card-name-ar" style={{ color: "#065f46" }}>{company.companyNameAr}</div>
                )}
                <div className="inv-card-text">
                  {company.address && <div>{company.address}{company.city ? `, ${company.city}` : ""}</div>}
                  {company.country && <div>{company.country}</div>}
                  {company.phone && <div>📞 {company.phone}</div>}
                  {company.email && <div>✉ {company.email}</div>}
                </div>
                {company.taxNumber && (
                  <div className="inv-vat-badge" style={{ background: "#d1fae5", color: "#065f46" }}>
                    🏛 VAT: {company.taxNumber}
                  </div>
                )}
                {company.crNumber && (
                  <div className="inv-vat-badge" style={{ background: "#d1fae5", color: "#065f46", marginTop: 4 }}>
                    📋 CR: {company.crNumber}
                  </div>
                )}
              </div>

              {/* Buyer */}
              <div className="inv-info-card inv-info-card-buyer">
                <div className="inv-card-tag" style={{ color: "#2563eb" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Bill To / العميل
                </div>
                <div className="inv-card-name">{customer.name ?? "—"}</div>
                {customer.nameAr && (
                  <div className="inv-card-name-ar" style={{ color: "#1e40af" }}>{customer.nameAr}</div>
                )}
                <div className="inv-card-text">
                  {customer.address && <div>{customer.address}{customer.city ? `, ${customer.city}` : ""}</div>}
                  {customer.phone && <div>📞 {customer.phone}</div>}
                  {customer.email && <div>✉ {customer.email}</div>}
                </div>
                {customer.taxNumber && (
                  <div className="inv-vat-badge" style={{ background: "#dbeafe", color: "#1e40af" }}>
                    🏛 Customer VAT: {customer.taxNumber}
                  </div>
                )}
              </div>
            </div>

            {/* ── Meta Row ── */}
            <div className="inv-meta-row">
              <div className="inv-meta-pill inv-meta-pill-type">
                <div className="inv-meta-label">Invoice Type</div>
                <div className="inv-meta-value" style={{ color: "#0f172a", fontSize: 12 }}>
                  {invoice.invoiceType === "simplified" ? "Simplified / مبسطة"
                    : invoice.invoiceType === "zatca"    ? "ZATCA / فاتورة ذاتكا"
                    : "Standard / قياسية"}
                </div>
              </div>
              <div className="inv-meta-pill inv-meta-pill-date">
                <div className="inv-meta-label">Invoice Date</div>
                <div className="inv-meta-value" style={{ color: "#c2410c" }}>
                  {invoice.date ?? "—"}
                </div>
                {hijriDate && (
                  <div style={{ fontSize: 10, color: "#9a3412", direction: "rtl", marginTop: 2 }}>{hijriDate}</div>
                )}
              </div>
              <div className="inv-meta-pill inv-meta-pill-due">
                <div className="inv-meta-label">Due Date</div>
                <div className="inv-meta-value" style={{ color: "#b91c1c" }}>
                  {invoice.dueDate ?? "Upon Receipt"}
                </div>
              </div>
              <div className="inv-meta-pill inv-meta-pill-uuid">
                <div className="inv-meta-label">Place of Supply</div>
                <div className="inv-meta-value" style={{ color: "#6d28d9", fontSize: 12 }}>
                  {company.country ?? "Saudi Arabia / المملكة"}
                </div>
              </div>
            </div>

            {/* ── Items Table ── */}
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: "center" }}>#</th>
                    <th>Description / الوصف</th>
                    <th style={{ textAlign: "right" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Unit Price</th>
                    <th style={{ textAlign: "right" }}>VAT %</th>
                    <th style={{ textAlign: "right" }}>VAT Amt</th>
                    <th style={{ textAlign: "right" }}>Total / الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const lineNet = toNum(item.quantity) * toNum(item.unitPrice);
                    const lineVat = lineNet * (toNum(item.taxPercent) / 100);
                    const lineTotal = toNum(item.totalAmount) || lineNet;
                    return (
                      <tr key={item.id ?? idx}>
                        <td style={{ textAlign: "center" }}>
                          <span className="inv-row-num">{idx + 1}</span>
                        </td>
                        <td>
                          <div className="inv-item-desc">{item.description}</div>
                        </td>
                        <td style={{ textAlign: "right" }} className="inv-table-number">
                          {toNum(item.quantity).toLocaleString()}
                        </td>
                        <td style={{ textAlign: "right" }} className="inv-table-number">
                          {fmtMoney(item.unitPrice)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span style={{
                            background: "#d1fae5", color: "#065f46",
                            padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700
                          }}>
                            {toNum(item.taxPercent)}%
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} className="inv-table-number">
                          {fmtMoney(lineVat)}
                        </td>
                        <td className="inv-table-number">
                          {fmtMoney(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Footer Grid ── */}
            <div className="inv-footer-grid">
              {/* Left: QR + Notes */}
              <div>
                {(invoice.notes || invoice.terms || company.invoiceTerms) && (
                  <div className="inv-notes">
                    <div style={{ fontWeight: 700, marginBottom: 6, color: "#6d28d9" }}>
                      📝 Terms & Notes / الشروط والملاحظات
                    </div>
                    <div style={{ lineHeight: 1.7 }}>
                      {invoice.notes || invoice.terms || company.invoiceTerms}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Totals + QR */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Totals */}
                <div className="inv-totals">
                  <div className="inv-totals-row inv-totals-row-sub">
                    <span className="inv-totals-label">Subtotal / المجموع الفرعي</span>
                    <span className="inv-totals-value">{fmtMoney(subTotal)} {currency}</span>
                  </div>
                  <div className="inv-totals-row inv-totals-row-vat">
                    <span className="inv-totals-label">VAT {vatPct}% / ضريبة القيمة المضافة</span>
                    <span className="inv-totals-value" style={{ color: "#059669" }}>{fmtMoney(taxAmount)} {currency}</span>
                  </div>
                  <div className="inv-totals-row inv-totals-row-total">
                    <span className="inv-totals-label-white">GRAND TOTAL / الإجمالي الكلي</span>
                    <span className="inv-totals-value-big">{fmtMoney(total)} {currency}</span>
                  </div>
                  {paid > 0 && (
                    <div className="inv-totals-row inv-totals-row-paid">
                      <span className="inv-totals-label" style={{ color: "#854d0e" }}>Paid / المدفوع</span>
                      <span className="inv-totals-value" style={{ color: "#854d0e" }}>{fmtMoney(paid)} {currency}</span>
                    </div>
                  )}
                  {paid > 0 && (
                    <div className="inv-totals-row inv-totals-row-due">
                      <span className="inv-totals-label" style={{ color: "#991b1b" }}>Balance Due / المبلغ المستحق</span>
                      <span className="inv-totals-value inv-totals-value-due">{fmtMoney(due)} {currency}</span>
                    </div>
                  )}
                </div>

                {/* QR Code */}
                {qrUrl && (
                  <div className="inv-qr-box">
                    <img src={qrUrl} alt="ZATCA QR" className="inv-qr-img" />
                    <div className="inv-qr-label">ZATCA Phase 2 QR Code</div>
                    <div className="inv-qr-label-ar">رمز الاستجابة السريعة - هيئة الزكاة والضريبة</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── ZATCA Compliance Footer ── */}
            <div className="inv-compliance">
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase",
                  color: "#64748b", background: "#f1f5f9", padding: "4px 16px", borderRadius: 100,
                }}>
                  ⚖️ Saudi Arabia — ZATCA Compliance Information / معلومات الامتثال الضريبي
                </span>
              </div>
              <div className="inv-compliance-grid">
                <div className="inv-compliance-item inv-compliance-item-zatca">
                  <div className="inv-compliance-label">🏛 ZATCA VAT Number</div>
                  <div className="inv-compliance-value">{company.taxNumber ?? "—"}</div>
                  <div style={{ marginTop: 4, fontSize: 10 }}>الرقم الضريبي للبائع</div>
                </div>
                <div className="inv-compliance-item inv-compliance-item-vat">
                  <div className="inv-compliance-label">📋 Commercial Registration</div>
                  <div className="inv-compliance-value">{company.crNumber ?? "—"}</div>
                  <div style={{ marginTop: 4, fontSize: 10 }}>السجل التجاري</div>
                </div>
                <div className="inv-compliance-item inv-compliance-item-cr">
                  <div className="inv-compliance-label">🔐 ZATCA Status</div>
                  <div className="inv-compliance-value" style={{ color: zatcaInfo.color }}>
                    {zatcaInfo.label} / {invoice.zatcaStatus ?? "Pending"}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 10 }}>حالة ZATCA</div>
                </div>
              </div>
              {invoice.hash && (
                <div style={{
                  marginTop: 14, padding: "8px 14px", borderRadius: 10,
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  fontSize: 10, color: "#64748b", wordBreak: "break-all", textAlign: "center"
                }}>
                  <strong>Invoice Hash / تجزئة الفاتورة:</strong> {invoice.hash}
                </div>
              )}
            </div>

            {/* ── Watermark ── */}
            <div className="inv-watermark">
              This invoice was generated in compliance with Saudi Arabia's ZATCA e-Invoicing Phase 2 regulations.
              <br />
              تم إنشاء هذه الفاتورة وفقًا لأنظمة الفوترة الإلكترونية للمرحلة الثانية من هيئة الزكاة والضريبة والجمارك
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SaudiInvoicePrint.displayName = "SaudiInvoicePrint";
export default SaudiInvoicePrint;
