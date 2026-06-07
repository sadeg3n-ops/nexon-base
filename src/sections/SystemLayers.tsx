import { motion } from 'framer-motion';
import { Layers, Globe, Route, CalendarCheck, Zap, Plus, TrendingUp } from 'lucide-react';
import { useLanguage } from '../lib/language';

export function SystemLayers() {
  const { copy } = useLanguage();
  const layers = [
    {
      icon: <Globe className="text-ai-purple" size={32} />,
      title: copy.systemLayers.layers[0].title,
      text: copy.systemLayers.layers[0].text,
      color: 'bg-ai-purple/10 border-ai-purple/20',
      hoverBorder: 'hover:border-ai-purple/30 hover:shadow-[0_0_25px_-12px_rgba(124,58,237,0.25)]'
    },
    {
      icon: <Route className="text-ai-blue" size={32} />,
      title: copy.systemLayers.layers[1].title,
      text: copy.systemLayers.layers[1].text,
      color: 'bg-ai-blue/10 border-ai-blue/20',
      hoverBorder: 'hover:border-ai-blue/30 hover:shadow-[0_0_25px_-12px_rgba(37,99,235,0.25)]'
    },
    {
      icon: <CalendarCheck className="text-emerald-500" size={32} />,
      title: copy.systemLayers.layers[2].title,
      text: copy.systemLayers.layers[2].text,
      color: 'bg-emerald-500/10 border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-500/30 hover:shadow-[0_0_25px_-12px_rgba(16,185,129,0.25)]'
    },
    {
      icon: <TrendingUp className="text-amber-500" size={32} />,
      title: copy.systemLayers.layers[3].title,
      text: copy.systemLayers.layers[3].text,
      color: 'bg-amber-500/10 border-amber-500/20',
      hoverBorder: 'hover:border-amber-500/30 hover:shadow-[0_0_25px_-12px_rgba(245,158,11,0.25)]'
    },
    {
      icon: <Zap className="text-pink-500" size={32} />,
      title: copy.systemLayers.layers[4].title,
      text: copy.systemLayers.layers[4].text,
      color: 'bg-pink-500/10 border-pink-500/20',
      hoverBorder: 'hover:border-pink-500/30 hover:shadow-[0_0_25px_-12px_rgba(236,72,153,0.25)]'
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
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6 flex items-center gap-4 tracking-tight">
              <Layers className="text-gray-400" size={36} />
              {copy.systemLayers.title}
            </h2>
            <p className="font-sans text-lg text-gray-400">
              {copy.systemLayers.description}
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
                whileHover={{ scale: 1.015, backgroundColor: "rgba(255,255,255,0.04)" }}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white/[0.01] border border-white/[0.04] p-6 rounded-2xl transition-all duration-300 cursor-default ${layer.hoverBorder}`}
              >
                <div className={`p-4 rounded-xl ${layer.color} shrink-0`}>
                  {layer.icon}
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold text-white mb-2">{layer.title}</h3>
                  <p className="font-sans text-gray-400 leading-relaxed text-sm sm:text-base">{layer.text}</p>
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
              whileHover={{ y: -4, boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.6)", borderColor: "rgba(255, 255, 255, 0.15)" }}
              className="bg-gradient-to-br from-white/[0.04] via-white/[0.01] to-transparent border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl h-full shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <h3 className="text-lg font-display font-semibold text-white">{copy.systemLayers.addOnsTitle}</h3>
                <Plus className="text-gray-500" />
              </div>
              <ul className="space-y-6 font-sans">
                {copy.systemLayers.addOns.map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="flex items-center gap-4 text-gray-300 text-sm sm:text-base"
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
