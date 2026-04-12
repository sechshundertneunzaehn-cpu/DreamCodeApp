import React from 'react';
import { Language } from '../types';
import LegalPage from './LegalPage';

interface AGBPageProps {
  language: Language;
  onClose: () => void;
  themeMode?: string;
}

const AGB_DE = () => (
  <>
    <p><strong>Stand:</strong> April 2026</p>

    <h2 className="text-xl font-bold mt-6 mb-2">1. Geltungsbereich</h2>
    <p>Diese Allgemeinen Geschaeftsbedingungen gelten fuer die Nutzung der DreamCode App (nachfolgend "App"), bereitgestellt von AssetsUN LLC (nachfolgend "Anbieter").</p>

    <h2 className="text-xl font-bold mt-6 mb-2">2. Vertragsgegenstand</h2>
    <p>Die App bietet KI-gestuetzte Traumdeutung auf Basis historischer, religioser und psychologischer Quellen. Die Ergebnisse dienen ausschliesslich der Unterhaltung und Selbstreflexion und stellen keine medizinische, therapeutische oder religioese Beratung dar.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">3. Nutzung und Registrierung</h2>
    <p>Die Grundfunktionen der App sind ohne Registrierung nutzbar. Fuer erweiterte Funktionen (Community, Synchronisation) kann ein Nutzerkonto erforderlich sein. Der Nutzer ist fuer die Vertraulichkeit seiner Zugangsdaten verantwortlich.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">4. Virtuelle Waehrung (Coins)</h2>
    <p>Die App verwendet eine virtuelle Waehrung ("Coins") fuer Premium-Funktionen. Erworbene Coins sind nicht erstattungsfaehig, nicht uebertragbar und haben keinen realen Geldwert. Der Anbieter behaelt sich das Recht vor, Preise anzupassen.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">5. Geistiges Eigentum</h2>
    <p>Alle Inhalte, Designs und KI-Modelle der App sind urheberrechtlich geschuetzt. Vom Nutzer eingegebene Traeume verbleiben im Eigentum des Nutzers. Der Anbieter erhaelt ein eingeschraenktes Nutzungsrecht zur Verarbeitung und Analyse.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">6. Haftungsausschluss</h2>
    <p>Der Anbieter haftet nicht fuer die Richtigkeit, Vollstaendigkeit oder Eignung der KI-generierten Deutungen. Die Nutzung erfolgt auf eigene Verantwortung. Bei gesundheitlichen Beschwerden wenden Sie sich bitte an einen Facharzt.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">7. Aenderungen</h2>
    <p>Der Anbieter behaelt sich vor, diese AGB jederzeit zu aendern. Wesentliche Aenderungen werden in der App mitgeteilt.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">8. Anwendbares Recht</h2>
    <p>Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist der Sitz des Anbieters.</p>
  </>
);

const AGB_EN = () => (
  <>
    <p><strong>Last updated:</strong> April 2026</p>

    <h2 className="text-xl font-bold mt-6 mb-2">1. Scope</h2>
    <p>These Terms of Service apply to the use of the DreamCode App ("App"), provided by AssetsUN LLC ("Provider").</p>

    <h2 className="text-xl font-bold mt-6 mb-2">2. Subject Matter</h2>
    <p>The App offers AI-powered dream interpretation based on historical, religious, and psychological sources. Results are for entertainment and self-reflection only and do not constitute medical, therapeutic, or religious advice.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">3. Usage</h2>
    <p>Basic features are available without registration. Extended features may require an account. Users are responsible for keeping their credentials confidential.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">4. Virtual Currency (Coins)</h2>
    <p>The App uses virtual currency ("Coins") for premium features. Purchased Coins are non-refundable, non-transferable, and have no real monetary value.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">5. Intellectual Property</h2>
    <p>All content, designs, and AI models are copyrighted. User-submitted dreams remain the user's property. The Provider receives a limited license for processing and analysis.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">6. Disclaimer</h2>
    <p>The Provider is not liable for the accuracy or suitability of AI-generated interpretations. Use is at your own risk. For health concerns, please consult a medical professional.</p>

    <h2 className="text-xl font-bold mt-6 mb-2">7. Governing Law</h2>
    <p>German law applies. Place of jurisdiction is the Provider's registered office.</p>
  </>
);

const AGBPage: React.FC<AGBPageProps> = ({ language, onClose, themeMode }) => (
  <LegalPage
    language={language}
    onClose={onClose}
    themeMode={themeMode}
    title={language === Language.DE ? 'Allgemeine Geschaeftsbedingungen' : 'Terms of Service'}
  >
    {language === Language.DE ? <AGB_DE /> : <AGB_EN />}
  </LegalPage>
);

export default AGBPage;
