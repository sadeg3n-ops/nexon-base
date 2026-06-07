import { Navbar } from './components/Navbar';
import { Background } from './components/Background';
import { Hero } from './sections/Hero';
import { WhoItsFor } from './sections/WhoItsFor';
import { SystemLayers } from './sections/SystemLayers';
import { HowItWorks } from './sections/HowItWorks';
import { Pricing } from './sections/Pricing';
import { FAQ } from './sections/FAQ';
import { DiagnosticOffer } from './sections/DiagnosticOffer';
import { CookieConsent } from './components/CookieConsent';
import { NeonConnector } from './components/NeonConnector';
import { useLanguage } from './lib/language';

function App() {
  const { copy } = useLanguage();

  return (
    <div className="relative min-h-screen w-full overflow-x-clip flex flex-col text-gray-100 font-sans selection:bg-ai-purple/30 bg-black">
      <Background />
      <Navbar />
      
      <div className="relative z-10 w-full overflow-x-clip flex flex-col pt-16 md:pt-20">
        <Hero />
        <NeonConnector direction="ltr" />
        <WhoItsFor />
        <NeonConnector direction="rtl" />
        <SystemLayers />
        <NeonConnector direction="ltr" />
        <HowItWorks />
        <NeonConnector direction="rtl" />
        <Pricing />
        <NeonConnector direction="ltr" />
        <FAQ />
        <NeonConnector direction="rtl" />
        <DiagnosticOffer />
        
        <footer className="mt-12 w-full shrink-0 border-t border-white/10 bg-[#0a0a0b]/80 px-6 py-8 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl space-y-3 text-center text-[0.82rem] font-medium text-white/36">
            <p>{copy.footer.copyright}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[0.8rem] tracking-[0.01em]">
              <a
                href={copy.legalLinks.notice.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-1 text-white/46 transition-colors hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                {copy.legalLinks.notice.label}
              </a>
              <a
                href={copy.legalLinks.privacy.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-1 text-white/46 transition-colors hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                {copy.legalLinks.privacy.label}
              </a>
              <a
                href={copy.legalLinks.cookies.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-1 text-white/46 transition-colors hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                {copy.legalLinks.cookies.label}
              </a>
              <a
                href={copy.legalLinks.terms.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-1 text-white/46 transition-colors hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                {copy.legalLinks.terms.label}
              </a>
            </div>
          </div>
        </footer>
      </div>

      <CookieConsent policyUrl={copy.legalLinks.cookies.href} />
    </div>
  );
}

export default App;
