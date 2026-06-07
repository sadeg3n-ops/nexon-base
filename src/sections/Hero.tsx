import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight, Globe, BarChart2, Calendar, Zap, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../lib/language';

export function Hero() {
  const { copy } = useLanguage();
  const scrollToAudit = () => {
    document.getElementById('diagnostico')?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, bounce: 0.4, duration: 0.8 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, bounce: 0.4, duration: 0.8 } }
  };

  return (
    <section className="min-h-min lg:min-h-[calc(100dvh-5rem)] pt-8 md:pt-16 lg:pt-24 pb-16 flex flex-col justify-center px-6 md:px-12 lg:px-24">
      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Copy */}
        <motion.div 
          className="flex flex-col gap-8 items-start text-left"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ai-purple/10 border border-ai-purple/20 text-ai-purple text-sm font-semibold max-w-max">
            <span className="w-2 h-2 rounded-full bg-ai-purple animate-pulse"></span>
            {copy.hero.eyebrow}
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl lg:text-[4rem] font-bold text-white leading-[1.1] tracking-tight max-w-[14ch] lg:max-w-none">
            {copy.hero.title}<br/>
            <span className="text-gray-400">{copy.hero.highlight}</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl">
            {copy.hero.description}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Button onClick={scrollToAudit} className="px-5 py-3 sm:px-8 sm:py-4 bg-[#0a0a0b]/80 text-white backdrop-blur-xl border border-white/10 hover:border-ai-purple/50 shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)] flex items-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 w-auto max-w-full justify-center rounded-xl sm:rounded-md group">
              {copy.hero.cta}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 shrink-0 text-ai-purple" />
            </Button>
            <div className="flex flex-col gap-1.5 mt-2 sm:mt-0 items-start">
              <span className="text-sm font-medium text-gray-300 flex items-center gap-2"><CheckCircle2 size={16} className="text-ai-purple shrink-0" /> {copy.hero.supportPrimary}</span>
              <span className="text-sm font-medium text-gray-400 flex items-center gap-2"><CheckCircle2 size={16} className="text-ai-blue shrink-0" /> {copy.hero.supportSecondary}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Visual Component */}
        <div className="hidden lg:flex relative w-full h-[600px] items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-ai-purple/20 to-ai-blue/20 rounded-full blur-[80px] z-[-1]"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full max-w-md overflow-hidden bg-[#0a0a0b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 hidden md:block"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[4px] overflow-hidden rounded-l-2xl bg-gradient-to-b from-white/8 via-ai-purple/15 to-ai-blue/10" />
            <motion.div
              initial={{ scaleY: 0, opacity: 0.65 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 1.35, delay: 0.78, ease: [0.2, 0.9, 0.25, 1] }}
              className="pointer-events-none absolute inset-y-0 left-0 w-[4px] origin-top rounded-l-2xl bg-gradient-to-b from-ai-purple via-ai-purple to-ai-blue shadow-[0_0_22px_rgba(124,58,237,0.85)]"
            />
            <motion.div
              initial={{ top: '0%', opacity: 0 }}
              animate={{ top: '100%', opacity: [0, 1, 0] }}
              transition={{ duration: 1.3, delay: 0.78, ease: 'easeInOut' }}
              className="pointer-events-none absolute left-[-8px] h-20 w-7 -translate-y-1/2 rounded-full bg-ai-purple/50 blur-[16px]"
            />

            <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap size={16} className="text-ai-purple" /> {copy.hero.visualTitle}
            </div>

            <motion.div 
              className="flex flex-col gap-4"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.15, delayChildren: 0.8 } }
              }}
              initial="hidden"
              animate="show"
            >
              {[
                { icon: <Globe size={24} />, ...copy.hero.cards[0], color: "text-ai-purple", bg: "bg-ai-purple/10", left: "0" },
                { icon: <BarChart2 size={24} />, ...copy.hero.cards[1], color: "text-ai-blue", bg: "bg-ai-blue/10", left: "1rem" },
                { icon: <Calendar size={24} />, ...copy.hero.cards[2], color: "text-emerald-500", bg: "bg-emerald-500/10", left: "2rem" },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="M9 18l3-3-3-3"/></svg>, ...copy.hero.cards[3], color: "text-pink-500", bg: "bg-pink-500/10", left: "3rem" },
              ].map((layer, i) => (
                <motion.div 
                  key={i}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, x: parseInt(layer.left) - 5, backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.2)" }}
                  className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex items-start gap-4 transition-colors cursor-default relative origin-left"
                  style={{ left: layer.left }}
                >
                  <div className={`p-3 ${layer.bg} ${layer.color} rounded-lg shrink-0`}>{layer.icon}</div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{layer.title}</h3>
                    <p className="text-sm text-gray-400 leading-snug">{layer.copy}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-8 text-sm text-gray-500 text-center font-medium border-t border-white/5 pt-6"
            >
              {copy.hero.visualFooter}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
