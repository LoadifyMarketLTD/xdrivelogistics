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
            Gata să Transformi Transportul?
          </h2>
          <p style={{
            fontSize: '1.125rem',
            opacity: 0.9,
            maxWidth: '700px',
            margin: '0 auto 2rem',
            lineHeight: '1.6',
          }}>
            Alătură-te celor 2,500+ de șoferi și companii care folosesc XDrive Logistics pentru a-și optimiza afacerile de transport.
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
              Creează Cont Gratuit
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
              Sună Acum
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
            ✓ Înregistrare gratuită • ✓ Fără comisioane ascunse • ✓ Anulare oricând
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
                Platforma #1 de logistică în UK care conectează șoferi verificați cu transportatori de încredere.
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
              <h4 style={{
                fontWeight: '600',
                fontSize: '0.9375rem',
                color: 'var(--text)',
                marginBottom: '1rem',
              }}>
                Companie
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                {['Despre Noi', 'Echipa', 'Cariere', 'Blog'].map((item) => (
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

            {/* Servicii */}
            <div>
              <h4 style={{
                fontWeight: '600',
                fontSize: '0.9375rem',
                color: 'var(--text)',
                marginBottom: '1rem',
              }}>
                Servicii
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                {['Pentru Șoferi', 'Pentru Companii', 'Tarife', 'FAQ'].map((item) => (
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
              <h4 style={{
                fontWeight: '600',
                fontSize: '0.9375rem',
                color: 'var(--text)',
                marginBottom: '1rem',
              }}>
                Legal
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                {['Termeni și Condiții', 'Politica de Confidențialitate', 'Politica Cookie', 'GDPR'].map((item) => (
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
              © {currentYear} XDrive Logistics Ltd. Toate drepturile rezervate.
            </p>
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--muted-2)',
            }}>
              XDrive Logistics Ltd. | Înregistrată în Anglia și Țara Galilor | Company Number: 13171804 | VAT: GB375949535 | Adresă: 101 Cornelian Street Blackburn BB1 9QL
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
