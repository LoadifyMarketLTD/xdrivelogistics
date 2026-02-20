import { FadeIn } from '@/components/FadeIn';

const liveStats = [
  { value: '1247', label: 'Loads active now', color: '#2E7D32' },
  { value: '287', label: 'Drivers online', color: '#1F3A5F' },
  { value: '54', label: 'Brokers posting today', color: '#274C77' },
];

export function LiveProof() {
  return (
    <section className="py-10" style={{ backgroundColor: '#F4F6F8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {liveStats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 100}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                      style={{ backgroundColor: stat.color }} />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ backgroundColor: stat.color }} />
                  </span>
                  <span className="text-3xl font-extrabold" style={{ color: stat.color }}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: '#1C1C1C', opacity: 0.7 }}>{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
