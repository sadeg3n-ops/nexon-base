import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Section } from '../components/Section';
import { Award, Zap, Building2 } from 'lucide-react';

export function Credibility() {
  const { ref, isVisible } = useScrollAnimation();

  const stats = [
    {
      icon: Award,
      number: '8+',
      label: 'Years Building Systems'
    },
    {
      icon: Zap,
      number: '200+',
      label: 'Automations in Production'
    },
    {
      icon: Building2,
      number: '15+',
      label: 'Industries Served'
    }
  ];

  return (
    <Section className="bg-neutral-900">
      <div
        ref={ref}
        className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Proven Experience Across Industries
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We've built automation systems for businesses of all sizes—from startups to enterprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center">
                  <stat.icon className="text-white" size={32} />
                </div>
              </div>
              <div className="text-5xl font-bold text-white">{stat.number}</div>
              <div className="text-lg text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-neutral-800 flex items-center justify-center"
            >
              <div className="text-gray-600 font-semibold text-sm">CLIENT LOGO</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
