import { Truck, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const footerLinks = {
  company: [
    { label: 'Despre Noi', href: '#' },
    { label: 'Echipa', href: '#' },
    { label: 'Cariere', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  services: [
    { label: 'Pentru Șoferi', href: '#services' },
    { label: 'Pentru Companii', href: '#services' },
    { label: 'Tarife', href: '#' },
    { label: 'FAQ', href: '#' },
  ],
  legal: [
    { label: 'Termeni și Condiții', href: '#' },
    { label: 'Politica de Confidențialitate', href: '#' },
    { label: 'Politica Cookie', href: '#' },
    { label: 'GDPR', href: '#' },
  ],
};

const socialLinks = [
  { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook' },
  { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
  { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
  { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram' },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-tight">XDrive</span>
                <span className="text-xs text-muted-foreground leading-tight">Logistics</span>
              </div>
            </a>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Platforma #1 de logistică în UK care conectează șoferi verificați 
              cu transportatori de încredere.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:07423272138" className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-orange-500" />
                <span>07423 272138</span>
              </a>
              <a href="mailto:contact@xdrivelogistics.co.uk" className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-orange-500" />
                <span>contact@xdrivelogistics.co.uk</span>
              </a>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>Blackburn, Lancashire, UK</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-white font-semibold mb-4">Companie</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-muted-foreground hover:text-white transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Servicii</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-muted-foreground hover:text-white transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-muted-foreground hover:text-white transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} XDrive Logistics Ltd. Toate drepturile rezervate.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:bg-orange-500 hover:text-white transition-all"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            XDrive Logistics Ltd. | Înregistrată în Anglia și Țara Galilor | Company Number: 13185532 |
            VAT: GB372319642 | Adresă: Unit 1, Furthergate Industrial Estate, Blackburn BB1 3BD
          </p>
        </div>
      </div>
    </footer>
  );
}
