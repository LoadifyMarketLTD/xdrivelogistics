import { Shield, Zap, Headphones, TrendingUp, Lock, Award } from 'lucide-react';

const benefits = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Full Verification',
    description: 'All drivers go through a rigorous verification process for documents and history.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Matching',
    description: 'Smart algorithm connecting drivers with the right loads in seconds.',
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: '24/7 Support',
    description: 'Our team is available around the clock for any issue or question.',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Grow Your Revenue',
    description: 'Drivers earn more through access to more loads and optimised routes.',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Secure Payments',
    description: 'Secure payment system with guarantee for both parties.',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Rating System',
    description: 'Full transparency through authentic reviews and ratings from real users.',
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
              Why XDrive?
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Benefits That Make a <span className="text-gradient">Difference</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We built the XDrive Logistics platform with a focus on the real needs of drivers 
              and transport companies. Here is what sets us apart:
            </p>

            {/* Highlight Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-3xl font-bold text-orange-500 mb-1">99%</p>
                <p className="text-sm text-muted-foreground">On-Time Deliveries</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-3xl font-bold text-orange-500 mb-1">4.8</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
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
                <h3 className="text-base font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
