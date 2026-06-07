import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../lib/language';

export function FinalCTA() {
  const { copy } = useLanguage();
  const scrollToAudit = () => {
    document.getElementById('diagnostico')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 mb-16 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-ai-purple/10 rounded-full blur-[120px] z-[0]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", bounce: 0.2, duration: 1 }}
        className="max-w-4xl mx-auto text-center relative z-10 p-12 md:p-16 rounded-3xl bg-[#0a0a0b]/40 border border-white/5 backdrop-blur-xl"
      >
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight"
        >
          {copy.finalCta.title}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {copy.finalCta.description}
        </motion.p>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button 
            onClick={scrollToAudit} 
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a0a0b]/80 text-white backdrop-blur-xl border border-white/10 hover:border-ai-purple/50 shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)] text-lg font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
          >
            {copy.finalCta.button}
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 text-ai-purple shrink-0" />
          </Button>
          <p className="mt-6 text-sm text-gray-500 font-medium">
            {copy.finalCta.note}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
