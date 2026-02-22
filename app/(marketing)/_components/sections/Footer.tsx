import PrimaryButton from '../ui/PrimaryButton'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer>
      {/* CTA Section */}
      <div style={{
        background: 'var(--brand)',
        color: '#fff',
        paddingTop: '4rem',
        paddingBottom: '4rem',
      }}>
        <div style={{
          maxWidth: '1280px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: '1rem',
          }}>
            Ready to Transform Your Transport?
          </h2>
          <p style={{
            fontSize: '1.125rem',
            opacity: 0.9,
            maxWidth: '700px',
            margin: '0 auto 2rem',
            lineHeight: '1.6',
          }}>
            Join 2,500+ drivers and companies using XDrive Logistics to optimise their transport operations.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}>
            <a
              href="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 2rem',
                borderRadius: 'var(--r-md)',
                fontWeight: '600',
                fontSize: '1rem',
                background: '#fff',
                color: 'var(--brand)',
                textDecoration: 'none',
                border: 'none',
              }}
            >
              Create Free Account
            </a>
            <a
              href="tel:07423272138"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 2rem',
                borderRadius: 'var(--r-md)',
                fontWeight: '600',
                fontSize: '1rem',
                background: 'transparent',
                color: '#fff',
                textDecoration: 'none',
                border: '2px solid #fff',
              }}
            >
              Call Now
            </a>
          </div>
          <div style={{
            fontSize: '1rem',
            opacity: 0.9,
          }}>
            📞 07423 272138 | ✉️ xdrivelogisticsltd@gmail.com
          </div>
          <div style={{
            fontSize: '0.875rem',
            opacity: 0.75,
            marginTop: '1rem',
          }}>
            ✓ Free registration • ✓ No hidden fees • ✓ Cancel anytime
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        paddingTop: '3rem',
        paddingBottom: '3rem',
      }}>
        <div style={{
          maxWidth: '1280px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}>
            {/* Company Info */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'var(--brand)',
                  borderRadius: 'var(--r-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '1.25rem',
                }}>
                  X
                </div>
                <div style={{
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  color: 'var(--text)',
                }}>
                  XDrive Logistics
                </div>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--muted)',
                lineHeight: '1.6',
                marginBottom: '1rem',
              }}>
                The #1 logistics platform in the UK connecting verified drivers with trusted carriers.
              </p>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text)',
              }}>
                <div>📞 07423 272138</div>
                <div>✉️ xdrivelogisticsltd@gmail.com</div>
                <div>📍 Blackburn, Lancashire, UK</div>
              </div>
            </div>

            {/* Companie */}
            <div>
              <h3 style={{
                fontWeight: '600',
                fontSize: '0.9375rem',
                color: 'var(--text)',
                marginBottom: '1rem',
              }}>
                Company
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                {['About Us', 'Team', 'Careers', 'Blog'].map((item) => (
                  <li key={item} style={{ marginBottom: '0.5rem' }}>
                    <a href="#" style={{
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                    }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 style={{
                fontWeight: '600',
                fontSize: '0.9375rem',
                color: 'var(--text)',
                marginBottom: '1rem',
              }}>
                Services
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                {['For Drivers', 'For Companies', 'Pricing', 'FAQ'].map((item) => (
                  <li key={item} style={{ marginBottom: '0.5rem' }}>
                    <a href="#" style={{
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                    }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 style={{
                fontWeight: '600',
                fontSize: '0.9375rem',
                color: 'var(--text)',
                marginBottom: '1rem',
              }}>
                Legal
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                {[
                    { label: 'Terms & Conditions', href: '/terms' },
                    { label: 'Privacy Policy', href: '/privacy' },
                    { label: 'Cookie Policy', href: '/cookies' },
                  ].map(({ label, href }) => (
                  <li key={label} style={{ marginBottom: '0.5rem' }}>
                    <a href={href} style={{
                      color: 'var(--muted)',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                    }}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '2rem',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--muted)',
              marginBottom: '0.5rem',
            }}>
              © 2021 – {currentYear} XDrive Logistics Ltd. All rights reserved.
            </p>
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--muted-2)',
            }}>
              XDrive Logistics Ltd. | Registered in England and Wales | Company Number: 13171804 | VAT: GB375949535 | Address: 101 Cornelian Street Blackburn BB1 9QL
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
