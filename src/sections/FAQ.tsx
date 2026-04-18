import { motion } from 'framer-motion';

export function FAQ() {
  const faqs = [
    {
      q: '¿Tengo que montar todo desde el principio?',
      a: 'No. Muchas veces lo más lógico es empezar por la web de captación y añadir lo demás cuando el negocio lo pide.'
    },
    {
      q: '¿Puedo empezar solo por la web?',
      a: 'Sí. Es la base más lógica si ahora mismo lo que necesitas es mejorar cómo entran los contactos.'
    },
    {
      q: '¿Y si ya tengo web o CRM?',
      a: 'Se revisa. Si algo de lo que ya tienes sirve, se aprovecha. La idea no es rehacer por rehacer.'
    },
    {
      q: '¿Esto sirve para cualquier tipo de negocio?',
      a: 'Sí. Encaja en negocios que necesitan captar mejor, hacer seguimiento y reducir el caos manual en su operativa comercial.'
    },
    {
      q: '¿Cuánto tarda en estar listo?',
      a: 'Depende del alcance. Una web de captación simple no requiere el mismo tiempo que un sistema completo. Eso se define en el diagnóstico.'
    },
    {
      q: '¿Qué incluye el mantenimiento mensual?',
      a: 'Incluye soporte, seguridad, copias, mantenimiento del sistema y pequeños cambios para que todo siga funcionando sin fricciones.'
    },
    {
      q: '¿El diagnóstico es una venta encubierta?',
      a: 'No. El objetivo es decirte qué tiene sentido montar ahora y qué no.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="faq" className="py-16 md:py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="section-kicker text-center md:text-left">FAQ</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 text-center md:text-left tracking-[-0.035em]">
            Preguntas frecuentes
          </h2>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col"
        >
          {faqs.map((faq, index) => (
            <motion.details
              key={index} 
              variants={itemVariants}
              className="group border-t border-white/10 first:border-none py-6"
            >
              <summary className="flex items-center justify-between cursor-pointer py-2 list-none [&::-webkit-details-marker]:hidden marker:hidden focus:outline-none outline-none">
                <h3 className="text-lg text-white font-medium group-hover:text-ai-purple transition-colors duration-200 pr-8">
                  {faq.q}
                </h3>
              </summary>
              <div className="pt-4 pb-2 pr-8 text-white/70 leading-relaxed text-[1.05rem]">
                <p>{faq.a}</p>
              </div>
            </motion.details>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
