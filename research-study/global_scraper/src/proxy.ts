import { HttpsProxyAgent } from 'https-proxy-agent';
import 'dotenv/config';

/**
 * Proxy config loaded from environment.
 *
 * .env keys:
 *   PROXY_URL          single proxy URL (used as fallback / default)
 *   PROXY_URL_US       US residential proxy  (IPRoyal / Bright Data)
 *   PROXY_URL_EU       EU residential proxy
 *   PROXY_URL_ASIA     Asian residential proxy
 *   PROXY_ENABLED      set to "false" to disable proxies entirely
 *
 * URL format:  http://user:pass@host:port
 *              socks5://user:pass@host:port
 */

type Region = 'US' | 'EU' | 'ASIA' | 'DEFAULT';

const COUNTRY_TO_REGION: Record<string, Region> = {
  US: 'US',
  CA: 'US',
  MX: 'US',
  GB: 'EU',
  DE: 'EU',
  FR: 'EU',
  IT: 'EU',
  ES: 'EU',
  NL: 'EU',
  SE: 'EU',
  NO: 'EU',
  DK: 'EU',
  FI: 'EU',
  PL: 'EU',
  AT: 'EU',
  CH: 'EU',
  BE: 'EU',
  PT: 'EU',
  TR: 'EU',
  IN: 'ASIA',
  JP: 'ASIA',
  CN: 'ASIA',
  KR: 'ASIA',
  AU: 'ASIA',
  NZ: 'ASIA',
  SG: 'ASIA',
  SA: 'ASIA',
  AE: 'ASIA',
  EG: 'ASIA',
  BR: 'DEFAULT',
  AR: 'DEFAULT',
};

function getRegionForCountry(countryCode: string): Region {
  return COUNTRY_TO_REGION[countryCode.toUpperCase()] ?? 'DEFAULT';
}

function getProxyUrl(region: Region): string | undefined {
  const enabled = process.env.PROXY_ENABLED !== 'false';
  if (!enabled) return undefined;

  switch (region) {
    case 'US':
      return process.env.PROXY_URL_US ?? process.env.PROXY_URL;
    case 'EU':
      return process.env.PROXY_URL_EU ?? process.env.PROXY_URL;
    case 'ASIA':
      return process.env.PROXY_URL_ASIA ?? process.env.PROXY_URL;
    default:
      return process.env.PROXY_URL;
  }
}

/**
 * Returns an https-proxy-agent for the given country code, or undefined
 * if no proxy is configured.
 */
export function getProxyAgent(countryCode: string): HttpsProxyAgent<string> | undefined {
  const region = getRegionForCountry(countryCode);
  const proxyUrl = getProxyUrl(region);

  if (!proxyUrl) return undefined;

  try {
    return new HttpsProxyAgent(proxyUrl);
  } catch (err) {
    console.warn(`[proxy] Invalid proxy URL for region ${region}: ${proxyUrl}`);
    return undefined;
  }
}

/**
 * Quick smoke-test: logs which proxies are configured.
 */
export function logProxyConfig(): void {
  const keys = ['PROXY_URL', 'PROXY_URL_US', 'PROXY_URL_EU', 'PROXY_URL_ASIA'] as const;
  for (const key of keys) {
    const val = process.env[key];
    if (val) {
      // mask credentials in log output
      const masked = val.replace(/:\/\/([^:]+:[^@]+)@/, '://***:***@');
      console.log(`[proxy] ${key}: ${masked}`);
    }
  }
  if (process.env.PROXY_ENABLED === 'false') {
    console.log('[proxy] Proxies DISABLED (PROXY_ENABLED=false)');
  }
}
