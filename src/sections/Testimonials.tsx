import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Marian Popescu',
    role: 'Șofer Independent',
    image: 'MP',
    rating: 5,
    text: 'De când folosesc XDrive Logistics, veniturile mele au crescut cu 40%. Platforma este foarte intuitivă și găsesc încărcături zilnic pe ruta mea preferată.',
  },
  {
    name: 'Sarah Johnson',
    role: 'Manager Transport, FastDelivery UK',
    image: 'SJ',
    rating: 5,
    text: 'Am redus timpul de căutare a șoferilor de la zile la ore. Toți șoferii sunt verificați și profesioniști. Recomand cu încredere!',
  },
  {
    name: 'Ion Dumitrescu',
    role: 'Proprietar Flotă',
    image: 'ID',
    rating: 5,
    text: 'Am 5 camioane în flotă și XDrive ne-a ajutat să optimizăm rutele și să reducem costurile cu 25%. Suportul tehnic este excelent.',
  },
  {
    name: 'Emma Williams',
    role: 'Director Operațiuni, LogiCorp',
    image: 'EW',
    rating: 5,
    text: 'Platforma ne-a transformat modul în care gestionăm transportul. Tracking în timp real și facturare automată ne salvează ore întregi.',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
            Testimoniale
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Ce Spun <span className="text-gradient">Clienții Noștri</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Peste 2,500 de șoferi și companii de transport folosesc XDrive Logistics zilnic.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-orange-500/30 transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Quote className="w-5 h-5 text-orange-500" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted-foreground mb-6 leading-relaxed">{testimonial.text}</p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.image}
                </div>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-50">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">Trustpilot</p>
            <p className="text-sm text-muted-foreground">4.8/5 Rating</p>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">Google</p>
            <p className="text-sm text-muted-foreground">4.9/5 Reviews</p>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">Transport UK</p>
            <p className="text-sm text-muted-foreground">Certified Partner</p>
          </div>
        </div>
      </div>
    </section>
  );
}
