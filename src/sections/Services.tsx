import { Truck, Building2, MapPin, Calendar, Shield, Clock } from 'lucide-react';

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
    color: 'from-orange-500 to-orange-600',
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
    color: 'from-blue-500 to-blue-600',
  },
];

const features = [
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'National Coverage',
    description: 'Present in all major UK cities',
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Flexible Scheduling',
    description: 'Choose when and where you want to work',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Guaranteed Security',
    description: 'All drivers are fully verified',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Fast Delivery',
    description: 'Average delivery time under 24 hours',
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Complete <span className="text-gradient">Transport Solutions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We offer services tailored for both independent drivers and transport companies 
            of any size.
          </p>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>
                
                <ul className="space-y-3">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✓</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-secondary/50 border border-border hover:border-orange-500/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all">
                {feature.icon}
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
