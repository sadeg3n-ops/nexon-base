import { Button } from './Button';
import logo from '../assets/nexo-base-logo.png';

export function Navbar() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/60 backdrop-blur-xl border-b border-white/[0.03]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('top')}>
          <img 
            src={logo} 
            alt="Nexo Base" 
            className="h-10 sm:h-12 md:h-[50px] lg:h-[60px] w-auto object-contain transition-transform hover:scale-105" 
          />
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-400/90 tracking-wide">
          <button onClick={() => scrollTo('sistema')} className="hover:text-white transition-colors">Sistema</button>
          <button onClick={() => scrollTo('metodo')} className="hover:text-white transition-colors">Cómo funciona</button>
          <button onClick={() => scrollTo('sistemas')} className="hover:text-white transition-colors">Servicios</button>
          <button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">FAQ</button>
        </nav>

        <Button onClick={() => scrollTo('diagnostico')} className="text-xs sm:text-sm px-4 py-2 sm:px-5 md:px-6 md:py-2.5 bg-[#0a0a0b]/80 text-white backdrop-blur-md border border-white/10 hover:border-ai-purple/50 shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.3)] font-medium whitespace-nowrap rounded-lg md:rounded-md">
          <span className="md:hidden">Diagnóstico</span>
          <span className="hidden md:inline">Solicitar diagnóstico gratuito</span>
        </Button>
      </div>
    </header>
  );
}
