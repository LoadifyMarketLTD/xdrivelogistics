import { Shield, Zap, Headphones, TrendingUp, Lock, Award } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';

const benefits = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Full Verification',
    description: 'All drivers go through a rigorous verification process for documents and history.',
    color: '#2E7D32',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Matching',
    description: 'Smart algorithm connecting drivers with the right loads in seconds.',
    color: '#1F3A5F',
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: '24/7 Support',
    description: 'Our team is available around the clock for any issue or question.',
    color: '#274C77',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Grow Your Revenue',
    description: 'Drivers earn more through access to more loads and optimised routes.',
    color: '#2E7D32',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Secure Payments',
    description: 'Secure payment system with guarantee for both parties.',
    color: '#1F3A5F',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Rating System',
    description: 'Full transparency through authentic reviews and ratings from real users.',
    color: '#274C77',
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="py-24 relative" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <FadeIn>
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
              style={{ backgroundColor: '#2E7D3215', color: '#2E7D32' }}>
              Why XDrive?
            </span>
            <h2 className="text-3xl lg:text-5xl font-extrabold mb-6" style={{ color: '#1F3A5F' }}>
              Benefits That Make a{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #2E7D32, #4CAF50)' }}>
                Difference
              </span>
            </h2>
            <p className="text-slate-500 text-lg mb-10">
              We built the XDrive Logistics platform with a focus on the real needs of drivers 
              and transport companies. Here is what sets us apart:
            </p>

            {/* Highlight Stats */}
            <div className="grid grid-cols-2 gap-5">
              <div
                className="p-6 rounded-2xl bg-white border border-slate-100"
                style={{ boxShadow: '0 4px 20px rgba(31,58,95,0.08)' }}
              >
                <p className="text-4xl font-extrabold mb-1" style={{ color: '#2E7D32' }}>99%</p>
                <p className="text-sm text-slate-500 font-medium">On-Time Deliveries</p>
              </div>
              <div
                className="p-6 rounded-2xl bg-white border border-slate-100"
                style={{ boxShadow: '0 4px 20px rgba(31,58,95,0.08)' }}
              >
                <p className="text-4xl font-extrabold mb-1" style={{ color: '#1F3A5F' }}>4.8★</p>
                <p className="text-sm text-slate-500 font-medium">Average Rating</p>
              </div>
            </div>
          </FadeIn>

          {/* Right Column - Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <FadeIn key={index} delay={index * 80}>
                <div
                  className="group p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 hover:-translate-y-1 transition-all duration-300 h-full shadow-sm hover:shadow-xl hover:shadow-slate-300/40"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${benefit.color}12`, color: benefit.color }}
                  >
                    {benefit.icon}
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#1F3A5F' }}>{benefit.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
