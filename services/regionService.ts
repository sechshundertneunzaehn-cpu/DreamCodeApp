// Region Detection Service
// Erkennt die Region des Users fuer regionales Pricing

import { REGIONAL_PRICES, getRegionalPricing } from '../config/pricing';
import { apiUrl } from './apiConfig';

export type PricingRegion = 'SA' | 'EG' | 'TR' | 'RU' | 'DE' | 'DEFAULT';

export interface RegionInfo {
  region: PricingRegion;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  vipAvailable: boolean;
  royalPackageAvailable: boolean;
}

const REGION_CACHE_KEY = 'dreamcode_region';
const REGION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

// Laendergruppen
const GULF_COUNTRIES = ['SA', 'AE', 'KW', 'BH', 'QA', 'OM'];
const ARAB_LOW_COUNTRIES = ['EG', 'JO', 'MA', 'DZ', 'TN', 'IQ', 'LB', 'PS', 'LY', 'SY'];
const DACH_COUNTRIES = ['DE', 'AT', 'CH'];

// Browser-Locale -> Country-Code Mapping
const LOCALE_TO_COUNTRY: Record<string, string> = {
  'ar-sa': 'SA', 'ar-ae': 'AE', 'ar-kw': 'KW', 'ar-bh': 'BH', 'ar-qa': 'QA', 'ar-om': 'OM',
  'ar-eg': 'EG', 'ar-jo': 'JO', 'ar-ma': 'MA', 'ar-dz': 'DZ', 'ar-tn': 'TN', 'ar-iq': 'IQ',
  'ar-lb': 'LB', 'ar-ps': 'PS', 'ar-ly': 'LY', 'ar-sy': 'SY',
  'de-de': 'DE', 'de-at': 'AT', 'de-ch': 'CH',
  'tr-tr': 'TR', 'tr': 'TR',
  'ru-ru': 'RU', 'ru': 'RU',
  'zh': 'CN', 'zh-cn': 'CN', 'zh-tw': 'TW',
  'hi': 'IN', 'hi-in': 'IN',
  'ja': 'JP', 'ja-jp': 'JP',
  'ko': 'KR', 'ko-kr': 'KR',
  'id': 'ID', 'id-id': 'ID',
  'fa': 'IR', 'fa-ir': 'IR',
  'it': 'IT', 'it-it': 'IT',
  'pl': 'PL', 'pl-pl': 'PL',
  'bn': 'BD', 'bn-bd': 'BD',
  'ur': 'PK', 'ur-pk': 'PK',
  'vi': 'VN', 'vi-vn': 'VN',
  'th': 'TH', 'th-th': 'TH',
  'sw': 'KE', 'sw-ke': 'KE',
  'hu': 'HU', 'hu-hu': 'HU',
};

function countryToRegion(countryCode: string): PricingRegion {
  if (GULF_COUNTRIES.includes(countryCode)) return 'SA';
  if (ARAB_LOW_COUNTRIES.includes(countryCode)) return 'EG';
  if (DACH_COUNTRIES.includes(countryCode)) return 'DE';
  if (countryCode === 'TR') return 'TR';
  if (countryCode === 'RU') return 'RU';
  return 'DEFAULT';
}

function detectCountryFromLocale(): string | null {
  const locale = (navigator.language || '').toLowerCase();
  // Exakter Match (z.B. ar-sa)
  if (LOCALE_TO_COUNTRY[locale]) return LOCALE_TO_COUNTRY[locale];
  // Nur Sprache (z.B. ar -> Default-Land fuer Arabisch = SA)
  if (locale.startsWith('ar')) return 'SA';
  if (locale.startsWith('de')) return 'DE';
  if (locale.startsWith('tr')) return 'TR';
  if (locale.startsWith('ru')) return 'RU';
  return null;
}

function getCachedRegion(): { region: PricingRegion; countryCode: string } | null {
  try {
    const raw = localStorage.getItem(REGION_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > REGION_CACHE_TTL) return null;
    return { region: cached.region, countryCode: cached.countryCode };
  } catch {
    return null;
  }
}

function cacheRegion(region: PricingRegion, countryCode: string): void {
  try {
    localStorage.setItem(REGION_CACHE_KEY, JSON.stringify({
      region, countryCode, timestamp: Date.now(),
    }));
  } catch { /* localStorage voll */ }
}

export function detectRegion(): RegionInfo {
  // 1. Cache pruefen
  const cached = getCachedRegion();
  if (cached) {
    return buildRegionInfo(cached.region, cached.countryCode);
  }

  // 2. Browser-Locale
  const country = detectCountryFromLocale();
  const countryCode = country || 'US';
  const region = countryToRegion(countryCode);

  // Cache setzen
  cacheRegion(region, countryCode);

  return buildRegionInfo(region, countryCode);
}

// Async Version mit Server-seitigem Geo-Lookup
export async function detectRegionAsync(): Promise<RegionInfo> {
  // 1. Cache pruefen
  const cached = getCachedRegion();
  if (cached) return buildRegionInfo(cached.region, cached.countryCode);

  // 2. Server-Endpoint (Vercel x-vercel-ip-country)
  try {
    const res = await fetch(apiUrl('/api/detect-region');
    if (res.ok) {
      const data = await res.json();
      if (data.countryCode) {
        const region = countryToRegion(data.countryCode);
        cacheRegion(region, data.countryCode);
        return buildRegionInfo(region, data.countryCode);
      }
    }
  } catch { /* Netzwerkfehler, fallback */ }

  // 3. Fallback: Browser-Locale
  return detectRegion();
}

const REGION_LOCALES: Record<PricingRegion, string> = {
  DE: 'de-DE', SA: 'ar-SA', EG: 'ar-EG', TR: 'tr-TR', RU: 'ru-RU', DEFAULT: 'en-US',
};

function buildRegionInfo(region: PricingRegion, countryCode: string): RegionInfo {
  const pricing = getRegionalPricing(countryCode);
  return {
    region,
    countryCode,
    currency: pricing?.currency || 'USD',
    currencySymbol: pricing?.symbol || '$',
    locale: REGION_LOCALES[region] || 'en-US',
    vipAvailable: region === 'SA',
    royalPackageAvailable: GULF_COUNTRIES.includes(countryCode),
  };
}

export function getPricingForRegion(region: PricingRegion) {
  return getRegionalPricing(region);
}
