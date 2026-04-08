import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SameDream from './components/SameDream';
import Traditions from './components/Traditions';
import Science from './components/Science';
import DreamAlerts from './components/DreamAlerts';
import VisionIdeas from './components/VisionIdeas';
import CostTransparency from './components/CostTransparency';
import CosmicDna from './components/CosmicDna';
import MoonSync from './components/MoonSync';
import ArabicDialects from './components/ArabicDialects';
import DreamGuard from './components/DreamGuard';
import Benefits from './components/Benefits';
import Testimonials from './components/Testimonials';
import Downloads from './components/Downloads';
import Cta from './components/Cta';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-dream-bg dark:text-white text-gray-900">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <SameDream />
        <Traditions />
        <Science />
        <DreamAlerts />
        <VisionIdeas />
        <CostTransparency />
        <CosmicDna />
        <MoonSync />
        <ArabicDialects />
        <DreamGuard />
        <Benefits />
        <Testimonials />
        <Downloads />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

export default App;
