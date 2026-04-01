import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { Check, Loader2, RefreshCw } from 'lucide-react';

export function DiagnosticOffer() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <section id="diagnostico" className="py-16 md:py-24 px-6 md:px-12 lg:px-24 border-t border-white/5 md:border-t-0">
      <div className="max-w-6xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Solicita un diagnóstico gratuito
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl">
            Cuéntame cómo entra hoy un cliente y te diré por dónde empezaría.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-12 lg:gap-24 relative">
          
          {/* Left info block */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <motion.div 
              variants={listVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-6 mb-12"
            >
              {[
                "Revisión rápida de tu sistema actual",
                "Detección de bloqueos",
                "Recomendación clara de por dónde empezar",
                "Sin presión comercial"
              ].map((text, i) => (
                <motion.div key={i} variants={itemVariants} className="flex items-center gap-4 text-gray-300">
                  <div className="p-1 rounded bg-white/5 shrink-0"><Check size={16} className="text-ai-purple" /></div>
                  {text}
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="border-t border-white/5 pt-8"
            >
              <ol className="relative border-s border-white/10 ml-3">
                {[
                  "Revisamos tu caso",
                  "Te decimos qué montaría primero",
                  "Tú decides si tiene sentido avanzar"
                ].map((step, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.2 }}
                    className={`ms-8 ${i === 2 ? '' : 'mb-8'}`}
                  >
                    <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -ms-[33px] bg-[#0a0a0b] border border-white/20 text-xs font-bold text-gray-400">{i + 1}</span>
                    <h3 className="font-semibold text-white mb-1 transition-colors hover:text-ai-purple cursor-default">{step}</h3>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          </div>

          {/* Right form block */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.8, delay: 0.2 }}
            className="md:col-span-7"
          >
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl overflow-hidden relative min-h-[500px] flex items-center justify-center">
              
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center justify-center text-center py-12 px-6 w-full"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                      <Check size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Solicitud recibida</h3>
                    <p className="text-gray-400 mb-8 max-w-sm">
                      Gracias. Revisaré tu caso y te responderé en un día laborable.
                    </p>
                    <Button onClick={() => setStatus('idle')} className="bg-[#0a0a0b]/80 border border-white/10 text-white hover:border-ai-purple/50 shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)] flex gap-2 w-full sm:w-auto">
                      <RefreshCw size={18} /> Enviar otra solicitud
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-6 w-full"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-300">Nombre</label>
                        <input 
                          required id="name" type="text" placeholder="Tu nombre" 
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-ai-purple focus:ring-1 focus:ring-ai-purple transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                        <input 
                          required id="email" type="email" placeholder="tu@email.com" 
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-ai-purple focus:ring-1 focus:ring-ai-purple transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm font-medium text-gray-300">Empresa</label>
                      <input 
                        required id="company" type="text" placeholder="Nombre de tu empresa" 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-ai-purple focus:ring-1 focus:ring-ai-purple transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-gray-300">¿Qué está fallando ahora mismo en tu captación o seguimiento?</label>
                      <textarea 
                        required id="message" rows={4} placeholder="Cuéntame qué está fallando o dónde se está perdiendo tiempo" 
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-ai-purple focus:ring-1 focus:ring-ai-purple transition-colors resize-none"
                      ></textarea>
                    </div>

                    {status === 'error' && (
                      <div className="p-4 rounded bg-red-500/10 text-red-400 text-sm">
                        Ha ocurrido un error. Vuelve a intentarlo en unos segundos.
                      </div>
                    )}

                    <div className="pt-2 transition-transform active:scale-[0.98]">
                      <Button 
                        type="submit" 
                        disabled={status === 'loading'}
                        className="w-full bg-[#0a0a0b]/80 text-white backdrop-blur-xl border border-white/10 hover:border-ai-purple/50 shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)] transition-all duration-300 transform hover:scale-[1.02] active:scale-95 group font-medium"
                      >
                        {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Solicitar diagnóstico gratuito'}
                      </Button>
                      <p className="text-center text-xs text-gray-500 mt-4">
                        Nada de spam. Solo lo usaremos para responder a tu solicitud.
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
