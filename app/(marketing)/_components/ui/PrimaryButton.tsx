import { ReactNode, CSSProperties } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  style?: CSSProperties;
}

export function PrimaryButton({ children, onClick, href, variant = 'primary', size = 'md', style }: PrimaryButtonProps) {
  const baseStyles: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: size === 'lg' ? '1rem 2rem' : '0.875rem 1.75rem',
    fontSize: size === 'lg' ? '1.1rem' : '1rem',
    fontWeight: 600,
    borderRadius: '10px', border: 'none', cursor: 'pointer',
    transition: 'all 0.3s ease', textDecoration: 'none', ...style,
  };
  const variantStyles: CSSProperties = variant === 'primary'
    ? { backgroundColor: '#D4AF37', color: '#0A2239' }
    : { backgroundColor: 'transparent', color: '#FFFFFF', border: '2px solid rgba(255,255,255,0.4)' };
  const cs = { ...baseStyles, ...variantStyles };
  const handleHover = (e: React.MouseEvent<HTMLElement>) => {
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = '#b8962e';
      e.currentTarget.style.transform = 'translateY(-2px)';
    } else {
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    }
  };
  const handleLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = '#D4AF37';
      e.currentTarget.style.transform = 'translateY(0)';
    } else {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };
  if (href) {
    return <a href={href} style={cs} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{children}</a>;
  }
  return <button onClick={onClick} style={cs} onMouseEnter={handleHover} onMouseLeave={handleLeave}>{children}</button>;
}
