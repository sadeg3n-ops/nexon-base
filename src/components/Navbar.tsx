import { Button } from './Button';
import logo from '../assets/nexo-base-logo.png';
import { useLanguage, type Language } from '../lib/language';

function LanguageSwitch({
  language,
  onChange,
  ariaLabel,
}: {
  language: Language;
  onChange: (language: Language) => void;
  ariaLabel: string;
}) {
  return (
    <div
      aria-label={ariaLabel}
      className="inline-flex w-[5.75rem] items-center rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.95)]"
      role="group"
    >
      {(['es', 'en'] as const).map((code) => {
        const active = language === code;

        return (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            aria-pressed={active}
            className={`w-1/2 rounded-full px-0 py-1.5 text-center text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-150 ${
              active
                ? 'bg-white text-black'
                : 'text-white/52 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60'
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

export function Navbar() {
  const { copy, language, setLanguage } = useLanguage();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/60 backdrop-blur-xl border-b border-white/[0.03]">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr] items-center gap-3 px-4 sm:px-6 md:h-20 md:grid-cols-[auto_1fr_auto]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('top')}>
          <img 
            src={logo} 
            alt="Nexo Base" 
            className="h-12 sm:h-14 md:h-[56px] lg:h-[64px] w-auto object-contain transition-transform hover:scale-105" 
          />
        </div>
        
        <nav className="hidden md:flex items-center justify-center gap-8 text-[13px] font-medium text-gray-400/90 tracking-wide">
          <button onClick={() => scrollTo('sistema')} className="hover:text-white transition-colors">{copy.nav.system}</button>
          <button onClick={() => scrollTo('metodo')} className="hover:text-white transition-colors">{copy.nav.howItWorks}</button>
          <button onClick={() => scrollTo('sistemas')} className="hover:text-white transition-colors">{copy.nav.services}</button>
          <button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">FAQ</button>
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3 md:min-w-[19rem] lg:min-w-[22rem]">
          <LanguageSwitch language={language} onChange={setLanguage} ariaLabel={copy.nav.languageAria} />
          <Button onClick={() => scrollTo('diagnostico')} className="justify-center text-xs sm:text-sm px-4 py-2 sm:px-5 md:w-[12.5rem] lg:w-[15.25rem] md:px-6 md:py-2.5 bg-[#0a0a0b]/80 text-white backdrop-blur-md border border-white/10 hover:border-ai-purple/50 shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.3)] font-medium whitespace-nowrap rounded-lg md:rounded-md">
            <span className="md:hidden">{copy.nav.mobileCta}</span>
            <span className="hidden md:inline">{copy.nav.desktopCta}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
