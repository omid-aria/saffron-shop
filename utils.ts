export const toPersianDigits = (str: string | number): string => {
  if (str === null || str === undefined) return "";
  const s = str.toString();
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return s.replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

export const validators = {
  phone: (value: string) => {
    // Basic check for Iranian mobile numbers or just length
    const pattern = /^09\d{9}$/;
    return pattern.test(value) ? null : 'فرمت شماره تلفن صحیح نیست (مثال: 09123456789)';
  },
  
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) ? null : 'فرمت ایمیل صحیح نیست';
  },
  
  url: (value: string) => {
    if (!value) return null; // Optional
    try {
      // Try to construct URL. If user didn't add http, we assume they might mean it, but strict check:
      new URL(value.startsWith('http') ? value : `https://${value}`);
      return null;
    } catch {
      return 'آدرس وب‌سایت صحیح نیست';
    }
  }
};