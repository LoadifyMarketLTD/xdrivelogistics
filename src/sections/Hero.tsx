import { Button } from '@/components/ui/button';
import { ArrowRight, Star, TrendingUp, Package, CheckCircle } from 'lucide-react';

interface HeroProps {
  onLoginClick: () => void;
}

export function Hero({ onLoginClick: _onLoginClick }: HeroProps) {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F4F6F8 0%, #ffffff 60%, #EEF2F7 100%)',
      }}
    >
      {/* Subtle decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-30 bg-[#1F3A5F]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 bg-[#2E7D32]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-16 items-center">

          {/* ── LEFT: 60% ── */}
          <div className="text-left">

            {/* Label */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-8"
              style={{ backgroundColor: '#1F3A5F10', borderColor: '#1F3A5F25', color: '#1F3A5F' }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2E7D32]" />
              </span>
              <span className="text-sm font-semibold tracking-wide">UK Transport Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight" style={{ color: '#1C1C1C' }}>
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #1F3A5F 0%, #274C77 100%)' }}
              >
                XDrive Logistics Ltd
              </span>
              <br />
              <span className="text-4xl sm:text-5xl lg:text-5xl font-bold" style={{ color: '#1C1C1C' }}>
                The Smart Logistics Network
              </span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-4xl font-semibold" style={{ color: '#2E7D32' }}>
                for Drivers & Companies
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl mb-10 max-w-lg leading-relaxed" style={{ color: '#1C1C1C', opacity: 0.7 }}>
              One platform. Verified carriers. Secure loads. Real revenue growth.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                asChild
                size="lg"
                className="bg-[#2E7D32] hover:bg-[#256127] text-white font-bold px-10 py-6 text-lg rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 group"
              >
                <a href="/register">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-[#1F3A5F] text-[#1F3A5F] hover:bg-[#1F3A5F] hover:text-white px-10 py-6 text-lg rounded-xl font-semibold transition-all duration-300"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Platform
              </Button>
            </div>

            {/* Trust Chips */}
            <div className="flex flex-wrap gap-3">
              {['Free registration', 'No hidden fees', 'Cancel anytime', 'FCA Registered'].map((chip) => (
                <div key={chip} className="flex items-center gap-2 rounded-full px-4 py-2 border"
                  style={{ backgroundColor: '#ffffff', borderColor: '#1F3A5F20' }}>
                  <CheckCircle className="w-4 h-4" style={{ color: '#2E7D32' }} />
                  <span className="text-sm font-medium" style={{ color: '#1C1C1C' }}>{chip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: 40% – Live Dashboard Mockup ── */}
          <div className="relative hidden lg:flex flex-col gap-4">

            {/* Card 1 – Active Load */}
            <div className="bg-white rounded-2xl p-5 shadow-xl shadow-slate-200/60 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#1F3A5F', opacity: 0.6 }}>Active Load</p>
                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#2E7D32' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
                  In Transit
                </span>
              </div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#1C1C1C' }}>Manchester → London</p>
                  <p className="text-sm mt-0.5" style={{ color: '#1C1C1C', opacity: 0.5 }}>Est. arrival: 14:30 • 215 mi</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#2E7D3215' }}>
                  <Package className="w-5 h-5" style={{ color: '#2E7D32' }} />
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: '#1C1C1C', opacity: 0.4 }}>
                  <span>Progress</span><span>74%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F4F6F8' }}>
                  <div className="h-full rounded-full" style={{ width: '74%', background: 'linear-gradient(90deg, #2E7D32, #4CAF50)' }} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                {[['£340', 'Budget'], ['12t', 'Cargo'], ['3', 'Bids']].map(([val, lbl], i) => (
                  <div key={i} className="flex-1 rounded-lg p-2.5 text-center" style={{ backgroundColor: '#F4F6F8' }}>
                    <p className="text-lg font-bold" style={{ color: i === 2 ? '#2E7D32' : '#1F3A5F' }}>{val}</p>
                    <p className="text-xs" style={{ color: '#1C1C1C', opacity: 0.5 }}>{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 – Driver Card */}
            <div className="bg-white rounded-2xl p-5 ml-6 shadow-xl shadow-slate-200/60 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1F3A5F] to-[#274C77] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    JD
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#2E7D32] border-2 border-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold" style={{ color: '#1C1C1C' }}>John Davies</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#2E7D3220', color: '#2E7D32' }}>Verified ✓</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs ml-1" style={{ color: '#1C1C1C', opacity: 0.5 }}>4.9 (127 trips)</span>
                  </div>
                  <p className="text-xs mt-1 font-medium" style={{ color: '#2E7D32' }}>● Available Now • Manchester area</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#1C1C1C', opacity: 0.5 }}>HGV Class 1</p>
                  <p className="text-xs mt-0.5" style={{ color: '#1C1C1C', opacity: 0.5 }}>7 yrs exp.</p>
                </div>
              </div>
            </div>

            {/* Card 3 – Stats Mini */}
            <div className="bg-white rounded-2xl p-5 -ml-3 shadow-xl shadow-slate-200/60 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#1C1C1C', opacity: 0.5 }}>Platform Today</p>
                  <p className="text-2xl font-bold" style={{ color: '#1F3A5F' }}>50,000+</p>
                  <p className="text-sm" style={{ color: '#1C1C1C', opacity: 0.6 }}>Completed Deliveries</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-2">
                    <TrendingUp className="w-4 h-4" style={{ color: '#2E7D32' }} />
                    <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>+12% this week</span>
                  </div>
                  <div className="flex -space-x-2">
                    {['#2E7D32', '#1F3A5F', '#274C77', '#388E3C'].map((color, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                        style={{ backgroundColor: color }}>
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
        <span className="text-xs font-medium tracking-wider uppercase" style={{ color: '#1F3A5F' }}>Scroll</span>
        <div className="w-5 h-8 border-2 rounded-full flex items-start justify-center p-1" style={{ borderColor: '#1F3A5F40' }}>
          <div className="w-1 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#1F3A5F60' }} />
        </div>
      </div>
    </section>
  );
}
