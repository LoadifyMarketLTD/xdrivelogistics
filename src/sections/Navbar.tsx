import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Truck, Phone } from 'lucide-react';

interface NavbarProps {
  onLoginClick: () => void;
}

export function Navbar({ onLoginClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#services', label: 'Services' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#benefits', label: 'Benefits' },
    { href: '#testimonials', label: 'Testimonials' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md shadow-slate-200/60 border-b border-slate-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1F3A5F] to-[#274C77] flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#1F3A5F]/30 transition-all">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-lg font-bold leading-tight transition-colors duration-300 ${isScrolled ? 'text-[#1F3A5F]' : 'text-white'}`}>
                XDrive
              </span>
              <span className={`text-xs leading-tight transition-colors duration-300 ${isScrolled ? 'text-slate-500' : 'text-white/60'}`}>
                Logistics
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors relative group ${
                  isScrolled ? 'text-slate-600 hover:text-[#1F3A5F]' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2E7D32] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:07423272138"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isScrolled ? 'text-slate-600 hover:text-[#1F3A5F]' : 'text-white/80 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              07423 272138
            </a>
            <Button
              onClick={onLoginClick}
              className="bg-[#2E7D32] hover:bg-[#256127] text-white font-semibold px-6 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 transition-colors ${isScrolled ? 'text-[#1F3A5F]' : 'text-white'}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden py-4 border-t ${isScrolled ? 'border-slate-100 bg-white' : 'border-white/10 bg-[#1F3A5F]/95 backdrop-blur-md'}`}>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 text-sm font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-[#1F3A5F]' : 'text-white/80 hover:text-white'}`}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="tel:07423272138"
                className={`flex items-center gap-2 py-2 text-sm ${isScrolled ? 'text-slate-600' : 'text-white/80'}`}
              >
                <Phone className="w-4 h-4" />
                07423 272138
              </a>
              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLoginClick();
                }}
                className="bg-[#2E7D32] hover:bg-[#256127] text-white w-full"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
