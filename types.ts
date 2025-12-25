
export interface SocialLinksData {
  whatsapp: string;
  instagram: string;
  telegram: string;
  facebook: string;
}

export interface BusinessHour {
  label: string;
  time: string;
}

export interface PriceItem {
  id: string;
  label: string;
  value: string;
}

export interface WheelPrize {
  text: string;
  color: string;
  textColor: string;
}

export interface BusinessData {
  name: string;
  tagline: string;
  phone: string;
  website: string;
  email: string;
  address: string;
  socials: SocialLinksData;
  hours: BusinessHour[];
  prices?: PriceItem[];
  announcement?: string;
  logo?: string;
  locationLink?: string;
  cardUrl?: string;
  luckyWheelEnabled?: boolean;
  wheelPrizes?: WheelPrize[];
  lastUpdated?: number; // زمان آخرین آپدیت برای شکستن کش PWA
}
