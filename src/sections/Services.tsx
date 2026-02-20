import { Truck, Building2, MapPin, Calendar, Shield, Clock } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';

const services = [
  {
    icon: <Truck className="w-8 h-8" />,
    title: 'For Drivers',
    description: 'Find verified loads across the UK. Guaranteed payment and flexible schedule.',
    features: [
      'Access to thousands of daily loads',
      'Payment within 24–48 hours',
      'GPS-optimised routes',
      '24/7 support',
    ],
    color: '#2E7D32',
    bg: '#2E7D3210',
  },
  {
    icon: <Building2 className="w-8 h-8" />,
    title: 'For Companies',
    description: 'Hire verified drivers quickly. Reduce costs and optimise deliveries.',
    features: [
      'Database of 2,500+ drivers',
      'Full document verification',
      'Real-time tracking',
      'Automatic invoicing',
    ],
    color: '#1F3A5F',
    bg: '#1F3A5F10',
  },
];

const features = [
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'National Coverage',
    description: 'Present in all major UK cities',
    color: '#2E7D32',
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Flexible Scheduling',
    description: 'Choose when and where you want to work',
    color: '#1F3A5F',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Guaranteed Security',
    description: 'All drivers are fully verified',
    color: '#2E7D32',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Fast Delivery',
    description: 'Average delivery time under 24 hours',
    color: '#1F3A5F',
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 relative" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeIn className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: '#1F3A5F15', color: '#1F3A5F' }}>
            Our Services
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-4" style={{ color: '#1F3A5F' }}>
            Complete{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #2E7D32, #4CAF50)' }}>
              Transport Solutions
            </span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            We offer services tailored for both independent drivers and transport companies of any size.
          </p>
        </FadeIn>

        {/* Main Services */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => (
            <FadeIn key={index} delay={index * 150}>
              <div
                className="group relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                style={{ boxShadow: '0 4px 24px rgba(31,58,95,0.06)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 16px 48px rgba(31,58,95,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(31,58,95,0.06)')}
              >
                {/* Gradient top accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${service.color}, ${service.color}80)` }}
                />

                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: service.bg, color: service.color }}
                >
                  {service.icon}
                </div>

                <h3 className="text-2xl font-bold mb-3" style={{ color: '#1F3A5F' }}>{service.title}</h3>
                <p className="text-slate-500 mb-6">{service.description}</p>

                <ul className="space-y-3">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3 text-sm">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: service.color }}
                      >
                        ✓
                      </span>
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <FadeIn key={index} delay={index * 100}>
              <div
                className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 hover:-translate-y-1 transition-all duration-300 group"
                style={{ boxShadow: '0 2px 12px rgba(31,58,95,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(31,58,95,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(31,58,95,0.05)')}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${feature.color}12`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h4 className="text-base font-bold mb-2" style={{ color: '#1F3A5F' }}>{feature.title}</h4>
                <p className="text-sm text-slate-500">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
