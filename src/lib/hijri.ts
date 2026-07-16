import { initialize } from 'hijri-js';

const hijriInstance = initialize();

const monthNamesEn = [
  'Muharram',
  'Safar',
  "Rabi' al-awwal",
  "Rabi' al-thani",
  'Jumada al-awwal',
  'Jumada al-thani',
  'Rajab',
  "Sha'aban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

const monthNamesAr = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

const dayNamesEn = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
];

const dayNamesAr = [
  'الأحد', 'الإثنين', 'الثلاثاء',
  'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
];

export function toHijri(date: Date) {
  const hd = hijriInstance.gregorianToHijri(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    '/',
  );

  return {
    year: Number(hd.year),
    month: Number(hd.month),
    day: Number(hd.day),
    monthName: monthNamesEn[Number(hd.month) - 1] || '',
    monthNameAr: monthNamesAr[Number(hd.month) - 1] || '',
    formatted: `${Number(hd.day)} ${monthNamesEn[Number(hd.month) - 1]} ${Number(hd.year)}H`,
    formattedAr: `${Number(hd.day)} ${monthNamesAr[Number(hd.month) - 1]} ${Number(hd.year)}هـ`,
  };
}

export function toGregorian(hy: number, hm: number, hd: number): Date {
  const result = hijriInstance.hijriToGregorian(hy, hm, hd, '/');
  return result;
}

export function getCurrentHijri() {
  return toHijri(new Date());
}

export function formatHijri(date: Date, locale: 'en' | 'ar' = 'en'): string {
  const h = toHijri(date);
  if (locale === 'ar') {
    const dayName = dayNamesAr[date.getDay()];
    return `${dayName} ${h.formattedAr}`;
  }
  const dayName = dayNamesEn[date.getDay()];
  return `${dayName}, ${h.formatted}`;
}

export { monthNamesEn as hijriMonthNamesEn, monthNamesAr as hijriMonthNamesAr };
