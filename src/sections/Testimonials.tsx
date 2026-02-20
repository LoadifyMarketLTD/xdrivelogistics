import { Star, CheckCircle } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';

const testimonials = [
  {
    name: 'Marian Popescu',
    role: 'Independent Driver',
    company: 'Self-Employed',
    initials: 'MP',
    avatarColor: '#2E7D32',
    rating: 5,
    verified: true,
    text: 'Since using XDrive Logistics, my income has grown by 40%. The platform is very intuitive and I find loads daily on my preferred route.',
  },
  {
    name: 'Sarah Johnson',
    role: 'Transport Manager',
    company: 'FastDelivery UK',
    initials: 'SJ',
    avatarColor: '#1F3A5F',
    rating: 5,
    verified: true,
    text: 'We reduced driver search time from days to hours. All drivers are verified and professional. Highly recommended for any logistics company!',
  },
  {
    name: 'Ion Dumitrescu',
    role: 'Fleet Owner',
    company: 'Dumi Transport Ltd',
    initials: 'ID',
    avatarColor: '#274C77',
    rating: 5,
    verified: true,
    text: 'I have 5 trucks in my fleet and XDrive has helped us optimise routes and reduce costs by 25%. Technical support is excellent.',
  },
  {
    name: 'Emma Williams',
    role: 'Operations Director',
    company: 'LogiCorp PLC',
    initials: 'EW',
    avatarColor: '#2E7D32',
    rating: 5,
    verified: true,
    text: 'The platform has transformed the way we manage transport. Real-time tracking and automatic invoicing save us hours every week.',
  },
  {
    name: 'David Clarke',
    role: 'HGV Driver',
    company: 'Independent',
    initials: 'DC',
    avatarColor: '#1F3A5F',
    rating: 5,
    verified: true,
    text: "Best platform for finding loads in the UK. The verification process gives me confidence that I'm working with legitimate companies.",
  },
  {
    name: 'Ana Mihalache',
    role: 'Logistics Coordinator',
    company: 'EuroFreight UK',
    initials: 'AM',
    avatarColor: '#274C77',
    rating: 5,
    verified: true,
    text: 'XDrive has become an essential tool for our business. The bidding system is transparent and the driver ratings are very accurate.',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative" style={{ backgroundColor: '#F4F6F8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <FadeIn className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: '#1F3A5F15', color: '#1F3A5F' }}>
            Testimonials
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-4" style={{ color: '#1F3A5F' }}>
            What Our{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #2E7D32, #4CAF50)' }}>
              Clients Say
            </span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Over 2,500 drivers and transport companies use XDrive Logistics daily.
          </p>
        </FadeIn>

        {/* Testimonials Grid – 2 rows × 3 columns */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <FadeIn key={index} delay={index * 80}>
              <div
                className="group flex flex-col p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 hover:-translate-y-1 transition-all duration-300 h-full"
                style={{ boxShadow: '0 2px 12px rgba(31,58,95,0.06)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 36px rgba(31,58,95,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(31,58,95,0.06)')}
              >
                {/* Rating */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-slate-600 leading-relaxed flex-1 mb-6 text-sm">
                  "{t.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md"
                    style={{ backgroundColor: t.avatarColor }}
                  >
                    {t.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm truncate" style={{ color: '#1F3A5F' }}>{t.name}</p>
                      {t.verified && (
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#2E7D32' }} />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{t.role}</p>
                    {/* Mini Company Badge */}
                    <div className="mt-1">
                      <span
                        className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${t.avatarColor}12`, color: t.avatarColor }}
                      >
                        {t.company}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Trust Badges */}
        <FadeIn className="mt-16">
          <div className="flex flex-wrap items-center justify-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1F3A5F12' }}>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#1F3A5F' }}>Trustpilot</p>
                <p className="text-xs text-slate-500">4.8/5 Rating</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#2E7D3212' }}>
                <CheckCircle className="w-5 h-5" style={{ color: '#2E7D32' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#1F3A5F' }}>Google Reviews</p>
                <p className="text-xs text-slate-500">4.9/5 Stars</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#274C7712' }}>
                <CheckCircle className="w-5 h-5" style={{ color: '#274C77' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#1F3A5F' }}>Transport UK</p>
                <p className="text-xs text-slate-500">Certified Partner</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
