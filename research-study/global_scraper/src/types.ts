export interface Institution {
  name: string;
  url: string;
  country: string;
  type: 'university' | 'k12' | 'other';
}

export interface EmailResult {
  /** Full name or contact name (may be empty) */
  name: string;
  email: string;
  institution: string;
  country: string;
  /** Landing page of the institution */
  url: string;
  /** Exact sub-page where the email was found */
  source_url: string;
  scraped_at: string;
}

export interface JobData {
  institutionUrl: string;
  institutionName: string;
  country: string;
  attempt?: number;
}

export interface JobResult {
  emails: EmailResult[];
  contactPagesVisited: string[];
  status: 'ok' | 'no_email' | 'failed';
  error?: string;
}

export interface ScraperStats {
  total: number;
  done: number;
  failed: number;
  noEmail: number;
  emailsFound: number;
  byCountry: Record<string, number>;
  startedAt: number;
}
