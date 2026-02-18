import { Shield, Zap, Headphones, TrendingUp, Lock, Award } from 'lucide-react';

const benefits = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Verificare Completă',
    description: 'Toți șoferii trec prin un proces riguros de verificare a documentelor și istoricului.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Matching Instant',
    description: 'Algoritm inteligent care conectează șoferii cu încărcăturile potrivite în câteva secunde.',
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: 'Suport 24/7',
    description: 'Echipa noastră este disponibilă non-stop pentru orice problemă sau întrebare.',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Crește Veniturile',
    description: 'Șoferii câștigă mai mult prin acces la mai multe încărcături și rute optimizate.',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Plăți Securizate',
    description: 'Sistem de plată sigur cu garanție pentru ambele părți.',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Sistem de Rating',
    description: 'Transparență totală prin recenzii și rating-uri autentice de la utilizatori reali.',
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
              De Ce XDrive?
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Beneficii care fac <span className="text-gradient">Diferența</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Am construit platforma XDrive Logistics cu focus pe nevoile reale ale șoferilor 
              și companiilor de transport. Iată ce ne diferențiază:
            </p>

            {/* Highlight Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-3xl font-bold text-orange-500 mb-1">99%</p>
                <p className="text-sm text-muted-foreground">Livrări la Timp</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-3xl font-bold text-orange-500 mb-1">4.8</p>
                <p className="text-sm text-muted-foreground">Rating Mediu</p>
              </div>
            </div>
          </div>

          {/* Right Column - Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group p-5 rounded-xl bg-card border border-border hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  {benefit.icon}
                </div>
                <h4 className="text-base font-semibold text-white mb-2">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
