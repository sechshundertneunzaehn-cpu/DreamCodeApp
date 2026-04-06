import React from 'react';
import { Language } from '../types';
import LegalPage from './LegalPage';

interface ForschungPageProps {
  language: Language;
  onClose: () => void;
  themeMode?: string;
}

const ForschungPage: React.FC<ForschungPageProps> = ({ language, onClose, themeMode }) => (
  <LegalPage
    language={language}
    onClose={onClose}
    themeMode={themeMode}
    title={language === Language.DE ? 'Forschung & Methodik' : 'Research & Methodology'}
  >
    <h2 className="text-xl font-bold mt-6 mb-2">
      {language === Language.DE ? 'Unsere wissenschaftliche Grundlage' : 'Our Scientific Foundation'}
    </h2>
    <p>
      {language === Language.DE
        ? 'DreamCode verbindet traditionelle Traumdeutung mit moderner KI-Technologie. Unsere Analysen basieren auf über 20 historischen und wissenschaftlichen Quellen.'
        : 'DreamCode combines traditional dream interpretation with modern AI technology. Our analyses are based on over 20 historical and scientific sources.'}
    </p>

    <h2 className="text-xl font-bold mt-6 mb-2">
      {language === Language.DE ? 'Datenquellen' : 'Data Sources'}
    </h2>
    <ul className="list-disc pl-6 space-y-2">
      <li>
        <strong>SDDb (Sleep and Dream Database)</strong> —{' '}
        {language === Language.DE
          ? 'Über 30.000 Traumprotokolle aus wissenschaftlichen Studien'
          : 'Over 30,000 dream reports from scientific studies'}
      </li>
      <li>
        <strong>DreamBank</strong> —{' '}
        {language === Language.DE
          ? 'Umfangreiche Sammlung kodierter Träume nach dem Hall-Van de Castle System'
          : 'Extensive collection of dreams coded using the Hall-Van de Castle system'}
      </li>
      <li>
        <strong>{language === Language.DE ? 'Historische Quellen' : 'Historical Sources'}</strong> —{' '}
        {language === Language.DE
          ? 'Ibn Sirin, Al-Nabulsi, Kirchenväter, tibetische und Zen-buddhistische Traditionen'
          : 'Ibn Sirin, Al-Nabulsi, Church Fathers, Tibetan and Zen Buddhist traditions'}
      </li>
    </ul>

    <h2 className="text-xl font-bold mt-6 mb-2">
      {language === Language.DE ? 'KI-Methodik' : 'AI Methodology'}
    </h2>
    <p>
      {language === Language.DE
        ? 'Unsere KI nutzt Embedding-basierte Ähnlichkeitssuche über eine Vektordatenbank, um relevante Muster in historischen Traumprotokollen zu finden. Die Deutung kombiniert diese Muster mit quellenspezifischem Expertenwissen.'
        : 'Our AI uses embedding-based similarity search across a vector database to find relevant patterns in historical dream reports. Interpretation combines these patterns with source-specific expert knowledge.'}
    </p>

    <h2 className="text-xl font-bold mt-6 mb-2">
      {language === Language.DE ? 'Hall-Van de Castle Kodierung' : 'Hall-Van de Castle Coding'}
    </h2>
    <p>
      {language === Language.DE
        ? 'Wir verwenden das international anerkannte Hall-Van de Castle Kodiersystem zur Kategorisierung von Trauminhalten nach Emotionen, Charakteren, Interaktionen und Umgebungen.'
        : 'We use the internationally recognized Hall-Van de Castle coding system to categorize dream content by emotions, characters, interactions, and settings.'}
    </p>

    <h2 className="text-xl font-bold mt-6 mb-2">
      {language === Language.DE ? 'Ethik & Transparenz' : 'Ethics & Transparency'}
    </h2>
    <p>
      {language === Language.DE
        ? 'Alle Deutungen werden klar als KI-generiert gekennzeichnet. Wir empfehlen ausdrücklich, bei psychischen Belastungen professionelle Hilfe aufzusuchen. DreamCode ersetzt keine Therapie.'
        : 'All interpretations are clearly marked as AI-generated. We strongly recommend seeking professional help for mental health concerns. DreamCode is not a substitute for therapy.'}
    </p>
  </LegalPage>
);

export default ForschungPage;
