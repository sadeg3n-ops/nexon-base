import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Check } from 'lucide-react';
import { useLanguage } from '../lib/language';

export function Pricing() {
  const { copy } = useLanguage();
  const packs = copy.pricing.packs.map((pack, index) => ({
    ...pack,
    highlight: index === 1,
  }));

  const scrollToAudit = () => {
    document.getElementById('diagnostico')?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, bounce: 0.2, duration: 0.8 } }
  };

  const secondaryBlockVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, bounce: 0, duration: 0.8, delay: 0.6 } }
  };

  return (
    <section id="sistemas" className="py-16 md:py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {copy.pricing.title}
          </h2>
          <p className="text-lg text-gray-400">
            {copy.pricing.description}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-8 items-stretch mb-12"
        >
          {packs.map((pack, index) => (
            <motion.div 
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`flex flex-col rounded-3xl p-8 relative overflow-hidden ${
                pack.highlight 
                  ? 'bg-gradient-to-b from-ai-purple/10 to-transparent border-2 border-ai-purple shadow-[0_0_30px_rgba(124,58,237,0.15)] md:-mt-4 md:mb-4 z-10' 
                  : 'bg-white/[0.02] border border-white/5 backdrop-blur-md'
              }`}
            >
              {pack.highlight && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-ai-blue/10 rounded-full filter blur-[40px]"></div>
              )}
              <h3 className="text-xl font-bold text-white mb-4 relative z-10">{pack.name}</h3>
              <p className="text-gray-400 mb-8 relative z-10">{pack.text}</p>
              
              <ul className="space-y-4 mb-8 relative z-10 flex-grow">
                {pack.includes.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <Check size={18} className={pack.highlight ? "text-ai-purple shrink-0" : "text-gray-500 shrink-0"} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={scrollToAudit}
                className={`w-full py-3 relative z-10 transition-transform active:scale-95 duration-300 font-medium ${
                  pack.highlight
                    ? 'bg-[#0a0a0b]/80 border border-white/10 text-white hover:border-ai-purple/50 shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)]'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {copy.pricing.availability}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-gray-500 text-sm font-medium mb-16 pb-8 border-b border-white/5"
        >
          {copy.pricing.note}
        </motion.div>

        {/* Secondary Block */}
        <motion.div 
          variants={secondaryBlockVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-12 bg-white/[0.01] border border-white/5 rounded-2xl p-8 md:p-12 backdrop-blur-sm"
        >
          {/* Column 1: Modules */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">{copy.pricing.modulesTitle}</h3>
            <ul className="space-y-4">
              {copy.pricing.modules.slice(0, 4).map((mod, i) => (
                <li key={i} className="flex justify-between border-b border-white/5 pb-2 transition-colors hover:border-white/20">
                  <span className="text-gray-300">{mod}</span>
                  <span className="text-gray-500 font-medium text-sm">{copy.pricing.askUs}</span>
                </li>
              ))}
              <li className="flex justify-between transition-colors hover:text-white">
                <span className="text-gray-300">{copy.pricing.modules[4]}</span>
                <span className="text-gray-500 font-medium text-sm">{copy.pricing.askUs}</span>
              </li>
            </ul>
          </div>

          {/* Column 2: Maintenance */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">{copy.pricing.maintenanceTitle}</h3>
            <p className="text-gray-400 text-sm mb-6">
              {copy.pricing.maintenanceDescription}
            </p>
            <ul className="space-y-3">
              {copy.pricing.maintenanceFeatures.map((feature, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-ai-purple/50 mt-2 absolute w-1.5 h-1.5 rounded-full animate-pulse transition-all"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-ai-blue mt-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
