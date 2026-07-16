import { forwardRef } from "react";
import { useLanguage } from "@/providers/language";

interface InvoicePrintTemplateProps {
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
  format?: "A4" | "THERMAL_80MM" | "THERMAL_58MM" | "PURCHASE_ORDER" | "DELIVERY_NOTE" | "QUOTATION";
  documentTitle?: string;
  showBankDetails?: boolean;
  showSignature?: boolean;
  showStamp?: boolean;
  showQr?: boolean;
  notes?: string;
  terms?: string;
}

const InvoicePrintTemplate = forwardRef<HTMLDivElement, InvoicePrintTemplateProps>(
  ({ invoice, company, customer, format = "A4", documentTitle, showBankDetails = true, showSignature = true, showStamp = true, showQr = true, notes, terms }, ref) => {
    const { language } = useLanguage();
    const isAr = language === "ar";
    const headerColor = company.headerColor || "#1E3A5F";

    const fmtMoney = (n: number) => n.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
      draft: { label: isAr ? "مسودة" : "Draft", color: "#64748b", bg: "#f1f5f9" },
      sent: { label: isAr ? "مرسلة" : "Sent", color: "#2563eb", bg: "#dbeafe" },
      paid: { label: isAr ? "مدفوعة" : "PAID", color: "#059669", bg: "#d1fae5" },
      partial: { label: isAr ? "جزئية" : "PARTIAL", color: "#d97706", bg: "#fef3c7" },
      overdue: { label: isAr ? "متأخرة" : "OVERDUE", color: "#dc2626", bg: "#fee2e2" },
      cancelled: { label: isAr ? "ملغاة" : "CANCELLED", color: "#64748b", bg: "#f1f5f9" },
    };

    const statusInfo = STATUS_MAP[invoice.status] || STATUS_MAP.draft;

    const title = documentTitle || (
      format === "PURCHASE_ORDER" ? (isAr ? "أمر شراء" : "PURCHASE ORDER") :
      format === "DELIVERY_NOTE" ? (isAr ? "إشعار تسليم" : "DELIVERY NOTE") :
      format === "QUOTATION" ? (isAr ? "عرض سعر" : "QUOTATION") :
      (isAr ? "فاتورة بيع" : "SALES INVOICE")
    );

    // ─── THERMAL FORMAT ───
    if (format === "THERMAL_80MM" || format === "THERMAL_58MM") {
      const width = format === "THERMAL_80MM" ? "80mm" : "58mm";
      const fontSize = format === "THERMAL_80MM" ? "10px" : "8px";
      return (
        <div ref={ref} style={{ width, fontFamily: "'Courier New', monospace", fontSize, padding: "2mm", background: "white" }}>
          <div style={{ textAlign: "center", borderBottom: "2px dashed #333", paddingBottom: "2mm", marginBottom: "2mm" }}>
            {company.logo && <img src={company.logo} alt="Logo" style={{ height: "10mm", marginBottom: "1mm" }} />}
            <div style={{ fontWeight: "bold", fontSize: format === "THERMAL_80MM" ? "12px" : "9px" }}>{company.name}</div>
            {company.nameAr && <div dir="rtl" style={{ fontSize: format === "THERMAL_80MM" ? "11px" : "8px" }}>{company.nameAr}</div>}
            {company.taxNumber && <div style={{ fontSize: "8px" }}>VAT: {company.taxNumber}</div>}
            {company.phone && <div style={{ fontSize: "8px" }}>{company.phone}</div>}
          </div>
          <div style={{ marginBottom: "2mm" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{title}:</span>
              <span style={{ fontWeight: "bold" }}>{invoice.invoiceNumber}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{isAr ? "التاريخ:" : "Date:"}</span>
              <span>{new Date(invoice.date).toLocaleDateString()}</span>
            </div>
          </div>
          <div style={{ borderTop: "2px dashed #333", paddingTop: "2mm", marginBottom: "2mm" }}>
            {invoice.items.map((item, i) => (
              <div key={i} style={{ marginBottom: "1mm" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ flex: 2 }}>{item.description}</span>
                  <span style={{ flex: 1, textAlign: "right" }}>{item.quantity}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                  <span>@ {fmtMoney(item.unitPrice)}</span>
                  <span>{fmtMoney(item.total)}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "2px dashed #333", paddingTop: "2mm" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
              <span>{fmtMoney(invoice.subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{isAr ? "ضريبة القيمة المضافة" : "VAT (15%)"}</span>
              <span>{fmtMoney(invoice.vatAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: format === "THERMAL_80MM" ? "12px" : "10px", borderTop: "2px solid #000", paddingTop: "1mm", marginTop: "1mm" }}>
              <span>{isAr ? "الإجمالي" : "TOTAL"}</span>
              <span>SAR {fmtMoney(invoice.totalAmount)}</span>
            </div>
          </div>
          {showQr && invoice.zatcaQrCode && (
            <div style={{ textAlign: "center", marginTop: "3mm" }}>
              <img src={invoice.zatcaQrCode} alt="ZATCA QR" style={{ width: "18mm", height: "18mm" }} />
              <div style={{ fontSize: "7px", color: "#666" }}>ZATCA Compliant</div>
            </div>
          )}
          {notes && <div style={{ fontSize: "8px", color: "#666", marginTop: "2mm", textAlign: "center" }}>{notes}</div>}
          <div style={{ textAlign: "center", borderTop: "2px dashed #333", paddingTop: "2mm", marginTop: "2mm", fontSize: "7px" }}>
            {company.footerText || "Thank you for your business!"}
            {company.footerTextAr && <div dir="rtl">{company.footerTextAr}</div>}
          </div>
        </div>
      );
    }

    // ─── A4 3D BOX STYLE FORMAT ───
    return (
      <div ref={ref} style={{
        width: "210mm", minHeight: "297mm",
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: "10px", color: "#1e293b", background: "#f8fafc",
        padding: "0", lineHeight: "1.5",
      }}>
        {/* ═══ TOP GRADIENT HEADER ═══ */}
        <div style={{
          background: `linear-gradient(135deg, ${headerColor} 0%, ${headerColor}cc 50%, ${headerColor}99 100%)`,
          color: "white", padding: "0", position: "relative", overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", bottom: "-30px", left: "60%", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", position: "relative", zIndex: 1 }}>
            {/* Company Logo + Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {company.logo ? (
                <div style={{
                  width: "60px", height: "60px", borderRadius: "14px",
                  background: "white", padding: "4px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img src={company.logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px" }} />
                </div>
              ) : (
                <div style={{
                  width: "60px", height: "60px", borderRadius: "14px",
                  background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "bold", fontSize: "20px", letterSpacing: "1px",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}>
                  {company.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontWeight: "700", fontSize: "17px", letterSpacing: "0.5px", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
                  {company.name}
                </div>
                {company.nameAr && (
                  <div dir="rtl" style={{ fontSize: "13px", opacity: 0.9, marginTop: "1px" }}>
                    {company.nameAr}
                  </div>
                )}
                <div style={{ fontSize: "9px", opacity: 0.75, marginTop: "3px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {company.crNumber && <span>CR: {company.crNumber}</span>}
                  {company.taxNumber && <span>VAT: {company.taxNumber}</span>}
                </div>
              </div>
            </div>

            {/* Invoice Title Box */}
            <div style={{ textAlign: "right" }}>
              <div style={{
                background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
                borderRadius: "12px", padding: "10px 20px",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              }}>
                <div style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "2px", textTransform: "uppercase" }}>
                  {title}
                </div>
                <div style={{ fontSize: "11px", opacity: 0.9, marginTop: "2px", fontFamily: "monospace" }}>
                  #{invoice.invoiceNumber}
                </div>
              </div>
              {invoice.zatcaStatus && (
                <div style={{
                  marginTop: "8px", fontSize: "9px", padding: "4px 12px", borderRadius: "20px",
                  background: invoice.zatcaStatus === "cleared" ? "#10b981" : invoice.zatcaStatus === "pending" ? "#f59e0b" : "#ef4444",
                  color: "white", display: "inline-block", fontWeight: "600",
                  boxShadow: `0 2px 8px ${invoice.zatcaStatus === "cleared" ? "rgba(16,185,129,0.4)" : invoice.zatcaStatus === "pending" ? "rgba(245,158,11,0.4)" : "rgba(239,68,68,0.4)"}`,
                }}>
                  ✓ ZATCA {invoice.zatcaStatus.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ INVOICE META BAR ═══ */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0",
          margin: "0 20px", marginTop: "16px",
          background: "white", borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}>
          {[
            { label: isAr ? "رقم الفاتورة" : "Invoice #", value: invoice.invoiceNumber, icon: "📋" },
            { label: isAr ? "تاريخ الفاتورة" : "Invoice Date", value: new Date(invoice.date).toLocaleDateString(), icon: "📅" },
            { label: isAr ? "تاريخ الاستحقاق" : "Due Date", value: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—", icon: "⏰" },
            { label: isAr ? "الحالة" : "Status", value: statusInfo.label, icon: "📌", isStatus: true },
          ].map((meta, i) => (
            <div key={i} style={{
              padding: "12px 14px",
              borderRight: i < 3 ? "1px solid #f1f5f9" : "none",
              background: i === 3 ? statusInfo.bg : "white",
            }}>
              <div style={{ fontSize: "8px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {meta.label}
              </div>
              {meta.isStatus ? (
                <div style={{
                  fontWeight: "700", fontSize: "11px", color: statusInfo.color,
                  marginTop: "4px", padding: "2px 8px", borderRadius: "6px",
                  background: `${statusInfo.color}15`, display: "inline-block",
                }}>
                  {meta.value}
                </div>
              ) : (
                <div style={{ fontWeight: "600", fontSize: "11px", color: "#1e293b", marginTop: "4px" }}>
                  {meta.value}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ═══ SELLER & BUYER 3D CARDS ═══ */}
        <div style={{ display: "flex", gap: "14px", padding: "14px 20px" }}>
          {/* Seller Card */}
          <div style={{
            flex: 1, borderRadius: "14px", padding: "16px",
            background: "linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)",
            boxShadow: "0 4px 15px rgba(16,185,129,0.08), 0 2px 6px rgba(0,0,0,0.04)",
            border: "1px solid #bbf7d0",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "60px", height: "60px", borderRadius: "50%", background: "rgba(16,185,129,0.08)" }} />
            <div style={{
              fontSize: "8px", color: "#059669", fontWeight: "700",
              textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px",
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#059669", display: "inline-block" }} />
              {isAr ? "البائع / المورد" : "SELLER / SUPPLIER"}
            </div>
            <div style={{ fontWeight: "700", fontSize: "12px", color: "#064e3b" }}>{company.name}</div>
            {company.nameAr && <div dir="rtl" style={{ fontSize: "11px", color: "#065f46", marginTop: "2px" }}>{company.nameAr}</div>}
            <div style={{ marginTop: "8px", fontSize: "9px", color: "#475569", lineHeight: "1.6" }}>
              {company.address && <div>{company.address}</div>}
              {company.city && <div>{company.city}, {company.country || "Saudi Arabia"}</div>}
              {company.phone && <div style={{ marginTop: "2px" }}>📞 {company.phone}</div>}
              {company.email && <div>✉️ {company.email}</div>}
              {company.website && <div>🌐 {company.website}</div>}
            </div>
          </div>

          {/* Buyer Card */}
          <div style={{
            flex: 1, borderRadius: "14px", padding: "16px",
            background: "linear-gradient(145deg, #ffffff 0%, #eff6ff 100%)",
            boxShadow: "0 4px 15px rgba(59,130,246,0.08), 0 2px 6px rgba(0,0,0,0.04)",
            border: "1px solid #bfdbfe",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "60px", height: "60px", borderRadius: "50%", background: "rgba(59,130,246,0.08)" }} />
            <div style={{
              fontSize: "8px", color: "#2563eb", fontWeight: "700",
              textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px",
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
              {isAr ? "المشتري / العميل" : "BUYER / CUSTOMER"}
            </div>
            <div style={{ fontWeight: "700", fontSize: "12px", color: "#1e3a5f" }}>{customer.name}</div>
            {customer.nameAr && <div dir="rtl" style={{ fontSize: "11px", color: "#1e40af", marginTop: "2px" }}>{customer.nameAr}</div>}
            <div style={{ marginTop: "8px", fontSize: "9px", color: "#475569", lineHeight: "1.6" }}>
              {customer.taxNumber && <div style={{ fontWeight: "600", color: "#2563eb" }}>VAT: {customer.taxNumber}</div>}
              {customer.address && <div>{customer.address}</div>}
              {customer.city && <div>{customer.city}, {customer.country || ""}</div>}
              {customer.phone && <div style={{ marginTop: "2px" }}>📞 {customer.phone}</div>}
            </div>
          </div>
        </div>

        {/* ═══ PRODUCT ITEMS IN 3D BOXES ═══ */}
        <div style={{ padding: "0 20px" }}>
          <div style={{
            borderRadius: "14px", overflow: "hidden",
            boxShadow: "0 4px 15px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0",
          }}>
            {/* Table Header */}
            <div style={{
              background: `linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%)`,
              color: "white", padding: "10px 14px",
              display: "grid", gridTemplateColumns: "40px 1fr 70px 90px 60px 90px 100px",
              gap: "8px", fontSize: "9px", fontWeight: "700",
              textTransform: "uppercase", letterSpacing: "0.5px",
            }}>
              <div style={{ textAlign: "center" }}>#</div>
              <div>{isAr ? "الوصف" : "Description"}</div>
              <div style={{ textAlign: "center" }}>{isAr ? "الكمية" : "Qty"}</div>
              <div style={{ textAlign: "right" }}>{isAr ? "سعر الوحدة" : "Unit Price"}</div>
              <div style={{ textAlign: "center" }}>{isAr ? "الضريبة" : "VAT"}</div>
              <div style={{ textAlign: "right" }}>{isAr ? "مبلغ الضريبة" : "VAT Amt"}</div>
              <div style={{ textAlign: "right" }}>{isAr ? "الإجمالي" : "Total"}</div>
            </div>

            {/* Table Rows as 3D Cards */}
            {invoice.items.map((item, i) => (
              <div key={i} style={{
                padding: "11px 14px",
                display: "grid", gridTemplateColumns: "40px 1fr 70px 90px 60px 90px 100px",
                gap: "8px", fontSize: "9.5px",
                background: i % 2 === 0 ? "white" : "#f8fafc",
                borderBottom: i < invoice.items.length - 1 ? "1px solid #f1f5f9" : "none",
                transition: "background 0.2s",
              }}>
                <div style={{
                  textAlign: "center", fontWeight: "700", color: "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    width: "24px", height: "24px", borderRadius: "8px",
                    background: `linear-gradient(135deg, ${headerColor}15, ${headerColor}08)`,
                    border: `1px solid ${headerColor}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: "700", color: headerColor,
                  }}>
                    {i + 1}
                  </span>
                </div>
                <div style={{ fontWeight: "600", color: "#1e293b", display: "flex", alignItems: "center" }}>
                  {item.description}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{
                    background: `${headerColor}10`, color: headerColor,
                    padding: "2px 8px", borderRadius: "6px", fontWeight: "600", fontSize: "10px",
                  }}>
                    {item.quantity}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontWeight: "500", color: "#475569" }}>
                  {fmtMoney(item.unitPrice)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{
                    background: "#fef3c7", color: "#92400e",
                    padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: "600",
                  }}>
                    {item.vatRate}%
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", color: "#64748b", fontSize: "9px" }}>
                  {fmtMoney(item.vatAmount)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontWeight: "700", color: headerColor, fontSize: "11px" }}>
                  {fmtMoney(item.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ TOTALS & QR SECTION ═══ */}
        <div style={{ display: "flex", gap: "14px", padding: "16px 20px" }}>
          {/* Left: Bank + Notes */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Bank Details 3D Box */}
            {showBankDetails && company.bankName && (
              <div style={{
                borderRadius: "14px", padding: "14px",
                background: "linear-gradient(145deg, #ffffff 0%, #fefce8 100%)",
                boxShadow: "0 4px 15px rgba(234,179,8,0.08), 0 2px 6px rgba(0,0,0,0.04)",
                border: "1px solid #fde68a",
              }}>
                <div style={{
                  fontSize: "9px", color: "#a16207", fontWeight: "700",
                  textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#eab308", display: "inline-block" }} />
                  {isAr ? "البيانات البنكية" : "BANK DETAILS"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "9px" }}>
                  <div>
                    <span style={{ color: "#94a3b8" }}>{isAr ? "البنك:" : "Bank:"}</span>
                    <span style={{ fontWeight: "600", marginLeft: "4px" }}>{company.bankName}</span>
                  </div>
                  {company.bankAccountName && (
                    <div>
                      <span style={{ color: "#94a3b8" }}>{isAr ? "الحساب:" : "Account:"}</span>
                      <span style={{ fontWeight: "600", marginLeft: "4px" }}>{company.bankAccountName}</span>
                    </div>
                  )}
                  {company.bankIban && (
                    <div style={{ gridColumn: "span 2" }}>
                      <span style={{ color: "#94a3b8" }}>IBAN:</span>
                      <span style={{ fontWeight: "600", marginLeft: "4px", fontFamily: "monospace" }}>{company.bankIban}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {(notes || invoice.notes) && (
              <div style={{
                borderRadius: "14px", padding: "12px",
                background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                border: "1px solid #e2e8f0", fontSize: "9px", color: "#64748b",
              }}>
                <strong style={{ color: "#1e293b" }}>{isAr ? "ملاحظات:" : "Notes:"}</strong> {notes || invoice.notes}
              </div>
            )}

            {/* Terms */}
            {terms && (
              <div style={{
                borderRadius: "14px", padding: "12px",
                background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                border: "1px solid #e2e8f0", fontSize: "9px", color: "#64748b",
              }}>
                <strong style={{ color: "#1e293b" }}>{isAr ? "الشروط والأحكام:" : "Terms & Conditions:"}</strong> {terms}
              </div>
            )}

            {/* Signature & Stamp */}
            {(showSignature || showStamp) && (
              <div style={{ display: "flex", gap: "20px", justifyContent: "flex-end" }}>
                {showSignature && company.signature && (
                  <div style={{ textAlign: "center" }}>
                    <img src={company.signature} alt="Signature" style={{ height: "40px", opacity: 0.8 }} />
                    <div style={{ borderTop: "1px solid #333", width: "120px", marginTop: "2px" }}>
                      <div style={{ fontSize: "8px", color: "#64748b" }}>{isAr ? "توقيع المدير" : "Manager Signature"}</div>
                    </div>
                  </div>
                )}
                {showStamp && company.stamp && (
                  <div style={{ textAlign: "center" }}>
                    <img src={company.stamp} alt="Stamp" style={{ height: "60px", opacity: 0.6 }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Totals + QR */}
          <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Totals 3D Box */}
            <div style={{
              borderRadius: "14px", padding: "16px",
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0",
            }}>
              <div style={{
                fontSize: "9px", color: "#64748b", fontWeight: "700",
                textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px",
              }}>
                {isAr ? "ملخص المبالغ" : "AMOUNT SUMMARY"}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "10px" }}>
                <span style={{ color: "#64748b" }}>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                <span style={{ fontWeight: "500" }}>SAR {fmtMoney(invoice.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "10px" }}>
                <span style={{ color: "#64748b" }}>{isAr ? "ضريبة القيمة المضافة" : "VAT (15%)"}</span>
                <span style={{ fontWeight: "500" }}>SAR {fmtMoney(invoice.vatAmount)}</span>
              </div>

              {/* Grand Total Box */}
              <div style={{
                marginTop: "10px", padding: "12px", borderRadius: "10px",
                background: `linear-gradient(135deg, ${headerColor} 0%, ${headerColor}cc 100%)`,
                color: "white",
                boxShadow: `0 4px 12px ${headerColor}40`,
              }}>
                <div style={{ fontSize: "9px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>
                  {isAr ? "الإجمالي" : "GRAND TOTAL"}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "800", marginTop: "2px", letterSpacing: "0.5px" }}>
                  SAR {fmtMoney(invoice.totalAmount)}
                </div>
              </div>

              {/* Paid & Balance */}
              {invoice.paidAmount !== undefined && invoice.paidAmount > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "10px" }}>
                    <span style={{ color: "#64748b" }}>{isAr ? "المدفوع" : "Paid"}</span>
                    <span style={{ color: "#059669", fontWeight: "600" }}>- SAR {fmtMoney(invoice.paidAmount)}</span>
                  </div>
                  <div style={{
                    marginTop: "6px", padding: "8px", borderRadius: "8px",
                    background: "#fef2f2", border: "1px solid #fecaca",
                    display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700",
                  }}>
                    <span style={{ color: "#dc2626" }}>{isAr ? "المتبقي" : "Balance Due"}</span>
                    <span style={{ color: "#dc2626" }}>SAR {fmtMoney(invoice.balanceDue || 0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ZATCA QR Code 3D Box */}
            {showQr && invoice.zatcaQrCode && (
              <div style={{
                borderRadius: "14px", padding: "16px",
                background: "linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)",
                boxShadow: "0 4px 15px rgba(16,185,129,0.08), 0 2px 6px rgba(0,0,0,0.04)",
                border: "1px solid #bbf7d0",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: "8px", color: "#059669", fontWeight: "700",
                  textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#059669", display: "inline-block" }} />
                  ZATCA VERIFIED
                </div>
                <div style={{
                  display: "inline-block", padding: "8px", borderRadius: "12px",
                  background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #d1fae5",
                }}>
                  <img src={invoice.zatcaQrCode} alt="ZATCA QR" style={{ width: "90px", height: "90px" }} />
                </div>
                <div style={{ fontSize: "8px", color: "#64748b", marginTop: "6px" }}>
                  {isAr ? "امسح للتحقق من الفاتورة" : "Scan to verify invoice"}
                </div>
                {invoice.zatcaUuid && (
                  <div style={{ fontSize: "7px", color: "#94a3b8", marginTop: "4px", fontFamily: "monospace", wordBreak: "break-all" }}>
                    UUID: {invoice.zatcaUuid}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{
          margin: "0 20px 16px", padding: "12px 20px",
          background: "white", borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: "8px", color: "#94a3b8" }}>
            {invoice.zatcaUuid && <span style={{ fontFamily: "monospace" }}>ZATCA UUID: {invoice.zatcaUuid}</span>}
          </div>
          <div style={{ textAlign: "right", fontSize: "9px" }}>
            <div style={{ color: headerColor, fontWeight: "600" }}>
              {company.footerText || "Thank you for your business!"}
            </div>
            {company.footerTextAr && (
              <div dir="rtl" style={{ color: "#94a3b8", fontSize: "8px", marginTop: "2px" }}>
                {company.footerTextAr}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

InvoicePrintTemplate.displayName = "InvoicePrintTemplate";
export default InvoicePrintTemplate;
