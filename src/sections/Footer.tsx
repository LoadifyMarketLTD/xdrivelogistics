import { Truck, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Shield, Lock, CheckCircle } from 'lucide-react';

const footerLinks = {
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Team', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
  ],
  services: [
    { label: 'For Drivers', href: '#services' },
    { label: 'For Companies', href: '#services' },
    { label: 'Pricing', href: '#' },
    { label: 'API Integration', href: '#' },
    { label: 'FAQ', href: '#' },
  ],
  legal: [
    { label: 'Terms & Conditions', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR Compliance', href: '#' },
    { label: 'Data Processing', href: '#' },
  ],
};

const contactItems = [
  {
    icon: <Phone className="w-4 h-4" />,
    label: '07423 272138',
    href: 'tel:07423272138',
    color: '#2E7D32',
  },
  {
    icon: <Mail className="w-4 h-4" />,
    label: 'xdrivelogisticsltd@gmail.com',
    href: 'mailto:xdrivelogisticsltd@gmail.com',
    color: '#1F3A5F',
  },
  {
    icon: <MapPin className="w-4 h-4" />,
    label: 'Unit 1, Furthergate Industrial Estate, Blackburn BB1 3BD',
    href: null,
    color: '#274C77',
  },
];

const socialLinks = [
  { icon: <Facebook className="w-4 h-4" />, href: '#', label: 'Facebook' },
  { icon: <Twitter className="w-4 h-4" />, href: '#', label: 'Twitter' },
  { icon: <Linkedin className="w-4 h-4" />, href: '#', label: 'LinkedIn' },
  { icon: <Instagram className="w-4 h-4" />, href: '#', label: 'Instagram' },
];

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#1F3A5F' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Grid – 4 columns + brand */}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column (2 cols) */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold leading-tight">XDrive</span>
                <span className="text-xs text-white/50 leading-tight">Logistics LTD</span>
              </div>
            </a>
            <p className="text-white/60 text-sm mb-6 leading-relaxed max-w-xs">
              The UK's leading B2B logistics marketplace. Connecting verified drivers 
              with trusted carriers since 2021.
            </p>

            {/* Contact */}
            <div className="space-y-3 mb-8">
              {contactItems.map((item, i) =>
                item.href ? (
                  <a key={i} href={item.href}
                    className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                    <span className="mt-0.5 flex-shrink-0 opacity-70 group-hover:opacity-100" style={{ color: item.color }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <div key={i} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="mt-0.5 flex-shrink-0 opacity-70" style={{ color: item.color }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                )
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#2E7D32] flex items-center justify-center text-white/60 hover:text-white transition-all duration-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold mb-5 uppercase tracking-wider text-white/40">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <a href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors hover:translate-x-0.5 inline-block duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold mb-5 uppercase tracking-wider text-white/40">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, i) => (
                <li key={i}>
                  <a href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors hover:translate-x-0.5 inline-block duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold mb-5 uppercase tracking-wider text-white/40">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <a href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors hover:translate-x-0.5 inline-block duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust + Payment Strip */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/8 border border-white/10">
                <Shield className="w-4 h-4 text-[#4CAF50]" />
                <span className="text-xs text-white/70 font-medium">FCA Registered</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/8 border border-white/10">
                <Lock className="w-4 h-4 text-[#4CAF50]" />
                <span className="text-xs text-white/70 font-medium">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/8 border border-white/10">
                <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                <span className="text-xs text-white/70 font-medium">GDPR Compliant</span>
              </div>
            </div>

            {/* Payment logos (text-based) */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 font-medium mr-1">Payments secured by</span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-white/10 text-xs font-bold text-white/70">STRIPE</span>
                <span className="px-2.5 py-1 rounded bg-white/10 text-xs font-bold text-white/70">VISA</span>
                <span className="px-2.5 py-1 rounded bg-white/10 text-xs font-bold text-white/70">MASTERCARD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar – Company info */}
        <div className="py-5 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40">
              © 2021–{new Date().getFullYear()} XDrive Logistics Ltd. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
              <span>Registered in England & Wales</span>
              <span className="text-white/20">|</span>
              <span className="font-semibold text-white/60">Company No: 13185532</span>
              <span className="text-white/20">|</span>
              <span>VAT: GB372319642</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
