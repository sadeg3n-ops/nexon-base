import { motion } from 'framer-motion';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Detectamos dónde se rompe',
      text: 'Revisamos captación, seguimiento y puntos de fricción reales.'
    },
    {
      num: '02',
      title: 'Priorizamos impacto',
      text: 'Empezamos por lo que más mejora orden, respuesta y conversión.'
    },
    {
      num: '03',
      title: 'Construimos lo necesario',
      text: 'Diseñamos la web y los módulos que sí tienen sentido.'
    },
    {
      num: '04',
      title: 'Lanzamos y ampliamos',
      text: 'Empiezas por lo esencial y amplías sin rehacerlo todo.'
    }
  ];

  return (
    <section id="metodo" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Cómo trabajamos
          </h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.3, type: "spring" }}
            className="h-1 bg-highlight rounded-full bg-gradient-to-r from-ai-blue to-ai-purple"
          ></motion.div>
        </motion.div>

        <div className="relative pl-8 md:pl-0">
          {/* Vertical Line Desktop */}
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 bottom-0 left-[31px] md:left-1/2 md:-ml-px w-px bg-white/10 hidden md:block"
          ></motion.div>

          <div className="space-y-12 md:space-y-0 relative z-10">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                className={`flex flex-col md:flex-row items-start md:items-center relative ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Connector Dot */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  whileHover={{ scale: 1.3 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="hidden md:flex absolute left-1/2 -ml-3 w-6 h-6 rounded-full border-4 border-[#0a0a0b] bg-ai-blue shadow-[0_0_15px_rgba(37,99,235,0.5)] z-20 cursor-default"
                ></motion.div>

                {/* Content Block */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className={`md:w-1/2 p-6 md:p-8 transition-transform ${
                    index % 2 === 0 ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'
                  }`}
                >
                  <motion.span 
                    initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-ai-purple/50 font-bold text-5xl md:text-6xl tracking-tighter block mb-4"
                  >
                    {step.num}
                  </motion.span>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-lg">
                    {step.text}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
