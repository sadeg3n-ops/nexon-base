import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight, Globe, BarChart2, Calendar, Zap, CheckCircle2 } from 'lucide-react';

export function Hero() {
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
    <section className="pt-12 md:pt-16 lg:pt-20 pb-20 md:pb-28 lg:pb-32 flex flex-col px-6 md:px-12 lg:px-12 xl:px-24 overflow-visible">
      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-8 xl:gap-16 items-start lg:items-center">
        
        {/* Left Column: Copy */}
        <motion.div 
          className="flex flex-col gap-8 items-start text-left"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="section-kicker text-left text-ai-purple">
            Web y sistema de captación para negocios
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-5xl xl:text-[4rem] font-bold text-white leading-[1.1] tracking-tight max-w-[14ch] lg:max-w-none">
            Tu web debería captar.<br/>
            <span className="text-gray-400">Tu sistema debería evitar que se escapen oportunidades.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl">
            Empieza con una base clara para captar mejor hoy y ampliar después sin rehacerlo todo.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Button onClick={scrollToAudit} className="flex items-center gap-2 w-auto max-w-full justify-center group">
              Solicitar diagnóstico gratuito
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 shrink-0 group-hover:text-white" />
            </Button>
            <div className="flex flex-col gap-1.5 mt-4 sm:mt-0 items-start md:ml-4">
              <span className="text-[0.82rem] font-medium text-white/50 flex items-center gap-2"><CheckCircle2 size={14} className="text-ai-purple shrink-0 opacity-70" /> Respuesta en 24h</span>
              <span className="text-[0.82rem] font-medium text-white/50 flex items-center gap-2"><CheckCircle2 size={14} className="text-ai-purple shrink-0 opacity-70" /> Te diré por dónde empezaría</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 border-l-[3px] border-ai-purple pl-5 py-2 bg-gradient-to-r from-ai-purple/5 to-transparent rounded-r-md max-w-xl">
            <strong className="block text-white text-[0.95rem] mb-1.5">¿Tienes una empresa de reformas?</strong>
            <p className="text-[0.9rem] text-white/70 leading-relaxed mb-4">Descubre cómo planteamos la web de captación específicamente para tu sector y evita consultas poco cualificadas.</p>
            <a href="/web-de-captacion-empresas-reformas/" className="inline-flex items-center justify-center px-5 py-2.5 border border-white/20 hover:border-ai-purple bg-white/5 hover:bg-ai-purple hover:text-white text-white/90 text-sm font-semibold rounded-[4px] transition-colors">
              Nuestra solución para Reformas
            </a>
          </motion.div>
        </motion.div>

        {/* Right Column: Visual Component */}
        <div className="hidden lg:flex relative w-full h-auto py-8 lg:py-0 items-center justify-end xl:justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-ai-purple/20 to-ai-blue/20 rounded-full blur-[80px] z-[-1]"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full max-w-[20rem] xl:max-w-[23rem] bg-[#0a0a0b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative z-10 hidden md:block border-l-4 border-l-ai-purple"
          >
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap size={16} className="text-ai-purple" /> Sistema por capas
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
                { icon: <Globe size={20} />, title: "Web de captación", copy: "Página clara para que contactar sea fácil.", color: "text-ai-purple", bg: "bg-ai-purple/10", left: "0" },
                { icon: <BarChart2 size={20} />, title: "Seguimiento", copy: "Visibilidad sobre cada contacto y su avance.", color: "text-ai-blue", bg: "bg-ai-blue/10", left: "0.5rem" },
                { icon: <Calendar size={20} />, title: "Reservas online", copy: "Menos fricción al reservar, más tiempo.", color: "text-emerald-500", bg: "bg-emerald-500/10", left: "1rem" },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="M9 18l3-3-3-3"/></svg>, title: "Automatizaciones", copy: "Recordatorios y cobros sin distracciones.", color: "text-pink-500", bg: "bg-pink-500/10", left: "1.5rem" },
              ].map((layer, i) => (
                <motion.div 
                  key={i}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, x: parseInt(layer.left) - 5, backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.2)" }}
                  className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex items-start gap-4 transition-colors cursor-default relative origin-left"
                  style={{ left: layer.left }}
                >
                  <div className={`p-2.5 ${layer.bg} ${layer.color} rounded-lg shrink-0`}>{layer.icon}</div>
                  <div>
                    <h3 className="font-semibold text-white mb-0.5 text-[0.95rem]">{layer.title}</h3>
                    <p className="text-[0.82rem] pr-2 text-gray-400 leading-snug">{layer.copy}</p>
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
              Empieza por la base. Amplía sin rehacerlo todo.
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
