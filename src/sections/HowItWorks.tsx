import { UserPlus, Search, CheckCircle, Truck, ClipboardList, CreditCard } from 'lucide-react';

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

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Simple and <span className="text-gradient">Efficient</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our platform connects drivers and carriers in just a few simple steps.
          </p>
        </div>

        {/* Driver Steps */}
        <div className="mb-20">
          <h3 className="text-xl font-semibold text-white mb-8 text-center">
            For <span className="text-orange-500">Drivers</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {driverSteps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connector Line */}
                {index < driverSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-orange-500/50 to-transparent" />
                )}
                
                <div className="p-6 rounded-xl bg-card border border-border hover:border-orange-500/50 transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                      {step.icon}
                    </div>
                    <span aria-hidden="true" className="text-4xl font-bold text-white/10">{step.step}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Steps */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-8 text-center">
            For <span className="text-blue-500">Companies</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companySteps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connector Line */}
                {index < companySteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent" />
                )}
                
                <div className="p-6 rounded-xl bg-card border border-border hover:border-blue-500/50 transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                      {step.icon}
                    </div>
                    <span aria-hidden="true" className="text-4xl font-bold text-white/10">{step.step}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
