// ─── Geo-Auto-Detect ──────────────────────────────────────────────────────────
// Erkennt die Nutzersprache basierend auf IP-Geolocation.
// Wird nur beim ERSTEN App-Start aufgerufen (kein Sprach-Setting in localStorage).

import { Language } from '../types';

const COUNTRY_LANG_MAP: Record<string, Language> = {
    // Arabische Dialekte
    SA: Language.AR_GULF, AE: Language.AR_GULF, QA: Language.AR_GULF,
    KW: Language.AR_GULF, BH: Language.AR_GULF, OM: Language.AR_GULF,
    EG: Language.AR_EG, SD: Language.AR_EG,
    SY: Language.AR_LEV, LB: Language.AR_LEV, JO: Language.AR_LEV, PS: Language.AR_LEV,
    MA: Language.AR_MAG, DZ: Language.AR_MAG, TN: Language.AR_MAG, LY: Language.AR_MAG,
    IQ: Language.AR_IQ,
    // Sonstige
    TR: Language.TR, ID: Language.ID, RU: Language.RU,
    JP: Language.JA, KR: Language.KO, CN: Language.ZH,
    DE: Language.DE, AT: Language.DE, CH: Language.DE,
    FR: Language.FR, ES: Language.ES, IT: Language.IT, PT: Language.PT,
    PL: Language.PL, HU: Language.HU, TH: Language.TH, VN: Language.VI,
    IN: Language.HI, BD: Language.BN, PK: Language.UR, IR: Language.FA,
    IL: Language.HE, NP: Language.NE, AF: Language.PRS,
    PH: Language.TL, LK: Language.TA,
    KE: Language.SW, TZ: Language.SW,
};

export async function detectLanguageByGeo(): Promise<Language | null> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) return null;
        const data = await res.json();
        const country = data.country_code as string;
        return COUNTRY_LANG_MAP[country] || null;
    } catch {
        return null;
    }
}
