import { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Section } from '../components/Section';
import { Button } from '../components/Button';
import { CheckCircle2 } from 'lucide-react';

export function AuditOffer() {
  const { ref, isVisible } = useScrollAnimation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Form submission would happen here. This is a demo form.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const benefits = [
    'Review of your current workflows and systems',
    'Identification of automation opportunities',
    'Clear recommendations on next steps',
    'No obligation—valuable insights regardless of whether we work together'
  ];

  return (
    <Section id="audit" className="bg-neutral-900">
      <div
        ref={ref}
        className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get a Free Automation Audit
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We'll review your workflows, identify bottlenecks, and show you exactly where automation can save time and money.
            No sales pitch. Just clear, actionable insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-white mb-6">What You'll Get:</h3>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300 text-lg">
                  <CheckCircle2 className="text-green-400 flex-shrink-0 mt-1" size={24} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-6 bg-neutral-800 rounded-lg border border-neutral-700">
              <p className="text-gray-300 leading-relaxed">
                This audit is designed to give you clarity on your automation potential.
                Even if we never work together, you'll walk away with a better understanding
                of where your business can improve.
              </p>
            </div>
          </div>

          <div className="bg-black p-8 rounded-lg border border-neutral-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Tell us about your biggest operational bottleneck
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white resize-none"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Request Your Free Audit
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Section>
  );
}
