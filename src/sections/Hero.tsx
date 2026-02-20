import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, MapPin, Star, TrendingUp, CheckCircle, Package } from 'lucide-react';

interface HeroProps {
  onLoginClick: () => void;
}

export function Hero({ onLoginClick }: HeroProps) {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1F3A5F 0%, #274C77 60%, #F4F6F8 100%)',
      }}
    >
      {/* Subtle Grid Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 bg-[#274C77]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-30 bg-[#F4F6F8]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-16 items-center">

          {/* ── LEFT: 60% ── */}
          <div className="text-left">

            {/* Live Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4CAF50] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4CAF50]" />
              </span>
              <span className="text-sm text-white font-semibold tracking-wide">
                1,247 Loads Active Right Now
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
              The UK's
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)' }}
              >
                #1 Logistics
              </span>
              <br />
              Platform
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white/75 mb-10 max-w-lg leading-relaxed">
              Connect verified drivers with trusted carriers. Post loads, bid instantly,
              track in real-time — all in one professional platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                onClick={onLoginClick}
                size="lg"
                className="bg-[#2E7D32] hover:bg-[#256127] text-white font-bold px-10 py-6 text-lg rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-10 py-6 text-lg rounded-xl font-semibold backdrop-blur-sm transition-all duration-300"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-5">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2">
                <Shield className="w-4 h-4 text-[#4CAF50]" />
                <span className="text-sm text-white font-medium">Verified Drivers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2">
                <Clock className="w-4 h-4 text-[#81C784]" />
                <span className="text-sm text-white font-medium">Available 24/7</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2">
                <MapPin className="w-4 h-4 text-[#4CAF50]" />
                <span className="text-sm text-white font-medium">UK-Wide Coverage</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-[#81C784]" />
                <span className="text-sm text-white font-medium">FCA Registered</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: 40% – Live Dashboard Mockup ── */}
          <div className="relative hidden lg:flex flex-col gap-4">

            {/* Card 1 – Active Load */}
            <div className="glass rounded-2xl p-5 glow-navy">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Active Load</p>
                <span className="flex items-center gap-1 text-xs text-[#4CAF50] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
                  In Transit
                </span>
              </div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-white">Manchester → London</p>
                  <p className="text-sm text-white/60 mt-0.5">Est. arrival: 14:30 • 215 mi</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#4CAF50]" />
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-white/50 mb-1.5">
                  <span>Progress</span><span>74%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: '74%', background: 'linear-gradient(90deg, #2E7D32, #4CAF50)' }}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <div className="flex-1 bg-white/5 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-white">£340</p>
                  <p className="text-xs text-white/50">Budget</p>
                </div>
                <div className="flex-1 bg-white/5 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-white">12t</p>
                  <p className="text-xs text-white/50">Cargo</p>
                </div>
                <div className="flex-1 bg-white/5 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-[#4CAF50]">3</p>
                  <p className="text-xs text-white/50">Bids</p>
                </div>
              </div>
            </div>

            {/* Card 2 – Driver Card */}
            <div className="glass rounded-2xl p-5 ml-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    JD
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#4CAF50] border-2 border-[#274C77]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold">John Davies</p>
                    <span className="text-xs bg-[#2E7D32]/30 text-[#81C784] px-2 py-0.5 rounded-full font-medium">Verified ✓</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-white/60 ml-1">4.9 (127 trips)</span>
                  </div>
                  <p className="text-xs text-[#4CAF50] mt-1 font-medium">● Available Now • Manchester area</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50">HGV Class 1</p>
                  <p className="text-xs text-white/50 mt-0.5">7 yrs exp.</p>
                </div>
              </div>
            </div>

            {/* Card 3 – Stats Mini */}
            <div className="glass rounded-2xl p-5 -ml-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Platform Today</p>
                  <p className="text-2xl font-bold text-white">50,000+</p>
                  <p className="text-sm text-white/60">Completed Deliveries</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-2">
                    <TrendingUp className="w-4 h-4 text-[#4CAF50]" />
                    <span className="text-sm font-semibold text-[#4CAF50]">+12% this week</span>
                  </div>
                  <div className="flex -space-x-2">
                    {['#2E7D32', '#1F3A5F', '#274C77', '#388E3C'].map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-[#274C77] flex items-center justify-center text-xs text-white font-medium"
                        style={{ backgroundColor: color }}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-60">
        <span className="text-xs text-white/60 font-medium tracking-wider uppercase">Scroll</span>
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
