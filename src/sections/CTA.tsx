import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Mail, Shield, Lock, CheckCircle } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';

interface CTAProps {
  onLoginClick: () => void;
}

export function CTA({ onLoginClick }: CTAProps) {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1F3A5F 0%, #274C77 100%)' }}>
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Glow */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#2E7D32]/20 rounded-full blur-[80px]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <FadeIn className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4CAF50] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4CAF50]" />
            </span>
            <span className="text-sm text-white font-medium">Join 2,500+ active businesses</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to Transform
            <br />
            Your Transport?
          </h2>
          <p className="text-white/75 text-lg mb-10 max-w-2xl mx-auto">
            Join the UK's leading logistics platform and connect with verified drivers 
            and trusted carriers instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={onLoginClick}
              size="lg"
              className="bg-[#2E7D32] hover:bg-[#256127] text-white font-bold px-10 py-6 text-lg rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 group"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-10 py-6 text-lg rounded-xl font-semibold backdrop-blur-sm"
              onClick={() => window.open('tel:07423272138')}
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Us Now
            </Button>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/60 mb-10">
            <a href="tel:07423272138" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              <span>07423 272138</span>
            </a>
            <span className="hidden sm:inline text-white/30">|</span>
            <a href="mailto:xdrivelogisticsltd@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
              <span>xdrivelogisticsltd@gmail.com</span>
            </a>
          </div>

          {/* Trust Strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
              <span>Free registration</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#4CAF50]" />
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#4CAF50]" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
              <span>FCA Registered</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
