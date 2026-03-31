import { Navbar } from './components/Navbar';
import { Background } from './components/Background';
import { Hero } from './sections/Hero';
import { WhoItsFor } from './sections/WhoItsFor';
import { SystemLayers } from './sections/SystemLayers';
import { HowItWorks } from './sections/HowItWorks';
import { Pricing } from './sections/Pricing';
import { DiagnosticOffer } from './sections/DiagnosticOffer';
import { FAQ } from './sections/FAQ';
import { FinalCTA } from './sections/FinalCTA';

function App() {
  return (
    <div className="relative min-h-screen w-full flex flex-col text-gray-100 font-sans selection:bg-ai-purple/30 bg-black">
      <Background />
      <Navbar />
      
      <div className="relative z-10 w-full flex flex-col pt-20">
        <Hero />
        <WhoItsFor />
        <SystemLayers />
        <HowItWorks />
        <Pricing />
        <DiagnosticOffer />
        <FAQ />
        <FinalCTA />
        
        <footer className="w-full border-t border-white/10 py-8 px-6 mt-12 bg-[#0a0a0b]/80 backdrop-blur-xl shrink-0">
          <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm font-medium">
            <p>&copy; 2026 Nexo Base. Webs y sistemas de captación para negocios.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
