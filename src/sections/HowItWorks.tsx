import { UserPlus, Search, CheckCircle, Truck, ClipboardList, CreditCard } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';

const driverSteps = [
  {
    icon: <UserPlus className="w-6 h-6" />,
    step: '01',
    title: 'Create Account',
    description: 'Register for free and complete your profile with the required documents.',
  },
  {
    icon: <Search className="w-6 h-6" />,
    step: '02',
    title: 'Find Loads',
    description: 'Search for available loads on your route and apply instantly.',
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    step: '03',
    title: 'Confirm and Deliver',
    description: 'Receive confirmation, pick up the goods and deliver to destination.',
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    step: '04',
    title: 'Receive Payment',
    description: 'Funds arrive in your account within 24–48 hours after delivery.',
  },
];

const companySteps = [
  {
    icon: <UserPlus className="w-6 h-6" />,
    step: '01',
    title: 'Register Your Company',
    description: 'Create a business account and add your company details.',
  },
  {
    icon: <ClipboardList className="w-6 h-6" />,
    step: '02',
    title: 'Post a Load',
    description: 'Add transport details and your available budget.',
  },
  {
    icon: <Truck className="w-6 h-6" />,
    step: '03',
    title: 'Choose a Driver',
    description: 'Receive bids and select the right driver.',
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    step: '04',
    title: 'Track Delivery',
    description: 'Real-time tracking and destination confirmation.',
  },
];

interface StepCardProps {
  step: typeof driverSteps[0];
  index: number;
  total: number;
  accentColor: string;
  lightBg: string;
}

function StepCard({ step, index, total, accentColor, lightBg }: StepCardProps) {
  return (
    <FadeIn delay={index * 120} className="relative">
      {/* Connector */}
      {index < total - 1 && (
        <div
          className="hidden lg:block absolute top-8 left-[calc(100%-12px)] w-[calc(100%-24px)] h-0.5 z-0"
          style={{ background: `linear-gradient(90deg, ${accentColor}60, transparent)` }}
        />
      )}
      <div
        className="relative z-10 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 hover:-translate-y-1 transition-all duration-300 group h-full"
        style={{ boxShadow: '0 2px 12px rgba(31,58,95,0.06)' }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 12px 32px ${accentColor}20`)}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(31,58,95,0.06)')}
      >
        <div className="flex items-center justify-between mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: lightBg, color: accentColor }}
          >
            {step.icon}
          </div>
          <span className="text-5xl font-extrabold" style={{ color: `${accentColor}18` }}>{step.step}</span>
        </div>
        <h4 className="text-base font-bold mb-2" style={{ color: '#1F3A5F' }}>{step.title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
      </div>
    </FadeIn>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative" style={{ backgroundColor: '#F4F6F8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeIn className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: '#2E7D3215', color: '#2E7D32' }}>
            How It Works
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-4" style={{ color: '#1F3A5F' }}>
            Simple and{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #2E7D32, #4CAF50)' }}>
              Efficient
            </span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Our platform connects drivers and carriers in just a few simple steps.
          </p>
        </FadeIn>

        {/* Driver Steps */}
        <div className="mb-20">
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2E7D3220' }}>
                <Truck className="w-4 h-4" style={{ color: '#2E7D32' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: '#1F3A5F' }}>
                For <span style={{ color: '#2E7D32' }}>Drivers</span>
              </h3>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {driverSteps.map((step, index) => (
              <StepCard
                key={index}
                step={step}
                index={index}
                total={driverSteps.length}
                accentColor="#2E7D32"
                lightBg="#2E7D3212"
              />
            ))}
          </div>
        </div>

        {/* Company Steps */}
        <div>
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1F3A5F20' }}>
                <ClipboardList className="w-4 h-4" style={{ color: '#1F3A5F' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: '#1F3A5F' }}>
                For <span style={{ color: '#274C77' }}>Companies</span>
              </h3>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {companySteps.map((step, index) => (
              <StepCard
                key={index}
                step={step}
                index={index}
                total={companySteps.length}
                accentColor="#274C77"
                lightBg="#274C7712"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
