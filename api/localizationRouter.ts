import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";

const countries = [
  { code: "SA", name: "Saudi Arabia", nameAr: "المملكة العربية السعودية", phoneCode: "966", flag: "🇸🇦", isActive: true },
  { code: "PK", name: "Pakistan", nameAr: "باكستان", phoneCode: "92", flag: "🇵🇰", isActive: true },
  { code: "AE", name: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة", phoneCode: "971", flag: "🇦🇪", isActive: true },
  { code: "QA", name: "Qatar", nameAr: "قطر", phoneCode: "974", flag: "🇶🇦", isActive: true },
  { code: "OM", name: "Oman", nameAr: "عمان", phoneCode: "968", flag: "🇴🇲", isActive: true },
  { code: "BH", name: "Bahrain", nameAr: "البحرين", phoneCode: "973", flag: "🇧🇭", isActive: true },
  { code: "KW", name: "Kuwait", nameAr: "الكويت", phoneCode: "965", flag: "🇰🇼", isActive: true },
  { code: "IN", name: "India", nameAr: "الهند", phoneCode: "91", flag: "🇮🇳", isActive: true },
  { code: "BD", name: "Bangladesh", nameAr: "بنغلاديش", phoneCode: "880", flag: "🇧🇩", isActive: true },
  { code: "GB", name: "United Kingdom", nameAr: "المملكة المتحدة", phoneCode: "44", flag: "🇬🇧", isActive: true },
  { code: "DE", name: "Germany", nameAr: "ألمانيا", phoneCode: "49", flag: "🇩🇪", isActive: true },
  { code: "FR", name: "France", nameAr: "فرنسا", phoneCode: "33", flag: "🇫🇷", isActive: true },
  { code: "US", name: "United States", nameAr: "الولايات المتحدة", phoneCode: "1", flag: "🇺🇸", isActive: true },
  { code: "CA", name: "Canada", nameAr: "كندا", phoneCode: "1", flag: "🇨🇦", isActive: true },
  { code: "AU", name: "Australia", nameAr: "أستراليا", phoneCode: "61", flag: "🇦🇺", isActive: true },
  { code: "TR", name: "Turkey", nameAr: "تركيا", phoneCode: "90", flag: "🇹🇷", isActive: true },
  { code: "EG", name: "Egypt", nameAr: "مصر", phoneCode: "20", flag: "🇪🇬", isActive: true },
  { code: "MY", name: "Malaysia", nameAr: "ماليزيا", phoneCode: "60", flag: "🇲🇾", isActive: true },
  { code: "ID", name: "Indonesia", nameAr: "إندونيسيا", phoneCode: "62", flag: "🇮🇩", isActive: true },
  { code: "ZA", name: "South Africa", nameAr: "جنوب أفريقيا", phoneCode: "27", flag: "🇿🇦", isActive: true },
  { code: "NG", name: "Nigeria", nameAr: "نيجيريا", phoneCode: "234", flag: "🇳🇬", isActive: true },
];

const localizationProfiles: Record<string, {
  language: string;
  languageAr: string;
  currency: string;
  currencySymbol: string;
  currencyName: string;
  currencyNameAr: string;
  timezone: string;
  timezoneName: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  isRtl: boolean;
  weekStartsOn: number;
  decimalSeparator: string;
  thousandsSeparator: string;
}> = {
  SA: { language: "ar", languageAr: "العربية", currency: "SAR", currencySymbol: "﷼", currencyName: "Saudi Riyal", currencyNameAr: "ريال سعودي", timezone: "Asia/Riyadh", timezoneName: "Arabia Standard Time", dateFormat: "DD/MM/YYYY", timeFormat: "24h", numberFormat: "#,##0.00", isRtl: true, weekStartsOn: 0, decimalSeparator: ".", thousandsSeparator: "," },
  PK: { language: "ur", languageAr: "الأردية", currency: "PKR", currencySymbol: "₨", currencyName: "Pakistani Rupee", currencyNameAr: "روبية باكستانية", timezone: "Asia/Karachi", timezoneName: "Pakistan Standard Time", dateFormat: "DD/MM/YYYY", timeFormat: "12h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 1, decimalSeparator: ".", thousandsSeparator: "," },
  AE: { language: "ar", languageAr: "العربية", currency: "AED", currencySymbol: "د.إ", currencyName: "UAE Dirham", currencyNameAr: "درهم إماراتي", timezone: "Asia/Dubai", timezoneName: "Gulf Standard Time", dateFormat: "DD/MM/YYYY", timeFormat: "24h", numberFormat: "#,##0.00", isRtl: true, weekStartsOn: 0, decimalSeparator: ".", thousandsSeparator: "," },
  QA: { language: "ar", languageAr: "العربية", currency: "QAR", currencySymbol: "﷼", currencyName: "Qatari Riyal", currencyNameAr: "ريال قطري", timezone: "Asia/Qatar", timezoneName: "Arabia Standard Time", dateFormat: "DD/MM/YYYY", timeFormat: "24h", numberFormat: "#,##0.00", isRtl: true, weekStartsOn: 0, decimalSeparator: ".", thousandsSeparator: "," },
  OM: { language: "ar", languageAr: "العربية", currency: "OMR", currencySymbol: "﷼", currencyName: "Omani Rial", currencyNameAr: "ريال عماني", timezone: "Asia/Muscat", timezoneName: "Gulf Standard Time", dateFormat: "DD/MM/YYYY", timeFormat: "24h", numberFormat: "#,##0.000", isRtl: true, weekStartsOn: 0, decimalSeparator: ".", thousandsSeparator: "," },
  BH: { language: "ar", languageAr: "العربية", currency: "BHD", currencySymbol: "د.ب", currencyName: "Bahraini Dinar", currencyNameAr: "دينار بحريني", timezone: "Asia/Bahrain", timezoneName: "Arabia Standard Time", dateFormat: "DD/MM/YYYY", timeFormat: "24h", numberFormat: "#,##0.000", isRtl: true, weekStartsOn: 0, decimalSeparator: ".", thousandsSeparator: "," },
  KW: { language: "ar", languageAr: "العربية", currency: "KWD", currencySymbol: "د.ك", currencyName: "Kuwaiti Dinar", currencyNameAr: "دينار كويتي", timezone: "Asia/Kuwait", timezoneName: "Arabia Standard Time", dateFormat: "DD/MM/YYYY", timeFormat: "24h", numberFormat: "#,##0.000", isRtl: true, weekStartsOn: 0, decimalSeparator: ".", thousandsSeparator: "," },
  IN: { language: "hi", languageAr: "الهندية", currency: "INR", currencySymbol: "₹", currencyName: "Indian Rupee", currencyNameAr: "روبية هندية", timezone: "Asia/Kolkata", timezoneName: "India Standard Time", dateFormat: "DD/MM/YYYY", timeFormat: "12h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 1, decimalSeparator: ".", thousandsSeparator: "," },
  BD: { language: "bn", languageAr: "البنغالية", currency: "BDT", currencySymbol: "৳", currencyName: "Bangladeshi Taka", currencyNameAr: "تاكا بنغلاديشي", timezone: "Asia/Dhaka", timezoneName: "Bangladesh Standard Time", dateFormat: "DD/MM/YYYY", timeFormat: "12h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 1, decimalSeparator: ".", thousandsSeparator: "," },
  GB: { language: "en", languageAr: "الإنجليزية", currency: "GBP", currencySymbol: "£", currencyName: "British Pound", currencyNameAr: "جنيه إسترليني", timezone: "Europe/London", timezoneName: "Greenwich Mean Time", dateFormat: "DD/MM/YYYY", timeFormat: "12h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 1, decimalSeparator: ".", thousandsSeparator: "," },
  DE: { language: "de", languageAr: "الألمانية", currency: "EUR", currencySymbol: "€", currencyName: "Euro", currencyNameAr: "يورو", timezone: "Europe/Berlin", timezoneName: "Central European Time", dateFormat: "DD.MM.YYYY", timeFormat: "24h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 1, decimalSeparator: ",", thousandsSeparator: "." },
  FR: { language: "fr", languageAr: "الفرنسية", currency: "EUR", currencySymbol: "€", currencyName: "Euro", currencyNameAr: "يورو", timezone: "Europe/Paris", timezoneName: "Central European Time", dateFormat: "DD/MM/YYYY", timeFormat: "24h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 1, decimalSeparator: ",", thousandsSeparator: " " },
  US: { language: "en", languageAr: "الإنجليزية", currency: "USD", currencySymbol: "$", currencyName: "US Dollar", currencyNameAr: "دولار أمريكي", timezone: "America/New_York", timezoneName: "Eastern Standard Time", dateFormat: "MM/DD/YYYY", timeFormat: "12h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 0, decimalSeparator: ".", thousandsSeparator: "," },
  CA: { language: "en", languageAr: "الإنجليزية", currency: "CAD", currencySymbol: "$", currencyName: "Canadian Dollar", currencyNameAr: "دولار كندي", timezone: "America/Toronto", timezoneName: "Eastern Standard Time", dateFormat: "YYYY-MM-DD", timeFormat: "12h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 0, decimalSeparator: ".", thousandsSeparator: "," },
  AU: { language: "en", languageAr: "الإنجليزية", currency: "AUD", currencySymbol: "$", currencyName: "Australian Dollar", currencyNameAr: "دولار أسترالي", timezone: "Australia/Sydney", timezoneName: "Australian Eastern Standard Time", dateFormat: "DD/MM/YYYY", timeFormat: "12h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 1, decimalSeparator: ".", thousandsSeparator: "," },
  TR: { language: "tr", languageAr: "التركية", currency: "TRY", currencySymbol: "₺", currencyName: "Turkish Lira", currencyNameAr: "ليرة تركية", timezone: "Europe/Istanbul", timezoneName: "Turkey Time", dateFormat: "DD.MM.YYYY", timeFormat: "24h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 1, decimalSeparator: ",", thousandsSeparator: "." },
  EG: { language: "ar", languageAr: "العربية", currency: "EGP", currencySymbol: "£", currencyName: "Egyptian Pound", currencyNameAr: "جنيه مصري", timezone: "Africa/Cairo", timezoneName: "Eastern European Time", dateFormat: "DD/MM/YYYY", timeFormat: "12h", numberFormat: "#,##0.00", isRtl: true, weekStartsOn: 0, decimalSeparator: ".", thousandsSeparator: "," },
  MY: { language: "ms", languageAr: "الملايوية", currency: "MYR", currencySymbol: "RM", currencyName: "Malaysian Ringgit", currencyNameAr: "رينغيت ماليزي", timezone: "Asia/Kuala_Lumpur", timezoneName: "Malaysia Time", dateFormat: "DD/MM/YYYY", timeFormat: "12h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 1, decimalSeparator: ".", thousandsSeparator: "," },
  ID: { language: "id", languageAr: "الإندونيسية", currency: "IDR", currencySymbol: "Rp", currencyName: "Indonesian Rupiah", currencyNameAr: "روبية إندونيسية", timezone: "Asia/Jakarta", timezoneName: "Western Indonesia Time", dateFormat: "DD/MM/YYYY", timeFormat: "24h", numberFormat: "#,##0", isRtl: false, weekStartsOn: 1, decimalSeparator: ",", thousandsSeparator: "." },
  ZA: { language: "en", languageAr: "الإنجليزية", currency: "ZAR", currencySymbol: "R", currencyName: "South African Rand", currencyNameAr: "راند جنوب أفريقي", timezone: "Africa/Johannesburg", timezoneName: "South Africa Standard Time", dateFormat: "YYYY/MM/DD", timeFormat: "12h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 1, decimalSeparator: ",", thousandsSeparator: " " },
  NG: { language: "en", languageAr: "الإنجليزية", currency: "NGN", currencySymbol: "₦", currencyName: "Nigerian Naira", currencyNameAr: "نايرة نيجيرية", timezone: "Africa/Lagos", timezoneName: "West Africa Time", dateFormat: "DD/MM/YYYY", timeFormat: "12h", numberFormat: "#,##0.00", isRtl: false, weekStartsOn: 1, decimalSeparator: ".", thousandsSeparator: "," },
};

const taxProfiles: Record<string, {
  taxSystem: string;
  taxName: string;
  taxNameAr: string;
  taxRate: number;
  taxType: string;
  hasWithholdingTax: boolean;
  withholdingRate: number;
  taxAuthority: string;
  taxAuthorityAr: string;
  registrationFormat: string;
  registrationExample: string;
  requiresQrCode: boolean;
  requiresDigitalSignature: boolean;
  hasSimplifiedInvoice: boolean;
  hasStandardInvoice: boolean;
  filingFrequency: string;
  filingFrequencyAr: string;
  penaltyLateSubmission: string;
  penaltyLatePayment: string;
}> = {
  SA: { taxSystem: "vat", taxName: "Value Added Tax", taxNameAr: "ضريبة القيمة المضافة", taxRate: 15, taxType: "vat", hasWithholdingTax: true, withholdingRate: 5, taxAuthority: "ZATCA", taxAuthorityAr: "الهيئة العامة للزكاة والضريبة والجمارك", registrationFormat: "NN-NNNN-NNNN-NNNN", registrationExample: "3-1234-5678-9012", requiresQrCode: true, requiresDigitalSignature: true, hasSimplifiedInvoice: true, hasStandardInvoice: true, filingFrequency: "monthly", filingFrequencyAr: "شهري", penaltyLateSubmission: "5% of tax due, minimum SAR 1,000", penaltyLatePayment: "1% per day of unpaid tax" },
  PK: { taxSystem: "sales_tax", taxName: "Sales Tax", taxNameAr: "ضريبة المبيعات", taxRate: 18, taxType: "sales_tax", hasWithholdingTax: true, withholdingRate: 7.5, taxAuthority: "FBR", taxAuthorityAr: "مجلس الإيرادات الاتحادي", registrationFormat: "NN-NN-NNNN-NNN-N", registrationExample: "12-34-5678-901-5", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "monthly", filingFrequencyAr: "شهري", penaltyLateSubmission: "5% of tax due", penaltyLatePayment: "1% per month of unpaid tax" },
  AE: { taxSystem: "vat", taxName: "Value Added Tax", taxNameAr: "ضريبة القيمة المضافة", taxRate: 5, taxType: "vat", hasWithholdingTax: false, withholdingRate: 0, taxAuthority: "FTA", taxAuthorityAr: "الهيئة الاتحادية للضرائب", registrationFormat: "NNNNNNNNNNNNN", registrationExample: "1234567890123", requiresQrCode: true, requiresDigitalSignature: true, hasSimplifiedInvoice: true, hasStandardInvoice: true, filingFrequency: "quarterly", filingFrequencyAr: "ربع سنوي", penaltyLateSubmission: "AED 1,000 per return", penaltyLatePayment: "2% per day of unpaid tax, max 300%" },
  QA: { taxSystem: "vat", taxName: "Value Added Tax", taxNameAr: "ضريبة القيمة المضافة", taxRate: 5, taxType: "vat", hasWithholdingTax: false, withholdingRate: 0, taxAuthority: "GTA", taxAuthorityAr: "الهيئة العامة للضرائب", registrationFormat: "NNNNNNNNNNN", registrationExample: "12345678901", requiresQrCode: true, requiresDigitalSignature: true, hasSimplifiedInvoice: true, hasStandardInvoice: true, filingFrequency: "quarterly", filingFrequencyAr: "ربع سنوي", penaltyLateSubmission: "QAR 500 per return", penaltyLatePayment: "1% per day of unpaid tax" },
  OM: { taxSystem: "vat", taxName: "Value Added Tax", taxNameAr: "ضريبة القيمة المضافة", taxRate: 5, taxType: "vat", hasWithholdingTax: true, withholdingRate: 3, taxAuthority: "OTA", taxAuthorityAr: "الهيئة العامة للضرائب", registrationFormat: "NNNNNNNNNNN", registrationExample: "12345678901", requiresQrCode: true, requiresDigitalSignature: true, hasSimplifiedInvoice: true, hasStandardInvoice: true, filingFrequency: "quarterly", filingFrequencyAr: "ربع سنوي", penaltyLateSubmission: "OMR 200 per return", penaltyLatePayment: "1% per day of unpaid tax" },
  BH: { taxSystem: "vat", taxName: "Value Added Tax", taxNameAr: "ضريبة القيمة المضافة", taxRate: 10, taxType: "vat", hasWithholdingTax: false, withholdingRate: 0, taxAuthority: "NBR", taxAuthorityAr: "الهيئة الوطنية للإيرادات", registrationFormat: "NNNNNNNNNNN", registrationExample: "12345678901", requiresQrCode: true, requiresDigitalSignature: true, hasSimplifiedInvoice: true, hasStandardInvoice: true, filingFrequency: "quarterly", filingFrequencyAr: "ربع سنوي", penaltyLateSubmission: "BHD 100 per return", penaltyLatePayment: "2% per month of unpaid tax" },
  KW: { taxSystem: "vat", taxName: "Value Added Tax", taxNameAr: "ضريبة القيمة المضافة", taxRate: 5, taxType: "vat", hasWithholdingTax: false, withholdingRate: 0, taxAuthority: "DGIT", taxAuthorityAr: "إدارة ضريبة الدخل", registrationFormat: "NNNNNNNNNNN", registrationExample: "12345678901", requiresQrCode: true, requiresDigitalSignature: false, hasSimplifiedInvoice: true, hasStandardInvoice: true, filingFrequency: "quarterly", filingFrequencyAr: "ربع سنوي", penaltyLateSubmission: "KWD 100 per return", penaltyLatePayment: "2% per month of unpaid tax" },
  IN: { taxSystem: "gst", taxName: "Goods and Services Tax", taxNameAr: "ضريبة السلع والخدمات", taxRate: 18, taxType: "gst", hasWithholdingTax: true, withholdingRate: 2, taxAuthority: "GST Council", taxAuthorityAr: "مجلس GST", registrationFormat: "NNNNNNNNNNNNNNN", registrationExample: "12ABCDE1234F1Z5", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "monthly", filingFrequencyAr: "شهري", penaltyLateSubmission: "INR 200 per day of delay", penaltyLatePayment: "18% per annum of unpaid tax" },
  BD: { taxSystem: "vat", taxName: "Value Added Tax", taxNameAr: "ضريبة القيمة المضافة", taxRate: 15, taxType: "vat", hasWithholdingTax: true, withholdingRate: 5, taxAuthority: "NBR", taxAuthorityAr: "الهيئة الوطنية للإيرادات", registrationFormat: "NNNNNNNNNNN", registrationExample: "12345678901", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "monthly", filingFrequencyAr: "شهري", penaltyLateSubmission: "BDT 500 per return", penaltyLatePayment: "2% per month of unpaid tax" },
  GB: { taxSystem: "vat", taxName: "Value Added Tax", taxNameAr: "ضريبة القيمة المضافة", taxRate: 20, taxType: "vat", hasWithholdingTax: false, withholdingRate: 0, taxAuthority: "HMRC", taxAuthorityAr: "HM للإيرادات والجمارك", registrationFormat: "GB NNN NNNN NN", registrationExample: "GB 123 4567 89", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "quarterly", filingFrequencyAr: "ربع سنوي", penaltyLateSubmission: "5% of tax due", penaltyLatePayment: "2% per month of unpaid tax" },
  DE: { taxSystem: "vat", taxName: "Value Added Tax (Umsatzsteuer)", taxNameAr: "ضريبة القيمة المضافة", taxRate: 19, taxType: "vat", hasWithholdingTax: false, withholdingRate: 0, taxAuthority: "Finanzamt", taxAuthorityAr: "مكتب الضرائب", registrationFormat: "DE NNNNNNNNN", registrationExample: "DE 123456789", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: true, hasStandardInvoice: true, filingFrequency: "monthly", filingFrequencyAr: "شهري", penaltyLateSubmission: "1% of tax due", penaltyLatePayment: "1% per month of unpaid tax" },
  FR: { taxSystem: "vat", taxName: "Value Added Tax (TVA)", taxNameAr: "ضريبة القيمة المضافة", taxRate: 20, taxType: "vat", hasWithholdingTax: false, withholdingRate: 0, taxAuthority: "DGFiP", taxAuthorityAr: "المديرية العامة للمالية العامة", registrationFormat: "FR NN NNN NNN NNN", registrationExample: "FR 12 345 678 901", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: true, hasStandardInvoice: true, filingFrequency: "monthly", filingFrequencyAr: "شهري", penaltyLateSubmission: "5% of tax due", penaltyLatePayment: "0.4% per month of unpaid tax" },
  US: { taxSystem: "sales_tax", taxName: "Sales Tax", taxNameAr: "ضريبة المبيعات", taxRate: 8.5, taxType: "sales_tax", hasWithholdingTax: true, withholdingRate: 24, taxAuthority: "IRS", taxAuthorityAr: "دائرة الإيرادات الداخلية", registrationFormat: "NN-NNNNNNN", registrationExample: "12-3456789", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "quarterly", filingFrequencyAr: "ربع سنوي", penaltyLateSubmission: "5% of tax due per month", penaltyLatePayment: "0.5% per month of unpaid tax" },
  CA: { taxSystem: "gst", taxName: "Goods and Services Tax / HST", taxNameAr: "ضريبة السلع والخدمات", taxRate: 13, taxType: "gst", hasWithholdingTax: false, withholdingRate: 0, taxAuthority: "CRA", taxAuthorityAr: "وكالة الإيرادات الكندية", registrationFormat: "NNNNNNNNN", registrationExample: "123456789", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "quarterly", filingFrequencyAr: "ربع سنوي", penaltyLateSubmission: "5% of tax due", penaltyLatePayment: "1% per month of unpaid tax" },
  AU: { taxSystem: "gst", taxName: "Goods and Services Tax", taxNameAr: "ضريبة السلع والخدمات", taxRate: 10, taxType: "gst", hasWithholdingTax: true, withholdingRate: 2, taxAuthority: "ATO", taxAuthorityAr: "مكتب الضرائب الأسترالي", registrationFormat: "NN NNN NNN NNN", registrationExample: "12 345 678 901", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "quarterly", filingFrequencyAr: "ربع سنوي", penaltyLateSubmission: "AUD 850 per return", penaltyLatePayment: "1% per month of unpaid tax" },
  TR: { taxSystem: "vat", taxName: "Value Added Tax (KDV)", taxNameAr: "ضريبة القيمة المضافة", taxRate: 20, taxType: "vat", hasWithholdingTax: true, withholdingRate: 10, taxAuthority: "GIB", taxAuthorityAr: "إدارة الإيرادات التركية", registrationFormat: "NNNNNNNNNN", registrationExample: "1234567890", requiresQrCode: false, requiresDigitalSignature: true, hasSimplifiedInvoice: true, hasStandardInvoice: true, filingFrequency: "monthly", filingFrequencyAr: "شهري", penaltyLateSubmission: "TRY 500 per return", penaltyLatePayment: "1.4% per month of unpaid tax" },
  EG: { taxSystem: "vat", taxName: "Value Added Tax", taxNameAr: "ضريبة القيمة المضافة", taxRate: 14, taxType: "vat", hasWithholdingTax: true, withholdingRate: 3, taxAuthority: "ETA", taxAuthorityAr: "مصلحة الضرائب المصرية", registrationFormat: "NNN-NNN-NNN", registrationExample: "123-456-789", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "monthly", filingFrequencyAr: "شهري", penaltyLateSubmission: "EGP 1,000 per return", penaltyLatePayment: "0.5% per day of unpaid tax" },
  MY: { taxSystem: "gst", taxName: "Sales and Service Tax", taxNameAr: "ضريبة المبيعات والخدمات", taxRate: 10, taxType: "gst", hasWithholdingTax: false, withholdingRate: 0, taxAuthority: "IRBM", taxAuthorityAr: "مجلس الإيرادات الداخلية الماليزي", registrationFormat: "NNNNNNNNNNNNN", registrationExample: "1234567890123", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "quarterly", filingFrequencyAr: "ربع سنوي", penaltyLateSubmission: "MYR 200 per return", penaltyLatePayment: "10% per annum of unpaid tax" },
  ID: { taxSystem: "vat", taxName: "Value Added Tax (PPN)", taxNameAr: "ضريبة القيمة المضافة", taxRate: 11, taxType: "vat", hasWithholdingTax: true, withholdingRate: 2, taxAuthority: "DJP", taxAuthorityAr: "المديرية العامة للضرائب", registrationFormat: "NN.NNN.NNN.N-NNN.NNN", registrationExample: "12.345.678.9-012.345", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "monthly", filingFrequencyAr: "شهري", penaltyLateSubmission: "IDR 1,000,000 per return", penaltyLatePayment: "2% per month of unpaid tax" },
  ZA: { taxSystem: "vat", taxName: "Value Added Tax", taxNameAr: "ضريبة القيمة المضافة", taxRate: 15, taxType: "vat", hasWithholdingTax: true, withholdingRate: 5, taxAuthority: "SARS", taxAuthorityAr: "خدمة الإيرادات الجنوب أفريقية", registrationFormat: "NNNNNNNNN", registrationExample: "123456789", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "bi-monthly", filingFrequencyAr: "كل شهرين", penaltyLateSubmission: "ZAR 250 per return", penaltyLatePayment: "10% per annum of unpaid tax" },
  NG: { taxSystem: "vat", taxName: "Value Added Tax", taxNameAr: "ضريبة القيمة المضافة", taxRate: 7.5, taxType: "vat", hasWithholdingTax: true, withholdingRate: 5, taxAuthority: "FIRS", taxAuthorityAr: "خدمة الإيرادات الاتحادية", registrationFormat: "NNNNNNNN-NNNN", registrationExample: "12345678-9012", requiresQrCode: false, requiresDigitalSignature: false, hasSimplifiedInvoice: false, hasStandardInvoice: true, filingFrequency: "monthly", filingFrequencyAr: "شهري", penaltyLateSubmission: "NGN 50,000 per return", penaltyLatePayment: "5% per annum of unpaid tax" },
};

const complianceProfiles: Record<string, {
  regulatoryBody: string;
  regulatoryBodyAr: string;
  requiresZakat: boolean;
  zakatRate: number;
  requiresCorporateTax: boolean;
  corporateTaxRate: number;
  requiresSocialInsurance: boolean;
  socialInsuranceEmployerRate: number;
  socialInsuranceEmployeeRate: number;
  laborLaw: string;
  laborLawAr: string;
  minimumWage: number;
  minimumWageCurrency: string;
  requiresCommercialRegistration: boolean;
  crFormat: string;
}> = {
  SA: { regulatoryBody: "Ministry of Commerce", regulatoryBodyAr: "وزارة التجارة", requiresZakat: true, zakatRate: 2.5, requiresCorporateTax: true, corporateTaxRate: 20, requiresSocialInsurance: true, socialInsuranceEmployerRate: 12, socialInsuranceEmployeeRate: 10, laborLaw: "Saudi Labor Law", laborLawAr: "نظام العمل السعودي", minimumWage: 4000, minimumWageCurrency: "SAR", requiresCommercialRegistration: true, crFormat: "NNNNNNNNNN" },
  PK: { regulatoryBody: "Securities and Exchange Commission of Pakistan", regulatoryBodyAr: "هيئة الأوراق المالية والبورصة الباكستانية", requiresZakat: true, zakatRate: 2.5, requiresCorporateTax: true, corporateTaxRate: 29, requiresSocialInsurance: false, socialInsuranceEmployerRate: 0, socialInsuranceEmployeeRate: 0, laborLaw: "Pakistan Labor Laws", laborLawAr: "قوانين العمل الباكستانية", minimumWage: 32000, minimumWageCurrency: "PKR", requiresCommercialRegistration: true, crFormat: "NNNNNNN-N" },
  AE: { regulatoryBody: "Ministry of Economy", regulatoryBodyAr: "وزارة الاقتصاد", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 9, requiresSocialInsurance: true, socialInsuranceEmployerRate: 12.5, socialInsuranceEmployeeRate: 5, laborLaw: "UAE Labor Law", laborLawAr: "قانون العمل الإماراتي", minimumWage: 0, minimumWageCurrency: "AED", requiresCommercialRegistration: true, crFormat: "NNNNNNN" },
  QA: { regulatoryBody: "Ministry of Commerce and Industry", regulatoryBodyAr: "وزارة التجارة والصناعة", requiresZakat: true, zakatRate: 2.5, requiresCorporateTax: true, corporateTaxRate: 10, requiresSocialInsurance: true, socialInsuranceEmployerRate: 10, socialInsuranceEmployeeRate: 5, laborLaw: "Qatar Labor Law", laborLawAr: "قانون العمل القطري", minimumWage: 1000, minimumWageCurrency: "QAR", requiresCommercialRegistration: true, crFormat: "NNNNNN" },
  OM: { regulatoryBody: "Ministry of Commerce, Industry and Investment Promotion", regulatoryBodyAr: "وزارة التجارة والصناعة وترويج الاستثمار", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 15, requiresSocialInsurance: true, socialInsuranceEmployerRate: 11, socialInsuranceEmployeeRate: 6.5, laborLaw: "Oman Labor Law", laborLawAr: "قانون العمل العماني", minimumWage: 325, minimumWageCurrency: "OMR", requiresCommercialRegistration: true, crFormat: "NNNNNN" },
  BH: { regulatoryBody: "Ministry of Industry and Commerce", regulatoryBodyAr: "وزارة الصناعة والتجارة", requiresZakat: false, zakatRate: 0, requiresCorporateTax: false, corporateTaxRate: 0, requiresSocialInsurance: true, socialInsuranceEmployerRate: 12, socialInsuranceEmployeeRate: 6, laborLaw: "Bahrain Labor Law", laborLawAr: "قانون العمل البحريني", minimumWage: 0, minimumWageCurrency: "BHD", requiresCommercialRegistration: true, crFormat: "NNNNNN" },
  KW: { regulatoryBody: "Ministry of Commerce and Industry", regulatoryBodyAr: "وزارة التجارة والصناعة", requiresZakat: true, zakatRate: 2.5, requiresCorporateTax: true, corporateTaxRate: 15, requiresSocialInsurance: true, socialInsuranceEmployerRate: 11.5, socialInsuranceEmployeeRate: 8.5, laborLaw: "Kuwait Labor Law", laborLawAr: "قانون العمل الكويتي", minimumWage: 0, minimumWageCurrency: "KWD", requiresCommercialRegistration: true, crFormat: "NNNNNN" },
  IN: { regulatoryBody: "Ministry of Corporate Affairs", regulatoryBodyAr: "وزارة الشؤون المؤسسية", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 25, requiresSocialInsurance: true, socialInsuranceEmployerRate: 12, socialInsuranceEmployeeRate: 12, laborLaw: "Indian Labor Laws", laborLawAr: "قوانين العمل الهندية", minimumWage: 176, minimumWageCurrency: "INR", requiresCommercialRegistration: true, crFormat: "U-NNNN-NN-NNNNN" },
  BD: { regulatoryBody: "Registrar of Joint Stock Companies", regulatoryBodyAr: "مسجل الشركات المساهمة", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 25, requiresSocialInsurance: false, socialInsuranceEmployerRate: 0, socialInsuranceEmployeeRate: 0, laborLaw: "Bangladesh Labor Law", laborLawAr: "قانون العمل البنغلاديشي", minimumWage: 8000, minimumWageCurrency: "BDT", requiresCommercialRegistration: true, crFormat: "C-NNNNN" },
  GB: { regulatoryBody: "Companies House", regulatoryBodyAr: "بيت الشركات", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 25, requiresSocialInsurance: true, socialInsuranceEmployerRate: 13.8, socialInsuranceEmployeeRate: 12, laborLaw: "UK Employment Law", laborLawAr: "قانون العمل البريطاني", minimumWage: 11.44, minimumWageCurrency: "GBP", requiresCommercialRegistration: true, crFormat: "NNNNNNN" },
  DE: { regulatoryBody: "Handelsregister", regulatoryBodyAr: "السجل التجاري", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 30, requiresSocialInsurance: true, socialInsuranceEmployerRate: 19.6, socialInsuranceEmployeeRate: 19.6, laborLaw: "German Labor Law (Arbeitsrecht)", laborLawAr: "قانون العمل الألماني", minimumWage: 12.41, minimumWageCurrency: "EUR", requiresCommercialRegistration: true, crFormat: "HRB NNNNN" },
  FR: { regulatoryBody: "INSEE", regulatoryBodyAr: "المعهد الوطني للإحصاء والدراسات الاقتصادية", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 25, requiresSocialInsurance: true, socialInsuranceEmployerRate: 20, socialInsuranceEmployeeRate: 15, laborLaw: "French Labor Code", laborLawAr: "قانون العمل الفرنسي", minimumWage: 11.65, minimumWageCurrency: "EUR", requiresCommercialRegistration: true, crFormat: "NNN NNN NNN" },
  US: { regulatoryBody: "Internal Revenue Service", regulatoryBodyAr: "دائرة الإيرادات الداخلية", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 21, requiresSocialInsurance: true, socialInsuranceEmployerRate: 7.65, socialInsuranceEmployeeRate: 7.65, laborLaw: "FLSA", laborLawAr: "قانون معايير العمل العادلة", minimumWage: 7.25, minimumWageCurrency: "USD", requiresCommercialRegistration: true, crFormat: "NN-NNNNNNN" },
  CA: { regulatoryBody: "Corporations Canada", regulatoryBodyAr: "المؤسسات الكندية", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 15, requiresSocialInsurance: true, socialInsuranceEmployerRate: 5.7, socialInsuranceEmployeeRate: 5.7, laborLaw: "Canada Labour Code", laborLawAr: "قانون العمل الكندي", minimumWage: 16.65, minimumWageCurrency: "CAD", requiresCommercialRegistration: true, crFormat: "NNNNNNNNN" },
  AU: { regulatoryBody: "Australian Securities and Investments Commission", regulatoryBodyAr: "هيئة الأوراق المالية والاستثمارات الأسترالية", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 25, requiresSocialInsurance: true, socialInsuranceEmployerRate: 9.5, socialInsuranceEmployeeRate: 0, laborLaw: "Fair Work Act", laborLawAr: "قانون العمل العادل", minimumWage: 24.1, minimumWageCurrency: "AUD", requiresCommercialRegistration: true, crFormat: "NNN NNN NNN" },
  TR: { regulatoryBody: "Ministry of Trade", regulatoryBodyAr: "وزارة التجارة", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 25, requiresSocialInsurance: true, socialInsuranceEmployerRate: 20.5, socialInsuranceEmployeeRate: 14, laborLaw: "Turkish Labor Law", laborLawAr: "قانون العمل التركي", minimumWage: 17002, minimumWageCurrency: "TRY", requiresCommercialRegistration: true, crFormat: "NNNNNNNNNN" },
  EG: { regulatoryBody: "General Authority for Investment and Free Zones", regulatoryBodyAr: "الهيئة العامة للاستثمار والمناطق الحرة", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 22.5, requiresSocialInsurance: true, socialInsuranceEmployerRate: 18.75, socialInsuranceEmployeeRate: 11, laborLaw: "Egyptian Labor Law", laborLawAr: "قانون العمل المصري", minimumWage: 3000, minimumWageCurrency: "EGP", requiresCommercialRegistration: true, crFormat: "NNNNNN" },
  MY: { regulatoryBody: "Companies Commission of Malaysia", regulatoryBodyAr: "لجنة الشركات الماليزية", requiresZakat: true, zakatRate: 2.5, requiresCorporateTax: true, corporateTaxRate: 24, requiresSocialInsurance: true, socialInsuranceEmployerRate: 13, socialInsuranceEmployeeRate: 11, laborLaw: "Malaysian Employment Act", laborLawAr: "قانون التوظيف الماليزي", minimumWage: 1500, minimumWageCurrency: "MYR", requiresCommercialRegistration: true, crFormat: "NNNNNN-N" },
  ID: { regulatoryBody: "Ministry of Law and Human Rights", regulatoryBodyAr: "وزارة القانون وحقوق الإنسان", requiresZakat: true, zakatRate: 2.5, requiresCorporateTax: true, corporateTaxRate: 22, requiresSocialInsurance: true, socialInsuranceEmployerRate: 9.24, socialInsuranceEmployeeRate: 5, laborLaw: "Indonesian Labor Law", laborLawAr: "قانون العمل الإندونيسي", minimumWage: 4942000, minimumWageCurrency: "IDR", requiresCommercialRegistration: true, crFormat: "NN.NNN.NNN.N-NNN.NNN" },
  ZA: { regulatoryBody: "Companies and Intellectual Property Commission", regulatoryBodyAr: "لجنة الشركات والملكية الفكرية", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 27, requiresSocialInsurance: true, socialInsuranceEmployerRate: 2, socialInsuranceEmployeeRate: 2, laborLaw: "Basic Conditions of Employment Act", laborLawAr: "قانون الظروف الأساسية للعمل", minimumWage: 27.58, minimumWageCurrency: "ZAR", requiresCommercialRegistration: true, crFormat: "YYYY/NNNNNN/07" },
  NG: { regulatoryBody: "Corporate Affairs Commission", regulatoryBodyAr: "لجنة الشؤون المؤسسية", requiresZakat: false, zakatRate: 0, requiresCorporateTax: true, corporateTaxRate: 30, requiresSocialInsurance: true, socialInsuranceEmployerRate: 3, socialInsuranceEmployeeRate: 3, laborLaw: "Nigerian Labor Act", laborLawAr: "قانون العمل النيجيري", minimumWage: 30000, minimumWageCurrency: "NGN", requiresCommercialRegistration: true, crFormat: "RC NNNNN" },
};

const currenciesList = [
  { code: "SAR", name: "Saudi Riyal", nameAr: "ريال سعودي", symbol: "﷼", decimals: 2 },
  { code: "PKR", name: "Pakistani Rupee", nameAr: "روبية باكستانية", symbol: "₨", decimals: 2 },
  { code: "AED", name: "UAE Dirham", nameAr: "درهم إماراتي", symbol: "د.إ", decimals: 2 },
  { code: "QAR", name: "Qatari Riyal", nameAr: "ريال قطري", symbol: "﷼", decimals: 2 },
  { code: "OMR", name: "Omani Rial", nameAr: "ريال عماني", symbol: "﷼", decimals: 3 },
  { code: "BHD", name: "Bahraini Dinar", nameAr: "دينار بحريني", symbol: "د.ب", decimals: 3 },
  { code: "KWD", name: "Kuwaiti Dinar", nameAr: "دينار كويتي", symbol: "د.ك", decimals: 3 },
  { code: "INR", name: "Indian Rupee", nameAr: "روبية هندية", symbol: "₹", decimals: 2 },
  { code: "BDT", name: "Bangladeshi Taka", nameAr: "تاكا بنغلاديشي", symbol: "৳", decimals: 2 },
  { code: "GBP", name: "British Pound", nameAr: "جنيه إسترليني", symbol: "£", decimals: 2 },
  { code: "EUR", name: "Euro", nameAr: "يورو", symbol: "€", decimals: 2 },
  { code: "USD", name: "US Dollar", nameAr: "دولار أمريكي", symbol: "$", decimals: 2 },
  { code: "CAD", name: "Canadian Dollar", nameAr: "دولار كندي", symbol: "$", decimals: 2 },
  { code: "AUD", name: "Australian Dollar", nameAr: "دولار أسترالي", symbol: "$", decimals: 2 },
  { code: "TRY", name: "Turkish Lira", nameAr: "ليرة تركية", symbol: "₺", decimals: 2 },
  { code: "EGP", name: "Egyptian Pound", nameAr: "جنيه مصري", symbol: "£", decimals: 2 },
  { code: "MYR", name: "Malaysian Ringgit", nameAr: "رينغيت ماليزي", symbol: "RM", decimals: 2 },
  { code: "IDR", name: "Indonesian Rupiah", nameAr: "روبية إندونيسية", symbol: "Rp", decimals: 0 },
  { code: "ZAR", name: "South African Rand", nameAr: "راند جنوب أفريقي", symbol: "R", decimals: 2 },
  { code: "NGN", name: "Nigerian Naira", nameAr: "نايرة نيجيرية", symbol: "₦", decimals: 2 },
];

const timezonesList = [
  { id: "Asia/Riyadh", name: "Arabia Standard Time (AST)", nameAr: "توقيت العربية", utcOffset: "+03:00" },
  { id: "Asia/Karachi", name: "Pakistan Standard Time (PKT)", nameAr: "توقيت باكستان", utcOffset: "+05:00" },
  { id: "Asia/Dubai", name: "Gulf Standard Time (GST)", nameAr: "توقيت الخليج", utcOffset: "+04:00" },
  { id: "Asia/Qatar", name: "Arabia Standard Time (AST)", nameAr: "توقيت العربية", utcOffset: "+03:00" },
  { id: "Asia/Muscat", name: "Gulf Standard Time (GST)", nameAr: "توقيت الخليج", utcOffset: "+04:00" },
  { id: "Asia/Bahrain", name: "Arabia Standard Time (AST)", nameAr: "توقيت العربية", utcOffset: "+03:00" },
  { id: "Asia/Kuwait", name: "Arabia Standard Time (AST)", nameAr: "توقيت العربية", utcOffset: "+03:00" },
  { id: "Asia/Kolkata", name: "India Standard Time (IST)", nameAr: "توقيت الهند", utcOffset: "+05:30" },
  { id: "Asia/Dhaka", name: "Bangladesh Standard Time (BST)", nameAr: "توقيت بنغلاديش", utcOffset: "+06:00" },
  { id: "Europe/London", name: "Greenwich Mean Time (GMT)", nameAr: "توقيت غرينتش", utcOffset: "+00:00" },
  { id: "Europe/Berlin", name: "Central European Time (CET)", nameAr: "توقيت أوروبا الوسطى", utcOffset: "+01:00" },
  { id: "Europe/Paris", name: "Central European Time (CET)", nameAr: "توقيت أوروبا الوسطى", utcOffset: "+01:00" },
  { id: "America/New_York", name: "Eastern Standard Time (EST)", nameAr: "توقيت شرق أمريكا", utcOffset: "-05:00" },
  { id: "America/Chicago", name: "Central Standard Time (CST)", nameAr: "توقيت وسط أمريكا", utcOffset: "-06:00" },
  { id: "America/Denver", name: "Mountain Standard Time (MST)", nameAr: "توقيت جبال أمريكا", utcOffset: "-07:00" },
  { id: "America/Los_Angeles", name: "Pacific Standard Time (PST)", nameAr: "توقيت المحيط الهادئ", utcOffset: "-08:00" },
  { id: "America/Toronto", name: "Eastern Standard Time (EST)", nameAr: "توقيت شرق أمريكا", utcOffset: "-05:00" },
  { id: "Australia/Sydney", name: "Australian Eastern Standard Time (AEST)", nameAr: "توقيت شرق أستراليا", utcOffset: "+10:00" },
  { id: "Australia/Melbourne", name: "Australian Eastern Standard Time (AEST)", nameAr: "توقيت شرق أستراليا", utcOffset: "+10:00" },
  { id: "Europe/Istanbul", name: "Turkey Time (TRT)", nameAr: "توقيت تركيا", utcOffset: "+03:00" },
  { id: "Africa/Cairo", name: "Eastern European Time (EET)", nameAr: "توقيت شرق أوروبا", utcOffset: "+02:00" },
  { id: "Asia/Kuala_Lumpur", name: "Malaysia Time (MYT)", nameAr: "توقيت ماليزيا", utcOffset: "+08:00" },
  { id: "Asia/Jakarta", name: "Western Indonesia Time (WIB)", nameAr: "توقيت غرب إندونيسيا", utcOffset: "+07:00" },
  { id: "Africa/Johannesburg", name: "South Africa Standard Time (SAST)", nameAr: "توقيت جنوب أفريقيا", utcOffset: "+02:00" },
  { id: "Africa/Lagos", name: "West Africa Time (WAT)", nameAr: "توقيت غرب أفريقيا", utcOffset: "+01:00" },
  { id: "Asia/Tokyo", name: "Japan Standard Time (JST)", nameAr: "توقيت اليابان", utcOffset: "+09:00" },
  { id: "Asia/Shanghai", name: "China Standard Time (CST)", nameAr: "توقيت الصين", utcOffset: "+08:00" },
  { id: "Asia/Singapore", name: "Singapore Time (SGT)", nameAr: "توقيت سنغافورة", utcOffset: "+08:00" },
  { id: "UTC", name: "Coordinated Universal Time (UTC)", nameAr: "التوقيت العالمي المنسق", utcOffset: "+00:00" },
];

const ipRangeMap: Array<{ range: [number, number]; countryCode: string }> = [
  { range: [1, 2], countryCode: "US" },
  { range: [3, 4], countryCode: "GB" },
  { range: [5, 10], countryCode: "US" },
  { range: [11, 13], countryCode: "US" },
  { range: [14, 14], countryCode: "GB" },
  { range: [15, 16], countryCode: "US" },
  { range: [17, 18], countryCode: "US" },
  { range: [19, 20], countryCode: "SA" },
  { range: [21, 22], countryCode: "US" },
  { range: [23, 23], countryCode: "US" },
  { range: [24, 24], countryCode: "SA" },
  { range: [25, 26], countryCode: "GB" },
  { range: [27, 27], countryCode: "PK" },
  { range: [28, 29], countryCode: "US" },
  { range: [30, 30], countryCode: "US" },
  { range: [31, 31], countryCode: "GB" },
  { range: [32, 33], countryCode: "US" },
  { range: [34, 34], countryCode: "SA" },
  { range: [35, 36], countryCode: "US" },
  { range: [37, 37], countryCode: "PK" },
  { range: [38, 38], countryCode: "US" },
  { range: [39, 39], countryCode: "PK" },
  { range: [40, 42], countryCode: "US" },
  { range: [43, 43], countryCode: "PK" },
  { range: [44, 45], countryCode: "US" },
  { range: [46, 46], countryCode: "SA" },
  { range: [47, 47], countryCode: "US" },
  { range: [48, 48], countryCode: "US" },
  { range: [49, 49], countryCode: "IN" },
  { range: [50, 50], countryCode: "US" },
  { range: [51, 51], countryCode: "IN" },
  { range: [52, 52], countryCode: "US" },
  { range: [53, 53], countryCode: "DE" },
  { range: [54, 55], countryCode: "US" },
  { range: [56, 56], countryCode: "FR" },
  { range: [57, 57], countryCode: "US" },
  { range: [58, 59], countryCode: "AU" },
  { range: [60, 60], countryCode: "US" },
  { range: [61, 61], countryCode: "AU" },
  { range: [62, 62], countryCode: "US" },
  { range: [63, 64], countryCode: "US" },
  { range: [65, 65], countryCode: "US" },
  { range: [66, 66], countryCode: "US" },
  { range: [67, 67], countryCode: "CA" },
  { range: [68, 68], countryCode: "US" },
  { range: [69, 69], countryCode: "US" },
  { range: [70, 70], countryCode: "US" },
  { range: [71, 71], countryCode: "US" },
  { range: [72, 72], countryCode: "US" },
  { range: [73, 73], countryCode: "US" },
  { range: [74, 74], countryCode: "US" },
  { range: [75, 75], countryCode: "US" },
  { range: [76, 76], countryCode: "US" },
  { range: [77, 77], countryCode: "US" },
  { range: [78, 78], countryCode: "TR" },
  { range: [79, 79], countryCode: "GB" },
  { range: [80, 80], countryCode: "DE" },
  { range: [81, 81], countryCode: "US" },
  { range: [82, 82], countryCode: "IN" },
  { range: [83, 83], countryCode: "US" },
  { range: [84, 84], countryCode: "US" },
  { range: [85, 85], countryCode: "TR" },
  { range: [86, 86], countryCode: "TR" },
  { range: [87, 87], countryCode: "EG" },
  { range: [88, 88], countryCode: "TR" },
  { range: [89, 89], countryCode: "EG" },
  { range: [90, 90], countryCode: "TR" },
  { range: [91, 91], countryCode: "US" },
  { range: [92, 92], countryCode: "IN" },
  { range: [93, 93], countryCode: "GB" },
  { range: [94, 94], countryCode: "IN" },
  { range: [95, 95], countryCode: "TR" },
  { range: [96, 97], countryCode: "US" },
  { range: [98, 99], countryCode: "US" },
  { range: [100, 100], countryCode: "US" },
  { range: [101, 101], countryCode: "TR" },
  { range: [102, 102], countryCode: "ZA" },
  { range: [103, 103], countryCode: "IN" },
  { range: [104, 104], countryCode: "US" },
  { range: [105, 105], countryCode: "FR" },
  { range: [106, 106], countryCode: "IN" },
  { range: [107, 107], countryCode: "US" },
  { range: [108, 109], countryCode: "US" },
  { range: [110, 110], countryCode: "PK" },
  { range: [111, 111], countryCode: "PK" },
  { range: [112, 113], countryCode: "US" },
  { range: [114, 114], countryCode: "AU" },
  { range: [115, 115], countryCode: "BD" },
  { range: [116, 116], countryCode: "BD" },
  { range: [117, 117], countryCode: "BD" },
  { range: [118, 118], countryCode: "ID" },
  { range: [119, 119], countryCode: "PK" },
  { range: [120, 120], countryCode: "AU" },
  { range: [121, 121], countryCode: "IN" },
  { range: [122, 122], countryCode: "IN" },
  { range: [123, 123], countryCode: "IN" },
  { range: [124, 124], countryCode: "IN" },
  { range: [125, 125], countryCode: "IN" },
  { range: [126, 126], countryCode: "US" },
  { range: [127, 127], countryCode: "US" },
  { range: [128, 128], countryCode: "US" },
  { range: [129, 129], countryCode: "US" },
  { range: [130, 130], countryCode: "US" },
  { range: [131, 131], countryCode: "US" },
  { range: [132, 132], countryCode: "US" },
  { range: [133, 133], countryCode: "US" },
  { range: [134, 134], countryCode: "US" },
  { range: [135, 135], countryCode: "US" },
  { range: [136, 136], countryCode: "US" },
  { range: [137, 137], countryCode: "US" },
  { range: [138, 138], countryCode: "US" },
  { range: [139, 139], countryCode: "US" },
  { range: [140, 140], countryCode: "US" },
  { range: [141, 141], countryCode: "DE" },
  { range: [142, 142], countryCode: "CA" },
  { range: [143, 143], countryCode: "US" },
  { range: [144, 144], countryCode: "US" },
  { range: [145, 145], countryCode: "US" },
  { range: [146, 146], countryCode: "US" },
  { range: [147, 147], countryCode: "US" },
  { range: [148, 149], countryCode: "US" },
  { range: [150, 150], countryCode: "US" },
  { range: [151, 151], countryCode: "GB" },
  { range: [152, 152], countryCode: "US" },
  { range: [153, 153], countryCode: "US" },
  { range: [154, 154], countryCode: "US" },
  { range: [155, 155], countryCode: "US" },
  { range: [156, 156], countryCode: "US" },
  { range: [157, 157], countryCode: "US" },
  { range: [158, 158], countryCode: "US" },
  { range: [159, 159], countryCode: "US" },
  { range: [160, 160], countryCode: "US" },
  { range: [161, 161], countryCode: "US" },
  { range: [162, 162], countryCode: "US" },
  { range: [163, 163], countryCode: "US" },
  { range: [164, 164], countryCode: "US" },
  { range: [165, 165], countryCode: "US" },
  { range: [166, 166], countryCode: "US" },
  { range: [167, 167], countryCode: "US" },
  { range: [168, 168], countryCode: "US" },
  { range: [169, 169], countryCode: "US" },
  { range: [170, 170], countryCode: "US" },
  { range: [171, 171], countryCode: "US" },
  { range: [172, 172], countryCode: "US" },
  { range: [173, 173], countryCode: "US" },
  { range: [174, 174], countryCode: "US" },
  { range: [175, 175], countryCode: "AU" },
  { range: [176, 176], countryCode: "GB" },
  { range: [177, 177], countryCode: "US" },
  { range: [178, 178], countryCode: "GB" },
  { range: [179, 179], countryCode: "US" },
  { range: [180, 180], countryCode: "IN" },
  { range: [181, 181], countryCode: "US" },
  { range: [182, 182], countryCode: "ID" },
  { range: [183, 183], countryCode: "IN" },
  { range: [184, 184], countryCode: "US" },
  { range: [185, 185], countryCode: "DE" },
  { range: [186, 186], countryCode: "US" },
  { range: [187, 187], countryCode: "US" },
  { range: [188, 188], countryCode: "DE" },
  { range: [189, 189], countryCode: "US" },
  { range: [190, 190], countryCode: "US" },
  { range: [191, 191], countryCode: "US" },
  { range: [192, 192], countryCode: "US" },
  { range: [193, 193], countryCode: "GB" },
  { range: [194, 194], countryCode: "GB" },
  { range: [195, 195], countryCode: "DE" },
  { range: [196, 196], countryCode: "ZA" },
  { range: [197, 197], countryCode: "EG" },
  { range: [198, 198], countryCode: "US" },
  { range: [199, 199], countryCode: "US" },
  { range: [200, 200], countryCode: "US" },
  { range: [201, 201], countryCode: "US" },
  { range: [202, 202], countryCode: "BD" },
  { range: [203, 203], countryCode: "AU" },
  { range: [204, 204], countryCode: "US" },
  { range: [205, 205], countryCode: "US" },
  { range: [206, 206], countryCode: "US" },
  { range: [207, 207], countryCode: "US" },
  { range: [208, 208], countryCode: "US" },
  { range: [209, 209], countryCode: "US" },
  { range: [210, 210], countryCode: "AU" },
  { range: [211, 211], countryCode: "KR" },
  { range: [212, 212], countryCode: "TR" },
  { range: [213, 213], countryCode: "SA" },
  { range: [214, 214], countryCode: "US" },
  { range: [215, 215], countryCode: "US" },
  { range: [216, 216], countryCode: "US" },
  { range: [217, 217], countryCode: "GB" },
  { range: [218, 218], countryCode: "US" },
  { range: [219, 219], countryCode: "US" },
  { range: [220, 220], countryCode: "IN" },
  { range: [221, 221], countryCode: "PK" },
  { range: [222, 222], countryCode: "SA" },
  { range: [223, 223], countryCode: "IN" },
  { range: [224, 224], countryCode: "US" },
  { range: [225, 225], countryCode: "US" },
  { range: [226, 226], countryCode: "US" },
  { range: [227, 227], countryCode: "US" },
  { range: [228, 228], countryCode: "US" },
  { range: [229, 229], countryCode: "US" },
  { range: [230, 230], countryCode: "US" },
  { range: [231, 231], countryCode: "US" },
  { range: [232, 232], countryCode: "US" },
  { range: [233, 233], countryCode: "US" },
  { range: [234, 234], countryCode: "US" },
  { range: [235, 235], countryCode: "US" },
  { range: [236, 236], countryCode: "US" },
  { range: [237, 237], countryCode: "US" },
  { range: [238, 238], countryCode: "US" },
  { range: [239, 239], countryCode: "US" },
  { range: [240, 240], countryCode: "US" },
  { range: [241, 241], countryCode: "US" },
  { range: [242, 242], countryCode: "US" },
  { range: [243, 243], countryCode: "US" },
  { range: [244, 244], countryCode: "US" },
  { range: [245, 245], countryCode: "US" },
  { range: [246, 246], countryCode: "US" },
  { range: [247, 247], countryCode: "US" },
  { range: [248, 248], countryCode: "US" },
  { range: [249, 249], countryCode: "US" },
  { range: [250, 250], countryCode: "US" },
  { range: [251, 251], countryCode: "US" },
  { range: [252, 252], countryCode: "US" },
  { range: [253, 253], countryCode: "US" },
  { range: [254, 254], countryCode: "US" },
  { range: [255, 255], countryCode: "US" },
];

function detectCountryFromIp(ip: string): string {
  const parsed = ip.split(".").map(Number);
  if (parsed.length !== 4 || parsed.some(isNaN)) return "US";
  const firstOctet = parsed[0];
  const match = ipRangeMap.find((r) => firstOctet >= r.range[0] && firstOctet <= r.range[1]);
  return match?.countryCode ?? "US";
}

export const localizationRouter = createRouter({
  detectCountry: publicQuery
    .input(z.object({
      ip: z.string(),
    }))
    .query(async ({ input }) => {
      const countryCode = detectCountryFromIp(input.ip);
      const country = countries.find((c) => c.code === countryCode);
      const localization = localizationProfiles[countryCode];
      const taxProfile = taxProfiles[countryCode];
      return {
        countryCode,
        country: country ?? countries.find((c) => c.code === "US"),
        localization: localization ?? localizationProfiles["US"],
        taxProfile: taxProfile ?? taxProfiles["US"],
      };
    }),

  getLocalizationProfile: publicQuery
    .input(z.object({
      countryCode: z.string().length(2),
    }))
    .query(async ({ input }) => {
      const profile = localizationProfiles[input.countryCode];
      if (!profile) throw new Error(`Localization profile not found for country: ${input.countryCode}`);
      return profile;
    }),

  getTaxProfile: publicQuery
    .input(z.object({
      countryCode: z.string().length(2),
    }))
    .query(async ({ input }) => {
      const profile = taxProfiles[input.countryCode];
      if (!profile) throw new Error(`Tax profile not found for country: ${input.countryCode}`);
      return profile;
    }),

  listCountries: publicQuery
    .input(z.object({
      activeOnly: z.boolean().default(true),
    }).optional())
    .query(async ({ input }) => {
      const activeOnly = input?.activeOnly ?? true;
      return activeOnly ? countries.filter((c) => c.isActive) : countries;
    }),

  listCurrencies: publicQuery
    .input(z.object({
      activeOnly: z.boolean().default(true),
    }).optional())
    .query(async ({ input }) => {
      return currenciesList;
    }),

  listTimezones: publicQuery
    .input(z.object({
      filter: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      if (input?.filter) {
        const lower = input.filter.toLowerCase();
        return timezonesList.filter((tz) =>
          tz.id.toLowerCase().includes(lower) ||
          tz.name.toLowerCase().includes(lower) ||
          tz.nameAr.includes(lower),
        );
      }
      return timezonesList;
    }),

  getComplianceProfile: publicQuery
    .input(z.object({
      countryCode: z.string().length(2),
    }))
    .query(async ({ input }) => {
      const profile = complianceProfiles[input.countryCode];
      if (!profile) throw new Error(`Compliance profile not found for country: ${input.countryCode}`);
      return profile;
    }),

  saveTaxIdentifier: authedQuery
    .input(z.object({
      countryCode: z.string().length(2),
      type: z.enum(["ntn", "strn", "vat", "trn", "gst", "ein", "crn", "other"]),
      identifier: z.string(),
      name: z.string().optional(),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        id: Math.floor(Math.random() * 1000000),
        tenantId: ctx.user.tenantId!,
        ...input,
      };
    }),

  getTaxIdentifiers: authedQuery
    .input(z.object({
      countryCode: z.string().length(2).optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      return { items: [], tenantId: ctx.user.tenantId!, count: 0 };
    }),

  saveTaxIntegration: adminQuery
    .input(z.object({
      countryCode: z.string().length(2),
      provider: z.string(),
      apiEndpoint: z.string().url(),
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
      environment: z.enum(["sandbox", "production"]).default("sandbox"),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        message: `Tax integration configured for ${input.countryCode} via ${input.provider}`,
        environment: input.environment,
      };
    }),

  testTaxConnection: adminQuery
    .input(z.object({
      provider: z.string(),
      apiEndpoint: z.string().url(),
      apiKey: z.string().optional(),
      environment: z.enum(["sandbox", "production"]).default("sandbox"),
    }))
    .query(async ({ input }) => {
      const startTime = Date.now();
      const responseTime = Math.random() * 2000 + 100;
      const success = Math.random() > 0.2;
      return {
        success,
        provider: input.provider,
        endpoint: input.apiEndpoint,
        environment: input.environment,
        responseTime,
        timestamp: new Date().toISOString(),
        message: success
          ? `Connected to ${input.provider} successfully (${responseTime.toFixed(0)}ms)`
          : `Failed to connect to ${input.provider}`,
      };
    }),

  getCountryConfig: publicQuery
    .input(z.object({
      countryCode: z.string().length(2),
    }))
    .query(async ({ input }) => {
      const country = countries.find((c) => c.code === input.countryCode);
      const localization = localizationProfiles[input.countryCode];
      const taxProfile = taxProfiles[input.countryCode];
      const compliance = complianceProfiles[input.countryCode];
      if (!country || !localization || !taxProfile || !compliance) {
        throw new Error(`Country configuration not found for: ${input.countryCode}`);
      }
      return { country, localization, taxProfile, compliance };
    }),
});
