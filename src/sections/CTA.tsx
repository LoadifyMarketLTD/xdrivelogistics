import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Mail } from 'lucide-react';

interface CTAProps {
  onLoginClick: () => void;
}

export function CTA({ onLoginClick }: CTAProps) {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-700" />
      
      {/* Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Transport?
        </h2>
        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
          Join 2,500+ drivers and companies using XDrive Logistics 
          to optimise their transport operations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            onClick={onLoginClick}
            size="lg"
            className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8 py-6 text-lg group"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
            onClick={() => window.open('tel:07423272138')}
          >
            <Phone className="w-5 h-5 mr-2" />
            Call Now
          </Button>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-white/70">
          <a href="tel:07423272138" className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone className="w-4 h-4" />
            <span>07423 272138</span>
          </a>
          <span className="hidden sm:inline">|</span>
          <a href="mailto:xdrivelogisticsltd@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail className="w-4 h-4" />
            <span>xdrivelogisticsltd@gmail.com</span>
          </a>
        </div>

        {/* Trust Text */}
        <p className="mt-8 text-sm text-white/60">
          ✓ Free registration • ✓ No hidden fees • ✓ Cancel anytime
        </p>
      </div>
    </section>
  );
}
