import { motion } from 'framer-motion';
import { Layers, Globe, Route, CalendarCheck, Zap, Plus } from 'lucide-react';

export function SystemLayers() {
  const layers = [
    {
      icon: <Globe className="text-ai-purple" size={32} />,
      title: 'Web de captación',
      text: 'Página clara para que el cliente contacte fácil y tu equipo reciba mejor cada oportunidad.',
      color: 'bg-ai-purple/10 border-ai-purple/20'
    },
    {
      icon: <Route className="text-ai-blue" size={32} />,
      title: 'Seguimiento de oportunidades',
      text: 'Visibilidad sobre cada contacto, su estado y el siguiente paso.',
      color: 'bg-ai-blue/10 border-ai-blue/20'
    },
    {
      icon: <CalendarCheck className="text-emerald-500" size={32} />,
      title: 'Reservas online',
      text: 'Menos fricción al reservar, más tiempo para el equipo.',
      color: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      icon: <Zap className="text-pink-500" size={32} />,
      title: 'Automatizaciones',
      text: 'Recordatorios y tareas repetitivas que dejan de depender del equipo.',
      color: 'bg-pink-500/10 border-pink-500/20'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, bounce: 0.2, duration: 0.8 } }
  };

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 border-t border-white/5 md:border-t-0">
      <div className="max-w-6xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8"
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 flex items-center gap-4">
              <Layers className="text-gray-400" size={36} />
              Empieza por la base. Amplía cuando de verdad tenga sentido.
            </h2>
            <p className="text-lg text-gray-400">
              Montamos primero lo que más impacto tiene. Lo demás se añade cuando el negocio lo necesita.
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-6 relative">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="md:col-span-8 flex flex-col gap-6"
          >
            {layers.map((layer, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-6 card-b2b p-6"
              >
                <div className={`p-4 rounded-xl ${layer.color} shrink-0`}>
                  {layer.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{layer.title}</h3>
                  <p className="text-gray-400">{layer.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: 'spring', bounce: 0, duration: 1, delay: 0.6 }}
            className="md:col-span-4 mt-8 md:mt-24 md:-ml-8 relative z-10"
          >
            <motion.div 
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
              className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-2xl p-8 backdrop-blur-xl h-full shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Ampliaciones cuando tenga sentido</h3>
                <Plus className="text-gray-500" />
              </div>
              <ul className="space-y-6">
                {['Emails automáticos', 'Pagos online', 'SEO / GEO / AEO'].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="flex items-center gap-4 text-gray-300"
                  >
                    <span className="w-2 h-2 rounded-full bg-ai-blue/50"></span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
