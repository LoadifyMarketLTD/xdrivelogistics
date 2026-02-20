import { X, Check } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';

export function WhyXDrive() {
  return (
    <section className="py-24 relative" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: '#1F3A5F15', color: '#1F3A5F' }}
          >
            Our Difference
          </span>
          <h2
            className="text-3xl lg:text-4xl font-extrabold mb-4"
            style={{ color: '#1F3A5F' }}
          >
            Why XDrive is Different
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            See how we compare to traditional load boards.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Traditional Load Boards */}
          <FadeIn delay={0}>
            <div className="h-full p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#ef444415' }}
                >
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#1C1C1C' }}>
                  Traditional Load Boards
                </h3>
              </div>
              <ul className="space-y-4">
                {['Slow communication', 'Unverified carriers', 'Payment risks'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#ef444415' }}
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </span>
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* XDrive */}
          <FadeIn delay={150}>
            <div
              className="h-full p-8 rounded-2xl border shadow-xl"
              style={{ backgroundColor: '#F4F6F8', borderColor: '#2E7D3230' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#2E7D3220' }}
                >
                  <Check className="w-5 h-5" style={{ color: '#2E7D32' }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#1F3A5F' }}>
                  XDrive
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Verified network',
                  'Smart matching',
                  'Secure payment structure',
                  'Performance scoring',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs text-white font-bold"
                      style={{ backgroundColor: '#2E7D32' }}
                    >
                      ✓
                    </span>
                    <span className="font-medium" style={{ color: '#1C1C1C' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
