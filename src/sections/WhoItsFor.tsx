import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useLanguage } from '../lib/language';

export function WhoItsFor() {
  const { copy } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, bounce: 0, duration: 0.8 } }
  };

  const rightItemVariants = {
    hidden: { opacity: 0, x: 10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, bounce: 0, duration: 0.8 } }
  };

  return (
    <section id="sistema" className="py-16 md:py-24 px-6 md:px-12 lg:px-24 border-t border-white/5 md:border-t-0">
      <div className="max-w-6xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {copy.whoItsFor.title}
          </h2>
          <p className="text-lg text-gray-400">
            {copy.whoItsFor.description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 relative">
          <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white/5 hidden md:block"></div>

          {/* Left Block */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            transition={{ duration: 0.8 }}
            className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-8 md:p-10 transition-colors"
          >
            <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Check size={18} />
              </span>
              {copy.whoItsFor.positiveTitle}
            </h3>
            <motion.ul 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-6"
            >
              {copy.whoItsFor.positive.map((item, i) => (
                <motion.li key={i} variants={itemVariants} className="flex gap-4 text-gray-300">
                  <Check size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right Block */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/[0.01] border border-red-500/10 backdrop-blur-md rounded-2xl p-8 md:p-10 transition-colors"
          >
            <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-3 opacity-90">
              <span className="w-8 h-8 rounded bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                <X size={18} />
              </span>
              {copy.whoItsFor.negativeTitle}
            </h3>
            <motion.ul 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-6 opacity-80"
            >
              {copy.whoItsFor.negative.map((item, i) => (
                <motion.li key={i} variants={rightItemVariants} className="flex gap-4 text-gray-400">
                  <X size={20} className="text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
