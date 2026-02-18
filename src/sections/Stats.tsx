import { useEffect, useState, useRef } from 'react';
import { Users, Package, Route, Star } from 'lucide-react';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  delay: number;
}

function StatItem({ icon, value, suffix, label, delay }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timeout = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
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
    <div ref={ref} className="text-center group">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500/10 text-orange-500 mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
        {count.toLocaleString()}
        <span className="text-orange-500">{suffix}</span>
      </div>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

export function Stats() {
  const stats = [
    {
      icon: <Users className="w-7 h-7" />,
      value: 2500,
      suffix: '+',
      label: 'Șoferi Verificați',
      delay: 0,
    },
    {
      icon: <Package className="w-7 h-7" />,
      value: 50000,
      suffix: '+',
      label: 'Livrări Complete',
      delay: 100,
    },
    {
      icon: <Route className="w-7 h-7" />,
      value: 1500,
      suffix: '+',
      label: 'Rute Zilnice',
      delay: 200,
    },
    {
      icon: <Star className="w-7 h-7" />,
      value: 48,
      suffix: '/5',
      label: 'Rating Mediu',
      delay: 300,
    },
  ];

  return (
    <section className="py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
