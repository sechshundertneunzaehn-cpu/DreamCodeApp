import React from 'react';
import { Language } from '../types';
import LegalPage from './LegalPage';

interface ImpressumPageProps {
  language: Language;
  onClose: () => void;
  themeMode?: string;
}

const ImpressumPage: React.FC<ImpressumPageProps> = ({ language, onClose, themeMode }) => (
  <LegalPage
    language={language}
    onClose={onClose}
    themeMode={themeMode}
    title={language === Language.DE ? 'Impressum' : 'Imprint'}
  >
    <h2 className="text-xl font-bold mt-6 mb-2">
      {language === Language.DE ? 'Angaben gemaess § 5 TMG' : 'Information pursuant to § 5 TMG'}
    </h2>

    <div className="space-y-1">
      <p className="font-bold">AssetsUN LLC</p>
      <p>[Strasse und Hausnummer]</p>
      <p>[PLZ Ort]</p>
      <p>Deutschland / Germany</p>
    </div>

    <h2 className="text-xl font-bold mt-6 mb-2">
      {language === Language.DE ? 'Kontakt' : 'Contact'}
    </h2>
    <div className="space-y-1">
      <p>E-Mail: info@thalamus-innovation.de</p>
    </div>

    <h2 className="text-xl font-bold mt-6 mb-2">
      {language === Language.DE ? 'Vertreten durch' : 'Represented by'}
    </h2>
    <p>[Geschaeftsfuehrer / Managing Director]</p>

    <h2 className="text-xl font-bold mt-6 mb-2">
      {language === Language.DE ? 'Haftungshinweis' : 'Liability Notice'}
    </h2>
    <p>
      {language === Language.DE
        ? 'Trotz sorgfaeltiger inhaltlicher Kontrolle uebernehmen wir keine Haftung fuer die Inhalte externer Links. Fuer den Inhalt der verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich.'
        : 'Despite careful content control, we assume no liability for the content of external links. The operators of the linked pages are solely responsible for their content.'}
    </p>

    <h2 className="text-xl font-bold mt-6 mb-2">
      {language === Language.DE ? 'Streitbeilegung' : 'Dispute Resolution'}
    </h2>
    <p>
      {language === Language.DE
        ? 'Die Europaeische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren teilzunehmen.'
        : 'The European Commission provides an online dispute resolution platform. We are not obligated nor willing to participate in dispute resolution proceedings.'}
    </p>
  </LegalPage>
);

export default ImpressumPage;
