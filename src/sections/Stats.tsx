import { useEffect, useState, useRef } from 'react';
import { Users, Package, Route, Star, TrendingUp, Clock } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';

interface KpiBlockProps {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
  delay: number;
  color: string;
}

function KpiBlock({ icon, value, suffix, label, sublabel, delay, color }: KpiBlockProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timeout = setTimeout(() => {
      const duration = 2200;
      const steps = 70;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [isVisible, value, delay]);

  return (
    <div ref={ref} className="group text-center p-8 rounded-2xl bg-white border border-slate-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/60">
      {/* Icon */}
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>

      {/* Giant Number */}
      <div className="text-[64px] font-extrabold leading-none mb-1" style={{ color: '#1F3A5F' }}>
        {count.toLocaleString()}
        <span style={{ color }}>{suffix}</span>
      </div>

      {/* Animated Underline */}
      <div className="flex justify-center mb-3">
        <div
          className="h-1 rounded-full transition-all duration-700"
          style={{
            width: isVisible ? '48px' : '0px',
            backgroundColor: color,
            transitionDelay: `${delay + 400}ms`,
          }}
        />
      </div>

      {/* Label */}
      <p className="text-base font-semibold text-[#1F3A5F] mb-1">{label}</p>
      <p className="text-sm text-slate-500">{sublabel}</p>
    </div>
  );
}

export function Stats() {
  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: 2500,
      suffix: '+',
      label: 'Verified Drivers',
      sublabel: 'Active on the platform',
      delay: 0,
      color: '#2E7D32',
    },
    {
      icon: <Package className="w-6 h-6" />,
      value: 50000,
      suffix: '+',
      label: 'Completed Deliveries',
      sublabel: 'Across the UK',
      delay: 120,
      color: '#1F3A5F',
    },
    {
      icon: <Route className="w-6 h-6" />,
      value: 1500,
      suffix: '+',
      label: 'Daily Routes',
      sublabel: 'Matched every day',
      delay: 240,
      color: '#274C77',
    },
    {
      icon: <Star className="w-6 h-6" />,
      value: 48,
      suffix: '/5',
      label: 'Average Rating',
      sublabel: 'From 12,000+ reviews',
      delay: 360,
      color: '#F59E0B',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      value: 99,
      suffix: '%',
      label: 'On-Time Deliveries',
      sublabel: 'Industry-leading rate',
      delay: 480,
      color: '#2E7D32',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      value: 24,
      suffix: 'h',
      label: 'Payment Time',
      sublabel: 'Average payout speed',
      delay: 600,
      color: '#1F3A5F',
    },
  ];

  return (
    <section className="py-20 relative" style={{ backgroundColor: '#F4F6F8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeIn className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: '#1F3A5F15', color: '#1F3A5F' }}>
            By the Numbers
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-3" style={{ color: '#1F3A5F' }}>
            Trusted by Thousands Across the UK
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Our numbers speak for themselves — real results, real businesses, real drivers.
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {stats.map((stat, index) => (
            <KpiBlock key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
