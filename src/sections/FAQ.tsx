import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../lib/language';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { copy } = useLanguage();
  const faqs = copy.faq.items;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="faq" className="py-16 md:py-24 px-6 md:px-12 lg:px-24 border-t border-white/5 md:border-t-0">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {copy.faq.title}
          </h2>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className={`border transition-colors duration-300 rounded-xl overflow-hidden ${
                openIndex === index 
                  ? 'bg-white/5 border-ai-purple/30' 
                  : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
              }`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className={`font-medium text-lg pr-8 transition-colors ${openIndex === index ? 'text-white' : 'text-gray-300'}`}>
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="shrink-0"
                >
                  <ChevronDown className={openIndex === index ? 'text-ai-purple' : 'text-gray-500'} />
                </motion.div>
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden px-6"
                  >
                    <div className="pb-5 text-gray-400">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
