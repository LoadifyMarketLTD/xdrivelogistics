import { Truck, Building2, MapPin, Calendar, Shield, Clock } from 'lucide-react';

const services = [
  {
    icon: <Truck className="w-8 h-8" />,
    title: 'Pentru Șoferi',
    description: 'Găsești încărcături verificate în toată UK. Plată garantată și program flexibil.',
    features: [
      'Acces la mii de încărcături zilnice',
      'Plată în 24-48 ore',
      'Rute optimizate GPS',
      'Suport 24/7',
    ],
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: <Building2 className="w-8 h-8" />,
    title: 'Pentru Companii',
    description: 'Angajezi șoferi verificați rapid. Reduci costurile și optimizezi livrările.',
    features: [
      'Bază de date cu 2500+ șoferi',
      'Verificare completă documente',
      'Tracking în timp real',
      'Facturare automată',
    ],
    color: 'from-blue-500 to-blue-600',
  },
];

const features = [
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Acoperire Națională',
    description: 'Prezent în toate orașele importante din UK',
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Programare Flexibilă',
    description: 'Alege când și unde vrei să lucrezi',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Securitate Garantată',
    description: 'Toți șoferii sunt verificați complet',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Livrare Rapidă',
    description: 'Timp mediu de livrare sub 24h',
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
            Serviciile Noastre
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Soluții Complete de <span className="text-gradient">Transport</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Oferim servicii adaptate atât pentru șoferi independenți, cât și pentru companii 
            de transport de orice dimensiune.
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
