import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Section } from '../components/Section';
import { MessageCircle, FileText, Lightbulb, ThumbsUp } from 'lucide-react';

export function WhatHappensNext() {
  const { ref, isVisible } = useScrollAnimation();

  const steps = [
    {
      icon: MessageCircle,
      title: 'Intro Call',
      description: 'A brief conversation to understand your business and current challenges. No pressure, just questions.'
    },
    {
      icon: FileText,
      title: 'Workflow Review',
      description: 'We examine your processes, tools, and pain points. This is where we identify opportunities.'
    },
    {
      icon: Lightbulb,
      title: 'Clear Recommendations',
      description: 'You receive a straightforward breakdown of what can be automated and the expected impact.'
    },
    {
      icon: ThumbsUp,
      title: 'You Decide',
      description: 'No sales pitch. If it makes sense to work together, great. If not, you still gained clarity.'
    }
  ];

  return (
    <Section>
      <div
        ref={ref}
        className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
          What Happens Next
        </h2>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-neutral-800 hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="text-2xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    <step.icon className="text-black" size={32} />
                  </div>
                </div>

                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
