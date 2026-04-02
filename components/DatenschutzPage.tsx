import React from 'react';
import { Language } from '../types';
import LegalPage from './LegalPage';

interface DatenschutzPageProps {
  language: Language;
  onClose: () => void;
  themeMode?: string;
}

const Datenschutz_DE = () => (
  <>
    <p><strong>Stand:</strong> April 2026</p>

    <h2 className="text-xl font-bold mt-6 mb-2">1. Verantwortlicher</h2>
    <p>Verantwortlich fuer die Datenverarbeitung ist Thalamus Innovation Technology. Kontaktdaten finden Sie im Impressum.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">2. Erhobene Daten</h2>
    <p>Bei der Nutzung der App werden folgende Daten verarbeitet:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li>Eingegebene Traumtexte (zur Analyse und Deutung)</li>
      <li>Nutzungsdaten (anonymisiert, zur Verbesserung der App)</li>
      <li>Geraeteinformationen (Sprache, Betriebssystem)</li>
      <li>Optional: E-Mail-Adresse bei Kontoerstellung</li>
    </ul>

    <h2 className="text-xl font-bold mt-6 mb-2">3. Zweck der Verarbeitung</h2>
    <ul className="list-disc pl-6 space-y-1">
      <li>Bereitstellung der KI-gestuetzten Traumdeutung</li>
      <li>Synchronisation des Traum-Journals</li>
      <li>Verbesserung der Deutungsqualitaet</li>
      <li>Wissenschaftliche Forschung (nur anonymisiert)</li>
    </ul>

    <h2 className="text-xl font-bold mt-6 mb-2">4. Speicherung</h2>
    <p>Traumdaten werden primaer lokal auf dem Geraet gespeichert (localStorage / IndexedDB). Bei aktivierter Cloud-Synchronisation erfolgt die Speicherung verschluesselt auf Servern in der EU (Supabase, Frankfurt).</p>

    <h2 className="text-xl font-bold mt-6 mb-2">5. KI-Verarbeitung</h2>
    <p>Traumtexte werden zur Analyse an Google Gemini (Google Cloud, EU-Region) uebermittelt. Die Uebermittlung erfolgt verschluesselt. Google speichert keine Nutzerdaten gemaess unserer API-Vereinbarung.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">6. Ihre Rechte</h2>
    <p>Gemaess DSGVO haben Sie das Recht auf:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li>Auskunft ueber Ihre gespeicherten Daten</li>
      <li>Berichtigung unrichtiger Daten</li>
      <li>Loeschung Ihrer Daten</li>
      <li>Datenportabilitaet (Export-Funktion in der App)</li>
      <li>Widerspruch gegen die Verarbeitung</li>
    </ul>

    <h2 className="text-xl font-bold mt-6 mb-2">7. Cookies</h2>
    <p>Die App verwendet keine Tracking-Cookies. Es werden ausschliesslich technisch notwendige lokale Speichermechanismen verwendet.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">8. Kontakt</h2>
    <p>Bei Fragen zum Datenschutz wenden Sie sich bitte an: datenschutz@thalamus-innovation.de</p>
  </>
);

const Datenschutz_EN = () => (
  <>
    <p><strong>Last updated:</strong> April 2026</p>

    <h2 className="text-xl font-bold mt-6 mb-2">1. Data Controller</h2>
    <p>The data controller is Thalamus Innovation Technology. Contact details can be found in the Imprint.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">2. Data Collected</h2>
    <ul className="list-disc pl-6 space-y-1">
      <li>Dream texts entered (for analysis and interpretation)</li>
      <li>Usage data (anonymized, for app improvement)</li>
      <li>Device information (language, operating system)</li>
      <li>Optional: email address for account creation</li>
    </ul>

    <h2 className="text-xl font-bold mt-6 mb-2">3. Purpose</h2>
    <ul className="list-disc pl-6 space-y-1">
      <li>AI-powered dream interpretation</li>
      <li>Dream journal synchronization</li>
      <li>Improving interpretation quality</li>
      <li>Scientific research (anonymized only)</li>
    </ul>

    <h2 className="text-xl font-bold mt-6 mb-2">4. Storage</h2>
    <p>Dream data is primarily stored locally on your device. Cloud sync uses encrypted EU servers (Supabase, Frankfurt).</p>

    <h2 className="text-xl font-bold mt-6 mb-2">5. AI Processing</h2>
    <p>Dream texts are sent encrypted to Google Gemini (EU region) for analysis. Google does not store user data per our API agreement.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">6. Your Rights (GDPR)</h2>
    <ul className="list-disc pl-6 space-y-1">
      <li>Access to your stored data</li>
      <li>Rectification of inaccurate data</li>
      <li>Erasure of your data</li>
      <li>Data portability (export function in the app)</li>
      <li>Right to object to processing</li>
    </ul>

    <h2 className="text-xl font-bold mt-6 mb-2">7. Contact</h2>
    <p>For privacy inquiries: datenschutz@thalamus-innovation.de</p>
  </>
);

const DatenschutzPage: React.FC<DatenschutzPageProps> = ({ language, onClose, themeMode }) => (
  <LegalPage
    language={language}
    onClose={onClose}
    themeMode={themeMode}
    title={language === Language.DE ? 'Datenschutzerklaerung' : 'Privacy Policy'}
  >
    {language === Language.DE ? <Datenschutz_DE /> : <Datenschutz_EN />}
  </LegalPage>
);

export default DatenschutzPage;
