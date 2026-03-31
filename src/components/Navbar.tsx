import { Button } from './Button';
import logo from '../assets/nexo-base-logo.png';

export function Navbar() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/60 backdrop-blur-xl border-b border-white/[0.03]">
      <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('top')}>
          <img 
            src={logo} 
            alt="Nexo Base" 
            className="h-12 md:h-[60px] w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" 
          />
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-400/90 tracking-wide">
          <button onClick={() => scrollTo('sistema')} className="hover:text-white transition-colors">Sistema</button>
          <button onClick={() => scrollTo('metodo')} className="hover:text-white transition-colors">Cómo funciona</button>
          <button onClick={() => scrollTo('precios')} className="hover:text-white transition-colors">Precios</button>
          <button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">FAQ</button>
        </nav>

        <Button onClick={() => scrollTo('diagnostico')} className="text-sm px-4 py-2 md:px-6 md:py-2.5 bg-white text-black hover:bg-gray-100/90 font-medium whitespace-nowrap">
          <span className="md:hidden">Diagnóstico</span>
          <span className="hidden md:inline">Solicitar diagnóstico gratuito</span>
        </Button>
      </div>
    </header>
  );
}
